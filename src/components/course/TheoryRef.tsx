import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChapter, getCourse, getSection, type ChapterId, type CourseId } from "@/data/course";
import { useCourse } from "@/components/course/CourseContext";

export interface TheoryRefSpec {
  chapter: ChapterId;
  /** cours cible ; par défaut le cours courant (les renvois sont intra-cours) */
  course?: CourseId;
  /** id de section (ancre) dans le chapitre ; omis = lien vers le chapitre */
  section?: string;
  /** libellé personnalisé (par défaut : titre de la section) */
  label?: string;
}

/** Pastille cliquable renvoyant vers la partie de théorie pertinente. */
export function TheoryRef({
  chapter,
  course,
  section,
  label,
  className,
}: TheoryRefSpec & { className?: string }) {
  const { courseId } = useCourse();
  const targetCourseId = course ?? courseId;
  const courseSlug = getCourse(targetCourseId).slug;
  const ch = getChapter(targetCourseId, chapter);
  const sec = section ? getSection(targetCourseId, chapter, section) : undefined;
  const text = label ?? sec?.title ?? ch.title;
  return (
    <Link
      to="/$courseSlug/theorie/$chapterId"
      params={{ courseSlug, chapterId: ch.slug }}
      hash={section}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
        ch.color.badge,
        "border-transparent hover:brightness-95",
        className,
      )}
      title={`Revoir la théorie : ${ch.code} · ${text}`}
    >
      <BookOpen className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">
        {ch.code} · {text}
      </span>
    </Link>
  );
}

export function TheoryRefList({ refs, className }: { refs: TheoryRefSpec[]; className?: string }) {
  if (refs.length === 0) return null;
  return (
    <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {refs.map((r, i) => (
        <TheoryRef key={i} {...r} />
      ))}
    </span>
  );
}
