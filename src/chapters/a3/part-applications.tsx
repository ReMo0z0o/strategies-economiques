/*
 * Chapitre A3 — PartApplications (sections affichées dans la page du chapitre).
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
import { DiversificationExplorer } from "./anim/DiversificationExplorer";

export function PartApplications() {
  return (
    <>

      {/* ============================================================ */}
      {/* § 7 · APPLICATION 1 : INVESTIR                               */}
      {/* ============================================================ */}
      <Section
        id="s7"
        kicker="§ 7"
        title="Application 1 · Combien investir dans un projet risqué ?"
      >
        <Lead>
          Premier vrai problème d'optimisation du chapitre : un individu averse au risque face à
          un projet rentable mais risqué. Combien y met-il ? La réponse éclaire déjà le mystère
          du § 1 : tout cet argent qui dort sur les comptes.
        </Lead>

        <p>
          On peut maintenant répondre à la première question du chapitre. Être averse au risque
          ne veut pas dire refuser tout risque : un individu averse <em>peut</em> vouloir investir
          dans un actif risqué si celui-ci rapporte, en moyenne, nettement plus que ce qu'il
          coûte. Le slide 25 le dit ainsi : « si sa prime de risque est suffisamment grande ». La
          vraie question devient donc : <strong>combien</strong> de sa richesse placer dans le
          projet ?
        </p>

        <Callout variant="intuition" title="Le cadre général (slide 25)">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un individu rationnel possède une richesse <M tex="w > 0" />.
            </li>
            <li>
              Il se constitue un <strong>portefeuille</strong> d'actifs : il investit une partie
              de sa richesse dans un projet risqué et garde le reste sur son compte.
            </li>
            <li>
              Plus la partie investie est grande, <strong>plus la VMA</strong> de son portefeuille
              est grande… mais <strong>plus le risque</strong> est grand.
            </li>
            <li>
              Le montant optimal investi est{" "}
              <strong>d'autant plus petit que l'individu est averse au risque</strong>.
            </li>
          </ul>
        </Callout>

        <Callout variant="exemple" title="Mise en place du problème (slide 26)">
          <p>
            Richesse <M tex="w = 160" /> €. L'individu investit un montant{" "}
            <M tex="A \in [0, 160]" /> dans un projet (il ne peut pas investir plus que ce qu'il
            a). Chaque euro investi lui rend <strong>4 €</strong> avec probabilité 70 % (le projet
            réussit) ou <strong>0,20 €</strong> avec probabilité 30 % (il échoue). La valeur
            finale du <strong>portefeuille</strong> (argent gardé + ce que rend le projet) vaut
            donc soit <M tex="y" />, soit <M tex="x" /> :
          </p>
          <MB tex="y = \underbrace{160 - A}_{\text{gardé}} + \underbrace{4A}_{\text{rendu}} = 160 + 3A \quad \text{(réussite, 70 \%)}" />
          <MB tex="x = \underbrace{160 - A}_{\text{gardé}} + \underbrace{0{,}2A}_{\text{rendu}} = 160 - 0{,}8A \quad \text{(échec, 30 \%)}" />
          <p>
            Les deux extrêmes (graphique du slide 27) : avec <M tex="A = 0" />, le portefeuille
            vaut 160 € dans les deux cas, aucun risque ; avec <M tex="A = 160" />, il vaut 640 €
            (réussite) ou 32 € (échec). Chaque euro investi <em>écarte</em> les deux scénarios :
            +3 € dans le bon, −0,80 € dans le mauvais.
          </p>
          <p>
            En moyenne, chaque euro investi rapporte{" "}
            <M tex="0{,}7 \times 4 + 0{,}3 \times 0{,}2 = 2{,}86" /> €, soit un{" "}
            <strong>gain net moyen de 1,86 €</strong> (
            <M tex="0{,}7 \times 3 - 0{,}3 \times 0{,}8 = 1{,}86" />
            ). La VMA du portefeuille vaut donc <M tex="\mathrm{VMA}(A) = 160 + 1{,}86A" /> : elle
            monte avec <M tex="A" />… mais le risque aussi.
          </p>
        </Callout>

        <p>
          L'individu choisit <M tex="A" /> pour maximiser l'utilité qu'il espère de son
          portefeuille (70 % de chances d'avoir <M tex="y" />, 30 % d'avoir <M tex="x" />) :
        </p>
        <FormulaBox
          tex="U(A) = \tfrac{7}{10}\, u(160 + 3A) + \tfrac{3}{10}\, u(160 - 0{,}8A)"
          label="Le programme de l'investisseur"
          caption={
            <>
              Slide 26 : l'individu investit le montant <M tex="A^*" /> tel que{" "}
              <M tex="\partial U / \partial A = 0" />. Image : <M tex="U(A)" /> est une colline ;
              au sommet, la pente est nulle. Attention : cette règle ne vaut que si le sommet est{" "}
              <strong>à l'intérieur</strong> de [0, 160]. Si la pente est encore positive en{" "}
              <M tex="A = 160" />, la colline monte jusqu'au bord et l'optimum est{" "}
              <M tex="A^* = 160" /> (« solution en coin »).
            </>
          }
        />

        <H3>La pente de la colline, terme par terme</H3>
        <p>
          <M tex="\partial U / \partial A" /> mesure ce que rapporte, en utilité espérée,{" "}
          <strong>un euro de plus</strong> investi. Chaque terme se dérive avec la règle de la
          chaîne : la dérivée de <M tex="u(160 + 3A)" /> par rapport à <M tex="A" /> vaut{" "}
          <M tex="3\,u'(160 + 3A)" /> (la dérivée de l'intérieur, 3, fois <M tex="u'" />) ; celle
          de <M tex="u(160 - 0{,}8A)" /> vaut <M tex="-0{,}8\,u'(160 - 0{,}8A)" />.
        </p>
        <MB tex="\frac{\partial U}{\partial A} = \underbrace{0{,}7 \times 3 \times u'(y)}_{\text{gain si réussite}} \;-\; \underbrace{0{,}3 \times 0{,}8 \times u'(x)}_{\text{perte si échec}}" />
        <p>
          En mots : un euro de plus ajoute 3 € au bon scénario (probabilité 0,7) et retire 0,80 €
          au mauvais (probabilité 0,3) ; chaque euro est pesé par l'utilité marginale{" "}
          <M tex="u'" /> de ce scénario. Tant que ce bilan est positif, un euro de plus fait
          monter <M tex="U" /> : on continue. Pour un averse, <M tex="u'" /> est décroissante :
          quand <M tex="A" /> grandit, <M tex="x" /> baisse, <M tex="u'(x)" /> grimpe, et la perte
          pèse de plus en plus lourd. C'est ce qui finit par arrêter l'investissement.
        </p>

        <WidgetInvest />

        <ExerciseBlock
          scope="a3"
          id="ex7-invest"
          number="7.1"
          title="Trouver A* pour u = ln w, puis pour u = √w"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s7", label: "Investir dans un projet risqué" }]}
          statement={
            <p>
              Avec les données du slide 26 (w = 160 €, chaque euro investi rend 4 € avec 70 % ou
              0,20 € avec 30 %), calcule le montant optimal investi <M tex="A^*" /> a) pour{" "}
              <M tex="u(w) = \ln w" /> ; b) pour <M tex="u(w) = \sqrt{w}" />.
            </p>
          }
          steps={[
            {
              title: "1) Écrire la pente pour u = ln w",
              content: (
                <>
                  <p>
                    Pour <M tex="u = \ln w" />, l'utilité marginale est <M tex="u'(w) = 1/w" />.
                    On remplace dans la pente :
                  </p>
                  <MB tex="\frac{\partial U}{\partial A} = \frac{0{,}7 \times 3}{160 + 3A} - \frac{0{,}3 \times 0{,}8}{160 - 0{,}8A} = \frac{2{,}1}{160 + 3A} - \frac{0{,}24}{160 - 0{,}8A}" />
                </>
              ),
            },
            {
              title: "2) Annuler la pente (le sommet de la colline)",
              content: (
                <>
                  <p>
                    On pose la pente égale à 0, puis on fait un produit en croix (on multiplie
                    les deux côtés par les deux dénominateurs, qui sont positifs) :
                  </p>
                  <MB tex="\frac{2{,}1}{160 + 3A} = \frac{0{,}24}{160 - 0{,}8A} \iff 2{,}1\,(160 - 0{,}8A) = 0{,}24\,(160 + 3A)" />
                </>
              ),
            },
            {
              title: "3) Résoudre",
              content: (
                <>
                  <p>On développe chaque côté, puis on regroupe les A d'un côté :</p>
                  <MB tex="336 - 1{,}68A = 38{,}4 + 0{,}72A \iff 297{,}6 = 2{,}4A \iff A^* = 124" />
                  <p>
                    <strong>A* = 124 €</strong>, bien à l'intérieur de [0, 160] : c'est un
                    optimum intérieur, la règle ∂U/∂A = 0 s'applique. Portefeuille :{" "}
                    <M tex="y = 160 + 3 \times 124 = 532" /> € (réussite) ou{" "}
                    <M tex="x = 160 - 0{,}8 \times 124 = 60{,}8" /> € (échec).
                  </p>
                </>
              ),
            },
            {
              title: "4) Pour u = √w : regarder la pente au bord",
              content: (
                <>
                  <p>
                    Pour <M tex="u = \sqrt{w}" />, <M tex="u'(w) = \frac{1}{2\sqrt{w}}" />. Calculons
                    la pente tout au bout, en <M tex="A = 160" /> (là, <M tex="y = 640" /> et{" "}
                    <M tex="x = 32" />) :
                  </p>
                  <MB tex="\frac{\partial U}{\partial A}(160) = \frac{2{,}1}{2\sqrt{640}} - \frac{0{,}24}{2\sqrt{32}} \approx 0{,}0415 - 0{,}0212 = +0{,}0203 > 0" />
                  <p>
                    La pente est encore positive au bord : la colline monte jusqu'à A = 160. (Si
                    on résolvait quand même ∂U/∂A = 0, on trouverait A ≈ 188 €, plus que sa
                    richesse : impossible.) Donc <strong>A* = 160 €</strong> : il investit tout,
                    c'est une solution en coin.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              ln w : <strong>A* = 124 €</strong> (optimum intérieur, ∂U/∂A = 0). √w :{" "}
              <strong>A* = 160 €</strong> (solution en coin, la pente reste positive jusqu'au
              bout). Le plus averse des deux (ln) investit moins.
            </p>
          }
        />

        <Callout variant="retiens" title="Conclusion économique nº 1">
          <p>
            Le montant optimal investi <M tex="A^*" /> est{" "}
            <strong>d'autant plus petit que l'individu est averse au risque</strong> : avec ln w
            (plus concave, donc plus averse), 124 € ; avec √w, les 160 €. Remarque que même
            l'investisseur ln w, pourtant averse, place 124 € dans le projet risqué : être averse
            ne veut pas dire fuir tout risque. ⇒ Beaucoup d'argent dort sur des comptes lorsque
            les gens sont très averses au risque (slide 25). Première réponse, rationnelle, au
            mystère du § 1.
          </p>
        </Callout>

        <Quiz
          scope="a3"
          id="q3"
          question={
            <p>
              Deux individus averses au risque font face au même projet favorable. Léa a{" "}
              <M tex="u = \sqrt{w}" />, Marc a <M tex="u = \ln w" /> (plus concave, donc plus
              averse). Qui investit le montant le plus élevé ?
            </p>
          }
          options={[
            {
              text: <>Léa (√w), la moins averse au risque</>,
              correct: true,
              explain: (
                <>
                  Exact : comme dans l'exercice 7.1, √w pousse jusqu'à A* = 160 € (tout investir,
                  solution en coin) alors que ln w s'arrête à A* = 124 €. Plus l'aversion est
                  forte, plus le sommet de la colline U(A) recule vers la gauche.
                </>
              ),
            },
            {
              text: <>Marc (ln w), car il veut compenser son aversion par plus de gains</>,
              explain: (
                <>
                  C'est l'inverse : l'aversion au risque n'appelle pas de « compensation par les
                  gains ». Plus u est concave, plus le mauvais scénario pèse lourd dans U(A), et
                  plus A* est petit.
                </>
              ),
            },
            {
              text: <>Les deux investissent pareil : le projet est le même</>,
              explain: (
                <>
                  Le projet est le même mais la fonction de Bernoulli ne l'est pas — et c'est elle
                  qui détermine A*. Deux individus rationnels peuvent choisir des montants très
                  différents.
                </>
              ),
            },
          ]}
          explanation={
            <>
              C'est la conclusion économique nº 1 du chapitre : plus d'aversion au risque ⇒ moins
              d'investissement risqué ⇒ plus d'argent « qui dort ». Première explication,
              parfaitement rationnelle, du mystère des 336 milliards.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 8 · DIVERSIFICATION                                        */}
      {/* ============================================================ */}
      <Section
        id="s8"
        kicker="§ 8"
        title="Diversification : ne pas mettre tous ses œufs dans le même panier"
      >
        <Lead>
          Avec plusieurs actifs risqués, une nouvelle dimension apparaît : la corrélation entre
          leurs risques. Bien choisie, elle peut faire disparaître le risque… sans toucher à la
          VMA.
        </Lead>

        <p>
          Jusqu'ici, un seul actif risqué. Mais un portefeuille en contient souvent plusieurs, et
          ce qui compte alors est la <strong>corrélation</strong> entre leurs risques : les
          actifs gagnent-ils et perdent-ils <em>en même temps</em> ? Corrélation positive
          parfaite : toujours ensemble. Négative parfaite : toujours en sens inverse. Nulle :
          aucun lien entre les deux.
        </p>
        <p>
          Le modèle du slide 28 : un portefeuille formé de deux actifs <M tex="a_1" /> et{" "}
          <M tex="a_2" />. Chacun rapporte <M tex="y" /> avec probabilité ½ et <M tex="x" /> avec
          probabilité ½, où <M tex="y > x" /> (<M tex="y" /> = la bonne année, <M tex="x" /> =
          la mauvaise). Pris seul, chaque actif est donc exactement aussi risqué dans les trois
          cas ; seule change la façon dont les deux risques sont liés.
        </p>

        <H3>Les états du monde, cas par cas (slides 28-30)</H3>
        <p>
          Un <strong>état du monde</strong> est une façon dont l'avenir peut tourner (il pleut, il
          fait soleil…). Dans chaque état, on lit ce que vaut chaque action, puis on additionne :
          c'est la valeur du portefeuille.
        </p>

        <Tbl minW={320}>
          <thead>
            <tr>
              <th className={TH}>État du monde (probabilité)</th>
              <th className={TH}>
                <M tex="a_1" />
              </th>
              <th className={TH}>
                <M tex="a_2" />
              </th>
              <th className={TH}>Portefeuille</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${TD} bg-muted/40`} colSpan={4}>
                <strong>Cas 1 · Corrélation positive parfaite</strong> : <M tex="a_1" /> et{" "}
                <M tex="a_2" /> sont deux actions de la <em>même</em> firme de parapluies
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_1" /> : il pleut (50&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="2y" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_2" /> : il y a du soleil (50&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="2x" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} bg-muted/40`} colSpan={4}>
                <strong>Cas 2 · Corrélation négative parfaite</strong> : <M tex="a_1" /> =
                parapluies, <M tex="a_2" /> = crème solaire
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_1" /> : il pleut (50&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="y + x" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_2" /> : il y a du soleil (50&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="x + y" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} bg-muted/40`} colSpan={4}>
                <strong>Cas 3 · Corrélation nulle (risques indépendants)</strong> :{" "}
                <M tex="a_1" /> = parapluies, <M tex="a_2" /> = t-shirts des Diables rouges
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_1" /> : pluie + Diables qualifiés pour le mondial (25&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="2y" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_2" /> : pluie + Diables pas qualifiés (25&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="y + x" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_3" /> : soleil + Diables qualifiés (25&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="y" />
              </td>
              <td className={TD}>
                <M tex="x + y" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="s_4" /> : soleil + Diables pas qualifiés (25&nbsp;%)
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="x" />
              </td>
              <td className={TD}>
                <M tex="2x" />
              </td>
            </tr>
          </tbody>
        </Tbl>

        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Cas 1</strong> : les deux actions montent et descendent ensemble. Le
            portefeuille vaut <M tex="2y" /> (50 %) ou <M tex="2x" /> (50 %) : tout le risque est
            gardé.
          </li>
          <li>
            <strong>Cas 2</strong> : quand l'une perd, l'autre gagne. Le portefeuille vaut{" "}
            <M tex="y + x" /> dans <strong>les deux</strong> états : deux actifs risqués ont
            fabriqué un portefeuille <strong>sans aucun risque</strong>.
          </li>
          <li>
            <strong>Cas 3</strong> : la météo et le foot n'ont aucun lien. Le portefeuille vaut{" "}
            <M tex="2y" /> (25 %), <M tex="y + x" /> (25 % + 25 % = 50 %) ou <M tex="2x" /> (25 %)
            : les extrêmes deviennent moins probables, le risque est en partie lissé.
          </li>
        </ul>

        <p>
          Les trois portefeuilles ont pourtant la <strong>même VMA</strong> :
        </p>
        <MB tex="\begin{aligned} \text{cas 1 :}\ & \tfrac{1}{2}(2y) + \tfrac{1}{2}(2x) = x + y \\ \text{cas 2 :}\ & 1 \times (y + x) = x + y \\ \text{cas 3 :}\ & \tfrac{1}{4}(2y) + \tfrac{1}{2}(y + x) + \tfrac{1}{4}(2x) = x + y \end{aligned}" />
        <p>
          Ils ne diffèrent que par leur risque. Leurs utilités espérées (slide 31) :
        </p>
        <MB tex="\begin{aligned} U(\text{cas 1}) &= \tfrac{1}{2}\,u(2y) + \tfrac{1}{2}\,u(2x) && \text{corrélation positive parfaite} \\ U(\text{cas 2}) &= u(y + x) && \text{corrélation négative parfaite} \\ U(\text{cas 3}) &= \tfrac{1}{4}\,u(2y) + \tfrac{1}{2}\,u(y + x) + \tfrac{1}{4}\,u(2x) && \text{corrélation nulle} \end{aligned}" />

        <DiversificationExplorer />

        <Callout variant="retiens" title="Classement (slide 31)">
          <p>
            Pour un individu <strong>averse au risque</strong> :{" "}
            <M tex="U(\text{cas 2}) > U(\text{cas 3}) > U(\text{cas 1})" />. À VMA égale, moins de
            risque = plus d'utilité espérée.
            <br />
            Pour un individu <strong>neutre au risque</strong> :{" "}
            <M tex="U(\text{cas 2}) = U(\text{cas 3}) = U(\text{cas 1})" /> (seule la VMA compte).
          </p>
        </Callout>

        <H3>Pourquoi cet ordre ?</H3>
        <p>
          <strong>1. Cas 2 contre cas 1 : c'est la preuve du slide 20.</strong> Le portefeuille du
          cas 2 est un actif sûr <M tex="a_s" /> qui rapporte <M tex="w = x + y" />. Celui du cas
          1 est l'actif risqué <M tex="a_r" /> de même VMA, avec <M tex="z = y - x" /> :
        </p>
        <MB tex="2y = (x + y) + (y - x) = w + z \qquad 2x = (x + y) - (y - x) = w - z" />
        <p>
          Pour un averse (<M tex="u'' < 0" />), le slide 20 montre que{" "}
          <M tex="U(a_r) < U(a_s)" />. Donc <M tex="U(\text{cas 1}) < U(\text{cas 2})" />.
        </p>
        <p>
          <strong>2. Le cas 3 est « moitié cas 1, moitié cas 2 ».</strong> On coupe le terme du
          milieu en deux et on regroupe :
        </p>
        <MB tex="\begin{aligned} U(\text{cas 3}) &= \tfrac{1}{4}\,u(2y) + \tfrac{1}{4}\,u(2x) + \tfrac{1}{2}\,u(y + x) \\ &= \tfrac{1}{2}\Big[\tfrac{1}{2}\,u(2y) + \tfrac{1}{2}\,u(2x)\Big] + \tfrac{1}{2}\,u(y + x) \\ &= \tfrac{1}{2}\,U(\text{cas 1}) + \tfrac{1}{2}\,U(\text{cas 2}) \end{aligned}" />
        <p>
          La moyenne de deux nombres tombe toujours entre les deux : <M tex="U(\text{cas 3})" />{" "}
          est pile à mi-chemin entre <M tex="U(\text{cas 1})" /> et <M tex="U(\text{cas 2})" />.
        </p>
        <p>
          <strong>3. Pour un neutre, tout est égal.</strong> Son <M tex="u" /> est une droite (
          <M tex="u(w) = bw + d" />, slide 18), donc <M tex="U = b \times \mathrm{VMA} + d" /> :
          même VMA, même utilité espérée.
        </p>

        <Callout variant="exemple" title="Avec des chiffres (chiffres illustratifs)">
          <p>
            Prends <M tex="y = 16" />, <M tex="x = 4" /> et <M tex="u(w) = \sqrt{w}" /> (averse).
            Le portefeuille vaut 32, 20 ou 8 ; la VMA vaut 20 dans les trois cas.
          </p>
          <MB tex="\begin{aligned} U(\text{cas 1}) &= \tfrac{1}{2}\sqrt{32} + \tfrac{1}{2}\sqrt{8} \approx 4{,}243 \\ U(\text{cas 3}) &= \tfrac{1}{4}\sqrt{32} + \tfrac{1}{2}\sqrt{20} + \tfrac{1}{4}\sqrt{8} \approx 4{,}357 \\ U(\text{cas 2}) &= \sqrt{20} \approx 4{,}472 \end{aligned}" />
          <p>
            On retrouve l'ordre 2 &gt; 3 &gt; 1, et 4,357 est bien la moyenne de 4,243 et 4,472.
            Traduit en euros sûrs (la somme certaine qui donne la même utilité, ici{" "}
            <M tex="U^2" />) : le cas 1 vaut 18 € sûrs, le cas 3 environ 19 €, le cas 2 20 €.
          </p>
        </Callout>

        <Callout variant="exemple" title="Diversification du risque (slide 31)">
          <p>
            <strong>Diversifier</strong>, c'est combiner des actifs peu ou négativement corrélés
            pour réduire le risque total sans sacrifier la VMA. La <strong>bourse</strong> permet
            de répartir les risques entre les investisseurs. L'<strong>or</strong> est une «
            valeur refuge » : il est corrélé <em>négativement</em> aux actions (il a tendance à
            monter quand elles chutent), il joue donc le rôle de la crème solaire.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 9 · APPLICATION 2 : S'ASSURER                              */}
      {/* ============================================================ */}
      <Section id="s9" kicker="§ 9" title="Application 2 · Combien s'assurer ?">
        <Lead>
          La même méthode qu'au § 7 (écrire les deux valeurs possibles du portefeuille, écrire U,
          chercher le sommet), appliquée cette fois à l'assurance. Et un théorème élégant à la
          clé.
        </Lead>

        <p>
          L'assurance est le miroir de l'investissement : au lieu de <em>payer pour prendre</em>{" "}
          du risque (en espérant une VMA plus haute), on <em>paie pour se débarrasser</em> du
          risque (en acceptant une VMA plus basse).
        </p>

        <Callout variant="intuition" title="Le cadre général (slide 32)">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Un individu averse au risque peut vouloir assurer le risque d'un de ses actifs,{" "}
              <strong>si le coût de l'assurance ne fait pas trop diminuer la VMA</strong> de son
              portefeuille.
            </li>
            <li>
              Il possède un actif qui court un certain risque (« votre maison peut brûler ») et
              peut acheter une assurance pour couvrir une partie de ce risque.
            </li>
            <li>
              Plus la partie couverte est grande, <strong>plus petite est la VMA</strong> de son
              portefeuille, mais <strong>plus petit est le risque</strong>.
            </li>
            <li>
              La partie couverte est <strong>d'autant plus grande que l'individu est averse</strong>{" "}
              au risque.
            </li>
            <li>
              Si le prix de l'assurance est <strong>actuariellement juste</strong>, l'individu
              choisit de s'assurer complètement.
            </li>
          </ul>
        </Callout>

        <Callout variant="exemple" title="Mise en place du problème (slide 33)">
          <p>
            L'individu possède 30 € sur son compte et un vélo qui vaut 70 € (richesse totale
            100 €). Le vélo a une probabilité de 30 % d'être volé : c'est son actif risqué. Couvrir
            1 € contre le vol coûte <M tex="0{,}4" /> €. S'il couvre <M tex="C" /> euros, il paie{" "}
            <M tex="0{,}4C" /> tout de suite et touche <M tex="C" /> en cas de vol :
          </p>
          <MB tex="\begin{aligned} y &= 100 - 0{,}4C && \text{(pas de vol, 70 \%)} \\[2pt] x &= 100 - 0{,}4C - 70 + C = 30 + 0{,}6C && \text{(vol, 30 \%)} \end{aligned}" />
          <p>
            Chaque euro couvert <em>rapproche</em> les deux scénarios : −0,40 € dans le bon,
            +0,60 € dans le mauvais. Graphique du slide 34 : sans assurance (<M tex="C = 0" />),
            100 € ou 30 € ; à couverture complète (<M tex="C = 70" />), les deux droites se
            rejoignent : <M tex="y = x = 72" /> €, plus aucun risque.
          </p>
          <p>
            Le prix à payer en VMA : chaque euro couvert coûte 0,40 € mais ne rapporte en moyenne
            que 0,3 × 1 = 0,30 €. La VMA baisse donc de 0,10 € par euro couvert :
          </p>
          <MB tex="\mathrm{VMA}(C) = 0{,}7\,(100 - 0{,}4C) + 0{,}3\,(30 + 0{,}6C) = 79 - 0{,}1C" />
        </Callout>

        <p>
          L'individu choisit <M tex="C" /> pour maximiser l'utilité qu'il espère de son
          portefeuille :
        </p>
        <FormulaBox
          tex="U(C) = \tfrac{7}{10}\, u(100 - 0{,}4C) + \tfrac{3}{10}\, u(30 + 0{,}6C)"
          label="Le programme de l'assuré"
          caption={
            <>
              Slide 33 : il couvre le montant <M tex="C^*" /> tel que{" "}
              <M tex="\partial U / \partial C = 0" /> (comme au § 7, cette règle vaut pour un
              sommet à l'intérieur de [0, 70]).
            </>
          }
        />

        <p>
          La pente se calcule comme au § 7, terme par terme : un euro de plus couvert coûte
          0,40 € dans l'état « pas de vol » (probabilité 0,7) et rapporte 0,60 € net dans l'état
          « vol » (probabilité 0,3).
        </p>
        <MB tex="\frac{\partial U}{\partial C} = 0{,}7 \times (-0{,}4) \times u'(y) + 0{,}3 \times 0{,}6 \times u'(x) = 0 \iff 0{,}28\,u'(y) = 0{,}18\,u'(x)" />
        <p>
          Cette égalité vaut pour tout le monde. Il ne reste qu'à y mettre le{" "}
          <M tex="u'" /> de chaque personne.
        </p>

        <Callout variant="exemple" title="Résultats du cours · Fatou et Hicham (slide 35)">
          <p>
            <strong>Fatou</strong>, <M tex="u(w) = \sqrt{w}" /> : <M tex="C^* = 14{,}8" /> €,{" "}
            <M tex="y^* = 94{,}1" /> €, <M tex="x^* = 38{,}9" /> €, VMA = 77,5 €.
            <br />
            <strong>Hicham</strong>, <M tex="u(w) = \ln w" /> : <M tex="C^* = 39{,}6" /> €,{" "}
            <M tex="y^* = 84{,}2" /> €, <M tex="x^* = 53{,}8" /> €, VMA = 75,1 €.
          </p>
          <p>
            Fatou et Hicham couvrent <em>une partie</em> du risque, même si cela{" "}
            <strong>diminue la VMA</strong> de leur portefeuille (sans assurance, elle vaut
            0,7 × 100 + 0,3 × 30 = 79 €). Étant <strong>plus averse</strong> (ln est plus concave
            que √), Hicham couvre une <strong>plus grande partie</strong> du risque que Fatou.
            Symétrique parfait du § 7 : plus d'aversion, moins d'investissement risqué, mais{" "}
            <em>plus</em> d'assurance.
          </p>
          <p className="text-[13px] text-muted-foreground">
            Note : pour Hicham, le calcul exact (exercice 9.2) donne C* = 40 €, y* = 84 €, x* =
            54 € et VMA = 75 €, tout près des valeurs du slide. À l'examen, reconnais les valeurs
            du slide ; 40 € est la solution exacte de la condition ci-dessus.
          </p>
        </Callout>

        <ExerciseBlock
          scope="a3"
          id="ex9-fatou"
          number="9.1"
          title="Fatou (u = √w) : combien d'euros assurer ?"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s9", label: "Assurance optimale" }]}
          statement={
            <p>
              Slide 35, exercice 1. Fatou a <M tex="u(w) = \sqrt{w}" /> et fait face au problème
              du vélo : <M tex="U(C) = \tfrac{7}{10}\sqrt{100 - 0{,}4C} + \tfrac{3}{10}\sqrt{30 + 0{,}6C}" />.
              Trouve <M tex="C^*" />, <M tex="y^*" />, <M tex="x^*" /> et la VMA.
            </p>
          }
          steps={[
            {
              title: "1) Mettre le u′ de Fatou dans la condition",
              content: (
                <>
                  <p>
                    Pour <M tex="u = \sqrt{w}" />, <M tex="u'(w) = \frac{1}{2\sqrt{w}}" />. La
                    condition <M tex="0{,}28\,u'(y) = 0{,}18\,u'(x)" /> devient (les « 2 » se
                    simplifient des deux côtés) :
                  </p>
                  <MB tex="\frac{0{,}28}{\sqrt{y}} = \frac{0{,}18}{\sqrt{x}} \iff 0{,}28\sqrt{x} = 0{,}18\sqrt{y}" />
                </>
              ),
            },
            {
              title: "2) Se débarrasser des racines",
              content: (
                <>
                  <p>
                    On élève les deux côtés au carré (tout est positif), puis on remplace{" "}
                    <M tex="x" /> et <M tex="y" /> par leurs expressions en <M tex="C" /> :
                  </p>
                  <MB tex="0{,}0784\,x = 0{,}0324\,y \iff 0{,}0784\,(30 + 0{,}6C) = 0{,}0324\,(100 - 0{,}4C)" />
                </>
              ),
            },
            {
              title: "3) Résoudre",
              content: (
                <>
                  <p>On développe, puis on regroupe les C d'un côté :</p>
                  <MB tex="2{,}352 + 0{,}04704\,C = 3{,}24 - 0{,}01296\,C \iff 0{,}06\,C = 0{,}888 \iff C^* = 14{,}8" />
                </>
              ),
            },
            {
              title: "4) Le portefeuille et sa VMA",
              content: (
                <>
                  <MB tex="y^* = 100 - 0{,}4 \times 14{,}8 = 94{,}08 \qquad x^* = 30 + 0{,}6 \times 14{,}8 = 38{,}88" />
                  <MB tex="\mathrm{VMA} = 0{,}7 \times 94{,}08 + 0{,}3 \times 38{,}88 = 77{,}52 \quad (= 79 - 0{,}1 \times 14{,}8)" />
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>C* = 14,8 €</strong>, y* ≈ 94,1 €, x* ≈ 38,9 €, VMA ≈ 77,5 € : exactement
              les valeurs du slide 35. Fatou sacrifie 1,48 € de VMA (79 → 77,5) pour réduire son
              risque.
            </p>
          }
        />

        <ExerciseBlock
          scope="a3"
          id="ex9-hicham"
          number="9.2"
          title="Hicham (u = ln w) : combien d'euros assurer ?"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s9", label: "Assurance optimale" }]}
          statement={
            <p>
              Slide 35, exercice 2. Hicham a <M tex="u(w) = \ln w" /> :{" "}
              <M tex="U(C) = \tfrac{7}{10}\ln(100 - 0{,}4C) + \tfrac{3}{10}\ln(30 + 0{,}6C)" />.
              Trouve <M tex="C^*" />, <M tex="y^*" />, <M tex="x^*" /> et la VMA.
            </p>
          }
          steps={[
            {
              title: "1) Mettre le u′ de Hicham dans la condition",
              content: (
                <>
                  <p>
                    Pour <M tex="u = \ln w" />, <M tex="u'(w) = 1/w" />. La condition devient,
                    après un produit en croix :
                  </p>
                  <MB tex="\frac{0{,}28}{y} = \frac{0{,}18}{x} \iff 0{,}28\,x = 0{,}18\,y" />
                </>
              ),
            },
            {
              title: "2) Remplacer x et y, puis résoudre",
              content: (
                <MB tex="\begin{aligned} 0{,}28\,(30 + 0{,}6C) &= 0{,}18\,(100 - 0{,}4C) \\ 8{,}4 + 0{,}168\,C &= 18 - 0{,}072\,C \\ 0{,}24\,C &= 9{,}6 \iff C^* = 40 \end{aligned}" />
              ),
            },
            {
              title: "3) Le portefeuille et sa VMA",
              content: (
                <MB tex="y^* = 100 - 0{,}4 \times 40 = 84 \qquad x^* = 30 + 0{,}6 \times 40 = 54 \qquad \mathrm{VMA} = 0{,}7 \times 84 + 0{,}3 \times 54 = 75" />
              ),
            },
          ]}
          result={
            <p>
              Valeurs du slide 35 : <strong>C* = 39,6 €</strong>, y* = 84,2 €, x* = 53,8 €, VMA =
              75,1 €. Le calcul exact donne 40 / 84 / 54 / 75 : un tout petit écart numérique,
              même conclusion. Hicham couvre plus que Fatou (≈ 40 € contre 14,8 €) et sacrifie
              plus de VMA (79 → 75), car il est plus averse au risque.
            </p>
          }
        />

        <H3>Le prix « actuariellement juste »</H3>

        <Callout variant="definition" title="Définition · Prix actuariellement juste (slide 36)">
          <p>
            Le prix <M tex="p" /> d'une assurance est <strong>actuariellement juste</strong> s'il
            correspond au coût attendu par la compagnie d'assurance, c'est-à-dire à la VMA que
            l'individu a pour cette assurance. Couvrir 1 € rapporte 0 € s'il n'y a pas de vol
            (70 %) et 1 € s'il y a vol (30 %) :
          </p>
          <MB tex="\mathrm{VMA}(1\,\text{€}) = \tfrac{7}{10} \times 0 + \tfrac{3}{10} \times 1 = 0{,}3 \neq p = 0{,}4" />
          <p>
            Le prix actuariellement juste est donc <M tex="p' = 0{,}30" /> € par euro couvert. À
            0,40 €, l'assureur prend une marge de 0,10 € par euro couvert : ce sont exactement les
            0,10 € de VMA que l'assuré perd par euro couvert. En général, le prix juste pour
            couvrir 1 € est la probabilité de la perte : <M tex="p = \pi" />.
          </p>
        </Callout>

        <Callout variant="retiens" title="Théorème · Assurance complète (slide 37)">
          <p>
            Un individu averse au risque <strong>s'assure complètement</strong> lorsque le prix
            de l'assurance est actuariellement juste : il couvre toute la perte,{" "}
            <M tex="C^* = L" />.
          </p>
        </Callout>

        <H3>La preuve, pas à pas (slide 37)</H3>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Mise en place.</strong> Un individu averse au risque possède une richesse{" "}
            <M tex="w > 0" /> qui subit une perte <M tex="L" /> avec probabilité{" "}
            <M tex="\pi" />. Couvrir 1 € coûte <M tex="p = \pi" /> (prix juste). Il couvre{" "}
            <M tex="C" /> euros. Sans perte (probabilité <M tex="1 - \pi" />), il a seulement payé{" "}
            <M tex="pC" /> ; avec perte (probabilité <M tex="\pi" />), il a payé{" "}
            <M tex="pC" />, perdu <M tex="L" /> et touché <M tex="C" /> :
            <MB tex="U(C) = (1 - \pi)\,u(w - pC) + \pi\,u(w - pC - L + C)" />
            (Pour le vélo : <M tex="w = 100" />, <M tex="L = 70" />, <M tex="\pi = 0{,}3" /> ; avec
            le prix 0,4 on retrouve bien <M tex="y = 100 - 0{,}4C" /> et{" "}
            <M tex="x = 30 + 0{,}6C" />.)
          </li>
          <li>
            <strong>Dériver terme à terme.</strong> La dérivée de <M tex="w - pC" /> par rapport
            à <M tex="C" /> vaut <M tex="-p" /> ; celle de <M tex="w - pC - L + C" /> vaut{" "}
            <M tex="1 - p" />. La condition <M tex="\partial U / \partial C = 0" /> donne :
            <MB tex="-p\,(1 - \pi)\,u'(w - pC^*) + \pi\,(1 - p)\,u'(w - pC^* - L + C^*) = 0" />
            <MB tex="\iff \pi\,(1 - p)\,u'(w - pC^* - L + C^*) = p\,(1 - \pi)\,u'(w - pC^*)" />
            (Vélo à 0,4 : <M tex="\pi(1 - p) = 0{,}3 \times 0{,}6 = 0{,}18" /> et{" "}
            <M tex="p(1 - \pi) = 0{,}4 \times 0{,}7 = 0{,}28" /> : c'est la condition de Fatou et
            Hicham.)
          </li>
          <li>
            <strong>Utiliser p = π.</strong> Les deux coefficients deviennent{" "}
            <M tex="\pi(1 - \pi)" /> : on peut les simplifier. La dérivée de <M tex="u" /> est
            identique dans les deux cas :
            <MB tex="u'(w - pC^* - L + C^*) = u'(w - pC^*)" />
          </li>
          <li>
            <strong>Conclure avec u″ &lt; 0.</strong> Comme l'individu est averse (
            <M tex="u'' < 0" />), <M tex="u'" /> est strictement décroissante : elle ne prend
            jamais deux fois la même valeur. Les deux arguments sont donc égaux :
            <MB tex="w - pC^* - L + C^* = w - pC^* \iff C^* - L = 0 \iff C^* = L" />
            Il a la même richesse avec ou sans perte : plus aucun risque.
          </li>
          <li>
            <strong>Vérification sur le vélo.</strong> Au prix juste <M tex="p = 0{,}3" />,{" "}
            <M tex="C^* = L = 70" /> € : il paie <M tex="0{,}3 \times 70 = 21" /> € et a 79 € à coup
            sûr (<M tex="y = 100 - 21 = 79" /> ; <M tex="x = 100 - 21 - 70 + 70 = 79" />). Ces
            79 € sont exactement la VMA sans assurance : au prix juste, s'assurer ne coûte rien en
            VMA et supprime tout le risque, donc un averse s'assure à fond. À 0,40 €, chaque euro
            couvert coûte 0,10 € de VMA : Fatou et Hicham s'arrêtent avant.
          </li>
        </ol>

        <WidgetInsurance />

        <ExerciseBlock
          scope="a3"
          id="ex4"
          number={4}
          title="Prix juste et couverture optimale"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s9", label: "Assurance optimale" }]}
          statement={
            <p>
              Une maison vaut 200 000 € et a une probabilité de 2 % de brûler entièrement dans
              l'année. a) Quel est le prix actuariellement juste pour couvrir 1 € ? b) À ce prix,
              combien un propriétaire averse au risque couvre-t-il, et quelle prime totale
              paie-t-il ? c) Si l'assureur facture 0,05 € par euro couvert, que peux-tu dire de la
              couverture choisie ?
            </p>
          }
          steps={[
            {
              title: "a) Le prix juste",
              content: (
                <p>
                  Prix juste = VMA de la couverture = probabilité du sinistre ={" "}
                  <strong>0,02 €</strong> par euro couvert.
                </p>
              ),
            },
            {
              title: "b) La couverture au prix juste",
              content: (
                <p>
                  Par le théorème d'assurance complète : <M tex="C^* = L" /> ={" "}
                  <strong>200 000 €</strong>. Prime totale = 0,02 × 200 000 ={" "}
                  <strong>4 000 €</strong>. Il finit avec 196 000 € <em>à coup sûr</em>, quoi
                  qu'il arrive.
                </p>
              ),
            },
            {
              title: "c) Un prix au-dessus du juste",
              content: (
                <p>
                  0,05 &gt; 0,02 : le prix est au-dessus du juste. Dans la condition de la
                  preuve, <M tex="\pi(1 - p)\,u'(x) = p\,(1 - \pi)\,u'(y)" /> (ici{" "}
                  <M tex="x" /> = richesse si la maison brûle, <M tex="y" /> = sinon), le
                  coefficient de droite est maintenant plus grand :{" "}
                  <M tex="p(1 - \pi) = 0{,}049 > \pi(1 - p) = 0{,}019" />. Il faut donc{" "}
                  <M tex="u'(x) > u'(y)" />, c'est-à-dire <M tex="x < y" /> : il reste du risque
                  à l'optimum. La couverture est <strong>partielle</strong> :{" "}
                  <M tex="C^* < 200\,000" /> € (voire nulle si le prix est très élevé), exactement
                  comme Fatou et Hicham face au prix de 0,40.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Prix juste = π = 0,02 € ⇒ couverture complète (200 000 €, prime 4 000 €, richesse
              certaine 196 000 €). Prix au-dessus du juste ⇒ couverture partielle. C'est le
              théorème du § 9 appliqué tel quel.
            </p>
          }
        />
      </Section>
    </>
  );
}
