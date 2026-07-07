/**
 * Chapitre A2 · Décision inter-temporelle.
 * Conversion fidèle du manuel interactif HTML (épargne, impatience,
 * self-contrôle) : tout le contenu pédagogique de la source est porté,
 * les widgets sont recréés en React/SVG dans ./a2/widgets.
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
  U0Chart,
} from "./a2/widgets";

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

const TH = "border-b bg-muted/70 px-3.5 py-2.5 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3.5 py-2.5 align-top";

/* ================================================================== */
/* Page du chapitre                                                    */
/* ================================================================== */

export default function Chapter() {
  return (
    <ChapterShell chapterId="a2">
      {/* ============================================================ */}
      {/* § 0 · INTRO                                                  */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 0 · La motivation" title="Pourquoi ce chapitre existe">
        <Lead>
          Comment pousser les gens à <em>épargner</em> pour leur retraite ? Avant les maths,
          comprenons le <em>vrai</em> problème de société qui se cache derrière. Tout le reste du
          chapitre n'est qu'une tentative d'y répondre.
        </Lead>

        <p>
          Tu gagnes plus quand tu travailles que quand tu es à la retraite. Tu dois donc{" "}
          <strong>déplacer une partie de ton argent dans le futur</strong>. Mais beaucoup de gens
          n'épargnent pas assez et finissent dans la précarité. Ce chapitre construit, brique par
          brique, deux théories du choix dans le temps : celle de l'individu parfaitement{" "}
          <strong>rationnel</strong>, puis celle de l'humain réel qui{" "}
          <strong>procrastine et craque</strong>. Et il en tire des outils concrets de politique
          publique.
        </p>

        <div className="my-5 flex flex-wrap gap-x-8 gap-y-2 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">0 prérequis</strong> — tout est expliqué depuis le
            début
          </span>
          <span>
            <strong className="text-foreground">4 widgets</strong> — tu manipules δ, r, β toi-même
          </span>
          <span>
            <strong className="text-foreground">8 exercices</strong> — tous corrigés étape par étape
          </span>
        </div>

        <H3>Deux façons de financer les retraites</H3>
        <p>
          Quand tu seras vieux et que tu ne travailleras plus, d'où viendra ton argent ? Il existe
          deux grands mécanismes :
        </p>
        <CardGrid>
          <MiniCard title="① La répartition">
            Les gens qui <strong>travaillent aujourd'hui</strong> paient des cotisations qui
            financent <strong>directement</strong> les pensions des retraités d'aujourd'hui. C'est
            un relais : chaque génération paie pour la précédente.
          </MiniCard>
          <MiniCard title="② L'épargne privée">
            Chaque travailleur met <strong>lui-même</strong> de l'argent de côté pendant sa vie
            active, pour le consommer plus tard. Tu finances <strong>ta propre</strong> retraite.
          </MiniCard>
        </CardGrid>
        <p>
          Beaucoup de pays mélangent les deux. Mais plus un pays compte sur l'
          <strong>épargne privée volontaire</strong>, plus il dépend de la discipline des individus.
          Et là, gros problème :{" "}
          <strong>
            ceux qui n'épargnent pas assez tombent dans la précarité une fois à la retraite.
          </strong>
        </p>

        <H3>Ce que montrent les chiffres</H3>
        <Callout variant="definition" title="Taux de remplacement (replacement rate)">
          La pension que tu touches, comparée à ton revenu quand tu travaillais. Un taux de 50 %
          veut dire : « à la retraite, je touche la moitié de mon ancien salaire ».
        </Callout>

        <ReplacementChart />

        <Callout variant="attention" title="Le constat qui lance tout le chapitre">
          <p>
            Les systèmes qui reposent beaucoup sur l'épargne volontaire produisent{" "}
            <strong>plus de retraités pauvres</strong> (la « pauvreté du grand âge »). D'où la
            question centrale :
          </p>
          <p className="text-[17px] font-semibold text-foreground">
            « Comment faire pour <em>encourager</em> les individus à épargner suffisamment ? »
          </p>
        </Callout>

        <Callout variant="methode" title="Comment lire ce chapitre">
          On va répondre deux fois à cette question. <strong>D'abord</strong> en supposant que les
          gens sont parfaitement rationnels (Partie A) : la réponse sera « subventionner
          l'épargne ». <strong>Ensuite</strong> en supposant qu'ils ont des faiblesses de volonté
          comme nous tous (Partie B) : la réponse deviendra « les pousser en douceur » (les fameux{" "}
          <em>nudges</em>). Garde toujours cette question en tête : c'est le fil rouge.
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 1 · BOÎTE À OUTILS                                         */}
      {/* ============================================================ */}
      <Section id="outils" kicker="§ 1 · Les fondations" title="La boîte à outils">
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
          dernières peu. Cette idée — qu'on préfère <strong>répartir</strong> plutôt que concentrer
          — est le moteur du « lissage de la consommation » qu'on verra en § 4.
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
      <Section id="modele" kicker="Partie A · § 2" title="Le modèle d'épargne">
        <Lead>
          On simplifie la vie d'une personne en <strong>deux périodes</strong> et on regarde une
          seule question : combien consommer maintenant, combien plus tard ?
        </Lead>

        <H3>Le décor : deux périodes, deux consommations</H3>
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
              <td className={TD}>Consommations</td>
              <td className={TD}>Ce que tu consommes en période 0 et en période 1</td>
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
                <M tex="\omega" />
              </td>
              <td className={TD}>
                La <strong>dotation</strong>
              </td>
              <td className={TD}>
                Le programme « par défaut » <M tex="(m_0, m_1)" /> si tu ne déplaces rien dans le
                temps
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <M tex="r" />
              </td>
              <td className={TD}>Taux d'intérêt</td>
              <td className={TD}>Le taux auquel tu épargnes ou empruntes</td>
            </tr>
          </tbody>
        </Tbl>
        <Callout variant="exemple" title="Une simplification qu'on garde tout le long">
          Les prix valent 1 dans les deux périodes (<M tex="p_0 = p_1 = 1" />), donc{" "}
          <strong>pas d'inflation</strong> (<M tex="i = 0" />). Avantage : la dotation{" "}
          <M tex="\omega = (m_0, m_1)" /> se lit directement en quantités, sans conversion. On peut
          se concentrer sur le seul effet du temps.
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
          label="Valeur présente de ω"
          caption="Le maximum consommable en période 0 = tout aujourd'hui, en empruntant à fond sur demain."
        />
        <p>
          Symétriquement, le maximum consommable en période 1 = ton <M tex="m_1" />{" "}
          <strong>plus</strong> ton revenu de période 0 entièrement épargné (donc multiplié par{" "}
          <M tex="(1+r)" />) :
        </p>
        <FormulaBox
          tex="c_1^{\max} = (1+r)\,m_0 + m_1"
          label="Valeur future de ω"
          caption="Le maximum consommable en période 1 = tout reporté à demain, en épargnant à fond aujourd'hui."
        />

        <H3>La contrainte de budget</H3>
        <p>
          Tu ne peux pas dépenser plus que ce que tu as. Formellement : la valeur présente de ce que
          tu <em>consommes</em> ne peut pas dépasser la valeur présente de ce que tu{" "}
          <em>gagnes</em>.
        </p>
        <MB tex="c_0 + \frac{c_1}{1+r} \;\le\; m_0 + \frac{m_1}{1+r}" />
        <p>
          En multipliant tout par <M tex="(1+r)" />, on obtient la même contrainte écrite en{" "}
          <strong>valeurs futures</strong> (souvent plus pratique pour les calculs) :
        </p>
        <FormulaBox
          tex="(1+r)\,c_0 + c_1 \;\le\; (1+r)\,m_0 + m_1"
          label="Forme « valeur future »"
        />

        <H3>Visualise-la : la droite de budget</H3>
        <p>
          Cette contrainte, tracée dans un repère (<M tex="c_0" /> en abscisse, <M tex="c_1" /> en
          ordonnée), est une <strong>droite</strong>. Tous les programmes <em>sur ou sous</em> la
          droite sont accessibles. Trois choses à repérer :
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
            Ses deux bouts sont exactement la <strong>valeur future</strong> (en haut, sur l'axe
            vertical) et la <strong>valeur présente</strong> (à droite, sur l'axe horizontal).
          </li>
        </ul>

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
      <Section id="prefs" kicker="Partie A · § 3" title="Les préférences rationnelles">
        <Lead>
          On sait <em>ce qui est accessible</em> (la droite de budget). Reste à savoir{" "}
          <em>ce que la personne préfère</em>. « Rationnel » ne veut pas dire « intelligent » : ça
          veut dire des préférences <strong>cohérentes</strong>, qui respectent quelques règles.
        </Lead>

        <H3>Les cinq propriétés des préférences rationnelles</H3>
        <p>
          On note <M tex="c \succsim c'" /> pour « le programme <M tex="c" /> est au moins aussi bon
          que <M tex="c'" /> ». Pour être rationnelles, les préférences doivent être :
        </p>
        <CardGrid>
          <MiniCard title="1 · Complètes">
            On peut comparer <strong>n'importe quelle paire</strong> de programmes. Jamais de « je
            ne sais pas ».
          </MiniCard>
          <MiniCard title="2 · Transitives">
            Si <M tex="a \succsim b" /> et <M tex="b \succsim c" />, alors <M tex="a \succsim c" />.
            Les préférences ne « tournent pas en rond ».
          </MiniCard>
          <MiniCard title="3 · Monotones">
            Plus, c'est mieux : augmenter la consommation d'<strong>une seule période</strong> (sans
            toucher aux autres) augmente la satisfaction.
          </MiniCard>
          <MiniCard title="4 · Continues">
            Deux programmes très proches sont jugés presque aussi désirables. Pas de saut brutal.
          </MiniCard>
        </CardGrid>

        <Callout variant="retiens" title="5 · Stationnaires — la propriété vedette du chapitre">
          <p>
            <strong>Tes préférences sur le futur ne changent pas avec le temps qui passe.</strong>{" "}
            Décaler deux programmes d'une période ne renverse pas ta préférence. Formellement, pour
            toute consommation <M tex="a" /> identique en première période :
          </p>
          <MB tex="(a, c_1, c_2, \dots) \succsim (a, c_1', c_2', \dots) \;\iff\; (c_1, c_2, \dots) \succsim (c_1', c_2', \dots)" />
          <p>
            Conséquence pratique :{" "}
            <strong>sans imprévu, pas besoin de re-décider à chaque période.</strong> Le plan que tu
            trouves optimal aujourd'hui restera optimal demain. Retiens bien cette propriété : c'est{" "}
            <em>exactement</em> elle que les humains réels violeront en Partie B.
          </p>
        </Callout>

        <H3>
          Une 6<sup>e</sup> hypothèse : indépendance du trade-off initial
        </H3>
        <p>
          Ta préférence sur les <strong>deux premières périodes</strong> ne dépend pas de ce qui
          vient <em>après</em>. C'est une hypothèse « forte » : elle interdit que des habitudes
          prises au début (attentes, addictions) modifient tes goûts pour la suite.
        </p>
        <Callout variant="attention" title="Ce que cette hypothèse exclut">
          Elle interdit qu'on ait à la fois <M tex="(1,4,4,\dots) \succ (2,2,4,\dots)" /> <em>et</em>{" "}
          <M tex="(1,4,2,\dots) \prec (2,2,2,\dots)" />. Si la suite (le « … ») peut renverser ta
          préférence sur le début, c'est sans doute parce qu'une habitude s'est installée — ce que
          ce modèle rationnel refuse de modéliser.
        </Callout>

        <H3>Le résultat magique : l'utilité escomptée</H3>
        <p>
          Voici le théorème central (Koopmans 1960). <strong>Si</strong> des préférences respectent
          toutes ces hypothèses de rationalité, <strong>alors</strong> on peut les représenter par
          une formule très simple, dite <em>utilité escomptée</em>. On additionne le plaisir de
          chaque période, mais chaque plaisir futur est <em>rapetissé</em> par le facteur d'escompte{" "}
          <M tex="\delta" />.
        </p>
        <p>Construisons-la terme par terme :</p>
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
            … et ainsi de suite jusqu'à la période <M tex="T" />.
          </li>
        </ul>
        <FormulaBox
          tex="U_0(c) = u(c_0) + \delta\,u(c_1) + \delta^2 u(c_2) + \cdots + \delta^T u(c_T)"
          label="Utilité escomptée"
          caption={
            <>
              avec <M tex="\delta \in [0,1]" /> le facteur d'escompte, et <M tex="u" /> strictement
              croissante (plus de consommation = plus d'utilité).
            </>
          }
        />
        <Callout variant="methode" title="Comment lire une fonction d'utilité">
          « <M tex="c \succsim c'" /> » (je préfère <M tex="c" />) revient exactement à «{" "}
          <M tex="U_0(c) \ge U_0(c')" /> » (<M tex="c" /> me donne un plus gros score).{" "}
          <strong>
            Pour comparer deux programmes, il suffit donc de calculer leur score et de prendre le
            plus grand.
          </strong>{" "}
          C'est ça qu'on fait dans tous les exercices.
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
                    Il emprunte si le score « emprunter » dépasse le score « ne pas emprunter » :
                  </p>
                  <MB tex="3 + 4\delta > 2 + 6\delta \;\iff\; 3-2 > 6\delta - 4\delta \;\iff\; 1 > 2\delta \;\iff\; \delta < \tfrac{1}{2}" />
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
      <Section id="choix" kicker="Partie A · § 4" title="Le choix optimal">
        <Lead>
          On combine enfin les deux pièces : le <em>possible</em> (budget) et le <em>désiré</em>{" "}
          (préférences). L'individu choisit le programme accessible qui lui donne le plus gros
          score. Le résultat : une seule équation qui résume tout, l'
          <strong>équation d'Euler</strong>.
        </Lead>

        <H3>L'intuition d'abord : le lissage de la consommation</H3>
        <p>
          Souviens-toi de la concavité (§ 1) : on déteste les extrêmes. Donc même un individu un peu
          impatient ne va <strong>pas</strong> tout consommer en période 0 et mourir de faim à la
          retraite. Il préfère <strong>lisser</strong> : répartir sa consommation entre les deux
          périodes pour que ni l'une ni l'autre ne soit famélique.
        </p>
        <Callout variant="intuition" title="Deux forces qui s'opposent">
          Le lissage (dû à la concavité) pousse vers <M tex="c_0 = c_1" />. L'impatience (due à{" "}
          <M tex="\delta < 1" />) pousse vers « plus maintenant ». Le choix optimal est le compromis
          exact entre ces deux forces — et c'est ce que l'équation d'Euler va calculer.
        </Callout>
        <p>
          Graphiquement, comme <M tex="u" /> est concave, les <strong>courbes d'indifférence</strong>{" "}
          (les programmes qui donnent le même score) sont <strong>convexes</strong>. L'optimum{" "}
          <M tex="c^*" /> est le point où la courbe d'indifférence la plus haute possible{" "}
          <strong>touche</strong> (est tangente à) la droite de budget. Tu vas le voir bouger dans
          le widget plus bas. <TheoryRef chapter="a1" section="indiff" />
        </p>

        <H3>Le calcul : lagrangien &amp; équation d'Euler</H3>
        <p>
          Le problème s'écrit : « maximiser <M tex="U(c_0, c_1)" /> sous la contrainte de budget ».
          La technique standard pour « maximiser sous contrainte » est le <strong>lagrangien</strong>{" "}
          : on fabrique une fonction qui ajoute l'objectif et la contrainte, reliés par un nombre{" "}
          <M tex="\lambda" /> (« lambda »). <TheoryRef chapter="a1" section="optim" />
        </p>
        <MB tex="\mathcal{L} = U(c_0, c_1) - \lambda\big[(1+r)c_0 + c_1 - (1+r)m_0 - m_1\big]" />
        <Callout variant="methode" title="À quoi sert λ ?">
          Tu n'as pas besoin de maîtriser la théorie du lagrangien pour ce cours, juste la{" "}
          <em>recette</em>. <M tex="\lambda" /> s'interprète comme l'
          <strong>utilité marginale du revenu</strong> : le supplément de satisfaction qu'on
          gagnerait si la dotation future augmentait d'une unité. La recette : on dérive{" "}
          <M tex="\mathcal{L}" /> par rapport à <M tex="c_0" />, à <M tex="c_1" />, et à{" "}
          <M tex="\lambda" />, et on pose chaque dérivée égale à 0.
        </Callout>
        <p>
          Les trois « conditions de premier ordre » donnent : (1){" "}
          <M tex="u'(c_0) = \lambda(1+r)" />, (2) <M tex="\delta\,u'(c_1) = \lambda" />, et (3) la
          contrainte de budget est saturée (on dépense tout). En{" "}
          <strong>divisant l'équation (1) par l'équation (2)</strong>, le <M tex="\lambda" />{" "}
          disparaît et il reste la perle du chapitre :
        </p>
        <FormulaBox
          tex="u'(c_0) = \delta\,(1+r)\,u'(c_1)"
          label="Équation d'Euler"
          caption="La règle d'or de l'épargnant rationnel : elle relie l'utilité marginale d'aujourd'hui à celle de demain."
        />

        <H3>Lire l'équation d'Euler : trois régimes</H3>
        <p>
          Tout se joue sur le produit <M tex="\delta(1+r)" />. Rappel crucial : comme <M tex="u" />{" "}
          est concave, <M tex="u'" /> est <strong>décroissante</strong> — donc{" "}
          <em>plus d'utilité marginale ⇒ moins de consommation</em>, et inversement.
        </p>
        <CardGrid cols={3}>
          <MiniCard title={<>δ(1+r) = 1 → lissage parfait</>} tone="good">
            <M tex="u'(c_0) = u'(c_1)" />, donc{" "}
            <strong>
              <M tex="c_0 = c_1" />
            </strong>
            . Ex. : <M tex="r=0" /> et <M tex="\delta=1" />. Les deux forces s'équilibrent.
          </MiniCard>
          <MiniCard title={<>δ(1+r) {"<"} 1 → impatience</>} tone="bad">
            On consomme <strong>plus maintenant</strong> : <M tex="c_0 > c_1" />. Ex. :{" "}
            <M tex="r=0" /> et <M tex="\delta<1" />. L'envie de présent l'emporte.
          </MiniCard>
          <MiniCard title={<>δ(1+r) {">"} 1 → patience</>}>
            On consomme <strong>plus plus tard</strong> : <M tex="c_0 < c_1" />. Ex. :{" "}
            <M tex="\delta=1" /> et <M tex="r>0" />. Un taux élevé récompense l'attente.
          </MiniCard>
        </CardGrid>

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
                  Le taux pousse effectivement vers le futur… mais l'impatience pousse vers le
                  présent avec la même force : <M tex="0{,}8 \times 1{,}25 = 1" />, les deux forces
                  s'annulent exactement.
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
              Le réflexe d'examen : calcule <strong>d'abord</strong> <M tex="\delta(1+r)" /> et
              compare-le à 1. Trois régimes, trois conclusions.
            </>
          }
        />

        <H3>Et donc : comment inciter à épargner (réponse rationnelle)</H3>
        <p>
          On revient à la question du § 0. Pour faire épargner davantage, le gouvernement veut
          pousser <M tex="c_0" /> vers le bas et <M tex="c_1" /> vers le haut. Quels leviers ?
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>
              <M tex="\delta" /> ? Impossible.
            </strong>{" "}
            C'est un paramètre de psychologie, l'État ne peut pas le changer.
          </li>
          <li>
            <strong>
              <M tex="r" /> ? Oui !
            </strong>{" "}
            On écrit le taux ressenti par l'épargnant comme <M tex="r = r^*(1+s)" />, où{" "}
            <M tex="r^*" /> est le taux du marché et <M tex="s" /> est un <strong>subside</strong>{" "}
            (ou une taxe si <M tex="s<0" />) sur les revenus de l'épargne.
          </li>
        </ul>
        <Callout variant="retiens" title="La réponse de la Partie A">
          Pour inciter à épargner, <strong>augmenter <M tex="s" /></strong> (subventionner
          l'épargne) augmente <M tex="r" />, ce qui fait pivoter la droite de budget (pente plus
          raide) et — sous certaines conditions — fait baisser <M tex="c_0^*" /> et monter{" "}
          <M tex="c_1^*" />. <em>Exemple réel :</em> en Belgique, les travailleurs reçoivent un
          subside d'environ <strong>30 %</strong> sur les 1000 premiers euros épargnés chaque année
          pour leur retraite.
        </Callout>
        <Callout variant="attention" title="Garde ça en tête pour la suite">
          Tout ce qui précède suppose des gens{" "}
          <strong>parfaitement rationnels et stationnaires</strong>. Mais dans la vraie vie ? On se
          dit « j'épargnerai plus <em>demain</em> »… et demain, on craque. La Partie B s'attaque à
          ce décalage entre le plan et l'action.
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 5 · SELF-CONTRÔLE                                          */}
      {/* ============================================================ */}
      <Section id="selfcontrole" kicker="Partie B · § 5" title="Les problèmes de self-contrôle">
        <Lead>
          Le modèle rationnel est élégant, mais il prédit mal le comportement réel. On va le mettre
          en défaut avec une expérience toute simple — à laquelle tu vas participer.
        </Lead>

        <H3>Une expérience de pensée : à toi de jouer</H3>
        <p>
          Réponds <em>honnêtement</em> aux deux questions avant de révéler les vrais résultats. Ne
          réfléchis pas trop : choisis par instinct.
        </p>

        <PollCard
          tag="Version A · tout de suite"
          question={<>Tu préfères…</>}
          options={[
            { key: "A1", label: <>recevoir 100 € <strong>maintenant</strong></>, pct: 18 },
            {
              key: "A2",
              label: <>recevoir 110 € <strong>dans une semaine</strong></>,
              pct: 82,
              alt: true,
            },
          ]}
          note={
            <>
              Chez les étudiants : <strong>18 %</strong> choisissent A1 (l'argent tout de suite).
              L'attrait du « maintenant » fait craquer presque un sur cinq, alors qu'attendre 7
              jours rapporte 10 % de plus.
            </>
          }
        />

        <PollCard
          tag="Version B · dans un an"
          question={<>Et maintenant, tu préfères…</>}
          options={[
            { key: "B1", label: <>recevoir 100 € <strong>dans un an</strong></>, pct: 3 },
            {
              key: "B2",
              label: <>recevoir 110 € <strong>dans un an et une semaine</strong></>,
              pct: 97,
              alt: true,
            },
          ]}
          note={
            <>
              Cette fois, seulement <strong>3 %</strong> choisissent B1 ! C'est{" "}
              <em>exactement la même attente d'une semaine</em> pour les mêmes 10 % de bonus… mais
              comme tout est repoussé loin dans le futur, presque tout le monde sait patienter.
            </>
          }
        />

        <Callout variant="attention" title="L'incohérence : A1 + B2 viole la stationnarité">
          Beaucoup de gens choisissent <strong>A1</strong> (impatient à court terme) <em>et</em>{" "}
          <strong>B2</strong> (patient à long terme). Or les deux situations sont <em>identiques</em>{" "}
          à un décalage d'un an près ! Préférer la récompense proche dans un cas et la lointaine
          dans l'autre, c'est{" "}
          <strong>renverser sa préférence selon la distance dans le temps</strong> — exactement ce
          que la stationnarité interdit (§ 3).
        </Callout>

        <p>
          Le tableau ci-dessous le rend limpide. Les options ne diffèrent que par <em>quand</em>{" "}
          tombe la récompense :
        </p>
        <Tbl minW={480}>
          <thead>
            <tr>
              <th className={TH}></th>
              <th className={TH}>
                <M tex="t=0" />
              </th>
              <th className={TH}>
                <M tex="t=1" />
              </th>
              <th className={TH}>
                <M tex="t=2" />
              </th>
              <th className={TH}>
                <M tex="t=3" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={`${TD} font-bold`}>A1</td>
              <td className={TD}>
                <M tex="c+100" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-bold`}>A2</td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c+110" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-bold`}>B1</td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c+100" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
            </tr>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={`${TD} font-bold`}>B2</td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c+110" />
              </td>
            </tr>
          </tbody>
        </Tbl>
        <p>
          Ce renversement est <strong>documenté</strong> chez les humains (Green et al. 1994){" "}
          <em>et</em> chez les pigeons (Ainslie et al. 1981). Ce n'est donc pas un caprice : c'est
          un trait profond du vivant.
        </p>
        <Callout variant="definition" title="Problème de self-contrôle">
          Un individu a un problème de self-contrôle si,{" "}
          <strong>au moment de passer à l'action</strong>, il a du mal à mettre en œuvre le plan de
          consommation qu'il avait jugé optimal à l'avance. « Je m'y mets <em>demain</em> » — et
          demain ne vient jamais.
        </Callout>

        <H3>Le modèle (β, δ) de O'Donoghue &amp; Rabin</H3>
        <p>
          Comment capturer cette impatience « de court terme » en gardant la simplicité ? On ajoute{" "}
          <strong>un seul nouveau paramètre</strong>, <M tex="\beta" /> (« bêta »), qui rabote{" "}
          <em>tout le futur d'un coup</em>, en plus de l'escompte habituel.
        </p>
        <FormulaBox
          tex="U_0^{\beta}(c) = u(c_0) + \beta\delta\,u(c_1) + \beta\delta^2 u(c_2) + \cdots"
          label="Utilité (β, δ)"
          caption={
            <>
              <M tex="\beta \in [0,1]" /> capture le biais de self-contrôle. Le présent (
              <M tex="c_0" />) n'a <strong>pas</strong> de <M tex="\beta" /> ; tout le reste, oui.
            </>
          }
        />
        <CardGrid>
          <MiniCard title={<>Le rôle de β</>}>
            Plus <M tex="\beta" /> est <strong>petit</strong>, plus le biais est <strong>fort</strong>{" "}
            : l'individu sur-valorise brutalement le présent par rapport à <em>tout</em> le futur.
          </MiniCard>
          <MiniCard title={<>Cas spécial β = 1</>} tone="gold">
            Le <M tex="\beta" /> disparaît et on{" "}
            <strong>retombe pile sur le modèle rationnel</strong> de la Partie A. Le modèle (β, δ){" "}
            <em>contient</em> donc le modèle rationnel.
          </MiniCard>
        </CardGrid>
        <Callout variant="intuition" title="Pourquoi ça résout le paradoxe A1/B2">
          <p>
            Préférer A1 demande : <M tex="u(c+100) - u(c) > \beta\delta\,[u(c+110) - u(c)]" /> (le
            bonus futur est raboté par <M tex="\beta" />).
          </p>
          <p>
            Préférer B2 demande : <M tex="u(c+100) - u(c) < \delta\,[u(c+110) - u(c)]" /> (ici les
            deux récompenses sont <em>futures</em>, le <M tex="\beta" /> se simplifie).
          </p>
          <p>
            Ces deux conditions cohabitent <strong>dès que <M tex="\beta < 1" /></strong> ; elles se
            contredisent si <M tex="\beta = 1" />. Le biais <M tex="\beta" /> explique donc
            proprement le renversement.
          </p>
        </Callout>

        <Quiz
          scope="a2"
          id="q4"
          question={<>Dans le modèle (β, δ), que se passe-t-il quand <M tex="\beta = 1" /> ?</>}
          options={[
            {
              text: <>L'individu devient parfaitement impatient : seul le présent compte.</>,
              explain: (
                <>
                  C'est l'inverse : l'impatience extrême correspond à <M tex="\beta" /> proche de{" "}
                  <strong>0</strong> (le futur ne pèse presque plus rien).
                </>
              ),
            },
            {
              text: (
                <>
                  On retombe exactement sur le modèle rationnel d'utilité escomptée de la Partie A.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : avec <M tex="\beta = 1" />, la formule redevient{" "}
                  <M tex="u(c_0) + \delta u(c_1) + \delta^2 u(c_2) + \cdots" /> — l'utilité
                  escomptée classique. Le modèle (β, δ) <em>généralise</em> le modèle rationnel, il
                  ne le remplace pas.
                </>
              ),
            },
            {
              text: <>L'individu ne consomme plus rien en période 0.</>,
              explain: <>Rien de tel : β ne pèse que sur les périodes futures, jamais sur la période 0.</>,
            },
            {
              text: (
                <>
                  Le facteur <M tex="\delta" /> disparaît de la formule.
                </>
              ),
              explain: (
                <>
                  Non : <M tex="\delta" /> reste, c'est lui qui continue de décoter chaque période
                  future. Seul le rabot <em>supplémentaire</em> β devient neutre.
                </>
              ),
            },
          ]}
        />

        <H3>Deux types de biens : tentation vs investissement</H3>
        <p>
          Imaginons un bien dont l'effet s'étale sur deux périodes : un bénéfice (ou coût) d'utilité{" "}
          <M tex="b_1" /> à la période 1, et <M tex="b_2" /> à la période 2. On compare ce que
          l'individu <em>veut à l'avance</em> et ce qu'il <em>fait sur le moment</em> :
        </p>
        <CardGrid>
          <MiniCard title={<>Ex-ante (t = 0) : il veut le faire si…</>}>
            <MB tex="b_1 + \delta b_2 > 0" className="my-1 text-center" />
          </MiniCard>
          <MiniCard title={<>Sur le moment (t = 1) : il le fait si…</>}>
            <MB tex="b_1 + \beta\delta b_2 > 0" className="my-1 text-center" />
          </MiniCard>
        </CardGrid>
        <p>
          La <em>seule</em> différence : le <M tex="\beta" /> qui rabote le bénéfice futur{" "}
          <M tex="b_2" /> au moment d'agir. Cela crée deux pièges symétriques :
        </p>
        <CardGrid>
          <MiniCard title="Bien d'investissement" tone="good">
            <M tex="b_1 < 0" />, <M tex="b_2 > 0" /> (effort maintenant, bénéfice plus tard) :
            jogging, épargne. <strong>Sous-consommé</strong> : on le repousse sans cesse.
          </MiniCard>
          <MiniCard title="Bien de tentation" tone="bad">
            <M tex="b_1 > 0" />, <M tex="b_2 < 0" /> (plaisir maintenant, regret plus tard) : chips,
            alcool. <strong>Sur-consommé</strong> : on craque trop souvent.
          </MiniCard>
        </CardGrid>

        <GoodClassifier />

        <H3>Naïf ou sophistiqué ? La conscience du biais</H3>
        <p>
          Question décisive : l'individu <em>sait-il</em> qu'il a un biais ? On note{" "}
          <M tex="\hat{\beta}" /> l'estimation qu'il fait de son propre biais <M tex="\beta" />.
        </p>
        <CardGrid cols={3}>
          <MiniCard title={<>Naïf : <M tex="\hat{\beta} = 1" /></>} tone="bad">
            Il <strong>ignore</strong> totalement son biais. Il croit que son « moi de demain » sera
            parfaitement rationnel. Il ne se méfie pas de lui-même.
          </MiniCard>
          <MiniCard title={<>Sophistiqué : <M tex="\hat{\beta} = \beta" /></>} tone="good">
            Il <strong>anticipe parfaitement</strong> son biais. Il sait que son « moi de demain »
            va craquer, et il peut agir en conséquence.
          </MiniCard>
          <MiniCard title={<>Entre les deux : <M tex="\hat{\beta} \in (\beta, 1)" /></>}>
            Partiellement conscient. Il sous-estime son biais sans l'ignorer complètement.
          </MiniCard>
        </CardGrid>
        <Callout variant="intuition" title="L'image des « deux moi »">
          Pense à un individu en <M tex="t=0" /> qui essaie de deviner ce que fera un <em>second</em>{" "}
          individu en <M tex="t=1" />. Le premier estime que le second a un biais{" "}
          <M tex="\hat{\beta}" />, alors qu'en vrai le second a un biais <M tex="\beta" />. Astuce
          du modèle : <strong>les deux « individus » sont en fait la même personne</strong>, à deux
          moments. Le naïf se fait des illusions sur son moi futur ; le sophistiqué le connaît trop
          bien.
        </Callout>
        <p>
          Conséquence : quand il n'est pas parfaitement sophistiqué (<M tex="\hat{\beta} > \beta" />
          ), l'individu <strong>surestime</strong> sa future consommation de biens d'investissement
          (« promis, je cours demain ») et <strong>sous-estime</strong> sa future consommation de
          tentations (« je ne mangerai qu'une chips »).
        </p>

        <ExerciseBlock
          scope="a2"
          id="ex2"
          number={2}
          title="Vais-je vraiment aller courir ?"
          difficulty={2}
          refs={[{ chapter: "a2", section: "selfcontrole", label: "Modèle (β, δ)" }]}
          statement={
            <>
              Soit un individu avec <M tex="\delta = \tfrac{1}{2}" /> et un biais{" "}
              <M tex="\beta = \tfrac{1}{2}" />. En <M tex="t=0" /> il envisage d'aller courir en{" "}
              <M tex="t=1" />. Courir lui donne une <strong>dis</strong>utilité{" "}
              <M tex="b_1 = -3" /> en <M tex="t=1" /> (l'effort) et une utilité <M tex="b_2 = 8" />{" "}
              en <M tex="t=2" /> (la forme physique). <strong>(a)</strong> En <M tex="t=0" />,{" "}
              <em>souhaite</em>-t-il aller courir ? <strong>(b)</strong> S'il est naïf (
              <M tex="\hat{\beta} = 1" />
              ), <em>pense</em>-t-il qu'il ira ? <strong>(c)</strong> S'il est sophistiqué (
              <M tex="\hat{\beta} = \beta" />) ?
            </>
          }
          steps={[
            {
              title: "(a) Ce qu'il souhaite en t = 0 — critère ex-ante",
              content: (
                <>
                  <p>
                    Il <em>veut</em> courir si <M tex="b_1 + \delta b_2 > 0" />.
                  </p>
                  <p>
                    Calcul : <M tex="-3 + \tfrac{1}{2} \times 8 = -3 + 4 = +1 > 0" />. ✓{" "}
                    <strong>Oui, il souhaite aller courir.</strong> Vu de loin, l'effort en vaut la
                    peine.
                  </p>
                </>
              ),
            },
            {
              title: "(b) Ce que le NAÏF croit — il évalue avec β̂ = 1",
              content: (
                <>
                  <p>
                    Le naïf pense que son moi de demain agira selon{" "}
                    <M tex="b_1 + \hat{\beta}\delta b_2" /> avec <M tex="\hat{\beta} = 1" /> :
                  </p>
                  <p>
                    <M tex="-3 + 1 \times \tfrac{1}{2} \times 8 = -3 + 4 = +1 > 0" />. ✓{" "}
                    <strong>Il croit qu'il ira courir.</strong> Il se fait confiance… à tort.
                  </p>
                </>
              ),
            },
            {
              title: "(c) Ce que fera RÉELLEMENT son moi de t = 1 — vrai β = ½",
              content: (
                <>
                  <p>
                    Sur le moment, en <M tex="t=1" />, l'effort est « maintenant » et le bénéfice
                    est « futur » (donc raboté par <M tex="\beta" />) : il court si{" "}
                    <M tex="b_1 + \beta\delta b_2 > 0" /> :
                  </p>
                  <p>
                    <M tex="-3 + \tfrac{1}{2} \times \tfrac{1}{2} \times 8 = -3 + 2 = -1 < 0" />. ✗{" "}
                    <strong>En réalité, il ne courra PAS.</strong> Le sophistiqué, lui, anticipe
                    correctement ce flop.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <>
              Il <strong>souhaite</strong> courir (a), il{" "}
              <strong>pense qu'il le fera s'il est naïf</strong> (b), mais il{" "}
              <strong>se rend compte qu'il ne le fera pas s'il est sophistiqué</strong> (c). Tout le
              drame du self-contrôle est là : le bon plan existe (a), mais le moi du présent le
              sabote (c) — et seul le sophistiqué le voit venir.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 6 · COMMITMENT DEVICES                                     */}
      {/* ============================================================ */}
      <Section
        id="commit"
        kicker="Partie B · § 6"
        title="Se lier les mains : les « commitment devices »"
      >
        <Lead>
          Si je sais que mon « moi de demain » va craquer, je peux agir <em>aujourd'hui</em> pour
          l'en empêcher. C'est toute la ruse du sophistiqué : il se piège lui-même, volontairement,
          pour son propre bien.
        </Lead>

        <Callout variant="intuition" title="L'image d'Ulysse et les sirènes">
          Ulysse veut entendre le chant des sirènes sans s'y jeter. Il sait que, le moment venu, il
          sera incapable de résister. Sa solution : <strong>se faire attacher au mât</strong> à
          l'avance et ordonner à l'équipage de ne pas le détacher, quoi qu'il crie. Il{" "}
          <em>réduit volontairement ses propres options futures</em>. Un commitment device, c'est
          exactement ça : un mât qu'on se choisit soi-même.
        </Callout>

        <H3>Deux familles d'outils</H3>
        <p>
          Selon qu'on lutte contre une tentation ou qu'on s'oblige à un effort, la stratégie change
          de forme :
        </p>
        <CardGrid>
          <MiniCard title="Contre une tentation" tone="bad">
            La rendre <strong>indisponible</strong>. Ne pas acheter de cigarettes du tout ; ranger
            les chips tout en haut de l'armoire ; supprimer l'appli. Si la tentation n'est pas à
            portée, le « moi de demain » ne peut pas craquer.
          </MiniCard>
          <MiniCard title="Pour un investissement" tone="good">
            Signer en <M tex="t=0" /> un <strong>contrat qui contraint ou incite</strong> le moi
            futur. Acheter une maison à crédit (te <em>forçant</em> à épargner chaque mois), prendre
            un abonnement à la salle, annoncer publiquement qu'on va courir.
          </MiniCard>
        </CardGrid>
        <Callout variant="retiens" title="Le paradoxe à retenir">
          Réduire ses propres options paraît irrationnel — un individu parfaitement rationnel n'en
          voudrait jamais. Mais pour quelqu'un qui se connaît un biais (<M tex="\beta < 1" />{" "}
          <strong>et</strong> sophistiqué), <strong>se limiter peut augmenter son bien-être</strong>.
          Renoncer à de la liberté demain, c'est se protéger de soi-même.
        </Callout>

        <H3>L'application la plus célèbre : actifs illiquides + emprunts</H3>
        <p>
          On va maintenant prouver, chiffres à l'appui, un comportement qui semble totalement
          stupide : un individu qui <strong>bloque son argent dans un placement</strong> qu'il ne
          peut pas toucher, et qui <strong>emprunte en même temps</strong> à un taux élevé. Pourquoi
          diable faire les deux ? Le modèle (β, δ) va l'expliquer.
        </p>
        <p>
          Le décor : trois périodes, <M tex="\beta = 0{,}5" />, <M tex="\delta = 1" />, utilité{" "}
          <M tex="u(c) = \ln(c)" />, individu <strong>sophistiqué</strong> (
          <M tex="\hat{\beta} = \beta" />), revenu <M tex="m = 9" /> reçu en <M tex="t=0" />. Voici
          ce qui peut se passer à chaque période :
        </p>
        <Tbl minW={560}>
          <thead>
            <tr>
              <th className={TH}></th>
              <th className={TH}>t = 0 (jeune)</th>
              <th className={TH}>t = 1 (milieu)</th>
              <th className={TH}>t = 2 (vieux)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${TD} font-semibold`}>Argent qui arrive</td>
              <td className={TD}>
                revenu <M tex="m" />
              </td>
              <td className={TD}>
                emprunt <M tex="e" />
              </td>
              <td className={TD}>
                actifs libérés <M tex="a(1-p)" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Argent qui part</td>
              <td className={TD}>
                achat d'actifs <M tex="a" />
              </td>
              <td className={TD}>—</td>
              <td className={TD}>
                remboursement <M tex="e(1+r)" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Tu consommes</td>
              <td className={TD}>—</td>
              <td className={TD}>
                <M tex="c_1" />
              </td>
              <td className={TD}>
                <M tex="c_2" />
              </td>
            </tr>
          </tbody>
        </Tbl>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>
              <M tex="a" />
            </strong>{" "}
            = montant placé dans un actif <strong>illiquide</strong> (impossible à revendre avant{" "}
            <M tex="t=2" />). <M tex="p" /> est sa <strong>dépréciation</strong> : en{" "}
            <M tex="t=2" /> on ne récupère que <M tex="a(1-p)" />.
          </li>
          <li>
            <strong>
              <M tex="e" />
            </strong>{" "}
            = montant <strong>emprunté</strong> en <M tex="t=1" /> (au taux <M tex="r" />), à
            rembourser <M tex="e(1+r)" /> en <M tex="t=2" />.
          </li>
        </ul>
        <FormulaBox
          tex="c_1 + c_2 \;\le\; m - e\,r - a\,p"
          label="Contrainte globale"
          caption={
            <>
              Ce que tu peux consommer en tout = ton revenu, moins le coût de l'emprunt (
              <M tex="e\,r" />
              ), moins ce que la dépréciation t'a coûté (<M tex="a\,p" />). En <M tex="t=1" />, une
              seconde contrainte limite <M tex="c_1 \le (m-a) + e" /> : tu n'as sous la main que ce
              qui n'est pas bloqué, plus ton emprunt.
            </>
          }
        />

        <p>
          On compare cinq programmes. Clique sur chacun pour dérouler le calcul et son
          interprétation. La grandeur à surveiller est{" "}
          <strong>
            <M tex="U_0" />
          </strong>{" "}
          (l'utilité <em>vue de</em> <M tex="t=0" />) : plus elle est haute, mieux c'est.
        </p>

        <CommitCase tag="Référence" tone="gold" title="Le plan idéal calculé en t = 0">
          <p>
            Vue de <M tex="t=0" />, acheter des actifs ou emprunter ne rapporte rien et coûte : le
            plan idéal n'en utilise pas (<M tex="a^* = 0" />, <M tex="e^* = 0" />). Les conditions
            de premier ordre donnent <M tex="c_1 = c_2" /> (lissage parfait, car{" "}
            <M tex="\delta = 1" />
            ).
          </p>
          <MB tex="c_1^* = c_2^* = 4{,}5 \qquad U_0 = 3{,}008\,\beta" />
          <p>
            C'est l'objectif à atteindre. <strong>Problème :</strong> ce n'est qu'un plan sur le
            papier. Rien ne garantit que le moi de <M tex="t=1" /> le respectera.
          </p>
        </CommitCase>

        <CommitCase tag="Le naïf" tone="bad" title="Ce qui se passe vraiment si a = 0">
          <p>
            Sans rien bloquer (<M tex="a = 0" />), le moi de <M tex="t=1" /> a tout l'argent en
            main. Son biais le pousse à se faire plaisir tout de suite : la condition de premier
            ordre devient <M tex="\beta c_1 = c_2" /> (il sur-pondère le présent).
          </p>
          <MB tex="c_1^* = 6, \quad c_2^* = 3 \qquad U_0 = 2{,}89\,\beta" />
          <p>
            2,89 est plus petit que 3,008 : il a <strong>gâché</strong> de l'utilité. C'est
            exactement le sort du <strong>naïf</strong> (<M tex="\hat{\beta} = 1" />
            ), qui ne se méfiait pas de lui-même. La question devient : le sophistiqué peut-il faire
            mieux ?
          </p>
        </CommitCase>

        <CommitCase tag="Cas 1" tone="good" title="p = 0, r = ∞ — l'outil parfait">
          <p>
            Actifs gratuits (<M tex="p = 0" />) et emprunt impossible (<M tex="r = \infty" />
            ). Le sophistiqué <strong>bloque <M tex="a = 4{,}5" /></strong>. En <M tex="t=1" /> il
            ne lui reste que <M tex="m - a = 4{,}5" /> et il ne peut pas emprunter : il est{" "}
            <em>forcé</em> de ne consommer que 4,5. En <M tex="t=2" />, l'actif se libère intact :{" "}
            <M tex="c_2 = 4{,}5" />.
          </p>
          <MB tex="a^* = 4{,}5, \quad c_1^* = c_2^* = 4{,}5 \qquad U_0 = 3{,}008\,\beta" />
          <p>
            Il <strong>retrouve exactement le plan idéal</strong> ! En se mettant de côté pile le
            montant voulu pour <M tex="t=2" />, il s'est interdit de tout dépenser en{" "}
            <M tex="t=1" />. Le mât d'Ulysse, version épargne.
          </p>
        </CommitCase>

        <CommitCase tag="Cas 2" title="p = 0,05, r = ∞ — l'outil coûteux mais utile">
          <p>
            Cette fois l'actif <strong>se déprécie</strong> (<M tex="p = 0{,}05" />
            ). Il bloque quand même <M tex="a = 4{,}5" /> : <M tex="c_1 = 4{,}5" />, mais en{" "}
            <M tex="t=2" /> il ne récupère que <M tex="a(1-p) = 4{,}275" />.
          </p>
          <MB tex="c_1 = 4{,}5, \quad c_2 = 4{,}275 \qquad U_0 = 2{,}96\,\beta" />
          <p>
            Il ne retrouve pas le plan idéal (l'outil a un prix). Mais 2,96 dépasse 2,89 :{" "}
            <strong>
              même en perdant un peu d'argent, le commitment device le rend plus heureux
            </strong>{" "}
            que de ne rien faire. La protection contre soi-même valait son coût.
          </p>
        </CommitCase>

        <CommitCase tag="Cas 3" title="p = 0, r = 0,5 — pourquoi il finit par emprunter">
          <p>
            Actif gratuit, mais cette fois <strong>l'emprunt redevient possible</strong> (
            <M tex="r = 0{,}5" />
            ). Il bloque <M tex="a = 4{,}5" />. En <M tex="t=1" /> il n'a plus que{" "}
            <M tex="m - a = 4{,}5" /> sous la main… mais son biais le pousse à vouloir{" "}
            <M tex="c_1 > c_2" />. Que fait-il ? Il <strong>emprunte</strong> pour gonfler son
            présent. La condition devient <M tex="\beta(1+r)c_1 = c_2" />, soit{" "}
            <M tex="0{,}75\,c_1 = c_2" />.
          </p>
          <MB tex="a = 4{,}5, \quad c_1 = 5, \quad c_2 = 3{,}75, \quad e = 0{,}5 \qquad U_0 = 2{,}93\,\beta" />
          <p>
            Voilà le comportement « absurde » : il a de l'argent bloqué <strong>et</strong> il
            emprunte à 50 % ! Pourtant 2,93 dépasse 2,89 : c'est{" "}
            <strong>toujours mieux que le naïf</strong>. Et plus le taux <M tex="r" /> est élevé,
            moins il emprunte — donc plus l'actif illiquide joue bien son rôle de garde-fou.
          </p>
        </CommitCase>

        <U0Chart />

        <Callout variant="exemple" title="La leçon de Laibson (2009)">
          On observe aux USA que les ménages détiennent énormément d'actifs illiquides (≈ 216 % du
          revenu annuel vers 50 ans) <strong>tout en</strong> empruntant lourdement sur leur carte
          de crédit (≈ 12 %) à des taux élevés. Le modèle rationnel n'y comprend rien. Le modèle
          (β, δ), si : l'individu sophistiqué{" "}
          <strong>bloque son argent pour se protéger de son biais</strong> ; et une fois l'argent
          bloqué, ce <em>même</em> biais le pousse à emprunter pour le présent. Faire les deux à la
          fois lui donne, au total, plus d'utilité que de ne rien bloquer.
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 7 · POLITIQUES PUBLIQUES                                   */}
      {/* ============================================================ */}
      <Section
        id="politiques"
        kicker="Partie B · § 7"
        title="Les politiques publiques : les « nudges »"
      >
        <Lead>
          On revient à la question de départ : comment pousser les gens à épargner ? L'État pourrait{" "}
          <em>obliger</em>. Mais il existe des outils bien plus subtils, qui exploitent nos biais au
          lieu de les combattre de front — sans jamais forcer personne.
        </Lead>

        <H3>Levier n°1 — Changer l'option par défaut</H3>
        <p>
          Aux USA, à l'embauche, un employé doit choisir un plan d'épargne retraite. Tout est dans
          la <strong>case déjà cochée</strong> :
        </p>
        <CardGrid>
          <MiniCard title="Avant" tone="bad">
            Par défaut : <strong>on n'épargne pas</strong>. Il faut faire une démarche active pour
            s'inscrire. Résultat : <strong>50 %</strong> des employés épargnent.
          </MiniCard>
          <MiniCard title="Après" tone="good">
            Par défaut : <strong>on épargne 3 %</strong>. Il faut une démarche active pour se
            désinscrire. Résultat : <strong>86 %</strong> épargnent (Madrian &amp; Shea, 2001).
          </MiniCard>
        </CardGrid>
        <p>
          Le montant épargné par défaut, le degré d'effort, la liberté de partir :{" "}
          <strong>rien n'a changé sauf la case cochée d'avance</strong>. On peut toujours en sortir
          par un simple coup de fil. Et pourtant l'épargne bondit de 36 points.
        </p>
        <Callout variant="retiens" title="Le jiu-jitsu d'O'Donoghue & Rabin (2001)">
          Pourquoi ça marche ? À cause de notre <strong>procrastination</strong> — un biais de
          self-contrôle ! On remet à plus tard la démarche de changer de plan… et on reste donc sur
          le défaut. La politique{" "}
          <strong>
            utilise un biais (la flemme de changer) pour en résoudre un autre (le manque d'épargne)
          </strong>
          . On retourne le défaut contre lui-même.
        </Callout>

        <H3>Levier n°2 — « Save More Tomorrow » (SMarT plan)</H3>
        <p>
          Deux obstacles psychologiques empêchent les gens d'épargner plus : (1) ils détestent{" "}
          <strong>refaire leurs calculs</strong> à chaque changement de salaire ; (2) ils détestent
          voir leur <strong>paie nette baisser</strong> (aversion à la perte). Le plan de Thaler
          &amp; Benartzi contourne les deux d'un coup :
        </p>
        <Callout variant="intuition" title="L'idée géniale">
          On s'engage <strong>à l'avance</strong> à augmenter son taux d'épargne{" "}
          <strong>uniquement quand on reçoit une augmentation</strong> de salaire. Comme l'épargne
          supplémentaire est prélevée sur de l'argent qu'on n'a jamais touché,{" "}
          <strong>la paie nette ne baisse jamais</strong> — elle augmente juste un peu moins. Et
          c'est automatique : zéro recalcul. Résultat : taux d'épargne passé de{" "}
          <strong>3,5 % à 13,6 %</strong> en à peine 4 ans (Thaler &amp; Benartzi, 2004).
        </Callout>

        <H3>Le nom de cette philosophie : le paternalisme libertaire</H3>
        <p>
          Ces deux politiques sont des <strong>« nudges »</strong> (coups de pouce). Leur logique
          tient en deux mots qui semblent contradictoires :
        </p>
        <CardGrid>
          <MiniCard title="Paternaliste…">
            parce qu'elles partent du principe que <strong>les gens font des erreurs</strong> (ils
            sous-épargnent à cause de leur biais) et cherchent à les aider malgré eux.
          </MiniCard>
          <MiniCard title="…mais libertaire" tone="good">
            parce qu'elles <strong>ne contraignent personne</strong>. On peut toujours refuser. Un
            individu parfaitement rationnel n'est donc <em>pas affecté</em> : il choisit ce qu'il
            voulait de toute façon.
          </MiniCard>
        </CardGrid>
        <Callout variant="retiens" title="La beauté de la chose">
          Un nudge bien conçu{" "}
          <strong>aide ceux qui ont un biais sans rien coûter à ceux qui n'en ont pas</strong>.
          C'est ce qui le rend politiquement séduisant : il améliore le sort des uns sans piétiner
          la liberté des autres.
        </Callout>

        <Quiz
          scope="a2"
          id="q5"
          question={
            <>
              Pourquoi le simple changement d'option par défaut (épargne automatique à 3 %)
              fait-il bondir le taux d'épargne de 50 % à 86 %, alors que se désinscrire ne coûte
              qu'un coup de fil ?
            </>
          }
          options={[
            {
              text: <>Parce que se désinscrire est financièrement pénalisé.</>,
              explain: (
                <>
                  Non : la liberté de sortir est totale et gratuite. C'est justement ce qui rend le
                  résultat si frappant — <em>rien</em> n'a changé sauf la case cochée d'avance.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'on <strong>procrastine</strong> la démarche de changement : un biais de
                  self-contrôle est utilisé pour en corriger un autre.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement le « jiu-jitsu » d'O'Donoghue &amp; Rabin : la flemme de changer (un
                  biais) nous maintient sur le défaut — et si le défaut est le bon comportement, ce
                  biais travaille <em>pour</em> nous.
                </>
              ),
            },
            {
              text: <>Parce que la loi rend l'épargne obligatoire à partir de ce moment-là.</>,
              explain: (
                <>
                  Non : un nudge ne contraint jamais. C'est toute la différence avec une obligation
                  légale — et c'est pour ça qu'on parle de paternalisme <em>libertaire</em>.
                </>
              ),
            },
            {
              text: <>Parce que le rendement de l'épargne a été augmenté en parallèle.</>,
              explain: (
                <>
                  Non : ce serait le levier « rationnel » de la Partie A (le subside <M tex="s" />
                  ). Ici, aucun paramètre économique ne change — seulement la présentation du choix.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* ★ · À MAÎTRISER                                              */}
      {/* ============================================================ */}
      <Section id="maitrise" kicker="★ · Récapitulatif" title="À maîtriser absolument">
        <Lead>
          Si tu sais réexpliquer chacun de ces points avec tes propres mots, tu as le chapitre.
          Clique pour cocher au fur et à mesure — c'est ta checklist de révision.
        </Lead>

        <MasteryChecklist
          items={[
            {
              title: "1 · Le modèle à deux périodes",
              body: (
                <>
                  Vie active (<M tex="t=0" />) et retraite (<M tex="t=1" />
                  ). La <strong>dotation</strong> <M tex="\omega = (m_0, m_1)" /> = ce que tu
                  consommerais sans bouger ton argent.
                </>
              ),
            },
            {
              title: "2 · Valeur présente et valeur future",
              body: (
                <>
                  <M tex="c_0^{\max} = m_0 + m_1/(1+r)" /> et{" "}
                  <M tex="c_1^{\max} = (1+r)m_0 + m_1" />. Deux façons de mesurer la même richesse.
                </>
              ),
            },
            {
              title: "3 · Le coût d'opportunité",
              body: (
                <>
                  Renoncer à 1 € aujourd'hui « rapporte » <M tex="(1+r)" /> € demain. C'est le prix
                  du temps.
                </>
              ),
            },
            {
              title: "4 · La contrainte de budget",
              body: (
                <>
                  Une droite de pente{" "}
                  <strong>
                    <M tex="-(1+r)" />
                  </strong>{" "}
                  qui <strong>pivote autour de <M tex="\omega" /></strong>. Sous la droite =
                  accessible.
                </>
              ),
            },
            {
              title: "5 · Les 5 hypothèses de rationalité",
              body: (
                <>
                  Préférences{" "}
                  <strong>complètes, transitives, monotones, continues, stationnaires</strong>.
                </>
              ),
            },
            {
              title: "6 · La stationnarité (la clé)",
              body: (
                <>
                  Mes préférences sur le futur <strong>ne changent pas</strong> quand le temps
                  passe. Sans choc, pas besoin de réoptimiser. C'est l'hypothèse que l'humain réel
                  viole.
                </>
              ),
            },
            {
              title: "7 · L'indépendance du trade-off initial",
              body: (
                <>
                  Le choix sur les deux premières périodes ne dépend pas de la suite : ni habitude,
                  ni addiction.
                </>
              ),
            },
            {
              title: "8 · L'utilité escomptée",
              body: (
                <>
                  <M tex="U_0 = u(c_0) + \delta u(c_1) + \delta^2 u(c_2) + \cdots" /> avec{" "}
                  <M tex="\delta \in [0,1]" />.
                </>
              ),
            },
            {
              title: "9 · δ < 1 = impatience",
              body: (
                <>
                  Un euro de plaisir demain compte moins qu'aujourd'hui. On ne préfère jamais
                  repousser son programme.
                </>
              ),
            },
            {
              title: "10 · Concavité (u″ < 0) = lissage",
              body: (
                <>
                  L'utilité marginale décroît, donc on <strong>étale</strong> sa consommation —
                  même à <M tex="r=0" /> on ne consomme pas tout d'un coup.
                </>
              ),
            },
            {
              title: "11 · L'équation d'Euler",
              body: (
                <>
                  <M tex="u'(c_0) = \delta(1+r)\,u'(c_1)" />. Trois régimes :{" "}
                  <M tex="\delta(1+r) = 1" /> lissage, <M tex="< 1" /> impatience (
                  <M tex="c_0 > c_1" />
                  ), <M tex="> 1" /> patience (<M tex="c_0 < c_1" />
                  ).
                </>
              ),
            },
            {
              title: "12 · Le levier « rationnel »",
              body: (
                <>
                  <M tex="r = r^*(1+s)" /> : l'État ne peut pas changer <M tex="\delta" />, mais il
                  peut <strong>subventionner l'épargne</strong> via <M tex="s" /> (≈ 30 % en
                  Belgique sur les 1000 premiers euros).
                </>
              ),
            },
            {
              title: "13 · Le double choix A1–B2",
              body: (
                <>
                  Préférer 100 € maintenant (A1) <em>mais</em> 110 € « dans un an + 1 semaine »
                  (B2) <strong>viole la stationnarité</strong> : la preuve qu'on n'est pas toujours
                  rationnel.
                </>
              ),
            },
            {
              title: "14 · Le modèle (β, δ)",
              body: (
                <>
                  <M tex="U_0^{\beta} = u(c_0) + \beta\textstyle\sum_{t \ge 1} \delta^t u(c_t)" />.
                  Le{" "}
                  <strong>
                    <M tex="\beta \in [0,1]" /> rabote tout le futur
                  </strong>{" "}
                  et capte le biais. <M tex="\beta = 1" /> ⇔ rationnel.
                </>
              ),
            },
            {
              title: "15 · Investissement vs tentation",
              body: (
                <>
                  <strong>Investissement</strong> (<M tex="b_1 < 0" />, <M tex="b_2 > 0" /> —
                  jogging, épargne) : <strong>sous-consommé</strong>. <strong>Tentation</strong> (
                  <M tex="b_1 > 0" />, <M tex="b_2 < 0" /> — chips, alcool) :{" "}
                  <strong>sur-consommée</strong>.
                </>
              ),
            },
            {
              title: "16 · Naïf, sophistiqué & commitment devices",
              body: (
                <>
                  Le <strong>naïf</strong> (<M tex="\hat{\beta} = 1" />) s'ignore ; le{" "}
                  <strong>sophistiqué</strong> (<M tex="\hat{\beta} = \beta" />) se connaît et{" "}
                  <strong>se lie les mains</strong>. Cela explique Laibson : bloquer son argent{" "}
                  <strong>et</strong> emprunter peut être optimal.
                </>
              ),
            },
            {
              title: "17 · Les nudges",
              body: (
                <>
                  <strong>Option par défaut</strong> (Madrian–Shea : 50 → 86 %) et{" "}
                  <strong>Save More Tomorrow</strong> (Thaler–Benartzi : 3,5 → 13,6 %). C'est du{" "}
                  <strong>paternalisme libertaire</strong> : ça aide les biaisés sans contraindre
                  les rationnels.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* ✎ · EXERCICES                                                */}
      {/* ============================================================ */}
      <Section id="exos" kicker="✎ · Entraînement" title="Exercices corrigés">
        <Lead>
          Cinq questions rapides (choisis ta réponse, la correction apparaît) puis trois exercices
          de calcul détaillés — en plus des deux exercices guidés déjà résolus en § 3 et § 5.
          Tente-les <em>avant</em> de regarder la solution : c'est là que ça rentre.
        </Lead>

        <Quiz
          scope="a2"
          id="q6"
          kicker="QCM 1 · Valeur présente"
          question={
            <>
              Ta dotation est <M tex="(m_0, m_1) = (10\,;\,20)" /> et le taux d'intérêt est{" "}
              <M tex="r = 100\,\%" />. Quelle est la consommation maximale possible aujourd'hui,{" "}
              <M tex="c_0^{\max}" /> ?
            </>
          }
          options={[
            {
              text: <>30</>,
              explain: (
                <>
                  Le piège : tu as additionné <M tex="m_0 + m_1" /> en oubliant de diviser le revenu
                  futur par <M tex="(1+r)" />. Sur 20 de revenu futur, tu ne peux emprunter que sa
                  valeur présente : <M tex="20/2 = 10" />.
                </>
              ),
            },
            {
              text: <>20</>,
              correct: true,
              explain: (
                <>
                  On rapatrie tout le futur dans le présent :{" "}
                  <M tex="c_0^{\max} = m_0 + m_1/(1+r) = 10 + 20/2 = 20" />.
                </>
              ),
            },
            {
              text: <>25</>,
              explain: (
                <>
                  Vérifie ta division : avec <M tex="r = 100\,\% " />, on divise <M tex="m_1 = 20" />{" "}
                  par <M tex="1+r = 2" />, ce qui donne 10, pas 15.
                </>
              ),
            },
            {
              text: <>15</>,
              explain: (
                <>
                  Tu as peut-être divisé <em>toute</em> la dotation par 2. Seul le revenu{" "}
                  <em>futur</em> <M tex="m_1" /> doit être actualisé : <M tex="10 + 20/2 = 20" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a2"
          id="q7"
          kicker="QCM 2 · Effet d'un taux élevé"
          question={
            <>
              Le taux d'intérêt <M tex="r" /> est très élevé et l'individu est parfaitement patient
              (<M tex="\delta = 1" />). Que va-t-il faire ?
            </>
          }
          options={[
            {
              text: <>Consommer plus aujourd'hui</>,
              explain: (
                <>
                  Non : rien ne pousse ici vers le présent. <M tex="\delta = 1" /> (aucune
                  impatience) et le taux élevé récompense l'attente.
                </>
              ),
            },
            {
              text: <>Consommer plus à la retraite</>,
              correct: true,
              explain: (
                <>
                  Quand <M tex="\delta(1+r) > 1" />, on est dans le régime « patience » : attendre
                  rapporte tellement que <M tex="c_0 < c_1" />. Le fort taux récompense l'épargne.
                </>
              ),
            },
            {
              text: <>Consommer pareil aux deux périodes</>,
              explain: (
                <>
                  Le lissage parfait exige <M tex="\delta(1+r) = 1" />. Ici{" "}
                  <M tex="\delta(1+r) = 1 + r > 1" /> : l'équilibre penche vers le futur.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a2"
          id="q8"
          kicker="QCM 3 · Quel axiome est violé ?"
          question={
            <>
              Un individu préfère « 100 € maintenant » (A1) à « 110 € dans une semaine », mais
              préfère aussi « 110 € dans un an et une semaine » (B2) à « 100 € dans un an ». Quelle
              hypothèse de rationalité ce double choix viole-t-il ?
            </>
          }
          options={[
            {
              text: <>La complétude</>,
              explain: (
                <>
                  Il n'a aucun mal à comparer les options — il tranche à chaque fois. La complétude
                  est respectée.
                </>
              ),
            },
            {
              text: <>La transitivité</>,
              explain: (
                <>
                  La transitivité concerne des chaînes de trois programmes (<M tex="a" />,{" "}
                  <M tex="b" />, <M tex="c" />). Ici, ce sont deux paires distinctes du même
                  arbitrage vu à deux distances.
                </>
              ),
            },
            {
              text: <>La stationnarité</>,
              correct: true,
              explain: (
                <>
                  Les deux choix sont le même arbitrage (100 tout de suite vs 110 une semaine plus
                  tard) vu à deux distances différentes. Changer d'avis selon la distance, c'est
                  exactement violer la <strong>stationnarité</strong>.
                </>
              ),
            },
            {
              text: <>La monotonie</>,
              explain: (
                <>
                  La monotonie (« plus, c'est mieux ») n'est pas en cause : personne ne préfère
                  moins d'argent à somme et date égales.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a2"
          id="q9"
          kicker="QCM 4 · Classer un bien"
          question={
            <>
              Un bien procure <M tex="b_1 > 0" /> (plaisir immédiat) puis <M tex="b_2 < 0" />{" "}
              (regret plus tard). Pour quelqu'un avec un biais (<M tex="\beta < 1" />
              ), ce bien est…
            </>
          }
          options={[
            {
              text: <>un bien d'investissement, sous-consommé</>,
              explain: (
                <>
                  Un investissement, c'est le profil inverse : coût maintenant (
                  <M tex="b_1 < 0" />) et bénéfice plus tard (<M tex="b_2 > 0" />
                  ).
                </>
              ),
            },
            {
              text: <>un bien de tentation, sur-consommé</>,
              correct: true,
              explain: (
                <>
                  Plaisir maintenant + coût plus tard = <strong>tentation</strong> (chips, alcool).
                  Le biais sur-pondère le présent, donc on craque trop souvent :{" "}
                  <strong>sur-consommée</strong>.
                </>
              ),
            },
            {
              text: <>un bien de tentation, sous-consommé</>,
              explain: (
                <>
                  C'est bien une tentation, mais le biais β fait <em>craquer</em> au moment d'agir
                  (le regret futur est raboté) : la tentation est donc <strong>sur</strong>
                  -consommée, pas sous-consommée.
                </>
              ),
            },
            {
              text: <>un bien d'investissement, sur-consommé</>,
              explain: (
                <>
                  Doublement inversé : le profil <M tex="b_1 > 0" />, <M tex="b_2 < 0" /> définit
                  une tentation, et le biais la fait sur-consommer.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a2"
          id="q10"
          kicker="QCM 5 · Qui se lie les mains ?"
          question={
            <>
              Parmi ces individus, lequel va chercher un « commitment device » (par ex. bloquer son
              argent) ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Le naïf (<M tex="\hat{\beta} = 1" />)
                </>
              ),
              explain: (
                <>
                  Le naïf croit son moi futur irréprochable : il ne voit aucune raison de se
                  protéger de lui-même.
                </>
              ),
            },
            {
              text: (
                <>
                  Le sophistiqué (<M tex="\hat{\beta} = \beta" />)
                </>
              ),
              correct: true,
              explain: (
                <>
                  Seul le sophistiqué <em>anticipe</em> qu'il va craquer. Il paie donc volontiers
                  (un peu) pour se lier les mains — comme Ulysse au mât.
                </>
              ),
            },
            {
              text: <>Les deux pareil</>,
              explain: (
                <>
                  Non : tout dépend de la <em>conscience</em> du biais. Même β, mais des
                  anticipations différentes → des comportements différents.
                </>
              ),
            },
            {
              text: <>Aucun des deux</>,
              explain: (
                <>
                  Le sophistiqué en cherche un, et on l'observe dans les données (Laibson) : actifs
                  illiquides massifs + emprunts simultanés.
                </>
              ),
            },
          ]}
        />

        <ExerciseBlock
          scope="a2"
          id="ex3"
          number={3}
          title="Le lissage parfait"
          difficulty={1}
          refs={[{ chapter: "a2", section: "choix", label: "Équation d'Euler" }]}
          statement={
            <>
              Un individu rationnel a <M tex="u(c) = \sqrt{c}" />, une patience{" "}
              <M tex="\delta = 1" />, un taux <M tex="r = 0" /> et une dotation{" "}
              <M tex="(m_0, m_1) = (8\,;\,4)" />. Trouve sa consommation optimale{" "}
              <M tex="(c_0^*, c_1^*)" />. Épargne-t-il ou emprunte-t-il ?
            </>
          }
          steps={[
            {
              title: "L'équation d'Euler",
              content: (
                <>
                  <p>
                    Avec <M tex="u(c) = \sqrt{c}" />, l'utilité marginale est{" "}
                    <M tex="u'(c) = \tfrac{1}{2\sqrt{c}}" />. On écrit Euler :
                  </p>
                  <MB tex="\frac{1}{2\sqrt{c_0}} = \delta(1+r)\,\frac{1}{2\sqrt{c_1}}" />
                  <p>
                    Ici <M tex="\delta(1+r) = 1 \times 1 = 1" />, donc{" "}
                    <M tex="\sqrt{c_0} = \sqrt{c_1}" />, c'est-à-dire{" "}
                    <strong>
                      <M tex="c_0 = c_1" />
                    </strong>
                    .
                  </p>
                </>
              ),
            },
            {
              title: "La contrainte de budget",
              content: (
                <p>
                  À <M tex="r = 0" /> : <M tex="c_0 + c_1 = m_0 + m_1 = 8 + 4 = 12" />.
                </p>
              ),
            },
            {
              title: "On combine",
              content: (
                <p>
                  Comme <M tex="c_0 = c_1" /> et qu'ils font 12 ensemble : <M tex="2c_0 = 12" /> →{" "}
                  <M tex="c_0^* = 6" /> et <M tex="c_1^* = 6" />.
                </p>
              ),
            },
          ]}
          result={
            <>
              <M tex="(c_0^*, c_1^*) = (6\,;\,6)" />. Il gagne 8 mais ne consomme que 6
              aujourd'hui : il <strong>épargne 2</strong>, qu'il retrouve en retraite (
              <M tex="4 + 2 = 6" />
              ). Patient et sans incitation à attendre, il étale parfaitement.
            </>
          }
        />

        <ExerciseBlock
          scope="a2"
          id="ex4"
          number={4}
          title="L'impatient qui emprunte"
          difficulty={2}
          refs={[{ chapter: "a2", section: "choix", label: "Équation d'Euler" }]}
          statement={
            <>
              Même fonction <M tex="u(c) = \sqrt{c}" /> et <M tex="r = 0" />, mais cette fois
              l'individu est <strong>impatient</strong> : <M tex="\delta = \tfrac{1}{2}" />. Sa
              dotation est <M tex="(m_0, m_1) = (5\,;\,5)" />. Trouve{" "}
              <M tex="(c_0^*, c_1^*)" />. Épargne-t-il ou emprunte-t-il ?
            </>
          }
          steps={[
            {
              title: "Euler avec δ = ½",
              content: (
                <>
                  <MB tex="\frac{1}{2\sqrt{c_0}} = \delta(1+r)\,\frac{1}{2\sqrt{c_1}}" />
                  <p>
                    Ici <M tex="\delta(1+r) = \tfrac{1}{2}" />. On réarrange :{" "}
                    <M tex="\sqrt{c_1}/\sqrt{c_0} = \tfrac{1}{2}" />, donc en élevant au carré{" "}
                    <M tex="c_1 = \tfrac{1}{4}c_0" />.{" "}
                    <em>
                      Comme <M tex="\delta(1+r) < 1" />, on s'attend à <M tex="c_0 > c_1" /> —
                      l'impatience.
                    </em>
                  </p>
                </>
              ),
            },
            {
              title: "La contrainte de budget",
              content: (
                <p>
                  À <M tex="r = 0" /> : <M tex="c_0 + c_1 = 5 + 5 = 10" />.
                </p>
              ),
            },
            {
              title: "On combine",
              content: (
                <p>
                  On remplace <M tex="c_1 = \tfrac{1}{4}c_0" /> :{" "}
                  <M tex="c_0 + \tfrac{1}{4}c_0 = 10" /> → <M tex="\tfrac{5}{4}c_0 = 10" /> →{" "}
                  <M tex="c_0^* = 8" />, puis <M tex="c_1^* = \tfrac{1}{4} \times 8 = 2" />.
                </p>
              ),
            },
          ]}
          result={
            <>
              <M tex="(c_0^*, c_1^*) = (8\,;\,2)" />. Il consomme 8 aujourd'hui alors qu'il ne
              gagne que 5 : il <strong>emprunte 3</strong>, qu'il rembourse sur sa retraite (
              <M tex="5 - 3 = 2" />
              ). Son impatience le pousse à vivre au-dessus de ses moyens tout de suite.
            </>
          }
        />

        <ExerciseBlock
          scope="a2"
          id="ex5"
          number={5}
          title="Le verre de trop"
          difficulty={1}
          refs={[{ chapter: "a2", section: "selfcontrole", label: "Tentation vs investissement" }]}
          statement={
            <>
              Un individu a <M tex="\delta = 1" /> et un biais <M tex="\beta = \tfrac{1}{2}" />.
              Boire un verre ce soir (en <M tex="t=1" />) lui donne un plaisir{" "}
              <M tex="b_1 = +3" />, mais une gueule de bois <M tex="b_2 = -4" /> le lendemain (
              <M tex="t=2" />
              ). <strong>(a)</strong> En <M tex="t=0" />, <em>souhaite</em>-t-il programmer de
              boire ? <strong>(b)</strong> Le soir venu, <em>boit</em>-il ? Que conclus-tu ?
            </>
          }
          steps={[
            {
              title: "(a) Ce qu'il veut de loin — critère ex-ante",
              content: (
                <p>
                  Vu de <M tex="t=0" />, il veut boire si <M tex="b_1 + \delta b_2 > 0" /> :{" "}
                  <M tex="3 + 1 \times (-4) = -1 < 0" />. ✗ <strong>Non :</strong> il préférerait
                  s'abstenir. Le regret pèse plus que le plaisir.
                </p>
              ),
            },
            {
              title: "(b) Ce qu'il fait sur le moment — vrai β",
              content: (
                <p>
                  Le soir, le plaisir est « maintenant » et la gueule de bois est « futur » (donc
                  rabotée par <M tex="\beta" />) : il boit si <M tex="b_1 + \beta\delta b_2 > 0" />{" "}
                  : <M tex="3 + \tfrac{1}{2} \times 1 \times (-4) = 3 - 2 = +1 > 0" />. ✓{" "}
                  <strong>Oui, il craque.</strong>
                </p>
              ),
            },
          ]}
          result={
            <>
              Il ne <strong>voulait pas</strong> boire (a) mais il <strong>boit quand même</strong>{" "}
              (b). C'est un <strong>bien de tentation sur-consommé</strong> : le biais{" "}
              <M tex="\beta" /> fait pencher la balance au mauvais moment. Symétrique exact de
              l'exercice du jogging (un investissement sous-consommé).
            </>
          }
        />

        <Callout variant="retiens" title="Tu tiens le chapitre A2 en entier">
          Tu as vu le modèle à deux périodes, la contrainte de budget inter-temporelle, l'équation
          d'Euler et ses trois régimes, puis tout le pan « comportemental » : le biais de
          self-contrôle (β, δ), biens d'investissement vs de tentation, naïfs vs sophistiqués, les
          commitment devices et les politiques publiques. Manipule les widgets jusqu'à ce que les
          courbes deviennent une intuition, et refais les huit exercices sans regarder les
          corrigés.
        </Callout>
      </Section>
    </ChapterShell>
  );
}
