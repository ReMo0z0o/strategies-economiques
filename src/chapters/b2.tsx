/*
 * Chapitre B2 — Théorie des contrats.
 *
 * Conversion fidèle du manuel interactif « B2 · Théorie des contrats »
 * (cours ECGEB366, d'après les slides de B. Decerf) : le problème de
 * l'agence et l'aléa moral, le modèle principal-agent (technologie,
 * contrat, payoffs, timing), les trois contrats (fixe, proportionnel,
 * linéaire) résolus par backward induction, les contraintes CP et CI,
 * la franchise et le residual claimant, puis l'agent averse au risque.
 */

import type { ReactNode } from "react";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  ContractLab,
  EffortExplorer,
  GameTreeTimeline,
  MasteryChecklist,
  PayoffComparison,
  PollIntuition,
  QuizDiagnostic,
  RiskAversionFigure,
  SurplusExplorer,
} from "./b2/interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Grille de cartes de vocabulaire (les .vocab de la source). */
function VocabGrid({
  items,
}: {
  items: Array<{
    term: ReactNode;
    tag?: ReactNode;
    tagTone?: "principal" | "agent";
    body: ReactNode;
  }>;
}) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold">
            {it.term}
            {it.tag ? (
              <span
                className={
                  it.tagTone === "agent"
                    ? "ml-2 rounded-full bg-sky-100 px-2 py-0.5 align-middle text-[10.5px] font-bold uppercase tracking-wide text-sky-800"
                    : "ml-2 rounded-full bg-rose-100 px-2 py-0.5 align-middle text-[10.5px] font-bold uppercase tracking-wide text-rose-800"
                }
              >
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

/** Résolution numérotée pas à pas (les .steps de la source). */
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

/** Légende des symboles du chapitre (les 5 couleurs de la source). */
function SymbolLegend() {
  const items = [
    {
      glyph: "e",
      color: "text-sky-700",
      name: "L'effort",
      desc: "choisi par l'agent = nombre de clients visités. Invisible pour le principal.",
    },
    {
      glyph: "x",
      color: "text-violet-700",
      name: "Le bruit (la chance)",
      desc: "variable aléatoire non contrôlée, de moyenne nulle : E(x) = 0. Invisible aussi.",
    },
    {
      glyph: "z",
      color: "text-emerald-700",
      name: "Le résultat",
      desc: "les licences vendues. La seule chose que tout le monde observe.",
    },
    {
      glyph: "w",
      color: "text-amber-700",
      name: "Le salaire",
      desc: "payé par le principal à l'agent. Ne peut dépendre que de z.",
    },
    {
      glyph: "α, β",
      color: "text-rose-700",
      name: "Les leviers du contrat",
      desc: "α = partie fixe du salaire, β = taux de bonus. C'est ce que le principal choisit.",
    },
  ];
  return (
    <div className="my-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.name} className="flex items-start gap-3 rounded-xl border bg-card px-3.5 py-3 shadow-sm">
          <span className={`min-w-[2rem] pt-0.5 text-center font-serif text-xl italic ${it.color}`}>
            {it.glyph}
          </span>
          <span>
            <span className={`block text-[14px] font-bold ${it.color}`}>{it.name}</span>
            <span className="block text-[12.5px] leading-snug text-muted-foreground">{it.desc}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Le face-à-face principal / agent du héros de la source. */
function PrincipalAgentDiagram() {
  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 rounded-2xl border bg-card px-5 py-5 shadow-sm">
      <div className="flex min-w-[8.5rem] flex-col items-center gap-1 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-2xl">
          <span aria-hidden>🏢</span>
        </div>
        <span className="text-sm font-bold">Le principal</span>
        <span className="text-xs text-muted-foreground">l'entreprise · propose le contrat</span>
      </div>
      <div className="flex flex-col gap-1.5 text-center text-[13px] text-muted-foreground">
        <span className="rounded-full border border-dashed bg-muted/50 px-4 py-1">
          contrat <M tex="w(z)" /> →
        </span>
        <span className="rounded-full border border-dashed bg-muted/50 px-4 py-1">
          ← effort <M tex="e" /> (invisible !)
        </span>
      </div>
      <div className="flex min-w-[8.5rem] flex-col items-center gap-1 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-2xl">
          <span aria-hidden>💼</span>
        </div>
        <span className="text-sm font-bold">L'agent</span>
        <span className="text-xs text-muted-foreground">le commercial · choisit son effort</span>
      </div>
    </div>
  );
}

/** Tableau récapitulatif avec défilement horizontal sur mobile. */
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

/** Cellule mise en évidence dans le tableau récapitulatif. */
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
    <ChapterShell chapterId="b2">
      {/* ============================================================ */}
      {/* §0 — Repères & boîte à outils                                 */}
      {/* ============================================================ */}
      <Section id="sec-reperes" kicker="§ 0 · Jeux séquentiels appliqués" title="Repères — où en sommes-nous ?">
        <p className="text-[1.15rem] leading-relaxed">
          Une entreprise embauche un commercial, mais elle ne peut pas surveiller ses efforts.
          Quel contrat de salaire proposer pour qu'il se donne à fond ? Ce chapitre applique les
          jeux séquentiels à cette question très concrète — et la réponse va te surprendre :
          le meilleur contrat, c'est celui où <em>l'employé paie l'entreprise</em>.
        </p>

        <PrincipalAgentDiagram />

        <Callout variant="examen" title="🎯 Ce que tu sauras faire à la fin de ce chapitre">
          <ul>
            <li>
              Expliquer avec tes mots le <strong>problème de l'agence</strong>,
              l'<strong>asymétrie d'information</strong> et l'<strong>aléa moral</strong>.
            </li>
            <li>
              Poser le <strong>modèle principal-agent</strong> (technologie, contrat, payoffs,
              timing) et le résoudre par <strong>backward induction</strong>.
            </li>
            <li>
              Calculer l'effort optimal de l'agent et le contrat optimal du principal dans{" "}
              <strong>3 types de contrats</strong> (fixe, proportionnel, linéaire).
            </li>
            <li>
              Manipuler les deux contraintes clés : <strong>participation (CP)</strong> et{" "}
              <strong>compatibilité aux incitants (CI)</strong>.
            </li>
            <li>
              Interpréter le résultat central : <strong>franchise</strong> +{" "}
              <strong>residual claimant</strong> = efficacité.
            </li>
            <li>
              Expliquer pourquoi tout change quand l'agent est{" "}
              <strong>averse au risque</strong>.
            </li>
          </ul>
        </Callout>

        <p className="text-[1.05rem]">
          Ce chapitre n'arrive pas de nulle part : il <em>recycle</em> presque tout ce qu'on a
          construit ensemble jusqu'ici. Si tu maîtrises les briques ci-dessous, B2 est surtout
          une question d'assemblage.
        </p>

        <Callout variant="intuition" title="🔗 Liens avec les chapitres précédents">
          <ul>
            <li>
              <strong>A1 — Préférences et choix :</strong> un individu rationnel{" "}
              <em>maximise son utilité</em>. Ici, le principal et l'agent font exactement ça,
              chacun de leur côté. Et comme en A1, on trouvera le maximum d'une fonction grâce à
              sa <em>dérivée</em> (la fameuse CPO).
            </li>
            <li>
              <strong>A2 — Décision intertemporelle :</strong> tu y as appris à écrire un
              problème de maximisation, à poser la condition de premier ordre et à interpréter
              « bénéfice marginal = coût marginal ». On refait exactement ce geste ici, deux
              fois par cas : une fois pour l'agent, une fois pour le principal.
            </li>
            <li>
              <strong>B1 — Jeux séquentiels :</strong> le chapitre précédent t'a donné la méthode
              de résolution (<em>backward induction</em>) et le concept de solution (<em>ENPS</em>).
              B2 est une <strong>application</strong> de B1 à un vrai problème d'entreprise.
            </li>
          </ul>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <TheoryRef chapter="a1" />
            <TheoryRef chapter="a2" />
            <TheoryRef chapter="b1" />
          </p>
        </Callout>

        <H4>La boîte à outils (4 rappels express)</H4>
        <VocabGrid
          items={[
            {
              term: (
                <>
                  Espérance <M tex="E(\cdot)" />
                </>
              ),
              body: (
                <>
                  La <em>moyenne</em> d'une variable aléatoire, pondérée par les probabilités.
                  Exemple : un dé équilibré a une espérance de 3,5. Dans ce chapitre, la seule
                  chose à retenir : le bruit <M tex="x" /> vaut <em>en moyenne</em> zéro, donc{" "}
                  <M tex="E(x) = 0" />, et on peut « l'effacer » dans tous les calculs
                  d'espérance.
                </>
              ),
            },
            {
              term: "CPO (condition de premier ordre)",
              body: (
                <>
                  Pour trouver le maximum d'une fonction « en cloche », on annule sa dérivée.
                  Les deux dérivées dont tu as besoin ici : la dérivée de <M tex="\beta e" /> par
                  rapport à <M tex="e" /> est <M tex="\beta" /> ; la dérivée de{" "}
                  <M tex="e^2/2" /> est <M tex="e" />. C'est tout !
                </>
              ),
            },
            {
              term: "Backward induction",
              body: (
                <>
                  Pour résoudre un jeu séquentiel, on commence par la <em>fin</em> : on trouve
                  d'abord ce que fera le <em>dernier</em> joueur (ici l'agent), puis on remonte au
                  premier joueur (le principal), qui anticipe cette réaction.
                </>
              ),
            },
            {
              term: "ENPS & efficacité de Pareto",
              body: (
                <>
                  L'<strong>ENPS</strong> (équilibre de Nash parfait en sous-jeux) est le profil
                  de stratégies obtenu par backward induction. Un résultat est{" "}
                  <strong>efficace au sens de Pareto</strong> s'il est impossible d'améliorer le
                  sort d'un joueur sans détériorer celui de l'autre.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§0)">
          <p>
            Savoir réciter la méthode :{" "}
            <strong>
              « jeu séquentiel ⇒ backward induction ⇒ on résout d'abord le joueur qui joue en
              dernier »
            </strong>
            . Dans tout ce chapitre, ça donne : <em>1) l'agent choisit son effort, 2) le
            principal choisit le contrat en anticipant</em>.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §1 — L'histoire du commercial                                 */}
      {/* ============================================================ */}
      <Section id="sec-histoire" kicker="§ 1" title="L'histoire du commercial">
        <p className="text-[1.1rem] leading-relaxed">
          Tout le chapitre repose sur une seule histoire. Prends le temps de bien la visualiser,
          car chaque équation qu'on écrira ensuite n'est qu'une traduction mathématique de cette
          situation.
        </p>

        <p>
          Une entreprise vend un logiciel. Elle veut embaucher un <strong>commercial</strong>{" "}
          pour démarcher des clients potentiels. Certains clients ont besoin du logiciel,
          d'autres non. Le nombre de licences vendues dépend donc de deux choses :
        </p>
        <ul>
          <li>
            <strong>l'effort</strong> du commercial — combien de clients il prend la peine de
            visiter ;
          </li>
          <li>
            <strong>la chance</strong> — parmi les clients visités, combien avaient réellement
            besoin du logiciel.
          </li>
        </ul>
        <p>
          L'entreprise voudrait qu'il visite un maximum de clients. Problème :{" "}
          <strong>elle ne peut pas contrôler le nombre de visites</strong>. Elle observe
          seulement le résultat final — le nombre de licences vendues. Et pour le commercial,
          chaque visite est un effort coûteux (du temps, de la fatigue, des refus...).
        </p>

        <PollIntuition />

        <H4>Le vocabulaire officiel</H4>
        <p>
          Cette histoire met en scène deux joueurs, avec des noms techniques à connaître par
          cœur :
        </p>
        <VocabGrid
          items={[
            {
              term: "Le principal",
              tag: "l'entreprise",
              tagTone: "principal",
              body: (
                <>
                  Celui qui <strong>embauche</strong> et qui <strong>propose le contrat</strong>.
                  Il confie une tâche qu'il ne peut pas (ou ne veut pas) faire lui-même. Ici :
                  l'entreprise de logiciels.
                </>
              ),
            },
            {
              term: "L'agent",
              tag: "le commercial",
              tagTone: "agent",
              body: (
                <>
                  Celui qui <strong>exécute la tâche</strong> et qui{" "}
                  <strong>choisit son effort</strong>. Son action est invisible pour le
                  principal. Ici : le commercial.
                </>
              ),
            },
            {
              term: "Information asymétrique",
              body: (
                <>
                  Une des deux parties en sait plus que l'autre. Ici, le principal n'observe{" "}
                  <em>ni</em> l'effort <M tex="e" /> <em>ni</em> la chance <M tex="x" />. Il
                  n'observe <strong>que le résultat <M tex="z" /></strong> (les ventes).
                  Conséquence capitale : le salaire ne peut dépendre <em>que</em> de{" "}
                  <M tex="z" />.
                </>
              ),
            },
            {
              term: "Problème de l'agence",
              body: (
                <>
                  Quand information asymétrique + intérêts mal alignés se combinent : l'agent,
                  incontrôlable, peut ne pas fournir l'effort souhaité, et l'efficacité en
                  souffre. S'il vend peu, il peut toujours prétendre : « j'ai fait plein de
                  visites, je n'ai pas eu de chance ! »
                </>
              ),
            },
            {
              term: "Aléa moral",
              body: (
                <>
                  Le nom donné à ce phénomène en entreprise : de{" "}
                  <strong>mauvais incitants</strong> conduisent à une{" "}
                  <strong>perte de bien-être</strong>. (Voir le piège de terminologie
                  ci-dessous !)
                </>
              ),
            },
            {
              term: "Théorie des contrats",
              body: (
                <>
                  La branche de l'économie qui étudie{" "}
                  <strong>comment concevoir les contrats</strong> pour atténuer au maximum les
                  pertes d'efficacité dues au problème de l'agence. C'est le programme de ce
                  chapitre.
                </>
              ),
            },
          ]}
        />

        <Callout variant="attention" title="⚠️ Piège classique d'examen — « aléa moral » ne parle pas de morale !">
          <p>
            La terminologie est <strong>trompeuse</strong>. Le problème d'aléa moral n'est{" "}
            <em>pas</em> que l'agent se comporte de façon moralement répréhensible. Le problème,
            c'est que de <strong>mauvais incitants</strong> peuvent entraîner une{" "}
            <strong>réduction de bien-être</strong>. L'agent qui ne fait aucun effort sous
            salaire fixe répond juste rationnellement aux incitants qu'on lui donne — le
            « coupable », c'est le contrat mal conçu.
          </p>
        </Callout>

        <Callout variant="intuition" title="💡 Pourquoi les intérêts sont-ils mal alignés ?">
          <p>
            L'effort de l'agent affecte l'utilité <em>des deux</em> joueurs, mais en sens
            opposés : pour le <strong className="text-rose-700">principal</strong>, l'effort est{" "}
            <strong>productif</strong> (plus de visites → plus de ventes attendues) ; pour l'
            <strong className="text-sky-700">agent</strong>, l'effort est <strong>coûteux</strong>{" "}
            (fatigue, temps). D'où le conflit : le principal rêve d'un effort maximal, l'agent
            d'un effort minimal. Le contrat sert à réconcilier les deux.
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q1"
          kicker="Quiz éclair · §1"
          question={
            <p>
              Un propriétaire confie son appartement à une agence immobilière chargée de le louer
              au meilleur prix. Qui est le principal, qui est l'agent ?
            </p>
          }
          options={[
            {
              text: <>L'agence est le principal, le propriétaire est l'agent.</>,
              explain: (
                <>
                  Presque ! C'est l'inverse : celui qui confie la tâche et « subit »
                  l'information asymétrique est le principal.
                </>
              ),
            },
            {
              text: <>Le propriétaire est le principal, l'agence est l'agent.</>,
              correct: true,
              explain: (
                <>
                  Exact ! Le propriétaire (principal) délègue une tâche à l'agence (agent) dont
                  il n'observe pas les efforts réels — combien de visites organise-t-elle
                  vraiment ? Le nom « agence » immobilière n'est d'ailleurs pas un hasard.
                </>
              ),
            },
            {
              text: <>Le locataire est le principal.</>,
              explain: (
                <>
                  Non — le locataire n'est pas partie au contrat de délégation. La relation
                  principal-agent lie celui qui délègue (propriétaire) et celui qui exécute
                  (agence).
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q2"
          kicker="Quiz éclair · §1"
          question={
            <p>
              Pourquoi, dans notre histoire, le salaire du commercial ne peut-il dépendre{" "}
              <em>que</em> du résultat <M tex="z" /> ?
            </p>
          }
          options={[
            {
              text: <>Parce que la loi interdit de payer à l'effort.</>,
              explain: (
                <>
                  Non : la loi n'a rien à voir ici. C'est une contrainte d'information, pas une
                  contrainte juridique.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que <M tex="z" /> est la seule variable que le principal observe :
                  impossible de conditionner un paiement sur quelque chose d'invisible.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement ! On ne peut écrire dans un contrat que des choses vérifiables. Le
                  principal n'observe ni <M tex="e" /> ni <M tex="x" /> — la seule variable
                  observée par tous est <M tex="z" />. Donc <M tex="w = w(z)" />, point.
                </>
              ),
            },
            {
              text: <>Parce que le résultat ne dépend pas de la chance.</>,
              explain: (
                <>
                  Attention : le résultat <M tex="z" /> contient justement une part de chance{" "}
                  <M tex="x" />. Si on pouvait isoler la chance, le problème disparaîtrait !
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§1)">
          <ul>
            <li>
              Identifier <strong>principal</strong> et <strong>agent</strong> dans n'importe quel
              exemple (médecin/patient, actionnaires/PDG, État/entreprise de travaux...).
            </li>
            <li>
              Expliquer la chaîne logique :{" "}
              <strong>
                information asymétrique + intérêts mal alignés ⇒ problème de l'agence ⇒ perte
                d'efficacité possible
              </strong>
              .
            </li>
            <li>
              Le sens exact d'<strong>aléa moral</strong> (mauvais incitants, pas mauvaise
              morale).
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §2 — Le modèle principal-agent                                */}
      {/* ============================================================ */}
      <Section id="sec-modele" kicker="§ 2" title="Le modèle principal-agent">
        <p className="text-[1.1rem] leading-relaxed">
          On traduit maintenant l'histoire en mathématiques. Le modèle a{" "}
          <strong>quatre ingrédients</strong> : une technologie, un contrat, des fonctions de
          payoff, et un timing. Avant tout, fais connaissance avec les cinq symboles du chapitre
          — chacun garde la même couleur dans toute la page.
        </p>

        <SymbolLegend />

        <H4>Ingrédient 1 — la technologie de production</H4>
        <p>La technologie relie le résultat aux deux forces de l'histoire (effort + chance) :</p>
        <FormulaBox
          tex="z = z(e,\,x) \qquad \text{et, par simplicité :} \qquad z = e + x"
          label="Technologie"
          caption={
            <>
              Lecture : <em>« les ventes = l'effort, plus ou moins un coup de chance »</em>.
            </>
          }
        />
        <p>
          Le bruit <M tex="x" /> est une variable aléatoire dont la valeur attendue est zéro :
        </p>
        <MB tex="E(x) \equiv \mathrm{VMA}(x) = 0" />
        <Callout variant="intuition" title="💡 Intuition sur E(x) = 0">
          <p>
            La chance est parfois bonne (<M tex="x > 0" /> : les clients visités avaient besoin
            du logiciel), parfois mauvaise (<M tex="x < 0" />), mais <em>en moyenne elle
            s'annule</em>. Conséquence pratique énorme :{" "}
            <strong>en espérance, seul l'effort compte</strong> —{" "}
            <M tex="E(z) = e + E(x) = e" />. Chaque fois que tu verras un <M tex="E(x)" /> dans
            un calcul, tu pourras le rayer.
          </p>
        </Callout>

        <H4>Ingrédient 2 — le contrat</H4>
        <p>
          Un contrat, c'est une règle de salaire <M tex="w = w(z)" /> qui dit combien l'agent
          touche pour chaque résultat. Par simplicité, on ne considère que des{" "}
          <strong>contrats linéaires</strong> :
        </p>
        <FormulaBox tex="w(z) = \alpha + \beta z" label="Contrat linéaire" />
        <ul>
          <li>
            <M tex="\alpha" /> est la <strong>composante fixe</strong> du salaire — ce que
            l'agent touche même si <M tex="z = 0" />. Pense au « fixe » d'un vendeur.
          </li>
          <li>
            <M tex="\beta" /> est le <strong>taux de bonus</strong> — la composante variable. Si{" "}
            <M tex="\beta = 0{,}2" />, l'agent touche 20 centimes par euro de résultat. Pense à
            une commission.
          </li>
        </ul>
        <p>
          Exemples réels : un fonctionnaire est proche de « <M tex="\alpha" /> seul », un agent
          immobilier payé à la commission est proche de « <M tex="\beta z" /> seul », beaucoup de
          commerciaux ont un mix des deux.
        </p>

        <H4>Ingrédient 3 — les fonctions de payoff</H4>
        <p>
          Les deux joueurs sont (pour commencer) <strong>neutres au risque</strong> : ils ne
          s'intéressent qu'aux <em>espérances</em>, sans prime pour la sécurité.
        </p>
        <FormulaBox
          tex="\text{Principal : } U_p = E(z - w) \qquad\cdot\qquad \text{Agent : } U_a = E(w - c)"
          label="Payoffs"
          caption={
            <>
              Lecture : le principal garde <em>le résultat moins le salaire</em> (son profit) ;
              l'agent garde <em>le salaire moins le coût de son effort</em>.
            </>
          }
        />
        <p>Ce coût est supposé quadratique :</p>
        <MB tex="c(e) = \frac{e^2}{2}" />
        <Callout variant="intuition" title="💡 Pourquoi un coût quadratique ?">
          <p>
            Parce qu'il capte une idée réaliste :{" "}
            <strong>chaque visite supplémentaire coûte de plus en plus cher</strong>. La dérivée
            de <M tex="e^2/2" /> est <M tex="e" /> : le <em>coût marginal</em> de l'effort
            augmente avec l'effort. La 1<sup>re</sup> visite de la journée est facile, la 15
            <sup>e</sup> est épuisante. (Même logique de convexité que dans les chapitres
            précédents.)
          </p>
        </Callout>

        <H4>Ingrédient 4 — le timing du jeu</H4>
        <p>
          C'est ici que B1 entre en scène : nous avons un <strong>jeu séquentiel</strong> en
          trois temps.
        </p>

        <GameTreeTimeline />

        <Callout variant="definition" title="📖 Le timing, officiellement">
          <ul>
            <li>
              <strong>1.</strong> Le principal propose à l'agent un contrat <M tex="w(z)" />.
            </li>
            <li>
              <strong>2.</strong> L'agent décide d'<strong>accepter ou de refuser</strong> le
              contrat.
            </li>
            <li>
              <strong>3.</strong> S'il refuse, il obtient une utilité par défaut{" "}
              <M tex="\tilde{u}" /> (on supposera <M tex="\tilde{u} = 0" /> : par exemple, la
              valeur de sa meilleure alternative). S'il accepte, il choisit son niveau d'effort{" "}
              <M tex="e" />, et le bruit <M tex="x" /> est tiré au sort.
            </li>
          </ul>
          <p>
            Parce qu'il joue en <strong>premier</strong>, le principal peut affecter le
            comportement de l'agent en concevant le contrat de manière à inciter le niveau
            d'effort optimal. Pour chaque type de contrat, on cherchera l'<strong>ENPS</strong>{" "}
            par <strong>backward induction</strong> : d'abord la meilleure réponse de l'agent
            (étape 3), puis le choix du principal (étape 1).
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q3"
          kicker="Quiz éclair · §2"
          question={
            <p>
              Avec la technologie <M tex="z = e + x" /> et <M tex="E(x) = 0" />, que vaut le
              résultat <em>espéré</em> <M tex="E(z)" /> si l'agent fournit un effort{" "}
              <M tex="e = 0{,}8" /> ?
            </p>
          }
          options={[
            {
              text: <M tex="E(z) = 1{,}6" />,
              explain: (
                <>
                  Non — tu as peut-être ajouté un <M tex="x" /> « moyen » positif. Or la chance
                  est nulle en moyenne : <M tex="E(z) = e + E(x) = e" />.
                </>
              ),
            },
            {
              text: <M tex="E(z) = 0{,}8" />,
              correct: true,
              explain: (
                <>
                  Parfait : <M tex="E(z) = E(e + x) = e + E(x) = 0{,}8 + 0 = 0{,}8" />. En
                  espérance, seul l'effort compte — réflexe à automatiser pour tous les calculs
                  du chapitre.
                </>
              ),
            },
            {
              text: (
                <>
                  Impossible à dire, <M tex="z" /> est aléatoire.
                </>
              ),
              explain: (
                <>
                  Non : <M tex="z" /> est aléatoire, mais son espérance est parfaitement
                  déterminée par l'effort, car <M tex="E(x) = 0" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q4"
          kicker="Quiz éclair · §2"
          question={
            <p>
              Dans le contrat <M tex="w(z) = \alpha + \beta z" />, quel paramètre correspond à
              « une commission de 30 % sur les ventes » ?
            </p>
          }
          options={[
            {
              text: <M tex="\alpha = 0{,}3" />,
              explain: (
                <>
                  Non : <M tex="\alpha" /> est la partie fixe, touchée quel que soit le résultat.
                  Une commission varie avec les ventes.
                </>
              ),
            },
            {
              text: <M tex="\beta = 0{,}3" />,
              correct: true,
              explain: (
                <>
                  Oui ! <M tex="\beta" /> est le taux de bonus : <M tex="\beta = 0{,}3" />{" "}
                  signifie que chaque euro de résultat rapporte 30 centimes à l'agent.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§2)">
          <ul>
            <li>
              Écrire de mémoire les 4 ingrédients : <M tex="z = e + x" /> avec{" "}
              <M tex="E(x) = 0" /> ; <M tex="w = \alpha + \beta z" /> ;{" "}
              <M tex="U_p = E(z - w)" />, <M tex="U_a = E(w - c)" /> avec{" "}
              <M tex="c = e^2/2" /> ; le timing en 3 étapes.
            </li>
            <li>
              Savoir <em>justifier</em> chaque hypothèse en une phrase (pourquoi{" "}
              <M tex="E(x) = 0" />, pourquoi le coût est convexe, pourquoi <M tex="w" /> ne
              dépend que de <M tex="z" />).
            </li>
            <li>
              Comprendre que le principal, en jouant en premier,{" "}
              <strong>choisit le contrat en anticipant la réaction de l'agent</strong>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §3 — Cas 1 : le salaire fixe                                  */}
      {/* ============================================================ */}
      <Section
        id="sec-cas1"
        kicker="§ 3"
        title={
          <>
            Cas 1 — le salaire fixe : <M tex="w(z) = \alpha" />
          </>
        }
      >
        <p className="text-[1.1rem] leading-relaxed">
          Premier contrat candidat, le plus simple du monde : un salaire fixe, identique quel que
          soit le résultat. Si l'agent refuse le contrat, il obtient son utilité par défaut{" "}
          <M tex="\tilde{u} = 0" />. Résolvons par backward induction — donc{" "}
          <strong>l'agent d'abord</strong>.
        </p>

        <H4>Étape A — le problème de l'agent (on résout la fin du jeu)</H4>
        <p>
          L'agent qui a accepté le contrat cherche l'effort qui maximise son utilité espérée :
        </p>
        <MB tex="\max_{e} \; E(w - c)" />
        <Steps
          items={[
            <>
              <p>
                <strong>On remplace</strong> <M tex="w" /> par <M tex="\alpha" /> et{" "}
                <M tex="c" /> par <M tex="e^2/2" /> :
              </p>
              <MB tex="E(w - c) = E\!\left(\alpha - \frac{e^2}{2}\right) = \alpha - \frac{e^2}{2}" />
              <p>
                (L'espérance disparaît : il n'y a plus rien d'aléatoire là-dedans — le salaire
                fixe ne dépend même pas de <M tex="z" /> !)
              </p>
            </>,
            <>
              <p>
                <strong>CPO</strong> : on dérive par rapport à <M tex="e" /> et on annule. La
                dérivée de <M tex="\alpha" /> est 0 (c'est une constante pour l'agent), celle de{" "}
                <M tex="e^2/2" /> est <M tex="e" /> :
              </p>
              <MB tex="\frac{\partial E(w - c)}{\partial e} = -e = 0 \;\;\Rightarrow\;\; \boxed{e^* = 0}" />
            </>,
            <>
              <p>
                <strong>Interprétation</strong> : payé pareil quoi qu'il arrive, l'agent n'a{" "}
                <em>aucune raison</em> de subir le coût d'un effort. Sa meilleure réponse est{" "}
                <M tex="e^*(\alpha) = 0" /> — <em>quel que soit</em> le montant du fixe !
                Doubler le salaire fixe ne crée pas un gramme d'effort en plus.
              </p>
            </>,
          ]}
        />

        <H4>Étape B — le problème du principal (on remonte l'arbre)</H4>
        <p>
          Le principal <strong>anticipe</strong> la meilleure réponse{" "}
          <M tex="e^*(\alpha) = 0" /> et choisit <M tex="\alpha" /> pour maximiser son profit
          attendu :
        </p>
        <Steps
          items={[
            <>
              <MB tex="\max_{\alpha} \; E(z - w) = e^*(\alpha) + E(x) - w(\alpha) = 0 + 0 - \alpha" />
              <p>
                Le profit attendu vaut simplement <M tex="-\alpha" /> : chaque euro de fixe est
                un euro perdu, sans effort en retour.
              </p>
            </>,
            <>
              <p>
                <strong>Solution</strong> : le principal pousse <M tex="\alpha" /> aussi bas que
                possible. Un salaire négatif inciterait l'agent à refuser le contrat (il aurait
                moins que son utilité par défaut <M tex="\tilde{u} = 0" />), donc :
              </p>
              <MB tex="\boxed{\alpha^* = 0}" />
            </>,
          ]}
        />

        <Callout variant="definition" title="📖 Résultat du Cas 1">
          <p>
            L'ENPS est <M tex="(s_p^*,\, s_a^*) = (\alpha^* = 0,\; e^*(\alpha) = 0)" /> : le
            principal paie un salaire nul et l'agent ne fait aucun effort (s'il accepte). Les
            payoffs : <M tex="U_p = 0" /> et <M tex="U_a = 0" />.{" "}
            <strong>Aucune valeur n'est créée.</strong> C'est exactement le problème d'aléa moral
            à l'état pur : le contrat fixe ne donne <em>pas d'incitant à l'effort</em>.
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q5"
          kicker="Quiz éclair · §3"
          question={
            <p>
              Sous salaire fixe, si le principal proposait un fixe généreux{" "}
              <M tex="\alpha = 100" /> au lieu de 0, l'effort optimal de l'agent serait...
            </p>
          }
          options={[
            {
              text: <>plus élevé — on est plus motivé quand on est bien payé.</>,
              explain: (
                <>
                  Non ! C'est LE piège. Relis l'étape A : la dérivée de <M tex="\alpha" /> par
                  rapport à <M tex="e" /> est nulle. Le fixe ne figure pas dans l'arbitrage
                  marginal de l'agent.
                </>
              ),
            },
            {
              text: (
                <>
                  toujours <M tex="e^* = 0" /> : le fixe ne crée aucun incitant marginal.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : <M tex="e^* = 0" /> quel que soit <M tex="\alpha" />. La CPO donne{" "}
                  <M tex="-e = 0" /> dans tous les cas. Un fixe généreux transfère de l'argent,
                  mais ne change pas les incitants marginaux (dans ce modèle d'agent purement
                  intéressé).
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§3)">
          <p>
            La résolution complète du Cas 1 en 4 lignes, et surtout sa morale :{" "}
            <strong>un paiement qui ne varie pas avec le résultat n'incite à rien</strong>. Ce
            qui motive l'effort, ce n'est jamais le niveau du salaire, c'est sa{" "}
            <em>sensibilité au résultat</em>.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §4 — Cas 2 : le salaire proportionnel                         */}
      {/* ============================================================ */}
      <Section
        id="sec-cas2"
        kicker="§ 4"
        title={
          <>
            Cas 2 — le salaire proportionnel : <M tex="w(z) = \beta z" />
          </>
        }
      >
        <p className="text-[1.1rem] leading-relaxed">
          Deuxième idée : payer à la commission pure. Pas de fixe, mais chaque euro de résultat
          rapporte <M tex="\beta" /> à l'agent. Cette fois, l'effort de l'agent{" "}
          <em>affecte son propre salaire</em> — voyons ce que ça change.
        </p>

        <H4>Étape A — le problème de l'agent</H4>
        <Steps
          items={[
            <>
              <p>
                <strong>On développe</strong> l'utilité espérée en remplaçant{" "}
                <M tex="w = \beta z" /> puis <M tex="z = e + x" /> :
              </p>
              <MB tex="E(w - c) = E\!\left(\beta z - \frac{e^2}{2}\right) = \beta e + \beta E(x) - \frac{e^2}{2} = \beta e - \frac{e^2}{2}" />
            </>,
            <>
              <p>
                <strong>CPO</strong> : dérivée par rapport à <M tex="e" />, annulée :
              </p>
              <MB tex="\frac{\partial E(w - c)}{\partial e} = \beta - e = 0 \;\;\Rightarrow\;\; \boxed{e^* = \beta}" />
            </>,
            <>
              <p>
                <strong>Lecture marginale</strong> (le réflexe hérité de A2) : une visite de plus
                rapporte <M tex="\beta" /> (le bonus sur la vente attendue) et coûte{" "}
                <M tex="e" /> (le coût marginal, croissant). L'agent augmente son effort tant que{" "}
                <M tex="\beta > e" />, et s'arrête pile quand{" "}
                <strong>bénéfice marginal = coût marginal</strong>. Plus la commission est forte,
                plus il travaille : la meilleure réponse <M tex="e^*(\beta) = \beta" /> est
                croissante en <M tex="\beta" />.
              </p>
            </>,
          ]}
        />

        <EffortExplorer />

        <H4>Étape B — le problème du principal</H4>
        <p>
          Le principal anticipe <M tex="e^*(\beta) = \beta" /> et choisit <M tex="\beta" /> pour
          maximiser son profit attendu :
        </p>
        <Steps
          items={[
            <>
              <MB tex="E(z - w) = E(z) - \beta E(z) = (1 - \beta)\cdot e^*(\beta) = (1 - \beta)\beta = \beta - \beta^2" />
              <p>
                Lecture : le principal garde une fraction <M tex="(1 - \beta)" /> du résultat, et
                le résultat espéré vaut <M tex="e^* = \beta" />. D'où le <strong>dilemme</strong>{" "}
                : augmenter <M tex="\beta" /> stimule l'effort (le gâteau grossit) mais réduit la
                part que le principal garde.
              </p>
            </>,
            <>
              <p>
                <strong>CPO</strong> par rapport à <M tex="\beta" /> :
              </p>
              <MB tex="\frac{\partial E(z - w)}{\partial \beta} = 1 - 2\beta = 0 \;\;\Rightarrow\;\; \boxed{\beta^* = 1/2}" />
            </>,
            <>
              <p>
                <strong>Payoffs à l'ENPS</strong> <M tex="(\beta^* = 1/2,\; e^* = 1/2)" /> : le
                principal paie la moitié du résultat.
              </p>
              <MB tex="U_p = 0{,}5 - 0{,}25 = \mathbf{0{,}25} \qquad\cdot\qquad U_a = 0{,}25 - \frac{(0{,}5)^2}{2} = \mathbf{0{,}125}" />
            </>,
          ]}
        />

        <H4>Ce résultat est-il efficace au sens de Pareto ? Non !</H4>
        <p>
          C'est la question posée dans le cours, et la réponse est étonnante. Comparons avec un
          autre résultat, techniquement faisable : <M tex="e = 1" />,{" "}
          <M tex="\alpha = 0{,}7" /> et <M tex="\beta = 0" />. Les payoffs seraient :
        </p>
        <MB tex="U_p = 1 - 0{,}7 = \mathbf{0{,}3} \;\; (> 0{,}25) \qquad\cdot\qquad U_a = 0{,}7 - \frac{1^2}{2} = \mathbf{0{,}2} \;\; (> 0{,}125)" />
        <p>
          <strong>Les deux joueurs préfèrent ce résultat-là !</strong> L'ENPS du Cas 2 n'est donc
          pas efficace au sens de Pareto : on laisse de la valeur sur la table.
        </p>

        <Callout variant="attention" title="⚠️ Alors pourquoi ce « meilleur monde » est-il inaccessible ?">
          <p>
            Parce qu'il n'est <strong>pas stable</strong>, étant donné le contrôle imparfait du
            principal sur l'agent. Il n'est pas <strong>compatible aux incitants</strong>{" "}
            (« incentive compatible ») : face au contrat <M tex="\alpha = 0{,}7" />,{" "}
            <M tex="\beta = 0" />, la meilleure réponse de l'agent n'est pas{" "}
            <M tex="e = 1" />... c'est <M tex="e = 0" /> (on est revenu au salaire fixe du
            Cas 1 !). L'agent empocherait les 0,7 et resterait chez lui. Un contrat ne peut
            exiger que ce que l'agent a <em>lui-même intérêt</em> à faire — c'est toute la
            difficulté du problème.
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q6"
          kicker="Quiz éclair · §4"
          question={
            <p>
              Avec un coût d'effort <M tex="c(e) = e^2/2" /> et un contrat <M tex="w = 2z" />{" "}
              (commission de 200 % !), quel effort l'agent choisit-il ?
            </p>
          }
          options={[
            {
              text: <M tex="e^* = 1" />,
              explain: (
                <>
                  Non — relis la meilleure réponse : <M tex="e^* = \beta" />, la CPO donne{" "}
                  <M tex="\beta - e = 0" />.
                </>
              ),
            },
            {
              text: <M tex="e^* = 2" />,
              correct: true,
              explain: (
                <>
                  Oui : <M tex="e^* = \beta = 2" />. La règle <M tex="e^* = \beta" /> s'applique
                  pour tout <M tex="\beta" />. (On verra qu'un <M tex="\beta" /> si élevé n'est
                  pas dans l'intérêt du principal, mais l'agent, lui, répond mécaniquement aux
                  incitants.)
                </>
              ),
            },
            {
              text: <M tex="e^* = 1/2" />,
              explain: (
                <>
                  Non : 1/2 est le <M tex="\beta" /> optimal choisi par le principal dans le
                  Cas 2, pas la réponse de l'agent à <M tex="\beta = 2" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q7"
          kicker="Quiz éclair · §4"
          question={
            <p>
              Que signifie exactement « le résultat{" "}
              <M tex="(e = 1,\; \alpha = 0{,}7,\; \beta = 0)" /> n'est pas compatible aux
              incitants » ?
            </p>
          }
          options={[
            {
              text: <>Qu'il est techniquement impossible à réaliser.</>,
              explain: (
                <>
                  Non, il est techniquement faisable — c'est justement ce qui rend la situation
                  frustrante. Le problème est ailleurs.
                </>
              ),
            },
            {
              text: (
                <>
                  Que l'effort <M tex="e = 1" /> n'est pas la meilleure réponse de l'agent à ce
                  contrat : il dévierait.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : <M tex="e = 1" /> n'est pas une meilleure réponse à{" "}
                  <M tex="(\alpha = 0{,}7,\; \beta = 0)" />. Si on lui propose ce contrat,
                  l'agent dévie vers <M tex="e = 0" />. « Incentive compatible » = l'action
                  prescrite est bien la meilleure réponse de l'agent au contrat.
                </>
              ),
            },
            {
              text: <>Que l'agent refuserait de signer ce contrat.</>,
              explain: (
                <>
                  Non — la contrainte de participation, elle, serait largement satisfaite (
                  <M tex="U_a = 0{,}2 > 0" />). C'est l'autre contrainte qui casse.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§4)">
          <ul>
            <li>
              Le calcul complet : <M tex="e^* = \beta" /> (agent), puis{" "}
              <M tex="\beta^* = 1/2" /> (principal), payoffs (0,25 ; 0,125).
            </li>
            <li>
              Montrer que ce résultat <strong>n'est pas Pareto-efficace</strong> à l'aide du
              contre-exemple <M tex="(e = 1,\; \alpha = 0{,}7,\; \beta = 0)" /> → (0,3 ; 0,2).
            </li>
            <li>
              Définir « <strong>compatible aux incitants</strong> » et expliquer pourquoi le
              contre-exemple ne l'est pas.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §5 — Cas 3 : le salaire linéaire                              */}
      {/* ============================================================ */}
      <Section
        id="sec-cas3"
        kicker="§ 5"
        title={
          <>
            Cas 3 — le salaire linéaire : <M tex="w(z) = \alpha + \beta z" />
          </>
        }
      >
        <p className="text-[1.1rem] leading-relaxed">
          On combine maintenant les deux leviers : un fixe <M tex="\alpha" /> <em>et</em> un
          bonus <M tex="\beta" />. L'explorateur de la section 4 t'a soufflé la stratégie
          gagnante : <strong><M tex="\beta" /> pilote l'effort, <M tex="\alpha" /> partage
          l'argent</strong>. Deux leviers, deux missions. C'est ici que le chapitre atteint son
          sommet.
        </p>

        <H4>Étape A — le problème de l'agent (rien de neuf !)</H4>
        <Steps
          items={[
            <>
              <MB tex="E(w - c) = E\!\left(\alpha + \beta z - \frac{e^2}{2}\right) = \alpha + \beta e - \frac{e^2}{2}" />
            </>,
            <>
              <p>
                <strong>CPO</strong> : <M tex="\alpha" /> disparaît en dérivant (c'est une
                constante !) et on retrouve :
              </p>
              <MB tex="\beta - e = 0 \;\;\Rightarrow\;\; \boxed{e^*(\alpha, \beta) = \beta}" />
              <p>
                Confirmation mathématique de ce que l'explorateur montrait : le fixe n'influence
                pas l'effort, seul le bonus compte.
              </p>
            </>,
          ]}
        />

        <H4>Étape B — le problème du principal, version complète</H4>
        <p>
          Le principal maximise son profit attendu <strong>sous deux contraintes</strong>. C'est
          LA structure à retenir de tout le chapitre :
        </p>
        <MB tex="\max_{\alpha,\,\beta} \; E(z - w)" />
        <VocabGrid
          items={[
            {
              term: "Contrainte de participation (CP)",
              body: (
                <>
                  <MB tex="E(w - c) \ge \tilde{u}" />
                  « Le contrat doit donner à l'agent <strong>au moins autant</strong> que sa
                  meilleure alternative <M tex="\tilde{u}" />, sinon il refuse de signer. » C'est
                  la contrainte de l'étape ② de l'arbre. (Remarque du cours : elle était
                  satisfaite dans les cas 1 et 2.)
                </>
              ),
            },
            {
              term: "Contrainte de compatibilité aux incitants (CI)",
              body: (
                <>
                  <MB tex="e^*(\alpha, \beta) = \beta" />
                  « Le principal ne peut pas <em>décréter</em> l'effort : il doit prendre la
                  réaction de l'agent comme une donnée. » C'est la contrainte de l'étape ③ — la
                  meilleure réponse calculée à l'étape A.
                </>
              ),
            },
          ]}
        />

        <Callout variant="intuition" title="💡 L'astuce décisive : saturer la CP">
          <p>
            À l'optimum, le principal choisit le contrat pour que la CP soit satisfaite{" "}
            <strong>de justesse</strong> : l'agent obtient <em>exactement</em>{" "}
            <M tex="\tilde{u} = 0" />, pas un centime de plus. Pourquoi ? Si l'agent gardait un
            surplus, le principal pourrait baisser <M tex="\alpha" /> d'un chouïa : l'agent
            signerait toujours (il reste au-dessus de <M tex="\tilde{u}" />), l'effort ne
            bougerait pas (il ne dépend que de <M tex="\beta" />), et le principal gagnerait
            plus. Donc tout surplus laissé à l'agent est un « gaspillage » du point de vue du
            principal.
          </p>
        </Callout>

        <Steps
          items={[
            <>
              <p>
                <strong>CP saturée</strong> : on écrit <M tex="E(w - c) = 0" /> et on isole{" "}
                <M tex="\alpha" /> :
              </p>
              <MB tex="E(\alpha + \beta z) = c(e) \;\;\Rightarrow\;\; \alpha = \frac{e^2}{2} - \beta e" />
              <p>
                La CP <em>lie</em> les valeurs optimales de <M tex="\alpha" /> et{" "}
                <M tex="\beta" /> : une fois <M tex="\beta" /> choisi, <M tex="\alpha" /> est
                automatique. On peut donc remplacer <M tex="\alpha" /> dans l'objectif du
                principal, qui ne maximise plus que par rapport à <M tex="\beta" />.
              </p>
            </>,
            <>
              <p>
                <strong>Substitution</strong> dans le profit du principal :
              </p>
              <MB tex="E(z - w) = E\big(e + x - (\alpha + \beta(e + x))\big) = e - \left(\frac{e^2}{2} - \beta e\right) - \beta e = e - \frac{e^2}{2}" />
              <p>
                Résultat remarquable : tous les <M tex="\beta e" /> se compensent ! Le profit du
                principal devient... <strong>le surplus total de la relation</strong> : la valeur
                créée (<M tex="e" />) moins le coût de l'effort (<M tex="e^2/2" />). Logique :
                puisque la CP saturée donne exactement 0 à l'agent, le principal empoche{" "}
                <em>tout le gâteau</em> — il a donc intérêt à ce que le gâteau soit le plus gros
                possible.
              </p>
            </>,
            <>
              <p>
                <strong>CI injectée</strong> (<M tex="e = \beta" />), puis CPO sur{" "}
                <M tex="\beta" /> :
              </p>
              <MB tex="E(z - w) = \beta - \frac{\beta^2}{2} \;\;\Rightarrow\;\; 1 - \beta = 0 \;\;\Rightarrow\;\; \boxed{\beta^* = 1}" />
            </>,
            <>
              <p>
                <strong>On récupère <M tex="\alpha^*" /></strong> avec la CP (en utilisant{" "}
                <M tex="e = \beta = 1" />) :
              </p>
              <MB tex="\alpha^* = \frac{e^2}{2} - \beta^* e = \frac{\beta^2}{2} - \beta^2 = \boxed{-0{,}5}" />
              <p>
                Un fixe... <strong>négatif</strong> ! L'ENPS est{" "}
                <M tex="(s_p^*,\, s_a^*) = (w^*(z) = -0{,}5 + z,\; e^*(w) = \beta)" />.
              </p>
            </>,
            <>
              <p>
                <strong>Payoffs à l'ENPS</strong> :
              </p>
              <MB tex="U_p = 1 - (-0{,}5 + 1) = \mathbf{0{,}5} \qquad\cdot\qquad U_a = -0{,}5 + 1 - \frac{1^2}{2} = \mathbf{0}" />
            </>,
          ]}
        />

        <H4>
          Le gâteau — pourquoi <M tex="e = 1" /> est « le bon » effort
        </H4>
        <p>
          Le surplus total de la relation, <M tex="S(e) = e - e^2/2" />, ne dépend <em>que</em>{" "}
          de l'effort — <M tex="\alpha" /> et <M tex="\beta" /> ne font que le répartir. Il
          culmine en <M tex="e = 1" /> (là où bénéfice marginal 1 = coût marginal{" "}
          <M tex="e" />), avec un gâteau maximal de 0,5 :
        </p>

        <SurplusExplorer />

        <H4>L'interprétation vedette : la franchise et le « residual claimant »</H4>
        <Callout variant="definition" title="📖 Que signifie ce contrat étrange (α = −0,5, β = 1) ?">
          <p>
            Ce contrat est tel que <strong>l'agent paie une franchise</strong> (
            <M tex="\alpha = -0{,}5" />) au principal et devient{" "}
            <strong>le seul propriétaire du résultat de ses efforts</strong> (
            <em>residual claimant</em>, « créancier résiduel »). En d'autres termes : une fois la
            franchise acquittée, l'agent garde tout le résultat <M tex="z" /> (car{" "}
            <M tex="\beta = 1" />).
          </p>
          <ul>
            <li>
              Le taux de bonus <M tex="\beta = 1" /> fait que l'agent garde 100 % du fruit de
              ses efforts → il <strong>internalise</strong> parfaitement le bénéfice de chaque
              visite → il choisit l'effort efficace <M tex="e = 1" />. Ses intérêts sont
              désormais <em>parfaitement alignés</em> avec la création de valeur.
            </li>
            <li>
              La franchise <M tex="\alpha = -0{,}5" /> est fixée par le principal de manière à{" "}
              <strong>extraire tout le surplus</strong> de leur association (
              <M tex="U_a = \tilde{u}" />). C'est le « prix d'entrée » pour devenir propriétaire
              du résultat.
            </li>
          </ul>
          <p>
            <strong>Exemple du cours : la licence de taxi.</strong> Le chauffeur paie une somme
            fixe pour sa licence (ou la location du véhicule), puis garde l'intégralité de ses
            recettes. Autres exemples de la vraie vie : la franchise McDonald's (le franchisé
            paie une redevance et garde les profits du restaurant), le salon de coiffure qui loue
            ses fauteuils à des coiffeurs indépendants.
          </p>
        </Callout>

        <p>
          Et le verdict d'efficacité tombe :{" "}
          <strong>le résultat est efficace au sens de Pareto</strong> — il n'existe aucun autre
          résultat techniquement faisable qui rende les deux joueurs plus satisfaits.
          Contrairement au Cas 2, plus rien n'est laissé sur la table.
        </p>

        <ContractLab />

        <Quiz
          scope="b2"
          id="q8"
          kicker="Quiz éclair · §5"
          question={
            <p>
              Pourquoi le principal choisit-il de saturer la contrainte de participation (donner
              exactement <M tex="\tilde{u} = 0" /> à l'agent) ?
            </p>
          }
          options={[
            {
              text: <>Parce que la CI l'y oblige.</>,
              explain: (
                <>
                  Non — la CI est une équation (la réaction de l'agent), elle est prise en
                  compte, pas « saturée » au sens d'un choix. C'est la CP, une inégalité, que le
                  principal ajuste au plus juste.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que tout euro laissé à l'agent au-delà de <M tex="\tilde{u}" /> est un
                  euro que le principal aurait pu récupérer via <M tex="\alpha" /> sans rien
                  changer d'autre.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact. Tout surplus laissé à l'agent pourrait être récupéré en baissant{" "}
                  <M tex="\alpha" />, sans changer ni l'acceptation ni l'effort (qui ne dépend
                  que de <M tex="\beta" />). Le principal ajuste donc <M tex="\alpha" /> pour que{" "}
                  <M tex="E(w - c) = \tilde{u}" /> pile.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que baisser <M tex="\alpha" /> augmenterait l'effort de l'agent.
                </>
              ),
              explain: (
                <>
                  Attention : c'est l'inverse ! Baisser <M tex="\alpha" /> ne réduit pas l'effort
                  (<M tex="e^* = \beta" /> ne dépend pas de <M tex="\alpha" />). C'est justement
                  pour ça que l'extraction est « gratuite » pour le principal.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q9"
          kicker="Quiz éclair · §5"
          question={
            <p>
              Un chauffeur de taxi loue son véhicule 90 € par jour et garde toutes ses recettes.
              Dans notre modèle, cela correspond à...
            </p>
          }
          options={[
            {
              text: (
                <>
                  <M tex="\alpha < 0" /> et <M tex="\beta = 1" /> : franchise + residual
                  claimant.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Parfait : la location = franchise = <M tex="\alpha" /> négatif ; « garde toutes
                  ses recettes » = <M tex="\beta = 1" /> = residual claimant. C'est le contrat
                  optimal du Cas 3 en chair et en os.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\alpha > 0" /> et <M tex="\beta = 0" /> : salaire fixe.
                </>
              ),
              explain: (
                <>
                  Non : un <M tex="\beta = 0" /> signifierait que ses recettes ne lui rapportent
                  rien — c'est le contraire de « garde toutes ses recettes ».
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\alpha < 0" /> et <M tex="\beta = 1/2" />.
                </>
              ),
              explain: (
                <>
                  Pas tout à fait : <M tex="\beta = 1/2" /> voudrait dire qu'il reverse la moitié
                  de chaque course. Ici il garde tout, après la location fixe.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§5)">
          <ul>
            <li>
              Énoncer <strong>CP</strong> et <strong>CI</strong> avec leurs formules <em>et</em>{" "}
              leur signification en français.
            </li>
            <li>
              Refaire la résolution complète : saturer la CP → isoler <M tex="\alpha" /> →
              substituer → l'objectif devient le surplus total <M tex="e - e^2/2" /> → injecter
              la CI → <M tex="\beta^* = 1" />, <M tex="\alpha^* = -0{,}5" />.
            </li>
            <li>
              Interpréter : <strong>franchise</strong>, <strong>residual claimant</strong>,
              exemple de la licence de taxi, et le verdict « <strong>Pareto-efficace</strong> ».
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §6 — Vue d'ensemble                                           */}
      {/* ============================================================ */}
      <Section id="sec-recap" kicker="§ 6" title="Vue d'ensemble — les trois contrats côte à côte">
        <p className="text-[1.1rem] leading-relaxed">
          Voici le tableau résumé du cours — à savoir reconstruire de tête à l'examen —
          accompagné de sa version graphique.
        </p>

        <Tbl
          head={[
            "Cas",
            <M key="w" tex="w" />,
            "Effort optimal",
            "Salaire optimal",
            <M key="up" tex="U_p" />,
            <M key="ua" tex="U_a" />,
          ]}
          rows={[
            [
              "Salaire fixe",
              <M key="1" tex="w = \alpha" />,
              <M key="2" tex="e^* = 0" />,
              <M key="3" tex="\alpha^* = 0" />,
              "0",
              "0",
            ],
            [
              "Salaire prop.",
              <M key="1" tex="w = \beta z" />,
              <M key="2" tex="e^* = \beta" />,
              <M key="3" tex="\beta^* = 0{,}5" />,
              "0,25",
              "0,125",
            ],
            [
              "Salaire lin.",
              <M key="1" tex="w = \alpha + \beta z" />,
              <M key="2" tex="e^* = \beta" />,
              <Hl key="3">
                <M tex="\alpha^* = -0{,}5,\; \beta^* = 1" />
              </Hl>,
              <Hl key="4">0,5</Hl>,
              "0",
            ],
          ]}
        />

        <PayoffComparison />

        <Callout variant="retiens" title="⭐ La conclusion officielle du cours (agent neutre au risque)">
          <p>
            Lorsque l'agent est neutre au risque,{" "}
            <strong>
              le contrat linéaire optimal permet au principal d'atteindre le même profit attendu
              que dans le cas d'information parfaite
            </strong>{" "}
            (0,5). Autrement dit : avec un agent neutre au risque, l'asymétrie d'information ne
            coûte <em>rien</em> — le contrat franchise la neutralise complètement.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Le détail qui tue à l'examen : qui porte le risque ?">
          <p>
            Ce contrat optimal <strong>transfère tout le risque</strong> (lié à <M tex="x" />){" "}
            <strong>sur l'agent</strong> :
          </p>
          <ul>
            <li>
              Le principal reçoit <M tex="z - w = z - (-0{,}5 + z) = 0{,}5" />{" "}
              <em>quoi qu'il arrive</em> : aucune incertitude, la chance <M tex="x" /> s'annule
              dans son profit.
            </li>
            <li>
              L'agent a <M tex="U_a = 0" /> <em>en espérance</em>, mais son utilité{" "}
              <em>réalisée</em> <M tex="w - c = x" /> peut être différente de 0 si{" "}
              <M tex="x \neq 0" /> : bonne année, il gagne ; mauvaise année, il <em>perd</em> de
              l'argent (il a quand même payé la franchise !).
            </li>
          </ul>
          <p>
            Tant que l'agent est neutre au risque, ça lui est égal. Mais tu sens venir la
            suite... que se passe-t-il s'il <em>déteste</em> le risque ? C'est la section 7.
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q10"
          kicker="Quiz éclair · §6"
          question={
            <p>
              Dans le Cas 3, une mauvaise année où <M tex="x = -0{,}3" />, le profit{" "}
              <em>réalisé</em> du principal est...
            </p>
          }
          options={[
            {
              text: <>0,2 : la malchance ampute son profit.</>,
              explain: (
                <>
                  Non — refais le calcul : <M tex="z - w = z - (-0{,}5 + z)" />. Les{" "}
                  <M tex="z" /> s'annulent, le <M tex="x" /> aussi !
                </>
              ),
            },
            {
              text: <>0,5 : exactement comme prévu — c'est l'agent qui encaisse le choc.</>,
              correct: true,
              explain: (
                <>
                  Exact : <M tex="z - (-0{,}5 + z) = 0{,}5" /> quel que soit <M tex="x" />. Avec{" "}
                  <M tex="\beta = 1" />, tout l'aléa passe dans la poche (ou sur les épaules) de
                  l'agent. Le principal touche une rente certaine — comme le loueur de taxis qui
                  encaisse ses 90 € par jour, beau temps mauvais temps.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* §7 — Agent averse au risque                                   */}
      {/* ============================================================ */}
      <Section id="sec-risque" kicker="§ 7" title="Et si l'agent est averse au risque ?">
        <p className="text-[1.1rem] leading-relaxed">
          Jusqu'ici l'agent acceptait le risque sans broncher. Dans la réalité, la plupart des
          salariés préfèrent 2 000 € sûrs à « pile 4 000 €, face 0 € ». Cette dernière
          section — <em>qualitative, sans calculs</em> — montre que l'aversion au risque change
          profondément la conclusion.
        </p>

        <H4>Ce qui change dans le modèle</H4>
        <p>
          Si l'agent est averse au risque, alors <M tex="U_a(w - c)" /> est défini avec une{" "}
          <strong>
            fonction d'utilité de Bernoulli <M tex="u(w - c)" /> concave
          </strong>{" "}
          : chaque euro supplémentaire apporte de moins en moins d'utilité. Conséquence : entre
          un revenu risqué et un revenu certain <em>de même espérance</em>, il préfère
          strictement le certain.
        </p>

        <RiskAversionFigure />

        <H4>
          Le nouveau dilemme du principal : inciter <em>ou</em> assurer
        </H4>
        <p>
          Pour inciter l'agent à exercer un effort non nul, le principal doit{" "}
          <strong>intéresser l'agent au résultat</strong> : le salaire doit dépendre de{" "}
          <M tex="z" />. Mais voilà le nœud du problème :
        </p>
        <Callout variant="definition" title="📖 L'arbitrage incitants ↔ risque">
          <p>
            Plus le salaire dépend de <M tex="z" /> (plus <M tex="\beta" /> est grand) :
          </p>
          <ul>
            <li>
              ✅ ...plus l'agent est incité à exercer un effort élevé (bien pour l'efficacité) ;
            </li>
            <li>
              ❌ ...mais plus l'agent supporte une grande part du risque lié à <M tex="x" />{" "}
              (mal pour un agent qui déteste le risque).
            </li>
          </ul>
          <p>
            En concevant le contrat optimal, le principal doit <strong>arbitrer</strong> entre
            les incitants donnés à l'agent (pour qu'il exerce un plus grand effort) et le risque
            supporté par l'agent (pour lequel il demande une{" "}
            <strong>compensation supplémentaire</strong>).
          </p>
        </Callout>

        <p>
          Comme avant, le principal conçoit le contrat pour saturer la contrainte de
          participation : <M tex="U_a(w - c) = \tilde{u}" />. Mais étant averse au risque,
          l'agent exige une <strong>compensation salariale supplémentaire</strong> pour supporter
          les risques qui lui sont transférés — une <em>prime de risque</em>, exactement l'écart
          rouge du schéma.
        </p>

        <Callout variant="retiens" title="⭐ La conclusion finale du chapitre">
          <p>
            À l'optimum, le principal extrait de nouveau tout le surplus de leur association,{" "}
            <strong>
              mais il n'atteint plus le niveau de profit du cas d'information parfaite
            </strong>
            . Son surplus diminue car il doit payer la compensation pour le risque de l'agent.{" "}
            <strong>L'information imparfaite a donc un coût en termes d'efficacité</strong> — dès
            que l'agent est averse au risque.
          </p>
          <p>
            En une ligne pour l'examen :{" "}
            <em>
              agent neutre au risque → l'aléa moral ne coûte rien (contrat franchise) ; agent
              averse au risque → l'aléa moral coûte (arbitrage incitants/assurance,{" "}
              <M tex="\beta^*" /> intermédiaire entre 0 et 1).
            </em>
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q11"
          kicker="Quiz éclair · §7"
          question={
            <p>
              Vrai ou faux : « Avec un agent averse au risque, le contrat franchise (
              <M tex="\beta = 1" />) reste le contrat optimal du principal. »
            </p>
          }
          options={[
            {
              text: <>Vrai : la franchise reste imbattable.</>,
              explain: (
                <>
                  Non — <M tex="\beta = 1" /> mettrait TOUT le risque sur l'agent, qui exigerait
                  une énorme prime de risque via <M tex="\alpha" />. Cette compensation coûterait
                  trop cher au principal.
                </>
              ),
            },
            {
              text: (
                <>
                  Faux : le principal réduit <M tex="\beta" /> pour limiter la prime de risque à
                  payer, quitte à sacrifier un peu d'effort.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact. Le principal recule sur <M tex="\beta" /> pour réduire le risque
                  transféré (et donc la compensation exigée), au prix d'un effort plus faible. Le{" "}
                  <M tex="\beta" /> optimal se situe entre 0 et 1 : ni assurance totale, ni
                  incitation totale.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q12"
          kicker="Quiz éclair · §7"
          question={
            <p>
              Vrai ou faux : « Avec un agent averse au risque, l'information imparfaite a un coût
              d'efficacité, alors qu'avec un agent neutre au risque elle n'en avait pas. »
            </p>
          }
          options={[
            {
              text: <>Vrai — c'est le message central du chapitre.</>,
              correct: true,
              explain: (
                <>
                  C'est LA phrase de conclusion du chapitre. Agent neutre : profit du principal
                  = 0,5 = celui de l'information parfaite. Agent averse : profit inférieur à
                  l'information parfaite, à cause de la compensation pour le risque.
                </>
              ),
            },
            {
              text: <>Faux.</>,
              explain: (
                <>
                  Relis la conclusion : c'est exactement l'énoncé du cours. Avec neutralité au
                  risque, la franchise reproduit le résultat d'information parfaite ; avec
                  aversion, plus moyen.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* §8 — Exercices résolus                                        */}
      {/* ============================================================ */}
      <Section id="sec-exos" kicker="§ 8" title="Exercices résolus — entraîne-toi comme à l'examen">
        <p className="text-[1.1rem] leading-relaxed">
          Quatre exercices, du plus guidé au plus libre. Cherche <em>vraiment</em> avant d'ouvrir
          la solution — c'est là que la maîtrise se construit. Les exercices 1 et 2 changent le
          coût d'effort : c'est la variation la plus probable en examen.
        </p>

        <ExerciseBlock
          scope="b2"
          id="ex1"
          number={1}
          title="Salaire proportionnel avec un coût d'effort différent"
          difficulty={1}
          refs={[{ chapter: "b2", section: "sec-cas2" }]}
          statement={
            <>
              <p>
                On reprend le Cas 2 (<M tex="w = \beta z" />, <M tex="z = e + x" />,{" "}
                <M tex="E(x) = 0" />, <M tex="\tilde{u} = 0" />), mais le coût d'effort est
                maintenant <strong><M tex="c(e) = e^2" /></strong> (l'effort est deux fois plus
                pénible).
              </p>
              <ul>
                <li>
                  <strong>a)</strong> Trouve la meilleure réponse de l'agent{" "}
                  <M tex="e^*(\beta)" />.
                </li>
                <li>
                  <strong>b)</strong> Trouve le <M tex="\beta^*" /> choisi par le principal, puis
                  les payoffs.
                </li>
              </ul>
            </>
          }
          steps={[
            {
              title: "a) L'agent d'abord (backward induction → toujours lui d'abord)",
              content: (
                <>
                  <MB tex="E(w - c) = \beta e - e^2 \;\;\Rightarrow\;\; \text{CPO : } \beta - 2e = 0 \;\;\Rightarrow\;\; \boxed{e^* = \beta/2}" />
                  <p>
                    (La dérivée de <M tex="e^2" /> est <M tex="2e" /> : coût marginal plus raide
                    → moitié moins d'effort qu'avant pour un même bonus.)
                  </p>
                </>
              ),
            },
            {
              title: "b) Le principal anticipe e* = β/2",
              content: (
                <>
                  <MB tex="E(z - w) = (1 - \beta)\cdot e^* = \frac{(1 - \beta)\beta}{2} = \frac{\beta - \beta^2}{2}" />
                  <MB tex="\text{CPO : } \frac{1 - 2\beta}{2} = 0 \;\;\Rightarrow\;\; \boxed{\beta^* = 1/2} \;\;\Rightarrow\;\; e^* = 1/4" />
                </>
              ),
            },
            {
              title: "Les payoffs",
              content: (
                <>
                  <MB tex="U_p = (1 - \tfrac{1}{2})\cdot\tfrac{1}{4} = \mathbf{0{,}125} \qquad\cdot\qquad U_a = \tfrac{1}{2}\cdot\tfrac{1}{4} - \left(\tfrac{1}{4}\right)^2 = \tfrac{1}{8} - \tfrac{1}{16} = \mathbf{0{,}0625}" />
                </>
              ),
            },
          ]}
          result={
            <p>
              <strong>Morale</strong> : le <M tex="\beta^*" /> ne change pas (le dilemme « part
              vs gâteau » a la même forme), mais tout le monde gagne moins : un effort plus
              pénible réduit le surplus créé.
            </p>
          }
        />

        <ExerciseBlock
          scope="b2"
          id="ex2"
          number={2}
          title={
            <>
              Contrat linéaire optimal avec <M tex="c(e) = e^2" />
            </>
          }
          difficulty={2}
          refs={[{ chapter: "b2", section: "sec-cas3" }]}
          statement={
            <p>
              Même environnement que l'exercice 1, mais avec le contrat complet{" "}
              <M tex="w = \alpha + \beta z" />. Trouve le contrat optimal{" "}
              <M tex="(\alpha^*, \beta^*)" /> et les payoffs.{" "}
              <em>Suis exactement la recette du Cas 3 : CI → CP saturée → substitution → CPO.</em>
            </p>
          }
          steps={[
            {
              title: "① CI (l'agent)",
              content: (
                <p>
                  Comme à l'exercice 1 (le fixe <M tex="\alpha" /> disparaît dans la dérivée) :{" "}
                  <M tex="e^* = \beta/2" />.
                </p>
              ),
            },
            {
              title: "② CP saturée",
              content: (
                <MB tex="E(w - c) = 0 \;\Rightarrow\; \alpha + \beta e - e^2 = 0 \;\Rightarrow\; \alpha = e^2 - \beta e" />
              ),
            },
            {
              title: "③ Substitution — le profit du principal devient le surplus total",
              content: (
                <MB tex="E(z - w) = e - (e^2 - \beta e) - \beta e = e - e^2" />
              ),
            },
            {
              title: "④ Maximisation du gâteau",
              content: (
                <>
                  <p>
                    CPO : <M tex="1 - 2e = 0 \;\Rightarrow\;" /> effort efficace{" "}
                    <M tex="e = 1/2" />. Pour l'induire via la CI :{" "}
                    <M tex="\beta/2 = 1/2 \;\Rightarrow\; \boxed{\beta^* = 1}" />. Puis{" "}
                    <M tex="\alpha^* = (\tfrac{1}{2})^2 - 1\cdot\tfrac{1}{2} = \boxed{-1/4}" />.
                  </p>
                </>
              ),
            },
            {
              title: "Les payoffs",
              content: (
                <MB tex="U_p = \tfrac{1}{2} - \tfrac{1}{4} = \mathbf{0{,}25} \; (= \text{le gâteau maximal}) \qquad\cdot\qquad U_a = \mathbf{0}" />
              ),
            },
          ]}
          result={
            <p>
              <strong>Morale</strong> : la structure du contrat optimal est robuste —{" "}
              <strong>
                toujours <M tex="\beta^* = 1" /> (residual claimant) + une franchise qui extrait
                le surplus
              </strong>
              , seuls les montants changent avec la fonction de coût.
            </p>
          }
        />

        <ExerciseBlock
          scope="b2"
          id="ex3"
          number={3}
          title={
            <>
              Quand l'agent a une meilleure alternative : <M tex="\tilde{u} = 0{,}1" />
            </>
          }
          difficulty={2}
          refs={[{ chapter: "b2", section: "sec-cas3" }]}
          statement={
            <p>
              Retour au modèle du cours (<M tex="c = e^2/2" />), mais l'agent a maintenant une
              offre concurrente qui lui garantit <M tex="\tilde{u} = 0{,}1" /> s'il refuse.
              Trouve le contrat linéaire optimal et le profit du principal.{" "}
              <em>Indice : qu'est-ce qui change — la taille du gâteau, ou son partage ?</em>
            </p>
          }
          steps={[
            {
              title: "① CI inchangée",
              content: (
                <p>
                  <M tex="e^* = \beta" /> (la CI ne dépend pas de <M tex="\tilde{u}" />).
                </p>
              ),
            },
            {
              title: "② CP saturée au nouveau niveau",
              content: (
                <MB tex="\alpha + \beta e - \frac{e^2}{2} = 0{,}1 \;\Rightarrow\; \alpha = 0{,}1 + \frac{e^2}{2} - \beta e" />
              ),
            },
            {
              title: "③ Substitution",
              content: (
                <>
                  <MB tex="E(z - w) = e - \frac{e^2}{2} - 0{,}1" />
                  <p>
                    Le gâteau est le même, amputé du « ticket de sortie » 0,1 à verser à l'agent.
                  </p>
                </>
              ),
            },
            {
              title: "④ CPO inchangée",
              content: (
                <p>
                  <M tex="\boxed{\beta^* = 1}" /> (l'effort efficace ne dépend pas de{" "}
                  <M tex="\tilde{u}" /> !), et{" "}
                  <M tex="\alpha^* = 0{,}1 + \tfrac{1}{2} - 1 = \boxed{-0{,}4}" /> : la franchise
                  est <em>réduite</em> de 0,1.
                </p>
              ),
            },
            {
              title: "Les payoffs",
              content: (
                <MB tex="U_p = 0{,}5 - 0{,}1 = \mathbf{0{,}4} \qquad\cdot\qquad U_a = \mathbf{0{,}1} \; (= \tilde{u},\ \text{la CP est saturée})" />
              ),
            },
          ]}
          result={
            <p>
              <strong>Morale</strong> : <M tex="\tilde{u}" /> ne change <em>pas</em> les
              incitants (<M tex="\beta^* = 1" /> toujours), seulement le <em>partage</em> : plus
              l'alternative de l'agent est bonne, plus le principal doit lui laisser — via un{" "}
              <M tex="\alpha" /> plus généreux, jamais via <M tex="\beta" />. Encore la division
              du travail entre les deux leviers !
            </p>
          }
        />

        <ExerciseBlock
          scope="b2"
          id="ex4"
          number={4}
          title="Audit du contrat « commission de 40 % »"
          difficulty={3}
          refs={[
            { chapter: "b2", section: "sec-cas2" },
            { chapter: "b2", section: "sec-cas3" },
            { chapter: "b2", section: "sec-risque" },
          ]}
          statement={
            <>
              <p>
                Une entreprise (modèle du cours : <M tex="c = e^2/2" />,{" "}
                <M tex="\tilde{u} = 0" />) paie son commercial <M tex="w = 0{,}4z" />.
              </p>
              <ul>
                <li>
                  <strong>a)</strong> Calcule l'effort induit et les payoffs.
                </li>
                <li>
                  <strong>b)</strong> Ce contrat est-il optimal pour le principal ? Si non,
                  propose mieux et chiffre le gain.
                </li>
                <li>
                  <strong>c)</strong> Question d'interprétation : pourquoi tant d'entreprises
                  réelles n'utilisent-elles pourtant <em>pas</em> le contrat franchise ?
                </li>
              </ul>
            </>
          }
          steps={[
            {
              title: "a) Effort induit et payoffs",
              content: (
                <>
                  <p>
                    <M tex="e^* = \beta = 0{,}4" />. Payoffs :{" "}
                    <M tex="U_p = (1 - 0{,}4)\cdot 0{,}4 = \mathbf{0{,}24}" /> ;{" "}
                    <M tex="U_a = 0{,}4\cdot 0{,}4 - 0{,}4^2/2 = \mathbf{0{,}08}" />. (Vérifie
                    dans le laboratoire à contrats de la section 5 !)
                  </p>
                </>
              ),
            },
            {
              title: "b) Non — la franchise fait plus du double",
              content: (
                <p>
                  Le contrat optimal est la franchise : <M tex="\beta^* = 1" />,{" "}
                  <M tex="\alpha^* = -0{,}5" />, qui donne <M tex="U_p = 0{,}5" />.{" "}
                  <strong>Gain : +0,26</strong> de profit (0,5 contre 0,24) — plus du double.
                  Deux sources de gain : le gâteau grossit (effort 1 au lieu de 0,4) <em>et</em>{" "}
                  le principal récupère le surplus que l'agent gardait (0,08).
                </p>
              ),
            },
            {
              title: "c) Pourquoi la franchise est rare dans la vraie vie",
              content: (
                <p>
                  Réponse attendue (avec la section 7) : parce que les vrais agents sont{" "}
                  <strong>averses au risque</strong>. La franchise leur transfère 100 % du
                  risque — il faudrait les compenser cher pour qu'ils signent, voire ils ne
                  peuvent pas payer la franchise (contrainte de richesse). Le <M tex="\beta" />{" "}
                  intermédiaire (comme 0,4) est un compromis incitation/assurance. D'autres
                  raisons hors modèle : travail en équipe (résultat individuel peu mesurable),
                  multi-tâches, droit du travail...
                </p>
              ),
            },
          ]}
          result={
            <p>
              Dans le modèle de base, la commission de 40 % laisse de la valeur sur la table ;
              dans le monde réel (agents averses au risque), un <M tex="\beta" /> intermédiaire
              est précisément le compromis incitation/assurance prédit par la section 7.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* §9 — Bilan                                                    */}
      {/* ============================================================ */}
      <Section id="sec-bilan" kicker="§ 9" title="Bilan — checklist de maîtrise & diagnostic">
        <H4>La checklist des 10 points à maîtriser absolument</H4>
        <p>
          Coche honnêtement. Un point est « maîtrisé » si tu peux l'expliquer à voix haute{" "}
          <em>sans regarder le cours</em>.
        </p>
        <MasteryChecklist
          items={[
            <>
              Définir <strong>principal</strong>, <strong>agent</strong>,{" "}
              <strong>information asymétrique</strong>, <strong>problème de l'agence</strong> —
              et les identifier dans un exemple nouveau.
            </>,
            <>
              Expliquer pourquoi « <strong>aléa moral</strong> » est une terminologie trompeuse
              (incitants, pas morale).
            </>,
            <>
              Écrire le modèle de mémoire : <M tex="z = e + x" />, <M tex="E(x) = 0" />,{" "}
              <M tex="w = \alpha + \beta z" />, <M tex="c = e^2/2" />, payoffs, timing en 3
              étapes.
            </>,
            <>
              Appliquer la <strong>backward induction</strong> : résoudre l'agent (CPO sur{" "}
              <M tex="e" />) <em>avant</em> le principal (CPO sur <M tex="\beta" />).
            </>,
            <>
              <strong>Cas 1</strong> : démontrer <M tex="e^* = 0" />, <M tex="\alpha^* = 0" />,
              et expliquer pourquoi le fixe n'incite à rien.
            </>,
            <>
              <strong>Cas 2</strong> : démontrer <M tex="e^* = \beta" />,{" "}
              <M tex="\beta^* = 1/2" />, payoffs (0,25 ; 0,125), et prouver l'inefficacité
              Pareto avec le contre-exemple (0,3 ; 0,2).
            </>,
            <>
              Énoncer les contraintes <strong>CP</strong> et <strong>CI</strong>, en formule et
              en français, et expliquer pourquoi le principal <strong>sature la CP</strong>.
            </>,
            <>
              <strong>Cas 3</strong> : dérouler la recette complète jusqu'à{" "}
              <M tex="\beta^* = 1" />, <M tex="\alpha^* = -0{,}5" />, payoffs (0,5 ; 0).
            </>,
            <>
              Interpréter <strong>franchise</strong> et <strong>residual claimant</strong>{" "}
              (licence de taxi), et dire qui porte le risque dans ce contrat.
            </>,
            <>
              Expliquer l'<strong>arbitrage incitants/risque</strong> avec un agent averse au
              risque, et la conclusion :{" "}
              <em>l'information imparfaite a alors un coût d'efficacité</em>.
            </>,
          ]}
        />

        <H4>Diagnostic automatique de tes faiblesses</H4>
        <p>
          Réponds d'abord aux quiz éclair disséminés dans le chapitre, puis clique : on repère
          les sections où ça coince et on te dit quoi retravailler.
        </p>
        <QuizDiagnostic />

        <Callout variant="intuition" title="🔭 Pour la suite du cours">
          <p>
            Le problème d'agence de ce chapitre — une partie <em>agit</em> sans être observée —
            s'appelle plus précisément l'<em>action cachée</em>. Sa jumelle, l'
            <em>information cachée</em> (une partie <em>sait</em> quelque chose que l'autre
            ignore, comme la qualité d'une voiture d'occasion), nourrit d'autres résultats
            célèbres de l'économie de l'information : sélection adverse, signalement... Si le
            cours y vient, tu as déjà tout le vocabulaire de base.
          </p>
        </Callout>

        <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
          Manuel interactif ECGEB366 · Chapitre B2 — Jeux séquentiels appliqués à la théorie des
          contrats (d'après les slides de B. Decerf). Formules vérifiées numériquement · Les
          pourcentages du sondage et la courbe d'utilité concave sont illustratifs.
        </p>
      </Section>
    </ChapterShell>
  );
}
