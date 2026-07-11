/**
 * Chapitre EI1 · Le monopole — composants interactifs et visualisations.
 * Toutes les formules reproduisent exactement celles des slides du cours :
 * demande linéaire p(y) = a − by, coût quadratique c(y) = F + ky + βy²,
 * optimum Rm = Cm, y* = (a−k)/(2(b+β)), surplus & perte sèche, monopole
 * naturel (CM = F/y + k), taxation (profit vs unitaire, demande
 * iso-élastique), concurrence monopolistique avec libre entrée.
 */
import { useState, type ReactNode } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { M } from "@/components/course/Math";
import { InteractiveCard, SliderControl, ChoiceChips } from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Format français : d décimales, virgule. */
export function fmtFr(x: number, d = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(d).replace(".", ",");
}

/* Cadre de tracé (viewBox 480×380), identique aux autres chapitres. */
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
      <text x={fr.R + 4} y={fr.B + 20} fontSize={14} fontStyle="italic" fill={ink} textAnchor="end">
        {xLabel}
      </text>
      <text x={fr.L - 8} y={fr.T - 12} fontSize={14} fontStyle="italic" fill={ink} textAnchor="middle">
        {yLabel}
      </text>
    </g>
  );
}

/** Échantillonne une fonction y ↦ f(y) en polyline, en sautant les points hors cadre. */
function samplePts(fr: Frame, f: (y: number) => number, x0: number, x1: number, N = 90): string {
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N;
    const v = f(x);
    if (!Number.isFinite(v) || v < -0.02 * fr.YM || v > fr.YM * 1.02) continue;
    pts.push(`${fr.X(x).toFixed(1)},${fr.Y(v).toFixed(1)}`);
  }
  return pts.join(" ");
}

function DashGuide({ fr, x, y }: { fr: Frame; x: number; y: number }) {
  return (
    <g>
      <line
        x1={fr.X(x)}
        y1={fr.B}
        x2={fr.X(x)}
        y2={fr.Y(y)}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <line
        x1={fr.L}
        y1={fr.Y(y)}
        x2={fr.X(x)}
        y2={fr.Y(y)}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
    </g>
  );
}

/* Couleurs fidèles au code couleur des slides :
   demande = noir (foreground), Rm = vert, cm = rouge, CM = bleu/indigo. */
const COL = {
  demand: "var(--color-foreground)",
  rm: "#059669",
  cm: "#dc2626",
  cmoy: "#4f46e5",
  accent: "#d97706",
  sc: "#facc15",
  sp: "#0d9488",
  dwl: "#dc2626",
} as const;

