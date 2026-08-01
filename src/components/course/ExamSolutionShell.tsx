import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlarmClock,
  ArrowLeft,
  FileCheck2,
  FileText,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockExams, examPdfUrl } from "@/data/exams";
import { useCourse } from "@/components/course/CourseContext";
import { SiteHeader } from "@/components/course/SiteHeader";

/*
 * Coquille de page pour la résolution guidée d'un examen blanc : hero avec
 * les informations de l'épreuve et les PDF, conseil de méthode, contenu
 * (une résolution par question, généralement des ExerciseBlock), retour.
 */
export function ExamSolutionShell({ examId, children }: { examId: string; children: ReactNode }) {
  const { course } = useCourse();
  const exam = mockExams.find((e) => e.id === examId);
  if (!exam) throw new Error(`Examen inconnu : ${examId}`);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
        <div className="container py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <Link
              to="/$courseSlug/examens"
              params={{ courseSlug: course.slug }}
              className="transition-colors hover:text-white"
            >
              Examens blancs
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-white">{exam.title}</span>
          </nav>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <GraduationCap className="h-4 w-4" aria-hidden />
            Résolution guidée · {course.shortTitle}
          </div>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {exam.title} — comprendre chaque question
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Chaque question est décortiquée pas à pas : la méthode, pourquoi elle s'applique, le
            calcul détaillé, les pièges — avec, pour chaque question, la théorie à relire et les TP
            pour s'entraîner.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <AlarmClock className="h-3.5 w-3.5" aria-hidden /> {exam.duration}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              /{exam.totalPoints} pts · {exam.questionCount} questions
            </span>
            <a
              href={examPdfUrl(exam.id, "enonce")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-white/35"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden /> Énoncé PDF
            </a>
            <a
              href={examPdfUrl(exam.id, "corrige")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 backdrop-blur-sm transition-colors hover:bg-white/35"
            >
              <FileCheck2 className="h-3.5 w-3.5" aria-hidden /> Corrigé PDF
            </a>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl py-8 sm:py-10">
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div className="text-sm leading-relaxed text-amber-900">
            <strong>Le bon usage de cette page :</strong> fais d'abord l'examen en conditions
            réelles (PDF imprimé, minuteur). Reviens ensuite ici pour comprendre{" "}
            <em>en profondeur</em> chaque question : révèle les étapes une à une, compare avec ta
            copie, et si une étape résiste, ouvre la théorie liée puis refais le TP conseillé.
          </div>
        </div>

        {children}

        <div className="mt-10 flex justify-center">
          <Link
            to="/$courseSlug/examens"
            params={{ courseSlug: course.slug }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tous les examens blancs
          </Link>
        </div>
      </main>
    </div>
  );
}
