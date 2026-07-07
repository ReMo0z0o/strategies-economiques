/*
 * Chapitre B1 — Jeux simultanés.
 *
 * Conversion fidèle du manuel interactif « B1 · Jeux simultanés » (cours
 * ECGEB366, B. Decerf) : forme normale, stratégies dominantes et dominées
 * (H1), élimination itérative et PSS (H2), équilibre de Nash (H3), les jeux
 * célèbres et leurs applications (climat, paniques bancaires…), les données
 * de laboratoire du cours, puis les stratégies mixtes (pénalty, théorème
 * d'indifférence, police vs mafia).
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  ConvergenceBars,
  GuessTwoThirds,
  IteratedElimination,
  MasteryChecklist,
  MatrixExplorer,
  NashHunter,
  PenaltyExplorer,
  PoliceMafia,
  PollPrisoner,
} from "./b1/interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Tableau simple avec défilement horizontal sur mobile. */
function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[520px] border-collapse text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground"
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
                <td key={j} className="px-3.5 py-2.5 align-top">
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

/** Grille de mini-cartes (l'équivalent des « minicards » de la source). */
function CardGrid({
  items,
}: {
  items: Array<{ tag?: ReactNode; title: ReactNode; body: ReactNode; extra?: ReactNode }>;
}) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          {it.tag ? (
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              {it.tag}
            </div>
          ) : null}
          <div className="text-[15px] font-bold">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
          {it.extra ? (
            <div className="mt-2 border-t pt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {it.extra}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Liste numérotée « à maîtriser absolument ». */
function MustKnow({ items }: { items: ReactNode[] }) {
  return (
    <ul className="my-3 space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-xl border bg-card px-4 py-2.5 text-[15px] leading-relaxed shadow-sm"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
            {i + 1}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Matrice de jeu à payoffs symboliques (m(1+r), min(g, m), 3−t…) : même
 * mise en page que PayoffMatrix, mais chaque case est un ReactNode.
 */
function SymbolicMatrix({
  rowPlayer,
  colPlayer,
  rows,
  cols,
  cells,
  caption,
}: {
  rowPlayer: string;
  colPlayer: string;
  rows: ReactNode[];
  cols: ReactNode[];
  /** cells[r][c] = [payoff joueur ligne, payoff joueur colonne] */
  cells: Array<Array<[ReactNode, ReactNode]>>;
  caption?: ReactNode;
}) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto">
        <div className="inline-block rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-sky-700">
            {colPlayer}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 text-xs font-bold uppercase tracking-wider text-rose-700"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {rowPlayer}
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {cols.map((c, j) => (
                    <th
                      key={j}
                      className="min-w-[6.5rem] p-1.5 text-center text-sm font-semibold text-sky-700"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rLabel, r) => (
                  <tr key={r}>
                    <th className="p-1.5 pr-2 text-right text-sm font-semibold text-rose-700">
                      {rLabel}
                    </th>
                    {cols.map((_, c) => (
                      <td key={c} className="p-1">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-border bg-background px-3 py-2.5 text-[14.5px]">
                          <span className="font-semibold text-rose-700">{cells[r][c][0]}</span>
                          <span className="text-muted-foreground">;</span>
                          <span className="font-semibold text-sky-700">{cells[r][c][1]}</span>
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
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Diagramme d'emboîtement ESD ⊆ EN ⊆ PSS (partie 6)                   */
/* ------------------------------------------------------------------ */

function VennSolutions() {
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 560 320"
        role="img"
        aria-label="Diagramme : ESD inclus dans EN, inclus dans PSS, inclus dans tous les profils"
        className="mx-auto w-full max-w-xl"
      >
        <ellipse cx="280" cy="165" rx="262" ry="140" fill="#fafaf9" stroke="#1c1917" strokeWidth="2" />
        <ellipse cx="280" cy="175" rx="196" ry="104" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
        <ellipse cx="280" cy="186" rx="132" ry="70" fill="#d1fae5" stroke="#047857" strokeWidth="2" />
        <ellipse cx="280" cy="196" rx="70" ry="38" fill="#ffe4e6" stroke="#be123c" strokeWidth="2" />
        <text x="280" y="52" textAnchor="middle" fontSize="15.5" fontWeight="600" fill="#1c1917">
          Tous les profils de stratégies d'un jeu
        </text>
        <text x="280" y="103" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0369a1">
          PSS
        </text>
        <text x="280" y="146" textAnchor="middle" fontSize="15" fontWeight="700" fill="#047857">
          EN
        </text>
        <text x="280" y="202" textAnchor="middle" fontSize="15" fontWeight="700" fill="#be123c">
          ESD
        </text>
        <circle cx="120" cy="120" r="4" fill="#1c1917" />
        <circle cx="440" cy="220" r="4" fill="#1c1917" />
        <circle cx="410" cy="105" r="4" fill="#1c1917" />
        <circle cx="160" cy="200" r="4" fill="#0369a1" />
        <circle cx="395" cy="175" r="4" fill="#0369a1" />
        <circle cx="205" cy="170" r="4" fill="#047857" />
        <circle cx="360" cy="215" r="4" fill="#047857" />
      </svg>
      <figcaption className="mt-1 text-center text-sm text-muted-foreground">
        <sup>†</sup> Pour être précis : un EN est un PSS si l'on définit les PSS via l'élimination
        des stratégies <em>strictement</em> dominées.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */

export default function Chapter() {
  return (
    <ChapterShell chapterId="b1">
      {/* ============================================================ */}
      {/* S0 — Pourquoi ce chapitre ?                                   */}
      {/* ============================================================ */}
      <Section id="s0" kicker="Introduction" title="Pourquoi ce chapitre ?">
        <p className="text-[1.15rem] leading-relaxed">
          Pourquoi les pays n'agissent-ils pas contre le climat alors que tout le monde est
          d'accord ? Pourquoi les paniques bancaires existent-elles… et comment les a-t-on fait
          disparaître ? Ce chapitre te donne une boîte à outils pour analyser toutes les
          situations où <em>plusieurs</em> personnes décident en même temps, et où le résultat
          dépend de tout le monde.
        </p>

        <div className="my-4 flex flex-wrap gap-2 text-[13px] font-medium">
          {[
            "🎯 3 concepts de solution : ESD · PSS · Équilibre de Nash",
            "🃏 6 jeux célèbres décortiqués",
            "🎲 Stratégies mixtes",
            "🧪 Données de labo réelles du cours",
          ].map((t) => (
            <span key={t} className="rounded-full border bg-card px-3.5 py-1.5 text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        <p>
          Jusqu'ici dans le cours, on a étudié des décideurs{" "}
          <strong>seuls face à leur choix</strong> : au chapitre A1, une personne choisit le
          panier qu'elle préfère ; au chapitre A2, elle arbitre entre consommer aujourd'hui ou
          demain. Dans les deux cas, le résultat de son choix ne dépendait <em>que d'elle</em>.
        </p>
        <p>
          Mais dans la vraie vie, énormément de situations sont <strong>interactives</strong> : ce
          que j'obtiens dépend aussi de ce que <em>toi</em> tu fais. Deux exemples qui ouvrent le
          cours :
        </p>
        <ul>
          <li>
            <strong>Le climat.</strong> Tous les dirigeants disent que des mesures fortes sont
            nécessaires… et pourtant les émissions de CO₂ continuent d'augmenter. Si mettre une
            taxe carbone est « la bonne chose à faire », pourquoi si peu de pays le font ? À quoi
            servent des accords comme le Protocole de Kyoto ou l'Accord de Paris ?
          </li>
          <li>
            <strong>Les paniques bancaires.</strong> Royaume-Uni (1797), États-Unis (1907),
            Argentine (1998) : des épargnants paniqués se ruent aux guichets, la banque
            s'effondre, tout le monde y perd. Pourtant, en septembre 2008, la banque belge Fortis
            frôle la faillite… et il n'y a <em>pas</em> de panique. Qu'est-ce qui a changé ?
          </li>
        </ul>
        <p>
          Le point commun : dans ces situations, chacun voudrait que <em>tout le monde</em> se
          comporte « bien » (coopérer pour le climat, ne pas paniquer), mais chacun,
          individuellement, a parfois intérêt à faire autre chose. Il y a un{" "}
          <strong>décalage entre ce qui est souhaitable collectivement et ce qui est observé</strong>.
          La <strong>théorie des jeux</strong> est l'outil qui explique ce décalage — et qui aide
          à concevoir des solutions (accords avec pénalités, garantie des dépôts…).
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
                donner les <strong>PSS</strong>.
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

        <Callout variant="intuition" title="🔗 Lien avec les chapitres précédents">
          <p>
            Le mot-clé du chapitre A1 était la <strong>rationalité</strong> : un agent rationnel
            choisit l'option qui <em>maximise son utilité</em>. Ici, rien ne change… sauf que
            l'utilité obtenue dépend aussi des choix des <em>autres</em>. Le « payoff » d'un
            joueur, tu vas le voir, n'est rien d'autre que l'utilité du chapitre A1 appliquée au
            résultat d'une interaction.
          </p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <TheoryRef chapter="a1" />
            <TheoryRef chapter="a2" />
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* S1 — C'est quoi, un jeu ?                                     */}
      {/* ============================================================ */}
      <Section id="s1" kicker="Partie 1" title="C'est quoi, un jeu ?">
        <p>
          En théorie des jeux, le mot « jeu » ne désigne pas seulement le Monopoly ou le poker. Un{" "}
          <strong>jeu</strong> est un modèle mathématique d'une{" "}
          <strong>interaction stratégique</strong>.
        </p>

        <Callout variant="definition" title="Définition — interaction stratégique">
          <p>Une interaction stratégique implique :</p>
          <ul>
            <li>
              <strong>au moins deux joueurs</strong>,
            </li>
            <li>
              chaque joueur a <strong>un choix à faire</strong>, et
            </li>
            <li>
              le <strong>résultat dépend des choix de tous</strong> les joueurs.
            </li>
          </ul>
        </Callout>

        <p>
          Ta note à un examen ne dépend que de toi : ce n'est <em>pas</em> une interaction
          stratégique. Mais le prix auquel deux stations-service vendent leur essence, la décision
          de te doper (ou non) dans une course cycliste, l'heure à laquelle tu arrives à un
          rendez-vous… tout ça en est.
        </p>

        <H4>L'exemple fil rouge : le jeu du rendez-vous</H4>
        <p>
          Voici l'histoire qui va nous suivre pendant toute la première moitié du chapitre. Lis-la
          attentivement, on va la « traduire en mathématiques » juste après.
        </p>
        <Callout variant="exemple" title="📜 L'histoire">
          <p>
            Tu donnes rendez-vous à ton amie devant la gare à 16h. Au moment de partir de chez
            soi, <strong>chacun décide sans connaître le choix de l'autre</strong> : arriver à
            l'heure (16h) ou en retard (16h15). L'utilité de chacun est la somme de :
          </p>
          <ul>
            <li>
              <strong>−2</strong> pour la personne qui <em>attend</em> l'autre (c'est pénible
              d'attendre),
            </li>
            <li>
              <strong>−1</strong> pour la personne qui <em>fait attendre</em> l'autre (un peu de
              culpabilité),
            </li>
            <li>
              <strong>−3</strong> pour ton amie <em>si elle arrive en retard</em> — elle est du
              genre « ponctuelle », être en retard la stresse. Toi, ça ne te fait rien.
            </li>
          </ul>
        </Callout>

        <p>
          Pour transformer cette histoire en jeu, il faut identifier{" "}
          <strong>trois ingrédients</strong>. C'est <em>toujours</em> la même recette, retiens-la :
        </p>

        <Callout variant="definition" title="Définition — un jeu simultané, c'est 3 ingrédients">
          <ol>
            <li>
              <strong>Les joueurs</strong> : un ensemble{" "}
              <M tex="\{1, \dots, i, \dots, n\}" />. Ici :{" "}
              <span className="font-bold text-rose-700">Vous</span> et{" "}
              <span className="font-bold text-sky-700">Amie</span>.
            </li>
            <li>
              <strong>Les stratégies</strong> de chaque joueur <M tex="i" /> : l'ensemble{" "}
              <M tex="S_i" /> de tout ce qu'il peut choisir. Ici :{" "}
              <M tex="S = \{\text{Heure}, \text{Retard}\}" /> pour chacun.
            </li>
            <li>
              <strong>La fonction de payoff</strong> de chaque joueur : pour chaque combinaison de
              choix, le nombre <M tex="u_i(\dots)" /> qui mesure la satisfaction du joueur{" "}
              <M tex="i" />. Ici par exemple <M tex="u_V(H, R) = -2" /> : si tu es à l'
              <strong>H</strong>eure et elle en <strong>R</strong>etard, tu attends, donc −2.
            </li>
          </ol>
        </Callout>

        <Callout variant="attention" title="⚠️ Deux pièges classiques (questions d'examen !)">
          <p>
            <strong>Piège 1 — résultat ≠ payoffs.</strong> Chaque combinaison de stratégies (on
            dit un <strong>profil de stratégies</strong>) produit un <strong>résultat</strong>{" "}
            concret (« les deux arrivent à l'heure »), et ce résultat est <em>ensuite</em> évalué
            par chaque joueur via son payoff. Le profil (H, H) donne le résultat « personne
            n'attend », associé au profil de payoffs (0, 0).
          </p>
          <p>
            <strong>Piège 2 — payoff ≠ argent.</strong> Si le résultat d'un jeu est une somme
            d'argent, le payoff est l'<strong>utilité</strong> que le joueur tire de cette somme,
            pas la somme elle-même. Deux joueurs peuvent gagner 100 € chacun et en tirer des
            payoffs différents.
          </p>
        </Callout>

        <Callout variant="intuition" title="🔗 Rappel du chapitre A1">
          <p>
            « Payoff = utilité du résultat » — exactement la fonction d'utilité de A1 ! Et l'
            <strong>Hypothèse 1</strong> de la partie 3 est mot pour mot la rationalité de A1 :
            choisir ce qui maximise son utilité. La nouveauté n'est pas le comportement du joueur,
            c'est le fait que son payoff dépend <em>aussi des autres</em>.
          </p>
        </Callout>

        <H4>
          Une notation à connaître : <M tex="s_{-i}" />
        </H4>
        <p>
          On écrira souvent un profil de stratégies <M tex="(s_1, \dots, s_n)" /> sous la forme
          raccourcie <M tex="(s_i, s_{-i})" /> : la stratégie du joueur <M tex="i" />, et{" "}
          <M tex="s_{-i}" /> = « tout ce que font <strong>les autres</strong> » (littéralement :
          le profil sans la composante <M tex="i" />
          ). Quand tu lis <M tex="s_{-i}" />, pense « <em>les adversaires de i</em> ». Cette
          notation revient dans toutes les définitions du chapitre.
        </p>

        <H4>Quel type de jeux étudie-t-on dans ce chapitre ?</H4>
        <p>
          La théorie des jeux classe les jeux selon les hypothèses sur le timing et l'information.
          En B1, on se limite aux jeux avec ces <strong>quatre caractéristiques</strong> —
          retiens-les, elles définissent le cadre :
        </p>
        <ul>
          <li>
            <strong>Non-coopératifs</strong> : impossible de signer un accord contraignant avant
            de jouer. (Pas de « promis-juré » qui engage vraiment.)
          </li>
          <li>
            <strong>Simultanés</strong> : chacun choisit <em>sans connaître</em> le choix des
            autres. (Pas forcément au même instant — ce qui compte, c'est l'ignorance.)
          </li>
          <li>
            <strong>Information complète</strong> : chacun connaît les stratégies possibles et les
            payoffs <em>de tous</em>. (Je sais ce que tu aimes, tu sais ce que j'aime.)
          </li>
          <li>
            <strong>Non-répétés</strong> : on joue une seule fois, on encaisse, on ne se revoit
            plus jamais.
          </li>
        </ul>

        <Quiz
          scope="b1"
          id="q1"
          question={<>Laquelle de ces situations est une interaction stratégique ?</>}
          options={[
            {
              text: <>Un agriculteur choisit quoi planter en fonction de la météo.</>,
              explain: (
                <>
                  Non : ta récolte dépend de la météo, pas du choix d'un autre décideur. La nature
                  n'est pas un « joueur » qui maximise un payoff.
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
                  qu'il arrive — le résultat ne dépend que de toi.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* S2 — Lire (et écrire) une matrice                             */}
      {/* ============================================================ */}
      <Section id="s2" kicker="Partie 2" title="Lire (et écrire) une matrice de jeu">
        <p>
          La <strong>forme normale</strong> d'un jeu, c'est sa fiche d'identité : un tableau qui
          résume d'un coup d'œil les joueurs, leurs stratégies et tous les payoffs. C'est l'outil
          n°1 du chapitre — si tu ne sais pas lire ce tableau les yeux fermés, rien de la suite ne
          fonctionnera. Voici les règles de lecture :
        </p>
        <ul>
          <li>
            Le <span className="font-bold text-rose-700">joueur 1</span> (en rouge, ici{" "}
            <em>Vous</em>) choisit la <strong>ligne</strong>.
          </li>
          <li>
            Le <span className="font-bold text-sky-700">joueur 2</span> (en bleu, ici{" "}
            <em>Amie</em>) choisit la <strong>colonne</strong>.
          </li>
          <li>
            Chaque case contient <strong>deux nombres</strong> :{" "}
            <span className="font-bold text-rose-700">payoff du joueur 1</span> ;{" "}
            <span className="font-bold text-sky-700">payoff du joueur 2</span>.{" "}
            <em>Toujours dans cet ordre.</em>
          </li>
        </ul>

        <MatrixExplorer />

        <Callout variant="methode" title="Méthode — construire une matrice depuis une histoire">
          <ol>
            <li>
              Identifie les <strong>joueurs</strong> → un en lignes, un en colonnes.
            </li>
            <li>
              Liste les <strong>stratégies</strong> de chacun → une ligne / colonne par stratégie.
            </li>
            <li>
              Pour <strong>chaque case</strong>, raconte-toi le scénario (« que se passe-t-il
              si… ? ») et additionne les éléments d'utilité de <em>chaque</em> joueur, un joueur à
              la fois.
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
                  (−3 de stress).
                </>
              ),
            },
          ]}
        />

        <p>
          Maintenant qu'on sait <em>décrire</em> un jeu, la vraie question arrive :{" "}
          <strong>peut-on prédire ce que les joueurs vont faire ?</strong> C'est tout l'objet des
          trois prochaines parties. La théorie des jeux procède en empilant des hypothèses sur le
          comportement des joueurs — H1, puis H2, puis H3 — chaque hypothèse donnant un « concept
          de solution » plus précis que le précédent.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* S3 — Stratégies dominantes & dominées (H1)                    */}
      {/* ============================================================ */}
      <Section
        id="s3"
        kicker="Partie 3 · Hypothèse 1"
        title="Stratégies dominantes & dominées"
      >
        <Callout variant="definition" title="Hypothèse 1 — les joueurs sont rationnels">
          <p>
            Un joueur rationnel choisit sa stratégie de manière à{" "}
            <strong>maximiser son payoff</strong>. Conséquences : il{" "}
            <strong>utilise sa stratégie dominante</strong> quand il en a une, et il{" "}
            <strong>n'utilise jamais une stratégie dominée</strong>.
          </p>
        </Callout>

        <H4>Stratégie dominante : « le meilleur choix, quoi que fassent les autres »</H4>

        <Callout variant="definition" title="Définition — stratégie dominante">
          <p>
            La stratégie <M tex="s_i^*" /> est <strong>dominante</strong> pour le joueur{" "}
            <M tex="i" /> si
          </p>
          <MB tex="u_i(s_i^*, s_{-i}) \;\ge\; u_i(s_i', s_{-i})" />
          <p>
            pour <strong>toutes</strong> les autres stratégies <M tex="s_i'" /> et pour{" "}
            <strong>tous</strong> les <M tex="s_{-i}" /> possibles. En français :{" "}
            <em>quoi que fassent les autres</em>, cette stratégie est (au moins aussi) bonne que
            tout le reste.
          </p>
        </Callout>

        <p>
          Comment vérifier en pratique ? On teste un <strong>système d'inégalités</strong> : pour{" "}
          <em>chaque</em> stratégie possible de l'adversaire, on compare. Exemple avec le jeu du
          rendez-vous : la stratégie <strong>H</strong> est-elle dominante pour ton{" "}
          <span className="font-bold text-sky-700">Amie</span> ?
        </p>
        <ul>
          <li>
            Si <strong>tu joues H</strong> : <M tex="u_A(H, H) = 0 > u_A(H, R) = -4" /> ✔ (H est
            mieux pour elle)
          </li>
          <li>
            Si <strong>tu joues R</strong> : <M tex="u_A(R, H) = -2 > u_A(R, R) = -3" /> ✔ (H est
            encore mieux)
          </li>
        </ul>
        <p>
          Dans les deux cas de figure, H bat R : <strong>H est dominante pour ton amie</strong>.
          Logique : être en retard lui coûte tellement (−3) qu'elle préfère toujours être à
          l'heure. Et toi ? Vérifie : si elle joue H, tu préfères H (<M tex="0 > -1" />) ; mais si
          elle joue R, tu préfères R (<M tex="0 > -2" />
          ). Ton meilleur choix <em>dépend</em> du sien →{" "}
          <strong>tu n'as pas de stratégie dominante</strong>.
        </p>

        <H4>L'équilibre en stratégies dominantes (ESD)</H4>
        <Callout variant="definition" title="Définition — ESD">
          <p>
            Le profil <M tex="(s_1, \dots, s_n)" /> est un{" "}
            <strong>équilibre en stratégies dominantes</strong> si <M tex="s_i" /> est dominante
            pour <strong>chaque</strong> joueur <M tex="i" />. C'est la prédiction la plus solide
            qui existe : elle ne demande que H1.
          </p>
        </Callout>
        <p>
          Dans le jeu du rendez-vous, <em>toi</em> tu n'as pas de stratégie dominante →{" "}
          <strong>ce jeu n'a pas d'ESD</strong>. C'est la limite théorique de l'ESD : beaucoup de
          jeux n'en ont aucun. Mais certains jeux très importants en ont un…
        </p>

        <H4>⭐ Le dilemme du prisonnier</H4>
        <p>
          Le jeu le plus célèbre de toute la théorie des jeux. Deux suspects, cellules séparées,
          pas de preuves. Chacun peut <strong>Nier</strong> ou <strong>Confesser</strong>. Années
          de prison : 1 an si les deux nient, 2 ans si les deux confessent, 3 ans pour celui qui
          nie pendant que l'autre confesse (qui, lui, sort libre : 0 an). En posant payoff = 3 −
          années de prison :
        </p>

        <PayoffMatrix
          rowPlayer="Prisonnier 1"
          colPlayer="Prisonnier 2"
          rows={["Nier", "Confesser"]}
          cols={["Nier", "Confesser"]}
          payoffs={[
            [
              [2, 2],
              [0, 3],
            ],
            [
              [3, 0],
              [1, 1],
            ],
          ]}
          highlight={[[1, 1]]}
          caption={<>Dilemme du prisonnier — la case encadrée est l'ESD.</>}
        />

        <p>
          Vérifie que <strong>Confesser est dominante pour chacun</strong> : si l'autre nie,{" "}
          <M tex="3 > 2" /> ; si l'autre confesse, <M tex="1 > 0" />. Donc{" "}
          <strong>(C, C) est un ESD</strong> : la théorie prédit que deux joueurs rationnels
          confessent tous les deux… et finissent avec (1, 1) alors que (N, N) leur aurait donné
          (2, 2) à tous les deux !
        </p>

        <Callout variant="definition" title="Au passage — dominé « au sens de Pareto »">
          <p>
            Un résultat <strong>Pareto-domine</strong> un autre si <em>tous</em> les joueurs y
            sont au moins aussi bien, et au moins un strictement mieux. Ici (N, N) Pareto-domine
            (C, C). Le drame du dilemme du prisonnier : son ESD est{" "}
            <strong>Pareto-dominé</strong> — les incitations individuelles ne sont pas alignées
            avec l'intérêt collectif.
          </p>
        </Callout>

        <PollPrisoner />

        <H4>Le dilemme du prisonnier est partout</H4>
        <p>
          Ce jeu modélise une famille immense de situations où « coopérer » est collectivement
          mieux mais « trahir » est individuellement dominant :
        </p>
        <CardGrid
          items={[
            {
              tag: "Climat",
              title: "États et taxe carbone",
              body: (
                <>
                  Coopérer = investir dans le vert (coût −3) ; trahir = énergies fossiles (−2 de
                  pollution <em>pour tout le monde</em>, par pays qui trahit). Trahir est dominant
                  → inertie climatique.
                </>
              ),
            },
            {
              tag: "Ressources communes",
              title: "Surpêche, pâturages, forêts",
              body: (
                <>
                  Chaque villageois a intérêt à prélever plus, tous préféreraient que personne ne
                  surexploite.
                </>
              ),
            },
            {
              tag: "Course aux armements",
              title: "Deux superpuissances",
              body: (
                <>
                  Investir encore dans l'arsenal nucléaire est dominant, alors que les deux
                  préféreraient le statu quo.
                </>
              ),
            },
            {
              tag: "Sport & entreprise",
              title: "Dopage · publicité",
              body: (
                <>
                  Les cyclistes préféreraient tous ne pas se doper ; deux firmes préféreraient
                  dépenser moins en pub. Même structure.
                </>
              ),
            },
          ]}
        />

        <p>
          La <strong>solution</strong> générale ? Changer le jeu ! Un accord international (Kyoto,
          Paris) qui inflige une <strong>pénalité</strong> à celui qui trahit modifie les
          payoffs… et peut rendre la coopération dominante. C'est exactement l'exercice qui suit.
          👇
        </p>

        <ExerciseBlock
          scope="b1"
          id="ex1"
          number={1}
          title="Sauver le climat en changeant les payoffs"
          difficulty={1}
          statement={
            <>
              <p>
                Deux pays luttent contre le changement climatique. Payoff d'un pays = 5 + (−3 s'il
                coopère, coût d'investissement) + (−2 <em>par pays qui trahit</em>, externalité de
                pollution). Cela donne :
              </p>
              <PayoffMatrix
                rowPlayer="Pays 1"
                colPlayer="Pays 2"
                rows={["Coopérer", "Trahir"]}
                cols={["Coopérer", "Trahir"]}
                payoffs={[
                  [
                    [2, 2],
                    [0, 3],
                  ],
                  [
                    [3, 0],
                    [1, 1],
                  ],
                ]}
              />
              <p>
                <strong>a)</strong> Vérifie que Trahir est dominante pour chaque pays (écris les
                inégalités).
                <br />
                <strong>b)</strong> Les pays signent un accord : toute trahison coûte une pénalité{" "}
                <M tex="t > 0" />. Réécris la matrice.
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
                  Pour le Pays 1 (le jeu est symétrique) : si P2 coopère,{" "}
                  <M tex="u_1(T, C) = 3 > u_1(C, C) = 2" /> ✔ ; si P2 trahit,{" "}
                  <M tex="u_1(T, T) = 1 > u_1(C, T) = 0" /> ✔. Trahir est dominante, et (T, T) est
                  l'ESD — Pareto-dominé par (C, C). Voilà le mécanisme de l'inertie climatique.
                </p>
              ),
            },
            {
              title: "b) Réécrire la matrice avec la pénalité t",
              content: (
                <>
                  <p>
                    On soustrait <M tex="t" /> à chaque payoff « Trahir » : la ligne/colonne
                    Trahir devient : (T, C) → <M tex="3 - t" /> ; (T, T) → <M tex="1 - t" /> pour
                    chacun. Les payoffs de Coopérer ne changent pas.
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
                <p>
                  Coopérer domine Trahir pour P1 si : <M tex="2 \ge 3 - t" /> (face à C) <em>et</em>{" "}
                  <M tex="0 \ge 1 - t" /> (face à T). Les deux donnent{" "}
                  <strong>
                    <M tex="t \ge 1" />
                  </strong>
                  .
                </p>
              ),
            },
          ]}
          result={
            <p>
              Dès que la pénalité vaut au moins 1, (C, C) devient l'ESD : l'accord a littéralement{" "}
              <em>changé le jeu</em>. C'est l'idée derrière Kyoto/Paris — et leur faiblesse quand
              la pénalité est trop faible ou non appliquée.
            </p>
          }
        />

        <H4>Stratégie dominée : « il existe toujours mieux »</H4>
        <Callout variant="definition" title="Définition — stratégie dominée">
          <p>
            La stratégie <M tex="s_i" /> est <strong>dominée</strong> par <M tex="s_i'" /> si
          </p>
          <MB tex="u_i(s_i', s_{-i}) \;\ge\; u_i(s_i, s_{-i}) \qquad \text{pour tous les } s_{-i}." />
          <p>
            En français : <em>quoi que fassent les autres</em>, <M tex="s_i'" /> rapporte au moins
            autant. Un joueur rationnel ne joue jamais une stratégie dominée.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Dominante vs dominée — la subtilité qui tue à l'examen">
          <p>
            « Dominante » compare une stratégie à <strong>toutes</strong> les autres. « Dominée »
            compare une stratégie à <strong>une seule</strong> autre. Conséquence importante : un
            joueur peut avoir une stratégie <strong>dominée sans avoir de stratégie dominante</strong>.
            Avec 2 stratégies, les deux notions coïncident ; avec 3 ou plus, non ! La preuve avec
            ce jeu :
          </p>
          <PayoffMatrix
            rowPlayer="P1"
            colPlayer="P2"
            rows={["H", "M", "B"]}
            cols={["g", "m", "d"]}
            payoffs={[
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
            ]}
          />
          <p>
            Pour <span className="font-bold text-sky-700">P2</span>, la stratégie <strong>d</strong>{" "}
            est dominée par <strong>m</strong> : <M tex="u_2(H, m) = 0 \ge 0" /> ;{" "}
            <M tex="u_2(M, m) = 2 > 0" /> ; <M tex="u_2(B, m) = 4 > 0" />. Mais P2 n'a <em>pas</em>{" "}
            de dominante (contre H il préfère g, contre B il préfère m). Garde ce jeu en tête : on
            le retrouve dans la partie 4.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* S4 — L'élimination itérative (H2 → PSS)                       */}
      {/* ============================================================ */}
      <Section id="s4" kicker="Partie 4 · Hypothèse 2" title="L'élimination itérative (PSS)">
        <p>
          Le concept de stratégie dominée permet « d'éliminer » plus de stratégies que celui de
          dominante… mais souvent pas assez pour prédire un résultat unique. Pour aller plus loin,
          la théorie ajoute une hypothèse sur ce que les joueurs{" "}
          <strong>savent les uns des autres</strong>.
        </p>

        <Callout
          variant="definition"
          title={
            <>
              Hypothèse 2 — connaissance réciproque de la rationalité (
              <em>common knowledge of rationality</em>)
            </>
          }
        >
          <p>Chaque joueur…</p>
          <ul>
            <li>
              <strong>H2.1</strong> — sait que ses adversaires sont rationnels ;
            </li>
            <li>
              <strong>H2.2</strong> — sait que ses adversaires savent que <em>leurs</em>{" "}
              adversaires sont rationnels ;
            </li>
            <li>
              <strong>H2.3</strong> — sait qu'ils savent qu'ils savent…{" "}
              <em>et ainsi de suite à l'infini.</em>
            </li>
          </ul>
          <p>
            Ça a l'air vertigineux, mais l'idée est simple : « je sais que tu ne joueras pas une
            stratégie dominée, <em>et tu sais que je le sais</em>, etc. » Chaque niveau de H2
            autorise une <strong>itération</strong> de raisonnement supplémentaire.
          </p>
        </Callout>

        <p>
          Retour au jeu du rendez-vous : tu n'avais pas de stratégie dominante… mais grâce à H2.1,
          tu peux <em>anticiper</em>. Le raisonnement complet, à savoir refaire :
        </p>
        <ol>
          <li>Par H1, les joueurs rationnels ne jouent pas de stratégies dominées.</li>
          <li>
            Pour ton amie, <strong>R est dominée par H</strong> (vérifié en partie 3).
          </li>
          <li>
            Par H2.1, <strong>tu anticipes</strong> donc qu'elle jouera H.
          </li>
          <li>
            Par H1, tu joues ta meilleure option face à H :{" "}
            <M tex="u_V(H, H) = 0 > u_V(R, H) = -1" /> → tu joues <strong>H</strong>.
          </li>
        </ol>
        <p>
          Prédiction : <strong>(H, H)</strong> — tout le monde à l'heure. Ce processus
          « j'élimine, puis je ré-élimine dans le jeu réduit, etc. » s'appelle l'
          <strong>élimination itérative des stratégies dominées</strong>. Regarde-le tourner en
          direct sur le jeu 3×3 de tout à l'heure :
        </p>

        <IteratedElimination />

        <Callout variant="definition" title="Définition — PSS">
          <p>
            Les profils de stratégies qui <strong>survivent</strong> au processus d'élimination
            itérative des stratégies dominées s'appellent les <strong>PSS</strong> (« profils de
            stratégies survivants »). C'est le concept de solution basé sur H1 + H2.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Limite théorique des PSS">
          <p>
            Beaucoup de jeux ont de <strong>nombreux</strong> PSS — la prédiction reste alors
            floue. Dans notre jeu 3×3, quatre profils survivent : la théorie ne dit pas lequel
            sera joué. Il faut encore autre chose… (→ partie 5).
          </p>
        </Callout>

        <Quiz
          scope="b1"
          id="q3"
          question={
            <>
              Quelle hypothèse est <em>indispensable</em> pour justifier la deuxième itération
              d'élimination (celle où P1 et P2 raisonnent sur le jeu déjà réduit deux fois) ?
            </>
          }
          options={[
            {
              text: <>H1 seule (rationalité)</>,
              explain: (
                <>
                  H1 justifie seulement qu'un joueur ne joue pas SES stratégies dominées — pas
                  qu'il anticipe le raisonnement des autres.
                </>
              ),
            },
            {
              text: <>H1 + H2.1 seulement</>,
              explain: (
                <>
                  H2.1 justifie la PREMIÈRE itération : je sais que tu es rationnel, donc je te
                  retire tes stratégies dominées. Mais pas la suite.
                </>
              ),
            },
            {
              text: <>H1 + H2.2 (« je sais que tu sais que je suis rationnel »)</>,
              correct: true,
              explain: (
                <>
                  Exact. Chaque itération supplémentaire consomme un niveau de H2 : itération 1 ←
                  H2.1, itération 2 ← H2.2, etc. C'est pour ça qu'on parle de « connaissance
                  réciproque » à tous les niveaux.
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
                <strong>d)</strong> Applique l'élimination itérative : quels sont les PSS ? Quelle
                est la prédiction finale ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) La dominante de P1",
              content: (
                <p>
                  Compare A et B pour P1, colonne par colonne : face à x : <M tex="3 > 2" /> ✔ ;
                  face à y : <M tex="1 > 0" /> ✔ ; face à z : <M tex="4 > 3" /> ✔.{" "}
                  <strong>A est dominante</strong> pour P1 (elle bat sa seule alternative dans
                  tous les cas).
                </p>
              ),
            },
            {
              title: "b) P2 : pas de dominante, mais une dominée",
              content: (
                <p>
                  Pour P2 (compare ses payoffs bleus <em>ligne par ligne</em>) : face à A, le
                  mieux est y (3) ; face à B, le mieux est x (4). Le meilleur choix dépend de P1 →{" "}
                  <strong>pas de dominante</strong>. Dominée ? Compare z et x : face à A :{" "}
                  <M tex="1 < 2" /> ✔ ; face à B : <M tex="3 < 4" /> ✔ →{" "}
                  <strong>z est dominée par x</strong>.
                </p>
              ),
            },
            {
              title: "c) Pas d'ESD",
              content: (
                <p>
                  ESD = <em>tous</em> les joueurs jouent une dominante. P2 n'en a pas →{" "}
                  <strong>pas d'ESD</strong>.
                </p>
              ),
            },
            {
              title: "d) L'élimination itérative → PSS unique",
              content: (
                <p>
                  Élimination : B est dominée par A (P1), z est dominée par x (P2) → on retire les
                  deux. Jeu réduit : P1 joue A ; P2 choisit entre x (payoff 2) et y (payoff 3) →
                  face à A, <M tex="y > x" />, et B a disparu, donc{" "}
                  <strong>x est dominée par y dans le jeu réduit</strong> et disparaît à
                  l'itération suivante. <strong>PSS unique : (A, y)</strong>, payoffs (1 ; 3).
                </p>
              ),
            },
          ]}
          result={
            <p>
              Remarque intéressante : la prédiction est <strong>unique</strong> alors qu'il n'y
              avait pas d'ESD — l'élimination itérative est un outil plus puissant que la seule
              dominance.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* S5 — L'équilibre de Nash (H3)                                 */}
      {/* ============================================================ */}
      <Section id="s5" kicker="Partie 5 · Hypothèse 3" title="L'équilibre de Nash">
        <p>
          Pour des prédictions encore plus précises, la théorie fait une hypothèse sur la capacité
          des joueurs à <strong>anticiper</strong> :
        </p>

        <Callout variant="definition" title="Hypothèse 3 — anticipations correctes">
          <p>
            Les joueurs <strong>anticipent correctement</strong> les stratégies que leurs
            adversaires vont utiliser. Combinée à H1 (chacun choisit sa meilleure réponse à ce
            qu'il anticipe), cette hypothèse implique que les joueurs se coordonnent sur un{" "}
            <strong>équilibre de Nash</strong>.
          </p>
        </Callout>

        <Callout variant="definition" title="Définitions — meilleure réponse & équilibre de Nash">
          <p>
            La stratégie <M tex="s_i^*" /> est une <strong>meilleure réponse</strong> au profil{" "}
            <M tex="s_{-i}" /> si aucune autre stratégie ne donne un payoff plus grand :
          </p>
          <MB tex="u_i(s_i^*, s_{-i}) \;\ge\; u_i(s_i', s_{-i}) \qquad \text{pour toutes les autres } s_i'." />
          <p>
            Le profil <M tex="(s_1, \dots, s_n)" /> est un <strong>équilibre de Nash (EN)</strong>{" "}
            si <M tex="s_i" /> est une meilleure réponse à <M tex="s_{-i}" /> <em>pour tous</em>{" "}
            les joueurs : les stratégies sont des <strong>meilleures réponses mutuelles</strong>.
            Autrement dit : <em>personne n'a intérêt à dévier seul</em>, étant donné ce que font
            les autres.
          </p>
        </Callout>

        <Callout
          variant="methode"
          title="Méthode infaillible pour trouver les EN — « la méthode du soulignage »"
        >
          <ol>
            <li>
              Pour <strong>chaque colonne</strong> (chaque stratégie de{" "}
              <span className="font-bold text-sky-700">J2</span>), entoure le{" "}
              <span className="font-bold text-rose-700">payoff rouge</span> le plus élevé → c'est
              la meilleure réponse de <span className="font-bold text-rose-700">J1</span>.
            </li>
            <li>
              Pour <strong>chaque ligne</strong> (chaque stratégie de{" "}
              <span className="font-bold text-rose-700">J1</span>), entoure le{" "}
              <span className="font-bold text-sky-700">payoff bleu</span> le plus élevé →
              meilleure réponse de <span className="font-bold text-sky-700">J2</span>.
            </li>
            <li>
              Les cases où <strong>les deux payoffs sont entourés</strong> sont les équilibres de
              Nash. ✅
            </li>
          </ol>
        </Callout>

        <NashHunter />

        <H4>La galerie des jeux à connaître par cœur</H4>
        <p>
          Chacun de ces jeux est un « archétype » : à l'examen, on attend que tu reconnaisses{" "}
          <em>quelle situation réelle correspond à quelle structure de jeu</em>. Voici la fiche
          mémo de chacun (joue-les tous dans le widget ci-dessus !) :
        </p>

        <CardGrid
          items={[
            {
              tag: "2 EN · préférences opposées sur les équilibres",
              title: "⚔️ Bataille des sexes",
              body: (
                <>
                  Il cuisine viande ou poisson, elle apporte rouge ou blanc. Tous deux veulent{" "}
                  <strong>se coordonner</strong> (viande+rouge ou poisson+blanc)… mais pas sur la
                  même chose : lui préfère (V, R), elle (P, B).
                </>
              ),
              extra: (
                <>
                  <strong>Dans la vraie vie :</strong> Samsung et son fournisseur qui doivent
                  adopter un standard technologique commun ; un fonctionnaire et un businessman
                  qui doivent « s'entendre » sur règles officielles vs pots-de-vin.
                </>
              ),
            },
            {
              tag: "2 EN · l'un Pareto-domine l'autre",
              title: "🦌 Chasse au cerf",
              body: (
                <>
                  Chasser le cerf à deux : gros gain (2, 2), mais risqué si l'autre ne vient pas
                  (0). Le lièvre : petit gain sûr (1). Deux EN : (Cerf, Cerf) et (Lièvre, Lièvre).
                  Le problème : la <strong>peur de l'erreur de l'autre</strong> devient une{" "}
                  <em>prophétie auto-réalisatrice</em> — si je crains que tu chasses le lièvre, je
                  chasse le lièvre.
                </>
              ),
              extra: (
                <>
                  <strong>Dans la vraie vie :</strong> les paniques bancaires (voir ci-dessous).
                </>
              ),
            },
            {
              tag: "2 EN · chacun préfère l'équilibre où IL est agressif",
              title: "🐔 Poule mouillée",
              body: (
                <>
                  Deux conducteurs foncent l'un vers l'autre : Faucon (tout droit) ou Colombe
                  (tourner). Deux EN : (F, C) et (C, F). Si personne ne cède : catastrophe
                  (−2, −2), un résultat que (C, C) Pareto-domine. L'équilibre préféré de chacun
                  passe par <em>son</em> action dangereuse.
                </>
              ),
              extra: (
                <>
                  <strong>Dans la vraie vie :</strong> deux firmes qui envisagent d'investir un
                  marché trop petit pour deux.
                </>
              ),
            },
            {
              tag: "0 EN en stratégies pures",
              title: "🪙 Matching pennies (jeu de conflit)",
              body: (
                <>
                  J2 veut montrer le <em>même</em> côté de la pièce que J1, J1 veut le côté{" "}
                  <em>opposé</em>. Intérêts totalement divergents : quand l'un gagne, l'autre
                  perd. <strong>Aucune</strong> paire de meilleures réponses mutuelles → pas d'EN
                  pur. Chacun veut être <em>imprévisible</em> (→ partie 8 !).
                </>
              ),
              extra: (
                <>
                  <strong>Dans la vraie vie :</strong> sport, guerre, police vs criminels.
                </>
              ),
            },
          ]}
        />

        <H4>⭐ Application : résoudre les paniques bancaires</H4>
        <p>
          On peut maintenant répondre à la question du début du chapitre. Modélisons une panique
          bancaire : deux investisseurs ont chacun placé un montant <M tex="m" /> à la banque, qui
          paie un intérêt <M tex="r" />. Chacun peut <strong>Laisser</strong> son argent ou le{" "}
          <strong>Retirer</strong>. Si quelqu'un retire, la banque fait faillite, et celui qui a
          laissé son argent reçoit de l'État le minimum entre <M tex="m" /> et la garantie
          publique <M tex="g" /> :
        </p>

        <SymbolicMatrix
          rowPlayer="Investisseur 1"
          colPlayer="Investisseur 2"
          rows={["Laisser", "Retirer"]}
          cols={["Laisser", "Retirer"]}
          cells={[
            [
              [<M key="a" tex="m(1+r)" />, <M key="b" tex="m(1+r)" />],
              [<M key="a" tex="\min(g, m)" />, <M key="b" tex="m" />],
            ],
            [
              [<M key="a" tex="m" />, <M key="b" tex="\min(g, m)" />],
              [<M key="a" tex="m" />, <M key="b" tex="m" />],
            ],
          ]}
        />

        <ul>
          <li>
            <strong>Sans garantie</strong> (<M tex="g = 0" />) : <M tex="\min(g, m) = 0" />.
            Vérifie : (L, L) est un EN (dévier fait passer de <M tex="m(1+r)" /> à <M tex="m" />){" "}
            <em>mais (R, R) aussi</em> (si l'autre retire, laisser rapporte 0, moins que{" "}
            <M tex="m" />
            ). C'est une <strong>chasse au cerf</strong> ! L'existence de l'EN (R, R) rend la
            panique <strong>possible et rationnelle</strong> : si je crois que tu vas retirer, ma
            meilleure réponse est de retirer.
          </li>
          <li>
            <strong>Avec garantie</strong> <M tex="g \ge m" /> : <M tex="\min(g, m) = m" />.
            Laisser rapporte <M tex="m(1+r)" /> ou <M tex="m" />, Retirer rapporte toujours{" "}
            <M tex="m" /> → <strong>Laisser devient (faiblement) dominante</strong>, (L, L)
            devient un ESD, et céder à la panique devient <em>irrationnel</em>.
          </li>
        </ul>
        <p>
          Voilà pourquoi Fortis n'a pas déclenché de ruée en 2008 : l'État belge garantit les
          dépôts (à hauteur de 100 000 €). La garantie ne coûte (presque) rien à l'État…
          précisément parce qu'elle <strong>élimine l'équilibre de panique</strong> et n'a donc
          jamais besoin d'être payée. Un des plus beaux exemples de politique publique conçue par
          la théorie des jeux.
        </p>

        <Quiz
          scope="b1"
          id="q4"
          question={<>Un équilibre de Nash, c'est un profil de stratégies tel que…</>}
          options={[
            {
              text: <>…les payoffs de tous les joueurs sont maximisés.</>,
              explain: (
                <>
                  Non — ça, c'est l'efficacité au sens de Pareto. Un EN peut très bien être
                  mauvais pour tout le monde (dilemme du prisonnier !).
                </>
              ),
            },
            {
              text: (
                <>
                  …aucun joueur n'a intérêt à dévier seul, étant donné les stratégies des autres.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement. Chaque stratégie est une meilleure réponse aux autres : étant donné
                  ce que font les autres, personne ne peut gagner plus en changeant SEUL sa
                  stratégie. C'est ce qui rend l'équilibre « stable ».
                </>
              ),
            },
            {
              text: <>…chaque joueur joue une stratégie dominante.</>,
              explain: (
                <>
                  Non — c'est la définition d'un ESD, qui est beaucoup plus exigeant. Tout ESD est
                  un EN, mais l'inverse est faux (→ partie 6).
                </>
              ),
            },
          ]}
        />

        <ExerciseBlock
          scope="b1"
          id="ex3"
          number={3}
          title="Le ménage des colocataires"
          difficulty={2}
          statement={
            <>
              <p>
                Léa et Max doivent décider, chacun de leur côté, s'ils nettoient l'appartement ce
                week-end. Nettoyer coûte 2 unités d'utilité (effort). Un appartement propre — il
                suffit qu'<em>au moins un</em> des deux nettoie — rapporte 3 unités à{" "}
                <em>chacun</em>. Si personne ne nettoie, personne ne gagne rien.
              </p>
              <p>
                <strong>a)</strong> Écris la forme normale (Léa en lignes). <strong>b)</strong>{" "}
                Quelqu'un a-t-il une stratégie dominante ? <strong>c)</strong> Trouve tous les EN
                avec la méthode du soulignage. <strong>d)</strong> À quel jeu célèbre cette
                situation ressemble-t-elle ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) Construire la matrice case par case",
              content: (
                <>
                  <p>
                    Scénarios : les deux nettoient → <M tex="3 - 2 = 1" /> chacun. Un seul nettoie
                    → lui : <M tex="3 - 2 = 1" />, l'autre : 3 (propre sans effort !). Personne →
                    (0, 0).
                  </p>
                  <PayoffMatrix
                    rowPlayer="Léa"
                    colPlayer="Max"
                    rows={["Nettoyer", "Paresser"]}
                    cols={["Nettoyer", "Paresser"]}
                    payoffs={[
                      [
                        [1, 1],
                        [1, 3],
                      ],
                      [
                        [3, 1],
                        [0, 0],
                      ],
                    ]}
                  />
                </>
              ),
            },
            {
              title: "b) Pas de stratégie dominante",
              content: (
                <p>
                  Pour Léa : si Max nettoie, Paresser (<M tex="3 > 1" />) ; si Max paresse,
                  Nettoyer (<M tex="1 > 0" />
                  ). Le meilleur choix dépend de Max → <strong>pas de dominante</strong> (idem
                  pour Max, par symétrie).
                </p>
              ),
            },
            {
              title: "c) La méthode du soulignage",
              content: (
                <>
                  <p>
                    Meilleures réponses de Léa (rouge, par colonne) : colonne N → 3 (Paresser) ;
                    colonne P → 1 (Nettoyer). Meilleures réponses de Max (bleu, par ligne) : ligne
                    N → 3 (Paresser) ; ligne P → 1 (Nettoyer). Doublement entourées :{" "}
                    <strong>(Nettoyer, Paresser) et (Paresser, Nettoyer)</strong> — deux EN, dans
                    chacun un seul nettoie. Vérifie avec les boutons :
                  </p>
                  <PayoffMatrix
                    rowPlayer="Léa"
                    colPlayer="Max"
                    rows={["Nettoyer", "Paresser"]}
                    cols={["Nettoyer", "Paresser"]}
                    payoffs={[
                      [
                        [1, 1],
                        [1, 3],
                      ],
                      [
                        [3, 1],
                        [0, 0],
                      ],
                    ]}
                    interactive
                  />
                </>
              ),
            },
            {
              title: "d) Quel jeu célèbre ?",
              content: (
                <p>
                  Deux équilibres, chacun préfère celui où <em>l'autre</em> fait l'action
                  coûteuse, et le pire résultat (0, 0) survient si les deux « jouent dur » : c'est
                  la structure de la <strong>poule mouillée</strong> (version « dilemme du
                  volontaire »).
                </p>
              ),
            },
          ]}
          result={
            <p>
              Deux EN : (Nettoyer, Paresser) et (Paresser, Nettoyer). Structure de poule mouillée
              : chacun espère que l'autre fera l'effort, et l'échec de coordination (personne ne
              nettoie) est le pire résultat collectif.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* S6 — Trois solutions, un diagramme                            */}
      {/* ============================================================ */}
      <Section id="s6" kicker="Partie 6" title="Trois solutions, un diagramme">
        <p>
          Récapitulons. Pour analyser une situation stratégique, la théorie des jeux propose des{" "}
          <strong>concepts de solution</strong> (« solution concepts ») : dans chaque jeu, une
          solution <em>sélectionne un sous-ensemble des profils de stratégies</em> — ceux qu'on
          s'attend à observer si les hypothèses tiennent.
        </p>

        <Tbl
          head={["Solution", "Basée sur", "Force", "Faiblesse"]}
          rows={[
            [
              <strong key="s">ESD</strong>,
              "H1",
              "prédiction très robuste",
              "beaucoup de jeux n'en ont pas",
            ],
            [
              <strong key="s">PSS</strong>,
              "H1 + H2",
              "existe toujours",
              "souvent très nombreux (imprécis)",
            ],
            [
              <strong key="s">EN</strong>,
              "H1 + H3",
              "précis ; existe toujours en mixte",
              "souvent multiple ; parfois aucun en pur",
            ],
          ]}
        />

        <p>
          Ces trois solutions sont <strong>emboîtées</strong> : un ESD est toujours un EN, et un
          EN est toujours un PSS<sup>†</sup>. Visuellement :
        </p>

        <VennSolutions />

        <p>
          Intuition de l'emboîtement : plus une solution repose sur des hypothèses fortes, plus
          elle est <strong>sélective</strong>. L'ESD ne demande que H1 mais élimine énormément
          (souvent tout) ; l'EN demande H3 (anticipations correctes) et sélectionne un ensemble
          plus petit que les PSS. Exemple concret : la bataille des sexes a <strong>4 PSS</strong>{" "}
          (aucune stratégie n'y est dominée) mais seulement <strong>2 EN</strong> — l'EN est bien
          plus précis.
        </p>

        <Quiz
          scope="b1"
          id="q5"
          question={
            <>
              Un jeu possède un équilibre de Nash unique (V, W). Laquelle de ces affirmations est
              forcément vraie ?
            </>
          }
          options={[
            {
              text: <>(V, W) est un ESD.</>,
              explain: (
                <>
                  Faux — l'inclusion va dans l'autre sens ! Un EN n'est pas forcément un ESD
                  (bataille des sexes : 2 EN, 0 ESD).
                </>
              ),
            },
            {
              text: <>(V, W) est un PSS.</>,
              correct: true,
              explain: (
                <>
                  Correct : EN ⊆ PSS. Tout équilibre de Nash survit à l'élimination itérative (des
                  stratégies strictement dominées).
                </>
              ),
            },
            {
              text: <>(V, W) est efficace au sens de Pareto.</>,
              explain: (
                <>
                  Faux — le dilemme du prisonnier prouve le contraire : son EN unique (C, C) est
                  Pareto-dominé par (N, N).
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* S7 — Théorie vs joueurs réels                                 */}
      {/* ============================================================ */}
      <Section id="s7" kicker="Partie 7" title="Théorie vs joueurs réels : les données du labo">
        <p>
          La pertinence des prédictions dépend du <strong>réalisme des hypothèses</strong>. Bonne
          nouvelle : les étudiants du cours ont joué à ces jeux en laboratoire. Confrontons chaque
          hypothèse aux données :
        </p>

        <H4>H1 en labo : les humains sont-ils rationnels ?</H4>
        <ul>
          <li>
            Quand une <strong>stratégie dominante</strong> existe : <strong>87 %</strong> l'ont
            jouée (jeu 2×2), <strong>96 %</strong> dans le dilemme du prisonnier. Pas 100 % —
            souviens-toi des joueurs « kantiens ».
          </li>
          <li>
            Jouer une <strong>stratégie dominée</strong> : <strong>12 %</strong> l'ont fait dans
            un jeu 2×2… mais <strong>0 %</strong> dans un jeu 3×3 joué ensuite. Surprenant (le 3×3
            est plus dur à analyser !) — l'explication probable : les étudiants ont{" "}
            <em>appris</em> en voyant les résultats du jeu précédent.
          </li>
        </ul>

        <H4>H2 en labo : croit-on à la rationalité des autres ?</H4>
        <p>
          Dans un jeu où la stratégie Bas de P1 ne survit pas à l'élimination itérative,{" "}
          <strong>29 %</strong> des étudiants-P1 l'ont pourtant jouée. Pas si étonnant : puisque
          12 % des P2 jouaient une stratégie dominée, douter de la rationalité des autres était…
          raisonnable ! Mais notons : le payoff moyen de Bas (1.48) est resté inférieur à celui de
          Haut (2.64). Faire confiance à la théorie payait.
        </p>

        <H4>H3 en labo : se coordonne-t-on spontanément sur un EN ?</H4>
        <p>
          Dans la bataille des sexes, au premier round : 21 % de Viande, 31 % de Rouge —{" "}
          <strong>aucune coordination</strong> sur un des deux EN. La coordination « spontanée »
          sur un EN est peu probable quand il y a plusieurs équilibres. Mais trois facteurs la
          favorisent :
        </p>
        <ul>
          <li>
            <strong>La communication</strong> avant de jouer (même si elle reste difficile quand
            les préférences divergent).
          </li>
          <li>
            <strong>La répétition</strong> : en rejouant, un équilibre peut devenir une{" "}
            <strong>convention</strong>, un <em>point focal</em> (comme le sens de la marche sur
            les trottoirs de New York). Regarde les données du cours : round après round, les
            joueurs convergent vers l'équilibre (Poisson, Blanc) :
          </li>
        </ul>

        <ConvergenceBars />

        <ul>
          <li>
            <strong>L'expérience et les enjeux</strong> : un joueur expérimenté a appris à jouer
            rationnellement, et de gros enjeux rendent coûteuses les stratégies qui ne sont pas
            des meilleures réponses. C'est pourquoi on s'attend à ce que les firmes et les traders
            sur les marchés se comportent <em>très</em> près de la théorie.
          </li>
        </ul>

        <H4>⭐ Le jeu « Devine 2/3 de la moyenne »</H4>
        <p>
          Le jeu qui illustre le mieux l'écart entre théorie et humains. Règles : <M tex="N" />{" "}
          joueurs choisissent chacun un nombre <M tex="x_i \in [0, 100]" />. On calcule la moyenne{" "}
          <M tex="\bar{x}" />.{" "}
          <strong>
            Gagne celui dont le nombre est le plus proche de <M tex="\tfrac{2}{3}\,\bar{x}" />
          </strong>
          .
        </p>
        <p>Que prédit la théorie ? Appliquons l'élimination itérative :</p>
        <ol>
          <li>
            La moyenne <M tex="\bar{x}" /> vaut au maximum 100, donc la cible{" "}
            <M tex="\tfrac{2}{3}\bar{x}" /> vaut au maximum 66.6 → toute stratégie{" "}
            <M tex="x_i > 66.6" /> est <strong>dominée</strong> (par 66.6, qui est toujours au
            moins aussi proche de la cible).
          </li>
          <li>
            Si personne ne joue au-dessus de 66.6, la cible vaut au max{" "}
            <M tex="\tfrac{2}{3} \cdot 66.6 = 44.4" /> → tout <M tex="x_i > 44.4" /> est dominé{" "}
            <em>dans le jeu réduit</em>…
          </li>
          <li>
            …et ainsi de suite : après <M tex="n" /> itérations, la borne vaut{" "}
            <M tex="(\tfrac{2}{3})^n \cdot 100" />. Quand <M tex="n \to \infty" /> :{" "}
            <strong>le seul PSS est « tout le monde joue 0 »</strong>.
          </li>
        </ol>

        <GuessTwoThirds />

        <p>
          En labo (4 groupes d'étudiants du cours), la cible <M tex="\tfrac{2}{3}\bar{x}" /> du
          round 1 était entre <strong>18.2 et 27.7</strong> — très loin de 0 ! Les humains
          raisonnent typiquement à 1–2 niveaux de profondeur. Mais en <strong>répétant</strong> le
          jeu, la cible dégringole : 25.4 → 12.7 → 6.4… → 0.6 au round 4. On converge bien vers la
          prédiction, par apprentissage.
        </p>

        <Callout variant="attention" title="⚠️ La leçon stratégique du jeu">
          <p>
            Jouer 0 (la prédiction théorique) au premier round <strong>fait perdre</strong> face à
            des humains ! Être « hyper-rationnel » face à des adversaires qui ne le sont pas n'est
            pas optimal. La vraie rationalité, c'est de raisonner{" "}
            <em>un cran plus loin que les autres</em>, pas à l'infini.
          </p>
        </Callout>

        <H4>Keynes, le concours de beauté et les bulles financières</H4>
        <p>
          La théorie « rationnelle » des marchés dit que le prix d'une action doit être égal à son
          prix « correct », la somme actualisée des dividendes futurs :
        </p>
        <FormulaBox
          tex="p^* = \Pi_0 + \delta \Pi_1 + \delta^2 \Pi_2 + \delta^3 \Pi_3 + \cdots"
          label="Prix « correct » d'une action"
          caption={
            <>
              La valeur présente de tous les profits futurs, actualisés au facteur <M tex="\delta" />.
            </>
          }
        />

        <Callout variant="intuition" title="🔗 Rappel du chapitre A2">
          <p>
            Tu reconnais le <strong>facteur d'actualisation</strong> <M tex="\delta" /> du
            chapitre A2 ! Un dividende reçu dans <M tex="t" /> périodes vaut <M tex="\delta^t" />{" "}
            fois moins qu'aujourd'hui — exactement la logique de la décision inter-temporelle. Le
            prix « correct » d'une action est la valeur présente de tous ses profits futurs.
          </p>
          <p className="mt-2">
            <TheoryRef chapter="a2" />
          </p>
        </Callout>

        <p>
          Keynes n'y croyait pas. Pour lui, les marchés fonctionnent comme un{" "}
          <strong>concours de beauté</strong> où les participants votent pour la plus belle
          candidate : pour gagner, il ne faut pas voter pour celle <em>que tu trouves</em> la plus
          belle, mais pour celle que tu penses <em>que les autres</em> vont trouver la plus
          belle… voire celle que les autres pensent que les autres trouveront la plus belle. Tu
          reconnais la logique itérative du « devine 2/3 » !
        </p>
        <p>
          Application aux <strong>bulles</strong> : imagine un investisseur convaincu que{" "}
          <M tex="p > p^*" /> (l'action est surévaluée). S'il anticipe que les autres achèteront
          demain à un prix encore plus haut, <strong>sa meilleure réponse est d'acheter quand
          même</strong>. Si d'autres raisonnent pareil, le prix monte encore — sa croyance est
          validée. Une bulle peut se former <em>précisément parce qu'il peut être rationnel
          d'acheter un actif que l'on sait surévalué</em>.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* S8 — Stratégies mixtes                                        */}
      {/* ============================================================ */}
      <Section
        id="s8"
        kicker="Partie 8"
        title="Stratégies mixtes : jouer au hasard, rationnellement"
      >
        <p>
          Souviens-toi du problème de <strong>matching pennies</strong> : aucun EN en stratégies
          pures. Ce n'est pas un accident — c'est la signature des <strong>jeux de conflit</strong>{" "}
          (sport, guerre, police vs criminels) : quand l'un gagne, l'autre perd, donc le perdant a{" "}
          <em>toujours</em> un incitant à changer de stratégie. Impossible que les deux soient
          contents en même temps.
        </p>
        <p>
          Dans ces jeux, chaque joueur veut être <strong>imprévisible</strong> : si mon adversaire
          peut anticiper mon comportement, il l'exploitera. Idéalement, mon comportement doit lui
          apparaître comme un choix <em>au hasard</em>. C'est exactement ce que modélise une
          stratégie mixte.
        </p>

        <Callout variant="definition" title="Définition — stratégie mixte">
          <p>
            Une <strong>stratégie mixte</strong> spécifie une{" "}
            <strong>distribution de probabilité</strong> sur les stratégies pures. Exemples dans
            matching pennies : « Pile avec proba 1/2, Face avec proba 1/2 » ou « Pile avec proba
            3/4, Face avec proba 1/4 ». Le joueur <strong>choisit les probabilités</strong>, pas
            la stratégie pure qui sera finalement tirée.
          </p>
        </Callout>

        <H4>Comment évaluer une stratégie mixte ? Le payoff attendu</H4>
        <p>
          Quand les stratégies deviennent aléatoires, les payoffs le deviennent aussi. Un joueur
          rationnel maximise alors son <strong>payoff attendu</strong> (son{" "}
          <strong>utilité espérée</strong>) : la moyenne des payoffs,{" "}
          <em>pondérée par les probabilités</em> de chaque case. Exemple concret dans matching
          pennies, avec <M tex="s_2" /> = « Pile avec proba 3/4 » : si J1 joue Pile (pur), il
          tombe sur (P, P) → 0 avec proba 3/4, et sur (P, F) → 3 avec proba 1/4 :
        </p>
        <MB tex="U_1(P, s_2) = \tfrac{3}{4} \cdot 0 + \tfrac{1}{4} \cdot 3 = \tfrac{3}{4}" />
        <p>
          Si les <em>deux</em> joueurs mixent, on pondère les 4 cases par le <em>produit</em> des
          probabilités (les tirages sont indépendants). Rien de plus : une somme pondérée.
        </p>

        <Callout variant="definition" title="Définition — EN en stratégies mixtes">
          <p>
            Le profil <M tex="(s_1, \dots, s_n)" /> de stratégies mixtes est un{" "}
            <strong>EN mixte</strong> si chaque <M tex="s_i" /> maximise le{" "}
            <strong>payoff attendu</strong> de <M tex="i" /> face à <M tex="s_{-i}" /> — des
            meilleures réponses mutuelles, comme avant, mais en probabilités.
          </p>
        </Callout>

        <H4>⭐ Le jeu du pénalty, pas à pas</H4>
        <p>
          Fin de match : un attaquant tire un pénalty à Droite ou à Gauche ; simultanément, le
          gardien plonge à Droite ou à Gauche. Les payoffs = pourcentages de réussite :
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
              <M tex="p" /> = proba que l'attaquant tire à Droite · <M tex="q" /> = proba que le
              gardien plonge à Droite
            </>
          }
        />

        <p>
          Chaque joueur choisit désormais un <em>nombre</em> dans [0, 1] : <M tex="p" /> pour
          l'attaquant, <M tex="q" /> pour le gardien (<M tex="p = 1" /> est la stratégie pure
          Droit, <M tex="p = 0" /> la pure Gauche). Les payoffs attendus (somme des 4 cases
          pondérées) :
        </p>
        <MB tex="U_A(p, q) = 20 + 60p + 70q - 100pq \qquad U_G(p, q) = 80 - 60p - 70q + 100pq" />

        <p>
          Pour trouver l'EN mixte, on cherche la <strong>fonction de meilleure réponse</strong> de
          chacun : comment <M tex="U_A" /> varie-t-il avec <M tex="p" /> ? La dérivée{" "}
          <M tex="\partial U_A / \partial p = 60 - 100q" /> donne trois cas :
        </p>
        <ul>
          <li>
            <M tex="q < 0.6" /> → dérivée positive → meilleure réponse : <M tex="p = 1" /> (tirer
            à Droite). <em>Intuition : le gardien plonge rarement à droite, tire à droite !</em>
          </li>
          <li>
            <M tex="q > 0.6" /> → dérivée négative → meilleure réponse : <M tex="p = 0" />{" "}
            (Gauche).
          </li>
          <li>
            <M tex="q = 0.6" /> → <M tex="U_A" /> ne dépend plus de <M tex="p" /> →{" "}
            <strong>
              n'importe quel <M tex="p" />
            </strong>{" "}
            est une meilleure réponse.
          </li>
        </ul>
        <p>
          Même analyse pour le gardien avec <M tex="\partial U_G / \partial q = 100p - 70" /> :
          seuil à <M tex="p = 0.7" />. Le{" "}
          <strong>seul point où les deux courbes de meilleure réponse se croisent</strong> est{" "}
          <M tex="(p^*, q^*) = (0.7,\; 0.6)" /> : l'unique EN mixte. Vérifie-le toi-même :
        </p>

        <PenaltyExplorer />

        <Callout variant="retiens" title="⭐ Théorème 1 — existence">
          <p>
            Si les joueurs peuvent utiliser des stratégies mixtes, alors{" "}
            <strong>tout jeu a (au moins) un équilibre de Nash</strong>. L'EN offre{" "}
            <em>toujours</em> une prédiction — même dans matching pennies. C'est le grand avantage
            théorique de l'EN mixte.
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ Théorème 2 — indifférence à l'équilibre (l'outil de calcul !)">
          <p>
            Dans un EN mixte, chaque joueur est{" "}
            <strong>indifférent entre les stratégies pures qu'il utilise</strong>. Pour le
            pénalty :
          </p>
          <MB tex="U_A(\text{Droit}, q^*) = U_A(\text{Gauche}, q^*) \quad\text{et}\quad U_G(p^*, \text{Droit}) = U_G(p^*, \text{Gauche})" />
          <p>
            Pourquoi ? S'il préférait strictement l'une de ses stratégies pures, il ne
            « gaspillerait » pas de probabilité sur l'autre — il jouerait la meilleure à 100 %.
            Mixer ne peut être optimal que si les deux rapportent pareil.
          </p>
          <p>
            <strong>Recette de calcul</strong> (à connaître par cœur) : la 1ʳᵉ équation
            (indifférence de A) ne contient que <M tex="q" /> → elle donne <M tex="q^*" />. La 2ᵉ
            (indifférence de G) ne contient que <M tex="p" /> → elle donne <M tex="p^*" />.{" "}
            <em>L'équilibre de chacun est déterminé par les payoffs de l'autre !</em>
          </p>
        </Callout>

        <p>Vérifions sur le pénalty (fais le calcul avec moi) : indifférence de l'attaquant :</p>
        <MB tex="q \cdot 50 + (1-q) \cdot 80 = q \cdot 90 + (1-q) \cdot 20 \;\Longrightarrow\; 80 - 30q = 20 + 70q \;\Longrightarrow\; q^* = 0.6 \;\checkmark" />
        <p>
          Et l'indifférence du gardien :{" "}
          <M tex="p \cdot 50 + (1-p) \cdot 10 = p \cdot 20 + (1-p) \cdot 80" />, soit{" "}
          <M tex="10 + 40p = 80 - 60p" />, donc <M tex="p^* = 0.7" /> ✔.
        </p>

        <H4>Comment interpréter un EN mixte ? (sur le terrain)</H4>
        <p>
          On voit rarement un attaquant tirer à pile ou face avant de shooter ! L'interprétation
          réaliste : en pratique, un joueur <strong>hésite</strong>, et des petits détails de son
          processus de décision le font pencher d'un côté ou de l'autre — à l'équilibre, avec les
          bonnes fréquences. Un joueur rationnel se base sur une <strong>croyance</strong> à
          propos des probabilités de son adversaire et y répond au mieux ; à l'équilibre, ces
          croyances sont <strong>correctes</strong> (confirmées par les fréquences observées).
        </p>
        <p>
          Les meilleures preuves empiriques viennent du <strong>sport professionnel</strong>{" "}
          (joueurs très expérimentés, gros enjeux — les deux facteurs de la partie 7 !). Walker et
          Wooders (2002) ont analysé dix finales de Grand Chelem au tennis : conformément au
          théorème d'indifférence, la probabilité qu'un serveur gagne le point était{" "}
          <strong>la même</strong> qu'il serve à gauche ou à droite. Et en labo avec les étudiants
          du cours : sur 56 joueurs de matching pennies, 26 ont joué Pile — statistiquement
          compatible avec la prédiction 50/50 (avec un tirage à proba 1/2, observer 26 Pile ou
          moins avait une probabilité de plus de 35 % : on ne peut pas rejeter l'hypothèse).
        </p>

        <H4>⭐ Police vs mafia : le résultat le plus contre-intuitif du chapitre</H4>
        <p>
          La police déploie chaque jour ses forces en <strong>Ville</strong> ou en{" "}
          <strong>Banlieue</strong> ; la mafia choisit simultanément où opérer. Un jour, la police
          développe une technologie qui rend ses interventions <em>en banlieue</em> plus
          efficaces : le paramètre <M tex="x" /> augmente.
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
        />

        <p>
          Question : la police ira-t-elle <em>plus souvent</em> en banlieue maintenant que ses
          actions y sont plus efficaces ? Le théorème d'indifférence répond. À l'équilibre, c'est{" "}
          <strong>la mafia</strong> qui doit être indifférente, et son indifférence détermine{" "}
          <M tex="p^*" /> (la stratégie de la police) :
        </p>
        <MB tex="p \cdot 20 + (1-p) \cdot 100 = p \cdot 100 + (1-p)(100 - x) \;\Longrightarrow\; p^* = \frac{x}{80 + x}" />

        <PoliceMafia />

        <p>
          La dérivée <M tex="\partial p^* / \partial x = 80/(80+x)^2 > 0" /> : quand <M tex="x" />{" "}
          augmente, la police va <strong>plus souvent en ville</strong>, donc{" "}
          <strong>moins souvent en banlieue</strong> — là où elle est devenue plus efficace !
          L'intuition : la banlieue devenue dangereuse pour la mafia, celle-ci la fuit ; la police
          n'a alors plus besoin d'y être aussi souvent pour la dissuader. À l'équilibre mixte,{" "}
          <strong>ta stratégie sert à maintenir l'autre indifférent</strong>, pas à exploiter tes
          propres forces. Voilà le genre de conclusion que seule la théorie des jeux permet de
          voir.
        </p>

        <Quiz
          scope="b1"
          id="q6"
          question={
            <>
              À l'EN mixte du pénalty, pourquoi l'attaquant joue-t-il exactement{" "}
              <M tex="p^* = 0.7" /> ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Parce que 0.7 maximise son propre payoff attendu quelle que soit la stratégie du
                  gardien.
                </>
              ),
              explain: (
                <>
                  Non — regarde bien le calcul : p* = 0.7 sort de l'équation d'indifférence du
                  GARDIEN. Les payoffs de l'attaquant déterminent q*, pas p*.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que p* = 0.7 rend le gardien indifférent entre plonger à droite et à
                  gauche.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement ! p* = 0.7 est la valeur qui rend le GARDIEN indifférent entre Droite
                  et Gauche — donc prêt à mixer lui aussi. À q* = 0.6, l'attaquant est de toute
                  façon indifférent, donc jouer 0.7 ne lui coûte rien. C'est la logique croisée de
                  l'équilibre mixte.
                </>
              ),
            },
            {
              text: <>Parce qu'il réussit 70 % de ses tirs à droite.</>,
              explain: (
                <>
                  Non : 0.7 ≠ fréquence de succès. Et à l'équilibre, son taux de réussite est le
                  même à droite et à gauche (théorème d'indifférence, vérifié au tennis par Walker
                  et Wooders).
                </>
              ),
            },
          ]}
        />

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
                (probabilités de gagner le point, receveur = 100 − serveur) :
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
                l'équilibre ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) Aucun EN pur (méthode du soulignage)",
              content: (
                <p>
                  MR du serveur : face à gauche → Droite (90) ; face à droite → Gauche (80). MR du
                  receveur : face à Gauche → gauche (60) ; face à Droite → droite (70). Aucune
                  case doublement entourée → <strong>pas d'EN pur</strong> (jeu de conflit : le
                  total fait 100 dans chaque case).
                </p>
              ),
            },
            {
              title: "b) L'EN mixte par le théorème d'indifférence",
              content: (
                <>
                  <p>
                    Indifférence du <em>serveur</em> (donne <M tex="q^*" />) :
                  </p>
                  <MB tex="40q + 80(1-q) = 90q + 30(1-q) \;\Longrightarrow\; 80 - 40q = 30 + 60q \;\Longrightarrow\; q^* = 0.5" />
                  <p>
                    Indifférence du <em>receveur</em> (donne <M tex="p^*" />) :
                  </p>
                  <MB tex="60p + 10(1-p) = 20p + 70(1-p) \;\Longrightarrow\; 10 + 50p = 70 - 50p \;\Longrightarrow\; p^* = 0.6" />
                  <p>
                    EN mixte : <strong>(0.6, 0.5)</strong>.
                  </p>
                </>
              ),
            },
            {
              title: "c) Le taux de réussite à l'équilibre",
              content: (
                <p>
                  À l'équilibre, le serveur est indifférent : son payoff ={" "}
                  <M tex="U_S(\text{Gauche}, 0.5) = 40 \cdot 0.5 + 80 \cdot 0.5 = 60" /> (vérifie
                  : Droite donne <M tex="90 \cdot 0.5 + 30 \cdot 0.5 = 60" /> aussi ✔). Il gagne{" "}
                  <strong>60 % des points, qu'il serve à gauche ou à droite</strong> — exactement
                  ce que Walker et Wooders ont mesuré chez les pros.
                </p>
              ),
            },
          ]}
          result={
            <p>
              EN mixte (p*, q*) = (0.6, 0.5), taux de réussite du serveur : 60 % des deux côtés.
              Rappelle-toi la recette : l'indifférence de chaque joueur détermine la stratégie de{" "}
              <em>l'autre</em>.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* S9 — Exercices récapitulatifs                                 */}
      {/* ============================================================ */}
      <Section id="s9" kicker="Partie 9" title="Exercices récapitulatifs">
        <p>
          Trois exercices « format examen » qui mélangent tout le chapitre. Fais-les{" "}
          <strong>sur papier d'abord</strong>, puis compare avec la solution.
        </p>

        <ExerciseBlock
          scope="b1"
          id="ex5"
          number={5}
          title="La méthode du soulignage en 3×3"
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
                    est R ✔ → <strong>EN unique : (B, R)</strong>, payoffs (4 ; 4). Vérifie avec
                    les boutons :
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
                <M tex="r = 5\%" />. L'État garantit les dépôts à hauteur de <M tex="g" />.
                (Reprends la matrice de la partie 5.)
              </p>
              <p>
                <strong>a)</strong> Écris la matrice pour <M tex="g = 0" /> et identifie tous les
                EN. <strong>b)</strong> Quelle valeur minimale de <M tex="g" /> rend « Laisser »
                (faiblement) dominante ? <strong>c)</strong> Explique en une phrase pourquoi cette
                garantie ne coûte (presque) rien à l'État.
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
                    (100 ; 0) ; (R, R) → (100 ; 100). Soulignage : face à L, mieux vaut L (
                    <M tex="105 > 100" />) ; face à R, mieux vaut R (<M tex="100 > 0" />
                    ). <strong>Deux EN : (L, L) et (R, R)</strong> — structure de chasse au cerf :
                    la panique (R, R) est un équilibre parfaitement rationnel.
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
                  . Dès que la garantie couvre le dépôt, (L, L) devient un ESD et paniquer devient
                  irrationnel.
                </p>
              ),
            },
            {
              title: "c) Pourquoi la garantie est (presque) gratuite",
              content: (
                <p>
                  Parce que la garantie <em>élimine l'équilibre de panique</em> : plus personne ne
                  retire, donc la banque ne fait pas faillite, donc la garantie n'est jamais
                  versée. La simple <strong>promesse crédible</strong> suffit — c'est ce qui a
                  protégé Fortis en 2008.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Sans garantie : deux EN dont la panique (chasse au cerf). Avec <M tex="g \ge m" /> :
              Laisser devient dominante, l'équilibre de panique disparaît, et la garantie n'est
              jamais payée. La théorie des jeux au service de la politique publique.
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
                <strong>b)</strong> « Dans un EN mixte, un joueur peut strictement préférer une de
                ses stratégies pures à l'autre. »
                <br />
                <strong>c)</strong> « Si une stratégie survit à l'élimination itérative, elle fait
                partie d'un équilibre de Nash. »
                <br />
                <strong>d)</strong> « Le fait que 29 % des étudiants aient joué une stratégie
                non-PSS prouve qu'ils sont irrationnels. »
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
                  <em>faible</em>, et (R, R) reste un EN (face à R, retirer donne{" "}
                  <M tex="100 = \min(g, m)" />… les deux sont meilleures réponses). Avec des
                  dominances <em>strictes</em>, en revanche, l'ESD serait l'unique EN.
                </p>
              ),
            },
            {
              title: "b) Faux",
              content: (
                <p>
                  C'est le théorème d'indifférence : s'il préférait strictement une stratégie
                  pure, mettre de la probabilité sur l'autre réduirait son payoff attendu — il ne
                  mixerait pas. Mixer n'est optimal qu'en cas d'indifférence.
                </p>
              ),
            },
            {
              title: "c) Faux",
              content: (
                <p>
                  L'inclusion va dans l'autre sens : EN ⊆ PSS. Dans notre jeu 3×3 de la partie 4,
                  quatre profils sont des PSS, mais seuls (H, g) et (B, m) sont des EN — (H, m) et
                  (B, g) survivent sans être des équilibres.
                </p>
              ),
            },
            {
              title: "d) Faux",
              content: (
                <p>
                  Être rationnel (H1) ne suffit pas pour jouer un PSS : il faut aussi{" "}
                  <em>croire que les autres sont rationnels</em> (H2). Or 12 % des adversaires
                  jouaient une stratégie dominée : douter d'eux était une croyance raisonnable.
                  Jouer Bas était une meilleure réponse à cette croyance — même si, en moyenne, ça
                  a moins rapporté (1.48 contre 2.64).
                </p>
              ),
            },
          ]}
          result={
            <p>
              Les quatre affirmations sont fausses — et chacune cache une distinction de concepts
              (ESD vs EN, indifférence, EN ⊆ PSS, rationalité vs croyances) que l'examen adore
              tester.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* S10 — Checklist de maîtrise                                   */}
      {/* ============================================================ */}
      <Section id="s10" kicker="Partie 10" title="Checklist de maîtrise">
        <p>
          Coche honnêtement. Chaque case correspond à une compétence testable à l'examen — si tu
          hésites, la partie du chapitre à revoir est indiquée.
        </p>

        <MasteryChecklist
          items={[
            <>
              Je sais définir une <strong>interaction stratégique</strong> et donner les 3
              ingrédients d'un jeu (joueurs, stratégies, payoffs). <em>(Partie 1)</em>
            </>,
            <>
              Je sais lire une matrice (qui choisit ligne/colonne, à qui est chaque nombre) et{" "}
              <strong>construire la forme normale</strong> à partir d'une histoire.{" "}
              <em>(Partie 2)</em>
            </>,
            <>
              Je connais la différence entre <strong>résultat</strong> et{" "}
              <strong>profil de payoffs</strong>, et je sais que payoff = utilité, pas argent.{" "}
              <em>(Parties 1–2)</em>
            </>,
            <>
              Je sais vérifier qu'une stratégie est <strong>dominante</strong> ou{" "}
              <strong>dominée</strong> par un système d'inégalités, et je sais qu'on peut avoir
              une dominée sans dominante. <em>(Partie 3)</em>
            </>,
            <>
              Je sais reconnaître un <strong>dilemme du prisonnier</strong> dans la vie réelle
              (climat, dopage, publicité…) et expliquer pourquoi son ESD est Pareto-dominé.{" "}
              <em>(Partie 3)</em>
            </>,
            <>
              Je sais dérouler l'<strong>élimination itérative</strong> en citant l'hypothèse
              (H2.1, H2.2…) qui justifie chaque itération, et donner les <strong>PSS</strong>.{" "}
              <em>(Partie 4)</em>
            </>,
            <>
              Je sais trouver <strong>tous les EN purs</strong> avec la méthode du soulignage, y
              compris en 3×3. <em>(Partie 5, exercice 5)</em>
            </>,
            <>
              Je connais les <strong>5 jeux types</strong> et leur phénomène (bataille des sexes →
              standards ; chasse au cerf → paniques bancaires ; poule mouillée → entrée sur un
              petit marché ; matching pennies → conflit pur). <em>(Partie 5)</em>
            </>,
            <>
              Je sais dessiner le <strong>diagramme ESD ⊆ EN ⊆ PSS</strong> et citer la limite
              théorique de chaque concept. <em>(Partie 6)</em>
            </>,
            <>
              Je peux discuter le <strong>réalisme de H1, H2, H3</strong> avec les chiffres du
              labo, et expliquer le « devine 2/3 » + le concours de beauté de Keynes + les bulles.{" "}
              <em>(Partie 7)</em>
            </>,
            <>
              Je sais calculer un <strong>payoff attendu</strong> et un <strong>EN mixte</strong>{" "}
              avec le théorème d'indifférence (et je me souviens : l'indifférence de A donne q*,
              celle de G donne p*). <em>(Partie 8)</em>
            </>,
            <>
              Je peux expliquer le paradoxe <strong>police vs mafia</strong> : à l'équilibre
              mixte, ma stratégie sert à rendre l'autre indifférent. <em>(Partie 8)</em>
            </>,
          ]}
        />

        <Callout variant="retiens" title="🧭 Et après ?">
          <p>
            Ce chapitre a posé le cadre des jeux{" "}
            <strong>simultanés, non-répétés, à information complète</strong>. Les chapitres
            suivants de la partie B relâchent ces hypothèses une à une (jeux séquentiels, jeux
            répétés…). Garde tes réflexes : forme normale → dominances → élimination → meilleures
            réponses → Nash. C'est la colonne vertébrale de toute la théorie des jeux.
          </p>
        </Callout>
      </Section>
    </ChapterShell>
  );
}
