/*
 * Chapitre B3 — petits composants de mise en page partagés par
 * les différentes parties du chapitre.
 */

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  FestivalSimulator,
  GeneralThreshold,
  GeometricSeriesExplorer,
  MasteryChecklist,
  PollTwoDays,
  ThresholdDuel,
  TwoPeriodExplorer,
} from "./interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
export function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Raisonnement pas à pas (les « steps » numérotés de la source). */
export function Steps({ items, labels }: { items: ReactNode[]; labels?: string[] }) {
  return (
    <div className="my-4 space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
            {labels?.[i] ?? i + 1}
          </span>
          <div className="min-w-0 text-[15px] leading-relaxed">{it}</div>
        </div>
      ))}
    </div>
  );
}

/** Grille de mini-cartes vocabulaire (les « vocab cards » de la source). */
export function CardGrid({ items }: { items: Array<{ title: ReactNode; body: ReactNode }> }) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold text-sky-800">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Frise des périodes affichée dans le hero (jour 0 → 1 → 2 → t → t+1 → ∞ ?). */
export function PeriodStrip() {
  const days = ["0", "1", "2", "t", "t+1"];
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2 font-mono" aria-hidden>
      {days.map((d) => (
        <Fragment key={d}>
          <div
            className={cn(
              "flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-[10px] text-white/80",
              d === "t" ? "border-amber-300 bg-white/25" : "border-white/30 bg-white/10",
            )}
          >
            <span>jour</span>
            <b className="text-sm text-white">{d}</b>
          </div>
          <span className="text-white/50">→</span>
        </Fragment>
      ))}
      <span className="text-2xl font-extrabold text-amber-300">∞ ?</span>
    </div>
  );
}

/** Déroulé du jeu à deux périodes (la « timeline » de la source). */
export function TwoPeriodTimeline() {
  return (
    <div
      className="my-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
      aria-label="déroulement du jeu à deux périodes"
    >
      <div className="flex-1 rounded-xl border bg-card p-3.5 text-sm leading-relaxed shadow-sm">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">
          Période 0
        </div>
        Chaque fritkot choisit son prix (simultanément). Puis chacun <strong>observe</strong> le
        choix de l'autre, et les payoffs du jour tombent.
      </div>
      <div className="self-center text-xl text-muted-foreground" aria-hidden>
        →
      </div>
      <div className="flex-1 rounded-xl border bg-card p-3.5 text-sm leading-relaxed shadow-sm">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">
          Période 1
        </div>
        Rebelote : chacun choisit son prix — en connaissant ce qui s'est passé en période 0.
        Observation, payoffs, <strong>fin du jeu</strong>.
      </div>
    </div>
  );
}

/** L'effondrement en dominos de la backward induction (§ 4). */
export function UnravelStrip() {
  const cells: Array<{ top: string; mid: string; bot: string; hot?: boolean }> = [
    { top: "période", mid: "0", bot: "T…" },
    { top: "période", mid: "1", bot: "T…" },
    { top: "…", mid: "…", bot: "" },
    { top: "période", mid: "N−1", bot: "T !" },
    { top: "dernière", mid: "N", bot: "T !!", hot: true },
  ];
  return (
    <div
      className="my-6 flex flex-wrap items-center justify-center gap-2 font-mono"
      aria-label="effondrement de la coopération par backward induction, de la dernière période vers la première"
    >
      {cells.map((c, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className="text-xl font-bold text-rose-600" aria-hidden>
              ←
            </span>
          ) : null}
          <div
            className={cn(
              "flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-[10px] text-muted-foreground",
              c.hot ? "border-rose-400 bg-rose-50" : "border-border bg-card",
            )}
          >
            <span>{c.top}</span>
            <b className="text-[15px] text-foreground">{c.mid}</b>
            <span className="font-bold text-rose-600">{c.bot}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Tableau des trois options du joueur 2 à deux périodes (§ 3). */
export function ThreeOptionsTable() {
  const mark = "bg-amber-100/80 font-bold";
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[540px] border-collapse text-center text-[14.5px]">
        <thead>
          <tr className="bg-muted/60 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2.5 text-left">
              Stratégie du <span className="text-sky-700">joueur 2</span>
            </th>
            <th className="px-3 py-2.5">période 0</th>
            <th className="px-3 py-2.5">période 1</th>
            <th className="px-3 py-2.5">
              Payoff <M tex="\Pi_2" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2.5 text-left">
              grim <M tex="s_2^{G}" /> (coopère, coopère)
            </td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">C → 4</td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">C → 4</td>
            <td className="px-3 py-2.5">
              <M tex="4 + 4\delta" />
            </td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2.5 text-left">
              trahir les deux périodes (<M tex="s_2" />)
            </td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">T → 6</td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">T → 2</td>
            <td className="px-3 py-2.5">
              <M tex="6 + 2\delta" />
            </td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2.5 text-left">
              coopérer puis trahir (<M tex="s_2'" />)
            </td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">C → 4</td>
            <td className={cn("px-3 py-2.5 text-sky-700", mark)}>T → 6</td>
            <td className={cn("px-3 py-2.5", mark)}>
              <M tex="4 + 6\delta" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Le « film » de la déviation contre grim à horizon infini (§ 7). */
export function DeviationFilmTable() {
  const head = ["période", "0", "…", "t−1", "t", "t+1", "…"];
  const mark = "bg-amber-100/80 font-bold";
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[540px] border-collapse text-center font-mono text-[13.5px]">
        <thead>
          <tr className="bg-muted/60 font-sans text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-rose-700">
              Action 1 (grim)
            </td>
            {["C", "C", "C", "C", "T", "T"].map((a, i) => (
              <td key={i} className="px-3 py-2 font-bold text-rose-700">
                {a}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-sky-700">
              Action 2 (dévie)
            </td>
            {["C", "C", "C", "T", "T", "T"].map((a, i) => (
              <td key={i} className={cn("px-3 py-2 font-bold text-sky-700", i === 3 && mark)}>
                {a}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-muted-foreground">
              π de 1
            </td>
            {["4", "4", "4", "0", "2", "2"].map((a, i) => (
              <td key={i} className="px-3 py-2">
                {a}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-muted-foreground">
              π de 2
            </td>
            {["4", "4", "4", "6", "2", "2"].map((a, i) => (
              <td key={i} className={cn("px-3 py-2", i === 3 && mark)}>
                {a}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */
