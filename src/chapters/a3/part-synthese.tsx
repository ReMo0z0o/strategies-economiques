/*
 * Chapitre A3 — PartSynthese (sections affichées dans la page du chapitre).
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  DecisionTree,
  MasteryChecklist,
  PollCard,
  WidgetChordCurve,
  WidgetInsurance,
  WidgetInvest,
  WidgetProspect,
  WidgetRepeatBet,
  WidgetVMA,
} from "./widgets";
import { H3, Lead, Tbl, TH, TD, TDnum } from "./ui";
import { C } from "@/chapters/shared/plot";

/** Mini-arbre de l'exemple numérique du modèle standard (t = 0 puis deux états en t = 1). */
function SynthTree() {
  const INK = "var(--color-foreground)";
  return (
    <figure className="my-4">
      <svg
        viewBox="0 0 460 200"
        className="mx-auto block h-auto w-full max-w-[520px]"
        role="img"
        aria-label="Arbre : en t = 0, consommation 100 ; en t = 1, pluie (probabilité un demi, consommation 64) ou soleil (probabilité un demi, consommation 144)"
      >
        <text x={60} y={20} textAnchor="middle" fontSize={16} fontWeight={700} fill={INK}>
          t = 0
        </text>
        <text x={330} y={20} textAnchor="middle" fontSize={16} fontWeight={700} fill={C.gold}>
          t = 1 (tout × δ = 0,9)
        </text>
        <line x1={60} y1={105} x2={250} y2={60} stroke={C.soft} strokeWidth={2} />
        <line x1={60} y1={105} x2={250} y2={155} stroke={C.soft} strokeWidth={2} />
        <circle cx={60} cy={105} r={7} fill={INK} />
        <circle cx={250} cy={60} r={7} fill={C.blue} />
        <circle cx={250} cy={155} r={7} fill={C.blue} />
        <text x={60} y={135} textAnchor="middle" fontSize={16} fill={INK}>
          x₀ = 100
        </text>
        <text x={60} y={156} textAnchor="middle" fontSize={16} fontWeight={600} fill={C.green}>
          √100 = 10
        </text>
        <text x={150} y={70} textAnchor="middle" fontSize={16} fontWeight={600} fill={C.blue}>
          π = ½
        </text>
        <text x={150} y={154} textAnchor="middle" fontSize={16} fontWeight={600} fill={C.blue}>
          π = ½
        </text>
        <text x={264} y={55} fontSize={16} fill={INK}>
          pluie : x₁ = 64
        </text>
        <text x={264} y={76} fontSize={16} fontWeight={600} fill={C.green}>
          √64 = 8
        </text>
        <text x={264} y={150} fontSize={16} fill={INK}>
          soleil : x₁ = 144
        </text>
        <text x={264} y={171} fontSize={16} fontWeight={600} fill={C.green}>
          √144 = 12
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        En vert, <em>u</em> ; en bleu, <em>π</em> (A3) ; en orange, <em>δ</em> (A2).
      </figcaption>
    </figure>
  );
}

