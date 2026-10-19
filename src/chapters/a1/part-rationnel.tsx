/*
 * Chapitre A1 — approche rationnelle (slides « A1. Préférences et choix –
 * approche rationnelle », 43 p.) : sections intro, offre, pref, indiff,
 * optim, redistrib, pareto.
 *
 * Chiffres de l'app (BRIEF §8) — travailleur seul : s = 2, a = 0,5, L = 1,
 * M = 0,5 ; île : s_H = 5, s_B = 3, a = 0,5, L = 1 (chiffres illustratifs,
 * tous recalculés en Python).
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { BudgetExplorer, LaborSupplyExplorer, LafferExplorer } from "./interactives";
import { Figure, FigMethode, FigIndiff, FigCarte, FigUtilLevels } from "./figures";
import { TangencyExplorer } from "./anim/TangencyExplorer";
import { QuasiLinearExplorer } from "./anim/QuasiLinearExplorer";
import { IslandExplorer } from "./anim/IslandExplorer";
import { ParetoTaxExplorer } from "./anim/ParetoTaxExplorer";
import { H4, CardGrid } from "./ui";

/* ------------------------------------------------------------------ */
/* Helpers locaux : dérivation pas à pas (formule + justification)     */
/* ------------------------------------------------------------------ */

function Steps({ children }: { children: ReactNode }) {
  return <div className="my-4 space-y-2.5">{children}</div>;
}

/**
 * Comme `Tbl` (./ui), mais sans largeur minimale : sur téléphone, les colonnes se
 * resserrent (texte replié) au lieu d'obliger à faire défiler le tableau — sinon la
 * dernière colonne (ex. « Maria » au slide 43) reste cachée hors de l'écran.
 */
function MiniTbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14px] sm:text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-2 py-2.5 text-left align-bottom text-[11px] font-bold uppercase text-muted-foreground sm:px-3.5 sm:text-xs sm:tracking-wide"
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
                <td key={j} className="px-2 py-2.5 align-top sm:px-3.5">
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

