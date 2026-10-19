/**
 * Boîte à outils de tracé SVG partagée par les chapitres de la Partie A.
 *
 * Reprend les conventions des widgets d'A3 (repère `makePlot`, axes `Frame`,
 * courbes échantillonnées `curvePath`) pour que toutes les animations du
 * site aient la même allure : mêmes couleurs, mêmes graduations, même
 * typographie. Tout est en coordonnées « économiques » : on donne des
 * valeurs (loisir, consommation, taxe…) et le repère les convertit en pixels.
 */
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export const C = {
  ink: "var(--color-foreground)",
  soft: "#71717a",
  guide: "#a1a1aa",
  green: "#059669",
  red: "#e11d48",
  blue: "#4f46e5",
  sky: "#0284c7",
  gold: "#d97706",
  violet: "#7c3aed",
  teal: "#0d9488",
} as const;

/* ------------------------------------------------------------------ */
/* Nombres au format français                                          */
/* ------------------------------------------------------------------ */

/** Nombre au format français : décimales utiles, virgule. */
export function fmt(v: number, d = 2): string {
  if (!Number.isFinite(v)) return "—";
  let s = v.toFixed(d);
  if (d > 0) s = s.replace(/\.?0+$/, "");
  return s.replace(".", ",").replace(/^-/, "−");
}

/** Pourcentage arrondi : 0.256 → « 26 % ». */
export function pct(v: number, d = 0): string {
  return `${fmt(v * 100, d)} %`;
}

/* ------------------------------------------------------------------ */
/* Repère                                                              */
/* ------------------------------------------------------------------ */

export interface PlotCfg {
  w?: number;
  h?: number;
  pL?: number;
  pR?: number;
  pT?: number;
  pB?: number;
  x: [number, number];
  y: [number, number];
}

export interface Plot {
  w: number;
  h: number;
  pL: number;
  pR: number;
  pT: number;
  pB: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** valeur → abscisse en pixels */
  X: (v: number) => number;
  /** valeur → ordonnée en pixels */
  Y: (v: number) => number;
}

export function makePlot(cfg: PlotCfg): Plot {
  const w = cfg.w ?? 520;
  const h = cfg.h ?? 330;
  const pL = cfg.pL ?? 52;
  const pR = cfg.pR ?? 16;
  const pT = cfg.pT ?? 22;
  const pB = cfg.pB ?? 42;
  const [x0, x1] = cfg.x;
  const [y0, y1] = cfg.y;
  return {
    w,
    h,
    pL,
    pR,
    pT,
    pB,
    x0,
    x1,
    y0,
    y1,
    X: (v) => pL + ((v - x0) / (x1 - x0)) * (w - pL - pR),
    Y: (v) => h - pB - ((v - y0) / (y1 - y0)) * (h - pT - pB),
  };
}

/**
 * Chemin SVG d'une fonction y = f(x) échantillonnée sur [a, b]. Les points
 * hors du cadre vertical sont écrêtés (la courbe s'arrête au bord du repère
 * au lieu de déborder).
 */
export function curvePath(p: Plot, f: (x: number) => number, a: number, b: number, n = 180): string {
  let d = "";
  let pen = false;
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y) || y < p.y0 - (p.y1 - p.y0) * 0.02 || y > p.y1 + (p.y1 - p.y0) * 0.02) {
      pen = false;
      continue;
    }
    const yc = Math.min(p.y1, Math.max(p.y0, y));
    d += (pen ? "L" : "M") + p.X(x).toFixed(1) + " " + p.Y(yc).toFixed(1);
    pen = true;
  }
  return d;
}

/** Polygone fermé (aires, zones colorées) à partir de points en valeurs. */
export function polyPath(p: Plot, pts: Array<[number, number]>): string {
  return (
    pts.map(([x, y], i) => (i ? "L" : "M") + p.X(x).toFixed(1) + " " + p.Y(y).toFixed(1)).join(" ") +
    " Z"
  );
}

