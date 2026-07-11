import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleHelp, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { recordQuizResult, registerQuiz, scopedKey } from "@/lib/progress";
import { useCourseOptional } from "@/components/course/CourseContext";

export interface QuizOption {
  text: ReactNode;
  correct?: boolean;
  /** explication affichée pour cette option après vérification */
  explain?: ReactNode;
}

export interface QuizProps {
  /** scope de progression : id du chapitre ("a1") ou de la séance ("tp1") */
  scope: string;
  /** id unique du quiz dans ce scope, ex. "q1" */
  id: string;
  question: ReactNode;
  options: QuizOption[];
  /** plusieurs bonnes réponses à cocher (par défaut : choix unique) */
  multi?: boolean;
  /** explication générale affichée après vérification */
  explanation?: ReactNode;
  /** libellé de contexte, ex. "Vérifie ta compréhension" */
  kicker?: string;
  className?: string;
}

export function Quiz({
  scope,
  id,
  question,
  options,
  multi = false,
  explanation,
  kicker = "Vérifie ta compréhension",
  className,
}: QuizProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  // Scope préfixé par le cours courant, pour cloisonner la progression.
  const courseCtx = useCourseOptional();
  const fullScope = courseCtx ? scopedKey(courseCtx.courseId, scope) : scope;

  useEffect(() => {
    registerQuiz(fullScope, id);
  }, [fullScope, id]);

  const correctSet = useMemo(
    () => new Set(options.flatMap((o, i) => (o.correct ? [i] : []))),
    [options],
  );

  const isCorrect =
    checked &&
    selected.size === correctSet.size &&
    [...selected].every((i) => correctSet.has(i));

  function toggle(i: number) {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(multi ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function check() {
    if (selected.size === 0) return;
    const ok =
      selected.size === correctSet.size && [...selected].every((i) => correctSet.has(i));
    recordQuizResult(fullScope, id, ok);
    setChecked(true);
  }

  function retry() {
    setSelected(new Set());
    setChecked(false);
  }

  return (
    <div
      className={cn(
        "my-6 rounded-2xl border-2 bg-card p-4 shadow-sm sm:p-5",
        checked
          ? isCorrect
            ? "border-success/40"
            : "border-destructive/30"
          : "border-border",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <CircleHelp className="h-4 w-4" aria-hidden />
        {kicker}
        {multi ? <span className="font-medium normal-case text-muted-foreground">· plusieurs réponses possibles</span> : null}
      </div>
      <div className="course-prose mt-2 font-medium">{question}</div>

      <div className="mt-3 grid gap-2">
        {options.map((opt, i) => {
          const isSel = selected.has(i);
          const showCorrect = checked && Boolean(opt.correct);
          const showWrongSel = checked && isSel && !opt.correct;
          return (
            <div key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                disabled={checked}
                aria-pressed={isSel}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-2.5 text-left text-[15px] leading-relaxed transition-colors",
                  !checked && "hover:border-primary/50 hover:bg-accent/50",
                  !checked && isSel && "border-primary bg-accent ring-1 ring-primary",
                  checked && showCorrect && "border-success/60 bg-emerald-50 text-emerald-900",
                  checked && showWrongSel && "border-destructive/50 bg-rose-50 text-rose-900",
                  checked && !showCorrect && !showWrongSel && "opacity-60",
                )}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                      !checked && isSel
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 text-muted-foreground",
                      checked && showCorrect && "border-success bg-success text-success-foreground",
                      checked && showWrongSel && "border-destructive bg-destructive text-destructive-foreground",
                    )}
                  >
                    {checked && showCorrect ? "✓" : checked && showWrongSel ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt.text}</span>
                </span>
              </button>
              {checked && (isSel || opt.correct) && opt.explain ? (
                <div className="mt-1 rounded-lg bg-muted px-3.5 py-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
                  {opt.explain}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={check}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Vérifier ma réponse
          </button>
        ) : (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-bold",
                isCorrect ? "text-success" : "text-destructive",
              )}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> Bonne réponse !
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" aria-hidden /> Pas tout à fait…
                </>
              )}
            </span>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Réessayer
            </button>
          </>
        )}
      </div>

      {checked && explanation ? (
        <div className="course-prose mt-3 rounded-xl border border-border bg-muted/60 px-4 py-3 text-[15px] animate-in fade-in slide-in-from-top-1">
          {explanation}
        </div>
      ) : null}
    </div>
  );
}
