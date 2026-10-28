/*
 * Chapitre B3 — composants interactifs.
 *
 * Chaque widget reproduit fidèlement la logique du manuel interactif source :
 *  - PollTwoDays             : le sondage « ton intuition avant de calculer »
 *    (festival de 2 jours) avec révélation de la réponse du chapitre ;
 *  - TwoPeriodExplorer       : slide 7 — les stratégies s^G_2, s_2 et s'_2 du
 *    joueur 2 face à s^G_1 à deux périodes : 4+4δ, 6+2δ et 4+6δ ;
 *  - GeometricSeriesExplorer : slide 10 — la somme infinie ∑ δ^t·a qui converge
 *    vers a/(1−δ) — barres δ^t·a, somme cumulée et asymptote ;
 *  - ThresholdDuel           : slides 13-14 — 4/(1−δ) contre 6 + 2δ/(1−δ),
 *    croisement exact en δ = 1/2, écart (4δ − 2)/(1 − δ) ;
 *  - GeneralThreshold        : HORS SLIDES — le seuil général
 *    δ* = (π_tent − π_coop)/(π_tent − π_pun) piloté par trois curseurs ;
 *  - FestivalSimulator       : le mini-jeu « 10 jours de festival » contre un
 *    adversaire mystère (Tit-for-Tat, grim, toujours trahir, toujours coopérer) ;
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

/** nombre signé au format belge : +1,00 ; −0,92 ; 0,00 (vrai signe moins) */
function frSigned(x: number, digits = 2): string {
  if (Math.abs(x) < 0.5 * 10 ** -digits) return fr(0, digits);
  return (x < 0 ? "−" : "+") + fr(Math.abs(x), digits);
}

/** petite tuile de lecture (équivalent des .ro de la source) */
function Readout({
  label,
  value,
  accent,
  note,
}: {
  label: ReactNode;
  value: ReactNode;
  accent?: string;
  /** petite ligne d'explication sous la valeur (facultative) */
  note?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border bg-card px-3 py-2 text-sm"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      {label}{" "}
      <span className="font-mono text-[15px] font-bold tabular-nums">{value}</span>
      {note ? <div className="mt-0.5 text-xs text-muted-foreground">{note}</div> : null}
    </div>
  );
}

/**
 * Nom de stratégie du slide 7 dans un <text> SVG : s^G_2, s_2 ou s'_2, suivi de
 * `rest`. Indice et exposant posés avec dy (rendu identique dans tous les
 * navigateurs) ; l'exposant G est superposé à l'indice 2 comme en LaTeX.
 */
