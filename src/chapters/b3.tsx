/*
 * Chapitre B3 — Jeux répétés.
 *
 * Conversion fidèle du manuel interactif « B3 · Jeux répétés » (cours
 * ECGEB366, B. Decerf) : le dilemme du fritkot, le cadre des jeux répétés,
 * l'échec de la coopération à deux périodes, le théorème de l'horizon fini,
 * la boîte à outils de l'horizon infini (somme géométrique), « toujours
 * trahir » comme ENPS, la condition δ ≥ 1/2 pour grim-grim, l'interprétation
 * (probabilité de continuation, seuil général), le tournoi d'Axelrod et les
 * données de laboratoire, puis exercices récapitulatifs, QCM final et
 * checklist de maîtrise.
 */

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import {
  FestivalSimulator,
  GeneralThreshold,
  GeometricSeriesExplorer,
  MasteryChecklist,
  PollTwoDays,
  ThresholdDuel,
  TwoPeriodExplorer,
} from "./b3/interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section (équivalent des h3 de la source). */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
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

/** Grille de mini-cartes vocabulaire (les « vocab cards » de la source). */
function CardGrid({ items }: { items: Array<{ title: ReactNode; body: ReactNode }> }) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="text-[15px] font-bold text-sky-800">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
        </div>
      ))}
    </div>
  );
}

/** Frise des périodes affichée dans le hero (jour 0 → 1 → 2 → t → t+1 → ∞ ?). */
function PeriodStrip() {
  const days = ["0", "1", "2", "t", "t+1"];
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2 font-mono" aria-hidden>
      {days.map((d) => (
        <Fragment key={d}>
          <div
            className={cn(
              "flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-[10px] text-white/80",
              d === "t" ? "border-amber-300 bg-white/25" : "border-white/30 bg-white/10",
            )}
          >
            <span>jour</span>
            <b className="text-sm text-white">{d}</b>
          </div>
          <span className="text-white/50">→</span>
        </Fragment>
      ))}
      <span className="text-2xl font-extrabold text-amber-300">∞ ?</span>
    </div>
  );
}

/** Déroulé du jeu à deux périodes (la « timeline » de la source). */
function TwoPeriodTimeline() {
  return (
    <div
      className="my-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
      aria-label="déroulement du jeu à deux périodes"
    >
      <div className="flex-1 rounded-xl border bg-card p-3.5 text-sm leading-relaxed shadow-sm">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">
          Période 0
        </div>
        Chaque fritkot choisit son prix (simultanément). Puis chacun <strong>observe</strong> le
        choix de l'autre, et les payoffs du jour tombent.
      </div>
      <div className="self-center text-xl text-muted-foreground" aria-hidden>
        →
      </div>
      <div className="flex-1 rounded-xl border bg-card p-3.5 text-sm leading-relaxed shadow-sm">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-700">
          Période 1
        </div>
        Rebelote : chacun choisit son prix — en connaissant ce qui s'est passé en période 0.
        Observation, payoffs, <strong>fin du jeu</strong>.
      </div>
    </div>
  );
}