export function PartSynthese() {
  return (
    <>

      {/* ============================================================ */}
      {/* § 13 · SYNTHÈSE & AUTO-ÉVALUATION                            */}
      {/* ============================================================ */}
      <Section id="s13" kicker="§ 13" title="Synthèse & auto-évaluation">
        <Lead>
          Une seule formule réunit le temps (A2) et l'incertitude (A3) : le modèle standard de
          décision rationnelle. Puis la liste des déviations observées chez les Humains, et à toi
          de jouer : 9 questions de QCM et une checklist.
        </Lead>

        <p>
          Le cours se referme sur une version du <strong>modèle standard de décision
          rationnelle</strong>, à la fois <em>inter-temporelle</em> (A2) et{" "}
          <em>sous incertitude</em> (A3) (slide 52) :
        </p>

        <Callout variant="retiens" title="Le modèle standard complet (slide 52)">
          <MB tex="U(x) = \sum_{t=0}^{T} \delta^t \sum_{s_t \in S_t} \pi(s_t)\, u(x_t \mid s_t)" />
          <p>Chaque symbole :</p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <M tex="x_t" /> : la <strong>consommation</strong> au temps <M tex="t" /> (de{" "}
              <M tex="t = 0" />, aujourd'hui, à <M tex="t = T" />, la dernière date) ;
            </li>
            <li>
              <M tex="x = (x_0, x_1, \dots, x_T)" /> : le <strong>programme de
              consommation</strong>, comme en A2 ;
            </li>
            <li>
              <M tex="s_t" /> : l'<strong>état du monde</strong> au temps <M tex="t" /> (il pleut ou
              il fait soleil ; le projet réussit ou échoue…), et <M tex="S_t" /> l'ensemble des
              états possibles à cette date ;
            </li>
            <li>
              <M tex="\pi(s_t)" /> : la <strong>probabilité</strong> d'arriver dans l'état{" "}
              <M tex="s_t" /> au temps <M tex="t" /> (A3) ;
            </li>
            <li>
              <M tex="u(x_t \mid s_t)" /> : l'<strong>utilité</strong> de consommer{" "}
              <M tex="x_t" /> dans l'état <M tex="s_t" /> (la fonction d'utilité de Bernoulli
              d'A3) ;
            </li>
            <li>
              <M tex="\delta" /> : le <strong>facteur d'escompte</strong> (A2).
            </li>
          </ul>
          <p>
            L'individu choisit au temps <M tex="t = 0" /> le programme <M tex="x" /> accessible
            qui maximise <M tex="U(x)" />.
          </p>
        </Callout>

        <p>
          <strong>Comment la lire ?</strong> De l'intérieur vers l'extérieur, en trois gestes :
        </p>
        <ol className="my-3 list-decimal space-y-2 pl-6">
          <li>
            <strong>À chaque date, on fait une moyenne sur les états</strong> :{" "}
            <M tex="\sum_{s_t} \pi(s_t)\, u(x_t \mid s_t)" /> est l'utilité espérée de la date{" "}
            <M tex="t" />, exactement le <M tex="U = \pi u(y) + (1 - \pi) u(x)" /> d'A3, avec
            autant d'états qu'il faut.
          </li>
          <li>
            <strong>On escompte</strong> : l'utilité espérée de la date <M tex="t" /> est
            multipliée par <M tex="\delta^t" />, comme en A2 (aujourd'hui,{" "}
            <M tex="\delta^0 = 1" />).
          </li>
          <li>
            <strong>On additionne toutes les dates</strong>, de <M tex="t = 0" /> à{" "}
            <M tex="t = T" />.
          </li>
        </ol>

        <Callout variant="exemple" title="La formule sur un mini-exemple (chiffres illustratifs)">
          <p>
            Deux dates (<M tex="T = 1" />), <M tex="u(x) = \sqrt{x}" /> et{" "}
            <M tex="\delta = 0{,}9" />. Aujourd'hui (<M tex="t = 0" />), tu consommes{" "}
            <M tex="x_0 = 100" /> avec certitude. Demain (<M tex="t = 1" />), deux états
            équiprobables : s'il pleut, <M tex="x_1 = 64" /> ; s'il fait soleil,{" "}
            <M tex="x_1 = 144" />.
          </p>
          <SynthTree />
          <MB tex="\begin{aligned} U(x) &= \delta^0 \cdot \sqrt{100} \;+\; \delta^1 \Big[\tfrac{1}{2}\sqrt{64} + \tfrac{1}{2}\sqrt{144}\Big] \\ &= 1 \cdot 10 \;+\; 0{,}9 \cdot \Big[\tfrac{1}{2}\cdot 8 + \tfrac{1}{2}\cdot 12\Big] \\ &= 10 + 0{,}9 \cdot 10 = 10 + 9 = 19 \end{aligned}" />
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <span className="font-semibold" style={{ color: C.green }}>
                u
              </span>{" "}
              : on transforme chaque consommation en utilité (√100 = 10, √64 = 8, √144 = 12) ;
            </li>
            <li>
              <span className="font-semibold" style={{ color: C.blue }}>
                π
              </span>{" "}
              (A3) : demain, on fait la moyenne sur les deux états, ½ × 8 + ½ × 12 = 10 ;
            </li>
            <li>
              <span className="font-semibold" style={{ color: C.gold }}>
                δ
              </span>{" "}
              (A2) : l'utilité espérée de demain est escomptée, 0,9 × 10 = 9. Total : 10 + 9 = 19.
            </li>
          </ul>
        </Callout>

        <H3>Les déviations documentées (slide 53)</H3>
        <p>
          Chaque ingrédient de la formule a ses déviations observées chez les Humains. Le slide 53
          en liste trois (et termine par « … » : il en existe d'autres) :
        </p>

        <Tbl minW={620}>
          <thead>
            <tr>
              <th className={TH}>Dans le modèle rationnel…</th>
              <th className={TH}>Déviation documentée</th>
              <th className={TH}>Où</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <M tex="\delta" /> est constant à travers le temps
              </td>
              <td className={TD}>
                <M tex="\delta" /> <strong>n'est pas constant</strong> à travers le temps :
                problèmes de self-contrôle et biais pour le présent (modèle (β, δ))
              </td>
              <td className={TD}>A2</td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="u(x_t \mid s_t)" /> ne dépend que de ce qu'on consomme
              </td>
              <td className={TD}>
                <M tex="u(x_t \mid s_t)" /> <strong>dépend aussi d'un point de référence</strong>{" "}
                <M tex="x_t^{ref}" /> : théorie des perspectives et aversion à la perte (qui
                explique aussi l'effet de dotation d'A1)
              </td>
              <td className={TD}>A3 § 10</td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="\pi(s_t)" /> vient de projections rationnelles
              </td>
              <td className={TD}>
                <M tex="\pi(s_t)" /> <strong>n'est pas basé sur des projections
                rationnelles</strong> : biais de sur-confiance, sur-inférence, biais sur les
                faibles probabilités
              </td>
              <td className={TD}>A3 § 12</td>
            </tr>
            <tr>
              <td className={TD}>
                On évalue une alternative risquée avec tout son portefeuille
              </td>
              <td className={TD}>
                Cadrage étroit : chaque alternative risquée est évaluée séparément (vu aux slides
                44-48 ; pas repris dans la liste du slide 53)
              </td>
              <td className={TD}>A3 § 11</td>
            </tr>
          </tbody>
        </Tbl>

        <Callout variant="retiens" title="Le mot de la fin (slide 53)">
          <p>
            La théorie de la décision <strong>rationnelle</strong> sert de guide lorsqu'on veut
            prendre des décisions économiques importantes (diversifier, s'assurer au prix juste,
            juger un risque avec tout son portefeuille).
          </p>
          <p>
            La théorie de la décision <strong>comportementale</strong> documente les déviations
            systématiques par rapport à la rationalité qu'on observe chez les Humains.
          </p>
        </Callout>

        <Callout variant="examen" title="À maîtriser absolument pour l'examen">
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              Calculer une <strong>VMA</strong> et une <strong>utilité espérée</strong>{" "}
              <M tex="U = \pi u(y) + (1-\pi)u(x)" /> — et ne jamais confondre <M tex="U" /> (sur
              les alternatives risquées) et <M tex="u" /> (sur les montants certains).
            </li>
            <li>
              Le trio : neutre ⇔ <M tex="u" /> linéaire ⇔ classement par VMA ; averse ⇔{" "}
              <M tex="u" /> concave (<M tex="u'' < 0" />
              ) ; affinité ⇔ <M tex="u" /> convexe.
            </li>
            <li>
              Équivalent certain <M tex="u\big(C(a_r)\big) = U(a_r)" /> et prime de risque{" "}
              <M tex="\mathrm{PRM}(a_r) = \mathrm{VMA}(a_r) - C(a_r)" /> (savoir les lire sur le
              graphique de la corde !).
            </li>
            <li>
              Poser un problème d'investissement ou d'assurance : écrire <M tex="y" /> et{" "}
              <M tex="x" /> en fonction de <M tex="A" /> ou de <M tex="C" />, écrire{" "}
              <M tex="U" />, dériver, annuler.
            </li>
            <li>
              Théorème : prix actuariellement juste (<M tex="p = \pi" />) ⇒ assurance complète (
              <M tex="C^* = L" />
              ).
            </li>
            <li>
              Diversification : corrélation négative &gt; nulle &gt; positive pour un averse au
              risque.
            </li>
            <li>
              Les trois caractéristiques de la théorie des perspectives (<M tex="u(w, w_{ref})" />,
              pertes deux fois plus pesantes que les gains), le cadrage étroit (argument de
              Samuelson, <M tex="X \sim Bi(n, p)" />) et les biais sur les probabilités, chacun
              avec un exemple.
            </li>
          </ul>
        </Callout>

        <H3>QCM final — 9 questions</H3>

        <Quiz
          scope="a3"
          id="q5"
          kicker="QCM final · question 1"
          question={
            <p>
              Un actif risqué rapporte 50 € avec probabilité 60 % et 12,5 € sinon. Sa VMA vaut :
            </p>
          }
          options={[
            {
              text: <>31,25 €</>,
              explain: (
                <>
                  31,25 = (50 + 12,5)/2, la moyenne simple : elle ignore que les probabilités
                  sont 60/40. Il faut pondérer.
                </>
              ),
            },
            {
              text: <>35 €</>,
              correct: true,
              explain: <>Exact : 0,6 × 50 + 0,4 × 12,5 = 30 + 5 = 35 €.</>,
            },
            {
              text: <>37,50 €</>,
              explain: (
                <>
                  Tu as appliqué le poids 0,6 aux deux montants : 0,6 × 50 + 0,6 × 12,5 = 30 +
                  7,5 = 37,5. Or les poids doivent être 0,6 et 0,4 (ils somment à 1) : 0,6 × 50 +
                  0,4 × 12,5 = 35 €.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q6"
          kicker="QCM final · question 2"
          question={
            <p>
              Dans <M tex="U(a) = \pi u(y) + (1-\pi)u(x)" />, la fonction <M tex="u" /> s'applique
              à :
            </p>
          }
          options={[
            {
              text: <>des alternatives risquées</>,
              explain: (
                <>
                  Non — c'est <M tex="U" /> (majuscule, von Neumann–Morgenstern) qui évalue les
                  alternatives risquées. <M tex="u" /> est sa brique élémentaire.
                </>
              ),
            },
            {
              text: <>des probabilités</>,
              explain: (
                <>
                  Non, les probabilités sont les poids <M tex="\pi" /> et <M tex="1-\pi" /> devant{" "}
                  <M tex="u" />. <M tex="u" /> transforme les montants.
                </>
              ),
            },
            {
              text: <>des montants certains</>,
              correct: true,
              explain: (
                <>
                  Exact : <M tex="u" /> (Bernoulli) évalue chaque réalisation certaine, puis{" "}
                  <M tex="U" /> fait la moyenne pondérée des <M tex="u" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q7"
          kicker="QCM final · question 3"
          question={<p>Un individu est averse au risque si et seulement si :</p>}
          options={[
            {
              text: (
                <>
                  sa fonction u est concave (<M tex="u'' < 0" />)
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact — utilité marginale décroissante ⇔ aversion au risque. C'est le théorème
                  central du chapitre.
                </>
              ),
            },
            {
              text: (
                <>
                  sa fonction u est croissante (<M tex="u' > 0" />)
                </>
              ),
              explain: (
                <>
                  <M tex="u' > 0" /> est vrai pour <em>tout le monde</em> (plus d'argent, c'est
                  mieux) : ça ne distingue pas les attitudes.
                </>
              ),
            },
            {
              text: <>il refuse toujours tout actif risqué</>,
              explain: (
                <>
                  Non : un averse au risque peut accepter du risque. Il achète un actif risqué si
                  son prix est assez bas (<M tex="p \le C(a_r)" />, § 6) ; l'investisseur{" "}
                  <M tex="\ln w" /> du § 7 place A* = 124 € dans le projet risqué. Fatou et
                  Hicham, eux, gardent volontairement une partie du risque sur leur vélo
                  (assurance partielle, § 9).
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q8"
          kicker="QCM final · question 4"
          question={
            <p>
              Pour un individu averse au risque, l'équivalent certain <M tex="C(a_r)" /> d'un
              actif risqué <M tex="a_r" /> vérifie :
            </p>
          }
          options={[
            {
              text: <M tex="C(a_r) > \mathrm{VMA}(a_r)" />,
              explain: (
                <>
                  Ce serait l'affinité au risque : accepter de payer plus que la VMA pour avoir du
                  risque en plus.
                </>
              ),
            },
            {
              text: <M tex="C(a_r) < \mathrm{VMA}(a_r)" />,
              correct: true,
              explain: (
                <>
                  Exact : le risque « coûte » de l'utilité, donc le montant certain équivalent est
                  plus petit que la moyenne. L'écart est la PRM.
                </>
              ),
            },
            {
              text: <M tex="C(a_r) = \mathrm{VMA}(a_r)" />,
              explain: (
                <>
                  Ce serait la neutralité au risque (u linéaire) — la corde colle alors à la
                  courbe.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q9"
          kicker="QCM final · question 5"
          question={<p>La prime de risque minimale se définit par :</p>}
          options={[
            {
              text: <>PRM = C − VMA</>,
              explain: (
                <>
                  Signe inversé : pour un averse, C {"<"} VMA, ta formule donnerait une prime
                  négative.
                </>
              ),
            },
            {
              text: <>PRM = VMA + C</>,
              explain: (
                <>
                  Non — la PRM est un <em>écart</em> entre deux valeurs, pas une somme.
                </>
              ),
            },
            {
              text: <>PRM = VMA − C</>,
              correct: true,
              explain: (
                <>
                  Exact : c'est la « décote » que le risque inflige à l'actif, ou le rabais
                  minimal sur la VMA pour que l'individu accepte.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q10"
          kicker="QCM final · question 6"
          question={
            <p>
              Un individu averse au risque compose un portefeuille de deux actifs. Il préfère des
              risques :
            </p>
          }
          options={[
            {
              text: <>parfaitement corrélés positivement</>,
              explain: (
                <>
                  C'est le pire cas : les deux actifs montent ou plongent ensemble (2y ou 2x).
                  U(cas 1) est la plus basse.
                </>
              ),
            },
            {
              text: <>parfaitement corrélés négativement</>,
              correct: true,
              explain: (
                <>
                  Exact : parapluies + crème solaire ⇒ valeur y + x <em>certaine</em>. Le risque
                  disparaît complètement : U(cas 2) &gt; U(cas 3) &gt; U(cas 1).
                </>
              ),
            },
            {
              text: <>la corrélation n'a aucune importance</>,
              explain: (
                <>
                  Vrai seulement pour un individu <em>neutre</em> au risque (les trois cas ont la
                  même VMA).
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q11"
          kicker="QCM final · question 7"
          question={
            <p>
              Le vélo (70 €) a 30 % de chances d'être volé. Le prix actuariellement juste pour
              couvrir 1 € est :
            </p>
          }
          options={[
            {
              text: <>0,30 €</>,
              correct: true,
              explain: (
                <>
                  Exact : p = π = 0,3 — le prix qui égalise le coût attendu de l'assureur. À ce
                  prix, un averse au risque s'assure complètement (C* = 70 €).
                </>
              ),
            },
            {
              text: <>0,40 €</>,
              explain: (
                <>
                  0,40 € est le prix <em>proposé</em> dans l'exemple du cours — trop cher de
                  0,10 € par rapport au juste prix, d'où l'assurance partielle de Fatou et Hicham.
                </>
              ),
            },
            {
              text: <>0,70 €</>,
              explain: (
                <>
                  0,70 correspond à 1 − π : c'est la probabilité de <em>ne pas</em> être volé,
                  pas le coût attendu.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q12"
          kicker="QCM final · question 8"
          question={
            <p>
              D'après la théorie des perspectives, face à des <em>pertes</em>, les gens sont
              plutôt :
            </p>
          }
          options={[
            {
              text: <>averses au risque</>,
              explain: (
                <>
                  C'est vrai côté <em>gains</em> (courbe concave), mais côté pertes la courbe est
                  convexe.
                </>
              ),
            },
            {
              text: <>neutres au risque</>,
              explain: (
                <>
                  Non — la fonction <M tex="u(w, w_{ref})" /> (la « fonction de valeur » de
                  Kahneman et Tversky) n'est pas linéaire : concave côté gains, convexe côté
                  pertes, avec un coude au point de référence.
                </>
              ),
            },
            {
              text: <>en affinité avec le risque</>,
              correct: true,
              explain: (
                <>
                  Exact (slide 41) : les pertes sont à utilité marginale croissante (courbe
                  convexe), ce qui encourage la prise de risque pour « tenter de se refaire » —
                  d'où les loosers gardés trop longtemps (Odean, 1998) et les traders à la traîne
                  qui prennent plus de risques (affaire Kerviel).
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a3"
          id="q13"
          kicker="QCM final · question 9"
          question={
            <p>
              Une pièce équilibrée vient de tomber deux fois de suite sur pile. La probabilité de
              pile au 3ᵉ lancer est :
            </p>
          }
          options={[
            {
              text: <>moins de 50 %, le hasard doit compenser</>,
              explain: (
                <>
                  C'est précisément l'erreur de sur-inférence du joueur (« gambler fallacy »,
                  slide 51) : la pièce n'a pas de mémoire, rien ne « compense » les piles déjà
                  sortis.
                </>
              ),
            },
            {
              text: <>exactement 50 %</>,
              correct: true,
              explain: (
                <>
                  Exact : chaque lancer est indépendant des précédents ⇒ 50 %, quel que soit le
                  passé. C'est la réponse du joueur rationnel (slide 51).
                </>
              ),
            },
            {
              text: <>12,5 %, car la suite pile-pile-pile a une probabilité de 1/8</>,
              explain: (
                <>
                  1/8 est la probabilité d'obtenir PPP <em>avant</em> le premier lancer. Ici, les
                  deux piles sont déjà sortis : il ne reste qu'un lancer.{" "}
                  <M tex="P(\text{P} \mid \text{PP}) = \frac{1/8}{1/8 + 1/8} = \frac{1}{2}" />.
                </>
              ),
            },
          ]}
        />

        <H3>Checklist de fin de chapitre</H3>

        <MasteryChecklist
          items={[
            <>
              Je sais définir un actif risqué par ses réalisations (y, x) <em>et</em> ses
              probabilités (π, 1−π). (§ 2)
            </>,
            <>Je calcule une VMA sans confondre moyenne pondérée et moyenne simple. (§ 2)</>,
            <>
              Je peux expliquer pourquoi la VMA ne suffit pas (le sondage des 3 M€ contre
              pile-ou-face). (§ 2)
            </>,
            <>Je comprends la propriété d'indépendance avec l'exemple vin/bière. (§ 3)</>,
            <>
              Je distingue U (vNM, sur les alternatives risquées) et u (Bernoulli, sur les
              montants certains). (§ 4)
            </>,
            <>
              Je sais refaire le calcul de Jean (√w) et Sarah (2w) sur action vs obligation.
              (§ 4)
            </>,
            <>
              Je sais appliquer Pareto à des allocations d'actifs risqués via l'utilité espérée.
              (§ 4)
            </>,
            <>
              Je connais le trio attitude ↔ forme de u ↔ comportement (neutre/averse/affinité).
              (§ 5)
            </>,
            <>Je sais lire C et PRM sur le graphique corde-sous-la-courbe. (§ 6)</>,
            <>
              Je sais calculer C = u⁻¹(U) puis PRM = VMA − C (exercice ln, 98,25 € / 1,75 €).
              (§ 6)
            </>,
            <>Je sais poser y, x, U(A) puis la condition de premier ordre ∂U/∂A = 0 d'un problème d'investissement. (§ 7)</>,
            <>
              Je sais classer les trois cas de corrélation et expliquer parapluies / crème
              solaire / t-shirts. (§ 8)
            </>,
            <>
              Je sais poser le problème d'assurance et j'ai retenu le théorème « prix juste ⇒
              assurance complète ». (§ 9)
            </>,
            <>
              Je sais expliquer l'expérience des étrennes (300 € / 500 €) avec{" "}
              <M tex="u(w, w_{ref})" />, citer les 3 caractéristiques de la théorie des
              perspectives (pertes deux fois plus pesantes que les gains) et ses implications en
              finance (winners / loosers, Kerviel, argent qui dort). (§ 10)
            </>,
            <>
              Je sais reconstruire l'argument de Samuelson (du 10ᵉ pari au 1ᵉʳ), définir le
              cadrage étroit et calculer VMA et probabilité de perte de 3 paris avec{" "}
              <M tex="X \sim Bi(n, p)" /> (7,5 € ; 1/8). (§ 11)
            </>,
            <>
              Je peux citer le biais de sur-confiance, l'erreur de sur-inférence du joueur et le
              biais sur les faibles probabilités, avec un exemple chacun. (§ 12)
            </>,
            <>
              Je sais lire la formule générale U(x) = Σδᵗ Σπ(sₜ)u(xₜ|sₜ) et citer les trois
              déviations du slide 53 (δ, u, π). (§ 13)
            </>,
          ]}
        />
      </Section>
    </>
  );
}
