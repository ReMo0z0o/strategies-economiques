/*
 * Chapitre EI2 — composants interactifs.
 *
 * Chaque widget recrée en SVG interactif un graphique des slides du cours :
 *  - CournotBRExplorer      : les deux fonctions de meilleure réponse de
 *    l'exemple (R1 : y1 = 15 − y2/4, R2 : y2 = (45 − y1)/4) et leur
 *    intersection (13, 8) = équilibre de Cournot-Nash (slides 13, 16-20) ;
 *  - IsoProfitExplorer      : les courbes d'iso-profit des firmes 1 et 2,
 *    leurs sommets alignés sur la fonction de meilleure réponse (slides 22-26) ;
 *  - CollusionLensExplorer  : la « lentille » des paires (y1, y2) qui battent
 *    Cournot pour les deux firmes, le point de cartel et la triche (slides 28-39) ;
 *  - StackelbergExplorer    : le leader choisit y1 le long de la réaction du
 *    follower, tangence avec l'iso-profit en (13,9 ; 7,8) (slides 51-57) ;
 *  - EntryDeterrenceExplorer: coût fixe du follower, production limite et les
 *    trois régimes accommodation / exclusion / entrée bloquée (slides 61-66) ;
 *  - NFirmsExplorer         : le surplus total 72n(n+2)/(n+1)² − nF en
 *    fonction du nombre de firmes (slides 77-82) ;
 *  - BertrandUndercutSim    : la course à la sous-enchère vers p = Cm, avec le
 *    cas des coûts asymétriques (slides 84-86) ;
 *  - TacitCollusionExplorer : la condition n < 1 + 1/r de la collusion tacite
 *    (slides 89-93) ;
 *  - DiffBertrandExplorer   : biens différenciés, fonctions de réaction
 *    croissantes et prix d'équilibre 12/(2+h) (slides 97-99) ;
 *  - MasteryChecklist       : la checklist de maîtrise avec compteur.
 */

