/*
 * Suivi de progression de l'étudiant, persisté en localStorage.
 *
 * Un "scope" est une page identifiée par cours : "{courseId}:{localId}", où
 * localId est un id de chapitre ("a1"…) ou un scope de TP ("tp1"…). Le
 * préfixe de cours cloisonne les deux cours dans le même stockage. Les quiz
 * et exercices s'enregistrent au montage, ce qui permet de connaître le
 * dénominateur (total) d'une page dès qu'elle a été visitée une fois.
 */
import { useSyncExternalStore } from "react";

export type QuizResult = "correct" | "wrong";

/** Construit le scope de progression complet, préfixé par le cours. */
export function scopedKey(courseId: string, localId: string): string {
  return `${courseId}:${localId}`;
}

export interface ProgressState {
  /** scope -> quizId -> meilleur résultat obtenu */
  quiz: Record<string, Record<string, QuizResult>>;
  /** scope -> ids de quiz connus (montés au moins une fois) */
  knownQuiz: Record<string, string[]>;
  /** scope -> ids d'exercices terminés (toutes les étapes révélées) */
  doneExercises: Record<string, string[]>;
  /** scope -> ids d'exercices connus */
  knownExercises: Record<string, string[]>;
  /** pages visitées (slug de chapitre ou de séance) */
  visited: Record<string, true>;
}

const KEY = "eco-progress-v2";
/** Ancienne clé mono-cours : scopes non préfixés, tous relatifs à Stratégies. */
const LEGACY_KEY = "ecgeb366-progress-v1";
const LEGACY_COURSE = "strategies";

const EMPTY: ProgressState = {
  quiz: {},
  knownQuiz: {},
  doneExercises: {},
  knownExercises: {},
  visited: {},
};

let state: ProgressState = load();
const listeners = new Set<() => void>();

/** Préfixe toutes les clés de scope d'un Record par "{course}:". */
function prefixRecord<T>(rec: Record<string, T>, course: string): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(rec)) out[`${course}:${k}`] = v;
  return out;
}

/** Migre la progression mono-cours (v1) vers le format multi-cours (v2). */
function migrateLegacy(parsed: Partial<ProgressState>): ProgressState {
  return {
    quiz: prefixRecord(parsed.quiz ?? {}, LEGACY_COURSE),
    knownQuiz: prefixRecord(parsed.knownQuiz ?? {}, LEGACY_COURSE),
    doneExercises: prefixRecord(parsed.doneExercises ?? {}, LEGACY_COURSE),
    knownExercises: prefixRecord(parsed.knownExercises ?? {}, LEGACY_COURSE),
    visited: prefixRecord(parsed.visited ?? {}, LEGACY_COURSE),
  };
}

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      return {
        quiz: parsed.quiz ?? {},
        knownQuiz: parsed.knownQuiz ?? {},
        doneExercises: parsed.doneExercises ?? {},
        knownExercises: parsed.knownExercises ?? {},
        visited: parsed.visited ?? {},
      };
    }
    // Pas de données v2 : tenter une migration depuis l'ancien format v1.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) return migrateLegacy(JSON.parse(legacy) as Partial<ProgressState>);
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* stockage plein ou indisponible : on continue sans persister */
  }
}

function emit() {
  persist();
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressState {
  return state;
}

function getServerSnapshot(): ProgressState {
  return EMPTY;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export function registerQuiz(scope: string, quizId: string) {
  const known = state.knownQuiz[scope] ?? [];
  if (known.includes(quizId)) return;
  state = {
    ...state,
    knownQuiz: { ...state.knownQuiz, [scope]: [...known, quizId] },
  };
  emit();
}

export function recordQuizResult(scope: string, quizId: string, correct: boolean) {
  const scopeResults = state.quiz[scope] ?? {};
  // Une bonne réponse reste acquise même si l'étudiant réessaie et se trompe.
  if (scopeResults[quizId] === "correct" && !correct) return;
  const next: QuizResult = correct ? "correct" : "wrong";
  if (scopeResults[quizId] === next) return;
  state = {
    ...state,
    quiz: { ...state.quiz, [scope]: { ...scopeResults, [quizId]: next } },
  };
  emit();
}

export function registerExercise(scope: string, exerciseId: string) {
  const known = state.knownExercises[scope] ?? [];
  if (known.includes(exerciseId)) return;
  state = {
    ...state,
    knownExercises: { ...state.knownExercises, [scope]: [...known, exerciseId] },
  };
  emit();
}

export function markExerciseDone(scope: string, exerciseId: string) {
  const done = state.doneExercises[scope] ?? [];
  if (done.includes(exerciseId)) return;
  state = {
    ...state,
    doneExercises: { ...state.doneExercises, [scope]: [...done, exerciseId] },
  };
  emit();
}

export function markVisited(slug: string) {
  if (state.visited[slug]) return;
  state = { ...state, visited: { ...state.visited, [slug]: true } };
  emit();
}

export function resetProgress() {
  state = { ...EMPTY, quiz: {}, knownQuiz: {}, doneExercises: {}, knownExercises: {}, visited: {} };
  emit();
}

/* ------------------------------------------------------------------ */
/* Sélecteurs                                                          */
/* ------------------------------------------------------------------ */

export interface ScopeStats {
  /** nombre de quiz connus dans ce scope (0 si jamais visité) */
  totalQuiz: number;
  correctQuiz: number;
  answeredQuiz: number;
  totalExercises: number;
  doneExercises: number;
  visited: boolean;
}

export function scopeStats(s: ProgressState, scope: string): ScopeStats {
  const known = s.knownQuiz[scope] ?? [];
  const results = s.quiz[scope] ?? {};
  const knownEx = s.knownExercises[scope] ?? [];
  const doneEx = s.doneExercises[scope] ?? [];
  let correct = 0;
  let answered = 0;
  for (const id of known) {
    if (results[id]) answered += 1;
    if (results[id] === "correct") correct += 1;
  }
  return {
    totalQuiz: known.length,
    correctQuiz: correct,
    answeredQuiz: answered,
    totalExercises: knownEx.length,
    doneExercises: doneEx.filter((id) => knownEx.includes(id)).length,
    visited: Boolean(s.visited[scope]),
  };
}

/** Agrégat des quiz pour UN cours : ne compte que les scopes "{courseId}:…". */
export function courseStats(s: ProgressState, courseId: string) {
  const prefix = `${courseId}:`;
  let totalQuiz = 0;
  let correctQuiz = 0;
  let doneExercises = 0;
  let totalExercises = 0;
  for (const scope of Object.keys(s.knownQuiz)) {
    if (!scope.startsWith(prefix)) continue;
    const st = scopeStats(s, scope);
    totalQuiz += st.totalQuiz;
    correctQuiz += st.correctQuiz;
  }
  for (const scope of Object.keys(s.knownExercises)) {
    if (!scope.startsWith(prefix)) continue;
    const st = scopeStats(s, scope);
    totalExercises += st.totalExercises;
    doneExercises += st.doneExercises;
  }
  return { totalQuiz, correctQuiz, totalExercises, doneExercises };
}
