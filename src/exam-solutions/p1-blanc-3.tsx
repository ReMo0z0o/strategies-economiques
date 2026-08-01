/**
 * Résolution guidée · Examen blanc n° 3 — Partie 1 (Théorie de la décision
 * et Théorie des jeux, 2h, /200).
 *
 * Énoncé fidèle au PDF officiel (exams/p1-blanc-3/enonce-body.html) ;
 * chaque valeur numérique est alignée sur le corrigé officiel
 * (exams/p1-blanc-3/corrige-body.html).
 */
import { ExamSolutionShell } from "@/components/course/ExamSolutionShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { TpRefList } from "@/components/course/TpRef";

/* ------------------------------------------------------------------ */
/* Styles de tableaux (mêmes conventions que les séances de TP)        */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Couleurs de séries (paire bleu/ambre sûre pour daltonisme + accents) */
const C_BLUE = "#0284c7"; // sky-600
const C_AMBER = "#d97706"; // amber-600
const C_GREEN = "#059669"; // emerald-600
const C_ROSE = "#e11d48"; // rose-600

/* ------------------------------------------------------------------ */
/* Figure Q1 · Contrainte de budget consommation–loisir du type H      */
/* ------------------------------------------------------------------ */

function BudgetTaxeSVG() {
  // X : loisir l ∈ [0 ; 1] → [50 ; 410] ; Y : consommation c ∈ [0 ; 21] → [280 ; 28]
  const X = (l: number) => 50 + 360 * l;
  const Y = (c: number) => 280 - 12 * c;
  return (
    <svg
      viewBox="0 0 460 330"
      className="mx-auto h-auto w-full max-w-lg"
      role="img"
      aria-label="Contrainte de budget consommation-loisir du type H, sans taxe et avec la taxe de 20 % assortie du transfert M(t) = 2"
    >
      {/* Axes */}
      <line x1={40} y1={280} x2={430} y2={280} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <line x1={50} y1={290} x2={50} y2={25} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <text
        x={420}
        y={300}
        fontSize={12}
        fontWeight={700}
        textAnchor="end"
        fill="var(--color-foreground)"
      >
        Loisir l
      </text>
      <text x={56} y={22} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
        Consommation c
      </text>

      {/* Graduations x */}
      {[
        { l: 0, lab: "0" },
        { l: 0.25, lab: "1/4" },
        { l: 0.5, lab: "1/2" },
        { l: 1, lab: "1" },
      ].map((t) => (
        <g key={t.lab}>
          <line
            x1={X(t.l)}
            y1={280}
            x2={X(t.l)}
            y2={285}
            stroke="var(--color-foreground)"
            strokeWidth={1}
          />
          <text
            x={X(t.l)}
            y={298}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            {t.lab}
          </text>
        </g>
      ))}
      {/* Graduations y */}
      {[
        { c: 2, lab: "2" },
        { c: 10, lab: "10" },
        { c: 14, lab: "14" },
        { c: 18, lab: "18" },
        { c: 20, lab: "20" },
      ].map((t) => (
        <g key={t.lab}>
          <line
            x1={45}
            y1={Y(t.c)}
            x2={50}
            y2={Y(t.c)}
            stroke="var(--color-foreground)"
            strokeWidth={1}
          />
          <text
            x={41}
            y={Y(t.c) + 4}
            fontSize={11}
            textAnchor="end"
            fill="var(--color-muted-foreground)"
          >
            {t.lab}
          </text>
        </g>
      ))}

      {/* Droite sans taxe : c = 20(1−l) */}
      <line x1={X(0)} y1={Y(20)} x2={X(1)} y2={Y(0)} stroke={C_BLUE} strokeWidth={2.4} />
      {/* Droite avec taxe + transfert : c = 16(1−l) + 2 */}
      <line x1={X(0)} y1={Y(18)} x2={X(1)} y2={Y(2)} stroke={C_AMBER} strokeWidth={2.4} />

      {/* Croisement des deux droites en l = 1/2, c = 10 */}
      <circle cx={X(0.5)} cy={Y(10)} r={3.5} fill="var(--color-foreground)" />
      <text x={X(0.5) + 8} y={Y(10) + 14} fontSize={10.5} fill="var(--color-muted-foreground)">
        croisement en l = 1/2
      </text>

      {/* Transfert M(t) = 2 visible en l = 1 (aucun travail) */}
      <line x1={X(1)} y1={Y(0)} x2={X(1)} y2={Y(2)} stroke={C_GREEN} strokeWidth={3.2} />
      <text
        x={X(1) - 6}
        y={Y(2) - 7}
        fontSize={11}
        fontWeight={700}
        textAnchor="end"
        fill={C_GREEN}
      >
        M(t) = 2
      </text>

      {/* Optimum du type H avec taxe : (l = 1/4 ; c = 14) */}
      <line
        x1={X(0.25)}
        y1={Y(14)}
        x2={X(0.25)}
        y2={280}
        stroke={C_GREEN}
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <line
        x1={50}
        y1={Y(14)}
        x2={X(0.25)}
        y2={Y(14)}
        stroke={C_GREEN}
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <circle cx={X(0.25)} cy={Y(14)} r={5} fill={C_GREEN} />
      <text x={X(0.25) + 10} y={Y(14) - 8} fontSize={11.5} fontWeight={700} fill={C_GREEN}>
        optimum H : (1/4 ; 14)
      </text>

      {/* Légende */}
      <rect x={200} y={34} width={12} height={12} rx={2} fill={C_BLUE} />
      <text x={218} y={44} fontSize={11.5} fill="var(--color-foreground)">
        Sans taxe : c = 20(1 − l), pente −20
      </text>
      <rect x={200} y={54} width={12} height={12} rx={2} fill={C_AMBER} />
      <text x={218} y={64} fontSize={11.5} fill="var(--color-foreground)">
        Avec taxe : c = 16(1 − l) + 2, pente −16
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q2 · Utilité concave, équivalent certain et prime de risque  */
/* ------------------------------------------------------------------ */

function PrimeDeRisqueSVG() {
  return (
    <svg
      viewBox="0 0 460 340"
      className="mx-auto h-auto w-full max-w-lg"
      role="img"
      aria-label="Fonction d'utilité concave racine de w avec la corde du pari : l'équivalent certain 420,25 est à gauche de la VMA 422,50, l'écart est la prime de risque 2,25"
    >
      {/* Axes */}
      <line x1={45} y1={280} x2={445} y2={280} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <line x1={60} y1={290} x2={60} y2={30} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <text
        x={438}
        y={298}
        fontSize={12}
        fontWeight={700}
        textAnchor="end"
        fill="var(--color-foreground)"
      >
        Richesse w
      </text>
      <text x={66} y={27} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
        Utilité u(w)
      </text>

      {/* Corde (utilité espérée entre les deux issues) */}
      <line
        x1={90}
        y1={250}
        x2={420}
        y2={70}
        stroke={C_AMBER}
        strokeWidth={1.8}
        strokeDasharray="6 4"
      />
      {/* Courbe concave u = racine(w) — passe par (215 ; 160) où u = 20,5 */}
      <path d="M 90 250 Q 141 178 420 70" fill="none" stroke={C_BLUE} strokeWidth={2.6} />
      <text x={300} y={96} fontSize={12.5} fontWeight={700} fill={C_BLUE}>
        u(w) = √w
      </text>
      <text x={286} y={175} fontSize={11} fill={C_AMBER}>
        corde : utilité espérée
      </text>

      {/* Niveau d'utilité 20,5 */}
      <line
        x1={60}
        y1={160}
        x2={255}
        y2={160}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <text x={56} y={164} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
        20,5
      </text>

      {/* Points extrêmes du pari */}
      <circle cx={90} cy={250} r={4} fill="var(--color-foreground)" />
      <text x={80} y={243} fontSize={11} textAnchor="start" fill="var(--color-muted-foreground)">
        u(361) = 19
      </text>
      <line
        x1={90}
        y1={250}
        x2={90}
        y2={280}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <text x={90} y={296} fontSize={11} textAnchor="middle" fill="var(--color-foreground)">
        361
      </text>
      <circle cx={420} cy={70} r={4} fill="var(--color-foreground)" />
      <text x={414} y={58} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
        u(484) = 22
      </text>
      <line
        x1={420}
        y1={70}
        x2={420}
        y2={280}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <text x={420} y={296} fontSize={11} textAnchor="middle" fill="var(--color-foreground)">
        484
      </text>

      {/* EU sur la corde, à l'aplomb de la VMA */}
      <circle cx={255} cy={160} r={5} fill={C_AMBER} />
      <text x={263} y={150} fontSize={11.5} fontWeight={700} fill={C_AMBER}>
        EU = 20,5
      </text>
      <line
        x1={255}
        y1={160}
        x2={255}
        y2={280}
        stroke={C_AMBER}
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <text x={262} y={296} fontSize={11} fontWeight={700} textAnchor="start" fill={C_AMBER}>
        VMA = 422,50
      </text>

      {/* Équivalent certain sur la courbe, même hauteur 20,5 */}
      <circle cx={215} cy={160} r={5} fill={C_GREEN} />
      <text x={118} y={140} fontSize={11.5} fontWeight={700} fill={C_GREEN}>
        u(C) = 20,5
      </text>
      <line
        x1={215}
        y1={160}
        x2={215}
        y2={280}
        stroke={C_GREEN}
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <text x={208} y={310} fontSize={11} fontWeight={700} textAnchor="end" fill={C_GREEN}>
        C = 420,25
      </text>

      {/* Prime de risque : double flèche entre C et VMA */}
      <line x1={215} y1={264} x2={255} y2={264} stroke={C_ROSE} strokeWidth={2} />
      <path d="M 215 264 l 7 -4 v 8 z" fill={C_ROSE} />
      <path d="M 255 264 l -7 -4 v 8 z" fill={C_ROSE} />
      <text x={235} y={254} fontSize={11.5} fontWeight={700} textAnchor="middle" fill={C_ROSE}>
        PRM = 2,25
      </text>

      <text
        x={250}
        y={330}
        fontSize={10.5}
        textAnchor="middle"
        fill="var(--color-muted-foreground)"
      >
        Schéma de principe : écarts horizontaux dilatés autour de 420 pour la lisibilité.
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q3 · Espérances de Léa selon sa croyance p                   */
/* ------------------------------------------------------------------ */

function SeuilCroyanceSVG() {
  // X : p ∈ [0 ; 1] → [50 ; 430] ; Y : espérance ∈ [0 ; 6] → [260 ; 20]
  const X = (p: number) => 50 + 380 * p;
  const Y = (e: number) => 260 - 40 * e;
  return (
    <svg
      viewBox="0 0 460 300"
      className="mx-auto h-auto w-full max-w-lg"
      role="img"
      aria-label="Espérances de gain de Léa en fonction de sa croyance p : la droite 6p croise la droite 2 plus p au seuil p égal 0,4"
    >
      {/* Axes */}
      <line x1={40} y1={260} x2={440} y2={260} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <line x1={50} y1={270} x2={50} y2={15} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <text
        x={432}
        y={278}
        fontSize={12}
        fontWeight={700}
        textAnchor="end"
        fill="var(--color-foreground)"
      >
        Croyance p
      </text>
      <text x={56} y={13} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
        Espérance de gain de Léa
      </text>

      {/* Graduations */}
      {[
        { p: 0, lab: "0" },
        { p: 0.4, lab: "0,4" },
        { p: 0.8, lab: "0,8" },
        { p: 1, lab: "1" },
      ].map((t) => (
        <g key={t.lab}>
          <line
            x1={X(t.p)}
            y1={260}
            x2={X(t.p)}
            y2={265}
            stroke="var(--color-foreground)"
            strokeWidth={1}
          />
          <text
            x={X(t.p)}
            y={279}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            {t.lab}
          </text>
        </g>
      ))}
      {[2, 4, 6].map((e) => (
        <g key={e}>
          <line
            x1={45}
            y1={Y(e)}
            x2={50}
            y2={Y(e)}
            stroke="var(--color-foreground)"
            strokeWidth={1}
          />
          <text
            x={41}
            y={Y(e) + 4}
            fontSize={11}
            textAnchor="end"
            fill="var(--color-muted-foreground)"
          >
            {e}
          </text>
        </g>
      ))}

      {/* Zones de décision */}
      <text
        x={X(0.17)}
        y={40}
        fontSize={11.5}
        fontWeight={700}
        textAnchor="middle"
        fill="var(--color-muted-foreground)"
      >
        Standard optimal
      </text>
      <text
        x={X(0.74)}
        y={40}
        fontSize={11.5}
        fontWeight={700}
        textAnchor="middle"
        fill="var(--color-muted-foreground)"
      >
        Ambitieux optimal
      </text>

      {/* E[A] = 6p */}
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(6)} stroke={C_BLUE} strokeWidth={2.4} />
      <text x={X(0.9)} y={Y(5.4) - 8} fontSize={12} fontWeight={700} textAnchor="end" fill={C_BLUE}>
        E[A] = 6p
      </text>
      {/* E[S] = 2 + p */}
      <line x1={X(0)} y1={Y(2)} x2={X(1)} y2={Y(3)} stroke={C_AMBER} strokeWidth={2.4} />
      <text
        x={X(0.97)}
        y={Y(3) + 18}
        fontSize={12}
        fontWeight={700}
        textAnchor="end"
        fill={C_AMBER}
      >
        E[S] = 2 + p
      </text>

      {/* Seuil p = 0,4 */}
      <line
        x1={X(0.4)}
        y1={Y(2.4)}
        x2={X(0.4)}
        y2={260}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <circle cx={X(0.4)} cy={Y(2.4)} r={5} fill={C_GREEN} />
      <text x={X(0.4) + 8} y={Y(2.4) + 16} fontSize={11.5} fontWeight={700} fill={C_GREEN}>
        seuil p* = 2/5
      </text>

      {/* La croyance de l'énoncé : p = 0,8 */}
      <line
        x1={X(0.8)}
        y1={Y(4.8)}
        x2={X(0.8)}
        y2={260}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1}
        strokeDasharray="2 4"
      />
      <circle cx={X(0.8)} cy={Y(4.8)} r={4} fill={C_BLUE} />
      <text
        x={X(0.8) - 8}
        y={Y(4.8) - 6}
        fontSize={11}
        fontWeight={700}
        textAnchor="end"
        fill={C_BLUE}
      >
        4,8
      </text>
      <circle cx={X(0.8)} cy={Y(2.8)} r={4} fill={C_AMBER} />
      <text
        x={X(0.8) - 8}
        y={Y(2.8) - 6}
        fontSize={11}
        fontWeight={700}
        textAnchor="end"
        fill={C_AMBER}
      >
        2,8
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q4 · Meilleures réponses en stratégies mixtes                */
/* ------------------------------------------------------------------ */

function MeilleuresReponsesMixtesSVG() {
  // X : p ∈ [0 ; 1] → [60 ; 390] ; Y : q ∈ [0 ; 1] → [280 ; 40]
  const X = (p: number) => 60 + 330 * p;
  const Y = (q: number) => 280 - 240 * q;
  return (
    <svg
      viewBox="0 0 440 340"
      className="mx-auto h-auto w-full max-w-lg"
      role="img"
      aria-label="Diagramme des meilleures réponses en stratégies mixtes : les deux correspondances se croisent au point p égal un quart, q égal trois cinquièmes"
    >
      {/* Axes */}
      <line x1={50} y1={280} x2={410} y2={280} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <line x1={60} y1={290} x2={60} y2={30} stroke="var(--color-foreground)" strokeWidth={1.3} />
      <text
        x={404}
        y={300}
        fontSize={11.5}
        fontWeight={700}
        textAnchor="end"
        fill="var(--color-foreground)"
      >
        p (contrebandier : proba Route)
      </text>
      <text x={66} y={26} fontSize={11.5} fontWeight={700} fill="var(--color-foreground)">
        q (douanier : proba Route)
      </text>

      {/* Graduations */}
      {[
        { p: 0, lab: "0" },
        { p: 0.25, lab: "1/4" },
        { p: 1, lab: "1" },
      ].map((t) => (
        <g key={t.lab}>
          <line
            x1={X(t.p)}
            y1={280}
            x2={X(t.p)}
            y2={285}
            stroke="var(--color-foreground)"
            strokeWidth={1}
          />
          <text
            x={X(t.p)}
            y={298}
            fontSize={11}
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            {t.lab}
          </text>
        </g>
      ))}
      {[
        { q: 0, lab: "0" },
        { q: 0.6, lab: "3/5" },
        { q: 1, lab: "1" },
      ].map((t) => (
        <g key={t.lab}>
          <line
            x1={55}
            y1={Y(t.q)}
            x2={60}
            y2={Y(t.q)}
            stroke="var(--color-foreground)"
            strokeWidth={1}
          />
          <text
            x={51}
            y={Y(t.q) + 4}
            fontSize={11}
            textAnchor="end"
            fill="var(--color-muted-foreground)"
          >
            {t.lab}
          </text>
        </g>
      ))}

      {/* MR du douanier (fonction de p) : q = 0 si p < 1/4, saut vertical en p = 1/4, q = 1 ensuite */}
      <path
        d={`M ${X(0)} ${Y(0)} L ${X(0.25)} ${Y(0)} L ${X(0.25)} ${Y(1)} L ${X(1)} ${Y(1)}`}
        fill="none"
        stroke={C_BLUE}
        strokeWidth={3}
      />
      {/* MR du contrebandier (fonction de q) : p = 1 si q < 3/5, palier horizontal en q = 3/5, p = 0 ensuite */}
      <path
        d={`M ${X(1)} ${Y(0)} L ${X(1)} ${Y(0.6)} L ${X(0)} ${Y(0.6)} L ${X(0)} ${Y(1)}`}
        fill="none"
        stroke={C_ROSE}
        strokeWidth={3}
        strokeDasharray="8 5"
      />

      {/* Intersection = équilibre en stratégies mixtes */}
      <line
        x1={X(0.25)}
        y1={Y(0.6)}
        x2={X(0.25)}
        y2={280}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <line
        x1={60}
        y1={Y(0.6)}
        x2={X(0.25)}
        y2={Y(0.6)}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <circle cx={X(0.25)} cy={Y(0.6)} r={6} fill={C_GREEN} />
      <text x={X(0.25) + 12} y={Y(0.6) - 10} fontSize={12} fontWeight={700} fill={C_GREEN}>
        ENM : (p* ; q*) = (1/4 ; 3/5)
      </text>

      {/* Légende */}
      <line x1={150} y1={318} x2={178} y2={318} stroke={C_BLUE} strokeWidth={3} />
      <text x={184} y={322} fontSize={11.5} fill="var(--color-foreground)">
        MR du douanier
      </text>
      <line
        x1={150}
        y1={334}
        x2={178}
        y2={334}
        stroke={C_ROSE}
        strokeWidth={3}
        strokeDasharray="8 5"
      />
      <text x={184} y={338} fontSize={11.5} fill="var(--color-foreground)">
        MR du contrebandier
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q5 · Arbre de Stackelberg réduit et backward induction       */
/* ------------------------------------------------------------------ */

function ArbreStackelbergSVG() {
  return (
    <svg
      viewBox="0 0 460 320"
      className="mx-auto h-auto w-full max-w-lg"
      role="img"
      aria-label="Arbre du jeu de Stackelberg réduit : la firme 1 choisit 30 ou 20, la firme 2 réagit ; la backward induction sélectionne le chemin 30 puis 15 avec les profits 450 et 225"
    >
      {/* Arêtes de la firme 1 */}
      <line x1={230} y1={52} x2={120} y2={128} stroke={C_GREEN} strokeWidth={3.4} />
      <line
        x1={230}
        y1={52}
        x2={340}
        y2={128}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.8}
      />
      <text x={152} y={82} fontSize={12} fontWeight={700} textAnchor="end" fill={C_GREEN}>
        q₁ = 30
      </text>
      <text x={310} y={82} fontSize={12} fontWeight={700} fill="var(--color-muted-foreground)">
        q₁ = 20
      </text>

      {/* Arêtes de la firme 2 (nœud gauche : q1 = 30) */}
      <line x1={120} y1={148} x2={62} y2={222} stroke={C_GREEN} strokeWidth={3.4} />
      <line
        x1={120}
        y1={148}
        x2={182}
        y2={222}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.8}
      />
      <text x={82} y={182} fontSize={11.5} fontWeight={700} textAnchor="end" fill={C_GREEN}>
        q₂ = 15 (MR)
      </text>
      <text x={158} y={182} fontSize={11.5} fill="var(--color-muted-foreground)">
        q₂ = 20
      </text>

      {/* Arête de la firme 2 (nœud droit : q1 = 20, les deux stratégies prescrivent 20) */}
      <line
        x1={340}
        y1={148}
        x2={340}
        y2={222}
        stroke="var(--color-muted-foreground)"
        strokeWidth={1.8}
      />
      <text x={348} y={188} fontSize={11.5} fill="var(--color-muted-foreground)">
        q₂ = 20 (MR = [20])
      </text>

      {/* Nœuds */}
      <circle cx={230} cy={42} r={13} fill={C_ROSE} />
      <text x={230} y={46} fontSize={11} fontWeight={700} textAnchor="middle" fill="#fff">
        F1
      </text>
      <text
        x={230}
        y={18}
        fontSize={12}
        fontWeight={700}
        textAnchor="middle"
        fill="var(--color-foreground)"
      >
        Firme 1 (leader) joue d'abord
      </text>
      <circle cx={120} cy={138} r={13} fill={C_BLUE} />
      <text x={120} y={142} fontSize={11} fontWeight={700} textAnchor="middle" fill="#fff">
        F2
      </text>
      <circle cx={340} cy={138} r={13} fill={C_BLUE} />
      <text x={340} y={142} fontSize={11} fontWeight={700} textAnchor="middle" fill="#fff">
        F2
      </text>

      {/* Feuilles et payoffs (π1 ; π2) */}
      <text x={62} y={244} fontSize={12.5} fontWeight={700} textAnchor="middle" fill={C_GREEN}>
        (450 ; 225)
      </text>
      <text x={62} y={260} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
        issue Stackelberg
      </text>
      <text x={182} y={244} fontSize={12.5} textAnchor="middle" fill="var(--color-foreground)">
        (300 ; 200)
      </text>
      <text x={340} y={244} fontSize={12.5} textAnchor="middle" fill="var(--color-foreground)">
        (400 ; 400)
      </text>

      {/* Annotations backward induction */}
      <text x={120} y={286} fontSize={11} textAnchor="middle" fill={C_GREEN}>
        F2 choisit 15 : 225 &gt; 200 (la « menace » de jouer 20 n'est pas crédible)
      </text>
      <text x={230} y={306} fontSize={11} textAnchor="middle" fill={C_GREEN}>
        F1 anticipe et compare : 450 (via q₁ = 30) &gt; 400 (via q₁ = 20) → q₁* = 30
      </text>
    </svg>
  );
}

/* ================================================================== */
/* Page de résolution guidée                                           */
/* ================================================================== */

export default function ExamSolution() {
  return (
    <ExamSolutionShell examId="p1-blanc-3">
      {/* ============================================================ */}
      {/* Question 1 — Offre de travail et redistribution (50 pts)      */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-3"
        id="q1"
        number={1}
        title="Question 1 — Offre de travail et redistribution (50 pts)"
        difficulty={3}
        refs={[
          { chapter: "a1", section: "optim" },
          { chapter: "a1", section: "redistrib" },
          { chapter: "a1", section: "pareto" },
        ]}
        statement={
          <>
            <p>
              Considère une île où habitent un très grand nombre <M tex="N" /> de travailleurs. La
              moitié de ces travailleurs a un salaire brut <M tex="s_H = 20" /> et l'autre moitié un
              salaire brut <M tex="s_B = 10" />. La dotation en temps de chaque travailleur est{" "}
              <M tex="L = 1" /> et le prix d'une unité de consommation est <M tex="p = 1" />. Les
              préférences de chaque travailleur sur sa consommation <M tex="c" /> et son temps de
              loisir <M tex="l" /> sont représentées par la fonction d'utilité
            </p>
            <MB tex="U(l, c) = c + 4\ln(l)" />
            <p>
              Le gouvernement prélève une taxe au taux <M tex="t" /> sur les revenus bruts du
              travail. Il répartit le montant total collecté en parts égales entre tous les
              travailleurs, qui reçoivent donc chacun un montant forfaitaire <M tex="M(t)" />.
            </p>
            <p>
              <em>
                Note : comme <M tex="N" /> est très grand, chaque travailleur considère le montant{" "}
                <M tex="M(t)" /> comme une donnée lorsqu'il choisit son temps de travail.
              </em>
            </p>
            <p>
              <strong>
                Dans les sous-questions 1.1) à 1.3), suppose que <M tex="t = 0{,}2" />.
              </strong>
            </p>
            <SubQuestion label="1.1)">
              Écris la contrainte de budget d'un travailleur à haut salaire, puis celle d'un
              travailleur à bas salaire. (10 points)
            </SubQuestion>
            <SubQuestion label="1.2)">
              En utilisant la méthode du Lagrangien, calcule le temps de travail optimal de chacun
              des deux types de travailleurs. Détaille ton raisonnement. (15 points)
            </SubQuestion>
            <SubQuestion label="1.3)">
              Calcule le revenu du travail net perçu par chaque type de travailleur. (8 points)
            </SubQuestion>
            <SubQuestion label="1.4)">
              Le gouvernement envisage d'augmenter le taux de taxe <M tex="t" />. En t'appuyant sur
              l'expression du loisir optimal obtenue en 1.2), détermine l'effet d'une hausse de{" "}
              <M tex="t" /> sur l'offre de travail de chaque type, puis donne l'intuition économique
              de ce résultat. (8 points)
            </SubQuestion>
            <SubQuestion label="1.5)">
              On admet qu'en refaisant tous les calculs pour un taux de taxe <M tex="t = 0{,}5" />
              , puis en calculant les utilités atteintes, on obtient le tableau ci-dessous. L'une
              des deux allocations (celle associée à <M tex="t = 0{,}2" /> ou celle associée à{" "}
              <M tex="t = 0{,}5" />) domine-t-elle l'autre au sens de Pareto ? Détaille ton
              raisonnement. (9 points)
            </SubQuestion>
            <div className="my-4 overflow-x-auto">
              <table className="w-full min-w-[18rem] border-collapse text-[14.5px]">
                <thead>
                  <tr>
                    <th className={TH}>Taux</th>
                    <th className={THc}>
                      <M tex="M(t)" />
                    </th>
                    <th className={THc}>
                      <M tex="U_H" />
                    </th>
                    <th className={THc}>
                      <M tex="U_B" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={TD}>
                      <M tex="t = 0{,}2" />
                    </td>
                    <td className={TDc}>2</td>
                    <td className={TDc}>8,45</td>
                    <td className={TDc}>3,23</td>
                  </tr>
                  <tr>
                    <td className={TD}>
                      <M tex="t = 0{,}5" />
                    </td>
                    <td className={TDc}>3,5</td>
                    <td className={TDc}>5,83</td>
                    <td className={TDc}>3,61</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : repérer le modèle et la méthode",
            refs: [
              { chapter: "a1", section: "offre" },
              { chapter: "a1", section: "optim" },
            ],
            content: (
              <>
                <p>
                  Avant de calculer quoi que ce soit, identifie <strong>où tu es</strong> dans le
                  cours. Trois indices de l'énoncé ne trompent pas :
                </p>
                <ul>
                  <li>
                    une fonction d'utilité sur <strong>consommation et loisir</strong>{" "}
                    <M tex="U(l,c) = c + 4\ln(l)" /> avec une dotation en temps <M tex="L = 1" /> →
                    c'est le <strong>modèle d'offre de travail</strong> du chapitre A1 ;
                  </li>
                  <li>
                    l'énoncé impose la <strong>« méthode du Lagrangien »</strong> en 1.2) → il
                    faudra poser la contrainte, écrire <M tex="\mathcal{L}" />, dériver les trois
                    conditions de premier ordre et résoudre le système, sans sauter d'étape ;
                  </li>
                  <li>
                    une taxe <strong>redistribuée</strong> en un transfert forfaitaire{" "}
                    <M tex="M(t)" />, puis une question de <strong>domination de Pareto</strong> en
                    1.5) → c'est l'application « redistribution » du chapitre, avec sa conclusion
                    classique sur l'arbitrage équité–efficacité.
                  </li>
                </ul>
                <p>
                  Le plan de bataille est donc entièrement dicté par l'énoncé : (1) contraintes de
                  budget, (2) Lagrangien et temps de travail, (3) revenus nets, (4) statique
                  comparative en <M tex="t" />, (5) comparaison de Pareto.
                </p>
                <Callout variant="examen">
                  <p>
                    50 points, soit un quart de l'épreuve : structure ta copie en cinq blocs
                    numérotés 1.1) → 1.5). Le barème récompense chaque maillon visible du
                    raisonnement (contrainte : 10, Lagrangien complet : 15, revenus : 8, effet de la
                    taxe : 8, Pareto : 9) — un résultat juste sans les étapes perd la majorité des
                    points.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 — Poser les deux contraintes de budget (sans tomber dans le piège du M(t))",
            refs: [
              { chapter: "a1", section: "offre" },
              { chapter: "a1", section: "redistrib" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> la contrainte de budget dit simplement
                  qu'on ne peut pas dépenser plus que ses ressources. Ici, les ressources d'un
                  travailleur ont <strong>deux origines</strong> : le revenu <em>net</em> de son
                  travail et le transfert forfaitaire <M tex="M(t)" /> versé par le gouvernement.
                </p>
                <p>
                  Le travailleur de type <M tex="i \in \{H, B\}" /> partage sa dotation{" "}
                  <M tex="L = 1" /> entre loisir <M tex="l_i" /> et travail <M tex="1 - l_i" />.
                  Chaque heure travaillée rapporte le salaire brut <M tex="s_i" />, amputé de la
                  taxe au taux <M tex="t" /> : le revenu du travail net vaut donc{" "}
                  <M tex="s_i(1-t)(1-l_i)" />. La contrainte générale s'écrit :
                </p>
                <MB tex="p\,c_i \;\le\; s_i(1-t)(1-l_i) + M(t)" />
                <p>
                  Avec <M tex="t = 0{,}2" /> et <M tex="p = 1" />, calcule d'abord les salaires nets
                  : <M tex="20 \times 0{,}8 = 16" /> pour le type H et{" "}
                  <M tex="10 \times 0{,}8 = 8" /> pour le type B. Les deux contraintes demandées
                  sont donc :
                </p>
                <MB tex="\text{Type H} : \quad c_H \le 16\,(1-l_H) + M(t)" />
                <MB tex="\text{Type B} : \quad c_B \le 8\,(1-l_B) + M(t)" />
                <Callout variant="attention">
                  <p>
                    L'énoncé te tend la perche avec sa note : comme <M tex="N" /> est très grand,
                    chaque travailleur traite <M tex="M(t)" /> comme une <strong>donnée</strong> —
                    son choix individuel de travail a un impact négligeable sur la caisse commune.
                    Il serait <strong>incorrect</strong> de remplacer <M tex="M(t)" /> par sa
                    formule de financement (la taxe collectée par tête) dans la contrainte
                    individuelle : la CPO qui en sortirait supposerait qu'un individu croit
                    influencer le transfert de toute l'île.
                  </p>
                </Callout>
                <p>
                  Visualisons ce que la taxe fait à la contrainte du type H : elle{" "}
                  <strong>aplatit</strong> la droite de budget (pente <M tex="-20 \to -16" /> : le
                  loisir coûte moins cher en consommation sacrifiée) et le transfert la{" "}
                  <strong>relève</strong> de <M tex="M(t) = 2" /> :
                </p>
                <BudgetTaxeSVG />
                <p>
                  Remarque la géométrie : les deux droites se croisent en <M tex="l = 1/2" />. Un
                  travailleur H qui travaille beaucoup (<M tex="l < 1/2" />) perd au système
                  taxe-transfert, un travailleur qui travaille peu y gagne — c'est toute la
                  mécanique redistributive de la question 1.5.
                </p>
              </>
            ),
          },
          {
            title: "1.2 — Écrire le Lagrangien et dériver les trois CPO",
            refs: [{ chapter: "a1", section: "optim" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> le travailleur maximise{" "}
                  <M tex="U(l_i, c_i)" /> sous sa contrainte de budget (saturée à l'optimum, car
                  l'utilité est strictement croissante en <M tex="c" />
                  ). Le Lagrangien transforme ce problème contraint en un problème libre, au prix
                  d'une inconnue supplémentaire <M tex="\lambda_i" />.
                </p>
                <p>
                  Pour le type <M tex="i" />, avec <M tex="p = 1" /> :
                </p>
                <MB tex="\mathcal{L}_i = c_i + 4\ln(l_i) - \lambda_i\Bigl(c_i - s_i(1-t)(1-l_i) - M(t)\Bigr)" />
                <p>
                  On annule les trois dérivées partielles. D'abord par rapport à la consommation (la
                  dérivée de <M tex="c_i" /> vaut 1, celle du terme contraint vaut{" "}
                  <M tex="-\lambda_i" />) :
                </p>
                <MB tex="\frac{\partial \mathcal{L}_i}{\partial c_i} = 1 - \lambda_i = 0 \qquad (1)" />
                <p>
                  Puis par rapport au loisir : la dérivée de <M tex="4\ln(l_i)" /> est{" "}
                  <M tex="4/l_i" />, et dans la contrainte, <M tex="l_i" /> apparaît via{" "}
                  <M tex="+\lambda_i\, s_i(1-t)(1-l_i)" /> dont la dérivée est{" "}
                  <M tex="-\lambda_i\, s_i(1-t)" /> :
                </p>
                <MB tex="\frac{\partial \mathcal{L}_i}{\partial l_i} = \frac{4}{l_i} - \lambda_i\, s_i(1-t) = 0 \qquad (2)" />
                <p>
                  Enfin, la dérivée par rapport à <M tex="\lambda_i" /> restitue la contrainte de
                  budget :
                </p>
                <MB tex="\frac{\partial \mathcal{L}_i}{\partial \lambda_i} = 0 \;\Longleftrightarrow\; c_i = s_i(1-t)(1-l_i) + M(t) \qquad (3)" />
                <Callout variant="methode">
                  <p>
                    Recette Lagrangien, toujours la même : (i) contrainte sous la forme{" "}
                    <M tex="\text{dépenses} - \text{ressources} = 0" />, (ii){" "}
                    <M tex="\mathcal{L} = \text{utilité} - \lambda \times \text{contrainte}" />,
                    (iii) une CPO par variable de choix <em>plus</em> une par multiplicateur, (iv)
                    résolution du système. Écris les trois CPO même quand la solution te paraît
                    évidente : au barème, elles valent 4 points à elles seules.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 — Résoudre le système : loisir puis temps de travail optimaux",
            refs: [
              { chapter: "a1", section: "optim" },
              { chapter: "a1", section: "offre" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> le système (1)–(3) se résout en cascade,
                  et c'est la fonction d'utilité <em>quasi-linéaire</em> (linéaire en <M tex="c" />)
                  qui rend tout immédiat. L'équation (1) donne directement :
                </p>
                <MB tex="\lambda_i = 1" />
                <p>
                  On injecte <M tex="\lambda_i = 1" /> dans (2) :
                </p>
                <MB tex="\frac{4}{l_i} - s_i(1-t) = 0 \quad\Longleftrightarrow\quad \frac{4}{l_i} = s_i(1-t)" />
                <p>
                  On isole <M tex="l_i" /> en multipliant les deux membres par <M tex="l_i" /> puis
                  en divisant par <M tex="s_i(1-t)" /> :
                </p>
                <FormulaBox
                  label="Loisir optimal (à connaître par cœur en structure)"
                  tex="l_i^* = \frac{4}{s_i(1-t)}"
                  caption={
                    <>
                      Le loisir optimal est inversement proportionnel au salaire net — et le
                      transfert <M tex="M(t)" /> n'y apparaît pas.
                    </>
                  }
                />
                <p>
                  Application numérique avec <M tex="t = 0{,}2" /> :
                </p>
                <MB tex="l_H^* = \frac{4}{20 \times 0{,}8} = \frac{4}{16} = \frac{1}{4} \qquad ; \qquad l_B^* = \frac{4}{10 \times 0{,}8} = \frac{4}{8} = \frac{1}{2}" />
                <p>
                  Les deux valeurs sont bien intérieures (<M tex="0 < l_i^* < 1" />
                  ), donc la solution du Lagrangien est valide. Les{" "}
                  <strong>temps de travail</strong> demandés s'en déduisent par{" "}
                  <M tex="1 - l_i^*" /> :
                </p>
                <MB tex="1 - l_H^* = \frac{3}{4} \qquad \text{et} \qquad 1 - l_B^* = \frac{1}{2}" />
                <Callout variant="intuition">
                  <p>
                    Le type B travaille moins car son salaire net (8 contre 16) rémunère plus
                    faiblement chaque heure : le loisir lui « coûte » moins cher en consommation
                    perdue. Le salaire net est le <em>prix du loisir</em> — retiens cette lecture,
                    elle donne la réponse de la question 1.4 sans aucun calcul.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 — Calculer les revenus nets du travail",
            refs: [{ chapter: "a1", section: "offre" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> le revenu du travail net est exactement le
                  premier terme de la contrainte de budget : salaire net <M tex="\times" /> temps
                  travaillé, soit <M tex="s_i(1-t)(1-l_i^*)" />. On remplace par les valeurs de 1.2)
                  :
                </p>
                <MB tex="\text{Type H} : \quad 20 \times 0{,}8 \times \frac{3}{4} = 16 \times \frac{3}{4} = \mathbf{12}" />
                <MB tex="\text{Type B} : \quad 10 \times 0{,}8 \times \frac{1}{2} = 8 \times \frac{1}{2} = \mathbf{4}" />
                <p>
                  <strong>Vérification bonus</strong> (excellente habitude d'examen) : ces revenus
                  permettent de retrouver le <M tex="M(t) = 2" /> du tableau de la question 1.5. La
                  taxe collectée par tête vaut en effet
                </p>
                <MB tex="M(0{,}2) = \frac{t}{2}\Bigl(s_H(1-l_H^*) + s_B(1-l_B^*)\Bigr) = \frac{0{,}2}{2}\Bigl(20 \times \frac{3}{4} + 10 \times \frac{1}{2}\Bigr) = 0{,}1 \times 20 = 2" />
                <p>La cohérence avec l'énoncé confirme toute la chaîne de calcul depuis 1.2).</p>
              </>
            ),
          },
          {
            title: "1.4 — Étudier l'effet d'une hausse de la taxe sur l'offre de travail",
            refs: [
              { chapter: "a1", section: "offre" },
              { chapter: "a1", section: "redistrib" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> l'énoncé demande une{" "}
                  <em>statique comparative</em> : comment la solution optimale bouge quand un
                  paramètre (<M tex="t" />) bouge. Tout est déjà dans la formule de 1.2) :
                </p>
                <MB tex="l_i^*(t) = \frac{4}{s_i(1-t)}" />
                <p>
                  Quand <M tex="t" /> augmente, <M tex="(1-t)" /> diminue, donc le dénominateur{" "}
                  <M tex="s_i(1-t)" /> diminue, donc <M tex="l_i^*(t)" /> <strong>augmente</strong>{" "}
                  — pour les deux types. L'offre de travail <M tex="1 - l_i^*(t)" />{" "}
                  <strong>diminue</strong> donc pour les deux types. Vérifie-le sur les valeurs du
                  tableau : entre <M tex="t = 0{,}2" /> et <M tex="t = 0{,}5" />, le loisir de H
                  passe de <M tex="1/4" /> à <M tex="4/10 = 0{,}4" /> et celui de B de{" "}
                  <M tex="1/2" /> à <M tex="4/5 = 0{,}8" />.
                </p>
                <p>
                  <strong>Intuition économique</strong> (la moitié des points !) : la taxe réduit le
                  salaire net <M tex="s_i(1-t)" />, qui est le <em>coût d'opportunité du loisir</em>{" "}
                  — la consommation à laquelle on renonce pour une heure de loisir en plus. Le
                  loisir devenant moins cher, le travailleur en achète davantage… donc il travaille
                  moins. C'est l'effet désincitatif de la taxation du travail.
                </p>
                <Callout variant="intuition">
                  <p>
                    Note aussi ce que la formule <em>ne contient pas</em> : <M tex="M(t)" />. Avec
                    ces préférences quasi-linéaires, recevoir un transfert plus généreux ne modifie
                    pas l'offre de travail (aucun effet revenu sur le loisir) ; seul l'effet
                    d'incitation de la taxe joue. Le mentionner montre au correcteur que tu domines
                    le modèle.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.5 — Trancher entre les deux taux avec le critère de Pareto",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> comparer deux allocations « au sens de
                  Pareto » exige d'abord de rappeler le critère. Une allocation{" "}
                  <strong>domine</strong> une autre au sens de Pareto si elle donne à{" "}
                  <em>chacun</em> une utilité au moins aussi élevée, et à{" "}
                  <em>au moins un individu</em> une utilité strictement plus élevée. Il faut donc
                  l'unanimité (au sens large) pour conclure à une domination.
                </p>
                <p>
                  Avant de comparer, assure-toi de savoir d'où viennent les utilités du tableau —
                  par exemple pour <M tex="t = 0{,}2" /> : la consommation sature le budget,{" "}
                  <M tex="c_H = 12 + 2 = 14" /> et <M tex="c_B = 4 + 2 = 6" />, d'où
                </p>
                <MB tex="U_H = 14 + 4\ln\Bigl(\frac{1}{4}\Bigr) \approx 8{,}45 \qquad ; \qquad U_B = 6 + 4\ln\Bigl(\frac{1}{2}\Bigr) \approx 3{,}23" />
                <p>On compare maintenant type par type, entre les deux taux :</p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Utilité</th>
                        <th className={THc}>t = 0,2</th>
                        <th className={THc}>t = 0,5</th>
                        <th className={TH}>Préférence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>
                          <M tex="U_H" />
                        </td>
                        <td className={TDc}>
                          <strong>8,45</strong>
                        </td>
                        <td className={TDc}>5,83</td>
                        <td className={TD}>H préfère t = 0,2</td>
                      </tr>
                      <tr>
                        <td className={TD}>
                          <M tex="U_B" />
                        </td>
                        <td className={TDc}>3,23</td>
                        <td className={TDc}>
                          <strong>3,61</strong>
                        </td>
                        <td className={TD}>B préfère t = 0,5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Passer d'un taux à l'autre fait un gagnant <em>et</em> un perdant : il n'y a pas
                  d'unanimité, dans un sens comme dans l'autre.{" "}
                  <strong>Aucune des deux allocations ne domine l'autre au sens de Pareto.</strong>{" "}
                  Le critère de Pareto est muet pour départager ces deux taux : les classer
                  exigerait un jugement de valeur supplémentaire — c'est l'arbitrage
                  équité–efficacité.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème (9 points) se décompose en : définition ou critère correctement
                    mobilisé (3), comparaison explicite des deux types (4), conclusion « pas de
                    domination, pas d'unanimité » (2). Une réponse qui dit seulement « non » sans la
                    définition perd les deux tiers des points. Et surtout, ne conclus jamais « t =
                    0,5 est meilleur car plus égalitaire » : Pareto ne dit rien de tel.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> <M tex="c_H \le 16(1-l_H) + M(t)" /> et{" "}
              <M tex="c_B \le 8(1-l_B) + M(t)" />, avec <M tex="M(t)" /> traité comme une donnée.{" "}
              <strong>1.2</strong> <M tex="l_i^* = \tfrac{4}{s_i(1-t)}" /> d'où des temps de travail
              de <M tex="3/4" /> (type H) et <M tex="1/2" /> (type B). <strong>1.3</strong> revenus
              nets : 12 (H) et 4 (B). <strong>1.4</strong> une hausse de <M tex="t" /> augmente{" "}
              <M tex="l_i^*" /> donc réduit l'offre de travail des deux types (le salaire net est le
              coût d'opportunité du loisir ; <M tex="M(t)" /> n'influence pas l'offre).{" "}
              <strong>1.5</strong> H préfère <M tex="t = 0{,}2" /> et B préfère{" "}
              <M tex="t = 0{,}5" /> : aucune allocation ne domine l'autre au sens de Pareto.
            </p>
            <p>
              <strong>À retenir :</strong> dans une grande économie, chacun traite le transfert
              comme donné dans son Lagrangien ; et avec une utilité quasi-linéaire, la CPO sur la
              consommation donne <M tex="\lambda = 1" />, ce qui livre le loisir optimal en une
              ligne.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex2" },
                { session: 1, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 2 — Loteries et attitudes face au risque (40 pts)    */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-3"
        id="q2"
        number={2}
        title="Question 2 — Loteries, équivalent certain et prime de risque (40 pts)"
        difficulty={2}
        refs={[
          { chapter: "a3", section: "s5" },
          { chapter: "a3", section: "s6" },
          { chapter: "a3", section: "s11" },
        ]}
        statement={
          <>
            <p>
              Considère un individu rationnel possédant une richesse certaine de <M tex="w = 400" />{" "}
              euros et dont la fonction d'utilité de Bernoulli est
            </p>
            <MB tex="u(w) = \sqrt{w}" />
            <p>
              On lui propose le pari suivant, basé sur le lancer d'une pièce de monnaie équilibrée :
              si la pièce tombe sur pile, il gagne 84 euros ; si elle tombe sur face, il perd 39
              euros.
            </p>
            <SubQuestion label="2.1)">
              Montre que cet individu est averse au risque. Énonce précisément le théorème du cours
              sur lequel tu t'appuies. (8 points)
            </SubQuestion>
            <SubQuestion label="2.2)">
              Calcule la valeur monétaire attendue (VMA) du pari. Un individu neutre au risque
              accepterait-il ce pari ? (6 points)
            </SubQuestion>
            <SubQuestion label="2.3)">
              Calcule l'utilité espérée de l'individu s'il accepte le pari. Accepte-t-il le pari ?
              Détaille ton raisonnement. (10 points)
            </SubQuestion>
            <SubQuestion label="2.4)">
              On suppose que l'individu accepte le pari. Sa richesse finale est alors un actif
              risqué. Calcule l'équivalent certain <M tex="C" /> de cette richesse finale risquée,
              ainsi que la prime de risque minimale <M tex="\mathrm{PRM} = \mathrm{VMA} - C" />. (10
              points)
            </SubQuestion>
            <SubQuestion label="2.5)">
              L'individu a accepté le pari. Avant de connaître le résultat du lancer, on lui propose
              de prendre le même pari une seconde fois. Sans faire aucun calcul : explique comment
              un décideur rationnel doit évaluer cette seconde proposition, et en quoi un individu
              atteint du biais de cadrage étroit (« narrow framing ») raisonnerait différemment. (6
              points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : la chaîne VMA → utilité espérée → équivalent certain",
            refs: [
              { chapter: "a3", section: "s2" },
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s6" },
            ],
            content: (
              <>
                <p>
                  Les mots-clés de l'énoncé — <em>fonction d'utilité de Bernoulli</em>, <em>VMA</em>
                  , <em>utilité espérée</em>, <em>équivalent certain</em>, <em>prime de risque</em>,{" "}
                  <em>narrow framing</em> — dessinent exactement le parcours du chapitre A3, dans
                  l'ordre des sections du cours. La question est un « menu dégustation » du chapitre
                  :
                </p>
                <ul>
                  <li>
                    2.1 : attitude face au risque → regarder la <strong>concavité</strong> de{" "}
                    <M tex="u" /> (dérivée seconde) ;
                  </li>
                  <li>
                    2.2 : VMA → une simple <strong>moyenne pondérée des gains</strong> ;
                  </li>
                  <li>
                    2.3 : décision d'un individu vNM → comparer{" "}
                    <strong>utilité espérée si accepter</strong> et{" "}
                    <strong>utilité certaine si refuser</strong>, en raisonnant sur les{" "}
                    <strong>richesses finales</strong> ;
                  </li>
                  <li>
                    2.4 : équivalent certain via <M tex="u(C) = \text{utilité espérée}" />, puis{" "}
                    <M tex="\mathrm{PRM} = \mathrm{VMA} - C" /> ;
                  </li>
                  <li>2.5 : biais comportemental → cadrage étroit, aucune formule.</li>
                </ul>
                <Callout variant="methode">
                  <p>
                    Face à toute question « risque », pose systématiquement le tableau des états du
                    monde : ici deux états équiprobables (pile / face, probabilité <M tex="1/2" />{" "}
                    chacun), les gains (+84 / −39) et surtout les <strong>richesses finales</strong>{" "}
                    (484 / 361). Les trois quarts des erreurs de copie viennent d'un mélange entre
                    gains et richesses.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 — Prouver l'aversion au risque par la concavité",
            refs: [{ chapter: "a3", section: "s5" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> l'énoncé exige le théorème <em>et</em> la
                  preuve. Commence par le théorème du cours :
                </p>
                <Callout variant="definition" title="Théorème — aversion au risque et concavité">
                  <p>
                    Un individu est averse au risque <strong>si et seulement si</strong> sa fonction
                    d'utilité de Bernoulli est <strong>concave</strong>, c'est-à-dire si son utilité
                    marginale de la richesse est décroissante : <M tex="u''(w) < 0" /> pour tout{" "}
                    <M tex="w > 0" />.
                  </p>
                </Callout>
                <p>
                  On dérive donc deux fois <M tex="u(w) = \sqrt{w} = w^{1/2}" />. Première dérivée
                  (règle de puissance <M tex="(w^a)' = a\,w^{a-1}" />) :
                </p>
                <MB tex="u'(w) = \frac{1}{2}\,w^{-1/2} = \frac{1}{2\sqrt{w}} > 0" />
                <p>
                  L'utilité est bien croissante (plus de richesse est toujours préféré). Seconde
                  dérivée, en dérivant à nouveau :
                </p>
                <MB tex="u''(w) = \frac{1}{2} \times \Bigl(-\frac{1}{2}\Bigr) w^{-3/2} = -\frac{1}{4}\,w^{-3/2} < 0" />
                <p>
                  Comme <M tex="u''(w) < 0" /> pour tout <M tex="w > 0" />, la fonction est concave
                  : <strong>l'individu est averse au risque</strong>. Intuition : chaque euro
                  supplémentaire apporte moins d'utilité que le précédent, donc un pari équilibré «
                  +z ou −z » fait perdre plus d'utilité qu'il n'en rapporte.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème réserve la moitié des points à l'<strong>énoncé du théorème</strong>{" "}
                    (aversion <M tex="\Leftrightarrow" /> concavité <M tex="\Leftrightarrow" />{" "}
                    <M tex="u'' < 0" />
                    ). Écris-le en toutes lettres <em>avant</em> le calcul — c'est ce que le
                    correcteur cherche des yeux en premier.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.2 — Calculer la VMA du pari",
            refs: [{ chapter: "a3", section: "s2" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> la valeur monétaire attendue est la
                  moyenne des gains pondérée par les probabilités — elle ne fait intervenir ni la
                  richesse initiale ni la fonction d'utilité :
                </p>
                <MB tex="\mathrm{VMA} = \frac{1}{2}\times 84 + \frac{1}{2}\times(-39)" />
                <p>On calcule chaque terme séparément :</p>
                <MB tex="\mathrm{VMA} = 42 - 19{,}5 = \mathbf{22{,}50 \text{ euros}}" />
                <p>
                  Un individu <strong>neutre au risque</strong> classe les actifs uniquement par
                  leur VMA (sa fonction d'utilité est linéaire, seul le niveau moyen compte). Comme{" "}
                  <M tex="22{,}50 > 0" />, il <strong>accepterait</strong> le pari.
                </p>
                <p>
                  <em>Interprétation :</em> le pari est favorable « en moyenne ». Toute la question
                  2.3 sera de savoir si cette compensation moyenne suffit à un individu{" "}
                  <em>averse</em> au risque.
                </p>
              </>
            ),
          },
          {
            title: "2.3 — Passer aux richesses finales et comparer les utilités espérées",
            refs: [
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s5" },
            ],
            content: (
              <>
                <Callout variant="attention">
                  <p>
                    Le piège n° 1 du chapitre : calculer{" "}
                    <M tex="\tfrac{1}{2}\sqrt{84} + \tfrac{1}{2}\sqrt{-39}" />… qui n'a aucun sens.
                    L'utilité de Bernoulli s'applique à la <strong>richesse finale</strong>, jamais
                    aux gains isolés : on raisonne toujours en « où j'atterris », pas en « ce que je
                    gagne ».
                  </p>
                </Callout>
                <p>S'il accepte, les deux richesses finales possibles sont :</p>
                <MB tex="\text{pile} : 400 + 84 = 484 \qquad ; \qquad \text{face} : 400 - 39 = 361" />
                <p>
                  L'utilité espérée d'accepter pondère l'utilité de chaque richesse finale par sa
                  probabilité :
                </p>
                <MB tex="U(\text{accepter}) = \frac{1}{2}\sqrt{484} + \frac{1}{2}\sqrt{361}" />
                <p>
                  Les racines tombent juste — <M tex="22^2 = 484" /> et <M tex="19^2 = 361" /> (un
                  signe que tu es sur la bonne voie : les énoncés d'examen choisissent des carrés
                  parfaits) :
                </p>
                <MB tex="U(\text{accepter}) = \frac{1}{2}\times 22 + \frac{1}{2}\times 19 = 11 + 9{,}5 = \mathbf{20{,}5}" />
                <p>S'il refuse, il conserve 400 euros certains :</p>
                <MB tex="U(\text{refuser}) = u(400) = \sqrt{400} = 20" />
                <p>
                  Comme <M tex="20{,}5 > 20" />, <strong>l'individu accepte le pari</strong>. Averse
                  au risque ne veut pas dire « refuse tout risque » : ici, la compensation moyenne
                  de 22,50 euros est suffisante pour ce niveau de risque.
                </p>
              </>
            ),
          },
          {
            title: "2.4 — Trouver l'équivalent certain C de la richesse finale risquée",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> l'équivalent certain répond à la question
                  « combien de cash sûr vaut exactement cette position risquée, aux yeux de cet
                  individu ? ». Par définition, <M tex="C" /> est le montant certain qui procure la
                  même utilité que l'actif risqué <M tex="a_r" /> (484 ou 361, à pile ou face) :
                </p>
                <MB tex="u(C) = U(a_r) \quad\Longleftrightarrow\quad \sqrt{C} = 20{,}5" />
                <p>
                  On isole <M tex="C" /> en élevant les deux membres au carré :
                </p>
                <MB tex="C = (20{,}5)^2 = \mathbf{420{,}25 \text{ euros}}" />
                <p>
                  <em>Lecture :</em> l'individu est indifférent entre garder sa position risquée et
                  recevoir 420,25 euros cash. Tout montant sûr au-dessus de 420,25 lui ferait vendre
                  son pari.
                </p>
                <Callout variant="methode">
                  <p>
                    L'équation <M tex="u(C) = U(a_r)" /> se résout toujours en appliquant la{" "}
                    <strong>fonction réciproque</strong> de <M tex="u" /> : ici{" "}
                    <M tex="u^{-1}(x) = x^2" /> (élever au carré), avec <M tex="\ln" /> ce serait
                    l'exponentielle. Vérifie l'ordre de grandeur : <M tex="C" /> doit se situer{" "}
                    <em>entre</em> les deux richesses possibles 361 et 484.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.4 — En déduire la prime de risque minimale",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> attention, la PRM se calcule avec la VMA{" "}
                  <em>de la richesse finale risquée</em>, pas celle du pari seul. On la calcule
                  d'abord :
                </p>
                <MB tex="\mathrm{VMA}(a_r) = \frac{1}{2}\times 484 + \frac{1}{2}\times 361 = 242 + 180{,}5 = 422{,}50 \text{ euros}" />
                <p>
                  Cohérence : c'est bien <M tex="400 + 22{,}50" />, la richesse initiale plus la VMA
                  du pari calculée en 2.2). La prime de risque minimale est l'écart entre cette
                  moyenne et l'équivalent certain :
                </p>
                <FormulaBox
                  label="Prime de risque minimale"
                  tex="\mathrm{PRM} = \mathrm{VMA}(a_r) - C = 422{,}50 - 420{,}25 = \mathbf{2{,}25 \text{ euros}}"
                  caption={
                    <>
                      Le « rabais » que l'individu concède sur la valeur moyenne pour se débarrasser
                      du risque.
                    </>
                  }
                />
                <p>
                  <strong>Vérification de cohérence</strong> (réflexe qui rapporte) : l'individu est
                  averse au risque, donc on doit trouver <M tex="C < \mathrm{VMA}" /> et{" "}
                  <M tex="\mathrm{PRM} > 0" /> — c'est bien le cas. Toute la géométrie de la
                  question tient dans une seule figure :
                </p>
                <PrimeDeRisqueSVG />
                <p>
                  La corde joint les deux issues possibles ; l'utilité espérée (20,5) se lit au
                  milieu de la corde, à l'aplomb de la VMA. Comme la courbe est{" "}
                  <strong>au-dessus</strong> de sa corde (concavité), le montant certain{" "}
                  <M tex="C" /> qui donne la même utilité 20,5 est <em>à gauche</em> de la VMA :
                  l'écart horizontal est la PRM.
                </p>
              </>
            ),
          },
          {
            title: "2.5 — Le second pari : portefeuille complet contre « bulle » mentale",
            refs: [{ chapter: "a3", section: "s11" }],
            content: (
              <>
                <p>
                  <strong>Le décideur rationnel</strong> évalue toujours son{" "}
                  <strong>portefeuille complet</strong> de richesses finales. Au moment de la
                  seconde proposition, sa situation n'est plus « 400 euros sûrs » : elle comprend
                  déjà le premier pari en cours. Accepter le second pari, c'est donc passer de la
                  loterie « un pari » à la loterie « deux paris », qui agrège les quatre
                  combinaisons pile/face — dont les scénarios mixtes où un gain sur l'un compense la
                  perte sur l'autre. La bonne comparaison est :
                </p>
                <MB tex="U(\text{deux paris}) \;\lessgtr\; U(\text{un seul pari})" />
                <p>
                  et cette condition d'acceptation est <em>différente</em> de celle de la question
                  2.3 (qui comparait « un pari » à « rien »). L'énoncé ne demande aucun calcul : ce
                  qui est noté, c'est d'identifier le bon <em>cadre</em> d'évaluation.
                </p>
                <p>
                  <strong>Un individu au cadrage étroit</strong>, lui, évalue chaque pari « dans sa
                  bulle », isolément du portefeuille : il raisonnerait comme si le second pari était
                  le premier — en repartant de sa richesse certaine ou d'un équivalent certain du
                  premier pari — et ignorerait la façon dont les deux paris s'agrègent. C'est
                  précisément le biais de <em>narrow framing</em>.
                </p>
                <Callout variant="intuition">
                  <p>
                    Deux paris identiques et indépendants se <strong>diversifient</strong>{" "}
                    partiellement : la probabilité de l'issue vraiment douloureuse (perdre deux
                    fois) n'est que de 1/4. Le cadreur étroit ne « voit » jamais cet effet de
                    compensation, puisqu'il ne superpose jamais les loteries. C'est le même
                    mécanisme que l'exemple célèbre de Samuelson : refuser un pari mais en accepter
                    cent.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1</strong> <M tex="u''(w) = -\tfrac{1}{4}w^{-3/2} < 0" /> : fonction
              concave, individu averse au risque (théorème aversion <M tex="\Leftrightarrow" />{" "}
              concavité). <strong>2.2</strong> <M tex="\mathrm{VMA} = 22{,}50" /> euros ; un neutre
              au risque accepte. <strong>2.3</strong>{" "}
              <M tex="U(\text{accepter}) = 20{,}5 > 20 = u(400)" /> : il accepte.{" "}
              <strong>2.4</strong> <M tex="C = 420{,}25" /> euros et{" "}
              <M tex="\mathrm{PRM} = 422{,}50 - 420{,}25 = 2{,}25" /> euros. <strong>2.5</strong> le
              rationnel compare U(deux paris) à U(un pari) sur son portefeuille complet ; le cadreur
              étroit évalue le second pari isolément.
            </p>
            <p>
              <strong>À retenir :</strong> toujours raisonner sur les richesses finales, et vérifier
              la cohérence <M tex="C < \mathrm{VMA}" /> (donc <M tex="\mathrm{PRM} > 0" />) dès que
              l'individu est averse au risque.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex5" },
                { session: 1, exercise: "ex6" },
                { session: 1, exercise: "ex8" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 3 — Jeu bayésien (50 pts)                            */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-3"
        id="q3"
        number={3}
        title="Question 3 — Jeu bayésien : le projet de Léa et Maxime (50 pts)"
        difficulty={3}
        refs={[
          { chapter: "b4", section: "s4" },
          { chapter: "b4", section: "s6" },
          { chapter: "b1", section: "s3" },
        ]}
        statement={
          <>
            <p>
              Léa et Maxime doivent réaliser ensemble un projet pour un concours d'entrepreneuriat.
              Léa (joueuse 1) choisit le format du dossier : un dossier <strong>Ambitieux</strong>{" "}
              (A) ou un dossier <strong>Standard</strong> (S). Simultanément, Maxime (joueur 2)
              choisit son niveau d'implication : <strong>Travailler</strong> (T) ou{" "}
              <strong>Se reposer</strong> (R).
            </p>
            <p>
              Maxime peut être de deux types : <strong>sérieux</strong> ou{" "}
              <strong>paresseux</strong>. Maxime connaît son propre type, mais Léa ne le connaît pas
              : elle croit que Maxime est sérieux avec probabilité <M tex="p" /> et paresseux avec
              probabilité <M tex="1-p" />. Les gains sont donnés par les deux matrices suivantes (le
              premier nombre est le gain de Léa, le second celui de Maxime) :
            </p>
            <PayoffMatrix
              rowPlayer="Léa"
              colPlayer="Maxime"
              rows={["Ambitieux", "Standard"]}
              cols={["Travailler", "Se reposer"]}
              payoffs={[
                [
                  [6, 4],
                  [0, 1],
                ],
                [
                  [3, 3],
                  [2, 0],
                ],
              ]}
              interactive
              caption={
                <>
                  Si Maxime est <strong>sérieux</strong> (probabilité <M tex="p" />
                  ). Les boutons soulignent les meilleures réponses de ce type — mais attention,
                  l'équilibre du jeu complet est bayésien, pas celui d'une matrice isolée.
                </>
              }
            />
            <PayoffMatrix
              rowPlayer="Léa"
              colPlayer="Maxime"
              rows={["Ambitieux", "Standard"]}
              cols={["Travailler", "Se reposer"]}
              payoffs={[
                [
                  [6, 1],
                  [0, 3],
                ],
                [
                  [3, 0],
                  [2, 2],
                ],
              ]}
              interactive
              caption={
                <>
                  Si Maxime est <strong>paresseux</strong> (probabilité <M tex="1-p" />
                  ). Remarque que les gains de Léa sont identiques dans les deux matrices.
                </>
              }
            />
            <SubQuestion label="3.1)">
              Qu'est-ce qu'une stratégie de Maxime dans ce jeu bayésien ? Énumère toutes les
              stratégies dont il dispose. (10 points)
            </SubQuestion>
            <SubQuestion label="3.2)">
              Détermine la meilleure réponse de chaque type de Maxime. Détaille ton raisonnement.
              (12 points)
            </SubQuestion>
            <SubQuestion label="3.3)">
              Pour <M tex="p = 0{,}8" />, calcule l'équilibre de Nash bayésien de ce jeu. Détaille
              ton raisonnement. (18 points)
            </SubQuestion>
            <SubQuestion label="3.4)">
              Calcule la valeur seuil de <M tex="p" /> en dessous de laquelle l'équilibre de Nash
              bayésien change, et décris l'équilibre obtenu lorsque <M tex="p" /> est inférieur à ce
              seuil. (10 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : reconnaître l'information incomplète",
            refs: [
              { chapter: "b4", section: "s1" },
              { chapter: "b4", section: "s2" },
            ],
            content: (
              <>
                <p>
                  La phrase-signal est : «{" "}
                  <em>Maxime connaît son propre type, mais Léa ne le connaît pas</em> ». Dès qu'un
                  joueur a une information privée (son <strong>type</strong>) et que l'autre n'a
                  qu'une <strong>croyance</strong> probabiliste (<M tex="p" />
                  ), tu es dans un <strong>jeu bayésien</strong> — chapitre B4, pas un simple jeu
                  simultané.
                </p>
                <p>
                  La méthode standard se déroule en trois temps, qui suivent les sous-questions :
                </p>
                <ul>
                  <li>
                    <strong>Temps 1 (3.1)</strong> : redéfinir les stratégies du joueur informé
                    comme des <strong>règles d'action</strong> — une action par type ;
                  </li>
                  <li>
                    <strong>Temps 2 (3.2)</strong> : résoudre le problème du joueur informé{" "}
                    <em>type par type</em> (chaque type connaît sa matrice : gains certains) ;
                  </li>
                  <li>
                    <strong>Temps 3 (3.3–3.4)</strong> : le joueur non informé maximise son{" "}
                    <strong>espérance de gain</strong> pondérée par sa croyance, et on assemble
                    l'équilibre de Nash bayésien (ENB).
                  </li>
                </ul>
                <p>
                  Détail précieux offert par l'énoncé : «{" "}
                  <em>les gains de Léa sont identiques dans les deux matrices</em> ». L'incertitude
                  de Léa ne porte donc pas sur ses propres gains mais sur{" "}
                  <strong>ce que Maxime va jouer</strong> — c'est exactement pour ça qu'il lui
                  faudra une espérance.
                </p>
              </>
            ),
          },
          {
            title: "3.1 — Écrire les stratégies de Maxime comme des règles d'action",
            refs: [{ chapter: "b4", section: "s4" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> dans un jeu bayésien, une stratégie du
                  joueur informé n'est plus une simple action : c'est une{" "}
                  <strong>règle d'action</strong> (un plan complet) qui spécifie une action pour{" "}
                  <em>chaque type possible</em> — car Maxime doit savoir quoi faire dans chacune des
                  situations où la Nature peut le placer.
                </p>
                <p>
                  Maxime a 2 types (sérieux, paresseux) et 2 actions (T, R). Le nombre de règles
                  d'action est donc :
                </p>
                <MB tex="2^2 = 4 \text{ stratégies}" />
                <p>Énumération complète (action si sérieux · action si paresseux) :</p>
                <ul>
                  <li>(T si sérieux · T si paresseux)</li>
                  <li>(T si sérieux · R si paresseux)</li>
                  <li>(R si sérieux · T si paresseux)</li>
                  <li>(R si sérieux · R si paresseux)</li>
                </ul>
                <p>
                  Léa, elle, n'a qu'un seul type : ses stratégies restent de simples actions, A ou
                  S.
                </p>
                <Callout variant="attention">
                  <p>
                    Répondre « Maxime peut jouer T ou R » vaut zéro sur cette sous-question : ce
                    sont ses <em>actions</em>, pas ses <em>stratégies</em>. La distinction
                    action/stratégie est précisément ce que ces 10 points testent.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 — Meilleure réponse du type sérieux : comparer colonne par colonne",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b4", section: "s4" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> chaque type de Maxime connaît sa propre
                  matrice — il compare donc des <strong>gains certains</strong> (le deuxième nombre
                  de chaque case), pour chacune des actions possibles de Léa.
                </p>
                <p>
                  <strong>Type sérieux</strong> (première matrice) :
                </p>
                <ul>
                  <li>
                    si Léa joue <strong>A</strong> : Travailler donne <M tex="4" />, Se reposer
                    donne <M tex="1" /> → <M tex="4 > 1" />, il choisit Travailler ;
                  </li>
                  <li>
                    si Léa joue <strong>S</strong> : Travailler donne <M tex="3" />, Se reposer
                    donne <M tex="0" /> → <M tex="3 > 0" />, il choisit Travailler.
                  </li>
                </ul>
                <p>
                  Travailler est meilleur <em>quelle que soit</em> l'action de Léa :{" "}
                  <strong>T est une stratégie dominante pour le type sérieux</strong>. (Tu peux le
                  vérifier sur la première matrice interactive de l'énoncé : les meilleures réponses
                  de Maxime sont toutes dans la colonne T.)
                </p>
              </>
            ),
          },
          {
            title: "3.2 — Meilleure réponse du type paresseux, puis la règle complète",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b4", section: "s4" },
            ],
            content: (
              <>
                <p>
                  <strong>Type paresseux</strong> (seconde matrice), même raisonnement :
                </p>
                <ul>
                  <li>
                    si Léa joue <strong>A</strong> : Travailler donne <M tex="1" />, Se reposer
                    donne <M tex="3" /> → <M tex="3 > 1" />, il choisit Se reposer ;
                  </li>
                  <li>
                    si Léa joue <strong>S</strong> : Travailler donne <M tex="0" />, Se reposer
                    donne <M tex="2" /> → <M tex="2 > 0" />, il choisit Se reposer.
                  </li>
                </ul>
                <p>
                  <strong>R est une stratégie dominante pour le type paresseux.</strong> En
                  recollant les deux types, la meilleure réponse de Maxime — quelle que soit
                  l'action de Léa — est la règle d'action :
                </p>
                <MB tex="(\text{T si sérieux} \;\cdot\; \text{R si paresseux})" />
                <Callout variant="methode">
                  <p>
                    Le joueur <strong>informé</strong> n'a jamais besoin d'espérance : il connaît
                    son type, donc sa matrice, donc il compare des nombres certains. Quand chaque
                    type a une action dominante (cas très fréquent en examen), la règle de Maxime
                    est fixée <em>avant même</em> de s'occuper de Léa — et elle ne dépendra pas de{" "}
                    <M tex="p" />.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 — Calculer les espérances de Léa face à cette règle (p = 0,8)",
            refs: [{ chapter: "b4", section: "s6" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> Léa ne connaît pas le type de Maxime, mais
                  grâce à 3.2) elle peut <em>prévoir sa règle</em> : s'il est sérieux (probabilité
                  0,8) il jouera T, s'il est paresseux (probabilité 0,2) il jouera R. Chaque action
                  de Léa devient donc une loterie, qu'elle évalue en espérance.
                </p>
                <p>
                  Si elle joue <strong>Ambitieux</strong> : face au sérieux (qui joue T) elle gagne
                  6, face au paresseux (qui joue R) elle gagne 0 :
                </p>
                <MB tex="E[\text{A}] = 0{,}8 \times 6 + 0{,}2 \times 0 = 4{,}8" />
                <p>
                  Si elle joue <strong>Standard</strong> : face au sérieux (T) elle gagne 3, face au
                  paresseux (R) elle gagne 2 :
                </p>
                <MB tex="E[\text{S}] = 0{,}8 \times 3 + 0{,}2 \times 2 = 2{,}4 + 0{,}4 = 2{,}8" />
                <p>
                  Comme <M tex="4{,}8 > 2{,}8" />, la meilleure réponse de Léa est{" "}
                  <strong>Ambitieux</strong>.
                </p>
                <Callout variant="attention">
                  <p>
                    Erreur classique dans le choix des cases : une fois la règle de Maxime fixée,
                    Léa lit la colonne <strong>T dans la matrice « sérieux »</strong> et la colonne{" "}
                    <strong>R dans la matrice « paresseux »</strong> — pas deux colonnes de la même
                    matrice. Prendre 6 et 0 dans la même matrice donne le bon chiffre ici (gains de
                    Léa identiques), mais le réflexe doit être : à chaque type, sa matrice{" "}
                    <em>et</em> son action.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 — Vérifier les meilleures réponses mutuelles et écrire l'ENB",
            refs: [{ chapter: "b4", section: "s6" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> un équilibre de Nash bayésien est un
                  profil de stratégies où chacun joue une meilleure réponse à la stratégie de
                  l'autre. Vérifions les deux directions :
                </p>
                <ul>
                  <li>
                    <strong>Léa</strong> : face à la règle (T si sérieux · R si paresseux), on vient
                    de montrer que A maximise son espérance (<M tex="4{,}8 > 2{,}8" />) ✔
                  </li>
                  <li>
                    <strong>Maxime</strong> : sa règle est composée d'actions{" "}
                    <em>dominantes type par type</em> — elle est donc une meilleure réponse à{" "}
                    <em>n'importe quelle</em> stratégie de Léa, en particulier à A ✔
                  </li>
                </ul>
                <p>L'équilibre de Nash bayésien du jeu est donc :</p>
                <FormulaBox
                  label="ENB pour p = 0,8"
                  tex="\bigl(\ \text{Ambitieux}\ ;\ (\text{T si sérieux} \cdot \text{R si paresseux})\ \bigr)"
                />
                <Callout variant="examen">
                  <p>
                    Au barème, 6 des 18 points portent sur l'<em>écriture</em> de l'équilibre : la
                    stratégie de Maxime doit être la <strong>règle complète</strong>, jamais une
                    action isolée. Écrire « (A ; T) » — même après un raisonnement juste — coûte ces
                    points, car cela décrit ce qui se <em>passe</em> si Maxime est sérieux, pas sa{" "}
                    <em>stratégie</em>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.4 — Chercher le seuil de croyance qui fait basculer Léa",
            refs: [
              { chapter: "b4", section: "s6" },
              { chapter: "b4", section: "s5" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> la règle de Maxime est dominante type par
                  type : elle ne dépend pas de <M tex="p" />. Seules les{" "}
                  <strong>espérances de Léa</strong> bougent avec la croyance. On les réécrit pour
                  un <M tex="p" /> quelconque :
                </p>
                <MB tex="E[\text{A}] = p \times 6 + (1-p) \times 0 = 6p" />
                <MB tex="E[\text{S}] = p \times 3 + (1-p) \times 2 = 3p + 2 - 2p = 2 + p" />
                <p>Léa préfère A si et seulement si :</p>
                <MB tex="6p > 2 + p" />
                <p>
                  On soustrait <M tex="p" /> des deux côtés, puis on divise par 5 :
                </p>
                <MB tex="5p > 2 \quad\Longleftrightarrow\quad p > \frac{2}{5} = 0{,}4" />
                <p>
                  La valeur seuil est{" "}
                  <strong>
                    <M tex="p^* = 2/5 = 0{,}4" />
                  </strong>
                  . Le diagramme montre les deux droites d'espérance et leur croisement :
                </p>
                <SeuilCroyanceSVG />
                <ul>
                  <li>
                    si <M tex="p > 0{,}4" /> : ENB = ( A ; (T si sérieux · R si paresseux) ) — le
                    cas de 3.3 avec <M tex="p = 0{,}8" /> ;
                  </li>
                  <li>
                    si <M tex="p < 0{,}4" /> : ENB ={" "}
                    <strong>( S ; (T si sérieux · R si paresseux) )</strong> — la règle de Maxime ne
                    change pas, seule Léa bascule ;
                  </li>
                  <li>
                    si <M tex="p = 0{,}4" /> : Léa est indifférente (<M tex="E = 2{,}4" /> des deux
                    côtés), les deux profils sont des ENB.
                  </li>
                </ul>
                <Callout variant="intuition">
                  <p>
                    Le dossier Ambitieux est un pari sur le sérieux de Maxime : formidable s'il
                    travaille (6), catastrophique sinon (0). Le dossier Standard est une valeur sûre
                    (3 ou 2 quoi qu'il arrive). Quand Maxime est probablement paresseux, Léa préfère
                    assurer le coup — exactement comme un choix entre actif risqué et actif sûr,
                    transposé en théorie des jeux.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1</strong> une stratégie de Maxime = une règle d'action (une action par
              type) ; il en a <M tex="2^2 = 4" />. <strong>3.2</strong> T est dominant pour le
              sérieux, R pour le paresseux : meilleure réponse = (T si sérieux · R si paresseux).{" "}
              <strong>3.3</strong> pour <M tex="p = 0{,}8" /> :{" "}
              <M tex="E[\text{A}] = 4{,}8 > E[\text{S}] = 2{,}8" />, ENB = ( Ambitieux ; (T si
              sérieux · R si paresseux) ). <strong>3.4</strong> seuil <M tex="p^* = 2/5 = 0{,}4" />{" "}
              ; en dessous, ENB = ( Standard ; (T si sérieux · R si paresseux) ).
            </p>
            <p>
              <strong>À retenir :</strong> le joueur informé se résout type par type (gains
              certains), le joueur non informé en espérance (croyances) — et un ENB s'écrit toujours
              avec la règle d'action complète du joueur informé.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 4, exercise: "ex1" },
                { session: 2, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 4 — Stratégies mixtes (30 pts)                       */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-3"
        id="q4"
        number={4}
        title="Question 4 — Contrebandier contre douanier : stratégies mixtes (30 pts)"
        difficulty={2}
        refs={[
          { chapter: "b1", section: "s8" },
          { chapter: "b1", section: "s5" },
        ]}
        statement={
          <>
            <p>
              À un poste-frontière, un contrebandier choisit de faire passer sa marchandise par la{" "}
              <strong>Route</strong> principale ou par la <strong>Montagne</strong>. Simultanément,
              le douanier choisit de poster son unique patrouille sur la <strong>Route</strong> ou
              dans la <strong>Montagne</strong>. Si le douanier patrouille sur le chemin choisi par
              le contrebandier, la marchandise est saisie ; sinon, elle passe (le passage par la
              montagne est toutefois plus coûteux pour le contrebandier). Les gains sont les
              suivants (le premier nombre est le gain du contrebandier, le second celui du douanier)
              :
            </p>
            <PayoffMatrix
              rowPlayer="Contrebandier"
              colPlayer="Douanier"
              rows={["Route (p)", "Montagne (1−p)"]}
              cols={["Route (q)", "Montagne (1−q)"]}
              payoffs={[
                [
                  [-4, 6],
                  [8, 0],
                ],
                [
                  [4, 0],
                  [-4, 2],
                ],
              ]}
              interactive
              caption={
                <>
                  Clique sur les trois boutons : tu verras qu'aucune case ne cumule les deux
                  soulignements — le jeu n'a pas d'équilibre en stratégies pures.
                </>
              }
            />
            <SubQuestion label="4.1)">
              Montre qu'il n'existe aucun équilibre de Nash en stratégies pures dans ce jeu. (6
              points)
            </SubQuestion>
            <SubQuestion label="4.2)">
              En utilisant le théorème d'indifférence, calcule l'équilibre de Nash en stratégies
              mixtes <M tex="(p^*, q^*)" />, où <M tex="p" /> est la probabilité que le
              contrebandier passe par la route et <M tex="q" /> la probabilité que le douanier
              patrouille sur la route. Détaille tes calculs. (12 points)
            </SubQuestion>
            <SubQuestion label="4.3)">
              Calcule le payoff espéré de chaque joueur à l'équilibre. (6 points)
            </SubQuestion>
            <SubQuestion label="4.4)">
              La valeur de la marchandise augmente : le gain du contrebandier en cas de passage
              réussi par la route passe de 8 à 28, tous les autres gains restant inchangés. Calcule
              le nouvel équilibre en stratégies mixtes. Qui, du contrebandier ou du douanier,
              modifie son comportement à l'équilibre ? Explique ce résultat. (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : un jeu de conflit pur, terrain des stratégies mixtes",
            refs: [
              { chapter: "b1", section: "s8" },
              { chapter: "b1", section: "s1" },
            ],
            content: (
              <>
                <p>
                  L'histoire — un poursuivant qui veut être là où se trouve le fuyard, un fuyard qui
                  veut être ailleurs — est la signature des jeux de <strong>conflit pur</strong>{" "}
                  (famille « gendarme-voleur » / matching pennies). Dans ces jeux, les intérêts sont
                  diamétralement opposés et <strong>chacun veut être imprévisible</strong>.
                </p>
                <p>La structure des sous-questions confirme le programme :</p>
                <ul>
                  <li>
                    4.1 « montre qu'il n'existe aucun EN pur » → balayage des meilleures réponses
                    case par case ;
                  </li>
                  <li>
                    4.2 « théorème d'indifférence » cité noir sur blanc → équilibre mixte par les
                    deux équations d'indifférence ;
                  </li>
                  <li>4.3 payoffs espérés → une évaluation par joueur suffit ;</li>
                  <li>
                    4.4 changement d'un paramètre → <strong>statique comparative</strong>, avec le
                    paradoxe classique des équilibres mixtes en embuscade.
                  </li>
                </ul>
                <Callout variant="methode">
                  <p>
                    Réflexe de notation : dès l'énoncé, note qui randomise quoi —{" "}
                    <M tex="p = \Pr(\text{contrebandier} \to \text{Route})" /> et{" "}
                    <M tex="q = \Pr(\text{douanier} \to \text{Route})" />. La moitié des erreurs de
                    copie sur les stratégies mixtes sont des inversions de <M tex="p" /> et{" "}
                    <M tex="q" />.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 — Balayer les quatre cases : quelqu'un regrette toujours",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> un équilibre de Nash pur est une case où{" "}
                  <em>les deux</em> joueurs jouent une meilleure réponse. On identifie d'abord les
                  meilleures réponses de chacun :
                </p>
                <ul>
                  <li>
                    <strong>Contrebandier</strong> : si le douanier est sur la Route → Montagne (
                    <M tex="4 > -4" />) ; s'il est dans la Montagne → Route (
                    <M tex="8 > -4" />
                    ). Il fuit la patrouille.
                  </li>
                  <li>
                    <strong>Douanier</strong> : si le contrebandier prend la Route → Route (
                    <M tex="6 > 0" />) ; s'il prend la Montagne → Montagne (<M tex="2 > 0" />
                    ). Il poursuit le contrebandier.
                  </li>
                </ul>
                <p>On vérifie alors les quatre profils un à un :</p>
                <ul>
                  <li>(Route ; Route) : le contrebandier dévie vers Montagne ;</li>
                  <li>(Route ; Montagne) : le douanier dévie vers Route ;</li>
                  <li>(Montagne ; Route) : le douanier dévie vers Montagne ;</li>
                  <li>(Montagne ; Montagne) : le contrebandier dévie vers Route.</li>
                </ul>
                <p>
                  Aucune case n'est faite de meilleures réponses mutuelles :{" "}
                  <strong>il n'existe aucun équilibre de Nash en stratégies pures</strong>. Le «
                  perdant » de chaque case a toujours intérêt à changer — le cycle tourne sans fin,
                  exactement ce que montre la matrice interactive de l'énoncé.
                </p>
              </>
            ),
          },
          {
            title: "4.2 — L'indifférence du contrebandier détermine q*",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> le théorème d'indifférence dit qu'à
                  l'équilibre mixte, chaque joueur est <strong>indifférent</strong> entre les
                  stratégies pures qu'il mélange (sinon il mettrait tout son poids sur la
                  meilleure). L'astuce structurelle :
                </p>
                <Callout variant="attention">
                  <p>
                    L'équation d'indifférence du contrebandier détermine la stratégie{" "}
                    <strong>du douanier</strong> (<M tex="q^*" />
                    ), et réciproquement. Croiser les équations à l'envers est le piège le plus payé
                    de tout le chapitre — le barème officiel retire 3 points pour cette inversion.
                  </p>
                </Callout>
                <p>
                  Espérance du contrebandier s'il prend la <strong>Route</strong> (le douanier y est
                  avec probabilité <M tex="q" />) :
                </p>
                <MB tex="E[\text{Route}] = q \times (-4) + (1-q) \times 8 = 8 - 12q" />
                <p>
                  S'il passe par la <strong>Montagne</strong> :
                </p>
                <MB tex="E[\text{Montagne}] = q \times 4 + (1-q) \times (-4) = 8q - 4" />
                <p>Le théorème impose l'égalité des deux :</p>
                <MB tex="8 - 12q = 8q - 4" />
                <p>
                  On regroupe : on ajoute <M tex="12q" /> et <M tex="4" /> des deux côtés :
                </p>
                <MB tex="12 = 20q \quad\Longleftrightarrow\quad q^* = \frac{12}{20} = \frac{3}{5} = 0{,}6" />
                <p>
                  <em>Lecture :</em> le douanier doit patrouiller la route 3 fois sur 5 — juste
                  assez pour annuler l'attrait du gain de 8 qu'offre la route.
                </p>
              </>
            ),
          },
          {
            title: "4.2 — L'indifférence du douanier détermine p*",
            refs: [
              { chapter: "b1", section: "s8" },
              { chapter: "b1", section: "s6" },
            ],
            content: (
              <>
                <p>
                  Même logique, côté douanier. S'il patrouille la <strong>Route</strong> (le
                  contrebandier y passe avec probabilité <M tex="p" />) :
                </p>
                <MB tex="E[\text{Route}] = p \times 6 + (1-p) \times 0 = 6p" />
                <p>
                  S'il patrouille la <strong>Montagne</strong> :
                </p>
                <MB tex="E[\text{Montagne}] = p \times 0 + (1-p) \times 2 = 2 - 2p" />
                <p>Indifférence :</p>
                <MB tex="6p = 2 - 2p" />
                <p>
                  On ajoute <M tex="2p" /> des deux côtés puis on divise par 8 :
                </p>
                <MB tex="8p = 2 \quad\Longleftrightarrow\quad p^* = \frac{2}{8} = \frac{1}{4} = 0{,}25" />
                <FormulaBox
                  label="Équilibre de Nash en stratégies mixtes"
                  tex="(p^*, q^*) = \Bigl(\frac{1}{4},\ \frac{3}{5}\Bigr)"
                  caption={
                    <>
                      Le contrebandier passe par la route 1 fois sur 4 ; le douanier y patrouille 3
                      fois sur 5.
                    </>
                  }
                />
                <p>
                  Le diagramme des meilleures réponses visualise l'équilibre : chaque correspondance
                  saute à son seuil d'indifférence, et l'unique croisement est l'équilibre mixte.
                </p>
                <MeilleuresReponsesMixtesSVG />
              </>
            ),
          },
          {
            title: "4.3 — Les payoffs espérés à l'équilibre, sans calcul superflu",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> à l'équilibre mixte, chaque joueur est par
                  construction indifférent entre ses stratégies pures — son payoff espéré est donc
                  celui de <em>n'importe laquelle</em> d'entre elles. Inutile de développer la
                  double somme sur les quatre cases !
                </p>
                <p>
                  Contrebandier, via sa stratégie Route (avec <M tex="q^* = 3/5" />) :
                </p>
                <MB tex="U_C = 8 - 12\,q^* = 8 - 12 \times \frac{3}{5} = 8 - 7{,}2 = \mathbf{0{,}8}" />
                <p>
                  Douanier, via sa stratégie Route (avec <M tex="p^* = 1/4" />) :
                </p>
                <MB tex="U_D = 6\,p^* = 6 \times \frac{1}{4} = \mathbf{1{,}5}" />
                <p>
                  <strong>Vérification</strong> (le réflexe qui sécurise les points) : l'autre
                  stratégie pure doit donner le même résultat. Contrebandier via Montagne :{" "}
                  <M tex="8 \times 0{,}6 - 4 = 0{,}8" /> ✔ ; douanier via Montagne :{" "}
                  <M tex="2 - 2 \times 0{,}25 = 1{,}5" /> ✔.
                </p>
                <Callout variant="examen">
                  <p>
                    Écris explicitement « par le théorème d'indifférence, j'évalue une seule
                    stratégie pure » puis montre la vérification croisée : tu gagnes du temps{" "}
                    <em>et</em> tu prouves au correcteur que ton équilibre est cohérent — si les
                    deux évaluations différaient, ton <M tex="q^*" /> serait faux.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.4 — Statique comparative : la marchandise vaut plus cher (8 → 28)",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> seul un gain <em>du contrebandier</em>{" "}
                  change. Or son équation d'indifférence détermine… <M tex="q^*" /> ! C'est donc
                  elle qu'on réécrit, avec 28 à la place de 8 :
                </p>
                <MB tex="q \times (-4) + (1-q) \times 28 = q \times 4 + (1-q) \times (-4)" />
                <p>On développe chaque membre :</p>
                <MB tex="28 - 32q = 8q - 4" />
                <p>
                  On regroupe (ajouter <M tex="32q" /> et <M tex="4" /> des deux côtés) :
                </p>
                <MB tex="32 = 40q \quad\Longleftrightarrow\quad q^* = \frac{32}{40} = \frac{4}{5}" />
                <p>
                  Côté douanier : ses gains n'ont pas changé, donc son équation d'indifférence{" "}
                  <M tex="6p = 2 - 2p" /> est inchangée et
                </p>
                <MB tex="p^* = \frac{1}{4} \quad \text{(identique)}" />
                <p>
                  <strong>C'est donc le douanier qui modifie son comportement</strong> : il
                  patrouille la route 4 fois sur 5 au lieu de 3 fois sur 5. Le contrebandier, lui,
                  passe par la route exactement aussi souvent qu'avant.
                </p>
              </>
            ),
          },
          {
            title: "4.4 — Interpréter le paradoxe : chacun joue pour maintenir l'autre indifférent",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  Le résultat surprend : la fraude devient plus lucrative, et pourtant le
                  contrebandier ne fraude pas plus par la route à l'équilibre — c'est le douanier
                  qui devient plus vigilant. L'explication tient à la logique même de l'équilibre
                  mixte :
                </p>
                <ul>
                  <li>
                    la stratégie du <strong>douanier</strong> doit maintenir le{" "}
                    <strong>contrebandier</strong> indifférent : si la route rapporte plus (28), il
                    faut y patrouiller davantage (<M tex="q^*" /> passe de 3/5 à 4/5) pour en
                    annuler l'attrait ;
                  </li>
                  <li>
                    la stratégie du <strong>contrebandier</strong> doit maintenir le{" "}
                    <strong>douanier</strong> indifférent : les gains du douanier n'ayant pas bougé,{" "}
                    <M tex="p^*" /> ne bouge pas non plus.
                  </li>
                </ul>
                <Callout variant="intuition">
                  <p>
                    Retiens la règle générale : dans un équilibre mixte,{" "}
                    <strong>modifier les gains d'un joueur change la stratégie de l'autre</strong>,
                    pas la sienne. C'est le « paradoxe de la dissuasion » : durcir les amendes des
                    fraudeurs ne réduit pas la fraude à l'équilibre, cela permet à l'autorité de
                    contrôler moins souvent — et réciproquement.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>4.1</strong> aucune case ne réunit deux meilleures réponses : pas d'EN pur.{" "}
              <strong>4.2</strong> <M tex="q^* = 3/5" /> (indifférence du contrebandier) et{" "}
              <M tex="p^* = 1/4" /> (indifférence du douanier). <strong>4.3</strong>{" "}
              <M tex="U_C = 0{,}8" /> et <M tex="U_D = 1{,}5" />. <strong>4.4</strong> avec un gain
              de 28 : <M tex="q^* = 4/5" />, <M tex="p^*" /> inchangé — c'est le douanier qui
              s'adapte, car chaque joueur mixe pour maintenir <em>l'autre</em> indifférent.
            </p>
            <p>
              <strong>À retenir :</strong> l'indifférence du joueur A fixe la stratégie du joueur B
              ; et un choc sur les gains de A ne modifie que la stratégie de B.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 2, exercise: "ex5" },
                { session: 2, exercise: "ex4" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 5 — Stackelberg et ENPS (30 pts)                     */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-3"
        id="q5"
        number={5}
        title="Question 5 — Stackelberg, forme normale réduite et ENPS (30 pts)"
        difficulty={2}
        refs={[
          { chapter: "b4", section: "s7" },
          { chapter: "b1", section: "s5" },
          { chapter: "b3", section: "sec-fini" },
        ]}
        statement={
          <>
            <p>
              Considère le jeu séquentiel de Stackelberg suivant, avec la firme 1, leader, et la
              firme 2, follower. La fonction de demande inverse est <M tex="p = 80 - Q" />, où{" "}
              <M tex="Q = q_1 + q_2" />, et les coûts marginaux (constants) sont{" "}
              <M tex="c_1 = c_2 = 20" />.
            </p>
            <SubQuestion label="5.1)">
              Résous le modèle : trouve la quantité du leader, celle du follower, le prix de marché
              et les deux profits. Détaille ton raisonnement. (12 points)
            </SubQuestion>
            <SubQuestion label="5.2)">
              Représente le jeu sous forme normale en te limitant à deux stratégies pour la firme 1
              : [produire 30] et [produire 20], et deux stratégies pour la firme 2 : [
              <M tex="q_2 = 30 - \tfrac{1}{2}q_1" />] et [<M tex="q_2 = 20" /> quel que soit{" "}
              <M tex="q_1" />
              ]. Calcule les quatre paires de payoffs et reporte-les dans la forme normale.
              Identifie ensuite tous les équilibres de Nash de ce jeu réduit et vérifie que l'issue
              de Stackelberg trouvée en 5.1) correspond à l'un d'entre eux. (12 points)
            </SubQuestion>
            <SubQuestion label="5.3)">
              Explique pourquoi l'équilibre de Stackelberg est un équilibre de Nash parfait en
              sous-jeux (ENPS), alors que l'autre équilibre de Nash identifié en 5.2) ne l'est pas.
              (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : séquentiel → backward induction",
            refs: [
              { chapter: "b4", section: "s7" },
              { chapter: "b3", section: "sec-fini" },
            ],
            content: (
              <>
                <p>
                  Les mots <strong>leader</strong> et <strong>follower</strong> signalent un jeu{" "}
                  <strong>séquentiel</strong> : la firme 1 choisit sa quantité, la firme 2 l'observe
                  puis choisit la sienne. La méthode de résolution des jeux séquentiels est toujours
                  la <strong>backward induction</strong> : on résout le jeu{" "}
                  <em>en remontant le temps</em>.
                </p>
                <ul>
                  <li>
                    <strong>Étape A (dernier joueur)</strong> : pour chaque <M tex="q_1" />{" "}
                    possible, quelle est la meilleure réponse de la firme 2 ? → sa{" "}
                    <em>fonction de réaction</em> <M tex="q_2^*(q_1)" /> ;
                  </li>
                  <li>
                    <strong>Étape B (premier joueur)</strong> : la firme 1, qui anticipe cette
                    réaction, l'injecte dans son profit et maximise.
                  </li>
                </ul>
                <p>
                  Les sous-questions 5.2) et 5.3) font ensuite le pont avec les concepts d'équilibre
                  : le même jeu, mis en forme normale, a <em>plusieurs</em> équilibres de Nash — et
                  l'ENPS (équilibre de Nash parfait en sous-jeux) est le critère qui sélectionne
                  celui qui survit à la backward induction.
                </p>
                <Callout variant="attention">
                  <p>
                    Ne confonds pas Stackelberg et Cournot : en Cournot (simultané), chaque firme
                    prend la quantité de l'autre <em>comme donnée</em>. En Stackelberg, le leader{" "}
                    <strong>
                      ne prend pas <M tex="q_2" /> comme donné
                    </strong>{" "}
                    : il sait que <M tex="q_2" /> réagira à son choix via la fonction de réaction,
                    et il exploite ce levier.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.1 — Résoudre le problème du follower : la fonction de réaction",
            refs: [
              { chapter: "b1", section: "s5" },
              { chapter: "b4", section: "s7" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> on commence par la fin. La firme 2 observe{" "}
                  <M tex="q_1" /> et choisit <M tex="q_2" /> pour maximiser son profit (recette
                  moins coût, avec <M tex="p = 80 - q_1 - q_2" /> et un coût marginal de 20) :
                </p>
                <MB tex="\pi_2 = (80 - q_1 - q_2)\,q_2 - 20\,q_2 = (60 - q_1 - q_2)\,q_2" />
                <p>
                  On développe pour dériver facilement : <M tex="\pi_2 = 60q_2 - q_1 q_2 - q_2^2" />
                  . Condition de premier ordre (la dérivée par rapport à <M tex="q_2" /> s'annule) :
                </p>
                <MB tex="\frac{\partial \pi_2}{\partial q_2} = 60 - q_1 - 2q_2 = 0" />
                <p>
                  On isole <M tex="q_2" /> :
                </p>
                <MB tex="2q_2 = 60 - q_1" />
                <FormulaBox
                  label="Fonction de réaction du follower"
                  tex="q_2^*(q_1) = 30 - \frac{q_1}{2}"
                  caption={
                    <>
                      Pour chaque unité produite en plus par le leader, le follower recule d'une
                      demi-unité.
                    </>
                  }
                />
                <p>
                  <em>Interprétation :</em> cette fonction est la <strong>stratégie</strong>{" "}
                  complète de la firme 2 — un plan qui répond à <em>tous</em> les <M tex="q_1" />{" "}
                  possibles, pas seulement à celui qui sera joué.
                </p>
              </>
            ),
          },
          {
            title: "5.1 — Le leader anticipe la réaction et maximise",
            refs: [{ chapter: "b3", section: "sec-fini" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> la firme 1 sait que la firme 2 répondra{" "}
                  <M tex="q_2 = 30 - q_1/2" />. Elle substitue donc cette réaction dans son propre
                  profit <M tex="\pi_1 = (60 - q_1 - q_2)\,q_1" /> :
                </p>
                <MB tex="\pi_1 = \Bigl(60 - q_1 - \bigl(30 - \tfrac{q_1}{2}\bigr)\Bigr)q_1" />
                <p>
                  Simplifions la parenthèse pas à pas :{" "}
                  <M tex="60 - q_1 - 30 + \tfrac{q_1}{2} = 30 - \tfrac{q_1}{2}" />, d'où :
                </p>
                <MB tex="\pi_1 = \Bigl(30 - \frac{q_1}{2}\Bigr)q_1 = 30q_1 - \frac{q_1^2}{2}" />
                <p>Condition de premier ordre :</p>
                <MB tex="\frac{\partial \pi_1}{\partial q_1} = 30 - q_1 = 0 \quad\Longrightarrow\quad q_1^* = 30" />
                <Callout variant="methode">
                  <p>
                    La signature d'une résolution Stackelberg correcte : la fonction de réaction du
                    follower apparaît <strong>à l'intérieur</strong> du profit du leader{" "}
                    <em>avant</em> la dérivation. Si tu dérives <M tex="\pi_1" /> en traitant{" "}
                    <M tex="q_2" /> comme une constante, tu résous Cournot — et toute la suite est
                    fausse.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.1 — Calculer quantités, prix et profits d'équilibre",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> il ne reste qu'à dérouler la chaîne des
                  valeurs. La réaction du follower à <M tex="q_1^* = 30" /> :
                </p>
                <MB tex="q_2^* = 30 - \frac{30}{2} = 30 - 15 = \mathbf{15}" />
                <p>Quantité totale et prix de marché :</p>
                <MB tex="Q = 30 + 15 = 45 \qquad ; \qquad p^* = 80 - 45 = \mathbf{35}" />
                <p>
                  Les profits, avec une marge unitaire <M tex="p^* - c = 35 - 20 = 15" /> pour
                  chaque firme :
                </p>
                <MB tex="\pi_1 = (35 - 20)\times 30 = \mathbf{450} \qquad ; \qquad \pi_2 = (35 - 20)\times 15 = \mathbf{225}" />
                <Callout variant="intuition">
                  <p>
                    <strong>L'avantage au premier joueur</strong> saute aux yeux :{" "}
                    <M tex="450 = 2 \times 225" />. En s'engageant tôt sur une grosse quantité, le
                    leader force le follower à se faire petit (15 au lieu des 20 du Cournot
                    symétrique, où chaque firme gagnerait 400). Jouer en premier — et être vu — est
                    ici une force, pas une faiblesse.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.2 — Remplir la forme normale réduite, case par case",
            refs: [{ chapter: "b1", section: "s2" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> l'énoncé réduit le jeu à 2 × 2 stratégies.
                  Attention : pour la firme 2, une stratégie est une <em>règle</em> — la fonction de
                  réaction [MR] ou la quantité fixe [20]. On calcule l'issue de chaque profil avec{" "}
                  <M tex="\pi_i = (80 - Q - 20)\,q_i" /> :
                </p>
                <p>
                  <strong>Case 1 :</strong> [30] contre [MR] → <M tex="q_2 = 30 - 15 = 15" />,{" "}
                  <M tex="Q = 45" />, <M tex="p = 35" />, marge 15 :
                </p>
                <MB tex="\pi_1 = 15 \times 30 = 450 \qquad ; \qquad \pi_2 = 15 \times 15 = 225" />
                <p>
                  <strong>Case 2 :</strong> [30] contre [20] → <M tex="Q = 50" />,{" "}
                  <M tex="p = 30" />, marge 10 :
                </p>
                <MB tex="\pi_1 = 10 \times 30 = 300 \qquad ; \qquad \pi_2 = 10 \times 20 = 200" />
                <p>
                  <strong>Case 3 :</strong> [20] contre [MR] → la règle prescrit{" "}
                  <M tex="q_2 = 30 - 10 = 20" />, <M tex="Q = 40" />, <M tex="p = 40" />, marge 20 :
                </p>
                <MB tex="\pi_1 = 20 \times 20 = 400 \qquad ; \qquad \pi_2 = 20 \times 20 = 400" />
                <p>
                  <strong>Case 4 :</strong> [20] contre [20] → même issue <M tex="Q = 40" /> :
                </p>
                <MB tex="\pi_1 = \pi_2 = 400" />
                <p>D'où la forme normale réduite :</p>
                <PayoffMatrix
                  rowPlayer="Firme 1"
                  colPlayer="Firme 2"
                  rows={["q₁ = 30", "q₁ = 20"]}
                  cols={["MR : q₂ = 30 − q₁/2", "q₂ = 20 (toujours)"]}
                  payoffs={[
                    [
                      [450, 225],
                      [300, 200],
                    ],
                    [
                      [400, 400],
                      [400, 400],
                    ],
                  ]}
                  interactive
                  caption={
                    <>
                      Le jeu de Stackelberg réduit à 2 × 2 stratégies. Utilise les boutons : deux
                      cases cumulent les meilleures réponses des deux joueurs.
                    </>
                  }
                />
                <p>
                  Remarque la ligne du bas : face à <M tex="q_1 = 20" />, les deux stratégies de la
                  firme 2 prescrivent la même quantité (20), d'où deux cases identiques (400 ; 400).
                </p>
              </>
            ),
          },
          {
            title: "5.2 — Identifier les deux équilibres de Nash du jeu réduit",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> on teste chaque profil : est-il fait de
                  meilleures réponses mutuelles ?
                </p>
                <ul>
                  <li>
                    <strong>( [30] ; [MR] )</strong> : la firme 1 obtient 450 ; dévier vers [20]
                    donnerait 400 → elle reste. La firme 2 obtient 225 ; dévier vers [20] donnerait
                    200 → elle reste. <strong>Équilibre de Nash ✔</strong> — et c'est exactement
                    l'issue de Stackelberg de 5.1) : <M tex="(q_1, q_2) = (30, 15)" />, profits (450
                    ; 225).
                  </li>
                  <li>
                    <strong>( [20] ; [20] )</strong> : la firme 1 obtient 400 ; dévier vers [30]
                    donnerait 300 → elle reste. La firme 2 obtient 400 ; dévier vers [MR] donnerait
                    aussi 400 (face à <M tex="q_1 = 20" />, la règle MR prescrit justement 20) →
                    aucune déviation <em>strictement</em> profitable.{" "}
                    <strong>Équilibre de Nash ✔</strong>
                  </li>
                  <li>
                    ( [30] ; [20] ) : la firme 1 préfère dévier vers [20] (<M tex="400 > 300" />) →
                    pas un équilibre.
                  </li>
                  <li>
                    ( [20] ; [MR] ) : la firme 1 préfère dévier vers [30] (<M tex="450 > 400" />) →
                    pas un équilibre.
                  </li>
                </ul>
                <p>
                  Le jeu réduit possède donc <strong>deux équilibres de Nash</strong>, dont l'issue
                  de Stackelberg.
                </p>
                <Callout variant="attention">
                  <p>
                    Pour casser un équilibre de Nash, il faut une déviation{" "}
                    <strong>strictement</strong> profitable. En ( [20] ; [20] ), la firme 2 est{" "}
                    <em>indifférente</em> entre ses deux stratégies (400 = 400) : cette égalité ne
                    détruit pas l'équilibre. Beaucoup de copies éliminent ce profil à tort.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.3 — ENPS : éliminer l'équilibre fondé sur une menace non crédible",
            refs: [
              { chapter: "b3", section: "sec-fini" },
              { chapter: "b4", section: "s7" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape :</strong> un équilibre de Nash{" "}
                  <strong>parfait en sous-jeux</strong> exige que la stratégie de chaque joueur soit
                  optimale <em>dans chaque sous-jeu</em> — y compris ceux qui ne sont jamais
                  atteints à l'équilibre. C'est le critère qui distingue nos deux équilibres.
                </p>
                <p>
                  <strong>( [30] ; [MR] ) est un ENPS :</strong> la stratégie{" "}
                  <M tex="q_2 = 30 - \tfrac{1}{2}q_1" /> prescrit par construction la meilleure
                  réponse de la firme 2 dans <em>tous</em> les sous-jeux (après chaque{" "}
                  <M tex="q_1" /> possible). L'équilibre survit à la backward induction.
                </p>
                <p>
                  <strong>( [20] ; [20] ) n'est pas un ENPS :</strong> la stratégie « produire 20
                  quoi qu'il arrive » fonctionne comme une <strong>menace</strong> : « si tu produis
                  30, je saturerai le marché ». Cette menace dissuade bien le leader dans la forme
                  normale (elle lui promet 300 au lieu de 450). Mais est-elle crédible ?
                  Plaçons-nous dans le sous-jeu où la firme 1 a <em>déjà</em> produit{" "}
                  <M tex="q_1 = 30" /> et comparons les deux options de la firme 2 :
                </p>
                <MB tex="\text{exécuter la menace } (q_2 = 20) : \quad \pi_2 = (80 - 50 - 20)\times 20 = 200" />
                <MB tex="\text{meilleure réponse } (q_2 = 15) : \quad \pi_2 = (80 - 45 - 20)\times 15 = 225" />
                <p>
                  Comme <M tex="200 < 225" />, la firme 2 n'aurait <strong>pas intérêt</strong> à
                  exécuter sa menace le moment venu : la menace est <strong>non crédible</strong>,
                  et la backward induction élimine cet équilibre. Seul l'équilibre de Stackelberg
                  est parfait en sous-jeux.
                </p>
                <ArbreStackelbergSVG />
                <Callout variant="retiens">
                  <p>
                    Nash exige l'optimalité <em>sur le chemin d'équilibre</em> ; l'ENPS l'exige{" "}
                    <em>partout</em>, même hors du chemin. Tout équilibre qui repose sur une
                    promesse ou une menace qu'on n'aurait pas intérêt à tenir est un équilibre de
                    Nash « fragile » que l'ENPS élimine — c'est l'idée centrale de la crédibilité en
                    théorie des jeux.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>5.1</strong> <M tex="q_2^*(q_1) = 30 - \tfrac{q_1}{2}" /> ;{" "}
              <M tex="q_1^* = 30" />, <M tex="q_2^* = 15" />, <M tex="p^* = 35" />,{" "}
              <M tex="\pi_1 = 450" />, <M tex="\pi_2 = 225" />. <strong>5.2</strong> forme normale
              réduite : (450 ; 225), (300 ; 200), (400 ; 400), (400 ; 400) ; deux équilibres de Nash
              — ( [30] ; [MR] ), qui est l'issue de Stackelberg, et ( [20] ; [20] ).{" "}
              <strong>5.3</strong> seul ( [30] ; [MR] ) est un ENPS : « 20 quel que soit{" "}
              <M tex="q_1" /> » n'est pas optimal dans le sous-jeu après <M tex="q_1 = 30" /> (200
              &lt; 225), c'est une menace non crédible.
            </p>
            <p>
              <strong>À retenir :</strong> backward induction = follower d'abord, leader ensuite ;
              et l'ENPS est le filtre qui ne garde, parmi les équilibres de Nash, que ceux dont les
              menaces sont crédibles dans chaque sous-jeu.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 3, exercise: "ex4" },
                { session: 3, exercise: "ex3" },
                { session: 3, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />
    </ExamSolutionShell>
  );
}
