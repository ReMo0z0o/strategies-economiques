/*
 * Chapitre B1 — PartFondements : § 0 à § 4 (slides 1-25 du deck S5).
 * Motivation, cadre d'analyse, forme normale, dominance (H1, ESD) et
 * élimination itérative (H2, PSS). Les petits widgets propres à ces
 * sections (s_{-i}, vérificateur de dominance, pénalité climat) sont
 * définis en bas de ce fichier.
 */

import { useState, type ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { cn } from "@/lib/utils";
import {
  C,
  Frame,
  Label,
  PlotSvg,
  curvePath,
  fmt,
  makePlot,
} from "@/chapters/shared/plot";
import { IteratedElimination, MatrixExplorer, PollPrisoner } from "./interactives";
import { H4, CardGrid, MustKnow, SymbolicMatrix } from "./ui";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Listes à puces / numérotées (la prose du site ne les style pas). */
const UL = "my-3 list-disc space-y-1.5 pl-5 marker:text-muted-foreground";
const OL = "my-3 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-muted-foreground";

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Raisonnement en étapes numérotées (chaque étape justifiée). */
function ProofSteps({ children }: { children: ReactNode }) {
  return <ol className="my-4 list-none space-y-3 pl-0">{children}</ol>;
}

function ProofStep({
  n,
  title,
  tag,
  children,
}: {
  n: number | string;
  title: ReactNode;
  /** hypothèse qui justifie l'étape (H1, H2.1…) */
  tag?: string;
  children: ReactNode;
}) {
  return (
    <li className="rounded-xl border bg-muted/30 px-3.5 py-3">
      <p className="m-0 flex flex-wrap items-start gap-2 font-semibold">
        <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[13px] font-bold text-primary-foreground">
          {n}
        </span>
        <span className="min-w-0 flex-1">{title}</span>
        {tag ? <HypTag>{tag}</HypTag> : null}
      </p>
      <div className="mt-1.5 text-[15px] [&_p]:my-1.5">{children}</div>
    </li>
  );
}

/** Pastille « hypothèse » (H1, H2.1, H2.2…). */
function HypTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[12px] font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      {children}
    </span>
  );
}

