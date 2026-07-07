/*
 * Suivi de progression de l'étudiant, persisté en localStorage.
 *
 * Un "scope" est une page (chapitre de théorie "a1"…"b4" ou séance de TP
 * "tp1"…"tp4"). Les quiz et exercices s'enregistrent au montage, ce qui
 * permet de connaître le dénominateur (total) d'une page dès qu'elle a été
 * visitée une fois.
 */
import { useSyncExternalStore } from "react";

export type QuizResult = "correct" | "wrong";

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

const KEY = "ecgeb366-progress-v1";

const EMPTY: ProgressState = {
  quiz: {},
  knownQuiz: {},
  doneExercises: {},
  knownExercises: {},
  visited: {},
};

let state: ProgressState = load();
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      quiz: parsed.quiz ?? {},
      knownQuiz: parsed.knownQuiz ?? {},
      doneExercises: parsed.doneExercises ?? {},
      knownExercises: parsed.knownExercises ?? {},
      visited: parsed.visited ?? {},
    };
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

export function globalStats(s: ProgressState) {
  let totalQuiz = 0;
  let correctQuiz = 0;
  for (const scope of Object.keys(s.knownQuiz)) {
    const st = scopeStats(s, scope);
    totalQuiz += st.totalQuiz;
    correctQuiz += st.correctQuiz;
  }
  return { totalQuiz, correctQuiz };
}
