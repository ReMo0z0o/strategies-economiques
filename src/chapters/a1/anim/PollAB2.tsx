/*
 * PollAB2 — sondage A/B de l'approche comportementale (A1, slides S2 p. 2-15).
 *
 * Même déroulé que l'ancien sondage PollAB : le lecteur lit la version A et
 * vote d'abord. Ensuite seulement on montre ce qu'ont répondu les étudiants du
 * cours aux DEUX versions (chaque version a été posée à un groupe différent,
 * tiré au hasard) :
 *  - deux barres horizontales sur LA MÊME échelle (0-100 % ou 0-max €), qui se
 *    remplissent en ~600 ms (instantané si « réduire les animations ») ;
 *  - la prédiction pour des Econos (groupes semblables ⇒ même valeur) ;
 *  - l'écart observé (hachuré), puis le biais et l'explication.
 * Le vote n'est ni enregistré ni envoyé : il sert seulement à s'engager avant
 * de voir les résultats.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Vote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PollStat2 {
  /** ex. « Version A · 15 € → 10 € » */
  version: string;
  /** valeur observée, en % (0-100) ou en € selon `unit` */
  value: number;
  /** ex. « disent que le trajet vaut la peine » */
  label: ReactNode;
}

export interface PollAB2Props {
  scenario: ReactNode;
  question: ReactNode;
  /** les choix proposés au lecteur (version A du sondage) */
  options: ReactNode[];
  /** étiquettes des choix (par défaut « A », « B », …) — ex. ["A1", "A2"] */
  optionKeys?: string[];
  /** la mesure commune aux deux versions = titre du graphique */
  measure: ReactNode;
  statA: PollStat2;
  statB: PollStat2;
  /** unité des valeurs (défaut « % ») */
  unit?: "%" | "€";
  /** borne droite de l'échelle (défaut : 100 pour %, arrondi au-dessus pour €) */
  max?: number;
  /** nom du biais révélé, ex. « utilité de transaction » */
  bias: string;
  /** « pourquoi c'est une déviation » */
  explanation: ReactNode;
}

/* ------------------------------------------------------------------ */
/* Format français                                                     */
/* ------------------------------------------------------------------ */

const NBSP = "\u00a0";

/** groupe les milliers avec une espace fine insécable : 127018 → « 127 018 » */
function group(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
}

function fmtNumber(v: number, decimals: number): string {
  const neg = v < 0;
  const [i, d] = Math.abs(v).toFixed(decimals).split(".");
  return (neg ? "−" : "") + group(i) + (d ? "," + d : "");
}

function isInt(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

function fmtValue(v: number, unit: "%" | "€"): string {
  if (unit === "%") return fmtNumber(v, isInt(v) ? 0 : 1) + NBSP + "%";
  return fmtNumber(v, isInt(v) ? 0 : 2) + NBSP + "€";
}

function fmtGap(a: number, b: number, unit: "%" | "€"): string {
  const g = Math.abs(a - b);
  if (unit === "€") return fmtValue(Math.round(g * 100) / 100, "€");
  const r = Math.round(g * 10) / 10;
  return `${fmtNumber(r, isInt(r) ? 0 : 1)}${NBSP}point${r >= 2 ? "s" : ""}`;
}

/** plus petit nombre « rond » (1, 1,5, 2, 2,5, 3, 4, 5, 6, 8 × 10^k) ≥ x */
function niceCeil(x: number): number {
  if (x <= 0) return 1;
  const k = Math.pow(10, Math.floor(Math.log10(x)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * k >= x - 1e-9) return m * k;
  return 10 * k;
}

/** pas de graduation « rond » (1, 2, 2,5, 5 × 10^k) proche de x */
function niceStep(x: number): number {
  const k = Math.pow(10, Math.floor(Math.log10(x)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * k >= x - 1e-9) return m * k;
  return 10 * k;
}

/* ------------------------------------------------------------------ */
/* Barres de résultats                                                 */
/* ------------------------------------------------------------------ */

const COLOR_A = "#4f46e5";
const COLOR_B = "#0d9488";
const HATCH =
  "repeating-linear-gradient(135deg, rgba(225,29,72,0.45) 0 3px, rgba(225,29,72,0.08) 3px 7px)";

/** deux barres égales (pictogramme de la prédiction « Econos ») */
function EqualBarsIcon() {
  return (
    <svg viewBox="0 0 40 24" className="h-6 w-10 shrink-0" aria-hidden>
      <rect x="2" y="4" width="30" height="6" rx="2" fill={COLOR_A} opacity={0.5} />
      <rect x="2" y="14" width="30" height="6" rx="2" fill={COLOR_B} opacity={0.5} />
      <line
        x1="32"
        y1="1"
        x2="32"
        y2="23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.5 2"
      />
    </svg>
  );
}

function PollResults({
  measure,
  statA,
  statB,
  unit,
  max,
}: {
  measure: ReactNode;
  statA: PollStat2;
  statB: PollStat2;
  unit: "%" | "€";
  max: number;
}) {
  // Les barres partent de 0 puis se remplissent (transition CSS de ~600 ms,
  // supprimée par motion-reduce). Double rAF : le navigateur peint d'abord 0.
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setFilled(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, []);

  const toPct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));
  const lo = Math.min(statA.value, statB.value);
  const hi = Math.max(statA.value, statB.value);
  const lowIndex = statA.value <= statB.value ? 0 : 1;
  const step = unit === "%" && max === 100 ? 25 : niceStep(max / 4);
  const ticks: number[] = [];
  for (let t = 0; t <= max + 1e-9; t += step) ticks.push(Math.round(t * 1e6) / 1e6);

  const rows = [
    { st: statA, color: COLOR_A },
    { st: statB, color: COLOR_B },
  ];

  return (
    <div className="rounded-xl border bg-muted/30 px-3 py-3 sm:px-4">
      <div className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
        Mesure commune
      </div>
      <div className="text-[15px] font-bold leading-snug">{measure}</div>

      <div
        className="mt-3 space-y-3"
        role="img"
        aria-label={`${statA.version} : ${fmtValue(statA.value, unit)} ; ${statB.version} : ${fmtValue(statB.value, unit)} ; écart : ${fmtGap(statA.value, statB.value, unit)}`}
      >
        {rows.map(({ st, color }, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color }}>
                {st.version}
              </span>
              <span className="text-xl font-extrabold tabular-nums leading-none" style={{ color }}>
                {fmtValue(st.value, unit)}
              </span>
            </div>
            <div className="relative mt-1 h-6 overflow-hidden rounded-md bg-muted">
              {ticks.slice(1, -1).map((t) => (
                <span
                  key={t}
                  className="absolute inset-y-0 w-px bg-foreground/10"
                  style={{ left: `${toPct(t)}%` }}
                  aria-hidden
                />
              ))}
              <div
                className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-[600ms] ease-out motion-reduce:transition-none"
                style={{ width: filled ? `${toPct(st.value)}%` : "0%", background: color }}
              />
              {i === lowIndex && hi > lo ? (
                <div
                  className={cn(
                    "absolute inset-y-0 border-y-2 border-r-2 border-dashed border-rose-500 transition-opacity delay-[600ms] duration-300 motion-reduce:transition-none motion-reduce:delay-0",
                    filled ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    left: `${toPct(lo)}%`,
                    width: `${toPct(hi) - toPct(lo)}%`,
                    backgroundImage: HATCH,
                  }}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="mt-1 text-[13px] leading-snug text-muted-foreground">{st.label}</div>
          </div>
        ))}

        {/* graduations communes aux deux barres */}
        <div className="relative h-4 text-[11px] tabular-nums text-muted-foreground" aria-hidden>
          {ticks.map((t, k) => (
            <span
              key={t}
              className="absolute top-0 whitespace-nowrap"
              style={{
                left: `${toPct(t)}%`,
                transform:
                  k === 0
                    ? "none"
                    : k === ticks.length - 1 && toPct(t) > 95
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
              }}
            >
              {fmtValue(t, unit)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2.5 rounded-lg border-2 border-dashed border-slate-400/70 px-3 py-2 text-[13px] leading-snug">
        <EqualBarsIcon />
        <span>
          <strong>Prédiction pour des Econos</strong> (groupes tirés au hasard, donc semblables) :{" "}
          <strong>même valeur dans les deux versions</strong> — deux barres de même longueur.
        </span>
      </div>

      <div
        className={cn(
          "mt-2 flex flex-wrap items-center gap-2 text-[13px] transition-opacity delay-[600ms] duration-300 motion-reduce:transition-none motion-reduce:delay-0",
          filled ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
          <span
            className="inline-block h-3 w-5 rounded-sm border border-dashed border-rose-500"
            style={{ backgroundImage: HATCH }}
            aria-hidden
          />
          Observé — écart : {fmtGap(statA.value, statB.value, unit)}
        </span>
        <span className="text-muted-foreground">
          {hi > lo
            ? "Les barres ne sont pas égales\u00a0: les Humains dévient de la prédiction."
            : "Les barres sont égales."}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

/** Données de démonstration (page /sandbox, rendue sans props) : slides 2-3. */
const DEMO: PollAB2Props = {
  scenario: (
    <>
      Tu es sur le point d'acheter une calculatrice pour <strong>15&nbsp;€</strong>. Le vendeur te
      dit que la même calculatrice coûte <strong>10&nbsp;€</strong> dans un magasin situé à vingt
      minutes à pied.
    </>
  ),
  question: "Prends-tu la peine de faire le trajet à pied jusqu'à ce magasin\u00a0?",
  options: ["Oui, je marche 20 minutes", "Non, j'achète ici"],
  measure: "Part des étudiants qui disent que le trajet vaut la peine",
  statA: {
    version: "Version A · 15\u00a0€ → 10\u00a0€",
    value: 82,
    label: "disent que le trajet vaut la peine",
  },
  statB: {
    version: "Version B · 200\u00a0€ → 195\u00a0€",
    value: 25,
    label: "disent que le trajet vaut la peine",
  },
  bias: "utilité de transaction",
  explanation: (
    <p>
      Dans les deux versions, la vraie question est la même&nbsp;: es-tu prêt·e à marcher vingt
      minutes pour 5&nbsp;€&nbsp;? Les groupes étant tirés au hasard, un Econo donnerait la même
      proportion.
    </p>
  ),
};

export function PollAB2(props: PollAB2Props) {
  // Garde-fou : la page /sandbox rend chaque composant sans props.
  const p: PollAB2Props = props && props.options ? props : DEMO;
  const { scenario, question, options, optionKeys, measure, statA, statB, bias, explanation } = p;
  const unit = p.unit ?? "%";
  const max = p.max ?? (unit === "%" ? 100 : niceCeil(Math.max(statA.value, statB.value) * 1.15));

  const [chosen, setChosen] = useState<number | null>(null);
  const voted = chosen !== null;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-slate-300 bg-card shadow-sm dark:border-slate-600">
      <div className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white sm:px-5">
        <Vote className="h-4 w-4" aria-hidden />À toi de voter — vraie expérience de pensée
      </div>
      <div className="px-4 py-4 sm:px-5">
        <p className="text-[15px] leading-relaxed">
          <span className="mr-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
            Situation
          </span>
          {scenario}
        </p>
        <p className="mt-3 font-bold">{question}</p>
        <div className="mt-3 grid gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={voted}
              aria-pressed={voted ? chosen === i : undefined}
              onClick={() => setChosen(i)}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-left text-[15px] leading-relaxed transition-colors",
                !voted && "hover:border-primary hover:bg-accent/50",
                voted && chosen === i && "border-primary bg-accent ring-1 ring-primary",
                voted && chosen !== i && "opacity-60",
              )}
            >
              <span className="mr-2 font-bold text-primary">
                {optionKeys?.[i] ?? String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
        {!voted ? (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Réponds d'abord honnêtement&nbsp;: les résultats s'affichent après ton choix.
          </p>
        ) : null}

        {voted ? (
          <div className="mt-4 border-t border-dashed pt-4 animate-in fade-in slide-in-from-top-1">
            <p className="mb-3 text-sm text-muted-foreground">
              <strong className="text-foreground">
                Merci&nbsp;! Voici ce qu'ont répondu les étudiants du cours.
              </strong>{" "}
              La version A (celle que tu viens de lire) a été posée à un groupe ; la version B, à un{" "}
              <em>autre</em> groupe tiré au hasard.
            </p>
            <PollResults measure={measure} statA={statA} statB={statB} unit={unit} max={max} />
            <div className="mt-3 inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[13px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              Biais : {bias}
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold uppercase tracking-wide text-rose-600">
                Pourquoi c'est une déviation
              </div>
              <div className="course-prose mt-1 text-[15px]">{explanation}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
