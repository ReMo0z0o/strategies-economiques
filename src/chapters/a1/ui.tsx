/*
 * Chapitre A1 — petits composants de mise en page partagés par
 * les différentes parties du chapitre.
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import {
  BudgetExplorer,
  LaborSupplyExplorer,
  LafferExplorer,
} from "./interactives";
import {
  Figure,
  FigMethode,
  FigIndiff,
  FigCarte,
} from "./figures";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h4 de la source). */
export function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Tableau simple avec défilement horizontal sur mobile. */
export function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[480px] border-collapse text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className="px-3.5 py-2.5 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Grille de mini-cartes (l'équivalent du « recap-grid » de la source). */
export function CardGrid({ items }: { items: Array<{ title: ReactNode; body: ReactNode }> }) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold text-primary">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Liste « à maîtriser absolument » : pastille numérotée + contenu. */
export function MustKnow({ items, start = 1 }: { items: ReactNode[]; start?: number }) {
  return (
    <ul className="my-4 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 rounded-xl border bg-card px-4 py-3 text-[15px] leading-relaxed shadow-sm">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
            {start + i}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */
