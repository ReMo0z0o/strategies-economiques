/**
 * Résolution guidée · Examen blanc n° 2 — Partie 2 « Économie industrielle ».
 *
 * Trois questions (/100, 1h) :
 *  · Q1 (45 pts) — la grande chaîne : monopole → Cournot → Stackelberg →
 *    dissuasion d'entrée (Kappa & Lambda, p = 96 − y, Cm = 24).
 *  · Q2 (30 pts) — effets de réseau directs : Anna & Boris, matrice
 *    Acheter / Ne pas acheter, équilibres multiples, masse critique.
 *  · Q3 (25 pts) — réguler et taxer le monopole (Sigma, p = 40 − y, Cm = 10) :
 *    prix plafond, taxe unitaire, taxe sur le profit.
 *
 * Chaque valeur numérique est alignée sur le corrigé officiel
 * (exams/p2-blanc-2/corrige-body.html).
 */
import { ExamSolutionShell } from "@/components/course/ExamSolutionShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { TpRefList } from "@/components/course/TpRef";

/* ------------------------------------------------------------------ */
/* Helpers locaux (mêmes classes que dans les TP)                      */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Paire de couleurs de séries sûre pour le daltonisme (bleu / ambre). */
const COL_K = "#0284c7"; // sky-600   — Kappa / situation initiale
const COL_L = "#d97706"; // amber-600 — Lambda / situation modifiée

/* ------------------------------------------------------------------ */
/* Graphique · Q1 — fonctions de réaction et points remarquables       */
/* ------------------------------------------------------------------ */

function ReactionsCournotSvg() {
  const X = (v: number) => 50 + (v / 72) * 356;
  const Y = (v: number) => 292 - (v / 72) * 272;
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 345"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Fonctions de meilleure réponse de Kappa et de Lambda, avec l'équilibre de Cournot en (24 ; 24), le point de Stackelberg en (36 ; 18), la collusion symétrique en (18 ; 18), le monopole en (36 ; 0) et la production limite en (48 ; 0)"
      >
        {/* Grille et graduations */}
        {[0, 12, 24, 36, 48, 60, 72].map((v) => (
          <g key={v}>
            <line
              x1={X(v)}
              x2={X(v)}
              y1={Y(0)}
              y2={Y(72)}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            <line
              x1={X(0)}
              x2={X(72)}
              y1={Y(v)}
              y2={Y(v)}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            <text
              x={X(v)}
              y={307}
              fontSize={9.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {v}
            </text>
            {v > 0 ? (
              <text
                x={45}
                y={Y(v) + 3.5}
                fontSize={9.5}
                textAnchor="end"
                fill="var(--color-muted-foreground)"
              >
                {v}
              </text>
            ) : null}
          </g>
        ))}
        <text
          x={(X(0) + X(72)) / 2}
          y={327}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          production de Kappa yₖ
        </text>
        <text
          x={14}
          y={156}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          transform="rotate(-90 14 156)"
        >
          production de Lambda yₗ
        </text>

        {/* Meilleure réponse de Kappa : yK = 36 − yL/2 */}
        <line x1={X(36)} y1={Y(0)} x2={X(0)} y2={Y(72)} stroke={COL_K} strokeWidth={2.2} />
        <text x={92} y={48} fontSize={11.5} fontWeight={700} fill="var(--color-foreground)">
          Réaction de Kappa
        </text>

        {/* Meilleure réponse de Lambda : yL = 36 − yK/2 */}
        <line x1={X(0)} y1={Y(36)} x2={X(72)} y2={Y(0)} stroke={COL_L} strokeWidth={2.2} />
        <text
          x={404}
          y={252}
          fontSize={11.5}
          fontWeight={700}
          textAnchor="end"
          fill="var(--color-foreground)"
        >
          Réaction de Lambda
        </text>

        {/* Guides pointillés vers les axes depuis l'équilibre de Cournot */}
        <line
          x1={X(24)}
          y1={Y(24)}
          x2={X(24)}
          y2={Y(0)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={X(0)}
          y1={Y(24)}
          x2={X(24)}
          y2={Y(24)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Points remarquables */}
        <circle
          cx={X(24)}
          cy={Y(24)}
          r={5}
          fill="var(--color-foreground)"
          stroke="var(--color-card)"
          strokeWidth={2}
        />
        <text
          x={X(24) + 8}
          y={Y(24) - 8}
          fontSize={11.5}
          fontWeight={700}
          fill="var(--color-foreground)"
        >
          Cournot (24 ; 24)
        </text>

        <circle
          cx={X(36)}
          cy={Y(18)}
          r={4.5}
          fill={COL_K}
          stroke="var(--color-card)"
          strokeWidth={1.5}
        />
        <text
          x={X(36) + 10}
          y={Y(18) - 8}
          fontSize={10.5}
          fontWeight={600}
          fill="var(--color-foreground)"
        >
          Stackelberg (36 ; 18)
        </text>

        <circle
          cx={X(18)}
          cy={Y(18)}
          r={4.5}
          fill="var(--color-muted-foreground)"
          stroke="var(--color-card)"
          strokeWidth={1.5}
        />
        <text
          x={X(18) - 8}
          y={Y(18) + 4}
          fontSize={10.5}
          fontWeight={600}
          textAnchor="end"
          fill="var(--color-foreground)"
        >
          Collusion (18 ; 18)
        </text>

        <circle
          cx={X(36)}
          cy={Y(0)}
          r={4.5}
          fill="var(--color-muted-foreground)"
          stroke="var(--color-card)"
          strokeWidth={1.5}
        />
        <text
          x={X(36) - 6}
          y={Y(0) - 26}
          fontSize={10.5}
          fontWeight={600}
          textAnchor="end"
          fill="var(--color-foreground)"
        >
          Monopole (36 ; 0)
        </text>

        <circle
          cx={X(48)}
          cy={Y(0)}
          r={4.5}
          fill={COL_L}
          stroke="var(--color-card)"
          strokeWidth={1.5}
        />
        <text
          x={X(48) + 8}
          y={Y(0) - 10}
          fontSize={10.5}
          fontWeight={600}
          fill="var(--color-foreground)"
        >
          Limite (48 ; 0)
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Toute la question 1 sur un seul graphique : Cournot est à l'intersection des deux fonctions
        de réaction ; Stackelberg glisse le long de la réaction de Lambda ; la collusion symétrique
        (18 ; 18) et la production limite (48 ; 0) complètent le paysage.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Q1 — profits de Kappa et Lambda selon le régime         */
/* ------------------------------------------------------------------ */

function ProfitsRegimesSvg() {
  const Y = (v: number) => 205 - (v / 1400) * 178;
  const groups = [
    { label: "Monopole", price: "p = 60", k: 1296, l: null as number | null },
    { label: "Cournot", price: "p = 48", k: 576, l: 576 },
    { label: "Stackelberg", price: "p = 42", k: 648, l: 324 },
    { label: "Dissuasion", price: "p = 48", k: 1152, l: 0 },
  ];
  const cx = [92, 190, 288, 386];
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 460 262"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Profits de Kappa et Lambda : 1296 en monopole, 576 chacun en Cournot, 648 et 324 en Stackelberg, 1152 et 0 sous dissuasion d'entrée"
      >
        {/* Légende */}
        <rect x={50} y={4} width={10} height={10} rx={2} fill={COL_K} />
        <text x={64} y={13} fontSize={11} fill="var(--color-foreground)">
          Kappa
        </text>
        <rect x={116} y={4} width={10} height={10} rx={2} fill={COL_L} />
        <text x={130} y={13} fontSize={11} fill="var(--color-foreground)">
          Lambda
        </text>
        <text x={452} y={13} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
          profit
        </text>

        {/* Grille */}
        {[0, 300, 600, 900, 1200].map((v) => (
          <g key={v}>
            <line
              x1={50}
              x2={452}
              y1={Y(v)}
              y2={Y(v)}
              stroke={v === 0 ? "var(--color-foreground)" : "var(--color-border)"}
              strokeWidth={v === 0 ? 1.2 : 1}
            />
            <text
              x={45}
              y={Y(v) + 3.5}
              fontSize={9.5}
              textAnchor="end"
              fill="var(--color-muted-foreground)"
            >
              {v}
            </text>
          </g>
        ))}

        {groups.map((g, i) => (
          <g key={g.label}>
            <rect x={cx[i] - 37} y={Y(g.k)} width={35} height={205 - Y(g.k)} rx={3} fill={COL_K} />
            <text
              x={cx[i] - 19.5}
              y={Y(g.k) - 5}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.k}
            </text>
            {g.l !== null && g.l > 0 ? (
              <>
                <rect
                  x={cx[i] + 2}
                  y={Y(g.l)}
                  width={35}
                  height={205 - Y(g.l)}
                  rx={3}
                  fill={COL_L}
                />
                <text
                  x={cx[i] + 19.5}
                  y={Y(g.l) - 5}
                  fontSize={10}
                  fontWeight={600}
                  textAnchor="middle"
                  fill="var(--color-foreground)"
                >
                  {g.l}
                </text>
              </>
            ) : (
              <text
                x={cx[i] + 19.5}
                y={198}
                fontSize={9}
                textAnchor="middle"
                fill="var(--color-muted-foreground)"
              >
                {g.l === null ? "absente" : "0"}
              </text>
            )}
            <text
              x={cx[i]}
              y={226}
              fontSize={11.5}
              fontWeight={700}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.label}
            </text>
            <text
              x={cx[i]}
              y={240}
              fontSize={10.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {g.price}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Kappa classe les régimes : monopole (1296) ≻ dissuasion (1152) ≻ Stackelberg accommodé (648)
        ≻ Cournot (576). Sous dissuasion, Lambda renonce à entrer et gagne 0.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Q2 — demande en escalier sans effet de réseau           */
/* ------------------------------------------------------------------ */

function EscalierDemandeSvg() {
  const Y = (p: number) => 250 - (p / 72) * 215;
  const q0 = 70;
  const q1 = 215;
  const q2 = 360;
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 292"
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label="Demande en escalier : zéro licence si le prix dépasse 60, une licence entre 36 et 60, deux licences en dessous de 36"
      >
        {/* Axes */}
        <line
          x1={60}
          y1={250}
          x2={410}
          y2={250}
          stroke="var(--color-foreground)"
          strokeWidth={1.3}
        />
        <line x1={q0} y1={22} x2={q0} y2={250} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <text x={40} y={18} fontSize={11} fill="var(--color-muted-foreground)">
          prix p
        </text>
        <text
          x={240}
          y={284}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          nombre de licences vendues
        </text>

        {/* Guides des seuils */}
        <line
          x1={q0}
          y1={Y(36)}
          x2={q1}
          y2={Y(36)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={64}
          y={Y(60) + 4}
          fontSize={10}
          textAnchor="end"
          fill="var(--color-foreground)"
          fontWeight={600}
        >
          60
        </text>
        <text
          x={64}
          y={Y(36) + 4}
          fontSize={10}
          textAnchor="end"
          fill="var(--color-foreground)"
          fontWeight={600}
        >
          36
        </text>
        <text x={64} y={254} fontSize={10} textAnchor="end" fill="var(--color-muted-foreground)">
          0
        </text>

        {/* Escalier de demande */}
        <line x1={q0} y1={Y(72)} x2={q0} y2={Y(60)} stroke={COL_K} strokeWidth={3.2} />
        <line
          x1={q0}
          y1={Y(60)}
          x2={q1}
          y2={Y(60)}
          stroke={COL_K}
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />
        <line x1={q1} y1={Y(60)} x2={q1} y2={Y(36)} stroke={COL_K} strokeWidth={3.2} />
        <line
          x1={q1}
          y1={Y(36)}
          x2={q2}
          y2={Y(36)}
          stroke={COL_K}
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />
        <line x1={q2} y1={Y(36)} x2={q2} y2={250} stroke={COL_K} strokeWidth={3.2} />
        {[
          [q0, Y(72)],
          [q0, Y(60)],
          [q1, Y(60)],
          [q1, Y(36)],
          [q2, Y(36)],
          [q2, 250],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={COL_K}
            stroke="var(--color-card)"
            strokeWidth={1.2}
          />
        ))}

        {/* Libellés de zone */}
        <text x={84} y={48} fontSize={10.5} fill="var(--color-foreground)">
          y = 0 : personne n'achète (p &gt; 60)
        </text>
        <text x={227} y={108} fontSize={10.5} fill="var(--color-foreground)">
          y = 1 : seule Anna achète
        </text>
        <text x={227} y={121} fontSize={10} fill="var(--color-muted-foreground)">
          (36 &lt; p &lt; 60)
        </text>
        <text x={352} y={200} fontSize={10.5} textAnchor="end" fill="var(--color-foreground)">
          y = 2 : Anna et Boris achètent
        </text>
        <text x={352} y={213} fontSize={10} textAnchor="end" fill="var(--color-muted-foreground)">
          (p &lt; 36)
        </text>

        {/* Graduations x */}
        <text x={q0} y={264} fontSize={10} textAnchor="middle" fill="var(--color-muted-foreground)">
          0
        </text>
        <text x={q1} y={264} fontSize={10} textAnchor="middle" fill="var(--color-muted-foreground)">
          1
        </text>
        <text x={q2} y={264} fontSize={10} textAnchor="middle" fill="var(--color-muted-foreground)">
          2
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Sans effet de réseau, la demande est un simple escalier : chaque baisse de prix franchit un
        seuil de disposition à payer (60 pour Anna, 36 pour Boris) et gagne un acheteur.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Q3 — monopole non régulé vs prix plafond p = Cm         */
/* ------------------------------------------------------------------ */

function MonopoleReguleSvg() {
  const X = (y: number) => 52 + (y / 40) * 350;
  const Y = (p: number) => 285 - (p / 40) * 255;
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 330"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Monopole Sigma : optimum privé en (15 ; 25), équilibre régulé au coût marginal en (30 ; 10), et perte sèche de 112,5 éliminée par la régulation"
      >
        {/* Perte sèche (triangle entre demande, Cm, et y = 15) */}
        <polygon
          points={`${X(15)},${Y(25)} ${X(15)},${Y(10)} ${X(30)},${Y(10)}`}
          fill="#fda4af"
          fillOpacity={0.45}
          stroke="#e11d48"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text x={206} y={190} fontSize={10.5} fontWeight={600} fill="#be123c">
          perte sèche
        </text>
        <text x={206} y={203} fontSize={10.5} fontWeight={600} fill="#be123c">
          = 112,5
        </text>

        {/* Axes */}
        <line
          x1={52}
          y1={285}
          x2={402}
          y2={285}
          stroke="var(--color-foreground)"
          strokeWidth={1.3}
        />
        <line x1={52} y1={30} x2={52} y2={285} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <text x={396} y={302} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
          quantité y
        </text>
        <text x={30} y={24} fontSize={11} fill="var(--color-muted-foreground)">
          prix
        </text>

        {/* Demande p = 40 − y */}
        <line
          x1={X(0)}
          y1={Y(40)}
          x2={X(40)}
          y2={Y(0)}
          stroke="var(--color-foreground)"
          strokeWidth={2.2}
        />
        <text x={352} y={240} fontSize={10.5} fontWeight={600} fill="var(--color-foreground)">
          Demande
        </text>

        {/* Rm = 40 − 2y */}
        <line
          x1={X(0)}
          y1={Y(40)}
          x2={X(20)}
          y2={Y(0)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.8}
        />
        <text x={222} y={268} fontSize={10.5} fontWeight={600} fill="var(--color-muted-foreground)">
          Rm
        </text>

        {/* Cm = 10 */}
        <line
          x1={52}
          y1={Y(10)}
          x2={402}
          y2={Y(10)}
          stroke="var(--color-foreground)"
          strokeWidth={1.6}
        />
        <text
          x={58}
          y={Y(10) - 7}
          fontSize={10.5}
          fontWeight={600}
          fill="var(--color-muted-foreground)"
        >
          Cm = 10
        </text>

        {/* Optimum du monopole (15 ; 25) */}
        <line
          x1={X(15)}
          y1={Y(25)}
          x2={X(15)}
          y2={285}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={52}
          y1={Y(25)}
          x2={X(15)}
          y2={Y(25)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle
          cx={X(15)}
          cy={Y(25)}
          r={5}
          fill={COL_K}
          stroke="var(--color-card)"
          strokeWidth={2}
        />
        <text
          x={X(15) + 8}
          y={Y(25) - 6}
          fontSize={11}
          fontWeight={700}
          fill="var(--color-foreground)"
        >
          Optimum du monopole (15 ; 25)
        </text>

        {/* Équilibre régulé (30 ; 10) */}
        <circle
          cx={X(30)}
          cy={Y(10)}
          r={5}
          fill="#059669"
          stroke="var(--color-card)"
          strokeWidth={2}
        />
        <text x={X(30) + 8} y={Y(10) - 7} fontSize={11} fontWeight={700} fill="#047857">
          Régulé (30 ; 10)
        </text>

        {/* Graduations */}
        <text
          x={X(15)}
          y={299}
          fontSize={9.5}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          15
        </text>
        <text
          x={X(30)}
          y={299}
          fontSize={9.5}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          30
        </text>
        <text
          x={X(40)}
          y={299}
          fontSize={9.5}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          40
        </text>
        <text
          x={47}
          y={Y(25) + 3.5}
          fontSize={9.5}
          textAnchor="end"
          fill="var(--color-muted-foreground)"
        >
          25
        </text>
        <text
          x={47}
          y={Y(10) + 3.5}
          fontSize={9.5}
          textAnchor="end"
          fill="var(--color-muted-foreground)"
        >
          10
        </text>
        <text
          x={47}
          y={Y(40) + 3.5}
          fontSize={9.5}
          textAnchor="end"
          fill="var(--color-muted-foreground)"
        >
          40
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Le plafond <M tex="\bar p = Cm" /> déplace Sigma de l'optimum privé (15 ; 25) vers le point
        concurrentiel (30 ; 10) : la production double et le triangle de perte sèche disparaît.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Q3 — taxe unitaire : le coût marginal se déplace        */
/* ------------------------------------------------------------------ */

function TaxeUnitaireSvg() {
  const X = (y: number) => 52 + (y / 40) * 350;
  const Y = (p: number) => 285 - (p / 40) * 255;
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 330"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Avec la taxe de 4 par unité, le coût marginal effectif passe de 10 à 14 : l'optimum glisse de (15 ; 25) à (13 ; 27), le prix ne monte que de 2, soit la moitié de la taxe"
      >
        {/* Axes */}
        <line
          x1={52}
          y1={285}
          x2={402}
          y2={285}
          stroke="var(--color-foreground)"
          strokeWidth={1.3}
        />
        <line x1={52} y1={30} x2={52} y2={285} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <text x={396} y={302} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
          quantité y
        </text>
        <text x={30} y={24} fontSize={11} fill="var(--color-muted-foreground)">
          prix
        </text>

        {/* Demande et Rm */}
        <line
          x1={X(0)}
          y1={Y(40)}
          x2={X(40)}
          y2={Y(0)}
          stroke="var(--color-foreground)"
          strokeWidth={2.2}
        />
        <text x={352} y={240} fontSize={10.5} fontWeight={600} fill="var(--color-foreground)">
          Demande
        </text>
        <line
          x1={X(0)}
          y1={Y(40)}
          x2={X(20)}
          y2={Y(0)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.8}
        />
        <text x={222} y={268} fontSize={10.5} fontWeight={600} fill="var(--color-muted-foreground)">
          Rm
        </text>

        {/* Cm et Cm + t */}
        <line
          x1={52}
          y1={Y(10)}
          x2={402}
          y2={Y(10)}
          stroke="var(--color-foreground)"
          strokeWidth={1.6}
        />
        <text
          x={396}
          y={Y(10) + 14}
          fontSize={10.5}
          fontWeight={600}
          textAnchor="end"
          fill="var(--color-muted-foreground)"
        >
          Cm = 10
        </text>
        <line
          x1={52}
          y1={Y(14)}
          x2={402}
          y2={Y(14)}
          stroke={COL_L}
          strokeWidth={2}
          strokeDasharray="7 4"
        />
        <text x={396} y={Y(14) - 7} fontSize={10.5} fontWeight={700} textAnchor="end" fill={COL_L}>
          Cm + t = 14
        </text>

        {/* Guides des deux optima */}
        <line
          x1={52}
          y1={Y(25)}
          x2={X(15)}
          y2={Y(25)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={X(15)}
          y1={Y(25)}
          x2={X(15)}
          y2={285}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={52}
          y1={Y(27)}
          x2={X(13)}
          y2={Y(27)}
          stroke={COL_L}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={X(13)}
          y1={Y(27)}
          x2={X(13)}
          y2={285}
          stroke={COL_L}
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* Points avant / après taxe */}
        <circle
          cx={X(15)}
          cy={Y(25)}
          r={5}
          fill="var(--color-muted-foreground)"
          stroke="var(--color-card)"
          strokeWidth={2}
        />
        <text
          x={160}
          y={150}
          fontSize={10.5}
          fontWeight={600}
          textAnchor="end"
          fill="var(--color-muted-foreground)"
        >
          avant taxe (15 ; 25)
        </text>
        <circle
          cx={X(13)}
          cy={Y(27)}
          r={5}
          fill={COL_L}
          stroke="var(--color-card)"
          strokeWidth={2}
        />
        <text x={176} y={104} fontSize={10.5} fontWeight={700} fill={COL_L}>
          avec la taxe (13 ; 27)
        </text>

        {/* Écart de prix +2 */}
        <line
          x1={62}
          y1={Y(25)}
          x2={62}
          y2={Y(27)}
          stroke="var(--color-foreground)"
          strokeWidth={1.4}
        />
        <text
          x={67}
          y={(Y(25) + Y(27)) / 2 + 3.5}
          fontSize={10}
          fontWeight={700}
          fill="var(--color-foreground)"
        >
          +2 = t/2
        </text>

        {/* Graduations */}
        <text x={X(13)} y={299} fontSize={9.5} textAnchor="middle" fill={COL_L}>
          13
        </text>
        <text
          x={X(15) + 4}
          y={299}
          fontSize={9.5}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          15
        </text>
        <text x={47} y={Y(27) + 3} fontSize={9.5} textAnchor="end" fill={COL_L}>
          27
        </text>
        <text
          x={47}
          y={Y(25) + 8}
          fontSize={9.5}
          textAnchor="end"
          fill="var(--color-muted-foreground)"
        >
          25
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        La taxe unitaire déplace la droite de coût marginal vers le haut (10 → 14). Le nouvel
        optimum <M tex="Rm = Cm + t" /> donne (13 ; 27) : le prix ne monte que de 2 — la firme
        absorbe l'autre moitié de la taxe.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function ExamSolution() {
  return (
    <ExamSolutionShell examId="p2-blanc-2">
      <Callout variant="examen" title="Gérer ton heure d'épreuve">
        <p>
          Le barème te donne le tempo : /100 points en 60 minutes, soit environ{" "}
          <strong>1 point ≈ 36 secondes</strong>. Vise ~26 min pour la question 1 (45 pts), ~17 min
          pour la question 2 (30 pts), ~14 min pour la question 3 (25 pts) — et garde 3 minutes de
          relecture pour vérifier tes valeurs numériques (un prix négatif ou un profit de duopole
          supérieur au profit de monopole doit te faire tiquer immédiatement).
        </p>
      </Callout>

      {/* ============================================================ */}
      {/* Question 1 — la grande chaîne monopole → Cournot →            */}
      {/* Stackelberg → dissuasion d'entrée                             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-2"
        id="q1"
        number={1}
        title="Question 1 — La grande chaîne : monopole, Cournot, Stackelberg, dissuasion d'entrée (45 pts)"
        difficulty={3}
        refs={[
          { chapter: "ei1", section: "maximisation", label: "Rm = Cm" },
          { chapter: "ei2", section: "cournot", label: "Cournot" },
          { chapter: "ei2", section: "stackelberg", label: "Stackelberg" },
          { chapter: "ei2", section: "entree", label: "Dissuasion d'entrée" },
        ]}
        statement={
          <>
            <p>
              L'entreprise Kappa est en monopole sur son marché. Elle fait face à la fonction de
              demande inverse suivante : <M tex="p = 96 - y" />, où <M tex="p" /> est le prix et{" "}
              <M tex="y" /> la quantité totale vendue sur ce marché. Kappa est confrontée à un coût
              marginal constant de 24 et n'a aucun coût fixe.{" "}
              <em>Détaille ton raisonnement à chaque étape.</em>
            </p>
            <SubQuestion label="1.1)">
              Quelle est la production optimale de Kappa ? À quel prix va-t-elle vendre cette
              production ? Quel est son profit ? Quel est le surplus des consommateurs ? (10 points)
            </SubQuestion>
            <SubQuestion label="1.2)">
              Une seconde entreprise, Lambda, produisant le même bien que Kappa, s'installe sur le
              marché. Elle fait face aux mêmes coûts que Kappa. Les deux entreprises se font une
              concurrence à la Cournot. Dérive la fonction de meilleure réponse de chaque firme.
              Quelles sont les productions optimales de chaque firme ? À quel prix vont-elles vendre
              ces productions ? Quels sont les profits de chaque firme ? (12 points)
            </SubQuestion>
            <SubQuestion label="1.3)">
              Suppose que, de façon crédible, Kappa puisse établir sa production avant Lambda. Les
              firmes se font donc une concurrence à la Stackelberg. Quelles sont les productions
              optimales de chaque firme ? À quel prix vont-elles vendre ces productions ? Quels sont
              les profits de chaque firme ? Compare brièvement cette situation avec l'équilibre de
              Cournot de la question 1.2) : qui y gagne, qui y perd ? (10 points)
            </SubQuestion>
            <SubQuestion label="1.4)">
              Reviens sur la question 1.3), mais suppose que pour s'établir sur le marché, Lambda
              doive payer un coût fixe égal à 144. Kappa, quant à elle, n'a aucun coût fixe à payer.
              Quelle quantité Kappa devrait-elle produire pour empêcher Lambda d'entrer ? À supposer
              que cette attitude de Kappa ne soit pas interdite, est-ce une attitude profitable ?
              Que dirait le droit de la concurrence d'une telle stratégie ? (13 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : une seule demande, quatre structures de marché",
            refs: [
              { chapter: "ei2", section: "intro", label: "Pourquoi l'oligopole" },
              { chapter: "ei2", section: "synthese", label: "Synthèse EI2" },
            ],
            content: (
              <>
                <p>
                  C'est LA question-fleuve classique de l'examen : le <em>même</em> marché (
                  <M tex="p = 96 - y" />, <M tex="Cm = 24" />, pas de coût fixe) traverse quatre
                  structures successives. Avant de calculer quoi que ce soit, repère les mots-clés
                  qui te disent quelle méthode dégainer :
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[34rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Sous-question</th>
                        <th className={TH}>Indice dans l'énoncé</th>
                        <th className={TH}>Méthode à dégainer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>1.1</td>
                        <td className={TD}>« est en monopole »</td>
                        <td className={TD}>
                          maximiser le profit : <M tex="Rm = Cm" />
                        </td>
                      </tr>
                      <tr>
                        <td className={TD}>1.2</td>
                        <td className={TD}>« concurrence à la Cournot », « meilleure réponse »</td>
                        <td className={TD}>dériver les deux réactions, résoudre le système</td>
                      </tr>
                      <tr>
                        <td className={TD}>1.3</td>
                        <td className={TD}>
                          « <em>de façon crédible</em>, établir sa production <em>avant</em> »
                        </td>
                        <td className={TD}>
                          Stackelberg : substituer la réaction du suiveur chez le leader
                        </td>
                      </tr>
                      <tr>
                        <td className={TD}>1.4</td>
                        <td className={TD}>« coût fixe d'entrée », « empêcher Lambda d'entrer »</td>
                        <td className={TD}>
                          production limite : annuler le profit d'entrée de l'entrant
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Callout variant="methode" title="Le réflexe qui fait gagner 10 minutes">
                  <p>
                    Dans toute la question, la <strong>marge brute maximale</strong> vaut{" "}
                    <M tex="96 - 24 = 72" /> : c'est l'écart entre le prix d'étranglement et le coût
                    marginal. Ce « 72 » va réapparaître partout — profit du monopole{" "}
                    <M tex="72y - y^2" />, réactions <M tex="\tfrac{1}{2}(72 - y_j)" />, profit
                    d'entrée <M tex="\tfrac{1}{4}(72 - y_K)^2 - F" />. Calcule-le une fois, puis
                    recycle-le : chaque sous-question réutilise les briques de la précédente.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 · Poser le profit du monopole et appliquer Rm = Cm",
            refs: [
              { chapter: "ei1", section: "maximisation", label: "Rm = Cm" },
              { chapter: "ei1", section: "recette", label: "Rm < p" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette mise en équation ?</strong> Le monopole choisit sa quantité{" "}
                  <M tex="y" /> ; le prix, lui, découle mécaniquement de la demande inverse. On
                  remplace donc <M tex="p" /> par <M tex="96 - y" /> dans le profit pour n'avoir
                  qu'une seule variable :
                </p>
                <MB tex="\pi_K(y) = \underbrace{(96 - y)\,y}_{\text{recette totale}} - \underbrace{24\,y}_{\text{coût total}}" />
                <p>On développe pour préparer la dérivation :</p>
                <MB tex="\pi_K(y) = 96\,y - y^2 - 24\,y = 72\,y - y^2" />
                <p>
                  Le profit est une parabole tournée vers le bas : son sommet est atteint là où la
                  dérivée s'annule. C'est la <strong>condition du premier ordre</strong> (CPO), qui
                  n'est rien d'autre que « recette marginale = coût marginal » :
                </p>
                <MB tex="\frac{d\pi_K}{dy} = 72 - 2y = 0 \;\iff\; 2y = 72 \;\iff\; y^* = 36" />
                <p>
                  (Vérifie que tu retrouves la même chose en écrivant <M tex="Rm = 96 - 2y" /> et{" "}
                  <M tex="Cm = 24" /> : <M tex="96 - 2y = 24 \iff y = 36" />
                  .) On remonte ensuite la demande inverse pour trouver le prix de vente :
                </p>
                <MB tex="p^* = 96 - 36 = 60" />
                <Callout variant="attention">
                  <p>
                    Ne confonds pas <M tex="Rm = Cm" /> (l'optimum du monopole) avec{" "}
                    <M tex="p = Cm" /> (la référence concurrentielle, qui donnerait ici{" "}
                    <M tex="y = 72" /> et un profit nul). La recette marginale{" "}
                    <M tex="Rm = 96 - 2y" /> décroît <strong>deux fois plus vite</strong> que la
                    demande : vendre une unité de plus rapporte le prix de cette unité, mais fait
                    baisser le prix de toutes les unités déjà vendues.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 · Calculer le profit et le surplus des consommateurs",
            refs: [{ chapter: "ei1", section: "inefficacite", label: "Surplus et perte sèche" }],
            content: (
              <>
                <p>
                  <strong>Le profit</strong> : sans coût fixe, c'est simplement la marge unitaire
                  multipliée par la quantité :
                </p>
                <MB tex="\pi_K = (p^* - Cm)\times y^* = (60 - 24)\times 36 = 36 \times 36 = 1296" />
                <p>
                  <strong>Le surplus des consommateurs</strong> : c'est l'aire du triangle compris
                  entre la courbe de demande et la droite du prix payé, de <M tex="0" /> à{" "}
                  <M tex="y^*" />. Sa hauteur est l'écart entre le prix d'étranglement (96, le prix
                  au-delà duquel plus personne n'achète) et le prix payé (60) ; sa base est la
                  quantité vendue (36) :
                </p>
                <MB tex="SC = \tfrac{1}{2}\times(96 - 60)\times 36 = \tfrac{1}{2}\times 36\times 36 = 648" />
                <p>
                  Remarque élégante (et utile pour vérifier) : avec une demande de pente{" "}
                  <M tex="-1" />, on a toujours <M tex="SC = \tfrac{1}{2}\,y^2" />. Ici{" "}
                  <M tex="\tfrac{1}{2}\times 36^2 = 648" /> — cohérent.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème réserve 2 points au surplus des consommateurs — souvent oublié en fin
                    de sous-question ! Un micro-croquis (triangle entre la demande et{" "}
                    <M tex="p^* = 60" />) suffit à justifier la formule{" "}
                    <M tex="\tfrac{1}{2}\times\text{base}\times\text{hauteur}" /> et sécurise ces
                    points en 30 secondes.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 · Dériver la fonction de meilleure réponse de chaque firme",
            refs: [{ chapter: "ei2", section: "cournot", label: "Cournot" }],
            content: (
              <>
                <p>
                  <strong>Ce qui change avec l'arrivée de Lambda :</strong> le prix dépend
                  maintenant de la production <em>totale</em> <M tex="y = y_K + y_L" />. Chaque
                  firme choisit sa propre quantité en prenant celle de l'autre{" "}
                  <strong>comme donnée</strong> — c'est la définition de la concurrence à la
                  Cournot. Écrivons le profit de Kappa :
                </p>
                <MB tex="\pi_K = (96 - y_K - y_L)\,y_K - 24\,y_K" />
                <p>On développe (regarde le 72 réapparaître) :</p>
                <MB tex="\pi_K = 72\,y_K - y_K^2 - y_L\,y_K" />
                <p>
                  Kappa maximise par rapport à <M tex="y_K" /> <em>seulement</em>, en traitant{" "}
                  <M tex="y_L" /> comme une constante — d'où une dérivée <em>partielle</em> :
                </p>
                <MB tex="\frac{\partial \pi_K}{\partial y_K} = 72 - 2\,y_K - y_L = 0" />
                <p>
                  On isole <M tex="y_K" /> pour obtenir la{" "}
                  <strong>fonction de meilleure réponse</strong> de Kappa (sa production optimale
                  pour chaque niveau possible de <M tex="y_L" />) :
                </p>
                <MB tex="2\,y_K = 72 - y_L \;\iff\; y_K = \frac{72 - y_L}{2} = 36 - \frac{y_L}{2}" />
                <p>
                  Lambda a exactement les mêmes coûts et la même demande : son problème est le
                  miroir de celui de Kappa, et sa meilleure réponse s'obtient en échangeant les
                  indices.
                </p>
                <FormulaBox
                  label="Les deux fonctions de meilleure réponse"
                  tex="y_K = 36 - \frac{y_L}{2} \qquad\text{et}\qquad y_L = 36 - \frac{y_K}{2}"
                  caption={
                    <>
                      Chaque unité produite par le rival réduit ma production optimale d'une
                      demi-unité : les quantités sont des <em>substituts stratégiques</em>.
                    </>
                  }
                />
                <Callout variant="attention">
                  <p>
                    Le « 2 » de la CPO ne doit apparaître que devant <strong>ta propre</strong>{" "}
                    quantité (<M tex="72 - 2y_K - y_L" />
                    ), jamais devant celle du rival. Si tu obtiens <M tex="72 - 2y_K - 2y_L" />,
                    c'est que tu as dérivé la production totale au lieu de la seule production de
                    Kappa — erreur qui fausse toute la suite de la question.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 · Résoudre le système : l'équilibre de Cournot-Nash",
            refs: [
              { chapter: "ei2", section: "cournot", label: "Cournot" },
              { chapter: "ei2", section: "exemple-cournot", label: "Exemple Cournot-Nash" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi un système ?</strong> À l'équilibre de Cournot-Nash, chacun joue
                  sa meilleure réponse <em>à ce que l'autre joue effectivement</em> : les deux
                  conditions doivent être vraies en même temps. On substitue la réaction de Lambda
                  dans celle de Kappa :
                </p>
                <MB tex="y_K = 36 - \frac{1}{2}\Bigl(36 - \frac{y_K}{2}\Bigr)" />
                <p>On distribue le facteur 1/2 :</p>
                <MB tex="y_K = 36 - 18 + \frac{y_K}{4} = 18 + \frac{y_K}{4}" />
                <p>
                  On regroupe les <M tex="y_K" /> à gauche :
                </p>
                <MB tex="y_K - \frac{y_K}{4} = 18 \;\iff\; \frac{3}{4}\,y_K = 18 \;\iff\; y_K = 24" />
                <p>
                  Et en réinjectant dans la réaction de Lambda : <M tex="y_L = 36 - 24/2 = 24" />.
                  (Raccourci accepté : les firmes étant identiques, l'équilibre est symétrique —
                  poser <M tex="y_K = y_L" /> directement dans une réaction donne{" "}
                  <M tex="\tfrac{3}{2}y_K = 36" />, soit 24. Mais annonce l'argument de symétrie, ne
                  l'utilise pas en douce.) Prix et profits :
                </p>
                <MB tex="p = 96 - 24 - 24 = 48 \qquad \pi_K = \pi_L = (48 - 24)\times 24 = 576" />
                <ReactionsCournotSvg />
                <Callout variant="examen" title="La vérification qui rassure le correcteur">
                  <p>
                    Compare toujours avec la sous-question précédente : production totale{" "}
                    <M tex="48 > 36" />, prix <M tex="48 < 60" />, somme des profits{" "}
                    <M tex="1152 < 1296" />. La concurrence augmente les quantités, baisse le prix
                    et détruit du profit joint — si l'un de ces trois sens est inversé dans ta
                    copie, tu as une erreur de calcul quelque part.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 · Stackelberg : substituer la réaction du suiveur chez le leader",
            refs: [{ chapter: "ei2", section: "stackelberg", label: "Stackelberg" }],
            content: (
              <>
                <p>
                  <strong>Le raisonnement se fait à rebours</strong> (induction à rebours) : Lambda
                  joue en second et <em>observe</em> <M tex="y_K" /> — elle jouera donc
                  mécaniquement sa meilleure réponse <M tex="y_L = \tfrac{1}{2}(72 - y_K)" />{" "}
                  calculée en 1.2. Kappa le sait, et intègre cette réaction <em>dans</em> son propre
                  profit avant de choisir :
                </p>
                <MB tex="\pi_K = \Bigl(96 - y_K - \underbrace{\tfrac{1}{2}(72 - y_K)}_{=\,y_L}\Bigr)\,y_K - 24\,y_K" />
                <p>
                  Simplifions la parenthèse pas à pas : <M tex="\tfrac{1}{2}\times 72 = 36" /> et{" "}
                  <M tex="-y_K + \tfrac{1}{2}y_K = -\tfrac{1}{2}y_K" />, donc
                </p>
                <MB tex="\pi_K = \Bigl(60 - \tfrac{1}{2}\,y_K\Bigr)\,y_K - 24\,y_K = 36\,y_K - \tfrac{1}{2}\,y_K^2" />
                <p>Condition du premier ordre du leader :</p>
                <MB tex="\frac{d\pi_K}{dy_K} = 36 - y_K = 0 \;\iff\; y_K = 36" />
                <p>
                  Lambda répond alors sur sa fonction de réaction, et le prix se lit sur la demande
                  :
                </p>
                <MB tex="y_L = \tfrac{1}{2}\,(72 - 36) = 18 \qquad p = 96 - 36 - 18 = 42" />
                <MB tex="\pi_K = (42 - 24)\times 36 = 648 \qquad \pi_L = (42 - 24)\times 18 = 324" />
                <p>
                  Clin d'œil amusant : le leader produit exactement sa quantité de monopole (36).
                  C'est une coïncidence propre à la demande linéaire avec coût marginal constant —
                  ne l'érige pas en règle générale.
                </p>
                <Callout variant="methode">
                  <p>
                    Les mots « <em>de façon crédible</em>, avant » sont le signal Stackelberg. La
                    seule différence avec Cournot : le leader ne traite plus <M tex="y_L" /> comme
                    une constante, il la <strong>remplace par la fonction de réaction</strong> du
                    suiveur. Si tu dérives le profit du leader en gardant <M tex="y_L" /> fixe, tu
                    retombes sur Cournot et tu perds les points de méthode (3 pts au barème rien que
                    pour cette substitution).
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 · Comparer Cournot et Stackelberg : qui y gagne, qui y perd ?",
            refs: [
              { chapter: "ei2", section: "stackelberg", label: "Stackelberg" },
              { chapter: "ei2", section: "isoprofit", label: "Iso-profits" },
            ],
            content: (
              <>
                <p>
                  Mets les deux équilibres côte à côte (avec le monopole de 1.1 en référence) — le
                  correcteur adore ce tableau, et il te servira de brouillon de vérification :
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[30rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Régime</th>
                        <th className={THc}>
                          <M tex="y_K" />
                        </th>
                        <th className={THc}>
                          <M tex="y_L" />
                        </th>
                        <th className={THc}>
                          <M tex="y" />
                        </th>
                        <th className={THc}>
                          <M tex="p" />
                        </th>
                        <th className={THc}>
                          <M tex="\pi_K" />
                        </th>
                        <th className={THc}>
                          <M tex="\pi_L" />
                        </th>
                        <th className={THc}>
                          <M tex="SC" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>Monopole (1.1)</td>
                        <td className={TDc}>36</td>
                        <td className={TDc}>—</td>
                        <td className={TDc}>36</td>
                        <td className={TDc}>60</td>
                        <td className={TDc}>1296</td>
                        <td className={TDc}>—</td>
                        <td className={TDc}>648</td>
                      </tr>
                      <tr>
                        <td className={TD}>Cournot (1.2)</td>
                        <td className={TDc}>24</td>
                        <td className={TDc}>24</td>
                        <td className={TDc}>48</td>
                        <td className={TDc}>48</td>
                        <td className={TDc}>576</td>
                        <td className={TDc}>576</td>
                        <td className={TDc}>1152</td>
                      </tr>
                      <tr>
                        <td className={TD}>Stackelberg (1.3)</td>
                        <td className={TDc}>36</td>
                        <td className={TDc}>18</td>
                        <td className={TDc}>54</td>
                        <td className={TDc}>42</td>
                        <td className={TDc}>648</td>
                        <td className={TDc}>324</td>
                        <td className={TDc}>1458</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>La comparaison demandée tient en trois phrases :</p>
                <ul className="my-2 ml-5 list-disc space-y-1">
                  <li>
                    <strong>Kappa (leader) y gagne</strong> : elle produit plus (36 contre 24) et
                    son profit monte de 576 à 648. C'est l'<em>avantage au premier joueur</em>.
                  </li>
                  <li>
                    <strong>Lambda (suiveur) y perd</strong> : face au marché déjà inondé par le
                    leader, elle se replie sur 18 unités et son profit chute de 576 à 324.
                  </li>
                  <li>
                    <strong>Les consommateurs y gagnent</strong> : la production totale passe de 48
                    à 54, donc le prix baisse de 48 à 42 (et le surplus grimpe de 1152 à 1458).
                  </li>
                </ul>
                <Callout variant="intuition">
                  <p>
                    D'où vient l'avantage du leader ? De l'<strong>engagement</strong>. En
                    produisant 36 <em>de façon irréversible</em>, Kappa met Lambda devant le fait
                    accompli : la meilleure chose que Lambda puisse encore faire est de se
                    restreindre à 18 pour ne pas effondrer le prix. Une simple <em>annonce</em> («
                    je produirai 36 ») ne suffirait pas : sans engagement crédible, Kappa aurait
                    intérêt à dévier, Lambda le sait, et on retomberait sur Cournot. D'où
                    l'insistance de l'énoncé sur « de façon crédible ».
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.4 · Écrire le profit d'entrée de Lambda en fonction du seul choix de Kappa",
            refs: [{ chapter: "ei2", section: "entree", label: "Dissuasion d'entrée" }],
            content: (
              <>
                <p>
                  <strong>La logique :</strong> Lambda entre si, et seulement si, ce qu'elle
                  gagnerait <em>après</em> être entrée couvre son coût fixe d'entrée{" "}
                  <M tex="F = 144" />. Or, si elle entre après avoir observé <M tex="y_K" />, elle
                  jouera sa meilleure réponse <M tex="y_L = \tfrac{1}{2}(72 - y_K)" /> (toujours la
                  même, calculée en 1.2 !). Il faut donc exprimer son profit d'entrée en fonction du{" "}
                  <em>seul</em> levier de Kappa : <M tex="y_K" />.
                </p>
                <MB tex="\pi_L = (96 - y_K - y_L)\,y_L - 24\,y_L - F = (72 - y_K - y_L)\,y_L - F" />
                <p>
                  Astuce de calcul : la marge unitaire <M tex="72 - y_K - y_L" /> devient, une fois
                  la meilleure réponse substituée,
                </p>
                <MB tex="72 - y_K - \tfrac{1}{2}(72 - y_K) = \tfrac{1}{2}(72 - y_K) = y_L" />
                <p>
                  La marge de l'entrant est donc exactement égale à sa quantité, et son profit brut
                  est un carré parfait :
                </p>
                <MB tex="\pi_L = y_L \times y_L - F = \tfrac{1}{4}\,(72 - y_K)^2 - F" />
                <p>
                  Lecture économique : plus Kappa surproduit (plus <M tex="y_K" /> est grand), plus
                  la place laissée à Lambda (<M tex="72 - y_K" />) se réduit, et plus le profit
                  d'entrée fond — quadratiquement.
                </p>
                <Callout variant="methode" title="La recette « dissuasion d'entrée » en 4 temps">
                  <p>
                    (1) Calcule la <em>réaction de l'entrant</em> s'il entrait. (2) Substitue-la
                    pour exprimer son profit d'entrée en fonction de la seule production de
                    l'installé (coût fixe déduit !). (3) Cherche la production qui annule ce profit
                    : c'est la <em>production limite</em>. (4) Compare le profit de l'installé qui
                    dissuade avec son profit s'il accommode (Stackelberg). Ces quatre temps sont
                    exactement les quatre paquets de points du barème.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.4 · Trouver la production limite : Kappa doit produire au moins 48",
            refs: [{ chapter: "ei2", section: "entree", label: "Dissuasion d'entrée" }],
            content: (
              <>
                <p>
                  Lambda renonce à entrer dès que son profit d'entrée est négatif ou nul. On résout
                  :
                </p>
                <MB tex="\tfrac{1}{4}\,(72 - y_K)^2 - 144 \le 0" />
                <p>On isole le carré en multipliant par 4 :</p>
                <MB tex="(72 - y_K)^2 \le 576" />
                <p>
                  On prend la racine carrée (dans la zone pertinente <M tex="y_K \le 72" />, le
                  terme <M tex="72 - y_K" /> est positif, donc pas de piège de signe) :
                </p>
                <MB tex="72 - y_K \le \sqrt{576} = 24 \;\iff\; y_K \ge 48" />
                <FormulaBox
                  label="Production limite"
                  tex="\bar y_K = 48"
                  caption={
                    <>
                      C'est la plus petite production de Kappa qui rend l'entrée non rentable pour
                      Lambda, coût fixe de 144 compris.
                    </>
                  }
                />
                <p>
                  <strong>Vérification (1 point au barème, et 30 secondes de calcul)</strong> : si{" "}
                  <M tex="y_K = 48" /> et que Lambda entrait quand même, elle produirait{" "}
                  <M tex="y_L = \tfrac{1}{2}(72 - 48) = 12" />, le prix serait{" "}
                  <M tex="96 - 48 - 12 = 36" /> et son profit
                </p>
                <MB tex="\pi_L = (36 - 24)\times 12 - 144 = 144 - 144 = 0" />
                <p>Elle est exactement à l'indifférence : l'entrée est bien dissuadée.</p>
                <Callout variant="attention">
                  <p>
                    La production de <em>monopole</em> ne suffit pas à bloquer l'entrée ! Avec{" "}
                    <M tex="y_K = 36" />, Lambda gagnerait{" "}
                    <M tex="\tfrac{1}{4}(72-36)^2 - 144 = 324 - 144 = 180 > 0" /> et entrerait. Pour
                    dissuader, Kappa doit <strong>surproduire</strong> (48 au lieu de 36) — c'est
                    tout le sens de la stratégie : sacrifier de la marge pour rendre le marché
                    inhospitalier.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.4 · L'exclusion est-elle profitable ? Et qu'en dit le droit ?",
            refs: [
              { chapter: "ei2", section: "entree", label: "Dissuasion d'entrée" },
              { chapter: "ei2", section: "stackelberg", label: "Stackelberg" },
            ],
            content: (
              <>
                <p>
                  <strong>Comparons les deux options de Kappa.</strong> Si elle produit{" "}
                  <M tex="\bar y_K = 48" />, Lambda reste dehors, Kappa est seule sur le marché et
                  le prix se lit sur la demande avec <M tex="y_L = 0" /> :
                </p>
                <MB tex="p = 96 - 48 = 48 \qquad \pi_K^{\text{dissuasion}} = (48 - 24)\times 48 = 1152" />
                <p>
                  Si au contraire elle <em>accommode</em> l'entrée, on retombe sur le Stackelberg de
                  la question 1.3 (le coût fixe ne pèse que sur Lambda, les nombres de Kappa sont
                  inchangés) :
                </p>
                <MB tex="\pi_K^{\text{accommodation}} = 648" />
                <p>
                  Verdict : <M tex="1152 > 648" /> — la dissuasion est (largement){" "}
                  <strong>profitable</strong>. Kappa est donc tentée de produire 48 pour garder le
                  marché pour elle.
                </p>
                <ProfitsRegimesSvg />
                <p>
                  <strong>Mais le droit de la concurrence veille :</strong> surproduire dans le seul
                  but d'évincer un concurrent (ou de l'empêcher d'entrer) constitue un{" "}
                  <strong>abus de position dominante</strong>. Ce comportement d'exclusion est
                  illégal et sanctionné par les autorités de la concurrence — en Europe, sur le
                  fondement de l'article 102 du TFUE. La stratégie est rentable, mais interdite.
                </p>
                <Callout variant="examen">
                  <p>
                    Les 13 points de la sous-question se répartissent entre le calcul <em>et</em> le
                    commentaire : le barème réserve explicitement 3 points à la comparaison chiffrée
                    1152 contre 648 et 2 points à la qualification juridique (« abus de position
                    dominante »). Une copie qui s'arrête à <M tex="\bar y_K = 48" /> laisse 5 points
                    sur la table — conclus toujours en deux phrases : « c'est profitable » puis «
                    c'est illégal ».
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> <M tex="y^* = 36" />, <M tex="p^* = 60" />,{" "}
              <M tex="\pi = 1296" />, <M tex="SC = 648" /> · <strong>1.2</strong> meilleures
              réponses <M tex="y_K = 36 - y_L/2" /> et <M tex="y_L = 36 - y_K/2" /> ; équilibre de
              Cournot-Nash <M tex="y_K = y_L = 24" />, <M tex="p = 48" />,{" "}
              <M tex="\pi_K = \pi_L = 576" /> · <strong>1.3</strong> Stackelberg :{" "}
              <M tex="y_K = 36" />, <M tex="y_L = 18" />, <M tex="p = 42" />,{" "}
              <M tex="\pi_K = 648" />, <M tex="\pi_L = 324" /> — le leader et les consommateurs
              gagnent, le suiveur perd · <strong>1.4</strong> production limite{" "}
              <M tex="\bar y_K = 48" /> ; l'exclusion rapporte <M tex="1152 > 648" /> donc elle est
              profitable, mais c'est un <em>abus de position dominante</em>, interdit par le droit
              de la concurrence.
            </p>
            <p>
              <strong>À retenir :</strong> une seule demande, quatre régimes — et une seule vraie
              brique de calcul, la fonction de meilleure réponse{" "}
              <M tex="y_i = \tfrac{1}{2}(72 - y_j)" /> : Cournot la résout en système, Stackelberg
              la substitue, la dissuasion l'annule (avec le coût fixe). Maîtrise cette brique et les
              45 points s'enchaînent.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 2, exercise: "ex1" },
                { session: 2, exercise: "ex2" },
                { session: 1, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 2 — les effets de réseau                             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-2"
        id="q2"
        number={2}
        title="Question 2 — Les effets de réseau : Anna, Boris et le logiciel de visioconférence (30 pts)"
        difficulty={2}
        refs={[
          { chapter: "ei4", section: "intro", label: "Effets de réseau" },
          { chapter: "ei4", section: "effets-directs-mono", label: "Effets directs en monopole" },
        ]}
        statement={
          <>
            <p>
              Considère deux consommateurs, Anna et Boris, qui envisagent d'acheter chacun une
              licence d'un nouveau logiciel de visioconférence. Une licence procurerait un bénéfice{" "}
              <M tex="r_A = 60" /> à Anna et <M tex="r_B = 36" /> à Boris ; acheter des licences
              supplémentaires ne changerait pas leur utilité. Note <M tex="p" /> le prix d'une
              licence.
            </p>
            <SubQuestion label="2.1)">
              Dans un premier temps, suppose que le logiciel ne présente aucun effet de réseau. Pour
              chaque niveau de prix <M tex="p" />, indique qui achète et décris précisément la
              demande totale pour ce bien (elle vaut 0, 1 ou 2 licences selon le prix). (6 points)
            </SubQuestion>
            <SubQuestion label="2.2)">
              Suppose maintenant qu'il existe un bénéfice supplémentaire <M tex="v = 30" /> pour
              chaque utilisateur si Anna <em>et</em> Boris achètent tous les deux le logiciel (ils
              peuvent alors interagir). Ce bénéfice n'existe que si les deux achètent. Trace la
              matrice de jeu dans laquelle les stratégies de chaque joueur sont « Acheter » et « Ne
              pas acheter », et reportes-y les bénéfices nets de chaque joueur en fonction de{" "}
              <M tex="p" />. (8 points)
            </SubQuestion>
            <SubQuestion label="2.3)">
              À l'aide de ta matrice, détermine pour quelles valeurs de <M tex="p" /> chacune des
              situations suivantes est un équilibre de Nash : (a) Anna et Boris achètent tous les
              deux ; (b) seule Anna achète ; (c) personne n'achète. Justifie chaque condition.
              Existe-t-il une zone de prix dans laquelle plusieurs équilibres coexistent ? Si oui,
              laquelle ? (10 points)
            </SubQuestion>
            <SubQuestion label="2.4)">
              Question conceptuelle. En t'appuyant sur ta réponse en 2.3), explique ce qu'est une
              anticipation auto-réalisatrice sur un marché à effet de réseau et ce que désigne la
              masse critique d'un réseau. Pourquoi peut-il être rationnel, pour le vendeur d'un tel
              bien, de proposer un « prix de lancement » très bas — voire de vendre à perte —
              pendant les premiers mois ? (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : un bien à effet de réseau = un jeu de coordination",
            refs: [{ chapter: "ei4", section: "intro", label: "Effets de réseau" }],
            content: (
              <>
                <p>
                  Trois indices te disent immédiatement dans quel chapitre tu joues. (1) Le bénéfice
                  de chacun <strong>dépend de ce que fait l'autre</strong> (« un bénéfice
                  supplémentaire si Anna <em>et</em> Boris achètent ») : c'est la définition d'un{" "}
                  <em>effet de réseau direct</em>. (2) On te demande une{" "}
                  <strong>matrice de jeu</strong> : le bon outil n'est plus la courbe de demande
                  mais la théorie des jeux. (3) On te demande des{" "}
                  <strong>équilibres de Nash</strong> pour des <em>plages de prix</em> : attends-toi
                  à des zones où plusieurs équilibres coexistent — c'est la signature des effets de
                  réseau.
                </p>
                <p>
                  Le plan de bataille : d'abord le monde <em>sans</em> réseau (2.1, une simple
                  demande en escalier qui servira de point de comparaison), puis le monde{" "}
                  <em>avec</em> réseau (2.2 la matrice, 2.3 les équilibres, 2.4 l'interprétation).
                </p>
                <Callout variant="methode">
                  <p>
                    Pour chaque consommateur, le raisonnement est toujours le même : il achète si
                    son <strong>bénéfice net</strong> (bénéfice de base <M tex="r" />, plus{" "}
                    <M tex="v" /> <em>si</em> l'autre est aussi sur le réseau, moins le prix{" "}
                    <M tex="p" />) est positif. Toute la question consiste à décliner cette
                    inégalité case par case.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 · Construire la demande sans effet de réseau",
            refs: [
              { chapter: "ei4", section: "intro", label: "Effets de réseau" },
              { chapter: "ei1", section: "demande", label: "Demande décroissante" },
            ],
            content: (
              <>
                <p>
                  Sans effet de réseau, chacun compare simplement son bénéfice de base au prix,
                  indépendamment de l'autre. Anna achète si son bénéfice net est positif :
                </p>
                <MB tex="60 - p > 0 \;\iff\; p < 60" />
                <p>Boris, dont la disposition à payer est plus faible :</p>
                <MB tex="36 - p > 0 \;\iff\; p < 36" />
                <p>
                  La demande totale au prix <M tex="p" /> est le nombre de consommateurs dont le
                  seuil dépasse le prix — une demande « en escalier » à trois paliers :
                </p>
                <MB tex="y(p) = \begin{cases} 0 & \text{si } p > 60 \quad \text{(même Anna renonce)}\\[2pt] 1 & \text{si } 36 < p < 60 \quad \text{(seule Anna achète)}\\[2pt] 2 & \text{si } p < 36 \quad \text{(les deux achètent)} \end{cases}" />
                <p>
                  Aux prix-frontière exacts (<M tex="p = 60" /> pour Anna, <M tex="p = 36" /> pour
                  Boris), le consommateur concerné est indifférent entre acheter et s'abstenir —
                  précise-le en une parenthèse, c'est le genre de rigueur qui paie.
                </p>
                <EscalierDemandeSvg />
                <p>
                  <strong>Interprétation :</strong> c'est une demande décroissante tout à fait
                  ordinaire — chaque baisse de prix franchit un seuil et gagne un acheteur. Retiens
                  bien ce monde « sans réseau » : tout l'intérêt de la suite est de voir ce que{" "}
                  <M tex="v" /> vient casser.
                </p>
              </>
            ),
          },
          {
            title: "2.2 · Remplir la matrice du jeu « Acheter / Ne pas acheter »",
            refs: [
              {
                chapter: "ei4",
                section: "effets-directs-mono",
                label: "Effets directs en monopole",
              },
            ],
            content: (
              <>
                <p>
                  Chaque joueur a deux stratégies : Acheter ou Ne pas acheter. On remplit les quatre
                  cases en appliquant la règle « bénéfice net = <M tex="r" /> (+ <M tex="v" /> si
                  l'autre achète aussi) − <M tex="p" /> » :
                </p>
                <ul className="my-2 ml-5 list-disc space-y-1">
                  <li>
                    <strong>Les deux achètent :</strong> chacun touche son bénéfice de base{" "}
                    <em>plus</em> le bénéfice d'interaction. Anna : <M tex="60 + 30 - p = 90 - p" />{" "}
                    ; Boris : <M tex="36 + 30 - p = 66 - p" />.
                  </li>
                  <li>
                    <strong>Un seul achète :</strong> pas d'interlocuteur, donc pas de <M tex="v" />
                    . L'acheteur solitaire touche <M tex="60 - p" /> (Anna) ou <M tex="36 - p" />{" "}
                    (Boris).
                  </li>
                  <li>
                    <strong>Ne pas acheter :</strong> bénéfice nul, quoi que fasse l'autre.
                  </li>
                </ul>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH} />
                        <th className={THc}>Boris · Acheter</th>
                        <th className={THc}>Boris · Ne pas acheter</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>
                          <strong>Anna · Acheter</strong>
                        </td>
                        <td className={TDc}>
                          <span className="font-semibold text-rose-700">90 − p</span>
                          <span className="text-muted-foreground"> ; </span>
                          <span className="font-semibold text-sky-700">66 − p</span>
                        </td>
                        <td className={TDc}>
                          <span className="font-semibold text-rose-700">60 − p</span>
                          <span className="text-muted-foreground"> ; </span>
                          <span className="font-semibold text-sky-700">0</span>
                        </td>
                      </tr>
                      <tr>
                        <td className={TD}>
                          <strong>Anna · Ne pas acheter</strong>
                        </td>
                        <td className={TDc}>
                          <span className="font-semibold text-rose-700">0</span>
                          <span className="text-muted-foreground"> ; </span>
                          <span className="font-semibold text-sky-700">36 − p</span>
                        </td>
                        <td className={TDc}>
                          <span className="font-semibold text-rose-700">0</span>
                          <span className="text-muted-foreground"> ; </span>
                          <span className="font-semibold text-sky-700">0</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  (Premier nombre : Anna, en rose ; second : Boris, en bleu — garde toujours cette
                  convention ligne/colonne, elle t'évitera d'inverser les joueurs en 2.3.)
                </p>
                <Callout variant="attention">
                  <p>
                    L'erreur la plus fréquente de toute la question : glisser <M tex="v = 30" />{" "}
                    dans les cases où <em>un seul</em> joueur achète. Relis l'énoncé : « ce bénéfice
                    n'existe que si les deux achètent ». Le <M tex="v" /> n'apparaît que dans la
                    case Acheter/Acheter — chaque case vaut 1,5 point au barème, donc cette
                    étourderie coûte cher.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 · Tester « les deux achètent » : équilibre si p ≤ 66",
            refs: [
              {
                chapter: "ei4",
                section: "effets-directs-mono",
                label: "Effets directs en monopole",
              },
            ],
            content: (
              <>
                <p>
                  <strong>Rappel de la définition :</strong> un profil de stratégies est un
                  équilibre de Nash si <em>aucun</em> joueur n'a intérêt à dévier{" "}
                  <em>unilatéralement</em> (l'autre restant fixe). On teste donc la case (Acheter ;
                  Acheter) joueur par joueur.
                </p>
                <p>
                  <strong>Anna</strong> : en achetant elle touche <M tex="90 - p" /> ; si elle dévie
                  vers « Ne pas acheter » (Boris continuant d'acheter), elle touche 0. Elle reste si
                  :
                </p>
                <MB tex="90 - p \ge 0 \;\iff\; p \le 90" />
                <p>
                  <strong>Boris</strong> : en achetant il touche <M tex="66 - p" /> ; en déviant, 0.
                  Il reste si :
                </p>
                <MB tex="66 - p \ge 0 \;\iff\; p \le 66" />
                <p>
                  Les deux conditions doivent tenir <em>simultanément</em> ; la plus exigeante est
                  celle de Boris (le consommateur au bénéfice le plus faible) :
                </p>
                <MB tex="\text{« les deux achètent » est un équilibre de Nash} \;\iff\; p \le 66" />
                <p>
                  Remarque le chiffre : 66, c'est <M tex="r_B + v = 36 + 30" /> — la disposition à
                  payer de Boris <em>une fois dans le réseau</em>. Grâce à l'effet de réseau, le
                  vendeur peut soutenir un prix bien au-dessus du 36 de la question 2.1.
                </p>
                <Callout variant="methode">
                  <p>
                    Pour tester une case candidate : fige la stratégie de l'autre, compare le gain
                    du joueur dans la case avec son gain s'il bascule seul de stratégie, et exige «
                    pas mieux ailleurs » pour <em>chaque</em> joueur. Deux joueurs = deux inégalités
                    par case, jamais plus.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 · Tester « seule Anna achète » : impossible, quel que soit le prix",
            refs: [
              {
                chapter: "ei4",
                section: "effets-directs-mono",
                label: "Effets directs en monopole",
              },
            ],
            content: (
              <>
                <p>On teste la case (Acheter ; Ne pas acheter) avec la même mécanique.</p>
                <p>
                  <strong>Anna</strong> doit vouloir acheter <em>seule</em> — donc sans le bénéfice
                  d'interaction :
                </p>
                <MB tex="60 - p \ge 0 \;\iff\; p \le 60" />
                <p>
                  <strong>Boris</strong> ne doit pas vouloir la rejoindre. Or s'il déviait vers «
                  Acheter » alors qu'Anna achète déjà, il activerait l'effet de réseau et toucherait{" "}
                  <M tex="66 - p" />. Il reste dehors seulement si :
                </p>
                <MB tex="66 - p \le 0 \;\iff\; p \ge 66" />
                <p>Il faudrait donc à la fois :</p>
                <MB tex="p \le 60 \quad\text{et}\quad p \ge 66 \qquad \Longrightarrow\ \text{impossible}" />
                <p>
                  <strong>Cet équilibre n'existe pour aucun prix.</strong> La raison profonde mérite
                  d'être écrite sur ta copie : ici
                </p>
                <MB tex="v = 30 \;>\; r_A - r_B = 60 - 36 = 24" />
                <p>
                  l'effet de réseau est si fort que la disposition à payer de Boris <em>dans</em> le
                  réseau (66) dépasse celle d'Anna <em>seule</em> (60) : tout prix qu'Anna accepte
                  de payer seule, Boris l'accepte pour la rejoindre. Le réseau aspire Boris dès
                  qu'Anna y est. (Même argument, encore plus net, pour « seul Boris achète » : il
                  faudrait <M tex="p \le 36" /> et <M tex="p \ge 90" />
                  .)
                </p>
              </>
            ),
          },
          {
            title: "2.3 · Tester « personne n'achète » et repérer la zone d'équilibres multiples",
            refs: [
              {
                chapter: "ei4",
                section: "effets-directs-mono",
                label: "Effets directs en monopole",
              },
            ],
            content: (
              <>
                <p>
                  Dernière case : (Ne pas acheter ; Ne pas acheter), où chacun touche 0.{" "}
                  <strong>Anna</strong> ne dévie pas si acheter <em>seule</em> (Boris restant
                  dehors, donc sans <M tex="v" />) ne rapporte rien :
                </p>
                <MB tex="60 - p \le 0 \;\iff\; p \ge 60" />
                <p>
                  Pour <strong>Boris</strong>, la condition <M tex="36 - p \le 0" />, soit{" "}
                  <M tex="p \ge 36" />, est alors automatiquement satisfaite. Donc :
                </p>
                <MB tex="\text{« personne n'achète » est un équilibre de Nash} \;\iff\; p \ge 60" />
                <p>
                  Superpose maintenant les deux conditions trouvées : « les deux achètent » exige{" "}
                  <M tex="p \le 66" />, « personne n'achète » exige <M tex="p \ge 60" />. Les deux
                  plages se chevauchent !
                </p>
                <FormulaBox
                  label="Zone d'équilibres multiples"
                  tex="60 \le p \le 66 \;:\; \text{« tout le monde achète » ET « personne n'achète » sont des équilibres}"
                  caption={
                    <>
                      Au même prix, le marché peut aboutir au réseau complet ou au réseau vide —
                      tout dépend des anticipations de chacun sur le comportement de l'autre.
                    </>
                  }
                />
                <p>
                  Vérifie-le toi-même sur la matrice chiffrée à <M tex="p = 63" /> (un prix au
                  milieu de la zone) : révèle les meilleures réponses puis les équilibres — il y en
                  a bien <em>deux</em>.
                </p>
                <PayoffMatrix
                  rowPlayer="Anna"
                  colPlayer="Boris"
                  rows={["Acheter", "Ne pas acheter"]}
                  cols={["Acheter", "Ne pas acheter"]}
                  payoffs={[
                    [
                      [27, 3],
                      [-3, 0],
                    ],
                    [
                      [0, -27],
                      [0, 0],
                    ],
                  ]}
                  interactive
                  caption={
                    <>
                      La matrice à <M tex="p = 63" /> : chaque case applique les formules de 2.2 (
                      <M tex="90 - 63 = 27" />, <M tex="66 - 63 = 3" />, <M tex="60 - 63 = -3" />,{" "}
                      <M tex="36 - 63 = -27" />
                      ). Deux équilibres de Nash coexistent : (Acheter ; Acheter) et (Ne pas acheter
                      ; Ne pas acheter).
                    </>
                  }
                />
                <Callout variant="examen">
                  <p>
                    Le correcteur attend, pour <em>chaque</em> équilibre, les <em>deux</em>{" "}
                    inégalités de non-déviation — pas seulement le résultat. Et pas de panique sur
                    les bornes : inégalités strictes ou larges sont toutes deux acceptées (aux
                    frontières exactes, le joueur est indifférent). Écris la zone{" "}
                    <M tex="[60,\,66]" /> en conclusion explicite : elle vaut 2 points à elle seule.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.4 · Anticipations auto-réalisatrices, masse critique et prix de lancement",
            refs: [
              {
                chapter: "ei4",
                section: "effets-directs-mono",
                label: "Effets directs en monopole",
              },
              { chapter: "ei4", section: "synthese", label: "Synthèse EI4" },
            ],
            content: (
              <>
                <p>
                  <strong>Anticipation auto-réalisatrice.</strong> Dans la zone{" "}
                  <M tex="60 \le p \le 66" />, ce ne sont pas les fondamentaux (bénéfices, prix) qui
                  départagent les deux équilibres : ce sont les <em>croyances</em>. Si chacun
                  anticipe que l'autre achète, acheter est optimal… et l'anticipation se réalise :
                  le réseau se forme. Si chacun anticipe que l'autre s'abstient, s'abstenir est
                  optimal… et le réseau reste vide. Les deux « prophéties » se valident
                  d'elles-mêmes — d'où leur nom.
                </p>
                <p>
                  <strong>Masse critique.</strong> C'est le nombre d'utilisateurs qu'il faut
                  convaincre d'avoir rejoint (ou de rejoindre) le réseau pour faire basculer les
                  anticipations vers le « bon » équilibre : au-delà, l'effet boule de neige attire
                  les autres utilisateurs ; en deçà, le réseau s'effondre. Dans notre mini-marché à
                  deux consommateurs, la masse critique est atteinte dès qu'<em>un</em> consommateur
                  est convaincu que l'autre achète.
                </p>
                <p>
                  <strong>Le prix de lancement.</strong> Comment un vendeur peut-il forcer le bon
                  équilibre ? En cassant le prix au départ : si <M tex="p < 36" />, acheter devient
                  avantageux pour Boris <em>même s'il se croit seul</em> (<M tex="36 - p > 0" />) —
                  acheter est alors une stratégie <strong>dominante</strong> pour lui, et Anna suit
                  sans hésiter. Le doute est levé, le réseau se construit. Vérifie-le sur la matrice
                  à <M tex="p = 30" /> :
                </p>
                <PayoffMatrix
                  rowPlayer="Anna"
                  colPlayer="Boris"
                  rows={["Acheter", "Ne pas acheter"]}
                  cols={["Acheter", "Ne pas acheter"]}
                  payoffs={[
                    [
                      [60, 36],
                      [30, 0],
                    ],
                    [
                      [0, 6],
                      [0, 0],
                    ],
                  ]}
                  interactive
                  caption={
                    <>
                      À <M tex="p = 30" /> (prix de lancement), acheter rapporte plus que s'abstenir
                      quoi que fasse l'autre : l'unique équilibre est (Acheter ; Acheter). Plus
                      aucune coordination n'est nécessaire.
                    </>
                  }
                />
                <p>
                  Une fois le réseau installé et les anticipations retournées (« tout le monde y est
                  »), le vendeur peut remonter le prix jusqu'à 66 sans détruire l'équilibre « tout
                  le monde achète ». Vendre à perte au lancement n'est donc pas de la générosité :
                  c'est un <strong>investissement dans les anticipations</strong>, récupéré ensuite
                  par des prix élevés sur un réseau devenu incontournable.
                </p>
                <Callout variant="intuition">
                  <p>
                    C'est exactement la stratégie des plateformes réelles : visioconférence gratuite
                    pour les particuliers, essais offerts, tarifs étudiants bradés… On subventionne
                    les premiers utilisateurs pour franchir la masse critique, puis la valeur du
                    réseau (le <M tex="v" />) fait le travail de vente à leur place.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1</strong> demande en escalier : <M tex="y = 0" /> si <M tex="p > 60" />,{" "}
              <M tex="y = 1" /> (Anna) si <M tex="36 < p < 60" />, <M tex="y = 2" /> si{" "}
              <M tex="p < 36" /> · <strong>2.2</strong> matrice avec <M tex="(90-p\,;\,66-p)" />{" "}
              quand les deux achètent, <M tex="(60-p\,;\,0)" /> et <M tex="(0\,;\,36-p)" /> pour les
              achats solitaires, <M tex="(0\,;\,0)" /> sinon — le <M tex="v" /> uniquement dans la
              case Acheter/Acheter · <strong>2.3</strong> (a) équilibre ssi <M tex="p \le 66" /> ;
              (b) impossible car <M tex="v = 30 > r_A - r_B = 24" /> ; (c) équilibre ssi{" "}
              <M tex="p \ge 60" /> ; équilibres multiples pour <M tex="60 \le p \le 66" /> ·{" "}
              <strong>2.4</strong> anticipations auto-réalisatrices, masse critique, prix de
              lancement = investissement pour sélectionner le bon équilibre.
            </p>
            <p>
              <strong>À retenir :</strong> avec un effet de réseau, la demande cesse d'être un
              simple escalier : au même prix, réseau plein et réseau vide peuvent coexister, et ce
              sont les croyances qui tranchent. Le vendeur ne subit pas ces croyances — il les
              achète, via le prix de lancement.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList refs={[{ session: 4, exercise: "ex1" }]} className="mt-1.5" />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 3 — réguler et taxer le monopole                     */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-2"
        id="q3"
        number={3}
        title="Question 3 — Réguler et taxer le monopole Sigma (25 pts)"
        difficulty={2}
        refs={[
          { chapter: "ei1", section: "regulation", label: "Régulation" },
          { chapter: "ei1", section: "taxation", label: "Taxation" },
        ]}
        statement={
          <>
            <p>
              L'entreprise Sigma est en monopole sur son marché. Elle fait face à la fonction de
              demande inverse <M tex="p = 40 - y" /> et à un coût marginal constant de 10. Elle n'a
              aucun coût fixe.
            </p>
            <SubQuestion label="3.1)">
              (a) En l'absence de toute intervention publique, quelle est la production optimale de
              Sigma, à quel prix vend-elle et quel est son profit ? (b) L'État impose maintenant à
              Sigma un prix plafond égal à son coût marginal (<M tex="\bar p = 10" />) et l'oblige à
              satisfaire toute la demande à ce prix. Quelle quantité Sigma produit-elle ? Quel est
              son profit ? Sigma peut-elle rester sur le marché ? Commente brièvement l'effet de
              cette régulation sur l'efficacité du marché. (10 points)
            </SubQuestion>
            <SubQuestion label="3.2)">
              L'État renonce au prix plafond et instaure à la place une taxe de <M tex="t = 4" />{" "}
              par unité vendue, payée par Sigma. Calcule la nouvelle production et le nouveau prix
              payé par les consommateurs. De combien le prix augmente-t-il ? Qui supporte finalement
              cette taxe : les consommateurs, la firme, ou les deux ? Justifie par un calcul. (9
              points)
            </SubQuestion>
            <SubQuestion label="3.3)">
              Question conceptuelle. L'État envisage plutôt de prélever 30 % du profit de Sigma.
              Explique pourquoi cette taxe sur le profit ne modifierait ni la production, ni le
              prix, ni la quantité demandée. Un argument mathématique court est attendu. (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : un monopole, trois interventions publiques",
            refs: [
              { chapter: "ei1", section: "regulation", label: "Régulation" },
              { chapter: "ei1", section: "taxation", label: "Taxation" },
            ],
            content: (
              <>
                <p>
                  Structure limpide : un monopole de manuel (<M tex="p = 40 - y" />,{" "}
                  <M tex="Cm = 10" />, pas de coût fixe) et l'État qui essaie trois outils
                  successifs. Chaque outil a SA méthode — le piège serait d'appliquer partout le
                  même réflexe <M tex="Rm = Cm" /> :
                </p>
                <ul className="my-2 ml-5 list-disc space-y-1">
                  <li>
                    <strong>3.1a — rien :</strong> le benchmark. Là, oui : <M tex="Rm = Cm" />.
                  </li>
                  <li>
                    <strong>
                      3.1b — prix plafond <M tex="\bar p = Cm" /> :
                    </strong>{" "}
                    le prix est imposé et la firme doit servir toute la demande → la quantité se lit
                    sur la <em>demande</em>, plus du tout sur <M tex="Rm = Cm" />.
                  </li>
                  <li>
                    <strong>
                      3.2 — taxe unitaire <M tex="t = 4" /> :
                    </strong>{" "}
                    chaque unité coûte 4 de plus → on refait le programme du monopole avec un coût
                    marginal effectif <M tex="Cm + t" />.
                  </li>
                  <li>
                    <strong>3.3 — taxe sur le profit (30 %) :</strong> aucune quantité à recalculer
                    : un argument de maximisation en deux lignes suffit (et l'énoncé te le souffle :
                    « un argument mathématique court est attendu »).
                  </li>
                </ul>
                <Callout variant="examen">
                  <p>
                    Trois sous-questions, trois logiques différentes : c'est une question de{" "}
                    <em>discernement</em> plus que de calcul. Le correcteur vérifie d'abord que tu
                    as identifié le bon programme de maximisation dans chaque cas — annonce-le
                    explicitement en tête de chaque réponse (« ici la quantité se lit sur la demande
                    car le prix est plafonné », etc.).
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.1a · Le benchmark : l'optimum privé de Sigma",
            refs: [{ chapter: "ei1", section: "maximisation", label: "Rm = Cm" }],
            content: (
              <>
                <p>
                  Même gamme que la question 1 (c'est voulu : l'examen te fait rejouer la méthode
                  sur des nombres plus doux). On écrit le profit en substituant la demande inverse :
                </p>
                <MB tex="\pi(y) = (40 - y)\,y - 10\,y = 30\,y - y^2" />
                <p>Condition du premier ordre (recette marginale = coût marginal) :</p>
                <MB tex="\frac{d\pi}{dy} = 30 - 2y = 0 \;\iff\; y^* = 15" />
                <p>Prix et profit :</p>
                <MB tex="p^* = 40 - 15 = 25 \qquad \pi^* = (25 - 10)\times 15 = 225" />
                <p>
                  Garde ces trois nombres sous le coude :{" "}
                  <strong>tout le reste de la question se mesure par rapport à eux</strong> (le
                  plafond fera bouger 15 → 30, la taxe unitaire 15 → 13, la taxe sur le profit… rien
                  du tout).
                </p>
              </>
            ),
          },
          {
            title: "3.1b · Prix plafond p̄ = Cm : lire la quantité sur la demande",
            refs: [
              { chapter: "ei1", section: "regulation", label: "Régulation" },
              { chapter: "ei1", section: "inefficacite", label: "Perte sèche" },
            ],
            content: (
              <>
                <p>
                  <strong>Le programme change de nature.</strong> Sigma n'optimise plus son prix :
                  l'État le fixe à <M tex="\bar p = 10" /> et l'oblige à « satisfaire toute la
                  demande à ce prix ». La quantité est donc celle que les consommateurs demandent
                  quand le prix vaut 10 :
                </p>
                <MB tex="10 = 40 - y \;\iff\; y = 30" />
                <p>Le profit s'effondre à zéro, puisque le prix colle exactement au coût :</p>
                <MB tex="\pi = (\bar p - Cm)\times y = (10 - 10)\times 30 = 0" />
                <p>
                  <strong>Sigma peut-elle rester ?</strong> Oui : comme elle n'a{" "}
                  <em>aucun coût fixe</em>, un profit nul couvre exactement tous ses coûts — elle
                  n'a aucune raison de sortir (elle est indifférente, et on considère qu'elle
                  reste).
                </p>
                <p>
                  <strong>Effet sur l'efficacité :</strong> la régulation reproduit l'issue
                  concurrentielle. La production double (de 15 à 30), le prix tombe au coût
                  marginal, et la perte sèche du monopole disparaît entièrement. Cette perte sèche
                  valait (triangle entre la demande et <M tex="Cm" />, de 15 à 30) :
                </p>
                <MB tex="PS = \tfrac{1}{2}\times(25 - 10)\times(30 - 15) = \tfrac{1}{2}\times 15\times 15 = 112{,}5" />
                <MonopoleReguleSvg />
                <Callout variant="attention">
                  <p>
                    Deux pièges ici. (1) Ne calcule <em>pas</em> la quantité régulée avec{" "}
                    <M tex="Rm = Cm" /> : quand le prix est plafonné et la demande doit être servie,
                    l'optimisation du monopole est débranchée — la quantité se lit sur la demande.
                    (2) Le « profit nul mais viable » repose sur l'
                    <strong>absence de coût fixe</strong> : pour un monopole <em>naturel</em> (coût
                    fixe <M tex="F > 0" />
                    ), le même plafond <M tex="\bar p = Cm" /> imposerait une perte <M tex="-F" />{" "}
                    et chasserait la firme du marché — mentionne cette nuance, elle fait partie des
                    2,5 points de commentaire.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 · La taxe unitaire déplace le coût marginal : 10 → 14",
            refs: [{ chapter: "ei1", section: "taxation", label: "Taxation" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi « tout se passe comme si » ?</strong> La taxe de{" "}
                  <M tex="t = 4" /> est due sur chaque unité vendue : produire une unité coûte
                  désormais 10 de production + 4 de taxe. Le coût marginal <em>effectif</em> de
                  Sigma passe donc à <M tex="10 + 4 = 14" />, et on refait tourner exactement le
                  même programme qu'en 3.1a :
                </p>
                <MB tex="\pi(y) = (40 - y)\,y - (10 + 4)\,y = 26\,y - y^2" />
                <p>Condition du premier ordre :</p>
                <MB tex="\frac{d\pi}{dy} = 26 - 2y = 0 \;\iff\; y' = 13" />
                <p>Le nouveau prix payé par les consommateurs se lit sur la demande :</p>
                <MB tex="p' = 40 - 13 = 27" />
                <TaxeUnitaireSvg />
                <Callout variant="methode">
                  <p>
                    Réflexe universel :{" "}
                    <strong>
                      taxe unitaire = même programme, coût marginal décalé de <M tex="t" />
                    </strong>
                    . Ne réinvente rien : remplace <M tex="Cm" /> par <M tex="Cm + t" /> et déroule{" "}
                    <M tex="Rm = Cm + t" />. (À ne pas confondre avec la taxe sur le <em>profit</em>{" "}
                    de la question 3.3, qui ne touche pas au coût marginal — c'est précisément le
                    contraste que l'examen veut te faire formuler.)
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 · Chiffrer l'incidence : qui paie vraiment la taxe ?",
            refs: [{ chapter: "ei1", section: "taxation", label: "Taxation" }],
            content: (
              <>
                <p>
                  <strong>Côté consommateurs :</strong> le prix passe de 25 à 27, soit une hausse de
                </p>
                <MB tex="\Delta p = 27 - 25 = 2 = \frac{t}{2}" />
                <p>
                  Les consommateurs ne supportent donc que <strong>la moitié de la taxe</strong> : 2
                  sur les 4 prélevés par unité.
                </p>
                <p>
                  <strong>Côté firme :</strong> sa marge nette par unité passe de{" "}
                  <M tex="25 - 10 = 15" /> à <M tex="27 - 14 = 13" /> : elle absorbe les 2 restants.
                  Son profit chute de
                </p>
                <MB tex="\pi^* = 225 \quad\longrightarrow\quad \pi' = (27 - 14)\times 13 = 169" />
                <p>
                  Conclusion demandée : la taxe est <strong>partagée moitié-moitié</strong> entre
                  les consommateurs (+2 par unité) et la firme (−2 de marge par unité). C'est le
                  calcul <M tex="\Delta p = 2 = t/2" /> qui justifie la réponse — pas une intuition.
                </p>
                <p>Deux remarques qui valent le point de commentaire :</p>
                <ul className="my-2 ml-5 list-disc space-y-1">
                  <li>
                    Ce partage 50/50 est <strong>propre à la demande linéaire</strong> avec coût
                    marginal constant. Le cours montre qu'avec une demande iso-élastique, le
                    monopole répercute <em>plus</em> que la taxe sur ses clients (
                    <M tex="\Delta p > t" /> !).
                  </li>
                  <li>
                    La taxe <strong>aggrave la distorsion</strong> de monopole : la production, déjà
                    trop faible (15 contre 30 à l'optimum social), recule encore (13). L'État
                    encaisse <M tex="4 \times 13 = 52" />, mais au prix d'une perte sèche accrue.
                  </li>
                </ul>
                <Callout variant="examen">
                  <p>
                    « Justifiez par un calcul » n'est pas décoratif : le barème réserve 3 points au
                    partage <em>chiffré</em> de l'incidence. La forme attendue : hausse de prix (2),
                    part consommateurs (<M tex="t/2" />
                    ), part firme (marge 15 → 13, profit 225 → 169). Une réponse purement verbale («
                    les deux paient ») plafonne à la moitié des points.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 · La taxe sur le profit est neutre : l'argument en deux lignes",
            refs: [{ chapter: "ei1", section: "taxation", label: "Taxation" }],
            content: (
              <>
                <p>
                  Avant taxe, Sigma choisit <M tex="y^*" /> tel que{" "}
                  <M tex="\frac{d\Pi}{dy}(y^*) = 0" />. Avec un prélèvement de 30 % du profit, elle
                  maximise son profit net :
                </p>
                <MB tex="(1 - 0{,}30)\,\Pi(y) = 0{,}7\,\Pi(y)" />
                <p>Or la condition du premier ordre de ce nouveau programme s'écrit :</p>
                <MB tex="\frac{d\,[0{,}7\,\Pi(y)]}{dy} = 0{,}7\,\frac{d\Pi(y)}{dy} = 0 \;\iff\; \frac{d\Pi(y)}{dy} = 0 \;\iff\; y = y^*" />
                <FormulaBox
                  label="L'argument-clé"
                  tex="\max_y\ (1 - \tau)\,\Pi(y) \;\iff\; \max_y\ \Pi(y) \qquad \text{pour tout } 0 < \tau < 1"
                  caption={
                    <>
                      Multiplier une fonction par une constante positive ne déplace pas son maximum
                      : c'est tout l'argument « mathématique court » attendu.
                    </>
                  }
                />
                <p>
                  La production optimale reste donc <M tex="y^* = 15" />, le prix reste 25, la
                  quantité demandée ne bouge pas. L'État capte 30 % de la rente :
                </p>
                <MB tex="0{,}3 \times 225 = 67{,}5" />
                <p>
                  sans créer la moindre perte sèche supplémentaire — contrairement à la taxe
                  unitaire de 3.2, qui ne rapportait que 52 en dégradant encore la production.
                </p>
                <Callout variant="intuition">
                  <p>
                    Pourquoi cette différence de nature ? La taxe <em>unitaire</em> frappe la{" "}
                    <strong>marge de la dernière unité</strong> : elle déforme le calcul{" "}
                    <M tex="Rm = Cm" /> et donc le comportement. La taxe sur le <em>profit</em>{" "}
                    frappe le <strong>résultat</strong>, une fois toutes les décisions prises : elle
                    ne modifie ni <M tex="Rm" /> ni <M tex="Cm" />, donc aucune décision. En un
                    slogan : on ne change pas de sommet quand on garde la même montagne, juste
                    dessinée à 70 % de sa hauteur.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1a</strong> <M tex="y^* = 15" />, <M tex="p^* = 25" />,{" "}
              <M tex="\pi^* = 225" /> · <strong>3.1b</strong> avec <M tex="\bar p = 10" /> :{" "}
              <M tex="y = 30" />, <M tex="\pi = 0" />, Sigma reste (aucun coût fixe) ; la production
              double, <M tex="p = Cm" />, la perte sèche de 112,5 disparaît — optimum atteint (mais
              un monopole naturel ferait faillite) · <strong>3.2</strong> coût marginal effectif 14,{" "}
              <M tex="y' = 13" />, <M tex="p' = 27" /> : hausse de <M tex="2 = t/2" />, taxe
              partagée moitié consommateurs / moitié firme (marge 15 → 13, profit 225 → 169) ·{" "}
              <strong>3.3</strong> maximiser <M tex="0{,}7\,\Pi" /> revient à maximiser{" "}
              <M tex="\Pi" /> : production, prix et quantité inchangés ; l'État prélève 67,5 sans
              perte sèche supplémentaire.
            </p>
            <p>
              <strong>À retenir :</strong> trois outils, trois effets — le plafond{" "}
              <M tex="\bar p = Cm" /> restaure l'efficacité (si la firme survit), la taxe unitaire
              déplace <M tex="Cm" /> et aggrave la distorsion, la taxe sur le profit est neutre.
              Identifier <em>sur quoi</em> porte l'instrument (la marge ou le résultat) te donne la
              réponse avant même de calculer.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex1" },
                { session: 3, exercise: "ex1", label: "révision du monopole simple" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />
    </ExamSolutionShell>
  );
}
