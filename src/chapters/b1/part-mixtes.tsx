/*
 * Chapitre B1 — PartMixtes : § 8 à § 10 (slides 54-70 du deck S5 « Jeux simultanés »).
 * § 8 stratégies mixtes (matching pennies, payoff attendu, pénalty, avantage théorique
 * de l'EN, théorème d'indifférence, police vs mafia, terrain et labo) · § 9 exercices
 * récapitulatifs · § 10 checklist. Les petits widgets propres à ces sections (ronde des
 * déviations, carré des probabilités, bascule du payoff attendu, loi binomiale) sont
 * définis en bas de ce fichier.
 */

import { useEffect, useState, type ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { cn } from "@/lib/utils";
import { C, Dot, Frame, GuideH, GuideV, Label, PlotSvg, fmt, makePlot } from "@/chapters/shared/plot";
import { MasteryChecklist, PenaltyExplorer, PoliceMafia } from "./interactives";
import { H4, CardGrid, SymbolicMatrix } from "./ui";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Sous-titre de second niveau à l'intérieur d'une section. */
function H5({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-6 text-[16.5px] font-bold tracking-tight">{children}</h4>;
}

/** Listes (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Une étape d'un raisonnement : pastille, titre (le « quoi »), puis l'explication. */
function Step({ n, title, children }: { n: ReactNode; title: ReactNode; children: ReactNode }) {
  return (
    <div className="my-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[12.5px] font-bold text-primary-foreground">
          {n}
        </span>
        <div className="font-semibold leading-snug">{title}</div>
      </div>
      <div className="mt-1.5 space-y-2 text-[15.5px] leading-relaxed">{children}</div>
    </div>
  );
}

/** Pastille de renvoi au slide (repère pour réviser avec le deck du cours). */
function Slide({ n }: { n: string }) {
  return (
    <span className="ml-1 inline-flex items-center rounded-md border px-1.5 py-0.5 align-middle text-[11.5px] font-semibold text-muted-foreground">
      slide {n}
    </span>
  );
}

/**
 * Tableau « comptable » d'un développement : chaque terme du payoff attendu est
 * ventilé en constante, terme en p, terme en q et terme en pq ; la dernière ligne
 * fait les totaux (c'est l'étape « on regroupe » du slide 61).
 */
function ExpansionTable({
  rows,
  total,
}: {
  /** [terme (TeX), constante, coefficient de p, coefficient de q, coefficient de pq] */
  rows: Array<[string, string, string, string, string]>;
  total: [string, string, string, string, string];
}) {
  const head = ["Terme du slide", "constante", "p", "q", "pq"];
  return (
    <div className="my-4 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14.5px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "px-2.5 py-2 text-[12px] font-bold uppercase tracking-wide text-muted-foreground",
                  i === 0 ? "text-left" : "text-center",
                )}
              >
                {i === 0 || i === 1 ? h : <M tex={h} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className={cn("px-2.5 py-2", j === 0 ? "text-left" : "text-center")}>
                  {c ? <M tex={c} /> : <span className="text-muted-foreground/50">·</span>}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t-2 border-foreground/30 bg-accent/40 font-semibold">
            {total.map((c, j) => (
              <td key={j} className={cn("px-2.5 py-2", j === 0 ? "text-left" : "text-center")}>
                {j === 0 ? c : <M tex={c} />}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function PartMixtes() {
  return (
    <>

      {/* ============================================================ */}
      {/* S8 — Stratégies mixtes (slides 54-70)                         */}
      {/* ============================================================ */}
      <Section
        id="s8"
        kicker="§ 8 · Stratégies mixtes"
        title="Stratégies mixtes : jouer au hasard, rationnellement"
      >
        <Lead>
          Jusqu'ici, chaque joueur choisissait <em>une</em> stratégie : une ligne ou une colonne.
          Mais certains jeux n'ont alors aucun équilibre de Nash, et l'EN ne prédit plus rien. La
          parade du cours : laisser les joueurs <strong>jouer au hasard</strong>, avec des
          probabilités qu'ils choisissent eux-mêmes. Ce § suit les slides 54 à 70.
        </Lead>

        {/* ---------------------------------------------------------- */}
        <H4>
          1. Le problème : un jeu sans EN en stratégies pures <Slide n="54" />
        </H4>
        <p>
          <strong>Limitation théorique de l'EN</strong> : certains jeux n'ont pas d'EN en{" "}
          <strong>stratégies pures</strong> (celles que tu connais depuis le § 1 : on choisit une
          ligne ou une colonne, sans hasard). Dans ces jeux, l'EN n'offre{" "}
          <strong>aucune prédiction</strong>. L'exemple du cours s'appelle{" "}
          <strong>matching pennies</strong> (« faire correspondre les pièces ») :
        </p>
        <UL>
          <li>deux joueurs ont chacun une pièce en main ;</li>
          <li>
            simultanément, chacun montre soit le côté <strong>Pile</strong>, soit le côté{" "}
            <strong>Face</strong> de sa pièce ;
          </li>
          <li>
            le <strong>joueur 2</strong> essaie de montrer le <em>même</em> côté que le joueur 1 ;
          </li>
          <li>
            le <strong>joueur 1</strong> essaie de montrer le côté <em>opposé</em> à celui du
            joueur 2.
          </li>
        </UL>
        <PayoffMatrix
          rowPlayer="Joueur 1"
          colPlayer="Joueur 2"
          rows={["Pile", "Face"]}
          cols={["Pile", "Face"]}
          payoffs={[
            [
              [0, 3],
              [3, 0],
            ],
            [
              [3, 0],
              [0, 3],
            ],
          ]}
          caption={
            <>
              Matching pennies (slide 54). Le gagnant reçoit 3, le perdant 0 : si les deux pièces
              montrent le même côté, le joueur 2 gagne ; sinon, c'est le joueur 1.
            </>
          }
        />
        <p>Cherchons les meilleures réponses, comme au § 5 :</p>
        <UL>
          <li>
            pour le <strong>joueur 1</strong>, Pile est la meilleure réponse à Face, et Face est la
            meilleure réponse à Pile (il veut l'inverse de l'autre) ;
          </li>
          <li>
            pour le <strong>joueur 2</strong>, Face est la meilleure réponse à Face, et Pile est la
            meilleure réponse à Pile (il veut la même chose que l'autre).
          </li>
        </UL>
        <p>
          Il n'y a donc <strong>aucun profil de stratégies constitué de meilleures réponses
          mutuelles</strong> : aucune des quatre cases n'est un EN. Regarde pourquoi, case par case :
        </p>

        <PenniesCycle />

        {/* ---------------------------------------------------------- */}
        <H4>
          2. Les jeux de conflit : il faut être imprévisible <Slide n="55" />
        </H4>
        <p>
          Matching pennies est un <strong>jeu de conflit</strong> : les intérêts des joueurs sont
          complètement divergents. Lorsque l'un gagne, l'autre perd, et vice versa. Autres exemples
          du cours : le <strong>sport</strong>, la <strong>guerre</strong>, la{" "}
          <strong>police contre les criminels</strong>.
        </p>
        <p>
          Pourquoi ces jeux n'ont-ils pas d'équilibre en stratégies pures ? Parce que si un joueur
          gagne, c'est que l'autre perd, et ce dernier a donc toujours un incitant à changer de
          stratégie. C'est exactement la ronde que tu viens de voir.
        </p>
        <Callout variant="intuition" title="Le bon réflexe : devenir imprévisible">
          <p>
            Dans un jeu de conflit, si ton adversaire anticipe ton comportement, il peut l'exploiter
            pour gagner. Pense à un tireur de pénalty qui tire toujours à droite : le gardien
            l'apprend vite et plonge à droite. Chaque joueur voudrait donc que son comportement soit
            perçu par ses adversaires <strong>comme s'il choisissait sa stratégie au hasard</strong>.
            Une <strong>stratégie mixte</strong> modélise justement un tel choix au hasard.
          </p>
        </Callout>

        {/* ---------------------------------------------------------- */}
        <H4>
          3. Une stratégie mixte : on choisit des probabilités <Slide n="56" />
        </H4>
        <Callout variant="definition" title="Définition — stratégie mixte">
          <p>
            Une <strong>stratégie mixte</strong> spécifie une{" "}
            <strong>distribution de probabilité</strong> sur les stratégies pures.
          </p>
        </Callout>
        <p>Deux exemples de stratégies mixtes du joueur 1 dans matching pennies (slide 56) :</p>
        <UL>
          <li>
            <M tex="s_1" /> = jouer Pile avec probabilité 1/2 et Face avec probabilité 1/2 (comme
            lancer sa pièce en l'air) ;
          </li>
          <li>
            <M tex="s_1'" /> = jouer Pile avec probabilité 3/4 et Face avec probabilité 1/4 (comme
            une pièce truquée qui penche vers Pile).
          </li>
        </UL>
        <p>
          Un joueur qui utilise une stratégie mixte <strong>choisit les probabilités</strong> avec
          lesquelles il va jouer chaque stratégie pure ; il <strong>ne choisit pas</strong> la
          stratégie pure qu'il va finalement jouer : c'est le tirage au sort qui tranche. Une
          stratégie pure reste un cas particulier : « Pile avec probabilité 1 ».
        </p>

        {/* ---------------------------------------------------------- */}
        <H4>
          4. Évaluer une stratégie mixte : le payoff attendu <Slide n="57" />
        </H4>
        <p>
          Quand les joueurs tirent au sort, le payoff devient lui aussi aléatoire. La règle du
          slide 57 : un joueur rationnel choisit sa stratégie de manière à{" "}
          <strong>maximiser son payoff attendu</strong>, et donc son{" "}
          <strong>utilité espérée</strong>, exactement comme en A3. Le payoff attendu est la
          moyenne des payoffs possibles, chacun pondéré par sa probabilité.
        </p>
        <p>
          <TheoryRef chapter="a3" section="s4" />
        </p>
        <p>Le slide part des deux stratégies mixtes suivantes :</p>
        <UL>
          <li>
            <M tex="s_1" /> (joueur 1) = Pile avec probabilité 1/2, Face avec probabilité 1/2 ;
          </li>
          <li>
            <M tex="s_2" /> (joueur 2) = Pile avec probabilité 3/4, Face avec probabilité 1/4.
          </li>
        </UL>
        <p>
          Notation : la majuscule <M tex="U_1" /> désigne le payoff <em>attendu</em> du joueur 1
          (une moyenne) ; la minuscule <M tex="u_1" /> désigne son payoff dans une case précise de
          la matrice, par exemple <M tex="u_1(P, F) = 3" />.
        </p>

        <H5>Calcul 1 : le joueur 1 joue Pile (pur), le joueur 2 joue s₂</H5>
        <p>
          J1 montre Pile à coup sûr. Il ne reste que deux cases possibles, selon ce que montre J2 :
        </p>
        <UL>
          <li>
            avec probabilité 3/4, J2 montre Pile : case (P, P), J1 reçoit{" "}
            <M tex="u_1(P, P) = 0" /> ;
          </li>
          <li>
            avec probabilité 1/4, J2 montre Face : case (P, F), J1 reçoit{" "}
            <M tex="u_1(P, F) = 3" />.
          </li>
        </UL>
        <MB tex="U_1(P, s_2) = \tfrac34\, u_1(P, P) + \tfrac14\, u_1(P, F) = \tfrac34 \cdot 0 + \tfrac14 \cdot 3 = \tfrac34" />

        <H5>Calcul 2 : les deux joueurs mixent (s₁ contre s₂)</H5>
        <p>
          Cette fois, les <em>quatre</em> cases peuvent arriver. Chaque joueur tire au sort de son
          côté, sans savoir ce que fait l'autre : les deux tirages sont{" "}
          <strong>indépendants</strong>. La probabilité d'une case est donc le{" "}
          <strong>produit</strong> des deux probabilités. Par exemple, la case (F, P) (J1 montre
          Face, probabilité 1/2, et J2 montre Pile, probabilité 3/4) arrive avec probabilité{" "}
          <M tex="\tfrac12 \cdot \tfrac34 = \tfrac38" />. Le slide additionne les quatre cases :
        </p>
        <MB tex="\begin{aligned} U_1(s_1, s_2) &= \tfrac12 \cdot \tfrac34\, u_1(P, P) + \tfrac12 \cdot \tfrac34\, u_1(F, P) \\ &\quad + \tfrac12 \cdot \tfrac14\, u_1(P, F) + \tfrac12 \cdot \tfrac14\, u_1(F, F) \\ &= \tfrac38 \cdot 0 + \tfrac38 \cdot 3 + \tfrac18 \cdot 3 + \tfrac18 \cdot 0 \\ &= \tfrac98 + \tfrac38 = \tfrac{12}{8} = \tfrac32 \end{aligned}" />

        <Callout variant="methode" title="Le « carré des probabilités » : une image pour ne plus se tromper">
          <p>
            Dessine un carré de côté 1. Coupe-le verticalement selon les probabilités de J2 (3/4
            pour Pile, 1/4 pour Face), puis horizontalement selon celles de J1 (1/2 et 1/2). Tu
            obtiens quatre rectangles, un par case du jeu. L'<strong>aire</strong> de chaque
            rectangle (largeur × hauteur) est la probabilité de cette case, et les quatre aires
            totalisent 1. Le payoff attendu se calcule alors en trois gestes :
          </p>
          <ol className="my-2 list-decimal space-y-1 pl-6">
            <li>calcule l'aire de chaque rectangle (le produit des deux probabilités) ;</li>
            <li>multiplie chaque aire par le payoff de la case ;</li>
            <li>additionne les quatre résultats.</li>
          </ol>
        </Callout>

        <ProbabilitySquare />

        <Callout variant="examen" title="Piège classique">
          <p>
            Pour obtenir la probabilité d'une case, on <strong>multiplie</strong> les probabilités
            des deux joueurs (tirages indépendants) ; on ne les additionne pas. Contrôle rapide :
            les quatre probabilités doivent totaliser 1 (ici 3/8 + 3/8 + 1/8 + 1/8 = 1).
          </p>
        </Callout>

        <Quiz
          scope="b1"
          id="q6-carre"
          question={
            <>
              Le joueur 1 joue Pile avec probabilité 1/4, le joueur 2 joue Pile avec probabilité
              1/2. Quelle est la probabilité de la case (Pile, Face) ?
            </>
          }
          options={[
            {
              text: <>1/8</>,
              correct: true,
              explain: (
                <>
                  Oui : J1 joue Pile (1/4) <em>et</em> J2 joue Face (1 − 1/2 = 1/2). Les tirages
                  sont indépendants, on multiplie : 1/4 × 1/2 = 1/8.
                </>
              ),
            },
            {
              text: <>3/4</>,
              explain: (
                <>
                  Non : 3/4 = 1/4 + 1/2, c'est une addition. Pour une case (« J1 fait ceci{" "}
                  <em>et</em> J2 fait cela »), on multiplie les probabilités.
                </>
              ),
            },
            {
              text: <>1/2</>,
              explain: (
                <>
                  Non : 1/2 est seulement la probabilité que J2 joue Face. Il faut encore que J1
                  joue Pile (1/4) : 1/4 × 1/2 = 1/8.
                </>
              ),
            },
          ]}
        />

        {/* ---------------------------------------------------------- */}
        <H4>
          5. L'équilibre de Nash en stratégies mixtes <Slide n="58" />
        </H4>
        <p>Le concept d'équilibre de Nash se généralise facilement aux stratégies mixtes :</p>
        <Callout variant="definition" title="Définition — équilibre de Nash en stratégies mixtes (EN mixte)">
          <p>
            Le profil de stratégies <M tex="(s_1, \dots, s_n)" /> est un{" "}
            <strong>équilibre de Nash en stratégies mixtes</strong> si, pour tous les joueurs{" "}
            <M tex="i" />, <M tex="s_i" /> est une meilleure réponse à <M tex="s_{-i}" />, dans le
            sens où <M tex="s_i" /> permet de <strong>maximiser le payoff attendu</strong> par{" "}
            <M tex="i" />.
          </p>
        </Callout>
        <p>
          C'est la même idée qu'au § 5 (des meilleures réponses mutuelles : personne ne regrette
          son choix), avec deux changements : les stratégies sont des distributions de probabilité,
          et chacun compare des payoffs <em>attendus</em>. Pour voir concrètement ce que cela
          signifie, le cours identifie un EN mixte dans un jeu particulier, en analysant les
          meilleures réponses de chaque joueur : le pénalty.
        </p>
        {/* ---------------------------------------------------------- */}
        <H4>
          6. ⭐ Le pénalty, pas à pas <Slide n="59-64" />
        </H4>
        <p>
          Fin d'un match de football : un attaquant reçoit un pénalty. Au coup de sifflet, il tire
          soit du côté <strong>droit</strong> du but, soit du côté <strong>gauche</strong>.
          Simultanément, le gardien plonge soit à droite, soit à gauche. Les payoffs sont les{" "}
          <strong>pourcentages de réussite</strong> de chacun dans chaque cas de figure (slide 59) :
        </p>
        <PayoffMatrix
          rowPlayer="Attaquant"
          colPlayer="Gardien"
          rows={["Droit (p)", "Gauche (1−p)"]}
          cols={["Droit (q)", "Gauche (1−q)"]}
          payoffs={[
            [
              [50, 50],
              [80, 20],
            ],
            [
              [90, 10],
              [20, 80],
            ],
          ]}
          caption={
            <>
              Slide 59. Lecture : si l'attaquant tire à gauche et que le gardien plonge à droite,
              l'attaquant marque 90 fois sur 100 (le gardien n'arrête que 10 tirs sur 100). Dans
              chaque case, les deux payoffs totalisent 100.
            </>
          }
        />
        <p>
          Premier réflexe : existe-t-il un EN en stratégies pures ? Non. Face à un gardien qui
          plonge à droite, l'attaquant préfère tirer à gauche (90 &gt; 50) ; face à un tir à gauche,
          le gardien préfère plonger à gauche (80 &gt; 10) ; face à ce plongeon, l'attaquant préfère
          tirer à droite (80 &gt; 20) ; face à un tir à droite, le gardien préfère plonger à droite
          (50 &gt; 20)… et la ronde de matching pennies recommence. C'est un jeu de conflit : place
          aux stratégies mixtes.
        </p>

        <Step
          n="1"
          title={
            <>
              Les stratégies deviennent des nombres <Slide n="59-60" />
            </>
          }
        >
          <p>
            Notation du cours : la stratégie mixte d'un joueur est résumée par la probabilité avec
            laquelle il joue la stratégie pure « Droit » :
          </p>
          <UL>
            <li>
              <M tex="p" /> = la probabilité que l'attaquant joue Droit, donc <M tex="1 - p" /> =
              la probabilité qu'il joue Gauche ;
            </li>
            <li>
              <M tex="q" /> = la probabilité que le gardien joue Droit, donc <M tex="1 - q" /> = la
              probabilité qu'il joue Gauche.
            </li>
          </UL>
          <p>L'ensemble des stratégies de chaque joueur devient un intervalle de nombres :</p>
          <MB tex="S_A = \{p \in [0, 1]\} \qquad\qquad S_G = \{q \in [0, 1]\}" />
          <p>
            <M tex="p = 1" /> correspond à la stratégie pure Droit et <M tex="p = 0" /> à la
            stratégie pure Gauche (de même pour <M tex="q" />). Au lieu de choisir une ligne,
            l'attaquant règle un curseur entre 0 et 1 : il a désormais une infinité de stratégies.
          </p>
        </Step>

        <Step
          n="2"
          title={
            <>
              Les payoffs attendus, case par case <Slide n="61" />
            </>
          }
        >
          <p>
            Comme dans matching pennies, chaque case arrive avec le produit des probabilités :
            (Droit, Droit) avec <M tex="pq" />, (Droit, Gauche) avec <M tex="p(1-q)" />, (Gauche,
            Droit) avec <M tex="(1-p)q" /> et (Gauche, Gauche) avec <M tex="(1-p)(1-q)" />. On
            pondère chaque payoff de l'attaquant par la probabilité de sa case :
          </p>
          <MB tex="U_A(p, q) = pq\,50 + p(1-q)\,80 + (1-p)q\,90 + (1-p)(1-q)\,20" />
          <p>
            Développons chaque terme, puis regroupons ce qui va ensemble : les constantes, les
            termes en <M tex="p" />, en <M tex="q" /> et en <M tex="pq" />. Le tableau fait la
            comptabilité ; lis-le ligne par ligne, puis fais les totaux en colonne :
          </p>
          <ExpansionTable
            rows={[
              ["pq\\,50", "", "", "", "+50"],
              ["p(1-q)\\,80", "", "+80", "", "-80"],
              ["(1-p)q\\,90", "", "", "+90", "-90"],
              ["(1-p)(1-q)\\,20", "+20", "-20", "-20", "+20"],
            ]}
            total={["Total", "20", "60", "70", "-100"]}
          />
          <p>
            Par exemple, la dernière ligne vient de <M tex="(1-p)(1-q) = 1 - p - q + pq" />, que
            l'on multiplie par 20. Les totaux donnent le résultat du slide :
          </p>
          <MB tex="U_A(p, q) = 20 + 60p + 70q - 100pq" />
          <p>Même mécanique pour le gardien, avec ses propres payoffs :</p>
          <MB tex="\begin{aligned} U_G(p, q) &= pq\,50 + p(1-q)\,20 + (1-p)q\,10 + (1-p)(1-q)\,80 \\ &= 80 - 60p - 70q + 100pq \end{aligned}" />
          <p>
            Contrôle express : dans chaque case, les deux payoffs totalisent 100, donc{" "}
            <M tex="U_G = 100 - U_A" />. Et en effet,{" "}
            <M tex="100 - (20 + 60p + 70q - 100pq) = 80 - 60p - 70q + 100pq" /> ✔.
          </p>
        </Step>

        <Callout variant="definition" title="Définition — fonction de meilleure réponse (slide 61)">
          <p>
            Pour trouver l'EN mixte, on analyse les <strong>fonctions de meilleure réponse</strong>.
            La fonction de meilleure réponse d'un joueur indique,{" "}
            <strong>pour chaque stratégie de son adversaire</strong>, la meilleure réponse du
            joueur.
          </p>
          <p>
            Pour l'attaquant, elle répond à la question « si le gardien joue <M tex="q" />, quel{" "}
            <M tex="p" /> dois-je choisir ? » : c'est une fonction de <M tex="q" />. Pour le
            gardien, c'est une fonction de <M tex="p" />.
          </p>
        </Callout>

        <Step
          n="3"
          title={
            <>
              La meilleure réponse de l'attaquant <Slide n="62" />
            </>
          }
        >
          <p>
            Le slide regarde comment <M tex="U_A" /> évolue avec <M tex="p" />, en dérivant par
            rapport à <M tex="p" /> (<M tex="q" /> est fixé : c'est le choix du gardien,
            l'attaquant ne le contrôle pas) :
          </p>
          <MB tex="\frac{\partial U_A}{\partial p} = 60 - 100q" />
          <p>
            Pas à l'aise avec les dérivées ? Regroupe les termes en <M tex="p" /> :{" "}
            <M tex="U_A = (20 + 70q) + (60 - 100q)\,p" />. Pour un <M tex="q" /> donné, c'est une{" "}
            <strong>droite</strong> en <M tex="p" />, dont la pente vaut <M tex="60 - 100q" />. Trois
            cas de figure :
          </p>
          <UL>
            <li>
              <strong>
                Cas 1 : <M tex="q < 0{,}6" />
              </strong>
              . La pente est positive : <M tex="U_A" /> augmente de manière linéaire avec{" "}
              <M tex="p" />. La meilleure réponse est <M tex="p = 1" />, la stratégie pure Droit.
            </li>
            <li>
              <strong>
                Cas 2 : <M tex="q > 0{,}6" />
              </strong>
              . La pente est négative : <M tex="U_A" /> diminue de manière linéaire avec{" "}
              <M tex="p" />. La meilleure réponse est <M tex="p = 0" />, la stratégie pure Gauche.
            </li>
            <li>
              <strong>
                Cas 3 : <M tex="q = 0{,}6" />
              </strong>
              . La pente est nulle : <M tex="U_A" /> ne dépend pas de <M tex="p" />.{" "}
              <strong>
                N'importe quel <M tex="p \in [0, 1]" />
              </strong>{" "}
              est une meilleure réponse.
            </li>
          </UL>
          <p>
            <em>En mots :</em> tirer à droite est le choix « sûr » (50 ou 80 % de réussite), tirer à
            gauche le choix risqué (90 ou 20 %). L'attaquant tire donc à droite… sauf si le gardien
            plonge à droite plus de 6 fois sur 10.
          </p>
        </Step>

        <PayoffSeesaw />

        <Step
          n="4"
          title={
            <>
              La meilleure réponse du gardien <Slide n="63" />
            </>
          }
        >
          <p>
            Même raisonnement, en faisant cette fois varier <M tex="q" /> (<M tex="p" /> est
            fixé). Comme <M tex="U_G = (80 - 60p) + (100p - 70)\,q" /> :
          </p>
          <MB tex="\frac{\partial U_G}{\partial q} = 100p - 70" />
          <UL>
            <li>
              <strong>
                Cas 1 : <M tex="p < 0{,}7" />
              </strong>
              . <M tex="U_G" /> diminue de manière linéaire avec <M tex="q" /> : la meilleure
              réponse est <M tex="q = 0" />, la stratégie pure Gauche.
            </li>
            <li>
              <strong>
                Cas 2 : <M tex="p > 0{,}7" />
              </strong>
              . <M tex="U_G" /> augmente de manière linéaire avec <M tex="q" /> : la meilleure
              réponse est <M tex="q = 1" />, la stratégie pure Droit.
            </li>
            <li>
              <strong>
                Cas 3 : <M tex="p = 0{,}7" />
              </strong>
              . <M tex="U_G" /> ne dépend pas de <M tex="q" /> : n'importe quel{" "}
              <M tex="q \in [0, 1]" /> est une meilleure réponse.
            </li>
          </UL>
          <p>
            <em>En mots :</em> si l'attaquant tire souvent à droite (plus de 7 fois sur 10), le
            gardien plonge à droite ; sinon, il plonge à gauche. Vérifie-le dans la bascule
            ci-dessus en choisissant « Gardien ».
          </p>
        </Step>

        <Step
          n="5"
          title={
            <>
              Le croisement des deux fonctions : l'EN mixte <Slide n="64" />
            </>
          }
        >
          <p>
            Le slide 64 dessine les deux fonctions de meilleure réponse dans un même repère,{" "}
            <M tex="p" /> en abscisse et <M tex="q" /> en ordonnée :
          </p>
          <UL>
            <li>
              la <span className="font-semibold text-rose-700">meilleure réponse de l'attaquant</span>{" "}
              : <M tex="p = 1" /> tant que <M tex="q < 0{,}6" /> (trait vertical à droite), tout le
              segment horizontal à la hauteur <M tex="q = 0{,}6" />, puis <M tex="p = 0" />{" "}
              au-dessus (trait vertical à gauche) ;
            </li>
            <li>
              la <span className="font-semibold text-sky-700">meilleure réponse du gardien</span> :{" "}
              <M tex="q = 0" /> tant que <M tex="p < 0{,}7" /> (trait horizontal en bas), tout le
              segment vertical en <M tex="p = 0{,}7" />, puis <M tex="q = 1" /> au-delà (trait
              horizontal en haut).
            </li>
          </UL>
          <p>
            Un profil <M tex="(p, q)" /> est un EN si chaque stratégie est une meilleure réponse à
            l'autre, donc s'il se trouve <strong>sur les deux courbes à la fois</strong>. Les deux
            « escaliers » ne se croisent qu'en un seul point :
          </p>
          <MB tex="(p^*, q^*) = (0{,}7\,;\ 0{,}6)" />
          <p>
            C'est le <strong>seul équilibre de Nash en stratégies mixtes</strong> du pénalty :
            l'attaquant tire à droite 7 fois sur 10, le gardien plonge à droite 6 fois sur 10. À cet
            équilibre, l'attaquant marque en moyenne{" "}
            <M tex="U_A(0{,}7\,;\ 0{,}6) = 20 + 42 + 42 - 42 = 62" /> % des pénalties, et le gardien en arrête <M tex="U_G = 38" /> %. Aucun des deux ne
            peut faire mieux en déviant seul.
          </p>
        </Step>

        <p>
          L'explorateur ci-dessous reprend les trois étapes du cours : ① le carré des probabilités
          du pénalty (slide 61), ② les meilleures réponses, vues sous un autre angle (le payoff de
          chaque stratégie pure en fonction de ce que fait l'adversaire : la pente de la bascule est
          justement l'écart entre ces deux droites), ③ le croisement (slide 64). Amène le point sur
          l'équilibre et vérifie que plus personne ne veut bouger.
        </p>

        <PenaltyExplorer />
        {/* ---------------------------------------------------------- */}
        <H4>
          7. ⭐ Avantage théorique de l'EN <Slide n="65" />
        </H4>
        <Callout variant="retiens" title="⭐ Avantage théorique de l'EN — existence en stratégies mixtes">
          <p>
            Si les joueurs peuvent utiliser des stratégies mixtes, alors{" "}
            <strong>tous les jeux ont (au moins) un équilibre de Nash</strong>. L'EN offre donc{" "}
            <strong>toujours</strong> une prédiction, même dans le jeu de matching pennies.
          </p>
        </Callout>
        <p>
          C'est la réponse à la limitation du début de ce § : sans hasard, matching pennies n'avait
          aucun EN ; avec des stratégies mixtes, il en a un (on le calcule juste en dessous). Le
          cours ne démontre pas ce résultat : retiens l'énoncé.
        </p>

        {/* ---------------------------------------------------------- */}
        <H4>
          8. ⭐ Le théorème d'indifférence : l'outil de calcul <Slide n="65" />
        </H4>
        <Callout variant="retiens" title="⭐ Théorème — indifférence à l'équilibre en stratégie mixte">
          <p>
            Dans un équilibre de Nash en stratégies mixtes, chaque joueur est{" "}
            <strong>indifférent entre les stratégies pures qu'il utilise</strong>.
          </p>
          <p>
            Pour le jeu de pénalty : si <M tex="(p^*, q^*)" /> est un EN mixte, alors
          </p>
          <MB tex="U_A(\text{Droit}, q^*) = U_A(\text{Gauche}, q^*)" />
          <p className="text-center">et</p>
          <MB tex="U_G(p^*, \text{Droit}) = U_G(p^*, \text{Gauche})" />
          <p>
            Ce théorème permet de trouver facilement l'équilibre : la <strong>première</strong>{" "}
            équation donne <M tex="q^*" />, la <strong>seconde</strong> donne <M tex="p^*" />.
          </p>
        </Callout>
        <Callout variant="intuition" title="Pourquoi est-ce forcément vrai ?">
          <p>
            Imagine qu'à l'équilibre, face à <M tex="q^*" />, l'attaquant préfère strictement Droit
            à Gauche. Alors, chaque fois que son tirage au sort lui fait jouer Gauche, il perd des
            points : il ferait mieux de mettre toute sa probabilité sur Droit, et il ne mixerait
            plus. Mixer (mettre une probabilité strictement positive sur les deux stratégies pures)
            n'est donc optimal que si les deux rapportent <em>exactement</em> la même chose.
          </p>
          <p>
            Attention au mot « utilise » : le théorème parle des stratégies pures jouées avec une
            probabilité <strong>strictement positive</strong>. Une stratégie pure jamais jouée peut,
            elle, rapporter strictement moins.
          </p>
        </Callout>

        <H5>Recalculons l'équilibre du pénalty avec le théorème</H5>
        <Step
          n="a"
          title={
            <>
              Indifférence de l'attaquant : elle donne <M tex="q^*" />
            </>
          }
        >
          <p>
            S'il tire à droite, l'attaquant marque 50 si le gardien plonge à droite (probabilité{" "}
            <M tex="q" />) et 80 sinon (probabilité <M tex="1 - q" />). S'il tire à gauche : 90 ou
            20.
          </p>
          <MB tex="U_A(\text{Droit}, q) = 50q + 80(1 - q) = 80 - 30q" />
          <MB tex="U_A(\text{Gauche}, q) = 90q + 20(1 - q) = 20 + 70q" />
          <p>
            L'indifférence impose l'égalité : <M tex="80 - 30q = 20 + 70q" />, donc{" "}
            <M tex="60 = 100q" /> et <M tex="q^* = 0{,}6" /> ✔. On retrouve le seuil du cas 3 de
            l'attaquant : en <M tex="q = 0{,}6" />, sa bascule est plate.
          </p>
        </Step>
        <Step
          n="b"
          title={
            <>
              Indifférence du gardien : elle donne <M tex="p^*" />
            </>
          }
        >
          <MB tex="U_G(p, \text{Droit}) = 50p + 10(1 - p) = 10 + 40p" />
          <MB tex="U_G(p, \text{Gauche}) = 20p + 80(1 - p) = 80 - 60p" />
          <p>
            Égalité : <M tex="10 + 40p = 80 - 60p" />, donc <M tex="100p = 70" /> et{" "}
            <M tex="p^* = 0{,}7" /> ✔. Deux petites équations au lieu de tout le développement :
            c'est la méthode à utiliser à l'examen.
          </p>
        </Step>
        <Callout variant="examen" title="Le piège n° 1 : qui donne quoi ?">
          <p>
            L'indifférence de l'<strong>attaquant</strong> utilise <em>ses</em> payoffs mais ne
            contient que <M tex="q" /> : elle détermine la stratégie du <strong>gardien</strong>. Et
            inversement. La stratégie d'équilibre de chaque joueur est donc fixée par les payoffs de{" "}
            <em>l'autre</em> : <M tex="p^* = 0{,}7" /> est la probabilité qui rend le gardien
            indifférent, <M tex="q^* = 0{,}6" /> celle qui rend l'attaquant indifférent.
          </p>
        </Callout>

        <H5>Application éclair : l'équilibre de matching pennies</H5>
        <p>
          Notons cette fois <M tex="p" /> la probabilité que J1 joue Pile et <M tex="q" /> celle de
          J2. Même recette :
        </p>
        <UL>
          <li>
            indifférence de J1 (donne <M tex="q" />) : <M tex="U_1(P, q) = 0 \cdot q + 3(1 - q)" /> et{" "}
            <M tex="U_1(F, q) = 3q + 0 \cdot (1 - q)" />. Égalité : <M tex="3 - 3q = 3q" />, donc{" "}
            <M tex="q^* = \tfrac12" /> ;
          </li>
          <li>
            indifférence de J2 (donne <M tex="p" />) : <M tex="U_2(p, P) = 3p" /> et{" "}
            <M tex="U_2(p, F) = 3(1 - p)" />. Égalité : <M tex="3p = 3 - 3p" />, donc{" "}
            <M tex="p^* = \tfrac12" />.
          </li>
        </UL>
        <p>
          L'EN mixte de matching pennies est donc <M tex="(\tfrac12\,;\ \tfrac12)" /> : chacun joue
          Pile et Face avec probabilité 1/2 (le slide 70 le rappelle), et chacun gagne en moyenne{" "}
          <M tex="\tfrac32" />. Tu l'avais vu dans le carré des probabilités : dès qu'un joueur est
          à 1/2, l'autre obtient 1,5 quoi qu'il fasse ; il est donc bien indifférent.
        </p>

        <Quiz
          scope="b1"
          id="q6"
          question={
            <>
              À l'EN mixte du pénalty, pourquoi l'attaquant joue-t-il exactement{" "}
              <M tex="p^* = 0{,}7" /> ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Parce que 0,7 maximise son propre payoff attendu quelle que soit la stratégie du
                  gardien.
                </>
              ),
              explain: (
                <>
                  Non : regarde le calcul, <M tex="p^* = 0{,}7" /> sort de l'équation
                  d'indifférence du <strong>gardien</strong>. Les payoffs de l'attaquant
                  déterminent <M tex="q^*" />, pas <M tex="p^*" />. Et aucun <M tex="p" /> n'est
                  optimal « quoi que fasse le gardien » : sa meilleure réponse dépend de{" "}
                  <M tex="q" /> (les 3 cas).
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que <M tex="p^* = 0{,}7" /> rend le gardien indifférent entre plonger à
                  droite et à gauche.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement ! <M tex="p^* = 0{,}7" /> rend le <strong>gardien</strong> indifférent
                  entre Droite et Gauche, donc prêt à mixer lui aussi. Et à{" "}
                  <M tex="q^* = 0{,}6" />, l'attaquant est de toute façon indifférent : jouer 0,7
                  ne lui coûte rien. C'est la logique croisée de l'équilibre mixte.
                </>
              ),
            },
            {
              text: <>Parce qu'il réussit 70 % de ses tirs à droite.</>,
              explain: (
                <>
                  Non : 0,7 est une fréquence de tir, pas un taux de réussite. À l'équilibre, son
                  taux de réussite est d'ailleurs le même à droite et à gauche (62 %) : c'est le
                  théorème d'indifférence.
                </>
              ),
            },
          ]}
        />
        {/* ---------------------------------------------------------- */}
        <H4>
          9. ⭐ Police vs mafia : un résultat surprenant <Slide n="66-67" />
        </H4>
        <p>
          Le cours applique l'EN mixte à un phénomène surprenant. La police combat le crime organisé
          dans une ville. Ses ressources sont limitées : chaque jour, elle déploie ses forces soit
          en <strong>Ville</strong>, soit en <strong>Banlieue</strong>. Parallèlement, la mafia
          décide chaque jour de mener ses activités criminelles soit en ville, soit en banlieue. Un
          jour, la police développe une nouvelle technologie qui rend ses actions{" "}
          <em>en banlieue</em> plus efficaces : le paramètre <M tex="x" /> augmente.
        </p>

        <SymbolicMatrix
          rowPlayer="Police"
          colPlayer="Mafia"
          rows={["Ville (p)", "Banlieue (1−p)"]}
          cols={["Ville (q)", "Banlieue (1−q)"]}
          cells={[
            [
              [<M key="a" tex="80" />, <M key="b" tex="20" />],
              [<M key="a" tex="0" />, <M key="b" tex="100" />],
            ],
            [
              [<M key="a" tex="0" />, <M key="b" tex="100" />],
              [<M key="a" tex="x" />, <M key="b" tex="100 - x" />],
            ],
          ]}
          caption={
            <>
              Slide 66. <M tex="p" /> = probabilité que la police aille en Ville, <M tex="q" /> =
              probabilité que la mafia opère en Ville. Dans chaque case, les payoffs totalisent 100.
            </>
          }
        />
        <p>
          Lecture : si la mafia opère là où la police n'est pas, elle a le champ libre (100 pour la
          mafia, 0 pour la police). Si les deux se retrouvent en ville, la police obtient 80 ; si
          elles se retrouvent en banlieue, la police obtient <M tex="x" />. C'est ce{" "}
          <M tex="x" /> que la nouvelle technologie fait grimper.
        </p>
        <p>
          <strong>La question du slide 67</strong> : comment cette technologie va-t-elle influencer
          la fréquence à laquelle la police se rend en banlieue ? Le réflexe serait de répondre
          « plus souvent, puisqu'elle y est devenue plus efficace ». Faisons le calcul.
        </p>

        <Step n="1" title="Quel joueur faut-il rendre indifférent ?">
          <p>
            On cherche <M tex="p^*" />, la stratégie de la <em>police</em>. Par le théorème
            d'indifférence, <M tex="p^*" /> est la probabilité qui rend la <strong>mafia</strong>{" "}
            indifférente entre Ville et Banlieue (même logique croisée que pour le pénalty) :
          </p>
          <MB tex="U_M(p^*, V) = U_M(p^*, B)" />
        </Step>
        <Step n="2" title="Écrire les deux payoffs attendus de la mafia">
          <p>
            En Ville, la mafia obtient 20 quand la police est en ville (probabilité{" "}
            <M tex="p^*" />) et 100 sinon. En Banlieue, elle obtient 100 quand la police est en
            ville et <M tex="100 - x" /> quand la police est en banlieue :
          </p>
          <MB tex="p^* \cdot 20 + (1 - p^*) \cdot 100 = p^* \cdot 100 + (1 - p^*)(100 - x)" />
          <Callout variant="attention" title="Parenthèses manquantes sur le slide 67">
            <p>
              Le slide écrit « … + (1 − p*)100 − x », sans parenthèses autour de 100 − x. Il faut
              lire <M tex="(1 - p^*)(100 - x)" /> : c'est ce qu'impose la case Banlieue-Banlieue de
              la matrice, et c'est la seule lecture qui mène au résultat du slide,{" "}
              <M tex="p^* = x/(80 + x)" />.
            </p>
          </Callout>
        </Step>
        <Step n="3" title="Résoudre l'équation">
          <p>On développe chaque côté, puis on égalise (chaque ligne découle de la précédente) :</p>
          <MB tex="\begin{aligned} \text{côté gauche : }\; & 20p^* + 100 - 100p^* = 100 - 80p^* \\ \text{côté droit : }\; & 100p^* + 100 - x - 100p^* + xp^* = 100 - x + xp^* \\ \text{égalité : }\; & 100 - 80p^* = 100 - x + xp^* \;\Longleftrightarrow\; x = 80p^* + xp^* = p^*(80 + x) \end{aligned}" />
          <p>On divise par <M tex="80 + x" /> :</p>
          <MB tex="p^* = \frac{x}{80 + x}" />
        </Step>
        <Step n="4" title="Comment p* réagit-il quand x augmente ?">
          <MB tex="\frac{\partial p^*}{\partial x} = \frac{(80 + x) \cdot 1 - x \cdot 1}{(80 + x)^2} = \frac{80}{(80 + x)^2} > 0" />
          <p>
            <M tex="p^*" /> augmente avec <M tex="x" /> : à l'équilibre, la police va{" "}
            <strong>plus souvent en ville</strong> lorsque <M tex="x" /> augmente. Exemples :{" "}
            <M tex="x = 20" /> donne <M tex="p^* = 0{,}2" /> (banlieue 80 % du temps) ;{" "}
            <M tex="x = 80" /> donne <M tex="p^* = 0{,}5" /> (banlieue 50 % du temps).
          </p>
        </Step>

        <Callout variant="retiens" title="La conclusion du slide 67">
          <p>
            De manière surprenante, la police sera <strong>moins présente en banlieue</strong>{" "}
            lorsque ses actions en banlieue sont <strong>plus efficaces</strong>.
          </p>
        </Callout>

        <PoliceMafia />

        <Callout variant="intuition" title="Pourquoi ce paradoxe ?">
          <p>
            À l'équilibre mixte, la stratégie de la police ne sert pas à exploiter ses propres
            forces : elle sert à <strong>maintenir la mafia indifférente</strong>. Quand{" "}
            <M tex="x" /> augmente, opérer en banlieue devient plus risqué pour la mafia. Si la
            police continuait à y aller aussi souvent, la mafia préférerait strictement la ville, et
            ce ne serait plus un équilibre. Pour rétablir l'indifférence de la mafia, la police doit
            relâcher la pression en banlieue. Voilà le genre de conclusion que seule la théorie des
            jeux permet de voir.
          </p>
        </Callout>

        {/* ---------------------------------------------------------- */}
        <H4>
          10. Sur le terrain : comment interpréter un EN mixte ? <Slide n="68-69" />
        </H4>
        <p>
          On observe très rarement des attaquants tirer à pile ou face avant de shooter leur
          pénalty ! L'interprétation du cours (slide 68) :
        </p>
        <UL>
          <li>
            en pratique, un joueur <strong>hésite</strong> au moment de choisir entre ses
            différentes actions. Des petits détails dans son processus de décision le font pencher
            dans un sens ou dans l'autre. À l'équilibre, ces détails le font choisir chaque action
            avec la probabilité appropriée ;
          </li>
          <li>
            un joueur rationnel se base sur une <strong>croyance</strong> à propos de la
            probabilité que son adversaire utilise une action plutôt qu'une autre, puis il joue sa
            meilleure réponse étant donné cette croyance. À l'équilibre, ces croyances sont{" "}
            <strong>correctes</strong> (confirmées en pratique).
          </li>
        </UL>
        <p>
          Les meilleures preuves empiriques en faveur de l'EN mixte viennent du{" "}
          <strong>sport professionnel</strong>, où les joueurs sont expérimentés et les gains élevés
          (on retrouve les deux facteurs du § 7). <strong>Walker et Wooders (2002)</strong> ont
          étudié dix finales de tournois du Grand Chelem de tennis. Pour chaque point, ils ont codé
          si le service était frappé plutôt sur la gauche ou plutôt sur la droite de la zone
          autorisée, et qui avait gagné le point.
        </p>
        <p>
          Ils ont testé le <strong>théorème d'indifférence</strong>. Ici, il implique qu'un serveur
          est indifférent entre servir plutôt à gauche et plutôt à droite. Effectivement, ils ont
          trouvé que la probabilité de gagner le point était <strong>la même</strong> lorsqu'il
          servait plutôt à gauche ou plutôt à droite.
        </p>
        <Callout variant="examen" title="Ce que prédit le théorème, exactement">
          <p>
            Le théorème d'indifférence ne prédit pas que le serveur sert autant à gauche qu'à
            droite : il prédit que son <strong>taux de réussite</strong> est le même des deux
            côtés. C'est cette égalité que l'on teste.
          </p>
        </Callout>

        {/* ---------------------------------------------------------- */}
        <H4>
          11. En labo : matching pennies et la loi binomiale <Slide n="70" />
        </H4>
        <p>
          Les étudiants du cours ont joué à matching pennies. À l'équilibre, chaque joueur joue
          chacune de ses stratégies pures avec probabilité 1/2. Si c'est le cas, la théorie prédit
          que le nombre <M tex="X" /> de joueurs ayant joué Pile suit une{" "}
          <strong>loi binomiale</strong> :
        </p>
        <MB tex="X \sim Bi(n, p)" />
        <p>
          où <M tex="n" /> est le nombre d'étudiants et <M tex="p = 1/2" /> la probabilité de jouer
          Pile. (Attention : ici, <M tex="p" /> n'est plus la stratégie de l'attaquant, c'est le
          paramètre de la loi binomiale.)
        </p>
        <p>
          Parmi <M tex="n = 56" /> étudiants, <strong>26</strong> ont joué Pile au premier tour. La
          moitié de 56 est 28, pas 26 : faut-il en conclure que les étudiants ne jouent pas
          l'équilibre ? Non. Si chacun avait tiré au hasard avec probabilité 1/2, observer 26 Pile{" "}
          <em>ou encore moins</em> aurait été tout à fait banal :
        </p>
        <MB tex="P(X \le 26) = \sum_{k=0}^{26} \binom{56}{k} \left(\tfrac12\right)^{56} \approx 0{,}344" />
        <p>
          (On ne fait pas ce calcul à la main : on le lit dans une table de la fonction de
          répartition, ou on le demande à une calculatrice.) On ne peut donc pas rejeter
          l'hypothèse que les étudiants jouent l'équilibre mixte.
        </p>
        <Callout variant="attention" title="Petit écart avec le slide, sans conséquence">
          <p>
            Le slide 70 indique « plus de 35 % » (approximation sur base des tables). Le calcul
            exact donne <strong>34,4 %</strong>. La conclusion ne change pas : un écart de 2 Pile
            par rapport à 28 est tout à fait compatible avec le hasard.
          </p>
        </Callout>

        <BinomialPennies />

        {/* ---------------------------------------------------------- */}
        <ExerciseBlock
          scope="b1"
          id="ex4"
          number={4}
          title="Le service au tennis"
          difficulty={2}
          statement={
            <>
              <p>
                Un serveur sert à Gauche ou à Droite ; le receveur anticipe un côté. Les payoffs
                sont les probabilités de gagner le point, en % (chiffres illustratifs ; receveur =
                100 − serveur) :
              </p>
              <PayoffMatrix
                rowPlayer="Serveur"
                colPlayer="Receveur"
                rows={["Gauche (p)", "Droite (1−p)"]}
                cols={["gauche (q)", "droite (1−q)"]}
                payoffs={[
                  [
                    [40, 60],
                    [80, 20],
                  ],
                  [
                    [90, 10],
                    [30, 70],
                  ],
                ]}
              />
              <p>
                <strong>a)</strong> Montre qu'il n'y a aucun EN en stratégies pures.{" "}
                <strong>b)</strong> Calcule l'EN mixte <M tex="(p^*, q^*)" /> avec le théorème
                d'indifférence. <strong>c)</strong> Quel est le taux de réussite du serveur à
                l'équilibre ? Qu'est-ce que Walker et Wooders ont vérifié chez les pros ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) Aucun EN pur (méthode des meilleures réponses)",
              content: (
                <p>
                  Meilleures réponses du serveur : face à gauche → Droite (90 &gt; 40) ; face à
                  droite → Gauche (80 &gt; 30). Meilleures réponses du receveur : face à Gauche →
                  gauche (60 &gt; 20) ; face à Droite → droite (70 &gt; 10). Aucune case n'est une
                  meilleure réponse pour les deux : <strong>pas d'EN pur</strong> (jeu de conflit :
                  le total fait 100 dans chaque case).
                </p>
              ),
            },
            {
              title: "b) L'EN mixte par le théorème d'indifférence",
              content: (
                <>
                  <p>
                    Indifférence du <em>serveur</em> (elle donne <M tex="q^*" />) :
                  </p>
                  <MB tex="40q + 80(1-q) = 90q + 30(1-q) \;\Longrightarrow\; 80 - 40q = 30 + 60q \;\Longrightarrow\; q^* = 0{,}5" />
                  <p>
                    Indifférence du <em>receveur</em> (elle donne <M tex="p^*" />) :
                  </p>
                  <MB tex="60p + 10(1-p) = 20p + 70(1-p) \;\Longrightarrow\; 10 + 50p = 70 - 50p \;\Longrightarrow\; p^* = 0{,}6" />
                  <p>
                    EN mixte : <M tex="(p^*, q^*) = (0{,}6\,;\ 0{,}5)" />.
                  </p>
                </>
              ),
            },
            {
              title: "c) Le taux de réussite à l'équilibre",
              content: (
                <p>
                  À l'équilibre, le serveur est indifférent :{" "}
                  <M tex="U_S(\text{Gauche}, 0{,}5) = 40 \cdot 0{,}5 + 80 \cdot 0{,}5 = 60" /> et{" "}
                  <M tex="U_S(\text{Droite}, 0{,}5) = 90 \cdot 0{,}5 + 30 \cdot 0{,}5 = 60" />. Il
                  gagne 60 % des points, qu'il serve à gauche ou à droite : le{" "}
                  <strong>même taux des deux côtés</strong>. C'est cette égalité (pas le chiffre
                  de 60 %, inventé ici) que Walker et Wooders ont observée chez les pros.
                </p>
              ),
            },
          ]}
          result={
            <p>
              EN mixte <M tex="(p^*, q^*) = (0{,}6\,;\ 0{,}5)" /> ; taux de réussite du serveur :
              60 % des deux côtés. Rappelle-toi la recette : l'indifférence de chaque joueur
              détermine la stratégie de <em>l'autre</em>.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* S9 — Exercices récapitulatifs                                 */}
      {/* ============================================================ */}
      <Section id="s9" kicker="§ 9" title="Exercices récapitulatifs">
        <p>
          Trois exercices « format examen » qui mélangent tout le chapitre. Fais-les{" "}
          <strong>sur papier d'abord</strong>, puis compare avec la solution.
        </p>

        <ExerciseBlock
          scope="b1"
          id="ex5"
          number={5}
          title="Tous les EN d'un jeu 3×3"
          difficulty={2}
          statement={
            <>
              <p>
                Trouve <em>tous</em> les équilibres de Nash en stratégies pures du jeu suivant :
              </p>
              <PayoffMatrix
                rowPlayer="P1"
                colPlayer="P2"
                rows={["H", "M", "B"]}
                cols={["L", "C", "R"]}
                payoffs={[
                  [
                    [1, 3],
                    [4, 2],
                    [2, 2],
                  ],
                  [
                    [3, 1],
                    [2, 3],
                    [3, 2],
                  ],
                  [
                    [2, 2],
                    [1, 1],
                    [4, 4],
                  ],
                ]}
              />
            </>
          }
          steps={[
            {
              title: "Meilleures réponses de P1 (payoffs rouges, colonne par colonne)",
              content: (
                <p>
                  Colonne L → <M tex="\max(1, 3, 2) = 3" /> → <strong>M</strong> ; colonne C →{" "}
                  <M tex="\max(4, 2, 1) = 4" /> → <strong>H</strong> ; colonne R →{" "}
                  <M tex="\max(2, 3, 4) = 4" /> → <strong>B</strong>.
                </p>
              ),
            },
            {
              title: "Meilleures réponses de P2 (payoffs bleus, ligne par ligne)",
              content: (
                <p>
                  Ligne H → <M tex="\max(3, 2, 2) = 3" /> → <strong>L</strong> ; ligne M →{" "}
                  <M tex="\max(1, 3, 2) = 3" /> → <strong>C</strong> ; ligne B →{" "}
                  <M tex="\max(2, 1, 4) = 4" /> → <strong>R</strong>.
                </p>
              ),
            },
            {
              title: "Croisement des meilleures réponses",
              content: (
                <>
                  <p>
                    (M, L) ? MR de P2 en ligne M est C, pas L ✘. (H, C) ? MR de P2 en ligne H est
                    L ✘. (B, R) ? MR de P1 en colonne R est B ✔ <em>et</em> MR de P2 en ligne B
                    est R ✔ → <strong>EN unique : (B, R)</strong>, payoffs (4 ; 4).
                  </p>
                  <p>
                    À l'examen, écris-le sous forme d'inégalités (format du slide 28) : chaque
                    joueur ne gagne rien à dévier seul de (B, R).
                  </p>
                  <MB tex="u_1(B, R) = 4 \ge u_1(H, R) = 2 \quad\text{et}\quad u_1(B, R) = 4 \ge u_1(M, R) = 3" />
                  <MB tex="u_2(B, R) = 4 \ge u_2(B, L) = 2 \quad\text{et}\quad u_2(B, R) = 4 \ge u_2(B, C) = 1" />
                  <p>Vérifie avec les boutons :</p>
                  <PayoffMatrix
                    rowPlayer="P1"
                    colPlayer="P2"
                    rows={["H", "M", "B"]}
                    cols={["L", "C", "R"]}
                    payoffs={[
                      [
                        [1, 3],
                        [4, 2],
                        [2, 2],
                      ],
                      [
                        [3, 1],
                        [2, 3],
                        [3, 2],
                      ],
                      [
                        [2, 2],
                        [1, 1],
                        [4, 4],
                      ],
                    ]}
                    interactive
                  />
                </>
              ),
            },
          ]}
          result={
            <p>
              EN unique : (B, R), payoffs (4 ; 4). Note : c'est ici en plus le meilleur résultat
              possible — mais souviens-toi que ce n'est pas toujours le cas (dilemme du
              prisonnier !).
            </p>
          }
        />

        <ExerciseBlock
          scope="b1"
          id="ex6"
          number={6}
          title="La garantie des dépôts, en chiffres"
          difficulty={2}
          statement={
            <>
              <p>
                Deux épargnants ont chacun placé <M tex="m = 100" /> à la banque, au taux{" "}
                <M tex="r = 5\ \%" />. L'État garantit les dépôts à hauteur de <M tex="g" />.
                (C'est le jeu des paniques bancaires du § 5, slide 33.)
              </p>
              <p>
                <strong>a)</strong> Écris la matrice pour <M tex="g = 0" /> et identifie tous les
                EN. <strong>b)</strong> Quelle valeur minimale de <M tex="g" /> rend « Laisser »
                (faiblement) dominante ? <strong>c)</strong> Dans le modèle, à l'ESD (L, L), l'État
                doit-il verser la garantie ? Pourquoi (R, R) reste-t-il néanmoins un EN ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) La matrice avec g = 0 et ses deux EN",
              content: (
                <>
                  <p>
                    Avec <M tex="g = 0" /> : (L, L) → (105 ; 105) ; (L, R) → (0 ; 100) ; (R, L) →
                    (100 ; 0) ; (R, R) → (100 ; 100). Meilleures réponses : face à L, mieux vaut L (
                    <M tex="105 > 100" />) ; face à R, mieux vaut R (<M tex="100 > 0" />
                    ). <strong>Deux EN : (L, L) et (R, R)</strong> : c'est la structure de la
                    chasse au cerf. L'existence de l'EN (R, R) rend la panique bancaire possible et
                    rationnelle (slide 33).
                  </p>
                  <PayoffMatrix
                    rowPlayer="Investisseur 1"
                    colPlayer="Investisseur 2"
                    rows={["Laisser", "Retirer"]}
                    cols={["Laisser", "Retirer"]}
                    payoffs={[
                      [
                        [105, 105],
                        [0, 100],
                      ],
                      [
                        [100, 0],
                        [100, 100],
                      ],
                    ]}
                    interactive
                  />
                </>
              ),
            },
            {
              title: "b) La garantie minimale",
              content: (
                <p>
                  Laisser domine Retirer si : face à L, <M tex="105 \ge 100" /> ✔ (toujours
                  vrai) ; face à R, <M tex="\min(g, 100) \ge 100" />, c'est-à-dire{" "}
                  <strong>
                    <M tex="g \ge 100 = m" />
                  </strong>
                  . Dès que la garantie couvre le dépôt (<M tex="g \ge m" />), (L, L) devient un
                  ESD et céder à la panique devient irrationnel (slide 33).
                </p>
              ),
            },
            {
              title: "c) La garantie est-elle versée ? Et (R, R) ?",
              content: (
                <>
                  <p>
                    <strong>Non</strong>, pas à l'équilibre (L, L) : personne ne retire, donc la
                    banque ne fait pas faillite (slide 33), et la garantie n'est versée qu'en cas
                    de faillite.
                  </p>
                  <p>
                    Mais (R, R) reste un EN, <strong>faible</strong> : face à R, Retirer rapporte{" "}
                    <M tex="m" /> et Laisser rapporte <M tex="\min(g, m) = m" />. Les deux sont des
                    meilleures réponses, donc personne ne gagne strictement à dévier de (R, R).
                    Laisser n'est que <em>faiblement</em> dominante.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              Sans garantie : deux EN, dont la panique (chasse au cerf). Avec <M tex="g \ge m" /> :
              Laisser devient (faiblement) dominante, (L, L) est un ESD et céder à la panique
              devient irrationnel ; dans le modèle, la garantie n'est pas versée à l'équilibre
              (L, L). Piège : (R, R) reste un EN faible.
            </p>
          }
        />

        <ExerciseBlock
          scope="b1"
          id="ex7"
          number={7}
          title="Question de réflexion type examen"
          difficulty={3}
          statement={
            <>
              <p>Vrai ou faux ? Justifie chaque réponse en 1–2 phrases.</p>
              <p>
                <strong>a)</strong> « Si un jeu a un ESD, alors ce jeu a exactement un équilibre
                de Nash. »
                <br />
                <strong>b)</strong> « Dans un EN mixte, un joueur qui joue ses deux stratégies
                pures avec une probabilité strictement positive peut strictement préférer l'une à
                l'autre. »
                <br />
                <strong>c)</strong> « Si un profil de stratégies survit à l'élimination itérative
                (PSS), alors c'est un équilibre de Nash. »
                <br />
                <strong>d)</strong> « Dans le jeu Haut/Bas du labo (slide 42), 29 % des
                étudiants-P1 ont joué Bas, une stratégie qui n'entre dans aucun PSS. Cela prouve
                qu'ils sont irrationnels. »
              </p>
            </>
          }
          steps={[
            {
              title: "a) Faux (piège subtil)",
              content: (
                <p>
                  Un ESD est toujours un EN, mais il peut coexister avec d'autres EN. Exemple du
                  cours : la banque avec <M tex="g \ge m" /> — (L, L) est un ESD en dominance{" "}
                  <em>faible</em>, et (R, R) reste un EN (face à R, Retirer rapporte{" "}
                  <M tex="m" /> et Laisser rapporte <M tex="\min(g, m) = m" /> : les deux sont des
                  meilleures réponses, donc (R, R) reste un EN faible). Avec des dominances{" "}
                  <em>strictes</em>, en revanche, l'ESD serait l'unique EN.
                </p>
              ),
            },
            {
              title: "b) Faux",
              content: (
                <p>
                  C'est le théorème d'indifférence (slide 65) : à l'équilibre, chaque joueur est
                  indifférent entre les stratégies pures <em>qu'il utilise</em>. S'il préférait
                  strictement l'une, chaque tirage qui lui fait jouer l'autre réduirait son payoff
                  attendu : il ne mixerait pas. Nuance : sans la précision « avec une probabilité
                  strictement positive », l'affirmation pourrait être vraie (un EN pur est aussi un
                  EN en stratégies mixtes, et une stratégie jamais jouée peut rapporter strictement
                  moins).
                </p>
              ),
            },
            {
              title: "c) Faux",
              content: (
                <p>
                  L'inclusion va dans l'autre sens : un EN est un PSS (slide 37), pas l'inverse.
                  Dans le jeu 3×3 du § 4 (slides 20 et 25), quatre profils sont des PSS, mais
                  seuls (H, g) et (B, m) sont des EN : (H, m) et (B, g) survivent à l'élimination
                  sans être des équilibres.
                </p>
              ),
            },
            {
              title: "d) Faux",
              content: (
                <>
                  <p>
                    Être rationnel (H1) ne suffit pas pour jouer un PSS : il faut aussi{" "}
                    <em>croire que les autres sont rationnels</em> (H2.1). Rappel du jeu (slides 40
                    et 42) :
                  </p>
                  <PayoffMatrix
                    rowPlayer="P1"
                    colPlayer="P2"
                    rows={["Haut", "Bas"]}
                    cols={["Gauche", "Droite"]}
                    payoffs={[
                      [
                        [3, 3],
                        [0, 2],
                      ],
                      [
                        [1, 2],
                        [5, 1],
                      ],
                    ]}
                  />
                  <p>
                    Droite est dominée pour P2. Mais un P1 qui croit que P2 joue Droite avec une
                    probabilité <M tex="q" /> obtient <M tex="1 - q + 5q = 1 + 4q" /> avec Bas et{" "}
                    <M tex="3(1 - q) = 3 - 3q" /> avec Haut (mêmes notations qu'au § 7). Bas est
                    donc une meilleure réponse à sa croyance dès que <M tex="1 + 4q > 3 - 3q" />,
                    soit <M tex="q > 2/7 \approx 29\ \%" />. Un P1 rationnel qui doute assez de la
                    rationalité des P2 peut donc jouer Bas.
                  </p>
                  <p>
                    En réalité, 12 % des P2 ont joué Droite, moins que ce seuil : face à ce
                    comportement, Bas a rapporté en moyenne{" "}
                    <M tex="0{,}88 \cdot 1 + 0{,}12 \cdot 5 = 1{,}48" />, contre{" "}
                    <M tex="0{,}88 \cdot 3 = 2{,}64" /> pour Haut (slide 42). Ces joueurs ont donc
                    eu une croyance trop pessimiste : c'est l'hypothèse H2.1 qui est en défaut, pas
                    la preuve d'une irrationalité (H1).
                  </p>
                  <p className="text-[14px] text-muted-foreground">
                    Ne confonds pas les deux « 29 % » : le seuil 2/7 ≈ 29 % porte sur la croyance
                    à propos de P2 ; les 29 % de joueurs Bas sont une observation du labo.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              Les quatre affirmations sont fausses — et chacune cache une distinction de concepts
              (ESD vs EN, indifférence entre les stratégies utilisées, « un EN est un PSS » et pas
              l'inverse, rationalité vs croyances) que l'examen adore tester.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* S10 — Checklist de maîtrise                                   */}
      {/* ============================================================ */}
      <Section id="s10" kicker="§ 10" title="Checklist de maîtrise">
        <p>
          Coche honnêtement. Chaque case correspond à une compétence testable à l'examen ; si tu
          hésites, le § à revoir est indiqué entre parenthèses.
        </p>

        <MasteryChecklist
          items={[
            <>
              Je sais définir une <strong>interaction stratégique</strong> et un{" "}
              <strong>jeu simultané</strong> : les joueurs, les ensembles de stratégies{" "}
              <M tex="S_i" /> et les fonctions de payoff <M tex="u_i" />, et je sais lire la
              notation <M tex="(s_i, s_{-i})" />. <em>(§ 1)</em>
            </>,
            <>
              Je sais lire une matrice (qui choisit la ligne, qui choisit la colonne, à qui est
              chaque nombre) et <strong>construire la forme normale</strong> à partir d'une
              histoire. <em>(§ 2)</em>
            </>,
            <>
              Je distingue le <strong>résultat</strong> d'un jeu de son{" "}
              <strong>profil de payoffs</strong>, et je sais que le payoff est l'utilité tirée du
              résultat, pas forcément un montant d'argent. <em>(§ 1)</em>
            </>,
            <>
              Je sais vérifier qu'une stratégie est <strong>dominante</strong> ou{" "}
              <strong>dominée</strong> par un système d'inégalités, et je sais qu'un joueur peut
              avoir une stratégie dominée sans avoir de stratégie dominante. <em>(§ 3)</em>
            </>,
            <>
              Je reconnais un <strong>dilemme du prisonnier</strong> (climat, ressource commune,
              course aux armements, dopage, publicité) et j'explique pourquoi son ESD est
              Pareto-dominé. <em>(§ 3)</em>
            </>,
            <>
              Je sais dérouler l'<strong>élimination itérative</strong> en citant l'hypothèse
              (H2.1, H2.2…) qui justifie chaque itération, et donner les <strong>PSS</strong>.{" "}
              <em>(§ 4)</em>
            </>,
            <>
              Je sais trouver <strong>tous les EN en stratégies pures</strong> : meilleures
              réponses écrites sous forme d'inégalités (format du slide 28) et raccourci visuel
              (entourer les meilleures réponses), y compris en 3×3. <em>(§ 5, exercice 5)</em>
            </>,
            <>
              Je connais les <strong>jeux types</strong> et leurs situations : bataille des sexes
              (standard technologique commun), chasse au cerf (paniques bancaires, garantie des
              dépôts), poule mouillée (deux firmes, un marché trop petit), matching pennies (jeux
              de conflit). <em>(§ 5, § 8)</em>
            </>,
            <>
              Je sais dessiner l'emboîtement <strong>ESD ⊂ EN ⊂ PSS</strong> (un ESD est un EN,
              un EN est un PSS) et citer la limitation théorique de chaque concept.{" "}
              <em>(§ 6)</em>
            </>,
            <>
              Je peux discuter le <strong>réalisme de H1, H2 et H3</strong> avec les chiffres du
              labo, et expliquer le jeu « devine 2/3 de la moyenne », le concours de beauté de
              Keynes et les bulles. <em>(§ 7)</em>
            </>,
            <>
              Je sais ce qu'est une <strong>stratégie mixte</strong> et je calcule un{" "}
              <strong>payoff attendu</strong> avec le carré des probabilités (les deux calculs du
              slide 57 : 3/4 et 3/2). <em>(§ 8)</em>
            </>,
            <>
              Je sais développer <M tex="U_A(p, q)" /> et <M tex="U_G(p, q)" /> du pénalty,
              donner les <strong>trois cas</strong> de chaque fonction de meilleure réponse et
              lire leur croisement : l'EN mixte <M tex="(0{,}7\,;\ 0{,}6)" />. <em>(§ 8)</em>
            </>,
            <>
              Je connais l'<strong>avantage théorique de l'EN</strong> (en stratégies mixtes, tout
              jeu a au moins un EN) et j'applique le <strong>théorème d'indifférence</strong> en me
              souvenant que l'indifférence de A donne <M tex="q^*" /> et celle de G donne{" "}
              <M tex="p^*" />. <em>(§ 8)</em>
            </>,
            <>
              Je peux expliquer le résultat <strong>police vs mafia</strong> : quand ses actions
              en banlieue deviennent plus efficaces, la police y va moins souvent, car sa stratégie
              sert à rendre la mafia indifférente. <em>(§ 8)</em>
            </>,
            <>
              Je sais interpréter un EN mixte (hésitation, croyances correctes), dire ce que Walker
              et Wooders ont testé (même taux de réussite des deux côtés) et pourquoi 26 Pile sur
              56 ne contredit pas l'équilibre (<M tex="X \sim Bi(56, 1/2)" />). <em>(§ 8)</em>
            </>,
          ]}
        />

        <Callout variant="retiens" title="🧭 Et après ?">
          <p>
            Ce chapitre a posé le cadre des jeux{" "}
            <strong>non-coopératifs, simultanés, à information complète et non-répétés</strong>{" "}
            (slide 10). Le chapitre suivant lève l'hypothèse de simultanéité : dans les jeux
            séquentiels, les joueurs jouent l'un après l'autre. Garde tes réflexes : forme normale
            → dominances → élimination → meilleures réponses → Nash.
          </p>
        </Callout>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Widgets locaux du § 8                                               */
/* ------------------------------------------------------------------ */

/** Nombre → TeX au format français (0.375 → « 0{,}375 »). */
function tx(v: number, d = 4): string {
  return fmt(v, d).replace(",", "{,}").replace("−", "-");
}

/** Matching pennies (slide 54) : MP[ligne J1][colonne J2] = [u1, u2]. */
const MP: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [0, 3],
    [3, 0],
  ],
  [
    [3, 0],
    [0, 3],
  ],
];
const MP_LAB = ["Pile", "Face"] as const;

/** Flèche SVG simple (corps + pointe triangulaire). */
function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  w = 3,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  w?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const hx = x2 - ux * 11;
  const hy = y2 - uy * 11;
  const px = -uy * 6.5;
  const py = ux * 6.5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
    </g>
  );
}

