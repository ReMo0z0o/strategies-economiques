/*
 * Chapitre B2 — PartRisque (sections affichées dans la page du chapitre).
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { MasteryChecklist, QuizDiagnostic, RiskAversionFigure } from "./interactives";
import { H4, Steps, Hl } from "./ui";

export function PartRisque() {
  return (
    <>

      {/* ============================================================ */}
      {/* §7 — Agent averse au risque (slides 21-22)                    */}
      {/* ============================================================ */}
      <Section id="sec-risque" kicker="§ 7" title="Et si l'agent est averse au risque ?">
        <p className="text-[1.1rem] leading-relaxed">
          Jusqu'ici, l'agent était <strong>neutre au risque</strong> : seul son revenu net{" "}
          <em>moyen</em> comptait pour lui (slide 7 : « l'agent est neutre au risque (pour
          commencer) »). Les deux derniers slides posent la question : « Les conclusions du
          modèle principal-agent diffèrent-elles si l'agent est averse au risque ? » (slide 21).
          La réponse est oui, et c'est la conclusion finale du chapitre. Les slides 21-22
          répondent <strong>en mots, sans calcul</strong> : on suit la même voie, avec un petit
          exemple chiffré pour voir le mécanisme.
        </p>

        <H4>Rappel d'A3 : qu'est-ce qu'être averse au risque ?</H4>
        <p>
          Souviens-toi du sondage d'A3 : 97 % des étudiants préfèrent recevoir 3 millions € à
          coup sûr plutôt que « 10 millions € si pile, 0 € si face » (S4 slide 9), alors que ce
          pari a une valeur monétaire attendue (VMA) de 5 millions €. Un individu{" "}
          <strong>averse au risque</strong> préfère un montant sûr à un actif risqué de même VMA
          (et parfois même un montant sûr plus petit). En A3, cela se traduit par une fonction
          d'utilité de Bernoulli <M tex="u" /> <strong>concave</strong> : chaque euro
          supplémentaire apporte un peu moins d'utilité que le précédent.{" "}
          <TheoryRef chapter="a3" section="s5" />
        </p>

        <H4>Ce qui change dans le modèle (slide 21)</H4>
        <p>
          Une seule chose change : la façon dont l'agent évalue son revenu net{" "}
          <M tex="w - c" /> (son salaire moins le coût de son effort). « Si l'agent est averse
          au risque, alors <M tex="U_a(w - c)" /> est défini avec une fonction d'utilité de
          Bernoulli <M tex="u(w - c)" /> concave » (slide 21). Comme en A3, l'agent calcule donc
          son utilité espérée : la moyenne des <M tex="u(w - c)" />, pondérée par les
          probabilités.
        </p>
        <MB tex="\begin{aligned} \text{neutre :}\quad & U_a = E(w - c) \\ \text{averse :}\quad & U_a = E\big[u(w - c)\big] \end{aligned}" />
        <p>
          Tout le reste est inchangé : <M tex="z = e + x" /> avec <M tex="E(x) = 0" />, le
          contrat <M tex="w = \alpha + \beta z" />, le coût <M tex="c(e) = e^2/2" />, le timing
          en 3 étapes, l'utilité par défaut <M tex="\tilde{u}" />, et le principal, qui reste
          neutre au risque : <M tex="U_p = E(z - w)" />.
        </p>

        <H4>Où se cache le risque ? Décomposons le salaire</H4>
        <p>
          Remplace <M tex="z" /> par <M tex="e + x" /> dans le contrat linéaire (slides 5 et 6) :
        </p>
        <MB tex="\begin{aligned} w &= \alpha + \beta z = \alpha + \beta\,(e + x) \\ &= \underbrace{\alpha + \beta e}_{\text{part sûre}} \; + \underbrace{\beta x}_{\text{part due à la chance}} \end{aligned}" />
        <p>
          Une fois l'effort <M tex="e" /> choisi, <M tex="\alpha + \beta e" /> est connu
          d'avance. Seul <M tex="\beta x" /> dépend de la chance. L'agent reçoit donc la part{" "}
          <M tex="\beta" /> du risque <M tex="x" />, et le principal garde le reste,{" "}
          <M tex="(1 - \beta)\,x" />, puisque <M tex="z - w = (1 - \beta)(e + x) - \alpha" />.
          Le taux de bonus <M tex="\beta" /> mesure donc{" "}
          <strong>la part du risque que porte l'agent</strong> :
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <M tex="\beta = 0" /> (salaire fixe du Cas 1) : aucun risque pour l'agent, mais
            aucun incitant (au Cas 1, <M tex="e^* = 0" />) ;
          </li>
          <li>
            <M tex="\beta = 1" /> (franchise du Cas 3) : l'effort efficace (au Cas 3,{" "}
            <M tex="e^* = 1" />), mais l'agent porte <em>tout</em> le risque lié à{" "}
            <M tex="x" /> (slide 20).
          </li>
        </ul>
        <p>
          C'est la phrase du slide 21 : « Pour inciter l'agent à exercer un niveau d'effort non
          nul, le principal doit <strong>intéresser l'agent au résultat</strong>. […] Plus le
          salaire dépend de <M tex="z" />, plus l'agent est incité à exercer un effort élevé,
          mais plus l'agent supporte une grande part du risque (lié à <M tex="x" />). »
        </p>

        <H4>Combien ce risque coûte-t-il à l'agent ? La PRM d'A3</H4>
        <p>
          A3 donne l'outil pour chiffrer ce que le risque coûte à quelqu'un d'averse au risque
          (S4, slides 22-23) :
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            l'<strong>équivalent certain</strong> <M tex="C" /> d'un revenu risqué est le montant
            sûr qui procure la même utilité : <M tex="u(C) = U" /> ;
          </li>
          <li>
            la <strong>prime de risque minimale</strong> est la différence entre la VMA du
            revenu risqué et son équivalent certain :{" "}
            <M tex="\mathrm{PRM} = \mathrm{VMA} - C" />. C'est un{" "}
            <strong>montant d'argent</strong>, strictement positif pour un individu averse au
            risque (car alors <M tex="C < \mathrm{VMA}" />).
          </li>
        </ul>
        <p>
          Sur la figure (statique, comme au slide 23 de S4), la PRM est{" "}
          <strong>l'écart horizontal rouge</strong> entre <M tex="C" /> et la VMA, lu sur l'axe
          des revenus.{" "}
          <TheoryRef chapter="a3" section="s6" />
        </p>

        <RiskAversionFigure />

        <Callout variant="exemple" title="Exemple chiffré illustratif (pas dans les slides) : la PRM grandit avec le taux de bonus">
          <p>
            D'où viennent les revenus 0,1 et 0,9 de la figure ? Prends une part sûre du revenu
            net égale à 0,5 et une chance <M tex="x = +0{,}4" /> ou <M tex="x = -0{,}4" />, avec
            une chance sur deux (donc <M tex="E(x) = 0" />, comme au slide 5). Le revenu net de
            l'agent vaut alors{" "}
            <span className="whitespace-nowrap">
              <M tex="0{,}5 + \beta x" />,
            </span>{" "}
            et sa VMA vaut toujours 0,5. Avec la
            franchise (<M tex="\beta = 1" />), on retrouve la figure : 0,1 ou 0,9, donc{" "}
            <M tex="C = 0{,}4" /> et{" "}
            <span className="whitespace-nowrap">
              <M tex="\mathrm{PRM} = 0{,}1" />.
            </span>{" "}
            Pour un{" "}
            <M tex="\beta" /> quelconque, avec <M tex="u(y) = \sqrt{y}" /> :
          </p>
          <MB tex="\begin{aligned} U(\beta) &= \tfrac{1}{2}\sqrt{0{,}5 - 0{,}4\beta} \\ &\quad + \tfrac{1}{2}\sqrt{0{,}5 + 0{,}4\beta} \\ C(\beta) &= U(\beta)^2 \\ \mathrm{PRM}(\beta) &= 0{,}5 - C(\beta) \end{aligned}" />
          <p>Les valeurs (exactes ou arrondies au millième) :</p>
          <CompactTbl
            head={[
              <M tex="\beta" />,
              "Revenus nets possibles",
              <>
                Équivalent certain <M tex="C" />
              </>,
              "PRM",
            ]}
            rows={[
              ["0", "0,5 (sûr)", "0,5", "0"],
              ["0,5", "0,3 ou 0,7", "≈ 0,479", "≈ 0,021"],
              ["0,75", "0,2 ou 0,8", "0,45", "0,05"],
              ["1", "0,1 ou 0,9", "0,4", <Hl>0,1</Hl>],
            ]}
          />
          <p>
            Plus <M tex="\beta" /> est grand, plus l'agent porte de risque et plus la PRM est
            grande. Et elle grandit de plus en plus vite : de <M tex="\beta = 0{,}5" /> à{" "}
            <M tex="\beta = 1" />, la part du risque double, mais la PRM est presque multipliée
            par 5.
          </p>
        </Callout>

        <H4>La compensation salariale supplémentaire (slide 21)</H4>
        <p>
          « De nouveau, le principal va concevoir le contrat de manière à satisfaire de justesse
          la contrainte de participation, et on aura <M tex="U_a(w - c) = \tilde{u}" />. Étant
          averse au risque, l'agent va demander une compensation salariale supplémentaire pour
          supporter les risques qui lui sont transférés » (slide 21).
        </p>
        <p>
          En termes d'A3, cette compensation est la PRM de son revenu risqué. L'agent ne
          valorise ce revenu qu'à son équivalent certain, c'est-à-dire sa VMA moins la PRM. Pour
          qu'il signe, l'utilité de cet équivalent certain doit valoir au moins{" "}
          <span className="whitespace-nowrap">
            <M tex="\tilde{u}" />.
          </span>{" "}
          Le revenu net moyen à lui promettre est donc plus élevé,
          exactement de la PRM, que s'il ne portait aucun risque. Dans l'exemple, avec{" "}
          <M tex="\beta = 1" /> : un revenu net sûr de 0,4 donnerait à l'agent la même utilité
          que son revenu risqué de moyenne 0,5. Lui faire porter le risque coûte donc 0,1 de
          salaire moyen en plus, et c'est le principal qui paie.
        </p>

        <H4>Le nouveau dilemme du principal : les incitants ou le risque</H4>
        <p>
          Avec un agent neutre, la franchise réglait tout (slides 19-20) : <M tex="\beta = 1" />{" "}
          donnait l'effort efficace, et porter tout le risque ne coûtait rien à l'agent. Avec un
          agent averse, aucun contrat ne gagne sur les deux tableaux :
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>
              garder la franchise (<M tex="\beta = 1" />)
            </strong> : l'agent reste très incité, mais il porte tout le risque et exige la plus grande
            compensation. Pour qu'il signe encore, le principal doit la lui payer, en lui
            demandant une franchise plus petite ;
          </li>
          <li>
            <strong>
              passer au salaire fixe (<M tex="\beta = 0" />)
            </strong> : plus de risque à compenser, mais plus d'incitant non plus : l'agent ne fait aucun
            effort (comme au Cas 1) ;
          </li>
          <li>
            <strong>entre les deux</strong> : un peu de chaque coût. Intuitivement, le principal
            choisit alors un <M tex="\beta" /> plus petit que 1, mais le cours ne calcule pas ce{" "}
            <M tex="\beta" />.
          </li>
        </ul>
        <Callout variant="definition" title="📖 L'arbitrage incitants ↔ risque (slide 22)">
          <p>
            Plus le salaire dépend de <M tex="z" /> (plus <M tex="\beta" /> est grand) :
          </p>
          <ul>
            <li>✅ …plus l'agent est incité à exercer un effort élevé (le gâteau grossit) ;</li>
            <li>
              ❌ …mais plus il supporte une grande part du risque lié à <M tex="x" />, et plus
              la compensation qu'il demande est élevée.
            </li>
          </ul>
          <p>
            « En concevant le contrat optimal, le principal doit arbitrer entre les incitants
            donnés à l'agent, pour qu'il exerce un plus grand effort, [et] le risque supporté par
            l'agent, pour lesquels il demande une compensation supplémentaire » (slide 22).
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ La conclusion finale du chapitre (slide 22)">
          <p>
            « À l'optimum, le principal extrait de nouveau tout le surplus de leur association,
            mais le principal{" "}
            <strong>
              n'atteint plus le niveau de profit attendu obtenu dans le cas d'information
              parfaite
            </strong>
            . Son surplus diminue car il doit payer la compensation pour le risque de l'agent.{" "}
            <strong>L'information imparfaite a donc un coût en termes d'efficacité.</strong>&nbsp;»
          </p>
          <p>
            Pourquoi ? (explication, pas dans les slides) Le cas d'information parfaite est la situation de référence où le
            principal observerait l'effort <M tex="e" /> (voir § 6). Il pourrait alors exiger
            l'effort voulu contre un salaire fixe : l'agent ne porterait aucun risque, et il n'y
            aurait aucune compensation à payer. C'est parce que <M tex="e" /> est inobservable
            que le principal doit lier le salaire à <M tex="z" />, donc faire porter du risque à
            l'agent, donc payer cette compensation (ou renoncer à une partie de l'effort).
          </p>
        </Callout>

        <H4>Agent neutre ou averse : le tableau qui résume tout</H4>
        <CompactTbl
          rowHeads
          head={["", "Agent neutre au risque (slides 7-20)", "Agent averse au risque (slides 21-22)"]}
          rows={[
            [
              "Utilité de l'agent",
              <M tex="E(w - c)" />,
              <>
                <M tex="E\big[u(w - c)\big]" />, <M tex="u" /> concave
              </>,
            ],
            [
              <>
                Porter le risque lié à <M tex="x" />…
              </>,
              "ne lui coûte rien",
              "lui coûte : il exige une compensation (sa PRM)",
            ],
            [
              "CP à l'optimum",
              <>
                saturée : <M tex="E(w - c) = \tilde{u}" />
              </>,
              <>
                saturée : <M tex="U_a(w - c) = \tilde{u}" />
              </>,
            ],
            [
              "Contrat optimal",
              <>
                franchise : <M tex="\beta^* = 1" />, <M tex="\alpha^* = -0{,}5" />
              </>,
              <>
                arbitrage incitants/risque (<M tex="\beta" /> non calculé dans le cours)
              </>,
            ],
            [
              "Profit du principal",
              "0,5 : le même que dans le cas d'information parfaite (slide 20)",
              "plus bas que dans le cas d'information parfaite (slide 22)",
            ],
            [
              "L'information imparfaite…",
              "ne coûte rien",
              <Hl>a un coût en termes d'efficacité</Hl>,
            ],
          ]}
        />

        <Callout variant="examen" title="Pièges classiques sur ce paragraphe">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              La compensation pour le risque est un <strong>montant d'argent</strong> : la PRM,{" "}
              <M tex="\mathrm{VMA} - C" />, lue horizontalement sur l'axe des revenus. Ce n'est
              pas l'écart vertical entre deux utilités.
            </li>
            <li>
              Avec un agent averse, la CP saturée porte sur son <strong>utilité espérée</strong> : <M tex="U_a(w - c) = E\big[u(w - c)\big] = \tilde{u}" /> (slide 21), et non plus
              sur son revenu net moyen <M tex="E(w - c)" />.
            </li>
            <li>Seul l'agent devient averse au risque : le principal reste neutre (slide 7).</li>
            <li>
              Le cours ne calcule pas le contrat optimal avec un agent averse : explique
              l'arbitrage, ne donne pas de <M tex="\beta" /> chiffré.
            </li>
          </ul>
        </Callout>

        <Quiz
          scope="b2"
          id="q11"
          kicker="Quiz éclair · §7"
          question={
            <p>
              Vrai ou faux : « Avec un agent averse au risque, le contrat franchise (
              <M tex="\beta = 1" />) reste le contrat optimal du principal. »
            </p>
          }
          options={[
            {
              text: <>Vrai : la franchise reste imbattable.</>,
              explain: (
                <>
                  Non. Avec <M tex="\beta = 1" />, l'agent porte TOUT le risque lié à{" "}
                  <M tex="x" /> : il exige la plus grande compensation (sa PRM). Le principal doit
                  la lui payer, en lui demandant une franchise plus petite. C'est le côté
                  « risque » de l'arbitrage du slide 22.
                </>
              ),
            },
            {
              text: (
                <>
                  Faux : en baissant <M tex="\beta" />, le principal réduit le risque transféré,
                  donc la compensation à payer, quitte à obtenir moins d'effort.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : c'est l'arbitrage incitants/risque du slide 22. Intuitivement, le{" "}
                  <M tex="\beta" /> optimal se situe alors entre 0 et 1 : ni{" "}
                  <M tex="\beta = 0" /> (aucun risque pour l'agent, mais aucun incitant), ni{" "}
                  <M tex="\beta = 1" /> (effort efficace, mais tout le risque pour l'agent). Le
                  cours s'arrête à cet arbitrage, sans calculer ce <M tex="\beta" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q12"
          kicker="Quiz éclair · §7"
          question={
            <p>
              Vrai ou faux : « Avec un agent averse au risque, l'information imparfaite a un coût
              d'efficacité, alors qu'avec un agent neutre au risque elle n'en avait pas. »
            </p>
          }
          options={[
            {
              text: <>Vrai : c'est le message central du chapitre.</>,
              correct: true,
              explain: (
                <>
                  C'est LA phrase de conclusion du chapitre. Agent neutre : la franchise atteint
                  le même profit attendu (0,5) que dans le cas d'information parfaite (slide 20).
                  Agent averse : le principal n'atteint plus ce profit, car il doit payer la
                  compensation pour le risque (slide 22).
                </>
              ),
            },
            {
              text: <>Faux.</>,
              explain: (
                <>
                  Relis la conclusion : c'est exactement l'énoncé du cours. Avec un agent neutre,
                  la franchise atteint le même profit attendu (0,5) que dans le cas d'information
                  parfaite (slide 20) ; avec un agent averse, plus moyen (slide 22).
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* §8 — Exercices résolus                                        */}
      {/* ============================================================ */}
      <Section id="sec-exos" kicker="§ 8" title="Exercices résolus — entraîne-toi comme à l'examen">
        <p className="text-[1.1rem] leading-relaxed">
          Quatre exercices, du plus guidé au plus libre. Cherche <em>vraiment</em> avant d'ouvrir
          la solution : c'est là que la maîtrise se construit. Les exercices 1 et 2 reprennent
          les Cas 2 et 3 avec un autre coût d'effort, <M tex="c(e) = e^2" />. L'exercice 3 change
          l'utilité par défaut <M tex="\tilde{u}" />, et l'exercice 4 mobilise tout le chapitre.
          Chaque solution suit la méthode des slides 10 à 18, résumée au § 9 : l'effort de
          l'agent (③), sa décision de signer (②, la CP), puis le contrat du principal (①).
        </p>

        <ExerciseBlock
          scope="b2"
          id="ex1"
          number={1}
          title="Salaire proportionnel avec un coût d'effort différent"
          difficulty={1}
          refs={[{ chapter: "b2", section: "sec-cas2" }]}
          statement={
            <>
              <p>
                On reprend le Cas 2 (slides 12-14) : <M tex="w = \beta z" />,{" "}
                <M tex="z = e + x" />, <M tex="E(x) = 0" />, <M tex="\tilde{u} = 0" />. Seul
                changement : le coût d'effort est maintenant{" "}
                <strong>
                  <M tex="c(e) = e^2" />
                </strong>{" "}
                au lieu de <M tex="e^2/2" /> : chaque niveau d'effort coûte deux fois plus cher.
              </p>
              <ul>
                <li>
                  <strong>a)</strong> Trouve la meilleure réponse de l'agent{" "}
                  <M tex="e^*(\beta)" />.
                </li>
                <li>
                  <strong>b)</strong> Trouve le <M tex="\beta^*" /> choisi par le principal, puis
                  le profil de payoffs <M tex="(U_p\,;\ U_a)" />.
                </li>
                <li>
                  <strong>c)</strong> Compare avec le Cas 2 du cours (slides 13-14).
                </li>
              </ul>
            </>
          }
          steps={[
            {
              title: "a) L'agent d'abord : il choisit son effort",
              content: (
                <>
                  <p>
                    Par backward induction, on part de la fin du jeu : l'agent connaît déjà{" "}
                    <M tex="\beta" /> et choisit <M tex="e" /> pour maximiser son utilité
                    espérée, comme au slide 12.
                  </p>
                  <MB tex="\begin{aligned} E(w - c) &= E(\beta z - e^2) \\ &= \beta e + \beta E(x) - e^2 \\ &= \beta e - e^2 \quad \text{car } E(x) = 0 \end{aligned}" />
                  <p>CPO : la dérivée par rapport à <M tex="e" /> doit s'annuler.</p>
                  <MB tex="\frac{\partial E(w - c)}{\partial e} = \beta - 2e = 0 \;\Rightarrow\; \boxed{e^*(\beta) = \beta/2}" />
                  <p>
                    La dérivée de <M tex="e^2" /> est <M tex="2e" /> : le coût marginal de
                    l'effort monte deux fois plus vite qu'au cours. Pour un même bonus{" "}
                    <M tex="\beta" />, l'agent fournit donc deux fois moins d'effort (
                    <M tex="\beta/2" /> au lieu de <M tex="\beta" />).
                  </p>
                </>
              ),
            },
            {
              title: "b) Le principal ensuite : il choisit β en anticipant e* = β/2",
              content: (
                <>
                  <p>
                    Comme au slide 13 : le principal garde <M tex="z - \beta z = (1 - \beta)z" />,
                    et il remplace <M tex="e" /> par la meilleure réponse de l'agent.
                  </p>
                  <MB tex="\begin{aligned} E(z - w) &= (1 - \beta)\,E(z) = (1 - \beta)\,e^*(\beta) \\ &= (1 - \beta)\,\frac{\beta}{2} = \frac{\beta - \beta^2}{2} \end{aligned}" />
                  <p>CPO par rapport à <M tex="\beta" /> :</p>
                  <MB tex="\begin{gathered} \frac{\partial E(z - w)}{\partial \beta} = \frac{1 - 2\beta}{2} = 0 \;\Rightarrow\; \boxed{\beta^* = 1/2} \\ \Rightarrow\; e^* = \beta^*/2 = 1/4 \end{gathered}" />
                  <p>
                    L'ENPS, écrit comme au slide 13 :{" "}
                    <M tex="(s_p^*, s_a^*) = (\beta^* = 1/2,\ e^*(\beta) = \beta/2)" />.
                  </p>
                </>
              ),
            },
            {
              title: "Les payoffs (avec β* = 1/2 et e* = 1/4)",
              content: (
                <>
                  <MB tex="\begin{aligned} U_p &= (1 - \tfrac{1}{2})\cdot\tfrac{1}{4} = \tfrac{1}{8} = 0{,}125 \\ U_a &= \tfrac{1}{2}\cdot\tfrac{1}{4} - \left(\tfrac{1}{4}\right)^2 \\ &= \tfrac{1}{8} - \tfrac{1}{16} = \tfrac{1}{16} = 0{,}0625 \end{aligned}" />
                  <p>
                    La CP est respectée : <M tex="U_a = 0{,}0625 \ge \tilde{u} = 0" />, comme au
                    Cas 2 du cours (slide 16 : « la CP était satisfaite dans les cas 1 et 2 »).
                  </p>
                </>
              ),
            },
            {
              title: "c) La comparaison avec le Cas 2 du cours",
              content: (
                <>
                  <CompactTbl
                    rowHeads
                    head={["", "Cas 2 du cours", "Exercice 1"]}
                    rows={[
                      [<M tex="c(e)" />, <M tex="e^2/2" />, <M tex="e^2" />],
                      [<M tex="\beta^*" />, "1/2", "1/2"],
                      [<M tex="e^*" />, "1/2", "1/4"],
                      [<M tex="(U_p\,;\ U_a)" />, "(0,25 ; 0,125)", <Hl>(0,125 ; 0,0625)</Hl>],
                    ]}
                  />
                  <p>
                    Pourquoi <M tex="\beta^*" /> ne bouge pas ? L'objectif du principal,{" "}
                    <M tex="(\beta - \beta^2)/2" />, est exactement la moitié de celui du slide 13 (
                    <M tex="\beta - \beta^2" />) : il atteint son maximum au même{" "}
                    <M tex="\beta" />.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>Morale</strong> : le <M tex="\beta^*" /> ne change pas (le principal fait
              le même arbitrage entre sa part du gâteau et la taille du gâteau), mais l'effort et
              les deux payoffs sont divisés par deux : un effort plus pénible réduit le surplus
              créé.
            </p>
          }
        />

        <ExerciseBlock
          scope="b2"
          id="ex2"
          number={2}
          title={
            <>
              Contrat linéaire optimal avec <M tex="c(e) = e^2" />
            </>
          }
          difficulty={2}
          refs={[{ chapter: "b2", section: "sec-cas3" }]}
          statement={
            <p>
              Même environnement que l'exercice 1 (<M tex="c(e) = e^2" />,{" "}
              <M tex="\tilde{u} = 0" />), mais avec le contrat linéaire complet{" "}
              <M tex="w = \alpha + \beta z" /> du Cas 3. Trouve le contrat optimal{" "}
              <M tex="(\alpha^*, \beta^*)" />, l'effort induit et le profil de payoffs.{" "}
              <em>
                Suis exactement la recette du Cas 3 (slides 15-18) : CI → CP saturée →
                substitution de α → on injecte la CI → CPO sur β → α* par la CP.
              </em>
            </p>
          }
          steps={[
            {
              title: "L'agent : la CI (slide 15)",
              content: (
                <>
                  <p>
                    L'agent maximise son utilité espérée (avec <M tex="E(x) = 0" />) :
                  </p>
                  <MB tex="\begin{gathered} E(w - c) = \alpha + \beta e - e^2 \\ \text{CPO : } \beta - 2e = 0 \;\Rightarrow\; e^*(\alpha, \beta) = \beta/2 \end{gathered}" />
                  <p>
                    Le fixe <M tex="\alpha" /> disparaît dans la dérivée : il ne change pas
                    l'effort. C'est la contrainte de compatibilité aux incitants :{" "}
                    <strong>
                      CI : <M tex="e = \beta/2" />
                    </strong>
                    .
                  </p>
                </>
              ),
            },
            {
              title: "La CP saturée (slides 16-17)",
              content: (
                <>
                  <p>
                    Le principal ne laisse à l'agent que son utilité par défaut{" "}
                    <M tex="\tilde{u} = 0" /> : la CP est satisfaite de justesse. Elle donne{" "}
                    <M tex="\alpha" /> en fonction de <M tex="\beta" /> et de <M tex="e" /> :
                  </p>
                  <MB tex="\begin{aligned} E(w - c) = 0 \;&\Rightarrow\; \alpha + \beta e - e^2 = 0 \\ &\Rightarrow\; \alpha = e^2 - \beta e \end{aligned}" />
                </>
              ),
            },
            {
              title: "On remplace α dans l'objectif du principal (slide 17)",
              content: (
                <>
                  <MB tex="\begin{aligned} E(z - w) &= E\big(z - (\alpha + \beta z)\big) \\ &= e + E(x) - (e^2 - \beta e) \\ &\quad - \beta e - \beta E(x) \\ &= e - e^2 \end{aligned}" />
                  <p>
                    Les <M tex="\beta e" /> s'annulent : le profit du principal devient le gâteau{" "}
                    <M tex="e - e^2" /> (production moins coût de l'effort). Le principal
                    récupère tout le surplus.
                  </p>
                </>
              ),
            },
            {
              title: "On injecte la CI, puis CPO sur β (slide 18)",
              content: (
                <>
                  <p>
                    On remplace <M tex="e" /> par <M tex="\beta/2" /> (la CI) :
                  </p>
                  <MB tex="E(z - w) = e - e^2 = \frac{\beta}{2} - \frac{\beta^2}{4}" />
                  <MB tex="\frac{\partial E(z - w)}{\partial \beta} = \frac{1}{2} - \frac{\beta}{2} = 0 \;\Rightarrow\; \boxed{\beta^* = 1}" />
                  <p>
                    Vérification : <M tex="e^* = \beta^*/2 = 1/2" /> est bien l'effort qui
                    maximise le gâteau <M tex="e - e^2" /> (sa dérivée <M tex="1 - 2e" />{" "}
                    s'annule en <M tex="e = 1/2" />).
                  </p>
                </>
              ),
            },
            {
              title: "α* par la CP (slide 18)",
              content: (
                <>
                  <MB tex="\begin{aligned} \alpha^* &= e^2 - \beta^* e \quad \text{avec } e = \tfrac{1}{2} \\ &= \left(\tfrac{1}{2}\right)^2 - 1\cdot\tfrac{1}{2} = \boxed{-\tfrac{1}{4}} \end{aligned}" />
                  <p>
                    L'ENPS, écrit comme au slide 18 :{" "}
                    <M tex="(s_p^*, s_a^*) = (w^*(z) = -0{,}25 + z,\ e^*(w) = \beta/2)" />.
                  </p>
                </>
              ),
            },
            {
              title: "Les payoffs (comme au slide 19)",
              content: (
                <>
                  <MB tex="\begin{aligned} U_p &= E(z) - E(w) \\ &= \tfrac{1}{2} - \big(-\tfrac{1}{4} + \tfrac{1}{2}\big) = 0{,}25 \\ U_a &= -\tfrac{1}{4} + \tfrac{1}{2} - \left(\tfrac{1}{2}\right)^2 = 0 \end{aligned}" />
                  <p>
                    <M tex="U_p = 0{,}25" /> est le gâteau maximal (<M tex="e - e^2" /> en{" "}
                    <M tex="e = 1/2" />), et <M tex="U_a = 0 = \tilde{u}" /> : le principal
                    extrait tout le surplus.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>Morale</strong> : la structure du contrat optimal ne change pas :{" "}
              <strong>
                <M tex="\beta^* = 1" /> (l'agent devient residual claimant) et une franchise qui
                extrait tout le surplus
              </strong>
              , comme au Cas 3. Seuls les montants changent avec le coût : franchise de 0,25 au
              lieu de 0,5, profit de 0,25 au lieu de 0,5.
            </p>
          }
        />

        <ExerciseBlock
          scope="b2"
          id="ex3"
          number={3}
          title={
            <>
              Quand l'utilité par défaut vaut <M tex="\tilde{u} = 0{,}1" />
            </>
          }
          difficulty={2}
          refs={[{ chapter: "b2", section: "sec-cas3" }]}
          statement={
            <p>
              Retour au modèle du cours (<M tex="c(e) = e^2/2" />, contrat linéaire{" "}
              <M tex="w = \alpha + \beta z" />), mais l'agent a maintenant une utilité par défaut{" "}
              <M tex="\tilde{u} = 0{,}1" /> s'il refuse (par exemple grâce à une offre
              concurrente). Trouve le contrat linéaire optimal et le profit du principal.{" "}
              <em>Indice : qu'est-ce qui change, la taille du gâteau ou son partage ?</em>
            </p>
          }
          steps={[
            {
              title: "La CI ne change pas",
              content: (
                <p>
                  L'agent maximise <M tex="\alpha + \beta e - e^2/2" /> : la CPO{" "}
                  <M tex="\beta - e = 0" /> donne <M tex="e^* = \beta" />, comme au slide 15.{" "}
                  <M tex="\tilde{u}" /> n'apparaît pas dans ce calcul : l'agent ne compare le
                  contrat à <M tex="\tilde{u}" /> qu'au moment de signer (étape ②).
                </p>
              ),
            },
            {
              title: "La CP saturée au nouveau niveau ũ = 0,1",
              content: (
                <MB tex="\begin{aligned} E(w - c) = 0{,}1 \;&\Rightarrow\; \alpha + \beta e - \frac{e^2}{2} = 0{,}1 \\ &\Rightarrow\; \alpha = 0{,}1 + \frac{e^2}{2} - \beta e \end{aligned}" />
              ),
            },
            {
              title: "On remplace α dans l'objectif du principal",
              content: (
                <>
                  <MB tex="\begin{aligned} E(z - w) &= e - \alpha - \beta e \\ &= e - \frac{e^2}{2} - 0{,}1 \end{aligned}" />
                  <p>
                    Le gâteau <M tex="e - e^2/2" /> est le même qu'au cours, amputé des 0,1
                    d'utilité par défaut qu'il faut laisser à l'agent.
                  </p>
                </>
              ),
            },
            {
              title: "On injecte la CI, puis CPO sur β",
              content: (
                <>
                  <MB tex="\begin{gathered} E(z - w) = \beta - \frac{\beta^2}{2} - 0{,}1 \\ \text{CPO : } 1 - \beta = 0 \;\Rightarrow\; \boxed{\beta^* = 1} \end{gathered}" />
                  <p>
                    La constante <M tex="-0{,}1" /> disparaît dans la dérivée :{" "}
                    <M tex="\tilde{u}" /> ne change pas l'effort efficace.
                  </p>
                </>
              ),
            },
            {
              title: "α* par la CP",
              content: (
                <>
                  <MB tex="\alpha^* = 0{,}1 + \frac{1^2}{2} - 1\cdot 1 = \boxed{-0{,}4}" />
                  <p>
                    La franchise passe de 0,5 à 0,4 : elle est <em>réduite</em> de 0,1.
                  </p>
                </>
              ),
            },
            {
              title: "Les payoffs",
              content: (
                <>
                  <MB tex="\begin{aligned} U_p &= 1 - (-0{,}4 + 1) = 0{,}4 \\ U_a &= -0{,}4 + 1 - \tfrac{1}{2} = 0{,}1 = \tilde{u} \end{aligned}" />
                  <p>La CP est saturée : l'agent obtient exactement son utilité par défaut.</p>
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>Morale</strong> : <M tex="\tilde{u}" /> ne change <em>pas</em> les
              incitants (<M tex="\beta^* = 1" /> toujours), seulement le <em>partage</em> : plus
              l'utilité par défaut de l'agent est élevée, plus le principal doit lui laisser, via
              un <M tex="\alpha" /> plus élevé (une franchise plus petite), jamais via{" "}
              <M tex="\beta" />. <M tex="\beta" /> sert à inciter, <M tex="\alpha" /> sert à
              partager le gâteau.
            </p>
          }
        />

        <ExerciseBlock
          scope="b2"
          id="ex4"
          number={4}
          title="Audit du contrat « commission de 40 % »"
          difficulty={3}
          refs={[
            { chapter: "b2", section: "sec-cas2" },
            { chapter: "b2", section: "sec-cas3" },
            { chapter: "b2", section: "sec-risque" },
          ]}
          statement={
            <>
              <p>
                Une entreprise (modèle du cours : <M tex="c(e) = e^2/2" />,{" "}
                <M tex="\tilde{u} = 0" />, agent neutre au risque) paie son commercial{" "}
                <M tex="w = 0{,}4z" /> : une commission de 40 % sur le résultat.
              </p>
              <ul>
                <li>
                  <strong>a)</strong> Calcule l'effort induit et le profil de payoffs.
                </li>
                <li>
                  <strong>b)</strong> Ce contrat est-il optimal pour le principal ? Si non,
                  propose mieux et chiffre le gain.
                </li>
                <li>
                  <strong>c)</strong> Question d'interprétation (§ 7) : pourquoi le contrat
                  franchise pourrait-il ne plus être le meilleur contrat si l'agent est averse au
                  risque ?
                </li>
              </ul>
            </>
          }
          steps={[
            {
              title: "a) Effort induit et payoffs (méthode du Cas 2)",
              content: (
                <>
                  <p>
                    C'est un salaire proportionnel avec <M tex="\beta = 0{,}4" />. La CI du Cas 2
                    (slide 12) donne <M tex="e^* = \beta = 0{,}4" />.
                  </p>
                  <MB tex="\begin{aligned} U_p &= (1 - 0{,}4)\cdot 0{,}4 = 0{,}24 \\ U_a &= 0{,}4\cdot 0{,}4 - \frac{0{,}4^2}{2} \\ &= 0{,}16 - 0{,}08 = 0{,}08 \end{aligned}" />
                  <p>
                    (Tu peux le vérifier dans le laboratoire à contrats du § 5, avec{" "}
                    <M tex="\alpha = 0" /> et <M tex="\beta = 0{,}4" />.)
                  </p>
                </>
              ),
            },
            {
              title: "b) Non : la franchise fait plus du double",
              content: (
                <>
                  <p>
                    Même parmi les salaires proportionnels, 40 % n'est pas le meilleur choix :{" "}
                    <M tex="\beta^* = 1/2" /> donnerait <M tex="U_p = 0{,}25" /> (slide 14). Mais
                    le vrai optimum est le contrat linéaire du Cas 3, la franchise :{" "}
                    <M tex="\beta^* = 1" />, <M tex="\alpha^* = -0{,}5" />, qui donne{" "}
                    <M tex="U_p = 0{,}5" /> (slide 19).
                  </p>
                  <p>
                    <strong>Gain : 0,5 − 0,24 = +0,26</strong> de profit, plus du double. Il a deux
                    sources :
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>
                      le gâteau grossit : avec <M tex="e = 0{,}4" />, il vaut{" "}
                      <M tex="0{,}4 - 0{,}4^2/2 = 0{,}32" /> ; avec <M tex="e = 1" />, il vaut
                      0,5, soit <strong>+0,18</strong> ;
                    </li>
                    <li>
                      le principal récupère les <strong>0,08</strong> que l'agent gardait (avec
                      la franchise, <M tex="U_a = 0" />).
                    </li>
                  </ul>
                  <p>Total : 0,18 + 0,08 = 0,26. ✔</p>
                </>
              ),
            },
            {
              title: "c) Ce qui change avec un agent averse au risque (slides 21-22)",
              content: (
                <p>
                  La franchise (<M tex="\beta = 1" />) fait porter à l'agent tout le risque lié à{" "}
                  <M tex="x" /> (slide 20). Un agent averse au risque demande une compensation
                  salariale supplémentaire pour supporter ce risque (slide 21), et le principal,
                  qui sature la CP, doit la payer. Il doit donc arbitrer entre les incitants (un{" "}
                  <M tex="\beta" /> élevé donne un effort élevé) et le risque supporté par l'agent
                  (un <M tex="\beta" /> élevé coûte une compensation élevée) (slide 22).
                  Intuitivement, il choisit alors un <M tex="\beta" /> plus petit que 1 : le
                  cours ne calcule pas ce <M tex="\beta" />. Son profit reste inférieur à celui du
                  cas d'information parfaite : l'information imparfaite a un coût (slide 22).
                </p>
              ),
            },
          ]}
          result={
            <p>
              Dans le modèle de base (agent neutre au risque), la commission de 40 % laisse de la
              valeur sur la table : la franchise rapporte 0,5 au lieu de 0,24. Avec un agent
              averse au risque, un <M tex="\beta" /> inférieur à 1 devient compréhensible :
              c'est l'arbitrage incitants/risque du slide 22, que le cours décrit sans le
              calculer.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* §9 — Bilan                                                    */}
      {/* ============================================================ */}
      <Section id="sec-bilan" kicker="§ 9" title="Bilan — checklist de maîtrise & diagnostic">
        <H4>La méthode du chapitre en une page</H4>
        <Callout variant="methode" title="🧭 Résoudre un problème principal-agent (slides 8 à 18)">
          <p>
            On cherche l'ENPS par <strong>backward induction</strong> (slide 9) : on remonte le
            timing du slide 8, de la dernière étape vers la première.{" "}
            <TheoryRef chapter="bseq" section="s4" />
          </p>
          <Steps
            items={[
              <>
                <strong>Étape ③ : l'effort de l'agent.</strong> Il a signé ; il choisit{" "}
                <M tex="e" /> pour maximiser <M tex="E(w - c)" />. La CPO{" "}
                <M tex="\partial E(w - c)/\partial e = 0" /> donne sa meilleure réponse{" "}
                <M tex="e^*(\cdot)" /> : c'est la <strong>CI</strong> (Cas 1 :{" "}
                <M tex="e^* = 0" /> ; Cas 2 et 3 : <M tex="e^* = \beta" />).
              </>,
              <>
                <strong>Étape ② : accepter ou refuser.</strong> L'agent signe si{" "}
                <M tex="E(w - c)" />, calculé avec l'effort{" "}
                <span className="whitespace-nowrap">
                  <M tex="e^*" />,
                </span>{" "}
                vaut au moins son
                utilité par défaut <M tex="\tilde{u}" /> : c'est la <strong>CP</strong>,{" "}
                <M tex="E(w - c) \ge \tilde{u}" />. Dans les slides, cette décision apparaît comme
                la contrainte de participation du problème du principal (slides 11 et 16).
              </>,
              <>
                <strong>Étape ① : le contrat du principal.</strong> Il maximise{" "}
                <M tex="E(z - w)" /> en anticipant ces deux réactions. Au Cas 3 : CP saturée →
                substitution de <M tex="\alpha" /> → on injecte la CI → CPO sur{" "}
                <M tex="\beta" /> → <M tex="\alpha^*" /> par la CP.
              </>,
            ]}
          />
          <p>
            Attention : au Cas 1, <M tex="\alpha^* = 0" /> ne vient pas d'une CPO, mais de la
            participation : un salaire négatif inciterait l'agent à refuser le contrat (slide 11).
          </p>
        </Callout>

        <H4>La checklist des 12 points à maîtriser</H4>
        <p>
          Coche honnêtement. Un point est « maîtrisé » si tu peux l'expliquer à voix haute{" "}
          <em>sans regarder le cours</em>. Si tu hésites, le § à revoir est indiqué entre
          parenthèses.
        </p>
        <MasteryChecklist
          items={[
            <>
              Je sais définir <strong>principal</strong>, <strong>agent</strong>,{" "}
              <strong>information asymétrique</strong> et <strong>problème de l'agence</strong>,
              et les reconnaître dans un exemple nouveau. <em>(§ 1)</em>
            </>,
            <>
              Je sais expliquer pourquoi le terme « <strong>aléa moral</strong> » est trompeur :
              le problème n'est pas la morale de l'agent, mais de mauvais incitants qui réduisent
              le bien-être (slide 4). <em>(§ 1)</em>
            </>,
            <>
              Je sais écrire le modèle de mémoire : <M tex="z = e + x" />, <M tex="E(x) = 0" />,{" "}
              <M tex="w = \alpha + \beta z" />, <M tex="c(e) = e^2/2" />,{" "}
              <M tex="U_p = E(z - w)" />, <M tex="U_a = E(w - c)" />, <M tex="\tilde{u}" />, et
              le timing en 3 étapes. <em>(§ 2)</em>
            </>,
            <>
              Je sais appliquer la <strong>backward induction</strong> complète : d'abord
              l'effort de l'agent (étape ③, CPO sur <M tex="e" /> : la CI), puis sa décision de
              signer (étape ②, la CP), enfin le contrat du principal (étape ①).{" "}
              <em>(§ 2, méthode ci-dessus)</em>
            </>,
            <>
              <strong>Cas 1</strong> : je sais démontrer <M tex="e^* = 0" /> et{" "}
              <M tex="\alpha^* = 0" /> (par la CP, pas par une CPO), et expliquer pourquoi un
              salaire fixe n'incite à rien. <em>(§ 3)</em>
            </>,
            <>
              <strong>Cas 2</strong> : je sais démontrer <M tex="e^* = \beta" />,{" "}
              <M tex="\beta^* = 1/2" />, les payoffs (0,25 ; 0,125), montrer avec le
              contre-exemple (<M tex="e = 1" />, <M tex="\alpha = 0{,}7" />,{" "}
              <M tex="\beta = 0" />) → (0,3 ; 0,2) que ce résultat n'est pas efficace au sens de
              Pareto, et dire pourquoi ce contre-exemple n'est pas compatible aux incitants.{" "}
              <em>(§ 4, exercices 1 et 4)</em>
            </>,
            <>
              Je sais énoncer la <strong>CP</strong> et la <strong>CI</strong>, en formule et en
              français, et expliquer pourquoi le principal <strong>sature la CP</strong>.{" "}
              <em>(§ 5)</em>
            </>,
            <>
              <strong>Cas 3</strong> : je sais dérouler la recette complète (CI → CP saturée →
              substitution de <M tex="\alpha" /> → on injecte la CI → CPO sur <M tex="\beta" /> →{" "}
              <M tex="\alpha^*" /> par la CP) jusqu'à <M tex="\beta^* = 1" />,{" "}
              <M tex="\alpha^* = -0{,}5" /> et les payoffs (0,5 ; 0). <em>(§ 5, exercices 2 et 3)</em>
            </>,
            <>
              Je sais interpréter la <strong>franchise</strong> et le{" "}
              <strong>residual claimant</strong> (licence de taxi), et dire qui porte le risque
              dans ce contrat. <em>(§ 5, § 6)</em>
            </>,
            <>
              Je sais ce qu'est le <strong>cas d'information parfaite</strong> (le principal
              observerait l'effort) et pourquoi, avec un agent neutre au risque, la franchise
              atteint le même profit attendu (0,5). <em>(§ 6)</em>
            </>,
            <>
              Avec un agent <strong>averse au risque</strong>, je sais expliquer la compensation
              salariale supplémentaire (la PRM d'A3, un montant d'argent) et l'
              <strong>arbitrage incitants/risque</strong>, sans prétendre calculer{" "}
              <M tex="\beta" />. <em>(§ 7)</em>
            </>,
            <>
              Je sais énoncer la conclusion du chapitre : avec un agent averse au risque,{" "}
              <em>l'information imparfaite a un coût en termes d'efficacité</em>.{" "}
              <em>(§ 7)</em>
            </>,
          ]}
        />

        <H4>Diagnostic automatique de tes faiblesses</H4>
        <p>
          Réponds d'abord aux quiz éclair disséminés dans le chapitre, puis clique : on repère
          les sections où ça coince et on te dit quoi retravailler.
        </p>
        <QuizDiagnostic />

        <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
          Manuel interactif ECGEB366 · Chapitre B2.2 — Jeux séquentiels appliqués à la théorie
          des contrats (d'après les slides de B. Decerf). Formules vérifiées numériquement · La
          fonction d'utilité et l'exemple chiffré du § 7 sont illustratifs.
        </p>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Helper local : tableau compact, sans largeur minimale (lisible à    */
/* 390 px), même style que Tbl de ./ui.                                */
/* ------------------------------------------------------------------ */
function CompactTbl({
  head,
  rows,
  rowHeads = false,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  rowHeads?: boolean;
}) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[13.5px] sm:text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-2 py-2 text-center text-xs font-bold text-muted-foreground sm:px-3.5"
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
                <td
                  key={j}
                  className={`px-2 py-2 align-middle sm:px-3.5 ${
                    rowHeads && j === 0 ? "text-left font-semibold" : "text-center"
                  }`}
                >
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
