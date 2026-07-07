/*
 * Chapitre B4 — Jeux bayésiens.
 *
 * Conversion fidèle du manuel interactif « Jeux bayésiens · Information
 * incomplète » (cours ECGEB366, B. Decerf, d'après les slides « Games of
 * Incomplete Information. Bayesian Nash Equilibrium ») : l'information
 * incomplète, types / croyances / la Nature, le dilemme du prisonnier
 * bayésien, les stratégies comme règles d'action (n^k), la bataille des
 * sexes bayésienne résolue en espérance, l'équilibre de Nash bayésien
 * (définition + recette), la forme extensive avec information sets, le
 * screening de la compagnie aérienne (contraintes IC/IR, menu optimal,
 * menus pooling, seuil λ = 1/3), la checklist de maîtrise et quatre
 * exercices corrigés.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  BeliefExplorer,
  CourseMap,
  EnbDiagram,
  ExtensiveTree,
  MenuBattle,
  MenuBuilder,
  NatureFigure,
} from "./b4/interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Liste à puces lisible (le reset Tailwind supprime les puces par défaut). */
function Ul({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-5 text-[15.5px] leading-relaxed">{children}</ul>;
}

/** Surlignage « fluo » des phrases-clés (le .hl de la source). */
function Hl({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-amber-100 px-1 py-0.5 text-inherit">{children}</mark>;
}

/** Le joueur 1 (Prisonnier 1 / Homme / compagnie) — rose, comme PayoffMatrix. */
function J1({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-rose-700">{children}</strong>;
}

/** Le joueur 2 (Prisonnier 2 / Femme / voyageur) — bleu, comme PayoffMatrix. */
function J2({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-sky-700">{children}</strong>;
}

/** La Nature — le nouveau « joueur » de ce chapitre, en vert. */
function JN({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-emerald-700">{children}</strong>;
}

/** Raisonnement pas à pas (les « steps » numérotés de la source). */
function Steps({ items, labels }: { items: ReactNode[]; labels?: string[] }) {
  return (
    <div className="my-4 space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
            {labels?.[i] ?? i + 1}
          </span>
          <div className="min-w-0 text-[15px] leading-relaxed">{it}</div>
        </div>
      ))}
    </div>
  );
}

/** Deux matrices côte à côte (une par type), comme le .mrow de la source. */
function MatrixPair({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-center gap-x-6">{children}</div>;
}

/** Tableau simple (stratégies, consentements à payer, menus pooling…). */
function SimpleTable({
  head,
  rows,
  caption,
  firstColLeft = true,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  caption?: ReactNode;
  firstColLeft?: boolean;
}) {
  return (
    <figure className="my-5">
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-sm">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "border bg-muted px-3.5 py-2 text-center font-semibold",
                    firstColLeft && i === 0 && "text-left",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={cn(
                      "border bg-card px-3.5 py-2 text-center tabular-nums",
                      firstColLeft && j === 0 && "text-left font-medium",
                    )}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* La page                                                             */
/* ------------------------------------------------------------------ */

export default function ChapterB4() {
  return (
    <ChapterShell chapterId="b4">
      {/* ============================ § 0 ============================ */}
      <Section id="s0" kicker="§ 0" title="Où en est-on dans le cours ?">
        <p className="text-[1.15rem] leading-relaxed">
          Au chapitre B1, tout le monde connaissait les gains de tout le monde. Ici, on retire
          cette hypothèse : <strong>au moins un joueur ignore ce que veut vraiment l'autre</strong>
          . Bienvenue dans les <strong>jeux bayésiens</strong> — et leur équilibre :
          l'équilibre de Nash bayésien.
        </p>
        <p className="mt-3 italic text-muted-foreground">
          Avant de plonger, situons ce chapitre sur la carte. Le cours avance en relâchant, une
          à une, des hypothèses simplificatrices.
        </p>

        <CourseMap />

        <Callout variant="intuition" title="Lien avec les chapitres précédents">
          <p>
            Deux ingrédients que tu connais déjà vont fusionner ici : l'
            <strong>équilibre de Nash</strong> (B1 : chacun joue une meilleure réponse à ce que
            fait l'autre) et l'<strong>espérance de gain</strong> (A3 : quand l'issue est
            incertaine, on pondère chaque gain par sa probabilité). Un équilibre de Nash
            bayésien, c'est littéralement <Hl>un équilibre de Nash calculé en espérance</Hl>.
            Si ces deux notions sont solides, ce chapitre est une promenade.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <TheoryRef chapter="b1" section="s5" label="L'équilibre de Nash" />
            <TheoryRef chapter="a3" section="s2" label="L'espérance de gain" />
          </div>
        </Callout>

        <p>Ce que tu sauras faire à la fin de ce chapitre :</p>
        <Ul>
          <li>
            expliquer ce qu'est un jeu à <strong>information incomplète</strong>, un{" "}
            <strong>type</strong>, une <strong>croyance</strong> ;
          </li>
          <li>
            écrire correctement une <strong>stratégie</strong> dans un jeu bayésien (une règle
            d'action par type !) ;
          </li>
          <li>
            trouver un <strong>équilibre de Nash bayésien</strong> pas à pas, et vérifier qu'un
            profil n'en est <em>pas</em> un ;
          </li>
          <li>
            résoudre un problème de <strong>screening</strong> : contraintes d'incitation, de
            participation, menu optimal.
          </li>
        </Ul>
      </Section>

      {/* ============================ § 1 ============================ */}
      <Section id="s1" kicker="§ 1" title="L'information incomplète, c'est quoi ?">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Une idée toute simple, mais qui change tout : et si tu ne savais pas ce que ton
          adversaire veut vraiment ?
        </p>

        <p>
          Dans tous les jeux du chapitre B1, il y avait une hypothèse discrète mais énorme : les
          gains de chaque joueur, dans chaque case de la matrice, étaient{" "}
          <strong>connus de tous</strong>. On dit qu'ils étaient <em>de notoriété commune</em> («
          common knowledge ») : je connais tes gains, tu sais que je les connais, je sais que tu
          sais que je les connais… à l'infini.
        </p>
        <p>
          Or dans la vraie vie, c'est rarement le cas. Quand tu négocies le prix d'une voiture
          d'occasion, tu ne sais pas jusqu'où le vendeur est prêt à descendre. Quand une
          compagnie aérienne fixe ses tarifs, elle ne sait pas si <em>toi</em> tu es prêt à
          payer 700 € ou 200 €. Quand tu joues au poker, tu ne vois pas les cartes des autres.
        </p>

        <Callout variant="definition" title="Définition · Information incomplète">
          <p>
            Un jeu est à <strong>information incomplète</strong> quand{" "}
            <Hl>au moins un joueur est incertain de la fonction de gain d'un autre joueur</Hl>.
            Les gains ne sont plus de notoriété commune. Ces jeux s'appellent des{" "}
            <strong>jeux bayésiens</strong>.
          </p>
        </Callout>

        <p>
          Pourquoi est-ce si important ? Parce qu'au chapitre B1, toute ta réflexion stratégique
          reposait sur une question : <em>« que va faire l'autre ? »</em>. Et pour y répondre,
          tu regardais… ses gains ! Un adversaire rationnel choisit son action{" "}
          <strong>en fonction de ses propres gains</strong>. Si tu ne connais pas ses gains, tu
          ne peux plus prédire son comportement avec certitude — seulement avec des
          probabilités.
        </p>

        <Callout variant="attention" title="Piège classique">
          <p>
            Ne confonds pas <strong>information incomplète</strong> (je ne connais pas{" "}
            <em>tes gains</em>, donc pas tes préférences) et{" "}
            <strong>information imparfaite</strong> (je ne vois pas <em>ton action</em>, comme
            dans un jeu simultané de B1). Dans B1, on ne voyait pas l'action de l'autre mais on
            connaissait ses gains. Ici, c'est la connaissance des <em>gains eux-mêmes</em> qui
            saute.
          </p>
        </Callout>

        <Quiz
          scope="b4"
          id="q1"
          kicker="Teste-toi · 30 secondes"
          question={
            <p>
              Au poker, tu ne vois pas les cartes de ton adversaire. Pourquoi peut-on dire que
              c'est un jeu à information incomplète ?
            </p>
          }
          options={[
            {
              text: <>Parce que les joueurs jouent en même temps.</>,
              explain: (
                <>
                  La simultanéité, c'est de l'information <em>imparfaite</em> (je ne vois pas
                  ton action) — le monde de B1, pas la nouveauté de ce chapitre.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que ses cartes déterminent ses gains possibles, et tu ne les connais
                  pas.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : la main de ton adversaire définit sa « fonction de gain », et tu
                  l'ignores. C'est la définition même de l'information incomplète.
                </>
              ),
            },
            {
              text: <>Parce que le hasard intervient dans la distribution des cartes.</>,
              explain: (
                <>
                  Le hasard seul ne suffit pas : à la roulette il y a du hasard, mais aucune
                  incertitude sur les préférences des autres joueurs.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              Ce qui rend l'information <em>incomplète</em>, c'est que la main de ton adversaire
              définit ce qu'il peut gagner avec chaque action (miser, se coucher…) — sa
              « fonction de gain » — et que tu l'ignores. Le hasard seul ne suffit pas : à la
              roulette il y a du hasard, mais aucune incertitude sur les préférences des autres.
            </p>
          }
        />
      </Section>

      {/* ============================ § 2 ============================ */}
      <Section id="s2" kicker="§ 2" title="Types, croyances & la Nature">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Trois mots de vocabulaire à installer maintenant : ils reviendront dans{" "}
          <em>chaque</em> phrase du chapitre.
        </p>

        <H4>Le type : « quelle version de l'adversaire j'affronte ? »</H4>
        <p>
          Comment modéliser « je ne connais pas tes gains » de façon rigoureuse ? L'astuce est
          élégante : on imagine que ton adversaire existe en{" "}
          <strong>plusieurs versions possibles</strong>, chacune avec sa propre table de gains.
          Chaque version s'appelle un <strong>type</strong>.
        </p>

        <Callout variant="definition" title="Définition · Type">
          <p>
            Le <strong>type</strong> d'un joueur correspond à <Hl>sa fonction de gain</Hl>. Dire
            « le joueur 2 peut être de type égoïste ou de type altruiste », c'est dire : « il
            existe deux tables de gains possibles pour le joueur 2, et une seule est la vraie ».{" "}
            <strong>Chaque joueur connaît son propre type</strong> — c'est l'adversaire qui ne
            le connaît pas.
          </p>
        </Callout>

        <H4>La croyance : « avec quelles probabilités ? »</H4>
        <p>
          Ne pas connaître le type de l'autre ne veut pas dire n'avoir <em>aucune</em> idée. Le
          joueur non informé attribue une probabilité à chaque type possible : c'est sa{" "}
          <strong>croyance</strong>. Par exemple : « 80 % de chances qu'il soit égoïste, 20 %
          qu'il soit altruiste ». Dans ce cours, ces croyances sont{" "}
          <strong>données de l'extérieur</strong> (« exogènes ») : elles font partie de
          l'énoncé, tu n'as pas à les deviner.
        </p>

        <Callout variant="definition" title="Définition · Croyance">
          <p>
            La <strong>croyance</strong> d'un joueur est{" "}
            <Hl>une distribution de probabilité sur les types possibles de ses adversaires</Hl>.
            C'est exactement le même objet que les probabilités du chapitre A3 — et on s'en
            servira de la même façon : pour calculer des espérances.
          </p>
        </Callout>

        <H4>La Nature : le joueur qui tire au sort</H4>
        <p>
          Dernier personnage, et il est nouveau : la <JN>Nature</JN>. Pour représenter
          l'incertitude dans l'arbre du jeu, on imagine qu'<em>avant</em> que les vrais joueurs
          n'agissent, un joueur fictif — la Nature — tire au sort le type de chacun selon les
          probabilités des croyances. La Nature ne gagne rien, ne veut rien : elle lance juste
          les dés. Tu la reverras en tête de tous les arbres de ce chapitre, en{" "}
          <JN>vert</JN>.
        </p>

        <NatureFigure />

        <Callout variant="retiens" title="À retenir · L'asymétrie fondamentale">
          <p>
            Dans un jeu bayésien, l'information est <strong>asymétrique</strong> :{" "}
            <Hl>chacun connaît son propre type, mais pas forcément celui des autres</Hl>. Le
            joueur informé sait tout ; le joueur non informé raisonne en probabilités. Toute la
            mécanique du chapitre découle de cette phrase.
          </p>
        </Callout>

        <Quiz
          scope="b4"
          id="q2"
          kicker="Teste-toi"
          question={
            <p>
              Dans l'exemple du schéma, qui connaît le vrai type du joueur 2 une fois le tirage
              effectué ?
            </p>
          }
          options={[
            {
              text: <>Personne : c'est le hasard.</>,
              explain: (
                <>
                  Le tirage est aléatoire, mais son <em>résultat</em> est bien connu de
                  quelqu'un : le joueur 2 lui-même.
                </>
              ),
            },
            {
              text: (
                <>
                  Le joueur 2 uniquement — le joueur 1 n'a que sa croyance (0,8 / 0,2).
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est l'asymétrie fondamentale : le joueur 2 sait qui il est, le joueur 1 ne
                  dispose que des probabilités.
                </>
              ),
            },
            {
              text: <>Les deux joueurs : les probabilités sont de notoriété commune.</>,
              explain: (
                <>
                  Attention : ce sont les <em>probabilités</em> (0,8 / 0,2) qui sont de
                  notoriété commune, pas le <em>résultat</em> du tirage.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              Ce qui est de notoriété commune, ce sont les <em>probabilités</em> (0,8 / 0,2),
              pas le <em>résultat</em> du tirage. Le joueur 2 connaît son type (il sait bien
              s'il se sent coupable de trahir ou non !). Le joueur 1, lui, doit jouer sans le
              savoir.
            </p>
          }
        />
      </Section>

      {/* ============================ § 3 ============================ */}
      <Section id="s3" kicker="§ 3" title="Le dilemme du prisonnier bayésien">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Premier exemple complet. On reprend le dilemme du prisonnier de B1… et on rend l'un
          des deux prisonniers mystérieux.
        </p>

        <H4>Rappel express : la version « information complète » (B1)</H4>
        <p>
          Deux suspects sont interrogés dans des cellules séparées. Chacun peut{" "}
          <strong>se taire</strong> (Mum) ou <strong>avouer</strong> (Confess). Les peines de
          prison (en mois, donc des gains <em>négatifs</em>) :
        </p>

        <PayoffMatrix
          rowPlayer="Prisonnier 1"
          colPlayer="Prisonnier 2"
          rows={["Se taire", "Avouer"]}
          cols={["Se taire", "Avouer"]}
          payoffs={[
            [
              [-1, -1],
              [-9, 0],
            ],
            [
              [0, -9],
              [-6, -6],
            ],
          ]}
          interactive
          caption={
            <>
              Dilemme du prisonnier — information complète (B1). Clique sur les boutons pour
              revoir les meilleures réponses et l'équilibre.
            </>
          }
        />

        <p>
          Tu te souviens du résultat de B1 : <strong>Avouer est une stratégie dominante</strong>{" "}
          pour chacun (elle donne toujours un meilleur gain, quoi que fasse l'autre), et
          l'unique équilibre est (Avouer, Avouer) — alors même que (Se taire, Se taire) serait
          mieux pour les deux. C'est ça, le « dilemme ».{" "}
          <TheoryRef chapter="b1" section="s3" label="Stratégies dominantes" />
        </p>

        <H4>On casse l'information complète</H4>
        <p>
          Maintenant, la nouveauté. Le <J1>prisonnier 1</J1> est toujours égoïste, tout le monde
          le sait. Mais le <J2>prisonnier 2</J2> peut être de deux types :
        </p>
        <Ul>
          <li>
            <strong>Type égoïste</strong> : mêmes gains qu'en B1.
          </li>
          <li>
            <strong>Type altruiste</strong> : il trouve <em>immoral</em> de trahir. Avouer lui
            inflige un coût psychologique équivalent à <strong>4 mois de prison en plus</strong>
            , qu'on soustrait à ses gains dans la colonne « Avouer ».
          </li>
        </Ul>
        <p>
          Le <J1>prisonnier 1</J1> ne sait pas à qui il a affaire, mais il sait qu'environ 80 %
          des criminels sont égoïstes. Sa croyance : <J2>égoïste</J2> avec probabilité 0,8 ·{" "}
          <J2>altruiste</J2> avec probabilité 0,2. Voici les deux tables de gains possibles —
          regarde bien : seuls les gains <J2>bleus</J2> de la colonne « Avouer » changent (−4
          partout) :
        </p>

        <MatrixPair>
          <PayoffMatrix
            rowPlayer="Prisonnier 1"
            colPlayer="Prisonnier 2"
            rows={["Se taire", "Avouer"]}
            cols={["Se taire", "Avouer"]}
            payoffs={[
              [
                [-1, -1],
                [-9, 0],
              ],
              [
                [0, -9],
                [-6, -6],
              ],
            ]}
            interactive
            caption={
              <>
                Si le prisonnier 2 est <strong>égoïste</strong> (proba 0,8).
              </>
            }
          />
          <PayoffMatrix
            rowPlayer="Prisonnier 1"
            colPlayer="Prisonnier 2"
            rows={["Se taire", "Avouer"]}
            cols={["Se taire", "Avouer"]}
            payoffs={[
              [
                [-1, -1],
                [-9, -4],
              ],
              [
                [0, -9],
                [-6, -10],
              ],
            ]}
            interactive
            caption={
              <>
                Si le prisonnier 2 est <strong>altruiste</strong> (proba 0,2) : −4 sur ses gains
                de la colonne « Avouer ».
              </>
            }
          />
        </MatrixPair>

        <H4>Résolution, joueur par joueur</H4>
        <p>
          <strong>
            Le <J2>prisonnier 2</J2> d'abord
          </strong>{" "}
          (le joueur informé — c'est souvent le plus facile, car lui connaît sa table) :
        </p>
        <Ul>
          <li>
            S'il est <strong>égoïste</strong> : on retrouve B1, <em>Avouer</em> est dominant (
            <M tex="0 > -1" /> et <M tex="-6 > -9" />
            ).
          </li>
          <li>
            S'il est <strong>altruiste</strong> : compare les colonnes de <em>sa</em> table. Si
            1 se tait : se taire donne −1, avouer donne −4 → se taire. Si 1 avoue : se taire
            donne −9, avouer donne −10 → se taire encore. <em>Se taire</em> est dominant !
          </li>
        </Ul>
        <p>
          <strong>
            Le <J1>prisonnier 1</J1> ensuite
          </strong>{" "}
          (le joueur non informé). Coup de chance : ses gains à lui (<J1>roses</J1>) sont
          identiques dans les deux tables. <em>Avouer</em> lui donne toujours plus (
          <M tex="0 > -1" /> ; <M tex="-6 > -9" />
          ), <strong>quel que soit le type d'en face</strong>. Sa stratégie dominante est
          Avouer — pas besoin de probabilités ici, elles ne serviront que dans l'exemple
          suivant.
        </p>

        <Callout variant="retiens" title="Résultat · Notre premier équilibre de Nash bayésien">
          <p className="text-center text-[1.1rem] font-semibold">
            ( <J1>Avouer</J1> , <J2>(Avouer si égoïste · Se taire si altruiste)</J2> )
          </p>
          <p>
            Chaque morceau est une meilleure réponse à l'autre : <J1>Avouer</J1> est la
            meilleure réponse de 1 à la règle de 2, et cette règle est la meilleure réponse de 2
            (type par type) à <J1>Avouer</J1>. C'est un équilibre de Nash… version bayésienne.
            Remarque la forme de la stratégie de 2 : <Hl>une action <em>par type</em></Hl>. On
            creuse ça tout de suite.
          </p>
        </Callout>

        <Quiz
          scope="b4"
          id="q3"
          kicker="Teste-toi"
          question={
            <p>
              Pourquoi le prisonnier 1 n'a-t-il pas eu besoin d'utiliser sa croyance (0,8 / 0,2)
              pour choisir ?
            </p>
          }
          options={[
            {
              text: <>Parce que les probabilités se compensent exactement.</>,
              explain: (
                <>
                  Non — il n'y a eu aucun calcul de compensation : les probabilités n'ont tout
                  simplement pas servi.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'Avouer est dominant pour lui face aux deux types : le type d'en face
                  ne change rien à son classement.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Quand une action est meilleure dans <em>tous</em> les scénarios, elle gagne
                  pour n'importe quelles probabilités : l'espérance est inutile.
                </>
              ),
            },
            {
              text: <>Parce que le prisonnier 2 connaît son propre type.</>,
              explain: (
                <>
                  C'est vrai, mais ça ne dispense pas le joueur 1 de raisonner : c'est la
                  dominance de « Avouer » dans ses deux tables qui rend sa croyance inutile.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              Les gains du prisonnier 1 sont les mêmes dans les deux tables, et Avouer y est
              dominant. Quand une action est meilleure dans <em>tous</em> les scénarios, inutile
              de calculer une espérance — elle gagnerait pour n'importe quelles probabilités.
              Retiens quand même que c'est un cas particulier : dans la bataille des sexes,
              juste après, la croyance deviendra indispensable.
            </p>
          }
        />
      </Section>

      {/* ============================ § 4 ============================ */}
      <Section id="s4" kicker="§ 4" title="Les stratégies deviennent des règles d'action">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Le changement conceptuel le plus important du chapitre — et la source n°1 d'erreurs à
          l'examen.
        </p>

        <p>
          En B1, une stratégie était simple : une action. « Je joue Viande. » Point. Dans un jeu
          bayésien, ce n'est plus suffisant pour le joueur qui a plusieurs types possibles. Sa
          stratégie doit dire ce qu'il ferait <strong>dans chacune de ses versions</strong>.
        </p>

        <Callout variant="definition" title="Définition · Stratégie dans un jeu bayésien">
          <p>
            Une stratégie est une <strong>règle d'action</strong> (et plus seulement une
            action) : elle spécifie <Hl>une action pour chaque type possible du joueur</Hl>.
            Tout se passe comme si le joueur devait choisir sa stratégie <em>avant</em>{" "}
            d'apprendre son propre type — d'où la nécessité de prévoir un plan complet, pour
            chaque information set.
          </p>
        </Callout>

        <p>
          Concrètement, avec l'exemple qui arrive (la bataille des sexes) : l'<J1>Homme</J1> n'a
          qu'un seul type possible, donc ses stratégies restent de simples actions — il en a{" "}
          <strong>2</strong> (Viande ou Poisson). La <J2>Femme</J2> a deux types possibles (T1
          ou T2) et deux actions (Rouge ou Blanc), donc ses stratégies sont des règles
          complètes — il y en a <strong>4</strong> :
        </p>

        <SimpleTable
          head={["Stratégie", "Si elle est T1…", "Si elle est T2…"]}
          firstColLeft={false}
          rows={[
            ["1", "Rouge", "Rouge"],
            ["2", "Rouge", "Blanc"],
            ["3", "Blanc", "Rouge"],
            ["4", "Blanc", "Blanc"],
          ]}
          caption={<>Les 4 stratégies (= règles d'action complètes) de la Femme.</>}
        />

        <FormulaBox
          label="Formule à connaître"
          tex="\#\,\text{stratégies d'un joueur} \;=\; n^{k}"
          caption={
            <>
              Un joueur avec <M tex="k" /> types possibles et <M tex="n" /> actions possède{" "}
              <M tex="n^k" /> stratégies. Ici : <M tex="2^2 = 4" />. Un joueur à 3 types et 2
              actions en aurait <M tex="2^3 = 8" />. C'est une question de comptage typique et
              facile à rater si on écrit « 2 stratégies » par réflexe de B1.
            </>
          }
        />

        <Quiz
          scope="b4"
          id="q4"
          kicker="Teste-toi"
          question={
            <p>
              Un joueur peut être de 3 types (optimiste, neutre, pessimiste) et choisit entre 3
              actions (A, B, C). Combien a-t-il de stratégies ?
            </p>
          }
          options={[
            {
              text: <>3 — une par action.</>,
              explain: (
                <>
                  C'est le réflexe de B1. Mais ici une stratégie doit dire quoi faire{" "}
                  <em>pour chaque type</em> : une seule action ne suffit plus.
                </>
              ),
            },
            {
              text: <>9 — trois types fois trois actions.</>,
              explain: (
                <>
                  Le piège « 9 » vient de multiplier types et actions au lieu d'élever à la
                  puissance : il faut <M tex="n^k" />, pas <M tex="n \times k" />.
                </>
              ),
            },
            {
              text: (
                <>
                  27 — trois choix d'action pour chacun des trois types : <M tex="3^3" />.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Une stratégie est un tableau complet « type → action » : 3 choix pour le
                  premier type × 3 pour le deuxième × 3 pour le troisième = 27.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              Une stratégie est un tableau complet « type → action ». Pour chaque type (3), on
              choisit librement une action (3) : <M tex="3 \times 3 \times 3 = 3^3 = 27" />. Le
              piège « 9 » vient de multiplier types et actions au lieu d'élever à la puissance.
            </p>
          }
        />
      </Section>

      {/* ============================ § 5 ============================ */}
      <Section id="s5" kicker="§ 5" title="La bataille des sexes bayésienne">
        <p className="text-[1.1rem] italic text-muted-foreground">
          L'exemple central du chapitre : ici, impossible d'esquiver les probabilités. C'est le
          moment où l'espérance de gain d'A3 entre en scène.
        </p>

        <H4>Le décor</H4>
        <p>
          Un <J1>Homme</J1> invite une <J2>Femme</J2> à dîner. Il cuisine{" "}
          <strong>Viande ou Poisson</strong> ; elle apporte du vin <strong>Rouge ou Blanc</strong>
          . Ils choisissent <em>simultanément</em>, sans se concerter. En B1 (information
          complète), les gains étaient :
        </p>

        <PayoffMatrix
          rowPlayer="Homme"
          colPlayer="Femme"
          rows={["Viande", "Poisson"]}
          cols={["Rouge", "Blanc"]}
          payoffs={[
            [
              [2, 1],
              [0, 0],
            ],
            [
              [0, 0],
              [1, 2],
            ],
          ]}
          interactive
          caption={<>Bataille des sexes — information complète (B1).</>}
        />

        <p>
          Lis-la avec les couleurs : chacun préfère être <em>coordonné</em> (les cases (2,1) et
          (1,2)) plutôt que décoordonné (les cases (0,0)), mais l'<J1>Homme</J1> préfère la
          coordination Viande-Rouge tandis que la <J2>Femme</J2> préfère Poisson-Blanc. D'où la
          « bataille ».
        </p>

        <H4>On introduit l'incertitude</H4>
        <p>Toutes les femmes n'ont pas les mêmes goûts d'accords mets-vins :</p>
        <Ul>
          <li>
            <strong>Type T1</strong> (les gains ci-dessus) : elle aime le Rouge avec la Viande,
            le Blanc avec le Poisson — les goûts « classiques ».
          </li>
          <li>
            <strong>Type T2</strong> : l'inverse ! Elle préfère le Rouge avec le Poisson et le
            Blanc avec la Viande.
          </li>
        </Ul>
        <p>
          L'<J1>Homme</J1> ignore le type de son invitée. Sa croyance :{" "}
          <strong>50 % T1, 50 % T2</strong>. Les gains de l'Homme (<J1>roses</J1>) ne changent
          pas — lui veut juste qu'on apprécie son plat avec le bon vin selon <em>ses</em>{" "}
          critères ; ce sont les gains de la Femme (<J2>bleus</J2>) qui basculent :
        </p>

        <MatrixPair>
          <PayoffMatrix
            rowPlayer="Homme"
            colPlayer="Femme"
            rows={["Viande", "Poisson"]}
            cols={["Rouge", "Blanc"]}
            payoffs={[
              [
                [2, 1],
                [0, 0],
              ],
              [
                [0, 0],
                [1, 2],
              ],
            ]}
            interactive
            caption={
              <>
                Si la Femme est <strong>T1</strong> (proba 0,5).
              </>
            }
          />
          <PayoffMatrix
            rowPlayer="Homme"
            colPlayer="Femme"
            rows={["Viande", "Poisson"]}
            cols={["Rouge", "Blanc"]}
            payoffs={[
              [
                [2, 0],
                [0, 2],
              ],
              [
                [0, 1],
                [1, 0],
              ],
            ]}
            interactive
            caption={
              <>
                Si la Femme est <strong>T2</strong> (proba 0,5) : ses goûts s'inversent.
              </>
            }
          />
        </MatrixPair>

        <Callout variant="methode" title="La méthode de résolution — LA recette de l'examen">
          <p>L'Homme n'a que deux stratégies. On va les tester une par une :</p>
          <Steps
            items={[
              <>
                <strong>Fixe une stratégie du joueur non informé</strong> (l'Homme) : commençons
                par <em>Viande</em>.
              </>,
              <>
                <strong>Trouve la meilleure réponse du joueur informé, type par type.</strong>{" "}
                C'est facile : chaque type de Femme connaît sa table, elle compare juste deux
                nombres dans la ligne « Viande ».
              </>,
              <>
                <strong>
                  Vérifie que la stratégie de départ est bien une meilleure réponse en retour
                </strong>
                , en calculant l'<em>espérance de gain</em> de l'Homme avec sa croyance
                (0,5 / 0,5). Si oui : équilibre trouvé. Si non : ce n'est pas un équilibre.
              </>,
            ]}
          />
        </Callout>

        <H4>Candidat n°1 : l'Homme joue Viande</H4>
        <p>
          <strong>Étape 2 — la Femme répond, type par type</strong> (ligne « Viande » de chaque
          table) :
        </p>
        <Ul>
          <li>
            Si elle est <strong>T1</strong> : Rouge → 1, Blanc → 0. Elle choisit{" "}
            <strong>Rouge</strong>.
          </li>
          <li>
            Si elle est <strong>T2</strong> : Rouge → 0, Blanc → 2. Elle choisit{" "}
            <strong>Blanc</strong>.
          </li>
        </Ul>
        <p>
          Sa règle : <J2>(Rouge si T1 · Blanc si T2)</J2>.
        </p>
        <p>
          <strong>Étape 3 — l'Homme confirme-t-il Viande face à cette règle ?</strong> Il ne
          sait pas quel type est en face, donc il calcule ses <em>espérances</em> :
        </p>
        <MB tex="E[\text{Viande}] \;=\; \underbrace{2 \times 0{,}5}_{\text{T1} \,\to\, \text{Rouge} \,\to\, (2,1)} \;+\; \underbrace{0 \times 0{,}5}_{\text{T2} \,\to\, \text{Blanc} \,\to\, (0,2)} \;=\; \mathbf{1}" />
        <MB tex="E[\text{Poisson}] \;=\; \underbrace{0 \times 0{,}5}_{\text{T1} \,\to\, \text{Rouge} \,\to\, (0,0)} \;+\; \underbrace{1 \times 0{,}5}_{\text{T2} \,\to\, \text{Blanc} \,\to\, (1,0)} \;=\; \mathbf{0{,}5}" />
        <p>
          <M tex="1 > 0{,}5" /> : Viande est bien sa meilleure réponse.{" "}
          <strong>Les deux stratégies sont des meilleures réponses mutuelles</strong> :
        </p>

        <Callout variant="retiens" title="Équilibre de Nash bayésien trouvé">
          <p className="text-center text-[1.1rem] font-semibold">
            ( <J1>Viande</J1> , <J2>(Rouge si T1 · Blanc si T2)</J2> )
          </p>
        </Callout>

        <H4>Candidat n°2 : l'Homme joue Poisson… et ça rate</H4>
        <p>
          <strong>Étape 2</strong> — ligne « Poisson » : T1 compare 0 (Rouge) et 2 (Blanc) →{" "}
          <strong>Blanc</strong> ; T2 compare 1 (Rouge) et 0 (Blanc) → <strong>Rouge</strong>.
          Règle : <J2>(Blanc si T1 · Rouge si T2)</J2>.
        </p>
        <p>
          <strong>Étape 3</strong> — face à cette règle, l'Homme calcule :
        </p>
        <MB tex="E[\text{Viande}] = 0 \times 0{,}5 + 2 \times 0{,}5 = \mathbf{1} \qquad E[\text{Poisson}] = 1 \times 0{,}5 + 0 \times 0{,}5 = \mathbf{0{,}5}" />
        <p>
          Face à (Blanc si T1 · Rouge si T2), sa meilleure réponse est… <strong>Viande</strong>,
          pas Poisson ! Le candidat s'effondre :{" "}
          <Hl>
            ( Poisson , (Blanc si T1 · Rouge si T2) ) n'est <strong>pas</strong> un équilibre de
            Nash bayésien
          </Hl>
          , car l'Homme aurait envie de dévier. Savoir <em>rejeter</em> un candidat est aussi
          important que savoir en valider un.
        </p>

        <BeliefExplorer />

        <Quiz
          scope="b4"
          id="q5"
          kicker="Teste-toi"
          question={
            <p>
              Avec le widget (ou de tête !) : pour p = 0,9, le profil
              ( Viande , (Rouge si T1 · Blanc si T2) ) est-il toujours un équilibre ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Oui : E[Viande] = 2 × 0,9 = 1,8 contre E[Poisson] = 0,1 — encore plus
                  nettement qu'à 0,5.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Plus T1 est probable, plus « Viande » rapporte en espérance face à cette
                  règle : l'équilibre est encore plus solide qu'à p = 0,5.
                </>
              ),
            },
            {
              text: <>Non : avec p élevé, la Femme change de meilleure réponse.</>,
              explain: (
                <>
                  Impossible : la Femme connaît son type, elle compare des gains{" "}
                  <em>certains</em>. Sa règle ne dépend pas de p.
                </>
              ),
            },
            {
              text: <>Impossible à dire sans connaître le type réel.</>,
              explain: (
                <>
                  Justement non : l'équilibre se vérifie avec la croyance (les probabilités),
                  pas avec le type réalisé.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              La règle de la Femme ne dépend pas de p (elle connaît son type, elle compare des
              gains certains). Seule l'espérance de l'Homme bouge :{" "}
              <M tex="E[\text{Viande}] = 2p" /> et <M tex="E[\text{Poisson}] = 1 - p" />. Pour
              p = 0,9 : <M tex="1{,}8 > 0{,}1" />, l'équilibre tient. Il ne casserait que pour{" "}
              <M tex="p < 1/3" /> — vérifie au slider !
            </p>
          }
        />
      </Section>

      {/* ============================ § 6 ============================ */}
      <Section id="s6" kicker="§ 6" title="L'équilibre de Nash bayésien (ENB)">
        <p className="text-[1.1rem] italic text-muted-foreground">
          On a résolu deux exemples. Formalisons maintenant ce qu'on a fait, proprement.
        </p>

        <Callout variant="definition" title="Définition · Équilibre de Nash bayésien">
          <p>
            Un profil de stratégies est un <strong>équilibre de Nash bayésien (ENB)</strong> si
            ses stratégies sont des <Hl>meilleures réponses mutuelles</Hl>. Plus précisément,
            dans un profil <M tex="(S_1, S_2)" />, la stratégie <M tex="S_1" /> est une
            meilleure réponse à <M tex="S_2" /> si les actions que <M tex="S_1" /> prescrit à
            chaque type du joueur 1 <strong>maximisent son espérance de gain</strong>,{" "}
            <em>étant donné</em> sa croyance sur le type de l'adversaire et <em>étant donné</em>{" "}
            la règle d'action <M tex="S_2" /> de l'adversaire.
          </p>
        </Callout>

        <p>
          Relis la définition lentement : c'est <em>exactement</em> l'équilibre de Nash de B1
          (« personne ne regrette son choix, personne ne veut dévier seul »), avec deux
          adaptations dues à l'incertitude :
        </p>
        <Ul>
          <li>
            les « choix » sont devenus des <strong>règles d'action</strong> (une action par
            type) ;
          </li>
          <li>
            « meilleur gain » est devenu « meilleure <strong>espérance</strong> de gain »,
            pondérée par les croyances — l'outil d'A3.
          </li>
        </Ul>

        <EnbDiagram />

        <Callout variant="methode" title="La recette générale (à connaître par cœur)">
          <Steps
            items={[
              <>
                Liste les stratégies de chaque joueur (attention : <M tex="n^k" /> règles pour
                un joueur à <M tex="k" /> types).
              </>,
              <>
                Pour chaque stratégie du joueur <em>non informé</em>, calcule la meilleure
                réponse du joueur <em>informé</em>, type par type (comparaisons de gains
                certains — facile).
              </>,
              <>
                Vérifie en retour la meilleure réponse du joueur non informé face à cette règle,
                via son <strong>espérance de gain</strong> (croyances !).
              </>,
              <>
                Si les deux sont des meilleures réponses l'une à l'autre → ENB. Sinon → on
                rejette et on passe au candidat suivant.
              </>,
            ]}
          />
        </Callout>

        <p>
          Dernier point de vocabulaire du cours : on a étudié ici des jeux bayésiens{" "}
          <strong>simultanés</strong> (dits « statiques »). Il existe aussi des jeux bayésiens{" "}
          <strong>séquentiels</strong> (« dynamiques »), plus riches : quand on joue l'un après
          l'autre, le joueur informé peut essayer de <em>révéler ou cacher son type</em> par ses
          choix — impossible en simultané. C'est exactement ce qu'on verra avec le screening en
          § 8.
        </p>

        <Quiz
          scope="b4"
          id="q6"
          kicker="Teste-toi"
          question={<p>Quelle affirmation est correcte ?</p>}
          options={[
            {
              text: (
                <>
                  L'ENB remplace l'équilibre de Nash : les meilleures réponses ne comptent plus.
                </>
              ),
              explain: (
                <>
                  Au contraire : l'ENB <em>est</em> un équilibre de Nash — des meilleures
                  réponses mutuelles, simplement évaluées en espérance.
                </>
              ),
            },
            {
              text: (
                <>
                  Dans un ENB, le joueur informé maximise aussi une espérance sur son propre
                  type.
                </>
              ),
              explain: (
                <>
                  Non : le joueur informé <em>connaît</em> son type. Il compare des gains
                  certains, type par type. C'est un piège d'examen classique.
                </>
              ),
            },
            {
              text: (
                <>
                  L'ENB est un équilibre de Nash où le joueur non informé évalue ses stratégies
                  en espérance, selon ses croyances.
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est la bonne synthèse : Nash (meilleures réponses mutuelles) + espérance
                  (pondération par les croyances) = ENB.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              Le joueur informé connaît son type : pour lui, pas d'espérance sur son propre
              type, il compare des gains certains type par type. C'est le joueur{" "}
              <em>non informé</em> qui pondère par ses croyances. Et l'ENB reste
              fondamentalement un Nash : des meilleures réponses mutuelles.
            </p>
          }
        />
      </Section>

      {/* ============================ § 7 ============================ */}
      <Section id="s7" kicker="§ 7" title="La forme extensive : dessiner l'incertitude">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Comment représenter un jeu bayésien en arbre ? Deux ingrédients : la Nature au sommet,
          et des pointillés pour dire « je ne sais pas où je suis ».
        </p>

        <p>
          Voici l'arbre de la bataille des sexes bayésienne. Prends une minute pour le lire de
          haut en bas avant les explications :
        </p>

        <ExtensiveTree />

        <p>Comment lire cet arbre, ligne par ligne :</p>
        <Ul>
          <li>
            <JN>La Nature</JN> joue en premier : elle tire T1 (à gauche, 50 %) ou T2 (à droite,
            50 %). Cela duplique tout le jeu en deux « univers ».
          </li>
          <li>
            <J1>L'Homme</J1> joue ensuite. Le trait pointillé qui relie ses deux nœuds est son{" "}
            <strong>information set</strong> : il signifie « l'Homme ne sait pas s'il est dans
            l'univers T1 ou T2 ». Conséquence capitale :{" "}
            <Hl>il doit jouer la même action dans les deux nœuds</Hl> — c'est pour ça qu'il n'a
            que 2 stratégies.
          </li>
          <li>
            <J2>La Femme</J2> joue « en même temps » (le jeu est simultané : ses pointillés
            signifient qu'elle ne voit pas le choix de l'Homme). Mais ses information sets ne
            traversent <em>pas</em> la frontière T1/T2 : elle, elle{" "}
            <strong>connaît son type</strong>. Elle peut donc jouer différemment selon l'univers
            — d'où ses 4 stratégies.
          </li>
        </Ul>

        <Callout variant="attention" title="Piège classique">
          <p>
            Le jeu est <strong>simultané</strong>, même si l'arbre dessine l'Homme « avant » la
            Femme. L'ordre vertical de l'arbre est une convention de dessin ; ce qui code la
            simultanéité, ce sont les <strong>pointillés de la Femme</strong> (elle ne voit pas
            l'action de l'Homme au moment de choisir). Un information set = un ensemble de
            nœuds indistinguables pour le joueur qui doit y jouer.
          </p>
        </Callout>

        <Quiz
          scope="b4"
          id="q7"
          kicker="Teste-toi"
          question={
            <p>
              Dans l'arbre, pourquoi l'information set de l'Homme relie-t-il les deux univers
              (T1 et T2), alors que ceux de la Femme restent chacun dans un seul univers ?
            </p>
          }
          options={[
            {
              text: <>Parce que l'Homme joue avant la Femme.</>,
              explain: (
                <>
                  L'ordre de dessin est une convention : le jeu est simultané. Ce n'est pas
                  l'ordre qui définit les information sets, c'est l'information disponible.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que l'Homme ignore le type tiré par la Nature, tandis que la Femme le
                  connaît.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Un information set regroupe les nœuds indistinguables : l'Homme ne distingue
                  pas les univers T1 et T2, la Femme si.
                </>
              ),
            },
            {
              text: <>Parce que l'Homme a moins d'actions que la Femme.</>,
              explain: (
                <>
                  Ils ont chacun 2 actions ! La différence vient de l'information (le type),
                  pas du nombre d'actions.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              Un information set regroupe les nœuds que le joueur ne peut pas distinguer.
              L'Homme ne peut pas distinguer « univers T1 » et « univers T2 » → un seul grand
              information set à cheval. La Femme connaît son type → un information set par type
              (mais chacun regroupe les deux actions possibles de l'Homme, qu'elle ne voit pas :
              simultanéité).
            </p>
          }
        />
      </Section>

      {/* ============================ § 8 ============================ */}
      <Section id="s8" kicker="§ 8" title="Le screening : faire parler l'information">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Dernière partie du chapitre, et la plus appliquée : un jeu bayésien <em>séquentiel</em>{" "}
          où le joueur non informé tend un piège élégant au joueur informé… pour lui faire
          révéler son type tout seul.
        </p>

        <H4>Le problème de la compagnie aérienne</H4>
        <p>
          Une compagnie aérienne vend deux types de sièges : <strong>Premium (P)</strong> et{" "}
          <strong>Économie (E)</strong>. Ses voyageurs sont de deux types, avec des{" "}
          <em>consentements à payer</em> (le prix maximum qu'ils acceptent — souviens-toi du
          surplus vu en A1 : surplus = consentement à payer − prix) très différents :{" "}
          <TheoryRef chapter="a1" section="transaction" label="Le surplus (A1)" />
        </p>

        <SimpleTable
          head={["", "Premium", "Économie"]}
          rows={[
            [<strong key="c">Coût de production</strong>, "150", "100"],
            [
              <span key="b">
                <strong>Voyageur Affaires (B)</strong> — consentement à payer
              </span>,
              "700",
              "400",
            ],
            [
              <span key="t">
                <strong>Voyageur Touriste (T)</strong> — consentement à payer
              </span>,
              "220",
              "200",
            ],
          ]}
          caption={<>Coûts (par passager) et consentements à payer, selon le type de voyageur.</>}
        />

        <p>
          Le hic : <strong>le type est invisible</strong>. Un voyageur d'affaires n'a pas
          « Affaires » tatoué sur le front, et il n'a aucune envie d'avouer qu'il paierait 700.
          La compagnie connaît seulement la <strong>proportion λ</strong> (lambda) de voyageurs
          Affaires dans la population. Te voilà en plein jeu bayésien : la compagnie (non
          informée) joue contre des voyageurs (informés de leur propre type).
        </p>

        <H4>Étape 1 · Le rêve : discrimination parfaite (le benchmark)</H4>
        <p>
          Imaginons une seconde que la compagnie <em>puisse</em> lire les types (et ait le droit
          de discriminer). Elle vendrait à chacun le siège le plus rentable, au prix maximal
          (juste en dessous du consentement à payer) :
        </p>
        <Ul>
          <li>
            à chaque <strong>B</strong> : un siège <strong>P</strong> à 700 → marge{" "}
            <M tex="700 - 150 = \mathbf{550}" /> ;
          </li>
          <li>
            à chaque <strong>T</strong> : un siège <strong>E</strong> à 200 → marge{" "}
            <M tex="200 - 100 = \mathbf{100}" />.
          </li>
        </Ul>
        <FormulaBox
          label="Profit de référence (discrimination parfaite)"
          tex="\Pi_{\text{parf}} \;=\; 550\,\lambda + 100\,(1-\lambda) \;=\; \mathbf{100 + 450\,\lambda}"
          caption={
            <>
              C'est le <strong>profit de référence</strong> : le maximum théorique,
              inatteignable sans l'information. Tout l'enjeu est de mesurer combien l'ignorance
              coûte.
            </>
          }
        />

        <H4>Étape 2 · Le naïf : mêmes prix, sans identifier</H4>
        <p>
          Premier réflexe : garder les prix du rêve, <M tex="(y, x) = (700,\ 200)" /> —{" "}
          <M tex="y" /> pour Premium, <M tex="x" /> pour Économie — et laisser chacun choisir.
          Catastrophe : le voyageur d'affaires calcule son surplus. Avec P :{" "}
          <M tex="700 - 700 = 0" />. Avec E : <M tex="400 - 200 = 200" />.{" "}
          <strong>Il prend Économie !</strong> Pourquoi paierait-il plein pot quand la classe
          éco lui laisse 200 de surplus ? L'information privée lui donne un pouvoir.
        </p>

        <H4>Étape 3 · L'astuce : le menu auto-sélectif (screening)</H4>
        <p>
          L'idée géniale : puisque la compagnie ne peut pas <em>demander</em> le type, elle va
          concevoir un <strong>menu de tarifs (y, x)</strong> tel que chaque type, en
          choisissant égoïstement ce qui l'arrange, <em>révèle son type de lui-même</em>. C'est
          l'<strong>auto-sélection</strong>. Pour que ça marche, quatre contraintes — deux
          familles :
        </p>

        <Callout
          variant="definition"
          title="Les contraintes d'incitation (IC) — « chacun choisit la case prévue pour lui »"
        >
          <p>
            <strong>IC du Touriste</strong> — T doit préférer E à P :{" "}
            <M tex="220 - y \;\le\; 200 - x" />
          </p>
          <p>
            <strong>IC du Business</strong> — B doit préférer P à E :{" "}
            <M tex="700 - y \;\ge\; 400 - x \;\iff\; y - x \le 300" />
          </p>
        </Callout>
        <Callout
          variant="definition"
          title="Les contraintes de participation (IR) — « chacun préfère acheter que partir »"
        >
          <p>
            <strong>IR du Touriste</strong> — surplus de T sur E positif :{" "}
            <M tex="x \;\le\; 200" />
          </p>
          <p>
            <strong>IR du Business</strong> — surplus de B sur P positif :{" "}
            <M tex="y \;\le\; 700" />
          </p>
        </Callout>

        <p>
          Sous ces quatre contraintes, la compagnie maximise son profit moyen. Réécrivons-le
          astucieusement :
        </p>
        <FormulaBox
          label="Profit du menu de screening"
          tex="\Pi_{\text{scr}}(y, x) \;=\; \lambda\,(y - 150) + (1-\lambda)(x - 100) \;=\; \mathbf{(x - 100) + \lambda\,(y - x - 50)}"
          caption={
            <>
              Sous cette forme, la marche à suivre saute aux yeux : pour maximiser, il faut
              pousser <M tex="x" /> au maximum <em>et</em> pousser l'écart <M tex="y - x" /> au
              maximum.
            </>
          }
        />
        <p>Or :</p>
        <Ul>
          <li>
            l'IR du Touriste plafonne <M tex="x" /> à <strong>200</strong> ;
          </li>
          <li>
            l'IC du Business plafonne <M tex="y - x" /> à <strong>300</strong>, donc{" "}
            <M tex="y = 200 + 300 = \mathbf{500}" />.
          </li>
        </Ul>

        <Callout variant="retiens" title="Le menu optimal de screening">
          <p className="text-center text-[1.15rem] font-bold">
            x = 200 (Économie) &ensp;·&ensp; y = 500 (Premium)
          </p>
          <MB tex="\Pi_{\text{scr}} = (200 - 100) + \lambda\,(500 - 200 - 50) = \mathbf{100 + 250\,\lambda}" />
        </Callout>

        <p>Trois observations à bien comprendre (elles tombent en question de cours) :</p>
        <Ul>
          <li>
            <strong>Pourquoi pas y = 700 ?</strong> À 700, l'IC du Business casserait : il
            faudrait <M tex="y - x \le 300" />, donc <M tex="x \ge 400" />, ce qui violerait
            l'IR du Touriste (<M tex="x \le 200" />
            ). La compagnie doit <em>brader le Premium à 500</em> pour que B ne soit pas tenté
            par l'Économie. Ces 200 de rabais sont le{" "}
            <strong>surplus laissé au Business</strong> : son IR n'est pas saturée (
            <M tex="500 < 700" />
            ), on dit qu'elle n'est <em>pas contraignante</em> (« not binding »).
          </li>
          <li>
            À l'inverse, le Touriste est pressé comme un citron : x = 200 = son consentement à
            payer, surplus nul. Son IR est <em>saturée</em>, et son IC est large (
            <M tex="220 - 500 = -280 \le 0" /> : il ne rêve pas du Premium).
          </li>
          <li>
            <strong>Le coût de l'asymétrie d'information :</strong>{" "}
            <M tex="\Pi_{\text{scr}} = 100 + 250\lambda \;<\; \Pi_{\text{parf}} = 100 + 450\lambda" />{" "}
            dès que <M tex="\lambda > 0" />. La différence, <M tex="200\lambda" />, est
            exactement le surplus abandonné aux voyageurs d'affaires.{" "}
            <Hl>
              Le coût de l'information cachée est porté par la firme, et le bénéfice va au type
              « fort »
            </Hl>{" "}
            (celui qui a le consentement à payer élevé).
          </li>
        </Ul>

        <MenuBuilder />

        <H4>Étape 4 · Les menus « pooling » : et si on ne séparait pas ?</H4>
        <p>
          Le screening n'est pas la seule option. La compagnie peut aussi vendre{" "}
          <strong>un seul type de billet</strong> — soit à tout le monde, soit seulement aux
          Business (« pooling » = on ne sépare pas les types). Quatre variantes, avec leur
          profit moyen par client potentiel :
        </p>

        <SimpleTable
          head={["Menu", "Billet", "Prix", "Qui achète ?", "Marge", "Profit moyen"]}
          firstColLeft={false}
          rows={[
            ["P_all", "P", "220", "tous", "70", "70"],
            ["P_B", "P", "700", "B seulement", "550", "550 λ"],
            ["E_all", "E", "200", "tous", "100", "100"],
            ["E_B", "E", "400", "B seulement", "300", "300 λ"],
          ]}
          caption={<>Les quatre menus « pooling » (un seul billet en vente).</>}
        />

        <p>
          Le cours montre (et tu peux le vérifier) que <strong>quel que soit λ</strong> :
          Screening {">"} E_all {">"} P_all, et Screening {">"} E_B. Il ne reste donc que deux
          finalistes : le <strong>menu de screening</strong> (séparation) et le menu{" "}
          <strong>P_B</strong> (prix fort, on abandonne les touristes). Lequel gagne ?
          Comparons :
        </p>
        <MB tex="\text{P}_B \text{ bat le screening} \;\iff\; 550\,\lambda > 100 + 250\,\lambda \;\iff\; 300\,\lambda > 100 \;\iff\; \boxed{\lambda > \tfrac{1}{3}}" />
        <p>
          Intuition : si les Business sont rares (λ petit), on ne peut pas se permettre
          d'ignorer les touristes → screening. S'ils sont nombreux (<M tex="\lambda > 1/3" />
          ), servir tout le monde oblige à brader le Premium pour trop de clients → autant
          vendre uniquement du Premium plein tarif.
        </p>

        <MenuBattle />

        <H4>Pourquoi c'est un jeu bayésien séquentiel</H4>
        <p>Récapitulons la chronologie (« timing ») du jeu, car elle définit sa structure :</p>
        <Steps
          items={[
            <>
              <JN>La Nature</JN> tire le type du voyageur (B avec proba λ, T avec proba 1 − λ).
              Le voyageur apprend son type.
            </>,
            <>
              <J1>La compagnie</J1> (non informée) propose un menu de prix.
            </>,
            <>
              <J2>Le voyageur</J2> (informé) choisit dans le menu — et ce choix révèle son type.
            </>,
          ]}
        />
        <p>
          C'est séquentiel (la compagnie joue <em>avant</em> le voyageur), et bayésien (elle
          ignore le type). La réponse du joueur informé au menu{" "}
          <strong>referme — au moins en partie — le fossé informationnel</strong> : après
          l'achat, la compagnie sait à qui elle a eu affaire. Trop tard pour ce client, mais le
          menu a été conçu pour que même cette révélation tardive rapporte.
        </p>

        <Callout variant="exemple" title="Tu le vis tous les jours">
          <p>
            Le screening est partout : billets de train 1<sup>re</sup>/2<sup>e</sup> classe,
            versions « Basic / Premium » des abonnements, files coupe-file dans les parcs
            d'attraction, éditions collector… Chaque fois, une entreprise qui ne peut pas lire
            ton consentement à payer te tend un menu pour que <em>tu</em> le lui avoues par ton
            choix.
          </p>
        </Callout>

        <Quiz
          scope="b4"
          id="q8"
          kicker="Teste-toi"
          question={
            <p>Dans le menu optimal (y = 500, x = 200), qui profite de l'asymétrie d'information ?</p>
          }
          options={[
            {
              text: <>La compagnie : elle gagne plus qu'en discrimination parfaite.</>,
              explain: (
                <>
                  C'est l'inverse : elle perd 200λ par rapport au benchmark de la discrimination
                  parfaite. Le coût de l'asymétrie est porté par la firme.
                </>
              ),
            },
            {
              text: (
                <>
                  Les voyageurs d'affaires : ils gardent un surplus de 200 (700 − 500) qu'ils
                  n'auraient pas eu si leur type était visible.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Leur information privée leur rapporte 200 de surplus : c'est la « rente
                  informationnelle » du type fort.
                </>
              ),
            },
            {
              text: <>Les touristes : ils paient l'Économie moins cher.</>,
              explain: (
                <>
                  Non : le touriste paie 200 — exactement son consentement à payer — dans les
                  deux mondes. Surplus nul partout.
                </>
              ),
            },
          ]}
          explanation={
            <p>
              En discrimination parfaite, B paierait 700 (surplus 0). Grâce à son information
              privée, il ne paie que 500 → surplus 200. Le touriste, lui, paie 200 dans les deux
              mondes (surplus 0 partout). Et la firme perd 200λ par rapport au benchmark. Nuance
              du cours : avec le menu P_B en revanche, <em>aucun</em> client ne profite de
              l'asymétrie (B paie 700, T n'est pas servi).
            </p>
          }
        />
      </Section>

      {/* ============================ § 9 ============================ */}
      <Section id="s9" kicker="§ 9" title="À maîtriser absolument">
        <p className="text-[1.1rem] italic text-muted-foreground">
          La check-list du chapitre. Si tu sais faire tout ça sans regarder tes notes, B4 est
          acquis.
        </p>

        <Callout variant="retiens" title="Les concepts (questions de cours)">
          <Ul>
            <li>
              <strong>Information incomplète</strong> : au moins un joueur ignore la fonction de
              gain d'un autre → les gains ne sont plus de notoriété commune.
            </li>
            <li>
              <strong>Type</strong> = fonction de gain d'un joueur. Chacun connaît son propre
              type.
            </li>
            <li>
              <strong>Croyance</strong> = distribution de probabilité sur les types des
              adversaires ; exogène dans ce cours.
            </li>
            <li>
              <strong>Stratégie</strong> = règle d'action complète (une action par type) ; un
              joueur à <M tex="k" /> types et <M tex="n" /> actions a <M tex="n^k" /> stratégies.
            </li>
            <li>
              <strong>ENB</strong> = meilleures réponses mutuelles, le joueur non informé
              évaluant en <em>espérance</em> selon ses croyances.
            </li>
            <li>
              <strong>Forme extensive</strong> : la Nature joue en premier ; un information set
              relie les nœuds indistinguables pour le joueur concerné.
            </li>
            <li>
              <strong>Screening</strong> : le joueur non informé propose un menu ; contraintes
              IC (chaque type choisit sa case) et IR (chaque type accepte d'acheter) ;
              l'auto-sélection referme le fossé informationnel ; le coût de l'asymétrie est
              porté par la firme.
            </li>
          </Ul>
        </Callout>

        <Callout variant="methode" title="Les savoir-faire (questions d'exercice)">
          <Ul>
            <li>Écrire les deux (ou plusieurs) matrices d'un jeu bayésien, une par type.</li>
            <li>Compter les stratégies de chaque joueur.</li>
            <li>
              Dérouler la recette ENB : fixer une stratégie du non-informé → meilleures réponses
              du joueur informé type par type → vérifier en espérance → conclure (valider{" "}
              <em>ou rejeter</em>).
            </li>
            <li>
              Écrire un ENB dans la bonne notation :
              ( action , (action si type 1 · action si type 2) ).
            </li>
            <li>
              Poser les 4 contraintes d'un screening (2 IC + 2 IR), trouver lesquelles saturent,
              en déduire le menu optimal et le profit.
            </li>
            <li>
              Comparer screening et menus pooling ; trouver le seuil de λ qui fait basculer le
              menu optimal.
            </li>
          </Ul>
        </Callout>

        <Callout variant="attention" title="Les 4 pièges qui coûtent des points">
          <Ul>
            <li>
              Écrire « la Femme joue Rouge » au lieu d'une règle complète « Rouge si T1, Blanc
              si T2 ». <strong>Une stratégie incomplète = zéro.</strong>
            </li>
            <li>
              Faire calculer une espérance au joueur <em>informé</em> sur son propre type — il
              le connaît !
            </li>
            <li>
              Oublier de vérifier l'étape retour (la meilleure réponse du non-informé) : trouver
              la réponse du joueur informé ne suffit pas à conclure « équilibre ».
            </li>
            <li>
              Dans un screening, saturer la mauvaise contrainte (par ex. monter y à 700 en
              oubliant l'IC du Business).
            </li>
          </Ul>
        </Callout>
      </Section>

      {/* ============================ § 10 ============================ */}
      <Section id="s10" kicker="§ 10" title="Exercices corrigés">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Quatre exercices, du plus guidé au plus proche de l'examen. Cherche d'abord seul·e,
          papier-crayon — la solution ne se déplie qu'à ta demande.
        </p>

        {/* ------------------------- Exercice 1 ------------------------- */}
        <ExerciseBlock
          scope="b4"
          id="ex1"
          number={1}
          title="Vocabulaire & comptage (échauffement)"
          difficulty={1}
          refs={[
            { chapter: "b4", section: "s2", label: "Types & croyances" },
            { chapter: "b4", section: "s4", label: "Stratégies = règles d'action" },
          ]}
          statement={
            <>
              <p>
                Dans un jeu bayésien, le joueur 1 n'a qu'un type possible et 3 actions. Le
                joueur 2 a 2 types possibles (« prudent » avec proba 0,7, « audacieux » avec
                proba 0,3) et 2 actions.
              </p>
              <Ul>
                <li>
                  <strong>a)</strong> Qui est le joueur informé ? Que connaît exactement le
                  joueur 1 ?
                </li>
                <li>
                  <strong>b)</strong> Combien de stratégies a chaque joueur ?
                </li>
                <li>
                  <strong>c)</strong> « (Action A, Action Gauche) » peut-il être un profil de
                  stratégies de ce jeu ?
                </li>
              </Ul>
            </>
          }
          steps={[
            {
              title: "a) Identifier le joueur informé",
              content: (
                <p>
                  Le joueur 2 est le joueur informé : il connaît son propre type. Le joueur 1 ne
                  connaît pas le type de 2 ; il connaît seulement sa croyance (0,7 / 0,3) — et,
                  comme toujours, la structure complète du jeu (actions possibles, tables de
                  gains de chaque type).
                </p>
              ),
            },
            {
              title: "b) Compter les stratégies",
              content: (
                <p>
                  Joueur 1 : un seul type → ses stratégies sont de simples actions →{" "}
                  <strong>3</strong> stratégies. Joueur 2 : <M tex="n^k = 2^2 = \mathbf{4}" />{" "}
                  stratégies (Gauche/Gauche, Gauche/Droite, Droite/Gauche, Droite/Droite selon
                  prudent/audacieux).
                </p>
              ),
            },
            {
              title: "c) Un profil valable ?",
              content: (
                <p>
                  Non ! « Action Gauche » n'est pas une stratégie valable pour le joueur 2 : il
                  faut une règle complète, par exemple « Gauche si prudent · Droite si
                  audacieux ». C'est le piège n°1 de la check-list.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Informé = celui qui connaît son type (joueur 2). Comptage : 3 stratégies pour le
              joueur 1, <M tex="2^2 = 4" /> pour le joueur 2. Et un profil de stratégies doit
              contenir des <strong>règles complètes</strong>, jamais une action isolée pour un
              joueur à plusieurs types.
            </p>
          }
        />

        {/* ------------------------- Exercice 2 ------------------------- */}
        <ExerciseBlock
          scope="b4"
          id="ex2"
          number={2}
          title="Bataille des sexes, croyance 1/4 – 3/4 (le cœur du chapitre)"
          difficulty={2}
          refs={[
            { chapter: "b4", section: "s5", label: "La bataille des sexes bayésienne" },
            { chapter: "b4", section: "s6", label: "La recette ENB" },
          ]}
          statement={
            <>
              <p>
                Reprends exactement la bataille des sexes bayésienne du cours (mêmes tables T1
                et T2), mais change la croyance de l'Homme :{" "}
                <strong>P(T1) = 1/4 et P(T2) = 3/4</strong>.
              </p>
              <Ul>
                <li>
                  <strong>a)</strong> Le profil ( Viande , (Rouge si T1 · Blanc si T2) )
                  est-il encore un ENB ?
                </li>
                <li>
                  <strong>b)</strong> Et le profil ( Poisson , (Blanc si T1 · Rouge si T2) ) ?
                </li>
              </Ul>
            </>
          }
          steps={[
            {
              title: "a) La règle de la Femme ne bouge pas — vérifions l'Homme",
              content: (
                <>
                  <p>
                    Les meilleures réponses de la Femme à Viande ne dépendent pas de la croyance
                    (elle connaît son type) : toujours (Rouge si T1 · Blanc si T2). Vérifions
                    l'Homme face à cette règle :
                  </p>
                  <MB tex="E[\text{Viande}] = 2 \times \tfrac{1}{4} + 0 \times \tfrac{3}{4} = 0{,}5 \qquad E[\text{Poisson}] = 0 \times \tfrac{1}{4} + 1 \times \tfrac{3}{4} = 0{,}75" />
                  <p>
                    <M tex="0{,}75 > 0{,}5" /> : l'Homme préfère dévier vers Poisson.{" "}
                    <strong>Ce n'est plus un ENB.</strong> (Logique : T2 étant très probable,
                    jouer Viande mène le plus souvent à la case (Viande, Blanc) = 0 pour lui.)
                  </p>
                </>
              ),
            },
            {
              title: "b) Le candidat « Poisson » tient-il mieux ?",
              content: (
                <>
                  <p>
                    Face à Poisson, la Femme répond (Blanc si T1 · Rouge si T2) — inchangé.
                    L'Homme face à cette règle :
                  </p>
                  <MB tex="E[\text{Viande}] = 0 \times \tfrac{1}{4} + 2 \times \tfrac{3}{4} = 1{,}5 \qquad E[\text{Poisson}] = 1 \times \tfrac{1}{4} + 0 \times \tfrac{3}{4} = 0{,}25" />
                  <p>
                    <M tex="1{,}5 > 0{,}25" /> : sa meilleure réponse est Viande, pas Poisson.{" "}
                    <strong>Pas un ENB non plus.</strong>
                  </p>
                </>
              ),
            },
            {
              title: "Moralité",
              content: (
                <p>
                  Aucun des deux candidats « purs » ne tient pour cette croyance — en cohérence
                  avec le widget de la § 5 : le candidat 1 exige <M tex="p \ge 1/3" />, le
                  candidat 2 exige <M tex="p \ge 2/3" />, et <M tex="p = 1/4" /> est sous les
                  deux seuils. (Un équilibre existerait en stratégies mixtes, hors du programme
                  de ce chapitre.)
                </p>
              ),
            },
          ]}
          result={
            <p>
              Ni ( Viande , (Rouge si T1 · Blanc si T2) ) ni
              ( Poisson , (Blanc si T1 · Rouge si T2) ) n'est un ENB quand P(T1) = 1/4 : dans un
              jeu bayésien, <strong>les croyances font partie du jeu</strong> — les changer peut
              détruire tous les équilibres en règles pures.
            </p>
          }
        />

        {/* ------------------------- Exercice 3 ------------------------- */}
        <ExerciseBlock
          scope="b4"
          id="ex3"
          number={3}
          title="Le duel de pub (construction complète)"
          difficulty={2}
          refs={[
            { chapter: "b4", section: "s6", label: "La recette ENB" },
            { chapter: "b1", section: "s3", label: "Stratégies dominantes" },
          ]}
          statement={
            <>
              <p>
                Deux entreprises choisissent simultanément entre <strong>Pub agressive (A)</strong>{" "}
                et <strong>Pub douce (D)</strong>. L'entreprise 1 est d'un seul type.
                L'entreprise 2 est soit « Combative » (proba 0,5) soit « Pacifique »
                (proba 0,5).
              </p>
              <MatrixPair>
                <PayoffMatrix
                  rowPlayer="Entreprise 1"
                  colPlayer="Entreprise 2"
                  rows={["A", "D"]}
                  cols={["A", "D"]}
                  payoffs={[
                    [
                      [3, 3],
                      [1, 0],
                    ],
                    [
                      [0, 4],
                      [2, 1],
                    ],
                  ]}
                  caption={
                    <>
                      Si 2 est <strong>Combative</strong> (0,5).
                    </>
                  }
                />
                <PayoffMatrix
                  rowPlayer="Entreprise 1"
                  colPlayer="Entreprise 2"
                  rows={["A", "D"]}
                  cols={["A", "D"]}
                  payoffs={[
                    [
                      [3, 0],
                      [1, 2],
                    ],
                    [
                      [0, 1],
                      [2, 3],
                    ],
                  ]}
                  caption={
                    <>
                      Si 2 est <strong>Pacifique</strong> (0,5).
                    </>
                  }
                />
              </MatrixPair>
              <Ul>
                <li>
                  <strong>a)</strong> Montre que le type Combatif et le type Pacifique ont
                  chacun une action dominante.
                </li>
                <li>
                  <strong>b)</strong> Déduis-en la règle d'action de l'entreprise 2, puis trouve
                  l'ENB. La croyance de 1 a-t-elle servi ?
                </li>
              </Ul>
            </>
          }
          steps={[
            {
              title: "a) L'action dominante de chaque type",
              content: (
                <p>
                  Type <strong>Combatif</strong> : si 1 joue A, il compare 3 (A) et 0 (D) → A ;
                  si 1 joue D, 4 (A) contre 1 (D) → A. <em>A est dominante.</em> Type{" "}
                  <strong>Pacifique</strong> : si 1 joue A, 0 (A) contre 2 (D) → D ; si 1 joue
                  D, 1 (A) contre 3 (D) → D. <em>D est dominante.</em>
                </p>
              ),
            },
            {
              title: "b) La règle de 2, puis les espérances de 1",
              content: (
                <>
                  <p>
                    Règle de 2 : <strong>(A si Combative · D si Pacifique)</strong>, quelle que
                    soit l'action de 1 (règles dominantes → meilleure réponse à tout).
                    L'entreprise 1 calcule alors ses espérances face à cette règle. Attention au
                    geste : pour E[A], on pioche la case (A, A) dans la table Combative et la
                    case (A, D) dans la table Pacifique :
                  </p>
                  <MB tex="E[A] = 3 \times 0{,}5 + 1 \times 0{,}5 = 2 \qquad E[D] = 0 \times 0{,}5 + 2 \times 0{,}5 = 1" />
                  <p>
                    <M tex="2 > 1" /> → 1 joue A.{" "}
                    <strong>ENB : ( A , (A si Combative · D si Pacifique) )</strong>.
                  </p>
                </>
              ),
            },
            {
              title: "La croyance a-t-elle servi ? (+ bonus seuil)",
              content: (
                <p>
                  Oui, la croyance a servi cette fois : contrairement au dilemme du prisonnier
                  bayésien, l'entreprise 1 n'a <em>pas</em> d'action dominante (face à A elle
                  préfère A : <M tex="3 > 0" />, mais face à D elle préfère D : <M tex="2 > 1" />
                  ). Bonus pour vérifier ta maîtrise : avec p = P(Combative) quelconque,{" "}
                  <M tex="E[A] = 3p + (1-p) = 1 + 2p" /> et <M tex="E[D] = 2(1-p) = 2 - 2p" /> ;
                  A reste la meilleure réponse tant que <M tex="p \ge 1/4" />. À p = 0,5, on est
                  confortablement au-dessus.
                </p>
              ),
            },
          ]}
          result={
            <p>
              <strong>ENB : ( A , (A si Combative · D si Pacifique) )</strong>. Le joueur
              informé joue ses actions dominantes type par type ; le joueur non informé départage
              ses actions par l'espérance — et ici, sa croyance était indispensable.
            </p>
          }
        />

        {/* ------------------------- Exercice 4 ------------------------- */}
        <ExerciseBlock
          scope="b4"
          id="ex4"
          number={4}
          title="Screening à la SNCB (type examen)"
          difficulty={2}
          refs={[{ chapter: "b4", section: "s8", label: "Le screening" }]}
          statement={
            <>
              <p>
                Une compagnie ferroviaire vend des billets de <strong>1<sup>re</sup> classe</strong>{" "}
                (coût 100 par passager) et de <strong>2<sup>e</sup> classe</strong> (coût 50).
                Deux types de voyageurs (consentements à payer) :
              </p>
              <SimpleTable
                head={["", "1re classe", "2e classe"]}
                rows={[
                  [
                    <span key="a">
                      <strong>Affaires</strong> (proportion λ)
                    </span>,
                    "500",
                    "250",
                  ],
                  [
                    <span key="l">
                      <strong>Loisir</strong> (proportion 1 − λ)
                    </span>,
                    "160",
                    "150",
                  ],
                ]}
              />
              <p>
                Soit <M tex="y" /> le prix de la 1<sup>re</sup> classe et <M tex="x" /> celui de
                la 2<sup>e</sup>.
              </p>
              <Ul>
                <li>
                  <strong>a)</strong> Écris les 4 contraintes (IC et IR) d'un menu séparateur.
                </li>
                <li>
                  <strong>b)</strong> Trouve le menu optimal (y*, x*) et le profit moyen{" "}
                  <M tex="\Pi_{\text{scr}}(\lambda)" />.
                </li>
                <li>
                  <strong>c)</strong> À partir de quelle proportion λ la compagnie
                  préfère-t-elle ne vendre que de la 1<sup>re</sup> classe à 500 (menu
                  « P_B ») ?
                </li>
              </Ul>
            </>
          }
          steps={[
            {
              title: "a) Poser les 4 contraintes",
              content: (
                <Ul>
                  <li>
                    IC Loisir (préfère la 2<sup>e</sup>) : <M tex="160 - y \le 150 - x" />
                  </li>
                  <li>
                    IC Affaires (préfère la 1<sup>re</sup>) :{" "}
                    <M tex="500 - y \ge 250 - x \iff y - x \le 250" />
                  </li>
                  <li>
                    IR Loisir : <M tex="x \le 150" />
                  </li>
                  <li>
                    IR Affaires : <M tex="y \le 500" />
                  </li>
                </Ul>
              ),
            },
            {
              title: "b) Saturer les bonnes contraintes",
              content: (
                <>
                  <p>
                    Profit :{" "}
                    <M tex="\Pi = \lambda(y - 100) + (1-\lambda)(x - 50) = (x - 50) + \lambda(y - x - 50)" />
                    . On pousse x au plafond de l'IR Loisir : <strong>x* = 150</strong>. On
                    pousse y − x au plafond de l'IC Affaires :{" "}
                    <M tex="y^* = 150 + 250 = \mathbf{400}" />. Vérifications : IR Affaires{" "}
                    <M tex="400 \le 500" /> ✓ (non saturée → surplus de 100 pour Affaires) ; IC
                    Loisir : <M tex="160 - 400 = -240 \le 0" /> ✓.
                  </p>
                  <MB tex="\Pi_{\text{scr}}(\lambda) = (150 - 50) + \lambda(400 - 150 - 50) = \mathbf{100 + 200\,\lambda}" />
                </>
              ),
            },
            {
              title: "c) Le seuil de bascule vers P_B",
              content: (
                <>
                  <p>
                    Menu P_B : prix 500, seuls les Affaires achètent, marge{" "}
                    <M tex="500 - 100 = 400" />, profit moyen <strong>400 λ</strong>. Bascule :
                  </p>
                  <MB tex="400\,\lambda > 100 + 200\,\lambda \;\iff\; 200\,\lambda > 100 \;\iff\; \boxed{\lambda > \tfrac{1}{2}}" />
                  <p>
                    Si plus d'un voyageur sur deux est un client Affaires, la compagnie
                    abandonne les voyageurs Loisir et ne vend que la 1<sup>re</sup> classe plein
                    tarif. Sinon, elle propose le menu (400, 150) et laisse chaque type
                    s'auto-sélectionner.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              Menu optimal de screening : <strong>x* = 150, y* = 400</strong>, avec{" "}
              <M tex="\Pi_{\text{scr}} = 100 + 200\lambda" /> ; la compagnie bascule sur le menu
              « 1<sup>re</sup> classe seule à 500 » dès que <M tex="\lambda > 1/2" />. Même
              logique qu'au cours : IR du type faible et IC du type fort saturées, rente
              informationnelle (ici 100) laissée au type fort.
            </p>
          }
        />

        <p className="mt-10 border-t pt-4 text-sm text-muted-foreground">
          Manuel interactif B4 — Jeux bayésiens & équilibre de Nash bayésien · ECGEB366
          (Prof. B. Decerf) · construit d'après les slides « Games of Incomplete Information.
          Bayesian Nash Equilibrium ».
        </p>
      </Section>
    </ChapterShell>
  );
}
