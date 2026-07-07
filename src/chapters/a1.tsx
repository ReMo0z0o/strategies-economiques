/*
 * Chapitre A1 — Préférences et choix.
 *
 * Conversion fidèle du manuel interactif « A1 · Préférences et choix »
 * (cours ECGEB366, B. Decerf) : le modèle du choix rationnel (offre de
 * travail, préférences, courbes d'indifférence, Lagrangien, redistribution,
 * Laffer, Pareto) puis l'économie comportementale (utilité de transaction,
 * coûts irrécupérables, effet de dotation, framing, nudges).
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import {
  BudgetExplorer,
  LaborSupplyExplorer,
  LafferExplorer,
  PollAB,
} from "./a1/interactives";
import {
  Figure,
  FigMethode,
  FigIndiff,
  FigCarte,
  FigTangence,
  FigParetoTaxe,
} from "./a1/figures";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h4 de la source). */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Tableau simple avec défilement horizontal sur mobile. */
function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[480px] border-collapse text-[15px]">
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

/** Grille de mini-cartes (l'équivalent du « recap-grid » de la source). */
function CardGrid({ items }: { items: Array<{ title: ReactNode; body: ReactNode }> }) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold text-primary">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Liste « à maîtriser absolument » : pastille numérotée + contenu. */
function MustKnow({ items, start = 1 }: { items: ReactNode[]; start?: number }) {
  return (
    <ul className="my-4 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 rounded-xl border bg-card px-4 py-3 text-[15px] leading-relaxed shadow-sm">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
            {start + i}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */

export default function Chapter() {
  return (
    <ChapterShell chapterId="a1">
      {/* ============================================================ */}
      {/* 0.1 + 0.2 — Introduction & méthode                            */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 0.1 – 0.2" title="Pourquoi ce chapitre ?">
        <p className="text-[1.15rem] leading-relaxed">
          Imagine que tu sois économiste et qu'on te pose cette question : «{" "}
          <em>les inégalités de revenus augmentent — que faut-il faire ?</em> »
        </p>

        <p>
          Une réponse possible est de <strong>redistribuer</strong> : taxer davantage les hauts
          revenus, et reverser cet argent à tout le monde. Ça paraît une bonne idée. Mais comment{" "}
          <em>savoir</em> si ça marche vraiment ? Une taxe plus élevée pourrait décourager les gens
          de travailler, réduire la richesse totale produite, et finalement… appauvrir tout le
          monde, y compris ceux qu'on voulait aider.
        </p>

        <p>
          On ne peut pas répondre à l'intuition. Il faut un <strong>outil</strong> qui permette de
          prédire ce que les gens feront face à une taxe, puis de juger si le résultat est
          souhaitable. <strong>Cet outil, c'est exactement ce que ce chapitre construit.</strong>
        </p>

        <Callout variant="retiens" title="L'idée à garder en tête tout du long">
          <p>
            Pour évaluer une politique économique (une « <em>mesure</em> »), l'économiste a besoin
            d'un <strong>modèle</strong> du comportement humain. Sans modèle, impossible de prédire
            les effets d'une décision. Toute la première partie sert à construire ce modèle du
            choix individuel.
          </p>
        </Callout>

        <p>
          On va se concentrer sur un cas concret tout au long du chapitre : le{" "}
          <strong>choix d'un travailleur</strong> qui décide combien d'heures travailler, sachant
          qu'on prélève une taxe sur son salaire. C'est l'exemple fil rouge.
        </p>

        <H4>La méthode de l'économiste : deux étapes, positif puis normatif</H4>

        <p>
          L'analyse économique se fait toujours en deux temps. C'est une distinction fondamentale,
          à comprendre dès maintenant car elle structure tout le cours.
        </p>

        <Callout variant="definition" title="Les deux types d'analyse">
          <p>
            <strong>1. L'analyse positive</strong> décrit <em>ce qui est</em>. Elle prend une
            mesure (ex. une taxe de 30 %) et, grâce au modèle, prédit le résultat qui en découle :
            combien les gens vont travailler, consommer, etc. C'est purement factuel —{" "}
            <strong>aucun jugement</strong>. On répond à « que va-t-il <em>se passer</em> ? »
          </p>
          <p className="mt-2">
            <strong>2. L'analyse normative</strong> juge <em>ce qui devrait être</em>. Elle compare
            les résultats obtenus avec différentes mesures et dit lequel est{" "}
            <strong>préférable</strong>. Là, on porte un jugement de valeur. On répond à « quelle
            situation est la <em>meilleure</em> ? »
          </p>
        </Callout>

        <Figure
          caption={
            <>
              <strong>Le moteur de l'analyse économique.</strong> À gauche, le modèle transforme
              chaque mesure (une politique) en un résultat prédit — c'est le{" "}
              <strong className="text-rose-600">positif</strong>. À droite, on compare ces
              résultats pour dire lequel est désirable — c'est le{" "}
              <strong className="text-emerald-600">normatif</strong>.
            </>
          }
        >
          <FigMethode />
        </Figure>

        <Callout variant="attention" title="Le piège classique">
          <p>
            « Augmenter la taxe réduit les inégalités » est une affirmation <strong>positive</strong>{" "}
            (vraie ou fausse selon les faits). « On devrait augmenter la taxe » est une affirmation{" "}
            <strong>normative</strong> (elle dépend de ce qu'on valorise). Mélanger les deux est
            l'erreur la plus fréquente. Un fait ne dit jamais à lui seul ce qu'il <em>faut</em>{" "}
            faire.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q1"
          question={
            <>
              Classe cette affirmation : «{" "}
              <em>On devrait augmenter la taxe pour réduire les inégalités.</em> »
            </>
          }
          options={[
            {
              text: <>C'est une affirmation positive.</>,
              explain: (
                <>
                  Non : elle ne décrit pas un fait vérifiable, elle dit ce qu'il <em>faudrait</em>{" "}
                  faire. Le mot « devrait » trahit un jugement de valeur.
                </>
              ),
            },
            {
              text: <>C'est une affirmation normative.</>,
              correct: true,
              explain: (
                <>
                  Exactement : « on devrait » exprime un jugement de valeur sur ce qui est
                  souhaitable. Une version positive serait « augmenter la taxe réduirait les
                  inégalités de X % » — une prédiction factuelle, vraie ou fausse.
                </>
              ),
            },
            {
              text: <>C'est les deux à la fois.</>,
              explain: (
                <>
                  Elle peut <em>s'appuyer</em> sur des faits, mais la phrase elle-même porte un
                  jugement (« devrait ») : elle est normative.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Réflexe à garder : cherche le verbe. « Il se passera X » → positif. « Il faut / on
              devrait » → normatif.
            </>
          }
        />

        <p>
          <strong>Le plan du chapitre.</strong> La Partie A (sections suivantes) construit, brique
          par brique, le modèle qui prédit comment une personne « parfaitement raisonnable »
          décide — c'est le socle de toute la microéconomie — puis l'applique à la redistribution
          des revenus. La Partie B confronte ensuite ce modèle aux vrais humains : leurs écarts
          sont systématiques… et prévisibles.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* A.1 + A.2 — Le modèle d'offre de travail & le budget          */}
      {/* ============================================================ */}
      <Section id="offre" kicker="A.1 · A.2" title="Le modèle d'offre de travail">
        <p className="text-[1.15rem] leading-relaxed">
          Notre personnage est un <strong>travailleur</strong>. Chaque jour, il dispose d'un
          certain nombre d'heures et doit les répartir entre deux usages :
        </p>

        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>Travailler</strong> — ce qui lui rapporte un salaire, donc de l'argent pour
            acheter des choses ;
          </li>
          <li>
            <strong>Le loisir</strong> (= temps libre) — tout le temps qu'il ne passe <em>pas</em> à
            travailler.
          </li>
        </ul>

        <p>
          Plus il travaille, plus il gagne d'argent (et peut consommer), mais moins il a de temps
          libre. Plus il se repose, plus il a de loisir, mais moins il gagne.{" "}
          <strong>C'est un arbitrage</strong> : on ne peut pas avoir les deux à fond. Comprendre
          comment il tranche cet arbitrage, c'est tout l'enjeu.
        </p>

        <H4>Le vocabulaire et les symboles</H4>
        <p>
          L'économie utilise des lettres pour désigner les quantités. Ça paraît aride au début,
          mais c'est juste une manière compacte de parler. Voici le dictionnaire :
        </p>

        <Tbl
          head={["Symbole", "Signification", "En clair"]}
          rows={[
            [<M key="l" tex="l" />, "quantité de loisir", <>les heures qu'il <em>garde</em> pour lui</>],
            [<M key="c" tex="c" />, "quantité de consommation", "les biens qu'il achète"],
            [<M key="L" tex="L" />, "dotation totale en temps", "le nombre d'heures dont il dispose en tout"],
            [<M key="M" tex="M" />, "revenu hors travail", "de l'argent qu'il a même sans travailler"],
            [<M key="s" tex="s" />, "salaire horaire brut", <>ce qu'une heure de travail rapporte <em>avant</em> impôt</>],
            [<M key="t" tex="t" />, "taux de taxe", "la part du salaire prélevée (entre 0 et 1)"],
          ]}
        />

        <Callout variant="definition" title="Le salaire net">
          <p>
            L'État prélève une fraction <M tex="t" /> du salaire. Si <M tex="t = 0{,}3" /> (taxe de
            30 %), le travailleur ne garde que 70 % de son salaire. Le <strong>salaire net</strong>{" "}
            (ce qu'il touche réellement par heure) est donc :
          </p>
          <MB tex="s\,(1-t)" />
          <p>
            <em>salaire horaire net = salaire brut × la part qu'on garde.</em> Petite
            simplification commode du cours : on fixe le prix des biens de consommation à 1 (
            <M tex="p_c = 1" />
            ). Comme ça, « dépenser 1 € » = « consommer 1 unité », et on n'a pas à jongler avec les
            prix.
          </p>
        </Callout>

        <H4>La contrainte de budget : ce qui est possible</H4>

        <p>
          Le travailleur ne peut pas s'offrir n'importe quoi. Il est limité par ce que son temps et
          son argent permettent. Cette limite s'appelle la <strong>contrainte de budget</strong>.
          L'idée est simple : <strong>ce qu'il dépense ne peut pas dépasser ce dont il dispose.</strong>{" "}
          Détaillons les deux côtés.
        </p>

        <p>
          <strong>Ce dont il dispose (sa richesse totale).</strong> S'il travaillait <em>toutes</em>{" "}
          ses heures <M tex="L" /> (zéro loisir), il gagnerait <M tex="s(1-t)L" />, et en ajoutant
          son revenu hors travail <M tex="M" />, sa richesse maximale serait{" "}
          <M tex="s(1-t)L + M" />.
        </p>

        <p>
          <strong>Ce qu'il « dépense ».</strong> Voici l'astuce conceptuelle : prendre du loisir{" "}
          <strong>coûte</strong> quelque chose. Chaque heure de loisir est une heure non
          travaillée, donc un salaire net <M tex="s(1-t)" /> auquel il renonce. C'est ce qu'on
          appelle le <strong>coût d'opportunité</strong> : le prix d'une chose, c'est ce qu'on
          sacrifie pour l'obtenir. Le loisir n'est pas « gratuit » — son prix est le salaire perdu.
        </p>

        <p>
          En mettant tout ensemble (dépense en loisir + dépense en consommation ≤ richesse
          totale) :
        </p>

        <FormulaBox
          tex="s(1-t)\,l + c \;\le\; s(1-t)\,L + M"
          label="La contrainte de budget"
          caption={
            <>
              dépense en loisir + consommation&nbsp;&nbsp;≤&nbsp;&nbsp;richesse totale disponible
            </>
          }
        />

        <p>
          Cette inégalité décrit <strong>tous les paniers possibles</strong>. Un « panier » est
          juste une combinaison <M tex="(l, c)" /> — une certaine quantité de loisir et une
          certaine quantité de consommation. La contrainte sépare le possible de l'impossible.
        </p>

        <BudgetExplorer />

        <p>
          Sur ce graphique, chaque point sous la droite rouge est un panier que le travailleur peut
          s'offrir. Le point <M tex="\omega" /> (« oméga ») est sa <strong>dotation de départ</strong>{" "}
          : tout en loisir (il travaille zéro), il ne lui reste que son revenu hors travail{" "}
          <M tex="M" />. La pente <M tex="-s(1-t)" /> indique le prix du loisir : pour 1 h de
          loisir en plus, il renonce à <M tex="s(1-t)" /> de consommation.
        </p>

        <Callout variant="methode" title="Lire un graphique d'économie">
          <p>
            En microéconomie, on raisonne presque toujours sur ce type de graphique à deux axes.
            L'axe horizontal et l'axe vertical sont les deux « biens » (ici loisir et
            consommation). Un point = un panier. Une droite ou une courbe = un ensemble de paniers
            qui ont une propriété commune.{" "}
            <strong>
              Prends l'habitude de te demander, pour chaque point : combien de loisir, combien de
              consommation ?
            </strong>
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q2"
          question={
            <>
              Sur le graphique loisir–consommation, que représente la pente <M tex="-s(1-t)" /> de
              la droite de budget ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Le prix du loisir : la consommation à laquelle on renonce pour une heure de
                  loisir en plus.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : c'est le coût d'opportunité du loisir. Une heure non travaillée = un
                  salaire net <M tex="s(1-t)" /> de consommation sacrifié.
                </>
              ),
            },
            {
              text: <>La richesse totale du travailleur.</>,
              explain: (
                <>
                  Non : la richesse totale <M tex="s(1-t)L+M" /> est l'<em>ordonnée à l'origine</em>{" "}
                  de la droite (le point tout en haut à gauche), pas sa pente.
                </>
              ),
            },
            {
              text: <>La satisfaction procurée par une heure de loisir.</>,
              explain: (
                <>
                  Non : la satisfaction relève des <em>préférences</em> (courbes d'indifférence),
                  pas de la contrainte de budget. La droite de budget ne dit rien sur ce que le
                  travailleur aime.
                </>
              ),
            },
          ]}
        />

        <p>
          La contrainte nous dit ce qui est <em>possible</em>. Mais parmi tous ces paniers
          possibles, <strong>lequel le travailleur va-t-il choisir ?</strong> Pour répondre, il
          nous manque une chose : savoir ce qu'il <em>préfère</em>. C'est l'objet de la section
          suivante.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* A.3 + A.4 — Les préférences & leurs propriétés                */}
      {/* ============================================================ */}
      <Section id="pref" kicker="A.3 · A.4" title="Les préférences">
        <p className="text-[1.15rem] leading-relaxed">
          Pour prédire le choix, on suppose une chose très naturelle : le travailleur choisit,
          parmi les paniers possibles, <strong>celui qu'il préfère</strong>. On appelle ça
          l'<strong>hypothèse de comportement maximisateur</strong>.
        </p>

        <p>
          Mais « préférer » doit être défini précisément. Quand on compare deux paniers{" "}
          <M tex="x" /> et <M tex="y" />, il n'y a que trois situations possibles. On leur donne
          chacune un symbole.
        </p>

        <Callout variant="definition" title="Les trois relations de préférence">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Préférence stricte</strong> <M tex="x \succ y" /> — il préfère{" "}
              <em>nettement</em> <M tex="x" /> à <M tex="y" />. Entre les deux, il prend{" "}
              <M tex="x" /> sans hésiter.
            </li>
            <li>
              <strong>Indifférence</strong> <M tex="x \sim y" /> — les deux paniers lui procurent{" "}
              <em>exactement</em> la même satisfaction. Peu importe lequel on lui donne.
            </li>
            <li>
              <strong>Préférence faible</strong> <M tex="x \succsim y" /> — <M tex="x" /> est{" "}
              <em>au moins aussi bien</em> que <M tex="y" /> : soit il le préfère, soit il est
              indifférent. C'est « <M tex="x \succ y" /> <strong>ou</strong> <M tex="x \sim y" /> ».
            </li>
          </ul>
        </Callout>

        <Callout variant="intuition" title="Comment retenir les symboles">
          <p>
            Le symbole <M tex="\succ" /> est comme un « plus grand que » <M tex=">" /> mais pour la
            satisfaction : la pointe vise toujours le panier <em>moins bon</em>. Le <M tex="\sim" />{" "}
            (vague) évoque l'égalité de satisfaction. Et <M tex="\succsim" /> est le « ≥ » de la
            préférence. Tout le vocabulaire savant ne dit qu'une chose :{" "}
            <strong>une relation de préférence range les paniers du moins bon au meilleur.</strong>
          </p>
        </Callout>

        <H4>Des préférences « rationnelles » : les 4 propriétés</H4>

        <p>
          La théorie n'accepte pas n'importe quelles préférences. Pour qu'on puisse les manipuler
          mathématiquement et qu'elles soient <em>cohérentes</em>, elles doivent respecter quatre
          propriétés. <strong>C'est l'une des choses à connaître par cœur du chapitre.</strong>
        </p>

        <CardGrid
          items={[
            {
              title: "1 · Transitivité",
              body: (
                <>
                  Si <M tex="x \succsim y" /> et <M tex="y \succsim z" />, alors{" "}
                  <M tex="x \succsim z" />. Les préférences « se transmettent ». C'est la propriété
                  de <strong>cohérence</strong>.
                </>
              ),
            },
            {
              title: "2 · Monotonie",
              body: (
                <>
                  Plus, c'est toujours mieux. On préfère toujours <strong>davantage</strong> d'un
                  bien. Le travailleur n'est jamais « rassasié ».
                </>
              ),
            },
            {
              title: "3 · Complétude",
              body: (
                <>
                  On peut comparer <strong>n'importe quelle paire</strong> de paniers. Jamais de
                  « je ne sais pas » : la préférence est toujours définie.
                </>
              ),
            },
            {
              title: "4 · Continuité",
              body: (
                <>
                  Deux paniers très <strong>proches</strong> sont jugés presque aussi désirables.
                  Pas de saut brutal de satisfaction.
                </>
              ),
            },
          ]}
        />

        <H4>Pourquoi la transitivité compte vraiment</H4>
        <p>
          Imagine quelqu'un qui préfère le café au thé, le thé au chocolat, mais… le chocolat au
          café. Ses préférences « tournent en rond ». Un commerçant malin pourrait lui faire
          échanger sans fin ses boissons en lui faisant payer à chaque fois, et le ruiner.{" "}
          <strong>Des préférences non transitives sont incohérentes</strong> — c'est pour ça que la
          théorie les interdit.
        </p>

        <Callout variant="attention" title="Ne confonds pas « rationnel » avec « intelligent »">
          <p>
            En économie, « rationnel » ne veut <em>pas</em> dire intelligent, calculateur ou
            égoïste. Ça veut seulement dire : <strong>des préférences cohérentes</strong> (qui
            respectent ces propriétés). Quelqu'un qui adore les choux de Bruxelles est parfaitement
            rationnel tant que ses préférences se tiennent. La rationalité porte sur la{" "}
            <em>cohérence</em> des choix, pas sur leur contenu.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q3"
          question={
            <>
              Lou préfère la pizza aux sushis, et les sushis aux burgers. Par transitivité, que
              peut-on conclure ?
            </>
          }
          options={[
            {
              text: <>Lou préfère les burgers à la pizza.</>,
              explain: (
                <>
                  C'est l'inverse ! La transitivité « transmet » la préférence dans le même sens :
                  pizza ≻ sushis et sushis ≻ burgers donnent pizza ≻ burgers.
                </>
              ),
            },
            {
              text: <>Lou préfère la pizza aux burgers.</>,
              correct: true,
              explain: (
                <>
                  Bien vu : pizza <M tex="\succ" /> sushis et sushis <M tex="\succ" /> burgers,
                  donc par transitivité pizza <M tex="\succ" /> burgers. La chaîne de préférences se
                  transmet.
                </>
              ),
            },
            {
              text: <>On ne peut rien conclure entre pizza et burgers.</>,
              explain: (
                <>
                  Si : c'est exactement ce que la transitivité permet de conclure. Sans elle, en
                  revanche, on ne pourrait effectivement rien dire.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* A.5 + A.6 — Courbes d'indifférence & fonction d'utilité       */}
      {/* ============================================================ */}
      <Section id="indiff" kicker="A.5 · A.6" title="Les courbes d'indifférence">
        <p className="text-[1.15rem] leading-relaxed">
          On a maintenant un moyen visuel génial de représenter les préférences sur notre
          graphique. C'est l'outil le plus important de la partie A.
        </p>

        <Callout variant="definition" title="Courbe d'indifférence">
          <p>
            Une <strong>courbe d'indifférence</strong> relie tous les paniers qui procurent{" "}
            <em>exactement la même satisfaction</em>. Le travailleur est indifférent entre tous les
            points d'une même courbe — d'où le nom. Si <M tex="x \sim x'" />, alors <M tex="x'" />{" "}
            est sur la courbe qui passe par <M tex="x" />.
          </p>
        </Callout>

        <Figure
          caption={
            <>
              <strong>Une courbe, une satisfaction.</strong> <M tex="x" /> et <M tex="x'" /> sont
              sur la même courbe : <M tex="x \sim x'" />. Le panier{" "}
              <strong className="text-rose-600">y</strong> est au-dessus (plus de tout) donc{" "}
              <strong>préféré</strong> : <M tex="y \succ x" />. Le panier{" "}
              <strong className="text-emerald-600">z</strong> est en dessous, donc{" "}
              <strong>moins bon</strong> : <M tex="x \succ z" />. La flèche pointe vers les paniers
              préférés (en haut à droite : plus de loisir <em>et</em> plus de consommation).
            </>
          }
        >
          <FigIndiff />
        </Figure>

        <H4>La carte d'indifférence</H4>
        <p>
          Il n'y a pas qu'une seule courbe : il y en a une infinité, une pour chaque « niveau de
          satisfaction ». L'ensemble de toutes ces courbes s'appelle la{" "}
          <strong>carte d'indifférence</strong>. Plus une courbe est <strong>haute et à droite</strong>,
          plus elle correspond à une satisfaction élevée (grâce à la monotonie : plus de biens =
          mieux).
        </p>

        <Figure
          caption={
            <>
              <strong>La carte d'indifférence</strong> visualise toutes les préférences d'un coup.{" "}
              <strong>Règle d'or :</strong> deux courbes d'indifférence ne se croisent{" "}
              <em>jamais</em>. Si elles se croisaient, le point d'intersection aurait deux niveaux
              de satisfaction différents en même temps — contradiction logique.
            </>
          }
        >
          <FigCarte />
        </Figure>

        <Callout variant="retiens" title="Trouver le choix sur le graphique">
          <p>
            On a maintenant les deux pièces : la{" "}
            <strong className="text-rose-600">contrainte de budget</strong> (le possible) et les{" "}
            <strong className="text-blue-600">courbes d'indifférence</strong> (les préférences). Le
            panier choisi est celui qui atteint la <em>courbe d'indifférence la plus haute
            possible</em> tout en restant sur la contrainte de budget. Géométriquement, c'est le
            point où une courbe d'indifférence <strong>touche</strong> (est tangente à) la droite
            de budget. On va le démontrer mathématiquement juste après.
          </p>
        </Callout>

        <H4>La fonction d'utilité : mettre un chiffre sur les préférences</H4>

        <p>
          Travailler avec des courbes, c'est intuitif mais laborieux. L'astuce de l'économie, c'est
          de traduire les préférences en <strong>nombres</strong>. C'est le rôle de la fonction
          d'utilité.
        </p>

        <Callout variant="definition" title="Fonction d'utilité">
          <p>
            Une <strong>fonction d'utilité</strong> <M tex="U" /> prend un panier en entrée et
            renvoie un nombre, l'<strong>utilité</strong>, qui mesure la satisfaction de ce panier.
            Plus le nombre est grand, plus le panier est aimé. C'est juste une « machine à noter
            les paniers ».
          </p>
        </Callout>

        <Callout variant="exemple" title="Un exemple chiffré">
          <p>
            Supposons <M tex="U(l,c) = (l + 2c)^2" />. Calculons l'utilité du panier{" "}
            <M tex="x = (3, 1)" /> (3 unités de loisir, 1 de consommation). On remplace{" "}
            <M tex="l" /> par 3 et <M tex="c" /> par 1 :
          </p>
          <MB tex="U(3,1) = (3 + 2 \times 1)^2 = 5^2 = 25" />
          <p>
            On remplace, on calcule — l'utilité de ce panier vaut 25. Pas besoin de se demander
            « 25 quoi ? » : le nombre n'a pas d'unité, il sert juste à <strong>comparer</strong>.
            Un panier noté 25 est préféré à un panier noté 13, qui est lui-même préféré à un panier
            noté 2.
          </p>
        </Callout>

        <H4>Le lien exact avec les préférences</H4>
        <p>
          Une fonction d'utilité « représente » les préférences si elle classe les paniers{" "}
          <strong>dans le même ordre</strong>. Formellement :
        </p>

        <FormulaBox
          tex="\begin{aligned} x \succ y &\iff U(x) > U(y) \\ x \sim y &\iff U(x) = U(y) \\ x \succsim y &\iff U(x) \ge U(y) \end{aligned}"
          label="Représentation des préférences"
          caption={
            <>
              « préféré » devient « utilité plus grande » : les symboles de préférence deviennent
              des inégalités de nombres.
            </>
          }
        />

        <Callout variant="intuition" title="Le pont entre les deux mondes">
          <p>
            Voici la traduction complète :{" "}
            <strong>une courbe d'indifférence = un même niveau d'utilité</strong>. Tous les paniers
            d'une courbe ont la même note. Les courbes plus hautes ont des notes plus grandes. Du
            coup, « choisir le meilleur panier accessible » devient un problème purement
            mathématique : <strong>maximiser <M tex="U" /> sous la contrainte de budget</strong>.
            C'est exactement ce qu'on attaque maintenant.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q4"
          question={
            <>
              Avec <M tex="U(l,c) = (l+2c)^2" />, compare le panier <M tex="x = (3, 1)" /> et le
              panier <M tex="y = (2, 2)" />. Que peut-on dire ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <M tex="x \succ y" /> : x est préféré.
                </>
              ),
              explain: (
                <>
                  Recalcule : <M tex="U(3,1) = (3+2)^2 = 25" /> et{" "}
                  <M tex="U(2,2) = (2+4)^2 = 36" />. C'est y qui a la plus grande utilité.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="y \succ x" /> : y est préféré.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : <M tex="U(3,1) = 5^2 = 25" /> et <M tex="U(2,2) = 6^2 = 36" />. Comme{" "}
                  <M tex="36 > 25" />, on a <M tex="y \succ x" />. L'utilité traduit fidèlement la
                  préférence.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="x \sim y" /> : indifférence.
                </>
              ),
              explain: (
                <>
                  Il y aurait indifférence si les deux utilités étaient égales — or 25 ≠ 36. Les
                  deux paniers ne sont pas sur la même courbe d'indifférence.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* A.7 — L'optimisation sous contrainte                          */}
      {/* ============================================================ */}
      <Section id="optim" kicker="A.7" title="L'optimisation sous contrainte">
        <p className="text-[1.15rem] leading-relaxed">
          On arrive à la partie qui fait peur — mais elle est très logique si on la prend
          lentement. Le but : trouver mathématiquement le panier choisi.
        </p>

        <H4>Le problème, en français</H4>
        <p>
          Le travailleur veut : <strong>la plus grande satisfaction possible</strong>, <em>mais</em>{" "}
          il est <strong>coincé par son budget</strong>. En langage mathématique :
        </p>

        <FormulaBox
          tex="\max_{l,\,c}\; U(l,c) \qquad \text{s.c.}\qquad s(1-t)\,l + c \le s(1-t)\,L + M"
          label="Le problème du travailleur"
          caption={<>« maximise l'utilité en choisissant l et c, sans dépasser le budget »</>}
        />

        <p>
          On appelle ça un <strong>problème de maximisation sous contrainte</strong>. Pour le
          résoudre, on utilise un outil standard : le <strong>Lagrangien</strong>. Travaillons sur
          la version générale (deux biens <M tex="x_1, x_2" />, prix <M tex="p_1, p_2" />, revenu{" "}
          <M tex="m" />
          ), c'est exactement le même problème en plus neutre.
        </p>

        <H4>Étape 1 — Construire le Lagrangien</H4>
        <p>
          Le Lagrangien combine en une seule fonction l'objectif (l'utilité) et la contrainte. On
          introduit une nouvelle variable, <M tex="\lambda" /> (« lambda »), appelée{" "}
          <strong>multiplicateur de Lagrange</strong> :
        </p>

        <FormulaBox
          tex="\mathcal{L}(x_1, x_2, \lambda) = U(x_1, x_2) - \lambda\,(p_1 x_1 + p_2 x_2 - m)"
          label="Le Lagrangien"
          caption={<>utilité&nbsp;&nbsp;moins&nbsp;&nbsp;λ × (ce qu'on dépense − ce qu'on a)</>}
        />

        <p>
          L'idée : le terme <M tex="(p_1 x_1 + p_2 x_2 - m)" /> vaut zéro quand on dépense
          exactement son budget. Le <M tex="\lambda" /> agit comme une « pénalité » qui force à
          respecter la contrainte. Pas besoin de comprendre <em>pourquoi</em> cette recette marche
          (c'est un théorème de maths) : il faut savoir l'<strong>appliquer</strong>.
        </p>

        <H4>Étape 2 — Les conditions de premier ordre</H4>
        <p>
          Pour trouver le maximum, on dérive le Lagrangien par rapport à chaque variable et on pose
          chaque dérivée égale à zéro (un maximum, c'est là où « ça ne monte plus »). On note{" "}
          <M tex="U_{m1}" /> et <M tex="U_{m2}" /> les <strong>utilités marginales</strong> —
          c'est-à-dire : « de combien l'utilité augmente si on ajoute une petite unité du bien ».
        </p>

        <FormulaBox
          tex="\begin{aligned} (1)\quad & U_{m1} = \lambda\, p_1 && \leftarrow \text{dérivée par rapport à } x_1 \\ (2)\quad & U_{m2} = \lambda\, p_2 && \leftarrow \text{dérivée par rapport à } x_2 \\ (3)\quad & p_1 x_1^* + p_2 x_2^* = m && \leftarrow \text{dérivée par rapport à } \lambda \end{aligned}"
          label="Les conditions de premier ordre"
          caption={
            <>
              Trois équations, trois inconnues <M tex="(x_1^*, x_2^*, \lambda)" />. L'étoile *
              signale les valeurs optimales.
            </>
          }
        />

        <p>
          L'équation <strong>(3)</strong> a un sens simple : c'est la{" "}
          <strong>condition d'épuisement du revenu</strong>. Comme « plus c'est mieux »
          (monotonie), on dépense <em>tout</em> son budget — l'inégalité ≤ devient une égalité =.
        </p>

        <H4>Étape 3 — La condition de tangence et le TMS</H4>
        <p>
          Maintenant le coup de génie. Divisons l'équation (1) par l'équation (2). Les{" "}
          <M tex="\lambda" /> se simplifient :
        </p>

        <FormulaBox
          tex="\frac{U_{m1}}{U_{m2}} = \frac{p_1}{p_2}"
          label="La condition de tangence"
          caption={<>le TMS = le rapport des prix</>}
        />

        <p>
          Le terme de gauche s'appelle le <strong>taux marginal de substitution</strong> (TMS).
          Voici comment le comprendre, c'est crucial :
        </p>

        <Callout variant="definition" title="Les deux taux d'échange">
          <p>
            <strong>Le TMS (à gauche)</strong> = le taux d'échange <em>subjectif</em>, dans la tête
            du travailleur. « Combien d'unités du bien 2 suis-je prêt à céder pour 1 unité du bien
            1, sans changer ma satisfaction ? » C'est aussi la pente de la courbe d'indifférence.
          </p>
          <p className="mt-2">
            <strong>Le rapport des prix (à droite)</strong> = le taux d'échange <em>objectif</em>,
            imposé par le marché. C'est la pente de la droite de budget.
          </p>
          <p className="mt-2">
            <strong>L'optimum, c'est quand les deux taux s'égalisent.</strong> Tant qu'ils
            diffèrent, il existe un échange avantageux à faire. Quand ils sont égaux, plus aucun
            gain possible : on est au sommet.
          </p>
        </Callout>

        <Figure
          caption={
            <>
              <strong>L'optimum est le point de tangence.</strong> Le panier choisi{" "}
              <M tex="x^*" /> est là où la courbe d'indifférence (bleue) <em>effleure</em> la
              droite de budget (rouge) — elles ont la même pente à ce point. C'est la courbe
              d'indifférence la plus haute qu'on puisse atteindre sans dépasser le budget. En bas :
              le loisir choisi <M tex="l^*" /> et le reste (de <M tex="l^*" /> à <M tex="L" />) qui
              est le travail offert.
            </>
          }
        >
          <FigTangence />
        </Figure>

        <H4>
          Et le fameux <M tex="\lambda" /> ? Son interprétation
        </H4>
        <p>
          Le multiplicateur <M tex="\lambda" /> n'est pas qu'un artifice de calcul : il a un sens
          économique. C'est l'<strong>utilité marginale du revenu</strong> — de combien la
          satisfaction augmenterait si on donnait <strong>1 € de plus</strong> au travailleur. En
          quelque sorte, la « valeur en bonheur » d'un euro supplémentaire.
        </p>

        <Callout variant="attention" title="Les limites de la méthode">
          <p>
            Cette méthode (tangence) ne marche que dans deux conditions : le panier optimal doit
            être <strong>intérieur</strong> (on consomme une quantité positive des deux biens, pas
            tout l'un ou tout l'autre) <em>et</em> la fonction d'utilité doit être{" "}
            <strong>partout dérivable</strong> (lisse, sans angle). Quand le meilleur choix est
            « tout l'un, rien de l'autre », la tangence ne s'applique pas — il faut alors raisonner
            autrement.
          </p>
        </Callout>

        <Callout variant="methode" title="La recette en 4 temps (à mémoriser)">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Écrire le <strong>Lagrangien</strong> = utilité − <M tex="\lambda" />
              (dépense − budget).
            </li>
            <li>
              Dériver et annuler : on obtient <M tex="U_{m1} = \lambda p_1" /> et{" "}
              <M tex="U_{m2} = \lambda p_2" />.
            </li>
            <li>
              Diviser l'une par l'autre : <strong>condition de tangence</strong> — TMS = rapport
              des prix.
            </li>
            <li>
              Combiner avec l'<strong>épuisement du revenu</strong> (on dépense tout) pour trouver
              les quantités.
            </li>
          </ol>
        </Callout>

        <Quiz
          scope="a1"
          id="q5"
          question={<>À l'optimum intérieur du consommateur, la condition de tangence impose que…</>}
          options={[
            {
              text: (
                <>
                  le TMS (pente de la courbe d'indifférence) soit égal au rapport des prix (pente
                  de la droite de budget).
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : le taux d'échange <em>subjectif</em> s'aligne sur le taux d'échange{" "}
                  <em>objectif</em> du marché. Tant qu'ils diffèrent, un échange avantageux reste
                  possible — donc on n'est pas à l'optimum.
                </>
              ),
            },
            {
              text: (
                <>
                  les utilités marginales des deux biens soient égales : <M tex="U_{m1} = U_{m2}" />.
                </>
              ),
              explain: (
                <>
                  Piège classique ! Ce sont les rapports{" "}
                  <M tex="U_{m1}/U_{m2} = p_1/p_2" /> qui s'égalisent, pas les utilités marginales
                  elles-mêmes (sauf si les prix sont égaux).
                </>
              ),
            },
            {
              text: <>l'utilité totale soit égale au revenu dépensé.</>,
              explain: (
                <>
                  L'utilité et le revenu ne sont pas dans la même unité — on ne peut pas les
                  égaliser. La condition liée au revenu est l'<em>épuisement du budget</em> :{" "}
                  <M tex="p_1x_1^* + p_2x_2^* = m" />.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* A.8 + A.9 — Application : la redistribution & Laffer          */}
      {/* ============================================================ */}
      <Section id="redistrib" kicker="A.8 · A.9" title="Application : la redistribution">
        <p className="text-[1.15rem] leading-relaxed">
          On revient à la question du début. On va utiliser tout ce qu'on a construit pour
          étudier : <strong>que se passe-t-il quand on taxe les revenus pour les redistribuer ?</strong>
        </p>

        <H4>Le décor : une petite île</H4>
        <p>
          Imaginons une société simplifiée. Un grand nombre <M tex="N" /> de travailleurs, séparés
          en deux groupes égaux :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            la moitié a un <strong>haut salaire</strong> <M tex="s_H" /> (sol fertile, plus
            productif) ;
          </li>
          <li>
            l'autre moitié a un <strong>bas salaire</strong> <M tex="s_B" /> (sol moins fertile).
          </li>
        </ul>
        <p>Tous ont les mêmes préférences, représentées par une fonction d'utilité précise :</p>

        <FormulaBox
          tex="U(l, c) = c + a \cdot \ln(l) \qquad \text{avec } a > 0"
          label="Les préférences sur l'île"
          caption={<>la satisfaction = consommation + un bénéfice (décroissant) tiré du loisir</>}
        />

        <H4>Comment l'argent est redistribué</H4>
        <p>
          On prélève la taxe <M tex="t" /> sur tous les revenus du travail, et on reverse le total{" "}
          <strong>en parts égales</strong> à chaque travailleur. Chacun reçoit donc un montant{" "}
          <M tex="M(t)" /> — c'est son revenu hors travail, qui dépend maintenant de la taxe. Les{" "}
          <strong>perdants</strong> (hauts salaires) financent les <strong>gagnants</strong> (bas
          salaires) de cette redistribution.
        </p>

        <H4>L'offre de travail optimale</H4>
        <p>
          En appliquant la condition de tangence (TMS = rapport des prix) à ces préférences, on
          trouve le loisir choisi :
        </p>

        <FormulaBox
          tex="l^*(t) = \frac{a}{s(1-t)}"
          label="Le loisir optimal"
          caption={<>le loisir choisi en fonction du salaire et de la taxe</>}
        />

        <p>Cette petite formule contient deux enseignements majeurs :</p>

        <CardGrid
          items={[
            {
              title: "① Plus de taxe → moins de travail",
              body: (
                <>
                  Quand <M tex="t" /> augmente, le dénominateur <M tex="(1-t)" /> diminue, donc{" "}
                  <M tex="l^*" /> <strong>augmente</strong>. Plus de loisir = moins de travail.
                  Taxer décourage de travailler.
                </>
              ),
            },
            {
              title: "② Le montant reçu ne change rien",
              body: (
                <>
                  La formule ne contient pas <M tex="M(t)" /> ! Le travail choisi ne dépend{" "}
                  <strong>pas</strong> de l'argent reçu. C'est dû à la forme « quasi-linéaire » des
                  préférences.
                </>
              ),
            },
          ]}
        />

        <Callout variant="intuition" title="Préférences quasi-linéaires : pourquoi M ne compte pas">
          <p>
            « Quasi-linéaire en revenu » signifie que recevoir plus d'argent <M tex="M" /> ne fait
            que déplacer la consommation vers le haut, <em>sans</em> changer le compromis
            travail/loisir. Sur le graphique, donner plus de <M tex="M" /> décale toute la
            situation vers le haut, mais le point optimal garde la même quantité de loisir. C'est
            une simplification commode qui isole le pur « effet d'incitation » de la taxe.
          </p>
        </Callout>

        <LaborSupplyExplorer />

        <H4>A.9 — La courbe de Laffer : trop taxer tue l'impôt</H4>

        <p>
          Voici un résultat contre-intuitif et célèbre. Combien la redistribution
          rapporte-t-elle réellement ? En remplaçant l'offre de travail optimale dans le calcul, on
          obtient le montant reversé :
        </p>

        <FormulaBox
          tex="M(t) = \frac{(s_H + s_B)\,t}{2} - \frac{a\,t}{1-t}"
          label="Le montant redistribué"
          caption={<>montant redistribué par tête en fonction du taux de taxe</>}
        />

        <p>Regardons les deux extrêmes :</p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>
              Si <M tex="t = 0" />
            </strong>{" "}
            (aucune taxe) : on ne collecte rien, donc <M tex="M = 0" />. Logique.
          </li>
          <li>
            <strong>
              Si <M tex="t = 1" />
            </strong>{" "}
            (taxe de 100 %) : le salaire net tombe à zéro. Plus personne ne travaille (à quoi
            bon ?), donc il n'y a aucun revenu à taxer : <M tex="M = 0" /> aussi !
          </li>
        </ul>

        <p>
          Entre ces deux zéros, le montant collecté monte puis redescend. Il existe donc un taux{" "}
          <M tex="t^*_M" /> qui <strong>maximise</strong> les recettes. Au-delà, taxer davantage
          rapporte <em>moins</em>, car les gens travaillent tellement moins que l'assiette taxable
          s'effondre. C'est la <strong>courbe de Laffer</strong>.
        </p>

        <LafferExplorer />

        <Callout variant="retiens" title="Le message de Laffer">
          <p>
            Plus de taxe ne signifie pas toujours plus de recettes. Comme les gens{" "}
            <strong>réagissent aux incitations</strong> (ils travaillent moins quand on les taxe
            plus), au-delà du sommet <M tex="t^*_M" />, augmenter la taxe est même
            contre-productif : ça réduit le montant disponible pour la redistribution.{" "}
            <strong>
              Au-delà de ce seuil, augmenter la taxe n'est plus dans l'intérêt des travailleurs à
              bas salaire eux-mêmes.
            </strong>
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q6"
          question={
            <>
              Pourquoi les recettes fiscales sont-elles nulles quand la taxe atteint{" "}
              <M tex="t = 1" /> (100 %) ?
            </>
          }
          options={[
            {
              text: <>Parce que l'État est obligé de tout rembourser aux travailleurs.</>,
              explain: (
                <>
                  Non — rien n'oblige l'État à rembourser. Le problème vient du comportement des
                  travailleurs eux-mêmes.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que le salaire net <M tex="s(1-t)" /> tombe à zéro : plus personne ne
                  travaille, donc il n'y a plus aucun revenu à taxer.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Voilà : à 100 % de taxe, travailler ne rapporte plus rien. L'offre de travail
                  s'effondre à zéro et l'assiette taxable disparaît — 100 % de rien, c'est rien.
                  C'est le mécanisme central de la courbe de Laffer.
                </>
              ),
            },
            {
              text: <>Parce que la formule mathématique n'est pas définie en t = 1.</>,
              explain: (
                <>
                  La division par <M tex="1-t" /> pose en effet un souci technique en t = 1, mais
                  la vraie raison est économique : le salaire net nul supprime toute incitation à
                  travailler.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* A.10 — Le critère de Pareto                                   */}
      {/* ============================================================ */}
      <Section id="pareto" kicker="A.10" title="Le critère de Pareto">
        <p className="text-[1.15rem] leading-relaxed">
          On sait prédire les résultats de chaque taxe (analyse positive). Reste à les{" "}
          <strong>juger</strong> (analyse normative). Mais juger, c'est délicat : une taxe aide les
          uns et lèse les autres. Comment trancher sans imposer son opinion sur qui « mérite »
          quoi ? Le critère de Pareto offre une réponse minimale mais puissante.
        </p>

        <H4>Première idée : l'amélioration de Pareto (la domination)</H4>

        <Callout variant="definition" title="Domination au sens de Pareto">
          <p>
            Une allocation <M tex="x" /> <strong>domine</strong> une allocation <M tex="y" /> (au
            sens de Pareto) si :
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>personne n'y perd</strong> : tous les individus trouvent <M tex="x" /> au
              moins aussi bien que <M tex="y" /> — <M tex="U_i(x) \ge U_i(y)" /> pour{" "}
              <em>tout</em> individu <M tex="i" /> ;
            </li>
            <li>
              <strong>au moins un y gagne</strong> : il existe au moins un individu <M tex="j" />{" "}
              qui préfère strictement <M tex="x" /> — <M tex="U_j(x) > U_j(y)" />.
            </li>
          </ul>
        </Callout>

        <p>
          L'idée intuitive : si on peut améliorer le sort de quelqu'un{" "}
          <strong>sans nuire à personne</strong>, alors c'est une amélioration que tout le monde
          devrait accepter. C'est le principe d'<strong>unanimité</strong> : même les plus égoïstes
          ne peuvent pas s'y opposer, puisque personne ne perd.
        </p>

        <p>Prenons 10 unités à partager entre 3 personnes qui ne se soucient que de leur propre part :</p>

        <Tbl
          head={["Comparaison", "Verdict", "Pourquoi"]}
          rows={[
            [
              <strong key="c">(1, 1, 5) vs (1, 1, 4)</strong>,
              <span key="v" className="font-bold text-emerald-600">
                domine
              </span>,
              <>les 2 premiers sont à égalité, le 3ᵉ gagne</>,
            ],
            [
              <strong key="c">(3, 3, 3) vs (1, 1, 4)</strong>,
              <span key="v" className="font-bold text-rose-600">
                ne domine pas
              </span>,
              <>les deux premiers gagnent, mais le 3ᵉ perd !</>,
            ],
          ]}
        />

        <Callout variant="examen" title="Point d'examen : la domination est partielle">
          <p>
            La domination ne permet pas toujours de comparer deux allocations. Dès que l'une est
            meilleure pour Paul mais pire pour Marie, <strong>aucune ne domine l'autre</strong> —
            elles sont incomparables au sens de Pareto. C'est une faiblesse assumée : Pareto reste{" "}
            <em>silencieux</em> sur les arbitrages entre gagnants et perdants, justement pour ne
            pas imposer un jugement de valeur.
          </p>
        </Callout>

        <H4>Deuxième idée : l'efficacité de Pareto</H4>

        <Callout variant="definition" title="Efficacité au sens de Pareto">
          <p>
            Une allocation <M tex="x" /> est <strong>efficace</strong> (au sens de Pareto) si{" "}
            <strong>aucune autre allocation faisable ne la domine</strong>. Autrement dit : il est{" "}
            <em>impossible</em> d'améliorer le sort d'un individu sans dégrader celui d'un autre.
            Une allocation efficace ne <strong>gaspille</strong> aucun bien-être.
          </p>
        </Callout>

        <p>Reprenons le partage de 10 unités :</p>

        <Tbl
          head={["Allocation", "Efficace ?", "Pourquoi"]}
          rows={[
            [
              <strong key="a">(0, 0, 10)</strong>,
              <span key="v" className="font-bold text-emerald-600">
                oui
              </span>,
              <>tout est distribué ; on ne peut donner à l'un sans retirer à l'autre</>,
            ],
            [
              <strong key="a">(3, 3, 3)</strong>,
              <span key="v" className="font-bold text-rose-600">
                non
              </span>,
              <>il reste 1 unité non distribuée : (3, 3, 4) la domine !</>,
            ],
            [
              <strong key="a">(4, 4, 4)</strong>,
              <span key="v" className="font-bold text-slate-400">
                impossible
              </span>,
              <>12 unités : non faisable, on n'en a que 10</>,
            ],
          ]}
        />

        <Callout variant="attention" title="L'erreur à ne SURTOUT pas faire">
          <p>
            <strong>Efficace ≠ juste ≠ égalitaire.</strong> L'allocation (10, 0, 0) — une personne
            a tout, les deux autres rien — est parfaitement <em>efficace</em> au sens de Pareto !
            Alors que (3, 3, 3), bien plus égalitaire, ne l'est <em>pas</em> (elle gaspille 1
            unité). Le critère de Pareto ne dit <strong>rien sur l'égalité</strong>. Il garantit
            seulement qu'on ne gaspille pas : c'est nécessaire mais très loin d'être suffisant pour
            parler de justice.
          </p>
        </Callout>

        <H4>Un raccourci utile : maximiser la somme des utilités</H4>
        <p>Deux conditions <strong>suffisantes</strong> pour qu'une allocation soit efficace :</p>
        <ol className="my-3 list-decimal space-y-1.5 pl-6">
          <li>
            Un individu la préfère strictement à toutes les autres allocations faisables,{" "}
            <strong>ou</strong>
          </li>
          <li>
            Elle <strong>maximise la somme des utilités</strong> de tous les individus.
          </li>
        </ol>
        <p>
          En résumé pratique :{" "}
          <strong>
            si une allocation maximise la somme totale des utilités, elle est efficace.
          </strong>{" "}
          C'est un test rapide bien commode.
        </p>

        <H4>Retour à notre taxe : que peut-on déjà dire ?</H4>
        <p>
          Même sans connaître l'objectif exact du gouvernement, le critère de Pareto donne déjà une
          conclusion forte. Notons <M tex="t^*_{UB}" /> le taux qui maximise l'utilité des bas
          salaires.
        </p>

        <Figure
          caption={
            <>
              <strong>
                Au-delà de <M tex="t^*_{UB}" />, tout le monde perd.
              </strong>{" "}
              Passé ce seuil, augmenter la taxe baisse à la fois l'utilité des hauts salaires
              (bleu) <em>et</em> celle des bas salaires (vert). Ces taux sont donc{" "}
              <strong className="text-rose-600">dominés au sens de Pareto</strong> par{" "}
              <M tex="t^*_{UB}" /> : aucun gouvernement raisonnable ne devrait les choisir, quel
              que soit son objectif. En dessous de <M tex="t^*_{UB}" />, en revanche, on ne peut
              plus trancher sans choisir entre riches et pauvres.
            </>
          }
        >
          <FigParetoTaxe />
        </Figure>

        <Callout variant="intuition" title="La différence à retenir entre les deux concepts">
          <p>
            <strong>L'amélioration</strong> de Pareto compare <em>deux</em> allocations (parfois
            sans pouvoir trancher). <strong>L'efficacité</strong> de Pareto range <em>toutes</em>{" "}
            les allocations faisables en deux catégories : efficaces / inefficaces. Le premier est
            un comparateur, le second est un classificateur.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q7"
          question={
            <>
              On partage 10 unités entre 3 personnes (chacune ne pense qu'à sa part). L'allocation
              (10, 0, 0) est-elle <strong>efficace</strong> au sens de Pareto ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Oui : impossible d'améliorer la personne 2 ou 3 sans retirer quelque chose à la
                  personne 1.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact. Tout est distribué : donner ne serait-ce qu'une miette à quelqu'un exige
                  de la prendre à la personne 1, qui y perd. Aucune allocation faisable ne domine
                  (10, 0, 0) — elle est efficace… même si elle est terriblement inégalitaire.
                </>
              ),
            },
            {
              text: <>Non : elle est trop injuste pour être efficace.</>,
              explain: (
                <>
                  Piège d'examen classique ! L'efficacité de Pareto ne dit <em>rien</em> sur la
                  justice ou l'égalité. Elle vérifie seulement qu'on ne gaspille pas de bien-être.
                </>
              ),
            },
            {
              text: <>Non : (3, 3, 3) la domine puisqu'elle est plus égalitaire.</>,
              explain: (
                <>
                  Non : en passant de (10, 0, 0) à (3, 3, 3), la personne 1 perd 7 unités. Il y a
                  un perdant, donc pas de domination — être « plus égalitaire » ne suffit pas.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* B.1 — L'idée centrale de l'économie comportementale           */}
      {/* ============================================================ */}
      <Section id="comporte" kicker="B.1" title="Économie comportementale : l'idée centrale">
        <p>
          La Partie A décrivait comment une personne <em>parfaitement rationnelle</em> devrait
          choisir. Mais les vrais gens font-ils vraiment ça ? L'économie comportementale répond :{" "}
          <strong>pas toujours — et leurs erreurs sont prévisibles.</strong> Toute cette partie
          tient en une phrase :
        </p>

        <p className="my-4 rounded-xl border-l-4 border-primary bg-accent/50 px-4 py-3 text-[1.1rem] font-semibold">
          Une décision rationnelle n'est pas influencée par des variables non-pertinentes.
        </p>

        <p>
          Décortiquons cette phrase, car tout est dedans. Une variable est <strong>pertinente</strong>{" "}
          si elle change réellement les options entre lesquelles tu choisis. Si une information ne
          modifie <em>en rien</em> le résultat concret de ta décision, alors un être rationnel
          devrait l'ignorer complètement.
        </p>

        <Callout variant="definition" title="Variable non-pertinente">
          <p>
            Une information qui <strong>ne change pas</strong> les conséquences réelles de ton
            choix. Exemple à venir : le fait qu'une calculatrice coûte 15 € ou 200 € ne change rien
            à la question « est-ce que ça vaut le coup de marcher 20 min pour économiser 5 € ? ».
            Le prix total est ici non-pertinent.
          </p>
        </Callout>

        <p>
          La théorie rationnelle <strong>prédit</strong> donc : si deux situations sont identiques
          sauf pour une variable non-pertinente, les gens devraient choisir pareil dans les deux.
          L'économie comportementale va <strong>tester</strong> cette prédiction sur de vraies
          personnes… et constater des écarts.
        </p>

        <Callout variant="intuition" title="Ce qui rend ces écarts intéressants">
          <p>
            Les humains ne se trompent pas <em>au hasard</em>. Ils dévient{" "}
            <strong>toujours dans la même direction</strong>, de façon <strong>prévisible</strong>.
            C'est ça qui transforme « les gens font des erreurs » (banal) en une vraie science : on
            peut anticiper l'erreur, la mesurer, et même s'en servir.
          </p>
        </Callout>

        <p>
          Ces déviations prévisibles ont été révélées par trois moyens : des{" "}
          <strong>expériences de pensée</strong> (on pose une question et on observe les réponses),
          des <strong>expériences en laboratoire</strong>, et des <strong>données réelles</strong>.
          Les sondages des sections suivantes sont de vraies expériences de pensée : les
          pourcentages révélés sont ceux réellement obtenus auprès d'étudiants.{" "}
          <strong>À toi de jouer : vote avant de voir les résultats.</strong>
        </p>
      </Section>

      {/* ============================================================ */}
      {/* B.2 — L'utilité de transaction                                */}
      {/* ============================================================ */}
      <Section id="transaction" kicker="B.2 · Biais n°1" title="L'utilité de transaction">
        <p className="text-[1.15rem] leading-relaxed">
          Premier test — le biais du <strong>prix de référence</strong>. Lis bien la situation,
          puis vote honnêtement avant de dérouler le résultat.
        </p>

        <PollAB
          scenario={
            <>
              Tu es sur le point d'acheter une <strong>calculatrice à 15 €</strong>. Le vendeur
              t'informe que la <em>même</em> calculatrice est à <strong>10 €</strong> dans un
              magasin à 20 minutes de marche.
            </>
          }
          question="Fais-tu le trajet à pied ?"
          options={[
            <>Oui, je marche pour économiser les 5 €</>,
            <>Non, ça ne vaut pas le déplacement</>,
          ]}
          statA={{ version: "Version A · 15 → 10 €", num: "82 %", label: "font le trajet" }}
          statB={{ version: "Version B · 200 → 195 €", num: "25 %", label: "font le trajet" }}
          bias="utilité de transaction"
          explanation={
            <p>
              Il existe une <strong>version B</strong> de ce sondage : calculatrice à{" "}
              <strong>200 €</strong> trouvable à <strong>195 €</strong> ailleurs. Dans les deux
              cas, la <em>vraie</em> question est strictement la même : « es-tu prêt à marcher
              20 min pour économiser <strong>5 €</strong> ? » Le prix total (15 ou 200 €) est une
              variable <strong>non-pertinente</strong>. Un être rationnel répondrait donc pareil
              aux deux versions. Or 82 % marchent dans la version A, mais seulement 25 % dans la
              B : les gens dévient.
            </p>
          }
        />

        <p>
          Comment expliquer cet écart ? La théorie alternative s'appelle la{" "}
          <strong>comptabilité mentale</strong>. Selon elle, toute dépense met en jeu{" "}
          <strong>deux</strong> types d'utilité, et pas un seul.
        </p>

        <CardGrid
          items={[
            {
              title: "Utilité d'acquisition",
              body: (
                <>
                  Le « vrai » surplus de la théorie rationnelle : l'utilité du bien obtenu moins
                  son coût d'opportunité. C'est ce qu'on a vu en Partie A.
                </>
              ),
            },
            {
              title: "Utilité de transaction",
              body: (
                <>
                  La différence entre le prix <strong>payé</strong> et le prix de{" "}
                  <strong>référence</strong> (celui qu'on s'attendait à payer). Faire « une bonne
                  affaire » procure un plaisir <em>en soi</em>. La théorie rationnelle dit
                  d'ignorer ce prix de référence.
                </>
              ),
            },
          ]}
        />

        <p>
          Sur 15 €, économiser 5 € c'est <strong>un tiers du prix</strong> — l'affaire paraît
          énorme, forte utilité de transaction. Sur 200 €, les mêmes 5 € ne sont que{" "}
          <strong>2,5 %</strong> — l'affaire paraît dérisoire. Pourtant les 5 € dans ta poche sont
          rigoureusement identiques.
        </p>

        <Callout variant="exemple" title="L'expérience de la bière sur la plage">
          <p>
            Une deuxième expérience confirme le mécanisme : on demande à des étudiants combien ils
            paieraient pour une bière fraîche rapportée soit d'un <strong>hôtel de luxe</strong>,
            soit d'un <strong>petit supermarché</strong>. Même bière, même plage, même soif. Prix
            moyen annoncé : <strong>4,72 €</strong> pour l'hôtel contre <strong>3,61 €</strong>{" "}
            pour le supermarché. Le prix de référence « hôtel de luxe » est plus élevé, donc on
            accepte de payer plus — alors que le lieu d'achat ne change rien au plaisir de boire.
          </p>
        </Callout>

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            Les commerçants <strong>gonflent artificiellement le prix de référence</strong> (le
            fameux « prix barré » de 199 € → 99 €) pour que tu ressentes une forte utilité de
            transaction et aies l'impression de faire une affaire. Le prix barré n'a souvent jamais
            été pratiqué : c'est une ancre mentale.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* B.3 — Les coûts irrécupérables                                */}
      {/* ============================================================ */}
      <Section id="sunk" kicker="B.3 · Biais n°2" title="Les coûts irrécupérables">
        <p className="text-[1.15rem] leading-relaxed">
          Un coût <strong>irrécupérable</strong> (en anglais : <em>sunk cost</em>) est un argent
          déjà dépensé qu'on ne peut plus récupérer, <strong>quoi qu'on décide ensuite.</strong>
        </p>

        <PollAB
          scenario={
            <>
              Tu as acheté une <strong>place de cinéma à 14 €</strong>. Après 30 minutes, c'est
              clair : le film t'ennuie. Il reste 1 heure. Dehors il fait beau et tu préférerais
              nettement en profiter.
            </>
          }
          question="Que fais-tu ?"
          options={[
            <>Je reste jusqu'au bout (j'ai payé !)</>,
            <>Je quitte la séance et je profite du soleil</>,
          ]}
          statA={{ version: "Version A · place à 14 €", num: "52 %", label: "quittent la séance" }}
          statB={{ version: "Version B · séance gratuite", num: "61 %", label: "quittent la séance" }}
          bias="coûts irrécupérables"
          explanation={
            <p>
              Dans la <strong>version B</strong>, la séance était <strong>gratuite</strong> — tout
              le reste identique. Or que tu restes ou que tu partes, les 14 € sont{" "}
              <strong>déjà perdus</strong> : c'est un coût irrécupérable, donc{" "}
              <strong>non-pertinent</strong> pour la décision. La seule vraie question est :
              « préfères-tu 1 h de soleil ou 1 h de film ennuyeux ? » — et elle est identique dans
              les deux versions. Un être rationnel partirait <em>systématiquement</em> dans les
              deux cas. Pourtant, payer la place fait <em>baisser</em> le taux de départ (52 % vs
              61 %) : les 14 € « retiennent » les gens.
            </p>
          }
        />

        <Callout variant="attention" title="Le réflexe à désamorcer">
          <p>
            « J'ai déjà investi, je ne vais pas abandonner maintenant » est un raisonnement{" "}
            <strong>irrationnel</strong>. Le passé est passé. La seule chose qui compte pour
            décider, c'est l'avenir : <em>à partir de maintenant</em>, qu'est-ce qui me rend la vie
            meilleure ? L'argent ou le temps déjà dépensés ne reviennent pas, quelle que soit la
            décision.
          </p>
        </Callout>

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            Un pays poursuit une <strong>guerre</strong> coûteuse « pour que ses soldats déjà morts
            ne soient pas morts en vain ». Une équipe s'acharne sur un{" "}
            <strong>projet voué à l'échec</strong> pour ne pas « gâcher » les mois déjà investis.
            Dans les deux cas, on jette de nouvelles ressources après les anciennes, déjà perdues.
            La bonne question reste : <em>en repartant de zéro aujourd'hui, est-ce que je m'y
            lancerais ?</em>
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* B.4 — L'effet de dotation                                     */}
      {/* ============================================================ */}
      <Section id="dotation" kicker="B.4 · Biais n°3" title="L'effet de dotation">
        <p className="text-[1.15rem] leading-relaxed">
          L'<strong>effet de dotation</strong> : on exige plus d'argent pour <strong>vendre</strong>{" "}
          un objet qu'on n'accepterait d'en payer pour l'<strong>acheter</strong>. Le simple fait
          de posséder gonfle la valeur perçue.
        </p>

        <PollAB
          scenario={
            <>
              La finale de la Coupe du monde se joue près de chez toi ; les tickets sont sold-out
              mais s'échangent à <strong>200 €</strong> sur eBay. Tu viens de recevoir{" "}
              <strong>200 € inattendus</strong> à dépenser librement.
            </>
          }
          question="Achètes-tu un ticket, ou gardes-tu l'argent ?"
          options={[
            <>J'achète le ticket pour aller à la finale</>,
            <>Je garde les 200 € pour autre chose</>,
          ]}
          statA={{
            version: "Version A · tu as l'argent",
            num: "65 %",
            label: (
              <>
                n'achètent PAS le ticket
                <br />
                (→ le ticket vaut moins de 200 €)
              </>
            ),
          }}
          statB={{
            version: "Version B · tu as le ticket",
            num: "50 %",
            label: (
              <>
                GARDENT le ticket
                <br />
                (→ le ticket vaut plus de 200 €)
              </>
            ),
          }}
          bias="effet de dotation"
          explanation={
            <p>
              Dans la <strong>version B</strong>, on te <em>donne</em> le ticket gratuitement et on
              demande : le gardes-tu ou le revends-tu 200 € ? La vraie question est identique dans
              les deux versions : « préfères-tu la finale, ou 200 € ? » La version A mesure ta{" "}
              <strong>disposition à payer</strong> (pour acheter) ; la version B ta{" "}
              <strong>disposition à accepter</strong> (pour vendre). La théorie rationnelle exige
              qu'elles soient <strong>égales</strong>. Si elles l'étaient, le même % choisirait le
              ticket dans les deux cas. Or 65 % refusent d'<em>acheter</em> mais 50 % refusent de{" "}
              <em>vendre</em> : posséder le ticket le rend soudain plus précieux.
            </p>
          }
        />

        <Callout variant="definition" title="Deux notions clés : DAP et DAA">
          <p>
            <strong>Disposition à payer</strong> (DAP) : le maximum que tu accepterais de{" "}
            <em>débourser</em> pour acquérir un bien que tu n'as pas.
          </p>
          <p className="mt-2">
            <strong>Disposition à accepter</strong> (DAA) : le minimum que tu exigerais pour{" "}
            <em>te séparer</em> d'un bien que tu possèdes.
          </p>
          <p className="mt-2">
            La théorie rationnelle dit : <M tex="\text{DAP} = \text{DAA}" />, car la valeur d'un
            bien ne dépend pas du fait de le posséder ou non. En pratique :{" "}
            <M tex="\text{DAP} < \text{DAA}" />.
          </p>
        </Callout>

        <Callout variant="exemple" title="Une variante frappante : l'antidote">
          <p>
            On demande à des étudiants combien ils paieraient un <strong>antidote</strong> faisant
            passer leur risque de mort de 1/1000 à 0 (disposition à payer) ; et combien ils
            exigeraient pour <strong>accepter</strong> un risque supplémentaire de 1/1000
            (disposition à accepter). Même variation d'un millième de risque vital. Réponses
            moyennes : <strong>127 000 €</strong> pour réduire le risque, mais{" "}
            <strong>438 000 €</strong> pour l'augmenter — plus de <strong>trois fois</strong> plus.
            Réduire son risque = acheter des probabilités de vivre (DAP) ; l'augmenter = en vendre
            (DAA).
          </p>
        </Callout>

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            Les gens ont tendance à vouloir vendre leur{" "}
            <strong>maison au-dessus de sa valeur de marché</strong>, simplement parce qu'elle est{" "}
            <em>la leur</em> — quitte à mettre des mois de plus à la vendre. C'est l'effet de
            dotation appliqué à l'immobilier.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q8"
          question={
            <>
              Que prédit la <strong>théorie rationnelle</strong> sur la disposition à payer (DAP)
              et la disposition à accepter (DAA) pour un même bien ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <M tex="\text{DAP} = \text{DAA}" /> : la valeur d'un bien ne dépend pas du fait
                  de le posséder.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : pour un être rationnel, « combien vaut ce bien pour moi ? » a une seule
                  réponse, qu'il s'agisse de l'acheter ou de le vendre. C'est précisément cette
                  égalité que l'effet de dotation viole : en pratique on observe{" "}
                  <M tex="\text{DAP} < \text{DAA}" />.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\text{DAP} > \text{DAA}" /> : on paie toujours plus qu'on n'exige.
                </>
              ),
              explain: (
                <>
                  Non — et ce n'est ni la prédiction rationnelle, ni ce qu'on observe. En pratique
                  c'est l'inverse : on exige <em>plus</em> pour vendre qu'on n'accepterait de payer.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\text{DAP} < \text{DAA}" /> : posséder augmente la valeur.
                </>
              ),
              explain: (
                <>
                  C'est ce qu'on observe <em>en pratique</em> (l'effet de dotation), mais ce n'est
                  pas la <em>prédiction de la théorie rationnelle</em> — qui exige l'égalité.
                  Attention à bien distinguer prédiction théorique et observation.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* B.5 — Le framing                                              */}
      {/* ============================================================ */}
      <Section id="framing" kicker="B.5 · Biais n°4" title="Le framing">
        <p className="text-[1.15rem] leading-relaxed">
          Le <strong>framing</strong> (ou « cadrage ») : la <strong>manière de formuler</strong> un
          choix change la décision, même quand les options sont rigoureusement identiques.
        </p>

        <PollAB
          scenario={
            <>
              Une maladie menace <strong>600 personnes</strong>. Tu dois choisir une mesure. Les
              effets de la première sont certains ; ceux de la seconde sont aléatoires.
            </>
          }
          question="Que choisis-tu ?"
          options={[
            <>
              Sauver <strong>200 personnes</strong> à coup sûr
            </>,
            <>1 chance sur 3 de sauver les 600 — 2 chances sur 3 de n'en sauver aucune</>,
          ]}
          optionKeys={["A1", "A2"]}
          statA={{
            version: "Version A · « sauver »",
            num: "100 %",
            label: "choisissent A1 (le choix sûr)",
          }}
          statB={{
            version: "Version B · « mourir »",
            num: "39 %",
            label: "choisissent B1 (le choix sûr)",
          }}
          bias="framing (effet de cadrage)"
          explanation={
            <p>
              La <strong>version B</strong> proposait exactement les mêmes mesures, mais formulées
              en termes de <em>morts</em> au lieu de <em>survivants</em> : <strong>B1</strong> =
              « 400 personnes meurent à coup sûr », <strong>B2</strong> = « 1/3 que personne ne
              meure, 2/3 que tous meurent ». Vérifie : sauver 200 sur 600 = laisser mourir 400.{" "}
              <strong>A1 et B1 sont identiques</strong> ; A2 et B2 aussi. Un être rationnel
              choisirait donc pareil. Or, formulé en « sauver », 100 % prennent l'option sûre ;
              formulé en « mourir », seulement 39 %. Les <em>mots</em> « sauver » vs « mourir » —
              variable non-pertinente — renversent le choix.
            </p>
          }
        />

        <Callout variant="intuition" title="Ce qui se passe dans la tête">
          <p>
            Présenté en <strong>gains</strong> (« sauver 200 »), on devient <em>prudent</em> : on
            préfère le sûr. Présenté en <strong>pertes</strong> (« 400 meurent »), on devient{" "}
            <em>preneur de risque</em> : on tente le pari pour éviter la perte certaine. Le cadrage
            positif/négatif active deux attitudes opposées face au risque, alors que la réalité
            chiffrée est identique.
          </p>
        </Callout>

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            « Yaourt <strong>90 % sans matière grasse</strong> » se vend mieux que « contient{" "}
            <strong>10 % de matière grasse</strong> ». Une opération « avec{" "}
            <strong>95 % de réussite</strong> » rassure plus que « 5 % de mortalité ». Mêmes
            chiffres, perception inversée. Les communicants choisissent toujours le cadrage qui
            sert leur message.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* B.6 — Rationnel vs comportemental                             */}
      {/* ============================================================ */}
      <Section id="vs" kicker="B.6" title="Rationnel vs comportemental">
        <p className="text-[1.15rem] leading-relaxed">
          Après ces quatre biais, une question naturelle : faut-il <strong>jeter</strong> la
          théorie rationnelle de la Partie A ? La réponse est <strong>non</strong> — et il faut
          comprendre pourquoi.
        </p>

        <p>
          La clé est que les deux théories ne font pas le même travail. L'économiste Richard Thaler
          (prix Nobel 2017) résume ça d'une formule : la théorie rationnelle décrit les «{" "}
          <strong>Econs</strong> » (des <em>homo economicus</em> parfaits), la théorie
          comportementale décrit les « <strong>Humans</strong> » (nous, avec nos biais).
        </p>

        <Tbl
          head={["", "Théorie rationnelle", "Théorie comportementale"]}
          rows={[
            [
              <strong key="k">Nature</strong>,
              <>
                <strong>Prescriptive</strong>
                <br />
                comment on <em>devrait</em> choisir
              </>,
              <>
                <strong>Descriptive</strong>
                <br />
                comment on choisit <em>vraiment</em>
              </>,
            ],
            [
              <strong key="k">Question</strong>,
              <>Quelle est la décision cohérente avec mes objectifs ?</>,
              <>Quels écarts systématiques observe-t-on en pratique ?</>,
            ],
            [
              <strong key="k">Décrit les…</strong>,
              <>Econs (homo economicus)</>,
              <>Humans (vrais gens)</>,
            ],
            [
              <strong key="k">Sert à</strong>,
              <>guider les décisions importantes</>,
              <>prédire et corriger les erreurs</>,
            ],
          ]}
        />

        <p>
          Trois arguments pour <strong>garder</strong> la théorie rationnelle :
        </p>
        <ol className="my-3 list-decimal space-y-2 pl-6">
          <li>
            <strong>C'est un guide utile.</strong> Étant prescriptive, elle te dit comment décider{" "}
            <em>au mieux</em> quand l'enjeu est important. Connaître les biais de la Partie B,
            c'est justement pouvoir s'en protéger en revenant aux principes rationnels.
          </li>
          <li>
            <strong>C'est le benchmark.</strong> La théorie comportementale ne fait que documenter
            des <em>déviations par rapport à</em> la théorie rationnelle. Sans ce point de
            référence, le mot « biais » n'aurait aucun sens — un biais est un écart, il faut une
            norme pour le mesurer.
          </li>
          <li>
            <strong>C'est souvent une bonne approximation.</strong> Dans énormément de situations
            courantes, les Humans se comportent très proches des Econs. Le modèle rationnel reste
            prédictif la plupart du temps.
          </li>
        </ol>

        <Callout variant="retiens" title="La bonne façon de voir les choses">
          <p>
            Les deux théories sont <strong>complémentaires</strong>, pas concurrentes. La
            rationnelle dit ce qui <em>devrait</em> être ; la comportementale dit ce qui{" "}
            <em>est</em>, et de combien on s'en écarte. On a besoin des deux.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q9"
          multi
          question={
            <>
              Pourquoi <strong>garde-t-on</strong> la théorie rationnelle malgré les biais observés ?
              (Coche toutes les bonnes raisons.)
            </>
          }
          options={[
            {
              text: <>Elle sert de guide prescriptif pour bien décider quand l'enjeu est important.</>,
              correct: true,
              explain: <>Oui — c'est l'argument « guide » : elle dit comment on <em>devrait</em> choisir.</>,
            },
            {
              text: (
                <>
                  Elle est le benchmark sans lequel le mot « biais » (= écart à une norme) n'aurait
                  aucun sens.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui — la théorie comportementale ne documente que des <em>déviations par rapport
                  à</em> la rationnelle.
                </>
              ),
            },
            {
              text: (
                <>
                  Elle reste une bonne approximation des comportements réels dans énormément de
                  situations.
                </>
              ),
              correct: true,
              explain: <>Oui — les Humans se comportent souvent très proches des Econs.</>,
            },
            {
              text: <>Elle décrit toujours fidèlement ce que font les vrais gens.</>,
              explain: (
                <>
                  Non — c'est exactement ce que les quatre biais viennent de réfuter. La théorie
                  rationnelle est prescriptive, pas une description parfaite des Humans.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* B.7 — Le nudge                                                */}
      {/* ============================================================ */}
      <Section id="nudge" kicker="B.7" title="Hors du labo : le nudge">
        <p className="text-[1.15rem] leading-relaxed">
          L'économie comportementale n'est pas qu'un catalogue de curiosités de laboratoire. Son
          programme de recherche tient en <strong>trois volets</strong>.
        </p>

        <CardGrid
          items={[
            {
              title: "1 · Documenter",
              body: (
                <>
                  Mettre en évidence des déviations <strong>systématiques</strong> (les biais), via
                  expériences et données.
                </>
              ),
            },
            {
              title: "2 · Mesurer l'impact réel",
              body: (
                <>
                  Montrer que ces biais affectent vraiment l'économie (les prix de marché, les
                  comportements de masse).
                </>
              ),
            },
            {
              title: "3 · Corriger (nudge)",
              body: (
                <>
                  Proposer des politiques « <strong>coup de pouce</strong> » pour aider les gens à
                  éviter leurs propres erreurs.
                </>
              ),
            },
          ]}
        />

        <p>
          Voici trois exemples réels, hors du laboratoire, qui montrent les deuxième et troisième
          volets en action.
        </p>

        <H4>
          Les taximen de New York{" "}
          <span className="text-sm font-normal text-muted-foreground">(Camerer, 1997)</span>
        </H4>
        <p>
          Les jours de pluie, la demande de taxis explose : le chauffeur attend moins entre deux
          courses, donc son <strong>revenu horaire monte</strong>. Logiquement (comme un Econo), il
          devrait travailler <em>plus</em> ces jours-là, quand chaque heure rapporte gros. En labo,
          94 % des étudiants font ce choix rationnel. Mais dans les vraies données ? Les taximen
          travaillent <strong>moins</strong> les jours rentables. Explication :
          l'<strong>heuristique de la cible de revenus</strong>. Plutôt qu'optimiser sur le mois
          (compliqué), ils suivent une règle simple : « je m'arrête quand j'ai gagné mon objectif
          journalier ». Les bons jours, l'objectif est atteint vite → ils rentrent tôt.
        </p>

        <H4>
          Les crèches de Haïfa{" "}
          <span className="text-sm font-normal text-muted-foreground">(Freakonomics)</span>
        </H4>
        <p>
          Des parents arrivaient souvent en retard. La crèche instaure une <strong>amende</strong>{" "}
          pour chaque retard. Pour un Econo, l'amende rend le retard plus coûteux → les retards
          devraient <em>diminuer</em>. Résultat réel : les retards <strong>augmentent</strong> ! En
          monétisant le retard, on a transformé une question <strong>morale</strong> (« c'est mal
          de faire attendre ») en simple question <strong>économique</strong> (« suis-je prêt à
          payer pour arriver tard ? »). Leçon : instaurer un incitant matériel peut{" "}
          <strong>évincer</strong> l'incitant moral, et produire l'effet inverse.
        </p>

        <H4>
          Le subside EITC{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (Bhargava &amp; Manoli, 2015)
          </span>
        </H4>
        <p>
          Aux États-Unis, l'EITC verse un subside aux travailleurs à bas revenu. Problème :
          beaucoup d'éligibles ne le <strong>réclament pas</strong> (le « non take-up »), même
          après un courrier de rappel. L'expérience : renvoyer un <em>deuxième</em> courrier,
          modifié. Simplement le renvoyer à l'identique → 22 % réclament. Mentionner le{" "}
          <strong>montant</strong> qu'ils toucheraient → 30 % (soit +8 points). Présenter l'info de
          façon <strong>simplifiée</strong> (« En résumé », « Ce que vous devez faire », « Étapes
          suivantes ») → encore plus efficace. Un <em>nudge</em> de pure présentation, sans changer
          un centime du programme, débloque des aides bien réelles.
        </p>

        <Callout variant="intuition" title="L'idée du nudge">
          <p>
            Un nudge ne <em>force</em> personne et ne change pas les options : il modifie juste la{" "}
            <strong>présentation</strong> ou le <strong>réglage par défaut</strong> pour aider les
            gens à faire le choix qui les arrange. Puisque les biais sont prévisibles, on peut
            concevoir l'environnement de décision pour les contrer en douceur.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q10"
          question={
            <>
              Dans les crèches de Haïfa, instaurer une amende pour les retards a{" "}
              <strong>augmenté</strong> les retards. Pourquoi ?
            </>
          }
          options={[
            {
              text: <>Parce que l'amende était trop faible pour dissuader qui que ce soit.</>,
              explain: (
                <>
                  Ce n'est pas l'explication retenue : même une petite amende aurait dû, pour un
                  Econo, réduire au moins un peu les retards — pas les <em>augmenter</em>.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que l'incitant monétaire a évincé l'incitant moral : payer a remplacé la
                  culpabilité de faire attendre.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : en monétisant le retard, on a transformé une question morale
                  (« c'est mal ») en une simple transaction (« je paie, donc j'y ai droit »). Le
                  frein moral, plus puissant que l'amende, a disparu.
                </>
              ),
            },
            {
              text: <>Parce que les parents n'étaient pas informés de l'amende.</>,
              explain: (
                <>
                  Ils étaient bien informés — c'est justement en <em>connaissant</em> l'amende que
                  leur regard sur le retard a changé.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* ★ — À maîtriser absolument                                    */}
      {/* ============================================================ */}
      <Section id="synthese" kicker="★" title="À maîtriser absolument">
        <p className="text-[1.15rem] leading-relaxed">
          Voici l'ossature du chapitre. Si chacun de ces points te parle, tu as tout compris.
        </p>

        <div className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">
          Partie A — le choix rationnel
        </div>
        <MustKnow
          items={[
            <>
              <strong>Positif vs normatif.</strong> L'analyse <em>positive</em> prédit ce qui se
              passe (le modèle : mesure → résultat). L'analyse <em>normative</em> juge ce qui est
              souhaitable (comparer les résultats).
            </>,
            <>
              <strong>La contrainte de budget</strong> délimite les paniers accessibles. Sa pente
              est le <em>prix relatif</em> (coût d'opportunité) : ce à quoi on renonce d'un bien
              pour une unité de l'autre.
            </>,
            <>
              <strong>Les préférences</strong> se notent <M tex="\succ" /> (préféré),{" "}
              <M tex="\sim" /> (indifférent), <M tex="\succsim" /> (au moins aussi bien). Elles
              doivent être <em>transitives, monotones, complètes, continues</em> pour être
              « rationnelles ».
            </>,
            <>
              <strong>Une courbe d'indifférence</strong> relie les paniers de même satisfaction.
              Deux courbes ne se croisent jamais. La <em>fonction d'utilité</em> traduit les
              préférences en nombres : <M tex="x \succ y \iff U(x) > U(y)" />.
            </>,
            <>
              <strong>Le choix optimal</strong> = maximiser l'utilité sous la contrainte de budget.
              On le résout avec le <em>Lagrangien</em>. Résultat : <em>condition de tangence</em>{" "}
              (TMS = rapport des prix) + <em>épuisement du revenu</em>.
            </>,
            <>
              <strong>La courbe de Laffer.</strong> À taux faible, augmenter la taxe rapporte ;
              au-delà d'un seuil, ça décourage le travail et les recettes <em>baissent</em>.
              Recette nulle à <M tex="t=0" /> <em>et</em> à <M tex="t=1" />.
            </>,
            <>
              <strong>L'efficacité de Pareto.</strong> Une allocation est efficace si on ne peut
              améliorer personne sans nuire à quelqu'un.{" "}
              <strong>Attention : efficace ≠ égalitaire.</strong> (0, 0, 10) est efficace,
              (3, 3, 3) ne l'est pas.
            </>,
          ]}
        />

        <div className="mt-8 text-xs font-bold uppercase tracking-widest text-primary">
          Partie B — le choix réel
        </div>
        <MustKnow
          start={8}
          items={[
            <>
              <strong>Le principe.</strong> Une décision rationnelle n'est pas influencée par une{" "}
              <em>variable non-pertinente</em> (qui ne change pas les conséquences réelles). Les
              humains, eux, dévient — de façon <em>prévisible</em>.
            </>,
            <>
              <strong>Utilité de transaction.</strong> On valorise le plaisir de « faire une
              affaire » (prix payé vs prix de référence), d'où la comptabilité mentale.{" "}
              <em>Calculatrice : 82 % vs 25 %.</em>
            </>,
            <>
              <strong>Coûts irrécupérables.</strong> On tient compte d'un argent déjà perdu, alors
              qu'il est non-pertinent. <em>Cinéma ; guerre poursuivie « pour rien ».</em>
            </>,
            <>
              <strong>Effet de dotation.</strong> Disposition à payer {"<"} disposition à
              accepter : posséder un bien gonfle sa valeur perçue. <em>Ticket : 65 % vs 50 %.</em>
            </>,
            <>
              <strong>Framing.</strong> La formulation (gains vs pertes) renverse le choix entre
              options identiques. <em>Maladie : 100 % vs 39 %.</em>
            </>,
            <>
              <strong>Rationnel vs comportemental.</strong> Prescriptif (Econs) vs descriptif
              (Humans). On <em>garde</em> le rationnel : guide, benchmark, et bonne approximation
              fréquente.
            </>,
            <>
              <strong>Le nudge.</strong> Documenter → mesurer l'impact réel → corriger. Un coup de
              pouce de présentation (sans contraindre) aide à éviter les erreurs.{" "}
              <em>EITC, crèches de Haïfa.</em>
            </>,
          ]}
        />

        <p className="mt-4 text-sm text-muted-foreground">
          Note : les pourcentages des sondages de ce chapitre sont ceux réellement observés en
          expérience ; la courbe de Laffer interactive utilise une forme schématique à des fins de
          visualisation.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* ✎ — Exercices corrigés                                        */}
      {/* ============================================================ */}
      <Section id="exos" kicker="✎" title="Exercices corrigés">
        <p className="text-[1.15rem] leading-relaxed">
          Sept exercices pour vérifier que tout est solide. Pour les QCM, choisis une réponse et
          vérifie. Pour les calculs, cherche d'abord sur brouillon, puis déroule la correction
          étape par étape.
        </p>

        {/* Exercice 1 — QCM positif/normatif */}
        <Quiz
          scope="a1"
          id="q11"
          kicker="Exercice 1 · QCM — positif ou normatif"
          question={
            <>
              « Une taxe de 50 % ferait baisser le nombre d'heures travaillées de 12 %. » Cette
              affirmation relève de l'analyse…
            </>
          }
          options={[
            {
              text: <>positive (elle prédit un fait)</>,
              correct: true,
              explain: (
                <>
                  Correct ! C'est une prédiction de fait (ce qui <em>se passe</em>), sans jugement
                  de valeur — le cœur de l'analyse positive, produite par le modèle. Une
                  affirmation normative dirait plutôt « cette taxe est trop élevée » ou « il faut
                  la baisser ».
                </>
              ),
            },
            {
              text: <>normative (elle juge ce qui est souhaitable)</>,
              explain: (
                <>
                  Non : aucune trace de jugement de valeur ici. La phrase prédit un effet chiffré,
                  vrai ou faux selon les faits — c'est du positif.
                </>
              ),
            },
            {
              text: <>ni l'une ni l'autre</>,
              explain: (
                <>
                  Toute affirmation économique de ce type se classe : ici, c'est une prédiction
                  factuelle → analyse positive.
                </>
              ),
            },
          ]}
        />

        {/* Exercice 2 — Lagrangien complet */}
        <ExerciseBlock
          scope="a1"
          id="ex1"
          number={2}
          title="Calcul · l'optimum par le Lagrangien"
          difficulty={2}
          refs={[{ chapter: "a1", section: "optim" }]}
          statement={
            <>
              <p>
                Un consommateur a pour utilité <M tex="U(x_1, x_2) = x_1 \cdot x_2" />. Les prix
                sont <M tex="p_1 = 2" /> et <M tex="p_2 = 4" />, le revenu <M tex="m = 40" />.
                Trouve le panier optimal <M tex="(x_1^*, x_2^*)" />.
              </p>
            </>
          }
          steps={[
            {
              title: "Les utilités marginales",
              content: (
                <p>
                  On dérive <M tex="U" /> par rapport à chaque bien (l'autre est traité comme une
                  constante) : <M tex="U_{m1} = x_2" /> et <M tex="U_{m2} = x_1" />.
                </p>
              ),
            },
            {
              title: "La condition de tangence",
              content: (
                <>
                  <p>On pose TMS = rapport des prix :</p>
                  <MB tex="\frac{U_{m1}}{U_{m2}} = \frac{p_1}{p_2} \;\;\Longrightarrow\;\; \frac{x_2}{x_1} = \frac{2}{4} = \frac{1}{2}" />
                  <p>
                    Donc <strong><M tex="x_1 = 2\,x_2" /></strong>.
                  </p>
                </>
              ),
            },
            {
              title: "L'épuisement du revenu",
              content: (
                <>
                  <p>
                    On injecte dans la contrainte <M tex="p_1 x_1 + p_2 x_2 = m" /> :
                  </p>
                  <MB tex="2\,(2x_2) + 4x_2 = 40 \;\Rightarrow\; 4x_2 + 4x_2 = 40 \;\Rightarrow\; 8x_2 = 40" />
                </>
              ),
            },
            {
              title: "Résultat et vérification",
              content: (
                <>
                  <p>
                    <M tex="x_2^* = 5" />, et donc <M tex="x_1^* = 2 \times 5 = 10" />.
                  </p>
                  <p>
                    Vérification du coût : <M tex="2 \times 10 + 4 \times 5 = 20 + 20 = 40 = m" />{" "}
                    ✓ — le revenu est bien tout dépensé.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              Le panier optimal est <strong>(10, 5)</strong>. Retiens la mécanique : utilités
              marginales → tangence (TMS = rapport des prix) → épuisement du revenu → on résout.
            </p>
          }
        />

        {/* Exercice 3 — réaction à la taxe */}
        <ExerciseBlock
          scope="a1"
          id="ex2"
          number={3}
          title="Calcul · réaction à la taxe"
          difficulty={2}
          refs={[{ chapter: "a1", section: "redistrib" }]}
          statement={
            <>
              <p>
                Sur l'île, le loisir optimal est <M tex="l^*(t) = \dfrac{a}{s(1-t)}" />, avec
                dotation en temps <M tex="L = 1" />. Prends <M tex="a = 0{,}5" /> et{" "}
                <M tex="s = 2" />. <strong>(a)</strong> Quel est le temps de travail pour{" "}
                <M tex="t = 0{,}5" /> ? <strong>(b)</strong> Et pour <M tex="t = 0{,}75" /> ?
                Qu'observe-t-on ?
              </p>
            </>
          }
          steps={[
            {
              title: "Rappel",
              content: (
                <p>
                  Le travail offert = temps total − loisir = <M tex="1 - l^*(t)" />.
                </p>
              ),
            },
            {
              title: "(a) Pour t = 0,5",
              content: (
                <>
                  <MB tex="l^* = \frac{0{,}5}{2\,(1-0{,}5)} = \frac{0{,}5}{1} = 0{,}5" />
                  <p>
                    Donc travail = <M tex="1 - 0{,}5 = \mathbf{0{,}5}" /> (il travaille la moitié
                    de son temps).
                  </p>
                </>
              ),
            },
            {
              title: "(b) Pour t = 0,75",
              content: (
                <>
                  <MB tex="l^* = \frac{0{,}5}{2\,(1-0{,}75)} = \frac{0{,}5}{0{,}5} = 1" />
                  <p>
                    Donc travail = <M tex="1 - 1 = \mathbf{0}" /> (il ne travaille plus du tout !).
                  </p>
                </>
              ),
            },
            {
              title: "Observation",
              content: (
                <p>
                  Plus la taxe monte, plus le salaire net <M tex="s(1-t)" /> baisse, plus le loisir
                  augmente et donc <strong>moins on travaille</strong>. À <M tex="t = 0{,}75" /> le
                  travail tombe à zéro : c'est exactement le mécanisme qui fait <em>redescendre</em>{" "}
                  la courbe de Laffer (plus personne ne travaille, donc plus de recettes).
                </p>
              ),
            },
          ]}
          result={
            <p>
              (a) travail = 0,5 ; (b) travail = 0. La taxe décourage le travail — et c'est ce
              mécanisme comportemental qui explique la forme en cloche de la courbe de Laffer.
            </p>
          }
        />

        {/* Exercice 4 — QCM Pareto */}
        <Quiz
          scope="a1"
          id="q12"
          kicker="Exercice 4 · QCM — efficacité de Pareto"
          question={
            <>
              On partage 10 unités entre 3 personnes (chacune ne pense qu'à sa propre
              consommation). Parmi ces allocations, laquelle est <strong>efficace</strong> au sens
              de Pareto ?
            </>
          }
          options={[
            {
              text: <>(2, 2, 2)</>,
              explain: (
                <>
                  Elle gaspille 4 unités : (2, 2, 6) la domine (personne ne perd, un gagne). Donc
                  pas efficace.
                </>
              ),
            },
            {
              text: <>(3, 3, 3)</>,
              explain: (
                <>
                  Elle gaspille 1 unité : (3, 3, 4) la domine. Égalitaire, oui — efficace, non.
                </>
              ),
            },
            {
              text: <>(2, 3, 5)</>,
              correct: true,
              explain: (
                <>
                  Correct ! Les 10 unités sont toutes distribuées : impossible d'améliorer l'un
                  sans retirer à un autre. Rappel : efficace ne veut PAS dire égalitaire.
                </>
              ),
            },
            {
              text: <>(5, 5, 5)</>,
              explain: (
                <>
                  15 unités alors qu'on n'en a que 10 : allocation non faisable — la question de
                  l'efficacité ne se pose même pas.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Test rapide : une allocation qui laisse des unités non distribuées est toujours
              dominée (on peut donner le reste à quelqu'un sans léser personne) ; une allocation
              infaisable est hors-jeu.
            </>
          }
        />

        {/* Exercice 5 — domination, raisonnement */}
        <ExerciseBlock
          scope="a1"
          id="ex3"
          number={5}
          title="Raisonnement · domination et efficacité"
          difficulty={1}
          refs={[{ chapter: "a1", section: "pareto" }]}
          statement={
            <>
              <p>
                L'allocation (3, 3, 3) <em>domine</em>-t-elle l'allocation (1, 1, 1) au sens de
                Pareto ? Et l'allocation (3, 3, 3) est-elle efficace ? (utilités = consommation,
                total disponible = 10)
              </p>
            </>
          }
          steps={[
            {
              title: "Domination ?",
              content: (
                <p>
                  Oui. En passant de (1, 1, 1) à (3, 3, 3), <em>les trois</em> personnes gagnent
                  (3 {">"} 1 pour chacune). « Tous au moins aussi bien + au moins un strictement
                  mieux » : la définition de la domination est satisfaite.{" "}
                  <strong>(3, 3, 3) domine bien (1, 1, 1).</strong>
                </p>
              ),
            },
            {
              title: "Efficace ?",
              content: (
                <p>
                  Non ! (3, 3, 3) n'utilise que 9 unités sur 10. Il reste 1 unité : l'allocation
                  (3, 3, 4) la domine (personne ne perd, un gagne). Donc (3, 3, 3){" "}
                  <strong>n'est pas efficace</strong>.
                </p>
              ),
            },
            {
              title: "La leçon",
              content: (
                <p>
                  Une allocation peut <em>dominer</em> une autre tout en n'étant <em>pas efficace</em>{" "}
                  elle-même. Dominer = « mieux que cette allocation-ci ». Efficace = « impossible de
                  faire mieux pour tous ». Ce sont deux choses différentes.
                </p>
              ),
            },
          ]}
          result={
            <p>
              (3, 3, 3) domine (1, 1, 1) <em>mais</em> n'est pas efficace. La domination compare
              deux allocations ; l'efficacité teste une allocation contre <em>toutes</em> les
              alternatives faisables.
            </p>
          }
        />

        {/* Exercice 6 — QCM biais */}
        <Quiz
          scope="a1"
          id="q13"
          kicker="Exercice 6 · QCM — quel biais ?"
          question={
            <>
              Marc a un abonnement de salle de sport à 50 €/mois qu'il n'utilise quasiment jamais.
              Il refuse de le résilier en disant : « j'ai déjà payé tellement de mois, ce serait du
              gâchis d'arrêter maintenant. » Quel biais ?
            </>
          }
          options={[
            {
              text: <>Effet de dotation</>,
              explain: (
                <>
                  Non : l'effet de dotation concerne l'écart entre disposition à payer et à
                  accepter pour un bien qu'on possède. Ici, c'est l'argent <em>déjà dépensé</em>{" "}
                  qui pèse sur la décision.
                </>
              ),
            },
            {
              text: <>Coûts irrécupérables</>,
              correct: true,
              explain: (
                <>
                  Oui : Marc laisse de l'argent DÉJÀ dépensé (et irrécupérable) dicter sa décision
                  future. La vraie question est : « à partir de maintenant, est-ce que 50 €/mois en
                  valent la peine pour moi ? » — et la réponse est clairement non. Les mois passés
                  sont perdus quoi qu'il décide.
                </>
              ),
            },
            {
              text: <>Framing</>,
              explain: (
                <>
                  Non : personne n'a reformulé les options de Marc en gains/pertes. C'est le passé
                  déjà payé qui influence sa décision.
                </>
              ),
            },
            {
              text: <>Utilité de transaction</>,
              explain: (
                <>
                  Non : aucun prix de référence ni « bonne affaire » ici. Le problème est que Marc
                  raisonne sur des sommes déjà perdues.
                </>
              ),
            },
          ]}
        />

        {/* Exercice 7 — QCM biais 2 */}
        <Quiz
          scope="a1"
          id="q14"
          kicker="Exercice 7 · QCM — quel biais ?"
          question={
            <>
              Une mutuelle vante un dépistage en disant «{" "}
              <strong>98 % des patients sont rassurés</strong> » plutôt que « 2 % reçoivent un
              résultat inquiétant ». Quel biais exploite-t-elle ?
            </>
          }
          options={[
            {
              text: <>Coûts irrécupérables</>,
              explain: <>Non : aucune dépense passée n'entre en jeu ici.</>,
            },
            {
              text: <>Effet de dotation</>,
              explain: <>Non : il n'est pas question de posséder ou de vendre un bien.</>,
            },
            {
              text: <>Framing</>,
              correct: true,
              explain: (
                <>
                  Oui : « 98 % rassurés » et « 2 % inquiétés » décrivent exactement la même
                  réalité, mais la formulation positive donne une perception plus favorable. C'est
                  le framing (cadrage) : la manière de dire change la décision, pas le fond.
                </>
              ),
            },
            {
              text: <>Aucun, c'est rationnel</>,
              explain: (
                <>
                  Un être rationnel réagirait pareil aux deux formulations (variable
                  non-pertinente). Si la formulation change la perception, c'est bien un biais — le
                  framing.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="Bravo !">
          <p>
            Si tu as réussi ces sept exercices, tu maîtrises l'essentiel du chapitre : construire
            et résoudre le modèle du choix rationnel <em>et</em> reconnaître où les vrais humains
            s'en écartent. C'est exactement ce qu'on attend de toi. Reviens sur les sondages et les
            exercices autant que nécessaire : c'est en refaisant qu'on ancre.
          </p>
        </Callout>
      </Section>
    </ChapterShell>
  );
}
