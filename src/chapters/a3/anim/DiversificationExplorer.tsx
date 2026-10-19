/*
 * DiversificationExplorer — A3 · diversification, slides 28-31.
 *
 * Deux actifs a1 et a2 rapportent chacun y ou x (½ chacun, y > x).
 *  - cas 1 : deux actions de la même firme de parapluies (corrélation positive parfaite)
 *            → portefeuille 2y (pluie) ou 2x (soleil), 50 % / 50 % ;
 *  - cas 2 : parapluies + crème solaire (corrélation négative parfaite)
 *            → y + x (pluie) ou x + y (soleil) : x + y à coup sûr ;
 *  - cas 3 : parapluies + t-shirts des Diables rouges (risques indépendants)
 *            → 2y, y + x, x + y, 2x avec 25 % chacun.
 * La VMA vaut x + y dans les trois cas. Avec u = √w (averse) :
 * U(cas 2) > U(cas 3) > U(cas 1) ; avec u = w (neutre) : trois U égaux (slide 31).
 * Contrôle (y = 16, x = 4) : U1 ≈ 4,243 ; U3 ≈ 4,357 ; U2 ≈ 4,472 ; équivalents
 * certains 18 / 18,99 / 20 € ; U3 = ½·U1 + ½·U2.
 */
import { useState, type ReactNode } from "react";
import { InteractiveCard, SliderControl, ChoiceChips } from "@/components/course/Interactive";
import { C, PlotSvg, fmt, makePlot } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";
import { ChipRow, WidgetMsg } from "@/chapters/a3/widgets";

type Cas = "1" | "2" | "3";
type Att = "averse" | "neutre";
type Pay = "y" | "x";

const HALO = "var(--color-card)";

interface WorldState {
  name: string;
  prob: number;
  a1: Pay;
  a2: Pay;
}

const A2_NAME: Record<Cas, string> = {
  "1": "parapluies",
  "2": "crème solaire",
  "3": "t-shirts des Diables",
};

const STATES: Record<Cas, WorldState[]> = {
  "1": [
    { name: "s1 · il pleut", prob: 0.5, a1: "y", a2: "y" },
    { name: "s2 · il y a du soleil", prob: 0.5, a1: "x", a2: "x" },
  ],
  "2": [
    { name: "s1 · il pleut", prob: 0.5, a1: "y", a2: "x" },
    { name: "s2 · il y a du soleil", prob: 0.5, a1: "x", a2: "y" },
  ],
  "3": [
    { name: "s1 · pluie + Diables qualifiés", prob: 0.25, a1: "y", a2: "y" },
    { name: "s2 · pluie + Diables pas qualifiés", prob: 0.25, a1: "y", a2: "x" },
    { name: "s3 · soleil + Diables qualifiés", prob: 0.25, a1: "x", a2: "y" },
    { name: "s4 · soleil + Diables pas qualifiés", prob: 0.25, a1: "x", a2: "x" },
  ],
};

/** Probabilités de (2x, x + y, 2y) pour chaque cas. */
const DIST: Record<Cas, [number, number, number]> = {
  "1": [0.5, 0, 0.5],
  "2": [0, 1, 0],
  "3": [0.25, 0.5, 0.25],
};

const CAS_LABEL: Record<Cas, string> = {
  "1": "corrélation positive parfaite",
  "2": "corrélation négative parfaite",
  "3": "corrélation nulle (indépendance)",
};

const BAR_COLORS = [C.red, C.blue, C.green] as const;

function Txt({
  x,
  y,
  children,
  color = C.ink,
  anchor = "middle",
  size = 12.5,
  weight = 600,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      stroke={HALO}
      strokeWidth={3.5}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

export function DiversificationExplorer() {
  const [cas, setCas] = useState<Cas>("1");
  const [att, setAtt] = useState<Att>("averse");
  const [y, setY] = useState(16);
  const [x, setX] = useState(4);

  const u = att === "averse" ? (w: number) => Math.sqrt(w) : (w: number) => w;
  const inv = att === "averse" ? (t: number) => t * t : (t: number) => t;
  const values: [number, number, number] = [2 * x, x + y, 2 * y];
  const Uof = (c: Cas) => DIST[c].reduce((s, pr, i) => s + pr * u(values[i]), 0);
  const U: Record<Cas, number> = { "1": Uof("1"), "2": Uof("2"), "3": Uof("3") };
  const vma = x + y;
  const ce = inv(U[cas]);

  const pay = (s: Pay) => (s === "y" ? y : x);
  const valueName = (s: WorldState) =>
    s.a1 === "y" && s.a2 === "y" ? "2y" : s.a1 === "x" && s.a2 === "x" ? "2x" : `${s.a1} + ${s.a2}`;
  const valueTone = (s: WorldState) =>
    s.a1 === "y" && s.a2 === "y"
      ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
      : s.a1 === "x" && s.a2 === "x"
        ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40"
        : "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40";

  const uStr = (v: number) => (att === "averse" ? `√${fmt(v, 0)}` : fmt(v, 0));
  const formula =
    cas === "1"
      ? `U = ½·u(2y) + ½·u(2x) = ½·${uStr(2 * y)} + ½·${uStr(2 * x)} ≈ ${fmt(U["1"], 3)}`
      : cas === "2"
        ? `U = u(x + y) = ${uStr(x + y)} ≈ ${fmt(U["2"], 3)}`
        : `U = ¼·u(2y) + ½·u(x + y) + ¼·u(2x) = ¼·${uStr(2 * y)} + ½·${uStr(x + y)} + ¼·${uStr(2 * x)} ≈ ${fmt(U["3"], 3)}`;

  const story =
    cas === "1"
      ? "Les deux actions dépendent de la même météo : s'il pleut, tout va bien (2y) ; s'il fait soleil, tout va mal (2x). Rien ne se compense : c'est le portefeuille le plus risqué."
      : cas === "2"
        ? "Parapluies et crème solaire se compensent exactement : quel que soit le temps, l'une rapporte y et l'autre x. Le portefeuille vaut x + y à coup sûr : le risque a disparu, et la VMA est intacte."
        : "Les deux risques sont indépendants : la moitié du temps ils se compensent (x + y), un quart du temps ils s'additionnent vers le haut (2y), un quart du temps vers le bas (2x). On est exactement à mi-chemin : U(cas 3) = ½·U(cas 1) + ½·U(cas 2).";
  const verdict =
    att === "averse"
      ? `Averse (u = √w) : U(cas 2) > U(cas 3) > U(cas 1) (${fmt(U["2"], 3)} > ${fmt(U["3"], 3)} > ${fmt(U["1"], 3)}), alors que la VMA est la même (${fmt(vma, 0)} €).`
      : `Neutre (u = w) : U = VMA = ${fmt(vma, 0)} dans les trois cas. Seul un individu averse au risque gagne à diversifier.`;

  /* histogramme de la valeur du portefeuille : 2x, x + y, 2y sont équidistants */
  const p = makePlot({ w: 520, h: 250, pL: 48, pR: 14, pT: 30, pB: 46, x: [0.4, 3.6], y: [0, 112] });
  const bottom = p.h - p.pB;
  const bw = 66;
  const dist = DIST[cas];

  return (
    <InteractiveCard
      title="Diversifier : parapluies, crème solaire et t-shirts"
      subtitle="Slides 28-31. Ton portefeuille contient deux actions a1 et a2 ; chacune rapporte y ou x (½ chacun, y > x). Seule change la corrélation entre leurs risques."
      controls={
        <>
          <ChoiceChips
            label="Cas"
            value={cas}
            onChange={setCas}
            options={[
              { value: "1", label: "Cas 1 · parapluies × 2" },
              { value: "2", label: "Cas 2 · parapluies + crème solaire" },
              { value: "3", label: "Cas 3 · parapluies + t-shirts des Diables" },
            ]}
          />
          <SliderControl label="y (bonne année)" value={y} onChange={setY} min={10} max={30} step={1} format={(v) => `${v} €`} />
          <SliderControl label="x (mauvaise année)" value={x} onChange={setX} min={0} max={9} step={1} format={(v) => `${v} €`} />
          <ChoiceChips
            label="Investisseur"
            value={att}
            onChange={setAtt}
            options={[
              { value: "averse", label: "Averse · u = √w" },
              { value: "neutre", label: "Neutre · u = w" },
            ]}
          />
        </>
      }
      footer="La VMA ne bouge jamais (x + y). Du cas 1 au cas 3 puis au cas 2, la masse de l'histogramme se concentre au centre : le risque baisse, donc U augmente pour un investisseur averse. Avec u = w, les trois U sont égaux."
    >
      <p className="mb-2 text-[13.5px] text-muted-foreground">
        <b className="text-foreground">Cas {cas}</b> · {CAS_LABEL[cas]} — a1 = parapluies, a2 = {A2_NAME[cas]}
        {cas === "1" ? " (même firme)" : ""}. États du monde :
      </p>
      <div className={cn("grid gap-2", "grid-cols-2")}>
        {STATES[cas].map((s) => (
          <div key={s.name} className={cn("rounded-lg border px-2.5 py-2 text-[12.5px] leading-snug", valueTone(s))}>
            <div className="font-semibold text-foreground">
              {s.name} <span className="font-normal text-muted-foreground">({fmt(100 * s.prob, 0)} %)</span>
            </div>
            <div className="mt-1 text-muted-foreground">
              a1 : {s.a1} = {pay(s.a1)} € · a2 : {s.a2} = {pay(s.a2)} €
            </div>
            <div className="mt-0.5 text-foreground">
              portefeuille : <b className="tabular-nums">
                {valueName(s)} = {pay(s.a1) + pay(s.a2)} €
              </b>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 mb-1 text-center text-[13px] font-semibold text-foreground">
        Distribution de la valeur du portefeuille
      </p>
      <PlotSvg p={p} label="Histogramme de la valeur du portefeuille : 2x, x + y et 2y avec leurs probabilités" maxW={600}>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={p.pL} y1={p.Y(t)} x2={p.w - p.pR} y2={p.Y(t)} stroke={C.guide} strokeWidth={1} opacity={0.3} />
            <text x={p.pL - 7} y={p.Y(t) + 4} textAnchor="end" fontSize={12} fill={C.soft}>
              {t} %
            </text>
          </g>
        ))}
        <line x1={p.pL} y1={bottom} x2={p.w - p.pR} y2={bottom} stroke={C.soft} strokeWidth={1.2} />
        {dist.map((pr, i) => {
          const cx = p.X(i + 1);
          const top = p.Y(100 * pr);
          return (
            <g key={i}>
              <rect
                x={cx - bw / 2}
                y={top}
                width={bw}
                height={Math.max(bottom - top, 0)}
                rx={3}
                fill={BAR_COLORS[i]}
                opacity={0.85}
                style={{ transition: "y 0.45s ease, height 0.45s ease" }}
              />
              <Txt x={cx} y={top - 7}>
                {fmt(100 * pr, 0)} %
              </Txt>
              <text x={cx} y={bottom + 18} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={C.ink}>
                {["2x", "x + y", "2y"][i]} = {fmt(values[i], 0)} €
              </text>
            </g>
          );
        })}
        <line x1={p.X(2)} y1={p.pT - 4} x2={p.X(2)} y2={bottom} stroke={C.gold} strokeWidth={1.4} strokeDasharray="5 4" />
        <Txt x={p.X(2)} y={p.pT - 10} color={C.gold}>
          VMA = x + y = {fmt(vma, 0)} €
        </Txt>
        <text x={p.w - p.pR} y={p.h - 6} textAnchor="end" fontSize={12} fontWeight={600} fill={C.soft}>
          valeur du portefeuille
        </text>
      </PlotSvg>

      <p className="mt-2 text-center text-[13.5px] text-foreground">
        <b>Cas {cas} :</b> {formula}
        {att === "averse" ? ` · équivalent certain ≈ ${fmt(ce, 2)} €` : ""}
      </p>
      <ChipRow
        chips={[
          { label: "VMA (les 3 cas) =", value: `${fmt(vma, 0)} €` },
          { label: "U(cas 1) =", value: fmt(U["1"], 3), hi: cas === "1" },
          { label: "U(cas 3) =", value: fmt(U["3"], 3), hi: cas === "3" },
          { label: "U(cas 2) =", value: fmt(U["2"], 3), hi: cas === "2" },
        ]}
      />
      <WidgetMsg>
        {story} {verdict}
      </WidgetMsg>
    </InteractiveCard>
  );
}