/** L'effondrement en dominos de la backward induction (§ 4). */
function UnravelStrip() {
  const cells: Array<{ top: string; mid: string; bot: string; hot?: boolean }> = [
    { top: "période", mid: "0", bot: "T…" },
    { top: "période", mid: "1", bot: "T…" },
    { top: "…", mid: "…", bot: "" },
    { top: "période", mid: "N−1", bot: "T !" },
    { top: "dernière", mid: "N", bot: "T !!", hot: true },
  ];
  return (
    <div
      className="my-6 flex flex-wrap items-center justify-center gap-2 font-mono"
      aria-label="effondrement de la coopération par backward induction, de la dernière période vers la première"
    >
      {cells.map((c, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <span className="text-xl font-bold text-rose-600" aria-hidden>
              ←
            </span>
          ) : null}
          <div
            className={cn(
              "flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 text-[10px] text-muted-foreground",
              c.hot ? "border-rose-400 bg-rose-50" : "border-border bg-card",
            )}
          >
            <span>{c.top}</span>
            <b className="text-[15px] text-foreground">{c.mid}</b>
            <span className="font-bold text-rose-600">{c.bot}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Tableau des trois options du joueur 2 à deux périodes (§ 3). */
function ThreeOptionsTable() {
  const mark = "bg-amber-100/80 font-bold";
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[540px] border-collapse text-center text-[14.5px]">
        <thead>
          <tr className="bg-muted/60 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2.5 text-left">
              Stratégie du <span className="text-sky-700">joueur 2</span>
            </th>
            <th className="px-3 py-2.5">période 0</th>
            <th className="px-3 py-2.5">période 1</th>
            <th className="px-3 py-2.5">
              Payoff <M tex="\Pi_2" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2.5 text-left">
              grim <M tex="s_2^{G}" /> (coopère, coopère)
            </td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">C → 4</td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">C → 4</td>
            <td className="px-3 py-2.5">
              <M tex="4 + 4\delta" />
            </td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2.5 text-left">
              trahir les deux périodes (<M tex="s_2" />)
            </td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">T → 6</td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">T → 2</td>
            <td className="px-3 py-2.5">
              <M tex="6 + 2\delta" />
            </td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2.5 text-left">
              coopérer puis trahir (<M tex="s_2'" />)
            </td>
            <td className="px-3 py-2.5 font-semibold text-sky-700">C → 4</td>
            <td className={cn("px-3 py-2.5 text-sky-700", mark)}>T → 6</td>
            <td className={cn("px-3 py-2.5", mark)}>
              <M tex="4 + 6\delta" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Le « film » de la déviation contre grim à horizon infini (§ 7). */
function DeviationFilmTable() {
  const head = ["période", "0", "…", "t−1", "t", "t+1", "…"];
  const mark = "bg-amber-100/80 font-bold";
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[540px] border-collapse text-center font-mono text-[13.5px]">
        <thead>
          <tr className="bg-muted/60 font-sans text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-rose-700">
              Action 1 (grim)
            </td>
            {["C", "C", "C", "C", "T", "T"].map((a, i) => (
              <td key={i} className="px-3 py-2 font-bold text-rose-700">
                {a}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-sky-700">
              Action 2 (dévie)
            </td>
            {["C", "C", "C", "T", "T", "T"].map((a, i) => (
              <td key={i} className={cn("px-3 py-2 font-bold text-sky-700", i === 3 && mark)}>
                {a}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-muted-foreground">
              π de 1
            </td>
            {["4", "4", "4", "0", "2", "2"].map((a, i) => (
              <td key={i} className="px-3 py-2">
                {a}
              </td>
            ))}
          </tr>
          <tr className="border-t">
            <td className="px-3 py-2 font-sans text-[13px] font-semibold text-muted-foreground">
              π de 2
            </td>
            {["4", "4", "4", "6", "2", "2"].map((a, i) => (
              <td key={i} className={cn("px-3 py-2", i === 3 && mark)}>
                {a}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* La page du chapitre                                                 */
/* ------------------------------------------------------------------ */

export default function Chapter() {
  return (
    <ChapterShell chapterId="b3" heroExtra={<PeriodStrip />}>
      {/* ============================================================ */}
      {/* § 0 — Repères                                                 */}
      {/* ============================================================ */}
      <Section id="sec-reperes" kicker="§ 0" title="Repères — où en sommes-nous ?">
        <p className="text-[1.15rem] leading-relaxed">
          En B1, le dilemme du prisonnier finissait mal : deux joueurs rationnels trahissent, et
          tout le monde y perd. Mais dans la vraie vie, on ne joue presque jamais « une seule
          fois ». On recroise les mêmes gens demain, après-demain… Et ça change tout —{" "}
          <strong>à une condition précise</strong>, que ce chapitre va calculer.
        </p>
        <p className="mt-4 italic text-muted-foreground">
          Bonne nouvelle : B3 est le chapitre le plus court du bloc B, et il n'introduit presque{" "}
          <em>aucun</em> outil nouveau. Il assemble trois briques que tu possèdes déjà.
          Vérifions-les une par une avant de démarrer.
        </p>

        <Callout variant="methode" title="🔗 Liens avec les chapitres précédents">
          <ul>
            <li>
              <strong>Jeux simultanés (B1) :</strong> le <em>dilemme du prisonnier</em>, la{" "}
              <em>stratégie dominante</em> et l'
              <em>équilibre en stratégies dominantes (ESD)</em>, l'
              <em>équilibre de Nash (EN)</em> et l'<em>efficacité de Pareto</em>. B3 prend
              exactement ce jeu-là… et le fait rejouer plusieurs fois.
            </li>
            <li>
              <strong>Jeux séquentiels :</strong> la méthode de résolution (
              <em>backward induction</em> : on part de la fin) et le concept de solution (
              <em>ENPS</em>, équilibre de Nash parfait en sous-jeux). Un jeu répété{" "}
              <strong>est</strong> un jeu séquentiel — on le résout donc avec les mêmes armes.
            </li>
            <li>
              <strong>Décision intertemporelle (A2) :</strong> le <em>facteur d'escompte</em>{" "}
              <M tex="\delta" /> ! Tu l'avais utilisé pour comparer « consommer aujourd'hui » et
              « consommer demain ». Ici il compare « profit aujourd'hui » et « profit demain ».
              C'est LE personnage principal du chapitre : toute la conclusion tient dans une
              condition sur <M tex="\delta" />.
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <TheoryRef chapter="b1" section="s3" />
            <TheoryRef chapter="b1" section="s5" />
            <TheoryRef chapter="a2" section="outils" label="Le facteur d'escompte δ" />
          </div>
        </Callout>

        <H4>La boîte à outils (4 rappels express)</H4>
        <CardGrid
          items={[
            {
              title: "Dilemme du prisonnier (B1)",
              body: (
                <>
                  Un jeu où chaque joueur a une <em>stratégie dominante</em> (trahir), mais où le
                  résultat (Trahir, Trahir) est <em>pire pour tout le monde</em> que (Coopérer,
                  Coopérer). Rationalité individuelle ⇒ désastre collectif.
                </>
              ),
            },
            {
              title: "Efficacité de Pareto (B1)",
              body: (
                <>
                  Un résultat est <em>efficace au sens de Pareto</em> si on ne peut pas améliorer
                  le sort d'un joueur sans détériorer celui d'un autre. (T, T) donne (2 ; 2)
                  alors que (C, C) donnerait (4 ; 4) : (T, T) n'est <strong>pas</strong>{" "}
                  efficace.
                </>
              ),
            },
            {
              title: "Backward induction & ENPS",
              body: (
                <>
                  Pour résoudre un jeu qui se déroule dans le temps, on commence par la{" "}
                  <em>dernière</em> décision, puis on remonte. Le profil de stratégies obtenu est
                  l'<strong>ENPS</strong> : un équilibre crédible à chaque étape du jeu.
                </>
              ),
            },
            {
              title: (
                <>
                  Facteur d'escompte <M tex="\delta" /> (A2)
                </>
              ),
              body: (
                <>
                  Un nombre entre 0 et 1. Recevoir <M tex="\pi" /> demain « vaut »{" "}
                  <M tex="\delta \cdot \pi" /> aujourd'hui. <M tex="\delta" /> proche de 1 =
                  joueur <em>patient</em> (demain compte presque autant qu'aujourd'hui) ;{" "}
                  <M tex="\delta" /> proche de 0 = joueur <em>impatient</em> (seul le présent
                  compte).
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b3"
          id="q1"
          kicker="Check de départ"
          question={
            <>
              Un joueur a un facteur d'escompte <M tex="\delta = 0{,}9" />. Que préfère-t-il :
              10 € demain ou 8 € aujourd'hui ?
            </>
          }
          options={[
            {
              text: <>10 € demain, car 0,9 × 10 = 9 &gt; 8.</>,
              correct: true,
              explain: (
                <>
                  Exact ! 10 € demain valent 0,9 × 10 = 9 € d'aujourd'hui, ce qui bat 8 €. Un
                  joueur patient valorise fortement le futur — retiens ce réflexe de calcul, on
                  va le refaire tout le chapitre.
                </>
              ),
            },
            {
              text: (
                <>8 € aujourd'hui, car un euro aujourd'hui vaut toujours plus qu'un euro demain.</>
              ),
              explain: (
                <>
                  Presque : il faut convertir le futur en « valeur d'aujourd'hui » en multipliant
                  par <M tex="\delta" />. Ici 10 € demain valent 0,9 × 10 = 9 € aujourd'hui… ce
                  qui est plus que 8 €.
                </>
              ),
            },
            {
              text: <>Impossible à dire, on ne peut pas comparer deux dates différentes.</>,
              explain: (
                <>
                  Non — <M tex="\delta" /> sert exactement à ça : rendre comparables des montants
                  reçus à des dates différentes. On multiplie le montant futur par{" "}
                  <M tex="\delta" />.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 0)">
          <p>
            Le réflexe A2 :{" "}
            <strong>
              une somme reçue en période <M tex="t" /> vaut <M tex="\delta^t" /> fois cette somme
              en période 0
            </strong>
            . Demain = <M tex="\times\,\delta" />, après-demain = <M tex="\times\,\delta^2" />,
            etc. Tout le chapitre n'est que ça, appliqué à des profits de fritkot.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 1 — Le dilemme du fritkot                                   */}
      {/* ============================================================ */}
      <Section id="sec-fritkot" kicker="§ 1" title="Le dilemme du fritkot">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Comme toujours dans ce cours, tout part d'une histoire. Deux baraques à frites, un
          festival, et une tentation bien belge : casser les prix du voisin.
        </p>

        <p className="mt-4">
          Deux <strong>fritkots</strong> vendent des frites sur la plaine d'un festival. Chaque
          matin, chaque fritkot choisit le prix de ses frites — <strong>prix haut</strong> ou{" "}
          <strong>prix bas</strong> — l'inscrit sur son menu, et ne peut plus le changer de la
          journée. Les deux choix sont faits en même temps, sans se concerter : c'est un{" "}
          <strong>jeu simultané</strong>, exactement comme en B1.
        </p>
        <ul>
          <li>
            <strong>Coopérer (C)</strong> = choisir le prix <em>haut</em>. Si les deux le font,
            ils se partagent le marché à prix élevé et maximisent leurs profits : c'est le
            comportement de <em>cartel</em>. Problème : un cartel, c'est illégal — impossible de
            signer un contrat « on promet de rester chers ».
          </li>
          <li>
            <strong>Trahir (T)</strong> = choisir le prix <em>bas</em> pour voler des parts de
            marché au voisin pendant qu'il reste cher.
          </li>
        </ul>

        <PayoffMatrix
          rowPlayer="Fritkot 1"
          colPlayer="Fritkot 2"
          rows={["Coopérer", "Trahir"]}
          cols={["Coopérer", "Trahir"]}
          payoffs={[
            [
              [4, 4],
              [0, 6],
            ],
            [
              [6, 0],
              [2, 2],
            ],
          ]}
          interactive
          caption={
            <>
              Payoffs (profits du jour) —{" "}
              <span className="font-semibold text-rose-700">Fritkot 1</span> ;{" "}
              <span className="font-semibold text-sky-700">Fritkot 2</span>. Utilise les boutons
              pour révéler les meilleures réponses et l'équilibre de Nash.
            </>
          }
        />

        <H4>Pourquoi c'est un dilemme du prisonnier (réflexe B1)</H4>
        <p>
          Mets-toi à la place du <span className="font-semibold text-rose-700">Fritkot 1</span>{" "}
          et compare ligne par ligne :
        </p>
        <Steps
          items={[
            <>
              Si <span className="font-semibold text-sky-700">2 coopère</span> : trahir rapporte{" "}
              <strong>6</strong> au lieu de 4. → Trahir est mieux.
            </>,
            <>
              Si <span className="font-semibold text-sky-700">2 trahit</span> : trahir rapporte{" "}
              <strong>2</strong> au lieu de 0. → Trahir est <em>encore</em> mieux.
            </>,
            <>
              Trahir est donc une <strong>stratégie dominante</strong> pour 1 — et par symétrie,
              pour 2 aussi. <strong>(T, T) est l'ESD</strong> du jeu, avec les payoffs (2 ; 2).
            </>,
          ]}
        />

        <Callout variant="attention" title="⚠️ La tragédie">
          <p>
            (2 ; 2) n'est <strong>pas efficace au sens de Pareto</strong> : les deux fritkots
            préféreraient (4 ; 4). Mais chacun, individuellement, a intérêt à trahir. La
            rationalité individuelle détruit le gain collectif. C'est <em>exactement</em> la
            conclusion de B1… et la question de B3 est :
          </p>
        </Callout>

        <Callout variant="definition" title="❓ La question du chapitre">
          <p>
            Le festival dure <strong>plusieurs jours</strong>. Chaque jour, le même jeu
            recommence, et chacun se souvient de tout ce qui s'est passé. Un fritkot pourrait
            alors proposer :{" "}
            <em>
              « Tant que tu coopères, je coopère. Mais si tu trahis, je trahirai les jours
              suivants. »
            </em>{" "}
            Trahir devient alors un arbitrage : <strong>un gain immédiat</strong> (+2
            aujourd'hui) contre <strong>des pertes futures</strong> (la guerre des prix demain).
            Des joueurs rationnels peuvent-ils coopérer quand le dilemme du prisonnier est
            répété ? <strong>Sous quelles conditions ?</strong>
          </p>
        </Callout>

        <PollTwoDays />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 1)">
          <ul>
            <li>
              Reconnaître un dilemme du prisonnier et montrer que{" "}
              <strong>(T, T) est un ESD</strong> en comparant les payoffs ligne par ligne.
            </li>
            <li>
              Expliquer pourquoi le résultat (2 ; 2) n'est <strong>pas Pareto-efficace</strong>.
            </li>
            <li>
              Formuler la question du chapitre : la répétition peut-elle rendre la coopération{" "}
              <em>rationnelle</em> ?
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 2 — C'est quoi, un jeu répété ?                             */}
      {/* ============================================================ */}
      <Section id="sec-cadre" kicker="§ 2" title="C'est quoi, un jeu répété ?">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Avant de calculer, fixons le vocabulaire. Un jeu répété, c'est un sandwich : du jeu
          simultané à l'intérieur, du jeu séquentiel autour.
        </p>

        <Callout variant="definition" title="📖 Définition — jeu répété">
          <p>
            Un <strong>jeu répété</strong> est un jeu où un même <em>jeu simultané</em> (appelé
            « jeu de période ») est joué pendant plusieurs <strong>périodes</strong>. À la fin
            de chaque période : les stratégies jouées sont <strong>observées par tous</strong>,
            et les payoffs de la période sont réalisés.
          </p>
        </Callout>

        <p>
          Les jeux étudiés en B3 ont quatre caractéristiques — trois te sont déjà familières :
        </p>
        <CardGrid
          items={[
            {
              title: "Non-coopératifs",
              body: (
                <>
                  Aucun contrat contraignant possible (le cartel est illégal !). S'il y a
                  coopération, elle doit tenir <em>toute seule</em>, par le seul intérêt de
                  chacun.
                </>
              ),
            },
            {
              title: "Séquentiels",
              body: (
                <>
                  Le temps s'écoule : période 0, puis 1, puis 2… Comme pour les jeux séquentiels,
                  on pourra donc raisonner par backward induction et chercher un ENPS.
                </>
              ),
            },
            {
              title: "Information complète (mais imparfaite)",
              body: (
                <>
                  <em>Complète</em> : tout le monde connaît les payoffs de tout le monde.{" "}
                  <em>Imparfaite</em> : au sein d'une période, on joue en même temps, donc sans
                  voir le choix courant de l'autre — on ne voit que le <strong>passé</strong>.
                </>
              ),
            },
            {
              title: "Répétés",
              body: (
                <>
                  La nouveauté ! Le même tableau de payoffs revient période après période, et l'
                  <strong>histoire du jeu</strong> (tout ce qui a été joué avant) est connue de
                  tous.
                </>
              ),
            },
          ]}
        />

        <Callout variant="intuition" title="💡 L'idée-clé du chapitre">
          <p>
            Puisque chacun observe le passé, une <strong>stratégie</strong> peut maintenant être{" "}
            <em>conditionnelle à l'histoire du jeu</em> : « je coopère <u>si</u> tu as coopéré
            jusqu'ici, sinon je trahis ». C'est ça qui rend une <strong>punition</strong>{" "}
            possible — et donc, peut-être, la coopération. En B1, une stratégie était juste
            « C » ou « T » ; ici, c'est un <em>plan complet</em> qui dit quoi jouer à chaque
            période, pour chaque passé possible.
          </p>
        </Callout>

        <Quiz
          scope="b3"
          id="q2"
          question={<>Pendant la période 3, le Fritkot 1 peut baser sa décision sur…</>}
          options={[
            {
              text: <>…le choix que fait le Fritkot 2 en période 3.</>,
              explain: (
                <>
                  Non : au sein d'une période, le jeu est simultané — le choix courant de
                  l'adversaire est invisible (information imparfaite).
                </>
              ),
            },
            {
              text: <>…tout ce qui a été joué aux périodes 0, 1 et 2.</>,
              correct: true,
              explain: (
                <>
                  Exactement. On observe tout le passé (périodes 0, 1, 2) mais pas le présent :
                  le jeu de période reste simultané.
                </>
              ),
            },
            {
              text: <>…rien du tout, car les payoffs de l'adversaire sont secrets.</>,
              explain: (
                <>
                  Non, l'information est complète : les payoffs sont connus de tous dès le
                  départ. Ce qui est caché, c'est seulement le choix simultané de la période en
                  cours.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 2)">
          <ul>
            <li>
              Les 4 caractéristiques :{" "}
              <strong>
                non-coopératif, séquentiel, information complète mais imparfaite, répété
              </strong>{" "}
              — et savoir expliquer chacune en une phrase.
            </li>
            <li>
              Ce qu'est une stratégie dans un jeu répété : un{" "}
              <strong>plan contingent à l'histoire du jeu</strong>, pas un simple choix C ou T.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3 — Deux périodes : la coopération échoue                   */}
      {/* ============================================================ */}
      <Section id="sec-deux" kicker="§ 3" title="Deux périodes : la coopération échoue">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Commençons petit : le festival dure exactement 2 jours (périodes 0 et 1). C'est le cas
          le plus simple d'un jeu répété — et il va déjà nous livrer une leçon brutale.
        </p>

        <TwoPeriodTimeline />

        <H4>Le payoff total : du A2 pur jus</H4>
        <p>
          Comment un fritkot évalue-t-il le jeu <em>entier</em> ? En additionnant ses payoffs de
          période… après avoir <strong>escompté</strong> le futur, exactement comme en A2 :
        </p>
        <FormulaBox
          tex="\Pi \;=\; \pi_0 + \delta\,\pi_1"
          label="Payoff total du jeu répété à deux périodes"
          caption={
            <>
              où <M tex="\pi_t" /> est le payoff de la période <M tex="t" />, et{" "}
              <M tex="\delta \in [0,1]" /> le facteur d'escompte, qui traduit la préférence pour
              un payoff aujourd'hui plutôt que demain. Un grand <M tex="\Pi" /> majuscule pour le
              total, des petits <M tex="\pi" /> minuscules pour chaque période — retiens la
              notation.
            </>
          }
        />

        <H4>Résolution par backward induction (réflexe « jeux séquentiels »)</H4>
        <Steps
          items={[
            <>
              <strong>On part de la fin : période 1.</strong> C'est la dernière période — il n'y
              a plus de « demain », donc plus aucune punition possible. Le jeu de période 1 est
              un simple dilemme du prisonnier joué une fois… et on sait depuis B1 ce qui s'y
              passe : <strong>chacun trahit</strong> (stratégie dominante), quoi qu'il se soit
              passé en période 0.
            </>,
            <>
              <strong>On remonte : période 0.</strong> Chacun sait désormais que la période 1
              sera (T, T) <em>dans tous les cas</em>. Coopérer en période 0 ne peut donc acheter
              aucune récompense future, et trahir en période 0 ne coûte aucune punition future :
              la période 0 est « déconnectée » de la suite. Elle redevient un dilemme du
              prisonnier isolé → <strong>chacun trahit</strong>.
            </>,
          ]}
        />

        <Callout variant="definition" title="📖 L'ENPS du jeu à deux périodes">
          <p>
            L'ENPS (<M tex="s_1^*" />, <M tex="s_2^*" />) trouvé par backward induction : chaque
            joueur <strong>trahit en période 0</strong>, puis{" "}
            <strong>trahit en période 1 quelle que soit</strong> l'action de l'adversaire en
            période 0. Résultat : des joueurs rationnels ne coopèrent pas nécessairement quand le
            dilemme du prisonnier est répété.
          </p>
        </Callout>

        <H4>Et si on essayait quand même de punir ? La stratégie « grim »</H4>
        <p>
          Le prof pose alors la vraie question : y a-t-il <em>d'autres</em> ENPS, où une menace
          de punition ferait coopérer ? Pour marcher, une telle stratégie doit (1){" "}
          <strong>punir</strong> l'adversaire s'il ne coopère pas, et (2) être{" "}
          <strong>rationnelle à jouer</strong> (pas une stratégie dominée). La candidate
          naturelle :
        </p>

        <Callout
          variant="definition"
          title={
            <>
              📖 Définition — stratégie « grim » <M tex="s^{G}" /> (grim trigger, « gâchette
              implacable »)
            </>
          }
        >
          <ul>
            <li>
              le joueur <strong>coopère en période 0</strong> ;
            </li>
            <li>
              en période <M tex="t" />, il{" "}
              <strong>coopère si l'adversaire a toujours coopéré</strong> dans le passé,{" "}
              <strong>sinon il trahit</strong> (pour toujours).
            </li>
          </ul>
          <p>
            En un mot : « tant que tu coopères, je coopère ; à la première trahison, je te fais
            la guerre jusqu'à la fin des temps. »
          </p>
        </Callout>

        <p>
          Supposons que le <span className="font-semibold text-rose-700">joueur 1</span> joue{" "}
          <M tex="s_1^{G}" />. Est-ce que jouer <M tex="s_2^{G}" /> est la meilleure réponse du{" "}
          <span className="font-semibold text-sky-700">joueur 2</span> ? Comparons ses trois
          options :
        </p>

        <ThreeOptionsTable />

        <p>
          Regarde la troisième ligne : en coopérant en période 0 puis en trahissant en période 1,
          le joueur 2 encaisse la coopération de 1 au jour 0 (le grim de 1 n'a encore rien à
          punir), puis le poignarde au dernier jour — quand{" "}
          <strong>la punition ne peut plus exister</strong>. Or :
        </p>
        <MB tex="4 + 6\delta \;\ge\; 4 + 4\delta \qquad \text{(l'écart vaut } 2\delta \ge 0\text{)}" />
        <p>
          <M tex="s_2^{G}" /> n'est donc <strong>jamais</strong> une meilleure réponse à{" "}
          <M tex="s_1^{G}" /> : (<M tex="s_1^{G}" />, <M tex="s_2^{G}" />) n'est{" "}
          <strong>pas un ENPS</strong>, quel que soit <M tex="\delta" />. La menace grim est{" "}
          <em>vide</em> en période 1 : il n'y a plus de lendemain pour punir.
        </p>

        <TwoPeriodExplorer />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3)">
          <ul>
            <li>
              Écrire le payoff du jeu répété :{" "}
              <strong>
                <M tex="\Pi = \pi_0 + \delta\pi_1" />
              </strong>
              , et comprendre chaque symbole.
            </li>
            <li>
              Dérouler la backward induction :{" "}
              <strong>dernière période ⇒ (T, T), donc période 0 ⇒ (T, T)</strong>.
            </li>
            <li>
              Définir la stratégie <strong>grim</strong> par cœur, et démontrer avec les trois
              payoffs (<M tex="4+4\delta" />, <M tex="6+2\delta" />, <M tex="4+6\delta" />)
              qu'elle n'est pas un ENPS à deux périodes.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4 — Le théorème de l'horizon fini                           */}
      {/* ============================================================ */}
      <Section id="sec-fini" kicker="§ 4" title="Le théorème de l'horizon fini">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Deux périodes, c'était peut-être trop court ? Et si le festival durait 10 jours ? 100
          jours ? Mauvaise nouvelle : rien ne change. Voici pourquoi — et c'est un des plus beaux
          raisonnements du cours.
        </p>

        <H4>L'effet domino, à l'envers</H4>
        <UnravelStrip />
        <Steps
          items={[
            <>
              <strong>Dernière période N :</strong> plus de lendemain ⇒ plus de peur de la
              punition ⇒ chacun joue sa stratégie dominante : <strong>T</strong>. Ceci est vrai{" "}
              <em>quoi qu'il se soit passé avant</em>.
            </>,
            <>
              <strong>Période N−1 :</strong> tout le monde sait que N sera (T, T) de toute
              façon. Coopérer en N−1 n'achète donc rien, trahir n'y coûte rien ⇒ la période N−1
              devient « la dernière qui compte » ⇒ <strong>T</strong>.
            </>,
            <>
              <strong>Et ainsi de suite :</strong> la backward induction fait tomber les dominos
              un à un, de la fin vers le début, jusqu'à la période 0.{" "}
              <strong>Tout le monde trahit à toutes les périodes.</strong>
            </>,
          ]}
        />

        <Callout variant="examen" title="🏛️ Théorème de l'horizon fini (à connaître mot pour mot)">
          <p>
            Dans un jeu répété un <strong>nombre fini</strong> de fois, si le jeu simultané
            répété a un <strong>unique équilibre de Nash (EN)</strong>, alors le jeu répété a un{" "}
            <strong>unique ENPS</strong> : le EN du jeu simultané est joué{" "}
            <strong>à chaque période</strong>.
          </p>
        </Callout>

        <p>
          Appliqué au fritkot : le dilemme du prisonnier a un unique EN, (T, T). Donc si le
          festival a une durée finie et connue, l'unique ENPS est « trahir tous les jours ». Il
          n'existe <strong>aucune stratégie contingente à l'histoire</strong> — aussi maligne
          soit-elle — capable de faire coopérer des joueurs rationnels. La grim, le tit-for-tat,
          rien n'y fait : tout se fait dévorer par la dernière période.
        </p>

        <Callout variant="intuition" title="💡 La leçon à retenir">
          <p>
            Pour faire coopérer des joueurs rationnels, la peur d'une punition future doit être{" "}
            <strong>toujours présente</strong>. Autrement dit :{" "}
            <strong>les joueurs ne doivent pas pouvoir anticiper la fin du jeu</strong>. La
            coopération meurt à partir du moment où l'on peut compter les jours qui restent.
          </p>
        </Callout>

        <Quiz
          scope="b3"
          id="q3"
          question={
            <>
              Le jeu « bataille des sexes » possède <em>deux</em> équilibres de Nash. Si on le
              répète 5 fois, le théorème ci-dessus dit que…
            </>
          }
          options={[
            {
              text: <>…l'unique ENPS consiste à jouer le même EN à chaque période.</>,
              explain: (
                <>
                  Attention à l'hypothèse ! Le théorème exige un EN <em>unique</em> dans le jeu
                  de période. Avec deux EN, il ne s'applique pas.
                </>
              ),
            },
            {
              text: <>…rien du tout : l'hypothèse « unique EN » n'est pas remplie.</>,
              correct: true,
              explain: (
                <>
                  Bien vu : le théorème ne s'applique que si le jeu simultané a un UNIQUE EN. Le
                  dilemme du prisonnier remplit cette condition ; la bataille des sexes, non.
                  C'est le genre de piège d'énoncé que l'examen adore.
                </>
              ),
            },
            {
              text: <>…la coopération devient possible dès la période 2.</>,
              explain: (
                <>
                  Non : le théorème ne parle pas de coopération en général, et de toute façon son
                  hypothèse (EN unique) n'est pas remplie ici.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 4)">
          <ul>
            <li>
              Le <strong>théorème de l'horizon fini</strong>, avec ses deux hypothèses (nombre
              fini de répétitions + EN unique du jeu de période) et sa conclusion.
            </li>
            <li>
              Le raisonnement d'<strong>effondrement par backward induction</strong> : la
              punition meurt en dernière période, puis le raisonnement remonte période par
              période.
            </li>
            <li>
              La phrase-clé :{" "}
              <em>« les joueurs ne doivent pas pouvoir anticiper la fin du jeu »</em>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 5 — Horizon infini : la boîte à outils                      */}
      {/* ============================================================ */}
      <Section id="sec-infini" kicker="§ 5" title="Horizon infini : la boîte à outils">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Si la fin du jeu tue la coopération… supprimons la fin ! Le dilemme du prisonnier est
          maintenant répété un nombre <strong>infini</strong> de périodes : 0, 1, 2, …,{" "}
          <M tex="t" />, <M tex="t+1" />, … Avant d'y chercher des équilibres, il nous faut deux
          outils mathématiques. Rassure-toi : il n'y en a que deux, et le second tient en une
          formule.
        </p>

        <H4>Outil n°1 — le payoff escompté d'une infinité de périodes</H4>
        <p>
          En période 0, un joueur évalue le jeu entier comme en § 3, mais la somme ne s'arrête
          plus :
        </p>
        <FormulaBox
          tex="\Pi \;=\; \pi_0 + \delta\,\pi_1 + \delta^2\,\pi_2 + \dots \;=\; \sum_{t=0}^{\infty} \delta^t\,\pi_t"
          label="Payoff escompté à horizon infini"
          caption={
            <>
              La somme court sur <M tex="t = 0, 1, 2, \dots" /> à l'infini. Chaque payoff futur
              est « rétréci » par une puissance de <M tex="\delta" /> de plus en plus forte : le
              jour <M tex="t" /> pèse <M tex="\delta^t" />. C'est la version « infinie » de la
              formule d'A2.
            </>
          }
        />

        <H4>Outil n°2 — sommer une infinité de termes (sans y passer l'éternité)</H4>
        <p>
          Question naturelle : si un joueur reçoit{" "}
          <strong>
            le même payoff <M tex="a" /> à chaque période
          </strong>
          , combien vaut le total ? Additionner une infinité de nombres semble impossible… mais
          comme chaque terme rétrécit, la somme <em>converge</em> vers une valeur finie :
        </p>
        <FormulaBox
          tex="\sum_{t=0}^{\infty} \delta^t\,a \;=\; \frac{a}{1-\delta}"
          label="La formule magique du chapitre"
        />

        <Callout variant="intuition" title="💡 D'où sort cette formule ? (l'astuce en 3 lignes)">
          <p>
            Appelle <M tex="S = a + \delta a + \delta^2 a + \dots" /> Multiplie tout par{" "}
            <M tex="\delta" /> : <M tex="\delta S = \delta a + \delta^2 a + \dots" /> —
            c'est-à-dire exactement <M tex="S" /> privé de son premier terme ! Donc{" "}
            <M tex="S - \delta S = a" />, soit <M tex="S(1-\delta) = a" />, soit{" "}
            <strong>
              <M tex="S = a/(1-\delta)" />
            </strong>
            . Cette astuce « décaler puis soustraire » ressert dans la preuve du § 7 —
            apprends-la, pas seulement la formule.
          </p>
        </Callout>

        <GeometricSeriesExplorer />

        <Quiz
          scope="b3"
          id="q4"
          question={
            <>
              Un fritkot patient (<M tex="\delta = 0{,}9" />) reçoit 2 à chaque période pour
              toujours (guerre des prix). Valeur totale ?
            </>
          }
          options={[
            {
              text: <>20, car 2 × 10 périodes.</>,
              explain: (
                <>
                  C'est la somme SANS escompte de 10 périodes. Ici on somme à l'infini avec
                  escompte : 2/(1 − 0,9).
                </>
              ),
            },
            {
              text: <>2/(1 − 0,9) = 20.</>,
              correct: true,
              explain: (
                <>
                  Oui : 2/(1 − 0,9) = 2/0,1 = 20. Note la coïncidence amusante avec la mauvaise
                  réponse du dessus — mais ton raisonnement, lui, doit passer par la formule{" "}
                  <M tex="a/(1-\delta)" />.
                </>
              ),
            },
            {
              text: <>L'infini : on additionne une infinité de 2.</>,
              explain: (
                <>
                  Une somme infinie de termes qui rétrécissent assez vite converge vers une
                  valeur finie — c'est tout l'intérêt de la formule <M tex="a/(1-\delta)" />.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 5)">
          <ul>
            <li>
              La formule du payoff escompté :{" "}
              <strong>
                <M tex="\Pi = \sum \delta^t \pi_t" />
              </strong>
              .
            </li>
            <li>
              La formule magique{" "}
              <strong>
                <M tex="\sum \delta^t a = a/(1-\delta)" />
              </strong>{" "}
              — ET son astuce de preuve (décaler, soustraire).
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 6 — « Toujours trahir » reste un équilibre                  */}
      {/* ============================================================ */}
      <Section id="sec-tt" kicker="§ 6" title="« Toujours trahir » reste un équilibre">
        <p className="text-[1.1rem] italic text-muted-foreground">
          L'horizon infini ouvre des portes… mais commençons par une douche froide : le mauvais
          équilibre de B1 ne disparaît pas pour autant.
        </p>

        <Callout
          variant="definition"
          title={
            <>
              📖 Définition — stratégie « toujours trahir » <M tex="s^{TT}" />
            </>
          }
        >
          <p>
            Le joueur trahit à <strong>toutes</strong> les périodes, quoi que son adversaire ait
            joué dans le passé. (Une stratégie « sourde » : elle ignore l'histoire du jeu.)
          </p>
        </Callout>

        <p>
          <strong>Affirmation :</strong> le profil (<M tex="s_1^{TT}" />, <M tex="s_2^{TT}" />)
          est un ENPS.
        </p>

        <Callout variant="methode" title="La méthode de tout le chapitre">
          <p>
            Pour montrer qu'un profil est un équilibre, on montre que les stratégies sont des{" "}
            <strong>meilleures réponses mutuelles</strong> — c'est-à-dire qu'aucun joueur ne peut
            faire strictement mieux en déviant seul. Retiens-la : c'est la méthode utilisée dans
            toutes les démonstrations de B3.
          </p>
        </Callout>

        <p>
          Si le <span className="font-semibold text-rose-700">joueur 1</span> trahit toujours,
          que peut faire le <span className="font-semibold text-sky-700">joueur 2</span> ? S'il
          trahit toujours aussi :
        </p>
        <MB tex="\Pi_2(s_1^{TT}, s_2^{TT}) \;=\; 2 + 2\delta + 2\delta^2 + \dots \;=\; \frac{2}{1-\delta}" />
        <p>
          Et avec <em>n'importe quelle autre</em> stratégie <M tex="s_2" /> ? Face à un
          adversaire qui trahit tout le temps, le joueur 2 ne peut gagner que <strong>2</strong>{" "}
          (en trahissant) ou <strong>0</strong> (en coopérant) à chaque période. Donc{" "}
          <M tex="\pi_t \le 2" /> pour tout <M tex="t" />, et :
        </p>
        <MB tex="\Pi_2(s_1^{TT}, s_2) \;=\; \pi_0 + \delta\,\pi_1 + \dots \;\le\; \frac{2}{1-\delta}" />
        <p>
          Impossible de faire mieux : <M tex="s_2^{TT}" /> est une meilleure réponse à{" "}
          <M tex="s_1^{TT}" />. Par symétrie, l'inverse aussi :{" "}
          <strong>
            (<M tex="s_1^{TT}" />, <M tex="s_2^{TT}" />) est un ENPS
          </strong>
          . Sans surprise, il n'est donc <em>pas garanti</em> que deux joueurs rationnels
          coopèrent, même sur un horizon infini. La vraie question est plutôt : la coopération
          est-elle <em>possible</em> ?
        </p>

        <Callout variant="attention" title="⚠️ Piège d'examen classique">
          <p>
            « Horizon infini ⇒ les joueurs coopèrent » est <strong>FAUX</strong>. L'horizon
            infini rend la coopération <em>possible</em> (§ 7), pas <em>certaine</em> :
            « toujours trahir contre toujours trahir » reste un ENPS parfaitement valable. Un
            jeu répété à l'infini a <em>plusieurs</em> ENPS.
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 6)">
          <ul>
            <li>
              La méthode : <strong>ENPS ⇔ meilleures réponses mutuelles</strong> (on teste toutes
              les déviations d'un joueur, l'autre étant fixé).
            </li>
            <li>
              Le calcul <M tex="\Pi_2 = 2/(1-\delta)" /> et l'argument de majoration «{" "}
              <M tex="\pi_t \le 2" /> pour tout <M tex="t" /> ».
            </li>
            <li>
              La nuance <strong>possible ≠ garanti</strong>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 7 — Grim contre grim : δ ≥ 1/2                              */}
      {/* ============================================================ */}
      <Section
        id="sec-grim"
        kicker="§ 7"
        title={
          <>
            Grim contre grim : la condition <M tex="\delta \ge 1/2" />
          </>
        }
      >
        <p className="text-[1.1rem] italic text-muted-foreground">
          Voici LE résultat du chapitre — celui que tu dois savoir redémontrer les yeux fermés à
          l'examen. On reprend la stratégie grim du § 3, mais cette fois la menace ne peut plus
          s'éteindre : il y a toujours un lendemain pour punir.
        </p>

        <H4>Étape 1 — le payoff si tout le monde coopère</H4>
        <p>
          Si le <span className="font-semibold text-rose-700">joueur 1</span> joue{" "}
          <M tex="s_1^{G}" /> et le <span className="font-semibold text-sky-700">joueur 2</span>{" "}
          joue <M tex="s_2^{G}" />, personne ne trahit jamais : les deux coopèrent à chaque
          période et touchent 4 pour toujours :
        </p>
        <MB tex="\Pi_2(s_1^{G}, s_2^{G}) \;=\; 4 + 4\delta + 4\delta^2 + \dots \;=\; \frac{4}{1-\delta}" />

        <H4>Étape 2 — que rapporte la meilleure déviation ?</H4>
        <p>
          Pour que dévier vers une stratégie <M tex="s_2" /> soit profitable, il faut que 2
          trahisse (pour la première fois) à une période <M tex="t" />. Mais alors la machine
          infernale s'enclenche : puisque 1 joue grim,{" "}
          <strong>1 trahira toutes les périodes suivantes</strong>. Face à ça, le mieux que 2
          puisse faire ensuite est de trahir aussi pour toujours. Voici le film de la déviation :
        </p>

        <DeviationFilmTable />

        <p>
          Lis la dernière ligne : la trahison offre à 2 un <strong>festin unique de 6</strong>{" "}
          (il vend à prix cassé pendant que 1 reste cher)… suivi d'une{" "}
          <strong>éternité à 2</strong> (guerre des prix). Pour simplifier les calculs, plaçons
          la première trahison en <M tex="t = 0" /> (le raisonnement est identique pour tout{" "}
          <M tex="t" />, car le jeu « redémarre à l'identique » à chaque période) :
        </p>
        <MB tex="\Pi_2(s_1^{G}, s_2) \;=\; 6 + 2\delta + 2\delta^2 + 2\delta^3 + \dots" />
        <MB tex="=\; 6 + \delta\,(2 + 2\delta + 2\delta^2 + \dots) \;=\; 6 + \delta\,\frac{2}{1-\delta}" />
        <p>
          (on a « mis <M tex="\delta" /> en évidence » pour faire apparaître la somme infinie de
          2 — c'est l'astuce du § 5 !)
        </p>

        <H4>Étape 3 — coopérer bat dévier si…</H4>
        <p>
          <M tex="s_2^{G}" /> est une meilleure réponse à <M tex="s_1^{G}" /> si le payoff de
          coopération est au moins celui de la déviation :
        </p>
        <MB tex="\frac{4}{1-\delta} \;\ge\; 6 + \delta\,\frac{2}{1-\delta}" />
        <p>
          Multiplie tout par <M tex="(1-\delta) > 0" /> (le sens de l'inégalité ne change pas) :
        </p>
        <MB tex="4 \;\ge\; 6(1-\delta) + 2\delta \;=\; 6 - 4\delta \;\iff\; 4\delta \ge 2 \;\iff\; \boxed{\;\delta \ge \tfrac{1}{2}\;}" />

        <Callout variant="retiens" title="🏛️ Résultat central du chapitre">
          <p>
            Si <M tex="\delta \ge 1/2" />, alors (<M tex="s_1^{G}" />, <M tex="s_2^{G}" />) est
            un ENPS du dilemme du prisonnier répété à l'infini :{" "}
            <strong>des joueurs rationnels peuvent coopérer</strong>, à condition de ne pas être
            trop impatients. Si <M tex="\delta < 1/2" />, les joueurs ne se soucient pas assez
            des payoffs futurs : la menace de les voir diminuer n'inflige pas un coût assez élevé
            pour dissuader de trahir.
          </p>
        </Callout>

        <ThresholdDuel />

        <Callout variant="examen" title="⚠️ Deux réflexes pour l'examen">
          <ul>
            <li>
              <strong>D'où vient chaque morceau :</strong> <M tex="4/(1-\delta)" /> = coopération
              éternelle ; <M tex="6" /> = tentation immédiate ; <M tex="2\delta/(1-\delta)" /> =
              punition éternelle <em>qui commence demain</em> (d'où le <M tex="\delta" /> devant
              !). Oublier ce <M tex="\delta" /> est LA faute classique.
            </li>
            <li>
              <strong>
                Pourquoi « dévier une seule fois puis revenir » n'est pas envisagé :
              </strong>{" "}
              parce que face à un grim, revenir à C après avoir trahi rapporte 0 (tu coopères, il
              te trahit). Une fois la gâchette pressée, trahir pour toujours est la meilleure
              suite possible — c'est pour ça que la déviation étudiée est « 6 puis 2 pour
              toujours ».
            </li>
          </ul>
        </Callout>

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 7)">
          <ul>
            <li>
              Refaire la démonstration complète en 3 étapes :{" "}
              <strong>
                <M tex="4/(1-\delta)" />
              </strong>{" "}
              vs{" "}
              <strong>
                <M tex="6 + 2\delta/(1-\delta)" />
              </strong>
              , puis résoudre l'inégalité jusqu'à{" "}
              <strong>
                <M tex="\delta \ge 1/2" />
              </strong>
              .
            </li>
            <li>Interpréter chaque terme économiquement (tentation, punition, patience).</li>
            <li>
              Savoir dire pourquoi on peut supposer la déviation en <M tex="t = 0" /> (le jeu
              infini « se ressemble » à toutes les périodes).
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 8 — Interpréter & généraliser                               */}
      {/* ============================================================ */}
      <Section id="sec-interp" kicker="§ 8" title="Interpréter & généraliser">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Le calcul est fait. Prenons trois pas de recul : que signifie vraiment «{" "}
          <M tex="\delta \ge 1/2" /> » ? Personne ne vit éternellement, alors à quoi sert un
          horizon infini ? Et le seuil 1/2, d'où vient-il ?
        </p>

        <H4>1. « Ne pas être trop impatient »</H4>
        <p>
          La coopération tient si la <strong>peur du futur</strong> pèse plus lourd que la{" "}
          <strong>gourmandise du présent</strong>. Trahir, c'est échanger +2 aujourd'hui (6 au
          lieu de 4) contre −2 à chaque période future (2 au lieu de 4). Un joueur patient (
          <M tex="\delta" /> élevé) donne beaucoup de valeur à ces pertes futures ⇒ il coopère.
          Un joueur impatient (<M tex="\delta" /> faible) les balaye d'un revers de main ⇒ il
          trahit.
        </p>

        <H4>2. « Mais personne ne vit un nombre infini de périodes ! »</H4>
        <p>
          Objection légitime — et le cours y répond : l'infini n'est{" "}
          <strong>pas nécessaire</strong>. Il suffit qu'à chaque période, il y ait une{" "}
          <strong>probabilité non-nulle que le jeu soit répété</strong> à la période suivante. Ce
          qui compte, ce n'est pas que le jeu soit réellement éternel, c'est que{" "}
          <strong>les joueurs ne puissent jamais dire « c'est la dernière fois »</strong> — car
          c'est cette certitude-là qui déclenche l'effet domino du § 4. (Clin d'œil à A3 : on
          peut d'ailleurs relire <M tex="\delta" /> comme mêlant impatience <em>et</em>{" "}
          probabilité de survie du jeu.)
        </p>

        <H4>3. Le seuil dépend des payoffs — la formule générale</H4>
        <p>
          Le 1/2 n'a rien de magique : il vient des nombres 4, 6 et 2. Refais la démonstration du
          § 7 avec un jeu où coopérer rapporte <M tex="c" />, la tentation vaut <M tex="t" /> et
          la punition <M tex="p" /> (avec <M tex="t > c > p" />) : la condition devient
        </p>
        <FormulaBox
          tex="\delta \;\ge\; \frac{t-c}{t-p} \;=\; \frac{\text{tentation immédiate}}{\text{tentation immédiate} + \text{coût de la punition}}"
          label="Le seuil général de coopération"
          caption={
            <>
              Vérification avec les nombres du cours : (6 − 4)/(6 − 2) = 1/2 ✓. (Le dénominateur
              se décompose en <M tex="t - p = (t-c) + (c-p)" /> : tentation + coût par période de
              la punition.)
            </>
          }
        />

        <GeneralThreshold />

        <Callout
          variant="intuition"
          title="💡 Conclusion officielle du chapitre (à savoir reformuler)"
        >
          <p>
            La coopération peut émerger entre joueurs rationnels, même si les incitants
            individuels poussent chaque période à trahir,{" "}
            <strong>
              pourvu que les joueurs ne sachent pas d'avance quelle sera la dernière période
            </strong>
            . Elle est possible si chacun peut menacer l'autre d'une punition dont le coût est
            suffisamment élevé — coût qui dépend (1) des{" "}
            <strong>payoffs du jeu simultané</strong> et (2) du{" "}
            <strong>facteur d'escompte du joueur puni</strong>.
          </p>
        </Callout>

        <Quiz
          scope="b3"
          id="q5"
          question={<>Dans la vraie vie, quel cartel a le plus de chances de tenir ?</>}
          options={[
            {
              text: (
                <>
                  Deux entreprises au bord de la faillite, qui ont un besoin urgent de
                  liquidités.
                </>
              ),
              explain: (
                <>
                  C'est l'inverse : une entreprise au bord de la faillite est ultra-impatiente
                  (son <M tex="\delta" /> effectif est faible : demain, elle n'existera peut-être
                  plus). Elle a tout intérêt à casser les prix aujourd'hui.
                </>
              ),
            },
            {
              text: <>Deux entreprises solidement installées, sûres d'être encore là dans 20 ans.</>,
              correct: true,
              explain: (
                <>
                  Oui : des acteurs installés, sûrs de se recroiser indéfiniment (forte
                  probabilité de continuation) et pas pressés (<M tex="\delta" /> élevé),
                  remplissent les deux conditions de la coopération. C'est pour ça que les
                  autorités de la concurrence surveillent les marchés stables à peu d'acteurs.
                </>
              ),
            },
            {
              text: <>Deux entreprises sur un marché qui ferme définitivement dans 3 mois.</>,
              explain: (
                <>
                  Un marché qui disparaît bientôt = une dernière période prévisible = effet
                  domino du § 4 : la coopération s'effondre.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 8)">
          <ul>
            <li>
              Interpréter{" "}
              <strong>
                <M tex="\delta \ge 1/2" />
              </strong>{" "}
              en français : patience suffisante = coopération possible.
            </li>
            <li>
              L'argument de la <strong>probabilité de continuation</strong> : l'infini n'est pas
              nécessaire, l'imprévisibilité de la fin l'est.
            </li>
            <li>
              Les deux déterminants du coût de la punition :{" "}
              <strong>payoffs du jeu simultané</strong> +{" "}
              <strong>facteur d'escompte du puni</strong>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 9 — Le tournoi d'Axelrod                                    */}
      {/* ============================================================ */}
      <Section id="sec-axelrod" kicker="§ 9" title="Le tournoi d'Axelrod">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Quittons le tableau noir : que se passe-t-il quand on fait <em>vraiment</em>{" "}
          s'affronter des stratégies ? Dans les années 1980, le politologue Robert Axelrod a
          organisé un tournoi devenu légendaire.
        </p>

        <ul className="mt-4">
          <li>
            Chaque participant soumettait une{" "}
            <strong>stratégie encodée dans un programme informatique</strong>.
          </li>
          <li>
            Chaque stratégie affrontait <strong>chacune des autres</strong> pendant{" "}
            <strong>200 périodes</strong> de dilemme du prisonnier répété.
          </li>
          <li>
            La stratégie au <strong>payoff moyen le plus élevé</strong> gagnait.
          </li>
        </ul>

        <Callout
          variant="exemple"
          title="🏆 Le vainqueur — « Tit-for-Tat » (donnant-donnant), soumis par Anatol Rapoport"
        >
          <ul>
            <li>
              le joueur <strong>coopère en période 0</strong> ;
            </li>
            <li>
              en période <M tex="t" />, il{" "}
              <strong>
                copie ce que l'adversaire a joué en <M tex="t-1" />
              </strong>{" "}
              : coopère si l'autre a coopéré, trahit sinon.
            </li>
          </ul>
          <p>
            La plus simple des stratégies soumises… et la gagnante. Autre résultat marquant : les
            stratégies « <strong>gentilles</strong> » (qui ne trahissent jamais les premières)
            ont <strong>toutes</strong> mieux performé que les stratégies non gentilles.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Ne confonds pas grim et tit-for-tat">
          <p>
            Les deux commencent par coopérer et punissent la trahison. La différence est la{" "}
            <strong>mémoire</strong> : grim ne pardonne <em>jamais</em> (une trahison = guerre
            éternelle), tit-for-tat ne regarde que <em>la dernière période</em> et pardonne dès
            que l'adversaire recoopère. TfT est punitive ET indulgente — c'est le secret de son
            succès.
          </p>
        </Callout>

        <FestivalSimulator />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 9)">
          <ul>
            <li>
              Le protocole du tournoi (stratégies programmées, round-robin, 200 périodes, payoff
              moyen).
            </li>
            <li>
              La définition exacte de <strong>Tit-for-Tat</strong> et sa différence avec grim.
            </li>
            <li>
              Le résultat sur les stratégies <strong>« gentilles »</strong> : ne jamais trahir en
              premier a payé.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 10 — Au laboratoire                                         */}
      {/* ============================================================ */}
      <Section id="sec-labo" kicker="§ 10" title="Au laboratoire : et les vrais humains ?">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Dernier éclairage — celui de l'économie expérimentale, comme à la fin de chaque
          chapitre du cours. Des étudiants ont joué le dilemme du prisonnier répété (10 rounds),
          en connaissant l'identité de leur adversaire et en pouvant discuter entre les rounds.
          La théorie de l'horizon fini prédit : trahison à tous les rounds. Verdict ?
        </p>

        <div className="my-5 grid gap-3 sm:grid-cols-2">
          {[
            {
              tag: "Observation 1 · contredit la théorie",
              tone: "bad" as const,
              body: (
                <>
                  Une <strong>grosse moitié des paires a coopéré du début à la fin</strong>, sans
                  une seule trahison. (La théorie prédisait 0 % !)
                </>
              ),
            },
            {
              tag: "Observation 2 · contredit la théorie",
              tone: "bad" as const,
              body: (
                <>
                  <strong>Aucune paire n'a trahi du début à la fin</strong> : toutes ont connu
                  des rounds de coopération mutuelle.
                </>
              ),
            },
            {
              tag: "Observation 3 · conforme à l'intuition théorique",
              tone: "good" as const,
              body: (
                <>
                  Parmi les paires qui n'ont pas coopéré tout du long, on observe souvent une{" "}
                  <strong>trahison au dernier round</strong> — l'intuition de la backward
                  induction est donc bien réelle… mais elle ne « remonte » pas jusqu'au début
                  comme le prédit la théorie.
                </>
              ),
            },
            {
              tag: "Observation 4 · contredit la stratégie grim",
              tone: "bad" as const,
              body: (
                <>
                  Les trahisons du premier round n'ont{" "}
                  <strong>pas déclenché de réaction extrême</strong> : aucun étudiant n'a utilisé
                  la stratégie grim. (Les humains pardonnent — encore un point pour
                  tit-for-tat.)
                </>
              ),
            },
          ].map((o, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
              <div
                className={cn(
                  "mb-1.5 text-[11px] font-bold uppercase tracking-wider",
                  o.tone === "good" ? "text-emerald-700" : "text-rose-700",
                )}
              >
                {o.tag}
              </div>
              <div className="text-sm leading-relaxed">{o.body}</div>
            </div>
          ))}
        </div>

        <Callout variant="intuition" title="💡 Comment lire ces résultats">
          <p>
            Le message est le même que dans les chapitres A : le modèle rationnel capture une{" "}
            <strong>force réelle</strong> (la tentation de fin de partie existe : on trahit au
            round 10 !) mais les humains coopèrent <em>beaucoup plus</em> que prédit —
            réciprocité, communication, normes sociales et réputation font le reste. Le théorème
            du § 4 est un point de repère, pas une photographie du monde.
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 10)">
          <ul>
            <li>
              Les 4 observations du laboratoire, et pour chacune :{" "}
              <strong>conforme ou non à la prédiction théorique ?</strong>
            </li>
            <li>
              La trahison fréquente au <strong>dernier round</strong> = la trace empirique de la
              backward induction.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 11 — Exercices récapitulatifs                               */}
      {/* ============================================================ */}
      <Section id="sec-exos" kicker="§ 11" title="Exercices récapitulatifs">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Cinq exercices, du plus mécanique au plus « type examen ». Cherche d'abord sur papier,
          puis compare avec la solution détaillée.
        </p>

        <ExerciseBlock
          scope="b3"
          id="ex1"
          number={1}
          title="Calculer un payoff escompté (échauffement)"
          difficulty={1}
          refs={[
            { chapter: "b3", section: "sec-deux", label: "Payoff Π = π₀ + δπ₁" },
            { chapter: "a2", section: "outils", label: "Facteur d'escompte δ" },
          ]}
          statement={
            <p>
              Un fritkot a un facteur d'escompte <M tex="\delta = 0{,}8" />. Sur les trois jours
              du festival, ses payoffs de période sont <M tex="\pi_0 = 4" />,{" "}
              <M tex="\pi_1 = 0" />, <M tex="\pi_2 = 2" />. Calcule son payoff total{" "}
              <M tex="\Pi" />. Puis refais le calcul avec <M tex="\delta = 0{,}5" />. Que
              remarques-tu ?
            </p>
          }
          steps={[
            {
              title: "Poser la formule (attention au δ²)",
              content: (
                <p>
                  La formule : <M tex="\Pi = \pi_0 + \delta\,\pi_1 + \delta^2\,\pi_2" />.
                  Attention : le jour 2 est escompté par <M tex="\delta^2" /> (deux jours
                  d'attente), pas <M tex="\delta" />.
                </p>
              ),
            },
            {
              title: "Calculer avec δ = 0,8",
              content: (
                <p>
                  Avec <M tex="\delta = 0{,}8" /> :{" "}
                  <M tex="\Pi = 4 + 0{,}8 \times 0 + 0{,}64 \times 2 = 4 + 0 + 1{,}28 = \mathbf{5{,}28}" />
                  .
                </p>
              ),
            },
            {
              title: "Calculer avec δ = 0,5 et comparer",
              content: (
                <p>
                  Avec <M tex="\delta = 0{,}5" /> :{" "}
                  <M tex="\Pi = 4 + 0 + 0{,}25 \times 2 = \mathbf{4{,}5}" />. Même séquence de
                  payoffs, total plus faible : plus un joueur est impatient, moins le futur pèse
                  dans son évaluation. C'est ce mécanisme qui décidera de la coopération.
                </p>
              ),
            },
          ]}
          result={
            <p>
              <M tex="\Pi = 5{,}28" /> avec <M tex="\delta = 0{,}8" /> ; <M tex="\Pi = 4{,}5" />{" "}
              avec <M tex="\delta = 0{,}5" />. À retenir : chaque période d'attente multiplie par{" "}
              <M tex="\delta" /> — et l'impatience « rétrécit » le futur.
            </p>
          }
        />

        <ExerciseBlock
          scope="b3"
          id="ex2"
          number={2}
          title="Deux périodes, rédaction complète (type examen)"
          difficulty={2}
          refs={[{ chapter: "b3", section: "sec-deux", label: "Grim à deux périodes" }]}
          statement={
            <p>
              Le dilemme du fritkot est joué exactement 2 fois. Le joueur 1 annonce qu'il jouera
              la stratégie grim <M tex="s_1^{G}" />. Montre rigoureusement que répondre par{" "}
              <M tex="s_2^{G}" /> n'est <em>pas</em> une meilleure réponse pour le joueur 2, quel
              que soit <M tex="\delta \in [0,1]" />.
            </p>
          }
          steps={[
            {
              title: "Payoff de s₂ᴳ face à s₁ᴳ",
              content: (
                <p>
                  Les deux coopèrent aux deux périodes ⇒ <M tex="\Pi_2 = 4 + 4\delta" />.
                </p>
              ),
            },
            {
              title: "Déviation candidate s₂′ : coopérer puis trahir",
              content: (
                <p>
                  <M tex="s_2'" /> : coopérer en période 0, trahir en période 1. En période 0, 1
                  n'a rien à punir donc coopère ⇒ <M tex="\pi_0 = 4" />. En période 1, 2 trahit
                  pendant que 1 coopère encore (le grim de 1 punit ce qui s'est passé{" "}
                  <em>avant</em> la période 1, or rien ne s'est passé) ⇒ <M tex="\pi_1 = 6" />.
                  Donc <M tex="\Pi_2' = 4 + 6\delta" />.
                </p>
              ),
            },
            {
              title: "Comparaison et conclusion",
              content: (
                <p>
                  <M tex="\Pi_2' - \Pi_2 = (4+6\delta) - (4+4\delta) = 2\delta \ge 0" />, avec
                  inégalité stricte dès que <M tex="\delta > 0" />. Trahir au dernier jour est
                  donc (faiblement) toujours mieux : la menace grim est vide en dernière période,
                  et (<M tex="s_1^{G}" />, <M tex="s_2^{G}" />) n'est pas un ENPS.{" "}
                  <em>
                    (Si <M tex="\delta = 0" />, la déviation « trahir les deux périodes », qui
                    rapporte <M tex="6 + 2\delta = 6 > 4" />, fait strictement mieux — la
                    conclusion tient donc bien pour tout <M tex="\delta" />.)
                  </em>
                </p>
              ),
            },
          ]}
          result={
            <p>
              À deux périodes (et plus généralement à horizon fini), (grim, grim) n'est{" "}
              <strong>jamais</strong> un ENPS : la punition meurt avec la dernière période.
            </p>
          }
        />

        <ExerciseBlock
          scope="b3"
          id="ex3"
          number={3}
          title="Refaire toute la machinerie avec d'autres nombres ⭐"
          difficulty={2}
          refs={[
            { chapter: "b3", section: "sec-grim", label: "La condition δ ≥ 1/2" },
            { chapter: "b3", section: "sec-interp", label: "Le seuil général" },
          ]}
          statement={
            <>
              <p>
                Deux compagnies aériennes se partagent une ligne. Chaque saison, chacune choisit
                Prix haut (C) ou Prix bas (T). Les payoffs par saison : (C,C) → (5 ; 5), (T,C) →
                (8 ; 0), (C,T) → (0 ; 8), (T,T) → (1 ; 1). Le jeu est répété à l'infini.
              </p>
              <p>
                <strong>a)</strong> Vérifie que c'est un dilemme du prisonnier.{" "}
                <strong>b)</strong> Si les deux jouent grim, quel payoff chacune obtient-elle ?{" "}
                <strong>c)</strong> Que rapporte la meilleure déviation en <M tex="t = 0" /> ?{" "}
                <strong>d)</strong> Pour quelles valeurs de <M tex="\delta" /> le profil (grim,
                grim) est-il un ENPS ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) C'est bien un dilemme du prisonnier",
              content: (
                <p>
                  Si l'autre joue C : T rapporte 8 &gt; 5. Si l'autre joue T : T rapporte 1 &gt;
                  0. T est dominante pour les deux ⇒ (T,T) est l'ESD, avec (1 ; 1) alors que
                  (5 ; 5) était possible : (T,T) n'est pas Pareto-efficace. Dilemme du prisonnier
                  ✓.
                </p>
              ),
            },
            {
              title: "b) Payoff de la coopération éternelle",
              content: (
                <p>
                  Coopération éternelle à 5 par saison :{" "}
                  <M tex="\Pi = 5 + 5\delta + 5\delta^2 + \dots = \dfrac{5}{1-\delta}" />.
                </p>
              ),
            },
            {
              title: "c) Payoff de la meilleure déviation",
              content: (
                <p>
                  Trahir en <M tex="t = 0" /> rapporte 8 immédiatement, puis déclenche la
                  guerre : 1 pour toujours à partir de <M tex="t = 1" />.{" "}
                  <M tex="\Pi^{dev} = 8 + \delta \cdot 1 + \delta^2 \cdot 1 + \dots = 8 + \dfrac{\delta}{1-\delta}" />
                  .
                </p>
              ),
            },
            {
              title: "d) Résoudre la condition",
              content: (
                <p>
                  Condition : <M tex="\dfrac{5}{1-\delta} \ge 8 + \dfrac{\delta}{1-\delta}" />.
                  On multiplie par <M tex="(1-\delta)" /> :{" "}
                  <M tex="5 \ge 8(1-\delta) + \delta = 8 - 7\delta" />{" "}
                  <M tex="\iff 7\delta \ge 3 \iff \boxed{\delta \ge 3/7 \approx 0{,}43}" />.
                  Vérification par la formule générale du § 8 :{" "}
                  <M tex="(t-c)/(t-p) = (8-5)/(8-1) = 3/7" /> ✓. Contrôle numérique : à{" "}
                  <M tex="\delta = 3/7" />, les deux payoffs valent 8,75.
                </p>
              ),
            },
          ]}
          result={
            <p>
              (grim, grim) est un ENPS dès que <M tex="\delta \ge 3/7" />. La démarche est
              toujours la même : coopération éternelle vs (tentation unique + punition éternelle
              escomptée), puis on résout l'inégalité.
            </p>
          }
        />

        <ExerciseBlock
          scope="b3"
          id="ex4"
          number={4}
          title="La fusion-acquisition (interprétation)"
          difficulty={2}
          refs={[
            { chapter: "b3", section: "sec-fini", label: "Théorème de l'horizon fini" },
            { chapter: "b3", section: "sec-labo", label: "Données de laboratoire" },
          ]}
          statement={
            <p>
              Deux supermarchés maintiennent tacitement des prix élevés depuis des années. Un
              matin, la presse annonce que l'un des deux sera{" "}
              <strong>racheté et fermé dans exactement 6 mois</strong>. D'après la théorie de ce
              chapitre, que va-t-il se passer sur les prix ? Explique avec les concepts du cours
              (2–3 phrases).
            </p>
          }
          steps={[
            {
              title: "Identifier le changement de nature du jeu",
              content: (
                <p>
                  L'annonce transforme un jeu à horizon <em>imprévisible</em> (coopération
                  soutenable) en jeu à horizon <strong>fini et connu</strong> : il y a désormais
                  une dernière période que tout le monde peut pointer.
                </p>
              ),
            },
            {
              title: "Appliquer le théorème de l'horizon fini",
              content: (
                <p>
                  Le théorème du § 4 s'applique : à la dernière période avant fermeture, plus
                  aucune punition n'est possible, donc chacun trahira ; par backward induction,
                  ce raisonnement remonte jusqu'à aujourd'hui. Prédiction : la guerre des prix
                  éclate <strong>dès l'annonce</strong>, pas dans 6 mois. (En pratique, le § 10
                  nous rappelle que l'effondrement réel est souvent plus tardif que prédit — mais
                  la trahison en « fin de partie » est bien observée.)
                </p>
              ),
            },
          ]}
          result={
            <p>
              Prédiction théorique : guerre des prix <strong>immédiate</strong>. La coopération
              tacite ne survit pas à une fin de jeu annoncée.
            </p>
          }
        />

        <ExerciseBlock
          scope="b3"
          id="ex5"
          number={5}
          title="Vrai ou faux ? (chasse aux pièges)"
          difficulty={2}
          refs={[
            { chapter: "b3", section: "sec-fini", label: "Horizon fini" },
            { chapter: "b3", section: "sec-tt", label: "Toujours trahir" },
            { chapter: "b3", section: "sec-axelrod", label: "Axelrod" },
          ]}
          statement={
            <>
              <p>
                Pour chaque affirmation, vrai ou faux — et surtout, <em>pourquoi</em> :
              </p>
              <ol>
                <li>
                  Dans le dilemme du prisonnier répété 100 fois, des joueurs très patients (
                  <M tex="\delta = 0{,}99" />) coopèrent à l'équilibre.
                </li>
                <li>
                  Dans le jeu répété à l'infini avec <M tex="\delta = 0{,}8" />, les joueurs
                  coopèrent forcément.
                </li>
                <li>
                  Face à un adversaire qui joue grim, trahir une seule fois puis recoopérer pour
                  toujours est une bonne idée si <M tex="\delta" /> est grand.
                </li>
                <li>
                  Tit-for-Tat a gagné le tournoi d'Axelrod alors que c'était l'une des stratégies
                  les plus simples.
                </li>
              </ol>
            </>
          }
          steps={[
            {
              title: "Affirmation 1 — la patience sauve-t-elle l'horizon fini ?",
              content: (
                <p>
                  <strong>FAUX.</strong> 100 est fini et le dilemme du prisonnier a un EN unique
                  ⇒ théorème du § 4 : l'unique ENPS est « T partout »,{" "}
                  <em>
                    quel que soit <M tex="\delta" />
                  </em>
                  . La patience ne sauve pas un horizon fini.
                </p>
              ),
            },
            {
              title: "Affirmation 2 — δ = 0,8 garantit-il la coopération ?",
              content: (
                <p>
                  <strong>FAUX.</strong> <M tex="0{,}8 \ge 1/2" /> rend la coopération{" "}
                  <em>possible</em> (grim-grim est un ENPS), mais « toujours trahir » reste
                  aussi un ENPS (§ 6). Possible ≠ garanti.
                </p>
              ),
            },
            {
              title: "Affirmation 3 — trahir puis recoopérer face à grim ?",
              content: (
                <p>
                  <strong>FAUX.</strong> Après ta trahison, le grim te trahit pour toujours ;
                  recoopérer face à lui rapporte 0 par période, moins encore que trahir (2). La
                  meilleure suite après avoir trahi un grim est de trahir pour toujours — c'est
                  précisément la déviation calculée au § 7.
                </p>
              ),
            },
            {
              title: "Affirmation 4 — le triomphe de la simplicité",
              content: (
                <p>
                  <strong>VRAI.</strong> Coopérer d'abord, puis copier le dernier coup de
                  l'adversaire : simple, gentille, punitive et indulgente — et victorieuse sur
                  200 périodes contre toutes les stratégies plus sophistiquées.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Les trois pièges à éviter : (1) horizon fini ⇒ pas de coopération, même très
              patient ; (2) horizon infini ⇒ coopération <em>possible</em>, pas garantie ; (3)
              face à un grim déclenché, on ne « recoopère » jamais.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 12 — QCM final & checklist                                  */}
      {/* ============================================================ */}
      <Section id="sec-final" kicker="§ 12" title="QCM final & checklist de maîtrise">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Le tour de contrôle avant de refermer le chapitre. Objectif : tout vert.
        </p>

        <Quiz
          scope="b3"
          id="q6"
          kicker="QCM final · 1/6"
          question={<>Le payoff d'un jeu répété à deux périodes s'écrit :</>}
          options={[
            {
              text: <M tex="\Pi = \pi_0 + \pi_1" />,
              explain: (
                <>
                  Sans escompte, on traiterait le futur comme le présent : il manque le{" "}
                  <M tex="\delta" /> devant <M tex="\pi_1" />.
                </>
              ),
            },
            {
              text: <M tex="\Pi = \pi_0 + \delta\pi_1" />,
              correct: true,
              explain: (
                <>
                  Oui — le payoff de demain est pondéré par <M tex="\delta" />, comme en A2.
                </>
              ),
            },
            {
              text: <M tex="\Pi = \pi_0 + \delta^2\pi_1" />,
              explain: (
                <>
                  <M tex="\delta^2" /> correspond à un payoff reçu dans DEUX périodes ; la
                  période 1 n'est escomptée que par <M tex="\delta" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b3"
          id="q7"
          kicker="QCM final · 2/6"
          question={<>Le théorème de l'horizon fini exige que le jeu simultané répété ait…</>}
          options={[
            {
              text: <>…un unique équilibre de Nash.</>,
              correct: true,
              explain: (
                <>
                  Exact : EN unique + nombre fini de répétitions ⇒ unique ENPS où cet EN est joué
                  à chaque période.
                </>
              ),
            },
            {
              text: <>…au moins deux équilibres de Nash.</>,
              explain: (
                <>
                  Non — c'est l'unicité de l'EN qui permet à la backward induction de tout
                  verrouiller.
                </>
              ),
            },
            {
              text: <>…un facteur d'escompte inférieur à 1/2.</>,
              explain: (
                <>
                  Le théorème ne mentionne pas <M tex="\delta" /> : sa conclusion vaut pour tout
                  facteur d'escompte.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b3"
          id="q8"
          kicker="QCM final · 3/6"
          question={
            <>
              Dans la condition{" "}
              <M tex="\tfrac{4}{1-\delta} \ge 6 + \tfrac{2\delta}{1-\delta}" />, le terme « 6 »
              représente…
            </>
          }
          options={[
            {
              text: <>…la punition infligée par l'adversaire.</>,
              explain: (
                <>
                  La punition, c'est le <M tex="2/(1-\delta)" /> multiplié par <M tex="\delta" />{" "}
                  : la guerre des prix qui commence demain.
                </>
              ),
            },
            {
              text: <>…le gain immédiat de la trahison, encaissé une seule fois.</>,
              correct: true,
              explain: (
                <>
                  Oui : le festin du traître — il vend à prix bas pendant que l'autre coopère
                  encore. Un seul jour de gloire, puis l'éternité à 2.
                </>
              ),
            },
            {
              text: <>…le payoff de la coopération éternelle.</>,
              explain: (
                <>
                  La coopération éternelle, c'est le membre de gauche : <M tex="4/(1-\delta)" />.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b3"
          id="q9"
          kicker="QCM final · 4/6"
          question={
            <>
              Avec <M tex="\delta = 0{,}6" />, face à un adversaire grim, que vaut-il mieux faire
              (jeu du cours) ?
            </>
          }
          options={[
            {
              text: <>Coopérer : 10 contre 9 pour la trahison.</>,
              correct: true,
              explain: (
                <>
                  Oui : coopérer donne 4/0,4 = 10 ; trahir donne 6 + 2 × 0,6/0,4 = 6 + 3 = 9. Et
                  de toute façon 0,6 ≥ 1/2 : on est dans la zone de coopération.
                </>
              ),
            },
            {
              text: <>Trahir : 9 contre 8 pour la coopération.</>,
              explain: (
                <>
                  Refais le calcul : coopérer = 4/(1 − 0,6) = 10 ; trahir = 6 + 0,6 × 2/(1 − 0,6)
                  = 9. La coopération gagne.
                </>
              ),
            },
            {
              text: <>Les deux options sont équivalentes.</>,
              explain: (
                <>
                  Si — les deux stratégies donnent des payoffs bien définis : 10 contre 9. Le
                  seuil d'indifférence est <M tex="\delta = 1/2" />, pas 0,6.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b3"
          id="q10"
          kicker="QCM final · 5/6"
          question={
            <>
              Pourquoi la coopération peut-elle exister dans la vraie vie, alors que personne ne
              vit « à l'infini » ?
            </>
          }
          options={[
            {
              text: <>Parce que les humains sont irrationnels et n'y comprennent rien.</>,
              explain: (
                <>
                  Non : le § 10 montre au contraire que les humains coopèrent PLUS que la théorie
                  ne le prédit. Et la question porte sur l'argument théorique du cours.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'il suffit que la fin du jeu soit imprévisible : à chaque période, une
                  probabilité non-nulle de continuer.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : il suffit d'une probabilité non-nulle, à chaque période, que le
                  jeu continue. Ce qui tue la coopération, ce n'est pas la finitude — c'est de
                  pouvoir POINTER la dernière période.
                </>
              ),
            },
            {
              text: <>Parce qu'on peut signer des contrats qui obligent à coopérer.</>,
              explain: (
                <>
                  Les contrats de cartel sont justement impossibles (jeu non-coopératif) : la
                  coopération doit tenir par le seul intérêt de chacun.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b3"
          id="q11"
          kicker="QCM final · 6/6"
          question={<>Laquelle de ces stratégies est « gentille » ET « indulgente » ?</>}
          options={[
            {
              text: <>Grim</>,
              explain: (
                <>
                  Grim est gentille (ne trahit jamais la première) mais impitoyable : elle ne
                  pardonne jamais.
                </>
              ),
            },
            {
              text: <>Toujours trahir</>,
              explain: (
                <>
                  Toujours trahir n'est ni gentille ni indulgente — elle trahit en premier et
                  pour toujours.
                </>
              ),
            },
            {
              text: <>Tit-for-Tat</>,
              correct: true,
              explain: (
                <>
                  Oui : elle ne trahit jamais la première (gentille) et recoopère dès que
                  l'adversaire recoopère (indulgente). C'est la gagnante d'Axelrod.
                </>
              ),
            },
          ]}
        />

        <H4>Checklist de maîtrise — coche honnêtement !</H4>
        <MasteryChecklist
          items={[
            <>
              Je sais raconter le dilemme du fritkot et montrer que (T, T) est un ESD non
              Pareto-efficace.
            </>,
            <>
              Je connais les 4 caractéristiques des jeux de B3 (non-coopératif, séquentiel, info
              complète mais imparfaite, répété).
            </>,
            <>
              Je sais qu'une stratégie de jeu répété est un plan contingent à toute l'histoire du
              jeu.
            </>,
            <>
              Je sais écrire <M tex="\Pi = \pi_0 + \delta\pi_1" /> (2 périodes) et{" "}
              <M tex="\Pi = \sum \delta^t \pi_t" /> (infini).
            </>,
            <>Je peux définir la stratégie grim sans regarder mes notes.</>,
            <>
              Je sais démontrer qu'à 2 périodes, grim-grim n'est pas un ENPS (via{" "}
              <M tex="4+4\delta" /> vs <M tex="4+6\delta" />).
            </>,
            <>
              Je connais le théorème de l'horizon fini (hypothèses ET conclusion) et son
              raisonnement en domino.
            </>,
            <>
              Je connais la formule <M tex="\sum \delta^t a = a/(1-\delta)" /> et je sais la
              redémontrer (décaler-soustraire).
            </>,
            <>
              Je sais montrer que (toujours trahir, toujours trahir) est un ENPS de l'horizon
              infini.
            </>,
            <>
              Je sais dériver la condition <M tex="\delta \ge 1/2" /> de bout en bout, et
              interpréter chaque terme.
            </>,
            <>
              Je peux expliquer pourquoi l'infini n'est pas nécessaire (probabilité de
              continuation).
            </>,
            <>
              Je connais Tit-for-Tat, le tournoi d'Axelrod et les 4 observations du laboratoire.
            </>,
          ]}
        />

        <Callout variant="retiens" title="🧭 Et après ?">
          <p>
            Avec B3, tu boucles le triptyque de théorie des jeux : <strong>B1</strong> (une seule
            interaction simultanée), les <strong>jeux séquentiels et les contrats</strong> (le
            temps entre en scène : engagement, incitants), <strong>B3</strong> (la répétition, ou
            comment le futur discipline le présent). Retiens le fil rouge :{" "}
            <em>
              plus le futur a de valeur, plus les comportements coopératifs deviennent rationnels
            </em>{" "}
            — une idée que tu recroiseras partout, des cartels à la réputation des vendeurs en
            ligne. Prochaine étape : les <strong>jeux bayésiens</strong> (B4), où l'on ne connaît
            même plus l'adversaire.
          </p>
        </Callout>

        <div className="mt-8 rounded-xl border bg-muted/40 px-4 py-3 text-[13.5px] leading-relaxed text-muted-foreground">
          <strong>Notes de rigueur.</strong> (1) Slide 7 du cours : la comparaison des trois
          payoffs (<M tex="4+4\delta" />, <M tex="6+2\delta" />, <M tex="4+6\delta" />) montre
          que <M tex="s_2^{G}" /> n'est pas une meilleure réponse ; pour <M tex="\delta = 0" />{" "}
          la déviation « coopérer puis trahir » fait aussi bien (écart <M tex="2\delta = 0" />)
          et c'est alors « toujours trahir » (6 &gt; 4) qui fait strictement mieux — la
          conclusion du cours vaut donc pour tout <M tex="\delta" />. (2) Au § 7, supposer la
          première trahison en <M tex="t = 0" /> est sans perte de généralité : le jeu infini est
          identique vu de chaque période (stationnarité), l'inégalité obtenue est donc la même
          pour tout <M tex="t" />. (3) La condition <M tex="\delta \ge 1/2" /> est spécifique aux
          payoffs (4, 6, 2, 0) du fritkot ; la forme générale <M tex="(t-c)/(t-p)" /> du § 8 est
          un prolongement du cours, utile pour vérifier tes calculs.
        </div>
      </Section>
    </ChapterShell>
  );
}
