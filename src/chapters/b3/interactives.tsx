/*
 * Chapitre B3 — composants interactifs.
 *
 * Chaque widget reproduit fidèlement la logique du manuel interactif source :
 *  - PollTwoDays             : le sondage « ton intuition avant de calculer »
 *    (festival de 2 jours) avec révélation de la réponse du chapitre ;
 *  - TwoPeriodExplorer       : les trois options du joueur 2 face au grim de 1
 *    à deux périodes — 4+4δ, 6+2δ et 4+6δ en fonction de δ ;
 *  - GeometricSeriesExplorer : la somme infinie ∑ δ^t·a qui converge vers
 *    a/(1−δ) — barres δ^t·a, somme cumulée et asymptote ;
 *  - ThresholdDuel           : LE widget du chapitre — 4/(1−δ) contre
 *    6 + 2δ/(1−δ), croisement exact en δ = 1/2 ;
 *  - GeneralThreshold        : le seuil général δ* = (t−c)/(t−p) piloté par
 *    trois curseurs (tentation, coopération, punition) ;
 *  - FestivalSimulator       : le mini-jeu « 10 jours de festival » contre un
 *    adversaire mystère (tit-for-tat, grim, toujours trahir, toujours coopérer) ;
 *  - MasteryChecklist        : la checklist de maîtrise avec compteur.
 */

