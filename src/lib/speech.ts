/*
 * Moteur de lecture à voix haute, basé sur l'API Web Speech du navigateur
 * (window.speechSynthesis). Aucun serveur, aucun fichier audio : la voix est
 * celle de l'appareil de l'étudiant.
 *
 * Singleton exposé via un hook useSpeech() (même patron que lib/progress.ts).
 * On lit morceau par morceau (un bloc de prose à la fois) : c'est robuste
 * entre navigateurs et ça permet de surligner le passage en cours.
 *
 * L'étudiant peut choisir une voix féminine ou masculine : on sélectionne la
 * meilleure voix française du genre demandé (heuristique sur le nom), avec un
 * repli propre si l'appareil n'en propose qu'une.
 */
import { useSyncExternalStore } from "react";
import type { SpeechChunk } from "@/lib/speechText";

export type SpeechStatus = "idle" | "playing" | "paused";
export type VoiceGender = "female" | "male";

export interface SpeechState {
  status: SpeechStatus;
  /** identifiant de l'instance ReadAloud active (pour n'activer qu'un bouton) */
  activeId: string | null;
  index: number;
  total: number;
  rate: number;
  voiceGender: VoiceGender;
}

const synth: SpeechSynthesis | null =
  typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

export const speechSupported = Boolean(synth);

const GENDER_KEY = "eco-voice-gender";

function loadGender(): VoiceGender {
  if (typeof window === "undefined") return "female";
  try {
    return window.localStorage.getItem(GENDER_KEY) === "male" ? "male" : "female";
  } catch {
    return "female";
  }
}

let state: SpeechState = {
  status: "idle",
  activeId: null,
  index: 0,
  total: 0,
  rate: 1,
  voiceGender: loadGender(),
};
let chunks: SpeechChunk[] = [];
let highlighted: HTMLElement | null = null;
let token = 0; // jeton anti-callbacks périmés (annulations, changements de voix)
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function setState(patch: Partial<SpeechState>) {
  state = { ...state, ...patch };
  emit();
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function getSnapshot() {
  return state;
}

export function useSpeech(): SpeechState {
  return useSyncExternalStore(subscribe, getSnapshot, () => state);
}

/* ------------------------------------------------------------------ */
/* Sélection de la voix française par genre                            */
/* ------------------------------------------------------------------ */

// Heuristiques sur les noms de voix (macOS, Windows, Chrome, Android…).
const FEMALE_RE =
  /amélie|amelie|aurélie|aurelie|audrey|julie|hortense|virginie|marie|léa|\blea\b|chantal|sabine|céline|celine|élise|elise|charlotte|manon|alice|jolie|google|female|femme|woman/i;
const MALE_RE =
  /thomas|paul|claude|nicolas|henri|mathieu|matthieu|guillaume|daniel|pierre|jacques|antoine|male|homme|\bman\b/i;

let frVoices: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (!synth) return;
  frVoices = synth.getVoices().filter((v) => /^fr(-|_|$)/i.test(v.lang));
}

/** Meilleures voix pour un genre : celles qui matchent, sinon les « neutres ». */
function voicesForGender(gender: VoiceGender): SpeechSynthesisVoice[] {
  const wanted = gender === "female" ? FEMALE_RE : MALE_RE;
  const other = gender === "female" ? MALE_RE : FEMALE_RE;
  const matches = frVoices.filter((v) => wanted.test(v.name));
  if (matches.length) return matches;
  const neutral = frVoices.filter((v) => !other.test(v.name));
  return neutral.length ? neutral : frVoices;
}

function currentVoice(): SpeechSynthesisVoice | null {
  const list = voicesForGender(state.voiceGender);
  return list[0] ?? frVoices[0] ?? null;
}

/** Genres réellement disponibles sur l'appareil (pour l'UI). */
export function availableGenders(): { female: boolean; male: boolean } {
  return {
    female: frVoices.some((v) => FEMALE_RE.test(v.name)),
    male: frVoices.some((v) => MALE_RE.test(v.name)),
  };
}

if (synth) {
  refreshVoices();
  // La liste des voix arrive de façon asynchrone sur certains navigateurs.
  synth.addEventListener?.("voiceschanged", refreshVoices);
}

/* ------------------------------------------------------------------ */
/* Surlignage                                                          */
/* ------------------------------------------------------------------ */

function clearHighlight() {
  if (highlighted) {
    highlighted.removeAttribute("data-speaking");
    highlighted = null;
  }
}

function highlight(el: HTMLElement | null) {
  clearHighlight();
  if (el) {
    el.setAttribute("data-speaking", "true");
    try {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch {
      /* environnements sans scrollIntoView : sans effet */
    }
    highlighted = el;
  }
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

function speakFrom(i: number, myToken: number) {
  if (!synth || myToken !== token) return;
  if (i >= chunks.length) {
    stop();
    return;
  }
  setState({ index: i });
  highlight(chunks[i].el ?? null);

  const utter = new SpeechSynthesisUtterance(chunks[i].text);
  utter.lang = "fr-FR";
  utter.rate = state.rate;
  const voice = currentVoice();
  if (voice) utter.voice = voice;
  utter.onend = () => {
    if (myToken === token && state.status === "playing") speakFrom(i + 1, myToken);
  };
  utter.onerror = () => {
    if (myToken === token && state.status === "playing") speakFrom(i + 1, myToken);
  };
  synth.speak(utter);
}

/** Démarre la lecture d'une liste de morceaux pour l'instance `id`. */
export function play(id: string, newChunks: SpeechChunk[]) {
  if (!synth) return;
  token += 1;
  synth.cancel();
  refreshVoices();
  chunks = newChunks.filter((c) => c.text.trim().length > 0);
  if (chunks.length === 0) return;
  setState({ status: "playing", activeId: id, index: 0, total: chunks.length });
  speakFrom(0, token);
}

export function pause() {
  if (!synth) return;
  synth.pause();
  setState({ status: "paused" });
}

export function resume() {
  if (!synth) return;
  synth.resume();
  setState({ status: "playing" });
}

export function stop() {
  token += 1;
  if (synth) synth.cancel();
  clearHighlight();
  chunks = [];
  setState({ status: "idle", activeId: null, index: 0, total: 0 });
}

const RATES = [0.85, 1, 1.15, 1.3];

/** Fait défiler les vitesses de lecture (0,85× → 1,3×). */
export function cycleRate() {
  const idx = RATES.indexOf(state.rate);
  const next = RATES[(idx + 1) % RATES.length];
  setState({ rate: next });
}

/** Choisit la voix féminine ou masculine ; relit le morceau courant si lecture. */
export function setVoiceGender(gender: VoiceGender) {
  try {
    window.localStorage.setItem(GENDER_KEY, gender);
  } catch {
    /* stockage indisponible : la préférence ne sera pas mémorisée */
  }
  const wasPlaying = state.status === "playing";
  const at = state.index;
  setState({ voiceGender: gender });
  // Reprend immédiatement le passage courant avec la nouvelle voix.
  if (synth && wasPlaying) {
    token += 1;
    synth.cancel();
    speakFrom(at, token);
  }
}
