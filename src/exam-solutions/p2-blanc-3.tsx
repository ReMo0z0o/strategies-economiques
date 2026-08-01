/**
 * Résolution guidée · Examen blanc n° 3 — Partie 2 « Économie industrielle ».
 *
 * Trois questions (1h, /100) : tarif en deux parties & double marginalisation
 * (EI3), concurrence en prix avec biens différenciés (EI2), indice de Lerner
 * & Cournot à n firmes (EI1/EI2). Chaque valeur numérique est alignée sur le
 * corrigé officiel (exams/p2-blanc-3/corrige-body.html).
 */
import { ExamSolutionShell } from "@/components/course/ExamSolutionShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { TpRefList } from "@/components/course/TpRef";

/* ------------------------------------------------------------------ */
/* Helpers locaux (styles de tableaux, couleurs de séries)             */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Palette sûre pour daltonisme, cohérente avec les TP. */
const COL_SKY = "#0284c7"; // sky-600
const COL_AMBER = "#d97706"; // amber-600
const COL_GREEN = "#059669"; // emerald-600
const COL_ROSE = "#e11d48"; // rose-600

/* ------------------------------------------------------------------ */
/* Figure Q1 · tarif en deux parties vs prix uniforme                  */
/* ------------------------------------------------------------------ */