/* ----------------------------- 1. La ronde des déviations (slide 54) */

const CYCLE: Array<{ r: 0 | 1; c: 0 | 1; who: 1 | 2; text: ReactNode }> = [
  {
    r: 0,
    c: 0,
    who: 1,
    text: (
      <>
        En <strong>(Pile, Pile)</strong>, les deux pièces montrent le même côté : J2 gagne (3), J1
        perd (0). Or, quand J2 montre Pile, la meilleure réponse de J1 est <strong>Face</strong>{" "}
        (3 &gt; 0) : J1 a intérêt à changer.
      </>
    ),
  },
  {
    r: 1,
    c: 0,
    who: 2,
    text: (
      <>
        En <strong>(Face, Pile)</strong>, les côtés diffèrent : J1 gagne, J2 perd. Quand J1 montre
        Face, la meilleure réponse de J2 est <strong>Face</strong> (3 &gt; 0) : c'est J2 qui veut
        changer.
      </>
    ),
  },
  {
    r: 1,
    c: 1,
    who: 1,
    text: (
      <>
        En <strong>(Face, Face)</strong> : même côté, J2 gagne et J1 perd. Quand J2 montre Face, la
        meilleure réponse de J1 est <strong>Pile</strong> (3 &gt; 0) : J1 veut changer.
      </>
    ),
  },
  {
    r: 0,
    c: 1,
    who: 2,
    text: (
      <>
        En <strong>(Pile, Face)</strong> : J1 gagne, J2 perd. Quand J1 montre Pile, la meilleure
        réponse de J2 est <strong>Pile</strong> (3 &gt; 0) : J2 change… et on est revenu au point de départ. La ronde ne
        s'arrête jamais.
      </>
    ),
  },
];

