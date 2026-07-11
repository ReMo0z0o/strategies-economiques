import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, Eye, ListChecks, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { markExerciseDone, registerExercise, scopedKey, useProgress } from "@/lib/progress";
import { TheoryRefList, type TheoryRefSpec } from "@/components/course/TheoryRef";
import { useCourseOptional } from "@/components/course/CourseContext";

export interface SolutionStep {
  /** titre court de l'étape, ex. "Poser la contrainte de budget" */
  title: ReactNode;
  content: ReactNode;
  /** liens vers la théorie mobilisée par cette étape */
  refs?: TheoryRefSpec[];
}

export interface ExerciseBlockProps {
  /** scope de progression, ex. "tp1" */
  scope: string;
  /** id unique dans la séance, ex. "ex1" */
  id: string;
  number: number | string;
  title: ReactNode;
  difficulty?: 1 | 2 | 3;
  /** théorie couverte par l'exercice entier */
  refs?: TheoryRefSpec[];
  /** énoncé (fidèle au PDF, éventuellement reformulé pour l'écran) */
  statement: ReactNode;
  /** résolution guidée, étape par étape */
  steps: SolutionStep[];
  /** encadré final : résultat + ce qu'il faut retenir */
  result?: ReactNode;
  className?: string;
}

const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Échauffement",
  2: "Niveau examen",
  3: "Pour aller plus loin",
};

export function ExerciseBlock({
  scope,
  id,
  number,
  title,
  difficulty,
  refs,
  statement,
  steps,
  result,
  className,
}: ExerciseBlockProps) {
  const [revealed, setRevealed] = useState(0);
  const progress = useProgress();
  // Scope préfixé par le cours courant, pour cloisonner la progression.
  const courseCtx = useCourseOptional();
  const fullScope = courseCtx ? scopedKey(courseCtx.courseId, scope) : scope;
  const done = (progress.doneExercises[fullScope] ?? []).includes(id);
  const allRevealed = revealed >= steps.length;

  useEffect(() => {
    registerExercise(fullScope, id);
  }, [fullScope, id]);

  useEffect(() => {
    if (allRevealed && steps.length > 0) markExerciseDone(fullScope, id);
  }, [allRevealed, fullScope, id, steps.length]);

  return (
    <article
      id={id}
      className={cn(
        "my-8 scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm",
        done && "border-success/40",
        className,
      )}
    >
      {/* En-tête */}
      <header className="border-b bg-muted/50 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[15px] font-extrabold text-primary-foreground">
            {number}
          </span>
          <h2 className="min-w-0 flex-1 text-lg font-bold leading-snug sm:text-xl">{title}</h2>
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Terminé
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {difficulty ? (
            <span className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {"●".repeat(difficulty)}
              {"○".repeat(3 - difficulty)} {DIFFICULTY_LABELS[difficulty]}
            </span>
          ) : null}
          {refs ? <TheoryRefList refs={refs} /> : null}
        </div>
      </header>

      {/* Énoncé */}
      <div className="border-b px-4 py-4 sm:px-6">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Target className="h-3.5 w-3.5" aria-hidden /> Énoncé
        </div>
        <div className="course-prose text-[15px]">{statement}</div>
      </div>

      {/* Résolution guidée */}
      <div className="px-4 py-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" aria-hidden />
            Résolution guidée · {Math.min(revealed, steps.length)}/{steps.length} étapes
          </div>
          <div className="flex items-center gap-2">
            {revealed > 0 ? (
              <button
                type="button"
                onClick={() => setRevealed(0)}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-3 w-3" aria-hidden /> Recommencer
              </button>
            ) : null}
            {!allRevealed ? (
              <button
                type="button"
                onClick={() => setRevealed(steps.length)}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                <Eye className="h-3 w-3" aria-hidden /> Tout afficher
              </button>
            ) : null}
          </div>
        </div>

        {revealed === 0 ? (
          <p className="mb-3 rounded-xl bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
            💪 <strong>Essaie d'abord par toi-même</strong> avec une feuille de brouillon, puis
            révèle les étapes une à une pour comparer avec ta démarche.
          </p>
        ) : null}

        <ol className="space-y-3">
          {steps.slice(0, revealed).map((step, i) => (
            <li
              key={i}
              className="rounded-xl border bg-background p-4 animate-in fade-in slide-in-from-bottom-2 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-secondary-foreground">
                  {i + 1}
                </span>
                <h3 className="min-w-0 flex-1 text-[15px] font-bold">{step.title}</h3>
                {step.refs ? <TheoryRefList refs={step.refs} /> : null}
              </div>
              <div className="course-prose mt-2.5 text-[15px]">{step.content}</div>
            </li>
          ))}
        </ol>

        {!allRevealed ? (
          <button
            type="button"
            onClick={() => setRevealed((r) => r + 1)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-accent/40 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-accent"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
            {revealed === 0 ? "Commencer la résolution" : `Étape suivante (${revealed + 1}/${steps.length})`}
          </button>
        ) : result ? (
          <div className="mt-4 rounded-xl border border-success/40 bg-emerald-50 px-4 py-4 animate-in fade-in slide-in-from-bottom-2 sm:px-5">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Résultat & à retenir
            </div>
            <div className="course-prose text-[15px] text-emerald-950">{result}</div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-question numérotée à l'intérieur d'une étape (ex. « 2.3 »)     */
/* ------------------------------------------------------------------ */

export function SubQuestion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="my-3 rounded-lg border-l-4 border-primary/50 bg-muted/50 px-4 py-2.5">
      <span className="mr-2 font-bold text-primary">{label}</span>
      <span>{children}</span>
    </div>
  );
}
