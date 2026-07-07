/**
 * Chapitre A3 · Décision sous incertitude.
 * Conversion fidèle du manuel interactif HTML : loteries et VMA, utilité
 * espérée de von Neumann–Morgenstern, attitudes face au risque, équivalent
 * certain et prime de risque, investissement, diversification, assurance,
 * puis théorie des perspectives, cadrage étroit et biais de probabilité.
 * Les 6 widgets du manuel sont recréés en React/SVG dans ./a3/widgets.
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
} from "./a3/widgets";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-xl font-bold tracking-tight">{children}</h3>;
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

function Tbl({ children, minW = 540 }: { children: ReactNode; minW?: number }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14.5px]" style={{ minWidth: minW }}>
        {children}
      </table>
    </div>
  );
}

const TH =
  "border-b bg-muted/70 px-3.5 py-2.5 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3.5 py-2.5 align-top";
const TDnum = "border-b px-3.5 py-2.5 align-top text-right tabular-nums";

/* ================================================================== */
/* Page du chapitre                                                    */
/* ================================================================== */

export default function Chapter() {
  return (
    <ChapterShell chapterId="a3">
      {/* ============================================================ */}
      {/* § 1 · LE MYSTÈRE DE L'ARGENT QUI DORT                        */}
      {/* ============================================================ */}
      <Section id="s1" kicker="§ 1" title="Le mystère de l'argent qui dort">
        <Lead>
          Pourquoi 336 milliards d'euros dorment-ils sur des comptes belges alors que la bourse
          rapporte 7 % par an en moyenne ? Toute la théorie de ce chapitre part de cette énigme
          très concrète.
        </Lead>

        <p>
          En septembre 2018, <strong>336 milliards d'euros</strong> se trouvaient sur des comptes
          en banque en Belgique, dont 80 milliards sur de simples comptes courants. Or un compte
          courant ne rapporte (presque) <strong>rien</strong>. Pendant ce temps, sur le long
          terme, les actions rapportent en moyenne environ <strong>7 % par an</strong> et
          l'immobilier fait à peine moins bien (Jordà et al., 2019).
        </p>
        <p>
          Fais le calcul : 10 000 € laissés 30 ans sur un compte restent 10 000 € (et perdent
          même de la valeur avec l'inflation, souviens-toi du chapitre A2). Les mêmes 10 000 €
          investis à 7 % deviennent environ <strong>76 000 €</strong>. Alors pourquoi tant
          d'argent dort-il ?
        </p>
        <p>
          La réponse tient en un mot : le retour de 7 % n'est qu'une <em>moyenne</em>. Une action
          Apple achetée en 1985 a été multipliée par des centaines ; une action Lehman Brothers
          achetée en 2007 vaut… zéro. Investir, c'est choisir{" "}
          <strong>sans connaître le résultat</strong>. C'est ce qu'on appelle une décision{" "}
          <strong>sous incertitude</strong>.
        </p>

        <Callout variant="definition" title="Les deux questions du chapitre">
          <p>
            1. Pourquoi y a-t-il tant d'argent qui dort sur des comptes ?<br />
            2. Comment augmenter la fraction de l'épargne investie dans l'économie ?
          </p>
          <p>
            Pour y répondre, il faut d'abord comprendre{" "}
            <em>comment un individu prend ses décisions face à l'incertitude</em>. C'est
            exactement le même programme qu'en A1 (choix certains) et A2 (choix dans le temps),
            mais avec un ingrédient nouveau : les <strong>probabilités</strong>.
          </p>
        </Callout>

        <Callout variant="retiens" title="Fil rouge des chapitres A1 → A2 → A3">
          <p>
            <strong>A1</strong> : choisir entre des paniers <em>certains</em> (une pomme ou une
            poire). <strong>A2</strong> : choisir entre <em>aujourd'hui et demain</em> (consommer
            ou épargner). <strong>A3</strong> : choisir quand demain est <em>incertain</em>{" "}
            (l'action montera-t-elle ou s'effondrera-t-elle ?). À la fin du chapitre, on
            assemblera les trois dans une seule grande formule.
          </p>
          <p className="flex flex-wrap gap-1.5">
            <TheoryRef chapter="a1" label="A1 · Préférences et choix" />
            <TheoryRef chapter="a2" label="A2 · Décision inter-temporelle" />
          </p>
        </Callout>

        <H3>Ce que tu vas apprendre</H3>
        <p>
          Le fil rouge du chapitre : comment un individu choisit-il quand il ne sait pas ce que
          l'avenir lui réserve ? On construit d'abord la théorie <strong>rationnelle</strong>{" "}
          (§ 2–§ 9), puis on regarde comment les humains réels s'en écartent (§ 10–§ 12).
        </p>
        <ol className="my-4 grid list-none gap-2 pl-0 sm:grid-cols-2">
          {[
            ["Mesurer", "un actif risqué : la VMA"],
            ["Comparer", "des loteries : l'utilité espérée"],
            ["Classer", "les gens : averse, neutre, affine au risque"],
            ["Chiffrer", "la peur du risque : équivalent certain & PRM"],
            ["Appliquer", "investissement, diversification, assurance"],
            ["Nuancer", "perspectives, cadrage étroit, biais de probabilité"],
          ].map(([verb, rest], i) => (
            <li key={i} className="rounded-xl border bg-muted/40 px-3.5 py-2 text-[14.5px]">
              <span className="mr-1.5 font-bold text-primary">{i + 1}.</span>
              <strong>{verb}</strong> {rest}
            </li>
          ))}
        </ol>
      </Section>

      {/* ============================================================ */}
      {/* § 2 · ACTIFS RISQUÉS ET VMA                                  */}
      {/* ============================================================ */}
      <Section id="s2" kicker="§ 2" title="Actifs risqués et valeur monétaire attendue">
        <Lead>
          Premier réflexe pour dompter l'incertitude : résumer un actif risqué en un seul chiffre,
          sa moyenne pondérée par les probabilités. On verra tout de suite que ce chiffre ne
          suffit pas.
        </Lead>

        <p>
          Partons de l'exemple du cours. Un épargnant possède 15 $ et hésite entre deux
          placements :
        </p>
        <ul>
          <li>
            une <strong>action</strong> : si la firme fait de bons résultats (probabilité 50 %),
            elle vaudra <M tex="\Pi_1 = 36\ \$" /> ; si les résultats sont mauvais (probabilité
            50 %), elle vaudra <M tex="\Pi_2 = 1\ \$" /> ;
          </li>
          <li>
            une <strong>obligation</strong> : elle vaudra <M tex="\Pi_3 = 16\ \$" /> à coup sûr.
          </li>
        </ul>

        <DecisionTree />

        <p>
          Au moment de choisir, l'épargnant <strong>ne sait pas</strong> laquelle des deux valeurs
          l'action prendra. L'action est une <strong>alternative risquée</strong> (on dit aussi
          une <em>loterie</em>) : elle est entièrement décrite par ses <em>réalisations</em>{" "}
          possibles <strong>et</strong> par les <em>probabilités</em> associées. Première idée
          naturelle pour la résumer en un seul chiffre : sa moyenne.
        </p>

        <Callout variant="definition" title="Définition · Valeur monétaire attendue">
          <p>
            Soit un actif risqué <M tex="a" /> qui vaudra <M tex="y" /> avec probabilité{" "}
            <M tex="\pi" /> et <M tex="x" /> avec probabilité <M tex="1-\pi" />. Sa{" "}
            <strong>valeur monétaire attendue</strong> est
          </p>
          <MB tex="\mathrm{VMA}(a) = \pi\, y + (1-\pi)\, x" />
          <p>
            C'est la moyenne des valeurs possibles, <em>pondérée par les probabilités</em> : le
            montant que tu obtiendrais <strong>en moyenne</strong> si tu pouvais rejouer l'actif
            un très grand nombre de fois.
          </p>
        </Callout>

        <p>
          Application immédiate : VMA(action) = ½ × 36 + ½ × 1 = <strong>18,5 $</strong> et
          VMA(obligation) = 16 $. Manipule le widget ci-dessous pour sentir la VMA comme un{" "}
          <em>point d'équilibre</em> qui glisse entre <M tex="x" /> et <M tex="y" /> selon la
          probabilité.
        </p>

        <WidgetVMA />

        <H3>La VMA suffit-elle pour choisir ?</H3>
        <p>
          Si la VMA était le seul critère, tout le monde devrait choisir l'action
          (18,5 &gt; 16). Teste-toi d'abord sur la question posée en amphi :
        </p>

        <PollCard
          tag="Sondage d'amphi nº 1"
          question="Que préfères-tu ?"
          options={[
            { label: <>1 · Recevoir 3 millions € à coup sûr</>, pct: 97 },
            { label: <>2 · Pile ou face : 10 millions € si pile, 0 € si face</>, pct: 3 },
          ]}
          note={
            <>
              Or VMA(option 2) = ½ × 10 M€ = <strong>5 millions €</strong>, largement plus que
              3 M€. Presque tout le monde « laisse » donc 2 millions de VMA sur la table pour
              éviter le risque. Conclusion du cours :{" "}
              <strong>la VMA n'est pas la seule chose qui compte</strong>. Il nous faut une
              meilleure théorie → § 3 et § 4.
            </>
          }
        />

        <ExerciseBlock
          scope="a3"
          id="ex1"
          number={1}
          title="Premier calcul de VMA"
          difficulty={1}
          refs={[{ chapter: "a3", section: "s2", label: "VMA" }]}
          statement={
            <p>
              Un actif <M tex="b" /> rapporte 80 € avec une probabilité de 25 % et 20 € sinon.
              <br />
              a) Calcule VMA(<M tex="b" />
              ). b) Un individu qui ne regarde <em>que</em> la VMA préfère-t-il <M tex="b" /> ou
              40 € certains ?
            </p>
          }
          steps={[
            {
              title: "Identifier les ingrédients",
              content: (
                <p>
                  <M tex="y = 80" />, <M tex="\pi = 0{,}25" />, <M tex="x = 20" />,{" "}
                  <M tex="1-\pi = 0{,}75" />.
                </p>
              ),
            },
            {
              title: "Appliquer la formule",
              content: (
                <p>
                  VMA(<M tex="b" />) = 0,25 × 80 + 0,75 × 20 = 20 + 15 = <strong>35 €</strong>.
                  (Piège classique : la moyenne <em>simple</em> (80 + 20)/2 = 50 est fausse, car
                  les probabilités ne sont pas égales.)
                </p>
              ),
            },
            {
              title: "Comparer avec le montant certain",
              content: (
                <p>
                  Comme 40 &gt; 35, un individu qui ne compare que les VMA choisit les{" "}
                  <strong>40 € certains</strong> — ici, même sans aversion au risque, la loterie
                  perd.
                </p>
              ),
            },
          ]}
          result={
            <p>
              VMA(<M tex="b" />) = <strong>35 €</strong> ; l'individu « VMA-seulement » prend les
              40 € certains. Retiens le réflexe : toujours <em>pondérer</em> par les probabilités,
              jamais de moyenne simple quand les probabilités diffèrent.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3 · PRÉFÉRENCES RATIONNELLES SUR DES LOTERIES              */}
      {/* ============================================================ */}
      <Section id="s3" kicker="§ 3" title="Préférences rationnelles sur des loteries">
        <Lead>
          Les quatre propriétés de rationalité du chapitre A1 restent valables. Mais les loteries
          ont une nature spéciale — leurs réalisations s'excluent mutuellement — qui impose une
          propriété supplémentaire : l'indépendance.
        </Lead>

        <p>
          En A1, on avait défini un individu <em>rationnel</em> par les propriétés de ses
          préférences. Ces propriétés restent valables ici, mais les alternatives ont une nature
          nouvelle : chacune est un couple « réalisations + probabilités ». Cette nature
          particulière impose une propriété <strong>supplémentaire</strong>.
        </p>

        <Callout variant="retiens" title="Rappel du chapitre A1">
          <p>
            Des préférences rationnelles sont <strong>complètes</strong> (je peux toujours
            comparer deux options), <strong>transitives</strong> (si <M tex="a \succsim b" /> et{" "}
            <M tex="b \succsim c" /> alors <M tex="a \succsim c" />
            ), <strong>monotones</strong> (plus d'argent, c'est mieux) et{" "}
            <strong>continues</strong> (pas de sauts brusques). Rien de neuf : ces quatre
            propriétés s'appliquent telles quelles aux loteries.{" "}
            <TheoryRef chapter="a1" section="pref" label="Les préférences" />
          </p>
        </Callout>

        <Callout variant="definition" title="Propriété nouvelle · Indépendance">
          <p>
            Les réalisations d'une loterie sont <strong>mutuellement exclusives</strong> : une
            seule se produira. Conséquence : mélanger deux loteries avec des probabilités, ce
            n'est pas mélanger leurs contenus. La propriété d'indépendance impose alors que les
            préférences dépendent <strong>de manière linéaire des probabilités</strong>.
          </p>
        </Callout>

        <p>L'intuition du cours, avec des réalisations non monétaires :</p>
        <ul>
          <li>
            Tu peux être indifférent entre (1) <em>un verre de vin</em> et (2){" "}
            <em>un verre de bière</em>… sans être indifférent entre (1) un verre de vin et (3′){" "}
            <em>un demi-verre de vin suivi d'un demi-verre de bière</em>. Le mélange physique est
            une <strong>troisième</strong> option, avec son propre goût.
          </li>
          <li>
            En revanche, si tu es indifférent entre vin et bière, tu <strong>seras</strong>{" "}
            indifférent entre (1) un verre de vin et (3){" "}
            <em>50 % de chances d'avoir un verre de vin, 50 % d'avoir un verre de bière</em>. Car
            avec (3), tu boiras <em>soit</em> l'un, <em>soit</em> l'autre — jamais un mélange.
            Aucune nouvelle expérience n'apparaît, seules les probabilités bougent entre deux
            issues que tu juges équivalentes.
          </li>
        </ul>

        <Callout variant="attention" title="Piège d'examen">
          <p>
            Ne confonds pas <em>mélange de probabilités</em> (rester dans le monde des loteries :
            indifférence préservée) et <em>mélange de biens</em> (créer un nouveau panier : tout
            peut changer). C'est exactement la subtilité que teste la propriété d'indépendance.
          </p>
        </Callout>

        <Quiz
          scope="a3"
          id="q1"
          question={
            <p>
              Tu es indifférent entre un verre de vin et un verre de bière. D'après la propriété
              d'indépendance, tu dois aussi être indifférent entre un verre de vin et…
            </p>
          }
          options={[
            {
              text: (
                <>
                  la loterie « 50 % de chances : un verre de vin ; 50 % de chances : un verre de
                  bière »
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact. Avec cette loterie tu boiras <em>soit</em> l'un, <em>soit</em> l'autre —
                  jamais un mélange. Aucune expérience nouvelle n'apparaît : seules les
                  probabilités bougent entre deux issues que tu juges équivalentes.
                </>
              ),
            },
            {
              text: <>un demi-verre de vin suivi d'un demi-verre de bière</>,
              explain: (
                <>
                  Non : ceci est un <strong>mélange physique</strong>, une troisième option avec
                  son propre goût. La propriété d'indépendance ne dit rien sur ce panier-là —
                  c'est précisément le piège à éviter.
                </>
              ),
            },
            {
              text: <>n'importe quelle loterie contenant du vin ou de la bière</>,
              explain: (
                <>
                  Trop fort : l'indépendance ne s'applique qu'aux loteries qui redistribuent les
                  probabilités entre des issues jugées équivalentes (ici 50/50 entre vin et
                  bière), pas à n'importe quelle combinaison.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Mélanger des <strong>probabilités</strong> entre deux issues équivalentes préserve
              l'indifférence ; mélanger des <strong>biens</strong> crée une nouvelle alternative.
              C'est la clé de la propriété d'indépendance.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 4 · L'UTILITÉ ESPÉRÉE (vNM)                                */}
      {/* ============================================================ */}
      <Section id="s4" kicker="§ 4" title="L'utilité espérée de von Neumann–Morgenstern">
        <Lead>
          Le résultat central de la partie « rationnelle » : un individu rationnel se comporte
          comme s'il calculait la moyenne pondérée non pas des montants, mais des utilités des
          montants.
        </Lead>

        <p>
          Voici le résultat central de la partie « rationnelle » du chapitre. Si un individu a des
          préférences rationnelles (les 4 propriétés de A1 + l'indépendance), alors on peut{" "}
          <em>prouver</em> que ses choix se comportent <strong>comme s'il</strong> calculait une
          moyenne — non pas des montants, mais des <strong>utilités</strong> des montants.
        </p>

        <Callout variant="retiens" title="Théorème · von Neumann & Morgenstern (1953)">
          <p>
            Des préférences rationnelles sur des loteries sont représentées par la fonction
            d'utilité <strong>espérée</strong>
          </p>
          <MB tex="U(a) = \pi\, u(y) + (1-\pi)\, u(x) \qquad (1)" />
          <p>
            où <M tex="u : \mathbb{R}_+ \to \mathbb{R}" />, la fonction d'utilité de{" "}
            <strong>Bernoulli</strong>, est strictement croissante : <M tex="u'(w) > 0" /> pour
            tout montant <M tex="w" />.
          </p>
        </Callout>

        <Callout variant="attention" title="À bien distinguer (question d'examen favorite)">
          <p>
            <strong>
              <M tex="u" /> minuscule (Bernoulli)
            </strong>{" "}
            évalue un <em>montant certain</em> : <M tex="u(36)" /> = utilité d'avoir 36 € en
            poche.
            <br />
            <strong>
              <M tex="U" /> majuscule (vNM)
            </strong>{" "}
            évalue une <em>loterie entière</em> : c'est la moyenne pondérée des <M tex="u" />. On
            calcule <M tex="u" /> <em>d'abord</em> sur chaque réalisation, on pondère{" "}
            <em>ensuite</em>. L'erreur classique est de faire l'inverse :{" "}
            <M tex="u(\mathrm{VMA}) \ne U(a)" /> en général — toute la § 6 repose sur cette
            différence !
          </p>
        </Callout>

        <H3>Deux individus, deux choix — tous deux rationnels</H3>
        <p>
          Reprenons l'action (36 $ ou 1 $, à 50/50) contre l'obligation (16 $ sûr) avec les deux
          personnages du cours.
        </p>

        <Callout variant="exemple" title="Exemple · Jean, u(w) = √w">
          <p>
            <M tex="U(\text{action}) = \tfrac{1}{2}\sqrt{36} + \tfrac{1}{2}\sqrt{1} = \tfrac{1}{2}\times 6 + \tfrac{1}{2}\times 1 = \mathbf{3{,}5}" />{" "}
            &ensp;|&ensp; <M tex="U(\text{obligation}) = \sqrt{16} = \mathbf{4}" />
          </p>
          <p>
            → Jean préfère <strong>l'obligation</strong>, pourtant de VMA plus faible. La racine
            carrée « écrase » les grands montants : passer de 1 à 36 $ ne multiplie l'utilité que
            par 6.
          </p>
        </Callout>

        <Callout variant="exemple" title="Exemple · Sarah, ũ(w) = 2w">
          <p>
            <M tex="U(\text{action}) = \tfrac{1}{2}(2\times 36) + \tfrac{1}{2}(2\times 1) = 36 + 1 = \mathbf{37}" />{" "}
            &ensp;|&ensp; <M tex="U(\text{obligation}) = 2\times 16 = \mathbf{32}" />
          </p>
          <p>
            → Sarah préfère <strong>l'action</strong>. Sa fonction est linéaire : elle classe les
            actifs exactement comme la VMA.
          </p>
        </Callout>

        <p>
          Moralité : le choix rationnel <strong>dépend de la fonction de Bernoulli</strong>. Deux
          individus rationnels peuvent faire des choix opposés face aux mêmes loteries — leur
          « courbure » de <M tex="u" /> encode leur rapport au risque (§ 5).
        </p>

        <H3>Et l'efficacité de Pareto ?</H3>
        <p>
          Les critères de Pareto vus en A1 fonctionnent encore, à condition de mesurer le payoff
          de chacun par son <strong>utilité espérée</strong>. Exemple du cours :{" "}
          <TheoryRef chapter="a1" section="pareto" />
        </p>

        <Tbl minW={520}>
          <thead>
            <tr>
              <th className={TH}>Allocation</th>
              <th className={`${TH} text-right`}>Jean (√w)</th>
              <th className={`${TH} text-right`}>Sarah (2w)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>Allocation 1 : Jean a l'action, Sarah l'obligation</td>
              <td className={TDnum}>3,5</td>
              <td className={TDnum}>32</td>
            </tr>
            <tr>
              <td className={TD}>Allocation 2 : Jean a l'obligation, Sarah l'action</td>
              <td className={TDnum}>
                <strong>4</strong>
              </td>
              <td className={TDnum}>
                <strong>37</strong>
              </td>
            </tr>
          </tbody>
        </Tbl>

        <p>
          L'allocation 2 donne plus d'utilité espérée <em>aux deux</em> : elle{" "}
          <strong>domine au sens de Pareto</strong>. Intuition élégante : donner l'actif risqué à
          celle qui aime le risque, et l'actif sûr à celui qui le fuit, améliore la situation de
          tout le monde. C'est une des raisons d'être des marchés financiers.
        </p>

        <Quiz
          scope="a3"
          id="q2"
          question={
            <p>
              Jean (u = √w) détient l'action, Sarah (ũ = 2w) détient l'obligation. Que dit le
              critère de Pareto de l'allocation où ils échangent leurs actifs ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Elle domine l'allocation initiale : l'utilité espérée des <em>deux</em> augmente
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : Jean passe de 3,5 à 4 et Sarah de 32 à 37. Donner l'actif risqué à celle
                  qui craint le moins le risque et l'actif sûr à celui qui le fuit améliore la
                  situation de tout le monde — c'est une raison d'être des marchés financiers.
                </>
              ),
            },
            {
              text: <>Elle profite à Jean mais nuit à Sarah, donc Pareto ne conclut pas</>,
              explain: (
                <>
                  Refais le calcul : Sarah passe de U = 32 (obligation) à U = 37 (action). Les
                  deux gagnent à l'échange.
                </>
              ),
            },
            {
              text: <>Le critère de Pareto ne s'applique pas aux actifs risqués</>,
              explain: (
                <>
                  Si : il suffit de mesurer le payoff de chacun par son{" "}
                  <strong>utilité espérée</strong>. Les critères de Pareto de A1 fonctionnent
                  alors tels quels.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 5 · LES TROIS ATTITUDES FACE AU RISQUE                     */}
      {/* ============================================================ */}
      <Section id="s5" kicker="§ 5" title="Les trois attitudes face au risque">
        <Lead>
          Pour isoler l'effet pur du risque, on compare deux actifs de même VMA mais de dispersion
          différente. La réaction de l'individu à cette comparaison définit son attitude — et se
          lit directement dans la courbure de sa fonction u.
        </Lead>

        <p>
          Pour comparer les attitudes proprement, le cours construit deux actifs de{" "}
          <strong>même VMA</strong> mais de risques différents. Avec <M tex="y > x" /> et{" "}
          <M tex="z > 0" /> :
        </p>

        <Tbl minW={540}>
          <thead>
            <tr>
              <th className={TH}>Actif</th>
              <th className={`${TH} text-right`}>Réalisation haute (50 %)</th>
              <th className={`${TH} text-right`}>Réalisation basse (50 %)</th>
              <th className={`${TH} text-right`}>VMA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <M tex="a" />
              </td>
              <td className={TDnum}>
                <M tex="y" />
              </td>
              <td className={TDnum}>
                <M tex="x" />
              </td>
              <td className={TDnum}>
                <M tex="\tfrac{1}{2}(x+y)" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="a'" /> (plus risqué)
              </td>
              <td className={TDnum}>
                <M tex="y + z" />
              </td>
              <td className={TDnum}>
                <M tex="x - z" />
              </td>
              <td className={TDnum}>
                <M tex="\tfrac{1}{2}(x+y)" />
              </td>
            </tr>
          </tbody>
        </Tbl>

        <p>
          L'actif <M tex="a'" /> « écarte » les deux issues de <M tex="z" /> : même moyenne,
          dispersion plus grande. La comparaison entre <M tex="a" /> et <M tex="a'" /> isole donc
          l'effet <em>pur</em> du risque.
        </p>

        <Callout variant="definition" title="Définitions · Attitudes face au risque">
          <p>
            Un individu <strong>neutre au risque</strong> est indifférent entre <M tex="a" /> et{" "}
            <M tex="a'" /> — seule compte la VMA.
            <br />
            Un individu <strong>averse au risque</strong> préfère <M tex="a" /> à <M tex="a'" /> —
            il fuit la dispersion.
            <br />
            Un individu ayant une <strong>affinité au risque</strong> préfère <M tex="a'" /> à{" "}
            <M tex="a" /> — il recherche la dispersion.
          </p>
        </Callout>

        <PollCard
          tag="Sondage d'amphi nº 2"
          question="À quelle version de pile ou face préfères-tu jouer ?"
          options={[
            { label: <>1 · Pile : 3 000 € — Face : 2 000 €</>, pct: 82 },
            { label: <>2 · Pile : 4 000 € — Face : 1 000 €</>, pct: 18 },
          ]}
          note={
            <>
              Les deux loteries ont la même VMA (2 500 €) : l'option 2 est exactement un{" "}
              <M tex="a'" /> avec <M tex="z = 1\,000" />. La grande majorité choisit la version
              resserrée → <strong>la plupart des gens sont averses au risque</strong>.
            </>
          }
        />

        <H3>Le lien avec la forme de u : le cœur du chapitre</H3>

        <Callout variant="retiens" title="Théorème · Neutralité au risque">
          <p>
            Un individu est neutre au risque si et seulement si sa fonction de Bernoulli est{" "}
            <strong>linéaire</strong> : <M tex="u(w) = bw + d" /> avec <M tex="b > 0" />. Dans ce
            cas, pour tous actifs <M tex="a''" /> et <M tex="a'''" /> :
          </p>
          <MB tex="U(a'') \ge U(a''') \iff \mathrm{VMA}(a'') \ge \mathrm{VMA}(a''')" />
          <p>
            <em>Idée de la preuve</em> (à savoir raconter) : si <M tex="u" /> est linéaire, alors{" "}
            <M tex="U(a) = \pi(by+d) + (1-\pi)(bx+d) = b\cdot\mathrm{VMA}(a) + d" />. L'utilité
            espérée est une transformation croissante de la VMA : classer par <M tex="U" /> ou
            par VMA revient au même. Sarah (ũ = 2w) est exactement dans ce cas.
          </p>
        </Callout>

        <Callout variant="retiens" title="Théorème · Aversion au risque">
          <p>
            Un individu est <strong>averse au risque</strong> si et seulement si son utilité
            marginale de la richesse est <strong>décroissante</strong>, autrement dit si et
            seulement si sa fonction de Bernoulli est <strong>concave</strong> :
          </p>
          <MB tex="u''(w) < 0 \quad \text{pour tout } w > 0" />
          <p>
            <em>Idée de la preuve</em> : si <M tex="u" /> est concave, chaque euro supplémentaire
            apporte moins que le précédent. Donc le gain d'utilité <M tex="u(w+z) - u(w)" /> est{" "}
            <em>plus petit</em> que la perte d'utilité <M tex="u(w) - u(w-z)" />. Le pari
            équilibré « +z ou −z » fait perdre plus d'utilité qu'il n'en rapporte : on le refuse.
            Symétriquement,{" "}
            <strong>
              affinité au risque ⇔ <M tex="u" /> convexe
            </strong>{" "}
            (<M tex="u'' > 0" />
            ).
          </p>
        </Callout>

        <Callout variant="intuition" title="Lien avec A1 & A2 : une seule idée, trois chapitres">
          <p>
            Tu as déjà rencontré cette concavité deux fois ! En A1, l'
            <strong>utilité marginale décroissante</strong> expliquait pourquoi on diversifie sa
            consommation. En A2, c'est elle qui poussait à <strong>lisser la consommation</strong>{" "}
            entre aujourd'hui et demain (équation d'Euler). Ici, la même hypothèse —{" "}
            <M tex="u'' < 0" /> — explique pourquoi on fuit le risque.{" "}
            <TheoryRef chapter="a2" section="choix" label="Le choix optimal (Euler)" />
          </p>
        </Callout>

        <ExerciseBlock
          scope="a3"
          id="ex2"
          number={2}
          title="Diagnostiquer une attitude"
          difficulty={1}
          refs={[{ chapter: "a3", section: "s5", label: "Attitudes face au risque" }]}
          statement={
            <p>
              Quelle est l'attitude face au risque d'un individu dont la fonction de Bernoulli est
              a) <M tex="u(w) = w^2" /> ; b) <M tex="u(w) = \ln(w)" /> ; c){" "}
              <M tex="u(w) = 5w + 3" /> ?
            </p>
          }
          steps={[
            {
              title: "La méthode",
              content: (
                <p>
                  La méthode est toujours la même : dériver deux fois et regarder le{" "}
                  <strong>
                    signe de <M tex="u''" />
                  </strong>
                  .
                </p>
              ),
            },
            {
              title: "a) u(w) = w²",
              content: (
                <p>
                  <M tex="u' = 2w" />, <M tex="u'' = 2 > 0" /> → convexe →{" "}
                  <strong>affinité au risque</strong>.
                </p>
              ),
            },
            {
              title: "b) u(w) = ln(w)",
              content: (
                <p>
                  <M tex="u' = 1/w" />, <M tex="u'' = -1/w^2 < 0" /> → concave →{" "}
                  <strong>aversion au risque</strong>.
                </p>
              ),
            },
            {
              title: "c) u(w) = 5w + 3",
              content: (
                <p>
                  <M tex="u' = 5" />, <M tex="u'' = 0" /> → linéaire →{" "}
                  <strong>neutralité au risque</strong> (classe les actifs par VMA).
                </p>
              ),
            },
          ]}
          result={
            <p>
              Le diagnostic tient en un signe : <M tex="u'' > 0" /> affinité,{" "}
              <M tex="u'' < 0" /> aversion, <M tex="u'' = 0" /> neutralité. Réflexe d'examen à
              automatiser.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 6 · ÉQUIVALENT CERTAIN ET PRIME DE RISQUE                  */}
      {/* ============================================================ */}
      <Section id="s6" kicker="§ 6" title="Équivalent certain et prime de risque">
        <Lead>
          « Averse au risque » n'est pas tout ou rien : deux définitions permettent de chiffrer
          exactement combien un individu est prêt à payer pour éviter le risque.
        </Lead>

        <p>
          Un individu averse au risque préfère l'actif sûr <em>à VMA égale</em>. Mais par
          continuité (propriété de A1 !), il acceptera parfois un actif risqué si la VMA de
          celui-ci est <em>suffisamment</em> plus élevée — souviens-toi des 3 millions certains
          contre la loterie de VMA 5 millions : 3 % des étudiants la prenaient quand même. Deux
          définitions permettent de <strong>chiffrer</strong> exactement cette peur du risque.
        </p>

        <Callout variant="definition" title="Définitions · Équivalent certain C(aᵣ) et PRM(aᵣ)">
          <p>
            L'<strong>équivalent certain</strong> <M tex="C(a_r)" /> d'un actif risqué{" "}
            <M tex="a_r" /> est le montant <em>sans risque</em> qui procure la même utilité :
          </p>
          <MB tex="U(a_r) = u\big(C(a_r)\big)" />
          <p>
            La <strong>prime de risque minimale</strong> est l'écart entre la moyenne de l'actif
            et son équivalent certain :
          </p>
          <MB tex="\mathrm{PRM}(a_r) = \mathrm{VMA}(a_r) - C(a_r)" />
          <p>
            Pour un individu <strong>averse</strong> au risque :{" "}
            <M tex="C(a_r) < \mathrm{VMA}(a_r)" />, donc <M tex="\mathrm{PRM} > 0" />.
          </p>
        </Callout>

        <p>
          Traduction en français courant : <M tex="C(a_r)" /> est le <strong>prix maximum</strong>{" "}
          que l'individu accepte de payer pour l'actif (« à combien me rachèterais-tu ce billet de
          loterie ? »). La PRM est le <strong>rabais sur la moyenne</strong> qu'il exige pour
          supporter le risque — c'est aussi la marge dont un vendeur d'actif risqué doit baisser
          son prix <M tex="p" /> sous la VMA pour convaincre : il faut <M tex="p \le C(a_r)" />.
        </p>
        <p>
          Le graphique ci-dessous est <strong>LE graphique du chapitre</strong> (slides 21 et
          23) : apprends à le reconstruire les yeux fermés. La corde (droite fine) relie les deux
          réalisations ; son point du milieu donne l'utilité espérée <M tex="U(a_r)" /> ; on
          remonte horizontalement jusqu'à la courbe pour lire <M tex="C(a_r)" />.
        </p>

        <WidgetChordCurve />

        <Callout variant="attention" title="Lecture du graphique — à retenir">
          <p>
            Courbe <strong>concave</strong> → la corde passe <em>sous</em> la courbe →{" "}
            <M tex="U(a_r) < u(\mathrm{VMA})" /> → <M tex="C < \mathrm{VMA}" /> →{" "}
            <strong>PRM &gt; 0</strong>.
            <br />
            Courbe <strong>linéaire</strong> → la corde est <em>sur</em> la courbe → PRM = 0.
            <br />
            Courbe <strong>convexe</strong> → la corde passe <em>au-dessus</em> →{" "}
            <M tex="C > \mathrm{VMA}" /> → <strong>PRM {"<"} 0</strong> (l'individu paierait{" "}
            <em>plus</em> que la moyenne pour avoir le frisson).
          </p>
        </Callout>

        <ExerciseBlock
          scope="a3"
          id="ex3"
          number={3}
          title="Calculer C et PRM avec u(w) = ln(w) — exercice du cours"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s6", label: "Équivalent certain & PRM" }]}
          statement={
            <p>
              Un individu rationnel a <M tex="u(w) = \ln(w)" />. Une action <M tex="a" /> rapporte{" "}
              <M tex="y = 110" /> € avec probabilité 75 % et <M tex="x = 70" /> € avec probabilité
              25 %. Calcule VMA(<M tex="a" />
              ), C(<M tex="a" />) et PRM(<M tex="a" />
              ).
            </p>
          }
          steps={[
            {
              title: "La VMA",
              content: (
                <p>
                  <M tex="\mathrm{VMA}(a) = 0{,}75 \times 110 + 0{,}25 \times 70 = 82{,}5 + 17{,}5 = \mathbf{100}" />{" "}
                  €.
                </p>
              ),
            },
            {
              title: "L'utilité espérée",
              content: (
                <p>
                  <M tex="U(a) = 0{,}75\ln(110) + 0{,}25\ln(70) \approx 0{,}75 \times 4{,}7005 + 0{,}25 \times 4{,}2485 \approx \mathbf{4{,}5875}" />
                  .
                </p>
              ),
            },
            {
              title: "L'équivalent certain",
              content: (
                <p>
                  Il faut résoudre <M tex="u(C) = U(a)" />, c'est-à-dire{" "}
                  <M tex="\ln(C) = 4{,}5875" />. On <em>inverse</em> la fonction :{" "}
                  <M tex="C = e^{4{,}5875} \approx \mathbf{98{,}25}" /> €. (Astuce générale :{" "}
                  <M tex="C = u^{-1}(U)" />. Avec √, on élèverait au carré ; avec ln, on prend
                  l'exponentielle.)
                </p>
              ),
            },
            {
              title: "La PRM",
              content: (
                <p>
                  <M tex="\mathrm{PRM} = \mathrm{VMA} - C = 100 - 98{,}25 = \mathbf{1{,}75}" /> €.
                  Interprétation : cet individu est indifférent entre l'action et 98,25 € cash ;
                  il « paie » 1,75 € de moyenne pour se débarrasser du risque.
                </p>
              ),
            },
          ]}
          result={
            <p>
              VMA = 100 €, C ≈ 98,25 €, PRM ≈ 1,75 €. La chaîne de calcul à mémoriser : VMA →
              utilité espérée <M tex="U" /> → inverser <M tex="u" /> pour trouver{" "}
              <M tex="C = u^{-1}(U)" /> → PRM = VMA − C.
            </p>
          }
        />
      </Section>

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
          un projet favorable. Combien met-il sur la table ? La réponse explique déjà la moitié du
          mystère de la § 1.
        </Lead>

        <p>
          On peut maintenant répondre à la première question du chapitre. Un individu averse au
          risque <em>peut</em> vouloir investir dans un actif risqué — si la prime qu'il offre est
          suffisante. La question devient : <strong>quelle part de sa richesse</strong> ? Voici le
          modèle du cours.
        </p>

        <Callout variant="exemple" title="Mise en place du problème">
          <p>
            Richesse <M tex="w = 160" /> €. L'individu investit un montant{" "}
            <M tex="A \in [0, 160]" /> dans un projet. Chaque euro investi rend{" "}
            <strong>4 €</strong> avec probabilité 70 % (le projet réussit) ou{" "}
            <strong>0,20 €</strong> avec probabilité 30 % (il échoue). La valeur finale du{" "}
            <strong>portefeuille</strong> (argent gardé + résultat du projet) est donc :
          </p>
          <MB tex="y = 160 - A + 4A = 160 + 3A \ \text{(réussite)} \qquad x = 160 - A + 0{,}2A = 160 - 0{,}8A \ \text{(échec)}" />
          <p>
            Chaque euro investi <em>écarte</em> les deux scénarios : +3 € dans le bon, −0,80 €
            dans le mauvais. Plus <M tex="A" /> est grand, plus la VMA du portefeuille monte
            (0,7 × 3 − 0,3 × 0,8 = +1,86 € par euro investi)… mais plus le risque grandit.
          </p>
        </Callout>

        <p>
          L'individu choisit <M tex="A" /> pour maximiser son utilité espérée
        </p>
        <FormulaBox
          tex="U(A) = \tfrac{7}{10}\, u(160 + 3A) + \tfrac{3}{10}\, u(160 - 0{,}8A)"
          label="Le programme de l'investisseur"
          caption={
            <>
              La condition de premier ordre est, comme en A2,{" "}
              <M tex="\partial U / \partial A = 0" /> : à l'optimum <M tex="A^*" />, le gain
              marginal d'utilité du dernier euro investi (via le bon scénario) compense exactement
              sa perte marginale (via le mauvais).
            </>
          }
        />

        <WidgetInvest />

        <Callout variant="retiens" title="Conclusion économique nº 1">
          <p>
            Le montant optimal investi <M tex="A^*" /> est{" "}
            <strong>d'autant plus petit que l'individu est averse au risque</strong> (compare √w
            et ln w dans le widget : ln, plus concave, investit moins). ⇒ Beaucoup d'argent dort
            sur les comptes quand les gens sont très averses au risque. Première réponse —
            rationnelle — au mystère de la § 1.
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
                  Exact : dans le widget, √w pousse jusqu'à A* = 160 € (tout investir) alors que
                  ln w s'arrête à A* = 124 €. Plus l'aversion est forte, plus le sommet de la
                  colline U(A) recule vers la gauche.
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
          Jusqu'ici, un seul actif risqué. Mais un portefeuille en contient plusieurs, et ce qui
          compte alors est la <strong>corrélation</strong> entre leurs risques : leurs valeurs
          montent-elles et descendent-elles <em>ensemble</em> ? Le cours compare trois
          portefeuilles composés de deux actions, chacune valant <M tex="y" /> ou <M tex="x" /> (
          <M tex="y > x" />) à 50/50.
        </p>

        <Tbl minW={620}>
          <thead>
            <tr>
              <th className={TH}>Cas</th>
              <th className={TH}>Exemple</th>
              <th className={TH}>Valeurs possibles du portefeuille</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <strong>1 · Corrélation positive parfaite</strong>
              </td>
              <td className={TD}>
                2 actions de la <em>même</em> firme de parapluies
              </td>
              <td className={TD}>
                <M tex="2y" /> (50 %) ou <M tex="2x" /> (50 %)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>2 · Corrélation négative parfaite</strong>
              </td>
              <td className={TD}>parapluies + crème solaire</td>
              <td className={TD}>
                <M tex="y + x" /> à coup sûr (100 %)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>3 · Corrélation nulle</strong>
              </td>
              <td className={TD}>parapluies + t-shirts des Diables rouges</td>
              <td className={TD}>
                <M tex="2y" /> (25 %), <M tex="y + x" /> (50 %), <M tex="2x" /> (25 %)
              </td>
            </tr>
          </tbody>
        </Tbl>

        <p>
          Décortiquons le cas 2, le plus magique : s'il pleut, les parapluies cartonnent (
          <M tex="y" />) et la crème solaire flop (<M tex="x" />) ; s'il fait soleil, c'est
          l'inverse. Dans <strong>tous</strong> les états du monde, le portefeuille vaut{" "}
          <M tex="y + x" /> : deux actifs risqués ont fabriqué un portefeuille{" "}
          <strong>sans aucun risque</strong>. Dans le cas 3, les quatre combinaisons météo ×
          qualification sont équiprobables (25 % chacune) et le risque est partiellement lissé.
        </p>
        <p>
          Les trois portefeuilles ont la <strong>même VMA</strong> (= <M tex="x + y" />
          ). Leurs utilités espérées :
        </p>
        <MB tex="U(\text{cas 1}) = \tfrac{1}{2}u(2y) + \tfrac{1}{2}u(2x) \qquad U(\text{cas 2}) = u(y+x) \qquad U(\text{cas 3}) = \tfrac{1}{4}u(2y) + \tfrac{1}{2}u(y+x) + \tfrac{1}{4}u(2x)" />

        <Callout variant="retiens" title="Classement">
          <p>
            Pour un individu <strong>averse au risque</strong> :{" "}
            <M tex="U(\text{cas 2}) > U(\text{cas 3}) > U(\text{cas 1})" />. À VMA égale, moins de
            risque = plus d'utilité espérée.
            <br />
            Pour un individu <strong>neutre au risque</strong> : les trois sont équivalents (seule
            la VMA compte).
          </p>
        </Callout>

        <Callout variant="exemple" title="Portée pratique">
          <p>
            <strong>Diversifier</strong>, c'est chercher des actifs peu ou négativement corrélés
            pour réduire le risque total sans sacrifier la VMA. La bourse permet de répartir les
            risques entre investisseurs ; l'<strong>or</strong> est une « valeur refuge » car il
            est corrélé <em>négativement</em> aux actions — il joue le rôle de la crème solaire.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 9 · APPLICATION 2 : S'ASSURER                              */}
      {/* ============================================================ */}
      <Section id="s9" kicker="§ 9" title="Application 2 · Combien s'assurer ?">
        <Lead>
          L'assurance est le miroir de l'investissement : au lieu de payer pour prendre du risque,
          on paie pour s'en débarrasser. Même méthode — poser y et x, écrire U, dériver — et un
          théorème élégant à la clé.
        </Lead>

        <p>
          L'assurance est le miroir de l'investissement : au lieu de <em>payer pour prendre</em>{" "}
          du risque (en espérant une VMA plus haute), on <em>paie pour se débarrasser</em> du
          risque (en acceptant une VMA plus basse). Le modèle du cours :
        </p>

        <Callout variant="exemple" title="Mise en place du problème">
          <p>
            L'individu possède 30 € sur son compte et un vélo qui vaut 70 € (richesse totale
            100 €). Le vélo a une probabilité de 30 % d'être volé. Couvrir 1 € contre le vol coûte{" "}
            <M tex="p = 0{,}40" /> €. S'il couvre <M tex="C" /> euros, il paie <M tex="0{,}4C" />{" "}
            tout de suite et touche <M tex="C" /> en cas de vol :
          </p>
          <MB tex="y = 100 - 0{,}4C \ \text{(pas de vol, 70 %)} \qquad x = 100 - 0{,}4C - 70 + C = 30 + 0{,}6C \ \text{(vol, 30 %)}" />
          <p>
            Chaque euro couvert <em>rapproche</em> les deux scénarios : −0,40 € dans le bon,
            +0,60 € dans le mauvais. À couverture complète (<M tex="C = 70" />
            ), les deux droites se rejoignent : <M tex="y = x = 72" /> €, plus aucun risque.
          </p>
        </Callout>

        <p>
          L'individu choisit <M tex="C" /> pour maximiser
        </p>
        <FormulaBox
          tex="U(C) = \tfrac{7}{10}\, u(100 - 0{,}4C) + \tfrac{3}{10}\, u(30 + 0{,}6C)"
          label="Le programme de l'assuré"
          caption={
            <>
              avec la condition de premier ordre <M tex="\partial U / \partial C = 0" />.
            </>
          }
        />

        <Callout variant="exemple" title="Résultats du cours · Fatou et Hicham">
          <p>
            <strong>Fatou</strong>, <M tex="u = \sqrt{w}" /> : <M tex="C^* = 14{,}8" /> €,
            portefeuille (94,1 ; 38,9), VMA = 77,5 €.
            <br />
            <strong>Hicham</strong>, <M tex="u = \ln w" /> : <M tex="C^* = 40" /> €, portefeuille
            (84 ; 54), VMA = 75 €.
          </p>
          <p>
            Tous deux paient pour couvrir <em>une partie</em> du risque, alors même que cela{" "}
            <strong>diminue la VMA</strong> de leur portefeuille. Et Hicham,{" "}
            <strong>plus averse</strong> (ln est plus concave que √), couvre{" "}
            <strong>davantage</strong> que Fatou. Symétrique parfait de la § 7 : plus d'aversion →
            moins d'investissement risqué, mais <em>plus</em> d'assurance.
          </p>
          <p className="text-[13px] text-muted-foreground">
            Note : les slides du cours donnent C* = 39,6 € pour Hicham. En résolvant la condition
            de premier ordre exactement, on trouve C* = 40 € tout rond (et y* = 84 €, x* = 54 €) ;
            le 39,6 vient d'un arrondi intermédiaire. L'ordre de grandeur et toute
            l'interprétation restent identiques.
          </p>
        </Callout>

        <H3>Le prix « actuariellement juste »</H3>

        <Callout variant="definition" title="Définition · Prix actuariellement juste">
          <p>
            Le prix <M tex="p" /> d'une assurance est <strong>actuariellement juste</strong> s'il
            correspond au coût attendu pour la compagnie, c'est-à-dire à la VMA de la couverture.
            Ici, couvrir 1 € coûte à l'assureur :{" "}
            <M tex="\mathrm{VMA} = 0{,}7 \times 0 + 0{,}3 \times 1 = \mathbf{0{,}30}" /> €. Le
            prix du marché (0,40 €) n'est donc <em>pas</em> juste : l'assureur prend une marge de
            0,10 €.
          </p>
        </Callout>

        <Callout variant="retiens" title="Théorème · Assurance complète">
          <p>
            Un individu averse au risque <strong>s'assure complètement</strong> (
            <M tex="C^* = L" />, la perte) lorsque le prix est actuariellement juste (
            <M tex="p = \pi" />
            ).
          </p>
          <p>
            <em>Idée de la preuve</em> : la CPO s'écrit{" "}
            <M tex="\pi(1-p)\,u'(x) = p\,(1-\pi)\,u'(y)" />. Si <M tex="p = \pi" />, les
            coefficients se simplifient et il reste <M tex="u'(x) = u'(y)" />. Comme{" "}
            <M tex="u'' < 0" />, la dérivée <M tex="u'" /> est strictement décroissante : elle ne
            prend jamais deux fois la même valeur. Donc <M tex="x = y" />… ce qui signifie que les
            deux scénarios donnent la même richesse : couverture complète, <M tex="C^* = L" />.
          </p>
        </Callout>

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
                  0,05 &gt; 0,02 : le prix est au-dessus du juste. La CPO donne alors{" "}
                  <M tex="u'(x) > u'(y)" />, donc <M tex="x < y" /> : il reste du risque à
                  l'optimum. La couverture est <strong>partielle</strong> :{" "}
                  <M tex="C^* < 200\,000" /> € (exactement comme Fatou et Hicham face au prix de
                  0,40).
                </p>
              ),
            },
          ]}
          result={
            <p>
              Prix juste = π = 0,02 € ⇒ couverture complète (200 000 €, prime 4 000 €, richesse
              certaine 196 000 €). Prix au-dessus du juste ⇒ couverture partielle. C'est le
              théorème de la § 9 appliqué tel quel.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 10 · THÉORIE DES PERSPECTIVES                              */}
      {/* ============================================================ */}
      <Section
        id="s10"
        kicker="§ 10"
        title="Théorie des perspectives : quand le point de référence change tout"
      >
        <Lead>
          Fin de la théorie rationnelle, début de la partie comportementale. Les humains ne
          raisonnent pas en richesse absolue mais en gains et pertes autour d'un point de
          référence — et cela renverse leurs choix.
        </Lead>

        <p>
          Fin de la théorie rationnelle, début de la partie <strong>comportementale</strong> —
          comme en A1 (biais de dotation) et A2 (biais pour le présent), on confronte le modèle
          aux humains réels. Commence par vivre l'expérience toi-même, <em>dans l'ordre</em> :
        </p>

        <PollCard
          tag="Sondage d'amphi nº 3 — version A"
          question="Tu reçois 300 € pour tes étrennes. Le lendemain, on te propose :"
          options={[
            { label: <>A1 · Un gain certain de 100 €</>, pct: 68 },
            { label: <>A2 · 50 % de chances de gagner 200 €, 50 % de gagner 0 €</>, pct: 32 },
          ]}
          note={
            <>
              Garde ton choix en tête — et réponds maintenant à la version B ci-dessous avant de
              lire la suite.
            </>
          }
        />

        <PollCard
          tag="Sondage d'amphi nº 3 — version B"
          question="Tu reçois 500 € pour tes étrennes. Le lendemain, on te propose :"
          options={[
            { label: <>B1 · Une perte certaine de 100 €</>, pct: 28 },
            { label: <>B2 · 50 % de chances de perdre 200 €, 50 % de ne rien perdre</>, pct: 72 },
          ]}
          note={
            <>
              Regarde bien : en richesse <em>finale</em>, A1 ≡ B1 (400 € certains) et A2 ≡ B2
              (500 € ou 300 € à 50/50). Ce sont <strong>les mêmes choix</strong> ! Pourtant les
              réponses s'inversent : 68 % prennent l'option sûre quand elle est formulée en{" "}
              <strong>gains</strong>, 72 % prennent la loterie quand elle est formulée en{" "}
              <strong>pertes</strong>. Un individu rationnel au sens de vNM ne peut pas faire ça.
            </>
          }
        />

        <p>
          Pour expliquer ce renversement, Kahneman et Tversky proposent la{" "}
          <strong>théorie des perspectives</strong> : les humains ne raisonnent pas en niveaux{" "}
          <em>absolus</em> de richesse, mais en{" "}
          <strong>variations par rapport à un point de référence</strong> <M tex="w_{ref}" />{" "}
          (ici : « ce que je considère posséder avant de choisir », 300 € ou 500 €). La fonction
          de Bernoulli devient <M tex="u(w, w_{ref})" />.
        </p>

        <Callout variant="definition" title="Les 3 caractéristiques de la fonction de valeur">
          <p>
            <strong>1. Gains à utilité marginale décroissante</strong> (concave à droite de la
            référence) → comme chez vNM, <em>aversion au risque dans les gains</em>.
          </p>
          <p>
            <strong>2. Pertes à utilité marginale croissante</strong> (convexe à gauche) →
            contrairement à vNM, <em>affinité au risque dans les pertes</em> : la première unité
            perdue fait plus mal que les suivantes, donc on préfère parier pour tenter d'éviter
            toute perte.
          </p>
          <p>
            <strong>3. Aversion à la perte</strong> : l'utilité marginale de la première unité
            perdue est environ <strong>deux fois</strong> plus grande que celle de la première
            unité gagnée — la courbe est deux fois plus pentue à gauche du point de référence.
            Perdre 10 € fait plus mal que gagner 10 € ne fait plaisir.
          </p>
        </Callout>

        <WidgetProspect />

        <Callout variant="intuition" title="Lien avec A1 · le biais de dotation expliqué">
          <p>
            Souviens-toi du biais de dotation (A1) : on exige plus pour <em>vendre</em> un objet
            qu'on ne paierait pour l'<em>acheter</em>. L'aversion à la perte l'explique : une fois
            l'objet en poche, il entre dans le point de référence, et s'en séparer est codé comme
            une <strong>perte</strong> — pondérée double. La théorie des perspectives unifie donc
            des anomalies de A1 et de A3.{" "}
            <TheoryRef chapter="a1" section="dotation" label="L'effet de dotation" />
          </p>
        </Callout>

        <H3>Implications en finance</H3>
        <ul>
          <li>
            <strong>Effet de disposition</strong> : les traders vendent trop vite les actions
            gagnantes (« winners ») et gardent trop longtemps les perdantes (« loosers »). Odean
            (1998) : le gain encaissé sur les winners est plus petit que la perte subie sur les
            loosers. La concavité sur les gains décourage la prise de risque (on « sécurise »),
            la convexité sur les pertes l'encourage (on « se refait »).
          </li>
          <li>
            <strong>Prise de risque en fin d'année</strong> : un trader dont le portefeuille est à
            la traîne par rapport à l'indice de référence (son <M tex="w_{ref}" /> !) est « dans
            les pertes » et prend plus de risques — cf. l'affaire Kerviel après le krach de 2007.
          </li>
          <li>
            <strong>L'argent qui dort, bis</strong> : l'aversion à la perte crée une forte
            aversion au risque à tous les niveaux de richesse. Et un épargnant{" "}
            <em>sophistiqué</em> (au sens de A2 : conscient de ses biais) peut anticiper qu'il
            investira mal — vendra ses winners, gardera ses loosers — et préférer rester hors de
            la bourse. Deuxième réponse, comportementale, au mystère de la § 1.{" "}
            <TheoryRef chapter="a2" section="selfcontrole" label="Self-contrôle & sophistication" />
          </li>
        </ul>

        <Quiz
          scope="a3"
          id="q4"
          question={
            <p>
              Dans l'expérience des étrennes, compare A1 (« 300 € puis un gain certain de
              100 € ») et B1 (« 500 € puis une perte certaine de 100 € »). En richesse finale,
              ces deux options sont…
            </p>
          }
          options={[
            {
              text: <>strictement identiques : 400 € certains dans les deux cas</>,
              correct: true,
              explain: (
                <>
                  Exact : 300 + 100 = 500 − 100 = 400 €. De même A2 ≡ B2 (500 € ou 300 € à
                  50/50). Seule la <strong>formulation</strong> change — et pourtant les réponses
                  de l'amphi s'inversent. C'est la preuve qu'un point de référence est à l'œuvre.
                </>
              ),
            },
            {
              text: <>différentes : B1 part d'une richesse plus élevée, donc B1 est meilleure</>,
              explain: (
                <>
                  Les 500 € de départ sont immédiatement amputés de 100 € : la richesse finale est
                  400 €, exactement comme en A1. Un individu vNM, qui raisonne en richesses
                  finales, les juge identiques.
                </>
              ),
            },
            {
              text: <>impossibles à comparer sans connaître la fonction u</>,
              explain: (
                <>
                  Pas besoin de u : les deux options donnent le même montant certain (400 €).
                  Toute fonction u leur attribue la même utilité — c'est bien pour ça que
                  l'inversion des réponses est une <em>anomalie</em>.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 11 · CADRAGE ÉTROIT                                        */}
      {/* ============================================================ */}
      <Section id="s11" kicker="§ 11" title="Cadrage étroit — narrow framing">
        <Lead>
          Deuxième biais majeur : évaluer chaque pari isolément au lieu de regarder son effet sur
          l'ensemble du portefeuille. L'argument de Samuelson montre pourquoi c'est incohérent.
        </Lead>

        <p>
          Commence par répondre honnêtement à ces deux propositions d'un ami — ce sont exactement
          celles posées en amphi (l'expérience vient de Paul Samuelson, prix Nobel 1970).
        </p>

        <PollCard
          tag="Sondage d'amphi nº 5 — proposition A"
          question={
            <>
              « Lançons une pièce : si c'est pile je te donne 10 €, si c'est face tu me donnes
              5 €. » Tu acceptes ?
            </>
          }
          options={[
            { label: <>J'accepte</>, pct: 68 },
            { label: <>Je refuse</>, pct: 32 },
          ]}
          note={
            <>
              Le pari est pourtant très favorable : VMA = ½ × 10 − ½ × 5 ={" "}
              <strong>+2,50 €</strong>, à deux contre un, pour de petites sommes. Un refus signale
              soit une aversion au risque <em>énorme</em>, soit… une aversion à la perte (§ 10 :
              perdre 5 € « pèse » comme gagner 10 €).
            </>
          }
        />

        <PollCard
          tag="Sondage d'amphi nº 6 — proposition B"
          question={
            <>
              « Lançons la pièce <strong>10 fois de suite</strong>. Chaque pile : je te donne
              10 € ; chaque face : tu me donnes 5 €. » Tu acceptes ?
            </>
          }
          options={[
            { label: <>J'accepte</>, pct: 84 },
            { label: <>Je refuse</>, pct: 16 },
          ]}
          note={
            <>
              Beaucoup plus de monde accepte 10 paris qu'un seul. Intuitivement raisonnable… mais
              Samuelson montre que <strong>refuser A tout en acceptant B est incohérent</strong>.
              Voyons son argument.
            </>
          }
        />

        <Callout variant="methode" title="L'argument de Samuelson (récurrence à rebours)">
          <p>
            Suppose que tu refuses A mais acceptes B, et qu'après chaque lancer tu puisses décider
            de continuer ou non :
          </p>
          <ul>
            <li>
              Au <strong>10ᵉ et dernier</strong> lancer, il ne reste qu'<em>un</em> pari devant
              toi : tu es exactement dans la situation A → tu refuses.
            </li>
            <li>
              Au <strong>9ᵉ</strong> lancer, tu anticipes ce refus (cf. la résolution à rebours
              vue en A2 pour le self-control !). Le 10ᵉ pari n'existant plus, le 9ᵉ est de fait
              « le dernier » → situation A → tu refuses.
            </li>
            <li>
              … et ainsi de suite en remontant, jusqu'à refuser le <strong>1ᵉʳ</strong> lancer.
              Celui qui refuse A devrait donc refuser B.
            </li>
          </ul>
        </Callout>

        <Callout variant="definition" title="Définition · Biais de cadrage étroit">
          <p>
            Évaluer chaque alternative risquée <strong>isolément</strong>, indépendamment du reste
            de son portefeuille. Un individu rationnel évalue au contraire l'impact d'une loterie{" "}
            <strong>sur l'ensemble</strong> de son portefeuille — et un portefeuille de nombreux
            petits paris favorables est très peu risqué.
          </p>
        </Callout>

        <H3>Pourquoi la répétition « dilue » le risque</H3>
        <p>
          Prenons 3 paris de suite. Le nombre <M tex="H" /> de piles suit une loi binomiale{" "}
          <M tex="Bi(3, \tfrac{1}{2})" /> : chaque lancer est indépendant et le gain total vaut{" "}
          <M tex="10H - 5(3-H) = 15H - 15" />. D'où le tableau :
        </p>

        <Tbl minW={420}>
          <thead>
            <tr>
              <th className={TH}>Nombre de piles H</th>
              <th className={`${TH} text-right`}>Probabilité</th>
              <th className={`${TH} text-right`}>Gain total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>3</td>
              <td className={TDnum}>1/8</td>
              <td className={TDnum}>+30 €</td>
            </tr>
            <tr>
              <td className={TD}>2</td>
              <td className={TDnum}>3/8</td>
              <td className={TDnum}>+15 €</td>
            </tr>
            <tr>
              <td className={TD}>1</td>
              <td className={TDnum}>3/8</td>
              <td className={TDnum}>0 €</td>
            </tr>
            <tr>
              <td className={TD}>0</td>
              <td className={TDnum}>1/8</td>
              <td className={TDnum}>−15 €</td>
            </tr>
          </tbody>
        </Tbl>

        <p>
          <M tex="\mathrm{VMA}(3\text{ paris}) = \tfrac{1}{8}\cdot 30 + \tfrac{3}{8}\cdot 15 + \tfrac{3}{8}\cdot 0 - \tfrac{1}{8}\cdot 15 = \mathbf{7{,}50}" />{" "}
          € (= 3 × 2,50 €, logique). Et surtout : la probabilité de finir <em>en perte</em> n'est
          plus que de <strong>1/8 = 12,5 %</strong>, contre 50 % pour un pari isolé. Le widget te
          laisse pousser jusqu'à 10 paris.
        </p>

        <WidgetRepeatBet />

        <Callout variant="exemple" title="Application réelle · La mauvaise délégation (Thaler)">
          <p>
            Un holding de presse possède <strong>23 magazines</strong>, chacun dirigé par un
            cadre. Richard Thaler demande à chaque cadre : « Accepteriez-vous un projet rapportant
            2 M$ avec 50 % de chances, ou perdant 1 M$ sinon ? »
          </p>
          <ul>
            <li>
              Seuls <strong>3 cadres sur 23</strong> acceptent… alors que le CEO voudrait que{" "}
              <em>tous</em> les projets soient lancés.
            </li>
            <li>
              Le CEO a raison : sur l'ensemble, VMA = 23 × 0,5 M$ = <strong>11,5 M$</strong> et la
              probabilité d'une perte globale est <strong>inférieure à 5 %</strong>.
            </li>
            <li>
              Le problème n'est pas (que) le biais : les cadres font face à de{" "}
              <strong>mauvais incitants</strong> — petit bonus si leur projet réussit,
              licenciement s'il échoue. Chacun raisonne donc dans son cadre étroit. Remède :
              évaluer les managers sur le portefeuille de projets, pas projet par projet.
            </li>
          </ul>
        </Callout>

        <ExerciseBlock
          scope="a3"
          id="ex5"
          number={5}
          title="Trois paris valent mieux qu'un"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s11", label: "Cadrage étroit" }]}
          statement={
            <p>
              Ton amie te propose le pari « +10 € si pile, −5 € si face », répété 3 fois.
              <br />
              a) Dresse la distribution du gain total. b) Calcule la VMA. c) Quelle est la
              probabilité de finir en perte ? d) Compare avec un pari unique.
            </p>
          }
          steps={[
            {
              title: "La loi du nombre de piles",
              content: (
                <p>
                  Le nombre de piles <M tex="H" /> suit <M tex="Bi(3, \tfrac{1}{2})" />. Les 8
                  suites de lancers (PPP, PPF, …) sont équiprobables :{" "}
                  <M tex="P(H=3) = \tfrac{1}{8}" />, <M tex="P(H=2) = \tfrac{3}{8}" />,{" "}
                  <M tex="P(H=1) = \tfrac{3}{8}" />, <M tex="P(H=0) = \tfrac{1}{8}" />.
                </p>
              ),
            },
            {
              title: "La distribution du gain",
              content: (
                <p>
                  Gain = <M tex="15H - 15" />, donc : +30 € (1/8), +15 € (3/8), 0 € (3/8), −15 €
                  (1/8).
                </p>
              ),
            },
            {
              title: "La VMA",
              content: (
                <p>
                  VMA = (30 + 3 × 15 + 0 − 15)/8 = 60/8 = <strong>7,50 €</strong>. Vérification
                  rapide : 3 paris indépendants de VMA 2,50 € → 3 × 2,50 = 7,50 €. ✔
                </p>
              ),
            },
            {
              title: "La probabilité de perte",
              content: (
                <p>
                  On perd de l'argent seulement si <M tex="H = 0" /> : probabilité{" "}
                  <strong>1/8 = 12,5 %</strong>, contre 50 % pour un pari unique. La répétition
                  d'un pari favorable augmente la VMA <em>et</em> réduit la probabilité de perte :
                  évaluer chaque pari isolément (cadrage étroit) fait rater cette diversification
                  temporelle.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Distribution : +30 (1/8), +15 (3/8), 0 (3/8), −15 (1/8) ; VMA = 7,50 € ; P(perte) =
              12,5 % contre 50 % pour un pari isolé. La répétition est une{" "}
              <strong>diversification temporelle</strong> que le cadrage étroit rend invisible.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 12 · BIAIS SUR LES PROBABILITÉS                            */}
      {/* ============================================================ */}
      <Section id="s12" kicker="§ 12" title="Biais sur les probabilités">
        <Lead>
          Troisième famille de biais : cette fois, ce ne sont pas les valeurs qui sont déformées,
          mais les probabilités elles-mêmes — trop d'optimisme, fausses compensations du hasard,
          petites probabilités illisibles.
        </Lead>

        <p>
          Théorie des perspectives et cadrage étroit déforment la façon dont on <em>valorise</em>{" "}
          les réalisations. Une troisième famille de biais déforme les{" "}
          <strong>
            probabilités <M tex="\pi" />
          </strong>{" "}
          elles-mêmes. Commence par le test passé en amphi.
        </p>

        <PollCard
          tag="Sondage d'amphi nº 7"
          question="Imagine le classement en percentiles à l'examen final de ce cours (percentile 12 % = tu fais mieux que 12 % des inscrits). Dans quel percentile penses-tu te situer ?"
          options={[
            { label: <>Sous 25 %</> },
            { label: <>25 – 50 %</> },
            { label: <>50 – 75 %</> },
            { label: <>Au-dessus de 75 %</> },
          ]}
          resultBars={[
            { label: <>Percentile médian annoncé par les étudiants du cours</>, pct: 60 },
          ]}
          note={
            <>
              Autrement dit, plus de la moitié de l'amphi pense faire mieux que la moitié de
              l'amphi… ce qui est <strong>mathématiquement impossible</strong> : par définition,
              la médiane des vrais percentiles est 50 %.
            </>
          }
        />

        <Callout variant="definition" title="Définition · Biais de sur-confiance">
          <p>
            Tendance à <strong>surestimer la probabilité des bons états du monde</strong> et à
            sous-estimer celle des mauvais. Dans le modèle : l'individu utilise des{" "}
            <M tex="\pi" /> trop optimistes.
          </p>
        </Callout>

        <ul>
          <li>
            <strong>Svenson (1981)</strong> : 93 % des conducteurs interrogés jugent leur conduite
            au-dessus de la médiane.
          </li>
          <li>
            <strong>Weinstein (1980)</strong> : on sous-estime sa propre probabilité
            d'hospitalisation.
          </li>
          <li>
            <strong>Buehler et al. (1994)</strong>, le « planning fallacy » : on sous-estime le
            temps nécessaire pour finir un projet (tu connais ?).
          </li>
          <li>
            Les <strong>entrepreneurs</strong> surestiment la probabilité que leur projet
            aboutisse.
          </li>
        </ul>

        <Callout variant="intuition" title="Lien avec A2 · la naïveté expliquée">
          <p>
            En A2, l'agent <em>naïf</em> croyait qu'il résisterait demain à la tentation (β futur
            = 1) et se trompait systématiquement. Cette naïveté est un cas particulier de
            sur-confiance : sur-estimer la probabilité du bon état du monde « je tiendrai bon ».
            La sophistication de A2, c'est précisément corriger ce <M tex="\pi" />.{" "}
            <TheoryRef chapter="a2" section="selfcontrole" label="Self-contrôle (β)" />
          </p>
        </Callout>

        <H3>L'erreur du joueur — gambler's fallacy</H3>
        <p>
          Une pièce équilibrée vient de tomber deux fois de suite sur pile. Probabilité de pile au
          prochain lancer ?
        </p>
        <ul>
          <li>
            Le joueur <strong>rationnel</strong> répond <strong>50 %</strong> : les lancers sont
            indépendants, la pièce n'a pas de mémoire.
          </li>
          <li>
            Le joueur victime de <strong>sur-inférence</strong> répond « moins de 50 % » : il
            croit que le hasard doit « rétablir » l'équilibre à court terme. C'est faux — la loi
            des grands nombres agit par dilution sur le long terme, pas par compensation
            immédiate.
          </li>
        </ul>

        <H3>Les très petites probabilités</H3>
        <p>
          Notre cerveau se représente bien l'écart entre 50 % et 25 %, mais très mal celui entre 1
          chance sur un million et 5 chances sur un million — pourtant un{" "}
          <strong>facteur 5</strong>. C'est une des raisons du succès des loteries malgré leur VMA
          négative : on ne « sent » pas à quel point gagner est improbable. (L'autre moitié de
          l'explication tient au ticket de rêve : une petite mise achète le droit d'imaginer le
          jackpot.)
        </p>
      </Section>

      {/* ============================================================ */}
      {/* § 13 · SYNTHÈSE & AUTO-ÉVALUATION                            */}
      {/* ============================================================ */}
      <Section id="s13" kicker="§ 13" title="Synthèse & auto-évaluation">
        <Lead>
          Une seule formule réunit A1, A2 et A3 : le modèle standard complet de la décision. Puis
          à toi de jouer : 9 questions de QCM et une checklist de 17 points.
        </Lead>

        <p>
          Le cours se referme sur une formule qui réunit{" "}
          <strong>tout ce qu'on a vu depuis A1</strong> : le choix rationnel (A1), le temps (A2)
          et l'incertitude (A3) dans un seul modèle de décision.
        </p>

        <Callout variant="retiens" title="Le modèle standard complet">
          <MB tex="U(x) = \sum_{t=0}^{T} \delta^t \sum_{s_t \in S_t} \pi(s_t)\, u(x_t \mid s_t)" />
          <p>Lis-la de gauche à droite :</p>
          <ul>
            <li>
              <M tex="x = (x_0, \dots, x_T)" /> : le <strong>programme de consommation</strong>,
              choisi aujourd'hui (<M tex="t = 0" />) — comme en A2.
            </li>
            <li>
              <M tex="\delta^t" /> : le <strong>facteur d'escompte</strong> — la patience,
              héritée de A2.
            </li>
            <li>
              <M tex="s_t" /> : l'<strong>état du monde</strong> à la date t (il pleut / il fait
              soleil ; la firme réussit / échoue).
            </li>
            <li>
              <M tex="\pi(s_t)" /> : la <strong>probabilité</strong> d'arriver dans cet état — le
              cœur de A3.
            </li>
            <li>
              <M tex="u(x_t \mid s_t)" /> : l'utilité de Bernoulli de consommer <M tex="x_t" />{" "}
              dans l'état <M tex="s_t" /> — le cœur de A1.
            </li>
          </ul>
          <p>
            L'individu rationnel choisit le programme accessible qui maximise <M tex="U(x)" /> :
            on espère sur les états (A3) <em>puis</em> on escompte dans le temps (A2).
          </p>
          <p className="text-[13px] text-muted-foreground">
            Note : tout le chapitre travaille avec des loteries à deux réalisations (y, x). Tout
            se généralise à n réalisations : <M tex="U(a) = \textstyle\sum_i \pi_i\, u(x_i)" />{" "}
            avec <M tex="\textstyle\sum_i \pi_i = 1" /> — c'est ce que fait déjà le calcul des 3
            paris de la § 11.
          </p>
        </Callout>

        <H3>La carte des déviations comportementales</H3>
        <p>
          Chaque ingrédient de la formule a son biais attitré — c'est le fil rouge des trois
          chapitres :
        </p>

        <Tbl minW={620}>
          <thead>
            <tr>
              <th className={TH}>Ingrédient rationnel</th>
              <th className={TH}>Déviation observée</th>
              <th className={TH}>Chapitre</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <M tex="\delta" /> constant dans le temps
              </td>
              <td className={TD}>
                Biais pour le présent (β), problèmes de self-control, procrastination
              </td>
              <td className={TD}>A2</td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="u" /> absolue (niveaux de richesse)
              </td>
              <td className={TD}>
                Théorie des perspectives : point de référence, aversion à la perte, biais de
                dotation
              </td>
              <td className={TD}>A1 + A3 § 10</td>
            </tr>
            <tr>
              <td className={TD}>Évaluer le portefeuille entier</td>
              <td className={TD}>Cadrage étroit : chaque pari jugé isolément</td>
              <td className={TD}>A3 § 11</td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="\pi" /> = projections rationnelles
              </td>
              <td className={TD}>
                Sur-confiance, sur-inférence du joueur, petites probabilités mal perçues
              </td>
              <td className={TD}>A3 § 12</td>
            </tr>
          </tbody>
        </Tbl>

        <p>
          Moralité du cours : la théorie <strong>rationnelle</strong> sert de guide pour bien
          décider (diversifier, s'assurer au prix juste, ne pas céder au cadrage étroit) ; la
          théorie <strong>comportementale</strong> documente nos écarts systématiques — et permet
          de concevoir des politiques qui en tiennent compte.
        </p>

        <Callout variant="examen" title="À maîtriser absolument pour l'examen">
          <ul>
            <li>
              Calculer une <strong>VMA</strong> et une <strong>utilité espérée</strong>{" "}
              <M tex="U = \pi u(y) + (1-\pi)u(x)" /> — et ne jamais confondre <M tex="U" /> (sur
              loteries) et <M tex="u" /> (sur montants certains).
            </li>
            <li>
              Le trio : neutre ⇔ <M tex="u" /> linéaire ⇔ classement par VMA ; averse ⇔{" "}
              <M tex="u" /> concave (<M tex="u'' < 0" />
              ) ; affinité ⇔ <M tex="u" /> convexe.
            </li>
            <li>
              Équivalent certain <M tex="u(C) = U(a)" /> et prime de risque{" "}
              <M tex="\mathrm{PRM} = \mathrm{VMA} - C" /> (savoir les lire sur le graphique de la
              corde !).
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
              Les trois traits de la théorie des perspectives + les trois biais de probabilité,
              chacun avec un exemple.
            </li>
          </ul>
        </Callout>

        <H3>QCM final — 9 questions</H3>

        <Quiz
          scope="a3"
          id="q5"
          kicker="QCM final · question 1"
          question={
            <p>Un actif rapporte 50 € avec probabilité 60 % et 12,5 € sinon. Sa VMA vaut :</p>
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
                  Presque : tu as peut-être pondéré 50 par 0,6 mais oublié le second terme
                  (0,4 × 12,5 = 5).
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
              text: <>des loteries</>,
              explain: (
                <>
                  Non — c'est <M tex="U" /> (majuscule, von Neumann–Morgenstern) qui évalue les
                  loteries. <M tex="u" /> est sa brique élémentaire.
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
                  Non : un averse au risque accepte un actif risqué si sa prime de risque est
                  suffisante (p ≤ C). Fatou et Hicham investissent bien dans de l'incertain.
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
              Pour un individu averse au risque, l'équivalent certain C(a) d'un actif risqué
              vérifie :
            </p>
          }
          options={[
            {
              text: <>C(a) &gt; VMA(a)</>,
              explain: (
                <>
                  Ce serait l'affinité au risque : accepter de payer plus que la VMA pour avoir du
                  risque en plus.
                </>
              ),
            },
            {
              text: <>C(a) {"<"} VMA(a)</>,
              correct: true,
              explain: (
                <>
                  Exact : le risque « coûte » de l'utilité, donc le montant certain équivalent est
                  plus petit que la moyenne. L'écart est la PRM.
                </>
              ),
            },
            {
              text: <>C(a) = VMA(a)</>,
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
                  C'est le pire cas : les deux actifs plongent ensemble (2y ou 2x). U(cas 1) est
                  la plus basse.
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
                  C'est vrai côté <em>gains</em> (valeur concave), mais le côté pertes est
                  convexe.
                </>
              ),
            },
            {
              text: <>neutres au risque</>,
              explain: <>Non — la fonction de valeur n'est linéaire nulle part.</>,
            },
            {
              text: <>en recherche de risque</>,
              correct: true,
              explain: (
                <>
                  Exact : la convexité sur les pertes pousse à « tenter de se refaire » — d'où
                  l'effet de disposition (garder les loosers) et l'affaire Kerviel.
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
              Une pièce équilibrée tombe 4 fois de suite sur pile. La probabilité de pile au 5ᵉ
              lancer est :
            </p>
          }
          options={[
            {
              text: <>moins de 50 %, le hasard doit compenser</>,
              explain: (
                <>
                  C'est précisément la gambler's fallacy : la pièce n'a pas de mémoire, rien ne
                  « compense » à court terme.
                </>
              ),
            },
            {
              text: <>exactement 50 %</>,
              correct: true,
              explain: <>Exact : lancers indépendants ⇒ 50 %, quel que soit le passé.</>,
            },
            {
              text: <>plus de 50 %, la pièce est « chaude »</>,
              explain: (
                <>
                  Croire aux séries « chaudes » est le biais symétrique — tout aussi faux pour
                  une pièce équilibrée.
                </>
              ),
            },
          ]}
        />

        <H3>Checklist de fin de chapitre</H3>
        <p>Coche honnêtement. Tout ce qui reste décoché te dit où retourner.</p>

        <MasteryChecklist
          items={[
            <>
              Je sais définir un actif risqué par ses réalisations (y, x) <em>et</em> ses
              probabilités (π, 1−π).
            </>,
            <>Je calcule une VMA sans confondre moyenne pondérée et moyenne simple. (§ 2)</>,
            <>
              Je peux expliquer pourquoi la VMA ne suffit pas (le sondage des 3 M€ contre
              pile-ou-face). (§ 2)
            </>,
            <>Je comprends la propriété d'indépendance avec l'exemple vin/bière. (§ 3)</>,
            <>
              Je distingue U (vNM, sur loteries) et u (Bernoulli, sur montants certains). (§ 4)
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
            <>Je sais poser y, x, U(A) puis la CPO d'un problème d'investissement. (§ 7)</>,
            <>
              Je sais classer les trois cas de corrélation et expliquer parapluies / crème
              solaire / t-shirts. (§ 8)
            </>,
            <>
              Je sais poser le problème d'assurance et j'ai retenu le théorème « prix juste ⇒
              assurance complète ». (§ 9)
            </>,
            <>
              Je peux citer les 3 traits de la théorie des perspectives et l'effet de
              disposition. (§ 10)
            </>,
            <>
              Je sais reconstruire l'argument de récurrence de Samuelson et définir le cadrage
              étroit. (§ 11)
            </>,
            <>
              Je peux citer sur-confiance, gambler's fallacy et le biais des petites
              probabilités, avec un exemple chacun. (§ 12)
            </>,
            <>
              Je sais lire la formule générale U(x) = Σδᵗ Σπ(sₜ)u(xₜ|sₜ) et relier chaque biais
              à son ingrédient. (§ 13)
            </>,
          ]}
        />
      </Section>
    </ChapterShell>
  );
}
