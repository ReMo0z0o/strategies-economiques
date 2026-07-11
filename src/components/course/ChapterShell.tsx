import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpenCheck, Dumbbell, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adjacentChapters,
  getChapter,
  getTpSession,
  type ChapterId,
} from "@/data/course";
import { markVisited, scopedKey, scopeStats, useProgress } from "@/lib/progress";
import { SiteHeader } from "@/components/course/SiteHeader";
import { useCourse } from "@/components/course/CourseContext";

/* ------------------------------------------------------------------ */
/* Section de chapitre                                                 */
/* ------------------------------------------------------------------ */

export function Section({
  id,
  kicker,
  title,
  children,
  className,
}: {
  /** doit correspondre à l'id déclaré dans src/data/course.ts */
  id: string;
  /** petit libellé au-dessus du titre, ex. "A.1" ou "§ 4" */
  kicker?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-chapter-section={id} className={cn("scroll-mt-24 py-8 sm:py-10", className)}>
      <header className="mb-5">
        {kicker ? (
          <div className="mb-1 text-sm font-bold uppercase tracking-wider text-primary">
            {kicker}
          </div>
        ) : null}
        <h2 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h2>
      </header>
      <div className="course-prose">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scrollspy                                                           */
/* ------------------------------------------------------------------ */

function useScrollSpy(sectionIds: string[]) {
  const [active, setActive] = useState<string | null>(sectionIds[0] ?? null);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size > 0) {
          // la section visible la plus haute dans l'ordre du document
          const first = sectionIds.find((id) => visible.has(id));
          if (first) setActive(first);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.01] },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}

/* ------------------------------------------------------------------ */
/* Coquille de page de chapitre                                        */
/* ------------------------------------------------------------------ */

export function ChapterShell({
  chapterId,
  children,
  heroExtra,
}: {
  chapterId: ChapterId;
  children: ReactNode;
  /** contenu additionnel affiché dans le hero (ex. mini-résumé animé) */
  heroExtra?: ReactNode;
}) {
  const { courseId, course } = useCourse();
  const slug = course.slug;
  const chapter = getChapter(courseId, chapterId);
  const { prev, next } = adjacentChapters(courseId, chapterId);
  const progress = useProgress();
  const stats = scopeStats(progress, scopedKey(courseId, chapterId));
  const active = useScrollSpy(chapter.sections.map((s) => s.id));

  useEffect(() => {
    markVisited(scopedKey(courseId, chapterId));
  }, [courseId, chapterId]);

  const quizPct =
    stats.totalQuiz > 0 ? Math.round((stats.correctQuiz / stats.totalQuiz) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <div className={cn("bg-gradient-to-br text-white", chapter.color.gradient)}>
        <div className="container py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/80">
            <Link
              to="/$courseSlug/theorie"
              params={{ courseSlug: slug }}
              className="transition-colors hover:text-white"
            >
              Théorie
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-white">Chapitre {chapter.code}</span>
          </nav>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {chapter.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {chapter.tagline}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-medium">
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              {chapter.sections.length} sections
            </span>
            {stats.totalQuiz > 0 ? (
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                {stats.correctQuiz}/{stats.totalQuiz} quiz réussis
              </span>
            ) : null}
            {chapter.tpSessions.map((n) => {
              const tp = getTpSession(courseId, n);
              return (
                <Link
                  key={n}
                  to="/$courseSlug/exercices/$sessionSlug"
                  params={{ courseSlug: slug, sessionSlug: tp.slug }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-white/35"
                >
                  <Dumbbell className="h-3.5 w-3.5" aria-hidden />
                  S'entraîner : TP {n}
                </Link>
              );
            })}
          </div>
          {heroExtra}
        </div>
      </div>

      {/* Corps : sommaire latéral + contenu */}
      <div className="container grid gap-10 py-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pr-2">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" aria-hidden />
              Dans ce chapitre
            </div>
            <nav className="space-y-0.5 border-l border-border">
              {chapter.sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-3 pr-2 text-[13px] leading-snug transition-colors",
                    active === s.id
                      ? cn("border-current font-semibold", chapter.color.text)
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <span className="mr-1.5 tabular-nums text-[11px] opacity-60">{i + 1}.</span>
                  {s.title}
                </a>
              ))}
            </nav>
            {stats.totalQuiz > 0 ? (
              <div className="mt-5 rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Quiz du chapitre</span>
                  <span className={chapter.color.text}>{quizPct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all", chapter.color.gradient)}
                    style={{ width: `${quizPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0 divide-y divide-border">{children}</main>
      </div>

      {/* Navigation bas de page */}
      <footer className="border-t bg-muted/40">
        <div className="container grid gap-4 py-8 sm:grid-cols-2">
          {prev ? (
            <Link
              to="/$courseSlug/theorie/$chapterId"
              params={{ courseSlug: slug, chapterId: prev.slug }}
              className="group rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                Chapitre précédent
              </div>
              <div className="mt-1 font-bold">
                {prev.code} · {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/$courseSlug/theorie/$chapterId"
              params={{ courseSlug: slug, chapterId: next.slug }}
              className="group rounded-2xl border bg-card p-4 text-right transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chapitre suivant
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
              <div className="mt-1 font-bold">
                {next.code} · {next.title}
              </div>
            </Link>
          ) : (
            <Link
              to="/$courseSlug/exercices"
              params={{ courseSlug: slug }}
              className="group rounded-2xl border bg-card p-4 text-right transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Passer à la pratique
                <BookOpenCheck className="h-3.5 w-3.5" aria-hidden />
              </div>
              <div className="mt-1 font-bold">Les séances d'exercices</div>
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

