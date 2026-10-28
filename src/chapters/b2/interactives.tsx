/*
 * Chapitre B2 — Théorie des contrats : composants interactifs.
 *
 * Recréation fidèle des widgets du manuel interactif source :
 *  - PollIntuition      : question d'intuition « combien de clients visites-tu ? »
 *  - GameTreeTimeline   : l'arbre du jeu + lecteur de backward induction (③ → ② → ①)
 *                         pour les 3 cas, avec le plan des contrats (β, α)
 *  - EffortExplorer     : la courbe d'utilité de l'agent pilotée par α et β (+ ligne ũ = 0)
 *  - SurplusExplorer    : le « gâteau » S(e) = e − e²/2 et son maximum
 *  - ContractLab        : le laboratoire à contrats (l'étudiant joue le principal)
 *  - PayoffComparison   : le plan des payoffs (Uₐ, Uₚ) des 3 cas et la frontière de Pareto
 *  - RiskAversionFigure : utilité concave, équivalent certain et PRM (comme S4 slide 23)
 *  - MasteryChecklist   : la checklist de maîtrise du bilan
 *  - QuizDiagnostic     : le diagnostic automatique des quiz du chapitre
 */

import { useId, useState, type ReactNode } from "react";
import { BarChart3, CheckCircle2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { scopedKey, useProgress } from "@/lib/progress";
import { useCourseOptional } from "@/components/course/CourseContext";
import { M } from "@/components/course/Math";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  ChoiceChips,
  InteractiveCard,
  SliderControl,
} from "@/components/course/Interactive";
import {
  Dot,
  Frame as PlotFrame,
  PlotSvg,
  curvePath as plotCurve,
  makePlot,
  polyPath,
} from "@/chapters/shared/plot";

/* ------------------------------------------------------------------ */
/* Helpers communs                                                     */
/* ------------------------------------------------------------------ */

/**
 * Format « à la française » : 2 à 3 décimales, pour que 0,125 et 0,375 (Cas 2)
 * s'affichent exactement (et non 0,13 / 0,38). Pré-arrondi à 3 décimales.
 */
function fmt(v: number): string {
  const r = Math.round(v * 1000) / 1000 || 0; // « || 0 » : évite l'affichage « -0,00 »
  return r
    .toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    })
    .replace(/^-/, "−"); // vrai signe moins, comme dans le texte
}

