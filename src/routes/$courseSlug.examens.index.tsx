import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  AlarmClock,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  ListChecks,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { findCourse, type Course } from "@/data/course";
import { examsForCourse, examPdfUrl } from "@/data/exams";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/examens/")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    return { courseId: course.id };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    return {
      meta: [{ title: course ? `Examens blancs — ${course.shortTitle}` : "Examens blancs" }],
    };
  },
  component: ExamsRoute,
});

function ExamsRoute() {
  const { courseId } = Route.useLoaderData();
  return (
    <CourseProvider courseId={courseId}>
      <ExamsPage courseId={courseId} />
    </CourseProvider>
  );
}

function ExamsPage({ courseId }: { courseId: Course["id"] }) {
  const course = findCourse(courseId)!;
  const slug = course.slug;
  const exams = examsForCourse(courseId);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
        <div className="container py-10 sm:py-14">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <GraduationCap className="h-4 w-4" aria-hidden /> Examens blancs · {course.shortTitle}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Entraîne-toi en conditions réelles
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Trois examens blancs au format des vraies évaluations du cours : page de garde, barème,
            cadres de réponse. Ouvre l'énoncé en PDF, imprime-le, lance un minuteur — et ne regarde
            le corrigé qu'à la fin.
          </p>
        </div>
      </div>

      <main className="container max-w-4xl py-10">
        {/* Mode d'emploi */}
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Printer className="h-4 w-4" aria-hidden /> Comment s'entraîner en situation réelle
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-amber-900">
            <li>
              Ouvre l'énoncé dans le navigateur, consulte-le, puis{" "}
              <strong>télécharge-le ou imprime-le</strong> depuis le lecteur PDF (les cadres de
              réponse sont faits pour écrire dedans, comme le jour J).
            </li>
            <li>
              Mets un <strong>minuteur ({exams[0]?.duration ?? "…"})</strong>, sans notes ni
              téléphone — calculatrice autorisée.
            </li>
            <li>
              Ne consulte le <strong>corrigé qu'après</strong> avoir rendu ta copie : corrige-toi
              avec le barème, puis retourne relire les sections de théorie ratées.
            </li>
          </ol>
        </div>

        <div className="space-y-5">
          {exams.map((exam) => (
            <article
              key={exam.id}
              className="overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
                <span
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-extrabold text-white",
                    course.theme.gradient,
                  )}
                >
                  {exam.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold sm:text-xl">{exam.title}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                      <AlarmClock className="h-3 w-3" aria-hidden /> {exam.duration}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                      /{exam.totalPoints} pts · {exam.questionCount} questions
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {exam.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {exam.coverage.map((c) => (
                      <li
                        key={c}
                        className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    <a
                      href={examPdfUrl(exam.id, "enonce")}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <FileText className="h-4 w-4" aria-hidden />
                      Consulter l'énoncé (PDF)
                    </a>
                    <a
                      href={examPdfUrl(exam.id, "corrige")}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <FileCheck2 className="h-4 w-4" aria-hidden />
                      Corrigé (PDF)
                    </a>
                    <Link
                      to="/$courseSlug/examens/$examId"
                      params={{ courseSlug: slug, examId: exam.id }}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/40 bg-accent/50 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-accent"
                    >
                      <ListChecks className="h-4 w-4" aria-hidden />
                      Résolution guidée pas à pas
                    </Link>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="h-3 w-3" aria-hidden /> s'ouvre dans un onglet ·
                      téléchargeable depuis le lecteur
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          Examens blancs d'entraînement (non officiels), rédigés dans le format des évaluations des
          années précédentes et calibrés sur la matière actuelle du cours. Le jour de l'examen, seul
          l'énoncé officiel fait foi.
        </p>
      </main>
    </div>
  );
}
