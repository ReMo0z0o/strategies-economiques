/**
 * Chapitre EI1 · Le monopole.
 * Transposition pédagogique complète des slides du cours (54 slides) :
 * concurrence parfaite vs monopole, origines de la demande linéaire
 * (préférences quadratiques & demandes unitaires), Rm = Cm, Rm < p,
 * exemple analytique, élasticité / marge / indice de Lerner, perte sèche,
 * régulation, taxation, concurrence monopolistique.
 * Les visualisations interactives vivent dans ./ei1/widgets.
 */
import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  BeachWidget,
  CardGrid,
  DemandPlayground,
  LernerWidget,
  MarginalRevenueWidget,
  MasteryChecklist,
  MiniCard,
  MonopolisticWidget,
  MonopolyOptimumWidget,
  PriceTakerFigure,
  ProfitCurvesWidget,
  RegulationWidget,
  SurplusWidget,
  TaxIncidenceWidget,
  TaxWidget,
} from "./ei1/widgets";

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

const TH =
  "border-b bg-muted/70 px-3.5 py-2.5 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3.5 py-2.5 align-top";

/* ================================================================== */
/* Page du chapitre                                                    */
/* ================================================================== */

export default function Chapter() {
  return (
    <ChapterShell chapterId="ei1">
      {/* ============================================================ */}
      {/* § 0 · INTRO                                                  */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 0 · La motivation" title="Pourquoi ce chapitre ?">
        <Lead>
          Un médicament sous brevet vendu des dizaines de fois son coût de fabrication. Un péage
          autoroutier sans alternative. Une facture d'eau qu'aucun concurrent ne viendra jamais
          casser. Quand une <em>seule</em> firme tient le marché, qui fixe le prix — et à quel
          niveau ? Ce chapitre démonte le mécanisme, pièce par pièce.
        </Lead>

        <p>
          Jusqu'ici, l'image d'Épinal de l'économie était la <strong>concurrence parfaite</strong> :
          des myriades de petites firmes qui subissent le prix du marché sans pouvoir le bouger
          d'un centime. Mais regarde autour de toi : l'entreprise de distribution d'eau de ta
          région, le laboratoire qui détient le brevet d'un médicament, l'opérateur historique du
          rail… Ces firmes ne <em>subissent</em> pas le prix : elles le <strong>choisissent</strong>.
          Ce chapitre construit la théorie de la firme qui choisit son prix — le{" "}
          <strong>monopole</strong> — et c'est la brique de base de toute l'économie industrielle.
        </p>

        <div className="my-5 flex flex-wrap gap-x-8 gap-y-2 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">0 prérequis</strong> — chaque terme est défini
          </span>
          <span>
            <strong className="text-foreground">11 visualisations interactives</strong> — tu
            manipules les courbes toi-même
          </span>
          <span>
            <strong className="text-foreground">12 quiz + 3 exercices corrigés</strong> — pour
            verrouiller chaque étape
          </span>
        </div>

        <H3>Le plan du chapitre (celui des slides, dans le même ordre)</H3>
        <CardGrid cols={3}>
          <MiniCard title="① Introduction (§ 1)">
            Le point de départ : la concurrence parfaite et ses firmes <em>preneuses de prix</em>.
            Puis le renversement : le monopole face à une <strong>demande décroissante</strong> —
            d'où vient cette demande, exemples réels, raisons d'exister, légalité.
          </MiniCard>
          <MiniCard title="② L'analyse du monopole (§ 2)" tone="gold">
            Le cœur technique : la règle d'or <M tex="Rm = Cm" />, pourquoi la recette marginale
            est <em>inférieure au prix</em>, l'exemple analytique complet, et la mesure du pouvoir
            de marché (élasticité, marge, indice de Lerner).
          </MiniCard>
          <MiniCard title="③ Conséquences (§ 3)">
            Le monopole est <strong>inefficace</strong> (perte sèche). Que faire ? Le réguler, le
            taxer… et la généralisation qui rend tout ça universel : la{" "}
            <strong>concurrence monopolistique</strong>.
          </MiniCard>
        </CardGrid>

        <Callout variant="intuition" title="L'idée qui résume tout le chapitre">
          Un monopole ne peut pas tout avoir : pour vendre <em>plus</em>, il doit baisser son prix{" "}
          <em>sur toutes les unités</em>. Il va donc volontairement <strong>se retenir de
          produire</strong> pour maintenir un prix élevé. Résultat : des clients prêts à payer plus
          que le coût de production… ne sont pas servis. C'est ça, l'inefficacité du monopole — et
          tout le chapitre tourne autour de cette idée.
        </Callout>

        <Callout variant="methode" title="Comment lire ce chapitre">
          Chaque notion suit le même chemin : <strong>intuition d'abord</strong>, puis la formule,
          puis un graphique interactif pour la « sentir avec les mains », puis un quiz. Ne saute
          pas les widgets : bouger un curseur et <em>prédire</em> ce qui va se passer est la
          meilleure façon de réviser. La suite de l'histoire (comment un monopole{" "}
          <em>discrimine</em> ses clients, la double marginalisation, le bien durable) arrive au
          chapitre EI3 — ici, on pose les fondations.
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 1.1 · CONCURRENCE PARFAITE                                 */}
      {/* ============================================================ */}
      <Section id="concurrence" kicker="§ 1.1 · Le point de départ" title="Rappel — la concurrence parfaite">
        <Lead>
          Pour comprendre ce qu'un monopole a de spécial, il faut d'abord voir ce qu'est son
          exact opposé : une firme tellement petite qu'elle ne décide de <em>rien</em>.
        </Lead>

        <Callout variant="definition" title="Concurrence parfaite">
          Une structure de marché où <strong>chaque firme est toute petite par rapport au
          marché</strong> : elle produit une <strong>fraction infime</strong> de la demande totale
          d'un bien <strong>homogène</strong> — c'est-à-dire identique d'un producteur à l'autre
          (du blé, c'est du blé : impossible de distinguer celui du producteur A de celui du
          producteur B).
        </Callout>

        <p>
          Dans ce monde, chaque firme <strong>prend le prix comme donné</strong> — on dit qu'elle
          est <em>preneuse de prix</em> (« price taker »). Pourquoi ? Au prix en vigueur, elle
          arrive toujours à vendre tout ce qu'elle veut produire, car sa production ne représente
          qu'une part infime du marché : que ta ferme double ou divise par deux sa récolte de blé,
          le cours mondial du blé ne bronchera pas.
        </p>

        <H3>Pourquoi la firme ne peut toucher au prix ni vers le haut… ni vers le bas</H3>
        <CardGrid>
          <MiniCard title="Hausser le prix ? Suicide commercial." tone="bad">
            Le bien est homogène et les concurrents vendent au prix du marché. Un centime plus
            cher, et <strong>plus personne n'achète chez toi</strong> : les clients trouvent
            exactement le même bien à côté.
          </MiniCard>
          <MiniCard title="Baisser le prix ? Submersion." tone="bad">
            Un centime moins cher, et le marché entier veut acheter chez toi : tu serais{" "}
            <strong>inondée d'un afflux de commandes</strong> qui pousserait tes coûts marginaux
            bien au-dessus de ton prix de vente. Tu perdrais de l'argent sur chaque unité
            supplémentaire.
          </MiniCard>
        </CardGrid>

        <Callout variant="definition" title="Coût marginal (Cm) — un mot qu'on va utiliser sans arrêt">
          Le <strong>coût marginal</strong> est le coût de production de la{" "}
          <strong>dernière unité</strong> : de combien mon coût total augmente-t-il si je produis
          une unité de plus ? En général, il finit par <em>croître</em> avec la production (heures
          supplémentaires, machines saturées, matières premières plus chères…) — c'est pour ça que
          la firme submergée de commandes voit ses coûts s'envoler.
        </Callout>

        <p>
          Conclusion : vue depuis une firme concurrentielle, la demande est une{" "}
          <strong>ligne horizontale</strong> au prix du marché. On dit que la firme fait face à une{" "}
          <strong>demande parfaitement élastique</strong> : au prix du marché, elle vend ce qu'elle
          veut ; au-dessus, elle vend zéro. La sensibilité de la demande au prix est « infinie ».
        </p>

        <PriceTakerFigure />

        <Callout variant="attention" title="Ne confonds pas les deux niveaux de lecture">
          La demande <em>du marché</em> (tous les acheteurs de blé du monde) est bien décroissante,
          même en concurrence parfaite. Mais la demande <em>perçue par UNE petite firme</em> est
          plate : sa production est une goutte d'eau, elle ne déplace pas le prix. Toute la suite
          du chapitre consiste à regarder ce qui change quand la firme devient si grande que la
          demande du marché et « sa » demande ne font plus qu'un.
        </Callout>

        <Quiz
          scope="ei1"
          id="q1"
          question={
            <>
              Un producteur de blé en concurrence parfaite décide de vendre 5 % au-dessus du prix
              de marché. Que se passe-t-il ?
            </>
          }
          options={[
            {
              text: <>Il vend un peu moins, mais gagne plus sur chaque unité vendue.</>,
              explain: (
                <>
                  Ce serait vrai face à une demande <em>décroissante</em> — c'est exactement le
                  monde du monopole qu'on va voir. En concurrence parfaite, la demande perçue est
                  plate : il n'y a pas de « un peu moins ».
                </>
              ),
            },
            {
              text: <>Il ne vend plus rien du tout.</>,
              correct: true,
              explain: (
                <>
                  Oui : le blé est homogène et les acheteurs trouvent le même au prix du marché
                  chez n'importe quel concurrent. Sa demande est parfaitement élastique : un
                  centime au-dessus du prix, et elle tombe à zéro.
                </>
              ),
            },
            {
              text: <>Il vend autant, ses clients lui sont fidèles.</>,
              explain: (
                <>
                  La fidélité suppose un bien <em>différencié</em> (une marque, une qualité
                  particulière…). Un bien homogène n'a pas de clients fidèles — on y reviendra
                  avec la concurrence monopolistique en fin de chapitre.
                </>
              ),
            },
            {
              text: <>Le prix de marché monte de 5 %.</>,
              explain: (
                <>
                  Impossible : sa production est une fraction infime du marché. C'est précisément
                  la définition de la concurrence parfaite — aucune firme n'a d'influence sur le
                  prix.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Retiens la logique : bien homogène + firme minuscule = demande perçue parfaitement
              élastique = la firme est <strong>preneuse de prix</strong>. Le monopole sera l'exact
              opposé sur chacun de ces points.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 1.2 · LA DEMANDE DÉCROISSANTE                              */}
      {/* ============================================================ */}
      <Section
        id="demande"
        kicker="§ 1.2 · Le renversement"
        title="Le monopole face à une demande décroissante"
      >
        <Lead>
          La concurrence parfaite est une situation <em>peu réaliste</em> : quasi toutes les
          vraies firmes ont une marge plus ou moins grande dans la fixation de leurs prix. Le cas
          polaire opposé, c'est le monopole. Et son univers est régi par une seule courbe : la
          demande du marché.
        </Lead>

        <Callout variant="definition" title="Monopole">
          Situation de marché où <strong>une seule firme offre le bien demandé</strong>. Cette
          firme est donc <strong>grande par rapport au marché</strong> — elle EST le marché du
          côté de l'offre.
        </Callout>

        <p>
          Tout change alors. La firme en monopole <strong>réalise qu'elle peut modifier le prix
          en faisant varier ses quantités</strong>. Elle ne prend plus le prix comme donné :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            pour <strong>vendre plus</strong>, elle doit <strong>baisser le prix</strong> (attirer
            des acheteurs qui ne voulaient pas payer aussi cher) ;
          </li>
          <li>
            si elle veut <strong>augmenter le prix</strong>, elle doit accepter de{" "}
            <strong>vendre moins</strong> (les acheteurs les moins motivés renoncent).
          </li>
        </ul>
        <p>
          La relation exacte entre le prix et les ventes du monopole est donnée par la{" "}
          <strong>demande du marché</strong> : c'est la « carte » sur laquelle le monopole choisit
          son point préféré.
        </p>

        <H3>
          Notre outil de travail : la demande linéaire <M tex="p(y) = a - by" />
        </H3>
        <p>
          Pour faire des calculs, on va utiliser tout le long du chapitre la forme la plus simple
          de demande décroissante — une droite :
        </p>
        <FormulaBox
          tex="p(y) = a - by"
          label="Demande linéaire (inverse)"
          caption={
            <>
              <M tex="y" /> est la production, <M tex="p(y)" /> la fonction qui lie le prix à{" "}
              <M tex="y" />, et <M tex="a, b" /> sont deux paramètres positifs.
            </>
          }
        />
        <p>Trois repères à savoir lire immédiatement :</p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <M tex="a" /> = le prix qui « étouffe » la demande : à ce prix (ou au-dessus), plus
            personne n'achète. C'est l'ordonnée à l'origine.
          </li>
          <li>
            <M tex="a/b" /> = la quantité de saturation : pour écouler autant d'unités, il faut un
            prix nul. C'est l'abscisse à l'origine.
          </li>
          <li>
            <M tex="b" /> = la pente : <strong>une hausse unitaire de la production réduit le prix
            de marché de <M tex="b" /> €</strong>. Un grand <M tex="b" /> = des acheteurs vite
            découragés.
          </li>
        </ul>

        <DemandPlayground />

        <H3>Mais d'où sort cette droite ? Justification n° 1 : les préférences quadratiques</H3>
        <p>
          Une courbe de demande n'est pas un décret : elle <em>résume les décisions de milliers de
          consommateurs</em>. Les slides en donnent deux constructions rigoureuses. Première
          version : un consommateur représentatif qui achète <strong>plusieurs unités</strong> du
          même bien (pense aux litres d'essence ou aux tasses de café par mois), avec une utilité
          « quadratique » (un polynôme de degré 2) :
        </p>
        <MB tex="U = -\tfrac{b}{2}\,y^2 + a\,y + m" />
        <p>
          Ici <M tex="y" /> est la quantité consommée du bien et <M tex="m" /> la{" "}
          <strong>monnaie gardée</strong> par le consommateur (tout ce qu'il n'a pas dépensé dans
          ce bien). Le graphe de <M tex="-\tfrac{b}{2}y^2 + ay" /> est une{" "}
          <strong>parabole concave</strong> : chaque unité supplémentaire apporte moins de plaisir
          que la précédente (la 1<sup>re</sup> tasse de café de la journée vaut de l'or, la 7
          <sup>e</sup> beaucoup moins). Seule la partie croissante de la parabole nous intéresse.
        </p>
        <p>
          Le consommateur a un revenu <M tex="R" /> et paie <M tex="p" /> par unité. Sa contrainte
          de budget s'écrit <M tex="py + m = R" />, autrement dit <M tex="m = R - py" />. En
          remplaçant <M tex="m" /> dans l'utilité (c'est la <em>substitution</em>), il cherche la
          valeur de <M tex="y" /> qui maximise :
        </p>
        <MB tex="-\tfrac{b}{2}\,y^2 + a\,y + R - p\,y" />
        <p>
          Comment maximiser ? On dérive par rapport à <M tex="y" /> et on annule (au sommet d'une
          fonction concave, la pente est nulle) :{" "}
          <TheoryRef course="strategies" chapter="a1" section="optim" label="Le réflexe : dériver et annuler" />
        </p>
        <MB tex="-by + a - p = 0 \;\iff\; p = a - by" />
        <p>
          Et voilà : la condition d'achat optimal du consommateur <strong>est exactement notre
          droite de demande</strong>. Lecture : à chaque quantité <M tex="y" />, le prix{" "}
          <M tex="a - by" /> est ce que vaut la <em>dernière</em> unité aux yeux du consommateur —
          sa disposition marginale à payer.
        </p>

        <H3>Justification n° 2 : les demandes unitaires (le vendeur de glaces)</H3>
        <p>
          Deuxième version, encore plus parlante : cette fois, <strong>chaque consommateur achète
          au maximum UNE unité</strong>, mais les consommateurs sont différents les uns des
          autres. Le décor des slides :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Un <strong>vendeur de glaces</strong> est installé à une extrémité d'une plage de 1
            kilomètre.
          </li>
          <li>
            Les baigneurs sont <strong>répartis uniformément</strong> sur la plage : 25 % d'entre
            eux se trouvent à moins de 0,25 km, 75 % à moins de 0,75 km, etc.
          </li>
          <li>
            Acheter une glace procure un bénéfice <M tex="r" /> (le même pour tous), mais marcher
            coûte : un baigneur situé au kilomètre <M tex="x \in [0,1]" /> subit un coût de
            transport <M tex="t\,x" /> (avec <M tex="t < r" />).
          </li>
        </ul>
        <p>L'utilité nette d'un baigneur localisé en <M tex="x" /> vaut donc :</p>
        <MB tex="u = r - t\,x - p \;\text{ s'il achète}, \qquad u = 0 \;\text{ sinon.}" />
        <p>
          Il achète si ça lui rapporte plus que de s'abstenir, c'est-à-dire si{" "}
          <M tex="r - tx - p > 0" />, autrement dit s'il est assez proche du vendeur :
        </p>
        <MB tex="x < \tfrac{1}{t}(r - p)" />
        <p>
          Vu la répartition uniforme des baigneurs, la demande totale est simplement la longueur
          du segment des acheteurs :
        </p>
        <FormulaBox
          tex="y = \tfrac{1}{t}(r-p) \;\iff\; p = r - t\,y"
          label="La demande du vendeur de glaces"
          caption={
            <>
              C'est bien une demande linéaire ! On retrouve la forme habituelle en posant{" "}
              <M tex="a = r" /> et <M tex="b = t" />.
            </>
          }
        />

        <BeachWidget />

        <Callout variant="retiens" title="Deux histoires, une même droite">
          Que la demande vienne d'<strong>un</strong> consommateur qui module sa quantité
          (préférences quadratiques) ou de <strong>milliers</strong> de consommateurs qui disent
          chacun oui ou non (demandes unitaires), le résultat est le même : une droite
          décroissante <M tex="p = a - by" />. Dans les deux cas, la hauteur de la droite en{" "}
          <M tex="y" /> mesure la <strong>disposition à payer pour la dernière unité vendue</strong>.
          Ce sera crucial pour parler de surplus et d'efficacité en § 3.
        </Callout>

        <Quiz
          scope="ei1"
          id="q2"
          question={
            <>
              Sur la plage : bénéfice d'une glace <M tex="r = 10" /> €, coût de transport{" "}
              <M tex="t = 4" /> €/km, prix affiché <M tex="p = 8" /> €. Quelle fraction de la
              plage achète une glace ?
            </>
          }
          options={[
            {
              text: <>2 — tous les baigneurs et au-delà.</>,
              explain: (
                <>
                  Tu as calculé <M tex="r - p = 2" /> mais oublié de diviser par le coût de
                  transport <M tex="t" />. La condition d'achat est{" "}
                  <M tex="x < (r-p)/t" />, pas <M tex="x < r-p" />.
                </>
              ),
            },
            {
              text: <>0,5 — la moitié de la plage.</>,
              correct: true,
              explain: (
                <>
                  Exact : le consommateur marginal est en{" "}
                  <M tex="\hat{x} = (10-8)/4 = 0{,}5" /> km. Tous les baigneurs plus proches
                  achètent (gain positif), tous les plus lointains s'abstiennent. Avec une
                  répartition uniforme, la demande vaut 0,5.
                </>
              ),
            },
            {
              text: <>0,25 — le quart de la plage.</>,
              explain: (
                <>
                  Vérifie le calcul : <M tex="(r-p)/t = (10-8)/4 = 0{,}5" />. Le baigneur du
                  kilomètre 0,25 gagne <M tex="10 - 4(0{,}25) - 8 = 1 > 0" /> : il achète bien.
                </>
              ),
            },
            {
              text: <>Personne : 8 € c'est trop cher.</>,
              explain: (
                <>
                  Pas pour tout le monde ! Le baigneur collé au vendeur (<M tex="x=0" />) gagne{" "}
                  <M tex="10 - 0 - 8 = 2 > 0" />. « Trop cher » dépend de la position — c'est
                  exactement ce qui rend la demande décroissante et non verticale.
                </>
              ),
            },
          ]}
          explanation={
            <>
              La demande <M tex="y = \tfrac{1}{t}(r-p)" /> vient de l'agrégation de décisions
              individuelles oui/non. Baisser le prix « recrute » les baigneurs de plus en plus
              lointains — un par un, la droite descend.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 1.3 · EXEMPLES, RAISONS, LÉGALITÉ                          */}
      {/* ============================================================ */}
      <Section
        id="exemples"
        kicker="§ 1.3 · Dans la vraie vie"
        title="Exemples et raisons d'être des monopoles"
      >
        <Lead>
          Le monopole n'est pas une curiosité de manuel : tu en croises (ou en as croisé) tous les
          jours. Mais pourquoi existent-ils, et… ont-ils le droit d'exister ?
        </Lead>

        <H3>Des monopoles bien réels</H3>
        <p>Les exemples des slides, tous belges ou presque :</p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <strong>Une firme produisant un nouveau médicament sous brevet</strong> : tant que le
            brevet court, personne d'autre n'a le droit de produire la molécule.
          </li>
          <li>
            <strong>La SWDE</strong> (Société wallonne des eaux) : un seul réseau de distribution
            d'eau dessert ta rue.
          </li>
          <li>
            <strong>Les péages autoroutiers</strong> : pas d'autoroute concurrente juste à côté.
          </li>
          <li>
            Et, pendant longtemps : <strong>la poste</strong>, le fournisseur d'électricité{" "}
            <strong>Electrabel</strong>, ou <strong>la RTT</strong> — l'ancêtre de Proximus, seule
            à fournir le téléphone en Belgique.
          </li>
        </ul>

        <H3>Trois raisons d'exister</H3>
        <CardGrid cols={3}>
          <MiniCard title="① Le monopole naturel">
            Des <strong>coûts d'entrée très élevés</strong> (économies d'échelle) rendent le
            marché viable pour une seule firme : <strong>une firme est profitable, mais deux
            firmes y réaliseraient des pertes</strong>. Construire un deuxième réseau de
            canalisations d'eau parallèle au premier ne sera jamais rentabilisé. On y consacre
            toute la section « Réguler le monopole ».
          </MiniCard>
          <MiniCard title="② Les restrictions légales" tone="gold">
            L'État réserve le marché à une firme : <strong>licence exclusive</strong>,{" "}
            <strong>brevet</strong> (récompense temporaire de l'innovation),{" "}
            <strong>concession de service public</strong> (péages, transports…). Le monopole est
            ici créé par le droit.
          </MiniCard>
          <MiniCard title="③ Les barrières à l'entrée" tone="bad">
            Le monopole en place <strong>arrive à empêcher l'entrée de concurrents</strong> :
            contrats d'exclusivité, contrôle d'une ressource clé, prix agressifs à l'arrivée d'un
            entrant… C'est la raison la plus suspecte aux yeux du droit de la concurrence.
          </MiniCard>
        </CardGrid>

        <H3>Être un monopole, est-ce légal ?</H3>
        <p>
          Réponse surprenante : <strong>oui</strong>. L'existence d'un monopole (ou, de façon
          similaire, d'une <em>position dominante</em>) n'est pas interdite. Le texte de
          référence en Europe est l'<strong>article 102 du Traité sur le Fonctionnement de
          l'Union Européenne (TFUE)</strong> :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            il interdit <strong>l'abus</strong> de position dominante…
          </li>
          <li>
            … mais <strong>pas la position dominante</strong> elle-même.
          </li>
        </ul>
        <Callout variant="definition" title="Abus de position dominante">
          Un <strong>comportement qui restreint la concurrence effective</strong> sur le marché.
          Exemple typique : un monopole qui érige des barrières pour empêcher l'entrée de
          concurrents pourrait être considéré comme abusif. À l'inverse, le monopole naturel
          n'est pas, en soi, un abus : personne ne « triche », c'est la technologie (les coûts
          fixes énormes) qui rend le marché mono-firme.
        </Callout>
        <Callout variant="exemple" title="Pour fixer les idées">
          Devenir dominant parce que ton produit est meilleur : légal. Utiliser ta domination pour
          asphyxier les concurrents (les priver d'un accès essentiel, les enfermer dans des
          exclusivités) : c'est là que l'article 102 frappe. La frontière passe entre{" "}
          <em>être</em> puissant et <em>abuser</em> de sa puissance.
        </Callout>

        <Quiz
          scope="ei1"
          id="q3"
          question={<>Que dit exactement l'article 102 du TFUE à propos des monopoles ?</>}
          options={[
            {
              text: <>Il interdit tout monopole : une seule firme sur un marché, c'est illégal.</>,
              explain: (
                <>
                  Non — être en monopole ou en position dominante n'est pas interdit. Sinon, tout
                  détenteur de brevet ou tout monopole naturel serait hors-la-loi !
                </>
              ),
            },
            {
              text: (
                <>
                  Il interdit l'<strong>abus</strong> de position dominante, mais pas la position
                  dominante elle-même.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement. Ce qui est sanctionné, c'est un comportement qui restreint la
                  concurrence effective (par exemple ériger des barrières à l'entrée) — pas le
                  fait d'être gros.
                </>
              ),
            },
            {
              text: <>Il interdit les monopoles naturels, jugés les plus dangereux.</>,
              explain: (
                <>
                  Au contraire : le monopole naturel n'est pas en soi un abus. Il résulte de la
                  technologie (coûts fixes énormes), pas d'un comportement anticoncurrentiel.
                </>
              ),
            },
            {
              text: <>Il oblige les monopoles à vendre au coût marginal.</>,
              explain: (
                <>
                  Non — la tarification au coût marginal est un outil de <em>régulation</em>{" "}
                  sectorielle qu'on étudiera en § 3.2, pas une obligation générale du droit de la
                  concurrence.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 2.1 · MAXIMISATION DU PROFIT                               */}
      {/* ============================================================ */}
      <Section
        id="maximisation"
        kicker="§ 2.1 · Le cœur technique"
        title="La maximisation du profit : Rm = Cm"
      >
        <Lead>
          On entre dans la mécanique. Le monopole choisit sa production <M tex="y" /> pour
          maximiser son profit. La réponse tient en une égalité de trois lettres —{" "}
          <M tex="Rm = Cm" /> — mais il faut comprendre <em>pourquoi</em> c'est LA condition
          d'optimum.
        </Lead>

        <H3>Poser le problème</H3>
        <p>Le profit du monopole, c'est ce qu'il encaisse moins ce que produire lui coûte :</p>
        <FormulaBox
          tex="\Pi(y) = p(y)\cdot y - c(y)"
          label="Le profit du monopole"
          caption={
            <>
              <M tex="p(y)\cdot y" /> est la <strong>recette totale</strong> (prix × quantité,
              notée <M tex="R(y)" />) et <M tex="c(y)" /> est la fonction qui lie la production
              aux <strong>coûts</strong>. Question : quel niveau de production <M tex="y^*" />{" "}
              maximise ce profit ?
            </>
          }
        />
        <p>
          Point crucial : dans la recette <M tex="p(y)\cdot y" />, le prix{" "}
          <strong>dépend de la quantité</strong> via la demande. C'est toute la différence avec la
          concurrence parfaite, où <M tex="p" /> était une constante imposée par le marché.
        </p>
        <p>Pour l'exemple fil rouge (celui des slides), on prend :</p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            la <strong>demande linéaire</strong> <M tex="p(y) = a - by" /> (avec{" "}
            <M tex="a, b > 0" />) ;
          </li>
          <li>
            un <strong>coût quadratique</strong> <M tex="c(y) = F + k\,y + \beta\,y^2" /> (avec{" "}
            <M tex="k, \beta > 0" />) : <M tex="F" /> est le <strong>coût fixe</strong> — payé
            quelle que soit la production, même nulle : <M tex="c(0) = F" /> — et le terme{" "}
            <M tex="\beta y^2" /> fait que le coût <strong>croît de plus en plus vite</strong>{" "}
            avec <M tex="y" />.
          </li>
        </ul>

        <H3>La recette totale est une cloche</H3>
        <p>
          Avec la demande linéaire, la recette vaut <M tex="R(y) = (a - by)\cdot y" />. Trois
          observations la dessinent entièrement :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            <M tex="R(0) = 0" /> : la firme ne vend rien.
          </li>
          <li>
            <M tex="R(a/b) = 0" /> : la firme veut vendre <em>tellement</em> que son prix doit
            être nul pour tout écouler. Beaucoup d'unités × 0 € = 0 €.
          </li>
          <li>
            Entre les deux (<M tex="0 < y < a/b" />), <M tex="R(y)" /> est positive : la recette
            forme une <strong>cloche</strong> qui monte puis redescend.
          </li>
        </ul>
        <p>
          Le profit est l'<strong>écart vertical</strong> entre la cloche <M tex="R(y)" /> et la
          courbe de coût <M tex="c(y)" />. Cet écart est le plus grand en un point précis,{" "}
          <M tex="y^*" /> : c'est la production qui maximise le profit. Et en ce point, un fait
          géométrique remarquable : <strong>la pente de <M tex="R" /> égale la pente de{" "}
          <M tex="c" /></strong> — les tangentes sont parallèles. Vérifie-le toi-même :
        </p>

        <ProfitCurvesWidget />

        <H3>Pourquoi les pentes doivent être égales : le raisonnement à la marge</H3>
        <p>
          Formellement, on maximise <M tex="\Pi(y)" /> en annulant sa dérivée (au sommet, la pente
          est nulle) :
        </p>
        <MB tex="\frac{d\Pi(y)}{dy} = \frac{d}{dy}\big(p(y)\,y\big) - \frac{dc(y)}{dy} = 0" />
        <p>
          À l'optimum <M tex="y = y^*" />, cette dérivée est nulle, ce qui s'écrit :
        </p>
        <MB tex="\underbrace{\frac{d}{dy}\big(p(y^*)\,y^*\big)}_{\text{recette marginale } Rm(y^*)} \;=\; \underbrace{\frac{dc(y^*)}{dy}}_{\text{coût marginal } cm(y^*)}" />
        <Callout variant="definition" title="Recette marginale (Rm) et coût marginal (Cm)">
          La <strong>recette marginale</strong> <M tex="Rm(y)" /> est la dérivée de la recette
          totale par rapport à la production : combien la <em>dernière unité vendue</em> rapporte.
          Le <strong>coût marginal</strong> <M tex="cm(y)" /> est la dérivée du coût total :
          combien la <em>dernière unité produite</em> coûte.
        </Callout>
        <FormulaBox
          tex="Rm(y^*) = cm(y^*)"
          label="LA condition d'optimum du monopole"
          caption="La production optimale est telle que la dernière unité vendue rapporte exactement ce qu'elle coûte."
        />
        <p>
          L'intuition est limpide si tu raisonnes unité par unité — c'est le{" "}
          <strong>raisonnement à la marge</strong>, le réflexe n° 1 de l'économiste :
        </p>
        <CardGrid>
          <MiniCard title={<>Si <M tex="Rm(y) > cm(y)" /></>} tone="good">
            La prochaine unité <strong>rapporte plus qu'elle ne coûte</strong> : la vendre ajoute
            du profit. La firme a intérêt à <strong>vendre plus</strong>.
          </MiniCard>
          <MiniCard title={<>Si <M tex="Rm(y) < cm(y)" /></>} tone="bad">
            La dernière unité <strong>coûte plus qu'elle ne rapporte</strong> : elle détruit du
            profit. La firme a intérêt à <strong>vendre moins</strong>.
          </MiniCard>
        </CardGrid>
        <p>
          Le seul endroit où on ne peut plus améliorer le profit ni en montant ni en descendant,
          c'est là où les deux forces s'équilibrent : <M tex="Rm = cm" />. Vois-le sur un exemple
          chiffré (demande <M tex="p = 12 - y" />, coût marginal constant à 5 €) :
        </p>
        <Tbl minW={560}>
          <thead>
            <tr>
              <th className={TH}>Unité vendue</th>
              <th className={TH}>Prix pour tout écouler</th>
              <th className={TH}>Recette totale</th>
              <th className={TH}>Rm (ce qu'elle rapporte)</th>
              <th className={TH}>cm (ce qu'elle coûte)</th>
              <th className={TH}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>1</td>
              <td className={TD}>11 €</td>
              <td className={TD}>11 €</td>
              <td className={TD}>+11 €</td>
              <td className={TD}>5 €</td>
              <td className={TD}>✅ on la produit</td>
            </tr>
            <tr>
              <td className={TD}>2</td>
              <td className={TD}>10 €</td>
              <td className={TD}>20 €</td>
              <td className={TD}>+9 €</td>
              <td className={TD}>5 €</td>
              <td className={TD}>✅ on la produit</td>
            </tr>
            <tr>
              <td className={TD}>3</td>
              <td className={TD}>9 €</td>
              <td className={TD}>27 €</td>
              <td className={TD}>+7 €</td>
              <td className={TD}>5 €</td>
              <td className={TD}>✅ on la produit</td>
            </tr>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={TD}>4</td>
              <td className={TD}>8 €</td>
              <td className={TD}>32 €</td>
              <td className={TD}>+5 €</td>
              <td className={TD}>5 €</td>
              <td className={TD}>🟰 Rm = cm : c'est l'optimum</td>
            </tr>
            <tr>
              <td className={TD}>5</td>
              <td className={TD}>7 €</td>
              <td className={TD}>35 €</td>
              <td className={TD}>+3 €</td>
              <td className={TD}>5 €</td>
              <td className={TD}>⛔ elle détruirait 2 € de profit</td>
            </tr>
          </tbody>
        </Tbl>
        <Callout variant="attention" title="Deux pièges très fréquents">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>« Le monopole maximise sa recette. »</strong> Faux : il maximise son{" "}
              <em>profit</em>. Dans le tableau, la recette continue de monter à l'unité 5 (35 €
              contre 32 €), mais le profit, lui, baisse. Ce qui compte, c'est Rm face à cm.
            </li>
            <li>
              <strong>Le coût fixe <M tex="F" /> ne joue aucun rôle dans le choix de{" "}
              <M tex="y^*" /></strong> : il est payé quoi qu'il arrive, donc il disparaît dans la
              dérivée. Il ne sert qu'à savoir si le profit final est positif ou négatif.
            </li>
          </ul>
        </Callout>

        <Quiz
          scope="ei1"
          id="q4"
          question={
            <>
              Au niveau de production actuel d'un monopole, on mesure <M tex="Rm = 15" /> € et{" "}
              <M tex="cm = 9" /> €. Que doit-il faire pour augmenter son profit ?
            </>
          }
          options={[
            {
              text: <>Produire plus.</>,
              correct: true,
              explain: (
                <>
                  Oui : la prochaine unité rapporte 15 € et coûte 9 € — elle ajoute 6 € de profit
                  net. Tant que <M tex="Rm > cm" />, on augmente <M tex="y" />, jusqu'à ce que
                  l'écart se referme.
                </>
              ),
            },
            {
              text: <>Produire moins, pour faire monter le prix.</>,
              explain: (
                <>
                  Faire monter le prix, oui, mais à quel prix ! En reculant, il renonce à des
                  unités qui rapportaient plus qu'elles ne coûtaient. Réduire la production n'est
                  optimal que quand <M tex="Rm < cm" />.
                </>
              ),
            },
            {
              text: <>Ne rien changer : le profit est déjà maximal.</>,
              explain: (
                <>
                  Le profit est maximal quand <M tex="Rm = cm" />. Ici 15 ≠ 9 : il reste du profit
                  « gratuit » à ramasser en produisant davantage.
                </>
              ),
            },
            {
              text: <>Impossible à dire sans connaître le coût fixe F.</>,
              explain: (
                <>
                  Piège classique : le coût fixe est payé quoi qu'il arrive, il n'apparaît pas
                  dans la comparaison marginale. La décision « une unité de plus ou de moins ? »
                  ne dépend que de Rm et cm.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 2.2 · Rm < p                                               */}
      {/* ============================================================ */}
      <Section
        id="recette"
        kicker="§ 2.2 · L'intuition centrale"
        title="La recette marginale est inférieure au prix"
      >
        <Lead>
          Voici LE point qui distingue à jamais le monopole de la firme concurrentielle — et la
          racine de tout ce qui suit (production trop faible, perte sèche, régulation). Prends le
          temps de le digérer.
        </Lead>

        <H3>Le calcul, d'abord</H3>
        <p>
          La recette marginale mesure la variation de la recette totale lorsque la production
          s'accroît d'une unité. Dérivons la recette <M tex="R(y) = p(y)\cdot y" />. C'est un{" "}
          <em>produit</em> de deux fonctions de <M tex="y" /> : on applique la règle « dérivée
          d'un produit » (<M tex="(uv)' = u'v + uv'" />) :
        </p>
        <MB tex="Rm(y) = \frac{d}{dy}\big(p(y)\,y\big) = p(y) + y\,\frac{dp(y)}{dy}" />
        <p>
          Or la dérivée <M tex="dp(y)/dy" /> est <strong>négative</strong> : la demande est
          décroissante, pour vendre une unité de plus il faut réduire le prix. Donc le second
          terme retranche quelque chose, et :
        </p>
        <FormulaBox
          tex="Rm(y) = p(y) + y\,\frac{dp(y)}{dy} \;<\; p(y)"
          label="Le résultat clé du chapitre"
          caption="Ce que rapporte la dernière unité vendue est inférieur au prix de vente de cette unité."
        />

        <H3>L'intuition : effet quantité contre effet prix</H3>
        <p>Quand le monopole vend une unité supplémentaire, deux choses se produisent en même temps :</p>
        <CardGrid>
          <MiniCard title={<>Effet quantité : <M tex="+\,p(y)" /></>} tone="good">
            La nouvelle unité se vend au prix du marché : elle rapporte{" "}
            <strong>directement une recette égale au prix</strong>. C'est le seul effet qui
            existerait en concurrence parfaite.
          </MiniCard>
          <MiniCard title={<>Effet prix : <M tex="y \cdot \tfrac{dp}{dy} < 0" /></>} tone="bad">
            Pour écouler cette unité de plus, il faut <strong>baisser le prix de TOUTES les
            unités</strong> — y compris celles qu'on vendait déjà très bien. Cette baisse, subie
            par les <M tex="y" /> unités existantes, ampute les recettes de{" "}
            <M tex="y \cdot dp/dy" />.
          </MiniCard>
        </CardGrid>
        <Callout variant="exemple" title="L'exemple chiffré des slides — à savoir refaire les yeux fermés">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Avec un prix de <strong>10 €</strong>, la firme vend <strong>2 unités</strong> :{" "}
              <M tex="R(2) = 20" /> €.
            </li>
            <li>
              Pour vendre <strong>3 unités</strong>, elle doit baisser le prix à{" "}
              <strong>9 €</strong> : <M tex="R(3) = 27" /> €.
            </li>
            <li>
              La recette totale a augmenté de seulement <strong>7 €</strong>, alors que la 3
              <sup>e</sup> unité s'est vendue 9 € !
            </li>
            <li>
              Décomposition : la recette a augmenté du prix encaissé (<strong>+9 €</strong>), mais
              a diminué de la baisse de prix (<strong>1 €</strong>)… <strong>FOIS</strong> le
              nombre d'unités vendues avant la baisse (<strong>2</strong>) :{" "}
              <M tex="9 - 1\times 2 = 7" /> €.
            </li>
          </ul>
        </Callout>

        <MarginalRevenueWidget />

        <Callout variant="intuition" title="Pourquoi c'est ça qui rend le monopole « frileux »">
          Chaque unité supplémentaire « cannibalise » les recettes des unités précédentes. Le
          monopole intériorise ce sacrifice : il s'arrête de produire <em>avant</em> le point où
          le prix couvre tout juste le coût marginal. En concurrence parfaite, au contraire, la
          firme ne fait pas baisser le prix en vendant plus (elle est minuscule) : son effet prix
          est nul, donc <M tex="Rm = p" /> et elle produit jusqu'à <M tex="p = cm" />. Toute
          l'inefficacité du monopole (§ 3) découle de cet écart.
        </Callout>

        <Quiz
          scope="ei1"
          id="q5"
          question={
            <>
              À 10 € l'unité, un monopole vend 2 unités. Pour en vendre 3, il doit afficher 9 €.
              Combien la 3<sup>e</sup> unité rapporte-t-elle <em>vraiment</em> (recette marginale) ?
            </>
          }
          options={[
            {
              text: <>9 € — son prix de vente.</>,
              explain: (
                <>
                  C'est l'effet quantité seul. Tu oublies l'effet prix : les 2 premières unités,
                  qui se vendaient 10 €, ne se vendent plus que 9 €. Le vrai gain est{" "}
                  <M tex="27 - 20 = 7" /> €.
                </>
              ),
            },
            {
              text: <>7 €.</>,
              correct: true,
              explain: (
                <>
                  Oui : <M tex="R(3) - R(2) = 27 - 20 = 7" /> €. Décomposition : +9 € encaissés
                  sur la nouvelle unité, −2 € perdus (1 € de rabais × 2 anciennes unités). On a
                  bien <M tex="Rm = 7 < 9 = p" />.
                </>
              ),
            },
            {
              text: <>27 € — la nouvelle recette totale.</>,
              explain: (
                <>
                  27 € est la recette <em>totale</em> avec 3 unités. La recette{" "}
                  <em>marginale</em> est la <em>variation</em> : ce que la 3<sup>e</sup> unité
                  ajoute par rapport à la situation à 2 unités.
                </>
              ),
            },
            {
              text: <>−1 € : baisser le prix fait toujours perdre de l'argent.</>,
              explain: (
                <>
                  Non : ici l'effet quantité (+9 €) domine encore l'effet prix (−2 €). La recette
                  marginale ne devient négative que plus loin sur la demande, quand on a déjà
                  beaucoup d'unités à « protéger ».
                </>
              ),
            },
          ]}
          explanation={
            <>
              Le réflexe : <M tex="Rm = " /> prix encaissé <strong>moins</strong> (baisse de prix
              × unités déjà vendues). C'est toujours moins que le prix — sauf pour une firme
              minuscule qui ne fait pas bouger les prix.
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 2.3 · EXEMPLE ANALYTIQUE                                   */}
      {/* ============================================================ */}
      <Section
        id="exemple-analytique"
        kicker="§ 2.3 · On assemble tout"
        title="Exemple analytique et graphique"
      >
        <Lead>
          Demande linéaire + coût quadratique : on résout maintenant le problème du monopole de
          bout en bout, avec les fonctions exactes des slides. C'est LE calcul type d'examen.
        </Lead>

        <H3>Les données</H3>
        <MB tex="p(y) = a - by \quad (a, b > 0) \qquad\qquad c(y) = F + k\,y + \beta\,y^2 \quad (k, \beta > 0)" />

        <H3>Étape 1 — La recette marginale : même départ, pente double</H3>
        <p>La recette totale se développe en un polynôme tout simple :</p>
        <MB tex="R(y) = p(y)\cdot y = (a - by)\,y = a\,y - b\,y^2" />
        <p>On dérive terme à terme (la dérivée de <M tex="ay" /> est <M tex="a" />, celle de{" "}
          <M tex="by^2" /> est <M tex="2by" />) :</p>
        <FormulaBox
          tex="Rm(y) = a - 2by \;<\; a - by = p(y)"
          label="Recette marginale d'une demande linéaire"
          caption={
            <>
              À retenir graphiquement : <M tex="Rm" /> part du <strong>même point</strong>{" "}
              <M tex="a" /> que la demande, mais descend <strong>deux fois plus vite</strong> —
              elle coupe l'axe horizontal en <M tex="a/2b" /> au lieu de <M tex="a/b" />.
            </>
          }
        />
        <p>
          Et on <em>voit</em> sur la formule le résultat de la section précédente :{" "}
          <M tex="a - 2by" /> est en dessous de <M tex="a - by" /> dès que <M tex="y > 0" />. La
          recette marginale est bien inférieure au prix.
        </p>

        <H3>Étape 2 — Le coût marginal</H3>
        <p>On dérive le coût total (le coût fixe <M tex="F" /> disparaît : sa dérivée est nulle) :</p>
        <MB tex="cm(y) = \frac{dc(y)}{dy} = k + 2\beta y" />
        <p>
          C'est une droite croissante qui part de <M tex="k" /> : produire la toute première unité
          coûte <M tex="k" />, puis chaque unité coûte un peu plus cher que la précédente.
        </p>

        <H3>Étape 3 — Égaliser et résoudre</H3>
        <p>À l'équilibre du monopole, <M tex="Rm(y^*) = cm(y^*)" /> :</p>
        <MB tex="a - 2by^* = k + 2\beta y^*" />
        <p>
          On regroupe les termes en <M tex="y^*" /> à droite et les constantes à gauche :{" "}
          <M tex="a - k = 2by^* + 2\beta y^*= 2(b+\beta)\,y^*" />, d'où :
        </p>
        <FormulaBox
          tex="y^* = \frac{a - k}{2(b + \beta)}"
          label="La production du monopole"
          caption={
            <>
              Lecture : plus le marché est « riche » (<M tex="a" /> grand), plus on produit ; plus
              produire coûte cher (<M tex="k" /> ou <M tex="\beta" /> grands) ou plus la demande
              est pentue (<M tex="b" /> grand), moins on produit. Il faut <M tex="a > k" /> pour
              que le marché existe : le premier acheteur doit valoir plus que la première unité ne
              coûte.
            </>
          }
        />

        <H3>Étape 4 — Remonter au prix… sur la demande !</H3>
        <p>
          Le prix est celui auquel la quantité <M tex="y^*" /> s'écoule, donc on remplace dans la{" "}
          <strong>fonction de demande</strong> :
        </p>
        <FormulaBox
          tex="p(y^*) = a - b\,y^* = a - b\,\frac{a-k}{2(b+\beta)}"
          label="Le prix du monopole"
        />
        <Callout variant="attention" title="LE piège graphique de ce chapitre">
          Le prix du monopole ne se lit <strong>PAS</strong> à l'intersection de <M tex="Rm" /> et{" "}
          <M tex="cm" /> ! L'intersection donne la <em>quantité</em> <M tex="y^*" />. Pour le{" "}
          <em>prix</em>, on remonte verticalement jusqu'à la <strong>courbe de demande</strong> :
          c'est elle qui dit à quel prix les consommateurs absorbent <M tex="y^*" /> unités. Aux
          examens, cette erreur coûte des points à chaque session.
        </Callout>

        <MonopolyOptimumWidget />

        <Callout variant="methode" title="La recette en 5 étapes (à réciter)">
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Écrire <M tex="R(y) = p(y)\cdot y" /> et dériver → <M tex="Rm(y)" />.
            </li>
            <li>
              Dériver le coût → <M tex="cm(y)" />.
            </li>
            <li>
              Résoudre <M tex="Rm(y^*) = cm(y^*)" /> → la quantité <M tex="y^*" />.
            </li>
            <li>
              Remplacer dans la <strong>demande</strong> → le prix <M tex="p^* = p(y^*)" />.
            </li>
            <li>
              Si demandé : le profit <M tex="\Pi = p^* y^* - c(y^*)" /> (c'est ici que le coût
              fixe <M tex="F" /> refait surface).
            </li>
          </ol>
        </Callout>

        <Quiz
          scope="ei1"
          id="q6"
          question={
            <>
              Un monopole fait face à <M tex="p(y) = 12 - y" /> avec un coût{" "}
              <M tex="c(y) = F + 4y + y^2" />. Quelle production maximise son profit ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <M tex="y^* = 2" />
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : <M tex="Rm = 12 - 2y" />, <M tex="cm = 4 + 2y" />, donc{" "}
                  <M tex="12 - 2y = 4 + 2y \iff 8 = 4y \iff y^* = 2" />. C'est la formule{" "}
                  <M tex="y^* = \tfrac{a-k}{2(b+\beta)} = \tfrac{12-4}{2(1+1)}" />. Le prix sera{" "}
                  <M tex="p^* = 12 - 2 = 10" />.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="y = 8/3 \approx 2{,}7" />
                </>
              ),
              explain: (
                <>
                  C'est la production <em>efficace</em> (celle où <M tex="p = cm" /> :{" "}
                  <M tex="12 - y = 4 + 2y" />). Le monopole, lui, s'arrête avant : il égalise{" "}
                  <M tex="Rm" /> (pas le prix !) avec <M tex="cm" />. Cet écart, c'est justement
                  l'inefficacité qu'on verra en § 3.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="y = 4" />
                </>
              ),
              explain: (
                <>
                  Tu as oublié le terme <M tex="\beta y^2" /> du coût :{" "}
                  <M tex="(12-4)/(2\times 1) = 4" /> serait correct si <M tex="cm" /> était
                  constant à 4. Ici <M tex="cm = 4 + 2y" /> croît : on s'arrête plus tôt.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="y = 6" />
                </>
              ),
              explain: (
                <>
                  <M tex="y = 6" /> annule <M tex="Rm" /> (c'est <M tex="a/2b" />, le sommet de la
                  cloche de recette) : ce serait l'optimum si produire était <em>gratuit</em>.
                  Avec des coûts, on s'arrête bien avant le sommet de la recette.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 2.4 · POUVOIR DE MARCHÉ                                    */}
      {/* ============================================================ */}
      <Section
        id="pouvoir"
        kicker="§ 2.4 · Mesurer la puissance"
        title="Mesurer le pouvoir de marché : élasticité, marge, Lerner"
      >
        <Lead>
          Question posée par les slides : supposons que la demande devienne{" "}
          <em>moins sensible aux variations de prix</em>. Le monopole va-t-il exploiter cela en
          augmentant son prix ? Pour répondre, il nous faut un outil de mesure : l'élasticité.
        </Lead>

        <p>
          Pour simplifier les calculs, on suppose dans toute cette section que les coûts totaux
          croissent <em>linéairement</em> avec la production — le coût marginal est constant :
        </p>
        <MB tex="c = k\cdot y \qquad\Rightarrow\qquad cm = k" />

        <Callout variant="definition" title="Élasticité de la demande (ε)">
          <p>
            L'élasticité mesure la sensibilité de la demande au prix,{" "}
            <strong>en pourcentages</strong> :
          </p>
          <MB tex="\varepsilon = -\frac{p}{y}\,\frac{dy}{dp}" />
          <p>
            Elle indique <strong>de quel pourcentage la demande diminue lorsque le prix augmente
            de 1 %</strong> (on la prend en valeur absolue : le signe moins compense le fait que{" "}
            <M tex="dy/dp < 0" />). <M tex="\varepsilon = 4" /> : +1 % de prix → −4 % de ventes
            (clients volatils). <M tex="\varepsilon" /> proche de 1 : les clients restent presque
            tous (demande rigide, pense au carburant ou à un médicament vital).
          </p>
        </Callout>

        <H3>La dérivation : du Rm = cm à la formule du prix</H3>
        <p>
          On repart de la condition d'optimum, en écrivant la recette marginale sous sa forme
          générale :
        </p>
        <MB tex="Rm(y) = p + y\,\frac{dp}{dy} = k = cm" />
        <p>
          Astuce de calcul : on <strong>met <M tex="p" /> en facteur</strong> dans le membre de
          gauche :
        </p>
        <MB tex="p\left[1 + \frac{y}{p}\,\frac{dp}{dy}\right] = k" />
        <p>
          Or le terme entre crochets contient exactement l'inverse de l'élasticité :{" "}
          <M tex="\tfrac{y}{p}\tfrac{dp}{dy} = -\tfrac{1}{\varepsilon}" /> (retourne la définition
          de <M tex="\varepsilon" /> pour t'en convaincre). En isolant <M tex="p" /> :
        </p>
        <FormulaBox
          tex="p = \frac{k}{1 - \tfrac{1}{\varepsilon}}"
          label="Le prix du monopole en fonction de l'élasticité"
          caption={
            <>
              Le prix est un <strong>coût marginal majoré</strong> : on part de <M tex="k" /> et
              on le gonfle d'autant plus que <M tex="\varepsilon" /> est petit.
            </>
          }
        />
        <Callout variant="attention" title="Pourquoi le monopole opère toujours là où ε est supérieur à 1">
          Si <M tex="\varepsilon \le 1" />, le dénominateur <M tex="1 - 1/\varepsilon" /> devient
          nul ou négatif — la formule donnerait un prix infini ou négatif, ce qui n'a pas de sens.
          Le monopole ne va évidemment pas fixer un prix négatif : il choisit donc{" "}
          <strong>toujours une quantité telle que l'élasticité de la demande est supérieure
          à 1</strong>. Intuition : en zone inélastique, vendre une unité de plus <em>réduit</em>{" "}
          la recette (Rm est négative) tout en augmentant les coûts — personne ne reste là.
        </Callout>

        <H3>Trois façons d'exprimer le pouvoir de marché</H3>
        <p>À partir de la formule du prix, deux manipulations donnent les mesures classiques :</p>
        <CardGrid cols={3}>
          <MiniCard title="Le prix">
            <MB tex="p = \frac{k}{1-\frac{1}{\varepsilon}}" className="my-1" />
            Combien le client paie, coût gonflé par le pouvoir de marché.
          </MiniCard>
          <MiniCard title="La marge (markup)">
            <MB tex="p - k = \frac{k}{\varepsilon - 1}" className="my-1" />
            L'écart absolu entre prix et coût marginal, en euros.
          </MiniCard>
          <MiniCard title="L'indice de Lerner" tone="gold">
            <MB tex="\frac{p-k}{p} = \frac{1}{\varepsilon}" className="my-1" />
            La marge <em>relative</em> : quelle fraction du prix est de la marge pure.
          </MiniCard>
        </CardGrid>
        <Callout variant="definition" title="Indice de Lerner">
          <M tex="L = \dfrac{p - Cm}{p} = \dfrac{1}{\varepsilon}" /> : la{" "}
          <strong>mesure classique du pouvoir de marché</strong>, c'est-à-dire de la capacité
          d'une firme à élever son prix au-dessus de son coût marginal. Il est{" "}
          <strong>compris entre 0 et 1</strong> (0 = concurrence parfaite, proche de 1 = pouvoir
          maximal) et présente l'avantage d'être <strong>comparable entre secteurs
          différents</strong> — une marge de 2 € n'a pas le même sens sur une baguette et sur une
          voiture, mais un Lerner de 0,5 se compare partout.
        </Callout>

        <p>Le tableau des slides, à savoir recalculer :</p>
        <Tbl minW={520}>
          <thead>
            <tr>
              <th className={TH}></th>
              <th className={TH}>ε = 2</th>
              <th className={TH}>ε = 3</th>
              <th className={TH}>ε = 4</th>
              <th className={TH}>ε = 100</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${TD} font-semibold`}>
                Prix <M tex="p" />
              </td>
              <td className={TD}>
                <M tex="2k" />
              </td>
              <td className={TD}>
                <M tex="3k/2" />
              </td>
              <td className={TD}>
                <M tex="4k/3" />
              </td>
              <td className={TD}>
                <M tex="100k/99" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>
                Marge <M tex="p-k" />
              </td>
              <td className={TD}>
                <M tex="k" />
              </td>
              <td className={TD}>
                <M tex="k/2" />
              </td>
              <td className={TD}>
                <M tex="k/3" />
              </td>
              <td className={TD}>
                <M tex="k/99" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Indice de Lerner</td>
              <td className={TD}>1/2</td>
              <td className={TD}>1/3</td>
              <td className={TD}>1/4</td>
              <td className={TD}>1/100</td>
            </tr>
          </tbody>
        </Tbl>

        <LernerWidget />

        <Callout variant="retiens" title="Les deux limites à connaître">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Plus <M tex="\varepsilon" /> est grande, moins le monopole est capable de
              fixer un prix supérieur au coût marginal.</strong> À la limite, quand{" "}
              <M tex="\varepsilon" /> devient très grande, le prix tend vers <M tex="k" /> — comme
              en concurrence parfaite, où les firmes estiment ne pas pouvoir changer les prix.
            </li>
            <li>
              À l'inverse, plus <M tex="\varepsilon" /> diminue et se rapproche de 1, plus le
              monopole <strong>réduit son offre pour accroître le prix</strong> sur le marché.
              Réponse à la question d'ouverture : oui, une demande moins sensible au prix est une
              aubaine que le monopole exploite à fond.
            </li>
          </ul>
        </Callout>

        <Quiz
          scope="ei1"
          id="q7"
          question={
            <>
              Un monopole a un coût marginal constant <M tex="k = 9" /> € et fait face à une
              demande d'élasticité <M tex="\varepsilon = 4" />. Quel prix fixe-t-il ?
            </>
          }
          options={[
            {
              text: <>12 €</>,
              correct: true,
              explain: (
                <>
                  Oui : <M tex="p = \tfrac{9}{1 - 1/4} = \tfrac{9}{3/4} = 12" /> €. Au passage :
                  marge = 3 € = <M tex="k/(\varepsilon-1)" />, et Lerner ={" "}
                  <M tex="3/12 = 1/4 = 1/\varepsilon" />. Tout est cohérent.
                </>
              ),
            },
            {
              text: <>36 €</>,
              explain: (
                <>
                  Tu as multiplié <M tex="k \times \varepsilon" />. La formule est{" "}
                  <M tex="p = k/(1 - 1/\varepsilon)" /> : avec <M tex="\varepsilon = 4" />, le
                  coût est majoré d'un tiers, pas quadruplé.
                </>
              ),
            },
            {
              text: <>11,25 €</>,
              explain: (
                <>
                  Tu as calculé <M tex="k(1 + 1/\varepsilon) = 9 \times 1{,}25" />. Attention :
                  le facteur de majoration est <M tex="\tfrac{1}{1-1/\varepsilon}" /> (ici 4/3),
                  pas <M tex="1 + 1/\varepsilon" />.
                </>
              ),
            },
            {
              text: <>9 € — il tarife au coût marginal.</>,
              explain: (
                <>
                  Ce serait la concurrence parfaite (ε infinie). Avec <M tex="\varepsilon = 4" />,
                  le monopole conserve un vrai pouvoir de marché : Lerner = 25 % du prix.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="ei1"
          id="q8"
          question={
            <>
              Pourquoi un monopole ne choisit-il <em>jamais</em> un niveau de production où la
              demande est inélastique (<M tex="\varepsilon < 1" />) ?
            </>
          }
          options={[
            {
              text: <>Parce que le droit de la concurrence le lui interdit.</>,
              explain: (
                <>
                  Rien à voir avec le droit : c'est son propre intérêt qui l'en écarte. Relis la
                  formule du prix — et pense à ce que vaut Rm dans cette zone.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'en zone inélastique, produire <em>moins</em> augmenterait sa recette{" "}
                  <em>et</em> réduirait ses coûts : il ne s'y attarde jamais.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement. Quand <M tex="\varepsilon < 1" />, la recette marginale est
                  négative : vendre une unité de plus fait <em>baisser</em> la recette totale.
                  Reculer est alors doublement gagnant (recette ↑, coûts ↓) — le monopole remonte
                  la demande jusqu'à la zone élastique. C'est aussi pour ça que la formule{" "}
                  <M tex="p = k/(1-1/\varepsilon)" /> exploserait : un prix négatif n'a pas de
                  sens.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que <M tex="\varepsilon < 1" /> signifie que plus personne n'achète le
                  bien.
                </>
              ),
              explain: (
                <>
                  Non — inélastique veut dire que les clients réagissent <em>peu</em> au prix (ils
                  continuent d'acheter), pas qu'ils n'achètent pas. C'est même le cas où la
                  demande est la plus « captive ».
                </>
              ),
            },
            {
              text: <>Parce que le coût marginal y est forcément trop élevé.</>,
              explain: (
                <>
                  L'argument ne dépend pas du coût : même avec un coût marginal nul, un monopole
                  ne resterait pas en zone inélastique, car y vendre plus détruit de la recette.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3.1 · INEFFICACITÉ                                         */}
      {/* ============================================================ */}
      <Section id="inefficacite" kicker="§ 3.1 · Le verdict" title="L'inefficacité du monopole">
        <Lead>
          Le monopole maximise <em>son</em> profit. Mais du point de vue de la société tout
          entière — consommateurs compris — le compte n'y est pas : des gains d'échange restent
          sur la table. On va les mesurer au centime près.
        </Lead>

        <Callout variant="definition" title="Efficacité au sens de Pareto">
          Un marché est <strong>efficace au sens de Pareto</strong> s'il permet d'exploiter au
          mieux les gains de l'échange. Concrètement : il n'est{" "}
          <strong>plus possible d'améliorer la situation d'un agent sans détériorer celle d'un
          autre</strong>. En particulier, il n'est pas possible que le coût de production d'une
          unité supplémentaire soit <em>inférieur</em> à ce qu'un consommateur serait prêt à payer
          pour cette unité — sinon, produire cette unité et la lui vendre arrangerait tout le
          monde.{" "}
          <TheoryRef course="strategies" chapter="a1" section="pareto" label="Revoir le critère de Pareto" />
        </Callout>

        <H3>Les deux « cagnottes » de l'échange</H3>
        <CardGrid>
          <MiniCard title="SC — le surplus des consommateurs" tone="gold">
            La différence entre la <strong>disposition à payer</strong> des consommateurs (la
            hauteur de la courbe de demande) et le <strong>prix effectivement payé</strong>.
            Chaque acheteur qui aurait accepté de payer 9 € et ne paie que 6 € empoche 3 € de
            surplus. Graphiquement : le triangle entre la demande et la ligne de prix.
          </MiniCard>
          <MiniCard title="SP — le surplus des producteurs" tone="good">
            La différence entre les <strong>revenus des producteurs</strong> et leurs{" "}
            <strong>coûts de production</strong>. Chaque unité vendue 6 € qui ne coûtait que 2 € à
            produire rapporte 4 € de surplus. Graphiquement : la zone entre la ligne de prix et la
            courbe de coût marginal.
          </MiniCard>
        </CardGrid>
        <p>
          Le <strong>niveau de production efficace</strong> <M tex="y^e" /> est celui qui maximise
          la somme des deux — les gains totaux de l'échange. Il vérifie :
        </p>
        <FormulaBox
          tex="p(y^e) = cm(y^e)"
          label="La condition d'efficacité"
          caption="On produit tant que quelqu'un valorise l'unité plus qu'elle ne coûte — et on s'arrête pile quand les deux s'égalisent."
        />

        <H3>Le monopole s'arrête trop tôt</H3>
        <p>
          Or le monopole choisit <M tex="y^*" /> tel que <M tex="Rm(y^*) = cm(y^*)" />, et on
          sait que <M tex="Rm < p" />. Donc au point choisi par le monopole :
        </p>
        <MB tex="cm(y^*+1) < p(y^*+1)" />
        <p>
          Traduction : la <M tex="(y^*+1)" />
          <sup>ième</sup> unité coûterait <em>moins</em> à produire que ce qu'un acheteur est prêt
          à la payer. <strong>Le vendeur et l'acheteur bénéficieraient tous deux de sa
          vente</strong>… et pourtant elle n'a pas lieu. Le marché est donc{" "}
          <strong>inefficace</strong> : <M tex="y^* < y^e" /> et le prix de marché est plus élevé
          que le prix efficace.
        </p>
        <Callout variant="definition" title="La perte sèche (deadweight loss)">
          La <strong>perte sèche</strong> mesure les <strong>gains de l'échange qui ne sont pas
          réalisés</strong> par le marché : la valeur de toutes les unités entre <M tex="y^*" />{" "}
          et <M tex="y^e" /> qui auraient créé du surplus mais ne sont pas produites.
          Graphiquement : le triangle entre la demande et le coût marginal, de <M tex="y^*" /> à{" "}
          <M tex="y^e" />. Ce n'est pas un transfert vers le monopole — c'est de la richesse{" "}
          <strong>détruite</strong>, que personne ne récupère.
        </Callout>

        <SurplusWidget />

        <Callout variant="intuition" title="Mais pourquoi le monopole laisse-t-il cet argent sur la table ?">
          Parce que pour vendre ces unités supplémentaires, il devrait <strong>baisser son prix
          sur TOUTES les unités</strong> (retour du § 2.2). Ce que la société y gagnerait, lui le
          perdrait en marge sur ses ventes existantes. Le monopole sacrifie donc volontairement
          des échanges rentables <em>pour la société</em> afin de protéger sa marge{" "}
          <em>privée</em>. Toute la politique économique du monopole (§ 3.2 et § 3.3) cherche à
          réconcilier les deux.
        </Callout>

        <Quiz
          scope="ei1"
          id="q9"
          question={
            <>
              À l'optimum du monopole <M tex="y^*" />, on a <M tex="p(y^*) > cm(y^*)" />.
              Pourquoi cette situation est-elle <em>inefficace</em> au sens de Pareto ?
            </>
          }
          options={[
            {
              text: <>Parce que le monopole fait du profit, et le profit est une perte pour la société.</>,
              explain: (
                <>
                  Non : le profit est un <em>transfert</em> des consommateurs vers la firme — de
                  la richesse qui change de mains, pas de la richesse détruite. L'inefficacité,
                  c'est autre chose : ce qui n'est <em>créé par personne</em>.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'il existe des acheteurs prêts à payer plus que le coût de production
                  d'unités supplémentaires : des échanges gagnant-gagnant ne se font pas.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : <M tex="cm(y^*+1) < p(y^*+1)" /> signifie qu'on pourrait produire
                  une unité de plus, la vendre à un prix entre le coût et la disposition à payer,
                  et <strong>tout le monde</strong> y gagnerait. Tant que c'est possible, le
                  marché n'est pas Pareto-efficace.
                </>
              ),
            },
            {
              text: <>Parce que le prix dépasse le coût moyen.</>,
              explain: (
                <>
                  Prix supérieur au coût <em>moyen</em> = profit positif. Encore une fois, le
                  profit n'est pas une inefficacité. Le bon repère est le coût{" "}
                  <em>marginal</em> : c'est lui qui dit si une unité de plus vaut la peine.
                </>
              ),
            },
            {
              text: <>Parce que le surplus du producteur est trop petit.</>,
              explain: (
                <>
                  Au contraire, le monopole gonfle son surplus de producteur ! Le problème est le
                  surplus <em>total</em> : il manque le triangle de perte sèche, qui ne va ni aux
                  consommateurs ni au producteur.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3.2 · RÉGULATION                                           */}
      {/* ============================================================ */}
      <Section id="regulation" kicker="§ 3.2 · L'État entre en scène" title="Réguler le monopole">
        <Lead>
          Puisque le monopole produit trop peu, pourquoi ne pas simplement l'obliger à produire le
          niveau efficace ? Bonne idée… qui se heurte à un mur dans le cas le plus important en
          pratique : le monopole naturel.
        </Lead>

        <H3>Le décor : la technologie du monopole naturel</H3>
        <p>
          En cas de monopole naturel, la technologie de la firme présente de{" "}
          <strong>forts rendements d'échelle</strong>, typiquement via un{" "}
          <strong>coût fixe très élevé</strong> (le réseau ferré, les canalisations, la centrale).
          Le cas d'école :
        </p>
        <MB tex="CT(y) = F + k\,y \qquad cm(y) = k \qquad CM(y) = \frac{F}{y} + k" />
        <Callout variant="definition" title="Coût moyen (CM)">
          Le <strong>coût moyen</strong> est le coût total divisé par le nombre d'unités :{" "}
          <M tex="CM(y) = CT(y)/y" />. Ici il vaut <M tex="F/y + k" /> : le coût fixe se répartit
          sur les unités produites, donc <strong>le coût moyen baisse sans arrêt</strong> quand la
          production augmente. Conséquence clé : le coût moyen est <em>toujours au-dessus</em> du
          coût marginal <M tex="k" /> — et c'est tout le drame de la suite.
        </Callout>

        <H3>Idée n° 1 — Imposer le prix efficace p = cm : le remède qui tue</H3>
        <p>
          Au niveau efficace <M tex="y^e" />, la firme doit fixer un prix{" "}
          <M tex="p(y^e) = k" />… qui est <strong>inférieur à son coût moyen</strong>{" "}
          <M tex="CM(y^e)" />. Calcule sa perte :
        </p>
        <MB tex="\Pi = (p - k)\,y^e - F = (k - k)\,y^e - F = -F" />
        <p>
          La firme fait des pertes <strong>exactement égales à ses coûts fixes</strong>. On ne
          peut donc pas forcer un monopole naturel à tarifer au coût marginal « sans autre
          mesure » : sinon on force la firme à quitter le marché — et on détruit le marché et
          tous les gains de l'échange qu'il permettait. Le remède serait pire que le mal.
        </p>

        <H3>Idée n° 2 — Subventionner les coûts fixes</H3>
        <p>
          L'État pourrait prendre à sa charge les coûts fixes : <strong>subsidier la firme à
          hauteur de <M tex="F" /></strong> tout en exigeant qu'elle tarife au coût marginal.
          Exemple des slides : la <strong>SNCB</strong> — des billets proches du coût marginal du
          voyage, l'infrastructure payée par la collectivité. Mais trois difficultés :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Les subventions peuvent être <strong>interdites par la législation</strong> (règles
            d'aides d'État…).
          </li>
          <li>
            Pour subventionner, l'État doit lever une <strong>taxe ailleurs</strong>… qui crée
            elle-même une perte d'efficacité. On déplace la distorsion au lieu de l'éliminer.
          </li>
          <li>
            Une subvention introduit un risque de <strong>« rent seeking »</strong> : les
            dirigeants d'une firme subventionnée sont moins incités à réduire des coûts qui
            pourraient être couverts par une hausse de subvention.
          </li>
        </ul>

        <H3>Idée n° 3 — La tarification au coût moyen</H3>
        <p>
          L'État peut aussi ne pas subsidier, mais exiger que la firme{" "}
          <strong>tarife au coût moyen</strong> et satisfasse la demande, de façon à ne pas
          réaliser de « profits anormaux » (profit exactement nul). La firme produit alors{" "}
          <M tex="y^M" />, à l'intersection de la demande et de la courbe <M tex="CM" /> : moins
          que l'efficace <M tex="y^e" />, mais <strong>déjà nettement mieux</strong> que la
          production de monopole <M tex="y^*" />.
        </p>

        <RegulationWidget />

        <Callout variant="attention" title="Les remarques des slides — importantes pour la culture (et l'examen)">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>« Privatiser » et « libéraliser »</strong> les monopoles naturels (souvent
              des services publics) pour les obliger à être « rentables » peut s'avérer{" "}
              <strong>catastrophique</strong> en présence d'importants coûts fixes : c'est le
              passage de <M tex="y^M" /> ou <M tex="y^e" /> vers <M tex="y^*" /> — moins de
              production, des prix plus élevés.
            </li>
            <li>
              Cependant, l'État peut préférer cette solution car son{" "}
              <strong>information sur la firme est trop imparfaite</strong> : il ne peut pas
              efficacement la subsidier ni évaluer ses coûts moyens.
            </li>
            <li>
              De plus, les agents à l'intérieur de la firme peuvent avoir intérêt à{" "}
              <strong>cacher les coûts et la rentabilité</strong> réels, pour jouir d'une rente de
              situation (rent seeking, encore).
            </li>
          </ul>
        </Callout>

        <Quiz
          scope="ei1"
          id="q10"
          question={
            <>
              On force un monopole naturel (<M tex="CT = F + ky" />) à tarifer au coût marginal,
              sans aucune subvention. Que se passe-t-il ?
            </>
          }
          options={[
            {
              text: <>Son profit devient nul : c'est l'objectif recherché.</>,
              explain: (
                <>
                  Non : à <M tex="p = k" />, la firme couvre ses coûts <em>variables</em> mais pas
                  son coût fixe. Profit nul, c'est la tarification au coût <em>moyen</em>, pas au
                  coût marginal.
                </>
              ),
            },
            {
              text: (
                <>
                  Elle perd exactement <M tex="F" /> : à terme, elle quitte le marché et le marché
                  disparaît.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : <M tex="\Pi = (k-k)y - F = -F" />. Le prix couvre pile le coût de chaque
                  unité, mais rien ne paie le réseau. Sans subvention égale à <M tex="F" />, la
                  firme sort — et détruit tous les gains de l'échange. C'est LE dilemme du
                  monopole naturel.
                </>
              ),
            },
            {
              text: <>Elle continue de faire des profits, juste plus petits.</>,
              explain: (
                <>
                  Impossible : le coût moyen <M tex="F/y + k" /> est <em>toujours</em> strictement
                  au-dessus de <M tex="k" />. Vendre au coût marginal, c'est vendre en dessous du
                  coût moyen — donc à perte, quelle que soit la quantité.
                </>
              ),
            },
            {
              text: <>Elle produit encore moins qu'avant pour compenser.</>,
              explain: (
                <>
                  Produire moins n'aide pas : le coût fixe reste dû, et la perte reste{" "}
                  <M tex="-F" /> tant que <M tex="p = k" />. Le problème n'est pas la quantité,
                  c'est que rien ne finance <M tex="F" />.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3.3 · TAXATION                                             */}
      {/* ============================================================ */}
      <Section id="taxation" kicker="§ 3.3 · L'arme fiscale" title="Taxer le monopole">
        <Lead>
          On pourrait penser que pour « corriger » le comportement du monopole — qui produit trop
          peu à un prix trop élevé — il suffit de le taxer. Analysons dans quelle mesure une
          taxation modifie son comportement. Spoiler : le résultat est contre-intuitif, et c'est
          un des plus beaux passages du chapitre.
        </Lead>

        <p>Les slides considèrent deux types de taxation :</p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            une <strong>taxe sur les profits</strong> (l'État prélève <M tex="t\,\%" /> du
            profit) ;
          </li>
          <li>
            une <strong>taxe par unité vendue</strong> (l'État prélève <M tex="t" /> € sur chaque
            unité).
          </li>
        </ul>

        <H3>Taxe n° 1 — Sur les profits : parfaitement neutre</H3>
        <p>
          Avant taxe, le monopole choisit <M tex="y^*" /> tel que la dérivée du profit s'annule :
        </p>
        <MB tex="\frac{d\,\Pi(y)}{dy} = 0 \;\iff\; y = y^*" />
        <p>
          Après taxe, son profit net s'écrit <M tex="\Pi(y) - t\,\Pi(y) = (1-t)\,\Pi(y)" />.
          Quelle valeur de <M tex="y" /> maximise ce profit net ? On dérive — la constante{" "}
          <M tex="(1-t)" /> sort de la dérivée :
        </p>
        <MB tex="\frac{d\,[(1-t)\Pi(y)]}{dy} = (1-t)\,\frac{d\,\Pi(y)}{dy} = 0 \;\iff\; \frac{d\,\Pi(y)}{dy} = 0 \;\iff\; y = y^*" />
        <Callout variant="retiens" title="Une taxe sur les profits est neutre">
          C'est la <strong>même</strong> valeur <M tex="y^*" /> qu'avant taxe ! Multiplier une
          fonction par une constante positive ne déplace pas son maximum. La taxe sur les profits{" "}
          <strong>n'affecte donc ni la production, ni le prix, ni la demande</strong> : le
          monopole se comporte exactement pareil, il reverse juste une part du butin à l'État.
        </Callout>

        <H3>Taxe n° 2 — Par unité vendue : elle aggrave tout</H3>
        <p>
          Une taxe de <M tex="t" /> € par unité vendue <strong>accroît le coût marginal de
          production de <M tex="t" /> €</strong> : chaque unité coûte désormais son coût de
          production <em>plus</em> la taxe. La courbe <M tex="cm" /> se translate vers le haut, et
          l'intersection avec <M tex="Rm" /> recule : le monopole{" "}
          <strong>réduit la production d'équilibre à <M tex="y'" /> et accroît le prix à{" "}
          <M tex="p'" /></strong>.
        </p>

        <TaxWidget />

        <Callout variant="attention" title="Le paradoxe de politique économique">
          La taxe par unité vendue provoque des distorsions{" "}
          <strong>qui renforcent les distorsions de monopole</strong> ! Le monopole produisait
          déjà trop peu, la taxe le fait produire encore moins. Pour l'inciter à produire plus et
          à vendre moins cher, c'est un <strong>subside à la production</strong> qu'il faudrait
          préconiser, et non une taxation. Mais il est évidemment éthiquement difficile d'accepter
          de subventionner une firme qui, par son comportement de maximisation du profit, produit
          trop peu à un prix trop élevé… D'où la conclusion des slides : une{" "}
          <strong>combinaison subside à la production + taxation du profit</strong> (ou une
          régulation appropriée) serait plus acceptable pour réduire les inefficacités du
          monopole.
        </Callout>

        <H3>Qui paie vraiment la taxe unitaire ?</H3>
        <p>
          Dernière question, la plus surprenante : quand l'État prélève <M tex="t" /> € par unité,
          qui paie — la firme ou le client ? Pour y répondre proprement, les slides prennent un
          coût marginal constant <M tex="k" /> et une demande particulière, à{" "}
          <strong>élasticité constante</strong> (dite <em>iso-élastique</em> — ce que la demande
          linéaire n'est pas) :
        </p>
        <MB tex="y = p^{-\varepsilon}" />
        <p>Vérifions que son élasticité vaut bien <M tex="\varepsilon" /> partout :</p>
        <MB tex="-\frac{p}{y}\frac{dy}{dp} = -\frac{p}{y}\,(-\varepsilon)\,p^{-\varepsilon-1} = \frac{p}{p^{-\varepsilon}}\,\varepsilon\, p^{-\varepsilon-1} = \varepsilon" />
        <p>
          On peut donc appliquer la formule du prix de la section 2.4, qui devient ici valable
          quelle que soit la quantité :
        </p>
        <MB tex="p(y^*) = \frac{k}{1 - \tfrac{1}{\varepsilon}} = \frac{\varepsilon}{\varepsilon - 1}\,k" />
        <p>
          La taxe accroît le coût marginal de <M tex="t" /> €, de sorte que le prix optimal du
          monopole devient :
        </p>
        <MB tex="p(y') = \frac{\varepsilon}{\varepsilon - 1}\,(k + t)" />
        <p>Le surcroît de prix payé par le consommateur est donc :</p>
        <FormulaBox
          tex="p(y') - p(y^*) = \frac{\varepsilon}{\varepsilon-1}(k+t) - \frac{\varepsilon}{\varepsilon-1}k = \frac{\varepsilon}{\varepsilon-1}\,t \;>\; t"
          label="La sur-répercussion de la taxe"
          caption={
            <>
              Comme <M tex="\varepsilon > 1" />, on a <M tex="\tfrac{\varepsilon}{\varepsilon-1} > 1" /> :
              le monopole accroît le prix payé par le consommateur d'un montant{" "}
              <strong>plus élevé que la taxe elle-même</strong>. Si{" "}
              <M tex="\varepsilon = 2" />, les consommateurs paient un surcroît de prix égal à{" "}
              <M tex="2t" /> — deux fois la taxe !
            </>
          }
        />

        <TaxIncidenceWidget />

        <Quiz
          scope="ei1"
          id="q11"
          question={
            <>
              L'État veut récupérer une partie de la rente d'un monopole <em>sans aggraver</em> la
              perte sèche. Quelle taxe doit-il choisir ?
            </>
          }
          options={[
            {
              text: <>Une taxe de t % sur le profit.</>,
              correct: true,
              explain: (
                <>
                  Oui : maximiser <M tex="(1-t)\Pi(y)" /> donne le même <M tex="y^*" /> que
                  maximiser <M tex="\Pi(y)" />. Production, prix, demande : rien ne bouge. L'État
                  capte <M tex="t\,\%" /> du profit et la perte sèche reste inchangée.
                </>
              ),
            },
            {
              text: <>Une taxe de t € par unité vendue.</>,
              explain: (
                <>
                  Mauvais choix : elle accroît le coût marginal, donc le monopole produit{" "}
                  <em>encore moins</em> et vend <em>encore plus cher</em> — la perte sèche
                  augmente. Et avec une demande iso-élastique, le client paie même plus que la
                  taxe !
                </>
              ),
            },
            {
              text: <>Les deux se valent : une taxe est une taxe.</>,
              explain: (
                <>
                  Non — c'est justement la grande leçon de cette section : l'<em>assiette</em>{" "}
                  d'une taxe (profit vs unité) change complètement ses effets sur le comportement
                  de la firme.
                </>
              ),
            },
            {
              text: <>Aucune : toute taxe augmente forcément le prix payé par le client.</>,
              explain: (
                <>
                  La taxe sur le profit fait exception : elle frappe le <em>résultat</em> et non
                  la <em>marge de la dernière unité</em>, donc elle ne déplace pas l'optimum{" "}
                  <M tex="Rm = cm" /> et le prix ne bouge pas d'un centime.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3.4 · CONCURRENCE MONOPOLISTIQUE                           */}
      {/* ============================================================ */}
      <Section
        id="monopolistique"
        kicker="§ 3.4 · La généralisation"
        title="La concurrence monopolistique"
      >
        <Lead>
          « Une seule firme sur le marché » : le monopole pur semble un cas rare. Alors pourquoi
          tout ce chapitre ? Parce que la <em>plupart</em> des biens réels sont vendus par des
          firmes qui se comportent… exactement comme des monopoles. Voici la structure de marché
          la plus répandue du monde.
        </Lead>

        <Callout variant="definition" title="Concurrence monopolistique">
          Structure de marché où <strong>plusieurs firmes produisent des biens similaires mais
          différenciés</strong>, imparfaitement substituables. Exemple des slides : les voitures,
          déclinées en marques (Renault, Kia, Opel…). Chaque firme{" "}
          <strong>dispose d'un pouvoir de monopole sur sa marque</strong> — personne d'autre ne
          vend de Renault — <strong>mais souffre de la concurrence des autres marques</strong>,
          qui sont un peu différentes (une Renault n'est ni une Kia ni une Opel).
        </Callout>

        <p>
          Conséquence : chaque firme fait face à une <strong>demande décroissante</strong>, dont
          la <strong>pente reflète la substituabilité entre les marques</strong> :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Grâce à son « monopole de marque », elle peut <strong>augmenter son prix sans perdre
            toutes ses ventes</strong> (contrairement à la concurrence parfaite) : ses fans
            restent.
          </li>
          <li>
            Mais elle en <strong>perdra une partie</strong> : certains clients préféreront acheter
            un bien substitut. Plus les marques sont interchangeables, plus la demande de chaque
            firme est plate — la concurrence se lit dans la pente.
          </li>
        </ul>
        <Callout variant="retiens" title="Pourquoi ce chapitre est universel">
          La plupart des biens sont produits en concurrence monopolistique…{" "}
          <strong>qui s'analyse exactement comme le monopole</strong> : chaque firme égalise{" "}
          <M tex="Rm = Cm" /> sur SA demande décroissante et fixe SON prix au-dessus de SON coût
          marginal. D'où l'intérêt de bien comprendre la théorie du monopole : tu viens
          d'apprendre le modèle de la boulangerie, du restaurant, de la marque de baskets et de
          l'appli mobile — pas seulement celui de la SWDE.
        </Callout>

        <H3>La libre entrée : ce qui change tout à long terme</H3>
        <p>
          Contrairement au vrai monopole, ici <strong>de nouvelles firmes peuvent toujours
          s'installer</strong> et produire un bien légèrement différent. Le mécanisme, étape par
          étape :
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            De nouvelles entreprises <strong>entrent dans le secteur</strong> (en payant un coût
            fixe) tant qu'elles s'attendent à faire des <strong>profits</strong>.
          </li>
          <li>
            Chaque nouvelle entrée <strong>réduit la demande (et la Rm) des autres firmes</strong>{" "}
            du secteur : les clients se répartissent entre plus de marques.
          </li>
          <li>
            Le processus se poursuit jusqu'à ce que le profit disparaisse : à l'équilibre, la
            demande de chaque firme devient <strong>tangente à sa courbe de coût moyen</strong> au
            point qu'elle choisit.
          </li>
          <li>
            À l'équilibre, cette concurrence entre monopoles aboutit à des{" "}
            <strong>profits nuls</strong>… mais chaque entreprise{" "}
            <strong>tarife toujours son produit comme un monopole</strong> !
          </li>
        </ul>

        <MonopolisticWidget />

        <H3>Le bilan d'efficacité : subtil</H3>
        <CardGrid>
          <MiniCard title="Ce qui ne va pas" tone="bad">
            Profit nul <M tex="\neq" /> efficacité : comme en monopole,{" "}
            <strong>le prix reste supérieur au coût marginal</strong> (perte sèche sur chaque
            marque). Et au point de tangence, on{" "}
            <strong>ne minimise pas le coût moyen</strong> de production : chaque firme est « trop
            petite » par rapport à son échelle idéale.
          </MiniCard>
          <MiniCard title="Ce qui plaît quand même" tone="good">
            L'entrée de nouvelles firmes crée une <strong>grande variété de produits légèrement
            différenciés</strong> — et cette variété <strong>plaît aux consommateurs</strong>.
            Pour juger la non-optimalité du marché, il faudrait donc aussi mesurer la{" "}
            <strong>préférence pour la variété</strong> : moins d'efficacité productive, mais plus
            de choix.
          </MiniCard>
        </CardGrid>

        <Quiz
          scope="ei1"
          id="q12"
          question={
            <>
              À l'équilibre de long terme de la concurrence monopolistique, chaque firme fait un
              profit nul. Le marché est-il efficace ?
            </>
          }
          options={[
            {
              text: <>Oui : profit nul, c'est la définition de l'efficacité.</>,
              explain: (
                <>
                  Piège central de cette section ! Profit nul veut dire prix = coût{" "}
                  <em>moyen</em>. L'efficacité exige prix = coût <em>marginal</em>. Les deux ne
                  coïncident pas ici.
                </>
              ),
            },
            {
              text: (
                <>
                  Non : le prix reste supérieur au coût marginal — chaque firme tarife comme un
                  monopole, avec la perte sèche qui va avec.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : la libre entrée élimine les profits (la demande devient tangente au
                  CM), mais chaque firme continue d'égaliser <M tex="Rm = Cm" /> sur sa demande
                  décroissante. <M tex="p > Cm" /> subsiste, et le coût moyen n'est pas minimisé.
                  Nuance à garder : la variété créée par l'entrée plaît aux consommateurs — le
                  bilan complet devrait en tenir compte.
                </>
              ),
            },
            {
              text: <>Oui, car les consommateurs profitent de la variété des marques.</>,
              explain: (
                <>
                  La variété est un vrai bénéfice, mais elle ne suffit pas à conclure à
                  l'efficacité : il reste <M tex="p > Cm" /> sur chaque marque. Les slides disent
                  précisément qu'il <em>faudrait</em> peser la préférence pour la variété pour
                  faire le bilan complet — pas que le bilan est positif.
                </>
              ),
            },
            {
              text: <>Non : les firmes font des pertes à long terme.</>,
              explain: (
                <>
                  Non — l'entrée s'arrête exactement quand le profit atteint zéro, pas en dessous.
                  Des pertes provoqueraient des <em>sorties</em> de firmes, ce qui ferait remonter
                  les demandes des survivantes.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* ★ · SYNTHÈSE                                                 */}
      {/* ============================================================ */}
      <Section id="synthese" kicker="★ · Récapitulatif" title="À maîtriser absolument">
        <Lead>
          Si tu sais réexpliquer chaque point avec tes propres mots — et refaire chaque calcul —
          tu as le chapitre. Coche au fur et à mesure, puis verrouille avec les trois exercices
          corrigés.
        </Lead>

        <MasteryChecklist
          items={[
            {
              title: "1 · Concurrence parfaite = preneur de prix",
              body: (
                <>
                  Firme minuscule + bien homogène → demande perçue{" "}
                  <strong>parfaitement élastique</strong> (plate). Impossible de vendre au-dessus
                  du prix de marché, ruineux de vendre en dessous.
                </>
              ),
            },
            {
              title: "2 · Monopole = seule firme, face à la demande du marché",
              body: (
                <>
                  Pour vendre plus, il faut baisser le prix. La demande décroissante est la
                  « carte » de ses choix possibles.
                </>
              ),
            },
            {
              title: "3 · La demande linéaire p = a − by et ses deux origines",
              body: (
                <>
                  Préférences quadratiques (<M tex="U = -\tfrac{b}{2}y^2 + ay + m" /> → FOC{" "}
                  <M tex="p = a - by" />) OU demandes unitaires (plage :{" "}
                  <M tex="y = \tfrac{1}{t}(r-p)" />, avec <M tex="a = r" />, <M tex="b = t" />).
                </>
              ),
            },
            {
              title: "4 · Pourquoi les monopoles existent, et leur légalité",
              body: (
                <>
                  Monopole naturel (coûts fixes énormes), restrictions légales (brevet, licence,
                  concession), barrières à l'entrée. TFUE art. 102 : l'<strong>abus</strong> de
                  position dominante est interdit, pas la position.
                </>
              ),
            },
            {
              title: "5 · La condition d'optimum : Rm = Cm",
              body: (
                <>
                  Si <M tex="Rm > cm" /> → produire plus ; si <M tex="Rm < cm" /> → produire
                  moins. Le coût fixe ne joue aucun rôle dans le choix de <M tex="y^*" />.
                </>
              ),
            },
            {
              title: "6 · Rm < p : effet quantité vs effet prix",
              body: (
                <>
                  <M tex="Rm(y) = p(y) + y\,\tfrac{dp}{dy} < p(y)" /> : la nouvelle unité rapporte
                  le prix, mais la baisse de prix ampute la recette de toutes les unités déjà
                  vendues. Exemple type : 10 €/2 unités → 9 €/3 unités : Rm = 7 {"<"} 9.
                </>
              ),
            },
            {
              title: "7 · L'exemple analytique complet",
              body: (
                <>
                  <M tex="Rm = a - 2by" /> (même ordonnée que la demande, pente double),{" "}
                  <M tex="cm = k + 2\beta y" />, d'où{" "}
                  <M tex="y^* = \tfrac{a-k}{2(b+\beta)}" /> et <M tex="p^* = a - by^*" /> lu{" "}
                  <strong>sur la demande</strong>.
                </>
              ),
            },
            {
              title: "8 · Élasticité, prix, marge, Lerner",
              body: (
                <>
                  <M tex="p = \tfrac{k}{1-1/\varepsilon}" />,{" "}
                  <M tex="p - k = \tfrac{k}{\varepsilon-1}" />, Lerner{" "}
                  <M tex="= \tfrac{p-k}{p} = \tfrac{1}{\varepsilon} \in [0,1]" />. Le monopole
                  opère toujours en zone <M tex="\varepsilon > 1" />. ε grand → quasi-concurrence ;
                  ε proche de 1 → prix qui flambe.
                </>
              ),
            },
            {
              title: "9 · L'inefficacité : y* < yᵉ et la perte sèche",
              body: (
                <>
                  Efficace : <M tex="p = cm" />. Monopole : <M tex="cm(y^*+1) < p(y^*+1)" /> — des
                  échanges gagnant-gagnant ne se font pas. La perte sèche = gains de l'échange non
                  réalisés, perdus pour tous.
                </>
              ),
            },
            {
              title: "10 · Le monopole naturel et sa régulation",
              body: (
                <>
                  <M tex="CM = F/y + k" /> toujours décroissant. Forcer <M tex="p = cm" /> →
                  pertes = <M tex="F" /> → sortie du marché. Solutions : subside de <M tex="F" />{" "}
                  (SNCB) avec ses 3 difficultés (légalité, coût des taxes, rent seeking), ou
                  tarification au coût moyen (profit nul, <M tex="y^M" /> entre <M tex="y^*" /> et{" "}
                  <M tex="y^e" />).
                </>
              ),
            },
            {
              title: "11 · Taxer le monopole",
              body: (
                <>
                  Taxe sur le profit : <strong>neutre</strong> (même <M tex="y^*" />). Taxe
                  unitaire : <M tex="cm + t" /> → production ↓, prix ↑, distorsions{" "}
                  <strong>renforcées</strong>. Avec demande iso-élastique{" "}
                  <M tex="y = p^{-\varepsilon}" /> : hausse de prix ={" "}
                  <M tex="\tfrac{\varepsilon}{\varepsilon-1}t > t" /> (2t si ε = 2).
                </>
              ),
            },
            {
              title: "12 · La concurrence monopolistique",
              body: (
                <>
                  Biens différenciés → chaque firme a une demande décroissante et tarife comme un
                  monopole. Libre entrée → profits nuls (demande tangente au CM)… mais{" "}
                  <M tex="p > Cm" /> subsiste. Contrepartie : la variété plaît aux consommateurs.
                </>
              ),
            },
          ]}
        />

        <Callout variant="examen" title="La suite au chapitre EI3">
          Tu sais maintenant ce que fait un monopole qui vend <em>un</em> bien à <em>un</em> prix.
          Le chapitre <strong>EI3 · Le comportement du monopole</strong> prolonge l'analyse des
          slides : <strong>discrimination par les prix</strong> (faire payer des prix différents à
          des clients différents), <strong>double marginalisation</strong> (chaînes de monopoles)
          et tarification en deux parties. Garde bien en tête <M tex="Rm = Cm" /> et l'indice de
          Lerner : tout y refait surface.
        </Callout>

        <H3>Trois exercices corrigés pour tout verrouiller</H3>

        <ExerciseBlock
          scope="ei1"
          id="ex1"
          number={1}
          title="Le monopole de A à Z (l'exemple analytique des slides, en chiffres)"
          difficulty={2}
          refs={[
            { chapter: "ei1", section: "exemple-analytique" },
            { chapter: "ei1", section: "inefficacite" },
          ]}
          statement={
            <>
              Un monopole fait face à la demande <M tex="p(y) = 14 - y" /> et supporte le coût{" "}
              <M tex="c(y) = 6 + 2y + \tfrac{1}{2}y^2" /> (donc <M tex="F = 6" />,{" "}
              <M tex="k = 2" />, <M tex="\beta = \tfrac{1}{2}" />).{" "}
              <strong>(a)</strong> Quelle production choisit-il ? <strong>(b)</strong> À quel
              prix vend-il ? <strong>(c)</strong> Quel profit réalise-t-il ?{" "}
              <strong>(d)</strong> Quelle serait la production efficace, et que vaut la perte
              sèche ?
            </>
          }
          steps={[
            {
              title: "(a) Écrire la recette marginale",
              content: (
                <>
                  <p>
                    Recette totale : <M tex="R(y) = (14 - y)\,y = 14y - y^2" />. On dérive :
                  </p>
                  <MB tex="Rm(y) = 14 - 2y" />
                  <p>
                    Vérifie le réflexe graphique : même ordonnée à l'origine que la demande (14),
                    pente double (−2 au lieu de −1).
                  </p>
                </>
              ),
            },
            {
              title: "(a) Écrire le coût marginal et égaliser",
              content: (
                <>
                  <p>
                    <M tex="cm(y) = \tfrac{dc}{dy} = 2 + y" /> (le coût fixe 6 disparaît dans la
                    dérivée). Condition d'optimum :
                  </p>
                  <MB tex="14 - 2y^* = 2 + y^* \;\iff\; 12 = 3y^* \;\iff\; y^* = 4" />
                  <p>
                    Contrôle avec la formule générale :{" "}
                    <M tex="y^* = \tfrac{a-k}{2(b+\beta)} = \tfrac{14-2}{2(1+\tfrac12)} = \tfrac{12}{3} = 4" />. ✓
                  </p>
                </>
              ),
            },
            {
              title: "(b) Le prix se lit sur la demande",
              content: (
                <>
                  <MB tex="p^* = 14 - y^* = 14 - 4 = 10 \text{ €}" />
                  <p>
                    Piège évité : à l'intersection, <M tex="Rm(4) = cm(4) = 6" /> — ce n'est{" "}
                    <strong>pas</strong> le prix ! Les consommateurs paient 10 € pour absorber 4
                    unités, et on a bien <M tex="Rm = 6 < 10 = p" />.
                  </p>
                </>
              ),
            },
            {
              title: "(c) Le profit (le coût fixe refait surface)",
              content: (
                <>
                  <p>
                    Recette : <M tex="R(4) = 10 \times 4 = 40" /> €. Coût :{" "}
                    <M tex="c(4) = 6 + 2\times 4 + \tfrac12 \times 16 = 6 + 8 + 8 = 22" /> €.
                  </p>
                  <MB tex="\Pi = 40 - 22 = 18 \text{ €}" />
                </>
              ),
            },
            {
              title: "(d) Production efficace et perte sèche",
              content: (
                <>
                  <p>
                    Efficacité : <M tex="p = cm" /> →{" "}
                    <M tex="14 - y = 2 + y \iff y^e = 6 > 4 = y^*" /> : le monopole produit un
                    tiers de moins que l'efficace.
                  </p>
                  <p>
                    Perte sèche = triangle entre demande et <M tex="cm" /> de <M tex="y^*" /> à{" "}
                    <M tex="y^e" />. En <M tex="y^* = 4" /> : disposition à payer{" "}
                    <M tex="p(4) = 10" />, coût marginal <M tex="cm(4) = 6" /> → écart 4. En{" "}
                    <M tex="y^e = 6" /> : écart 0. Aire du triangle :
                  </p>
                  <MB tex="PS = \tfrac{1}{2}\times (6-4) \times (10-6) = 4 \text{ €}" />
                </>
              ),
            },
          ]}
          result={
            <>
              <M tex="y^* = 4" />, <M tex="p^* = 10" /> €, <M tex="\Pi = 18" /> €,{" "}
              <M tex="y^e = 6" />, perte sèche = 4 €. <em>À retenir :</em> la chaîne complète —
              Rm, cm, égaliser, remonter à la demande, profit, puis comparaison avec l'efficacité.
              C'est exactement le canevas de l'exemple analytique des slides.
            </>
          }
        />

        <ExerciseBlock
          scope="ei1"
          id="ex2"
          number={2}
          title="Lire le pouvoir de marché dans les prix"
          difficulty={1}
          refs={[{ chapter: "ei1", section: "pouvoir" }]}
          statement={
            <>
              Un opérateur, seul sur son marché, a un coût marginal constant <M tex="k = 6" /> €.
              On observe qu'il vend à <M tex="p = 8" /> €. <strong>(a)</strong> Calcule son indice
              de Lerner. <strong>(b)</strong> Déduis-en l'élasticité de la demande à laquelle il
              fait face. <strong>(c)</strong> Ses clients deviennent plus captifs :{" "}
              <M tex="\varepsilon" /> tombe à 2. Quel prix fixera-t-il ?
            </>
          }
          steps={[
            {
              title: "(a) L'indice de Lerner : la marge relative",
              content: (
                <>
                  <MB tex="L = \frac{p - k}{p} = \frac{8-6}{8} = 0{,}25" />
                  <p>25 % de chaque euro payé par le client est de la marge pure.</p>
                </>
              ),
            },
            {
              title: "(b) De Lerner à l'élasticité",
              content: (
                <>
                  <p>
                    À l'optimum du monopole, <M tex="L = 1/\varepsilon" />. Donc :
                  </p>
                  <MB tex="\varepsilon = \frac{1}{L} = \frac{1}{0{,}25} = 4" />
                  <p>
                    Interprétation : une hausse de prix de 1 % lui fait perdre 4 % de sa demande.
                    C'est la magie de l'indice : <strong>observer prix et coût suffit à révéler
                    l'élasticité</strong> à laquelle la firme croit faire face.
                  </p>
                </>
              ),
            },
            {
              title: "(c) Clients plus captifs → marge plus grosse",
              content: (
                <>
                  <MB tex="p = \frac{k}{1 - \tfrac{1}{\varepsilon}} = \frac{6}{1 - \tfrac12} = 12 \text{ €}" />
                  <p>
                    La marge absolue passe de 2 € à 6 € (et Lerner de 0,25 à 0,5). Une demande
                    moitié moins élastique fait plus que doubler la marge : le monopole exploite à
                    fond la captivité de ses clients.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <>
              <M tex="L = 0{,}25" />, <M tex="\varepsilon = 4" />, nouveau prix{" "}
              <M tex="p = 12" /> €. <em>À retenir :</em> le triptyque{" "}
              <M tex="p = \tfrac{k}{1-1/\varepsilon}" />,{" "}
              <M tex="p-k = \tfrac{k}{\varepsilon-1}" />,{" "}
              <M tex="L = \tfrac{1}{\varepsilon}" /> se manipule dans les deux sens : des
              paramètres vers le prix, ou des prix observés vers l'élasticité.
            </>
          }
        />

        <ExerciseBlock
          scope="ei1"
          id="ex3"
          number={3}
          title="La taxe qui se retourne contre les consommateurs"
          difficulty={2}
          refs={[{ chapter: "ei1", section: "taxation" }]}
          statement={
            <>
              Un monopole a un coût marginal constant <M tex="k = 5" /> € et fait face à la
              demande iso-élastique <M tex="y = p^{-2}" /> (donc <M tex="\varepsilon = 2" />).
              L'État hésite entre deux mesures : une taxe de <M tex="t = 1" /> € par unité vendue,
              ou une taxe de 30 % sur le profit. <strong>(a)</strong> Quel est le prix sans
              taxe ? <strong>(b)</strong> Quel devient-il avec la taxe unitaire ?{" "}
              <strong>(c)</strong> Qui paie cette taxe ? <strong>(d)</strong> Et avec la taxe sur
              le profit ?
            </>
          }
          steps={[
            {
              title: "(a) Le prix sans taxe",
              content: (
                <>
                  <p>
                    Demande iso-élastique → la formule du prix s'applique avec{" "}
                    <M tex="\varepsilon = 2" /> :
                  </p>
                  <MB tex="p^* = \frac{\varepsilon}{\varepsilon - 1}\,k = \frac{2}{1}\times 5 = 10 \text{ €}" />
                  <p>Le monopole double son coût marginal (Lerner = 1/2).</p>
                </>
              ),
            },
            {
              title: "(b) Avec la taxe unitaire : le coût marginal devient k + t",
              content: (
                <>
                  <p>
                    Chaque unité vendue coûte désormais <M tex="5 + 1 = 6" /> € (production +
                    taxe). Le monopole réapplique sa règle de marge sur ce nouveau coût :
                  </p>
                  <MB tex="p' = \frac{\varepsilon}{\varepsilon-1}(k + t) = 2 \times 6 = 12 \text{ €}" />
                </>
              ),
            },
            {
              title: "(c) L'incidence : qui paie vraiment ?",
              content: (
                <>
                  <MB tex="p' - p^* = 12 - 10 = 2 \text{ €} = \frac{\varepsilon}{\varepsilon-1}\,t = 2t" />
                  <p>
                    Pour 1 € de taxe, le consommateur paie <strong>2 € de plus</strong> — 200 % de
                    la taxe ! Le monopole ne se contente pas de « refiler » la taxe : il applique
                    son coefficient de marge <M tex="\varepsilon/(\varepsilon-1) = 2" /> au coût
                    taxé. Et en plus, la production baisse : la perte sèche s'aggrave.
                  </p>
                </>
              ),
            },
            {
              title: "(d) La taxe sur le profit : rien ne bouge",
              content: (
                <>
                  <p>
                    Le monopole maximise <M tex="(1-0{,}3)\,\Pi(y) = 0{,}7\,\Pi(y)" />. Multiplier
                    le profit par 0,7 ne déplace pas son maximum :
                  </p>
                  <MB tex="\frac{d[0{,}7\,\Pi(y)]}{dy} = 0{,}7\,\frac{d\Pi(y)}{dy} = 0 \;\iff\; y = y^*" />
                  <p>
                    Production et prix inchangés (<M tex="p = 10" /> €) : le client ne voit rien,
                    l'État encaisse 30 % du profit. Pour financer l'État sans aggraver la
                    distorsion, c'est l'assiette « profit » qu'il faut choisir.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <>
              <M tex="p^* = 10" /> €, <M tex="p' = 12" /> € : le consommateur paie{" "}
              <strong>le double</strong> de la taxe unitaire, tandis que la taxe sur le profit est
              parfaitement neutre. <em>À retenir :</em> face à un monopole, l'assiette de la taxe
              change tout — taxer les unités aggrave la distorsion, taxer le profit ne la modifie
              pas.
            </>
          }
        />
      </Section>
    </ChapterShell>
  );
}
