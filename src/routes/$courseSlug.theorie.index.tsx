import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { findCourse, type Course } from "@/data/course";
import { scopedKey, scopeStats, useProgress } from "@/lib/progress";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/theorie/")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    return { courseId: course.id };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    return {
      meta: [{ title: course ? `Théorie — ${course.shortTitle}` : "Théorie" }],
    };
  },
  component: TheoryIndexRoute,
});

function TheoryIndexRoute() {
  const { courseId } = Route.useLoaderData();
  return (
    <CourseProvider courseId={courseId}>
      <TheoryIndex courseId={courseId} />
    </CourseProvider>
  );
}

function TheoryIndex({ courseId }: { courseId: Course["id"] }) {
  const progress = useProgress();
  const course = findCourse(courseId)!;
  const slug = course.slug;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
        <div className="container py-10 sm:py-14">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <BookOpen className="h-4 w-4" aria-hidden /> La théorie · {course.shortTitle}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Le cours, chapitre par chapitre
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Lis dans l'ordre ou pioche ce dont tu as besoin. Chaque chapitre alterne explications,
            graphiques interactifs et quiz de compréhension — ta progression est enregistrée sur cet
            appareil.
          </p>
        </div>
      </div>

      <main className="container py-10">
        {course.chapters.length === 0 ? (
          <p className="rounded-2xl border bg-card px-5 py-8 text-center text-muted-foreground">
            Les chapitres de ce cours arrivent bientôt.
          </p>
        ) : null}
        {course.parts.map((part) => (
          <section key={part.id} className="mb-12">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{part.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{part.subtitle}</p>
            <div className="mt-5 space-y-4">
              {course.chapters
                .filter((c) => c.part === part.id)
                .map((chapter) => {
                  const stats = scopeStats(progress, scopedKey(courseId, chapter.id));
                  const pct =
                    stats.totalQuiz > 0 ? Math.round((stats.correctQuiz / stats.totalQuiz) * 100) : null;
                  return (
                    <Link
                      key={chapter.id}
                      to="/$courseSlug/theorie/$chapterId"
                      params={{ courseSlug: slug, chapterId: chapter.slug }}
                      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div
                          className={cn(
                            "flex items-center justify-center bg-gradient-to-br px-6 py-4 text-white sm:w-36 sm:shrink-0",
                            chapter.color.gradient,
                          )}
                        >
                          <span className="text-3xl font-extrabold tracking-tight">{chapter.code}</span>
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-lg font-bold">{chapter.title}</h3>
                            {pct !== null ? (
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                                  pct >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                                )}
                              >
                                {pct}% des quiz réussis
                              </span>
                            ) : stats.visited ? (
                              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                Commencé
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {chapter.description}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                            <span>{chapter.sections.length} sections</span>
                            {chapter.tpSessions.length > 0 ? (
                              <span className="flex items-center gap-1">
                                <Dumbbell className="h-3.5 w-3.5" aria-hidden />
                                TP {chapter.tpSessions.join(" & ")}
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                "ml-auto inline-flex items-center gap-1 text-sm font-bold",
                                chapter.color.text,
                              )}
                            >
                              {stats.visited ? "Continuer" : "Commencer"}
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