/** Axes, graduations et libellés d'axes. */
export function Frame({
  p,
  xticks,
  yticks,
  xfmt,
  yfmt,
  xlabel,
  ylabel,
  grid = true,
}: {
  p: Plot;
  xticks?: number[];
  yticks?: number[];
  xfmt?: (t: number) => string;
  yfmt?: (t: number) => string;
  xlabel?: string;
  ylabel?: string;
  grid?: boolean;
}) {
  const yAxisX = p.pL;
  const xAxisY = p.h - p.pB;
  return (
    <g>
      {(yticks ?? []).map((t) => (
        <g key={`y${t}`}>
          {grid ? (
            <line x1={p.pL} y1={p.Y(t)} x2={p.w - p.pR} y2={p.Y(t)} stroke={C.guide} strokeWidth={1} opacity={0.3} />
          ) : null}
          <text x={p.pL - 7} y={p.Y(t) + 4} textAnchor="end" fontSize={12.5} fill={C.soft}>
            {yfmt ? yfmt(t) : fmt(t)}
          </text>
        </g>
      ))}
      {(xticks ?? []).map((t) => (
        <g key={`x${t}`}>
          <line x1={p.X(t)} y1={xAxisY} x2={p.X(t)} y2={xAxisY + 5} stroke={C.soft} strokeWidth={1.2} />
          <text x={p.X(t)} y={xAxisY + 18} textAnchor="middle" fontSize={12.5} fill={C.soft}>
            {xfmt ? xfmt(t) : fmt(t)}
          </text>
        </g>
      ))}
      <line x1={p.pL} y1={xAxisY} x2={p.w - p.pR} y2={xAxisY} stroke={C.soft} strokeWidth={1.3} />
      <line x1={yAxisX} y1={p.pT} x2={yAxisX} y2={xAxisY} stroke={C.soft} strokeWidth={1.3} />
      {xlabel ? (
        <text x={p.w - p.pR} y={p.h - 6} textAnchor="end" fontSize={13} fontWeight={600} fill={C.soft}>
          {xlabel}
        </text>
      ) : null}
      {ylabel ? (
        <text x={p.pL + 4} y={p.pT - 7} textAnchor="start" fontSize={13} fontWeight={600} fill={C.soft}>
          {ylabel}
        </text>
      ) : null}
    </g>
  );
}

/** Repère pointillé vertical de l'axe jusqu'au point (x, y). */
export function GuideV({ p, x, y, color = C.guide }: { p: Plot; x: number; y: number; color?: string }) {
  return (
    <line x1={p.X(x)} y1={p.Y(y)} x2={p.X(x)} y2={p.h - p.pB} stroke={color} strokeWidth={1.1} strokeDasharray="4 4" />
  );
}

/** Repère pointillé horizontal de l'axe jusqu'au point (x, y). */
export function GuideH({ p, x, y, color = C.guide }: { p: Plot; x: number; y: number; color?: string }) {
  return <line x1={p.pL} y1={p.Y(y)} x2={p.X(x)} y2={p.Y(y)} stroke={color} strokeWidth={1.1} strokeDasharray="4 4" />;
}

/** Point plein. */
export function Dot({ p, x, y, fill = C.ink, r = 4.5 }: { p: Plot; x: number; y: number; fill?: string; r?: number }) {
  return <circle cx={p.X(x)} cy={p.Y(y)} r={r} fill={fill} stroke="#fff" strokeWidth={1.5} />;
}

/**
 * Étiquette lisible posée sur un graphique (halo blanc pour rester lisible
 * par-dessus les courbes).
 */
export function Label({
  p,
  x,
  y,
  children,
  color = C.ink,
  anchor = "start",
  dx = 6,
  dy = -6,
  size = 12,
  weight = 600,
}: {
  p: Plot;
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  anchor?: "start" | "middle" | "end";
  dx?: number;
  dy?: number;
  size?: number;
  weight?: number;
}) {
  return (
    <text
      x={p.X(x) + dx}
      y={p.Y(y) + dy}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      stroke="#fff"
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

/** Conteneur SVG responsive (s'adapte à la largeur, jamais de débordement). */
export function PlotSvg({
  p,
  label,
  children,
  maxW = 640,
}: {
  p: Plot;
  label: string;
  children: ReactNode;
  maxW?: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${p.w} ${p.h}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: maxW }}
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

/** Légende horizontale (pastilles de couleur + texte). */
export function Legend({ items }: { items: Array<{ color: string; label: ReactNode; dashed?: boolean }> }) {
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-0 w-5 border-t-[3px]"
            style={{ borderColor: it.color, borderStyle: it.dashed ? "dashed" : "solid" }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Optimisation numérique                                              */
/* ------------------------------------------------------------------ */

/** Recherche ternaire du maximum d'une fonction unimodale sur [a, b]. */
export function argmax(f: (x: number) => number, a: number, b: number): number {
  let lo = a;
  let hi = b;
  for (let i = 0; i < 100; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (f(m1) < f(m2)) lo = m1;
    else hi = m2;
  }
  return (lo + hi) / 2;
}
