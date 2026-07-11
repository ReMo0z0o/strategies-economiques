/**
 * Chapitre EI4 · Les économies de réseau — widgets interactifs.
 * Cinq visualisations SVG fidèles aux graphiques des slides :
 *  1. la ville linéaire du monopole (zone d'achat, demande, profit) ;
 *  2. la demande avec effet de réseau direct et ses équilibres multiples
 *     (cas A v<t / cas B v>t, stabilité, masse critique) ;
 *  3. le tâtonnement des anticipations (amortissement v/t < 1 vs
 *     amplification v/t > 1, slides 21-22) ;
 *  4. la ligne de Hotelling (acheteur indifférent, partage du marché) ;
 *  5. l'effet de l'externalité v sur les prix du duopole (p* = t − v).
 */
import { useState, type ReactNode } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InteractiveCard,
  SliderControl,
  ChoiceChips,
} from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers numériques                                                  */
/* ------------------------------------------------------------------ */

/** Format français : décimales utiles, virgule. */
export function fmt(v: number, d = 2): string {
  if (!Number.isFinite(v)) return "—";
  let s = v.toFixed(d);
  if (d > 0) s = s.replace(/\.?0+$/, "");
  return s.replace(".", ",");
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/* ------------------------------------------------------------------ */
/* Infrastructure de tracé SVG (mêmes idiomes que les autres chapitres) */
/* ------------------------------------------------------------------ */

const SOFT = "#8a8a93";
const GREEN = "#059669";
const RED = "#e11d48";
const BLUE = "#4f46e5";
const GOLD = "#d97706";
const GUIDE = "#a1a1aa";

interface PlotCfg {
  w?: number;
  h?: number;
  pL?: number;
  pR?: number;
  pT?: number;
  pB?: number;
  x: [number, number];
  y: [number, number];
}

interface Plot {
  w: number;
  h: number;
  pL: number;
  pR: number;
  pT: number;
  pB: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  X: (v: number) => number;
  Y: (v: number) => number;
}

function makePlot(cfg: PlotCfg): Plot {
  const w = cfg.w ?? 640;
  const h = cfg.h ?? 360;
  const pL = cfg.pL ?? 52;
  const pR = cfg.pR ?? 16;
  const pT = cfg.pT ?? 20;
  const pB = cfg.pB ?? 42;
  const [x0, x1] = cfg.x;
  const [y0, y1] = cfg.y;
  return {
    w,
    h,
    pL,
    pR,
    pT,
    pB,
    x0,
    x1,
    y0,
    y1,
    X: (v) => pL + ((v - x0) / (x1 - x0)) * (w - pL - pR),
    Y: (v) => h - pB - ((v - y0) / (y1 - y0)) * (h - pT - pB),
  };
}

function Frame({
  p,
  xticks,
  yticks,
  xfmt,
  yfmt,
  xlabel,
  ylabel,
  axisAtZero,
}: {
  p: Plot;
  xticks?: number[];
  yticks?: number[];
  xfmt?: (t: number) => string;
  yfmt?: (t: number) => string;
  xlabel?: string;
  ylabel?: string;
  /** trace l'axe horizontal en y = 0 (utile quand y0 < 0) */
  axisAtZero?: boolean;
}) {
  const xAxisY = axisAtZero && p.y0 < 0 && p.y1 > 0 ? p.Y(0) : p.h - p.pB;
  return (
    <g>
      {(yticks ?? []).map((t) => (
        <g key={`y${t}`}>
          <line
            x1={p.pL}
            y1={p.Y(t)}
            x2={p.w - p.pR}
            y2={p.Y(t)}
            stroke={GUIDE}
            strokeWidth={1}
            opacity={0.3}
          />
          <text x={p.pL - 7} y={p.Y(t) + 4} textAnchor="end" fontSize={11.5} fill={SOFT}>
            {yfmt ? yfmt(t) : String(t)}
          </text>
        </g>
      ))}
      {(xticks ?? []).map((t) => (
        <g key={`x${t}`}>
          <line
            x1={p.X(t)}
            y1={p.h - p.pB}
            x2={p.X(t)}
            y2={p.h - p.pB + 5}
            stroke={SOFT}
            strokeWidth={1.2}
          />
          <text x={p.X(t)} y={p.h - p.pB + 18} textAnchor="middle" fontSize={11.5} fill={SOFT}>
            {xfmt ? xfmt(t) : String(t)}
          </text>
        </g>
      ))}
      <line x1={p.pL} y1={xAxisY} x2={p.w - p.pR} y2={xAxisY} stroke={SOFT} strokeWidth={1.2} />
      <line x1={p.pL} y1={p.pT} x2={p.pL} y2={p.h - p.pB} stroke={SOFT} strokeWidth={1.2} />
      {xlabel ? (
        <text
          x={p.w - p.pR}
          y={p.h - 8}
          textAnchor="end"
          fontSize={11.5}
          fontWeight={600}
          fill={SOFT}
        >
          {xlabel}
        </text>
      ) : null}
      {ylabel ? (
        <text x={p.pL} y={p.pT - 6} textAnchor="start" fontSize={11.5} fontWeight={600} fill={SOFT}>
          {ylabel}
        </text>
      ) : null}
    </g>
  );
}

function PlotSvg({
  p,
  label,
  children,
  maxW = 680,
}: {
  p: Plot;
  label: string;
  children: ReactNode;
  maxW?: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${p.w} ${p.h}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: maxW }}
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

/** Flèche horizontale en coordonnées de données (pour l'instabilité). */
function ArrowH({
  p,
  y,
  from,
  to,
  color,
}: {
  p: Plot;
  y: number;
  from: number;
  to: number;
  color: string;
}) {
  const x1 = p.X(from);
  const x2 = p.X(to);
  const yy = p.Y(y);
  const dir = x2 > x1 ? 1 : -1;
  return (
    <g>
      <line x1={x1} y1={yy} x2={x2 - dir * 6} y2={yy} stroke={color} strokeWidth={2.4} />
      <polygon
        points={`${x2},${yy} ${x2 - dir * 8},${yy - 4.5} ${x2 - dir * 8},${yy + 4.5}`}
        fill={color}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Chips de lecture et message d'interprétation                        */
/* ------------------------------------------------------------------ */

export function ChipRow({
  chips,
}: {
  chips: Array<{ label: ReactNode; value: ReactNode; hi?: boolean }>;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <span
          key={i}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[13px]",
            c.hi
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-card text-muted-foreground",
          )}
        >
          {c.label}{" "}
          <b className={cn("tabular-nums", c.hi ? "" : "text-foreground")}>{c.value}</b>
        </span>
      ))}
    </div>
  );
}

