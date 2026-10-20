/*
 * Chapitre B2 (jeux séquentiels) — PartFondements (sections affichées dans la page du chapitre).
 * § 0 pourquoi ce chapitre (slides 2-4) · § 1 le jeu de l'entrée (slides 3, 5, 6) ·
 * § 2 le cadre et l'arbre du jeu (slides 7-9) · § 3 sous-jeux et ENPS (slides 10-12) ·
 * § 4 la backward induction (slides 13-18). Deck S6 « B2. Jeux séquentiels » (B. Decerf).
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { TheoryRef } from "@/components/course/TheoryRef";
import { GameTreeSvg, GT_COLORS, leaf, node, type GTGame } from "@/chapters/shared/gametree";
import { H4, CardGrid, MustKnow } from "./ui";
import { EntryGameExplorer } from "./anim/EntryGameExplorer";
import { EntryBackward } from "./anim/EntryBackward";
import { TreeAnatomy } from "./anim/TreeAnatomy";
import { SpneVenn } from "./anim/SpneVenn";
import { StrategyPlanner } from "./anim/StrategyPlanner";
import { ExampleBackward } from "./anim/ExampleBackward";

/* ------------------------------------------------------------------ */
/* Les deux jeux de cette partie (paiements vérifiés sur les PNG)      */
/* ------------------------------------------------------------------ */

/** Jeu de l'entrée (slides 3, 5, 9, 10). Paiements (Firme 1 ; Firme 2). */
const ENTRY: GTGame = {
  players: [
    { name: "Firme 1", color: GT_COLORS[0] },
    { name: "Firme 2", color: GT_COLORS[1] },
  ],
  root: node("r", 0, [
    [
      "Entrer",
      node("f2", 1, [
        ["Accommoder", leaf("a", [2, 1])],
        ["Guerre", leaf("g", [0, 0])],
      ]),
    ],
    ["Passer", leaf("p", [1, 2])],
  ]),
};

/** Le sous-jeu de la firme 2, seul (slide 11). */
const ENTRY_SUB: GTGame = {
  players: ENTRY.players,
  root: node("f2", 1, [
    ["Accommoder", leaf("a", [2, 1])],
    ["Guerre", leaf("g", [0, 0])],
  ]),
};

/** Jeu des slides 14-18. Paiements (Joueur 1 ; Joueur 2). */
const EX: GTGame = {
  players: [
    { name: "Joueur 1", color: GT_COLORS[0] },
    { name: "Joueur 2", color: GT_COLORS[1] },
  ],
  root: node(
    "x0",
    0,
    [
      [
        "C",
        node(
          "x1",
          1,
          [
            [
              "E",
              node(
                "x2",
                0,
                [
                  ["G", leaf("g", [1, 2])],
                  ["H", leaf("h", [0, 0])],
                ],
                { name: "x2" },
              ),
            ],
            ["F", leaf("f", [3, 1])],
          ],
          { name: "x1" },
        ),
      ],
      ["D", leaf("d", [2, 0])],
    ],
    { name: "x0" },
  ),
};

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Liste numérotée. */
function OL({ children }: { children: ReactNode }) {
  return <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:font-semibold">{children}</ol>;
}

/** Pastille « hypothèse » (H1, H2.1, H2.2…). */
function Hyp({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1.5 inline-flex shrink-0 items-center rounded-md bg-amber-100 px-1.5 py-0.5 align-middle text-[11.5px] font-bold text-amber-800">
      {children}
    </span>
  );
}

/** Une étape d'un raisonnement : pastille, titre (le « quoi »), hypothèse, puis l'explication. */
function Step({
  n,
  title,
  hyp,
  children,
}: {
  n: ReactNode;
  title: ReactNode;
  hyp?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="my-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12.5px] font-bold text-primary-foreground">
          {n}
        </span>
        <div className="font-semibold leading-snug">
          {title}
          {hyp ? <Hyp>{hyp}</Hyp> : null}
        </div>
      </div>
      <div className="mt-1.5 space-y-2 text-[15.5px] leading-relaxed">{children}</div>
    </div>
  );
}

/** Une meilleure réponse : la phrase, puis la comparaison chiffrée. */
function BR({
  who,
  side,
  against,
  answer,
  nums,
}: {
  who: ReactNode;
  side: "row" | "col";
  against: ReactNode;
  answer: ReactNode;
  nums: string;
}) {
  const tone = side === "row" ? "text-rose-700" : "text-sky-700";
  return (
    <div className="rounded-xl border bg-background px-3.5 py-2.5">
      <div className="text-[14px] leading-snug">
        Meilleure réponse de <span className={`font-semibold ${tone}`}>{who}</span> à{" "}
        <strong>{against}</strong> : <strong className={tone}>{answer}</strong>
      </div>
      <div className="mt-1.5 text-center leading-relaxed">
        <M tex={nums} />
      </div>
    </div>
  );
}

/** Arbre statique dans un cadre avec légende. */
function TreeFigure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="my-5 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
      <div className="mx-auto max-w-[560px]">{children}</div>
      <figcaption className="mt-2 text-center text-[13.5px] leading-snug text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

/** Tableau compact (sans largeur minimale) : lisible sans défilement sur téléphone. */
function MiniTbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14px] leading-snug sm:text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground sm:px-3.5"
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
                <td key={j} className="px-2.5 py-2 align-top sm:px-3.5">
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

/** Nom de nœud (x₀, x₁…) qui reste en minuscule dans les en-têtes de tableau (mis en capitales). */
function X({ children }: { children: ReactNode }) {
  return <span className="normal-case">{children}</span>;
}