import { useState, type ReactNode } from "react";
import { CheckCircle2, RotateCcw, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";

/* ------------------------------------------------------------------ */
/* Helpers partagés                                                    */
/* ------------------------------------------------------------------ */

/** format à la belge : 8,75 */
function fr(x: number, digits = 2): string {
  return x.toLocaleString("fr-BE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** petite tuile de lecture (équivalent des .ro de la source) */
function Readout({
  label,
  value,
  accent,
}: {
  label: ReactNode;
  value: ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-lg border bg-card px-3 py-2 text-sm"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      {label}{" "}
      <span className="font-mono text-[15px] font-bold tabular-nums">{value}</span>
    </div>
  );
}

/** bandeau de verdict coloré (équivalent des .verdict de la source) */
function Verdict({ tone, children }: { tone: "good" | "bad" | "mid"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium leading-relaxed",
        tone === "good" && "border-emerald-300 bg-emerald-50 text-emerald-900",
        tone === "bad" && "border-rose-300 bg-rose-50 text-rose-900",
        tone === "mid" && "border-amber-300 bg-amber-50 text-amber-900",
      )}
    >
      {children}
    </div>
  );
}

const COL = {
  green: "#047857",
  greenSoft: "#d1fae5",
  red: "#be123c",
  amber: "#b45309",
  purple: "#7c3aed",
  ink: "#1c1917",
  grid: "#e7e5e4",
  axis: "#a8a29e",
  label: "#78716c",
  barFill: "#e0f2fe",
  barStroke: "#0369a1",
};

/* ------------------------------------------------------------------ */
/* 0. Sondage « ton intuition avant de calculer » (§1)                 */
/* ------------------------------------------------------------------ */

const POLL_OPTIONS = [
  "Oui — personne ne veut déclencher la guerre des prix.",
  "Non — quelque chose va casser la menace.",
  "Ça dépend du facteur d'escompte δ.",
];

export function PollTwoDays() {
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="my-6 rounded-2xl border-2 border-dashed bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700">
        <Vote className="h-4 w-4" aria-hidden />
        Ton intuition avant de calculer
      </div>
      <p className="course-prose mt-2 text-[15px] font-medium">
        Le festival dure exactement <strong>2 jours</strong>, et tout le monde le sait. La menace
        « si tu trahis, je te punirai demain » suffira-t-elle à faire coopérer deux joueurs
        rationnels ?
      </p>
      <div className="mt-3 grid gap-2">
        {POLL_OPTIONS.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setChoice(i)}
            disabled={revealed}
            aria-pressed={choice === i}
            className={cn(
              "w-full rounded-xl border px-3.5 py-2.5 text-left text-[15px] transition-colors",
              choice === i
                ? "border-violet-400 bg-violet-50 font-semibold text-violet-900"
                : "hover:bg-muted",
              revealed && choice !== i && "opacity-60",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={choice === null}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Voir la réponse du chapitre
        </button>
      ) : (
        <div className="course-prose mt-3 rounded-xl bg-violet-50 px-4 py-3 text-[15px] text-violet-950 animate-in fade-in slide-in-from-top-1">
          Réponse (surprenante) : <strong>non, jamais</strong> — et même pas « ça dépend de{" "}
          <M tex="\delta" /> » ! Avec un nombre <em>fini</em> et connu de jours, la coopération
          s'effondre quel que soit <M tex="\delta" /> (§ 3–4). La coopération ne devient possible
          que si les joueurs ne peuvent pas anticiper la fin du jeu (§ 5–7). C'est tout l'enjeu du
          chapitre.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Deux périodes : les trois options du joueur 2 (§3)               */
/* ------------------------------------------------------------------ */

export function TwoPeriodExplorer() {
  const [d, setD] = useState(0.6);

  // mêmes constantes et mêmes formules que la source
  const W = 560;
  const H = 300;
  const pad = 44;
  const yMax = 10.5;
  const X = (dd: number) => pad + dd * (W - pad - 14);
  const Y = (v: number) => H - pad - (v / yMax) * (H - pad - 16);
  const fGG = (dd: number) => 4 + 4 * dd; // grim (C,C)
  const fTT = (dd: number) => 6 + 2 * dd; // trahir 2×
  const fCT = (dd: number) => 4 + 6 * dd; // C puis T

  const gg = fGG(d);
  const tt = fTT(d);
  const ct = fCT(d);
  const best = Math.max(tt, ct);
  const who =
    tt >= ct ? "« trahir les deux périodes »" : "« coopérer puis trahir au dernier jour »";

  return (
    <InteractiveCard
      title="Deux périodes — les trois options du joueur 2 face au grim de 1"
      subtitle={
        <>
          Payoff total <M tex="\Pi_2 = \pi_0 + \delta\,\pi_1" /> de chaque stratégie, en fonction
          du facteur d'escompte <M tex="\delta" />.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Facteur d'escompte <M tex="\delta" />
            </>
          }
          value={d}
          onChange={setD}
          min={0}
          max={1}
          step={0.01}
          format={(v) => fr(v)}
        />
      }
      footer={
        <>
          Bouge <M tex="\delta" /> de 0 à 1 : la ligne verte (grim) ne passe <em>jamais</em>{" "}
          au-dessus des deux autres. Petit détail savoureux : pour <M tex="\delta < 0{,}5" /> la
          meilleure déviation est « trahir tout de suite », pour <M tex="\delta > 0{,}5" /> c'est
          « coopérer puis poignarder au dernier jour ». Mais dans tous les cas, dévier bat
          coopérer.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout label="grim (C, C) :" value={fr(gg)} accent={COL.green} />
        <Readout label="trahir 2× (T, T) :" value={fr(tt)} accent={COL.red} />
        <Readout label="C puis T :" value={fr(ct)} accent={COL.amber} />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Payoffs des trois stratégies du joueur 2 en fonction de delta"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {/* grille horizontale */}
        {[2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={pad} y1={Y(v)} x2={W - 14} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        {[0, 0.25, 0.5, 0.75, 1].map((dd) => (
          <text key={dd} x={X(dd)} y={H - pad + 16} textAnchor="middle" fontSize={11} fill={COL.label}>
            {fr(dd, dd === 0 || dd === 1 ? 0 : 2)}
          </text>
        ))}
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={13} fill={COL.purple}>
          δ
        </text>
        <text x={pad - 30} y={20} fontSize={13} fill={COL.ink}>
          Π₂
        </text>

        {/* les trois droites (affines : deux points suffisent) */}
        <line x1={X(0)} y1={Y(fGG(0))} x2={X(1)} y2={Y(fGG(1))} stroke={COL.green} strokeWidth={2.6} />
        <line x1={X(0)} y1={Y(fTT(0))} x2={X(1)} y2={Y(fTT(1))} stroke={COL.red} strokeWidth={2.6} />
        <line x1={X(0)} y1={Y(fCT(0))} x2={X(1)} y2={Y(fCT(1))} stroke={COL.amber} strokeWidth={2.6} />
        <text x={X(0.86)} y={Y(fGG(0.86)) + 16} textAnchor="middle" fontSize={11} fill={COL.green}>
          grim (4+4δ)
        </text>
        <text x={X(0.28)} y={Y(fTT(0.28)) - 8} textAnchor="middle" fontSize={11} fill={COL.red}>
          trahir 2× (6+2δ)
        </text>
        <text x={X(0.72)} y={Y(fCT(0.72)) - 9} textAnchor="middle" fontSize={11} fill={COL.amber}>
          C puis T (4+6δ)
        </text>

        {/* curseur δ + points courants */}
        <line
          x1={X(d)}
          y1={H - pad}
          x2={X(d)}
          y2={14}
          stroke={COL.purple}
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <circle cx={X(d)} cy={Y(gg)} r={4.5} fill={COL.green} />
        <circle cx={X(d)} cy={Y(tt)} r={4.5} fill={COL.red} />
        <circle cx={X(d)} cy={Y(ct)} r={4.5} fill={COL.amber} />
      </svg>

      <Verdict tone="bad">
        Dévier rapporte <strong>{fr(best)}</strong> contre <strong>{fr(gg)}</strong> pour grim :
        la meilleure déviation est {who}. Grim n'est jamais une meilleure réponse ⇒ pas d'ENPS
        coopératif à horizon fini.
      </Verdict>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. La somme géométrique converge vers a/(1−δ) (§5)                  */
/* ------------------------------------------------------------------ */

export function GeometricSeriesExplorer() {
  const [aChoice, setAChoice] = useState<"4" | "2">("4");
  const [d, setD] = useState(0.5);

  const a = Number(aChoice);
  const W = 560;
  const H = 300;
  const pad = 44;
  const N = 15;

  const full = a / (1 - d);
  const yMax = Math.max(full * 1.12, a * 1.4);
  const Y = (v: number) => H - pad - (v / yMax) * (H - pad - 18);
  const slot = (W - pad - 24) / N;
  const bw = slot - 6;

  const bars: Array<{ x: number; v: number; cum: number }> = [];
  let cum = 0;
  for (let t = 0; t < N; t++) {
    const v = a * Math.pow(d, t);
    cum += v;
    bars.push({ x: pad + 8 + t * slot, v, cum });
  }
  const partial = cum;

  return (
    <InteractiveCard
      title={
        <>
          Voir la somme infinie converger vers <M tex="a/(1-\delta)" />
        </>
      }
      subtitle={
        <>
          Chaque barre = <M tex="\delta^t \cdot a" />, le payoff du jour <M tex="t" /> « vu depuis
          aujourd'hui ». La ligne dorée cumule les barres.
        </>
      }
      controls={
        <>
          <ChoiceChips
            label={
              <>
                Payoff de période <M tex="a" />
              </>
            }
            options={[
              { value: "4", label: "a = 4 (cartel)" },
              { value: "2", label: "a = 2 (guerre des prix)" },
            ]}
            value={aChoice}
            onChange={setAChoice}
          />
          <SliderControl
            label={
              <>
                Facteur d'escompte <M tex="\delta" />
              </>
            }
            value={d}
            onChange={setD}
            min={0.05}
            max={0.95}
            step={0.01}
            format={(v) => fr(v)}
          />
        </>
      }
      footer={
        <>
          Monte <M tex="\delta" /> : les barres rétrécissent moins vite, la somme explose (à{" "}
          <M tex="\delta = 0{,}9" />, recevoir 4 pour toujours vaut 40 !). C'est ça, la patience :
          le futur pèse lourd. Remarque aussi que la somme des 15 premières périodes colle déjà
          presque à la formule <M tex="a/(1-\delta)" /> : les termes suivants sont minuscules.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Barres des payoffs escomptés et somme cumulée convergeant vers a/(1−δ)"
        className="w-full rounded-xl border bg-card"
      >
        {/* axes */}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        {bars.map((b, t) => (
          <text
            key={t}
            x={b.x + bw / 2}
            y={H - pad + 16}
            textAnchor="middle"
            fontSize={10.5}
            fill={COL.label}
          >
            {t}
          </text>
        ))}
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={11} fill={COL.label}>
          période t
        </text>

        {/* barres δ^t·a */}
        {bars.map((b, t) => (
          <rect
            key={t}
            x={b.x}
            y={Y(b.v)}
            width={bw}
            height={H - pad - Y(b.v)}
            fill={COL.barFill}
            stroke={COL.barStroke}
            strokeWidth={1}
          />
        ))}

        {/* asymptote a/(1−δ) */}
        <line
          x1={pad}
          y1={Y(full)}
          x2={W - 14}
          y2={Y(full)}
          stroke={COL.purple}
          strokeWidth={1.6}
          strokeDasharray="6 4"
        />
        <text x={W - 16} y={Y(full) - 6} textAnchor="end" fontSize={11} fill={COL.purple}>
          a/(1−δ) = {fr(full)}
        </text>

        {/* somme cumulée */}
        <polyline
          points={bars.map((b) => `${b.x + bw / 2},${Y(b.cum)}`).join(" ")}
          fill="none"
          stroke={COL.amber}
          strokeWidth={2.4}
        />
        <text
          x={bars[N - 1].x + bw / 2}
          y={Y(bars[N - 1].cum) - 8}
          textAnchor="end"
          fontSize={11}
          fill={COL.amber}
        >
          somme cumulée
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-2.5">
        <Readout label="Somme des 15 premières périodes :" value={fr(partial)} />
        <Readout
          label={
            <>
              Formule <M tex="a/(1-\delta)" /> :
            </>
          }
          value={fr(full)}
          accent={COL.purple}
        />
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Le duel des deux payoffs : seuil δ ≥ 1/2 (§7)                    */
/* ------------------------------------------------------------------ */

export function ThresholdDuel() {
  const [d, setD] = useState(0.35);

  const W = 560;
  const H = 320;
  const pad = 46;
  const dMax = 0.95;
  const yMax = 46;
  const X = (dd: number) => pad + (dd / dMax) * (W - pad - 14);
  const Y = (v: number) => H - pad - (v / yMax) * (H - pad - 16);
  const fC = (dd: number) => 4 / (1 - dd);
  const fD = (dd: number) => 6 + (2 * dd) / (1 - dd);

  // échantillonnage identique à la source (sortie par le haut si v > yMax)
  function sample(f: (dd: number) => number): string {
    const pts: string[] = [];
    for (let i = 0; i <= 190; i++) {
      const dd = i / 200;
      if (dd > dMax) break;
      const v = f(dd);
      if (v > yMax) {
        pts.push(`${X(dd)},${Y(yMax)}`);
        break;
      }
      pts.push(`${X(dd)},${Y(v)}`);
    }
    return pts.join(" ");
  }

  const c = fC(d);
  const v = fD(d);
  const atThreshold = Math.abs(d - 0.5) < 0.005;

  return (
    <InteractiveCard
      title="Coopérer ou trahir ? Le duel des deux payoffs"
      subtitle={
        <>
          Le cœur du chapitre : <M tex="\tfrac{4}{1-\delta}" /> (coopérer pour toujours) contre{" "}
          <M tex="6 + \delta\tfrac{2}{1-\delta}" /> (trahir maintenant, subir la punition).
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Facteur d'escompte <M tex="\delta" />
            </>
          }
          value={d}
          onChange={setD}
          min={0}
          max={0.95}
          step={0.01}
          format={(vv) => fr(vv)}
        />
      }
      footer={
        <>
          Les deux courbes se croisent exactement en <M tex="\delta = 0{,}5" /> (où les deux
          valent 8). À gauche : le festin immédiat de 6 l'emporte. À droite : l'éternité de 4
          écrase tout — à <M tex="\delta = 0{,}9" />, coopérer vaut 40 contre 24 pour trahir !
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              Coopérer pour toujours <M tex="\tfrac{4}{1-\delta}" /> =
            </>
          }
          value={fr(c)}
          accent={COL.green}
        />
        <Readout
          label={
            <>
              Trahir maintenant <M tex="6 + \tfrac{2\delta}{1-\delta}" /> =
            </>
          }
          value={fr(v)}
          accent={COL.red}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Payoff de coopération et de déviation en fonction de delta, croisement à 0,5"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {/* zone de coopération δ ≥ 1/2 */}
        <rect
          x={X(0.5)}
          y={12}
          width={X(dMax) - X(0.5)}
          height={H - pad - 12}
          fill={COL.greenSoft}
          opacity={0.55}
        />
        <text x={X(0.72)} y={28} textAnchor="middle" fontSize={11} fill={COL.green}>
          zone de coopération
        </text>

        {/* grille + axes */}
        {[10, 20, 30, 40].map((g) => (
          <g key={g}>
            <line x1={pad} y1={Y(g)} x2={W - 14} y2={Y(g)} stroke={COL.grid} strokeWidth={1} />
            <text x={pad - 6} y={Y(g) + 4} textAnchor="end" fontSize={11} fill={COL.label}>
              {g}
            </text>
          </g>
        ))}
        <line x1={pad} y1={H - pad} x2={W - 14} y2={H - pad} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pad} y1={H - pad} x2={pad} y2={12} stroke={COL.axis} strokeWidth={1.4} />
        {[0, 0.25, 0.5, 0.75].map((dd) => (
          <text key={dd} x={X(dd)} y={H - pad + 16} textAnchor="middle" fontSize={11} fill={COL.label}>
            {fr(dd)}
          </text>
        ))}
        <text x={W - 14} y={H - pad + 30} textAnchor="end" fontSize={13} fill={COL.purple}>
          δ
        </text>

        {/* courbes */}
        <polyline points={sample(fC)} fill="none" stroke={COL.green} strokeWidth={2.8} />
        <polyline points={sample(fD)} fill="none" stroke={COL.red} strokeWidth={2.8} />
        <text x={X(0.78)} y={Y(fC(0.78)) - 10} textAnchor="middle" fontSize={11} fill={COL.green}>
          coopérer 4/(1−δ)
        </text>
        <text x={X(0.72)} y={Y(fD(0.72)) + 18} textAnchor="middle" fontSize={11} fill={COL.red}>
          trahir 6+2δ/(1−δ)
        </text>

        {/* croisement δ = 1/2 */}
        <line
          x1={X(0.5)}
          y1={H - pad}
          x2={X(0.5)}
          y2={12}
          stroke={COL.purple}
          strokeWidth={1.6}
          strokeDasharray="6 4"
        />
        <circle cx={X(0.5)} cy={Y(8)} r={5} fill={COL.purple} />
        <text x={X(0.5) + 8} y={Y(8) - 8} fontSize={11} fill={COL.purple}>
          croisement : δ = 0,5 ; Π = 8
        </text>

        {/* curseur */}
        <line x1={X(d)} y1={H - pad} x2={X(d)} y2={12} stroke={COL.ink} strokeWidth={1.2} />
        {c <= yMax ? <circle cx={X(d)} cy={Y(c)} r={4.5} fill={COL.green} /> : null}
        {v <= yMax ? <circle cx={X(d)} cy={Y(v)} r={4.5} fill={COL.red} /> : null}
      </svg>

      {atThreshold ? (
        <Verdict tone="mid">
          <M tex="\delta = 0{,}50" /> : indifférence parfaite (8 = 8). C'est le seuil exact.
        </Verdict>
      ) : c >= v ? (
        <Verdict tone="good">
          <M tex="\delta \ge 1/2" /> : coopérer ({fr(c)}) bat trahir ({fr(v)}). Grim-grim est un
          ENPS — le cartel tient.
        </Verdict>
      ) : (
        <Verdict tone="bad">
          <M tex="\delta < 1/2" /> : trahir ({fr(v)}) bat coopérer ({fr(c)}). Joueurs trop
          impatients — la menace ne suffit pas.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Le seuil général δ* = (t−c)/(t−p) (§8)                           */
/* ------------------------------------------------------------------ */

export function GeneralThreshold() {
  const [t, setT] = useState(6);
  const [c, setC] = useState(4);
  const [p, setP] = useState(2);

  // on préserve l'invariant t > c > p (mêmes contraintes que la source)
  function updateT(v: number) {
    const nt = v;
    const nc = Math.min(c, nt - 1);
    const np = Math.min(p, nc - 1);
    setT(nt);
    setC(nc);
    setP(np);
  }
  function updateC(v: number) {
    const nc = Math.min(Math.max(v, p + 1), t - 1);
    const np = Math.min(p, nc - 1);
    setC(nc);
    setP(np);
  }
  function updateP(v: number) {
    setP(Math.min(v, c - 1));
  }

  const ds = (t - c) / (t - p);
  const tone = ds <= 0.34 ? "good" : ds <= 0.67 ? "mid" : "bad";

  const W = 560;
  const H = 84;
  const x0 = 30;
  const x1 = 530;
  const GX = (vv: number) => x0 + vv * (x1 - x0);

  return (
    <InteractiveCard
      title="Fabrique ton propre dilemme et observe le seuil δ*"
      subtitle={
        <>
          Payoffs par période : coopérer rapporte <M tex="c" />, la tentation vaut <M tex="t" />,
          la punition <M tex="p" /> (avec <M tex="t > c > p" />). Seuil de coopération :{" "}
          <M tex="\delta^* = \tfrac{t-c}{t-p}" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Tentation <M tex="t" />
              </>
            }
            value={t}
            onChange={updateT}
            min={5}
            max={12}
            step={1}
          />
          <SliderControl
            label={
              <>
                Coopération <M tex="c" />
              </>
            }
            value={c}
            onChange={updateC}
            min={3}
            max={9}
            step={1}
          />
          <SliderControl
            label={
              <>
                Punition <M tex="p" />
              </>
            }
            value={p}
            onChange={updateP}
            min={0}
            max={5}
            step={1}
          />
        </>
      }
      footer={
        <>
          Augmente la tentation <M tex="t" /> : le seuil monte (il faut des joueurs plus
          patients). Durcis la punition (baisse <M tex="p" />) : le seuil descend (la coopération
          devient plus facile). C'est exactement la conclusion du cours : le coût de la punition
          dépend <strong>des payoffs du jeu simultané</strong> et{" "}
          <strong>du facteur d'escompte du joueur puni</strong>.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              Seuil de coopération <M tex="\delta^* = \tfrac{t-c}{t-p}" /> =
            </>
          }
          value={fr(ds, 3)}
          accent={COL.purple}
        />
      </div>

      {/* jauge : où se trouve δ* entre 0 et 1 ? */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Position du seuil delta étoile entre 0 et 1"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        <rect x={x0} y={38} width={GX(ds) - x0} height={12} rx={3} fill="#ffe4e6" />
        <rect x={GX(ds)} y={38} width={x1 - GX(ds)} height={12} rx={3} fill={COL.greenSoft} />
        <line x1={x0} y1={50} x2={x1} y2={50} stroke={COL.axis} strokeWidth={1.4} />
        {[0, 0.25, 0.5, 0.75, 1].map((vv) => (
          <g key={vv}>
            <line x1={GX(vv)} y1={50} x2={GX(vv)} y2={56} stroke={COL.axis} strokeWidth={1.2} />
            <text x={GX(vv)} y={70} textAnchor="middle" fontSize={11} fill={COL.label}>
              {fr(vv, vv === 0 || vv === 1 ? 0 : 2)}
            </text>
          </g>
        ))}
        <line x1={GX(ds)} y1={30} x2={GX(ds)} y2={54} stroke={COL.purple} strokeWidth={2.4} />
        <text
          x={GX(ds)}
          y={22}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={COL.purple}
        >
          δ* = {fr(ds, 3)}
        </text>
        <text x={x0 + 4} y={34} fontSize={10.5} fill={COL.red}>
          trahison (δ &lt; δ*)
        </text>
        <text x={x1 - 4} y={34} textAnchor="end" fontSize={10.5} fill={COL.green}>
          coopération possible (δ ≥ δ*)
        </text>
      </svg>

      {tone === "good" ? (
        <Verdict tone="good">
          Seuil bas : la coopération est facile — même des joueurs assez impatients coopèrent.
        </Verdict>
      ) : tone === "mid" ? (
        <Verdict tone="mid">
          Seuil intermédiaire : il faut des joueurs raisonnablement patients (comme le 1/2 du
          cours, obtenu avec t = 6, c = 4, p = 2).
        </Verdict>
      ) : (
        <Verdict tone="bad">
          Seuil élevé : la tentation est énorme et/ou la punition trop douce — seuls des joueurs
          ultra-patients coopéreraient.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Le mini-jeu : 10 jours de festival (§9)                          */
/* ------------------------------------------------------------------ */

type Move = "C" | "T";
type OppKey = "tft" | "grim" | "tt" | "tc";

const ROUNDS = 10;
const DELTA_SIM = 0.9;

const OPP_NAMES: Record<OppKey, string> = {
  tft: "Tit-for-Tat (copie ton dernier coup)",
  grim: "Grim (te punit pour toujours à ta 1ʳᵉ trahison)",
  tt: "Toujours trahir",
  tc: "Toujours coopérer",
};

/** stratégie machine : mêmes règles que la source */
function machineMove(op: OppKey, hist: Array<{ me: Move; him: Move }>): Move {
  const t = hist.length;
  if (op === "tt") return "T";
  if (op === "tc") return "C";
  if (op === "tft") return t === 0 ? "C" : hist[t - 1].me;
  // grim : trahit pour toujours dès ta première trahison
  for (let i = 0; i < t; i++) if (hist[i].me === "T") return "T";
  return "C";
}

/** payoff de a contre b (matrice du fritkot) */
function pay(a: Move, b: Move): number {
  if (a === "C" && b === "C") return 4;
  if (a === "C" && b === "T") return 0;
  if (a === "T" && b === "C") return 6;
  return 2;
}

export function FestivalSimulator() {
  const [op, setOp] = useState<OppKey>("tft");
  const [hist, setHist] = useState<Array<{ me: Move; him: Move }>>([]);

  const over = hist.length >= ROUNDS;
  const me = hist.reduce((s, h) => s + pay(h.me, h.him), 0);
  const him = hist.reduce((s, h) => s + pay(h.him, h.me), 0);
  const med = hist.reduce((s, h, i) => s + pay(h.me, h.him) * Math.pow(DELTA_SIM, i), 0);

  function play(mine: Move) {
    if (over) return;
    setHist((prev) => [...prev, { me: mine, him: machineMove(op, prev) }]);
  }
  function reset() {
    setHist([]);
  }

  return (
    <InteractiveCard
      title="Joue toi-même 10 jours de festival !"
      subtitle="Tu es le Fritkot 1. Chaque jour, choisis ton prix contre un adversaire à la stratégie cachée."
      controls={
        <>
          <ChoiceChips
            label="Ton adversaire (stratégie cachée… ou pas)"
            options={[
              { value: "tft", label: "Mystère n°1" },
              { value: "grim", label: "Mystère n°2" },
              { value: "tt", label: "Mystère n°3" },
              { value: "tc", label: "Mystère n°4" },
            ]}
            value={op}
            onChange={(v) => {
              setOp(v);
              setHist([]);
            }}
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Recommencer
            </button>
          </div>
        </>
      }
      footer={
        <>
          Défi : identifie la stratégie de chaque adversaire mystère (parmi : tit-for-tat, grim,
          toujours trahir, toujours coopérer). Astuce de détective : trahis une fois, recoopère,
          et observe s'il pardonne… La réponse s'affiche au jour 10.
        </>
      }
    >
      <p className="text-sm font-semibold">
        Jour {Math.min(hist.length + 1, ROUNDS)}/{ROUNDS} — choisis ton prix :
      </p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => play("C")}
          disabled={over}
          className="rounded-xl border-2 border-emerald-500 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          🤝 Coopérer (prix haut)
        </button>
        <button
          type="button"
          onClick={() => play("T")}
          disabled={over}
          className="rounded-xl border-2 border-rose-500 px-4 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          🗡️ Trahir (prix bas)
        </button>
      </div>

      {hist.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[380px] border-collapse text-center font-mono text-[13px]">
            <thead>
              <tr className="bg-muted/60 font-sans text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-1.5">Jour</th>
                <th className="px-2 py-1.5">Toi</th>
                <th className="px-2 py-1.5">Lui</th>
                <th className="px-2 py-1.5">π toi</th>
                <th className="px-2 py-1.5">π lui</th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {hist.map((h, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{i + 1}</td>
                  <td
                    className={cn(
                      "px-2 py-1 font-bold",
                      h.me === "C" ? "text-emerald-700" : "text-rose-700",
                    )}
                  >
                    {h.me === "C" ? "🤝 C" : "🗡️ T"}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1 font-bold",
                      h.him === "C" ? "text-emerald-700" : "text-rose-700",
                    )}
                  >
                    {h.him === "C" ? "🤝 C" : "🗡️ T"}
                  </td>
                  <td className="px-2 py-1">{pay(h.me, h.him)}</td>
                  <td className="px-2 py-1">{pay(h.him, h.me)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2.5">
        <Readout label="Ton total (simple) :" value={me} />
        <Readout label="Son total :" value={him} />
        <Readout
          label={
            <>
              Ton total escompté (<M tex="\delta = 0{,}9" />) :
            </>
          }
          value={fr(med)}
          accent={COL.purple}
        />
      </div>

      {over ? (
        <Verdict tone={me >= 32 ? "good" : me >= 24 ? "mid" : "bad"}>
          Fin du festival ! Ton adversaire jouait : <strong>{OPP_NAMES[op]}</strong>. Repère :
          coopération mutuelle parfaite = 40 points (4 × 10) ; guerre totale = 20 (2 × 10). Ton
          score : {me}.
        </Verdict>
      ) : null}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Checklist de maîtrise (§12)                                      */
/* ------------------------------------------------------------------ */

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
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Progression : {done.size} / {items.length}
        {done.size === items.length ? " 🎉" : ""}
      </div>
      <div className="grid gap-2">
        {items.map((it, i) => {
          const checked = done.has(i);
          return (
            <label
              key={i}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[15px] leading-relaxed transition-colors",
                checked ? "border-emerald-300 bg-emerald-50" : "bg-card hover:border-emerald-300",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(i)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>{it}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
