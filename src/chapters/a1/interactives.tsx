/*
 * Chapitre A1 — composants interactifs.
 *
 * Chaque widget reproduit la logique du manuel interactif source :
 *  - BudgetExplorer   : la droite de budget qui pivote avec la taxe ;
 *  - LaborSupplyExplorer : l* = a / (s(1−t)), répartition loisir/travail ;
 *  - LafferExplorer   : M(t) ∝ t(1−t)^1.5 (forme schématique, sommet à t = 0,4) ;
 *  - PollAB           : les sondages A/B d'économie comportementale
 *    (les pourcentages affichés sont ceux réellement observés en expérience).
 */

import { useMemo, useState, type ReactNode } from "react";
import { Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";

/** format « 0,42 » comme dans la source */
function fmt(x: number): string {
  return x.toFixed(2).replace(".", ",");
}

/* ------------------------------------------------------------------ */
/* 1. La droite de budget qui pivote avec la taxe                      */
/* ------------------------------------------------------------------ */

export function BudgetExplorer() {
  const [tPct, setTPct] = useState(20);
  const t = tPct / 100;

  // paramètres pédagogiques : s = 2, L = 1, M = 0,5
  const s = 2;
  const L = 1;
  const Mrev = 0.5;
  const wealth = s * (1 - t) * L + Mrev; // ordonnée à l'origine : s(1−t)L + M
  const slope = s * (1 - t); // |pente|

  // repère : l ∈ [0 ; 1,15], c ∈ [0 ; 2,8]
  const X = (l: number) => 62 + (l * 430) / 1.15;
  const Y = (c: number) => 312 - (c * 282) / 2.8;

  return (
    <InteractiveCard
      title="La droite de budget sous l'effet de la taxe"
      subtitle={
        <>
          Paramètres : salaire brut <M tex="s = 2" />, temps total <M tex="L = 1" />, revenu hors
          travail <M tex="M = 0{,}5" />. Bouge la taxe <M tex="t" /> et regarde ce qui devient
          possible… ou non.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taux de taxe <M tex="t" />
              </>
            }
            value={tPct}
            onChange={setTPct}
            min={0}
            max={80}
            step={1}
            format={(v) => fmt(v / 100)}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              Richesse max <M tex="s(1-t)L + M" /> ={" "}
              <span className="tabular-nums text-primary">{fmt(wealth)}</span>
            </span>
            <span className="text-muted-foreground">
              Pente = <span className="tabular-nums">−{fmt(slope)}</span> (le « prix » d'une heure
              de loisir)
            </span>
          </div>
        </>
      }
      footer={
        <>
          quand la taxe monte, la droite <strong>pivote autour de ω</strong> (le point « zéro
          travail » ne dépend pas de la taxe !) et s'aplatit : le salaire net baisse, donc chaque
          heure de loisir coûte moins de consommation sacrifiée — mais l'ensemble des paniers
          accessibles rétrécit.
        </>
      }
    >
      <svg viewBox="0 0 540 360" role="img" aria-label="Droite de budget interactive" className="w-full">
        {/* zone accessible */}
        <polygon
          points={`${X(0)},${Y(0)} ${X(0)},${Y(wealth)} ${X(L)},${Y(Mrev)} ${X(L)},${Y(0)}`}
          fill="#e0e7ff"
          opacity="0.55"
        />
        {/* grille légère */}
        {[0.5, 1, 1.5, 2, 2.5].map((c) => (
          <line key={c} x1={X(0)} y1={Y(c)} x2={X(1.1)} y2={Y(c)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* axes */}
        <line x1={X(0)} y1={Y(0)} x2={X(1.13)} y2={Y(0)} stroke="#0f172a" strokeWidth="1.6" />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(2.75)} stroke="#0f172a" strokeWidth="1.6" />
        <polygon points={`${X(1.13)},${Y(0)} ${X(1.13) - 9},${Y(0) - 4} ${X(1.13) - 9},${Y(0) + 4}`} fill="#0f172a" />
        <polygon points={`${X(0)},${Y(2.75)} ${X(0) - 4},${Y(2.75) + 9} ${X(0) + 4},${Y(2.75) + 9}`} fill="#0f172a" />
        <text x={X(1.13) + 6} y={Y(0) + 5} fontSize="16" fontStyle="italic" fill="#0f172a">
          l
        </text>
        <text x={X(0) - 16} y={Y(2.75) + 4} fontSize="16" fontStyle="italic" fill="#0f172a">
          c
        </text>
        {/* droite de budget */}
        <line x1={X(0)} y1={Y(wealth)} x2={X(L)} y2={Y(Mrev)} stroke="#e11d48" strokeWidth="3" />
        {/* pointillés vers ω */}
        <line x1={X(L)} y1={Y(0)} x2={X(L)} y2={Y(Mrev)} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
        <line x1={X(0)} y1={Y(Mrev)} x2={X(L)} y2={Y(Mrev)} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
        {/* point de dotation ω */}
        <circle cx={X(L)} cy={Y(Mrev)} r="6" fill="#0f172a" />
        <text x={X(L) + 10} y={Y(Mrev) + 4} fontSize="16" fontStyle="italic" fill="#0f172a">
          ω
        </text>
        <text x={X(L) - 4} y={Y(0) + 18} fontSize="14" fontStyle="italic" fill="#475569">
          L
        </text>
        <text x={X(0) - 26} y={Y(Mrev) + 4} fontSize="14" fontStyle="italic" fill="#475569">
          M
        </text>
        {/* ordonnée à l'origine */}
        <circle cx={X(0)} cy={Y(wealth)} r="4.5" fill="#e11d48" />
        <text x={X(0) + 10} y={Y(wealth) - 8} fontSize="12.5" fill="#be123c" fontWeight="600">
          s(1−t)L + M = {fmt(wealth)}
        </text>
        {/* étiquettes */}
        <text x={X(0.16)} y={Y(0.28)} fontSize="12.5" fill="#4338ca" fontWeight="600">
          paniers accessibles
        </text>
        <text x={X(0.42)} y={(Y(wealth) + Y(Mrev)) / 2 - 12} fontSize="12.5" fill="#be123c" fontWeight="600">
          pente = −s(1−t) = −{fmt(slope)}
        </text>
      </svg>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. L'effet de la taxe sur l'offre de travail                        */
/* ------------------------------------------------------------------ */

export function LaborSupplyExplorer() {
  const [tPct, setTPct] = useState(20);
  const t = tPct / 100;

  // mêmes paramètres que la source : s = 2, a = 0,5, L = 1  →  l* = 0,25/(1−t)
  const s = 2;
  const a = 0.5;
  let leisure = a / (s * (1 - t));
  if (leisure > 1) leisure = 1;
  const work = 1 - leisure;

  const W = 600; // largeur de la barre en unités de viewBox
  const lx = leisure * W;

  let message: string;
  if (work > 0.6) message = "La taxe est modérée : le travailleur offre encore beaucoup de travail.";
  else if (work > 0.3) message = "La taxe pèse : le travail offert baisse nettement.";
  else if (work > 0.02)
    message = "La taxe décourage fortement : il ne reste presque plus de travail offert.";
  else
    message =
      "À ce niveau de taxe, le salaire net est si bas que le travailleur n'offre quasiment plus aucun travail.";

  return (
    <InteractiveCard
      title="L'effet de la taxe sur le travail"
      subtitle={
        <>
          Ici : salaire <M tex="s = 2" />, paramètre <M tex="a = 0{,}5" />, temps total{" "}
          <M tex="L = 1" />. Le loisir choisi suit la formule <M tex="l^*(t)=\dfrac{a}{s(1-t)}" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taxe <M tex="t" />
              </>
            }
            value={tPct}
            onChange={setTPct}
            min={0}
            max={74}
            step={1}
            format={(v) => fmt(v / 100)}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold text-emerald-700">
              loisir <M tex="l^*" /> = <span className="tabular-nums">{fmt(leisure)}</span>
            </span>
            <span className="font-semibold text-rose-700">
              travail = <span className="tabular-nums">{fmt(work)}</span>
            </span>
          </div>
        </>
      }
      footer={
        <>
          pousse la taxe vers 0,74 : le loisir dévore toute la journée et le travail offert tend
          vers zéro. C'est exactement le mécanisme qui fera <em>redescendre</em> la courbe de
          Laffer juste en dessous.
        </>
      }
    >
      <svg viewBox="0 0 600 132" className="w-full" role="img" aria-label="Répartition loisir / travail">
        <text x="0" y="16" fontSize="13" fontWeight="600" fill="#0f172a">
          Répartition d'une journée (24 h ramenées à 1)
        </text>
        <rect x="0" y="34" width={W} height="46" rx="6" fill="#e2e8f0" />
        <rect x="0" y="34" width={Math.max(lx, 0.5)} height="46" rx="6" fill="#059669" />
        {W - lx > 1 ? <rect x={lx} y="34" width={W - lx} height="46" fill="#e11d48" /> : null}
        <line x1={lx} y1="29" x2={lx} y2="85" stroke="#0f172a" strokeWidth="2" />
        {lx > 55 ? (
          <text x={lx / 2} y="62" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
            loisir
          </text>
        ) : null}
        {W - lx > 55 ? (
          <text x={lx + (W - lx) / 2} y="62" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
            travail
          </text>
        ) : null}
        <text x="0" y="106" fontSize="13" fontWeight="600" fill="#059669">
          loisir l* = {fmt(leisure)}
        </text>
        <text x={W} y="106" textAnchor="end" fontSize="13" fontWeight="600" fill="#e11d48">
          travail = {fmt(work)}
        </text>
      </svg>
      <p className="mt-2 text-sm text-muted-foreground">
        À une taxe de {Math.round(t * 100)}&nbsp;%, le travailleur garde {fmt(leisure)} de loisir et
        n'offre que {fmt(work)} de travail. {message}
      </p>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. La courbe de Laffer                                              */
/* ------------------------------------------------------------------ */

export function LafferExplorer() {
  const [tPct, setTPct] = useState(40);
  const t = tPct / 100;

  // forme schématique de la source : raw(t) = t(1−t)^1.5, sommet en t = 0,4
  const raw = (x: number) => x * Math.pow(1 - x, 1.5);
  const tPeak = 0.4;
  const rawPeak = raw(tPeak);
  const rel = (x: number) => raw(x) / rawPeak; // normalisé : sommet = 1

  const X0 = 55;
  const X1 = 560;
  const Y0 = 270;
  const YTOP = 45;
  const xPix = (x: number) => X0 + x * (X1 - X0);
  const yPix = (m: number) => Y0 - m * (Y0 - YTOP);

  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      d += (i === 0 ? "M " : " L ") + xPix(x).toFixed(1) + " " + yPix(rel(x)).toFixed(1);
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = rel(t);

  let message: string;
  if (t < tPeak - 0.02)
    message = "Tu es à gauche du sommet : augmenter la taxe rapporte ENCORE PLUS de recettes.";
  else if (t > tPeak + 0.02)
    message =
      "Tu es à droite du sommet : augmenter la taxe fait BAISSER les recettes (le travail chute trop). C'est le piège de Laffer.";
  else message = "Tu es au sommet ! C'est le taux qui maximise les recettes redistribuées (M est au maximum).";

  return (
    <InteractiveCard
      title="La courbe de Laffer"
      subtitle={
        <>
          Fais varier la taxe et regarde le montant collecté. Cherche le sommet : le taux qui
          rapporte le plus. (Forme schématique à des fins de visualisation, sommet à{" "}
          <M tex="t \approx 0{,}40" />.)
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taxe <M tex="t" />
              </>
            }
            value={tPct}
            onChange={setTPct}
            min={1}
            max={99}
            step={1}
            format={(v) => fmt(v / 100)}
          />
          <div className="flex items-center text-[13px] font-semibold">
            <span className="rounded-md bg-primary px-2 py-1 tabular-nums text-primary-foreground">
              M = {fmt(m)}
            </span>
          </div>
        </>
      }
      footer={
        <>
          les recettes sont nulles à <M tex="t=0" /> (on ne prélève rien) <em>et</em> à{" "}
          <M tex="t=1" /> (plus personne ne travaille). Entre les deux, elles montent puis
          redescendent : au-delà du sommet, taxer plus rapporte <strong>moins</strong>.
        </>
      }
    >
      <svg viewBox="0 0 600 320" className="w-full" role="img" aria-label="Courbe de Laffer interactive">
        {/* axes */}
        <line x1={X0} y1={Y0} x2="580" y2={Y0} stroke="#0f172a" strokeWidth="1.6" />
        <line x1={X0} y1={Y0} x2={X0} y2="20" stroke="#0f172a" strokeWidth="1.6" />
        <polygon points={`580,${Y0} 570,${Y0 - 5} 570,${Y0 + 5}`} fill="#0f172a" />
        <polygon points={`${X0},20 ${X0 - 5},30 ${X0 + 5},30`} fill="#0f172a" />
        <text x="562" y={Y0 + 22} fontSize="16" fontStyle="italic" fill="#0f172a">
          t
        </text>
        <text x="14" y="32" fontSize="15" fontStyle="italic" fill="#0f172a">
          M(t)
        </text>
        <text x={X0 - 6} y={Y0 + 18} fontSize="12.5" fill="#475569">
          0
        </text>
        <text x={xPix(1) - 4} y={Y0 + 18} fontSize="12.5" fill="#475569">
          1
        </text>
        {/* courbe */}
        <path d={path} fill="none" stroke="#d97706" strokeWidth="2.8" />
        {/* sommet */}
        <line
          x1={xPix(tPeak)}
          y1={Y0}
          x2={xPix(tPeak)}
          y2={yPix(1)}
          stroke="#94a3b8"
          strokeWidth="1.3"
          strokeDasharray="4 4"
        />
        <text x={xPix(tPeak) - 60} y={yPix(1) - 8} fontSize="13" fontStyle="italic" fill="#0f172a">
          sommet ≈ 0,40
        </text>
        {/* position courante */}
        <line
          x1={xPix(t)}
          y1={Y0}
          x2={xPix(t)}
          y2={yPix(m)}
          stroke="#94a3b8"
          strokeWidth="1.3"
          strokeDasharray="4 4"
        />
        <circle cx={xPix(t)} cy={yPix(m)} r="7" fill="#4338ca" />
      </svg>
      <p className="mt-2 text-sm text-muted-foreground">
        M représente le montant collecté puis redistribué (en part du maximum). {message}
      </p>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Sondage A/B — expérience de pensée comportementale               */
/* ------------------------------------------------------------------ */

export interface PollStat {
  /** ex. "Version A · 15→10 €" */
  version: string;
  /** ex. "82 %" */
  num: string;
  /** ex. "font le trajet" */
  label: ReactNode;
}

export function PollAB({
  scenario,
  question,
  options,
  statA,
  statB,
  bias,
  explanation,
}: {
  scenario: ReactNode;
  question: ReactNode;
  /** les choix proposés au lecteur (version A du sondage) */
  options: ReactNode[];
  statA: PollStat;
  statB: PollStat;
  /** nom du biais révélé, ex. "utilité de transaction" */
  bias: string;
  /** « pourquoi c'est une déviation » */
  explanation: ReactNode;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const voted = chosen !== null;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-slate-300 bg-card shadow-sm">
      <div className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white sm:px-5">
        <Vote className="h-4 w-4" aria-hidden />
        À toi de voter — vraie expérience de pensée
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
              onClick={() => setChosen(i)}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-left text-[15px] leading-relaxed transition-colors",
                !voted && "hover:border-primary hover:bg-accent/50",
                voted && chosen === i && "border-primary bg-accent ring-1 ring-primary",
                voted && chosen !== i && "opacity-60",
              )}
            >
              <span className="mr-2 font-bold text-primary">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        {voted ? (
          <div className="mt-4 border-t border-dashed pt-4 animate-in fade-in slide-in-from-top-1">
            <p className="mb-3 text-sm text-muted-foreground">
              Ton vote est enregistré. Voici les résultats <strong>réellement observés</strong> — et
              la deuxième version du sondage, posée à d'autres personnes :
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[statA, statB].map((st, i) => (
                <div key={i} className="rounded-xl border bg-muted/50 px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {st.version}
                  </div>
                  <div className="text-3xl font-extrabold text-primary">{st.num}</div>
                  <div className="text-[13px] leading-snug text-muted-foreground">{st.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[13px] font-bold text-amber-800">
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
