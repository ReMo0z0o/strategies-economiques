/*
 * LabGames — B1 · comportements en laboratoire (slides 38-46).
 *
 * Un onglet par jeu joué en labo : jeu X/Y (slide 38), dilemme du prisonnier
 * (slide 39), jeu Haut/Bas (slides 40 et 42), jeu 3 × 3 (slide 41), bataille des
 * sexes répétée (slides 43-45). Pour chacun : la matrice du PNG, l'hypothèse
 * testée (H1, H2.1, H3), ce que prédit la théorie, ce qu'ont fait les étudiants,
 * et le verdict.
 *  - Haut/Bas : curseur q = part des P2 qui jouent Droite. Payoffs espérés de
 *    P1 : E[Haut] = 3(1 − q), E[Bas] = 1 + 4q ; égaux en q = 2/7 ≈ 28,6 %.
 *    À q = 12 % (observé, slide 42) : 2,64 et 1,48 = les payoffs moyens du slide.
 *  - Bataille des sexes : tableau du slide 45, rounds 1 → 4. Les « payoffs »
 *    du tableau valent (aux arrondis près) le payoff espéré face aux choix
 *    observés de l'autre camp : Viande ≈ 4 × %Rouge, Poisson ≈ 2 × %Blanc,
 *    Rouge ≈ 2 × %Viande, Blanc ≈ 4 × %Poisson (vérifié en Python).
 * Tous les chiffres viennent des PNG des slides 38 à 46.
 */
import { useEffect, useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M, MB } from "@/components/course/Math";
import { C, Frame, curvePath, fmt, makePlot } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const HALO = "var(--color-card)";

type Tab = "xy" | "dp" | "hb" | "g3" | "bds";
const TABS: Array<{ value: Tab; label: string }> = [
  { value: "xy", label: "Jeu X/Y" },
  { value: "dp", label: "Dilemme du prisonnier" },
  { value: "hb", label: "Haut/Bas" },
  { value: "g3", label: "Jeu 3 × 3" },
  { value: "bds", label: "Bataille des sexes" },
];

function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** « 0,88 » → « 0{,}88 » pour KaTeX */
function tex(v: number, d = 3): string {
  return fmt(v, d).replace(",", "{,}");
}

/* ------------------------------------------------------------------ */
/* Petits composants                                                   */
/* ------------------------------------------------------------------ */

type Pay = readonly [number, number];
type Tone = "good" | "bad" | "info";

