import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  LineChart,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findCourse, type Course } from "@/data/course";
import { scopedKey, scopeStats, useProgress } from "@/lib/progress";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    return { courseId: course.id };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    return {
      meta: [
        {
          title: course
            ? `${course.shortTitle} — cours interactif`
            : "Cours d'économie interactifs",
        },
      ],
    };
  },
  component: CourseHomeRoute,
});

function CourseHomeRoute() {
  const { courseId } = Route.useLoaderData();
  return (
    <CourseProvider courseId={courseId}>
      <CourseHome courseId={courseId} />
    </CourseProvider>
  );
}

/** Illustration décorative générique (courbes + droite + point optimal). */
function HeroCurves() {
  return (
    <svg viewBox="0 0 480 300" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <line x1="40" y1="260" x2="450" y2="260" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="40" y1="260" x2="40" y2="20" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${60 + i * 30} 240 Q ${120 + i * 35} ${90 - i * 12} 430 ${60 - i * 14}`}
          fill="none"
          stroke="white"
          strokeOpacity={0.35 + i * 0.2}
          strokeWidth="2.5"
          strokeDasharray="460"
          strokeDashoffset="460"
          style={{ animation: `dash 1.6s ease-out ${0.3 + i * 0.25}s forwards` }}
        />
      ))}
      <line
        x1="60"
        y1="60"
        x2="380"
        y2="260"
        stroke="#fbbf24"
        strokeWidth="3"
        strokeDasharray="380"
        strokeDashoffset="380"
        style={{ animation: "dash 1.2s ease-out 1s forwards" }}
      />
      <circle cx="225" cy="163" r="0" fill="#fbbf24" style={{ animation: "pop 0.5s ease-out 2s forwards" }} />
      <style>{`@keyframes dash { to { stroke-dashoffset: 0; } } @keyframes pop { to { r: 7; } }`}</style>
    </svg>
  );
}

function CourseHome({ courseId }: { courseId: Course["id"] }) {
  const progress = useProgress();
  const course = findCourse(courseId)!;
  const slug = course.slug;

  const chapterCount = course.chapters.length;
  const tpCount = course.tpSessions.length;
  const exerciseCount = course.tpSessions.reduce((n, t) => n + t.exerciseCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className={cn("relative overflow-hidden bg-gradient-to-br text-white", course.theme.gradient)}>
        <div className="container relative grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-semibold backdrop-blur-sm">
              <GraduationCap className="h-4 w-4" aria-hidden />
              {course.code} · {course.title}
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {course.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{course.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/$courseSlug/theorie"
                params={{ courseSlug: slug }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-bold text-foreground shadow-lg transition-transform hover:scale-[1.02]"
              >
                <BookOpen className="h-4.5 w-4.5" aria-hidden />
                Commencer la théorie
              </Link>
              <Link
                to="/$courseSlug/exercices"
                params={{ courseSlug: slug }}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-5 py-3 text-[15px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <Dumbbell className="h-4.5 w-4.5" aria-hidden />
                M'entraîner sur les TP
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
              <span className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-white">{chapterCount}</span> chapitres interactifs
              </span>
              {tpCount > 0 ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-white">{tpCount}</span> séances de TP guidées
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-white">{exerciseCount}</span> exercices résolus
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold">TP bientôt disponibles</span>
                </span>
              )}
            </div>
          </div>
          <div className="relative hidden h-72 lg:block">
            <HeroCurves />
          </div>
        </div>
      </section>

      {/* Méthode */}
      <section className="border-b bg-card">
        <div className="container grid gap-6 py-10 sm:grid-cols-3">
          {[
            {
              icon: MousePointerClick,
              title: "Manipule les modèles",
              text: "Chaque concept-clé a son graphique interactif : bouge les curseurs, observe les effets, construis ton intuition.",
            },
            {
              icon: Sparkles,
              title: "Vérifie au fur et à mesure",
              text: "Des quiz de compréhension jalonnent la lecture : tu sais immédiatement si tu peux avancer ou relire.",
            },
            {
              icon: CheckCircle2,
              title: "Entraîne-toi comme à l'examen",
              text: "Les séances de TP officielles, résolues étape par étape, avec le lien vers la théorie à chaque étape.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5.5 w-5.5" aria-hidden />
              </span>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chapitres par partie */}
      <section className="container py-12 sm:py-16">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
          <BookOpen className="h-4 w-4" aria-hidden /> La théorie
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {course.parts.length} partie{course.parts.length > 1 ? "s" : ""}, {chapterCount} chapitre
          {chapterCount > 1 ? "s" : ""}
        </h2>

        {course.parts.map((part) => (
          <div key={part.id} className="mt-8">
            <h3 className="text-lg font-bold">{part.title}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{part.subtitle}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className={cn("h-2 bg-gradient-to-r", chapter.color.gradient)} />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("rounded-md px-2 py-0.5 text-xs font-extrabold", chapter.color.badge)}>
                            {chapter.code}
                          </span>
                          {pct !== null ? (
                            <span className="text-xs font-bold text-muted-foreground">{pct}% des quiz ✓</span>
                          ) : stats.visited ? (
                            <span className="text-xs font-medium text-muted-foreground">Commencé</span>
                          ) : null}
                        </div>
                        <h4 className="mt-2.5 text-lg font-bold leading-snug">{chapter.title}</h4>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                          {chapter.tagline}
                        </p>
                        <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-bold", chapter.color.text)}>
                          {stats.visited ? "Continuer" : "Découvrir"}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </section>

      {/* TP */}
      <section className="border-t bg-muted/40">
        <div className="container py-12 sm:py-16">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
            <Dumbbell className="h-4 w-4" aria-hidden /> La pratique
          </div>
          {tpCount === 0 ? (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Les séances de TP arrivent bientôt
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Les exercices pratiques de ce cours seront ajoutés prochainement, résolus étape par
                étape avec les liens vers la théorie. En attendant, entraîne-toi avec les quiz et
                les exercices intégrés aux chapitres.
              </p>
            </>
          ) : null}
          {tpCount > 0 ? (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {tpCount} séance{tpCount > 1 ? "s" : ""} de TP, résolue{tpCount > 1 ? "s" : ""} pas à pas
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Les énoncés officiels du cours. Pour chaque exercice : essaie d'abord, puis révèle la
                résolution étape par étape — chaque étape pointe vers la section de théorie qu'elle
                utilise.
              </p>
            </>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {course.tpSessions.map((session) => {
              const stats = scopeStats(progress, scopedKey(courseId, session.scope));
              return (
                <Link
                  key={session.number}
                  to="/$courseSlug/exercices/$sessionSlug"
                  params={{ courseSlug: slug, sessionSlug: session.slug }}
                  className="group flex gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-indigo-900 text-lg font-extrabold text-white">
                    {session.number}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold leading-snug">{session.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{session.subtitle}</p>
                    <div className="mt-2 text-xs font-semibold text-muted-foreground">
                      {session.exerciseCount} exercices
                      {stats.totalExercises > 0 ? ` · ${stats.doneExercises}/${stats.totalExercises} terminés` : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" aria-hidden />
            {course.shortTitle} · support d'étude interactif {course.code}
          </span>
          <span>Fait par des étudiants, pour des étudiants 🧑‍🎓</span>
        </div>
      </footer>
    </div>
  );
}
