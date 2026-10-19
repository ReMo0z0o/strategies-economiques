/*
 * Chapitre A3 — PartTheorie (sections affichées dans la page du chapitre).
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

/* Petits helpers locaux : sous-titre et preuve en étapes numérotées. */
function H4({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-6 text-lg font-semibold tracking-tight">{children}</h4>;
}

function ProofSteps({ children }: { children: ReactNode }) {
  return <ol className="my-4 list-none space-y-3 pl-0">{children}</ol>;
}

function ProofStep({ n, title, children }: { n: number; title: ReactNode; children: ReactNode }) {
  return (
    <li className="rounded-xl border bg-muted/30 px-3.5 py-3">
      <p className="m-0 flex items-start gap-2 font-semibold">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">
          {n}
        </span>
        <span>{title}</span>
      </p>
      <div className="mt-1.5 text-[15px] [&_p]:my-1.5">{children}</div>
    </li>
  );
}

export function PartTheorie() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 1 · LE MYSTÈRE DE L'ARGENT QUI DORT                        */}
      {/* ============================================================ */}
      <Section id="s1" kicker="§ 1" title="Le mystère de l'argent qui dort">
        <Lead>
          Pourquoi 336 milliards d'euros dorment-ils sur des comptes belges alors que la bourse
          rapporte en moyenne environ 7 % par an ? Toute la théorie de ce chapitre part de cette
          énigme très concrète.
        </Lead>

        <H3>De fortes sommes d'argent dorment sur des comptes</H3>
        <p>
          En septembre 2018, <strong>336 milliards d'euros</strong> se trouvaient sur des comptes
          en banque en Belgique, dont <strong>80 milliards</strong> sur de simples comptes
          courants (De Tijd, 18/01/2019).
        </p>
        <p>
          Ce n'est pas une particularité belge. Le slide 2 montre la composition du patrimoine
          que les ménages pourraient placer, dans cinq grands pays (France, Allemagne, Japon,
          Royaume-Uni, États-Unis). En moyenne, les <strong>dépôts bancaires</strong> en
          représentent <strong>12,3 %</strong> : de 7,3 % aux États-Unis à 18,9 % au Japon. Le
          reste se répartit entre l'immobilier (19,4 %), les actions (25,9 %), les obligations
          (7,7 %), les bons du Trésor (0,9 %) et d'autres actifs (13,2 % financiers, 20,7 % non
          financiers). Message du slide : bien que les proportions varient d'un pays à l'autre,
          cette situation n'est pas spécifique à la Belgique (Jordà et al., 2019).
        </p>

        <H3>Des placements plus rémunérateurs existent… en moyenne</H3>
        <p>
          L'argent laissé sur un compte en banque ne rapporte (presque) <strong>rien</strong>.
          Or on peut obtenir bien plus en l'investissant. Sur le long terme, le rendement annuel
          moyen des <strong>actions</strong> (des parts d'entreprises) tourne autour de{" "}
          <strong>7 %</strong>. L'<strong>immobilier</strong> rapporte à peu près autant. Les{" "}
          <strong>obligations</strong> (des prêts à long terme, surtout à des États) et les{" "}
          <strong>bons du Trésor</strong> (« bills » : des prêts très courts à l'État, presque
          comme un compte en banque) rapportent nettement moins.
        </p>
        <Tbl minW={330}>
          <thead>
            <tr>
              <th className={TH}>Placement</th>
              <th className={`${TH} text-right`}>Depuis 1870</th>
              <th className={`${TH} text-right`}>Depuis 1950</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>Immobilier</td>
              <td className={TDnum}>≈ 7,3 %</td>
              <td className={TDnum}>≈ 7,4 %</td>
            </tr>
            <tr>
              <td className={TD}>Actions</td>
              <td className={TDnum}>≈ 6,7 %</td>
              <td className={TDnum}>≈ 8,2 %</td>
            </tr>
            <tr>
              <td className={TD}>Obligations</td>
              <td className={TDnum}>≈ 2,6 %</td>
              <td className={TDnum}>≈ 2,7 %</td>
            </tr>
            <tr>
              <td className={TD}>Bons du Trésor (bills)</td>
              <td className={TDnum}>≈ 1,1 %</td>
              <td className={TDnum}>≈ 0,8 %</td>
            </tr>
          </tbody>
        </Tbl>
        <p className="-mt-3 text-[13px] text-muted-foreground">
          Rendement annuel moyen « réel » (c'est-à-dire une fois la hausse des prix retirée).
          Valeurs approximatives lues sur le graphique du slide 3 (Jordà et al., 2019).
        </p>
        <p>
          Fais le calcul (chiffres illustratifs) : 10 000 € laissés 30 ans sur un compte courant
          restent (à peu près) 10 000 €. Les mêmes 10 000 € placés à 7 % par an deviennent{" "}
          <M>{"10\\,000 \\times 1{,}07^{30} \\approx 76\\,000"}</M> €. Alors pourquoi tant
          d'argent dort-il ?
        </p>

        <H3>Mais 7 %, ce n'est qu'une moyenne</H3>
        <p>
          Celui qui investit en bourse n'a <strong>aucune garantie</strong> d'obtenir 7 %. Le
          rendement annuel évolue fortement dans le temps et dans l'espace (d'un pays à
          l'autre). Sur le graphique du slide 4 (moyennes sur 10 ans), le rendement réel des
          actions tombe vers −4 % autour de la Première Guerre mondiale et monte vers +15 % dans
          les années 1950 (valeurs approximatives lues sur le slide).
        </p>
        <p>
          Et même dans un pays donné, pour une année donnée, tout dépend de{" "}
          <em>où</em> l'argent est placé (slide 5). Le cours de l'action Apple, presque nul en
          1985, dépasse 200 $ en 2018. Celui de Lehman Brothers grimpe jusqu'à environ 80 $ en
          2007… puis s'effondre à zéro en 2008, avec la faillite de la banque. Les actions sont
          des <strong>actifs risqués</strong> : elles apportent parfois de gros gains, mais
          peuvent tout autant entraîner des pertes.
        </p>
        <p>
          Investir, c'est donc choisir <strong>sans connaître le résultat</strong>. C'est ce
          qu'on appelle une décision <strong>sous incertitude</strong>.
        </p>

        <Callout variant="definition" title="Les deux questions du chapitre">
          <p>
            Bien qu'investir soit risqué, cela permet <em>en moyenne</em> de faire fructifier son
            épargne. Dès lors (slide 6) :
          </p>
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
            <strong>A1</strong> : choisir entre des paniers <em>certains</em> (plus de loisir ou
            plus de consommation, comme le travailleur du modèle d'offre de travail). <strong>A2</strong> : choisir entre <em>aujourd'hui et demain</em> (consommer
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
            ["Comparer", "des alternatives risquées : l'utilité espérée"],
            ["Classer", "les gens : neutre, averse ou avec affinité pour le risque"],
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
        <ul className="list-disc space-y-1 pl-5">
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
          VMA(obligation) = 1 × 16 = <strong>16 $</strong> (elle vaut 16 $ avec une probabilité
          de 100 %). Manipule le widget ci-dessous pour sentir la VMA comme un{" "}
          <em>point d'équilibre</em> qui glisse entre <M tex="x" /> et <M tex="y" /> selon la
          probabilité.
        </p>

        <WidgetVMA />

        <H3>La VMA suffit-elle pour choisir ?</H3>
        <p>
          Question du slide 9 : un individu rationnel choisit-il <em>toujours</em> l'actif qui a
          la plus grande VMA ? Si c'était le cas, tout le monde devrait choisir l'action
          (18,5 $ &gt; 16 $). Teste-toi d'abord sur la question posée en amphi :
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
                  <strong>40 € certains</strong> — ici, même sans tenir compte du risque, l'actif
                  risqué perd.
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
      <Section
        id="s3"
        kicker="§ 3"
        title="Préférences rationnelles sur des alternatives risquées"
      >
        <Lead>
          Les quatre propriétés de rationalité du chapitre A1 restent valables. Mais les
          alternatives risquées ont une nature spéciale — leurs réalisations s'excluent
          mutuellement — qui impose une propriété supplémentaire : l'indépendance.
        </Lead>

        <p>
          En A1, on avait défini un individu <em>rationnel</em> par les propriétés de ses
          préférences. Ici, les alternatives comparées ont une nature particulière : chacune est
          définie par ses <strong>réalisations</strong> possibles (<M tex="y" /> et{" "}
          <M tex="x" />) <strong>et</strong> par les <strong>probabilités</strong> qui y sont
          associées (<M tex="\pi" /> et <M tex="1-\pi" />). Les préférences rationnelles sur ces
          alternatives risquées reposent sur les <strong>mêmes</strong> propriétés que sur des
          alternatives certaines, plus <strong>une</strong> propriété nouvelle (slide 10).
        </p>

        <Callout variant="retiens" title="Rappel du chapitre A1 · Les quatre propriétés">
          <p>
            Note <M tex="a \succeq b" /> pour « <M tex="a" /> est au moins aussi bon que{" "}
            <M tex="b" /> ». Des préférences rationnelles sont :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>complètes</strong> : l'individu peut toujours classer deux alternatives
              (soit <M tex="a \succeq b" />, soit <M tex="b \succeq a" />, soit les deux) ; la
              préférence n'est jamais indéterminée ;
            </li>
            <li>
              <strong>transitives</strong> : si <M tex="a \succeq b" /> et{" "}
              <M tex="b \succeq c" />, alors <M tex="a \succeq c" /> (les préférences sont
              cohérentes) ;
            </li>
            <li>
              <strong>monotones</strong> : plus, c'est mieux. Ici : plus d'argent est toujours
              préféré à moins ;
            </li>
            <li>
              <strong>continues</strong> : deux alternatives très proches (par ex. 3 M€ et
              2,99 M€) sont jugées presque aussi désirables. Pas de saut brusque. On s'en servira
              au § 6.
            </li>
          </ul>
          <p>
            <TheoryRef chapter="a1" section="pref" label="Les préférences" />
          </p>
        </Callout>

        <Callout variant="definition" title="Propriété nouvelle · Indépendance">
          <p>
            Les réalisations d'une alternative risquée sont{" "}
            <strong>mutuellement exclusives</strong> : une seule se produira. Jouer « 50 % vin,
            50 % bière », ce n'est donc pas boire un mélange des deux. La propriété
            d'indépendance en tire la conséquence : les préférences dépendent{" "}
            <strong>de manière linéaire des probabilités</strong> associées aux différentes
            réalisations (slide 11).
          </p>
        </Callout>

        <p>
          <strong>Que veut dire « linéaire » ?</strong> Chaque réalisation compte{" "}
          <em>proportionnellement</em> à sa probabilité. Si une réalisation vaut 10 « points »
          pour toi et que sa probabilité passe de 20 % à 40 %, sa contribution passe de{" "}
          <M tex="0{,}2 \times 10 = 2" /> à <M tex="0{,}4 \times 10 = 4" /> : elle double, ni
          plus ni moins. C'est pour cela qu'au § 4, la valeur d'une alternative risquée sera une
          simple moyenne pondérée par les probabilités :{" "}
          <M tex="\pi\, u(y) + (1-\pi)\, u(x)" />.
        </p>

        <p>L'intuition du cours, avec des réalisations non monétaires :</p>
        <ul className="list-disc space-y-1 pl-5">
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
            Ne confonds pas <em>mélange de probabilités</em> (rester dans le monde des
            alternatives risquées : indifférence préservée) et <em>mélange de biens</em> (créer
            un nouveau panier : tout peut changer). C'est exactement la subtilité que teste la propriété d'indépendance.
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
                  l'alternative risquée « 50 % de chances : un verre de vin ; 50 % de chances : un
                  verre de bière »
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
              text: <>n'importe quelle alternative risquée contenant du vin ou de la bière</>,
              explain: (
                <>
                  Trop large : l'alternative « 50 % vin, 50 % rien » contient une réalisation
                  (rien) que tu ne juges pas équivalente au verre de vin. L'indifférence n'est
                  garantie que si <strong>toutes</strong> les réalisations de l'alternative sont
                  jugées équivalentes au verre de vin (ici, vin ou bière).
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
          Le résultat central du modèle rationnel : un individu rationnel se comporte comme s'il
          calculait la moyenne pondérée non pas des montants, mais des utilités des montants.
        </Lead>

        <p>
          Si un individu a des préférences rationnelles (les 4 propriétés de A1 +
          l'indépendance), alors on peut <em>prouver</em> que ses choix se comportent{" "}
          <strong>comme s'il</strong> calculait une moyenne — non pas des montants, mais des{" "}
          <strong>utilités</strong> des montants (slide 12).
        </p>

        <Callout variant="retiens" title="Théorème · von Neumann & Morgenstern (1953)">
          <p>
            Des préférences rationnelles sur des alternatives risquées sont représentées par la
            fonction d'utilité de von Neumann-Morgenstern (vNM), où l'utilité est{" "}
            <strong>espérée</strong> :
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
            évalue un <em>montant certain</em> : <M tex="u(36)" /> = utilité d'avoir 36 $ en
            poche.
            <br />
            <strong>
              <M tex="U" /> majuscule (vNM)
            </strong>{" "}
            évalue une <em>alternative risquée entière</em> : c'est la moyenne pondérée des{" "}
            <M tex="u" />. On calcule <M tex="u" /> <em>d'abord</em> sur chaque réalisation, on
            pondère <em>ensuite</em>. L'erreur classique est de faire l'inverse :{" "}
            <M tex="u(\mathrm{VMA}) \ne U(a)" /> en général — tout le § 5 et le § 6 reposent sur
            cette différence !
          </p>
        </Callout>

        <H3>Deux individus, deux choix — tous deux rationnels</H3>
        <p>
          Reprenons l'action (36 $ ou 1 $, à 50/50) contre l'obligation (16 $ sûr) avec les deux
          personnages du cours.
        </p>

        <Callout variant="exemple" title={<>Exemple · Jean, <M tex="u(w) = \sqrt{w}" /></>}>
          <p>
            <M tex="U(\text{action}) = \tfrac{1}{2}\sqrt{36} + \tfrac{1}{2}\sqrt{1} = \tfrac{1}{2}\times 6 + \tfrac{1}{2}\times 1 = \mathbf{3{,}5}" />{" "}
            &ensp;|&ensp; <M tex="U(\text{obligation}) = \sqrt{16} = \mathbf{4}" />
          </p>
          <p>
            → Jean préfère <strong>l'obligation</strong>, pourtant de VMA plus faible. La racine
            carrée « écrase » les grands montants : passer de 1 à 36 $ ne multiplie l'utilité que
            par 6.
          </p>
          <p>
            Pour voir la linéarité dans les probabilités (§ 3) : si la probabilité de bons
            résultats était <M tex="\pi" /> au lieu de ½,{" "}
            <M tex="U(\text{action}) = \pi \times 6 + (1-\pi)\times 1 = 1 + 5\pi" />. Chaque
            point de pourcentage de <M tex="\pi" /> ajoute la même quantité d'utilité (0,05).
            Jean préférerait l'action dès que <M tex="1 + 5\pi > 4" />, c'est-à-dire dès que{" "}
            <M tex="\pi > 0{,}6" />.
          </p>
        </Callout>

        <Callout variant="exemple" title={<>Exemple · Sarah, <M tex="\tilde u(w) = 2w" /></>}>
          <p>
            <M tex="U(\text{action}) = \tfrac{1}{2}(2\times 36) + \tfrac{1}{2}(2\times 1) = 36 + 1 = \mathbf{37}" />{" "}
            &ensp;|&ensp; <M tex="U(\text{obligation}) = 2\times 16 = \mathbf{32}" />
          </p>
          <p>
            → Sarah préfère <strong>l'action</strong>. Sa fonction est linéaire : elle classe les
            actifs exactement comme la VMA (37 = 2 × 18,5 et 32 = 2 × 16). On verra au § 5
            qu'elle est <strong>neutre au risque</strong> : le risque ne compte pas pour elle —
            ce qui ne veut pas dire qu'elle « aime » le risque.
          </p>
        </Callout>

        <p>
          Moralité (slide 13) : les choix <strong>dépendent de la fonction d'utilité de
          Bernoulli</strong>. Deux individus rationnels peuvent faire des choix opposés face aux
          mêmes actifs — la « courbure » de leur <M tex="u" /> encode leur attitude face au
          risque (§ 5).
        </p>

        <H3>Et l'efficacité de Pareto ?</H3>
        <p>
          Les critères d'efficacité de Pareto vus en A1 servent encore à comparer des
          allocations d'actifs risqués, à condition de mesurer le payoff de chacun par son{" "}
          <strong>utilité espérée</strong> (slide 14). Exemple du cours :{" "}
          <TheoryRef chapter="a1" section="pareto" />
        </p>

        <Tbl minW={340}>
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
          <strong>domine l'allocation 1 au sens de Pareto</strong>. Intuition : donner l'actif
          risqué à celle que le risque ne gêne pas (Sarah, neutre au risque) et l'actif sûr à
          celui qui le fuit (Jean, averse au risque — § 5) améliore la situation de tout le
          monde. Échanger des actifs risqués peut donc créer de la valeur pour chacun.
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
                  que le risque ne gêne pas (Sarah, neutre) et l'actif sûr à celui qui le fuit
                  (Jean, averse) améliore la situation de tout le monde.
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
          Jean et Sarah l'ont montré : le choix rationnel entre deux actifs risqués dépend de
          l'<strong>attitude par rapport au risque</strong>. Le cours en distingue trois
          (slide 15). En mots simples :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            un individu <strong>neutre au risque</strong> ne prend pas en compte le risque
            associé à un actif ;
          </li>
          <li>
            un individu <strong>averse au risque</strong> tend à <em>éviter</em> les actifs dont
            le risque est plus grand ;
          </li>
          <li>
            un individu ayant une <strong>affinité au risque</strong> tend à{" "}
            <em>rechercher</em> les actifs dont le risque est plus grand.
          </li>
        </ul>

        <p>
          Pour rendre ces définitions précises, le cours construit deux actifs de{" "}
          <strong>même VMA</strong> mais de risques différents (slide 16). Avec{" "}
          <M tex="y > x" /> et <M tex="z > 0" /> :
        </p>

        <Tbl minW={360}>
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
          L'actif <M tex="a'" /> « écarte » les deux réalisations de <M tex="z" /> : même VMA,
          mais un risque plus grand. La comparaison entre <M tex="a" /> et <M tex="a'" /> isole
          donc l'effet <em>pur</em> du risque.
        </p>

        <Callout variant="definition" title="Définitions formelles · Attitudes face au risque">
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
              Les deux options ont la même VMA (2 500 €). Si l'option 1 est l'actif{" "}
              <M tex="a" /> (<M tex="y = 3\,000" />, <M tex="x = 2\,000" />), l'option 2 est
              exactement <M tex="a'" /> avec <M tex="z = 1\,000" />. 82 % des étudiants
              choisissent l'option 1, la moins risquée → <strong>une majorité est averse au
              risque</strong> (slide 19).
            </>
          }
        />

        <H3>Le lien avec la forme de u : le cœur du chapitre</H3>
        <p>
          Les définitions parlent de choix entre <M tex="a" /> et <M tex="a'" />. Les deux
          théorèmes qui suivent traduisent chaque attitude en une propriété de la fonction de
          Bernoulli <M tex="u" /> : c'est ce qui permet ensuite de tout calculer.
        </p>

        <Callout variant="retiens" title="Théorème · Neutralité au risque (slide 17)">
          <p>
            Soit <M tex="U" /> la fonction d'utilité de vNM d'un individu{" "}
            <strong>neutre au risque</strong>, et deux actifs risqués quelconques{" "}
            <M tex="a''" /> et <M tex="a'''" />. Alors :
          </p>
          <MB tex="U(a'') \ge U(a''') \iff \mathrm{VMA}(a'') \ge \mathrm{VMA}(a''')" />
          <p>
            Autrement dit, un individu neutre au risque préfère toujours l'actif qui a la plus
            grande VMA. En particulier, il est indifférent entre <M tex="a" /> et{" "}
            <M tex="a'" />, qui ont la même VMA.
          </p>
        </Callout>

        <H4>Preuve pas à pas (slides 17-18)</H4>
        <p>
          Le slide montre que si un individu neutre au risque est indifférent entre deux actifs{" "}
          <M tex="a''" /> et <M tex="a'''" />, alors ces actifs ont la même VMA :{" "}
          <M tex="U(a'') = U(a''') \Rightarrow \mathrm{VMA}(a'') = \mathrm{VMA}(a''')" />. Plan
          : d'abord prouver que <M tex="u" /> est une droite (étapes 1 à 5), ensuite calculer{" "}
          <M tex="U" /> (étapes 6 et 7).
        </p>
        <ProofSteps>
          <ProofStep n={1} title="Point de départ : la définition de la neutralité">
            <p>
              L'individu est neutre, donc indifférent entre <M tex="a" /> et <M tex="a'" /> :{" "}
              <M tex="U(a) = U(a')" />. On écrit chaque utilité espérée avec la formule (1) du
              § 4 (chaque réalisation a la probabilité ½) :
            </p>
            <MB tex="\tfrac{1}{2}\,u(y) + \tfrac{1}{2}\,u(x) = \tfrac{1}{2}\,u(y+z) + \tfrac{1}{2}\,u(x-z)" />
          </ProofStep>
          <ProofStep n={2} title="Regrouper">
            <p>
              On multiplie les deux côtés par 2, puis on fait passer <M tex="u(x-z)" /> à gauche
              et <M tex="u(y)" /> à droite :
            </p>
            <MB tex="u(x) - u(x-z) = u(y+z) - u(y)" />
            <p>
              En mots : l'utilité perdue quand <M tex="x" /> baisse de <M tex="z" /> est égale à
              l'utilité gagnée quand <M tex="y" /> monte de <M tex="z" />.
            </p>
          </ProofStep>
          <ProofStep n={3} title={<>Diviser par <M tex="z" /> (qui est positif)</>}>
            <MB tex="\frac{u(x) - u(x-z)}{z} = \frac{u(y+z) - u(y)}{z}" />
            <p>
              À gauche : la pente de <M tex="u" /> sur le petit intervalle{" "}
              <M tex="[x-z\,;\,x]" />, c'est-à-dire l'utilité rapportée par chaque euro juste en
              dessous de <M tex="x" />. À droite : la pente sur <M tex="[y\,;\,y+z]" />, juste
              au-dessus de <M tex="y" />.
            </p>
          </ProofStep>
          <ProofStep n={4} title={<>Faire tendre <M tex="z" /> vers 0</>}>
            <p>
              Sur un intervalle de plus en plus petit, la pente devient la dérivée (la pente
              exacte en un point). L'égalité devient :
            </p>
            <MB tex="u'(x) = u'(y)" />
            <p>
              Et cela vaut pour n'importe quels <M tex="y > x" /> : la dérivée de <M tex="u" />{" "}
              est la même partout.
            </p>
          </ProofStep>
          <ProofStep n={5} title="Pente partout identique ⇒ droite">
            <p>Une fonction dont la pente ne change jamais est une droite :</p>
            <MB tex="u(w) = b\,w + d \quad \text{pour tout } w > 0" />
            <p>
              où <M tex="b" /> (la pente commune) et <M tex="d" /> sont des constantes, avec{" "}
              <M tex="b > 0" /> car <M tex="u" /> est strictement croissante.
            </p>
          </ProofStep>
          <ProofStep n={6} title={<>Calculer <M tex="U" /> pour un actif quelconque</>}>
            <p>
              Prenons <M tex="a''" />, qui donne <M tex="y''" /> avec la probabilité{" "}
              <M tex="\pi''" /> et <M tex="x''" /> avec la probabilité <M tex="1-\pi''" /> :
            </p>
            <MB tex="\begin{aligned} U(a'') &= \pi''\, u(y'') + (1-\pi'')\, u(x'') \\ &= \pi''\,[b\,y'' + d] + (1-\pi'')\,[b\,x'' + d] \\ &= b\,[\pi''\, y'' + (1-\pi'')\, x''] + d \\ &= b \times \mathrm{VMA}(a'') + d \end{aligned}" />
            <p>
              Ligne 1 : formule (1). Ligne 2 : on remplace <M tex="u" /> par la droite de
              l'étape 5. Ligne 3 : on met <M tex="b" /> en évidence, et les deux <M tex="d" />{" "}
              donnent <M tex="\pi'' d + (1-\pi'')\, d = d" />. Ligne 4 : le crochet est
              exactement la VMA de <M tex="a''" />. Le même calcul donne{" "}
              <M tex="U(a''') = b \times \mathrm{VMA}(a''') + d" />.
            </p>
          </ProofStep>
          <ProofStep n={7} title="Conclure">
            <p>
              Si <M tex="U(a'') = U(a''')" />, alors{" "}
              <M tex="b\,\mathrm{VMA}(a'') + d = b\,\mathrm{VMA}(a''') + d" />. On retire{" "}
              <M tex="d" /> des deux côtés et on divise par <M tex="b > 0" /> :{" "}
              <M tex="\mathrm{VMA}(a'') = \mathrm{VMA}(a''')" />. Le même raisonnement marche
              avec « ≥ », car diviser par un nombre positif ne change pas le sens d'une
              inégalité : <M tex="U(a'') \ge U(a''') \iff \mathrm{VMA}(a'') \ge \mathrm{VMA}(a''')" />
              . ∎
            </p>
          </ProofStep>
        </ProofSteps>

        <Callout variant="intuition" title="En chiffres · pourquoi Jean n'est pas neutre">
          <p>
            Prends <M tex="u(w) = \sqrt{w}" />, <M tex="x = 100" /> et <M tex="y = 300" />, et
            calcule les deux pentes de l'étape 3 :
          </p>
          <Tbl minW={300}>
            <thead>
              <tr>
                <th className={TH}>z</th>
                <th className={`${TH} text-right`}>Pente sous x</th>
                <th className={`${TH} text-right`}>Pente au-dessus de y</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>50</td>
                <td className={TDnum}>0,059</td>
                <td className={TDnum}>0,028</td>
              </tr>
              <tr>
                <td className={TD}>10</td>
                <td className={TDnum}>0,051</td>
                <td className={TDnum}>0,029</td>
              </tr>
              <tr>
                <td className={TD}>1</td>
                <td className={TDnum}>0,050</td>
                <td className={TDnum}>0,029</td>
              </tr>
            </tbody>
          </Tbl>
          <p>
            Quand <M tex="z \to 0" />, elles tendent vers <M tex="u'(100) = 0{,}05" /> et{" "}
            <M tex="u'(300) \approx 0{,}029" /> : elles ne sont jamais égales. L'égalité de
            l'étape 3 est impossible, donc Jean n'est pas indifférent entre <M tex="a" /> et{" "}
            <M tex="a'" /> : il n'est pas neutre. Avec la droite <M tex="u(w) = w/20" />, au
            contraire, les deux pentes valent 0,05 pour tout <M tex="z" />.
          </p>
        </Callout>

        <Callout variant="retiens" title={<>À retenir · neutre au risque ⇔ <M tex="u" /> linéaire</>}>
          <p>
            La preuve montre : neutre ⇒ <M tex="u(w) = bw + d" /> ⇒{" "}
            <M tex="U = b \times \mathrm{VMA} + d" />. Réciproquement, si <M tex="u" /> est
            linéaire, l'étape 6 montre que <M tex="a" /> et <M tex="a'" /> (même VMA) ont la même
            utilité espérée : l'individu est neutre. Exemple : Sarah, <M tex="\tilde u(w) = 2w" />{" "}
            (<M tex="b = 2" />, <M tex="d = 0" />), pour qui <M tex="U = 2 \times \mathrm{VMA}" />{" "}
            (37 = 2 × 18,5).
          </p>
        </Callout>

        <Callout variant="retiens" title="Théorème · Aversion au risque (slide 19)">
          <p>
            Un individu est <strong>averse au risque</strong> si et seulement si son utilité
            marginale de la richesse est <strong>décroissante</strong>, autrement dit si et
            seulement si sa fonction d'utilité de Bernoulli <M tex="u" /> est{" "}
            <strong>concave</strong> :
          </p>
          <MB tex="u''(w) < 0 \quad \text{pour tout } w > 0" />
        </Callout>

        <H4>Preuve pas à pas (slide 20)</H4>
        <p>
          On compare deux actifs, qu'on réutilisera dans tout le reste du chapitre :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            l'<strong>actif sûr</strong> <M tex="a_s" /> rapporte <M tex="w > 0" /> à coup
            sûr ;
          </li>
          <li>
            l'<strong>actif risqué</strong> <M tex="a_r" /> rapporte <M tex="w + z" /> avec la
            probabilité 50 % et <M tex="w - z" /> avec la probabilité 50 % (<M tex="z > 0" />).
          </li>
        </ul>
        <p>
          Ils ont la même VMA : <M tex="\tfrac{1}{2}(w+z) + \tfrac{1}{2}(w-z) = w" />. Remarque
          du slide : si <M tex="w = y = x" />, alors <M tex="a_s = a" /> et{" "}
          <M tex="a_r = a'" /> (on retrouve les actifs de la définition). But : montrer que si{" "}
          <M tex="u'' < 0" />, alors <M tex="U(a_s) > U(a_r)" />.
        </p>
        <ProofSteps>
          <ProofStep n={1} title={<>Ce que veut dire <M tex="u'' < 0" /></>}>
            <p>
              La dérivée <M tex="u'" /> (l'utilité marginale) diminue quand la richesse
              augmente : chaque euro supplémentaire rapporte moins d'utilité que le précédent.
            </p>
          </ProofStep>
          <ProofStep n={2} title="Comparer le gain et la perte">
            <p>
              Les <M tex="z" /> euros gagnés au-dessus de <M tex="w" /> (de <M tex="w" /> à{" "}
              <M tex="w+z" />) viennent <em>après</em> les <M tex="z" /> euros perdus en dessous
              (de <M tex="w-z" /> à <M tex="w" />) : ils rapportent donc moins d'utilité.
            </p>
            <MB tex="\underbrace{u(w+z) - u(w)}_{\text{gain d'utilité}} < \underbrace{u(w) - u(w-z)}_{\text{perte d'utilité}}" />
          </ProofStep>
          <ProofStep n={3} title="Réarranger">
            <p>
              On ajoute <M tex="u(w) + u(w-z)" /> des deux côtés, puis on multiplie par ½ (un
              nombre positif : le sens de l'inégalité ne change pas) :
            </p>
            <MB tex="\tfrac{1}{2}\,[u(w+z) + u(w-z)] < \tfrac{1}{2}\,[u(w) + u(w)]" />
          </ProofStep>
          <ProofStep n={4} title="Reconnaître les deux côtés">
            <p>
              À gauche : <M tex="U(a_r)" />, la formule (1) avec deux réalisations à 50 %. À
              droite : <M tex="\tfrac{1}{2}u(w) + \tfrac{1}{2}u(w) = u(w) = U(a_s)" />, puisque
              l'actif sûr donne <M tex="w" /> dans tous les cas. Donc
            </p>
            <MB tex="U(a_r) < U(a_s)" />
            <p>
              À VMA égale, l'individu préfère l'actif sûr : il est averse au risque. ∎
            </p>
          </ProofStep>
        </ProofSteps>

        <Callout variant="exemple" title={<>En chiffres · <M tex="u(w) = \sqrt{w}" />, <M tex="w = 100" />, <M tex="z = 36" /></>}>
          <p>
            Gain d'utilité : <M tex="u(136) - u(100) \approx 11{,}66 - 10 = 1{,}66" />.<br />
            Perte d'utilité : <M tex="u(100) - u(64) = 10 - 8 = 2" />.<br />
            Comme <M tex="1{,}66 < 2" />, on a{" "}
            <M tex="U(a_r) = \tfrac{1}{2}(11{,}66 + 8) \approx 9{,}83 < 10 = U(a_s)" />.
          </p>
          <p>
            L'actif risqué (100 €, puis « +36 € ou −36 € » à pile ou face) a la même VMA
            (100 €) que l'actif sûr, mais il coûte de l'utilité : le gain ne compense pas la
            perte.
          </p>
        </Callout>

        <p>
          Symétriquement, si <M tex="u" /> est <strong>convexe</strong> (<M tex="u'' > 0" />),
          l'inégalité de l'étape 2 s'inverse : le gain rapporte plus que la perte ne coûte, donc{" "}
          <M tex="U(a_r) > U(a_s)" /> : <strong>affinité au risque ⇔ u convexe</strong>. Et si{" "}
          <M tex="u'' = 0" /> (droite), gain et perte s'équilibrent : neutralité.
        </p>

        <H4>Le graphique du slide 21, pas à pas</H4>
        <p>
          Sur la courbe <M tex="u" />, place <M tex="w-z" />, <M tex="w" /> et{" "}
          <M tex="w+z" />. Le milieu de la corde qui relie les points d'abscisses{" "}
          <M tex="w-z" /> et <M tex="w+z" /> est à la hauteur{" "}
          <M tex="\tfrac{1}{2}[u(w+z) + u(w-z)] = U(a_r)" />. Juste au-dessus, sur la courbe :{" "}
          <M tex="u(w) = u(\mathrm{VMA}(a_r)) = U(a_s)" />. Courbe concave ⇒ la corde passe{" "}
          <em>sous</em> la courbe ⇒ <M tex="U(a_r) < u(\mathrm{VMA}(a_r))" /> : c'est
          exactement l'inégalité de la preuve. Avance l'animation étape par étape (les dernières
          étapes, <M tex="C(a_r)" /> et PRM, sont expliquées au § 6).
        </p>

        <WidgetChordCurve />

        <Callout variant="intuition" title="Lien avec A2 : la même concavité">
          <p>
            Tu as déjà rencontré cette hypothèse. En A2, une utilité marginale décroissante (
            <M tex="u" /> concave, <M tex="u'' < 0" />) poussait l'individu à{" "}
            <strong>lisser sa consommation</strong> dans le temps. Ici, la même hypothèse
            explique pourquoi on fuit le risque : dans les deux cas, on préfère un niveau moyen
            sûr à une alternance d'extrêmes.{" "}
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
          Rappel des notations du § 5 : <M tex="a_s" /> est l'<strong>actif sûr</strong> (il
          rapporte <M tex="w" /> à coup sûr) et <M tex="a_r" /> l'<strong>actif risqué</strong>{" "}
          (<M tex="w+z" /> ou <M tex="w-z" />, à 50/50), de même VMA <M tex="w" />.
        </p>

        <H4>Préférer moins, mais sûr : l'argument de continuité (slide 22)</H4>
        <ProofSteps>
          <ProofStep n={1} title="À VMA égale, l'averse prend le sûr">
            <p>
              C'est le théorème du § 5 : <M tex="U(a_s) > U(a_r)" /> quand les deux actifs ont
              la même VMA.
            </p>
          </ProofStep>
          <ProofStep n={2} title="On baisse un peu le montant sûr : il le préfère encore">
            <p>
              Par continuité (§ 3 : deux montants très proches sont presque aussi désirables),
              si on retire quelques centimes à l'actif sûr, il reste préféré à{" "}
              <M tex="a_r" />. L'averse au risque préfère donc parfois un actif de{" "}
              <strong>VMA plus faible</strong>, si cet actif réduit substantiellement le risque.
            </p>
          </ProofStep>
          <ProofStep n={3} title="C'est le choix des 97 % de l'amphi">
            <p>
              Souviens-toi du sondage nº 1 : 97 % des étudiants préfèrent{" "}
              <strong>3 M€ certains</strong> (VMA 3 M€) à « 10 M€ ou rien, à pile ou face »
              (VMA 5 M€). Ils renoncent à 2 M€ de VMA pour supprimer le risque.
            </p>
          </ProofStep>
          <ProofStep n={4} title="Jusqu'où ?">
            <p>
              Le montant sûr qui vaut <em>exactement</em> autant que l'actif risqué s'appelle
              l'<strong>équivalent certain</strong> (au-dessus, l'averse prend le sûr ; en
              dessous, il prend le risqué). L'écart avec la VMA, c'est la{" "}
              <strong>prime de risque minimale</strong>. Deux définitions permettent ainsi de{" "}
              <strong>chiffrer</strong> la peur du risque.
            </p>
          </ProofStep>
        </ProofSteps>

        <Callout variant="definition" title={<>Définitions · Équivalent certain <M tex="C(a_r)" /> et <M tex="\mathrm{PRM}(a_r)" /></>}>
          <p>
            Pour un individu de fonction d'utilité vNM <M tex="U" />, l'
            <strong>équivalent certain</strong> <M tex="C(a_r)" /> d'un actif risqué{" "}
            <M tex="a_r" /> est la valeur monétaire <em>sans risque</em> qui procure la même
            utilité :
          </p>
          <MB tex="U(a_r) = u\big(C(a_r)\big)" />
          <p>
            Pour un individu <strong>averse</strong> au risque :{" "}
            <M tex="C(a_r) < \mathrm{VMA}(a_r)" />.
          </p>
          <p>
            La <strong>prime de risque minimale</strong> <M tex="\mathrm{PRM}(a_r)" /> est la
            différence entre la VMA de l'actif et son équivalent certain :
          </p>
          <MB tex="\mathrm{PRM}(a_r) = \mathrm{VMA}(a_r) - C(a_r)" />
          <p>
            Pour un averse au risque, elle est donc positive.
          </p>
        </Callout>

        <p>
          À quoi sert la PRM ? (slide 23) Elle donne l'écart <strong>minimal</strong> qui doit
          exister entre le prix <M tex="p" /> de l'actif risqué et sa VMA pour que l'individu
          averse au risque veuille l'acheter. Il achète seulement si{" "}
          <M tex="p \le C(a_r)" />, c'est-à-dire si le prix est au moins PRM sous la VMA. En
          français courant : <M tex="C(a_r)" /> est le <strong>prix maximum</strong> qu'il
          accepte de payer pour l'actif, et la PRM le <strong>rabais sur la moyenne</strong>{" "}
          qu'il exige pour supporter le risque.
        </p>

        <Callout variant="exemple" title={<>Premier exemple · Jean (<M tex="u = \sqrt{w}" />) et l'action</>}>
          <p>
            L'action (36 $ ou 1 $, à 50/50) est un actif risqué <M tex="a_r" /> avec{" "}
            <M tex="w = 18{,}5" /> $ et <M tex="z = 17{,}5" /> $ (car 18,5 + 17,5 = 36 et
            18,5 − 17,5 = 1).
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              VMA : <M tex="\mathrm{VMA}(a_r) = 18{,}5" /> $.
            </li>
            <li>
              Utilité espérée (§ 4) :{" "}
              <M tex="U(a_r) = \tfrac{1}{2}\sqrt{36} + \tfrac{1}{2}\sqrt{1} = 3{,}5" />.
            </li>
            <li>
              Équivalent certain : on cherche le montant sûr qui donne la même utilité,{" "}
              <M tex="\sqrt{C} = 3{,}5" />. On élève au carré pour défaire la racine :{" "}
              <M tex="C = 3{,}5^2 = 12{,}25" /> $.
            </li>
            <li>
              PRM : <M tex="\mathrm{PRM} = 18{,}5 - 12{,}25 = 6{,}25" /> $.
            </li>
          </ol>
          <p>
            Jean n'achèterait donc pas l'action plus de 12,25 $ (<M tex="p \le C" />), alors
            qu'elle vaut 18,5 $ en moyenne. Cohérent avec le § 4 : 16 $ sûrs (l'obligation)
            valent plus pour lui que 12,25 $ sûrs, donc il préfère l'obligation.
          </p>
        </Callout>

        <p>
          Le graphique ci-dessous est <strong>LE graphique du chapitre</strong> (slides 21 et
          23) : apprends à le reconstruire les yeux fermés. C'est le même qu'au § 5, cette fois
          jusqu'au bout. La corde relie les deux réalisations ; son point du milieu donne
          l'utilité espérée <M tex="U(a_r)" />. De là, on se déplace{" "}
          <strong>horizontalement</strong> jusqu'à la courbe : le point atteint a pour abscisse{" "}
          <M tex="C(a_r)" />, puisque <M tex="u(C(a_r)) = U(a_r)" />. L'écart horizontal entre{" "}
          <M tex="C(a_r)" /> et <M tex="\mathrm{VMA}(a_r) = w" /> est la PRM.
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
          title="Calculer C et PRM avec u(w) = ln(w) — exercice du cours (slide 24)"
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
                  Par définition, <M tex="u(C) = U(a)" />, c'est-à-dire{" "}
                  <M tex="\ln(C) = 0{,}75\ln(110) + 0{,}25\ln(70)" />. On <em>inverse</em> le
                  logarithme avec l'exponentielle (car <M tex="e^{\ln C} = C" />) :{" "}
                  <M tex="C = e^{\,0{,}75\ln(110) + 0{,}25\ln(70)} = e^{4{,}5875} \approx \mathbf{98{,}25}" />{" "}
                  €. (Astuce générale : <M tex="C = u^{-1}(U)" />. Avec √, on élève au carré,
                  comme pour Jean ; avec ln, on prend l'exponentielle.)
                </p>
              ),
            },
            {
              title: "La PRM",
              content: (
                <p>
                  <M tex="\mathrm{PRM} = \mathrm{VMA} - C = 100 - 98{,}25 = \mathbf{1{,}75}" /> €.
                  Interprétation : cet individu est indifférent entre l'action et 98,25 € cash ;
                  il « paie » 1,75 € de moyenne pour se débarrasser du risque. Il n'achètera
                  l'action que si son prix ne dépasse pas 98,25 € (<M tex="p \le C" />), alors
                  qu'elle vaut 100 € en moyenne.
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
    </>
  );
}