function Step({ n, tex, children }: { n: number; tex: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4">
      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="overflow-x-auto">
          <MB tex={tex} />
        </div>
        <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function PartRationnel() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 1 — Introduction & méthode (slides 1-7)                     */}
      {/* ============================================================ */}
      <Section id="intro" kicker="Approche rationnelle · § 1" title="Pourquoi ce chapitre ?">
        <p className="text-[1.15rem] leading-relaxed">
          Imagine que tu sois économiste et qu'on te pose cette question : «{" "}
          <em>les inégalités de revenus augmentent — que faut-il faire ?</em> »
        </p>

        <H4>Ce que montrent les données (slides 3 à 5)</H4>
        <p>
          Le cours s'ouvre sur trois graphiques. Ils montrent quelle <strong>part du revenu total</strong>{" "}
          d'un pays va aux 10 % les mieux payés (le « top 10 % »), aux 40 % du milieu
          (« middle 40 % ») et à la moitié la moins payée (« bottom 50 % »). Trois constats :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>Aux USA, les inégalités augmentent</strong> (1980-2014) : la part du top 10 %
            passe d'environ 34 % à 47 %, celle du bottom 50 % tombe d'environ 20 % à 12,5 %.
          </li>
          <li>
            <strong>En Belgique, elles « stagnent »</strong> (1990-2016) : avant impôt, les trois
            parts ne bougent presque pas.
          </li>
          <li>
            <strong>La taxation réduit les inégalités</strong> : en Belgique, après impôts, la
            moitié la moins payée reçoit environ 30 % du revenu total, plus que les 10 % du haut
            (environ 23 à 26 %), et ce presque chaque année.
          </li>
        </ul>

        <MiniTbl
          head={["Part du revenu total", "Top 10 %", "Middle 40 %", "Bottom 50 %"]}
          rows={[
            [<strong key="c">USA 1980</strong>, "≈ 34 %", "≈ 46 %", "≈ 20 %"],
            [<strong key="c">USA 2014</strong>, "≈ 47 %", "≈ 40,5 %", "≈ 12,5 %"],
            [<strong key="c">Belgique 1990, avant impôt</strong>, "≈ 29 %", "≈ 45 %", "≈ 26 %"],
            [<strong key="c">Belgique 2016, avant impôt</strong>, "≈ 28,5 %", "≈ 47 %", "≈ 24 %"],
            [<strong key="c">Belgique 2016, après impôt</strong>, "≈ 26 %", <span key="n" className="text-muted-foreground">non montré *</span>, "≈ 30 %"],
          ]}
        />
        <p className="-mt-3 text-sm text-muted-foreground">
          Valeurs approximatives lues sur les graphiques des slides 3 à 5 (World Inequality
          Database). Chaque ligne fait à peu près 100 % : les trois groupes se partagent tout le
          revenu. * Sur le slide 5, la courbe du middle 40 % reste la série <em>avant</em> impôt.
          Exception visible sur ce slide : vers 1994-1996, la part du top 10 % après impôt dépasse
          un moment celle du bottom 50 %.
        </p>

        <H4>Que peut-on faire ? (slide 6)</H4>
        <p>Pour lutter contre la hausse des inégalités, le slide 6 cite plusieurs leviers :</p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            réduire l'inégalité des <strong>revenus du travail</strong> — en redistribuant
            davantage ces revenus, en formant mieux les travailleurs à bas revenus, etc. ;
          </li>
          <li>
            réduire l'inégalité des <strong>revenus du capital</strong> ;
          </li>
          <li>améliorer les programmes de soutien aux plus précaires ; etc.</li>
        </ul>
        <p>
          Le cours en étudie un seul : <strong>la redistribution des revenus du travail</strong>{" "}
          (taxer les salaires et reverser l'argent). Et il pose la vraie question :{" "}
          <em>comment un économiste évalue-t-il une telle mesure ?</em>
        </p>

        <p>
          Redistribuer paraît une bonne idée. Mais une taxe plus élevée pourrait décourager les
          gens de travailler, réduire la richesse produite et finalement… appauvrir tout le monde,
          y compris ceux qu'on voulait aider. On ne peut pas trancher « à l'intuition ». Il faut un{" "}
          <strong>outil</strong> qui prédit ce que les gens feront face à une taxe, puis qui juge
          si la situation obtenue est souhaitable.{" "}
          <strong>Cet outil, c'est exactement ce que l'approche rationnelle construit.</strong>
        </p>

        <Callout variant="retiens" title="L'idée à garder en tête tout du long">
          <p>
            Pour évaluer une politique économique (une « <em>mesure</em> »), l'économiste a besoin
            d'un <strong>modèle</strong> du comportement humain. Sans modèle, impossible de prédire
            les effets d'une décision. Toute l'approche rationnelle sert à construire ce modèle du
            choix individuel.
          </p>
        </Callout>

        <p>
          On suit un cas concret tout au long du chapitre : le{" "}
          <strong>choix d'un travailleur</strong> qui décide combien d'heures travailler, sachant
          qu'on prélève une taxe sur son salaire. C'est l'exemple fil rouge.
        </p>

        <H4>La méthode de l'économiste en 3 étapes (slide 7)</H4>
        <ol className="my-3 list-decimal space-y-1.5 pl-6">
          <li>
            <strong>Modéliser</strong> les décisions des agents économiques (ici : comment un
            travailleur choisit ses heures de travail).
          </li>
          <li>
            <strong>Utiliser le modèle</strong> pour comprendre l'impact des politiques étudiées
            (= les <em>mesures</em>) : quelle situation chaque mesure produit-elle ?
          </li>
          <li>
            <strong>Comparer la désirabilité</strong> des situations obtenues avec les différentes
            mesures : laquelle est la meilleure ?
          </li>
        </ol>
        <p>
          Les étapes 1 et 2 forment l'<strong>analyse positive</strong>. L'étape 3, c'est l'
          <strong>analyse normative</strong>. Cette distinction structure tout le cours.
        </p>

        <Callout variant="definition" title="Les deux types d'analyse">
          <p>
            <strong>1. L'analyse positive</strong> décrit <em>ce qui est</em>. Elle prend une
            mesure (ex. une taxe de 30 %) et, grâce au modèle, prédit l'allocation qui en découle :
            combien les gens vont travailler, consommer, etc. C'est purement factuel —{" "}
            <strong>aucun jugement</strong>. On répond à « que va-t-il <em>se passer</em> ? »
          </p>
          <p className="mt-2">
            <strong>2. L'analyse normative</strong> juge <em>ce qui devrait être</em>. Elle compare
            les allocations obtenues avec différentes mesures et dit laquelle est{" "}
            <strong>préférable</strong>. Là, on porte un jugement de valeur. On répond à « quelle
            situation est la <em>meilleure</em> ? »
          </p>
        </Callout>

        <Callout variant="definition" title="Allocation : ce qui sort du modèle">
          <p>
            Une <strong>allocation</strong>, c'est <em>ce que chaque personne obtient au final</em>.
            Dans notre exemple, c'est le panier <M tex="(l, c)" /> — heures de loisir et
            consommation — de chaque travailleur. Une mesure (par exemple une taxe{" "}
            <M tex="t" />) <strong>entre</strong> dans le modèle ; une allocation en{" "}
            <strong>sort</strong>.
          </p>
          <p className="mt-2">
            Quand il y a plusieurs personnes, on écrit <M tex="x = (x_1, x_2, \dots, x_n)" /> : la
            liste des parts de chacun, <M tex="x_i" /> étant ce que reçoit la personne{" "}
            <M tex="i" />.
          </p>
        </Callout>

        <Figure
          caption={
            <>
              <strong>Le schéma du slide 7.</strong> À gauche, le modèle transforme chaque mesure en
              une allocation prédite — c'est l'
              <strong className="text-rose-600">analyse positive</strong>. À droite, la balance
              compare les allocations pour dire laquelle est la plus désirable — c'est l'
              <strong className="text-rose-600">analyse normative</strong>.
            </>
          }
        >
          <FigMethode />
        </Figure>

        <p>
          Le prof résume l'ambition du cours ainsi (slide 7) : «{" "}
          <em>
            l'objectif principal de ce cours est de vous enseigner des outils de modélisation,
            montrer comment les appliquer et évoquer certaines de leurs limites
          </em>{" "}
          ».
        </p>

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

        <H4>Où on en est dans le cours (slide 2)</H4>
        <CardGrid
          items={[
            {
              title: "Partie A · Décision individuelle",
              body: (
                <>
                  1. Préférences et choix <strong>(ce chapitre, A1)</strong> · 2. Décision
                  inter-temporelle (A2) · 3. Décision sous incertitude (A3)
                </>
              ),
            },
            {
              title: "Partie B · Théorie des jeux",
              body: <>1. Jeux simultanés · 2. Jeux séquentiels · 3. Jeux répétés · 4. Jeux bayésiens</>,
            },
          ]}
        />
        <p>
          <strong>Le plan de ce chapitre A1.</strong> Il suit les deux paquets de slides du prof
          consacrés au point 1 de la partie A : « <em>A1. Préférences et choix – approche
          rationnelle</em> » puis « <em>A1. Préférences et choix – approche comportementale</em> ».
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            L'<strong>approche rationnelle</strong> (§ 1 à § 7, ci-dessous) construit, brique par
            brique, le modèle qui prédit comment une personne « parfaitement raisonnable » décide —
            le socle de toute la microéconomie — puis l'applique à la redistribution des revenus.
          </li>
          <li>
            L'<strong>approche comportementale</strong> (les sections suivantes, numérotées à
            nouveau à partir de § 1) confronte ensuite ce modèle aux vrais humains : leurs écarts
            sont systématiques… et prévisibles.
          </li>
        </ul>
      </Section>

      {/* ============================================================ */}
      {/* § 2 — Le modèle d'offre de travail & le budget (slides 8-9)   */}
      {/* ============================================================ */}
      <Section id="offre" kicker="Approche rationnelle · § 2" title="Le modèle d'offre de travail">
        <p className="text-[1.15rem] leading-relaxed">
          La question de départ (slide 8) : «{" "}
          <em>comment un travailleur réagit-il à une augmentation des taxes sur le revenu du travail ?</em>{" "}
          » Pour y répondre, il faut d'abord décrire ce qu'il choisit.
        </p>

        <p>
          Notre personnage est un <strong>travailleur</strong>. Il dispose d'un certain nombre
          d'heures et doit les répartir entre deux usages :
        </p>

        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>Travailler</strong> — ce qui lui rapporte un salaire, donc de l'argent pour
            acheter des biens de consommation ;
          </li>
          <li>
            <strong>Le loisir</strong> (= temps libre) — tout le temps qu'il ne passe <em>pas</em> à
            travailler.
          </li>
        </ul>

        <p>
          Plus il travaille, plus il gagne d'argent (et peut consommer), mais moins il a de temps
          libre. Plus il se repose, plus il a de loisir, mais moins il gagne.{" "}
          <strong>C'est un arbitrage</strong> : on ne peut pas avoir les deux à fond. En
          choisissant son loisir, il choisit du même coup combien de travail il <em>offre</em> —
          d'où le nom « offre de travail ».
        </p>

        <H4>Le vocabulaire et les symboles</H4>
        <p>
          L'économie utilise des lettres pour désigner les quantités. Ça paraît aride au début,
          mais c'est juste une manière compacte de parler. Voici le dictionnaire :
        </p>

        <MiniTbl
          head={["Symbole", "Signification", "En clair"]}
          rows={[
            [<M key="l" tex="l" />, "quantité de loisir", <>les heures qu'il <em>garde</em> pour lui</>],
            [<M key="c" tex="c" />, "quantité de consommation", "les biens qu'il achète"],
            [<M key="L" tex="L" />, "dotation totale en temps", "le nombre d'heures dont il dispose en tout"],
            [<M key="M" tex="M" />, "revenu hors travail", "de l'argent qu'il a même sans travailler"],
            [<M key="w" tex="\omega = (L, M)" />, "dotation", "ce qu'il possède au départ : ses heures disponibles et son revenu hors travail"],
            [<M key="s" tex="s" />, "salaire horaire brut", <>ce qu'une heure de travail rapporte <em>avant</em> impôt</>],
            [<M key="t" tex="t" />, "taxe sur le revenu brut du travail", "la fraction (entre 0 et 1) de chaque euro gagné en travaillant que l'État prélève"],
          ]}
        />

        <Callout variant="definition" title="Le salaire net">
          <p>
            Le slide parle d'une taxe « à la valeur » : l'État prend la <strong>même fraction</strong>{" "}
            <M tex="t" /> de chaque euro de salaire brut. Si <M tex="t = 0{,}3" /> (taxe de 30 %),
            le travailleur ne garde que 70 % de son salaire. Le <strong>salaire net</strong> (ce
            qu'il touche réellement par heure) est donc :
          </p>
          <MB tex="s\,(1-t)" />
          <p>
            <em>salaire horaire net = salaire brut × la part qu'on garde.</em> Exemple : avec{" "}
            <M tex="s = 2" /> et <M tex="t = 0{,}2" />, il touche <M tex="2 \times 0{,}8 = 1{,}6" />{" "}
            par heure. Petite simplification commode du cours : on fixe le prix des biens de
            consommation à 1 (<M tex="p_c = 1" />
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
          sacrifie pour l'obtenir. Le loisir n'est pas « gratuit » — son prix est le salaire net
          perdu : <M tex="p_l = s(1-t)" />.
        </p>

        <p>
          En mettant tout ensemble (dépense en loisir + dépense en consommation ≤ richesse
          totale) :
        </p>

        <FormulaBox
          tex="s(1-t)\,l + c \;\le\; s(1-t)\,L + M"
          label="La contrainte de budget (slide 9)"
          caption={
            <>
              dépense en loisir + consommation&nbsp;&nbsp;≤&nbsp;&nbsp;richesse totale disponible
            </>
          }
        />

        <p>
          Cette inégalité décrit <strong>tous les paniers accessibles</strong>. Un « panier » est
          juste une combinaison <M tex="(l, c)" /> — une certaine quantité de loisir et une
          certaine quantité de consommation. La contrainte sépare le possible de l'impossible.
        </p>

        <p>
          Essaie : fais monter la taxe <M tex="t" /> dans l'animation ci-dessous et regarde ce que
          devient la droite rouge (on décode tout juste après).
        </p>

        <BudgetExplorer />

        <p>
          Sur ce graphique, chaque point sous la droite rouge est un panier que le travailleur peut
          s'offrir. Le point <M tex="\omega" /> (« oméga ») est sa <strong>dotation de départ</strong>{" "}
          : tout en loisir (il ne travaille pas), il ne lui reste que son revenu hors travail{" "}
          <M tex="M" />. La droite a une pente <M tex="-s(1-t)" /> : elle est{" "}
          <em>négative</em> parce que plus de loisir veut dire moins de consommation. Sa{" "}
          <strong>valeur absolue</strong> <M tex="s(1-t)" /> est le prix du loisir : pour 1 h de
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
              Sur le graphique loisir–consommation, la droite de budget a une pente{" "}
              <M tex="-s(1-t)" />. Que représente sa <strong>valeur absolue</strong>{" "}
              <M tex="s(1-t)" /> ?
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
                  salaire net <M tex="s(1-t)" /> de consommation sacrifié. Le signe « − » de la
                  pente dit seulement que l'un monte quand l'autre descend.
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
          La contrainte nous dit ce qui est <em>possible</em>. Restent les deux questions du slide
          9 : <strong>quel panier <M tex="x = (l^*, c^*)" /> le travailleur va-t-il choisir ?</strong>{" "}
          Et <strong>comment ce panier change-t-il quand la taxe <M tex="t" /> augmente ?</strong>{" "}
          Pour y répondre, il nous manque une chose : savoir ce qu'il <em>préfère</em>. C'est
          l'objet de la section suivante.
        </p>
      </Section>

      {/* ============================================================ */}
      {/* § 3 — Les préférences & leurs propriétés (slides 10-11)       */}
      {/* ============================================================ */}
      <Section id="pref" kicker="Approche rationnelle · § 3" title="Les préférences">
        <p className="text-[1.15rem] leading-relaxed">
          Pour prédire le choix, on suppose une chose très naturelle : le travailleur choisit,
          parmi les paniers accessibles, <strong>celui qu'il préfère</strong>. On appelle ça
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
              <strong>Préférence faible</strong> <M tex="x \succeq y" /> — <M tex="x" /> est{" "}
              <em>au moins aussi bien</em> que <M tex="y" /> : soit il le préfère, soit il est
              indifférent. C'est « <M tex="x \succ y" /> <strong>ou</strong> <M tex="x \sim y" /> ».
            </li>
          </ul>
        </Callout>

        <Callout variant="intuition" title="Comment retenir les symboles">
          <p>
            Le symbole <M tex="\succ" /> est comme un « plus grand que » <M tex=">" /> mais pour la
            satisfaction : la pointe vise toujours le panier <em>moins bon</em>. Le <M tex="\sim" />{" "}
            (vague) évoque l'égalité de satisfaction. Et <M tex="\succeq" /> (avec un trait en
            dessous, comme dans « ≥ ») est le « plus grand ou égal » de la préférence. Tout le
            vocabulaire savant ne dit qu'une chose :{" "}
            <strong>une relation de préférence indique l'ordre dans lequel les paniers sont préférés.</strong>
          </p>
        </Callout>

        <H4>Des préférences « rationnelles » : les 4 propriétés (slide 11)</H4>

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
                  Si <M tex="x \succeq y" /> et <M tex="y \succeq z" />, alors{" "}
                  <M tex="x \succeq z" />. Les préférences « se transmettent ». C'est la propriété
                  de <strong>cohérence</strong>.
                </>
              ),
            },
            {
              title: "2 · Monotonie",
              body: (
                <>
                  Plus, c'est toujours mieux. On préfère toujours <strong>davantage</strong> d'un
                  bien. Le travailleur n'arrive jamais à satiété.
                </>
              ),
            },
            {
              title: "3 · Complétude",
              body: (
                <>
                  On peut comparer <strong>n'importe quelle paire</strong> de paniers. Jamais de
                  « je ne sais pas » : la préférence n'est jamais indéterminée.
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
      {/* § 4 — Courbes d'indifférence & fonction d'utilité (sl. 12-16) */}
      {/* ============================================================ */}
      <Section id="indiff" kicker="Approche rationnelle · § 4" title="Les courbes d'indifférence">
        <p className="text-[1.15rem] leading-relaxed">
          On a maintenant un moyen visuel génial de représenter les préférences sur notre
          graphique. C'est l'outil le plus important de l'approche rationnelle.
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
              <strong>Une courbe, une satisfaction (slide 12).</strong> <M tex="x" /> et{" "}
              <M tex="x'" /> sont sur la même courbe : <M tex="x \sim x'" />. Le panier{" "}
              <strong className="text-rose-600">y</strong> est au-dessus de la courbe (il a plus de
              loisir <em>et</em> plus de consommation que <M tex="x" />), donc{" "}
              <strong>préféré</strong> : <M tex="y \succ x" />. Le panier{" "}
              <strong className="text-emerald-600">z</strong> est en dessous, donc{" "}
              <strong>moins bon</strong> : <M tex="x \succ z" />. Le slide résume tout en une
              ligne : <M tex="y \succ x \sim x' \succ z" />. La petite flèche indique la direction
              des paniers préférés.
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
              <strong>La carte d'indifférence (slide 13)</strong> visualise toutes les préférences
              d'un coup. <strong>Règle d'or :</strong> deux courbes d'indifférence ne se croisent{" "}
              <em>jamais</em>. Si elles se croisaient, le point d'intersection aurait deux niveaux
              de satisfaction différents en même temps — contradiction logique.
            </>
          }
        >
          <FigCarte />
        </Figure>

        <Callout variant="retiens" title="Trouver le choix sur le graphique (slide 14)">
          <p>
            On a maintenant les deux pièces : la{" "}
            <strong className="text-rose-600">contrainte de budget</strong> (le possible) et les{" "}
            <strong className="text-blue-600">courbes d'indifférence</strong> (les préférences). Le
            panier choisi est celui qui atteint la <em>courbe d'indifférence la plus haute
            possible</em> tout en restant accessible. Géométriquement, c'est le point où une courbe
            d'indifférence <strong>touche</strong> (est tangente à) la droite de budget. Ces
            analyses graphiques sont intuitives mais laborieuses : on va donc apprendre à trouver
            ce point par le calcul.
          </p>
        </Callout>

        <H4>La fonction d'utilité : mettre un chiffre sur les préférences (slide 15)</H4>

        <p>
          Travailler avec des courbes, c'est intuitif mais laborieux. L'astuce de l'économie, c'est
          de traduire les préférences en <strong>nombres</strong>. C'est le rôle de la fonction
          d'utilité.
        </p>

        <Callout variant="definition" title="Fonction d'utilité">
          <p>
            Une <strong>fonction d'utilité</strong> <M tex="U" /> prend un panier en entrée et
            renvoie un nombre, l'<strong>utilité</strong>, qui indique le niveau de satisfaction de
            ce panier. Plus le nombre est grand, plus le panier est aimé. C'est juste une « machine
            à noter les paniers ».
          </p>
        </Callout>

        <Callout variant="exemple" title="Un exemple chiffré (slide 15)">
          <p>
            Supposons <M tex="U(l,c) = (l + 2c)^2" />. Calculons l'utilité du panier{" "}
            <M tex="x = (3, 1)" /> (3 unités de loisir, 1 de consommation). On remplace{" "}
            <M tex="l" /> par 3 et <M tex="c" /> par 1 :
          </p>
          <MB tex="U(3,1) = (3 + 2 \times 1)^2 = 5^2 = 25" />
          <p>
            On remplace, on calcule — l'utilité de ce panier vaut 25. Pas besoin de se demander
            « 25 quoi ? » : le nombre n'a pas d'unité, il sert juste à <strong>comparer</strong>{" "}
            des paniers entre eux. La figure un peu plus bas montre comment ces nombres
            s'accrochent aux courbes d'indifférence.
          </p>
        </Callout>

        <H4>Le lien exact avec les préférences</H4>
        <p>
          Une fonction d'utilité « représente » les préférences <M tex="\succeq" /> si elle classe
          tous les paniers <strong>dans le même ordre</strong> qu'elles. Formellement :
        </p>

        <FormulaBox
          tex="\begin{aligned} x \succ y &\iff U(x) > U(y) \\ x \sim y &\iff U(x) = U(y) \\ x \succeq y &\iff U(x) \ge U(y) \end{aligned}"
          label="Représentation des préférences"
          caption={
            <>
              « préféré » devient « utilité plus grande » : les symboles de préférence deviennent
              des inégalités de nombres.
            </>
          }
        />

        <p>
          Concrètement, chaque courbe d'indifférence reçoit <strong>un</strong> nombre : son niveau
          d'utilité. Le slide 16 l'illustre avec trois courbes.
        </p>

        <Figure
          caption={
            <>
              <strong>Chaque courbe a son niveau d'utilité (slide 16).</strong> <M tex="x" /> et{" "}
              <M tex="x'" /> sont sur la même courbe : <M tex="U(x) = U(x') = 5" />, donc{" "}
              <M tex="x \sim x'" />. <M tex="z" /> est sur une courbe plus basse :{" "}
              <M tex="U(x) = 5 > 2 = U(z)" />, donc <M tex="x \succ z" />. <M tex="y" /> est sur une
              courbe plus haute : <M tex="U(y) = 13 > 5 = U(x)" />, donc <M tex="y \succ x" />.
            </>
          }
        >
          <FigUtilLevels />
        </Figure>

        <Callout variant="attention" title="Seul l'ordre compte">
          <p>
            Les niveaux 2, 5 et 13 ne veulent rien dire en eux-mêmes. On aurait pu écrire 1, 2 et 3,
            ou −10, 0 et 50 : même classement, donc mêmes préférences. Un panier noté 13 n'est{" "}
            <em>pas</em> « 2,6 fois plus agréable » qu'un panier noté 5 ; il est juste{" "}
            <strong>préféré</strong>. Conséquence pratique : une utilité <em>négative</em>, ou un
            morceau d'utilité négatif, ne pose aucun problème (sur l'île, au § 6, le terme{" "}
            <M tex="a \ln l" /> sera négatif dès que <M tex="l < 1" />).
          </p>
        </Callout>

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
      {/* § 5 — L'optimisation sous contrainte (slides 17-20)           */}
      {/* ============================================================ */}
      <Section id="optim" kicker="Approche rationnelle · § 5" title="L'optimisation sous contrainte">
        <p className="text-[1.15rem] leading-relaxed">
          On arrive à la partie qui fait peur — mais elle est très logique si on la prend
          lentement. Le but : trouver par le calcul le panier choisi.
        </p>

        <H4>Le problème, en français (slide 17)</H4>
        <p>
          Le problème du travailleur consiste à <strong>maximiser son utilité</strong> — c'est sa{" "}
          <strong>fonction objectif</strong> — en choisissant parmi les paniers accessibles —
          c'est sa <strong>contrainte de budget</strong>. En langage mathématique :
        </p>

        <FormulaBox
          tex="\begin{gathered} \max_{l,\,c}\; U(l,c) \\ \text{s.c.}\quad s(1-t)\,l + c \le s(1-t)\,L + M \end{gathered}"
          label="Le problème du travailleur"
          caption={<>« maximise l'utilité en choisissant l et c, sans dépasser le budget » (s.c. = sous contrainte que)</>}
        />

        <p>
          On appelle ça un <strong>problème de maximisation sous contrainte</strong>. Pour le
          résoudre, on maximise une fonction appelée le <strong>Lagrangien</strong>. Travaillons
          sur la version générale du slide 18 (deux biens <M tex="x_1, x_2" />, prix{" "}
          <M tex="p_1, p_2" />, revenu fixe <M tex="m" />
          ) : c'est exactement le même problème, en plus neutre. Pour le travailleur,{" "}
          <M tex="x_1 = l" />, <M tex="x_2 = c" />, <M tex="p_1 = s(1-t)" />,{" "}
          <M tex="p_2 = p_c = 1" /> et <M tex="m = s(1-t)L + M" />.
        </p>

        <FormulaBox
          tex="\begin{gathered} \max_{x_1,\,x_2}\; U(x_1, x_2) \\ \text{s.c.}\quad p_1 x_1 + p_2 x_2 \le m \end{gathered}"
          label="Le problème du consommateur (slide 18)"
        />

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

        <H4>Étape 2 — Les conditions de premier ordre (slide 19)</H4>
        <p>
          Les quantités choisies sont celles qui maximisent le Lagrangien par rapport à{" "}
          <M tex="x_1" />, <M tex="x_2" /> <em>et</em> <M tex="\lambda" />. Pour trouver ce
          maximum, on dérive <M tex="\mathcal{L}" /> par rapport à chacune des trois variables et
          on pose chaque dérivée égale à zéro (au sommet, « ça ne monte plus »). On note{" "}
          <M tex="U_{m1}" /> et <M tex="U_{m2}" /> les <strong>utilités marginales</strong> :
          de combien l'utilité augmente si on ajoute une petite unité du bien 1 ou du bien 2 (ce
          sont les dérivées de <M tex="U" />).
        </p>

        <FormulaBox
          tex="\begin{aligned} &(1)\quad \frac{\partial \mathcal{L}}{\partial x_1} = U_{m1} - \lambda p_1 = 0 \\ &\qquad\quad \iff U_{m1} = \lambda\, p_1 \\[4pt] &(2)\quad \frac{\partial \mathcal{L}}{\partial x_2} = U_{m2} - \lambda p_2 = 0 \\ &\qquad\quad \iff U_{m2} = \lambda\, p_2 \\[4pt] &(3)\quad \frac{\partial \mathcal{L}}{\partial \lambda} = -(p_1 x_1^* + p_2 x_2^* - m) = 0 \\ &\qquad\quad \iff p_1 x_1^* + p_2 x_2^* = m \end{aligned}"
          label="Les trois conditions de premier ordre"
          caption={
            <>
              Un système de trois équations à trois inconnues <M tex="x_1^*, x_2^*, \lambda" />.
              L'étoile * signale les valeurs optimales.
            </>
          }
        />

        <p className="text-sm text-muted-foreground">
          Détail de signe : le slide écrit{" "}
          <M tex="\partial \mathcal{L} / \partial \lambda = p_1x_1^* + p_2x_2^* - m" />. La dérivée
          exacte porte un signe « − » devant, mais comme on l'égale à zéro, cela ne change rien au
          résultat.
        </p>

        <p>
          L'équation <strong>(3)</strong> a un sens simple : c'est la{" "}
          <strong>condition d'épuisement du revenu</strong>. Comme « plus c'est mieux »
          (monotonie), on dépense <em>tout</em> son budget — l'inégalité ≤ devient une égalité =.
          Les solutions <M tex="x_1^*" /> et <M tex="x_2^*" /> s'appellent les{" "}
          <strong>fonctions de demande</strong> : elles disent quelle quantité de chaque bien la
          personne demande, en fonction des prix et de son revenu.
        </p>

        <H4>Étape 3 — La condition de tangence et le TMS (slide 20)</H4>
        <p>
          Maintenant le coup de génie. Divisons l'équation (1) par l'équation (2). Les{" "}
          <M tex="\lambda" /> se simplifient :
        </p>

        <FormulaBox
          tex="\frac{U_{m1}}{U_{m2}} = \frac{\lambda\, p_1}{\lambda\, p_2} = \frac{p_1}{p_2}"
          label="La condition de tangence"
          caption={<>le taux marginal de substitution (TMS) = le rapport des prix</>}
        />

        <p>
          Le terme de gauche s'appelle le <strong>taux marginal de substitution</strong> (TMS).
          Voici comment le comprendre, c'est crucial :
        </p>

        <Callout variant="definition" title="Les deux taux d'échange">
          <p>
            <strong>Le TMS (à gauche)</strong> = le taux d'échange <em>subjectif</em>, dans la tête
            de la personne : « combien d'unités du bien 2 suis-je prêt à céder pour 1 unité de plus
            du bien 1, sans changer ma satisfaction ? ». Sur le graphique, c'est la{" "}
            <strong>valeur absolue de la pente</strong> de la courbe d'indifférence (la pente
            elle-même est négative).
          </p>
          <p className="mt-2">
            <strong>Le rapport des prix (à droite)</strong> = le taux d'échange <em>objectif</em>,
            imposé par le marché. C'est la valeur absolue de la pente de la droite de budget.
          </p>
          <p className="mt-2">
            <strong>L'optimum, c'est quand les deux taux s'égalisent.</strong> Tant qu'ils
            diffèrent, il existe un échange avantageux à faire. Quand ils sont égaux, plus aucun
            gain possible : on est au sommet.
          </p>
        </Callout>

        <Callout variant="exemple" title="Le TMS en chiffres, pour notre travailleur">
          <p>
            Prenons un travailleur avec <M tex="U(l, c) = c + 0{,}5 \ln l" /> (la forme qu'on
            retrouvera sur l'île au § 6), salaire brut <M tex="s = 2" />, taxe{" "}
            <M tex="t = 0{,}2" />, revenu hors travail <M tex="M = 0{,}5" /> et <M tex="L = 1" />.
            Ici <M tex="U_{ml} = 0{,}5/l" /> (l'utilité marginale du loisir) et <M tex="U_{mc} = 1" /> (l'utilité marginale de la consommation), donc{" "}
            <M tex="\text{TMS} = 0{,}5/l" />. Le prix du loisir est le salaire net{" "}
            <M tex="2 \times 0{,}8 = 1{,}6" />.
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              À <M tex="l = 0{,}2" /> : <M tex="\text{TMS} = 0{,}5/0{,}2 = 2{,}5 > 1{,}6" />. Une
              heure de loisir vaut 2,5 unités de consommation pour lui, mais ne lui coûte que 1,6 :
              il gagne à prendre <strong>plus</strong> de loisir.
            </li>
            <li>
              À <M tex="l = 0{,}5" /> : <M tex="\text{TMS} = 1 < 1{,}6" />. L'heure de loisir lui
              coûte plus qu'elle ne lui rapporte : il gagne à en prendre <strong>moins</strong>.
            </li>
            <li>
              À <M tex="l^* = 0{,}5/1{,}6 = 0{,}3125" /> : <M tex="\text{TMS} = 1{,}6" /> = prix.
              C'est l'optimum, avec <M tex="c^* = 0{,}5 + 1{,}6 \times (1 - 0{,}3125) = 1{,}6" />.
            </li>
          </ul>
        </Callout>

        <p>
          À toi de jouer. Fais glisser le panier le long de la droite de budget de ce travailleur
          et compare à chaque fois le TMS au prix 1,6 : regarde dans quel sens la courbe
          d'indifférence « coupe » la droite, et ce qui se passe quand elle ne fait plus que la{" "}
          <em>toucher</em>.
        </p>

        <TangencyExplorer />

        <p>
          Leçon : tant que la courbe d'indifférence <em>coupe</em> la droite, une partie de la
          courbe passe au-dessus d'elle dans la zone accessible — on peut donc trouver mieux. Le
          meilleur panier est celui où la courbe ne fait que <strong>toucher</strong> la droite :
          même pente, donc TMS = rapport des prix. Sur l'axe horizontal, le segment de 0 à{" "}
          <M tex="l^*" /> est le loisir choisi, et le reste (de <M tex="l^*" /> à <M tex="L" />)
          est le travail offert.
        </p>

        <H4>
          Et le fameux <M tex="\lambda" /> ? Son interprétation (slide 18)
        </H4>
        <p>
          Le multiplicateur <M tex="\lambda" /> n'est pas qu'un artifice de calcul : il a un sens
          économique. C'est l'<strong>utilité marginale du revenu</strong> — de combien l'utilité
          augmenterait si on donnait <strong>une unité de revenu de plus</strong> (1 €) à la
          personne. En quelque sorte, la « valeur en satisfaction » d'un euro supplémentaire.
        </p>

        <Callout variant="exemple" title="La méthode complète sur un exemple (et la valeur du multiplicateur)">
          <p>
            Soit <M tex="U(x_1, x_2) = x_1 x_2" />, avec <M tex="p_1 = 1" />, <M tex="p_2 = 2" /> et{" "}
            <M tex="m = 20" />. Le Lagrangien est{" "}
            <M tex="\mathcal{L} = x_1 x_2 - \lambda\,(x_1 + 2x_2 - 20)" />.
          </p>
          <Steps>
            <Step n={1} tex="\frac{\partial \mathcal{L}}{\partial x_1} = x_2 - \lambda = 0 \;\Rightarrow\; x_2 = \lambda">
              On dérive par rapport à <M tex="x_1" /> en traitant <M tex="x_2" /> et{" "}
              <M tex="\lambda" /> comme des constantes : la dérivée de <M tex="x_1 x_2" /> est{" "}
              <M tex="x_2" />, celle de <M tex="-\lambda x_1" /> est <M tex="-\lambda" />.
            </Step>
            <Step n={2} tex="\frac{\partial \mathcal{L}}{\partial x_2} = x_1 - 2\lambda = 0 \;\Rightarrow\; x_1 = 2\lambda">
              Même chose par rapport à <M tex="x_2" /> : la dérivée de <M tex="-\lambda \cdot 2x_2" />{" "}
              est <M tex="-2\lambda" />.
            </Step>
            <Step n={3} tex="\begin{aligned} \frac{\partial \mathcal{L}}{\partial \lambda} &= -(x_1 + 2x_2 - 20) = 0 \\ &\Rightarrow\; x_1 + 2x_2 = 20 \end{aligned}">
              Par rapport à <M tex="\lambda" /> : on retrouve l'épuisement du revenu.
            </Step>
            <Step n={4} tex="\frac{x_2}{x_1} = \frac{1}{2} \;\Rightarrow\; x_1 = 2x_2">
              On divise (1) par (2) : c'est la condition de tangence{" "}
              <M tex="U_{m1}/U_{m2} = p_1/p_2" />.
            </Step>
            <Step n={5} tex="\begin{gathered} 2x_2 + 2x_2 = 20 \;\Rightarrow\; x_2^* = 5,\; x_1^* = 10 \\ \lambda = x_2^* = 5 \end{gathered}">
              On remplace <M tex="x_1" /> par <M tex="2x_2" /> dans (3). Puis (1) donne{" "}
              <M tex="\lambda" />. L'utilité maximale vaut <M tex="U^* = 10 \times 5 = 50" />.
            </Step>
          </Steps>
          <p>
            <strong>Vérifions le sens de λ.</strong> Avec <M tex="m = 21" /> (un euro de plus), le
            même calcul donne <M tex="x_1^* = 10{,}5" /> et <M tex="x_2^* = 5{,}25" />, donc{" "}
            <M tex="U^* = 55{,}125" /> : l'utilité augmente d'environ 5, exactement ce qu'annonçait{" "}
            <M tex="\lambda = 5" />. Et en refaisant le calcul avec des prix et un revenu
            quelconques, on obtient les <strong>fonctions de demande</strong>{" "}
            <M tex="x_1^* = m/(2p_1)" /> et <M tex="x_2^* = m/(2p_2)" />.
          </p>
        </Callout>

        <Callout variant="attention" title="Les limites de la méthode (slide 20)">
          <p>
            Telle que présentée ici, la méthode ne marche que si le panier optimal est{" "}
            <strong>intérieur</strong> (pas collé à un bord de l'ensemble accessible : on consomme
            une quantité positive des deux biens et, pour le travailleur, on ne prend pas tout son
            temps en loisir) <em>et</em> si la fonction d'utilité est{" "}
            <strong>partout dérivable</strong> (lisse, sans angle). Quand le meilleur choix est sur
            un bord (une <em>solution en coin</em> : « tout l'un, rien de l'autre », ou tout son
            temps en loisir), la tangence ne s'applique pas — il faut raisonner autrement. On en
            verra un exemple sur l'île : quand la taxe devient trop forte, les bas salaires arrêtent
            complètement de travailler (<M tex="l^*_B = 1" />
            ).
          </p>
          <p className="mt-2">
            Autre précaution : pour être sûr que le point trouvé est bien un <em>maximum</em>, il
            faudrait vérifier les <strong>conditions de second ordre</strong>. Le cours ne le fait
            pas, car la <strong>convexité des préférences</strong> le garantit. Préférences
            convexes = on préfère les mélanges aux extrêmes ; sur le graphique, des courbes
            d'indifférence bombées vers l'origine (comme toutes celles de ce chapitre).
          </p>
        </Callout>

        <Callout variant="methode" title="La recette en 4 temps (à mémoriser)">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Écrire le <strong>Lagrangien</strong> = utilité − <M tex="\lambda" />
              (dépense − budget).
            </li>
            <li>
              Dériver par rapport à <M tex="x_1" />, <M tex="x_2" />, <M tex="\lambda" /> et
              annuler : <M tex="U_{m1} = \lambda p_1" />, <M tex="U_{m2} = \lambda p_2" /> et
              l'épuisement du revenu.
            </li>
            <li>
              Diviser les deux premières : <strong>condition de tangence</strong> — TMS = rapport
              des prix.
            </li>
            <li>
              Combiner avec l'<strong>épuisement du revenu</strong> (on dépense tout) pour trouver
              les quantités (les fonctions de demande), puis <M tex="\lambda" /> si on le demande.
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
                  le TMS (valeur absolue de la pente de la courbe d'indifférence) soit égal au
                  rapport des prix (valeur absolue de la pente de la droite de budget).
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
      {/* § 6 — Application : la redistribution (slides 21-34, 36)      */}
      {/* ============================================================ */}
      <Section id="redistrib" kicker="Approche rationnelle · § 6" title="Application : la redistribution">
        <p className="text-[1.15rem] leading-relaxed">
          On revient à la question du début et on utilise tout ce qu'on a construit pour étudier :{" "}
          <strong>que se passe-t-il quand on taxe les revenus du travail pour les redistribuer ?</strong>
        </p>

        <p>
          La question précise du slide 23 est : <strong>quel niveau de taxation{" "}
          <M tex="t \in [0, 1]" /> choisir ?</strong> On applique la méthode du § 1 en deux
          temps :
        </p>
        <ol className="my-3 list-decimal space-y-1.5 pl-6">
          <li>
            <strong>Analyse positive</strong> (ce § 6) : pour chaque niveau de taxe, prédire
            l'allocation qui en résulte ;
          </li>
          <li>
            <strong>Analyse normative</strong> (§ 7) : comparer les allocations des différents
            niveaux de taxe.
          </li>
        </ol>

        <Figure
          caption={
            <>
              <strong>Le schéma du slide 23.</strong> Les « mesures » sont maintenant des niveaux
              de taxe <M tex="t_1" />, <M tex="t_2" />… Le modèle de l'île transforme chacun en une
              allocation (qui travaille combien, qui consomme combien) ; on compare ensuite ces
              allocations.
            </>
          }
        >
          <FigMethode inputs={["Taxe t₁", "Taxe t₂"]} />
        </Figure>

        <H4>Le décor : une petite île (slide 21)</H4>
        <p>
          Imaginons une île où tous les travailleurs sont des <strong>agriculteurs</strong>. La
          moitié exploite un sol fertile, l'autre moitié un sol moins fertile. Ceux du sol fertile
          produisent plus par heure travaillée : leur « salaire » brut est plus élevé. Plus
          précisément :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            la société compte un <strong>grand nombre</strong> <M tex="N" /> de travailleurs ;
          </li>
          <li>
            <M tex="N_H = N/2" /> travailleurs ont un <strong>haut salaire</strong> brut{" "}
            <M tex="s_H" /> (sol fertile) ;
          </li>
          <li>
            <M tex="N_B = N/2" /> travailleurs ont un <strong>bas salaire</strong> brut{" "}
            <M tex="s_B" /> (sol moins fertile) ;
          </li>
          <li>
            tous ont la même dotation en temps <M tex="L = 1" /> (« pour faire simple » : 1 =
            tout leur temps disponible) ;
          </li>
          <li>tous ont les mêmes préférences, représentées par :</li>
        </ul>

        <FormulaBox
          tex="U(l, c) = c + a \cdot \ln(l) \qquad \text{avec } a > 0"
          label="Les préférences sur l'île"
          caption={
            <>
              la satisfaction = consommation + un bénéfice tiré du loisir, qui augmente avec le
              loisir mais de moins en moins vite
            </>
          }
        />

        <Callout variant="intuition" title="Lire cette fonction d'utilité, terme par terme">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <M tex="c" /> compte « tel quel » : chaque unité de consommation en plus ajoute
              exactement 1 à l'utilité (<M tex="U_{mc} = 1" />
              ).
            </li>
            <li>
              <M tex="a \ln l" /> <strong>augmente</strong> avec le loisir, mais{" "}
              <strong>de moins en moins vite</strong> : son utilité marginale est{" "}
              <M tex="U_{ml} = a/l" />, qui diminue quand <M tex="l" /> grandit. Avec{" "}
              <M tex="a = 0{,}5" />, passer de 0,1 à 0,2 de loisir rapporte{" "}
              <M tex="0{,}5 \ln 2 \approx 0{,}35" />, mais passer de 0,8 à 0,9 ne rapporte que{" "}
              <M tex="0{,}5 \ln(9/8) \approx 0{,}06" />.
            </li>
            <li>
              <M tex="a" /> mesure le <strong>goût pour le loisir</strong> : plus <M tex="a" /> est
              grand, plus la personne tient à son temps libre.
            </li>
            <li>
              Comme <M tex="l \le 1" />, <M tex="\ln l" /> est négatif (ou nul) : l'utilité peut
              être négative. Aucune importance, car seul l'ordre compte (slides 15-16, § 4).
            </li>
          </ul>
        </Callout>

        <Callout variant="methode" title="Les chiffres utilisés dans cette app">
          <p>
            Les slides gardent des lettres. Pour les exemples chiffrés et les animations, on prend{" "}
            <M tex="s_H = 5" />, <M tex="s_B = 3" /> et <M tex="a = 0{,}5" /> — des{" "}
            <strong>chiffres illustratifs</strong>, choisis pour que les figures des slides 32 à
            38 soient reproduites fidèlement. À l'examen, garde les formules en lettres.
          </p>
        </Callout>

        <H4>Comment l'argent est redistribué (slide 22)</H4>
        <p>
          Un travailleur qui garde <M tex="l" /> heures de loisir travaille <M tex="1 - l" /> heures
          (puisque <M tex="L = 1" />
          ). Son revenu brut du travail est <M tex="s(1-l)" />, l'État en prend la fraction{" "}
          <M tex="t" />, il lui reste :
        </p>

        <FormulaBox
          tex="s_H\,(1-t)(1-l_H) \quad\text{et}\quad s_B\,(1-t)(1-l_B)"
          label="Revenus du travail après la taxe"
          caption={<>pour un travailleur à haut salaire et pour un travailleur à bas salaire</>}
        />

        <p>
          L'État additionne ce qu'il a prélevé. Les <M tex="N/2" /> hauts salaires paient chacun{" "}
          <M tex="t\,s_H(1-l_H)" />, les <M tex="N/2" /> bas salaires paient chacun{" "}
          <M tex="t\,s_B(1-l_B)" /> :
        </p>

        <FormulaBox
          tex="T(t) = \frac{N}{2}\, s_H\, t\,(1-l_H) + \frac{N}{2}\, s_B\, t\,(1-l_B)"
          label="Le montant total de la taxe"
        />

        <p>
          Ce total est redistribué <strong>en parts égales</strong> : chacun des <M tex="N" />{" "}
          travailleurs reçoit <M tex="T(t)/N" />. En divisant par <M tex="N" />, les{" "}
          <M tex="N/2" /> deviennent des <M tex="1/2" /> :
        </p>

        <FormulaBox
          tex="M(t) = \frac{T(t)}{N} = \frac{t}{2}\,\big(s_H(1-l_H) + s_B(1-l_B)\big)"
          label="Le montant reçu par chaque travailleur"
          caption={<>c'est son nouveau « revenu hors travail » : il dépend maintenant de la taxe</>}
        />

        <Callout variant="exemple" title="En chiffres : une taxe de 50 % et 1 000 travailleurs">
          <p>
            Prenons <M tex="t = 0{,}5" /> et <M tex="N = 1\,000" /> travailleurs (500 de chaque
            type). Supposons que les hauts salaires travaillent 0,8 (gardent{" "}
            <M tex="l_H = 0{,}2" />) et les bas salaires 2/3 (gardent <M tex="l_B = 1/3" />) — on
            verra plus bas que ce sont exactement leurs choix optimaux à cette taxe.
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Chaque haut salaire paie <M tex="0{,}5 \times 5 \times 0{,}8 = 2" /> ; chaque bas
              salaire paie <M tex="0{,}5 \times 3 \times 2/3 = 1" />.
            </li>
            <li>
              Total : <M tex="T = 500 \times 2 + 500 \times 1 = 1\,500" />, donc chacun reçoit{" "}
              <M tex="M = 1\,500 / 1\,000 = 1{,}5" />. La formule donne pareil :{" "}
              <M tex="\tfrac{0{,}5}{2}(5 \times 0{,}8 + 3 \times 2/3) = 0{,}25 \times 6 = 1{,}5" />.
            </li>
          </ul>
        </Callout>

        <Callout variant="attention" title="Qui gagne, qui perd ?">
          <p>
            Dans l'exemple, un haut salaire paie 2 et reçoit 1,5 : il perd 0,5. Un bas salaire paie
            1 et reçoit 1,5 : il gagne 0,5. En général,{" "}
            <strong>
              les hauts salaires paient plus de taxe qu'ils ne reçoivent, les bas salaires
              reçoivent plus qu'ils ne paient
            </strong>{" "}
            (le transfert net vaut <M tex="t(s_H - s_B)/2" /> quand chacun choisit son loisir
            optimal ; ici <M tex="0{,}5 \times 2/2 = 0{,}5" />
            ). <em>Mais</em> attention : recevoir de l'argent n'est pas tout. On verra (§ 7, slide
            38) qu'une taxe trop élevée peut quand même <strong>réduire le bien-être</strong> des
            bas salaires.
          </p>
        </Callout>

        <H4>1. Analyse positive : relier chaque taxe à son allocation (slide 24)</H4>
        <p>
          Sur l'île, une allocation, c'est le panier de chaque groupe :{" "}
          <M tex="\big((l_H, c_H), (l_B, c_B)\big)" />. Pour la prédire, on cherche le temps de
          travail <M tex="1 - l^*_H(t)" /> et <M tex="1 - l^*_B(t)" /> que chaque travailleur
          choisit pour maximiser son utilité, en fonction de <M tex="t" />.
        </p>

        <Callout variant="retiens" title="Le cœur de l'analyse positive">
          <p>
            <strong>Les travailleurs réagissent aux incitants découlant du niveau de taxation !</strong>{" "}
            Comme le revenu hors salaire <M tex="M(t)" />, les salaires réels (nets){" "}
            <M tex="s_H(1-t)" /> et <M tex="s_B(1-t)" /> dépendent de <M tex="t" />. Quand la taxe
            change, le prix du loisir change, donc le choix des heures change.
          </p>
        </Callout>

        <Callout variant="definition" title="Une hypothèse cachée : N est grand">
          <p>
            Chaque travailleur <strong>ignore son propre impact sur le montant reçu</strong>{" "}
            <M tex="M(t)" />, car avec un grand nombre <M tex="N" /> de travailleurs cet impact est
            négligeable. Pourquoi est-ce une hypothèse ? Si un travailleur gagne 1 € brut de plus,
            il paie <M tex="t" /> de taxe en plus… mais une partie lui revient, puisque la cagnotte
            est partagée entre <M tex="N" /> personnes : il récupère <M tex="t/N" />. Il garde donc{" "}
            <M tex="1 - t + t/N" />, et son vrai salaire réel serait :
          </p>
          <MB tex="s\left(1 - \frac{N-1}{N}\,t\right)" />
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              Avec <M tex="N = 2" /> (un seul travailleur de chaque type) et <M tex="t = 0{,}5" /> :{" "}
              <M tex="s(1 - 0{,}25) = 0{,}75\,s" />. Il garde 75 % et non 50 % : énorme différence.
            </li>
            <li>
              Avec <M tex="N = 1\,000" /> et <M tex="t = 0{,}5" /> :{" "}
              <M tex="s(1 - 0{,}4995) = 0{,}5005\,s \approx 0{,}5\,s" />. La différence est
              invisible : on peut utiliser <M tex="s(1-t)" />.
            </li>
          </ul>
        </Callout>

        <H4>L'offre de travail optimale (slide 25)</H4>
        <p>
          On applique la condition de tangence du § 5 avec les deux biens « loisir » et
          « consommation ». Quatre lignes suffisent :
        </p>

        <Steps>
          <Step n={1} tex="U_{ml} = \frac{a}{l} \qquad U_{mc} = 1">
            Les utilités marginales : la dérivée de <M tex="a \ln l" /> par rapport à{" "}
            <M tex="l" /> est <M tex="a/l" /> ; la dérivée de <M tex="c" /> par rapport à{" "}
            <M tex="c" /> est 1.
          </Step>
          <Step n={2} tex="p_l = s(1-t) \qquad p_c = 1">
            Les prix : une heure de loisir coûte le salaire net auquel on renonce (§ 2) ; la
            consommation a un prix fixé à 1.
          </Step>
          <Step n={3} tex="\frac{U_{ml}}{U_{mc}} = \frac{p_l}{p_c} \;\iff\; \frac{a/l}{1} = s(1-t)">
            La condition de tangence : TMS = rapport des prix.
          </Step>
          <Step n={4} tex="l^* = \frac{a}{s(1-t)}">
            On isole <M tex="l" /> : on multiplie les deux côtés par <M tex="l" />, puis on divise
            par <M tex="s(1-t)" />.
          </Step>
        </Steps>

        <FormulaBox
          tex="l^*_H(t) = \frac{a}{s_H(1-t)} \qquad\qquad l^*_B(t) = \frac{a}{s_B(1-t)}"
          label="Le loisir optimal de chaque groupe"
          caption={
            <>
              et donc le temps de travail : <M tex="1 - l^*_H(t)" /> et <M tex="1 - l^*_B(t)" />
            </>
          }
        />

        <p>
          <strong>En chiffres</strong> (<M tex="t = 0{,}5" />) :{" "}
          <M tex="l^*_H = \tfrac{0{,}5}{5 \times 0{,}5} = 0{,}2" /> (travail 0,8) et{" "}
          <M tex="l^*_B = \tfrac{0{,}5}{3 \times 0{,}5} = \tfrac{1}{3}" /> (travail 2/3). Les bas
          salaires prennent plus de loisir : pour eux, une heure de loisir coûte moins cher.
        </p>

        <p>Cette petite formule contient deux enseignements majeurs (slide 25) :</p>

        <CardGrid
          items={[
            {
              title: "① Plus de taxe → moins de travail",
              body: (
                <>
                  Quand <M tex="t" /> augmente, le dénominateur <M tex="s(1-t)" /> diminue, donc{" "}
                  <M tex="l^*" /> <strong>augmente</strong> : plus de loisir, donc moins de travail{" "}
                  <M tex="1 - l^*" />. Taxer décourage de travailler — dès la première hausse.
                </>
              ),
            },
            {
              title: "② Le montant reçu ne change rien",
              body: (
                <>
                  La formule ne contient pas <M tex="M(t)" /> ! Le temps de travail choisi ne
                  dépend <strong>pas</strong> de l'argent reçu. C'est dû à la forme
                  « quasi-linéaire » des préférences (juste en dessous).
                </>
              ),
            },
          ]}
        />

        <Callout variant="examen" title="Valable seulement si le loisir ne dépasse pas 1 (note du slide 25)">
          <p>
            Le loisir ne peut pas dépasser le temps disponible <M tex="L = 1" />. La formule n'est
            donc valable que si <M tex="l^* \le 1" />. Pour les bas salaires (les premiers
            concernés, car leur loisir coûte moins cher) :
          </p>
          <MB tex="\frac{a}{s_B(1-t)} \le 1 \iff 1 - t \ge \frac{a}{s_B} \iff t \le 1 - \frac{a}{s_B}" />
          <p>
            Avec nos chiffres : <M tex="t \le 1 - 0{,}5/3 = 5/6 \approx 0{,}833" />. Au-delà, la
            formule donnerait un loisir impossible (à <M tex="t = 0{,}9" /> :{" "}
            <M tex="l^*_B = 0{,}5/(3 \times 0{,}1) \approx 1{,}67 > 1" />
            ). En réalité, le travailleur ne travaille plus du tout : <M tex="l^*_B = 1" />, c'est
            une <strong>solution en coin</strong>, où la tangence ne s'applique pas (§ 5). Les
            hauts salaires arrêtent à leur tour dès <M tex="t = 1 - a/s_H = 0{,}9" />.
          </p>
          <p className="mt-2">
            Même logique pour le travailleur seul des § 2 et § 5 (<M tex="s = 2" />,{" "}
            <M tex="a = 0{,}5" />) : <M tex="l^* = 0{,}5/1{,}6 = 0{,}3125" /> à{" "}
            <M tex="t = 0{,}2" />, et solution en coin <M tex="l^* = 1" /> dès{" "}
            <M tex="t \ge 1 - a/s = 0{,}75" />.
          </p>
        </Callout>

        <Callout variant="intuition" title="Préférences quasi-linéaires : pourquoi M ne compte pas (slide 26)">
          <p>
            Les préférences sont « quasi-linéaires en revenu » : l'utilité est linéaire en{" "}
            <M tex="c" />, donc <M tex="U_{mc} = 1" /> quel que soit le revenu. Résultat : dans la
            condition <M tex="a/l = s(1-t)" />, le montant <M tex="M" /> n'apparaît nulle part.
            Recevoir plus d'argent fait monter la dotation <M tex="\omega = (1, M)" /> et toute la
            droite de budget <em>parallèlement</em> (même pente, puisque le salaire net ne change
            pas) ; le point de tangence reste sur la même verticale <M tex="l^*" /> : tout l'argent
            en plus part en consommation. C'est une simplification commode qui isole le pur « effet
            d'incitation » de la taxe.
          </p>
        </Callout>

        <p>
          Dans l'animation, le salaire net est fixé à 1,6 (<M tex="s = 2" />,{" "}
          <M tex="t = 0{,}2" />, <M tex="a = 0{,}5" />
          ). Augmente le revenu hors travail <M tex="M" /> et suis le point de tangence : comme sur
          le slide 26, on voit trois positions de la droite (pour <M tex="0" />, <M tex="M'" /> et{" "}
          <M tex="M''" />
          ).
        </p>

        <QuasiLinearExplorer />

        <p>
          Ce qu'il faut voir : tout monte d'un bloc, mais le loisir choisi reste{" "}
          <M tex="l^* = 0{,}3125" /> et le temps de travail reste <M tex="1 - l^* = 0{,}6875" />.
          Sur l'île, ça veut dire qu'on peut calculer le temps de travail de chacun{" "}
          <em>sans connaître</em> <M tex="M(t)" />.
        </p>

        <H4>Plus la taxe monte, moins on travaille (slide 27)</H4>
        <p>
          À l'inverse, la taxe change le <strong>prix</strong> du loisir. Quand <M tex="t" />{" "}
          augmente, le salaire net <M tex="s(1-t)" /> baisse : la droite de budget{" "}
          <strong>pivote</strong> autour du point où l'on ne travaille pas (<M tex="l = 1" />) et
          devient plus plate. Le slide 27 montre trois salaires nets{" "}
          <M tex="s_3 > s_2 > s_1" /> : plus le salaire net est bas (droite plus plate), plus le
          loisir choisi est grand, <M tex="l^*_3 < l^*_2 < l^*_1" />. Augmente la taxe et regarde
          le point de tangence glisser vers la droite.
        </p>
        <p className="text-sm text-muted-foreground">
          Réglages : le travailleur seul (<M tex="s = 2" />, <M tex="a = 0{,}5" />), mais cette fois
          avec <M tex="M = 0" />, comme sur le slide 27 (<M tex="\omega = (1, 0)" />
          ). Sa consommation est donc plus basse qu'avec <M tex="M = 0{,}5" /> ; son loisir, lui,
          est le même, puisque <M tex="M" /> ne change pas <M tex="l^*" />.
        </p>

        <LaborSupplyExplorer />

        <p>
          Avec ces chiffres, <M tex="l^* = 0{,}25/(1-t)" /> : 0,25 à <M tex="t = 0" />, environ 0,36
          à <M tex="t = 0{,}3" />, 0,625 à <M tex="t = 0{,}6" />… et dès <M tex="t = 0{,}75" />, le
          travailleur ne travaille plus du tout (solution en coin). La baisse du travail est{" "}
          <strong>progressive</strong> : chaque hausse de taxe rogne un peu plus les heures
          travaillées, et de plus en plus vite.
        </p>

        <H4>Le montant redistribué M(t) (slide 28)</H4>
        <p>
          On connaît maintenant le loisir de chacun. On peut le remplacer dans la formule de{" "}
          <M tex="M(t)" /> du slide 22. L'astuce qui rend le calcul court : pour les deux groupes,{" "}
          <M tex="s \cdot l^* = s \cdot \tfrac{a}{s(1-t)} = \tfrac{a}{1-t}" /> (le salaire se
          simplifie).
        </p>

        <Steps>
          <Step n={1} tex="M(t) = \frac{t}{2}\big(s_H - s_H l^*_H + s_B - s_B l^*_B\big)">
            On part du slide 22 et on développe les parenthèses <M tex="s(1-l) = s - s\,l" />.
          </Step>
          <Step n={2} tex="s_H l^*_H = s_B l^*_B = \frac{a}{1-t}">
            On utilise l'astuce : les deux produits valent la même chose.
          </Step>
          <Step n={3} tex="M(t) = \frac{t}{2}\Big(s_H + s_B - \frac{2a}{1-t}\Big)">
            On remplace : <M tex="s_H(1-l^*_H) + s_B(1-l^*_B) = s_H + s_B - 2a/(1-t)" />.
          </Step>
          <Step n={4} tex="M(t) = \frac{(s_H + s_B)\,t}{2} - \frac{a\,t}{1-t}">
            On distribue <M tex="t/2" /> : le 2 du second terme se simplifie avec le 2 du
            dénominateur.
          </Step>
        </Steps>

        <FormulaBox
          tex="M(t) = \frac{(s_H + s_B)\,t}{2} - \frac{a\,t}{1-t}"
          label="Le montant redistribué (slide 28)"
          caption={<>montant reçu par chaque travailleur, réactions à la taxe comprises</>}
        />

        <p>
          <strong>Vérification</strong> à <M tex="t = 0{,}5" /> :{" "}
          <M tex="\tfrac{8 \times 0{,}5}{2} - \tfrac{0{,}5 \times 0{,}5}{0{,}5} = 2 - 0{,}5 = 1{,}5" />,
          comme dans l'exemple plus haut. <strong>Lecture des deux termes :</strong>
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <M tex="\tfrac{(s_H+s_B)\,t}{2}" /> : ce que la taxe rapporterait par personne si
            chacun travaillait <em>tout</em> son temps (aucun loisir) ;
          </li>
          <li>
            <M tex="\tfrac{a\,t}{1-t}" /> : la recette perdue parce que chacun garde du loisir —
            et ce loisir grandit avec <M tex="t" />. C'est le prix des réactions à la taxe.
          </li>
        </ul>

        <Callout variant="attention" title="Le domaine de validité de cette formule">
          <p>
            Elle utilise <M tex="l^* = a/(s(1-t))" />, donc elle n'est valable que{" "}
            <strong>tant que les deux groupes travaillent</strong> :{" "}
            <M tex="t \le 1 - a/s_B" /> (0,833 avec nos chiffres). Au-delà, seuls les hauts
            salaires travaillent et <M tex="M(t) = \tfrac{t}{2}\big(s_H - \tfrac{a}{1-t}\big)" />,
            qui tombe à zéro dès <M tex="t = 1 - a/s_H = 0{,}9" />. Signe qu'on est sorti du
            domaine : à <M tex="t = 0{,}9" />, la formule du slide donnerait{" "}
            <M tex="3{,}6 - 4{,}5 = -0{,}9" />, un montant négatif absurde.
          </p>
        </Callout>

        <p>Le slide 28 regarde les deux cas extrêmes :</p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>
              Si <M tex="t = 0" />
            </strong>{" "}
            (aucune taxe) : on ne collecte rien, donc <M tex="M(0) = 0" />. Logique.
          </li>
          <li>
            <strong>
              Si <M tex="t = 1" />
            </strong>{" "}
            (taxe de 100 %) : le salaire réel <M tex="s(1-t)" /> tombe à zéro, donc le temps de
            travail optimal <M tex="1 - l^*" /> aussi. Il n'y a aucun revenu à taxer :{" "}
            <M tex="M(1) = 0" />. Ce cas se raisonne économiquement, pas en remplaçant{" "}
            <M tex="t = 1" /> dans la formule (division par zéro).
          </li>
        </ul>

        <H4>La courbe de Laffer : trop taxer tue l'impôt (slide 29)</H4>

        <p>
          Entre ces deux zéros, le montant redistribué monte puis redescend. Il existe donc un taux{" "}
          <M tex="t^*_M" /> qui <strong>maximise</strong> <M tex="M(t)" />. C'est la{" "}
          <strong>courbe de Laffer</strong> : au-delà de <M tex="t^*_M" />, le montant reçu{" "}
          <em>diminue</em> quand la taxe augmente.
        </p>

        <Callout variant="intuition" title="Pourquoi la recette finit-elle par baisser ?">
          <p>Chaque hausse de <M tex="t" /> a deux effets opposés sur la recette :</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <strong>effet taux</strong> : on prend une plus grosse part de chaque heure
              travaillée (la recette monte) ;
            </li>
            <li>
              <strong>effet assiette</strong> : chacun travaille un peu moins (la recette baisse).
            </li>
          </ul>
          <p className="mt-2">
            Au début, l'effet taux l'emporte. Mais le loisir <M tex="a/(s(1-t))" /> grimpe de plus
            en plus vite quand <M tex="t" /> s'approche de 1 : après <M tex="t^*_M" />, l'effet
            assiette l'emporte. Et cela se produit <strong>alors que les deux groupes travaillent
            encore</strong> (avec nos chiffres, <M tex="t^*_M \approx 0{,}646" /> alors que les bas
            salaires ne s'arrêtent qu'à 0,833). Ce n'est donc pas « plus personne ne travaille » :
            c'est la <strong>baisse progressive du travail</strong>, à chaque hausse de{" "}
            <M tex="t" />, qui finit par faire baisser <M tex="M" />.
          </p>
        </Callout>

        <Callout variant="methode" title="Pour aller plus loin : calculer le sommet de Laffer (calcul en plus des slides)">
          <p>
            Le sommet <M tex="t^*_M" /> est là où la pente de <M tex="M(t)" /> s'annule. La dérivée de{" "}
            <M tex="t/(1-t)" /> vaut <M tex="1/(1-t)^2" />, donc :
          </p>
          <MB tex="\begin{aligned} M'(t) = \frac{s_H + s_B}{2} - \frac{a}{(1-t)^2} &= 0 \\ \iff (1-t)^2 &= \frac{2a}{s_H + s_B} \\ \iff t^*_M &= 1 - \sqrt{\frac{2a}{s_H + s_B}} \end{aligned}" />
          <p>
            Avec nos chiffres : <M tex="t^*_M = 1 - \sqrt{1/8} \approx 0{,}646" /> et{" "}
            <M tex="M(t^*_M) \approx 1{,}672" />.
          </p>
        </Callout>

        <p>
          Bouge le curseur <M tex="t" /> et suis le point sur la vraie courbe <M tex="M(t)" /> de
          l'île : repère le sommet <M tex="t^*_M" />, le moment où les bas salaires arrêtent de
          travailler (0,833) et celui où <M tex="M" /> retombe à zéro (0,9). Compare aussi avec la
          formule du slide prolongée hors de son domaine.
        </p>

        <LafferExplorer />

        <p className="text-sm text-muted-foreground">
          Le dessin du slide 29 est stylisé : la courbe y touche zéro en <M tex="t = 1" />. Avec nos
          chiffres, <M tex="M(t)" /> vaut déjà 0 sur tout l'intervalle <M tex="[0{,}9 \,;\, 1]" />{" "}
          (plus personne ne travaille) : ce n'est pas une contradiction, juste un dessin
          simplifié.
        </p>

        <Callout variant="retiens" title="Le message de Laffer">
          <p>
            Plus de taxe ne signifie pas toujours plus de recettes. Comme les gens{" "}
            <strong>réagissent aux incitants</strong> (ils travaillent moins quand on les taxe
            plus), au-delà du sommet <M tex="t^*_M" />, augmenter la taxe réduit le montant
            disponible pour la redistribution. Et le slide 29 annonce plus fort encore : «{" "}
            <em>
              au-delà d'un certain niveau de taxation, augmenter la taxe n'est plus dans l'intérêt
              des travailleurs à bas salaire
            </em>{" "}
            ». Ce seuil, noté <M tex="t^*_{UB}" /> au § 7 (slide 38), est{" "}
            <strong>encore plus bas que <M tex="t^*_M" /></strong> (0,5 contre 0,646 avec nos
            chiffres) : à <M tex="t^*_M" />, une hausse de taxe ne rapporte plus rien de plus en{" "}
            <M tex="M(t)" />, mais elle continue de rogner le salaire net des bas salaires — ils y
            perdent déjà.
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
                  tombe à zéro et l'assiette taxable disparaît — 100 % de rien, c'est rien. C'est le
                  raisonnement du slide 28.
                </>
              ),
            },
            {
              text: <>Parce que la formule mathématique n'est pas définie en t = 1.</>,
              explain: (
                <>
                  La division par <M tex="1-t" /> pose bien un souci en <M tex="t = 1" />, mais la
                  formule de <M tex="M(t)" /> n'est de toute façon valable que tant que les deux
                  groupes travaillent (<M tex="t \le 1 - a/s_B" />
                  ). La vraie raison est économique : un salaire net nul supprime toute incitation
                  à travailler.
                </>
              ),
            },
          ]}
        />

        <H4>L'allocation et l'utilité de chaque groupe (slides 30-31)</H4>
        <p>
          On a le temps de travail de chacun et le montant <M tex="M(t)" /> qu'il reçoit. On peut
          donc calculer ce que chacun <strong>consomme</strong>, en incorporant les réactions à la
          taxe. La consommation d'un haut salaire a deux sources :
        </p>

        <FormulaBox
          tex="c_H(t) = \underbrace{s_H\,(1 - l^*_H(t))\,(1-t)}_{\text{revenu du travail}} + \underbrace{M(t)}_{\text{hors travail}}"
          label="La consommation d'un haut salaire (slide 30)"
          caption={
            <>
              idem pour un bas salaire, avec <M tex="s_B" /> et <M tex="l^*_B(t)" />
            </>
          }
        />

        <p>On remplace <M tex="l^*_H(t)" /> et <M tex="M(t)" /> par leurs valeurs :</p>

        <Steps>
          <Step n={1} tex="\begin{aligned} s_H(1-l^*_H)(1-t) &= s_H(1-t) - s_H(1-t)\,l^*_H \\ &= s_H(1-t) - a \end{aligned}">
            Le revenu du travail : on développe, puis{" "}
            <M tex="s_H(1-t) \cdot \tfrac{a}{s_H(1-t)} = a" /> (tout se simplifie).
          </Step>
          <Step n={2} tex="c^*_H = s_H - s_H t - a + \frac{(s_H + s_B)\,t}{2} - \frac{a\,t}{1-t}">
            On ajoute <M tex="M(t)" /> trouvé au slide 28.
          </Step>
          <Step n={3} tex="c^*_H(t) = (s_H - a) + \frac{(s_B - s_H)\,t}{2} - \frac{a\,t}{1-t}">
            On regroupe les termes en <M tex="t" /> :{" "}
            <M tex="-s_H t + \tfrac{s_H t}{2} + \tfrac{s_B t}{2} = \tfrac{(s_B - s_H)t}{2}" />.
          </Step>
        </Steps>

        <FormulaBox
          tex="\begin{aligned} c^*_H(t) &= (s_H - a) + \frac{(s_B - s_H)\,t}{2} - \frac{a\,t}{1-t} \\ c^*_B(t) &= (s_B - a) + \frac{(s_H - s_B)\,t}{2} - \frac{a\,t}{1-t} \end{aligned}"
          label="Les consommations optimales (slide 30)"
        />

        <p>Chaque terme se lit facilement :</p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <M tex="s - a" /> : la consommation sans taxe (<M tex="t = 0" />
            ) ;
          </li>
          <li>
            <M tex="\pm (s_H - s_B)\,t/2" /> : le transfert net de la redistribution — négatif pour
            les hauts salaires, positif pour les bas salaires ;
          </li>
          <li>
            <M tex="-a\,t/(1-t)" /> : ce que <em>tout le monde</em> perd parce que chacun travaille
            moins (la cagnotte rétrécit).
          </li>
        </ul>

        <p>
          <strong>En chiffres</strong> (<M tex="t = 0{,}5" />) :{" "}
          <M tex="c^*_H = 4{,}5 - 0{,}5 - 0{,}5 = 3{,}5" /> (vérification directe :{" "}
          <M tex="5 \times 0{,}8 \times 0{,}5 + 1{,}5 = 3{,}5" />
          ) et <M tex="c^*_B = 2{,}5 + 0{,}5 - 0{,}5 = 2{,}5" /> (vérification :{" "}
          <M tex="3 \times \tfrac{2}{3} \times 0{,}5 + 1{,}5 = 2{,}5" />
          ).
        </p>

        <p>
          Dernière étape (slide 31) : on remplace le panier choisi dans la fonction d'utilité.
          L'utilité devient une fonction de la seule taxe <M tex="t" /> :
        </p>

        <FormulaBox
          tex="U(t) = U\big(l^*(t), c^*(t)\big) = c^*(t) + a \ln\big(l^*(t)\big)"
          label="L'utilité en fonction de la taxe (slide 31)"
        />

        <FormulaBox
          tex="\begin{aligned} U_H(t) &= (s_H - a) + \frac{(s_B - s_H)\,t}{2} - \frac{a\,t}{1-t} \\ &\qquad + a \ln\Big(\frac{a}{s_H(1-t)}\Big) \\[8pt] U_B(t) &= (s_B - a) + \frac{(s_H - s_B)\,t}{2} - \frac{a\,t}{1-t} \\ &\qquad + a \ln\Big(\frac{a}{s_B(1-t)}\Big) \end{aligned}"
          label="Utilité de chaque groupe (slide 31)"
          caption={
            <>
              1ʳᵉ ligne : la consommation <M tex="c^*(t)" /> ; 2ᵉ ligne : le bénéfice du loisir{" "}
              <M tex="a \ln l^*(t)" />. Valables tant que les deux groupes travaillent (
              <M tex="t \le 1 - a/s_B" />
              ).
            </>
          }
        />

        <p>
          <strong>En chiffres</strong> (<M tex="t = 0{,}5" />) :{" "}
          <M tex="U_H = 3{,}5 + 0{,}5 \ln 0{,}2 \approx 3{,}5 - 0{,}805 = 2{,}695" /> et{" "}
          <M tex="U_B = 2{,}5 + 0{,}5 \ln(1/3) \approx 2{,}5 - 0{,}549 = 1{,}951" />. (Le terme{" "}
          <M tex="a \ln l^*" /> est négatif car <M tex="l^* < 1" /> : aucune importance, seul
          l'ordre compte.)
        </p>

        <Callout variant="retiens" title="Ce que représente l'utilité en fonction de la taxe">
          <p>
            <M tex="U_H(t)" /> et <M tex="U_B(t)" /> donnent la{" "}
            <strong>satisfaction finale de chaque groupe quand l'État choisit la taxe t</strong>,
            réactions des travailleurs comprises. C'est exactement ce dont l'analyse normative du §
            7 aura besoin pour comparer les taxes.
          </p>
        </Callout>

        <H4>Voir les allocations sur le graphique (slides 32 à 34 et 36)</H4>
        <p>
          Les slides 32 à 34 dessinent l'allocation pour trois taxes : <M tex="t = 0" />, un{" "}
          <M tex="t_1" /> plus petit que <M tex="t^*_M" />, et un <M tex="t_2" /> plus grand. Les
          deux groupes partagent la même dotation <M tex="\omega = (1, M(t))" /> (tout le monde
          reçoit le même <M tex="M" />
          ) ; leurs droites de budget ont des pentes <M tex="-s_H(1-t)" /> et{" "}
          <M tex="-s_B(1-t)" />. Avec nos chiffres :
        </p>

        <MiniTbl
          head={["Taxe", "Montant M", "Loisir choisi (H / B)", "Consommation (H / B)", "Utilité (H / B)"]}
          rows={[
            [<strong key="t">t = 0</strong>, "0", "0,1 / 0,167", "4,5 / 2,5", "3,349 / 1,604"],
            [<strong key="t">t₁ = 0,3</strong>, "0,986", "0,143 / 0,238", "3,986 / 2,586", "3,013 / 1,868"],
            [<strong key="t">t = 0,5</strong>, "1,5", "0,2 / 0,333", "3,5 / 2,5", "2,695 / 1,951"],
            [<strong key="t">t₂ = 0,8</strong>, "1,2", "0,5 / 0,833", "1,7 / 1,3", "1,353 / 1,209"],
          ]}
        />

        <p>
          Utilise les boutons <M tex="t = 0" />, <M tex="t_1" />, <M tex="t_2" /> puis le curseur.
          Regarde deux choses : la dotation <M tex="\omega" /> qui monte puis redescend (c'est{" "}
          <M tex="M(t)" />
          ), et les droites qui s'aplatissent (le salaire net baisse). La seconde vue superpose les
          six courbes d'indifférence du slide 36.
        </p>

        <IslandExplorer />

        <p>
          Le slide 36 range les six niveaux d'utilité :{" "}
          <M tex="U_H(0) > U_H(t_1) > U_B(t_1) > U_B(0) > U_H(t_2) > U_B(t_2)" />, soit{" "}
          <M tex="3{,}349 > 3{,}013 > 1{,}868 > 1{,}604 > 1{,}353 > 1{,}209" />. Ce qu'il faut en
          retenir :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            de <M tex="0" /> à <M tex="t_1" />, les bas salaires <strong>gagnent</strong> (1,604 →
            1,868) et les hauts salaires perdent (3,349 → 3,013) : c'est la redistribution ;
          </li>
          <li>
            à <M tex="t_2" />, <strong>tout le monde</strong> est moins bien qu'à{" "}
            <M tex="t_1" /> — et même les bas salaires sont moins bien lotis que <em>sans</em> taxe
            (1,209 contre 1,604). Trop taxer nuit à ceux qu'on voulait aider.
          </li>
          <li>
            les hauts salaires restent toujours mieux lotis que les bas salaires à taxe égale :{" "}
            <M tex="U_H - U_B = (s_H - s_B)(1-t) - a \ln(s_H/s_B) > 0" /> tant que les deux
            travaillent.
          </li>
        </ul>
      </Section>

      {/* ============================================================ */}
      {/* § 7 — Analyse normative & critère de Pareto (slides 35-43)    */}
      {/* ============================================================ */}
      <Section id="pareto" kicker="Approche rationnelle · § 7" title="Le critère de Pareto">
        <p className="text-[1.15rem] leading-relaxed">
          On sait prédire l'allocation de chaque taxe (analyse positive). Reste à les{" "}
          <strong>juger</strong> : c'est l'analyse normative (slide 35). La taxe choisie{" "}
          <M tex="t^*" /> dépendra de l'<strong>objectif</strong> que se fixe le gouvernement.
        </p>

        <CardGrid
          items={[
            {
              title: "A · Maximiser la somme des utilités",
              body: <M tex="t^*_{U_H+U_B} = \arg\max_{t \in [0,1]}\; U_H(t) + U_B(t)" />,
            },
            {
              title: "B · Maximiser l'utilité des bas salaires",
              body: <M tex="t^*_{U_B} = \arg\max_{t \in [0,1]}\; U_B(t)" />,
            },
            {
              title: "C · Autre",
              body: <>n'importe quel autre objectif (par exemple, réduire au maximum l'écart entre les groupes).</>,
            },
          ]}
        />

        <p className="text-sm text-muted-foreground">
          « argmax » = la valeur de <M tex="t" /> qui rend la fonction la plus grande. Le slide
          écrit « max », mais c'est bien le <em>taux</em> <M tex="t^*" /> qui nous intéresse, pas la
          valeur maximale de l'utilité.
        </p>

        <p>
          Choisir entre A, B ou C, c'est un jugement de valeur : combien compte le bien-être des uns
          par rapport aux autres ? D'où la question du slide 35 :{" "}
          <strong>
            sans connaître l'objectif du gouvernement, est-il déjà possible de dire quelque chose
            sur le niveau de taxe optimal ?
          </strong>{" "}
          Oui — grâce à un critère minimal, que tout le monde peut accepter : le critère de Pareto.
        </p>

        <Callout variant="methode" title="Pour aller plus loin : les objectifs A et B en chiffres (déduction, pas sur les slides)">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Objectif B.</strong> En annulant la dérivée de <M tex="U_B(t)" />, on trouve
              avec nos chiffres <M tex="t^*_{U_B} = 0{,}5" /> (et <M tex="U_B \approx 1{,}951" />
              ).
            </li>
            <li>
              <strong>Objectif A.</strong> La dérivée de la somme vaut{" "}
              <M tex="(U_H + U_B)'(t) = -\dfrac{2a\,t}{(1-t)^2} \le 0" /> : la somme baisse dès
              qu'on taxe, donc <M tex="t^*_{U_H+U_B} = 0" />. Pourquoi ? Avec ces préférences, un
              euro vaut 1 unité d'utilité pour tout le monde : le déplacer d'un groupe à l'autre ne
              change pas la somme, alors que la taxe fait travailler tout le monde moins.
            </li>
          </ul>
        </Callout>

        <H4>Première idée : l'amélioration de Pareto, ou domination (slide 37)</H4>

        <Callout variant="definition" title="Domination au sens de Pareto">
          <p>
            Rappel : une allocation <M tex="x = (x_1, \dots, x_n)" /> donne à chaque individu{" "}
            <M tex="i" /> sa part <M tex="x_i" />. Une allocation <M tex="x" /> est{" "}
            <strong>plus efficace au sens de Pareto</strong> qu'une allocation <M tex="y" /> si :
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>personne n'y perd</strong> : tous les individus trouvent <M tex="x" /> au
              moins aussi bien que <M tex="y" />, c'est-à-dire <M tex="U_i(x_i) \ge U_i(y_i)" /> pour{" "}
              <em>tous</em> les individus <M tex="i" /> ;
            </li>
            <li>
              <strong>au moins un y gagne</strong> : au moins un individu <M tex="j" /> préfère
              strictement <M tex="x" />, c'est-à-dire <M tex="U_j(x_j) > U_j(y_j)" />.
            </li>
          </ul>
          <p className="mt-2">
            Trois façons de dire la même chose : « <M tex="x" /> est plus efficace que{" "}
            <M tex="y" /> », « <M tex="x" /> <strong>domine</strong> <M tex="y" /> (au sens de
            Pareto) », « <M tex="x" /> est une <strong>amélioration</strong> (au sens de Pareto) par
            rapport à <M tex="y" /> ».
          </p>
        </Callout>

        <p>
          L'idée intuitive : si on peut améliorer le sort de quelqu'un{" "}
          <strong>sans nuire à personne</strong>, alors c'est une amélioration que tout le monde
          devrait accepter. C'est le principe d'<strong>unanimité</strong> : même les plus égoïstes
          ne peuvent pas s'y opposer, puisque personne ne perd.
        </p>

        <p>
          L'exemple du slide 37 : 10 unités de consommation à partager entre 3 personnes qui ne se
          soucient que de leur propre part (<M tex="U_i(x_i) = x_i" />) :
        </p>

        <MiniTbl
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

        <H4>Retour à notre taxe : ce que Pareto dit déjà (slides 38-39)</H4>
        <p>
          Appliquons la domination aux taxes de l'île. Chaque taxe <M tex="t" /> donne une
          allocation, donc un couple d'utilités <M tex="(U_H(t), U_B(t))" />. Notons{" "}
          <M tex="t^*_{U_B}" /> le taux qui maximise l'utilité des bas salaires (0,5 avec nos
          chiffres). Deux faits suffisent : <M tex="U_H(t)" /> <strong>baisse</strong> sur tout
          l'intervalle, et <M tex="U_B(t)" /> monte jusqu'à <M tex="t^*_{U_B}" /> puis redescend.
        </p>

        <Callout variant="retiens" title="Les deux conclusions du slide 39">
          <p>
            <strong>
              1. Tout niveau de taxe <M tex="t > t^*_{U_B}" /> est dominé au sens de Pareto par{" "}
              <M tex="t^*_{U_B}" />.
            </strong>{" "}
            En effet, les hauts salaires ont une utilité plus grande avec <M tex="t^*_{U_B}" />{" "}
            qu'avec <M tex="t" /> (leur utilité baisse avec la taxe), et les bas salaires aussi
            (<M tex="t^*_{U_B}" /> est leur meilleur taux). Exemple : passer de{" "}
            <M tex="t_2 = 0{,}8" /> à <M tex="0{,}5" /> fait passer <M tex="U_H" /> de 1,353 à
            2,695 et <M tex="U_B" /> de 1,209 à 1,951 : tout le monde gagne.
          </p>
          <p className="mt-2">
            <strong>
              2. Aucun niveau de taxe <M tex="t \le t^*_{U_B}" /> n'est dominé par un autre.
            </strong>{" "}
            Prenons <M tex="t^*_1 = 0{,}3" /> comme sur le slide 38 (<M tex="U_H = 3{,}013" />,{" "}
            <M tex="U_B = 1{,}868" />
            ) :
          </p>
          <ul className="mt-1 list-disc space-y-1.5 pl-5">
            <li>
              les taxes qui donnent aux bas salaires <em>au moins</em> 1,868 vont de 0,3 à environ
              0,639 (<M tex="U_B" /> monte jusqu'à 0,5 puis redescend). Mais elles sont toutes plus
              élevées que 0,3, donc elles donnent <strong>moins</strong> aux hauts salaires ;
            </li>
            <li>
              les taxes qui donnent aux hauts salaires <em>au moins</em> 3,013 sont celles sous 0,3.
              Mais elles donnent <strong>moins</strong> aux bas salaires.
            </li>
          </ul>
          <p className="mt-2">
            Impossible d'améliorer un groupe sans léser l'autre : rien ne domine{" "}
            <M tex="t^*_1" />. Le même raisonnement vaut pour toute taxe entre 0 et{" "}
            <M tex="t^*_{U_B}" />.
          </p>
        </Callout>

        <p>
          Avec l'animation, choisis un taux candidat <M tex="t" />. À droite de 0,5, elle montre
          que <M tex="t^*_{U_B}" /> fait mieux pour les <em>deux</em> groupes. À gauche, place-toi
          par exemple sur <M tex="t^*_1 = 0{,}3" /> et cherche un taux qui ferait mieux pour tout le
          monde : tu n'en trouveras pas.
        </p>

        <ParetoTaxExplorer />

        <p>
          <strong>Conclusion du slide 38 :</strong> «{" "}
          <em>
            au-delà du seuil <M tex="t^*_{U_B}" />, augmenter la taxe n'est même plus dans l'intérêt
            des travailleurs à bas salaire
          </em>{" "}
          ». Quel que soit son objectif, un gouvernement raisonnable ne choisira jamais un taux
          au-dessus de <M tex="t^*_{U_B}" />. En dessous, en revanche, Pareto ne tranche pas :
          choisir entre <M tex="0" /> et <M tex="t^*_{U_B}" /> demande de décider combien compte
          chaque groupe — un jugement de valeur.
        </p>

        <H4>Deuxième idée : l'efficacité de Pareto (slide 40)</H4>

        <Callout variant="definition" title="Efficacité au sens de Pareto">
          <p>
            Une allocation <M tex="x" /> est <strong>efficace</strong> (au sens de Pareto) s'il
            n'existe <strong>aucune autre allocation <M tex="z" /></strong> qui domine{" "}
            <M tex="x" /> au sens de Pareto <em>et</em> qui soit faisable techniquement. Autrement
            dit : il est <em>impossible</em> d'augmenter l'utilité d'un individu sans diminuer
            celle d'un autre. Une allocation efficace ne <strong>gaspille</strong> pas de
            bien-être.
          </p>
        </Callout>

        <p>Reprenons le partage de 10 unités (slide 40) :</p>

        <MiniTbl
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
                pas faisable
              </span>,
              <>12 unités : non faisable techniquement, on n'en a que 10</>,
            ],
          ]}
        />

        <Callout variant="attention" title="L'erreur à ne SURTOUT pas faire">
          <p>
            <strong>Efficace ≠ juste ≠ égalitaire.</strong> L'allocation (0, 0, 10) — une personne
            a tout, les deux autres rien — est parfaitement <em>efficace</em> au sens de Pareto !
            Alors que (3, 3, 3), bien plus égalitaire, ne l'est <em>pas</em> (elle gaspille 1
            unité). Le critère de Pareto ne dit <strong>rien sur l'égalité</strong>. Il garantit
            seulement qu'on ne gaspille pas : c'est nécessaire mais très loin d'être suffisant pour
            parler de justice.
          </p>
        </Callout>

        <H4>Deux conditions suffisantes (slide 41)</H4>
        <p>Une allocation <M tex="x" /> est efficace si l'une de ces conditions est remplie :</p>
        <ol className="my-3 list-decimal space-y-1.5 pl-6">
          <li>
            un individu préfère <strong>strictement</strong> <M tex="x" /> à toutes les autres
            allocations faisables ;
          </li>
          <li>
            la <strong>somme des utilités</strong> qu'elle engendre est au moins aussi grande que
            celle de n'importe quelle autre allocation faisable.
          </li>
        </ol>
        <p>
          En résumé : <strong>si <M tex="x" /> maximise la somme des utilités, elle est efficace.</strong>{" "}
          C'est un test rapide bien commode.
        </p>

        <Callout variant="intuition" title="Pourquoi ces conditions marchent (preuves en une ligne)">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Condition 1.</strong> Si une allocation <M tex="z" /> dominait <M tex="x" />,
              cet individu trouverait <M tex="z" /> au moins aussi bien que <M tex="x" />. Or il
              préfère strictement <M tex="x" /> à tout le reste : contradiction.
            </li>
            <li>
              <strong>Condition 2.</strong> Si <M tex="z" /> dominait <M tex="x" />, personne ne
              perdrait et quelqu'un gagnerait : la somme des utilités de <M tex="z" /> serait{" "}
              <em>strictement</em> plus grande. Impossible si <M tex="x" /> a déjà la plus grande
              somme.
            </li>
          </ul>
        </Callout>

        <p>
          Les exemples du slide 41, toujours avec <M tex="U_i(x_i) = x_i" /> :
        </p>

        <MiniTbl
          head={["Allocation", "Condition 1", "Condition 2"]}
          rows={[
            [
              <strong key="a">(0, 0, 10)</strong>,
              <>
                <span className="font-bold text-emerald-600">oui</span> — la personne 3 la préfère
                strictement à toute autre (elle y reçoit tout)
              </>,
              <>
                <span className="font-bold text-emerald-600">oui</span> — somme = 10, le maximum
                possible
              </>,
            ],
            [
              <strong key="a">(3, 3, 4)</strong>,
              <>
                <span className="font-bold text-rose-600">non</span> — personne n'y a sa meilleure
                allocation (chacun préférerait recevoir les 10 unités)
              </>,
              <>
                <span className="font-bold text-emerald-600">oui</span> — somme = 10, le maximum
                possible
              </>,
            ],
          ]}
        />

        <Callout variant="examen" title="Suffisante ≠ nécessaire">
          <p>
            (3, 3, 4) ne remplit pas la condition 1 et pourtant elle est efficace (la condition 2
            le prouve). Une condition <strong>suffisante</strong> marche dans un seul sens : si
            elle est remplie, l'allocation est efficace ; si elle ne l'est pas,{" "}
            <strong>on ne peut rien conclure</strong> — il faut tester autre chose.
          </p>
        </Callout>

        <H4>Quelques remarques complémentaires (slide 42)</H4>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            Les critères de Pareto mettent en pratique l'idée d'<strong>unanimité</strong>, mais ne
            disent <strong>rien sur l'égalité</strong> : (0, 0, 10) est efficace, (3, 3, 3) ne
            l'est pas.
          </li>
          <li>
            <strong>Dominer n'est pas être efficace</strong> : (3, 3, 3) domine (1, 1, 1), mais
            (3, 3, 3) n'est pas efficace pour autant (elle est elle-même dominée par (3, 3, 4)).
          </li>
        </ul>

        <Callout variant="intuition" title="La différence à retenir entre les deux concepts">
          <p>
            <strong>L'amélioration</strong> de Pareto permet (parfois) de comparer <em>deux</em>{" "}
            allocations. <strong>L'efficacité</strong> de Pareto permet de classer <em>toutes</em>{" "}
            les allocations faisables en deux catégories : efficaces / non efficaces. Le premier
            est un comparateur, le second est un classificateur.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q7"
          question={
            <>
              On partage 10 unités entre 3 personnes (chacune ne pense qu'à sa part). L'allocation
              (0, 0, 10) est-elle <strong>efficace</strong> au sens de Pareto ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Oui : impossible d'améliorer la personne 1 ou 2 sans retirer quelque chose à la
                  personne 3.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact. Tout est distribué : donner ne serait-ce qu'une miette à quelqu'un exige
                  de la prendre à la personne 3, qui y perd. Aucune allocation faisable ne domine
                  (0, 0, 10) — elle est efficace… même si elle est terriblement inégalitaire.
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
                  Non : en passant de (0, 0, 10) à (3, 3, 3), la personne 3 perd 7 unités. Il y a
                  un perdant, donc pas de domination — être « plus égalitaire » ne suffit pas.
                </>
              ),
            },
          ]}
        />

        <H4>Efficacité et modélisation : l'exercice du slide 43</H4>
        <p>
          Le dernier slide rassemble tout. Quatre politiques passent dans le modèle (analyse
          positive) et donnent quatre allocations. Trois personnes — Jean, Omar et Maria — les
          classent (analyse normative). Question : <strong>lesquelles sont efficaces ?</strong>
        </p>

        <Figure
          caption={
            <>
              <strong>Le schéma du slide 43.</strong> Quatre politiques, un modèle, quatre
              allocations à juger.
            </>
          }
        >
          <FigMethode inputs={["Policy 1", "Policy 2", "Policy 3", "Policy 4"]} />
        </Figure>

        <ExerciseBlock
          scope="a1"
          id="pareto-s43"
          number="43"
          title="Jean, Omar et Maria (slide 43)"
          difficulty={2}
          refs={[{ chapter: "a1", section: "pareto" }]}
          statement={
            <>
              <p>
                Les préférences sur les allocations (de la préférée à la moins aimée) sont les
                suivantes. On suppose que seules ces quatre allocations sont faisables.
              </p>
              <MiniTbl
                head={["Rang", "Jean", "Omar", "Maria"]}
                rows={[
                  ["1ᵉʳ", "Alloc. 1", "Alloc. 1", "Alloc. 2"],
                  ["2ᵉ", "Alloc. 2", "Alloc. 3", "Alloc. 1"],
                  ["3ᵉ", "Alloc. 3", "Alloc. 2", "Alloc. 3"],
                  ["4ᵉ", "Alloc. 4", "Alloc. 4", "Alloc. 4"],
                ]}
              />
              <p>
                Quelles allocations sont efficaces au sens de Pareto ? Lesquelles sont dominées, et
                par quelle(s) allocation(s) ?
              </p>
            </>
          }
          steps={[
            {
              title: "La méthode : comparer les allocations deux à deux",
              content: (
                <p>
                  Ici, personne n'est jamais indifférent. Donc <M tex="x" /> domine <M tex="y" />{" "}
                  si et seulement si <strong>les trois</strong> personnes classent <M tex="x" />{" "}
                  avant <M tex="y" />. Il suffit qu'une seule personne préfère <M tex="y" /> pour
                  que <M tex="x" /> ne domine pas <M tex="y" />.
                </p>
              ),
            },
            {
              title: "Allocation 1 contre allocation 2",
              content: (
                <p>
                  Jean et Omar préfèrent 1, mais Maria préfère 2. Aucune ne domine l'autre : elles
                  sont <strong>incomparables</strong> au sens de Pareto.
                </p>
              ),
            },
            {
              title: "Allocation 1 contre allocation 3",
              content: (
                <p>
                  Jean : 1 avant 3. Omar : 1 avant 3. Maria : 1 (2ᵉ) avant 3 (3ᵉ). Les trois
                  préfèrent 1 : <strong>1 domine 3</strong>.
                </p>
              ),
            },
            {
              title: "Allocation 2 contre allocation 3",
              content: (
                <p>
                  Jean et Maria préfèrent 2, mais Omar classe 3 avant 2. Donc 2{" "}
                  <strong>ne domine pas</strong> 3.
                </p>
              ),
            },
            {
              title: "Allocation 4",
              content: (
                <p>
                  Les trois la classent dernière : elle est dominée par{" "}
                  <strong>1, par 2 et par 3</strong>. (Le slide ne cite que 3 et 1, mais 2 la
                  domine aussi.)
                </p>
              ),
            },
            {
              title: "Qui est efficace ?",
              content: (
                <p>
                  Jean préfère strictement 1 à toutes les autres, Maria préfère strictement 2 à
                  toutes les autres : par la <strong>condition suffisante 1</strong> (slide 41), 1
                  et 2 sont efficaces. 3 (dominée par 1) et 4 (dominée par 1, 2 et 3) ne le sont
                  pas.
                </p>
              ),
            },
          ]}
          result={
            <>
              <p>
                <strong>Allocations 1 et 2 efficaces ; 3 dominée par 1 ; 4 dominée par 1, 2 et 3.</strong>
              </p>
              <p className="mt-1">
                À retenir : Pareto élimine les allocations « gaspilleuses » (3 et 4), mais ne choisit
                pas entre 1 et 2 — pour trancher, il faut un jugement de valeur (préférer Jean et
                Omar, ou Maria ?).
              </p>
            </>
          }
        />
      </Section>
    </>
  );
}
