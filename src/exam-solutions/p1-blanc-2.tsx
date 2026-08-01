/**
 * Examen blanc n° 2 · Partie 1 — Résolution guidée.
 *
 * Cinq questions décortiquées pas à pas : self-contrôle (A2), investissement
 * risqué (A3), jeu séquentiel & ENPS (B1/B3/B4), collusion en jeu répété (B3)
 * et concepts transversaux (A1/A2/B4). Chaque valeur numérique est alignée
 * sur le corrigé officiel (exams/p1-blanc-2/corrige-body.html).
 */
import { type ReactNode } from "react";
import { ExamSolutionShell } from "@/components/course/ExamSolutionShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { TpRefList } from "@/components/course/TpRef";

/* ------------------------------------------------------------------ */
/* Palette (sûre en clair comme en sombre)                             */
/* ------------------------------------------------------------------ */

const PC = "#2563eb"; // blue-600   — commune / investisseuse / acheteurs
const PA = "#d97706"; // amber-600  — enseigne A
const PB = "#7c3aed"; // violet-600 — enseigne B
const HL = "#059669"; // emerald-600 — choix optimal / branche retenue
const RB = "#e11d48"; // rose-600   — moi de la période 1 / perte / zone perdue

/* ================================================================== */
/* Composant local · GameTree — arbre de jeu en forme extensive        */
/* ================================================================== */

interface Pt {
  x: number;
  y: number;
}
interface GTNode extends Pt {
  id: string;
  /** nom du joueur affiché près du nœud */
  player?: string;
  labelDx?: number;
  labelDy?: number;
  labelAnchor?: "start" | "middle" | "end";
  color?: string;
}
interface GTLeaf extends Pt {
  id: string;
  /** payoffs — 3 composantes empilées (C ; A ; B) */
  payoff: Array<number | string>;
  /** issue effectivement atteinte à l'équilibre */
  on?: boolean;
}
interface GTEdge {
  from: string;
  to: string;
  label: string;
  dx?: number;
  dy?: number;
  anchor?: "start" | "middle" | "end";
  /** branche retenue par la backward induction (surlignée) */
  on?: boolean;
}

