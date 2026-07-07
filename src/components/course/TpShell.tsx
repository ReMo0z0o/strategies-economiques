import { useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getChapter, getTpSession, tpSessions } from "@/data/course";
import { markVisited, scopeStats, useProgress } from "@/lib/progress";
import { SiteHeader } from "@/components/course/SiteHeader";

/**
 * Coquille de page pour une séance de TP : hero, chapitres liés, progression
 * des exercices, navigation entre séances.
 */
export function TpShell({
  sessionNumber,
  children,
  intro,
}: {
  sessionNumber: 1 | 2 | 3 | 4;
  /** paragraphe de mise en contexte affiché avant les exercices */
  intro?: ReactNode;
  children: ReactNode;
}) {
  const session = getTpSession(sessionNumber);
  const progress = useProgress();
  const stats = scopeStats(progress, session.scope);
  const idx = tpSessions.findIndex((s) => s.number === sessionNumber);
  const prev = idx > 0 ? tpSessions[idx - 1] : undefined;
  const next = idx < tpSessions.length - 1 ? tpSessions[idx + 1] : undefined;

  useEffect(() => {
    markVisited(session.scope);
  }, [session.scope]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
        <div className="container py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Link to="/exercices" className="transition-colors hover:text-white">
              Exercices
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-white">Séance {session.number}</span>
          </nav>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <Dumbbell className="h-4 w-4" aria-hidden />
            Travaux pratiques · Séance {session.number}
          </div>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {session.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {session.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-medium">
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              {session.exerciseCount} exercices
            </span>
            {stats.totalExercises > 0 ? (
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                {stats.doneExercises}/{stats.totalExercises} terminés
              </span>
            ) : null}
            {session.chapters.map((cid) => {
              const ch = getChapter(cid);
              return (
                <Link
                  key={cid}
                  to="/theorie/$chapterId"
                  params={{ chapterId: ch.slug }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-white/35"
                >
                  <BookOpen className="h-3.5 w-3.5" aria-hidden />
                  Théorie {ch.code}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container max-w-4xl py-8 sm:py-10">
        {intro ? (
          <div className="course-prose mb-6 rounded-2xl border bg-card px-5 py-4 text-[15px]">
            {intro}
          </div>
        ) : null}
        {children}

        {stats.totalExercises > 0 && stats.doneExercises === stats.totalExercises ? (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-success/40 bg-emerald-50 px-5 py-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <div className="font-bold text-emerald-900">Séance terminée, bravo ! 🎉</div>
              <div className="text-sm text-emerald-800">
                Tu as parcouru les {stats.totalExercises} exercices de cette séance.
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Navigation bas de page */}
      <footer className="border-t bg-muted/40">
        <div className="container grid max-w-4xl gap-4 py-8 sm:grid-cols-2">
          {prev ? (
            <Link
              to="/exercices/$sessionSlug"
              params={{ sessionSlug: prev.slug }}
              className="group rounded-2xl border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                Séance précédente
              </div>
              <div className="mt-1 font-bold">
                TP {prev.number} · {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/exercices/$sessionSlug"
              params={{ sessionSlug: next.slug }}
              className="group rounded-2xl border bg-card p-4 text-right transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Séance suivante
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
              <div className="mt-1 font-bold">
                TP {next.number} · {next.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </footer>
    </div>
  );
}

export function TpPlaceholder({ sessionNumber }: { sessionNumber: 1 | 2 | 3 | 4 }) {
  return (
    <TpShell sessionNumber={sessionNumber}>
      <p className="text-muted-foreground">
        Cette séance d'exercices est en cours de rédaction. Reviens bientôt !
      </p>
    </TpShell>
  );
}
