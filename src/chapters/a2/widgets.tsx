/**
 * Chapitre A2 · Décision inter-temporelle — composants interactifs et
 * visualisations. Les formules reproduisent exactement la logique du
 * manuel source (widget budget, optimum d'Euler, classifieur de biens…).
 */
import { useState, type ReactNode } from "react";
import { CheckCheck, ChevronRight, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { M } from "@/components/course/Math";
import { InteractiveCard, SliderControl, ChoiceChips } from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Format français : 2 décimales, virgule. */
export function fmtFr(x: number, d = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(d).replace(".", ",");
}

function pctFr(r: number): string {
  return `${Math.round(r * 100)} %`;
}

/* Cadre de tracé identique au manuel source (viewBox 480×380). */
interface Frame {
  L: number;
  R: number;
  T: number;
  B: number;
  XM: number;
  YM: number;
  X: (dx: number) => number;
  Y: (dy: number) => number;
}

function makeFrame(
  XM: number,
  YM: number,
  box: { L: number; R: number; T: number; B: number } = { L: 52, R: 456, T: 28, B: 336 },
): Frame {
  const { L, R, T, B } = box;
  return {
    L,
    R,
    T,
    B,
    XM,
    YM,
    X: (dx: number) => L + (dx / XM) * (R - L),
    Y: (dy: number) => B - (dy / YM) * (B - T),
  };
}

function PlotAxes({ fr, xLabel, yLabel }: { fr: Frame; xLabel: string; yLabel: string }) {
  const ink = "var(--color-foreground)";
  return (
    <g>
      <line x1={fr.L} y1={fr.B} x2={fr.R + 8} y2={fr.B} stroke={ink} strokeWidth={1.6} />
      <line x1={fr.L} y1={fr.B} x2={fr.L} y2={fr.T - 8} stroke={ink} strokeWidth={1.6} />
      <path d={`M${fr.R + 8} ${fr.B} l-7 -4 v8 z`} fill={ink} />
      <path d={`M${fr.L} ${fr.T - 8} l-4 7 h8 z`} fill={ink} />
      <text
        x={fr.R + 4}
        y={fr.B + 20}
        fontSize={14}
        fontStyle="italic"
        fill={ink}
        textAnchor="end"
      >
        {xLabel}
      </text>
      <text
        x={fr.L - 8}
        y={fr.T - 12}
        fontSize={14}
        fontStyle="italic"
        fill={ink}
        textAnchor="middle"
      >
        {yLabel}
      </text>
    </g>
  );
}

/** Texte SVG avec halo (reste lisible par-dessus un tracé), thème clair/sombre. */
function HaloText({
  x,
  y,
  children,
  color = "var(--color-foreground)",
  anchor = "start",
  size = 12,
  weight = 600,
  italic = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  italic?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fontStyle={italic ? "italic" : undefined}
      fill={color}
      stroke="var(--color-card)"
      strokeWidth={3.5}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/* Petits blocs de mise en page                                        */
/* ------------------------------------------------------------------ */

/** Grille de mini-cartes façon « recap-grid » du manuel source. */
export function CardGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={cn("my-5 grid gap-3", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {children}
    </div>
  );
}

export function MiniCard({
  title,
  children,
  tone = "default",
}: {
  title: ReactNode;
  children: ReactNode;
  tone?: "default" | "good" | "bad" | "gold";
}) {
  const tones: Record<string, { frame: string; title: string }> = {
    default: { frame: "border-border bg-muted/40", title: "text-primary" },
    good: { frame: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30", title: "text-emerald-700 dark:text-emerald-400" },
    bad: { frame: "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30", title: "text-rose-700 dark:text-rose-400" },
    gold: { frame: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30", title: "text-amber-700 dark:text-amber-400" },
  };
  const t = tones[tone];
  return (
    <div className={cn("rounded-xl border p-4", t.frame)}>
      <div className={cn("mb-1.5 text-[13.5px] font-bold", t.title)}>{title}</div>
      <div className="text-[14.5px] leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}

/** Panneau de lecture des valeurs calculées (façon « readout » du source). */
export function Readout({ rows }: { rows: Array<{ label: ReactNode; value: ReactNode }> }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-2">
      {rows.map((r, i) => (
        <div
          key={i}
          className={cn(
            "flex items-baseline justify-between gap-3 py-1.5 text-sm text-muted-foreground",
            i < rows.length - 1 && "border-b border-dashed",
          )}
        >
          <span>{r.label}</span>
          <span className="text-[15px] font-bold tabular-nums text-foreground">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Encadré-verdict coloré selon le régime (lissage / présent / futur / neutre). */
export function Verdict({
  tone,
  children,
}: {
  tone: "smooth" | "now" | "later" | "neutral";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    smooth:
      "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    now: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
    later:
      "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
    neutral: "border-border bg-muted text-muted-foreground",
  };
  return (
    <div className={cn("mt-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium leading-relaxed", tones[tone])}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Graphe statique : taux de remplacement OCDE 2017                    */
/* ------------------------------------------------------------------ */

const REPLACEMENT_DATA: Array<[string, number]> = [
  ["RU", 29],
  ["POL", 39],
  ["JPN", 40],
  ["AUS", 42],
  ["CH", 45],
  ["USA", 49],
  ["ALL", 50],
  ["GR", 54],
  ["SUE", 55],
  ["BEL", 66],
  ["FR", 74],
  ["DK", 80],
  ["ESP", 82],
  ["AT", 92],
  ["IT", 93],
  ["PB", 101],
];

export function ReplacementChart() {
  const base = 222;
  const top = 40;
  const left = 18;
  const right = 464;
  const scale = (base - top) / 105;
  const n = REPLACEMENT_DATA.length;
  const slot = (right - left) / n;
  const bw = Math.min(18, slot - 5);
  const color = (v: number) => (v < 50 ? "#e11d48" : v < 67 ? "#059669" : "#4f46e5");

  return (
    <figure className="my-6 rounded-2xl border bg-card p-4 sm:p-5">
      <figcaption className="mb-2 text-center text-[13.5px] font-semibold text-muted-foreground">
        Taux de remplacement net, salarié médian (OCDE 2017)
      </figcaption>
      <svg
        viewBox="0 0 480 250"
        className="mx-auto block h-auto w-full max-w-[520px]"
        role="img"
        aria-label="Taux de remplacement des pensions par pays"
      >
        {[50, 67].map((t) => {
          const y = base - t * scale;
          return (
            <g key={t}>
              <line
                x1={left}
                y1={y}
                x2={right}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text x={right} y={y - 3} fontSize={9.5} fill="var(--color-muted-foreground)" textAnchor="end">
                {t} %
              </text>
            </g>
          );
        })}
        <line x1={left} y1={base} x2={right} y2={base} stroke="var(--color-foreground)" strokeWidth={1.3} />
        {REPLACEMENT_DATA.map(([code, v], i) => {
          const cx = left + i * slot + (slot - bw) / 2;
          const h = v * scale;
          const y = base - h;
          return (
            <g key={code}>
              <rect x={cx} y={y} width={bw} height={h} rx={2} fill={color(v)} />
              <text
                x={cx + bw / 2}
                y={y - 4}
                fontSize={9.5}
                fontWeight={600}
                fill="var(--color-muted-foreground)"
                textAnchor="middle"
              >
                {v}
              </text>
              <text
                x={cx + bw / 2}
                y={base + 13}
                fontSize={8.5}
                fill="var(--color-muted-foreground)"
                textAnchor="middle"
              >
                {code}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
        {[
          { c: "#e11d48", t: "moins de 50 %" },
          { c: "#059669", t: "de 50 à 67 %" },
          { c: "#4f46e5", t: "plus de 67 %" },
        ].map((k) => (
          <span key={k.t} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: k.c }} />
            {k.t}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-[13px] text-muted-foreground">
        <strong>Taux de remplacement</strong> = niveau de la pension (publique + privée
        obligatoire, <em>hors épargne volontaire</em>) rapporté aux revenus de la vie active.
      </p>
      <p className="mt-1 text-center text-[13px] text-muted-foreground">
        De 29 % (Royaume-Uni) à 101 % (Pays-Bas). Plus la barre est courte, plus l'épargne privée
        volontaire doit compenser.
      </p>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 1 : la droite de budget inter-temporelle                     */
/* Formules du source : pv = m0 + m1/(1+r) ; fv = (1+r)m0 + m1         */
/* ------------------------------------------------------------------ */

export function BudgetPlayground() {
  // Dotation des slides 5-7 : on gagne plus en vie active (m0) qu'à la retraite (m1).
  const m0 = 8;
  const m1 = 4;
  const [rPct, setRPct] = useState(0); // 0 → 150 (%)
  const [c0Pick, setC0Pick] = useState(6); // consommation choisie aujourd'hui

  const r = rPct / 100;
  const pv = m0 + m1 / (1 + r); // valeur présente = c0 max
  const fv = (1 + r) * m0 + m1; // valeur future = c1 max
  const c0Max = Math.floor(pv * 10 + 1e-9) / 10;
  const c0 = Math.min(c0Pick, c0Max);
  const s = m0 - c0; // épargne (> 0) ou emprunt (< 0)
  const c1 = m1 + (1 + r) * s; // = fv − (1+r)c0
  const atOmega = Math.abs(s) < 1e-9;

  const fr = makeFrame(13.5, 26, { L: 60, R: 476, T: 44, B: 352 });
  const GREEN = "#059669";
  const ROSE = "#e11d48";
  const tone = atOmega ? "var(--color-foreground)" : s > 0 ? GREEN : ROSE;

  // points de la droite : (0 ; fv) → ω → (pv ; 0)
  const P = (c: number) => ({ x: fr.X(c), y: fr.Y(fv - (1 + r) * c) });
  const top = P(0);
  const om = P(m0);
  const bot = P(pv);
  const slopeAt = P(0.22 * m0);
  const saveAt = P(0.65 * m0);
  const borrowAt = P((m0 + pv) / 2);
  const pick = P(c0);
  const pvX = Math.max(78, Math.min(fr.X(pv), 520 - 78));

  return (
    <InteractiveCard
      title="Joue avec le taux d'intérêt"
      subtitle={
        <>
          Dotation ω = (8 ; 4) : tu gagnes plus pendant ta vie active (8) qu'à la retraite (4).
          Monte <M tex="r" /> et regarde la droite de budget pivoter ; déplace ton choix{" "}
          <M tex="c_0" /> le long de la droite.
        </>
      }
      controls={
        <>
          <SliderControl
            label={<>Taux d'intérêt r</>}
            value={rPct}
            onChange={(v) => {
              setRPct(v);
              const max = Math.floor((m0 + m1 / (1 + v / 100)) * 10 + 1e-9) / 10;
              setC0Pick((c) => Math.min(c, max));
            }}
            min={0}
            max={150}
            step={5}
            format={(v) => `${v} %`}
          />
          <SliderControl
            label={<>c₀ choisi (consommation pendant la vie active)</>}
            value={c0}
            onChange={setC0Pick}
            min={0}
            max={c0Max}
            step={0.1}
            format={(v) => fmtFr(v, 1)}
          />
        </>
      }
      footer={
        <>
          la droite <strong>pivote autour de ω</strong> (ne rien transférer reste toujours possible).
          Augmenter <M tex="r" /> rend l'épargne plus rémunératrice (la valeur future, en haut, monte)
          mais l'emprunt plus cher (la valeur présente, à droite, recule). À gauche de ω tu épargnes,
          à droite tu empruntes.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div>
          <svg
            viewBox="0 0 520 412"
            className="mx-auto block h-auto w-full max-w-[520px]"
            role="img"
            aria-label="Droite de budget inter-temporelle : ensemble accessible, dotation, épargne et emprunt"
          >
            {/* ensemble accessible (triangle grisé) */}
            <polygon
              points={`${fr.L},${fr.B} ${top.x},${top.y} ${bot.x},${bot.y}`}
              fill="var(--color-muted-foreground)"
              fillOpacity={0.12}
            />
            <PlotAxes fr={fr} xLabel="c₀" yLabel="c₁" />
            {/* pointillés vers la dotation */}
            <line x1={om.x} y1={fr.B} x2={om.x} y2={om.y} stroke="var(--color-muted-foreground)" strokeWidth={1.2} strokeDasharray="4 4" />
            <line x1={fr.L} y1={om.y} x2={om.x} y2={om.y} stroke="var(--color-muted-foreground)" strokeWidth={1.2} strokeDasharray="4 4" />
            {/* droite de budget : vert = épargne, rose = emprunt */}
            <line x1={top.x} y1={top.y} x2={om.x} y2={om.y} stroke={GREEN} strokeWidth={3} strokeLinecap="round" />
            <line x1={om.x} y1={om.y} x2={bot.x} y2={bot.y} stroke={ROSE} strokeWidth={3} strokeLinecap="round" />
            <circle cx={top.x} cy={top.y} r={3.5} fill={GREEN} />
            <circle cx={bot.x} cy={bot.y} r={3.5} fill={ROSE} />
            {/* programme choisi : écart s sur l'axe c0, (1+r)s sur l'axe c1 */}
            {!atOmega && (
              <g>
                <line x1={pick.x} y1={fr.B} x2={pick.x} y2={pick.y} stroke={tone} strokeWidth={1.2} strokeDasharray="2 3" />
                <line x1={fr.L} y1={pick.y} x2={pick.x} y2={pick.y} stroke={tone} strokeWidth={1.2} strokeDasharray="2 3" />
                <line x1={pick.x} y1={fr.B} x2={om.x} y2={fr.B} stroke={tone} strokeWidth={5} strokeLinecap="round" />
                <line x1={fr.L} y1={pick.y} x2={fr.L} y2={om.y} stroke={tone} strokeWidth={5} strokeLinecap="round" />
                <HaloText x={(pick.x + om.x) / 2} y={fr.B - 8} anchor="middle" color={tone}>
                  {s > 0 ? `épargne ${fmtFr(s, 1)}` : `emprunt ${fmtFr(-s, 1)}`}
                </HaloText>
                <HaloText x={fr.L + 8} y={(pick.y + om.y) / 2 + 4} color={tone}>
                  {s > 0 ? `+ ${fmtFr((1 + r) * s)}` : `− ${fmtFr(-(1 + r) * s)}`}
                </HaloText>
              </g>
            )}
            {/* dotation ω */}
            <circle cx={om.x} cy={om.y} r={5} fill="var(--color-foreground)" />
            <HaloText x={om.x + 9} y={om.y - 8} size={14} italic>
              ω
            </HaloText>
            <HaloText x={om.x} y={fr.B + 16} anchor="middle" color="var(--color-muted-foreground)">
              m₀ = 8
            </HaloText>
            <HaloText x={fr.L - 6} y={om.y + 4} anchor="end" color="var(--color-muted-foreground)">
              m₁ = 4
            </HaloText>
            {/* programme choisi */}
            <circle cx={pick.x} cy={pick.y} r={6} fill="var(--color-card)" stroke={tone} strokeWidth={2.5} />
            {/* intercepts : valeur future (haut) et valeur présente (droite) */}
            <HaloText x={fr.L + 10} y={top.y - 8} color={GREEN}>
              valeur future (1+r)m₀ + m₁ = {fmtFr(fv)}
            </HaloText>
            <HaloText x={pvX} y={fr.B + 34} anchor="middle" color={ROSE}>
              valeur présente
            </HaloText>
            <HaloText x={pvX} y={fr.B + 50} anchor="middle" color={ROSE}>
              m₀ + m₁/(1+r) = {fmtFr(pv)}
            </HaloText>
            {/* libellés de la droite */}
            <HaloText x={slopeAt.x + 10} y={slopeAt.y - 8} italic color="var(--color-foreground)">
              pente −(1+r) = −{fmtFr(1 + r)}
            </HaloText>
            <HaloText x={saveAt.x + 10} y={saveAt.y - 8} color={GREEN}>
              épargne (c₀ &lt; m₀)
            </HaloText>
            <HaloText x={borrowAt.x + 10} y={borrowAt.y - 8} color={ROSE}>
              emprunt (c₀ &gt; m₀)
            </HaloText>
          </svg>
          <p className="mt-1 text-center text-[12.5px] text-muted-foreground">
            Zone grisée : programmes accessibles (contrainte de budget respectée). Rond blanc : ton
            programme (c₀ ; c₁). Les deux axes n'ont pas la même échelle.
          </p>
        </div>
        <div>
          <Readout
            rows={[
              { label: <>Dotation ω</>, value: "(8 ; 4)" },
              {
                label: (
                  <>
                    Valeur présente <M tex="m_0+\tfrac{m_1}{1+r}" />
                  </>
                ),
                value: fmtFr(pv),
              },
              {
                label: (
                  <>
                    Valeur future <M tex="(1+r)m_0+m_1" />
                  </>
                ),
                value: fmtFr(fv),
              },
              { label: "Pente −(1+r)", value: `−${fmtFr(1 + r)}` },
              { label: <>Ton choix (c₀ ; c₁)</>, value: `(${fmtFr(c0)} ; ${fmtFr(c1)})` },
            ]}
          />
          {atOmega ? (
            <Verdict tone="neutral">
              Tu consommes exactement ta dotation : ni épargne ni emprunt (tu es au point ω).
            </Verdict>
          ) : s > 0 ? (
            <Verdict tone="smooth">
              Tu épargnes <M tex="m_0-c_0" /> = {fmtFr(s)} ⇒ tu récupères (1+r) × {fmtFr(s)} ={" "}
              {fmtFr((1 + r) * s)} demain : <M tex="c_1" /> = m₁ + {fmtFr((1 + r) * s)} = {fmtFr(c1)}.
            </Verdict>
          ) : (
            <Verdict tone="now">
              Tu empruntes <M tex="c_0-m_0" /> = {fmtFr(-s)} ⇒ tu rembourses (1+r) × {fmtFr(-s)} ={" "}
              {fmtFr(-(1 + r) * s)} demain : <M tex="c_1" /> = m₁ − {fmtFr(-(1 + r) * s)} ={" "}
              {fmtFr(c1)}.
            </Verdict>
          )}
          {r < 0.001 ? (
            <Verdict tone="neutral">
              À <M tex="r=0" />, la pente vaut −1 : 1 € aujourd'hui = 1 € demain. Valeur présente et
              valeur future sont égales (12).
            </Verdict>
          ) : (
            <Verdict tone="later">
              La droite a pivoté autour de ω : 1 € épargné aujourd'hui rapporte {fmtFr(1 + r)} € à la
              retraite, et 1 € emprunté coûte {fmtFr(1 + r)} € à rembourser.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 2 : l'optimum d'Euler                                        */
/* u(c)=√c, dotation (8;4), modes « taux r » et « subside s » :        */
/*   W1 = (1+r)m0+m1 ; c0 = W1/((1+r)(1+δ²(1+r))) ; c1 = (δ(1+r))²c0   */
/* ------------------------------------------------------------------ */

type EulerPreset = "lissage" | "impatience" | "patience" | "aucun";
const EULER_PRESETS: Record<Exclude<EulerPreset, "aucun">, { delta: number; rPct: number }> = {
  lissage: { delta: 1, rPct: 0 },
  impatience: { delta: 0.6, rPct: 0 },
  patience: { delta: 1, rPct: 50 },
};
const R_STAR = 0.1; // taux du marché r* du mode « subside » (slide 19)

/** Optimum avec u(c) = √c : c0* = VP/(1 + δ²(1+r)) et c1* = (δ(1+r))²·c0*. */
function eulerOpt(m0: number, m1: number, delta: number, r: number) {
  const pv = m0 + m1 / (1 + r);
  const c0 = pv / (1 + delta * delta * (1 + r));
  const c1 = (delta * (1 + r)) ** 2 * c0;
  return { pv, fv: (1 + r) * pv, c0, c1 };
}

export function EulerPlayground() {
  // Dotation des slides : plus de revenu en vie active qu'à la retraite.
  const m0 = 8;
  const m1 = 4;
  const [mode, setMode] = useState<"taux" | "subside">("taux");
  const [delta, setDelta] = useState(1); // 0,40 → 1,00
  const [rPct, setRPct] = useState(0); // mode taux : 0 → 100 (%)
  const [sub, setSub] = useState(0); // mode subside : s ∈ [−1 ; 3]

  const r = mode === "taux" ? rPct / 100 : R_STAR * (1 + sub);
  const { pv, fv, c0, c1 } = eulerOpt(m0, m1, delta, r);
  const dr = delta * (1 + r);
  const Ustar = Math.sqrt(c0) + delta * Math.sqrt(c1);
  const sav = m0 - c0; // épargne (> 0) ou emprunt (< 0)
  const ref = eulerOpt(m0, m1, delta, R_STAR); // référence s = 0 (r = r*)

  const fr = makeFrame(13, 22, { L: 56, R: 480, T: 40, B: 360 });

  // courbe d'indifférence passant par l'optimum : c1 = ((U* − √c0)/δ)²
  const pts: string[] = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const cx = 0.2 + (fr.XM - 0.2) * (i / N);
    const root = (Ustar - Math.sqrt(cx)) / delta;
    if (root < 0) continue;
    const yv = root * root;
    if (yv > fr.YM * 1.03) continue;
    pts.push(`${fr.X(cx).toFixed(1)},${fr.Y(yv).toFixed(1)}`);
  }

  // verdict fondé sur les valeurs affichées (cohérent avec la lecture)
  const regime: "smooth" | "now" | "later" =
    fmtFr(c0) === fmtFr(c1) ? "smooth" : c0 > c1 ? "now" : "later";
  const exact = Math.abs(dr - 1) < 1e-9;
  const active: EulerPreset =
    mode === "taux"
      ? ((Object.keys(EULER_PRESETS) as Array<Exclude<EulerPreset, "aucun">>).find(
          (k) => Math.abs(EULER_PRESETS[k].delta - delta) < 1e-9 && EULER_PRESETS[k].rPct === rPct,
        ) ?? "aucun")
      : "aucun";

  // flèche ω → c* le long de la droite de budget
  const GREEN = "#059669";
  const AMBER = "#d97706";
  const arrowColor = sav > 0 ? GREEN : AMBER;
  const ox = fr.X(m0);
  const oy = fr.Y(m1);
  const px = fr.X(c0);
  const py = fr.Y(c1);
  const len = Math.hypot(px - ox, py - oy);
  const showArrow = Math.abs(sav) >= 0.05 && len > 16;
  const ux = len > 0 ? (px - ox) / len : 0;
  const uy = len > 0 ? (py - oy) / len : 0;
  const tipX = px - ux * 8;
  const tipY = py - uy * 8;
  const baseX = tipX - ux * 10;
  const baseY = tipY - uy * 10;
  const midX = (ox + px) / 2;
  const midY = (oy + py) / 2;

  return (
    <InteractiveCard
      title={
        <>
          Le choix optimal en direct — <M tex="u(c)=\sqrt{c}" />, dotation ω = (8 ; 4)
        </>
      }
      subtitle="Bouge la patience δ et le taux r (ou le subside s) : le point optimal c* glisse le long du budget."
      controls={
        <>
          <ChoiceChips
            label="Mode"
            value={mode}
            onChange={(v) => {
              setMode(v);
              if (v === "subside") {
                setDelta(0.9);
                setSub(0);
              }
            }}
            options={[
              { value: "taux", label: "Taux r libre" },
              { value: "subside", label: "Subside s (r* = 10 %)" },
            ]}
          />
          {mode === "taux" && (
            <ChoiceChips
              label="Exemples du slide 18"
              value={active}
              onChange={(k) => {
                if (k === "aucun") return;
                setDelta(EULER_PRESETS[k].delta);
                setRPct(EULER_PRESETS[k].rPct);
              }}
              options={[
                { value: "lissage", label: "Lissage (r = 0, δ = 1)" },
                { value: "impatience", label: "Impatience (r = 0, δ = 0,6)" },
                { value: "patience", label: "Patience (r = 50 %, δ = 1)" },
              ]}
            />
          )}
          <SliderControl
            label={<>Facteur d'escompte δ (patience)</>}
            value={delta}
            onChange={setDelta}
            min={0.4}
            max={1}
            step={0.02}
            format={(v) => fmtFr(v)}
          />
          {mode === "taux" ? (
            <SliderControl
              label={<>Taux d'intérêt r</>}
              value={rPct}
              onChange={setRPct}
              min={0}
              max={100}
              step={5}
              format={(v) => `${v} %`}
            />
          ) : (
            <SliderControl
              label={<>Subside s (taxe si s &lt; 0)</>}
              value={sub}
              onChange={setSub}
              min={-1}
              max={3}
              step={0.1}
              format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.round(Math.abs(v) * 100)}\u00a0%`}
            />
          )}
        </>
      }
      footer={
        <>
          la <span className="font-semibold text-rose-600">droite rouge</span> est le budget, la{" "}
          <span className="font-semibold text-indigo-600">courbe bleue</span> est la courbe
          d'indifférence qui passe par l'optimum : elles sont toujours <strong>tangentes</strong> en{" "}
          <M tex="c^*" /> — c'est l'équation d'Euler en version graphique. Tout se joue sur le
          produit <M tex="\delta(1+r)" /> : égal à 1 → lissage, inférieur à 1 → plus de présent,
          supérieur à 1 → plus de futur. La flèche part de ω : vers la gauche, tu épargnes ; vers la
          droite, tu empruntes. En mode subside, <M tex="r=r^*(1+s)" /> : un subside{" "}
          <M tex="s>0" /> rend la droite plus pentue et, ici, <M tex="c_0^*" /> baisse (l'épargne
          monte).
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg
          viewBox="0 0 520 400"
          className="mx-auto block h-auto w-full max-w-[520px]"
          role="img"
          aria-label="Optimum inter-temporel : tangence entre courbe d'indifférence et budget, flèche de la dotation vers l'optimum"
        >
          <PlotAxes fr={fr} xLabel="c₀" yLabel="c₁" />
          {/* budget */}
          <line x1={fr.X(pv)} y1={fr.Y(0)} x2={fr.X(0)} y2={fr.Y(fv)} stroke="#e11d48" strokeWidth={2.4} />
          {/* courbe d'indifférence */}
          {pts.length > 1 ? (
            <polyline points={pts.join(" ")} fill="none" stroke="#4f46e5" strokeWidth={2.2} />
          ) : null}
          {/* pointillés vers l'optimum */}
          <line x1={px} y1={fr.B} x2={px} y2={py} stroke="var(--color-muted-foreground)" strokeWidth={1.2} strokeDasharray="4 4" />
          <line x1={fr.L} y1={py} x2={px} y2={py} stroke="var(--color-muted-foreground)" strokeWidth={1.2} strokeDasharray="4 4" />
          <HaloText x={px} y={fr.B + 17} anchor="middle" italic>
            c₀*
          </HaloText>
          <HaloText x={fr.L - 6} y={py + 4} anchor="end" italic>
            c₁*
          </HaloText>
          {/* flèche ω → c* : épargne (vert) ou emprunt (orange) */}
          {showArrow && (
            <g>
              <line x1={ox} y1={oy} x2={baseX} y2={baseY} stroke={arrowColor} strokeWidth={3.2} strokeLinecap="round" />
              <polygon
                points={`${tipX},${tipY} ${baseX - uy * 5},${baseY + ux * 5} ${baseX + uy * 5},${baseY - ux * 5}`}
                fill={arrowColor}
              />
              <HaloText x={midX - 12} y={midY + 26} anchor="end" color={arrowColor}>
                {sav > 0
                  ? `épargne = m₀ − c₀* = ${fmtFr(sav)}`
                  : `emprunt = c₀* − m₀ = ${fmtFr(-sav)}`}
              </HaloText>
            </g>
          )}
          {/* dotation */}
          <circle cx={ox} cy={oy} r={4.5} fill="var(--color-foreground)" />
          <HaloText x={ox + 9} y={oy + 17} italic>
            ω
          </HaloText>
          {/* optimum */}
          <circle cx={px} cy={py} r={5.5} fill="#4f46e5" stroke="var(--color-card)" strokeWidth={2} />
          <HaloText x={px + 10} y={py - 10} size={14} italic color="#4f46e5">
            c*
          </HaloText>
        </svg>
        <div>
          <Readout
            rows={[
              ...(mode === "subside"
                ? [{ label: <M tex="r=r^*(1+s)" />, value: pctFr(r) }]
                : []),
              { label: <M tex="\delta(1+r)" />, value: fmtFr(dr) },
              {
                label: (
                  <>
                    Conso vie active <M tex="c_0^*" />
                  </>
                ),
                value: fmtFr(c0),
              },
              {
                label: (
                  <>
                    Conso retraite <M tex="c_1^*" />
                  </>
                ),
                value: fmtFr(c1),
              },
              {
                label: sav >= 0 ? <>Épargne <M tex="m_0-c_0^*" /></> : <>Emprunt <M tex="c_0^*-m_0" /></>,
                value: fmtFr(Math.abs(sav)),
              },
            ]}
          />
          {regime === "smooth" ? (
            <Verdict tone="smooth">
              Lissage parfait : <M tex={exact ? "\\delta(1+r)=1" : "\\delta(1+r)\\approx 1"} />, donc{" "}
              <M tex="c_0^* = c_1^*" />.
            </Verdict>
          ) : regime === "now" ? (
            <Verdict tone="now">
              Impatience : <M tex="\delta(1+r)<1" /> → on consomme plus tôt (
              <M tex="c_0^* > c_1^*" />
              ).
            </Verdict>
          ) : (
            <Verdict tone="later">
              Patience : <M tex="\delta(1+r)>1" /> → attendre paie, on garde plus pour la retraite (
              <M tex="c_0^* < c_1^*" />
              ).
            </Verdict>
          )}
          {mode === "subside" && (
            <Verdict tone="neutral">
              Sans subside (s = 0, r = 10 %) : épargne {fmtFr(m0 - ref.c0)}. Avec s ={" "}
              {Math.round(sub * 100)} % (r = {pctFr(r)}) : {sav >= 0 ? "épargne" : "emprunt"}{" "}
              {fmtFr(Math.abs(sav))}.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 3 : classifieur de biens (investissement / tentation)        */
/* ex-ante = b1+δb2 ; prévision = b1+β̂δb2 ; sur le moment = b1+βδb2   */
/* ------------------------------------------------------------------ */

type PresetKey = "jogging" | "chips" | "exo" | "custom";

const PRESETS: Record<
  Exclude<PresetKey, "custom">,
  { b1: number; b2: number; beta: number; delta: number; betaHat: number }
> = {
  jogging: { b1: -2, b2: 3, beta: 0.5, delta: 1, betaHat: 1 },
  chips: { b1: 2, b2: -3, beta: 0.5, delta: 1, betaHat: 1 },
  exo: { b1: -3, b2: 8, beta: 0.5, delta: 0.5, betaHat: 1 },
};

export function GoodClassifier() {
  const [preset, setPreset] = useState<PresetKey>("jogging");
  const [beta, setBeta] = useState(0.5);
  const [delta, setDelta] = useState(1);
  const [b1, setB1] = useState(-2);
  const [b2, setB2] = useState(3);
  const [betaHat, setBetaHat] = useState(1); // ce qu'il croit de lui-même, β̂ ∈ [β ; 1]

  function applyPreset(key: PresetKey) {
    setPreset(key);
    if (key !== "custom") {
      const p = PRESETS[key];
      setB1(p.b1);
      setB2(p.b2);
      setBeta(p.beta);
      setDelta(p.delta);
      setBetaHat(p.betaHat);
    }
  }

  function custom(setter: (v: number) => void) {
    return (v: number) => {
      setPreset("custom");
      setter(v);
    };
  }

  const bh = Math.max(betaHat, beta);
  const exAnte = b1 + delta * b2;
  const moment = b1 + beta * delta * b2;
  const forecast = b1 + bh * delta * b2;
  const type = b1 < 0 && b2 > 0 ? "investissement" : b1 > 0 && b2 < 0 ? "tentation" : "mixte";
  const wants = exAnte > 0;
  const does = moment > 0;
  const believes = forecast > 0;

  let verdict: ReactNode;
  let tone: "neutral" | "now";
  if (wants === does) {
    tone = "neutral";
    if (type === "investissement") {
      verdict = does
        ? "Aucun conflit : il veut faire l'effort de loin, et il le fait aussi sur le moment. Idéal."
        : "Cohérent (mais dommage) : ni de loin ni sur le moment il ne s'y met.";
    } else if (type === "tentation") {
      verdict = does
        ? "Cohérent : il assume cette tentation de loin comme sur le moment."
        : "Aucun conflit : il résiste à la tentation, exactement comme prévu de loin.";
    } else {
      verdict =
        "Décision cohérente : l'intention de loin et l'action sur le moment vont dans le même sens.";
    }
  } else if (wants && !does) {
    tone = "now";
    verdict =
      type === "investissement" ? (
        <>
          Conflit ! De loin il <strong>veut</strong> le faire (ex-ante positif), mais sur le moment il{" "}
          <strong>lâche</strong>. Bien d'investissement <strong>sous-consommé</strong> — le jogging,
          l'épargne…
        </>
      ) : (
        <>
          Conflit entre l'intention et l'action : de loin il <strong>veut</strong> consommer le bien
          (ex-ante positif), mais sur le moment il ne le fait pas (critère du moment nul ou négatif).
        </>
      );
  } else {
    tone = "now";
    verdict =
      type === "tentation" ? (
        <>
          Conflit ! De loin il ne voulait <strong>pas</strong> (ex-ante négatif ou nul), mais sur le
          moment il <strong>craque</strong>. Bien de tentation <strong>sur-consommé</strong> — les
          chips, l'alcool…
        </>
      ) : (
        <>
          Conflit entre l'intention et l'action : de loin il ne voulait <strong>pas</strong>{" "}
          consommer le bien, mais sur le moment il le fait.
        </>
      );
  }

  // Prévision (β̂) contre réalité (β) — slides 27-29
  const awareness =
    beta >= 1 - 1e-9
      ? "Pas de problème de self-contrôle (β = 1)"
      : Math.abs(bh - beta) < 1e-9
        ? "Sophistiqué (β̂ = β)"
        : bh >= 1 - 1e-9
          ? "Naïf (β̂ = 1)"
          : "Partiellement conscient (β < β̂ < 1)";
  const lucid = believes === does;
  const plan = (yes: boolean) => (yes ? "consommera le bien" : "ne le consommera pas");

  return (
    <InteractiveCard
      title="Testeur de biens : investissement ou tentation ?"
      subtitle={
        <>
          Compare le critère ex-ante <M tex="b_1+\delta b_2" /> (ce qu'il veut à l'avance), sa
          prévision <M tex="b_1+\hat\beta\delta b_2" /> (ce qu'il croit qu'il fera) et le critère du
          moment <M tex="b_1+\beta\delta b_2" /> (ce qu'il fait vraiment).
        </>
      }
      controls={
        <>
          <ChoiceChips<PresetKey>
            label="Scénarios prêts à l'emploi"
            value={preset}
            onChange={applyPreset}
            options={[
              { value: "jogging", label: "🏃 Jogging (slide 26)" },
              { value: "chips", label: "🍟 Chips (slide 26)" },
              { value: "exo", label: "📘 Exercice (slide 29)" },
            ]}
          />
          <SliderControl
            label={<>Biais de self-contrôle β</>}
            value={beta}
            onChange={custom((v) => {
              setBeta(v);
              setBetaHat((h) => Math.max(h, v));
            })}
            min={0}
            max={1}
            step={0.05}
            format={(v) => fmtFr(v)}
          />
          <SliderControl
            label={<>β̂ : ce qu'il croit de lui-même (entre β et 1)</>}
            value={bh}
            onChange={setBetaHat}
            min={beta}
            max={1}
            step={0.05}
            format={(v) => fmtFr(v)}
          />
          <SliderControl
            label={<>Facteur d'escompte δ</>}
            value={delta}
            onChange={custom(setDelta)}
            min={0}
            max={1}
            step={0.05}
            format={(v) => fmtFr(v)}
          />
          <SliderControl
            label={<>Bénéfice période 1 — b₁</>}
            value={b1}
            onChange={custom(setB1)}
            min={-6}
            max={8}
            step={1}
            format={(v) => (v > 0 ? `+${v}` : String(v))}
          />
          <SliderControl
            label={<>Bénéfice période 2 — b₂</>}
            value={b2}
            onChange={custom(setB2)}
            min={-6}
            max={8}
            step={1}
            format={(v) => (v > 0 ? `+${v}` : String(v))}
          />
        </>
      }
      footer={
        <>
          le conflit apparaît dès que les critères ex-ante et du moment n'ont{" "}
          <strong>pas le même signe</strong> : l'unique différence entre eux est le β qui rabote le
          bénéfice futur b₂ au moment d'agir. Mets β = 1 : le conflit disparaît toujours — c'est le
          retour au rationnel. Pour la prévision, β̂ remplace β : sophistiqué (β̂ = β), il prévoit
          juste ; naïf (β̂ = 1), il croit qu'il fera ce qu'il veut ex-ante.
        </>
      }
    >
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Readout
          rows={[
            { label: "Type de bien", value: type },
            {
              label: (
                <>
                  Ex-ante (ce qu'il veut) : <M tex="b_1+\delta b_2" />
                </>
              ),
              value: fmtFr(exAnte),
            },
            {
              label: (
                <>
                  Ce qu'il croit qu'il fera : <M tex="b_1+\hat\beta\delta b_2" />
                </>
              ),
              value: fmtFr(forecast),
            },
            {
              label: (
                <>
                  Sur le moment (réalité) : <M tex="b_1+\beta\delta b_2" />
                </>
              ),
              value: fmtFr(moment),
            },
          ]}
        />
        <div>
          <Verdict tone={tone}>{verdict}</Verdict>
          <Verdict tone={lucid ? "smooth" : "now"}>
            <strong>{awareness}</strong> : il croit qu'il {plan(believes)} (
            <M tex="b_1+\hat\beta\delta b_2" /> = {fmtFr(forecast)}).{" "}
            {lucid ? (
              <>Et c'est bien ce qui se passe : sa prévision est juste (lucide).</>
            ) : (
              <>
                Mais sur le moment il {plan(does)} (<M tex="b_1+\beta\delta b_2" /> = {fmtFr(moment)}
                ) : <strong>il se trompe sur lui-même</strong>.
              </>
            )}
          </Verdict>
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Sondage A/B façon « poll » du manuel : choisis, puis découvre        */
/* les vraies réponses des étudiants.                                  */
/* ------------------------------------------------------------------ */

export function PollCard({
  tag,
  question,
  options,
  note,
}: {
  tag: string;
  question: ReactNode;
  options: Array<{ key: string; label: ReactNode; pct: number; alt?: boolean }>;
  note: ReactNode;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const revealed = chosen !== null;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-amber-300/60 bg-card shadow-sm dark:border-amber-700/50">
      <div className="border-b bg-amber-50/70 px-4 py-3 dark:bg-amber-950/30 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <Vote className="h-4 w-4" aria-hidden />
          {tag}
        </div>
        <div className="mt-1 font-medium">{question}</div>
      </div>
      <div className="grid gap-2.5 px-4 py-4 sm:px-5">
        {options.map((opt) => (
          <div key={opt.key}>
            <button
              type="button"
              disabled={revealed}
              onClick={() => setChosen(opt.key)}
              className={cn(
                "w-full rounded-xl border px-3.5 py-2.5 text-left text-[15px] transition-colors",
                !revealed && "hover:border-primary hover:bg-accent/60",
                revealed && chosen === opt.key && "border-primary bg-accent",
                revealed && chosen !== opt.key && "opacity-70",
              )}
            >
              <span className="mr-2 font-bold text-primary">{opt.key}</span>
              {opt.label}
              {revealed && chosen === opt.key ? (
                <span className="ml-2 text-xs font-semibold text-primary">← ton choix</span>
              ) : null}
            </button>
            {revealed ? (
              <div className="mt-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-baseline justify-between text-xs font-medium text-muted-foreground">
                  <span>Réponses des étudiants</span>
                  <span className="font-bold tabular-nums text-foreground">{opt.pct} %</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", opt.alt ? "bg-amber-500" : "bg-primary")}
                    style={{ width: `${opt.pct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {revealed ? (
          <div className="mt-2 rounded-xl border bg-muted/50 px-4 py-3 text-[14.5px] leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-1">
            {note}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Choisis d'abord par instinct — les résultats réels s'affichent ensuite.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cas dépliables (application actifs illiquides + emprunts)           */
/* ------------------------------------------------------------------ */

export function CommitCase({
  tag,
  tone = "blue",
  title,
  children,
}: {
  tag: string;
  tone?: "blue" | "gold" | "bad" | "good";
  title: ReactNode;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    blue: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    gold: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    bad: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    good: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <details className="group my-3 overflow-hidden rounded-xl border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 font-semibold transition-colors hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold tracking-wide",
            tones[tone],
          )}
        >
          {tag}
        </span>
        <span className="min-w-0 flex-1 text-[15px]">{title}</span>
        <ChevronRight
          className="h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
          aria-hidden
        />
      </summary>
      <div className="course-prose border-t px-4 pb-4 pt-3 text-[15px] sm:px-5">{children}</div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Graphe statique : comparaison des U₀ des cinq programmes            */
/* Axe zoomé 2,85 → 3,02 comme dans le source.                         */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/* Checklist de maîtrise (18 points, cochables)                        */
/* ------------------------------------------------------------------ */

export function MasteryChecklist({
  items,
}: {
  items: Array<{ title: ReactNode; body: ReactNode }>;
}) {
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
          Ta checklist de révision
        </span>
        <span className="tabular-nums">
          {done.size}/{items.length} cochés
        </span>
      </div>
      <div className="grid gap-2.5">
        {items.map((item, i) => {
          const isDone = done.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={cn(
                "flex items-start gap-3.5 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50",
                isDone && "border-success/50 bg-emerald-50/50 dark:bg-emerald-950/20",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-white transition-colors",
                  isDone ? "border-success bg-success" : "border-muted-foreground/40 bg-card",
                )}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
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
              <span className={cn("text-[15px] leading-relaxed", isDone && "text-muted-foreground")}>
                <span className="block text-[13px] font-bold text-primary">{item.title}</span>
                {item.body}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
