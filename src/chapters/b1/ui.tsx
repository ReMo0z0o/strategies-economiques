/*
 * Chapitre B1 — petits composants de mise en page partagés par
 * les différentes parties du chapitre.
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  ConvergenceBars,
  GuessTwoThirds,
  IteratedElimination,
  MasteryChecklist,
  MatrixExplorer,
  NashHunter,
  PenaltyExplorer,
  PoliceMafia,
  PollPrisoner,
} from "./interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
export function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Tableau simple avec défilement horizontal sur mobile. */
export function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[520px] border-collapse text-[15px]">
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

/** Grille de mini-cartes (l'équivalent des « minicards » de la source). */
export function CardGrid({
  items,
}: {
  items: Array<{ tag?: ReactNode; title: ReactNode; body: ReactNode; extra?: ReactNode }>;
}) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          {it.tag ? (
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              {it.tag}
            </div>
          ) : null}
          <div className="text-[15px] font-bold">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
          {it.extra ? (
            <div className="mt-2 border-t pt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {it.extra}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Liste numérotée « à maîtriser absolument ». */
export function MustKnow({ items }: { items: ReactNode[] }) {
  return (
    <ul className="my-3 space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-xl border bg-card px-4 py-2.5 text-[15px] leading-relaxed shadow-sm"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
            {i + 1}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Matrice de jeu à payoffs symboliques (m(1+r), min(g, m), 3−t…) : même
 * mise en page que PayoffMatrix, mais chaque case est un ReactNode.
 */
export function SymbolicMatrix({
  rowPlayer,
  colPlayer,
  rows,
  cols,
  cells,
  caption,
}: {
  rowPlayer: string;
  colPlayer: string;
  rows: ReactNode[];
  cols: ReactNode[];
  /** cells[r][c] = [payoff joueur ligne, payoff joueur colonne] */
  cells: Array<Array<[ReactNode, ReactNode]>>;
  caption?: ReactNode;
}) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto">
        <div className="inline-block rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-sky-700">
            {colPlayer}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 text-xs font-bold uppercase tracking-wider text-rose-700"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {rowPlayer}
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {cols.map((c, j) => (
                    <th
                      key={j}
                      className="min-w-[6.5rem] p-1.5 text-center text-sm font-semibold text-sky-700"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rLabel, r) => (
                  <tr key={r}>
                    <th className="p-1.5 pr-2 text-right text-sm font-semibold text-rose-700">
                      {rLabel}
                    </th>
                    {cols.map((_, c) => (
                      <td key={c} className="p-1">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-border bg-background px-3 py-2.5 text-[14.5px]">
                          <span className="font-semibold text-rose-700">{cells[r][c][0]}</span>
                          <span className="text-muted-foreground">;</span>
                          <span className="font-semibold text-sky-700">{cells[r][c][1]}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
