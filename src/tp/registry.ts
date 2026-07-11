import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { CourseId } from "@/data/course";

/*
 * Association (cours, numéro de séance de TP) → module de contenu chargé à la
 * demande. Ajouter un cours = ajouter une entrée ; ajouter une séance = une ligne.
 */

type LazyComp = LazyExoticComponent<ComponentType>;

const registry: Record<CourseId, Record<number, LazyComp>> = {
  strategies: {
    1: lazy(() => import("@/tp/session1")),
    2: lazy(() => import("@/tp/session2")),
    3: lazy(() => import("@/tp/session3")),
    4: lazy(() => import("@/tp/session4")),
  },
  industrielle: {
    // Séances de TP d'Économie industrielle — ajoutées en phase 2.
  },
};

export function getTpComponent(
  courseId: CourseId,
  sessionNumber: number,
): LazyComp | undefined {
  return registry[courseId]?.[sessionNumber];
}