function SvgStrat({ kind, rest, size }: { kind: "G" | "plain" | "prime"; rest: string; size: number }) {
  const small = 0.75 * size;
  const down = 0.3 * size; // descente de l'indice
  const up = 0.75 * size; // montée de l'exposant depuis l'indice
  return (
    <>
      <tspan fontStyle="italic">s</tspan>
      {kind === "prime" ? <tspan>′</tspan> : null}
      <tspan dy={down} fontSize={small}>
        2
      </tspan>
      {kind === "G" ? (
        <tspan dx={-0.56 * small} dy={-up} fontSize={small} fontStyle="italic">
          G
        </tspan>
      ) : null}
      <tspan dy={kind === "G" ? up - down : -down}>{rest}</tspan>
    </>
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

  // repère : δ ∈ [0, 1] en abscisse, Π₂ ∈ [0 ; 10,5] en ordonnée
  const W = 520;
  const H = 300;
  const pL = 40;
  const pR = 16;
  const pT = 16;
  const pB = 40;
  const yMax = 10.5;
  const X = (dd: number) => pL + dd * (W - pL - pR);
  const Y = (v: number) => H - pB - (v / yMax) * (H - pB - pT);
  // les trois paiements du slide 7 (joueur 1 joue grim s^G_1)
  const fG = (dd: number) => 4 + 4 * dd; // s^G_2 : C puis C
  const fS = (dd: number) => 6 + 2 * dd; // s_2 : T puis T
  const fP = (dd: number) => 4 + 6 * dd; // s'_2 : C puis T

  const gg = fG(d);
  const tt = fS(d);
  const ct = fP(d);
  const best = Math.max(tt, ct);
  const who =
    Math.abs(tt - ct) < 0.005 ? (
      <>
        l'une ou l'autre (<M tex="s_2" /> et <M tex="s'_2" /> rapportent autant)
      </>
    ) : tt > ct ? (
      <>
        <M tex="s_2" /> (trahir les deux périodes)
      </>
    ) : (
      <>
        <M tex="s'_2" /> (coopérer en période 0, puis trahir en période 1)
      </>
    );
  const FS = 14.5; // taille des étiquettes dans le viewBox (lisible à 390 px)
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };

  return (
    <InteractiveCard
      title="Deux périodes : trois stratégies du joueur 2 face à grim (slide 7)"
      subtitle={
        <>
          Le joueur 1 joue grim <M tex="s^G_1" />. Payoff total{" "}
          <M tex="\Pi_2 = \pi_0 + \delta\,\pi_1" /> du joueur 2 pour chacune des trois stratégies
          du slide 7, en fonction du facteur d'escompte <M tex="\delta" />.
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
          Bouge <M tex="\delta" /> de 0 à 1 : la droite verte (<M tex="s^G_2" />) reste toujours
          sous la plus haute des deux autres. Il existe donc toujours une déviation strictement
          plus rentable. Pour <M tex="\delta < 0{,}5" />, c'est <M tex="s_2" /> (trahir dès la
          période 0) ; pour <M tex="\delta > 0{,}5" />, c'est <M tex="s'_2" /> (coopérer, puis
          trahir en période 1). La raison (slide 8) : en période 1, il n'y a plus de période
          suivante, donc plus de punition possible, et trahir y rapporte toujours plus que
          coopérer.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              <M tex="s^G_2" /> : C puis C =
            </>
          }
          value={fr(gg)}
          accent={COL.green}
        />
        <Readout
          label={
            <>
              <M tex="s_2" /> : T puis T =
            </>
          }
          value={fr(tt)}
          accent={COL.red}
        />
        <Readout
          label={
            <>
              <M tex="s'_2" /> : C puis T =
            </>
          }
          value={fr(ct)}
          accent={COL.amber}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Payoffs des stratégies s^G_2, s_2 et s'_2 du joueur 2 en fonction de delta"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {/* grille horizontale */}
        {[2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={pL} y1={Y(v)} x2={W - pR} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pL - 7} y={Y(v) + 4} textAnchor="end" fontSize={13.5} fill={COL.label}>
              {v}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={pL} y1={H - pB} x2={W - pR} y2={H - pB} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pL} y1={H - pB} x2={pL} y2={pT - 4} stroke={COL.axis} strokeWidth={1.4} />
        {[0, 0.25, 0.5, 0.75, 1].map((dd) => (
          <text key={dd} x={X(dd)} y={H - pB + 18} textAnchor="middle" fontSize={13.5} fill={COL.label}>
            {fr(dd, dd === 0 || dd === 1 ? 0 : dd === 0.5 ? 1 : 2)}
          </text>
        ))}
        <text x={W - pR} y={H - 4} textAnchor="end" fontSize={16} fontWeight={600} fill={COL.purple}>
          δ
        </text>
        <text x={pL + 6} y={pT + 4} fontSize={16} fontWeight={600} fill={COL.ink}>
          Π₂
        </text>

        {/* curseur δ (sous les droites) */}
        <line
          x1={X(d)}
          y1={H - pB}
          x2={X(d)}
          y2={pT - 4}
          stroke={COL.purple}
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />

        {/* les trois droites (affines : deux points suffisent) */}
        <line x1={X(0)} y1={Y(fG(0))} x2={X(1)} y2={Y(fG(1))} stroke={COL.green} strokeWidth={2.8} />
        <line x1={X(0)} y1={Y(fS(0))} x2={X(1)} y2={Y(fS(1))} stroke={COL.red} strokeWidth={2.8} />
        <line x1={X(0)} y1={Y(fP(0))} x2={X(1)} y2={Y(fP(1))} stroke={COL.amber} strokeWidth={2.8} />
        {/* s_2 et s'_2 se croisent en δ = 0,5 (Π₂ = 7) */}
        <circle cx={X(0.5)} cy={Y(7)} r={3.5} fill="#fff" stroke={COL.label} strokeWidth={1.4} />

        {/* points courants */}
        <circle cx={X(d)} cy={Y(gg)} r={5} fill={COL.green} stroke="#fff" strokeWidth={1.5} />
        <circle cx={X(d)} cy={Y(tt)} r={5} fill={COL.red} stroke="#fff" strokeWidth={1.5} />
        <circle cx={X(d)} cy={Y(ct)} r={5} fill={COL.amber} stroke="#fff" strokeWidth={1.5} />

        {/* étiquettes des droites (noms du slide 7) */}
        <text x={X(0.7)} y={Y(fG(0.7)) + 26} textAnchor="middle" fontSize={FS} fontWeight={600} fill={COL.green} {...halo}>
          <SvgStrat kind="G" rest=" (4+4δ)" size={FS} />
        </text>
        <text x={X(0.22)} y={Y(fS(0.22)) - 10} textAnchor="middle" fontSize={FS} fontWeight={600} fill={COL.red} {...halo}>
          <SvgStrat kind="plain" rest=" (6+2δ)" size={FS} />
        </text>
        <text x={X(0.83)} y={Y(fP(0.83)) - 11} textAnchor="end" fontSize={FS} fontWeight={600} fill={COL.amber} {...halo}>
          <SvgStrat kind="prime" rest=" (4+6δ)" size={FS} />
        </text>
      </svg>

      <Verdict tone="bad">
        Dévier rapporte <strong>{fr(best)}</strong> contre <strong>{fr(gg)}</strong> pour{" "}
        <M tex="s^G_2" /> : la meilleure déviation est {who}. Et c'est vrai pour tout{" "}
        <M tex="\delta \in [0, 1]" /> : <M tex="s^G_2" /> n'est jamais une meilleure réponse à{" "}
        <M tex="s^G_1" />, donc <M tex="(s^G_1, s^G_2)" /> n'est pas un ENPS (slide 8).
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
  const W = 520;
  const H = 300;
  const pL = 44;
  const pR = 14;
  const pT = 18;
  const pB = 40;
  const N = 15;

  const full = a / (1 - d);
  const yMax = Math.max(full * 1.12, a * 1.4);
  const Y = (v: number) => H - pB - (v / yMax) * (H - pB - pT);
  const slot = (W - pL - pR - 8) / N;
  const bw = slot - 6;
  // graduations « rondes » de l'axe vertical (pas de 1, 2 ou 5 × 10^k)
  const raw = yMax / 5;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const stepY = [1, 2, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? 10 * mag;
  const ticks: number[] = [];
  for (let i = 1; i * stepY <= yMax; i++) ticks.push(i * stepY);

  const bars: Array<{ x: number; v: number; cum: number }> = [];
  let cum = 0;
  for (let t = 0; t < N; t++) {
    const v = a * Math.pow(d, t);
    cum += v;
    bars.push({ x: pL + 8 + t * slot, v, cum });
  }
  const partial = cum;
  // part du total a/(1−δ) déjà atteinte par les 15 premières périodes = 1 − δ^15
  const share = 1 - Math.pow(d, N);
  const shareTxt = share >= 0.9995 ? "> 99,9 %" : `${fr(100 * share, 1)} %`;
  const FS = 14;
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };
  const last = bars[N - 1];

  return (
    <InteractiveCard
      title={
        <>
          Voir la somme infinie converger vers <M tex="a/(1-\delta)" />
        </>
      }
      subtitle={
        <>
          Chaque barre vaut <M tex="\delta^t \cdot a" /> : le payoff <M tex="a" /> de la période{" "}
          <M tex="t" />, escompté (vu depuis la période 0). La ligne dorée cumule les barres : elle
          s'approche de la somme <M tex="\sum_{t=0}^{\infty} \delta^t a = \tfrac{a}{1-\delta}" /> du
          slide 10.
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
          Monte <M tex="\delta" /> : les barres rétrécissent moins vite et la somme grimpe (à{" "}
          <M tex="\delta = 0{,}9" />, recevoir 4 à chaque période vaut{" "}
          <M tex="\tfrac{4}{1-0{,}9} = 40" />
          ). C'est ça, la patience : le futur pèse lourd. Pour <M tex="\delta \le 0{,}7" />, les
          15 premières périodes donnent déjà plus de 99 % du total. Quand <M tex="\delta" />{" "}
          approche 1, il en faut beaucoup plus : à <M tex="\delta = 0{,}9" />, elles n'en donnent
          que 79 %.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Barres des payoffs escomptés et somme cumulée convergeant vers a/(1−δ)"
        className="w-full rounded-xl border bg-card"
      >
        {/* graduations verticales */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pL} y1={Y(v)} x2={W - pR} y2={Y(v)} stroke={COL.grid} strokeWidth={1} />
            <text x={pL - 7} y={Y(v) + 4} textAnchor="end" fontSize={13} fill={COL.label}>
              {fr(v, Number.isInteger(v) ? 0 : 1)}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={pL} y1={H - pB} x2={W - pR} y2={H - pB} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pL} y1={H - pB} x2={pL} y2={pT - 6} stroke={COL.axis} strokeWidth={1.4} />
        {bars.map((b, t) => (
          <text
            key={t}
            x={b.x + bw / 2}
            y={H - pB + 16}
            textAnchor="middle"
            fontSize={12}
            fill={COL.label}
          >
            {t}
          </text>
        ))}
        <text x={W - pR} y={H - 4} textAnchor="end" fontSize={13} fill={COL.label}>
          période t
        </text>

        {/* barres δ^t·a */}
        {bars.map((b, t) => (
          <rect
            key={t}
            x={b.x}
            y={Y(b.v)}
            width={bw}
            height={H - pB - Y(b.v)}
            fill={COL.barFill}
            stroke={COL.barStroke}
            strokeWidth={1}
          />
        ))}

        {/* asymptote a/(1−δ) */}
        <line
          x1={pL}
          y1={Y(full)}
          x2={W - pR}
          y2={Y(full)}
          stroke={COL.purple}
          strokeWidth={1.6}
          strokeDasharray="6 4"
        />

        {/* somme cumulée */}
        <polyline
          points={bars.map((b) => `${b.x + bw / 2},${Y(b.cum)}`).join(" ")}
          fill="none"
          stroke={COL.amber}
          strokeWidth={2.6}
        />

        {/* étiquettes : asymptote à gauche (au-dessus), somme cumulée à droite (en dessous) */}
        <text x={pL + 6} y={Y(full) - 7} fontSize={FS} fontWeight={600} fill={COL.purple} {...halo}>
          a/(1−δ) = {fr(full)}
        </text>
        <text
          x={last.x + bw / 2}
          y={Y(last.cum) + 21}
          textAnchor="end"
          fontSize={FS}
          fontWeight={600}
          fill={COL.amber}
          {...halo}
        >
          somme cumulée
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap gap-2.5">
        <Readout label="Somme des 15 premières périodes :" value={fr(partial)} accent={COL.amber} />
        <Readout
          label={
            <>
              Formule <M tex="a/(1-\delta)" /> :
            </>
          }
          value={fr(full)}
          accent={COL.purple}
        />
        <Readout
          label="Part du total déjà atteinte :"
          value={shareTxt}
          note={
            <>
              <M tex="1 - \delta^{15}" /> : ce que les 15 premières périodes apportent
            </>
          }
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

  const W = 520;
  const H = 320;
  const pL = 46;
  const pR = 14;
  const pT = 14;
  const pB = 42;
  const dMax = 0.95;
  const yMax = 46;
  const X = (dd: number) => pL + (dd / dMax) * (W - pL - pR);
  const Y = (v: number) => H - pB - (v / yMax) * (H - pB - pT);
  // slide 14 : Π₂(s^G_1, s^G_2) = 4/(1−δ) et Π₂(s^G_1, s_2) = 6 + δ·2/(1−δ)
  const fC = (dd: number) => 4 / (1 - dd);
  const fD = (dd: number) => 6 + (2 * dd) / (1 - dd);

  // échantillonnage (sortie par le haut si v > yMax)
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
  const gap = (4 * d - 2) / (1 - d); // = c − v
  const atThreshold = Math.abs(d - 0.5) < 0.005;
  const FS = 13;
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };

  return (
    <InteractiveCard
      title="Coopérer ou trahir ? Le duel des deux payoffs"
      subtitle={
        <>
          Le cœur du chapitre (slide 14) : <M tex="\tfrac{4}{1-\delta}" /> (coopérer pour
          toujours) contre <M tex="6 + \delta\tfrac{2}{1-\delta}" /> (trahir maintenant, puis subir
          la punition de grim).
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
          valent 8). À gauche, la tentation immédiate (6) l'emporte. À droite, recevoir 4 pour toujours
          pèse plus lourd : à <M tex="\delta = 0{,}9" />, coopérer vaut 40 contre 24 pour trahir.
          La 3ᵉ tuile montre l'écart : il change de signe exactement en{" "}
          <M tex="\delta = \tfrac12" />. Au-delà, la coopération est <em>possible</em>, mais pas
          certaine (slide 15).
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
              Trahir maintenant <M tex="6 + \delta\tfrac{2}{1-\delta}" /> =
            </>
          }
          value={fr(v)}
          accent={COL.red}
        />
        <Readout
          label={
            <>
              Écart coopérer − trahir <M tex="= \tfrac{4\delta - 2}{1-\delta}" /> =
            </>
          }
          value={frSigned(gap)}
          accent={gap >= -0.005 ? COL.green : COL.red}
          note={
            <>
              son signe ne dépend que de <M tex="4\delta - 2" />{" "}
              <span className="whitespace-nowrap">
                (car <M tex="1 - \delta > 0" />)
              </span>
            </>
          }
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Payoff de coopération et de déviation en fonction de delta, croisement à 0,5"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        {/* zone δ ≥ 1/2 : la coopération y est possible (pas certaine) */}
        <rect
          x={X(0.5)}
          y={pT}
          width={X(dMax) - X(0.5)}
          height={H - pB - pT}
          fill={COL.greenSoft}
          opacity={0.55}
        />

        {/* grille + axes */}
        {[10, 20, 30, 40].map((g) => (
          <g key={g}>
            <line x1={pL} y1={Y(g)} x2={W - pR} y2={Y(g)} stroke={COL.grid} strokeWidth={1} />
            <text x={pL - 7} y={Y(g) + 4} textAnchor="end" fontSize={12.5} fill={COL.label}>
              {g}
            </text>
          </g>
        ))}
        <line x1={pL} y1={H - pB} x2={W - pR} y2={H - pB} stroke={COL.axis} strokeWidth={1.4} />
        <line x1={pL} y1={H - pB} x2={pL} y2={pT} stroke={COL.axis} strokeWidth={1.4} />
        {[0, 0.25, 0.5, 0.75].map((dd) => (
          <text key={dd} x={X(dd)} y={H - pB + 18} textAnchor="middle" fontSize={12.5} fill={COL.label}>
            {fr(dd, dd === 0 ? 0 : dd === 0.5 ? 1 : 2)}
          </text>
        ))}
        <text x={W - pR} y={H - 4} textAnchor="end" fontSize={15} fontWeight={600} fill={COL.purple}>
          δ
        </text>
        <text x={pL + 6} y={pT + 14} fontSize={15} fontWeight={600} fill={COL.ink}>
          Π₂
        </text>

        {/* seuil δ = 1/2 */}
        <line
          x1={X(0.5)}
          y1={H - pB}
          x2={X(0.5)}
          y2={pT}
          stroke={COL.purple}
          strokeWidth={1.6}
          strokeDasharray="6 4"
        />
        {/* curseur */}
        <line x1={X(d)} y1={H - pB} x2={X(d)} y2={pT} stroke={COL.ink} strokeWidth={1.2} />

        {/* courbes */}
        <polyline points={sample(fC)} fill="none" stroke={COL.green} strokeWidth={2.8} />
        <polyline points={sample(fD)} fill="none" stroke={COL.red} strokeWidth={2.8} />
        <circle cx={X(0.5)} cy={Y(8)} r={5} fill={COL.purple} stroke="#fff" strokeWidth={1.5} />
        {c <= yMax ? <circle cx={X(d)} cy={Y(c)} r={5} fill={COL.green} stroke="#fff" strokeWidth={1.5} /> : null}
        {v <= yMax ? <circle cx={X(d)} cy={Y(v)} r={5} fill={COL.red} stroke="#fff" strokeWidth={1.5} /> : null}

        {/* étiquettes (posées hors des courbes, avec halo) */}
        <text x={X(0.725)} y={pT + 18} textAnchor="middle" fontSize={FS} fontWeight={600} fill={COL.green} {...halo}>
          coopération possible
        </text>
        <text x={X(0.725)} y={pT + 34} textAnchor="middle" fontSize={FS} fontWeight={600} fill={COL.green} {...halo}>
          (δ ≥ 1/2)
        </text>
        <text x={X(0.78) - 8} y={Y(fC(0.78))} textAnchor="end" fontSize={FS} fontWeight={600} fill={COL.green} {...halo}>
          coopérer 4/(1−δ)
        </text>
        <text x={X(0.62)} y={Y(fD(0.62)) + 24} textAnchor="start" fontSize={FS} fontWeight={600} fill={COL.red} {...halo}>
          trahir 6+δ·2/(1−δ)
        </text>
        <text x={X(0.5) - 8} y={Y(8) - 12} textAnchor="end" fontSize={FS} fontWeight={600} fill={COL.purple} {...halo}>
          croisement : δ = 0,5 ; Π₂ = 8
        </text>
      </svg>

      {atThreshold ? (
        <Verdict tone="mid">
          <M tex="\delta = 0{,}50" /> : indifférence parfaite (8 = 8). C'est le seuil exact : la
          condition <M tex="\delta \ge \tfrac12" /> du slide 14 est tout juste remplie,{" "}
          <M tex="s^G_2" /> reste (à égalité) une meilleure réponse à <M tex="s^G_1" />.
        </Verdict>
      ) : c >= v ? (
        <Verdict tone="good">
          <M tex="\delta \ge \tfrac12" /> : coopérer ({fr(c)}) bat trahir ({fr(v)}).{" "}
          <M tex="(s^G_1, s^G_2)" /> est un ENPS : la coopération est possible (le cartel peut
          tenir), mais <M tex="(s^{TT}_1, s^{TT}_2)" /> (toujours trahir) reste aussi un ENPS
          (slide 12).
        </Verdict>
      ) : (
        <Verdict tone="bad">
          <M tex="\delta < \tfrac12" /> : trahir ({fr(v)}) bat coopérer ({fr(c)}). Joueurs trop
          impatients : la menace ne suffit pas, <M tex="s^G_2" /> n'est pas une meilleure réponse
          à <M tex="s^G_1" />.
        </Verdict>
      )}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. HORS SLIDES : seuil général δ* = (π_tent − π_coop)/(π_tent − π_pun) */
