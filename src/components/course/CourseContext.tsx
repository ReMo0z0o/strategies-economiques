import { createContext, useContext, type ReactNode } from "react";
import { getCourse, type Course, type CourseId } from "@/data/course";

/*
 * Contexte du cours courant.
 *
 * Posé par les coquilles de page (ChapterShell, TpShell) et par les pages de
 * cours (home, index théorie/exercices) à partir du segment d'URL. Il rend
 * l'infrastructure partagée « consciente du cours » sans que les fichiers de
 * contenu (src/chapters/*, src/tp/*) aient à passer le cours explicitement :
 *   - préfixe les scopes de progression (Quiz, ExerciseBlock) ;
 *   - construit les liens /{slug}/… (header, fils d'Ariane, TheoryRef) ;
 *   - affiche l'identité du cours dans le header.
 */

interface CourseContextValue {
  courseId: CourseId;
  course: Course;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({
  courseId,
  children,
}: {
  courseId: CourseId;
  children: ReactNode;
}) {
  const course = getCourse(courseId);
  return <CourseContext.Provider value={{ courseId, course }}>{children}</CourseContext.Provider>;
}

/** Cours courant. Lève une erreur si utilisé hors d'un CourseProvider. */
export function useCourse(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse doit être utilisé dans un <CourseProvider>.");
  return ctx;
}

/** Cours courant si présent, sinon null (pour les composants utilisés à la
 * fois dans un cours et hors cours, comme le header sur le hub). */
export function useCourseOptional(): CourseContextValue | null {
  return useContext(CourseContext);
}
