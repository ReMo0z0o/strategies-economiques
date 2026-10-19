/*
 * Chapitre A2 — PartSynthese (sections affichées dans la page du chapitre).
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

export function PartSynthese() {
  return (
    <>

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
                  ). Un <strong>programme</strong> <M tex="c = (c_0, c_1)" /> ; la{" "}
                  <strong>dotation</strong> <M tex="\omega = (m_0, m_1)" /> = ce que tu
                  consommerais sans épargner ni emprunter (fil rouge du chapitre :{" "}
                  <M tex="(8\,;\,4)" />
                  ).
                </>
              ),
            },
            {
              title: "2 · Valeur présente et valeur future",
              body: (
                <>
                  <M tex="c_0^{\max} = m_0 + m_1/(1+r)" /> (valeur présente de la dotation) et{" "}
                  <M tex="c_1^{\max} = (1+r)m_0 + m_1" /> (valeur future). Deux façons de mesurer
                  la même richesse.
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
                  <M tex="(1+r)\,c_0 + c_1 \le (1+r)\,m_0 + m_1" /> : une droite de pente{" "}
                  <strong>
                    <M tex="-(1+r)" />
                  </strong>{" "}
                  qui passe toujours par <M tex="\omega" /> (elle{" "}
                  <strong>pivote autour de ω</strong> quand <M tex="r" /> change). Sous la droite =
                  accessible.
                </>
              ),
            },
            {
              title: "5 · Les six propriétés des préférences rationnelles",
              body: (
                <>
                  Les préférences <M tex="\succeq" /> sont{" "}
                  <strong>complètes, transitives, monotones, continues, stationnaires</strong>{" "}
                  (slide 9), et elles respectent l'
                  <strong>indépendance du trade-off initial</strong> (slide 10).
                </>
              ),
            },
            {
              title: "6 · La stationnarité (la clé)",
              body: (
                <>
                  Mes préférences sur les périodes à venir <strong>ne changent pas</strong> avec le
                  temps qui passe : deux programmes qui commencent par la même consommation{" "}
                  <M tex="a" /> se classent comme leurs suites. Sans choc, pas besoin de
                  ré-optimiser. C'est l'hypothèse que le double choix A1 + B2 viole (§ 5).
                </>
              ),
            },
            {
              title: "7 · L'indépendance du trade-off initial",
              body: (
                <>
                  Les préférences sur les deux premières périodes ne dépendent pas du programme qui
                  les suit. Hypothèse « forte » : elle exclut les habitudes et les addictions créées
                  au début du programme.
                </>
              ),
            },
            {
              title: "8 · L'utilité escomptée",
              body: (
                <>
                  <M tex="U_0(c) = u(c_0) + \delta u(c_1) + \delta^2 u(c_2) + \cdots" />, avec{" "}
                  <M tex="\delta \in [0,1]" /> le <strong>facteur d'escompte</strong> et{" "}
                  <M tex="u" /> strictement croissante. Des préférences rationnelles escomptent
                  l'utilité (Koopmans, 1960 ; Bleichrodt et al., 2008), et l'utilité escomptée est
                  bien stationnaire et indépendante du trade-off initial (slide 13).
                </>
              ),
            },
            {
              title: "9 · δ < 1 = impatience",
              body: (
                <>
                  Si <M tex="\delta < 1" />, on ne préfère jamais repousser son programme d'une
                  période : <M tex="(a, b, \ldots) \succ (0, a, b, \ldots)" />, car (avec{" "}
                  <M tex="u(0) = 0" />) <M tex="U_0(0, a, b, \ldots) = \delta\, U_0(a, b, \ldots)" />{" "}
                  (slide 14).
                </>
              ),
            },
            {
              title: "10 · Concavité (u″ < 0) = lissage",
              body: (
                <>
                  L'utilité marginale décroît, donc on <strong>étale</strong> sa consommation
                  (courbes d'indifférence convexes) : même à <M tex="r=0" />, l'impatience ne
                  pousse pas à tout consommer en <M tex="t=0" /> (slide 15).
                </>
              ),
            },
            {
              title: "11 · L'équation d'Euler et ses trois effets",
              body: (
                <>
                  <M tex="u'(c_0) = \delta(1+r)\,u'(c_1)" />, obtenue en divisant les deux CPO
                  l'une par l'autre (condition de tangence). Trois effets (slide 18) :{" "}
                  <strong>lissage</strong> lié à la concavité (<M tex="r=0" />,{" "}
                  <M tex="\delta=1" /> ⇒ <M tex="c_0^* = c_1^*" />) ; <strong>impatience</strong>{" "}
                  liée à l'escompte (<M tex="r=0" />, <M tex="\delta<1" /> ⇒{" "}
                  <M tex="c_0^* > c_1^*" />) ; <strong>patience</strong> liée aux taux d'intérêt (
                  <M tex="r>0" />, <M tex="\delta=1" /> ⇒ <M tex="c_0^* < c_1^*" />).
                </>
              ),
            },
            {
              title: "12 · Le levier « rationnel »",
              body: (
                <>
                  <M tex="r = r^*(1+s)" /> : l'État ne contrôle pas <M tex="\delta" />, mais il
                  peut augmenter le subside à la valeur <M tex="s" /> (une taxe si{" "}
                  <M tex="s < 0" />) ; sous certaines conditions, <M tex="c_0^*" /> baisse et{" "}
                  <M tex="c_1^*" /> augmente. En Belgique : un subside d'environ 30 % sur les
                  1000 premiers euros épargnés dans l'année pour la retraite.
                </>
              ),
            },
            {
              title: "13 · Le double choix A1 + B2",
              body: (
                <>
                  18 % prennent 100 € maintenant (A1), mais seulement 3 % prennent 100 € dans un an
                  (B1). Préférer A1 <em>et</em> B2 (110 € dans un an et une semaine){" "}
                  <strong>viole la stationnarité</strong> : la préférence s'inverse en faveur de la
                  récompense la plus proche quand le délai diminue (slides 20-21).
                </>
              ),
            },
            {
              title: "14 · Le modèle (β, δ) d'O'Donoghue et Rabin (2001)",
              body: (
                <>
                  <M tex="U_0^{\beta} = u(c_0) + \beta\textstyle\sum_{t \ge 1} \delta^t u(c_t)" />.{" "}
                  <M tex="\beta \in [0,1]" /> capture le <strong>biais de self-contrôle</strong> :
                  il rabote tout le futur d'un coup. Entre deux dates futures, il se simplifie ;
                  entre « maintenant » et « plus tard », il reste. <M tex="\beta = 1" /> ⇔ modèle
                  rationnel.
                </>
              ),
            },
            {
              title: "15 · Investissement vs tentation",
              body: (
                <>
                  Ex-ante (<M tex="t=0" />), il veut consommer le bien si{" "}
                  <M tex="b_1 + \delta b_2 > 0" /> ; en <M tex="t=1" />, il le consomme si{" "}
                  <M tex="b_1 + \beta\delta b_2 > 0" />. Un bien d'investissement (
                  <M tex="b_1 < 0 < b_2" />, jogging) est <em>parfois</em>{" "}
                  <strong>sous-consommé</strong> ; un bien de tentation (<M tex="b_1 > 0 > b_2" />,
                  chips) est <em>parfois</em> <strong>sur-consommé</strong>.
                </>
              ),
            },
            {
              title: "16 · Naïf, sophistiqué, partiellement conscient",
              body: (
                <>
                  <M tex="\hat{\beta}" /> = l'estimation qu'il fait de son biais : naïf{" "}
                  <M tex="\hat{\beta} = 1" />, sophistiqué <M tex="\hat{\beta} = \beta" />,
                  partiellement conscient <M tex="\hat{\beta} \in (\beta, 1)" />. En{" "}
                  <M tex="t=0" />, il <em>croit</em> qu'il consommera si{" "}
                  <M tex="b_1 + \hat{\beta}\delta b_2 > 0" /> ; il le fera <em>vraiment</em> si{" "}
                  <M tex="b_1 + \beta\delta b_2 > 0" /> (slide 28).
                </>
              ),
            },
            {
              title: "17 · Commitment devices et mystère de Laibson",
              body: (
                <>
                  Le (partiellement) sophistiqué <strong>se lie les mains</strong> (Ulysse). Avec{" "}
                  <M tex="m = 9" />, <M tex="\beta = 0{,}5" />, <M tex="\delta = 1" /> : plan idéal{" "}
                  <M tex="(4{,}5\,;\,4{,}5)" /> = 3,008β, naïf <M tex="(6\,;\,3)" /> = 2,89β ;
                  bloquer <M tex="a = 4{,}5" />{" "}
                  atteint l'optimum dans le cas 1 et bat le naïf dans les cas 2 et 3. Laibson et al.
                  (2009) : dette de carte de crédit ≈ 12 % du revenu annuel, actifs illiquides
                  ≈ 216 % du revenu annuel vers 50 ans. Bloquer son argent <strong>et</strong>{" "}
                  emprunter peut être <strong>raisonnable</strong> : cela donne plus d'utilité
                  ex-ante que de ne rien bloquer (ne dis pas « optimal »).
                </>
              ),
            },
            {
              title: "18 · Les nudges",
              body: (
                <>
                  <strong>Option par défaut</strong> (Madrian et Shea, 2001) : seule l'option
                  cochée d'avance change (0 % → 3 %), et la <em>part des employés</em> qui
                  épargnent pour leur retraite passe de 50 % à 86 %. Le même biais de self-contrôle
                  (procrastination naïve) est retourné contre le manque d'épargne.{" "}
                  <strong>SmarTplan</strong> (Save More Tomorrow, Thaler et Benartzi, 2004) : le{" "}
                  <em>taux d'épargne</em> passe de 3,5 % à 13,6 % en à peine 4 ans. C'est du{" "}
                  <strong>paternalisme libertaire</strong> : ça aide ceux qui ont des problèmes de
                  self-contrôle, sans effet sur les individus purement rationnels.
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
          Cinq QCM (choisis ta réponse, la correction apparaît) puis quatre exercices corrigés pas
          à pas — en plus des exercices 1 (slide 12, en § 3) et 2 (slide 29, en § 5). Au total, le
          chapitre compte 6 exercices corrigés pas à pas et 10 QCM. Tente-les <em>avant</em> de
          regarder la solution : c'est là que ça rentre.
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
                  C'est l'effet « patience liée aux taux d'intérêt » du slide 18 : un fort taux
                  d'intérêt incite à retarder sa consommation. Avec <M tex="r > 0" /> et{" "}
                  <M tex="\delta = 1" />, on obtient <M tex="c_0^* < c_1^*" />. (Raccourci déduit
                  d'Euler : <M tex="\delta(1+r) = 1 + r > 1" />.)
                </>
              ),
            },
            {
              text: <>Consommer pareil aux deux périodes</>,
              explain: (
                <>
                  Consommer pareil (<M tex="c_0^* = c_1^*" />), c'est le lissage pur du slide 18,
                  par exemple avec <M tex="r = 0" /> et <M tex="\delta = 1" />. Ici le taux est
                  élevé : Euler donne <M tex="u'(c_0) = (1+r)\,u'(c_1) > u'(c_1)" />, donc{" "}
                  <M tex="c_0 < c_1" /> (l'utilité marginale décroît) : la balance penche vers le
                  futur.
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
                  exactement violer la <strong>stationnarité</strong> (slide 21).
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
                  Au moment d'agir, β rabote le regret futur : il arrive qu'on craque alors qu'on
                  avait prévu de résister (quand <M tex="b_1 + \delta b_2 < 0" /> mais{" "}
                  <M tex="b_1 + \beta\delta b_2 > 0" />). La tentation est donc{" "}
                  <strong>sur-consommée</strong> (slide 26).
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
                  Seul celui qui <em>anticipe</em> son biais — sophistiqué, ou partiellement
                  sophistiqué — cherche à se lier les mains (slide 30). Il accepte même de payer un
                  peu pour cela (actif qui se déprécie, cas 2) — comme Ulysse au mât.
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
                  Le sophistiqué en cherche un, et c'est ce qu'expliquent les données de Laibson et
                  al. (2009) : beaucoup d'actifs illiquides et, en même temps, des emprunts sur
                  carte de crédit.
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
              ). C'est l'effet « lissage lié à la concavité » du slide 18 : avec <M tex="r = 0" />{" "}
              et <M tex="\delta = 1" />, on obtient <M tex="c_0^* = c_1^*" />.
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
                      C'est l'effet « impatience liée à l'escompte » du slide 18 : avec{" "}
                      <M tex="r = 0" /> et <M tex="\delta < 1" />, on s'attend à{" "}
                      <M tex="c_0^* > c_1^*" />.
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
              <M tex="\beta" /> fait pencher la balance au mauvais moment. Ici les deux critères ont
              des signes opposés (−1 puis +1) : c'est le « parfois » du slide 26. Symétrique exact
              du jogging (un investissement sous-consommé).
            </>
          }
        />

        <ExerciseBlock
          scope="a2"
          id="ex6"
          number={6}
          title="Se lier les mains"
          difficulty={2}
          refs={[{ chapter: "a2", section: "commit", label: "Actifs illiquides et emprunts" }]}
          statement={
            <>
              Reprends le décor des slides 31-37. Un individu a des préférences (β, δ) avec{" "}
              <M tex="\beta = 0{,}5" />, <M tex="\delta = 1" /> et <M tex="u(c) = \ln c" />. En{" "}
              <M tex="t=0" />, il reçoit <M tex="m = 9" /> et ne consomme rien ; il consomme{" "}
              <M tex="c_1" /> en <M tex="t=1" /> et <M tex="c_2" /> en <M tex="t=2" />. L'argent
              gardé de <M tex="t=1" /> à <M tex="t=2" /> ne rapporte aucun intérêt.{" "}
              <strong>(a)</strong> Quel programme est optimal vu de <M tex="t=0" /> ? Calcule son
              utilité ex-ante <M tex="U_0" />. <strong>(b)</strong> S'il n'achète aucun actif (
              <M tex="a = 0" />
              ), que consommera réellement son moi de <M tex="t=1" /> ? Quelle utilité ex-ante ce
              programme lui donne-t-il ? <strong>(c)</strong> Cas 1 : les actifs ne se déprécient
              pas (<M tex="p = 0" />) et emprunter est impossible (<M tex="r = \infty" />). Le
              sophistiqué achète <M tex="a = 4{,}5" /> en <M tex="t=0" />. Que se passe-t-il ?{" "}
              <strong>(d)</strong> Pour aller plus loin (slide 37) : même chose, mais l'actif se
              déprécie de <M tex="p = 0{,}05" />. Avec <M tex="a = 4{,}5" />, fait-il encore mieux
              que le naïf ?
            </>
          }
          steps={[
            {
              title: "(a) Le plan idéal, calculé en t = 0",
              content: (
                <>
                  <p>
                    Vu de <M tex="t=0" />, acheter des actifs ou emprunter coûte sans rien
                    rapporter : le plan idéal a <M tex="a = e = 0" />, avec la contrainte{" "}
                    <M tex="c_1 + c_2 = 9" />. Les deux consommations sont futures : elles portent
                    les poids <M tex="\beta\delta" /> et <M tex="\beta\delta^2" />.
                  </p>
                  <MB tex="\mathcal{L} = \beta\delta \ln c_1 + \beta\delta^2 \ln c_2 - \lambda\,[c_1 + c_2 - 9]" />
                  <p>
                    CPO (dérivées nulles) : <M tex="\frac{\beta\delta}{c_1} = \lambda" /> et{" "}
                    <M tex="\frac{\beta\delta^2}{c_2} = \lambda" />. On égalise :{" "}
                    <M tex="c_2 = \delta\,c_1 = c_1" /> (car <M tex="\delta = 1" />). Avec la
                    contrainte : <M tex="c_1^* = c_2^* = 4{,}5" />.
                  </p>
                  <MB tex="U_0 = \beta\,(\ln 4{,}5 + \ln 4{,}5) \approx \beta\,(1{,}504 + 1{,}504) \approx 3{,}008\,\beta" />
                  <p className="text-[14.5px] text-muted-foreground">
                    Pourquoi « en unités de β » ? Avec <M tex="\delta = 1" />,{" "}
                    <M tex="U_0 = \beta\,(\ln c_1 + \ln c_2)" /> : tous les programmes ont le même
                    facteur <M tex="\beta" />, on compare donc simplement{" "}
                    <M tex="\ln c_1 + \ln c_2" />.
                  </p>
                </>
              ),
            },
            {
              title: "(b) Sans actif : ce que fait vraiment le moi de t = 1",
              content: (
                <>
                  <p>
                    Avec <M tex="a = 0" />, il a ses 9 en main en <M tex="t=1" /> : aucune raison
                    d'emprunter (<M tex="e = 0" />). Mais c'est le moi de <M tex="t=1" /> qui
                    décide : pour lui, la période 1 est « maintenant » (poids 1) et la période 2 est
                    future (poids <M tex="\beta\delta" />).
                  </p>
                  <MB tex="\mathcal{L} = \ln c_1 + \beta\delta \ln c_2 - \lambda\,[c_1 + c_2 - 9]" />
                  <p>
                    CPO : <M tex="\frac{1}{c_1} = \lambda" /> et{" "}
                    <M tex="\frac{\beta\delta}{c_2} = \lambda" />, donc{" "}
                    <M tex="c_2 = \beta\delta\,c_1 = 0{,}5\,c_1" />. Contrainte :{" "}
                    <M tex="c_1 + 0{,}5\,c_1 = 9" />, d'où <M tex="c_1 = 6" /> et{" "}
                    <M tex="c_2 = 3" />.
                  </p>
                  <p>
                    On juge ce programme <strong>ex-ante</strong>, avec l'utilité vue de{" "}
                    <M tex="t=0" /> :
                  </p>
                  <MB tex="U_0 = \beta\,(\ln 6 + \ln 3) = \beta \ln 18 \approx 2{,}890\,\beta \;<\; 3{,}008\,\beta" />
                  <p>
                    C'est ce qui arrive au <strong>naïf</strong> (<M tex="\hat{\beta} = 1" />) : il
                    ne prévoit pas cette déviation et ne fait rien pour l'empêcher. De l'utilité
                    ex-ante est perdue.
                  </p>
                </>
              ),
            },
            {
              title: "(c) Cas 1 : il bloque a = 4,5",
              content: (
                <>
                  <p>
                    En <M tex="t=1" />, il ne peut ni vendre l'actif ni emprunter : il n'a en main
                    que <M tex="m - a = 9 - 4{,}5 = 4{,}5" />, donc <M tex="c_1 \le 4{,}5" />.
                  </p>
                  <p>
                    Ses ressources totales valent toujours 9 (4,5 en main + 4,5 d'actif récupéré en{" "}
                    <M tex="t=2" />) : sans contrainte, son moi de <M tex="t=1" /> voudrait encore{" "}
                    <M tex="c_1 = 6" /> (calcul du (b)). C'est plus que 4,5 : il consomme tout ce
                    qu'il a en main, <M tex="c_1 = 4{,}5" />, et ne garde rien.
                  </p>
                  <p>
                    En <M tex="t=2" />, l'actif est libéré intact (<M tex="p = 0" />) :{" "}
                    <M tex="c_2 = a\,(1-p) = 4{,}5" />.
                  </p>
                  <MB tex="(c_1\,;\,c_2) = (4{,}5\,;\,4{,}5) \qquad U_0 \approx 3{,}008\,\beta" />
                  <p>
                    Il atteint <strong>exactement le plan idéal</strong> : il a mis de côté, en
                    actif illiquide, le montant idéal pour <M tex="c_2" />. Comme on ne peut pas
                    dépasser le plan idéal, <M tex="a = 4{,}5" /> est ici son meilleur choix (le
                    cas 1 est le seul où le slide 35 dérive l'optimum).
                  </p>
                </>
              ),
            },
            {
              title: "(d) Cas 2 : l'actif se déprécie (p = 0,05)",
              content: (
                <>
                  <p>
                    Supposons qu'il bloque encore <M tex="a = 4{,}5" />. En <M tex="t=1" />, rien ne
                    change : <M tex="c_1 = 4{,}5" />. En <M tex="t=2" />, il ne récupère que{" "}
                    <M tex="c_2 = 4{,}5 \times 0{,}95 = 4{,}275" />.
                  </p>
                  <MB tex="U_0 = \beta\,(\ln 4{,}5 + \ln 4{,}275) \approx \beta\,(1{,}504 + 1{,}453) \approx 2{,}96\,\beta" />
                  <p>
                    <M tex="2{,}96 > 2{,}89" /> : même coûteux, l'actif illiquide bat le naïf (mais
                    n'atteint plus le plan idéal). Attention : on a <em>supposé</em>{" "}
                    <M tex="a = 4{,}5" /> ; on ne prétend pas que c'est son meilleur choix ici.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <>
              <p>
                (a) Plan idéal <M tex="(4{,}5\,;\,4{,}5)" />, <M tex="U_0 \approx 3{,}008\,\beta" />.
                (b) Sans actif, son moi de <M tex="t=1" /> consomme <M tex="(6\,;\,3)" /> :{" "}
                <M tex="U_0 \approx 2{,}89\,\beta" />. (c) Avec <M tex="a = 4{,}5" /> et sans
                emprunt possible : <M tex="(4{,}5\,;\,4{,}5)" />, il retrouve{" "}
                <M tex="3{,}008\,\beta" />. (d) Avec <M tex="p = 0{,}05" /> :{" "}
                <M tex="(4{,}5\,;\,4{,}275)" />, <M tex="U_0 \approx 2{,}96\,\beta > 2{,}89\,\beta" />
                .
              </p>
              <p className="mt-2">
                Leçon : l'actif illiquide est un <strong>commitment device</strong>. Le sophistiqué
                réduit lui-même ses options de <M tex="t=1" /> pour se protéger de son problème de
                self-contrôle — comme Ulysse attaché au mât.
              </p>
            </>
          }
        />

        <Callout variant="retiens" title="Tu tiens le chapitre A2 en entier">
          Tu as vu le modèle rationnel (deux périodes, contrainte de budget inter-temporelle,
          préférences rationnelles et utilité escomptée, équation d'Euler et ses trois effets), puis
          les problèmes de self-contrôle : le modèle (β, δ), biens d'investissement vs de tentation,
          naïfs vs sophistiqués, les commitment devices et les politiques comportementales.
          Manipule les animations jusqu'à ce que les courbes deviennent une intuition, et refais
          les 6 exercices et les 10 QCM du chapitre sans regarder les corrigés.
        </Callout>
      </Section>
    </>
  );
}
