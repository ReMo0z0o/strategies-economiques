/*
 * Chapitre A3 — PartComportemental (sections affichées dans la page du chapitre).
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  DecisionTree,
  MasteryChecklist,
  PollCard,
  WidgetChordCurve,
  WidgetInsurance,
  WidgetInvest,
  WidgetProspect,
  WidgetRepeatBet,
  WidgetVMA,
} from "./widgets";
import { H3, Lead, Tbl, TH, TD, TDnum } from "./ui";

/** P(perte) exacte pour n = 1…10 paris « +10 € / −5 € » (vérifié en Python). */
const LOSS_TABLE: [number, string][] = [
  [1, "50 %"],
  [2, "25 %"],
  [3, "12,5 %"],
  [4, "31,25 %"],
  [5, "18,75 %"],
  [6, "10,94 %"],
  [7, "22,66 %"],
  [8, "14,45 %"],
  [9, "8,98 %"],
  [10, "17,19 %"],
];

/** Sous-titre local (même style que dans part-theorie). */
function H4({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-6 text-lg font-semibold tracking-tight">{children}</h4>;
}

export function PartComportemental() {
  return (
    <>

      {/* ============================================================ */}
      {/* § 10 · THÉORIE DES PERSPECTIVES                              */}
      {/* ============================================================ */}
      <Section
        id="s10"
        kicker="§ 10"
        title="Théorie des perspectives : quand le point de référence change tout"
      >
        <Lead>
          Fin du modèle rationnel, place à l'approche comportementale. Les Humains ne raisonnent
          pas en richesse absolue mais en gains et en pertes autour d'un point de référence — et
          cela peut renverser leurs choix.
        </Lead>

        <p>
          Comme en A1 (biais de dotation) et en A2 (problèmes de self-contrôle), on confronte
          maintenant le modèle rationnel aux choix d'humains réels. Commence par vivre
          l'expérience toi-même (slide 38), <em>dans l'ordre</em> : réponds à la version A, puis
          à la version B.
        </p>

        <PollCard
          tag="Sondage d'amphi nº 3 — version A"
          question="Tu reçois 300 € pour tes étrennes. Le lendemain, on te propose de choisir entre :"
          options={[
            { label: <>A1 · Un gain certain de 100 €</>, pct: 68 },
            { label: <>A2 · 50 % de chances de gagner 200 €, 50 % de chances de gagner 0 €</>, pct: 32 },
          ]}
          note={
            <>
              68 % des étudiants choisissent l'option sûre A1. Garde ton choix en tête — et
              réponds maintenant à la version B ci-dessous avant de lire la suite.
            </>
          }
        />

        <PollCard
          tag="Sondage d'amphi nº 3 — version B"
          question="Tu reçois 500 € pour tes étrennes. Le lendemain, on te propose de choisir entre :"
          options={[
            { label: <>B1 · Une perte certaine de 100 €</>, pct: 28 },
            { label: <>B2 · 50 % de chances de perdre 200 €, 50 % de chances de perdre 0 €</>, pct: 72 },
          ]}
          note={
            <>
              Seuls 28 % choisissent l'option sûre B1 : 72 % préfèrent le pari B2. Les réponses
              s'inversent par rapport à la version A… alors que, tu vas le voir, ce sont{" "}
              <strong>les mêmes options</strong>.
            </>
          }
        />

        <H3>Mêmes options, choix inversés</H3>
        <p>
          Compte ce que tu possèdes <em>à la fin</em> (ta richesse finale <M tex="w" />), dans
          chaque option :
        </p>
        <Tbl minW={420}>
          <thead>
            <tr>
              <th className={TH}>Option</th>
              <th className={TH}>Calcul</th>
              <th className={`${TH} text-right`}>Richesse finale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>A1 (gain sûr)</td>
              <td className={TD}>300 + 100</td>
              <td className={TDnum}>400 € certains</td>
            </tr>
            <tr>
              <td className={TD}>B1 (perte sûre)</td>
              <td className={TD}>500 − 100</td>
              <td className={TDnum}>400 € certains</td>
            </tr>
            <tr>
              <td className={TD}>A2 (pari sur un gain)</td>
              <td className={TD}>300 + 200 ou 300 + 0</td>
              <td className={TDnum}>500 € ou 300 €, à 50/50</td>
            </tr>
            <tr>
              <td className={TD}>B2 (pari sur une perte)</td>
              <td className={TD}>500 − 200 ou 500 − 0</td>
              <td className={TDnum}>300 € ou 500 €, à 50/50</td>
            </tr>
          </tbody>
        </Tbl>
        <p>
          L'option A1 est donc <strong>équivalente</strong> à l'option B1, et A2 est équivalente
          à B2 (slide 39). La seule différence est la <em>formulation</em> : les options A sont
          présentées comme des <strong>gains</strong>, les options B comme des{" "}
          <strong>pertes</strong>. On passe de l'une à l'autre en changeant le{" "}
          <strong>point de référence</strong> <M tex="w_{ref}" /> : combien la personne considère
          qu'elle possède avant de faire son choix (300 € dans la version A, 500 € dans la
          version B).
        </p>
        <p>
          Un Econo (l'individu rationnel du modèle de vNM) ne regarde que la richesse finale : il
          fait <em>le même choix</em> dans les deux versions. Les étudiants, eux, prennent
          surtout l'option sûre en A et surtout le pari en B. Le modèle rationnel ne peut pas
          expliquer ce renversement.
        </p>

        <H3>La fonction d'utilité dépend d'un point de référence</H3>
        <p>
          Pour décrire la manière dont les Humains décident, Kahneman et Tversky proposent la{" "}
          <strong>théorie des perspectives</strong> : les Humains ne raisonnent pas en niveaux{" "}
          <em>absolus</em> de richesse, mais en{" "}
          <strong>variations par rapport à un point de référence</strong>. Conséquence (slide
          39) : <strong>la fonction d'utilité de Bernoulli des Humains n'est pas absolue, mais
          dépend d'un point de référence</strong>. On la note
        </p>
        <MB tex="u(w,\, w_{ref}) \quad \text{au lieu de} \quad u(w)," />
        <p>
          où <M tex="w" /> est la richesse finale et <M tex="w_{ref}" /> le point de référence.
          (Kahneman et Tversky l'appellent aussi « fonction de valeur ».) Une même richesse finale
          peut donc être vécue comme un <strong>gain</strong> (si <M tex="w > w_{ref}" />) ou
          comme une <strong>perte</strong> (si <M tex="w < w_{ref}" />).
        </p>
        <p>
          Le slide 40 compare les deux théories sur un même graphique, avec la richesse finale{" "}
          <M tex="w" /> en abscisse :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>Théorie rationnelle</strong> : une seule courbe <M tex="u(w)" />, concave et
            lisse. Le point <M tex="w_{ref}" /> n'y joue aucun rôle : en ce point, la courbe a une
            seule tangente.
          </li>
          <li>
            <strong>Théorie des perspectives</strong> : la courbe <M tex="u(w, w_{ref})" /> est
            « accrochée » au point de référence. Elle est concave à droite de{" "}
            <M tex="w_{ref}" /> (gains), convexe à gauche (pertes), et elle fait un{" "}
            <strong>coude</strong> en <M tex="w_{ref}" /> : à égale distance du point de
            référence, elle monte plus fort côté pertes que côté gains (une perte pèse plus
            qu'un gain de même taille).
          </li>
        </ul>

        <Callout variant="definition" title="Les 3 caractéristiques de la théorie des perspectives (slide 41)">
          <p>
            <strong>1. Les gains de richesse sont à utilité marginale décroissante</strong> (la
            courbe est concave à droite de <M tex="w_{ref}" />). Chaque euro gagné en plus fait
            un peu moins plaisir que le précédent. Comme dans la théorie rationnelle, les gens
            sont donc <em>averses au risque lorsqu'il s'agit de gains</em>.
          </p>
          <p>
            <strong>2. Les pertes de richesse sont à utilité marginale croissante</strong> (la
            courbe est convexe à gauche de <M tex="w_{ref}" />). Au contraire de la théorie
            rationnelle, les gens ont une <em>affinité au risque lorsqu'il s'agit de pertes</em>.
            Ils se soucient plus de la <strong>première</strong> unité perdue que des suivantes :
            perdre 100 € fait très mal, perdre 100 € de plus fait « moins mal en plus ». D'où
            l'envie de parier pour tenter de ne rien perdre du tout.
          </p>
          <p>
            <strong>3. Aversion à la perte</strong> : l'utilité marginale de la première unité
            perdue est <strong>deux fois</strong> plus grande que l'utilité marginale de la
            première unité gagnée. C'est le coude en <M tex="w_{ref}" /> : perdre 1 € fait deux
            fois plus mal que gagner 1 € ne fait plaisir.
          </p>
        </Callout>

        <Callout variant="exemple" title="Les 3 caractéristiques sur un exemple (chiffres illustratifs)">
          <p>
            Le widget ci-dessous utilise une fonction simple qui a ces trois propriétés : un gain
            de <M tex="g" /> euros vaut <M tex="\sqrt{g}" />, une perte de <M tex="\ell" /> euros
            vaut <M tex="-2\sqrt{\ell}" />.
          </p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <strong>Gains</strong> : gagner 100 € vaut <M tex="\sqrt{100} = 10" /> ; gagner
              200 € vaut <M tex="\sqrt{200} \approx 14{,}1" />. Les 100 € de plus n'ajoutent que
              4,1 : utilité marginale décroissante.
            </li>
            <li>
              <strong>Pertes</strong> : perdre 100 € vaut <M tex="-2\sqrt{100} = -20" /> ; perdre
              200 € vaut <M tex="-2\sqrt{200} \approx -28{,}3" />. Les 100 € perdus en plus ne
              coûtent que 8,3 de plus, contre 20 pour les 100 premiers.
            </li>
            <li>
              <strong>Aversion à la perte</strong> : le premier euro gagné vaut{" "}
              <M tex="\sqrt{1} = 1" />, le premier euro perdu coûte <M tex="2\sqrt{1} = 2" /> :
              deux fois plus.
            </li>
          </ul>
        </Callout>

        <p>
          Applique maintenant cette fonction aux étrennes. Choisis le point de référence (300 € ou
          500 €) et compare les deux panneaux : seul <M tex="w_{ref}" /> change, les richesses
          finales restent les mêmes.
        </p>

        <WidgetProspect />

        <Callout variant="retiens" title="Pourquoi le choix s'inverse">
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <strong>Version A</strong> (<M tex="w_{ref} = 300" /> €) : 400 € et 500 € sont des
              gains, on est sur la partie concave. Option sûre :{" "}
              <M tex="\sqrt{100} = 10" /> ; pari :{" "}
              <M tex="\tfrac{1}{2}\sqrt{200} + \tfrac{1}{2}\cdot 0 \approx 7{,}07" />. L'option
              sûre gagne (comme pour 68 % de l'amphi).
            </li>
            <li>
              <strong>Version B</strong> (<M tex="w_{ref} = 500" /> €) : 400 € et 300 € sont des
              pertes, on est sur la partie convexe. Option sûre :{" "}
              <M tex="-2\sqrt{100} = -20" /> ; pari :{" "}
              <M tex="\tfrac{1}{2}\left(-2\sqrt{200}\right) + \tfrac{1}{2}\cdot 0 \approx -14{,}14" />
              . Le pari gagne (comme pour 72 % de l'amphi).
            </li>
            <li>
              <strong>Econo</strong> avec <M tex="u(w) = \sqrt{w}" /> : option sûre{" "}
              <M tex="\sqrt{400} = 20" /> ; pari{" "}
              <M tex="\tfrac{1}{2}\sqrt{300} + \tfrac{1}{2}\sqrt{500} \approx 19{,}84" />. Il
              choisit l'option sûre dans <em>les deux</em> versions.
            </li>
          </ul>
        </Callout>

        <Callout variant="intuition" title="Lien avec A1 · l'effet de dotation expliqué">
          <p>
            Slide 41 : l'aversion à la perte peut expliquer le biais de dotation (l'
            <strong>effet de dotation</strong> d'A1). Rappel : on exige plus pour{" "}
            <em>vendre</em> un objet qu'on possède qu'on ne paierait pour l'<em>acheter</em>.
            Explication : une fois l'objet en poche, il fait partie du point de référence. S'en
            séparer est donc vécu comme une <strong>perte</strong>, qui pèse deux fois plus que le
            gain de l'acheteur. Il faut donc un prix plus élevé pour accepter de vendre.{" "}
            <TheoryRef chapter="a1" section="dotation" label="L'effet de dotation" />
          </p>
        </Callout>

        <H3>Implications en finance (slides 42-43)</H3>

        <H4>1. Vendre les gagnantes trop tôt, garder les perdantes trop longtemps</H4>
        <p>
          Les traders ont tendance à vendre rapidement les actions qui montent (les « winners »)
          et à garder longtemps les actions qui baissent (les « loosers »). Note{" "}
          <M tex="p_a" /> le <strong>prix d'achat</strong> d'une action et <M tex="p_v" /> son{" "}
          <strong>prix de vente</strong>. Odean (1998) montre que, par rapport au prix d'achat{" "}
          <M tex="p_a" />, les traders vendent à un prix <M tex="p_v" /> tel que :
        </p>
        <MB tex="\underbrace{p_v - p_a}_{\text{gain (winner)}} \;<\; \underbrace{p_a - p_v}_{\text{perte (looser)}}" />
        <p>
          Exemple (chiffres illustratifs) : deux actions achetées <M tex="p_a = 100" /> €. Le
          trader vend le winner dès qu'il atteint 110 € (gain de 10 €), mais ne se décide à vendre
          le looser qu'à 75 € (perte de 25 €).
        </p>
        <p>
          Pourquoi ? Le point de référence est le prix d'achat <M tex="p_a" />. Garder une action,
          c'est garder un actif risqué :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            sur un winner, le trader est <strong>dans les gains</strong>, où la courbe est
            concave : <strong>la concavité sur les gains décourage la prise de risque</strong>. Il
            vend pour « sécuriser » son gain ;
          </li>
          <li>
            sur un looser, il est <strong>dans les pertes</strong>, où la courbe est convexe :{" "}
            <strong>la convexité sur les pertes encourage la prise de risque</strong>. Il garde
            l'action en espérant revenir à <M tex="p_a" /> (« se refaire »).
          </li>
        </ul>

        <H4>2. Plus de risques quand on est à la traîne</H4>
        <p>
          À la fin de l'année, les traders prennent plus de risques si le portefeuille dont ils
          s'occupent est à la traîne par rapport à l'indice de référence. Cet indice joue le rôle
          de <M tex="w_{ref}" /> : être en dessous, c'est être « dans les pertes », là où l'on
          aime le risque. Après le crash boursier de 2007, certains traders ont pris des risques
          encore plus grands pour tenter de revenir à l'équilibre (cf. l'affaire Kerviel).
        </p>

        <H4>3. L'argent qui dort sur les comptes</H4>
        <p>
          Retour au mystère du § 1 : pourquoi tant d'argent dort-il sur des comptes au lieu
          d'être investi ? La théorie des perspectives donne deux pistes (slide 43).
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>L'aversion à la perte</strong> crée une forte aversion au risque,{" "}
            <em>quel que soit le niveau de richesse</em>. En effet, le coude de la courbe se
            trouve toujours au point de référence, c'est-à-dire là où tu te trouves. Même un
            petit placement risqué met en jeu des gains et des pertes autour de ce coude, et les
            pertes y pèsent deux fois plus. Cela pourrait expliquer les montants qui dorment sur
            les comptes.
          </li>
          <li>
            <strong>La sophistication</strong> : un Humain sophistiqué, c'est-à-dire conscient de
            ses biais de décision (comme le sophistiqué d'A2 l'est de ses problèmes de
            self-contrôle), peut anticiper qu'il investira mal : qu'il vendra ses winners et
            gardera ses loosers. Cette sophistication l'incite à garder son argent en dehors de
            la bourse.{" "}
            <TheoryRef chapter="a2" section="selfcontrole" label="Naïf ou sophistiqué (A2)" />
          </li>
        </ul>

        <Quiz
          scope="a3"
          id="q4"
          question={
            <p>
              Dans l'expérience des étrennes, compare A1 (« 300 € puis un gain certain de
              100 € ») et B1 (« 500 € puis une perte certaine de 100 € »). En richesse finale,
              ces deux options sont…
            </p>
          }
          options={[
            {
              text: <>strictement identiques : 400 € certains dans les deux cas</>,
              correct: true,
              explain: (
                <>
                  Exact : 300 + 100 = 500 − 100 = 400 €. De même A2 ≡ B2 (500 € ou 300 € à
                  50/50). Seule la <strong>formulation</strong> change — et pourtant les réponses
                  de l'amphi s'inversent. C'est la preuve qu'un point de référence est à l'œuvre.
                </>
              ),
            },
            {
              text: <>différentes : B1 part d'une richesse plus élevée, donc B1 est meilleure</>,
              explain: (
                <>
                  Les 500 € de départ sont immédiatement amputés de 100 € : la richesse finale est
                  400 €, exactement comme en A1. Un individu vNM, qui raisonne en richesses
                  finales, les juge identiques.
                </>
              ),
            },
            {
              text: <>impossibles à comparer sans connaître la fonction u</>,
              explain: (
                <>
                  Pas besoin de u : les deux options donnent le même montant certain (400 €).
                  Toute fonction u leur attribue la même utilité — c'est bien pour ça que
                  l'inversion des réponses est une <em>anomalie</em>.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 11 · CADRAGE ÉTROIT                                        */}
      {/* ============================================================ */}
      <Section id="s11" kicker="§ 11" title="Cadrage étroit — narrow framing">
        <Lead>
          Deuxième biais majeur : évaluer chaque pari isolément au lieu de regarder son effet sur
          l'ensemble du portefeuille. L'argument de Samuelson montre pourquoi c'est incohérent.
        </Lead>

        <p>
          Commence par répondre honnêtement à ces deux propositions d'un ami : ce sont exactement
          celles posées en amphi (slide 44).
        </p>

        <PollCard
          tag="Sondage d'amphi nº 4 — proposition A"
          question={
            <>
              « Lançons une pièce de monnaie : si c'est pile, je te donne 10 € ; si c'est face, tu
              me donnes 5 €. » Tu acceptes ?
            </>
          }
          options={[
            { label: <>A1 · J'accepte</>, pct: 68 },
            { label: <>A2 · Je refuse</>, pct: 32 },
          ]}
          note={
            <>
              68 % des étudiants acceptent. Le pari est pourtant très favorable : de petites
              sommes, à deux contre un (on gagne 10 € ou on perd 5 €). Garde ta réponse en tête et
              passe à la proposition B.
            </>
          }
        />

        <PollCard
          tag="Sondage d'amphi nº 5 — proposition B"
          question={
            <>
              « Lançons la pièce <strong>10 fois de suite</strong>. Pour chaque lancer où la pièce
              tombe sur pile, je te donne 10 € ; pour chaque lancer où elle tombe sur face, tu me
              donnes 5 €. » Tu acceptes ?
            </>
          }
          options={[
            { label: <>B1 · J'accepte</>, pct: 84 },
            { label: <>B2 · Je refuse</>, pct: 16 },
          ]}
          note={
            <>
              84 % acceptent : plus de monde accepte 10 paris qu'un seul. Cela paraît raisonnable…
              mais d'après Samuelson, <strong>il n'est pas rationnel d'accepter B tout en refusant
              A</strong>. Voici son argument.
            </>
          }
        />

        <H3>L'argument de Samuelson : on raisonne en partant de la fin</H3>
        <p>
          Prends quelqu'un qui a <strong>refusé A</strong> tout en <strong>acceptant B</strong>.
          Imaginons avec Samuelson qu'après chaque pari de la proposition B, il puisse décider de
          participer ou non au pari suivant (slide 45). On regarde ce qu'il fait, en commençant
          par le dernier pari :
        </p>
        <ol className="my-3 list-decimal space-y-2 pl-6">
          <li>
            <strong>Pari nº 10 (le dernier).</strong> Il ne reste qu'un seul pari devant lui :
            c'est exactement la proposition A. Comme il refuse A, il refuse le 10ᵉ pari.
          </li>
          <li>
            <strong>Pari nº 9.</strong> Il anticipe qu'il refusera le 10ᵉ pari. Le 9ᵉ pari est
            donc, de fait, le dernier : il se retrouve de nouveau dans la proposition A. Il refuse
            le 9ᵉ pari.
          </li>
          <li>
            <strong>Pari nº 8.</strong> Les paris 9 et 10 n'auront pas lieu : le 8ᵉ est le dernier,
            c'est encore la proposition A. Il refuse.
          </li>
          <li>
            <strong>Paris nº 7, 6, 5, 4, 3, 2.</strong> Même raisonnement à chaque étape : le pari
            examiné est toujours, de fait, le dernier. Il les refuse un par un.
          </li>
          <li>
            <strong>Pari nº 1.</strong> Il refuse aussi le 1ᵉʳ pari. Il ne joue donc aucun des 10
            paris : <strong>il refuse la proposition B</strong>.
          </li>
        </ol>
        <Callout variant="retiens" title="Conclusion de Samuelson">
          <p>
            Refuser A ⇒ refuser B. Accepter B tout en refusant A est donc incohérent. Pourtant,
            en amphi, 32 % refusent A et seulement 16 % refusent B : si ce sont les mêmes
            étudiants, au moins 32 % − 16 % = 16 % d'entre eux ont refusé A tout en acceptant B.
          </p>
        </Callout>

        <Callout variant="definition" title="Définition · Biais de cadrage étroit (slide 45)">
          <p>
            Le biais de <strong>cadrage étroit</strong> (« narrow framing ») consiste à évaluer
            chaque alternative risquée <strong>séparément</strong>, indépendamment de son
            portefeuille.
          </p>
          <p>
            Au contraire, lorsqu'il évalue une alternative risquée, un individu rationnel
            considère la manière dont cette alternative risquée impacte{" "}
            <strong>l'ensemble de son portefeuille</strong> (tout ce qu'il possède et tous les
            risques qu'il court déjà).
          </p>
        </Callout>

        <H3>Le pari isolé : VMA et utilité espérée (slide 46)</H3>
        <p>
          Note <M tex="w" /> ta richesse avant le pari. Avec la proposition A, tu finis avec{" "}
          <M tex="w + 10" /> (pile, probabilité ½) ou avec <M tex="w - 5" /> (face, probabilité
          ½). Comme ce pari met en jeu de faibles sommes et se fait à deux contre un, il semble
          très intéressant de l'accepter. Sa valeur monétaire attendue est
        </p>
        <MB tex="\mathrm{VMA}(1\text{ pari}) = \tfrac{1}{2}\cdot 10 - \tfrac{1}{2}\cdot 5 = 2{,}5\ \text{€}" />
        <p>et son utilité espérée est</p>
        <MB tex="U(1\text{ pari}) = \tfrac{1}{2}\,u(w+10) + \tfrac{1}{2}\,u(w-5)." />
        <p>
          Refuser le pari, c'est garder <M tex="w" /> avec certitude : c'est préférer{" "}
          <M tex="u(w)" /> à <M tex="U(1\text{ pari})" />. D'après le slide 46, un individu qui
          refuse la proposition A :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            soit est <strong>rationnel et fortement averse au risque</strong> ;
          </li>
          <li>
            soit a une <strong>aversion à la perte</strong> : l'utilité marginale des pertes est
            deux fois plus grande que celle des gains (§ 10).
          </li>
        </ul>

        <Callout variant="exemple" title="Deux façons de refuser A, en chiffres">
          <p>
            <strong>1. Un Econo averse au risque, avec <M tex="u(w) = \ln w" /></strong> (comme
            l'investisseur du § 7). Il refuse le pari si le pari vaut moins que{" "}
            <M tex="w" /> certain :
          </p>
          <ol className="my-3 list-decimal space-y-2 pl-6">
            <li>
              Condition de refus :{" "}
              <M tex="\tfrac{1}{2}\ln(w+10) + \tfrac{1}{2}\ln(w-5) < \ln w" />.
            </li>
            <li>
              On multiplie par 2 : <M tex="\ln(w+10) + \ln(w-5) < 2\ln w" />.
            </li>
            <li>
              Comme <M tex="\ln a + \ln b = \ln(ab)" /> et <M tex="2\ln w = \ln w^2" /> :{" "}
              <M tex="\ln\big[(w+10)(w-5)\big] < \ln\big(w^2\big)" />.
            </li>
            <li>
              La fonction ln est croissante, on peut donc l'enlever des deux côtés :{" "}
              <M tex="(w+10)(w-5) < w^2" />.
            </li>
            <li>
              On développe : <M tex="w^2 + 5w - 50 < w^2" />.
            </li>
            <li>
              On retire <M tex="w^2" /> des deux côtés, puis on divise par 5 :{" "}
              <M tex="5w < 50" />, donc <M tex="w < 10" />.
            </li>
          </ol>
          <p>
            Il ne refuse donc que s'il possède <strong>moins de 10 €</strong> (à 10 € pile, il
            est indifférent). Avec une richesse normale, il accepte. Pour refuser ce pari tout en
            étant rationnel, il faut une aversion au risque bien plus forte que celle de{" "}
            <M tex="\ln w" /> : c'est le sens de « fortement averse au risque ».
          </p>
          <p>
            <strong>2. Un Humain qui a de l'aversion à la perte.</strong> Pour de petites sommes,
            ne gardons que l'ingrédient du slide 46 : chaque euro gagné compte pour 1, chaque
            euro perdu compte pour 2. La valeur perçue du pari est alors
          </p>
          <MB tex="\tfrac{1}{2}\cdot 10 \;-\; \tfrac{1}{2}\cdot (2 \times 5) = 5 - 5 = 0." />
          <p>
            Le pari ne lui rapporte rien à ses yeux : il n'a aucune raison de l'accepter.
            L'aversion à la perte suffit à expliquer le refus de A, sans aversion au risque
            extrême.
          </p>
        </Callout>

        <H3>Trois paris de suite : la loi binomiale (slide 47)</H3>
        <p>
          Considérons maintenant trois paris de suite. Note <M tex="X" /> le nombre de lancers qui
          tombent sur pile. Chaque lancer est indépendant des autres, et <M tex="X" /> est
          distribué comme une <strong>binomiale</strong> :
        </p>
        <MB tex="X \sim Bi(n, p) \qquad \text{avec } n = 3 \text{ et } p = \tfrac{1}{2}," />
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <M tex="n = 3" /> est le <strong>nombre d'essais</strong> (les 3 lancers) ;
          </li>
          <li>
            <M tex="p = \tfrac{1}{2}" /> est la <strong>probabilité de succès d'un essai</strong>{" "}
            (ici, un « succès » = pile).
          </li>
        </ul>
        <p>
          D'où viennent les probabilités ? Trois lancers donnent <M tex="2^3 = 8" /> suites
          possibles (PPP, PPF, PFP, FPP, PFF, FPF, FFP, FFF), qui ont toutes la même probabilité
          1/8. On compte : 1 suite avec 3 piles, 3 suites avec 2 piles (PPF, PFP, FPP), 3 suites
          avec 1 pile, 1 suite avec 0 pile. Avec <M tex="X" /> piles et <M tex="3 - X" /> faces,
          le gain total vaut <M tex="10X - 5(3 - X) = 15X - 15" /> :
        </p>

        <Tbl minW={420}>
          <thead>
            <tr>
              <th className={TH}>Nombre de piles X</th>
              <th className={`${TH} text-right`}>Probabilité</th>
              <th className={`${TH} text-right`}>Gain total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={TD}>3</td>
              <td className={TDnum}>1/8</td>
              <td className={TDnum}>+30 €</td>
            </tr>
            <tr>
              <td className={TD}>2</td>
              <td className={TDnum}>3/8</td>
              <td className={TDnum}>+15 €</td>
            </tr>
            <tr>
              <td className={TD}>1</td>
              <td className={TDnum}>3/8</td>
              <td className={TDnum}>0 €</td>
            </tr>
            <tr>
              <td className={TD}>0</td>
              <td className={TDnum}>1/8</td>
              <td className={TDnum}>−15 €</td>
            </tr>
          </tbody>
        </Tbl>

        <p>La VMA de trois paris de suite est</p>
        <MB tex="\begin{aligned} \mathrm{VMA}(3\text{ paris}) &= \tfrac{1}{8}\cdot 30 + \tfrac{3}{8}\cdot 15 + \tfrac{3}{8}\cdot 0 - \tfrac{1}{8}\cdot 15 \\ &= \tfrac{30 + 45 + 0 - 15}{8} = \tfrac{60}{8} = 7{,}5\ \text{€} \end{aligned}" />
        <p>
          (= 3 × 2,5 € : trois paris qui rapportent chacun 2,5 € en moyenne). Son utilité
          espérée est
        </p>
        <MB tex="\begin{aligned} U(3\text{ paris}) = {} & \tfrac{1}{8}\,u(w+30) + \tfrac{3}{8}\,u(w+15) \\ & + \tfrac{3}{8}\,u(w) + \tfrac{1}{8}\,u(w-15). \end{aligned}" />
        <p>
          Surtout, on ne perd de l'argent que si <M tex="X = 0" /> (trois faces) : la probabilité
          d'enregistrer des pertes sur 3 paris n'est que de <strong>1/8 = 12,5 %</strong> (slide
          48), contre 50 % pour un pari isolé.
        </p>

        <Callout variant="intuition" title="Refuser un pari seul, accepter le paquet">
          <p>
            Reprends l'Humain qui compte chaque euro perdu deux fois. Pour un pari, sa valeur
            perçue vaut 0. Pour trois paris, seule l'issue −15 € (probabilité 1/8) est une perte :
          </p>
          <MB tex="\begin{aligned} & \tfrac{1}{8}\cdot 30 + \tfrac{3}{8}\cdot 15 + \tfrac{3}{8}\cdot 0 - \tfrac{1}{8}\cdot (2 \times 15) \\ &= 3{,}75 + 5{,}625 + 0 - 3{,}75 = 5{,}625 > 0. \end{aligned}" />
          <p>
            Jugé seul, un pari ne vaut rien à ses yeux ; jugés ensemble, les paris sont
            clairement intéressants. Voilà le cadrage étroit : celui qui évalue chaque pari
            séparément refuse A, alors que le paquet de paris est attractif.
          </p>
        </Callout>

        <H3>Et avec 10 paris (proposition B) ?</H3>
        <p>
          La VMA augmente régulièrement : 2,5 € par pari, donc <strong>25 €</strong> pour les 10
          paris de la proposition B. La probabilité de finir en perte, elle, ne baisse{" "}
          <strong>pas</strong> à chaque pari ajouté (valeurs exactes) :
        </p>
        <Tbl minW={340}>
          <thead>
            <tr>
              <th className={TH}>Nombre de paris n</th>
              <th className={`${TH} text-right`}>VMA</th>
              <th className={`${TH} text-right`}>P(perte)</th>
            </tr>
          </thead>
          <tbody>
            {LOSS_TABLE.map(([n, pl]) => (
              <tr key={n}>
                <td className={TD}>
                  {n}
                  {n % 3 === 0 ? " (gain nul possible)" : n === 10 ? " (proposition B)" : ""}
                </td>
                <td className={TDnum}>{(2.5 * n).toLocaleString("fr-FR")} €</td>
                <td className={TDnum}>{pl}</td>
              </tr>
            ))}
          </tbody>
        </Tbl>
        <p>
          <strong>Pourquoi ce zigzag ?</strong> Avec <M tex="n" /> paris et <M tex="k" /> piles, le
          gain vaut <M tex="10k - 5(n-k) = 15k - 5n" />. Il est nul quand <M tex="15k = 5n" />,
          c'est-à-dire <M tex="k = n/3" /> : un gain nul n'est possible que si <M tex="n" /> est un
          multiple de 3. Pour <M tex="n = 3, 6, 9" />, une partie des issues donne exactement
          0 € (ni gain ni perte) : P(perte) fait un creux. Au pari suivant, ce cas « 0 € » suivi
          d'une face devient une perte de 5 € : P(perte) remonte.
        </p>
        <p>
          Pour la proposition B (<M tex="n = 10" />) : VMA = 25 €, mais P(perte) ≈ 17,2 %, un peu{" "}
          <em>plus</em> qu'avec 3 paris (12,5 %), et bien moins que 50 %. Sur les multiples de 3,
          la probabilité de perte baisse régulièrement (12,5 % ; 10,9 % ; 9,0 %…) et, pour un grand
          nombre de paris, elle tend vers 0 (2,1 % pour 30 paris) : chaque pari rapporte 2,5 € en
          moyenne, et sur beaucoup de paris le gain moyen réalisé se rapproche de cette valeur
          positive.
        </p>
        <p>
          Vérifie-le dans le widget 6 : fais varier le nombre de paris <M tex="n" /> de 1 à 30 et
          regarde le graphe du bas (le zigzag de P(perte)). La ligne « Valeur perçue si pertes × 2 »
          refait, pour <M tex="n" /> paris, le calcul de l'encadré précédent.
        </p>

        <WidgetRepeatBet />

        <Callout variant="exemple" title="Application · La mauvaise délégation (Thaler, slide 48)">
          <p>
            Un holding de l'industrie de la presse possède <strong>23 magazines</strong>. Le
            holding est présidé par un CEO et chaque magazine par un cadre dirigeant. Thaler
            demande à chacun des cadres s'il est prêt à engager un projet qui rapporte{" "}
            <strong>2 millions $</strong> avec une probabilité de 50 %, mais fait perdre{" "}
            <strong>1 million $</strong> avec une probabilité de 50 %.
          </p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              <strong>3 des 23 cadres</strong> sont prêts à le faire…
            </li>
            <li>
              … alors que le CEO voudrait que <em>tous</em> les projets soient entrepris.
            </li>
          </ul>
          <p>Le CEO regarde l'ensemble des 23 projets (indépendants les uns des autres) :</p>
          <ul className="my-3 list-disc space-y-1.5 pl-6">
            <li>
              VMA d'un projet = ½ × 2 − ½ × 1 = 0,5 M$, donc VMA de l'ensemble = 23 × 0,5 ={" "}
              <strong>11,5 M$</strong> ;
            </li>
            <li>
              si <M tex="X" /> projets réussissent (<M tex="X \sim Bi(23, \tfrac{1}{2})" />), le
              gain total vaut <M tex="2X - (23 - X) = 3X - 23" /> M$. C'est une perte si{" "}
              <M tex="3X < 23" />, c'est-à-dire si <M tex="X \le 7" />. Or{" "}
              <M tex="P(X \le 7) \approx 4{,}7\,\%" /> : la probabilité d'être en perte sur
              l'ensemble est <strong>inférieure à 5 %</strong>.
            </li>
          </ul>
          <p>
            <strong>Problème</strong> : les cadres dirigeants font face à de{" "}
            <strong>mauvais incitants</strong> : un petit bonus si leur projet réussit, être
            renvoyé si leur projet échoue. Chaque cadre juge donc son projet seul, comme celui qui
            refuse la proposition A. Pour le holding, ces 23 décisions séparées reviennent à un
            cadrage étroit : il perd un portefeuille de projets très avantageux. (Le choix
            « Thaler : 23 projets » du widget 6 refait ce calcul.)
          </p>
        </Callout>

        <ExerciseBlock
          scope="a3"
          id="ex5"
          number={5}
          title="Trois paris valent mieux qu'un"
          difficulty={2}
          refs={[{ chapter: "a3", section: "s11", label: "Cadrage étroit" }]}
          statement={
            <p>
              Ton amie te propose le pari « +10 € si pile, −5 € si face », répété 3 fois.
              <br />
              a) Dresse la distribution du gain total. b) Calcule la VMA. c) Quelle est la
              probabilité de finir en perte ? d) Compare avec un pari unique.
            </p>
          }
          steps={[
            {
              title: "La loi du nombre de piles",
              content: (
                <p>
                  Le nombre de piles <M tex="X" /> suit une binomiale{" "}
                  <M tex="X \sim Bi(n, p)" /> avec <M tex="n = 3" /> essais et{" "}
                  <M tex="p = \tfrac{1}{2}" /> (probabilité de pile à chaque lancer). Les 8
                  suites de lancers (PPP, PPF, …) sont équiprobables :{" "}
                  <M tex="P(X=3) = \tfrac{1}{8}" />, <M tex="P(X=2) = \tfrac{3}{8}" />,{" "}
                  <M tex="P(X=1) = \tfrac{3}{8}" />, <M tex="P(X=0) = \tfrac{1}{8}" />.
                </p>
              ),
            },
            {
              title: "La distribution du gain",
              content: (
                <p>
                  Avec <M tex="X" /> piles et <M tex="3 - X" /> faces, le gain vaut{" "}
                  <M tex="10X - 5(3 - X) = 15X - 15" />, donc : +30 € (1/8), +15 € (3/8), 0 €
                  (3/8), −15 € (1/8).
                </p>
              ),
            },
            {
              title: "La VMA",
              content: (
                <p>
                  VMA = (30 + 3 × 15 + 0 − 15)/8 = 60/8 = <strong>7,50 €</strong>. Vérification
                  rapide : 3 paris indépendants de VMA 2,50 € → 3 × 2,50 = 7,50 €. ✔
                </p>
              ),
            },
            {
              title: "La probabilité de perte",
              content: (
                <p>
                  On perd de l'argent seulement si <M tex="X = 0" /> : probabilité{" "}
                  <strong>1/8 = 12,5 %</strong>, contre 50 % pour un pari unique. Passer de 1 à 3
                  paris triple la VMA (2,50 € → 7,50 €) <em>et</em> divise la probabilité de perte
                  par 4 (50 % → 12,5 %) : les paris se compensent en partie. Évaluer chaque pari
                  isolément (cadrage étroit) fait rater cet effet.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Distribution : +30 (1/8), +15 (3/8), 0 (3/8), −15 (1/8) ; VMA = 7,50 € ; P(perte) =
              12,5 % contre 50 % pour un pari isolé. Regrouper les paris réduit le risque de
              perte, ce que le <strong>cadrage étroit</strong> rend invisible.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 12 · BIAIS SUR LES PROBABILITÉS                            */}
      {/* ============================================================ */}
      <Section id="s12" kicker="§ 12" title="Biais sur les probabilités">
        <Lead>
          Troisième famille de biais : cette fois, ce ne sont pas les valeurs qui sont déformées,
          mais les probabilités elles-mêmes — trop d'optimisme, fausses compensations du hasard,
          petites probabilités illisibles.
        </Lead>

        <p>
          Dans l'utilité espérée <M tex="U = \sum_s \pi(s)\, u(x_s)" />, la théorie des
          perspectives touche la fonction <M tex="u" /> (elle dépend d'un point de référence).
          Les biais de ce paragraphe touchent les{" "}
          <strong>
            probabilités <M tex="\pi" />
          </strong>{" "}
          : les Humains évaluent mal les probabilités des différents états du monde (« states of
          the world »). Commence par le test passé en amphi (slide 49).
        </p>

        <PollCard
          tag="Sondage d'amphi nº 6"
          question="On classe les étudiants inscrits à ce cours en percentiles selon leur note à l'examen final de janvier. Par exemple, être dans le percentile 12 %, c'est faire mieux que 12 % des participants, mais moins bien que 88 % d'entre eux. Selon toi, dans quel percentile te situerais-tu ?"
          options={[
            { label: <>Sous 25 %</> },
            { label: <>25 – 50 %</> },
            { label: <>50 – 75 %</> },
            { label: <>Au-dessus de 75 %</> },
          ]}
          resultBars={[
            { label: <>Percentile médian annoncé par les étudiants du cours</>, pct: 60 },
          ]}
          note={
            <>
              Le percentile médian annoncé est 60 % : la moitié des étudiants se placent à 60 %
              ou plus, et d'autres encore entre 50 % et 60 %. Au total, plus de la moitié des
              étudiants pensent faire mieux que la moitié de l'amphi. C'est{" "}
              <strong>impossible</strong> : par définition, seule la moitié des étudiants peut
              être meilleure que 50 % de ses congénères (la médiane des vrais percentiles est
              50 %).
            </>
          }
        />

        <Callout variant="definition" title="Définition · Biais de sur-confiance (slide 50)">
          <p>
            Les Humains sont en général atteints d'un <strong>biais de sur-confiance</strong> :
            ils ont tendance à <strong>sur-estimer la probabilité des bons états du monde</strong>{" "}
            et à sous-estimer la probabilité des mauvais. Dans le modèle : l'individu utilise des
            probabilités <M tex="\pi" /> trop optimistes.
          </p>
        </Callout>

        <p>Exemples cités au slide 50 :</p>

        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>Svenson (1981)</strong> : 93 % des sujets de son étude jugent leur
            performance de conducteur au-dessus de la médiane (là encore, au plus 50 % peuvent
            l'être).
          </li>
          <li>
            <strong>Weinstein (1980)</strong> : les gens sous-estiment la probabilité d'une
            hospitalisation.
          </li>
          <li>
            <strong>Buehler et al. (1994)</strong> : les gens sous-estiment le temps nécessaire
            pour achever un projet (tu connais ?).
          </li>
          <li>
            La <strong>naïveté</strong> par rapport à ses propres problèmes de self-contrôle
            découle d'un biais de sur-confiance en sa capacité à résister à la tentation (voir
            l'encadré ci-dessous).
          </li>
          <li>
            Les <strong>entrepreneurs</strong> peuvent sur-estimer la probabilité que leur projet
            aboutisse.
          </li>
        </ul>

        <Callout variant="intuition" title="Lien avec A2 · la naïveté est une sur-confiance">
          <p>
            En A2, <M tex="\hat{\beta}" /> (« bêta chapeau ») est la croyance qu'un individu a sur
            son propre <M tex="\beta" />. L'individu <em>naïf</em> a{" "}
            <M tex="\hat{\beta} = 1" /> : il croit que, demain, il n'aura aucun problème de
            self-contrôle et qu'il résistera à la tentation. Il se trompe systématiquement.
          </p>
          <p>
            C'est une sur-confiance : il sur-estime la probabilité du bon état du monde « demain,
            je tiendrai bon ». L'individu <em>sophistiqué</em>, lui, connaît son biais :{" "}
            <M tex="\hat{\beta} = \beta" />.{" "}
            <TheoryRef chapter="a2" section="selfcontrole" label="Problèmes de self-contrôle (β̂)" />
          </p>
        </Callout>

        <H3>L'erreur de sur-inférence du joueur (« gambler fallacy »)</H3>
        <p>
          Les Humains sont atteints de toute une série d'autres biais lorsqu'ils évaluent les
          probabilités des différents états du monde (slide 51). Premier exemple : on lance une
          pièce équilibrée. Chaque lancer est indépendant des précédents, et la distribution du
          nombre de piles est connue. Les deux premiers lancers sont tous les deux tombés sur
          pile. Quelle est la probabilité d'avoir pile au prochain lancer ?
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            Le joueur <strong>rationnel</strong> répond <strong>50 %</strong> : les lancers sont
            indépendants, la pièce n'a pas de mémoire.
          </li>
          <li>
            Le joueur victime du biais de <strong>sur-inférence</strong> s'attend à une
            probabilité <strong>inférieure à 50 %</strong>, afin de « rétablir » les observations
            en direction de la distribution connue (autant de piles que de faces). C'est faux :
            la pièce n'a pas de mémoire, elle ne « compense » pas les piles déjà sortis.
          </li>
        </ul>
        <p>
          Vérification avec 3 lancers : parmi les 8 suites équiprobables, deux commencent par
          deux piles : PPP et PPF, chacune de probabilité 1/8. Donc
        </p>
        <MB tex="\begin{aligned} P(\text{pile au 3}^{\text{e}} \mid \text{PP}) &= \frac{P(\text{PPP})}{P(\text{PPP}) + P(\text{PPF})} \\ &= \frac{1/8}{1/8 + 1/8} = \frac{1}{2}. \end{aligned}" />

        <H3>Le biais sur les probabilités très faibles</H3>
        <p>
          Pourquoi tant de monde joue-t-il à la loterie (Lotto, Euromillions…) alors que
          l'espérance de gain est négative (en moyenne, on récupère moins que le prix du
          ticket) ? Une des raisons, d'après le slide 51 : les gens évaluent mal les petites
          probabilités.
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            Il est facile de se représenter la différence entre une probabilité de 50 % et de
            25 %.
          </li>
          <li>
            Il est difficile de se représenter la différence entre 1 chance sur un million et 5
            chances sur un million. Pourtant, il y a un <strong>facteur 5</strong> entre les deux.
          </li>
          <li>
            De ce fait, les gens ne réalisent pas que leurs chances de gagner sont extrêmement
            faibles.
          </li>
        </ul>
      </Section>
    </>
  );
}
