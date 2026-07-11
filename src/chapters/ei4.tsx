/**
 * Chapitre EI4 · Les économies de réseau.
 * Rédaction pédagogique complète à partir des slides officiels du cours
 * (chapitre 4). Périmètre : introduction (effets directs ET indirects,
 * slides 1-8), monopole en ville linéaire (2.1), effets de réseau directs
 * en monopole (2.2, slides 12-29), ligne de Hotelling (3.1, slides 38-42)
 * et effets de réseau directs en duopole (3.2, slides 43-46).
 * Les sections 2.3 et 3.3 des slides (modèles d'effets de réseau
 * INDIRECTS / marchés à deux versants) sont HORS MATIÈRE et ne sont pas
 * traitées ici — elles sont seulement signalées dans l'introduction.
 */
import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  MasteryChecklist,
  WidgetAnticipations,
  WidgetDemandeReseau,
  WidgetDuopoleReseau,
  WidgetHotelling,
  WidgetVilleLineaire,
} from "./ei4/widgets";

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
    <ChapterShell chapterId="ei4">
      {/* ============================================================ */}
      {/* § 1 · INTRO — EFFETS DE RÉSEAU DIRECTS ET INDIRECTS          */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 1" title="Effets de réseau directs et indirects">
        <Lead>
          Un téléphone qui ne peut appeler personne ne vaut rien. Un réseau social sans tes amis
          non plus. Pour toute une famille de produits, la valeur ne vient pas du produit
          lui-même mais du <em>nombre de gens qui l'utilisent</em>. Ce chapitre modélise cette
          idée — et elle va bousculer tout ce que tu sais sur les courbes de demande.
        </Lead>

        <p>
          Imagine qu'on t'offre un abonnement gratuit à une messagerie flambant neuve,
          techniquement parfaite… mais sur laquelle il n'y a <strong>personne</strong>. Tu n'en
          voudrais pas. La même messagerie avec tous tes amis dessus ? Tu paierais pour y être.
          Le produit n'a pas changé : c'est le <strong>nombre d'utilisateurs</strong> qui fait
          toute sa valeur. Les économistes ont un nom pour ça.
        </p>

        <Callout variant="definition" title="Définition · Économies de réseau">
          <p>
            On parle d'<strong>économies de réseau</strong> pour un produit ou un service quand{" "}
            <strong>l'utilité d'un utilisateur</strong> du réseau{" "}
            <strong>augmente avec le nombre d'utilisateurs</strong> de ce réseau.
          </p>
          <p>On distingue deux familles :</p>
          <ul>
            <li>
              les <strong>effets de réseau directs</strong> : l'utilité d'un utilisateur augmente
              avec le nombre d'utilisateurs du <strong>« même type »</strong> que lui ;
            </li>
            <li>
              les <strong>effets de réseau indirects</strong> : l'utilité d'un utilisateur
              augmente avec le nombre d'utilisateurs d'un <strong>autre type</strong>.
            </li>
          </ul>
        </Callout>

        <H3>Les effets directs : plus on est de fous, plus on rit</H3>
        <p>
          Dans un effet <em>direct</em>, tous les utilisateurs sont du même type et chacun profite
          de l'arrivée des autres. Les trois exemples du cours :
        </p>

        <Tbl minW={560}>
          <thead>
            <tr>
              <th className={TH}>Exemple</th>
              <th className={TH}>Mécanisme</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <strong>Les communications</strong> : téléphone, email, messagerie instantanée…
                mais aussi une <em>langue</em>
              </td>
              <td className={TD}>
                Une hausse du nombre d'utilisateurs multiplie le nombre de communications
                disponibles, ce qui augmente l'utilité de <em>tous</em> les utilisateurs.
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>Les applis de trafic routier</strong> comme Waze
              </td>
              <td className={TD}>
                Plus d'utilisateurs = un meilleur diagnostic de l'état du trafic, utile pour tous
                les autres utilisateurs.
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>Les commentaires et recommandations</strong> laissés sur un site en ligne
              </td>
              <td className={TD}>
                Plus d'utilisateurs = plus d'avis publiés, ce qui aide tous les autres visiteurs
                du site à choisir.
              </td>
            </tr>
          </tbody>
        </Tbl>

        <Callout variant="exemple" title="Le cas de la langue">
          <p>
            L'exemple le plus ancien d'effet de réseau direct n'est pas numérique : c'est une{" "}
            <strong>langue</strong>. Apprendre l'anglais est utile précisément parce que des
            centaines de millions de personnes le parlent déjà : chaque nouveau locuteur augmente
            (un peu) la valeur de la langue pour tous les autres.
          </p>
        </Callout>

        <H3>Les effets indirects : deux « types » qui s'attirent mutuellement</H3>
        <p>
          Dans un effet <em>indirect</em>, le réseau met en relation des utilisateurs de{" "}
          <strong>types différents</strong>, et c'est la présence de l'<em>autre</em> type qui
          crée la valeur. L'illustration du cours : une <strong>console de jeux</strong>.
        </p>
        <ul>
          <li>
            Elle est achetée par des <strong>joueurs</strong>, qui y jouent à des jeux créés par
            des <strong>développeurs indépendants</strong> — deux types bien distincts.
          </li>
          <li>
            Une hausse du nombre de <strong>jeux créés</strong> par les développeurs augmente
            l'utilité des <strong>joueurs</strong> qui achètent la console.
          </li>
          <li>
            Et réciproquement : plus des joueurs achètent cette console, plus les développeurs
            créent (et vendent) des jeux pour elle. Un cercle vertueux entre les deux versants.
          </li>
        </ul>
        <p>
          Deuxième exemple du cours : les <strong>systèmes de paiement</strong> (American
          Express, Visa…). Ils regroupent deux types d'utilisateurs : les{" "}
          <strong>détenteurs de cartes</strong> et les <strong>commerçants</strong> qui acceptent
          la carte (détenteurs de terminaux). Plus de commerçants acceptent la carte, plus la
          carte est utile aux détenteurs ; et plus il y a de détenteurs, plus les commerçants ont
          intérêt à s'équiper du terminal.
        </p>
        <p>
          De façon générale, toute firme / <strong>plateforme</strong> mettant en relation
          plusieurs types d'utilisateurs risque d'être sujette aux effets de réseau indirects :
          Uber (chauffeurs et passagers), Deliveroo (clients, restaurants <em>et</em> coursiers —
          trois types !), AirBnB (hôtes et clients), les plateformes de crowdfunding (porteurs de
          projets et contributeurs), les agences immobilières (vendeurs et acheteurs)…
        </p>

        <Callout variant="attention" title="Direct ou indirect ? Le test du « type »">
          <p>
            Pose-toi une seule question : <em>qui</em> rend le réseau plus utile pour moi ?
          </p>
          <p>
            Des utilisateurs <strong>comme moi</strong> (d'autres abonnés de la même messagerie,
            d'autres conducteurs sur Waze) → effet <strong>direct</strong>. Des utilisateurs{" "}
            <strong>d'un autre type</strong> (des développeurs si je suis joueur, des commerçants
            si je détiens la carte) → effet <strong>indirect</strong>. Le même produit peut
            d'ailleurs combiner les deux !
          </p>
        </Callout>

        <Quiz
          scope="ei4"
          id="q1"
          question={
            <p>
              Plus il y a de conducteurs qui utilisent Waze, plus l'application diagnostique bien
              les embouteillages, et plus elle est utile… aux conducteurs. C'est un effet de
              réseau :
            </p>
          }
          options={[
            {
              text: <>direct</>,
              correct: true,
              explain: (
                <>
                  Exact : ceux qui rendent l'appli plus utile (les conducteurs qui alimentent
                  l'info trafic) sont du <strong>même type</strong> que ceux qui en profitent
                  (les conducteurs). Utilité qui augmente avec le nombre d'utilisateurs du même
                  type = effet direct.
                </>
              ),
            },
            {
              text: <>indirect</>,
              explain: (
                <>
                  Non : il n'y a ici qu'un seul type d'utilisateur, les conducteurs. Un effet
                  indirect exigerait deux types différents qui se rendent mutuellement service
                  (comme joueurs et développeurs pour une console).
                </>
              ),
            },
            {
              text: <>ce n'est pas un effet de réseau : l'appli marche même seul</>,
              explain: (
                <>
                  L'appli « fonctionne » seul, mais son <em>utilité</em> (la qualité du
                  diagnostic trafic) augmente clairement avec le nombre d'utilisateurs — c'est
                  la définition même d'une économie de réseau.
                </>
              ),
            },
          ]}
        />

        <H3>Le mot magique : externalité</H3>
        <p>
          Relis la définition : quand <em>je</em> rejoins un réseau, c'est l'utilité{" "}
          <em>des autres</em> qui augmente. Or personne ne me paie pour ce service rendu, et je
          n'en tiens donc probablement pas compte au moment de décider si j'adhère. Les
          économistes appellent ça une externalité — et c'est elle qui va rendre tout le chapitre
          intéressant.
        </p>

        <Callout variant="definition" title="Définition · Externalité de réseau">
          <p>
            Les économies de réseau génèrent une <strong>externalité</strong> :
          </p>
          <ul>
            <li>l'ajout d'un utilisateur augmente l'utilité des autres utilisateurs, et donc</li>
            <li>l'utilité d'un utilisateur dépend du nombre d'utilisateurs du réseau.</li>
          </ul>
          <p>
            Quand ils choisissent d'adhérer ou non, les utilisateurs risquent de{" "}
            <strong>ne pas tenir compte du bénéfice qu'ils fournissent aux autres</strong>, ce qui
            risque d'engendrer des <strong>inefficacités</strong>. En particulier, socialement, il
            pourrait y avoir <strong>trop peu d'utilisateurs</strong> qui optent pour le réseau.
          </p>
        </Callout>

        <Callout variant="intuition" title="Pourquoi « trop peu » d'utilisateurs ?">
          <p>
            Quand tu hésites à rejoindre un réseau, tu compares <em>ton</em> bénéfice à{" "}
            <em>ton</em> coût. Mais ta présence rapporterait aussi un petit quelque chose à
            chacun des autres membres — un bénéfice que tu ignores dans ton calcul. Résultat :
            des gens renoncent alors que la société dans son ensemble aurait gagné à ce qu'ils
            adhèrent. On chiffrera ce raisonnement précisément au § 2.2.
          </p>
        </Callout>

        <Quiz
          scope="ei4"
          id="q2"
          question={<p>Parmi ces trois situations, laquelle décrit un effet de réseau indirect ?</p>}
          options={[
            {
              text: (
                <>
                  Plus de commerçants acceptent une carte de paiement, plus cette carte est utile
                  à ses détenteurs
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : deux types d'utilisateurs différents (commerçants avec terminaux,
                  détenteurs de cartes), et l'utilité de l'un augmente avec le nombre de
                  l'<em>autre</em>. C'est l'exemple canonique d'effet indirect.
                </>
              ),
            },
            {
              text: <>Plus mes amis utilisent la même messagerie que moi, plus elle m'est utile</>,
              explain: (
                <>
                  Effet <strong>direct</strong> : mes amis et moi sommes des utilisateurs du même
                  type (des correspondants potentiels).
                </>
              ),
            },
            {
              text: <>Plus une langue compte de locuteurs, plus l'apprendre est utile</>,
              explain: (
                <>
                  Effet <strong>direct</strong> encore : tous les locuteurs sont du même type, et
                  chacun profite du nombre des autres.
                </>
              ),
            },
          ]}
        />

        <H3>Le plan du chapitre — et ce qui est hors matière</H3>
        <p>
          Comment une firme en <strong>monopole</strong> gère-t-elle cette externalité ? Que se
          passe-t-il en <strong>duopole</strong>, quand deux réseaux se font concurrence ? Voilà
          les deux questions du chapitre. On avance en quatre temps :
        </p>
        <ol className="my-4 grid list-none gap-2 pl-0 sm:grid-cols-2">
          {[
            ["§ 2.1", "Le monopole en ville linéaire, SANS effet de réseau (la base de référence)"],
            ["§ 2.2", "On ajoute l'effet de réseau direct : anticipations, équilibres multiples, masse critique"],
            ["§ 3.1", "Deux vendeurs en concurrence : la ligne de Hotelling, SANS effet de réseau"],
            ["§ 3.2", "On ajoute l'effet de réseau direct : la concurrence s'intensifie, p* = t − v"],
          ].map(([tag, rest], i) => (
            <li key={i} className="rounded-xl border bg-muted/40 px-3.5 py-2 text-[14.5px]">
              <span className="mr-1.5 font-bold text-primary">{tag}</span>
              {rest}
            </li>
          ))}
        </ol>

        <Callout variant="attention" title="Périmètre du cours — à lire avant de réviser">
          <p>
            Le plan complet des slides comporte aussi des sections « 2.3 » et « 3.3 » consacrées
            aux <strong>modèles</strong> d'effets de réseau <strong>indirects</strong> (les
            marchés à deux versants en monopole et en duopole). Ces deux sections sont{" "}
            <strong>hors matière</strong> : tu dois connaître la <em>définition</em> des effets
            indirects et leurs <em>exemples</em> (vus ci-dessus, c'est de la matière
            d'introduction), mais aucun modèle d'externalité indirecte ne sera demandé. Dans
            tout ce qui suit, on ne modélise que les effets de réseau <strong>directs</strong>.
          </p>
          <p>
            Dernière remarque des slides : l'externalité pourrait aussi être{" "}
            <em>négative</em> (encombrement, saturation, nuisance d'une publicité), mais nous
            étudierons uniquement le cas d'une <strong>externalité positive</strong>.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 2.1 · LE MONOPOLE EN VILLE LINÉAIRE (SANS RÉSEAU)          */}
      {/* ============================================================ */}
      <Section id="modele-monopole" kicker="§ 2.1" title="Le réseau en monopole : la ville linéaire">
        <Lead>
          Avant de brancher l'effet de réseau, il nous faut une base de comparaison : un monopole
          tout simple, dont les clients sont étalés le long d'une route. Ce petit modèle — la
          « ville linéaire » — va nous servir de squelette pour tout le chapitre.
        </Lead>

        <H3>Le décor : une route, un vendeur, des acheteurs dispersés</H3>
        <p>Voici la mise en place exacte des slides :</p>
        <ul>
          <li>
            un <strong>vendeur unique</strong> est situé à une extrémité d'une route d'un
            kilomètre (au point 0) ;
          </li>
          <li>
            chaque consommateur situé sur cette route achète <strong>au maximum une unité</strong>{" "}
            du produit (on parle de <em>demandes unitaires</em> : on achète le produit ou pas,
            mais jamais deux) ;
          </li>
          <li>
            les acheteurs sont répartis <strong>uniformément</strong> sur la route : on trouve par
            exemple 25 % des consommateurs à une distance inférieure à 0,25 km, et 75 % à une
            distance inférieure à 0,75 km.
          </li>
        </ul>

        <Callout variant="intuition" title="Pourquoi une « route » ? L'astuce géniale du modèle">
          <p>
            La répartition uniforme a une conséquence magique : la{" "}
            <strong>fraction des consommateurs situés avant un point <M tex="x" /></strong> est
            exactement égale à <M tex="x" />. Si les acheteurs jusqu'au kilomètre 0,6 achètent,
            alors la demande vaut… 0,6 (soit 60 % de la population, normalisée à 1). Mesurer une
            demande revient donc à mesurer une <em>longueur</em> sur la route. Toute la géométrie
            du chapitre repose là-dessus.
          </p>
        </Callout>

        <H3>L'utilité d'un acheteur : bénéfice, transport, prix</H3>
        <p>
          L'utilité nette d'un acheteur localisé au kilomètre <M tex="x \in [0,1]" /> vaut :
        </p>
        <MB tex="u = r - tx - p \quad \text{s'il achète}, \qquad u = 0 \quad \text{s'il n'achète pas,}" />
        <p>où :</p>
        <ul>
          <li>
            <M tex="r" /> est le <strong>bénéfice de l'achat</strong> d'une unité du bien
            (identique pour tous les consommateurs) ;
          </li>
          <li>
            <M tex="t < r" /> représente un <strong>coût de transport</strong> : plus j'habite
            loin du vendeur (grand <M tex="x" />), plus l'achat me coûte en déplacement ;
          </li>
          <li>
            <M tex="p" /> est le prix affiché par le vendeur.
          </li>
        </ul>

        <H3>Qui achète ? La demande, ligne par ligne</H3>
        <p>
          Un consommateur achète si son utilité nette d'achat est positive, c'est-à-dire :
        </p>
        <MB tex="r - tx - p > 0" />
        <p>
          On isole <M tex="x" /> : on fait passer <M tex="tx" /> à droite…
        </p>
        <MB tex="r - p > tx" />
        <p>
          … puis on divise par <M tex="t > 0" /> (le sens de l'inégalité ne change pas) :
        </p>
        <MB tex="x < \frac{1}{t}(r - p)" />
        <p>
          Il n'achète pas sinon. Les acheteurs sont donc exactement ceux situés{" "}
          <strong>avant la position frontière</strong> <M tex="\hat{x} = (r-p)/t" /> : le client
          « limite » est celui pour qui bénéfice et coûts s'équilibrent tout juste. Et vu la
          distribution uniforme, la demande est la longueur de la zone d'achat :
        </p>
        <FormulaBox
          tex="y = \frac{1}{t}(r - p)"
          label="Demande du monopole en ville linéaire (couverture partielle)"
          caption={
            <>
              Valable tant que ce nombre est entre 0 et 1. Si <M tex="p > r" />, personne
              n'achète (<M tex="y = 0" />) ; si <M tex="p \le r - t" />, même l'acheteur en{" "}
              <M tex="x = 1" /> achète : le marché est entièrement couvert (<M tex="y = 1" />).
            </>
          }
        />

        <Callout variant="attention" title="Couverture partielle ou totale : vérifie toujours les bornes">
          <p>
            La formule <M tex="y = (r-p)/t" /> est une <em>longueur</em> : elle n'a de sens
            qu'entre 0 et 1. Aux examens, le réflexe : calcule <M tex="(r-p)/t" />, puis regarde
            s'il tombe dans <M tex="(0,1)" />. En dessous de 0 → <M tex="y = 0" /> (prix
            au-dessus de <M tex="r" />, marché mort). Au-dessus de 1 → <M tex="y = 1" />{" "}
            (couverture totale : baisser encore le prix n'apporte plus aucun client, il n'y a
            plus personne à convaincre).
          </p>
        </Callout>

        <WidgetVilleLineaire />

        <Quiz
          scope="ei4"
          id="q3"
          question={
            <p>
              Dans la ville linéaire, <M tex="r = 6" />, <M tex="t = 4" /> et le vendeur affiche{" "}
              <M tex="p = 3" />. La demande vaut :
            </p>
          }
          options={[
            {
              text: (
                <>
                  <M tex="y = 0{,}75" />
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : <M tex="y = (r-p)/t = (6-3)/4 = 0{,}75" />. Les trois quarts des
                  consommateurs (ceux situés avant le kilomètre 0,75) achètent ; le dernier
                  quart habite trop loin.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="y = 0{,}5" />
                </>
              ),
              explain: (
                <>
                  Tu as peut-être calculé <M tex="p/r = 3/6" /> ? La bonne formule compare le{" "}
                  <em>surplus brut</em> <M tex="r - p = 3" /> au coût de transport par
                  kilomètre <M tex="t = 4" /> : <M tex="y = 3/4" />.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="y = 3" />
                </>
              ),
              explain: (
                <>
                  <M tex="r - p = 3" /> est le surplus de l'acheteur situé en <M tex="x = 0" />,
                  pas la demande. Il faut encore diviser par <M tex="t" /> pour trouver la
                  position frontière : <M tex="y = 3/4" />.
                </>
              ),
            },
          ]}
        />

        <H3>Le choix du prix par le monopole</H3>
        <p>
          Le vendeur produit à <strong>coût marginal constant</strong> égal à <M tex="c" />. Quel
          prix choisit-il ? La recette classique du monopole : écrire la demande inverse, la
          recette marginale, et égaliser recette marginale et coût marginal.
        </p>
        <p>
          <strong>Étape 1 — la demande inverse.</strong> Comme <M tex="y = \tfrac{1}{t}(r-p)" />,
          on inverse pour exprimer le prix en fonction de la quantité :
        </p>
        <MB tex="ty = r - p \iff p = r - ty" />
        <p>
          <strong>Étape 2 — recette totale et recette marginale.</strong> La recette totale vaut{" "}
          <M tex="py = (r - ty)\,y" />. En dérivant par rapport à <M tex="y" />, la recette
          marginale vaut :
        </p>
        <MB tex="Rm = r - 2ty" />
        <p>
          (la pente double : pour vendre une unité de plus, il faut baisser le prix sur{" "}
          <em>toutes</em> les unités).
        </p>
        <p>
          <strong>Étape 3 — la condition d'optimalité.</strong> Pour maximiser le profit, recette
          marginale = coût marginal :
        </p>
        <MB tex="r - 2ty = c \iff y = \frac{r - c}{2t}" />
        <p>Et le prix se lit sur la demande inverse :</p>
        <FormulaBox
          tex="p^{m} = r - ty = \frac{r + c}{2}"
          label="Prix de monopole (ville linéaire, sans effet de réseau)"
          caption={
            <>
              NB des slides : on obtient exactement le même résultat en cherchant directement le{" "}
              <M tex="p" /> qui maximise le profit <M tex="(p-c)\,y = (p-c)\tfrac{1}{t}(r-p)" />.
              Les formules valent pour le cas étudié dans les slides, celui d'un marché{" "}
              <em>partiellement couvert</em> (<M tex="0 < y < 1" />).
            </>
          }
        />

        <Callout variant="retiens" title="À retenir · La base sans réseau">
          <p>
            Monopole en ville linéaire : demande <M tex="y = (r-p)/t" />, prix optimal{" "}
            <M tex="p^m = \tfrac{1}{2}(r+c)" /> — pile à <strong>mi-chemin</strong> entre ce que
            vaut le bien pour les clients (<M tex="r" />) et ce qu'il coûte à produire (
            <M tex="c" />). Grave cette base dans ta mémoire : au § 2.2, on ajoutera l'effet de
            réseau et on mesurera <em>tout</em> par rapport à elle.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 2.2 · EFFETS DE RÉSEAU DIRECTS EN MONOPOLE                 */}
      {/* ============================================================ */}
      <Section
        id="effets-directs-mono"
        kicker="§ 2.2"
        title="Effets de réseau directs en monopole"
      >
        <Lead>
          On branche maintenant l'effet de réseau : ton utilité dépend du nombre d'acheteurs que
          tu <em>t'attends</em> à trouver sur le réseau. Ce petit mot — « attends » — va produire
          des phénomènes spectaculaires : des demandes croissantes, des équilibres multiples, et
          la fameuse masse critique.
        </Lead>

        <H3>La nouvelle utilité : le bonus de réseau v·yᴱ</H3>
        <p>
          Reprenons la ville linéaire du § 2.1, mais le bien vendu est désormais un{" "}
          <em>réseau</em> (une messagerie, un abonnement téléphonique…). L'utilité nette d'un
          acheteur localisé en <M tex="x \in [0,1]" /> vaut :
        </p>
        <MB tex="u = r - tx + v\,y^{E} - p \quad \text{si achat}, \qquad u = 0 \quad \text{sinon,}" />
        <p>avec deux nouveaux personnages :</p>

        <Callout variant="definition" title="Définitions · yᴱ et v">
          <ul>
            <li>
              <M tex="y^{E}" /> est le <strong>nombre attendu d'acheteurs</strong> sur le réseau
              (E pour <em>expected</em>) : combien de monde je <em>pense</em> qu'il y aura ;
            </li>
            <li>
              <M tex="v" /> est le <strong>supplément de bénéfice</strong> qu'un utilisateur
              retire quand il peut interagir avec <strong>un utilisateur supplémentaire</strong>{" "}
              sur ce réseau. <M tex="v" /> représente donc l'<strong>ampleur de l'externalité</strong>{" "}
              (l'ampleur de l'effet de réseau).
            </li>
          </ul>
        </Callout>

        <Callout variant="intuition" title="Pourquoi « attendu » et pas « réel » ?">
          <p>
            Quand tu choisis de t'abonner à un réseau, tu ne peux pas observer combien de
            personnes y seront <em>après</em> que tout le monde aura décidé — tout le monde
            décide en même temps que toi ! Tu te bases donc sur une <strong>anticipation</strong>{" "}
            <M tex="y^E" />. C'est exactement ce que tu fais quand tu choisis une appli « parce
            que tout le monde va y être ». Et comme on va le voir, ces anticipations ont un
            pouvoir redoutable : elles se réalisent d'elles-mêmes.
          </p>
        </Callout>

        <H3>La demande, à anticipation donnée</H3>
        <p>
          Même gymnastique qu'au § 2.1. Un consommateur achète si et seulement si{" "}
          <M tex="r - tx + v y^E - p > 0" />, c'est-à-dire si :
        </p>
        <MB tex="x < \frac{1}{t}\left(r + v\,y^{E} - p\right)" />
        <p>
          Vu la distribution uniforme des acheteurs, la demande vaut (en n'oubliant pas les
          bornes !) :
        </p>
        <MB tex="y = \frac{1}{t}(r + v y^{E} - p) \ \text{ si } y \in (0,1), \qquad y = 0 \ \text{ si } \tfrac{1}{t}(r + v y^{E} - p) < 0, \qquad y = 1 \ \text{ si } \tfrac{1}{t}(r + v y^{E} - p) > 1." />
        <p>
          Note le changement par rapport au § 2.1 : la demande dépend maintenant de{" "}
          <strong>ce que les gens croient</strong> (<M tex="y^E" />
          ). Mais alors, que croire ? Peut-on croire n'importe quoi ?
        </p>

        <H3>Anticipations rationnelles : la croyance doit se réaliser</H3>

        <Callout variant="definition" title="Définition · Anticipations rationnelles">
          <p>
            On impose que l'anticipation corresponde à la réalisation :{" "}
            <M tex="y = y^{E}" />. Pourquoi ? Si <M tex="y > y^E" />, on a{" "}
            <strong>sous-évalué</strong> la taille du réseau : on aurait dû hausser les
            anticipations. Inversement, si <M tex="y < y^E" />, on a{" "}
            <strong>sur-évalué</strong> : on aurait dû les réduire. Seules les anticipations qui
            se confirment d'elles-mêmes peuvent durer — ce sont les{" "}
            <strong>équilibres</strong> du modèle.
          </p>
        </Callout>

        <p>
          Cherchons donc tous les couples « prix ↔ demande » compatibles avec{" "}
          <M tex="y = y^E" />. Il y a trois candidats, traités un par un dans les slides :
        </p>
        <p>
          <strong>Candidat 1 : personne n'achète</strong> (<M tex="y = y^E = 0" />
          ). Si j'anticipe un réseau vide, le bonus de réseau disparaît (
          <M tex="v \times 0 = 0" />
          ). Pour que réellement personne n'achète, il faut que même l'acheteur le mieux placé
          renonce :
        </p>
        <MB tex="\frac{1}{t}(r + v \cdot 0 - p) < 0 \iff p > r" />
        <p>
          <strong>Candidat 2 : tout le monde achète</strong> (<M tex="y = y^E = 1" />
          ). Si j'anticipe le réseau plein, le bonus vaut <M tex="v" /> tout entier. Pour que
          réellement tout le monde achète, il faut que même l'acheteur du bout de la route suive :
        </p>
        <MB tex="\frac{1}{t}(r + v \cdot 1 - p) > 1 \iff r + v - p > t \iff p < r + v - t" />
        <p>
          <strong>Candidat 3 : une partie achète</strong> (<M tex="y = y^E \in (0,1)" />
          ). On remplace <M tex="y^E" /> par <M tex="y" /> dans la formule de demande et on
          résout :
        </p>
        <MB tex="y = \frac{1}{t}(r + v y - p) \iff ty - vy = r - p \iff y^{*} = \frac{r - p}{t - v}" />
        <FormulaBox
          tex="y = 0 \text{ ssi } p > r \qquad\quad y = 1 \text{ ssi } p < r + v - t \qquad\quad y^{*} = \frac{r-p}{t-v} \in (0,1)"
          label="Les trois équilibres en anticipations rationnelles"
          caption={
            <>
              Tout se joue sur le <strong>signe du dénominateur</strong> <M tex="t - v" /> de
              l'équilibre intérieur. Deux cas à creuser : <M tex="v < t" /> (faible externalité,
              cas A) et <M tex="v > t" /> (forte externalité, cas B).
            </>
          }
        />

        <H3>Cas A (v {"<"} t) contre cas B (v {">"} t) : la demande qui monte</H3>
        <p>
          Représentons la demande dans le plan habituel (prix en ordonnée, quantité en
          abscisse). Les points extrêmes de la branche intérieure sont faciles à trouver : quand{" "}
          <M tex="y^* = 0" />, le prix vaut <M tex="r" /> ; quand <M tex="y^* = 1" />, le prix
          vaut <M tex="r + v - t" />.
        </p>
        <ul>
          <li>
            <strong>Cas A, faible externalité (<M tex="v < t" />)</strong> : alors{" "}
            <M tex="r + v - t < r" /> — le point <M tex="y=1" /> est <em>plus bas</em> que le
            point <M tex="y=0" />. La branche intérieure descend : c'est une{" "}
            <strong>demande décroissante</strong>, comme d'habitude. Un seul équilibre par prix.
          </li>
          <li>
            <strong>Cas B, forte externalité (<M tex="v > t" />)</strong> : alors{" "}
            <M tex="r + v - t > r" /> — le point <M tex="y=1" /> est <em>plus haut</em> !
            La branche intérieure <strong>monte</strong> : une demande{" "}
            <strong>croissante</strong>. Et pour tout prix compris entre <M tex="r" /> et{" "}
            <M tex="r + v - t" />, il y a <strong>trois équilibres possibles</strong> à la fois :{" "}
            <M tex="y = 0" />, <M tex="y^* \in (0,1)" /> et <M tex="y = 1" />.
          </li>
        </ul>

        <Callout variant="attention" title="Une demande croissante ?!">
          <p>
            Non, les consommateurs ne se sont pas mis à aimer payer cher. Chaque point de la
            branche est un <strong>équilibre d'anticipations différent</strong> : un point plus
            haut correspond à un réseau anticipé plus gros, donc plus précieux (
            <M tex="+\,v y^E" />
            ), donc compatible avec un prix plus élevé. La courbe croissante raconte : « plus on
            s'attend à être nombreux, plus cher on est prêt à payer ». C'est l'effet de réseau à
            l'état pur, pas une violation de la loi de la demande.
          </p>
        </Callout>

        <WidgetDemandeReseau />

        <Quiz
          scope="ei4"
          id="q4"
          question={
            <p>
              Forte externalité (<M tex="v > t" />
              ), et le prix est compris entre <M tex="r" /> et <M tex="r + v - t" />. Combien
              d'équilibres en anticipations rationnelles coexistent ?
            </p>
          }
          options={[
            {
              text: <>Trois : y = 0, l'équilibre intérieur y*, et y = 1</>,
              correct: true,
              explain: (
                <>
                  Exact : <M tex="p > r" /> valide l'équilibre « personne n'achète »,{" "}
                  <M tex="p < r+v-t" /> valide « tout le monde achète », et le prix coupe aussi
                  la branche intérieure croissante en <M tex="y^* = (r-p)/(t-v)" />. Trois
                  équilibres pour un même prix !
                </>
              ),
            },
            {
              text: <>Un seul, comme dans tout marché qui se respecte</>,
              explain: (
                <>
                  C'est vrai dans le cas A (<M tex="v < t" />
                  ), mais plus ici : avec une forte externalité, les anticipations
                  auto-réalisatrices créent une vraie multiplicité. « Personne n'y va » et « tout
                  le monde y va » sont <em>tous les deux</em> cohérents.
                </>
              ),
            },
            {
              text: <>Deux : y = 0 et y = 1</>,
              explain: (
                <>
                  Presque : tu as oublié l'équilibre intérieur <M tex="y^*" />, qui existe bien
                  mathématiquement… mais qui, on va le voir, est instable — c'est la masse
                  critique. Il compte quand même comme un équilibre !
                </>
              ),
            },
          ]}
        />

        <H3>La stabilité : que se passe-t-il si on secoue les anticipations ?</H3>
        <p>
          Trois équilibres, c'est embarrassant : lequel va-t-on observer ? Les slides répondent
          avec la notion de <strong>stabilité</strong> : on perturbe un tout petit peu les
          anticipations et on regarde si des mécanismes nous ramènent à l'équilibre… ou nous en
          éloignent.
        </p>
        <p>
          <strong>L'équilibre <M tex="y = 0" /> (avec <M tex="p > r" />) est stable.</strong> Si{" "}
          <M tex="y^E" /> devient très légèrement positif, la quantité{" "}
          <M tex="\tfrac{1}{t}(r + v y^E - p)" /> reste négative (sauf au cas limite{" "}
          <M tex="p = r" />) : la demande reste à zéro. Le petit changement d'anticipation ne
          modifie pas l'équilibre — croire qu'« un tout petit peu de monde viendra » ne suffit
          pas à rendre le réseau attractif.
        </p>
        <p>
          <strong>
            L'équilibre <M tex="y = 1" /> (avec <M tex="p < r + v - t" />) est stable.
          </strong>{" "}
          Si <M tex="y^E" /> devient très légèrement inférieur à 1, la quantité{" "}
          <M tex="\tfrac{1}{t}(r + v y^E - p)" /> reste supérieure à 1 : tout le monde continue
          d'acheter, on reste en <M tex="y = 1" />.
        </p>
        <p>
          <strong>L'équilibre intérieur <M tex="y^*" /> : tout dépend de v/t.</strong> Réécrivons
          la demande en séparant l'effet de l'anticipation :
        </p>
        <MB tex="y = \frac{1}{t}(r + v\,y^{E} - p) = \underbrace{\frac{1}{t}(r-p)}_{\text{constante}} + \underbrace{\frac{v}{t}}_{\text{facteur clé}}\,y^{E}" />
        <p>
          Suppose qu'on sur-estime légèrement : <M tex="y^E" /> un poil au-dessus de{" "}
          <M tex="y^*" />.
        </p>
        <ul>
          <li>
            <strong>Cas A (<M tex="v < t" />, donc <M tex="v/t < 1" />)</strong> : la demande
            réalisée <M tex="y" /> augmente <em>moins</em> que l'anticipation (chaque unité
            d'erreur ne se transmet qu'à hauteur de <M tex="v/t" />
            ). La sur-estimation est démentie → on révise <M tex="y^E" /> à la baisse → la
            demande baisse un peu → on révise encore… jusqu'à retomber exactement sur{" "}
            <M tex="y = y^E = y^*" />. Les révisions <strong>s'amortissent</strong> :
            l'équilibre intérieur est <strong>stable</strong>. (Raisonnement identique pour une
            sous-estimation : on remonte vers <M tex="y^*" />.)
          </li>
          <li>
            <strong>Cas B (<M tex="v > t" />, donc <M tex="v/t > 1" />)</strong> : la demande
            réalisée augmente <em>plus</em> que l'anticipation ! La sur-estimation est…
            confirmée et amplifiée → on révise <M tex="y^E" /> à la hausse → la demande augmente
            encore plus → et ainsi de suite jusqu'à <M tex="y = y^E = 1" />. Les révisions{" "}
            <strong>s'amplifient</strong> : l'équilibre intérieur est{" "}
            <strong>instable</strong>. (Et si on sous-estime, on dégringole symétriquement vers{" "}
            <M tex="y = y^E = 0" />.)
          </li>
        </ul>

        <WidgetAnticipations />

        <Callout variant="retiens" title="À retenir · Le bilan de stabilité">
          <p>
            <M tex="y = 0" /> (si <M tex="p > r" />) : <strong>stable</strong>.{" "}
            <M tex="y = 1" /> (si <M tex="p < r+v-t" />) : <strong>stable</strong>. Équilibre
            intérieur <M tex="y^*" /> : <strong>stable si <M tex="v < t" /></strong>,{" "}
            <strong>instable si <M tex="v > t" /></strong>. Le critère tient en une fraction :
            le facteur de transmission des anticipations <M tex="v/t" />, amortisseur en dessous
            de 1, amplificateur au-dessus.
          </p>
        </Callout>

        <H3>Cas B, la lecture économique : anticipations auto-réalisatrices et masse critique</H3>
        <p>Avec une forte externalité, le marché devient une machine à prophéties :</p>
        <ul>
          <li>
            Soit on anticipe que <strong>personne ne rejoint</strong> le réseau : le réseau ne
            présente alors aucun intérêt… et personne ne veut effectivement le rejoindre.
          </li>
          <li>
            Soit on anticipe que <strong>tout le monde rejoint</strong> le réseau : le réseau
            présente beaucoup d'intérêt… et tout le monde veut effectivement le rejoindre.
          </li>
        </ul>
        <p>
          Les deux prophéties se réalisent d'elles-mêmes — et c'est évidemment la seconde qui est
          souhaitable. Comment y arriver ? C'est là qu'entre en scène le concept le plus célèbre
          du chapitre.
        </p>

        <Callout variant="definition" title="Définition · La masse critique">
          <p>
            Pour inciter tout le monde à rejoindre le réseau, il faut convaincre qu'une{" "}
            <strong>masse critique</strong> <M tex="y^{C}" /> va effectivement le rejoindre
            (convaincre que <M tex="y^E > y^C" />). Une fois cette masse critique dépassée, la
            boule de neige des anticipations fait le reste : tout le monde voudra rejoindre le
            réseau. Si le monopole n'arrive pas à convaincre que le réseau atteindra la masse
            critique (<M tex="y^E < y^C" />), le réseau finit par <strong>disparaître</strong>.
            C'est la difficulté des réseaux. (Graphiquement, <M tex="y^C" /> est exactement
            l'équilibre intérieur instable <M tex="y^*" /> : la ligne de crête entre
            l'effondrement et le décollage.)
          </p>
        </Callout>

        <Callout variant="exemple" title="La stratégie du prix de lancement">
          <p>
            Atteindre la masse critique peut se faire <strong>progressivement</strong> : proposer
            d'abord un <strong>prix faible</strong> (inférieur à <M tex="r" />, pour que rejoindre
            soit intéressant même si on anticipe un réseau encore petit), potentiellement avec des{" "}
            <strong>ventes à perte</strong>. Les pertes seront compensées plus tard par une{" "}
            <strong>hausse de prix</strong>, une fois la masse critique atteinte — car alors le
            réseau est devenu précieux et les clients captifs de leurs propres anticipations.
            Pense aux offres de lancement quasi gratuites des plateformes : ce n'est pas de la
            générosité, c'est de la dynamique d'équilibres.
          </p>
        </Callout>

        <Quiz
          scope="ei4"
          id="q5"
          question={<p>La masse critique <M tex="y^C" /> d'un réseau, c'est précisément :</p>}
          options={[
            {
              text: (
                <>
                  le niveau d'anticipations au-delà duquel les révisions successives entraînent
                  tout le monde vers le réseau (y → 1)
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : c'est l'équilibre intérieur instable. En dessous, chaque révision
                  d'anticipation fait fondre le réseau vers 0 ; au-dessus, chaque révision le
                  gonfle vers 1. Tout l'enjeu commercial est de faire croire que{" "}
                  <M tex="y^E > y^C" />.
                </>
              ),
            },
            {
              text: <>le nombre d'utilisateurs qui rend le profit du monopole positif</>,
              explain: (
                <>
                  Non — la masse critique est un concept de <em>demande et d'anticipations</em>,
                  pas de rentabilité. Un réseau peut dépasser sa masse critique en vendant à
                  perte (c'est même la stratégie recommandée !).
                </>
              ),
            },
            {
              text: <>le niveau de v au-dessus duquel la demande devient croissante</>,
              explain: (
                <>
                  Tu confonds avec le seuil <M tex="v = t" /> qui sépare le cas A du cas B. La
                  masse critique est un niveau de <em>demande anticipée</em> <M tex="y^C" /> (un
                  nombre entre 0 et 1), pas un niveau d'externalité.
                </>
              ),
            },
          ]}
        />

        <H3>Cas A, la lecture économique : trois commentaires des slides</H3>
        <p>
          <strong>1. Quand v augmente, la demande monte… et s'aplatit.</strong> Une hausse de
          l'externalité <M tex="v" /> (en restant sous <M tex="t" />) a deux effets sur la
          demande <M tex="y = (r-p)/(t-v)" /> : elle <strong>augmente</strong> (le réseau est
          plus désirable) et elle devient <strong>plus élastique</strong> — car une baisse de
          prix attire de nouveaux clients sur le réseau, ce qui rend ce dernier encore plus
          désirable, ce qui attire encore d'autres clients… Chaque euro de rabais est
          démultiplié.
        </p>
        <p>
          <strong>2. Le prix du monopole : un résultat surprenant.</strong> Refaisons le calcul
          du § 2.1 avec la nouvelle demande. Demande <M tex="y = \tfrac{r-p}{t-v}" />, donc
          demande inverse <M tex="p = r - (t-v)y" />. Recette totale{" "}
          <M tex="py = (r - (t-v)y)\,y" />, recette marginale <M tex="r - 2(t-v)y" />. Avec un
          coût marginal constant <M tex="c" /> :
        </p>
        <MB tex="r - 2(t-v)y = c \iff y = \frac{1}{2}\,\frac{r-c}{t-v}" />
        <MB tex="p = r - (t-v)\cdot\frac{1}{2}\,\frac{r-c}{t-v} = \frac{1}{2}(r+c)" />
        <FormulaBox
          tex="p^{m} = \frac{r+c}{2} \quad \text{(indépendant de } v\text{)}, \qquad y^{m} = \frac{1}{2}\,\frac{r-c}{t-v} \quad \text{(croissant en } v\text{)}"
          label="Monopole avec effet de réseau (cas v < t)"
          caption={
            <>
              Le prix est <strong>indépendant de v</strong> : la demande est plus élastique, ce
              qui pousse le prix à la baisse, mais elle est aussi plus élevée, ce qui pousse le
              prix à la hausse — les deux effets se compensent exactement. Les{" "}
              <strong>ventes</strong>, elles, augmentent avec <M tex="v" /> : l'effet de réseau
              enrichit le monopole par les quantités, pas par le prix.
            </>
          }
        />
        <p>
          <strong>3. L'externalité crée de l'inefficience.</strong> Regarde le premier
          consommateur qui n'achète pas (le <em>consommateur marginal</em>) : il estime que son
          bénéfice à joindre le réseau est juste légèrement inférieur au coût — c'est pour cela
          qu'il ne joint pas. Pourtant, s'il joignait le réseau, il augmenterait d'un montant{" "}
          <M tex="v" /> le bénéfice retiré par <em>chacun</em> des <M tex="y" /> utilisateurs du
          réseau. La société dans son ensemble aurait donc intérêt à ce qu'il rejoigne (il y perd
          à peine, tous les autres y gagnent).
        </p>

        <Callout variant="retiens" title="À retenir · Trop peu d'utilisateurs">
          <p>
            Typiquement, une externalité de réseau crée de l'<strong>inefficience</strong> :{" "}
            <strong>trop peu de personnes rejoignent le réseau</strong> par rapport à l'optimum
            social, car chacun ignore le bénéfice qu'il apporte aux autres. Une{" "}
            <strong>action publique</strong> aidant les personnes à joindre le réseau est donc
            parfois souhaitable — l'exemple des slides : les politiques d'accès à internet.
          </p>
        </Callout>

        <Quiz
          scope="ei4"
          id="q6"
          question={
            <p>
              Faible externalité (<M tex="v < t" />
              ). L'effet de réseau se renforce : <M tex="v" /> augmente (en restant sous{" "}
              <M tex="t" />
              ). Que fait le prix optimal du monopole ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Il ne bouge pas : <M tex="p^m = (r+c)/2" />, comme sans effet de réseau
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact — et c'est LE résultat piège du chapitre. La demande devient plus
                  élastique (pression à la baisse sur le prix) mais aussi plus élevée (pression à
                  la hausse) : les deux effets s'annulent exactement. Ce sont les{" "}
                  <strong>ventes</strong> <M tex="y = \tfrac{1}{2}\tfrac{r-c}{t-v}" /> qui
                  augmentent avec <M tex="v" />.
                </>
              ),
            },
            {
              text: <>Il augmente : le réseau est plus désirable, donc on peut facturer plus</>,
              explain: (
                <>
                  Tu ne vois que la moitié du tableau : la demande monte, certes, mais elle
                  devient aussi plus élastique (chaque baisse de prix s'auto-renforce via le
                  réseau). Le calcul montre que les deux forces se compensent :{" "}
                  <M tex="p^m = (r+c)/2" /> quel que soit <M tex="v" />.
                </>
              ),
            },
            {
              text: <>Il baisse : la demande plus élastique force le monopole à être plus doux</>,
              explain: (
                <>
                  L'autre moitié du tableau ! L'élasticité accrue pousse bien le prix vers le
                  bas, mais le niveau plus élevé de la demande le pousse vers le haut, dans des
                  proportions exactement égales. Bilan : prix inchangé, ventes en hausse.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3.1 · LA LIGNE DE HOTELLING (SANS RÉSEAU)                  */}
      {/* ============================================================ */}
      <Section
        id="hotelling"
        kicker="§ 3.1"
        title="Deux réseaux en concurrence : la ligne de Hotelling"
      >
        <Lead>
          Un seul réseau, c'était le monopole. Passons au vrai combat : deux vendeurs installés
          aux deux bouts de la même route, qui se disputent chaque client. Comme au § 2, on
          construit d'abord la base <em>sans</em> effet de réseau — le modèle de Hotelling — pour
          pouvoir mesurer ensuite ce que l'effet de réseau change.
        </Lead>

        <H3>Le décor : deux vendeurs aux extrémités</H3>
        <ul>
          <li>
            Deux vendeurs : le <strong>vendeur 1</strong> est situé au km 0, le{" "}
            <strong>vendeur 2</strong> au km 1 d'une ligne d'un kilomètre.
          </li>
          <li>Les acheteurs sont répartis uniformément entre les vendeurs.</li>
          <li>
            Chaque consommateur <strong>choisit un seul vendeur</strong> et lui achète{" "}
            <strong>une unité</strong> du bien (le marché est couvert : tout le monde achète
            quelque part).
          </li>
          <li>
            L'acheteur localisé en <M tex="x \in [0,1]" /> doit se déplacer de <M tex="x" /> km
            pour acheter au vendeur 1 — ce qui lui coûte <M tex="tx" /> — ou de{" "}
            <M tex="1 - x" /> km pour acheter au vendeur 2 — ce qui lui coûte{" "}
            <M tex="t(1-x)" />.
          </li>
        </ul>

        <Callout variant="intuition" title="La route n'est pas (que) une route">
          <p>
            Les slides insistent : <M tex="x" /> peut aussi être interprété comme{" "}
            <strong>l'écart de positionnement</strong> entre les <em>préférences</em> de l'agent
            localisé en <M tex="x" /> et le positionnement du <em>produit</em> proposé par le
            vendeur 1 (plutôt qu'une distance en km) ; <M tex="tx" /> représente alors
            l'inconvénient provoqué par cet écart. Idem pour <M tex="1-x" /> et{" "}
            <M tex="t(1-x)" /> vis-à-vis du vendeur 2. Deux messageries au design opposé, deux
            opérateurs aux forfaits différents : chaque consommateur a « sa » position dans
            l'espace des goûts, et <M tex="t" /> mesure combien il souffre de s'éloigner de son
            produit idéal. Hotelling est LE modèle de la <strong>différenciation</strong>.
          </p>
        </Callout>

        <H3>L'acheteur indifférent</H3>
        <p>
          L'utilité nette d'un acheteur localisé en <M tex="x \in [0,1]" /> vaut :
        </p>
        <MB tex="u = r - tx - p_1 \ \text{ (achat au vendeur 1)}, \qquad u = r - t(1-x) - p_2 \ \text{ (achat au vendeur 2)}" />
        <p>
          On suppose que <M tex="r" /> est suffisamment grand pour garantir que le consommateur
          veut acheter le bien plutôt que de ne pas l'acheter — la seule question est{" "}
          <em>chez qui</em>. L'agent localisé en <M tex="x" /> achète au vendeur 1 si et
          seulement si :
        </p>
        <MB tex="r - tx - p_1 > r - t(1-x) - p_2" />
        <p>
          Le bénéfice <M tex="r" /> est le même des deux côtés : il se simplifie. Développons le
          membre de droite :
        </p>
        <MB tex="-tx - p_1 > -t + tx - p_2" />
        <p>
          Regroupons les <M tex="x" /> à gauche et le reste à droite :{" "}
          <M tex="-2tx > -t + p_1 - p_2" />, puis divisons par <M tex="-2t" /> (négatif : on{" "}
          <em>retourne</em> l'inégalité) :
        </p>
        <FormulaBox
          tex="x < \frac{1}{2} - \frac{1}{2t}(p_1 - p_2) \equiv \hat{x}"
          label="L'acheteur indifférent de Hotelling"
          caption={
            <>
              Lecture : si les prix sont égaux, la frontière est au milieu (<M tex="\hat x = 1/2" />
              ). Chaque euro d'écart de prix déplace la frontière de <M tex="1/(2t)" /> : plus le
              transport <M tex="t" /> est cher, moins les clients sont sensibles aux écarts de
              prix — ils sont « captifs » de leur position.
            </>
          }
        />
        <p>
          La demande adressée au vendeur 1 vaut donc <M tex="y_1 = \hat{x}" /> (tous les clients
          à gauche de la frontière) et celle adressée au vendeur 2 vaut{" "}
          <M tex="y_2 = 1 - \hat{x} = \tfrac{1}{2} + \tfrac{1}{2t}(p_1 - p_2)" />.
        </p>

        <WidgetHotelling />

        <H3>L'équilibre en prix</H3>
        <p>
          On suppose un <strong>coût marginal nul</strong> pour chaque firme (hypothèse des
          slides). Chaque vendeur choisit le prix qui maximise son profit,{" "}
          <em>en prenant le prix de l'autre comme donné</em> — tu reconnais la logique de
          l'équilibre de Nash du cours de stratégie :{" "}
          <TheoryRef course="strategies" chapter="b1" section="s5" label="L'équilibre de Nash" />
        </p>
        <p>
          Le vendeur 1 cherche <M tex="p_1" /> qui maximise{" "}
          <M tex="p_1\left[\tfrac{1}{2} - \tfrac{1}{2t}(p_1 - p_2)\right]" />. On dérive par
          rapport à <M tex="p_1" /> et on annule (le prix apparaît deux fois : une fois comme
          marge, une fois dans la demande) :
        </p>
        <MB tex="\frac{1}{2} - \frac{p_1}{2t} + \frac{p_2}{2t} - \frac{p_1}{2t} = 0 \iff p_1 = \frac{t + p_2}{2}" />
        <p>
          Symétriquement, le vendeur 2 cherche <M tex="p_2" /> qui maximise{" "}
          <M tex="p_2\left[\tfrac{1}{2} + \tfrac{1}{2t}(p_1 - p_2)\right]" />, d'où{" "}
          <M tex="p_2 = \tfrac{t + p_1}{2}" />. Deux équations, deux inconnues ; en injectant
          l'une dans l'autre :
        </p>
        <FormulaBox
          tex="p_1 = p_2 = t, \qquad y_1 = y_2 = \frac{1}{2}, \qquad \pi_1 = \pi_2 = \frac{t}{2}"
          label="Équilibre de Hotelling (coût marginal nul, sans effet de réseau)"
          caption={
            <>
              Avec un coût marginal <M tex="c" /> au lieu de 0, le même calcul donne{" "}
              <M tex="p^* = c + t" /> : le prix, c'est « coût plus <M tex="t" /> ». La marge
              d'équilibre est exactement le coût de transport.
            </>
          }
        />

        <Callout variant="retiens" title="À retenir · t, c'est du pouvoir de marché">
          <p>
            Ceci est un exemple simplifié de <strong>duopole à la Bertrand avec différenciation
            de produits</strong> ; la différenciation se marque par le paramètre <M tex="t" />.
            Le « coût de transport » <M tex="t" /> <strong>donne du pouvoir</strong> à chaque
            firme, qui peut ainsi monter son prix au-dessus de son coût marginal (nul dans
            l'exemple). Si <M tex="t \to 0" /> (produits identiques, clients prêts à changer pour
            un centime), les prix s'effondrent vers le coût marginal : on retrouve le paradoxe de
            Bertrand. <TheoryRef chapter="ei2" section="differencies" label="Biens différenciés et concurrence en prix" />
          </p>
        </Callout>

        <Quiz
          scope="ei4"
          id="q7"
          question={
            <p>
              Sur la ligne de Hotelling (coût marginal nul), le coût de transport passe de{" "}
              <M tex="t = 2" /> à <M tex="t = 4" />. À l'équilibre, les prix :
            </p>
          }
          options={[
            {
              text: <>doublent : de 2 à 4</>,
              correct: true,
              explain: (
                <>
                  Exact : <M tex="p^* = t" />. Plus les clients souffrent de s'éloigner de leur
                  vendeur préféré (transport cher, ou préférences marquées), plus ils sont
                  captifs, et plus les firmes peuvent facturer sans craindre de les perdre. La
                  différenciation adoucit la concurrence.
                </>
              ),
            },
            {
              text: <>ne changent pas : les deux firmes se neutralisent</>,
              explain: (
                <>
                  Les firmes se neutralisent en <em>parts de marché</em> (toujours 1/2 chacune),
                  mais pas en prix : la sensibilité des clients aux écarts de prix est{" "}
                  <M tex="1/(2t)" />, donc quand <M tex="t" /> monte, la tentation de baisser son
                  prix rapporte moins, et l'équilibre s'établit plus haut : <M tex="p^* = t" />.
                </>
              ),
            },
            {
              text: <>baissent : le transport plus cher réduit la demande totale</>,
              explain: (
                <>
                  Piège : ici le marché est couvert (<M tex="r" /> grand), la demande totale est
                  fixée à 1. Le transport plus cher ne détruit pas la demande, il rend les
                  clients moins mobiles entre vendeurs — ce qui <em>renforce</em> le pouvoir de
                  marché de chacun.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3.2 · EFFETS DE RÉSEAU DIRECTS EN DUOPOLE                  */}
      {/* ============================================================ */}
      <Section
        id="effets-directs-duo"
        kicker="§ 3.2"
        title="Effets de réseau directs en duopole"
      >
        <Lead>
          Dernière brique, et résultat le plus élégant du chapitre : quand chaque réseau devient
          plus attirant en grossissant, la bataille pour chaque client s'envenime… et les prix{" "}
          <em>baissent</em>. On va le prouver ligne par ligne, exactement comme dans les slides.
        </Lead>

        <H3>Le modèle : Hotelling + effet de réseau</H3>
        <p>
          Que se passe-t-il si on introduit une externalité directe, un effet de réseau ?
          L'utilité augmente si le nombre d'acheteurs du même service —{" "}
          <em>auprès du même réseau</em> — augmente aussi. L'utilité nette d'un acheteur localisé
          au kilomètre <M tex="x \in [0,1]" /> vaut :
        </p>
        <MB tex="u = r - tx + v\,y_1 - p_1 \ \text{ (achat au réseau 1)}, \qquad u = r - t(1-x) + v\,y_2 - p_2 \ \text{ (achat au réseau 2)}" />
        <p>Deux hypothèses de travail, reprises des slides :</p>
        <ul>
          <li>
            <M tex="r" /> est suffisamment grand pour garantir que le consommateur achète le
            service (chez l'un ou chez l'autre) plutôt que de ne pas l'acheter ;
          </li>
          <li>
            l'externalité n'est <strong>pas trop forte</strong> : <M tex="v < t" />. (Tu sais
            maintenant pourquoi cette hypothèse est cruciale : au § 2.2, on a vu qu'avec{" "}
            <M tex="v > t" /> les anticipations s'emballent et tout bascule vers un extrême —
            ici, cela signifierait qu'un seul réseau rafle tout le marché.)
          </li>
        </ul>

        <Callout variant="attention" title="yᴱ a disparu ? Non : il s'appelle y₁ et y₂">
          <p>
            En monopole, on écrivait <M tex="v\,y^E" /> avec des anticipations qui devaient se
            réaliser. Ici, on écrit directement <M tex="v\,y_1" /> et <M tex="v\,y_2" /> : les
            tailles de réseau anticipées <em>sont</em> les demandes d'équilibre — même logique
            d'anticipations rationnelles, notation allégée. Conséquence importante : la demande
            de chaque réseau va dépendre… des demandes elles-mêmes. Il faudra résoudre un
            système.
          </p>
        </Callout>

        <H3>L'acheteur indifférent, version réseau</H3>
        <p>
          L'acheteur localisé en <M tex="x" /> achète au réseau 1 si et seulement si :
        </p>
        <MB tex="r - tx + v y_1 - p_1 > r - t(1-x) + v y_2 - p_2" />
        <p>
          Comme au § 3.1, <M tex="r" /> se simplifie et on développe le membre de droite :
        </p>
        <MB tex="-tx + v y_1 - p_1 > -t + tx + v y_2 - p_2" />
        <p>
          On isole <M tex="x" /> (mêmes manipulations qu'avant, en gardant précieusement les
          termes en <M tex="v" />) :
        </p>
        <MB tex="x < \frac{1}{2} - \frac{1}{2t}(p_1 - p_2) + \frac{v}{2t}(y_1 - y_2) \equiv \bar{x}" />
        <p>
          C'est l'acheteur indifférent de Hotelling, <em>plus</em> un terme nouveau :{" "}
          <M tex="\tfrac{v}{2t}(y_1 - y_2)" />. Si le réseau 1 est plus gros que le réseau 2, la
          frontière se déplace en sa faveur — être gros attire. Les demandes valent donc :
        </p>
        <MB tex="y_1 = \bar{x} = \frac{1}{2} - \frac{1}{2t}(p_1 - p_2) + \frac{v}{2t}(y_1 - y_2), \qquad y_2 = 1 - \bar{x} = \frac{1}{2} + \frac{1}{2t}(p_1 - p_2) - \frac{v}{2t}(y_1 - y_2)" />

        <H3>La preuve des slides : résoudre le système</H3>
        <p>
          Ces demandes sont <em>implicites</em> (<M tex="y_1" /> apparaît des deux côtés). On
          cherche à exprimer <M tex="y_1" /> et <M tex="y_2" /> en fonction des seuls prix.
          L'astuce de la preuve : soustraire les deux équations. En faisant{" "}
          <M tex="y_1 - y_2" /> :
        </p>
        <MB tex="y_1 - y_2 = -\frac{1}{t}(p_1 - p_2) + \frac{v}{t}(y_1 - y_2)" />
        <p>
          On regroupe les <M tex="(y_1 - y_2)" /> à gauche :
        </p>
        <MB tex="(y_1 - y_2)\left(1 - \frac{v}{t}\right) = -\frac{1}{t}(p_1 - p_2) \iff (y_1 - y_2)(t - v) = -(p_1 - p_2)" />
        <MB tex="\iff y_1 - y_2 = -\frac{p_1 - p_2}{t - v}" />
        <p>
          Voilà l'écart de tailles en fonction de l'écart de prix. On le réinjecte dans
          l'équation de <M tex="y_1" /> :
        </p>
        <MB tex="y_1 = \frac{1}{2} - \frac{1}{2t}(p_1 - p_2) + \frac{v}{2t}\left(-\frac{p_1 - p_2}{t-v}\right) = \frac{1}{2} - \frac{1}{2t}(p_1 - p_2)\left(1 + \frac{v}{t-v}\right)" />
        <p>
          Or <M tex="1 + \tfrac{v}{t-v} = \tfrac{t-v+v}{t-v} = \tfrac{t}{t-v}" />, et le{" "}
          <M tex="t" /> se simplifie avec le <M tex="\tfrac{1}{2t}" /> :
        </p>
        <FormulaBox
          tex="y_1 = \frac{1}{2} - \frac{1}{2}\,\frac{p_1 - p_2}{t - v}, \qquad y_2 = \frac{1}{2} + \frac{1}{2}\,\frac{p_1 - p_2}{t - v}"
          label="Demandes du duopole avec effet de réseau (v < t)"
          caption={
            <>
              (Le calcul de <M tex="y_2" /> est identique, signes inversés — « cqfd » disent les
              slides.) Compare avec Hotelling pur : le <M tex="t" /> du dénominateur est devenu{" "}
              <M tex="t - v" />. Les demandes sont <strong>d'autant plus sensibles aux prix que
              l'externalité <M tex="v" /> est forte</strong>.
            </>
          }
        />

        <Callout variant="intuition" title="L'effet boule de neige derrière le t − v">
          <p>
            Pourquoi cette sensibilité accrue ? Quand le réseau 1 baisse son prix d'un euro, il
            gagne des clients <em>directement</em> (effet Hotelling classique, <M tex="1/(2t)" />
            )… mais ces nouveaux clients rendent le réseau 1 plus attractif et le réseau 2 moins
            attractif, ce qui attire une deuxième vague de clients, qui renforce encore
            l'attrait, etc. La somme de toutes les vagues donne <M tex="1/(2(t-v))" /> : la
            différenciation <M tex="t" /> est <em>rognée</em> de <M tex="v" />. Tout se passe
            comme si l'effet de réseau réduisait la différenciation effective entre les deux
            vendeurs.
          </p>
        </Callout>

        <H3>L'équilibre en prix : la concurrence intensifiée</H3>
        <p>
          Chaque réseau choisit son prix pour maximiser son profit (coût marginal nul), en
          considérant le prix de l'autre comme donné — équilibre de Nash, encore :{" "}
          <TheoryRef course="strategies" chapter="b1" section="s5" label="Réponses optimales croisées" />
        </p>
        <p>
          Le réseau 1 (resp. 2) cherche <M tex="p_1" /> (resp. <M tex="p_2" />) qui maximise :
        </p>
        <MB tex="p_1 y_1 = p_1\left(\frac{1}{2} - \frac{1}{2}\,\frac{p_1 - p_2}{t-v}\right), \qquad p_2 y_2 = p_2\left(\frac{1}{2} + \frac{1}{2}\,\frac{p_1 - p_2}{t-v}\right)" />
        <p>Les conditions de premier ordre donnent :</p>
        <MB tex="\frac{1}{2} - \frac{1}{2}\,\frac{2p_1 - p_2}{t-v} = 0, \qquad \frac{1}{2} + \frac{1}{2}\,\frac{p_1 - 2p_2}{t-v} = 0" />
        <p>
          La solution de ce système de deux équations à deux inconnues (par symétrie,{" "}
          <M tex="p_1 = p_2" />, donc <M tex="2p_1 - p_2 = p_1 = t - v" />) est :
        </p>
        <FormulaBox
          tex="p_1 = p_2 = t - v, \qquad y_1 = y_2 = \frac{1}{2}, \qquad \pi_1 = \pi_2 = \frac{t-v}{2}"
          label="Équilibre du duopole avec effet de réseau direct (c = 0, v < t)"
          caption={
            <>
              Avec un coût marginal <M tex="c" />, même calcul : <M tex="p^* = c + t - v" />. La
              marge n'est plus <M tex="t" /> mais <M tex="t - v" /> : l'effet de réseau ampute la
              marge d'exactement <M tex="v" />.
            </>
          }
        />

        <Callout variant="retiens" title="À retenir · L'externalité pousse les prix à la baisse">
          <p>
            L'externalité <M tex="v" /> <strong>pousse les prix à la baisse</strong> (contraste
            avec l'absence d'externalité quand <M tex="v = 0" /> : on retrouve{" "}
            <M tex="p^* = t" />). En effet, chaque réseau veut attirer d'autant plus de clients
            que l'externalité de chaque client sur les autres est forte : un client gagné en
            vaut plusieurs, puisqu'il rend le réseau plus attractif. Cela incite les réseaux à
            être <strong>agressifs en prix</strong>. Au final, ils attirent chacun… la moitié
            des clients — mêmes parts de marché qu'avant, mais des marges rabotées. La
            concurrence entre réseaux est <strong>intensifiée</strong> par les effets de réseau.
          </p>
        </Callout>

        <WidgetDuopoleReseau />

        <Quiz
          scope="ei4"
          id="q8"
          question={
            <p>
              Duopole de Hotelling avec effet de réseau direct (<M tex="v < t" />, coût marginal
              nul). Le prix d'équilibre vaut :
            </p>
          }
          options={[
            {
              text: (
                <>
                  <M tex="p^* = t - v" />
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : la différenciation effective n'est plus <M tex="t" /> mais{" "}
                  <M tex="t - v" />, et le prix d'équilibre avec elle. Chaque euro d'externalité
                  devient un euro de rabais concurrentiel.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="p^* = t + v" /> : le réseau ajoute de la valeur, donc on facture plus
                </>
              ),
              explain: (
                <>
                  Intuition séduisante mais fausse en duopole : la valeur ajoutée par le réseau
                  est <em>disputée</em> entre les deux firmes. Comme chaque client gagné
                  renforce l'attractivité du réseau, les firmes surenchérissent en baisses de
                  prix — le résultat est <M tex="t - v" />, pas <M tex="t + v" />.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="p^* = t" /> : comme en monopole, l'effet de réseau ne change pas le prix
                </>
              ),
              explain: (
                <>
                  Le « prix inchangé » vaut pour le <strong>monopole</strong> (
                  <M tex="p^m = (r+c)/2" /> indépendant de <M tex="v" />
                  ). En duopole, la concurrence transforme l'externalité en baisse de prix :{" "}
                  <M tex="p^* = t - v" />. C'est justement le contraste à retenir entre § 2.2 et
                  § 3.2 !
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="ei4"
          id="q9"
          question={
            <p>
              Pourquoi l'effet de réseau rend-il les deux duopoleurs plus agressifs en prix, alors
              qu'à l'équilibre chacun garde la moitié du marché ?
            </p>
          }
          options={[
            {
              text: (
                <>
                  Parce que chaque client gagné rend le réseau plus attractif pour tous les
                  autres : un rabais rapporte plus de clients qu'avant (demande en{" "}
                  <M tex="1/(2(t-v))" />)
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : c'est l'effet boule de neige. La tentation de baisser son prix est plus
                  forte pour les deux firmes à la fois — et comme elles y cèdent toutes les deux,
                  les parts de marché ne bougent pas mais les prix finissent plus bas. Un
                  équilibre de Nash typique : individuellement rationnel, collectivement
                  ruineux pour les firmes.
                </>
              ),
            },
            {
              text: <>Parce que l'effet de réseau réduit leurs coûts de production</>,
              explain: (
                <>
                  Non : les coûts sont inchangés (nuls dans le modèle). Tout passe par la{" "}
                  <em>demande</em>, devenue plus sensible aux écarts de prix à cause de
                  l'externalité.
                </>
              ),
            },
            {
              text: <>Parce que la demande totale du marché augmente avec v</>,
              explain: (
                <>
                  Ici la demande totale est fixe (marché couvert, taille 1). Ce qui change avec{" "}
                  <M tex="v" />, c'est l'intensité de la lutte pour <em>répartir</em> cette
                  demande — pas sa taille.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* SYNTHÈSE                                                     */}
      {/* ============================================================ */}
      <Section id="synthese" kicker="§ 4" title="À maîtriser absolument">
        <Lead>
          Tout le chapitre tient dans un tableau, trois concepts et deux exercices types. Vérifie
          que tu sais tout refaire les yeux fermés — puis coche la checklist.
        </Lead>

        <H3>Le tableau récapitulatif : quatre modèles, quatre prix</H3>
        <Tbl minW={720}>
          <thead>
            <tr>
              <th className={TH}>Structure de marché</th>
              <th className={TH}>Demande(s)</th>
              <th className={TH}>Prix d'équilibre</th>
              <th className={TH}>Ce qui change avec le réseau</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>
                <strong>Monopole</strong>, sans réseau (§ 2.1)
              </td>
              <td className={TD}>
                <M tex="y = \dfrac{r-p}{t}" />
              </td>
              <td className={TD}>
                <M tex="p^m = \dfrac{r+c}{2}" />
              </td>
              <td className={TD}>— (base de référence)</td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>Monopole</strong>, réseau, <M tex="v < t" /> (§ 2.2)
              </td>
              <td className={TD}>
                <M tex="y = \dfrac{r-p}{t-v}" />
              </td>
              <td className={TD}>
                <M tex="p^m = \dfrac{r+c}{2}" /> <em>(inchangé !)</em>
              </td>
              <td className={TD}>
                Prix indépendant de <M tex="v" /> ; les <strong>ventes</strong> augmentent avec{" "}
                <M tex="v" /> ; toujours trop peu d'utilisateurs (externalité)
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>Monopole</strong>, réseau, <M tex="v > t" /> (§ 2.2)
              </td>
              <td className={TD}>
                branche intérieure <strong>croissante</strong>
              </td>
              <td className={TD}>pas de formule unique</td>
              <td className={TD}>
                <strong>3 équilibres</strong> si <M tex="r < p < r+v-t" /> (0 et 1 stables,{" "}
                <M tex="y^*" /> instable = <strong>masse critique</strong>) ; stratégie de prix de
                lancement bas
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>Duopole Hotelling</strong>, sans réseau (§ 3.1, <M tex="c=0" />)
              </td>
              <td className={TD}>
                <M tex="y_1 = \hat x = \dfrac{1}{2} - \dfrac{p_1-p_2}{2t}" />
              </td>
              <td className={TD}>
                <M tex="p^* = t" /> <span className="text-muted-foreground">(avec coût : <M tex="c+t" />)</span>
              </td>
              <td className={TD}>
                — (base de référence) ; profits <M tex="t/2" />
              </td>
            </tr>
            <tr>
              <td className={TD}>
                <strong>Duopole</strong>, réseau, <M tex="v < t" /> (§ 3.2, <M tex="c=0" />)
              </td>
              <td className={TD}>
                <M tex="y_1 = \dfrac{1}{2} - \dfrac{1}{2}\,\dfrac{p_1-p_2}{t-v}" />
              </td>
              <td className={TD}>
                <M tex="p^* = t - v" />{" "}
                <span className="text-muted-foreground">(avec coût : <M tex="c+t-v" />)</span>
              </td>
              <td className={TD}>
                <strong>Concurrence intensifiée</strong> : les prix et les profits (
                <M tex="(t-v)/2" />) baissent de <M tex="v" /> ; parts de marché inchangées (1/2)
              </td>
            </tr>
          </tbody>
        </Tbl>

        <Callout variant="examen" title="Le contraste vedette des examens">
          <p>
            Même effet de réseau, deux conclusions opposées : en <strong>monopole</strong> (cas{" "}
            <M tex="v<t" />
            ), le prix ne bouge pas et les ventes montent ; en <strong>duopole</strong>, le prix
            baisse de <M tex="v" /> et les parts de marché ne bougent pas. Si tu ne devais
            retenir qu'une ligne de ce chapitre, c'est celle-là.
          </p>
        </Callout>

        <H3>Les trois concepts à savoir expliquer sans formule</H3>
        <ol className="my-4 grid list-none gap-2 pl-0">
          {[
            [
              "Externalité de réseau",
              "quand j'adhère, j'augmente l'utilité de tous les autres membres — bénéfice dont je ne tiens pas compte. Résultat : trop peu d'utilisateurs par rapport à l'optimum social, d'où un rôle possible pour l'action publique (accès internet).",
            ],
            [
              "Anticipations auto-réalisatrices",
              "la demande dépend de la taille anticipée du réseau, et l'anticipation doit se réaliser (y = yᴱ). « Personne n'y croit » et « tout le monde y croit » peuvent être tous deux des équilibres — croire, c'est créer.",
            ],
            [
              "Masse critique",
              "avec une forte externalité (v > t), l'équilibre intérieur instable yᶜ sépare l'effondrement du décollage. Toute la stratégie de lancement d'un réseau (prix bas, ventes à perte, communication massive) vise à convaincre que yᴱ dépassera yᶜ.",
            ],
          ].map(([term, def], i) => (
            <li key={i} className="rounded-xl border bg-muted/40 px-3.5 py-2.5 text-[14.5px]">
              <strong className="text-primary">{term}</strong> — {def}
            </li>
          ))}
        </ol>

        <Quiz
          scope="ei4"
          id="q10"
          multi
          question={<p>Dernière vérification — coche toutes les affirmations vraies :</p>}
          options={[
            {
              text: (
                <>
                  En monopole avec <M tex="v < t" />, le prix optimal est indépendant de
                  l'ampleur de l'externalité <M tex="v" />
                </>
              ),
              correct: true,
              explain: (
                <>
                  Vrai : demande plus élastique (prix ↓) mais plus élevée (prix ↑), les deux
                  effets se compensent : <M tex="p^m = (r+c)/2" />. Les ventes, elles, montent.
                </>
              ),
            },
            {
              text: <>En duopole, l'effet de réseau direct augmente les profits des firmes</>,
              explain: (
                <>
                  Faux : les profits passent de <M tex="t/2" /> à <M tex="(t-v)/2" />. L'effet de
                  réseau intensifie la concurrence et détruit de la marge — bonne nouvelle pour
                  les consommateurs, pas pour les firmes.
                </>
              ),
            },
            {
              text: (
                <>
                  Une externalité de réseau conduit typiquement à trop peu d'utilisateurs par
                  rapport à l'optimum social
                </>
              ),
              correct: true,
              explain: (
                <>
                  Vrai : le consommateur marginal ignore le bénéfice <M tex="v" /> qu'il
                  apporterait à chacun des <M tex="y" /> membres. La société y gagnerait à ce
                  qu'il rejoigne — d'où l'inefficience et l'argument pour une action publique.
                </>
              ),
            },
            {
              text: (
                <>
                  Avec <M tex="v > t" />, la branche intérieure de la courbe de demande du réseau
                  est croissante
                </>
              ),
              correct: true,
              explain: (
                <>
                  Vrai : chaque point correspond à un équilibre d'anticipations différent — un
                  réseau anticipé plus gros vaut plus cher. Cette branche croissante est
                  instable : c'est la ligne de crête de la masse critique.
                </>
              ),
            },
          ]}
          explanation={
            <>
              Trois vraies sur quatre : le prix de monopole insensible à <M tex="v" />,
              l'inefficience de l'externalité, et la demande croissante du cas{" "}
              <M tex="v > t" />. La fausse : en duopole, l'effet de réseau <em>réduit</em> les
              profits (<M tex="p^* = t - v" />).
            </>
          }
        />

        <H3>Deux exercices types, pas à pas</H3>

        <ExerciseBlock
          scope="ei4"
          id="ex1"
          number={1}
          title="Le monopole face à l'effet de réseau (calcul complet)"
          difficulty={2}
          refs={[
            { chapter: "ei4", section: "modele-monopole", label: "La ville linéaire" },
            { chapter: "ei4", section: "effets-directs-mono", label: "Effets directs en monopole" },
          ]}
          statement={
            <p>
              Un réseau en monopole opère dans la ville linéaire : <M tex="r = 6" />,{" "}
              <M tex="t = 5" />, externalité <M tex="v = 2" />, coût marginal <M tex="c = 2" />.
              Les anticipations sont rationnelles (<M tex="y = y^E" />
              ).
              <br />
              a) Détermine la demande <M tex="y(p)" /> (équilibre intérieur). b) Calcule le prix
              et la quantité optimaux du monopole. c) Compare avec la situation sans effet de
              réseau (<M tex="v = 0" />
              ) : que change l'externalité ?
            </p>
          }
          steps={[
            {
              title: "Poser l'utilité et la condition d'achat",
              content: (
                <p>
                  L'acheteur en <M tex="x" /> a l'utilité{" "}
                  <M tex="u = 6 - 5x + 2y^E - p" /> s'il achète, 0 sinon. Il achète ssi{" "}
                  <M tex="u > 0" />, c'est-à-dire ssi{" "}
                  <M tex="x < \tfrac{1}{5}(6 + 2y^E - p)" />. Par distribution uniforme, la
                  demande à anticipation donnée vaut{" "}
                  <M tex="y = \tfrac{1}{5}(6 + 2y^E - p)" /> (dans <M tex="(0,1)" />
                  ).
                </p>
              ),
            },
            {
              title: "Imposer les anticipations rationnelles y = yᴱ",
              content: (
                <>
                  <p>
                    On remplace <M tex="y^E" /> par <M tex="y" /> :{" "}
                    <M tex="5y = 6 + 2y - p \iff 3y = 6 - p" />, d'où :
                  </p>
                  <MB tex="y = \frac{6-p}{3} = \frac{r-p}{t-v}" />
                  <p>
                    On vérifie la formule générale avec <M tex="t - v = 5 - 2 = 3" />. Comme{" "}
                    <M tex="v = 2 < 5 = t" />, on est dans le cas A : demande décroissante, un
                    seul équilibre, stable.
                  </p>
                </>
              ),
            },
            {
              title: "Demande inverse et recette marginale",
              content: (
                <p>
                  Demande inverse : <M tex="p = 6 - 3y" />. Recette totale{" "}
                  <M tex="py = (6-3y)y" />, recette marginale <M tex="Rm = 6 - 6y" /> (la pente
                  double).
                </p>
              ),
            },
            {
              title: "Recette marginale = coût marginal",
              content: (
                <p>
                  <M tex="6 - 6y = 2 \iff y^m = \tfrac{4}{6} = \tfrac{2}{3}" />, puis{" "}
                  <M tex="p^m = 6 - 3 \times \tfrac{2}{3} = 4" />. Vérification par la formule :{" "}
                  <M tex="p^m = \tfrac{r+c}{2} = \tfrac{6+2}{2} = 4" /> ✓ et{" "}
                  <M tex="y^m = \tfrac{1}{2}\tfrac{r-c}{t-v} = \tfrac{1}{2}\cdot\tfrac{4}{3} = \tfrac{2}{3}" />{" "}
                  ✓. Profit : <M tex="(4-2)\times\tfrac{2}{3} = \tfrac{4}{3} \approx 1{,}33" />.
                </p>
              ),
            },
            {
              title: "Comparer avec v = 0",
              content: (
                <p>
                  Sans réseau : <M tex="y = \tfrac{6-p}{5}" />,{" "}
                  <M tex="y^m = \tfrac{r-c}{2t} = \tfrac{4}{10} = 0{,}4" />,{" "}
                  <M tex="p^m = \tfrac{r+c}{2} = 4" /> (le même prix !), profit{" "}
                  <M tex="(4-2)\times 0{,}4 = 0{,}8" />. L'effet de réseau laisse le prix à 4
                  mais fait passer les ventes de 0,4 à 2/3 et le profit de 0,8 à ≈ 1,33.
                </p>
              ),
            },
          ]}
          result={
            <p>
              <M tex="y(p) = \tfrac{6-p}{3}" /> ; <M tex="p^m = 4" />,{" "}
              <M tex="y^m = 2/3" />, profit <M tex="4/3" />. À retenir : l'externalité{" "}
              <strong>ne change pas le prix du monopole</strong> (<M tex="(r+c)/2" /> avec ou
              sans réseau) mais gonfle les ventes et le profit. Le réflexe de calcul : demande à{" "}
              <M tex="y^E" /> donné → imposer <M tex="y = y^E" /> → demande en <M tex="t-v" /> →
              Rm = Cm.
            </p>
          }
        />

        <ExerciseBlock
          scope="ei4"
          id="ex2"
          number={2}
          title="Deux réseaux sur la ligne de Hotelling (la preuve des slides)"
          difficulty={3}
          refs={[
            { chapter: "ei4", section: "hotelling", label: "La ligne de Hotelling" },
            { chapter: "ei4", section: "effets-directs-duo", label: "Effets directs en duopole" },
          ]}
          statement={
            <p>
              Deux réseaux sont situés aux extrémités d'une ligne de Hotelling :{" "}
              <M tex="t = 4" />, externalité directe <M tex="v = 1" />, coûts marginaux nuls,{" "}
              <M tex="r" /> assez grand pour que tout le monde achète.
              <br />
              a) Écris les utilités et trouve l'acheteur indifférent. b) Montre que{" "}
              <M tex="y_1 = \tfrac{1}{2} - \tfrac{p_1 - p_2}{6}" />. c) Calcule les prix
              d'équilibre et les profits. d) Compare avec <M tex="v = 0" />.
            </p>
          }
          steps={[
            {
              title: "Utilités et acheteur indifférent",
              content: (
                <>
                  <p>
                    <M tex="u = r - 4x + y_1 - p_1" /> (réseau 1) contre{" "}
                    <M tex="u = r - 4(1-x) + y_2 - p_2" /> (réseau 2). L'acheteur indifférent{" "}
                    <M tex="\bar x" /> égalise les deux ; <M tex="r" /> se simplifie et :
                  </p>
                  <MB tex="\bar x = \frac{1}{2} - \frac{p_1 - p_2}{8} + \frac{y_1 - y_2}{8}" />
                  <p>
                    (formule générale avec <M tex="\tfrac{1}{2t} = \tfrac{v}{2t} = \tfrac{1}{8}" />
                    ).
                  </p>
                </>
              ),
            },
            {
              title: "Résoudre le système en soustrayant",
              content: (
                <>
                  <p>
                    <M tex="y_1 = \bar x" /> et <M tex="y_2 = 1 - \bar x" />, donc :
                  </p>
                  <MB tex="y_1 - y_2 = -\frac{p_1-p_2}{4} + \frac{y_1-y_2}{4} \iff (y_1 - y_2)\cdot\frac{3}{4} = -\frac{p_1-p_2}{4}" />
                  <MB tex="\iff y_1 - y_2 = -\frac{p_1-p_2}{3} \quad \left(= -\frac{p_1-p_2}{t-v}\right)" />
                </>
              ),
            },
            {
              title: "Réinjecter pour obtenir y₁(p₁, p₂)",
              content: (
                <>
                  <MB tex="y_1 = \frac{1}{2} - \frac{p_1-p_2}{8} + \frac{1}{8}\left(-\frac{p_1-p_2}{3}\right) = \frac{1}{2} - (p_1-p_2)\left(\frac{1}{8} + \frac{1}{24}\right) = \frac{1}{2} - \frac{p_1-p_2}{6}" />
                  <p>
                    C'est bien <M tex="\tfrac{1}{2} - \tfrac{1}{2}\tfrac{p_1-p_2}{t-v}" /> avec{" "}
                    <M tex="t - v = 3" />. Un euro d'écart de prix déplace 1/6 du marché — contre
                    1/8 sans effet de réseau : la demande est plus sensible aux prix.
                  </p>
                </>
              ),
            },
            {
              title: "Conditions de premier ordre et équilibre",
              content: (
                <>
                  <p>
                    Le réseau 1 maximise{" "}
                    <M tex="p_1\left(\tfrac{1}{2} - \tfrac{p_1-p_2}{6}\right)" /> :
                  </p>
                  <MB tex="\frac{1}{2} - \frac{2p_1 - p_2}{6} = 0 \iff p_1 = \frac{3 + p_2}{2}" />
                  <p>
                    Par symétrie <M tex="p_2 = \tfrac{3+p_1}{2}" />. La solution du système est{" "}
                    <M tex="p_1 = p_2 = 3 = t - v" />. Demandes : <M tex="y_1 = y_2 = 1/2" /> ;
                    profits : <M tex="3 \times \tfrac{1}{2} = 1{,}5" /> chacun.
                  </p>
                </>
              ),
            },
            {
              title: "Comparer avec v = 0",
              content: (
                <p>
                  Sans effet de réseau : <M tex="p^* = t = 4" /> et profits{" "}
                  <M tex="t/2 = 2" />. L'externalité <M tex="v = 1" /> fait baisser le prix
                  d'exactement 1 (de 4 à 3) et le profit de chaque firme de 0,5 (de 2 à 1,5). Les
                  parts de marché, elles, restent à 1/2 : toute l'agressivité s'est dissipée en
                  baisse de prix.
                </p>
              ),
            },
          ]}
          result={
            <p>
              <M tex="p^* = t - v = 3" />, <M tex="y_1 = y_2 = 1/2" />, profits{" "}
              <M tex="1{,}5" /> chacun. La méthode à automatiser : acheteur indifférent →
              soustraire les deux demandes pour isoler <M tex="y_1 - y_2" /> → réinjecter → CPO de
              chaque firme → système symétrique. Et le message économique : en duopole,{" "}
              <strong>l'effet de réseau intensifie la concurrence</strong>.
            </p>
          }
        />

        <H3>Checklist de fin de chapitre</H3>
        <MasteryChecklist
          items={[
            <>
              Je sais définir les économies de réseau et distinguer effet <strong>direct</strong>{" "}
              (même type : téléphone, Waze, avis en ligne, une langue) et{" "}
              <strong>indirect</strong> (autre type : consoles/développeurs, cartes/commerçants,
              plateformes). (§ 1)
            </>,
            <>
              Je peux expliquer pourquoi un effet de réseau est une <strong>externalité</strong>{" "}
              et pourquoi elle conduit à trop peu d'utilisateurs. (§ 1, § 2.2)
            </>,
            <>
              Je sais que les modèles d'effets <em>indirects</em> (2.3 et 3.3 des slides) sont
              hors matière — seuls la définition et les exemples sont à connaître. (§ 1)
            </>,
            <>
              Ville linéaire : <M tex="u = r - tx - p" />, condition d'achat{" "}
              <M tex="x < (r-p)/t" />, demande <M tex="y = (r-p)/t" />, bornes 0 et 1
              (couverture partielle/totale). (§ 2.1)
            </>,
            <>
              Monopole sans réseau : Rm = Cm donne <M tex="y = \tfrac{r-c}{2t}" /> et{" "}
              <M tex="p^m = \tfrac{r+c}{2}" />. (§ 2.1)
            </>,
            <>
              Utilité avec réseau : <M tex="u = r - tx + v y^E - p" /> ; je sais interpréter{" "}
              <M tex="y^E" /> (taille attendue) et <M tex="v" /> (ampleur de l'externalité).
              (§ 2.2)
            </>,
            <>
              Anticipations rationnelles <M tex="y = y^E" /> : je retrouve les trois équilibres
              et leurs conditions (<M tex="p > r" /> ; <M tex="p < r+v-t" /> ;{" "}
              <M tex="y^* = \tfrac{r-p}{t-v}" />). (§ 2.2)
            </>,
            <>
              Je sais tracer les deux courbes de demande (cas A décroissante, cas B croissante)
              et faire le raisonnement de <strong>stabilité</strong> avec le facteur{" "}
              <M tex="v/t" />. (§ 2.2)
            </>,
            <>
              Je peux raconter la <strong>masse critique</strong> <M tex="y^C" /> et la stratégie
              de prix de lancement (prix bas, ventes à perte, hausse ensuite). (§ 2.2)
            </>,
            <>
              Monopole avec réseau (<M tex="v<t" />) : <M tex="p^m = \tfrac{r+c}{2}" />{" "}
              indépendant de <M tex="v" />, ventes <M tex="\tfrac{1}{2}\tfrac{r-c}{t-v}" />{" "}
              croissantes en <M tex="v" /> — et je sais expliquer pourquoi. (§ 2.2)
            </>,
            <>
              Hotelling : je retrouve <M tex="\hat x = \tfrac{1}{2} - \tfrac{p_1-p_2}{2t}" />,
              l'équilibre <M tex="p^* = t" /> (coût nul), profits <M tex="t/2" />, et le rôle de{" "}
              <M tex="t" /> comme différenciation / pouvoir de marché (Bertrand différencié).
              (§ 3.1)
            </>,
            <>
              Duopole avec réseau : je sais refaire la preuve (soustraire, réinjecter) menant à{" "}
              <M tex="y_1 = \tfrac{1}{2} - \tfrac{1}{2}\tfrac{p_1-p_2}{t-v}" /> puis à{" "}
              <M tex="p^* = t - v" />, et expliquer pourquoi la concurrence est intensifiée.
              (§ 3.2)
            </>,
          ]}
        />
      </Section>
    </ChapterShell>
  );
}
