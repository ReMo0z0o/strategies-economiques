/*
 * Chapitre B2 — Théorie des contrats : composants interactifs.
 *
 * Recréation fidèle des widgets du manuel interactif source :
 *  - PollIntuition      : le sondage « combien de clients visites-tu ? »
 *  - GameTreeTimeline   : l'arbre du jeu séquentiel en 3 étapes cliquables
 *  - EffortExplorer     : la courbe d'utilité de l'agent pilotée par α et β
 *  - SurplusExplorer    : le « gâteau » S(e) = e − e²/2 et son maximum
 *  - ContractLab        : le laboratoire à contrats (l'étudiant joue le principal)
 *  - PayoffComparison   : le graphique en barres des payoffs des 3 cas
 *  - RiskAversionFigure : la fonction d'utilité concave et le coût du risque
 *  - MasteryChecklist   : la checklist de maîtrise du bilan
 *  - QuizDiagnostic     : le diagnostic automatique des quiz du chapitre
 */

import { useId, useState, type ReactNode } from "react";
import { BarChart3, CheckCircle2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import { M } from "@/components/course/Math";
import {
  InteractiveCard,
  SliderControl,
} from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers communs                                                     */
/* ------------------------------------------------------------------ */

/** format « à la française », 2 décimales (comme la source) */
function fmt(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return r.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
}: {
  fr: Frame;
  W: number;
  H: number;
  m: { l: number; r: number; t: number; b: number };
  xticks: number[];
  yticks: number[];
  xlab?: string;
  ylab?: string;
}) {
  const yAxisX = fr.X(Math.max(0, 0));
  return (
    <g>
      <line x1={m.l} y1={fr.Y(0)} x2={W - m.r} y2={fr.Y(0)} stroke={AXIS} strokeWidth={1.4} />
      <line x1={yAxisX} y1={H - m.b} x2={yAxisX} y2={m.t} stroke={AXIS} strokeWidth={1.4} />
      {xticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={fr.X(t)} y1={fr.Y(0) - 4} x2={fr.X(t)} y2={fr.Y(0) + 4} stroke={AXIS} />
          <text
            x={fr.X(t)}
            y={fr.Y(0) + 20}
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
          y={fr.Y(0) + 38}
          textAnchor="end"
          fontSize={14.5}
          fontStyle="italic"
          fill={TXT}
        >
          {xlab}
        </text>
      ) : null}
      {ylab ? (
        <text x={yAxisX} y={m.t - 8} textAnchor="middle" fontSize={14.5} fontStyle="italic" fill={TXT}>
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
  { label: "Le maximum, par conscience professionnelle", pct: 14, short: "Le maximum" },
  { label: "Quelques-uns, pour donner le change", pct: 47, short: "Quelques-uns" },
  { label: "Le strict minimum, voire zéro", pct: 39, short: "Le minimum" },
];

export function PollIntuition() {
  const [voted, setVoted] = useState<number | null>(null);
  return (
    <div className="my-6 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-4 sm:p-5">
      <div className="text-[15px] font-bold text-violet-900">
        🗳️ Avant de continuer — teste ton intuition. Imagine que TU es ce commercial, payé
        2 500 €/mois quoi qu'il arrive, sans aucun contrôle de tes visites. Combien de clients
        visites-tu ?
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
          {POLL_OPTS.map((o, i) => (
            <div key={i} className="my-1.5 flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "w-28 shrink-0 text-right text-[12.5px]",
                  i === voted ? "font-bold text-violet-800" : "text-muted-foreground",
                )}
              >
                {o.short}
                {i === voted ? " (toi)" : ""}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-full border bg-background">
                <div
                  className="h-full rounded-full bg-violet-500/75 transition-all duration-700"
                  style={{ width: `${o.pct}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-[12.5px] font-bold tabular-nums">{o.pct} %</span>
            </div>
          ))}
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Répartition indicative de réponses d'étudiants (à titre illustratif). La théorie
            prédit « zéro » pour un agent purement intéressé — on le démontrera au Cas 1. La
            vraie vie est plus nuancée (souviens-toi de l'économie comportementale du chapitre
            A1 !), mais le modèle capte une force bien réelle.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. L'arbre du jeu en 3 étapes (§2)                                  */
/* ------------------------------------------------------------------ */

const TREE_MSGS: Record<1 | 2 | 3, ReactNode> = {
  1: (
    <>
      ① Le principal choisit les termes du contrat (α, β) parmi une infinité de possibilités —
      l'éventail rouge. C'est <strong>son</strong> coup dans le jeu.
    </>
  ),
  2: (
    <>
      ② L'agent compare : que vaut le contrat proposé face à son utilité par défaut{" "}
      <M tex="\tilde{u} = 0" /> ? S'il refuse, le jeu s'arrête (branche de gauche). C'est ici que
      vivra la <strong>contrainte de participation</strong>.
    </>
  ),
  3: (
    <>
      ③ S'il accepte, l'agent choisit librement son effort <M tex="e" /> (le principal ne voit
      rien !) — c'est ici que vivra la{" "}
      <strong>contrainte de compatibilité aux incitants</strong>. Puis la Nature tire{" "}
      <M tex="x" /> au sort, <M tex="z = e + x" /> est réalisé, et les paiements tombent.
      Backward induction : on résout d'abord cette étape, puis on remonte.
    </>
  ),
};

export function GameTreeTimeline() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const uid = useId();
  const arrow = `arr-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const op = (s: number) => (s <= step ? 1 : 0.15);

  return (
    <InteractiveCard
      title="L'arbre du jeu — clique sur les étapes"
      subtitle="Le principal joue en premier ; c'est précisément ce qui lui permet, en concevant le contrat, d'influencer le comportement de l'agent."
      controls={
        <div className="col-span-full flex flex-wrap gap-1.5">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                step === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {s === 1 ? "① Le principal propose" : s === 2 ? "② L'agent accepte ou refuse" : "③ Effort, puis la chance tranche"}
            </button>
          ))}
        </div>
      }
      footer={
        <>
          le principal joue en <strong>premier</strong>, mais on résoudra le jeu en{" "}
          <strong>commençant par la fin</strong> (backward induction) : d'abord l'effort de
          l'agent (étape ③), puis le contrat du principal (étape ①).
        </>
      }
    >
      <svg
        viewBox="0 0 700 330"
        role="img"
        aria-label="Arbre du jeu séquentiel principal-agent"
        className="w-full"
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

        {/* étape 1 — le principal propose */}
        <g style={{ opacity: op(1), transition: "opacity .3s" }}>
          <circle cx={350} cy={40} r={13} fill="#be123c" />
          <text x={350} y={20} textAnchor="middle" fontSize={14} fontWeight={600} fill="#9f1239">
            Principal
          </text>
          <path d="M350 53 L350 105" stroke="#be123c" strokeWidth={2.4} markerEnd={`url(#${arrow})`} />
          <path d="M340 58 L230 105" stroke="#be123c" strokeWidth={1} opacity={0.45} />
          <path d="M360 58 L470 105" stroke="#be123c" strokeWidth={1} opacity={0.45} />
          <text x={475} y={80} fontStyle="italic" fontSize={15} fill="#9f1239">
            propose w(z) = α + βz
          </text>
        </g>

        {/* étape 2 — accepter ou refuser */}
        <g style={{ opacity: op(2), transition: "opacity .3s" }}>
          <circle cx={350} cy={120} r={13} fill="#0369a1" />
          <text x={318} y={126} textAnchor="end" fontSize={14} fontWeight={600} fill="#075985">
            Agent
          </text>
          <path d="M338 130 L180 185" stroke="#0369a1" strokeWidth={2.4} markerEnd={`url(#${arrow})`} />
          <path d="M362 130 L520 185" stroke="#0369a1" strokeWidth={2.4} markerEnd={`url(#${arrow})`} />
          <text x={215} y={150} textAnchor="end" fontSize={13} fill="#075985">
            refuse
          </text>
          <text x={490} y={150} fontSize={13} fill="#075985">
            accepte
          </text>
          <rect x={88} y={192} width={190} height={52} rx={10} fill="#e0f2fe" stroke="#bae6fd" />
          <text x={183} y={214} textAnchor="middle" fontSize={12.5} fill="#075985">
            fin du jeu : l'agent obtient
          </text>
          <text x={183} y={232} textAnchor="middle" fontStyle="italic" fontSize={13.5} fill="#075985">
            son utilité par défaut ũ = 0
          </text>
        </g>

        {/* étape 3 — effort puis Nature */}
        <g style={{ opacity: op(3), transition: "opacity .3s" }}>
          <circle cx={530} cy={198} r={12} fill="#0369a1" />
          <path d="M530 210 L530 250" stroke="#0369a1" strokeWidth={2.4} markerEnd={`url(#${arrow})`} />
          <path d="M520 214 L440 250" stroke="#0369a1" strokeWidth={1} opacity={0.45} />
          <path d="M540 214 L620 250" stroke="#0369a1" strokeWidth={1} opacity={0.45} />
          <text x={545} y={235} fontStyle="italic" fontSize={15} fill="#075985">
            choisit son effort e
          </text>
          <circle cx={530} cy={263} r={11} fill="#7c3aed" />
          <text x={508} y={268} textAnchor="end" fontSize={13} fontWeight={600} fill="#7c3aed">
            Nature
          </text>
          <path d="M530 274 L530 302" stroke="#7c3aed" strokeWidth={2.2} markerEnd={`url(#${arrow})`} />
          <text x={545} y={292} fontStyle="italic" fontSize={15} fill="#7c3aed">
            tire x au sort
          </text>
          <text x={530} y={322} textAnchor="middle" fontStyle="italic" fontSize={15} fill="#1c1917">
            ⇒ z = e + x, puis paiements
          </text>
        </g>
      </svg>
      <WidgetMsg tone="info">{TREE_MSGS[step]}</WidgetMsg>
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

  const W = 700;
  const H = 360;
  const m = { l: 70, r: 26, t: 26, b: 52 };
  const fr = makeFrame(W, H, m, [0, 1.6], [-0.9, 1.45]);
  const f = (e: number) => a + b * e - (e * e) / 2;
  const es = b;
  const ys = f(es);

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
            label={<>Partie fixe α</>}
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
          deux observations capitales. ① Le sommet se déplace <em>horizontalement</em> avec β —
          c'est <strong>β qui pilote l'effort</strong> ; ② bouger α translate la courbe{" "}
          <em>verticalement</em> sans déplacer le sommet — <strong>α ne change pas l'effort</strong>,
          il ne fait que transférer de l'argent. Garde ça en tête : c'est la clé du Cas 3.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Utilité espérée de l'agent selon l'effort" className="w-full">
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
        />
        <path
          d={curvePath(fr, f, 0, 1.6)}
          fill="none"
          stroke="#0369a1"
          strokeWidth={2.6}
          clipPath={`url(#${clip})`}
        />
        <line
          x1={fr.X(es)}
          y1={fr.Y(0)}
          x2={fr.X(es)}
          y2={fr.Y(ys)}
          stroke="#be123c"
          strokeWidth={1.6}
          strokeDasharray="5 4"
        />
        <circle cx={fr.X(es)} cy={fr.Y(ys)} r={6} fill="#be123c" />
        <text
          x={fr.X(es)}
          y={fr.Y(ys) - 14}
          textAnchor="middle"
          fontStyle="italic"
          fontSize={16}
          fontWeight={600}
          fill="#9f1239"
        >
          e* = β = {fmt(es)}
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
  const W = 700;
  const H = 330;
  const m = { l: 70, r: 26, t: 26, b: 52 };
  const fr = makeFrame(W, H, m, [0, 2], [0, 0.62]);
  const S = (v: number) => v - (v * v) / 2;
  const pts = [
    { e: 0, l: "Cas 1", dy: -12 },
    { e: 0.5, l: "Cas 2", dy: -12 },
    { e: 1, l: "Cas 3 = maximum", dy: -14 },
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
          Cas 1 : e = 0 → gâteau nul. Cas 2 : e = ½ → gâteau de 0,375, partagé (0,25 / 0,125).
          Cas 3 : e = 1 → gâteau maximal de 0,5, entièrement pour le principal.{" "}
          <strong>
            L'effort efficace, c'est celui qui maximise le gâteau — pas celui qui plaît à l'un ou
            à l'autre.
          </strong>{" "}
          Et au-delà de e = 1, le gâteau retombe : les dernières visites coûtent plus qu'elles ne
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
              x={fr.X(p.e)}
              y={fr.Y(S(p.e)) + p.dy}
              textAnchor="middle"
              fontSize={12.5}
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
  { label: "Le mirage Pareto (α=0,7, β=0)", a: 0.7, b: 0 },
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
        🚫 <strong>L'agent refuse le contrat !</strong> Avec ce couple (α, β), son utilité
        espérée serait {fmt(uaRaw)} {"<"} ũ = 0. La contrainte de participation est violée :
        personne ne gagne rien. Remonte α ou β.
      </>
    );
  } else if (Math.abs(b - 1) < 0.026 && Math.abs(a + 0.5) < 0.026) {
    tone = "good";
    msg = (
      <>
        🎉 <strong>Contrat optimal trouvé !</strong> β = 1 rend l'agent residual claimant
        (effort efficace e = 1), et la franchise α = −0,5 extrait tout le surplus :{" "}
        <M tex="U_p = 0{,}5" />, <M tex="U_a = 0" />. Impossible de faire mieux.
      </>
    );
  } else if (Math.abs(a - 0.7) < 0.026 && b < 0.026) {
    tone = "warn";
    msg = (
      <>
        👻 <strong>Le mirage Pareto du Cas 2 !</strong> Tu espérais (0,3 ; 0,2) avec e = 1 ?
        Hélas : face à β = 0, la meilleure réponse de l'agent est e = 0. Il empoche le fixe 0,7
        sans travailler : <M tex="U_p = -0{,}7" />. Voilà ce que signifie « pas compatible aux
        incitants ».
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
        📈 La CP est presque saturée, bien ! Mais β = {fmt(b)} {"<"} 1 : l'effort induit (
        {fmt(e)}) est trop faible, le gâteau n'est pas maximal. <strong>Augmente β</strong> (et
        compense avec α pour que l'agent signe encore).
      </>
    );
  } else if (b > 1.02) {
    msg = (
      <>
        🔥 β = {fmt(b)} {">"} 1 : tu <strong>sur-incites</strong> ! L'agent travaille énormément
        (e = {fmt(e)}), mais les dernières visites coûtent plus cher qu'elles ne rapportent : le
        gâteau total retombe ({fmt(b - (b * b) / 2)} {"<"} 0,5). Redescends vers β = 1.
      </>
    );
  } else {
    msg = (
      <>
        🧭 Tout proche ! Ajuste finement α pour saturer la contrainte de participation (
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
          et refus si <M tex="U_a < 0" />) et calcule les payoffs. Objectif : atteindre le profit
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
          essaie les préréglages dans l'ordre : les deux premiers rejouent les Cas 1 et 2, le
          troisième est l'optimum, le quatrième montre pourquoi le « meilleur monde » du Cas 2
          s'effondre. Puis cherche à la main le couple (α, β) qui amène la barre du principal sur
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
          trait doré = profit maximal possible : 0,50
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
  const cases = [
    { name: "Cas 1 · fixe", up: 0, ua: 0, cx: 176 },
    { name: "Cas 2 · proportionnel", up: 0.25, ua: 0.125, cx: 376 },
    { name: "Cas 3 · linéaire", up: 0.5, ua: 0, cx: 576 },
  ];
  const y = (v: number) => 250 - v * 416;
  const label = (v: number) =>
    v === 0 ? "0" : v.toLocaleString("fr-FR", { maximumFractionDigits: 3 });

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      <figcaption className="mb-2 text-[15px] font-bold">📊 Les payoffs des trois cas</figcaption>
      <svg viewBox="0 0 700 300" role="img" aria-label="Comparaison des payoffs des trois contrats" className="w-full">
        <line x1={70} y1={250} x2={660} y2={250} stroke={AXIS} strokeWidth={1.4} />
        <line x1={70} y1={250} x2={70} y2={30} stroke={AXIS} strokeWidth={1.4} />
        <g fontSize={11.5} fill={AXIS}>
          <text x={62} y={254} textAnchor="end">0</text>
          <line x1={66} y1={250} x2={74} y2={250} stroke={AXIS} />
          <text x={62} y={150} textAnchor="end">0,25</text>
          <line x1={66} y1={146} x2={74} y2={146} stroke={AXIS} />
          <text x={62} y={46} textAnchor="end">0,50</text>
          <line x1={66} y1={42} x2={74} y2={42} stroke={AXIS} />
          <line x1={70} y1={42} x2={660} y2={42} stroke="#d97706" strokeDasharray="5 5" strokeWidth={1.4} />
          <text x={655} y={34} textAnchor="end" fill="#b45309">gâteau maximal = 0,5</text>
        </g>
        {cases.map((c) => (
          <g key={c.name}>
            {c.up > 0 ? (
              <>
                <rect x={c.cx - 56} y={y(c.up)} width={52} height={250 - y(c.up)} rx={3} fill="#be123c" />
                <text x={c.cx - 30} y={y(c.up) - 8} textAnchor="middle" fontSize={12} fill="#9f1239">
                  {label(c.up)}
                </text>
              </>
            ) : (
              <>
                <rect x={c.cx - 56} y={249} width={52} height={2} fill="#be123c" />
                <text x={c.cx - 30} y={240} textAnchor="middle" fontSize={12} fill="#9f1239">
                  0
                </text>
              </>
            )}
            {c.ua > 0 ? (
              <>
                <rect x={c.cx + 4} y={y(c.ua)} width={52} height={250 - y(c.ua)} rx={3} fill="#0369a1" />
                <text x={c.cx + 30} y={y(c.ua) - 8} textAnchor="middle" fontSize={12} fill="#075985">
                  {label(c.ua)}
                </text>
              </>
            ) : (
              <>
                <rect x={c.cx + 4} y={249} width={52} height={2} fill="#0369a1" />
                <text x={c.cx + 30} y={240} textAnchor="middle" fontSize={12} fill="#075985">
                  0
                </text>
              </>
            )}
            <text x={c.cx} y={272} textAnchor="middle" fontSize={13} fontWeight={600} fill="#1c1917">
              {c.name}
            </text>
          </g>
        ))}
        <g fontSize={12.5}>
          <rect x={250} y={288} width={12} height={12} rx={2} fill="#be123c" />
          <text x={268} y={298} fill="#1c1917">Principal Uₚ</text>
          <rect x={380} y={288} width={12} height={12} rx={2} fill="#0369a1" />
          <text x={398} y={298} fill="#1c1917">Agent Uₐ</text>
        </g>
      </svg>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Fonction d'utilité concave & coût du risque (§7) — figure        */
/* ------------------------------------------------------------------ */

export function RiskAversionFigure() {
  const uid = useId();
  const arrow = `arrisk-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm">
      <figcaption className="mb-2 text-[15px] font-bold">
        📉 Pourquoi le risque « coûte » à un agent averse — schéma
      </figcaption>
      <svg viewBox="0 0 700 340" role="img" aria-label="Fonction d'utilité concave et prime de risque" className="w-full">
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
            <path d="M0 0 L10 5 L0 10 z" fill="#be123c" />
          </marker>
        </defs>
        <line x1={80} y1={290} x2={650} y2={290} stroke={AXIS} strokeWidth={1.4} />
        <line x1={80} y1={290} x2={80} y2={30} stroke={AXIS} strokeWidth={1.4} />
        <text x={640} y={312} fontStyle="italic" fontSize={15} fill={AXIS}>
          revenu
        </text>
        <text x={66} y={42} textAnchor="end" fontStyle="italic" fontSize={15} fill={AXIS}>
          u
        </text>
        <path d="M100 285 Q 240 60 620 55" fill="none" stroke="#0369a1" strokeWidth={2.6} />
        <text x={618} y={44} textAnchor="end" fontStyle="italic" fontSize={15} fill="#075985">
          u(·) concave
        </text>
        {/* points bas / haut de la loterie */}
        <line x1={160} y1={290} x2={160} y2={238} stroke="#7c3aed" strokeDasharray="4 4" />
        <circle cx={160} cy={238} r={5} fill="#7c3aed" />
        <text x={160} y={308} textAnchor="middle" fontSize={12} fill="#7c3aed">
          mauvaise année
        </text>
        <line x1={560} y1={290} x2={560} y2={62} stroke="#7c3aed" strokeDasharray="4 4" />
        <circle cx={560} cy={62} r={5} fill="#7c3aed" />
        <text x={560} y={308} textAnchor="middle" fontSize={12} fill="#7c3aed">
          bonne année
        </text>
        {/* corde = utilité espérée */}
        <line x1={160} y1={238} x2={560} y2={62} stroke="#7c3aed" strokeWidth={1.8} strokeDasharray="7 5" />
        <circle cx={360} cy={150} r={5.5} fill="#7c3aed" />
        <text x={372} y={168} fontSize={12.5} fill="#7c3aed">
          utilité espérée du revenu risqué
        </text>
        {/* même revenu, mais certain */}
        <line x1={360} y1={290} x2={360} y2={103} stroke="#047857" strokeDasharray="4 4" />
        <circle cx={360} cy={103} r={5.5} fill="#047857" />
        <text x={372} y={98} fontSize={12.5} fill="#047857">
          utilité du même revenu, mais certain
        </text>
        <text x={360} y={308} textAnchor="middle" fontSize={12} fill="#1c1917">
          revenu moyen
        </text>
        <path d="M348 150 L348 108" stroke="#be123c" strokeWidth={2.2} markerEnd={`url(#${arrow})`} />
        <text x={338} y={132} textAnchor="end" fontSize={12.5} fontWeight={600} fill="#9f1239">
          l'écart = le coût du risque
        </text>
      </svg>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
        Schéma qualitatif (courbe illustrative, pas à l'échelle d'une fonction précise). À revenu
        moyen égal, la version <em>certaine</em> donne plus d'utilité que la version{" "}
        <em>risquée</em> : c'est la définition graphique de l'aversion au risque. L'écart rouge
        est ce que l'agent « facture » pour accepter le risque.
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
        Progression : {done.size} / {items.length}
        {done.size === items.length ? " — chapitre bouclé ! 🏆" : ""}
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
      "Relis les cartes de vocabulaire du §1 et refais l'exercice mental « qui est principal, qui est agent ? » sur 3 exemples de ton quotidien.",
  },
  {
    label: "§2 — Le modèle",
    target: "sec-modele",
    quizIds: ["q3", "q4"],
    advice:
      "Réécris les 4 ingrédients du modèle sur papier, de mémoire (§2), en expliquant chaque hypothèse à voix haute.",
  },
  {
    label: "§3 — Cas 1 (salaire fixe)",
    target: "sec-cas1",
    quizIds: ["q5"],
    advice:
      "Refais la résolution du Cas 1 (§3) : le point clé est que la dérivée de α par rapport à e est nulle.",
  },
  {
    label: "§4 — Cas 2 (salaire proportionnel)",
    target: "sec-cas2",
    quizIds: ["q6", "q7"],
    advice:
      "Retravaille le §4 : la CPO de l'agent (e* = β), celle du principal (β* = ½), et surtout la notion de compatibilité aux incitants. Rejoue le préréglage « mirage Pareto » dans le laboratoire.",
  },
  {
    label: "§5 — Cas 3 (salaire linéaire)",
    target: "sec-cas3",
    quizIds: ["q8", "q9"],
    advice:
      "Le cœur du chapitre : reprends la recette CP saturée → substitution → CI → CPO du §5, puis refais l'exercice 2 sans regarder la solution.",
  },
  {
    label: "§6 — Vue d'ensemble",
    target: "sec-recap",
    quizIds: ["q10"],
    advice:
      "Reconstruis le tableau récapitulatif de tête (§6) et vérifie ligne par ligne. Attention au transfert de risque : qui touche 0,5 quoi qu'il arrive ?",
  },
  {
    label: "§7 — Agent averse au risque",
    target: "sec-risque",
    quizIds: ["q11", "q12"],
    advice:
      "Relis le §7 : l'arbitrage incitants/risque et la phrase de conclusion sur le coût de l'information imparfaite.",
  },
];

export function QuizDiagnostic() {
  const [analyzed, setAnalyzed] = useState(false);
  const progress = useProgress();
  const results = progress.quiz["b2"] ?? {};

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
              Tu n'as encore répondu à aucun quiz. Parcours le chapitre et réponds aux « Vérifie
              ta compréhension », puis reviens ici.
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
                  <strong>{r.label}</strong> — quiz non tenté. Impossible de te diagnostiquer :
                  va répondre aux questions de cette section !{" "}
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
