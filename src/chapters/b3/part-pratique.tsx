/*
 * Chapitre B3 — PartPratique : § 9 à § 12 (slides 16-17 du deck S8 « Jeux répétés »).
 * § 9 le tournoi d'Axelrod (slide 16) · § 10 le comportement en laboratoire (slide 17) ·
 * § 11 exercices récapitulatifs · § 12 QCM final & checklist.
 * Les deux petits widgets propres au § 9 (l'« écho » Tit-for-Tat / grim et le mini-tournoi
 * illustratif) sont définis en haut de ce fichier ; ils appliquent les définitions exactes
 * des slides 7 et 16.
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { InteractiveCard } from "@/components/course/Interactive";
import { FestivalSimulator, MasteryChecklist } from "./interactives";
import { H4 } from "./ui";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Pastille de renvoi au slide (repère pour réviser avec le deck S8). */
function Slide({ n }: { n: string }) {
  return (
    <span className="ml-1 inline-flex items-center rounded-md border px-1.5 py-0.5 align-middle text-[11.5px] font-semibold text-muted-foreground">
      slide {n}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Les stratégies du cours, codées mot pour mot                         */
/* ------------------------------------------------------------------ */

type Move = "C" | "T";

/** Payoff de période du fritkot (slide 2) : mon coup a, son coup b. */
function payoff(a: Move, b: Move): number {
  if (a === "C") return b === "C" ? 4 : 0;
  return b === "C" ? 6 : 2;
}

/** Tit-for-Tat (slide 16) : C en période 0 ; en t, C si l'adversaire a coopéré en t − 1, sinon T. */
function tftMoves(opp: Move[]): Move[] {
  return opp.map((_, t) => (t === 0 ? "C" : opp[t - 1]));
}

/** grim (slide 7) : C si l'adversaire a toujours coopéré dans le passé, sinon T. */
function grimMoves(opp: Move[]): Move[] {
  return opp.map((_, t) => (opp.slice(0, t).includes("T") ? "T" : "C"));
}

/** Une case « coup » : C en vert, T en rouge. */
function MoveCell({ m, clickable = false }: { m: Move; clickable?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-6 items-center justify-center rounded-md border text-[13px] font-bold",
        m === "C"
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-rose-300 bg-rose-50 text-rose-800",
        clickable && "cursor-pointer ring-primary/40 hover:ring-2",
      )}
    >
      {m}
    </span>
  );
}

/* -------------------- 1. L'écho : Tit-for-Tat et grim face à la même suite de coups */

const ECHO_START: Move[] = ["C", "C", "T", "C", "C", "T", "T", "C"];

