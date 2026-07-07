/**
 * Chapitre A3 · Décision sous incertitude — widgets interactifs et
 * visualisations. Les formules reproduisent exactement la logique du
 * manuel source : barycentre de la VMA, corde contre courbe (C et PRM),
 * investissement optimal A*, assurance optimale C*, courbe en S de
 * Kahneman–Tversky et répétition d'un pari favorable (binomiale).
 */
import { useState, type ReactNode } from "react";
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
          <text x={p.pL - 7} y={p.Y(t) + 4} textAnchor="end" fontSize={11.5} fill={SOFT}>
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
          <text x={p.X(t)} y={p.h - p.pB + 18} textAnchor="middle" fontSize={11.5} fill={SOFT}>
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
          fontSize={11.5}
          fontWeight={600}
          fill={SOFT}
        >
          {xlabel}
        </text>
      ) : null}
      {ylabel ? (
        <text x={p.pL} y={p.pT - 5} textAnchor="start" fontSize={11.5} fontWeight={600} fill={SOFT}>
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
      ? "VMA égale à l'obligation (16 €)"
      : vma > 16
        ? "VMA > 16 € : l'action bat l'obligation en moyenne"
        : "VMA < 16 € : ici même la moyenne perd contre l'obligation";

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
            format={(v) => `${v} €`}
          />
          <SliderControl
            label="x (réalisation basse)"
            value={x}
            onChange={setX}
            min={0}
            max={15}
            format={(v) => `${v} €`}
          />
        </>
      }
      footer="Mets π à 0 % puis à 100 % : la VMA glisse de x jusqu'à y. Cherche ensuite une combinaison où la VMA tombe exactement sur 16 € — l'action et l'obligation deviennent alors équivalentes… en moyenne seulement."
    >
      <PlotSvg p={p} label="La VMA comme barycentre des deux réalisations">
        <Frame p={p} xticks={[0, 10, 16, 20, 30, 40, 50]} xlabel="valeur monétaire (€)" />
        {/* ligne support */}
        <line x1={p.X(0)} y1={baseY} x2={p.X(55)} y2={baseY} stroke={INK} strokeWidth={1.3} opacity={0.7} />
        {/* obligation 16 € */}
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
          obligation 16 €
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
          VMA = {fmt(vma, 1)}
        </text>
      </PlotSvg>
      <ChipRow
        chips={[
          {
            label: "VMA =",
            value: `${fmt(pi, 2)} × ${fmt(y, 0)} + ${fmt(1 - pi, 2)} × ${fmt(x, 0)} = ${eur(vma, 2)}`,
          },
          { label: "Verdict :", value: verdict, hi: true },
        ]}
      />
      <WidgetMsg>
        Remarque : l'obligation certaine (16 €) est un cas particulier d'actif « risqué » avec une
        seule réalisation de probabilité 1.
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
  const W = 220;
  const u = ATTITUDES[att];
  const lo = W - z;
  const hi = W + z;
  const Uv = 0.5 * u.f(lo) + 0.5 * u.f(hi);
  const C = u.inv(Uv);
  const prm = W - C;
  const ymax = u.f(420) * 1.06;
  const p = makePlot({ w: 640, h: 380, x: [0, 420], y: [0, ymax] });

  const xC = p.X(C);
  const xW = p.X(W);
  const yA = p.h - p.pB - 22;
  const dir = xW > xC ? 1 : -1;

  const msg =
    att === "averse"
      ? `Courbe concave : la corde passe SOUS la courbe, donc U(aᵣ) < u(VMA) et C < VMA. La PRM (${eur(prm, 1)}) grandit avec z — teste-le.`
      : att === "neutre"
        ? "Courbe droite : la corde est confondue avec la courbe. C = VMA exactement, PRM = 0 quel que soit z : seul le barycentre compte."
        : `Courbe convexe : la corde passe AU-DESSUS de la courbe, donc C > VMA et la « prime » devient négative (${eur(prm, 1)}) : cet individu paierait pour AJOUTER du risque.`;

  return (
    <InteractiveCard
      title="Widget 2 · Le graphique clé : corde contre courbe"
      subtitle="Actif risqué : w−z ou w+z à 50/50, autour de w = 220 €. Change l'attitude et l'ampleur du risque z, puis observe C(aᵣ) et la PRM."
      controls={
        <>
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
          <SliderControl
            label="Risque z"
            value={z}
            onChange={setZ}
            min={20}
            max={160}
            step={5}
            format={(v) => `${v} €`}
          />
        </>
      }
      footer="Quand u est concave, la corde passe sous la courbe : C recule sous la VMA et l'écart entre les deux, c'est la PRM. Augmente z : la PRM gonfle. Passe en « neutre » : elle reste à 0 quel que soit z. Passe en « affinité » : elle devient négative."
    >
      <PlotSvg p={p} label="Corde contre courbe : équivalent certain et prime de risque">
        <Frame
          p={p}
          xticks={[0, 100, 200, 300, 400]}
          xlabel="richesse w (€)"
          ylabel={u.lab}
        />
        {/* courbe u */}
        <path d={curvePath(p, u.f, 2, 420)} fill="none" stroke={BLUE} strokeWidth={2.8} />
        {/* corde */}
        <line
          x1={p.X(lo)}
          y1={p.Y(u.f(lo))}
          x2={p.X(hi)}
          y2={p.Y(u.f(hi))}
          stroke={INK}
          strokeWidth={1.3}
        />
        <GuideV p={p} x={lo} ytop={u.f(lo)} />
        <GuideV p={p} x={hi} ytop={u.f(hi)} />
        <Dot p={p} x={lo} y={u.f(lo)} fill={INK} />
        <Dot p={p} x={hi} y={u.f(hi)} fill={INK} />
        <text x={p.X(lo)} y={p.h - p.pB + 32} textAnchor="middle" fontSize={12} fill={INK}>
          w−z
        </text>
        <text x={p.X(hi)} y={p.h - p.pB + 32} textAnchor="middle" fontSize={12} fill={INK}>
          w+z
        </text>
        {/* U(ar) : milieu de la corde */}
        <GuideH p={p} y={Uv} xr={W} />
        <GuideV p={p} x={W} ytop={Uv} />
        <Dot p={p} x={W} y={Uv} fill={RED} />
        <text x={p.pL + 6} y={p.Y(Uv) - 7} fontSize={12} fontWeight={600} fill={INK}>
          U(aᵣ)
        </text>
        <text x={p.X(W)} y={p.h - p.pB + 32} textAnchor="middle" fontSize={12} fill={INK}>
          VMA = {W}
        </text>
        {/* C : sur la courbe à hauteur Uv */}
        <Dot p={p} x={C} y={Uv} fill={GREEN} r={5} />
        <GuideV p={p} x={C} ytop={Uv} />
        <text
          x={p.X(C)}
          y={p.pT + 12}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={INK}
        >
          C = {fmt(C, 1)}
        </text>
        {/* double flèche PRM */}
        {Math.abs(prm) > 1.5 ? (
          <g>
            <line x1={xC} y1={yA} x2={xW} y2={yA} stroke={GOLD} strokeWidth={2} />
            <path d={`M${xC} ${yA} l${7 * dir} -4 v8 z`} fill={GOLD} />
            <path d={`M${xW} ${yA} l${-7 * dir} -4 v8 z`} fill={GOLD} />
            <text
              x={(xC + xW) / 2}
              y={yA - 8}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill={INK}
            >
              PRM
            </text>
          </g>
        ) : null}
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "VMA =", value: eur(W, 0) },
          { label: "U(aᵣ) =", value: fmt(Uv, 2) },
          { label: "C(aᵣ) =", value: eur(C, 1) },
          { label: "PRM =", value: eur(prm, 1), hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
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

  const y = yOf(A);
  const x = xOf(A);
  const vma = 0.7 * y + 0.3 * x;
  const Uv = UF(A);

  let Astar = ternMax(UF, 0, 160);
  if (UF(160) >= UF(Astar)) Astar = 160;
  if (UF(0) > UF(Astar)) Astar = 0;

  /* gauche : les deux scénarios */
  const p = makePlot({ w: 520, h: 340, x: [0, 160], y: [0, 660] });
  /* droite : la colline U(A) */
  let Umin = Infinity;
  let Umax = -Infinity;
  for (let i = 0; i <= 160; i += 2) {
    const v = UF(i);
    if (v < Umin) Umin = v;
    if (v > Umax) Umax = v;
  }
  const pad = (Umax - Umin) * 0.12 + 1e-6;
  const q = makePlot({ w: 520, h: 340, pL: 60, x: [0, 160], y: [Umin - pad, Umax + pad] });

  const msg =
    kind === "sqrt"
      ? "Avec u = √w, la pente ∂U/∂A reste positive sur tout [0, 160] : le sommet est au bord, A* = 160 €. Cet individu, pourtant averse au risque, investit TOUTE sa richesse — la prime offerte (VMA de 2,86 € par € investi) est énorme."
      : `Avec u = ln w (aversion plus forte), la colline a un vrai sommet intérieur : A* = ${fmt(Astar, 0)} €. Il garde ${fmt(160 - Astar, 0)} € « qui dorment » : voilà le mystère de la § 1 expliqué rationnellement — plus d'aversion ⇒ plus d'argent au repos.`;

  return (
    <InteractiveCard
      title="Widget 3 · Trouver A* à la main"
      subtitle="À gauche : les deux scénarios du portefeuille. À droite : la « colline » d'utilité espérée U(A). Déplace A et cherche le sommet, puis change la fonction u."
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
            label="Montant investi A"
            value={A}
            onChange={setA}
            min={0}
            max={160}
            step={2}
            format={(v) => `${v} €`}
          />
        </>
      }
      footer="Avec √w, le sommet de la colline est au bord : A* = 160 € (tout investir). Avec ln w, plus concave, le sommet devient intérieur : A* = 124 € et 36 € restent « au repos ». Plus l'aversion est forte, plus A* recule."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <PlotSvg p={p} label="Les deux scénarios du portefeuille selon A" maxW={520}>
          <Frame
            p={p}
            xticks={[0, 40, 80, 120, 160]}
            yticks={[160, 320, 480, 640]}
            xlabel="A investi (€)"
            ylabel="valeur du portefeuille (€)"
          />
          <line
            x1={p.X(0)}
            y1={p.Y(yOf(0))}
            x2={p.X(160)}
            y2={p.Y(yOf(160))}
            stroke={GREEN}
            strokeWidth={2.6}
          />
          <line
            x1={p.X(0)}
            y1={p.Y(xOf(0))}
            x2={p.X(160)}
            y2={p.Y(xOf(160))}
            stroke={RED}
            strokeWidth={2.6}
          />
          <text
            x={p.X(120)}
            y={p.Y(yOf(120)) - 10}
            textAnchor="end"
            fontSize={12}
            fontWeight={600}
            fill={INK}
          >
            y = 160 + 3A (70 %)
          </text>
          <text x={p.X(120)} y={p.Y(xOf(120)) + 18} textAnchor="end" fontSize={12} fill={INK}>
            x = 160 − 0,8A (30 %)
          </text>
          <GuideV p={p} x={A} ytop={y} />
          <Dot p={p} x={A} y={y} fill={GREEN} />
          <Dot p={p} x={A} y={x} fill={RED} />
        </PlotSvg>
        <PlotSvg p={q} label="La colline d'utilité espérée U(A)" maxW={520}>
          <Frame
            p={q}
            xticks={[0, 40, 80, 120, 160]}
            xlabel="A investi (€)"
            ylabel="U(A) = 0,7·u(y) + 0,3·u(x)"
          />
          <path d={curvePath(q, UF, 0, 160)} fill="none" stroke={BLUE} strokeWidth={2.8} />
          <GuideV p={q} x={Astar} ytop={UF(Astar)} />
          <Dot p={q} x={Astar} y={UF(Astar)} fill={GOLD} r={6} />
          <text
            x={q.X(Astar)}
            y={q.Y(UF(Astar)) - 12}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill={INK}
          >
            A* = {fmt(Astar, 0)}
          </text>
          <Dot p={q} x={A} y={Uv} fill={INK} r={4.5} />
        </PlotSvg>
      </div>
      <ChipRow
        chips={[
          { label: "y (réussite) =", value: eur(y, 0) },
          { label: "x (échec) =", value: eur(x, 0) },
          { label: "VMA du portefeuille =", value: eur(vma, 0) },
          { label: "U(A) =", value: fmt(Uv, 3), hi: true },
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

  const p = makePlot({ w: 520, h: 340, x: [0, 70], y: [0, 110] });

  let Umin = Infinity;
  let Umax = -Infinity;
  for (let i = 0; i <= 70; i++) {
    const v = UF(i);
    if (v < Umin) Umin = v;
    if (v > Umax) Umax = v;
  }
  const pad = (Umax - Umin) * 0.15 + 1e-9;
  const q = makePlot({ w: 520, h: 340, pL: 60, x: [0, 70], y: [Umin - pad, Umax + pad] });

  const msg =
    pr === 0.4
      ? kind === "sqrt"
        ? "Au prix de marché (0,40 €, trop cher de 10 centimes), Fatou ne couvre que C* ≈ 14,8 €. L'assurance grignote la VMA : elle en achète juste assez pour calmer le pire scénario."
        : "Hicham (ln w) est plus averse que Fatou : au même prix trop cher, il couvre C* = 40 € — bien plus qu'elle. Plus d'aversion ⇒ plus de couverture."
      : "Prix actuariellement juste p = π = 0,30 € : le sommet saute pile à C* = 70 € = L, pour Fatou COMME pour Hicham. C'est le théorème : au prix juste, tout individu averse s'assure complètement, quelle que soit la force de son aversion.";

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
      footer="Au prix de marché (0,40 €), Fatou couvre C* ≈ 14,8 € et Hicham C* = 40 € : plus d'aversion ⇒ plus de couverture. Bascule sur le prix juste (0,30 €) : C* saute à 70 € pour les deux — c'est le théorème d'assurance complète."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <PlotSvg p={p} label="Les deux scénarios du portefeuille selon la couverture C" maxW={520}>
          <Frame
            p={p}
            xticks={[0, 14.8, 40, 70]}
            xfmt={(t) => fmt(t, 1)}
            yticks={[30, 72, 100]}
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
          <text x={p.X(4)} y={p.Y(yOf(4)) - 10} fontSize={12} fill={INK}>
            y = 100 − {fmt(pr, 1)}C (pas de vol, 70 %)
          </text>
          <text x={p.X(4)} y={p.Y(xOf(4)) + 20} fontSize={12} fill={INK}>
            x = 30 + {fmt(1 - pr, 1)}C (vol, 30 %)
          </text>
          <Dot p={p} x={70} y={yOf(70)} fill={INK} r={4} />
          <text x={p.X(70) - 6} y={p.Y(yOf(70)) - 12} textAnchor="end" fontSize={12} fill={INK}>
            assurance complète
          </text>
          <GuideV p={p} x={C} ytop={Math.max(y, x)} />
          <Dot p={p} x={C} y={y} fill={GREEN} />
          <Dot p={p} x={C} y={x} fill={RED} />
        </PlotSvg>
        <PlotSvg p={q} label="La colline d'utilité espérée U(C)" maxW={520}>
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
            C* = {fmt(Cstar, 1)}
          </text>
          <Dot p={q} x={C} y={Uv} fill={INK} r={4.5} />
        </PlotSvg>
      </div>
      <ChipRow
        chips={[
          { label: "y (pas de vol) =", value: eur(y, 1) },
          { label: "x (vol) =", value: eur(x, 1) },
          { label: "VMA du portefeuille =", value: eur(vma, 1) },
          { label: "U(C) =", value: fmt(Uv, 3), hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Widget 5 · La courbe en S et l'expérience des étrennes              */
/* ================================================================== */

const KT_ALPHA = 0.88;
const KT_LAMBDA = 2.25;

function ktValue(g: number): number {
  return g >= 0 ? Math.pow(g, KT_ALPHA) : -KT_LAMBDA * Math.pow(-g, KT_ALPHA);
}

export function WidgetProspect() {
  const [frame, setFrame] = useState<"A" | "B">("A");

  const sure = frame === "A" ? 100 : -100;
  const lot = frame === "A" ? 200 : -200;
  const vS = ktValue(sure);
  const vLot = 0.5 * ktValue(lot) + 0.5 * ktValue(0);
  const mid = lot / 2;
  const sureWins = vS > vLot;

  const p = makePlot({ w: 640, h: 400, pL: 60, x: [-260, 260], y: [-330, 140] });

  const msg =
    frame === "A"
      ? `Cadre A (référence 300 €) : tout se joue côté GAINS, où la courbe est concave. La corde passe sous la courbe → v(+100) = ${fmt(vS, 1)} bat la loterie (${fmt(vLot, 1)}). Comme en théorie rationnelle : prudence. 68 % de l'amphi choisit l'option sûre.`
      : `Cadre B (référence 500 €) : les MÊMES richesses finales (400 ou 500/300) sont maintenant codées comme des pertes, où la courbe est convexe. La corde passe AU-DESSUS → la loterie (${fmt(vLot, 1)}) bat la perte sûre (${fmt(vS, 1)}). On « tente de se refaire ». 72 % de l'amphi bascule sur la loterie.`;

  return (
    <InteractiveCard
      title="Widget 5 · La courbe en S et l'expérience des étrennes"
      subtitle="La fonction de valeur de Kahneman & Tversky (calibrage 1992 : v(g) = g^0,88 pour les gains, v(−ℓ) = −2,25·ℓ^0,88 pour les pertes). Bascule entre les deux cadres : les mêmes richesses finales atterrissent d'un côté ou de l'autre du point de référence — et le verdict s'inverse."
      controls={
        <ChoiceChips
          label="Cadre"
          value={frame}
          onChange={setFrame}
          options={[
            { value: "A", label: "A · réf = 300 € (gains)" },
            { value: "B", label: "B · réf = 500 € (pertes)" },
          ]}
        />
      }
      footer="Les deux cadres décrivent exactement les mêmes richesses finales (400 € certains, ou 500/300 à pile ou face). Seul le point de référence change — et le verdict s'inverse : option sûre dans le cadre A, loterie dans le cadre B. Remarque aussi la pente double à gauche de la référence : c'est l'aversion à la perte."
    >
      <PlotSvg p={p} label="La courbe en S de la théorie des perspectives">
        <Frame
          p={p}
          xticks={[-200, -100, 100, 200]}
          xlabel="gain / perte par rapport à la référence (€)"
          crossAxes
        />
        <text x={p.X(0) + 8} y={p.Y(0) - 8} fontSize={12} fontWeight={600} fill={INK}>
          réf.
        </text>
        <path d={curvePath(p, ktValue, -260, 260, 220)} fill="none" stroke={BLUE} strokeWidth={2.8} />
        {/* corde de la loterie */}
        <line
          x1={p.X(0)}
          y1={p.Y(0)}
          x2={p.X(lot)}
          y2={p.Y(ktValue(lot))}
          stroke={INK}
          strokeWidth={1.3}
        />
        <Dot p={p} x={0} y={0} fill={INK} r={3.5} />
        <Dot p={p} x={lot} y={ktValue(lot)} fill={INK} r={3.5} />
        {/* point option sûre */}
        <Dot p={p} x={sure} y={vS} fill={GREEN} r={5.5} />
        <GuideV p={p} x={sure} ytop={vS} />
        <GuideH p={p} y={vS} xr={sure} />
        <text
          x={p.X(sure) + (frame === "A" ? 8 : -8)}
          y={p.Y(vS) - 10}
          textAnchor={frame === "A" ? "start" : "end"}
          fontSize={12}
          fontWeight={600}
          fill={INK}
        >
          option sûre
        </text>
        {/* point loterie (au milieu de la corde) */}
        <Dot p={p} x={mid} y={vLot} fill={RED} r={5.5} />
        <GuideH p={p} y={vLot} xr={mid} />
        <text
          x={p.X(mid) + (frame === "A" ? 8 : -8)}
          y={p.Y(vLot) + 16}
          textAnchor={frame === "A" ? "start" : "end"}
          fontSize={12}
          fontWeight={600}
          fill={INK}
        >
          loterie (½–½)
        </text>
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "Option sûre : v =", value: fmt(vS, 1) },
          { label: "Loterie : ½v(±200) + ½v(0) =", value: fmt(vLot, 1) },
          {
            label: "Verdict :",
            value: sureWins ? "l'option sûre gagne" : "la loterie gagne",
            hi: true,
          },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
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

export function WidgetRepeatBet() {
  const [n, setN] = useState(1);

  const coeffs = binomCoeffs(n);
  const tot = Math.pow(2, n);
  const probs: number[] = [];
  const gains: number[] = [];
  let pmax = 0;
  let ploss = 0;
  for (let k = 0; k <= n; k++) {
    const pr = coeffs[k] / tot;
    const g = 15 * k - 5 * n;
    probs.push(pr);
    gains.push(g);
    if (pr > pmax) pmax = pr;
    if (g < 0) ploss += pr;
  }
  const gmin = -5 * n;
  const gmax = 10 * n;

  const p = makePlot({ w: 640, h: 320, pL: 58, x: [gmin - 8, gmax + 8], y: [0, pmax * 1.18] });
  const bw = Math.min(34, (p.X(15) - p.X(0)) * 0.7);
  const xticks = n <= 4 ? gains : gains.filter((_, i) => i % 2 === 0);

  const msg =
    n === 1
      ? "Un pari isolé : 50 % de risque de perdre. C'est ce 50 % que fixe le cadrage étroit — et que l'aversion à la perte transforme en refus."
      : n <= 3
        ? `Déjà avec ${n} paris, la probabilité de perte tombe à ${fmt(ploss * 100, 1)} % pendant que la VMA monte à ${eur(2.5 * n, 1)}. La masse rouge se fait manger par la verte.`
        : `Avec ${n} paris : VMA = ${eur(2.5 * n, 1)} et seulement ${fmt(ploss * 100, 1)} % de risque de finir en perte. (Petit rebond possible d'un n à l'autre — effet de la grille discrète — mais la tendance est claire.) Qui refuserait ce portefeuille ? Personne. D'où l'incohérence de refuser le pari unitaire en acceptant la série.`;

  return (
    <InteractiveCard
      title="Widget 6 · Répéter un pari favorable"
      subtitle="Distribution du gain total pour n paris « +10 € / −5 € ». Barres vertes : gains ; grise : zéro ; rouges : pertes. Observe la masse rouge fondre quand n augmente — pendant que la VMA grimpe."
      controls={
        <SliderControl
          label="Nombre de paris n"
          value={n}
          onChange={setN}
          min={1}
          max={10}
          step={1}
          format={(v) => String(v)}
        />
      }
      footer="Pousse n de 1 à 10 : la probabilité de finir en perte fond globalement (50 % pour un pari isolé, 12,5 % dès n = 3), avec de petits rebonds dus à la grille discrète, pendant que la VMA grimpe linéairement de 2,50 € à 25 €."
    >
      <PlotSvg p={p} label="Distribution du gain total pour n paris répétés">
        <Frame
          p={p}
          xticks={xticks}
          xfmt={(t) => fmt(t, 0)}
          xlabel="gain total (€)"
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
              <rect x={x0} y={y0} width={bw} height={hh} rx={3} fill={fill} opacity={0.85} />
              {n <= 6 ? (
                <text x={p.X(g)} y={y0 - 6} textAnchor="middle" fontSize={11.5} fill={INK}>
                  {fmt(prK * 100, 1)} %
                </text>
              ) : null}
            </g>
          );
        })}
        {gmin < 0 && gmax > 0 ? (
          <line
            x1={p.X(0)}
            y1={p.pT}
            x2={p.X(0)}
            y2={p.h - p.pB}
            stroke={GUIDE}
            strokeWidth={1.1}
            strokeDasharray="4 4"
          />
        ) : null}
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "VMA totale = 2,5 × n =", value: eur(2.5 * n, 1) },
          { label: "Probabilité de finir en perte =", value: `${fmt(ploss * 100, 1)} %`, hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
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