/* ------------------------------------------------------------------ */
/* Petits blocs de mise en page                                        */
/* ------------------------------------------------------------------ */

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
    good: {
      frame: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30",
      title: "text-emerald-700 dark:text-emerald-400",
    },
    bad: {
      frame: "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30",
      title: "text-rose-700 dark:text-rose-400",
    },
    gold: {
      frame: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30",
      title: "text-amber-700 dark:text-amber-400",
    },
  };
  const t = tones[tone];
  return (
    <div className={cn("rounded-xl border p-4", t.frame)}>
      <div className={cn("mb-1.5 text-[13.5px] font-bold", t.title)}>{title}</div>
      <div className="text-[14.5px] leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}

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

export function Verdict({
  tone,
  children,
}: {
  tone: "good" | "bad" | "info" | "neutral";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    good: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    bad: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
    info: "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
    neutral: "border-border bg-muted text-muted-foreground",
  };
  return (
    <div className={cn("mt-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium leading-relaxed", tones[tone])}>
      {children}
    </div>
  );
}

/** Légende compacte (carrés colorés) pour les zones de surplus. */
function LegendRow({ items }: { items: Array<{ color: string; label: ReactNode }> }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Figure statique : preneur de prix vs faiseur de prix                */
/* ------------------------------------------------------------------ */

export function PriceTakerFigure() {
  const ink = "var(--color-foreground)";
  const mut = "var(--color-muted-foreground)";
  return (
    <figure className="my-6 rounded-2xl border bg-card p-4 sm:p-5">
      <figcaption className="mb-3 text-center text-[13.5px] font-semibold text-muted-foreground">
        La demande vue par UNE firme : concurrence parfaite vs monopole
      </figcaption>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <svg viewBox="0 0 240 190" className="mx-auto block h-auto w-full max-w-[300px]" role="img" aria-label="Demande parfaitement élastique en concurrence parfaite">
            <line x1={34} y1={160} x2={226} y2={160} stroke={ink} strokeWidth={1.5} />
            <line x1={34} y1={160} x2={34} y2={18} stroke={ink} strokeWidth={1.5} />
            <line x1={34} y1={70} x2={218} y2={70} stroke="#e11d48" strokeWidth={2.6} />
            <text x={28} y={74} fontSize={11.5} fill="#e11d48" textAnchor="end" fontStyle="italic">
              p̄
            </text>
            <text x={126} y={58} fontSize={11} fill={mut} textAnchor="middle">
              demande perçue : plate
            </text>
            <text x={222} y={176} fontSize={11} fill={mut} textAnchor="end" fontStyle="italic">
              y
            </text>
            <text x={30} y={14} fontSize={11} fill={mut} fontStyle="italic">
              €
            </text>
          </svg>
          <p className="mt-1 text-center text-[13px] leading-snug text-muted-foreground">
            <strong className="text-foreground">Concurrence parfaite.</strong> Au prix de marché{" "}
            p̄, la firme vend tout ce qu'elle veut ; 1 centime au-dessus, elle ne vend plus rien.
          </p>
        </div>
        <div>
          <svg viewBox="0 0 240 190" className="mx-auto block h-auto w-full max-w-[300px]" role="img" aria-label="Demande décroissante face au monopole">
            <line x1={34} y1={160} x2={226} y2={160} stroke={ink} strokeWidth={1.5} />
            <line x1={34} y1={160} x2={34} y2={18} stroke={ink} strokeWidth={1.5} />
            <line x1={34} y1={34} x2={210} y2={152} stroke="#e11d48" strokeWidth={2.6} />
            <text x={126} y={70} fontSize={11} fill={mut} textAnchor="middle">
              demande du marché : décroissante
            </text>
            <text x={222} y={176} fontSize={11} fill={mut} textAnchor="end" fontStyle="italic">
              y
            </text>
            <text x={30} y={14} fontSize={11} fill={mut} fontStyle="italic">
              €
            </text>
          </svg>
          <p className="mt-1 text-center text-[13px] leading-snug text-muted-foreground">
            <strong className="text-foreground">Monopole.</strong> La firme EST le marché : pour
            vendre plus, elle doit baisser son prix — et elle le sait.
          </p>
        </div>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 1 : la demande linéaire p(y) = a − by                        */
/* ------------------------------------------------------------------ */

export function DemandPlayground() {
  const [a, setA] = useState(10);
  const [b, setB] = useState(1);
  const [y, setY] = useState(4);

  const yMaxDom = a / b;
  const yc = Math.min(y, yMaxDom);
  const p = Math.max(0, a - b * yc);
  const fr = makeFrame(Math.max(12, yMaxDom * 1.12), 15.5);

  const showStep = yc + 1 <= yMaxDom;
  const pAfter = a - b * (yc + 1);

  return (
    <InteractiveCard
      title={
        <>
          La demande linéaire <M tex="p(y) = a - by" /> en direct
        </>
      }
      subtitle="Bouge a (l'ordonnée à l'origine), b (la pente) et la production y : lis le prix qui en résulte."
      controls={
        <>
          <SliderControl label={<>Paramètre a</>} value={a} onChange={setA} min={6} max={14} step={1} format={(v) => `${v} €`} />
          <SliderControl label={<>Paramètre b</>} value={b} onChange={setB} min={0.5} max={2} step={0.25} format={(v) => `${fmtFr(v)} €`} />
          <SliderControl label={<>Production y</>} value={y} onChange={setY} min={0} max={12} step={0.5} format={(v) => fmtFr(v, 1)} />
        </>
      }
      footer={
        <>
          monter <M tex="a" /> translate la droite vers le haut (les consommateurs valorisent plus
          le bien) ; monter <M tex="b" /> la rend plus pentue (chaque unité produite en plus fait
          chuter le prix de <M tex="b" /> € — regarde la petite « marche » sur le graphique). Les
          deux extrémités à connaître : prix maximal <M tex="a" /> (plus personne n'achète
          au-dessus) et quantité maximale <M tex="a/b" /> (il faut un prix nul pour tout écouler).
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Droite de demande linéaire">
          <PlotAxes fr={fr} xLabel="y (production)" yLabel="p (€)" />
          {/* droite de demande */}
          <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(yMaxDom)} y2={fr.Y(0)} stroke="#e11d48" strokeWidth={2.6} />
          {/* intercepts */}
          <circle cx={fr.X(0)} cy={fr.Y(a)} r={4.5} fill={COL.demand} />
          <text x={fr.L - 8} y={fr.Y(a) + 4} fontSize={12} fontStyle="italic" fill={COL.demand} textAnchor="end">
            a
          </text>
          <circle cx={fr.X(yMaxDom)} cy={fr.Y(0)} r={4.5} fill={COL.demand} />
          <text x={fr.X(yMaxDom)} y={fr.B + 17} fontSize={12} fontStyle="italic" fill={COL.demand} textAnchor="middle">
            a/b
          </text>
          {/* marche unitaire : -b € */}
          {showStep ? (
            <g>
              <line x1={fr.X(yc)} y1={fr.Y(p)} x2={fr.X(yc + 1)} y2={fr.Y(p)} stroke={COL.accent} strokeWidth={1.6} strokeDasharray="3 3" />
              <line x1={fr.X(yc + 1)} y1={fr.Y(p)} x2={fr.X(yc + 1)} y2={fr.Y(pAfter)} stroke={COL.accent} strokeWidth={1.6} />
              <text x={fr.X(yc + 1) + 6} y={(fr.Y(p) + fr.Y(pAfter)) / 2 + 4} fontSize={11.5} fontWeight={600} fill={COL.accent}>
                −b €
              </text>
            </g>
          ) : null}
          {/* point choisi */}
          <DashGuide fr={fr} x={yc} y={p} />
          <circle cx={fr.X(yc)} cy={fr.Y(p)} r={5.5} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
          <text x={fr.L - 7} y={fr.Y(p) - 6} fontSize={11.5} fontStyle="italic" fill="#e11d48" textAnchor="end">
            p(y)
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              { label: <>Prix maximal (y = 0)</>, value: <>{fmtFr(a, 0)} €</> },
              { label: <>Quantité de saturation a/b</>, value: fmtFr(yMaxDom, 1) },
              {
                label: (
                  <>
                    Prix de marché <M tex="p(y)=a-by" />
                  </>
                ),
                value: <>{fmtFr(p)} €</>,
              },
            ]}
          />
          {p === 0 ? (
            <Verdict tone="bad">
              Marché saturé : pour écouler autant d'unités, le prix doit tomber à 0 €. Produire
              au-delà de <M tex="a/b" /> ne sert à rien.
            </Verdict>
          ) : (
            <Verdict tone="info">
              À la production {fmtFr(yc, 1)}, le marché absorbe tout au prix de {fmtFr(p)} €. Une
              unité de plus ferait baisser le prix de {fmtFr(b)} €.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 2 : le vendeur de glaces sur la plage (demandes unitaires)   */
/* Formules des slides : achat ssi x < (r−p)/t ; y = (r−p)/t           */
/* ------------------------------------------------------------------ */

export function BeachWidget() {
  const r = 10;
  const [p, setP] = useState(6);
  const [t, setT] = useState(5);

  const xHat = (r - p) / t; // consommateur marginal
  const y = Math.max(0, Math.min(1, xHat));

  // géométrie de la plage
  const L = 40;
  const R = 440;
  const X = (d: number) => L + d * (R - L);

  return (
    <InteractiveCard
      title="Le vendeur de glaces sur la plage — d'où sort la demande linéaire ?"
      subtitle={
        <>
          Bénéfice d'une glace fixé à <M tex="r = 10" /> €. Bouge le prix <M tex="p" /> et le coût
          de transport <M tex="t" /> : le segment bleu = les baigneurs qui achètent.
        </>
      }
      controls={
        <>
          <SliderControl label={<>Prix p de la glace</>} value={p} onChange={setP} min={1} max={10} step={0.5} format={(v) => `${fmtFr(v, 1)} €`} />
          <SliderControl label={<>Coût de transport t</>} value={t} onChange={setT} min={2} max={9} step={0.5} format={(v) => `${fmtFr(v, 1)} €/km`} />
        </>
      }
      footer={
        <>
          quand tu baisses <M tex="p" />, le consommateur marginal <M tex="\hat{x}=(r-p)/t" />{" "}
          s'éloigne : le segment bleu s'allonge <em>linéairement</em>. La demande totale vaut donc{" "}
          <M tex="y = \tfrac{1}{t}(r-p)" />, c'est-à-dire <M tex="p = r - ty" /> : une droite
          décroissante avec <M tex="a = r" /> et <M tex="b = t" />. Des milliers de « oui/non »
          individuels fabriquent UNE courbe de demande lisse.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 150" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Plage de 1 km : qui achète une glace ?">
          {/* la plage */}
          <line x1={L} y1={92} x2={R + 10} y2={92} stroke="var(--color-foreground)" strokeWidth={1.6} />
          <path d={`M${R + 10} 92 l-7 -4 v8 z`} fill="var(--color-foreground)" />
          {[0, 0.25, 0.5, 0.75, 1].map((d) => (
            <g key={d}>
              <line x1={X(d)} y1={88} x2={X(d)} y2={96} stroke="var(--color-foreground)" strokeWidth={1.2} />
              <text x={X(d)} y={112} fontSize={10.5} fill="var(--color-muted-foreground)" textAnchor="middle">
                {fmtFr(d, 2)}
              </text>
            </g>
          ))}
          <text x={R + 6} y={112} fontSize={11} fontStyle="italic" fill="var(--color-muted-foreground)" textAnchor="end">
            distance (km)
          </text>
          {/* vendeur */}
          <text x={L} y={36} fontSize={11.5} fontWeight={700} fill="var(--color-foreground)" textAnchor="middle">
            vendeur
          </text>
          <circle cx={L} cy={50} r={5} fill={COL.accent} />
          {/* segment acheteurs */}
          {y > 0 ? (
            <rect x={L} y={70} width={Math.max(0, X(y) - L)} height={9} rx={3} fill="#2563eb" />
          ) : null}
          {/* segment non-acheteurs */}
          {y < 1 ? (
            <rect x={X(y)} y={70} width={Math.max(0, X(1) - X(y))} height={9} rx={3} fill="#e11d48" opacity={0.55} />
          ) : null}
          {y > 0 ? (
            <text x={(L + X(Math.min(y, 1))) / 2} y={64} fontSize={11} fontWeight={600} fill="#2563eb" textAnchor="middle">
              achat
            </text>
          ) : null}
          {y < 0.92 ? (
            <text x={(X(y) + X(1)) / 2} y={64} fontSize={11} fontWeight={600} fill="#e11d48" textAnchor="middle">
              pas d'achat
            </text>
          ) : null}
          {/* consommateur marginal */}
          {y > 0 && y < 1 ? (
            <g>
              <line x1={X(y)} y1={66} x2={X(y)} y2={96} stroke="var(--color-foreground)" strokeWidth={1.4} strokeDasharray="4 3" />
              <text x={X(y)} y={135} fontSize={11} fontStyle="italic" fill="var(--color-foreground)" textAnchor="middle">
                x̂ = (r−p)/t = {fmtFr(xHat, 2)}
              </text>
            </g>
          ) : null}
        </svg>
        <div>
          <Readout
            rows={[
              {
                label: (
                  <>
                    Consommateur marginal <M tex="\hat{x}" />
                  </>
                ),
                value: fmtFr(xHat, 2),
              },
              { label: <>Demande y (fraction de la plage)</>, value: fmtFr(y, 2) },
              {
                label: (
                  <>
                    Vérification <M tex="p = r - ty" />
                  </>
                ),
                value: <>{fmtFr(r - t * y, 2)} €</>,
              },
            ]}
          />
          {y <= 0 ? (
            <Verdict tone="bad">
              Personne n'achète : même le baigneur collé au vendeur (x = 0) trouverait la glace
              trop chère par rapport à son bénéfice r.
            </Verdict>
          ) : y >= 1 ? (
            <Verdict tone="good">
              Toute la plage achète ! Même le baigneur du kilomètre 1 y gagne : r − t·1 − p ≥ 0.
            </Verdict>
          ) : (
            <Verdict tone="info">
              Le baigneur situé en x̂ = {fmtFr(xHat, 2)} km est exactement indifférent : au-delà, le
              trajet coûte plus que le plaisir de la glace.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 3 : recette totale vs coût total, pentes et profit           */
/* a=12, b=1, F=8, k=2, β=0,25 → y* = (a−k)/(2(b+β)) = 4               */
/* ------------------------------------------------------------------ */

export function ProfitCurvesWidget() {
  const a = 12;
  const b = 1;
  const F = 8;
  const k = 2;
  const beta = 0.25;
  const [y, setY] = useState(1.5);

  const Rf = (v: number) => (a - b * v) * v;
  const cf = (v: number) => F + k * v + beta * v * v;
  const Rm = a - 2 * b * y;
  const cm = k + 2 * beta * y;
  const Ry = Rf(y);
  const cy = cf(y);
  const profit = Ry - cy;
  const yStar = (a - k) / (2 * (b + beta)); // = 4

  const fr = makeFrame(9.7, 48);
  const tang = (x0: number, f0: number, slope: number, halfW: number) => ({
    x1: fr.X(x0 - halfW),
    y1: fr.Y(f0 - slope * halfW),
    x2: fr.X(x0 + halfW),
    y2: fr.Y(f0 + slope * halfW),
  });
  const tR = tang(y, Ry, Rm, 1.1);
  const tC = tang(y, cy, cm, 1.1);

  const state: "up" | "down" | "opt" = Math.abs(Rm - cm) < 0.16 ? "opt" : Rm > cm ? "up" : "down";

  return (
    <InteractiveCard
      title={
        <>
          Trouve le sommet du profit — <M tex="R(y)" /> contre <M tex="c(y)" />
        </>
      }
      subtitle={
        <>
          Demande <M tex="p = 12 - y" />, coût <M tex="c(y) = 8 + 2y + 0{,}25y^2" />. Déplace la
          production et compare les <em>pentes</em> des deux courbes (les petits segments
          tangents).
        </>
      }
      controls={
        <SliderControl label={<>Production y</>} value={y} onChange={setY} min={0.5} max={9} step={0.1} format={(v) => fmtFr(v, 1)} />
      }
      footer={
        <>
          le profit est l'écart vertical entre la cloche <M tex="R(y)" /> et la courbe de coût{" "}
          <M tex="c(y)" />. Cet écart est maximal exactement là où les deux tangentes deviennent{" "}
          <strong>parallèles</strong> : pente de la recette = pente du coût, c'est-à-dire{" "}
          <M tex="Rm(y^*) = cm(y^*)" /> (ici en <M tex="y^* = 4" />). Avant, la recette grimpe plus
          vite que le coût (produis plus !) ; après, c'est l'inverse (produis moins !).
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Recette totale et coût total selon la production">
          <PlotAxes fr={fr} xLabel="y" yLabel="€" />
          {/* repère y* */}
          <line x1={fr.X(yStar)} y1={fr.B} x2={fr.X(yStar)} y2={fr.T} stroke="var(--color-border)" strokeWidth={1.2} strokeDasharray="5 4" />
          <text x={fr.X(yStar)} y={fr.T - 6} fontSize={11.5} fontStyle="italic" fill="var(--color-muted-foreground)" textAnchor="middle">
            y* = 4
          </text>
          {/* courbes */}
          <polyline points={samplePts(fr, Rf, 0, 9.5)} fill="none" stroke={COL.rm} strokeWidth={2.4} />
          <polyline points={samplePts(fr, cf, 0, 9.5)} fill="none" stroke={COL.cm} strokeWidth={2.4} />
          <text x={fr.X(6.4)} y={fr.Y(Rf(6.4)) - 10} fontSize={12.5} fontStyle="italic" fill={COL.rm}>
            R(y)
          </text>
          <text x={fr.X(8.2)} y={fr.Y(cf(8.2)) - 10} fontSize={12.5} fontStyle="italic" fill={COL.cm}>
            c(y)
          </text>
          <text x={fr.L - 8} y={fr.Y(F) + 4} fontSize={11.5} fontStyle="italic" fill={COL.cm} textAnchor="end">
            F
          </text>
          {/* segment profit */}
          <line x1={fr.X(y)} y1={fr.Y(cy)} x2={fr.X(y)} y2={fr.Y(Ry)} stroke={profit >= 0 ? COL.rm : COL.cm} strokeWidth={3.4} opacity={0.55} />
          {/* tangentes */}
          <line {...tR} stroke={COL.rm} strokeWidth={1.8} strokeDasharray="6 3" />
          <line {...tC} stroke={COL.cm} strokeWidth={1.8} strokeDasharray="6 3" />
          <circle cx={fr.X(y)} cy={fr.Y(Ry)} r={5} fill={COL.rm} stroke="var(--color-card)" strokeWidth={2} />
          <circle cx={fr.X(y)} cy={fr.Y(cy)} r={5} fill={COL.cm} stroke="var(--color-card)" strokeWidth={2} />
        </svg>
        <div>
          <Readout
            rows={[
              { label: <>Recette R(y)</>, value: <>{fmtFr(Ry)} €</> },
              { label: <>Coût c(y)</>, value: <>{fmtFr(cy)} €</> },
              { label: <>Profit Π(y)</>, value: <>{fmtFr(profit)} €</> },
              { label: <>Pente Rm(y)</>, value: fmtFr(Rm) },
              { label: <>Pente cm(y)</>, value: fmtFr(cm) },
            ]}
          />
          {state === "opt" ? (
            <Verdict tone="good">
              Tangentes parallèles : <M tex="Rm = cm" />. Tu es (quasi) au sommet du profit —
              c'est l'optimum du monopole.
            </Verdict>
          ) : state === "up" ? (
            <Verdict tone="info">
              <M tex="Rm > cm" /> : la dernière unité rapporte plus qu'elle ne coûte.{" "}
              <strong>Augmente la production.</strong>
            </Verdict>
          ) : (
            <Verdict tone="bad">
              <M tex="Rm < cm" /> : la dernière unité coûte plus qu'elle ne rapporte.{" "}
              <strong>Réduis la production.</strong>
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 4 : effet quantité vs effet prix (Rm < p)                    */
/* Demande p = 12 − y : à 10 € on vend 2, à 9 € on vend 3 (slide 25)   */
/* ------------------------------------------------------------------ */

export function MarginalRevenueWidget() {
  const A = 12; // p = 12 − y
  const [n, setN] = useState(2);

  const p0 = A - n;
  const p1 = A - (n + 1);
  const R0 = n * p0;
  const R1 = (n + 1) * p1;
  const rm = R1 - R0; // = p1 − n

  const fr = makeFrame(12.6, 13);

  return (
    <InteractiveCard
      title="Effet quantité vs effet prix : pourquoi Rm est plus petit que le prix"
      subtitle={
        <>
          Demande <M tex="p = 12 - y" />. Tu vends déjà <M tex="y" /> unités ; pour en vendre une
          de plus, tu dois baisser le prix de 1 € <em>sur toutes les unités</em>.
        </>
      }
      controls={
        <SliderControl label={<>Unités déjà vendues y</>} value={n} onChange={setN} min={1} max={8} step={1} format={(v) => String(v)} />
      }
      footer={
        <>
          le rectangle <span className="font-semibold text-emerald-600">vert</span> est ce que la
          nouvelle unité rapporte (le prix) ; le rectangle{" "}
          <span className="font-semibold text-rose-600">rouge</span> est ce que la baisse de prix
          te fait perdre sur les anciennes unités. La recette marginale, c'est le vert MOINS le
          rouge : toujours inférieure au prix. Pousse le curseur : à partir d'un moment, le rouge
          dépasse le vert et vendre plus <em>détruit</em> de la recette (Rm devient négative).
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Décomposition de la recette marginale en effet quantité et effet prix">
          <PlotAxes fr={fr} xLabel="y" yLabel="p (€)" />
          {/* recette conservée */}
          <rect x={fr.X(0)} y={fr.Y(p1)} width={fr.X(n) - fr.X(0)} height={fr.Y(0) - fr.Y(p1)} fill="var(--color-muted)" opacity={0.85} />
          {/* effet prix (perte) */}
          <rect x={fr.X(0)} y={fr.Y(p0)} width={fr.X(n) - fr.X(0)} height={fr.Y(p1) - fr.Y(p0)} fill="#e11d48" opacity={0.45} />
          {/* effet quantité (gain) */}
          <rect x={fr.X(n)} y={fr.Y(p1)} width={fr.X(n + 1) - fr.X(n)} height={fr.Y(0) - fr.Y(p1)} fill="#059669" opacity={0.45} />
          {/* droite de demande */}
          <line x1={fr.X(0)} y1={fr.Y(A)} x2={fr.X(A)} y2={fr.Y(0)} stroke={COL.demand} strokeWidth={2.2} />
          <text x={fr.X(10.2)} y={fr.Y(A - 10.2) - 8} fontSize={12} fontStyle="italic" fill={COL.demand}>
            p = 12 − y
          </text>
          {/* points avant/après */}
          <circle cx={fr.X(n)} cy={fr.Y(p0)} r={5} fill={COL.demand} stroke="var(--color-card)" strokeWidth={2} />
          <circle cx={fr.X(n + 1)} cy={fr.Y(p1)} r={5} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
          <text x={fr.L - 7} y={fr.Y(p0) + 4} fontSize={11} fill="var(--color-muted-foreground)" textAnchor="end">
            {p0} €
          </text>
          <text x={fr.L - 7} y={fr.Y(p1) + 12} fontSize={11} fill="#e11d48" textAnchor="end">
            {p1} €
          </text>
          <text x={fr.X(n)} y={fr.B + 16} fontSize={11} fill="var(--color-muted-foreground)" textAnchor="middle">
            {n}
          </text>
          <text x={fr.X(n + 1)} y={fr.B + 16} fontSize={11} fill="#e11d48" textAnchor="middle">
            {n + 1}
          </text>
          {/* étiquettes zones */}
          <text x={(fr.X(n) + fr.X(n + 1)) / 2} y={fr.Y(p1 / 2)} fontSize={11} fontWeight={700} fill="#047857" textAnchor="middle">
            +{p1}
          </text>
          <text x={(fr.X(0) + fr.X(n)) / 2} y={(fr.Y(p0) + fr.Y(p1)) / 2 + 4} fontSize={11} fontWeight={700} fill="#be123c" textAnchor="middle">
            −{n}
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              {
                label: (
                  <>
                    Recette avec {n} unités <M tex="R(y)" />
                  </>
                ),
                value: <>{R0} €</>,
              },
              {
                label: (
                  <>
                    Recette avec {n + 1} unités <M tex="R(y+1)" />
                  </>
                ),
                value: <>{R1} €</>,
              },
              { label: <>Effet quantité (prix encaissé)</>, value: <>+{p1} €</> },
              { label: <>Effet prix (−1 € × {n} unités)</>, value: <>−{n} €</> },
              { label: <>Recette marginale Rm</>, value: <>{rm} €</> },
            ]}
          />
          {rm < 0 ? (
            <Verdict tone="bad">
              Rm = {rm} € : vendre la {n + 1}
              <sup>e</sup> unité fait carrément <strong>baisser</strong> la recette totale. Le
              rouge a englouti le vert.
            </Verdict>
          ) : (
            <Verdict tone="info">
              La {n + 1}
              <sup>e</sup> unité se vend {p1} €, mais ne rapporte que {rm} € : la baisse de prix
              sacrifie {n} € sur les unités déjà vendues. <M tex="Rm < p" />, toujours.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 5 : l'optimum du monopole (demande, Rm, cm)                  */
/* y* = (a−k)/(2(b+β)) avec b = 1, F = 10                              */
/* ------------------------------------------------------------------ */

export function MonopolyOptimumWidget() {
  const b = 1;
  const F = 10;
  const [a, setA] = useState(12);
  const [k, setK] = useState(2);
  const [beta, setBeta] = useState(0.5);

  const yStar = (a - k) / (2 * (b + beta));
  const pStar = a - b * yStar;
  const mcStar = k + 2 * beta * yStar;
  const profit = pStar * yStar - (F + k * yStar + beta * yStar * yStar);

  const fr = makeFrame(17, 17);
  const cmEnd = beta > 0 ? Math.min(16.6, (16.4 - k) / (2 * beta)) : 16.6;

  return (
    <InteractiveCard
      title="L'optimum du monopole : Rm = Cm, prix lu sur la demande"
      subtitle={
        <>
          Demande <M tex="p = a - y" />, coût <M tex="c(y) = 10 + ky + \beta y^2" />. Bouge les
          paramètres et regarde <M tex="y^*" />, <M tex="p^*" /> et le profit réagir.
        </>
      }
      controls={
        <>
          <SliderControl label={<>Taille du marché a</>} value={a} onChange={setA} min={8} max={16} step={0.5} format={(v) => fmtFr(v, 1)} />
          <SliderControl label={<>Coût marginal de base k</>} value={k} onChange={setK} min={1} max={6} step={0.5} format={(v) => fmtFr(v, 1)} />
          <SliderControl label={<>Convexité du coût β</>} value={beta} onChange={setBeta} min={0} max={1.5} step={0.25} format={(v) => fmtFr(v)} />
        </>
      }
      footer={
        <>
          la droite verte <M tex="Rm" /> part du même point <M tex="a" /> que la demande mais
          descend <strong>deux fois plus vite</strong> (elle coupe l'axe en <M tex="a/2b" /> au
          lieu de <M tex="a/b" />). L'optimum est à l'intersection <M tex="Rm = cm" /> — mais le
          prix <M tex="p^*" /> se lit <strong>au-dessus, sur la demande</strong>. Monte{" "}
          <M tex="k" /> : le monopole produit moins et vend plus cher. Monte <M tex="a" /> : tout
          augmente. Le coût fixe F = 10 ne change jamais <M tex="y^*" /> — il ne fait que raboter
          le profit.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Optimum du monopole : demande, recette marginale et coût marginal">
          <PlotAxes fr={fr} xLabel="y" yLabel="€" />
          {/* demande */}
          <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(Math.min(a / b, 16.8))} y2={fr.Y(Math.max(0, a - b * 16.8))} stroke={COL.demand} strokeWidth={2.4} />
          <text x={fr.X(Math.min(a / b, 15) * 0.82)} y={fr.Y(a - b * Math.min(a / b, 15) * 0.82) - 9} fontSize={12} fontStyle="italic" fill={COL.demand}>
            p(y) = a − by
          </text>
          {/* Rm */}
          <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(a / (2 * b))} y2={fr.Y(0)} stroke={COL.rm} strokeWidth={2.2} />
          <text x={fr.X(a / (2 * b)) + 6} y={fr.B - 6} fontSize={12} fontStyle="italic" fill={COL.rm}>
            Rm = a − 2by
          </text>
          {/* cm */}
          <line x1={fr.X(0)} y1={fr.Y(k)} x2={fr.X(cmEnd)} y2={fr.Y(k + 2 * beta * cmEnd)} stroke={COL.cm} strokeWidth={2.2} />
          <text x={fr.L - 8} y={fr.Y(k) + 4} fontSize={12} fontStyle="italic" fill={COL.cm} textAnchor="end">
            k
          </text>
          <text x={fr.X(Math.min(cmEnd, 13.5)) - 4} y={fr.Y(k + 2 * beta * Math.min(cmEnd, 13.5)) - 8} fontSize={12} fontStyle="italic" fill={COL.cm} textAnchor="end">
            cm = k + 2βy
          </text>
          {/* optimum */}
          <DashGuide fr={fr} x={yStar} y={pStar} />
          <circle cx={fr.X(yStar)} cy={fr.Y(mcStar)} r={5} fill={COL.rm} stroke="var(--color-card)" strokeWidth={2} />
          <circle cx={fr.X(yStar)} cy={fr.Y(pStar)} r={5.5} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
          <text x={fr.X(yStar)} y={fr.B + 16} fontSize={12} fontStyle="italic" fontWeight={700} fill="#e11d48" textAnchor="middle">
            y*
          </text>
          <text x={fr.L - 7} y={fr.Y(pStar) - 6} fontSize={12} fontStyle="italic" fontWeight={700} fill="#e11d48" textAnchor="end">
            p*
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              {
                label: (
                  <>
                    Production <M tex="y^* = \tfrac{a-k}{2(b+\beta)}" />
                  </>
                ),
                value: fmtFr(yStar),
              },
              {
                label: (
                  <>
                    Prix <M tex="p^* = a - by^*" />
                  </>
                ),
                value: <>{fmtFr(pStar)} €</>,
              },
              { label: <>Rm(y*) = cm(y*)</>, value: fmtFr(mcStar) },
              { label: <>Profit Π (avec F = 10)</>, value: <>{fmtFr(profit)} €</> },
            ]}
          />
          {profit >= 0 ? (
            <Verdict tone="good">
              Marge unitaire p* − cm = {fmtFr(pStar - mcStar)} € : c'est le pouvoir de marché.
              Note l'écart : le prix p* est bien AU-DESSUS du point d'intersection Rm = cm.
            </Verdict>
          ) : (
            <Verdict tone="bad">
              Même en tarifant comme un monopole, le coût fixe F = 10 n'est pas couvert : la
              firme perd de l'argent sur ce marché trop petit.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 6 : élasticité, marge et indice de Lerner                    */
/* p = k/(1 − 1/ε) avec cm constant k = 10                             */
/* ------------------------------------------------------------------ */

export function LernerWidget() {
  const k = 10;
  const [eps, setEps] = useState(2);

  const p = k / (1 - 1 / eps);
  const margin = p - k;
  const lerner = 1 / eps;

  const maxP = 52;
  const L = 46;
  const R = 452;
  const W = (v: number) => Math.min(1, v / maxP) * (R - L);

  return (
    <InteractiveCard
      title="Le pouvoir de marché en un curseur : ε, marge et indice de Lerner"
      subtitle={
        <>
          Coût marginal constant <M tex="k = 10" /> €. Bouge l'élasticité <M tex="\varepsilon" />{" "}
          de la demande : le prix optimal du monopole vaut <M tex="p = k/(1-\tfrac{1}{\varepsilon})" />.
        </>
      }
      controls={
        <SliderControl label={<>Élasticité ε</>} value={eps} onChange={setEps} min={1.25} max={10} step={0.05} format={(v) => fmtFr(v)} />
      }
      footer={
        <>
          quand <M tex="\varepsilon" /> est énorme (clients très volatils), la barre orange
          disparaît : le prix colle au coût marginal, comme en concurrence parfaite. Quand{" "}
          <M tex="\varepsilon" /> s'approche de 1 (clients captifs), la marge explose. L'indice de
          Lerner <M tex="\tfrac{p-k}{p} = \tfrac{1}{\varepsilon}" /> résume tout ça par un nombre
          entre 0 et 1, comparable d'un secteur à l'autre.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 150" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Décomposition du prix du monopole en coût marginal et marge">
          <text x={L} y={26} fontSize={11.5} fontWeight={600} fill="var(--color-muted-foreground)">
            prix p = coût marginal + marge
          </text>
          {/* barre du prix */}
          <rect x={L} y={40} width={W(k)} height={30} rx={4} fill="var(--color-muted-foreground)" opacity={0.55} />
          <rect x={L + W(k)} y={40} width={Math.max(0, W(p) - W(k))} height={30} rx={4} fill={COL.accent} />
          <text x={L + W(k) / 2} y={60} fontSize={12} fontWeight={700} fill="var(--color-card)" textAnchor="middle">
            k = 10
          </text>
          {margin > 3 ? (
            <text x={L + W(k) + (W(p) - W(k)) / 2} y={60} fontSize={12} fontWeight={700} fill="#fff" textAnchor="middle">
              +{fmtFr(margin, 1)}
            </text>
          ) : null}
          <text x={L + W(p)} y={90} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)" textAnchor="middle">
            p = {fmtFr(p, 1)} €
          </text>
          {/* graduation repère : concurrence parfaite */}
          <line x1={L + W(k)} y1={36} x2={L + W(k)} y2={74} stroke={COL.cm} strokeWidth={1.4} strokeDasharray="4 3" />
          <text x={L + W(k)} y={110} fontSize={10.5} fill={COL.cm} textAnchor="middle">
            prix de concurrence (p = k)
          </text>
          {/* jauge Lerner */}
          <rect x={L} y={122} width={R - L} height={8} rx={4} fill="var(--color-muted)" />
          <rect x={L} y={122} width={(R - L) * lerner} height={8} rx={4} fill="#4f46e5" />
          <text x={R} y={144} fontSize={10.5} fill="#4f46e5" textAnchor="end">
            Lerner = {fmtFr(lerner)}
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              {
                label: (
                  <>
                    Prix <M tex="p = \tfrac{k}{1-1/\varepsilon}" />
                  </>
                ),
                value: <>{fmtFr(p)} €</>,
              },
              {
                label: (
                  <>
                    Marge <M tex="p - k = \tfrac{k}{\varepsilon-1}" />
                  </>
                ),
                value: <>{fmtFr(margin)} €</>,
              },
              {
                label: (
                  <>
                    Lerner <M tex="\tfrac{p-k}{p} = \tfrac{1}{\varepsilon}" />
                  </>
                ),
                value: fmtFr(lerner),
              },
            ]}
          />
          {eps <= 1.6 ? (
            <Verdict tone="bad">
              Demande très rigide (clients captifs) : le monopole raréfie l'offre et fait flamber
              le prix — {fmtFr(p / k, 1)} fois le coût marginal !
            </Verdict>
          ) : eps >= 6 ? (
            <Verdict tone="good">
              Demande très élastique : au moindre écart de prix, les clients fuient. Le monopole
              est forcé de tarifer presque au coût marginal — on retrouve la concurrence parfaite.
            </Verdict>
          ) : (
            <Verdict tone="info">
              Chaque hausse de prix de 1 % fait fuir {fmtFr(eps, 1)} % de la demande. Le monopole
              s'arrête pile où la marge relative vaut 1/ε.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 7 : surplus et perte sèche — monopole vs efficacité          */
/* a = 12, b = 1, cm(y) = k + y (β = 0,5)                              */
/* ------------------------------------------------------------------ */

export function SurplusWidget() {
  const a = 12;
  const b = 1;
  const beta = 0.5;
  const [k, setK] = useState(2);
  const [mode, setMode] = useState<"mono" | "eff">("mono");

  const yStar = (a - k) / (2 * (b + beta)); // (a−k)/3
  const pStar = a - b * yStar;
  const cmStar = k + 2 * beta * yStar;
  const yE = (a - k) / (b + 2 * beta); // (a−k)/2
  const pE = a - b * yE;

  const scM = (b * yStar * yStar) / 2;
  const spM = (pStar - k) * yStar - beta * yStar * yStar;
  const scE = (b * yE * yE) / 2;
  const spE = (pE - k) * yE - beta * yE * yE;
  const dwl = scE + spE - scM - spM;

  const fr = makeFrame(12.6, 13.4);
  const P = (x: number, v: number) => `${fr.X(x).toFixed(1)},${fr.Y(v).toFixed(1)}`;

  const isMono = mode === "mono";
  const sc = isMono ? scM : scE;
  const sp = isMono ? spM : spE;

  return (
    <InteractiveCard
      title="Surplus du consommateur, surplus du producteur… et perte sèche"
      subtitle={
        <>
          Demande <M tex="p = 12 - y" />, coût marginal <M tex="cm = k + y" />. Compare le marché
          efficace (<M tex="p = cm" />) et le monopole (<M tex="Rm = cm" />).
        </>
      }
      controls={
        <>
          <ChoiceChips<"mono" | "eff">
            label="Organisation du marché"
            value={mode}
            onChange={setMode}
            options={[
              { value: "eff", label: "Efficace : p = Cm" },
              { value: "mono", label: "Monopole : Rm = Cm" },
            ]}
          />
          <SliderControl label={<>Coût marginal de base k</>} value={k} onChange={setK} min={0} max={6} step={0.5} format={(v) => fmtFr(v, 1)} />
        </>
      }
      footer={
        <>
          en passant d'« efficace » à « monopole », le prix monte et la quantité baisse : le
          surplus des consommateurs (jaune) fond — une partie est transférée au producteur
          (turquoise) — et un triangle <span className="font-semibold text-rose-600">rouge</span>{" "}
          disparaît purement et simplement : c'est la <strong>perte sèche</strong>, des échanges
          gagnant-gagnant que personne ne réalise. Ce triangle rouge ne profite à{" "}
          <em>personne</em>, pas même au monopole.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Surplus des consommateurs, surplus des producteurs et perte sèche">
          <PlotAxes fr={fr} xLabel="y" yLabel="€" />
          {isMono ? (
            <>
              {/* SC : triangle (0,a)-(y*,p*)-(0,p*) */}
              <polygon points={`${P(0, a)} ${P(yStar, pStar)} ${P(0, pStar)}`} fill={COL.sc} opacity={0.6} />
              {/* SP : (0,p*)-(y*,p*)-(y*,cm(y*))-(0,k) */}
              <polygon points={`${P(0, pStar)} ${P(yStar, pStar)} ${P(yStar, cmStar)} ${P(0, k)}`} fill={COL.sp} opacity={0.55} />
              {/* DWL : (y*,p*)-(ye,pe)-(y*,cm(y*)) */}
              <polygon points={`${P(yStar, pStar)} ${P(yE, pE)} ${P(yStar, cmStar)}`} fill={COL.dwl} opacity={0.5} />
            </>
          ) : (
            <>
              <polygon points={`${P(0, a)} ${P(yE, pE)} ${P(0, pE)}`} fill={COL.sc} opacity={0.6} />
              <polygon points={`${P(0, pE)} ${P(yE, pE)} ${P(0, k)}`} fill={COL.sp} opacity={0.55} />
            </>
          )}
          {/* demande */}
          <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(a / b)} y2={fr.Y(0)} stroke={COL.demand} strokeWidth={2.4} />
          <text x={fr.X(10)} y={fr.Y(a - 10) - 8} fontSize={12} fontStyle="italic" fill={COL.demand}>
            p(y)
          </text>
          {/* cm */}
          <line x1={fr.X(0)} y1={fr.Y(k)} x2={fr.X(Math.min(12.2, 13 - k))} y2={fr.Y(k + Math.min(12.2, 13 - k))} stroke={COL.cm} strokeWidth={2.2} />
          <text x={fr.X(Math.min(10.6, 12.2 - k))} y={fr.Y(k + Math.min(10.6, 12.2 - k)) - 8} fontSize={12} fontStyle="italic" fill={COL.cm}>
            cm(y)
          </text>
          {/* Rm en mode monopole */}
          {isMono ? (
            <>
              <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(a / (2 * b))} y2={fr.Y(0)} stroke={COL.rm} strokeWidth={1.8} strokeDasharray="6 3" />
              <text x={fr.X(a / (2 * b)) + 5} y={fr.B - 8} fontSize={11.5} fontStyle="italic" fill={COL.rm}>
                Rm
              </text>
            </>
          ) : null}
          {/* points et guides */}
          {isMono ? (
            <>
              <DashGuide fr={fr} x={yStar} y={pStar} />
              <circle cx={fr.X(yStar)} cy={fr.Y(pStar)} r={5.5} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
              <text x={fr.X(yStar)} y={fr.B + 16} fontSize={12} fontStyle="italic" fontWeight={700} fill="#e11d48" textAnchor="middle">
                y*
              </text>
              <circle cx={fr.X(yE)} cy={fr.Y(pE)} r={4} fill="var(--color-muted-foreground)" />
              <text x={fr.X(yE)} y={fr.B + 16} fontSize={11.5} fontStyle="italic" fill="var(--color-muted-foreground)" textAnchor="middle">
                yᵉ
              </text>
            </>
          ) : (
            <>
              <DashGuide fr={fr} x={yE} y={pE} />
              <circle cx={fr.X(yE)} cy={fr.Y(pE)} r={5.5} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
              <text x={fr.X(yE)} y={fr.B + 16} fontSize={12} fontStyle="italic" fontWeight={700} fill="#e11d48" textAnchor="middle">
                yᵉ
              </text>
            </>
          )}
        </svg>
        <div>
          <Readout
            rows={[
              { label: <>Production</>, value: fmtFr(isMono ? yStar : yE) },
              { label: <>Prix</>, value: <>{fmtFr(isMono ? pStar : pE)} €</> },
              { label: <>Surplus des consommateurs (SC)</>, value: fmtFr(sc) },
              { label: <>Surplus des producteurs (SP)</>, value: fmtFr(sp) },
              { label: <>Surplus total</>, value: fmtFr(sc + sp) },
              { label: <>Perte sèche</>, value: fmtFr(isMono ? dwl : 0) },
            ]}
          />
          <LegendRow
            items={[
              { color: COL.sc, label: <>SC</> },
              { color: COL.sp, label: <>SP</> },
              { color: COL.dwl, label: <>perte sèche</> },
            ]}
          />
          {isMono ? (
            <Verdict tone="bad">
              Entre y* et yᵉ, chaque unité vaut plus pour un acheteur que ce qu'elle coûterait à
              produire… et pourtant elle n'est pas produite. {fmtFr(dwl)} de gains de l'échange
              partent en fumée.
            </Verdict>
          ) : (
            <Verdict tone="good">
              À p = cm, tous les échanges mutuellement avantageux sont réalisés : le surplus total
              est maximal, le marché est efficace au sens de Pareto.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 8 : réguler le monopole naturel                              */
/* CT = F + ky, cm = k = 2, CM = F/y + 2, demande p = 12 − y           */
/* ------------------------------------------------------------------ */

type RegMode = "libre" | "pcm" | "pCM";

export function RegulationWidget() {
  const a = 12;
  const k = 2;
  const [F, setF] = useState(20);
  const [mode, setMode] = useState<RegMode>("libre");

  const CM = (y: number) => F / y + k;
  const yStar = (a - k) / 2; // Rm = cm → 12 − 2y = 2 → y = 5
  const pStar = a - yStar; // 7
  const yE = a - k; // p = cm → 10
  const pEff = k;
  const disc = Math.max(0, (a - k) * (a - k) - 4 * F);
  const yM = (a - k + Math.sqrt(disc)) / 2; // tarification au coût moyen
  const pM = a - yM;

  const sel =
    mode === "libre"
      ? { y: yStar, p: pStar, verdictTone: "bad" as const }
      : mode === "pcm"
        ? { y: yE, p: pEff, verdictTone: "bad" as const }
        : { y: yM, p: pM, verdictTone: "good" as const };
  const cmSel = CM(sel.y);
  const profit = (sel.p - cmSel) * sel.y;

  const fr = makeFrame(12.6, 13.4);

  return (
    <InteractiveCard
      title="Réguler un monopole naturel : trois règles, trois mondes"
      subtitle={
        <>
          Coût <M tex="CT = F + 2y" /> (gros coût fixe F, coût marginal constant 2), demande{" "}
          <M tex="p = 12 - y" />. Choisis la règle imposée à la firme.
        </>
      }
      controls={
        <>
          <ChoiceChips<RegMode>
            label="Règle imposée"
            value={mode}
            onChange={setMode}
            options={[
              { value: "libre", label: "Laisser faire (Rm = Cm)" },
              { value: "pcm", label: "Prix = coût marginal" },
              { value: "pCM", label: "Prix = coût moyen" },
            ]}
          />
          <SliderControl label={<>Coût fixe F</>} value={F} onChange={setF} min={8} max={24} step={2} format={(v) => `${v} €`} />
        </>
      }
      footer={
        <>
          en « prix = coût marginal », le rectangle <span className="font-semibold text-rose-600">rouge</span>{" "}
          (pertes) vaut <em>exactement</em> F, quel que soit F — bouge le curseur pour le
          vérifier : sans subvention, la firme quitte le marché. La tarification au coût moyen
          (profit nul) est un compromis : production y<sup>M</sup> entre y* et yᵉ, sans subside.
          Note que la courbe bleue CM <strong>descend sans arrêt</strong> : c'est la signature du
          monopole naturel.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Régulation du monopole naturel : laisser-faire, prix au coût marginal, prix au coût moyen">
          <PlotAxes fr={fr} xLabel="y" yLabel="€" />
          {/* rectangle profit/perte */}
          {Math.abs(profit) > 0.05 ? (
            <rect
              x={fr.X(0)}
              y={fr.Y(Math.max(sel.p, cmSel))}
              width={fr.X(sel.y) - fr.X(0)}
              height={Math.abs(fr.Y(sel.p) - fr.Y(cmSel))}
              fill={profit > 0 ? COL.rm : COL.cm}
              opacity={0.3}
            />
          ) : null}
          {/* demande */}
          <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(12.2)} y2={fr.Y(a - 12.2)} stroke={COL.demand} strokeWidth={2.4} strokeDasharray="8 4" />
          <text x={fr.X(9.6)} y={fr.Y(a - 9.6) - 9} fontSize={12} fontStyle="italic" fill={COL.demand}>
            p(y)
          </text>
          {/* Rm */}
          <line x1={fr.X(0)} y1={fr.Y(a)} x2={fr.X(a / 2)} y2={fr.Y(0)} stroke="var(--color-muted-foreground)" strokeWidth={1.8} />
          <text x={fr.X(a / 2) + 5} y={fr.B - 8} fontSize={11.5} fontStyle="italic" fill="var(--color-muted-foreground)">
            Rm
          </text>
          {/* cm */}
          <line x1={fr.X(0)} y1={fr.Y(k)} x2={fr.X(12.2)} y2={fr.Y(k)} stroke={COL.cm} strokeWidth={2} />
          <text x={fr.X(11.4)} y={fr.Y(k) - 7} fontSize={12} fontStyle="italic" fill={COL.cm}>
            cm = k
          </text>
          {/* CM */}
          <polyline points={samplePts(fr, CM, F / 11, 12.2, 120)} fill="none" stroke={COL.cmoy} strokeWidth={2.2} />
          <text x={fr.X(10.2)} y={fr.Y(CM(10.2)) - 9} fontSize={12} fontStyle="italic" fill={COL.cmoy}>
            CM = F/y + k
          </text>
          {/* point sélectionné */}
          <DashGuide fr={fr} x={sel.y} y={sel.p} />
          <circle cx={fr.X(sel.y)} cy={fr.Y(sel.p)} r={6} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
          <circle cx={fr.X(sel.y)} cy={fr.Y(cmSel)} r={4} fill={COL.cmoy} />
          {/* repères y*, yM, ye */}
          {[
            { x: yStar, lab: "y*" },
            { x: yM, lab: "yᴹ" },
            { x: yE, lab: "yᵉ" },
          ].map((m) => (
            <text key={m.lab} x={fr.X(m.x)} y={fr.B + 16} fontSize={11.5} fontStyle="italic" fill={Math.abs(m.x - sel.y) < 0.01 ? "#e11d48" : "var(--color-muted-foreground)"} fontWeight={Math.abs(m.x - sel.y) < 0.01 ? 700 : 400} textAnchor="middle">
              {m.lab}
            </text>
          ))}
        </svg>
        <div>
          <Readout
            rows={[
              { label: <>Production</>, value: fmtFr(sel.y) },
              { label: <>Prix</>, value: <>{fmtFr(sel.p)} €</> },
              { label: <>Coût moyen CM(y)</>, value: <>{fmtFr(cmSel)} €</> },
              { label: <>Profit de la firme</>, value: <>{fmtFr(profit)} €</> },
            ]}
          />
          {mode === "libre" ? (
            <Verdict tone="bad">
              Le monopole choisit y* = {fmtFr(yStar, 0)} : c'est le profit le plus élevé possible
              pour la firme, mais la production est la plus faible des trois règles — grosse
              perte sèche pour la société.
            </Verdict>
          ) : mode === "pcm" ? (
            <Verdict tone="bad">
              Production efficace… mais p = k {"<"} CM : la firme perd exactement F ={" "}
              {fmtFr(F, 0)} €. Sans subvention couvrant le coût fixe, elle met la clé sous la
              porte — et le marché disparaît.
            </Verdict>
          ) : (
            <Verdict tone="good">
              Profit nul (« pas de profit anormal ») et production yᴹ = {fmtFr(yM)} : pas
              l'efficacité parfaite, mais déjà nettement mieux que le laisser-faire, sans un euro
              de subside.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 9 : taxer le monopole (profit vs unitaire)                   */
/* Demande p = 12 − y, cm = 2 : Π(y) = 10y − y²                        */
/* ------------------------------------------------------------------ */

type TaxMode = "profit" | "unit";

export function TaxWidget() {
  const a = 12;
  const k = 2;
  const [mode, setMode] = useState<TaxMode>("profit");
  const [tPct, setTPct] = useState(30);
  const [tU, setTU] = useState(2);

  // taxe sur le profit
  const Pi = (y: number) => (a - y) * y - k * y; // 10y − y²
  const tp = tPct / 100;
  const yStar = (a - k) / 2; // 5
  const piMax = Pi(yStar); // 25

  // taxe unitaire
  const y1 = (a - k - tU) / 2;
  const p1 = a - y1;
  const pStar = a - yStar; // 7

  const frP = makeFrame(10.6, 27);
  const frU = makeFrame(12.6, 13.4);

  return (
    <InteractiveCard
      title="Taxer le monopole : deux taxes, deux mondes"
      subtitle={
        <>
          Demande <M tex="p = 12 - y" />, coût marginal constant <M tex="k = 2" />. Compare une
          taxe de <M tex="t\,\%" /> sur le profit et une taxe de <M tex="t" /> € par unité vendue.
        </>
      }
      controls={
        <>
          <ChoiceChips<TaxMode>
            label="Type de taxe"
            value={mode}
            onChange={setMode}
            options={[
              { value: "profit", label: "t % sur le profit" },
              { value: "unit", label: "t € par unité" },
            ]}
          />
          {mode === "profit" ? (
            <SliderControl label={<>Taux de taxe t</>} value={tPct} onChange={setTPct} min={0} max={60} step={5} format={(v) => `${v} %`} />
          ) : (
            <SliderControl label={<>Taxe unitaire t</>} value={tU} onChange={setTU} min={0} max={4} step={0.5} format={(v) => `${fmtFr(v, 1)} €`} />
          )}
        </>
      }
      footer={
        <>
          la taxe sur le <strong>profit</strong> écrase la courbe verticalement mais son sommet
          reste au même y* : production, prix, demande — rien ne bouge, la taxe est{" "}
          <strong>neutre</strong>. La taxe <strong>par unité</strong>, elle, déplace la courbe de
          coût marginal vers le haut : le monopole produit moins et vend plus cher — elle{" "}
          <em>aggrave</em> la distorsion de monopole au lieu de la corriger.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {mode === "profit" ? (
          <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Effet d'une taxe sur le profit : le maximum ne bouge pas">
            <PlotAxes fr={frP} xLabel="y" yLabel="Π (€)" />
            <line x1={frP.X(yStar)} y1={frP.B} x2={frP.X(yStar)} y2={frP.Y(piMax) - 10} stroke="var(--color-border)" strokeWidth={1.3} strokeDasharray="5 4" />
            <polyline points={samplePts(frP, Pi, 0, 10.4)} fill="none" stroke={COL.demand} strokeWidth={2.4} />
            <polyline points={samplePts(frP, (y) => (1 - tp) * Pi(y), 0, 10.4)} fill="none" stroke={COL.accent} strokeWidth={2.4} />
            <text x={frP.X(2.1)} y={frP.Y(Pi(2.1)) - 10} fontSize={12} fontStyle="italic" fill={COL.demand}>
              Π(y)
            </text>
            <text x={frP.X(7.4)} y={frP.Y((1 - tp) * Pi(7.4)) + 18} fontSize={12} fontStyle="italic" fill={COL.accent}>
              (1 − t)·Π(y)
            </text>
            <circle cx={frP.X(yStar)} cy={frP.Y(piMax)} r={5} fill={COL.demand} stroke="var(--color-card)" strokeWidth={2} />
            <circle cx={frP.X(yStar)} cy={frP.Y((1 - tp) * piMax)} r={5} fill={COL.accent} stroke="var(--color-card)" strokeWidth={2} />
            <text x={frP.X(yStar)} y={frP.B + 16} fontSize={12} fontStyle="italic" fontWeight={700} fill="var(--color-foreground)" textAnchor="middle">
              y* inchangé
            </text>
          </svg>
        ) : (
          <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Effet d'une taxe par unité vendue : production plus faible, prix plus élevé">
            <PlotAxes fr={frU} xLabel="y" yLabel="€" />
            {/* demande et Rm */}
            <line x1={frU.X(0)} y1={frU.Y(a)} x2={frU.X(12.2)} y2={frU.Y(a - 12.2)} stroke={COL.demand} strokeWidth={2.4} />
            <text x={frU.X(9.8)} y={frU.Y(a - 9.8) - 9} fontSize={12} fontStyle="italic" fill={COL.demand}>
              p(y)
            </text>
            <line x1={frU.X(0)} y1={frU.Y(a)} x2={frU.X(a / 2)} y2={frU.Y(0)} stroke={COL.rm} strokeWidth={1.9} />
            <text x={frU.X(a / 2) + 5} y={frU.B - 8} fontSize={11.5} fontStyle="italic" fill={COL.rm}>
              Rm
            </text>
            {/* cm et cm + t */}
            <line x1={frU.X(0)} y1={frU.Y(k)} x2={frU.X(12.2)} y2={frU.Y(k)} stroke={COL.cm} strokeWidth={2} />
            <text x={frU.X(11.2)} y={frU.Y(k) + 16} fontSize={12} fontStyle="italic" fill={COL.cm}>
              cm
            </text>
            {tU > 0 ? (
              <>
                <line x1={frU.X(0)} y1={frU.Y(k + tU)} x2={frU.X(12.2)} y2={frU.Y(k + tU)} stroke={COL.cmoy} strokeWidth={2} />
                <text x={frU.X(11.2)} y={frU.Y(k + tU) - 7} fontSize={12} fontStyle="italic" fill={COL.cmoy}>
                  cm + t
                </text>
              </>
            ) : null}
            {/* avant */}
            <circle cx={frU.X(yStar)} cy={frU.Y(pStar)} r={4.5} fill="var(--color-muted-foreground)" />
            <text x={frU.X(yStar) + 8} y={frU.Y(pStar) + 14} fontSize={11.5} fontStyle="italic" fill="var(--color-muted-foreground)">
              avant : (y*, p*)
            </text>
            {/* après */}
            <DashGuide fr={frU} x={y1} y={p1} />
            <circle cx={frU.X(y1)} cy={frU.Y(p1)} r={5.5} fill={COL.accent} stroke="var(--color-card)" strokeWidth={2} />
            <text x={frU.X(y1) - 8} y={frU.Y(p1) - 9} fontSize={12} fontStyle="italic" fontWeight={700} fill={COL.accent} textAnchor="end">
              (y′, p′)
            </text>
          </svg>
        )}
        <div>
          {mode === "profit" ? (
            <>
              <Readout
                rows={[
                  { label: <>Production optimale y*</>, value: fmtFr(yStar, 0) },
                  { label: <>Prix p*</>, value: <>{fmtFr(pStar, 0)} €</> },
                  { label: <>Profit brut Π(y*)</>, value: <>{fmtFr(piMax, 0)} €</> },
                  { label: <>Profit net (1 − t)·Π(y*)</>, value: <>{fmtFr((1 - tp) * piMax)} €</> },
                ]}
              />
              <Verdict tone="good">
                Le maximum de (1 − t)·Π(y) est atteint au même y = y* : le monopole ne change{" "}
                <strong>rien</strong> à son comportement. Taxe neutre : l'État capte une part du
                profit sans aggraver la perte sèche.
              </Verdict>
            </>
          ) : (
            <>
              <Readout
                rows={[
                  { label: <>Production : y* → y′</>, value: <>{fmtFr(yStar, 0)} → {fmtFr(y1)}</> },
                  { label: <>Prix : p* → p′</>, value: <>{fmtFr(pStar, 0)} → {fmtFr(p1)} €</> },
                  { label: <>Hausse du prix Δp</>, value: <>{fmtFr(p1 - pStar)} €</> },
                  { label: <>Part de la taxe payée par le client</>, value: tU > 0 ? <>{fmtFr(((p1 - pStar) / tU) * 100, 0)} %</> : <>—</> },
                ]}
              />
              <Verdict tone="bad">
                Le monopole produisait déjà trop peu ; la taxe unitaire le fait produire{" "}
                <strong>encore moins</strong> et vendre <strong>encore plus cher</strong>. Ici
                (demande linéaire), le client paie la moitié de la taxe — avec une demande
                iso-élastique, il peut payer PLUS que la taxe (voir plus bas).
              </Verdict>
            </>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 10 : qui paie la taxe ? (demande iso-élastique)              */
/* y = p^(−ε) : p* = εk/(ε−1) ; p′ = ε(k+t)/(ε−1) ; Δp = ε/(ε−1)·t     */
/* ------------------------------------------------------------------ */

export function TaxIncidenceWidget() {
  const k = 5;
  const [eps, setEps] = useState(2);
  const [t, setT] = useState(1);

  const ratio = eps / (eps - 1);
  const p0 = ratio * k;
  const p1 = ratio * (k + t);
  const dp = p1 - p0;

  const L = 130;
  const R = 452;
  const maxV = 19;
  const W = (v: number) => Math.min(1, v / maxV) * (R - L);

  return (
    <InteractiveCard
      title="Qui paie vraiment la taxe ? Le cas de la demande iso-élastique"
      subtitle={
        <>
          Demande <M tex="y = p^{-\varepsilon}" /> (élasticité constante), coût marginal{" "}
          <M tex="k = 5" /> €. Le prix du monopole vaut{" "}
          <M tex="p = \tfrac{\varepsilon}{\varepsilon-1}(k+t)" />.
        </>
      }
      controls={
        <>
          <SliderControl label={<>Élasticité ε</>} value={eps} onChange={setEps} min={1.2} max={5} step={0.1} format={(v) => fmtFr(v, 1)} />
          <SliderControl label={<>Taxe unitaire t</>} value={t} onChange={setT} min={0} max={3} step={0.25} format={(v) => `${fmtFr(v)} €`} />
        </>
      }
      footer={
        <>
          la barre « hausse du prix » est <strong>toujours plus longue</strong> que la barre
          « taxe » : comme <M tex="\varepsilon > 1" />, le coefficient{" "}
          <M tex="\varepsilon/(\varepsilon-1)" /> dépasse 1 et le monopole répercute PLUS de 100 %
          de la taxe sur ses clients. À <M tex="\varepsilon = 2" />, le client paie exactement le
          double de la taxe. Plus <M tex="\varepsilon" /> grandit, plus le coefficient se
          rapproche de 1.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 130" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Comparaison entre la taxe et la hausse de prix subie par le consommateur">
          <text x={L - 8} y={44} fontSize={12} fontWeight={600} fill="var(--color-muted-foreground)" textAnchor="end">
            taxe t
          </text>
          <rect x={L} y={30} width={Math.max(1.5, W(t))} height={22} rx={4} fill="var(--color-muted-foreground)" opacity={0.6} />
          <text x={L + Math.max(1.5, W(t)) + 8} y={46} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
            {fmtFr(t)} €
          </text>
          <text x={L - 8} y={92} fontSize={12} fontWeight={600} fill="var(--color-muted-foreground)" textAnchor="end">
            hausse du prix Δp
          </text>
          <rect x={L} y={78} width={Math.max(1.5, W(dp))} height={22} rx={4} fill={COL.accent} />
          <text x={L + Math.max(1.5, W(dp)) + 8} y={94} fontSize={12} fontWeight={700} fill={COL.accent}>
            {fmtFr(dp)} €
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              {
                label: (
                  <>
                    Prix sans taxe <M tex="p^* = \tfrac{\varepsilon}{\varepsilon-1}k" />
                  </>
                ),
                value: <>{fmtFr(p0)} €</>,
              },
              { label: <>Prix avec taxe p′</>, value: <>{fmtFr(p1)} €</> },
              {
                label: (
                  <>
                    Coefficient <M tex="\tfrac{\varepsilon}{\varepsilon-1}" />
                  </>
                ),
                value: <>× {fmtFr(ratio)}</>,
              },
            ]}
          />
          {t === 0 ? (
            <Verdict tone="neutral">Mets une taxe pour voir qui la paie…</Verdict>
          ) : (
            <Verdict tone={ratio > 1.6 ? "bad" : "info"}>
              Pour {fmtFr(t)} € de taxe, le consommateur paie {fmtFr(dp)} € de plus — soit{" "}
              {fmtFr(ratio * 100, 0)} % de la taxe. Le monopole sur-répercute !
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 11 : concurrence monopolistique et libre entrée              */
/* Demande de la firme : p = 12 − n·y (l'entrée pivote la demande)     */
/* c(y) = 5 + 2y → CM = 5/y + 2 ; profit nul à n = 5                   */
/* ------------------------------------------------------------------ */

export function MonopolisticWidget() {
  const A = 12;
  const F = 5;
  const k = 2;
  const [n, setN] = useState(1);

  const yStar = (A - k) / (2 * n); // 5/n
  const pStar = (A + k) / 2; // 7, constant
  const CM = (y: number) => F / y + k;
  const cmStar = CM(yStar); // n + 2
  const profit = (pStar - k) * yStar - F; // 25/n − 5

  const fr = makeFrame(6.4, 13.4);
  const xEndDemand = Math.min(6.2, A / n);

  return (
    <InteractiveCard
      title="Libre entrée : la demande de chaque firme rétrécit jusqu'au profit nul"
      subtitle={
        <>
          Chaque marque fait face à <M tex="p = 12 - n\,y" /> : plus il y a de concurrents{" "}
          <M tex="n" />, plus sa demande pivote vers l'intérieur. Coût :{" "}
          <M tex="c(y) = 5 + 2y" />.
        </>
      }
      controls={
        <SliderControl label={<>Nombre de marques n</>} value={n} onChange={setN} min={1} max={7} step={1} format={(v) => String(v)} />
      }
      footer={
        <>
          tant que le rectangle de profit est vert, de nouvelles marques entrent (paye le coût
          fixe, lance ta marque !) et la demande de chacune pivote vers l'intérieur. À n = 5, la
          demande devient <strong>tangente</strong> à la courbe de coût moyen au point choisi par
          la firme : profit exactement nul, l'entrée s'arrête. Mais regarde bien : même à profit
          nul, le prix (7 €) reste <strong>au-dessus du coût marginal</strong> (2 €) — chaque
          firme tarife toujours comme un monopole.
        </>
      }
    >
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 380" className="mx-auto block h-auto w-full max-w-[480px]" role="img" aria-label="Concurrence monopolistique : entrée de firmes jusqu'au profit nul">
          <PlotAxes fr={fr} xLabel="y (ventes de la firme)" yLabel="€" />
          {/* rectangle profit/perte */}
          {Math.abs(profit) > 0.05 ? (
            <rect
              x={fr.X(0)}
              y={fr.Y(Math.max(pStar, cmStar))}
              width={fr.X(yStar) - fr.X(0)}
              height={Math.abs(fr.Y(pStar) - fr.Y(cmStar))}
              fill={profit > 0 ? COL.rm : COL.cm}
              opacity={0.32}
            />
          ) : null}
          {/* demande de la firme */}
          <line x1={fr.X(0)} y1={fr.Y(A)} x2={fr.X(xEndDemand)} y2={fr.Y(A - n * xEndDemand)} stroke={COL.demand} strokeWidth={2.4} />
          <text x={fr.X(0.35)} y={fr.Y(A - n * 0.35) - 10} fontSize={12} fontStyle="italic" fill={COL.demand}>
            demande de la firme
          </text>
          {/* Rm */}
          <line x1={fr.X(0)} y1={fr.Y(A)} x2={fr.X(Math.min(6.2, A / (2 * n)))} y2={fr.Y(Math.max(0, A - 2 * n * Math.min(6.2, A / (2 * n))))} stroke={COL.rm} strokeWidth={1.8} strokeDasharray="6 3" />
          {/* cm */}
          <line x1={fr.X(0)} y1={fr.Y(k)} x2={fr.X(6.2)} y2={fr.Y(k)} stroke={COL.cm} strokeWidth={2} />
          <text x={fr.X(5.6)} y={fr.Y(k) + 16} fontSize={12} fontStyle="italic" fill={COL.cm}>
            cm
          </text>
          {/* CM */}
          <polyline points={samplePts(fr, CM, F / 11, 6.2, 120)} fill="none" stroke={COL.cmoy} strokeWidth={2.2} />
          <text x={fr.X(4.6)} y={fr.Y(CM(4.6)) - 9} fontSize={12} fontStyle="italic" fill={COL.cmoy}>
            CM
          </text>
          {/* optimum de la firme */}
          <DashGuide fr={fr} x={yStar} y={pStar} />
          <circle cx={fr.X(yStar)} cy={fr.Y(pStar)} r={5.5} fill="#e11d48" stroke="var(--color-card)" strokeWidth={2} />
          <circle cx={fr.X(yStar)} cy={fr.Y(cmStar)} r={4} fill={COL.cmoy} />
          <text x={fr.X(yStar)} y={fr.B + 16} fontSize={12} fontStyle="italic" fontWeight={700} fill="#e11d48" textAnchor="middle">
            y*
          </text>
          <text x={fr.L - 7} y={fr.Y(pStar) - 6} fontSize={12} fontStyle="italic" fontWeight={700} fill="#e11d48" textAnchor="end">
            p*
          </text>
        </svg>
        <div>
          <Readout
            rows={[
              { label: <>Ventes de la firme y*</>, value: fmtFr(yStar) },
              { label: <>Prix p*</>, value: <>{fmtFr(pStar, 0)} €</> },
              { label: <>Coût moyen CM(y*)</>, value: <>{fmtFr(cmStar)} €</> },
              { label: <>Profit par firme</>, value: <>{fmtFr(profit)} €</> },
            ]}
          />
          {profit > 0.05 ? (
            <Verdict tone="info">
              Profit positif ({fmtFr(profit)} €) : des entrepreneurs le voient et lancent leur
              propre marque. n va augmenter, la demande de chaque firme va rétrécir…
            </Verdict>
          ) : profit < -0.05 ? (
            <Verdict tone="bad">
              Pertes : trop de marques se partagent le marché. Certaines vont sortir, n va
              baisser.
            </Verdict>
          ) : (
            <Verdict tone="good">
              Équilibre de long terme : profit nul, demande tangente au CM. Et pourtant p* = 7 €{" "}
              {">"} cm = 2 € : l'inefficacité du monopole n'a pas disparu.
            </Verdict>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Checklist de maîtrise (identique aux autres chapitres)              */
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
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold",
                  isDone
                    ? "border-success bg-success text-success-foreground"
                    : "border-muted-foreground/40 text-transparent",
                )}
              >
                ✓
              </span>
              <span className="min-w-0">
                <span className={cn("block text-[15px] font-bold", isDone && "text-emerald-900 dark:text-emerald-200")}>
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[14px] leading-relaxed text-muted-foreground">
                  {item.body}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
