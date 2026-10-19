/*
 * FramingGrid — effet de cadrage / framing (A1, approche comportementale,
 * slides S2 p. 14-15 : les 600 malades).
 *
 * 600 personnes = 30 colonnes × 20 points (une colonne = 20 personnes).
 *  - Mesure sûre (A1 = B1) : 200 sauvés (vert), 400 morts (rouge). L'image est
 *    STRICTEMENT la même dans les deux formulations ; seule la phrase mise en
 *    avant change (« 200 sauvés » / « 400 meurent ») : c'est l'explication du
 *    slide 15 (les mots font ressortir un aspect de la même mesure).
 *  - Mesure risquée (A2 = B2) : 1 chance sur 3 que les 600 soient sauvés,
 *    2 chances sur 3 que personne ne le soit. Boutons « Tirer au sort » et
 *    « Tirer 300 fois » : la moyenne converge vers 1/3 × 600 = 200.
 * Aucun tirage au rendu initial (Math.random seulement au clic) : le rendu
 * serveur et le rendu client sont identiques.
 */
import { useEffect, useRef, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import { ChoiceChips, InteractiveCard } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import { C, Frame, Label, PlotSvg, makePlot } from "@/chapters/shared/plot";

type Wording = "A" | "B";
type Measure = "sure" | "risk";

const NBSP = "\u00a0";
const COLS = 30;
const ROWS = 20;
const TOTAL = COLS * ROWS; // 600
const SURE_SAVED = 200;
const BATCH = 300;
const MAX_DRAWS = 3000;
const GREY = "#a1a1aa";

/* ------------------------------------------------------------------ */
/* Grille des 600 malades                                              */
/* ------------------------------------------------------------------ */

const CELL = 15;
const GX = 10; // marge gauche
const GY = 8; // marge haute
const GRID_W = COLS * CELL + 2 * GX; // 470
const GRID_H = GY + ROWS * CELL + 44;

/** couleur du point i (rempli colonne par colonne : 10 colonnes = 200 personnes) */
function dotColor(i: number, measure: Measure, last: number | null): string {
  if (measure === "sure") return i < SURE_SAVED ? C.green : C.red;
  if (last === null) return GREY;
  return last === 1 ? C.green : C.red;
}

function PeopleGrid({
  measure,
  last,
  drawNo,
}: {
  measure: Measure;
  last: number | null;
  drawNo: number;
}) {
  const dots = [];
  for (let i = 0; i < TOTAL; i++) {
    const col = Math.floor(i / ROWS);
    const row = i % ROWS;
    dots.push(
      <circle
        key={i}
        cx={GX + col * CELL + CELL / 2}
        cy={GY + row * CELL + CELL / 2}
        r={5.6}
        fill={dotColor(i, measure, last)}
        opacity={measure === "risk" && last === null ? 0.45 : 1}
      />,
    );
  }
  const yb = GY + ROWS * CELL + 6; // haut de l'accolade
  const xSplit = GX + 10 * CELL;
  const xEnd = GX + COLS * CELL;
  const aria =
    measure === "sure"
      ? "600 personnes\u00a0: 200 points verts (sauvées) et 400 points rouges (mortes). Image identique dans les deux formulations."
      : last === null
        ? "600 personnes en gris\u00a0: l'issue de la mesure risquée n'est pas encore tirée."
        : last === 1
          ? "Les 600 points sont verts\u00a0: ce tirage sauve tout le monde."
          : "Les 600 points sont rouges\u00a0: ce tirage ne sauve personne.";
  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: 560 }}
      role="img"
      aria-label={aria}
    >
      {dots}
      {measure === "sure" ? (
        <g>
          <path
            d={`M${GX + 2} ${yb} v6 H${xSplit - 3} v-6`}
            fill="none"
            stroke={C.green}
            strokeWidth={2}
          />
          <path
            d={`M${xSplit + 3} ${yb} v6 H${xEnd - 2} v-6`}
            fill="none"
            stroke={C.red}
            strokeWidth={2}
          />
          <text
            x={(GX + xSplit) / 2}
            y={yb + 27}
            textAnchor="middle"
            fontSize={16}
            fontWeight={800}
            fill={C.green}
          >
            200 sauvés
          </text>
          <text
            x={(xSplit + xEnd) / 2}
            y={yb + 27}
            textAnchor="middle"
            fontSize={16}
            fontWeight={800}
            fill={C.red}
          >
            400 morts
          </text>
        </g>
      ) : (
        <text
          x={GRID_W / 2}
          y={yb + 25}
          textAnchor="middle"
          fontSize={16}
          fontWeight={800}
          fill={last === null ? C.soft : last === 1 ? C.green : C.red}
        >
          {last === null
            ? "Issue pas encore tirée\u00a0: clique sur «\u00a0Tirer au sort\u00a0»"
            : last === 1
              ? `Tirage n°${drawNo} : 600 sauvés, 0 mort`
              : `Tirage n°${drawNo} : 0 sauvé, 600 morts`}
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Phrase mise en avant (la seule chose qui change entre A et B)       */
/* ------------------------------------------------------------------ */

const HEADLINES: Record<
  Measure,
  Record<Wording, { big: string; tone: "green" | "red"; quote: string; hidden: string }>
> = {
  sure: {
    A: {
      big: "200 personnes sauvées",
      tone: "green",
      quote: "A1\u00a0: la mesure qui permet de sauver exactement deux cents personnes.",
      hidden: "Les 400 morts sont toujours là (en rouge), mais la phrase n'en parle pas.",
    },
    B: {
      big: "400 personnes meurent",
      tone: "red",
      quote: "B1\u00a0: la mesure qui entraîne la mort d'exactement quatre cents personnes.",
      hidden: "Les 200 sauvés sont toujours là (en vert), mais la phrase n'en parle pas.",
    },
  },
  risk: {
    A: {
      big: "1 chance sur 3 de sauver les 600",
      tone: "green",
      quote:
        "A2\u00a0: une chance sur trois de sauver les six cents personnes, mais deux chances sur trois de les laisser toutes mourir.",
      hidden: "Même loterie qu'en B\u00a0: seuls les mots changent.",
    },
    B: {
      big: "2 chances sur 3 que les 600 meurent",
      tone: "red",
      quote:
        "B2\u00a0: une chance sur trois que personne ne soit tué et deux chances sur trois que tous le soient.",
      hidden: "Même loterie qu'en A\u00a0: seuls les mots changent.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Moyenne courante des tirages                                        */
/* ------------------------------------------------------------------ */

function RunningMean({ outcomes }: { outcomes: number[] }) {
  const n = outcomes.length;
  const xmax = Math.max(BATCH, Math.ceil(n / BATCH) * BATCH);
  const p = makePlot({ w: 380, h: 220, pL: 44, pR: 14, pT: 22, pB: 40, x: [0, xmax], y: [0, 600] });
  // chemin de la moyenne après chaque tirage (sous-échantillonné au-delà de 600 points)
  const step = Math.max(1, Math.ceil(n / 600));
  let cum = 0;
  let d = "";
  for (let i = 0; i < n; i++) {
    cum += outcomes[i];
    if ((i + 1) % step === 0 || i === n - 1) {
      const mean = (TOTAL * cum) / (i + 1);
      d += (d ? "L" : "M") + p.X(i + 1).toFixed(1) + " " + p.Y(mean).toFixed(1);
    }
  }
  const mean = n ? (TOTAL * cum) / n : 0;
  return (
    <PlotSvg
      p={p}
      maxW={460}
      label={`Moyenne des personnes sauvées après ${n} tirages : ${n ? Math.round(mean) : "aucun tirage"} ; valeur attendue 200.`}
    >
      <Frame
        p={p}
        xticks={[0, xmax / 2, xmax]}
        yticks={[0, 200, 400, 600]}
        xfmt={(t) => String(t)}
        yfmt={(t) => String(t)}
        xlabel="nombre de tirages"
        ylabel="sauvés en moyenne"
      />
      <line
        x1={p.X(0)}
        y1={p.Y(200)}
        x2={p.X(xmax)}
        y2={p.Y(200)}
        stroke={C.green}
        strokeWidth={1.8}
        strokeDasharray="6 4"
      />
      <Label p={p} x={xmax} y={200} anchor="end" dx={-2} dy={-7} color={C.green} size={13}>
        1/3 × 600 = 200
      </Label>
      {d ? (
        <path d={d} fill="none" stroke={C.blue} strokeWidth={2.2} strokeLinejoin="round" />
      ) : null}
      {n ? (
        <circle cx={p.X(n)} cy={p.Y(mean)} r={4.5} fill={C.blue} stroke="#fff" strokeWidth={1.5} />
      ) : null}
    </PlotSvg>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export function FramingGrid() {
  const [wording, setWording] = useState<Wording>("A");
  const [measure, setMeasure] = useState<Measure>("sure");
  const [outcomes, setOutcomes] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const queue = useRef<number[]>([]);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const pump = () => {
    const chunk = queue.current.splice(0, 6);
    if (chunk.length) setOutcomes((o) => [...o, ...chunk]);
    if (queue.current.length) {
      raf.current = requestAnimationFrame(pump);
    } else {
      raf.current = 0;
      setBusy(false);
    }
  };

  const draw = (k: number) => {
    if (busy) return;
    const n = Math.min(k, MAX_DRAWS - outcomes.length);
    if (n <= 0) return;
    // Math.random uniquement ici (au clic), jamais au rendu.
    const fresh = Array.from({ length: n }, () => (Math.random() < 1 / 3 ? 1 : 0));
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (n === 1 || reduce) {
      setOutcomes((o) => [...o, ...fresh]);
      return;
    }
    queue.current = fresh;
    setBusy(true);
    raf.current = requestAnimationFrame(pump);
  };

  const reset = () => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    queue.current = [];
    setBusy(false);
    setOutcomes([]);
  };

  const n = outcomes.length;
  const k = outcomes.reduce((s, v) => s + v, 0);
  const mean = n ? (TOTAL * k) / n : 0;
  const last = n ? outcomes[n - 1] : null;
  const h = HEADLINES[measure][wording];
  const other = wording === "A" ? "B" : "A";
  const key1 = wording === "A" ? "A1" : "B1";
  const key2 = wording === "A" ? "A2" : "B2";

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <InteractiveCard
      title="600 malades, deux formulations&nbsp;: même mesure, autre phrase mise en avant"
      subtitle="Slides 14-15 · chaque point = une personne (30 colonnes de 20). Vert = sauvée, rouge = morte."
      controls={
        <>
          <ChoiceChips<Wording>
            label="Formulation"
            value={wording}
            onChange={setWording}
            options={[
              { value: "A", label: "A : «\u00a0sauver\u00a0»" },
              { value: "B", label: "B : «\u00a0mourir\u00a0»" },
            ]}
          />
          <ChoiceChips<Measure>
            label="Mesure"
            value={measure}
            onChange={setMeasure}
            options={[
              { value: "sure", label: `Sûre (${key1})` },
              { value: "risk", label: `Risquée (${key2})` },
            ]}
          />
          {measure === "risk" ? (
            <div className="min-w-0">
              <div className="mb-1.5 text-[13px] font-semibold">Loterie</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={btn}
                  onClick={() => draw(1)}
                  disabled={busy || n >= MAX_DRAWS}
                >
                  <Dices className="h-3.5 w-3.5" aria-hidden />
                  Tirer au sort
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() => draw(BATCH)}
                  disabled={busy || n >= MAX_DRAWS}
                >
                  Tirer 300 fois
                </button>
                <button type="button" className={btn} onClick={reset} disabled={n === 0 && !busy}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Remettre à zéro
                </button>
              </div>
            </div>
          ) : (
            <p className="self-end text-[13px] leading-snug text-muted-foreground">
              Bascule A ↔ B et regarde la grille&nbsp;: pas un seul point ne change.
            </p>
          )}
        </>
      }
      footer={
        <>
          bascule entre A et B&nbsp;: les points ne bougent pas d'un pixel. Seule la phrase mise en avant
          change — l'aspect positif («&nbsp;sauvés&nbsp;») ou négatif («&nbsp;meurent&nbsp;») de la
          même mesure. C'est l'explication du slide 15&nbsp;: les mots rendent certains aspects plus
          visibles au moment de décider.
        </>
      }
    >
      {/* phrase mise en avant */}
      <div className="mb-3 rounded-xl border bg-muted/40 px-4 py-3" aria-live="polite">
        <div className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
          Formulation {wording} · ce que la phrase met en avant
        </div>
        <div
          className={
            "text-2xl font-extrabold leading-tight " +
            (h.tone === "green"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400")
          }
        >
          {h.big}
        </div>
        <p className="mt-1 text-[14px] italic leading-snug">«{NBSP}{h.quote}{NBSP}»</p>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{h.hidden}</p>
      </div>

      <PeopleGrid measure={measure} last={last} drawNo={n} />

      {measure === "risk" ? (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border bg-muted/40 px-2 py-2">
              <div className="text-[11px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
                Tirages
              </div>
              <div className="text-xl font-extrabold tabular-nums">{n}</div>
            </div>
            <div className="rounded-lg border bg-muted/40 px-2 py-2">
              <div className="text-[11px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
                «&nbsp;600 sauvés&nbsp;»
              </div>
              <div className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                {k}
                {NBSP}fois
              </div>
              <div className="text-[12px] tabular-nums text-muted-foreground">
                {n ? `soit ${Math.round((100 * k) / n)}${NBSP}%` : "≈ 1 fois sur 3"}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 px-2 py-2">
              <div className="text-[11px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
                Sauvés en moyenne
              </div>
              <div className="text-xl font-extrabold tabular-nums text-primary">
                {n ? Math.round(mean) : "—"}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <RunningMean outcomes={outcomes} />
          </div>
          <p className="mt-2 text-center text-[14px] leading-relaxed">
            Moyenne attendue&nbsp;: <M tex="\tfrac{1}{3}\times 600+\tfrac{2}{3}\times 0=200" /> personnes
            sauvées — exactement autant que la mesure sûre. Plus tu tires, plus la moyenne se
            rapproche de 200.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-center text-[14px] leading-relaxed">
          Mesure sûre&nbsp;: <strong>200 sauvés à coup sûr</strong>. Mesure risquée&nbsp;:{" "}
          <strong>200 sauvés en moyenne</strong>{" "}
          <span className="whitespace-nowrap">
            (<M tex="\tfrac{1}{3}\times 600" />)
          </span>{" "}
          — choisis «&nbsp;Risquée&nbsp;» pour tirer au sort.
        </p>
      )}

      {/* encadré : ce qu'impose la rationalité */}
      <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        <p>
          <strong>Les deux mesures sont identiques en A et en B</strong> (A1 = B1, A2 = B2). Un
          Econo peut préférer le sûr ou le pari, mais{" "}
          <strong>son choix ne peut pas dépendre des mots employés</strong>. Or{" "}
          <strong>100{NBSP}%</strong> des étudiants de la version A choisissent A1, et seulement{" "}
          <strong>39{NBSP}%</strong> de ceux de la version B choisissent B1.
        </p>
        <p className="mt-1.5">
          La théorie rationnelle n'impose ni A1 ni A2 (les deux sauvent 200 personnes en
          moyenne)&nbsp;; elle impose <strong>le même choix quelle que soit la formulation</strong>.
          Slide 15&nbsp;: un preneur de décision rationnel ne peut pas préférer A1 à A2 et, en même
          temps, B2 à B1.
        </p>
      </div>
      <p className="sr-only">
        Formulation actuelle : {wording}. Autre formulation : {other}.
      </p>
    </InteractiveCard>
  );
}