/* ------------------------------------------------------------------ */

export function GeneralThreshold() {
  // variables internes : t = π_tent (tentation), c = π_coop (coopération), p = π_pun (punition)
  const [t, setT] = useState(6);
  const [c, setC] = useState(4);
  const [p, setP] = useState(2);

  // on préserve l'invariant π_tent > π_coop > π_pun
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

  // jauge : où se trouve δ* entre 0 et 1 ?
  const W = 520;
  const H = 86;
  const x0 = 24;
  const x1 = 496;
  const GX = (vv: number) => x0 + vv * (x1 - x0);
  const DSTAR = "\\delta^* = \\tfrac{\\pi_{\\text{tent}} - \\pi_{\\text{coop}}}{\\pi_{\\text{tent}} - \\pi_{\\text{pun}}}";

  return (
    <InteractiveCard
      title={
        <>
          Hors slides : fabrique ton propre dilemme et observe le seuil <M tex="\delta^*" />
        </>
      }
      subtitle={
        <>
          Prolongement du slide 14, <strong>hors slides</strong>. Payoffs par période :
          coopération mutuelle <M tex="\pi_{\text{coop}}" />, tentation{" "}
          <M tex="\pi_{\text{tent}}" /> (tu trahis un joueur qui coopère), punition{" "}
          <M tex="\pi_{\text{pun}}" /> (trahison mutuelle), avec{" "}
          <M tex="\pi_{\text{tent}} > \pi_{\text{coop}} > \pi_{\text{pun}}" />. Même calcul qu'au
          slide 14, avec des lettres :{" "}
          <M tex="\tfrac{\pi_{\text{coop}}}{1-\delta} \ge \pi_{\text{tent}} + \delta\tfrac{\pi_{\text{pun}}}{1-\delta} \iff \delta \ge \delta^*" />
          . À l'examen, refais le calcul du slide 14 avec les payoffs de l'énoncé.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Tentation <M tex="\pi_{\text{tent}}" />
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
                Coopération <M tex="\pi_{\text{coop}}" />
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
                Punition <M tex="\pi_{\text{pun}}" />
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
          Augmente <M tex="\pi_{\text{tent}}" /> : le seuil monte (il faut des joueurs plus
          patients). Durcis la punition (baisse <M tex="\pi_{\text{pun}}" />) : le seuil descend
          (la coopération devient possible pour des joueurs plus impatients). Le payoff de celui
          qui coopère face à un traître (0 dans le fritkot) n'intervient pas : le joueur qui dévie
          ne le subit jamais. On retrouve la conclusion du slide 15 : le coût de la punition
          dépend <strong>des payoffs du jeu simultané</strong> et{" "}
          <strong>du facteur d'escompte du joueur puni</strong>.
        </>
      }
    >
      <div className="flex flex-wrap gap-2.5">
        <Readout
          label={
            <>
              Seuil de coopération <M tex={DSTAR} /> =
            </>
          }
          value={fr(ds, 3)}
          accent={COL.purple}
          note={
            <>
              ici <M tex={`\\delta^* = \\tfrac{${t} - ${c}}{${t} - ${p}} = \\tfrac{${t - c}}{${t - p}}`} />{" "}
              (formule hors slides)
            </>
          }
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Position du seuil delta étoile entre 0 et 1"
        className="mt-3 w-full rounded-xl border bg-card"
      >
        <rect x={x0} y={38} width={GX(ds) - x0} height={14} rx={3} fill="#ffe4e6" />
        <rect x={GX(ds)} y={38} width={x1 - GX(ds)} height={14} rx={3} fill={COL.greenSoft} />
        <line x1={x0} y1={52} x2={x1} y2={52} stroke={COL.axis} strokeWidth={1.4} />
        {[0, 0.25, 0.5, 0.75, 1].map((vv) => (
          <g key={vv}>
            <line x1={GX(vv)} y1={52} x2={GX(vv)} y2={58} stroke={COL.axis} strokeWidth={1.2} />
            <text x={GX(vv)} y={77} textAnchor="middle" fontSize={14} fill={COL.label}>
              {fr(vv, vv === 0 || vv === 1 ? 0 : vv === 0.5 ? 1 : 2)}
            </text>
          </g>
        ))}
        <line x1={GX(ds)} y1={29} x2={GX(ds)} y2={56} stroke={COL.purple} strokeWidth={2.4} />
        <text
          x={GX(ds)}
          y={22}
          textAnchor="middle"
          fontSize={16}
          fontWeight={700}
          fill={COL.purple}
        >
          δ* = {fr(ds, 3)}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm" style={{ background: "#ffe4e6" }} />
          <M tex="\delta < \delta^*" /> : la menace ne suffit pas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm" style={{ background: COL.greenSoft }} />
          <M tex="\delta \ge \delta^*" /> : coopération possible
        </span>
      </div>

      {tone === "good" ? (
        <Verdict tone="good">
          Seuil bas : la coopération est possible même entre des joueurs assez impatients.
        </Verdict>
      ) : tone === "mid" ? (
        <Verdict tone="mid">
          Seuil intermédiaire : pour que la coopération soit possible, il faut des joueurs
          raisonnablement patients (comme le 1/2 du slide 14, obtenu avec{" "}
          <M tex="\pi_{\text{tent}} = 6" />, <M tex="\pi_{\text{coop}} = 4" />,{" "}
          <M tex="\pi_{\text{pun}} = 2" />
          ).
        </Verdict>
      ) : (
        <Verdict tone="bad">
          Seuil élevé : la tentation est énorme et/ou la punition trop douce. Seuls des joueurs
          très patients pourraient coopérer.
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

/**
 * Meilleur score total possible en 10 jours contre la machine `op` : recherche
 * exhaustive des 2^10 suites de coups (mêmes règles que machineMove / pay).
 * Résultat : 42 contre Tit-for-Tat et grim, 20 contre « toujours trahir »,
 * 60 contre « toujours coopérer ».
 */
function bestScore(op: OppKey): number {
  let best = -Infinity;
  for (let mask = 0; mask < 1 << ROUNDS; mask++) {
    const hist: Array<{ me: Move; him: Move }> = [];
    for (let i = 0; i < ROUNDS; i++) {
      const mine: Move = (mask >> i) & 1 ? "T" : "C";
      hist.push({ me: mine, him: machineMove(op, hist) });
    }
    best = Math.max(best, hist.reduce((acc, h) => acc + pay(h.me, h.him), 0));
  }
  return best;
}

const BEST: Record<OppKey, number> = {
  tft: bestScore("tft"),
  grim: bestScore("grim"),
  tt: bestScore("tt"),
  tc: bestScore("tc"),
};

/** comment atteindre ce maximum (affiché seulement pour l'adversaire en cours) */
const BEST_HOW: Record<OppKey, string> = {
  tft: "coopérer 9 jours, puis trahir le 10ᵉ, quand plus aucune punition n'est possible",
  grim: "coopérer 9 jours, puis trahir le 10ᵉ, quand plus aucune punition n'est possible",
  tt: "trahir chaque jour",
  tc: "trahir chaque jour",
};

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
          Défi : identifie la stratégie de chaque adversaire mystère (parmi : Tit-for-Tat, grim,
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
          <table className="w-full min-w-[300px] border-collapse text-center font-mono text-[13px]">
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
        <Verdict tone={me >= 0.9 * BEST[op] ? "good" : me >= 0.6 * BEST[op] ? "mid" : "bad"}>
          Fin du festival ! Ton adversaire jouait : <strong>{OPP_NAMES[op]}</strong>. Ton score :{" "}
          <strong>{me}</strong>
          {me === BEST[op] ? ", c'est le maximum, bravo !" : "."} Meilleur score possible contre
          cet adversaire : <strong>{BEST[op]}</strong> ({BEST_HOW[op]}).
          {op === "tft" || op === "grim" ? (
            <>
              {" "}
              C'est la trahison au dernier round souvent observée au labo (slide 17). Entre deux
              joueurs rationnels qui connaissent la fin, la théorie va plus loin : l'unique ENPS
              est de trahir chaque jour (slides 8 et 9).
            </>
          ) : null}{" "}
          Repères : coopération mutuelle parfaite = 40 points (4 × 10) ; trahison mutuelle
          chaque jour = 20 (2 × 10).
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
