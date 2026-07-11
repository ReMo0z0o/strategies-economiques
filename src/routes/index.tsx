import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Dumbbell, GraduationCap, LineChart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { courses } from "@/data/course";
import { courseStats, useProgress } from "@/lib/progress";
import { SiteHeader } from "@/components/course/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Cours d'économie interactifs" }],
  }),
  component: HubPage,
});

function HubPage() {
  const progress = useProgress();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero plateforme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
        <div className="container relative py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur-sm">
            <GraduationCap className="h-4 w-4" aria-hidden />
            Plateforme d'étude interactive
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Comprends l'économie en la <span className="text-amber-300">manipulant</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
            Des cours d'économie expliqués pas à pas : théorie claire, graphiques que tu pilotes
            toi-même, quiz de compréhension au fil de la lecture, et tous les TP résolus étape par
            étape. Choisis ton cours pour commencer.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden /> Théorie interactive
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden /> Quiz de compréhension
            </span>
            <span className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" aria-hidden /> TP résolus pas à pas
            </span>
          </div>
        </div>
      </section>

      {/* Choix du cours */}
      <section className="container py-12 sm:py-16">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
          <GraduationCap className="h-4 w-4" aria-hidden /> Les cours
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Choisis ton cours</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {courses.map((course) => {
            const stats = courseStats(progress, course.id);
            const chapterCount = course.chapters.length;
            const tpCount = course.tpSessions.length;
            const available = chapterCount > 0 || tpCount > 0;
            const pct =
              stats.totalQuiz > 0 ? Math.round((stats.correctQuiz / stats.totalQuiz) * 100) : null;

            const card = (
              <div
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-all",
                  available ? "hover:-translate-y-1 hover:shadow-xl" : "opacity-90",
                )}
              >
                <div className={cn("relative h-28 bg-gradient-to-br sm:h-32", course.theme.gradient)}>
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {course.code}
                    </span>
                    <LineChart className="h-10 w-10 text-white/40" aria-hidden />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold leading-snug">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>

                  {available ? (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                        <span className="rounded-full border bg-background px-2.5 py-1">
                          {chapterCount} chapitre{chapterCount > 1 ? "s" : ""}
                        </span>
                        <span className="rounded-full border bg-background px-2.5 py-1">
                          {tpCount} séance{tpCount > 1 ? "s" : ""} de TP
                        </span>
                        {pct !== null ? (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1",
                              pct >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
                            )}
                          >
                            {pct}% des quiz ✓
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "mt-5 inline-flex items-center gap-1.5 text-sm font-bold",
                          course.theme.text,
                        )}
                      >
                        {stats.totalQuiz > 0 || stats.totalExercises > 0 ? "Continuer le cours" : "Découvrir le cours"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </>
                  ) : (
                    <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                      Bientôt disponible
                    </span>
                  )}
                </div>
              </div>
            );

            return available ? (
              <Link key={course.id} to="/$courseSlug" params={{ courseSlug: course.slug }} className="block">
                {card}
              </Link>
            ) : (
              <div key={course.id} aria-disabled className="cursor-default">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" aria-hidden />
            Plateforme d'étude interactive en économie
          </span>
          <span>Fait par des étudiants, pour des étudiants 🧑‍🎓</span>
        </div>
      </footer>
    </div>
  );
}
