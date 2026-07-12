/**
 * TP · Séance 1 — Le monopole : l'éditeur de livres (Économie industrielle).
 *
 * Énoncé fidèle au document officiel « Exercice à préparer avant le cours »
 * (chapitre 1, le monopole) ; résolution pas à pas alignée sur le corrigé
 * officiel (slides « Le monopole : corrigé de l'exercice à préparer »).
 * Tous les résultats numériques ont été revérifiés : y* = 9, p* = 15,
 * ε = 5/3, Lerner = 3/5, SC = 40,5, SP = 81, perte sèche = 40,5,
 * subvention → y = 10 et p = 14.
 */
import type { ReactNode } from "react";
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { Quiz } from "@/components/course/Quiz";

/* ------------------------------------------------------------------ */
/* Graphique statique — demande / Rm / Cm, comme dans le corrigé       */
/* ------------------------------------------------------------------ */

/* Couleurs validées (validateur dataviz : bande de luminance, chroma,
 * séparation daltonisme et contraste OK sur fond clair). */
const COL_DEMANDE = "#0284c7"; // sky-600
const COL_RM = "#d97706"; // amber-600
const COL_CM = "#059669"; // emerald-600
const COL_PERTE = "#e11d48"; // rose-600

type GraphMode = "optimum" | "surplus" | "concurrence" | "perte";

const GRAPH_ARIA: Record<GraphMode, string> = {
  optimum:
    "Demande, recette marginale et coût marginal ; l'optimum du monopole est y égal 9 milliers de livres au prix de 15 euros",
  surplus:
    "Surplus du consommateur (triangle au-dessus du prix de 15) et surplus du producteur (rectangle entre 15 et le coût marginal 6) à l'optimum du monopole",
  concurrence:
    "En concurrence parfaite le prix égale le coût marginal 6, la quantité vaut 18 et tout le surplus (triangle sous la demande) va aux consommateurs",
  perte:
    "La perte sèche du monopole est le triangle entre la demande et le coût marginal, pour les quantités comprises entre 9 et 18",
};

