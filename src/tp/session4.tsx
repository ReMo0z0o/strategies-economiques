/**
 * TP · Séance 4 — Jeux bayésiens & contrats (ECGEB366).
 *
 * Énoncés fidèles au document officiel « Séance d'exercices 4 » ;
 * résolutions pas à pas alignées sur le corrigé officiel
 * (« Séance d'exercices 4 : Solutions »).
 *
 * Exercice 1 : duopole à la Cournot avec coût privé de la firme 2 →
 *   équilibre de Nash bayésien (chapitre B4).
 * Exercice 2 : Dropbox — tarification de deux produits, discrimination et
 *   screening par un menu de prix incitatif (chapitres B4/B2).
 * Exercice 3 : contrat principal-agent w(π) = a + bπ, effort inobservable,
 *   agents neutres au risque (chapitre B2).
 */
import { useState, type ReactNode } from "react";
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { Quiz } from "@/components/course/Quiz";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

/** Format français : d décimales, virgule décimale. */
function fmt(x: number, d = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(d).replace(".", ",");
}

/** Entier avec séparateur de milliers (espace), signe conservé. */
function fmtInt(x: number): string {
  const neg = x < 0;
  const s = Math.round(Math.abs(x))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (neg ? "-" : "") + s;
}

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Palette de séries — bleu/ambre sûre pour le daltonisme, + violet/ardoise. */
const COL_FOCAL = "#0284c7"; // sky-600
const COL_ALT = "#d97706"; // amber-600
const COL_THIRD = "#7c3aed"; // violet-600
const COL_REF = "#64748b"; // slate-500

/* ------------------------------------------------------------------ */
/* Graphe paramétrique réutilisable (une courbe = une fonction de x)   */
/* ------------------------------------------------------------------ */

interface ChartSeries {
  color: string;
  dash?: string;
  f: (x: number) => number;
}
interface Tick {
  v: number;
  label: string;
}