function PenniesCycle() {
  const [k, setK] = useState(0);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => setK((v) => (v + 1) % 4), 2400);
    return () => window.clearInterval(id);
  }, [play]);

  // géométrie : 2 × 2 cases, flèches dans les couloirs entre les cases
  const CW = 140;
  const CH = 70;
  const GAP = 52;
  const X0 = 120;
  const Y0 = 72;
  const cx = (c: number) => X0 + c * (CW + GAP);
  const cy = (r: number) => Y0 + r * (CH + GAP);
  const midX = (c: number) => cx(c) + CW / 2;
  const midY = (r: number) => cy(r) + CH / 2;
  const corrX = cx(0) + CW + GAP / 2; // couloir vertical entre les colonnes
  const corrY = cy(0) + CH + GAP / 2; // couloir horizontal entre les lignes
  const arrows = [
    { x1: midX(0), y1: cy(0) + CH + 7, x2: midX(0), y2: cy(1) - 7, bx: midX(0) - 22, by: corrY + 5 },
    { x1: cx(0) + CW + 7, y1: midY(1), x2: cx(1) - 7, y2: midY(1), bx: corrX, by: midY(1) - 16 },
    { x1: midX(1), y1: cy(1) - 7, x2: midX(1), y2: cy(0) + CH + 7, bx: midX(1) + 22, by: corrY + 5 },
    { x1: cx(1) - 7, y1: midY(0), x2: cx(0) + CW + 7, y2: midY(0), bx: corrX, by: midY(0) - 16 },
  ];
  const H = cy(1) + CH + 18;

  return (
    <InteractiveCard
      title="La ronde des déviations dans matching pennies"
      subtitle="Dans chaque case, regarde qui perd : ce joueur veut changer de stratégie."
      controls={
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
          <button
            type="button"
            onClick={() => {
              setPlay(false);
              setK((v) => (v + 3) % 4);
            }}
            className="rounded-full border px-3 py-1 text-[13px] font-semibold text-muted-foreground hover:bg-muted"
          >
            ← Précédent
          </button>
          <button
            type="button"
            onClick={() => {
              setPlay(false);
              setK((v) => (v + 1) % 4);
            }}
            className="rounded-full border border-primary bg-primary px-3 py-1 text-[13px] font-semibold text-primary-foreground"
          >
            Suivant →
          </button>
          <button
            type="button"
            onClick={() => setPlay((v) => !v)}
            className="rounded-full border px-3 py-1 text-[13px] font-semibold text-muted-foreground hover:bg-muted"
          >
            {play ? "⏸ Pause" : "▶ Lecture automatique"}
          </button>
          <span className="text-[13px] text-muted-foreground">Étape {k + 1} / 4</span>
        </div>
      }
      footer={
        <>
          chaque case contient un <strong>perdant</strong> qui gagnerait à changer seul de
          stratégie. Aucune case n'est donc faite de meilleures réponses mutuelles :{" "}
          <strong>pas d'EN en stratégies pures</strong>, la ronde tourne sans fin.
        </>
      }
    >
      <svg
        viewBox={`0 0 470 ${H}`}
        role="img"
        aria-label="Matrice de matching pennies : dans chaque case, le perdant veut changer de stratégie, ce qui forme un cycle sans fin"
        className="mx-auto block h-auto w-full max-w-[560px]"
      >
        <text x={cx(0) + CW + GAP / 2} y={24} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.sky}>
          Joueur 2 (veut le même côté)
        </text>
        {[0, 1].map((c) => (
          <text key={c} x={midX(c)} y={Y0 - 12} textAnchor="middle" fontSize={14} fontWeight={600} fill={C.sky}>
            {MP_LAB[c]}
          </text>
        ))}
        <text
          x={30}
          y={corrY}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={C.red}
          transform={`rotate(-90 30 ${corrY})`}
        >
          Joueur 1 (veut l'inverse)
        </text>
        {[0, 1].map((r) => (
          <text key={r} x={X0 - 12} y={midY(r) + 5} textAnchor="end" fontSize={14} fontWeight={600} fill={C.red}>
            {MP_LAB[r]}
          </text>
        ))}
        {[0, 1].map((r) =>
          [0, 1].map((c) => {
            const active = CYCLE[k].r === r && CYCLE[k].c === c;
            const [u1, u2] = MP[r][c];
            return (
              <g key={`${r}${c}`}>
                <rect
                  x={cx(c)}
                  y={cy(r)}
                  width={CW}
                  height={CH}
                  rx={10}
                  fill={active ? C.gold : C.ink}
                  fillOpacity={active ? 0.14 : 0.03}
                  stroke={active ? C.gold : C.guide}
                  strokeWidth={active ? 3 : 1.5}
                  style={{ transition: "all 300ms ease" }}
                />
                <text x={midX(c)} y={midY(r) + 1} textAnchor="middle" fontSize={20} fontWeight={700}>
                  <tspan fill={C.red}>{u1}</tspan>
                  <tspan fill={C.soft}> ; </tspan>
                  <tspan fill={C.sky}>{u2}</tspan>
                </text>
                <text
                  x={midX(c)}
                  y={midY(r) + 22}
                  textAnchor="middle"
                  fontSize={12.5}
                  fontWeight={600}
                  fill={u1 > u2 ? C.red : C.sky}
                >
                  {u1 > u2 ? "J1 gagne" : "J2 gagne"}
                </text>
              </g>
            );
          }),
        )}
        {arrows.map((a, i) => {
          const active = i === k;
          return (
            <g key={i} opacity={active ? 1 : 0.35} style={{ transition: "opacity 300ms ease" }}>
              <Arrow x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} color={active ? C.gold : C.soft} w={active ? 4 : 2.5} />
              <circle cx={a.bx} cy={a.by - 4} r={10} fill={active ? C.gold : C.soft} />
              <text x={a.bx} y={a.by + 0.5} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 rounded-xl border bg-muted/30 px-3.5 py-2.5 text-[15px] leading-relaxed">
        <span
          className={cn(
            "mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[12.5px] font-bold text-white",
          )}
          style={{ background: C.gold }}
        >
          {k + 1}
        </span>
        {CYCLE[k].text}
      </p>
    </InteractiveCard>
  );
}

/* ------------------------- 2. Le carré des probabilités (slide 57) */

const SQUARE_PRESETS = [
  { value: "s57", label: "Slide 57 : s₁ contre s₂", a: 50, b: 75 },
  { value: "pur", label: "Pile (pur) contre s₂", a: 100, b: 75 },
  { value: "demi", label: "Les deux à ½", a: 50, b: 50 },
] as const;

function ProbabilitySquare() {
  const [a, setA] = useState(50); // proba (en %) que J1 joue Pile
  const [b, setB] = useState(75); // proba (en %) que J2 joue Pile
  const pa = [a / 100, 1 - a / 100]; // lignes : Pile, Face (J1)
  const pb = [b / 100, 1 - b / 100]; // colonnes : Pile, Face (J2)
  const pr = (r: number, c: number) => pa[r] * pb[c];
  const U1 = [0, 1].reduce((s, r) => s + [0, 1].reduce((t, c) => t + pr(r, c) * MP[r][c][0], 0), 0);
  const preset = SQUARE_PRESETS.find((o) => o.a === a && o.b === b)?.value ?? "libre";

  const S = 250;
  const X0 = 150;
  const Y0 = 66;
  const w = [pb[0] * S, pb[1] * S];
  const h = [pa[0] * S, pa[1] * S];
  const xs = [X0, X0 + w[0]];
  const ys = [Y0, Y0 + h[0]];
  const H = Y0 + S + 14;

  return (
    <InteractiveCard
      title="Le carré des probabilités"
      subtitle={
        <>
          Chaque case du jeu devient un rectangle dont l'<strong>aire</strong> est sa probabilité.
          Le payoff attendu = somme des aires × payoffs.
        </>
      }
      controls={
        <>
          <SliderControl
            label={<span className="text-rose-700">J1 : proba de jouer Pile</span>}
            value={a}
            onChange={setA}
            min={0}
            max={100}
            step={5}
            format={(v) => fmt(v / 100, 2)}
          />
          <SliderControl
            label={<span className="text-sky-700">J2 : proba de jouer Pile</span>}
            value={b}
            onChange={setB}
            min={0}
            max={100}
            step={5}
            format={(v) => fmt(v / 100, 2)}
          />
          <ChoiceChips<string>
            label="Cas du cours"
            options={SQUARE_PRESETS.map((o) => ({ value: o.value, label: o.label }))}
            value={preset}
            onChange={(v) => {
              const o = SQUARE_PRESETS.find((x) => x.value === v);
              if (o) {
                setA(o.a);
                setB(o.b);
              }
            }}
          />
        </>
      }
      footer={
        <>
          (1) Mets J1 sur <strong>1</strong> (Pile pur) : la rangée « Face » disparaît et tu
          retrouves le premier calcul du slide, <M tex="U_1(P, s_2) = \tfrac34" />. (2) Mets{" "}
          <em>l'un des deux</em> joueurs sur <strong>0,5</strong> : <M tex="U_1" /> reste bloqué à{" "}
          <strong>1,5</strong> quoi que fasse l'autre. Garde ce constat en tête : c'est l'équilibre
          de matching pennies (plus bas dans ce §).
        </>
      }
    >
      <svg
        viewBox={`0 0 440 ${H}`}
        role="img"
        aria-label="Carré unité découpé en quatre rectangles dont les aires sont les probabilités des quatre cases de matching pennies"
        className="mx-auto block h-auto w-full max-w-[560px]"
      >
        <text x={X0 + S / 2} y={20} textAnchor="middle" fontSize={14} fontWeight={700} fill={C.sky}>
          Joueur 2
        </text>
        {[0, 1].map((c) =>
          w[c] >= 54 ? (
            <text key={c} x={xs[c] + w[c] / 2} y={Y0 - 12} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.sky}>
              {MP_LAB[c]} ({fmt(pb[c], 2)})
            </text>
          ) : null,
        )}
        <text
          x={34}
          y={Y0 + S / 2}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill={C.red}
          transform={`rotate(-90 34 ${Y0 + S / 2})`}
        >
          Joueur 1
        </text>
        {[0, 1].map((r) =>
          h[r] >= 26 ? (
            <text key={r} x={X0 - 10} y={ys[r] + h[r] / 2 + 5} textAnchor="end" fontSize={13} fontWeight={600} fill={C.red}>
              {MP_LAB[r]} ({fmt(pa[r], 2)})
            </text>
          ) : null,
        )}
        {[0, 1].map((r) =>
          [0, 1].map((c) => {
            if (w[c] <= 0 || h[r] <= 0) return null;
            const [u1] = MP[r][c];
            const j1wins = u1 === 3;
            const big = w[c] >= 62 && h[r] >= 46;
            return (
              <g key={`${r}${c}`}>
                <rect
                  x={xs[c]}
                  y={ys[r]}
                  width={w[c]}
                  height={h[r]}
                  fill={j1wins ? C.red : C.sky}
                  fillOpacity={0.13}
                  stroke={C.ink}
                  strokeOpacity={0.55}
                  strokeWidth={1.5}
                  style={{ transition: "all 250ms ease" }}
                />
                {big ? (
                  <>
                    <text
                      x={xs[c] + w[c] / 2}
                      y={ys[r] + h[r] / 2 - 3}
                      textAnchor="middle"
                      fontSize={15}
                      fontWeight={700}
                      fill={C.ink}
                    >
                      {fmt(pr(r, c), 4)}
                    </text>
                    <text
                      x={xs[c] + w[c] / 2}
                      y={ys[r] + h[r] / 2 + 16}
                      textAnchor="middle"
                      fontSize={12.5}
                      fontWeight={600}
                      fill={j1wins ? C.red : C.sky}
                    >
                      u₁ = {u1}
                    </text>
                  </>
                ) : null}
              </g>
            );
          }),
        )}
        <rect x={X0} y={Y0} width={S} height={S} fill="none" stroke={C.ink} strokeWidth={2} />
      </svg>
      <div className="mt-3 rounded-xl border bg-muted/30 px-3 py-2">
        <MB
          tex={`\\begin{aligned} U_1 &= \\underbrace{${tx(pr(0, 0))}}_{(P,P)}\\cdot 0 + \\underbrace{${tx(pr(1, 0))}}_{(F,P)}\\cdot 3 \\\\ &\\quad + \\underbrace{${tx(pr(0, 1))}}_{(P,F)}\\cdot 3 + \\underbrace{${tx(pr(1, 1))}}_{(F,F)}\\cdot 0 \\;=\\; ${tx(U1)} \\end{aligned}`}
        />
        <p className="m-0 text-center text-[13.5px] text-muted-foreground">
          Rouge : J1 gagne (<M tex="u_1 = 3" />) · bleu : J2 gagne (<M tex="u_1 = 0" />). Chaque
          case totalise 3, donc <M tex={`U_2 = 3 - U_1 = ${tx(3 - U1)}`} />.
        </p>
      </div>
    </InteractiveCard>
  );
}

/* ------------- 3. La bascule : payoff attendu en fonction de p (62-63) */

function PayoffSeesaw() {
  const [who, setWho] = useState<"A" | "G">("A");
  const [k, setK] = useState(30); // proba (en %) que l'ADVERSAIRE joue Droit
  const isA = who === "A";
  // U(x) = a + pente·x, avec x = sa propre proba de jouer Droit
  const a = isA ? (2000 + 70 * k) / 100 : (8000 - 60 * k) / 100;
  const slope = isA ? 60 - k : k - 70; // 60 − 100q  ou  100p − 70
  const U = (x: number) => a + slope * x;
  const own = isA ? "p" : "q";
  const opp = isA ? "q" : "p";
  const col = isA ? C.red : C.sky;
  // numéro de cas comme aux slides 62 (attaquant) et 63 (gardien)
  const cas = slope === 0 ? 3 : isA ? (slope > 0 ? 1 : 2) : slope < 0 ? 1 : 2;
  const br =
    slope > 0
      ? `${own} = 1 (Droit)`
      : slope < 0
        ? `${own} = 0 (Gauche)`
        : `n'importe quel ${own} ∈ [0, 1]`;

  const p = makePlot({ x: [0, 1], y: [0, 100], h: 300, pL: 46, pR: 18, pT: 26, pB: 44 });
  const x0 = p.X(0);
  const x1 = p.X(1);
  const axisY = p.Y(0);

  return (
    <InteractiveCard
      title="La bascule : pourquoi la meilleure réponse est (presque toujours) pure"
      subtitle={
        <>
          Pour un choix fixé de l'adversaire, le payoff attendu est une <strong>droite</strong> en
          fonction de sa propre probabilité. Où est son maximum ?
        </>
      }
      controls={
        <>
          <ChoiceChips<"A" | "G">
            label="Joueur analysé"
            options={[
              { value: "A", label: "Attaquant (slide 62)" },
              { value: "G", label: "Gardien (slide 63)" },
            ]}
            value={who}
            onChange={(v) => {
              setWho(v);
              setK(v === "A" ? 30 : 50);
            }}
          />
          <SliderControl
            label={
              isA ? (
                <span className="text-sky-700">q — proba que le gardien plonge à Droite</span>
              ) : (
                <span className="text-rose-700">p — proba que l'attaquant tire à Droite</span>
              )
            }
            value={k}
            onChange={setK}
            min={0}
            max={100}
            step={5}
            format={(v) => fmt(v / 100, 2)}
          />
          <div className="flex flex-col justify-center text-[13.5px]">
            <span className="font-semibold">
              Cas {cas} : meilleure réponse <span style={{ color: col }}>{br}</span>
            </span>
          </div>
        </>
      }
      footer={
        <>
          une droite atteint son maximum à <strong>une extrémité</strong> (0 ou 1)… sauf si elle
          est <strong>plate</strong> : alors toutes les probabilités se valent. Elle devient plate
          exactement en <M tex="q = 0{,}6" /> pour l'attaquant et en <M tex="p = 0{,}7" /> pour le
          gardien. C'est pour cela que la fonction de meilleure réponse « saute » d'un bout à
          l'autre en ce point.
        </>
      }
    >
      <PlotSvg
        p={p}
        maxW={560}
        label={
          isA
            ? "Payoff attendu de l'attaquant en fonction de p, pour la valeur de q choisie"
            : "Payoff attendu du gardien en fonction de q, pour la valeur de p choisie"
        }
      >
        <Frame
          p={p}
          xticks={[0, 0.25, 0.5, 0.75, 1]}
          yticks={[0, 20, 40, 60, 80, 100]}
          xlabel={isA ? "p (attaquant → Droit)" : "q (gardien → Droit)"}
          ylabel={isA ? "payoff attendu de l'attaquant" : "payoff attendu du gardien"}
        />
        {/* ensemble des meilleures réponses, reporté sur l'axe horizontal */}
        {slope === 0 ? (
          <line x1={x0} y1={axisY} x2={x1} y2={axisY} stroke={C.gold} strokeWidth={7} strokeLinecap="round" opacity={0.85} />
        ) : (
          <circle cx={slope > 0 ? x1 : x0} cy={axisY} r={7} fill={C.gold} stroke="#fff" strokeWidth={1.5} />
        )}
        <GuideV p={p} x={0} y={U(0)} />
        <GuideV p={p} x={1} y={U(1)} />
        <line
          x1={x0}
          y1={p.Y(U(0))}
          x2={x1}
          y2={p.Y(U(1))}
          stroke={slope === 0 ? C.gold : col}
          strokeWidth={slope === 0 ? 5 : 3.5}
          strokeLinecap="round"
          style={{ transition: "all 250ms ease" }}
        />
        <Dot p={p} x={0} y={U(0)} fill={col} r={5} />
        <Dot p={p} x={1} y={U(1)} fill={col} r={5} />
        {slope !== 0 ? <Dot p={p} x={slope > 0 ? 1 : 0} y={U(slope > 0 ? 1 : 0)} fill={C.gold} r={8} /> : null}
        <Label p={p} x={0} y={U(0)} dx={10} dy={U(0) > U(1) ? -10 : 18} color={col}>
          {`${own} = 0 : ${fmt(U(0), 1)}`}
        </Label>
        <Label p={p} x={1} y={U(1)} anchor="end" dx={-10} dy={U(1) >= U(0) ? -10 : 18} color={col}>
          {`${own} = 1 : ${fmt(U(1), 1)}`}
        </Label>
        <Label p={p} x={0.5} y={0} anchor="middle" dx={0} dy={-12} color={C.gold} size={12.5}>
          {slope === 0 ? "tout [0, 1] est meilleure réponse" : "● = meilleure réponse"}
        </Label>
      </PlotSvg>
      <div className="mt-3 rounded-xl border bg-muted/30 px-3 py-2">
        <MB
          tex={
            isA
              ? `U_A(p, q) = \\underbrace{(20 + 70q)}_{\\text{ordonnée à l'origine}} + \\underbrace{(60 - 100q)}_{\\text{pente}}\\,p \\;=\\; ${tx(a, 1)} ${slope < 0 ? "-" : "+"} ${tx(Math.abs(slope), 0)}\\,p`
              : `U_G(p, q) = \\underbrace{(80 - 60p)}_{\\text{ordonnée à l'origine}} + \\underbrace{(100p - 70)}_{\\text{pente}}\\,q \\;=\\; ${tx(a, 1)} ${slope < 0 ? "-" : "+"} ${tx(Math.abs(slope), 0)}\\,q`
          }
        />
        <p className="m-0 text-center text-[13.5px] text-muted-foreground">
          Pente pour {opp} = {fmt(k / 100, 2)} : {isA ? "60 − 100 × " : "100 × "}
          {fmt(k / 100, 2)}
          {isA ? "" : " − 70"} = <strong>{fmt(slope, 0)}</strong>
          {slope > 0 ? " > 0 : la droite monte" : slope < 0 ? " < 0 : la droite descend" : " : la droite est plate"}
          .
        </p>
      </div>
    </InteractiveCard>
  );
}

/* -------------------- 4. Matching pennies en labo : la loi binomiale */

/** Probabilités P(X = j), j = 0…n, pour X ∼ Bi(n, ½). */
function binomHalf(n: number): number[] {
  const out = [Math.pow(0.5, n)];
  for (let j = 0; j < n; j++) out.push((out[j] * (n - j)) / (j + 1));
  return out;
}
const PMF56 = binomHalf(56);

function BinomialPennies() {
  const [k, setK] = useState(26);
  const lo = 14;
  const hi = 42;
  const tail = PMF56.slice(0, k + 1).reduce((s, v) => s + v, 0);
  const p = makePlot({ x: [lo - 0.6, hi + 0.6], y: [0, 0.12], h: 300, pL: 48, pR: 14, pT: 24, pB: 44 });
  const unit = p.X(1) - p.X(0);
  const bars: number[] = [];
  for (let j = lo; j <= hi; j++) bars.push(j);

  return (
    <InteractiveCard
      title="Si chacun jouait vraiment à pile ou face : X ∼ Bi(56, ½)"
      subtitle="Chaque barre = probabilité d'obtenir exactement ce nombre de Pile parmi 56 joueurs. La zone dorée = « k Pile ou moins »."
      controls={
        <>
          <SliderControl
            label="Nombre de Pile observé (k)"
            value={k}
            onChange={setK}
            min={16}
            max={28}
            step={1}
            format={(v) => String(v)}
          />
          <div className="flex flex-col justify-center text-[13.5px] sm:col-span-1 lg:col-span-2">
            <span className="font-semibold">
              P(X ≤ {k}) ≈ <span style={{ color: C.gold }}>{fmt(tail * 100, 1)} %</span>
              {k === 26 ? " — la valeur observée au slide 70" : ""}
            </span>
          </div>
        </>
      }
      footer={
        <>
          avec 26 Pile, la zone dorée pèse environ <strong>34 %</strong> : un écart de 2 par rapport à
          28 arrive très souvent par pur hasard. Pour que le hasard devienne peu crédible, il
          faudrait beaucoup moins de Pile (à 20, la zone ne pèse plus qu'environ 2 %).
        </>
      }
    >
      <PlotSvg p={p} maxW={600} label="Distribution binomiale de paramètres 56 et un demi, avec la queue gauche colorée jusqu'au nombre de Pile choisi">
        <Frame
          p={p}
          xticks={[16, 20, 24, 28, 32, 36, 40]}
          yticks={[0, 0.02, 0.04, 0.06, 0.08, 0.1]}
          yfmt={(t) => `${fmt(t * 100, 0)} %`}
          xlabel="nombre de joueurs ayant joué Pile"
        />
        {bars.map((j) => (
          <rect
            key={j}
            x={p.X(j) - unit * 0.42}
            y={p.Y(PMF56[j])}
            width={unit * 0.84}
            height={p.Y(0) - p.Y(PMF56[j])}
            fill={j <= k ? C.gold : C.guide}
            fillOpacity={j <= k ? 0.9 : 0.45}
            style={{ transition: "fill 200ms ease" }}
          />
        ))}
        <Label p={p} x={28} y={PMF56[28]} anchor="start" dx={8} dy={-4} color={C.ink}>
          28 = moitié de 56
        </Label>
        <Label p={p} x={k} y={PMF56[k]} anchor="end" dx={-8} dy={-4} color={C.gold}>
          {`k = ${k}`}
        </Label>
      </PlotSvg>
    </InteractiveCard>
  );
}