/** Nom d'un joueur dans la couleur des slides (J1 rouge, J2 bleu). */
function P1({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-rose-700">{children}</span>;
}
function P2({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-sky-700">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* La partie                                                           */
/* ------------------------------------------------------------------ */

export function PartFondements() {
  return (
    <>
      <S0 />
      <S1 />
      <S2 />
      <S3 />
      <S4 />
    </>
  );
}

/* ================================================================== */
/* § 0 — Pourquoi ce chapitre ? (slides 2-4)                          */
/* ================================================================== */

function S0() {
  return (
    <Section id="s0" kicker="§ 0" title="Pourquoi ce chapitre ?">
      <Lead>
        En B1, tous les joueurs choisissaient <strong>en même temps</strong>, sans voir ce que
        faisaient les autres. Dans la vie, on joue souvent <strong>à tour de rôle</strong> : l'un
        agit, l'autre voit ce qui s'est passé, puis il réagit. Ce chapitre étudie ces jeux-là :
        les <strong>jeux séquentiels</strong>.
      </Lead>

      <CardGrid
        items={[
          {
            tag: "Illustration",
            title: "Les échecs",
            body: (
              <>
                Les blancs jouent un coup. Les noirs <strong>voient</strong> ce coup, puis
                répondent. Chacun choisit en connaissant tout ce qui s'est passé avant.
              </>
            ),
          },
          {
            tag: "Illustration",
            title: "Une négociation",
            body: (
              <>
                Un vendeur fait une offre de prix. L'acheteur la lit, puis l'accepte ou la refuse.
                Le vendeur sait qu'on lira son offre avant de répondre.
              </>
            ),
          },
          {
            tag: "Dans ce chapitre · § 1",
            title: "L'entrée sur un marché",
            body: (
              <>
                Une firme décide d'entrer sur un marché. La firme déjà en place voit qu'elle est
                entrée, puis choisit sa riposte : partager le marché ou lancer une guerre des
                prix.
              </>
            ),
          },
          {
            tag: "Dans ce chapitre · § 5",
            title: "Des élections avec primaires",
            body: (
              <>
                Un parti choisit son candidat. L'autre parti connaît ce choix quand il désigne le
                sien. Puis l'électeur vote entre les deux.
              </>
            ),
          },
        ]}
      />
      <p className="text-[13.5px] text-muted-foreground">
        Les deux premières cartes sont des exemples illustratifs (ils ne sont pas dans les
        slides). Les deux autres sont les jeux du cours.
      </p>

      <H4>Deux questions pour ouvrir le chapitre (slides 2 et 3)</H4>

      <Callout variant="exemple" title="Question 1 — voter « utile » ou voter pour son favori ? (slide 2)">
        <p>
          Le slide 2 montre un article de presse de l'élection présidentielle française de 2017 :
          « Hamon, Mélenchon ou Macron ? Le casse-tête du vote utile pour les électeurs de gauche ».
          La question posée :
        </p>
        <p className="my-2 rounded-lg bg-background/70 px-3 py-2 italic">
          Un électeur doit-il voter « utile » ou voter pour son candidat favori au premier tour des
          élections présidentielles ?
        </p>
        <p>
          Voter « utile », c'est voter pour un candidat qui n'est <strong>pas</strong> ton préféré,
          parce que tu penses que ce choix pèsera mieux sur le résultat final. Pour répondre, il
          faut se mettre à la place des autres et anticiper ce qu'ils feront <em>après</em> toi.
          C'est exactement ce que ce chapitre t'apprend à faire. Réponse au § 5 :{" "}
          <TheoryRef chapter="bseq" section="s5" />
        </p>
      </Callout>

      <Callout variant="exemple" title="Question 2 — que vont décider les deux firmes ? (slide 3)">
        <p>
          La firme 2 est seule sur un marché (elle est en <strong>monopole</strong>). La firme 1
          se demande si elle va entrer sur ce marché. Si elle entre, la firme 2 peut s'en
          accommoder ou lancer une guerre des prix. La question du slide :{" "}
          <em>« Qu'est-ce que chacune des firmes va décider ? »</em> On la traite au § 1.
        </p>
      </Callout>

      <H4>Ce que tu sais déjà depuis B1 (slide 4)</H4>
      <p>
        Pour prédire le comportement des joueurs, B1 a posé trois hypothèses :
      </p>
      <UL>
        <li>
          <strong>H1, rationalité</strong> : chaque joueur choisit ce qui lui rapporte le plus
          grand payoff ;
        </li>
        <li>
          <strong>H2, connaissance réciproque de la rationalité</strong> : chacun sait que les
          autres sont rationnels, sait qu'ils savent qu'il est rationnel, etc. (niveaux H2.1, H2.2…) ;
        </li>
        <li>
          <strong>H3, anticipations correctes</strong> : chacun anticipe correctement les
          stratégies que les autres vont jouer.
        </li>
      </UL>
      <p>
        Leur conclusion pour les <strong>jeux simultanés</strong> : le profil de stratégies joué
        devrait être un <strong>équilibre de Nash (EN)</strong>. Rappel : un EN est un profil où
        chacun joue une meilleure réponse à ce que jouent les autres, si bien que personne ne
        regrette son choix. Pour réviser : <TheoryRef chapter="b1" section="s5" />
      </p>
      <p>
        Mais le jeu de l'entrée n'est <strong>pas</strong> simultané : la firme en place{" "}
        <strong>observe</strong> ce qu'a fait l'autre firme avant de devoir prendre sa décision.
        D'où la question qui guide tout le chapitre.
      </p>

      <Callout variant="retiens" title="La question du chapitre (slide 4)">
        <p className="text-[16.5px] font-semibold leading-relaxed">
          « Est-ce que le fait que mon action soit observée par mon adversaire avant qu'il ne joue
          change mes incitants, et donc le résultat du jeu ? »
        </p>
        <p className="mt-2">
          Les <em>incitants</em>, ce sont les raisons qui poussent un joueur à choisir une action
          plutôt qu'une autre. La réponse du cours : <strong>oui</strong>.{" "}
          « Les hypothèses H1, H2 et H3 ont des implications plus fortes dans les jeux
          séquentiels » (slide 4). Elles permettent d'écarter certains EN, et donc de faire des
          prédictions plus précises.
        </p>
      </Callout>

      <Callout variant="intuition" title="L'idée du chapitre, en bref">
        <p>
          Quand tu joues <em>après</em> avoir vu le coup de l'autre, tu ne choisis plus « en
          théorie » : tu choisis ce qui est le mieux pour toi dans la situation qui s'est
          réellement produite. Celui qui joue avant toi le sait. Donc une menace du type « si tu
          fais ça, je te punis » ne lui fait pas peur si punir te coûterait aussi : il sait que,
          le moment venu, tu ne le feras pas.
        </p>
      </Callout>

      <H4>La feuille de route</H4>
      <MiniTbl
        head={["§", "Ce qu'on y fait", "Slides"]}
        rows={[
          ["§ 1", "Le jeu de l'entrée : deux EN, mais un seul est crédible", "3-6"],
          ["§ 2", "Le cadre : information parfaite, forme étendue, arbre du jeu", "7-9"],
          ["§ 3", "Les sous-jeux et l'équilibre de Nash parfait en sous-jeux (ENPS)", "10-12"],
          ["§ 4", "La backward induction : la méthode pour trouver l'ENPS", "13-18"],
          ["§ 5", "Application : les primaires et le vote stratégique", "19-25"],
          ["§ 6", "Au labo : les vrais joueurs suivent-ils la théorie ?", "26-33"],
          ["§ 7-8", "Information imparfaite : sous-jeux simultanés, stratégies mixtes", "34-42"],
          ["§ 9-10", "Exercices récapitulatifs et checklist", "—"],
        ]}
      />

      <Callout variant="examen" title="🎯 Ce que tu dois absolument maîtriser à la fin">
        <MustKnow
          items={[
            <>
              Lire et dessiner l'<strong>arbre</strong> d'un jeu séquentiel (sa forme étendue) :
              nœuds, arêtes, payoffs.
            </>,
            <>
              Distinguer <strong>action</strong> et <strong>stratégie</strong> (un plan d'action
              complet), et lister toutes les stratégies d'un joueur.
            </>,
            <>
              Écrire la <strong>forme normale</strong> d'un jeu séquentiel et trouver tous ses EN.
            </>,
            <>
              Définir un <strong>sous-jeu</strong> et un <strong>ENPS</strong>, et expliquer
              pourquoi un EN basé sur une <strong>menace non crédible</strong> n'est pas un ENPS.
            </>,
            <>
              Appliquer la <strong>backward induction</strong> en justifiant chaque étape (H1,
              H2.1, H2.2…), et écrire l'ENPS comme un <strong>profil de stratégies</strong>, pas
              comme un résultat.
            </>,
            <>
              Utiliser ces outils sur les primaires et sur les expériences de labo, et dire où la
              théorie prédit mal.
            </>,
            <>
              Traiter un jeu à <strong>information imparfaite</strong> : ensembles d'information,
              sous-jeu simultané, stratégies mixtes.
            </>,
          ]}
        />
      </Callout>
    </Section>
  );
}

/* ================================================================== */
/* § 1 — Le jeu de l'entrée (slides 3, 5, 6)                          */
/* ================================================================== */

/** Forme normale du jeu de l'entrée (slide 5) : [firme 1 ; firme 2]. */
const ENTRY_NF: Array<Array<readonly [number, number]>> = [
  [
    [2, 1],
    [0, 0],
  ],
  [
    [1, 2],
    [1, 2],
  ],
];

function S1() {
  return (
    <Section id="s1" kicker="§ 1" title="Le jeu de l'entrée : la menace de guerre des prix">
      <Lead>
        On commence par le jeu le plus simple du chapitre. On le traite d'abord avec les outils
        de B1 (forme normale et équilibre de Nash). Ils donnent <strong>deux</strong>{" "}
        prédictions, dont une qui ne tient pas debout. Comprendre pourquoi, c'est comprendre tout
        le chapitre.
      </Lead>

      <H4>L'histoire et son arbre (slide 3)</H4>
      <p>
        Deux firmes sont en compétition pour un marché. La <P2>firme 2</P2> était jusque-là en
        situation de <strong>monopole</strong> : elle était seule à vendre. La <P1>firme 1</P1>{" "}
        se demande si elle va <strong>entrer</strong> sur ce marché. Si elle entre, la firme 2
        peut soit s'en <strong>accommoder</strong> (partager le marché sans réagir), soit se
        lancer dans une <strong>guerre des prix</strong> (casser ses prix pour faire mal à la
        nouvelle venue).
      </p>
      <p>
        L'ordre compte : la firme 1 choisit d'abord. La firme 2 ne choisit qu'
        <strong>après</strong>, et seulement si la firme 1 est entrée. On dessine cela avec un{" "}
        <strong>arbre</strong>, qui se lit de haut en bas :
      </p>

      <TreeFigure
        caption={
          <>
            Slide 3. La <P1>firme 1</P1> joue en premier. Si elle entre, la <P2>firme 2</P2> joue
            à son tour. Sous chaque issue : le payoff de la firme 1 (rouge), puis celui de la
            firme 2 (bleu).
          </>
        }
      >
        <GameTreeSvg game={ENTRY} ariaLabel="Arbre du jeu de l'entrée (slide 3)" />
      </TreeFigure>

      <p>Il y a trois façons dont le jeu peut se terminer :</p>
      <MiniTbl
        head={["Ce qui se passe", "Firme 1", "Firme 2", "En mots"]}
        rows={[
          [
            "La firme 1 passe",
            <P1 key="a">1</P1>,
            <P2 key="b">2</P2>,
            "La firme 2 garde son monopole : sa meilleure issue.",
          ],
          [
            "Elle entre, la firme 2 accommode",
            <P1 key="a">2</P1>,
            <P2 key="b">1</P2>,
            "Le marché est partagé : la meilleure issue pour la firme 1.",
          ],
          [
            "Elle entre, la firme 2 lance la guerre",
            <P1 key="a">0</P1>,
            <P2 key="b">0</P2>,
            "Les prix s'effondrent : la pire issue pour les deux.",
          ],
        ]}
      />
      <p className="text-[14.5px] text-muted-foreground">
        Comme en B1, seuls les classements comptent : un payoff plus grand veut dire « mieux pour
        ce joueur ». La question du slide 3 : <em>qu'est-ce que chacune des firmes va
        décider ?</em>
      </p>

      <H4>Premier essai avec les outils de B1 : la forme normale (slide 5)</H4>

      <Callout variant="definition" title="Théorème (slide 5)">
        <p>
          L'ensemble des EN d'un jeu séquentiel correspond à l'ensemble des EN de sa{" "}
          <strong>forme normale</strong>.
        </p>
        <p className="mt-2 text-[14.5px]">
          En clair : pour trouver les EN d'un jeu séquentiel, on le réécrit sous forme de tableau
          (sa forme normale), puis on applique la méthode des meilleures réponses de B1.
        </p>
      </Callout>

      <p>Pour remplir le tableau, il faut savoir ce qu'est une stratégie de chaque firme.</p>
      <UL>
        <li>
          <P1>Firme 1</P1> : elle a un seul choix à faire, donc deux stratégies, <strong>Entrer</strong>{" "}
          (E) ou <strong>Passer</strong> (P).
        </li>
        <li>
          <P2>Firme 2</P2> : sa stratégie dit ce qu'elle fera <em>si</em> la firme 1 entre :{" "}
          <strong>Accommoder</strong> (A) ou <strong>Guerre</strong> (G). Elle a un plan même si,
          au final, la firme 1 passe et que ce plan ne sert jamais.
        </li>
      </UL>
      <p>
        Chaque case s'obtient en suivant l'arbre. (E, A) : la firme 1 entre, la firme 2 accommode,
        on arrive à (2 ; 1). (E, G) : on arrive à (0 ; 0). (P, A) et (P, G) : la firme 1 passe, le
        jeu s'arrête tout de suite, on arrive à (1 ; 2) <strong>dans les deux cas</strong>, car le
        plan de la firme 2 n'est jamais exécuté.
      </p>

      <PayoffMatrix
        rowPlayer="Firme 1"
        colPlayer="Firme 2"
        rows={["Entrer", "Passer"]}
        cols={["Accommoder", "Guerre"]}
        payoffs={ENTRY_NF}
        interactive
        caption={
          <>
            Slide 5 : la forme normale du jeu de l'entrée. Dans chaque case : payoff de la firme 1 ;
            payoff de la firme 2. Clique pour révéler les meilleures réponses, puis les EN.
          </>
        }
      />

      <Step n={1} title="Les meilleures réponses de la firme 1 : une par stratégie de la firme 2">
        <p>
          On fixe la colonne (ce que fait la firme 2) et on compare les deux payoffs de la firme
          1, en rouge.
        </p>
        <div className="my-3 grid gap-2.5 sm:grid-cols-2">
          <BR who="la firme 1" side="row" against="Accommoder" answer="Entrer" nums="2 > 1" />
          <BR who="la firme 1" side="row" against="Guerre" answer="Passer" nums="1 > 0" />
        </div>
      </Step>

      <Step n={2} title="Les meilleures réponses de la firme 2 : une par stratégie de la firme 1">
        <p>On fixe la ligne et on compare les deux payoffs de la firme 2, en bleu.</p>
        <div className="my-3 grid gap-2.5 sm:grid-cols-2">
          <BR who="la firme 2" side="col" against="Entrer" answer="Accommoder" nums="1 > 0" />
          <BR
            who="la firme 2"
            side="col"
            against="Passer"
            answer="Accommoder et Guerre"
            nums="2 = 2"
          />
        </div>
        <p>
          Si la firme 1 passe, la firme 2 obtient 2 quoi qu'elle ait prévu. Les deux stratégies
          sont donc des meilleures réponses (égalité).
        </p>
      </Step>

      <Step n={3} title="Les meilleures réponses mutuelles : deux EN (slide 5)">
        <p>
          <strong>(E, A)</strong> : Entrer est la meilleure réponse à Accommoder, et Accommoder
          est une meilleure réponse à Entrer. C'est un EN.
        </p>
        <p>
          <strong>(P, G)</strong> : Passer est la meilleure réponse à Guerre, et Guerre est une
          meilleure réponse à Passer (égalité 2 = 2). C'est aussi un EN.
        </p>
        <p className="text-[14.5px] text-muted-foreground">
          Les deux autres cases ne sont pas des EN. En (P, A), la firme 1 regretterait : elle
          aurait 2 en entrant au lieu de 1. En (E, G), elle aurait 1 en passant au lieu de 0.
        </p>
      </Step>

      <Callout variant="exemple" title="La question du slide 5 (réfléchis avant de lire la suite)">
        <p>
          « Faut-il s'attendre à ce que l'équilibre (P, G) soit joué ? Pourquoi cet équilibre
          n'est pas une bonne prédiction dans ce jeu séquentiel ? »
        </p>
      </Callout>

      <H4>La réponse : (P, G) repose sur une menace non crédible (slide 6)</H4>
      <p>
        Traduisons (P, G) en mots. La firme 2 dit : « si tu entres, je lance la guerre des prix ».
        La firme 1 y croit et préfère passer. Sur le papier, personne ne regrette son choix. Mais
        rappelle-toi l'ordre du jeu : la firme 2 <strong>voit</strong> ce que fait la firme 1
        avant de jouer. Le slide 6 raisonne en trois temps.
      </p>

      <Step n={1} title="Face à la menace, passer est bien la meilleure réponse">
        <p>
          Pour la firme 1, Passer est la meilleure réponse à (la menace d'une) Guerre : passer
          rapporte 1, entrer puis subir la guerre rapporterait 0.
        </p>
      </Step>

      <Step n={2} title="Mais, la firme 1 entrée, la firme 2 ne lancerait pas la guerre" hyp="H1">
        <p>
          Si la firme 2 est rationnelle (H1), elle ne va pas lancer une Guerre si la firme 1
          décide d'Entrer. En effet, la firme 2 observe l'action de la firme 1 avant de jouer, et
          Accommoder est la meilleure réponse à Entrer :
        </p>
        <p className="text-center">
          <M tex="u_2(\text{Accommoder}) = 1 \;>\; u_2(\text{Guerre}) = 0" />
        </p>
        <p className="text-[14.5px] text-muted-foreground">
          Ici, <M tex="u_2" /> désigne le payoff de la firme 2, une fois que la firme 1 est
          entrée.
        </p>
      </Step>

      <Step n={3} title="La firme 1 le sait : la menace ne lui fait pas peur" hyp="H2">
        <p>
          Si la firme 1 pense que la firme 2 est rationnelle (H2), elle ne s'attend pas à ce que
          la firme 2 fasse une Guerre : la menace n'est <strong>pas crédible</strong>. La firme 1
          compare donc Entrer, qui lui rapportera 2 (la firme 2 accommodera), et Passer, qui lui
          rapporte 1. Elle entre.
        </p>
      </Step>

      <Callout variant="retiens" title="Conclusion du slide 6">
        <p>
          Sur les deux EN, <strong>seul (E, A) sera observé</strong> si les firmes satisfont aux
          hypothèses H1 et H2. L'EN (P, G) n'est pas une bonne prédiction : il est basé sur une{" "}
          <strong>menace non crédible</strong>, c'est-à-dire une menace que la firme 2 n'aurait
          pas intérêt à exécuter le moment venu.
        </p>
      </Callout>

      <Callout variant="intuition" title="Pourquoi le tableau n'a rien vu ?">
        <p>
          Dans la forme normale, la firme 2 choisit son plan « une fois pour toutes », comme si
          elle le glissait dans une enveloppe avant de savoir ce que fait la firme 1. Sur la ligne
          Passer, menacer de la guerre ne lui coûte rien (2 = 2), puisque la menace n'est jamais
          mise à exécution. Le tableau ne montre pas qu'une fois la firme 1 entrée, la firme 2{" "}
          <em>changerait d'avis</em>. L'arbre, lui, le montre : c'est pour cela qu'on a besoin
          de la forme étendue (§ 2).
        </p>
      </Callout>

      <Callout variant="exemple" title="Une menace non crédible de la vie courante (exemple illustratif)">
        <p>
          Un parent dit à son enfant : « Si tu ne ranges pas ta chambre, on annule les vacances à
          la mer pour toute la famille. » Si annuler gâcherait aussi les vacances du parent,
          l'enfant devine que, le jour venu, le parent ne le fera pas. La menace ne fait pas peur.
          C'est la logique de (P, G) : une punition que celui qui menace n'aurait pas intérêt à
          exécuter.
        </p>
      </Callout>

      <Callout variant="attention" title="Si tu relis le slide 6">
        <p>
          Le slide contient deux coquilles. « La firme 1 ne devrait pas s'attendre à ce que la
          firme 1 lance une Guerre » doit se lire « … que la <strong>firme 2</strong> lance une
          Guerre ». Et « Rentrer » veut dire « Entrer ».
        </p>
      </Callout>

      <H4>À toi d'explorer</H4>
      <p>
        Choisis un profil. Tu vois le plan de chaque firme dans l'arbre et dans le tableau, et
        deux verdicts : est-ce un EN ? Et la stratégie de la firme 2 reste-t-elle un bon choix
        une fois la firme 1 entrée ? (Ce second test porte un nom, l'ENPS : on le définit au
        § 3.)
      </p>
      <EntryGameExplorer />

      <p>
        Le raisonnement du slide 6 part de la <strong>fin</strong> du jeu (la firme 2) et remonte
        vers le début (la firme 1). Le voici joué pas à pas. Cette façon de raisonner s'appelle la{" "}
        <strong>backward induction</strong> ; on la généralise au § 4.
      </p>
      <EntryBackward />

      <Callout variant="examen" title="Piège d'examen : « tout EN est une bonne prédiction »">
        <p>
          Faux dans un jeu séquentiel. (P, G) est un vrai EN de la forme normale, mais il ne sera
          pas observé sous H1 et H2. Si on te demande « quels sont les EN ? », donne les deux. Si
          on te demande « que va-t-il se passer ? », explique pourquoi (P, G) est écarté.
        </p>
      </Callout>

      <Quiz
        scope="bseq"
        id="fond-q1"
        question={<>Dans l'EN (P, G), pourquoi la firme 2 ne regrette-t-elle pas son plan « Guerre » ?</>}
        options={[
          {
            text: <>Parce que la guerre lui rapporte plus que l'accommodement.</>,
            explain: (
              <>
                Non : si la firme 1 entrait, la guerre lui rapporterait 0 contre 1 en accommodant.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que la firme 1 passe : le plan n'est jamais exécuté et la firme 2 obtient 2
                quoi qu'elle ait prévu.
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui. Sur la ligne Passer, Guerre et Accommoder rapportent toutes deux 2 : la
                menace est « gratuite » tant qu'il ne faut pas l'exécuter.
              </>
            ),
          },
          {
            text: <>Parce que la guerre fait peur à la firme 1.</>,
            explain: (
              <>
                C'est la raison pour laquelle la <em>firme 1</em> ne regrette pas de passer. La
                question porte sur la firme 2.
              </>
            ),
          },
        ]}
      />

      <Quiz
        scope="bseq"
        id="fond-q2"
        question={<>D'après le slide 6, quelles hypothèses suffisent pour écarter l'EN (P, G) ?</>}
        options={[
          {
            text: <>H1 seulement.</>,
            explain: (
              <>
                H1 dit que la firme 2 accommoderait si la firme 1 entrait. Mais pour que la firme 1
                entre, il faut encore qu'elle <em>le sache</em> : c'est H2.
              </>
            ),
          },
          {
            text: <>H1 et H2.</>,
            correct: true,
            explain: (
              <>
                Oui. H1 : la firme 2, rationnelle, accommoderait. H2 : la firme 1 sait que la
                firme 2 est rationnelle, donc elle ne croit pas à la menace et entre.
              </>
            ),
          },
          {
            text: <>H3 seulement.</>,
            explain: (
              <>
                Non : H3 (anticipations correctes) est vérifiée aussi en (P, G), puisque chaque
                firme y anticipe bien la stratégie de l'autre. C'est pour cela que (P, G) est un
                EN. Le slide 6 utilise H1 et H2.
              </>
            ),
          },
        ]}
      />
    </Section>
  );
}

/* ================================================================== */
/* § 2 — Le cadre : information parfaite et arbre du jeu (slides 7-9) */
/* ================================================================== */

function S2() {
  return (
    <Section id="s2" kicker="§ 2" title="Le cadre : information parfaite et arbre du jeu">
      <Lead>
        Le jeu de l'entrée l'a montré : un tableau ne suffit pas. Il faut savoir{" "}
        <strong>qui joue quand</strong> et <strong>ce que chacun a vu</strong> au moment de
        jouer. Cette section fixe le cadre des jeux étudiés, puis l'outil pour les dessiner :
        l'arbre du jeu.
      </Lead>

      <H4>Les jeux étudiés : quatre caractéristiques (slide 7)</H4>
      <p>
        Deux caractéristiques restent celles de B1, deux sont nouvelles. Compare avec le cadre de
        B1 : <TheoryRef chapter="b1" section="s1" />
      </p>
      <CardGrid
        items={[
          {
            tag: "Comme en B1",
            title: "Jeux non coopératifs",
            body: (
              <>
                Les joueurs ne peuvent pas conclure d'accords contraignants. Chacun choisit pour
                lui-même.
              </>
            ),
          },
          {
            tag: "Nouveau : remplace « simultanés »",
            title: "Jeux séquentiels",
            body: (
              <>
                Au moment de choisir leur action, <strong>certains</strong> joueurs connaissent{" "}
                <strong>certaines</strong> actions de certains de leurs adversaires.
              </>
            ),
            extra: <>Jeu de l'entrée : la firme 2 connaît l'action de la firme 1.</>,
          },
          {
            tag: "Nouveau : plus fort que « complète »",
            title: "Information parfaite",
            body: (
              <>
                <strong>1.</strong> Information complète : les joueurs connaissent la structure
                du jeu, l'ensemble de stratégies et la fonction de payoffs de tous leurs
                adversaires. <strong>2.</strong> Toutes les actions passées sont connues avant que
                l'action suivante ne soit choisie.
              </>
            ),
            extra: (
              <>
                Jeu de l'entrée : la firme 2 sait ce qu'a fait la firme 1 avant de choisir son
                action.
              </>
            ),
          },
          {
            tag: "Comme en B1",
            title: "Jeux non répétés",
            body: <>Le jeu n'est joué qu'une seule fois.</>,
          },
        ]}
      />

      <Callout variant="attention" title="Information complète ≠ information parfaite">
        <UL>
          <li>
            <strong>Complète</strong> : tu connais les règles du jeu et les payoffs de tout le
            monde.
          </li>
          <li>
            <strong>Parfaite</strong> : l'information est complète <em>et</em>, au moment de
            jouer, tu as vu <strong>tous</strong> les coups déjà joués.
          </li>
        </UL>
        <p>
          Exemples illustratifs : aux échecs, tu vois tout l'échiquier, l'information est
          parfaite. Dans un jeu simultané de B1, tu connais les payoffs de tous (information
          complète), mais pas le choix de l'autre : l'information n'est pas parfaite. Au § 7, tu
          verras un jeu séquentiel où une firme ne voit pas l'offre de l'autre : information
          complète mais <strong>imparfaite</strong> : <TheoryRef chapter="bseq" section="s7" />
        </p>
      </Callout>

      <H4>Pourquoi la forme normale ne suffit plus (slide 8)</H4>
      <p>
        La structure d'un jeu séquentiel n'est pas entièrement contenue dans sa forme normale.
        Le tableau ne dit pas :
      </p>
      <UL>
        <li>
          <strong>quel joueur joue à quel moment ?</strong>
        </li>
        <li>
          <strong>qu'est-ce qu'un joueur sait au moment de jouer ?</strong>
        </li>
      </UL>
      <p>
        Fais le test avec le tableau 2 × 2 du § 1. Imagine que la firme 2 doive annoncer
        « Accommoder » ou « Guerre » sous enveloppe, <em>sans</em> savoir si la firme 1 est
        entrée. Ce serait un autre jeu (simultané), et pourtant le tableau serait exactement le
        même. Le tableau ne peut donc pas faire la différence entre les deux situations.
      </p>
      <p>
        Pour résumer la structure d'un jeu séquentiel, on utilise sa{" "}
        <strong>forme étendue</strong>, qui se base sur l'<strong>arbre du jeu</strong>.
      </p>

      <H4>L'arbre du jeu (slides 8 et 9)</H4>

      <Callout variant="definition" title="L'arbre du jeu (slide 8)">
        <p>
          L'arbre du jeu est un <strong>graphe orienté</strong> (on le parcourt dans un seul
          sens, du début du jeu vers sa fin) qui contient un ensemble de :
        </p>
        <UL>
          <li>
            <strong>nœuds</strong> : les positions auxquelles les joueurs doivent choisir une
            action ;
          </li>
          <li>
            <strong>arêtes</strong> : les actions accessibles aux joueurs, qui relient chacune
            deux nœuds entre eux.
          </li>
        </UL>
        <p>Les nœuds de l'arbre sont de trois sortes :</p>
        <UL>
          <li>
            le <strong>nœud de départ</strong> : la première position, où le joueur 1 choisit une
            action ;
          </li>
          <li>
            les <strong>nœuds intermédiaires</strong> : les positions où un joueur choisit une
            action ;
          </li>
          <li>
            les <strong>nœuds finaux</strong> (ou terminaux) : chacun représente un{" "}
            <strong>résultat</strong> et son profil de payoffs associé.
          </li>
        </UL>
        <p className="text-[14px] text-muted-foreground">
          Le slide écrit « arrêtes » : le mot correct est <strong>arêtes</strong>, comme les
          arêtes d'un cube (les traits qui relient deux sommets).
        </p>
      </Callout>

      <p>Sur le jeu de l'entrée (slide 9), on trouve :</p>
      <UL>
        <li>
          <strong>le nœud de départ</strong>, où la firme 1 choisit entre ses deux actions,
          Entrer et Passer ;
        </li>
        <li>
          <strong>un nœud intermédiaire</strong>, où la firme 2 choisit entre ses deux actions,
          Accommoder et Guerre ;
        </li>
        <li>
          <strong>trois nœuds terminaux</strong>, un pour chaque résultat atteignable : (1 ; 2),
          (2 ; 1) et (0 ; 0).
        </li>
      </UL>
      <p>
        Et quatre arêtes : une par action (Entrer, Passer, Accommoder, Guerre). Clique sur les
        éléments pour les repérer dans l'arbre :
      </p>

      <TreeAnatomy />

      <Callout variant="methode" title="Lire un arbre en quatre questions">
        <OL>
          <li>
            <strong>Qui joue ici ?</strong> Le nom (et la couleur) à côté du nœud.
          </li>
          <li>
            <strong>Quelles actions a-t-il ?</strong> Les arêtes qui partent de ce nœud vers le
            bas.
          </li>
          <li>
            <strong>Que sait-il en jouant ?</strong> En information parfaite : tout le chemin
            déjà parcouru depuis le nœud de départ.
          </li>
          <li>
            <strong>Que rapporte chaque fin ?</strong> Sous chaque nœud final, les payoffs dans
            l'ordre des joueurs : celui du joueur 1 en premier (en haut, en rouge), puis celui du
            joueur 2 (en bleu).
          </li>
        </OL>
        <p>
          Une partie, c'est un <strong>chemin</strong> du nœud de départ jusqu'à un nœud final.
          Il y a donc autant de résultats possibles que de nœuds finaux.
        </p>
      </Callout>

      <Callout variant="methode" title="Dessiner l'arbre à partir d'une histoire">
        <OL>
          <li>Qui joue en premier ? C'est le nœud de départ, tout en haut.</li>
          <li>Dessine une arête par action possible de ce joueur, et nomme-la.</li>
          <li>
            Au bout de chaque arête : soit un autre joueur doit choisir (nouveau nœud, et on
            recommence), soit le jeu s'arrête (nœud final).
          </li>
          <li>Sous chaque nœud final, écris les payoffs dans l'ordre des joueurs.</li>
        </OL>
      </Callout>

      <Quiz
        scope="bseq"
        id="fond-q3"
        question={
          <>
            Aux échecs, chacun connaît les règles et voit tout l'échiquier. Dans un jeu simultané
            de B1, chacun connaît les payoffs de tous mais ne voit pas le choix de l'autre.
            Lequel de ces jeux est à <strong>information parfaite</strong> ?
          </>
        }
        options={[
          {
            text: <>Les deux.</>,
            explain: (
              <>
                Non : dans le jeu simultané, l'information est complète, mais tu ne connais pas
                l'action de l'autre au moment de jouer.
              </>
            ),
          },
          {
            text: <>Les échecs seulement.</>,
            correct: true,
            explain: (
              <>
                Oui. Information parfaite = information complète + toutes les actions passées
                connues avant de jouer. Seuls les échecs remplissent la seconde condition.
              </>
            ),
          },
          {
            text: <>Le jeu simultané seulement.</>,
            explain: <>Non : c'est l'inverse. Aux échecs, tu vois tous les coups passés.</>,
          },
        ]}
      />

      <Quiz
        scope="bseq"
        id="fond-q4"
        question={<>Combien le jeu de l'entrée a-t-il de nœuds finaux ?</>}
        options={[
          {
            text: <>2, un par firme.</>,
            explain: (
              <>
                Non : un nœud final ne représente pas un joueur, mais une fin possible du jeu
                (un résultat).
              </>
            ),
          },
          {
            text: <>3, un par résultat atteignable.</>,
            correct: true,
            explain: (
              <>
                Oui (slide 9) : (1 ; 2) si la firme 1 passe, (2 ; 1) si elle entre et que la
                firme 2 accommode, (0 ; 0) en cas de guerre.
              </>
            ),
          },
          {
            text: <>4, un par case de la forme normale.</>,
            explain: (
              <>
                Piège ! Le tableau a 4 cases mais l'arbre n'a que 3 fins : (P, A) et (P, G)
                mènent au <em>même</em> résultat (1 ; 2). Plusieurs profils peuvent mener au même
                résultat : on y revient au § 4 (slide 18).
              </>
            ),
          },
        ]}
      />
    </Section>
  );
}

/* ================================================================== */
/* § 3 — Sous-jeux et ENPS (slides 10-12)                             */
/* ================================================================== */

/** Pastille oui / non pour les tableaux de vérification. */
function YesNo({ ok, children }: { ok: boolean; children?: ReactNode }) {
  return (
    <span>
      <span
        className={
          ok
            ? "whitespace-nowrap font-semibold text-emerald-700"
            : "whitespace-nowrap font-semibold text-rose-700"
        }
      >
        {ok ? "✓ oui" : "✗ non"}
      </span>
      {children ? (
        <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{children}</span>
      ) : null}
    </span>
  );
}

function S3() {
  return (
    <Section id="s3" kicker="§ 3" title="Sous-jeux et équilibre de Nash parfait en sous-jeux (ENPS)">
      <Lead>
        Au § 1, on a écarté (P, G) avec un raisonnement en mots. Le cours en fait un outil
        précis : on découpe l'arbre en morceaux, les <strong>sous-jeux</strong>, et on exige que
        les stratégies restent de bons choix dans <strong>chacun</strong> d'eux. On obtient
        l'équilibre de Nash parfait en sous-jeux (ENPS).
      </Lead>

      <Callout variant="retiens" title="Ce que prédisent H1, H2 et H3 dans un jeu séquentiel (slide 10)">
        <p>
          Dans les jeux séquentiels, les hypothèses H1, H2 et H3 impliquent que le profil de
          stratégies joué sera un équilibre de Nash <strong>qui n'est pas basé sur des menaces
          non crédibles</strong>, c'est-à-dire un <strong>équilibre de Nash parfait en
          sous-jeux</strong>.
        </p>
      </Callout>

      <H4>Un sous-jeu, c'est quoi ? (slide 10)</H4>

      <Callout variant="definition" title="Sous-jeu (slide 10)">
        <p>
          Un <strong>sous-jeu</strong> commence à un nœud qui n'est pas final, et il inclut tous
          les nœuds et les arêtes qui suivent ce nœud.
        </p>
      </Callout>

      <Callout variant="intuition" title="L'image : couper une branche">
        <p>
          Pose le doigt sur un nœud où quelqu'un doit jouer. Tout ce qui « pend » en dessous de ce
          nœud forme un sous-jeu : un petit jeu complet, qu'on pourrait jouer tout seul si la
          partie arrivait à cet endroit.
        </p>
      </Callout>

      <p>Trois conséquences directes de la définition :</p>
      <UL>
        <li>
          le <strong>jeu complet</strong> est lui-même un sous-jeu (il commence au nœud de
          départ, qui n'est pas final) ;
        </li>
        <li>un nœud final n'ouvre pas de sous-jeu : plus personne n'y joue ;</li>
        <li>
          dans un jeu à information parfaite, <strong>chaque nœud non final</strong> ouvre un
          sous-jeu. Au § 7, avec l'information imparfaite, la définition sera précisée.
        </li>
      </UL>
      <p>
        Dans le jeu de l'entrée, il y a deux nœuds non finaux. Le seul sous-jeu différent du jeu
        complet commence donc au nœud où la firme 2 choisit son action (slide 10) :
      </p>

      <TreeFigure
        caption={
          <>
            Slide 10. Le sous-jeu encadré commence au nœud de la <P2>firme 2</P2> et contient
            tout ce qui suit : ses deux actions et les deux nœuds finaux.
          </>
        }
      >
        <GameTreeSvg
          game={ENTRY}
          focus="f2"
          focusLabel="Sous-jeu"
          ariaLabel="Jeu de l'entrée : le sous-jeu qui commence au nœud de la firme 2 (slide 10)"
        />
      </TreeFigure>

      <p>
        Pour t'entraîner : le jeu du slide 14 (qu'on étudie au § 4) a trois nœuds non finaux,
        x₀, x₁ et x₂. Il a donc <strong>trois</strong> sous-jeux : le jeu complet (qui commence
        en x₀), celui qui commence en x₁, et celui qui commence en x₂. Ils sont emboîtés comme des
        poupées russes :
      </p>

      <TreeFigure
        caption={
          <>
            Le jeu du slide 14. Le sous-jeu qui commence en x₁ contient celui qui commence en x₂.
            Le troisième sous-jeu est le jeu complet.
          </>
        }
      >
        <GameTreeSvg
          game={EX}
          focus="x1"
          focusLabel="Sous-jeu x₁"
          boxes={[{ root: "x2", label: "Sous-jeu x₂" }]}
          ariaLabel="Jeu du slide 14 : les sous-jeux emboîtés qui commencent en x1 et en x2"
        />
      </TreeFigure>

      <H4>L'équilibre de Nash parfait en sous-jeux (slide 11)</H4>

      <Callout variant="definition" title="ENPS (slide 11)">
        <p>Un équilibre de Nash parfait en sous-jeux (ENPS) est un</p>
        <UL>
          <li>
            <strong>équilibre de Nash</strong>,
          </li>
          <li>
            dont les stratégies constituent des équilibres de Nash dans{" "}
            <strong>tous les sous-jeux</strong>.
          </li>
        </UL>
      </Callout>

      <p>Pour vérifier qu'un profil est un ENPS, on fait donc passer deux tests :</p>
      <OL>
        <li>
          <strong>Test du jeu complet</strong> : le profil est-il un EN ? (On le lit dans la forme
          normale, comme au § 1.)
        </li>
        <li>
          <strong>Test des sous-jeux</strong> : dans chaque sous-jeu, ce que les stratégies
          prévoient pour les nœuds de ce sous-jeu forme-t-il un EN de ce sous-jeu ?
        </li>
      </OL>
      <p className="text-[14.5px] text-muted-foreground">
        Astuce : dans un sous-jeu où <strong>un seul</strong> joueur joue (comme celui de la
        firme 2), « former un EN » veut simplement dire que ce joueur y choisit sa meilleure
        action.
      </p>

      <Step n={1} title="(E, A) passe les deux tests : c'est un ENPS">
        <p>
          Test du jeu complet : (E, A) est un EN (§ 1). Test du sous-jeu : la firme 2 y joue
          Accommoder, qui lui rapporte 1 au lieu de 0 avec Guerre. C'est sa meilleure action. Les
          deux tests sont passés.
        </p>
      </Step>

      <Step n={2} title="(P, G) échoue au test du sous-jeu : ce n'est pas un ENPS">
        <p>
          Test du jeu complet : (P, G) est un EN (§ 1). Mais l'équilibre (P, G) n'est pas parfait
          en sous-jeux, car Guerre n'est pas un équilibre de Nash dans le sous-jeu :{" "}
          <strong>Guerre est une stratégie dominée dans le sous-jeu</strong> (slide 11). Dans ce
          sous-jeu, la firme 2 obtient 0 avec Guerre et 1 avec Accommoder.
        </p>
      </Step>

      <TreeFigure
        caption={
          <>
            Slide 11. Le sous-jeu, vu tout seul : la <P2>firme 2</P2> compare 1 (Accommoder) et
            0 (Guerre). Guerre est dominée.
          </>
        }
      >
        <GameTreeSvg
          game={ENTRY_SUB}
          maxW={320}
          ariaLabel="Le sous-jeu de la firme 2 vu seul (slide 11)"
        />
      </TreeFigure>

      <Callout variant="intuition" title="Le test du sous-jeu, c'est le test « et si on y était vraiment ? »">
        <p>
          Avec (P, G), la firme 1 passe : le nœud de la firme 2 n'est <strong>jamais
          atteint</strong>. Le test du jeu complet ne regarde donc jamais ce qui s'y passerait.
          Le test des sous-jeux, lui, pose la question : « si la partie arrivait là, ce plan
          serait-il encore un bon choix ? ». Une menace, c'est justement un plan pour un endroit
          qu'on espère ne jamais atteindre. C'est pour cela que ce test élimine les menaces non
          crédibles.
        </p>
      </Callout>

      <p>Les quatre profils du jeu de l'entrée, passés aux deux tests :</p>
      <MiniTbl
        head={["Profil", "Test 1 : EN ?", "Test 2 : sous-jeu", "ENPS ?"]}
        rows={[
          ["(E, A)", <YesNo key="1" ok />, <YesNo key="2" ok>Accommoder : 1 &gt; 0</YesNo>, <YesNo key="3" ok />],
          ["(P, G)", <YesNo key="1" ok />, <YesNo key="2" ok={false}>Guerre : 0 &lt; 1</YesNo>, <YesNo key="3" ok={false} />],
          [
            "(E, G)",
            <YesNo key="1" ok={false}>la firme 1 préfère passer</YesNo>,
            <YesNo key="2" ok={false}>Guerre : 0 &lt; 1</YesNo>,
            <YesNo key="3" ok={false} />,
          ],
          [
            "(P, A)",
            <YesNo key="1" ok={false}>la firme 1 préfère entrer</YesNo>,
            <YesNo key="2" ok>Accommoder : 1 &gt; 0</YesNo>,
            <YesNo key="3" ok={false} />,
          ],
        ]}
      />
      <p>
        Regarde (P, A) : la firme 2 y a un bon plan, mais la firme 1 regrette de passer. Il faut
        donc bien <strong>les deux</strong> tests.
      </p>

      <H4>Un ENPS est un EN (slide 12)</H4>
      <p>
        Comme l'indique le diagramme de Venn du slide 12, ces solutions sont reliées entre elles :
        un ENPS est un EN. La grande ellipse contient tous les profils de stratégies d'un jeu
        séquentiel ; à l'intérieur, l'ellipse des EN ; à l'intérieur de celle-ci, celle des ENPS.
      </p>

      <SpneVenn />

      <UL>
        <li>
          Tout ENPS est un EN (c'est le test 1 de la définition).
        </li>
        <li>
          Un EN n'est <strong>pas</strong> forcément un ENPS : (P, G) en est un exemple.
        </li>
        <li>
          Un profil qui n'est pas un EN ne peut pas être un ENPS : (P, A) en est un exemple.
        </li>
      </UL>
      <p>
        Le même genre de diagramme existait en B1 pour les solutions des jeux simultanés :{" "}
        <TheoryRef chapter="b1" section="s6" />
      </p>

      <Callout variant="examen" title="Pièges d'examen sur l'ENPS">
        <UL>
          <li>
            L'ENPS n'est pas un équilibre « à côté » des EN : c'est un EN qui passe un test de
            plus. Pour le trouver, tu peux partir des EN et les tester un par un… ou utiliser la
            backward induction du § 4, plus rapide.
          </li>
          <li>
            Le test porte sur <strong>tous</strong> les sous-jeux, y compris ceux qui ne sont pas
            atteints quand on joue le profil. C'est là que se cachent les menaces non crédibles.
          </li>
          <li>
            Pour justifier qu'un EN n'est pas un ENPS, nomme le sous-jeu et l'action qui n'y est
            pas une meilleure réponse, avec les chiffres (ex. « dans le sous-jeu de la firme 2,
            Guerre rapporte 0 &lt; 1 »).
          </li>
        </UL>
      </Callout>

      <Quiz
        scope="bseq"
        id="fond-q5"
        question={<>Le profil (P, A) est-il un ENPS du jeu de l'entrée ?</>}
        options={[
          {
            text: <>Oui, car Accommoder est la meilleure action de la firme 2 dans le sous-jeu.</>,
            explain: (
              <>
                Le test du sous-jeu est passé, mais il faut aussi que le profil soit un EN du jeu
                complet. Ce n'est pas le cas.
              </>
            ),
          },
          {
            text: <>Non, car ce n'est même pas un EN : la firme 1 gagnerait à entrer.</>,
            correct: true,
            explain: (
              <>
                Oui. Si la firme 2 accommode, entrer rapporte 2 à la firme 1, contre 1 en passant.
                Un profil qui n'est pas un EN ne peut pas être un ENPS.
              </>
            ),
          },
          {
            text: <>Non, car Accommoder est dominée dans le sous-jeu.</>,
            explain: <>C'est l'inverse : dans le sous-jeu, c'est Guerre qui est dominée (0 &lt; 1).</>,
          },
        ]}
      />

      <Quiz
        scope="bseq"
        id="fond-q6"
        question={
          <>
            Combien de sous-jeux le jeu du slide 14 (nœuds x₀, x₁, x₂ et quatre nœuds finaux)
            compte-t-il, en comptant le jeu complet ?
          </>
        }
        options={[
          {
            text: <>2</>,
            explain: <>Tu as oublié le jeu complet : lui aussi est un sous-jeu (il commence en x₀).</>,
          },
          {
            text: <>3</>,
            correct: true,
            explain: (
              <>
                Oui : un sous-jeu par nœud non final, x₀ (le jeu complet), x₁ et x₂.
              </>
            ),
          },
          {
            text: <>4</>,
            explain: (
              <>
                Non : un nœud final n'ouvre pas de sous-jeu, il n'y a plus personne pour jouer.
              </>
            ),
          },
        ]}
      />
    </Section>
  );
}

/* ================================================================== */
/* § 4 — La backward induction pas à pas (slides 13-18)               */
/* ================================================================== */

/** Forme normale du jeu des slides 14-18 (slide 16) : [joueur 1 ; joueur 2]. */
const EX_NF: Array<Array<readonly [number, number]>> = [
  [
    [1, 2],
    [3, 1],
  ],
  [
    [0, 0],
    [3, 1],
  ],
  [
    [2, 0],
    [2, 0],
  ],
  [
    [2, 0],
    [2, 0],
  ],
];

function S4() {
  return (
    <Section id="s4" kicker="§ 4" title="La backward induction pas à pas">
      <Lead>
        Tester les EN un par un devient vite long. Le slide 13 donne une méthode plus directe pour
        trouver l'ENPS : raisonner <strong>en partant de la fin</strong> du jeu. C'est la{" "}
        <strong>backward induction</strong> (en français : induction à rebours ; le cours garde
        le terme anglais). Tu l'as déjà vue sur le jeu de l'entrée. On l'applique ici à un jeu un
        peu plus long, puis on en tire une recette d'examen.
      </Lead>

      <H4>Le théorème et la méthode (slide 13)</H4>

      <Callout variant="definition" title="Théorème (slide 13)">
        <p>
          Tous les jeux séquentiels (finis) à information complète admettent{" "}
          <strong>au moins un ENPS</strong>, qui peut être trouvé par « backward induction ».
        </p>
        <p className="mt-2 text-[14.5px]">
          « Fini » : l'arbre a un nombre fini de nœuds, donc le jeu finit toujours par s'arrêter.
          « Au moins un » : la zone ENPS du diagramme de Venn n'est jamais vide.
        </p>
      </Callout>

      <Callout variant="methode" title="La méthode en deux temps (slide 13)">
        <p>
          La backward induction est une méthode de raisonnement logique qui permet de trouver les
          ENPS :
        </p>
        <OL>
          <li>
            trouver les meilleures réponses dans les <strong>derniers sous-jeux</strong> pour
            prédire le résultat de ces sous-jeux ;
          </li>
          <li>
            utiliser les prédictions obtenues de manière itérative (en remontant d'un nœud à
            chaque fois) jusqu'à atteindre le nœud initial.
          </li>
        </OL>
      </Callout>

      <Callout variant="intuition" title="Pourquoi commencer par la fin ?">
        <p>
          Celui qui joue en dernier n'a plus personne à anticiper : il choisit simplement ce qui
          lui rapporte le plus. Une fois son choix connu, celui qui joue juste avant sait ce qui
          l'attend derrière chacune de ses actions. Il peut donc choisir à son tour. Et ainsi de
          suite, en remontant jusqu'au début.
        </p>
      </Callout>

      <H4>Le jeu des slides 14 à 18</H4>
      <p>
        La question du slide 14 : <em>« D'après la méthode de backward induction, quelle action
        le joueur 1 va-t-il prendre dans le jeu suivant ? »</em>
      </p>

      <TreeFigure
        caption={
          <>
            Slide 14. Le <P1>joueur 1</P1> joue en x₀ et, si la partie y arrive, en x₂. Le{" "}
            <P2>joueur 2</P2> joue en x₁. Sous chaque nœud final : payoff du joueur 1, puis du
            joueur 2.
          </>
        }
      >
        <GameTreeSvg game={EX} ariaLabel="Arbre du jeu des slides 14 à 18" />
      </TreeFigure>

      <p>Lisons l'arbre avec les quatre questions du § 2 :</p>
      <UL>
        <li>
          en <strong>x₀</strong>, le <P1>joueur 1</P1> choisit C (continuer) ou D (arrêter : on
          obtient (2 ; 0)) ;
        </li>
        <li>
          en <strong>x₁</strong>, le <P2>joueur 2</P2> choisit E (continuer vers x₂) ou F
          (arrêter : (3 ; 1)) ;
        </li>
        <li>
          en <strong>x₂</strong>, le <P1>joueur 1</P1> rejoue : G donne (1 ; 2), H donne (0 ; 0).
        </li>
      </UL>
      <p>
        Avant de lire la suite, fais ton pronostic : le joueur 1 va-t-il jouer C ou D ? On est
        tenté de répondre C, pour viser (3 ; 1), le meilleur payoff du joueur 1…
      </p>

      <H4>Avant tout : une stratégie n'est pas une action (slide 15)</H4>
      <p>
        Le slide 15 commence par identifier les EN du jeu. Pour écrire sa forme normale, il faut
        les stratégies. Or le <P1>joueur 1</P1> doit choisir une action au nœud x₀{" "}
        <strong>et</strong> au nœud x₂, et le <P2>joueur 2</P2> doit choisir une action au nœud
        x₁.
      </p>

      <Callout variant="definition" title="Stratégie dans un jeu séquentiel (slide 15)">
        <p>
          Dans un jeu séquentiel, une stratégie est différente d'une action. Une{" "}
          <strong>stratégie</strong> est un <strong>plan d'action complet</strong>, qui précise ce
          que le joueur fait pour chaque nœud auquel il doit faire un choix.
        </p>
        <UL>
          <li>
            Remarque : une stratégie précise ce que le joueur ferait <strong>même pour les nœuds
            qui ne seront jamais atteints</strong> étant donné ses propres actions.
          </li>
          <li>
            Exemple pour le joueur 1 : D n'est pas une stratégie, mais <strong>DG</strong>, qui
            signifie « D en x₀ et G en x₂ », est une stratégie.
          </li>
        </UL>
      </Callout>

      <Callout variant="intuition" title="Une stratégie, c'est le mode d'emploi laissé à un remplaçant">
        <p>
          Image illustrative : tu dois partir et quelqu'un jouera à ta place, sans pouvoir
          t'appeler. Tu lui laisses un mode d'emploi qui couvre <strong>tous</strong> les cas :
          « en x₀, joue D ; et si jamais on arrive en x₂, joue G ». C'est ta stratégie, DG.
        </p>
        <p className="mt-2">
          Pourquoi préciser x₂ alors qu'avec D on n'y arrive jamais ? Pour deux raisons. Pour
          juger si le choix du joueur 2 est bon, il faut savoir ce que le joueur 1 ferait en x₂.
          Et le test de l'ENPS (§ 3) vérifie <em>tous</em> les sous-jeux, y compris celui qui
          commence en x₂.
        </p>
      </Callout>

      <p>
        Le joueur 1 a 2 actions en x₀ et 2 actions en x₂. Il a donc{" "}
        <M tex="2 \times 2 = 4" /> stratégies : <strong>CG, CH, DG et DH</strong>. Le joueur 2
        n'a qu'un nœud, avec 2 actions : ses stratégies sont <strong>E et F</strong>. En
        général, le nombre de stratégies d'un joueur est le <strong>produit</strong> des nombres
        d'actions à chacun de ses nœuds (au § 7, avec l'information imparfaite, on dira : à chacun
        de ses ensembles d'information).
      </p>
      <MiniTbl
        head={["Stratégie du joueur 1", <>En <X>x₀</X></>, <>En <X>x₂</X></>, "Remarque"]}
        rows={[
          ["CG", "C", "G", "x₂ est atteint si le joueur 2 joue E"],
          ["CH", "C", "H", "x₂ est atteint si le joueur 2 joue E"],
          ["DG", "D", "G", "x₂ n'est jamais atteint, mais le plan le précise"],
          ["DH", "D", "H", "x₂ n'est jamais atteint, mais le plan le précise"],
        ]}
      />

      <p>
        Compose toi-même un plan pour chaque joueur, et regarde où mène le profil :
      </p>
      <StrategyPlanner />

      <H4>Étape 1 : la forme normale et ses trois EN (slide 16)</H4>
      <p>
        Pour remplir chaque case, on part de x₀ et on suit les plans des deux joueurs jusqu'à un
        nœud final :
      </p>
      <UL>
        <li>
          (CG, E) : C mène en x₁, E mène en x₂, G mène à <strong>(1 ; 2)</strong> ;
        </li>
        <li>
          (CH, E) : C, puis E, puis H mène à <strong>(0 ; 0)</strong> ;
        </li>
        <li>
          (CG, F) et (CH, F) : C, puis F arrête le jeu à <strong>(3 ; 1)</strong>. Le plan du
          joueur 1 en x₂ ne sert pas ;
        </li>
        <li>
          (DG, ·) et (DH, ·) : D arrête tout de suite le jeu à <strong>(2 ; 0)</strong>, quoi que
          prévoient les autres plans.
        </li>
      </UL>

      <PayoffMatrix
        rowPlayer="Joueur 1"
        colPlayer="Joueur 2"
        rows={["CG", "CH", "DG", "DH"]}
        cols={["E", "F"]}
        payoffs={EX_NF}
        showBestResponses
        caption={
          <>
            Slide 16 : la forme normale du jeu. Les payoffs associés aux meilleures réponses sont
            soulignés. Dans chaque case : payoff du joueur 1 ; payoff du joueur 2.
          </>
        }
      />

      <Step n={1} title="Les meilleures réponses du joueur 1 (on compare dans chaque colonne)">
        <div className="my-2 grid gap-2.5 sm:grid-cols-2">
          <BR
            who="le joueur 1"
            side="row"
            against="E"
            answer="DG et DH"
            nums="2\ \text{(DG, DH)} > 1\ \text{(CG)} > 0\ \text{(CH)}"
          />
          <BR
            who="le joueur 1"
            side="row"
            against="F"
            answer="CG et CH"
            nums="3\ \text{(CG, CH)} > 2\ \text{(DG, DH)}"
          />
        </div>
      </Step>

      <Step n={2} title="Les meilleures réponses du joueur 2 (on compare dans chaque ligne)">
        <div className="my-2 grid gap-2.5 sm:grid-cols-2">
          <BR who="le joueur 2" side="col" against="CG" answer="E" nums="2\ \text{(E)} > 1\ \text{(F)}" />
          <BR who="le joueur 2" side="col" against="CH" answer="F" nums="1\ \text{(F)} > 0\ \text{(E)}" />
          <BR
            who="le joueur 2"
            side="col"
            against="DG"
            answer="E et F"
            nums="0\ \text{(E)} = 0\ \text{(F)}"
          />
          <BR
            who="le joueur 2"
            side="col"
            against="DH"
            answer="E et F"
            nums="0\ \text{(E)} = 0\ \text{(F)}"
          />
        </div>
        <p>
          Contre DG ou DH, le joueur 2 ne joue jamais (le jeu s'arrête en x₀) : il obtient 0 quoi
          qu'il ait prévu. E et F sont toutes deux des meilleures réponses.
        </p>
      </Step>

      <Step n={3} title="Les cases où les deux payoffs sont soulignés : trois EN">
        <p>
          L'analyse des meilleures réponses permet de trouver trois EN (slide 16) :{" "}
          <strong>(DG, E)</strong>, <strong>(DH, E)</strong> et <strong>(CH, F)</strong>.
        </p>
        <p className="text-[14.5px] text-muted-foreground">
          Les autres cases échouent. En (CG, F), le joueur 2 gagnerait à passer à E (2 &gt; 1). En
          (DG, F) ou (DH, F), le joueur 1 gagnerait à passer à CG ou CH (3 &gt; 2). En (CG, E) et
          (CH, E), le joueur 1 gagnerait à passer à DG ou DH (2 &gt; 1 et 2 &gt; 0).
        </p>
      </Step>

      <Callout variant="exemple" title="La remarque d'efficacité du slide 16">
        <p>
          « D'un point de vue efficacité, le résultat associé à (DG, E) est dominé par celui
          associé à (CH, F). » En effet, (DG, E) mène à (2 ; 0) et (CH, F) mène à (3 ; 1) : les{" "}
          <strong>deux</strong> joueurs y gagnent (3 &gt; 2 pour le joueur 1, 1 &gt; 0 pour le
          joueur 2). Retiens ce détail : il va devenir un petit paradoxe.
        </p>
      </Callout>

      <H4>Étape 2 : le raisonnement de backward induction (slide 17)</H4>
      <p>
        On applique maintenant la méthode du slide 13 : on part du dernier sous-jeu (x₂) et on
        remonte jusqu'à x₀. Les trois étapes ci-dessous suivent le slide 17 mot à mot.
      </p>

      <Step n={1} title="Sous-jeu qui débute en x₂ : le joueur 1 joue G" hyp="H1">
        <p>
          Dans le sous-jeu débutant au nœud x₂, si le joueur 1 est rationnel (H1), il jouera{" "}
          <strong>G</strong>.
        </p>
        <p className="text-center">
          <M tex="u_1(G) = 1 \;>\; u_1(H) = 0" />
        </p>
      </Step>

      <Step n={2} title="Sous-jeu qui débute en x₁ : le joueur 2 joue E" hyp="H2.1">
        <p>
          Dans le sous-jeu débutant au nœud x₁, si le joueur 2 pense que le joueur 1 est rationnel
          (H2.1), alors le joueur 2 anticipe que jouer E lui rapportera un payoff de 2 (vu que le
          joueur 1 fera alors G).
        </p>
        <p>
          Étant donné cette anticipation, si le joueur 2 est rationnel, il fera <strong>E</strong>{" "}
          plutôt que F (qui amène un payoff de seulement 1).
        </p>
        <p className="text-center">
          <M tex="u_2(E \text{, puis } G) = 2 \;>\; u_2(F) = 1" />
        </p>
      </Step>

      <Step n={3} title="Nœud initial x₀ : le joueur 1 joue D" hyp="H2.2">
        <p>
          Au nœud initial x₀, si le joueur 1 pense que le joueur 2 pense que le joueur 1 est
          rationnel (H2.2), alors le joueur 1 anticipe que jouer C lui rapportera un payoff de 1
          (vu que le joueur 2 fera alors E et qu'ensuite il fera G).
        </p>
        <p>
          Étant donné cette anticipation, si le joueur 1 est rationnel, il fera <strong>D</strong>{" "}
          (qui amène un payoff de 2) plutôt que C.
        </p>
        <p className="text-center">
          <M tex="u_1(D) = 2 \;>\; u_1(C \text{, puis } E \text{, puis } G) = 1" />
        </p>
      </Step>

      <Callout variant="retiens" title="Conclusion du slide 17">
        <p>
          ⇒ Le seul des trois EN à être parfait en sous-jeux est <strong>(DG, E)</strong>. Le
          joueur 1 joue D en x₀ (et prévoit G en x₂), le joueur 2 prévoit E en x₁.
        </p>
        <p className="mt-2">
          Réponse à la question du slide 14 : le joueur 1 joue <strong>D</strong>. Le pronostic
          « C, pour viser (3 ; 1) » était faux : pour obtenir 3, il faudrait que le joueur 2 joue
          F, et il ne le fera pas.
        </p>
      </Callout>

      <Callout
        variant="intuition"
        title={<>Pourquoi H2.2 en <span className="normal-case">x₀</span>, et pas H2.1 ?</>}
      >
        <p>
          En x₀, le joueur 1 doit prévoir ce que fera le joueur 2 en x₁. Or le choix du joueur 2
          repose lui-même sur ce qu'il prévoit du joueur 1 en x₂. Le joueur 1 doit donc savoir que
          le joueur 2 sait que lui, le joueur 1, est rationnel : « je sais que tu sais que je suis
          rationnel », c'est H2.2.
        </p>
        <p className="mt-2">
          Règle pratique : <strong>à chaque nœud qu'on remonte, on ajoute un niveau à H2</strong>.
          Dernier nœud : H1. Un cran plus haut : H2.1. Encore un cran : H2.2. Dans le jeu de
          l'entrée, il n'y a que deux nœuds : H1 pour la firme 2, puis H2 (son premier niveau,
          H2.1) pour la firme 1.
        </p>
      </Callout>

      <p>Rejoue le raisonnement étape par étape, à ton rythme :</p>
      <ExampleBackward />

      <H4>Pourquoi les deux autres EN ne sont pas parfaits en sous-jeux</H4>
      <p>
        On peut le vérifier avec la définition du § 3 : chacun échoue dans le sous-jeu qui
        commence en x₂.
      </p>
      <MiniTbl
        head={["EN", <>Le joueur 1 prévoit en <X>x₂</X>…</>, <>Dans le sous-jeu en <X>x₂</X></>, "ENPS ?"]}
        rows={[
          ["(DG, E)", "G", <YesNo key="a" ok>meilleure action : 1 &gt; 0</YesNo>, <YesNo key="b" ok />],
          ["(DH, E)", "H", <YesNo key="a" ok={false}>H rapporte 0 &lt; 1</YesNo>, <YesNo key="b" ok={false} />],
          ["(CH, F)", "H", <YesNo key="a" ok={false}>H rapporte 0 &lt; 1</YesNo>, <YesNo key="b" ok={false} />],
        ]}
      />
      <p>
        Regarde (CH, F) de près : le joueur 2 joue F parce que le plan du joueur 1 prévoit H en
        x₂. C'est comme si le joueur 1 menaçait : « si tu joues E, je jouerai H et tu auras 0 ».
        Mais arrivé en x₂, le joueur 1 aurait intérêt à jouer G (1 &gt; 0). C'est une{" "}
        <strong>menace non crédible</strong>, exactement comme la guerre des prix du § 1.
      </p>

      <Callout variant="intuition" title="Le petit paradoxe de l'efficacité">
        <p>
          (CH, F) donnerait (3 ; 1), mieux pour <em>les deux</em> joueurs que le (2 ; 0) de
          l'ENPS. Pourquoi ne l'atteignent-ils pas ? Parce que (3 ; 1) n'existe que si le joueur 2
          croit à la menace H. Le joueur 1 aimerait bien qu'il y croie, mais elle n'est pas
          crédible. Résultat : des joueurs parfaitement rationnels, qui se savent rationnels,
          aboutissent à un résultat moins efficace. Tu retrouveras cette idée au labo, avec le jeu
          du centipède : <TheoryRef chapter="bseq" section="s6" />
        </p>
      </Callout>

      <H4>Résultat ou profil de stratégies ? (slide 18)</H4>
      <p>
        Remarque du slide 18 : dans un jeu séquentiel, un <strong>résultat</strong> peut être
        atteint par <strong>différents profils de stratégies</strong>. Par exemple, le résultat
        associé aux payoffs (2 ; 0) est atteint par quatre profils. Cela dit, seul (DG, E) est un
        ENPS.
      </p>
      <MiniTbl
        head={["Profil", "Résultat", "EN ?", "ENPS ?"]}
        rows={[
          ["(DG, E)", "(2 ; 0)", <YesNo key="a" ok />, <YesNo key="b" ok />],
          [
            "(DG, F)",
            "(2 ; 0)",
            <YesNo key="a" ok={false}>le joueur 1 aurait 3 avec CG ou CH</YesNo>,
            <YesNo key="b" ok={false} />,
          ],
          [
            "(DH, E)",
            "(2 ; 0)",
            <YesNo key="a" ok />,
            <YesNo key="b" ok={false}>H non optimal en x₂</YesNo>,
          ],
          [
            "(DH, F)",
            "(2 ; 0)",
            <YesNo key="a" ok={false}>le joueur 1 aurait 3 avec CG ou CH</YesNo>,
            <YesNo key="b" ok={false} />,
          ],
        ]}
      />
      <p>
        Les quatre profils commencent par D : la partie s'arrête en x₀ et le reste des plans ne
        sert pas. Pourtant ils ne se valent pas : c'est justement ce reste (ce qui est prévu en x₁
        et en x₂) qui décide si le profil est un EN, et s'il est un ENPS.
      </p>

      <Callout variant="examen" title="Piège d'examen : un ENPS s'écrit comme un profil">
        <UL>
          <li>
            ✗ « L'ENPS est (2 ; 0). » C'est un <strong>résultat</strong> (des payoffs).
          </li>
          <li>
            ✗ « L'ENPS est D. » C'est une <strong>action</strong> d'un seul joueur.
          </li>
          <li>
            ✓ « L'ENPS est (DG, E) ; le joueur 1 joue D et le résultat est (2 ; 0). » Le profil
            d'abord, puis, si tu veux, le chemin et le résultat.
          </li>
        </UL>
      </Callout>

      <H4>La recette d'examen</H4>

      <Callout variant="methode" title="Rédiger une backward induction pour avoir tous les points">
        <OL>
          <li>
            <strong>Repère les derniers sous-jeux</strong> : ceux dont toutes les arêtes mènent à
            des nœuds finaux (ici, celui qui débute en x₂).
          </li>
          <li>
            <strong>Résous chacun avec H1</strong> : nomme le nœud et le joueur, compare ses
            payoffs avec les chiffres. « Dans le sous-jeu débutant en x₂, si le joueur 1 est
            rationnel (H1), il joue G (1 &gt; 0). »
          </li>
          <li>
            <strong>Remplace ce sous-jeu par le résultat prédit</strong> (on obtient un « jeu
            réduit ») et remonte d'un nœud. Cite l'hypothèse avec un niveau de plus (H2.1, puis
            H2.2…), écris ce que le joueur anticipe et pourquoi, puis compare. « Si le joueur 2
            pense que le joueur 1 est rationnel (H2.1), il anticipe que E lui rapportera 2 (le
            joueur 1 fera G) ; rationnel, il fait E plutôt que F (1). »
          </li>
          <li>
            <strong>Continue jusqu'au nœud initial.</strong>
          </li>
          <li>
            <strong>Conclus par le profil complet</strong> : pour chaque joueur, une action à{" "}
            <em>chacun</em> de ses nœuds, même ceux qui ne sont pas atteints. « ENPS : (DG, E). »
            Puis, à part : « le joueur 1 joue D, le résultat est (2 ; 0). »
          </li>
          <li>
            <strong>Si on te demande aussi les EN</strong> : liste les stratégies (plans
            complets), écris la forme normale, souligne les meilleures réponses, donne{" "}
            <em>tous</em> les EN, puis dis lesquels ne sont pas des ENPS et pourquoi (sous-jeu et
            chiffres).
          </li>
        </OL>
      </Callout>

      <Callout variant="examen" title="Les quatre pièges classiques">
        <UL>
          <li>
            <strong>Confondre action et stratégie</strong> : « D » est une action ; la stratégie
            est « DG » (D en x₀, G en x₂).
          </li>
          <li>
            <strong>Oublier les nœuds non atteints</strong> : la stratégie du joueur 1 doit dire
            ce qu'il ferait en x₂, même s'il joue D.
          </li>
          <li>
            <strong>Donner un résultat au lieu d'un profil</strong> : (2 ; 0) n'est pas un ENPS ;
            (DG, E) en est un.
          </li>
          <li>
            <strong>Croire que tout EN est une bonne prédiction</strong> : (DH, E) et (CH, F) sont
            des EN, mais ils reposent sur un plan non crédible en x₂.
          </li>
        </UL>
      </Callout>

      <Quiz
        scope="bseq"
        id="fond-q7"
        question={<>Combien de stratégies le joueur 1 a-t-il dans le jeu du slide 14 ?</>}
        options={[
          {
            text: <>2 : C et D.</>,
            explain: (
              <>
                Ce sont ses actions en x₀. Mais il joue aussi en x₂ : une stratégie doit préciser
                les deux nœuds.
              </>
            ),
          },
          {
            text: <>3 : CG, CH et D.</>,
            explain: (
              <>
                Piège ! « D » seul n'est pas une stratégie : même s'il joue D, le plan doit dire ce
                qu'il ferait en x₂. D'où DG et DH.
              </>
            ),
          },
          {
            text: <>4 : CG, CH, DG et DH.</>,
            correct: true,
            explain: <>Oui : 2 actions en x₀ × 2 actions en x₂ = 4 plans d'action complets.</>,
          },
        ]}
      />

      <Quiz
        scope="bseq"
        id="fond-q8"
        question={<>Comment écrire l'ENPS du jeu des slides 14 à 18 ?</>}
        options={[
          {
            text: <>(2 ; 0)</>,
            explain: <>C'est le résultat (les payoffs), pas un profil de stratégies.</>,
          },
          {
            text: <>D</>,
            explain: <>C'est une action du joueur 1 en x₀, pas un profil de stratégies.</>,
          },
          {
            text: <>(DG, E)</>,
            correct: true,
            explain: (
              <>
                Oui : la stratégie du joueur 1 (D en x₀, G en x₂) et celle du joueur 2 (E en x₁).
              </>
            ),
          },
          {
            text: <>(DG, F)</>,
            explain: (
              <>
                Il mène bien à (2 ; 0), mais ce n'est même pas un EN : face à F, le joueur 1
                gagnerait 3 avec CG ou CH.
              </>
            ),
          },
        ]}
      />

      <Quiz
        scope="bseq"
        id="fond-q9"
        question={<>Pourquoi l'EN (CH, F) n'est-il pas un ENPS ?</>}
        options={[
          {
            text: <>Parce que ce n'est pas un EN.</>,
            explain: <>Si : c'est l'un des trois EN du slide 16.</>,
          },
          {
            text: (
              <>
                Parce que, dans le sous-jeu qui débute en x₂, H n'est pas la meilleure action du
                joueur 1 (0 &lt; 1).
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui. Le joueur 2 ne joue F que parce qu'il croit que le joueur 1 jouerait H en x₂ :
                c'est une menace non crédible.
              </>
            ),
          },
          {
            text: <>Parce que son résultat (3 ; 1) est efficace.</>,
            explain: (
              <>
                L'efficacité n'entre pas dans la définition de l'ENPS. D'ailleurs, l'ENPS (DG, E)
                mène à un résultat moins efficace.
              </>
            ),
          },
        ]}
      />

      <Quiz
        scope="bseq"
        id="fond-q10"
        kicker="Exemple d'entraînement"
        question={
          <>
            Dans un autre jeu, un joueur doit choisir à <strong>3 nœuds</strong>, avec 2 actions à
            chaque nœud. Combien de stratégies a-t-il ?
          </>
        }
        options={[
          {
            text: <>3</>,
            explain: <>Ça, c'est le nombre de nœuds. Une stratégie choisit une action à chacun.</>,
          },
          {
            text: <>6</>,
            explain: <>Ça, c'est 2 + 2 + 2, le nombre total d'actions. Il faut multiplier.</>,
          },
          {
            text: <>8</>,
            correct: true,
            explain: <>Oui : 2 × 2 × 2 = 8 plans d'action complets.</>,
          },
        ]}
      />
    </Section>
  );
}
