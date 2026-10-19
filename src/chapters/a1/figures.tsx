/*
 * Chapitre A1 — figures statiques.
 *
 * Toutes les courbes sont CALCULÉES à partir de vraies fonctions (pas de
 * tracé à main levée) : les courbes d'indifférence sont convexes, les points
 * censés être sur une courbe y sont exactement, les tangences sont réelles.
 *  - FigMethode     : slides 7, 23, 43 (analyse positive → allocations → balance normative)
 *  - FigIndiff      : slide 12 (une courbe d'indifférence, y ≻ x ∼ x′ ≻ z)
 *  - FigCarte       : slide 13 (la carte d'indifférence)
 *  - FigUtilLevels  : slide 16 (niveaux d'utilité 2 / 5 / 13)
 */

import type { ReactNode } from "react";
import { M } from "@/components/course/Math";
import { C, Dot, GuideH, GuideV, Label, curvePath, makePlot, type Plot } from "../shared/plot";

/** Cadre commun : carte blanche + légende. */
export function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="my-6">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">{children}</div>
      <figcaption className="mt-2 px-1 text-sm leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

/* couleurs propres aux figures */
const MAGENTA = "#c026d3"; // inscriptions « y ≻ x ∼ x′ ≻ z » (en magenta sur les slides)
const CURVE = "#2563eb"; // courbes d'indifférence (bleu des slides)
const SLIDE_RED = "#e11d48"; // « ANALYSE POSITIVE / NORMATIVE » (rouge des slides)

/** Axes fléchés (style des slides) avec libellés en italique. */
function Axes({ p, xl = "l", yl = "c" }: { p: Plot; xl?: string; yl?: string }) {
  const x0 = p.pL;
  const y0 = p.h - p.pB;
  const x1 = p.w - p.pR;
  const yt = p.pT;
  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.ink} strokeWidth={1.6} />
      <line x1={x0} y1={y0} x2={x0} y2={yt} stroke={C.ink} strokeWidth={1.6} />
      <polygon points={`${x1 + 8},${y0} ${x1 - 2},${y0 - 5} ${x1 - 2},${y0 + 5}`} fill={C.ink} />
      <polygon points={`${x0},${yt - 8} ${x0 - 5},${yt + 2} ${x0 + 5},${yt + 2}`} fill={C.ink} />
      <text x={x1 + 4} y={y0 + 20} fontSize={16} fontStyle="italic" fill={C.ink}>
        {xl}
      </text>
      <text x={yl.length > 1 ? x0 + 8 : x0 - 18} y={yt + 4} fontSize={16} fontStyle="italic" fill={C.ink}>
        {yl}
      </text>
    </g>
  );
}

/** Petite flèche en pixels (de (x1,y1) vers (x2,y2)). */
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h = 9;
  const a1 = ang + Math.PI - 0.42;
  const a2 = ang + Math.PI + 0.42;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - Math.cos(ang) * 3} y2={y2 - Math.sin(ang) * 3} stroke={color} strokeWidth={width} />
      <polygon
        points={`${x2},${y2} ${x2 + h * Math.cos(a1)},${y2 + h * Math.sin(a1)} ${x2 + h * Math.cos(a2)},${y2 + h * Math.sin(a2)}`}
        fill={color}
      />
    </g>
  );
}

