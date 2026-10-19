/*
 * Chapitre A2 — PartRationnel (sections affichées dans la page du chapitre).
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  BudgetPlayground,
  CardGrid,
  CommitCase,
  EulerPlayground,
  GoodClassifier,
  MasteryChecklist,
  MiniCard,
  PollCard,
  ReplacementChart,
} from "./widgets";
import { H3, Lead, Tbl, TH, TD } from "./ui";
import { OldAgePovertyChart } from "./anim/OldAgePovertyChart";

export function PartRationnel() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 0 · INTRO                                                  */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 0" title="Pourquoi ce chapitre existe">
        <Lead>
          Comment pousser les gens à <em>épargner</em> pour leur retraite ? Avant les maths,
          comprenons le <em>vrai</em> problème de société qui se cache derrière. Tout le reste du
          chapitre n'est qu'une tentative d'y répondre.
        </Lead>

        <p>
          En général, tu gagnes plus quand tu travailles que quand tu es à la retraite. Tu dois donc{" "}
          <strong>déplacer une partie de ton argent dans le futur</strong>. Mais beaucoup de gens
          n'épargnent pas assez et risquent de finir dans la précarité. Ce chapitre construit, brique
          par brique, deux théories du choix dans le temps : celle de l'individu parfaitement{" "}
          <strong>rationnel</strong>, puis celle de l'humain réel qui a des{" "}
          <strong>problèmes de self-contrôle</strong> (il prévoit d'épargner… puis craque au moment
          d'agir). Et il en tire des outils concrets de politique publique.
        </p>

        <div className="my-5 flex flex-wrap gap-x-8 gap-y-2 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">0 prérequis</strong> — tout est expliqué depuis le
            début
          </span>
          <span>
            <strong className="text-foreground">6 animations à curseurs</strong> — tu manipules δ,
            r, β toi-même (+ 2 sondages)
          </span>
          <span>
            <strong className="text-foreground">6 exercices corrigés pas à pas</strong> + 10 QCM
          </span>
        </div>

        <H3>Deux façons de financer les retraites</H3>
        <p>
          Quand tu seras vieux et que tu ne travailleras plus, d'où viendra ton argent ? Il existe
          deux grands mécanismes :
        </p>
        <CardGrid>
          <MiniCard title="① La retraite par répartition">
            Les gens qui <strong>travaillent aujourd'hui</strong> cotisent pour payer{" "}
            <strong>directement</strong> les pensions des retraités d'aujourd'hui. C'est un relais :
            chaque génération paie pour la précédente.
          </MiniCard>
          <MiniCard title="② L'épargne privée">
            Chaque travailleur met <strong>lui-même</strong> de l'argent de côté pendant sa vie
            active, pour le consommer plus tard. Tu finances <strong>ta propre</strong> retraite.
          </MiniCard>
        </CardGrid>
        <p>
          L'épargne privée peut être <strong>obligatoire</strong> (la loi impose de cotiser à un
          fonds de pension, souvent via l'employeur) ou <strong>volontaire</strong> (tu décides
          seul·e combien tu mets de côté). Beaucoup de pays mélangent ces mécanismes. Mais plus un
          pays compte sur l'<strong>épargne privée volontaire</strong>, plus il dépend de la
          discipline des individus. Et là, gros problème :{" "}
          <strong>
            ceux qui n'épargnent pas assez risquent de tomber dans la précarité une fois arrivés à
            l'âge de la retraite.
          </strong>
        </p>

        <H3>Ce que montrent les chiffres</H3>
        <Callout variant="definition" title="Taux de remplacement (replacement rate)">
          Le niveau de ta pension <strong>publique + privée obligatoire</strong> (donc{" "}
          <em>sans</em> ton épargne volontaire), comparé au revenu que tu avais pendant ta vie
          active. Un taux de 50 % veut dire : « à la retraite, ces pensions me versent la moitié de
          mon ancien salaire ».{" "}
          <strong>Un taux bas = il faut compenser par de l'épargne volontaire.</strong>
        </Callout>

        <ReplacementChart />

        <p>
          Six pays sont sous la barre des 50 % : le Royaume-Uni, la Pologne, le Japon, l'Australie,
          la Suisse et les États-Unis (la Belgique est à 66 %). Dans ces six pays, une retraite
          confortable dépend beaucoup de l'épargne volontaire. Leurs retraités sont-ils plus souvent
          pauvres ? C'est ce que montre le second graphique du cours.
        </p>

        <OldAgePovertyChart />

        <Callout variant="attention" title="Le constat qui lance tout le chapitre">
          <p>
            Regarde le cadre rouge : au Royaume-Uni, au Japon, en Suisse, aux États-Unis et en
            Australie, cinq pays où les pensions obligatoires remplacent moins de la moitié du
            salaire, les 65 ans et plus sont{" "}
            <strong>plus souvent pauvres que l'ensemble de la population</strong> (en Australie,
            environ 26 % contre 14 %). À l'inverse, dans le cadre vert (Danemark, France, Pays-Bas),
            où ce taux dépasse 67 %, les âgés sont nettement moins pauvres que la moyenne. (La
            légende du graphique signale une exception, la Pologne : le taux de remplacement
            n'explique pas tout.)
          </p>
          <p>
            Le message du cours : les systèmes qui reposent beaucoup sur l'épargne volontaire{" "}
            <strong>génèrent plus de pensionnés précarisés</strong>. D'où la question centrale :
          </p>
          <p className="text-[17px] font-semibold text-foreground">
            « Comment faire pour <em>encourager</em> les individus à épargner suffisamment ? »
          </p>
        </Callout>

        <Callout variant="methode" title="Comment lire ce chapitre">
          On va répondre deux fois à cette question. <strong>D'abord</strong> avec le{" "}
          <strong>modèle rationnel</strong> (§ 2 à § 4) : des gens parfaitement cohérents, qui font
          un plan et s'y tiennent. La réponse sera « rendre l'épargne plus rentable » (la
          subventionner). <strong>Ensuite</strong> avec les{" "}
          <strong>problèmes de self-contrôle</strong> (§ 5 à § 7) : des gens qui prévoient
          d'épargner… puis craquent au moment d'agir, comme nous tous. On verra comment ils peuvent
          se lier les mains (les <em>commitment devices</em>) et comment l'État peut les pousser en
          douceur (les <em>nudges</em> : option par défaut, SmarTplan). Garde toujours cette
          question en tête : c'est le fil rouge.
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 1 · BOÎTE À OUTILS                                         */}
      {/* ============================================================ */}
      <Section id="outils" kicker="§ 1" title="La boîte à outils">
        <Lead>
          Quatre idées reviennent partout dans ce chapitre. Si tu les maîtrises, le reste coule de
          source. On part vraiment de zéro.
        </Lead>

        <H3>
          Outil 1 — Le taux d'intérêt et le facteur <M tex="(1+r)" />
        </H3>
        <p>
          Le <strong>taux d'intérêt</strong> <M tex="r" /> est le « prix du temps ». Si tu prêtes
          1 € pendant une période à un taux <M tex="r" />, tu récupères <M tex="1+r" /> €.
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Si <M tex="r = 5\,\% = 0{,}05" />, alors 1 € prêté devient <M tex="1+r = 1{,}05" /> €.
            Tu as gagné 5 centimes.
          </li>
          <li>
            Si <M tex="r = 300\,\% = 3" /> (un taux énorme, mais courant dans les exercices pour
            faire ressortir les calculs), alors 1 € devient <M tex="1+r = 4" /> €.
          </li>
        </ul>
        <Callout variant="retiens" title="Le réflexe à avoir">
          <strong>Avancer dans le temps</strong> (de maintenant vers plus tard) ={" "}
          <strong>
            multiplier par <M tex="(1+r)" />
          </strong>
          . <strong>Reculer dans le temps</strong> (ramener une somme future à aujourd'hui) ={" "}
          <strong>
            diviser par <M tex="(1+r)" />
          </strong>
          . C'est tout. Garde cette boussole.
        </Callout>

        <H3>Outil 2 — Valeur présente &amp; valeur future</H3>
        <p>
          Un même montant ne « vaut » pas pareil selon le moment où on le reçoit. On a donc besoin
          de deux conversions.
        </p>
        <Callout variant="definition" title="Valeur future">
          Ce que devient une somme d'aujourd'hui si on la place jusqu'à demain. On <em>avance</em>{" "}
          dans le temps : on{" "}
          <strong>
            multiplie par <M tex="(1+r)" />
          </strong>
          .
        </Callout>
        <Callout variant="definition" title="Valeur présente (ou actualisée)">
          Ce que vaut <em>aujourd'hui</em> une somme qu'on ne touchera que demain. On{" "}
          <em>recule</em> dans le temps : on{" "}
          <strong>
            divise par <M tex="(1+r)" />
          </strong>
          .
        </Callout>
        <p>
          Pourquoi diviser pour la valeur présente ? Posons-nous la question à l'envers : « combien
          dois-je placer <em>aujourd'hui</em> pour avoir 100 € demain ? » Si <M tex="r = 25\,\%" />,
          je dois placer <M tex="x" /> tel que <M tex="x(1+0{,}25)=100" />, donc{" "}
          <M tex="x = \dfrac{100}{1{,}25} = 80" /> €. Recevoir 100 € demain équivaut à recevoir
          80 € aujourd'hui.
        </p>
        <Callout variant="intuition" title="L'image à retenir">
          L'argent dans le futur est « décoté » : 100 € promis pour demain valent <em>moins</em> de
          100 € aujourd'hui, parce qu'aujourd'hui ces 100 € pourraient déjà travailler et grossir.
          Plus <M tex="r" /> est élevé, plus le futur est décoté.
        </Callout>

        <Quiz
          scope="a2"
          id="q1"
          question={
            <>
              Le taux d'intérêt est <M tex="r = 25\,\%" />. On te promet <strong>50 € dans un
              an</strong>. Combien cette promesse vaut-elle <em>aujourd'hui</em> ?
            </>
          }
          options={[
            {
              text: <>50 € — un euro reste un euro.</>,
              explain: (
                <>
                  Non : l'argent futur est décoté. 50 € placés aujourd'hui deviendraient 62,50 €
                  demain, donc une promesse de 50 € demain vaut forcément moins de 50 € aujourd'hui.
                </>
              ),
            },
            {
              text: <>40 €</>,
              correct: true,
              explain: (
                <>
                  Exactement : reculer dans le temps = diviser par <M tex="(1+r)" />, soit{" "}
                  <M tex="50/1{,}25 = 40" /> €. Vérification : 40 € placés à 25 % donnent bien
                  50 € demain.
                </>
              ),
            },
            {
              text: <>62,50 €</>,
              explain: (
                <>
                  Tu as multiplié par <M tex="(1+r)" /> : c'est la valeur <em>future</em> de 50 €
                  d'aujourd'hui. Pour une somme future, on <strong>divise</strong>.
                </>
              ),
            },
            {
              text: <>45 €</>,
              explain: (
                <>
                  Tu as soustrait 10 % au lieu de diviser par 1,25. La bonne opération :{" "}
                  <M tex="50/(1+r) = 50/1{,}25 = 40" /> €.
                </>
              ),
            },
          ]}
          explanation={
            <>
              La boussole de tout le chapitre : <strong>avancer = multiplier</strong> par{" "}
              <M tex="(1+r)" />, <strong>reculer = diviser</strong> par <M tex="(1+r)" />.
            </>
          }
        />

        <H3>Outil 3 — Le facteur d'escompte δ</H3>
        <p>
          Le <M tex="(1+r)" /> est une affaire de <em>marché</em> (la banque). Le facteur d'escompte{" "}
          <M tex="\delta" /> (la lettre grecque « delta »), lui, est une affaire de{" "}
          <strong>psychologie</strong> : il mesure à quel point <em>toi, dans ta tête</em>, tu
          accordes de l'importance au plaisir de demain par rapport à celui d'aujourd'hui.
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <M tex="\delta" /> est un nombre entre 0 et 1.
          </li>
          <li>
            <M tex="\delta" /> proche de <strong>1</strong> = tu es <strong>patient</strong> : le
            plaisir de demain compte presque autant que celui d'aujourd'hui.
          </li>
          <li>
            <M tex="\delta" /> proche de <strong>0</strong> = tu es <strong>impatient</strong> :
            seul compte le présent, demain ne pèse presque rien.
          </li>
        </ul>
        <p>
          Concrètement, un plaisir ressenti demain est « rapetissé » d'un facteur <M tex="\delta" />{" "}
          dans ton évaluation d'aujourd'hui. Un plaisir dans deux périodes ? Rapetissé deux fois :{" "}
          <M tex="\delta \times \delta = \delta^2" />. Dans <M tex="t" /> périodes :{" "}
          <M tex="\delta^t" />. C'est exactement la même logique de décote que la valeur présente,
          mais côté <em>préférences</em> au lieu du marché.
        </p>

        <H3>Outil 4 — Utilité, utilité marginale &amp; concavité</H3>
        <p>
          En économie, l'<strong>utilité</strong> <M tex="u" /> est une mesure (un nombre) de la
          satisfaction que te procure une consommation. La fonction <M tex="u(c)" /> transforme une
          quantité consommée <M tex="c" /> en un niveau de satisfaction.
        </p>
        <p>
          L'<strong>utilité marginale</strong>, notée <M tex="u'(c)" /> (la dérivée), répond à :
          « si je consomme <em>une unité de plus</em>, combien de satisfaction <em>en plus</em>{" "}
          est-ce que je gagne ? »
        </p>
        <Callout
          variant="definition"
          title="Utilité marginale décroissante = la fonction est concave"
        >
          Hypothèse-clé de tout le chapitre :{" "}
          <strong>chaque unité supplémentaire fait moins plaisir que la précédente</strong>. Ton 1
          <sup>er</sup> verre d'eau après une rando : extase. Le 8<sup>e</sup> : bof.
          Mathématiquement, <M tex="u'" /> diminue quand <M tex="c" /> augmente ; on dit que{" "}
          <M tex="u" /> est <strong>concave</strong> (notation : <M tex="u'' < 0" />, la dérivée
          seconde est négative). Graphiquement, la courbe monte mais{" "}
          <strong>de moins en moins vite</strong>, comme une colline qui s'aplatit.
        </Callout>
        <p>
          Pourquoi c'est si important ? Parce qu'une fonction concave{" "}
          <strong>déteste les extrêmes</strong>. Avoir 100 aujourd'hui et 0 demain fait beaucoup
          moins plaisir que 50 + 50, justement parce que les premières unités valent cher et les
          dernières peu. Exemple avec <M tex="u(c) = \sqrt{c}" /> :{" "}
          <M tex="\sqrt{100} + \sqrt{0} = 10" />, alors que{" "}
          <M tex="\sqrt{50} + \sqrt{50} \approx 7{,}07 + 7{,}07 \approx 14{,}1" />. Même total
          consommé (100), mais bien plus de satisfaction quand on répartit. Cette idée — qu'on préfère <strong>répartir</strong> plutôt que concentrer
          — est le moteur du « lissage de la consommation » qu'on verra au § 4.
        </p>

        <Callout variant="retiens" title="Récapitulatif de la boîte à outils">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <M tex="(1+r)" /> : avancer dans le temps = ×, reculer = ÷. Le prix du temps fixé par
              le marché.
            </li>
            <li>
              <strong>Valeur future</strong> = <M tex="\times(1+r)" /> | <strong>Valeur
              présente</strong> = <M tex="\div(1+r)" />.
            </li>
            <li>
              <M tex="\delta \in [0,1]" /> : ta patience. Proche de 1 = patient, proche de 0 =
              impatient.
            </li>
            <li>
              <M tex="u" /> concave (<M tex="u''<0" />) : on aime répartir, pas concentrer.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 2 · LE MODÈLE D'ÉPARGNE                                    */}
      {/* ============================================================ */}
      <Section id="modele" kicker="§ 2" title="Le modèle d'épargne">
        <Lead>
          On simplifie la vie d'une personne en <strong>deux périodes</strong> et on regarde une
          seule question : combien consommer maintenant, combien plus tard ?
        </Lead>
        <p>
          Le point de départ : un individu gagne typiquement{" "}
          <strong>plus d'argent pendant sa vie active que pendant sa retraite</strong>. Il choisit
          comment répartir ses revenus entre la consommation de sa vie active et celle de sa
          retraite. Et il peut <strong>transférer ses revenus dans le temps</strong>, en épargnant
          ou en empruntant.
        </p>

        <H3>Le décor : deux périodes, deux « biens »</H3>
        <p>
          Tout le modèle tient dans ce tableau de notations. Prends le temps de l'apprivoiser :
          chaque symbole reviendra sans cesse.
        </p>
        <Tbl>
          <thead>
            <tr>
              <th className={TH}>Symbole</th>
              <th className={TH}>Nom</th>
              <th className={TH}>Signification concrète</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <M tex="t=0" />
              </td>
              <td className={TD}>Période 0</td>
              <td className={TD}>
                La <strong>vie active</strong> (tu travailles)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="t=1" />
              </td>
              <td className={TD}>Période 1</td>
              <td className={TD}>
                La <strong>retraite</strong>
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="c_0,\ c_1" />
              </td>
              <td className={TD}>Les deux « biens »</td>
              <td className={TD}>La quantité consommée en période 0 et en période 1</td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="(c_0, c_1)" />
              </td>
              <td className={TD}>
                Le <strong>programme</strong>
              </td>
              <td className={TD}>
                Ton plan de consommation complet : le couple des deux quantités
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="m_0,\ m_1" />
              </td>
              <td className={TD}>Revenus</td>
              <td className={TD}>
                Ce que tu <em>gagnes</em> en période 0 (salaire) et en période 1 (petite pension)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="p_0,\ p_1" />
              </td>
              <td className={TD}>Prix</td>
              <td className={TD}>
                Le prix d'une unité de consommation pendant la vie active et pendant la retraite,
                avec <M tex="p_1 = p_0(1+i)" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="i" />
              </td>
              <td className={TD}>Inflation</td>
              <td className={TD}>
                De combien les prix montent entre les deux périodes (avec <M tex="i = 10\,\%" />,
                ce qui coûtait 2 € en coûte 2,20)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="\omega" />
              </td>
              <td className={TD}>
                La <strong>dotation</strong>
              </td>
              <td className={TD}>
                <M tex="\omega = \left(\frac{m_0}{p_0}, \frac{m_1}{p_1}\right)" /> : le programme
                obtenu si tu ne transfères rien dans le temps (ce que le revenu de chaque période
                permet d'acheter)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="r" />
              </td>
              <td className={TD}>Taux d'intérêt</td>
              <td className={TD}>
                Le taux auquel se font les transferts d'argent dans le temps (épargne ou emprunt)
              </td>
            </tr>
          </tbody>
        </Tbl>
        <Callout variant="exemple" title="Prix, inflation, dotation… puis la simplification du cours">
          <p>
            <em>Exemple (chiffres illustratifs).</em> Tu gagnes <M tex="m_0 = 2000" /> € quand une
            unité de consommation coûte <M tex="p_0 = 2" /> € : tu peux en acheter{" "}
            <M tex="m_0/p_0 = 1000" />. Avec une inflation de 10 % (<M tex="i = 0{,}1" />), le prix
            devient <M tex="p_1 = p_0(1+i) = 2 \times 1{,}1 = 2{,}2" /> € à la retraite. Ta pension{" "}
            <M tex="m_1 = 1100" /> € achète donc <M tex="m_1/p_1 = 1100/2{,}2 = 500" /> unités. Ta
            dotation est <M tex="\omega = (1000\,;\,500)" />.
          </p>
          <p className="mt-2">
            <strong>La simplification qu'on garde tout le long :</strong> les prix valent 1 dans les
            deux périodes, <M tex="p_0 = p_1 = 1" />. Donc <strong>pas d'inflation</strong> (
            <M tex="p_1 = p_0(1+i)" /> devient <M tex="1 = 1+i" />, donc <M tex="i = 0" />) et la
            dotation se lit directement en euros : <M tex="\omega = (m_0, m_1)" />. On peut se
            concentrer sur le seul effet du temps.
          </p>
        </Callout>
        <Callout variant="intuition" title="Un pont avec A1 : deux biens et un prix relatif">
          En A1, le travailleur choisissait entre deux biens : la consommation et le loisir. Ici,
          les deux « biens » sont la consommation d'aujourd'hui <M tex="c_0" /> et celle de demain{" "}
          <M tex="c_1" />. Le « prix » d'une unité de <M tex="c_0" />, exprimé en unités de{" "}
          <M tex="c_1" />, vaut <M tex="1+r" /> (tu vas voir pourquoi juste en dessous). Les outils
          d'A1 resservent donc tels quels : droite de budget, courbes d'indifférence, tangence.{" "}
          <TheoryRef chapter="a1" section="indiff" /> <TheoryRef chapter="a1" section="optim" />
        </Callout>

        <H3>Le mécanisme : épargner ou emprunter</H3>
        <p>
          La grande liberté de l'individu : il n'est pas <em>obligé</em> de consommer son revenu de
          chaque période au moment où il le touche. Il peut{" "}
          <strong>déplacer de l'argent dans le temps</strong>.
        </p>
        <CardGrid>
          <MiniCard title="Il épargne (prêteur)" tone="good">
            Si <M tex="c_0 < m_0" /> : il consomme <strong>moins</strong> que son revenu en période
            0. Il met de côté. Le surplus, placé, devient <M tex="(1+r)" /> fois plus gros en
            période 1.
          </MiniCard>
          <MiniCard title="Il emprunte" tone="bad">
            Si <M tex="c_0 > m_0" /> : il consomme <strong>plus</strong> que son revenu en période
            0. Il emprunte, et devra rembourser <M tex="(1+r)" /> fois plus en période 1.
          </MiniCard>
        </CardGrid>
        <Callout variant="exemple" title="Notre exemple fil rouge : 8 aujourd'hui, 4 à la retraite, taux de 25 %">
          Tu gagnes 8 pendant ta vie active et 4 à la retraite. Le taux d'intérêt vaut 25 %, donc{" "}
          <M tex="1+r = 1{,}25" />.
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Tu consommes <M tex="c_0 = 6" /> : tu <strong>épargnes</strong>{" "}
              <M tex="8 - 6 = 2" />, qui deviennent <M tex="2 \times 1{,}25 = 2{,}5" /> à la
              retraite. Donc <M tex="c_1 = 4 + 2{,}5 = 6{,}5" />.
            </li>
            <li>
              Tu consommes <M tex="c_0 = 10" /> : tu <strong>empruntes</strong>{" "}
              <M tex="10 - 8 = 2" /> et tu devras rembourser <M tex="2 \times 1{,}25 = 2{,}5" />.
              Donc <M tex="c_1 = 4 - 2{,}5 = 1{,}5" />.
            </li>
          </ul>
        </Callout>
        <Callout variant="retiens" title="Le coût d'opportunité du temps">
          Renoncer à consommer 1 € aujourd'hui te « rapporte » <M tex="(1+r)" /> € de consommation
          demain. Inversement, consommer 1 € de plus aujourd'hui (en empruntant) te « coûte »{" "}
          <M tex="(1+r)" /> € de consommation demain.{" "}
          <strong>
            Le prix d'une unité de présent, exprimé en futur, est <M tex="(1+r)" />.
          </strong>
        </Callout>

        <H3>Les deux extrêmes : valeur présente et future de la dotation</H3>
        <p>
          Question : au <em>maximum</em>, combien peux-tu consommer en période 0 si tu y consacres
          absolument tout ? Tu prends ton <M tex="m_0" /> <strong>plus</strong> tout ce que tu peux
          emprunter sur ton revenu futur. Or sur <M tex="m_1" /> tu ne peux emprunter aujourd'hui
          que sa valeur présente <M tex="\frac{m_1}{1+r}" />. D'où :
        </p>
        <FormulaBox
          tex="c_0^{\max} = m_0 + \frac{m_1}{1+r}"
          label="Valeur présente de la dotation"
          caption="Le maximum consommable en période 0 = tout aujourd'hui, en empruntant à fond sur demain."
        />
        <p>
          Symétriquement, le maximum consommable en période 1 = ton <M tex="m_1" />{" "}
          <strong>plus</strong> ton revenu de période 0 entièrement épargné (donc multiplié par{" "}
          <M tex="(1+r)" />) :
        </p>
        <FormulaBox
          tex="c_1^{\max} = (1+r)\,m_0 + m_1"
          label="Valeur future de la dotation"
          caption="Le maximum consommable en période 1 = tout reporté à demain, en épargnant à fond aujourd'hui."
        />
        <Callout variant="exemple" title="Avec l'exemple fil rouge (dotation (8 ; 4), taux de 25 %)">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Valeur présente :</strong>{" "}
              <M tex="c_0^{\max} = 8 + \frac{4}{1{,}25} = 8 + 3{,}2 = 11{,}2" />. Au maximum, tu
              consommes 11,2 aujourd'hui : tes 8, plus 3,2 empruntés, que ta pension de 4 rembourse
              pile (<M tex="3{,}2 \times 1{,}25 = 4" />).
            </li>
            <li>
              <strong>Valeur future :</strong>{" "}
              <M tex="c_1^{\max} = 1{,}25 \times 8 + 4 = 10 + 4 = 14" />. Au maximum, tu consommes
              14 à la retraite : tes 8 placés deviennent 10, plus ta pension de 4.
            </li>
          </ul>
          <p className="mt-2">
            Remarque : <M tex="14 = 1{,}25 \times 11{,}2" />. La valeur future est toujours la
            valeur présente multipliée par <M tex="(1+r)" /> : c'est la même richesse, vue à deux
            dates différentes.
          </p>
        </Callout>

        <H3>La contrainte de budget, sous ses deux formes</H3>
        <p>
          Tu ne peux pas dépenser plus que ce que tu as. Formellement, la{" "}
          <strong>valeur présente de ton programme</strong> (ce que tu consommes, ramené à
          aujourd'hui) ne peut pas dépasser la <strong>valeur présente de ta dotation</strong> (ce
          que tu gagnes, ramené à aujourd'hui) :
        </p>
        <FormulaBox
          tex="c_0 + \frac{c_1}{1+r} \;\le\; m_0 + \frac{m_1}{1+r}"
          label="Forme « valeur présente »"
        />
        <p>
          En multipliant les deux côtés par <M tex="(1+r)" /> (un nombre positif : le sens de
          l'inégalité ne change pas), on obtient la même contrainte écrite en{" "}
          <strong>valeurs futures</strong> : la valeur future de ton programme ne dépasse pas celle
          de ta dotation. C'est souvent la forme la plus pratique pour les calculs :
        </p>
        <FormulaBox
          tex="(1+r)\,c_0 + c_1 \;\le\; (1+r)\,m_0 + m_1"
          label="Forme « valeur future »"
        />
        <Callout variant="exemple" title="Test : ces programmes sont-ils accessibles ? (dotation (8 ; 4), taux de 25 %)">
          La contrainte s'écrit <M tex="1{,}25\,c_0 + c_1 \le 14" />.
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <M tex="(6\,;\,6{,}5)" /> : <M tex="1{,}25 \times 6 + 6{,}5 = 7{,}5 + 6{,}5 = 14" />.
              Accessible, pile sur la limite (il épargne 2).
            </li>
            <li>
              <M tex="(10\,;\,1{,}5)" /> : <M tex="1{,}25 \times 10 + 1{,}5 = 12{,}5 + 1{,}5 = 14" />.
              Accessible, pile sur la limite (il emprunte 2).
            </li>
            <li>
              <M tex="(10\,;\,2)" /> : <M tex="12{,}5 + 2 = 14{,}5 > 14" />.{" "}
              <strong>Inaccessible</strong> : il voudrait emprunter 2 mais ne rembourser que 2 au
              lieu de 2,5.
            </li>
          </ul>
        </Callout>

        <H3>Visualise-la : la droite de budget</H3>
        <p>
          Cette contrainte, tracée dans un repère (<M tex="c_0" /> en abscisse, <M tex="c_1" /> en
          ordonnée), est une <strong>droite</strong> : la droite de budget. Cinq choses à repérer :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Elle passe <strong>toujours</strong> par la dotation <M tex="\omega" /> (ne rien
            déplacer est toujours possible).
          </li>
          <li>
            Sa pente vaut{" "}
            <strong>
              <M tex="-(1+r)" />
            </strong>{" "}
            : le prix du présent en unités de futur.
          </li>
          <li>
            Ses deux bouts sont la <strong>valeur future</strong> de la dotation (en haut, sur l'axe
            vertical) et sa <strong>valeur présente</strong> (à droite, sur l'axe horizontal).
          </li>
          <li>
            À gauche de <M tex="\omega" /> (<M tex="c_0 < m_0" />), tu <strong>épargnes</strong> ; à
            droite de <M tex="\omega" /> (<M tex="c_0 > m_0" />), tu <strong>empruntes</strong>.
          </li>
          <li>
            Tous les programmes <em>sur</em> la droite ou <em>sous</em> elle (le triangle) sont
            accessibles ; sur la droite, tu dépenses tout.
          </li>
        </ul>
        <p>
          À toi de jouer : dans le widget ci-dessous, la dotation est <M tex="\omega = (8\,;\,4)" />,
          comme dans l'exemple fil rouge. Fais varier <M tex="r" /> et regarde bien ce qui bouge…
          et ce qui ne bouge pas : le quiz juste après te le demande. À <M tex="r = 0" />, la pente
          vaut <M tex="-1" /> : 1 € d'aujourd'hui vaut exactement 1 € de demain. Fais ensuite
          glisser <M tex="c_0" /> le long de la droite : dans la partie verte (à gauche de ω), tu
          épargnes ; dans la partie rose (à droite), tu empruntes.
        </p>

        <BudgetPlayground />

        <Quiz
          scope="a2"
          id="q2"
          question={<>Le taux d'intérêt <M tex="r" /> augmente. Que devient la droite de budget ?</>}
          options={[
            {
              text: <>Elle se déplace parallèlement vers la droite (plus de richesse partout).</>,
              explain: (
                <>
                  Non : un déplacement parallèle correspondrait à une hausse de la dotation. Ici la
                  dotation ne change pas — seul le « prix du temps » change.
                </>
              ),
            },
            {
              text: (
                <>
                  Elle <strong>pivote autour de la dotation ω</strong> et devient plus pentue.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : ω reste toujours accessible (ne rien déplacer est toujours possible), et la
                  pente <M tex="-(1+r)" /> devient plus raide. La valeur future monte, la valeur
                  présente recule.
                </>
              ),
            },
            {
              text: <>Elle pivote autour de son intersection avec l'axe vertical.</>,
              explain: (
                <>
                  Non : l'ordonnée à l'origine, c'est la valeur future <M tex="(1+r)m_0+m_1" /> —
                  elle <em>bouge</em> justement quand <M tex="r" /> change. Le seul point fixe est
                  la dotation ω.
                </>
              ),
            },
            {
              text: <>Elle ne bouge pas : seule la dotation change.</>,
              explain: (
                <>
                  C'est l'inverse : la dotation <M tex="(m_0,m_1)" /> est fixe, et c'est la droite
                  qui pivote autour d'elle.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Retour au widget si besoin : monte <M tex="r" /> et fixe des yeux le point ω — il ne
              bouge jamais, tandis que les deux extrémités de la droite se déplacent.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3 · PRÉFÉRENCES RATIONNELLES                               */}
      {/* ============================================================ */}
      <Section id="prefs" kicker="§ 3" title="Les préférences rationnelles">
        <Lead>
          On sait <em>ce qui est accessible</em> (la droite de budget). Reste à savoir{" "}
          <em>ce que la personne préfère</em>. « Rationnel » ne veut pas dire « intelligent » : ça
          veut dire des préférences <strong>cohérentes</strong>, qui respectent quelques règles.
        </Lead>

        <H3>La question : quel programme va-t-il choisir ?</H3>
        <p>
          Le cours pose deux questions : <em>quel programme <M tex="c = (c_0, c_1)" /> l'individu
          va-t-il choisir ?</em> et <em>comment influencer ce choix ?</em> La réponse de principe
          est simple : <strong>il choisit le programme qu'il préfère parmi ceux qui lui sont
          accessibles</strong>. Il reste à préciser ce que veut dire « préférer » de façon
          rationnelle, c'est-à-dire quelles <strong>contraintes la rationalité impose aux choix
          dans le temps</strong>.
        </p>
        <p>
          Pour cela, le cours élargit un instant le décor : un programme peut compter autant de
          périodes qu'on veut. On le note
        </p>
        <MB tex="c = (c_0, c_1, \dots, c_T)" />
        <p>
          où <M tex="c_t" /> est la consommation de la période <M tex="t" />, pour{" "}
          <M tex="t \in \{0, 1, \dots, T\}" />. <M tex="T" /> est la dernière période ; on peut
          même avoir <M tex="T = \infty" /> (une suite sans fin). Sa valeur présente se calcule
          avec la boussole du § 1 : chaque consommation est ramenée à aujourd'hui en divisant par{" "}
          <M tex="(1+r)" /> autant de fois qu'il y a de périodes d'attente.
        </p>
        <FormulaBox
          tex="c_0 + \frac{c_1}{1+r} + \frac{c_2}{(1+r)^2} + \cdots + \frac{c_T}{(1+r)^T}"
          label="Valeur présente d'un programme à T périodes"
        />
        <Callout variant="exemple" title="Exemple : trois périodes, taux de 10 %">
          <p>
            Le programme <M tex="c = (10\,;\,11\,;\,12{,}1)" /> a pour valeur présente :
          </p>
          <MB tex="10 + \frac{11}{1{,}1} + \frac{12{,}1}{1{,}1^2} = 10 + \frac{11}{1{,}1} + \frac{12{,}1}{1{,}21} = 10 + 10 + 10 = 30" />
          <p>
            Les 12,1 de la période 2 attendent deux périodes : on divise deux fois par 1,1. Avec
            deux périodes seulement (<M tex="T = 1" />), on retrouve la formule du § 2.
          </p>
        </Callout>

        <H3>Les six propriétés des préférences rationnelles</H3>
        <p>Trois symboles pour comparer deux programmes <M tex="c" /> et <M tex="c'" /> :</p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <M tex="c \succeq c'" /> : « <M tex="c" /> est <strong>au moins aussi bon</strong> que{" "}
            <M tex="c'" /> » (préférence faible) ;
          </li>
          <li>
            <M tex="c \succ c'" /> : « <M tex="c" /> est <strong>strictement préféré</strong> à{" "}
            <M tex="c'" /> » ;
          </li>
          <li>
            <M tex="c \prec c'" /> : l'inverse, « <M tex="c'" /> est strictement préféré à{" "}
            <M tex="c" /> ».
          </li>
        </ul>
        <p>
          Le cours suppose que les préférences <M tex="\succeq" /> ont six propriétés : quatre
          propriétés « classiques », puis deux propriétés propres aux choix dans le temps.
        </p>
        <CardGrid>
          <MiniCard title="1 · Complètes">
            On peut comparer <strong>n'importe quelle paire</strong> de programmes. Jamais de « je
            ne sais pas ».
          </MiniCard>
          <MiniCard title="2 · Transitives">
            Si <M tex="a \succeq b" /> et <M tex="b \succeq c" />, alors <M tex="a \succeq c" />.
            Les préférences ne « tournent pas en rond ».
          </MiniCard>
          <MiniCard title="3 · Monotones">
            Plus, c'est mieux : augmenter la consommation d'<strong>une seule période</strong> (sans
            toucher aux autres) augmente la satisfaction. Formellement : <M tex="c' \succ c" /> si{" "}
            <M tex="c'_\tau > c_\tau" /> et <M tex="c'_t = c_t" /> pour toutes les autres
            périodes <M tex="t \neq \tau" /> (<M tex="\tau" />, « tau », est la période où l'on
            ajoute de la consommation).
          </MiniCard>
          <MiniCard title="4 · Continues">
            Deux programmes très proches sont jugés presque aussi désirables. Pas de saut brutal.
          </MiniCard>
        </CardGrid>

        <Callout variant="retiens" title="5 · Stationnaires — la propriété vedette du chapitre">
          <p>
            <strong>
              Tes préférences sur les périodes à venir ne changent pas avec le temps qui passe.
            </strong>{" "}
            Formellement, pour toute consommation <M tex="a \ge 0" /> en première période :
          </p>
          <MB tex="\begin{aligned} &(a, c_1, \dots, c_T) \succeq (a, c_1', \dots, c_T') \\ \iff\; &(c_1, \dots, c_T) \succeq (c_1', \dots, c_T') \end{aligned}" />
          <p>
            En mots : si deux programmes ont le <strong>même début</strong> <M tex="a" />, les
            comparer aujourd'hui revient à comparer leurs suites, exactement comme tu les
            compareras demain, une fois <M tex="a" /> consommé. Exemple : si aujourd'hui tu
            préfères <M tex="(a\,;\,3\,;\,9)" /> à <M tex="(a\,;\,6\,;\,5)" />, alors demain, arrivé·e
            en période 1, tu dois encore préférer <M tex="(3\,;\,9)" /> à <M tex="(6\,;\,5)" />.
          </p>
          <p>
            Conséquence pratique :{" "}
            <strong>
              en l'absence de chocs (d'imprévus), pas besoin de ré-optimiser à chaque nouvelle
              période.
            </strong>{" "}
            Le plan que tu trouves optimal aujourd'hui reste le meilleur demain, parmi les
            programmes encore accessibles. Retiens bien cette propriété : au § 5, le double choix
            A1 + B2 de l'expérience « 100 € maintenant ou 110 € dans une semaine » la viole
            exactement.
          </p>
        </Callout>

        <H3>6 · L'indépendance du trade-off initial</H3>
        <p>
          Ta préférence sur les <strong>deux premières périodes</strong> ne dépend pas du programme
          qui les suit. Formellement, pour tous <M tex="a, b, d, e \ge 0" /> :
        </p>
        <MB tex="\begin{aligned} &(a, b, c_2, \dots, c_T) \succeq (d, e, c_2, \dots, c_T) \\ \iff\; &(a, b, c_2', \dots, c_T') \succeq (d, e, c_2', \dots, c_T') \end{aligned}" />
        <p>
          En mots : on compare deux débuts, <M tex="(a, b)" /> et <M tex="(d, e)" />, suivis de la{" "}
          <strong>même</strong> suite. Si on remplace cette suite commune par une autre (elle aussi
          commune aux deux), le classement des deux débuts ne doit pas changer. (« Trade-off
          initial » = l'arbitrage entre les deux premières périodes.)
        </p>
        <Callout variant="attention" title="Une hypothèse « forte » : elle exclut les habitudes">
          <p>
            Le cours prévient : cette hypothèse empêche que des <strong>habitudes</strong> prises
            dans les premières périodes créent des attentes ou des addictions qui changent tes
            préférences sur la suite. Son exemple : on peut imaginer que
          </p>
          <MB tex="\begin{aligned} &(1, 4, 4, \dots, 4) \succ (2, 2, 4, \dots, 4) \\ \text{mais}\quad &(1, 4, 2, \dots, 2) \prec (2, 2, 2, \dots, 2). \end{aligned}" />
          <p>L'histoire derrière ces chiffres :</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Si la suite reste à 4</strong> : sacrifier un peu en période 0 (1 au lieu de
              2) pour monter à 4 dès la période 1 vaut la peine. Le début <M tex="(1, 4)" /> gagne.
            </li>
            <li>
              <strong>Si la suite retombe à 2</strong> : avoir goûté à 4 rend le retour à 2
              pénible (tu t'es habitué·e au confort). Tu préfères alors n'y avoir jamais goûté : le
              début <M tex="(2, 2)" /> gagne.
            </li>
          </ul>
          <p>
            Le classement des <em>mêmes</em> débuts dépend alors de la suite : c'est exactement ce
            que l'hypothèse interdit. Ces préférences sont très humaines… mais pas « rationnelles »
            au sens du cours.
          </p>
        </Callout>

        <H3>Le résultat central : l'utilité escomptée</H3>
        <p>
          Voici le théorème qui rend tout calculable (Koopmans 1960 ; Bleichrodt et al. 2008) :{" "}
          <strong>si</strong> des préférences dans le temps respectent toutes ces hypothèses de
          rationalité, <strong>alors</strong> elles « escomptent l'utilité ». On additionne le
          plaisir de chaque période, mais chaque plaisir futur est <em>rapetissé</em> par le
          facteur d'escompte <M tex="\delta" />.
        </p>
        <p>Construisons la formule terme par terme :</p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Plaisir d'aujourd'hui (période 0) : <M tex="u(c_0)" />, pas de décote.
          </li>
          <li>
            Plaisir de demain (période 1) : rapetissé une fois → <M tex="\delta\,u(c_1)" />.
          </li>
          <li>
            Plaisir dans 2 périodes : rapetissé deux fois → <M tex="\delta^2\,u(c_2)" />.
          </li>
          <li>
            … et ainsi de suite jusqu'à la période <M tex="T" /> : <M tex="\delta^T u(c_T)" />.
          </li>
        </ul>
        <FormulaBox
          tex="\begin{aligned} U_0(c) &= \sum_{t=0}^{T} \delta^t\, u(c_t) \\ &= u(c_0) + \delta\,u(c_1) + \delta^2 u(c_2) + \cdots + \delta^T u(c_T) \end{aligned}"
          label="Utilité escomptée"
          caption={
            <>
              avec <M tex="\delta \in [0,1]" /> le facteur d'escompte et{" "}
              <M tex="u : \mathbb{R}_+ \to \mathbb{R}" /> strictement croissante (plus de
              consommation = plus d'utilité). Le symbole <M tex="\sum" /> (« sigma ») veut dire
              « somme » : on additionne les termes <M tex="\delta^t u(c_t)" /> pour{" "}
              <M tex="t = 0, 1, \dots, T" />. L'indice 0 de <M tex="U_0" /> rappelle qu'on évalue
              le programme depuis la période 0.
            </>
          }
        />
        <p>
          Exemple : avec <M tex="u(c) = \sqrt{c}" /> et <M tex="\delta = 0{,}9" />, le programme{" "}
          <M tex="(4\,;\,9)" /> vaut{" "}
          <M tex="U_0 = \sqrt{4} + 0{,}9 \times \sqrt{9} = 2 + 2{,}7 = 4{,}7" />.
        </p>
        <Callout variant="methode" title="Comment lire une fonction d'utilité">
          On dit que <M tex="U_0" /> <strong>représente</strong> les préférences{" "}
          <M tex="\succeq" /> lorsque, pour tous les programmes <M tex="c" /> et <M tex="c'" />,{" "}
          <M tex="c \succeq c' \iff U_0(c) \ge U_0(c')" />. Autrement dit, « je préfère{" "}
          <M tex="c" /> » revient exactement à « <M tex="c" /> me donne un plus gros score ».{" "}
          <strong>
            Pour comparer deux programmes, il suffit donc de calculer leur score et de prendre le
            plus grand.
          </strong>{" "}
          C'est ce qu'on fait dans tous les exercices.
        </Callout>

        <H3>L'utilité escomptée respecte bien les hypothèses</H3>
        <p>
          Le cours montre que des préférences à utilité escomptée satisfont bien les deux
          hypothèses propres au temps. Il faut un outil de plus : le{" "}
          <strong>score vu depuis la période 1</strong>,
        </p>
        <MB tex="U_1(c_1, \dots, c_T) = u(c_1) + \delta\,u(c_2) + \delta^2 u(c_3) + \cdots" />
        <p>
          C'est la même formule, mais « demain » joue le rôle d'« aujourd'hui » : <M tex="c_1" />{" "}
          n'est pas escompté, <M tex="c_2" /> l'est une fois, etc. Les deux énoncés du cours :
        </p>
        <ul className="my-3 list-disc space-y-3 pl-6">
          <li>
            <strong>Stationnarité :</strong> pour tout <M tex="a \ge 0" /> et tous programmes{" "}
            <M tex="c = (c_1, \dots, c_T)" /> et <M tex="c' = (c'_1, \dots, c'_T)" />,
            <MB tex="U_0(a, c) \ge U_0(a, c') \iff U_1(c) \ge U_1(c')." />
          </li>
          <li>
            <strong>Indépendance du trade-off initial :</strong> pour tous{" "}
            <M tex="a, b, d, e \ge 0" /> et toutes suites <M tex="c = (c_2, \dots, c_T)" /> et{" "}
            <M tex="c' = (c'_2, \dots, c'_T)" />,
            <MB tex="U_0(a, b, c) \ge U_0(d, e, c) \iff U_0(a, b, c') \ge U_0(d, e, c')." />
          </li>
        </ul>
        <Callout variant="methode" title="Pourquoi c'est vrai (le slide donne l'énoncé ; voici la preuve)">
          <p>
            <strong>Stationnarité.</strong> Mets <M tex="\delta" /> en facteur derrière le premier
            terme :
          </p>
          <MB tex="U_0(a, c_1, \dots, c_T) = u(a) + \delta\,\big[u(c_1) + \delta\,u(c_2) + \cdots\big] = u(a) + \delta\, U_1(c)." />
          <p>Donc :</p>
          <MB tex="\begin{aligned} U_0(a, c) \ge U_0(a, c') &\iff u(a) + \delta\,U_1(c) \ge u(a) + \delta\,U_1(c') \\ &\iff \delta\,U_1(c) \ge \delta\,U_1(c') \\ &\iff U_1(c) \ge U_1(c'). \end{aligned}" />
          <p>
            Ligne 2 : on retire <M tex="u(a)" /> des deux côtés (c'est le même <M tex="a" /> !).
            Ligne 3 : on divise par <M tex="\delta" />, un nombre positif, ce qui ne change pas le
            sens de l'inégalité (il faut <M tex="\delta > 0" /> : avec <M tex="\delta = 0" />, le
            futur ne compterait pas du tout).
          </p>
          <p className="mt-3">
            <strong>Indépendance.</strong> Même astuce, un cran plus loin. Avec{" "}
            <M tex="U_2(c) = u(c_2) + \delta\,u(c_3) + \cdots" /> (le score de la suite, vu depuis
            la période 2) :
          </p>
          <MB tex="U_0(a, b, c) = u(a) + \delta\,u(b) + \delta^2\, U_2(c)." />
          <p>
            Dans la comparaison <M tex="U_0(a, b, c) \ge U_0(d, e, c)" />, le terme{" "}
            <M tex="\delta^2 U_2(c)" /> est <strong>le même des deux côtés</strong> : il disparaît.
            Il reste <M tex="u(a) + \delta\,u(b) \ge u(d) + \delta\,u(e)" />, où la suite{" "}
            <M tex="c" /> n'apparaît plus. On obtient donc exactement la même condition avec{" "}
            <M tex="c'" />.
          </p>
        </Callout>
        <Callout variant="exemple" title="Retour sur l'exemple des habitudes">
          Avec <M tex="u(c) = \sqrt{c}" /> et <M tex="\delta = 0{,}9" />, le début{" "}
          <M tex="(1\,;\,4)" /> vaut <M tex="\sqrt{1} + 0{,}9 \times \sqrt{4} = 2{,}8" /> et le
          début <M tex="(2\,;\,2)" /> vaut{" "}
          <M tex="\sqrt{2} + 0{,}9 \times \sqrt{2} = 1{,}9\sqrt{2} \approx 2{,}69" />. Quelle que
          soit la suite (que des 4 ou que des 2), elle ajoute <em>la même chose</em> aux deux
          scores : <M tex="(1, 4, \dots)" /> gagne toujours. Un individu à utilité escomptée ne
          peut donc pas avoir le renversement « habitude » vu plus haut.
        </Callout>

        <H3>Utilité escomptée et impatience</H3>
        <p>
          Dernière conséquence, très intuitive : l'utilité escomptée implique une certaine forme
          d'<strong>impatience</strong>. Si <M tex="\delta < 1" />, l'individu ne préférera jamais{" "}
          <strong>repousser son programme de consommation d'une période</strong>. Pour tous{" "}
          <M tex="a, b, \dots \ge 0" /> :
        </p>
        <MB tex="(a, b, \dots) \succ (0, a, b, \dots)" />
        <p>
          À gauche, tu consommes <M tex="a" /> aujourd'hui, <M tex="b" /> demain, etc. À droite,
          exactement la même chose… mais avec une période de retard (rien aujourd'hui).
        </p>
        <Callout variant="methode" title="La preuve en une ligne">
          <p>
            Avec l'hypothèse simplificatrice du cours <M tex="u(0) = 0" />, repousser d'une
            période ajoute <strong>un δ de plus à chaque terme</strong> :
          </p>
          <MB tex="\begin{aligned} U_0(0, a, b, \dots) &= \underbrace{u(0)}_{=\,0} + \delta\,u(a) + \delta^2 u(b) + \cdots \\ &= \delta\,\big[u(a) + \delta\,u(b) + \cdots\big] = \delta\, U_0(a, b, \dots). \end{aligned}" />
          <p>
            Comme <M tex="\delta < 1" />, on a <M tex="\delta\, U_0(a, b, \dots) < U_0(a, b, \dots)" />{" "}
            (dès que le programme contient un peu de consommation, son score est positif) : le
            programme repoussé est moins bien classé.
          </p>
        </Callout>
        <Callout variant="exemple" title="Exemple chiffré : utilité racine carrée, facteur d'escompte 0,9">
          <Tbl minW={460}>
            <thead>
              <tr>
                <th className={TH}>Programme</th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="t = 0" />
                  </span>
                </th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="t = 1" />
                  </span>
                </th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="t = 2" />
                  </span>
                </th>
                <th className={TH}>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>
                  <M tex="(4\,;\,9)" />
                </td>
                <td className={TD}>
                  <M tex="\sqrt{4} = 2" />
                </td>
                <td className={TD}>
                  <M tex="0{,}9 \times \sqrt{9} = 2{,}7" />
                </td>
                <td className={TD}>—</td>
                <td className={TD}>
                  <strong>4,7</strong>
                </td>
              </tr>
              <tr>
                <td className={TD}>
                  <M tex="(0\,;\,4\,;\,9)" /> (repoussé)
                </td>
                <td className={TD}>
                  <M tex="\sqrt{0} = 0" />
                </td>
                <td className={TD}>
                  <M tex="0{,}9 \times \sqrt{4} = 1{,}8" />
                </td>
                <td className={TD}>
                  <M tex="0{,}81 \times \sqrt{9} = 2{,}43" />
                </td>
                <td className={TD}>
                  <strong>4,23</strong>
                </td>
              </tr>
            </tbody>
          </Tbl>
          <p>
            On retrouve la formule : <M tex="4{,}23 = 0{,}9 \times 4{,}7" />. Repousser le
            programme d'une période lui fait perdre 10 % de son score (la fraction{" "}
            <M tex="1 - \delta" />
            ). Attention : « impatient » ne veut pas dire « tout consommer tout de suite ». Au § 4,
            tu verras que la concavité de <M tex="u" /> pousse au contraire à étaler sa
            consommation.
          </p>
        </Callout>

        <ExerciseBlock
          scope="a2"
          id="ex1"
          number={1}
          title="Faut-il emprunter ?"
          difficulty={2}
          refs={[
            { chapter: "a2", section: "outils" },
            { chapter: "a2", section: "prefs", label: "Utilité escomptée" },
          ]}
          statement={
            <>
              Un individu rationnel a un facteur d'escompte <M tex="\delta" /> et une utilité{" "}
              <M tex="u(c) = \sqrt{c}" />. Sa dotation est <M tex="(m_0, m_1) = (4, 36)" />. Pour
              consommer plus en période 0, il envisage d'<strong>emprunter 5</strong> au taux{" "}
              <M tex="r = 300\,\%" />. Sous quelle condition sur <M tex="\delta" /> va-t-il
              emprunter ?
            </>
          }
          steps={[
            {
              title: "Traduire le taux",
              content: (
                <>
                  <p>
                    <M tex="r = 300\,\% = 3" />, donc <M tex="(1+r) = 4" />. Emprunter 5 aujourd'hui
                    obligera à rembourser <M tex="5 \times 4 = 20" /> en période 1.
                  </p>
                </>
              ),
            },
            {
              title: "Le programme s'il N'emprunte PAS",
              content: (
                <>
                  <p>
                    Il consomme sa dotation telle quelle : <M tex="c = (4, 36)" />.
                  </p>
                  <p>
                    Score : <M tex="U = \sqrt{4} + \delta\sqrt{36} = 2 + 6\delta" />.
                  </p>
                </>
              ),
            },
            {
              title: "Le programme s'il EMPRUNTE 5",
              content: (
                <>
                  <p>
                    Période 0 : <M tex="c_0 = 4 + 5 = 9" />. Période 1 :{" "}
                    <M tex="c_1 = 36 - 20 = 16" />.
                  </p>
                  <p>
                    Vérification : ce programme est accessible. Contrainte de budget (forme valeur
                    future) : <M tex="(1+r)\,c_0 + c_1 = 4 \times 9 + 16 = 52" />, et la dotation
                    donne <M tex="4 \times 4 + 36 = 52" />. Il est pile sur la droite de budget.
                  </p>
                  <p>
                    Score : <M tex="U = \sqrt{9} + \delta\sqrt{16} = 3 + 4\delta" />.
                  </p>
                </>
              ),
            },
            {
              title: "Comparer les deux scores",
              content: (
                <>
                  <p>
                    Il emprunte s'il n'y perd pas, c'est-à-dire si le score « emprunter » est au
                    moins aussi grand que le score « ne pas emprunter » :
                  </p>
                  <MB tex="3 + 4\delta \ge 2 + 6\delta \;\iff\; 3-2 \ge 6\delta - 4\delta \;\iff\; 1 \ge 2\delta \;\iff\; \delta \le \tfrac{1}{2}" />
                  <p>
                    En <M tex="\delta = \tfrac{1}{2}" /> pile, les deux scores valent 5 : il est
                    indifférent. Le corrigé du cours retient <M tex="\delta \le \tfrac{1}{2}" />.
                  </p>
                </>
              ),
            },
            {
              title: "Contrôle avec trois valeurs de δ",
              content: (
                <>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      <M tex="\delta = 0{,}3" /> : emprunter donne <M tex="3 + 1{,}2 = 4{,}2" />,
                      ne pas emprunter <M tex="2 + 1{,}8 = 3{,}8" />. Il emprunte.
                    </li>
                    <li>
                      <M tex="\delta = 0{,}5" /> : <M tex="3 + 2 = 5" /> contre{" "}
                      <M tex="2 + 3 = 5" />. Indifférent.
                    </li>
                    <li>
                      <M tex="\delta = 0{,}8" /> : <M tex="3 + 3{,}2 = 6{,}2" /> contre{" "}
                      <M tex="2 + 4{,}8 = 6{,}8" />. Il n'emprunte pas.
                    </li>
                  </ul>
                </>
              ),
            },
          ]}
          result={
            <>
              Il emprunte les 5 si <M tex="\delta \le \tfrac{1}{2}" />. <em>Intuition :</em>{" "}
              emprunter, c'est « voler » de la consommation au futur pour la mettre au présent. Seul
              un individu suffisamment <strong>impatient</strong> (petit <M tex="\delta" />) trouve
              ce transfert intéressant, malgré le taux d'intérêt énorme qui rend l'emprunt coûteux.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 4 · LE CHOIX OPTIMAL                                       */}
      {/* ============================================================ */}
      <Section id="choix" kicker="§ 4" title="Le choix optimal">
        <Lead>
          On combine enfin les deux pièces : le <em>possible</em> (budget) et le <em>désiré</em>{" "}
          (préférences). L'individu choisit le programme accessible qui lui donne le plus gros
          score. Le résultat : une seule équation qui résume tout, l'
          <strong>équation d'Euler</strong>.
        </Lead>

        <H3>L'intuition d'abord : le lissage de la consommation</H3>
        <p>
          Le cours ajoute une hypothèse : l'utilité marginale de la consommation est{" "}
          <strong>décroissante</strong>, autrement dit <M tex="u" /> est concave (
          <M tex="u'' < 0" />, voir § 1). Conséquence : on déteste les extrêmes, et l'individu tend
          à <strong>lisser</strong> sa consommation dans le temps, c'est-à-dire à la répartir entre
          les périodes pour qu'aucune ne soit famélique. C'est pourquoi l'impatience due à
          l'escompte (§ 3) <strong>n'implique pas</strong> de consommer toute la dotation en période
          0, même quand le taux d'intérêt est nul (<M tex="r = 0" />).
        </p>
        <Callout variant="intuition" title="Trois effets en jeu (détaillés plus bas)">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Lissage</strong>, lié à la concavité de <M tex="u" /> : il pousse à
              répartir, vers <M tex="c_0 = c_1" />.
            </li>
            <li>
              <strong>Impatience</strong>, liée à l'escompte (<M tex="\delta < 1" />) : elle pousse
              vers « plus maintenant ».
            </li>
            <li>
              <strong>Patience</strong>, liée au taux d'intérêt (<M tex="r > 0" />) : elle pousse
              vers « plus tard », car attendre rapporte.
            </li>
          </ul>
          <p className="mt-2">
            Le choix optimal est le compromis exact entre ces effets, et c'est ce que l'équation
            d'Euler va calculer.
          </p>
        </Callout>
        <p>
          Graphiquement, si <M tex="u" /> est concave, les <strong>courbes d'indifférence</strong>{" "}
          (les programmes qui donnent le même score) sont <strong>convexes</strong>. L'optimum{" "}
          <M tex="c^* = (c_0^*, c_1^*)" /> est le point où la courbe d'indifférence la plus haute
          possible <strong>touche</strong> (est tangente à) la droite de budget. Tu vas le voir
          bouger dans le widget plus bas. <TheoryRef chapter="a1" section="indiff" />
        </p>

        <H3>Le test du « dernier euro » : Euler sans calcul</H3>
        <p>
          Avant les maths, une expérience de pensée. Prends le <strong>dernier euro</strong> de ta
          consommation d'aujourd'hui et demande-toi : vaut-il mieux le consommer maintenant, ou
          l'épargner pour demain ?
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>Le consommer aujourd'hui</strong> rapporte <M tex="u'(c_0)" /> : l'utilité
            marginale d'aujourd'hui.
          </li>
          <li>
            <strong>L'épargner</strong> : placé, il devient <M tex="(1+r)" /> € demain. Chacun de
            ces euros rapporte <M tex="u'(c_1)" />, mais ce plaisir de demain est rapetissé par{" "}
            <M tex="\delta" /> quand on le regarde depuis aujourd'hui. Total :{" "}
            <M tex="\delta\,(1+r)\,u'(c_1)" />.
          </li>
        </ul>
        <p>
          Si l'épargne rapporte plus, tu as intérêt à déplacer cet euro vers demain ; si c'est la
          consommation immédiate, à faire l'inverse. Tu n'as plus rien à gagner quand{" "}
          <strong>
            le dernier euro rapporte autant d'utilité qu'on le consomme aujourd'hui ou qu'on
            l'épargne pour demain
          </strong>{" "}
          :
        </p>
        <MB tex="u'(c_0) = \delta\,(1+r)\,u'(c_1)" />
        <Callout variant="exemple" title="Exemple : le test du dernier euro en chiffres">
          <p>
            On prend <M tex="u(c) = \sqrt{c}" />, <M tex="\delta = 1" />, <M tex="r = 0" /> et{" "}
            <M tex="\omega = (8\,;\,4)" />. L'utilité marginale de <M tex="u(c) = \sqrt{c}" /> est{" "}
            <M tex="u'(c) = \frac{1}{2\sqrt{c}}" />. Au départ, tu consommes ta dotation :
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              consommer le dernier euro aujourd'hui rapporte{" "}
              <M tex="u'(8) = \frac{1}{2\sqrt{8}} \approx 0{,}177" /> ;
            </li>
            <li>
              l'épargner rapporte{" "}
              <M tex="\delta(1+r)\,u'(4) = 1 \times 1 \times \frac{1}{2\sqrt{4}} = 0{,}25" />.
            </li>
          </ul>
          <p className="mt-2">
            L'épargne gagne : déplace un euro vers demain. Avec <M tex="(7\,;\,5)" />, le score
            passe de <M tex="\sqrt{8} + \sqrt{4} \approx 4{,}828" /> à{" "}
            <M tex="\sqrt{7} + \sqrt{5} \approx 4{,}882" />. On continue tant que l'épargne rapporte
            plus, jusqu'à <M tex="(6\,;\,6)" /> : là, <M tex="u'(6) = u'(6)" />, les deux usages du
            dernier euro se valent. Le score vaut <M tex="2\sqrt{6} \approx 4{,}899" />, le maximum
            possible sur ce budget.
          </p>
        </Callout>

        <H3>Le calcul : lagrangien &amp; équation d'Euler</H3>
        <p>
          Mathématiquement, le problème de l'épargnant avec dotation <M tex="(m_0, m_1)" /> est :
        </p>
        <MB tex="\max_{c_0,\, c_1}\; U(c_0, c_1) \quad \text{sous la contrainte} \quad (1+r)\,c_0 + c_1 \le (1+r)\,m_0 + m_1" />
        <p>
          avec <M tex="U(c_0, c_1) = u(c_0) + \delta\,u(c_1)" /> (l'utilité escomptée sur deux
          périodes). La technique standard pour « maximiser sous contrainte » est le{" "}
          <strong>lagrangien</strong> : on fabrique une fonction qui combine l'objectif et la
          contrainte, reliés par un nombre <M tex="\lambda" /> (« lambda »), le{" "}
          <strong>multiplicateur de Lagrange</strong>. <TheoryRef chapter="a1" section="optim" />
        </p>
        <MB tex="\mathcal{L}(c_0, c_1, \lambda) = U(c_0, c_1) - \lambda\big[(1+r)c_0 + c_1 - (1+r)m_0 - m_1\big]" />
        <Callout variant="methode" title="Le multiplicateur de Lagrange : son sens et la recette">
          Tu n'as pas besoin de maîtriser la théorie du lagrangien pour ce cours, juste la{" "}
          <em>recette</em>. <M tex="\lambda" /> s'interprète comme l'
          <strong>utilité marginale du revenu</strong> : la variation d'utilité qu'on peut obtenir
          en augmentant d'une unité la <strong>valeur future de la dotation</strong>,{" "}
          <M tex="(1+r)m_0 + m_1" />. La recette : on dérive <M tex="\mathcal{L}" /> par rapport à{" "}
          <M tex="c_0" />, à <M tex="c_1" /> et à <M tex="\lambda" />, et on pose chaque dérivée
          égale à 0. Ce sont les <strong>conditions de premier ordre</strong> : des dérivées
          partielles nulles, comme au sommet d'une colline où la pente est plate.
        </Callout>
        <p>
          D'abord les deux dérivées de l'objectif. Dans <M tex="U = u(c_0) + \delta\,u(c_1)" />,
          seul le premier terme contient <M tex="c_0" /> et seul le second contient{" "}
          <M tex="c_1" /> :
        </p>
        <MB tex="\frac{\partial U}{\partial c_0} = u'(c_0) \qquad\qquad \frac{\partial U}{\partial c_1} = \delta\,u'(c_1)" />
        <p>Les trois conditions de premier ordre :</p>
        <MB tex="\begin{aligned} &(1)\quad \frac{\partial \mathcal{L}}{\partial c_0} = u'(c_0) - \lambda(1+r) = 0 \\ &\qquad\quad \iff u'(c_0) = \lambda(1+r) \\[4pt] &(2)\quad \frac{\partial \mathcal{L}}{\partial c_1} = \delta\,u'(c_1) - \lambda = 0 \\ &\qquad\quad \iff \delta\,u'(c_1) = \lambda \\[4pt] &(3)\quad \frac{\partial \mathcal{L}}{\partial \lambda} = -\big[(1+r)c_0 + c_1 - (1+r)m_0 - m_1\big] = 0 \\ &\qquad\quad \iff (1+r)\,c_0 + c_1 = (1+r)\,m_0 + m_1 \end{aligned}" />
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>(1)</strong> : dans <M tex="\mathcal{L}" />, <M tex="c_0" /> apparaît dans{" "}
            <M tex="U" /> (dérivée <M tex="u'(c_0)" />) et dans la contrainte, multiplié par{" "}
            <M tex="(1+r)" /> (dérivée <M tex="-\lambda(1+r)" />).
          </li>
          <li>
            <strong>(2)</strong> : même chose pour <M tex="c_1" />, qui apparaît avec le
            coefficient 1 dans la contrainte (dérivée <M tex="-\lambda" />).
          </li>
          <li>
            <strong>(3)</strong> : dériver par rapport à <M tex="\lambda" /> redonne la contrainte,
            cette fois avec le signe « = » : on dépense tout. C'est la{" "}
            <strong>condition d'épuisement du revenu</strong>.
          </li>
        </ul>
        <p>
          Ces trois équations forment un <strong>système de trois équations à trois
          inconnues</strong> : <M tex="c_0^*" />, <M tex="c_1^*" /> et <M tex="\lambda" />. Pour se
          débarrasser de <M tex="\lambda" />, on <strong>divise (1) par (2)</strong> :
        </p>
        <MB tex="\frac{u'(c_0)}{\delta\,u'(c_1)} = \frac{\lambda(1+r)}{\lambda} = 1+r \quad\iff\quad u'(c_0) = \delta\,(1+r)\,u'(c_1)" />
        <FormulaBox
          tex="u'(c_0^*) = \delta\,(1+r)\,u'(c_1^*)"
          label="Équation d'Euler (condition de tangence)"
          caption="Elle régit la manière dont un épargnant rationnel transfère ses revenus dans le temps. C'est exactement le test du dernier euro."
        />
        <p>
          Pourquoi « condition de tangence » ? Écrite{" "}
          <M tex="\frac{u'(c_0)}{\delta\,u'(c_1)} = 1+r" />, elle dit que la pente de la courbe
          d'indifférence (le taux auquel tu acceptes d'échanger du présent contre du futur) est égale
          à la pente de la droite de budget (le taux auquel le marché te le permet,{" "}
          <M tex="1+r" />) : les deux courbes se touchent sans se couper. Pour trouver{" "}
          <M tex="c_0^*" /> et <M tex="c_1^*" />, on résout ensemble Euler et la condition
          d'épuisement du revenu (3).
        </p>
        <p>
          Au passage, (2) donne la valeur de <M tex="\lambda" />. Dans l'exemple du dernier euro (
          <M tex="u = \sqrt{c}" />, <M tex="\delta = 1" />, <M tex="r = 0" />, optimum{" "}
          <M tex="(6\,;\,6)" />) : <M tex="\lambda = \delta\,u'(6) = \frac{1}{2\sqrt{6}} \approx 0{,}204" />
          . Vérifions l'interprétation : si la valeur future de la dotation passe de 12 à 13, le
          nouvel optimum est <M tex="(6{,}5\,;\,6{,}5)" /> et le score monte de{" "}
          <M tex="2\sqrt{6{,}5} - 2\sqrt{6} \approx 0{,}200" />, presque exactement{" "}
          <M tex="\lambda" />.
        </p>

        <H3>Lire l'équation d'Euler : les trois effets du cours</H3>
        <p>
          Rappel crucial : comme <M tex="u" /> est concave, <M tex="u'" /> est{" "}
          <strong>décroissante</strong>. Une utilité marginale plus <em>grande</em> signifie donc
          une consommation plus <em>petite</em>, et inversement. Le cours lit Euler à travers trois
          exemples :
        </p>
        <CardGrid cols={3}>
          <MiniCard title="Lissage lié à la concavité" tone="good">
            L'individu préfère <strong>répartir</strong> sa consommation entre les périodes.
            Exemple : <M tex="r = 0" /> et <M tex="\delta = 1" />. Euler devient{" "}
            <M tex="u'(c_0^*) = u'(c_1^*)" />, donc{" "}
            <strong>
              <M tex="c_0^* = c_1^*" />
            </strong>
            .
          </MiniCard>
          <MiniCard title="Impatience liée à l'escompte" tone="bad">
            L'individu tend à préférer consommer <strong>aujourd'hui</strong> plutôt que demain.
            Exemple : <M tex="r = 0" /> et <M tex="\delta < 1" />. Euler devient{" "}
            <M tex="u'(c_0^*) = \delta\,u'(c_1^*) < u'(c_1^*)" /> : utilité marginale plus petite
            aujourd'hui, donc{" "}
            <strong>
              <M tex="c_0^* > c_1^*" />
            </strong>
            .
          </MiniCard>
          <MiniCard title="Patience liée aux taux d'intérêt">
            Un fort taux d'intérêt incite à <strong>retarder</strong> sa consommation. Exemple :{" "}
            <M tex="r > 0" /> et <M tex="\delta = 1" />. Euler devient{" "}
            <M tex="u'(c_0^*) = (1+r)\,u'(c_1^*) > u'(c_1^*)" />, donc{" "}
            <strong>
              <M tex="c_0^* < c_1^*" />
            </strong>
            .
          </MiniCard>
        </CardGrid>
        <Callout variant="exemple" title="En chiffres : les trois préréglages du widget (utilité racine carrée, dotation (8 ; 4))">
          <Tbl minW={480}>
            <thead>
              <tr>
                <th className={TH}>Effet</th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="r" />
                  </span>
                </th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="\delta" />
                  </span>
                </th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="c_0^*" />
                  </span>
                </th>
                <th className={TH}>
                  <span className="normal-case">
                    <M tex="c_1^*" />
                  </span>
                </th>
                <th className={TH}>
                  Épargne{" "}
                  <span className="normal-case">
                    <M tex="m_0 - c_0^*" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={TD}>Lissage</td>
                <td className={TD}>0</td>
                <td className={TD}>1</td>
                <td className={TD}>6</td>
                <td className={TD}>6</td>
                <td className={TD}>2</td>
              </tr>
              <tr>
                <td className={TD}>Impatience</td>
                <td className={TD}>0</td>
                <td className={TD}>0,6</td>
                <td className={TD}>≈&nbsp;8,82</td>
                <td className={TD}>≈&nbsp;3,18</td>
                <td className={TD}>≈&nbsp;−0,82 (il emprunte)</td>
              </tr>
              <tr>
                <td className={TD}>Patience</td>
                <td className={TD}>50&nbsp;%</td>
                <td className={TD}>1</td>
                <td className={TD}>≈&nbsp;4,27</td>
                <td className={TD}>9,6</td>
                <td className={TD}>≈&nbsp;3,73</td>
              </tr>
            </tbody>
          </Tbl>
          <p>
            <strong>D'où viennent ces chiffres ?</strong> Avec <M tex="u = \sqrt{c}" />, Euler
            s'écrit <M tex="\frac{1}{2\sqrt{c_0}} = \delta(1+r)\frac{1}{2\sqrt{c_1}}" />, donc{" "}
            <M tex="\sqrt{c_1} = \delta(1+r)\sqrt{c_0}" /> et{" "}
            <M tex="c_1 = \delta^2(1+r)^2 c_0" />. On remplace dans (3), puis on divise par{" "}
            <M tex="(1+r)" /> :
          </p>
          <MB tex="c_0^* = \frac{m_0 + \frac{m_1}{1+r}}{1 + \delta^2(1+r)}" />
          <p>
            Exemple « patience » : <M tex="c_0^* = \frac{8 + 4/1{,}5}{1 + 1{,}5} = \frac{10{,}67}{2{,}5} \approx 4{,}27" />{" "}
            et <M tex="c_1^* = 1{,}5^2 \times 4{,}27 \approx 9{,}6" />. Contrôle avec (3) :{" "}
            <M tex="1{,}5 \times 4{,}27 + 9{,}6 \approx 16 = 1{,}5 \times 8 + 4" />.
          </p>
        </Callout>
        <Callout
          variant="retiens"
          title="Raccourci déduit d'Euler (non écrit sur les slides)"
        >
          <p>
            <strong>
              Compare <M tex="\delta(1+r)" /> à 1.
            </strong>{" "}
            Les trois exemples sont des cas particuliers de cette règle : Euler compare{" "}
            <M tex="u'(c_0^*)" /> et <M tex="u'(c_1^*)" /> à travers le produit{" "}
            <M tex="\delta(1+r)" />.
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <M tex="\delta(1+r) = 1" /> ⇒ <M tex="c_0^* = c_1^*" /> : l'impatience et la patience
              se compensent exactement (ex. <M tex="\delta = 0{,}8" /> et <M tex="r = 25\,\%" /> :{" "}
              <M tex="0{,}8 \times 1{,}25 = 1" />) ;
            </li>
            <li>
              <M tex="\delta(1+r) < 1" /> ⇒ <M tex="c_0^* > c_1^*" /> : l'impatience l'emporte ;
            </li>
            <li>
              <M tex="\delta(1+r) > 1" /> ⇒ <M tex="c_0^* < c_1^*" /> : la patience (le taux)
              l'emporte.
            </li>
          </ul>
          <p className="mt-2">
            Le lissage, lui, agit toujours : c'est lui qui évite les solutions extrêmes (tout
            consommer d'un coup).
          </p>
        </Callout>

        <p>
          Dans le widget, essaie les trois préréglages (lissage, impatience, patience) et regarde
          où tombe <M tex="c^*" /> par rapport à ω : à gauche de ω, l'individu épargne ; à droite,
          il emprunte.
        </p>

        <EulerPlayground />

        <Quiz
          scope="a2"
          id="q3"
          question={
            <>
              Un épargnant a <M tex="\delta = 0{,}8" /> et fait face à un taux{" "}
              <M tex="r = 25\,\%" />. Que prédit l'équation d'Euler pour son programme optimal ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Il consomme plus aujourd'hui (<M tex="c_0 > c_1" />) car il est impatient (
                  <M tex="\delta < 1" />
                  ).
                </>
              ),
              explain: (
                <>
                  Piège classique : ne regarde jamais <M tex="\delta" /> seul ! C'est le{" "}
                  <em>produit</em> <M tex="\delta(1+r)" /> qui décide, et ici il vaut exactement 1.
                </>
              ),
            },
            {
              text: (
                <>
                  Il consomme plus à la retraite (<M tex="c_0 < c_1" />) car le taux le récompense.
                </>
              ),
              explain: (
                <>
                  Le taux pousse effectivement vers le futur (patience)… mais l'impatience pousse
                  vers le présent avec la même force : <M tex="0{,}8 \times 1{,}25 = 1" />, les deux
                  effets s'annulent exactement.
                </>
              ),
            },
            {
              text: (
                <>
                  Il lisse parfaitement : <M tex="c_0 = c_1" />.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : <M tex="\delta(1+r) = 0{,}8 \times 1{,}25 = 1" />, donc{" "}
                  <M tex="u'(c_0) = u'(c_1)" /> et comme <M tex="u'" /> est strictement
                  décroissante, <M tex="c_0 = c_1" />. Son impatience est exactement compensée par
                  la récompense du taux.
                </>
              ),
            },
            {
              text: (
                <>
                  Impossible à dire sans connaître la fonction <M tex="u" />.
                </>
              ),
              explain: (
                <>
                  Dès que <M tex="u" /> est concave (utilité marginale décroissante), le <em>sens</em>{" "}
                  de l'arbitrage ne dépend que du produit <M tex="\delta(1+r)" /> — pas de la forme
                  exacte de <M tex="u" />.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Raccourci utile : calcule <strong>d'abord</strong> <M tex="\delta(1+r)" /> et
              compare-le à 1. Trois cas, trois conclusions.
            </>
          }
        />

        <H3>Et donc : comment inciter à épargner (réponse rationnelle)</H3>
        <p>
          On revient à la question du § 0 : sur base de notre modèle, comment inciter des individus
          rationnels à épargner davantage pour leur retraite ? Il faut pousser <M tex="c_0^*" /> vers
          le bas et <M tex="c_1^*" /> vers le haut. Quels leviers ?
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>
              <M tex="\delta" /> ? Impossible.
            </strong>{" "}
            C'est un paramètre des préférences, que le gouvernement ne contrôle pas.
          </li>
          <li>
            <strong>
              <M tex="r" /> ? Oui !
            </strong>{" "}
            Le taux qui affecte les décisions s'écrit <M tex="r = r^*(1+s)" />, où{" "}
            <M tex="r^*" /> est le taux d'intérêt du marché et <M tex="s \in \mathbb{R}" /> est le{" "}
            <strong>subside à la valeur</strong> (ou la taxe si <M tex="s < 0" />) affectant les
            revenus de l'épargne. « À la valeur » : le subside est un pourcentage de ces revenus.
          </li>
        </ul>
        <Callout variant="exemple" title="Exemple chiffré : taux de marché de 2 %, subside de 30 %">
          Avec <M tex="r^* = 2\,\%" /> et <M tex="s = 0{,}3" /> :{" "}
          <M tex="r = r^*(1+s) = 2\,\% \times 1{,}3 = 2{,}6\,\%" />. Sur 1000 € épargnés, le marché
          rapporte 20 € d'intérêts ; avec le subside, l'épargnant en touche 26 € : l'État ajoute
          30 % aux revenus de son épargne. Avec <M tex="s = -0{,}3" /> (une taxe de 30 %), il ne
          toucherait que 14 € (<M tex="r = 1{,}4\,\%" />).
        </Callout>
        <Callout variant="retiens" title="La réponse du modèle rationnel">
          Pour inciter à épargner, le gouvernement peut{" "}
          <strong>
            augmenter le retour de l'épargne en augmentant <M tex="s" />
          </strong>
          . Graphiquement, si <M tex="r" /> augmente, la droite de budget devient plus pentue (elle
          pivote autour de ω). Mathématiquement, si <M tex="r" /> augmente, alors{" "}
          <strong>sous certaines conditions</strong> <M tex="c_0^*" /> baisse et <M tex="c_1^*" />{" "}
          monte : l'individu épargne plus. <em>Exemple réel :</em> en Belgique, les travailleurs
          reçoivent un subside d'environ <strong>30 %</strong> sur les 1000 premiers euros épargnés
          durant l'année pour leur retraite.
        </Callout>
        <p>
          Vérifie-le dans le widget, en mode « Subside s (r* = 10 %) » : quand tu montes{" "}
          <M tex="s" />, <M tex="r = r^*(1+s)" /> augmente, la droite pivote autour de ω et
          l'épargne <M tex="m_0 - c_0^*" /> grandit. Avec <M tex="\delta = 0{,}9" /> (réglé
          automatiquement dans ce mode), l'épargne vaut 1,85 sans subside (<M tex="s = 0" />), 2,25
          avec <M tex="s = 1" /> et 2,91 avec <M tex="s = 3" /> ; avec une taxe qui supprime tout
          rendement (<M tex="s = -1" />, donc <M tex="r = 0" />), elle tombe à 1,37.
        </p>
        <Callout variant="intuition" title="Pour aller plus loin : pourquoi « sous certaines conditions » ?">
          Une hausse de <M tex="r" /> a deux effets sur un épargnant. D'un côté, consommer
          aujourd'hui devient plus cher en termes de demain : il est incité à épargner plus (effet
          de substitution). De l'autre, ses économies rapportent plus : il est plus riche, et cette
          richesse peut le pousser à consommer davantage dès aujourd'hui (effet de revenu). Le plus
          souvent, le premier l'emporte (c'est toujours le cas avec <M tex="u = \sqrt{c}" />), mais
          pas forcément. Les slides ne développent pas ce point : retiens surtout la formule du
          cours.
        </Callout>
        <Callout variant="attention" title="Garde ça en tête pour la suite">
          Tout ce qui précède suppose des gens{" "}
          <strong>parfaitement rationnels et stationnaires</strong>. Mais dans la vraie vie ? On se
          dit « j'épargnerai plus <em>demain</em> »… et demain, on craque. Le § 5 (les problèmes de
          self-contrôle) s'attaque à ce décalage entre le plan et l'action.
        </Callout>
      </Section>
    </>
  );
}
