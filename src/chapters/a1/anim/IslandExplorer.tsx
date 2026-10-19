/*
 * IslandExplorer — l'île des slides 21-36 (S1, approche rationnelle).
 *
 * Deux types de travailleurs (hauts salaires H, bas salaires B) choisissent
 * leur loisir l face à une taxe t dont la recette est redistribuée à parts
 * égales (M(t), slide 22). Tout est calculé avec les vraies fonctions :
 *   l*(t) = min(1 ; a / (s(1−t)))            (slide 25, avec la solution en coin)
 *   M(t)  = t/2 · (s_H(1−l*_H) + s_B(1−l*_B)) (slides 22 et 28)
 *   c*(t) = s(1−t)(1−l*) + M(t)               (slide 30)
 *   U(t)  = c* + a·ln l*                       (slide 31)
 * Paramètres illustratifs fixés pour toute l'app : s_H = 5, s_B = 3, a = 0,5, L = 1
 * (choisis pour reproduire les figures des slides 32-36, tout le monde travaillant
 * encore à t₂ = 0,8). Contrôles (Python) : t = 0 → U_H ≈ 3,349, U_B ≈ 1,604 ;
 * t₁ = 0,3 → M ≈ 0,986, U_H ≈ 3,013, U_B ≈ 1,868 ; t₂ = 0,8 → M = 1,2,
 * U_H ≈ 1,353, U_B ≈ 1,209.
 *
 * Vue 1 : une taxe à la fois (slides 32-34). Vue 2 : les 6 courbes de la slide 36.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import { C, Dot, Label, Legend, PlotSvg, fmt, makePlot, type Plot } from "@/chapters/shared/plot";

/* ------------------------------------------------------------------ */
/* Modèle de l'île                                                     */
/* ------------------------------------------------------------------ */

const SH = 5;
const SB = 3;
const A = 0.5;
const T1 = 0.3;
const T2 = 0.8;
const T_MAX = 0.85;
/** sommet de la courbe de Laffer : t*_M = 1 − √(1/8) ≈ 0,646 */
const T_M = 1 - Math.sqrt(1 / 8);
/** au-delà, les bas salaires ne travaillent plus (l*_B = 1) : 1 − a/s_B = 5/6 */
const T_CORNER_B = 1 - A / SB;

const RED_H = "#be123c";
const RED_B = "#f43f5e";

function leisure(s: number, t: number): number {
  return Math.min(1, A / (s * (1 - t)));
}

function transfer(t: number): number {
  return (t / 2) * (SH * (1 - leisure(SH, t)) + SB * (1 - leisure(SB, t)));
}

interface Alloc {
  net: number;
  l: number;
  c: number;
  U: number;
  corner: boolean;
}

function alloc(s: number, t: number): Alloc {
  const l = leisure(s, t);
  const net = s * (1 - t);
  const c = net * (1 - l) + transfer(t);
  return { net, l, c, U: c + A * Math.log(l), corner: l >= 1 - 1e-9 };
}

/* ------------------------------------------------------------------ */
/* Petits outils                                                       */
/* ------------------------------------------------------------------ */

/** Valeur animée en douceur (respecte « réduire les animations »). */
function useTween(initial: number) {
  const [v, setV] = useState(initial);
  const vRef = useRef(initial);
  const raf = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );
  const set = (x: number) => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    vRef.current = x;
    setV(x);
  };
  const animateTo = (target: number) => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = vRef.current;
    if (reduce || Math.abs(target - from) < 1e-6) {
      set(target);
      return;
    }
    const start = performance.now();
    const dur = 700;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const x = from + (target - from) * e;
      vRef.current = x;
      setV(x);
      raf.current = k < 1 ? requestAnimationFrame(step) : null;
    };
    raf.current = requestAnimationFrame(step);
  };
  return [v, set, animateTo] as const;
}

/** Vrai sur petit écran : le graphique passe alors sur un repère plus étroit (textes plus grands). */
function useNarrow(bp = 560): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [bp]);
  return narrow;
}

