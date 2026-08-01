import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/*
 * Association examen blanc → module de résolution guidée, chargé à la demande
 * (même patron que les registries de chapitres et de TP).
 */

type LazyComp = LazyExoticComponent<ComponentType>;

const registry: Record<string, LazyComp> = {
  "p1-blanc-1": lazy(() => import("@/exam-solutions/p1-blanc-1")),
  "p1-blanc-2": lazy(() => import("@/exam-solutions/p1-blanc-2")),
  "p1-blanc-3": lazy(() => import("@/exam-solutions/p1-blanc-3")),
  "p2-blanc-1": lazy(() => import("@/exam-solutions/p2-blanc-1")),
  "p2-blanc-2": lazy(() => import("@/exam-solutions/p2-blanc-2")),
  "p2-blanc-3": lazy(() => import("@/exam-solutions/p2-blanc-3")),
};

export function getExamSolutionComponent(examId: string): LazyComp | undefined {
  return registry[examId];
}