export function WidgetMsg({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-t border-dashed pt-2.5 text-[14px] italic leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/* ================================================================== */
/* 1 · La ville linéaire du monopole (slides 9-11)                     */
/* ================================================================== */

export function WidgetVilleLineaire() {
  const [r, setR] = useState(6);
  const [t, setT] = useState(4);
  const [c, setC] = useState(1);
  const [p, setP] = useState(3);
  const [preset, setPreset] = useState<"libre" | "pm">("libre");

  const pM = (r + c) / 2;
  const price = preset === "pm" ? pM : p;
  const xhat = (r - price) / t;
  const xe = clamp(xhat, 0, 1);
  const y = xe;
  const profit = (price - c) * y;

  const yMin = Math.min(0, r - price - t) - 0.8;
  const yMax = Math.max(r - price, 2) + 0.8;
  const plot = makePlot({ x: [-0.07, 1.15], y: [yMin, yMax], h: 340 });

  const u = (x: number) => r - price - t * x;

  let msg: ReactNode;
  if (price >= r) {
    msg = (
      <>
        Prix trop élevé : même l'acheteur situé juste à côté du vendeur (x = 0) a une utilité
        nette r − p ≤ 0. Personne n'achète, y = 0.
      </>
    );
  } else if (xhat >= 1) {
    msg = (
      <>
        Couverture totale du marché : même l'acheteur le plus éloigné (x = 1) garde une utilité
        positive car p ≤ r − t. Tout le monde achète, y = 1.
      </>
    );
  } else {
    msg = (
      <>
        Couverture partielle : seuls les acheteurs situés avant x̂ = (r − p)/t ={" "}
        {fmt(xhat)} achètent. La droite d'utilité descend à la vitesse t : plus on habite loin,
        plus le déplacement coûte, jusqu'à rendre l'achat inintéressant.
      </>
    );
  }

  return (
    <InteractiveCard
      title="La ville linéaire : qui achète au monopole ?"
      subtitle="Utilité nette u(x) = r − tx − p le long de la route. L'axe horizontal est la route ; la zone bleue = les acheteurs, la rouge = ceux qui renoncent."
      controls={
        <>
          <SliderControl label="Bénéfice r" value={r} onChange={setR} min={2} max={10} step={0.5} format={(v) => fmt(v, 1)} />
          <SliderControl label="Coût de transport t" value={t} onChange={setT} min={1} max={8} step={0.5} format={(v) => fmt(v, 1)} />
          <SliderControl label="Coût marginal c" value={c} onChange={setC} min={0} max={4} step={0.5} format={(v) => fmt(v, 1)} />
          <SliderControl
            label="Prix p"
            value={price}
            onChange={(v) => {
              setP(v);
              setPreset("libre");
            }}
            min={0}
            max={10}
            step={0.25}
            format={(v) => fmt(v, 2)}
          />
          <ChoiceChips
            label="Scénario"
            value={preset}
            onChange={(v) => setPreset(v)}
            options={[
              { value: "libre", label: "prix libre" },
              { value: "pm", label: "prix de monopole pᵐ = (r+c)/2" },
            ]}
          />
        </>
      }
      footer={
        <>
          la frontière x̂ = (r − p)/t recule quand p monte et avance quand p baisse. Si p ≤ r − t
          le marché est entièrement couvert (y = 1) ; si p supérieur à r, y = 0. Clique sur « prix de
          monopole » : le monopole choisit exactement p = (r + c)/2, à mi-chemin entre bénéfice r
          et coût c.
        </>
      }
    >
      <PlotSvg p={plot} label="Ville linéaire : utilité nette le long de la route et zone d'achat">
        <Frame
          p={plot}
          xticks={[0, 0.25, 0.5, 0.75, 1]}
          xfmt={(v) => fmt(v, 2)}
          yticks={[0]}
          xlabel="position x (km)"
          ylabel="utilité nette u"
          axisAtZero
        />
        {/* zone où u > 0 */}
        {price < r ? (
          <polygon
            points={`${plot.X(0)},${plot.Y(0)} ${plot.X(0)},${plot.Y(r - price)} ${plot.X(xe)},${plot.Y(u(xe))} ${plot.X(xe)},${plot.Y(0)}`}
            fill={GREEN}
            opacity={0.13}
          />
        ) : null}
        {/* droite d'utilité */}
        <line
          x1={plot.X(0)}
          y1={plot.Y(u(0))}
          x2={plot.X(1)}
          y2={plot.Y(u(1))}
          stroke={BLUE}
          strokeWidth={2.5}
        />
        <text
          x={plot.X(0.04)}
          y={plot.Y(u(0)) - 8}
          fontSize={12}
          fontWeight={700}
          fill={BLUE}
        >
          u(x) = r − p − t·x
        </text>
        {/* la route : achat / pas d'achat */}
        <line
          x1={plot.X(0)}
          y1={plot.Y(0)}
          x2={plot.X(xe)}
          y2={plot.Y(0)}
          stroke={BLUE}
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.85}
        />
        {xe < 1 ? (
          <line
            x1={plot.X(xe)}
            y1={plot.Y(0)}
            x2={plot.X(1)}
            y2={plot.Y(0)}
            stroke={RED}
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.75}
          />
        ) : null}
        {/* vendeur */}
        <circle cx={plot.X(0)} cy={plot.Y(0)} r={6} fill={GOLD} stroke="white" strokeWidth={1.5} />
        <text x={plot.X(0)} y={plot.Y(0) + 22} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={GOLD}>
          vendeur
        </text>
        {/* acheteur marginal */}
        {xhat > 0 && xhat < 1 ? (
          <g>
            <circle cx={plot.X(xhat)} cy={plot.Y(0)} r={5} fill={GREEN} stroke="white" strokeWidth={1.5} />
            <text
              x={plot.X(xhat)}
              y={plot.Y(0) - 10}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={GREEN}
            >
              x̂ = {fmt(xhat)}
            </text>
          </g>
        ) : null}
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "Acheteur marginal x̂ =", value: fmt(xhat) },
          { label: "Demande y =", value: fmt(y) },
          { label: "Profit (p − c)·y =", value: fmt(profit), hi: true },
          { label: "Prix de monopole pᵐ = (r+c)/2 =", value: fmt(pM) },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* 2 · La demande avec effet de réseau (slides 13-26)                  */
/* ================================================================== */

export function WidgetDemandeReseau() {
  const r = 6;
  const [v, setV] = useState(6);
  const [t, setT] = useState(4);
  const [p, setP] = useState(7);

  const cap = r + v - t; // seuil p pour y = 1
  const caseB = v > t;
  const caseLim = Math.abs(v - t) < 1e-9;

  const eq0 = p > r;
  const eq1 = p < cap;
  const ystar = caseLim ? null : (r - p) / (t - v);
  const interior = ystar !== null && ystar > 0 && ystar < 1;

  const pmax = Math.max(r, cap) + 2;
  const plot = makePlot({ x: [-0.07, 1.16], y: [0, pmax], h: 360 });

  const eqParts: string[] = [];
  if (eq0) eqParts.push("y = 0 (stable)");
  if (interior && ystar !== null)
    eqParts.push(`y* = ${fmt(ystar)} (${caseB ? "instable" : "stable"})`);
  if (eq1) eqParts.push("y = 1 (stable)");
  const nEq = (eq0 ? 1 : 0) + (eq1 ? 1 : 0) + (interior ? 1 : 0);

  let msg: ReactNode;
  if (caseLim) {
    msg = <>Cas limite v = t : la branche intérieure devient verticale. Bouge v ou t pour retrouver les deux cas A et B.</>;
  } else if (caseB && eq0 && eq1 && interior && ystar !== null) {
    msg = (
      <>
        Trois équilibres coexistent pour ce prix (r {"<"} p {"<"} r + v − t) : personne n'achète,
        tout le monde achète, et l'équilibre intérieur y* = {fmt(ystar)}. Ce dernier est{" "}
        <strong>instable</strong> : c'est la <strong>masse critique</strong> y{"ᶜ"}. Si les
        anticipations dépassent y{"ᶜ"}, tout bascule vers y = 1 ; sinon, le réseau
        s'effondre vers y = 0.
      </>
    );
  } else if (caseB) {
    msg = (
      <>
        Forte externalité (v {">"} t) : la branche intérieure de la demande est{" "}
        <strong>croissante</strong> (et instable). Place p entre r = {fmt(r)} et r + v − t ={" "}
        {fmt(cap)} pour voir apparaître les trois équilibres.
      </>
    );
  } else if (interior && ystar !== null) {
    msg = (
      <>
        Faible externalité (v {"<"} t) : demande décroissante classique, un seul équilibre
        intérieur y* = (r − p)/(t − v) = {fmt(ystar)}, et il est stable.
      </>
    );
  } else if (eq1) {
    msg = <>Prix inférieur à r + v − t = {fmt(cap)} : l'unique équilibre est y = 1, tout le monde rejoint le réseau.</>;
  } else {
    msg = <>Prix supérieur à r = {fmt(r)} : l'unique équilibre est y = 0, le réseau est vide.</>;
  }

  return (
    <InteractiveCard
      title="La demande avec effet de réseau : équilibres multiples et masse critique"
      subtitle={
        <>
          Prix p en ordonnée, demande y en abscisse (r = 6 fixé). Branche rouge : y = 0 si p {">"} r ·
          branche verte : y* = (r − p)/(t − v) · branche bleue : y = 1 si p {"<"} r + v − t.
        </>
      }
      controls={
        <>
          <SliderControl label="Externalité v" value={v} onChange={setV} min={0} max={8} step={0.25} format={(x) => fmt(x)} />
          <SliderControl label="Coût de transport t" value={t} onChange={setT} min={1} max={8} step={0.25} format={(x) => fmt(x)} />
          <SliderControl label="Prix p" value={p} onChange={setP} min={0} max={12} step={0.25} format={(x) => fmt(x)} />
        </>
      }
      footer={
        <>
          avec v {"<"} t la branche verte descend (demande décroissante, stable) ; avec v {">"} t
          elle monte (demande croissante, instable, en pointillés). Pour v {">"} t et un prix
          entre r et r + v − t, trois équilibres coexistent : l'équilibre intérieur devient la
          masse critique qui sépare l'effondrement (flèche vers 0) du décollage (flèche vers 1).
        </>
      }
    >
      <PlotSvg p={plot} label="Demande avec effet de réseau : branches d'équilibre et prix courant">
        <Frame
          p={plot}
          xticks={[0, 0.5, 1]}
          xfmt={(x) => fmt(x, 1)}
          yticks={[0, 3, 6, 9, 12].filter((x) => x <= pmax)}
          xlabel="demande y (= anticipation yᴱ)"
          ylabel="prix p"
        />
        {/* guides r et r+v−t */}
        <line x1={plot.pL} y1={plot.Y(r)} x2={plot.X(1.02)} y2={plot.Y(r)} stroke={GUIDE} strokeWidth={1} strokeDasharray="4 4" />
        <text x={plot.X(1.03)} y={plot.Y(r) + 4} fontSize={11.5} fontWeight={700} fill={SOFT}>
          r
        </text>
        {cap > 0 ? (
          <>
            <line x1={plot.pL} y1={plot.Y(cap)} x2={plot.X(1.02)} y2={plot.Y(cap)} stroke={GUIDE} strokeWidth={1} strokeDasharray="4 4" />
            <text x={plot.X(1.03)} y={plot.Y(cap) + 4} fontSize={11.5} fontWeight={700} fill={SOFT}>
              r+v−t
            </text>
          </>
        ) : null}
        {/* branche y = 0 (rouge) */}
        <line x1={plot.X(0)} y1={plot.Y(r)} x2={plot.X(0)} y2={plot.Y(pmax)} stroke={RED} strokeWidth={4} strokeLinecap="round" />
        {/* branche y = 1 (bleue) */}
        {cap > 0 ? (
          <line x1={plot.X(1)} y1={plot.Y(0)} x2={plot.X(1)} y2={plot.Y(cap)} stroke={BLUE} strokeWidth={4} strokeLinecap="round" />
        ) : null}
        {/* branche intérieure (verte), coupée en p = 0 si r+v−t < 0 */}
        {!caseLim ? (
          <line
            x1={plot.X(0)}
            y1={plot.Y(r)}
            x2={plot.X(cap >= 0 ? 1 : r / (r - cap))}
            y2={plot.Y(Math.max(cap, 0))}
            stroke={GREEN}
            strokeWidth={2.5}
            strokeDasharray={caseB ? "7 5" : undefined}
          />
        ) : null}
        <text
          x={plot.X((cap >= 0 ? 1 : r / (r - cap)) / 2)}
          y={plot.Y((r + Math.max(cap, 0)) / 2) + (caseB ? 18 : -10)}
          textAnchor="middle"
          fontSize={11.5}
          fontWeight={700}
          fill={GREEN}
        >
          {caseB ? "instabilité" : "stabilité"}
        </text>
        {/* prix courant */}
        {p <= pmax ? (
          <line x1={plot.pL} y1={plot.Y(p)} x2={plot.X(1.02)} y2={plot.Y(p)} stroke={GOLD} strokeWidth={1.6} strokeDasharray="6 4" />
        ) : null}
        {/* flèches d'instabilité autour de la masse critique */}
        {caseB && interior && ystar !== null && p <= pmax ? (
          <>
            <ArrowH p={plot} y={p} from={Math.max(0.05, ystar - 0.05)} to={Math.max(0.03, ystar - 0.2)} color={RED} />
            <ArrowH p={plot} y={p} from={Math.min(0.95, ystar + 0.05)} to={Math.min(0.97, ystar + 0.2)} color={BLUE} />
          </>
        ) : null}
        {/* équilibres au prix courant */}
        {eq0 && p <= pmax ? <circle cx={plot.X(0)} cy={plot.Y(p)} r={5.5} fill={RED} stroke="white" strokeWidth={1.5} /> : null}
        {eq1 ? <circle cx={plot.X(1)} cy={plot.Y(p)} r={5.5} fill={BLUE} stroke="white" strokeWidth={1.5} /> : null}
        {interior && ystar !== null ? (
          <g>
            <circle
              cx={plot.X(ystar)}
              cy={plot.Y(p)}
              r={5.5}
              fill={caseB ? "white" : GREEN}
              stroke={GREEN}
              strokeWidth={2.2}
            />
            {caseB ? (
              <text
                x={plot.X(ystar)}
                y={plot.Y(p) - 12}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight={700}
                fill={GREEN}
              >
                masse critique y{"ᶜ"} = {fmt(ystar)}
              </text>
            ) : null}
          </g>
        ) : null}
      </PlotSvg>
      <ChipRow
        chips={[
          {
            label: "Cas :",
            value: caseLim ? "limite v = t" : caseB ? "B · forte externalité (v > t)" : "A · faible externalité (v < t)",
          },
          { label: "Équilibres à ce prix :", value: eqParts.length > 0 ? eqParts.join(" · ") : "aucun point stable affiché" },
          { label: "Nombre d'équilibres =", value: String(nEq), hi: nEq === 3 },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* 3 · Le tâtonnement des anticipations (slides 21-22)                 */
/* ================================================================== */

export function WidgetAnticipations() {
  const r = 6;
  const t = 4;
  const [v, setV] = useState(5);
  const [p, setP] = useState(6.5);
  const [y0, setY0] = useState(0.45);

  const N = 10;
  const traj: number[] = [y0];
  for (let k = 1; k <= N; k++) {
    const prev = traj[k - 1];
    traj.push(clamp((r + v * prev - p) / t, 0, 1));
  }
  const final = traj[N];

  const caseB = v > t;
  const ystar = Math.abs(t - v) < 1e-9 ? null : (r - p) / (t - v);
  const interior = ystar !== null && ystar > 0 && ystar < 1;

  let verdict: string;
  if (final > 0.99) verdict = "décollage : y → 1";
  else if (final < 0.01) verdict = "effondrement : y → 0";
  else verdict = `convergence : y → ${fmt(final)}`;

  const plot = makePlot({ x: [-0.3, N + 0.3], y: [-0.06, 1.1], h: 330 });

  let msg: ReactNode;
  if (!caseB) {
    msg = (
      <>
        Faible externalité : à chaque révision, l'écart à l'équilibre est multiplié par v/t ={" "}
        {fmt(v / t)} {"<"} 1. Les révisions s'amortissent : quel que soit le point de départ, on
        revient vers l'équilibre stable{interior && ystar !== null ? <> y* = {fmt(ystar)}</> : null}.
      </>
    );
  } else if (interior && ystar !== null) {
    msg = (
      <>
        Forte externalité : l'écart est multiplié par v/t = {fmt(v / t)} {">"} 1 à chaque
        révision, il s'amplifie. Le point y{"ᶜ"} = {fmt(ystar)} est la masse critique :
        pars juste au-dessus, tout le monde finit par rejoindre (y = 1) ; juste en dessous, le
        réseau meurt (y = 0). Essaie !
      </>
    );
  } else {
    msg = (
      <>
        Forte externalité, mais à ce prix il n'y a qu'une seule destination possible : les
        anticipations y sont aspirées quel que soit le point de départ.
      </>
    );
  }

  return (
    <InteractiveCard
      title="Anticipations auto-réalisatrices : le tâtonnement"
      subtitle={
        <>
          On part d'une anticipation initiale y{"ᴱ"}₀, on calcule la demande réalisée
          y = (r + v·y{"ᴱ"} − p)/t, on révise l'anticipation, et on recommence (r = 6, t = 4
          fixés).
        </>
      }
      controls={
        <>
          <SliderControl label="Externalité v" value={v} onChange={setV} min={0} max={8} step={0.25} format={(x) => fmt(x)} />
          <SliderControl label="Prix p" value={p} onChange={setP} min={3} max={9} step={0.25} format={(x) => fmt(x)} />
          <SliderControl label="Anticipation initiale yᴱ₀" value={y0} onChange={setY0} min={0} max={1} step={0.01} format={(x) => fmt(x)} />
        </>
      }
      footer={
        <>
          avec v {"<"} t (v/t {"<"} 1) la trajectoire revient toujours vers y*, l'équilibre
          intérieur est stable. Avec v {">"} t (v/t {">"} 1) la moindre erreur d'anticipation
          s'amplifie : la trajectoire fuit y* vers 0 ou vers 1 — d'où la bataille des plateformes
          pour convaincre que « tout le monde y sera ».
        </>
      }
    >
      <PlotSvg p={plot} label="Trajectoire des anticipations révisées au fil des itérations">
        <Frame
          p={plot}
          xticks={[0, 2, 4, 6, 8, 10]}
          yticks={[0, 0.5, 1]}
          yfmt={(x) => fmt(x, 1)}
          xlabel="itération k"
          ylabel="anticipation yᴱ"
        />
        {interior && ystar !== null ? (
          <>
            <line
              x1={plot.pL}
              y1={plot.Y(ystar)}
              x2={plot.w - plot.pR}
              y2={plot.Y(ystar)}
              stroke={GREEN}
              strokeWidth={1.4}
              strokeDasharray="5 4"
            />
            <text
              x={plot.w - plot.pR - 4}
              y={plot.Y(ystar) - 6}
              textAnchor="end"
              fontSize={11.5}
              fontWeight={700}
              fill={GREEN}
            >
              {caseB ? `masse critique yᶜ = ${fmt(ystar)}` : `équilibre y* = ${fmt(ystar)}`}
            </text>
          </>
        ) : null}
        <polyline
          points={traj.map((yk, k) => `${plot.X(k)},${plot.Y(yk)}`).join(" ")}
          fill="none"
          stroke={BLUE}
          strokeWidth={2.2}
        />
        {traj.map((yk, k) => (
          <circle key={k} cx={plot.X(k)} cy={plot.Y(yk)} r={k === 0 ? 5.5 : 4} fill={k === 0 ? GOLD : BLUE} stroke="white" strokeWidth={1.2} />
        ))}
        <text x={plot.X(0)} y={plot.Y(traj[0]) - 10} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={GOLD}>
          départ
        </text>
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "Facteur de révision v/t =", value: fmt(v / t) },
          {
            label: caseB ? "Masse critique yᶜ =" : "Équilibre intérieur y* =",
            value: interior && ystar !== null ? fmt(ystar) : "—",
          },
          { label: "Destination :", value: verdict, hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* 4 · La ligne de Hotelling (slides 38-42)                            */
/* ================================================================== */

export function WidgetHotelling() {
  const [p1, setP1] = useState(4);
  const [p2, setP2] = useState(4);
  const [t, setT] = useState(4);
  const [preset, setPreset] = useState<"libre" | "nash">("libre");

  const q1 = preset === "nash" ? t : p1;
  const q2 = preset === "nash" ? t : p2;

  const xraw = 0.5 - (q1 - q2) / (2 * t);
  const xhat = clamp(xraw, 0, 1);
  const y1 = xhat;
  const y2 = 1 - xhat;
  const pr1 = q1 * y1;
  const pr2 = q2 * y2;

  const ymax = Math.max(q1 + t, q2 + t) + 1;
  const plot = makePlot({ x: [-0.07, 1.15], y: [0, ymax], h: 350 });

  const g1 = (x: number) => q1 + t * x;
  const g2 = (x: number) => q2 + t * (1 - x);

  let msg: ReactNode;
  if (xhat === 0) {
    msg = <>Le vendeur 1 est tellement plus cher que même l'acheteur situé en x = 0 traverse toute la ville : le vendeur 1 n'a plus aucun client.</>;
  } else if (xhat === 1) {
    msg = <>Le vendeur 2 est tellement plus cher qu'il perd tout le marché au profit du vendeur 1.</>;
  } else if (Math.abs(q1 - q2) < 1e-9) {
    msg = (
      <>
        Prix égaux : l'acheteur indifférent est pile au milieu (x̂ = 1/2), chaque vendeur sert la
        moitié du marché. À l'équilibre de Nash, p₁ = p₂ = t = {fmt(t)} et chaque firme gagne
        t/2 = {fmt(t / 2)}.
      </>
    );
  } else {
    msg = (
      <>
        L'acheteur situé en x̂ = {fmt(xhat)} paie exactement le même coût total chez les deux
        vendeurs : {fmt(g1(xhat))}. À sa gauche, le vendeur 1 est plus avantageux ; à sa droite,
        le vendeur 2. Un euro d'écart de prix déplace x̂ de 1/(2t) = {fmt(1 / (2 * t))}.
      </>
    );
  }

  return (
    <InteractiveCard
      title="La ligne de Hotelling : deux vendeurs, un acheteur indifférent"
      subtitle="Chaque courbe donne le coût total (prix + transport) d'un acheteur selon sa position. Il achète au vendeur le moins coûteux au total ; la frontière est l'acheteur indifférent x̂."
      controls={
        <>
          <SliderControl
            label="Prix p₁ (vendeur 1)"
            value={q1}
            onChange={(x) => {
              setP1(x);
              setPreset("libre");
            }}
            min={0}
            max={8}
            step={0.25}
            format={(x) => fmt(x)}
          />
          <SliderControl
            label="Prix p₂ (vendeur 2)"
            value={q2}
            onChange={(x) => {
              setP2(x);
              setPreset("libre");
            }}
            min={0}
            max={8}
            step={0.25}
            format={(x) => fmt(x)}
          />
          <SliderControl label="Coût de transport t" value={t} onChange={setT} min={1} max={8} step={0.5} format={(x) => fmt(x)} />
          <ChoiceChips
            label="Scénario"
            value={preset}
            onChange={setPreset}
            options={[
              { value: "libre", label: "prix libres" },
              { value: "nash", label: "équilibre de Nash : p₁ = p₂ = t" },
            ]}
          />
        </>
      }
      footer={
        <>
          baisse p₁ : la frontière x̂ glisse vers la droite et le vendeur 1 gagne des clients — mais
          chaque unité rapporte moins. Monte t : les courbes deviennent plus pentues, les clients
          plus « captifs », et les prix d'équilibre montent (p* = t). C'est la différenciation qui
          adoucit la concurrence en prix.
        </>
      }
    >
      <PlotSvg p={plot} label="Ligne de Hotelling : coûts totaux des deux vendeurs et partage du marché">
        <Frame
          p={plot}
          xticks={[0, 0.25, 0.5, 0.75, 1]}
          xfmt={(x) => fmt(x, 2)}
          yticks={[0, Math.round(ymax / 2)]}
          xlabel="position x"
          ylabel="coût total pour l'acheteur"
        />
        {/* coûts totaux */}
        <line x1={plot.X(0)} y1={plot.Y(g1(0))} x2={plot.X(1)} y2={plot.Y(g1(1))} stroke={BLUE} strokeWidth={2.5} />
        <line x1={plot.X(0)} y1={plot.Y(g2(0))} x2={plot.X(1)} y2={plot.Y(g2(1))} stroke={RED} strokeWidth={2.5} />
        <text x={plot.X(0.99)} y={plot.Y(g1(1)) - 8} textAnchor="end" fontSize={11.5} fontWeight={700} fill={BLUE}>
          p₁ + t·x
        </text>
        <text x={plot.X(0.01)} y={plot.Y(g2(0)) - 8} fontSize={11.5} fontWeight={700} fill={RED}>
          p₂ + t·(1−x)
        </text>
        {/* frontière */}
        {xraw > 0 && xraw < 1 ? (
          <g>
            <line
              x1={plot.X(xhat)}
              y1={plot.Y(0)}
              x2={plot.X(xhat)}
              y2={plot.Y(g1(xhat))}
              stroke={GUIDE}
              strokeWidth={1.2}
              strokeDasharray="4 4"
            />
            <circle cx={plot.X(xhat)} cy={plot.Y(g1(xhat))} r={5} fill={GREEN} stroke="white" strokeWidth={1.5} />
            <text x={plot.X(xhat)} y={plot.Y(g1(xhat)) - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill={GREEN}>
              x̂ = {fmt(xhat)}
            </text>
          </g>
        ) : null}
        {/* la route */}
        <line x1={plot.X(0)} y1={plot.Y(0)} x2={plot.X(xhat)} y2={plot.Y(0)} stroke={BLUE} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        {xhat < 1 ? (
          <line x1={plot.X(xhat)} y1={plot.Y(0)} x2={plot.X(1)} y2={plot.Y(0)} stroke={RED} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        ) : null}
        <circle cx={plot.X(0)} cy={plot.Y(0)} r={6} fill={BLUE} stroke="white" strokeWidth={1.5} />
        <circle cx={plot.X(1)} cy={plot.Y(0)} r={6} fill={RED} stroke="white" strokeWidth={1.5} />
        <text x={plot.X(0)} y={plot.Y(0) + 22} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={BLUE}>
          vendeur 1
        </text>
        <text x={plot.X(1)} y={plot.Y(0) + 22} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={RED}>
          vendeur 2
        </text>
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "x̂ =", value: fmt(xhat) },
          { label: "y₁ =", value: fmt(y1) },
          { label: "y₂ =", value: fmt(y2) },
          { label: "π₁ = p₁·y₁ =", value: fmt(pr1), hi: true },
          { label: "π₂ = p₂·y₂ =", value: fmt(pr2), hi: true },
        ]}
      />
      <WidgetMsg>{msg}</WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* 5 · L'effet de réseau sur les prix du duopole (slide 46)            */
/* ================================================================== */

export function WidgetDuopoleReseau() {
  const [t, setT] = useState(4);
  const [v, setV] = useState(2);

  const valid = v < t;
  const vc = Math.min(v, t);
  const pStar = t - vc;
  const profit = pStar / 2;

  const plot = makePlot({ x: [0, 8.4], y: [0, 8.8], h: 340 });

  return (
    <InteractiveCard
      title="Duopole : plus l'effet de réseau est fort, plus les prix baissent"
      subtitle="Prix d'équilibre p* = t − v en fonction de l'externalité v (coût marginal nul, hypothèse v < t). La ligne dorée rappelle la référence sans effet de réseau : p* = t."
      controls={
        <>
          <SliderControl label="Coût de transport t" value={t} onChange={setT} min={1} max={8} step={0.5} format={(x) => fmt(x)} />
          <SliderControl label="Externalité v" value={v} onChange={setV} min={0} max={8} step={0.25} format={(x) => fmt(x)} />
        </>
      }
      footer={
        <>
          le prix d'équilibre descend exactement de v sous la référence t : chaque euro
          d'externalité se transforme en un euro de rabais concurrentiel. Quand v se rapproche de
          t, prix et profits fondent vers zéro — la concurrence entre réseaux devient féroce. Et
          si v ≥ t, on sort du cadre du modèle (les slides supposent v {"<"} t).
        </>
      }
    >
      <PlotSvg p={plot} label="Prix d'équilibre du duopole en fonction de l'externalité v">
        <Frame
          p={plot}
          xticks={[0, 2, 4, 6, 8]}
          yticks={[0, 2, 4, 6, 8]}
          xlabel="externalité v"
          ylabel="prix / profit"
        />
        {/* référence sans réseau */}
        <line x1={plot.X(0)} y1={plot.Y(t)} x2={plot.X(8.2)} y2={plot.Y(t)} stroke={GOLD} strokeWidth={1.6} strokeDasharray="6 4" />
        <text x={plot.X(8.15)} y={plot.Y(t) - 7} textAnchor="end" fontSize={11.5} fontWeight={700} fill={GOLD}>
          sans réseau : p* = t
        </text>
        {/* écart de prix (zone) */}
        {vc > 0 ? (
          <polygon
            points={`${plot.X(0)},${plot.Y(t)} ${plot.X(vc)},${plot.Y(t)} ${plot.X(vc)},${plot.Y(t - vc)}`}
            fill={RED}
            opacity={0.1}
          />
        ) : null}
        {/* p*(v) = t − v */}
        <line x1={plot.X(0)} y1={plot.Y(t)} x2={plot.X(t)} y2={plot.Y(0)} stroke={GREEN} strokeWidth={2.8} />
        <text
          x={plot.X(Math.min(t * 0.55, 7))}
          y={plot.Y(t - Math.min(t * 0.55, 7) * 1) - 10}
          fontSize={12}
          fontWeight={700}
          fill={GREEN}
        >
          p*(v) = t − v
        </text>
        {/* profit par firme */}
        <line x1={plot.X(0)} y1={plot.Y(t / 2)} x2={plot.X(t)} y2={plot.Y(0)} stroke={BLUE} strokeWidth={1.8} strokeDasharray="5 4" />
        <text x={plot.X(0.1)} y={plot.Y(t / 2) - 7} fontSize={11.5} fontWeight={700} fill={BLUE}>
          profit par firme = (t − v)/2
        </text>
        {/* point courant */}
        {valid ? (
          <g>
            <line
              x1={plot.X(vc)}
              y1={plot.Y(t)}
              x2={plot.X(vc)}
              y2={plot.Y(pStar)}
              stroke={RED}
              strokeWidth={1.6}
              strokeDasharray="4 3"
            />
            <text x={plot.X(vc) + 7} y={plot.Y((t + pStar) / 2) + 4} fontSize={11.5} fontWeight={700} fill={RED}>
              − v
            </text>
            <circle cx={plot.X(vc)} cy={plot.Y(pStar)} r={6} fill={GREEN} stroke="white" strokeWidth={1.5} />
          </g>
        ) : null}
      </PlotSvg>
      <ChipRow
        chips={[
          { label: "Sans réseau : p* = t =", value: fmt(t) },
          { label: "Avec réseau : p* = t − v =", value: valid ? fmt(pStar) : "—", hi: valid },
          { label: "Baisse de prix =", value: valid ? fmt(v) : "—" },
          { label: "Profit par firme (t − v)/2 =", value: valid ? fmt(profit) : "—" },
        ]}
      />
      <WidgetMsg>
        {valid ? (
          <>
            La concurrence est intensifiée par l'effet de réseau : chaque client gagné rend le
            réseau plus attractif pour tous les autres, donc chaque firme est prête à casser les
            prix pour l'attirer. À l'équilibre, les deux firmes gardent pourtant chacune la
            moitié du marché… mais avec des marges rabotées de v.
          </>
        ) : (
          <>
            v ≥ t : hors du cadre étudié. Les slides supposent une externalité « pas trop
            forte » (v {"<"} t) ; au-delà, on retrouve la logique de bascule vue en monopole
            (équilibres extrêmes, un seul réseau survit).
          </>
        )}
      </WidgetMsg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Checklist de fin de chapitre                                        */
/* ================================================================== */

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
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCheck className="h-4 w-4" aria-hidden />
          Coche honnêtement — tout ce qui reste décoché te dit où retourner
        </span>
        <span className="tabular-nums">
          {done.size} / {items.length} points maîtrisés
          {done.size === items.length ? " — chapitre bouclé !" : ""}
        </span>
      </div>
      <div className="grid gap-2">
        {items.map((item, i) => {
          const isDone = done.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-card px-4 py-2.5 text-left transition-colors hover:border-primary/50",
                isDone && "border-success/50 bg-emerald-50/50 dark:bg-emerald-950/20",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-white transition-colors",
                  isDone ? "border-success bg-success" : "border-muted-foreground/40 bg-card",
                )}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" aria-hidden>
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
              <span
                className={cn(
                  "text-[14.5px] leading-relaxed",
                  isDone && "text-muted-foreground line-through decoration-muted-foreground/40",
                )}
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