function EchoTable() {
  const [opp, setOpp] = useState<Move[]>(ECHO_START);
  const flip = (t: number) =>
    setOpp((o) => o.map((m, i) => (i === t ? (m === "C" ? "T" : "C") : m)));
  const rows: Array<{ label: string; moves: Move[]; clickable?: boolean }> = [
    { label: "Adversaire", moves: opp, clickable: true },
    { label: "Tit-for-Tat", moves: tftMoves(opp) },
    { label: "grim", moves: grimMoves(opp) },
  ];
  return (
    <InteractiveCard
      title="Tit-for-Tat ou grim : qui répond quoi ?"
      subtitle="Clique sur un coup de l'adversaire pour le changer (C ↔ T). Les deux lignes du dessous appliquent mot pour mot les définitions des slides 16 et 7."
      controls={
        <button
          type="button"
          onClick={() => setOpp(ECHO_START)}
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          Revenir à l'exemple de départ
        </button>
      }
      footer={
        <>
          La ligne Tit-for-Tat est la ligne de l'adversaire <strong>décalée d'une case vers
          la droite</strong> (elle recopie la période précédente). La ligne grim passe
          à T dès la période qui suit la première trahison, et n'en sort <strong>plus
          jamais</strong>. Rends l'adversaire « gentil » (que des C) : les trois lignes
          deviennent identiques.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 text-center">
          <thead>
            <tr>
              <th className="pr-1 text-left text-[12px] font-semibold text-muted-foreground">
                Période
              </th>
              {opp.map((_, t) => (
                <th key={t} className="text-[12px] font-semibold text-muted-foreground">
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th className="whitespace-nowrap pr-1 text-left text-[13px] font-semibold">
                  {r.label}
                </th>
                {r.moves.map((m, t) => (
                  <td key={t}>
                    {r.clickable ? (
                      <button
                        type="button"
                        onClick={() => flip(t)}
                        aria-label={`Période ${t} : l'adversaire joue ${m}. Cliquer pour changer.`}
                      >
                        <MoveCell m={m} clickable />
                      </button>
                    ) : (
                      <MoveCell m={m} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InteractiveCard>
  );
}

/* -------------------- 2. Mini-tournoi illustratif (règle du slide 16, chiffres hors slides) */

const PERIODS = 200;

const ENTRANTS: Array<{ name: string; play: (his: Move[]) => Move }> = [
  { name: "Tit-for-Tat", play: (his) => (his.length === 0 ? "C" : his[his.length - 1]) },
  { name: "grim", play: (his) => (his.includes("T") ? "T" : "C") },
  { name: "toujours trahir", play: () => "T" },
];

/** Un match de PERIODS périodes : chaque stratégie voit l'historique des coups de l'autre. */
function playMatch(i: number, j: number): [number, number] {
  const a: Move[] = [];
  const b: Move[] = [];
  let sa = 0;
  let sb = 0;
  for (let t = 0; t < PERIODS; t++) {
    const x = ENTRANTS[i].play(b);
    const y = ENTRANTS[j].play(a);
    a.push(x);
    b.push(y);
    sa += payoff(x, y);
    sb += payoff(y, x);
  }
  return [sa, sb];
}

/** Chaque stratégie affronte chacune des autres (slide 16). */
const MATCHES = ENTRANTS.flatMap((_, i) =>
  ENTRANTS.slice(i + 1).map((__, k) => {
    const j = i + 1 + k;
    const [sa, sb] = playMatch(i, j);
    return { i, j, sa, sb };
  }),
);

const RANKING = ENTRANTS.map((e, i) => {
  const mine = MATCHES.filter((m) => m.i === i || m.j === i);
  const total = mine.reduce((s, m) => s + (m.i === i ? m.sa : m.sb), 0);
  const wins = mine.filter((m) => (m.i === i ? m.sa > m.sb : m.sb > m.sa)).length;
  return { name: e.name, total, wins, avg: total / (mine.length * PERIODS) };
}).sort((x, y) => y.avg - x.avg);

const fr = (x: number, d = 0) =>
  x.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

function MiniTournament() {
  const best = RANKING[0].avg;
  return (
    <figure className="my-6 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
        Mini-tournoi illustratif (hors slides) · payoffs du fritkot · {PERIODS} périodes par match
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-muted/60 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5 text-left">Match</th>
              <th className="px-2 py-1.5 text-center">Points</th>
              <th className="px-2 py-1.5 text-left">Gagnant du match</th>
            </tr>
          </thead>
          <tbody>
            {MATCHES.map((m) => (
              <tr key={`${m.i}-${m.j}`} className="border-t">
                <td className="px-2 py-1.5">
                  {ENTRANTS[m.i].name} <span className="text-muted-foreground">contre</span>{" "}
                  {ENTRANTS[m.j].name}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5 text-center font-mono">
                  {fr(m.sa)} – {fr(m.sb)}
                </td>
                <td className="px-2 py-1.5">
                  {m.sa === m.sb ? "égalité" : m.sa > m.sb ? ENTRANTS[m.i].name : ENTRANTS[m.j].name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-muted/60 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-1.5 text-left">Classement</th>
              <th className="px-2 py-1.5 text-center">Matchs gagnés</th>
              <th className="px-2 py-1.5 text-center">Total</th>
              <th className="px-2 py-1.5 text-center">Payoff moyen / période</th>
            </tr>
          </thead>
          <tbody>
            {RANKING.map((r) => (
              <tr
                key={r.name}
                className={cn("border-t", r.avg === best && "bg-emerald-50 font-semibold")}
              >
                <td className="whitespace-nowrap px-2 py-1.5">
                  {r.avg === best ? "🏆 " : ""}
                  {r.name}
                </td>
                <td className="px-2 py-1.5 text-center font-mono">{r.wins}</td>
                <td className="px-2 py-1.5 text-center font-mono">{fr(r.total)}</td>
                <td className="px-2 py-1.5 text-center font-mono">{fr(r.avg, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        Chiffres illustratifs : ce tournoi n'est pas celui d'Axelrod. Il applique seulement sa
        règle (slide 16) à trois stratégies du cours (slides 7, 11 et 16) : chaque stratégie
        affronte chacune des autres, et le classement se fait au payoff moyen.
      </figcaption>
    </figure>
  );
}

export function PartPratique() {
  return (
    <>

      {/* ============================================================ */}
      {/* § 9 — Le tournoi d'Axelrod                                    */}
      {/* ============================================================ */}
      <Section id="sec-axelrod" kicker="§ 9" title="Le tournoi d'Axelrod">
        <Lead>
          Quittons le tableau noir : que se passe-t-il quand on fait <em>vraiment</em>{" "}
          s'affronter des stratégies de jeu répété ? Robert Axelrod a organisé dans les années
          1980 un tournoi de dilemme du prisonnier répété. Ce § suit le slide 16 : le protocole, le
          vainqueur, et un résultat sur les stratégies « gentilles ». Les compléments hors slides
          sont signalés comme tels.
        </Lead>

        {/* ---------------------------------------------------------- */}
        <H4>
          1. Le protocole du tournoi <Slide n="16" />
        </H4>
        <UL>
          <li>
            Chaque participant soumettait <strong>une stratégie</strong>, encodée dans un{" "}
            <strong>programme informatique</strong>.
          </li>
          <li>
            Chaque stratégie était jouée <strong>contre chacune des autres</strong> stratégies,
            pendant <strong>200 périodes</strong>.
          </li>
          <li>
            La stratégie qui obtient le <strong>payoff moyen le plus élevé</strong> gagne.
          </li>
        </UL>
        <p>
          Pourquoi un programme ? Parce qu'une stratégie de jeu répété est un{" "}
          <strong>plan d'action complet</strong> (§ 2) : elle dit d'avance quoi jouer à chaque
          période, pour chaque histoire possible du jeu. Un ordinateur peut donc la jouer à ta
          place, sans jamais hésiter.
        </p>
        <p>
          Retiens bien la règle de victoire : on additionne les points gagnés{" "}
          <strong>dans tous les matchs</strong> et on compare des moyennes. On ne compte{" "}
          <strong>pas</strong> les matchs gagnés. Ce détail sera crucial au point 4.
        </p>

        {/* ---------------------------------------------------------- */}
        <H4>
          2. Le vainqueur : Tit-for-Tat <Slide n="16" />
        </H4>
        <p>
          <strong>Anatol Rapoport</strong> a remporté le tournoi avec la stratégie{" "}
          <strong>« Tit-for-Tat »</strong> (en français, on dit parfois « donnant-donnant ») :
          c'est elle qui a obtenu le payoff moyen le plus élevé.
        </p>
        <Callout variant="definition" title="📖 Définition — Tit-for-Tat (slide 16, mot pour mot)">
          <UL>
            <li>
              le joueur <strong>coopère en période 0</strong> ;
            </li>
            <li>
              en période <M tex="t" />, le joueur <strong>coopère si son adversaire a coopéré en{" "}
              <M tex="t-1" /></strong>, sinon le joueur trahit.
            </li>
          </UL>
          <p>
            En une image : Tit-for-Tat est un <strong>écho</strong>. Elle te renvoie, avec une
            période de retard, le coup que tu viens de jouer.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Ne confonds pas grim et Tit-for-Tat">
          <p>
            Les deux coopèrent en période 0, et les deux répondent à une trahison en trahissant.
            Toute la différence est dans la <strong>mémoire</strong> :
          </p>
          <UL>
            <li>
              <strong>grim</strong> (slide 7) regarde <em>tout le passé</em> : elle coopère « si
              son adversaire a toujours coopéré dans le passé ». Une seule trahison, et elle
              trahit pour toujours : elle ne pardonne jamais.
            </li>
            <li>
              <strong>Tit-for-Tat</strong> ne regarde que <em>la période</em>{" "}
              <M tex="t-1" /> : dès que l'adversaire recoopère, elle recoopère à la période
              suivante.
            </li>
          </UL>
        </Callout>

        <EchoTable />

        {/* ---------------------------------------------------------- */}
        <H4>
          3. Le second résultat : les stratégies « gentilles » <Slide n="16" />
        </H4>
        <p>
          Le slide 16 donne un second résultat : les stratégies{" "}
          <strong>« gentilles »</strong> (qui ne trahissent jamais si l'adversaire n'a pas
          trahi) ont <strong>toutes</strong> mieux performé que celles qui ne le sont pas.
          Autrement dit, une stratégie gentille ne trahit jamais <em>la première</em>.
        </p>
        <p>Classons les trois stratégies du cours :</p>
        <UL>
          <li>
            <strong>Tit-for-Tat</strong> : gentille. Face à un adversaire qui coopère toujours,
            elle coopère toujours.
          </li>
          <li>
            <strong>grim</strong> : gentille, pour la même raison.
          </li>
          <li>
            <strong>toujours trahir</strong> (slide 11) : pas gentille. Elle trahit dès la
            période 0, alors que l'adversaire n'a encore rien fait.
          </li>
        </UL>
        <Callout variant="examen" title="🎯 Piège d'examen : « gentille » ≠ « ne trahit jamais »">
          <p>
            Tit-for-Tat et grim sont gentilles, et pourtant elles trahissent ! Mais seulement{" "}
            <strong>en riposte</strong>, après une trahison de l'adversaire. Pour l'examen, cite
            la définition du slide 16 telle quelle : « qui ne trahissent jamais si l'adversaire
            n'a pas trahi ».
          </p>
        </Callout>

        {/* ---------------------------------------------------------- */}
        <H4>4. Gagner un tournoi sans gagner un seul match (complément hors slides)</H4>
        <p>
          Un contresens fréquent : croire que Tit-for-Tat a gagné parce qu'elle a « battu » ses
          adversaires un par un. C'est impossible : <strong>dans un match, Tit-for-Tat ne marque
          jamais plus de points que son adversaire</strong>.
        </p>
        <p>
          Pourquoi ? Tit-for-Tat ne trahit jamais la première. Une période où elle prend
          l'avantage (elle trahit pendant que l'autre coopère : 6 contre 0) n'arrive donc qu'en
          riposte, après une période où <em>l'autre</em> a pris l'avantage (il a trahi pendant
          qu'elle coopérait : 0 contre 6). Ces deux périodes s'annulent. Résultat : à tout moment
          du match, Tit-for-Tat est à égalité avec son adversaire, ou 6 points derrière lui (avec
          les payoffs du fritkot). Elle ne finit donc jamais devant.
        </p>
        <p>
          Comment gagner le tournoi, alors ? En accumulant plus de points{" "}
          <em>au total</em> : c'est le payoff moyen qui compte (point 1). Le mini-tournoi
          suivant montre le mécanisme avec trois stratégies du cours.
        </p>

        <MiniTournament />

        <p>
          Lis le tableau de près. <strong>Toujours trahir gagne ses deux matchs</strong> (404
          contre 398 : elle empoche 6 en période 0, puis les deux joueurs sont à 2 pendant 199
          périodes)… et finit <strong>dernière</strong>. <strong>Tit-for-Tat ne gagne aucun
          match</strong>… et finit <strong>première</strong>, ex æquo avec grim : face à ces deux
          adversaires-là, Tit-for-Tat et grim jouent exactement les mêmes coups. Ce qui fait la
          différence, ce sont les 800 points du match entre gentilles (4 par période pendant 200
          périodes), que toujours trahir ne touche jamais. Comme au slide 16, les gentilles
          devancent la stratégie qui ne l'est pas.
        </p>

        <Callout variant="attention" title="⚠️ Un tournoi n'est pas un équilibre (hors slides)">
          <p>
            200 périodes, c'est un horizon fini : entre deux joueurs rationnels, le théorème du
            slide 8 prédit « trahir à chaque période ». Ce n'est pas contradictoire avec la
            victoire de Tit-for-Tat. Le théorème décrit l'équilibre (ENPS) entre deux joueurs
            rationnels. Le tournoi pose une autre question : quel programme, fixé d'avance,
            accumule le plus de points face à <em>tous</em> les autres programmes inscrits ?
          </p>
        </Callout>

        {/* ---------------------------------------------------------- */}
        <H4>5. À toi de jouer</H4>
        <p>
          Dans le simulateur ci-dessous, tu affrontes quatre adversaires mystères pendant 10
          jours de festival. Petit indice de détective : quand ton adversaire est Tit-for-Tat,
          son total ne dépasse jamais le tien (point 4).
        </p>

        <FestivalSimulator />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 9)">
          <UL>
            <li>
              Le protocole du tournoi : stratégies programmées ; chaque stratégie affronte
              chacune des autres pendant 200 périodes ; la stratégie au payoff moyen le plus
              élevé gagne.
            </li>
            <li>
              Le vainqueur : <strong>Anatol Rapoport</strong>, avec{" "}
              <strong>Tit-for-Tat</strong>. Sa définition exacte (slide 16) et sa différence
              avec grim (slide 7).
            </li>
            <li>
              Le résultat sur les stratégies <strong>« gentilles »</strong> (qui ne trahissent
              jamais si l'adversaire n'a pas trahi) : elles ont toutes mieux performé.
            </li>
            <li>
              Le piège : Tit-for-Tat n'a battu personne en face-à-face. Elle a gagné au payoff
              moyen.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 10 — Au laboratoire                                         */}
      {/* ============================================================ */}
      <Section id="sec-labo" kicker="§ 10" title="Au laboratoire : et les vrais humains ?">
        <Lead>
          Dernier éclairage : celui de l'économie expérimentale (slide 17). Au laboratoire, les
          étudiants du cours ont joué au dilemme du prisonnier répété. La théorie fait une
          prédiction très nette. A-t-elle vu juste ?
        </Lead>

        {/* ---------------------------------------------------------- */}
        <H4>
          1. Le protocole <Slide n="17" />
        </H4>
        <UL>
          <li>
            un dilemme du prisonnier répété <strong>10 rounds</strong> (un round = une période) ;
          </li>
          <li>
            chacun <strong>connaissait l'identité</strong> de son adversaire ;
          </li>
          <li>
            on pouvait <strong>discuter</strong> avec lui entre deux rounds.
          </li>
        </UL>

        {/* ---------------------------------------------------------- */}
        <H4>2. Ce que prédit la théorie</H4>
        <p>
          10 rounds, c'est un nombre <strong>fini</strong> de répétitions, connu de tous. Et le
          dilemme du prisonnier a un <strong>unique EN</strong> : (T, T). Le théorème du slide 8
          s'applique donc : l'unique ENPS est de <strong>trahir à chaque round</strong> (slide 9).
          Prédiction : aucune coopération, dans aucune paire, à aucun round.
        </p>
        <p>
          Pouvoir discuter ne change rien à cette prédiction. Une promesse faite entre deux rounds
          n'engage à rien, car la coopération ne peut pas être contractualisée (slide 2) : au
          dernier round, celui qui a promis de coopérer a toujours intérêt à trahir.
        </p>

        {/* ---------------------------------------------------------- */}
        <H4>
          3. Les 4 observations <Slide n="17" />
        </H4>
        <div className="my-5 grid gap-3 sm:grid-cols-2">
          {[
            {
              tag: "Observation 1 · contredit la prédiction",
              tone: "bad" as const,
              body: (
                <>
                  Une <strong>grosse moitié des paires</strong> d'étudiants a coopéré{" "}
                  <strong>du début à la fin</strong>, sans jamais qu'un des deux étudiants ne
                  trahisse.
                </>
              ),
              theory: <>Prédiction : aucune paire ne coopère, jamais.</>,
            },
            {
              tag: "Observation 2 · contredit la prédiction",
              tone: "bad" as const,
              body: (
                <>
                  <strong>Aucune paire</strong> d'étudiants n'a trahi du début à la fin : toutes
                  les paires ont eu des rounds où <strong>les deux étudiants coopéraient</strong>.
                </>
              ),
              theory: <>Prédiction : toutes les paires trahissent du début à la fin.</>,
            },
            {
              tag: "Observation 3 · conforme au 1er maillon du slide 9",
              tone: "good" as const,
              body: (
                <>
                  Parmi les paires n'ayant pas coopéré toutes les périodes, on observe souvent une{" "}
                  <strong>trahison au dernier round</strong>.
                </>
              ),
              theory: (
                <>
                  Théorie : la peur de la punition n'opère plus dans la dernière période. Mais la
                  « remontée » par backward induction jusqu'au premier round n'est pas observée.
                </>
              ),
            },
            {
              tag: "Observation 4 · personne n'a joué grim",
              tone: "neutral" as const,
              body: (
                <>
                  Si certains étudiants trahissent lors du premier round, cela n'a{" "}
                  <strong>pas entraîné de réaction extrême</strong> de leur adversaire : aucun
                  étudiant n'a utilisé la stratégie « grim ».
                </>
              ),
              theory: (
                <>
                  Rappel : grim trahit pour toujours dès la première trahison (slide 7). Face à
                  elle, une trahison au premier round aurait déclenché une trahison à tous les
                  rounds suivants.
                </>
              ),
            },
          ].map((o, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
              <div
                className={cn(
                  "mb-1.5 text-[11px] font-bold uppercase tracking-wider",
                  o.tone === "good"
                    ? "text-emerald-700"
                    : o.tone === "bad"
                      ? "text-rose-700"
                      : "text-sky-700",
                )}
              >
                {o.tag}
              </div>
              <div className="text-sm leading-relaxed">{o.body}</div>
              <div className="mt-2 border-t pt-2 text-[13px] leading-relaxed text-muted-foreground">
                {o.theory}
              </div>
            </div>
          ))}
        </div>

        <Callout variant="intuition" title="💡 Une lecture possible (hors slides)">
          <p>
            La tentation de fin de partie existe (trahison au dernier round), mais les paires
            coopèrent beaucoup plus que ne le prédit le théorème du § 4. Le protocole a pu y
            contribuer : vous connaissiez l'identité de votre adversaire et pouviez discuter entre
            deux rounds (slide 17).
          </p>
        </Callout>

        <p>
          Tu peux ressentir cette tentation du dernier round dans le simulateur du § 9{" "}
          <TheoryRef chapter="b3" section="sec-axelrod" /> : contre Tit-for-Tat ou contre grim, quel
          est le meilleur score possible en 10 jours ? Réponse : <strong>42</strong> (9 × 4 + 6),
          en coopérant 9 jours puis en trahissant le 10ᵉ, quand plus aucune punition n'est
          possible. C'est exactement la trahison au dernier round de l'observation 3.
        </p>

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 10)">
          <UL>
            <li>
              Le protocole (10 rounds, identité de l'adversaire connue, discussion possible entre
              deux rounds) et les <strong>4 observations</strong>, avec pour chacune :{" "}
              <strong>conforme ou non à la prédiction théorique ?</strong>
            </li>
            <li>
              La trahison fréquente au <strong>dernier round</strong> correspond au 1er maillon du
              raisonnement du slide 9 : la peur de la punition n'opère plus dans la dernière
              période. La remontée jusqu'au round 1 prédite par la backward induction n'est pas
              observée.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 11 — Exercices récapitulatifs                               */}
      {/* ============================================================ */}
      <Section id="sec-exos" kicker="§ 11" title="Exercices récapitulatifs">
        <Lead>
          Cinq exercices, du plus mécanique au plus « type examen ». Cherche d'abord sur papier,
          puis compare avec la solution détaillée : chaque étape dit ce qu'on fait, et pourquoi.
        </Lead>

        <ExerciseBlock
          scope="b3"
          id="ex1"
          number={1}
          title="Calculer un payoff escompté (échauffement)"
          difficulty={1}
          refs={[
            { chapter: "b3", section: "sec-deux", label: "Payoff Π = π₀ + δπ₁" },
            { chapter: "b3", section: "sec-infini", label: "Payoff Π = Σ δᵗ πₜ" },
            { chapter: "a2", section: "outils", label: "Facteur d'escompte δ" },
          ]}
          statement={
            <p>
              Un fritkot a un facteur d'escompte <M tex="\delta = 0{,}8" />. Sur les trois jours
              du festival (périodes 0, 1 et 2), ses payoffs de période sont{" "}
              <M tex="\pi_0 = 4" />, <M tex="\pi_1 = 0" /> et <M tex="\pi_2 = 2" />. Calcule son
              payoff total <M tex="\Pi" />. Puis refais le calcul avec <M tex="\delta = 0{,}5" />.
              Que remarques-tu ?
            </p>
          }
          steps={[
            {
              title: "Poser la formule (attention au δ²)",
              content: (
                <p>
                  On applique <M tex="\Pi = \sum_t \delta^t \pi_t" /> (slide 10), ici sur trois
                  périodes : <M tex="\Pi = \pi_0 + \delta\,\pi_1 + \delta^2\,\pi_2" />. Le payoff
                  de la période <M tex="t" /> est multiplié par <M tex="\delta^t" />, c'est-à-dire
                  une fois par <M tex="\delta" /> pour chaque période d'attente. Le jour 2 est donc
                  escompté par <M tex="\delta^2" /> (deux périodes d'attente), pas par{" "}
                  <M tex="\delta" />.
                </p>
              ),
            },
            {
              title: "Calculer avec δ = 0,8",
              content: (
                <MB tex="\begin{aligned} \delta^2 &= 0{,}8 \times 0{,}8 = 0{,}64 \\ \Pi &= 4 + 0{,}8 \times 0 + 0{,}64 \times 2 \\ &= 4 + 0 + 1{,}28 = \mathbf{5{,}28} \end{aligned}" />
              ),
            },
            {
              title: "Calculer avec δ = 0,5 et comparer",
              content: (
                <>
                  <MB tex="\begin{aligned} \delta^2 &= 0{,}5 \times 0{,}5 = 0{,}25 \\ \Pi &= 4 + 0{,}5 \times 0 + 0{,}25 \times 2 \\ &= 4 + 0 + 0{,}5 = \mathbf{4{,}5} \end{aligned}" />
                  <p>
                    Même séquence de payoffs, total plus faible : plus un joueur est impatient
                    (<M tex="\delta" /> petit), moins le futur pèse dans son évaluation. C'est ce
                    mécanisme qui décidera de la coopération (§ 7 : il faut{" "}
                    <M tex="\delta \ge 1/2" />
                    ).
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              <M tex="\Pi = 5{,}28" /> avec <M tex="\delta = 0{,}8" /> ; <M tex="\Pi = 4{,}5" />{" "}
              avec <M tex="\delta = 0{,}5" />. À retenir : chaque période d'attente multiplie par{" "}
              <M tex="\delta" />, et l'impatience « rétrécit » le futur.
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
              Le dilemme du fritkot est joué exactement 2 fois (périodes 0 et 1). Le joueur 1 joue
              la stratégie grim <M tex="s_1^{G}" />. Montre rigoureusement que{" "}
              <M tex="s_2^{G}" /> n'est <em>pas</em> une meilleure réponse pour le joueur 2, quel
              que soit <M tex="\delta \in [0,1]" />. Que peux-tu en conclure sur le profil (
              <M tex="s_1^{G}" />, <M tex="s_2^{G}" />) ?
            </p>
          }
          steps={[
            {
              title: "La méthode : trouver une stratégie qui rapporte strictement plus",
              content: (
                <p>
                  Pour montrer que <M tex="s_2^{G}" /> n'est pas une meilleure réponse, il suffit
                  de trouver une autre stratégie du joueur 2 qui rapporte{" "}
                  <strong>strictement plus</strong> face à <M tex="s_1^{G}" />. Le slide 7 propose
                  deux candidates : <M tex="s_2" /> (trahir les deux périodes) et{" "}
                  <M tex="s_2'" /> (coopérer en période 0 et trahir en période 1). On calcule les
                  trois payoffs <M tex="\Pi_2" /> en déroulant le jeu période par période.
                </p>
              ),
            },
            {
              title: "Payoff de s₂ᴳ face à s₁ᴳ : 4 + 4δ",
              content: (
                <p>
                  Période 0 : les deux coopèrent (grim commence toujours par C) ⇒{" "}
                  <M tex="\pi_0 = 4" />. Période 1 : personne n'a trahi, donc les deux coopèrent
                  encore ⇒ <M tex="\pi_1 = 4" />. Total : <M tex="\Pi_2 = 4 + 4\delta" />.
                </p>
              ),
            },
            {
              title: "Payoff de s₂ (trahir les deux périodes) : 6 + 2δ",
              content: (
                <p>
                  Période 0 : 2 trahit pendant que 1 coopère ⇒ <M tex="\pi_0 = 6" />. Période 1 :
                  1 a vu la trahison, donc son grim punit (T) ; 2 trahit aussi ⇒{" "}
                  <M tex="\pi_1 = 2" />. Total : <M tex="\Pi_2 = 6 + 2\delta" />.
                </p>
              ),
            },
            {
              title: "Payoff de s₂′ (coopérer, puis trahir) : 4 + 6δ",
              content: (
                <p>
                  Période 0 : les deux coopèrent ⇒ <M tex="\pi_0 = 4" />. Période 1 : 1 n'a rien à
                  punir, il coopère ; 2 trahit ⇒ <M tex="\pi_1 = 6" />. Total :{" "}
                  <M tex="\Pi_2 = 4 + 6\delta" />.
                </p>
              ),
            },
            {
              title: "Comparer : au moins une déviation fait strictement mieux",
              content: (
                <>
                  <MB tex="\begin{aligned} (6+2\delta) - (4+4\delta) &= 2(1-\delta) \\ (4+6\delta) - (4+4\delta) &= 2\delta \end{aligned}" />
                  <p>
                    Le premier écart est strictement positif dès que <M tex="\delta < 1" />, le
                    second dès que <M tex="\delta > 0" />. Pour tout <M tex="\delta \in [0,1]" />,
                    au moins un des deux est donc strictement positif : à <M tex="\delta = 0" />,
                    c'est <M tex="s_2" /> (6 &gt; 4) ; à <M tex="\delta = 1" />, c'est{" "}
                    <M tex="s_2'" /> (10 &gt; 8) ; entre les deux, ce sont les deux (slide 8 : «{"\u00a0"}
                    <M tex="s_2" /> et <M tex="s_2'" /> apportent un plus grand payoff{" "}
                    <M tex="\Pi_2" /> que <M tex="s_2^{G}" /> »).
                  </p>
                  <div className="my-3 overflow-x-auto">
                    <table className="mx-auto border-collapse text-center text-[14px]">
                      <thead>
                        <tr className="bg-muted/60 text-[12px] font-bold text-muted-foreground">
                          <th className="px-3 py-1.5">δ</th>
                          <th className="px-3 py-1.5">
                            <M tex="s_2^{G}" />
                          </th>
                          <th className="px-3 py-1.5">
                            <M tex="s_2" />
                          </th>
                          <th className="px-3 py-1.5">
                            <M tex="s_2'" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {[
                          ["0", "4", "6", "4"],
                          ["0,5", "6", "7", "7"],
                          ["1", "8", "8", "10"],
                        ].map((r) => (
                          <tr key={r[0]} className="border-t">
                            {r.map((c, j) => (
                              <td key={j} className="px-3 py-1.5">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ),
            },
            {
              title: "Conclure",
              content: (
                <p>
                  <M tex="s_2^{G}" /> n'est jamais une meilleure réponse à <M tex="s_1^{G}" />.
                  Le profil (<M tex="s_1^{G}" />, <M tex="s_2^{G}" />) n'est donc pas un équilibre
                  de Nash, et donc pas un ENPS non plus (un ENPS est d'abord un profil de
                  meilleures réponses mutuelles), quel que soit <M tex="\delta" />. La raison
                  (slide 8) : en période 1, la menace de grim ne fonctionne plus, car il n'y aura
                  plus d'autres périodes pour punir.
                </p>
              ),
            },
          ]}
          result={
            <p>
              À deux périodes, (grim, grim) n'est <strong>jamais</strong> un ENPS : la meilleure
              déviation rapporte toujours au moins 1 de plus que grim (écart minimal à{" "}
              <M tex="\delta = 1/2" /> : 7 contre 6). Plus généralement, à horizon fini, la
              punition meurt avec la dernière période (théorème du slide 8).
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
            { chapter: "b1", section: "s3", label: "Stratégies dominantes (ESD)" },
            { chapter: "b3", section: "sec-grim", label: "La condition δ ≥ 1/2" },
            { chapter: "b3", section: "sec-interp", label: "Le seuil général (hors slides)" },
          ]}
          statement={
            <>
              <p>
                Deux compagnies aériennes se partagent une ligne. Chaque saison, chacune choisit
                Prix haut (C) ou Prix bas (T). Payoffs par saison (compagnie 1 ; compagnie 2) :
              </p>
              <PayoffMatrix
                rowPlayer="Compagnie 1"
                colPlayer="Compagnie 2"
                rows={["Prix haut (C)", "Prix bas (T)"]}
                cols={["Prix haut (C)", "Prix bas (T)"]}
                payoffs={[
                  [
                    [5, 5],
                    [0, 8],
                  ],
                  [
                    [8, 0],
                    [1, 1],
                  ],
                ]}
              />
              <p>
                Le jeu est répété à l'infini, avec un facteur d'escompte <M tex="\delta" />.{" "}
                <strong>a)</strong> Vérifie que c'est un dilemme du prisonnier.{" "}
                <strong>b)</strong> Si les deux jouent grim, quel payoff chacune obtient-elle ?{" "}
                <strong>c)</strong> Que rapporte la meilleure déviation qui trahit pour la
                première fois en <M tex="t = 0" /> ? <strong>d)</strong> Pour quelles valeurs de{" "}
                <M tex="\delta" /> le profil (grim, grim) est-il un ENPS ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) C'est bien un dilemme du prisonnier",
              content: (
                <p>
                  Mets-toi à la place de la compagnie 1. Si l'autre joue C, T rapporte 8 &gt; 5.
                  Si l'autre joue T, T rapporte 1 &gt; 0. T est donc strictement dominante, et de
                  même pour la compagnie 2 (le jeu est symétrique). (T, T) est l'ESD, avec (1 ; 1),
                  alors que (C, C) donnerait (5 ; 5) aux deux : (T, T) n'est pas efficace au sens
                  de Pareto. C'est bien un dilemme du prisonnier ✓.
                </p>
              ),
            },
            {
              title: "b) Payoff de la coopération éternelle",
              content: (
                <>
                  <p>
                    Si les deux jouent grim, personne ne trahit jamais : 5 à chaque saison. On
                    applique la formule du slide 10 avec <M tex="a = 5" /> :
                  </p>
                  <MB tex="\Pi_2(s_1^{G}, s_2^{G}) = 5 + 5\delta + 5\delta^2 + \dots = \dfrac{5}{1-\delta}" />
                </>
              ),
            },
            {
              title: "c) Payoff de la meilleure déviation",
              content: (
                <>
                  <p>
                    Comme au slide 14, supposons que la compagnie 2 trahisse pour la première fois
                    en <M tex="t = 0" />. Elle encaisse 8 une seule fois. Dès la saison 1, la
                    compagnie 1 (grim) trahit pour toujours, et le mieux que 2 puisse faire est de
                    trahir aussi (1 &gt; 0) : 1 par saison.
                  </p>
                  <MB tex="\begin{aligned} \Pi_2(s_1^{G}, s_2) &= 8 + \delta \cdot 1 + \delta^2 \cdot 1 + \dots \\ &= 8 + \delta\,(1 + \delta + \delta^2 + \dots) \\ &= 8 + \dfrac{\delta}{1-\delta} \end{aligned}" />
                  <p>
                    Ligne 2 : on met <M tex="\delta" /> en évidence. Ligne 3 : la parenthèse est
                    la somme infinie de 1, qui vaut <M tex="1/(1-\delta)" /> (formule du slide 10
                    avec <M tex="a = 1" />).
                  </p>
                </>
              ),
            },
            {
              title: "d) Résoudre la condition, ligne par ligne",
              content: (
                <>
                  <p>
                    grim est une meilleure réponse à grim si coopérer rapporte au moins autant que
                    dévier :
                  </p>
                  <MB tex="\begin{aligned} \dfrac{5}{1-\delta} &\ge 8 + \dfrac{\delta}{1-\delta} \\ 5 &\ge 8(1-\delta) + \delta \\ 5 &\ge 8 - 7\delta \\ 7\delta &\ge 3 \\ \delta &\ge \tfrac{3}{7} \approx 0{,}43 \end{aligned}" />
                  <p>
                    Ligne 2 : on multiplie par <M tex="(1-\delta) > 0" /> (positif car{" "}
                    <M tex="\delta < 1" />, donc le sens de l'inégalité ne change pas). Ligne 3 :{" "}
                    <M tex="8(1-\delta) + \delta = 8 - 8\delta + \delta = 8 - 7\delta" />. Ligne 4
                    : on fait passer <M tex="7\delta" /> à gauche et 5 à droite. Ligne 5 : on
                    divise par 7.
                  </p>
                  <p>
                    Contrôle numérique : à <M tex="\delta = 3/7" />, les deux payoffs valent 8,75
                    (<M tex="5 \div \tfrac47 = \tfrac{35}{4}" /> et{" "}
                    <M tex="8 + \tfrac37 \div \tfrac47 = 8 + \tfrac34" />
                    ). À <M tex="\delta = 0{,}4" />, juste sous le seuil, coopérer donne environ
                    8,33 et dévier environ 8,67 : la trahison l'emporte ✓.
                  </p>
                  <p>
                    Vérification facultative par la formule hors slides du § 8 :{" "}
                    <M tex="\dfrac{\pi_{\text{tent}} - \pi_{\text{coop}}}{\pi_{\text{tent}} - \pi_{\text{pun}}} = \dfrac{8 - 5}{8 - 1} = \dfrac{3}{7}" />{" "}
                    ✓.
                  </p>
                </>
              ),
            },
          ]}
          result={
            <p>
              (grim, grim) est un ENPS dès que <M tex="\delta \ge 3/7 \approx 0{,}43" />. La
              démarche est toujours celle des slides 13-14 : (1) le payoff de la coopération
              éternelle ; (2) celui de la tentation unique suivie de la punition éternelle,
              escomptée ; (3) on résout l'inégalité en multipliant par <M tex="(1-\delta) > 0" />.
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
              Deux supermarchés maintiennent tacitement des prix élevés depuis des années ; ils
              fixent leurs prix chaque mois. Un matin, la presse annonce que l'un des deux sera{" "}
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
                  Avant l'annonce, personne ne savait quand le jeu s'arrêterait : la coopération
                  était possible (slide 15 : les joueurs ne savent pas d'avance quelle sera la
                  dernière période). L'annonce transforme ce jeu en jeu à horizon{" "}
                  <strong>fini et connu</strong> : il y a désormais une dernière période que tout
                  le monde peut pointer.
                </p>
              ),
            },
            {
              title: "Appliquer le théorème du slide 8",
              content: (
                <p>
                  Hypothèse : chaque mois, le jeu des prix est un dilemme du prisonnier, qui a un
                  unique EN (prix bas, prix bas). Le théorème du slide 8 s'applique : au dernier
                  mois avant la fermeture, plus aucune punition n'est possible, donc chacun casse
                  ses prix ; par backward induction, ce raisonnement remonte mois par mois
                  jusqu'à aujourd'hui (slide 9). Prédiction : la guerre des prix éclate{" "}
                  <strong>dès l'annonce</strong>, pas dans 6 mois. (Au labo du § 10, les paires
                  ont pourtant coopéré bien plus que ne le prédit la théorie ; la trahison au
                  dernier round, elle, y est souvent observée.)
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
                Pour chaque affirmation, vrai ou faux ? Et surtout, <em>pourquoi</em> ?
              </p>
              <ol className="my-3 list-decimal space-y-1.5 pl-6">
                <li>
                  Dans le dilemme du prisonnier répété 100 fois, des joueurs très patients{" "}
                  <span className="whitespace-nowrap">
                    (<M tex="\delta = 0{,}99" />)
                  </span>{" "}
                  coopèrent à l'équilibre.
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
                  Tit-for-Tat a gagné le tournoi d'Axelrod parce qu'elle a battu chacun de ses
                  adversaires en face-à-face.
                </li>
                <li>Une stratégie « gentille » ne trahit jamais.</li>
              </ol>
            </>
          }
          steps={[
            {
              title: "Affirmation 1 — la patience sauve-t-elle l'horizon fini ?",
              content: (
                <p>
                  <strong>FAUX.</strong> 100 est un nombre fini et le dilemme du prisonnier a un
                  unique EN. Le théorème du slide 8 s'applique : l'unique ENPS est « trahir à
                  chaque période »,{" "}
                  <em>
                    même avec <M tex="\delta = 0{,}99" />
                  </em>{" "}
                  (le théorème ne pose aucune condition sur <M tex="\delta" />). La patience ne
                  sauve pas un horizon fini.
                </p>
              ),
            },
            {
              title: "Affirmation 2 — δ = 0,8 garantit-il la coopération ?",
              content: (
                <p>
                  <strong>FAUX.</strong> <M tex="0{,}8 \ge 1/2" /> rend la coopération{" "}
                  <em>possible</em> : (grim, grim) est un ENPS (§ 7). Mais (toujours trahir,
                  toujours trahir) reste aussi un ENPS (slide 12, § 6). Le slide 15 le dit en
                  toutes lettres : la coopération est « possible (mais pas certaine) ».
                </p>
              ),
            },
            {
              title: "Affirmation 3 — trahir puis recoopérer face à grim ?",
              content: (
                <p>
                  <strong>FAUX.</strong> Après ta trahison, grim te trahit pour toujours.
                  Recoopérer face à lui rapporte 0 par période, moins que trahir (2). Exemple avec{" "}
                  <M tex="\delta = 0{,}8" /> : trahir une fois puis recoopérer donne{" "}
                  <M tex="6 + 0 + 0 + \dots = 6" /> ; trahir pour toujours donne{" "}
                  <M tex="6 + 2 \times 0{,}8 / 0{,}2 = 14" /> ; coopérer toujours donne{" "}
                  <M tex="4 / 0{,}2 = 20" />. Tu cumules les deux erreurs : tu perds la
                  coopération, et tu ne profites même pas de la trahison.
                </p>
              ),
            },
            {
              title: "Affirmation 4 — Tit-for-Tat a-t-elle battu tout le monde ?",
              content: (
                <p>
                  <strong>FAUX.</strong> Le gagnant est la stratégie au payoff moyen le plus élevé
                  (slide 16), pas celle qui gagne le plus de matchs. Comme Tit-for-Tat ne trahit
                  qu'après une trahison de l'adversaire, elle ne marque{" "}
                  <strong>jamais plus que lui</strong> dans un match : au mieux, elle fait
                  égalité. Elle gagne parce qu'elle obtient beaucoup de coopération (voir le
                  mini-tournoi du § 9).
                </p>
              ),
            },
            {
              title: "Affirmation 5 — que veut dire « gentille » ?",
              content: (
                <p>
                  <strong>FAUX.</strong> Au slide 16, « gentille » veut dire : ne trahit jamais{" "}
                  <em>si l'adversaire n'a pas trahi</em>. Tit-for-Tat est gentille, et pourtant
                  elle trahit en <M tex="t" /> si l'adversaire a trahi en <M tex="t-1" /> (grim
                  aussi trahit, après une trahison de l'adversaire).
                </p>
              ),
            },
          ]}
          result={
            <>
              <p>Les cinq pièges à éviter :</p>
              <ol className="my-2 list-decimal space-y-1 pl-6">
                <li>horizon fini ⇒ pas de coopération à l'équilibre, même très patient ;</li>
                <li>
                  horizon infini ⇒ coopération <em>possible</em>, pas garantie ;
                </li>
                <li>face à un grim déclenché, on ne « recoopère » jamais ;</li>
                <li>
                  Axelrod : on gagne au payoff moyen ; Tit-for-Tat ne bat jamais son adversaire
                  dans un match ;
                </li>
                <li>« gentille » = ne trahit jamais la première, et non « ne trahit jamais ».</li>
              </ol>
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 12 — QCM final & checklist                                  */}
      {/* ============================================================ */}
      <Section id="sec-final" kicker="§ 12" title="QCM final & checklist de maîtrise">
        <Lead>Le tour de contrôle avant de refermer le chapitre. Objectif : tout vert.</Lead>

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
                  Oui (slide 5) : le payoff de demain est pondéré par le facteur d'escompte{" "}
                  <M tex="\delta" />, comme en A2.
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
          question={
            <>
              Le théorème du slide 8 (« horizon fini ») exige que le jeu simultané qui est répété
              ait…
            </>
          }
          options={[
            {
              text: <>…un unique équilibre de Nash.</>,
              correct: true,
              explain: (
                <>
                  Exact : si le jeu simultané qui est répété a un unique EN, alors le jeu répété un
                  nombre fini de fois a un unique ENPS, où cet EN est joué à chaque période.
                </>
              ),
            },
            {
              text: <>…au moins deux équilibres de Nash.</>,
              explain: (
                <>
                  Non : c'est l'unicité de l'EN qui permet à la backward induction de tout
                  verrouiller. À la dernière période, on sait exactement ce qui sera joué, quoi
                  qu'il se soit passé avant.
                </>
              ),
            },
            {
              text: <>…un facteur d'escompte inférieur à 1/2.</>,
              explain: (
                <>
                  Non : le théorème ne pose aucune condition sur <M tex="\delta" />. Le seuil 1/2
                  n'apparaît qu'à l'horizon infini (§ 7).
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
              <M tex="\tfrac{4}{1-\delta} \ge 6 + \tfrac{2\delta}{1-\delta}" /> (slide 14), le
              terme « 6 » représente…
            </>
          }
          options={[
            {
              text: <>…la punition infligée par l'adversaire.</>,
              explain: (
                <>
                  La punition, c'est le terme <M tex="\tfrac{2\delta}{1-\delta}" /> : 2 par
                  période à partir de demain (la guerre des prix), escompté.
                </>
              ),
            },
            {
              text: <>…la tentation : le payoff du jour de la trahison, encaissé une seule fois.</>,
              correct: true,
              explain: (
                <>
                  Oui : en période 0, le traître vend à prix bas pendant que l'autre coopère
                  encore. Il touche 6 une seule fois ; ensuite, c'est 2 pour toujours.
                </>
              ),
            },
            {
              text: <>…le payoff de la coopération éternelle.</>,
              explain: (
                <>
                  La coopération éternelle, c'est le membre de gauche :{" "}
                  <M tex="\tfrac{4}{1-\delta}" />.
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
              (jeu du fritkot) ?
            </>
          }
          options={[
            {
              text: <>Coopérer : 10 contre 9 pour la trahison.</>,
              correct: true,
              explain: (
                <>
                  Oui : coopérer donne 4/(1 − 0,6) = 4/0,4 = 10 ; trahir donne 6 + 2 × 0,6/0,4 =
                  6 + 3 = 9. Et de toute façon 0,6 ≥ 1/2 : on est dans la zone où la coopération
                  est possible.
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
                  Non : les deux stratégies donnent des payoffs différents, 10 contre 9. Le seuil
                  d'indifférence est <M tex="\delta = 1/2" />, pas 0,6.
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
              vit « à l'infini » ?
            </>
          }
          options={[
            {
              text: <>Parce que les humains sont irrationnels et n'y comprennent rien.</>,
              explain: (
                <>
                  Non : la question porte sur l'argument théorique du cours (slide 15), qui
                  concerne des joueurs rationnels.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que l'infini n'est pas nécessaire : la coopération est également possible
                  si, à chaque période, il y a une probabilité non-nulle que le jeu soit répété à
                  la période suivante.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : le slide 15 dit que la coopération est également possible s'il y a,
                  à chaque période, une probabilité non-nulle que le jeu continue (dans le fritkot
                  avec grim, il la faut assez grande : <M tex="\delta \cdot p \ge 1/2" />, voir
                  § 8). Ce qui tue la coopération, c'est de pouvoir pointer la dernière période.
                </>
              ),
            },
            {
              text: <>Parce qu'on peut signer des contrats qui obligent à coopérer.</>,
              explain: (
                <>
                  Non : le comportement de cartel ne peut pas être contractualisé (slide 2). La
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
          question={
            <>
              Ton adversaire a joué C, C, C, C, T, C aux périodes 0 à 5. Que joues-tu en période
              6 si tu suis Tit-for-Tat ? Et si tu suis grim ?
            </>
          }
          options={[
            {
              text: <>Tit-for-Tat : T ; grim : T</>,
              explain: (
                <>
                  Pas pour Tit-for-Tat : elle ne regarde que la période <M tex="t-1" /> = 5, où
                  l'adversaire a coopéré. Elle coopère donc.
                </>
              ),
            },
            {
              text: <>Tit-for-Tat : C ; grim : T</>,
              correct: true,
              explain: (
                <>
                  Oui : Tit-for-Tat copie la période 5 (C) ; grim trahit pour toujours depuis la
                  trahison de la période 4 (slides 16 et 7).
                </>
              ),
            },
            {
              text: <>Tit-for-Tat : C ; grim : C</>,
              explain: (
                <>
                  Pas pour grim : elle coopère seulement si l'adversaire a <em>toujours</em>{" "}
                  coopéré dans le passé. Depuis la trahison de la période 4, elle trahit pour
                  toujours : elle ne pardonne jamais.
                </>
              ),
            },
          ]}
        />

        <H4>Checklist de maîtrise : coche honnêtement !</H4>
        <MasteryChecklist
          items={[
            <>
              Je sais raconter le dilemme du fritkot et montrer que (T, T) est un ESD non
              Pareto-efficace (slides 2-3).
            </>,
            <>
              Je connais les 4 caractéristiques des jeux de B3 : non-coopératifs, séquentiels,
              information complète (mais imparfaite), répétés (slide 4).
            </>,
            <>
              Je sais qu'une stratégie de jeu répété est un plan d'action complet, contingent à
              l'histoire du jeu.
            </>,
            <>
              Je sais écrire <M tex="\Pi = \pi_0 + \delta\pi_1" /> (2 périodes) et{" "}
              <M tex="\Pi = \sum \delta^t \pi_t" /> (infini).
            </>,
            <>Je peux définir la stratégie grim sans regarder mes notes (slide 7).</>,
            <>
              Je sais démontrer qu'à 2 périodes, grim-grim n'est pas un ENPS (via les trois
              payoffs <M tex="4+4\delta" />, <M tex="6+2\delta" /> et{" "}
              <span className="whitespace-nowrap">
                <M tex="4+6\delta" />
                ).
              </span>
            </>,
            <>
              Je connais le théorème du slide 8 (« horizon fini ») et son raisonnement : la peur
              de la punition n'opère plus dans la dernière période, puis la backward induction
              étend ce raisonnement aux périodes précédentes (slide 9).
            </>,
            <>
              Je connais la formule <M tex="\sum \delta^t a = a/(1-\delta)" /> (pour{" "}
              <M tex="\delta < 1" />) et je sais l'appliquer (bonus : la redémontrer en décalant
              puis soustrayant).
            </>,
            <>
              Je sais montrer que (toujours trahir, toujours trahir) est un ENPS de l'horizon
              infini (slide 12).
            </>,
            <>
              Je sais dériver la condition <M tex="\delta \ge 1/2" /> de bout en bout, et
              interpréter chaque terme (slides 13-14).
            </>,
            <>
              Je peux expliquer pourquoi l'infini n'est pas nécessaire : une probabilité
              non-nulle, à chaque période, que le jeu continue (slide 15).
            </>,
            <>
              Je connais le protocole du tournoi d'Axelrod, la définition de Tit-for-Tat et le
              résultat sur les stratégies « gentilles » ; je sais que Tit-for-Tat a gagné au payoff
              moyen, sans battre personne en face-à-face (slide 16).
            </>,
            <>
              Je connais le protocole du laboratoire et ses 4 observations, et je sais dire
              lesquelles contredisent la prédiction théorique (slide 17).
            </>,
          ]}
        />

        <Callout variant="retiens" title="🧭 Et après ?">
          <p>
            Avec B3, tu as parcouru quatre chapitres de théorie des jeux : <strong>B1</strong>{" "}
            (une seule interaction simultanée), <strong>B2.1</strong> (les jeux séquentiels : le
            temps entre en scène), <strong>B2.2</strong> (la théorie des contrats : concevoir les
            incitants) et <strong>B3</strong> (la répétition, ou comment le futur discipline le
            présent). Retiens le fil rouge de B3 :{" "}
            <em>
              plus les joueurs accordent de poids au futur (<M tex="\delta" /> grand), plus la
              menace d'une punition future peut rendre la coopération possible
            </em>{" "}
            (slides 14-15). Prochaine étape : les <strong>jeux bayésiens</strong> (B4), où l'on
            ne connaît même plus l'adversaire.
          </p>
        </Callout>
      </Section>
    </>
  );
}