/** Repère : y (milliers de livres) en abscisse, p (euros) en ordonnée. */
function GraphMonopole({ mode, caption }: { mode: GraphMode; caption?: ReactNode }) {
  const X = (v: number) => 46 + (v / 24) * 400;
  const Y = (v: number) => 272 - (v / 24) * 244;
  const guides = "5 4";
  const showMonopole = mode !== "concurrence";
  const showConcurrence = mode === "concurrence" || mode === "perte";

  return (
    <figure className="my-4 rounded-xl border bg-card p-3">
      <svg viewBox="0 0 460 316" className="w-full" role="img" aria-label={GRAPH_ARIA[mode]}>
        {/* Surfaces (dessinées d'abord, sous les courbes) */}
        {mode === "surplus" || mode === "perte" ? (
          <>
            {/* SC monopole : triangle (0,24)-(0,15)-(9,15) */}
            <polygon
              points={`${X(0)},${Y(24)} ${X(0)},${Y(15)} ${X(9)},${Y(15)}`}
              fill={COL_DEMANDE}
              opacity={mode === "surplus" ? 0.28 : 0.12}
            />
            {/* SP monopole : rectangle (0..9) × (6..15) */}
            <rect
              x={X(0)}
              y={Y(15)}
              width={X(9) - X(0)}
              height={Y(6) - Y(15)}
              fill={COL_RM}
              opacity={mode === "surplus" ? 0.28 : 0.12}
            />
          </>
        ) : null}
        {mode === "concurrence" ? (
          <polygon
            points={`${X(0)},${Y(24)} ${X(0)},${Y(6)} ${X(18)},${Y(6)}`}
            fill={COL_DEMANDE}
            opacity={0.25}
          />
        ) : null}
        {mode === "perte" ? (
          <polygon
            points={`${X(9)},${Y(15)} ${X(9)},${Y(6)} ${X(18)},${Y(6)}`}
            fill={COL_PERTE}
            opacity={0.4}
            stroke={COL_PERTE}
            strokeWidth={1.5}
          />
        ) : null}

        {/* Guides pointillés */}
        {showMonopole ? (
          <>
            <line
              x1={X(0)}
              y1={Y(15)}
              x2={X(9)}
              y2={Y(15)}
              stroke="var(--color-muted-foreground)"
              strokeWidth={1.3}
              strokeDasharray={guides}
            />
            <line
              x1={X(9)}
              y1={Y(15)}
              x2={X(9)}
              y2={Y(0)}
              stroke="var(--color-muted-foreground)"
              strokeWidth={1.3}
              strokeDasharray={guides}
            />
          </>
        ) : null}
        {showConcurrence ? (
          <line
            x1={X(18)}
            y1={Y(6)}
            x2={X(18)}
            y2={Y(0)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.3}
            strokeDasharray={guides}
          />
        ) : null}

        {/* Axes */}
        <line x1={X(0)} y1={Y(0)} x2={X(24) + 4} y2={Y(0)} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(24) - 6} stroke="var(--color-foreground)" strokeWidth={1.3} />

        {/* Graduations x */}
        {[0, 9, 12, 18, 24].map((v) => (
          <g key={`x${v}`}>
            <line x1={X(v)} y1={Y(0)} x2={X(v)} y2={Y(0) + 5} stroke="var(--color-foreground)" strokeWidth={1} />
            <text
              x={X(v)}
              y={Y(0) + 18}
              fontSize={11}
              textAnchor="middle"
              fontWeight={(v === 9 && showMonopole) || (v === 18 && showConcurrence) ? 700 : 400}
              fill={
                (v === 9 && showMonopole) || (v === 18 && showConcurrence)
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)"
              }
            >
              {v}
            </text>
          </g>
        ))}
        {/* Graduations p */}
        {[6, 15, 24].map((v) => (
          <g key={`y${v}`}>
            <line x1={X(0) - 5} y1={Y(v)} x2={X(0)} y2={Y(v)} stroke="var(--color-foreground)" strokeWidth={1} />
            <text
              x={X(0) - 9}
              y={Y(v) + 4}
              fontSize={11}
              textAnchor="end"
              fontWeight={(v === 15 && showMonopole) || v === 6 ? 700 : 400}
              fill={
                (v === 15 && showMonopole) || v === 6
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)"
              }
            >
              {v}
            </text>
          </g>
        ))}

        {/* Courbes */}
        <line x1={X(0)} y1={Y(24)} x2={X(24)} y2={Y(0)} stroke={COL_DEMANDE} strokeWidth={2.5} />
        <line x1={X(0)} y1={Y(24)} x2={X(12)} y2={Y(0)} stroke={COL_RM} strokeWidth={2.5} />
        <line x1={X(0)} y1={Y(6)} x2={X(24)} y2={Y(6)} stroke={COL_CM} strokeWidth={2.5} />

        {/* Étiquettes des courbes (adjacentes à leur ligne) */}
        <text x={X(4.6)} y={Y(20.6)} fontSize={12} fontWeight={600} fill="var(--color-foreground)">
          Demande : p = 24 − y
        </text>
        <text x={X(12.4)} y={Y(2.2)} fontSize={12} fontWeight={600} fill="var(--color-foreground)">
          Rm = 24 − 2y
        </text>
        <text x={X(24)} y={Y(6) - 8} fontSize={12} fontWeight={600} textAnchor="end" fill="var(--color-foreground)">
          Cm = 6
        </text>

        {/* Étiquettes des surfaces */}
        {mode === "surplus" ? (
          <>
            <text x={X(0.8)} y={Y(17.6)} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
              SC = 40,5
            </text>
            <text x={X(2.6)} y={Y(10.2)} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
              SP = 81
            </text>
          </>
        ) : null}
        {mode === "concurrence" ? (
          <text x={X(3.6)} y={Y(11.6)} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
            SC = 162
          </text>
        ) : null}
        {mode === "perte" ? (
          <text x={X(9.7)} y={Y(7.9)} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
            Perte sèche
          </text>
        ) : null}

        {/* Points remarquables */}
        {showMonopole ? (
          <>
            {/* Intersection Rm = Cm en (9, 6) */}
            <circle cx={X(9)} cy={Y(6)} r={4} fill="var(--color-card)" stroke="var(--color-foreground)" strokeWidth={1.8} />
            {/* Point de monopole sur la demande en (9, 15) */}
            <circle cx={X(9)} cy={Y(15)} r={4.5} fill="var(--color-foreground)" />
          </>
        ) : null}
        {showConcurrence ? <circle cx={X(18)} cy={Y(6)} r={4.5} fill="var(--color-foreground)" /> : null}

        {/* Titres d'axes */}
        <text x={X(24) + 4} y={Y(0) + 34} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
          y (milliers de livres)
        </text>
        <text x={10} y={16} fontSize={11} fill="var(--color-muted-foreground)">
          p (€)
        </text>
      </svg>
      {caption ? (
        <figcaption className="mt-1.5 text-center text-[13px] text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={1}
      intro={
        <>
          <p>
            Cette séance porte sur l'exercice officiel à préparer du{" "}
            <strong>chapitre EI1 — le monopole</strong> : un éditeur seul sur son marché, une
            demande linéaire, un coût marginal constant. Avant de te lancer, révise en priorité la
            condition d'optimum <M tex="Rm = Cm" />, la raison pour laquelle la recette marginale
            est inférieure au prix, l'indice de Lerner et la lecture graphique des surplus.
            Conseil de méthode : commence <em>toujours</em> par écrire la demande inverse{" "}
            <M tex="p = 24 - y" /> et par dessiner le graphique (demande, Rm, Cm) — presque toutes
            les réponses se lisent dessus. Tente chaque question au brouillon avant de révéler les
            étapes !
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice unique — l'éditeur de livres en monopole             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex1"
        number={1}
        title="L'éditeur de livres — recette marginale, optimum du monopole et perte sèche"
        difficulty={2}
        refs={[
          { chapter: "ei1", section: "maximisation" },
          { chapter: "ei1", section: "pouvoir" },
          { chapter: "ei1", section: "inefficacite" },
          { chapter: "ei1", section: "taxation" },
        ]}
        statement={
          <>
            <p className="text-sm italic text-muted-foreground">
              Exercice à préparer avant le cours. Si une sous-question te pose un problème,
              n'hésite pas à la laisser de côté et à y revenir après avoir visionné les vidéos.
            </p>
            <p>
              Un éditeur dispose d'un pouvoir de monopole pour la vente d'un petit livre récemment
              primé. La courbe de demande pour ce livre est donnée par
            </p>
            <MB tex="y = 24 - p" />
            <p>
              où <M tex="y" /> représente le nombre de livres demandés{" "}
              <strong>(en milliers)</strong> et <M tex="p" /> représente le prix de ce livre en
              euros. Les coûts de production et de vente de ce livre s'élèvent à{" "}
              <strong>6 euros par livre</strong>, quel que soit le nombre de livres vendus.
            </p>
            <SubQuestion label="1">
              Quelle est la fonction de recette totale de la vente de ce livre ? Quelle est la
              fonction de recette marginale ?
            </SubQuestion>
            <SubQuestion label="2">Quel est le coût marginal de production de ce livre ?</SubQuestion>
            <SubQuestion label="3">
              À combien s'élève le nombre de livres vendus qui maximise le profit de cet éditeur ?
              À combien s'élève le prix ?
            </SubQuestion>
            <SubQuestion label="4">
              Que vaut l'élasticité de la demande calculée à l'optimum de l'éditeur ? Que vaut sa
              marge ? Que vaut l'indice de Lerner ?
            </SubQuestion>
            <SubQuestion label="5">
              Calcule le surplus du producteur, le surplus du consommateur et le surplus total.
            </SubQuestion>
            <SubQuestion label="6">
              Quel serait le prix pratiqué en cas de concurrence parfaite ? À combien s'élèverait
              le nombre de livres vendus dans cette situation ? Quels seraient le surplus du
              producteur, le surplus du consommateur et le surplus total ?
            </SubQuestion>
            <SubQuestion label="7">
              Quelle est la valeur de la perte sèche créée par le pouvoir du monopole ?
            </SubQuestion>
            <SubQuestion label="8">
              Pour inciter l'éditeur à vendre plus de livres, le gouvernement offre à l'éditeur
              une subvention de 2 euros par livre vendu. Que valent les quantités qui maximisent
              le profit de l'éditeur ? Le prix a-t-il diminué plus ou moins que le montant du
              subside ?
            </SubQuestion>
          </>
        }
        steps={[
          /* ------------------------------------------------------ */
          {
            title: "Mise en place — extraire les données et choisir la stratégie",
            refs: [
              { chapter: "ei1", section: "demande" },
              { chapter: "ei1", section: "exemple-analytique" },
            ],
            content: (
              <>
                <p>
                  Avant tout calcul, pose le cadre. Trois données, et pas une de plus, pilotent
                  tout l'exercice :
                </p>
                <ul className="my-2 list-disc space-y-1 pl-6">
                  <li>
                    la <strong>demande</strong> <M tex="y = 24 - p" /> — elle est décroissante :
                    l'éditeur ne peut vendre plus qu'en baissant son prix. C'est ça, être en
                    monopole face au marché ;
                  </li>
                  <li>
                    le <strong>coût</strong> : 6 € par livre, quel que soit le volume. La fonction
                    de coût est donc <M tex="C(y) = 6y" /> (pas de coût fixe) ;
                  </li>
                  <li>
                    les <strong>unités</strong> : <M tex="y" /> est en <em>milliers</em> de
                    livres, <M tex="p" /> en euros.
                  </li>
                </ul>
                <Callout variant="methode" title="La routine « monopole » à connaître par cœur">
                  <ol className="my-1 list-decimal space-y-1 pl-5">
                    <li>
                      Inverser la demande pour obtenir <M tex="p(y)" />.
                    </li>
                    <li>
                      Écrire la recette totale <M tex="RT(y) = p(y)\cdot y" /> et la dériver :{" "}
                      <M tex="Rm(y)" />.
                    </li>
                    <li>
                      Résoudre <M tex="Rm = Cm" /> pour trouver <M tex="y^*" />.
                    </li>
                    <li>
                      Remonter à <M tex="p^*" /> <em>via la demande</em>, jamais autrement.
                    </li>
                    <li>Lire élasticité, marge, Lerner et surplus à ce point.</li>
                  </ol>
                  <p>
                    Les questions 1 à 7 suivent exactement cet ordre : l'énoncé te guide dans la
                    routine.
                  </p>
                </Callout>
                <Callout variant="attention">
                  <p>
                    Garde les unités en tête jusqu'au bout : comme <M tex="y" /> est en milliers
                    de livres et <M tex="p" /> en euros, tous les surplus que tu calculeras
                    (questions 5 à 7) seront en <strong>milliers d'euros</strong>. Un surplus de
                    « 40,5 » signifie 40 500 €.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 1 — Recette totale et recette marginale",
            refs: [
              { chapter: "ei1", section: "recette" },
              { chapter: "ei1", section: "exemple-analytique" },
            ],
            content: (
              <>
                <p>
                  La recette totale est <M tex="RT = p \cdot y" />. Mais telle quelle, elle mélange
                  deux variables. Comme le monopoleur choisit sa <em>quantité</em>, on exprime
                  tout en fonction de <M tex="y" /> : c'est le rôle de la{" "}
                  <strong>demande inverse</strong>. À partir de <M tex="y = 24 - p" /> :
                </p>
                <MB tex="p = 24 - y" />
                <p>La recette totale se réécrit donc :</p>
                <MB tex="RT(y) = p \cdot y = (24 - y)\,y = 24y - y^2" />
                <p>
                  La recette marginale est la dérivée de la recette totale par rapport à{" "}
                  <M tex="y" /> :
                </p>
                <MB tex="Rm(y) = \frac{dRT}{dy} = 24 - 2y" />
                <Callout variant="attention">
                  <p>
                    Deux pièges classiques ici. <strong>(1)</strong> Ne dérive pas{" "}
                    <M tex="RT" /> par rapport à <M tex="p" /> : la recette marginale est définie
                    par rapport à la quantité. <strong>(2)</strong> N'écris surtout pas{" "}
                    <M tex="Rm = p" /> : c'est vrai pour une firme <em>preneuse de prix</em> en
                    concurrence parfaite, jamais pour un monopole. Ici, vendre un livre de plus
                    oblige à baisser le prix sur <em>tous</em> les livres — d'où{" "}
                    <M tex="Rm = p + \frac{dp}{dy}\,y = p - y" />, qui est bien inférieur à{" "}
                    <M tex="p" />.
                  </p>
                </Callout>
                <Callout variant="retiens">
                  <p>
                    Avec une demande inverse linéaire <M tex="p = a - by" />, la recette marginale
                    a <strong>la même ordonnée à l'origine et une pente double</strong> :{" "}
                    <M tex="Rm = a - 2by" />. Ici : <M tex="24 - 2y" />.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> en <M tex="y = 0" />,{" "}
                  <M tex="Rm(0) = 24" /> = l'ordonnée à l'origine de la demande (première unité
                  vendue au prix maximal, sans effet-prix) ; et <M tex="Rm" /> s'annule en{" "}
                  <M tex="y = 12" />, exactement la moitié de 24. Si l'une de ces deux propriétés
                  n'est pas vérifiée, ta dérivée est fausse.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 2 — Le coût marginal",
            refs: [{ chapter: "ei1", section: "maximisation" }],
            content: (
              <>
                <p>
                  Le coût marginal est le coût de production d'une unité supplémentaire :{" "}
                  <M tex="Cm(y) = C'(y)" />. L'énoncé dit que chaque livre coûte 6 €{" "}
                  <em>quel que soit le nombre de livres vendus</em> :
                </p>
                <MB tex="C(y) = 6y \qquad \Longrightarrow \qquad Cm = C'(y) = 6" />
                <p>
                  Le coût marginal est donc <strong>constant et égal à 6</strong> (donné
                  directement dans l'énoncé). Graphiquement, c'est une droite horizontale à la
                  hauteur 6. Remarque au passage : sans coût fixe, le coût moyen vaut aussi{" "}
                  <M tex="C(y)/y = 6" /> — coût marginal et coût moyen sont confondus.
                </p>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> passe de <M tex="y" /> à{" "}
                  <M tex="y + 1" /> : le coût passe de <M tex="6y" /> à <M tex="6y + 6" />, soit
                  6 € de plus. C'est bien la définition du coût marginal — et il ne dépend pas de{" "}
                  <M tex="y" />, comme annoncé.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 3 — L'optimum du monopole : résoudre Rm = Cm",
            refs: [
              { chapter: "ei1", section: "maximisation" },
              { chapter: "ei1", section: "exemple-analytique" },
            ],
            content: (
              <>
                <p>
                  Pourquoi <M tex="Rm = Cm" /> ? Raisonne à la marge : tant que{" "}
                  <M tex="Rm > Cm" />, le livre supplémentaire rapporte plus qu'il ne coûte —
                  produis-le. Dès que <M tex="Rm < Cm" />, il détruit du profit — arrête-toi
                  avant. Le profit culmine donc exactement là où la recette marginale égale le
                  coût marginal :
                </p>
                <MB tex="Rm = Cm \;\Longleftrightarrow\; 24 - 2y = 6" />
                <MB tex="2y = 18 \qquad \Longrightarrow \qquad y^* = 9" />
                <p>
                  L'éditeur vend <strong>9 (milliers de livres)</strong>. Le prix se lit ensuite
                  sur la demande inverse (rappel : <M tex="p = 24 - y" />) :
                </p>
                <MB tex="p^* = 24 - 9 = 15 \,\text{€}" />
                <GraphMonopole
                  mode="optimum"
                  caption={
                    <>
                      L'optimum en deux temps : Rm coupe Cm en y* = 9 (point creux), puis on
                      remonte sur la demande pour lire p* = 15 (point plein).
                    </>
                  }
                />
                <Callout variant="attention">
                  <p>
                    Le piège graphique le plus fréquent de tout le chapitre : le prix{" "}
                    <strong>ne se lit pas</strong> à l'intersection de <M tex="Rm" /> et{" "}
                    <M tex="Cm" /> (qui se trouve à la hauteur 6). L'intersection donne seulement
                    la <em>quantité</em> <M tex="y^* = 9" /> ; le prix se lit en remontant
                    verticalement jusqu'à la <em>courbe de demande</em> : 15 €.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> calcule le profit{" "}
                  <M tex="\pi(y) = (24 - y)y - 6y" /> autour de 9 :{" "}
                  <M tex="\pi(9) = 15 \times 9 - 54 = 81" />, contre{" "}
                  <M tex="\pi(8) = 16 \times 8 - 48 = 80" /> et{" "}
                  <M tex="\pi(10) = 14 \times 10 - 60 = 80" />. Le profit est bien maximal en{" "}
                  <M tex="y^* = 9" /> : 81 (milliers d'euros).
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 4 — Élasticité, marge et indice de Lerner à l'optimum",
            refs: [{ chapter: "ei1", section: "pouvoir" }],
            content: (
              <>
                <p>
                  Trois mesures du pouvoir de marché, toutes évaluées au point{" "}
                  <M tex="(y^*, p^*) = (9, 15)" />. D'abord l'<strong>élasticité-prix</strong> de
                  la demande. Sa formule utilise la dérivée de la demande <em>directe</em>{" "}
                  <M tex="y = 24 - p" />, donc <M tex="dy/dp = -1" /> :
                </p>
                <MB tex="\varepsilon = -\frac{p}{y}\cdot\frac{dy}{dp} = -\frac{15}{9}\times(-1) = \frac{15}{9} = \frac{5}{3} \approx 1{,}67" />
                <p>
                  Ensuite la <strong>marge</strong> (absolue), c'est-à-dire ce que l'éditeur gagne
                  sur chaque livre au-delà de son coût :
                </p>
                <MB tex="\text{marge} = p^* - Cm = 15 - 6 = 9 \,\text{€}" />
                <p>
                  Enfin l'<strong>indice de Lerner</strong>, la marge <em>relative au prix</em> :
                </p>
                <MB tex="L = \frac{p^* - Cm}{p^*} = \frac{15 - 6}{15} = \frac{9}{15} = \frac{3}{5}" />
                <p>
                  Comme le note le corrigé, <M tex="\tfrac{3}{5}" /> est exactement l'
                  <strong>inverse</strong> de <M tex="\varepsilon = \tfrac{5}{3}" /> : ce n'est
                  pas un hasard, c'est la <em>règle de l'élasticité inverse</em>{" "}
                  <M tex="L = 1/\varepsilon" />, vraie à l'optimum de tout monopole.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux sources d'erreur : <strong>(1)</strong> utiliser la pente de la demande{" "}
                    <em>inverse</em> dans la formule de <M tex="\varepsilon" /> au lieu de{" "}
                    <M tex="dy/dp" /> — ici les deux valent −1, mais dès que la pente diffère de 1
                    ce raccourci devient faux ; <strong>(2)</strong> oublier le signe : avec la
                    convention <M tex="\varepsilon = -\tfrac{p}{y}\tfrac{dy}{dp}" />, l'élasticité
                    est un nombre <em>positif</em>.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> deux tests. D'abord{" "}
                  <M tex="L = 1/\varepsilon" /> :{" "}
                  <M tex="1/(5/3) = 3/5" /> ✓. Ensuite <M tex="\varepsilon = 5/3 > 1" /> : un
                  monopole produit <em>toujours</em> dans la partie élastique de la demande (sinon
                  il pourrait augmenter son prix et gagner sur les deux tableaux). Si tu trouves{" "}
                  <M tex="\varepsilon \le 1" /> à un optimum de monopole, il y a une erreur
                  quelque part.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 5 — Les surplus à l'optimum du monopole",
            refs: [{ chapter: "ei1", section: "inefficacite" }],
            content: (
              <>
                <p>
                  Ici, le graphique fait 90 % du travail : les surplus sont des{" "}
                  <strong>aires</strong> entre les courbes, à gauche de la quantité échangée{" "}
                  <M tex="y^* = 9" />.
                </p>
                <GraphMonopole
                  mode="surplus"
                  caption={
                    <>
                      SC : triangle entre la demande et le prix 15. SP : rectangle entre le prix
                      15 et le coût marginal 6 (en milliers d'euros).
                    </>
                  }
                />
                <p>
                  Le <strong>surplus du consommateur</strong> est le triangle sous la demande et
                  au-dessus du prix : base <M tex="9" />, hauteur <M tex="24 - 15 = 9" /> :
                </p>
                <MB tex="SC = \frac{9 \times (24 - 15)}{2} = \frac{81}{2} = 40{,}5" />
                <p>
                  Le <strong>surplus du producteur</strong> est l'aire entre le prix et le coût
                  marginal sur les unités vendues. Comme <M tex="Cm" /> est constant, c'est un{" "}
                  <em>rectangle</em> de base 9 et de hauteur <M tex="15 - 6 = 9" /> :
                </p>
                <MB tex="SP = 9 \times (15 - 6) = 81" />
                <p>Le surplus total s'obtient par addition :</p>
                <MB tex="ST = SP + SC = 81 + 40{,}5 = 121{,}5" />
                <p>
                  soit, en unités réelles : <M tex="SC = 40\,500" /> €, <M tex="SP = 81\,000" /> €
                  et <M tex="ST = 121\,500" /> €.
                </p>
                <Callout variant="attention">
                  <p>
                    Ne calcule pas le SP comme un triangle par réflexe ! Le surplus du producteur
                    n'est un triangle que si le coût marginal est croissant. Ici <M tex="Cm" />{" "}
                    est plat : le SP est un <strong>rectangle</strong> — et ne divise donc pas 81
                    par 2.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> sans coût fixe et à coût marginal
                  constant, le surplus du producteur doit être égal au <em>profit</em>. Or tu as
                  trouvé <M tex="\pi(9) = 81" /> à la question 3 : ça colle. Vérifie aussi
                  l'ordre de grandeur de SC sur le graphique : le triangle bleu est visiblement
                  moitié moins grand que le rectangle, et <M tex="40{,}5 = 81/2" /> ✓.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 6 — Le point de comparaison : la concurrence parfaite",
            refs: [
              { chapter: "ei1", section: "concurrence" },
              { chapter: "ei1", section: "inefficacite" },
            ],
            content: (
              <>
                <p>
                  En concurrence parfaite, les firmes sont preneuses de prix et la concurrence
                  pousse le prix jusqu'au coût marginal :
                </p>
                <MB tex="p_{CP} = Cm = 6 \,\text{€}" />
                <p>La quantité se lit sur la demande à ce prix :</p>
                <MB tex="y_{CP} = 24 - p_{CP} = 24 - 6 = 18" />
                <p>
                  soit 18 milliers de livres — le double du monopole ! Côté surplus : comme le
                  prix égale le coût marginal, chaque livre est vendu exactement à son coût,
                  et le <strong>surplus du producteur est nul</strong> :
                </p>
                <MB tex="SP_{CP} = 18 \times (6 - 6) = 0" />
                <p>
                  Tout le surplus va aux consommateurs — le grand triangle sous la demande,
                  au-dessus du prix 6 :
                </p>
                <MB tex="SC_{CP} = \frac{18 \times (24 - 6)}{2} = \frac{324}{2} = 162" />
                <MB tex="ST_{CP} = 0 + 162 = 162" />
                <GraphMonopole
                  mode="concurrence"
                  caption={
                    <>
                      En concurrence parfaite : p = Cm = 6, y = 18, et tout le surplus (162) est
                      un surplus des consommateurs.
                    </>
                  }
                />
                <Callout variant="attention">
                  <p>
                    « SP = 0 » ne veut pas dire que les firmes font faillite : elles couvrent
                    exactement leurs coûts (profit économique nul). C'est la situation normale de
                    long terme en concurrence parfaite, pas une anomalie.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> le surplus total de concurrence
                  parfaite est le <em>maximum possible</em> sur ce marché — il doit donc dépasser
                  celui du monopole : <M tex="162 > 121{,}5" /> ✓. Si tu avais trouvé un ST de
                  concurrence inférieur à celui du monopole, c'est un signal d'erreur immédiat.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 7 — La perte sèche du monopole",
            refs: [{ chapter: "ei1", section: "inefficacite" }],
            content: (
              <>
                <p>
                  La perte sèche est le surplus qui <em>disparaît</em> à cause du pouvoir de
                  monopole. Deux méthodes doivent donner le même chiffre —{" "}
                  <strong>calcule les deux</strong>, c'est ta vérification intégrée.
                </p>
                <p>
                  <strong>Méthode 1 — par différence des surplus totaux :</strong>
                </p>
                <MB tex="PS = ST_{CP} - ST_{M} = 162 - 121{,}5 = 40{,}5" />
                <p>
                  <strong>Méthode 2 — par l'aire du triangle :</strong> la perte sèche est le
                  triangle entre la demande et le coût marginal, sur les quantités que le monopole
                  ne produit pas (entre 9 et 18) :
                </p>
                <MB tex="PS = \frac{(18 - 9)\times(15 - 6)}{2} = \frac{9 \times 9}{2} = 40{,}5" />
                <GraphMonopole
                  mode="perte"
                  caption={
                    <>
                      La perte sèche (triangle rouge) : les livres entre 9 et 18 milliers valent
                      plus pour les lecteurs que leur coût de production, mais ne sont pas
                      produits.
                    </>
                  }
                />
                <Callout variant="intuition">
                  <p>
                    Pourquoi une <em>perte</em> ? Pour chaque livre entre le 9 001ᵉ et le
                    18 000ᵉ, il existe un lecteur prêt à payer plus que les 6 € qu'il coûte à
                    produire. Ces échanges mutuellement avantageux n'ont pas lieu : cette valeur
                    n'est captée par personne — ni par l'éditeur, ni par les lecteurs. Elle
                    s'évapore.
                  </p>
                </Callout>
                <Callout variant="attention">
                  <p>
                    La perte sèche n'est <strong>pas</strong> « ce que perdent les
                    consommateurs ». Les consommateurs perdent <M tex="162 - 40{,}5 = 121{,}5" />{" "}
                    de surplus par rapport à la concurrence, mais une partie (81) est simplement{" "}
                    <em>transférée</em> à l'éditeur. Seul le triangle de 40,5 est détruit pour la
                    société.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> les deux méthodes donnent 40,5 — si
                  elles divergent, l'erreur est dans l'un des surplus de la question 5 ou 6.
                  (Petite coïncidence de cet énoncé : la perte sèche est égale au SC du monopole,
                  40,5 — les deux triangles ont ici même base 9 et même hauteur 9.)
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Question 8 — La subvention de 2 € par livre : qui la capte ?",
            refs: [
              { chapter: "ei1", section: "taxation" },
              { chapter: "ei1", section: "maximisation" },
            ],
            content: (
              <>
                <p>
                  Une subvention de 2 € <em>par livre vendu</em> ne change ni la demande ni la
                  recette marginale : elle abaisse le <strong>coût marginal effectif</strong> de
                  l'éditeur, qui ne supporte plus que
                </p>
                <MB tex="Cm' = 6 - 2 = 4" />
                <p>
                  On refait alors tourner la même routine, avec <M tex="Rm" /> inchangée
                  (<M tex="24 - 2y" />) et le nouveau coût marginal :
                </p>
                <MB tex="24 - 2y = 4 \qquad \Longrightarrow \qquad 2y = 20 \qquad \Longrightarrow \qquad y' = 10" />
                <p>Le prix se lit toujours sur la demande inverse :</p>
                <MB tex="p' = 24 - 10 = 14 \,\text{€} \quad (\text{au lieu de } 15)" />
                <p>
                  Le prix baisse de <strong>1 €</strong> alors que le subside vaut{" "}
                  <strong>2 €</strong> : le prix a diminué <em>moins</em> que le montant de la
                  subvention. La moitié de la subvention est donc{" "}
                  <strong>captée par le monopole</strong> (sa marge nette passe de 9 à{" "}
                  <M tex="14 - 4 = 10" /> €), et seule l'autre moitié est répercutée aux lecteurs.
                </p>
                <Callout variant="attention">
                  <p>
                    Ne modifie pas la demande ni la recette marginale : la subvention est versée
                    au <em>producteur</em>, elle déplace la droite de coût vers le bas, point.
                    Symétriquement, une <em>taxe</em> de 2 € par livre remonterait le coût
                    effectif à 8 — même mécanique dans l'autre sens.
                  </p>
                </Callout>
                <Callout variant="retiens">
                  <p>
                    Avec une demande linéaire et un coût marginal constant, un monopole ne
                    répercute <strong>que la moitié</strong> de toute variation de coût sur son
                    prix : la pente de <M tex="Rm" /> (2) est le double de celle de la demande
                    (1). C'est un résultat de « pass-through » à connaître pour l'examen.
                  </p>
                </Callout>
                <p>
                  ✅ <strong>Vérifie ton résultat :</strong> l'objectif du gouvernement était de
                  faire vendre plus de livres : <M tex="y' = 10 > 9" /> ✓. Et le test du
                  pass-through : baisse de coût de 2 → baisse de prix de{" "}
                  <M tex="2/2 = 1" /> € ✓, cohérent avec <M tex="15 - 14 = 1" />.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.</strong> <M tex="RT = (24 - y)y" />, <M tex="Rm = 24 - 2y" /> ·{" "}
              <strong>2.</strong> <M tex="Cm = 6" /> · <strong>3.</strong> <M tex="y^* = 9" />{" "}
              (milliers), <M tex="p^* = 15" /> € · <strong>4.</strong>{" "}
              <M tex="\varepsilon = 5/3" />, marge = 9 €, Lerner = 3/5 ·{" "}
              <strong>5.</strong> SC = 40,5 ; SP = 81 ; ST = 121,5 (milliers d'euros) ·{" "}
              <strong>6.</strong> concurrence parfaite : p = 6, y = 18, SP = 0, SC = ST = 162 ·{" "}
              <strong>7.</strong> perte sèche = 40,5 · <strong>8.</strong> avec la subvention :
              y = 10, p = 14 — le prix baisse de 1 €, moins que le subside de 2 €.
            </p>
            <p>
              <strong>Ce que cet exercice t'a appris :</strong> la routine complète du monopole
              (demande inverse → <M tex="RT" /> → <M tex="Rm" /> → <M tex="Rm = Cm" /> → prix lu
              sur la demande), qui se transpose à <em>n'importe quelle</em> demande linéaire ; la
              règle de l'élasticité inverse <M tex="L = 1/\varepsilon" /> comme thermomètre du
              pouvoir de marché ; la lecture graphique des surplus (triangle de SC, rectangle de
              SP quand <M tex="Cm" /> est plat, triangle de perte sèche entre <M tex="y^*" /> et{" "}
              <M tex="y_{CP}" />) ; et la statique comparative sur les coûts : toute taxe ou
              subvention unitaire se traite en déplaçant la droite de <M tex="Cm" />, et avec une
              demande linéaire le monopole n'en répercute que la moitié.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Quiz de méthode                                               */}
      {/* ============================================================ */}
      <Quiz
        scope="tp1"
        id="qx1"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Même marché, mais le coût marginal double : il passe de 6 à 12 €. Que deviennent la
            quantité et le prix d'équilibre du monopole ?
          </>
        }
        options={[
          {
            text: (
              <>
                <M tex="y^* = 6" /> et <M tex="p^* = 18" /> € : le prix augmente de 3 €, soit la
                moitié de la hausse du coût.
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : la routine est inchangée — <M tex="24 - 2y = 12" /> donne{" "}
                <M tex="y^* = 6" />, puis <M tex="p^* = 24 - 6 = 18" />. Le coût monte de 6, le
                prix de 3 seulement : encore le pass-through de 1/2 de la demande linéaire.
              </>
            ),
          },
          {
            text: (
              <>
                <M tex="y^* = 9" /> et <M tex="p^* = 21" /> € : le monopole répercute la hausse de
                6 € entièrement dans son prix.
              </>
            ),
            explain: (
              <>
                Non : le monopole ne peut pas garder y = 9 <em>et</em> monter son prix — la
                demande l'en empêche. Il faut d'abord recalculer la quantité avec{" "}
                <M tex="Rm = Cm" />, puis lire le nouveau prix sur la demande : la hausse
                répercutée n'est que de 3 €.
              </>
            ),
          },
          {
            text: (
              <>
                <M tex="y^* = 12" /> et <M tex="p^* = 12" /> € : on cherche le point où la recette
                totale est maximale.
              </>
            ),
            explain: (
              <>
                <M tex="y = 12" /> est le point où <M tex="Rm = 0" /> : c'est le maximum de la{" "}
                <em>recette</em>, pas du profit. Maximiser la recette n'est optimal que si le coût
                marginal est nul — ici il vaut 12.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Le réflexe à transférer : quand une donnée de coût change, seule la droite{" "}
            <M tex="Cm" /> bouge. Tu re-résous <M tex="Rm = Cm" /> pour la quantité, puis tu
            remontes sur la demande pour le prix — jamais l'inverse.
          </>
        }
      />

      <Quiz
        scope="tp1"
        id="qx2"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            À l'optimum d'un monopole, quelle relation relie l'indice de Lerner{" "}
            <M tex="L = (p - Cm)/p" /> et l'élasticité-prix de la demande <M tex="\varepsilon" /> ?
          </>
        }
        options={[
          {
            text: (
              <>
                <M tex="L = 1/\varepsilon" /> : plus la demande est élastique, plus la marge
                relative est faible.
              </>
            ),
            correct: true,
            explain: (
              <>
                C'est la règle de l'élasticité inverse, vérifiée dans l'exercice :{" "}
                <M tex="L = 3/5" /> et <M tex="\varepsilon = 5/3" />. Une demande très élastique
                (bons substituts) laisse peu de pouvoir de marché.
              </>
            ),
          },
          {
            text: (
              <>
                <M tex="L = \varepsilon" /> : l'indice de Lerner mesure directement l'élasticité.
              </>
            ),
            explain: (
              <>
                Impossible : <M tex="L" /> est une part du prix, donc toujours comprise entre 0
                et 1, alors qu'à l'optimum <M tex="\varepsilon" /> dépasse 1 (ici 5/3). Les deux
                ne peuvent pas être égaux.
              </>
            ),
          },
          {
            text: (
              <>
                Aucune relation générale : élasticité et marge sont deux mesures indépendantes du
                pouvoir de marché.
              </>
            ),
            explain: (
              <>
                Au contraire : la condition <M tex="Rm = Cm" /> se réécrit exactement{" "}
                <M tex="(p - Cm)/p = 1/\varepsilon" />. C'est la même information sous deux formes
                — et un excellent moyen de vérifier tes calculs, comme à la question 4.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Bonus de méthode : cette relation implique <M tex="\varepsilon > 1" /> à tout optimum
            de monopole (sinon <M tex="L" /> dépasserait 1, ce qui exigerait un coût marginal
            négatif). Trouver une élasticité inférieure ou égale à 1 à l'optimum doit
            immédiatement te faire chercher l'erreur.
          </>
        }
      />

      <Quiz
        scope="tp1"
        id="qx3"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Le gouvernement porte la subvention de 2 € à 4 € par livre. Par rapport au prix sans
            subvention (15 €), de combien le prix baisse-t-il maintenant ?
          </>
        }
        options={[
          {
            text: (
              <>
                De 2 € : le prix passe à 13 €, soit toujours la moitié de la subvention.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exact : <M tex="Cm' = 6 - 4 = 2" />, donc <M tex="24 - 2y = 2" /> donne{" "}
                <M tex="y = 11" /> et <M tex="p = 24 - 11 = 13" />. Baisse de 2 € pour un subside
                de 4 € : la règle du « moitié seulement » tient quelle que soit la taille de la
                subvention.
              </>
            ),
          },
          {
            text: (
              <>
                De 4 € : le prix passe à 11 €, puisque la subvention est intégralement répercutée
                sur les lecteurs.
              </>
            ),
            explain: (
              <>
                Non : un monopole face à une demande linéaire ne répercute jamais qu'une moitié
                d'une variation de coût. L'autre moitié gonfle sa marge — c'est exactement la
                conclusion de la question 8.
              </>
            ),
          },
          {
            text: (
              <>
                De 1 € : la baisse du prix ne dépend pas du montant de la subvention.
              </>
            ),
            explain: (
              <>
                1 € était la baisse pour la subvention de 2 €. La baisse du prix dépend bien du
                montant : elle en vaut la moitié. Refais le calcul avec{" "}
                <M tex="Cm' = 2" /> : <M tex="y = 11" />, <M tex="p = 13" />.
              </>
            ),
          },
        ]}
        explanation={
          <>
            La méthode générale : subvention ou taxe unitaire <M tex="s" /> → coût marginal
            effectif <M tex="6 \mp s" /> → re-résoudre <M tex="Rm = Cm" />. Avec{" "}
            <M tex="p = a - by" /> et <M tex="Cm" /> constant, le prix bouge toujours de{" "}
            <M tex="s/2" />. Tu peux maintenant traiter n'importe quelle variante de la
            question 8 en trente secondes.
          </>
        }
      />
    </TpShell>
  );
}
