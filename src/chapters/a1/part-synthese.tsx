/*
 * Chapitre A1 — PartSynthese : sections #synthese (« À maîtriser absolument ») et
 * #exos (exercices corrigés). Approche rationnelle = deck S1, approche
 * comportementale = deck S2. Chiffres de l'île : s_H = 5, s_B = 3, a = 0,5
 * (BRIEF §8, recalculés en Python).
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { Figure, FigMethode } from "./figures";
import { MustKnow } from "./ui";

/**
 * Comme `Tbl` (./ui), mais sans largeur minimale : sur téléphone, les colonnes se
 * resserrent au lieu de cacher la dernière colonne hors de l'écran.
 */
function MiniTbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14px] sm:text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-2 py-2.5 text-left align-bottom text-[11px] font-bold uppercase text-muted-foreground sm:px-3.5 sm:text-xs sm:tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className="px-2 py-2.5 align-top sm:px-3.5">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Titre de groupe dans la synthèse. */
function GroupTitle({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <div
      className={`${first ? "mt-6" : "mt-8"} text-xs font-bold uppercase tracking-widest text-primary`}
    >
      {children}
    </div>
  );
}

export function PartSynthese() {
  return (
    <>

      {/* ============================================================ */}
      {/* ★ — À maîtriser absolument                                    */}
      {/* ============================================================ */}
      <Section id="synthese" kicker="★" title="À maîtriser absolument">
        <p className="text-[1.15rem] leading-relaxed">
          Voici l'ossature du chapitre. Si chacun de ces points te parle, tu as tout compris.
        </p>

        <GroupTitle first>Approche rationnelle — le choix idéal</GroupTitle>
        <MustKnow
          items={[
            <>
              <strong>La méthode en 3 étapes (slide 7).</strong> Modéliser les décisions ;
              utiliser le modèle pour prédire l'<em>allocation</em> que produit chaque mesure
              (analyse <em>positive</em> : mesure → allocation) ; comparer la désirabilité des
              allocations (analyse <em>normative</em>). Une allocation = ce que chaque personne
              obtient au final.
            </>,
            <>
              <strong>La contrainte de budget</strong>{" "}
              <M tex="s(1-t)\,l + c \le s(1-t)\,L + M" /> délimite les paniers accessibles à
              partir de la dotation <M tex="\omega = (L, M)" /> (<M tex="t" /> = taxe sur le
              revenu brut du travail). La <em>valeur absolue</em> de sa pente,{" "}
              <M tex="s(1-t)" />, est le prix du loisir : le salaire net auquel on renonce (coût
              d'opportunité).
            </>,
            <>
              <strong>Les préférences</strong> se notent <M tex="\succ" /> (préféré),{" "}
              <M tex="\sim" /> (indifférent), <M tex="\succeq" /> (au moins aussi bien). Elles
              doivent être <em>transitives, monotones, complètes, continues</em> pour être
              « rationnelles ».
            </>,
            <>
              <strong>Une courbe d'indifférence</strong> relie les paniers de même satisfaction ;
              deux courbes ne se croisent jamais. La <em>fonction d'utilité</em> traduit les
              préférences en nombres : <M tex="x \succ y \iff U(x) > U(y)" /> et{" "}
              <M tex="x \succeq y \iff U(x) \ge U(y)" />. Seul l'ordre compte (2, 5, 13 ou 1, 2,
              3 : mêmes préférences).
            </>,
            <>
              <strong>Le choix optimal</strong> = maximiser l'utilité (la fonction objectif) sous
              la contrainte de budget, avec le <em>Lagrangien</em>{" "}
              <M tex="\mathcal{L} = U - \lambda\,(p_1x_1 + p_2x_2 - m)" />. Conditions de premier
              ordre : <M tex="U_{m1} = \lambda p_1" />, <M tex="U_{m2} = \lambda p_2" /> et
              épuisement du revenu ; d'où la <em>condition de tangence</em>{" "}
              <M tex="\text{TMS} = U_{m1}/U_{m2} = p_1/p_2" />. Les solutions sont les{" "}
              <em>fonctions de demande</em> ; <M tex="\lambda" /> est l'
              <em>utilité marginale du revenu</em> (l'utilité gagnée avec 1 € de plus). Méthode
              valable pour un optimum intérieur ; la convexité des préférences garantit que c'est
              un maximum.
            </>,
            <>
              <strong>L'offre de travail sur l'île (slides 21-27).</strong> Avec{" "}
              <M tex="U = c + a\ln l" />, la tangence <M tex="a/l = s(1-t)" /> donne{" "}
              <M tex="l^*_H = \tfrac{a}{s_H(1-t)}" /> et <M tex="l^*_B = \tfrac{a}{s_B(1-t)}" />,
              valables tant que <M tex="t \le 1 - a/s_B" /> (sinon solution en coin{" "}
              <M tex="l^* = 1" />
              ). La taxe réduit <em>toujours</em> le travail ; le montant reçu{" "}
              <M tex="M(t)" /> ne le change pas (préférences quasi-linéaires :{" "}
              <M tex="U_{mc} = 1" />
              ).
            </>,
            <>
              <strong>La courbe de Laffer (slides 22, 28-29).</strong> Chacun reçoit{" "}
              <M tex="M(t) = \tfrac{T(t)}{N} = \tfrac{(s_H+s_B)\,t}{2} - \tfrac{a\,t}{1-t}" /> : la
              recette « si personne ne réagissait » moins la recette perdue parce que chacun
              travaille moins. <M tex="M(0) = M(1) = 0" />, avec un sommet en{" "}
              <M tex="t^*_M" />. La taxe réduit toujours le travail ; au-delà de{" "}
              <M tex="t^*_M" />, cet effet l'emporte et les recettes baissent — alors que tout le
              monde travaille encore.
            </>,
            <>
              <strong>Ce que chacun obtient (slides 30-36).</strong> <M tex="c^*" /> = revenu du
              travail + <M tex="M(t)" />, et <M tex="U(t) = c^*(t) + a\ln l^*(t)" />.{" "}
              <M tex="U_H(t)" /> baisse dès qu'on taxe ; <M tex="U_B(t)" /> monte jusqu'à{" "}
              <M tex="t^*_{U_B}" /> puis baisse, avec <M tex="t^*_{U_B} < t^*_M" />. Le
              gouvernement choisit <M tex="t^*" /> selon son objectif : A (somme des utilités), B
              (utilité des bas salaires, d'où <M tex="t^*_{U_B}" />
              ) ou C (autre).
            </>,
            <>
              <strong>La domination de Pareto (slides 37-39).</strong> <M tex="x" /> domine{" "}
              <M tex="y" /> si <M tex="U_i(x_i) \ge U_i(y_i)" /> pour tous et{" "}
              <M tex="U_j(x_j) > U_j(y_j)" /> pour au moins un. Sur l'île, tout{" "}
              <M tex="t > t^*_{U_B}" /> est dominé par <M tex="t^*_{U_B}" />, et aucun{" "}
              <M tex="t \le t^*_{U_B}" /> n'est dominé. Pareto écarte les taxes trop élevées ;
              choisir entre <M tex="0" /> et <M tex="t^*_{U_B}" /> est un jugement de valeur.
            </>,
            <>
              <strong>L'efficacité de Pareto (slides 40-43).</strong> Une allocation est efficace
              si aucune autre allocation faisable ne la domine.{" "}
              <strong>Attention : efficace ≠ égalitaire.</strong> (0, 0, 10) est efficace, (3, 3,
              3) ne l'est pas (dominée par (3, 3, 4)). Deux conditions <em>suffisantes</em> : un
              individu la préfère strictement à toutes les autres, ou elle maximise la somme des
              utilités.
            </>,
          ]}
        />

        <GroupTitle>Approche comportementale — le choix réel</GroupTitle>
        <MustKnow
          start={11}
          items={[
            <>
              <strong>Le principe (slide 16).</strong> Une décision rationnelle n'est pas
              influencée par des <em>variables non pertinentes</em> (qui n'influencent pas les
              alternatives). Les Humains, eux, dévient — dans une direction{" "}
              <em>prédictible</em>. Méthode A/B : deux groupes tirés au hasard, donc semblables ;
              des Econos donneraient le même pourcentage, donc un écart = une déviation (réponse
              type en 4 étapes).
            </>,
            <>
              <strong>Utilité de transaction (slides 2-6).</strong> La{" "}
              <em>comptabilité mentale</em> (théorie alternative) : toute dépense combine une
              utilité d'acquisition/consommation et une <em>utilité de transaction</em> (prix de
              référence vs prix payé).{" "}
              <em>Calculatrice : 82 % vs 25 % ; bière : 4,72 € (hôtel de luxe) vs 3,61 € (supermarché).</em>
            </>,
            <>
              <strong>Coûts irrécupérables (slides 7-8).</strong> On tient compte d'un argent déjà
              perdu quoi qu'on décide, alors qu'il est non pertinent.{" "}
              <em>
                Cinéma : 52 % quittent la séance payante vs 61 % la séance gratuite ; guerre
                poursuivie pour que les soldats ne soient pas morts « en vain ».
              </em>
            </>,
            <>
              <strong>Effet de dotation (slides 9-13).</strong> Disposition à payer {"<"}{" "}
              disposition à accepter : on demande plus pour se séparer d'un bien qu'on ne paierait
              pour l'acheter.{" "}
              <em>
                Ticket : 35 % achètent (65 % n'achètent pas) vs 50 % gardent ; antidote :
                127 018 € vs 437 857 €.
              </em>
            </>,
            <>
              <strong>Framing (slides 14-15).</strong> La formulation (aspect positif « sauver »
              ou négatif « mourir » mis en avant) renverse le choix entre options identiques.{" "}
              <em>Maladie : 100 % vs 39 % choisissent l'option sûre.</em>
            </>,
            <>
              <strong>Rationnel vs comportemental (slides 17-18).</strong> Prescriptif (les
              Econos) vs descriptif (les Humains). On <em>garde</em> le rationnel : guide,
              benchmark, et bonne approximation fréquente.
            </>,
            <>
              <strong>Hors du labo (slides 20-21).</strong>{" "}
              <em>Taximans de New York (Camerer, 1997)</em> : l'heuristique de la cible de revenus
              les fait travailler moins d'heures les jours où le salaire horaire est élevé (en
              labo, 94 % des étudiants choisissent l'inverse). <em>Crèches de Haïfa</em> : l'amende
              a augmenté les retards — les incitants matériels peuvent évincer les incitants
              intrinsèques.
            </>,
            <>
              <strong>Politiques comportementales — nudging (slides 19, 22-23).</strong> Le 3ᵉ
              volet de la recherche (après les deux premiers : documenter les déviations, montrer
              leur impact réel)&nbsp;: aider les gens à éviter leurs erreurs.{" "}
              <em>
                EITC (Bhargava et Manoli, 2015) : 2ᵉ courrier identique 22 % ; mention de l'ordre
                de grandeur du montant 30 % (le plus efficace, +8 points) ; présentation
                simplifiée : 2ᵉ traitement le plus efficace.
              </em>
            </>,
          ]}
        />

        <p className="mt-4 text-sm text-muted-foreground">
          Note : les pourcentages et montants des sondages sont ceux des slides (expériences
          réalisées auprès d'étudiants). Les chiffres de l'île (<M tex="s_H = 5" />,{" "}
          <M tex="s_B = 3" />, <M tex="a = 0{,}5" />) sont illustratifs : les animations tracent les
          vraies formules du modèle (slides 25-31), mais à l'examen, garde les formules en lettres.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* ✎ — Exercices corrigés                                        */}
      {/* ============================================================ */}
      <Section id="exos" kicker="✎" title="Exercices corrigés">
        <p className="text-[1.15rem] leading-relaxed">
          Dix exercices pour vérifier que tout est solide. Pour les QCM, choisis une réponse et
          vérifie. Pour les calculs, cherche d'abord sur brouillon, puis déroule la correction
          étape par étape.
        </p>

        {/* Exercice 1 — QCM positif/normatif */}
        <Quiz
          scope="a1"
          id="q11"
          kicker="Exercice 1 · QCM — positif ou normatif"
          question={
            <>
              « Une taxe de 50 % ferait baisser le nombre d'heures travaillées de 12 %. » Cette
              affirmation relève de l'analyse…
            </>
          }
          options={[
            {
              text: <>positive (elle prédit un fait)</>,
              correct: true,
              explain: (
                <>
                  Correct ! C'est une prédiction de fait (ce qui <em>se passe</em>), sans jugement
                  de valeur — le cœur de l'analyse positive, produite par le modèle. Une
                  affirmation normative dirait plutôt « cette taxe est trop élevée » ou « il faut
                  la baisser ».
                </>
              ),
            },
            {
              text: <>normative (elle juge ce qui est souhaitable)</>,
              explain: (
                <>
                  Non : aucune trace de jugement de valeur ici. La phrase prédit un effet chiffré,
                  vrai ou faux selon les faits — c'est du positif.
                </>
              ),
            },
            {
              text: <>ni l'une ni l'autre</>,
              explain: (
                <>
                  Toute affirmation économique de ce type se classe : ici, c'est une prédiction
                  factuelle → analyse positive.
                </>
              ),
            },
          ]}
        />

        {/* Exercice 2 — Lagrangien complet */}
        <ExerciseBlock
          scope="a1"
          id="ex1"
          number={2}
          title="Calcul · l'optimum par le Lagrangien"
          difficulty={2}
          refs={[{ chapter: "a1", section: "optim" }]}
          statement={
            <>
              <p>
                Un consommateur a pour utilité <M tex="U(x_1, x_2) = x_1 \cdot x_2" />. Les prix
                sont <M tex="p_1 = 2" /> et <M tex="p_2 = 4" />, le revenu <M tex="m = 40" />.
                Trouve le panier optimal <M tex="(x_1^*, x_2^*)" />, puis la valeur du
                multiplicateur <M tex="\lambda" /> et ce qu'elle signifie.
              </p>
            </>
          }
          steps={[
            {
              title: "Le Lagrangien",
              content: (
                <>
                  <p>Utilité moins λ fois (dépense − revenu) :</p>
                  <MB tex="\mathcal{L}(x_1, x_2, \lambda) = x_1 x_2 - \lambda\,(2x_1 + 4x_2 - 40)" />
                </>
              ),
            },
            {
              title: "Les trois conditions de premier ordre",
              content: (
                <>
                  <p>
                    On dérive par rapport à chaque variable, en traitant les deux autres comme des
                    constantes, et on annule :
                  </p>
                  <MB tex="\begin{aligned} (1)\quad \frac{\partial \mathcal{L}}{\partial x_1} &= x_2 - 2\lambda = 0 \\ (2)\quad \frac{\partial \mathcal{L}}{\partial x_2} &= x_1 - 4\lambda = 0 \\ (3)\quad \frac{\partial \mathcal{L}}{\partial \lambda} &= -(2x_1 + 4x_2 - 40) = 0 \end{aligned}" />
                  <p>
                    Dans (1), la dérivée de <M tex="x_1x_2" /> par rapport à <M tex="x_1" /> est{" "}
                    <M tex="x_2" /> : c'est l'utilité marginale <M tex="U_{m1}" />. De même,{" "}
                    <M tex="U_{m2} = x_1" />. Donc (1) et (2) disent{" "}
                    <M tex="U_{m1} = \lambda p_1" /> et <M tex="U_{m2} = \lambda p_2" /> ; (3) est
                    l'épuisement du revenu.
                  </p>
                </>
              ),
            },
            {
              title: "La condition de tangence",
              content: (
                <>
                  <p>On divise (1) par (2) : les λ se simplifient, et il reste TMS = rapport des prix :</p>
                  <MB tex="\frac{U_{m1}}{U_{m2}} = \frac{p_1}{p_2} \;\;\Longrightarrow\;\; \frac{x_2}{x_1} = \frac{2}{4} = \frac{1}{2}" />
                  <p>
                    Donc <strong><M tex="x_1 = 2\,x_2" /></strong>.
                  </p>
                </>
              ),
            },
            {
              title: "L'épuisement du revenu",
              content: (
                <>
                  <p>
                    On injecte dans la contrainte <M tex="p_1 x_1 + p_2 x_2 = m" /> :
                  </p>
                  <MB tex="2\,(2x_2) + 4x_2 = 40 \;\Rightarrow\; 4x_2 + 4x_2 = 40 \;\Rightarrow\; 8x_2 = 40" />
                </>
              ),
            },
            {
              title: "Résultat et vérification",
              content: (
                <>
                  <p>
                    <M tex="x_2^* = 5" />, et donc <M tex="x_1^* = 2 \times 5 = 10" />.
                  </p>
                  <p>
                    Vérification du coût : <M tex="2 \times 10 + 4 \times 5 = 20 + 20 = 40 = m" />{" "}
                    ✓ — le revenu est bien tout dépensé.
                  </p>
                </>
              ),
            },
            {
              title: "Et λ ?",
              content: (
                <>
                  <p>
                    L'équation (1) donne <M tex="\lambda = U_{m1}/p_1 = x_2^*/2 = 5/2 = 2{,}5" />.
                    Contrôle avec (2) : <M tex="\lambda = x_1^*/4 = 10/4 = 2{,}5" /> ✓.
                  </p>
                  <p>
                    <strong>Sens</strong> (slide 18) : <M tex="\lambda" /> est l'
                    <strong>utilité marginale du revenu</strong>. Vérifions-le : avec{" "}
                    <M tex="m = 40" />, <M tex="U^* = 10 \times 5 = 50" />. Avec un euro de plus (
                    <M tex="m = 41" />
                    ), le même calcul donne <M tex="x_1^* = 10{,}25" /> et{" "}
                    <M tex="x_2^* = 5{,}125" />, donc <M tex="U^* \approx 52{,}53" /> : l'utilité
                    monte d'environ 2,5 — c'est bien <M tex="\lambda" />. (Pas exactement 2,5 :{" "}
                    <M tex="\lambda" /> mesure le gain pour un tout petit supplément de revenu.)
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              Le panier optimal est <strong>(10, 5)</strong> et <strong>λ = 2,5</strong> : un euro
              de revenu en plus rapporte environ 2,5 unités d'utilité. Retiens la mécanique :
              Lagrangien → trois conditions de premier ordre → tangence (TMS = rapport des prix) →
              épuisement du revenu → on résout, puis λ.
            </p>
          }
        />

        {/* Exercice 3 — réaction à la taxe */}
        <ExerciseBlock
          scope="a1"
          id="ex2"
          number={3}
          title="Calcul · réaction à la taxe"
          difficulty={2}
          refs={[{ chapter: "a1", section: "redistrib" }]}
          statement={
            <>
              <p>
                Avec les préférences de l'île <M tex="U = c + a \ln l" />, le loisir optimal est{" "}
                <M tex="l^*(t) = \dfrac{a}{s(1-t)}" /> (slide 25), avec une dotation en temps{" "}
                <M tex="L = 1" />. Prends le travailleur seul de l'approche rationnelle (§ 2 et § 5) :{" "}
                <M tex="a = 0{,}5" /> et <M tex="s = 2" />. <strong>(a)</strong> Quel est le temps
                de travail pour <M tex="t = 0{,}5" /> ? <strong>(b)</strong> Et pour{" "}
                <M tex="t = 0{,}75" /> ? <strong>(c)</strong> Que donne la formule pour{" "}
                <M tex="t = 0{,}9" />, et que fait vraiment le travailleur ? Qu'observe-t-on ?
              </p>
            </>
          }
          steps={[
            {
              title: "Rappel",
              content: (
                <p>
                  Le travail offert = temps total − loisir = <M tex="1 - l^*(t)" />.
                </p>
              ),
            },
            {
              title: "(a) Pour t = 0,5",
              content: (
                <>
                  <MB tex="l^* = \frac{0{,}5}{2\,(1-0{,}5)} = \frac{0{,}5}{1} = 0{,}5" />
                  <p>
                    Donc travail = <M tex="1 - 0{,}5 = \mathbf{0{,}5}" /> (il travaille la moitié
                    de son temps).
                  </p>
                </>
              ),
            },
            {
              title: "(b) Pour t = 0,75",
              content: (
                <>
                  <MB tex="l^* = \frac{0{,}5}{2\,(1-0{,}75)} = \frac{0{,}5}{0{,}5} = 1" />
                  <p>
                    Donc travail = <M tex="1 - 1 = \mathbf{0}" /> (il ne travaille plus du tout !).
                    Ce <M tex="t = 0{,}75" /> est <strong>exactement la borne</strong> de validité
                    de la formule : <M tex="l^* \le 1 \iff t \le 1 - a/s = 1 - 0{,}25 = 0{,}75" />.
                  </p>
                </>
              ),
            },
            {
              title: "(c) Pour t = 0,9 : la solution en coin",
              content: (
                <>
                  <MB tex="\frac{0{,}5}{2\,(1-0{,}9)} = \frac{0{,}5}{0{,}2} = 2{,}5 \;>\; 1" />
                  <p>
                    Impossible : on ne peut pas prendre 2,5 unités de loisir quand on n'en a que{" "}
                    <M tex="L = 1" />. Au-delà de la borne, la tangence ne s'applique plus : le
                    travailleur prend <strong>tout</strong> son temps en loisir,{" "}
                    <M tex="l^* = 1" /> (solution en coin), et travaille 0.
                  </p>
                </>
              ),
            },
            {
              title: "Observation",
              content: (
                <p>
                  Plus la taxe monte, plus le salaire net <M tex="s(1-t)" /> baisse, plus le loisir
                  augmente et donc <strong>moins on travaille</strong> — et ce, dès la première
                  hausse (travail 0,75 à <M tex="t = 0" />, 0,5 à <M tex="t = 0{,}5" />
                  ). Attention au lien avec Laffer : la recette ne baisse pas seulement quand plus
                  personne ne travaille. C'est la <strong>baisse progressive du travail</strong>, à
                  chaque hausse de <M tex="t" />, qui finit par faire baisser la recette après le
                  sommet <M tex="t^*_M" /> — alors que tout le monde travaille encore.
                </p>
              ),
            },
          ]}
          result={
            <p>
              (a) travail = 0,5 ; (b) travail = 0 (t = 0,75 est pile la borne 1 − a/s) ; (c) la
              formule donne 2,5 &gt; 1 : en réalité l* = 1 (solution en coin). La taxe réduit
              toujours le travail ; au-delà de <M tex="t^*_M" />, cet effet l'emporte et la recette
              de Laffer baisse.
            </p>
          }
        />

        {/* Exercice 4 — l'île en chiffres, puis Pareto */}
        <ExerciseBlock
          scope="a1"
          id="ex4"
          number={4}
          title="Calcul · l'île en chiffres, puis Pareto"
          difficulty={3}
          refs={[
            { chapter: "a1", section: "redistrib" },
            { chapter: "a1", section: "pareto" },
          ]}
          statement={
            <>
              <p>
                Sur l'île (slide 21), la moitié des travailleurs a un haut salaire brut{" "}
                <M tex="s_H = 5" />, l'autre moitié un bas salaire brut <M tex="s_B = 3" />. Tous
                ont <M tex="L = 1" /> et <M tex="U(l, c) = c + 0{,}5 \ln l" /> (donc{" "}
                <M tex="a = 0{,}5" />
                ). L'État prélève une taxe <M tex="t" /> sur le revenu brut du travail et reverse
                la recette en parts égales.
              </p>
              <p>
                <strong>(a)</strong> Pour <M tex="t = 0{,}3" />, calcule <M tex="l^*_H" /> et{" "}
                <M tex="l^*_B" />, et vérifie que la formule s'applique.{" "}
                <strong>(b)</strong> Calcule le montant reçu par chacun, <M tex="M(0{,}3)" />.{" "}
                <strong>(c)</strong> Calcule <M tex="U_H(0{,}3)" /> et <M tex="U_B(0{,}3)" />.{" "}
                <strong>(d)</strong> À <M tex="t = 0{,}8" />, on trouve de la même façon{" "}
                <M tex="U_H \approx 1{,}353" /> et <M tex="U_B \approx 1{,}209" />. Explique
                pourquoi <M tex="t = 0{,}8" /> est dominé au sens de Pareto.
              </p>
            </>
          }
          steps={[
            {
              title: "(a) Le loisir optimal",
              content: (
                <>
                  <p>
                    La tangence donne <M tex="l^* = a/(s(1-t))" /> (slide 25), valable tant que{" "}
                    <M tex="t \le 1 - a/s_B = 1 - 0{,}5/3 \approx 0{,}833" />. Ici{" "}
                    <M tex="t = 0{,}3" /> : c'est bon.
                  </p>
                  <MB tex="\begin{aligned} l^*_H &= \frac{0{,}5}{5 \times 0{,}7} = \frac{1}{7} \approx 0{,}143 \\ l^*_B &= \frac{0{,}5}{3 \times 0{,}7} = \frac{5}{21} \approx 0{,}238 \end{aligned}" />
                  <p>
                    Ils travaillent donc <M tex="6/7 \approx 0{,}857" /> et{" "}
                    <M tex="16/21 \approx 0{,}762" />. Les bas salaires prennent plus de loisir :
                    pour eux, une heure de loisir coûte moins cher (2,1 au lieu de 3,5).
                  </p>
                </>
              ),
            },
            {
              title: "(b) Le montant redistribué",
              content: (
                <>
                  <p>
                    <strong>Par la recette (slide 22).</strong> Un haut salaire paie{" "}
                    <M tex="t\,s_H(1-l^*_H) = 0{,}3 \times 5 \times 6/7 \approx 1{,}286" />, un bas
                    salaire <M tex="0{,}3 \times 3 \times 16/21 \approx 0{,}686" />. Comme il y a
                    autant de chaque type, chacun reçoit la moyenne :{" "}
                    <M tex="(1{,}286 + 0{,}686)/2 \approx 0{,}986" />.
                  </p>
                  <p>
                    <strong>Par la formule (slide 28)</strong>, pour contrôler :
                  </p>
                  <MB tex="\begin{aligned} M(0{,}3) &= \frac{8 \times 0{,}3}{2} - \frac{0{,}5 \times 0{,}3}{0{,}7} \\ &= 1{,}2 - 0{,}214 \approx 0{,}986 \end{aligned}" />
                </>
              ),
            },
            {
              title: "(c) Consommation et utilité",
              content: (
                <>
                  <p>
                    Revenu du travail : <M tex="s(1-t)(1-l^*) = s(1-t) - a" /> (car{" "}
                    <M tex="s(1-t)\,l^* = a" />
                    ), soit <M tex="3{,}5 - 0{,}5 = 3" /> pour H et{" "}
                    <M tex="2{,}1 - 0{,}5 = 1{,}6" /> pour B. On ajoute <M tex="M" /> (slide 30) :
                  </p>
                  <MB tex="\begin{aligned} c^*_H &\approx 3 + 0{,}986 = 3{,}986 \\ c^*_B &\approx 1{,}6 + 0{,}986 = 2{,}586 \end{aligned}" />
                  <p>Puis l'utilité <M tex="U = c^* + 0{,}5 \ln l^*" /> (slide 31) :</p>
                  <MB tex="\begin{aligned} U_H &\approx 3{,}986 + 0{,}5 \ln(1/7) \\ &\approx 3{,}986 - 0{,}973 = 3{,}013 \\[6pt] U_B &\approx 2{,}586 + 0{,}5 \ln(5/21) \\ &\approx 2{,}586 - 0{,}718 = 1{,}868 \end{aligned}" />
                </>
              ),
            },
            {
              title: "(d) Pourquoi t = 0,8 est dominé",
              content: (
                <>
                  <p>
                    (Les chiffres de l'énoncé se retrouvent de la même façon :{" "}
                    <M tex="l^*_H = 0{,}5" />, <M tex="l^*_B = 5/6" /> — encore valable, car{" "}
                    <M tex="0{,}8 \le 0{,}833" /> —, <M tex="M = 1{,}2" />,{" "}
                    <M tex="c^*_H = 1{,}7" /> et <M tex="c^*_B = 1{,}3" />.)
                  </p>
                  <p>
                    Compare avec <M tex="t = 0{,}3" /> : <M tex="3{,}013 > 1{,}353" /> pour les
                    hauts salaires <em>et</em> <M tex="1{,}868 > 1{,}209" /> pour les bas salaires.
                    Les deux groupes sont strictement mieux à <M tex="t = 0{,}3" /> : par la
                    définition du slide 37, <strong><M tex="t = 0{,}3" /> domine{" "}
                    <M tex="t = 0{,}8" /></strong>.
                  </p>
                  <p>
                    Surprise : à <M tex="t = 0{,}8" />, chacun reçoit <em>plus</em> d'argent (
                    <M tex="M = 1{,}2" /> contre 0,986). Mais le salaire net des bas salaires
                    s'effondre (0,6 par heure au lieu de 2,1) : leur revenu du travail tombe de 1,6
                    à 0,1, et ils travaillent beaucoup moins. Le transfert ne compense pas.
                  </p>
                  <p>
                    C'est la règle du slide 39 : ici <M tex="t^*_{U_B} = 0{,}5" />, et{" "}
                    <strong>
                      tout <M tex="t > t^*_{U_B}" /> est dominé par <M tex="t^*_{U_B}" />
                    </strong>{" "}
                    (à 0,5 : <M tex="U_H \approx 2{,}695" />, <M tex="U_B \approx 1{,}951" />, mieux
                    pour les deux qu'à 0,8).
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              (a) <M tex="l^*_H = 1/7 \approx 0{,}143" />, <M tex="l^*_B = 5/21 \approx 0{,}238" /> ;
              (b) <M tex="M(0{,}3) \approx 0{,}986" /> ; (c) <M tex="U_H \approx 3{,}013" />,{" "}
              <M tex="U_B \approx 1{,}868" /> ; (d) <M tex="t = 0{,}3" /> (et aussi{" "}
              <M tex="t^*_{U_B} = 0{,}5" />
              ) donne plus aux <strong>deux</strong> groupes : <M tex="t = 0{,}8" /> est
              Pareto-dominé, comme tout <M tex="t > t^*_{U_B}" />.
            </p>
          }
        />

        {/* Exercice 5 — QCM Pareto */}
        <Quiz
          scope="a1"
          id="q12"
          kicker="Exercice 5 · QCM — efficacité de Pareto"
          question={
            <>
              On partage 10 unités entre 3 personnes (chacune ne pense qu'à sa propre
              consommation). Parmi ces allocations, laquelle est <strong>efficace</strong> au sens
              de Pareto ?
            </>
          }
          options={[
            {
              text: <>(2, 2, 2)</>,
              explain: (
                <>
                  Elle gaspille 4 unités : (2, 2, 6) la domine (personne ne perd, un gagne). Donc
                  pas efficace.
                </>
              ),
            },
            {
              text: <>(3, 3, 3)</>,
              explain: (
                <>
                  Elle gaspille 1 unité : (3, 3, 4) la domine. Égalitaire, oui — efficace, non.
                </>
              ),
            },
            {
              text: <>(2, 3, 5)</>,
              correct: true,
              explain: (
                <>
                  Correct ! Les 10 unités sont toutes distribuées : impossible d'améliorer l'un
                  sans retirer à un autre. Rappel : efficace ne veut PAS dire égalitaire.
                </>
              ),
            },
            {
              text: <>(5, 5, 5)</>,
              explain: (
                <>
                  15 unités alors qu'on n'en a que 10 : allocation non faisable — la question de
                  l'efficacité ne se pose même pas.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Test rapide : une allocation qui laisse des unités non distribuées est toujours
              dominée (on peut donner le reste à quelqu'un sans léser personne) ; une allocation
              infaisable est hors-jeu.
            </>
          }
        />

        {/* Exercice 6 — domination, raisonnement */}
        <ExerciseBlock
          scope="a1"
          id="ex3"
          number={6}
          title="Raisonnement · domination et efficacité"
          difficulty={1}
          refs={[{ chapter: "a1", section: "pareto" }]}
          statement={
            <>
              <p>
                L'allocation (3, 3, 3) <em>domine</em>-t-elle l'allocation (1, 1, 1) au sens de
                Pareto ? Et l'allocation (3, 3, 3) est-elle efficace ? (utilités = consommation,
                total disponible = 10)
              </p>
            </>
          }
          steps={[
            {
              title: "Domination ?",
              content: (
                <p>
                  Oui. En passant de (1, 1, 1) à (3, 3, 3), <em>les trois</em> personnes gagnent
                  (3 {">"} 1 pour chacune). « Tous au moins aussi bien + au moins un strictement
                  mieux » : la définition de la domination est satisfaite.{" "}
                  <strong>(3, 3, 3) domine bien (1, 1, 1).</strong>
                </p>
              ),
            },
            {
              title: "Efficace ?",
              content: (
                <p>
                  Non ! (3, 3, 3) n'utilise que 9 unités sur 10. Il reste 1 unité : l'allocation
                  (3, 3, 4) la domine (personne ne perd, un gagne). Donc (3, 3, 3){" "}
                  <strong>n'est pas efficace</strong>.
                </p>
              ),
            },
            {
              title: "La leçon",
              content: (
                <p>
                  Une allocation peut <em>dominer</em> une autre tout en n'étant <em>pas efficace</em>{" "}
                  elle-même. Dominer = « mieux que cette allocation-ci ». Efficace = « impossible de
                  faire mieux pour tous ». Ce sont deux choses différentes.
                </p>
              ),
            },
          ]}
          result={
            <p>
              (3, 3, 3) domine (1, 1, 1) <em>mais</em> n'est pas efficace. La domination compare
              deux allocations ; l'efficacité teste une allocation contre <em>toutes</em> les
              alternatives faisables.
            </p>
          }
        />

        {/* Exercice 7 — le slide 43, version rédigée */}
        <ExerciseBlock
          scope="a1"
          id="ex5"
          number={7}
          title="Rédaction · efficacité et modélisation (slide 43)"
          difficulty={2}
          refs={[{ chapter: "a1", section: "pareto" }]}
          statement={
            <>
              <p>
                Quatre politiques passent dans le modèle (analyse positive) et produisent quatre
                allocations. Jean, Omar et Maria classent ces allocations (analyse normative), de
                la préférée à la moins aimée. Seules ces quatre allocations sont faisables.
              </p>
              <Figure
                caption={
                  <>
                    <strong>Le schéma du slide 43.</strong> Quatre politiques, un modèle, quatre
                    allocations à juger.
                  </>
                }
              >
                <FigMethode inputs={["Policy 1", "Policy 2", "Policy 3", "Policy 4"]} />
              </Figure>
              <MiniTbl
                head={["Rang", "Jean", "Omar", "Maria"]}
                rows={[
                  ["1ᵉʳ", "Alloc. 1", "Alloc. 1", "Alloc. 2"],
                  ["2ᵉ", "Alloc. 2", "Alloc. 3", "Alloc. 1"],
                  ["3ᵉ", "Alloc. 3", "Alloc. 2", "Alloc. 3"],
                  ["4ᵉ", "Alloc. 4", "Alloc. 4", "Alloc. 4"],
                ]}
              />
              <p>
                <strong>(a)</strong> Quelles allocations sont efficaces au sens de Pareto ?
                Lesquelles sont dominées, et par quelle(s) allocation(s) ? Rédige ta réponse comme
                à l'examen. <strong>(b)</strong> Que changerait le fait que Maria classe{" "}
                <M tex="1 \succ 2 \succ 3 \succ 4" /> ?
              </p>
            </>
          }
          steps={[
            {
              title: "La règle à appliquer",
              content: (
                <p>
                  Personne n'est indifférent entre deux allocations. Donc <M tex="x" /> domine{" "}
                  <M tex="y" /> si et seulement si <strong>les trois</strong> classent{" "}
                  <M tex="x" /> avant <M tex="y" /> (slide 37). Une seule personne qui préfère{" "}
                  <M tex="y" /> suffit à empêcher la domination.
                </p>
              ),
            },
            {
              title: "Les six comparaisons deux à deux",
              content: (
                <>
                <p>
                  Colonne du milieu : l'allocation que Jean, Omar et Maria (dans cet ordre)
                  préfèrent dans la paire.
                </p>
                <MiniTbl
                  head={["Paire", "Jean · Omar · Maria", "Verdict"]}
                  rows={[
                    ["1 et 2", "1 · 1 · 2", "incomparables"],
                    ["1 et 3", "1 · 1 · 1", <strong key="v">1 domine 3</strong>],
                    ["1 et 4", "1 · 1 · 1", <strong key="v">1 domine 4</strong>],
                    ["2 et 3", "2 · 3 · 2", "incomparables"],
                    ["2 et 4", "2 · 2 · 2", <strong key="v">2 domine 4</strong>],
                    ["3 et 4", "3 · 3 · 3", <strong key="v">3 domine 4</strong>],
                  ]}
                />
                </>
              ),
            },
            {
              title: "Qui est efficace ?",
              content: (
                <p>
                  Efficace = dominée par <em>aucune</em> allocation faisable (slide 40). 1 n'est
                  dominée par aucune allocation (Maria lui préfère 2, mais Jean et Omar préfèrent 1) : 1 est{" "}
                  <strong>efficace</strong>. 2 non plus (Jean et Omar lui préfèrent 1, mais Maria
                  préfère 2 ; Omar lui préfère 3, mais Jean et Maria préfèrent 2) : 2 est{" "}
                  <strong>efficace</strong>. 3 est dominée par 1, 4 par 1, 2 et 3 : elles ne sont
                  pas efficaces. Raccourci (condition suffisante 1, slide 41) : Jean préfère
                  strictement 1 à tout le reste, Maria préfère strictement 2 à tout le reste.
                </p>
              ),
            },
            {
              title: "(a) La réponse rédigée",
              content: (
                <p className="rounded-xl border-l-4 border-primary bg-accent/40 px-3 py-2">
                  « Une allocation <M tex="x" /> domine <M tex="y" /> si chacun la trouve au moins
                  aussi bonne et si au moins une personne la préfère strictement. Les trois
                  individus classent 1 avant 3 : 1 domine 3. Ils classent tous 4 en dernier : 4 est
                  dominée par 1, 2 et 3. En revanche, 1 et 2 ne sont dominées par aucune
                  allocation : Maria préfère 2 à 1 alors que Jean et Omar préfèrent 1 à 2, et Omar
                  préfère 3 à 2 alors que Jean et Maria préfèrent 2 à 3. Les allocations 1 et 2
                  sont donc efficaces au sens de Pareto ; 3 et 4 ne le sont pas. »
                </p>
              ),
            },
            {
              title: "(b) Si Maria classait 1 ≻ 2 ≻ 3 ≻ 4",
              content: (
                <p>
                  Alors les trois mettent 1 en premier : 1 domine 2, 3 et 4. Seule 1 reste
                  efficace (2 et 3 restent incomparables entre elles, mais 1 les domine toutes
                  les deux). Leçon : l'efficacité dépend des préférences de <em>tous</em>. Quand
                  les gens divergent (1 contre 2 dans l'énoncé), Pareto laisse plusieurs
                  allocations efficaces, et choisir entre elles demande un jugement de valeur.
                </p>
              ),
            },
          ]}
          result={
            <p>
              (a) <strong>1 et 2 efficaces</strong> ; 3 dominée par 1 ; 4 dominée par 1, 2 et 3
              (le slide ne cite que 3 et 1, mais 2 la domine aussi). (b) Seule 1 serait efficace.
            </p>
          }
        />

        {/* Exercice 8 — QCM biais */}
        <Quiz
          scope="a1"
          id="q13"
          kicker="Exercice 8 · QCM — quel biais ?"
          question={
            <>
              Marc a un abonnement de salle de sport à 50 €/mois qu'il n'utilise quasiment jamais.
              Il refuse de le résilier en disant : « j'ai déjà payé tellement de mois, ce serait du
              gâchis d'arrêter maintenant. » Quel biais ?
            </>
          }
          options={[
            {
              text: <>Effet de dotation</>,
              explain: (
                <>
                  Non : l'effet de dotation concerne l'écart entre disposition à payer et à
                  accepter pour un bien qu'on possède. Ici, c'est l'argent <em>déjà dépensé</em>{" "}
                  qui pèse sur la décision.
                </>
              ),
            },
            {
              text: <>Coûts irrécupérables</>,
              correct: true,
              explain: (
                <>
                  Oui : Marc laisse de l'argent DÉJÀ dépensé (et irrécupérable) dicter sa décision
                  future. La vraie question est : « à partir de maintenant, est-ce que 50 €/mois en
                  valent la peine pour moi ? » — et la réponse est clairement non. Les mois passés
                  sont perdus quoi qu'il décide.
                </>
              ),
            },
            {
              text: <>Framing</>,
              explain: (
                <>
                  Non : personne n'a décrit les options de Marc en mettant en avant leur aspect
                  positif ou négatif. C'est le passé déjà payé qui influence sa décision.
                </>
              ),
            },
            {
              text: <>Utilité de transaction</>,
              explain: (
                <>
                  Non : aucun prix de référence ni « bonne affaire » ici. Le problème est que Marc
                  raisonne sur des sommes déjà perdues.
                </>
              ),
            },
          ]}
        />

        {/* Exercice 9 — QCM biais 2 */}
        <Quiz
          scope="a1"
          id="q14"
          kicker="Exercice 9 · QCM — quel biais ?"
          question={
            <>
              Une mutuelle vante un dépistage en disant «{" "}
              <strong>98 % des patients sont rassurés</strong> » plutôt que « 2 % reçoivent un
              résultat inquiétant ». Quel biais exploite-t-elle ?
            </>
          }
          options={[
            {
              text: <>Coûts irrécupérables</>,
              explain: <>Non : aucune dépense passée n'entre en jeu ici.</>,
            },
            {
              text: <>Effet de dotation</>,
              explain: <>Non : il n'est pas question de posséder ou de vendre un bien.</>,
            },
            {
              text: <>Framing</>,
              correct: true,
              explain: (
                <>
                  Oui : « 98 % rassurés » et « 2 % inquiétés » décrivent exactement la même
                  réalité, mais la formulation positive donne une perception plus favorable. C'est
                  le framing (cadrage) : la manière de dire change la décision, pas le fond.
                </>
              ),
            },
            {
              text: <>Aucun, c'est rationnel</>,
              explain: (
                <>
                  Un être rationnel réagirait pareil aux deux formulations (variable
                  non-pertinente). Si la formulation change la perception, c'est bien un biais — le
                  framing.
                </>
              ),
            },
          ]}
        />

        {/* Exercice 10 — rédiger une déviation (slides 2-4) */}
        <ExerciseBlock
          scope="a1"
          id="ex6"
          number={10}
          title="Rédaction · pourquoi est-ce une déviation ?"
          difficulty={2}
          refs={[
            { chapter: "a1", section: "comporte" },
            { chapter: "a1", section: "transaction" },
          ]}
          statement={
            <>
              <p>
                L'expérience de pensée du slide 2 a été posée à deux groupes{" "}
                <strong>différents</strong> d'étudiants :
              </p>
              <ul className="my-2 list-disc space-y-1.5 pl-6">
                <li>
                  <strong>Version A.</strong> Tu es sur le point d'acheter une calculatrice à 15 €.
                  Le vendeur t'apprend que la même calculatrice coûte 10 € seulement dans un
                  magasin à vingt minutes à pied. Fais-tu le trajet ?
                </li>
                <li>
                  <strong>Version B.</strong> Même histoire, mais la calculatrice coûte 200 € ici
                  et 195 € là-bas.
                </li>
              </ul>
              <p>
                Résultats : <strong>82 %</strong> des étudiants (version A) contre{" "}
                <strong>25 %</strong> (version B) disent que le déplacement vaut la peine.
              </p>
              <p>
                <strong>Question (slide 3) :</strong> pourquoi est-ce que le plus fort pourcentage
                dans la version A est une déviation par rapport à la prise de décision rationnelle ?
                Réponds avec la réponse type en 4 étapes.
              </p>
            </>
          }
          steps={[
            {
              title: "① La vraie question",
              content: (
                <p>
                  Dans les deux versions, la différence entre les deux alternatives est la même :{" "}
                  <strong>es-tu prêt à marcher vingt minutes pour économiser 5 € ?</strong> (15 − 10
                  = 200 − 195 = 5 €.)
                </p>
              ),
            },
            {
              title: "② La variable qui change, et pourquoi elle est non pertinente",
              content: (
                <p>
                  Seul le prix de la calculatrice change (15 € ou 200 €). Il n'est{" "}
                  <strong>pas pertinent</strong> : il ne change pas les alternatives (marcher vingt
                  minutes et garder 5 € de plus, ou ne pas marcher). Il n'est pas rationnel de faire
                  le trajet dans la version A mais pas dans la version B.
                </p>
              ),
            },
            {
              title: "③ La prédiction rationnelle",
              content: (
                <p>
                  Les deux groupes sont tirés au hasard, donc <strong>similaires</strong> : ils
                  comportent la même proportion de personnes prêtes à marcher vingt minutes pour
                  5 €. Si les gens étaient rationnels (des Econos), on obtiendrait donc{" "}
                  <strong>le même pourcentage</strong> dans les deux versions.
                </p>
              ),
            },
            {
              title: "④ L'observation, et la théorie qui l'explique",
              content: (
                <p>
                  On observe 82 % contre 25 % : le pourcentage est bien plus fort dans la version
                  A. Les gens ne se comportent donc pas de manière purement rationnelle : la théorie
                  rationnelle décrit mal ce type de décisions (slide 4). La théorie alternative est
                  la <strong>comptabilité mentale</strong> : un achat procure une utilité
                  d'acquisition, mais aussi une <strong>utilité de transaction</strong> (prix de
                  référence vs prix payé). Intuitivement, 5 € de moins sur 15 €, c'est un tiers du
                  prix — une « affaire » ; sur 200 €, à peine 2,5 %.
                </p>
              ),
            },
          ]}
          result={
            <>
              <p className="rounded-xl border-l-4 border-primary bg-accent/40 px-3 py-2">
                <strong>Réponse rédigée (modèle).</strong> « Dans les deux versions, la différence
                entre les alternatives est la même : marcher vingt minutes pour économiser 5 €. Le
                prix de la calculatrice (15 € ou 200 €) n'est pas pertinent, car il ne change pas
                ces alternatives. Les deux groupes étant tirés au hasard, ils sont similaires : des
                preneurs de décision rationnels donneraient la même proportion de « oui » dans les
                deux versions. Or 82 % disent oui dans la version A contre 25 % dans la version B :
                les gens ne se comportent pas de manière purement rationnelle. La comptabilité
                mentale explique cet écart : économiser 5 € sur 15 € procure une forte utilité de
                transaction, sur 200 € presque aucune. »
              </p>
              <p className="mt-2">
                <strong>Piège :</strong> n'écris jamais « les gens changent d'avis » — personne n'a
                répondu aux deux versions. Même canevas pour le ticket (slide 10) : 35 % achètent
                contre 50 % gardent, donc la disposition à payer est plus faible que la disposition
                à accepter (effet de dotation).
              </p>
            </>
          }
        />

        <Callout variant="retiens" title="Bravo !">
          <p>
            Si tu as réussi ces dix exercices, tu maîtrises l'essentiel du chapitre : construire
            et résoudre le modèle du choix rationnel <em>et</em> reconnaître où les vrais humains
            s'en écartent. C'est exactement ce qu'on attend de toi. Reviens sur les sondages et les
            exercices autant que nécessaire : c'est en refaisant qu'on ancre.
          </p>
        </Callout>
      </Section>
    </>
  );
}