import { useState, type ReactNode } from "react";
import { CheckCircle2, RotateCcw, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";

/* ------------------------------------------------------------------ */
/* Helpers partagés                                                    */
/* ------------------------------------------------------------------ */

/** format à la belge : 8,75 */
function fr(x: number, digits = 2): string {
  return x.toLocaleString("fr-BE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** petite tuile de lecture */
function Readout({
  label,
  value,
  accent,
}: {
  label: ReactNode;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-lg border bg-card px-3 py-2 text-sm"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      {label} <span className="font-mono text-[15px] font-bold tabular-nums">{value}</span>
    </div>
  );
}

/** bandeau de verdict coloré */
function Verdict({ tone, children }: { tone: "good" | "bad" | "mid"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium leading-relaxed",
        tone === "good" && "border-emerald-300 bg-emerald-50 text-emerald-900",
        tone === "bad" && "border-rose-300 bg-rose-50 text-rose-900",
        tone === "mid" && "border-amber-300 bg-amber-50 text-amber-900",
      )}
    >
      {children}
    </div>
  );
}

const COL = {
  green: "#047857",
  greenSoft: "#d1fae5",
  red: "#be123c",
  redSoft: "#ffe4e6",
  amber: "#b45309",
  purple: "#7c3aed",
  blue: "#0369a1",
  blueSoft: "#e0f2fe",
  ink: "#1c1917",
  grid: "#e7e5e4",
  axis: "#a8a29e",
  label: "#78716c",
};

/** construit un path SVG à partir d'échantillons (null = lever le crayon) */
function pathFrom(points: Array<{ x: number; y: number } | null>): string {
  let d = "";
  let pen = false;
  for (const p of points) {
    if (!p) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* Le modèle fil rouge des slides 14-20 :                              */
/*   p(yT) = 60 − yT ; c1(y1) = y1² ; c2(y2) = 15 y2 + y2²             */
/* ------------------------------------------------------------------ */

const prof1 = (y1: number, y2: number) => (60 - y1 - y2) * y1 - y1 * y1;
const prof2 = (y1: number, y2: number) => (60 - y1 - y2) * y2 - 15 * y2 - y2 * y2;
const br1 = (y2: number) => Math.max(0, 15 - y2 / 4);
const br2 = (y1: number) => Math.max(0, (45 - y1) / 4);

/* équilibre de Cournot-Nash de l'exemple */
const CN = { y1: 13, y2: 8, p1: 338, p2: 128 };
/* point qui maximise le profit joint (cartel) — calculé depuis l'exemple */
const CARTEL = { y1: 12.5, y2: 5 };

/* ------------------------------------------------------------------ */
/* 1. Les meilleures réponses de Cournot et leur intersection          */
/* ------------------------------------------------------------------ */

export function CournotBRExplorer() {
  const [y2Start, setY2Start] = useState(40);
  const [steps, setSteps] = useState(3);

  const W = 560;
  const H = 380;
  const pad = 46;
  const xMax = 48;
  const yMax = 62;
  const X = (y1: number) => pad + (y1 / xMax) * (W - pad - 14);
  const Y = (y2: number) => H - pad - (y2 / yMax) * (H - pad - 16);

  // sentier de « réponses successives » : 1 répond à y2, puis 2 répond, etc.
  const path: Array<{ y1: number; y2: number }> = [];
  let y2c = y2Start;
  let y1c = br1(y2c);
  path.push({ y1: y1c, y2: y2c });
  for (let k = 0; k < steps; k++) {
    y2c = br2(y1c);
    path.push({ y1: y1c, y2: y2c });
    y1c = br1(y2c);
    path.push({ y1: y1c, y2: y2c });
  }
  const last = path[path.length - 1];
  const atEq = Math.abs(last.y1 - 13) < 0.15 && Math.abs(last.y2 - 8) < 0.15;

  return (
    <InteractiveCard
      title="Les deux meilleures réponses… et leur point de rencontre"
      subtitle={
        <>
          L'exemple du cours : <M tex="R_1(y_2) = 15 - \tfrac{1}{4}y_2" /> (vert) et{" "}
          <M tex="R_2(y_1) = \tfrac{45 - y_1}{4}" /> (rouge). L'équilibre de Cournot-Nash est leur
          intersection.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Production initiale <M tex="y_2^0" /> de la firme 2
              </>
            }
            value={y2Start}
            onChange={setY2Start}
            min={0}
            max={60}
            step={1}
          />
          <SliderControl
            label="Rondes de « réponses au mieux »"
            value={steps}
            onChange={setSteps}
            min={0}
            max={5}
            step={1}
          />
        </>
      }
      footer={
        <>
          Pars de n'importe quel <M tex="y_2^0" /> : la firme 1 répond au mieux, la firme 2 répond à
          cette réponse… et le sentier violet fonce vers <strong>(13, 8)</strong>, l'intersection
          des deux droites. Là, chacun joue déjà sa meilleure réponse à l'autre : plus personne ne
          bouge. (Ce sentier est une illustration pédagogique — dans le modèle, les deux firmes
          choisissent leurs quantités <em>simultanément</em> ; l'équilibre est défini comme le point
          fixe, pas comme l'aboutissement d'un processus.)
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label="Point atteint :"
          value={`(${fr(last.y1, 1)} ; ${fr(last.y2, 1)})`}
          accent={COL.purple}
        />
        <Readout label="Équilibre de Cournot-Nash :" value="(13 ; 8)" accent={COL.ink} />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Fonctions de meilleure réponse des deux firmes, intersection en (13, 8)"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {/* grille */}
        {[10, 20, 30, 40, 50, 60].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {[10, 20, 30, 40].map((v) => (
          <text
            key={v}
            x={X(v)}
            y={H - pad + 16}
            textAnchor="middle"
            fontSize={11}
            fill={COL.label}
          >
            {v}
          </text>
        ))}
        {/* axes */}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          y₁
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          y₂
        </text>

        {/* R1 : y1 = 15 − y2/4  ⇔  y2 = 60 − 4y1 (de (0,60) à (15,0)) */}
        <line x1={X(0)} y1={Y(60)} x2={X(15)} y2={Y(0)} stroke={COL.green} strokeWidth={2.6} />
        <text x={X(3.2)} y={Y(52)} fontSize={11} fill={COL.green}>
          R₁ (firme 1)
        </text>
        {/* R2 : y2 = (45 − y1)/4 (de (0,11.25) à (45,0)) */}
        <line x1={X(0)} y1={Y(11.25)} x2={X(45)} y2={Y(0)} stroke={COL.red} strokeWidth={2.6} />
        <text x={X(33)} y={Y(3.4) - 8} fontSize={11} fill={COL.red}>
          R₂ (firme 2)
        </text>

        {/* guides de l'équilibre */}
        <line
          x1={X(13)}
          y1={H - pad}
          x2={X(13)}
          y2={Y(8)}
          stroke={COL.ink}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <line
          x1={pad}
          y1={Y(8)}
          x2={X(13)}
          y2={Y(8)}
          stroke={COL.ink}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={X(13)}
          y={H - pad + 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={COL.ink}
        >
          13
        </text>
        <text
          x={pad - 6}
          y={Y(8) + 4}
          textAnchor="end"
          fontSize={11}
          fontWeight={700}
          fill={COL.ink}
        >
          8
        </text>

        {/* sentier des réponses successives */}
        <polyline
          points={path.map((pt) => `${X(pt.y1)},${Y(pt.y2)}`).join(" ")}
          fill="none"
          stroke={COL.purple}
          strokeWidth={2}
          strokeDasharray="6 3"
        />
        {path.map((pt, i) => (
          <circle
            key={i}
            cx={X(pt.y1)}
            cy={Y(pt.y2)}
            r={i === path.length - 1 ? 5 : 3}
            fill={COL.purple}
            opacity={i === path.length - 1 ? 1 : 0.55}
          />
        ))}

        {/* équilibre */}
        <circle cx={X(13)} cy={Y(8)} r={6} fill="none" stroke={COL.ink} strokeWidth={2} />
        <text x={X(13) + 10} y={Y(8) - 8} fontSize={11.5} fontWeight={700} fill={COL.ink}>
          équilibre de Cournot-Nash (13, 8)
        </text>
      </svg>

      {atEq ? (
        <Verdict tone="good">
          Le sentier a (quasi) atteint (13, 8) : chaque firme joue sa meilleure réponse à l'autre —{" "}
          <M tex="y_1^* = R_1(y_2^*)" /> et <M tex="y_2^* = R_2(y_1^*)" />. Personne n'a intérêt à
          changer seul sa production.
        </Verdict>
      ) : (
        <Verdict tone="mid">
          Pas encore à l'équilibre : au point ({fr(last.y1, 1)} ; {fr(last.y2, 1)}), au moins une
          firme peut encore augmenter son profit en ajustant sa production. Ajoute des rondes !
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Les courbes d'iso-profit                                         */
/* ------------------------------------------------------------------ */

export function IsoProfitExplorer() {
  const [firm, setFirm] = useState<"1" | "2">("1");
  const [k1, setK1] = useState(338);
  const [k2, setK2] = useState(128);

  const W = 560;
  const H = 380;
  const pad = 46;
  const xMax = 32;
  const yMax = 32;
  const X = (y1: number) => pad + (y1 / xMax) * (W - pad - 14);
  const Y = (y2: number) => H - pad - (y2 / yMax) * (H - pad - 16);

  // iso-profit firme 1 (Π1 = K) : y2 = 60 − 2y1 − K/y1 (courbe en cloche)
  function iso1Path(K: number): string {
    const pts: Array<{ x: number; y: number } | null> = [];
    for (let y1 = 0.8; y1 <= xMax; y1 += 0.15) {
      const y2 = 60 - 2 * y1 - K / y1;
      pts.push(y2 >= 0 && y2 <= yMax ? { x: X(y1), y: Y(y2) } : null);
    }
    return pathFrom(pts);
  }
  // iso-profit firme 2 (Π2 = K) : y1 = 45 − 2y2 − K/y2 (ouverte vers la gauche)
  function iso2Path(K: number): string {
    const pts: Array<{ x: number; y: number } | null> = [];
    for (let y2 = 0.8; y2 <= yMax; y2 += 0.15) {
      const y1 = 45 - 2 * y2 - K / y2;
      pts.push(y1 >= 0 && y1 <= xMax ? { x: X(y1), y: Y(y2) } : null);
    }
    return pathFrom(pts);
  }

  const isFirm1 = firm === "1";
  const K = isFirm1 ? k1 : k2;
  // sommet de la courbe mobile (il est SUR la fonction de meilleure réponse)
  const vtx = isFirm1
    ? { y1: Math.sqrt(k1 / 2), y2: 60 - 4 * Math.sqrt(k1 / 2) }
    : { y1: 45 - 4 * Math.sqrt(k2 / 2), y2: Math.sqrt(k2 / 2) };

  return (
    <InteractiveCard
      title="Explore les courbes d'iso-profit"
      subtitle={
        <>
          Une courbe d'iso-profit de la firme 1 relie toutes les paires <M tex="(y_1, y_2)" /> qui
          lui donnent le même profit. Fais varier le niveau de profit et observe comment la courbe
          se déplace.
        </>
      }
      controls={
        <>
          <ChoiceChips
            label="Firme observée"
            options={[
              { value: "1", label: "Firme 1 (courbes en ∩)" },
              { value: "2", label: "Firme 2 (courbes en ⊂)" },
            ]}
            value={firm}
            onChange={setFirm}
          />
          {isFirm1 ? (
            <SliderControl
              label={
                <>
                  Niveau de profit <M tex="\Pi_1" />
                </>
              }
              value={k1}
              onChange={setK1}
              min={160}
              max={440}
              step={5}
            />
          ) : (
            <SliderControl
              label={
                <>
                  Niveau de profit <M tex="\Pi_2" />
                </>
              }
              value={k2}
              onChange={setK2}
              min={40}
              max={240}
              step={5}
            />
          )}
        </>
      }
      footer={
        <>
          Monte le profit : la courbe de la firme 1 <strong>descend</strong> (celle de la firme 2 se
          décale vers la <strong>gauche</strong>). Les iso-profits « les plus bas » correspondent
          aux profits les plus élevés — à <M tex="y_1" /> donné, la firme 1 gagne plus quand{" "}
          <M tex="y_2" /> diminue (le prix remonte). Et le <strong>sommet</strong> de chaque courbe
          glisse exactement le long de la fonction de meilleure réponse : face à un <M tex="y_2" />{" "}
          fixé, le meilleur <M tex="y_1" /> est celui qui « touche » l'iso-profit le plus bas
          possible.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            isFirm1
              ? "Profit de la firme 1 sur la courbe :"
              : "Profit de la firme 2 sur la courbe :"
          }
          value={fr(K, 0)}
          accent={isFirm1 ? COL.green : COL.red}
        />
        <Readout
          label="Sommet (sur la meilleure réponse) :"
          value={`(${fr(vtx.y1, 1)} ; ${fr(vtx.y2, 1)})`}
          accent={COL.purple}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Courbes d'iso-profit et fonction de meilleure réponse"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {[8, 16, 24, 32].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
            <text x={X(v)} y={H - pad + 16} textAnchor="middle" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          y₁
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          y₂
        </text>

        {isFirm1 ? (
          <>
            {/* courbes de référence (fixes, pâles) */}
            <path
              d={iso1Path(220)}
              fill="none"
              stroke={COL.green}
              strokeWidth={1.2}
              opacity={0.3}
            />
            <path
              d={iso1Path(420)}
              fill="none"
              stroke={COL.green}
              strokeWidth={1.2}
              opacity={0.3}
            />
            {/* courbe mobile */}
            <path d={iso1Path(k1)} fill="none" stroke={COL.green} strokeWidth={2.8} />
            {/* meilleure réponse de 1 : y2 = 60 − 4y1 */}
            <line x1={X(7)} y1={Y(32)} x2={X(15)} y2={Y(0)} stroke={COL.ink} strokeWidth={2} />
            <text x={X(8)} y={Y(30)} fontSize={11} fill={COL.ink}>
              R₁ passe par tous les sommets
            </text>
            {/* le y2 fixé + la meilleure réponse (sommet) */}
            {vtx.y2 >= 0 && vtx.y2 <= yMax ? (
              <>
                <line
                  x1={pad}
                  y1={Y(vtx.y2)}
                  x2={X(vtx.y1)}
                  y2={Y(vtx.y2)}
                  stroke={COL.purple}
                  strokeWidth={1.4}
                  strokeDasharray="5 4"
                />
                <circle cx={X(vtx.y1)} cy={Y(vtx.y2)} r={5} fill={COL.purple} />
              </>
            ) : null}
            <text x={X(23)} y={Y(23)} fontSize={11} fill={COL.green}>
              Π₁ augmente ↓
            </text>
          </>
        ) : (
          <>
            <path d={iso2Path(70)} fill="none" stroke={COL.red} strokeWidth={1.2} opacity={0.3} />
            <path d={iso2Path(200)} fill="none" stroke={COL.red} strokeWidth={1.2} opacity={0.3} />
            <path d={iso2Path(k2)} fill="none" stroke={COL.red} strokeWidth={2.8} />
            {/* meilleure réponse de 2 : y1 = 45 − 4y2 */}
            <line
              x1={X(32)}
              y1={Y(3.25)}
              x2={X(0)}
              y2={Y(11.25)}
              stroke={COL.ink}
              strokeWidth={2}
            />
            <text x={X(15)} y={Y(8.6)} fontSize={11} fill={COL.ink}>
              R₂ passe par tous les sommets
            </text>
            {vtx.y1 >= 0 && vtx.y1 <= xMax ? (
              <>
                <line
                  x1={X(vtx.y1)}
                  y1={H - pad}
                  x2={X(vtx.y1)}
                  y2={Y(vtx.y2)}
                  stroke={COL.purple}
                  strokeWidth={1.4}
                  strokeDasharray="5 4"
                />
                <circle cx={X(vtx.y1)} cy={Y(vtx.y2)} r={5} fill={COL.purple} />
              </>
            ) : null}
            <text x={X(20)} y={Y(26)} fontSize={11} fill={COL.red}>
              ← Π₂ augmente
            </text>
          </>
        )}
      </svg>

      <Verdict tone="mid">
        {isFirm1 ? (
          <>
            Lecture : si la firme 2 produit <M tex="y_2" /> = {fr(Math.max(0, vtx.y2), 1)}, la
            meilleure réponse de la firme 1 est le sommet <M tex="y_1" /> = {fr(vtx.y1, 1)} — le
            point où la droite horizontale « touche » l'iso-profit le plus bas atteignable.
          </>
        ) : (
          <>
            Même logique en tournant la tête de 90° : si la firme 1 produit <M tex="y_1" /> ={" "}
            {fr(Math.max(0, vtx.y1), 1)}, la meilleure réponse de la firme 2 est le sommet{" "}
            <M tex="y_2" /> = {fr(vtx.y2, 1)} de sa courbe (qui s'ouvre vers la gauche).
          </>
        )}
      </Verdict>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. La lentille de collusion et la triche                            */
/* ------------------------------------------------------------------ */

/* la « lentille » (Π1 ≥ 338 ET Π2 ≥ 128) est fixe : on la calcule une fois */
const LENS_POINTS: Array<[number, number]> = (() => {
  // deuxième intersection des iso-profits passant par (13, 8), le long de iso2
  let cy1 = 13;
  let cy2 = 8;
  for (let y2 = 7.95; y2 > 1; y2 -= 0.005) {
    const y1 = 45 - 2 * y2 - 128 / y2;
    if (y1 <= 0 || prof1(y1, y2) < CN.p1) break;
    cy1 = y1;
    cy2 = y2;
  }
  const pts: Array<[number, number]> = [];
  for (let y1 = 13; y1 >= cy1; y1 -= 0.04) pts.push([y1, 60 - 2 * y1 - CN.p1 / y1]);
  for (let y2 = cy2; y2 <= 8; y2 += 0.04) pts.push([45 - 2 * y2 - CN.p2 / y2, y2]);
  return pts;
})();

export function CollusionLensExplorer() {
  const [y1, setY1] = useState(13);
  const [y2, setY2] = useState(8);
  const [preset, setPreset] = useState<"cournot" | "cartel" | "triche" | "libre">("cournot");

  const W = 560;
  const H = 400;
  const pad = 46;
  const x0 = 4;
  const xMax = 20;
  const yMaxV = 14;
  const X = (v: number) => pad + ((v - x0) / (xMax - x0)) * (W - pad - 14);
  const Y = (v: number) => H - pad - (v / yMaxV) * (H - pad - 16);

  const p1 = prof1(y1, y2);
  const p2 = prof2(y1, y2);
  const d1 = p1 - CN.p1;
  const d2 = p2 - CN.p2;

  function applyPreset(p: "cournot" | "cartel" | "triche" | "libre") {
    setPreset(p);
    if (p === "cournot") {
      setY1(13);
      setY2(8);
    } else if (p === "cartel") {
      setY1(CARTEL.y1);
      setY2(CARTEL.y2);
    } else if (p === "triche") {
      setY1(CARTEL.y1);
      setY2(br2(CARTEL.y1)); // 8,125 : la firme 2 joue sa meilleure réponse au quota de 1
    }
  }

  function iso1Path(K: number): string {
    const pts: Array<{ x: number; y: number } | null> = [];
    for (let t = x0; t <= xMax; t += 0.08) {
      const v = 60 - 2 * t - K / t;
      pts.push(v >= 0 && v <= yMaxV ? { x: X(t), y: Y(v) } : null);
    }
    return pathFrom(pts);
  }
  function iso2Path(K: number): string {
    const pts: Array<{ x: number; y: number } | null> = [];
    for (let t = 1.4; t <= yMaxV; t += 0.08) {
      const v = 45 - 2 * t - K / t;
      pts.push(v >= x0 && v <= xMax ? { x: X(v), y: Y(t) } : null);
    }
    return pathFrom(pts);
  }

  const inLens = d1 > 0.01 && d2 > 0.01;
  const isCournot = Math.abs(y1 - 13) < 0.03 && Math.abs(y2 - 8) < 0.03;

  return (
    <InteractiveCard
      title="Peut-on faire mieux que Cournot ? La « lentille » de la collusion"
      subtitle={
        <>
          Les deux courbes sont les iso-profits qui passent par l'équilibre de Cournot-Nash (13, 8).
          Dans la zone bleutée, <strong>les deux</strong> firmes gagnent plus qu'en Cournot. Déplace
          le point ou utilise les scénarios.
        </>
      }
      controls={
        <>
          <ChoiceChips
            label="Scénario"
            options={[
              { value: "cournot", label: "Cournot (13 ; 8)" },
              { value: "cartel", label: "Cartel (12,5 ; 5)" },
              { value: "triche", label: "La firme 2 triche" },
              { value: "libre", label: "Libre" },
            ]}
            value={preset}
            onChange={applyPreset}
          />
          <SliderControl
            label={
              <>
                <M tex="y_1" /> (firme 1)
              </>
            }
            value={y1}
            onChange={(v) => {
              setY1(v);
              setPreset("libre");
            }}
            min={6}
            max={18}
            step={0.05}
            format={(v) => fr(v, 2)}
          />
          <SliderControl
            label={
              <>
                <M tex="y_2" /> (firme 2)
              </>
            }
            value={y2}
            onChange={(v) => {
              setY2(v);
              setPreset("libre");
            }}
            min={2}
            max={12}
            step={0.05}
            format={(v) => fr(v, 2)}
          />
        </>
      }
      footer={
        <>
          Depuis (13, 8), réduis <em>les deux</em> productions : tu entres dans la lentille (les
          deux profits montent, car le prix remonte). Le scénario « Cartel » montre la paire qui
          maximise le profit <em>total</em> (487,5 au lieu de 338 + 128 = 466) — le cartel le
          partage ensuite entre les firmes. Puis clique « La firme 2 triche » : en jouant sa
          meilleure réponse <M tex="R_2(12{,}5) = 8{,}125" /> au quota de la firme 1, elle gonfle{" "}
          <em>son</em> profit… et fait plonger celui de la firme 1. Voilà pourquoi un cartel est
          fondamentalement instable.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              <M tex="\Pi_1" /> :
            </>
          }
          value={`${fr(p1, 1)} (${d1 >= 0 ? "+" : ""}${fr(d1, 1)} vs Cournot)`}
          accent={COL.green}
        />
        <Readout
          label={
            <>
              <M tex="\Pi_2" /> :
            </>
          }
          value={`${fr(p2, 1)} (${d2 >= 0 ? "+" : ""}${fr(d2, 1)} vs Cournot)`}
          accent={COL.red}
        />
        <Readout label="Profit total :" value={fr(p1 + p2, 1)} accent={COL.purple} />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Iso-profits passant par l'équilibre de Cournot, lentille de collusion, cartel et triche"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {[2, 4, 6, 8, 10, 12, 14].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {[6, 10, 14, 18].map((v) => (
          <text
            key={v}
            x={X(v)}
            y={H - pad + 16}
            textAnchor="middle"
            fontSize={11}
            fill={COL.label}
          >
            {v}
          </text>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          y₁
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          y₂
        </text>

        {/* lentille */}
        <polygon
          points={LENS_POINTS.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")}
          fill={COL.blueSoft}
          stroke={COL.blue}
          strokeWidth={1}
          opacity={0.75}
        />

        {/* meilleures réponses */}
        <line
          x1={X(11.5)}
          y1={Y(14)}
          x2={X(15)}
          y2={Y(0)}
          stroke={COL.green}
          strokeWidth={1.6}
          opacity={0.55}
        />
        <line
          x1={X(4)}
          y1={Y(10.25)}
          x2={X(20)}
          y2={Y(6.25)}
          stroke={COL.red}
          strokeWidth={1.6}
          opacity={0.55}
        />
        <text x={X(4.4)} y={Y(10.4) - 6} fontSize={10.5} fill={COL.red} opacity={0.9}>
          R₂
        </text>
        <text x={X(11.6)} y={Y(13.4)} fontSize={10.5} fill={COL.green} opacity={0.9}>
          R₁
        </text>

        {/* iso-profits passant par Cournot */}
        <path d={iso1Path(CN.p1)} fill="none" stroke={COL.green} strokeWidth={2.4} />
        <path d={iso2Path(CN.p2)} fill="none" stroke={COL.red} strokeWidth={2.4} />
        <text x={X(15.2)} y={Y(2.6)} fontSize={11} fill={COL.green}>
          Π₁ = 338
        </text>
        <text x={X(14.6)} y={Y(10.6)} fontSize={11} fill={COL.red}>
          Π₂ = 128
        </text>

        {/* points remarquables */}
        <circle cx={X(13)} cy={Y(8)} r={5.5} fill="#7dd3fc" stroke={COL.ink} strokeWidth={1.4} />
        <text x={X(13) + 9} y={Y(8) - 7} fontSize={11} fontWeight={700} fill={COL.ink}>
          Cournot (13, 8)
        </text>
        <circle cx={X(CARTEL.y1)} cy={Y(CARTEL.y2)} r={5} fill={COL.ink} />
        <text
          x={X(CARTEL.y1) + 8}
          y={Y(CARTEL.y2) + 14}
          fontSize={11}
          fontWeight={700}
          fill={COL.ink}
        >
          cartel (yᵐ)
        </text>

        {/* point courant */}
        <line
          x1={X(y1)}
          y1={H - pad}
          x2={X(y1)}
          y2={Y(y2)}
          stroke={COL.purple}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <line
          x1={pad}
          y1={Y(y2)}
          x2={X(y1)}
          y2={Y(y2)}
          stroke={COL.purple}
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <circle cx={X(y1)} cy={Y(y2)} r={6} fill={COL.purple} />
      </svg>

      {preset === "triche" ? (
        <Verdict tone="bad">
          Triche ! La firme 2 abandonne son quota (5) pour sa meilleure réponse (8,125) : son profit
          grimpe de 112,5 à {fr(p2, 1)}, mais celui de la firme 1 s'effondre de 375 à {fr(p1, 1)}.
          Chaque membre du cartel a la même tentation — c'est un dilemme du prisonnier.
        </Verdict>
      ) : isCournot ? (
        <Verdict tone="mid">
          Tu es à l'équilibre de Cournot-Nash. Stable… mais pas optimal pour les firmes : toute la
          lentille bleutée (en bas à gauche) donne plus de profit <em>aux deux</em>.
        </Verdict>
      ) : inLens ? (
        <Verdict tone="good">
          Les deux firmes battent leur profit de Cournot ({fr(d1, 1)} de plus pour 1, {fr(d2, 1)} de
          plus pour 2) : en réduisant ensemble les quantités, le prix remonte. C'est exactement
          l'incitant à la collusion.
        </Verdict>
      ) : (
        <Verdict tone="bad">
          Au moins une firme fait moins bien qu'en Cournot ici (
          {d1 < 0 ? "la firme 1" : "la firme 2"} perd {fr(Math.abs(d1 < 0 ? d1 : d2), 1)}). Ce point
          ne pourrait pas faire l'objet d'un accord volontaire des deux firmes.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. L'équilibre de Stackelberg                                       */
/* ------------------------------------------------------------------ */

const Y1S = 195 / 14; // ≈ 13,93 (le cours arrondit à 13,9)
const PI1S = (195 / 4) * Y1S - (7 / 4) * Y1S * Y1S; // ≈ 339,5

export function StackelbergExplorer() {
  const [y1, setY1] = useState(11);

  const W = 560;
  const H = 360;
  const pad = 46;
  const xMax = 30;
  const yMaxV = 14;
  const X = (v: number) => pad + (v / xMax) * (W - pad - 14);
  const Y = (v: number) => H - pad - (v / yMaxV) * (H - pad - 16);

  const y2 = br2(y1);
  const p1 = (195 / 4) * y1 - (7 / 4) * y1 * y1; // Π1 le long de la réaction de 2
  const p2 = 2 * y2 * y2; // Π2 = (45 − y1 − 2y2)y2 avec y2 = (45−y1)/4

  function iso1Path(K: number): string {
    const pts: Array<{ x: number; y: number } | null> = [];
    for (let t = 1; t <= xMax; t += 0.1) {
      const v = 60 - 2 * t - K / t;
      pts.push(v >= 0 && v <= yMaxV ? { x: X(t), y: Y(v) } : null);
    }
    return pathFrom(pts);
  }

  const atOpt = Math.abs(y1 - Y1S) < 0.12;

  return (
    <InteractiveCard
      title="Sois le leader : choisis ta production en premier"
      subtitle={
        <>
          Le follower (firme 2) répondra <em>toujours</em> par <M tex="y_2 = R_2(y_1)" /> : le
          leader choisit donc son point <strong>sur la droite rouge</strong>. Où son profit est-il
          maximal ?
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Production du leader <M tex="y_1" />
            </>
          }
          value={y1}
          onChange={setY1}
          min={5}
          max={25}
          step={0.05}
          format={(v) => fr(v, 2)}
        />
      }
      footer={
        <>
          Le profit du leader culmine en <M tex="y_1^S \approx 13{,}9" /> — là où son iso-profit
          (vert) est <strong>tangente</strong> à la droite de réaction du follower. Compare avec
          Cournot : le leader produit plus (13,9 au lieu de 13), le follower moins (7,8 au lieu de
          8), et la production totale augmente (21,7 au lieu de 21) — donc le prix baisse. Jouer en
          premier <em>et pouvoir s'y engager</em> rapporte : 339,5 au lieu de 338.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout label="Réponse du follower :" value={fr(y2, 2)} accent={COL.red} />
        <Readout
          label={
            <>
              Profit du leader <M tex="\Pi_1^s" /> :
            </>
          }
          value={fr(p1, 1)}
          accent={COL.green}
        />
        <Readout
          label={
            <>
              Profit du follower <M tex="\Pi_2" /> :
            </>
          }
          value={fr(p2, 1)}
          accent={COL.red}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Le leader choisit un point sur la fonction de réaction du follower ; tangence avec l'iso-profit à l'équilibre de Stackelberg"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {[2, 4, 6, 8, 10, 12, 14].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {[5, 10, 15, 20, 25].map((v) => (
          <text
            key={v}
            x={X(v)}
            y={H - pad + 16}
            textAnchor="middle"
            fontSize={11}
            fill={COL.label}
          >
            {v}
          </text>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          y₁
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          y₂
        </text>

        {/* réaction du follower : y2 = (45 − y1)/4 */}
        <line x1={X(0)} y1={Y(11.25)} x2={X(30)} y2={Y(3.75)} stroke={COL.red} strokeWidth={2.6} />
        <text x={X(20.5)} y={Y(6.4) - 8} fontSize={11} fill={COL.red}>
          réaction du follower R₂
        </text>

        {/* iso-profit du leader passant par le point courant */}
        <path d={iso1Path(p1)} fill="none" stroke={COL.green} strokeWidth={2.4} />
        <text x={X(6)} y={Y(1.6)} fontSize={11} fill={COL.green}>
          iso-profit du leader (Π₁ = {fr(p1, 0)})
        </text>

        {/* repères Cournot & Stackelberg */}
        <circle cx={X(13)} cy={Y(8)} r={5} fill="#7dd3fc" stroke={COL.ink} strokeWidth={1.2} />
        <text x={X(13) - 8} y={Y(8) - 10} textAnchor="end" fontSize={11} fill={COL.ink}>
          Cournot (13 ; 8)
        </text>
        <circle cx={X(Y1S)} cy={Y(br2(Y1S))} r={5} fill="#57534e" />
        <text x={X(Y1S) + 8} y={Y(br2(Y1S)) + 16} fontSize={11} fill="#57534e">
          Stackelberg (13,9 ; 7,8)
        </text>

        {/* point courant */}
        <line
          x1={X(y1)}
          y1={H - pad}
          x2={X(y1)}
          y2={Y(y2)}
          stroke={COL.purple}
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />
        <circle cx={X(y1)} cy={Y(y2)} r={6} fill={COL.purple} />
      </svg>

      {atOpt ? (
        <Verdict tone="good">
          Optimum atteint : <M tex="y_1^S \approx 13{,}9" />, <M tex="y_2^S \approx 7{,}8" />,
          profit du leader ≈ {fr(PI1S, 1)}. L'iso-profit du leader est tangente à la réaction du
          follower — impossible de descendre plus bas en restant sur la droite rouge.
        </Verdict>
      ) : p1 >= CN.p1 ? (
        <Verdict tone="mid">
          Pas mal : {fr(p1, 1)} ≥ 338 (ton profit de Cournot). Mais le maximum ({fr(PI1S, 1)}) est
          en y₁ ≈ 13,9 — continue de chercher la tangence.
        </Verdict>
      ) : (
        <Verdict tone="bad">
          Ici ton profit ({fr(p1, 1)}) est en dessous de celui de Cournot (338). Souviens-toi : le
          leader peut <em>toujours</em> faire au moins aussi bien qu'en Cournot, en jouant
          simplement y₁ = 13.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Empêcher l'entrée du concurrent                                  */
/* ------------------------------------------------------------------ */

export function EntryDeterrenceExplorer() {
  const [F, setF] = useState(40);

  const W = 560;
  const H = 340;
  const pad = 46;
  const xMax = 47;
  const yMaxV = 13;
  const X = (v: number) => pad + (v / xMax) * (W - pad - 14);
  const Y = (v: number) => H - pad - (v / yMaxV) * (H - pad - 16);

  // profit brut du follower s'il entre et joue sa meilleure réponse : (45 − y1)²/8
  const entrantGross = (yy1: number) => Math.pow(45 - yy1, 2) / 8;
  // production limite : au-delà, l'entrée n'est plus rentable
  const yLimit = Math.max(0, 45 - Math.sqrt(8 * F));

  const stackExcludes = entrantGross(Y1S) < F; // même y1^S exclut déjà
  const yExclu = Math.max(yLimit, 15); // 15 = production de monopole du leader
  const piExclu = (60 - yExclu) * yExclu - yExclu * yExclu; // profit de monopole en yExclu
  const piAccommode = PI1S;

  let regime: "blocage" | "exclusion" | "accommodation";
  if (stackExcludes) regime = "blocage";
  else if (piExclu > piAccommode) regime = "exclusion";
  else regime = "accommodation";

  const leaderY1 = regime === "accommodation" ? Y1S : regime === "exclusion" ? yExclu : 15;
  const leaderPi =
    regime === "accommodation" ? piAccommode : (60 - leaderY1) * leaderY1 - leaderY1 * leaderY1;
  const followerIn = regime === "accommodation";

  return (
    <InteractiveCard
      title="Coût fixe du follower : accommoder, exclure… ou entrée déjà bloquée ?"
      subtitle={
        <>
          Le follower ne rentre que si son profit couvre son coût fixe <M tex="F" /> : au-delà de la
          production limite <M tex="\hat{y}_1" />, sa « vraie » fonction de réaction devient{" "}
          <strong>y₂ = 0</strong> (il reste dehors). Fais varier <M tex="F" /> et observe la
          stratégie du leader.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Coût fixe <M tex="F" /> du follower
            </>
          }
          value={F}
          onChange={setF}
          min={10}
          max={130}
          step={5}
        />
      }
      footer={
        <>
          Trois régimes, comme sur les slides : (1) <M tex="F" /> faible → exclure exigerait une
          surproduction énorme, le leader <strong>accommode</strong> l'entrée (Stackelberg) ; (2){" "}
          <M tex="F" /> intermédiaire → le leader <strong>surproduit exprès</strong> (limit pricing)
          pour rendre l'entrée non rentable — profit plus élevé, mais risque d'
          <strong>abus de position dominante</strong> ; (3) <M tex="F" /> élevé → la production «
          normale » du leader suffit déjà à décourager l'entrée : exclusion <em>sans</em> intention,
          sans doute pas un abus.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              Production limite <M tex="\hat{y}_1" /> :
            </>
          }
          value={fr(yLimit, 1)}
          accent={COL.red}
        />
        <Readout label="Profit si le leader accommode :" value={fr(piAccommode, 1)} />
        <Readout
          label="Profit si le leader exclut :"
          value={fr((60 - yExclu) * yExclu - yExclu * yExclu, 1)}
          accent={COL.purple}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Fonction de réaction du follower avec zone de non-entrée, choix du leader"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {[2, 4, 6, 8, 10, 12].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {[10, 20, 30, 40].map((v) => (
          <text
            key={v}
            x={X(v)}
            y={H - pad + 16}
            textAnchor="middle"
            fontSize={11}
            fill={COL.label}
          >
            {v}
          </text>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          y₁
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          y₂
        </text>

        {/* réaction du follower : partie « il entre » (solide) */}
        {yLimit > 0 ? (
          <line
            x1={X(0)}
            y1={Y(11.25)}
            x2={X(Math.min(yLimit, 45))}
            y2={Y(br2(Math.min(yLimit, 45)))}
            stroke={COL.red}
            strokeWidth={2.6}
          />
        ) : null}
        {/* partie exclue (pointillés) + remplacement sur l'axe */}
        <line
          x1={X(Math.min(yLimit, 45))}
          y1={Y(br2(Math.min(yLimit, 45)))}
          x2={X(45)}
          y2={Y(0)}
          stroke={COL.red}
          strokeWidth={2}
          strokeDasharray="6 5"
          opacity={0.65}
        />
        <line
          x1={X(Math.min(yLimit, 45))}
          y1={Y(0)}
          x2={X(46.5)}
          y2={Y(0)}
          stroke={COL.red}
          strokeWidth={4}
        />
        <text x={X(2)} y={Y(11.25) - 8} fontSize={11} fill={COL.red}>
          réaction du follower (il entre)
        </text>
        <text x={X(Math.min(yLimit + 1, 40))} y={Y(0) - 8} fontSize={10.5} fill={COL.red}>
          non-entrée (y₂ = 0)
        </text>
        {/* seuil ŷ1 */}
        <line
          x1={X(yLimit)}
          y1={H - pad}
          x2={X(yLimit)}
          y2={Y(br2(yLimit)) - 8}
          stroke={COL.red}
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />
        <text
          x={X(yLimit)}
          y={Y(br2(yLimit)) - 14}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={COL.red}
        >
          ŷ₁ = {fr(yLimit, 1)}
        </text>

        {/* repère Stackelberg */}
        <circle cx={X(Y1S)} cy={Y(br2(Y1S))} r={4.5} fill="#57534e" />
        <text x={X(Y1S)} y={Y(br2(Y1S)) - 10} textAnchor="middle" fontSize={10.5} fill="#57534e">
          Stackelberg
        </text>

        {/* choix du leader */}
        <circle cx={X(leaderY1)} cy={Y(followerIn ? br2(leaderY1) : 0)} r={6.5} fill={COL.purple} />
        <text
          x={X(leaderY1) + 9}
          y={Y(followerIn ? br2(leaderY1) : 0) - 9}
          fontSize={11}
          fontWeight={700}
          fill={COL.purple}
        >
          choix du leader
        </text>
      </svg>

      {regime === "accommodation" ? (
        <Verdict tone="good">
          <strong>Le leader accommode l'entrée.</strong> Exclure exigerait de produire{" "}
          {fr(yLimit, 1)} (profit {fr(piExclu, 1)}), bien moins rentable que l'équilibre de
          Stackelberg ({fr(piAccommode, 1)}). Le follower entre et produit {fr(br2(Y1S), 1)}.
        </Verdict>
      ) : regime === "exclusion" ? (
        <Verdict tone="bad">
          <strong>Limit pricing !</strong> Le leader surproduit ({fr(leaderY1, 1)} au lieu de 13,9)
          pour faire chuter le prix et rendre l'entrée non rentable : profit {fr(leaderPi, 1)}{" "}
          contre {fr(piAccommode, 1)} en accommodant. Surproduction <em>expressément destinée</em> à
          exclure → risque sérieux d'abus de position dominante.
        </Verdict>
      ) : (
        <Verdict tone="mid">
          <strong>Entrée déjà bloquée.</strong> Avec F = {F}, même la production « normale » du
          leader décourage l'entrée (le profit brut d'entrée face à y₁ = 13,9 vaut{" "}
          {fr(entrantGross(Y1S), 1)} &lt; F). Le leader produit son optimum de monopole (15) et
          gagne {fr(leaderPi, 1)} — l'exclusion n'est qu'un effet secondaire : sans doute pas un
          abus.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Accroître le nombre de firmes                                    */
/* ------------------------------------------------------------------ */

export function NFirmsExplorer() {
  const [n, setN] = useState(3);
  const [F, setF] = useState(1);

  const yi = 12 / (n + 1);
  const yT = (12 * n) / (n + 1);
  const p = 12 / (n + 1);
  const pii = Math.pow(12 / (n + 1), 2) - F;
  const piT = n * Math.pow(12 / (n + 1), 2) - n * F;
  const SC = 72 * Math.pow(n / (n + 1), 2);
  const ST = (72 * n * (n + 2)) / Math.pow(n + 1, 2) - n * F;

  // n* qui maximise le surplus total (parmi 1..10)
  let nStar = 1;
  let best = -Infinity;
  for (let k = 1; k <= 10; k++) {
    const v = (72 * k * (k + 2)) / Math.pow(k + 1, 2) - k * F;
    if (v > best) {
      best = v;
      nStar = k;
    }
  }

  const W = 560;
  const H = 320;
  const pad = 46;
  const X = (v: number) => pad + ((v - 1) / 9) * (W - pad - 14);
  const yLo = 35;
  const yHi = 74;
  const Y = (v: number) => H - pad - ((v - yLo) / (yHi - yLo)) * (H - pad - 16);

  const curve: string[] = [];
  for (let k = 1; k <= 10; k += 0.1) {
    const v = (72 * k * (k + 2)) / Math.pow(k + 1, 2) - k * F;
    curve.push(`${X(k)},${Y(Math.max(yLo, Math.min(yHi, v)))}`);
  }

  return (
    <InteractiveCard
      title="Plus de firmes = plus de bien-être ? Pas si vite…"
      subtitle={
        <>
          Le modèle des slides : demande <M tex="p = 12 - y_T" />, coût marginal nul, coût fixe{" "}
          <M tex="F" /> par firme. La courbe montre le surplus total{" "}
          <M tex="SC + \pi_T = \tfrac{72n(n+2)}{(n+1)^2} - nF" /> selon le nombre de firmes.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Nombre de firmes <M tex="n" />
              </>
            }
            value={n}
            onChange={setN}
            min={1}
            max={10}
            step={1}
          />
          <SliderControl
            label={
              <>
                Coût fixe <M tex="F" /> par firme
              </>
            }
            value={F}
            onChange={setF}
            min={0}
            max={3}
            step={0.5}
            format={(v) => fr(v, 1)}
          />
        </>
      }
      footer={
        <>
          Avec <M tex="F = 0" />, plus de firmes = toujours mieux (le surplus total grimpe vers 72).
          Mais dès que <M tex="F" /> est positif, chaque firme supplémentaire{" "}
          <em>duplique un coût fixe</em> : le surplus total finit par baisser. À <M tex="F = 1" />{" "}
          l'optimum est 4 firmes ; à <M tex="F = 2" />, 3 firmes. Plus de concurrence fait toujours
          baisser le prix et monter le surplus des consommateurs — mais l'effet <em>net</em> sur le
          bien-être est ambigu.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout label="Production par firme :" value={fr(yi, 2)} />
        <Readout label="Production totale :" value={fr(yT, 2)} />
        <Readout label="Prix :" value={fr(p, 2)} accent={COL.red} />
        <Readout label="Profit par firme :" value={fr(pii, 2)} />
        <Readout label="Surplus consommateurs :" value={fr(SC, 2)} accent={COL.green} />
        <Readout label="Surplus total :" value={fr(ST, 2)} accent={COL.purple} />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Surplus total en fonction du nombre de firmes, maximum intérieur dû aux coûts fixes"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {[40, 50, 60, 70].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
          <text
            key={v}
            x={X(v)}
            y={H - pad + 16}
            textAnchor="middle"
            fontSize={11}
            fill={COL.label}
          >
            {v}
          </text>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          n
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          ST
        </text>

        <polyline points={curve.join(" ")} fill="none" stroke={COL.purple} strokeWidth={2.6} />

        {/* optimum */}
        <line
          x1={X(nStar)}
          y1={H - pad}
          x2={X(nStar)}
          y2={Y((72 * nStar * (nStar + 2)) / Math.pow(nStar + 1, 2) - nStar * F)}
          stroke={COL.green}
          strokeWidth={1.4}
          strokeDasharray="5 4"
        />
        <text
          x={X(nStar)}
          y={Y((72 * nStar * (nStar + 2)) / Math.pow(nStar + 1, 2) - nStar * F) - 10}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={700}
          fill={COL.green}
        >
          optimum : n* = {nStar}
        </text>

        {/* point courant */}
        <circle cx={X(n)} cy={Y(Math.max(yLo, Math.min(yHi, ST)))} r={6} fill={COL.purple} />
      </svg>

      {n === nStar ? (
        <Verdict tone="good">
          Avec F = {fr(F, 1)}, tu es au nombre de firmes qui maximise le surplus total ({fr(ST, 1)}
          ). En ajouter une de plus ferait baisser le prix… mais gaspillerait un coût fixe de plus.
        </Verdict>
      ) : n < nStar ? (
        <Verdict tone="mid">
          Ici, une firme de plus <em>augmenterait</em> encore le surplus total (gain de concurrence
          supérieur au coût fixe additionnel) : l'optimum est n* = {nStar}.
        </Verdict>
      ) : (
        <Verdict tone="bad">
          Trop de firmes ! Les consommateurs gagnent (SC = {fr(SC, 1)}), mais les coûts fixes
          dupliqués mangent davantage : le surplus total ({fr(ST, 1)}) est plus faible qu'avec n* ={" "}
          {nStar} firmes.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Bertrand : la course à la sous-enchère                           */
/* ------------------------------------------------------------------ */

export function BertrandUndercutSim() {
  const [scen, setScen] = useState<"sym" | "asym">("sym");
  const [p1, setP1] = useState(30);
  const [p2, setP2] = useState(30);

  const c1 = scen === "sym" ? 12 : 8;
  const c2 = 12;

  // demande illustrative D(p) = 60 − p (adaptation pédagogique, cf. note du chapitre)
  const D = (p: number) => Math.max(0, 60 - p);
  const q1 = p1 < p2 ? D(p1) : p1 === p2 ? D(p1) / 2 : 0;
  const q2 = p2 < p1 ? D(p2) : p1 === p2 ? D(p2) / 2 : 0;
  const g1 = (p1 - c1) * q1;
  const g2 = (p2 - c2) * q2;

  function round() {
    // la firme qui ne capte pas (tout) le marché sous-cote si ce n'est pas à perte
    if (p1 === p2) {
      // les deux se partagent : la plus agressive (coût le plus bas) dégaine ; à
      // coûts égaux, la firme 1 commence
      const cand = p1 - 0.5;
      if (c1 <= c2 && cand >= c1) setP1(cand);
      else if (cand >= c2) setP2(cand);
    } else if (p1 > p2) {
      const cand = p2 - 0.5;
      if (cand >= c1) setP1(cand);
    } else {
      const cand = p1 - 0.5;
      if (cand >= c2) setP2(cand);
    }
  }
  function reset() {
    setP1(30);
    setP2(30);
  }

  const stuck =
    p1 === p2 ? p1 - 0.5 < c1 && p1 - 0.5 < c2 : p1 > p2 ? p2 - 0.5 < c1 : p1 - 0.5 < c2;

  const W = 560;
  const H = 150;
  const x0 = 40;
  const x1 = 530;
  const PX = (p: number) => x0 + (p / 40) * (x1 - x0);

  return (
    <InteractiveCard
      title="La guerre des prix de Bertrand, au ralenti"
      subtitle={
        <>
          Bien homogène : le moins cher rafle <em>toute</em> la demande (partage 50/50 si prix
          égaux). Clique « une ronde de sous-enchère » et regarde où la course s'arrête.
        </>
      }
      controls={
        <>
          <ChoiceChips
            label="Scénario de coûts"
            options={[
              { value: "sym", label: "c₁ = c₂ = 12" },
              { value: "asym", label: "c₁ = 8 < c₂ = 12" },
            ]}
            value={scen}
            onChange={(v) => {
              setScen(v);
              reset();
            }}
          />
          <SliderControl
            label={
              <>
                Prix <M tex="p_1" /> (firme 1)
              </>
            }
            value={p1}
            onChange={setP1}
            min={5}
            max={40}
            step={0.5}
            format={(v) => fr(v, 1)}
          />
          <SliderControl
            label={
              <>
                Prix <M tex="p_2" /> (firme 2)
              </>
            }
            value={p2}
            onChange={setP2}
            min={5}
            max={40}
            step={0.5}
            format={(v) => fr(v, 1)}
          />
        </>
      }
      footer={
        <>
          À coûts identiques, la course ne s'arrête qu'à <M tex="p_1 = p_2 = c" /> :{" "}
          <strong>le paradoxe de Bertrand</strong> — deux firmes suffisent pour retrouver le prix
          concurrentiel et des profits nuls. À coûts différents, la firme efficace s'arrête juste au
          niveau du coût marginal de sa rivale : elle rafle tout le marché avec un profit positif.
          (La demande <M tex="D(p) = 60 - p" /> sert uniquement d'illustration chiffrée.)
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={round}
          disabled={stuck}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Swords className="h-4 w-4" aria-hidden /> Une ronde de sous-enchère
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Recommencer
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Axe des prix avec les coûts marginaux et les prix des deux firmes"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        <line x1={x0} y1={70} x2={x1} y2={70} stroke={COL.axis} strokeWidth={1.6} />
        {[0, 10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line x1={PX(v)} y1={70} x2={PX(v)} y2={76} stroke={COL.axis} strokeWidth={1.2} />
            <text x={PX(v)} y={92} textAnchor="middle" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        <text x={x1} y={112} textAnchor="end" fontSize={11} fill={COL.label}>
          prix
        </text>

        {/* coûts marginaux */}
        <line
          x1={PX(c1)}
          y1={40}
          x2={PX(c1)}
          y2={72}
          stroke={COL.green}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <text x={PX(c1)} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill={COL.green}>
          c₁ = {c1}
        </text>
        <line
          x1={PX(c2)}
          y1={52}
          x2={PX(c2)}
          y2={72}
          stroke={COL.amber}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        <text x={PX(c2)} y={48} textAnchor="middle" fontSize={11} fontWeight={700} fill={COL.amber}>
          c₂ = {c2}
        </text>

        {/* prix courants */}
        <circle cx={PX(p1)} cy={70} r={7} fill={COL.red} opacity={0.9} />
        <text
          x={PX(p1)}
          y={124}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={700}
          fill={COL.red}
        >
          p₁ = {fr(p1, 1)}
        </text>
        <circle cx={PX(p2)} cy={70} r={7} fill={COL.blue} opacity={0.9} />
        <text
          x={PX(p2)}
          y={110}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={700}
          fill={COL.blue}
        >
          p₂ = {fr(p2, 1)}
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-2.5">
        <Readout
          label="Firme 1 : ventes / profit"
          value={`${fr(q1, 1)} / ${fr(g1, 1)}`}
          accent={COL.red}
        />
        <Readout
          label="Firme 2 : ventes / profit"
          value={`${fr(q2, 1)} / ${fr(g2, 1)}`}
          accent={COL.blue}
        />
      </div>

      {stuck ? (
        scen === "sym" ? (
          <Verdict tone="good">
            Fin de la course :{" "}
            {p1 === p2 && p1 === 12 ? (
              <>
                <M tex="p_1 = p_2 = c = 12" />, profits nuls. C'est l'équilibre de Bertrand-Nash :
                personne ne peut faire mieux en changeant seul son prix.
              </>
            ) : (
              <>
                plus personne ne peut sous-coter sans vendre à perte. Avec des prix continus, la
                logique pousse jusqu'à <M tex="p_1 = p_2 = c = 12" /> exactement.
              </>
            )}
          </Verdict>
        ) : (
          <Verdict tone="good">
            Fin de la course : la firme 1 (efficace) s'est arrêtée juste sous <M tex="c_2 = 12" />.
            Elle sert tout le marché et garde un profit positif ≈ (
            <M tex="c_2 - c_1" />) × ventes ; la firme 2 ne produit rien.
          </Verdict>
        )
      ) : p1 === p2 && p1 > Math.max(c1, c2) ? (
        <Verdict tone="mid">
          Prix égaux et supérieurs au coût marginal : chacun n'a que la moitié du marché… et une
          furieuse envie de baisser son prix d'un cheveu pour rafler l'autre moitié.
        </Verdict>
      ) : (
        <Verdict tone="bad">
          {p1 < p2 ? "La firme 2" : "La firme 1"} ne vend rien : sa seule option est de passer sous
          le prix du rival (tant que ça reste rentable). La sous-enchère continue…
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Collusion tacite : n < 1 + 1/r                                   */
/* ------------------------------------------------------------------ */

export function TacitCollusionExplorer() {
  const [n, setN] = useState(3);
  const [r, setR] = useState(0.1);

  const piM = 36; // profit de monopole illustratif (demande p = 12 − y, Cm = 0)
  const keep = (piM / n) * (1 + 1 / r);
  const dev = piM;
  const nMax = 1 + 1 / r;
  const holds = keep > dev;

  const W = 560;
  const H = 120;
  const x0 = 190;
  const x1 = 540;
  const maxV = Math.max(keep, dev) * 1.08;
  const BW = (v: number) => ((x1 - x0) * v) / maxV;

  return (
    <InteractiveCard
      title="La collusion tacite tient-elle ? Compare les deux profits actualisés"
      subtitle={
        <>
          Chaque firme suit la trigger strategy. Rester au prix de monopole rapporte{" "}
          <M tex="\tfrac{1}{n}\pi_m\left(1 + \tfrac{1}{r}\right)" /> ; dévier rapporte{" "}
          <M tex="\pi_m" /> une fois, puis plus rien. (Illustration avec <M tex="\pi_m = 36" />
          .)
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Nombre de firmes <M tex="n" />
              </>
            }
            value={n}
            onChange={setN}
            min={2}
            max={12}
            step={1}
          />
          <SliderControl
            label={
              <>
                Taux d'intérêt <M tex="r" />
              </>
            }
            value={r}
            onChange={setR}
            min={0.02}
            max={0.6}
            step={0.01}
            format={(v) => fr(v, 2)}
          />
        </>
      }
      footer={
        <>
          La collusion tacite tient si <M tex="n < 1 + \tfrac{1}{r}" /> (autrement dit{" "}
          <M tex="r < \tfrac{1}{n-1}" />) : <strong>peu de firmes</strong> (la part du gâteau de
          chacune est grosse) et <strong>un taux d'intérêt faible</strong> (le futur compte
          beaucoup). Monte <M tex="r" /> ou <M tex="n" /> et regarde la collusion s'effondrer.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              <M tex="\pi_i^{Mono}" /> (rester au prix de monopole) :
            </>
          }
          value={fr(keep, 1)}
          accent={COL.green}
        />
        <Readout
          label={
            <>
              <M tex="\pi_i^{D\acute{e}vie}" /> (sous-coter aujourd'hui) :
            </>
          }
          value={fr(dev, 1)}
          accent={COL.red}
        />
        <Readout label="Seuil : n doit rester sous" value={fr(nMax, 1)} accent={COL.purple} />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Comparaison du profit actualisé de la collusion et de la déviation"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        <text x={x0 - 8} y={38} textAnchor="end" fontSize={12} fill={COL.ink}>
          rester (collusion)
        </text>
        <rect
          x={x0}
          y={24}
          width={BW(keep)}
          height={22}
          rx={4}
          fill={holds ? "#10b981" : "#a7f3d0"}
        />
        <text x={x0 + BW(keep) + 6} y={40} fontSize={12} fontWeight={700} fill={COL.green}>
          {fr(keep, 0)}
        </text>
        <text x={x0 - 8} y={86} textAnchor="end" fontSize={12} fill={COL.ink}>
          dévier (sous-coter)
        </text>
        <rect
          x={x0}
          y={72}
          width={BW(dev)}
          height={22}
          rx={4}
          fill={holds ? "#fecdd3" : "#e11d48"}
        />
        <text x={x0 + BW(dev) + 6} y={88} fontSize={12} fontWeight={700} fill={COL.red}>
          {fr(dev, 0)}
        </text>
      </svg>

      {holds ? (
        <Verdict tone="good">
          <M tex={`n = ${n} < ${fr(nMax, 1).replace(",", "{,}")} = 1 + 1/r`} /> : rester au prix de
          monopole rapporte plus que dévier. La collusion tacite est soutenable — sans le moindre
          accord explicite, donc quasi impossible à sanctionner.
        </Verdict>
      ) : (
        <Verdict tone="bad">
          <M tex={`n = ${n} \\ge ${fr(nMax, 1).replace(",", "{,}")} = 1 + 1/r`} /> : le gâteau est
          trop partagé (ou le futur trop dévalorisé). Sous-coter une fois rapporte plus que la file
          infinie de petites parts : la collusion tacite s'effondre en concurrence à la Bertrand.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Bertrand avec biens différenciés                                 */
/* ------------------------------------------------------------------ */

export function DiffBertrandExplorer() {
  const [h, setH] = useState(2);

  const pStar = 12 / (2 + h);
  const qStar = 12 - pStar;
  const piStar = pStar * qStar;

  const W = 560;
  const H = 380;
  const pad = 46;
  const axMax = 8;
  const X = (v: number) => pad + (v / axMax) * (W - pad - 14);
  const Y = (v: number) => H - pad - (v / axMax) * (H - pad - 16);

  // réaction de 1 : p1 = (12 + h p2)/(2 + 2h) — tracée pour p2 ∈ [0, 8]
  const r1a = { x: 12 / (2 + 2 * h), y: 0 };
  const r1b = { x: (12 + 8 * h) / (2 + 2 * h), y: 8 };
  // réaction de 2 : p2 = (12 + h p1)/(2 + 2h) — tracée pour p1 ∈ [0, 8]
  const r2a = { x: 0, y: 12 / (2 + 2 * h) };
  const r2b = { x: 8, y: (12 + 8 * h) / (2 + 2 * h) };

  return (
    <InteractiveCard
      title="Différencier pour respirer : l'équilibre en prix avec biens différenciés"
      subtitle={
        <>
          Demandes croisées <M tex="q_1 = 12 - p_1 - h(p_1 - p_2)" /> (coût marginal nul). Le
          paramètre <M tex="h" /> mesure l'homogénéité : fais-le varier et regarde l'équilibre
          glisser.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Homogénéité <M tex="h" /> (0 = totalement différenciés)
            </>
          }
          value={h}
          onChange={setH}
          min={0}
          max={20}
          step={0.25}
          format={(v) => fr(v, 2)}
        />
      }
      footer={
        <>
          Deux choses à voir. (1) Les fonctions de réaction sont <strong>croissantes</strong> : si
          ton concurrent monte son prix, tu montes le tien (tout l'inverse de Cournot, où les
          meilleures réponses étaient décroissantes !). (2) L'équilibre{" "}
          <M tex="p_1^* = p_2^* = \tfrac{12}{2+h}" /> part de <strong>6</strong> (chacune est un
          petit monopole quand <M tex="h = 0" />) et fond vers <strong>0 = Cm</strong> quand les
          biens deviennent homogènes (<M tex="h \to \infty" />) : on retrouve le paradoxe de
          Bertrand. D'où l'intérêt vital de différencier ses produits.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              Prix d'équilibre <M tex="p^* = \tfrac{12}{2+h}" /> :
            </>
          }
          value={fr(pStar, 2)}
          accent={COL.purple}
        />
        <Readout label="Quantité par firme :" value={fr(qStar, 2)} />
        <Readout label="Profit par firme :" value={fr(piStar, 2)} accent={COL.green} />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Fonctions de réaction en prix croissantes et équilibre de Bertrand-Nash avec biens différenciés"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {[2, 4, 6, 8].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
            <text x={X(v)} y={H - pad + 16} textAnchor="middle" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={12} fill={COL.ink}>
          p₁
        </text>
        <text x={pad - 30} y={20} fontSize={12} fill={COL.ink}>
          p₂
        </text>

        {/* diagonale p1 = p2 */}
        <line
          x1={X(0)}
          y1={Y(0)}
          x2={X(8)}
          y2={Y(8)}
          stroke={COL.grid}
          strokeWidth={1.2}
          strokeDasharray="5 4"
        />

        {/* réactions */}
        <line
          x1={X(r1a.x)}
          y1={Y(r1a.y)}
          x2={X(r1b.x)}
          y2={Y(r1b.y)}
          stroke={COL.green}
          strokeWidth={2.6}
        />
        <text x={X(r1b.x) + 4} y={Y(7.6)} fontSize={11} fill={COL.green}>
          réaction de 1
        </text>
        <line
          x1={X(r2a.x)}
          y1={Y(r2a.y)}
          x2={X(r2b.x)}
          y2={Y(r2b.y)}
          stroke={COL.red}
          strokeWidth={2.6}
        />
        <text x={X(6.1)} y={Y(r2b.y) + (r2b.y > 7 ? 18 : -8)} fontSize={11} fill={COL.red}>
          réaction de 2
        </text>

        {/* repères : monopole (h = 0) et Bertrand homogène (h → ∞) */}
        <circle cx={X(6)} cy={Y(6)} r={4} fill="none" stroke={COL.label} strokeWidth={1.4} />
        <text x={X(6) + 8} y={Y(6) - 6} fontSize={10.5} fill={COL.label}>
          h = 0 : p = 6 (monopole)
        </text>
        <circle cx={X(0)} cy={Y(0)} r={4} fill="none" stroke={COL.label} strokeWidth={1.4} />
        <text x={X(0.15)} y={Y(0.55)} fontSize={10.5} fill={COL.label}>
          h → ∞ : p → 0 = Cm
        </text>

        {/* équilibre courant */}
        <circle cx={X(pStar)} cy={Y(pStar)} r={6.5} fill={COL.purple} />
        <text x={X(pStar) + 10} y={Y(pStar) - 8} fontSize={11.5} fontWeight={700} fill={COL.purple}>
          équilibre ({fr(pStar, 2)} ; {fr(pStar, 2)})
        </text>
      </svg>

      {h === 0 ? (
        <Verdict tone="good">
          <M tex="h = 0" /> : biens totalement différenciés. Chaque firme ignore l'autre et se
          comporte en monopole sur « son » marché : p = 6, profit 36. Le pouvoir de marché maximal.
        </Verdict>
      ) : h >= 12 ? (
        <Verdict tone="bad">
          Biens presque homogènes : la moindre différence de prix fait fuir les clients. Le prix
          d'équilibre ({fr(pStar, 2)}) s'écrase vers le coût marginal — presque le paradoxe de
          Bertrand.
        </Verdict>
      ) : (
        <Verdict tone="mid">
          Différenciation intermédiaire : chaque firme garde un matelas de clients fidèles, ce qui
          soutient un prix ({fr(pStar, 2)}) au-dessus du coût marginal — sans jamais revenir au
          confort du monopole (6).
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Checklist de maîtrise                                           */
/* ------------------------------------------------------------------ */

export function MasteryChecklist({ items }: { items: ReactNode[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="my-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Progression : {done.size} / {items.length}
        {done.size === items.length ? " 🎉" : ""}
      </div>
      <div className="grid gap-2">
        {items.map((it, i) => {
          const checked = done.has(i);
          return (
            <label
              key={i}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[15px] leading-relaxed transition-colors",
                checked ? "border-emerald-300 bg-emerald-50" : "bg-card hover:border-emerald-300",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(i)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>{it}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
