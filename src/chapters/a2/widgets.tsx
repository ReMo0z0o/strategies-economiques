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

function makeFrame(XM: number, YM: number): Frame {
  const L = 52;
  const R = 456;
  const T = 28;
  const B = 336;
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
      <p className="mt-2 text-center text-[13px] text-muted-foreground">
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
  const m0 = 4;
  const m1 = 6;
  const [rPct, setRPct] = useState(0); // 0 → 150 (%)

  const r = rPct / 100;
  const pv = m0 + m1 / (1 + r);
  const fv = (1 + r) * m0 + m1;
  const fr = makeFrame(11, 17);

  // extrémités de la droite de budget
  const x1 = fr.X(pv);
  const y1 = fr.Y(0);
  const x2 = fr.X(0);
  const y2 = fr.Y(fv);
  // position du libellé de pente (aux 2/3 de la droite, depuis le haut)
  const t = 0.66;
  const lx = x2 + (x1 - x2) * t;
  const ly = y2 + (y1 - y2) * t;

  return (
    <InteractiveCard
      title="Joue avec le taux d'intérêt"
      subtitle={
        <>
          Dotation fixée à ω = (4 ; 6). Monte <M tex="r" /> et regarde la droite de budget pivoter.
        </>
      }
      controls={
        <SliderControl
          label={<>Taux d'intérêt r</>}
          value={rPct}
          onChange={setRPct}
          min={0}
          max={150}
          step={5}
          format={(v) => `${v} %`}
        />
      }
      footer={
        <>
          la droite <strong>pivote autour de ω</strong> (ne rien déplacer reste toujours possible).
          Augmenter <M tex="r" /> rend l'épargne plus rémunératrice (l'ordonnée à l'origine — la
          valeur future — monte) mais l'emprunt plus cher (l'abscisse maximale — la valeur présente
          — recule).
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg
          viewBox="0 0 480 380"
          className="mx-auto block h-auto w-full max-w-[480px]"
          role="img"
          aria-label="Droite de budget inter-temporelle"
        >
          <PlotAxes fr={fr} xLabel="c₀" yLabel="c₁" />
          {/* droite de budget */}
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e11d48" strokeWidth={2.4} />
          {/* pointillés vers la dotation */}
          <line
            x1={fr.X(m0)}
            y1={fr.Y(0)}
            x2={fr.X(m0)}
            y2={fr.Y(m1)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.2}
            strokeDasharray="4 4"
          />
          <line
            x1={fr.L}
            y1={fr.Y(m1)}
            x2={fr.X(m0)}
            y2={fr.Y(m1)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.2}
            strokeDasharray="4 4"
          />
          {/* dotation ω */}
          <circle cx={fr.X(m0)} cy={fr.Y(m1)} r={5} fill="var(--color-foreground)" />
          <text
            x={fr.X(m0) + 9}
            y={fr.Y(m1) - 7}
            fontSize={13}
            fontStyle="italic"
            fill="var(--color-foreground)"
          >
            ω
          </text>
          <text x={fr.X(m0)} y={fr.B + 15} fontSize={11} fill="var(--color-muted-foreground)" textAnchor="middle">
            m₀
          </text>
          <text x={fr.L - 7} y={fr.Y(m1) + 4} fontSize={11} fill="var(--color-muted-foreground)" textAnchor="end">
            m₁
          </text>
          {/* libellé de pente */}
          <text x={lx + 9} y={ly + 4} fontSize={12} fontStyle="italic" fill="#e11d48">
            −(1+r)
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              { label: <>Dotation ω</>, value: "(4 ; 6)" },
              {
                label: (
                  <>
                    Valeur présente <M tex="c_0^{\max}" />
                  </>
                ),
                value: fmtFr(pv),
              },
              {
                label: (
                  <>
                    Valeur future <M tex="c_1^{\max}" />
                  </>
                ),
                value: fmtFr(fv),
              },
              { label: "Pente", value: `−${fmtFr(1 + r)}` },
            ]}
          />
          {r < 0.001 ? (
            <Verdict tone="neutral">
              À <M tex="r=0" />, présent et futur valent pareil : la droite est à 45°.
            </Verdict>
          ) : (
            <Verdict tone="later">
              La droite pivote autour de ω : 1 € épargné aujourd'hui rapporte {fmtFr(1 + r)} € à la
              retraite. Épargner devient plus payant.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 2 : l'optimum d'Euler                                        */
/* Formules du source, u(c)=√c, dotation (6;6) :                       */
/*   W1 = (1+r)m0+m1 ; c0 = W1/((1+r)(1+δ²(1+r))) ; c1 = (δ(1+r))²c0   */
/* ------------------------------------------------------------------ */

export function EulerPlayground() {
  const m0 = 6;
  const m1 = 6;
  const [delta, setDelta] = useState(1); // 0,40 → 1,00
  const [rPct, setRPct] = useState(0); // 0 → 100 (%)

  const r = rPct / 100;
  const W1 = (1 + r) * m0 + m1;
  const dr = delta * (1 + r);
  const c0 = W1 / ((1 + r) * (1 + delta * delta * (1 + r)));
  const c1 = dr * dr * c0;
  const Ustar = Math.sqrt(c0) + delta * Math.sqrt(c1);

  const fr = makeFrame(13, 19);
  const pv = m0 + m1 / (1 + r);
  const fv = W1;

  // échantillonnage de la courbe d'indifférence passant par l'optimum
  const pts: string[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const cx = 0.25 + (fr.XM - 0.25) * (i / N);
    const root = (Ustar - Math.sqrt(cx)) / delta;
    if (root < 0) continue;
    const yv = root * root;
    if (yv > fr.YM * 1.03) continue;
    pts.push(`${fr.X(cx).toFixed(1)},${fr.Y(yv).toFixed(1)}`);
  }

  const regime: "smooth" | "now" | "later" =
    Math.abs(dr - 1) < 0.02 ? "smooth" : dr < 1 ? "now" : "later";

  return (
    <InteractiveCard
      title={
        <>
          Le choix optimal en direct — <M tex="u(c)=\sqrt{c}" />, dotation (6 ; 6)
        </>
      }
      subtitle="Bouge la patience δ et le taux r : le point optimal c* glisse le long du budget."
      controls={
        <>
          <SliderControl
            label={<>Patience δ</>}
            value={delta}
            onChange={setDelta}
            min={0.4}
            max={1}
            step={0.02}
            format={(v) => fmtFr(v)}
          />
          <SliderControl
            label={<>Taux d'intérêt r</>}
            value={rPct}
            onChange={setRPct}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v} %`}
          />
        </>
      }
      footer={
        <>
          la <span className="font-semibold text-rose-600">droite rouge</span> est le budget, la{" "}
          <span className="font-semibold text-indigo-600">courbe bleue</span> est la courbe
          d'indifférence qui passe par l'optimum : elles sont toujours <strong>tangentes</strong> en{" "}
          <M tex="c^*" /> — c'est l'équation d'Euler en version graphique. Tout se joue sur le
          produit <M tex="\delta(1+r)" /> : égal à 1 → lissage, inférieur à 1 → plus de présent,
          supérieur à 1 → plus de futur.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg
          viewBox="0 0 480 380"
          className="mx-auto block h-auto w-full max-w-[480px]"
          role="img"
          aria-label="Optimum inter-temporel : tangence entre courbe d'indifférence et budget"
        >
          <PlotAxes fr={fr} xLabel="c₀" yLabel="c₁" />
          {/* budget */}
          <line
            x1={fr.X(pv)}
            y1={fr.Y(0)}
            x2={fr.X(0)}
            y2={fr.Y(fv)}
            stroke="#e11d48"
            strokeWidth={2.4}
          />
          {/* courbe d'indifférence */}
          {pts.length > 1 ? (
            <polyline points={pts.join(" ")} fill="none" stroke="#4f46e5" strokeWidth={2.2} />
          ) : null}
          {/* pointillés vers l'optimum */}
          <line
            x1={fr.X(c0)}
            y1={fr.Y(0)}
            x2={fr.X(c0)}
            y2={fr.Y(c1)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.2}
            strokeDasharray="4 4"
          />
          <line
            x1={fr.L}
            y1={fr.Y(c1)}
            x2={fr.X(c0)}
            y2={fr.Y(c1)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.2}
            strokeDasharray="4 4"
          />
          {/* dotation */}
          <circle cx={fr.X(m0)} cy={fr.Y(m1)} r={3.5} fill="var(--color-muted-foreground)" />
          <text x={fr.X(m0) + 8} y={fr.Y(m1) + 14} fontSize={11} fill="var(--color-muted-foreground)">
            ω
          </text>
          {/* optimum */}
          <circle
            cx={fr.X(c0)}
            cy={fr.Y(c1)}
            r={5.5}
            fill="#4f46e5"
            stroke="var(--color-card)"
            strokeWidth={2}
          />
          <text
            x={fr.X(c0) + 9}
            y={fr.Y(c1) - 7}
            fontSize={13}
            fontStyle="italic"
            fontWeight={600}
            fill="#4f46e5"
          >
            c*
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              { label: <M tex="\delta(1+r)" />, value: fmtFr(dr) },
              {
                label: (
                  <>
                    Conso présente <M tex="c_0^*" />
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
            ]}
          />
          {regime === "smooth" ? (
            <Verdict tone="smooth">
              Lissage parfait : <M tex="\delta(1+r)=1" />, donc <M tex="c_0 = c_1" />.
            </Verdict>
          ) : regime === "now" ? (
            <Verdict tone="now">
              Impatience : <M tex="\delta(1+r)<1" /> → on consomme plus tôt (
              <M tex="c_0 > c_1" />
              ).
            </Verdict>
          ) : (
            <Verdict tone="later">
              Patience : <M tex="\delta(1+r)>1" /> → attendre paie, on garde plus pour la retraite (
              <M tex="c_0 < c_1" />
              ).
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 3 : classifieur de biens (investissement / tentation)        */
/* Formules du source : ex-ante = b1 + δ·b2 ; sur le moment = b1+βδb2  */
/* ------------------------------------------------------------------ */

type PresetKey = "jogging" | "chips" | "exo" | "custom";

const PRESETS: Record<Exclude<PresetKey, "custom">, { b1: number; b2: number; beta: number; delta: number }> = {
  jogging: { b1: -2, b2: 3, beta: 0.5, delta: 1 },
  chips: { b1: 2, b2: -3, beta: 0.5, delta: 1 },
  exo: { b1: -3, b2: 8, beta: 0.5, delta: 0.5 },
};

export function GoodClassifier() {
  const [preset, setPreset] = useState<PresetKey>("jogging");
  const [beta, setBeta] = useState(0.5);
  const [delta, setDelta] = useState(1);
  const [b1, setB1] = useState(-2);
  const [b2, setB2] = useState(3);

  function applyPreset(key: PresetKey) {
    setPreset(key);
    if (key !== "custom") {
      const p = PRESETS[key];
      setB1(p.b1);
      setB2(p.b2);
      setBeta(p.beta);
      setDelta(p.delta);
    }
  }

  function custom(setter: (v: number) => void) {
    return (v: number) => {
      setPreset("custom");
      setter(v);
    };
  }

  const exAnte = b1 + delta * b2;
  const moment = b1 + beta * delta * b2;
  const type = b1 < 0 && b2 > 0 ? "investissement" : b1 > 0 && b2 < 0 ? "tentation" : "mixte";
  const wants = exAnte > 0;
  const does = moment > 0;

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
    verdict = (
      <>
        Conflit ! De loin il <strong>veut</strong> le faire (ex-ante positif), mais sur le moment il{" "}
        <strong>lâche</strong>. Bien d'investissement <strong>sous-consommé</strong> — le jogging,
        l'épargne…
      </>
    );
  } else {
    tone = "now";
    verdict = (
      <>
        Conflit ! De loin il ne voulait <strong>pas</strong> (ex-ante négatif ou nul), mais sur le
        moment il <strong>craque</strong>. Bien de tentation <strong>sur-consommé</strong> — les
        chips, l'alcool…
      </>
    );
  }

  return (
    <InteractiveCard
      title="Testeur de biens : investissement ou tentation ?"
      subtitle={
        <>
          Compare le critère ex-ante <M tex="b_1+\delta b_2" /> (ce qu'il veut à l'avance) au
          critère du moment <M tex="b_1+\beta\delta b_2" /> (ce qu'il fait vraiment).
        </>
      }
      controls={
        <>
          <ChoiceChips<PresetKey>
            label="Scénarios prêts à l'emploi"
            value={preset}
            onChange={applyPreset}
            options={[
              { value: "jogging", label: "🏃 Jogging" },
              { value: "chips", label: "🍟 Chips" },
              { value: "exo", label: "🏃 Exo du cours" },
            ]}
          />
          <SliderControl
            label={<>Biais de self-contrôle β</>}
            value={beta}
            onChange={custom(setBeta)}
            min={0}
            max={1}
            step={0.05}
            format={(v) => fmtFr(v)}
          />
          <SliderControl
            label={<>Patience δ</>}
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
          le conflit apparaît dès que les deux critères n'ont <strong>pas le même signe</strong> :
          l'unique différence entre eux est le β qui rabote le bénéfice futur b₂ au moment d'agir.
          Mets β = 1 : le conflit disparaît toujours — c'est le retour au rationnel.
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
                  Ex-ante : <M tex="b_1+\delta b_2" />
                </>
              ),
              value: fmtFr(exAnte),
            },
            {
              label: (
                <>
                  Sur le moment : <M tex="b_1+\beta\delta b_2" />
                </>
              ),
              value: fmtFr(moment),
            },
          ]}
        />
        <Verdict tone={tone}>{verdict}</Verdict>
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

const U0_BARS: Array<{ label: string; sub: string; value: number; color: string; em?: boolean }> = [
  { label: "Référence", sub: "plan idéal", value: 3.008, color: "#d97706" },
  { label: "Naïf", sub: "a = 0", value: 2.89, color: "#e11d48", em: true },
  { label: "Cas 1", sub: "outil parfait", value: 3.008, color: "#059669", em: true },
  { label: "Cas 2", sub: "actif coûteux", value: 2.96, color: "#4f46e5" },
  { label: "Cas 3", sub: "+ emprunt", value: 2.93, color: "#4f46e5" },
];

export function U0Chart() {
  // mapping linéaire : U0 = 3,008 → y = 54 ; U0 = 2,85 → y = 240 (base)
  const yOf = (v: number) => 54 + ((3.008 - v) / (3.008 - 2.85)) * (240 - 54);
  const slotW = 78;
  const barW = 50;
  const left = 71;

  return (
    <figure className="my-6 rounded-2xl border bg-card p-4 sm:p-5">
      <figcaption className="mb-2 text-center text-[13.5px] font-semibold text-muted-foreground">
        Utilité ex-ante <M tex="U_0" /> (en unités de β) selon le programme suivi
      </figcaption>
      <svg
        viewBox="0 0 480 300"
        className="mx-auto block h-auto w-full max-w-[520px]"
        role="img"
        aria-label="Comparaison de l'utilité ex-ante des cinq programmes"
      >
        {[3.0, 2.9].map((g) => (
          <g key={g}>
            <line
              x1={52}
              y1={yOf(g)}
              x2={464}
              y2={yOf(g)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={46}
              y={yOf(g) + 4}
              fontSize={11}
              fill="var(--color-muted-foreground)"
              textAnchor="end"
            >
              {fmtFr(g, 2)}
            </text>
          </g>
        ))}
        <line x1={52} y1={240} x2={464} y2={240} stroke="var(--color-muted-foreground)" strokeWidth={1.4} />
        {/* plafond du plan idéal */}
        <line
          x1={52}
          y1={54}
          x2={464}
          y2={54}
          stroke="#d97706"
          strokeWidth={1.3}
          strokeDasharray="5 4"
          opacity={0.8}
        />
        <text x={462} y={49} fontSize={11} fontStyle="italic" fill="#b45309" textAnchor="end">
          plan idéal
        </text>
        {U0_BARS.map((b, i) => {
          const x = left + i * slotW;
          const y = yOf(b.value);
          return (
            <g key={b.label}>
              <rect x={x} y={y} width={barW} height={240 - y} rx={3} fill={b.color} />
              <text
                x={x + barW / 2}
                y={y - 8}
                fontSize={12.5}
                fontWeight={600}
                fill="var(--color-foreground)"
                textAnchor="middle"
              >
                {fmtFr(b.value, b.value === 3.008 ? 3 : 2)}
              </text>
              <text
                x={x + barW / 2}
                y={258}
                fontSize={12}
                fontWeight={b.em ? 600 : 400}
                fill={b.em ? b.color : "var(--color-muted-foreground)"}
                textAnchor="middle"
              >
                {b.label}
              </text>
              <text x={x + barW / 2} y={273} fontSize={10.5} fill="var(--color-muted-foreground)" textAnchor="middle">
                {b.sub}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Axe vertical <strong className="text-foreground/80">zoomé</strong> (2,85 → 3,02) pour rendre
        les petits écarts visibles. Lecture : le naïf (rouge) est tout en bas. Les trois stratégies
        du sophistiqué (Cas 1–3) le dépassent toutes ; le Cas 1 touche même le plafond idéal.
      </p>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Checklist de maîtrise (17 points, cochables)                        */
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
