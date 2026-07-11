import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { CourseId } from "@/data/course";

/*
 * Association (cours, chapitre) → module de contenu chargé à la demande.
 * Chaque cours déclare ici la carte de ses chapitres. Ajouter un cours =
 * ajouter une entrée ; ajouter un chapitre = ajouter une ligne.
 */

type LazyComp = LazyExoticComponent<ComponentType>;

const registry: Record<CourseId, Record<string, LazyComp>> = {
  strategies: {
    a1: lazy(() => import("@/chapters/a1")),
    a2: lazy(() => import("@/chapters/a2")),
    a3: lazy(() => import("@/chapters/a3")),
    b1: lazy(() => import("@/chapters/b1")),
    b2: lazy(() => import("@/chapters/b2")),
    b3: lazy(() => import("@/chapters/b3")),
    b4: lazy(() => import("@/chapters/b4")),
  },
  industrielle: {
    // Chapitres d'Économie industrielle — ajoutés en phase 2.
  },
};

export function getChapterComponent(
  courseId: CourseId,
  chapterId: string,
): LazyComp | undefined {
  return registry[courseId]?.[chapterId];
}