/** Symbole en SVG : base italique, exposant et/ou indice (ex. c*_H). */
function Sym({
  base,
  sup,
  sub,
  rest,
  size = 13,
}: {
  base: string;
  sup?: string;
  sub?: string;
  rest?: ReactNode;
  size?: number;
}) {
  const small = Math.round(size * 0.76);
  return (
    <>
      <tspan fontStyle="italic">{base}</tspan>
      {sup ? (
        <tspan dy={-0.42 * size} fontSize={small}>
          {sup}
        </tspan>
      ) : null}
      {sub ? (
        <tspan dy={sup ? 0.7 * size : 0.28 * size} dx={sup ? -0.34 * size : 0} fontSize={small}>
          {sub}
        </tspan>
      ) : null}
      {sup || sub ? <tspan dy={sub ? -0.28 * size : 0.42 * size}>{rest ?? "​"}</tspan> : rest}
    </>
  );
}

/** Écarte des étiquettes trop proches (en pixels), en gardant chaque groupe centré. */
function spread(vals: number[], gap: number, lo: number, hi: number): number[] {
  const order = vals.map((_, i) => i).sort((i, j) => vals[i] - vals[j]);
  const groups = order.map((i) => ({ ids: [i], center: vals[i] }));
  let merged = true;
  while (merged) {
    merged = false;
    for (let g = 0; g + 1 < groups.length; g++) {
      const ga = groups[g];
      const gb = groups[g + 1];
      const aEnd = ga.center + ((ga.ids.length - 1) * gap) / 2;
      const bStart = gb.center - ((gb.ids.length - 1) * gap) / 2;
      if (bStart - aEnd < gap) {
        const ids = [...ga.ids, ...gb.ids];
        const center = ids.reduce((s, i) => s + vals[i], 0) / ids.length;
        groups.splice(g, 2, { ids, center });
        merged = true;
        break;
      }
    }
  }
  const out = vals.slice();
  for (const g of groups) {
    const len = (g.ids.length - 1) * gap;
    const start = Math.max(lo, Math.min(g.center - len / 2, hi - len));
    g.ids.forEach((i, k) => (out[i] = start + k * gap));
  }
  return out;
}

/** Points (en pixels) d'une courbe d'indifférence c = U − a·ln l, échantillonnée en échelle log. */
function indiffPts(p: Plot, U: number, lMax: number, n = 120): Array<[number, number]> {
  const lMin = Math.max(0.004, Math.exp((U - p.y1) / A));
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const l = lMin * Math.pow(lMax / lMin, i / n);
    const c = Math.min(p.y1, U - A * Math.log(l));
    pts.push([p.X(l), p.Y(c)]);
  }
  return pts;
}