/** matrice compacte ; notes sous les en-têtes, lignes/colonnes mises en valeur */
function LabMatrix({
  p1,
  p2,
  rows,
  cols,
  pay,
  rowNotes = {},
  colNotes = {},
  rowTone = {},
  colTone = {},
  gold = [],
  caption,
}: {
  p1: string;
  p2: string;
  rows: string[];
  cols: string[];
  pay: Pay[][];
  rowNotes?: Record<number, ReactNode>;
  colNotes?: Record<number, ReactNode>;
  rowTone?: Record<number, Tone>;
  colTone?: Record<number, Tone>;
  gold?: Array<readonly [number, number]>;
  caption?: ReactNode;
}) {
  const toneCls = (t: Tone | undefined) =>
    t === "good"
      ? "border-emerald-500/70 bg-emerald-500/12"
      : t === "bad"
        ? "border-rose-400/70 bg-rose-500/10"
        : t === "info"
          ? "border-amber-400/80 bg-amber-400/10"
          : "border-border bg-background";
  return (
    <figure className="min-w-0">
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-[14px]">
          <thead>
            <tr>
              <th className="p-1 text-left align-bottom text-[11px] font-bold uppercase leading-tight tracking-wide text-rose-700 dark:text-rose-400">
                {p1} ↓
              </th>
              <th
                colSpan={cols.length}
                className="p-1 text-center text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400"
              >
                {p2} →
              </th>
            </tr>
            <tr>
              <th className="p-1" />
              {cols.map((c, j) => (
                <th key={c + j} className="px-1 py-1 text-center align-top font-semibold text-sky-700 dark:text-sky-400">
                  {c}
                  {colNotes[j] ? (
                    <div className="text-[11px] font-semibold leading-tight text-muted-foreground">{colNotes[j]}</div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rl, r) => (
              <tr key={rl + r}>
                <th className="px-1.5 py-1 text-right align-middle font-semibold text-rose-700 dark:text-rose-400">
                  {rl}
                  {rowNotes[r] ? (
                    <div className="text-[11px] font-semibold leading-tight text-muted-foreground">{rowNotes[r]}</div>
                  ) : null}
                </th>
                {cols.map((_, c) => {
                  const isGold = gold.some(([gr, gc]) => gr === r && gc === c);
                  const t = rowTone[r] ?? colTone[c];
                  return (
                    <td key={c} className="p-0.5">
                      <div
                        className={cn(
                          "min-w-[4.2rem] whitespace-nowrap rounded-lg border-2 px-2 py-1.5 text-center tabular-nums",
                          isGold ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,158,11,0.18)] dark:bg-amber-950/40" : toneCls(t),
                        )}
                      >
                        <span className="font-semibold text-rose-700 dark:text-rose-400">{pay[r][c][0]}</span>
                        <span className="text-muted-foreground"> ; </span>
                        <span className="font-semibold text-sky-700 dark:text-sky-400">{pay[r][c][1]}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="mx-auto mt-2 max-w-sm text-center text-[12.5px] leading-snug text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

function HypBadge({ h, slide }: { h: string; slide: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-2.5 py-0.5 text-[12.5px] font-bold text-accent-foreground">
      {h}
      <span className="font-normal text-muted-foreground">· {slide}</span>
    </span>
  );
}

/** barre « labo » (remplie en douceur) avec repère pointillé de la prédiction */
function TheoryBar({
  label,
  observed,
  theory,
  color,
}: {
  label: ReactNode;
  observed: number;
  theory: number;
  color: string;
}) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setFilled(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, []);
  return (
    <div className="my-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[13.5px]">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          théorie : <strong className="text-foreground">{theory} %</strong> · labo :{" "}
          <strong className="text-foreground">{observed} %</strong>
        </span>
      </div>
      <div className="relative mt-1 h-5 overflow-hidden rounded-full border bg-background">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: filled ? `${observed}%` : "0%", background: color }}
        />
        <div
          className="absolute inset-y-0 border-l-2 border-dashed border-foreground/70"
          style={{ left: `calc(${theory}% - ${theory >= 100 ? 2 : 0}px)` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function Verdict({ tone, title, children }: { tone: "ok" | "mixed" | "ko"; title: ReactNode; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-3 rounded-xl border px-3.5 py-2.5 text-[14px] leading-relaxed",
        tone === "ok" && "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30",
        tone === "mixed" && "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
        tone === "ko" && "border-rose-300 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30",
      )}
    >
      <div className="font-bold">{title}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function Statement({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[14.5px] leading-relaxed">{children}</p>;
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="mt-4 grid gap-4 md:grid-cols-2 md:items-start">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* 1. Jeu X/Y — slide 38                                               */
/* ------------------------------------------------------------------ */

function TabXY() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <HypBadge h="H1" slide="slide 38" />
      </div>
      <Statement>
        <strong>H1 : les joueurs sont rationnels</strong> ⇒ ils utilisent leur stratégie dominante
        lorsqu'ils en ont une.
      </Statement>
      <Panel>
        <LabMatrix
          p1="P1"
          p2="P2"
          rows={["X", "Y"]}
          cols={["X", "Y"]}
          pay={[
            [[1, 1], [0, 3]],
            [[3, 0], [2, 2]],
          ]}
          rowTone={{ 1: "good" }}
          rowNotes={{ 1: "dominante" }}
          caption="Matrice du slide 38."
        />
        <div className="min-w-0">
          <p className="text-[14px] leading-relaxed">
            Pour P1, <strong>Y est dominante</strong> : face à X, Y rapporte 3 &gt; 1 ; face à Y, Y
            rapporte 2 &gt; 0. Quoi que fasse P2, Y est le meilleur choix.
          </p>
          <TheoryBar label="P1 qui ont joué Y" observed={87} theory={100} color={C.green} />
        </div>
      </Panel>
      <Verdict tone="mixed" title="Verdict : H1 décrit bien la grande majorité… mais pas tout le monde.">
        87 % des étudiants ont joué leur stratégie dominante, mais 13 % ne l'ont pas fait (slide 38).
      </Verdict>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Dilemme du prisonnier — slide 39                                 */
/* ------------------------------------------------------------------ */

function TabDP() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <HypBadge h="H1" slide="slide 39" />
      </div>
      <Statement>
        <strong>H1</strong> ⇒ dans le dilemme du prisonnier, tous les joueurs utilisent leur stratégie
        dominante : <strong>trahir</strong>.
      </Statement>
      <Panel>
        <LabMatrix
          p1="Pays 1"
          p2="Pays 2"
          rows={["Coopérer", "Trahir"]}
          cols={["Coopérer", "Trahir"]}
          pay={[
            [[2, 2], [0, 3]],
            [[3, 0], [1, 1]],
          ]}
          rowTone={{ 1: "good" }}
          rowNotes={{ 1: "dominante" }}
          colNotes={{ 1: "dominante" }}
          caption="Matrice du cours (slide 17 ; mêmes payoffs que Nier/Confesser au slide 14). Le slide 39 ne redonne pas la matrice jouée en labo."
        />
        <div className="min-w-0">
          <TheoryBar label="Étudiants qui ont trahi" observed={96} theory={100} color={C.green} />
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-xl border bg-card px-3 py-2.5 text-[13.5px] leading-relaxed">
              <div className="font-bold">Raisonnement individuel (H1)</div>
              Si l'autre coopère, trahir rapporte 3 &gt; 2. S'il trahit, trahir rapporte 1 &gt; 0.
              Quoi que fasse l'autre, <strong>trahir rapporte plus</strong>.
            </div>
            <div className="rounded-xl border bg-card px-3 py-2.5 text-[13.5px] leading-relaxed">
              <div className="font-bold">Raisonnement « kantien » (J. Roemer)</div>
              On juge une stratégie par ce qu'elle rapporterait <em>si tout le monde l'adoptait</em> :
              tous coopèrent → 2 chacun ; tous trahissent → 1 chacun. Donc on coopère.
            </div>
          </div>
        </div>
      </Panel>
      <Verdict tone="mixed" title="Verdict : H1 tient pour 96 %, pas pour 100 %.">
        Le raisonnement kantien est rationnel du point de vue du groupe, mais pas au niveau
        individuel : un joueur maximise toujours son payoff en trahissant. La rationalité
        individuelle n'est donc pas le seul principe qui guide les décisions : des considérations
        d'ordre moral peuvent aussi influencer les comportements (slide 39).
      </Verdict>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Haut/Bas — slides 40 et 42, avec le curseur de croyance          */
/* ------------------------------------------------------------------ */

const Q_STAR = 2 / 7;
const Q_LAB = 0.12;
const eHaut = (q: number) => 3 * (1 - q);
const eBas = (q: number) => 1 * (1 - q) + 5 * q;

/** texte SVG avec halo (lisible en clair comme en sombre) */
function Txt({
  x,
  y,
  children,
  color = C.ink,
  anchor = "start",
  size = 12.5,
  weight = 600,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      style={{ fill: color, stroke: HALO }}
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

function BeliefChart({ q }: { q: number }) {
  const p = makePlot({ w: 520, h: 300, pL: 44, pR: 18, pT: 18, pB: 44, x: [0, 1], y: [0, 5] });
  const xs = p.X(Q_STAR);
  const yStar = eHaut(Q_STAR);
  const h = eHaut(q);
  const b = eBas(q);
  const flip = q > 0.72;
  const tie = Math.abs(h - b) < 1e-9;
  const hAbove = h >= b;
  return (
    <svg
      viewBox={`0 0 ${p.w} ${p.h}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: 600 }}
      role="img"
      aria-label={`Payoffs espérés de P1 selon la part q des P2 qui jouent Droite : Haut = 3(1 − q), Bas = 1 + 4q ; égaux en q = 2/7. Curseur : q = ${fmt(q * 100, 1)} %, Haut ${fmt(h, 2)}, Bas ${fmt(b, 2)}.`}
    >
      {/* zones de meilleure réponse */}
      <rect x={p.X(0)} y={p.pT} width={xs - p.X(0)} height={p.h - p.pB - p.pT} style={{ fill: C.blue, fillOpacity: 0.06 }} />
      <rect x={xs} y={p.pT} width={p.X(1) - xs} height={p.h - p.pB - p.pT} style={{ fill: C.gold, fillOpacity: 0.08 }} />
      <Frame
        p={p}
        xticks={[0, 0.25, 0.5, 0.75, 1]}
        yticks={[0, 1, 2, 3, 4, 5]}
        xfmt={(t) => `${fmt(t * 100, 0)} %`}
        xlabel="part des P2 qui jouent Droite (q)"
        ylabel="payoff espéré de P1"
      />
      <Txt x={p.X(0.02)} y={p.Y(4.62)} color={C.blue} size={12.5}>
        Haut meilleur
      </Txt>
      <Txt x={xs + 8} y={p.Y(4.62)} color={C.gold} size={12.5}>
        Bas meilleur
      </Txt>
      {/* repère observé (slide 42) */}
      <line x1={p.X(Q_LAB)} y1={p.Y(0)} x2={p.X(Q_LAB)} y2={p.Y(4.1)} style={{ stroke: C.soft }} strokeWidth={1.4} strokeDasharray="2 4" />
      <Txt x={p.X(Q_LAB) + 4} y={p.Y(3.75)} color={C.soft} size={12}>
        labo : 12 %
      </Txt>
      {/* seuil 2/7 */}
      <line x1={xs} y1={p.Y(0)} x2={xs} y2={p.Y(yStar)} style={{ stroke: C.ink }} strokeWidth={1.3} strokeDasharray="5 4" />
      <Txt x={xs + 5} y={p.Y(0.45)} size={12.5}>
        seuil : q = 2/7 ≈ 28,6 %
      </Txt>
      {/* droites */}
      <path d={curvePath(p, eHaut, 0, 1, 2)} fill="none" style={{ stroke: C.blue }} strokeWidth={3} />
      <path d={curvePath(p, eBas, 0, 1, 2)} fill="none" style={{ stroke: C.gold }} strokeWidth={3} />
      {Math.abs(q - 0.66) > 0.14 ? (
        <>
          <Txt x={p.X(0.66) + 8} y={p.Y(eHaut(0.66)) - 8} color={C.blue}>
            Haut = 3(1 − q)
          </Txt>
          <Txt x={p.X(0.66) - 10} y={p.Y(eBas(0.66)) - 8} color={C.gold} anchor="end">
            Bas = 1 + 4q
          </Txt>
        </>
      ) : null}
      <circle cx={xs} cy={p.Y(yStar)} r={4.5} style={{ fill: C.ink, stroke: HALO }} strokeWidth={1.5} />
      {/* curseur */}
      <line x1={p.X(q)} y1={p.pT + 4} x2={p.X(q)} y2={p.Y(0)} style={{ stroke: C.violet }} strokeWidth={1.6} />
      <circle cx={p.X(q)} cy={p.Y(h)} r={6} style={{ fill: C.blue, stroke: HALO }} strokeWidth={2} />
      <circle cx={p.X(q)} cy={p.Y(b)} r={6} style={{ fill: C.gold, stroke: HALO }} strokeWidth={2} />
      <Txt
        x={p.X(q) + (flip ? -10 : 10)}
        y={p.Y(h) + (tie ? -10 : hAbove ? -8 : 17)}
        color={C.blue}
        anchor={flip ? "end" : "start"}
        size={13}
        weight={700}
      >
        {fmt(h, 2)}
      </Txt>
      <Txt
        x={p.X(q) + (flip ? -10 : 10)}
        y={p.Y(b) + (tie ? 20 : hAbove ? 17 : -8)}
        color={C.gold}
        anchor={flip ? "end" : "start"}
        size={13}
        weight={700}
      >
        {fmt(b, 2)}
      </Txt>
    </svg>
  );
}

function TabHB() {
  const [qPct, setQPct] = useState(12);
  const q = qPct / 100;
  const h = eHaut(q);
  const b = eBas(q);
  const tie = Math.abs(h - b) < 1e-9;
  const best = tie ? "indifférent entre Haut et Bas" : h > b ? "Haut" : "Bas";
  // « = » si tous les nombres affichés (3 décimales) sont exacts, sinon « ≈ »
  const exact = [1 - q, q, h, b].every((v) => Math.abs(Math.round(v * 1000) - v * 1000) < 1e-6);
  const eq = exact ? "=" : "\\approx";
  const presets: Array<{ v: string; label: string; q: number }> = [
    { v: "0", label: "q = 0 % (P2 rationnels)", q: 0 },
    { v: "12", label: "q = 12 % (labo)", q: 12 },
    { v: "seuil", label: "q = 2/7 (seuil)", q: (100 * 2) / 7 },
    { v: "50", label: "q = 50 %", q: 50 },
  ];
  const active = presets.find((pr) => Math.abs(pr.q - qPct) < 1e-6)?.v ?? "";
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <HypBadge h="H1" slide="slide 40" />
        <HypBadge h="H2.1" slide="slide 42" />
      </div>
      <Panel>
        <LabMatrix
          p1="P1"
          p2="P2"
          rows={["Haut", "Bas"]}
          cols={["Gauche", "Droite"]}
          pay={[
            [[3, 3], [0, 2]],
            [[1, 2], [5, 1]],
          ]}
          colTone={{ 1: "bad" }}
          colNotes={{ 1: "dominée · 12 %" }}
          rowNotes={{ 1: "hors PSS · 29 %" }}
          rowTone={{ 1: "info" }}
          caption="Matrice des slides 40 et 42."
        />
        <div className="min-w-0 text-[14px] leading-relaxed">
          <p>
            <strong>① H1 pour P2 (slide 40).</strong> Droite est dominée par Gauche : face à Haut, 3
            &gt; 2 ; face à Bas, 2 &gt; 1. Un P2 rationnel ne joue jamais Droite.
          </p>
          <TheoryBar label="P2 qui ont joué Droite" observed={12} theory={0} color={C.red} />
          <p className="mt-3">
            <strong>② H2.1 pour P1 (slide 42).</strong> Si P1 croit P2 rationnel, il raisonne dans le
            jeu réduit (colonne Gauche) : Haut rapporte 3, Bas 1. Bas est éliminée à l'itération 1 :
            elle n'entre pas dans un PSS.
          </p>
          <TheoryBar label="P1 qui ont joué Bas" observed={29} theory={0} color={C.gold} />
        </div>
      </Panel>

      <div className="mt-5 rounded-xl border bg-card px-3 py-3 sm:px-4">
        <div className="text-[14.5px] font-bold">
          Et si P1 doute de la rationalité de P2 ? Déplace la croyance q
        </div>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          q = part des P2 qui jouent Droite. Chaque droite donne le payoff moyen que P1 peut
          espérer avec Haut ou avec Bas.
        </p>
        <div className="mt-3 grid gap-2.5">
          <SliderControl
            label="Part des P2 qui jouent Droite (q)"
            value={qPct}
            onChange={setQPct}
            min={0}
            max={100}
            step={0.5}
            format={(v) => `${fmt(v, 1)} %`}
          />
          <ChoiceChips<string>
            value={active}
            onChange={(v) => {
              const pr = presets.find((x) => x.v === v);
              if (pr) setQPct(pr.q);
            }}
            options={presets.map((pr) => ({ value: pr.v, label: pr.label }))}
          />
        </div>
        <div className="mt-3">
          <BeliefChart q={q} />
        </div>
        <div className="mt-2 grid gap-1.5 text-[14px] sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-indigo-500/8 px-3 py-2">
            <span className="font-semibold" style={{ color: C.blue }}>
              Haut
            </span>{" "}
            : <M tex={`3\\times${tex(1 - q)}+0\\times${tex(q)}${eq}${tex(h)}`} />
          </div>
          <div className="min-w-0 rounded-lg bg-amber-500/10 px-3 py-2">
            <span className="font-semibold" style={{ color: C.gold }}>
              Bas
            </span>{" "}
            : <M tex={`1\\times${tex(1 - q)}+5\\times${tex(q)}${eq}${tex(b)}`} />
          </div>
        </div>
        <p className="mt-2 text-[14px]">
          Meilleure réponse de P1 : <strong>{best}</strong>
          {qPct === 12 ? " (ce sont exactement les payoffs moyens du slide 42 : 2,64 pour Haut, 1,48 pour Bas)." : "."}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed bg-muted/50 px-4 py-3 text-[14px] leading-relaxed">
        <div className="font-bold">Le calcul pas à pas</div>
        <p className="mt-1">
          Si une part <M tex="q" /> des P2 joue Droite (et <M tex="1-q" /> joue Gauche), P1 gagne en
          moyenne :
        </p>
        <MB tex="E[\text{Haut}]=3\,(1-q)+0\cdot q=3-3q" />
        <MB tex="E[\text{Bas}]=1\cdot(1-q)+5\,q=1+4q" />
        <p>Bas rapporte plus que Haut si et seulement si :</p>
        <MB tex="1+4q>3-3q\iff 7q>2\iff q>\tfrac{2}{7}\approx 28{,}6\,\%" />
        <p>
          Avec les 12 % observés : <M tex="3\times 0{,}88=2{,}64" /> pour Haut et{" "}
          <M tex="1\times 0{,}88+5\times 0{,}12=1{,}48" /> pour Bas.
        </p>
      </div>

      <Verdict tone="ko" title="Verdict : 12 % violent H1 (P2) et 29 % ne respectent pas H2.1 (P1).">
        Pas étonnant : puisque 12 % des P2 jouent la dominée, les P1 ne croient pas forcément que
        les P2 l'évitent (slide 42). Mais même face à ces 12 %, Bas rapportait moins (1,48 contre
        2,64). Bas n'aurait été une meilleure réponse que si plus de 2/7 ≈ 28,6 % des P2 avaient joué
        Droite.
      </Verdict>
      <p className="mt-2 text-[12.5px] text-muted-foreground">
        Ne confonds pas : 29 % est la part des P1 qui ont joué Bas (slide 42) ; 2/7 ≈ 28,6 % est le
        seuil de croyance calculé ci-dessus (il n'est pas sur le slide). Les deux nombres sont
        proches par hasard.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Jeu 3 × 3 — slide 41                                             */
/* ------------------------------------------------------------------ */

function TabG3() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <HypBadge h="H1" slide="slide 41" />
      </div>
      <Statement>
        <strong>H1</strong> ⇒ les joueurs n'utilisent pas de stratégie dominée.
      </Statement>
      <Panel>
        <LabMatrix
          p1="P1"
          p2="P2"
          rows={["H", "M", "B"]}
          cols={["H", "M", "B"]}
          pay={[
            [[2, 2], [1, 0], [1, 2]],
            [[0, 1], [3, 3], [1, 1]],
            [[2, 1], [1, 1], [2, 2]],
          ]}
          rowTone={{ 0: "bad" }}
          rowNotes={{ 0: "dominée par B", 2: "domine H" }}
          caption="Matrice du slide 41 (les stratégies de P2 s'appellent aussi H, M, B)."
        />
        <div className="min-w-0 text-[14px] leading-relaxed">
          <p>
            Pour P1, <strong>H est dominée par B</strong> : face à H, 2 ≥ 2 ; face à M, 1 ≥ 1 ;
            face à B, 2 &gt; 1. Il faut le « ≥ » de la définition du cours : deux égalités, une
            seule inégalité stricte.
          </p>
          <TheoryBar label="P1 qui ont joué H (jeu 3 × 3)" observed={0} theory={0} color={C.red} />
          <TheoryBar label="Rappel : P2 qui ont joué Droite (jeu Haut/Bas)" observed={12} theory={0} color={C.red} />
        </div>
      </Panel>
      <Verdict tone="ok" title="Verdict : H1 parfaitement respectée ici (0 %).">
        Surprise : un jeu à trois stratégies est plus difficile à analyser, et pourtant moins
        d'étudiants y ont joué une stratégie dominée que dans le jeu à deux stratégies. Une
        explication possible (slide 41) : les étudiants ont peut-être appris à éviter les stratégies
        dominées en analysant les résultats du jeu précédent.
      </Verdict>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Bataille des sexes répétée — slides 43-45                        */
/* ------------------------------------------------------------------ */

const BDS = [
  { v: 21, p: 79, payV: 1.23, payP: 1.38, r: 31, b: 69, payR: 0.43, payB: 3.14 },
  { v: 15, p: 85, payV: 0.62, payP: 1.69, r: 15, b: 85, payR: 0.31, payB: 3.38 },
  { v: 17, p: 83, payV: 0.31, payP: 1.85, r: 8, b: 92, payR: 0.33, payB: 3.33 },
  { v: 8, p: 92, payV: 0.31, payP: 1.85, r: 8, b: 92, payR: 0.15, payB: 3.69 },
] as const;
const ROUND_CHIPS: Array<{ value: "0" | "1" | "2" | "3"; label: string }> = [
  { value: "0", label: "Round 1" },
  { value: "1", label: "Round 2" },
  { value: "2", label: "Round 3" },
  { value: "3", label: "Round 4" },
];
const ROSE = C.red;
const TEAL = C.teal;

function SplitBar({ who, left, right, lName, rName }: { who: string; left: number; right: number; lName: string; rName: string }) {
  return (
    <div>
      <div className="mb-0.5 flex flex-wrap items-baseline justify-between gap-x-2 text-[13px]">
        <span>
          <span className="font-semibold text-foreground">{who} : </span>
          <span className="font-semibold" style={{ color: ROSE }}>
            {lName} {left} %
          </span>
        </span>
        <span className="font-semibold" style={{ color: TEAL }}>
          {rName} {right} %
        </span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full border" role="img" aria-label={`${who} : ${lName} ${left} %, ${rName} ${right} %`}>
        <div
          className="h-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${left}%`, background: ROSE }}
        />
        <div className="h-full flex-1" style={{ background: TEAL }} />
      </div>
    </div>
  );
}

function PayPair({ who, a, b, aName, bName }: { who: string; a: number; b: number; aName: string; bName: string }) {
  const max = 4;
  return (
    <div className="min-w-0">
      <div className="text-[13px] font-semibold">{who} : payoff moyen obtenu avec…</div>
      {[
        [aName, a, ROSE],
        [bName, b, TEAL],
      ].map(([n, v, col]) => (
        <div key={String(n)} className="mt-1 flex items-center gap-2 text-[13px]">
          <span className="w-14 shrink-0 text-right text-muted-foreground">{n}</span>
          <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${(Number(v) / max) * 100}%`, background: String(col) }}
            />
          </div>
          <span className="w-9 shrink-0 font-bold tabular-nums">{fmt(Number(v), 2)}</span>
        </div>
      ))}
    </div>
  );
}

function TabBDS() {
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (round >= 3) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setRound((r) => Math.min(3, r + 1)), 1500);
    return () => window.clearTimeout(id);
  }, [playing, round]);
  const d = BDS[round];
  const rowsT: Array<[string, (x: (typeof BDS)[number]) => string, boolean]> = [
    ["% Viande", (x) => `${x.v} %`, false],
    ["% Poisson", (x) => `${x.p} %`, false],
    ["Payoff Viande", (x) => fmt(x.payV, 2), false],
    ["Payoff Poisson", (x) => fmt(x.payP, 2), false],
    ["% Rouge", (x) => `${x.r} %`, true],
    ["% Blanc", (x) => `${x.b} %`, false],
    ["Payoff Rouge", (x) => fmt(x.payR, 2), false],
    ["Payoff Blanc", (x) => fmt(x.payB, 2), false],
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <HypBadge h="H3" slide="slides 43-45" />
      </div>
      <Statement>
        <strong>H3 : les joueurs anticipent correctement les stratégies de leurs adversaires</strong>{" "}
        ⇒ ils se coordonnent sur un EN. Ici, deux EN : (V, R) et (P, B).
      </Statement>
      <Panel>
        <LabMatrix
          p1="Homme"
          p2="Femme"
          rows={["Viande", "Poisson"]}
          cols={["Rouge", "Blanc"]}
          pay={[
            [[4, 2], [0, 0]],
            [[0, 0], [2, 4]],
          ]}
          gold={[
            [0, 0],
            [1, 1],
          ]}
          caption="Matrice du slide 43 ; cases dorées = les deux EN."
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-end gap-2">
            <ChoiceChips<"0" | "1" | "2" | "3">
              label="Round"
              value={String(round) as "0" | "1" | "2" | "3"}
              onChange={(v) => {
                setPlaying(false);
                setRound(Number(v));
              }}
              options={ROUND_CHIPS}
            />
            <button
              type="button"
              onClick={() => {
                setRound(0);
                setPlaying(!reducedMotion());
              }}
              className="rounded-full border border-primary/40 bg-background px-3 py-1 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
            >
              {playing ? "Rounds en cours…" : "▶ Rejouer les 4 rounds"}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            <SplitBar who="Hommes" left={d.v} right={d.p} lName="Viande" rName="Poisson" />
            <SplitBar who="Femmes" left={d.r} right={d.b} lName="Rouge" rName="Blanc" />
          </div>
          <div className="mt-3 grid gap-2.5">
            <PayPair who="Hommes" a={d.payV} b={d.payP} aName="Viande" bName="Poisson" />
            <PayPair who="Femmes" a={d.payR} b={d.payB} aName="Rouge" bName="Blanc" />
          </div>
        </div>
      </Panel>

      <div className="mt-4 overflow-x-auto">
        <table className="mx-auto w-full max-w-xl border-collapse text-[13px] tabular-nums">
          <caption className="mb-1.5 text-[12.5px] text-muted-foreground">
            Résultats en laboratoire (26 étudiants), slide 45
          </caption>
          <thead>
            <tr className="border-b">
              <th className="px-1.5 py-1 text-left font-semibold" />
              {ROUND_CHIPS.map((rc, j) => (
                <th
                  key={rc.value}
                  className={cn(
                    "px-1.5 py-1 text-right font-semibold transition-colors",
                    j === round && "rounded-t-md bg-primary/10 text-primary",
                  )}
                >
                  R{j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsT.map(([name, get, sep]) => (
              <tr key={name} className={cn(sep && "border-t-2 border-foreground/30")}>
                <th className="whitespace-nowrap px-1.5 py-0.5 text-left font-medium">{name}</th>
                {BDS.map((x, j) => (
                  <td key={j} className={cn("px-1.5 py-0.5 text-right", j === round && "bg-primary/10 font-bold")}>
                    {get(x)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-xl border border-dashed bg-muted/50 px-4 py-3 text-[14px] leading-relaxed">
        <p>
          <strong>Lire les « payoffs » du tableau.</strong> C'est ce qu'a gagné en moyenne un joueur
          avec cette stratégie, face aux choix de l'autre camp. Un homme qui joue Viande gagne 4 si
          la femme joue Rouge, 0 sinon : son payoff moyen vaut donc environ 4 × (% Rouge). Au round 1
          : <M tex="4\times 0{,}31\approx 1{,}23" /> (les % sont arrondis). De même, Blanc ≈ 4 × (%
          Poisson) : <M tex="4\times 0{,}79\approx 3{,}14" />.
        </p>
        <p className="mt-1.5">
          <strong>Round 1 (slide 43).</strong> 21 % de Viande et 31 % de Rouge : les joueurs ne se
          sont pas coordonnés sur un des deux équilibres (en stratégies pures). L'Homme gagnait un peu
          plus avec Poisson (1,38 contre 1,23) ; la Femme gagnait beaucoup plus avec Blanc (3,14
          contre 0,43).
        </p>
      </div>
      <Verdict tone="mixed" title="Verdict : H3 échoue au round 1, puis la répétition rapproche de l'EN.">
        Au round 4, 92 % de Poisson et 92 % de Blanc : on observe une convergence vers l'équilibre
        (P, B) (slide 45). Quand un jeu est répété, on s'attend à ce que les joueurs finissent par se
        coordonner sur un équilibre (slide 44).
      </Verdict>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Le composant                                                        */
/* ------------------------------------------------------------------ */

export function LabGames() {
  const [tab, setTab] = useState<Tab>("xy");
  return (
    <InteractiveCard
      title="Les jeux du labo : la théorie face aux étudiants"
      subtitle="Slides 38-46. Choisis un jeu : quelle hypothèse est testée, ce que prédit la théorie, ce qu'ont fait les étudiants."
      controls={
        <ChoiceChips<Tab>
          className="sm:col-span-2 lg:col-span-3"
          label="Jeu joué en labo"
          value={tab}
          onChange={setTab}
          options={TABS}
        />
      }
      footer={
        <>
          chaque hypothèse se teste à part : H1 (joue-t-on sa stratégie dominante ? évite-t-on les
          dominées ?), H2.1 (croit-on les autres rationnels ?), H3 (se coordonne-t-on sur un EN ?).
          Deux facteurs rapprochent les comportements de la théorie (slide 46) : l'expérience des
          joueurs, qui apprennent à jouer de manière rationnelle (c'est peut-être ce qu'on voit au
          jeu 3 × 3 et dans la bataille des sexes répétée), et les enjeux : des payoffs élevés rendent
          coûteuses les stratégies qui ne sont pas des meilleures réponses. C'est pourquoi on
          s'attend à ce que les comportements de marché des firmes et des traders soient proches
          de ce que prédit la théorie.
        </>
      }
    >
      <div key={tab}>
        {tab === "xy" ? <TabXY /> : null}
        {tab === "dp" ? <TabDP /> : null}
        {tab === "hb" ? <TabHB /> : null}
        {tab === "g3" ? <TabG3 /> : null}
        {tab === "bds" ? <TabBDS /> : null}
      </div>
    </InteractiveCard>
  );
}