function ParamChart({
  xMin,
  xMax,
  yMin,
  yMax,
  series,
  xCurrent,
  xTicks,
  yTicks,
  marks = [],
  ariaLabel,
}: {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  series: ChartSeries[];
  xCurrent: number;
  xTicks: Tick[];
  yTicks: Tick[];
  marks?: { x: number; label: string }[];
  ariaLabel: string;
}) {
  const W = 440;
  const H = 216;
  const padL = 46;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => padT + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;
  const N = 72;
  const path = (f: (x: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      pts.push(`${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      {/* grille horizontale + libellés y */}
      {yTicks.map((t) => (
        <g key={`y${t.v}`}>
          <line
            x1={padL}
            x2={W - padR}
            y1={sy(t.v)}
            y2={sy(t.v)}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          <text
            x={padL - 6}
            y={sy(t.v) + 3.5}
            fontSize={10}
            textAnchor="end"
            fill="var(--color-muted-foreground)"
          >
            {t.label}
          </text>
        </g>
      ))}
      {/* libellés x */}
      {xTicks.map((t) => (
        <text
          key={`x${t.v}`}
          x={sx(t.v)}
          y={H - padB + 15}
          fontSize={10.5}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          {t.label}
        </text>
      ))}
      {/* axes */}
      <line x1={padL} x2={W - padR} y1={sy(yMin)} y2={sy(yMin)} stroke="var(--color-foreground)" strokeWidth={1.2} />
      <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="var(--color-foreground)" strokeWidth={1.2} />
      {/* repères verticaux (seuils) */}
      {marks.map((m) => (
        <g key={`m${m.x}`}>
          <line
            x1={sx(m.x)}
            x2={sx(m.x)}
            y1={padT}
            y2={H - padB}
            stroke={COL_REF}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <text x={sx(m.x)} y={padT - 4} fontSize={9.5} textAnchor="middle" fill={COL_REF}>
            {m.label}
          </text>
        </g>
      ))}
      {/* guide vertical à la valeur courante */}
      <line
        x1={sx(xCurrent)}
        x2={sx(xCurrent)}
        y1={padT}
        y2={H - padB}
        stroke="var(--color-foreground)"
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.35}
      />
      {/* courbes */}
      {series.map((s, i) => (
        <polyline
          key={i}
          points={path(s.f)}
          fill="none"
          stroke={s.color}
          strokeWidth={2.2}
          strokeDasharray={s.dash}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {/* points à la valeur courante */}
      {series.map((s, i) => (
        <circle
          key={`d${i}`}
          cx={sx(xCurrent)}
          cy={sy(s.f(xCurrent))}
          r={3.6}
          fill={s.color}
          stroke="var(--color-background)"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

/** Légende horizontale pour un graphe. */
function Legend({ items }: { items: { color: string; dash?: boolean; label: ReactNode }[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px]">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden className="shrink-0">
            <line
              x1="1"
              y1="4"
              x2="21"
              y2="4"
              stroke={it.color}
              strokeWidth="2.6"
              strokeDasharray={it.dash ? "4 3" : undefined}
              strokeLinecap="round"
            />
          </svg>
          <span>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

/** Petites tuiles de lecture chiffrée. */
function StatTiles({ items }: { items: { label: ReactNode; value: string }[] }) {
  return (
    <div
      className="mb-3 grid gap-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((s, i) => (
        <div key={i} className="rounded-lg border bg-muted/40 px-2.5 py-1.5 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {s.label}
          </div>
          <div className="text-[15px] font-bold tabular-nums">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Widget · Exercice 1 — statique comparative en θ                     */
/* ------------------------------------------------------------------ */

function DuopolyThetaExplorer() {
  const [thetaPct, setThetaPct] = useState(50);
  const theta = thetaPct / 100;
  // Valeurs numériques d'illustration (cL < cH, quantités positives).
  const A = 12;
  const c = 2;
  const cH = 4;
  const cL = 1;
  const q1 = (A - 2 * c + theta * cH + (1 - theta) * cL) / 3;
  const q2H = (A - 2 * cH + c) / 3 + ((1 - theta) / 6) * (cH - cL);
  const q2L = (A - 2 * cL + c) / 3 - (theta / 6) * (cH - cL);

  return (
    <InteractiveCard
      title="Explore : comment l'équilibre bouge avec la croyance θ"
      subtitle={
        <>
          Les trois quantités d'équilibre, calculées avec <M tex="A=12" />, <M tex="c=2" />,{" "}
          <M tex="c_H=4" />, <M tex="c_L=1" />.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Croyance <M tex="\theta" /> (proba. coût élevé <M tex="c_H" />)
            </>
          }
          value={thetaPct}
          onChange={setThetaPct}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v} %`}
        />
      }
      footer={
        <>
          quand <M tex="\theta" /> monte, <M tex="q_1^*" /> augmente (pente exactement{" "}
          <M tex="\tfrac{c_H-c_L}{3}=1" /> : ici <M tex="q_1^*=3+\theta" />), tandis que{" "}
          <M tex="q_2^*(c_H)" /> et <M tex="q_2^*(c_L)" /> diminuent. La firme 1 occupe le terrain
          qu'une rivale probablement chère lui laisse — c'est la réponse à la question 1.3.
        </>
      }
    >
      <StatTiles
        items={[
          { label: <M tex="q_1^*" />, value: fmt(q1) },
          { label: <M tex="q_2^*(c_H)" />, value: fmt(q2H) },
          { label: <M tex="q_2^*(c_L)" />, value: fmt(q2L) },
        ]}
      />
      <Legend
        items={[
          { color: COL_FOCAL, label: <M tex="q_1^*" /> },
          { color: COL_ALT, label: <M tex="q_2^*(c_H)" /> },
          { color: COL_THIRD, dash: true, label: <M tex="q_2^*(c_L)" /> },
        ]}
      />
      <ParamChart
        xMin={0}
        xMax={1}
        yMin={0}
        yMax={4.5}
        xCurrent={theta}
        series={[
          { color: COL_FOCAL, f: (t) => (A - 2 * c + t * cH + (1 - t) * cL) / 3 },
          { color: COL_ALT, f: (t) => (A - 2 * cH + c) / 3 + ((1 - t) / 6) * (cH - cL) },
          { color: COL_THIRD, dash: "5 4", f: (t) => (A - 2 * cL + c) / 3 - (t / 6) * (cH - cL) },
        ]}
        xTicks={[
          { v: 0, label: "0" },
          { v: 0.25, label: "0,25" },
          { v: 0.5, label: "0,5" },
          { v: 0.75, label: "0,75" },
          { v: 1, label: "1" },
        ]}
        yTicks={[
          { v: 0, label: "0" },
          { v: 1, label: "1" },
          { v: 2, label: "2" },
          { v: 3, label: "3" },
          { v: 4, label: "4" },
        ]}
        ariaLabel="Quantités d'équilibre de Nash bayésien en fonction de la croyance theta"
      />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget · Exercice 2 — quel menu domine selon λ ?                    */
/* ------------------------------------------------------------------ */

function DropboxLambdaExplorer() {
  const [lamPct, setLamPct] = useState(35);
  const lam = lamPct / 100;
  const screen = 15 + 20 * lam; // vendre les deux (menu incitatif)
  const lprof = 50 * lam; // L aux professionnels seulement
  const bestBoth = screen >= lprof;

  return (
    <InteractiveCard
      title="Explore : jusqu'où vendre les deux stockages ?"
      subtitle={
        <>
          Profit de chaque stratégie selon la part <M tex="\lambda" /> de professionnels.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Part <M tex="\lambda" /> de professionnels
            </>
          }
          value={lamPct}
          onChange={setLamPct}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v} %`}
        />
      }
      footer={
        <>
          les deux droites <M tex="15+20\lambda" /> (vendre les deux) et <M tex="50\lambda" /> (L aux
          pros) se croisent en <M tex="\lambda=\tfrac12" />. En dessous, le menu incitatif l'emporte ;
          au-dessus, mieux vaut ne servir que les professionnels — d'où la réponse{" "}
          <M tex="\lambda_{\max}=\tfrac12" /> de la question 2.4. La discrimination parfaite
          (pointillé) reste au-dessus de tout : c'est le premier best, inatteignable sans discriminer.
        </>
      }
    >
      <StatTiles
        items={[
          { label: "Vendre les 2", value: fmt(screen, 1) },
          { label: "L aux pros", value: fmt(lprof, 1) },
          { label: "Meilleur menu", value: bestBoth ? "les 2" : "L pros" },
        ]}
      />
      <Legend
        items={[
          { color: COL_FOCAL, label: "Vendre les deux" },
          { color: COL_ALT, label: "L aux pros seulement" },
          { color: COL_REF, dash: true, label: "Discrimination parfaite" },
        ]}
      />
      <ParamChart
        xMin={0}
        xMax={1}
        yMin={0}
        yMax={52}
        xCurrent={lam}
        marks={[{ x: 0.5, label: "λ = ½" }]}
        series={[
          { color: COL_FOCAL, f: (l) => 15 + 20 * l },
          { color: COL_ALT, f: (l) => 50 * l },
          { color: COL_REF, dash: "5 4", f: (l) => 15 + 35 * l },
        ]}
        xTicks={[
          { v: 0, label: "0" },
          { v: 0.25, label: "0,25" },
          { v: 0.5, label: "0,5" },
          { v: 0.75, label: "0,75" },
          { v: 1, label: "1" },
        ]}
        yTicks={[
          { v: 0, label: "0" },
          { v: 10, label: "10" },
          { v: 20, label: "20" },
          { v: 30, label: "30" },
          { v: 40, label: "40" },
          { v: 50, label: "50" },
        ]}
        ariaLabel="Profit de Dropbox selon la stratégie et la part de professionnels lambda"
      />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget · Exercice 3 — profit du producteur selon b                  */
/* ------------------------------------------------------------------ */

function ContractBExplorer() {
  const [bPct, setBPct] = useState(50);
  const b = bPct / 100;
  const K = 500 * 500; // 250 000
  const profA0 = (K / 2) * (b - b * b); // a = 0 (question 3.1)
  const profIR = (K / 2) * b - (K / 4) * b * b; // RI liante (question 3.2)
  const n = 500 * b;

  return (
    <InteractiveCard
      title="Explore : quelle commission b choisir ?"
      subtitle={
        <>
          Profit espéré du producteur selon la part <M tex="b" /> du profit laissée au commercial.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Commission <M tex="b" /> (part du profit)
            </>
          }
          value={bPct}
          onChange={setBPct}
          min={0}
          max={120}
          step={5}
          format={(v) => fmt(v / 100, 2)}
        />
      }
      footer={
        <>
          si <M tex="a=0" /> (bleu), le producteur laisse une rente au commercial et s'arrête à{" "}
          <M tex="b=\tfrac12" /> (profit <M tex="31\,250" /> €). En libérant <M tex="a" /> (ambre), il
          extrait cette rente par une franchise fixe et peut pousser <M tex="b=1" /> : l'effort devient
          efficient (<M tex="n^*=500" />) et le profit double, à <M tex="62\,500" /> €.
        </>
      }
    >
      <StatTiles
        items={[
          { label: "Profit si a=0", value: fmtInt(profA0) },
          { label: "Profit si RI liante", value: fmtInt(profIR) },
          { label: <M tex="n^*=500b" />, value: fmtInt(n) },
        ]}
      />
      <Legend
        items={[
          { color: COL_FOCAL, label: "a = 0 (question 3.1)" },
          { color: COL_ALT, label: "a optimal, RI liante (3.2)" },
        ]}
      />
      <ParamChart
        xMin={0}
        xMax={1.2}
        yMin={0}
        yMax={70000}
        xCurrent={b}
        marks={[
          { x: 0.5, label: "½" },
          { x: 1, label: "1" },
        ]}
        series={[
          { color: COL_FOCAL, f: (x) => (K / 2) * (x - x * x) },
          { color: COL_ALT, f: (x) => (K / 2) * x - (K / 4) * x * x },
        ]}
        xTicks={[
          { v: 0, label: "0" },
          { v: 0.5, label: "0,5" },
          { v: 1, label: "1" },
        ]}
        yTicks={[
          { v: 0, label: "0" },
          { v: 20000, label: "20 k" },
          { v: 40000, label: "40 k" },
          { v: 60000, label: "60 k" },
        ]}
        ariaLabel="Profit espéré du producteur selon la commission b, avec et sans franchise"
      />
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={4}
      intro={
        <>
          <p>
            Cette séance clôt la <strong>Partie B</strong> en réunissant ses deux dernières briques :
            l'<strong>information incomplète</strong> (chapitre B4, jeux bayésiens) et les{" "}
            <strong>incitations sous information cachée</strong> (chapitre B2, théorie des contrats).
            Tu vas d'abord résoudre un duopole où une firme ignore le coût de sa rivale — l'occasion
            d'apprendre à traiter chaque <em>type</em> comme un joueur distinct et à calculer un
            équilibre de Nash bayésien — puis à concevoir, avec Dropbox, un menu de prix qui fait{" "}
            <em>révéler</em> aux clients leur type (screening). L'exercice 3 boucle le cours avec un
            contrat salarial <M tex="w(\pi)=a+b\pi" /> : contrainte de participation, incitation à
            l'effort, et le résultat frappant du « vendre l'entreprise à l'agent ». Conseil de
            méthode : pose toujours par écrit les types, les croyances et les contraintes{" "}
            <em>avant</em> de dériver quoi que ce soit — c'est exactement ce que la correction
            valorise.
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — Duopole bayésien                                 */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp4"
        id="ex1"
        number={1}
        title="Duopole avec coût privé — équilibre de Nash bayésien"
        difficulty={3}
        refs={[
          { chapter: "b4", section: "s6" },
          { chapter: "b4", section: "s2" },
        ]}
        statement={
          <>
            <p>
              La demande de marché pour un bien est <M tex="Q^D(p) = A - p" />, où{" "}
              <M tex="Q^D" /> est la quantité demandée, <M tex="p" /> le prix unitaire et{" "}
              <M tex="A > 0" />. Deux firmes, 1 et 2, produisent ce bien. La fonction de coût de la
              firme 1 est connue de tous :
            </p>
            <MB tex="C_1(q_1) = c\,q_1," />
            <p>
              où <M tex="q_1" /> est la quantité produite par la firme 1. La fonction de coût de la
              firme 2 <strong>n'est pas connue</strong> de la firme 1. Cette dernière croit que le
              coût de la firme 2 est soit
            </p>
            <MB tex="C_2(q_2) = c_H\,q_2 \qquad \text{soit} \qquad C_2(q_2) = c_L\,q_2," />
            <p>
              avec <M tex="c_L < c_H" />. La firme 1 croit qu'il y a une probabilité{" "}
              <M tex="\theta" /> que le coût marginal de la firme 2 soit élevé (<M tex="c_H" />) et une
              probabilité <M tex="1-\theta" /> qu'il soit faible (<M tex="c_L" />). Seule la firme 2
              connaît son vrai coût marginal (<M tex="c_L" /> ou <M tex="c_H" />) au moment de définir
              sa production. Les deux firmes décident de leur production de manière{" "}
              <strong>simultanée</strong>.
            </p>
            <SubQuestion label="1.1">
              Pour chacun des « types » potentiels de la firme 2, calcule la fonction de meilleure
              réponse de cette firme à la quantité <M tex="q_1" /> produite par la firme 1.
            </SubQuestion>
            <SubQuestion label="1.2">
              Calcule la fonction de meilleure réponse de la firme 1 par rapport à sa croyance que la
              firme 2 produise <M tex="q_2(c_H)" /> avec probabilité <M tex="\theta" /> et{" "}
              <M tex="q_2(c_L)" /> avec probabilité <M tex="1-\theta" />.
            </SubQuestion>
            <SubQuestion label="1.3">
              En utilisant tes réponses aux questions 1.1 et 1.2, calcule la quantité produite par la
              firme 1 selon l'équilibre de Nash bayésien. Comment évolue cette quantité quand{" "}
              <M tex="\theta" /> augmente ?
            </SubQuestion>
            <SubQuestion label="1.4">
              Quel est l'équilibre de Nash bayésien dans cette compétition en duopole ? Quel est le
              résultat associé à cet ENB quand le coût marginal de la firme 2 est <M tex="c_H" /> ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Poser le cadre : prix d'équilibre, profits, types et croyances",
            refs: [
              { chapter: "b4", section: "s2" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  C'est un duopole de Cournot (choix simultané des quantités) auquel on ajoute une
                  <strong> information incomplète</strong> : la firme 1 ne connaît pas le coût de la
                  firme 2. On commence comme un Cournot classique. Le prix ajuste l'offre{" "}
                  <M tex="q_1 + q_2" /> à la demande <M tex="A - p" /> :
                </p>
                <MB tex="A - p^{*} = q_1 + q_2 \quad\Longrightarrow\quad p^{*} = A - q_1 - q_2." />
                <p>Le profit de la firme 1 (coût <M tex="c" />) s'écrit donc :</p>
                <MB tex="\Pi_1(q_1, q_2) = p^{*} q_1 - c\,q_1 = q_1\bigl(A - (q_1 + q_2) - c\bigr)," />
                <p>
                  et par symétrie celui de la firme 2, avec son coût marginal{" "}
                  <M tex="c_2 \in \{c_H, c_L\}" /> :{" "}
                  <M tex="\Pi_2(q_1, q_2) = q_2\bigl(A - (q_1 + q_2) - c_2\bigr)" />.
                </p>
                <Callout variant="definition" title="Type, croyance, stratégie">
                  <p>
                    La firme 2 a deux <strong>types</strong> possibles selon son coût :{" "}
                    <M tex="c_H" /> (élevé) ou <M tex="c_L" /> (faible). La firme 1 ne les observe
                    pas ; elle n'a qu'une <strong>croyance</strong> : <M tex="\theta" /> sur{" "}
                    <M tex="c_H" />, <M tex="1-\theta" /> sur <M tex="c_L" />. Une{" "}
                    <strong>stratégie</strong> de la firme 2 n'est donc pas une seule quantité mais une{" "}
                    <em>règle</em> : « produire ceci si je suis <M tex="c_H" />, cela si je suis{" "}
                    <M tex="c_L" /> ».
                  </p>
                </Callout>
                <Callout variant="methode">
                  <p>
                    Plan de résolution d'un ENB : (1) chaque type de la firme 2 choisit sa meilleure
                    réponse à <M tex="q_1" /> ; (2) la firme 1, qui ne sait pas à quel type elle fait
                    face, maximise son profit <em>espéré</em> selon <M tex="\theta" /> ; (3) on résout
                    le système formé par ces meilleures réponses mutuelles.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 — La meilleure réponse de chaque type de la firme 2",
            refs: [
              { chapter: "b4", section: "s4" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  La firme 2 <em>connaît</em> son coût : chaque type résout un problème de Cournot
                  ordinaire. <strong>Type coût élevé <M tex="c_H" /></strong> :
                </p>
                <MB tex="\max_{q_2 \ge 0} \; q_2\bigl(A - (q_1 + q_2) - c_H\bigr)." />
                <p>La condition de premier ordre (CPO) annule la dérivée :</p>
                <MB tex="\frac{\partial \Pi_2}{\partial q_2} = A - q_1 - 2q_2 - c_H = 0 \;\Longrightarrow\; q_2^{*}(c_H) = \tfrac{1}{2}\bigl(A - q_1 - c_H\bigr). \quad (1)" />
                <p>
                  Par le même calcul, le <strong>type coût faible <M tex="c_L" /></strong> a pour
                  meilleure réponse :
                </p>
                <MB tex="q_2^{*}(c_L) = \tfrac{1}{2}\bigl(A - q_1 - c_L\bigr). \quad (2)" />
                <Callout variant="intuition">
                  <p>
                    Un coût plus élevé abaisse la meilleure réponse :{" "}
                    <M tex="q_2^{*}(c_H) < q_2^{*}(c_L)" /> pour un même <M tex="q_1" />. Le type cher
                    produit moins — c'est la clé de toute la statique comparative qui suit.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 — La meilleure réponse de la firme 1 (sous croyance)",
            refs: [
              { chapter: "b4", section: "s2" },
              { chapter: "b4", section: "s6" },
            ],
            content: (
              <>
                <p>
                  La firme 1 ignore le type de sa rivale : elle maximise son profit{" "}
                  <strong>espéré</strong>, pondéré par sa croyance <M tex="\theta" /> :
                </p>
                <MB tex="\max_{q_1}\; E\bigl(\Pi_1\bigr) = \theta\,q_1\bigl(A - (q_1 + q_2(c_H)) - c\bigr) + (1-\theta)\,q_1\bigl(A - (q_1 + q_2(c_L)) - c\bigr)." />
                <p>La CPO en <M tex="q_1" /> :</p>
                <MB tex="\frac{\partial E(\Pi_1)}{\partial q_1} = \theta\bigl(A - 2q_1 - q_2(c_H) - c\bigr) + (1-\theta)\bigl(A - 2q_1 - q_2(c_L) - c\bigr) = 0." />
                <p>
                  En regroupant (<M tex="\theta + (1-\theta) = 1" />), on obtient la meilleure réponse
                  de la firme 1 :
                </p>
                <MB tex="q_1^{*} = \tfrac{1}{2}\Bigl(A - \theta\,q_2(c_H) - (1-\theta)\,q_2(c_L) - c\Bigr). \quad (3)" />
                <Callout variant="attention" title="Le cœur du raisonnement bayésien">
                  <p>
                    La firme 1 ne répond pas à « la » quantité de la firme 2, mais à sa{" "}
                    <strong>quantité espérée</strong>{" "}
                    <M tex="\theta\,q_2(c_H) + (1-\theta)\,q_2(c_L)" />. Erreur classique : traiter la
                    firme 2 comme si elle jouait un seul <M tex="q_2" /> — on perd alors la dépendance
                    en <M tex="\theta" /> qui fait tout le sel de l'exercice.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 — La quantité de la firme 1 à l'ENB, et sa variation en θ",
            refs: [{ chapter: "b4", section: "s6" }],
            content: (
              <>
                <p>
                  À l'équilibre, les stratégies <M tex="q_1^{*}" /> et{" "}
                  <M tex="(q_2(c_H), q_2(c_L))" /> sont des meilleures réponses mutuelles : elles
                  vérifient <em>simultanément</em> les trois équations (1), (2) et (3). On injecte (1)
                  et (2) dans (3) :
                </p>
                <MB tex="q_1^{*} = \tfrac{1}{2}\Bigl(A - c - \tfrac{1}{2}\bigl[(A - q_1^{*}) - \theta c_H - (1-\theta)c_L\bigr]\Bigr)." />
                <p>
                  On résout en <M tex="q_1^{*}" /> (les termes en <M tex="q_1^{*}" /> se regroupent :{" "}
                  <M tex="q_1^{*} - \tfrac14 q_1^{*} = \tfrac34 q_1^{*}" />). Après simplification :
                </p>
                <MB tex="\boxed{\,q_1^{*} = \tfrac{1}{3}\bigl(A - 2c + \theta c_H + (1-\theta)c_L\bigr).\,} \quad (4)" />
                <p>
                  Statique comparative : on dérive par rapport à la croyance <M tex="\theta" /> :
                </p>
                <MB tex="\frac{\partial q_1^{*}}{\partial \theta} = \tfrac{1}{3}\bigl(c_H - c_L\bigr) > 0 \quad \text{car } c_H > c_L." />
                <p>
                  Donc <strong>la firme 1 produit davantage</strong> quand la probabilité que sa
                  rivale ait un coût élevé augmente. Rien d'étonnant : à l'équilibre, la firme 2
                  produit moins quand son coût est élevé, ce qui laisse plus de place à la firme 1.
                </p>
                <DuopolyThetaExplorer />
              </>
            ),
          },
          {
            title: "1.4 — L'équilibre complet et son issue quand le coût est cH",
            refs: [
              { chapter: "b4", section: "s6" },
              { chapter: "b4", section: "s4" },
            ],
            content: (
              <>
                <p>
                  L'équilibre de Nash bayésien est le profil de stratégies{" "}
                  <M tex="(S_1^{*}, S_2^{*})" /> :
                </p>
                <MB tex="S_1^{*} : q_1^{*}, \qquad S_2^{*} : \; q_2^{*}(c_H) \text{ si } c_H,\quad q_2^{*}(c_L) \text{ si } c_L," />
                <p>
                  où <M tex="q_1^{*}" /> est donné par (4). On obtient les quantités des deux types en
                  réinjectant (4) dans (1) et (2) — après simplification :
                </p>
                <MB tex="q_2^{*}(c_H) = \tfrac{1}{3}(A - 2c_H + c) + \tfrac{1-\theta}{6}(c_H - c_L)," />
                <MB tex="q_2^{*}(c_L) = \tfrac{1}{3}(A - 2c_L + c) - \tfrac{\theta}{6}(c_H - c_L)." />
                <Callout variant="retiens">
                  <p>
                    Remarque la structure : une <strong>partie commune</strong> de type Cournot
                    (<M tex="\tfrac13(A - 2c_i + c)" />) plus une <strong>correction bayésienne</strong>{" "}
                    proportionnelle à l'écart de coûts <M tex="(c_H - c_L)" /> et à la croyance. Sans
                    incertitude (<M tex="c_H = c_L" />) elle disparaît et on retombe sur le Cournot
                    symétrique.
                  </p>
                </Callout>
                <p>
                  <strong>Issue quand le coût de la firme 2 est <M tex="c_H" /></strong> : la firme 1
                  produit <M tex="q_1^{*}" /> et la firme 2 produit <M tex="q_2^{*}(c_H)" />. Les
                  profits réalisés sont alors <M tex="\Pi_1\bigl(q_1^{*}, q_2^{*}(c_H)\bigr)" /> et{" "}
                  <M tex="\Pi_2\bigl(q_1^{*}, q_2^{*}(c_H)\bigr)" />, chacun évalué avec le prix{" "}
                  <M tex="p^{*} = A - q_1^{*} - q_2^{*}(c_H)" />.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> <M tex="q_2^{*}(c_H)=\tfrac12(A-q_1-c_H)" /> et{" "}
              <M tex="q_2^{*}(c_L)=\tfrac12(A-q_1-c_L)" />. · <strong>1.2</strong>{" "}
              <M tex="q_1^{*}=\tfrac12\bigl(A-\theta q_2(c_H)-(1-\theta)q_2(c_L)-c\bigr)" />. ·{" "}
              <strong>1.3</strong> <M tex="q_1^{*}=\tfrac13\bigl(A-2c+\theta c_H+(1-\theta)c_L\bigr)" />
              , croissante en <M tex="\theta" /> car{" "}
              <M tex="\partial q_1^{*}/\partial\theta=\tfrac13(c_H-c_L)>0" />. · <strong>1.4</strong>{" "}
              ENB : la firme 1 joue <M tex="q_1^{*}" />, la firme 2 joue <M tex="q_2^{*}(c_H)" /> si son
              coût est élevé, <M tex="q_2^{*}(c_L)" /> s'il est faible.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> (i) une stratégie du joueur informé est une{" "}
              <em>règle</em> — une action par type ; (ii) le joueur non informé maximise son profit{" "}
              <em>espéré</em> et répond à la quantité <em>espérée</em> de l'adversaire ; (iii) comme
              les quantités sont des substituts stratégiques, la firme 1 se développe quand sa rivale
              est probablement chère.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp4"
        id="qx1"
        kicker="Pour vérifier que tu as compris l'ENB"
        question={
          <>
            À l'équilibre on trouve <M tex="\partial q_1^{*}/\partial\theta = \tfrac13(c_H-c_L) > 0" />.
            Quelle est la bonne lecture ?
          </>
        }
        options={[
          {
            text: (
              <>
                Plus la firme 1 juge probable que sa rivale ait un coût élevé, plus elle produit — car
                un type cher produit peu, ce qui lui laisse de la place sur le marché.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : les quantités sont des substituts stratégiques. Anticiper une rivale
                « faible » (car probablement chère) pousse la firme 1 à étendre sa propre production.
              </>
            ),
          },
          {
            text: <>La firme 1 produit plus parce que son propre coût <M tex="c" /> augmente avec <M tex="\theta" />.</>,
            explain: (
              <>
                Non : <M tex="c" /> est fixe et connu, totalement indépendant de la croyance{" "}
                <M tex="\theta" />. C'est la quantité <em>attendue</em> de la rivale qui change.
              </>
            ),
          },
          {
            text: (
              <>
                C'est une incohérence : une quantité d'équilibre ne peut pas dépendre d'une simple
                croyance, seulement de coûts réels.
              </>
            ),
            explain: (
              <>
                Au contraire : dans un jeu bayésien, les choix optimaux dépendent des croyances. C'est
                toute la différence avec un jeu à information complète.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Le joueur non informé optimise contre une <strong>espérance</strong>. Quand cette
            espérance de production adverse baisse (rivale probablement chère), sa meilleure réponse
            monte : d'où <M tex="\partial q_1^{*}/\partial\theta > 0" />.
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 2 — Dropbox : discrimination & screening            */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp4"
        id="ex2"
        number={2}
        title="Dropbox — menu de prix et screening des clients"
        difficulty={2}
        refs={[
          { chapter: "b4", section: "s8" },
          { chapter: "b2", section: "sec-modele" },
        ]}
        statement={
          <>
            <p>
              L'entreprise Dropbox vend de la capacité de stockage en ligne. Elle offre deux
              produits : un stockage à <strong>large capacité</strong> (L) et un stockage à{" "}
              <strong>faible capacité</strong> (F). Produire un stockage large coûte 30 $, un
              stockage faible 10 $. Dropbox a deux types de clients : les{" "}
              <strong>professionnels</strong> et les <strong>individus privés</strong>. Leurs
              dispositions à payer (DAP) et les coûts sont résumés ci-dessous ; une proportion{" "}
              <M tex="\lambda" /> des clients sont des professionnels.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full min-w-[24rem] border-collapse text-[14.5px]">
                <thead>
                  <tr>
                    <th className={TH}> </th>
                    <th className={THc}>Capacité L</th>
                    <th className={THc}>Capacité F</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={TD}>Coût de production</td>
                    <td className={TDc}>30 $</td>
                    <td className={TDc}>10 $</td>
                  </tr>
                  <tr>
                    <td className={TD}>DAP — professionnels</td>
                    <td className={TDc}>80 $</td>
                    <td className={TDc}>40 $</td>
                  </tr>
                  <tr>
                    <td className={TD}>DAP — individus privés</td>
                    <td className={TDc}>40 $</td>
                    <td className={TDc}>25 $</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              On note <M tex="y" /> le prix du stockage large (L) et <M tex="x" /> le prix du stockage
              faible (F).
            </p>
            <SubQuestion label="2.1">
              Quels sont les prix <M tex="y" /> et <M tex="x" /> maximisant le profit de Dropbox quand
              la firme peut <strong>discriminer parfaitement</strong> ses deux types de clients ?
            </SubQuestion>
            <SubQuestion label="2.2">
              Quels sont les prix <M tex="y" /> et <M tex="x" /> maximisant le profit quand la firme{" "}
              <strong>ne peut pas</strong> discriminer et que <M tex="\lambda" /> est proche de 0 ?
            </SubQuestion>
            <SubQuestion label="2.3">
              Quel est le menu des prix maximisant le profit quand la firme ne peut pas discriminer et
              que <M tex="\lambda" /> est proche de 1 ?
            </SubQuestion>
            <SubQuestion label="2.4">
              Quelle est la valeur maximale de <M tex="\lambda" /> pour laquelle Dropbox maximise son
              profit en vendant <strong>et</strong> le large <strong>et</strong> le faible stockage ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Construire la table « profit maximal par type »",
            refs: [{ chapter: "b4", section: "s8" }],
            content: (
              <>
                <p>
                  Avant tout, on calcule le profit maximal que Dropbox peut tirer de chaque
                  (type, produit) : c'est la <strong>DAP moins le coût</strong> de production. Vendre
                  à un client à sa DAP est le mieux qu'on puisse faire s'il achète.
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[24rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Profit maximal (DAP − coût)</th>
                        <th className={THc}>Capacité L</th>
                        <th className={THc}>Capacité F</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>Professionnel</td>
                        <td className={TDc}>80 − 30 = <strong>50</strong></td>
                        <td className={TDc}>40 − 10 = 30</td>
                      </tr>
                      <tr>
                        <td className={TD}>Individu privé</td>
                        <td className={TDc}>40 − 30 = 10</td>
                        <td className={TDc}>25 − 10 = <strong>15</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Callout variant="intuition">
                  <p>
                    Chaque type a un produit « naturel » qui maximise le profit qu'on peut en tirer :
                    le <strong>large</strong> pour le professionnel (50 {">"} 30), le{" "}
                    <strong>faible</strong> pour le privé (15 {">"} 10). Tout le problème sera de leur
                    faire choisir ce produit-là… sans pouvoir lire leur type sur leur front.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 — Discrimination parfaite : le premier best",
            refs: [{ chapter: "b4", section: "s8" }],
            content: (
              <>
                <p>
                  Si Dropbox peut faire payer un prix différent à chaque type (discrimination
                  parfaite), elle vend à chacun son produit naturel <strong>à sa DAP</strong> :
                </p>
                <MB tex="y_{\text{prof}} = 80 \;\text{ (L pour les pros)}, \qquad x_{\text{priv}} = 25 \;\text{ (F pour les privés)}," />
                <p>
                  et n'offre pas L aux privés ni F aux pros. Chaque type est pressé jusqu'à sa DAP :
                  le surplus laissé au client est nul. Le profit vaut alors :
                </p>
                <MB tex="\Pi_{PD} = \lambda \cdot 50 + (1-\lambda)\cdot 15 = 15 + 35\lambda." />
                <Callout variant="retiens">
                  <p>
                    C'est le <strong>premier best</strong> : le maximum théorique. Il sert de borne
                    supérieure et de point de comparaison pour tout ce qui suit. Il suppose que
                    Dropbox <em>sait</em> qui est qui.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.2 — Menu de screening (λ proche de 0) : quatre contraintes",
            refs: [
              { chapter: "b4", section: "s8" },
              { chapter: "b2", section: "sec-modele" },
            ],
            content: (
              <>
                <p>
                  Sans pouvoir discriminer, Dropbox affiche <strong>un seul menu</strong>{" "}
                  <M tex="(y, x)" /> et laisse chaque client choisir. Pour que les pros prennent L et
                  les privés F (auto-sélection), quatre contraintes doivent tenir :
                </p>
                <MB tex="\underbrace{80 \ge y}_{\text{RI pros}}, \quad \underbrace{25 \ge x}_{\text{RI privés}}, \quad \underbrace{80 - y \ge 40 - x}_{\text{CI pros}}, \quad \underbrace{40 - y \le 25 - x}_{\text{CI privés}}." />
                <Callout variant="definition" title="RI et CI">
                  <p>
                    <strong>Rationalité individuelle (RI, participation)</strong> : chaque type doit
                    tirer un surplus <M tex="\ge 0" /> du produit qui lui est destiné, sinon il
                    n'achète pas. <strong>Compatibilité aux incitants (CI)</strong> : chaque type doit
                    préférer <em>son</em> produit à celui de l'autre type.
                  </p>
                </Callout>
                <p>Si l'auto-sélection fonctionne, le profit est :</p>
                <MB tex="\Pi_{\text{Screen}}(y, x) = \lambda(y - 30) + (1-\lambda)(x - 10) = (x - 10) + \lambda(y - x - 20)." />
                <p>
                  Le menu optimal rend liantes la <strong>RI des privés</strong> et la{" "}
                  <strong>CI des pros</strong> :
                </p>
                <MB tex="25 = x \qquad \text{et} \qquad 80 - y = 40 - x \;\Longrightarrow\; y = 65." />
                <p>
                  On vérifie que les deux autres contraintes tiennent : RI pros{" "}
                  <M tex="80 \ge 65" /> ✓ et CI privés <M tex="40 - 65 = -25 \le 25 - 25 = 0" /> ✓. Le
                  profit vaut :
                </p>
                <MB tex="\Pi_{\text{Screen}} = 15 + 20\lambda," />
                <p>
                  inférieur aux <M tex="15 + 35\lambda" /> de la discrimination parfaite.
                </p>
                <Callout variant="attention" title="Quelles contraintes lient ? (piège classique)">
                  <p>
                    Ce ne sont <strong>pas</strong> les deux RI ni les deux CI qui lient, mais la{" "}
                    <strong>RI du type « bas »</strong> (le privé, qu'on presse jusqu'à sa DAP de 25)
                    et la <strong>CI du type « haut »</strong> (le pro, qu'il faut dissuader de se
                    faire passer pour un privé). D'où <M tex="y = 65 < 80" /> : les pros gardent un{" "}
                    <strong>surplus de 15</strong>, la fameuse <em>rente d'information</em>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 — Menus à un seul produit (λ proche de 1)",
            refs: [{ chapter: "b4", section: "s8" }],
            content: (
              <>
                <p>
                  On compare aux stratégies qui ne proposent qu'un seul produit. Un prix qui vise{" "}
                  <em>tout le monde</em> est plafonné par la RI du privé ; un prix qui ne vise que les
                  pros peut monter jusqu'à leur RI.
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Stratégie</th>
                        <th className={TH}>Prix</th>
                        <th className={THc}>Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["F à tous les clients", "x = 25", "25 − 10 = 15"],
                        ["F aux pros seulement", "x = 40", "λ(40 − 10) = 30λ"],
                        ["L à tous les clients", "y = 40", "40 − 30 = 10"],
                        ["L aux pros seulement", "y = 80", "λ(80 − 30) = 50λ"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TD}>
                            <M tex={row[1]} />
                          </td>
                          <td className={TDc}>{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Quand <M tex="\lambda" /> est proche de 1, <M tex="50\lambda" /> domine toutes les
                  autres options : le menu optimal est de <strong>vendre L aux seuls professionnels</strong>{" "}
                  (au prix <M tex="y = 80" />). Avec presque que des pros, autant les presser à fond et
                  ignorer la poignée de privés.
                </p>
              </>
            ),
          },
          {
            title: "2.4 — Le seuil λ = ½ : jusqu'où vendre les deux produits",
            refs: [{ chapter: "b4", section: "s8" }],
            content: (
              <>
                <p>
                  Vendre les deux produits, c'est le menu de screening (<M tex="15 + 20\lambda" />).
                  Son rival sérieux quand <M tex="\lambda" /> grandit est « L aux pros seulement »
                  (<M tex="50\lambda" />). On cherche le plus grand <M tex="\lambda" /> pour lequel le
                  screening reste au moins aussi bon :
                </p>
                <MB tex="\Pi_{\text{Screen}} \ge \Pi_{L\text{prof}} \;\Longleftrightarrow\; 15 + 20\lambda \ge 50\lambda \;\Longleftrightarrow\; 15 \ge 30\lambda \;\Longleftrightarrow\; \lambda \le \tfrac{1}{2}." />
                <p>
                  La valeur maximale est donc <M tex="\lambda = \tfrac{1}{2}" />. Au-delà, la rente
                  d'information laissée aux pros coûte trop cher : mieux vaut renoncer aux privés.
                </p>
                <DropboxLambdaExplorer />
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1</strong> Discrimination parfaite : <M tex="y = 80" /> (L, pros),{" "}
              <M tex="x = 25" /> (F, privés), profit <M tex="15 + 35\lambda" />. · <strong>2.2</strong>{" "}
              <M tex="\lambda \to 0" /> : menu de screening <M tex="x = 25" />, <M tex="y = 65" />,
              profit <M tex="15 + 20\lambda" />. · <strong>2.3</strong> <M tex="\lambda \to 1" /> :
              vendre L aux seuls pros (<M tex="y = 80" />), profit <M tex="50\lambda" />. ·{" "}
              <strong>2.4</strong> <M tex="\lambda_{\max} = \tfrac{1}{2}" />.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> le screening arbitre entre{" "}
              <em>couverture du marché</em> et <em>rente d'information</em> ; à l'optimum lient la RI du
              type bas et la CI du type haut ; le type haut conserve une rente (prix 65 {"<"} 80) qui
              fait perdre <M tex="15\lambda" /> par rapport au premier best — et rend « ne servir que
              les pros » préférable dès que <M tex="\lambda > \tfrac12" />.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp4"
        id="qx2"
        kicker="Pour vérifier que tu as compris le screening"
        question={
          <>
            En discrimination parfaite Dropbox gagne <M tex="15 + 35\lambda" /> ; avec le menu de
            screening, seulement <M tex="15 + 20\lambda" />. D'où vient l'écart de <M tex="15\lambda" /> ?
          </>
        }
        options={[
          {
            text: (
              <>
                De la <strong>rente d'information</strong> laissée aux professionnels : pour qu'ils
                choisissent L plutôt que F, on doit fixer <M tex="y = 65" /> au lieu de 80, soit 15 de
                surplus abandonné par professionnel (masse <M tex="\lambda" />).
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : la CI des pros lie et impose <M tex="y = 65" />. Les 15 de surplus qu'ils gardent,
                multipliés par leur masse <M tex="\lambda" />, donnent exactement l'écart{" "}
                <M tex="15\lambda" />.
              </>
            ),
          },
          {
            text: <>Des coûts de production, plus élevés lorsqu'on vend deux produits au lieu d'un.</>,
            explain: (
              <>
                Non : les coûts (30 et 10) sont inchangés. Ce qui change, c'est le prix qu'on peut
                faire payer au pro, contraint par l'auto-sélection.
              </>
            ),
          },
          {
            text: <>D'une erreur de calcul : sans discriminer, les deux profits devraient coïncider.</>,
            explain: (
              <>
                Non : l'incapacité à distinguer les types a un coût réel et mesurable. C'est le prix de
                l'information cachée.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Ne pas pouvoir discriminer force à laisser une <strong>rente d'information</strong> au type
            à forte DAP pour qu'il ne se cache pas derrière l'offre bon marché. Cette rente, c'est
            précisément l'écart <M tex="15\lambda" /> avec le premier best.
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 3 — Contrat principal-agent w(π) = a + bπ           */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp4"
        id="ex3"
        number={3}
        title="Contrat salarial incitatif w(π) = a + bπ"
        difficulty={3}
        refs={[
          { chapter: "b2", section: "sec-modele" },
          { chapter: "b2", section: "sec-cas3" },
        ]}
        statement={
          <>
            <p>
              Un producteur de vélos électriques doit engager un commercial. Une fois engagé, le
              producteur <strong>ne peut plus surveiller</strong> le commercial : son travail consiste
              à prendre la route pour démarcher de nouveaux clients. Chaque client potentiel rencontré
              achète un vélo avec probabilité <M tex="\tfrac12" />. Le profit par vélo vendu est de
              500 €. Pour le commercial, le coût de l'effort de rencontrer des clients est
            </p>
            <MB tex="c(n) = \frac{n^2}{4}," />
            <p>
              où <M tex="n" /> est le nombre de clients potentiels rencontrés. Le producteur offre un
              salaire <M tex="w(\pi) = a + b\pi" />, où <M tex="\pi" /> est le profit total obtenu et{" "}
              <M tex="a, b" /> sont des réels. Si le commercial refuse le poste, il reçoit une utilité
              de 0. Les deux agents sont <strong>neutres au risque</strong>.
            </p>
            <SubQuestion label="3.1">
              Quelle est la valeur de <M tex="b" /> offerte par le producteur si <M tex="a = 0" /> ?
            </SubQuestion>
            <SubQuestion label="3.2">
              Quelles sont les valeurs de <M tex="a" /> et <M tex="b" /> maximisant le profit du
              producteur ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "De l'effort au profit espéré : la binomiale et la neutralité au risque",
            refs: [{ chapter: "b2", section: "sec-modele" }],
            content: (
              <>
                <p>
                  La technologie relie le profit <M tex="\pi" /> au nombre de clients rencontrés{" "}
                  <M tex="n" />. Si <M tex="x" /> est le nombre de clients qui achètent, alors{" "}
                  <M tex="\pi = 500\,x" />, et <M tex="x" /> suit une loi binomiale{" "}
                  <M tex="x \sim \mathcal{B}(n, \tfrac12)" /> (chaque rencontre est un « succès » avec
                  proba <M tex="\tfrac12" />). L'espérance d'une binomiale est <M tex="E(x) = np" /> :
                </p>
                <MB tex="E(x) = \frac{n}{2} \quad\Longrightarrow\quad E(\pi) = 500\cdot\frac{n}{2} = 250\,n." />
                <Callout variant="definition" title="Neutralité au risque">
                  <p>
                    Un agent neutre au risque ne juge une loterie que par son{" "}
                    <strong>espérance</strong> : aucune prime de risque. Ici les deux parties le sont,
                    donc on travaille directement en espérance :
                  </p>
                  <MB tex="U_{pr} = E(\pi - w), \qquad U_{sa} = E\bigl(w - c(n)\bigr) = E\!\left(w - \tfrac{n^2}{4}\right)." />
                </Callout>
                <Callout variant="methode">
                  <p>
                    Le jeu se résout par <strong>induction à rebours</strong> (ENPS) : on commence par
                    la dernière décision, celle du commercial (choix de <M tex="n" /> pour un contrat
                    donné), puis le producteur choisit le contrat en <em>anticipant</em> cette
                    réaction.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.1 — Salaire proportionnel (a = 0) : quelle commission b ?",
            refs: [{ chapter: "b2", section: "sec-cas2" }],
            content: (
              <>
                <p>
                  Avec <M tex="a = 0" /> le contrat est <M tex="w(\pi) = b\pi" />.{" "}
                  <strong>Étape 1 — le commercial</strong> choisit <M tex="n" /> :
                </p>
                <MB tex="\max_{n \ge 0}\; E\!\left(b\pi - \tfrac{n^2}{4}\right) = b\,E(\pi) - \tfrac{n^2}{4} = 250\,bn - \tfrac{n^2}{4}." />
                <p>La CPO :</p>
                <MB tex="\frac{\partial U_{sa}}{\partial n} = 250\,b - \frac{n}{2} = 0 \;\Longrightarrow\; n^{*} = 500\,b." />
                <p>
                  <strong>Étape 2 — le producteur</strong> anticipe <M tex="n^{*} = 500b" /> et
                  maximise :
                </p>
                <MB tex="E(\pi - w) = (1 - b)\,E(\pi) = (1-b)\,250\,n = (1-b)\,250\cdot 500b = \tfrac{500^2}{2}\bigl(b - b^2\bigr)." />
                <MB tex="\frac{\partial U_{pr}}{\partial b} = \tfrac{500^2}{2}(1 - 2b) = 0 \;\Longrightarrow\; b^{*} = \tfrac{1}{2}." />
                <p>
                  L'équilibre (ENPS) est donc <M tex="w(\pi) = \tfrac{\pi}{2}" /> côté producteur et{" "}
                  <M tex="n(w) = 500b" /> côté commercial, soit <M tex="n^{*} = 250" /> clients.
                </p>
                <Callout variant="attention" title="Ici la participation n'est PAS liante">
                  <p>
                    Avec <M tex="b = \tfrac12" /> et <M tex="n = 250" />, l'utilité du commercial vaut{" "}
                    <M tex="250\cdot\tfrac12\cdot 250 - \tfrac{250^2}{4} = 15\,625 > 0" /> : il touche
                    une <strong>rente</strong> strictement positive. Comme <M tex="a" /> est bloqué à 0,
                    le producteur ne dispose d'aucun levier pour la récupérer — retiens cette différence
                    avec 3.2, elle explique tout.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 — Salaire linéaire optimal : a, b et la franchise",
            refs: [
              { chapter: "b2", section: "sec-cas3" },
              { chapter: "b2", section: "sec-modele" },
            ],
            content: (
              <>
                <p>
                  Le contrat est maintenant <M tex="w(\pi) = a + b\pi" /> avec <M tex="a" /> libre.{" "}
                  <strong>Étape 1</strong> : la partie fixe <M tex="a" /> ne dépend pas de{" "}
                  <M tex="n" />, donc la CPO du commercial est inchangée :
                </p>
                <MB tex="U_{sa} = a + 250\,bn - \tfrac{n^2}{4} \;\Longrightarrow\; \frac{\partial U_{sa}}{\partial n} = 250\,b - \frac{n}{2} = 0 \;\Longrightarrow\; n^{*} = 500\,b." />
                <p>
                  <strong>Étape 2</strong> : le producteur choisit <M tex="(a, b)" /> sous la contrainte
                  de participation (RI) <M tex="E(w - c(n)) \ge 0" />. À l'optimum, cette{" "}
                  <strong>RI est liante</strong> — toute rente laissée à l'agent est de l'argent perdu :
                </p>
                <MB tex="a + 250\,bn - \tfrac{n^2}{4} = 0 \;\Longrightarrow\; a = \tfrac{n^2}{4} - 250\,bn." />
                <p>
                  En injectant ce <M tex="a" /> dans l'objectif du producteur, tout se simplifie et il
                  ne reste que le <strong>surplus total</strong> :
                </p>
                <MB tex="E(\pi - w) = E(\pi) - a - b\,E(\pi) = 250\,n - \tfrac{n^2}{4}." />
                <p>
                  On y remplace <M tex="n = 500b" /> pour l'exprimer en <M tex="b" /> seul :
                </p>
                <MB tex="E(\pi - w) = 500\cdot\frac{500b}{2} - \frac{(500b)^2}{4} = \tfrac{500^2}{2}\,b - \tfrac{500^2}{4}\,b^2." />
                <MB tex="\frac{\partial U_{pr}}{\partial b} = \tfrac{500^2}{2} - \tfrac{500^2}{2}\,b = 0 \;\Longrightarrow\; b^{*} = 1." />
                <p>On remonte enfin à <M tex="a" /> avec <M tex="b^{*} = 1" /> et <M tex="n^{*} = 500" /> :</p>
                <MB tex="a^{*} = \tfrac{n^2}{4} - 250\,b\,n = \tfrac{500^2}{4} - 250\cdot 500 = -\tfrac{500^2}{4} = -62\,500." />
                <Callout variant="retiens" title="« Vendre l'entreprise à l'agent »">
                  <p>
                    Avec <M tex="b^{*} = 1" />, le commercial touche <em>tout</em> le profit à la marge :
                    il devient <strong>créancier résiduel</strong> et internalise donc pleinement le
                    rendement de son effort — il choisit l'effort <strong>efficient</strong>{" "}
                    <M tex="n^{*} = 500" /> (celui qui maximise le surplus total{" "}
                    <M tex="250n - \tfrac{n^2}{4}" />). La partie fixe négative{" "}
                    <M tex="a^{*} = -\tfrac{500^2}{4}" /> est une <strong>franchise</strong> : le prix
                    que le commercial « paie » d'avance au producteur pour devenir détenteur du projet.
                  </p>
                </Callout>
                <Callout variant="intuition" title="Pourquoi b passe de ½ à 1 ?">
                  <p>
                    En 3.1, un seul instrument (<M tex="b" />) devait à la fois inciter à l'effort{" "}
                    <em>et</em> partager la valeur : le compromis donnait <M tex="b = \tfrac12" /> et un
                    effort divisé par deux (250 au lieu de 500). En 3.2, la franchise <M tex="a" /> prend
                    en charge le partage, ce qui libère <M tex="b" /> pour la seule incitation :{" "}
                    <M tex="b = 1" />, effort efficient, et profit du producteur qui{" "}
                    <strong>double</strong> (62 500 € contre 31 250 €).
                  </p>
                </Callout>
                <ContractBExplorer />
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1</strong> Avec <M tex="a = 0" /> : <M tex="b^{*} = \tfrac12" /> (donc{" "}
              <M tex="w(\pi) = \tfrac{\pi}{2}" />), effort <M tex="n^{*} = 250" />, profit du producteur
              31 250 € — mais le commercial garde une rente. · <strong>3.2</strong> Avec <M tex="a" /> et{" "}
              <M tex="b" /> libres : <M tex="b^{*} = 1" /> et <M tex="a^{*} = -\tfrac{500^2}{4} = -62\,500" /> €,
              effort efficient <M tex="n^{*} = 500" />, profit du producteur 62 500 €.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> quand les deux parties sont neutres au risque et
              l'effort inobservable, le premier best est atteint en « vendant l'entreprise à l'agent » —{" "}
              <M tex="b = 1" /> aligne parfaitement les incitations, et une franchise fixe{" "}
              <M tex="a < 0" /> extrait toute la rente jusqu'à la contrainte de participation. Bloquer{" "}
              <M tex="a = 0" /> prive le producteur de ce levier : il doit brider <M tex="b" /> à{" "}
              <M tex="\tfrac12" />, ce qui distord l'effort vers le bas.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp4"
        id="qx3"
        kicker="Pour vérifier que tu as compris le contrat optimal"
        question={
          <>
            Avec <M tex="a" /> libre, l'optimum est <M tex="b = 1" /> et{" "}
            <M tex="a = -\tfrac{500^2}{4} < 0" />. Que signifie ce contrat ?
          </>
        }
        options={[
          {
            text: (
              <>
                Le commercial devient <strong>créancier résiduel</strong> : il empoche 100 % du profit
                à la marge (<M tex="b = 1" />) et verse d'avance une franchise (<M tex="a < 0" />) qui
                ramène son utilité à son niveau de réserve. Neutralité au risque oblige, cela réalise
                l'effort efficient.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : <M tex="b = 1" /> aligne l'effort sur l'optimum social (<M tex="n = 500" />)
                et <M tex="a < 0" /> transfère le surplus au producteur. C'est « vendre l'entreprise à
                l'agent ».
              </>
            ),
          },
          {
            text: <>Le producteur paie le commercial pour qu'il travaille moins.</>,
            explain: (
              <>
                Non : <M tex="b = 1" /> pousse au contraire l'effort à son maximum efficient{" "}
                <M tex="n = 500" /> (le double de la situation <M tex="a = 0" />).
              </>
            ),
          },
          {
            text: <>Le contrat est infaisable, car un salaire fixe négatif est interdit.</>,
            explain: (
              <>
                Non : <M tex="a" /> est un transfert forfaitaire, il peut être négatif. C'est une
                franchise que l'agent accepte car sa participation reste tout juste satisfaite{" "}
                (<M tex="U_{sa} = 0" />).
              </>
            ),
          },
        ]}
        explanation={
          <>
            Deux parties neutres au risque + effort caché : le contrat optimal sépare les rôles —{" "}
            <M tex="b" /> pour <strong>inciter</strong> (poussé à 1), <M tex="a" /> pour{" "}
            <strong>extraire la rente</strong> (négatif). Résultat : effort efficient et profit maximal
            pour le producteur.
          </>
        }
      />
    </TpShell>
  );
}
