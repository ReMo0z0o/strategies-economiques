/*
 * Moteur de lecture à voix haute, basé sur l'API Web Speech du navigateur
 * (window.speechSynthesis). Aucun serveur, aucun fichier audio : la voix est
 * celle de l'appareil de l'étudiant.
 *
 * Singleton exposé via un hook useSpeech() (même patron que lib/progress.ts).
 * On lit morceau par morceau (un bloc de prose à la fois) : c'est robuste
 * entre navigateurs et ça permet de surligner le passage en cours.
 */
import { useSyncExternalStore } from "react";
import type { SpeechChunk } from "@/lib/speechText";

export type SpeechStatus = "idle" | "playing" | "paused";

export interface SpeechState {
  status: SpeechStatus;
  /** identifiant de l'instance ReadAloud active (pour n'activer qu'un bouton) */
  activeId: string | null;
  index: number;
  total: number;
  rate: number;
}

const synth: SpeechSynthesis | null =
  typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

export const speechSupported = Boolean(synth);

let state: SpeechState = { status: "idle", activeId: null, index: 0, total: 0, rate: 1 };
let chunks: SpeechChunk[] = [];
let highlighted: HTMLElement | null = null;
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
/* Choix de la voix française                                          */
/* ------------------------------------------------------------------ */

let frVoice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  if (!voices.length) return;
  const fr = voices.filter((v) => /^fr(-|_|$)/i.test(v.lang));
  frVoice =
    fr.find((v) => /amélie|amelie|audrey|virginie|thomas|google|natural|premium/i.test(v.name)) ??
    fr[0] ??
    null;
}

if (synth) {
  pickVoice();
  // La liste des voix arrive de façon asynchrone sur certains navigateurs.
  synth.addEventListener?.("voiceschanged", pickVoice);
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

function speakIndex(i: number) {
  if (!synth) return;
  if (i >= chunks.length) {
    stop();
    return;
  }
  setState({ index: i });
  const chunk = chunks[i];
  highlight(chunk.el ?? null);

  const utter = new SpeechSynthesisUtterance(chunk.text);
  utter.lang = "fr-FR";
  utter.rate = state.rate;
  if (frVoice) utter.voice = frVoice;
  utter.onend = () => {
    if (state.status === "playing") speakIndex(i + 1);
  };
  utter.onerror = () => {
    // On saute le morceau fautif pour ne pas bloquer la lecture.
    if (state.status === "playing") speakIndex(i + 1);
  };
  synth.speak(utter);
}

/** Démarre la lecture d'une liste de morceaux pour l'instance `id`. */
export function play(id: string, newChunks: SpeechChunk[]) {
  if (!synth) return;
  synth.cancel();
  chunks = newChunks.filter((c) => c.text.trim().length > 0);
  if (chunks.length === 0) return;
  setState({ status: "playing", activeId: id, index: 0, total: chunks.length });
  speakIndex(0);
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