function TwoPartTariffFigure() {
  // Panneau gauche : p* = Cm = 4, y* = 12, forfait F* = 72 € (tout le triangle).
  // Panneau droit : monopole simple p = 10, y = 6, Π = 36, SC = 18, PS = 18.
  // Gauche : X(y) = 40 + 11y, Y(p) = 200 − 10p ; droite : X(y) = 268 + 11y.
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 460 234"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Comparaison du tarif en deux parties (prix égal au coût marginal, 12 séances, forfait de 72 euros captant tout le surplus) et du prix uniforme (10 euros, 6 séances, profit 36, surplus du consommateur 18, perte sèche 18)"
      >
        {/* Titres des panneaux */}
        <text x={40} y={16} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Tarif en deux parties
        </text>
        <text x={268} y={16} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Prix uniforme
        </text>

        {/* --- Panneau gauche : p* = Cm, le forfait capte tout le triangle --- */}
        {/* Triangle F* entre la demande et Cm, de 0 à 12 séances */}
        <polygon points="40,40 172,160 40,160" fill={COL_SKY} opacity={0.18} />
        <text x={56} y={132} fontSize={11} fontWeight={700} fill="var(--color-foreground)">
          F* = 72 €
        </text>
        {/* Droite de coût marginal */}
        <line x1={40} y1={160} x2={224} y2={160} stroke="var(--color-muted-foreground)" strokeWidth={1.4} strokeDasharray="5 4" />
        <text x={226} y={164} fontSize={10.5} fill="var(--color-muted-foreground)">
          Cm = 4
        </text>
        {/* Demande p = 16 − y */}
        <line x1={40} y1={40} x2={216} y2={200} stroke={COL_SKY} strokeWidth={2} />
        <text x={152} y={118} fontSize={10.5} fontWeight={600} fill={COL_SKY}>
          p = 16 − y
        </text>
        {/* Optimum : y* = 12 au prix p* = 4 */}
        <line x1={172} y1={160} x2={172} y2={200} stroke={COL_SKY} strokeWidth={1.2} strokeDasharray="3 3" />
        <circle cx={172} cy={160} r={3.5} fill={COL_SKY} />
        {/* Axes */}
        <line x1={40} y1={40} x2={40} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <line x1={40} y1={200} x2={224} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        {/* Graduations */}
        <text x={40} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">0</text>
        <text x={172} y={214} fontSize={10.5} textAnchor="middle" fontWeight={700} fill="var(--color-foreground)">12</text>
        <text x={216} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">16</text>
        <text x={34} y={44} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">16</text>
        <text x={34} y={164} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">4</text>

        {/* --- Panneau droit : marge sur les séances, rationnement, perte sèche --- */}
        {/* Surplus du consommateur */}
        <polygon points="268,40 334,100 268,100" fill={COL_GREEN} opacity={0.2} />
        <text x={274} y={88} fontSize={9.5} fontWeight={600} fill="var(--color-foreground)">
          SC = 18
        </text>
        {/* Profit (rectangle de marge) */}
        <rect x={268} y={100} width={66} height={60} fill={COL_AMBER} opacity={0.25} />
        <text x={276} y={134} fontSize={10.5} fontWeight={700} fill="var(--color-foreground)">
          Π = 36 €
        </text>
        {/* Perte sèche */}
        <polygon points="334,100 400,160 334,160" fill={COL_ROSE} opacity={0.3} />
        <text x={338} y={153} fontSize={9.5} fontWeight={600} fill="var(--color-foreground)">
          PS = 18
        </text>
        {/* Droite de coût marginal */}
        <line x1={268} y1={160} x2={444} y2={160} stroke="var(--color-muted-foreground)" strokeWidth={1.4} strokeDasharray="5 4" />
        <text x={444} y={153} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
          Cm = 4
        </text>
        {/* Demande */}
        <line x1={268} y1={40} x2={444} y2={200} stroke={COL_SKY} strokeWidth={2} />
        {/* Point du monopole simple : (6, 10) */}
        <line x1={334} y1={160} x2={334} y2={200} stroke={COL_AMBER} strokeWidth={1.2} strokeDasharray="3 3" />
        <circle cx={334} cy={100} r={3.5} fill={COL_AMBER} />
        {/* Axes */}
        <line x1={268} y1={40} x2={268} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <line x1={268} y1={200} x2={452} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        {/* Graduations */}
        <text x={268} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">0</text>
        <text x={334} y={214} fontSize={10.5} textAnchor="middle" fontWeight={700} fill="var(--color-foreground)">6</text>
        <text x={400} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">12</text>
        <text x={444} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">16</text>
        <text x={262} y={44} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">16</text>
        <text x={262} y={104} fontSize={10.5} textAnchor="end" fontWeight={700} fill="var(--color-foreground)">10</text>
        <text x={262} y={164} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">4</text>
      </svg>
      <figcaption className="mt-1 text-sm text-muted-foreground">
        Même marché, deux tarifications. À gauche, le club vend les séances au coût marginal
        (12 séances, la quantité efficace) et le forfait <M tex="F^* = 72" /> € capte{" "}
        <em>toute</em> l'aire entre la demande et <M tex="Cm" />. À droite, sans forfait, le club
        margine séance par séance : 6 séances seulement, profit de 36 €, l'adhérent garde 18 € de
        surplus… et 18 € de surplus disparaissent (perte sèche PS).
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q1 · chaîne verticale : deux marges empilées vs intégration  */
/* ------------------------------------------------------------------ */

function VerticalChainFigure() {
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 460 300"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Chaîne verticale brasserie puis caviste puis consommateurs : deux marges empilées mènent au prix final 17 et à 3 caisses vendues, contre une seule marge, un prix de 14 et 6 caisses pour le monopole intégré"
      >
        {/* ------- Colonne gauche : chaîne séparée ------- */}
        <text x={112.5} y={16} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Chaîne séparée (q. 1.3)
        </text>
        <rect x={25} y={28} width={175} height={46} rx={10} fill={COL_SKY} fillOpacity={0.1} stroke={COL_SKY} strokeWidth={1.5} />
        <text x={112.5} y={47} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Brasserie « Amont »
        </text>
        <text x={112.5} y={63} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          Cm = 8 · marge +6
        </text>
        <line x1={112.5} y1={74} x2={112.5} y2={106} stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
        <polygon points="108.5,104 116.5,104 112.5,112" fill="var(--color-muted-foreground)" />
        <text x={121} y={94} fontSize={10.5} fill="var(--color-foreground)">
          prix amont : 14
        </text>
        <rect x={25} y={114} width={175} height={46} rx={10} fill={COL_AMBER} fillOpacity={0.1} stroke={COL_AMBER} strokeWidth={1.5} />
        <text x={112.5} y={133} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Caviste « Aval »
        </text>
        <text x={112.5} y={149} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          achète à 14 · marge +3
        </text>
        <line x1={112.5} y1={160} x2={112.5} y2={192} stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
        <polygon points="108.5,190 116.5,190 112.5,198" fill="var(--color-muted-foreground)" />
        <text x={121} y={180} fontSize={10.5} fill="var(--color-foreground)">
          prix final : 17
        </text>
        <rect x={25} y={200} width={175} height={46} rx={10} fill={COL_GREEN} fillOpacity={0.1} stroke={COL_GREEN} strokeWidth={1.5} />
        <text x={112.5} y={219} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Consommateurs
        </text>
        <text x={112.5} y={235} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          y = 3 caisses
        </text>
        <text x={112.5} y={268} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Profits : 18 + 9 = 27
        </text>
        <text x={112.5} y={284} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          deux marges empilées
        </text>

        {/* ------- Colonne droite : monopole intégré ------- */}
        <text x={347.5} y={16} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Monopole intégré (q. 1.4)
        </text>
        <rect x={260} y={28} width={175} height={46} rx={10} fill={COL_SKY} fillOpacity={0.1} stroke={COL_SKY} strokeWidth={1.5} />
        <text x={347.5} y={47} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Brasserie + caviste
        </text>
        <text x={347.5} y={63} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          Cm = 8 · marge +6
        </text>
        <line x1={347.5} y1={74} x2={347.5} y2={192} stroke="var(--color-muted-foreground)" strokeWidth={1.5} />
        <polygon points="343.5,190 351.5,190 347.5,198" fill="var(--color-muted-foreground)" />
        <text x={356} y={138} fontSize={10.5} fill="var(--color-foreground)">
          prix final : 14
        </text>
        <rect x={260} y={200} width={175} height={46} rx={10} fill={COL_GREEN} fillOpacity={0.1} stroke={COL_GREEN} strokeWidth={1.5} />
        <text x={347.5} y={219} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Consommateurs
        </text>
        <text x={347.5} y={235} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          y = 6 caisses
        </text>
        <text x={347.5} y={268} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Profit : 36
        </text>
        <text x={347.5} y={284} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
          une seule marge → prix plus bas
        </text>
      </svg>
      <figcaption className="mt-1 text-sm text-muted-foreground">
        La double marginalisation en un coup d'œil : dans la chaîne séparée, chaque maillon empile
        sa marge (+6 puis +3) et le prix final grimpe à 17 pour 3 caisses seulement. Le monopole
        intégré ne margine qu'une fois sur le vrai coût (8) : prix final 14, quantité doublée,
        profit joint 36 au lieu de 27 — tout le monde y gagne.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q2 · meilleures réponses en prix (pentes positives)          */
/* ------------------------------------------------------------------ */

function PriceReactionFigure() {
  // X(p1) = 48 + 10,5·p1 ; Y(p2) = 262 − 7·p2 (p1, p2 ∈ [0, 32]).
  // R1 : p1 = 18 + p2/4 → de (237, 262) à (321, 38).
  // R2 : p2 = 18 + p1/4 → de (48, 136) à (384, 80). Équilibre E = (300, 94).
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 300"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Fonctions de meilleure réponse en prix d'Arabica et de Robusta, toutes deux croissantes, qui se coupent à l'équilibre de Nash où chaque prix vaut 24"
      >
        {/* Grille et graduations */}
        {[0, 8, 16, 24, 32].map((v) => (
          <g key={v}>
            <line
              x1={48 + v * 10.5}
              x2={48 + v * 10.5}
              y1={262}
              y2={38}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            <line
              x1={48}
              x2={384}
              y1={262 - v * 7}
              y2={262 - v * 7}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            <text x={48 + v * 10.5} y={276} fontSize={9.5} textAnchor="middle" fill="var(--color-muted-foreground)">
              {v}
            </text>
            {v > 0 ? (
              <text x={43} y={262 - v * 7 + 3.5} fontSize={9.5} textAnchor="end" fill="var(--color-muted-foreground)">
                {v}
              </text>
            ) : null}
          </g>
        ))}
        <text x={216} y={294} fontSize={11} textAnchor="middle" fill="var(--color-muted-foreground)">
          prix d'Arabica p₁
        </text>
        <text
          x={14}
          y={150}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          transform="rotate(-90 14 150)"
        >
          prix de Robusta p₂
        </text>

        {/* R1 : p1 = 18 + p2/4 (quasi verticale) */}
        <line x1={237} y1={262} x2={321} y2={38} stroke={COL_SKY} strokeWidth={2.2} />
        <text x={318} y={54} fontSize={11} fontWeight={700} fill={COL_SKY}>
          R₁ : p₁ = 18 + p₂/4
        </text>
        {/* R2 : p2 = 18 + p1/4 (quasi horizontale) */}
        <line x1={48} y1={136} x2={384} y2={80} stroke={COL_AMBER} strokeWidth={2.2} />
        <text x={56} y={118} fontSize={11} fontWeight={700} fill={COL_AMBER}>
          R₂ : p₂ = 18 + p₁/4
        </text>

        {/* Équilibre de Nash E = (24, 24) */}
        <line x1={300} y1={94} x2={300} y2={262} stroke="var(--color-muted-foreground)" strokeWidth={1.1} strokeDasharray="3 3" />
        <line x1={48} y1={94} x2={300} y2={94} stroke="var(--color-muted-foreground)" strokeWidth={1.1} strokeDasharray="3 3" />
        <circle cx={300} cy={94} r={4.5} fill="var(--color-foreground)" />
        <text x={308} y={112} fontSize={11.5} fontWeight={700} fill="var(--color-foreground)">
          E = (24, 24)
        </text>
      </svg>
      <figcaption className="mt-1 text-sm text-muted-foreground">
        Les deux fonctions de meilleure réponse sont <strong>croissantes</strong> (pente 1/4) :
        quand le rival monte son prix, la meilleure réponse est de monter le sien — les prix sont
        des <em>compléments stratégiques</em>. L'équilibre de Nash est à l'intersection :{" "}
        <M tex="p_1^* = p_2^* = 24" />, bien au-dessus du coût marginal 6.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q3 · l'indice de Lerner fond quand n augmente                */
/* ------------------------------------------------------------------ */

function LernerFigure() {
  // X(n) = 56 + 40·(n − 1) pour n = 1..10 ; Y(L) = 218 − 280·L.
  const pts: Array<[number, number]> = Array.from({ length: 10 }, (_, k) => {
    const n = k + 1;
    return [56 + 40 * k, 218 - 280 * (3 / (n + 4))];
  });
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 440 260"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Indice de Lerner de Cournot à n firmes, égal à trois sur n plus quatre : il vaut trois cinquièmes en monopole, un demi en duopole, et tend vers zéro quand le nombre de firmes tend vers l'infini"
      >
        {/* Grille horizontale : L = 0 ; 0,2 ; 0,4 ; 0,6 */}
        {[0, 0.2, 0.4, 0.6].map((L) => (
          <g key={L}>
            <line
              x1={56}
              x2={416}
              y1={218 - 280 * L}
              y2={218 - 280 * L}
              stroke="var(--color-border)"
              strokeWidth={L === 0 ? 1.4 : 1}
            />
            <text x={50} y={218 - 280 * L + 3.5} fontSize={9.5} textAnchor="end" fill="var(--color-muted-foreground)">
              {L === 0 ? "0" : L.toFixed(1).replace(".", ",")}
            </text>
          </g>
        ))}
        {/* Courbe L(n) = 3/(n+4) */}
        <polyline
          points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={COL_SKY}
          strokeWidth={2.2}
        />
        {pts.map(([x, y], k) => (
          <g key={k}>
            <circle cx={x} cy={y} r={k === 0 ? 4.5 : 3} fill={COL_SKY} />
            <text x={x} y={234} fontSize={9.5} textAnchor="middle" fill="var(--color-muted-foreground)">
              {k + 1}
            </text>
          </g>
        ))}
        {/* Repères pédagogiques */}
        <text x={68} y={44} fontSize={11} fontWeight={700} fill="var(--color-foreground)">
          monopole : L(1) = 3/5
        </text>
        <text x={108} y={74} fontSize={10.5} fill="var(--color-foreground)">
          duopole : L(2) = 1/2
        </text>
        <text x={416} y={207} fontSize={10} textAnchor="end" fill="var(--color-muted-foreground)">
          L → 0 : concurrence parfaite (p → Cm)
        </text>
        <text x={236} y={254} fontSize={11} textAnchor="middle" fill="var(--color-muted-foreground)">
          nombre de firmes n
        </text>
        <text
          x={16}
          y={130}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          transform="rotate(-90 16 130)"
        >
          indice de Lerner L(n)
        </text>
      </svg>
      <figcaption className="mt-1 text-sm text-muted-foreground">
        L'indice de Lerner d'équilibre <M tex="L(n) = \tfrac{3}{n+4}" /> fond à mesure que des
        firmes entrent : 3/5 en monopole, 1/2 en duopole, 1/3 à cinq firmes… et 0 à la limite —
        Cournot relie continûment le monopole à la concurrence parfaite.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Page de la résolution guidée                                        */
/* ================================================================== */

export default function ExamSolution() {
  return (
    <ExamSolutionShell examId="p2-blanc-3">
      {/* ============================================================ */}
      {/* Question 1 — Tarif en deux parties & double marginalisation   */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-3"
        id="q1"
        number={1}
        title="Question 1 — Tarif en deux parties et chaîne verticale (40 pts)"
        difficulty={3}
        refs={[
          { chapter: "ei3", section: "deux-parties" },
          { chapter: "ei3", section: "double-marge" },
        ]}
        statement={
          <>
            <p>
              <strong>Partie A — Le club de sport (tarification en deux parties).</strong>
            </p>
            <p>
              Le club de sport FormaFit est en monopole dans sa ville. Ses adhérents potentiels
              sont tous <strong>identiques</strong> : chacun a la demande individuelle de séances{" "}
              <M tex="p = 16 - y" />, où <M tex="y" /> est le nombre de séances suivies par mois
              et <M tex="p" /> le prix (en euros) qu'il est disposé à payer pour une séance.
              Chaque séance occasionne au club un coût marginal constant de <strong>4 €</strong>{" "}
              (aucun coût fixe). Le club applique une <strong>tarification en deux parties</strong>{" "}
              : un abonnement mensuel <M tex="F" /> (le forfait), puis un prix <M tex="p" /> par
              séance.
            </p>
            <SubQuestion label="1.1)">
              Détermine le tarif en deux parties optimal <M tex="(F^*,\, p^*)" />. Explique
              soigneusement pourquoi le prix par séance optimal est égal au coût marginal et
              pourquoi le forfait capte tout le surplus du consommateur, puis calcule{" "}
              <M tex="p^*" />, <M tex="F^*" /> et le profit que le club réalise sur chaque
              adhérent. (12 points)
            </SubQuestion>
            <SubQuestion label="1.2)">
              Suppose maintenant que le club ne puisse pas exiger d'abonnement : il doit fixer un{" "}
              <strong>prix uniforme</strong> par séance. Calcule le prix, le nombre de séances et
              le profit par adhérent, puis compare les deux régimes (profit du club, surplus de
              l'adhérent, efficacité de la quantité produite). (8 points)
            </SubQuestion>
            <p className="mt-4">
              <strong>Partie B — La brasserie et le caviste (chaîne verticale).</strong>
            </p>
            <p>
              Sur un autre marché, la brasserie Houblon d'Or (« Amont ») est l'unique productrice
              d'une bière artisanale, qu'elle produit à un coût marginal constant de{" "}
              <strong>8</strong>. Elle la vend au prix <M tex="p_{am}" />, qu'elle choisit, à un
              caviste indépendant, Le Comptoir (« Aval »), seul autorisé à la distribuer. Le
              caviste n'a aucun autre coût que l'achat des caisses à la brasserie et revend aux
              consommateurs finals au prix <M tex="p_{av}" />, qu'il choisit. La demande finale
              est <M tex="y = 20 - p_{av}" />, soit <M tex="p_{av} = 20 - y" /> (<M tex="y" /> en
              caisses). Le jeu est séquentiel : Amont fixe son prix, puis Aval fixe le sien, puis
              les consommateurs achètent.
            </p>
            <SubQuestion label="1.3)">
              Résous la chaîne par la fin : dérive d'abord la demande qu'Aval adresse à Amont,
              puis le choix d'Amont. Donne la quantité échangée, le prix amont <M tex="p_{am}" />,
              le prix final <M tex="p_{av}" />, la marge et le profit de chaque firme. Détaille
              ton raisonnement. (12 points)
            </SubQuestion>
            <SubQuestion label="1.4)">
              La brasserie rachète le caviste : les deux firmes forment désormais une seule
              structure intégrée. Calcule la quantité, le prix final et le profit du monopole
              intégré, puis compare avec la situation de la question 1.3 : qui gagne et qui perd
              à cette fusion ? Comment s'appelle le phénomène que cette comparaison met en
              évidence ? (8 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : deux histoires, deux méthodes du chapitre EI3",
            refs: [
              { chapter: "ei3", section: "deux-parties" },
              { chapter: "ei3", section: "double-marge" },
            ],
            content: (
              <>
                <p>
                  Cette question réunit <strong>les deux grands blocs du chapitre EI3</strong>{" "}
                  hors discrimination. Prends dix secondes pour repérer les indices avant de
                  foncer :
                </p>
                <ul>
                  <li>
                    <strong>Partie A</strong> : les mots « abonnement <M tex="F" /> + prix par
                    séance » désignent sans ambiguïté la{" "}
                    <strong>tarification en deux parties</strong>. L'hypothèse « adhérents tous{" "}
                    <em>identiques</em> » est cruciale : c'est elle qui permet au club de calibrer
                    un forfait qui capte <em>tout</em> le surplus de chacun sans en exclure aucun.
                  </li>
                  <li>
                    <strong>Partie B</strong> : « Amont choisit son prix, <em>puis</em> Aval
                    choisit le sien » — un monopole qui vend à un autre monopole, dans un jeu{" "}
                    <strong>séquentiel</strong>. C'est la configuration de la{" "}
                    <strong>double marginalisation</strong>, et un jeu séquentiel se résout
                    toujours <em>par la fin</em> (induction à rebours).
                  </li>
                </ul>
                <Callout variant="methode" title="Méthode — les deux recettes à dérouler">
                  <p>
                    <strong>Tarif en deux parties</strong> (consommateurs identiques), en deux
                    temps : ① pour un prix <M tex="p" /> donné, le forfait maximal acceptable est
                    tout le surplus du consommateur, <M tex="F = SC(p)" /> ; ② on choisit ensuite
                    le prix qui maximise « marge sur les unités + forfait », et la réponse est{" "}
                    <M tex="p^* = Cm" />.
                  </p>
                  <p>
                    <strong>Chaîne verticale</strong>, en deux temps aussi : ① CPO du maillon{" "}
                    <em>aval</em> → elle donne la <em>demande dérivée</em> que reçoit l'amont ;
                    ② CPO de l'<em>amont</em> sur cette demande dérivée. Jamais l'inverse !
                  </p>
                </Callout>
                <p>
                  Barème : 12 + 8 points pour la partie A, 12 + 8 points pour la partie B. Les
                  deux parties sont indépendantes — si l'une bloque, passe à l'autre.
                </p>
              </>
            ),
          },
          {
            title: "Poser la contrainte d'acceptation et le forfait maximal (1.1)",
            refs: [{ chapter: "ei3", section: "deux-parties" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi commencer par le forfait ?</strong> Le forfait <M tex="F" />{" "}
                  est payé <em>avant</em> de consommer : un adhérent ne s'abonne que si ce que le
                  club lui laisse comme surplus sur les séances vaut au moins le prix de
                  l'abonnement. Il faut donc d'abord chiffrer ce surplus, pour un prix par séance{" "}
                  <M tex="p" /> quelconque.
                </p>
                <p>
                  Au prix <M tex="p" />, l'adhérent choisit son nombre de séances le long de sa
                  demande :
                </p>
                <MB tex="p = 16 - y \;\Longleftrightarrow\; y(p) = 16 - p" />
                <p>
                  Son surplus (hors forfait) est le triangle entre sa courbe de demande et le prix
                  payé : base <M tex="16 - p" /> séances, hauteur <M tex="16 - p" /> euros (de{" "}
                  <M tex="p" /> jusqu'à la disposition à payer maximale 16) :
                </p>
                <MB tex="SC(p) = \tfrac{1}{2}\,\big(16 - p\big)\big(16 - p\big) = \tfrac{1}{2}\,(16-p)^2" />
                <p>
                  L'adhérent accepte de s'abonner tant que <M tex="SC(p) \ge F" />. Le club n'a
                  aucune raison de lui laisser un centime de plus que nécessaire : il{" "}
                  <strong>sature la contrainte d'acceptation</strong> et fixe
                </p>
                <MB tex="F = SC(p) = \tfrac{1}{2}\,(16-p)^2" />
                <p>
                  Interprétation : à ce stade, le prix <M tex="p" /> n'est pas encore choisi, mais
                  on sait déjà que <em>quel que soit</em> ce prix, le forfait raflera tout le
                  surplus — l'adhérent repartira avec un surplus net exactement nul (et accepte,
                  car refuser lui rapporte 0 aussi).
                </p>
                <Callout variant="attention">
                  <p>
                    Le piège le plus fréquent : calculer d'abord le prix de monopole simple
                    (10 €, cf. question 1.2), puis poser le forfait égal au surplus restant
                    (18 €). C'est un tarif en deux parties <em>possible</em>, mais pas{" "}
                    <em>optimal</em> : il rapporte 36 + 18 = 54 € au lieu de 72 €. Le forfait
                    doit être calculé <strong>en fonction de <M tex="p" /></strong>, et c'est
                    seulement ensuite qu'on optimise sur <M tex="p" /> — c'est tout l'objet de
                    l'étape suivante.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Justifier p* = Cm : l'argument du « gâteau », puis la dérivation (1.1)",
            refs: [{ chapter: "ei3", section: "deux-parties" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape ?</strong> L'énoncé exige d'« expliquer
                  soigneusement » pourquoi <M tex="p^* = Cm" /> : 5 des 12 points sont là. Donne
                  l'argument économique, et sécurise-le par le calcul.
                </p>
                <p>
                  <strong>L'argument économique.</strong> Avec <M tex="F = SC(p)" />, le profit
                  par adhérent s'écrit :
                </p>
                <MB tex="\Pi(p) = \underbrace{(p - 4)\,(16 - p)}_{\text{marge sur les séances}} \; + \; \underbrace{\tfrac{1}{2}\,(16-p)^2}_{\text{forfait } F} \; = \; SP + SC" />
                <p>
                  C'est la somme du surplus du producteur et du surplus du consommateur :
                  géométriquement, <strong>toute l'aire entre la demande et la droite de coût
                  marginal</strong> jusqu'à la quantité consommée — le « gâteau » total de
                  l'échange. Ce gâteau est maximal quand on consomme toutes les séances qui valent
                  plus qu'elles ne coûtent, c'est-à-dire jusqu'au point où la demande croise{" "}
                  <M tex="Cm = 4" />. Toute marge <M tex="p > 4" /> réduit le nombre de séances et
                  ampute le gâteau d'un triangle : ce que la marge rapporte sur les séances, le
                  forfait le perd — <em>et davantage</em>.
                </p>
                <p>
                  <strong>La vérification par le calcul.</strong> Dérivons <M tex="\Pi(p)" />{" "}
                  terme à terme. D'abord le forfait (règle de la fonction composée : on dérive le
                  carré, puis l'intérieur qui donne un facteur <M tex="-1" />) :
                </p>
                <MB tex="\frac{d}{dp}\left[\tfrac{1}{2}(16-p)^2\right] = \tfrac{1}{2}\times 2\,(16-p)\times(-1) = -(16-p)" />
                <p>Puis la marge sur les séances (règle du produit) :</p>
                <MB tex="\frac{d}{dp}\Big[(p-4)(16-p)\Big] = (16-p) + (p-4)\times(-1) = (16-p) - (p-4)" />
                <p>En additionnant, les deux termes en <M tex="(16-p)" /> s'annulent :</p>
                <MB tex="\frac{d\Pi}{dp} = -(16-p) + (16-p) - (p-4) = -(p-4)" />
                <p>
                  Cette dérivée est positive pour <M tex="p < 4" />, négative pour{" "}
                  <M tex="p > 4" /> : le profit est bien maximal en
                </p>
                <MB tex="p^* = 4 = Cm" />
                <p>
                  Interprétation : le club renonce à toute marge sur les séances (elle détruirait
                  du surplus) et se paie <em>entièrement</em> sur le forfait, qui capte un gâteau
                  rendu aussi grand que possible.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème officiel réserve 5 points à cette justification, « argument du
                    gâteau <M tex="SP + SC" /> <em>ou</em> dérivation ». Écrire{" "}
                    <M tex="p^* = 4" /> sans explication te coûte donc presque la moitié de la
                    sous-question. Le réflexe : une phrase d'intuition + la CPO — l'un sécurise
                    l'autre.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Calculer p*, F* et le profit par adhérent (1.1)",
            refs: [{ chapter: "ei3", section: "deux-parties" }],
            content: (
              <>
                <p>
                  <strong>Il ne reste qu'à chiffrer.</strong> Avec <M tex="p^* = 4" />,
                  l'adhérent consomme :
                </p>
                <MB tex="y^* = 16 - 4 = 12 \text{ séances}" />
                <p>
                  Le forfait optimal capte tout le surplus au prix <M tex="p^* = Cm" /> — le
                  triangle de base 12 et de hauteur <M tex="16 - 4 = 12" /> :
                </p>
                <MB tex="F^* = \tfrac{1}{2}\times(16 - 4)\times 12 = \tfrac{1}{2}\times 12\times 12 = 72 \text{ €}" />
                <p>
                  Sur les séances, la marge est nulle (<M tex="p^* = Cm = 4" />) : le profit par
                  adhérent se réduit au forfait :
                </p>
                <MB tex="\Pi = \underbrace{(4 - 4)\times 12}_{=\;0} + F^* = 72 \text{ € par adhérent}" />
                <FormulaBox
                  label="Résultat 1.1 — tarif en deux parties optimal"
                  tex="p^* = Cm = 4 \text{ €}, \qquad F^* = SC(4) = 72 \text{ €}, \qquad \Pi = 72 \text{ € par adhérent}"
                  caption={
                    <>
                      Recette générale (consommateurs identiques) : prix au coût marginal, forfait
                      égal à tout le surplus du consommateur évalué à ce prix.
                    </>
                  }
                />
                <TwoPartTariffFigure />
                <Callout variant="intuition">
                  <p>
                    Note le paradoxe apparent : la quantité (12 séances) est{" "}
                    <strong>socialement optimale</strong> — exactement celle qu'une tarification
                    au coût marginal produirait en concurrence. Le tarif en deux parties est donc{" "}
                    <em>efficace</em>… mais toute l'efficacité est <em>confisquée</em> par le
                    monopole : le surplus net de l'adhérent est nul. Efficacité et équité sont
                    deux questions distinctes — garde cette distinction pour la comparaison de la
                    question 1.2.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Résoudre le prix uniforme et comparer les deux régimes (1.2)",
            refs: [
              { chapter: "ei3", section: "fil-conducteur" },
              { chapter: "ei1", section: "maximisation" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi la méthode change :</strong> sans forfait, le club redevient
                  un <strong>monopole simple</strong> qui ne gagne de l'argent que sur la marge
                  par séance. On retombe sur la mécanique du chapitre EI1 : recette totale,
                  recette marginale, puis <M tex="Rm = Cm" />.
                </p>
                <MB tex="RT = p\,y = (16 - y)\,y \qquad\Longrightarrow\qquad Rm = 16 - 2y" />
                <p>
                  (Réflexe des demandes linéaires : la recette marginale a la même ordonnée à
                  l'origine que la demande et une <strong>pente double</strong>.) L'optimum :
                </p>
                <MB tex="Rm = Cm \;\Longleftrightarrow\; 16 - 2y = 4 \;\Longleftrightarrow\; 2y = 12 \;\Longleftrightarrow\; y^u = 6" />
                <p>On remonte le long de la demande pour le prix, puis on calcule le profit :</p>
                <MB tex="p^u = 16 - 6 = 10 \text{ €} \qquad\qquad \Pi^u = (10 - 4)\times 6 = 36 \text{ €}" />
                <p>
                  <strong>Comparons maintenant les deux régimes</strong>, poste par poste. Le
                  surplus de l'adhérent au prix uniforme est le triangle au-dessus de 10 € :
                </p>
                <MB tex="SC^u = \tfrac{1}{2}\times(16 - 10)\times 6 = \tfrac{1}{2}\times 6\times 6 = 18 \text{ €}" />
                <p>
                  Et la perte sèche du prix uniforme est le triangle des séances 6 à 12, qui
                  valaient plus que leur coût mais ne sont pas produites :
                </p>
                <MB tex="PS = \tfrac{1}{2}\times(10 - 4)\times(12 - 6) = \tfrac{1}{2}\times 6\times 6 = 18 \text{ €}" />
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Par adhérent</th>
                        <th className={THc}>Deux parties (1.1)</th>
                        <th className={THc}>Prix uniforme (1.2)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Prix par séance", "4 €", "10 €"],
                        ["Séances consommées", "12", "6"],
                        ["Profit du club", "72 €", "36 €"],
                        ["Surplus de l'adhérent", "0 €", "18 €"],
                        ["Perte sèche", "0 €", "18 €"],
                        ["Surplus total", "72 €", "54 €"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>
                            <strong>{row[1]}</strong>
                          </td>
                          <td className={TDc}>{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Lecture : le forfait <strong>double le profit</strong> (72 contre 36) et rend la
                  quantité <strong>efficace</strong> (12 séances, surplus total maximal de 72 €,
                  contre 54 € = 36 + 18 avec 18 € de perte sèche au prix uniforme). Mais
                  l'adhérent, lui, <strong>préfère nettement le prix uniforme</strong> : 18 € de
                  surplus contre 0.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux dérapages classiques ici. (i) Écrire <M tex="p = Cm" /> pour le monopole
                    simple : non, ça c'est la concurrence parfaite (ou… le tarif en deux parties !)
                    — le monopole simple pose <M tex="Rm = Cm" />. (ii) Conclure que le tarif en
                    deux parties est « mauvais » parce que le consommateur y perd : l'énoncé
                    demande de comparer <em>trois</em> choses (profit, surplus, efficacité) — et
                    les réponses ne vont pas dans le même sens. C'est précisément ce contraste que
                    le correcteur veut lire.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Dériver la demande qu'Aval adresse à Amont (1.3)",
            refs: [{ chapter: "ei3", section: "double-marge" }],
            content: (
              <>
                <p>
                  <strong>Changement de décor — et de méthode.</strong> Le jeu est séquentiel
                  (Amont joue, puis Aval) : on résout <strong>par la fin</strong>. La dernière
                  décision est celle du caviste, donc on commence par lui, en traitant le prix
                  amont <M tex="p_{am}" /> comme une donnée.
                </p>
                <p>
                  Le caviste achète <M tex="y" /> caisses à <M tex="p_{am}" /> l'une et les revend
                  aux consommateurs au prix que la demande finale accepte, soit{" "}
                  <M tex="p_{av} = 20 - y" /> :
                </p>
                <MB tex="\Pi_{av} = \underbrace{(20 - y)\,y}_{\text{recette de revente}} - \underbrace{p_{am}\,y}_{\text{coût d'achat}}" />
                <p>
                  Condition de premier ordre — on dérive par rapport à <M tex="y" /> (le terme{" "}
                  <M tex="(20-y)y = 20y - y^2" /> donne <M tex="20 - 2y" />) :
                </p>
                <MB tex="\frac{d\Pi_{av}}{dy} = 20 - 2y - p_{am} = 0 \;\Longleftrightarrow\; p_{am} = 20 - 2y" />
                <p>
                  <strong>Comment lire ce résultat ?</strong> Cette relation lie le prix demandé
                  par la brasserie à la quantité que le caviste acceptera de commander : c'est la{" "}
                  <strong>demande dérivée</strong> qu'Aval adresse à Amont. Plus la brasserie vend
                  cher, moins le caviste commande — et remarque sa <strong>pente double</strong>{" "}
                  (−2) par rapport à la demande finale (−1) : le caviste « filtre » la demande des
                  consommateurs en y ajoutant son propre comportement de marge.
                </p>
                <Callout variant="methode">
                  <p>
                    Retiens le schéma en deux CPO : la CPO du maillon aval, réarrangée en{" "}
                    <M tex="p_{am} = f(y)" />, <em>devient la courbe de demande</em> du maillon
                    amont. La structure est exactement celle d'un Stackelberg : le suiveur se
                    résout d'abord, et sa réaction devient la contrainte du meneur.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Remonter à Amont et chiffrer prix, marges et profits (1.3)",
            refs: [
              { chapter: "ei3", section: "double-marge" },
              { chapter: "ei1", section: "maximisation" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi ce second programme ?</strong> La brasserie anticipe
                  parfaitement la réaction du caviste : elle sait qu'en fixant son prix, elle
                  choisit en réalité un point sur la demande dérivée{" "}
                  <M tex="p_{am} = 20 - 2y" />. Elle margine dessus avec son coût marginal de 8 :
                </p>
                <MB tex="\Pi_{am} = (20 - 2y)\,y - 8y = 20y - 2y^2 - 8y" />
                <p>Condition de premier ordre :</p>
                <MB tex="\frac{d\Pi_{am}}{dy} = 20 - 4y - 8 = 0 \;\Longleftrightarrow\; 4y = 12 \;\Longleftrightarrow\; y^* = 3 \text{ caisses}" />
                <p>
                  On remonte maintenant toute la chaîne pour les prix — d'abord le prix amont sur
                  la demande dérivée, puis le prix final sur la demande des consommateurs :
                </p>
                <MB tex="p_{am} = 20 - 2\times 3 = 14 \qquad\qquad p_{av} = 20 - 3 = 17" />
                <p>Marges et profits de chaque maillon :</p>
                <MB tex="\Pi_{am} = (14 - 8)\times 3 = 18 \qquad \Pi_{av} = (17 - 14)\times 3 = 9 \qquad \Pi_{am} + \Pi_{av} = 27" />
                <p>
                  Interprétation : la brasserie prend une marge de <M tex="14 - 8 = 6" />, puis le
                  caviste ajoute la sienne, <M tex="17 - 14 = 3" />. <strong>Deux marges
                  s'empilent</strong> le long de la chaîne, chacune gonflant le prix payé en bout
                  de course — 17, très loin du coût de production 8.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème est explicite : « résoudre dans le mauvais ordre (Amont sans
                    anticiper Aval) : maximum 4 pts » sur 12. L'ordre de résolution{" "}
                    <em>est</em> la réponse. Annonce-le dès la première ligne de ta copie
                    (« jeu séquentiel → induction à rebours, je commence par Aval ») : c'est un
                    signal immédiat pour le correcteur.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Intégrer la chaîne, comparer et nommer la double marginalisation (1.4)",
            refs: [{ chapter: "ei3", section: "double-marge" }],
            content: (
              <>
                <p>
                  <strong>Que change la fusion ?</strong> La structure intégrée vend directement
                  aux consommateurs, au vrai coût marginal 8 — le prix de transfert interne
                  disparaît. C'est un monopole ordinaire sur la demande finale :
                </p>
                <MB tex="\Pi = (20 - y)\,y - 8y \qquad\Longrightarrow\qquad \frac{d\Pi}{dy} = 20 - 2y - 8 = 0 \;\Longleftrightarrow\; y = 6" />
                <MB tex="p = 20 - 6 = 14 \qquad\qquad \Pi = (14 - 8)\times 6 = 36" />
                <p>
                  <strong>Comparaison avec la chaîne séparée</strong> (question 1.3) :
                </p>
                <ul>
                  <li>
                    les <strong>consommateurs gagnent</strong> : le prix final baisse de 17 à 14
                    et la quantité double (6 caisses contre 3) ;
                  </li>
                  <li>
                    les <strong>firmes gagnent</strong> : le profit joint passe de{" "}
                    <M tex="18 + 9 = 27" /> à 36.
                  </li>
                </ul>
                <p>
                  Personne n'y perd : la fusion est une{" "}
                  <strong>amélioration parétienne</strong>. Le phénomène s'appelle la{" "}
                  <strong>double marginalisation</strong> : chaque maillon marginait sur son
                  propre coût sans internaliser le tort que sa marge causait à l'autre (quand
                  Amont montait son prix, il écrasait la demande — et le profit — d'Aval).
                  L'intégration verticale supprime l'une des deux marges : on ne margine plus
                  qu'une fois, sur le vrai coût.
                </p>
                <VerticalChainFigure />
                <Callout variant="intuition" title="Intuition — deux monopoles, c'est pire qu'un">
                  <p>
                    « Deux monopoles successifs font pire qu'un seul » : chaque marge est une
                    externalité négative sur l'autre maillon. C'est pourquoi les autorités de la
                    concurrence traitent différemment les fusions <em>verticales</em> (souvent
                    favorables aux consommateurs, comme ici) et les fusions{" "}
                    <em>horizontales</em> entre concurrents directs (qui rapprochent du monopole
                    et font monter les prix). Cite cette distinction en conclusion : c'est
                    l'ouverture qui vaut les derniers points.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> — <M tex="p^* = 4" /> € (= <M tex="Cm" />),{" "}
              <M tex="F^* = 72" /> €, profit de <strong>72 € par adhérent</strong> (quantité
              efficace de 12 séances, surplus net de l'adhérent nul).
              <br />
              <strong>1.2</strong> — Prix uniforme : <M tex="p^u = 10" /> €, <M tex="y^u = 6" />{" "}
              séances, <M tex="\Pi^u = 36" /> € ; surplus de l'adhérent 18 €, perte sèche 18 €.
              Le forfait double le profit et rétablit l'efficacité, mais confisque tout le
              surplus.
              <br />
              <strong>1.3</strong> — Demande dérivée <M tex="p_{am} = 20 - 2y" /> ;{" "}
              <M tex="y^* = 3" /> caisses, <M tex="p_{am} = 14" />, <M tex="p_{av} = 17" /> ;
              marges 6 et 3 ; profits <M tex="\Pi_{am} = 18" />, <M tex="\Pi_{av} = 9" /> (total
              27).
              <br />
              <strong>1.4</strong> — Monopole intégré : <M tex="y = 6" />, <M tex="p = 14" />,{" "}
              <M tex="\Pi = 36" />. Consommateurs et firmes y gagnent : amélioration parétienne.
              Le phénomène : la <strong>double marginalisation</strong>.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> deux réflexes de méthode — « prix au coût marginal +
              forfait = tout le surplus » pour le tarif en deux parties, et « induction à
              rebours : la CPO d'Aval devient la demande d'Amont » pour la chaîne verticale.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 3, exercise: "ex1" },
                { session: 1, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 2 — Bertrand avec biens différenciés                 */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-3"
        id="q2"
        number={2}
        title="Question 2 — Concurrence en prix avec biens différenciés (35 pts)"
        difficulty={2}
        refs={[
          { chapter: "ei2", section: "differencies" },
          { chapter: "ei2", section: "bertrand" },
        ]}
        statement={
          <>
            <p>
              Deux torréfacteurs, Arabica (firme 1) et Robusta (firme 2), vendent des cafés
              légèrement différents et se font une concurrence <strong>en prix</strong>. Les
              demandes qui leur sont adressées sont :
            </p>
            <MB tex="q_1 = 30 - p_1 + \tfrac{1}{2}\,p_2 \qquad \text{et} \qquad q_2 = 30 - p_2 + \tfrac{1}{2}\,p_1" />
            <p>
              Chaque firme produit à un coût marginal constant de <strong>6</strong>, sans coût
              fixe. Les deux firmes choisissent leur prix simultanément.
            </p>
            <SubQuestion label="2.1)">
              Que mesure le coefficient <M tex="\tfrac{1}{2}" /> qui apparaît devant le prix du
              concurrent dans chaque fonction de demande ? Que signifierait une valeur de ce
              coefficient proche de 0 ? Une valeur plus élevée (proche de 1) ? Explique
              brièvement. (5 points)
            </SubQuestion>
            <SubQuestion label="2.2)">
              En explicitant les étapes de ton raisonnement (fonction de profit, condition de
              premier ordre), obtiens les fonctions de meilleure réponse en prix des deux firmes.
              Ces fonctions sont-elles croissantes ou décroissantes dans le prix du rival ?
              Commente. (12 points)
            </SubQuestion>
            <SubQuestion label="2.3)">
              Calcule l'équilibre de Nash en prix : prix, quantités et profits d'équilibre de
              chaque firme. (10 points)
            </SubQuestion>
            <SubQuestion label="2.4)">
              À l'équilibre, les prix sont-ils supérieurs au coût marginal ? Compare avec le
              duopole de Bertrand en <strong>bien homogène</strong> et explique précisément d'où
              vient la différence. (8 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : concurrence en prix + biens différenciés",
            refs: [{ chapter: "ei2", section: "differencies" }],
            content: (
              <>
                <p>
                  Trois indices déterminent la méthode, et ils sont tous dans les trois premières
                  lignes de l'énoncé :
                </p>
                <ul>
                  <li>
                    « concurrence <strong>en prix</strong> » → la variable stratégique est{" "}
                    <M tex="p_i" />, pas la quantité : on est chez <strong>Bertrand</strong>, pas
                    chez Cournot ;
                  </li>
                  <li>
                    « cafés <strong>légèrement différents</strong> », et surtout des demandes où{" "}
                    <M tex="q_1" /> dépend <em>des deux</em> prix → biens{" "}
                    <strong>différenciés</strong> : chaque firme garde des clients même si elle
                    est plus chère que l'autre ;
                  </li>
                  <li>
                    « choix <strong>simultané</strong> » → le concept de solution est
                    l'<strong>équilibre de Nash</strong> : chaque prix doit être une meilleure
                    réponse au prix de l'autre.
                  </li>
                </ul>
                <p>
                  Le plan de résolution s'écrit tout seul : interpréter le paramètre croisé
                  (2.1), poser profit et CPO pour obtenir les meilleures réponses (2.2), les
                  croiser pour l'équilibre (2.3), puis comparer au cas homogène (2.4).
                </p>
                <Callout variant="methode">
                  <p>
                    La check-list « duopole en prix différenciés » : ① profit{" "}
                    <M tex="\Pi_i = (p_i - Cm)\,q_i(p_i, p_j)" /> ; ② CPO en traitant le prix du
                    rival comme donné ; ③ réarranger en <M tex="p_i = f(p_j)" /> (meilleure
                    réponse) ; ④ symétrie ou substitution pour l'équilibre de Nash ; ⑤ retour aux
                    quantités et aux profits. Exactement la même ossature que Cournot — seule la
                    variable change.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Interpréter le coefficient 1/2 : le degré de substituabilité (2.1)",
            refs: [{ chapter: "ei2", section: "differencies" }],
            content: (
              <>
                <p>
                  <strong>Ce que dit le signe.</strong> Dans <M tex="q_1 = 30 - p_1 + \tfrac{1}{2}\,p_2" />,
                  la demande adressée à Arabica <em>augmente</em> quand Robusta devient plus
                  cher : une partie des clients de Robusta bascule chez Arabica. Les deux cafés
                  sont donc des <strong>substituts</strong>.
                </p>
                <p>
                  <strong>Ce que dit la taille.</strong> Le coefficient <M tex="\tfrac{1}{2}" />{" "}
                  mesure le <strong>degré de substituabilité</strong> entre les deux cafés —
                  autrement dit l'<em>inverse</em> de leur degré de différenciation : combien de
                  clients migrent quand l'écart de prix se creuse d'un euro.
                </p>
                <ul>
                  <li>
                    <strong>Proche de 0</strong> : les produits sont fortement différenciés,
                    chaque demande devient quasi insensible au prix de l'autre — deux{" "}
                    <em>monopoles indépendants</em>, chacun tranquille sur sa clientèle.
                  </li>
                  <li>
                    <strong>Proche de 1</strong> : les cafés se ressemblent, les clients basculent
                    massivement au moindre écart — la concurrence en prix s'intensifie et on se
                    rapproche du <em>bien homogène</em> (le Bertrand classique de la question
                    2.4).
                  </li>
                </ul>
                <Callout variant="intuition">
                  <p>
                    Vois ce coefficient comme un <strong>curseur entre deux mondes</strong> : à
                    gauche (0) le confort du monopole, à droite (1) la guerre des prix du Bertrand
                    homogène. Tout le chapitre « biens différenciés » tient dans ce curseur — et
                    la question 2.4 te demandera justement ce qui se passe à l'extrémité droite.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Poser le profit de la firme 1 et sa condition de premier ordre (2.2)",
            refs: [{ chapter: "ei2", section: "differencies" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi partir du profit ?</strong> Une « meilleure réponse » est la
                  solution d'un problème de maximisation : il faut donc écrire ce que la firme 1
                  maximise. Avec un coût marginal de 6 et aucun coût fixe, chaque unité vendue
                  rapporte la marge <M tex="p_1 - 6" /> :
                </p>
                <MB tex="\Pi_1 = (p_1 - 6)\,q_1 = (p_1 - 6)\left(30 - p_1 + \tfrac{1}{2}\,p_2\right)" />
                <p>
                  La firme 1 choisit <M tex="p_1" /> en prenant <M tex="p_2" />{" "}
                  <strong>comme donné</strong> (choix simultanés : elle ne peut pas influencer le
                  prix du rival). Développons pour dériver sans erreur :
                </p>
                <MB tex="\Pi_1 = 30\,p_1 - p_1^2 + \tfrac{1}{2}\,p_1 p_2 \;-\; 180 + 6\,p_1 - 3\,p_2" />
                <p>
                  On dérive par rapport à <M tex="p_1" /> seulement — terme à terme :{" "}
                  <M tex="30p_1 \to 30" />, <M tex="-p_1^2 \to -2p_1" />,{" "}
                  <M tex="\tfrac{1}{2}p_1p_2 \to \tfrac{1}{2}p_2" />, <M tex="6p_1 \to 6" />, et
                  les termes sans <M tex="p_1" /> disparaissent :
                </p>
                <MB tex="\frac{\partial \Pi_1}{\partial p_1} = 30 - 2p_1 + \tfrac{1}{2}\,p_2 + 6 = 36 - 2p_1 + \tfrac{1}{2}\,p_2 = 0" />
                <p>On isole <M tex="p_1" /> :</p>
                <MB tex="2p_1 = 36 + \tfrac{1}{2}\,p_2 \;\Longleftrightarrow\; p_1 = 18 + \tfrac{1}{4}\,p_2" />
                <p>
                  C'est la <strong>fonction de meilleure réponse</strong> d'Arabica : pour chaque
                  prix affiché par Robusta, elle donne le prix qui maximise le profit d'Arabica.
                </p>
                <Callout variant="attention">
                  <p>
                    Erreur éliminatoire : imposer la symétrie <M tex="p_1 = p_2" />{" "}
                    <em>avant</em> de dériver. Tu maximiserais alors le profit d'une firme qui
                    contrôlerait <em>les deux</em> prix — c'est le programme du cartel, pas celui
                    de la concurrence. La règle absolue : d'abord la CPO à <M tex="p_2" /> fixé,{" "}
                    <em>ensuite</em> seulement la symétrie.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Écrire la seconde meilleure réponse et lire leurs pentes (2.2)",
            refs: [
              { chapter: "ei2", section: "differencies" },
              { chapter: "ei2", section: "cournot" },
            ],
            content: (
              <>
                <p>
                  <strong>Par symétrie parfaite du problème</strong> (mêmes demandes à indices
                  échangés, même coût), la meilleure réponse de Robusta s'obtient en permutant les
                  indices :
                </p>
                <MB tex="p_2 = 18 + \tfrac{1}{4}\,p_1" />
                <FormulaBox
                  label="Résultat 2.2 — meilleures réponses en prix"
                  tex="p_1 = 18 + \tfrac{1}{4}\,p_2 \qquad\qquad p_2 = 18 + \tfrac{1}{4}\,p_1"
                  caption={
                    <>
                      Pente <M tex="+\tfrac{1}{4}" /> : chaque firme répond à une hausse du rival
                      par une hausse (plus douce) de son propre prix.
                    </>
                  }
                />
                <p>
                  Ces fonctions sont <strong>croissantes</strong> dans le prix du rival (pente{" "}
                  <M tex="\tfrac{1}{4} > 0" />) : si mon concurrent monte son prix, une partie de
                  ses clients me revient, ma demande se tend, et ma meilleure réponse est de
                  monter <em>aussi</em> mon prix (mais quatre fois moins). On dit que les prix
                  sont des <strong>compléments stratégiques</strong>.
                </p>
                <PriceReactionFigure />
                <Callout variant="intuition" title="Intuition — le contraste avec Cournot">
                  <p>
                    C'est l'exact inverse de Cournot : en quantités, les meilleures réponses sont{" "}
                    <em>décroissantes</em> (si le rival produit plus, je produis moins —
                    <strong>substituts stratégiques</strong>) ; en prix différenciés, elles sont{" "}
                    <em>croissantes</em> (si le rival augmente, j'augmente). Ce commentaire de
                    deux lignes vaut 2 points au barème — et il montre que tu vois la structure
                    des deux modèles, pas seulement leurs calculs.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Résoudre l'équilibre de Nash : prix, quantités, profits (2.3)",
            refs: [{ chapter: "ei2", section: "differencies" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi croiser les deux fonctions ?</strong> À l'équilibre de Nash,
                  chaque prix est une meilleure réponse à l'autre — les deux relations doivent
                  être vraies <em>en même temps</em>. Le problème étant symétrique, on cherche
                  l'équilibre symétrique <M tex="p_1 = p_2 = p" /> :
                </p>
                <MB tex="p = 18 + \tfrac{1}{4}\,p \;\Longleftrightarrow\; p - \tfrac{1}{4}\,p = 18 \;\Longleftrightarrow\; \tfrac{3}{4}\,p = 18 \;\Longleftrightarrow\; p_1^* = p_2^* = 24" />
                <p>
                  On revient aux <strong>quantités</strong> en réinjectant dans la demande :
                </p>
                <MB tex="q_1^* = q_2^* = 30 - 24 + \tfrac{1}{2}\times 24 = 30 - 24 + 12 = 18 > 0" />
                <p>Puis aux <strong>profits</strong> (marge × quantité) :</p>
                <MB tex="\Pi_1^* = \Pi_2^* = (24 - 6)\times 18 = 18\times 18 = 324" />
                <p>
                  <strong>Vérification</strong> (30 secondes qui rapportent) : la meilleure
                  réponse à 24 est bien
                </p>
                <MB tex="18 + \tfrac{24}{4} = 18 + 6 = 24 \;\checkmark" />
                <p>
                  et les quantités d'équilibre sont positives — le modèle est cohérent.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème le dit noir sur blanc : « la vérification n'est pas exigée mais
                    rattrape une erreur de calcul signalée ». Autrement dit : si tes nombres sont
                    faux mais que tu écris « je vérifie : ma meilleure réponse à mon prix
                    d'équilibre devrait redonner ce prix, or je trouve autre chose, il y a une
                    erreur quelque part », tu limites les dégâts. Prends l'habitude de boucler la
                    boucle.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Comparer avec le Bertrand homogène : pourquoi la marge survit (2.4)",
            refs: [
              { chapter: "ei2", section: "bertrand" },
              { chapter: "ei2", section: "differencies" },
            ],
            content: (
              <>
                <p>
                  <strong>Le constat d'abord :</strong> oui, à l'équilibre les prix dépassent
                  largement le coût marginal — <M tex="p^* = 24 > 6 = Cm" />, soit une marge de
                  18 par unité et un profit strictement positif de 324 pour chaque firme.
                </p>
                <p>
                  <strong>Le point de comparaison ensuite.</strong> En Bertrand{" "}
                  <strong>homogène</strong>, l'équilibre est <M tex="p_1^* = p_2^* = Cm" /> et
                  les profits sont <em>nuls</em> — le « paradoxe de Bertrand » : deux firmes
                  suffisent pour retrouver le prix concurrentiel. Le mécanisme : toute firme
                  affichant un prix supérieur à celui du rival perd <em>tous</em> ses clients
                  d'un coup, donc chacune a intérêt à sous-enchérir d'un centime, et cette
                  surenchère à la baisse ne s'arrête qu'au coût marginal.
                </p>
                <p>
                  <strong>D'où vient la différence ?</strong> Avec des biens différenciés, ce
                  mécanisme se grippe des deux côtés : baisser légèrement son prix ne{" "}
                  <em>vole plus toute</em> la clientèle du rival (seule une fraction{" "}
                  <M tex="\tfrac{1}{2}" /> par euro d'écart bascule), et être un peu plus cher ne
                  fait plus fuir tous ses propres clients — chaque firme conserve une{" "}
                  <strong>clientèle fidèle</strong> sur laquelle elle détient un pouvoir de
                  monopole partiel. La sous-enchère devient coûteuse et s'arrête bien avant le
                  coût marginal.
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[24rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Duopole en prix</th>
                        <th className={THc}>Bien homogène</th>
                        <th className={THc}>Biens différenciés (ici)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Prix d'équilibre", "p = Cm = 6", "p* = 24"],
                        ["Marge unitaire", "0", "18"],
                        ["Profit par firme", "0", "324"],
                        ["Mécanisme", "sous-enchère totale", "clientèle fidèle"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>{row[1]}</td>
                          <td className={TDc}>
                            <strong>{row[2]}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Callout variant="retiens">
                  <p>
                    La leçon stratégique à énoncer en conclusion :{" "}
                    <strong>la différenciation est un rempart contre la guerre des prix</strong>.
                    C'est pour cela que les firmes investissent tant en image de marque, design,
                    localisation, goût : moins leurs produits sont comparables, plus leurs marges
                    résistent à la concurrence en prix.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1</strong> — Le coefficient <M tex="\tfrac{1}{2}" /> mesure le degré de
              substituabilité des deux cafés (proche de 0 : quasi-monopoles indépendants ; proche
              de 1 : quasi-homogène, concurrence intense).
              <br />
              <strong>2.2</strong> — Meilleures réponses <M tex="p_1 = 18 + \tfrac{1}{4}p_2" />{" "}
              et <M tex="p_2 = 18 + \tfrac{1}{4}p_1" /> : <strong>croissantes</strong> dans le
              prix du rival (compléments stratégiques, à l'inverse de Cournot).
              <br />
              <strong>2.3</strong> — Équilibre de Nash : <M tex="p_1^* = p_2^* = 24" />,{" "}
              <M tex="q_1^* = q_2^* = 18" />, <M tex="\Pi_1^* = \Pi_2^* = 324" />.
              <br />
              <strong>2.4</strong> — <M tex="p^* = 24 > Cm = 6" /> : contrairement au Bertrand
              homogène (<M tex="p = Cm" />, profits nuls), la différenciation rend la
              sous-enchère non rentable et préserve les marges.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> même ossature que Cournot (profit → CPO → meilleures
              réponses → Nash), mais en prix ; et un message économique : plus les biens sont
              différenciés, plus les prix d'équilibre s'éloignent du coût marginal.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                {
                  session: 2,
                  exercise: "ex1",
                  label: "meilleures réponses et équilibre de Nash",
                },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 3 — Indice de Lerner & Cournot à n firmes            */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-3"
        id="q3"
        number={3}
        title="Question 3 — L'indice de Lerner en oligopole (25 pts)"
        difficulty={2}
        refs={[
          { chapter: "ei1", section: "pouvoir" },
          { chapter: "ei2", section: "cournot" },
          { chapter: "ei2", section: "nombre-firmes" },
        ]}
        statement={
          <>
            <SubQuestion label="3.1)">
              Définis l'indice de Lerner d'une firme individuelle et interprète-le : quelles
              indications nous donne-t-il, du point de vue de la firme et du point de vue de la
              société tout entière ? (8 points)
            </SubQuestion>
            <p>
              Considère maintenant un marché où la demande inverse est <M tex="p = 40 - Y" />,
              avec <M tex="Y = y_1 + y_2 + \dots + y_n" /> la quantité totale offerte par{" "}
              <M tex="n" /> firmes identiques. Chaque firme a un coût marginal constant de{" "}
              <strong>10</strong> et aucun coût fixe. Les firmes se font une concurrence à la
              Cournot (choix simultané des quantités).
            </p>
            <SubQuestion label="3.2)">
              Dérive l'équilibre de Cournot symétrique à <M tex="n" /> firmes : quantité
              individuelle <M tex="y_i(n)" />, quantité totale, prix d'équilibre{" "}
              <M tex="p(n)" />, puis l'indice de Lerner <M tex="L(n)" /> d'une firme à cet
              équilibre. Que devient la marge des firmes lorsque <M tex="n" /> augmente ?
              Détaille ton raisonnement. (12 points)
            </SubQuestion>
            <SubQuestion label="3.3)">
              Que vaut <M tex="L(n)" /> lorsque <M tex="n = 1" /> ? Et lorsque{" "}
              <M tex="n \to \infty" /> ? Interprète ces deux cas limites. (5 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé : une question de cours, puis un Cournot généralisé",
            refs: [
              { chapter: "ei1", section: "pouvoir" },
              { chapter: "ei2", section: "cournot" },
            ],
            content: (
              <>
                <p>
                  Cette question a une structure en entonnoir, très classique en examen :
                </p>
                <ul>
                  <li>
                    <strong>3.1</strong> est une pure <strong>question de cours</strong> (chapitre
                    EI1, « mesurer le pouvoir de marché ») : définition + interprétation à deux
                    niveaux. Aucun calcul — mais 8 points, à aller chercher avec du vocabulaire
                    précis.
                  </li>
                  <li>
                    <strong>3.2</strong> demande de refaire l'équilibre de Cournot, mais avec{" "}
                    <M tex="n" /> firmes au lieu de 2 : mêmes réflexes (profit de la firme{" "}
                    <M tex="i" />, CPO, puis symétrie), avec une lettre en plus dans les calculs.
                    Les indices : « firmes identiques », « choix simultané des quantités »,
                    « équilibre symétrique ».
                  </li>
                  <li>
                    <strong>3.3</strong> récompense la <strong>lecture économique</strong> du
                    résultat : les cas <M tex="n = 1" /> et <M tex="n \to \infty" /> doivent te
                    rappeler deux chapitres entiers du cours.
                  </li>
                </ul>
                <Callout variant="methode">
                  <p>
                    Quand un énoncé introduit un paramètre littéral (<M tex="n" /> ici), garde-le
                    jusqu'au bout <em>sans</em> lui donner de valeur, puis teste tes formules sur
                    des cas connus : <M tex="n = 1" /> doit redonner le monopole,{" "}
                    <M tex="n = 2" /> le duopole de Cournot du cours. Si l'un des deux cloche, il
                    y a une erreur en amont — c'est ton détecteur d'erreurs intégré.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Définir l'indice de Lerner et l'interpréter des deux points de vue (3.1)",
            refs: [
              { chapter: "ei1", section: "pouvoir" },
              { chapter: "ei1", section: "inefficacite" },
            ],
            content: (
              <>
                <p>
                  <strong>La définition</strong> — l'indice de Lerner d'une firme est sa{" "}
                  <strong>marge relative</strong> :
                </p>
                <FormulaBox
                  label="Définition — indice de Lerner"
                  tex="L = \frac{p - Cm}{p}"
                  caption={
                    <>
                      La fraction du prix qui est de la marge pure, comprise entre 0 et 1. Bien
                      diviser par <M tex="p" /> (et non par <M tex="Cm" />) : c'est ce qui rend
                      l'indice comparable entre secteurs.
                    </>
                  }
                />
                <p>
                  <strong>Du point de vue de la firme</strong>, c'est la mesure classique du{" "}
                  <strong>pouvoir de marché</strong> : sa capacité à élever son prix au-dessus de
                  son coût marginal. <M tex="L = 0" /> en concurrence parfaite (la firme subit le
                  prix : <M tex="p = Cm" />), <M tex="L" /> proche de 1 pour un pouvoir de marché
                  maximal. Pour un monopole, le cours établit la relation{" "}
                  <M tex="L = 1/\varepsilon" /> : plus la demande est rigide (inélastique), plus
                  la firme peut marginer. Et parce que c'est une marge <em>relative</em>,
                  l'indice permet de comparer une boulangerie et un constructeur aéronautique.
                </p>
                <p>
                  <strong>Du point de vue de la société</strong>, il mesure l'écart à la
                  référence efficace <M tex="p = Cm" /> : plus <M tex="L" /> est élevé, plus le
                  prix s'écarte du coût marginal, plus la quantité échangée est restreinte par
                  rapport à l'optimum social — et plus la <strong>perte sèche</strong> est
                  importante. Un Lerner élevé signale une mauvaise allocation des ressources :
                  c'est à ce titre qu'il intéresse les autorités de la concurrence.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème découpe : 3 pts la définition exacte, 2,5 pts le point de vue de la
                    firme, 2,5 pts le point de vue de la société. Beaucoup de copies ne donnent
                    que la moitié « firme » et laissent 2,5 pts sur la table. Structure ta
                    réponse en deux paragraphes explicitement titrés « pour la firme » / « pour
                    la société » : le correcteur coche, tu encaisses.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Poser le profit de la firme i et sa condition de premier ordre (3.2)",
            refs: [{ chapter: "ei2", section: "cournot" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi raisonner sur une firme <M tex="i" /> générique ?</strong>{" "}
                  Avec <M tex="n" /> firmes, impossible d'écrire <M tex="n" /> programmes : on
                  écrit celui d'une firme quelconque <M tex="i" />, en traitant les quantités des{" "}
                  <M tex="n - 1" /> rivales comme données (c'est l'hypothèse de Cournot). Le prix
                  dépend de la quantité totale <M tex="Y = y_i + \sum_{j \neq i} y_j" /> :
                </p>
                <MB tex="\Pi_i = \Big(40 - y_i - \textstyle\sum_{j \neq i} y_j\Big)\,y_i \;-\; 10\,y_i" />
                <p>
                  On dérive par rapport à <M tex="y_i" /> uniquement. Le terme de recette{" "}
                  <M tex="\big(40 - y_i - \sum_{j\neq i} y_j\big)y_i" /> contient{" "}
                  <M tex="y_i" /> deux fois (dans le prix <em>et</em> dans la quantité) — règle du
                  produit :
                </p>
                <MB tex="\frac{\partial \Pi_i}{\partial y_i} = 40 - 2\,y_i - \sum_{j \neq i} y_j - 10 = 0" />
                <p>
                  Lecture économique : en produisant une caisse de plus, la firme <M tex="i" />{" "}
                  encaisse le prix, mais fait aussi baisser le prix sur <em>toutes</em> ses
                  unités (d'où le <M tex="-2y_i" />) — sans se soucier de la baisse qu'elle
                  inflige aux rivales. C'est le cœur du mécanisme de Cournot.
                </p>
                <Callout variant="attention">
                  <p>
                    Le piège de calcul : dériver la recette <M tex="p \cdot y_i" /> en oubliant
                    que le prix dépend de <M tex="y_i" />, et écrire{" "}
                    <M tex="40 - y_i - \sum_{j\neq i} y_j - 10 = 0" /> (sans le facteur 2 sur{" "}
                    <M tex="y_i" />). Ce serait le comportement d'un <em>preneur de prix</em>, pas
                    d'un oligopoleur — et toute la suite (le <M tex="n+1" /> au dénominateur)
                    serait faussée.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Imposer la symétrie et calculer y·(n), Y(n) et p(n) (3.2)",
            refs: [
              { chapter: "ei2", section: "cournot" },
              { chapter: "ei2", section: "nombre-firmes" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi la symétrie maintenant ?</strong> Les <M tex="n" /> firmes ont
                  le même coût et font face à la même demande : à l'équilibre, elles produisent
                  toutes la même quantité, <M tex="y_j = y_i" /> pour tout <M tex="j" />. La
                  somme des <M tex="n - 1" /> rivales devient alors :
                </p>
                <MB tex="\sum_{j \neq i} y_j = (n-1)\,y_i" />
                <p>On l'injecte dans la CPO (et on regroupe <M tex="40 - 10 = 30" />) :</p>
                <MB tex="30 - 2\,y_i - (n-1)\,y_i = 0 \;\Longleftrightarrow\; 30 = \big(2 + n - 1\big)\,y_i = (n+1)\,y_i" />
                <MB tex="y_i(n) = \frac{30}{n+1}" />
                <p>
                  La <strong>quantité totale</strong> s'obtient en multipliant par{" "}
                  <M tex="n" /> :
                </p>
                <MB tex="Y(n) = n \times \frac{30}{n+1} = \frac{30\,n}{n+1}" />
                <p>
                  Et le <strong>prix d'équilibre</strong>, en remontant la demande inverse — on
                  met tout au même dénominateur pour une forme exploitable :
                </p>
                <MB tex="p(n) = 40 - \frac{30\,n}{n+1} = \frac{40\,(n+1) - 30\,n}{n+1} = \frac{40\,n + 40 - 30\,n}{n+1} = \frac{10\,n + 40}{n+1}" />
                <p>
                  Contrôles rapides : <M tex="n = 1" /> donne <M tex="y_1 = 15" />,{" "}
                  <M tex="p = 25" /> (le monopole : <M tex="Rm = 40 - 2Y = 10" /> redonne bien{" "}
                  <M tex="Y = 15" />) ; <M tex="n = 2" /> donne <M tex="y_i = 10" />,{" "}
                  <M tex="p = 20" /> — le duopole de Cournot standard. Les formules passent les
                  tests.
                </p>
                <Callout variant="methode">
                  <p>
                    Grave dans le marbre la <strong>chronologie</strong> : CPO d'abord (à
                    quantités rivales quelconques), symétrie ensuite. Et retiens la forme du
                    résultat pour toute demande linéaire <M tex="p = a - Y" /> avec coût{" "}
                    <M tex="c" /> : chaque firme produit <M tex="\tfrac{a - c}{n+1}" /> — ici{" "}
                    <M tex="\tfrac{40 - 10}{n+1} = \tfrac{30}{n+1}" />. Le « <M tex="n + 1" /> au
                    dénominateur » est la signature de Cournot.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Calculer L(n) et lire le sens de variation de la marge (3.2)",
            refs: [
              { chapter: "ei1", section: "pouvoir" },
              { chapter: "ei2", section: "nombre-firmes" },
            ],
            content: (
              <>
                <p>
                  <strong>D'abord la marge absolue.</strong> On soustrait le coût marginal 10 en
                  mettant au même dénominateur :
                </p>
                <MB tex="p(n) - 10 = \frac{10\,n + 40}{n+1} - \frac{10\,(n+1)}{n+1} = \frac{10\,n + 40 - 10\,n - 10}{n+1} = \frac{30}{n+1}" />
                <p>
                  <strong>Puis la marge relative</strong> — l'indice de Lerner. Les{" "}
                  <M tex="(n+1)" /> se simplifient entre numérateur et dénominateur :
                </p>
                <MB tex="L(n) = \frac{p(n) - 10}{p(n)} = \frac{30/(n+1)}{(10\,n+40)/(n+1)} = \frac{30}{10\,n + 40} = \frac{3}{n+4}" />
                <FormulaBox
                  label="Résultat 3.2 — équilibre de Cournot à n firmes"
                  tex="y_i(n) = \frac{30}{n+1}, \qquad p(n) = \frac{10\,n + 40}{n+1}, \qquad L(n) = \frac{3}{n+4}"
                  caption={<>Trois fonctions décroissantes de la concurrence : quantité individuelle, prix, marge relative.</>}
                />
                <p>
                  <strong>Sens de variation :</strong> la marge absolue{" "}
                  <M tex="\tfrac{30}{n+1}" /> et la marge relative{" "}
                  <M tex="L(n) = \tfrac{3}{n+4}" /> sont toutes deux{" "}
                  <strong>décroissantes en <M tex="n" /></strong> : chaque firme supplémentaire
                  accroît la quantité totale, fait baisser le prix — <M tex="p(n)" /> glisse de
                  25 vers 10 — et érode le pouvoir de marché de chacune.
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[24rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>n firmes</th>
                        <th className={THc}>1</th>
                        <th className={THc}>2</th>
                        <th className={THc}>3</th>
                        <th className={THc}>5</th>
                        <th className={THc}>10</th>
                        <th className={THc}>∞</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>Prix p(n)</td>
                        <td className={TDc}>25</td>
                        <td className={TDc}>20</td>
                        <td className={TDc}>17,5</td>
                        <td className={TDc}>15</td>
                        <td className={TDc}>≈ 12,7</td>
                        <td className={TDc}>
                          <strong>10 = Cm</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className={TD}>Lerner L(n)</td>
                        <td className={TDc}>3/5</td>
                        <td className={TDc}>1/2</td>
                        <td className={TDc}>3/7</td>
                        <td className={TDc}>1/3</td>
                        <td className={TDc}>3/14</td>
                        <td className={TDc}>
                          <strong>0</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <LernerFigure />
                <Callout variant="intuition">
                  <p>
                    Chaque entrant « dilue » le pouvoir de marché : il ajoute de la quantité que
                    personne n'internalise, le prix baisse pour tout le monde, et la part du prix
                    qui est de la marge pure rétrécit. L'indice de Lerner <em>chiffre</em>{" "}
                    exactement cette dilution — c'est toute la valeur ajoutée de la question par
                    rapport à un simple « le prix baisse ».
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Étudier les cas limites n = 1 et n → ∞ (3.3)",
            refs: [
              { chapter: "ei2", section: "nombre-firmes" },
              { chapter: "ei1", section: "concurrence" },
            ],
            content: (
              <>
                <p>
                  <strong>Cas <M tex="n = 1" /> — le monopole.</strong> Les formules donnent :
                </p>
                <MB tex="y_1 = \frac{30}{2} = 15, \qquad p(1) = \frac{10 + 40}{2} = 25, \qquad L(1) = \frac{3}{1+4} = \frac{3}{5} = 0{,}6" />
                <p>
                  C'est le pouvoir de marché maximal sur ce marché : 60 % du prix payé par le
                  consommateur est de la marge pure. Vérification élégante, qui recolle avec la
                  question 3.1 : pour la demande <M tex="p = 40 - Y" />, l'élasticité-prix au
                  point d'équilibre vaut <M tex="\varepsilon = \big|\tfrac{dY}{dp}\big| \times \tfrac{p}{Y} = 1 \times \tfrac{25}{15} = \tfrac{5}{3}" />, et on retrouve exactement :
                </p>
                <MB tex="L(1) = \frac{1}{\varepsilon} = \frac{3}{5} \;\checkmark" />
                <p>
                  <strong>Cas <M tex="n \to \infty" /> — la concurrence parfaite.</strong> Quand
                  le nombre de firmes explose :
                </p>
                <MB tex="\lim_{n \to \infty} L(n) = \lim_{n \to \infty} \frac{3}{n+4} = 0 \qquad \text{et} \qquad \lim_{n \to \infty} p(n) = \lim_{n \to \infty} \frac{10\,n + 40}{n+1} = 10 = Cm" />
                <p>
                  Prix au coût marginal, marge nulle, pouvoir de marché entièrement dissipé :
                  l'oligopole de Cournot <strong>converge vers la concurrence parfaite</strong>.
                </p>
                <Callout variant="retiens">
                  <p>
                    L'interprétation qui vaut les 2 derniers points : le modèle de Cournot{" "}
                    <strong>fait le pont entre les deux cas polaires du cours</strong> — le
                    monopole (<M tex="n = 1" />, chapitre EI1) et la concurrence parfaite (
                    <M tex="n \to \infty" />). L'entrée de firmes supplémentaires érode{" "}
                    <em>continûment</em> le pouvoir de marché, et l'indice de Lerner{" "}
                    <M tex="L(n) = \tfrac{3}{n+4}" /> en donne la mesure exacte à chaque étape.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1</strong> — <M tex="L = \tfrac{p - Cm}{p} \in [0, 1]" /> : marge
              relative. Pour la firme : mesure du pouvoir de marché (<M tex="L = 1/\varepsilon" />{" "}
              en monopole) ; pour la société : mesure de l'écart à <M tex="p = Cm" />, donc de la
              quantité restreinte et de la perte sèche.
              <br />
              <strong>3.2</strong> — <M tex="y_i(n) = \tfrac{30}{n+1}" />,{" "}
              <M tex="Y(n) = \tfrac{30n}{n+1}" />, <M tex="p(n) = \tfrac{10n + 40}{n+1}" />,{" "}
              <M tex="L(n) = \tfrac{3}{n+4}" /> : marge absolue et marge relative décroissantes
              en <M tex="n" /> (le prix glisse de 25 vers 10).
              <br />
              <strong>3.3</strong> — <M tex="L(1) = \tfrac{3}{5} = 0{,}6" /> avec{" "}
              <M tex="p = 25" /> : le monopole (et <M tex="1/\varepsilon = 3/5" />, cohérent) ;{" "}
              <M tex="L(n) \to 0" /> et <M tex="p(n) \to 10 = Cm" /> : la concurrence parfaite.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> le « <M tex="n+1" /> au dénominateur » est la
              signature de Cournot, et <M tex="L(n)" /> chiffre la dilution du pouvoir de marché
              — Cournot relie continûment le monopole à la concurrence parfaite.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex1" },
                { session: 2, exercise: "ex1" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />
    </ExamSolutionShell>
  );
}
