/*
 * Chapitre A3 — petits composants de mise en page partagés par
 * les différentes parties du chapitre.
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  DecisionTree,
  MasteryChecklist,
  PollCard,
  WidgetChordCurve,
  WidgetInsurance,
  WidgetInvest,
  WidgetProspect,
  WidgetRepeatBet,
  WidgetVMA,
} from "./widgets";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-xl font-bold tracking-tight">{children}</h3>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

export function Tbl({ children, minW = 540 }: { children: ReactNode; minW?: number }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14.5px]" style={{ minWidth: minW }}>
        {children}
      </table>
    </div>
  );
}

export const TH =
  "border-b bg-muted/70 px-3.5 py-2.5 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
export const TD = "border-b px-3.5 py-2.5 align-top";
export const TDnum = "border-b px-3.5 py-2.5 align-top text-right tabular-nums";

/* ================================================================== */
/* Page du chapitre                                                    */
/* ================================================================== */
