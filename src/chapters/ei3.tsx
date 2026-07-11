/*
 * Chapitre EI3 — Le comportement du monopole.
 *
 * Conversion pédagogique fidèle des slides « Chapitre 3 — Les comportements
 * de monopole » (cours d'économie industrielle) : la discrimination en prix
 * (1er, 2e et 3e degré) autour de l'exemple fil conducteur L & S, la
 * tarification en deux parties F + p·y, et la double marginalisation dans
 * une chaîne Amont → Aval. Tous les nombres sont ceux des slides
 * (p = 6, Y = 9, profits 54 / 108 / 96, lots 72-36 et 64-32, etc.).
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  ChecklistMaitrise,
  DemandExplorer,
  DoubleMarginExplorer,
  ElasticityExplorer,
  FirstDegreeExplorer,
  MenuLotsExplorer,
  SurplusComparison,
  TwoPartExplorer,
} from "./ei3/interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section. */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Grille de cartes de vocabulaire / définitions courtes. */
function VocabGrid({
  items,
}: {
  items: Array<{ term: ReactNode; tag?: ReactNode; body: ReactNode }>;
}) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold">
            {it.term}
            {it.tag ? (
              <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 align-middle text-[10.5px] font-bold uppercase tracking-wide text-rose-800">
                {it.tag}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Résolution numérotée pas à pas. */
function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="my-4 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="relative rounded-xl border bg-card py-3 pl-14 pr-4 shadow-sm">
          <span className="absolute left-4 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs font-extrabold text-background">
            {i + 1}
          </span>
          <div className="course-prose text-[15px]">{it}</div>
        </li>
      ))}
    </ol>
  );
}

/** Tableau avec défilement horizontal sur mobile. */
function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[560px] border-collapse text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground"
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
                <td key={j} className="px-3.5 py-2.5 text-center align-middle">
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