export function PartFondements() {
  return (
    <>
      {/* ============================================================ */}
      {/* S0 — Pourquoi ce chapitre ?                                   */}
      {/* ============================================================ */}
      <Section id="s0" kicker="§ 0" title="Pourquoi ce chapitre ?">
        <Lead>
          Pourquoi les pays tardent-ils à agir contre le changement climatique, alors que presque
          tous leurs dirigeants sont d'accord ? Pourquoi des épargnants paniqués font-ils parfois
          tomber une banque… et comment éviter ces paniques ? Ce chapitre te donne une boîte à
          outils pour toutes les situations où <em>plusieurs</em> personnes décident en même temps,
          et où ce que chacune obtient dépend des choix de toutes.
        </Lead>

        <div className="my-4 flex flex-wrap gap-2 text-[13px] font-medium">
          {[
            "🎯 3 concepts de solution : ESD · PSS · équilibre de Nash",
            "🃏 5 jeux types + le jeu du rendez-vous",
            "🎲 Stratégies mixtes",
            "🧪 Données de labo réelles du cours",
          ].map((t) => (
            <span key={t} className="rounded-full border bg-card px-3.5 py-1.5 text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        <p>
          Jusqu'ici dans le cours, on a étudié des décideurs <strong>seuls face à leur choix</strong>{" "}
          : en A1, une personne choisit entre plus de loisir ou plus de consommation ; en A2, elle
          arbitre entre consommer aujourd'hui ou demain ; en A3, elle choisit sans connaître
          l'avenir. Dans les trois cas, ce qu'elle obtient dépend de son propre choix (et, en A3, du
          hasard), mais d'aucun autre décideur.
        </p>
        <p>
          Or beaucoup de situations sont <strong>interactives</strong> : ce que j'obtiens dépend
          aussi de ce que <em>toi</em> tu fais. Le cours s'ouvre sur deux énigmes de ce type.
        </p>

        <H4>Deux énigmes pour commencer (slides 2 et 3)</H4>
        <CardGrid
          items={[
            {
              tag: "Slide 2 · Climat",
              title: "Pourquoi cette inertie malgré le consensus ?",
              body: (
                <>
                  De nombreux dirigeants s'accordent à dire que des mesures fortes sont nécessaires
                  pour limiter le changement climatique. Pourtant, les émissions de gaz à effet de
                  serre continuent d'augmenter. Pourquoi tant d'inertie ? Les accords
                  internationaux comme le Protocole de Kyoto ou l'Accord de Paris peuvent-ils aider
                  à sortir de l'impasse ?
                </>
              ),
              extra: <>Réponse en § 3 : c'est un « dilemme du prisonnier ».</>,
            },
            {
              tag: "Slide 3 · Banques",
              title: "Comment résoudre le problème des paniques bancaires ?",
              body: (
                <>
                  Des paniques bancaires ont ruiné les épargnants des banques touchées et peuvent
                  déboucher sur une crise financière : Royaume-Uni (1797), États-Unis (1907),
                  Argentine (1998). Pourtant, en septembre 2008, la banque belge Fortis est au
                  bord de la faillite… et il n'y a <em>pas</em> de panique bancaire. Pourquoi ?
                </>
              ),
              extra: <>Le cours y répond en § 5, avec un petit jeu entre deux épargnants.</>,
            },
          ]}
        />

        <H4>Le problème de fond : un décalage (slide 4)</H4>
        <p>
          Beaucoup de problèmes économiques et sociaux semblent faciles à résoudre… si seulement
          les acteurs concernés se comportaient de la « bonne façon ». Le plus troublant : les
          acteurs <em>eux-mêmes</em> souhaiteraient que tout le monde se comporte bien. Et
          pourtant, souvent, peu d'entre eux le font.
        </p>
        <div className="my-5 overflow-hidden rounded-2xl border text-[14.5px] leading-snug">
          <div className="grid grid-cols-2 bg-muted/60 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
            <div className="px-3 py-2">✅ Ce qui serait souhaitable</div>
            <div className="border-l px-3 py-2">👀 Ce qu'on observe</div>
          </div>
          {[
            [
              "Chaque gouvernement met en place une taxe carbone.",
              "Les émissions continuent d'augmenter.",
            ],
            [
              "Chaque épargnant évite de céder à la panique.",
              "Des paniques éclatent et la banque s'effondre.",
            ],
          ].map(([a, b]) => (
            <div key={a} className="grid grid-cols-2 border-t">
              <div className="px-3 py-2.5">{a}</div>
              <div className="border-l px-3 py-2.5">{b}</div>
            </div>
          ))}
        </div>
        <p>Le slide 4 pose alors deux questions :</p>
        <ul className={UL}>
          <li>
            Pourquoi observe-t-on ce <strong>décalage entre ce qui est souhaitable et ce qui est
            observé</strong> ?
          </li>
          <li>Une bonne compréhension de ces phénomènes peut-elle aider à les résoudre ?</li>
        </ul>
        <p>
          La <strong>théorie des jeux</strong> fournit des outils pour comprendre ce genre de
          phénomènes et leur apporter des solutions appropriées (par exemple un accord qui
          pénalise les pays qui trahissent, en § 3, ou une garantie des dépôts, en § 5).
        </p>

        <Callout variant="intuition" title="💡 L'idée qui traverse tout le chapitre">
          <p>
            Ce qui est bon pour <em>le groupe</em> n'est pas forcément ce que chacun a intérêt à
            faire <em>seul</em>, compte tenu de ce que font les autres. Pour le voir, il faut
            regarder la situation du point de vue de chaque joueur, l'un après l'autre. C'est
            exactement ce que la théorie des jeux apprend à faire.
          </p>
        </Callout>

        <H4>Le fil rouge : le jeu du rendez-vous (slide 5)</H4>
        <p>
          Avant les grands problèmes, un petit jeu très simple. Il va nous suivre de § 1 à § 4 :
          lis-le attentivement, on va le « traduire en mathématiques » juste après.
        </p>
        <Callout variant="exemple" title="📜 L'histoire">
          <p>
            Tu donnes rendez-vous à ton amie devant la gare à 16h. Au moment de partir de chez
            soi, <strong>chacun de vous deux doit décider</strong> : arriver à l'heure (16h) ou en
            retard (16h15). Personne ne connaît le choix de l'autre. L'utilité de chacun est la
            somme de :
          </p>
          <ul className={UL}>
            <li>
              <strong>−2</strong> pour la personne qui <em>attend</em> l'autre (attendre, c'est
              pénible) ;
            </li>
            <li>
              <strong>−1</strong> pour la personne qui <em>fait attendre</em> l'autre (un peu de
              culpabilité) ;
            </li>
            <li>
              <strong>−3</strong> pour ton amie <em>si elle arrive en retard</em> : elle est de
              type « ponctuelle ». Toi, être en retard ne te coûte rien.
            </li>
          </ul>
          <p className="mt-2 font-semibold">
            ⇒ La question du slide 5 : quelle décision chaque personne va-t-elle prendre ?
          </p>
        </Callout>
        <p>
          Si la réponse ne saute pas aux yeux, c'est normal : c'est tout l'objet des § 1 à § 4. On
          va d'abord transformer l'histoire en un <strong>jeu</strong> (§ 1), la résumer dans un
          tableau (§ 2), puis faire des hypothèses sur la façon dont les joueurs raisonnent : H1 en
          § 3, H2 en § 4. La réponse tombera en § 4.
        </p>

        <Callout variant="examen" title="🎯 Ce que tu dois absolument maîtriser à la fin">
          <MustKnow
            items={[
              <>
                Traduire une histoire en <strong>jeu sous forme normale</strong> (joueurs,
                stratégies, matrice des payoffs).
              </>,
              <>
                Identifier les <strong>stratégies dominantes</strong> et <strong>dominées</strong>{" "}
                en vérifiant les inégalités, et trouver l'<strong>ESD</strong> s'il existe.
              </>,
              <>
                Appliquer l'<strong>élimination itérative</strong> des stratégies dominées et
                donner les <strong>PSS</strong>, en disant quelle hypothèse justifie chaque étape.
              </>,
              <>
                Trouver <em>tous</em> les <strong>équilibres de Nash</strong> en stratégies pures
                (méthode des meilleures réponses).
              </>,
              <>
                Reconnaître les <strong>jeux types</strong> (dilemme du prisonnier, bataille des
                sexes, chasse au cerf, poule mouillée, matching pennies) et savoir quel phénomène
                réel chacun illustre.
              </>,
              <>
                Calculer un <strong>équilibre de Nash en stratégies mixtes</strong> avec le{" "}
                <strong>théorème d'indifférence</strong>.
              </>,
              <>
                Comprendre quand les <strong>hypothèses</strong> (H1, H2, H3) sont réalistes, et
                ce que disent les expériences de labo.
              </>,
            ]}
          />
        </Callout>

        <Callout variant="intuition" title="🔗 Lien avec les chapitres A1 à A3">
          <p>
            Le mot-clé des chapitres A1 à A3 était la <strong>rationalité</strong> : un agent rationnel
            choisit l'option qui <em>maximise son utilité</em>. Ici, rien ne change… sauf que
            l'utilité obtenue dépend aussi des choix des <em>autres</em>. Le « payoff » d'un
            joueur, tu vas le voir, n'est rien d'autre que l'utilité qu'il tire du résultat d'une
            interaction.
          </p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <TheoryRef chapter="a1" />
            <TheoryRef chapter="a2" />
            <TheoryRef chapter="a3" />
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* S1 — C'est quoi, un jeu ?                                     */}
      {/* ============================================================ */}
      <Section id="s1" kicker="§ 1" title="C'est quoi, un jeu ?">
        <Lead>
          En théorie des jeux, un « jeu » n'est pas seulement le Monopoly ou le poker : c'est un
          modèle mathématique d'une situation où plusieurs personnes décident et s'influencent.
          Ce paragraphe pose le vocabulaire de tout le chapitre (slides 6 à 10).
        </Lead>

        <H4>L'interaction stratégique (slide 6)</H4>
        <p>
          La théorie des jeux est un outil formel pour analyser les{" "}
          <strong>interactions stratégiques</strong>.
        </p>
        <Callout variant="definition" title="Définition — interaction stratégique">
          <p>Une interaction stratégique implique :</p>
          <ul className={UL}>
            <li>
              <strong>au moins deux joueurs</strong>,
            </li>
            <li>
              chaque joueur a <strong>un choix à faire</strong>, et
            </li>
            <li>
              le <strong>résultat</strong> de l'interaction <strong>dépend du choix de chaque
              joueur</strong>.
            </li>
          </ul>
          <p>Pour l'analyser, la théorie des jeux la modélise sous la forme d'un jeu.</p>
        </Callout>
        <p>
          Le jeu du rendez-vous coche les trois cases : deux joueurs (toi et ton amie), un choix
          chacun (Heure ou Retard), et le résultat (qui attend qui ?) dépend des deux choix. En
          revanche, ta note à un examen ne dépend que de toi : ce n'est <em>pas</em> une
          interaction stratégique. Le prix de deux stations-service voisines, la décision de se
          doper (ou non) dans une course cycliste : oui.
        </p>

        <H4>Un jeu simultané, c'est trois ingrédients (slide 7)</H4>
        <p>
          Pour transformer une histoire en jeu, il faut toujours préciser les trois mêmes
          ingrédients. Retiens la recette :
        </p>
        <Callout variant="definition" title="Définition — jeu simultané">
          <ol className={OL}>
            <li>
              <strong>Les joueurs</strong> : un ensemble <M tex="\{1, \dots, i, \dots, n\}" />. On
              parle du « joueur <M tex="i" /> » pour désigner n'importe lequel d'entre eux.
            </li>
            <li>
              <strong>Les stratégies</strong> : pour chaque joueur <M tex="i" />, un ensemble{" "}
              <M tex="S_i = \{s_i, s_i', \dots\}" /> qui contient tout ce qu'il peut choisir.
            </li>
            <li>
              <strong>La fonction de payoff</strong> de chaque joueur <M tex="i" /> : pour chaque{" "}
              <strong>profil de stratégies</strong> <M tex="(s_1, \dots, s_i, \dots, s_n)" />{" "}
              (une stratégie par joueur), elle donne le payoff reçu{" "}
              <M tex="u_i(s_1, \dots, s_i, \dots, s_n)" />, c'est-à-dire la satisfaction du
              joueur <M tex="i" />.
            </li>
          </ol>
        </Callout>

        <p>
          <strong>Dans le cas du jeu du rendez-vous</strong> (slide 7) :
        </p>
        <ul className={UL}>
          <li>
            Les joueurs sont <span className="font-bold text-rose-700">1 = Vous</span> et{" "}
            <span className="font-bold text-sky-700">2 = Amie</span>.
          </li>
          <li>
            Leurs ensembles de stratégies :{" "}
            <M tex="S_V = \{\text{Heure}, \text{Retard}\}" /> et{" "}
            <M tex="S_A = \{\text{Heure}, \text{Retard}\}" />. On abrège en H et R.
          </li>
          <li>
            Les deux fonctions de payoff. Le premier argument est toujours <em>ton</em> choix, le
            second celui de ton amie :
          </li>
        </ul>
        <MB tex="u_V(H,H) = 0,\quad u_V(H,R) = -2,\quad u_V(R,H) = -1,\quad u_V(R,R) = 0" />
        <MB tex="u_A(H,H) = 0,\quad u_A(H,R) = -4,\quad u_A(R,H) = -2,\quad u_A(R,R) = -3" />
        <p>
          D'où viennent ces huit nombres ? On raconte chaque scénario jusqu'au bout, puis on
          additionne les éléments d'utilité de l'histoire, <em>un joueur à la fois</em> :
        </p>
        <div className="my-4 overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-[14px] leading-snug">
            <thead>
              <tr className="bg-muted/60 text-left text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-2.5 py-2">Profil (Vous, Amie)</th>
                <th className="px-2.5 py-2">Ce qui se passe</th>
                <th className="px-2.5 py-2 text-rose-700">
                  <M tex="u_V" />
                </th>
                <th className="px-2.5 py-2 text-sky-700">
                  <M tex="u_A" />
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["(H, H)", "Personne n'attend, personne n'est en retard.", "0", "0"],
                  [
                    "(H, R)",
                    "Tu l'attends (−2). Elle te fait attendre (−1) et elle est en retard (−3).",
                    "−2",
                    <>
                      −4
                      <span className="block text-[12px] font-normal text-muted-foreground">
                        = −1 − 3
                      </span>
                    </>,
                  ],
                  ["(R, H)", "Tu la fais attendre (−1). Elle t'attend (−2).", "−1", "−2"],
                  ["(R, R)", "Personne n'attend, mais elle est en retard (−3).", "0", "−3"],
                ] as Array<[string, string, string, ReactNode]>
              ).map(([prof, story, uv, ua]) => (
                <tr key={prof} className="border-t align-top">
                  <td className="whitespace-nowrap px-2.5 py-2 font-semibold">{prof}</td>
                  <td className="px-2.5 py-2">{story}</td>
                  <td className="whitespace-nowrap px-2.5 py-2 font-semibold tabular-nums text-rose-700">
                    {uv}
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2 font-semibold tabular-nums text-sky-700">
                    {ua}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="attention" title="⚠️ Deux précisions importantes (slide 9)">
          <p>
            <strong>1. Résultat ≠ payoffs.</strong> Chaque profil de stratégies mène à un{" "}
            <strong>résultat</strong> concret, et chaque résultat est associé à un{" "}
            <strong>profil de payoffs</strong>. Exemple : le profil{" "}
            <M tex="(s_V, s_A) = (H, H)" /> mène au résultat « vous arrivez tous les deux à
            l'heure et personne n'attend », associé au profil de payoffs{" "}
            <M tex="(u_V, u_A) = (0, 0)" />.
          </p>
          <p>
            <strong>2. Payoff ≠ argent.</strong> Le payoff d'un joueur est l'
            <strong>utilité</strong> qu'il tire du résultat. Si le résultat est un montant d'argent,
            le payoff est l'utilité que le joueur retire de ce montant, pas forcément le montant
            lui-même : deux joueurs qui gagnent 100 € chacun peuvent en tirer des payoffs
            différents.
          </p>
        </Callout>

        <Callout variant="intuition" title="🔗 Rappel du chapitre A1">
          <p>
            « Payoff = utilité du résultat » : c'est la fonction d'utilité de A1. Et l'
            <strong>Hypothèse 1</strong> du § 3 (les joueurs sont rationnels) est exactement la
            rationalité de A1 : choisir ce qui maximise son utilité. La nouveauté n'est pas le
            comportement du joueur, c'est que son payoff dépend <em>aussi des autres</em>.
          </p>
        </Callout>

        <H4>
          Une notation importante : <M tex="s_{-i}" /> (slide 9)
        </H4>
        <p>
          Le profil de stratégies <M tex="(s_1, \dots, s_i, \dots, s_n)" /> peut s'écrire de
          manière plus courte <M tex="(s_i, s_{-i})" />, où
        </p>
        <MB tex="s_{-i} = (s_1, \dots, s_{i-1}, s_{i+1}, \dots, s_n)." />
        <p>
          En mots : <M tex="s_{-i}" /> (lis « s moins i ») est la liste des stratégies de{" "}
          <strong>tous les joueurs sauf <M tex="i" /></strong>. Dans la liste complète, on a juste
          retiré la case numéro <M tex="i" />. Quand tu lis <M tex="s_{-i}" />, pense « ce que
          font les adversaires de <M tex="i" /> ». Cette notation revient dans toutes les
          définitions du chapitre.
        </p>
        <Callout variant="exemple" title="Deux mini-exemples">
          <p>
            <strong>Avec 2 joueurs.</strong> Dans le jeu du rendez-vous, prends le profil (H, R)
            et <M tex="i = V" /> (toi). Alors <M tex="s_V = H" /> et{" "}
            <M tex="s_{-V} = s_A = R" /> : avec deux joueurs, « les autres », c'est simplement
            l'autre joueur.
          </p>
          <p>
            <strong>Avec 3 joueurs.</strong> Trois stations-service choisissent chacune un prix,
            Bas ou Haut, et on observe le profil (Bas, Haut, Haut). Pour <M tex="i = 2" /> :{" "}
            <M tex="s_2 = \text{Haut}" /> et <M tex="s_{-2} = (s_1, s_3) = (\text{Bas}, \text{Haut})" />.
          </p>
        </Callout>

        <ProfileSplit />

        <Callout variant="attention" title="⚠️ Ne mélange pas l'ordre des arguments">
          <p>
            <M tex="(s_i, s_{-i})" /> est une simple façon d'écrire : on met « le joueur dont on
            parle » devant. Mais dans la matrice et dans les payoffs du slide 7, l'ordre reste{" "}
            <strong>(choix de Vous, choix d'Amie)</strong>. Ainsi <M tex="u_A(H, R)" /> se lit «
            payoff de ton amie quand <em>toi</em> tu joues H et <em>elle</em> R ». C'est ce qui
            permet de lire les vérifications du § 3 sans se tromper.
          </p>
        </Callout>

        <H4>Quel type de jeux étudie-t-on en B1 ? (slide 10)</H4>
        <p>
          Les jeux analysés par la théorie des jeux sont classés en catégories selon les
          hypothèses faites sur <strong>la technologie, le timing et l'information</strong> dont
          disposent les joueurs. En B1, les jeux ont ces <strong>quatre caractéristiques</strong>.
          Retiens-les : elles définissent le cadre de tout le chapitre.
        </p>
        <CardGrid
          items={[
            {
              tag: "Accords",
              title: "Non-coopératifs",
              body: (
                <>
                  Les joueurs ne peuvent pas conclure d'<strong>accords contraignants</strong>{" "}
                  avant de choisir leur stratégie. Pas de « promis-juré » qui engage vraiment.
                </>
              ),
              extra: <>Le contraire : un jeu où l'on peut signer un accord qui engage vraiment.</>,
            },
            {
              tag: "Timing",
              title: "Simultanés",
              body: (
                <>
                  Au moment de choisir sa stratégie, chaque joueur <strong>ignore</strong> la
                  stratégie choisie par ses adversaires. Pas forcément au même instant : ce qui
                  compte, c'est l'ignorance.
                </>
              ),
              extra: (
                <>
                  Le contraire : un jeu séquentiel, où l'on joue à tour de rôle en voyant les coups
                  précédents (comme aux échecs).
                </>
              ),
            },
            {
              tag: "Information",
              title: "Information complète",
              body: (
                <>
                  Chaque joueur connaît les ensembles de stratégies et les fonctions de payoff de{" "}
                  <strong>tous</strong> ses adversaires. Je sais ce que tu aimes, tu sais ce que
                  j'aime.
                </>
              ),
              extra: (
                <>
                  Le contraire : l'information incomplète, où l'on ignore une partie des payoffs des
                  autres (dans une enchère, tu ne sais pas combien les autres sont prêts à payer).
                </>
              ),
            },
            {
              tag: "Répétition",
              title: "Non-répétés",
              body: (
                <>
                  Une fois que chacun a choisi, le résultat est réalisé et chacun reçoit son payoff.
                  Le jeu s'arrête : les joueurs <strong>ne se revoient plus jamais</strong>.
                </>
              ),
              extra: <>Le contraire : un jeu répété, où les mêmes joueurs se retrouvent encore et encore.</>,
            },
          ]}
        />
        <p>
          Le jeu du rendez-vous respecte bien ce cadre : aucun accord contraignant, chacun part de
          chez soi sans connaître le choix de l'autre, chacun connaît les préférences de l'autre,
          et on ne joue qu'une fois.
        </p>

        <Quiz
          scope="b1"
          id="q1"
          question={<>Laquelle de ces situations est une interaction stratégique ?</>}
          options={[
            {
              text: <>Un agriculteur choisit quoi planter en fonction de la météo.</>,
              explain: (
                <>
                  Non : sa récolte dépend de la météo, pas du choix d'un autre décideur. La nature
                  n'est pas un « joueur » qui maximise un payoff (c'était la situation de A3 :
                  décider face au hasard).
                </>
              ),
            },
            {
              text: (
                <>Deux stations-service fixent leur prix, et les clients vont à la moins chère.</>
              ),
              correct: true,
              explain: (
                <>
                  Oui ! Deux joueurs (les stations), un choix chacune (le prix), et les profits de
                  chacune dépendent des deux prix. Tous les ingrédients y sont.
                </>
              ),
            },
            {
              text: <>Tu choisis combien d'heures réviser pour l'examen d'ECGEB366.</>,
              explain: (
                <>
                  Non : il n'y a qu'un seul décideur. Réviser plus te donne une meilleure note quoi
                  qu'il arrive : le résultat ne dépend que de toi.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b1"
          id="q1-cadre"
          question={
            <>
              Deux stations-service voisines fixent leur prix <strong>chaque matin</strong>,
              pendant des années, chacune sans voir le prix de l'autre ce jour-là. Laquelle des
              quatre caractéristiques des jeux de B1 n'est <em>pas</em> respectée ?
            </>
          }
          options={[
            {
              text: <>Non-coopératif</>,
              explain: (
                <>
                  Elle est respectée : rien n'indique que les stations puissent signer un accord
                  contraignant (c'est d'ailleurs interdit entre concurrents).
                </>
              ),
            },
            {
              text: <>Simultané</>,
              explain: (
                <>
                  Elle est respectée : chaque matin, chaque station choisit sans connaître le prix
                  de l'autre ce jour-là.
                </>
              ),
            },
            {
              text: <>Non-répété</>,
              correct: true,
              explain: (
                <>
                  Exact : les deux stations se retrouvent tous les matins. C'est un jeu{" "}
                  <strong>répété</strong>, ce qui sort du cadre de B1 (où les joueurs ne se revoient
                  plus jamais).
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* S2 — Lire (et écrire) une matrice                             */}
      {/* ============================================================ */}
      <Section id="s2" kicker="§ 2" title="Lire (et écrire) une matrice de jeu">
        <Lead>
          La <strong>forme normale</strong> d'un jeu, c'est sa fiche d'identité : un tableau qui
          résume d'un coup d'œil les joueurs, leurs stratégies et tous les payoffs. C'est l'outil
          n° 1 du chapitre : si tu sais le lire les yeux fermés, toute la suite devient facile.
        </Lead>

        <H4>Les règles de lecture (slide 8)</H4>
        <p>La forme normale résume les composantes d'un jeu simultané :</p>
        <ul className={UL}>
          <li>
            <strong>les joueurs</strong> : le <span className="font-bold text-rose-700">joueur 1</span>{" "}
            (en rouge, ici <em>Vous</em>) est écrit à gauche, le{" "}
            <span className="font-bold text-sky-700">joueur 2</span> (en bleu, ici <em>Amie</em>)
            en haut ;
          </li>
          <li>
            chaque <strong>ligne</strong> correspond à une stratégie différente du joueur 1 ;
          </li>
          <li>
            chaque <strong>colonne</strong> correspond à une stratégie différente du joueur 2 ;
          </li>
          <li>
            la <strong>matrice des payoffs</strong> précise, pour chaque profil de stratégies
            (chaque « case »), le payoff de chaque joueur :{" "}
            <span className="font-bold text-rose-700">payoff du joueur 1</span> ;{" "}
            <span className="font-bold text-sky-700">payoff du joueur 2</span>.{" "}
            <em>Toujours dans cet ordre.</em>
          </li>
        </ul>

        <MatrixAnatomy />

        <p>
          Il y a 2 stratégies pour toi et 2 pour ton amie, donc <M tex="2 \times 2 = 4" /> profils
          possibles, donc 4 cases. Les 8 nombres de la matrice sont exactement les 8 payoffs du
          slide 7 (§ 1), rangés dans un tableau. À toi de jouer : clique sur chaque case pour
          retrouver l'histoire qui se cache derrière.
        </p>

        <MatrixExplorer />

        <Callout variant="methode" title="Méthode — construire une matrice depuis une histoire">
          <ol className={OL}>
            <li>
              Identifie les <strong>joueurs</strong> : l'un en lignes, l'autre en colonnes.
            </li>
            <li>
              Liste les <strong>stratégies</strong> de chacun : une ligne ou une colonne par
              stratégie.
            </li>
            <li>
              Pour <strong>chaque case</strong>, raconte-toi le scénario (« que se passe-t-il
              si… ? ») et additionne les éléments d'utilité de <em>chaque</em> joueur, un joueur à
              la fois.
            </li>
            <li>
              Contrôle : relis l'histoire et vérifie une ou deux cases au hasard.
            </li>
          </ol>
          <p>
            À l'examen, l'erreur la plus fréquente est d'inverser les deux nombres d'une case.
            Astuce : le premier nombre appartient <em>toujours</em> au joueur des lignes.
          </p>
        </Callout>

        <Quiz
          scope="b1"
          id="q2"
          question={
            <>
              Dans le jeu du rendez-vous, que vaut <M tex="u_A(R, H)" />, le payoff de ton amie
              quand <strong>tu</strong> joues Retard et <strong>elle</strong> joue Heure ?
            </>
          }
          options={[
            {
              text: <>0</>,
              explain: (
                <>Non. 0 correspond à la case (H, H) : personne n'attend, personne ne culpabilise.</>
              ),
            },
            {
              text: <>−1</>,
              explain: (
                <>
                  Attention : −1 est TON payoff dans cette case (tu la fais attendre). Le sien est
                  le deuxième nombre.
                </>
              ),
            },
            {
              text: <>−2</>,
              correct: true,
              explain: (
                <>
                  Exact ! Elle est à l'heure et doit t'attendre : −2. Convention : ligne = Vous
                  d'abord, donc (R, H) = ligne Retard, colonne Heure, deuxième nombre = −2.
                </>
              ),
            },
            {
              text: <>−3</>,
              explain: (
                <>
                  Non. −3 est son payoff en (R, R) : personne n'attend, mais elle est en retard
                  (−3 : elle est de type « ponctuelle »).
                </>
              ),
            },
          ]}
        />

        <H4>Et maintenant : prédire ce que les joueurs vont faire</H4>
        <p>
          Savoir <em>décrire</em> un jeu ne dit pas encore ce que les joueurs vont choisir. Pour
          tenter de prédire le résultat, la théorie des jeux fait des{" "}
          <strong>hypothèses sur le comportement des joueurs</strong> (slide 11). La base, c'est
          H1 : les joueurs sont rationnels. Ensuite, pour des prédictions plus précises, on ajoute
          à H1 une hypothèse sur ce que les joueurs <em>savent</em> (H2) ou sur ce qu'ils{" "}
          <em>anticipent</em> (H3). Chaque combinaison donne un « concept de solution » :
        </p>
        <HypothesisMap />
        <p>
          Attention à la forme du schéma : H2 et H3 sont deux ajouts <strong>séparés</strong> à
          H1, pas les marches d'un escalier. L'équilibre de Nash repose sur H1 et H3, pas sur H2
          (on y reviendra en § 6). Les § 3 et § 4 traitent les deux premières cartes.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* S3 — Stratégies dominantes & dominées (H1)                    */}
      {/* ============================================================ */}
      <Section id="s3" kicker="§ 3 · Hypothèse 1" title="Stratégies dominantes & dominées">
        <Lead>
          Première hypothèse, la plus naturelle : les joueurs sont rationnels. Elle suffit parfois
          à prédire le résultat d'un jeu, comme dans le célèbre dilemme du prisonnier… qui explique
          l'inertie climatique du slide 2 (slides 11 à 20).
        </Lead>

        <Callout variant="definition" title="Hypothèse 1 (H1) — les joueurs sont rationnels">
          <p>
            Un joueur rationnel choisit sa stratégie de manière à{" "}
            <strong>maximiser son payoff</strong>.
          </p>
          <p>
            <strong>Implications de H1</strong> : les joueurs rationnels
          </p>
          <ul className={UL}>
            <li>
              <strong>utilisent leur stratégie dominante</strong> quand ils en ont une,
            </li>
            <li>
              <strong>n'utilisent pas leurs stratégies dominées</strong>.
            </li>
          </ul>
          <p>Reste à définir ces deux mots : c'est tout l'objet de ce paragraphe.</p>
        </Callout>

        <H4>Stratégie dominante : « le meilleur choix, quoi que fassent les autres » (slide 11)</H4>
        <Callout variant="definition" title="Définition — stratégie dominante">
          <p>
            Une stratégie est <strong>dominante</strong> si, quoi que fassent les autres joueurs,
            cette stratégie est le meilleur choix du joueur. Formellement, la stratégie{" "}
            <M tex="s_i^*" /> est dominante pour le joueur <M tex="i" /> si
          </p>
          <MB tex="u_i(s_i^*, s_{-i}) \;\ge\; u_i(s_i', s_{-i})" />
          <p>
            pour <strong>toutes</strong> les autres stratégies <M tex="s_i'" /> et pour{" "}
            <strong>tous</strong> les <M tex="s_{-i}" />.
          </p>
        </Callout>
        <p>Lis la formule morceau par morceau :</p>
        <ul className={UL}>
          <li>
            <M tex="u_i(s_i^*, s_{-i})" /> : ce que <M tex="i" /> obtient en jouant{" "}
            <M tex="s_i^*" /> quand les autres jouent <M tex="s_{-i}" /> ;
          </li>
          <li>
            <M tex="u_i(s_i', s_{-i})" /> : ce qu'il obtiendrait avec une autre stratégie{" "}
            <M tex="s_i'" />, face aux <em>mêmes</em> choix des autres ;
          </li>
          <li>
            <M tex="\ge" /> : <M tex="s_i^*" /> rapporte au moins autant ;
          </li>
          <li>
            « pour tous les <M tex="s_{-i}" /> » : et cela <em>quoi que fassent les autres</em>.
            C'est le cœur de la définition.
          </li>
        </ul>

        <H4>Exemple : la stratégie Heure de ton amie (slide 12)</H4>
        <p>
          Vérifier qu'une stratégie est dominante, c'est vérifier le{" "}
          <strong>système d'inégalités</strong> de la définition. Ton amie n'a qu'une autre
          stratégie (R) et toi, tu as deux choix possibles (H ou R) : il y a donc deux inégalités à
          vérifier, une pour chacun de tes choix.
        </p>
        <ul className={UL}>
          <li>
            Si <strong>tu joues H</strong> : <M tex="u_A(H, H) > u_A(H, R)" />, soit{" "}
            <M tex="0 > -4" /> ✔
          </li>
          <li>
            Si <strong>tu joues R</strong> : <M tex="u_A(R, H) > u_A(R, R)" />, soit{" "}
            <M tex="-2 > -3" /> ✔
          </li>
        </ul>
        <p>
          Quoi que tu fasses, H est le meilleur choix de ton amie :{" "}
          <strong>H est dominante pour ton amie</strong>. Intuition : être en retard lui coûte
          tellement (−3) qu'elle préfère toujours être à l'heure, même si cela l'oblige à
          t'attendre.
        </p>
        <p>
          Et toi ? Si elle joue H, tu préfères H (<M tex="u_V(H, H) = 0 > u_V(R, H) = -1" />) ;
          si elle joue R, tu préfères R (<M tex="u_V(R, R) = 0 > u_V(H, R) = -2" />). Ton meilleur
          choix <em>dépend</em> du sien : <strong>tu n'as pas de stratégie dominante</strong>.
        </p>

        <H4>L'équilibre en stratégies dominantes (ESD) (slide 13)</H4>
        <p>
          Dans certains jeux, la notion de stratégie dominante suffit pour prédire un résultat
          unique : c'est le cas lorsque <em>tous</em> les joueurs ont une stratégie dominante.
        </p>
        <Callout variant="definition" title="Définition — ESD">
          <p>
            Le profil de stratégies <M tex="(s_1, \dots, s_n)" /> est un{" "}
            <strong>équilibre en stratégies dominantes</strong> (ESD) si <M tex="s_i" /> est une
            stratégie dominante pour <strong>tous</strong> les joueurs <M tex="i" />.
          </p>
          <p>Il ne repose que sur H1 : chacun joue sa stratégie dominante.</p>
        </Callout>
        <p>
          Dans le jeu du rendez-vous, toi, tu n'as pas de stratégie dominante : ce jeu{" "}
          <strong>n'admet donc pas d'ESD</strong> (slide 13). Pas de prédiction par ce chemin…
          Mais certains jeux très importants ont un ESD.
        </p>

        <H4>⭐ Le dilemme du prisonnier (slides 14 et 15)</H4>
        <p>
          C'est l'un des jeux les plus connus. Deux prisonniers sont détenus dans des cellules
          séparées. La police les soupçonne d'un crime commis ensemble, mais n'a pas de preuves.
          Elle demande à chacun s'il plaide coupable (<strong>Confesser</strong>) ou innocent (
          <strong>Nier</strong>). Le nombre d'années de prison de chacun dépend des deux réponses.
          On identifie le payoff d'un prisonnier à <strong>3 moins son nombre d'années</strong> de
          prison :
        </p>
        <div className="my-4 overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-[14.5px] leading-snug">
            <thead>
              <tr className="bg-muted/60 text-left text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Situation d'un prisonnier</th>
                <th className="px-3 py-2">Prison</th>
                <th className="px-3 py-2">Payoff</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Les deux nient", "1 an", "3 − 1 = 2"],
                ["Les deux confessent", "2 ans", "3 − 2 = 1"],
                ["Il nie, l'autre confesse", "3 ans", "3 − 3 = 0"],
                ["Il confesse, l'autre nie", "0 an", "3 − 0 = 3"],
              ].map(([sit, yrs, pay]) => (
                <tr key={sit} className="border-t">
                  <td className="px-3 py-2">{sit}</td>
                  <td className="whitespace-nowrap px-3 py-2">{yrs}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold tabular-nums">{pay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Le « 3 » sert juste à obtenir des nombres positifs : ce qui compte, c'est que moins de
          prison donne plus de payoff. La forme normale du jeu devient (slide 14) :
        </p>

        <PayoffMatrix
          rowPlayer="Prisonnier 1"
          colPlayer="Prisonnier 2"
          rows={["Nier", "Confesser"]}
          cols={["Nier", "Confesser"]}
          payoffs={PD_CELLS}
          highlight={[[1, 1]]}
          caption={<>Dilemme du prisonnier (slide 14). La case encadrée est l'ESD : preuve juste en dessous.</>}
        />

        <ProofSteps>
          <ProofStep n={1} title="Prisonnier 1, si l'autre nie">
            <p>
              Confesser lui rapporte 3, Nier 2 : <M tex="u_1(C, N) = 3 > u_1(N, N) = 2" /> ✔
            </p>
          </ProofStep>
          <ProofStep n={2} title="Prisonnier 1, si l'autre confesse">
            <p>
              Confesser lui rapporte 1, Nier 0 : <M tex="u_1(C, C) = 1 > u_1(N, C) = 0" /> ✔. Donc
              Confesser est dominante pour le prisonnier 1.
            </p>
          </ProofStep>
          <ProofStep n={3} title="Prisonnier 2 : même raisonnement">
            <p>
              Le jeu est symétrique (les deux prisonniers sont dans la même situation) : Confesser
              est aussi dominante pour le prisonnier 2.
            </p>
          </ProofStep>
          <ProofStep n={4} title="Conclusion (slide 15)" tag="H1">
            <p>
              Confesser est dominante pour chacun. Par H1, chacun joue sa stratégie dominante :{" "}
              <strong>(C, C) est un ESD</strong>, et chaque prisonnier obtient 1.
            </p>
          </ProofStep>
        </ProofSteps>

        <p>
          Le paradoxe : sous (N, N), chacun obtiendrait 2 au lieu de 1. Le résultat associé à l'ESD
          est donc <strong>dominé au sens de Pareto</strong> par le résultat associé à (N, N)
          (slide 15).
        </p>
        <Callout variant="definition" title="Rappel — dominé au sens de Pareto (chapitre A1)">
          <p>
            Un résultat en domine un autre au sens de Pareto si <em>tous</em> les joueurs y sont au
            moins aussi bien, et au moins un strictement mieux. Ici, (N, N) donne (2 ; 2) et (C, C)
            donne (1 ; 1) : les deux prisonniers sont strictement mieux en (N, N).
          </p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <TheoryRef chapter="a1" section="pareto" />
          </p>
        </Callout>
        <Callout variant="retiens" title="La difficulté du dilemme du prisonnier (slide 15)">
          <p>
            Les <strong>incitants individuels</strong> (les stratégies dominantes) ne sont pas
            alignés sur les <strong>intérêts collectifs</strong> (un résultat efficace au sens de
            Pareto). Chacun, en faisant ce qui est le mieux <em>pour lui</em> quoi que fasse
            l'autre, aboutit à un résultat moins bon <em>pour les deux</em>.
          </p>
        </Callout>

        <PollPrisoner />
        <p>
          <strong>Et au labo ?</strong> Dans le dilemme du prisonnier joué au cours, 96 % des
          étudiants ont joué leur stratégie dominante (trahir, c'est-à-dire confesser) (slide 39).
          Pourquoi pas 100 % ? Selon J. Roemer, certains joueurs raisonnent de manière «{" "}
          <strong>kantienne</strong> » : « que se passerait-il si <em>tout le monde</em> faisait
          comme moi ? ». Ce raisonnement est rationnel pour le groupe, pas pour l'individu. On le
          détaille en § 7, avec les autres données du labo.
        </p>

        <H4>Le dilemme du prisonnier est partout (slide 16)</H4>
        <p>
          Beaucoup de situations ont la même structure : tous souhaitent la coopération, mais
          trahir est individuellement dominant.
        </p>
        <CardGrid
          items={[
            {
              tag: "Climat",
              title: "Des États souhaitent agir contre le changement climatique",
              body: <>Coopérer = investir dans le vert ; trahir = rester aux énergies fossiles (détaillé juste après).</>,
            },
            {
              tag: "Ressource commune",
              title: "Des villageois souhaitent ne pas surexploiter une ressource commune",
              body: (
                <>
                  Pêche, pâturage, forêt : chacun a intérêt à prélever un peu plus ; si tous le
                  font, la ressource s'épuise.
                </>
              ),
            },
            {
              tag: "Armement",
              title: "Deux superpuissances souhaitent ne pas investir encore plus dans leur arsenal nucléaire",
              body: <>Chacune a intérêt à s'armer davantage, quoi que fasse l'autre.</>,
            },
            {
              tag: "Sport",
              title: "Des coureurs cyclistes souhaitent ne pas se doper",
              body: <>Se doper améliore ses chances, que les autres se dopent ou non.</>,
            },
            {
              tag: "Entreprises",
              title: "Deux firmes concurrentes souhaitent ne pas trop dépenser en publicité",
              body: <>La pub de l'une attire les clients de l'autre : chacune finit par en faire trop.</>,
            },
          ]}
        />

        <H4>Application : deux États face au climat (slide 17)</H4>
        <p>
          Deux États souhaitent lutter contre le changement climatique. Chaque pays peut{" "}
          <strong>coopérer</strong> (investir dans des technologies de production vertes) ou{" "}
          <strong>trahir</strong> (continuer à utiliser des technologies basées sur les énergies
          fossiles). Le payoff d'un pays vaut la somme de <strong>5</strong> et de :
        </p>
        <ul className={UL}>
          <li>
            <strong>−3</strong> si le pays coopère (coût d'investissement) ;
          </li>
          <li>
            <strong>−2 pour chaque pays qui trahit</strong> (externalité de pollution : la
            pollution touche tout le monde, y compris le pays qui, lui, ne pollue pas).
          </li>
        </ul>
        <p>On calcule les quatre cases, un pays à la fois :</p>
        <div className="my-4 overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-[14.5px] leading-snug">
            <thead>
              <tr className="bg-muted/60 text-left text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Profil (Pays 1, Pays 2)</th>
                <th className="px-3 py-2 text-rose-700">Pays 1</th>
                <th className="px-3 py-2 text-sky-700">Pays 2</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["(C, C)", "5 − 3 = 2", "5 − 3 = 2"],
                ["(C, T)", "5 − 3 − 2 = 0", "5 − 2 = 3"],
                ["(T, C)", "5 − 2 = 3", "5 − 3 − 2 = 0"],
                ["(T, T)", "5 − 2 − 2 = 1", "5 − 2 − 2 = 1"],
              ].map(([prof, a, b]) => (
                <tr key={prof} className="border-t">
                  <td className="whitespace-nowrap px-3 py-2 font-semibold">{prof}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{a}</td>
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PayoffMatrix
          rowPlayer="Pays 1"
          colPlayer="Pays 2"
          rows={["Coopérer", "Trahir"]}
          cols={["Coopérer", "Trahir"]}
          payoffs={PD_CELLS}
          caption={<>Le jeu du climat (slide 17) : exactement les nombres du dilemme du prisonnier.</>}
        />
        <p>
          Trahir est dominante pour chaque pays (face à C : <M tex="3 > 2" /> ; face à T :{" "}
          <M tex="1 > 0" />) : <strong>(T, T) est l'ESD</strong>, et il est dominé au sens de
          Pareto par (C, C). Voilà l'<strong>inertie malgré le consensus</strong> du slide 2 :
          tous voudraient (C, C), mais chacun a intérêt à trahir, quoi que fasse l'autre.
        </p>
        <Callout variant="intuition" title="💡 Pourquoi trahir est-il dominant ?">
          <p>
            Quand un pays passe de Trahir à Coopérer, il paie seul le coût (−3), mais la pollution
            évitée (+2) profite à <em>chacun</em> des deux pays. Pour lui : <M tex="-3 + 2 = -1" />,
            il y perd, quoi que fasse l'autre. Pour le monde : <M tex="-3 + 2 + 2 = +1" />, on y
            gagne. Le coût est privé, le bénéfice est partagé : c'est la racine de tous les
            dilemmes du prisonnier.
          </p>
        </Callout>
        <p>
          La solution du slide 17 : <strong>les pays signent un accord qui inflige une pénalité à
          chaque pays qui trahit l'accord</strong>. La pénalité modifie les payoffs, donc le jeu
          lui-même. Quelle pénalité suffit ? C'est l'objet de l'exercice qui suit (le slide ne
          chiffre pas la pénalité : on la note <M tex="t" />).
        </p>
        <Callout variant="attention" title="Tu te demandes peut-être… un accord, dans un jeu non-coopératif ?">
          <p>
            Oui, et ce n'est pas contradictoire. L'accord ne dicte pas ce que chaque pays jouera :
            il change seulement les payoffs (une pénalité en cas de trahison). Ensuite, chaque pays
            choisit seul, sans connaître le choix de l'autre. Le jeu reste non-coopératif.
          </p>
        </Callout>

        <ExerciseBlock
          scope="b1"
          id="ex1"
          number={1}
          title="Sauver le climat en changeant les payoffs"
          difficulty={1}
          statement={
            <>
              <p>
                Reprends le jeu du climat ci-dessus (payoff d'un pays = 5, −3 s'il coopère, −2 par
                pays qui trahit).
              </p>
              <p>
                <strong>a)</strong> Vérifie que Trahir est dominante pour chaque pays (écris les
                inégalités).
                <br />
                <strong>b)</strong> Les pays signent un accord : toute trahison coûte une pénalité{" "}
                <M tex="t > 0" /> au pays qui trahit. Réécris la matrice.
                <br />
                <strong>c)</strong> Pour quelles valeurs de <M tex="t" /> Coopérer devient-elle
                une stratégie dominante ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) Trahir est dominante pour chaque pays",
              content: (
                <p>
                  Pour le Pays 1 : si le Pays 2 coopère, <M tex="u_1(T, C) = 3 > u_1(C, C) = 2" />{" "}
                  ✔ ; si le Pays 2 trahit, <M tex="u_1(T, T) = 1 > u_1(C, T) = 0" /> ✔. Le jeu est
                  symétrique : même chose pour le Pays 2. Trahir est dominante pour chacun, et
                  (T, T) est l'ESD, dominé au sens de Pareto par (C, C).
                </p>
              ),
            },
            {
              title: "b) Réécrire la matrice avec la pénalité t",
              content: (
                <>
                  <p>
                    On soustrait <M tex="t" /> au payoff du pays qui trahit, et à lui seul : (T, C)
                    donne <M tex="3 - t" /> au Pays 1 ; (T, T) donne <M tex="1 - t" /> à chacun. Les
                    payoffs d'un pays qui coopère ne changent pas.
                  </p>
                  <SymbolicMatrix
                    rowPlayer="Pays 1"
                    colPlayer="Pays 2"
                    rows={["Coopérer", "Trahir"]}
                    cols={["Coopérer", "Trahir"]}
                    cells={[
                      [
                        [<M key="a" tex="2" />, <M key="b" tex="2" />],
                        [<M key="a" tex="0" />, <M key="b" tex="3 - t" />],
                      ],
                      [
                        [<M key="a" tex="3 - t" />, <M key="b" tex="0" />],
                        [<M key="a" tex="1 - t" />, <M key="b" tex="1 - t" />],
                      ],
                    ]}
                  />
                </>
              ),
            },
            {
              title: "c) Quand Coopérer devient-elle dominante ?",
              content: (
                <>
                  <p>
                    Coopérer est dominante pour le Pays 1 si elle rapporte au moins autant que
                    Trahir face à chaque choix du Pays 2 :
                  </p>
                  <ul className={UL}>
                    <li>
                      face à C : <M tex="2 \ge 3 - t \iff t \ge 1" /> ;
                    </li>
                    <li>
                      face à T : <M tex="0 \ge 1 - t \iff t \ge 1" />.
                    </li>
                  </ul>
                  <p>
                    Les deux conditions donnent <strong><M tex="t \ge 1" /></strong> (même chose
                    pour le Pays 2, par symétrie). Cas limite <M tex="t = 1" /> : les deux
                    inégalités deviennent des égalités (<M tex="2 = 2" /> et <M tex="0 = 0" />) ;
                    chaque pays est indifférent entre C et T, quoi que fasse l'autre. Dès que{" "}
                    <M tex="t > 1" />, les inégalités sont strictes : Coopérer est strictement
                    meilleure.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              Dès que <M tex="t > 1" />, Coopérer devient strictement dominante et (C, C) est
              l'unique ESD : l'accord a littéralement <em>changé le jeu</em>. À <M tex="t = 1" />{" "}
              exactement, chaque pays est indifférent entre C et T (avec la définition ≥ du cours,
              les deux stratégies sont alors dominantes et les quatre profils sont des ESD). Dans le
              modèle, une pénalité trop faible (<M tex="t < 1" />) ne change rien : trahir reste
              dominant.
            </p>
          }
        />

        <ClimatePenalty />

        <Callout variant="attention" title="⚠️ Limitation théorique de l'ESD (slide 18)">
          <p>
            <strong>Beaucoup de jeux n'ont aucun ESD.</strong> L'ESD n'offre aucune prédiction dans
            les jeux où au moins un joueur n'a pas de stratégie dominante. Comme dans le jeu du
            rendez-vous : ton amie a une stratégie dominante (H), mais pas toi, donc pas d'ESD et
            pas de prédiction.
          </p>
        </Callout>

        <H4>Stratégie dominée : « il existe toujours mieux » (slide 18)</H4>
        <p>
          L'autre implication de H1 : les joueurs ne choisissent pas leurs stratégies dominées.
        </p>
        <Callout variant="definition" title="Définition — stratégie dominée">
          <p>
            Une stratégie est <strong>dominée</strong> s'il existe une autre stratégie qui, quoi
            que fassent les autres joueurs, apporte un plus grand payoff que la stratégie dominée.
            Formellement, la stratégie <M tex="s_i" /> est dominée par la stratégie{" "}
            <M tex="s_i'" /> si
          </p>
          <MB tex="u_i(s_i', s_{-i}) \;\ge\; u_i(s_i, s_{-i}) \qquad \text{pour tous les } s_{-i}." />
        </Callout>
        <Callout variant="examen" title="Le signe ≥ compte">
          <p>
            La définition formelle utilise <M tex="\ge" /> : une <strong>égalité</strong> est
            permise face à certains choix des autres. Tu en verras une dans le jeu à trois
            stratégies ci-dessous, et c'est grâce à elle que l'élimination du § 4 fonctionne.
          </p>
        </Callout>
        <p>
          <strong>Exemple (slide 19).</strong> Pour ton amie, la stratégie R est dominée par la
          stratégie H : si tu joues H, <M tex="u_A(H, H) = 0 > u_A(H, R) = -4" /> ; si tu joues R,{" "}
          <M tex="u_A(R, H) = -2 > u_A(R, R) = -3" />. Ce sont exactement les inégalités du slide
          12. Normal : avec deux stratégies, « H est dominante » et « R est dominée par H » disent
          la même chose.
        </p>

        <H4>Dominée sans dominante : le jeu à trois stratégies (slide 20)</H4>
        <p>
          « Dominante » compare une stratégie à <strong>toutes</strong> les autres. « Dominée »
          compare une stratégie à <strong>une seule</strong> autre. Avec deux stratégies, les deux
          notions coïncident ; avec trois ou plus, non. Dans le jeu suivant, chaque joueur a trois
          stratégies : P1 choisit la ligne (H, M ou B), P2 la colonne (g, m ou d).
        </p>
        <PayoffMatrix
          rowPlayer="P1"
          colPlayer="P2"
          rows={["H", "M", "B"]}
          cols={["g", "m", "d"]}
          payoffs={G3_CELLS}
          caption={<>Le jeu à trois stratégies (slide 20). Il servira d'exemple au § 4.</>}
        />
        <p>
          Pour <span className="font-bold text-sky-700">P2</span>, la stratégie <strong>d</strong>{" "}
          est dominée par la stratégie <strong>m</strong>. On compare les payoffs bleus des
          colonnes m et d, ligne par ligne :
        </p>
        <ul className={UL}>
          <li>
            si P1 joue H : <M tex="u_2(H, m) = 0 \ge u_2(H, d) = 0" /> (égalité, permise par{" "}
            <M tex="\ge" />) ;
          </li>
          <li>
            si P1 joue M : <M tex="u_2(M, m) = 2 > u_2(M, d) = 0" /> ;
          </li>
          <li>
            si P1 joue B : <M tex="u_2(B, m) = 4 > u_2(B, d) = 0" />.
          </li>
        </ul>
        <p>
          Pourtant, P2 n'a <em>pas</em> de stratégie dominante : face à H ou à M, son meilleur
          choix est g (2 et 6) ; face à B, c'est m (4). Aucune de ses stratégies n'est la meilleure
          dans tous les cas. Conclusion du slide 20 :{" "}
          <strong>dans ce jeu, P2 a une stratégie dominée sans avoir de stratégie dominante</strong>
          . (Bonus : d est aussi dominée par g, car <M tex="2 \ge 0" />, <M tex="6 \ge 0" /> et{" "}
          <M tex="0 \ge 0" />.)
        </p>
        <p>
          Et P1 ? Dans ce jeu complet, aucune de ses stratégies n'est dominée. Par exemple, M n'est
          pas dominée par B : face à d, M rapporte 3 et B seulement 2. Vérifie-le toi-même :
        </p>

        <DominanceLab />

        <Quiz
          scope="b1"
          id="q3-dom"
          question={
            <>
              Un joueur a trois stratégies, et l'une d'elles est dominée. Peut-on en conclure qu'il
              a une stratégie dominante ?
            </>
          }
          options={[
            {
              text: <>Oui : la stratégie qui domine la stratégie dominée est forcément dominante.</>,
              explain: (
                <>
                  Non. Dans le jeu 3×3, m domine d, mais m n'est pas dominante : si P1 joue H, g
                  rapporte 2 à P2 et m seulement 0.
                </>
              ),
            },
            {
              text: <>Non, pas forcément.</>,
              correct: true,
              explain: (
                <>
                  Exact. « Dominée » compare deux stratégies, « dominante » compare une stratégie à
                  toutes les autres. Avec trois stratégies ou plus, on peut avoir une stratégie
                  dominée sans stratégie dominante (slide 20).
                </>
              ),
            },
            {
              text: <>Oui, mais seulement si le jeu a un ESD.</>,
              explain: (
                <>
                  Non : l'ESD exige que <em>tous</em> les joueurs aient une stratégie dominante, ce
                  qui ne dit rien sur ce cas. La bonne réponse est « pas forcément ».
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* S4 — L'élimination itérative (H2 → PSS)                       */}
      {/* ============================================================ */}
      <Section id="s4" kicker="§ 4 · Hypothèse 2" title="L'élimination itérative (PSS)">
        <Lead>
          Les stratégies dominées permettent d'éliminer plus de choix que les stratégies
          dominantes… mais rarement assez pour une prédiction précise. Le cours ajoute donc une
          hypothèse sur ce que les joueurs savent les uns des autres (slides 21 à 25).
        </Lead>

        <H4>Pourquoi une deuxième hypothèse ? (slide 21)</H4>
        <p>
          Le jeu à trois stratégies du § 3 montre que la notion de stratégie <em>dominée</em>{" "}
          permet d'« éliminer » plus de stratégies que celle de stratégie <em>dominante</em> : P2
          n'a pas de stratégie dominante, mais on peut quand même rayer d. Pourtant, dans
          beaucoup de jeux, cela ne suffit pas pour une prédiction précise, car beaucoup des
          stratégies de chaque joueur ne sont pas dominées. Dans le jeu 3×3, une fois d rayée, il
          reste encore <M tex="3 \times 2 = 6" /> profils possibles.
        </p>
        <p>
          Pour obtenir des prédictions plus précises, la théorie des jeux fait des hypothèses
          supplémentaires, qui portent sur{" "}
          <strong>
            la connaissance que les joueurs ont de la manière dont leurs adversaires raisonnent
          </strong>
          .
        </p>

        <H4>Hypothèse 2 : la rationalité de tous est connue de tous (slide 22)</H4>
        <p>
          L'hypothèse suivante est qu'il est <strong>de notoriété publique</strong> que tous les
          joueurs sont rationnels.
        </p>
        <Callout
          variant="definition"
          title={
            <>
              Hypothèse 2 (H2) — connaissance réciproque de la rationalité (
              <em>common knowledge of rationality</em>)
            </>
          }
        >
          <p>Chaque joueur :</p>
          <ul className={UL}>
            <li>
              <strong>H2.1</strong> : sait que ses adversaires sont rationnels ;
            </li>
            <li>
              <strong>H2.2</strong> : sait que ses adversaires savent que leurs adversaires sont
              rationnels ;
            </li>
            <li>
              <strong>H2.3</strong> : sait que ses adversaires savent que leurs adversaires savent
              que leurs adversaires sont rationnels ;
            </li>
            <li>etc.</li>
          </ul>
          <p>
            <strong>Implications de H2</strong> : chaque joueur
          </p>
          <ul className={UL}>
            <li>anticipe que ses adversaires ne jouent pas de stratégies dominées (H2.1),</li>
            <li>
              anticipe que ses adversaires anticipent que leurs adversaires ne jouent pas de
              stratégies dominées (H2.2),
            </li>
            <li>etc.</li>
          </ul>
        </Callout>
        <p>
          Ça a l'air vertigineux, mais avec deux joueurs, c'est plus simple qu'il n'y paraît : «
          ses adversaires », c'est l'autre joueur, et « leurs adversaires », c'est… toi. Ainsi,
          H2.1 dit « je sais que tu es rationnel·le », H2.2 dit « je sais que tu sais que je suis
          rationnel·le », et ainsi de suite :
        </p>

        <KnowledgeNest />

        <p>
          Chaque niveau de H2 autorise <strong>une étape de raisonnement de plus</strong>. On va
          le voir sur nos deux exemples.
        </p>

        <H4>Retour au rendez-vous : la réponse du slide 5 (slide 23)</H4>
        <p>
          Dans le jeu du rendez-vous, H2 amène à prédire le profil <strong>(H, H)</strong>. La
          raison : tu anticipes que ton amie ne jouera pas R. Pour être complet :
        </p>
        <ProofSteps>
          <ProofStep n={1} tag="H1" title="Les joueurs rationnels ne jouent pas de stratégies dominées">
            <p>C'est la deuxième implication de H1 (§ 3).</p>
          </ProofStep>
          <ProofStep n={2} title="Pour ton amie, R est dominée par H">
            <p>
              Vérifié au § 3 : <M tex="0 > -4" /> si tu joues H, et <M tex="-2 > -3" /> si tu
              joues R.
            </p>
          </ProofStep>
          <ProofStep n={3} tag="H2.1" title="Tu anticipes donc que ton amie jouera H">
            <p>
              Tu sais qu'elle est rationnelle : elle ne jouera pas R. Pour toi, le jeu se réduit à
              sa colonne H :
            </p>
            <PayoffMatrix
              rowPlayer="Vous"
              colPlayer="Amie"
              rows={["Heure", "Retard"]}
              cols={["Heure"]}
              payoffs={[[[0, 0]], [[-1, -2]]]}
              caption={<>Le jeu réduit que tu considères : ton amie ne joue pas R.</>}
            />
          </ProofStep>
          <ProofStep n={4} tag="H1" title="Tu joues H">
            <p>
              Face à H, tu choisis ta meilleure option : <M tex="u_V(H, H) = 0 > u_V(R, H) = -1" />
              .
            </p>
          </ProofStep>
        </ProofSteps>
        <p>
          Prédiction : <strong>(H, H)</strong>, vous arrivez tous les deux à l'heure. C'est la
          réponse à la question du slide 5 (§ 0). Remarque : ton amie n'a besoin que de H1 (H est
          dominante pour elle) ; toi, tu as besoin de H1 <em>et</em> de H2.1 (tu dois savoir
          qu'elle est rationnelle).
        </p>

        <H4>Le jeu à trois stratégies, itération par itération (slides 24 et 25)</H4>
        <p>
          Quelles sont les implications de H2 pour notre jeu à trois stratégies ? On applique le
          même raisonnement en boucle : on raye une stratégie dominée, on regarde le{" "}
          <strong>jeu réduit</strong> qui reste, on y cherche une nouvelle stratégie dominée, et
          ainsi de suite. Chaque tour de boucle (chaque <strong>itération</strong>) s'appuie sur
          un niveau de plus de H2.
        </p>
        <ProofSteps>
          <ProofStep n={0} tag="H1" title="Départ : d est dominée par m, donc P2 ne la jouera pas">
            <p>
              Vu au § 3 : face à H, M et B, la colonne m rapporte à P2 au moins autant que d (
              <M tex="0 \ge 0" />, <M tex="2 > 0" />, <M tex="4 > 0" />
              ). Un P2 rationnel ne joue pas d. À ce stade, aucune stratégie de P1 n'est dominée.
            </p>
          </ProofStep>
          <ProofStep n={1} tag="H2.1" title="Itération 1 : P1 sait que P2 est rationnel">
            <p>Par H2.1, P1 sait que P2 ne jouera pas d. Il considère le jeu réduit suivant :</p>
            <PayoffMatrix
              rowPlayer="P1"
              colPlayer="P2"
              rows={["H", "M", "B"]}
              cols={["g", "m"]}
              payoffs={[
                [
                  [4, 2],
                  [0, 0],
                ],
                [
                  [0, 6],
                  [1, 2],
                ],
                [
                  [0, 0],
                  [2, 4],
                ],
              ]}
              caption={<>Itération 1 : le jeu réduit, sans d (slide 24).</>}
            />
            <p>
              Dans ce jeu réduit, <strong>M est dominée par B</strong> : face à g,{" "}
              <M tex="u_1(B, g) = 0 \ge u_1(M, g) = 0" /> ; face à m,{" "}
              <M tex="u_1(B, m) = 2 > u_1(M, m) = 1" />. Un P1 rationnel (H1) ne joue donc pas M.
            </p>
            <p>
              <strong>Attention :</strong> dans le jeu complet, M n'était <em>pas</em> dominée par
              B, car face à d, M rapportait 3 et B seulement 2. C'est la disparition de d qui rend
              M dominée : c'est tout le sens du mot « itératif ».
            </p>
          </ProofStep>
          <ProofStep n={2} tag="H2.2" title="Itération 2 : P2 sait que P1 sait que P2 est rationnel">
            <p>Par H2.2, P1 et P2 considèrent le jeu réduit suivant :</p>
            <PayoffMatrix
              rowPlayer="P1"
              colPlayer="P2"
              rows={["H", "B"]}
              cols={["g", "m"]}
              payoffs={[
                [
                  [4, 2],
                  [0, 0],
                ],
                [
                  [0, 0],
                  [2, 4],
                ],
              ]}
              caption={<>Itération 2 : le jeu réduit, sans d ni M (slide 25).</>}
            />
            <p>
              Pourquoi H2.2 ? Pour rayer M à son tour, P2 doit suivre le raisonnement de P1. Or P1
              n'a rayé M que parce qu'il sait que P2 est rationnel. P2 doit donc savoir que P1 sait
              que P2 est rationnel : c'est H2.2 (avec H2.1 : P2 sait aussi que P1 est rationnel et
              ne joue donc pas M).
            </p>
            <p>Dans ce jeu réduit, aucun des deux joueurs n'a de stratégie dominée :</p>
            <ul className={UL}>
              <li>
                P1 : face à g, H (4) bat B (0) ; face à m, B (2) bat H (0). Ni H ni B n'est
                dominée.
              </li>
              <li>
                P2 : face à H, g (2) bat m (0) ; face à B, m (4) bat g (0). Ni g ni m n'est
                dominée.
              </li>
            </ul>
            <p>
              <strong>Le processus d'élimination s'arrête.</strong>
            </p>
          </ProofStep>
        </ProofSteps>

        <p>Revois les mêmes étapes en animation, case par case :</p>
        <IteratedElimination />

        <Callout variant="definition" title="Définition — PSS (slide 25)">
          <p>
            Les profils de stratégies qui n'ont pas été éliminés par H2 s'appellent les{" "}
            <strong>profils de stratégies survivants</strong> au processus d'élimination itérative
            des stratégies dominées : les <strong>PSS</strong>. Le PSS repose sur H1 et H2.
          </p>
          <p>
            Dans notre jeu, les quatre profils (H, g), (H, m), (B, g) et (B, m) sont des PSS.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Limitation théorique des PSS (slide 25)">
          <p>
            <strong>Beaucoup de jeux ont de nombreux PSS.</strong> Les prédictions faites par le
            concept de PSS sont alors souvent peu précises, comme dans notre jeu à trois
            stratégies : 4 profils survivent sur les 9 de départ, et la théorie ne dit pas lequel
            sera joué. Pour aller plus loin, il faudra une autre hypothèse, H3 (§ 5).
          </p>
        </Callout>
        <p>
          Petit aperçu : le jeu 2×2 qui survit a exactement la structure de la{" "}
          <strong>bataille des sexes</strong> du § 5 (slide 27), avec les mêmes nombres 4 ; 2,
          0 ; 0, 0 ; 0 et 2 ; 4. Tu y verras que, parmi ces quatre PSS, seuls (H, g) et (B, m)
          sont des équilibres de Nash.
        </p>

        <Callout variant="methode" title="Méthode — l'élimination itérative à l'examen">
          <ol className={OL}>
            <li>
              Pour chaque joueur, cherche une stratégie dominée : compare deux stratégies du même
              joueur, case par case, avec <M tex="\ge" />.
            </li>
            <li>Raye-la et écris le jeu réduit.</li>
            <li>
              Recommence dans le jeu réduit : une stratégie qui n'était pas dominée peut le
              devenir.
            </li>
            <li>
              Arrête-toi quand plus aucune stratégie n'est dominée : les profils restants sont les
              PSS.
            </li>
            <li>
              Pour chaque étape, nomme l'hypothèse qui la justifie : H1 pour la première
              élimination, puis H2.1, H2.2… pour chaque itération.
            </li>
          </ol>
        </Callout>

        <Quiz
          scope="b1"
          id="q3"
          question={
            <>
              Quelles hypothèses sont <em>nécessaires</em> pour justifier la deuxième itération
              d'élimination dans le jeu 3×3 (celle où P1 et P2 raisonnent sur le jeu sans d ni M) ?
            </>
          }
          options={[
            {
              text: <>H1 seule (rationalité)</>,
              explain: (
                <>
                  Non. H1 justifie seulement qu'un joueur ne joue pas SES stratégies dominées, pas
                  qu'il anticipe le raisonnement des autres.
                </>
              ),
            },
            {
              text: <>H1 + H2.1 seulement</>,
              explain: (
                <>
                  Non. H2.1 justifie l'itération 1 : P1 sait que P2 est rationnel, donc il raye d.
                  Mais pour l'itération 2, P2 doit suivre ce raisonnement de P1 : il faut H2.2.
                </>
              ),
            },
            {
              text: <>H1 + H2.1 + H2.2 (« je sais que tu sais que je suis rationnel »)</>,
              correct: true,
              explain: (
                <>
                  Exact. L'itération 2 s'appuie sur le jeu réduit par l'itération 1 (donc sur
                  H2.1) et ajoute H2.2. Attention : H2.2 n'implique pas H2.1 (« je sais que tu sais
                  que je suis rationnel » n'est pas « je sais que tu es rationnel ») : il faut bien
                  les trois.
                </>
              ),
            },
          ]}
        />

        <ExerciseBlock
          scope="b1"
          id="ex2"
          number={2}
          title="Dominante, dominée, PSS : tout en un"
          difficulty={2}
          statement={
            <>
              <p>Considère le jeu suivant :</p>
              <PayoffMatrix
                rowPlayer="P1"
                colPlayer="P2"
                rows={["A", "B"]}
                cols={["x", "y", "z"]}
                payoffs={[
                  [
                    [3, 2],
                    [1, 3],
                    [4, 1],
                  ],
                  [
                    [2, 4],
                    [0, 2],
                    [3, 3],
                  ],
                ]}
              />
              <p>
                <strong>a)</strong> P1 a-t-il une stratégie dominante ? <strong>b)</strong> Et
                P2 ? A-t-il une stratégie dominée ? <strong>c)</strong> Ce jeu a-t-il un ESD ?{" "}
                <strong>d)</strong> Applique l'élimination itérative en nommant l'hypothèse de
                chaque étape : quels sont les PSS ? Quelle est la prédiction finale ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) La dominante de P1",
              content: (
                <p>
                  Compare A et B pour P1 (les nombres rouges), colonne par colonne : face à x,{" "}
                  <M tex="3 > 2" /> ✔ ; face à y, <M tex="1 > 0" /> ✔ ; face à z,{" "}
                  <M tex="4 > 3" /> ✔. <strong>A est dominante</strong> pour P1 : elle bat sa
                  seule alternative dans tous les cas.
                </p>
              ),
            },
            {
              title: "b) P2 : pas de dominante, mais une dominée",
              content: (
                <p>
                  Pour P2, compare ses payoffs bleus <em>ligne par ligne</em> : face à A, son
                  meilleur choix est y (3) ; face à B, c'est x (4). Son meilleur choix dépend de P1
                  : <strong>pas de dominante</strong>. Dominée ? Compare z et x : face à A,{" "}
                  <M tex="1 < 2" /> ; face à B, <M tex="3 < 4" />. Donc{" "}
                  <strong>z est dominée par x</strong>. (z n'est pas dominée par y : face à B, z
                  rapporte 3 et y seulement 2.)
                </p>
              ),
            },
            {
              title: "c) Pas d'ESD",
              content: (
                <p>
                  Un ESD exige que <em>tous</em> les joueurs aient une stratégie dominante. P2 n'en
                  a pas : <strong>pas d'ESD</strong>.
                </p>
              ),
            },
            {
              title: "d) L'élimination itérative → un PSS unique",
              content: (
                <>
                  <p>
                    <strong>Départ (H1).</strong> P1 ne joue pas B (dominée par A) et P2 ne joue
                    pas z (dominée par x).
                  </p>
                  <p>
                    <strong>Itération 1 (H2.1).</strong> P2 sait que P1 est rationnel : il ne
                    reste que la ligne A. Dans ce jeu réduit, P2 compare x (payoff 2) et y (payoff
                    3) : <M tex="3 > 2" />, donc <strong>x est dominée par y</strong> et disparaît
                    à son tour. (Dans le jeu complet, x n'était pas dominée par y : face à B, x
                    rapportait 4 et y seulement 2.)
                  </p>
                  <p>
                    Il ne reste qu'un profil : <strong>PSS unique : (A, y)</strong>, avec les
                    payoffs (1 ; 3). P1 aimerait bien que P2 joue x (il obtiendrait 3), mais P2 n'a
                    aucune raison de le faire.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              La prédiction est <strong>unique</strong> alors qu'il n'y avait pas d'ESD :
              l'élimination itérative (H1 + H2) va plus loin que la seule dominance (H1).
            </p>
          }
        />
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* § 1 — Qui se cache derrière s_{-i} ?                                 */
/* ------------------------------------------------------------------ */

const PROFILE = ["Bas", "Haut", "Haut", "Bas"] as const;

function ProfileSplit() {
  const [i, setI] = useState(2);
  const others = PROFILE.map((s, k) => ({ s, k })).filter((o) => o.k !== i);
  const texOthers = others.map((o) => `s_${o.k + 1}`).join(", ");
  const texValues = others.map((o) => `\\text{${o.s}}`).join(", ");

  return (
    <InteractiveCard
      title={
        <>
          Qui se cache derrière <M tex="s_{-i}" /> ?
        </>
      }
      subtitle="Quatre stations-service choisissent chacune un prix, Bas ou Haut. Clique sur une station pour en faire le joueur i."
      footer={
        <>
          le profil ne change jamais : on le <em>découpe</em> seulement en deux morceaux.{" "}
          <M tex="s_{-i}" /> contient toujours <M tex="n - 1 = 3" /> stratégies, celles de tous
          les joueurs sauf <M tex="i" />. Change de joueur <M tex="i" /> : le contenu de{" "}
          <M tex="s_{-i}" /> change avec lui.
        </>
      }
    >
      <div className="text-[13px] font-semibold text-muted-foreground">
        Le profil complet <M tex="(s_1, s_2, s_3, s_4)" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {PROFILE.map((s, k) => (
          <button
            type="button"
            key={k}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className={cn(
              "rounded-xl border-2 px-3 py-2 text-left transition-all duration-300",
              k === i
                ? "-translate-y-1 border-rose-500 bg-rose-50 shadow-md dark:bg-rose-950/40"
                : "border-sky-300 bg-sky-50/60 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30",
            )}
          >
            <div className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              Station {k + 1}
            </div>
            <div className="text-[15px] font-semibold">
              <M tex={`s_${k + 1}`} /> = {s}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 text-[13px] font-semibold text-muted-foreground">
        Le même profil, écrit <M tex="(s_i, s_{-i})" /> avec <M tex={`i = ${i + 1}`} />
      </div>
      <div key={i} className="mt-2 flex flex-wrap items-stretch gap-2 animate-in fade-in">
        <div className="rounded-xl border-2 border-rose-500 bg-rose-50 px-3 py-2 dark:bg-rose-950/40">
          <div className="text-[12px] font-bold text-rose-700 dark:text-rose-300">
            <M tex="s_i" /> : le joueur i
          </div>
          <div className="mt-1 text-[15px] font-semibold">
            <M tex={`s_${i + 1}`} /> = {PROFILE[i]}
          </div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-sky-400 px-2.5 py-2">
          <div className="text-[12px] font-bold text-sky-700 dark:text-sky-300">
            <M tex="s_{-i}" /> : tous les autres
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {others.map((o) => (
              <span
                key={o.k}
                className="rounded-lg bg-sky-50 px-2 py-0.5 text-[14.5px] font-semibold dark:bg-sky-950/40"
              >
                <M tex={`s_${o.k + 1}`} /> = {o.s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <MB tex={`s_{-${i + 1}} = (${texOthers}) = (${texValues})`} />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* § 2 — Anatomie d'une matrice et feuille de route des hypothèses      */
/* ------------------------------------------------------------------ */

function Marker({ n, className }: { n: number; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none text-white",
        className,
      )}
    >
      {n}
    </span>
  );
}

const RDV_CELLS: Array<Array<[number, number]>> = [
  [
    [0, 0],
    [-2, -4],
  ],
  [
    [-1, -2],
    [0, -3],
  ],
];

/** Nombre entier avec un vrai signe moins typographique. */
function sgn(v: number): string {
  return v < 0 ? `−${Math.abs(v)}` : String(v);
}

function MatrixAnatomy() {
  const labels = ["Heure", "Retard"];
  return (
    <figure className="my-6" data-no-speech="true">
      <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
        <div className="max-w-full overflow-x-auto">
          <div className="inline-block rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
            <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
              <Marker n={2} className="bg-sky-600" /> Amie (joueur 2)
            </div>
            <div className="flex items-center gap-2">
              <div className="flex shrink-0 flex-col items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                <Marker n={1} className="bg-rose-600" />
                <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  Vous (joueur 1)
                </span>
              </div>
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="p-1.5" />
                    {labels.map((c) => (
                      <th
                        key={c}
                        className="min-w-[5.5rem] p-1.5 text-center text-sm font-semibold text-sky-700"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((r, i) => (
                    <tr key={r}>
                      <th className="p-1.5 pr-2 text-right text-sm font-semibold text-rose-700">{r}</th>
                      {labels.map((_, j) => {
                        const hot = i === 0 && j === 1;
                        return (
                          <td key={j} className="p-1">
                            <div
                              className={cn(
                                "relative flex items-center justify-center gap-1 rounded-lg border-2 px-3 py-2.5 text-[15px] tabular-nums",
                                hot
                                  ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,158,11,0.2)] dark:bg-amber-950/40"
                                  : "border-border bg-background",
                              )}
                            >
                              {hot ? (
                                <>
                                  <Marker n={3} className="absolute -left-2 -top-2 bg-rose-600" />
                                  <Marker n={4} className="absolute -right-2 -top-2 bg-sky-600" />
                                </>
                              ) : null}
                              <span className="font-semibold text-rose-700">{sgn(RDV_CELLS[i][j][0])}</span>
                              <span className="text-muted-foreground">;</span>
                              <span className="font-semibold text-sky-700">{sgn(RDV_CELLS[i][j][1])}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <ol className="m-0 list-none space-y-2.5 pl-0 text-[15px] leading-snug md:max-w-sm">
          <li className="flex gap-2">
            <Marker n={1} className="mt-0.5 bg-rose-600" />
            <span>
              <strong>Vous</strong> (joueur 1) choisissez la <strong>ligne</strong> : Heure ou
              Retard.
            </span>
          </li>
          <li className="flex gap-2">
            <Marker n={2} className="mt-0.5 bg-sky-600" />
            <span>
              <strong>Amie</strong> (joueur 2) choisit la <strong>colonne</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <Marker n={3} className="mt-0.5 bg-rose-600" />
            <span>
              La case encadrée est le profil (H, R) : toi à l'heure, elle en retard. Le{" "}
              <strong>1er nombre</strong> est ton payoff : <M tex="u_V(H, R) = -2" /> (tu attends).
            </span>
          </li>
          <li className="flex gap-2">
            <Marker n={4} className="mt-0.5 bg-sky-600" />
            <span>
              Le <strong>2e nombre</strong> est le payoff de ton amie : <M tex="u_A(H, R) = -4" />{" "}
              (elle te fait attendre, −1, et elle est en retard, −3).
            </span>
          </li>
        </ol>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Anatomie de la forme normale du jeu du rendez-vous (slide 8).
      </figcaption>
    </figure>
  );
}

function HypothesisMap() {
  const branches: Array<{ hyp: string; concept: ReactNode; where: string; desc: ReactNode }> = [
    {
      hyp: "H1 seule",
      concept: <>ESD : équilibre en stratégies dominantes</>,
      where: "§ 3",
      desc: <>chacun joue sa stratégie dominante, s'il en a une.</>,
    },
    {
      hyp: "H1 + H2",
      concept: <>PSS : profils de stratégies survivants</>,
      where: "§ 4",
      desc: <>en plus, chacun sait que les autres sont rationnels, qu'ils le savent, etc.</>,
    },
    {
      hyp: "H1 + H3",
      concept: <>EN : équilibre de Nash</>,
      where: "§ 5",
      desc: <>en plus, chacun anticipe correctement ce que les autres vont jouer.</>,
    },
  ];
  return (
    <figure className="my-6" aria-label="Trois concepts de solution, tous construits à partir de H1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="shrink-0 self-start rounded-xl border-2 border-primary/40 bg-accent/50 px-4 py-3 text-center sm:self-center">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Le tronc</div>
          <div className="text-lg font-extrabold">H1</div>
          <div className="text-[13px] text-muted-foreground">joueurs rationnels</div>
        </div>
        <div className="ml-4 flex-1 space-y-2.5 border-l-2 border-dashed border-primary/40 pl-4 sm:ml-0">
          {branches.map((b) => (
            <div
              key={b.hyp}
              className="relative rounded-xl border bg-card px-3.5 py-2.5 shadow-sm before:absolute before:-left-4 before:top-1/2 before:h-0.5 before:w-4 before:bg-primary/40"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <HypTag>{b.hyp}</HypTag>
                <span aria-hidden className="text-muted-foreground">
                  →
                </span>
                <span className="font-bold">{b.concept}</span>
              </div>
              <div className="mt-1 text-[14px] text-muted-foreground">
                {b.desc}{" "}
                <span className="whitespace-nowrap font-semibold text-foreground/70">
                  → étudié en {b.where}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Les trois « concepts de solution » du chapitre et leurs hypothèses (slide 36).
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* § 3 — Grille de jeu, vérificateur de dominance, pénalité climat      */
/* ------------------------------------------------------------------ */

type Pair = [number, number];

const PD_CELLS: Pair[][] = [
  [
    [2, 2],
    [0, 3],
  ],
  [
    [3, 0],
    [1, 1],
  ],
];

const G3_CELLS: Pair[][] = [
  [
    [4, 2],
    [0, 0],
    [6, 0],
  ],
  [
    [0, 6],
    [1, 2],
    [3, 0],
  ],
  [
    [0, 0],
    [2, 4],
    [2, 0],
  ],
];

/** Matrice compacte : peut teinter des lignes / colonnes et estomper un joueur. */
function GameGrid({
  p1,
  p2,
  rows,
  cols,
  pay,
  fmtCell = sgn,
  rowTone,
  colTone,
  emph,
}: {
  p1: string;
  p2: string;
  rows: string[];
  cols: string[];
  pay: Pair[][];
  fmtCell?: (v: number) => string;
  rowTone?: (r: number) => string | undefined;
  colTone?: (c: number) => string | undefined;
  /** joueur dont on compare les payoffs : l'autre nombre est estompé */
  emph?: 1 | 2;
}) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="inline-block rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="mb-1.5 text-center text-xs font-bold uppercase tracking-wider text-sky-700">
          {p2}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="shrink-0 text-xs font-bold uppercase tracking-wider text-rose-700"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {p1}
          </div>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-1" />
                {cols.map((c) => (
                  <th key={c} className="min-w-[4.4rem] p-1 text-center text-sm font-semibold text-sky-700">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r}>
                  <th className="p-1 pr-2 text-right text-sm font-semibold text-rose-700">{r}</th>
                  {cols.map((_, j) => (
                    <td key={j} className="p-1">
                      <div
                        className={cn(
                          "flex items-center justify-center gap-1 whitespace-nowrap rounded-lg border-2 px-2.5 py-2 text-[15px] tabular-nums transition-all duration-300",
                          rowTone?.(i) ?? colTone?.(j) ?? "border-border bg-background",
                        )}
                      >
                        <span
                          className={cn(
                            "font-semibold text-rose-700 transition-opacity duration-300",
                            emph === 2 && "opacity-30",
                            emph === 1 && "font-extrabold",
                          )}
                        >
                          {fmtCell(pay[i][j][0])}
                        </span>
                        <span className="text-muted-foreground">;</span>
                        <span
                          className={cn(
                            "font-semibold text-sky-700 transition-opacity duration-300",
                            emph === 1 && "opacity-30",
                            emph === 2 && "font-extrabold",
                          )}
                        >
                          {fmtCell(pay[i][j][1])}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type LabKey = "rdv" | "pd" | "g3";

const LAB: Record<
  LabKey,
  {
    label: string;
    p1: string;
    p2: string;
    rows: string[];
    cols: string[];
    pay: Pair[][];
    preset: { player: 1 | 2; x: number; y: number };
  }
> = {
  rdv: {
    label: "Rendez-vous",
    p1: "Vous",
    p2: "Amie",
    rows: ["H", "R"],
    cols: ["H", "R"],
    pay: RDV_CELLS,
    preset: { player: 2, x: 1, y: 0 },
  },
  pd: {
    label: "Prisonnier",
    p1: "P1",
    p2: "P2",
    rows: ["Nier", "Confesser"],
    cols: ["Nier", "Confesser"],
    pay: PD_CELLS,
    preset: { player: 1, x: 0, y: 1 },
  },
  g3: {
    label: "Jeu 3×3 (slide 20)",
    p1: "P1",
    p2: "P2",
    rows: ["H", "M", "B"],
    cols: ["g", "m", "d"],
    pay: G3_CELLS,
    preset: { player: 2, x: 2, y: 1 },
  },
};

const TONE_Y = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30";
const TONE_X = "border-rose-300 bg-rose-50 dark:bg-rose-950/30";
const TONE_OFF = "border-border bg-background opacity-40";

function DominanceLab() {
  const [game, setGame] = useState<LabKey>("g3");
  const g = LAB[game];
  const [player, setPlayer] = useState<1 | 2>(g.preset.player);
  const [x, setX] = useState(g.preset.x);
  const [y, setY] = useState(g.preset.y);

  const own = player === 1 ? g.rows : g.cols;
  const opp = player === 1 ? g.cols : g.rows;
  const me = player === 1 ? g.p1 : g.p2;
  const other = player === 1 ? g.p2 : g.p1;
  /** payoff du joueur choisi quand il joue s et l'adversaire o */
  const u = (s: number, o: number) => (player === 1 ? g.pay[s][o][0] : g.pay[o][s][1]);

  const pickGame = (k: LabKey) => {
    setGame(k);
    setPlayer(LAB[k].preset.player);
    setX(LAB[k].preset.x);
    setY(LAB[k].preset.y);
  };
  const pickPlayer = (p: 1 | 2) => {
    setPlayer(p);
    setX((p === 1 ? g.rows : g.cols).length - 1);
    setY(0);
  };
  const pickX = (v: number) => {
    setX(v);
    if (v === y) setY(v === 0 ? 1 : 0);
  };
  const pickY = (v: number) => {
    setY(v);
    if (v === x) setX(v === 0 ? 1 : 0);
  };

  const checks = opp.map((o, k) => {
    const a = u(y, k);
    const b = u(x, k);
    return { o, a, b, ok: a >= b, eq: a === b };
  });
  const dominated = checks.every((c) => c.ok);
  const fail = checks.find((c) => !c.ok);
  // y est-elle dominante ? (≥ face à toutes les autres stratégies et tous les choix adverses)
  let beat: { s: number; k: number } | null = null;
  own.forEach((_, s) => {
    if (s === y || beat) return;
    opp.forEach((_o, k) => {
      if (!beat && u(s, k) > u(y, k)) beat = { s, k };
    });
  });
  const yBeat = beat as { s: number; k: number } | null;
  const animKey = `${game}-${player}-${x}-${y}`;
  const tone = (s: number) => (s === y ? TONE_Y : s === x ? TONE_X : TONE_OFF);
  const opts = own.map((s, k) => ({ value: String(k), label: s }));

  return (
    <InteractiveCard
      title="Vérificateur de dominance"
      subtitle="Choisis un jeu, un joueur et deux de ses stratégies : le vérificateur compare leurs payoffs face à chaque choix possible de l'adversaire."
      controls={
        <>
          <ChoiceChips
            label="Jeu"
            options={(Object.keys(LAB) as LabKey[]).map((k) => ({ value: k, label: LAB[k].label }))}
            value={game}
            onChange={pickGame}
          />
          <ChoiceChips
            label="Joueur"
            options={[
              { value: "1", label: `${g.p1} (lignes)` },
              { value: "2", label: `${g.p2} (colonnes)` },
            ]}
            value={String(player)}
            onChange={(v) => pickPlayer(v === "1" ? 1 : 2)}
          />
          <div className="grid gap-2">
            <ChoiceChips
              label="Stratégie testée : est-elle dominée…"
              options={opts}
              value={String(x)}
              onChange={(v) => pickX(Number(v))}
            />
            <ChoiceChips
              label="… par celle-ci ?"
              options={opts}
              value={String(y)}
              onChange={(v) => pickY(Number(v))}
            />
          </div>
        </>
      }
      footer={
        <>
          on compare toujours deux stratégies du <em>même</em> joueur, face au <em>même</em> choix
          de l'adversaire, une ligne à la fois. Un seul ✘ suffit : la stratégie testée n'est pas
          dominée par l'autre. Essaie le jeu 3×3 : d est dominée par m (et aussi par g), mais m n'est pas
          dominante.
        </>
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <GameGrid
          p1={g.p1}
          p2={g.p2}
          rows={g.rows}
          cols={g.cols}
          pay={g.pay}
          emph={player}
          rowTone={player === 1 ? tone : undefined}
          colTone={player === 2 ? tone : undefined}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-muted-foreground">
            Payoffs de {me} : <span className="text-emerald-700">{own[y]}</span> contre{" "}
            <span className="text-rose-700">{own[x]}</span>, face à chaque choix de {other}
          </div>
          <ul key={animKey} className="mt-2 space-y-1.5">
            {checks.map((c, k) => (
              <li
                key={c.o}
                className="rounded-lg border bg-background px-3 py-1.5 text-[14.5px] animate-in fade-in slide-in-from-left-2"
                style={{
                  animationDelay: `${k * 350}ms`,
                  animationDuration: "400ms",
                  animationFillMode: "both",
                }}
              >
                <span className="text-muted-foreground">
                  Si {other} joue <strong className="text-foreground">{c.o}</strong> :{" "}
                </span>
                <strong className="text-emerald-700">{own[y]}</strong> rapporte {sgn(c.a)},{" "}
                <strong className="text-rose-700">{own[x]}</strong> rapporte {sgn(c.b)} :{" "}
                <span className="whitespace-nowrap font-semibold">
                  {sgn(c.a)} {c.ok ? "≥" : "<"} {sgn(c.b)} {c.ok ? "✔" : "✘"}
                </span>
                {c.eq ? <span className="text-muted-foreground"> (égalité, permise par ≥)</span> : null}
              </li>
            ))}
          </ul>
          <div
            key={`${animKey}-v`}
            className={cn(
              "mt-3 rounded-xl border-2 px-3.5 py-2.5 text-[14.5px] animate-in fade-in",
              dominated
                ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                : "border-rose-300 bg-rose-50 dark:bg-rose-950/30",
            )}
            style={{ animationDelay: `${checks.length * 350}ms`, animationFillMode: "both" }}
          >
            {dominated ? (
              <>
                <strong>
                  {own[x]} est dominée par {own[y]}
                </strong>{" "}
                pour {me} : un joueur rationnel (H1) ne joue jamais {own[x]}.
              </>
            ) : fail ? (
              <>
                <strong>
                  {own[x]} n'est pas dominée par {own[y]}
                </strong>{" "}
                : si {other} joue {fail.o}, {own[x]} rapporte plus ({sgn(fail.b)} &gt; {sgn(fail.a)}).
              </>
            ) : null}
            <div className="mt-1 text-[13.5px] text-muted-foreground">
              Et {own[y]}, est-elle <em>dominante</em> pour {me} ?{" "}
              {yBeat ? (
                <>
                  Non : si {other} joue {opp[yBeat.k]}, {own[yBeat.s]} rapporte plus (
                  {sgn(u(yBeat.s, yBeat.k))} &gt; {sgn(u(y, yBeat.k))}).
                </>
              ) : (
                <>Oui : elle fait au moins aussi bien que toutes les autres, quoi que fasse {other}.</>
              )}
            </div>
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
}

function ClimatePenalty() {
  const [t, setT] = useState(0.5);
  const eps = 1e-6;
  const regime = t < 1 - eps ? "T" : t > 1 + eps ? "C" : "eq";
  const p = makePlot({ x: [0, 2], y: [-1.5, 3.5], h: 300, pL: 40 });
  const series = [
    { f: () => 2, at0: 2, color: C.green, dash: undefined, label: "Coopérer face à C" },
    { f: (v: number) => 3 - v, at0: 3, color: C.red, dash: undefined, label: "Trahir face à C" },
    { f: () => 0, at0: 0, color: C.green, dash: "7 5", label: "Coopérer face à T" },
    { f: (v: number) => 1 - v, at0: 1, color: C.red, dash: "7 5", label: "Trahir face à T" },
  ];
  const cells: Pair[][] = [
    [
      [2, 2],
      [0, 3 - t],
    ],
    [
      [3 - t, 0],
      [1 - t, 1 - t],
    ],
  ];
  const presets = ["0", "0.5", "1", "1.5"];
  const chip = presets.find((s) => Math.abs(Number(s) - t) < eps) ?? "";

  return (
    <InteractiveCard
      title="La pénalité qui change le jeu"
      subtitle="Fais varier la pénalité t payée par chaque pays qui trahit (le slide 17 ne la chiffre pas : t est notre paramètre d'exercice)."
      controls={
        <>
          <SliderControl
            label="Pénalité t"
            value={t}
            onChange={setT}
            min={0}
            max={2}
            step={0.05}
            format={(v) => fmt(v, 2)}
          />
          <ChoiceChips
            label="Valeurs repères"
            options={presets.map((s) => ({ value: s, label: `t = ${fmt(Number(s), 1)}` }))}
            value={chip}
            onChange={(v) => setT(Number(v))}
          />
        </>
      }
      footer={
        <>
          les deux comparaisons basculent <strong>au même endroit</strong>, en t = 1. Trahir
          rapporte en effet exactement 1 de plus que coopérer, que l'autre pays coopère (3 − 2) ou
          trahisse (1 − 0) : la pénalité doit effacer ce gain de 1.
        </>
      }
    >
      <div>
        <div>
          <PlotSvg
            p={p}
            maxW={600}
            label="Payoffs du pays 1 selon la pénalité t, face à un pays qui coopère ou qui trahit"
          >
            <Frame
              p={p}
              xticks={[0, 0.5, 1, 1.5, 2]}
              yticks={[-1, 0, 1, 2, 3]}
              xlabel="pénalité t"
              ylabel="payoff du pays 1"
            />
            <line x1={p.X(1)} y1={p.pT} x2={p.X(1)} y2={p.h - p.pB} stroke={C.guide} strokeDasharray="3 4" />
            {series.map((s) => (
              <path
                key={s.label}
                d={curvePath(p, s.f, 0, 2, 40)}
                fill="none"
                stroke={s.color}
                strokeWidth={2.6}
                strokeDasharray={s.dash}
              />
            ))}
            {series.map((s) => (
              <Label key={`l-${s.label}`} p={p} x={0.04} y={s.at0} color={s.color} size={13} dx={0} dy={-7}>
                {s.label}
              </Label>
            ))}
            <line
              x1={p.X(t)}
              y1={p.pT}
              x2={p.X(t)}
              y2={p.h - p.pB}
              stroke={C.blue}
              strokeWidth={1.8}
              opacity={0.75}
            />
            {series.map((s) => (
              <circle
                key={`d-${s.label}`}
                cx={p.X(t)}
                cy={p.Y(s.f(t))}
                r={4.5}
                fill={s.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}
            <Label p={p} x={1} y={-1.35} anchor="middle" dx={0} dy={0} color={C.soft} size={12.5}>
              seuil t = 1
            </Label>
          </PlotSvg>
          <p className="mt-1 text-center text-[13px] text-muted-foreground">
            Vert = Coopérer, rouge = Trahir. Trait plein : l'autre pays coopère ; pointillé : il
            trahit.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <GameGrid
          p1="Pays 1"
          p2="Pays 2"
          rows={["C", "T"]}
          cols={["C", "T"]}
          pay={cells}
          fmtCell={(v) => fmt(v, 2)}
        />
      <div
        className={cn(
          "min-w-0 flex-1 rounded-xl border-2 px-3.5 py-2.5 text-[14.5px] transition-colors duration-300",
          regime === "T" && "border-rose-300 bg-rose-50 dark:bg-rose-950/30",
          regime === "eq" && "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
          regime === "C" && "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30",
        )}
      >
        {regime === "T" ? (
          <>
            <strong>t &lt; 1 : Trahir reste strictement dominante</strong> (3 − t &gt; 2 et 1 − t
            &gt; 0). L'ESD est toujours (T, T) : la pénalité est trop faible.
          </>
        ) : regime === "eq" ? (
          <>
            <strong>t = 1 : cas limite.</strong> 3 − t = 2 et 1 − t = 0 : chaque pays est
            indifférent entre C et T, quoi que fasse l'autre. Avec la définition ≥ du cours, C et T
            sont toutes deux dominantes, et les quatre profils sont des ESD.
          </>
        ) : (
          <>
            <strong>t &gt; 1 : Coopérer devient strictement dominante</strong> (2 &gt; 3 − t et 0
            &gt; 1 − t). (C, C) est l'unique ESD : l'accord a changé le jeu.
          </>
        )}
      </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* § 4 — Les niveaux de H2, en boîtes emboîtées                         */
/* ------------------------------------------------------------------ */

type Who = "V" | "A";

/** Boîte « X sait que … » contenant la suite de la chaîne. */
function Nest({ chain }: { chain: Who[] }) {
  const [head, ...rest] = chain;
  if (rest.length === 0) {
    return (
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-2.5 py-1.5 text-center text-[13.5px] font-semibold text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        {head === "V" ? "toi, tu es rationnel·le" : "ton amie est rationnelle"}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-xl border-2 px-2 pb-2 pt-1",
        head === "V"
          ? "border-rose-300 bg-rose-50/60 dark:bg-rose-950/20"
          : "border-sky-300 bg-sky-50/60 dark:bg-sky-950/20",
      )}
    >
      <div
        className={cn(
          "mb-1 text-[12.5px] font-bold",
          head === "V" ? "text-rose-700 dark:text-rose-300" : "text-sky-700 dark:text-sky-300",
        )}
      >
        {head === "V" ? "Tu sais que…" : "elle sait que…"}
      </div>
      <Nest chain={rest} />
    </div>
  );
}

function KnowledgeNest() {
  const levels: Array<{ tag: string; chain: Who[]; gloss: ReactNode }> = [
    { tag: "H2.1", chain: ["V", "A"], gloss: <>donc tu sais qu'elle ne jouera pas de stratégie dominée.</> },
    {
      tag: "H2.2",
      chain: ["V", "A", "V"],
      gloss: <>donc tu sais qu'elle anticipe que tu ne joueras pas de stratégie dominée.</>,
    },
    { tag: "H2.3", chain: ["V", "A", "V", "A"], gloss: <>un niveau de plus… et ainsi de suite.</> },
  ];
  return (
    <figure className="my-6" data-no-speech="true">
      <div className="grid gap-3 md:grid-cols-3">
        {levels.map((l) => (
          <div key={l.tag} className="flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <HypTag>{l.tag}</HypTag>
              <span className="text-[12.5px] text-muted-foreground">
                {l.chain.length - 1} « sait que »
              </span>
            </div>
            <Nest chain={l.chain} />
            <p className="m-0 text-[13.5px] leading-snug text-muted-foreground">{l.gloss}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        Les premiers niveaux de H2 dans le jeu du rendez-vous, vus de ton côté (ton amie a les
        mêmes niveaux, en miroir). Rouge : ce que tu sais ; bleu : ce que ton amie sait.
      </figcaption>
    </figure>
  );
}