/** Lettre de panier en italique (x, x′, y, z…) posée près d'un point. */
function Tag({
  p,
  x,
  y,
  children,
  color = C.ink,
  dx = -16,
  dy = -9,
}: {
  p: Plot;
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  dx?: number;
  dy?: number;
}) {
  return (
    <text
      x={p.X(x) + dx}
      y={p.Y(y) + dy}
      fontSize={17}
      fontStyle="italic"
      fill={color}
      stroke="#fff"
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/* Slides 7 · 23 · 43 — La méthode : analyse positive puis normative     */
/* ------------------------------------------------------------------ */

/**
 * Schéma de la méthode d'analyse (slide 7). `inputs` = libellés des mesures
 * comparées (défaut : « Mesure 1 », « Mesure 2 » ; slide 23 : « Taxe t₁ »,
 * « Taxe t₂ » ; slide 43 : « Policy 1 » … « Policy 4 »). Chaque mesure entre
 * dans le MODÈLE et en ressort sous forme d'une « Allocation k ».
 */
export function FigMethode({ inputs = ["Mesure 1", "Mesure 2"] }: { inputs?: string[] }) {
  const n = Math.max(1, inputs.length);
  const row = 30;
  const boxTop = 40;
  const boxH = n * row + 16;
  const boxBottom = boxTop + boxH;
  const H = boxBottom + 60; // hauteur de la partie « positive »
  const H2 = 178; // hauteur de la balance
  const rowY = (i: number) => boxTop + 8 + row / 2 + i * row;
  const W = 392;
  const bx0 = 100;
  const bx1 = 262;

  return (
    <div
      className="flex flex-wrap items-end justify-center gap-x-6 gap-y-4"
      role="img"
      aria-label={`Schéma de la méthode : ${inputs.join(", ")} entrent dans le modèle qui donne une allocation pour chacune (analyse positive) ; puis une balance compare les allocations (analyse normative).`}
    >
      {/* ---- analyse positive ---- */}
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" style={{ maxWidth: W }} aria-hidden>
        <text x={(bx0 + bx1) / 2} y={boxTop - 9} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.ink} letterSpacing={1}>
          MODÈLE
        </text>
        <rect x={bx0} y={boxTop} width={bx1 - bx0} height={boxH} rx={4} fill="#f8fafc" stroke={C.ink} strokeWidth={1.4} />
        {inputs.map((lab, i) => {
          const y = rowY(i);
          return (
            <g key={i}>
              <text x={2} y={y + 5} fontSize={14} fill={C.ink}>
                {lab}
              </text>
              <line x1={74} y1={y} x2={290} y2={y} stroke={C.ink} strokeWidth={1.2} strokeDasharray="5 4" />
              <polygon points={`${298},${y} ${289},${y - 4.5} ${289},${y + 4.5}`} fill={C.ink} />
              <text x={303} y={y + 5} fontSize={14} fill={C.ink}>
                Allocation {i + 1}
              </text>
            </g>
          );
        })}
        <text x={(bx0 + bx1) / 2} y={H - 30} textAnchor="middle" fontSize={14} fontWeight={700} fill={SLIDE_RED} letterSpacing={1}>
          ANALYSE POSITIVE
        </text>
        <text x={(bx0 + bx1) / 2} y={H - 12} textAnchor="middle" fontSize={13} fill={C.soft}>
          chaque mesure → l'allocation qu'elle produit
        </text>
      </svg>

      {/* ---- analyse normative : la balance ---- */}
      <svg viewBox={`0 0 230 ${H2}`} className="block h-auto w-full" style={{ maxWidth: 230 }} aria-hidden>
        {(() => {
          const L = { x: 72, y: 18 };
          const R = { x: 172, y: 70 };
          const mid = { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2 };
          const foot = 126;
          return (
            <g>
              {/* fléau incliné */}
              <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={C.ink} strokeWidth={2} />
              {/* pied + socle */}
              <line x1={mid.x} y1={mid.y} x2={mid.x} y2={foot} stroke={C.ink} strokeWidth={2} />
              <line x1={mid.x - 14} y1={foot} x2={mid.x + 14} y2={foot} stroke={C.ink} strokeWidth={2.4} />
              {/* les deux plateaux (suspentes) */}
              <line x1={L.x} y1={L.y} x2={L.x} y2={L.y + 28} stroke={C.ink} strokeWidth={1.6} />
              <line x1={R.x} y1={R.y} x2={R.x} y2={R.y + 28} stroke={C.ink} strokeWidth={1.6} />
              <text x={L.x - 7} y={L.y + 22} textAnchor="end" fontSize={13} fill={C.ink}>
                Alloc. 1
              </text>
              <text x={R.x} y={R.y + 46} textAnchor="middle" fontSize={13} fill={C.ink}>
                Alloc. 2
              </text>
            </g>
          );
        })()}
        <text x={115} y={H2 - 30} textAnchor="middle" fontSize={14} fontWeight={700} fill={SLIDE_RED} letterSpacing={1}>
          ANALYSE NORMATIVE
        </text>
        <text x={115} y={H2 - 12} textAnchor="middle" fontSize={13} fill={C.soft}>
          on compare les allocations
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 12 — Une courbe d'indifférence, quatre paniers                  */
/* ------------------------------------------------------------------ */

/** Courbe d'indifférence de niveau k pour U(l, c) = l·c : c = k / l (convexe). */
const hyper = (k: number) => (l: number) => k / l;

export function FigIndiff() {
  const p = makePlot({ w: 520, h: 330, pL: 40, pR: 28, pT: 22, pB: 32, x: [0, 4.4], y: [0, 8] });
  const f = hyper(5);
  const X = { l: 1, c: 5 };
  const Xp = { l: 2.5, c: 2 };
  const Yb = { l: 2.25, c: 5.2 };
  const Z = { l: 1.15, c: 1.9 };
  // petite flèche perpendiculaire à la courbe, vers les paniers préférés
  const l0 = 0.78;
  const px = p.X(l0);
  const py = p.Y(f(l0));
  const kx = (p.X(1) - p.X(0)) * 1; // px par unité de l
  const ky = p.Y(0) - p.Y(1); // px par unité de c
  const slopePx = (-5 / (l0 * l0)) * (ky / kx); // dc/dl en pixels (vers le haut = positif)
  // normale (vers le haut à droite) : (slopePx_abs, 1) normalisée
  const nx = -slopePx;
  const ny = 1;
  const nn = Math.hypot(nx, ny);
  const len = 30;

  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} className="mx-auto block h-auto w-full" style={{ maxWidth: 560 }} role="img" aria-label="Une courbe d'indifférence convexe avec quatre paniers : x et x′ sur la courbe, y au-dessus, z en dessous ; y ≻ x ∼ x′ ≻ z">
      <Axes p={p} />
      <path d={curvePath(p, f, 0.64, 4.2)} fill="none" stroke={CURVE} strokeWidth={2.6} />
      <Arrow x1={px} y1={py} x2={px + (nx / nn) * len} y2={py - (ny / nn) * len} color={CURVE} />
      <text x={px + (nx / nn) * len + 6} y={py - (ny / nn) * len - 2} fontSize={14} fontWeight={600} fill={CURVE}>
        paniers préférés
      </text>
      <Dot p={p} x={X.l} y={X.c} r={6} />
      <Tag p={p} x={X.l} y={X.c} dx={9} dy={-6}>
        x
      </Tag>
      <Dot p={p} x={Xp.l} y={Xp.c} r={6} />
      <Tag p={p} x={Xp.l} y={Xp.c} dx={7} dy={-9}>
        x′
      </Tag>
      <Dot p={p} x={Yb.l} y={Yb.c} r={6} fill={C.red} />
      <Tag p={p} x={Yb.l} y={Yb.c} dx={9} dy={-6} color={C.red}>
        y
      </Tag>
      <Dot p={p} x={Z.l} y={Z.c} r={6} fill={C.green} />
      <Tag p={p} x={Z.l} y={Z.c} dx={-4} dy={-12} color={C.green}>
        z
      </Tag>
      <text x={p.X(3.0)} y={p.Y(7.2)} fontSize={17} fontStyle="italic" fill={MAGENTA}>
        y ≻ x ∼ x′ ≻ z
      </text>
      <Label p={p} x={4.2} y={f(4.2)} anchor="end" dx={0} dy={24} color={CURVE} size={14}>
        courbe d'indifférence
      </Label>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 13 — La carte d'indifférence                                    */
/* ------------------------------------------------------------------ */

export function FigCarte() {
  const p = makePlot({ w: 520, h: 320, pL: 40, pR: 28, pT: 22, pB: 32, x: [0, 4.4], y: [0, 8] });
  const levels = [1.5, 3, 5, 8];
  const a = { l: 0.62, c: 1.25 };
  const b = { l: 2.3, c: 4.6 };
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} className="mx-auto block h-auto w-full" style={{ maxWidth: 560 }} role="img" aria-label="Carte d'indifférence : quatre courbes convexes qui ne se croisent pas ; la satisfaction croît vers le haut à droite">
      <Axes p={p} />
      {levels.map((k, i) => (
        <path
          key={k}
          d={curvePath(p, hyper(k), k / 8, 4.25)}
          fill="none"
          stroke={CURVE}
          strokeWidth={2.4}
          opacity={0.4 + (0.6 * i) / (levels.length - 1)}
        />
      ))}
      <Arrow x1={p.X(a.l)} y1={p.Y(a.c)} x2={p.X(b.l)} y2={p.Y(b.c)} color={C.ink} />
      <Label p={p} x={b.l} y={b.c} dx={8} dy={-4} size={14} color={C.ink}>
        satisfaction croissante
      </Label>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 16 — Associer un niveau d'utilité à chaque courbe               */
/* ------------------------------------------------------------------ */

/**
 * Trois courbes d'indifférence de niveaux U = 2, 5 et 13 (tracées avec
 * U(l, c) = l·c, chiffres illustratifs), les paniers z, x, x′, y du slide 16 et
 * les trois équivalences « préférence ⇔ comparaison des utilités ».
 */
export function FigUtilLevels() {
  const p = makePlot({ w: 520, h: 330, pL: 40, pR: 28, pT: 22, pB: 32, x: [0, 4.4], y: [0, 9.5] });
  const z = { l: 1, c: 2 };
  const x = { l: 1, c: 5 };
  const xp = { l: 2.5, c: 2 };
  const y = { l: 2, c: 6.5 };
  const lines: Array<{ k: number; label: string; color: string }> = [
    { k: 2, label: "U(z) = 2", color: C.green },
    { k: 5, label: "U(x) = U(x′) = 5", color: CURVE },
    { k: 13, label: "U(y) = 13", color: C.red },
  ];
  return (
    <div>
      <svg viewBox={`0 0 ${p.w} ${p.h}`} className="mx-auto block h-auto w-full" style={{ maxWidth: 560 }} role="img" aria-label="Trois courbes d'indifférence de niveaux d'utilité 2, 5 et 13 avec les paniers z, x, x′ et y">
        <Axes p={p} />
        {lines.map((ln) => (
          <g key={ln.k}>
            <path d={curvePath(p, hyper(ln.k), ln.k / 9.5, 3.0)} fill="none" stroke={ln.color} strokeWidth={2.5} />
            <Label p={p} x={3.0} y={ln.k / 3.0} anchor="start" dx={6} dy={5} color={ln.color} size={14}>
              {ln.label}
            </Label>
          </g>
        ))}
        <Dot p={p} x={z.l} y={z.c} r={6} />
        <Tag p={p} x={z.l} y={z.c} dx={9} dy={-6}>
          z
        </Tag>
        <Dot p={p} x={x.l} y={x.c} r={6} />
        <Tag p={p} x={x.l} y={x.c} dx={9} dy={-6}>
          x
        </Tag>
        <Dot p={p} x={xp.l} y={xp.c} r={6} />
        <Tag p={p} x={xp.l} y={xp.c} dx={4} dy={-11}>
          x′
        </Tag>
        <Dot p={p} x={y.l} y={y.c} r={6} />
        <Tag p={p} x={y.l} y={y.c} dx={9} dy={-6}>
          y
        </Tag>
      </svg>
      <div className="mx-auto mt-3 grid max-w-md gap-1.5 text-[15px]" style={{ color: MAGENTA }}>
        <div>
          <M tex="x \sim x' \;\Leftrightarrow\; U(x) = 5 = U(x')" />
        </div>
        <div>
          <M tex="x \succ z \;\Leftrightarrow\; U(x) = 5 > 2 = U(z)" />
        </div>
        <div>
          <M tex="y \succ x \;\Leftrightarrow\; U(y) = 13 > 5 = U(x)" />
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-md text-center text-[13px] text-muted-foreground">
        <strong className="text-foreground">Seul l'ordre compte :</strong> remplacer 2, 5, 13 par 1, 2,
        3 (ou 10, 20, 900) représenterait exactement les mêmes préférences. Courbes tracées avec{" "}
        <M tex="U(l,c) = l \cdot c" /> (chiffres illustratifs).
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 14 — L'optimum : le point de tangence (remplacée par TangencyExplorer) */
/* ------------------------------------------------------------------ */


/** Accolade horizontale simple (trait + petites butées) avec libellé dessous. */
function Brace({ x1, x2, y, color, label }: { x1: number; x2: number; y: number; color: string; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.6} />
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={color} strokeWidth={1.6} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={color} strokeWidth={1.6} />
      <text x={(x1 + x2) / 2} y={y + 18} textAnchor="middle" fontSize={13} fontWeight={600} fill={color}>
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Slide 38 — Utilités selon la taxe (remplacée par ParetoTaxExplorer)   */
/* ------------------------------------------------------------------ */