/** Cellule mise en évidence dans un tableau. */
function Hl({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-950">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */

export default function Chapter() {
  return (
    <ChapterShell chapterId="ei3">
      {/* ============================================================ */}
      {/* § 1 — Introduction : la discrimination en prix                */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 1" title="La discrimination en prix : de quoi parle-t-on ?">
        <p className="text-[1.15rem] leading-relaxed">
          Pourquoi ta place de cinéma coûte-t-elle moins cher avec ta carte d'étudiant ?
          Pourquoi le même vol Bruxelles–Barcelone coûte-t-il 39 € à ton voisin et 189 € à
          toi ? Pourquoi le grand pot de glace est-il proportionnellement moins cher que le
          petit ? Réponse dans ce chapitre : parce qu'un vendeur qui a du pouvoir de marché
          peut gagner <em>beaucoup</em> plus en ne faisant <strong>pas</strong> payer le même
          prix à tout le monde.
        </p>

        <p>
          Au chapitre EI1, notre monopole vendait son bien à un <strong>prix unique</strong> :
          chaque consommateur payait le même prix que les autres. C'est ce qu'on appelle la{" "}
          <strong>tarification uniforme</strong>. La question de départ de ce chapitre est
          toute simple : le monopole pourrait-il accroître ses profits en fixant des{" "}
          <strong>prix différents selon les consommateurs</strong>, c'est-à-dire en pratiquant
          de la <strong>discrimination en prix</strong> ?
        </p>

        <Callout variant="definition" title="📖 Discrimination en prix">
          <p>
            Il y a discrimination en prix si <strong>la différence de prix</strong> entre deux
            versions d'un bien <strong>ne s'explique pas par une différence de coût</strong>.
          </p>
          <p>
            Deux prix différents ne suffisent donc pas : il faut que l'écart de prix dépasse
            (ou ne reflète pas) l'écart de coût de production.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Piège : prix différents ≠ discrimination">
          <p>
            Un livre relié plus cher qu'un livre de poche, une livraison express plus chère
            qu'une livraison standard : si l'écart de prix correspond à l'écart de{" "}
            <em>coût</em>, ce n'est <strong>pas</strong> de la discrimination. En revanche, le
            tarif étudiant au cinéma est de la discrimination pure : la séance coûte
            exactement la même chose à projeter, quel que soit le spectateur. À l'examen,
            demande-toi toujours : « la différence de prix s'explique-t-elle par une
            différence de coût ? »
          </p>
        </Callout>

        <H4>Est-ce légal ?</H4>
        <p>En Europe, la discrimination par les prix :</p>
        <ul>
          <li>
            sur les <strong>marchés finals</strong> (vente aux consommateurs){" "}
            <strong>n'est pas interdite</strong> ;
          </li>
          <li>
            mais elle <strong>peut être considérée comme abusive</strong> sur un{" "}
            <strong>marché intermédiaire</strong> (vente entre entreprises) si la firme est{" "}
            <strong>dominante</strong> et si l'input vendu est <strong>important</strong> pour
            les firmes acheteuses.
          </li>
        </ul>

        <H4>Les trois degrés de discrimination</H4>
        <p>
          On distingue trois types de discrimination, classés selon l'<strong>information</strong>{" "}
          dont dispose le monopole sur ses clients. C'est LE fil rouge du chapitre : plus le
          monopole en sait, plus il extrait de surplus.
        </p>

        <VocabGrid
          items={[
            {
              term: "1er degré",
              tag: "parfaite",
              body: (
                <>
                  Le monopole <strong>connaît parfaitement</strong> chaque consommateur et sa
                  disposition à payer <em>pour chaque unité</em>. Il peut imposer à chacun des
                  quantités et des prix différents (chacun peut toutefois refuser d'acheter).
                  Exemple moderne : le prix personnalisé calculé à partir de tes données en
                  ligne.
                </>
              ),
            },
            {
              term: "2e degré",
              tag: "menus / lots",
              body: (
                <>
                  Le monopole <strong>ne reconnaît pas</strong> le client qu'il a en face de
                  lui, mais il sait que plusieurs <strong>profils</strong> existent (gros et
                  petits consommateurs). Il propose des <strong>lots</strong> — grand lot à
                  montant attractif, petit lot à autre montant — et{" "}
                  <strong>chacun choisit librement</strong>. Exemples : formats familiaux,
                  abonnements S/M/L, classes d'avion.
                </>
              ),
            },
            {
              term: "3e degré",
              tag: "par groupe",
              body: (
                <>
                  Il existe plusieurs <strong>groupes observables</strong> de consommateurs
                  (jeunes, seniors, étudiants…). Le prix est <strong>le même au sein d'un
                  groupe</strong>, quel que soit le nombre d'unités achetées, mais il{" "}
                  <strong>varie entre les groupes</strong>. Exemples : tarif étudiant, prix
                  différents entre pays.
                </>
              ),
            },
          ]}
        />

        <Callout variant="intuition" title="💡 La condition cachée : pas de revente entre clients">
          <p>
            Toutes ces stratégies exigent que les consommateurs{" "}
            <strong>ne puissent pas se revendre le bien entre eux</strong>. Sinon, celui qui
            paie 36 € les 6 unités les revendrait à celui à qui on en demande 72 € les 12, et
            toute la construction s'effondre. C'est pour ça que la discrimination marche si
            bien pour les <em>services</em> (une coupe de cheveux, un vol, une séance de
            cinéma ne se revendent pas) et moins bien pour les biens facilement transportables.
          </p>
        </Callout>

        <Quiz
          scope="ei3"
          id="q1"
          kicker="Quiz éclair · § 1"
          question={
            <p>
              Parmi ces situations, laquelle est un cas de <strong>discrimination en prix</strong>{" "}
              au sens du cours ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Un restaurant facture la livraison 5 € de plus que la vente à emporter, car
                  il paie un livreur.
                </>
              ),
              explain: (
                <>
                  Non : l'écart de prix reflète un écart de <em>coût</em> (le livreur). Pas de
                  discrimination ici.
                </>
              ),
            },
            {
              text: (
                <>
                  Un musée fait payer l'entrée 12 € aux adultes et 5 € aux étudiants, pour une
                  visite strictement identique.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : même produit, même coût (la salle est déjà là), prix différents
                  selon le groupe. C'est même un exemple type de discrimination du 3e degré —
                  par groupe observable (la carte d'étudiant).
                </>
              ),
            },
            {
              text: (
                <>
                  Une boulangerie vend la baguette tradition 20 centimes de plus que la
                  baguette ordinaire, car la farine coûte plus cher.
                </>
              ),
              explain: (
                <>
                  Non : deux produits différents avec des coûts différents. La différence de
                  prix s'explique par la différence de coût.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="ei3"
          id="q2"
          kicker="Quiz éclair · § 1"
          question={
            <p>
              Un opérateur télécom propose à <em>tous</em> ses clients le même menu : forfait
              « Mini » 5 Go pour 10 €, forfait « Maxi » 200 Go pour 25 €. Chacun choisit. De
              quel degré de discrimination s'agit-il ?
            </p>
          }
          options={[
            {
              text: <>1er degré : les prix diffèrent selon la quantité.</>,
              explain: (
                <>
                  Non — pour du 1er degré, il faudrait que l'opérateur connaisse chaque client
                  et lui <em>impose</em> son offre personnalisée. Ici, tout le monde voit le
                  même menu.
                </>
              ),
            },
            {
              text: (
                <>
                  2e degré : un menu de lots identique pour tous, et chaque client{" "}
                  s'auto-sélectionne selon son profil.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui ! L'opérateur ne sait pas qui est « gros » ou « petit » consommateur de
                  data, mais il conçoit les lots pour que chacun révèle son profil en
                  choisissant. C'est exactement le mécanisme qu'on va décortiquer au § 4.
                </>
              ),
            },
            {
              text: <>3e degré : il y a deux groupes de clients.</>,
              explain: (
                <>
                  Non — au 3e degré, le prix dépend d'une caractéristique <em>observable</em>{" "}
                  (âge, statut étudiant…). Ici, rien n'est observé : c'est le client qui se
                  classe tout seul via son choix de lot.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À retenir (§ 1)">
          <ul>
            <li>
              Discrimination = <strong>écart de prix non justifié par un écart de coût</strong>.
            </li>
            <li>
              Trois degrés = trois niveaux d'information : <strong>1er</strong> = je connais
              chaque client (offres imposées sur mesure) ; <strong>2e</strong> = je connais les
              profils mais pas les personnes (menu en libre choix) ; <strong>3e</strong> = je
              vois le groupe (prix par groupe).
            </li>
            <li>
              Condition indispensable : <strong>pas de revente</strong> entre consommateurs.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 2 — Fil conducteur : L, S et le monopole simple             */}
      {/* ============================================================ */}
      <Section id="fil-conducteur" kicker="§ 2" title="L'exemple fil conducteur : le monopole simple">
        <p className="text-[1.1rem] leading-relaxed">
          Tout le chapitre repose sur un seul exemple, qu'on va exploiter dans tous les sens.
          Prends dix minutes pour le maîtriser à fond : chaque section suivante y revient avec
          les <em>mêmes</em> nombres.
        </p>

        <H4>Deux consommateurs : Large et Small</H4>
        <p>
          Le monopole fait face à deux consommateurs : <strong>L</strong> (« Large », le gros
          acheteur) et <strong>S</strong> (« Small », le petit). Leurs demandes sont :
        </p>
        <MB tex="\text{L} : \; p = 12 - y_L \;\;\Longleftrightarrow\;\; y_L = 12 - p" />
        <MB tex="\text{S} : \; p = 12 - 2y_S \;\;\Longleftrightarrow\;\; y_S = 6 - \tfrac{1}{2}p" />
        <p>
          Lis ces droites comme des <strong>dispositions à payer</strong> : pour L, la
          première unité vaut presque 12 €, la deuxième un peu moins, etc., jusqu'à la 12e qui
          ne vaut presque plus rien. S valorise aussi la première unité à presque 12 €, mais
          sa disposition à payer chute deux fois plus vite : au-delà de 6 unités, il ne veut
          plus rien. À prix égal, L achète toujours <em>deux fois plus</em> que S.
        </p>
        <p>La demande totale s'obtient en additionnant les deux demandes (en quantités) :</p>
        <MB tex="Y = y_L + y_S = (12 - p) + \left(6 - \tfrac{1}{2}p\right) = 18 - \tfrac{3}{2}p \;\;\Longleftrightarrow\;\; p = 12 - \tfrac{2}{3}Y" />

        <Callout variant="exemple" title="🧪 Les hypothèses de travail">
          <ul>
            <li>
              <strong>Coûts marginaux nuls</strong> (<M tex="Cm = 0" />) : produire une unité
              de plus ne coûte rien. Pense à un logiciel, un siège vide dans un train qui part
              de toute façon, un accès à un parc déjà construit. Ça simplifie les calculs sans
              rien changer aux idées.
            </li>
            <li>
              <strong>Pas de revente</strong> entre L et S.
            </li>
          </ul>
        </Callout>

        <H4>Le benchmark : que fait le monopole simple ?</H4>
        <p>
          Avant de discriminer, calculons ce que rapporte la <strong>tarification uniforme</strong>{" "}
          — un seul prix pour tout le monde. C'est la recette du chapitre EI1 : recette
          marginale = coût marginal.
        </p>
        <Steps
          items={[
            <>
              <p>
                <strong>Recette totale</strong> sur la demande totale :
              </p>
              <MB tex="RT = p \cdot Y = \left(12 - \tfrac{2}{3}Y\right)Y" />
            </>,
            <>
              <p>
                <strong>Recette marginale</strong> (pente doublée, réflexe EI1) :
              </p>
              <MB tex="Rm = 12 - \tfrac{4}{3}Y" />
            </>,
            <>
              <p>
                <strong>Optimum</strong> : <M tex="Rm = Cm" /> avec <M tex="Cm = 0" /> :
              </p>
              <MB tex="12 - \tfrac{4}{3}Y = 0 \;\;\Longrightarrow\;\; Y = 9 \;\;\Longrightarrow\;\; p = 12 - \tfrac{2}{3}\times 9 = 6" />
            </>,
            <>
              <p>
                <strong>Profit</strong> (coûts nuls → profit = recette) :
              </p>
              <MB tex="\Pi = 6 \times 9 = 54\text{ €}" />
            </>,
          ]}
        />
        <p>
          Au prix <M tex="p = 6" />, chacun achète ce qu'il veut le long de sa demande :
        </p>
        <MB tex="y_L = 12 - 6 = 6 \qquad\cdot\qquad y_S = 6 - \tfrac{6}{2} = 3" />
        <p>Et les surplus des consommateurs (les triangles au-dessus du prix) valent :</p>
        <MB tex="SC_L = \frac{(12-6)\times 6}{2} = 18\text{ €} \qquad SC_S = \frac{(12-6)\times 3}{2} = 9\text{ €} \qquad SC = 18 + 9 = 27\text{ €}" />
        <FormulaBox
          tex="p = 6 \;\;\cdot\;\; Y = 9 \;\;\cdot\;\; \Pi = 54\text{ €} \;\;\cdot\;\; SC = 27\text{ €} \;\;\cdot\;\; \text{surplus total} = 81\text{ €}"
          label="Le benchmark du monopole simple — à connaître par cœur"
          caption={
            <>
              Toutes les stratégies du chapitre seront comparées à cette ligne de référence.
            </>
          }
        />

        <DemandExplorer />

        <Callout variant="attention" title="⚠️ Le gâchis du monopole simple">
          <p>
            Le surplus total (profit + surplus des consommateurs) vaut 54 + 27 = 81 €. Or il
            existe en tout <strong>108 €</strong> de gains à l'échange possibles : l'aire{" "}
            <em>complète</em> sous les deux demandes, soit 72 € chez L (triangle 12 × 12 / 2)
            et 36 € chez S (triangle 6 × 12 / 2). Le monopole simple en détruit donc{" "}
            <strong>27 €</strong> : 9 unités qui ne coûtent rien à produire et que des clients
            valorisent positivement ne sont pas vendues. Garde ce « gâteau maximal de 108 € »
            en tête : la discrimination va permettre de le récupérer… au profit du monopole.
          </p>
        </Callout>

        <Quiz
          scope="ei3"
          id="q3"
          kicker="Quiz éclair · § 2"
          question={
            <p>
              Au prix unique <M tex="p = 6" />, pourquoi le monopole ne vend-il que 9 unités
              alors que 18 unités procureraient de la valeur et ne coûtent rien à produire ?
            </p>
          }
          options={[
            {
              text: <>Parce que la capacité de production est limitée à 9 unités.</>,
              explain: (
                <>
                  Non : rien ne limite la production (le coût marginal est nul). La contrainte
                  vient de la demande, pas de l'offre.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'au prix de 6 €, les consommateurs ne <em>veulent</em> acheter que
                  9 unités : les unités suivantes valent moins de 6 € à leurs yeux.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : <M tex="y_L = 6" /> et <M tex="y_S = 3" />. La 7e unité de L ne vaut
                  que 5 € pour lui — il refuse de la payer 6 €. Pour vendre plus, il faudrait
                  baisser le prix… sur <em>toutes</em> les unités, ce qui ruinerait la marge.
                  C'est exactement ce verrou que la discrimination va faire sauter.
                </>
              ),
            },
            {
              text: <>Parce que le monopole préfère toujours vendre le moins possible.</>,
              explain: (
                <>
                  Non — le monopole veut maximiser son <em>profit</em>, pas minimiser ses
                  ventes. Ici, 9 unités à 6 € est simplement le meilleur compromis
                  marge/volume avec un prix unique.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À retenir (§ 2)">
          <ul>
            <li>
              Demandes : <M tex="y_L = 12 - p" />, <M tex="y_S = 6 - p/2" />, total{" "}
              <M tex="Y = 18 - \tfrac{3}{2}p" />.
            </li>
            <li>
              Monopole simple : <M tex="Rm = Cm" /> donne <M tex="Y = 9" />, <M tex="p = 6" />,
              profit 54 €, surplus consommateurs 27 € (18 pour L, 9 pour S), surplus total
              81 €.
            </li>
            <li>
              Potentiel maximal de l'économie : <strong>108 €</strong> — le monopole simple en
              laisse 27 € s'évaporer.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3 — La discrimination du premier degré                      */}
      {/* ============================================================ */}
      <Section id="premier-degre" kicker="§ 3" title="La discrimination du premier degré">
        <p className="text-[1.1rem] leading-relaxed">
          Imaginons maintenant le scénario rêvé du monopole : il sait <em>tout</em>. Il
          dispose d'une <strong>information parfaite</strong> sur le montant que chaque
          acheteur est prêt à payer pour chaque unité du bien, il peut fixer des prix
          différents selon les acheteurs, et les acheteurs ne peuvent pas se revendre le bien
          entre eux.
        </p>

        <Callout variant="intuition" title="💡 L'idée clé : vendre des LOTS, pas des unités">
          <p>
            Plutôt que d'afficher un prix à l'unité, le monopole fait à chaque client une
            offre <strong>« à prendre ou à laisser »</strong> : un paquet global —{" "}
            <em>tant</em> d'unités pour <em>tel</em> montant total. Le client compare le
            paquet entier à l'option « ne rien acheter ». Fini le raisonnement unité par
            unité : c'est ce qui permet d'aspirer tout le surplus.
          </p>
        </Callout>

        <H4>Construire l'offre optimale pour L, pas à pas</H4>
        <p>
          Le monopole propose à L un lot <M tex="l" /> de <M tex="y_l" /> unités pour un
          montant <M tex="m_l" /> €, et à S un lot <M tex="s" /> de <M tex="y_s" /> unités
          pour <M tex="m_s" /> €. Quels lots choisir ? Raisonnons sur L :
        </p>
        <Steps
          items={[
            <>
              <p>
                Pour un lot de taille <M tex="y_l" />, le <strong>surplus brut</strong> de L
                (toute la valeur qu'il retire des unités, <em>avant</em> paiement) est l'aire
                sous sa courbe de demande jusqu'à <M tex="y_l" />. Son surplus <strong>net</strong>{" "}
                vaut cette aire <strong>moins</strong> <M tex="m_l" />.
              </p>
            </>,
            <>
              <p>
                L accepte le lot tant que <M tex="m_l \le" /> surplus brut. Le monopole fixe
                donc <M tex="m_l" /> <strong>exactement égal</strong> au surplus brut : c'est
                le montant maximal que L accepte — et c'est du profit pur (coûts nuls).
              </p>
            </>,
            <>
              <p>
                Mais alors, <strong>agrandir le lot agrandit l'aire</strong>… donc le montant
                que L accepte de payer ! Le monopole augmente <M tex="y_l" /> tant que chaque
                unité ajoutée a une valeur positive pour L, c'est-à-dire jusqu'à{" "}
                <M tex="y_l = 12" /> :
              </p>
              <MB tex="m_l = \frac{12 \times 12}{2} = 72\text{ €}" />
            </>,
            <>
              <p>Même logique pour S, dont la demande s'annule en 6 :</p>
              <MB tex="m_s = \frac{6 \times 12}{2} = 36\text{ €}" />
            </>,
          ]}
        />

        <FirstDegreeExplorer />

        <Callout variant="definition" title="📖 L'offre optimale du 1er degré">
          <p>Le monopole propose des lots tels que :</p>
          <ul>
            <li>
              la <strong>quantité</strong> est celle qui procure le plus grand surplus{" "}
              <strong>brut</strong> possible au consommateur (on pousse jusqu'au bout de sa
              demande) ;
            </li>
            <li>
              le <strong>montant à payer</strong> est <em>égal</em> à ce surplus brut — le
              consommateur repart avec un surplus net nul, mais il accepte (il n'est pas
              perdant, juste tondu de près).
            </li>
          </ul>
          <p>
            Ici : <strong>12 unités pour 72 € à L</strong> et <strong>6 unités pour 36 € à S</strong>.
          </p>
        </Callout>

        <H4>Bilan chiffré — et il est spectaculaire</H4>
        <Tbl
          head={["", "Monopole simple", "Discrimination 1er degré"]}
          rows={[
            ["Profit", "54 €", <Hl key="p">108 € (72 + 36)</Hl>],
            ["Unités vendues", "9", <Hl key="q">18</Hl>],
            ["Surplus des consommateurs", "27 €", "0 €"],
            ["Surplus total", "81 €", <Hl key="w">108 € (le maximum !)</Hl>],
          ]}
        />
        <p>Trois conclusions officielles. La discrimination du premier degré :</p>
        <ul>
          <li>
            <strong>donne au monopole tous les gains possibles de l'échange</strong> ;
          </li>
          <li>
            <strong>ne laisse aucun surplus au consommateur</strong> ;
          </li>
          <li>
            <strong>conduit au montant socialement efficace de production</strong> : chacune
            des 18 unités vendues procure une utilité non négative et coûte zéro à produire.
            L'inefficacité du monopole a disparu ! (Le monopole simple, lui, laissait 9 unités
            « gratuites » non produites.)
          </li>
        </ul>

        <Callout variant="attention" title="⚠️ Le piège du « prix unitaire de 6 € »">
          <p>
            72 € pour 12 unités et 36 € pour 6 unités, ça fait 6 € l'unité dans les deux cas.
            Est-ce que tout ceci revient à vendre au prix unitaire de 6 € ? <strong>Non !</strong>{" "}
            Au prix unitaire de 6 €, L ne <em>voudrait</em> acheter que{" "}
            <M tex="y_L = 12 - 6 = 6" /> unités et S seulement <M tex="y_S = 3" />. Ici le
            monopole <strong>impose le lot en bloc</strong> : c'est tout (12 unités, 72 €) ou
            rien. La moyenne de 6 €/unité masque le fait que les dernières unités du lot
            valent très peu pour le client — il ne les « paie » qu'en bloc, parce que les
            premières valent très cher.
          </p>
        </Callout>

        <H4>Et si on taxait le monopole pour redistribuer ?</H4>
        <p>
          Résultat étrange : une situation où les consommateurs perdent tout (surplus 0
          contre 27) peut quand même être <em>collectivement</em> préférable, car le gâteau
          total est plus grand (108 contre 81). Si on pouvait <strong>taxer le profit du
          monopole</strong>, la discrimination du premier degré serait plus intéressante que
          le monopole simple <strong>pour tout le monde</strong>. Par exemple :
        </p>
        <ul>
          <li>
            on prend <strong>30 €</strong> au monopole et on les redistribue aux
            consommateurs ;
          </li>
          <li>
            le monopole garde 108 − 30 = <strong>78 €</strong> (contre 54 € en monopole
            simple) ;
          </li>
          <li>
            les consommateurs reçoivent 0 + 30 = <strong>30 €</strong> (contre 27 € en
            monopole simple).
          </li>
        </ul>
        <p>
          Tout le monde gagne. Moralité : <strong>efficacité</strong> (produire le bon
          volume) et <strong>répartition</strong> (qui empoche le surplus) sont deux questions
          séparées — la taxation peut corriger la seconde sans casser la première.
        </p>

        <Callout variant="exemple" title="🧪 Du cas d'école au big data">
          <p>
            Avant le commerce en ligne, cette discrimination « parfaite » était surtout
            théorique : il fallait connaître la disposition à payer de <em>chaque</em> client
            pour <em>chaque</em> unité — mission impossible pour un supermarché. Mais les
            données massives que nous laissons sur internet (historique de navigation,
            localisation, appareil utilisé, achats passés…) rendent ce type de discrimination{" "}
            <strong>de plus en plus praticable</strong> : les prix personnalisés en ligne s'en
            rapprochent chaque année davantage. Le cas limite du 1er degré n'est plus une pure
            abstraction.
          </p>
        </Callout>

        <Quiz
          scope="ei3"
          id="q4"
          kicker="Quiz éclair · § 3"
          question={
            <p>
              En discrimination du 1er degré, le monopole propose à L « 12 unités pour 72 € ».
              Pourquoi L accepte-t-il, alors qu'au prix unitaire équivalent (6 €) il n'aurait
              acheté que 6 unités ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Parce que le lot est « à prendre ou à laisser » : L compare 72 € à la valeur{" "}
                  <em>totale</em> des 12 unités (72 €), pas unité par unité.
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est ça. La valeur totale des 12 unités pour L est l'aire complète sous sa
                  demande : 72 €. Payer 72 € le laisse à surplus net nul — il est indifférent,
                  donc il accepte. Le raisonnement marginal « la 12e unité vaut presque 0,
                  pourquoi la payer 6 ? » ne s'applique plus, car on ne peut pas acheter les
                  unités séparément.
                </>
              ),
            },
            {
              text: <>Parce que L fait une erreur de calcul.</>,
              explain: (
                <>
                  Non, L est parfaitement rationnel : 72 € contre 72 € de valeur, il n'est pas
                  perdant. Le monopole a juste calibré le montant pile à sa disposition à
                  payer totale.
                </>
              ),
            },
            {
              text: <>Parce que le monopole le menace de ne plus jamais lui vendre.</>,
              explain: (
                <>
                  Aucune menace nécessaire : l'offre en bloc suffit. L accepte car son surplus
                  net est non négatif (exactement zéro).
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À retenir (§ 3)">
          <ul>
            <li>
              1er degré = offres personnalisées <strong>à prendre ou à laisser</strong> :
              quantité qui maximise le surplus brut, montant = tout ce surplus.
            </li>
            <li>
              Résultats : profit <strong>108 €</strong>, surplus consommateurs{" "}
              <strong>0</strong>, production <strong>efficace</strong> (18 unités).
            </li>
            <li>
              Avec une taxe redistributive (ex. 30 €), tout le monde peut y gagner par rapport
              au monopole simple : 78 € contre 54 € et 30 € contre 27 €.
            </li>
            <li>
              Exige une information énorme — hier irréaliste, aujourd'hui rapprochée par le
              big data.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4 — La discrimination du deuxième degré                     */}
      {/* ============================================================ */}
      <Section id="deuxieme-degre" kicker="§ 4" title="La discrimination du deuxième degré">
        <p className="text-[1.1rem] leading-relaxed">
          Redescendons sur Terre : en pratique, le monopole <strong>sait</strong> qu'il existe
          deux types de consommateurs (L et S)… mais il est <strong>incapable de les
          reconnaître</strong> quand ils se présentent. Impossible, donc, d'imposer à chacun
          « son » lot. La parade : proposer <strong>le même menu de lots à tout le monde</strong>{" "}
          et laisser chacun <strong>choisir librement</strong> — en concevant les lots pour que
          le gros consommateur choisisse le gros lot et le petit, le petit. Toute la
          difficulté (et toute la beauté) est là.
        </p>

        <Callout variant="definition" title="📖 Le dispositif du 2e degré">
          <p>Le monopole propose deux lots :</p>
          <ul>
            <li>
              un lot <M tex="l" /> de <M tex="y_l" /> unités pour <M tex="m_l" /> € ;
            </li>
            <li>
              un lot <M tex="s" /> de <M tex="y_s" /> unités pour <M tex="m_s" /> €.
            </li>
          </ul>
          <p>
            <strong>Différence cruciale avec le 1er degré :</strong> là-bas, le monopole{" "}
            <em>imposait</em> son lot à chaque client identifié. Ici, tous les consommateurs
            voient les mêmes lots et chacun prend <em>celui qu'il préfère</em> — y compris,
            éventuellement, celui qui ne lui était pas « destiné »…
          </p>
        </Callout>

        <H4>Essai n° 1 — recopier le 1er degré : échec</H4>
        <p>
          Première idée naïve : proposer les lots du 1er degré,{" "}
          <M tex="[m_l = 72\text{ €} ;\, y_l = 12]" /> et <M tex="[m_s = 36\text{ €} ;\, y_s = 6]" />, en
          espérant que L choisisse le lot l et S le lot s. Malheureusement pour le monopole,{" "}
          <strong>L va choisir le lot s !</strong> Vérifions :
        </p>
        <Steps
          items={[
            <>
              <p>
                S'il achète le lot <M tex="l" /> : surplus net de L = <M tex="72 - 72 = 0" />.
              </p>
            </>,
            <>
              <p>
                S'il achète le lot <M tex="s" /> (6 unités pour 36 €) : la valeur des 6
                premières unités <em>pour L</em> est l'aire sous <em>sa</em> demande jusqu'à
                6 — un rectangle de hauteur 6 plus un triangle :
              </p>
              <MB tex="\underbrace{6 \times 6}_{\text{rectangle}} + \underbrace{\tfrac{(12-6)\times 6}{2}}_{\text{triangle}} - 36 = 36 + 18 - 36 = 18\text{ €}" />
            </>,
            <>
              <p>
                Verdict : 18 € de surplus avec le lot s contre 0 € avec le lot l →{" "}
                <strong>L prend le petit lot</strong>. Le monopole ne récolte que 36 + 36 =
                72 €. La discrimination du 1er degré n'est <strong>pas reproductible</strong> :
                le gros consommateur se déguise en petit.
              </p>
            </>,
          ]}
        />

        <Callout variant="intuition" title="💡 Le vrai problème : une contrainte d'incitation">
          <p>
            Le lot destiné à S est une <strong>bonne affaire</strong> pour L : les 6 unités
            valent 54 € à ses yeux (contre 36 € pour S), et on les lui vend 36 €. Pour que le
            menu fonctionne, il faut que chaque type choisisse « son » lot de son plein gré.
            La condition « L préfère le lot l au lot s » s'appelle la{" "}
            <strong>contrainte d'incitation</strong> (ou d'auto-sélection). Ce problème
            d'information — faire révéler son type à quelqu'un qui a intérêt à le cacher — est
            exactement celui du <em>screening</em> que tu as croisé en théorie des jeux.
          </p>
          <p className="mt-2">
            <TheoryRef
              course="strategies"
              chapter="b4"
              section="s8"
              label="Le screening : faire parler l'information"
            />
          </p>
        </Callout>

        <H4>Deux solutions possibles</H4>
        <p>Le monopole a deux leviers pour empêcher L de prendre le lot de S :</p>
        <ul>
          <li>
            <strong>Solution 1 — baisser le prix du gros lot.</strong> Pour que L choisisse le
            lot l, il faut lui y garantir au moins les 18 € qu'il obtiendrait avec le lot s :{" "}
            <M tex="m_l = 72 - 18 = 54\text{ €}" />. Menu : <M tex="[54\text{ €} ;\, 12]" /> et{" "}
            <M tex="[36\text{ €} ;\, 6]" />. L prend le lot l, S le lot s, profit = 54 + 36 ={" "}
            <strong>90 €</strong>. Mieux que 72 €… mais <strong>pas optimal</strong>.
          </li>
          <li>
            <strong>Solution 2 — rendre le lot s moins attrayant pour L</strong>, en{" "}
            <strong>réduisant sa quantité</strong> : L aime les grandes quantités, un lot
            rachitique le tente beaucoup moins. C'est la clé de l'optimum.
          </li>
        </ul>
        <p>
          Nous allons montrer que le monopole a intérêt à proposer le menu suivant :{" "}
          <strong>lot l = 12 unités pour 64 €</strong> (quantité identique au 1er degré, mais
          montant plus faible) et <strong>lot s = 4 unités pour 32 €</strong> (quantité{" "}
          <em>et</em> montant plus faibles qu'au 1er degré) — pour un profit de{" "}
          <strong>96 €</strong>.
        </p>

        <H4>La dérivation complète, ligne par ligne</H4>
        <p>
          Le monopole propose un lot de <strong>12 unités à <M tex="m_l" /> €</strong> et un
          lot de <strong><M tex="y_S" /> unités à <M tex="m_S" /> €</strong>. Il reste à
          trouver <M tex="m_l" />, <M tex="m_S" /> et <M tex="y_S" />.
        </p>
        <Steps
          items={[
            <>
              <p>
                <strong>Que vaut le lot s aux yeux de L ?</strong> S'il achète le lot l, L a un
                surplus net <M tex="72 - m_l" />. S'il achète le lot s, il obtient l'aire sous{" "}
                <em>sa</em> demande jusqu'à <M tex="y_S" /> (rectangle de hauteur{" "}
                <M tex="12 - y_S" /> plus petit triangle), moins <M tex="m_S" /> :
              </p>
              <MB tex="(12 - y_S)\,y_S + \tfrac{1}{2}\bigl(12 - (12 - y_S)\bigr)y_S - m_S = 12y_S - \tfrac{1}{2}y_S^2 - m_S" />
            </>,
            <>
              <p>
                <strong>Contrainte d'incitation de L</strong> : L achète le lot l si
              </p>
              <MB tex="72 - m_l \;\ge\; 12y_S - \tfrac{1}{2}y_S^2 - m_S \;\;\Longleftrightarrow\;\; m_l \;\le\; 72 - 12y_S + \tfrac{1}{2}y_S^2 + m_S" />
              <p>
                Le monopole veut encaisser le plus possible : il fixe <M tex="m_l" />{" "}
                <strong>au maximum autorisé</strong> par cette contrainte :
              </p>
              <MB tex="m_l = 72 - 12y_S + \tfrac{1}{2}y_S^2 + m_S" />
            </>,
            <>
              <p>
                <strong>Que fait S ?</strong> Il achète le lot s si son surplus net est non
                négatif. Son surplus brut jusqu'à <M tex="y_S" /> (aire sous la demande de S :
                rectangle de hauteur <M tex="12 - 2y_S" /> plus triangle) vaut :
              </p>
              <MB tex="(12 - 2y_S)\,y_S + \tfrac{1}{2}\bigl(12 - (12 - 2y_S)\bigr)y_S = 12y_S - y_S^2" />
              <p>
                Le monopole sature cette <strong>contrainte de participation</strong> :
              </p>
              <MB tex="m_S = 12y_S - y_S^2" />
            </>,
            <>
              <p>
                <strong>On remplace</strong> <M tex="m_S" /> dans l'expression de{" "}
                <M tex="m_l" /> :
              </p>
              <MB tex="m_l = 72 - 12y_S + \tfrac{1}{2}y_S^2 + 12y_S - y_S^2 = 72 - \tfrac{1}{2}y_S^2" />
            </>,
            <>
              <p>
                <strong>Le profit</strong> (coûts nuls) vaut la somme des deux montants :
              </p>
              <MB tex="\Pi = m_l + m_S = 72 - \tfrac{1}{2}y_S^2 + 12y_S - y_S^2 = 72 + 12y_S - \tfrac{3}{2}y_S^2" />
            </>,
            <>
              <p>
                <strong>Condition de premier ordre</strong> en <M tex="y_S" /> :
              </p>
              <MB tex="\frac{d\Pi}{dy_S} = 12 - 3y_S = 0 \;\;\Longrightarrow\;\; y_S^* = 4" />
              <p>D'où les montants :</p>
              <MB tex="m_l = 72 - \tfrac{1}{2}\times 16 = 64\text{ €} \qquad m_S = 12\times 4 - 16 = 32\text{ €} \qquad \Pi = 96\text{ €}" />
            </>,
          ]}
        />

        <p>
          Vérifions le libre choix : L prend le lot l et garde un surplus{" "}
          <M tex="72 - 64 = 8\text{ €}" /> (exactement ce que lui rapporterait le lot s :{" "}
          <M tex="12\times4 - \tfrac{16}{2} - 32 = 8" /> — la contrainte d'incitation est
          saturée). S prend le lot s et a un surplus nul. Et 96 € font mieux que les 90 € de
          la solution 1.
        </p>

        <Callout variant="definition" title="📖 La rente d'information">
          <p>
            Les 8 € que L conserve s'appellent une <strong>rente d'information</strong> :
            c'est le prix que le monopole doit payer pour que L accepte de{" "}
            <em>révéler son type</em> en choisissant le gros lot. Elle vient tout droit de
            l'avantage informationnel de L : lui seul sait qu'il est un gros consommateur, et
            le lot de S lui offre une porte de sortie. Pour réduire cette rente, le monopole{" "}
            <strong>déforme le petit lot vers le bas</strong> (4 unités au lieu de 6) : moins
            le lot s est intéressant pour L, moins il faut lui concéder pour le garder sur le
            lot l.
          </p>
        </Callout>

        <MenuLotsExplorer />

        <H4>Comparons les trois régimes</H4>
        <Tbl
          head={["Régime", "Profit", "Surplus consommateurs", "Surplus total"]}
          rows={[
            ["Monopole simple", "54 €", "27 €", "81 €"],
            ["Discrimination 1er degré", "108 €", "0 €", "108 €"],
            [
              <strong key="t">Discrimination 2e degré</strong>,
              <Hl key="p">96 €</Hl>,
              <Hl key="c">8 € (la rente de L)</Hl>,
              <Hl key="w">104 €</Hl>,
            ],
          ]}
        />
        <p>La discrimination du second degré est donc :</p>
        <ul>
          <li>
            <strong>moins efficace</strong> que celle du premier degré (surplus total 104 €
            contre 108 € : les 4 € manquants viennent du rationnement du petit lot, 4 unités
            au lieu de 6) ;
          </li>
          <li>
            <strong>mais plus favorable au consommateur</strong> (8 € contre 0) ;
          </li>
          <li>
            et surtout, elle demande <strong>beaucoup moins d'information</strong> : connaître
            les profils suffit, pas besoin de reconnaître les personnes.
          </li>
        </ul>
        <p>
          Même remarque de redistribution qu'au 1er degré : si on taxait 30 € au monopole pour
          les redistribuer, il garderait 96 − 30 = 66 € (contre 54 €) et les consommateurs
          auraient 8 + 30 = 38 € (contre 27 €) — de nouveau tout le monde y gagne par rapport
          au monopole simple.
        </p>

        <SurplusComparison />

        <Callout variant="exemple" title="🧪 Le 2e degré est partout autour de toi">
          <ul>
            <li>
              <strong>Prix réduits sur les gros volumes</strong> : le pack de 12 moins cher à
              l'unité que le pack de 4 — et des petits conditionnements volontairement peu
              avantageux pour pousser les gros clients vers les gros lots.
            </li>
            <li>
              <strong>Quantité remplacée par la qualité</strong> : deux contrats — qualité
              faible à prix faible, qualité élevée à prix très élevé. La qualité du premier
              est <em>délibérément dégradée</em> pour que les clients exigeants n'y touchent
              pas : versions « lite » de logiciels aux fonctions bridées, classes économique
              et affaires dans les avions et les trains.
            </li>
            <li>
              <strong>L'exemple historique du cours</strong> : au 19e siècle, la 3e classe des
              trains était parfois identique à la 2e… <em>mais sans le toit rudimentaire</em>,
              pour une différence de prix très importante. Enlever le toit ne coûtait rien —
              c'était le « rationnement du petit lot » version 1850 : rendre l'offre bon
              marché assez inconfortable pour que les voyageurs aisés paient la 2e classe.
            </li>
          </ul>
        </Callout>

        <Quiz
          scope="ei3"
          id="q5"
          kicker="Quiz éclair · § 4"
          question={
            <p>
              Avec le menu « 1er degré » <M tex="[72\text{ €} ; 12]" /> et <M tex="[36\text{ €} ; 6]" />{" "}
              en libre choix, pourquoi L choisit-il le lot destiné à S ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Parce que le lot s lui laisse un surplus net de 18 € (54 € de valeur pour
                  36 €), contre 0 € avec le lot l.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : les 6 unités du lot s valent 36 + 18 = 54 € <em>pour L</em> (aire
                  sous sa demande jusqu'à 6). Payées 36 €, elles laissent 18 € de surplus. Le
                  lot l, calibré pour tout extraire, laisse 0. Un L rationnel se fait passer
                  pour un petit consommateur.
                </>
              ),
            },
            {
              text: <>Parce que L ne peut pas se permettre de payer 72 €.</>,
              explain: (
                <>
                  Non, aucun problème de budget dans le modèle : L <em>accepterait</em> le lot
                  à 72 € s'il n'y avait pas mieux. Le problème est que le lot s est une
                  meilleure affaire.
                </>
              ),
            },
            {
              text: <>Parce que 6 unités suffisent à saturer les besoins de L.</>,
              explain: (
                <>
                  Non : la demande de L reste positive jusqu'à 12 unités. Il valorise vraiment
                  les unités 7 à 12 — mais pas assez pour compenser l'écart de montant entre
                  les deux lots.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="ei3"
          id="q6"
          kicker="Quiz éclair · § 4"
          question={
            <p>
              Pourquoi le monopole réduit-il la taille du petit lot à <M tex="y_S = 4" /> (au
              lieu de 6), alors que ça lui fait <em>perdre</em> des ventes rentables sur S ?
            </p>
          }
          options={[
            {
              text: <>Parce que produire 6 unités pour S coûterait trop cher.</>,
              explain: (
                <>
                  Non : les coûts sont nuls ! Le sacrifice sur S n'a rien à voir avec les
                  coûts de production.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'un lot s plus petit est moins tentant pour L, ce qui réduit la
                  rente d'information (<M tex="y_S^2/2" />) à lui abandonner — et permet de
                  monter <M tex="m_l" />.
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est le cœur du 2e degré. À la marge, passer de 6 à 4 unités fait perdre un
                  peu de recette sur S, mais fait gagner davantage sur L (dont la rente fond
                  de 18 € à 8 €). L'arbitrage optimal s'arrête à <M tex="12 - 3y_S = 0" />,
                  soit <M tex="y_S = 4" />.
                </>
              ),
            },
            {
              text: <>Parce que S ne veut de toute façon pas plus de 4 unités.</>,
              explain: (
                <>
                  Faux : S valorise positivement les unités jusqu'à 6. Il est bel et bien{" "}
                  <em>rationné</em> — c'est une distorsion délibérée, et c'est elle qui coûte
                  4 € de surplus total à la société.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À retenir (§ 4)">
          <ul>
            <li>
              2e degré = <strong>menu de lots identique pour tous</strong> + libre choix →
              problème d'<strong>auto-sélection</strong>.
            </li>
            <li>
              On ne peut pas recopier le 1er degré : L préfère le lot de S (surplus 18 € au
              lieu de 0).
            </li>
            <li>
              Optimum : saturer la participation de S (<M tex="m_S = 12y_S - y_S^2" />),
              saturer l'incitation de L (<M tex="m_l = 72 - \tfrac{1}{2}y_S^2" />), puis
              maximiser <M tex="\Pi = 72 + 12y_S - \tfrac{3}{2}y_S^2" /> →{" "}
              <strong><M tex="y_S = 4" />, lots (12 ; 64 €) et (4 ; 32 €), profit 96 €</strong>.
            </li>
            <li>
              Deux distorsions signature : <strong>le petit lot est rationné</strong> et{" "}
              <strong>le gros client garde une rente d'information</strong> (8 €).
            </li>
            <li>Classement des profits : 108 (1er) ; 96 (2e) ; 54 (simple).</li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 5 — La discrimination du troisième degré                    */}
      {/* ============================================================ */}
      <Section id="troisieme-degre" kicker="§ 5" title="La discrimination du troisième degré">
        <p className="text-[1.1rem] leading-relaxed">
          Dernier degré, le plus courant dans la vraie vie : le monopole{" "}
          <strong>identifie clairement des groupes</strong> d'acheteurs — étudiants et
          non-étudiants, marché belge et marché français… — et met en vente des quantités
          spécifiques à chaque groupe. Au sein d'un groupe, tout le monde paie le même prix
          quel que soit le volume acheté ; entre groupes, les prix diffèrent.
        </p>

        <Callout variant="intuition" title="💡 L'idée : deux monopoles en un">
          <p>
            Puisque les groupes sont étanches (pas de revente, appartenance vérifiable — une
            carte d'étudiant, un passeport), le monopole{" "}
            <strong>agit comme s'il détenait un monopole séparé sur chaque marché</strong>. Sur
            chacun, il rejoue la mécanique du chapitre EI1. La seule chose qui relie les deux
            marchés, ce sont les <strong>coûts</strong> : les unités vendues aux deux groupes
            sortent de la même usine.
          </p>
        </Callout>

        <H4>Le programme du monopole</H4>
        <p>
          Notons <M tex="y_1" /> la quantité offerte sur le marché 1 (demande inverse{" "}
          <M tex="p_1(y_1)" />) et <M tex="y_2" /> celle offerte sur le marché 2 (demande
          inverse <M tex="p_2(y_2)" />). Les coûts s'écrivent <M tex="c(y_1 + y_2)" /> — c'est
          bien la production <em>totale</em> qui coûte. Le profit :
        </p>
        <FormulaBox
          tex="\Pi(y_1, y_2) = p_1(y_1)\,y_1 + p_2(y_2)\,y_2 - c(y_1 + y_2)"
          label="Profit du monopole discriminant au 3e degré"
        />
        <p>
          On maximise par rapport à <M tex="y_1" /> et <M tex="y_2" />. En dérivant (et en
          notant que <M tex="\tfrac{d(y_1+y_2)}{dy_1} = 1" />) :
        </p>
        <MB tex="\frac{d\Pi}{dy_1} = \underbrace{\frac{d}{dy_1}\bigl(p_1(y_1)y_1\bigr)}_{Rm_1} - \underbrace{\frac{dc}{d(y_1+y_2)}}_{cm} = 0 \qquad\cdot\qquad \frac{d\Pi}{dy_2} = Rm_2 - cm = 0" />
        <FormulaBox
          tex="Rm_1(y_1) = Rm_2(y_2) = cm"
          label="Condition d'optimum — l'équation d'arbitrage"
          caption={
            <>
              Les recettes marginales doivent être égales entre les marchés, et égales au coût
              marginal de production.
            </>
          }
        />

        <Callout variant="intuition" title="💡 Pourquoi « équation d'arbitrage » ?">
          <p>
            Suppose que <M tex="Rm_1" /> soit supérieure à <M tex="Rm_2" /> : la dernière
            unité vendue au groupe 1 rapporte plus que la dernière vendue au groupe 2. Alors{" "}
            <strong>transférer une unité du marché 2 vers le marché 1</strong> accroîtrait la
            recette totale <em>sans changer les coûts</em> (on produit le même total) — donc
            augmenterait le profit. Tant qu'un tel transfert rentable existe, on n'est pas à
            l'optimum. À l'optimum, plus rien à arbitrer : <M tex="Rm_1 = Rm_2" />.
          </p>
        </Callout>

        <H4>Qui paie le plus cher ? Le verdict des élasticités</H4>
        <p>
          Rappelle-toi la règle de tarification du monopole (chapitre EI1) : avec un coût
          marginal constant <M tex="k" />,
        </p>
        <FormulaBox
          tex="p = \frac{k}{1 - \frac{1}{\varepsilon}} \qquad \text{où } \varepsilon = -\frac{p}{y}\frac{dy}{dp} \text{ est l'élasticité de la demande}"
          label="Règle de prix du monopole (rappel EI1)"
        />
        <p>
          Ici, la firme agit comme deux monopoles sur deux marchés : chaque groupe se voit
          appliquer cette règle avec <em>sa</em> propre élasticité <M tex="\varepsilon_1" /> ou{" "}
          <M tex="\varepsilon_2" />. En comparant :
        </p>
        <MB tex="p_1 = \frac{k}{1-\frac{1}{\varepsilon_1}} \;<\; p_2 = \frac{k}{1-\frac{1}{\varepsilon_2}} \;\;\Longleftrightarrow\;\; 1 - \frac{1}{\varepsilon_2} \;<\; 1 - \frac{1}{\varepsilon_1} \;\;\Longleftrightarrow\;\; \varepsilon_1 > \varepsilon_2" />
        <p>
          Conclusion : le monopole fixe le <strong>prix le plus faible sur le marché le plus
          élastique</strong> — celui où les quantités vendues réagissent le plus négativement
          au prix. Dit autrement : <strong>c'est le groupe qui modifie le plus son
          comportement suite à un changement de prix qui bénéficie du prix le plus faible</strong>.
          Et ce raisonnement tient même si les coûts marginaux ne sont pas constants.
        </p>

        <ElasticityExplorer />

        <Callout variant="exemple" title="🧪 Relis le monde avec cette grille">
          <p>
            Tarif étudiant au cinéma : les étudiants ont un budget serré et plein
            d'alternatives (streaming, sorties gratuites) → demande très élastique → prix bas.
            Les adultes actifs, moins sensibles au prix, paient plein tarif. Même logique pour
            un médicament vendu à des prix différents selon les pays, ou les tarifs seniors
            dans les transports. Le vendeur ne « fait pas un cadeau » aux étudiants : il
            maximise froidement son profit, groupe par groupe, via{" "}
            <M tex="Rm_1 = Rm_2 = cm" />.
          </p>
        </Callout>

        <Quiz
          scope="ei3"
          id="q7"
          kicker="Quiz éclair · § 5"
          question={
            <p>
              Un monopole discrimine entre deux groupes avec un coût marginal constant. Le
              groupe A a une élasticité de 4, le groupe B de 1,5. Que prédit la théorie ?
            </p>
          }
          options={[
            {
              text: (
                <>Le groupe A paie plus cher : il « consomme plus », donc on le fait payer.</>
              ),
              explain: (
                <>
                  Non — l'élasticité ne mesure pas le volume consommé, mais la{" "}
                  <em>sensibilité au prix</em>. Et c'est le groupe le <em>moins</em> sensible
                  qui paie le plus.
                </>
              ),
            },
            {
              text: (
                <>
                  Le groupe B paie plus cher : sa demande est moins élastique, il « encaisse »
                  les hausses de prix sans trop réduire ses achats.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : <M tex="\varepsilon_A = 4 > \varepsilon_B = 1{,}5" /> implique{" "}
                  <M tex="p_A < p_B" />. Avec k = 3 par exemple : p_A = 3/(1 − 1/4) = 4 € et
                  p_B = 3/(1 − 1/1,5) = 9 €. Le groupe captif paie le triple… pour le même
                  bien.
                </>
              ),
            },
            {
              text: (
                <>
                  Les deux paient le même prix : les recettes marginales doivent être égales.
                </>
              ),
              explain: (
                <>
                  Piège subtil ! Ce sont bien les <em>recettes marginales</em> qui s'égalisent
                  (<M tex="Rm_1 = Rm_2 = cm" />), pas les <em>prix</em>. Des Rm égales avec des
                  élasticités différentes donnent justement des prix différents.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À retenir (§ 5)">
          <ul>
            <li>
              3e degré = un prix par <strong>groupe observable</strong> ; le monopole se
              comporte comme deux monopoles reliés par les coûts.
            </li>
            <li>
              Optimum : <strong><M tex="Rm_1 = Rm_2 = cm" /></strong> (équation d'arbitrage —
              sinon un transfert d'unités entre marchés augmenterait le profit).
            </li>
            <li>
              Prix : <M tex="p = k/(1 - 1/\varepsilon)" /> sur chaque marché →{" "}
              <strong>le groupe le moins élastique paie le plus cher</strong> (
              <M tex="p_1 < p_2 \Leftrightarrow \varepsilon_1 > \varepsilon_2" />).
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 6 — La tarification en deux parties                         */}
      {/* ============================================================ */}
      <Section id="deux-parties" kicker="§ 6" title="La tarification en deux parties">
        <p className="text-[1.1rem] leading-relaxed">
          Changement d'outil. Jusqu'ici le client payait un montant pour un lot. Autre
          stratégie très répandue : lui faire payer <strong>deux fois</strong> — un droit
          d'entrée, puis chaque unité consommée.
        </p>

        <Callout variant="definition" title="📖 Tarification en deux parties">
          <p>Une tarification en deux parties se compose :</p>
          <ul>
            <li>
              d'un <strong>forfait fixe</strong> <M tex="F" /> (l'abonnement, le droit
              d'entrée) ;
            </li>
            <li>
              d'un <strong>prix</strong> <M tex="p" /> pour chaque unité achetée.
            </li>
          </ul>
          <p>
            Le coût d'achat de <M tex="y" /> unités est alors <M tex="F + p\,y" />. Exemples :
            certains parcs d'attractions (entrée + attractions payantes), les abonnements
            téléphoniques (abonnement + prix des communications)…
          </p>
        </Callout>

        <H4>Comment fixer F et p ? Raisonnons en deux temps</H4>
        <Steps
          items={[
            <>
              <p>
                <strong>Le forfait maximal.</strong> En achetant au prix unitaire{" "}
                <M tex="p" />, le consommateur espère réaliser un{" "}
                <strong>surplus hors forfait</strong> <M tex="SC" /> (le triangle entre sa
                demande et le prix). Il accepte de payer le forfait tant que{" "}
                <M tex="SC \ge F" />. Le monopole capte donc le maximum en fixant :
              </p>
              <MB tex="F = SC" />
              <p>
                Tu reconnais la manœuvre du 1er degré : saturer la condition d'acceptation du
                client.
              </p>
            </>,
            <>
              <p>
                <strong>Le bon prix unitaire.</strong> Si <M tex="F = SC" />, faut-il fixer{" "}
                <M tex="p" /> au-dessus du coût marginal pour marginer sur les ventes ?{" "}
                <strong>Non !</strong> Le profit total vaut « profit des ventes + forfait »,
                c'est-à-dire <M tex="SP + SC" />. Or ce total est exactement l'aire entre la
                demande et la courbe de coût marginal <em>jusqu'à la quantité vendue</em>.
                Toute marge au-dessus de <M tex="Cm" /> réduit la quantité achetée et ampute
                ce total d'un triangle. En baissant <M tex="p" /> jusqu'à <M tex="Cm" />, on
                récupère un <strong>profit additionnel</strong> : ce que la marge abandonne,
                le forfait le reprend — et davantage.
              </p>
            </>,
          ]}
        />

        <FormulaBox
          tex="p^* = Cm \qquad\cdot\qquad F^* = \text{surplus (brut) du consommateur en } p = Cm"
          label="La solution optimale du tarif en deux parties"
          caption={
            <>
              Le prix unitaire ne sert pas à marginer — il sert à mettre le gâteau à sa taille
              maximale. C'est le forfait qui rafle le gâteau.
            </>
          }
        />

        <TwoPartExplorer />

        <Callout variant="retiens" title="⭐ Le résultat officiel (et ses conditions)">
          <p>
            Le monopole maximise ses profits avec un <strong>prix unitaire égal au coût
            marginal</strong> et un <strong>forfait égal au surplus brut du consommateur</strong>.
            La solution est <strong>efficace</strong> — la quantité produite est la quantité
            socialement optimale — mais le monopole <strong>s'accapare tous les gains de
            l'échange</strong> et ne laisse rien aux consommateurs. Attention, ceci n'est vrai
            que si :
          </p>
          <ul>
            <li>
              les <strong>consommateurs sont identiques</strong> (sinon un seul forfait ne
              peut pas coller à tous les surplus — on retombe sur des problèmes de type 2e
              degré) ;
            </li>
            <li>
              les <strong>coûts de perception</strong> de la double tarification ne sont pas
              trop élevés (facturer deux composantes a un coût administratif).
            </li>
          </ul>
        </Callout>

        <Callout variant="intuition" title="💡 Déjà vu ? C'est le contrat de franchise !">
          <p>
            « Un droit fixe pour entrer, puis chaque unité au coût marginal » : c'est
            exactement la logique du contrat de franchise du cours de stratégies — l'agent
            paie un forfait au principal, devient <em>residual claimant</em>, et le forfait
            extrait tout le surplus. Deux habits différents pour une seule et même idée :{" "}
            <strong>ne jamais distordre la marge, tout prendre par le fixe.</strong>
          </p>
          <p className="mt-2">
            <TheoryRef
              course="strategies"
              chapter="b2"
              section="sec-cas3"
              label="B2 · La franchise et le residual claimant"
            />
          </p>
        </Callout>

        <Quiz
          scope="ei3"
          id="q8"
          kicker="Quiz éclair · § 6"
          question={
            <p>
              Un parc d'attractions applique un tarif en deux parties à des visiteurs
              identiques. Le coût marginal d'un tour de manège est de 1 €. Que recommande la
              théorie ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Entrée gratuite et manèges chers : c'est sur les tours qu'on fait la marge.
                </>
              ),
              explain: (
                <>
                  C'est l'inverse ! Des manèges chers dissuadent des tours qui valaient plus
                  que 1 € aux yeux des visiteurs : le gâteau rétrécit, et le forfait d'entrée
                  qu'ils acceptent de payer fond d'autant plus.
                </>
              ),
            },
            {
              text: (
                <>
                  Manèges à 1 € (= Cm) et un droit d'entrée qui capte tout le surplus restant.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : <M tex="p = Cm" /> maximise le surplus créé par la visite, et{" "}
                  <M tex="F = SC" /> le transfère intégralement au parc. Toute autre
                  combinaison laisse de la valeur sur la table.
                </>
              ),
            },
            {
              text: (
                <>
                  Manèges au prix de monopole (<M tex="Rm = Cm" />), plus une petite entrée
                  symbolique.
                </>
              ),
              explain: (
                <>
                  Non : la logique « Rm = Cm » vaut pour un monopole <em>sans</em> forfait.
                  Dès qu'un forfait existe, marginer sur les unités devient contre-productif :
                  chaque euro de marge détruit plus de forfait qu'il ne rapporte.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 7 — La double marginalisation                               */}
      {/* ============================================================ */}
      <Section id="double-marge" kicker="§ 7" title="La double marginalisation">
        <p className="text-[1.1rem] leading-relaxed">
          Dernière pièce du chapitre — et un résultat qui va à contre-courant de tout ce qu'on
          croit savoir sur la concurrence. Dans l'analyse des oligopoles, augmenter le nombre
          de firmes réduit les prix, augmente le surplus des consommateurs et baisse les
          profits (et une fusion fait l'inverse). Ici, on va voir un cadre où{" "}
          <strong>fusionner deux firmes… baisse le prix et arrange tout le monde</strong>. Le
          secret : les deux firmes ne sont pas côte à côte, mais{" "}
          <strong>l'une au-dessus de l'autre</strong> — l'une fournit l'autre.
        </p>

        <Callout variant="exemple" title="🧪 Le décor : une chaîne de monopoles">
          <p>
            Une firme indépendante a le monopole sur la <strong>production</strong> d'une
            marque. Elle vend sa marque à un <strong>franchisé</strong> (indépendant lui
            aussi), seul habilité à la vendre au détail. Formellement, on considère :
          </p>
          <ul>
            <li>
              <strong>(1) Un producteur en monopole — « Amont »</strong> : il produit en
              quantités <M tex="y" /> avec un coût marginal de <strong>4</strong>, et vend à
              la firme Aval au prix <M tex="p_{am}" /> qu'il choisit.
            </li>
            <li>
              <strong>(2) Un distributeur en monopole — « Aval »</strong> : son seul coût
              marginal est le prix <M tex="p_{am}" /> payé à Amont ; il revend aux
              consommateurs au prix <M tex="p_{av}" /> qu'il choisit.
            </li>
            <li>
              <strong>(3) Des consommateurs finals</strong> de demande <M tex="y = 12 - p" />,
              soit <M tex="p = 12 - y" />.
            </li>
          </ul>
        </Callout>

        <Callout variant="methode" title="📐 Méthode : un jeu séquentiel, on résout par la fin">
          <p>
            C'est un <strong>jeu séquentiel</strong> : Amont choisit son prix, puis Aval, puis
            les consommateurs achètent. On le résout à rebours (backward induction) :
          </p>
          <ul>
            <li>
              d'abord les <strong>derniers joueurs</strong> — les consommateurs : au prix{" "}
              <M tex="p_{av}" />, ils achètent <M tex="y = 12 - p_{av}" /> ;
            </li>
            <li>
              puis l'<strong>avant-dernier</strong> — Aval ;
            </li>
            <li>
              puis le <strong>premier</strong> — Amont, qui anticipe parfaitement les
              comportements d'Aval et des consommateurs.
            </li>
          </ul>
        </Callout>

        <H4>Étape A — le comportement d'Aval</H4>
        <Steps
          items={[
            <>
              <p>
                Aval achète <M tex="y" /> unités à Amont au prix <M tex="p_{am}" /> et les
                revend au prix <M tex="p_{av} = 12 - y" />. Son profit :
              </p>
              <MB tex="\Pi_{av} = (12 - y)\,y - p_{am}\,y" />
            </>,
            <>
              <p>Condition de premier ordre :</p>
              <MB tex="12 - 2y - p_{am} = 0 \;\;\Longrightarrow\;\; y = 6 - \tfrac{1}{2}p_{am} \;\;\Longleftrightarrow\;\; p_{am} = 12 - 2y" />
              <p>
                Lecture : plus Amont vend cher, moins Aval commande. Cette relation est la{" "}
                <strong>demande qu'Aval adresse à Amont</strong>.
              </p>
            </>,
          ]}
        />

        <H4>Étape B — le comportement d'Amont</H4>
        <Steps
          items={[
            <>
              <p>
                Amont sait que la demande qui lui vient d'Aval est{" "}
                <M tex="p_{am} = 12 - 2y" />. Avec son coût marginal de 4, son profit s'écrit :
              </p>
              <MB tex="\Pi_{am} = (12 - 2y)\,y - 4y" />
            </>,
            <>
              <p>Condition de premier ordre :</p>
              <MB tex="12 - 4y - 4 = 0 \;\;\Longrightarrow\;\; y = 2 \;\;\Longrightarrow\;\; p_{am} = 12 - 2\times 2 = 8" />
            </>,
            <>
              <p>
                <strong>Au final</strong> : <M tex="y = 2" />, <M tex="p_{am} = 8" /> et donc{" "}
                <M tex="p_{av} = 12 - 2 = 10" />.
              </p>
            </>,
          ]}
        />

        <H4>Le diagnostic : deux marges empilées</H4>
        <p>Chaque monopole applique une marge sur ses coûts :</p>
        <ul>
          <li>
            <strong>Amont</strong> vend 2 unités à <M tex="p_{am} = 8" /> pour un coût de 4 →
            marge de <strong>4</strong>, profit <M tex="(8-4)\times 2 = 8" /> ;
          </li>
          <li>
            <strong>Aval</strong> vend 2 unités à <M tex="p_{av} = 10" /> pour un coût de 8 →
            marge de <strong>2</strong>, profit <M tex="(10-8)\times 2 = 4" />.
          </li>
        </ul>
        <Callout variant="definition" title="📖 Double marginalisation">
          <p>
            Ce phénomène s'appelle la <strong>double marginalisation</strong> :{" "}
            <strong>deux marges bénéficiaires plutôt qu'une</strong> sont prélevées le long de
            la chaîne, chacune gonflant le prix payé en bout de course. Avec une chaîne plus
            longue, on aurait de la <em>triple</em> marginalisation, etc. Chaque maillon
            margine dans son coin sans internaliser le tort qu'il cause aux autres : quand
            Amont monte son prix, il rogne la demande… et le profit d'Aval.
          </p>
        </Callout>

        <H4>Et si les deux monopoles fusionnaient ?</H4>
        <Steps
          items={[
            <>
              <p>
                Le monopole fusionné vend <M tex="y" /> unités au prix <M tex="p" /> avec un
                coût marginal de 4. Son profit :
              </p>
              <MB tex="\Pi = p\,y - 4y = (12 - y)\,y - 4y" />
            </>,
            <>
              <p>Condition de premier ordre :</p>
              <MB tex="12 - 2y - 4 = 0 \;\;\Longrightarrow\;\; y = 4 \;\;\Longrightarrow\;\; p = 8 \;\;\Longrightarrow\;\; \Pi = (8-4)\times 4 = 16" />
            </>,
          ]}
        />
        <Tbl
          head={["", "Chaîne Amont → Aval", "Monopole fusionné"]}
          rows={[
            ["Quantité vendue", "2", <Hl key="q">4</Hl>],
            ["Prix final", "10 €", <Hl key="p">8 €</Hl>],
            ["Profit total", "8 + 4 = 12 €", <Hl key="pi">16 €</Hl>],
          ]}
        />
        <p>
          <strong>Les consommateurs bénéficient de la fusion</strong> (ils achètent plus — 4
          au lieu de 2 — pour un prix plus faible — 8 au lieu de 10) <em>et</em>{" "}
          <strong>le monopole joint gagne plus</strong> (16 contre 12). La fusion des deux
          monopoles aboutit à une <strong>amélioration parétienne</strong> : personne n'y
          perd, tout le monde y gagne.
        </p>

        <DoubleMarginExplorer />

        <Callout variant="attention" title="⚠️ Conséquence pour la politique de concurrence">
          <p>
            Les lois anti-trust doivent donc <strong>distinguer deux types de fusions</strong> :
            l'<strong>intégration verticale</strong> de deux monopoles successifs (notre cas —
            elle supprime une marge et peut profiter à tous) et l'
            <strong>intégration horizontale</strong> entre concurrents du même marché (comme
            dans les oligopoles — elle réduit la concurrence et nuit en général aux
            consommateurs). Deux fusions, deux verdicts opposés.
          </p>
        </Callout>

        <Callout variant="intuition" title="💡 D'autres remèdes que la fusion">
          <p>
            La fusion n'est pas le seul moyen de tuer la double marge. Relis le § 6 : si Amont
            vendait ses unités <strong>à prix coûtant</strong> (<M tex="p_{am} = Cm = 4" />),
            Aval choisirait <M tex="y = 4" />, <M tex="p_{av} = 8" /> — le résultat fusionné !
            Mais Amont ferait alors un profit nul sur les ventes. Solution : lui faire payer
            en plus un <strong>forfait de franchise</strong> qui récupère le profit — un tarif
            en deux parties entre firmes. C'est précisément la logique du contrat de franchise
            vue dans le cours de stratégies : marge nulle sur les unités, tout passe par le
            fixe.
          </p>
          <p className="mt-2">
            <TheoryRef
              course="strategies"
              chapter="b2"
              section="sec-cas3"
              label="B2 · Le contrat de franchise (α négatif, β = 1)"
            />
          </p>
        </Callout>

        <Quiz
          scope="ei3"
          id="q9"
          kicker="Quiz éclair · § 7"
          question={
            <p>
              Pourquoi la chaîne Amont → Aval finit-elle avec un prix <em>plus élevé</em> et
              un profit total <em>plus faible</em> qu'un monopole intégré — alors que chaque
              firme maximise pourtant son profit ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Parce que chaque firme margine sur son propre coût sans tenir compte de
                  l'effet de sa marge sur le profit de l'autre : les deux marges s'empilent et
                  écrasent la demande.
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est l'externalité verticale au cœur du phénomène. Amont fixe 8 en
                  raisonnant sur la demande <em>déjà réduite</em> d'Aval (
                  <M tex="p_{am} = 12 - 2y" />), Aval remargine par-dessus → prix final 10,
                  quantité 2. Le monopole intégré, lui, ne margine qu'une fois sur le vrai
                  coût (4) et choisit p = 8, y = 4.
                </>
              ),
            },
            {
              text: <>Parce qu'Aval est moins efficace qu'Amont pour distribuer.</>,
              explain: (
                <>
                  Non : aucune différence d'efficacité dans le modèle (Aval n'a même aucun
                  coût propre). Le problème est purement stratégique : deux marges au lieu
                  d'une.
                </>
              ),
            },
            {
              text: <>Parce que les consommateurs préfèrent acheter à un monopole intégré.</>,
              explain: (
                <>
                  Les consommateurs ne voient que le prix final. Ils achètent plus après la
                  fusion uniquement parce que le prix passe de 10 € à 8 €.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="ei3"
          id="q10"
          kicker="Quiz éclair · § 7"
          question={
            <p>
              Vrai ou faux : « Puisque la fusion Amont-Aval profite à tout le monde, les
              autorités de concurrence devraient aussi voir d'un bon œil la fusion de deux
              distributeurs concurrents. »
            </p>
          }
          options={[
            {
              text: <>Vrai : une fusion est une fusion.</>,
              explain: (
                <>
                  Non — c'est exactement la confusion que le cours te demande d'éviter.
                  Amont-Aval est une intégration <em>verticale</em> (fournisseur + client) ;
                  deux distributeurs concurrents, c'est une intégration <em>horizontale</em>,
                  qui supprime de la concurrence sur un même marché.
                </>
              ),
            },
            {
              text: (
                <>
                  Faux : l'intégration <em>verticale</em> supprime une double marge (souvent
                  pro-consommateurs), l'intégration <em>horizontale</em> supprime un
                  concurrent (souvent anti-consommateurs).
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement la distinction à retenir. Vertical : les deux firmes vendaient
                  des produits <em>complémentaires</em> le long d'une chaîne — fusionner
                  élimine l'empilement de marges (prix en baisse). Horizontal : elles
                  vendaient des produits <em>substituables</em> — fusionner rapproche du
                  monopole (prix en hausse).
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À retenir (§ 7)">
          <ul>
            <li>
              Chaîne : Aval réagit par <M tex="p_{am} = 12 - 2y" /> ; Amont maximise{" "}
              <M tex="(12-2y)y - 4y" /> → <M tex="y = 2" />, <M tex="p_{am} = 8" />,{" "}
              <M tex="p_{av} = 10" />, profits 8 + 4 = 12.
            </li>
            <li>
              Fusion : <M tex="(12-y)y - 4y" /> → <M tex="y = 4" />, <M tex="p = 8" />, profit
              16 → <strong>amélioration parétienne</strong>.
            </li>
            <li>
              Deux marges empilées font pire qu'une : c'est la{" "}
              <strong>double marginalisation</strong> (triple si la chaîne s'allonge).
            </li>
            <li>
              Remèdes : <strong>intégration verticale</strong>, ou contrat de type{" "}
              <strong>franchise / tarif en deux parties</strong> (vente à prix coûtant +
              forfait).
            </li>
            <li>
              Anti-trust : bien séparer intégration <strong>verticale</strong> et{" "}
              <strong>horizontale</strong> — effets opposés.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 8 — Synthèse                                                */}
      {/* ============================================================ */}
      <Section id="synthese" kicker="§ 8" title="À maîtriser absolument">
        <p className="text-[1.1rem] leading-relaxed">
          Ce chapitre t'a montré trois grandes familles de stratégies par lesquelles un
          monopole exploite finement son pouvoir de marché : la{" "}
          <strong>discrimination en prix</strong> (trois degrés), la{" "}
          <strong>tarification en deux parties</strong>, et la gestion des chaînes verticales
          face à la <strong>double marginalisation</strong>. Voici tout ce qu'il faut savoir
          en refermant la page.
        </p>

        <H4>Le tableau récapitulatif des trois degrés</H4>
        <Tbl
          head={["", "1er degré", "2e degré", "3e degré"]}
          rows={[
            [
              <strong key="r">Information nécessaire</strong>,
              <>
                identité <em>et</em> disposition à payer de chacun, unité par unité
              </>,
              <>les profils existants (pas l'identité de chacun)</>,
              <>un signe observable de groupe (âge, carte, pays…)</>,
            ],
            [
              <strong key="r">Instrument</strong>,
              <>offres personnalisées imposées, « à prendre ou à laisser »</>,
              <>menu de lots identique pour tous, libre choix (auto-sélection)</>,
              <>un prix par groupe (quantité libre)</>,
            ],
            [
              <strong key="r">Dans l'exemple L &amp; S</strong>,
              <>12 u. → 72 € ; 6 u. → 36 €</>,
              <>12 u. → 64 € ; 4 u. → 32 €</>,
              <>
                <M tex="Rm_1 = Rm_2 = cm" />
              </>,
            ],
            [
              <strong key="r">Profit</strong>,
              <Hl key="v">108 €</Hl>,
              <>96 €</>,
              <>intermédiaire</>,
            ],
            [
              <strong key="r">Surplus consommateurs</strong>,
              <>0</>,
              <>8 € (rente d'information de L)</>,
              <>positif</>,
            ],
            [
              <strong key="r">Efficacité</strong>,
              <Hl key="v">totale (18 unités)</Hl>,
              <>presque (petit lot rationné : − 4 €)</>,
              <>
                non (prix supérieurs à <M tex="cm" />)
              </>,
            ],
          ]}
        />
        <p>
          (Référence : monopole simple = profit 54 €, surplus consommateurs 27 €, surplus
          total 81 € sur un potentiel de 108 €.)
        </p>

        <H4>Les formules et résultats clés</H4>
        <FormulaBox
          tex="\text{Monopole simple : } Rm = Cm \;\Rightarrow\; Y = 9,\; p = 6,\; \Pi = 54\text{ €}"
          label="1 · Le benchmark"
        />
        <FormulaBox
          tex="m_S = 12y_S - y_S^2 \quad\cdot\quad m_l = 72 - \tfrac{1}{2}y_S^2 \quad\cdot\quad \Pi = 72 + 12y_S - \tfrac{3}{2}y_S^2 \;\Rightarrow\; y_S^* = 4"
          label="2 · Le menu de lots du 2e degré"
          caption={
            <>
              Participation de S saturée, incitation de L saturée, puis maximisation en{" "}
              <M tex="y_S" />.
            </>
          }
        />
        <FormulaBox
          tex="Rm_1 = Rm_2 = cm \qquad\cdot\qquad p = \frac{k}{1 - \frac{1}{\varepsilon}} \qquad\cdot\qquad p_1 < p_2 \Longleftrightarrow \varepsilon_1 > \varepsilon_2"
          label="3 · Le 3e degré"
          caption={<>Le groupe le moins élastique paie le plus cher.</>}
        />
        <FormulaBox
          tex="p^* = Cm \qquad\cdot\qquad F^* = SC"
          label="4 · Le tarif en deux parties"
          caption={<>Efficace, mais tout le surplus va au monopole (consommateurs identiques).</>}
        />
        <FormulaBox
          tex="\text{Chaîne : } y = 2,\; p_{av} = 10,\; \Pi = 12\text{ €} \qquad\text{Fusion : } y = 4,\; p = 8,\; \Pi = 16\text{ €}"
          label="5 · La double marginalisation"
          caption={<>La fusion verticale est une amélioration parétienne.</>}
        />

        <H4>La checklist de maîtrise</H4>
        <ChecklistMaitrise
          items={[
            <>
              Définir la <strong>discrimination en prix</strong> (écart de prix non justifié
              par un écart de coût) et citer la condition de <strong>non-revente</strong>.
            </>,
            <>
              Distinguer les <strong>trois degrés</strong> par l'information requise, avec un
              exemple réel pour chacun.
            </>,
            <>
              Refaire le <strong>benchmark</strong> : demandes de L et S, demande totale,{" "}
              <M tex="Rm = Cm" />, trio (p = 6 ; Y = 9 ; Π = 54), surplus 18 + 9 = 27.
            </>,
            <>
              Construire les offres du <strong>1er degré</strong> (12 u. → 72 € ; 6 u. →
              36 €), et expliquer : profit 108, surplus nul, efficacité restaurée — et le
              piège du « prix unitaire moyen de 6 € ».
            </>,
            <>
              Montrer pourquoi le 1er degré n'est <strong>pas imitable en libre choix</strong>{" "}
              (L gagne 18 € avec le lot de S).
            </>,
            <>
              Dérouler la <strong>dérivation complète du 2e degré</strong> : participation de
              S, incitation de L, <M tex="\Pi = 72 + 12y_S - \tfrac{3}{2}y_S^2" />,{" "}
              <M tex="y_S^* = 4" />, lots (12 ; 64) et (4 ; 32), profit 96.
            </>,
            <>
              Expliquer les deux distorsions du 2e degré : <strong>petit lot rationné</strong>{" "}
              et <strong>rente d'information</strong> (8 €) du gros client.
            </>,
            <>
              Énoncer et justifier l'<strong>équation d'arbitrage</strong>{" "}
              <M tex="Rm_1 = Rm_2 = cm" /> du 3e degré, et conclure via les élasticités qui
              paie le plus cher.
            </>,
            <>
              Résoudre le <strong>tarif en deux parties</strong> : pourquoi{" "}
              <M tex="p = Cm" /> et <M tex="F = SC" />, et les deux conditions de validité.
            </>,
            <>
              Refaire la <strong>double marginalisation</strong> de bout en bout (chaîne puis
              fusion) et expliquer la distinction intégration verticale / horizontale — plus
              les deux remèdes (fusion, franchise).
            </>,
          ]}
        />

        <H4>Exercices récapitulatifs — refais les calculs du cours</H4>

        <ExerciseBlock
          scope="ei3"
          id="ex1"
          number={1}
          title="Le menu de lots optimal, de A à Z"
          difficulty={2}
          refs={[
            { chapter: "ei3", section: "fil-conducteur" },
            { chapter: "ei3", section: "premier-degre" },
            { chapter: "ei3", section: "deuxieme-degre" },
          ]}
          statement={
            <>
              <p>
                Un monopole à coûts nuls fait face aux deux consommateurs du cours : L (
                <M tex="p = 12 - y_L" />) et S (<M tex="p = 12 - 2y_S" />). Il ne peut pas les
                identifier et propose donc un menu en libre choix : un lot l de 12 unités pour{" "}
                <M tex="m_l" /> €, un lot s de <M tex="y_S" /> unités pour <M tex="m_S" /> €.
              </p>
              <ul>
                <li>
                  <strong>a)</strong> Montre que le menu du 1er degré (72 € ; 12) et (36 € ; 6)
                  ne fonctionne pas en libre choix.
                </li>
                <li>
                  <strong>b)</strong> Exprime <M tex="m_S" /> puis <M tex="m_l" /> en fonction
                  de <M tex="y_S" />.
                </li>
                <li>
                  <strong>c)</strong> Trouve le <M tex="y_S" /> optimal, les montants, le
                  profit et la rente de L.
                </li>
                <li>
                  <strong>d)</strong> Compare monopole simple, 1er degré et 2e degré.
                </li>
              </ul>
            </>
          }
          steps={[
            {
              title: "a) L se déguise en petit consommateur",
              refs: [{ chapter: "ei3", section: "deuxieme-degre" }],
              content: (
                <>
                  <p>
                    Avec le lot l : surplus net de L = <M tex="72 - 72 = 0" />. Avec le lot s,
                    L valorise les 6 unités à l'aire sous <em>sa</em> demande :
                  </p>
                  <MB tex="6 \times 6 + \tfrac{(12-6)\times 6}{2} - 36 = 36 + 18 - 36 = 18\text{ €} > 0" />
                  <p>
                    L choisit donc le lot s : impossible de reproduire le 1er degré quand les
                    clients choisissent librement.
                  </p>
                </>
              ),
            },
            {
              title: "b) Saturer la participation de S…",
              content: (
                <>
                  <p>
                    S achète le lot s si son surplus net est non négatif. Son surplus brut
                    jusqu'à <M tex="y_S" /> vaut{" "}
                    <M tex="(12 - 2y_S)y_S + \tfrac{1}{2}(2y_S)y_S" />, donc le montant
                    maximal est :
                  </p>
                  <MB tex="m_S = 12y_S - y_S^2" />
                </>
              ),
            },
            {
              title: "…puis l'incitation de L",
              content: (
                <>
                  <p>
                    L doit préférer le lot l :{" "}
                    <M tex="72 - m_l \ge 12y_S - \tfrac{1}{2}y_S^2 - m_S" />. En saturant et en
                    remplaçant <M tex="m_S" /> :
                  </p>
                  <MB tex="m_l = 72 - 12y_S + \tfrac{1}{2}y_S^2 + m_S = 72 - \tfrac{1}{2}y_S^2" />
                </>
              ),
            },
            {
              title: "c) Maximiser le profit en yS",
              content: (
                <>
                  <MB tex="\Pi = m_l + m_S = 72 + 12y_S - \tfrac{3}{2}y_S^2 \;\Rightarrow\; \frac{d\Pi}{dy_S} = 12 - 3y_S = 0 \;\Rightarrow\; y_S^* = 4" />
                  <MB tex="m_S = 32\text{ €} \qquad m_l = 64\text{ €} \qquad \Pi = 96\text{ €} \qquad \text{rente de L} = 72 - 64 = 8\text{ €}" />
                  <p>
                    Vérification du libre choix : L obtient 8 € avec l'un ou l'autre lot
                    (contrainte saturée) et prend le lot l ; S obtient 0 avec le lot s et
                    l'accepte.
                  </p>
                </>
              ),
            },
            {
              title: "d) La comparaison finale",
              content: (
                <>
                  <p>
                    Monopole simple : 54 € / 27 € / 81 €. Premier degré : 108 € / 0 € / 108 €.
                    Second degré : 96 € / 8 € / 104 €. Le 2e degré est moins efficace que le
                    1er (rationnement du petit lot), mais laisse une rente au consommateur — et
                    exige beaucoup moins d'information.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>À retenir</strong> : la recette du 2e degré tient en trois gestes —{" "}
              <em>saturer la participation du petit</em>,{" "}
              <em>saturer l'incitation du gros</em>,{" "}
              <em>
                maximiser en <M tex="y_S" />
              </em>
              . Les deux stigmates de la solution : quantité du petit lot distordue vers le
              bas, rente d'information au gros client.
            </p>
          }
        />

        <ExerciseBlock
          scope="ei3"
          id="ex2"
          number={2}
          title="La double marginalisation, pas à pas"
          difficulty={2}
          refs={[
            { chapter: "ei3", section: "double-marge" },
            { chapter: "ei3", section: "deux-parties" },
          ]}
          statement={
            <>
              <p>
                Un producteur (Amont, coût marginal 4) vend au prix <M tex="p_{am}" /> à un
                distributeur (Aval, aucun autre coût), qui revend aux consommateurs finals de
                demande <M tex="y = 12 - p" />.
              </p>
              <ul>
                <li>
                  <strong>a)</strong> Détermine la réaction d'Aval à un prix{" "}
                  <M tex="p_{am}" /> quelconque.
                </li>
                <li>
                  <strong>b)</strong> Détermine le choix optimal d'Amont, puis les prix,
                  marges et profits de la chaîne.
                </li>
                <li>
                  <strong>c)</strong> Calcule l'équilibre si les deux firmes fusionnent, et
                  conclus.
                </li>
                <li>
                  <strong>d)</strong> Propose un contrat qui évite la double marge sans
                  fusionner.
                </li>
              </ul>
            </>
          }
          steps={[
            {
              title: "a) Aval (l'avant-dernier joueur — backward induction)",
              refs: [{ chapter: "ei3", section: "double-marge" }],
              content: (
                <>
                  <MB tex="\max_y\; (12 - y)y - p_{am}y \;\Rightarrow\; 12 - 2y - p_{am} = 0 \;\Rightarrow\; y = 6 - \tfrac{1}{2}p_{am}" />
                  <p>
                    Soit, en inversant : <M tex="p_{am} = 12 - 2y" /> — la demande adressée à
                    Amont.
                  </p>
                </>
              ),
            },
            {
              title: "b) Amont anticipe cette réaction",
              content: (
                <>
                  <MB tex="\max_y\; (12 - 2y)y - 4y \;\Rightarrow\; 12 - 4y - 4 = 0 \;\Rightarrow\; y = 2,\;\; p_{am} = 8,\;\; p_{av} = 12 - 2 = 10" />
                  <p>
                    Marges : Amont 8 − 4 = 4 (profit 8) ; Aval 10 − 8 = 2 (profit 4). Profit
                    total de la chaîne : <strong>12 €</strong>. Deux marges s'empilent : c'est
                    la double marginalisation.
                  </p>
                </>
              ),
            },
            {
              title: "c) La fusion",
              content: (
                <>
                  <MB tex="\max_y\; (12 - y)y - 4y \;\Rightarrow\; 12 - 2y - 4 = 0 \;\Rightarrow\; y = 4,\;\; p = 8,\;\; \Pi = 16\text{ €}" />
                  <p>
                    Les consommateurs paient 8 au lieu de 10 et achètent 4 au lieu de 2 ; le
                    profit joint passe de 12 à 16 : <strong>amélioration parétienne</strong>.
                    D'où la distinction anti-trust entre intégration verticale (ici,
                    bénéfique) et horizontale (réduction de concurrence).
                  </p>
                </>
              ),
            },
            {
              title: "d) Le contrat de franchise (tarif en deux parties entre firmes)",
              refs: [{ chapter: "ei3", section: "deux-parties" }],
              content: (
                <>
                  <p>
                    Amont vend à prix coûtant (<M tex="p_{am} = 4" />) : Aval choisit alors{" "}
                    <M tex="y = 4" />, <M tex="p_{av} = 8" /> et réalise 16 € de profit —
                    l'équilibre fusionné est reproduit. Pour se rémunérer, Amont facture en
                    plus un <strong>forfait de franchise</strong> <M tex="F" /> (au plus
                    16 €), qui partage le gâteau sans le rétrécir : marge nulle sur les
                    unités, tout passe par le fixe — exactement la logique du § 6.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>À retenir</strong> : dans une chaîne verticale, chaque marge
              supplémentaire rétrécit le gâteau. Les remèdes qui rétablissent l'efficacité de
              la chaîne : <em>fusion verticale</em> ou{" "}
              <em>vente à prix coûtant + franchise</em> — dans tous les cas, une seule marge
              au lieu de deux.
            </p>
          }
        />

        <Callout variant="examen" title="🎯 Les réflexes d'examen">
          <ul>
            <li>
              On te donne deux demandes et un menu de lots → <strong>vérifie toujours la
              contrainte d'incitation du gros consommateur</strong> avant de conclure (calcule
              son surplus sur <em>chaque</em> lot, avec <em>sa</em> courbe de demande).
            </li>
            <li>
              « Quel groupe paie le plus cher ? » → réponds <strong>élasticités</strong>, pas
              « celui qui consomme le plus ».
            </li>
            <li>
              Tarif en deux parties → le prix unitaire optimal est <M tex="Cm" />,{" "}
              <strong>jamais</strong> le prix de monopole.
            </li>
            <li>
              Chaîne verticale → résous <strong>par la fin</strong> (Aval d'abord), et
              n'oublie pas que la demande perçue par Amont est <M tex="p_{am} = 12 - 2y" />,
              pas la demande finale.
            </li>
          </ul>
        </Callout>

        <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
          Manuel interactif · Chapitre EI3 — Les comportements de monopole : discrimination en
          prix (1er, 2e, 3e degré), tarification en deux parties et double marginalisation
          (d'après les slides du cours d'économie industrielle). Tous les calculs reprennent
          les nombres des slides et ont été vérifiés numériquement.
        </p>
      </Section>
    </ChapterShell>
  );
}
