/*
 * ParetoTaxExplorer — slides 38-39 (S1, approche rationnelle).
 *
 * Utilités U_H(t) (hauts salaires) et U_B(t) (bas salaires) en fonction de la
 * taxe, calculées avec le modèle de l'île (slides 22-31) et les paramètres
 * illustratifs de toute l'app : s_H = 5, s_B = 3, a = 0,5, L = 1.
 *   l*(t) = min(1 ; a/(s(1−t)))   M(t) = t/2·(s_H(1−l*_H) + s_B(1−l*_B))
 *   U(t)  = s(1−t)(1−l*) + M(t) + a·ln l*
 * Contrôles (Python) : t*_UB = 0,5 exactement (U_B = 1,951 ; U_H = 2,695) ;
 * t*_M = 1 − √(1/8) ≈ 0,646 ; t*₁ = 0,3 → U_B = 1,868, et U_B ≥ 1,868 sur
 * [0,3 ; 0,639] où U_H ≤ 3,013 (U_H(0,639) ≈ 2,336) ; t = 0,8 → U_H = 1,353,
 * U_B = 1,209. U_H décroît partout et reste au-dessus de U_B sur [0 ; 0,85].
 * Au-delà de t = 5/6 ≈ 0,833, les bas salaires ne travaillent plus (l*_B = 1).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import { C, Legend, PlotSvg, fmt, makePlot, type Plot } from "@/chapters/shared/plot";

/* ------------------------------------------------------------------ */
/* Modèle                                                              */
/* ------------------------------------------------------------------ */

const SH = 5;
const SB = 3;
const A = 0.5;
const T_MAX = 0.85;
/** t*_UB : maximum de U_B (= 0,5 exactement avec ces paramètres) */
const T_UB = 0.5;
/** t*_M : maximum de la recette M(t) = 1 − √(1/8) ≈ 0,646 */
const T_M = 1 - Math.sqrt(1 / 8);
/** exemple de la slide 38 */
const T_STAR1 = 0.3;

function leisure(s: number, t: number): number {
  return Math.min(1, A / (s * (1 - t)));
}

function transfer(t: number): number {
  return (t / 2) * (SH * (1 - leisure(SH, t)) + SB * (1 - leisure(SB, t)));
}

function utility(s: number, t: number): number {
  const l = leisure(s, t);
  return s * (1 - t) * (1 - l) + transfer(t) + A * Math.log(l);
}

const UH = (t: number) => utility(SH, t);
const UB = (t: number) => utility(SB, t);

/** Résout f(x) = target sur [lo, hi] (f monotone sur l'intervalle) par dichotomie. */
function solve(f: (x: number) => number, lo: number, hi: number, target: number): number {
  let a = lo;
  let b = hi;
  const sa = Math.sign(f(a) - target);
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2;
    if (Math.sign(f(m) - target) === sa) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

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

/** Symbole SVG : base italique + exposant/indice (ex. t*_UB). */
function Sym({ base, sup, sub, rest, size = 13 }: { base: string; sup?: string; sub?: string; rest?: ReactNode; size?: number }) {
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

function Txt({
  x,
  y,
  children,
  color = C.ink,
  anchor = "middle",
  size = 13,
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
      fill={color}
      stroke="#fff"
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

/** Flèche (légèrement courbée si bend ≠ 0) entre deux points en pixels, raccourcie aux extrémités. */
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  bend = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  bend?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 22) return null;
  const cx = (x1 + x2) / 2 + (-dy / len) * bend;
  const cy = (y1 + y2) / 2 + (dx / len) * bend;
  const toward = (x: number, y: number, d: number) => {
    const l = Math.hypot(cx - x, cy - y) || 1;
    return [x + ((cx - x) / l) * d, y + ((cy - y) / l) * d] as const;
  };
  const [sx, sy] = toward(x1, y1, 7);
  const [ex, ey] = toward(x2, y2, 7);
  const tl = Math.hypot(ex - cx, ey - cy) || 1;
  const ux = (ex - cx) / tl;
  const uy = (ey - cy) / tl;
  const bx = ex - ux * 10;
  const by = ey - uy * 10;
  return (
    <g>
      <path d={`M${sx} ${sy} Q${cx} ${cy} ${bx} ${by}`} fill="none" stroke={color} strokeWidth={2.4} />
      <polygon
        points={`${ex},${ey} ${bx - uy * 5},${by + ux * 5} ${bx + uy * 5},${by - ux * 5}`}
        fill={color}
      />
    </g>
  );
}

function curve(p: Plot, f: (t: number) => number, a: number, b: number, n = 170): string {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = a + ((b - a) * i) / n;
    d += (i ? "L" : "M") + p.X(t).toFixed(1) + " " + p.Y(f(t)).toFixed(1);
  }
  return d;
}

/** Écarte horizontalement deux étiquettes (pixels). */
function spread2(a: number, b: number, gap: number): [number, number] {
  if (Math.abs(b - a) >= gap) return [a, b];
  const mid = (a + b) / 2;
  return a <= b ? [mid - gap / 2, mid + gap / 2] : [mid + gap / 2, mid - gap / 2];
}

/* ------------------------------------------------------------------ */
/* Analyse d'un taux candidat                                          */
/* ------------------------------------------------------------------ */

type Analysis =
  | { kind: "dominated"; t: number; tLo: number }
  | { kind: "efficient"; t: number; tHi: number; atPeak: boolean };

function analyse(t: number): Analysis {
  if (t > T_UB + 0.0005) {
    const target = UB(t);
    const tLo = target <= UB(0) ? 0 : solve(UB, 0, T_UB, target);
    return { kind: "dominated", t, tLo };
  }
  const tHi = solve(UB, T_UB, T_MAX, UB(t));
  return { kind: "efficient", t, tHi, atPeak: tHi - t < 0.004 };
}

/* ------------------------------------------------------------------ */
/* Graphique                                                           */
/* ------------------------------------------------------------------ */

const P = makePlot({ w: 520, h: 372, pL: 46, pR: 18, pT: 16, pB: 58, x: [0, T_MAX], y: [0.2, 4.05] });
const PN = makePlot({ w: 400, h: 372, pL: 40, pR: 10, pT: 16, pB: 58, x: [0, T_MAX], y: [0.2, 4.05] });

const HATCH_ID = "pareto-tax-dominated-hatch";
const BLUE_BAND = "#4f46e5";
const GREEN_BAND = "#059669";
const GOLD_BAND = "#d97706";

function ParetoPlot({ t, an, narrow }: { t: number; an: Analysis; narrow: boolean }) {
  const p = narrow ? PN : P;
  const axisY = p.h - p.pB;
  const top = p.pT;
  const uH = UH(t);
  const uB = UB(t);
  const row1 = axisY + 18;
  const row2 = axisY + 40;
  const isStar1 = Math.abs(t - T_STAR1) < 0.0005;

  // étiquettes des courbes, placées à l'écart du taux candidat et des pointillés
  const between = an.kind === "efficient" && t < 0.16;
  const labT = an.kind === "dominated" ? 0.2 : between ? 0.3 : t / 2;

  // étiquettes de la 2e ligne sous l'axe
  const candX = p.X(t);
  const hiX = an.kind === "efficient" && !an.atPeak ? p.X(an.tHi) : null;
  const [cX, hX] = hiX !== null ? spread2(candX, hiX, 84) : [candX, 0];
  // le pointillé du candidat ne doit pas barrer les étiquettes 0, t*_UB, t*_M, « 0,85 t » sous l'axe
  const nearTick = [0, T_UB, T_M].some((v) => Math.abs(p.X(v) - candX) < 16) || candX > p.X(T_MAX) - 50;

  const band = (a: number, b: number, color: string, op: number) =>
    b - a > 0.0005 ? (
      <rect x={p.X(a)} y={top} width={p.X(b) - p.X(a)} height={axisY - top} fill={color} opacity={op} />
    ) : null;

  const bandLabel = (a: number, b: number, yU: number, color: string, text: ReactNode, width: number) => {
    if (b - a < 0.01) return null;
    const cx = Math.max(p.pL + width / 2 + 2, Math.min((p.X(a) + p.X(b)) / 2, p.w - p.pR - width / 2 - 2));
    return (
      <Txt x={cx} y={p.Y(yU)} color={color} size={13.5}>
        {text}
      </Txt>
    );
  };

  return (
    <PlotSvg
      p={p}
      label={`Utilités des hauts et des bas salaires en fonction de la taxe ; taux candidat t = ${fmt(t, 2)}.`}
    >
      {/* zone Pareto-dominée par t*_UB : des hachures (et non un aplat) pour que les zones
          du taux candidat gardent leur couleur là où elles la recouvrent */}
      <defs>
        <pattern id={HATCH_ID} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={7} stroke={C.red} strokeWidth={1.6} strokeOpacity={0.22} />
        </pattern>
      </defs>
      <rect
        x={p.X(T_UB)}
        y={top}
        width={p.X(T_MAX) - p.X(T_UB)}
        height={axisY - top}
        fill={`url(#${HATCH_ID})`}
      />

      {/* zones liées au taux candidat */}
      {an.kind === "efficient" ? (
        <>
          {band(0, t, BLUE_BAND, 0.09)}
          {an.atPeak ? null : band(t, an.tHi, GREEN_BAND, 0.11)}
        </>
      ) : (
        band(an.tLo, t, GOLD_BAND, 0.13)
      )}

      {/* grille */}
      {[1, 2, 3].map((u) => (
        <g key={u}>
          <line x1={p.pL} y1={p.Y(u)} x2={p.w - p.pR} y2={p.Y(u)} stroke={C.guide} strokeOpacity={0.3} />
          <text x={p.pL - 7} y={p.Y(u) + 4} textAnchor="end" fontSize={13} fill={C.soft}>
            {u}
          </text>
        </g>
      ))}

      {/* t*_M (recette maximale) */}
      <line x1={p.X(T_M)} y1={axisY} x2={p.X(T_M)} y2={top + 8} stroke={C.soft} strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="2 4" />

      {/* t*_UB */}
      <line x1={p.X(T_UB)} y1={axisY} x2={p.X(T_UB)} y2={p.Y(UH(T_UB))} stroke={C.ink} strokeOpacity={0.55} strokeWidth={1.3} strokeDasharray="5 4" />

      {/* repères horizontaux du taux candidat */}
      {an.kind === "efficient" ? (
        <>
          <line x1={p.X(0)} y1={p.Y(uH)} x2={p.X(an.atPeak ? t : an.tHi)} y2={p.Y(uH)} stroke={C.blue} strokeWidth={1.4} strokeDasharray="5 4" />
          <line x1={p.X(0)} y1={p.Y(uB)} x2={p.X(an.atPeak ? t : an.tHi)} y2={p.Y(uB)} stroke={C.green} strokeWidth={1.4} strokeDasharray="5 4" />
        </>
      ) : null}

      {/* courbes */}
      <path d={curve(p, UH, 0, T_MAX)} fill="none" stroke={C.blue} strokeWidth={2.8} />
      <path d={curve(p, UB, 0, T_MAX)} fill="none" stroke={C.green} strokeWidth={2.8} />
      <Txt x={p.X(labT)} y={p.Y(UH(labT)) + (between ? 25 : -10)} color={C.blue} size={15}>
        <Sym base="U" sub="H" size={15} rest="(t)" />
      </Txt>
      <Txt x={p.X(labT)} y={p.Y(UB(labT)) + (between ? -10 : 25)} color={C.green} size={15}>
        <Sym base="U" sub="B" size={15} rest="(t)" />
      </Txt>

      {/* sommet de U_B */}
      <circle cx={p.X(T_UB)} cy={p.Y(UB(T_UB))} r={5} fill={C.green} stroke="#fff" strokeWidth={1.5} />
      <circle cx={p.X(T_UB)} cy={p.Y(UH(T_UB))} r={4} fill={C.blue} stroke="#fff" strokeWidth={1.5} />

      {/* segment rouge sur l'axe */}
      <line x1={p.X(T_UB)} y1={axisY} x2={p.X(T_MAX)} y2={axisY} stroke={C.red} strokeWidth={4} />
      <circle cx={p.X(T_UB)} cy={axisY} r={4} fill="#fff" stroke={C.red} strokeWidth={2} />
      {narrow ? (
        <>
          <Txt x={(p.X(T_UB) + p.X(T_MAX)) / 2} y={axisY - 26} color={C.red} size={13.5}>
            Pareto-dominé
          </Txt>
          <Txt x={(p.X(T_UB) + p.X(T_MAX)) / 2} y={axisY - 9} color={C.red} size={13.5}>
            par <Sym base="t" sup="*" sub="UB" size={13.5} />
          </Txt>
        </>
      ) : (
        <Txt x={(p.X(T_UB) + p.X(T_MAX)) / 2} y={axisY - 9} color={C.red} size={13.5}>
          Pareto-dominé par <Sym base="t" sup="*" sub="UB" size={13.5} />
        </Txt>
      )}

      {/* taux candidat */}
      <line
        x1={candX}
        y1={nearTick ? axisY : row2 - 13}
        x2={candX}
        y2={p.Y(uH)}
        stroke={C.ink}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />

      {an.kind === "efficient" && !an.atPeak ? (
        <>
          {/* t′ : B retrouve U_B(t) ; H y est plus bas */}
          <line x1={hiX!} y1={axisY} x2={hiX!} y2={p.Y(uH)} stroke={C.soft} strokeWidth={1.1} strokeDasharray="2 3" />
          <circle cx={hiX!} cy={p.Y(uB)} r={4.5} fill="#fff" stroke={C.green} strokeWidth={2.2} />
          <Arrow x1={hiX!} y1={p.Y(uH)} x2={hiX!} y2={p.Y(UH(an.tHi))} color={C.blue} />
          <Txt x={hiX! + 7} y={(p.Y(uH) + p.Y(UH(an.tHi))) / 2 + 4} anchor="start" color={C.blue} size={13.5}>
            −{fmt(uH - UH(an.tHi), 3)}
          </Txt>
          <Txt x={hX} y={row2} color={C.soft} size={13.5}>
            <tspan fontStyle="italic">t</tspan>′ = {fmt(an.tHi, 3)}
          </Txt>
        </>
      ) : null}

      {an.kind === "dominated" ? (
        <>
          <Arrow x1={candX} y1={p.Y(uH)} x2={p.X(T_UB)} y2={p.Y(UH(T_UB))} color={C.blue} bend={-16} />
          <Arrow x1={candX} y1={p.Y(uB)} x2={p.X(T_UB)} y2={p.Y(UB(T_UB))} color={C.green} bend={-16} />
          <Txt x={p.X(T_UB) + 9} y={p.Y(UH(T_UB)) - 10} anchor="start" color={C.blue} size={13.5}>
            +{fmt(UH(T_UB) - uH, 3)}
          </Txt>
          <Txt x={p.X(T_UB) + 9} y={p.Y(UB(T_UB)) - 10} anchor="start" color={C.green} size={13.5}>
            +{fmt(UB(T_UB) - uB, 3)}
          </Txt>
        </>
      ) : null}

      <circle cx={candX} cy={p.Y(uH)} r={5.5} fill="#fff" stroke={C.blue} strokeWidth={2.6} />
      <circle cx={candX} cy={p.Y(uB)} r={5.5} fill="#fff" stroke={C.green} strokeWidth={2.6} />

      {/* étiquettes des zones (bandeau du haut) */}
      {an.kind === "efficient" ? (
        <>
          {bandLabel(0, t, 3.88, BLUE_BAND, "H gagne, B perd", 112)}
          {an.atPeak ? null : bandLabel(t, an.tHi, 3.6, GREEN_BAND, "B gagne (ou autant), H perd", 190)}
        </>
      ) : (
        bandLabel(an.tLo, t, 3.74, "#b45309", "ici, les DEUX font mieux qu'en t", 216)
      )}

      {/* axes */}
      <line x1={p.pL} y1={axisY} x2={p.w - p.pR} y2={axisY} stroke={C.soft} strokeWidth={1.4} />
      <line x1={p.pL} y1={axisY} x2={p.pL} y2={top - 4} stroke={C.soft} strokeWidth={1.4} />
      <text x={p.pL - 5} y={top - 2} textAnchor="end" fontSize={14} fontStyle="italic" fill={C.soft}>
        U(t)
      </text>
      {[0, T_UB, T_M, T_MAX].map((v) => (
        <line key={v} x1={p.X(v)} y1={axisY} x2={p.X(v)} y2={axisY + 5} stroke={C.soft} strokeWidth={1.2} />
      ))}
      <text x={p.X(0)} y={row1} textAnchor="middle" fontSize={12.5} fill={C.soft}>
        0
      </text>
      <text x={p.X(T_UB)} y={row1} textAnchor="middle" fontSize={14.5} fontWeight={700} fill={C.ink}>
        <Sym base="t" sup="*" sub="UB" size={14.5} />
      </text>
      <text x={p.X(T_M)} y={row1} textAnchor="middle" fontSize={14.5} fontWeight={600} fill={C.soft}>
        <Sym base="t" sup="*" sub="M" size={14.5} />
      </text>
      <text x={p.X(T_MAX)} y={row1} textAnchor="end" fontSize={12.5} fill={C.soft}>
        0,85 <tspan fontStyle="italic">t</tspan>
      </text>
      <Txt x={cX} y={row2} color={C.ink} size={14.5}>
        {isStar1 ? (
          <Sym base="t" sup="*" sub="1" size={14.5} rest={` = ${fmt(t, 2)}`} />
        ) : (
          <>
            <tspan fontStyle="italic">t</tspan> = {fmt(t, 2)}
          </>
        )}
      </Txt>
    </PlotSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Verdict                                                             */
/* ------------------------------------------------------------------ */

function Verdict({ t, an }: { t: number; an: Analysis }) {
  const ts = fmt(t, 2);
  if (an.kind === "dominated") {
    return (
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[13px] leading-snug sm:text-sm">
        <div className="font-bold text-rose-700 dark:text-rose-300">
          <M tex={`t = ${ts.replace(",", "{,}")}`} /> est Pareto-dominé par <M tex="t^*_{U_B} = 0{,}5" />.
        </div>
        <p className="mt-1">
          En passant de <M tex={`t = ${ts.replace(",", "{,}")}`} /> à <M tex="t^*_{U_B}" />, les hauts salaires
          passent de {fmt(UH(t), 3)} à {fmt(UH(T_UB), 3)} <strong>(+{fmt(UH(T_UB) - UH(t), 3)})</strong> et les bas
          salaires de {fmt(UB(t), 3)} à {fmt(UB(T_UB), 3)} <strong>(+{fmt(UB(T_UB) - UB(t), 3)})</strong>.{" "}
          <strong>Les deux groupes y gagnent</strong> : garder <M tex={`t = ${ts.replace(",", "{,}")}`} /> serait du
          gaspillage.
        </p>
        <p className="mt-1 text-muted-foreground">
          Plus largement, tout taux de la zone dorée <M tex={`[${fmt(an.tLo, 3).replace(",", "{,}")}\\,;\\,${ts.replace(",", "{,}")}[`} />{" "}
          donne au moins autant aux bas salaires et plus aux hauts salaires : <M tex="t^*_{U_B}" /> n'est que l'un
          d'eux.
        </p>
      </div>
    );
  }
  const tex = (v: number, d = 3) => fmt(v, d).replace(",", "{,}");
  const ts2 = tex(t, 2);
  // slide 38 : le taux 0,3 s'appelle t*_1
  const tName = Math.abs(t - T_STAR1) < 0.0005 ? "t^*_1" : "t";
  return (
    <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-3 py-2 text-[13px] leading-snug sm:text-sm">
      <div className="font-bold text-emerald-700 dark:text-emerald-300">
        <M tex={`${tName} = ${ts2}`} /> n'est dominé par aucun autre taux.
      </div>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>
          {an.atPeak ? (
            <>
              Les bas salaires ont leur maximum en <M tex="t^*_{U_B}" /> : aucun autre taux ne leur donne autant.
            </>
          ) : (
            <>
              Les <strong>autres</strong> taux qui donnent aux bas salaires <strong>au moins</strong>{" "}
              <M tex={`U_B = ${tex(UB(t))}`} /> sont entre <M tex={ts2} /> et <M tex={`t' = ${tex(an.tHi)}`} /> (zone
              verte). Ils sont tous plus élevés que <M tex={ts2} />, donc ils donnent <strong>moins</strong> aux hauts
              salaires (<M tex="U_H" /> baisse quand <M tex="t" /> monte) : par exemple{" "}
              <M tex={`U_H(t') = ${tex(UH(an.tHi))} < ${tex(UH(t))}`} />.
            </>
          )}
        </li>
        <li>
          {t < 0.005 ? (
            <>
              Les hauts salaires ont leur maximum en <M tex="t = 0" /> (<M tex="U_H" /> baisse toujours quand{" "}
              <M tex="t" /> monte) : aucun autre taux ne leur donne autant.
            </>
          ) : (
            <>
              Les <strong>autres</strong> taux qui donnent aux hauts salaires <strong>au moins</strong>{" "}
              <M tex={`U_H = ${tex(UH(t))}`} /> sont ceux sous <M tex={ts2} /> (zone bleue), car <M tex="U_H" /> baisse
              quand <M tex="t" /> monte. Mais ils donnent <strong>moins</strong> aux bas salaires (<M tex="U_B" />{" "}
              monte jusqu'à <M tex="t^*_{U_B}" />) : par exemple <M tex={`U_B(0) = ${tex(UB(0))} < ${tex(UB(t))}`} />.
            </>
          )}
        </li>
      </ul>
      <p className="mt-1 text-muted-foreground">
        On ne peut donc améliorer le sort d'un groupe sans nuire à l'autre : le critère de Pareto ne permet pas
        d'écarter ce taux. Pour choisir dans <M tex="[0\,;\,t^*_{U_B}]" />, il faut un objectif (slide 35).
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

type Preset = "a" | "b" | "c" | "d" | "none";

const PRESETS: Array<{ value: Exclude<Preset, "none">; t: number; label: ReactNode }> = [
  {
    value: "a",
    t: T_STAR1,
    label: (
      <>
        <M tex="t^*_1 = 0{,}3" /> (slide 38)
      </>
    ),
  },
  { value: "b", t: T_UB, label: <M tex="t^*_{U_B} = 0{,}5" /> },
  { value: "c", t: 0.7, label: <M tex="t = 0{,}7" /> },
  { value: "d", t: 0.8, label: <M tex="t = 0{,}8" /> },
];

export function ParetoTaxExplorer() {
  const [t, setT, animateT] = useTween(T_STAR1);
  const narrow = useNarrow();
  const an = analyse(t);
  const active = PRESETS.find((pr) => Math.abs(pr.t - t) < 0.0005);

  return (
    <InteractiveCard
      title="Quels taux le critère de Pareto élimine-t-il ?"
      subtitle={
        <>
          Utilités <M tex="U_H(t)" /> et <M tex="U_B(t)" /> de la slide 31 (allocation de chaque groupe, réaction à la
          taxe comprise), avec les chiffres illustratifs <M tex="s_H = 5" />, <M tex="s_B = 3" />,{" "}
          <M tex="a = 0{,}5" />. Choisis un taux candidat <M tex="t" /> : existe-t-il un autre taux qui fait mieux pour
          les deux groupes ?
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taux candidat <M tex="t" />
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
            className="sm:col-span-1 lg:col-span-2"
            label="Exemples"
            value={active ? active.value : "none"}
            onChange={(v) => {
              const pr = PRESETS.find((x) => x.value === v);
              if (pr) animateT(pr.t);
            }}
            options={PRESETS.map((pr) => ({ value: pr.value, label: pr.label }))}
          />
        </>
      }
      footer={
        <>
          à droite de <M tex="t^*_{U_B}" />, monter la taxe fait perdre <strong>tout le monde</strong> : tous ces taux
          sont Pareto-dominés par <M tex="t^*_{U_B}" /> (slide 39, premier point). À gauche, monter <M tex="t" /> aide
          les bas salaires mais nuit aux hauts salaires : aucun taux de <M tex="[0\,;\,t^*_{U_B}]" /> n'est dominé
          (second point). Pareto écarte donc les taxes trop fortes, sans dire laquelle choisir parmi les autres. Note
          aussi <M tex="t^*_{U_B} = 0{,}5 < t^*_M \approx 0{,}646" /> : les bas salaires veulent moins de taxe que le
          taux qui maximise la recette, car la taxe rogne aussi leur propre salaire net.
        </>
      }
    >
      <ParetoPlot t={t} an={an} narrow={narrow} />
      <Legend
        items={[
          {
            color: C.blue,
            label: (
              <>
                hauts salaires <M tex="U_H(t)" />
              </>
            ),
          },
          {
            color: C.green,
            label: (
              <>
                bas salaires <M tex="U_B(t)" />
              </>
            ),
          },
          {
            color: C.red,
            label: (
              <>
                taux dominés par <M tex="t^*_{U_B}" />
              </>
            ),
          },
          {
            color: C.soft,
            dashed: true,
            label: (
              <>
                <M tex="t^*_M \approx 0{,}646" /> : recette <M tex="M" /> maximale
              </>
            ),
          },
        ]}
      />
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:text-[13px]">
        <div className="rounded-lg border bg-background px-2 py-1.5 sm:px-3">
          <div className="mb-0.5 font-bold">
            Candidat <M tex={`t = ${fmt(t, 2).replace(",", "{,}")}`} />
          </div>
          <div className="flex justify-between gap-2">
            <M tex="U_H(t)" />
            <span className="font-semibold tabular-nums" style={{ color: C.blue }}>
              {fmt(UH(t), 3)}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <M tex="U_B(t)" />
            <span className="font-semibold tabular-nums" style={{ color: C.green }}>
              {fmt(UB(t), 3)}
            </span>
          </div>
        </div>
        <div className="rounded-lg border bg-background px-2 py-1.5 sm:px-3">
          <div className="mb-0.5 font-bold">
            <M tex="t^*_{U_B} = 0{,}5" />
          </div>
          <div className="flex justify-between gap-2">
            <M tex="U_H" />
            <span className="font-semibold tabular-nums" style={{ color: C.blue }}>
              {fmt(UH(T_UB), 3)}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <M tex="U_B" />
            <span className="font-semibold tabular-nums" style={{ color: C.green }}>
              {fmt(UB(T_UB), 3)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Verdict t={t} an={an} />
      </div>
      <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
        Au-delà de <M tex="t = 1 - a/s_B \approx 0{,}833" />, les bas salaires ne travaillent plus (<M tex="l^*_B = 1" />,
        solution en coin) : les courbes en tiennent compte.
      </p>
    </InteractiveCard>
  );
}
