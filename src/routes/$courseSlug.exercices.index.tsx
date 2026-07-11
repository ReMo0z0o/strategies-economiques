import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Dumbbell, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { findCourse, getChapter, type Course } from "@/data/course";
import { scopedKey, scopeStats, useProgress } from "@/lib/progress";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/exercices/")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    return { courseId: course.id };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    return {
      meta: [{ title: course ? `Exercices — ${course.shortTitle}` : "Exercices" }],
    };
  },
  component: ExercisesIndexRoute,
});

function ExercisesIndexRoute() {
  const { courseId } = Route.useLoaderData();
  return (
    <CourseProvider courseId={courseId}>
      <ExercisesIndex courseId={courseId} />
    </CourseProvider>
  );
}

function ExercisesIndex({ courseId }: { courseId: Course["id"] }) {
  const progress = useProgress();
  const course = findCourse(courseId)!;
  const slug = course.slug;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
        <div className="container py-10 sm:py-14">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <Dumbbell className="h-4 w-4" aria-hidden /> Travaux pratiques · {course.shortTitle}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Entraîne-toi sur les vrais TP
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Les séances d'exercices officielles du cours, résolues étape par étape. Chaque étape
            indique la théorie qu'elle mobilise : si tu bloques, tu sais exactement quoi relire.
          </p>
        </div>
      </div>

      <main className="container max-w-5xl py-10">
        <div className="mb-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div className="text-sm leading-relaxed text-amber-900">
            <strong>Conseil de méthode :</strong> lis l'énoncé, cherche <em>vraiment</em> pendant
            quelques minutes avec papier et crayon, puis révèle les étapes une à une. C'est l'effort
            de recherche qui fait progresser — pas la lecture de la solution.
          </div>
        </div>

        {course.tpSessions.length === 0 ? (
          <p className="rounded-2xl border bg-card px-5 py-8 text-center text-muted-foreground">
            Les séances d'exercices de ce cours arrivent bientôt.
          </p>
        ) : null}

        <div className="space-y-5">
          {course.tpSessions.map((session) => {
            const stats = scopeStats(progress, scopedKey(courseId, session.scope));
            const done = stats.totalExercises > 0 && stats.doneExercises === stats.totalExercises;
            return (
              <Link
                key={session.number}
                to="/$courseSlug/exercices/$sessionSlug"
                params={{ courseSlug: slug, sessionSlug: session.slug }}
                className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
                  <span
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white",
                      done
                        ? "bg-gradient-to-br from-emerald-500 to-green-600"
                        : "bg-gradient-to-br from-slate-700 to-indigo-900",
                    )}
                  >
                    {done ? "✓" : session.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold sm:text-xl">
                        Séance {session.number} · {session.title}
                      </h2>
                      {stats.totalExercises > 0 ? (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                          {stats.doneExercises}/{stats.totalExercises} terminés
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{session.subtitle}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {session.topics.map((topic) => (
                        <li
                          key={topic}
                          className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden /> Théorie liée :
                      </span>
                      {session.chapters.map((cid) => {
                        const ch = getChapter(courseId, cid);
                        return (
                          <span
                            key={cid}
                            className={cn("rounded-full px-2 py-0.5 text-xs font-bold", ch.color.badge)}
                          >
                            {ch.code}
                          </span>
                        );
                      })}
                      <span className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-primary">
                        {session.exerciseCount} exercices
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
