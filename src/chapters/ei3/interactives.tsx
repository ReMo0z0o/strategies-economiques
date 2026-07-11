/*
 * Chapitre EI3 — Les comportements de monopole : composants interactifs.
 *
 * Tous les widgets reprennent les nombres exacts des slides du cours :
 *  - DemandExplorer       : les demandes de L et S + le benchmark du monopole simple (p = 6)
 *  - FirstDegreeExplorer  : le lot « à prendre ou à laisser » qui extrait tout le surplus
 *  - MenuLotsExplorer     : le menu de lots du 2e degré, curseur sur yS (optimum yS = 4)
 *  - SurplusComparison    : profit / surplus / perte sèche selon le régime (54-27-27, 108-0-0, 96-8-4)
 *  - ElasticityExplorer   : p = k/(1 − 1/ε) sur deux marchés (3e degré)
 *  - TwoPartExplorer      : tarif en deux parties F + p·y (optimum p = Cm)
 *  - DoubleMarginExplorer : chaîne Amont → Aval vs monopole fusionné
 *  - ChecklistMaitrise    : la checklist de fin de chapitre
 */

import { useState, type ReactNode } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { M } from "@/components/course/Math";
import {
  ChoiceChips,
  InteractiveCard,
  SliderControl,
} from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers communs                                                     */
/* ------------------------------------------------------------------ */

/** format « à la française », au plus `dec` décimales */
function fmt(v: number, dec = 1): string {
  const r = Math.round(v * 100) / 100;
  return r.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec,
  });
}

function fmtE(v: number): string {
  return `${fmt(v)} €`;
}

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

const AXIS = "#78716c";
const TXT = "#57534e";
const C_L = "#0284c7"; // consommateur L (bleu)
const FILL_L = "rgba(56, 189, 248, 0.32)";
const C_S = "#d97706"; // consommateur S (ambre)
const FILL_S = "rgba(251, 191, 36, 0.35)";
const C_PROFIT = "#e11d48"; // profit du monopole (rose)
const FILL_PROFIT = "rgba(225, 29, 72, 0.16)";
const C_CM = "#16a34a"; // coût marginal (vert)
const FILL_CS = "rgba(5, 150, 105, 0.28)"; // surplus consommateur (émeraude)
const FILL_DWL = "rgba(120, 113, 108, 0.30)"; // perte sèche (gris)
const C_FUSION = "#7c3aed"; // monopole fusionné (violet)

function Axes({
  fr,
  W,
  m,
  xticks,
  yticks,
  xlab,
  ylab,
  base = 0,
}: {
  fr: Frame;
  W: number;
  m: { l: number; r: number; t: number; b: number };
  xticks: number[];
  yticks: number[];
  xlab?: string;
  ylab?: string;
  /** valeur de y où tracer l'axe horizontal (défaut : 0) */
  base?: number;
}) {
  const y0 = fr.Y(base);
  const x0 = fr.X(0);
  return (
    <g>
      <line x1={m.l} y1={y0} x2={W - m.r} y2={y0} stroke={AXIS} strokeWidth={1.3} />
      <line x1={x0} y1={y0} x2={x0} y2={m.t} stroke={AXIS} strokeWidth={1.3} />
      {xticks.map((t) => (
        <g key={`x${t}`}>
          <line x1={fr.X(t)} y1={y0 - 3.5} x2={fr.X(t)} y2={y0 + 3.5} stroke={AXIS} />
          <text x={fr.X(t)} y={y0 + 16} textAnchor="middle" fontSize={11.5} fill={AXIS}>
            {String(t).replace(".", ",")}
          </text>
        </g>
      ))}
      {yticks.map((t) => (
        <g key={`y${t}`}>
          <line x1={x0 - 3.5} y1={fr.Y(t)} x2={x0 + 3.5} y2={fr.Y(t)} stroke={AXIS} />
          <text x={x0 - 7} y={fr.Y(t) + 4} textAnchor="end" fontSize={11.5} fill={AXIS}>
            {String(t).replace(".", ",")}
          </text>
        </g>
      ))}
      {xlab ? (
        <text x={W - m.r} y={y0 + 30} textAnchor="end" fontSize={13} fontStyle="italic" fill={TXT}>
          {xlab}
        </text>
      ) : null}
      {ylab ? (
        <text x={x0} y={m.t - 7} textAnchor="middle" fontSize={13} fontStyle="italic" fill={TXT}>
          {ylab}
        </text>
      ) : null}
    </g>
  );
}

