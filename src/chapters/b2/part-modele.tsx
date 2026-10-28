/*
 * Chapitre B2.2 — PartModele (sections affichées dans la page du chapitre).
 * § 0 repères · § 1 l'histoire du commercial (slides 2-4) ·
 * § 2 le modèle principal-agent (slides 5-8). Deck S7 « Jeux séquentiels appliqués
 * à la théorie des contrats ».
 */

import { useState, type ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { TheoryRef } from "@/components/course/TheoryRef";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { C, Dot, Frame, Label, PlotSvg, fmt, makePlot } from "@/chapters/shared/plot";
import { GameTreeTimeline, PollIntuition } from "./interactives";
import { H4, VocabGrid, Steps, SymbolLegend, PrincipalAgentDiagram } from "./ui";

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Garde une formule collée à la ponctuation qui la suit (pas de virgule en début de ligne). */
function NB({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

/** Tableau compact, sans largeur minimale (lisible à 390 px). */
function MiniTbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-[14.5px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-[13px] font-bold text-muted-foreground"
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
                <td
                  key={j}
                  className={`px-3 py-2 align-top tabular-nums ${j === 0 || j === r.length - 1 ? "whitespace-nowrap" : ""}`}
                >
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

/** Définition officielle : le terme, la citation mot pour mot du slide, puis « en clair ». */
function DefCard({
  term,
  slide,
  quote,
  children,
}: {
  term: ReactNode;
  slide: string;
  quote: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-[15.5px] font-bold text-rose-700">{term}</span>
        <span className="text-xs font-semibold text-muted-foreground">slide {slide}</span>
      </div>
      <p className="mt-2 border-l-[3px] border-rose-300 pl-3 text-[14.5px] italic leading-relaxed">
        « {quote} »
      </p>
      <div className="mt-2.5 text-[14.5px] leading-relaxed">
        <strong>En clair :</strong> {children}
      </div>
    </div>
  );
}

/**
 * § 1 — Deux commerciaux, mêmes ventes : ce que l'entreprise voit, et ce qu'elle ne voit pas
 * (slides 3-4). Chiffres illustratifs.
 */
function HiddenEffortDemo() {
  const [shown, setShown] = useState(false);
  const reps = [
    {
      name: "Commercial A",
      visits: "10 visites",
      luck: "malchanceux : peu de clients visités avaient besoin du logiciel",
    },
    {
      name: "Commercial B",
      visits: "4 visites",
      luck: "chanceux : presque tous les clients visités en avaient besoin",
    },
  ];
  const hidden = (
    <span className="rounded bg-muted px-2 font-bold text-muted-foreground" aria-label="caché">
      ?
    </span>
  );
  return (
    <InteractiveCard
      title="Ce que voit l'entreprise… et ce qu'elle ne voit pas"
      subtitle="Deux commerciaux, le même mois. Chiffres illustratifs (pas dans les slides)."
      controls={
        <button
          type="button"
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
          className="rounded-lg border-2 border-primary/40 bg-background px-3 py-2 text-left text-sm font-semibold transition-colors hover:bg-accent sm:col-span-2 lg:col-span-3"
        >
          {shown ? "🙈 Revenir à la vue de l'entreprise" : "👁️ Révéler ce que l'entreprise ne voit pas"}
        </button>
      }
      footer={
        shown ? (
          <>
            les ventes sont identiques (3 licences), alors que A a
            fait 2,5 fois plus de visites que B. En ne voyant que les ventes, l'entreprise ne peut
            pas savoir qui a travaillé : elle ne peut pas payer l'effort, seulement le résultat
            (slide 3). Et un commercial qui vend peu « pourrait toujours prétendre qu'il a fait
            beaucoup de visites mais n'a pas eu de chance » (slide 4).
          </>
        ) : (
          <>
            mets-toi à la place de l'entreprise. Qui a le plus travaillé ? Impossible à dire :
            les deux ont vendu 3 licences. Clique sur le bouton pour voir ce qu'elle ne voit pas.
          </>
        )
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {reps.map((r) => (
          <div key={r.name} className="rounded-xl border bg-background p-3.5">
            <div className="font-bold">{r.name}</div>
            <div className="mt-2 space-y-1.5 text-[14.5px]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sky-700">Effort (visites)</span>
                <span className="font-semibold text-sky-700">{shown ? r.visits : hidden}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="shrink-0 text-violet-700">Chance</span>
                <span className="text-right text-violet-700">{shown ? r.luck : hidden}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t pt-1.5">
                <span className="text-emerald-700">Résultat (licences vendues)</span>
                <span className="font-bold text-emerald-700">3</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InteractiveCard>
  );
}

/** Nombre pour le TeX, format français : 0.5 → « 0{,}5 », −0.5 → « -0{,}5 ». */
function texNum(v: number): string {
  const s = Math.abs(v).toFixed(1).replace(/\.0$/, "").replace(".", "{,}");
  return (v < 0 ? "-" : "") + s;
}

/**
 * § 2 — Lire un contrat linéaire w(z) = α + βz (slide 6) : α est la hauteur de la droite
 * en z = 0, β sa pente. Valeurs libres (illustration) ; les familles des Cas 1-3 (slide 9)
 * apparaissent comme cas particuliers.
 */
function ContractLine() {
  const [a, setA] = useState(0.2);
  const [b, setB] = useState(0.5);
  const round1 = (v: number) => Math.round(v * 10) / 10;
  const p = makePlot({ x: [0, 2], y: [-0.7, 3], h: 300 });
  const w = (z: number) => a + b * z;
  const formula =
    b === 0
      ? `w(z) = ${texNum(a)}`
      : `w(z) = ${a === 0 ? "" : `${texNum(a)} + `}${b === 1 ? "" : `${texNum(b)}\\,`}z`;
  const family =
    b === 0
      ? "β = 0 : salaire fixe, la forme du Cas 1"
      : a === 0
        ? "α = 0 : salaire proportionnel, la forme du Cas 2"
        : "α et β libres : salaire linéaire, la forme du Cas 3";
  return (
    <InteractiveCard
      title="Lire un contrat : α, c'est la hauteur ; β, c'est la pente"
      subtitle="La droite donne le salaire w pour chaque résultat z. Valeurs libres, pour illustrer."
      controls={
        <>
          <SliderControl
            label={
              <>
                Partie fixe <M tex="\alpha" />
              </>
            }
            value={a}
            onChange={(v) => setA(round1(v))}
            min={-0.6}
            max={1}
            step={0.1}
            format={(v) => fmt(v, 1)}
          />
          <SliderControl
            label={
              <>
                Taux de bonus <M tex="\beta" />
              </>
            }
            value={b}
            onChange={(v) => setB(round1(v))}
            min={0}
            max={1}
            step={0.1}
            format={(v) => fmt(v, 1)}
          />
        </>
      }
      footer={
        <>
          <M tex="\alpha" /> déplace la droite vers le haut ou
          vers le bas : c'est le salaire quand <M tex="z = 0" />. <M tex="\beta" /> la fait
          pivoter : c'est sa pente, ce que l'agent gagne en plus pour chaque unité de résultat
          supplémentaire. Mets <M tex="\beta = 0" /> : la droite devient plate, le salaire ne
          dépend plus du résultat. Mets <M tex="\alpha = 0" /> : elle passe par l'origine. Et{" "}
          <M tex="\alpha" /> peut être négatif : garde-le en tête pour le Cas 3.
        </>
      }
    >
      <PlotSvg p={p} label="Droite de salaire w(z) = α + βz en fonction du résultat z">
        <Frame
          p={p}
          xticks={[0, 0.5, 1, 1.5, 2]}
          yticks={[0, 1, 2, 3]}
          xfmt={(t) => fmt(t, 1)}
          yfmt={(t) => fmt(t, 0)}
          xlabel="résultat z"
          ylabel="salaire w"
        />
        <line x1={p.X(0)} x2={p.X(2)} y1={p.Y(0)} y2={p.Y(0)} stroke={C.soft} strokeWidth={1.3} />
        {b > 0 ? (
          <g>
            <line
              x1={p.X(1)}
              y1={p.Y(w(1))}
              x2={p.X(2)}
              y2={p.Y(w(1))}
              stroke={C.guide}
              strokeDasharray="4 4"
            />
            <line x1={p.X(2)} y1={p.Y(w(1))} x2={p.X(2)} y2={p.Y(w(2))} stroke={C.red} strokeWidth={2} />
            <Label p={p} x={2} y={(w(1) + w(2)) / 2} anchor="end" dx={-6} dy={4} color={C.red}>
              +β
            </Label>
            <Label p={p} x={1.5} y={w(1)} anchor="middle" dx={0} dy={17} color={C.soft}>
              +1
            </Label>
          </g>
        ) : null}
        <line
          x1={p.X(0)}
          y1={p.Y(w(0))}
          x2={p.X(2)}
          y2={p.Y(w(2))}
          stroke={C.gold}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Dot p={p} x={0} y={a} fill={C.red} />
        <Label p={p} x={0} y={a} dx={9} dy={a >= 0 ? -9 : 17} color={C.red}>
          α = {fmt(a, 1)}
        </Label>
        <Dot p={p} x={1} y={w(1)} fill={C.gold} />
        <Label p={p} x={1} y={w(1)} anchor="end" dx={-8} dy={-9} color={C.gold}>
          w(1) = {fmt(w(1), 1)}
        </Label>
      </PlotSvg>
      <p className="mt-2 text-center text-[15px]">
        <M tex={formula} />
        <span className="block text-[13.5px] text-muted-foreground">{family}</span>
      </p>
    </InteractiveCard>
  );
}

export function PartModele() {
  return (
    <>
      {/* ============================================================ */}
      {/* §0 — Repères & boîte à outils                                 */}
      {/* ============================================================ */}
      <Section id="sec-reperes" kicker="§ 0 · Jeux séquentiels appliqués" title="Repères — où en sommes-nous ?">
        <Callout variant="intuition" title="📚 Où se situe ce chapitre ?">
          <p>
            Le chapitre B2 du cours a deux parties : <strong>B2.1 — Jeux séquentiels</strong>{" "}
            (la méthode : arbre du jeu, ENPS, backward induction) et{" "}
            <strong>B2.2 — Jeux séquentiels appliqués à la théorie des contrats</strong> (ce
            chapitre-ci, deck de 22 slides). Ici, on n'apprend pas de nouvel outil de théorie des
            jeux : on applique la backward induction de B2.1 à un problème d'entreprise. Si la
            méthode n'est pas encore claire, revois d'abord{" "}
            <TheoryRef chapter="bseq" section="s4" />.
          </p>
        </Callout>

        <Lead>
          Une entreprise embauche un commercial, mais elle ne peut pas surveiller ses efforts.
          Quel contrat de salaire proposer pour l'inciter à fournir le niveau d'effort optimal ?
          Ce chapitre applique les jeux séquentiels à cette question très concrète. Et la réponse
          va te surprendre : quand le commercial est neutre au risque, le meilleur contrat
          linéaire commence par <em>faire payer le commercial</em>. Il verse une somme fixe à
          l'entreprise (une « franchise »), puis il garde tout le résultat de ses ventes.
        </Lead>

        <PrincipalAgentDiagram />

        <Callout variant="examen" title="🎯 Ce que tu sauras faire à la fin de ce chapitre">
          <UL>
            <li>
              Réciter, puis expliquer avec tes mots, les définitions des slides 3-4 :{" "}
              <strong>information asymétrique</strong>, <strong>problème de l'agence</strong>,{" "}
              <strong>aléa moral</strong>, <strong>théorie des contrats</strong>.
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
              Manipuler les deux contraintes clés : <strong>participation (CP)</strong> et{" "}
              <strong>compatibilité aux incitants (CI)</strong>.
            </li>
            <li>
              Interpréter le résultat central quand l'agent est neutre au risque :{" "}
              <strong>franchise</strong> + <strong>residual claimant</strong> = efficacité.
            </li>
            <li>
              Expliquer ce qui change quand l'agent est <strong>averse au risque</strong> : le
              principal doit arbitrer entre les incitants et le risque.
            </li>
          </UL>
        </Callout>

        <H4>La feuille de route</H4>
        <MiniTbl
          head={["§", "Ce qu'on y fait", "Slides"]}
          rows={[
            ["§ 1", "L'histoire du commercial : principal, agent, information asymétrique, aléa moral", "2-4"],
            ["§ 2", "Le modèle principal-agent : technologie, contrat, payoffs, timing", "5-8"],
            ["§ 3", "Cas 1 : le salaire fixe", "9-11"],
            ["§ 4", "Cas 2 : le salaire proportionnel, et pourquoi il n'est pas efficace", "12-14"],
            ["§ 5", "Cas 3 : le salaire linéaire, la CP, la CI et la franchise", "15-19"],
            ["§ 6", "Les trois contrats côte à côte", "20"],
            ["§ 7", "Et si l'agent est averse au risque ?", "21-22"],
            ["§ 8-9", "Exercices résolus, puis bilan", "—"],
          ]}
        />

        <p>
          Ce chapitre n'arrive pas de nulle part : il <em>recycle</em> presque tout ce qu'on a
          construit jusqu'ici. Si tu maîtrises les briques ci-dessous, ce chapitre est surtout une
          question d'assemblage.
        </p>

        <Callout variant="intuition" title="🔗 Liens avec les chapitres précédents">
          <UL>
            <li>
              <strong>A1 — Préférences et choix :</strong> un individu rationnel{" "}
              <em>maximise son utilité</em>. Ici, le principal et l'agent font exactement ça,
              chacun de son côté. Et comme en A1, on trouve le maximum d'une fonction grâce à sa{" "}
              <em>dérivée</em> (la CPO). A1 t'a aussi donné le critère de <strong>Pareto</strong>,
              qui servira à juger les contrats.
            </li>
            <li>
              <strong>A2 — Décision inter-temporelle :</strong> tu y as écrit un problème de
              maximisation et posé ses conditions de premier ordre (avec un lagrangien). Ici on
              refait ce geste, sans lagrangien, deux fois par cas : une fois pour l'agent, une fois
              pour le principal.
            </li>
            <li>
              <strong>A3 — Décision sous incertitude :</strong> la VMA (slide 5) et, au § 7,
              l'utilité de Bernoulli concave, l'équivalent certain et la prime de risque minimale
              (S4 slides 22-23).
            </li>
            <li>
              <strong>B1 — Jeux simultanés :</strong> la <strong>meilleure réponse</strong> (S5
              slide 26). Les slides de ce chapitre parlent de « la meilleure réponse de l'agent »
              au contrat (slides 10, 12, 14 et 15).
            </li>
            <li>
              <strong>B2.1 — Jeux séquentiels :</strong> ce chapitre-là t'a donné la méthode de
              résolution (<em>backward induction</em>) et le concept de solution (
              <em>ENPS</em>). Ce chapitre-ci en est une <strong>application</strong> à un vrai
              problème d'entreprise.
            </li>
          </UL>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <TheoryRef chapter="a1" />
            <TheoryRef chapter="a2" />
            <TheoryRef chapter="a3" />
            <TheoryRef chapter="b1" section="s5" />
            <TheoryRef chapter="bseq" />
          </p>
        </Callout>

        <H4>La boîte à outils (6 rappels express)</H4>
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
                  Exemple : un dé équilibré a une espérance de 3,5. Une règle suffit ici :
                  l'espérance « traverse » les sommes et les facteurs constants,{" "}
                  <M tex="E(a + bX) = a + b\,E(X)" />. L'effort <M tex="e" /> est choisi, pas tiré
                  au sort : dans <M tex="E(\cdot)" />, il se comporte comme une constante. Et
                  comme le bruit vaut zéro en moyenne, <M tex="E(x) = 0" />, il s'efface :{" "}
                  <M tex="E\big(\beta(e + x)\big) = \beta e + \beta E(x) = \beta e" />.
                </>
              ),
            },
            {
              term: "CPO (condition de premier ordre)",
              body: (
                <>
                  Pour trouver le sommet d'une fonction en forme de dôme (concave), on annule sa
                  dérivée : au sommet, la pente est nulle. Les slides l'écrivent{" "}
                  <M tex="\partial E(w - c)/\partial e = 0" />. Le <M tex="\partial" /> (« d rond »)
                  indique qu'on dérive par rapport à une seule variable, ici{" "}
                  <M tex="e" />, les autres (<M tex="\alpha" />, <M tex="\beta" />) restant fixes.
                  Deux dérivées suffisent : celle de <M tex="\beta e" /> est <M tex="\beta" />,
                  celle de <M tex="e^2/2" /> est <M tex="e" />. Exemple :{" "}
                  <M tex="f(e) = 0{,}5e - e^2/2" /> donne <M tex="f'(e) = 0{,}5 - e = 0" />, donc{" "}
                  <M tex="e = 0{,}5" />.
                </>
              ),
            },
            {
              term: "Meilleure réponse",
              body: (
                <>
                  La stratégie qui donne le plus grand payoff face à ce que font les autres (B1,
                  S5 slide 26). Ici : l'effort qui maximise l'utilité espérée de l'agent{" "}
                  <em>face à un contrat donné</em>. Les slides la notent comme une fonction du
                  contrat : par exemple <M tex="e^*(\beta) = \beta" /> au Cas 2.
                </>
              ),
            },
            {
              term: "Backward induction",
              body: (
                <>
                  On résout un jeu séquentiel en partant de la <em>fin</em>, puis on remonte.
                  Ici : <strong>③</strong> l'effort que l'agent choisirait face à chaque contrat
                  (sa meilleure réponse) ; <strong>②</strong> sa décision de signer (il accepte si
                  son utilité espérée, avec cet effort, vaut au moins <M tex="\tilde{u}" /> : c'est
                  la contrainte de participation, CP) ; <strong>①</strong> le contrat du principal,
                  qui anticipe ces deux réactions.
                </>
              ),
            },
            {
              term: "ENPS",
              body: (
                <>
                  L'<strong>ENPS</strong> (équilibre de Nash parfait en sous-jeux) est un équilibre
                  de Nash dont les stratégies constituent des équilibres de Nash dans tous les
                  sous-jeux (B2.1, S6 slide 11). On le trouve par backward induction : slide 9,
                  « Pour chaque cas, nous trouvons l'ENPS de ce jeu séquentiel en utilisant la
                  méthode backward induction ».
                  <span className="mt-2 block">
                    <TheoryRef chapter="bseq" section="s3" label="Sous-jeux et ENPS" />
                  </span>
                </>
              ),
            },
            {
              term: "Efficacité au sens de Pareto",
              body: (
                <>
                  Un résultat est efficace au sens de Pareto s'il n'existe aucun autre résultat
                  techniquement faisable qui rend les deux joueurs plus satisfaits (slide 19).
                  C'est le critère vu en A1 (S1 slide 40) : on ne peut pas améliorer le sort d'un
                  joueur sans détériorer celui de l'autre.
                  <span className="mt-2 block">
                    <TheoryRef chapter="a1" section="pareto" />
                  </span>
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§0)">
          <p>
            Savoir réciter la méthode :{" "}
            <strong>
              « jeu séquentiel ⇒ backward induction ⇒ on résout d'abord le joueur qui joue en
              dernier »
            </strong>
            . Dans tout ce chapitre, ça donne : <em>1) l'agent choisit son effort (étape ③), 2) il
            accepte s'il obtient au moins <M tex="\tilde{u}" /> (CP, étape ②), 3) le principal
            choisit le contrat en anticipant (étape ①)</em>.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §1 — L'histoire du commercial                                 */}
      {/* ============================================================ */}
      <Section id="sec-histoire" kicker="§ 1" title="L'histoire du commercial">
        <Lead>
          Tout le chapitre repose sur une seule histoire, celle du slide 2. Prends le temps de bien
          la visualiser : chaque équation qu'on écrira ensuite n'est qu'une traduction
          mathématique de cette situation.
        </Lead>

        <p>
          Une entreprise produit un logiciel. Elle veut embaucher un <strong>commercial</strong>{" "}
          pour démarcher des clients potentiels. Certains de ces clients ont besoin du logiciel,
          d'autres non. Le nombre de licences vendues par le commercial dépend donc de deux
          choses :
        </p>
        <UL>
          <li>
            <strong>son effort</strong> : combien de clients potentiels il visite ;
          </li>
          <li>
            <strong>sa chance</strong> : les clients qu'il visite ont-ils besoin du logiciel, ou
            pas ?
          </li>
        </UL>
        <p>
          L'entreprise souhaiterait que le commercial visite autant de clients que possible.
          Problème : <strong>elle ne sait pas contrôler le nombre de clients visités</strong>. Et
          pour le commercial, chaque visite demande un effort (du temps, de la fatigue, des
          refus…).
        </p>

        <Callout variant="definition" title="❓ La question du chapitre (slide 2)">
          <p>
            « Comment l'entreprise peut-elle concevoir un contrat d'embauche qui incite le
            commercial à exercer le niveau d'effort optimal ? »
          </p>
          <p className="mt-2">
            Retiens le mot <strong>optimal</strong>. Le but n'est pas de faire travailler le
            commercial le plus possible. Au § 5, on verra que l'effort optimal est celui qui rend
            le « gâteau » à partager le plus gros, et que ce n'est pas l'effort maximal.
          </p>
        </Callout>

        <PollIntuition />

        <H4>Les deux joueurs (slide 3)</H4>
        <p>L'histoire met en scène deux joueurs, avec des noms techniques à connaître par cœur :</p>
        <VocabGrid
          items={[
            {
              term: "Le principal",
              tag: "l'entreprise",
              tagTone: "principal",
              body: (
                <>
                  Celui qui <strong>embauche</strong> et qui <strong>propose le contrat</strong>.
                  Slide 3 : « Le principal embauche un agent pour effectuer une tâche que le
                  principal est incapable de faire ou ne souhaite pas faire lui-même. »
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
                  <strong>choisit son effort</strong>. Slide 4 : il prend « une action
                  non-observable (= son niveau d'effort) ». Le principal ne la voit pas.
                </>
              ),
            },
          ]}
        />

        <H4>Les définitions officielles (slides 3 et 4)</H4>
        <p>
          Sur les slides 3 et 4, les termes clés sont écrits en rouge : le principal et l'agent
          (ci-dessus), puis quatre notions. Chacune est citée mot pour mot, puis expliquée
          simplement. On y ajoute le constat du slide 4 sur les intérêts des deux joueurs : sans
          lui, le problème de l'agence n'existerait pas.
        </p>
        <div className="my-5 grid gap-3">
          <DefCard
            term="Information asymétrique"
            slide="3"
            quote={
              <>
                L'information est asymétrique parce que le principal n'observe pas l'action de
                l'agent. Dans ce cas-ci, le principal n'observe ni le niveau d'effort ni la
                composante aléatoire du résultat. La seule chose observée est le résultat, c'est-à-dire
                le nombre de licences vendues. Étant donné cette contrainte, le salaire payé par le
                principal à l'agent ne peut dépendre que du résultat.
              </>
            }
          >
            les deux joueurs n'en savent pas autant l'un que l'autre. Le commercial sait combien
            de visites il a faites ; l'entreprise ne voit que les ventes. Comme on ne peut payer
            que sur ce qu'on observe, le salaire ne peut dépendre <strong>que</strong> des ventes.
          </DefCard>
          <DefCard
            term="Des intérêts pas nécessairement alignés"
            slide="4"
            quote={
              <>
                L'agent prend une action non-observable (= son niveau d'effort) qui affecte
                l'utilité des deux joueurs : l'utilité du principal car l'effort est productif,
                l'utilité de l'agent car l'effort est coûteux. ⇒ Le principal et l'agent n'ont pas
                nécessairement des intérêts alignés.
              </>
            }
          >
            l'effort fait du bien au <strong className="text-rose-700">principal</strong> (plus de
            visites, donc plus de ventes attendues) et coûte à l'
            <strong className="text-sky-700">agent</strong> (du temps, de la fatigue). Le
            principal souhaiterait un effort aussi grand que possible (slide 2) ; l'agent, lui,
            préférerait en faire le moins possible. Le contrat sert à réconcilier les deux.
          </DefCard>
          <DefCard
            term="Problème de l'agence"
            slide="4"
            quote={
              <>
                Le problème de l'agence découle de l'asymétrie d'information lorsque les intérêts
                sont mal alignés. L'impossibilité de contrôler les actions de l'agent peut
                entraîner une réduction d'efficacité si l'agent n'est pas incité à exercer un
                certain niveau d'effort. En effet, si l'agent vend peu de licences, il pourrait
                toujours prétendre qu'il a fait beaucoup de visites mais n'a pas eu de chance.
              </>
            }
          >
            il faut <em>deux</em> ingrédients en même temps : l'information asymétrique{" "}
            <em>et</em> des intérêts mal alignés. Si l'entreprise voyait l'effort, elle pourrait
            l'exiger dans le contrat ; si le commercial adorait faire des visites, il n'y aurait
            rien à inciter. Quand les deux se combinent, l'efficacité peut en souffrir. La
            démonstration ci-dessous montre pourquoi l'excuse « pas de chance » est imparable.
          </DefCard>
          <DefCard
            term="Aléa moral"
            slide="4"
            quote={
              <>
                Cet exemple illustre le problème d'aléa moral en entreprise. Notons déjà que la
                terminologie “aléa moral” est trompeuse. Le problème d'aléa moral n'est pas que le
                comportement de l'agent soit moralement répréhensible, mais plutôt le fait que de
                mauvais incitants peuvent entraîner une réduction de bien-être.
              </>
            }
          >
            c'est le nom donné à ce problème : l'agent prend une action que le principal ne voit
            pas, et de mauvais incitants peuvent faire perdre du bien-être. Le mot « moral » ne
            parle pas de morale (voir le piège plus bas).
          </DefCard>
          <DefCard
            term="Théorie des contrats"
            slide="4"
            quote={
              <>
                La théorie des contrats étudie comment concevoir les contrats afin d'atténuer
                autant que possible les pertes d'efficacité découlant du problème de l'agence.
              </>
            }
          >
            on ne peut pas rendre l'effort visible, mais on peut choisir le contrat qui limite le
            plus les dégâts. C'est le programme de ce chapitre : comparer trois types de contrats
            (§ 3 à § 5).
          </DefCard>
        </div>

        <HiddenEffortDemo />

        <Callout variant="attention" title="⚠️ Piège classique d'examen — « aléa moral » ne parle pas de morale !">
          <p>
            La terminologie est <strong>trompeuse</strong> (slide 4). Le problème d'aléa moral
            n'est <em>pas</em> que l'agent se comporte de façon moralement répréhensible. Le
            problème, c'est que de <strong>mauvais incitants</strong> peuvent entraîner une{" "}
            <strong>réduction de bien-être</strong>. L'agent qui ne fait aucun effort sous salaire
            fixe répond juste rationnellement aux incitants qu'on lui donne : le « coupable »,
            c'est le contrat mal conçu.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ « Information » : pas le même sens qu'en B2.1">
          <p>
            En B2.1, « information parfaite » décrit la <strong>structure du jeu</strong> : toutes
            les actions passées sont connues avant que l'action suivante ne soit choisie (S6
            slide 7). Ici, l'« information asymétrique » parle d'autre chose : de ce que le
            principal <strong>observe</strong> pour fixer le salaire. Il ne voit pas l'effort
            (slide 3). Quand les slides 20 et 22 parleront du « cas d'information parfaite », il
            s'agira du cas de référence où le principal <em>observerait</em> l'effort. Même mot,
            deux sens : ne les mélange pas. Le § 6 y revient en détail.
          </p>
          <p className="mt-2">
            <TheoryRef chapter="bseq" section="s2" label="Le cadre : information parfaite" />
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q1"
          kicker="Quiz éclair · §1"
          question={
            <p>
              Un propriétaire confie son appartement à une agence immobilière chargée de le louer
              au meilleur prix. Qui est le principal, qui est l'agent ? (Exemple illustratif, pas
              dans les slides.)
            </p>
          }
          options={[
            {
              text: <>L'agence est le principal, le propriétaire est l'agent.</>,
              explain: (
                <>
                  C'est l'inverse : celui qui confie la tâche et propose le contrat est le
                  principal. C'est aussi lui qui ne voit pas l'effort de l'autre.
                </>
              ),
            },
            {
              text: <>Le propriétaire est le principal, l'agence est l'agent.</>,
              correct: true,
              explain: (
                <>
                  Exact ! Le propriétaire (principal) délègue une tâche à l'agence (agent) dont il
                  n'observe pas les efforts réels : combien de visites organise-t-elle vraiment ?
                  Le nom « agence » immobilière n'est d'ailleurs pas un hasard.
                </>
              ),
            },
            {
              text: <>Le locataire est le principal.</>,
              explain: (
                <>
                  Non : le locataire n'est pas partie au contrat de délégation. La relation
                  principal-agent lie celui qui délègue (le propriétaire) et celui qui exécute
                  (l'agence).
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
              <em>que</em> du résultat (le nombre de licences vendues) ?
            </p>
          }
          options={[
            {
              text: <>Parce que la loi interdit de payer à l'effort.</>,
              explain: (
                <>
                  Non : la loi n'a rien à voir ici. C'est une contrainte d'information, pas une
                  contrainte juridique.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que le résultat est la seule chose que le principal observe : impossible de
                  payer sur quelque chose d'invisible.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement ! Le principal n'observe ni l'effort ni la chance. Slide 3 : « La
                  seule chose observée est le résultat […]. Étant donné cette contrainte, le
                  salaire payé par le principal à l'agent ne peut dépendre que du résultat. »
                </>
              ),
            },
            {
              text: <>Parce que le résultat ne dépend pas de la chance.</>,
              explain: (
                <>
                  Attention : le résultat contient justement une part de chance. Si on pouvait
                  isoler la chance, on retrouverait l'effort, et le problème disparaîtrait !
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§1)">
          <UL>
            <li>
              Réciter les définitions des slides 3-4 : <strong>information asymétrique</strong>,{" "}
              <strong>problème de l'agence</strong>, <strong>aléa moral</strong>,{" "}
              <strong>théorie des contrats</strong>.
            </li>
            <li>
              Identifier le <strong>principal</strong> (celui qui délègue la tâche et propose le
              contrat) et l'<strong>agent</strong> (celui qui l'exécute) dans n'importe quel
              exemple. Exemples illustratifs, pas dans les slides : propriétaire → agence
              immobilière, actionnaires → PDG, patient → médecin.
            </li>
            <li>
              Expliquer la chaîne logique :{" "}
              <strong>
                information asymétrique + intérêts mal alignés ⇒ problème de l'agence ⇒ perte
                d'efficacité possible
              </strong>
              .
            </li>
            <li>
              Le sens exact d'<strong>aléa moral</strong> : de mauvais incitants, pas une mauvaise
              morale.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §2 — Le modèle principal-agent                                */}
      {/* ============================================================ */}
      <Section id="sec-modele" kicker="§ 2" title="Le modèle principal-agent">
        <Lead>
          On traduit maintenant l'histoire en mathématiques (slides 5 à 8). Le modèle a{" "}
          <strong>quatre ingrédients</strong> : une technologie de production, un contrat, des
          fonctions de payoff et un timing. Pour chaque hypothèse, on dira d'où elle vient. Avant
          tout, voici les symboles du chapitre.
        </Lead>

        <SymbolLegend />

        <Callout variant="attention" title="⚠️ « Résultat » a deux sens dans les slides">
          <p>
            Dans les slides, « résultat » désigne deux choses : <M tex="z" />, le résultat de la
            tâche (les licences vendues, slide 3), et « le résultat » du jeu, c'est-à-dire ce qui
            se passe à l'équilibre (slides 11, 14, 19). B2.1 distingue de même résultat et profil
            de stratégies (S6 slide 18).
          </p>
        </Callout>

        <H4>Ingrédient 1 — la technologie de production (slide 5)</H4>
        <p>
          La technologie de production relie le résultat <M tex="z" /> à deux choses : une{" "}
          <strong>action</strong> <M tex="e" /> de l'agent (son niveau d'effort) et un{" "}
          <strong>bruit</strong> <M tex="x" /> non contrôlé par l'agent (la chance).
        </p>
        <FormulaBox
          tex="z = z(e,\,x) \qquad \text{et, par simplicité :} \qquad z = e + x"
          label="Technologie"
          caption={
            <>
              Lecture : <em>« les ventes = l'effort, plus ou moins un coup de chance »</em>. La
              forme linéaire est posée « par simplicité » (slide 5) : chaque unité d'effort ajoute
              exactement une unité au résultat.
            </>
          }
        />
        <p>
          Le bruit <M tex="x" /> est une variable aléatoire dont la valeur attendue est zéro :
        </p>
        <MB tex="E(x) \equiv \mathrm{VMA}(x) = 0" />
        <p>
          Le signe <M tex="\equiv" /> se lit « est, par définition, la même chose que ». (VMA =
          valeur monétaire attendue, vue en A3 : ici, simple synonyme de l'espérance{" "}
          <M tex="E(\cdot)" />
          .) <TheoryRef chapter="a3" section="s2" label="Valeur monétaire attendue" />
        </p>
        <Callout variant="intuition" title="💡 Intuition sur E(x) = 0">
          <p>
            La chance est parfois bonne (<M tex="x > 0" /> : les clients visités avaient besoin
            du logiciel), parfois mauvaise (<M tex="x < 0" />), mais <em>en moyenne elle
            s'annule</em>. Exemple illustratif : si <M tex="x" /> vaut <M tex="+0{,}3" /> ou{" "}
            <M tex="-0{,}3" /> avec une chance sur deux, alors{" "}
            <M tex="E(x) = \tfrac{1}{2}(0{,}3) + \tfrac{1}{2}(-0{,}3) = 0" />.
          </p>
          <p className="mt-2">
            Conséquence pratique énorme : <strong>en espérance, seul l'effort compte</strong>,{" "}
            <M tex="E(z) = e + E(x) = e" />. Chaque fois que tu verras un <M tex="E(x)" /> dans un
            calcul, tu pourras le remplacer par 0.
          </p>
        </Callout>
        <Callout variant="exemple" title="🔁 Retour aux deux commerciaux du § 1">
          <p>
            Avec la formule <M tex="z = e + x" /> et des chiffres illustratifs : un gros effort{" "}
            <M tex="e = 1" /> avec de la malchance <M tex="x = -0{,}4" /> donne{" "}
            <M tex="z = 0{,}6" />. Un effort 2,5 fois plus petit, <M tex="e = 0{,}4" />, avec de
            la chance <M tex="x = +0{,}2" />, donne <em>aussi</em> <M tex="z = 0{,}6" />. Le principal, qui ne
            voit que <M tex="z" />, ne peut pas distinguer les deux cas : l'information
            asymétrique tient en une ligne.
          </p>
        </Callout>

        <H4>Ingrédient 2 — le contrat (slide 6)</H4>
        <p>
          Un contrat est défini par le salaire <M tex="w = w(z)" />, « qui relie le montant{" "}
          <M tex="w" /> payé par le principal à l'agent au résultat <M tex="z" /> » (slide 6).
          Pourquoi <M tex="w" /> ne dépend-il que de <M tex="z" /> ? Parce que <M tex="z" /> est
          la seule chose observée (slide 3, voir le § 1). Par simplicité, on ne considère que des{" "}
          <strong>contrats linéaires</strong> :
        </p>
        <FormulaBox tex="w(z) = \alpha + \beta z" label="Contrat linéaire" />
        <UL>
          <li>
            <M tex="\alpha" /> est la <strong>composante fixe</strong> du salaire : ce que l'agent
            touche même si <M tex="z = 0" />. Pense au « fixe » d'un vendeur.
          </li>
          <li>
            <M tex="\beta" /> est le <strong>taux de bonus</strong>, qui définit la composante
            variable du salaire. Si <M tex="\beta = 0{,}2" />, l'agent touche 0,2 par unité de
            résultat (par licence vendue). Pense à une commission.
          </li>
        </UL>
        <p>
          Exemple chiffré illustratif : avec <M tex="\alpha = 0{,}1" />,{" "}
          <M tex="\beta = 0{,}2" /> et un résultat <M tex="z = 2" />, le salaire vaut{" "}
          <M tex="w = 0{,}1 + 0{,}2 \times 2 = 0{,}5" />.
        </p>
        <p>
          Exemples illustratifs (pas dans les slides) : un fonctionnaire est proche de «{"\u00a0"}
          <M tex="\alpha" /> seul », un agent immobilier payé à la commission est proche de «{"\u00a0"}
          <M tex="\beta z" /> seul », beaucoup de commerciaux ont un mix des deux.
        </p>

        <ContractLine />

        <p>
          Les trois cas étudiés ensuite (slide 9) sont trois familles de ce contrat :{" "}
          <strong>Cas 1</strong>, salaire fixe <M tex="w(z) = \alpha" /> (on impose{" "}
          <M tex="\beta = 0" />) ; <strong>Cas 2</strong>, salaire proportionnel{" "}
          <M tex="w(z) = \beta z" /> (on impose <M tex="\alpha = 0" />) ;{" "}
          <strong>Cas 3</strong>, salaire linéaire <M tex="w(z) = \alpha + \beta z" /> (les deux
          leviers sont libres).
        </p>

        <H4>Ingrédient 3 — les fonctions de payoff (slide 7)</H4>
        <p>
          Le principal est <strong>neutre au risque</strong> (dans tout le chapitre). L'agent
          l'est aussi, pour commencer (slide 7) ; au § 7, il deviendra averse au risque. Être
          neutre au risque, c'est ne s'intéresser qu'aux espérances. Exemple illustratif : pour
          un agent neutre au risque, un salaire de 0,4 ou de 0,6 avec une chance sur deux vaut
          exactement autant qu'un salaire certain de 0,5.
        </p>
        <FormulaBox
          tex="\begin{gathered} \text{Principal : } U_p(z - w) = E(z - w) \\ \text{Agent : } U_a(w - c) = E(w - c) \end{gathered}"
          label="Payoffs"
          caption={
            <>
              Lecture : le principal garde <em>le résultat moins le salaire</em> (son profit) ;
              l'agent garde <em>le salaire moins le coût de son effort</em>. La parenthèse dit ce
              que chacun évalue.
            </>
          }
        />
        <p>
          Pourquoi des espérances ? Parce que <M tex="z" />, et donc <M tex="w" />, dépendent de
          la chance <M tex="x" />, qui n'est tirée au sort qu'à la fin du jeu (étape 3 du timing,
          plus bas). Au moment de décider, personne ne connaît <M tex="x" /> : chacun raisonne
          sur la moyenne.
        </p>
        <p>
          Ici, <M tex="c" /> est le coût d'exercer le niveau d'effort <M tex="e" /> (slide 7). Par
          simplicité, on considère un coût d'effort quadratique :
        </p>
        <MB tex="c(e) = \frac{e^2}{2}" />
        <Callout variant="intuition" title="💡 Pourquoi un coût quadratique ?">
          <p>
            Le cours le choisit « par simplicité » (slide 7). Propriété utile : sa dérivée{" "}
            <M tex="c'(e) = e" />, le coût marginal de l'effort, augmente avec l'effort
            (illustration : la 1<sup>re</sup> visite de la journée est facile, la 15<sup>e</sup>{" "}
            est épuisante).
          </p>
        </Callout>
        <MiniTbl
          head={[
            <>
              Effort <M tex="e" />
            </>,
            <>
              Coût <M tex="c(e) = e^2/2" />
            </>,
            <>
              Coût marginal <M tex="c'(e) = e" />
            </>,
          ]}
          rows={[
            ["0", "0", "0"],
            ["0,5", "0,125", "0,5"],
            ["1", "0,5", "1"],
          ]}
        />
        <p>
          Les valeurs <M tex="c(0{,}5) = 0{,}125" /> et <M tex="c(1) = 0{,}5" /> reviendront aux
          Cas 2 et 3.
        </p>

        <Callout variant="exemple" title="✍️ Exemple chiffré illustratif — calculer les deux payoffs">
          <p>
            Contrat <M tex="w(z) = 0{,}1 + 0{,}5\,z" /> (donc <NB><M tex="\alpha = 0{,}1" />,</NB>{" "}
            <M tex="\beta = 0{,}5" />), et l'agent fournit l'effort <M tex="e = 0{,}5" />. Que
            valent <M tex="U_p" /> et <M tex="U_a" /> ?
          </p>
          <Steps
            items={[
              <>
                <strong>Résultat attendu.</strong> <M tex="E(z) = e + E(x) = 0{,}5 + 0 = 0{,}5" />
                , car la chance vaut zéro en moyenne.
              </>,
              <>
                <strong>Salaire attendu.</strong> Le salaire est linéaire en <M tex="z" />, donc{" "}
                <M tex="E(w) = \alpha + \beta\,E(z) = 0{,}1 + 0{,}5 \times 0{,}5 = 0{,}35" />.
              </>,
              <>
                <strong>Payoff de l'agent.</strong> Le coût <M tex="c(0{,}5) = 0{,}125" /> n'est
                pas aléatoire, donc{" "}
                <M tex="U_a = E(w) - c = 0{,}35 - 0{,}125 = 0{,}225" />.
              </>,
              <>
                <strong>Payoff du principal.</strong>{" "}
                <M tex="U_p = E(z) - E(w) = 0{,}5 - 0{,}35 = 0{,}15" />.
              </>,
            ]}
          />
          <p>
            Remarque : <M tex="U_p + U_a = 0{,}375 = E(z) - c(e)" />. Le salaire ne fait que
            passer d'une poche à l'autre : le contrat partage le gâteau, l'effort décide de sa
            taille. Le § 5 exploitera cette idée.
          </p>
        </Callout>

        <H4>Ingrédient 4 — le timing du jeu (slide 8)</H4>
        <p>
          C'est ici que les jeux séquentiels entrent en scène : le jeu se joue en{" "}
          <strong>trois temps</strong>, toujours dans le même ordre.
        </p>

        <Callout variant="definition" title="📖 Le timing, officiellement (slide 8)">
          <ol className="my-1 list-decimal space-y-1.5 pl-6 marker:font-semibold">
            <li>
              Le principal propose à l'agent un contrat <M tex="w(z)" />.
            </li>
            <li>
              L'agent décide d'<strong>accepter ou de refuser</strong> le contrat.
            </li>
            <li>
              Si l'agent refuse le contrat, il obtient une <strong>utilité par défaut</strong>{" "}
              <M tex="\tilde{u}" />. Si l'agent accepte le contrat, il choisit son niveau d'effort{" "}
              <M tex="e" /> et le bruit <M tex="x" /> est tiré au sort.
            </li>
          </ol>
          <p className="mt-2">
            « Parce qu'il joue en premier, le principal peut affecter le comportement de l'agent
            en concevant le contrat de manière à inciter le niveau d'effort optimal. »
          </p>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            L'utilité par défaut <M tex="\tilde{u}" /> (« u tilde ») est ce que l'agent obtient
            s'il refuse : par exemple, la valeur de sa meilleure alternative. À partir du slide 9,
            on suppose <M tex="\tilde{u} = 0" />.
          </p>
        </Callout>

        <GameTreeTimeline />

        <p>
          Sur le slide 8, chaque coup est dessiné comme un éventail, et non comme deux ou trois
          branches comme en B2.1 : le principal (en rouge) choisit parmi une infinité de contrats{" "}
          <M tex="w(z)" />, puis l'agent (en bleu) parmi une infinité de niveaux d'effort{" "}
          <M tex="e(w)" />.
        </p>

        <Callout variant="methode" title="🧭 Comment on résout ce jeu : la backward induction">
          <p>On remonte le timing à l'envers, en partant de la dernière décision :</p>
          <ol className="my-2 space-y-1.5 pl-1">
            <li>
              <strong>③ L'effort de l'agent.</strong> Pour chaque contrat possible, l'agent
              choisit l'effort qui maximise <M tex="E(w - c)" /> : sa meilleure réponse{" "}
              <M tex="e^*(\cdot)" />. C'est d'elle que viendra la contrainte de compatibilité aux
              incitants (CI).
            </li>
            <li>
              <strong>② Sa décision d'accepter.</strong> Il signe si{" "}
              <M tex="E(w - c)" />, avec l'effort <M tex="e^*" />, vaut au moins{" "}
              <M tex="\tilde{u}" /> : c'est la contrainte de participation (CP).
            </li>
            <li>
              <strong>① Le contrat du principal.</strong> Le principal choisit le contrat qui
              maximise <NB><M tex="E(z - w)" />,</NB> en anticipant ces deux réactions.
            </li>
          </ol>
          <p>
            Dans les slides, la décision d'accepter apparaît comme la contrainte de participation
            du problème du principal (slides 11 et 16). Au Cas 1, c'est l'argument « un salaire
            négatif inciterait l'agent à refuser le contrat » (slide 11) ; au Cas 3, c'est la
            contrainte <M tex="E(w - c) \geq \tilde{u}" /> (slide 16).
          </p>
        </Callout>

        <Callout variant="definition" title="📖 Notation de l'ENPS (slides 11, 13 et 18)">
          <p>
            Notation : l'ENPS s'écrit <M tex="(s_p^*,\, s_a^*)" />. <M tex="s_p^*" /> est le
            contrat choisi par le principal ; <M tex="s_a^*" /> est la stratégie de l'agent,
            c'est-à-dire la règle <M tex="e^*(\cdot)" /> qui donne son effort pour{" "}
            <strong>chaque</strong> contrat possible (le <M tex="e(w)" /> de l'arbre du slide 8).
            Une stratégie est un plan d'action complet (B2.1, S6 slide 15). C'est pourquoi les
            slides écrivent <M tex="s_a^* = e^*(\beta) = \beta" />, et pas un nombre comme{" "}
            <M tex="e = 1/2" />.
          </p>
          <p className="mt-2">
            <TheoryRef chapter="bseq" section="s4" />
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
              <M tex="e = 0{,}8" /> ?
            </p>
          }
          options={[
            {
              text: <M tex="E(z) = 1{,}6" />,
              explain: (
                <>
                  Non : rien ne double l'effort. La chance s'ajoute à l'effort, et elle est
                  nulle en moyenne : <M tex="E(z) = e + E(x) = e = 0{,}8" />.
                </>
              ),
            },
            {
              text: <M tex="E(z) = 0{,}8" />,
              correct: true,
              explain: (
                <>
                  Parfait : <M tex="E(z) = E(e + x) = e + E(x) = 0{,}8 + 0 = 0{,}8" />. En
                  espérance, seul l'effort compte : réflexe à automatiser pour tous les calculs du
                  chapitre.
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
                  Non : <M tex="z" /> est aléatoire, mais son espérance est parfaitement
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
              « une commission de 0,3 par licence vendue » ?
            </p>
          }
          options={[
            {
              text: <M tex="\alpha = 0{,}3" />,
              explain: (
                <>
                  Non : <M tex="\alpha" /> est la partie fixe, touchée quel que soit le résultat.
                  Une commission varie avec les ventes.
                </>
              ),
            },
            {
              text: <M tex="\beta = 0{,}3" />,
              correct: true,
              explain: (
                <>
                  Oui ! <M tex="\beta" /> est le taux de bonus : <M tex="\beta = 0{,}3" />{" "}
                  signifie que chaque unité de résultat (chaque licence vendue) rapporte 0,3 à
                  l'agent.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="b2"
          id="q4b"
          kicker="Quiz éclair · §2"
          question={
            <p>Pour résoudre ce jeu par backward induction, dans quel ordre raisonne-t-on ?</p>
          }
          options={[
            {
              text: <>① le contrat, puis ② la décision de signer, puis ③ l'effort.</>,
              explain: (
                <>
                  Ça, c'est l'ordre dans lequel on <em>joue</em> (le timing). La backward induction
                  le parcourt à l'envers : on part de la fin.
                </>
              ),
            },
            {
              text: <>③ l'effort, puis ② la décision de signer, puis ① le contrat.</>,
              correct: true,
              explain: (
                <>
                  Oui ! On cherche d'abord l'effort que l'agent choisirait face à chaque contrat
                  (③), puis s'il accepte de signer (②, la CP), et enfin le contrat que le principal
                  choisit en anticipant ces deux réactions (①).
                </>
              ),
            },
            {
              text: <>② la décision de signer, puis ③ l'effort, puis ① le contrat.</>,
              explain: (
                <>
                  Non : pour savoir si l'agent signe, il faut d'abord connaître l'effort qu'il
                  fournira, car son utilité en dépend. On commence donc par ③.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§2)">
          <UL>
            <li>
              Écrire de mémoire les 4 ingrédients : <M tex="z = e + x" /> avec{" "}
              <M tex="E(x) = 0" /> ; <M tex="w = \alpha + \beta z" /> ;{" "}
              <M tex="U_p = E(z - w)" />, <M tex="U_a = E(w - c)" /> avec{" "}
              <M tex="c = e^2/2" /> ; le timing en 3 étapes.
            </li>
            <li>
              Savoir d'où vient chaque hypothèse : <M tex="w" /> ne dépend que de <M tex="z" />{" "}
              parce que seul <M tex="z" /> est observé (slide 3) ; <M tex="E(x) = 0" /> est une
              hypothèse sur le bruit (slide 5) ; la production linéaire, le contrat linéaire et le
              coût quadratique sont posés « par simplicité » (slides 5 à 7).
            </li>
            <li>
              Résoudre dans l'ordre ③ → ② → ① : l'effort de l'agent, puis sa décision de signer
              (la CP), puis le contrat du principal, qui{" "}
              <strong>anticipe la réaction de l'agent</strong>.
            </li>
            <li>
              Lire la notation de l'ENPS : <M tex="s_a^*" /> est une règle{" "}
              <M tex="e^*(\cdot)" />, pas un nombre.
            </li>
          </UL>
        </Callout>
      </Section>
    </>
  );
}