function ptsPath(pts: Array<[number, number]>): string {
  return pts.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join("");
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function distToRect(x: number, y: number, r: Rect): number {
  const dx = Math.max(r.x0 - x, 0, x - r.x1);
  const dy = Math.max(r.y0 - y, 0, y - r.y1);
  return Math.hypot(dx, dy);
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/**
 * Cherche, le long d'une droite de budget, l'endroit où son étiquette gêne le
 * moins (loin des courbes, des points et de l'autre étiquette).
 */
function placeLineLabel(
  p: Plot,
  line: (l: number) => number,
  obstacles: Array<[number, number]>,
  guides: Array<[number, number]>,
  avoid: Rect[],
  width: number,
  prefer: "above" | "below",
): { x: number; y: number; anchor: "start" | "end"; rect: Rect } {
  let best: { x: number; y: number; anchor: "start" | "end"; rect: Rect } | null = null;
  let bestScore = -Infinity;
  for (let l = 0.16; l <= 0.96; l += 0.02) {
    const X0 = p.X(l);
    const Y0 = p.Y(line(l));
    for (const orient of ["above", "below"] as const) {
      const rect: Rect =
        orient === "above"
          ? { x0: X0 + 3, x1: X0 + 3 + width, y0: Y0 - 21, y1: Y0 - 5 }
          : { x0: X0 - 3 - width, x1: X0 - 3, y0: Y0 + 5, y1: Y0 + 21 };
      if (rect.x0 < p.pL + 4 || rect.x1 > p.w - p.pR || rect.y0 < p.pT || rect.y1 > p.h - p.pB - 2) continue;
      if (avoid.some((r) => rectsOverlap(r, rect))) continue;
      let dObs = 40;
      for (const [x, y] of obstacles) dObs = Math.min(dObs, distToRect(x, y, rect));
      let dGuide = 8;
      for (const [x, y] of guides) dGuide = Math.min(dGuide, distToRect(x, y, rect));
      const score =
        Math.min(dObs, 16) + 0.25 * dGuide + (orient === prefer ? 2.5 : 0) - 1.5 * Math.abs(l - 0.6);
      if (score > bestScore) {
        bestScore = score;
        best = {
          x: orient === "above" ? X0 + 3 : X0 - 3,
          y: orient === "above" ? Y0 - 9 : Y0 + 17,
          anchor: orient === "above" ? "start" : "end",
          rect,
        };
      }
    }
  }
  if (best) return best;
  const X0 = p.X(0.6);
  const Y0 = p.Y(line(0.6));
  return { x: X0 + 3, y: Y0 - 9, anchor: "start", rect: { x0: X0, x1: X0 + width, y0: Y0 - 21, y1: Y0 - 5 } };
}

function linePts(p: Plot, f: (l: number) => number, a: number, b: number, n = 30): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const l = a + ((b - a) * i) / n;
    pts.push([p.X(l), p.Y(f(l))]);
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Vue 1 : une taxe à la fois (slides 32-34)                           */
/* ------------------------------------------------------------------ */

const P1 = makePlot({ w: 520, h: 350, pL: 58, pR: 14, pT: 24, pB: 40, x: [0, 1.16], y: [0, 5.4] });
const P1N = makePlot({ w: 400, h: 330, pL: 52, pR: 8, pT: 24, pB: 40, x: [0, 1.16], y: [0, 5.4] });

function OneTaxView({ t, presetNote, narrow }: { t: number; presetNote: ReactNode; narrow: boolean }) {
  const p = narrow ? P1N : P1;
  const H = alloc(SH, t);
  const B = alloc(SB, t);
  const Mt = transfer(t);
  const lineH = (l: number) => Mt + H.net * (1 - l);
  const lineB = (l: number) => Mt + B.net * (1 - l);
  const lMax = 1.09;
  const curveH = indiffPts(p, H.U, lMax);
  const curveB = indiffPts(p, B.U, lMax);
  const axisY = p.h - p.pB;

  // étiquettes des pentes, posées là où elles gênent le moins
  const dots: Array<[number, number]> = [
    [p.X(H.l), p.Y(H.c)],
    [p.X(B.l), p.Y(B.c)],
    [p.X(1), p.Y(Mt)],
  ];
  const guides: Array<[number, number]> = [
    ...linePts(p, () => H.c, 0, H.l, 12),
    ...linePts(p, () => B.c, 0, B.l, 12),
    ...linePts(p, () => Mt, 0, 1, 20),
  ];
  const labW = 66;
  const labH = placeLineLabel(
    p,
    lineH,
    [...curveH, ...curveB, ...linePts(p, lineB, 0, 1), ...dots],
    guides,
    [],
    labW,
    "above",
  );
  const labB = placeLineLabel(
    p,
    lineB,
    [...curveH, ...curveB, ...linePts(p, lineH, 0, 1), ...dots],
    guides,
    [labH.rect],
    labW,
    "below",
  );

  // étiquettes de l'axe vertical (c*_H, c*_B, M(t)) écartées si trop proches
  const yLab = spread([p.Y(H.c), p.Y(B.c), p.Y(Mt)], 22, p.pT + 6, axisY + 4);
  // étiquettes de l'axe horizontal
  const hideOne = p.X(1) - p.X(B.l) < 26;
  const xLab = spread([p.X(H.l), p.X(B.l)], 30, p.X(0) + 22, hideOne ? p.X(1) : p.X(1) - 26);

  const ghost = t > 0.005;

  return (
    <PlotSvg
      p={p}
      label={`Allocation sur l'île pour un taux de taxe t = ${fmt(t, 2)} : droites de budget des hauts et bas salaires, courbes d'indifférence tangentes et point de dotation ω = (1, M(t)).`}
    >
      {/* droites de budget à t = 0 (repère fantôme) */}
      {ghost ? (
        <g opacity={0.4}>
          <line x1={p.X(0)} y1={p.Y(SH)} x2={p.X(1)} y2={p.Y(0)} stroke={RED_H} strokeWidth={1.4} strokeDasharray="5 5" />
          <line x1={p.X(0)} y1={p.Y(SB)} x2={p.X(1)} y2={p.Y(0)} stroke={RED_B} strokeWidth={1.4} strokeDasharray="5 5" />
        </g>
      ) : null}

      {/* contrainte de temps l ≤ L = 1 */}
      <line x1={p.X(1)} y1={axisY} x2={p.X(1)} y2={p.Y(4.5)} stroke={C.guide} strokeWidth={1.2} />

      {/* repères pointillés */}
      <line x1={p.pL} y1={p.Y(Mt)} x2={p.X(1)} y2={p.Y(Mt)} stroke={C.guide} strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={p.pL} y1={p.Y(H.c)} x2={p.X(H.l)} y2={p.Y(H.c)} stroke={C.blue} strokeOpacity={0.55} strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={p.X(H.l)} y1={p.Y(H.c)} x2={p.X(H.l)} y2={axisY} stroke={C.blue} strokeOpacity={0.55} strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={p.pL} y1={p.Y(B.c)} x2={p.X(B.l)} y2={p.Y(B.c)} stroke={C.green} strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={p.X(B.l)} y1={p.Y(B.c)} x2={p.X(B.l)} y2={axisY} stroke={C.green} strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="4 4" />

      {/* courbes d'indifférence c = U − a ln l */}
      <path d={ptsPath(curveH)} fill="none" stroke={C.blue} strokeWidth={2.4} />
      <path d={ptsPath(curveB)} fill="none" stroke={C.green} strokeWidth={2.4} />

      {/* droites de budget c = M(t) + s(1−t)(1 − l) */}
      <line x1={p.X(0)} y1={p.Y(lineH(0))} x2={p.X(1)} y2={p.Y(Mt)} stroke={RED_H} strokeWidth={2.6} />
      <line x1={p.X(0)} y1={p.Y(lineB(0))} x2={p.X(1)} y2={p.Y(Mt)} stroke={RED_B} strokeWidth={2.6} />

      {/* axes */}
      <line x1={p.pL} y1={axisY} x2={p.w - p.pR} y2={axisY} stroke={C.soft} strokeWidth={1.4} />
      <line x1={p.pL} y1={axisY} x2={p.pL} y2={p.pT - 6} stroke={C.soft} strokeWidth={1.4} />
      <text x={p.w - p.pR} y={axisY - 7} textAnchor="end" fontSize={15} fontStyle="italic" fill={C.soft}>
        l
      </text>
      <text x={p.pL + 7} y={p.pT - 6} fontSize={15} fontStyle="italic" fill={C.soft}>
        c
      </text>
      <line x1={p.X(1)} y1={axisY} x2={p.X(1)} y2={axisY + 5} stroke={C.soft} strokeWidth={1.2} />
      <text x={p.X(0)} y={axisY + 18} textAnchor="middle" fontSize={12.5} fill={C.soft}>
        0
      </text>
      {!hideOne ? (
        <text x={p.X(1)} y={axisY + 18} textAnchor="middle" fontSize={12.5} fill={C.soft}>
          1
        </text>
      ) : null}

      {/* l*_H et l*_B sous l'axe */}
      <text x={xLab[0]} y={axisY + 19} textAnchor="middle" fontSize={14.5} fontWeight={600} fill={C.blue}>
        <Sym base="l" sup="*" sub="H" size={14.5} />
      </text>
      <text x={xLab[1]} y={axisY + 19} textAnchor="middle" fontSize={14.5} fontWeight={600} fill={C.green}>
        <Sym base="l" sup="*" sub="B" size={14.5} rest={B.corner ? " = 1" : undefined} />
      </text>

      {/* c*_H, c*_B, M(t) à gauche de l'axe */}
      <text x={p.pL - 7} y={yLab[0] + 4} textAnchor="end" fontSize={14.5} fontWeight={600} fill={C.blue}>
        <Sym base="c" sup="*" sub="H" size={14.5} />
      </text>
      <text x={p.pL - 7} y={yLab[1] + 4} textAnchor="end" fontSize={14.5} fontWeight={600} fill={C.green}>
        <Sym base="c" sup="*" sub="B" size={14.5} />
      </text>
      <text x={p.pL - 7} y={yLab[2] + 4} textAnchor="end" fontSize={14.5} fontWeight={600} fill={C.ink}>
        <tspan fontStyle="italic">M</tspan>(<tspan fontStyle="italic">t</tspan>)
      </text>

      {/* étiquettes des pentes */}
      <text
        x={labH.x}
        y={labH.y}
        textAnchor={labH.anchor}
        fontSize={14}
        fontWeight={600}
        fill={RED_H}
        stroke="#fff"
        strokeWidth={3.5}
        paintOrder="stroke"
      >
        −<Sym base="s" sub="H" size={14} rest="(1−t)" />
      </text>
      <text
        x={labB.x}
        y={labB.y}
        textAnchor={labB.anchor}
        fontSize={14}
        fontWeight={600}
        fill={RED_B}
        stroke="#fff"
        strokeWidth={3.5}
        paintOrder="stroke"
      >
        −<Sym base="s" sub="B" size={14} rest="(1−t)" />
      </text>

      {/* points : optimum de chaque groupe et dotation ω */}
      <Dot p={p} x={H.l} y={H.c} fill={C.blue} r={5.5} />
      <Dot p={p} x={B.l} y={B.c} fill={C.green} r={5.5} />
      <Dot p={p} x={1} y={Mt} fill={C.ink} r={6} />
      <Label p={p} x={1} y={Mt} dx={9} dy={Mt < 0.4 ? -8 : 19} size={16} color={C.ink}>
        ω
      </Label>

      {/* titre façon slide */}
      <Label p={p} x={1.15} y={5.2} anchor="end" dx={0} dy={0} size={15} color={C.ink}>
        Allocation pour t = {fmt(t, 2)}
      </Label>
      {presetNote ? (
        <Label p={p} x={1.15} y={5.2} anchor="end" dx={0} dy={19} size={13} weight={500} color={C.soft}>
          {presetNote}
        </Label>
      ) : null}
    </PlotSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Vue 2 : les 6 courbes de la slide 36                                */
/* ------------------------------------------------------------------ */

const P2 = makePlot({ w: 520, h: 350, pL: 34, pR: 134, pT: 24, pB: 34, x: [0, 1.05], y: [0, 5.4] });
const P2N = makePlot({ w: 400, h: 340, pL: 26, pR: 132, pT: 24, pB: 34, x: [0, 1.05], y: [0, 5.4] });

const SIX_T = [
  { key: "0", t: 0, color: C.gold, name: "0" },
  { key: "1", t: T1, color: C.violet, name: "t₁" },
  { key: "2", t: T2, color: C.sky, name: "t₂" },
] as const;

type Reveal = "1" | "2" | "3";

interface SixCurve {
  id: string;
  group: "H" | "B";
  tName: string;
  color: string;
  a: Alloc;
}

function sixCurves(reveal: Reveal): SixCurve[] {
  const n = Number(reveal);
  const out: SixCurve[] = [];
  SIX_T.slice(0, n).forEach((k) => {
    out.push({ id: `H${k.key}`, group: "H", tName: k.name, color: k.color, a: alloc(SH, k.t) });
    out.push({ id: `B${k.key}`, group: "B", tName: k.name, color: k.color, a: alloc(SB, k.t) });
  });
  return out;
}

function SixView({ reveal, narrow }: { reveal: Reveal; narrow: boolean }) {
  const p = narrow ? P2N : P2;
  const curves = sixCurves(reveal);
  const lMax = 1.05;
  const axisY = p.h - p.pB;
  const ends = curves.map((k) => p.Y(k.a.U - A * Math.log(lMax)));
  const labY = spread(ends, 17, p.pT + 4, axisY - 4);
  const xEnd = p.X(lMax);

  return (
    <PlotSvg
      p={p}
      label="Les six courbes d'indifférence de la slide 36 : utilités des hauts et des bas salaires pour t = 0, t₁ = 0,3 et t₂ = 0,8."
    >
      <line x1={p.X(1)} y1={axisY} x2={p.X(1)} y2={axisY + 5} stroke={C.soft} strokeWidth={1.2} />
      {curves.map((k) => (
        <path
          key={k.id}
          d={ptsPath(indiffPts(p, k.a.U, lMax))}
          fill="none"
          stroke={k.color}
          strokeWidth={2.4}
          strokeDasharray={k.group === "B" ? "7 4" : undefined}
        />
      ))}
      {curves.map((k) => (
        <Dot key={`d${k.id}`} p={p} x={k.a.l} y={k.a.c} fill={k.color} r={5} />
      ))}
      {curves.map((k, i) => (
        <g key={`l${k.id}`}>
          <polyline
            points={`${xEnd + 1},${ends[i]} ${xEnd + 7},${labY[i]} ${xEnd + 10},${labY[i]}`}
            fill="none"
            stroke={k.color}
            strokeWidth={1}
          />
          <text x={xEnd + 12} y={labY[i] + 4.5} fontSize={13} fontWeight={600} fill={k.color}>
            <Sym base="U" sub={k.group} size={13} rest={`(${k.tName}) = ${fmt(k.a.U, 3)}`} />
          </text>
        </g>
      ))}
      <line x1={p.pL} y1={axisY} x2={xEnd + 4} y2={axisY} stroke={C.soft} strokeWidth={1.4} />
      <line x1={p.pL} y1={axisY} x2={p.pL} y2={p.pT - 6} stroke={C.soft} strokeWidth={1.4} />
      <text x={p.X(0)} y={axisY + 18} textAnchor="middle" fontSize={12.5} fill={C.soft}>
        0
      </text>
      <text x={p.X(1)} y={axisY + 18} textAnchor="middle" fontSize={12.5} fill={C.soft}>
        1
      </text>
      <text x={xEnd + 9} y={axisY + 5} fontSize={15} fontStyle="italic" fill={C.soft}>
        l
      </text>
      <text x={p.pL + 7} y={p.pT - 6} fontSize={15} fontStyle="italic" fill={C.soft}>
        c
      </text>
    </PlotSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Lecture des valeurs                                                 */
/* ------------------------------------------------------------------ */

function Row({ k, v }: { k: ReactNode; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-1.5">
      <span className="whitespace-nowrap text-muted-foreground">{k}</span>
      <span className="font-semibold tabular-nums text-foreground">{v}</span>
    </div>
  );
}

function GroupCard({ g, a, color }: { g: "H" | "B"; a: Alloc; color: string }) {
  return (
    <div className="min-w-0 rounded-lg border bg-background px-2 py-1.5 sm:px-3" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="mb-1 font-bold leading-tight" style={{ color }}>
        {g === "H" ? "Hauts salaires (H)" : "Bas salaires (B)"}
      </div>
      <Row k={<M tex={`s_${g}(1-t)`} />} v={fmt(a.net, 3)} />
      <Row k={<M tex={`l^*_${g}`} />} v={fmt(a.l, 3)} />
      <Row k={<M tex={`c^*_${g}`} />} v={fmt(a.c, 3)} />
      <Row k={<M tex={`U_${g}`} />} v={fmt(a.U, 3)} />
    </div>
  );
}

function OneTaxReadout({ t }: { t: number }) {
  const H = alloc(SH, t);
  const B = alloc(SB, t);
  const H0 = alloc(SH, 0);
  const B0 = alloc(SB, 0);
  const Mt = transfer(t);
  const dH = H.U - H0.U;
  const dB = B.U - B0.U;
  const verb = (d: number) => (d >= 0 ? "gagnent" : "perdent");
  return (
    <div className="mt-3 space-y-2 text-[12px] sm:text-[13px]">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <GroupCard g="H" a={H} color={C.blue} />
        <GroupCard g="B" a={B} color={C.green} />
        <div className="min-w-0 rounded-lg border bg-background px-2 py-1.5 sm:px-3" style={{ borderLeft: `4px solid ${C.ink}` }}>
          <div className="mb-1 font-bold leading-tight">Transfert</div>
          <Row k={<M tex="M(t)" />} v={fmt(Mt, 3)} />
          <Row k={<M tex="t^*_M" />} v={`≈ ${fmt(T_M, 3)}`} />
          <div className="mt-1 leading-snug text-muted-foreground">
            {t < 0.005 ? (
              "Pas de taxe : personne ne reçoit rien."
            ) : t < T_M - 0.0005 ? (
              <>
                <M tex="t < t^*_M" /> : monter <M tex="t" /> fait encore grimper <M tex="M" />.
              </>
            ) : t <= T_M + 0.0005 ? (
              <>
                <M tex="t = t^*_M" /> : <M tex="M" /> est au maximum.
              </>
            ) : (
              <>
                <M tex="t > t^*_M" /> : la recette <M tex="M" /> baisse déjà.
              </>
            )}
          </div>
        </div>
      </div>
      <p className="leading-snug text-muted-foreground">
        {t < 0.005 ? (
          <>
            Point de départ (slide 32) : sans taxe, <M tex="M(0) = 0" /> et ω est sur l'axe. Chacun ne vit que
            de son salaire.
          </>
        ) : (
          <>
            Par rapport à <M tex="t = 0" /> : les hauts salaires{" "}
            <strong style={{ color: C.blue }}>
              {verb(dH)} {fmt(Math.abs(dH), 3)}
            </strong>{" "}
            d'utilité, les bas salaires{" "}
            <strong style={{ color: C.green }}>
              {verb(dB)} {fmt(Math.abs(dB), 3)}
            </strong>
            .
          </>
        )}
        {B.corner ? (
          <>
            {" "}
            Au-delà de <M tex="t = 1 - a/s_B \approx 0{,}833" />, les bas salaires ne travaillent plus du tout :{" "}
            <M tex="l^*_B = 1" /> (solution en coin, la formule <M tex="a/(s_B(1-t))" /> dépasserait 1). Leur
            allocation est alors ω lui-même (<M tex="c^*_B = M(t)" />) : leur courbe d'indifférence passe par ω sans
            être tangente à la droite.
          </>
        ) : null}
      </p>
    </div>
  );
}

function SixReadout({ reveal }: { reveal: Reveal }) {
  const curves = sixCurves(reveal)
    .slice()
    .sort((x, y) => y.a.U - x.a.U);
  return (
    <div className="mt-3 space-y-2 text-[13px]">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
        <span className="mr-1 font-semibold">Classement :</span>
        {curves.map((k, i) => (
          <span key={k.id} className="inline-flex items-center gap-1">
            {i > 0 ? <span className="text-muted-foreground">&gt;</span> : null}
            <span
              className="rounded-md border px-1.5 py-0.5 tabular-nums"
              style={{ borderColor: k.color, color: k.color, borderStyle: k.group === "B" ? "dashed" : "solid" }}
            >
              <M tex={`U_${k.group}(${k.tName === "0" ? "0" : k.tName === "t₁" ? "t_1" : "t_2"})`} /> ={" "}
              {fmt(k.a.U, 3)}
            </span>
          </span>
        ))}
      </div>
      <ul className="list-disc space-y-1 pl-5 leading-snug text-muted-foreground">
        <li>Plus une courbe est haute, plus l'utilité est grande : on lit le classement de haut en bas.</li>
        {reveal !== "1" ? (
          <li>
            De <M tex="t = 0" /> à <M tex="t_1 = 0{,}3" /> : les hauts salaires perdent (3,349 → 3,013), les bas
            salaires gagnent (1,604 → 1,868) : la redistribution les aide.
          </li>
        ) : (
          <li>
            Sans taxe, les hauts salaires sont bien mieux lotis (3,349 contre 1,604) : leur salaire est plus élevé.
          </li>
        )}
        {reveal === "3" ? (
          <li>
            De <M tex="t_1" /> à <M tex="t_2 = 0{,}8" /> : les <strong>deux</strong> groupes perdent. À{" "}
            <M tex="t_2" />, même les bas salaires sont moins bien qu'à <M tex="t = 0" /> (1,209 &lt; 1,604) : la
            taxe est devenue trop forte.
          </li>
        ) : null}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

type View = "one" | "six";
type Preset = "p0" | "p1" | "p2" | "none";

const PRESETS: Array<{ value: Exclude<Preset, "none">; t: number; label: ReactNode; note: ReactNode }> = [
  { value: "p0", t: 0, label: <>t = 0 (slide 32)</>, note: "(slide 32)" },
  {
    value: "p1",
    t: T1,
    label: (
      <>
        <M tex="t_1 = 0{,}3 < t^*_M" /> (slide 33)
      </>
    ),
    note: (
      <>
        0 &lt; t₁ &lt; <Sym base="t" sup="*" sub="M" size={13} /> (slide 33)
      </>
    ),
  },
  {
    value: "p2",
    t: T2,
    label: (
      <>
        <M tex="t_2 = 0{,}8 > t^*_M" /> (slide 34)
      </>
    ),
    note: (
      <>
        <Sym base="t" sup="*" sub="M" size={13} /> &lt; t₂ (slide 34)
      </>
    ),
  },
];

export function IslandExplorer() {
  const [view, setView] = useState<View>("one");
  const [reveal, setReveal] = useState<Reveal>("3");
  const [t, setT, animateT] = useTween(0);
  const narrow = useNarrow();

  const active = PRESETS.find((pr) => Math.abs(pr.t - t) < 0.0005);
  const presetValue: Preset = active ? active.value : "none";

  return (
    <InteractiveCard
      title="L'île : l'allocation de chaque groupe selon la taxe"
      subtitle={
        <>
          Chiffres illustratifs : <M tex="s_H = 5" />, <M tex="s_B = 3" />, <M tex="a = 0{,}5" />,{" "}
          <M tex="L = 1" />. Chacun choisit son loisir <M tex="l" /> sur sa droite de budget{" "}
          <M tex="c = M(t) + s(1-t)(1-l)" />, qui part du point de dotation <M tex="\omega = (1, M(t))" />.
        </>
      }
      controls={
        <>
          <ChoiceChips<View>
            label="Vue"
            value={view}
            onChange={setView}
            options={[
              { value: "one", label: "Une taxe à la fois (slides 32-34)" },
              { value: "six", label: "Les 6 courbes (slide 36)" },
            ]}
          />
          {view === "one" ? (
            <>
              <SliderControl
                label={
                  <>
                    Taux de taxe <M tex="t" />
                  </>
                }
                value={t}
                onChange={setT}
                min={0}
                max={T_MAX}
                step={0.01}
                format={(v) => fmt(v, 2)}
              />
              <ChoiceChips<Preset>
                label="Les trois taxes des slides"
                value={presetValue}
                onChange={(v) => {
                  const pr = PRESETS.find((x) => x.value === v);
                  if (pr) animateT(pr.t);
                }}
                options={PRESETS.map((pr) => ({ value: pr.value, label: pr.label }))}
              />
            </>
          ) : (
            <ChoiceChips<Reveal>
              label="Courbes affichées"
              value={reveal}
              onChange={setReveal}
              options={[
                { value: "1", label: "t = 0" },
                {
                  value: "2",
                  label: (
                    <>
                      + <M tex="t_1 = 0{,}3" />
                    </>
                  ),
                },
                {
                  value: "3",
                  label: (
                    <>
                      + <M tex="t_2 = 0{,}8" /> (slide 36)
                    </>
                  ),
                },
              ]}
            />
          )}
        </>
      }
      footer={
        view === "one" ? (
          <>
            quand <M tex="t" /> monte, les deux droites rouges <strong>s'aplatissent</strong> (le salaire net{" "}
            <M tex="s(1-t)" /> baisse) et le point <strong>ω monte</strong> : c'est la redistribution{" "}
            <M tex="M(t)" /> (ω redescend après <M tex="t^*_M \approx 0{,}646" />, quand la recette baisse). Le loisir <M tex="l^* = a/(s(1-t))" /> ne dépend que de la pente, pas de{" "}
            <M tex="M(t)" />. Les bas salaires <strong>gagnent d'abord</strong> (<M tex="t_1" />) puis{" "}
            <strong>perdent</strong> quand la taxe devient trop forte (<M tex="t_2" />) ; les hauts salaires
            perdent dès le départ.
          </>
        ) : (
          <>
            chaque courbe passe par l'allocation choisie (le point) et représente un niveau d'utilité. Les bas
            salaires préfèrent <M tex="t_1" /> à <M tex="t = 0" />, mais <M tex="t_2" /> est pire pour{" "}
            <strong>tout le monde</strong> que <M tex="t_1" /> : c'est le point de départ de l'analyse de Pareto
            (slides 37-39).
          </>
        )
      }
    >
      {view === "one" ? (
        <>
          <OneTaxView t={t} narrow={narrow} presetNote={active && active.value !== "p0" ? active.note : null} />
          <Legend
            items={[
              { color: C.blue, label: "indifférence H" },
              { color: C.green, label: "indifférence B" },
              { color: RED_H, label: "budget H" },
              { color: RED_B, label: "budget B" },
              { color: "#fda4af", label: "budgets à t = 0", dashed: true },
            ]}
          />
          <OneTaxReadout t={t} />
        </>
      ) : (
        <>
          <SixView reveal={reveal} narrow={narrow} />
          <Legend
            items={[
              { color: C.gold, label: "t = 0" },
              { color: C.violet, label: "t₁ = 0,3" },
              { color: C.sky, label: "t₂ = 0,8" },
              { color: C.soft, label: "hauts salaires (H)" },
              { color: C.soft, label: "bas salaires (B)", dashed: true },
            ]}
          />
          <SixReadout reveal={reveal} />
        </>
      )}
    </InteractiveCard>
  );
}