/** petites cartes de lecture des valeurs calculées (le .readout source) */
export function Readouts({
  items,
}: {
  items: Array<{ value: string; label: ReactNode; tone?: "principal" | "agent" | "neutral" }>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {items.map((it, i) => (
        <div
          key={i}
          className="min-w-[7.5rem] flex-1 rounded-xl border bg-muted/40 px-3 py-2 text-center"
        >
          <div
            className={cn(
              "text-lg font-extrabold tabular-nums",
              it.tone === "principal" && "text-rose-700",
              it.tone === "agent" && "text-sky-700",
            )}
          >
            {it.value}
          </div>
          <div className="text-[12px] leading-snug text-muted-foreground">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

/** message d'état sous un widget (les .w-msg de la source) */
function WidgetMsg({
  tone,
  children,
}: {
  tone: "info" | "good" | "warn";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
        tone === "info" && "border-border bg-muted/50 text-foreground/85",
        tone === "good" && "border-emerald-300 bg-emerald-50 text-emerald-900",
        tone === "warn" && "border-rose-300 bg-rose-50 text-rose-900",
      )}
    >
      {children}
    </div>
  );
}

/* Cadre de graphe SVG : axes + graduations, mêmes conventions que la source */
interface Frame {
  X: (v: number) => number;
  Y: (v: number) => number;
}

function makeFrame(
  W: number,
  H: number,
  m: { l: number; r: number; t: number; b: number },
  x: [number, number],
  y: [number, number],
): Frame {
  return {
    X: (v) => m.l + ((v - x[0]) / (x[1] - x[0])) * (W - m.l - m.r),
    Y: (v) => H - m.b - ((v - y[0]) / (y[1] - y[0])) * (H - m.t - m.b),
  };
}

function curvePath(fr: Frame, f: (x: number) => number, a: number, b: number): string {
  const n = 120;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    d += (i ? "L" : "M") + fr.X(x).toFixed(1) + " " + fr.Y(f(x)).toFixed(1) + " ";
  }
  return d;
}

const AXIS = "#78716c";
const TXT = "#57534e";

function Axes({
  fr,
  W,
  H,
  m,
  xticks,
  yticks,
  xlab,
  ylab,
  xAtBottom = false,
}: {
  fr: Frame;
  W: number;
  H: number;
  m: { l: number; r: number; t: number; b: number };
  xticks: number[];
  yticks: number[];
  xlab?: string;
  ylab?: string;
  /** graduations de l'axe horizontal en bas du cadre (et non le long de y = 0) */
  xAtBottom?: boolean;
}) {
  const yAxisX = fr.X(Math.max(0, 0));
  const xLabY = xAtBottom ? H - m.b : fr.Y(0);
  return (
    <g>
      <line x1={m.l} y1={fr.Y(0)} x2={W - m.r} y2={fr.Y(0)} stroke={AXIS} strokeWidth={1.4} />
      {xAtBottom ? (
        <line x1={m.l} y1={xLabY} x2={W - m.r} y2={xLabY} stroke={AXIS} strokeWidth={1} opacity={0.5} />
      ) : null}
      <line x1={yAxisX} y1={H - m.b} x2={yAxisX} y2={m.t} stroke={AXIS} strokeWidth={1.4} />
      {xticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={fr.X(t)} y1={xLabY - 4} x2={fr.X(t)} y2={xLabY + 4} stroke={AXIS} />
          <text
            x={fr.X(t)}
            y={xLabY + 20}
            textAnchor="middle"
            fontSize={12}
            fill={AXIS}
          >
            {String(t).replace(".", ",")}
          </text>
        </g>
      ))}
      {yticks.map((t) => (
        <g key={`y${t}`}>
          <line x1={yAxisX - 4} y1={fr.Y(t)} x2={yAxisX + 4} y2={fr.Y(t)} stroke={AXIS} />
          <text x={yAxisX - 9} y={fr.Y(t) + 4} textAnchor="end" fontSize={12} fill={AXIS}>
            {String(t).replace(".", ",")}
          </text>
        </g>
      ))}
      {xlab ? (
        <text
          x={W - m.r}
          y={xLabY + 38}
          textAnchor="end"
          fontSize={14.5}
          fontStyle="italic"
          fill={TXT}
        >
          {xlab}
        </text>
      ) : null}
      {ylab ? (
        <text x={yAxisX - 6} y={m.t - 8} textAnchor="start" fontSize={14.5} fontStyle="italic" fill={TXT}>
          {ylab}
        </text>
      ) : null}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Sondage d'intuition (§1)                                         */
/* ------------------------------------------------------------------ */

const POLL_OPTS = [
  { label: "Le maximum, par conscience professionnelle", short: "Le maximum" },
  { label: "Quelques-uns, pour donner le change", short: "Quelques-uns" },
  { label: "Le strict minimum, voire zéro", short: "Le minimum" },
];

export function PollIntuition() {
  const [voted, setVoted] = useState<number | null>(null);
  return (
    <div className="my-6 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-4 sm:p-5">
      <div className="text-[15px] font-bold text-violet-900">
        🗳️ Avant de continuer — teste ton intuition. Imagine que TU es ce commercial, payé
        2 500 €/mois quoi qu'il arrive (montant illustratif), sans aucun contrôle de tes visites.
        Combien de clients visites-tu ?
      </div>
      {voted === null ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {POLL_OPTS.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setVoted(i)}
              className="rounded-xl border bg-card px-3 py-2.5 text-[14px] leading-snug transition-colors hover:border-violet-400 hover:bg-violet-50"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 animate-in fade-in">
          <p className="text-[14px]">
            Ta réponse : <strong className="text-violet-800">{POLL_OPTS[voted].short}</strong>.
          </p>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
            La théorie prédit « zéro » pour un agent purement intéressé — on le démontrera au
            Cas 1 : payé pareil quoi qu'il fasse, il n'a aucune raison de subir le coût d'un
            effort. La vraie vie est plus nuancée (souviens-toi de l'économie comportementale
            d'A1 : les décisions sont aussi guidées par des considérations non matérielles, et
            instaurer un incitant matériel peut même évincer les incitants intrinsèques — les
            crèches de Haïfa, S2 slide 21), mais le modèle capte une force bien réelle.
          </p>
          <p className="mt-2">
            <TheoryRef chapter="a1" section="nudge" />
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. L'arbre du jeu en 3 étapes (§2)                                  */
/* ------------------------------------------------------------------ */

type TreeCase = "1" | "2" | "3";
/** "0" = le déroulement chronologique ; "3", "2", "1" = étapes de la backward induction */
type TreeStep = "0" | "3" | "2" | "1";

/* Optimum (α*, β*) et profit Uₚ* = k de chaque cas (slides 11, 13, 18-20). */
const TREE_CASES: Record<
  TreeCase,
  {
    w: string;
    a: number;
    b: number;
    k: number;
    kTxt: string;
    optTxt: string;
    set: string;
    pills: [string, string, string];
  }
> = {
  "1": {
    w: "w = α",
    a: 0,
    b: 0,
    k: 0,
    kTxt: "0",
    optTxt: "(0 ; 0)",
    set: "l'axe vertical β = 0",
    pills: ["effort : e*(α) = 0", "signe si α ≥ 0", "contrat : α* = 0"],
  },
  "2": {
    w: "w = βz",
    a: 0,
    b: 0.5,
    k: 0.25,
    kTxt: "0,25",
    optTxt: "(0,5 ; 0)",
    set: "la droite α = 0",
    pills: ["effort : e*(β) = β", "signe toujours", "contrat : β* = 1/2"],
  },
  "3": {
    w: "w = α + βz",
    a: -0.5,
    b: 1,
    k: 0.5,
    kTxt: "0,5",
    optTxt: "(1 ; −0,5)",
    set: "tout le plan",
    pills: ["effort : e*(α, β) = β (CI)", "signe si α + β²/2 ≥ 0 (CP)", "contrat : α* = −0,5 ; β* = 1"],
  },
};

function treeMessage(step: TreeStep, cas: TreeCase): ReactNode {
  if (step === "0") {
    return (
      <>
        <strong>Le déroulement du jeu (slide 8).</strong> ① Le principal propose un contrat{" "}
        <M tex="w(z)" />. ② L'agent accepte ou refuse ; s'il refuse, il obtient son utilité par
        défaut <M tex="\tilde{u} = 0" /> (slide 9). ③ S'il accepte, il choisit son effort{" "}
        <M tex="e" /> (que le principal ne voit pas), puis le bruit <M tex="x" /> est tiré au sort
        et <M tex="z = e + x" /> est réalisé. Le dessin du slide 8 ne montre que deux coups,{" "}
        <M tex="w(z)" /> puis <M tex="e(w)" /> : le nœud ② (accepter ou refuser) et le tirage
        au sort de <M tex="x" /> sont ajoutés ici pour suivre tout le timing. Pour trouver l'ENPS (slide 9), on résout en partant de la fin : clique ③, puis ②,
        puis ①.
      </>
    );
  }
  if (step === "3") {
    return (
      <>
        <strong>③ On commence par la fin</strong> (H1 : l'agent est rationnel). Le contrat est
        signé : l'agent choisit l'effort qui maximise son utilité espérée <M tex="E(w - c)" />.{" "}
        {cas === "1" ? (
          <>
            Ici <M tex="E(w - c) = \alpha - e^2/2" /> ; CPO : <M tex="-e = 0" />, donc{" "}
            <M tex="e^*(\alpha) = 0" /> (slide 10). Payé pareil quoi qu'il fasse, il ne fait aucun
            effort.
          </>
        ) : cas === "2" ? (
          <>
            Ici <M tex="E(w - c) = \beta e - e^2/2" /> (car <M tex="E(x) = 0" />) ; CPO :{" "}
            <M tex="\beta - e = 0" />, donc <M tex="e^*(\beta) = \beta" /> (slide 12).
          </>
        ) : (
          <>
            Ici <M tex="E(w - c) = \alpha + \beta e - e^2/2" /> ; CPO : <M tex="\beta - e = 0" />,
            donc <M tex="e^*(\alpha, \beta) = \beta" /> (slide 15) : c'est la contrainte de
            compatibilité aux incitants (CI) du slide 16.
          </>
        )}{" "}
        Un effort pour <strong>chaque</strong> contrat : c'est sa stratégie (une règle), pas un
        seul nombre.
      </>
    );
  }
  if (step === "2") {
    return (
      <>
        <strong>② On remonte d'un cran.</strong> L'agent sait qu'il choisira ensuite{" "}
        <M tex="e^*" /> : il signe si <M tex="E(w - c)" />, calculée avec <M tex="e^*" />, vaut au
        moins <M tex="\tilde{u} = 0" />.{" "}
        {cas === "1" ? (
          <>
            Avec <M tex="e^* = 0" /> : <M tex="E(w - c) = \alpha" />, donc il signe si{" "}
            <M tex="\alpha \ge 0" />.
          </>
        ) : cas === "2" ? (
          <>
            Avec <M tex="e^* = \beta" /> : <M tex="E(w - c) = \beta^2 - \beta^2/2 = \beta^2/2" />,
            toujours <M tex="\ge 0" /> : il signe toujours.
          </>
        ) : (
          <>
            Avec <M tex="e^* = \beta" /> : <M tex="E(w - c) = \alpha + \beta^2/2" />, donc il signe
            si <M tex="\alpha + \beta^2/2 \ge 0" /> : c'est la contrainte de participation (CP) du
            slide 16. Sous la parabole <M tex="\alpha = -\beta^2/2" />, il refuse (zone grise).
          </>
        )}{" "}
        Dans les slides, cette décision n'est pas une étape de calcul à part : elle apparaît
        comme la CP du problème du principal (slides 11 et 16).
      </>
    );
  }
  return (
    <>
      <strong>① On arrive au début</strong> (H2.1 : le principal pense que l'agent est rationnel
      et anticipe ses réactions ③ et ②). Il choisit le contrat qui maximise son profit espéré{" "}
      <M tex="E(z - w)" />.{" "}
      {cas === "1" ? (
        <>
          <M tex="E(z - w) = e^*(\alpha) + E(x) - \alpha = -\alpha" /> : il voudrait α le plus bas
          possible, mais un salaire négatif ferait refuser l'agent, donc <M tex="\alpha^* = 0" />{" "}
          (slide 11). ENPS : <M tex="(s_p^*, s_a^*)" /> = (<M tex="\alpha^* = 0" />,{" "}
          <M tex="e^*(\alpha) = 0" />) ; payoffs <M tex="(U_p\,;\,U_a) = (0\,;\,0)" />.
        </>
      ) : cas === "2" ? (
        <>
          <M tex="E(z - w) = e^*(\beta) - \beta e^*(\beta) = \beta - \beta^2" /> ; CPO :{" "}
          <M tex="1 - 2\beta = 0" />, donc <M tex="\beta^* = 1/2" /> (slide 13). ENPS :{" "}
          <M tex="(s_p^*, s_a^*)" /> = (<M tex="\beta^* = 1/2" />, <M tex="e^*(\beta) = \beta" />) ;
          payoffs <M tex="(U_p\,;\,U_a) = (0{,}25\,;\,0{,}125)" /> (slide 14). La CP n'est pas
          saturée : l'agent garde 0,125.
        </>
      ) : (
        <>
          CP saturée : <M tex="\alpha = e^2/2 - \beta e" /> ; avec la CI <M tex="e = \beta" /> :{" "}
          <M tex="E(z - w) = e - e^2/2 = \beta - \beta^2/2" /> ; CPO : <M tex="1 - \beta = 0" />,
          donc <M tex="\beta^* = 1" /> et <M tex="\alpha^* = \beta^2/2 - \beta^2 = -0{,}5" />{" "}
          (slides 17-18). ENPS : <M tex="(s_p^*, s_a^*)" /> = (<M tex="w^*(z) = -0{,}5 + z" />,{" "}
          <M tex="e^*(w) = \beta" />) ; payoffs <M tex="(U_p\,;\,U_a) = (0{,}5\,;\,0)" /> (slide
          19).
        </>
      )}
    </>
  );
}

const CIRCLED: Record<"1" | "2" | "3", string> = { "1": "①", "2": "②", "3": "③" };

export function GameTreeTimeline() {
  const [cas, setCas] = useState<TreeCase>("1");
  const [step, setStep] = useState<TreeStep>("0");
  const uid = useId();
  const arrow = `arr-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const K = TREE_CASES[cas];

  /* état de chaque groupe de l'arbre : ③ est résolu en premier, ① en dernier */
  const state = (g: 1 | 2 | 3): "plain" | "active" | "solved" | "pending" => {
    if (step === "0") return "plain";
    const s = Number(step);
    return g === s ? "active" : g > s ? "solved" : "pending";
  };
  const op = (g: 1 | 2 | 3) => (state(g) === "pending" ? 0.22 : 1);
  const ring = (g: 1 | 2 | 3, x: number, y: number, r: number) =>
    state(g) === "active" ? (
      <circle cx={x} cy={y} r={r + 7} fill="none" stroke="#f59e0b" strokeWidth={3.5} />
    ) : state(g) === "solved" ? (
      <text x={x + r + 6} y={y - r + 2} fontSize={16} fontWeight={700} fill="#047857">
        ✓
      </text>
    ) : null;

  /* plan (β, α) des contrats */
  const p = makePlot({ w: 520, h: 300, pL: 56, pR: 18, pT: 28, pB: 44, x: [0, 1.3], y: [-1, 0.5] });
  const showCP = step === "2" || step === "1";
  const showOpt = step === "1";
  const frontier = (b: number) => -(b * b) / 2; // CP saturée avec e = β
  const refused: Array<[number, number]> = [];
  for (let i = 0; i <= 52; i++) refused.push([(1.3 * i) / 52, frontier((1.3 * i) / 52)]);
  refused.push([1.3, -1], [0, -1]);
  const GOLD = "#d97706";
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };

  return (
    <InteractiveCard
      title="L'arbre du jeu et sa résolution par backward induction"
      subtitle="Le principal joue en premier : en concevant le contrat, il peut influencer le comportement de l'agent (slide 8). Choisis un cas, puis résous le jeu en partant de la fin : ③, puis ②, puis ①."
      controls={
        <>
          <ChoiceChips<TreeCase>
            className="col-span-full"
            label="Ensemble de contrats (slide 9)"
            options={[
              { value: "1", label: "Cas 1 · w = α" },
              { value: "2", label: "Cas 2 · w = βz" },
              { value: "3", label: "Cas 3 · w = α + βz" },
            ]}
            value={cas}
            onChange={setCas}
          />
          <ChoiceChips<TreeStep>
            className="col-span-full"
            label="Étape (dans l'ordre de résolution)"
            options={[
              { value: "0", label: "Le déroulement" },
              { value: "3", label: "③ L'agent choisit son effort" },
              { value: "2", label: "② L'agent signe ou refuse" },
              { value: "1", label: "① Le principal choisit le contrat" },
            ]}
            value={step}
            onChange={setStep}
          />
        </>
      }
      footer={
        <>
          le principal joue en <strong>premier</strong>, mais on résout le jeu en{" "}
          <strong>commençant par la fin</strong> (backward induction) : d'abord l'effort de
          l'agent (étape ③), puis son choix d'accepter ou de refuser (étape ②, la CP), puis le
          contrat du principal (étape ①).
        </>
      }
    >
      <svg
        viewBox="0 0 520 284"
        role="img"
        aria-label="Arbre du jeu séquentiel principal-agent, résolu par backward induction"
        className="mx-auto block h-auto w-full"
        style={{ maxWidth: 640 }}
      >
        <defs>
          <marker
            id={arrow}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#78716c" />
          </marker>
        </defs>

        {/* ① le principal propose */}
        <g style={{ opacity: op(1), transition: "opacity .3s" }}>
          {ring(1, 190, 40, 13)}
          <circle cx={190} cy={40} r={13} fill="#be123c" />
          <text x={168} y={45} textAnchor="end" fontSize={14} fontWeight={700} fill="#9f1239">
            Principal
          </text>
          <path d="M182 50 L148 84" stroke="#be123c" strokeWidth={1} opacity={0.45} />
          <path d="M198 50 L232 84" stroke="#be123c" strokeWidth={1} opacity={0.45} />
          <path d="M190 53 L190 101" stroke="#be123c" strokeWidth={2.4} markerEnd={`url(#${arrow})`} />
          <text x={214} y={74} fontStyle="italic" fontSize={14.5} fill="#9f1239" {...halo}>
            propose {step === "0" ? "w(z)" : K.w}
          </text>
        </g>

        {/* ② l'agent accepte ou refuse */}
        <g style={{ opacity: op(2), transition: "opacity .3s" }}>
          {ring(2, 190, 118, 13)}
          <circle cx={190} cy={118} r={13} fill="#0369a1" />
          <text x={170} y={112} textAnchor="end" fontSize={14} fontWeight={700} fill="#075985">
            Agent
          </text>
          <path d="M180 127 L102 174" stroke="#0369a1" strokeWidth={2.2} markerEnd={`url(#${arrow})`} />
          <path d="M202 124 L326 165" stroke="#0369a1" strokeWidth={2.2} markerEnd={`url(#${arrow})`} />
          <text x={130} y={146} textAnchor="end" fontSize={13} fill="#075985">
            refuse
          </text>
          <text x={268} y={134} fontSize={13} fill="#075985">
            accepte
          </text>
          <rect x={14} y={180} width={176} height={48} rx={10} fill="#e0f2fe" stroke="#bae6fd" />
          <text x={102} y={199} textAnchor="middle" fontSize={12.5} fill="#075985">
            fin du jeu : l'agent obtient
          </text>
          <text x={102} y={218} textAnchor="middle" fontStyle="italic" fontSize={13} fill="#075985">
            son utilité par défaut ũ = 0
          </text>
        </g>

        {/* ③ effort, puis le hasard tire x */}
        <g style={{ opacity: op(3), transition: "opacity .3s" }}>
          {ring(3, 340, 172, 12)}
          <circle cx={340} cy={172} r={12} fill="#0369a1" />
          <path d="M332 182 L302 212" stroke="#0369a1" strokeWidth={1} opacity={0.45} />
          <path d="M348 182 L378 212" stroke="#0369a1" strokeWidth={1} opacity={0.45} />
          <path d="M340 184 L340 216" stroke="#0369a1" strokeWidth={2.2} markerEnd={`url(#${arrow})`} />
          <text x={362} y={177} fontStyle="italic" fontSize={14} fill="#075985">
            choisit son effort e
          </text>
          <circle cx={340} cy={230} r={10} fill="#7c3aed" />
          <text x={322} y={235} textAnchor="end" fontSize={13} fontWeight={700} fill="#7c3aed">
            Hasard
          </text>
          <text x={358} y={235} fontStyle="italic" fontSize={13.5} fill="#7c3aed">
            tire x au sort
          </text>
          <path d="M340 241 L340 256" stroke="#7c3aed" strokeWidth={2} markerEnd={`url(#${arrow})`} />
          <text x={340} y={276} textAnchor="middle" fontStyle="italic" fontSize={14} fill="#1c1917">
            ⇒ z = e + x, puis paiements
          </text>
        </g>
      </svg>

      {step !== "0" ? (
        <div className="mt-1 flex flex-wrap gap-1.5 text-[12.5px]" aria-live="polite">
          {(["3", "2", "1"] as const).map((g, idx) => {
            const st = state(Number(g) as 1 | 2 | 3);
            return (
              <span
                key={g}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-semibold",
                  st === "solved" && "border-emerald-300 bg-emerald-50 text-emerald-800",
                  st === "active" && "border-amber-400 bg-amber-50 text-amber-900",
                  st === "pending" && "text-muted-foreground",
                )}
              >
                {CIRCLED[g]} {st === "pending" ? "?" : K.pills[idx]}
              </span>
            );
          })}
        </div>
      ) : null}

      <WidgetMsg tone="info">{treeMessage(step, cas)}</WidgetMsg>

      {/* le plan (β, α) : chaque cas = un ensemble de contrats (slide 9) */}
      <div className="mt-4">
        <div className="mb-1 text-[13px] font-semibold">
          Les contrats du Cas {cas} dans le plan (β, α)
        </div>
        <PlotSvg p={p} label={`Plan des contrats : bonus β en abscisse, partie fixe α en ordonnée, Cas ${cas}`}>
          {cas === "3" ? (
            <rect
              x={p.pL}
              y={p.pT}
              width={p.w - p.pL - p.pR}
              height={p.h - p.pT - p.pB}
              fill={GOLD}
              opacity={0.13}
            />
          ) : null}
          <PlotFrame
            p={p}
            xticks={[0, 0.5, 1]}
            yticks={[-1, -0.5, 0, 0.5]}
            xlabel="β (taux de bonus)"
            ylabel="α (partie fixe)"
          />
          <line x1={p.X(0)} y1={p.Y(0)} x2={p.X(1.3)} y2={p.Y(0)} stroke="#a1a1aa" strokeWidth={1.2} />
          {showCP ? (
            <>
              <path d={polyPath(p, refused)} fill="#78716c" opacity={0.22} />
              <path d={plotCurve(p, frontier, 0, 1.3)} fill="none" stroke="#0369a1" strokeWidth={2.2} />
              <text x={p.X(0.04)} y={p.Y(-0.9)} fontSize={12.5} fontWeight={700} fill="#57534e" {...halo}>
                zone refusée
              </text>
              <text
                x={p.X(1.28)}
                y={p.Y(-0.94)}
                textAnchor="end"
                fontSize={12.5}
                fontWeight={700}
                fill="#075985"
                {...halo}
              >
                CP saturée : α = −β²/2
              </text>
            </>
          ) : null}
          {cas === "2" ? (
            <line x1={p.X(0)} y1={p.Y(0)} x2={p.X(1.3)} y2={p.Y(0)} stroke={GOLD} strokeWidth={5} opacity={0.85} />
          ) : null}
          {cas === "1" ? (
            <line x1={p.X(0)} y1={p.Y(-1)} x2={p.X(0)} y2={p.Y(0.5)} stroke={GOLD} strokeWidth={6} opacity={0.85} />
          ) : null}
          {showOpt ? (
            <>
              <path
                d={plotCurve(p, (b) => b - b * b - K.k, 0, 1.3)}
                fill="none"
                stroke="#be123c"
                strokeWidth={2.2}
                strokeDasharray="7 4"
              />
              <Dot p={p} x={K.b} y={K.a} fill="#1c1917" r={7} />
            </>
          ) : null}
        </PlotSvg>
        <div className="mt-1.5 flex flex-col gap-1 text-[12.5px] leading-snug text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-5 rounded" style={{ background: GOLD }} />
            contrats possibles du Cas {cas} : {K.set}
          </span>
          {step === "3" ? (
            <span>③ En chaque contrat (β, α), l'agent choisit {cas === "1" ? "e* = 0" : "e* = β"}.</span>
          ) : null}
          {showCP ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-5 rounded-sm bg-stone-500/30" />
              ② zone grise : l'agent refuse (α + β²/2 {"<"} 0) ; trait bleu : CP saturée α = −β²/2
            </span>
          ) : null}
          {showOpt ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-5 border-t-2 border-dashed border-rose-700" />
              ① parabole rouge : iso-profit (tous les contrats qui donnent au principal le même profit k), α = β − β² − k, ici k = Uₚ* = {K.kTxt} (plus bas =
              plus de profit) ; point noir : optimum (β*, α*) = {K.optTxt}
              {cas === "2" ? ", au-dessus de la parabole bleue : CP non saturée" : ""}
              {cas === "3" ? ", sur la parabole bleue : CP saturée (tangence en β = 1)" : ""}
            </span>
          ) : null}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Explorateur du choix d'effort de l'agent (§4)                    */
/* ------------------------------------------------------------------ */

export function EffortExplorer() {
  const [b, setB] = useState(0.5);
  const [a, setA] = useState(0);
  const uid = useId();
  const clip = `clip-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;

  const W = 520;
  const H = 320;
  const m = { l: 56, r: 18, t: 26, b: 50 };
  const fr = makeFrame(W, H, m, [0, 1.6], [-0.9, 1.45]);
  const f = (e: number) => a + b * e - (e * e) / 2;
  const es = b;
  const ys = f(es); // = α + β²/2 : utilité de l'agent au sommet
  /* CP : l'agent signe si son utilité espérée (avec e* = β) vaut au moins ũ = 0 */
  const signs = ys >= -1e-9;
  const dot = signs ? "#047857" : "#be123c";
  /* étiquettes au-dessus du sommet, ou dessous s'il est tout en haut du cadre */
  const below = fr.Y(ys) - 34 < 16;
  const lx = fr.X(es);
  const anchor = es < 0.2 ? "start" : "middle";
  const dx = es < 0.2 ? 10 : 0;
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };

  return (
    <InteractiveCard
      title="Explorateur — le choix d'effort de l'agent"
      subtitle={
        <>
          La courbe montre l'utilité espérée de l'agent{" "}
          <M tex="E(w - c) = \alpha + \beta e - e^2/2" /> en fonction de son effort. Bouge les
          curseurs et observe où se trouve le sommet.
        </>
      }
      controls={
        <>
          <SliderControl
            label={<>Taux de bonus β</>}
            value={b}
            onChange={setB}
            min={0}
            max={1.2}
            step={0.05}
            format={fmt}
          />
          <SliderControl
            label={<>Partie fixe α (aperçu du Cas 3 ; dans le Cas 2, α = 0)</>}
            value={a}
            onChange={setA}
            min={-0.6}
            max={0.6}
            step={0.05}
            format={fmt}
          />
        </>
      }
      footer={
        <>
          deux observations capitales. D'abord, quand tu bouges β, le sommet glisse vers la
          droite ou la gauche : sa position horizontale, l'effort choisi, vaut toujours{" "}
          <M tex="e^* = \beta" />. C'est <strong>β qui pilote l'effort</strong>. Ensuite, bouger
          α fait monter ou descendre toute la courbe, sans changer la position horizontale du
          sommet : <strong>α ne change pas l'effort</strong>, il ne fait que transférer de
          l'argent. Garde ça en tête : c'est la clé du Cas 3. Et si le
          sommet passe sous la ligne <M tex="\tilde{u} = 0" />, l'agent refuse le contrat : c'est
          la contrainte de participation (CP).
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Utilité espérée de l'agent selon l'effort, et son utilité par défaut ũ = 0" className="w-full">
        <defs>
          <clipPath id={clip}>
            <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} />
          </clipPath>
        </defs>
        <Axes
          fr={fr}
          W={W}
          H={H}
          m={m}
          xticks={[0, 0.5, 1, 1.5]}
          yticks={[-0.5, 0, 0.5, 1]}
          xlab="effort e"
          ylab="E(w − c)"
          xAtBottom
        />
        {/* ũ = 0 : l'axe horizontal est justement à E(w − c) = 0 */}
        <line
          x1={m.l}
          y1={fr.Y(0)}
          x2={W - m.r}
          y2={fr.Y(0)}
          stroke="#d97706"
          strokeWidth={1.8}
          strokeDasharray="6 5"
        />
        <text
          x={W - m.r}
          y={fr.Y(0) - 7}
          textAnchor="end"
          fontSize={13}
          fontWeight={700}
          fill="#b45309"
          {...halo}
        >
          ũ = 0 (utilité par défaut)
        </text>
        <path
          d={curvePath(fr, f, 0, 1.6)}
          fill="none"
          stroke="#0369a1"
          strokeWidth={2.6}
          clipPath={`url(#${clip})`}
        />
        <line
          x1={lx}
          y1={fr.Y(0)}
          x2={lx}
          y2={fr.Y(ys)}
          stroke={dot}
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <circle cx={lx} cy={fr.Y(ys)} r={6.5} fill={dot} stroke="#fff" strokeWidth={1.5} />
        <text
          x={lx + dx}
          y={below ? fr.Y(ys) + 24 : fr.Y(ys) - 14}
          textAnchor={anchor}
          fontStyle="italic"
          fontSize={15}
          fontWeight={600}
          fill={dot}
          {...halo}
        >
          e* = β = {fmt(es)}
        </text>
        <text
          x={lx + dx}
          y={below ? fr.Y(ys) + 42 : fr.Y(ys) - 32}
          textAnchor={anchor}
          fontSize={13}
          fontWeight={700}
          fill={dot}
          {...halo}
        >
          {signs ? "✓ l'agent signe" : "✗ il refuse : CP violée"}
        </text>
      </svg>
      <Readouts
        items={[
          { value: fmt(es), label: <>effort optimal e* = β</> },
          { value: fmt(a + (b * b) / 2), label: <>utilité de l'agent au sommet</>, tone: "agent" },
        ]}
      />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Le gâteau S(e) = e − e²/2 (§5)                                   */
/* ------------------------------------------------------------------ */

export function SurplusExplorer() {
  const [e, setE] = useState(1);
  const W = 520;
  const H = 300;
  const m = { l: 56, r: 18, t: 26, b: 50 };
  const fr = makeFrame(W, H, m, [0, 2], [0, 0.62]);
  const S = (v: number) => v - (v * v) / 2;
  const pts = [
    { e: 0, l: "Cas 1", dy: -12, dx: 8, anchor: "start" as const },
    { e: 0.5, l: "Cas 2", dy: -12, dx: -6, anchor: "end" as const },
    { e: 1, l: "Cas 3 = maximum", dy: -14, dx: 0, anchor: "middle" as const },
  ];

  return (
    <InteractiveCard
      title="Le gâteau total S(e) = e − e²/2"
      subtitle="Déplace le curseur pour balader l'effort le long de la courbe du surplus."
      controls={
        <SliderControl
          label={<>Effort e</>}
          value={e}
          onChange={setE}
          min={0}
          max={2}
          step={0.05}
          format={fmt}
        />
      }
      footer={
        <>
          Cas 1 : e = 0 → gâteau nul. Cas 2 : e = ½ → gâteau de 0,375, partagé (0,25 / 0,125).
          Cas 3 : e = 1 → gâteau maximal de 0,5, entièrement pour le principal.{" "}
          <strong>
            L'effort efficace, c'est celui qui maximise le gâteau — pas celui qui plaît à l'un ou
            à l'autre.
          </strong>{" "}
          Et au-delà de e = 1, le gâteau retombe : les dernières visites coûtent plus qu'elles ne
          rapportent.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Courbe du surplus total en fonction de l'effort, maximum en e égal 1"
        className="w-full"
      >
        <Axes
          fr={fr}
          W={W}
          H={H}
          m={m}
          xticks={[0, 0.5, 1, 1.5, 2]}
          yticks={[0.25, 0.5]}
          xlab="effort e"
          ylab="surplus total S(e) = e − e²/2"
        />
        <line
          x1={fr.X(0)}
          y1={fr.Y(0.5)}
          x2={fr.X(1)}
          y2={fr.Y(0.5)}
          stroke="#d97706"
          strokeDasharray="5 5"
          strokeWidth={1.4}
        />
        <path d={curvePath(fr, S, 0, 2)} fill="none" stroke="#047857" strokeWidth={2.6} />
        {pts.map((p) => (
          <g key={p.l}>
            <line
              x1={fr.X(p.e)}
              y1={fr.Y(0)}
              x2={fr.X(p.e)}
              y2={fr.Y(S(p.e))}
              stroke={AXIS}
              strokeDasharray="3 4"
              strokeWidth={1}
            />
            <circle cx={fr.X(p.e)} cy={fr.Y(S(p.e))} r={6} fill={p.e === 1 ? "#be123c" : "#047857"} />
            <text
              x={fr.X(p.e) + p.dx}
              y={fr.Y(S(p.e)) + p.dy}
              textAnchor={p.anchor}
              fontSize={12.5}
              stroke="#fff"
              strokeWidth={3.5}
              paintOrder="stroke"
              fontWeight={600}
              fill={p.e === 1 ? "#9f1239" : "#047857"}
            >
              {p.l} · S = {fmt(S(p.e))}
            </text>
          </g>
        ))}
        {/* point mobile piloté par le curseur */}
        <circle
          cx={fr.X(e)}
          cy={fr.Y(S(e))}
          r={7}
          fill="none"
          stroke="#d97706"
          strokeWidth={2.5}
        />
      </svg>
      <Readouts
        items={[
          { value: fmt(e), label: <>effort choisi e</> },
          { value: fmt(S(e)), label: <>gâteau S(e) = e − e²/2</> },
          { value: fmt(0.5 - S(e)), label: <>valeur laissée sur la table (vs 0,50)</> },
        ]}
      />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Le laboratoire à contrats (§5)                                   */
/* ------------------------------------------------------------------ */

const PRESETS: Array<{ label: string; a: number; b: number }> = [
  { label: "Cas 1 (α=0, β=0)", a: 0, b: 0 },
  { label: "Cas 2 (α=0, β=½)", a: 0, b: 0.5 },
  { label: "Cas 3 optimal (α=−0,5, β=1)", a: -0.5, b: 1 },
  { label: "Alternative du slide 14 (α=0,7, β=0)", a: 0.7, b: 0 },
];

export function ContractLab() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0.5);

  const EPS = 1e-9;
  const e = b;
  const uaRaw = a + (b * b) / 2;
  const accept = uaRaw >= -EPS;
  const Up = accept ? b - b * b - a : 0;
  const Ua = accept ? uaRaw : 0;
  const total = Up + Ua;

  /* messages pédagogiques — logique identique à la source */
  let tone: "info" | "good" | "warn" = "info";
  let msg: ReactNode;
  if (!accept) {
    tone = "warn";
    msg = (
      <>
        🚫 <strong>L'agent refuse le contrat !</strong> Avec ce couple (α, β), son utilité
        espérée serait {fmt(uaRaw)} {"<"} ũ = 0. La contrainte de participation est violée :
        personne ne gagne rien. Remonte α ou β.
      </>
    );
  } else if (Math.abs(b - 1) < 0.026 && Math.abs(a + 0.5) < 0.026) {
    tone = "good";
    msg = (
      <>
        🎉 <strong>Contrat optimal trouvé !</strong> β = 1 rend l'agent residual claimant
        (effort efficace e = 1), et la franchise α = −0,5 extrait tout le surplus :{" "}
        <M tex="U_p = 0{,}5" />, <M tex="U_a = 0" />. Impossible de faire mieux.
      </>
    );
  } else if (Math.abs(a - 0.7) < 0.026 && b < 0.026) {
    tone = "warn";
    msg = (
      <>
        👻 <strong>L'alternative du slide 14 s'effondre !</strong> Tu espérais (0,3 ; 0,2) avec e = 1 ?
        Hélas : face à β = 0, la meilleure réponse de l'agent est e = 0. Il empoche le fixe 0,7
        sans travailler : <M tex="U_p = -0{,}7" />. Voilà ce que signifie « pas compatible aux
        incitants ».
      </>
    );
  } else if (Ua > 0.02) {
    msg = (
      <>
        💡 L'agent garde un surplus de {fmt(Ua)} au-dessus de son utilité par défaut. Le
        principal peut <strong>baisser α</strong> pour récupérer cet argent sans rien changer à
        l'effort (la CP n'est pas saturée).
      </>
    );
  } else if (b < 0.98) {
    msg = (
      <>
        📈 La CP est presque saturée, bien ! Mais β = {fmt(b)} {"<"} 1 : l'effort induit (
        {fmt(e)}) est trop faible, le gâteau n'est pas maximal. <strong>Augmente β</strong> :
        l'effort et le gâteau grossissent, et l'agent y gagne aussi (
        <M tex="U_a = \alpha + \beta^2/2" /> augmente). Puis <strong>baisse α</strong> (franchise
        plus grande) pour ramener <M tex="U_a" /> à 0 : c'est la CP saturée.
      </>
    );
  } else if (b > 1.02) {
    msg = (
      <>
        🔥 β = {fmt(b)} {">"} 1 : tu <strong>sur-incites</strong> ! L'agent travaille énormément
        (e = {fmt(e)}), mais les dernières visites coûtent plus cher qu'elles ne rapportent : le
        gâteau total retombe ({fmt(b - (b * b) / 2)} {"<"} 0,5). Redescends vers β = 1.
      </>
    );
  } else {
    msg = (
      <>
        🧭 Tout proche ! Ajuste finement α pour saturer la contrainte de participation (
        <M tex="U_a = 0" /> pile).
      </>
    );
  }

  /* barres : échelle 0 → 0,6 avec repère doré à 0,5 */
  const pct = (v: number) => `${(Math.min(Math.max(v, 0), 0.6) / 0.6) * 100}%`;
  const goldPos = `${(0.5 / 0.6) * 100}%`;

  return (
    <InteractiveCard
      title="Le laboratoire à contrats — à toi de jouer le principal"
      subtitle={
        <>
          Choisis α et β. Le simulateur applique la réaction de l'agent (<M tex="e^* = \beta" />,
          et refus si <M tex="U_a < 0" />) et calcule les payoffs. Objectif : atteindre le profit
          maximal <M tex="U_p = 0{,}5" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={<>Partie fixe α</>}
            value={a}
            onChange={setA}
            min={-1}
            max={1}
            step={0.05}
            format={fmt}
          />
          <SliderControl
            label={<>Taux de bonus β</>}
            value={b}
            onChange={setB}
            min={0}
            max={1.5}
            step={0.05}
            format={fmt}
          />
          <div className="col-span-full flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setA(p.a);
                  setB(p.b);
                }}
                className="rounded-full border bg-card px-3 py-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      }
      footer={
        <>
          essaie les préréglages dans l'ordre : les deux premiers rejouent les Cas 1 et 2, le
          troisième est l'optimum, le quatrième rejoue l'alternative du slide 14 et montre
          pourquoi elle n'est pas compatible aux incitants. Puis cherche à la main le couple (α, β) qui amène la barre du principal sur
          le trait doré.
        </>
      }
    >
      <div className="space-y-3">
        {[
          { label: "Principal", sub: <M tex="U_p" />, v: Up, color: "bg-rose-600", text: "text-rose-700" },
          { label: "Agent", sub: <M tex="U_a" />, v: Ua, color: "bg-sky-600", text: "text-sky-700" },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className={cn("w-24 shrink-0 text-right text-[13px] font-bold", row.text)}>
              {row.label} {row.sub}
            </span>
            <div className="relative h-9 flex-1 overflow-hidden rounded-lg border bg-muted/40">
              <div
                className={cn("h-full rounded-lg transition-all duration-300", row.color)}
                style={{ width: pct(row.v) }}
              />
              <div
                className="absolute bottom-0 top-0 w-0 border-l-2 border-dashed border-amber-500"
                style={{ left: goldPos }}
                aria-hidden
              />
            </div>
            <span className="w-14 shrink-0 text-[14px] font-extrabold tabular-nums">
              {fmt(row.v)}
            </span>
          </div>
        ))}
        <div className="text-right text-[12px] text-amber-700">
          trait doré = profit maximal possible : 0,50
        </div>
      </div>
      <Readouts
        items={[
          { value: fmt(e), label: <>effort induit e* = β</> },
          { value: fmt(Up), label: <>profit du principal Uₚ</>, tone: "principal" },
          { value: fmt(Ua), label: <>utilité de l'agent Uₐ</>, tone: "agent" },
          { value: fmt(total), label: <>gâteau total S = Uₚ + Uₐ</> },
        ]}
      />
      {accept ? (
        <p className="mt-2 text-[13px] text-muted-foreground">
          L'agent accepte le contrat et choisit e* = β = {fmt(e)}.
        </p>
      ) : null}
      <WidgetMsg tone={tone}>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Comparaison des payoffs des trois cas (§6) — figure               */
/* ------------------------------------------------------------------ */

export function PayoffComparison() {
  /* plan des payoffs : Uₐ en abscisse, Uₚ en ordonnée (coordonnées des slides 11, 14, 19, 20) */
  const p = makePlot({ w: 520, h: 360, pL: 56, pR: 18, pT: 30, pB: 46, x: [0, 0.56], y: [0, 0.56] });
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };
  const pts = [
    { id: "c1", ua: 0, up: 0, color: "#57534e" },
    { id: "c2", ua: 0.125, up: 0.25, color: "#0369a1" },
    { id: "alt", ua: 0.2, up: 0.3, color: "#7c3aed" },
    { id: "c3", ua: 0, up: 0.5, color: "#047857" },
  ];

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      <figcaption className="mb-2 text-[15px] font-bold">
        📊 Les payoffs des trois cas dans le plan (Uₐ ; Uₚ)
      </figcaption>
      <PlotSvg
        p={p}
        label="Plan des payoffs : utilité de l'agent en abscisse, profit du principal en ordonnée, avec les trois cas, l'alternative du slide 14 et la frontière Uₚ + Uₐ = 0,5"
      >
        <PlotFrame
          p={p}
          xticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
          yticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
          xlabel="Uₐ : utilité de l'agent"
          ylabel="Uₚ : profit du principal"
        />
        {/* résultats faisables que les DEUX joueurs préfèrent au Cas 2 (quadrant nord-est, sous la frontière) */}
        <path
          d={polyPath(p, [
            [0.125, 0.25],
            [0.25, 0.25],
            [0.125, 0.375],
          ])}
          fill="#10b981"
          opacity={0.25}
        />
        <line
          x1={p.X(0.125)}
          y1={p.Y(0.25)}
          x2={p.X(0.25)}
          y2={p.Y(0.25)}
          stroke="#059669"
          strokeDasharray="4 3"
        />
        <line
          x1={p.X(0.125)}
          y1={p.Y(0.25)}
          x2={p.X(0.125)}
          y2={p.Y(0.375)}
          stroke="#059669"
          strokeDasharray="4 3"
        />
        {/* frontière : gâteau maximal S = 0,5 partagé de toutes les façons possibles */}
        <line x1={p.X(0)} y1={p.Y(0.5)} x2={p.X(0.5)} y2={p.Y(0)} stroke="#d97706" strokeWidth={2.4} />
        <g fontSize={12.5} fontWeight={600} fill="#b45309" textAnchor="end">
          <text x={p.X(0.56)} y={p.Y(0.45)} {...halo}>
            droite Uₚ + Uₐ = 0,5 : résultats techniquement
          </text>
          <text x={p.X(0.56)} y={p.Y(0.45) + 16} {...halo}>
            faisables les plus efficaces (gâteau maximal 0,5)
          </text>
        </g>
        {pts.map((q) => (
          <Dot key={q.id} p={p} x={q.ua} y={q.up} fill={q.color} r={6} />
        ))}
        <g fontSize={12.5} fontWeight={700} {...halo}>
          <text x={p.X(0) + 10} y={p.Y(0) - 10} fill="#57534e">
            Cas 1 : Uₚ = 0 ; Uₐ = 0
          </text>
          <text x={p.X(0) + 10} y={p.Y(0.5) - 7} fill="#047857">
            Cas 3 : Uₚ = 0,5 ; Uₐ = 0
          </text>
          <text x={p.X(0.125) - 9} y={p.Y(0.25) + 20} textAnchor="end" fill="#0369a1">
            Cas 2
          </text>
          <text x={p.X(0.125) - 9} y={p.Y(0.25) + 36} textAnchor="end" fill="#0369a1">
            Uₚ = 0,25
          </text>
          <text x={p.X(0.125) - 9} y={p.Y(0.25) + 52} textAnchor="end" fill="#0369a1">
            Uₐ = 0,125
          </text>
          <text x={p.X(0.2) + 11} y={p.Y(0.3) - 28} fill="#7c3aed">
            alternative du slide 14
          </text>
          <text x={p.X(0.2) + 11} y={p.Y(0.3) - 12} fill="#7c3aed">
            Uₚ = 0,3 ; Uₐ = 0,2
          </text>
        </g>
      </PlotSvg>
      <div className="mt-1 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
        <span className="inline-block h-3 w-5 rounded-sm bg-emerald-500/30" aria-hidden />
        zone verte : les résultats faisables que les deux joueurs préfèrent au Cas 2
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Le <strong>Cas 2</strong> est sous la frontière : <strong>inefficace</strong> (slide 14).
        Mais l'alternative n'est pas compatible aux incitants : face à α = 0,7 et β = 0, l'agent
        choisit e = 0. Le <strong>Cas 3</strong> est sur la frontière : <strong>efficace</strong>{" "}
        (slide 19), même s'il donne 0 à l'agent. Pareto ne dit rien de l'égalité (S1 slide 42).
      </p>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Fonction d'utilité concave & coût du risque (§7) — figure        */
/* ------------------------------------------------------------------ */

export function RiskAversionFigure() {
  const uid = useId();
  const arrow = `arrisk-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  /* Exemple chiffré illustratif (pas dans les slides) : u = √(revenu net), revenu net 0,1 ou
     0,9 avec une chance sur deux. Tous les points sont CALCULÉS sur la courbe (comme S4 sl. 23). */
  const u = Math.sqrt;
  const lo = 0.1;
  const hi = 0.9;
  const vma = (lo + hi) / 2; // 0,5
  const U = (u(lo) + u(hi)) / 2; // ≈ 0,632 : milieu de la corde = utilité espérée
  const C = U * U; // = 0,4 : équivalent certain, u(C) = U
  const chord = (x: number) => u(lo) + ((u(hi) - u(lo)) / (hi - lo)) * (x - lo);
  const p = makePlot({ w: 520, h: 360, pL: 70, pR: 18, pT: 28, pB: 64, x: [0, 1.05], y: [0, 1.05] });
  const axisY = p.h - p.pB;
  const halo = { stroke: "#fff", strokeWidth: 3.5, paintOrder: "stroke" as const };
  const G = "#a1a1aa";
  const V = "#7c3aed";
  const hGuide = (x: number, y: number) => (
    <line x1={p.pL} y1={p.Y(y)} x2={p.X(x)} y2={p.Y(y)} stroke={G} strokeWidth={1.1} strokeDasharray="4 4" />
  );
  const vGuide = (x: number, y: number) => (
    <line x1={p.X(x)} y1={axisY} x2={p.X(x)} y2={p.Y(y)} stroke={G} strokeWidth={1.1} strokeDasharray="4 4" />
  );

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      <figcaption className="mb-2 text-[15px] font-bold">
        📉 Pourquoi le risque « coûte » à un agent averse : la prime de risque (comme en A3)
      </figcaption>
      <PlotSvg p={p} label="Fonction d'utilité concave, équivalent certain et prime de risque minimale">
        <defs>
          <marker
            id={arrow}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="#be123c" />
          </marker>
        </defs>
        <PlotFrame p={p} grid={false} xlabel="revenu net w − c" ylabel="u(w − c)" />
        {/* repères pointillés, comme sur le slide 23 de S4 */}
        {hGuide(hi, u(hi))}
        {hGuide(vma, u(vma))}
        {hGuide(vma, U)}
        {hGuide(lo, u(lo))}
        {vGuide(lo, u(lo))}
        {vGuide(C, U)}
        {vGuide(vma, u(vma))}
        {vGuide(hi, u(hi))}
        {/* la fonction d'utilité concave */}
        <path d={plotCurve(p, u, 0, 1.05)} fill="none" stroke="#0369a1" strokeWidth={2.6} />
        <text x={p.w - p.pR} y={p.pT - 4} textAnchor="end" fontSize={13} fontWeight={600} fill="#075985" {...halo}>
          u = √(w − c), concave
        </text>
        {/* corde entre les deux revenus possibles */}
        <line
          x1={p.X(lo)}
          y1={p.Y(u(lo))}
          x2={p.X(hi)}
          y2={p.Y(u(hi))}
          stroke={V}
          strokeWidth={1.8}
        />
        <text x={p.X(0.66)} y={p.Y(chord(0.66)) + 24} fontSize={12.5} fontWeight={600} fill={V} {...halo}>
          corde : utilité espérée
        </text>
        <Dot p={p} x={lo} y={u(lo)} fill={V} r={5} />
        <Dot p={p} x={hi} y={u(hi)} fill={V} r={5} />
        <Dot p={p} x={vma} y={U} fill={V} r={5.5} />
        <Dot p={p} x={vma} y={u(vma)} fill="#047857" r={5.5} />
        <Dot p={p} x={C} y={U} fill="#0369a1" r={5.5} />
        {/* étiquettes de l'axe vertical */}
        <g fontSize={12.5} textAnchor="end" fontStyle="italic">
          <text x={p.pL - 6} y={p.Y(u(hi)) + 4} fill={V}>u(0,9)</text>
          <text x={p.pL - 6} y={p.Y(u(vma)) + 2} fill="#047857">u(0,5)</text>
          <text x={p.pL - 6} y={p.Y(U) + 10} fill={V}>U = u(C)</text>
          <text x={p.pL - 6} y={p.Y(u(lo)) + 4} fill={V}>u(0,1)</text>
        </g>
        {/* étiquettes de l'axe horizontal */}
        <g fontSize={12.5} textAnchor="middle">
          <text x={p.X(lo)} y={axisY + 17} fill={V}>0,1</text>
          <text x={p.X(lo)} y={axisY + 33} fill={V}>mauvaise année</text>
          <text x={p.X(C)} y={axisY + 17} fill="#0369a1" fontWeight={700}>C</text>
          <text x={p.X(C)} y={axisY + 33} fill="#0369a1">= 0,4</text>
          <text x={p.X(vma)} y={axisY + 17} fill="#047857" fontWeight={700}>VMA</text>
          <text x={p.X(vma)} y={axisY + 33} fill="#047857">= 0,5</text>
          <text x={p.X(hi)} y={axisY + 17} fill={V}>0,9</text>
          <text x={p.X(hi)} y={axisY + 33} fill={V}>bonne année</text>
        </g>
        {/* PRM : un montant d'argent, donc un écart HORIZONTAL sur l'axe des revenus */}
        <line
          x1={p.X(C) + 2}
          y1={axisY - 12}
          x2={p.X(vma) - 2}
          y2={axisY - 12}
          stroke="#be123c"
          strokeWidth={2.4}
          markerStart={`url(#${arrow})`}
          markerEnd={`url(#${arrow})`}
        />
        <text
          x={(p.X(C) + p.X(vma)) / 2}
          y={axisY - 22}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill="#be123c"
          {...halo}
        >
          PRM = VMA − C = 0,1
        </text>
      </PlotSvg>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        <strong>Exemple chiffré illustratif (pas dans les slides)</strong> : le revenu net de
        l'agent vaut 0,1 (mauvaise année) ou 0,9 (bonne année), une chance sur deux, et{" "}
        <M tex="u = \sqrt{w - c}" />. Sa VMA vaut 0,5 et son utilité espérée{" "}
        <M tex="U = \tfrac{1}{2}\sqrt{0{,}1} + \tfrac{1}{2}\sqrt{0{,}9} \approx 0{,}632" /> est
        plus petite que <M tex="u(0{,}5) \approx 0{,}707" /> : à revenu moyen égal, la version
        certaine donne plus d'utilité que la version risquée, c'est l'aversion au risque.
        L'équivalent certain C est le revenu certain qui donne la même utilité U :{" "}
        <M tex="C = U^2 = 0{,}4" />. La compensation que l'agent exige pour porter ce risque est un
        montant d'argent : la prime de risque minimale{" "}
        <M tex="\text{PRM} = \text{VMA} - C = 0{,}5 - 0{,}4 = 0{,}1" /> (A3, S4 slides 22-23), la
        flèche rouge horizontale.
      </p>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Checklist de maîtrise (§9)                                       */
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
        Progression : {done.size} / {items.length}
        {done.size === items.length ? " — chapitre bouclé ! 🏆" : ""}
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

/* ------------------------------------------------------------------ */
/* 9. Diagnostic automatique des quiz (§9)                             */
/* ------------------------------------------------------------------ */

interface DiagGroup {
  label: string;
  target: string;
  quizIds: string[];
  advice: string;
}

const DIAG_GROUPS: DiagGroup[] = [
  {
    label: "§1 — L'histoire et le vocabulaire",
    target: "sec-histoire",
    quizIds: ["q1", "q2"],
    advice:
      "Relis les cartes de vocabulaire du §1 et refais l'exercice mental « qui est principal, qui est agent ? » sur 3 exemples de ton quotidien.",
  },
  {
    label: "§2 — Le modèle",
    target: "sec-modele",
    quizIds: ["q3", "q4", "q4b"],
    advice:
      "Réécris les 4 ingrédients du modèle sur papier, de mémoire (§2), en disant d'où vient chaque hypothèse, puis récite l'ordre de résolution : ③ l'effort, ② la décision de signer, ① le contrat.",
  },
  {
    label: "§3 — Cas 1 (salaire fixe)",
    target: "sec-cas1",
    quizIds: ["q5"],
    advice:
      "Refais la résolution du Cas 1 (§3) : le point clé est que la dérivée de α par rapport à e est nulle.",
  },
  {
    label: "§4 — Cas 2 (salaire proportionnel)",
    target: "sec-cas2",
    quizIds: ["q6", "q7"],
    advice:
      "Retravaille le §4 : la CPO de l'agent (e* = β), celle du principal (β* = ½), et surtout la notion de compatibilité aux incitants. Rejoue le préréglage « Alternative du slide 14 » dans le laboratoire du §5.",
  },
  {
    label: "§5 — Cas 3 (salaire linéaire)",
    target: "sec-cas3",
    quizIds: ["q8", "q9"],
    advice:
      "Le cœur du chapitre : reprends la recette du §5 (CI → CP saturée → substitution de α → on injecte la CI → CPO sur β → α* par la CP), puis refais l'exercice 2 sans regarder la solution.",
  },
  {
    label: "§6 — Vue d'ensemble",
    target: "sec-recap",
    quizIds: ["q10"],
    advice:
      "Reconstruis le tableau récapitulatif de tête (§6) et vérifie ligne par ligne. Attention au transfert de risque : qui touche 0,5 quoi qu'il arrive ?",
  },
  {
    label: "§7 — Agent averse au risque",
    target: "sec-risque",
    quizIds: ["q11", "q12"],
    advice:
      "Relis le §7 : l'arbitrage incitants/risque et la phrase de conclusion sur le coût de l'information imparfaite.",
  },
];

export function QuizDiagnostic() {
  const [analyzed, setAnalyzed] = useState(false);
  const progress = useProgress();
  /* même clé que le composant Quiz : scope préfixé par le cours courant (« <cours>:b2 ») */
  const courseCtx = useCourseOptional();
  const scope = courseCtx ? scopedKey(courseCtx.courseId, "b2") : "b2";
  const results = progress.quiz[scope] ?? {};

  const rows = DIAG_GROUPS.map((g) => {
    let ok = 0;
    let ko = 0;
    let na = 0;
    for (const id of g.quizIds) {
      if (results[id] === "correct") ok += 1;
      else if (results[id] === "wrong") ko += 1;
      else na += 1;
    }
    return { ...g, ok, ko, na };
  });

  const answeredAny = rows.some((r) => r.ok + r.ko > 0);
  const weak = rows.filter((r) => r.ko > 0).length;

  return (
    <div className="my-6">
      <button
        type="button"
        onClick={() => setAnalyzed(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <BarChart3 className="h-4 w-4" aria-hidden />
        Analyser mes réponses aux quiz
      </button>

      {analyzed ? (
        <div className="mt-4 space-y-2 animate-in fade-in" aria-live="polite">
          {!answeredAny ? (
            <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
              Tu n'as encore répondu à aucun quiz. Réponds aux « Quiz éclair » du chapitre, puis
              reviens ici.
            </div>
          ) : weak === 0 ? (
            <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-900">
              <strong>Aucune faiblesse détectée sur les quiz répondus 🎉</strong> Passe aux
              exercices résolus du §8 pour consolider, et vérifie la checklist ci-dessus.
            </div>
          ) : null}
          {rows.map((r) => {
            if (r.ko > 0) {
              return (
                <div
                  key={r.target}
                  className="rounded-xl border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-[14px] leading-relaxed text-rose-950"
                >
                  <strong>{r.label}</strong> — {r.ko} erreur{r.ko > 1 ? "s" : ""} sur{" "}
                  {r.ok + r.ko} répondue{r.ok + r.ko > 1 ? "s" : ""}. 👉 {r.advice}{" "}
                  <a href={`#${r.target}`} className="font-semibold underline">
                    Retourner à la section
                  </a>
                  .
                </div>
              );
            }
            if (r.na > 0 && r.ok === 0) {
              return (
                <div
                  key={r.target}
                  className="rounded-xl border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3 text-[14px] leading-relaxed text-amber-950"
                >
                  <strong>{r.label}</strong> — quiz non tenté. Impossible de te diagnostiquer :
                  va répondre aux questions de cette section !{" "}
                  <a href={`#${r.target}`} className="font-semibold underline">
                    Y aller
                  </a>
                  .
                </div>
              );
            }
            return (
              <div
                key={r.target}
                className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/70 px-4 py-3 text-[14px] leading-relaxed text-emerald-950"
              >
                <strong>{r.label}</strong> — sans faute ({r.ok}/{r.ok}). Solide ✔
              </div>
            );
          })}
          <p className="flex items-center gap-1.5 pt-1 text-[12.5px] text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            Le diagnostic se base sur ton meilleur résultat à chaque quiz du chapitre (une bonne
            réponse reste acquise).
          </p>
        </div>
      ) : null}
    </div>
  );
}