/** petites cartes de lecture des valeurs calculées */
function Stats({
  items,
}: {
  items: Array<{
    value: string;
    label: ReactNode;
    tone?: "rose" | "sky" | "amber" | "emerald" | "violet" | "neutral";
  }>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {items.map((it, i) => (
        <div
          key={i}
          className="min-w-[7rem] flex-1 rounded-xl border bg-muted/40 px-3 py-2 text-center"
        >
          <div
            className={cn(
              "text-lg font-extrabold tabular-nums",
              it.tone === "rose" && "text-rose-700",
              it.tone === "sky" && "text-sky-700",
              it.tone === "amber" && "text-amber-700",
              it.tone === "emerald" && "text-emerald-700",
              it.tone === "violet" && "text-violet-700",
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

/** légende de couleurs sous un graphique */
function Legend({ items }: { items: Array<{ color: string; label: ReactNode }> }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-[3px] border border-black/10"
            style={{ background: it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Les deux demandes + le monopole simple (fil conducteur)          */
/* ------------------------------------------------------------------ */

function DemandPanel({
  title,
  slope,
  p,
  color,
  fill,
}: {
  title: string;
  /** pente de la demande inverse : p = 12 − slope·y */
  slope: number;
  p: number;
  color: string;
  fill: string;
}) {
  const W = 340;
  const H = 230;
  const m = { l: 38, r: 10, t: 20, b: 34 };
  const fr = makeFrame(W, H, m, [0, 13], [0, 13.4]);
  const y = Math.max(0, (12 - p) / slope);
  const x0 = 12 / slope; // intersection de la demande avec l'axe des quantités
  return (
    <div>
      <div className="mb-1 text-center text-[13px] font-bold" style={{ color }}>
        {title}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title}>
        {/* dépense = recette du monopole */}
        {y > 0 && p > 0 ? (
          <rect
            x={fr.X(0)}
            y={fr.Y(p)}
            width={fr.X(y) - fr.X(0)}
            height={fr.Y(0) - fr.Y(p)}
            fill={FILL_PROFIT}
          />
        ) : null}
        {/* surplus du consommateur */}
        {y > 0 ? (
          <polygon
            points={`${fr.X(0)},${fr.Y(p)} ${fr.X(0)},${fr.Y(12)} ${fr.X(y)},${fr.Y(p)}`}
            fill={fill}
          />
        ) : null}
        {/* demande */}
        <line
          x1={fr.X(0)}
          y1={fr.Y(12)}
          x2={fr.X(x0)}
          y2={fr.Y(0)}
          stroke={color}
          strokeWidth={2.4}
        />
        {/* guides pointillés */}
        {y > 0 ? (
          <g stroke={AXIS} strokeDasharray="4 3" strokeWidth={1}>
            <line x1={fr.X(0)} y1={fr.Y(p)} x2={fr.X(y)} y2={fr.Y(p)} />
            <line x1={fr.X(y)} y1={fr.Y(p)} x2={fr.X(y)} y2={fr.Y(0)} />
          </g>
        ) : null}
        <Axes
          fr={fr}
          W={W}
          m={m}
          xticks={slope === 1 ? [6, 12] : [3, 6]}
          yticks={[6, 12]}
          xlab={slope === 1 ? "yL" : "yS"}
          ylab="€"
        />
        {/* étiquette du prix */}
        <text x={fr.X(0) + 5} y={fr.Y(p) - 5} fontSize={12} fontWeight={700} fill={C_PROFIT}>
          p = {fmt(p)}
        </text>
      </svg>
    </div>
  );
}

export function DemandExplorer() {
  const [p, setP] = useState(6);
  const yL = Math.max(0, 12 - p);
  const yS = Math.max(0, 6 - p / 2);
  const Y = yL + yS;
  const recette = p * Y; // Cm = 0 → recette = profit
  const cs = ((12 - p) * yL) / 2 + (yS > 0 ? ((12 - p) * yS) / 2 : 0);
  const atOptimum = Math.abs(p - 6) < 0.001;
  return (
    <InteractiveCard
      title="Les demandes de L et S face à un prix unique"
      subtitle="Le monopole simple doit choisir UN prix pour tout le monde. Déplace p et observe qui achète quoi."
      controls={
        <SliderControl
          label={
            <>
              Prix unique <M tex="p" />
            </>
          }
          value={p}
          onChange={setP}
          min={0}
          max={12}
          step={0.5}
          format={(v) => `${fmt(v)} €`}
        />
      }
      footer={
        <>
          le profit <M tex="p \times Y" /> culmine exactement en <M tex="p = 6" /> :
          9 unités vendues (6 à L, 3 à S), profit 54 €, surplus des consommateurs 27 €.
          Mais 9 unités « gratuites à produire » restent invendues : c'est l'inefficacité
          du monopole simple, que la discrimination va corriger.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <DemandPanel title="Consommateur L (large) : p = 12 − yL" slope={1} p={p} color={C_L} fill={FILL_L} />
        <DemandPanel title="Consommateur S (small) : p = 12 − 2·yS" slope={2} p={p} color={C_S} fill={FILL_S} />
      </div>
      <Legend
        items={[
          { color: FILL_PROFIT, label: "recette du monopole (= profit, car Cm = 0)" },
          { color: FILL_L, label: "surplus de L" },
          { color: FILL_S, label: "surplus de S" },
        ]}
      />
      <Stats
        items={[
          { value: fmt(yL), label: <>achats de L (yL = 12 − p)</>, tone: "sky" },
          { value: fmt(yS), label: <>achats de S (yS = 6 − p/2)</>, tone: "amber" },
          { value: fmt(Y), label: <>quantité totale Y</> },
          { value: fmtE(recette), label: <>profit du monopole</>, tone: "rose" },
          { value: fmtE(cs), label: <>surplus des consommateurs</>, tone: "emerald" },
        ]}
      />
      <div
        className={cn(
          "mt-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
          atOptimum
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : "border-border bg-muted/50 text-foreground/85",
        )}
      >
        {atOptimum ? (
          <>
            <strong>Tu es à l'optimum du monopole simple !</strong> Rm = Cm donne Y = 9, donc
            p = 6, profit = 54 €. Retiens ce trio (6 ; 9 ; 54) : c'est le point de comparaison
            de tout le chapitre.
          </>
        ) : (
          <>
            Profit actuel : <strong>{fmtE(recette)}</strong> — contre 54 € au meilleur prix
            unique. {p < 6 ? "Prix trop bas : tu vends beaucoup mais tu brades." : "Prix trop haut : tu marges fort mais tu perds trop de clients (S décroche vite !)."}
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Discrimination du 1er degré : le lot qui extrait tout            */
/* ------------------------------------------------------------------ */

export function FirstDegreeExplorer() {
  const [who, setWho] = useState<"L" | "S">("L");
  const [q, setQ] = useState(6);
  const slope = who === "L" ? 1 : 2;
  const qmax = 12 / slope; // 12 pour L, 6 pour S
  const ql = Math.min(q, qmax);
  const surplusBrut = 12 * ql - (slope * ql * ql) / 2; // aire sous la demande jusqu'à ql
  const triangleTotal = who === "L" ? 72 : 36;
  const color = who === "L" ? C_L : C_S;
  const fill = who === "L" ? FILL_L : FILL_S;

  const W = 420;
  const H = 250;
  const m = { l: 40, r: 12, t: 20, b: 36 };
  const fr = makeFrame(W, H, m, [0, 13], [0, 13.4]);
  const pAtQ = 12 - slope * ql;

  return (
    <InteractiveCard
      title="Concevoir l'offre « à prendre ou à laisser » du 1er degré"
      subtitle="Choisis la taille du lot : le montant maximal que le client accepte de payer est TOUTE l'aire sous sa demande."
      controls={
        <>
          <ChoiceChips
            label="Client visé"
            value={who}
            onChange={(v) => {
              setWho(v);
              setQ((prev) => Math.min(prev, v === "L" ? 12 : 6));
            }}
            options={[
              { value: "L", label: "L (gros)" },
              { value: "S", label: "S (petit)" },
            ]}
          />
          <SliderControl
            label={
              <>
                Taille du lot <M tex={who === "L" ? "y_l" : "y_s"} />
              </>
            }
            value={ql}
            onChange={setQ}
            min={0}
            max={qmax}
            step={0.5}
            format={(v) => `${fmt(v)} unités`}
          />
        </>
      }
      footer={
        <>
          l'aire colorée grandit tant que tu augmentes la taille du lot : le monopole pousse
          donc jusqu'au bout de la demande. Optimum : <strong>12 unités pour 72 € à L</strong> et{" "}
          <strong>6 unités pour 36 € à S</strong>, soit 108 € de profit — et un surplus net nul
          pour les deux clients.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Surplus brut extrait par le lot">
        {ql > 0 ? (
          <polygon
            points={`${fr.X(0)},${fr.Y(0)} ${fr.X(0)},${fr.Y(12)} ${fr.X(ql)},${fr.Y(pAtQ)} ${fr.X(ql)},${fr.Y(0)}`}
            fill={fill}
          />
        ) : null}
        <line x1={fr.X(0)} y1={fr.Y(12)} x2={fr.X(12 / slope)} y2={fr.Y(0)} stroke={color} strokeWidth={2.4} />
        {ql > 0 && ql < qmax ? (
          <line
            x1={fr.X(ql)}
            y1={fr.Y(0)}
            x2={fr.X(ql)}
            y2={fr.Y(pAtQ)}
            stroke={AXIS}
            strokeDasharray="4 3"
          />
        ) : null}
        <Axes
          fr={fr}
          W={W}
          m={m}
          xticks={who === "L" ? [6, 12] : [3, 6]}
          yticks={[6, 12]}
          xlab={who === "L" ? "yL" : "yS"}
          ylab="€"
        />
        <text x={fr.X(ql > 2 ? ql / 2 : 1.4)} y={fr.Y(3.4)} textAnchor="middle" fontSize={13} fontWeight={700} fill={TXT}>
          {fmtE(surplusBrut)}
        </text>
      </svg>
      <Stats
        items={[
          {
            value: fmt(ql),
            label: <>unités dans le lot</>,
            tone: who === "L" ? "sky" : "amber",
          },
          {
            value: fmtE(surplusBrut),
            label: (
              <>
                montant maximal du lot <M tex={who === "L" ? "m_l" : "m_s"} /> (= surplus brut)
              </>
            ),
            tone: "rose",
          },
          {
            value: `${fmt((surplusBrut / triangleTotal) * 100, 0)} %`,
            label: <>du surplus potentiel ({triangleTotal} €) déjà capturé</>,
          },
        ]}
      />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Le menu de lots du 2e degré (curseur yS)                         */
/* ------------------------------------------------------------------ */

export function MenuLotsExplorer() {
  const [yS, setYS] = useState(6);
  const mS = 12 * yS - yS * yS; // participation de S saturée
  const mL = 72 - (yS * yS) / 2; // contrainte d'incitation de L saturée
  const profit = mL + mS; // = 72 + 12yS − 1,5yS²
  const rente = (yS * yS) / 2; // surplus laissé à L
  const atOpt = Math.abs(yS - 4) < 0.001;

  const W = 480;
  const H = 260;
  const m = { l: 46, r: 14, t: 22, b: 38 };
  const fr = makeFrame(W, H, m, [0, 6.4], [60, 102]);
  const f = (y: number) => 72 + 12 * y - 1.5 * y * y;
  let path = "";
  for (let i = 0; i <= 96; i++) {
    const x = (6 * i) / 96;
    path += (i ? "L" : "M") + fr.X(x).toFixed(1) + " " + fr.Y(f(x)).toFixed(1) + " ";
  }

  return (
    <InteractiveCard
      title="Le menu de lots : combien mettre dans le petit lot ?"
      subtitle="Le lot l garde 12 unités. Toi, tu choisis yS, la taille du lot s — les montants mS et mL s'ajustent automatiquement (participation de S et incitation de L saturées)."
      controls={
        <SliderControl
          label={
            <>
              Quantité du petit lot <M tex="y_S" />
            </>
          }
          value={yS}
          onChange={setYS}
          min={0}
          max={6}
          step={0.25}
          format={(v) => `${fmt(v)} unités`}
        />
      }
      footer={
        <>
          deux forces s'affrontent : un lot s plus gros rapporte plus sur S (
          <M tex="m_S = 12y_S - y_S^2" /> augmente), mais gonfle la « rente d'information »{" "}
          <M tex="y_S^2/2" /> qu'il faut abandonner à L. Le sommet de la courbe est en{" "}
          <M tex="y_S = 4" /> : lot s = 4 unités pour 32 €, lot l = 12 unités pour 64 €,
          profit 96 €. En <M tex="y_S = 6" />, tu retrouves la « solution naïve améliorée »
          (90 €) ; en <M tex="y_S = 0" />, tu ne sers plus que L (72 €).
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Profit selon la taille du petit lot">
        {/* optimum en pointillés */}
        <g stroke={AXIS} strokeDasharray="4 3" strokeWidth={1}>
          <line x1={fr.X(4)} y1={fr.Y(60)} x2={fr.X(4)} y2={fr.Y(96)} />
          <line x1={fr.X(0)} y1={fr.Y(96)} x2={fr.X(4)} y2={fr.Y(96)} />
        </g>
        <path d={path} fill="none" stroke={C_PROFIT} strokeWidth={2.6} />
        <circle cx={fr.X(4)} cy={fr.Y(96)} r={4} fill="none" stroke={C_PROFIT} strokeWidth={1.6} />
        <circle cx={fr.X(yS)} cy={fr.Y(f(yS))} r={6} fill={C_PROFIT} />
        <text x={fr.X(4)} y={fr.Y(96) - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill={C_PROFIT}>
          optimum (4 ; 96 €)
        </text>
        <Axes
          fr={fr}
          W={W}
          m={m}
          xticks={[0, 2, 4, 6]}
          yticks={[60, 72, 90, 96]}
          xlab="yS"
          ylab="profit (€)"
          base={60}
        />
      </svg>
      <Stats
        items={[
          { value: `${fmt(yS)} u. → ${fmtE(mS)}`, label: <>lot s (choisi par S)</>, tone: "amber" },
          { value: `12 u. → ${fmtE(mL)}`, label: <>lot l (choisi par L)</>, tone: "sky" },
          { value: fmtE(profit), label: <>profit du monopole</>, tone: "rose" },
          { value: fmtE(rente), label: <>rente d'information laissée à L</>, tone: "emerald" },
        ]}
      />
      <div
        className={cn(
          "mt-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
          atOpt
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : "border-border bg-muted/50 text-foreground/85",
        )}
      >
        {atOpt ? (
          <>
            <strong>Optimum atteint :</strong> −3yS + 12 = 0 donne yS = 4. Le petit lot est
            volontairement rationné (4 au lieu de 6) pour dégoûter L de le prendre — et L ne
            garde que 8 € de rente au lieu de 18 €.
          </>
        ) : (
          <>
            Profit : <strong>{fmtE(profit)}</strong> (maximum : 96 €).{" "}
            {yS > 4
              ? "Le lot s est trop généreux : il attire trop L, et la rente à lui concéder te coûte cher."
              : "Le lot s est trop rationné : tu laisses filer du chiffre d'affaires sur S pour économiser une rente déjà faible."}
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Profit / surplus / perte sèche selon le régime                   */
/* ------------------------------------------------------------------ */

type RegimeId = "simple" | "premier" | "deuxieme";

const REGIMES: Array<{
  id: RegimeId;
  label: string;
  profit: number;
  cs: number;
  dwl: number;
  msg: ReactNode;
}> = [
  {
    id: "simple",
    label: "Monopole simple",
    profit: 54,
    cs: 27,
    dwl: 27,
    msg: (
      <>
        <strong>Prix unique p = 6.</strong> Le monopole gagne 54 €, les consommateurs gardent
        27 € de surplus… mais 27 € de gains à l'échange sont purement détruits : 9 unités à
        coût nul ne sont pas produites. C'est la perte sèche du monopole simple.
      </>
    ),
  },
  {
    id: "premier",
    label: "1er degré (parfaite)",
    profit: 108,
    cs: 0,
    dwl: 0,
    msg: (
      <>
        <strong>Offres personnalisées (12 u. pour 72 € ; 6 u. pour 36 €).</strong> Plus aucune
        perte sèche : les 18 unités sont produites, le surplus total atteint son maximum de
        108 €. Mais le monopole rafle <em>tout</em> : zéro surplus pour les consommateurs.
      </>
    ),
  },
  {
    id: "deuxieme",
    label: "2e degré (menu de lots)",
    profit: 96,
    cs: 8,
    dwl: 4,
    msg: (
      <>
        <strong>Menu en libre choix (12 u. pour 64 € ; 4 u. pour 32 €).</strong> Entre les
        deux : le monopole gagne 96 €, L conserve une rente de 8 €, et le rationnement du
        petit lot (4 au lieu de 6) détruit 4 € de surplus. Moins efficace que le 1er degré,
        mais plus favorable aux consommateurs.
      </>
    ),
  },
];

export function SurplusComparison() {
  const [sel, setSel] = useState<RegimeId>("simple");
  const TOTAL = 108;
  const current = REGIMES.find((r) => r.id === sel)!;
  return (
    <InteractiveCard
      title="Qui capte le gâteau de 108 € ?"
      subtitle="Le surplus total potentiel de notre exemple vaut 108 € (72 € chez L + 36 € chez S). Compare comment chaque régime le découpe."
      controls={
        <ChoiceChips
          label="Régime de tarification"
          value={sel}
          onChange={setSel}
          options={REGIMES.map((r) => ({ value: r.id, label: r.label }))}
        />
      }
      footer={
        <>
          plus le monopole discrimine finement, plus le gâteau produit est grand (la perte
          sèche fond)… et plus la part des consommateurs fond aussi. Efficacité et partage
          sont deux questions différentes — d'où l'idée de taxer puis redistribuer.
        </>
      }
    >
      <div className="space-y-2.5">
        {REGIMES.map((r) => (
          <div
            key={r.id}
            className={cn(
              "rounded-xl border p-2.5 transition-opacity",
              sel === r.id ? "border-primary/50 bg-accent/40" : "opacity-60",
            )}
          >
            <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
              <span className="font-bold">{r.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {r.profit} € + {r.cs} € + {r.dwl} € perdus
              </span>
            </div>
            <div className="flex h-6 w-full overflow-hidden rounded-full border bg-background">
              <div
                className="h-full bg-rose-500/85 transition-all duration-500"
                style={{ width: `${(r.profit / TOTAL) * 100}%` }}
                title={`Profit : ${r.profit} €`}
              />
              <div
                className="h-full bg-emerald-500/85 transition-all duration-500"
                style={{ width: `${(r.cs / TOTAL) * 100}%` }}
                title={`Surplus consommateurs : ${r.cs} €`}
              />
              <div
                className="h-full bg-stone-400/60 transition-all duration-500"
                style={{ width: `${(r.dwl / TOTAL) * 100}%` }}
                title={`Perte sèche : ${r.dwl} €`}
              />
            </div>
          </div>
        ))}
      </div>
      <Legend
        items={[
          { color: "rgba(244,63,94,.85)", label: "profit du monopole" },
          { color: "rgba(16,185,129,.85)", label: "surplus des consommateurs" },
          { color: "rgba(168,162,158,.6)", label: "perte sèche (surplus détruit)" },
        ]}
      />
      <div className="mt-3 rounded-xl border bg-muted/50 px-4 py-3 text-[14px] leading-relaxed">
        {current.msg}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 3e degré : élasticités et prix — p = k/(1 − 1/ε)                 */
/* ------------------------------------------------------------------ */

export function ElasticityExplorer() {
  const [k, setK] = useState(4);
  const [e1, setE1] = useState(3);
  const [e2, setE2] = useState(1.5);
  const p1 = k / (1 - 1 / e1);
  const p2 = k / (1 - 1 / e2);

  const W = 460;
  const H = 250;
  const m = { l: 46, r: 14, t: 24, b: 40 };
  const pmax = Math.max(p1, p2) * 1.18;
  const fr = makeFrame(W, H, m, [0, 10], [0, pmax]);
  const barW = 80;
  const x1 = fr.X(3) - barW / 2;
  const x2 = fr.X(7) - barW / 2;

  return (
    <InteractiveCard
      title="3e degré : quel groupe paie le plus cher ?"
      subtitle="Deux groupes identifiables, un même coût marginal k. Le prix optimal sur chaque marché suit la règle du monopole : p = k / (1 − 1/ε)."
      controls={
        <>
          <SliderControl
            label={
              <>
                Coût marginal <M tex="k" />
              </>
            }
            value={k}
            onChange={setK}
            min={2}
            max={6}
            step={0.5}
            format={(v) => `${fmt(v)} €`}
          />
          <SliderControl
            label={
              <>
                Élasticité groupe 1 <M tex="\varepsilon_1" />
              </>
            }
            value={e1}
            onChange={setE1}
            min={1.2}
            max={5}
            step={0.1}
            format={(v) => fmt(v)}
          />
          <SliderControl
            label={
              <>
                Élasticité groupe 2 <M tex="\varepsilon_2" />
              </>
            }
            value={e2}
            onChange={setE2}
            min={1.2}
            max={5}
            step={0.1}
            format={(v) => fmt(v)}
          />
        </>
      }
      footer={
        <>
          le groupe le <strong>moins élastique</strong> (celui qui réagit le moins au prix)
          paie systématiquement le plus cher — et quand une élasticité s'approche de 1, son
          prix s'envole. Les recettes marginales, elles, restent égales à <M tex="k" /> sur
          les deux marchés.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Prix optimaux des deux groupes">
        {/* ligne du coût marginal */}
        <line
          x1={m.l}
          y1={fr.Y(k)}
          x2={W - m.r}
          y2={fr.Y(k)}
          stroke={C_CM}
          strokeWidth={1.8}
          strokeDasharray="6 4"
        />
        <text x={W - m.r} y={fr.Y(k) - 6} textAnchor="end" fontSize={12} fontWeight={700} fill={C_CM}>
          Cm = {fmt(k)} €
        </text>
        {/* barres */}
        <rect x={x1} y={fr.Y(p1)} width={barW} height={fr.Y(0) - fr.Y(p1)} fill={FILL_L} stroke={C_L} strokeWidth={1.6} rx={6} />
        <rect x={x2} y={fr.Y(p2)} width={barW} height={fr.Y(0) - fr.Y(p2)} fill={FILL_S} stroke={C_S} strokeWidth={1.6} rx={6} />
        <text x={x1 + barW / 2} y={fr.Y(p1) - 8} textAnchor="middle" fontSize={13.5} fontWeight={800} fill={C_L}>
          {fmtE(p1)}
        </text>
        <text x={x2 + barW / 2} y={fr.Y(p2) - 8} textAnchor="middle" fontSize={13.5} fontWeight={800} fill={C_S}>
          {fmtE(p2)}
        </text>
        <text x={x1 + barW / 2} y={fr.Y(0) + 18} textAnchor="middle" fontSize={12.5} fill={TXT}>
          groupe 1 (ε = {fmt(e1)})
        </text>
        <text x={x2 + barW / 2} y={fr.Y(0) + 18} textAnchor="middle" fontSize={12.5} fill={TXT}>
          groupe 2 (ε = {fmt(e2)})
        </text>
        <line x1={m.l} y1={fr.Y(0)} x2={W - m.r} y2={fr.Y(0)} stroke={AXIS} strokeWidth={1.3} />
      </svg>
      <div className="mt-3 rounded-xl border bg-muted/50 px-4 py-3 text-[14px] leading-relaxed">
        {Math.abs(e1 - e2) < 0.001 ? (
          <>
            Élasticités identiques → prix identiques : sans différence de sensibilité au prix,
            la discrimination du 3e degré ne rapporte rien.
          </>
        ) : e1 > e2 ? (
          <>
            <M tex="\varepsilon_1 > \varepsilon_2" /> : le groupe 1 est le plus réactif au
            prix, il obtient le prix bas ({fmtE(p1)}). Le groupe 2, plus « captif », paie{" "}
            {fmtE(p2)}.
          </>
        ) : (
          <>
            <M tex="\varepsilon_2 > \varepsilon_1" /> : cette fois c'est le groupe 2 le plus
            réactif — il obtient le prix bas ({fmtE(p2)}), et le groupe 1 paie {fmtE(p1)}.
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Le tarif en deux parties F + p·y                                 */
/* ------------------------------------------------------------------ */

export function TwoPartExplorer() {
  const [p, setP] = useState(8);
  const CM = 4;
  const y = 12 - p;
  const F = ((12 - p) * y) / 2; // surplus hors forfait = forfait maximal
  const SP = (p - CM) * y; // profit des ventes
  const total = F + SP;
  const lost = ((p - CM) * (p - CM)) / 2; // triangle non créé
  const atOpt = Math.abs(p - CM) < 0.001;

  const W = 480;
  const H = 265;
  const m = { l: 42, r: 14, t: 20, b: 38 };
  const fr = makeFrame(W, H, m, [0, 13], [0, 13.4]);

  return (
    <InteractiveCard
      title="Tarif en deux parties : où placer le prix unitaire ?"
      subtitle="Demande p(y) = 12 − y, coût marginal Cm = 4. Le forfait F s'ajuste toujours au surplus hors forfait du client (F = SC). À toi de choisir p."
      controls={
        <SliderControl
          label={
            <>
              Prix unitaire <M tex="p" />
            </>
          }
          value={p}
          onChange={setP}
          min={4}
          max={12}
          step={0.5}
          format={(v) => `${fmt(v)} €`}
        />
      }
      footer={
        <>
          chaque euro de marge au-dessus de Cm <em>réduit</em> le profit total : la marge sur
          les ventes gagne moins que ce que le forfait perd (et un triangle de surplus n'est
          même plus créé). Optimum : <M tex="p = Cm" /> et <M tex="F" /> = tout le surplus
          (32 € ici) — la solution est efficace, mais le client repart avec zéro.
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Décomposition du profit du tarif en deux parties">
        {/* forfait = surplus hors forfait */}
        {y > 0 ? (
          <polygon
            points={`${fr.X(0)},${fr.Y(p)} ${fr.X(0)},${fr.Y(12)} ${fr.X(y)},${fr.Y(p)}`}
            fill={FILL_CS}
          />
        ) : null}
        {/* profit des ventes */}
        {p > CM && y > 0 ? (
          <rect
            x={fr.X(0)}
            y={fr.Y(p)}
            width={fr.X(y) - fr.X(0)}
            height={fr.Y(CM) - fr.Y(p)}
            fill={FILL_L}
          />
        ) : null}
        {/* surplus non créé */}
        {p > CM ? (
          <polygon
            points={`${fr.X(y)},${fr.Y(p)} ${fr.X(12 - CM)},${fr.Y(CM)} ${fr.X(y)},${fr.Y(CM)}`}
            fill={FILL_DWL}
          />
        ) : null}
        {/* demande et coût marginal */}
        <line x1={fr.X(0)} y1={fr.Y(12)} x2={fr.X(12)} y2={fr.Y(0)} stroke={TXT} strokeWidth={2.2} />
        <line x1={fr.X(0)} y1={fr.Y(CM)} x2={fr.X(12.6)} y2={fr.Y(CM)} stroke={C_CM} strokeWidth={2} />
        <text x={fr.X(12.6)} y={fr.Y(CM) - 6} textAnchor="end" fontSize={12} fontWeight={700} fill={C_CM}>
          Cm = 4
        </text>
        {/* prix */}
        {p > CM ? (
          <g stroke={AXIS} strokeDasharray="4 3" strokeWidth={1}>
            <line x1={fr.X(0)} y1={fr.Y(p)} x2={fr.X(y)} y2={fr.Y(p)} />
            <line x1={fr.X(y)} y1={fr.Y(p)} x2={fr.X(y)} y2={fr.Y(0)} />
          </g>
        ) : null}
        <text x={fr.X(0) + 5} y={fr.Y(p) - 5} fontSize={12} fontWeight={700} fill={C_PROFIT}>
          p = {fmt(p)}
        </text>
        <Axes fr={fr} W={W} m={m} xticks={[4, 8, 12]} yticks={[4, 8, 12]} xlab="y" ylab="€" />
      </svg>
      <Legend
        items={[
          { color: FILL_CS, label: "forfait F (= surplus hors forfait du client)" },
          { color: FILL_L, label: "profit des ventes (p − Cm) × y" },
          { color: FILL_DWL, label: "surplus non créé (perdu pour tout le monde)" },
        ]}
      />
      <Stats
        items={[
          { value: fmt(y), label: <>unités achetées (y = 12 − p)</> },
          { value: fmtE(F), label: <>forfait F</>, tone: "emerald" },
          { value: fmtE(SP), label: <>profit des ventes</>, tone: "sky" },
          { value: fmtE(total), label: <>profit total F + (p − Cm)·y</>, tone: "rose" },
          { value: fmtE(lost), label: <>surplus détruit</> },
        ]}
      />
      <div
        className={cn(
          "mt-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
          atOpt
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : "border-border bg-muted/50 text-foreground/85",
        )}
      >
        {atOpt ? (
          <>
            <strong>Optimum : p = Cm = 4.</strong> Plus aucune marge sur les unités, mais un
            forfait de 32 € qui capte l'intégralité du surplus. Impossible de faire mieux : le
            gâteau est à sa taille maximale et le monopole le prend en entier.
          </>
        ) : (
          <>
            Profit total : <strong>{fmtE(total)}</strong> — contre 32 € en fixant p = Cm.
            Baisse encore le prix unitaire : le forfait récupérera plus que ce que la marge
            abandonne.
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 7. La double marginalisation : chaîne vs fusion                     */
/* ------------------------------------------------------------------ */

export function DoubleMarginExplorer() {
  const [pam, setPam] = useState(8);
  const y = (12 - pam) / 2; // réaction optimale d'Aval
  const pav = 12 - y; // prix final
  const piAm = (pam - 4) * y;
  const piAv = y * y; // (12 − y − pam)·y = y²
  const totalChain = piAm + piAv;
  const csChain = (y * y) / 2;
  const atOpt = Math.abs(pam - 8) < 0.001;

  const W = 460;
  const H = 260;
  const m = { l: 42, r: 14, t: 20, b: 38 };
  const fr = makeFrame(W, H, m, [0, 13], [0, 13.4]);

  // mini-graphe des profits
  const BW = 460;
  const BH = 170;
  const bm = { l: 42, r: 14, t: 26, b: 30 };
  const bfr = makeFrame(BW, BH, bm, [0, 10], [0, 20]);
  const barW = 90;
  const bx1 = bfr.X(3) - barW / 2;
  const bx2 = bfr.X(7) - barW / 2;

  return (
    <InteractiveCard
      title="Chaîne de monopoles ou monopole fusionné ?"
      subtitle="Amont produit à Cm = 4 et vend à Aval au prix p_am ; Aval revend aux consommateurs (demande y = 12 − p). Choisis le prix de gros — Aval réagit toujours au mieux."
      controls={
        <SliderControl
          label={
            <>
              Prix de gros <M tex="p_{am}" />
            </>
          }
          value={pam}
          onChange={setPam}
          min={4}
          max={12}
          step={0.5}
          format={(v) => `${fmt(v)} €`}
        />
      }
      footer={
        <>
          le mieux qu'Amont puisse faire seul est <M tex="p_{am} = 8" /> : la chaîne vend
          alors 2 unités à 10 € et gagne 8 + 4 = 12 €. Le monopole fusionné vend 4 unités à
          8 € et gagne 16 €. Prix plus bas, quantités doublées, profit plus haut : la fusion
          <em> verticale</em> arrange tout le monde. (Et remarque : en <M tex="p_{am} = 4" />{" "}
          — vente à prix coûtant — la chaîne retrouve exactement le résultat fusionné… mais
          tout le profit va à Aval : il faut alors une franchise pour le partager.)
        </>
      }
    >
      <div className="mb-1 text-center text-[13px] font-bold text-foreground/80">
        Le marché final : qui met quelle marge ?
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Prix de la chaîne verticale sur le marché final">
        {/* demande finale */}
        <line x1={fr.X(0)} y1={fr.Y(12)} x2={fr.X(12)} y2={fr.Y(0)} stroke={TXT} strokeWidth={2.2} />
        {/* coût marginal d'Amont */}
        <line x1={fr.X(0)} y1={fr.Y(4)} x2={fr.X(12.6)} y2={fr.Y(4)} stroke={C_CM} strokeWidth={2} />
        <text x={fr.X(12.6)} y={fr.Y(4) + 14} textAnchor="end" fontSize={12} fontWeight={700} fill={C_CM}>
          Cm Amont = 4
        </text>
        {/* prix de gros */}
        <line
          x1={fr.X(0)}
          y1={fr.Y(pam)}
          x2={fr.X(12.6)}
          y2={fr.Y(pam)}
          stroke={C_S}
          strokeWidth={1.8}
          strokeDasharray="6 4"
        />
        <text x={fr.X(12.6)} y={fr.Y(pam) - 5} textAnchor="end" fontSize={12} fontWeight={700} fill={C_S}>
          p_am = {fmt(pam)}
        </text>
        {/* prix final + point de la chaîne */}
        {y > 0 ? (
          <g>
            <g stroke={AXIS} strokeDasharray="4 3" strokeWidth={1}>
              <line x1={fr.X(0)} y1={fr.Y(pav)} x2={fr.X(y)} y2={fr.Y(pav)} />
              <line x1={fr.X(y)} y1={fr.Y(pav)} x2={fr.X(y)} y2={fr.Y(0)} />
            </g>
            <circle cx={fr.X(y)} cy={fr.Y(pav)} r={6} fill={C_PROFIT} />
            <text x={fr.X(y) + 10} y={fr.Y(pav) - 8} fontSize={12} fontWeight={700} fill={C_PROFIT}>
              chaîne ({fmt(y)} ; {fmt(pav)})
            </text>
          </g>
        ) : null}
        {/* point du monopole fusionné */}
        <circle cx={fr.X(4)} cy={fr.Y(8)} r={5.5} fill="none" stroke={C_FUSION} strokeWidth={2.2} />
        <text x={fr.X(4) + 9} y={fr.Y(8) + 16} fontSize={12} fontWeight={700} fill={C_FUSION}>
          fusion (4 ; 8)
        </text>
        <Axes fr={fr} W={W} m={m} xticks={[2, 4, 8, 12]} yticks={[4, 8, 12]} xlab="y" ylab="€" />
      </svg>

      <div className="mb-1 mt-4 text-center text-[13px] font-bold text-foreground/80">
        Les profits : deux marges… ou une seule
      </div>
      <svg viewBox={`0 0 ${BW} ${BH}`} className="w-full" role="img" aria-label="Profits de la chaîne et du monopole fusionné">
        {/* chaîne : Amont empilé sur Aval */}
        <rect x={bx1} y={bfr.Y(piAv)} width={barW} height={bfr.Y(0) - bfr.Y(piAv)} fill={FILL_L} stroke={C_L} strokeWidth={1.4} />
        <rect x={bx1} y={bfr.Y(piAv + piAm)} width={barW} height={bfr.Y(piAv) - bfr.Y(piAv + piAm)} fill={FILL_S} stroke={C_S} strokeWidth={1.4} />
        <text x={bx1 + barW / 2} y={bfr.Y(totalChain) - 7} textAnchor="middle" fontSize={13} fontWeight={800} fill={TXT}>
          {fmtE(totalChain)}
        </text>
        <text x={bx1 + barW / 2} y={bfr.Y(0) + 16} textAnchor="middle" fontSize={12.5} fill={TXT}>
          chaîne (Amont + Aval)
        </text>
        {/* fusion */}
        <rect x={bx2} y={bfr.Y(16)} width={barW} height={bfr.Y(0) - bfr.Y(16)} fill="rgba(139,92,246,.28)" stroke={C_FUSION} strokeWidth={1.6} />
        <text x={bx2 + barW / 2} y={bfr.Y(16) - 7} textAnchor="middle" fontSize={13} fontWeight={800} fill={C_FUSION}>
          16 €
        </text>
        <text x={bx2 + barW / 2} y={bfr.Y(0) + 16} textAnchor="middle" fontSize={12.5} fill={TXT}>
          monopole fusionné
        </text>
        <line x1={bm.l} y1={bfr.Y(0)} x2={BW - bm.r} y2={bfr.Y(0)} stroke={AXIS} strokeWidth={1.3} />
        {/* repère 16 € */}
        <line x1={bm.l} y1={bfr.Y(16)} x2={BW - bm.r} y2={bfr.Y(16)} stroke={C_FUSION} strokeDasharray="5 4" strokeWidth={1} opacity={0.6} />
      </svg>
      <Legend
        items={[
          { color: FILL_S, label: "profit d'Amont (p_am − 4) × y" },
          { color: FILL_L, label: "profit d'Aval (p_av − p_am) × y" },
          { color: "rgba(139,92,246,.28)", label: "profit fusionné" },
        ]}
      />
      <Stats
        items={[
          { value: fmt(y), label: <>quantité vendue y</> },
          { value: fmtE(pav), label: <>prix final p_av (fusion : 8 €)</>, tone: "rose" },
          { value: fmtE(piAm), label: <>profit Amont</>, tone: "amber" },
          { value: fmtE(piAv), label: <>profit Aval</>, tone: "sky" },
          { value: fmtE(csChain), label: <>surplus consommateurs (fusion : 8 €)</>, tone: "emerald" },
        ]}
      />
      <div
        className={cn(
          "mt-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
          atOpt ? "border-rose-300 bg-rose-50 text-rose-900" : "border-border bg-muted/50 text-foreground/85",
        )}
      >
        {atOpt ? (
          <>
            <strong>C'est le choix optimal d'Amont</strong> (marge de 4 €)… et pourtant la
            chaîne fait 12 € au lieu de 16 €, avec un prix final de 10 € au lieu de 8 €. Deux
            marges empilées valent moins qu'une : c'est la double marginalisation.
          </>
        ) : (
          <>
            Profit d'Amont : <strong>{fmtE(piAm)}</strong>.{" "}
            {pam < 8
              ? "Une marge plus faible fait grossir le gâteau total, mais Amont en garde moins — seul, il n'a pas intérêt à descendre jusque-là."
              : "Marge trop gourmande : Aval commande si peu que même Amont y perd."}
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Checklist de maîtrise (synthèse)                                 */
/* ------------------------------------------------------------------ */

export function ChecklistMaitrise({ items }: { items: ReactNode[] }) {
  const [done, setDone] = useState<number[]>([]);
  const toggle = (i: number) =>
    setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  const pct = Math.round((done.length / items.length) * 100);
  return (
    <div className="my-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-bold">
          Coche ce que tu sais refaire <em>sans regarder le cours</em>
        </span>
        <span className="text-sm font-bold tabular-nums text-primary">
          {done.length}/{items.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const ok = done.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={ok}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[14.5px] leading-relaxed transition-colors",
                  ok
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                    : "hover:border-primary/40 hover:bg-accent/40",
                )}
              >
                {ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
                )}
                <span>{it}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {pct === 100 ? (
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
          100 % — tu es prêt·e pour l'examen sur ce chapitre. Passe aux exercices pour le
          prouver !
        </p>
      ) : null}
    </div>
  );
}
