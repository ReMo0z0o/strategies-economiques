import { Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTpSession } from "@/data/course";
import { useCourse } from "@/components/course/CourseContext";

/*
 * Pastille cliquable renvoyant vers une séance de TP du cours courant —
 * éventuellement vers un exercice précis (ancre #ex1, #ex2… posée par
 * ExerciseBlock). Pendant de TheoryRef, côté entraînement.
 */

export interface TpRefSpec {
  /** numéro de la séance de TP du cours courant */
  session: number;
  /** id d'exercice à cibler (ancre), ex. "ex2" */
  exercise?: string;
  /** libellé personnalisé (par défaut : titre de la séance) */
  label?: string;
}

export function TpRef({ session, exercise, label, className }: TpRefSpec & { className?: string }) {
  const { courseId, course } = useCourse();
  const tp = getTpSession(courseId, session);
  const text = label ?? tp.title;
  return (
    <Link
      to="/$courseSlug/exercices/$sessionSlug"
      params={{ courseSlug: course.slug, sessionSlug: tp.slug }}
      hash={exercise}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border border-transparent bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 transition-all hover:brightness-95",
        className,
      )}
      title={`S'entraîner : TP ${tp.number} · ${text}`}
    >
      <Dumbbell className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">
        TP {tp.number}{exercise ? ` · ${exercise.replace("ex", "exercice ")}` : ""} · {text}
      </span>
    </Link>
  );
}

export function TpRefList({ refs, className }: { refs: TpRefSpec[]; className?: string }) {
  if (refs.length === 0) return null;
  return (
    <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {refs.map((r, i) => (
        <TpRef key={i} {...r} />
      ))}
    </span>
  );
}
