/*
 * Chapitre B2 — petits composants de mise en page partagés par
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
  ContractLab,
  EffortExplorer,
  GameTreeTimeline,
  MasteryChecklist,
  PayoffComparison,
  PollIntuition,
  QuizDiagnostic,
  RiskAversionFigure,
  SurplusExplorer,
} from "./interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
export function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Grille de cartes de vocabulaire (les .vocab de la source). */
export function VocabGrid({
  items,
}: {
  items: Array<{
    term: ReactNode;
    tag?: ReactNode;
    tagTone?: "principal" | "agent";
    body: ReactNode;
  }>;
}) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold">
            {it.term}
            {it.tag ? (
              <span
                className={
                  it.tagTone === "agent"
                    ? "ml-2 rounded-full bg-sky-100 px-2 py-0.5 align-middle text-[10.5px] font-bold uppercase tracking-wide text-sky-800"
                    : "ml-2 rounded-full bg-rose-100 px-2 py-0.5 align-middle text-[10.5px] font-bold uppercase tracking-wide text-rose-800"
                }
              >
                {it.tag}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Résolution numérotée pas à pas (les .steps de la source). */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="my-4 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="relative rounded-xl border bg-card py-3 pl-14 pr-4 shadow-sm">
          <span className="absolute left-4 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-extrabold text-background">
            {i + 1}
          </span>
          <div className="course-prose text-[15px]">{it}</div>
        </li>
      ))}
    </ol>
  );
}

/** Légende des symboles du chapitre (les 5 couleurs de la source). */
export function SymbolLegend() {
  const items = [
    {
      glyph: "e",
      color: "text-sky-700",
      name: "L'effort",
      desc: "choisi par l'agent = nombre de clients visités. Invisible pour le principal.",
    },
    {
      glyph: "x",
      color: "text-violet-700",
      name: "Le bruit (la chance)",
      desc: "variable aléatoire non contrôlée, de moyenne nulle : E(x) = 0. Invisible aussi.",
    },
    {
      glyph: "z",
      color: "text-emerald-700",
      name: "Le résultat",
      desc: "les licences vendues. La seule chose que tout le monde observe.",
    },
    {
      glyph: "w",
      color: "text-amber-700",
      name: "Le salaire",
      desc: "payé par le principal à l'agent. Ne peut dépendre que de z.",
    },
    {
      glyph: "α, β",
      color: "text-rose-700",
      name: "Les leviers du contrat",
      desc: "α = partie fixe du salaire, β = taux de bonus. C'est ce que le principal choisit.",
    },
  ];
  return (
    <div className="my-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.name} className="flex items-start gap-3 rounded-xl border bg-card px-3.5 py-3 shadow-sm">
          <span className={`min-w-[2rem] pt-0.5 text-center font-serif text-xl italic ${it.color}`}>
            {it.glyph}
          </span>
          <span>
            <span className={`block text-[14px] font-bold ${it.color}`}>{it.name}</span>
            <span className="block text-[12.5px] leading-snug text-muted-foreground">{it.desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Le face-à-face principal / agent du héros de la source. */
export function PrincipalAgentDiagram() {
  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 rounded-2xl border bg-card px-5 py-5 shadow-sm">
      <div className="flex min-w-[8.5rem] flex-col items-center gap-1 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-2xl">
          <span aria-hidden>🏢</span>
        </div>
        <span className="text-sm font-bold">Le principal</span>
        <span className="text-xs text-muted-foreground">l'entreprise · propose le contrat</span>
      </div>
      <div className="flex flex-col gap-1.5 text-center text-[13px] text-muted-foreground">
        <span className="rounded-full border border-dashed bg-muted/50 px-4 py-1">
          contrat <M tex="w(z)" /> →
        </span>
        <span className="rounded-full border border-dashed bg-muted/50 px-4 py-1">
          ← effort <M tex="e" /> (invisible !)
        </span>
      </div>
      <div className="flex min-w-[8.5rem] flex-col items-center gap-1 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-2xl">
          <span aria-hidden>💼</span>
        </div>
        <span className="text-sm font-bold">L'agent</span>
        <span className="text-xs text-muted-foreground">le commercial · choisit son effort</span>
      </div>
    </div>
  );
}

/** Tableau récapitulatif avec défilement horizontal sur mobile. */
export function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[560px] border-collapse text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground"
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
                <td key={j} className="px-3.5 py-2.5 text-center align-middle">
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

/** Cellule mise en évidence dans le tableau récapitulatif. */
export function Hl({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-950">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */
