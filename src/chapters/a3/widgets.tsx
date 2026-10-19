/**
 * Chapitre A3 · Décision sous incertitude — widgets interactifs et
 * visualisations. Les formules reproduisent exactement la logique du
 * manuel source : barycentre de la VMA, corde contre courbe (C et PRM),
 * investissement optimal A*, assurance optimale C*, courbe en S de
 * Kahneman–Tversky et répétition d'un pari favorable (binomiale).
 */
import { useEffect, useState, type ReactNode } from "react";
import { CheckCheck, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InteractiveCard,
  SliderControl,
  ChoiceChips,
} from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers numériques (identiques au manuel source)                    */
/* ------------------------------------------------------------------ */

/** Format français : décimales utiles, virgule. */
export function fmt(v: number, d = 2): string {
  if (!Number.isFinite(v)) return "—";
  let s = v.toFixed(d);
  if (d > 0) s = s.replace(/\.?0+$/, "");
  return s.replace(".", ",");
}

export function eur(v: number, d = 2): string {
  return `${fmt(v, d)} €`;
}

type Fn = (w: number) => number;

/** Recherche ternaire du maximum de f sur [a, b] (portée du source). */
function ternMax(f: Fn, a: number, b: number): number {
  let lo = a;
  let hi = b;
  for (let i = 0; i < 90; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (f(m1) < f(m2)) lo = m1;
    else hi = m2;
  }
  return (lo + hi) / 2;
}

/* ------------------------------------------------------------------ */
/* Infrastructure de tracé SVG                                         */
/* ------------------------------------------------------------------ */

const INK = "var(--color-foreground)";
const SOFT = "#8a8a93";
const GREEN = "#059669";
const RED = "#e11d48";
const BLUE = "#4f46e5";
const GOLD = "#d97706";
const GUIDE = "#a1a1aa";

interface PlotCfg {
  w?: number;
  h?: number;
  pL?: number;
  pR?: number;
  pT?: number;
  pB?: number;
  x: [number, number];
  y: [number, number];
}

interface Plot {
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
  X: (v: number) => number;
  Y: (v: number) => number;
}

function makePlot(cfg: PlotCfg): Plot {
  const w = cfg.w ?? 640;
  const h = cfg.h ?? 360;
  const pL = cfg.pL ?? 52;
  const pR = cfg.pR ?? 16;
  const pT = cfg.pT ?? 18;
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

function curvePath(p: Plot, f: Fn, a: number, b: number, n = 160): string {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    d += (i ? "L" : "M") + p.X(x).toFixed(1) + " " + p.Y(f(x)).toFixed(1);
  }
  return d;
}

function Frame({
  p,
  xticks,
  yticks,
  xfmt,
  yfmt,
  xlabel,
  ylabel,
  crossAxes,
}: {
  p: Plot;
  xticks?: number[];
  yticks?: number[];
  xfmt?: (t: number) => string;
  yfmt?: (t: number) => string;
  xlabel?: string;
  ylabel?: string;
  crossAxes?: boolean;
}) {
  const xAxisY = crossAxes && p.y0 < 0 && p.y1 > 0 ? p.Y(0) : p.h - p.pB;
  const yAxisX = crossAxes && p.x0 < 0 && p.x1 > 0 ? p.X(0) : p.pL;
  return (
    <g>
      {(yticks ?? []).map((t) => (
        <g key={`y${t}`}>
          <line
            x1={p.pL}
            y1={p.Y(t)}
            x2={p.w - p.pR}
            y2={p.Y(t)}
            stroke={GUIDE}
            strokeWidth={1}
            opacity={0.3}
          />
          <text x={p.pL - 7} y={p.Y(t) + 4} textAnchor="end" fontSize={12} fill={SOFT}>
            {yfmt ? yfmt(t) : String(t)}
          </text>
        </g>
      ))}
      {(xticks ?? []).map((t) => (
        <g key={`x${t}`}>
          <line
            x1={p.X(t)}
            y1={p.h - p.pB}
            x2={p.X(t)}
            y2={p.h - p.pB + 5}
            stroke={SOFT}
            strokeWidth={1.2}
          />
          <text x={p.X(t)} y={p.h - p.pB + 18} textAnchor="middle" fontSize={12} fill={SOFT}>
            {xfmt ? xfmt(t) : String(t)}
          </text>
        </g>
      ))}
      <line
        x1={p.pL}
        y1={xAxisY}
        x2={p.w - p.pR}
        y2={xAxisY}
        stroke={SOFT}
        strokeWidth={1.2}
      />
      <line x1={yAxisX} y1={p.pT} x2={yAxisX} y2={p.h - p.pB} stroke={SOFT} strokeWidth={1.2} />
      {xlabel ? (
        <text
          x={p.w - p.pR}
          y={p.h - 8}
          textAnchor="end"
          fontSize={12}
          fontWeight={600}
          fill={SOFT}
        >
          {xlabel}
        </text>
      ) : null}
      {ylabel ? (
        <text x={p.pL} y={p.pT - 5} textAnchor="start" fontSize={12} fontWeight={600} fill={SOFT}>
          {ylabel}
        </text>
      ) : null}
    </g>
  );
}

function GuideV({ p, x, ytop }: { p: Plot; x: number; ytop: number }) {
  return (
    <line
      x1={p.X(x)}
      y1={p.Y(ytop)}
      x2={p.X(x)}
      y2={p.h - p.pB}
      stroke={GUIDE}
      strokeWidth={1.1}
      strokeDasharray="4 4"
    />
  );
}

function GuideH({ p, y, xr }: { p: Plot; y: number; xr: number }) {
  return (
    <line
      x1={p.pL}
      y1={p.Y(y)}
      x2={p.X(xr)}
      y2={p.Y(y)}
      stroke={GUIDE}
      strokeWidth={1.1}
      strokeDasharray="4 4"
    />
  );
}

function Dot({
  p,
  x,
  y,
  fill,
  r = 4.5,
}: {
  p: Plot;
  x: number;
  y: number;
  fill: string;
  r?: number;
}) {
  return <circle cx={p.X(x)} cy={p.Y(y)} r={r} fill={fill} />;
}

/** Texte SVG avec halo (couleur du fond de carte) pour rester lisible sur les tracés. */
function HaloText({
  x,
  y,
  children,
  anchor = "start",
  size = 12,
  weight = 600,
  fill = INK,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  fill?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      stroke="var(--color-card, #fff)"
      strokeWidth={3.5}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

function PlotSvg({
  p,
  label,
  children,
  maxW = 680,
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

/* ------------------------------------------------------------------ */
/* Ligne de « chips » de lecture (readout du manuel source)            */
/* ------------------------------------------------------------------ */

export function ChipRow({
  chips,
}: {
  chips: Array<{ label: ReactNode; value: ReactNode; hi?: boolean }>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <span
          key={i}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[13px]",
            c.hi
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-card text-muted-foreground",
          )}
        >
          {c.label}{" "}
          <b className={cn("tabular-nums", c.hi ? "" : "text-foreground")}>{c.value}</b>
        </span>
      ))}
    </div>
  );
}

/** Message d'interprétation sous le graphique (w-msg du source). */
export function WidgetMsg({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-t border-dashed pt-2.5 text-[14px] italic leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Sondage d'amphi (poll du manuel source)                             */
/* ------------------------------------------------------------------ */

export function PollCard({
  tag,
  question,
  options,
  resultBars,
  note,
}: {
  tag: string;
  question: ReactNode;
  /** pct : résultat réel des étudiants du cours (omis = pas de barre) */
  options: Array<{ label: ReactNode; pct?: number }>;
  /** barres de résultat supplémentaires (ex. percentile médian) */
  resultBars?: Array<{ label: ReactNode; pct: number }>;
  note?: ReactNode;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const revealed = chosen !== null;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-sky-300/60 bg-card shadow-sm dark:border-sky-700/50">
      <div className="border-b bg-sky-50/70 px-4 py-3 dark:bg-sky-950/30 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          <Vote className="h-4 w-4" aria-hidden />
          {tag}
        </div>
        <div className="mt-1 font-medium">{question}</div>
      </div>
      <div className="grid gap-2.5 px-4 py-4 sm:px-5">
        {options.map((opt, i) => (
          <div key={i}>
            <button
              type="button"
              disabled={revealed}
              onClick={() => setChosen(i)}
              className={cn(
                "w-full rounded-xl border px-3.5 py-2.5 text-left text-[15px] transition-colors",
                !revealed && "hover:border-primary hover:bg-accent/60",
                revealed && chosen === i && "border-primary bg-accent",
                revealed && chosen !== i && "opacity-70",
              )}
            >
              {opt.label}
              {revealed && chosen === i ? (
                <span className="ml-2 text-xs font-semibold text-primary">← ton choix</span>
              ) : null}
            </button>
            {revealed && opt.pct !== undefined ? (
              <div className="mt-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-baseline justify-between text-xs font-medium text-muted-foreground">
                  <span>Réponses des étudiants du cours</span>
                  <span className="font-bold tabular-nums text-foreground">{opt.pct} %</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-sky-600"
                    style={{ width: `${opt.pct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {revealed && resultBars
          ? resultBars.map((b, i) => (
              <div key={`rb${i}`} className="animate-in fade-in slide-in-from-top-1">
                <div className="flex items-baseline justify-between text-xs font-medium text-muted-foreground">
                  <span>{b.label}</span>
                  <span className="font-bold tabular-nums text-foreground">{b.pct} %</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-sky-600"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))
          : null}
        {revealed && note ? (
          <div className="mt-2 rounded-xl border bg-muted/50 px-4 py-3 text-[14.5px] leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-1">
            {note}
          </div>
        ) : null}
        {!revealed ? (
          <p className="text-xs text-muted-foreground">
            Choisis d'abord par instinct — les résultats réels de l'amphi s'affichent ensuite.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Arbre de décision de l'épargnant (SVG statique du source)           */
/* ------------------------------------------------------------------ */

export function DecisionTree() {
  return (
    <figure className="my-6 rounded-2xl border bg-card p-4">
      <svg
        viewBox="0 0 660 250"
        className="mx-auto block h-auto w-full max-w-[620px]"
        role="img"
        aria-label="Arbre de décision de l'épargnant : action risquée ou obligation certaine"
      >
        <circle cx={60} cy={125} r={9} fill={GREEN} />
        <text x={60} y={155} textAnchor="middle" fontSize={14} fontWeight={600} fill={INK}>
          Épargnant
        </text>
        <text x={60} y={172} textAnchor="middle" fontSize={12.5} fill={SOFT}>
          15 $
        </text>
        <path d="M69 118 L235 62" stroke={SOFT} strokeWidth={1.6} fill="none" />
        <path d="M69 132 L235 195" stroke={SOFT} strokeWidth={1.6} fill="none" />
        <text
          x={150}
          y={72}
          textAnchor="middle"
          fontSize={14}
          fill={INK}
          transform="rotate(-18 150 72)"
        >
          achète une action
        </text>
        <text
          x={150}
          y={188}
          textAnchor="middle"
          fontSize={14}
          fill={INK}
          transform="rotate(20 150 188)"
        >
          achète une obligation
        </text>
        <circle cx={243} cy={60} r={6} fill={RED} />
        <path d="M249 56 L430 28" stroke={RED} strokeWidth={1.8} fill="none" />
        <path d="M249 64 L430 96" stroke={RED} strokeWidth={1.8} fill="none" />
        <text x={330} y={26} textAnchor="middle" fontSize={12.5} fill={SOFT}>
          proba 50 % · bons résultats
        </text>
        <text x={330} y={102} textAnchor="middle" fontSize={12.5} fill={SOFT}>
          proba 50 % · mauvais résultats
        </text>
        <text x={445} y={32} fontSize={14} fontWeight={600} fill={INK}>
          Π₁ = 36 $
        </text>
        <text x={445} y={100} fontSize={14} fontWeight={600} fill={INK}>
          Π₂ = 1 $
        </text>
        <path d="M243 197 L430 197" stroke={SOFT} strokeWidth={1.6} fill="none" />
        <text x={445} y={201} fontSize={14} fontWeight={600} fill={INK}>
          Π₃ = 16 $ (certain)
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-[13px] text-muted-foreground">
        Le nœud vert est un <strong>choix</strong> de l'épargnant ; le nœud rouge est un tirage du{" "}
        <strong>hasard</strong>. Au moment de choisir, il ne sait pas quelle branche rouge se
        réalisera.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Widget 1 · La VMA, un barycentre                                    */
/* ================================================================== */

export function WidgetVMA() {
  const [piPct, setPiPct] = useState(50);
  const [y, setY] = useState(36);
  const [x, setX] = useState(1);
  const pi = piPct / 100;
  const vma = pi * y + (1 - pi) * x;

  const p = makePlot({ w: 640, h: 190, pT: 26, pB: 40, x: [0, 55], y: [0, 1] });
  const baseY = p.Y(0.32);
  const rx = 5 + 16 * Math.sqrt(1 - pi);
  const ry = 5 + 16 * Math.sqrt(pi);
  const cx = p.X(vma);
  const r = 8;

  const verdict =
    Math.abs(vma - 16) < 1e-9
      ? "VMA égale à l'obligation (16 $)"
      : vma > 16
        ? "VMA > 16 $ : l'action bat l'obligation en moyenne"
        : "VMA < 16 $ : ici même la moyenne perd contre l'obligation";

  return (
    <InteractiveCard
      title="Widget 1 · La VMA, un barycentre"
      subtitle="La VMA est le centre de gravité des deux réalisations : plus π est grand, plus elle est attirée vers y. La taille des disques représente le poids (la probabilité) de chaque réalisation."
      controls={
        <>
          <SliderControl
            label="π (proba de y)"
            value={piPct}
            onChange={setPiPct}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v} %`}
          />
          <SliderControl
            label="y (réalisation haute)"
            value={y}
            onChange={setY}
            min={20}
            max={50}
            format={(v) => `${v} $`}
          />
          <SliderControl
            label="x (réalisation basse)"
            value={x}
            onChange={setX}
            min={0}
            max={15}
            format={(v) => `${v} $`}
          />
        </>
      }
      footer="Mets π à 0 % puis à 100 % : la VMA glisse de x jusqu'à y. Cherche ensuite une combinaison où la VMA tombe exactement sur 16 $ — l'action et l'obligation deviennent alors équivalentes… en moyenne seulement. (Valeurs de départ = slide 7 : action 36 $ ou 1 $ avec ½ chacune, obligation 16 $.)"
    >
      <PlotSvg p={p} label="La VMA comme barycentre des deux réalisations">
        <Frame p={p} xticks={[0, 10, 16, 20, 30, 40, 50]} xlabel="valeur monétaire ($)" />
        {/* ligne support */}
        <line x1={p.X(0)} y1={baseY} x2={p.X(55)} y2={baseY} stroke={INK} strokeWidth={1.3} opacity={0.7} />
        {/* obligation 16 $ */}
        <line
          x1={p.X(16)}
          y1={baseY - 26}
          x2={p.X(16)}
          y2={baseY + 16}
          stroke={GUIDE}
          strokeWidth={1.1}
          strokeDasharray="4 4"
        />
        <text x={p.X(16)} y={baseY + 30} textAnchor="middle" fontSize={12} fill={INK}>
          obligation 16 $
        </text>
        {/* disques proportionnels aux probabilités */}
        <circle cx={p.X(x)} cy={baseY} r={rx} fill={RED} opacity={0.85} />
        <circle cx={p.X(y)} cy={baseY} r={ry} fill={GREEN} opacity={0.85} />
        <text x={p.X(x)} y={baseY - rx - 7} textAnchor="middle" fontSize={12} fill={INK}>
          x = {fmt(x, 0)}
        </text>
        <text x={p.X(y)} y={baseY - ry - 7} textAnchor="middle" fontSize={12} fill={INK}>
          y = {fmt(y, 0)}
        </text>
        {/* losange VMA */}
        <path
          d={`M${cx} ${baseY - r}L${cx + r} ${baseY}L${cx} ${baseY + r}L${cx - r} ${baseY}Z`}
          fill={BLUE}
        />
        <text
          x={cx}
          y={baseY + r + 16}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={INK}
        >
          VMA = {fmt(vma, 1)} $
        </text>
      </PlotSvg>
      <ChipRow
        chips={[
          {
            label: "VMA =",
            value: `${fmt(pi, 2)} × ${fmt(y, 0)} $ + ${fmt(1 - pi, 2)} × ${fmt(x, 0)} $ = ${fmt(vma, 2)} $`,
          },
          { label: "Verdict :", value: verdict, hi: true },
        ]}
      />
      <WidgetMsg>
        Remarque : l'obligation certaine (16 $) est un cas particulier d'actif « risqué » avec une
        seule réalisation de probabilité 1. Avec les valeurs du slide (π = 50 %, y = 36 $, x = 1 $),
        VMA = 0,5 × 36 + 0,5 × 1 = 18,5 $ &gt; 16 $.
      </WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Widget 2 · Le graphique clé : corde contre courbe                   */
/* ================================================================== */

type Attitude = "averse" | "neutre" | "affine";

const ATTITUDES: Record<Attitude, { f: Fn; inv: Fn; lab: string }> = {
  averse: { f: (w) => Math.sqrt(w), inv: (t) => t * t, lab: "u(w) = √w" },
  neutre: { f: (w) => w / 20, inv: (t) => 20 * t, lab: "u(w) = w/20" },
  affine: { f: (w) => (w * w) / 8000, inv: (t) => Math.sqrt(8000 * t), lab: "u(w) = w²/8000" },
};

export function WidgetChordCurve() {
  const [att, setAtt] = useState<Attitude>("averse");
  const [z, setZ] = useState(120);
  const [step, setStep] = useState(1);
  const [slide, setSlide] = useState(0); // 0 → 1 : glissement horizontal de U(aᵣ) vers la courbe

  useEffect(() => {
    if (step !== 5) {
      setSlide(step > 5 ? 1 : 0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 1100);
      setSlide(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setSlide(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const W = 220;
  const u = ATTITUDES[att];
  const lo = W - z;
  const hi = W + z;
  const uLo = u.f(lo);
  const uHi = u.f(hi);
  const uW = u.f(W);
  const Uv = 0.5 * uLo + 0.5 * uHi;
  const C = u.inv(Uv);
  const prm = W - C;
  const gap = uW - Uv;
  const ymax = u.f(420) * 1.06;
  const p = makePlot({ w: 520, h: 380, pL: 62, pR: 14, pT: 20, pB: 48, x: [0, 420], y: [0, ymax] });
  const bottom = p.h - p.pB;
  const xMove = W + (C - W) * slide;

  /* étiquettes de l'axe vertical, écartées si elles se chevauchent */
  const yLabs: Array<{ y: number; text: string; color: string }> = [];
  if (step >= 2) {
    yLabs.push({ y: p.Y(uHi), text: "u(w+z)", color: INK });
    yLabs.push({ y: p.Y(uLo), text: "u(w−z)", color: INK });
  }
  if (step >= 3) yLabs.push({ y: p.Y(Uv), text: "U(aᵣ)", color: RED });
  if (step >= 4) yLabs.push({ y: p.Y(uW), text: "u(w)", color: BLUE });
  const spread = [...yLabs].sort((a, b) => a.y - b.y).map((l) => ({ ...l, ty: l.y }));
  for (let i = 1; i < spread.length; i++)
    if (spread[i].ty - spread[i - 1].ty < 13) spread[i].ty = spread[i - 1].ty + 13;

  const shape =
    att === "averse" ? "concave (elle s'aplatit)" : att === "neutre" ? "une droite" : "convexe (elle se redresse)";
  const f2 = (v: number) => fmt(v, 2);
  const steps: Array<[string, string]> = [
    [
      "La courbe et l'actif risqué",
      `La courbe ${u.lab} est ${shape}. L'actif risqué aᵣ donne w − z = ${lo} € ou w + z = ${hi} €, avec ½ chacun : sa VMA vaut w = ${W} €.`,
    ],
    [
      "L'utilité des deux issues",
      `On lit sur la courbe l'utilité de chaque issue : u(w − z) = u(${lo}) ≈ ${f2(uLo)} et u(w + z) = u(${hi}) ≈ ${f2(uHi)}.`,
    ],
    [
      "La corde et son milieu",
      `La corde relie ces deux points. Son milieu, à la verticale de w, vaut ½·u(w − z) + ½·u(w + z) = U(aᵣ) ≈ ${f2(Uv)} : c'est l'utilité espérée de l'actif risqué.`,
    ],
    [
      "u(w) = u(VMA(aᵣ))",
      `Le point de la courbe à la verticale de w donne u(w) = u(VMA(aᵣ)) ≈ ${f2(uW)} : l'utilité de la VMA reçue sans risque. ` +
        (att === "averse"
          ? `Il est AU-DESSUS du milieu de la corde : l'écart ≈ ${f2(gap)} est ce que le risque coûte en utilité. C'est ça, l'aversion au risque : U(aᵣ) < u(VMA(aᵣ)).`
          : att === "neutre"
            ? "Il est confondu avec le milieu de la corde : le risque ne coûte rien."
            : `Il est EN DESSOUS du milieu de la corde : ici le risque rapporte de l'utilité (écart ≈ ${f2(-gap)}).`),
    ],
    [
      "L'équivalent certain C(aᵣ)",
      `Quelle somme SÛRE donne autant d'utilité que l'actif risqué ? On part de U(aᵣ) et on glisse horizontalement jusqu'à la courbe : on tombe en C(aᵣ) ≈ ${fmt(C, 1)} €, défini par U(aᵣ) = u(C(aᵣ)).`,
    ],
    [
      "La prime de risque minimale",
      `PRM(aᵣ) = VMA(aᵣ) − C(aᵣ) ≈ ${W} − ${fmt(C, 1)} = ${fmt(prm, 1)} €. ` +
        (prm > 0.05
          ? "Il n'achète l'actif risqué que si son prix p ≤ C(aᵣ) (slide 23)."
          : prm < -0.05
            ? "Elle est négative : cet individu paierait pour AJOUTER du risque."
            : "Elle est nulle : seul le barycentre (la VMA) compte."),
    ],
  ];
  const btn =
    "rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <InteractiveCard
      title="Widget 2 · Le graphique clé : corde contre courbe"
      subtitle="Slides 21 et 23, construits pas à pas. Actif risqué aᵣ : w − z ou w + z à pile ou face, autour de w = 220 €. Clique sur « Étape suivante », puis fais varier z."
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={btn} onClick={() => setStep((s) => Math.min(6, s + 1))} disabled={step >= 6}>
              Étape suivante →
            </button>
            <button type="button" className={btn} onClick={() => setStep(1)}>
              Recommencer
            </button>
            <button type="button" className={btn} onClick={() => setStep(6)} disabled={step >= 6}>
              Tout afficher
            </button>
          </div>
          <SliderControl
            label="Risque z"
            value={z}
            onChange={setZ}
            min={20}
            max={160}
            step={5}
            format={(v) => `${v} €`}
          />
          <ChoiceChips
            label="Attitude"
            value={att}
            onChange={setAtt}
            options={[
              { value: "averse", label: "Averse · u = √w" },
              { value: "neutre", label: "Neutre · u = w/20" },
              { value: "affine", label: "Affinité · u = w²/8000" },
            ]}
          />
        </>
      }
      footer="Quand z augmente, l'écart u(VMA) − U(aᵣ) grandit, donc la PRM aussi (avec √w : 17,8 € pour z = 120, 34,5 € pour z = 160). Avec une droite (neutre), la corde est sur la courbe : PRM = 0. Avec une courbe convexe (affinité), la PRM devient négative."
    >
      <div className="mb-2 min-h-[4.5rem] rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-[14px] leading-relaxed">
        <b>
          Étape {step}/6 · {steps[step - 1][0]}
        </b>{" "}
        — {steps[step - 1][1]}
      </div>
      <PlotSvg p={p} label="Corde contre courbe : utilité espérée, équivalent certain et prime de risque minimale" maxW={620}>
        <Frame p={p} xlabel="w (€)" ylabel={u.lab} />
        {/* étape 1 : courbe et issues sur l'axe */}
        <path d={curvePath(p, u.f, 2, 420)} fill="none" stroke={BLUE} strokeWidth={2.8} />
        {[lo, W, hi].map((v) => (
          <line key={v} x1={p.X(v)} y1={bottom} x2={p.X(v)} y2={bottom + 5} stroke={SOFT} strokeWidth={1.2} />
        ))}
        <text x={p.X(lo)} y={bottom + 17} textAnchor="middle" fontSize={12} fill={INK}>
          w−z
        </text>
        <text x={p.X(W)} y={bottom + 17} textAnchor="middle" fontSize={12} fill={INK}>
          w
        </text>
        <text x={p.X(hi)} y={bottom + 17} textAnchor="middle" fontSize={12} fill={INK}>
          w+z
        </text>
        <text x={p.X(W)} y={bottom + 31} textAnchor="middle" fontSize={12} fill={INK}>
          = VMA(aᵣ)
        </text>
        {/* étape 2 : u(w−z) et u(w+z) */}
        {step >= 2 ? (
          <g>
            <GuideV p={p} x={lo} ytop={uLo} />
            <GuideV p={p} x={hi} ytop={uHi} />
            <GuideH p={p} y={uLo} xr={lo} />
            <GuideH p={p} y={uHi} xr={hi} />
            <Dot p={p} x={lo} y={uLo} fill={INK} />
            <Dot p={p} x={hi} y={uHi} fill={INK} />
          </g>
        ) : null}
        {/* étape 3 : corde et milieu U(aᵣ) */}
        {step >= 3 ? (
          <g>
            <line x1={p.X(lo)} y1={p.Y(uLo)} x2={p.X(hi)} y2={p.Y(uHi)} stroke={INK} strokeWidth={1.3} />
            <GuideH p={p} y={Uv} xr={W} />
            <GuideV p={p} x={W} ytop={Math.max(Uv, step >= 4 ? uW : Uv)} />
          </g>
        ) : null}
        {/* étape 4 : u(w) = u(VMA(aᵣ)) et l'écart */}
        {step >= 4 ? (
          <g>
            <GuideH p={p} y={uW} xr={W} />
            {Math.abs(p.Y(uW) - p.Y(Uv)) > 2 ? (
              <g stroke={GOLD} strokeWidth={1.6}>
                <line x1={p.X(W) + 8} y1={p.Y(uW)} x2={p.X(W) + 8} y2={p.Y(Uv)} />
                <line x1={p.X(W) + 4} y1={p.Y(uW)} x2={p.X(W) + 8} y2={p.Y(uW)} />
                <line x1={p.X(W) + 4} y1={p.Y(Uv)} x2={p.X(W) + 8} y2={p.Y(Uv)} />
              </g>
            ) : null}
            <HaloText x={p.X(W) + 14} y={p.Y(Math.min(uW, Uv)) + 17} fill={GOLD}>
              {att === "averse" ? "ce que le risque" : att === "neutre" ? "aucun écart :" : "ce que le risque"}
            </HaloText>
            <HaloText x={p.X(W) + 14} y={p.Y(Math.min(uW, Uv)) + 31} fill={GOLD}>
              {att === "averse" ? "coûte en utilité" : att === "neutre" ? "le risque ne coûte rien" : "rapporte en utilité"}
            </HaloText>
            <Dot p={p} x={W} y={uW} fill={BLUE} r={5} />
            <HaloText x={p.X(W) - 8} y={p.Y(uW) - 8} anchor="end" fill={BLUE}>
              u(w) = u(VMA(aᵣ))
            </HaloText>
          </g>
        ) : null}
        {step >= 3 ? <Dot p={p} x={W} y={Uv} fill={RED} r={5} /> : null}
        {/* étape 5 : glissement horizontal jusqu'à la courbe → C(aᵣ) */}
        {step >= 5 ? (
          <g>
            <line x1={p.X(W)} y1={p.Y(Uv)} x2={p.X(xMove)} y2={p.Y(Uv)} stroke={GREEN} strokeWidth={2.4} />
            <Dot p={p} x={xMove} y={Uv} fill={GREEN} r={5.5} />
            {slide >= 0.999 ? (
              <g>
                <GuideV p={p} x={C} ytop={Uv} />
                <HaloText x={p.X(C) + (prm >= 0 ? -5 : 5)} y={bottom - 6} anchor={prm >= 0 ? "end" : "start"} fill={GREEN}>
                  C(aᵣ)
                </HaloText>
                <HaloText x={p.pL + 6} y={p.Y(Uv) + 15} fill={RED}>
                  U(aᵣ) = u(C(aᵣ))
                </HaloText>
              </g>
            ) : null}
          </g>
        ) : null}
        {/* étape 6 : PRM = VMA − C */}
        {step >= 6 && Math.abs(p.X(W) - p.X(C)) > 6 ? (
          <g>
            <line x1={p.X(C)} y1={bottom - 22} x2={p.X(W)} y2={bottom - 22} stroke={RED} strokeWidth={2} />
            <path d={`M${p.X(C)} ${bottom - 22} l${prm >= 0 ? 7 : -7} -4 v8 z`} fill={RED} />
            <path d={`M${p.X(W)} ${bottom - 22} l${prm >= 0 ? -7 : 7} -4 v8 z`} fill={RED} />
            <HaloText x={(p.X(C) + p.X(W)) / 2} y={bottom - 30} anchor="middle" fill={RED}>
              PRM(aᵣ)
            </HaloText>
          </g>
        ) : null}
        {/* étiquettes de l'axe vertical */}
        {spread.map((l) => (
          <g key={l.text}>
            {Math.abs(l.ty - l.y) > 1 ? (
              <line x1={p.pL - 4} y1={l.ty - 4} x2={p.pL} y2={l.y} stroke={l.color} strokeWidth={0.8} />
            ) : null}
            <text x={p.pL - 6} y={l.ty + 4} textAnchor="end" fontSize={12} fontWeight={600} fill={l.color}>
              {l.text}
            </text>
          </g>
        ))}
      </PlotSvg>
      <ChipRow
        chips={[
          ...(step >= 2
            ? [
                { label: "u(w−z) =", value: f2(uLo) },
                { label: "u(w+z) =", value: f2(uHi) },
              ]
            : []),
          ...(step >= 3 ? [{ label: "U(aᵣ) =", value: f2(Uv) }] : []),
          ...(step >= 4 ? [{ label: "u(w) = u(VMA) =", value: f2(uW) }] : []),
          ...(step >= 5 ? [{ label: "C(aᵣ) =", value: eur(C, 1) }] : []),
          ...(step >= 6 ? [{ label: "PRM = VMA − C =", value: eur(prm, 1), hi: true }] : []),
          { label: "VMA = w =", value: eur(W, 0) },
        ]}
      />
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Widget 3 · Investissement : trouver A* à la main                    */
/* ================================================================== */

type UKind = "sqrt" | "ln";
const U_FN: Record<UKind, Fn> = {
  sqrt: (w) => Math.sqrt(w),
  ln: (w) => Math.log(w),
};

export function WidgetInvest() {
  const [kind, setKind] = useState<UKind>("sqrt");
  const [A, setA] = useState(60);

  const u = U_FN[kind];
  const yOf = (a: number) => 160 + 3 * a;
  const xOf = (a: number) => 160 - 0.8 * a;
  const UF = (a: number) => 0.7 * u(yOf(a)) + 0.3 * u(xOf(a));
  /** ∂U/∂A = 0,7·3·u′(y) − 0,3·0,8·u′(x) */
  const up: Fn = kind === "sqrt" ? (w) => 1 / (2 * Math.sqrt(w)) : (w) => 1 / w;
  const dU = (a: number) => 2.1 * up(yOf(a)) - 0.24 * up(xOf(a));

  const y = yOf(A);
  const x = xOf(A);
  const vma = 0.7 * y + 0.3 * x;
  const Uv = UF(A);
  const dNow = dU(A);

  let Astar = ternMax(UF, 0, 160);
  if (UF(160) >= UF(Astar)) Astar = 160;
  if (UF(0) > UF(Astar)) Astar = 0;
  const corner = Astar > 159.5;

  /* gauche : les deux scénarios */
  const p = makePlot({ w: 520, h: 300, x: [0, 160], y: [0, 690] });
  /* droite : la colline U(A) */
  let Umin = Infinity;
  let Umax = -Infinity;
  let dmin = 0;
  let dmax = 0;
  for (let i = 0; i <= 160; i += 2) {
    const v = UF(i);
    if (v < Umin) Umin = v;
    if (v > Umax) Umax = v;
    const d = dU(i);
    if (d < dmin) dmin = d;
    if (d > dmax) dmax = d;
  }
  const pad = (Umax - Umin) * 0.12 + 1e-6;
  const q = makePlot({ w: 520, h: 280, pL: 60, x: [0, 160], y: [Umin - pad, Umax + pad] });
  /* sous la colline : la pente ∂U/∂A */
  const dpad = (dmax - dmin) * 0.14;
  const r = makePlot({ w: 520, h: 210, pL: 60, pT: 20, x: [0, 160], y: [dmin - dpad, dmax + dpad] });

  const sign =
    Math.abs(dNow) < 2e-4
      ? "≈ 0 : on est au sommet de la colline"
      : dNow > 0
        ? "> 0 : investir un euro de plus fait monter U"
        : "< 0 : investir un euro de moins fait monter U";

  const msg =
    kind === "sqrt"
      ? "Avec u = √w, la pente ∂U/∂A reste positive sur tout [0 ; 160] (encore +0,0203 en A = 160) : chaque euro de plus fait monter U, donc le sommet est au bord, A* = 160 € (solution en coin : il investit tout). Normal : chaque euro investi rapporte en moyenne 2,86 € (0,7 × 4 + 0,3 × 0,2), soit un gain net moyen de 1,86 €, et √w est moins averse au risque que ln w."
      : `Avec u = ln w (plus averse), la pente s'annule à l'intérieur : 2,1/(160 + 3A) = 0,24/(160 − 0,8A) ⇒ 336 − 1,68A = 38,4 + 0,72A ⇒ 2,4A = 297,6 ⇒ A* = ${fmt(Astar, 0)} € (y = 532 €, x = 60,8 €). Avant 124, ∂U/∂A > 0 ; après, ∂U/∂A < 0. Il garde ${fmt(160 - Astar, 0)} € « qui dorment » : voilà le mystère du § 1 expliqué rationnellement — plus d'aversion ⇒ plus d'argent au repos.`;

  return (
    <InteractiveCard
      title="Widget 3 · Trouver A* à la main"
      subtitle="Slide 27. En haut : les deux scénarios du portefeuille (le projet réussit avec 70 % : chaque euro investi devient 4 € ; il échoue avec 30 % : chaque euro devient 0,20 €). Au milieu : la « colline » d'utilité espérée U(A). En bas : sa pente ∂U/∂A, sur le même axe. Déplace Â et cherche le sommet, puis change la fonction u."
      controls={
        <>
          <ChoiceChips
            label="Fonction u"
            value={kind}
            onChange={setKind}
            options={[
              { value: "sqrt", label: "u = √w" },
              { value: "ln", label: "u = ln w (plus averse)" },
            ]}
          />
          <SliderControl
            label="Montant investi Â"
            value={A}
            onChange={setA}
            min={0}
            max={160}
            step={2}
            format={(v) => `${v} €`}
          />
        </>
      }
      footer="Le sommet de la colline est exactement là où la pente ∂U/∂A coupe zéro. Avec √w, la pente reste positive jusqu'au bord : A* = 160 € (tout investir). Avec ln w, plus concave, elle coupe zéro en A* = 124 € et 36 € restent « au repos ». Plus l'aversion est forte, plus A* recule."
    >
      <div className="space-y-3">
        <PlotSvg p={p} label="Les deux scénarios du portefeuille selon le montant investi" maxW={560}>
          <Frame
            p={p}
            xticks={[0, 40, 80, 120, 160]}
            yticks={[32, 160, 640]}
            xlabel="A investi (€)"
            ylabel="valeur monétaire (€)"
          />
          <line x1={p.X(0)} y1={p.Y(yOf(0))} x2={p.X(160)} y2={p.Y(yOf(160))} stroke={GREEN} strokeWidth={2.6} />
          <line x1={p.X(0)} y1={p.Y(xOf(0))} x2={p.X(160)} y2={p.Y(xOf(160))} stroke={RED} strokeWidth={2.6} />
          <HaloText x={p.X(158)} y={p.Y(640) - 10} anchor="end" fill={GREEN}>
            Projet réussit (70 %) : y = 160 + 3A
          </HaloText>
          <HaloText x={p.X(30)} y={p.Y(xOf(30)) - 9} fill={RED}>
            Projet échoue (30 %) : x = 160 − 0,8A
          </HaloText>
          <GuideH p={p} y={y} xr={A} />
          <GuideH p={p} y={x} xr={A} />
          <GuideV p={p} x={A} ytop={y} />
          <Dot p={p} x={A} y={y} fill={GREEN} />
          <Dot p={p} x={A} y={x} fill={RED} />
          <HaloText x={p.X(A) - 7} y={p.Y(y) - 8} anchor="end" fill={GREEN}>
            y
          </HaloText>
          <HaloText x={p.X(A) - 7} y={p.Y(x) + 16} anchor="end" fill={RED}>
            x
          </HaloText>
          <HaloText x={p.X(A) + 6} y={p.h - p.pB - 6} fill={INK}>
            Â
          </HaloText>
        </PlotSvg>
        <div className="space-y-3">
          <PlotSvg p={q} label="La colline d'utilité espérée U(A)" maxW={560}>
            <Frame p={q} xticks={[0, 40, 80, 120, 160]} xlabel="A investi (€)" ylabel="U(A) = 0,7·u(y) + 0,3·u(x)" />
            <path d={curvePath(q, UF, 0, 160)} fill="none" stroke={BLUE} strokeWidth={2.8} />
            <GuideV p={q} x={Astar} ytop={UF(Astar)} />
            <Dot p={q} x={Astar} y={UF(Astar)} fill={GOLD} r={6} />
            <HaloText
              x={q.X(Astar) + (corner ? -8 : 0)}
              y={q.Y(UF(Astar)) + (corner ? 22 : -12)}
              anchor={corner ? "end" : "middle"}
            >
              A* = {fmt(Astar, 0)}
              {corner ? " (solution en coin)" : ""}
            </HaloText>
            <Dot p={q} x={A} y={Uv} fill={INK} r={4.5} />
          </PlotSvg>
          <p className="text-center text-[13px] font-semibold text-foreground">
            {kind === "sqrt"
              ? "Pente ∂U/∂A = 0,7·3/(2√(160 + 3A)) − 0,3·0,8/(2√(160 − 0,8A))"
              : "Pente ∂U/∂A = 0,7·3/(160 + 3A) − 0,3·0,8/(160 − 0,8A)"}
          </p>
          <PlotSvg p={r} label="La pente de la colline, dérivée de U par rapport à A" maxW={560}>
            <Frame p={r} xticks={[0, 40, 80, 120, 160]} yticks={[0]} xlabel="A investi (€)" ylabel="∂U/∂A" />
            <line x1={r.pL} y1={r.Y(0)} x2={r.w - r.pR} y2={r.Y(0)} stroke={SOFT} strokeWidth={1.4} />
            <path d={curvePath(r, dU, 0, Astar)} fill="none" stroke={GREEN} strokeWidth={2.6} />
            {!corner ? <path d={curvePath(r, dU, Astar, 160)} fill="none" stroke={RED} strokeWidth={2.6} /> : null}
            {!corner ? (
              <>
                <Dot p={r} x={Astar} y={0} fill={GOLD} r={5} />
                <HaloText x={r.X(Astar)} y={r.Y(0) - 10} anchor="middle" fill={GOLD}>
                  0 en A* = {fmt(Astar, 0)}
                </HaloText>
              </>
            ) : null}
            <line x1={r.X(A)} y1={r.Y(0)} x2={r.X(A)} y2={r.Y(dNow)} stroke={dNow >= 0 ? GREEN : RED} strokeWidth={1.2} strokeDasharray="3 3" />
            <Dot p={r} x={A} y={dNow} fill={dNow >= 0 ? GREEN : RED} r={5.5} />
            <HaloText
              x={r.X(A) + (A > 100 ? -9 : 9)}
              y={r.Y(dNow) + (dNow >= 0 ? -10 : 18)}
              anchor={A > 100 ? "end" : "start"}
              fill={dNow >= 0 ? GREEN : RED}
            >
              {dNow >= 0 ? "+" : "−"}
              {fmt(Math.abs(dNow), 4)}
            </HaloText>
          </PlotSvg>
        </div>
      </div>
      <ChipRow
        chips={[
          { label: "y (réussite) =", value: eur(y, 0) },
          { label: "x (échec) =", value: eur(x, 1) },
          { label: "VMA du portefeuille =", value: eur(vma, 1) },
          { label: "U(Â) =", value: fmt(Uv, 3) },
          { label: `∂U/∂A en Â = ${A} €`, value: sign, hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Widget 4 · Le choix d'assurance de Fatou et Hicham                  */
/* ================================================================== */

export function WidgetInsurance() {
  const [kind, setKind] = useState<UKind>("sqrt");
  const [price, setPrice] = useState<"0.4" | "0.3">("0.4");
  const [C, setC] = useState(20);

  const u = U_FN[kind];
  const pr = price === "0.4" ? 0.4 : 0.3;
  const yOf = (c: number) => 100 - pr * c;
  const xOf = (c: number) => 30 + (1 - pr) * c;
  const UF = (c: number) => 0.7 * u(yOf(c)) + 0.3 * u(xOf(c));

  const y = yOf(C);
  const x = xOf(C);
  const vma = 0.7 * y + 0.3 * x;
  const Uv = UF(C);

  let Cstar = ternMax(UF, 0, 70);
  if (UF(70) >= UF(Cstar)) Cstar = 70;
  if (UF(0) > UF(Cstar)) Cstar = 0;

  const p = makePlot({ w: 520, h: 300, x: [0, 70], y: [0, 110] });

  let Umin = Infinity;
  let Umax = -Infinity;
  for (let i = 0; i <= 70; i++) {
    const v = UF(i);
    if (v < Umin) Umin = v;
    if (v > Umax) Umax = v;
  }
  const pad = (Umax - Umin) * 0.15 + 1e-9;
  const q = makePlot({ w: 520, h: 280, pL: 60, x: [0, 70], y: [Umin - pad, Umax + pad] });

  // Graduations calculées : point d'assurance complète (C = 70) et C* réel.
  const meet = 100 - 70 * pr; // 72 € à 0,40 ; 79 € à 0,30
  const Cr = Math.round(Cstar * 10) / 10;
  const xticks = Cr > 3 && Cr < 67 ? [0, Cr, 70] : [0, 70];
  const hichamSlide = kind === "ln" && pr === 0.4;
  const yS = yOf(Cstar);
  const xS = xOf(Cstar);
  const optLabel = hichamSlide
    ? "C* = 39,6 € · y* = 84,2 € · x* = 53,8 € · VMA = 75,1 € (slide 35)"
    : `C* = ${eur(Cstar, 1)} · y* = ${eur(yS, 1)} · x* = ${eur(xS, 1)} · VMA = ${eur(0.7 * yS + 0.3 * xS, 1)}`;

  const msg =
    pr === 0.4
      ? kind === "sqrt"
        ? "Au prix de marché (0,40 € par € couvert, plus cher que le prix juste 0,30 €), Fatou couvre C* = 14,8 € (slide 35 : y* = 94,1 €, x* = 38,9 €, VMA = 77,5 €). Elle accepte de perdre un peu de VMA (77,5 € au lieu de 79 € sans assurance) pour adoucir le scénario « vol »."
        : "Hicham (ln w) est plus averse au risque que Fatou : au même prix, il couvre beaucoup plus, C* = 39,6 € selon le slide 35. Calcul exact de la condition ∂U/∂C = 0 : 0,28/y = 0,18/x ⇒ 0,24C = 9,6 ⇒ C* = 40 €, d'où y* = 84 €, x* = 54 €, VMA = 75 € (avec C = 39,6 on trouverait VMA = 75,04 €, pas 75,1 €). À l'examen, cite les valeurs du slide : les deux désignent le même optimum."
      : "Prix actuariellement juste (0,30 € = 30 % de risque de vol × 1 €) : le sommet saute à C* = 70 € = valeur du vélo, pour Fatou COMME pour Hicham. Les deux droites se rejoignent à 79 € : même richesse avec ou sans vol, plus aucun risque. C'est le résultat du slide 32 : au prix juste, l'individu averse s'assure complètement.";

  return (
    <InteractiveCard
      title="Widget 4 · Le choix d'assurance de Fatou et Hicham"
      subtitle="Déplace la couverture C, change d'individu, puis passe au prix actuariellement juste (0,30 €) et regarde C* sauter à 70 € — le théorème en action."
      controls={
        <>
          <ChoiceChips
            label="Individu"
            value={kind}
            onChange={setKind}
            options={[
              { value: "sqrt", label: "Fatou · √w" },
              { value: "ln", label: "Hicham · ln w" },
            ]}
          />
          <ChoiceChips
            label="Prix par € couvert"
            value={price}
            onChange={setPrice}
            options={[
              { value: "0.4", label: "0,40 € (marché)" },
              { value: "0.3", label: "0,30 € (juste)" },
            ]}
          />
          <SliderControl
            label="Couverture C"
            value={C}
            onChange={setC}
            min={0}
            max={70}
            step={1}
            format={(v) => `${v} €`}
          />
        </>
      }
      footer="Au prix de marché (0,40 €), Fatou couvre 14,8 € et Hicham 39,6 € (≈ 40 €) : plus d'aversion ⇒ plus de couverture. Au prix juste (0,30 €), C* = 70 € pour les deux (assurance complète) et les deux droites se rejoignent à 79 €."
    >
      <div className="space-y-3">
        <PlotSvg p={p} label="Les deux scénarios du portefeuille selon la couverture C" maxW={560}>
          <Frame
            p={p}
            xticks={xticks}
            xfmt={(t) => fmt(t, 1)}
            yticks={[30, meet, 100]}
            xlabel="couverture C (€)"
            ylabel="valeur du portefeuille (€)"
          />
          <line
            x1={p.X(0)}
            y1={p.Y(yOf(0))}
            x2={p.X(70)}
            y2={p.Y(yOf(70))}
            stroke={GREEN}
            strokeWidth={2.6}
          />
          <line
            x1={p.X(0)}
            y1={p.Y(xOf(0))}
            x2={p.X(70)}
            y2={p.Y(xOf(70))}
            stroke={RED}
            strokeWidth={2.6}
          />
          <HaloText x={p.X(3)} y={p.Y(yOf(3)) - 10} fill={GREEN}>
            Pas de vol (70 %) : y = 100 − {fmt(pr, 1)}C
          </HaloText>
          <HaloText x={p.X(3)} y={p.Y(xOf(3)) + 20} fill={RED}>
            Vol (30 %) : x = 30 + {fmt(1 - pr, 1)}C
          </HaloText>
          <line x1={p.X(70)} y1={p.pT} x2={p.X(70)} y2={p.h - p.pB} stroke={GUIDE} strokeDasharray="4 4" />
          <Dot p={p} x={70} y={meet} fill={INK} r={4} />
          <HaloText x={p.X(70) - 6} y={p.Y(meet) - 28} anchor="end" size={12}>
            assurance complète
          </HaloText>
          <GuideH p={p} y={y} xr={C} />
          <GuideH p={p} y={x} xr={C} />
          <GuideV p={p} x={C} ytop={Math.max(y, x)} />
          <Dot p={p} x={C} y={y} fill={GREEN} />
          <Dot p={p} x={C} y={x} fill={RED} />
          <HaloText x={p.X(C) + 7} y={p.Y(y) - 7} fill={GREEN}>
            y
          </HaloText>
          <HaloText x={p.X(C) + 7} y={p.Y(x) + 16} fill={RED}>
            x
          </HaloText>
        </PlotSvg>
        <PlotSvg p={q} label="La colline d'utilité espérée U(C)" maxW={560}>
          <Frame
            p={q}
            xticks={[0, 20, 40, 60, 70]}
            xlabel="couverture C (€)"
            ylabel="U(C) = 0,7·u(y) + 0,3·u(x)"
          />
          <path d={curvePath(q, UF, 0, 70)} fill="none" stroke={BLUE} strokeWidth={2.8} />
          <GuideV p={q} x={Cstar} ytop={UF(Cstar)} />
          <Dot p={q} x={Cstar} y={UF(Cstar)} fill={GOLD} r={6} />
          <text
            x={q.X(Cstar)}
            y={q.Y(UF(Cstar)) - 12}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill={INK}
          >
            C* = {hichamSlide ? "39,6 (exact : 40)" : fmt(Cstar, 1)}
          </text>
          <Dot p={q} x={C} y={Uv} fill={INK} r={4.5} />
        </PlotSvg>
      </div>
      <ChipRow
        chips={[
          { label: "y (pas de vol) =", value: eur(y, 1) },
          { label: "x (vol) =", value: eur(x, 1) },
          { label: "VMA du portefeuille =", value: eur(vma, 1) },
          { label: "U(C) =", value: fmt(Uv, 3) },
          { label: "Optimum :", value: optLabel, hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Widget 5 · Théorie rationnelle contre théorie des perspectives      */
/* ================================================================== */

/**
 * Slides 38-41. Fonction de la théorie des perspectives utilisée ici :
 * u(w, w_ref) = √(w − w_ref) si w ≥ w_ref, −2·√(w_ref − w) sinon.
 * Le facteur 2 est le « deux fois » du slide 41 : à écart égal d du point
 * de référence, un gain rapporte √d et une perte coûte 2√d.
 */
const LOSS_AVERSION = 2;

function uProspect(w: number, wref: number): number {
  return w >= wref ? Math.sqrt(w - wref) : -LOSS_AVERSION * Math.sqrt(wref - w);
}

const W_SURE = 400;
const W_LO = 300;
const W_HI = 500;

function ProspectPanel({
  title,
  f,
  yr,
  yticks,
  wref,
  kinked,
  aria,
}: {
  title: ReactNode;
  f: Fn;
  yr: [number, number];
  yticks: number[];
  wref: number;
  kinked: boolean;
  aria: string;
}) {
  const p = makePlot({ w: 340, h: 300, pL: 40, pR: 12, pT: 16, pB: 40, x: [200, 600], y: yr });
  const uS = f(W_SURE);
  const uL = 0.5 * f(W_LO) + 0.5 * f(W_HI);
  const uRef = f(wref);
  const sureHigher = uS > uL;
  const slope = 1 / (2 * Math.sqrt(wref)); // pente de √w en w_ref (panneau lisse)
  const top = p.pT;
  const bottom = p.h - p.pB;
  return (
    <div>
      <p className="mb-1 text-center text-[13px] font-semibold text-foreground">{title}</p>
      <PlotSvg p={p} label={aria} maxW={400}>
        {kinked ? (
          <g>
            <rect x={p.pL} y={top} width={p.X(wref) - p.pL} height={bottom - top} fill={RED} opacity={0.07} />
            <rect
              x={p.X(wref)}
              y={top}
              width={p.w - p.pR - p.X(wref)}
              height={bottom - top}
              fill={GREEN}
              opacity={0.07}
            />
            {wref > 260 ? (
              <HaloText x={p.pL + 5} y={top + 14} fill={RED} size={12}>
                pertes
              </HaloText>
            ) : null}
            <HaloText x={p.w - p.pR - 5} y={bottom - 8} anchor="end" fill={GREEN} size={12}>
              gains
            </HaloText>
            <line x1={p.pL} y1={p.Y(0)} x2={p.w - p.pR} y2={p.Y(0)} stroke={GUIDE} strokeDasharray="2 3" />
          </g>
        ) : null}
        <Frame
          p={p}
          xticks={[200, 300, 400, 500, 600]}
          yticks={yticks}
          xfmt={(t) => (t === 200 || t === 600 ? String(t) : `${t} €`)}
          yfmt={(t) => fmt(t, 0)}
        />
        <text x={p.w - p.pR} y={p.h - 6} textAnchor="end" fontSize={12} fontWeight={600} fill={SOFT}>
          w (€)
        </text>
        {/* repères des richesses finales 300, 400, 500 € */}
        {[W_LO, W_SURE, W_HI].map((w) => (
          <line
            key={w}
            x1={p.X(w)}
            y1={bottom}
            x2={p.X(w)}
            y2={p.Y(Math.max(f(w), uL))}
            stroke={GUIDE}
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}
        {/* point de référence (comme au slide 40) */}
        <line x1={p.X(wref)} y1={bottom} x2={p.X(wref)} y2={p.Y(uRef)} stroke={GOLD} strokeWidth={1.3} strokeDasharray="5 4" />
        <line x1={p.pL} y1={p.Y(uRef)} x2={p.X(wref)} y2={p.Y(uRef)} stroke={GOLD} strokeWidth={1.3} strokeDasharray="5 4" />
        {!kinked ? (
          <line
            x1={p.X(wref - 85)}
            y1={p.Y(uRef - 85 * slope)}
            x2={p.X(wref + 85)}
            y2={p.Y(uRef + 85 * slope)}
            stroke={INK}
            strokeWidth={1.2}
          />
        ) : null}
        {kinked ? (
          <>
            <path d={curvePath(p, f, 200, wref, 200)} fill="none" stroke={BLUE} strokeWidth={2.6} />
            <path d={curvePath(p, f, wref, 600, 200)} fill="none" stroke={BLUE} strokeWidth={2.6} />
          </>
        ) : (
          <path d={curvePath(p, f, 200, 600, 160)} fill="none" stroke={BLUE} strokeWidth={2.6} />
        )}
        {/* loterie : corde entre (300, u(300)) et (500, u(500)), milieu en w = 400 */}
        <line x1={p.X(W_LO)} y1={p.Y(f(W_LO))} x2={p.X(W_HI)} y2={p.Y(f(W_HI))} stroke={INK} strokeWidth={1.3} />
        <Dot p={p} x={W_LO} y={f(W_LO)} fill={INK} r={3.5} />
        <Dot p={p} x={W_HI} y={f(W_HI)} fill={INK} r={3.5} />
        <Dot p={p} x={wref} y={uRef} fill={GOLD} r={4.5} />
        <HaloText
          x={p.X(wref) + (wref > 400 ? 7 : -7)}
          y={p.Y(uRef) + (kinked ? (wref > 400 ? -9 : 18) : 18)}
          anchor={wref > 400 ? "start" : "end"}
          fill={GOLD}
          size={12}
        >
          w_ref
        </HaloText>
        <Dot p={p} x={W_SURE} y={uL} fill={RED} r={5} />
        <Dot p={p} x={W_SURE} y={uS} fill={GREEN} r={5} />
        <HaloText x={p.X(W_SURE) + 8} y={p.Y(uS) + (sureHigher ? -8 : 16)} fill={GREEN} size={12}>
          sûr {fmt(uS, 2).replace("-", "−")}
        </HaloText>
        <HaloText x={p.X(W_SURE) + 8} y={p.Y(uL) + (sureHigher ? 16 : -8)} fill={RED} size={12}>
          loterie {fmt(uL, 2).replace("-", "−")}
        </HaloText>
      </PlotSvg>
    </div>
  );
}

export function WidgetProspect() {
  const [frame, setFrame] = useState<"A" | "B">("A");
  const wref = frame === "A" ? 300 : 500;

  const rS = Math.sqrt(W_SURE);
  const rL = 0.5 * Math.sqrt(W_LO) + 0.5 * Math.sqrt(W_HI);
  const pS = uProspect(W_SURE, wref);
  const pL = 0.5 * uProspect(W_LO, wref) + 0.5 * uProspect(W_HI, wref);
  const sureWins = pS > pL;

  const fRat: Fn = (w) => Math.sqrt(w);
  const fPro: Fn = (w) => uProspect(w, wref);

  const msg =
    frame === "A"
      ? `Étrennes A (w_ref = 300 €) : 400 € = gain de 100 €, 500 € = gain de 200 €, 300 € = rien. Tout se joue côté gains, où la courbe est concave : la corde passe sous la courbe. Sûr : √100 = 10 ; loterie : ½·√200 + ½·0 ≈ ${fmt(pL, 2)}. L'option sûre gagne, comme dans l'amphi (68 % choisissent A1).`
      : `Étrennes B (w_ref = 500 €) : 400 € = perte de 100 €, 300 € = perte de 200 €, 500 € = rien. Tout se joue côté pertes, où la courbe est convexe : la corde passe AU-DESSUS de la courbe. Sûr : −2·√100 = −20 ; loterie : ½·(−2·√200) + ½·0 ≈ ${fmt(pL, 2).replace("-", "−")}. La loterie gagne, comme dans l'amphi (28 % seulement choisissent B1, donc 72 % la loterie).`;

  return (
    <InteractiveCard
      title="Widget 5 · Rationnel contre perspectives : les étrennes"
      subtitle="Les deux versions de l'expérience mènent aux MÊMES richesses finales : 400 € certains (option sûre) ou 300 € / 500 € à pile ou face (loterie). Seul le point de référence w_ref change. Premier panneau : l'Econo de la théorie rationnelle (u(w) = √w) ; second panneau : l'Humain de la théorie des perspectives (u(w, w_ref) = √(w − w_ref) au-dessus de w_ref, −2·√(w_ref − w) en dessous)."
      controls={
        <ChoiceChips
          label="Point de référence (étrennes reçues)"
          value={frame}
          onChange={setFrame}
          options={[
            { value: "A", label: "A · w_ref = 300 €" },
            { value: "B", label: "B · w_ref = 500 €" },
          ]}
        />
      }
      footer="Théorie rationnelle : changer w_ref ne change rien — la courbe ne bouge pas et l'option sûre gagne toujours (20 > 19,84). Théorie des perspectives : toute la courbe glisse avec w_ref : la même richesse finale de 400 € est un gain de 100 € (partie concave) avec w_ref = 300 €, puis une perte de 100 € (partie convexe) avec w_ref = 500 €. Le verdict s'inverse."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ProspectPanel
          title="Théorie rationnelle · u(w) = √w"
          f={fRat}
          yr={[13, 25.5]}
          yticks={[15, 20, 25]}
          wref={wref}
          kinked={false}
          aria="Théorie rationnelle : courbe u(w) = √w lisse, qui ne bouge pas quand le point de référence change"
        />
        <ProspectPanel
          title="Théorie des perspectives · u(w, w_ref)"
          f={fPro}
          yr={[-36, 20]}
          yticks={[-30, -20, -10, 0, 10]}
          wref={wref}
          kinked
          aria="Théorie des perspectives : courbe concave au-dessus du point de référence, convexe en dessous, avec un coude au point de référence"
        />
      </div>
      <ChipRow
        chips={[
          {
            label: "Rationnel :",
            value: `sûr ${fmt(rS, 2)} > loterie ${fmt(rL, 2)} → sûr (A et B)`,
          },
          {
            label: `Perspectives (w_ref = ${wref} €) :`,
            value: `sûr ${fmt(pS, 2).replace("-", "−")} ${sureWins ? ">" : "<"} loterie ${fmt(pL, 2).replace("-", "−")}`,
          },
          {
            label: "Verdict de l'Humain :",
            value: sureWins ? "l'option sûre" : "la loterie",
            hi: true,
          },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
      <WidgetMsg>
        Aversion à la perte (slide 41) : à écart égal du point de référence, une perte pèse deux
        fois plus qu'un gain. Avec cette fonction, 100 € de gain valent √100 = +10, 100 € de perte
        valent −2·√100 = −20 ; pour le premier euro : +1 contre −2. D'où le coude de la courbe des
        perspectives en w_ref (aucun coude pour la courbe rationnelle : une seule tangente, comme
        au slide 40).
      </WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Widget 6 · Répéter un pari favorable                                */
/* ================================================================== */

/** Coefficients binomiaux C(n, k) pour k = 0…n. */
function binomCoeffs(n: number): number[] {
  const c = [1];
  for (let k = 1; k <= n; k++) c[k] = (c[k - 1] * (n - k + 1)) / k;
  return c;
}

/** P(finir en perte) pour n paris « +G si pile, −L si face » avec une pièce équilibrée. */
function lossProb(n: number, G: number, L: number): number {
  const c = binomCoeffs(n);
  const tot = Math.pow(2, n);
  let s = 0;
  for (let k = 0; k <= n; k++) if (G * k - L * (n - k) < 0) s += c[k] / tot;
  return s;
}

const REPEAT_NMAX = 30;
/** Rapport 2 contre 1 dans les deux cas (+10/−5 € et +2/−1 M$) : même courbe P(perte). */
const LOSS_CURVE = Array.from({ length: REPEAT_NMAX }, (_, i) => lossProb(i + 1, 10, 5));

export function WidgetRepeatBet() {
  const [mode, setMode] = useState<"piece" | "thaler">("piece");
  const [nCoin, setNCoin] = useState(1);
  const thaler = mode === "thaler";
  const n = thaler ? 23 : nCoin;
  const G = thaler ? 2 : 10;
  const L = thaler ? 1 : 5;
  const money = (v: number, d = 1) => (thaler ? `${fmt(v, d)} M$` : eur(v, d));

  const coeffs = binomCoeffs(n);
  const tot = Math.pow(2, n);
  const probs: number[] = [];
  const gains: number[] = [];
  let pmax = 0;
  let ploss = 0;
  let pzero = 0;
  let perceived = 0; // valeur perçue : gains × 1, pertes × 2
  for (let k = 0; k <= n; k++) {
    const pr = coeffs[k] / tot;
    const g = G * k - L * (n - k);
    probs.push(pr);
    gains.push(g);
    if (pr > pmax) pmax = pr;
    if (g < 0) ploss += pr;
    if (g === 0) pzero += pr;
    perceived += pr * (g >= 0 ? g : 2 * g);
  }
  const vma = (n * (G - L)) / 2;
  const gmin = -L * n;
  const gmax = G * n;
  const step = G + L;

  const p = makePlot({
    w: 520,
    h: 270,
    pL: 46,
    pR: 14,
    pT: 24,
    pB: 40,
    x: [gmin - step * 0.6, gmax + step * 0.6],
    y: [0, pmax * 1.2],
  });
  const bw = Math.max(2, Math.min(30, (p.X(step) - p.X(0)) * 0.72));
  let xticks: number[];
  if (n <= 4) xticks = gains;
  else {
    const cands = thaler ? [5, 10, 20] : [15, 30, 45, 60, 75, 150];
    const c = cands.find((v) => (gmax - gmin) / v <= 7) ?? cands[cands.length - 1];
    xticks = [];
    for (let t = Math.ceil(gmin / c) * c; t <= gmax; t += c) xticks.push(t);
  }

  // Petit graphe : P(perte) en fonction de n
  const q = makePlot({ w: 520, h: 210, pL: 46, pR: 14, pT: 22, pB: 38, x: [0, REPEAT_NMAX + 1], y: [0, 55] });
  const allPts = LOSS_CURVE.map((v, i) => `${q.X(i + 1).toFixed(1)},${q.Y(100 * v).toFixed(1)}`).join(" ");
  const triPts = LOSS_CURVE.map((v, i) => [i + 1, v] as const)
    .filter(([m]) => m % 3 === 0)
    .map(([m, v]) => `${q.X(m).toFixed(1)},${q.Y(100 * v).toFixed(1)}`)
    .join(" ");
  const pNow = 100 * LOSS_CURVE[n - 1];

  let msg: string;
  if (thaler) {
    msg = `Thaler (slide 48) : 23 projets indépendants qui rapportent +2 M$ ou font perdre 1 M$, à pile ou face. Pris un par un, chacun fait peur (50 % de risque de perdre 1 M$) : seuls 3 cadres sur 23 l'acceptent. Pris ensemble : VMA = 23 × 0,5 = 11,5 M$ et P(perte sur l'ensemble) = ${fmt(100 * ploss, 2)} % < 5 %. Le CEO, qui regarde le portefeuille entier, veut les 23 projets.`;
  } else if (n === 1) {
    msg = "Proposition A, un pari isolé : 50 % de risque de perdre 5 €. Avec une aversion à la perte (pertes comptées deux fois), sa valeur perçue est ½ × 10 − 2 × ½ × 5 = 0 € : aucun attrait. C'est le cadrage étroit : on juge ce pari seul, sans penser aux autres.";
  } else if (n % 3 === 0) {
    msg = `n = ${n} est un multiple de 3 : avec exactement ${n / 3} pile${n / 3 > 1 ? "s" : ""}, on gagne 15 × ${n / 3} − 5 × ${n} = 0 € (barre grise, probabilité ${fmt(100 * pzero, 1)} %). Ce cas n'est pas une perte, d'où un creux : P(perte) = ${fmt(100 * ploss, 1)} %.`;
  } else if (n % 3 === 1) {
    const k0 = (n - 1) / 3;
    msg =
      `P(perte) remonte (${fmt(100 * ploss, 1)} %) : avec ${k0} pile${k0 > 1 ? "s" : ""}, on avait 0 € avec un pari de moins ; avec ce pari en plus (face), ce cas devient une perte de 5 €.` +
      (n === 10
        ? " C'est la proposition B : VMA = 25 €, mais P(perte) = 17,2 %, PLUS qu'avec 3 paris (12,5 %). La baisse n'est nette que sur les multiples de 3 ou pour de grands n."
        : "");
  } else {
    msg = `Avec ${n} paris : VMA = ${eur(vma, 1)} et P(perte) = ${fmt(100 * ploss, 1)} %. Aucun gain nul n'est possible ici (n n'est pas un multiple de 3).`;
  }

  return (
    <InteractiveCard
      title="Widget 6 · Répéter un pari favorable"
      subtitle="Pari du slide 44 : pile, tu gagnes 10 € ; face, tu perds 5 €. Proposition A = 1 pari, proposition B = 10 paris. En haut : la distribution du gain total (vert : gain, gris : gain nul, rouge : perte). En bas : la probabilité de finir en perte pour n = 1 à 30."
      controls={
        <>
          <ChoiceChips
            label="Situation"
            value={mode}
            onChange={setMode}
            options={[
              { value: "piece", label: "Pièce : +10 € / −5 €" },
              { value: "thaler", label: "Thaler : 23 projets +2 M$ / −1 M$" },
            ]}
          />
          {!thaler ? (
            <SliderControl
              label="Nombre de paris n"
              value={nCoin}
              onChange={setNCoin}
              min={1}
              max={REPEAT_NMAX}
              step={1}
              format={(v) => String(v)}
            />
          ) : null}
        </>
      }
      footer="La VMA grimpe régulièrement (2,5 € par pari), mais P(perte) fait un zigzag : un creux pour n = 3, 6, 9… (un gain nul y est possible), un pic juste après. Sur les multiples de 3, elle baisse régulièrement (12,5 % → 10,9 % → 9,0 %…) et elle tend vers 0 quand n devient grand (2,1 % à n = 30)."
    >
      <PlotSvg p={p} label="Distribution du gain total pour n paris répétés" maxW={620}>
        <Frame
          p={p}
          xticks={xticks}
          xfmt={(t) => fmt(t, 0)}
          xlabel={thaler ? "gain total (M$)" : "gain total (€)"}
          ylabel="probabilité"
        />
        {gains.map((g, k) => {
          const prK = probs[k];
          const fill = g > 0 ? GREEN : g < 0 ? RED : "#71717a";
          const x0 = p.X(g) - bw / 2;
          const y0 = p.Y(prK);
          const hh = Math.max(p.Y(0) - y0, 0);
          return (
            <g key={k}>
              <rect x={x0} y={y0} width={bw} height={hh} rx={2} fill={fill} opacity={0.85} />
              {!thaler && n <= 6 ? (
                <text x={p.X(g)} y={y0 - 6} textAnchor="middle" fontSize={12} fill={INK}>
                  {fmt(prK * 100, 1)} %
                </text>
              ) : null}
            </g>
          );
        })}
        <line x1={p.X(0)} y1={p.pT} x2={p.X(0)} y2={p.h - p.pB} stroke={GUIDE} strokeWidth={1.1} strokeDasharray="4 4" />
      </PlotSvg>
      <ChipRow
        chips={[
          { label: `VMA totale = ${thaler ? "23 × 0,5" : `2,5 × ${n}`} =`, value: money(vma, 2) },
          { label: "P(finir en perte) =", value: `${fmt(ploss * 100, thaler ? 2 : 1)} %`, hi: true },
          ...(pzero > 0 ? [{ label: "P(gain nul) =", value: `${fmt(pzero * 100, 1)} %` }] : []),
          { label: "Valeur perçue si pertes × 2 :", value: money(perceived, 2) },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
      <p className="mt-4 mb-1 text-center text-[13px] font-semibold text-foreground">
        Probabilité de finir en perte selon le nombre de paris n
      </p>
      <PlotSvg p={q} label="Probabilité de finir en perte en fonction du nombre de paris : zigzag qui tend vers zéro" maxW={620}>
        <Frame
          p={q}
          xticks={[1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30]}
          yticks={[0, 10, 20, 30, 40, 50]}
          yfmt={(t) => `${t} %`}
          xlabel="n"
        />
        <polyline points={allPts} fill="none" stroke={SOFT} strokeWidth={1.2} />
        <polyline points={triPts} fill="none" stroke={GOLD} strokeWidth={1.6} strokeDasharray="5 4" />
        {LOSS_CURVE.map((v, i) => (
          <circle
            key={i}
            cx={q.X(i + 1)}
            cy={q.Y(100 * v)}
            r={(i + 1) % 3 === 0 ? 3.8 : 2.6}
            fill={(i + 1) % 3 === 0 ? GOLD : SOFT}
          />
        ))}
        <line x1={q.X(n)} y1={q.pT} x2={q.X(n)} y2={q.h - q.pB} stroke={BLUE} strokeWidth={1.1} strokeDasharray="3 3" />
        <circle cx={q.X(n)} cy={q.Y(pNow)} r={6.5} fill="none" stroke={BLUE} strokeWidth={2} />
        <HaloText
          x={q.X(n) + (n < 20 ? 9 : -9)}
          y={q.pT + 10}
          anchor={n < 20 ? "start" : "end"}
          fill={BLUE}
        >
          n = {n} : {fmt(pNow, thaler ? 2 : 1)} %
        </HaloText>
      </PlotSvg>
      <p className="mt-1 text-center text-[12.5px] leading-snug text-muted-foreground">
        Points dorés : n multiple de 3. Repères : n = 3 → 12,5 % ; n = 10 (proposition B) → 17,2 % ;
        n = 20 → 5,8 % ; n = 30 → 2,1 %.
        {thaler ? " Thaler a le même rapport 2 contre 1 (+2 / −1) que la pièce (+10 / −5) : la courbe est la même, n = 23 → 4,66 %." : ""}
      </p>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Checklist de fin de chapitre                                        */
/* ================================================================== */

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
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCheck className="h-4 w-4" aria-hidden />
          Coche honnêtement — tout ce qui reste décoché te dit où retourner
        </span>
        <span className="tabular-nums">
          {done.size} / {items.length} points maîtrisés
          {done.size === items.length ? " — chapitre bouclé !" : ""}
        </span>
      </div>
      <div className="grid gap-2">
        {items.map((item, i) => {
          const isDone = done.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-card px-4 py-2.5 text-left transition-colors hover:border-primary/50",
                isDone && "border-success/50 bg-emerald-50/50 dark:bg-emerald-950/20",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-white transition-colors",
                  isDone ? "border-success bg-success" : "border-muted-foreground/40 bg-card",
                )}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden>
                    <path
                      d="M5 12l5 5 9-11"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span
                className={cn(
                  "text-[14.5px] leading-relaxed",
                  isDone && "text-muted-foreground line-through decoration-muted-foreground/40",
                )}
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