function GameTree({
  viewBox,
  nodes,
  leaves,
  edges,
  payoffColors,
  maxWClass = "max-w-lg",
  ariaLabel,
  caption,
}: {
  viewBox: string;
  nodes: GTNode[];
  leaves: GTLeaf[];
  edges: GTEdge[];
  payoffColors?: string[];
  maxWClass?: string;
  ariaLabel: string;
  caption?: ReactNode;
}) {
  const pts = new Map<string, Pt>();
  nodes.forEach((n) => pts.set(n.id, { x: n.x, y: n.y }));
  leaves.forEach((l) => pts.set(l.id, { x: l.x, y: l.y }));
  const colors = payoffColors ?? [PC, PA, PB];

  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox={viewBox}
          role="img"
          aria-label={ariaLabel}
          className={`mx-auto block h-auto w-full ${maxWClass}`}
        >
          {/* arêtes (actions) */}
          {edges.map((e, i) => {
            const a = pts.get(e.from);
            const b = pts.get(e.to);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2 + (e.dx ?? 0);
            const my = (a.y + b.y) / 2 + (e.dy ?? 0);
            return (
              <g key={`e-${i}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={e.on ? HL : "var(--color-foreground)"}
                  strokeOpacity={e.on ? 1 : 0.72}
                  strokeWidth={e.on ? 2.8 : 1.5}
                  strokeLinecap="round"
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor={e.anchor ?? "middle"}
                  fontSize={13}
                  fontWeight={700}
                  fill={e.on ? HL : "var(--color-foreground)"}
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* feuilles : payoffs empilés */}
          {leaves.map((l) => (
            <g key={l.id}>
              {l.on ? (
                <circle cx={l.x} cy={l.y} r={7.5} fill="none" stroke={HL} strokeWidth={2.2} />
              ) : null}
              <circle cx={l.x} cy={l.y} r={3.4} fill={l.on ? HL : "var(--color-foreground)"} />
              <text x={l.x} y={l.y} textAnchor="middle" fontSize={12.5} fontWeight={700}>
                {l.payoff.map((v, i) => (
                  <tspan
                    key={i}
                    x={l.x}
                    dy={i === 0 ? 17 : 13.5}
                    fill={colors[i] ?? "var(--color-foreground)"}
                  >
                    {v}
                  </tspan>
                ))}
              </text>
            </g>
          ))}

          {/* nœuds de décision */}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={5} fill={n.color ?? "var(--color-foreground)"} />
              {n.player ? (
                <text
                  x={n.x + (n.labelDx ?? 0)}
                  y={n.y + (n.labelDy ?? -10)}
                  textAnchor={n.labelAnchor ?? "middle"}
                  fontSize={12.5}
                  fontWeight={700}
                  fill={n.color ?? "var(--color-foreground)"}
                >
                  {n.player}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Légende des couleurs des trois joueurs du jeu d'implantation. */
function LegendeJoueurs() {
  const items = [
    { color: PC, label: "Commune (1er payoff)" },
    { color: PA, label: "Enseigne A (2e)" },
    { color: PB, label: "Enseigne B (3e)" },
  ];
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
            aria-hidden
          />
          {it.label}
        </span>
      ))}
    </span>
  );
}

/* ================================================================== */
/* Question 3 · L'arbre du jeu d'implantation (réutilisé à 3 stades)   */
/* ================================================================== */

const Q3_EDGES: Array<GTEdge & { id: string }> = [
  { id: "C:E", from: "c", to: "aE", label: "E", anchor: "end", dx: -9, dy: -4 },
  { id: "C:O", from: "c", to: "aO", label: "O", anchor: "start", dx: 9, dy: -4 },
  { id: "aE:I", from: "aE", to: "bEI", label: "I", anchor: "end", dx: -7, dy: -2 },
  { id: "aE:N", from: "aE", to: "bEN", label: "N", anchor: "start", dx: 7, dy: -2 },
  { id: "aO:I", from: "aO", to: "bOI", label: "I", anchor: "end", dx: -7, dy: -2 },
  { id: "aO:N", from: "aO", to: "bON", label: "N", anchor: "start", dx: 7, dy: -2 },
  { id: "bEI:I", from: "bEI", to: "x1", label: "I", anchor: "end", dx: -5, dy: -1 },
  { id: "bEI:N", from: "bEI", to: "x2", label: "N", anchor: "start", dx: 5, dy: -1 },
  { id: "bEN:I", from: "bEN", to: "x3", label: "I", anchor: "end", dx: -5, dy: -1 },
  { id: "bEN:N", from: "bEN", to: "x4", label: "N", anchor: "start", dx: 5, dy: -1 },
  { id: "bOI:I", from: "bOI", to: "x5", label: "I", anchor: "end", dx: -5, dy: -1 },
  { id: "bOI:N", from: "bOI", to: "x6", label: "N", anchor: "start", dx: 5, dy: -1 },
  { id: "bON:I", from: "bON", to: "x7", label: "I", anchor: "end", dx: -5, dy: -1 },
  { id: "bON:N", from: "bON", to: "x8", label: "N", anchor: "start", dx: 5, dy: -1 },
];

function ArbreImplantation({
  surligne = [],
  equilibre = false,
  ariaLabel,
  caption,
}: {
  /** ids d'arêtes retenues (surlignées), ex. "bEI:I" */
  surligne?: string[];
  /** entourer la feuille (E, I, I) atteinte à l'équilibre */
  equilibre?: boolean;
  ariaLabel: string;
  caption?: ReactNode;
}) {
  const on = new Set(surligne);
  return (
    <GameTree
      viewBox="0 0 760 324"
      maxWClass="max-w-2xl"
      ariaLabel={ariaLabel}
      payoffColors={[PC, PA, PB]}
      nodes={[
        { id: "c", x: 380, y: 26, player: "Commune", labelDy: -12, color: PC },
        {
          id: "aE",
          x: 190,
          y: 116,
          player: "A",
          labelDx: -14,
          labelDy: 2,
          labelAnchor: "end",
          color: PA,
        },
        {
          id: "aO",
          x: 570,
          y: 116,
          player: "A",
          labelDx: 14,
          labelDy: 2,
          labelAnchor: "start",
          color: PA,
        },
        {
          id: "bEI",
          x: 95,
          y: 204,
          player: "B",
          labelDx: -13,
          labelDy: 2,
          labelAnchor: "end",
          color: PB,
        },
        {
          id: "bEN",
          x: 285,
          y: 204,
          player: "B",
          labelDx: 13,
          labelDy: 2,
          labelAnchor: "start",
          color: PB,
        },
        {
          id: "bOI",
          x: 475,
          y: 204,
          player: "B",
          labelDx: -13,
          labelDy: 2,
          labelAnchor: "end",
          color: PB,
        },
        {
          id: "bON",
          x: 665,
          y: 204,
          player: "B",
          labelDx: 13,
          labelDy: 2,
          labelAnchor: "start",
          color: PB,
        },
      ]}
      leaves={[
        { id: "x1", x: 57, y: 268, payoff: [8, 3, 3], on: equilibre },
        { id: "x2", x: 133, y: 268, payoff: [5, 7, 0] },
        { id: "x3", x: 247, y: 268, payoff: [4, 0, 6] },
        { id: "x4", x: 323, y: 268, payoff: [0, 0, 0] },
        { id: "x5", x: 437, y: 268, payoff: [6, "−2", "−2"] },
        { id: "x6", x: 513, y: 268, payoff: [3, 5, 0] },
        { id: "x7", x: 627, y: 268, payoff: [2, 0, 4] },
        { id: "x8", x: 703, y: 268, payoff: [1, 0, 0] },
      ]}
      edges={Q3_EDGES.map((e) => ({ ...e, on: on.has(e.id) }))}
      caption={caption}
    />
  );
}

/* ================================================================== */
/* Question 1 · Frise temporelle t = 0 / 1 / 2                         */
/* ================================================================== */

function FriseTemporelle() {
  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox="0 0 640 216"
          role="img"
          aria-label="Frise temporelle du problème d'escalade : période 0 choix du tarif, période 1 choix des séances, période 2 bénéfice ; vu de t=0 tout est raboté par bêta, vu de t=1 seul le bénéfice l'est"
          className="mx-auto block h-auto w-full max-w-lg"
        >
          {/* axe du temps */}
          <line
            x1={30}
            y1={58}
            x2={596}
            y2={58}
            stroke="var(--color-foreground)"
            strokeWidth={1.6}
          />
          <polygon points="608,58 596,53 596,63" fill="var(--color-foreground)" />

          {/* les trois périodes */}
          {[
            { x: 100, t: "t = 0" },
            { x: 320, t: "t = 1" },
            { x: 540, t: "t = 2" },
          ].map((p) => (
            <g key={p.t}>
              <circle cx={p.x} cy={58} r={5.5} fill={PC} />
              <text
                x={p.x}
                y={38}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="var(--color-foreground)"
              >
                {p.t}
              </text>
            </g>
          ))}

          {/* descriptions sous les nœuds */}
          <g fontSize={11.5} fill="var(--color-foreground)" textAnchor="middle">
            <text x={100} y={82}>
              choix du tarif :
            </text>
            <text x={100} y={96}>
              abonnement (a = 1, C = 16)
            </text>
            <text x={100} y={110}>
              ou à la séance (a = 0, p = 2)
            </text>
            <text x={320} y={82}>
              choix des séances k
            </text>
            <text x={320} y={96}>
              coût d'effort k²/2
            </text>
            <text x={320} y={110}>
              + paiement à la salle
            </text>
            <text x={540} y={82}>
              bénéfice santé
            </text>
            <text x={540} y={96}>
              et progression : 12·k
            </text>
          </g>

          {/* comment chaque « moi » rabote les périodes futures */}
          <g fontSize={11.5}>
            <text x={30} y={152} fontWeight={700} fill={PC}>
              vu de t = 0 (U₀) :
            </text>
            <text x={320} y={152} textAnchor="middle" fill={PC}>
              coût ×β
            </text>
            <text x={540} y={152} textAnchor="middle" fill={PC}>
              bénéfice ×β
            </text>
            <text x={30} y={184} fontWeight={700} fill={RB}>
              vu de t = 1 (U₁) :
            </text>
            <text x={320} y={184} textAnchor="middle" fill={RB}>
              coût ×1 — immédiat !
            </text>
            <text x={540} y={184} textAnchor="middle" fill={RB}>
              bénéfice ×β
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Le cœur du problème : vu de t = 0, coût et bénéfice sont <em>tous deux</em> futurs et
        rabotés par le même β — le plan souhaité n'est pas déformé. Vu de t = 1, le coût d'effort
        est <em>immédiat</em> (plus de β) alors que le bénéfice reste futur (toujours ×β) :
        l'arbitrage bascule contre l'effort.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Question 2 · La courbe U(A) et son sommet en A* = 600               */
/* ================================================================== */

function CourbeInvestissement() {
  const X = (a: number) => 46 + (a / 900) * 288;
  const Y = (u: number) => 268 - (u - 29) * 38;
  const pts: string[] = [];
  for (let a = 0; a <= 900; a += 30) {
    const u = 0.5 * Math.sqrt(900 + 3 * a) + 0.5 * Math.sqrt(900 - a);
    pts.push(`${X(a).toFixed(1)},${Y(u).toFixed(1)}`);
  }
  const uMax = 20 * Math.sqrt(3); // ≈ 34,64
  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox="0 0 400 330"
          role="img"
          aria-label="Courbe de l'utilité espérée U(A) en fonction du montant investi A : elle part de 30 en A=0, culmine à 34,64 en A=600 puis retombe à 30 en A=900"
          className="mx-auto block h-auto w-full max-w-md"
        >
          {/* axes */}
          <line
            x1={46}
            y1={296}
            x2={360}
            y2={296}
            stroke="var(--color-foreground)"
            strokeWidth={1.4}
          />
          <line
            x1={46}
            y1={296}
            x2={46}
            y2={28}
            stroke="var(--color-foreground)"
            strokeWidth={1.4}
          />
          <text x={30} y={20} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
            U(A)
          </text>
          <text x={366} y={300} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
            A
          </text>

          {/* niveau U = 30 : ne rien investir… ou tout investir */}
          <line
            x1={46}
            y1={Y(30)}
            x2={X(900)}
            y2={Y(30)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
            strokeOpacity={0.7}
          />
          <circle cx={X(0)} cy={Y(30)} r={3.4} fill="var(--color-muted-foreground)" />
          <circle cx={X(900)} cy={Y(30)} r={3.4} fill="var(--color-muted-foreground)" />
          <text
            x={40}
            y={Y(30) + 4}
            fontSize={11}
            textAnchor="end"
            fill="var(--color-muted-foreground)"
          >
            30
          </text>

          {/* la courbe */}
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke={PC}
            strokeWidth={2.4}
            strokeLinecap="round"
          />

          {/* le maximum en A* = 600 */}
          <line
            x1={X(600)}
            y1={296}
            x2={X(600)}
            y2={Y(uMax)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <line
            x1={46}
            y1={Y(uMax)}
            x2={X(600)}
            y2={Y(uMax)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <circle cx={X(600)} cy={Y(uMax)} r={4.5} fill={HL} />
          <text x={X(600) + 8} y={Y(uMax) - 8} fontSize={12} fontWeight={700} fill={HL}>
            A* = 600
          </text>
          <text x={40} y={Y(uMax) + 4} fontSize={11} textAnchor="end" fill={HL}>
            34,64
          </text>

          {/* graduations */}
          <g fontSize={11} textAnchor="middle" fill="var(--color-muted-foreground)">
            <text x={X(0)} y={312}>
              0
            </text>
            <text x={X(600)} y={312}>
              600
            </text>
            <text x={X(900)} y={312}>
              900
            </text>
          </g>
          <text
            x={203}
            y={326}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            A = montant investi (euros)
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        L'utilité espérée{" "}
        <M tex="U(A) = \tfrac{1}{2}\sqrt{900 + 3A} + \tfrac{1}{2}\sqrt{900 - A}" /> est concave :
        elle monte tant que le gain marginal (état « réussite ») dépasse le coût marginal (état «
        échec »), culmine en <M tex="A^* = 600" />, puis redescend. Remarque amusante : ne rien
        investir et tout investir donnent la même utilité espérée, 30.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Question 4 · L'échelle des δ : seuils 3/5 et √(3/5)                 */
/* ================================================================== */

function EchelleDelta() {
  const X = (d: number) => 40 + d * 440;
  const s1 = 3 / 5; // 0,60
  const s2 = Math.sqrt(3 / 5); // ≈ 0,7746
  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox="0 0 560 214"
          role="img"
          aria-label="Deux échelles du facteur d'escompte delta entre 0 et 1 : avec détection immédiate la collusion est soutenable dès 0,60 ; avec détection retardée de deux semaines, seulement à partir de 0,77"
          className="mx-auto block h-auto w-full max-w-lg"
        >
          {/* ---- barre 1 : détection immédiate (question 4.2) ---- */}
          <text x={40} y={34} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
            Question 4.2 — détection immédiate
          </text>
          <line
            x1={40}
            y1={70}
            x2={480}
            y2={70}
            stroke="var(--color-muted-foreground)"
            strokeWidth={3}
            strokeOpacity={0.3}
            strokeLinecap="round"
          />
          <line
            x1={X(s1)}
            y1={70}
            x2={480}
            y2={70}
            stroke={HL}
            strokeWidth={8}
            strokeLinecap="round"
            strokeOpacity={0.85}
          />
          <line
            x1={X(s1)}
            y1={60}
            x2={X(s1)}
            y2={80}
            stroke="var(--color-foreground)"
            strokeWidth={1.6}
          />
          <text x={X(0.82)} y={56} fontSize={11.5} fontWeight={700} textAnchor="middle" fill={HL}>
            collusion soutenable
          </text>
          <text x={X(s1)} y={96} fontSize={12} fontWeight={700} textAnchor="middle" fill={HL}>
            δ* = 3/5 = 0,60
          </text>
          <text
            x={40}
            y={96}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            0
          </text>
          <text
            x={480}
            y={96}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            1
          </text>
          <text x={498} y={74} fontSize={13} fontStyle="italic" fill="var(--color-foreground)">
            δ
          </text>

          {/* lien visuel entre les deux seuils */}
          <line
            x1={X(s1)}
            y1={70}
            x2={X(s1)}
            y2={156}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
            strokeOpacity={0.7}
          />

          {/* ---- barre 2 : détection au bout de 2 semaines (question 4.3) ---- */}
          <text x={40} y={126} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
            Question 4.3 — détection au bout de 2 semaines
          </text>
          <line
            x1={40}
            y1={156}
            x2={480}
            y2={156}
            stroke="var(--color-muted-foreground)"
            strokeWidth={3}
            strokeOpacity={0.3}
            strokeLinecap="round"
          />
          <line
            x1={X(s1)}
            y1={156}
            x2={X(s2)}
            y2={156}
            stroke={RB}
            strokeWidth={8}
            strokeLinecap="round"
            strokeOpacity={0.45}
          />
          <line
            x1={X(s2)}
            y1={156}
            x2={480}
            y2={156}
            stroke={HL}
            strokeWidth={8}
            strokeLinecap="round"
            strokeOpacity={0.85}
          />
          <line
            x1={X(s2)}
            y1={146}
            x2={X(s2)}
            y2={166}
            stroke="var(--color-foreground)"
            strokeWidth={1.6}
          />
          <text
            x={(X(s1) + X(s2)) / 2}
            y={142}
            fontSize={11}
            fontWeight={700}
            textAnchor="middle"
            fill={RB}
          >
            collusion perdue
          </text>
          <text x={X(s2)} y={182} fontSize={12} fontWeight={700} textAnchor="middle" fill={HL}>
            δ* = √(3/5) ≈ 0,77
          </text>
          <text
            x={40}
            y={182}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            0
          </text>
          <text
            x={480}
            y={182}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            1
          </text>
          <text x={498} y={160} fontSize={13} fontStyle="italic" fill="var(--color-foreground)">
            δ
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Quand la détection prend deux semaines, le seuil de patience passe de 0,60 à environ 0,77 :
        toutes les paires de stations dont le <M tex="\delta" /> tombe entre les deux (zone rose)
        pouvaient colluder avant, plus maintenant. Détection lente = collusion fragile.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Question 5 · DAA vs DAP : l'écart de dotation en un coup d'œil      */
/* ================================================================== */

function BarresDotation() {
  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox="0 0 360 240"
          role="img"
          aria-label="Deux barres : les détenteurs d'un mug demandent au moins 9 euros pour le céder, les non-détenteurs offrent au plus 4 euros — un écart de 5 euros"
          className="mx-auto block h-auto w-full max-w-md"
        >
          {/* sol */}
          <line
            x1={30}
            y1={196}
            x2={330}
            y2={196}
            stroke="var(--color-foreground)"
            strokeWidth={1.5}
          />

          {/* barre DAA (détenteurs) : 9 € */}
          <rect x={70} y={61} width={64} height={135} rx={8} fill={RB} fillOpacity={0.85} />
          <text x={102} y={50} fontSize={14} fontWeight={700} textAnchor="middle" fill={RB}>
            9 €
          </text>
          <text
            x={102}
            y={214}
            fontSize={11.5}
            fontWeight={700}
            textAnchor="middle"
            fill="var(--color-foreground)"
          >
            DAA — détenteurs
          </text>
          <text
            x={102}
            y={228}
            fontSize={10.5}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            « je cède contre 9 € au moins »
          </text>

          {/* barre DAP (non-détenteurs) : 4 € */}
          <rect x={226} y={136} width={64} height={60} rx={8} fill={PC} fillOpacity={0.85} />
          <text x={258} y={125} fontSize={14} fontWeight={700} textAnchor="middle" fill={PC}>
            4 €
          </text>
          <text
            x={258}
            y={214}
            fontSize={11.5}
            fontWeight={700}
            textAnchor="middle"
            fill="var(--color-foreground)"
          >
            DAP — non-détenteurs
          </text>
          <text
            x={258}
            y={228}
            fontSize={10.5}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            « je paie 4 € au plus »
          </text>

          {/* l'écart */}
          <line
            x1={134}
            y1={61}
            x2={180}
            y2={61}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <line
            x1={226}
            y1={136}
            x2={180}
            y2={136}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <line
            x1={180}
            y1={66}
            x2={180}
            y2={131}
            stroke="var(--color-foreground)"
            strokeWidth={1.6}
          />
          <polygon points="180,61 176,68 184,68" fill="var(--color-foreground)" />
          <polygon points="180,136 176,129 184,129" fill="var(--color-foreground)" />
          <text x={188} y={94} fontSize={11} fontWeight={700} fill="var(--color-foreground)">
            écart de 5 €
          </text>
          <text x={188} y={108} fontSize={11} fill="var(--color-muted-foreground)">
            l'effet de dotation
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Les deux groupes ont été tirés au sort : leurs préférences moyennes sont identiques. Pour
        des agents rationnels, les deux barres devraient avoir (presque) la même hauteur — ici la
        DAA vaut plus du double de la DAP.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* La page                                                             */
/* ================================================================== */

export default function ExamSolution() {
  return (
    <ExamSolutionShell examId="p1-blanc-2">
      {/* ============================================================ */}
      {/* QUESTION 1 — Self-contrôle : l'abonnement à la salle d'escalade */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-2"
        id="q1"
        number={1}
        title="Question 1 — Self-contrôle : l'abonnement à la salle d'escalade (50 pts)"
        difficulty={3}
        refs={[
          { chapter: "a2", section: "selfcontrole" },
          { chapter: "a2", section: "commit" },
        ]}
        statement={
          <>
            <p>
              Une salle d'escalade de bloc vient d'ouvrir à Jambes. Elle propose deux tarifications
              à un grimpeur débutant : soit il paie un prix <M tex="p = 2" /> pour chacune de ses
              séances, soit il prend un abonnement au prix <M tex="C = 16" /> et peut alors grimper
              autant de fois qu'il le désire. Il y a trois périodes : la période 0 durant laquelle
              le grimpeur décide de prendre un abonnement ou non, la période 1 durant laquelle il
              effectue un nombre <M tex="k" /> de séances, et la période 2 durant laquelle il reçoit
              un bénéfice (santé et progression) <M tex="b = 12" /> pour chaque séance effectuée en
              période 1.
            </p>
            <p>
              Le grimpeur a un problème de self-contrôle. Ses préférences en période 0 sur le nombre
              de séances et sur le fait de prendre un abonnement (<M tex="a = 1" />) ou pas (
              <M tex="a = 0" />) sont représentées par
            </p>
            <MB tex="U_0(a,k) = \underbrace{-\beta\frac{k^2}{2} - \beta\bigl[aC + (1-a)pk\bigr]}_{\text{période 1}} + \underbrace{\beta b k}_{\text{période 2}}" />
            <p>
              où le premier terme capture le coût d'effort des séances (l'escalade est un{" "}
              <em>bien d'investissement</em>) et où le biais de self-contrôle est{" "}
              <M tex="\beta = \tfrac{1}{2}" />. Étant donné son problème de self-contrôle, ses
              préférences en période 1 sont représentées par
            </p>
            <MB tex="U_1(a,k) = \underbrace{-\frac{k^2}{2} - \bigl[aC + (1-a)pk\bigr]}_{\text{période 1}} + \underbrace{\beta b k}_{\text{période 2}}" />
            <p>
              où <M tex="a" /> est fixé à la valeur choisie en période 0.
            </p>
            <p className="text-sm text-muted-foreground">
              Note — On suppose un facteur d'escompte <M tex="\delta = 1" />. <M tex="U_0" />{" "}
              suppose que le montant dû à la salle est payé en période 1 : le self-contrôle
              n'affecte que la décision de grimper, pas l'allocation des coûts monétaires dans le
              temps.
            </p>
            <SubQuestion label="1.1)">
              En période 0, combien de séances le grimpeur souhaite-t-il effectuer s'il prend un
              abonnement (<M tex="a = 1" />) ? Détaillez votre calcul. (8 points)
            </SubQuestion>
            <SubQuestion label="1.2)">
              En période 0, combien de séances souhaite-t-il effectuer s'il ne prend pas
              d'abonnement (<M tex="a = 0" />) ? (8 points)
            </SubQuestion>
            <SubQuestion label="1.3)">
              Si le grimpeur est naïf à propos de son problème de self-contrôle (
              <M tex="\hat\beta = 1" />
              ), va-t-il prendre un abonnement en période 0 ? Détaillez votre raisonnement. (10
              points)
            </SubQuestion>
            <SubQuestion label="1.4)">
              Étant donné le choix tarifaire effectué à la question 1.3, combien de séances le
              grimpeur naïf va-t-il <em>réellement</em> effectuer en période 1 ? (8 points)
            </SubQuestion>
            <SubQuestion label="1.5)">
              Si le grimpeur est sophistiqué à propos de son problème de self-contrôle (
              <M tex="\hat\beta = \beta" />
              ), va-t-il prendre un abonnement en période 0 ? Détaillez votre raisonnement. (10
              points)
            </SubQuestion>
            <SubQuestion label="1.6)">
              Pour le nombre de séances que le grimpeur sophistiqué effectuera réellement,
              l'abonnement est-il l'option tarifaire la moins chère ? Expliquez pourquoi le
              sophistiqué choisit néanmoins cette option (3 à 5 lignes). (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : qui décide, quand, avec quelles préférences ?",
            refs: [
              { chapter: "a2", section: "selfcontrole" },
              { chapter: "a2", section: "choix" },
            ],
            content: (
              <>
                <p>
                  <strong>Type de question :</strong> une décision intertemporelle avec{" "}
                  <strong>biais de self-contrôle</strong> — le chapitre A2. Tu le reconnais à trois
                  indices sûrs : (i) l'énoncé donne <em>deux</em> fonctions d'utilité,{" "}
                  <M tex="U_0" /> et <M tex="U_1" />, qui ne diffèrent que par le <M tex="\beta" />{" "}
                  devant les termes de la période 1 ; (ii) le mot « self-contrôle » et le paramètre{" "}
                  <M tex="\beta = \tfrac{1}{2}" /> ; (iii) le vocabulaire « naïf » (
                  <M tex="\hat\beta = 1" />) / « sophistiqué » (<M tex="\hat\beta = \beta" />
                  ).
                </p>
                <p>
                  <strong>Les données :</strong> prix à la séance <M tex="p = 2" />, abonnement{" "}
                  <M tex="C = 16" />, bénéfice par séance <M tex="b = 12" />, biais{" "}
                  <M tex="\beta = \tfrac{1}{2}" />, escompte <M tex="\delta = 1" />. Pose la frise
                  des trois périodes pour voir qui paie quoi, quand :
                </p>
                <FriseTemporelle />
                <Callout
                  variant="methode"
                  title="Méthode — la question à se poser à chaque sous-question"
                >
                  <p>
                    <strong>Qui décide, et quand ?</strong> Une décision prise en période 0 (le
                    tarif, le plan de séances <em>souhaité</em>) se calcule avec <M tex="U_0" />.
                    Une décision prise en période 1 (le nombre de séances <em>réel</em>) se calcule
                    avec <M tex="U_1" />. Et pour le choix du tarif : le naïf croit que son futur
                    moi suivra le plan de <M tex="U_0" /> ; le sophistiqué anticipe qu'il suivra{" "}
                    <M tex="U_1" />. Toute la question 1 se déroule avec cette seule grille.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 · Poser U₀(1, k) et dériver : le plan souhaité avec abonnement",
            refs: [{ chapter: "a2", section: "choix" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> la question demande ce que le grimpeur{" "}
                  <em>souhaite</em> en période 0 — on maximise donc <M tex="U_0" /> avec{" "}
                  <M tex="a = 1" />. Avec abonnement, <M tex="aC + (1-a)pk = C" /> : le coût
                  monétaire devient un forfait qui ne dépend plus de <M tex="k" />.
                </p>
                <MB tex="U_0(1,k) = -\beta\frac{k^2}{2} - \beta C + \beta b k" />
                <p>
                  On maximise en <M tex="k" /> : on dérive et on annule (condition de premier ordre,
                  CPO). Le terme <M tex="-\beta C" /> est une constante, sa dérivée est nulle :
                </p>
                <MB tex="\frac{\partial U_0(1,k)}{\partial k} = -\beta k + \beta b = \beta\,(b - k) = 0" />
                <p>
                  Comme <M tex="\beta = \tfrac{1}{2} \neq 0" />, on peut diviser par{" "}
                  <M tex="\beta" /> :
                </p>
                <MB tex="k^{*}_{a=1} = b = \textbf{12 séances}" />
                <Callout variant="intuition" title="Pourquoi β disparaît-il du plan souhaité ?">
                  <p>
                    Vu de la période 0, le coût d'effort (période 1) <em>et</em> le bénéfice
                    (période 2) sont tous deux futurs : le même rabot <M tex="\beta" /> s'applique
                    aux deux et se simplifie dans la CPO. Le biais de self-contrôle{" "}
                    <strong>ne déforme pas ce qu'on projette de faire</strong> — il ne mordra qu'au
                    moment d'agir. C'est exactement ce que montre la frise de l'étape 1.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 · Refaire le calcul sans abonnement : le prix p entre dans la CPO",
            refs: [{ chapter: "a2", section: "choix" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> même logique, mais avec <M tex="a = 0" /> chaque
                  séance coûte <M tex="p = 2" /> — le coût monétaire <M tex="pk" /> dépend
                  maintenant de <M tex="k" /> et va donc apparaître dans la dérivée.
                </p>
                <MB tex="U_0(0,k) = -\beta\frac{k^2}{2} - \beta p k + \beta b k" />
                <MB tex="\frac{\partial U_0(0,k)}{\partial k} = \beta\,(-k - p + b) = 0" />
                <MB tex="k^{*}_{a=0} = b - p = 12 - 2 = \textbf{10 séances}" />
                <p>
                  <strong>Interprétation :</strong> il souhaite <em>moins</em> de séances sans
                  abonnement (10 contre 12). Ce n'est pas du self-contrôle : c'est un simple effet
                  de coût marginal. Avec abonnement, une séance de plus ne coûte que l'effort ; sans
                  abonnement, elle coûte l'effort <em>plus</em> 2 euros.
                </p>
              </>
            ),
          },
          {
            title: "1.3 · Choisir le tarif quand on est naïf : comparer les plans souhaités",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> le naïf croit <M tex="\hat\beta = 1" /> — il est
                  persuadé que son « moi de la période 1 » exécutera fidèlement le plan souhaité. Il
                  compare donc l'abonnement <em>avec 12 séances</em> (le plan de 1.1) au paiement à
                  la séance <em>avec 10 séances</em> (le plan de 1.2), le tout évalué avec ses
                  préférences du moment, <M tex="U_0" />.
                </p>
                <p>
                  Option abonnement, évaluée à son plan <M tex="k = 12" /> :
                </p>
                <MB tex="U_0(1,12) = \tfrac{1}{2}\Bigl(-\tfrac{12^2}{2} - 16 + 12 \times 12\Bigr)" />
                <p>
                  On calcule terme à terme : <M tex="\tfrac{12^2}{2} = \tfrac{144}{2} = 72" /> et{" "}
                  <M tex="12 \times 12 = 144" /> :
                </p>
                <MB tex="U_0(1,12) = \tfrac{1}{2}\,(-72 - 16 + 144) = \tfrac{1}{2} \times 56 = 28" />
                <p>
                  Option à la séance, évaluée à son plan <M tex="k = 10" /> :
                </p>
                <MB tex="U_0(0,10) = \tfrac{1}{2}\Bigl(-\tfrac{10^2}{2} - 2 \times 10 + 12 \times 10\Bigr) = \tfrac{1}{2}\,(-50 - 20 + 120) = \tfrac{1}{2} \times 50 = 25" />
                <p>
                  Comme <M tex="28 > 25" />, <strong>le grimpeur naïf prend l'abonnement</strong>.
                </p>
                <Callout variant="attention">
                  <p>
                    Le piège de cette sous-question : comparer les deux options{" "}
                    <em>au même nombre de séances</em>. C'est faux — chaque option doit être évaluée{" "}
                    <strong>à son propre</strong> <M tex="k^*" /> : 12 séances avec abonnement, 10
                    sans. Le nombre de séances optimal fait partie du plan.
                  </p>
                </Callout>
                <Callout variant="examen">
                  <p>
                    Le barème (10 pts) récompense trois choses : dire explicitement que le naïf
                    évalue les <em>plans souhaités</em> (3 pts), puis les deux valeurs{" "}
                    <M tex="U_0(1,12) = 28" /> et <M tex="U_0(0,10) = 25" /> (3 + 3 pts), et enfin
                    la conclusion. Écris les trois — une comparaison sans les valeurs chiffrées
                    laisse des points sur la table.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.4 · Passer en période 1 : ce que le naïf fait réellement",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> en période 1, ce n'est plus <M tex="U_0" /> qui
                  commande mais <M tex="U_1" /> — le coût d'effort est devenu immédiat, seul le
                  bénéfice reste raboté par <M tex="\beta" />. L'abonnement est déjà payé (
                  <M tex="a = 1" /> fixé à la question 1.3) :
                </p>
                <MB tex="U_1(1,k) = -\frac{k^2}{2} - C + \beta b k" />
                <p>
                  CPO en <M tex="k" /> (le forfait <M tex="C" /> disparaît encore) :
                </p>
                <MB tex="\frac{\partial U_1(1,k)}{\partial k} = -k + \beta b = 0" />
                <MB tex="k^{\text{réel}}_{a=1} = \beta b = \tfrac{1}{2} \times 12 = \textbf{6 séances}" />
                <p>
                  <strong>Interprétation :</strong> le naïf ne fera que 6 séances — la moitié des 12
                  qu'il croyait faire. Au moment d'agir, l'effort pèse plein pot (×1) alors que le
                  bénéfice, futur, ne compte que pour moitié (×
                  <M tex="\beta" />
                  ).
                </p>
                <Callout variant="intuition" title="Bien d'investissement ⇒ sous-consommation">
                  <p>
                    L'escalade coûte aujourd'hui et rapporte demain : c'est un{" "}
                    <strong>bien d'investissement</strong>, et le biais présent pousse à en faire{" "}
                    <em>trop peu</em>. Pour un bien de tentation (coûts demain, plaisir aujourd'hui
                    : sucre, réseaux sociaux…), le même <M tex="\beta" /> pousserait à en consommer{" "}
                    <em>trop</em>. Repère toujours de quel côté penche le bien.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.5 · Le sophistiqué : anticiper son futur moi avant de choisir le tarif",
            refs: [
              { chapter: "a2", section: "selfcontrole" },
              { chapter: "a2", section: "commit" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> le sophistiqué (
                  <M tex="\hat\beta = \beta = \tfrac{1}{2}" />) sait que son futur moi maximisera{" "}
                  <M tex="U_1" />, pas <M tex="U_0" />. Il raisonne donc en deux temps, comme une
                  backward induction sur lui-même : <em>d'abord</em> prédire le <M tex="k" /> réel
                  de chaque option (avec <M tex="U_1" />
                  ), <em>ensuite</em> évaluer ces programmes réalistes avec ses préférences
                  actuelles <M tex="U_0" />.
                </p>
                <p>
                  <strong>Avec abonnement</strong> — il sait qu'il fera <M tex="k = \beta b = 6" />{" "}
                  séances (calcul de 1.4). Il évalue ce programme avec <M tex="U_0" /> :
                </p>
                <MB tex="U_0(1,6) = \tfrac{1}{2}\Bigl(-\tfrac{6^2}{2} - 16 + 12 \times 6\Bigr) = \tfrac{1}{2}\,(-18 - 16 + 72) = \tfrac{1}{2} \times 38 = 19" />
                <p>
                  <strong>Sans abonnement</strong> — son futur moi maximisera{" "}
                  <M tex="U_1(0,k) = -\tfrac{k^2}{2} - pk + \beta b k" />, dont la CPO donne :
                </p>
                <MB tex="-k - p + \beta b = 0 \quad\Longrightarrow\quad k^{\text{réel}}_{a=0} = \beta b - p = 6 - 2 = 4 \text{ séances}" />
                <p>Il évalue donc l'option « à la séance » à 4 séances, pas à 10 :</p>
                <MB tex="U_0(0,4) = \tfrac{1}{2}\Bigl(-\tfrac{4^2}{2} - 2 \times 4 + 12 \times 4\Bigr) = \tfrac{1}{2}\,(-8 - 8 + 48) = \tfrac{1}{2} \times 32 = 16" />
                <p>
                  Comme <M tex="19 > 16" />,{" "}
                  <strong>le grimpeur sophistiqué prend lui aussi l'abonnement</strong>.
                </p>
                <Callout variant="methode" title="La signature du sophistiqué dans une copie">
                  <p>
                    Deux CPO avec <M tex="U_1" /> (une par option) pour prédire les{" "}
                    <M tex="k^{\text{réel}}" />, puis deux évaluations avec <M tex="U_0" /> à ces{" "}
                    <M tex="k^{\text{réel}}" />. Si tu évalues le sophistiqué aux plans souhaités
                    (12 et 10), tu as en fait résolu la question du naïf.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.6 · Vérifier le coût des 6 séances : l'abonnement comme commitment device",
            refs: [{ chapter: "a2", section: "commit" }],
            content: (
              <>
                <p>
                  <strong>Le calcul demandé :</strong> le sophistiqué fera réellement 6 séances.
                  Payées à l'unité, elles auraient coûté :
                </p>
                <MB tex="p \times k^{\text{réel}} = 2 \times 6 = 12 \; < \; 16 = C" />
                <p>
                  <strong>Non</strong>, l'abonnement n'est pas l'option la moins chère pour 6
                  séances : il paie un surcoût de 4.
                </p>
                <p>
                  <strong>
                    Mais la comparaison « 16 contre 12 » repose sur un contrefactuel trompeur :
                  </strong>{" "}
                  sans abonnement, le sophistiqué ne ferait pas 6 séances — il n'en ferait que{" "}
                  <strong>4</strong> (question 1.5). Le vrai choix est entre{" "}
                  <M tex="U_0(1,6) = 19" /> et <M tex="U_0(0,4) = 16" />. En ramenant le coût
                  marginal d'une séance à zéro, l'abonnement pousse le moi de la période 1 à grimper
                  davantage (6 au lieu de 4), donc à se rapprocher du programme souhaité (12).
                  L'abonnement est un <strong>commitment device</strong> : le sophistiqué{" "}
                  <strong>paie 4 de plus pour se lier les mains</strong>.
                </p>
                <p>
                  Le naïf, lui, prend le même abonnement pour une tout autre raison : il croit — à
                  tort — qu'il fera 12 séances.
                </p>
                <Callout variant="examen" title="Ce que le correcteur attend en 3–5 lignes">
                  <p>
                    Trois éléments, dans l'ordre : (i) la comparaison chiffrée <M tex="12 < 16" /> ;
                    (ii) le <em>bon</em> contrefactuel (sans abonnement, ce serait 4 séances, pas 6)
                    ; (iii) le mot « commitment device » (ou « se lier les mains »). Le point (ii)
                    est celui qui départage les copies.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Prendre du recul : la carte complète naïf / sophistiqué",
            refs: [
              { chapter: "a2", section: "selfcontrole" },
              { chapter: "a2", section: "commit" },
            ],
            content: (
              <>
                <p>Tous les nombres de la question tiennent dans un seul tableau :</p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/60">
                        <th className="border px-3 py-2 text-left" />
                        <th className="border px-3 py-2 text-center">Avec abonnement (a = 1)</th>
                        <th className="border px-3 py-2 text-center">Sans abonnement (a = 0)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold">
                          Plan souhaité en t = 0 (max U₀)
                        </th>
                        <td className="border px-3 py-2 text-center">12 séances</td>
                        <td className="border px-3 py-2 text-center">10 séances</td>
                      </tr>
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold">
                          Comportement réel en t = 1 (max U₁)
                        </th>
                        <td className="border px-3 py-2 text-center">6 séances</td>
                        <td className="border px-3 py-2 text-center">4 séances</td>
                      </tr>
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold">
                          U₀ du programme réel
                        </th>
                        <td className="border px-3 py-2 text-center font-bold">19</td>
                        <td className="border px-3 py-2 text-center">16</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Ici, naïf et sophistiqué finissent par faire <em>exactement la même chose</em> :
                  abonnement, puis 6 séances, pour une utilité réalisée <M tex="U_0 = 19" />. La
                  différence est dans la tête : le naïf s'attendait à 28 (il croyait faire 12
                  séances) et sera déçu ; le sophistiqué avait prévu 19 — et a choisi l'abonnement{" "}
                  <em>précisément</em> comme outil de discipline.
                </p>
                <Callout variant="retiens">
                  <p>
                    Quatre nombres à savoir retrouver les yeux fermés : plans souhaités{" "}
                    <M tex="b = 12" /> et <M tex="b - p = 10" /> ; comportements réels{" "}
                    <M tex="\beta b = 6" /> et <M tex="\beta b - p = 4" />. Souhaité = CPO de{" "}
                    <M tex="U_0" /> ; réel = CPO de <M tex="U_1" /> ; le prix <M tex="p" /> s'ajoute
                    au coût marginal quand il n'y a pas d'abonnement.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1)</strong> <M tex="k^* = b = 12" /> séances. · <strong>1.2)</strong>{" "}
              <M tex="k^* = b - p = 10" /> séances. · <strong>1.3)</strong> le naïf prend
              l'abonnement car <M tex="U_0(1,12) = 28 > 25 = U_0(0,10)" />. · <strong>1.4)</strong>{" "}
              il ne fera que <M tex="k = \beta b = 6" /> séances. · <strong>1.5)</strong> le
              sophistiqué prend aussi l'abonnement car <M tex="U_0(1,6) = 19 > 16 = U_0(0,4)" />{" "}
              (sans abonnement il ne ferait que 4 séances). · <strong>1.6)</strong> non : 6 séances
              à l'unité coûteraient <M tex="12 < 16" /> — mais l'abonnement est un{" "}
              <strong>commitment device</strong> que le sophistiqué paie 4 de plus pour se lier les
              mains.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> plan souhaité = CPO de <M tex="U_0" /> (le{" "}
              <M tex="\beta" /> se simplifie), comportement réel = CPO de <M tex="U_1" /> (le{" "}
              <M tex="\beta" /> ne frappe que le bénéfice futur). Le naïf compare des plans
              illusoires, le sophistiqué des plans réalistes.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex4" },
                { session: 1, exercise: "ex3" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* QUESTION 2 — Combien investir dans le projet risqué ?         */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-2"
        id="q2"
        number={2}
        title="Question 2 — Combien investir dans le projet risqué ? (40 pts)"
        difficulty={2}
        refs={[
          { chapter: "a3", section: "s7" },
          { chapter: "a3", section: "s6" },
          { chapter: "a3", section: "s4" },
        ]}
        statement={
          <>
            <p>
              Considérez une investisseuse rationnelle disposant d'une richesse <M tex="w = 900" />{" "}
              euros et ayant la fonction d'utilité de Bernoulli
            </p>
            <MB tex="u(w) = \sqrt{w} \qquad \text{où } w \text{ est un montant en euros.}" />
            <p>
              Une jeune entreprise lui propose d'investir un montant <M tex="A \in [0\,;\,900]" />{" "}
              de son choix dans un projet risqué. Avec une probabilité <M tex="\tfrac{1}{2}" />, le
              projet réussit et chaque euro investi lui rapporte 4 euros ; avec une probabilité{" "}
              <M tex="\tfrac{1}{2}" />, le projet échoue et chaque euro investi est perdu.
            </p>
            <SubQuestion label="2.1)">
              Exprimez la valeur finale de son portefeuille (argent conservé + résultat du projet)
              dans chacun des deux scénarios, puis écrivez son utilité espérée <M tex="U(A)" />. (8
              points)
            </SubQuestion>
            <SubQuestion label="2.2)">
              Calculez le montant optimal <M tex="A^*" /> que l'investisseuse choisit d'investir.
              Détaillez la dérivation complète (condition de premier ordre). (14 points)
            </SubQuestion>
            <SubQuestion label="2.3)">
              Calculez l'utilité espérée à l'optimum <M tex="U(A^*)" /> ainsi que l'équivalent
              certain du portefeuille optimal. Comparez cet équivalent certain à la richesse
              initiale et interprétez brièvement. (10 points)
            </SubQuestion>
            <SubQuestion label="2.4)">
              Sans refaire de calcul : si l'investisseuse était plus averse au risque (par exemple
              avec <M tex="u(w) = \ln(w)" />, plus concave), le montant optimal investi serait-il
              plus élevé, plus faible ou inchangé ? Expliquez (3 à 5 lignes). (8 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : un investissement optimal sous utilité espérée",
            refs: [
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s7" },
            ],
            content: (
              <>
                <p>
                  <strong>Type de question :</strong> le problème d'
                  <strong>investissement risqué</strong> du chapitre A3 (application 1). Les indices
                  : une <em>fonction d'utilité de Bernoulli</em> (donc cadre vNM), deux scénarios
                  avec probabilités, et surtout un <strong>montant continu</strong> <M tex="A" /> à
                  choisir — ce n'est pas un choix binaire « investir ou pas », mais une maximisation
                  en <M tex="A" />.
                </p>
                <Callout variant="methode" title="La recette en 4 temps (à dérouler telle quelle)">
                  <ol className="ml-5 list-decimal space-y-1">
                    <li>
                      Écrire la <strong>richesse finale dans chaque état</strong> du monde (réussite
                      / échec) en fonction de <M tex="A" /> ;
                    </li>
                    <li>
                      assembler l'<strong>utilité espérée</strong>{" "}
                      <M tex="U(A) = \sum_s p_s\, u(w_s)" /> ;
                    </li>
                    <li>
                      <strong>dériver</strong> et résoudre la CPO <M tex="U'(A^*) = 0" /> ;
                    </li>
                    <li>
                      <strong>vérifier</strong> (solution intérieure ? maximum ?) puis{" "}
                      <strong>interpréter</strong> (équivalent certain, prime de risque).
                    </li>
                  </ol>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 · Écrire la richesse finale dans chaque scénario",
            refs: [{ chapter: "a3", section: "s7" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> tout le reste découle de ces deux expressions — une
                  erreur ici se propage jusqu'à <M tex="A^*" />. Si elle investit <M tex="A" />,
                  elle conserve <M tex="900 - A" /> euros sûrs, quoi qu'il arrive.
                </p>
                <p>
                  <strong>En cas de réussite</strong>, chaque euro investi lui <em>rapporte</em> 4
                  euros : elle récupère <M tex="4A" /> du projet, en plus de ce qu'elle a conservé :
                </p>
                <MB tex="\text{réussite : } \underbrace{900 - A}_{\text{conservé}} + \underbrace{4A}_{\text{projet}} = 900 + 3A" />
                <p>
                  <strong>En cas d'échec</strong>, le projet ne rend rien — il ne reste que l'argent
                  conservé :
                </p>
                <MB tex="\text{échec : } 900 - A + 0 = 900 - A" />
                <p>
                  <strong>Lecture économique :</strong> investir un euro, c'est déplacer de la
                  richesse de l'état « échec » (−1) vers l'état « réussite » (+3). La question est :
                  jusqu'où ce transfert vaut-il le coup pour une agente averse au risque ?
                </p>
                <Callout variant="attention">
                  <p>
                    « Chaque euro investi rapporte 4 euros » = un rendement <em>brut</em> : elle
                    récupère <M tex="4A" />, soit un gain <em>net</em> de <M tex="3A" />. L'erreur
                    classique est d'écrire <M tex="900 + 4A" /> en cas de réussite — c'est oublier
                    que les <M tex="A" /> euros investis sont sortis du portefeuille avant d'y
                    revenir multipliés par 4.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 · Assembler l'utilité espérée U(A)",
            refs: [{ chapter: "a3", section: "s4" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> le critère vNM dit qu'une agente rationnelle évalue
                  une loterie par la <em>moyenne pondérée des utilités</em> des richesses finales —
                  chaque état pèse sa probabilité, et c'est <M tex="u" /> qui encode l'attitude face
                  au risque :
                </p>
                <FormulaBox
                  label="Utilité espérée du portefeuille"
                  tex="U(A) = \tfrac{1}{2}\sqrt{900 + 3A} + \tfrac{1}{2}\sqrt{900 - A}"
                  caption={
                    <>
                      Probabilité <M tex="\tfrac{1}{2}" /> × utilité de la richesse « réussite » +
                      probabilité <M tex="\tfrac{1}{2}" /> × utilité de la richesse « échec ».
                    </>
                  }
                />
                <p>
                  Vérification rapide aux bornes : <M tex="U(0) = \sqrt{900} = 30" /> (ne rien
                  investir) et{" "}
                  <M tex="U(900) = \tfrac{1}{2}\sqrt{3600} + \tfrac{1}{2}\sqrt{0} = 30" /> (tout
                  investir). Les deux extrêmes se valent — l'optimum sera quelque part entre les
                  deux.
                </p>
              </>
            ),
          },
          {
            title: "2.2 · Dériver U(A) sans aucun saut",
            refs: [{ chapter: "a3", section: "s7" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> le maximum d'une fonction concave et dérivable est là
                  où la dérivée s'annule. On dérive terme à terme, avec{" "}
                  <M tex="(\sqrt{x})' = \tfrac{1}{2\sqrt{x}}" /> et la règle de la chaîne (la
                  dérivée interne multiplie) :
                </p>
                <MB tex="\frac{d}{dA}\sqrt{900 + 3A} = \frac{3}{2\sqrt{900 + 3A}} \qquad ; \qquad \frac{d}{dA}\sqrt{900 - A} = \frac{-1}{2\sqrt{900 - A}}" />
                <p>
                  (les facteurs <M tex="3" /> et <M tex="-1" /> sont les dérivées internes de{" "}
                  <M tex="900 + 3A" /> et <M tex="900 - A" />
                  ). D'où, en gardant les poids <M tex="\tfrac{1}{2}" /> :
                </p>
                <MB tex="U'(A) = \frac{1}{2}\cdot\frac{3}{2\sqrt{900 + 3A}} - \frac{1}{2}\cdot\frac{1}{2\sqrt{900 - A}} = \frac{3}{4\sqrt{900 + 3A}} - \frac{1}{4\sqrt{900 - A}}" />
                <p>
                  <strong>Lecture :</strong> le premier terme est le gain marginal en utilité
                  (l'euro supplémentaire rapporte 3 dans l'état réussite), le second le coût
                  marginal (cet euro manque dans l'état échec). L'optimum les égalise.
                </p>
              </>
            ),
          },
          {
            title: "2.2 · Résoudre la CPO pas à pas jusqu'à A* = 600",
            refs: [{ chapter: "a3", section: "s7" }],
            content: (
              <>
                <p>
                  On pose <M tex="U'(A^*) = 0" />, c'est-à-dire gain marginal = coût marginal :
                </p>
                <MB tex="\frac{3}{4\sqrt{900 + 3A^*}} = \frac{1}{4\sqrt{900 - A^*}}" />
                <p>On multiplie les deux membres par 4 :</p>
                <MB tex="\frac{3}{\sqrt{900 + 3A^*}} = \frac{1}{\sqrt{900 - A^*}}" />
                <p>Produit en croix (les dénominateurs sont strictement positifs) :</p>
                <MB tex="3\sqrt{900 - A^*} = \sqrt{900 + 3A^*}" />
                <p>
                  On élève au carré — opération légitime car les deux membres sont positifs, donc
                  aucune solution parasite n'apparaît :
                </p>
                <MB tex="9\,(900 - A^*) = 900 + 3A^*" />
                <p>
                  On développe puis on regroupe les <M tex="A^*" /> à droite :
                </p>
                <MB tex="8100 - 9A^* = 900 + 3A^* \quad\Longleftrightarrow\quad 8100 - 900 = 3A^* + 9A^* \quad\Longleftrightarrow\quad 7200 = 12A^*" />
                <MB tex="A^* = \frac{7200}{12} = \textbf{600 euros}" />
                <p>
                  <strong>Vérifications :</strong> <M tex="A^* = 600 \in (0\,;\,900)" /> — la
                  solution est bien intérieure, les bornes ne mordent pas — et <M tex="U(A)" /> est
                  concave (somme de racines carrées concaves), donc la CPO caractérise bien un{" "}
                  <em>maximum</em> :
                </p>
                <CourbeInvestissement />
                <Callout variant="examen">
                  <p>
                    Les deux phrases de vérification — « solution intérieure » et « fonction concave
                    donc maximum » — valent des points au barème (2 pts ici) et ne coûtent que dix
                    secondes. Prends le réflexe de les écrire après <em>chaque</em> CPO.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 · Chiffrer l'optimum : U(A*) puis l'équivalent certain",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> <M tex="U(A^*)" /> est en « unités d'utilité »,
                  difficiles à interpréter. L'<strong>équivalent certain</strong> (EC) reconvertit
                  ce niveau d'utilité en euros sûrs — la seule échelle parlante. D'abord les
                  richesses finales à l'optimum :
                </p>
                <MB tex="900 + 3 \times 600 = 2700 \qquad ; \qquad 900 - 600 = 300" />
                <p>
                  Pour garder des valeurs exactes, on factorise sous les racines (
                  <M tex="2700 = 900 \times 3" />, <M tex="300 = 100 \times 3" />) :
                </p>
                <MB tex="\sqrt{2700} = 30\sqrt{3} \qquad ; \qquad \sqrt{300} = 10\sqrt{3}" />
                <MB tex="U(A^*) = \tfrac{1}{2}\,(30\sqrt{3} + 10\sqrt{3}) = 20\sqrt{3} \approx 34{,}64" />
                <p>
                  L'EC est le montant sûr qui procure exactement cette utilité :{" "}
                  <M tex="\sqrt{EC} = 20\sqrt{3}" />, donc
                </p>
                <MB tex="EC = (20\sqrt{3})^2 = 400 \times 3 = \textbf{1 200 euros}" />
                <p>
                  <strong>Comparaison :</strong> <M tex="EC = 1200 > 900 = w" /> (de façon
                  équivalente : <M tex="U(A^*) \approx 34{,}64 > 30 = u(900)" />
                  ). Investir <M tex="A^* = 600" /> vaut strictement mieux que ne rien investir : le
                  portefeuille risqué optimal « vaut », en euros sûrs, 300 de plus que la richesse
                  initiale.
                </p>
                <p>
                  Pour compléter l'interprétation, la valeur monétaire attendue et la prime de
                  risque :
                </p>
                <MB tex="\text{VMA} = \tfrac{1}{2} \times 2700 + \tfrac{1}{2} \times 300 = 1500 \qquad\Longrightarrow\qquad \text{prime de risque} = 1500 - 1200 = 300 \text{ euros}" />
                <Callout variant="intuition">
                  <p>
                    Trois nombres racontent toute l'histoire : le portefeuille « vaut » 1 500 en
                    moyenne, mais comme il est risqué, l'investisseuse le valorise 1 200 en euros
                    sûrs — elle « sacrifie » 300 euros de moyenne (la prime de risque) pour la
                    tranquillité. Et malgré ce sacrifice, 1 200 dépasse encore les 900 de départ :
                    voilà pourquoi elle investit.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.4 · Raisonner sans calcul : plus d'aversion ⇒ investir moins",
            refs: [{ chapter: "a3", section: "s5" }],
            content: (
              <>
                <p>
                  <strong>Réponse : plus faible.</strong> Le théorème de l'aversion au risque relie
                  la concavité de <M tex="u" /> à l'aversion : plus <M tex="u" /> est concave, plus
                  l'agent est averse au risque. Avec <M tex="\ln(w)" />, plus concave que{" "}
                  <M tex="\sqrt{w}" />, le scénario d'échec pèse plus lourd dans l'utilité espérée :
                  le « coût en utilité » de chaque euro exposé au risque augmente, alors que le gain
                  espéré du projet ne change pas. Le sommet de la courbe <M tex="U(A)" /> (vue à
                  l'étape 5) se déplace vers la gauche : <M tex="A^* < 600" />.
                </p>
                <p>
                  C'est la conclusion générale du chapitre A3 : à projet identique, plus d'aversion
                  au risque = un montant optimal plus petit. C'est aussi l'explication de « l'argent
                  qui dort » sur les comptes d'épargne.
                </p>
                <Callout
                  variant="methode"
                  title="Répondre à une question « sans refaire de calcul »"
                >
                  <p>
                    Le correcteur attend un <strong>théorème du cours</strong> (concavité ⇔ aversion
                    au risque) branché sur un <strong>mécanisme</strong> (le scénario d'échec pèse
                    plus lourd ⇒ le sommet de <M tex="U(A)" /> glisse vers la gauche). Théorème +
                    mécanisme + conclusion : trois phrases suffisent.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1)</strong> réussite : <M tex="900 + 3A" /> ; échec : <M tex="900 - A" /> ;{" "}
              <M tex="U(A) = \tfrac{1}{2}\sqrt{900 + 3A} + \tfrac{1}{2}\sqrt{900 - A}" />. ·{" "}
              <strong>2.2)</strong> <M tex="A^* = 600" /> euros (CPO :{" "}
              <M tex="3\sqrt{900 - A^*} = \sqrt{900 + 3A^*}" />
              ). · <strong>2.3)</strong> <M tex="U(A^*) = 20\sqrt{3} \approx 34{,}64" /> ;{" "}
              <M tex="EC = 1200 > 900" /> ; prime de risque = 300. · <strong>2.4)</strong> plus
              faible (plus de concavité = plus d'aversion = sommet déplacé vers la gauche).
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> richesses d'états → utilité espérée → CPO → vérifications
              → équivalent certain. Et toujours distinguer rendement brut (4A) et gain net (3A).
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex6" },
                { session: 1, exercise: "ex5" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* QUESTION 3 — Le jeu d'implantation commerciale                */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-2"
        id="q3"
        number={3}
        title="Question 3 — Le jeu d'implantation commerciale (50 pts)"
        difficulty={3}
        refs={[
          { chapter: "b4", section: "s7" },
          { chapter: "b1", section: "s5" },
          { chapter: "b3", section: "sec-fini" },
        ]}
        statement={
          <>
            <p>
              Considérez le jeu séquentiel suivant. La commune de Hombourg souhaite attirer des
              enseignes d'ameublement sur son territoire. Elle doit choisir laquelle de ses deux
              zones commerciales aménager : la <strong>zone Est (E)</strong>, vaste et située le
              long de la nationale, ou la <strong>zone Ouest (O)</strong>, plus petite. Une fois la
              zone aménagée, l'enseigne A décide d'y <strong>investir (I)</strong> — c'est-à-dire
              d'y construire un magasin — ou de <strong>ne pas investir (N)</strong>. Après avoir
              observé la décision de A, l'enseigne B décide à son tour d'investir (I) ou non (N). Il
              y a donc trois joueurs : la commune (C), l'enseigne A et l'enseigne B.
            </p>
            <ArbreImplantation
              ariaLabel="Forme extensive du jeu d'implantation : la commune choisit E ou O, puis l'enseigne A choisit I ou N, puis l'enseigne B choisit I ou N ; huit issues avec payoffs"
              caption={
                <>
                  Forme extensive du jeu d'implantation. Payoffs empilés <M tex="(C\,;\ A\,;\ B)" />{" "}
                  : <LegendeJoueurs />. Actions : E = aménager la zone Est, O = aménager la zone
                  Ouest ; I = investir, N = ne pas investir.
                </>
              }
            />
            <SubQuestion label="3.1)">
              Donnez un exemple de stratégie pour l'enseigne B. (6 points)
            </SubQuestion>
            <SubQuestion label="3.2)">
              Donnez l'ensemble des stratégies de l'enseigne A. (8 points)
            </SubQuestion>
            <SubQuestion label="3.3)">
              En utilisant le raisonnement de backward induction, identifiez un équilibre de Nash
              parfait en sous-jeux (ENPS). Détaillez votre raisonnement. (20 points)
            </SubQuestion>
            <SubQuestion label="3.4)">
              Selon cet ENPS, quel est le résultat effectif du jeu : quelle zone est aménagée,
              quelle(s) enseigne(s) investissent, et quels sont les payoffs des trois joueurs ? (6
              points)
            </SubQuestion>
            <SubQuestion label="3.5)">
              Donnez un équilibre de Nash de ce jeu qui n'est <em>pas</em> parfait en sous-jeux.
              Vérifiez qu'il s'agit bien d'un équilibre de Nash, puis expliquez précisément pourquoi
              il n'est pas parfait en sous-jeux : quelle menace n'est pas crédible ? (10 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : un jeu séquentiel se résout en remontant l'arbre",
            refs: [
              { chapter: "b4", section: "s7" },
              { chapter: "b1", section: "s1" },
            ],
            content: (
              <>
                <p>
                  <strong>Type de question :</strong> un{" "}
                  <strong>jeu séquentiel à information parfaite</strong> — chaque joueur observe
                  tout ce qui s'est joué avant lui (« après avoir observé la décision de A… »).
                  Trois indices dans l'énoncé : la <em>forme extensive</em> (l'arbre), l'ordre des
                  coups (C, puis A, puis B), et la demande explicite d'un{" "}
                  <em>ENPS par backward induction</em>.
                </p>
                <p>
                  <strong>La méthode :</strong> deux outils, dans cet ordre. D'abord bien définir ce
                  qu'est une <strong>stratégie</strong> dans un arbre (questions 3.1–3.2) : un plan
                  d'action <em>complet</em>, une action à <em>chaque</em> nœud du joueur. Ensuite la{" "}
                  <strong>backward induction</strong> (questions 3.3–3.4) : résoudre les derniers
                  nœuds, remplacer chaque nœud résolu par son issue, et remonter jusqu'à la racine.
                  La question 3.5 teste la compréhension fine : tout ENPS est un équilibre de Nash,
                  mais l'inverse est faux — à cause des menaces non crédibles.
                </p>
                <Callout
                  variant="methode"
                  title="Compter les nœuds AVANT de compter les stratégies"
                >
                  <p>
                    Avant toute chose, repère sur l'arbre : la commune joue à{" "}
                    <strong>1 nœud</strong> (la racine), A joue à <strong>2 nœuds</strong> (après E,
                    après O), B joue à <strong>4 nœuds</strong> (après (E, I), (E, N), (O, I), (O,
                    N)). Une stratégie de B est donc un <em>quadruplet</em>, une stratégie de A une{" "}
                    <em>paire</em>, une stratégie de C une simple action.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.1 · Écrire une stratégie de B : un quadruplet, pas une action",
            refs: [
              { chapter: "b4", section: "s7" },
              { chapter: "b1", section: "s2" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> une stratégie doit dire ce que B ferait dans{" "}
                  <em>toutes</em> les circonstances où il pourrait avoir à jouer — y compris aux
                  nœuds qui ne seront jamais atteints en équilibre. B possède quatre nœuds de
                  décision, identifiés par l'histoire qui y mène : (E, I), (E, N), (O, I) et (O, N).
                  Un exemple de stratégie valide :
                </p>
                <MB tex="S_B = (\,\text{I si (E, I)}\;;\ \text{N si (E, N)}\;;\ \text{I si (O, I)}\;;\ \text{N si (O, N)}\,)" />
                <p>
                  N'importe quel autre quadruplet ferait l'affaire — il y en a <M tex="2^4 = 16" />{" "}
                  en tout (2 actions possibles à chacun des 4 nœuds).
                </p>
                <Callout variant="attention">
                  <p>
                    L'erreur classique — sanctionnée par 0 point au barème — est de répondre « B
                    investit » ou « I si A a investi » : ce sont des réponses qui ne couvrent qu'un
                    ou deux nœuds. Une stratégie est un <strong>plan complet</strong> : elle doit
                    prescrire une action aux <em>quatre</em> nœuds, même ceux hors du chemin
                    d'équilibre.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 · Lister l'ensemble des stratégies de A : 2 × 2 = 4 paires",
            refs: [{ chapter: "b1", section: "s2" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> A joue à deux nœuds (après E et après O) avec 2
                  actions à chacun. Le nombre de plans complets est donc <M tex="2 \times 2 = 4" />{" "}
                  — chaque plan combine une action « si E » et une action « si O » :
                </p>
                <MB tex="\mathcal{S}_A = \bigl\{\, (\text{I si E};\ \text{I si O}),\ (\text{I si E};\ \text{N si O}),\ (\text{N si E};\ \text{I si O}),\ (\text{N si E};\ \text{N si O}) \,\bigr\}" />
                <Callout variant="examen">
                  <p>
                    Le barème donne 2 pts par stratégie <em>correctement écrite</em> : les quatre
                    doivent être conditionnelles à la zone (« I si E ; N si O »), pas de simples
                    actions (« I », « N »). L'écriture conditionnelle est exactement ce qui est
                    évalué ici.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 · Résoudre d'abord les 4 nœuds de B (le dernier à jouer)",
            refs: [{ chapter: "b3", section: "sec-fini" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi commencer par B :</strong> B joue en dernier, donc à chacun de
                  ses nœuds il n'a plus rien à anticiper — il compare simplement son propre payoff
                  (le 3<sup>e</sup> de chaque triplet) entre I et N :
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    Nœud (E, I) : I donne <strong>3</strong>, N donne 0 → <strong>B joue I</strong>{" "}
                    ;
                  </li>
                  <li>
                    Nœud (E, N) : I donne <strong>6</strong>, N donne 0 → <strong>B joue I</strong>{" "}
                    ;
                  </li>
                  <li>
                    Nœud (O, I) : I donne <M tex="-2" />, N donne <strong>0</strong> →{" "}
                    <strong>B joue N</strong> — la petite zone Ouest ne supporte pas deux magasins ;
                  </li>
                  <li>
                    Nœud (O, N) : I donne <strong>4</strong>, N donne 0 → <strong>B joue I</strong>.
                  </li>
                </ul>
                <ArbreImplantation
                  surligne={["bEI:I", "bEN:I", "bOI:N", "bON:I"]}
                  ariaLabel="Arbre du jeu avec les choix optimaux de B surlignés : I aux nœuds (E,I), (E,N) et (O,N), N au nœud (O,I)"
                  caption={
                    <>
                      Étape 1 de la backward induction : à chaque nœud de B, la branche{" "}
                      <span className="font-semibold" style={{ color: HL }}>
                        verte
                      </span>{" "}
                      est celle qui maximise le 3<sup>e</sup> payoff. Le seul nœud où B reste dehors
                      est (O, I) : y investir donnerait −2.
                    </>
                  }
                />
                <Callout variant="methode" title="Backward induction — la recette">
                  <p>
                    (1) Va aux nœuds dont <em>toutes</em> les branches mènent à des payoffs — les
                    derniers décideurs. (2) À chacun, garde la branche qui maximise le payoff{" "}
                    <em>du joueur qui y décide</em>. (3) Remplace mentalement chaque nœud résolu par
                    l'issue retenue. (4) Remonte d'un cran et recommence, jusqu'à la racine.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 · Remonter aux 2 nœuds de A, qui anticipe les réponses de B",
            refs: [{ chapter: "b3", section: "sec-fini" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> maintenant que les réactions de B sont connues, chaque
                  action de A mène à une issue <em>déterminée</em>. A compare son propre payoff (le
                  2<sup>e</sup> du triplet) :
                </p>
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    <strong>Après E</strong> : s'il joue I, B répond I → issue (E, I, I) → A obtient{" "}
                    <strong>3</strong> ; s'il joue N, B répond I → issue (E, N, I) → A obtient 0.
                    Donc <strong>A joue I</strong>.
                  </li>
                  <li>
                    <strong>Après O</strong> : s'il joue I, B répond N → issue (O, I, N) → A obtient{" "}
                    <strong>5</strong> ; s'il joue N, B répond I → issue (O, N, I) → A obtient 0.
                    Donc <strong>A joue I</strong>.
                  </li>
                </ul>
                <p>
                  <strong>Le détail subtil du nœud O :</strong> A y gagne 5{" "}
                  <em>précisément parce que</em> B restera dehors (« N » au nœud (O, I), résolu à
                  l'étape précédente). Dans la petite zone, le premier arrivé décourage l'entrée du
                  second — un avantage du premier joueur que la backward induction fait apparaître
                  toute seule.
                </p>
              </>
            ),
          },
          {
            title: "3.3 · Trancher à la racine et écrire l'ENPS complet",
            refs: [
              { chapter: "b3", section: "sec-fini" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  <strong>La commune anticipe tout ce qui précède</strong> (elle compare son payoff,
                  le 1<sup>er</sup> du triplet) : E mène à (E, I, I) → C obtient <strong>8</strong>{" "}
                  ; O mène à (O, I, N) → C obtient 3. Donc <strong>C choisit E</strong>.
                </p>
                <ArbreImplantation
                  surligne={["C:E", "aE:I", "aO:I", "bEI:I", "bEN:I", "bOI:N", "bON:I"]}
                  equilibre
                  ariaLabel="Arbre entièrement résolu : les choix optimaux de chaque joueur à chaque nœud sont surlignés et l'issue d'équilibre (E, I, I) avec payoffs 8, 3, 3 est entourée"
                  caption={
                    <>
                      L'arbre entièrement résolu : chaque nœud garde sa branche optimale, et le
                      chemin d'équilibre E → I → I aboutit à l'issue entourée{" "}
                      <M tex="(8\,;\ 3\,;\ 3)" />. Les branches vertes <em>hors</em> du chemin (aux
                      nœuds (E, N), (O, I), (O, N) et au nœud O de A) font partie intégrante des
                      stratégies d'équilibre.
                    </>
                  }
                />
                <p>
                  L'ENPS s'écrit avec les <em>stratégies complètes</em> des trois joueurs :
                </p>
                <MB tex="S^*_C = \text{E}" />
                <MB tex="S^*_A = (\,\text{I si E}\;;\ \text{I si O}\,)" />
                <MB tex="S^*_B = (\,\text{I si (E, I)}\;;\ \text{I si (E, N)}\;;\ \text{N si (O, I)}\;;\ \text{I si (O, N)}\,)" />
                <Callout variant="examen">
                  <p>
                    Sur les 20 points de la question, 3 sont réservés à l'écriture des{" "}
                    <strong>trois stratégies complètes</strong>. Répondre « l'équilibre est (E, I,
                    I) » fait perdre ces points : (E, I, I) est le <em>résultat</em>, pas
                    l'équilibre. L'ENPS doit prescrire une action à chaque nœud — même au nœud (O,
                    I) que personne n'atteindra jamais.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.4 · Lire le résultat effectif le long du chemin d'équilibre",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  On suit les branches vertes depuis la racine : la commune aménage la{" "}
                  <strong>zone Est</strong>, l'enseigne A <strong>investit</strong>, puis l'enseigne
                  B <strong>investit</strong> aussi. Le résultat effectif est (E, I, I) avec les
                  payoffs :
                </p>
                <MB tex="(\,C\;;\ A\;;\ B\,) = (\,8\;;\ 3\;;\ 3\,)" />
                <Callout variant="attention" title="Stratégie ≠ résultat">
                  <p>
                    La question 3.3 demandait des <em>stratégies</em> (des plans complets, avec
                    leurs prescriptions hors chemin) ; la 3.4 demande le <em>résultat</em> (le
                    chemin effectivement suivi et les payoffs). Confondre les deux est l'erreur la
                    plus fréquente de tout le chapitre — l'examen la teste ici explicitement, en
                    posant les deux questions côte à côte.
                  </p>
                </Callout>
                <p>
                  <strong>Sens économique :</strong> la grande zone Est peut accueillir les deux
                  magasins avec profit (3 chacun) et rapporte le maximum à la commune (8). Dans la
                  petite zone Ouest, il n'y a de place que pour un seul magasin — d'où des payoffs
                  plus faibles pour tout le monde.
                </p>
              </>
            ),
          },
          {
            title: "3.5 · Construire un équilibre de Nash NON parfait : la menace non crédible",
            refs: [
              { chapter: "b1", section: "s5" },
              { chapter: "b3", section: "sec-fini" },
            ],
            content: (
              <>
                <p>
                  <strong>L'idée :</strong> un équilibre de Nash n'exige que des meilleures réponses{" "}
                  <em>étant donné les stratégies des autres</em> — ce qui se passerait aux nœuds
                  jamais atteints n'affecte le payoff de personne. On peut donc y glisser des «
                  menaces » absurdes, tant qu'elles ne sont jamais mises à l'épreuve. Considérons le
                  profil suivant (une réponse parmi d'autres possibles) :
                </p>
                <MB tex="S_C = \text{E} \;;\qquad S_A = (\,\text{I si E}\;;\ \text{N si O}\,) \;;\qquad S_B = (\,\text{I}\;;\ \text{I}\;;\ \text{I}\;;\ \text{I}\,)" />
                <p>
                  où B « menace » d'investir <em>partout</em>, y compris au nœud (O, I) — autrement
                  dit : « si la commune aménage l'Ouest et que A s'y installe, nous ouvrirons quand
                  même, tant pis pour les pertes ».
                </p>
                <p>
                  <strong>Vérifions que c'est bien un équilibre de Nash</strong> — joueur par joueur
                  :
                </p>
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    <strong>Commune</strong> : avec ces stratégies, E → (E, I, I) → payoff{" "}
                    <strong>8</strong> ; dévier vers O → A joue N, B joue I au nœud (O, N) → (O, N,
                    I) → payoff 2. Comme <M tex="8 > 2" />, E est optimal.
                  </li>
                  <li>
                    <strong>Enseigne A</strong> : étant donné <M tex="S_C = \text{E}" />, jouer I
                    rapporte 3 ; jouer N rapporterait 0 (B investirait au nœud (E, N)). « I si E »
                    est optimal. Son action au nœud O, jamais atteint, n'affecte pas son payoff — et
                    « N si O » y est d'ailleurs la meilleure réponse à la menace de B (I donnerait{" "}
                    <M tex="-2" />
                    ).
                  </li>
                  <li>
                    <strong>Enseigne B</strong> : seul le nœud (E, I) est atteint ; y jouer I
                    rapporte <M tex="3 > 0" />. Ses actions aux trois autres nœuds, jamais atteints,
                    ne changent rien à son payoff. Aucune déviation profitable.
                  </li>
                </ul>
                <p>
                  <strong>Mais il n'est pas parfait en sous-jeux :</strong> dans le sous-jeu qui
                  commence au nœud (O, I), la stratégie de B prescrit I, qui rapporte <M tex="-2" />
                  , alors que N rapporte 0. B n'y joue pas une meilleure réponse : la menace d'une «
                  guerre d'implantation » à l'Ouest est <strong>non crédible</strong> — si ce nœud
                  était réellement atteint, B ne la mettrait pas à exécution. La backward induction
                  de la question 3.3 élimine précisément ce type de menaces.
                </p>
                <Callout variant="intuition" title="À quoi sert la perfection en sous-jeux ?">
                  <p>
                    L'ENPS exige une meilleure réponse <em>dans chaque sous-jeu</em>, atteint ou non
                    : c'est un filtre à promesses et menaces en l'air. Ne survivent que les plans
                    qu'un joueur aurait vraiment intérêt à exécuter le moment venu — le même
                    principe que l'engagement crédible du TP 3 (« brûler ses navires »).
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1)</strong>{" "}
              <M tex="S_B = (\,\text{I si (E, I)}\;;\ \text{N si (E, N)}\;;\ \text{I si (O, I)}\;;\ \text{N si (O, N)}\,)" />{" "}
              (tout quadruplet complet est accepté). · <strong>3.2)</strong> 4 stratégies :{" "}
              <M tex="\mathcal{S}_A = \{(\text{I};\text{I}), (\text{I};\text{N}), (\text{N};\text{I}), (\text{N};\text{N})\}" />{" "}
              conditionnelles à E/O. · <strong>3.3)</strong> <M tex="S^*_C = \text{E}" /> ;{" "}
              <M tex="S^*_A = (\text{I si E};\ \text{I si O})" /> ;{" "}
              <M tex="S^*_B = (\text{I};\ \text{I};\ \text{N};\ \text{I})" />. ·{" "}
              <strong>3.4)</strong> zone Est aménagée, les deux enseignes investissent, payoffs{" "}
              <M tex="(8\,;\ 3\,;\ 3)" />. · <strong>3.5)</strong> par exemple{" "}
              <M tex="S_C = \text{E}" />, <M tex="S_A = (\text{I};\text{N})" />,{" "}
              <M tex="S_B = (\text{I};\text{I};\text{I};\text{I})" /> : équilibre de Nash, mais la
              menace de B d'investir au nœud (O, I) (payoff −2 au lieu de 0) est non crédible.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> stratégie = plan complet (une action par nœud) ; backward
              induction = résoudre les derniers nœuds puis remonter ; ENPS = équilibre de Nash
              débarrassé des menaces non crédibles.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 3, exercise: "ex3" },
                { session: 3, exercise: "ex2" },
                { session: 3, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* QUESTION 4 — La guerre des prix des deux stations-service     */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-2"
        id="q4"
        number={4}
        title="Question 4 — La guerre des prix des deux stations-service (30 pts)"
        difficulty={3}
        refs={[
          { chapter: "b1", section: "s3" },
          { chapter: "b3", section: "sec-grim" },
        ]}
        statement={
          <>
            <p>
              Deux stations-service, Rivoli (station 1) et Grandsart (station 2), sont installées
              face à face à l'entrée d'un village. Chaque lundi matin, chacune affiche simultanément
              soit un <strong>prix élevé (H)</strong>, soit un <strong>prix cassé (B)</strong>, pour
              la semaine. Les profits hebdomadaires (en centaines d'euros) sont donnés par la
              matrice suivante :
            </p>
            <PayoffMatrix
              rowPlayer="Station 1 (Rivoli)"
              colPlayer="Station 2 (Grandsart)"
              rows={["H", "B"]}
              cols={["H", "B"]}
              payoffs={[
                [
                  [8, 8],
                  [0, 14],
                ],
                [
                  [14, 0],
                  [4, 4],
                ],
              ]}
              interactive
              caption={
                <>
                  Profits hebdomadaires en centaines d'euros, lus (station 1 ; station 2). Clique
                  sur les boutons pour explorer les meilleures réponses et l'équilibre de Nash.
                </>
              }
            />
            <SubQuestion label="4.1)">
              Montrez que, si ce jeu n'est joué qu'une seule fois, (B, B) est l'<em>unique</em>{" "}
              équilibre de Nash. Détaillez votre raisonnement. (8 points)
            </SubQuestion>
            <SubQuestion label="4.2)">
              Le jeu est maintenant répété à l'infini et chaque station observe le prix de sa rivale
              à la fin de chaque semaine. Les deux stations ont le même facteur d'escompte{" "}
              <M tex="\delta \in (0,1)" /> et cherchent à soutenir la collusion (H, H) à l'aide de
              stratégies <em>grim</em> : jouer H tant que personne n'a jamais joué B, et jouer B
              pour toujours dès qu'un prix B a été observé. Montrez que (grim, grim) est un
              équilibre si et seulement si <M tex="\delta \ge \tfrac{3}{5}" />. Détaillez le calcul.
              (14 points)
            </SubQuestion>
            <SubQuestion label="4.3)">
              Supposez maintenant que la détection soit retardée : une station qui casse son prix
              n'est repérée par sa rivale qu'au bout de deux semaines. Une station qui dévie touche
              donc son profit de déviation pendant deux semaines (<M tex="t = 0" /> et{" "}
              <M tex="t = 1" />
              ), et la punition ne commence qu'en <M tex="t = 2" />. Établissez la nouvelle
              condition sur <M tex="\delta" /> pour que la collusion soit soutenable, puis
              comparez-la à celle de la question 4.2 et interprétez (2 à 3 lignes). (8 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : un dilemme du prisonnier, puis sa version répétée",
            refs: [
              { chapter: "b3", section: "sec-cadre" },
              { chapter: "b1", section: "s3" },
            ],
            content: (
              <>
                <p>
                  <strong>Type de question :</strong> le grand classique du chapitre B3. La 4.1 est
                  une question de <strong>jeu simultané en un coup</strong> (dominance, équilibre de
                  Nash — chapitre B1). Les 4.2 et 4.3 basculent dans le{" "}
                  <strong>jeu répété à l'infini</strong> : les mots « répété à l'infini », « facteur
                  d'escompte » et « stratégies grim » commandent une seule et même méthode —
                  comparer la valeur de la coopération éternelle à celle de la meilleure déviation.
                </p>
                <p>
                  La 4.3 est la variante originale de cet examen : la détection prend deux semaines.
                  La méthode ne change pas, seul le <em>timing</em> des flux change — c'est un test
                  de compréhension, pas de mémoire.
                </p>
                <Callout
                  variant="methode"
                  title="Les trois briques de toute condition de collusion"
                >
                  <p>
                    <M tex="\Pi^{C}" /> = la valeur de la coopération éternelle ;{" "}
                    <M tex="\Pi^{D}" /> = tentation immédiate + valeur de la punition éternelle ;
                    condition d'équilibre : <M tex="\Pi^{C} \ge \Pi^{D}" />. Identifie ces trois
                    briques dans l'énoncé <em>avant</em> d'écrire la moindre somme.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 · Montrer que B domine strictement H, puis conclure",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi la dominance :</strong> pour prouver qu'un équilibre est{" "}
                  <em>unique</em>, l'argument le plus rapide est une stratégie strictement
                  dominante. Pour la station 1 (le jeu est symétrique), comparons B et H contre
                  chaque choix de la rivale :
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    si la rivale joue H : B donne 14, H donne 8 — <M tex="14 > 8" /> ;
                  </li>
                  <li>
                    si la rivale joue B : B donne 4, H donne 0 — <M tex="4 > 0" />.
                  </li>
                </ul>
                <p>
                  B rapporte strictement plus <em>quoi que fasse l'autre</em> : B{" "}
                  <strong>domine strictement</strong> H, pour chacune des deux stations.
                </p>
                <PayoffMatrix
                  rowPlayer="Station 1 (Rivoli)"
                  colPlayer="Station 2 (Grandsart)"
                  rows={["H", "B"]}
                  cols={["H", "B"]}
                  payoffs={[
                    [
                      [8, 8],
                      [0, 14],
                    ],
                    [
                      [14, 0],
                      [4, 4],
                    ],
                  ]}
                  showBestResponses
                  highlight={[[1, 1]]}
                  caption={
                    <>
                      Les payoffs soulignés sont les meilleures réponses : B l'est toujours, pour
                      les deux stations. La seule case où les deux payoffs sont soulignés est (B, B)
                      — l'unique équilibre de Nash.
                    </>
                  }
                />
                <p>
                  <strong>(B, B) est un équilibre de Nash :</strong> dévier seule vers H ferait
                  passer une station de 4 à 0. <strong>Il est unique :</strong> dans tout autre
                  profil, au moins une station joue H et obtiendrait strictement plus en passant à B
                  (sa stratégie strictement dominante) — aucun autre profil ne peut donc être un
                  équilibre.
                </p>
                <Callout
                  variant="intuition"
                  title="Reconnais la structure : c'est un dilemme du prisonnier"
                >
                  <p>
                    (B, B) donne (4 ; 4) alors que (H, H) donnerait (8 ; 8) : l'équilibre est
                    Pareto-dominé par la coopération. Cette tension — rationalité individuelle
                    contre intérêt collectif — est exactement ce que la répétition du jeu va tenter
                    de résoudre dans les questions suivantes.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.2 · Poser la valeur de la coopération éternelle : 8/(1−δ)",
            refs: [{ chapter: "b3", section: "sec-infini" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi :</strong> on veut montrer que « grim contre grim » est un
                  équilibre, c'est-à-dire que dévier n'est pas profitable. Comme le jeu répété est
                  identique à chaque date, on peut sans perte de généralité placer une éventuelle
                  première déviation en <M tex="t = 0" /> et comparer deux trajectoires complètes de
                  profits actualisés.
                </p>
                <p>
                  <strong>Trajectoire « coopérer toujours »</strong> : personne ne casse les prix,
                  chaque station touche 8 chaque semaine, pour toujours :
                </p>
                <MB tex="\Pi^{C} = 8 + 8\delta + 8\delta^2 + \dots = \frac{8}{1-\delta}" />
                <p>où l'on a utilisé la somme de la série géométrique, l'outil clé du chapitre :</p>
                <FormulaBox
                  label="Série géométrique (à connaître par cœur)"
                  tex="1 + \delta + \delta^2 + \delta^3 + \dots = \frac{1}{1-\delta} \qquad (0 < \delta < 1)"
                  caption={
                    <>
                      Un flux constant de <M tex="x" /> par période vaut donc{" "}
                      <M tex="x/(1-\delta)" /> ; s'il ne commence qu'en <M tex="t = 1" />, il vaut{" "}
                      <M tex="\delta x/(1-\delta)" />.
                    </>
                  }
                />
              </>
            ),
          },
          {
            title: "4.2 · Poser la valeur de la meilleure déviation : 14 + 4δ/(1−δ)",
            refs: [{ chapter: "b3", section: "sec-grim" }],
            content: (
              <>
                <p>
                  <strong>Trajectoire « dévier en t = 0 »</strong> : la déviatrice casse ses prix
                  (B) pendant que la rivale, fidèle à grim, affiche encore H — elle empoche{" "}
                  <strong>14</strong> la première semaine. Dès la semaine suivante, la rivale a vu
                  le B et joue B <em>pour toujours</em> (la punition grim). Face à ce B éternel, la
                  meilleure chose que la déviatrice puisse faire est de jouer B aussi (4 plutôt que
                  0) :
                </p>
                <MB tex="\Pi^{D} = 14 + 4\delta + 4\delta^2 + \dots = 14 + \delta \cdot \frac{4}{1-\delta}" />
                <Callout variant="attention" title="Le δ devant la punition — la faute classique">
                  <p>
                    La punition ne commence que la semaine <em>suivante</em> : son flux de 4 est
                    donc actualisé par <M tex="\delta" /> — d'où <M tex="4\delta/(1-\delta)" /> et
                    non <M tex="4/(1-\delta)" />. Oublier ce <M tex="\delta" /> fausse le seuil
                    final et coûte l'essentiel des points.
                  </p>
                </Callout>
                <Callout variant="examen" title="Justifier le mot « meilleure » déviation">
                  <p>
                    Le barème (5 pts sur cette brique) attend la justification : après la déviation,
                    la rivale joue B pour toujours, et la meilleure réponse à B est B (4 &gt; 0).
                    C'est pour cela que la trajectoire de déviation vaut{" "}
                    <M tex="14 + 4\delta/(1-\delta)" /> et pas autre chose : si dévier ne bat pas la
                    coopération, aucune déviation ne la bat.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.2 · Résoudre l'inégalité jusqu'à δ ≥ 3/5",
            refs: [{ chapter: "b3", section: "sec-grim" }],
            content: (
              <>
                <p>
                  <strong>Condition d'équilibre :</strong> coopérer doit rapporter au moins autant
                  que dévier :
                </p>
                <MB tex="\frac{8}{1-\delta} \;\ge\; 14 + \frac{4\delta}{1-\delta}" />
                <p>
                  On multiplie les deux membres par <M tex="(1-\delta) > 0" /> — le sens de
                  l'inégalité est conservé :
                </p>
                <MB tex="8 \;\ge\; 14\,(1-\delta) + 4\delta" />
                <p>On développe le membre de droite :</p>
                <MB tex="8 \;\ge\; 14 - 14\delta + 4\delta = 14 - 10\delta" />
                <p>
                  On isole <M tex="\delta" /> :
                </p>
                <MB tex="10\delta \;\ge\; 14 - 8 = 6 \quad\Longleftrightarrow\quad \delta \;\ge\; \tfrac{6}{10} = \tfrac{3}{5}" />
                <p>
                  Par symétrie, le même calcul vaut pour l'autre station :{" "}
                  <strong>
                    (grim, grim) est un équilibre si et seulement si{" "}
                    <M tex="\delta \ge \tfrac{3}{5}" />
                  </strong>
                  . Interprétation des trois morceaux : <M tex="8/(1-\delta)" /> = la collusion
                  éternelle, 14 = la tentation immédiate, <M tex="4\delta/(1-\delta)" /> = la
                  punition éternelle qui commence la semaine suivante. Il faut des stations
                  suffisamment patientes (<M tex="\delta" /> élevé) pour que la promesse des 8
                  hebdomadaires l'emporte sur le coup unique à 14.
                </p>
              </>
            ),
          },
          {
            title: "4.3 · Refaire le calcul avec deux semaines de tentation",
            refs: [
              { chapter: "b3", section: "sec-grim" },
              { chapter: "b3", section: "sec-infini" },
            ],
            content: (
              <>
                <p>
                  <strong>Ce qui change — et rien d'autre :</strong> la déviatrice n'est repérée
                  qu'au bout de deux semaines. Elle touche donc 14 en <M tex="t = 0" /> <em>et</em>{" "}
                  en <M tex="t = 1" /> (la rivale, qui n'a encore rien vu, affiche toujours H), et
                  la punition — B pour toujours, meilleure réponse B, profit 4 — ne commence qu'en{" "}
                  <M tex="t = 2" /> :
                </p>
                <MB tex="\Pi^{D}_{\text{retard}} = 14 + 14\delta + 4\delta^2 + 4\delta^3 + \dots = 14\,(1 + \delta) + \frac{4\delta^2}{1-\delta}" />
                <p>
                  (le flux de punition commence en <M tex="t = 2" />, d'où le facteur{" "}
                  <M tex="\delta^2" />
                  ). La condition de soutenabilité devient :
                </p>
                <MB tex="\frac{8}{1-\delta} \;\ge\; 14\,(1 + \delta) + \frac{4\delta^2}{1-\delta}" />
                <p>
                  On multiplie par <M tex="(1-\delta) > 0" />, en utilisant l'identité remarquable{" "}
                  <M tex="(1+\delta)(1-\delta) = 1 - \delta^2" /> :
                </p>
                <MB tex="8 \;\ge\; 14\,(1 - \delta^2) + 4\delta^2 = 14 - 14\delta^2 + 4\delta^2 = 14 - 10\delta^2" />
                <p>
                  On isole <M tex="\delta^2" /> puis on prend la racine :
                </p>
                <MB tex="10\delta^2 \;\ge\; 6 \quad\Longleftrightarrow\quad \delta^2 \;\ge\; \tfrac{3}{5} \quad\Longleftrightarrow\quad \delta \;\ge\; \sqrt{\tfrac{3}{5}} \approx 0{,}77" />
                <Callout variant="methode" title="Le réflexe transposable">
                  <p>
                    Détection au bout de <M tex="m" /> périodes ⇒ la tentation dure <M tex="m" />{" "}
                    périodes et la punition démarre en <M tex="t = m" /> : remplace <M tex="14" />{" "}
                    par <M tex="14\,(1 + \delta + \dots + \delta^{m-1})" /> et{" "}
                    <M tex="4\delta/(1-\delta)" /> par <M tex="4\delta^{m}/(1-\delta)" />. Ici le
                    seuil sur <M tex="\delta" /> passe de <M tex="\tfrac{3}{5}" /> à{" "}
                    <M tex="\delta^2 \ge \tfrac{3}{5}" /> — la structure du calcul est inchangée.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Comparer les deux seuils et interpréter",
            refs: [{ chapter: "b3", section: "sec-interp" }],
            content: (
              <>
                <p>
                  La condition <M tex="\delta \ge \sqrt{3/5} \approx 0{,}77" /> est{" "}
                  <strong>plus stricte</strong> que <M tex="\delta \ge 3/5 = 0{,}60" /> : la
                  tentation dure désormais deux semaines et la punition est repoussée d'autant. Il
                  faut des joueuses nettement plus patientes pour soutenir la collusion :
                </p>
                <EchelleDelta />
                <p>
                  <strong>Enseignement général :</strong> plus la détection des déviations est
                  lente, plus la collusion est difficile à soutenir. C'est pourquoi les cartels
                  investissent dans la surveillance mutuelle (prix affichés, réunions…) — et
                  pourquoi, symétriquement, les autorités de concurrence se méfient de tout ce qui
                  rend les prix des rivaux trop observables trop vite.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>4.1)</strong> B domine strictement H (14 &gt; 8 et 4 &gt; 0) pour chaque
              station ⇒ (B, B) est l'unique équilibre de Nash du jeu en un coup. ·{" "}
              <strong>4.2)</strong> <M tex="\Pi^{C} = \tfrac{8}{1-\delta}" /> contre{" "}
              <M tex="\Pi^{D} = 14 + \tfrac{4\delta}{1-\delta}" /> ⇒ (grim, grim) est un équilibre
              si et seulement si <M tex="\delta \ge \tfrac{3}{5} = 0{,}60" />. ·{" "}
              <strong>4.3)</strong> avec détection en deux semaines,{" "}
              <M tex="\Pi^{D} = 14(1+\delta) + \tfrac{4\delta^2}{1-\delta}" /> ⇒{" "}
              <M tex="\delta \ge \sqrt{\tfrac{3}{5}} \approx 0{,}77" /> : condition plus stricte —
              détection lente = collusion plus fragile.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> collusion soutenable ⇔{" "}
              <M tex="\tfrac{\text{coopération}}{1-\delta} \ge \text{tentation} + \text{punition actualisée}" />{" "}
              — et le facteur d'actualisation devant la punition suit toujours la date où elle
              commence.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 3, exercise: "ex4" },
                { session: 2, exercise: "ex1" },
                { session: 2, exercise: "ex3" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* QUESTION 5 — Questions de compréhension                       */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-2"
        id="q5"
        number={5}
        title="Question 5 — Questions de compréhension (30 pts)"
        difficulty={2}
        refs={[
          { chapter: "a1", section: "dotation" },
          { chapter: "a2", section: "commit" },
          { chapter: "b4", section: "s4" },
        ]}
        statement={
          <>
            <SubQuestion label="5.1)">
              Lors d'une brocante organisée par un kot-à-projet namurois, la moitié des visiteurs,
              tirés au sort à l'entrée, reçoivent gratuitement un mug sérigraphié. Une heure plus
              tard, on interroge tous les visiteurs : ceux qui ont reçu un mug ne sont disposés à le
              céder que contre 9 euros au moins (en moyenne), tandis que ceux qui n'en ont pas reçu
              ne sont disposés à payer que 4 euros au plus (en moyenne) pour en obtenir un. Quel
              biais comportemental cette observation illustre-t-elle ? Expliquez en quoi elle
              constitue une déviation par rapport à la théorie de la décision rationnelle. (10
              points)
            </SubQuestion>
            <SubQuestion label="5.2)">
              Qu'est-ce qu'un « commitment device » ? Donnez un exemple concret, puis expliquez
              pourquoi un individu rationnel (<M tex="\beta = 1" />) n'a jamais besoin d'un tel
              dispositif — et n'est en particulier jamais prêt à payer pour en obtenir un. (10
              points)
            </SubQuestion>
            <SubQuestion label="5.3)">
              Dans un jeu à information incomplète (jeu bayésien) : qu'est-ce que le <em>type</em>{" "}
              d'un joueur ? Qu'est-ce qu'une <em>stratégie</em> ? Illustrez à l'aide du mini-exemple
              suivant : un joueur peut être de 2 types possibles et dispose de 3 actions possibles —
              combien de stratégies possède-t-il ? Justifiez. (10 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : trois questions de cours, trois chapitres",
            refs: [
              { chapter: "a1", section: "comporte" },
              { chapter: "a2", section: "commit" },
              { chapter: "b4", section: "s2" },
            ],
            content: (
              <>
                <p>
                  <strong>Type de question :</strong> trois questions de compréhension
                  indépendantes, qui balaient trois chapitres : l'économie comportementale (A1 — le
                  scénario du mug), le self-contrôle (A2 — le commitment device, en écho direct à la
                  question 1) et les jeux bayésiens (B4 — types et stratégies). Pas de calcul, mais
                  chaque réponse doit être <em>structurée</em> — c'est là que se gagnent les points.
                </p>
                <Callout
                  variant="examen"
                  title="La structure qui rapporte : nommer → définir → connecter"
                >
                  <p>
                    Pour chaque sous-question : (1) <strong>nomme</strong> le concept avec le terme
                    exact du cours ; (2) <strong>définis-le</strong> en une phrase ; (3){" "}
                    <strong>connecte-le</strong> aux données de l'énoncé et au point de référence
                    rationnel (« que prédirait la théorie rationnelle, et en quoi l'observation
                    dévie-t-elle ? »). Les barèmes de ces questions suivent presque toujours ce
                    découpage.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.1 · Nommer le biais : l'effet de dotation",
            refs: [{ chapter: "a1", section: "dotation" }],
            content: (
              <>
                <p>
                  C'est l'<strong>effet de dotation</strong> (« endowment effect ») : le simple fait
                  de <em>posséder</em> un objet gonfle la valeur qu'on lui attribue. Dans le
                  vocabulaire du cours : la <strong>disposition à accepter</strong> des détenteurs
                  (DAA = 9 euros pour céder le mug) est plus du double de la{" "}
                  <strong>disposition à payer</strong> des non-détenteurs (DAP = 4 euros pour
                  l'obtenir).
                </p>
                <BarresDotation />
              </>
            ),
          },
          {
            title: "5.1 · Expliquer la déviation : le tirage au sort rend l'écart irrationnel",
            refs: [
              { chapter: "a1", section: "dotation" },
              { chapter: "a3", section: "s10" },
            ],
            content: (
              <>
                <p>
                  <strong>Que prédirait la théorie rationnelle ?</strong> La valeur qu'un individu
                  attache au mug ne devrait pas dépendre du fait qu'il le possède déjà. L'argument
                  décisif est le <strong>tirage au sort</strong> : les mugs ont été distribués au
                  hasard, donc les deux groupes ont <em>en moyenne les mêmes préférences</em>. Pour
                  des individus rationnels, on devrait observer DAA <M tex="\approx" /> DAP (les
                  effets de richesse liés à quelques euros sont négligeables). Un écart de 9 contre
                  4 est donc bien une <strong>déviation</strong>, pas une différence de goûts.
                </p>
                <p>
                  <strong>Le mécanisme derrière :</strong> l'aversion aux pertes de la théorie des
                  perspectives. Une fois le mug en poche, il entre dans le point de référence : le
                  céder est ressenti comme une <em>perte</em>, l'acquérir comme un simple{" "}
                  <em>gain</em> — et les pertes pèsent plus lourd que les gains de même taille.
                </p>
                <Callout variant="attention" title="Ne saute pas l'argument du tirage au sort">
                  <p>
                    Dire « les possesseurs aiment plus leur mug » n'est pas une preuve de biais —
                    peut-être que ceux qui aiment les mugs les ont gardés ! C'est la{" "}
                    <strong>randomisation</strong> qui exclut cette explication : mêmes préférences
                    moyennes des deux côtés, donc l'écart ne peut venir que de la possession
                    elle-même. Au barème, cet argument vaut 4 points sur 10.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.2 · Définir le commitment device et donner un exemple",
            refs: [{ chapter: "a2", section: "commit" }],
            content: (
              <>
                <p>
                  Un <strong>commitment device</strong> (dispositif d'engagement) est un mécanisme
                  par lequel un individu{" "}
                  <strong>
                    restreint volontairement — ou renchérit — ses propres options futures
                  </strong>
                  , afin de forcer son « moi futur » à suivre le plan jugé optimal aujourd'hui.
                </p>
                <p>
                  <strong>Exemples concrets</strong> (un seul suffit) : un compte d'épargne bloqué
                  jusqu'à une date donnée ; une application qui bloque les réseaux sociaux pendant
                  le blocus ; Ulysse qui se fait attacher au mât pour résister aux sirènes ; ou —
                  clin d'œil de l'examen — l'abonnement d'escalade de la question 1, que le
                  sophistiqué paie 4 de trop précisément pour pousser son futur moi à grimper.
                </p>
              </>
            ),
          },
          {
            title: "5.2 · Montrer qu'un rationnel (β = 1) ne paierait jamais pour se lier",
            refs: [
              { chapter: "a2", section: "commit" },
              { chapter: "a2", section: "prefs" },
            ],
            content: (
              <>
                <p>
                  Un individu rationnel a des préférences <strong>cohérentes dans le temps</strong>{" "}
                  : avec <M tex="\beta = 1" />, la fonction qu'il maximisera demain est exactement
                  celle qu'il maximise aujourd'hui. Le plan optimal de la période 0 sera donc encore
                  optimal — et choisi — au moment d'agir, sans aucune contrainte extérieure.
                </p>
                <p>Deux conséquences en découlent :</p>
                <ul className="ml-5 list-disc space-y-1.5">
                  <li>
                    <strong>Restreindre ses options ne rapporte rien</strong> : l'option qu'il
                    aurait choisie reste disponible sans le dispositif — le dispositif ne change
                    donc rien à ce qu'il fera ;
                  </li>
                  <li>
                    <strong>et peut coûter</strong> : si les circonstances changent, la flexibilité
                    perdue le prive d'options qui seraient devenues utiles.
                  </li>
                </ul>
                <p>
                  Sa disposition à payer pour un commitment device est donc <strong>nulle</strong>{" "}
                  (voire négative). Seul un individu au biais de self-contrôle (
                  <M tex="\beta < 1" />) <em>et conscient de ce biais</em> — le sophistiqué — est
                  prêt à payer pour se lier les mains, comme le grimpeur de la question 1.
                </p>
                <Callout variant="intuition" title="Le test du miroir">
                  <p>
                    Payer pour se contraindre n'a de sens que si l'on se méfie de soi-même. La
                    valeur d'un commitment device mesure exactement le conflit entre le moi
                    d'aujourd'hui et le moi de demain : pour un rationnel, ce conflit n'existe pas,
                    donc la valeur est nulle.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.3 · Définir type et stratégie dans un jeu bayésien",
            refs: [
              { chapter: "b4", section: "s2" },
              { chapter: "b4", section: "s4" },
            ],
            content: (
              <>
                <p>
                  Le <strong>type</strong> d'un joueur correspond à sa{" "}
                  <strong>fonction de gain</strong> : dire qu'un joueur peut être de plusieurs
                  types, c'est dire qu'il existe plusieurs tables de payoffs possibles pour lui,
                  dont une seule est la vraie. Chaque joueur <em>connaît son propre type</em> ; ses
                  adversaires, eux, n'ont qu'une <strong>croyance</strong> — une distribution de
                  probabilité sur les types possibles — et l'on représente le tirage du type par un
                  joueur fictif, la <strong>Nature</strong>, en tête de l'arbre.
                </p>
                <p>
                  Dans un jeu bayésien, une <strong>stratégie</strong> n'est plus une simple action
                  : c'est une <strong>règle d'action</strong>, qui spécifie une action pour{" "}
                  <em>chaque type possible</em> du joueur — « si je suis du type 1, je joue… ; si je
                  suis du type 2, je joue… ».
                </p>
                <Callout variant="methode" title="Pourquoi une action par type ?">
                  <p>
                    Parce que l'équilibre doit être calculable <em>avant</em> de savoir quel type la
                    Nature a tiré : les adversaires raisonnent sur ce que <em>chaque</em> version du
                    joueur ferait. C'est le même principe que « une action par nœud » dans les jeux
                    séquentiels (question 3) — une stratégie couvre toutes les éventualités.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.3 · Compter : 2 types × 3 actions ⇒ 3² = 9 stratégies",
            refs: [{ chapter: "b4", section: "s4" }],
            content: (
              <>
                <p>
                  Une stratégie est un tableau complet « type → action » : il faut choisir une
                  action parmi 3 pour le premier type, <em>et</em> une action parmi 3 pour le second
                  — les deux choix sont indépendants, donc ils se multiplient :
                </p>
                <FormulaBox
                  label="Règle de comptage"
                  tex="\#\,\text{stratégies} = n^{k} = 3^{2} = 9"
                  caption={
                    <>
                      <M tex="n" /> = nombre d'actions, <M tex="k" /> = nombre de types : une
                      stratégie choisit une action pour chacun des <M tex="k" /> types.
                    </>
                  }
                />
                <p>
                  En notant les actions <M tex="x, y, z" />, on peut énumérer les 9 règles d'action
                  (action si type 1 ; action si type 2) :
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-center text-sm">
                    <thead>
                      <tr className="bg-muted/60">
                        <th className="border px-3 py-2 text-left">type 1 ↓ · type 2 →</th>
                        <th className="border px-3 py-2">x</th>
                        <th className="border px-3 py-2">y</th>
                        <th className="border px-3 py-2">z</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold">x</th>
                        <td className="border px-3 py-2">(x ; x)</td>
                        <td className="border px-3 py-2">(x ; y)</td>
                        <td className="border px-3 py-2">(x ; z)</td>
                      </tr>
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold">y</th>
                        <td className="border px-3 py-2">(y ; x)</td>
                        <td className="border px-3 py-2">(y ; y)</td>
                        <td className="border px-3 py-2">(y ; z)</td>
                      </tr>
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold">z</th>
                        <td className="border px-3 py-2">(z ; x)</td>
                        <td className="border px-3 py-2">(z ; y)</td>
                        <td className="border px-3 py-2">(z ; z)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Callout variant="attention" title="Les deux mauvaises réponses classiques">
                  <p>
                    Répondre <strong>3</strong> (par réflexe des jeux à information complète : « une
                    stratégie = une action ») ou <strong>6</strong> (en multipliant{" "}
                    <M tex="n \times k = 3 \times 2" />
                    ). La bonne opération est une <em>puissance</em>, pas un produit : un choix
                    parmi <M tex="n" /> répété <M tex="k" /> fois donne <M tex="n^k" />{" "}
                    combinaisons.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>5.1)</strong> effet de dotation : DAA (9 €) ≫ DAP (4 €) alors que la
              randomisation impose DAA <M tex="\approx" /> DAP pour des agents rationnels — l'écart
              vient de l'aversion aux pertes. · <strong>5.2)</strong> un commitment device restreint
              volontairement les options du moi futur (compte bloqué, Ulysse, abonnement de la
              question 1) ; avec <M tex="\beta = 1" />, préférences cohérentes ⇒ la restriction ne
              rapporte rien et peut coûter ⇒ disposition à payer nulle. · <strong>5.3)</strong> type
              = fonction de gain (connue du seul intéressé) ; stratégie = règle d'action « une
              action par type » ; avec 2 types et 3 actions : <M tex="3^2 = 9" /> stratégies.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> aux questions de compréhension, la structure « nommer →
              définir → connecter à la prédiction rationnelle » transforme des connaissances en
              points.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 4, exercise: "ex1" },
                { session: 1, exercise: "ex4" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />
    </ExamSolutionShell>
  );
}
