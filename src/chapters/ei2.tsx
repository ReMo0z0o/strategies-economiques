/*
 * Chapitre EI2 — L'oligopole.
 *
 * Conversion fidèle des 100 slides du cours « Économie industrielle,
 * chapitre 2 » : introduction (monopole → duopole → oligopole, variables
 * stratégiques), la concurrence en quantités (Cournot : meilleures réponses
 * et équilibre, l'exemple 60 − yT, les courbes d'iso-profit, la collusion et
 * son instabilité, Stackelberg et l'engagement, empêcher l'entrée d'un
 * concurrent, le nombre optimal de firmes), puis la concurrence en prix
 * (Bertrand et son paradoxe, la collusion explicite et tacite, les biens
 * différenciés), et la synthèse « à maîtriser absolument ».
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
  BertrandUndercutSim,
  CollusionLensExplorer,
  CournotBRExplorer,
  DiffBertrandExplorer,
  EntryDeterrenceExplorer,
  IsoProfitExplorer,
  MasteryChecklist,
  NFirmsExplorer,
  StackelbergExplorer,
  TacitCollusionExplorer,
} from "./ei2/interactives";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Sous-titre interne à une section. */
function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Raisonnement pas à pas. */
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

/** Grille de mini-cartes vocabulaire. */
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

/** Frise du hero : du monopole à la concurrence, l'oligopole entre les deux. */
function MarketStrip() {
  const cells = [
    { n: "1", t: "monopole", s: "chap. EI1", hot: false },
    { n: "2", t: "duopole", s: "ce chapitre", hot: true },
    { n: "3+", t: "oligopole", s: "ce chapitre", hot: true },
    { n: "∞", t: "concurrence", s: "prix = Cm", hot: false },
  ];
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2" aria-hidden>
      {cells.map((c, i) => (
        <Fragment key={c.t}>
          {i > 0 ? <span className="text-white/50">→</span> : null}
          <div
            className={cn(
              "flex h-16 w-24 flex-col items-center justify-center rounded-xl border text-[10px] text-white/80",
              c.hot ? "border-amber-300 bg-white/25" : "border-white/30 bg-white/10",
            )}
          >
            <b className="text-base text-white">
              {c.n} firme{c.n === "1" ? "" : "s"}
            </b>
            <span className="font-semibold uppercase tracking-wide">{c.t}</span>
            <span className="opacity-80">{c.s}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Tableau de synthèse numérique du fil rouge (demande 60 − yT). */
function RegimeTable() {
  const rows: Array<{
    regime: ReactNode;
    y1: string;
    y2: string;
    yT: string;
    p: string;
    profits: ReactNode;
    tone?: string;
  }> = [
    {
      regime: (
        <>
          <strong>Collusion</strong> (cartel <M tex="y^m" />)
        </>
      ),
      y1: "12,5",
      y2: "5",
      yT: "17,5",
      p: "42,5",
      profits: <>487,5 au total (à partager)</>,
      tone: "bg-rose-50/50",
    },
    {
      regime: (
        <>
          <strong>Cournot</strong> (simultané)
        </>
      ),
      y1: "13",
      y2: "8",
      yT: "21",
      p: "39",
      profits: <>338 ; 128</>,
    },
    {
      regime: (
        <>
          <strong>Stackelberg</strong> (1 leader)
        </>
      ),
      y1: "13,9",
      y2: "7,8",
      yT: "21,7",
      p: "38,3",
      profits: <>≈ 339,5 ; ≈ 120,7</>,
      tone: "bg-emerald-50/50",
    },
  ];
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[620px] border-collapse text-center text-[14.5px]">
        <thead>
          <tr className="bg-muted/60 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2.5 text-left">Régime</th>
            <th className="px-3 py-2.5">
              <M tex="y_1" />
            </th>
            <th className="px-3 py-2.5">
              <M tex="y_2" />
            </th>
            <th className="px-3 py-2.5">
              <M tex="y_T" />
            </th>
            <th className="px-3 py-2.5">
              prix <M tex="p" />
            </th>
            <th className="px-3 py-2.5">
              profits <M tex="(\Pi_1 ; \Pi_2)" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-t", r.tone)}>
              <td className="px-3 py-2.5 text-left">{r.regime}</td>
              <td className="px-3 py-2.5 tabular-nums">{r.y1}</td>
              <td className="px-3 py-2.5 tabular-nums">{r.y2}</td>
              <td className="px-3 py-2.5 font-semibold tabular-nums">{r.yT}</td>
              <td className="px-3 py-2.5 font-semibold tabular-nums">{r.p}</td>
              <td className="px-3 py-2.5 tabular-nums">{r.profits}</td>
            </tr>
          ))}
          <tr className="border-t bg-sky-50/50">
            <td className="px-3 py-2.5 text-left">
              <strong>Bertrand</strong> (prix, bien homogène, Cm constant)
            </td>
            <td className="px-3 py-2.5 text-muted-foreground" colSpan={3}>
              autre modèle : la demande se partage selon les prix
            </td>
            <td className="px-3 py-2.5 font-semibold">= Cm</td>
            <td className="px-3 py-2.5">0 ; 0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Le tableau récapitulatif de la slide 82 (nombre de firmes). */
function NFirmsTable() {
  const rows: Array<{ label: ReactNode; v: [ReactNode, ReactNode, ReactNode, ReactNode] }> = [
    {
      label: <M tex="y_i" />,
      v: ["6", "4", "3", <M key="f" tex="\tfrac{12}{n+1}" />],
    },
    {
      label: <M tex="y_T" />,
      v: ["6", "8", "9", <M key="f" tex="\tfrac{12n}{n+1}" />],
    },
    {
      label: <M tex="p" />,
      v: ["6", "4", "3", <M key="f" tex="\tfrac{12}{n+1}" />],
    },
    {
      label: <M tex="\pi_i" />,
      v: [
        <>36 − F</>,
        <>16 − F</>,
        <>9 − F</>,
        <M key="f" tex="\left(\tfrac{12}{n+1}\right)^2 - F" />,
      ],
    },
    {
      label: <M tex="\pi_T" />,
      v: [
        <>36 − F</>,
        <>32 − 2F</>,
        <>27 − 3F</>,
        <M key="f" tex="n\left(\tfrac{12}{n+1}\right)^2 - nF" />,
      ],
    },
    {
      label: <M tex="SC" />,
      v: ["18", "32", "40,5", <M key="f" tex="72\left(\tfrac{n}{n+1}\right)^2" />],
    },
    {
      label: (
        <>
          <M tex="SC + \pi_T" />
        </>
      ),
      v: [
        <>54 − F</>,
        <>64 − 2F</>,
        <>67,5 − 3F</>,
        <M key="f" tex="\tfrac{72n(n+2)}{(n+1)^2} - nF" />,
      ],
    },
  ];
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[560px] border-collapse text-center text-[14.5px]">
        <thead>
          <tr className="bg-muted/60 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2.5 text-left"># firmes</th>
            <th className="px-3 py-2.5">1</th>
            <th className="px-3 py-2.5">2</th>
            <th className="px-3 py-2.5">3</th>
            <th className="px-3 py-2.5">…</th>
            <th className="px-3 py-2.5">n</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-3 py-2 text-left font-semibold">{r.label}</td>
              <td className="px-3 py-2 tabular-nums">{r.v[0]}</td>
              <td className="px-3 py-2 tabular-nums">{r.v[1]}</td>
              <td className="px-3 py-2 tabular-nums">{r.v[2]}</td>
              <td className="px-3 py-2 text-muted-foreground">…</td>
              <td className="px-3 py-2">{r.v[3]}</td>
            </tr>
          ))}
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
    <ChapterShell chapterId="ei2" heroExtra={<MarketStrip />}>
      {/* ============================================================ */}
      {/* § 1 — Introduction                                            */}
      {/* ============================================================ */}
      <Section id="intro" kicker="§ 1" title="Pourquoi ce chapitre ?">
        <p className="text-[1.15rem] leading-relaxed">
          Au chapitre EI1, le monopole régnait seul : il choisissait son prix face à une demande,
          point final. À l'autre extrême, en concurrence parfaite, chaque firme est si petite
          qu'elle ne décide rien du tout — elle subit le prix du marché. Ce chapitre explore{" "}
          <strong>tout ce qu'il y a entre les deux</strong> : les marchés dominés par{" "}
          <em>quelques</em> firmes. Et c'est là que les choses deviennent vraiment intéressantes…
          car chacune doit désormais penser <em>aux réactions des autres</em>.
        </p>

        <Callout variant="definition" title="📖 Définitions — monopole, duopole, oligopole">
          <ul>
            <li>
              Un <strong>monopole</strong> est une industrie dans laquelle il n'y a qu'une seule
              firme.
            </li>
            <li>
              Un <strong>duopole</strong> est une industrie composée de deux firmes.
            </li>
            <li>
              Un <strong>oligopole</strong> est une industrie composée d'un petit nombre de firmes.
            </li>
          </ul>
          <p>
            Dans ce cadre, les décisions de chaque firme affectent{" "}
            <strong>significativement</strong> les profits et les décisions des autres firmes. La
            théorie des jeux va donc pouvoir s'appliquer.
          </p>
        </Callout>

        <Callout variant="intuition" title="💡 Ce qui change tout : l'interdépendance stratégique">
          <p>
            Un monopoleur résout un problème <em>d'optimisation</em> : « quel prix maximise mon
            profit ? ». Une firme d'oligopole résout un problème <em>stratégique</em> : « quel est
            mon meilleur choix,{" "}
            <strong>sachant que mon profit dépend aussi de ce que va faire mon concurrent</strong> —
            qui se pose exactement la même question à mon sujet ? ». C'est la définition même d'un
            jeu. Tout l'attirail du cours de stratégie (meilleures réponses, équilibre de Nash) va
            resservir ici, avec des quantités et des prix à la place des matrices.
          </p>
        </Callout>

        <Callout variant="exemple" title="🔍 Des oligopoles, tu en croises tous les jours">
          <ul>
            <li>
              <strong>Télécoms belges :</strong> trois grands opérateurs mobiles se partagent
              l'essentiel du marché. Quand l'un lance un forfait moins cher, les autres réagissent
              en quelques semaines.
            </li>
            <li>
              <strong>OPEP :</strong> une poignée de pays producteurs de pétrole s'accordent sur des
              quotas de production… accords « régulièrement violés », dit le cours — on comprendra
              très précisément pourquoi à la section 3.4.
            </li>
            <li>
              <strong>Aérien, ciment, streaming vidéo, consoles de jeu…</strong> : partout où une
              poignée d'acteurs se surveillent mutuellement, tu es dans ce chapitre.
            </li>
          </ul>
        </Callout>

        <H4>Le cadre du chapitre : un duopole, deux « armes » possibles</H4>
        <p>
          Le cours pose un cadre volontairement simple : <strong>deux firmes</strong> (firme 1 et
          firme 2) produisant un <strong>bien homogène</strong> (identique aux yeux des
          consommateurs). Chaque firme choisit <em>une seule</em> variable stratégique — l'autre
          s'ajuste alors automatiquement :
        </p>
        <CardGrid
          items={[
            {
              title: "Arme n°1 : les quantités (partie 3)",
              body: (
                <>
                  Chaque firme met en vente une quantité (<M tex="y_1" /> et <M tex="y_2" />
                  ). La production totale est <M tex="y_1 + y_2" />, et c'est la demande qui impose
                  alors le <strong>prix commun</strong> <M tex="p(y_1 + y_2)" /> : plus il y a de
                  marchandise sur le marché, plus le prix est bas.
                </>
              ),
            },
            {
              title: "Arme n°2 : les prix (partie 4)",
              body: (
                <>
                  Chaque firme affiche un prix (<M tex="p_1" /> et <M tex="p_2" />
                  ), et la concurrence fixe les quantités : si <M tex="p_1 > p_2" />, la firme 1 ne
                  vend <strong>rien</strong> (tout le monde va chez la moins chère) ; si{" "}
                  <M tex="p_1 = p_2" />, le marché se partage équitablement.
                </>
              ),
            },
          ]}
        />

        <Callout variant="attention" title="⚠️ Deux armes, deux équilibres… très différents">
          <p>
            Selon la variable stratégique privilégiée, on obtient deux types d'équilibres de Nash
            aux résultats <strong>très divergents</strong> :
          </p>
          <ul>
            <li>
              l'<strong>équilibre de Cournot-Nash</strong> : chaque firme fixe ses quantités pour
              maximiser son profit, étant donné la production du concurrent et le prix commun{" "}
              <M tex="p(y_1 + y_2)" /> ;
            </li>
            <li>
              l'<strong>équilibre de Bertrand-Nash</strong> : chaque firme fixe son prix, étant
              donné le prix du concurrent — en anticipant qu'un prix plus élevé que le sien lui fait
              tout perdre, un prix plus bas tout gagner.
            </li>
          </ul>
          <p>
            Spoiler du chapitre : avec les quantités, les firmes gardent un joli pouvoir de marché ;
            avec les prix (bien homogène), il s'évapore <em>entièrement</em> dès la deuxième firme.
            Comprendre ce grand écart, c'est comprendre l'oligopole.
          </p>
        </Callout>

        <p>
          <em>
            NB : le plan du cours prévoit un « exercice illustrant la concurrence en quantités »
            (fichier séparé) — tu le retrouveras avec les exercices pratiques dans la partie TP de
            la plateforme. Des exercices récapitulatifs t'attendent aussi en fin de chapitre.
          </em>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <TheoryRef chapter="ei1" label="EI1 · Le monopole (rappels)" />
          <TheoryRef
            chapter="b1"
            course="strategies"
            section="s5"
            label="Stratégies · L'équilibre de Nash"
          />
        </div>

        <Quiz
          scope="ei2"
          id="q1"
          kicker="Check de départ"
          question={
            <>
              Qu'est-ce qui distingue <em>fondamentalement</em> l'analyse d'un oligopole de celle
              d'un monopole ?
            </>
          }
          options={[
            {
              text: <>Le nombre de consommateurs, beaucoup plus grand en oligopole.</>,
              explain: (
                <>
                  Non — la demande est modélisée de la même façon. Ce qui change, c'est le nombre de{" "}
                  <em>firmes</em> et leurs interactions.
                </>
              ),
            },
            {
              text: (
                <>
                  L'interdépendance : le profit de chaque firme dépend aussi des décisions des
                  autres, qui raisonnent de même — il faut la théorie des jeux.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement. Les décisions de chaque firme affectent significativement les profits
                  et les décisions des autres : on ne cherche plus un simple optimum, mais un{" "}
                  <strong>équilibre de Nash</strong> (Cournot-Nash en quantités, Bertrand-Nash en
                  prix).
                </>
              ),
            },
            {
              text: (
                <>Le fait qu'en oligopole les firmes produisent forcément des biens différents.</>
              ),
              explain: (
                <>
                  Non : tout le début du chapitre suppose au contraire un bien{" "}
                  <strong>homogène</strong>. Les biens différenciés n'arrivent qu'à la section 4.3.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 1)">
          <ul>
            <li>
              Les définitions <strong>monopole / duopole / oligopole</strong> et la phrase-clé : en
              oligopole, les décisions de chaque firme affectent significativement les profits et
              décisions des autres ⇒ théorie des jeux.
            </li>
            <li>
              Les <strong>deux variables stratégiques</strong> possibles (quantités ou prix), le
              fait que l'autre variable s'ajuste automatiquement, et les deux équilibres
              correspondants (Cournot-Nash, Bertrand-Nash) aux résultats très divergents.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.1 — La concurrence à la Cournot                           */}
      {/* ============================================================ */}
      <Section id="cournot" kicker="§ 3.1" title="La concurrence à la Cournot">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Première arme : les quantités. Chaque firme décide combien produire, et le marché
          transforme le total en prix. La question de chaque firme devient : « combien produire,{" "}
          <strong>étant donné</strong> ce que produit l'autre ? »
        </p>

        <H4>Les hypothèses</H4>
        <ul>
          <li>
            Les firmes produisent un <strong>bien homogène</strong> et se font concurrence en fixant
            les niveaux de production qui maximisent leur profit, étant donné{" "}
            <strong>la production du concurrent</strong> et{" "}
            <strong>
              le prix commun aux deux firmes, donné par <M tex="p(y_1 + y_2)" />
            </strong>
            .
          </li>
          <li>
            Les fonctions de coût total des firmes sont <M tex="c_1(y_1)" /> et <M tex="c_2(y_2)" />{" "}
            — elles peuvent être différentes.
          </li>
        </ul>

        <H4>Le problème de la firme 1 : produire combien, à y₂ donné ?</H4>
        <p>
          La firme 1 prend la production <M tex="y_2" /> de sa rivale comme donnée. Son profit
          s'écrit :
        </p>
        <FormulaBox
          tex="\Pi_1(y_1;\, y_2) \;=\; p(y_1 + y_2)\,y_1 \;-\; c_1(y_1)"
          label="Profit de la firme 1, à y₂ donné"
          caption={
            <>
              Recette (prix commun × sa quantité) moins coût. Le point-virgule dans{" "}
              <M tex="(y_1;\, y_2)" /> rappelle que <M tex="y_1" /> est la variable de décision et{" "}
              <M tex="y_2" /> un paramètre que la firme 1 ne contrôle pas.
            </>
          }
        />
        <p>
          Quel <M tex="y_1" /> maximise ce profit ? Comme toujours : on dérive et on annule. Chaque
          terme de la condition de premier ordre a un sens économique précis :
        </p>
        <MB tex="\frac{d\Pi_1}{dy_1} \;=\; \underbrace{\frac{dp(y_1+y_2)}{dy_1}\,y_1}_{\text{① effet prix (négatif)}} \;+\; \underbrace{p(y_1+y_2)}_{\text{② effet volume}} \;-\; \underbrace{\frac{dc_1(y_1)}{dy_1}}_{\text{③ coût marginal}} \;=\; 0" />
        <Steps
          labels={["①", "②", "③"]}
          items={[
            <>
              <strong>Effet prix :</strong> produire une unité de plus augmente l'offre totale, donc{" "}
              <em>fait baisser le prix</em>… sur <strong>toutes</strong> les unités que la firme 1
              vend déjà. C'est le même mécanisme qu'au chapitre du monopole — mais en version
              duopole : la firme 1 ne « paie » cette baisse de prix que sur <em>sa</em> production{" "}
              <M tex="y_1" />, pas sur celle du concurrent.
            </>,
            <>
              <strong>Effet volume :</strong> l'unité supplémentaire se vend au prix{" "}
              <M tex="p(y_1+y_2)" /> — c'est la recette directe.
            </>,
            <>
              <strong>Coût marginal :</strong> produire cette unité coûte <M tex="dc_1/dy_1" />. À
              l'optimum, gain marginal net = 0.
            </>,
          ]}
        />

        <Callout
          variant="definition"
          title="📖 Définition — fonction de meilleure réponse (ou de réaction)"
        >
          <p>
            La solution de cette équation donne la valeur de <M tex="y_1" /> en fonction de celle de{" "}
            <M tex="y_2" /> :
          </p>
          <MB tex="y_1 = R_1(y_2)" />
          <p>
            C'est la <strong>fonction de meilleure réponse</strong> (ou fonction de réaction) de la
            firme 1 à <M tex="y_2" /> : pour chaque production possible du concurrent, elle indique
            la production qui maximise le profit de la firme 1.
          </p>
        </Callout>

        <Callout variant="intuition" title="💡 Pourquoi la meilleure réponse est décroissante">
          <p>
            Si la firme 2 augmente <M tex="y_2" />, le prix commun <M tex="p(y_1+y_2)" /> diminue,
            donc la rentabilité de chaque unité vendue par la firme 1 diminue — ce qui incite la
            firme 1 à <strong>réduire sa production</strong>. Plus le rival inonde le marché, moins
            il est intéressant d'y déverser ses propres unités : les quantités des deux firmes sont
            des « substituts stratégiques ». D'où des courbes de meilleure réponse qui{" "}
            <em>descendent</em>.
          </p>
        </Callout>

        <p>
          Le raisonnement est symétrique pour la firme 2 : elle maximise{" "}
          <M tex="\Pi_2(y_2;\, y_1) = p(y_1+y_2)\,y_2 - c_2(y_2)" /> à <M tex="y_1" /> donné, et on
          obtient <strong>sa</strong> meilleure réponse <M tex="y_2 = R_2(y_1)" />.
        </p>

        <H4>L'équilibre : quand les deux meilleures réponses se croisent</H4>
        <Callout variant="definition" title="📖 Définition — équilibre de Cournot-Nash">
          <p>
            Les quantités d'équilibre de Cournot-Nash <M tex="(y_1^*, y_2^*)" /> sont telles que{" "}
            <strong>
              chaque firme choisit une production qui est sa meilleure réponse au niveau de
              production de l'autre firme
            </strong>{" "}
            :
          </p>
          <MB tex="y_1^* = R_1(y_2^*) \qquad \text{et} \qquad y_2^* = R_2(y_1^*)" />
          <p>
            Étant donné la production du concurrent, personne ne veut donc changer sa décision.
            Graphiquement : c'est l'
            <strong>intersection des deux courbes de meilleure réponse</strong>.
          </p>
        </Callout>

        <p>
          Tu reconnais l'équilibre de Nash du cours de stratégie — appliqué à un jeu où les
          stratégies sont des quantités (un continuum de choix plutôt que 2 ou 3 lignes d'une
          matrice) :
        </p>
        <div className="flex flex-wrap gap-1.5">
          <TheoryRef
            chapter="b1"
            course="strategies"
            section="s5"
            label="Rappel : l'équilibre de Nash (B1)"
          />
        </div>

        <CournotBRExplorer />

        <Quiz
          scope="ei2"
          id="q2"
          question={
            <>
              La firme 2 annonce qu'elle va <strong>augmenter</strong> sa production. D'après la
              logique de Cournot, la meilleure réponse de la firme 1 est de…
            </>
          }
          options={[
            {
              text: <>…produire plus aussi, pour ne pas perdre de parts de marché.</>,
              explain: (
                <>
                  Intuition tentante mais fausse ici : si les deux gonflent leurs productions, le
                  prix s'effondre. La logique du profit marginal dit l'inverse — c'est tout le sens
                  de la meilleure réponse <em>décroissante</em>.
                </>
              ),
            },
            {
              text: (
                <>
                  …réduire sa production : le prix commun baisse, chaque unité rapporte moins, il
                  vaut mieux en mettre moins sur le marché.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui. Quand <M tex="y_2" /> augmente, <M tex="p(y_1+y_2)" /> baisse, la rentabilité
                  de chaque unité de la firme 1 diminue, et sa meilleure réponse est de produire
                  moins : <M tex="R_1" /> est décroissante.
                </>
              ),
            },
            {
              text: (
                <>…ne rien changer : sa production optimale ne dépend pas de celle de la firme 2.</>
              ),
              explain: (
                <>
                  Non — c'est justement toute la différence avec le monopole : le profit de la firme
                  1 dépend de <M tex="y_2" /> via le prix commun, donc sa production optimale aussi.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.1)">
          <ul>
            <li>
              Écrire le profit <M tex="\Pi_1 = p(y_1+y_2)y_1 - c_1(y_1)" /> et la condition de
              premier ordre, en expliquant ses <strong>trois termes</strong> (effet prix, effet
              volume, coût marginal).
            </li>
            <li>
              Définir la <strong>fonction de meilleure réponse</strong> <M tex="R_1(y_2)" /> et
              expliquer pourquoi elle est <strong>décroissante</strong>.
            </li>
            <li>
              Définir l'équilibre de Cournot-Nash : <M tex="y_1^* = R_1(y_2^*)" /> et{" "}
              <M tex="y_2^* = R_2(y_1^*)" /> — l'intersection des deux courbes, où personne ne veut
              dévier seul.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.2 — Exemple d'équilibre de Cournot-Nash                   */}
      {/* ============================================================ */}
      <Section id="exemple-cournot" kicker="§ 3.2" title="Exemple d'équilibre de Cournot-Nash">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Place aux chiffres. Cet exemple est LE fil rouge du chapitre : il resservira pour les
          iso-profits, la collusion, Stackelberg et l'entrée. Il faut savoir le refaire les yeux
          fermés.
        </p>

        <Callout variant="exemple" title="🧪 Les données de l'exemple (à connaître)">
          <ul>
            <li>
              Demande de marché : <M tex="p(y_T) = 60 - y_T" /> où <M tex="y_T = y_1 + y_2" />.
            </li>
            <li>
              Coût total de la firme 1 : <M tex="c_1(y_1) = y_1^2" />.
            </li>
            <li>
              Coût total de la firme 2 : <M tex="c_2(y_2) = 15y_2 + y_2^2" /> — la firme 2 est moins
              efficace (15 de coût en plus par unité).
            </li>
          </ul>
        </Callout>

        <H4>Étape 1 — la meilleure réponse de la firme 1</H4>
        <p>
          Étant donné <M tex="y_2" />, la fonction de profit de la firme 1 s'écrit :
        </p>
        <MB tex="\Pi_1(y_1;\, y_2) = (60 - y_1 - y_2)\,y_1 - y_1^2" />
        <p>
          On développe mentalement : <M tex="60y_1 - y_1^2 - y_1 y_2 - y_1^2" />. Le niveau de
          production qui maximise le profit satisfait la condition de premier ordre :
        </p>
        <MB tex="\frac{d\Pi_1}{dy_1} = 60 - 2y_1 - y_2 - 2y_1 = 0" />
        <p>
          Ligne par ligne : <M tex="60 - 2y_1 - y_2" /> est la recette marginale (dérivée de{" "}
          <M tex="(60 - y_1 - y_2)y_1" />, avec le double effet prix + volume vu en § 3.1), et{" "}
          <M tex="2y_1" /> est le coût marginal (dérivée de <M tex="y_1^2" />
          ). On isole <M tex="y_1" /> : <M tex="4y_1 = 60 - y_2" />, donc
        </p>
        <FormulaBox
          tex="y_1 = R_1(y_2) = 15 - \tfrac{1}{4}\,y_2"
          label="Meilleure réponse de la firme 1"
          caption={
            <>
              Elle indique la quantité qui maximise le profit de la firme 1 étant donné que la firme
              2 produit <M tex="y_2" />. Décroissante, comme prévu : chaque unité de la firme 2 «
              déplace » un quart d'unité de la firme 1. Si la firme 2 ne produit rien, la firme 1
              produit 15 (sa production de monopole).
            </>
          }
        />

        <H4>Étape 2 — la meilleure réponse de la firme 2</H4>
        <p>
          De la même façon, à <M tex="y_1" /> donné, le profit de la firme 2 est :
        </p>
        <MB tex="\Pi_2(y_2;\, y_1) = (60 - y_1 - y_2)\,y_2 - 15y_2 - y_2^2" />
        <p>La condition de premier ordre :</p>
        <MB tex="\frac{d\Pi_2}{dy_2} = 60 - y_1 - 2y_2 - 15 - 2y_2 = 0" />
        <p>
          (le <M tex="-15" /> vient du coût marginal <M tex="15 + 2y_2" /> de la firme 2). On isole
          : <M tex="4y_2 = 45 - y_1" />, donc
        </p>
        <FormulaBox
          tex="y_2 = R_2(y_1) = \frac{45 - y_1}{4}"
          label="Meilleure réponse de la firme 2"
          caption={
            <>
              Remarque le 45 (au lieu de 60) : les 15 de coût marginal supplémentaire « mangent »
              une partie de la demande utile pour la firme 2. Moins efficace, elle vise
              naturellement plus petit.
            </>
          }
        />

        <H4>Étape 3 — l'équilibre : résoudre le système</H4>
        <p>
          À l'équilibre, chacun répond au mieux à l'autre <em>en même temps</em> : on cherche le
          point fixe des deux fonctions. En substituant <M tex="R_2" /> dans <M tex="R_1" /> :
        </p>
        <MB tex="y_1^* = 15 - \frac{1}{4}\left(\frac{45 - y_1^*}{4}\right) \;\;\Rightarrow\;\; y_1^* = 15 - \frac{45}{16} + \frac{y_1^*}{16} \;\;\Rightarrow\;\; \frac{15}{16}y_1^* = \frac{195}{16} \;\;\Rightarrow\;\; y_1^* = 13" />
        <MB tex="y_2^* = \frac{45 - 13}{4} = 8" />
        <FormulaBox
          tex="(y_1^*,\, y_2^*) = (13,\, 8)"
          label="La paire d'équilibre de Cournot-Nash"
          caption={
            <>
              Vérification express : <M tex="R_1(8) = 15 - 2 = 13" /> ✓ et{" "}
              <M tex="R_2(13) = 32/4 = 8" /> ✓. Chacun est bien la meilleure réponse à l'autre.
            </>
          }
        />

        <H4>Et donc : prix et profits ?</H4>
        <p>
          Les slides s'arrêtent aux quantités, mais complétons le tableau (simple arithmétique, on
          réutilisera ces nombres toute la suite du chapitre) : la production totale est{" "}
          <M tex="y_T = 21" />, donc le prix commun est <M tex="p = 60 - 21 = 39" />. Les profits :
        </p>
        <MB tex="\Pi_1^* = 39 \times 13 - 13^2 = 507 - 169 = 338 \qquad \Pi_2^* = 39 \times 8 - (15 \times 8 + 8^2) = 312 - 184 = 128" />
        <p>
          La firme efficace produit plus et gagne (beaucoup) plus. Garde <strong>338</strong> et{" "}
          <strong>128</strong> en tête : ce sont les niveaux de référence pour toute la discussion
          sur la collusion.
        </p>

        <Callout variant="methode" title="🛠️ La méthode Cournot en 4 réflexes (type examen)">
          <ol>
            <li>
              Écrire le profit de chaque firme avec le prix <M tex="p(y_1+y_2)" /> remplacé par son
              expression.
            </li>
            <li>
              Dériver par rapport à <strong>sa propre</strong> quantité (l'autre est un paramètre
              !), annuler.
            </li>
            <li>
              Isoler pour obtenir les deux fonctions de réaction <M tex="R_1" /> et <M tex="R_2" />.
            </li>
            <li>
              Résoudre le système (substitution) → les quantités d'équilibre, puis prix et profits.
            </li>
          </ol>
        </Callout>

        <Quiz
          scope="ei2"
          id="q3"
          question={
            <>
              Dans cet exemple, si la firme 2 produisait <M tex="y_2 = 4" />, quelle serait la
              meilleure réponse de la firme 1 ?
            </>
          }
          options={[
            {
              text: <>15 : la firme 1 produit toujours sa quantité de monopole.</>,
              explain: (
                <>
                  15 n'est la meilleure réponse que si <M tex="y_2 = 0" />. Dès que la firme 2
                  produit, le prix baisse et la firme 1 doit ajuster à la baisse.
                </>
              ),
            },
            {
              text: (
                <>
                  14, car <M tex="R_1(4) = 15 - \tfrac{1}{4} \times 4 = 14" />.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : on injecte <M tex="y_2 = 4" /> dans <M tex="R_1(y_2) = 15 - y_2/4" />
                  . Chaque unité du rival ne déplace qu'un <em>quart</em> d'unité de la firme 1.
                </>
              ),
            },
            {
              text: <>11, car 15 − 4 = 11.</>,
              explain: (
                <>
                  Piège classique : tu as oublié le facteur <M tex="\tfrac{1}{4}" /> devant{" "}
                  <M tex="y_2" />. La bonne formule est <M tex="15 - \tfrac{1}{4}y_2 = 14" />.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.2)">
          <ul>
            <li>
              Refaire la dérivation complète avec <M tex="p = 60 - y_T" />, <M tex="c_1 = y_1^2" />,{" "}
              <M tex="c_2 = 15y_2 + y_2^2" /> :{" "}
              <strong>
                <M tex="R_1(y_2) = 15 - \tfrac{1}{4}y_2" />
              </strong>{" "}
              et{" "}
              <strong>
                <M tex="R_2(y_1) = \tfrac{45 - y_1}{4}" />
              </strong>
              .
            </li>
            <li>
              Résoudre le système jusqu'à <strong>(13, 8)</strong>, puis prix (39) et profits (338 ;
              128).
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.3 — Les courbes d'iso-profit                              */}
      {/* ============================================================ */}
      <Section id="isoprofit" kicker="§ 3.3" title="Les courbes d'iso-profit">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Nouvel outil graphique — le plus important du chapitre. Il va nous permettre de « voir »
          les profits directement dans le plan <M tex="(y_1, y_2)" />, et donc de comprendre d'un
          coup d'œil la collusion, Stackelberg et l'exclusion d'un entrant.
        </p>

        <Callout variant="definition" title="📖 Définition — courbe d'iso-profit">
          <p>
            Pour la firme 1, une courbe d'iso-profit indique{" "}
            <strong>
              toutes les paires <M tex="(y_1, y_2)" />
            </strong>{" "}
            qui donnent à la firme 1{" "}
            <strong>
              le même niveau de profit <M tex="\Pi^A" />
            </strong>
            . (Exactement comme une courbe de niveau sur une carte topographique : ici, l'« altitude
            », c'est le profit.)
          </p>
        </Callout>

        <H4>À quoi ressemblent-elles ? Deux observations suffisent</H4>
        <p>
          Avant d'analyser les courbes, il est utile de se remémorer comment évolue le profit{" "}
          <M tex="\Pi_1 = p(y_1+y_2)y_1 - c_1(y_1)" /> avec chaque quantité :
        </p>
        <Steps
          items={[
            <>
              <strong>
                <M tex="\Pi_1" /> en fonction de <M tex="y_1" /> (à <M tex="y_2" /> fixé) :
              </strong>{" "}
              il croît d'abord avec <M tex="y_1" />, puis décroît quand <M tex="y_1" /> est grand —
              il existe une production optimale <M tex="y_1^*" /> (une « bosse », comme pour le
              monopole).
            </>,
            <>
              <strong>
                <M tex="\Pi_1" /> en fonction de <M tex="y_2" /> :
              </strong>{" "}
              il <em>décroît</em>, tout simplement : plus le rival produit, plus le prix commun
              baisse, moins la firme 1 gagne.
            </>,
          ]}
        />
        <p>
          Assemble les deux : un iso-profit de la firme 1 est tel que si <M tex="y_1" /> est petit
          et croît, <M tex="y_2" /> doit <strong>augmenter</strong> pour garder <M tex="\Pi_1" />{" "}
          constant (le gain de la bosse doit être neutralisé) ; si <M tex="y_1" /> est grand et
          croît, <M tex="y_2" /> doit <strong>diminuer</strong>. Résultat : des courbes{" "}
          <strong>en forme de ∩</strong> (des « collines couchées ») dans le plan{" "}
          <M tex="(y_1, y_2)" />.
        </p>

        <Callout variant="retiens" title="⭐ Les deux règles de lecture (cruciales pour la suite)">
          <ul>
            <li>
              <strong>Plus bas = plus riche (pour la firme 1).</strong> À <M tex="y_1" /> donné, les
              profits de la firme 1 s'accroissent lorsque <M tex="y_2" /> diminue. Les iso-profits
              les plus bas correspondent donc à des profits plus élevés :{" "}
              <M tex="\Pi^C > \Pi^B > \Pi^A" /> quand on descend.
            </li>
            <li>
              <strong>La meilleure réponse passe par tous les sommets.</strong> Si la firme 2
              choisit <M tex="y_2 = y_2'" />, la firme 1 cherche, le long de la droite horizontale{" "}
              <M tex="y_2 = y_2'" />, le point qui atteint la courbe d'iso-profit{" "}
              <em>la plus basse</em> : c'est le sommet — et c'est précisément <M tex="R_1(y_2')" />.
            </li>
          </ul>
        </Callout>

        <p>
          Pour la firme 2, on procède de façon similaire, mais en faisant subir une{" "}
          <strong>rotation</strong> aux formes : ses iso-profits sont des courbes ouvertes vers la
          gauche (des « ⊂ »), son profit augmente quand on va <em>vers la gauche</em> (moins de{" "}
          <M tex="y_1" />
          ), et sa fonction de meilleure réponse <M tex="R_2" /> passe par tous les sommets (les
          points les plus à droite) de ses courbes.
        </p>

        <IsoProfitExplorer />

        <Quiz
          scope="ei2"
          id="q4"
          question={
            <>
              Deux courbes d'iso-profit de la firme 1 : la courbe <M tex="\Pi^B" /> est{" "}
              <em>en dessous</em> de la courbe <M tex="\Pi^A" />. Laquelle correspond au profit le
              plus élevé, et pourquoi ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <M tex="\Pi^A" /> : plus on est haut dans le graphique, plus le profit est grand.
                </>
              ),
              explain: (
                <>
                  C'est l'inverse ! L'axe vertical, c'est <M tex="y_2" /> — la production du{" "}
                  <em>rival</em>. Être « haut » signifie subir un rival qui inonde le marché…
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\Pi^B" /> : à <M tex="y_1" /> donné, une courbe plus basse signifie un{" "}
                  <M tex="y_2" /> plus faible, donc un prix plus élevé et un profit plus grand pour
                  la firme 1.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement le raisonnement des slides : à <M tex="y_1" /> donné, les profits de la
                  firme 1 s'accroissent lorsque <M tex="y_2" /> diminue — les iso-profits les plus
                  bas correspondent à des profits plus élevés.
                </>
              ),
            },
            {
              text: <>Impossible à dire sans connaître les fonctions de coût.</>,
              explain: (
                <>
                  Pas besoin des coûts : la règle « plus bas = profit plus élevé » découle
                  uniquement du fait que le profit de la firme 1 décroît avec <M tex="y_2" /> (via
                  le prix commun).
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.3)">
          <ul>
            <li>
              Définir une courbe d'iso-profit et <strong>dessiner</strong> leur forme en ∩ (firme 1)
              / en ⊂ (firme 2), en justifiant par les deux observations sur <M tex="\Pi_1(y_1)" />{" "}
              et <M tex="\Pi_1(y_2)" />.
            </li>
            <li>
              Les deux règles :{" "}
              <strong>iso-profit plus bas (resp. plus à gauche) = profit plus élevé</strong>, et{" "}
              <strong>la fonction de meilleure réponse passe par tous les sommets</strong>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.4 — La collusion                                          */}
      {/* ============================================================ */}
      <Section id="collusion-q" kicker="§ 3.4" title="La collusion en quantités">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Question dérangeante : les profits obtenus dans une concurrence à la Cournot-Nash sont-ils
          les plus élevés que les firmes peuvent atteindre ? Réponse : non. Et cette réponse
          explique pourquoi les cartels existent… et pourquoi ils explosent.
        </p>

        <H4>L'équilibre de Cournot n'est pas le paradis des firmes</H4>
        <p>
          Plaçons-nous à l'équilibre <M tex="(y_1^*, y_2^*) = (13, 8)" /> et traçons les deux
          iso-profits qui y passent. Existe-t-il une autre paire <M tex="(y_1, y_2)" /> qui
          donnerait des profits plus élevés <strong>aux deux firmes</strong> ? Oui : il existe une{" "}
          <strong>zone non négligeable</strong> — la « lentille » entre les deux courbes, en bas à
          gauche de l'équilibre — où les profits sont plus élevés pour les deux. Pour y aller, il
          faut que <em>chacune réduise sa production</em> : moins d'offre totale, prix plus haut,
          profits plus gros. Et à l'intérieur de la lentille, on peut même faire encore mieux, de
          proche en proche, jusqu'aux paires « efficaces » pour le duo — dont celle qui maximise le
          profit total du cartel, notée <M tex="(y_1^m, y_2^m)" />.
        </p>

        <CollusionLensExplorer />

        <Callout variant="definition" title="📖 Définitions — collusion et cartel">
          <p>
            Il y a donc un incitant pour les deux firmes à{" "}
            <strong>coopérer pour réduire les montants mis sur le marché</strong>. C'est de la{" "}
            <strong>collusion</strong>. Des firmes en collusion forment un <strong>cartel</strong>.
          </p>
          <p>
            Comment feraient-elles ? Les deux firmes pourraient décider de{" "}
            <strong>maximiser leurs profits totaux et de les partager entre elles</strong> :{" "}
            <M tex="y_1" /> et <M tex="y_2" /> maximisent alors
          </p>
          <MB tex="\Pi_m(y_1, y_2) = p(y_1+y_2)(y_1+y_2) - c_1(y_1) - c_2(y_2)" />
          <p>
            Elles ne peuvent pas faire <em>pire</em> qu'en Cournot par la collusion : elles peuvent
            toujours choisir les productions de Cournot-Nash et obtenir les profits correspondants.
            La collusion génère donc des profits totaux au moins aussi grands. (Dans notre exemple :
            487,5 pour le cartel contre 338 + 128 = 466 en Cournot.)
          </p>
        </Callout>

        <H4>Le ver dans le fruit : un cartel est-il stable ?</H4>
        <p>
          Une firme a-t-elle intérêt à tricher et à ne pas respecter les accords ? Testons : si la
          firme 1 produit sagement son quota <M tex="y_1^m" />, est-ce que la firme 2 maximise ses
          profits en choisissant <M tex="y_2^m" /> ? <strong>Non !</strong> Sa meilleure réponse à{" "}
          <M tex="y_1^m" /> est, par définition… <M tex="R_2(y_1^m)" />, et comme le point de cartel
          est <em>en dessous</em> de sa courbe de réaction :
        </p>
        <MB tex="R_2(y_1^m) > y_2^m" />
        <p>
          La firme 2 a donc intérêt à ne pas respecter son accord de cartel et à{" "}
          <strong>augmenter sa production</strong>. De la même façon, la firme 1 accroît ses profits
          en trichant et en passant de <M tex="y_1^m" /> à <M tex="R_1(y_2^m)" />. Dans l'exemple
          chiffré : le quota de la firme 2 est 5, mais sa meilleure réponse au quota de la firme 1
          est <M tex="R_2(12{,}5) = 8{,}125" /> — la tentation est mathématique.
        </p>

        <Callout
          variant="attention"
          title="⚠️ Conclusion du cours — les cartels sont fondamentalement instables"
        >
          <p>
            Les cartels dans lesquels des producteurs coopèrent en maximisant leurs profits joints
            sont <strong>fondamentalement instables</strong>. Par exemple, les accords de l'OPEP,
            qui sont régulièrement violés. Il s'agit d'une illustration du{" "}
            <strong>dilemme du prisonnier</strong> : les deux firmes ont intérêt à former un cartel
            (pour autant que ce soit autorisé)… mais une fois ce cartel formé, chaque firme a
            intérêt à en dévier, en espérant que l'autre ne dévie pas.
          </p>
        </Callout>

        <p>
          Vérifions cette structure de dilemme du prisonnier sur un mini-jeu chiffré. Pour rester
          lisible, prenons le marché symétrique du cours (celui de la section 3.7 : demande{" "}
          <M tex="p = 12 - y_T" />, coût marginal nul) et ne laissons à chaque firme que deux
          options : respecter le quota de cartel (produire 3) ou revenir à sa quantité de Cournot
          (produire 4) :
        </p>

        <PayoffMatrix
          rowPlayer="Firme 1"
          colPlayer="Firme 2"
          rows={["Respecter (y = 3)", "Dévier (y = 4)"]}
          cols={["Respecter (y = 3)", "Dévier (y = 4)"]}
          payoffs={[
            [
              [18, 18],
              [15, 20],
            ],
            [
              [20, 15],
              [16, 16],
            ],
          ]}
          interactive
          caption={
            <>
              Profits par firme. Cartel (3 ; 3) : <M tex="p = 6" />, chacune gagne 18. Si une seule
              dévie à 4 : <M tex="p = 5" />, la tricheuse gagne 20, la fidèle 15. Les deux dévient :
              Cournot (4 ; 4), <M tex="p = 4" />, 16 chacune. Révèle les meilleures réponses :
              dévier est <strong>dominant</strong>, et l'unique équilibre de Nash est (16 ; 16) —
              alors que (18 ; 18) était à portée de main. (Et la vraie meilleure réponse au quota 3
              serait même 4,5, pour un profit de 20,25 : la tentation est encore pire que dans ce
              tableau.)
            </>
          }
        />

        <H4>Et la loi, dans tout ça ?</H4>
        <p>
          Par ailleurs, les cartels sont <strong>interdits</strong>, car ils produisent de
          l'inefficacité : on remplace des firmes en concurrence par un cartel qui se comporte comme
          un monopole (prix plus haut, quantités plus basses — tu connais le coût social depuis
          EI1).
        </p>
        <CardGrid
          items={[
            {
              title: "🇪🇺 Article 101 du TFUE",
              body: (
                <>
                  « Sont incompatibles avec le marché intérieur et interdits tous accords entre
                  entreprises, toutes décisions d'associations d'entreprises et toutes pratiques
                  concertées, qui sont susceptibles d'affecter le commerce entre États membres et
                  qui ont pour objet ou pour effet d'empêcher, de restreindre ou de fausser le jeu
                  de la concurrence… ». La Commission publie ses décisions et statistiques de
                  cartels sanctionnés.
                </>
              ),
            },
            {
              title: "🇧🇪 L'Autorité Belge de la Concurrence (ABC)",
              body: (
                <>
                  L'ABC poursuit les accords et pratiques concertées qui restreignent de manière
                  sensible la concurrence sur le marché belge (art. IV.1, §1 du Code de droit
                  économique). À noter : il existe des <strong>accords de clémence</strong> — un
                  participant à un cartel qui le <em>dénonce</em> bénéficie d'une réduction des
                  sanctions (tant pour l'ABC que pour l'UE). Malin : la clémence exploite
                  précisément l'instabilité interne du cartel !
                </>
              ),
            },
          ]}
        />

        <Callout variant="definition" title="📖 Collusion explicite vs collusion tacite">
          <p>
            Nous avons analysé une <strong>collusion explicite</strong> : les firmes s'entendent
            explicitement dans le but d'augmenter leurs profits. Il existe aussi de la{" "}
            <strong>collusion tacite</strong>, où les firmes obtiennent des profits supérieurs aux
            profits normaux <em>sans entente explicite</em>. Son mécanisme sera expliqué dans le cas
            de la concurrence à la Bertrand (section 4.2), où il est analytiquement plus simple à
            modéliser. Elle est difficile à sanctionner… puisqu'il n'y a pas d'accord à prouver.
          </p>
        </Callout>

        <Quiz
          scope="ei2"
          id="q5"
          question={<>Pourquoi un cartel « à la OPEP » est-il fondamentalement instable ?</>}
          options={[
            {
              text: (
                <>
                  Parce qu'une fois les quotas fixés, chaque membre maximise son profit en
                  produisant <em>plus</em> que son quota — sa meilleure réponse au quota des autres
                  dépasse le sien.
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est le cœur du raisonnement : <M tex="R_2(y_1^m) > y_2^m" />. Le point de cartel
                  n'est sur la courbe de meilleure réponse de <em>personne</em> — chacun a donc
                  intérêt à dévier. Structure de dilemme du prisonnier.
                </>
              ),
            },
            {
              text: <>Parce que produire moins coûte plus cher aux firmes.</>,
              explain: (
                <>
                  Non — produire moins <em>économise</em> des coûts. L'instabilité vient du prix
                  élevé maintenu par les autres : il rend chaque unité supplémentaire de triche très
                  rentable.
                </>
              ),
            },
            {
              text: (
                <>
                  Uniquement parce que c'est illégal : sans interdiction légale, les cartels
                  seraient stables.
                </>
              ),
              explain: (
                <>
                  L'illégalité aggrave le problème (impossible de signer un contrat qui oblige à
                  respecter les quotas), mais l'instabilité est <em>interne</em> : même un cartel
                  légal subit la tentation de la déviation — voir l'OPEP, qui est parfaitement
                  légale entre États.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.4)">
          <ul>
            <li>
              Montrer graphiquement qu'il existe une <strong>zone (lentille)</strong> où les deux
              firmes battent leurs profits de Cournot, et situer le point de cartel{" "}
              <M tex="(y_1^m, y_2^m)" /> qui maximise le profit joint.
            </li>
            <li>
              Démontrer l'<strong>instabilité</strong> : <M tex="R_2(y_1^m) > y_2^m" /> (et
              symétriquement pour la firme 1) — et la relier au dilemme du prisonnier et à l'OPEP.
            </li>
            <li>
              Le volet légal : <strong>article 101 TFUE</strong>, ABC, accords de{" "}
              <strong>clémence</strong> ; la distinction{" "}
              <strong>collusion explicite / tacite</strong>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.5 — L'équilibre de Stackelberg                            */}
      {/* ============================================================ */}
      <Section id="stackelberg" kicker="§ 3.5" title="L'ordre du jeu : l'équilibre de Stackelberg">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Jusqu'ici, les deux firmes choisissaient leurs quantités <em>simultanément</em>. Que se
          passe-t-il si la firme 1 choisit d'abord son niveau de production, et que la firme 2
          choisit ensuite, en ayant observé ce choix ?
        </p>

        <Callout variant="definition" title="📖 Définitions — leader, follower, jeu de Stackelberg">
          <p>
            La firme qui joue en premier est le <strong>leader</strong> ; celle qui joue ensuite est
            le <strong>follower</strong>. La concurrence s'analyse alors comme un{" "}
            <strong>jeu séquentiel</strong> dans lequel les stratégies sont les niveaux de
            production : ce sont des <strong>jeux de Stackelberg</strong>.
          </p>
          <p>
            La question du cours : vaut-il mieux être leader, et jouir de l'avantage stratégique à
            jouer premier ? Ou vaut-il mieux être follower, et agir en étant pleinement informé ?
          </p>
        </Callout>

        <H4>La méthode : backward induction (comme pour tout jeu séquentiel)</H4>
        <Steps
          items={[
            <>
              <strong>On commence par le dernier joueur : le follower.</strong> Quelle est sa
              stratégie optimale dans <em>toutes</em> les situations où il peut se trouver ? Facile
              — on la connaît déjà : si le leader a choisi <M tex="y_1" />, le follower joue sa
              meilleure réponse <M tex="y_2 = R_2(y_1)" />. Sa fonction de réaction entière devient
              sa stratégie.
            </>,
            <>
              <strong>On remonte au leader.</strong> En agissant en premier, le leader{" "}
              <em>anticipe</em> cette réaction pour chaque niveau de <M tex="y_1" /> — contrairement
              à Cournot où la firme 1 considérait la production de la firme 2 comme donnée. Son
              profit s'écrit donc :
              <MB tex="\Pi_1^s(y_1) = p\big(y_1 + R_2(y_1)\big)\,y_1 - c_1(y_1)" />
              et il choisit le <M tex="y_1" /> qui maximise cette expression.
            </>,
          ]}
        />
        <div className="flex flex-wrap gap-1.5">
          <TheoryRef
            chapter="b3"
            course="strategies"
            section="sec-fini"
            label="Stratégies · La backward induction à l'œuvre (B3)"
          />
        </div>

        <Callout variant="intuition" title="💡 Le leader ne peut pas perdre au change">
          <p>
            Le leader peut-il faire au moins aussi bien qu'en Cournot-Nash ?{" "}
            <strong>Oui, toujours.</strong> Il peut choisir le niveau de production qu'il aurait
            choisi en Cournot (<M tex="y_1^*" />) — et il sait que le follower répondra alors par{" "}
            <M tex="R_2(y_1^*) = y_2^*" />, le niveau de Cournot également. Le leader retrouve donc
            exactement son profit de Cournot… au minimum. Mais il peut choisir autre chose, et faire
            potentiellement mieux. Jouer en premier ne peut pas nuire — à une condition près qu'on
            verra plus bas.
          </p>
        </Callout>

        <H4>L'exemple fil rouge, version Stackelberg</H4>
        <p>
          Reprenons les mêmes données (<M tex="p = 60 - y_T" />, <M tex="c_1 = y_1^2" />,{" "}
          <M tex="c_2 = 15y_2 + y_2^2" />
          ), la firme 1 étant leader. Le follower garde sa fonction de réaction{" "}
          <M tex="R_2(y_1) = \tfrac{45 - y_1}{4}" />. La fonction de profit du leader devient :
        </p>
        <MB tex="\Pi_1^s(y_1) = \Big(60 - y_1 - \frac{45 - y_1}{4}\Big)\,y_1 - y_1^2 = \frac{195}{4}\,y_1 - \frac{7}{4}\,y_1^2" />
        <p>
          (on a remplacé <M tex="y_2" /> par <M tex="R_2(y_1)" /> puis regroupé les termes — fais le
          calcul une fois à la main !). Le profit est maximum quand la dérivée s'annule :
        </p>
        <MB tex="\frac{195}{4} = \frac{7}{2}\,y_1 \;\Rightarrow\; y_1^s = 13{,}9 \qquad \text{puis} \qquad y_2^s = R_2(y_1^s) = \frac{45 - 13{,}9}{4} = 7{,}8" />

        <FormulaBox
          tex="(y_1^s,\, y_2^s) = (13{,}9\, ;\, 7{,}8) \quad \text{contre} \quad (y_1^*,\, y_2^*) = (13\, ;\, 8) \text{ en Cournot}"
          label="Stackelberg vs Cournot"
          caption={
            <>
              Le leader choisit de produire <strong>plus</strong> et le follower{" "}
              <strong>moins</strong> — ceci est toujours vrai. Et dans cet exemple, la production
              totale est plus élevée qu'en Cournot (13,9 + 7,8 = 21,7 contre 21), donc le prix est
              plus faible. Profits : ≈ 339,5 pour le leader (contre 338) et ≈ 120,7 pour le follower
              (contre 128) : mieux vaut être leader qu'informé.
            </>
          }
        />

        <Callout variant="intuition" title="💡 Ce qui se passe géométriquement">
          <p>
            Le leader sait que le point final sera <em>sur la courbe de réaction du follower</em>.
            Son problème revient donc à choisir, sur cette courbe, le point qui l'amène sur son
            iso-profit <strong>le plus bas</strong> possible. La solution : le point de{" "}
            <strong>tangence</strong> entre la droite de réaction du follower et une iso-profit du
            leader. En produisant plus que 13, le leader « pousse » le follower à se retirer
            partiellement (7,8 au lieu de 8) — il utilise la réaction de l'autre comme un levier.
          </p>
        </Callout>

        <StackelbergExplorer />

        <H4>Le talon d'Achille : il faut pouvoir s'engager</H4>
        <p>
          Il y a un « NB » crucial dans les slides : dans beaucoup de situations, il n'est pas
          évident que le leader puisse s'engager à ne pas modifier sa production. Regarde le
          graphique : <strong>ex post</strong>, une fois que le follower a choisi{" "}
          <M tex="y_2^s = 7{,}8" />, le leader voudrait… réduire sa production sous{" "}
          <M tex="y_1^s" /> (sa vraie meilleure réponse à 7,8 est <M tex="R_1(7{,}8) = 13{,}05" />,
          pas 13,9 !). Mais si le follower anticipe ce mouvement, il aurait dû produire plus… ce qui
          aurait modifié le comportement du leader… modifiant l'anticipation du follower, etc. On
          retomberait finalement dans <strong>l'équilibre de Cournot</strong>, où le leader est
          moins bien qu'en Stackelberg.
        </p>
        <Callout variant="attention" title="⚠️ Pour que Stackelberg tienne">
          <p>
            Le leader doit trouver des <strong>moyens crédibles de s'engager</strong> à ne pas
            réduire sa production ultérieurement — par exemple via des investissements coûteux ou
            via la création de <strong>surcapacités</strong>. Sans engagement crédible, l'avantage
            du premier joueur s'évapore. (C'est le même thème que la crédibilité des menaces dans
            les jeux séquentiels du cours de stratégie.)
          </p>
        </Callout>

        <H4>Interprétation : l'entrée accommodée et la position dominante</H4>
        <p>
          La situation décrite peut représenter le cas d'une firme en monopole qui voit venir un
          concurrent sur son marché. Elle s'en accommode en ajustant sa production <em>avant</em>{" "}
          l'entrée du concurrent, de façon à garder une <strong>position dominante</strong> et à
          pousser la nouvelle firme à produire moins qu'elle ne le ferait en Cournot. On parle d'
          <strong>entrée accommodée</strong> — mais pas d'« abus » : dans nos exemples, l'équilibre
          de Stackelberg amène d'ailleurs à une production totale plus élevée que Cournot, donc à un
          prix plus faible. Les autorités ne considèrent pas l'existence d'une position dominante
          comme néfaste en soi ; c'est son <em>utilisation abusive</em> qui est proscrite (article
          IV.2 du Code de droit économique belge et article 102 du TFUE) — la section suivante
          montre où passe la frontière.
        </p>

        <Quiz
          scope="ei2"
          id="q6"
          question={
            <>
              Pourquoi l'équilibre de Stackelberg exige-t-il que le leader puisse{" "}
              <strong>s'engager de façon crédible</strong> sur sa production ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Parce qu'ex post, une fois le follower engagé à 7,8, le leader préférerait revenir
                  vers sa propre courbe de réaction (produire moins que 13,9) ; si le follower
                  l'anticipe, tout se détricote et on retombe sur Cournot.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement le raisonnement des slides : 13,9 n'est <em>pas</em> la meilleure
                  réponse du leader à 7,8. Sans engagement (investissements irréversibles,
                  surcapacités), l'annonce « je produirai 13,9 » n'est pas crédible, et l'avantage
                  du premier joueur disparaît.
                </>
              ),
            },
            {
              text: <>Parce que le follower pourrait refuser de jouer sa fonction de réaction.</>,
              explain: (
                <>
                  Non : jouer <M tex="R_2(y_1)" /> est par définition ce qui maximise le profit du
                  follower une fois <M tex="y_1" /> observé — il n'a aucune raison d'y renoncer. Le
                  problème de crédibilité est du côté du <em>leader</em>.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que produire 13,9 fait perdre de l'argent au leader par rapport à Cournot.
                </>
              ),
              explain: (
                <>
                  Au contraire : 339,5 contre 338 ! Le problème n'est pas la rentabilité du plan,
                  c'est sa <em>cohérence temporelle</em> : une fois le follower engagé, le leader a
                  mieux à faire — et tout le monde le sait.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.5)">
          <ul>
            <li>
              La méthode : follower → <M tex="y_2 = R_2(y_1)" /> ; leader → maximiser{" "}
              <M tex="\Pi_1^s(y_1) = p(y_1 + R_2(y_1))y_1 - c_1(y_1)" /> (backward induction).
            </li>
            <li>
              L'exemple : <M tex="\Pi_1^s = \tfrac{195}{4}y_1 - \tfrac{7}{4}y_1^2" /> →{" "}
              <strong>(13,9 ; 7,8)</strong> ; leader produit plus, follower moins, production totale
              plus grande (21,7), prix plus bas.
            </li>
            <li>
              L'argument « le leader fait toujours au moins aussi bien qu'en Cournot » — et sa
              limite : sans <strong>engagement crédible</strong> (investissements, surcapacités),
              retour à Cournot.
            </li>
            <li>
              Le vocabulaire : <strong>entrée accommodée</strong>,{" "}
              <strong>position dominante</strong> (légale) vs <strong>abus</strong> de position
              dominante (interdit).
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.6 — Empêcher l'entrée d'un concurrent                     */}
      {/* ============================================================ */}
      <Section id="entree" kicker="§ 3.6" title="Empêcher l'entrée d'un concurrent">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Jusqu'ici, le follower gardait un profit positif : il avait intérêt à entrer. Ajoutons un
          ingrédient réaliste — des <strong>coûts fixes</strong> — et le leader découvre une option
          plus radicale que l'accommodation : fermer la porte.
        </p>

        <H4>Quand entrer ne vaut plus le coup</H4>
        <p>
          Avec des coûts fixes, il est possible que le profit du follower devienne{" "}
          <strong>négatif</strong>. Suis le raisonnement des slides sur le graphique : considère un
          point A loin sur la fonction de réaction du follower, où le leader produit beaucoup. Le
          follower y est amené à produire peu ; vu la production importante du leader, le prix est
          faible ; avec des coûts fixes importants, sa petite production ne suffirait pas à les
          couvrir. Il préférerait alors <strong>ne pas entrer</strong> et avoir une production
          nulle. Si c'est le cas pour tous les points au-delà d'un seuil, la{" "}
          <strong>« vraie » fonction de réaction du follower</strong> doit exclure ces points et les
          remplacer par une non-entrée : <M tex="y_2 = 0" /> dès que le leader produit au-delà d'une{" "}
          <strong>production limite</strong>.
        </p>
        <p>
          Le leader a alors trois options, et le cours les distingue soigneusement — car la
          frontière légale passe exactement là :
        </p>
        <CardGrid
          items={[
            {
              title: "Cas 1 — le leader surproduit exprès pour exclure",
              body: (
                <>
                  La production qui exclut le follower dépasse largement <M tex="y_1^S" />, mais
                  elle rapporte plus que l'accommodation : le leader la choisit{" "}
                  <em>précisément pour</em> empêcher l'entrée. Profit plus élevé grâce à
                  l'exclusion… mais ceci risque d'être considéré comme un{" "}
                  <strong>abus de position dominante</strong>. C'est proche du{" "}
                  <strong>limit pricing</strong> : produire beaucoup pour baisser le prix et rendre
                  l'entrée non profitable.
                </>
              ),
            },
            {
              title: "Cas 2 — l'exclusion « naturelle »",
              body: (
                <>
                  La production de l'équilibre de Stackelberg <M tex="y_1^S" /> (qui n'est pas un
                  abus) <em>suffit déjà</em> à exclure le follower. Le leader produit simplement son
                  optimum — l'exclusion n'est qu'un <strong>effet secondaire</strong> d'un
                  comportement économiquement justifié : sans doute <em>pas</em> un abus.
                </>
              ),
            },
            {
              title: "Cas 3 — le leader accommode",
              body: (
                <>
                  La production qui exclurait est <em>tellement</em> grande qu'elle amènerait le
                  leader sur une iso-profit plus défavorable que Stackelberg. Il préfère alors{" "}
                  <strong>accommoder l'entrée</strong> et se contenter de l'équilibre de
                  Stackelberg.
                </>
              ),
            },
            {
              title: "La question juridique (slide 62)",
              body: (
                <>
                  Y a-t-il abus si le leader choisit une production qui exclut le follower ?{" "}
                  <strong>Sans doute oui</strong> s'il surproduit expressément pour forcer la
                  non-entrée ; <strong>probablement non</strong> si sa production importante est
                  économiquement justifiable et que l'exclusion n'est qu'un effet secondaire. Toute
                  la difficulté est de prouver l'<em>intention</em>.
                </>
              ),
            },
          ]}
        />

        <EntryDeterrenceExplorer />

        <H4>La panoplie (bien réelle) des barrières à l'entrée</H4>
        <p>
          Les slides listent les techniques utilisées pour empêcher l'entrée de concurrents (avec,
          dès lors, abus de position dominante) :
        </p>
        <ul>
          <li>
            les <strong>productions (voire capacités) excédentaires</strong> ;
          </li>
          <li>
            des <strong>contrats d'exclusivité</strong> avec des fournisseurs pour qu'ils ne livrent
            pas les rivaux ;
          </li>
          <li>les dépenses de publicité ;</li>
          <li>des contrats de long terme avec les clients ;</li>
          <li>
            des contrats assurant d'être le <strong>produit par défaut</strong> (le moteur de
            recherche Google sur les smartphones) ;
          </li>
          <li>
            les <strong>coûts de changement</strong> (switching costs) ;
          </li>
          <li>
            les <strong>ventes liées</strong> : le leader, efficace sur le marché A et pas sur le B,
            vend A et B ensemble ; le rival, excellent sur B seulement, ne trouve plus de clients
            pour son bien B — les clients l'ont déjà reçu « gratuitement » avec A.
          </li>
        </ul>

        <Callout variant="exemple" title="🔍 Illustrations des slides">
          <ul>
            <li>
              <strong>Compagnies aériennes (fin du XXᵉ siècle) :</strong> augmentation du nombre de
              vols sur les liaisons visées par de nouveaux arrivants → vols à moitié vides et pertes
              à court terme, mais mise à l'écart des concurrents potentiels en inondant le marché
              (gain à long terme).
            </li>
            <li>
              <strong>Netflix et Amazon Prime Video :</strong> des milliards investis dans le
              contenu original → saturation du marché du streaming ; difficile pour un entrant de
              proposer des nouveautés qui détourneraient des clients, surtout sans ressources
              comparables.
            </li>
          </ul>
        </Callout>

        <H4>Exploiter les biais cognitifs des consommateurs</H4>
        <p>
          Des firmes dominantes peuvent aussi utiliser les <strong>biais cognitifs</strong> (étudiés
          en économie comportementale) pour entraver l'entrée : pour traiter une situation nouvelle
          et complexe, l'humain se contente souvent de la comparer à une situation similaire qu'il
          connaît (<em>heuristique</em>). Cela fait gagner du temps… mais les raccourcis biaisent la
          décision, et une firme installée peut en profiter pour « tromper » les consommateurs et
          les dissuader de passer chez un nouveau concurrent (Deschamps &amp; Ferey, 2012).
        </p>
        <CardGrid
          items={[
            {
              title: "💊 Plavix (Sanofi)",
              body: (
                <>
                  Après l'expiration du brevet du principe actif (2008), des génériques équivalents
                  arrivent — seuls les <em>excipients</em> (sans activité pharmacologique)
                  diffèrent, l'excipient de Sanofi restant breveté. Sanofi communique aux
                  professionnels de santé que « Plavix et les génériques sont des médicaments
                  différents », sous-entendant une efficacité différente — ce qui n'est pas correct.
                  Beaucoup de médecins, par heuristique, prescrivent ce qu'ils connaissent. Résultat
                  : autorités de la concurrence françaises, condamnation pour abus de position
                  dominante. (Cas similaire : Schering-Plough et le Subutex, communication sur la
                  taille et le goût du générique concurrent.)
                </>
              ),
            },
            {
              title: "⚡ GEG contre Poweo (Grenoble)",
              body: (
                <>
                  Après la libéralisation de la distribution d'électricité (~2005), GEG —
                  ex-monopole devenu firme à but lucratif sur la distribution, mais toujours
                  monopole public sur le réseau — met en doute dans la presse le sérieux de
                  l'entrant Poweo, l'accusant de « rechercher essentiellement le profit,
                  contrairement à GEG qui aurait à cœur les valeurs du service public ». Les
                  consommateurs font confiance à ce qu'ils connaissent. L'autorité de concurrence
                  sanctionne ce comportement qui crée volontairement la confusion.
                </>
              ),
            },
          ]}
        />

        <Callout variant="methode" title="🛠️ Comment les autorités jugent un abus (slide 75)">
          <ol>
            <li>
              Établir d'abord qu'il existe une <strong>position dominante</strong> — via des
              indicateurs de parts de marché, dans un marché qu'il faut délimiter précisément.
            </li>
            <li>
              Établir ensuite l'<strong>abus</strong> : outre les faits avérés (parfois issus de
              perquisitions), il y a matière à interprétation — le comportement vise-t-il à empêcher
              l'entrée, ou s'agit-il d'une stratégie commerciale normale ? Le rôle des économistes
              est important pour guider juristes et managers vers la bonne interprétation, des deux
              côtés de la barre.
            </li>
          </ol>
        </Callout>

        <Quiz
          scope="ei2"
          id="q7"
          question={
            <>
              Un leader produit une quantité telle que l'entrant potentiel renonce à entrer. Est-ce
              un abus de position dominante ?
            </>
          }
          options={[
            {
              text: <>Oui, toujours : exclure un concurrent est interdit en soi.</>,
              explain: (
                <>
                  Non — détenir une position dominante et même exclure de fait ne sont pas illégaux
                  en soi. Tout dépend du comportement : si la production du leader est
                  économiquement justifiée, l'exclusion peut n'être qu'un effet secondaire licite
                  (cas 2 des slides).
                </>
              ),
            },
            {
              text: <>Non, jamais : chaque firme produit ce qu'elle veut.</>,
              explain: (
                <>
                  Trop rapide : si le leader <em>surproduit expressément</em> pour rendre l'entrée
                  non rentable (limit pricing), l'article 102 TFUE / IV.2 CDE peut être invoqué —
                  c'est le cas 1 des slides.
                </>
              ),
            },
            {
              text: (
                <>
                  Ça dépend : sans doute oui s'il surproduit expressément pour exclure ;
                  probablement non si sa production est économiquement justifiable et que
                  l'exclusion n'est qu'un effet secondaire.
                </>
              ),
              correct: true,
              explain: (
                <>
                  C'est mot pour mot la réponse de la slide 62. La frontière passe par l'
                  <em>intention</em> et la justification économique du niveau de production — d'où
                  l'importance de l'analyse économique dans ces dossiers.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.6)">
          <ul>
            <li>
              Le mécanisme : coûts fixes ⇒ le follower n'entre que si son profit les couvre ⇒ la
              vraie fonction de réaction comporte une zone de <strong>non-entrée</strong> (
              <M tex="y_2 = 0" />) au-delà d'une production limite du leader.
            </li>
            <li>
              Les <strong>trois cas</strong> : surproduction délibérée pour exclure (limit pricing,
              abus probable) ; exclusion naturelle par <M tex="y_1^S" /> (pas un abus) ;
              accommodation quand exclure coûte trop cher.
            </li>
            <li>
              La liste des <strong>techniques de barrière à l'entrée</strong> (surcapacités,
              exclusivités, publicité, contrats longs, produit par défaut, coûts de changement,
              ventes liées) et les exemples Plavix, Subutex, GEG/Poweo, aérien, Netflix/Amazon.
            </li>
            <li>
              La démarche des autorités : (1) position dominante ? (2) abus ? — et le rôle des
              économistes.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3.7 — Accroître le nombre de firmes                         */}
      {/* ============================================================ */}
      <Section
        id="nombre-firmes"
        kicker="§ 3.7"
        title="Accroître le nombre de firmes est-il toujours désirable ?"
      >
        <p className="text-[1.1rem] italic text-muted-foreground">
          Réflexe naturel : plus de concurrents = plus de concurrence = mieux pour la société. Cette
          section montre que c'est <em>presque</em> vrai… et que le « presque » se chiffre.
        </p>

        <p>
          Dans cette section, nous allons voir qu'augmenter le nombre de firmes en concurrence à la
          Cournot permet <strong>d'augmenter les quantités totales</strong> mises en vente,{" "}
          <strong>de diminuer le prix</strong>,{" "}
          <strong>d'augmenter le surplus des consommateurs</strong>… et{" "}
          <strong>de diminuer le profit des firmes</strong>. Cependant, l'effet net sur le bien-être
          est <strong>ambigu</strong>, à cause des coûts fixes de création de nouvelles firmes.
        </p>

        <Callout variant="exemple" title="🧪 Le modèle (volontairement épuré)">
          <ul>
            <li>
              Demande inverse : <M tex="p = 12 - y_T" />, où <M tex="y_T" /> est la quantité vendue
              par l'ensemble des <M tex="n" /> firmes.
            </li>
            <li>Coût marginal nul.</li>
            <li>
              Coût fixe <M tex="F" /> par firme.
            </li>
          </ul>
        </Callout>

        <H4>Résolution — le Cournot à n firmes, pas à pas</H4>
        <p>Le profit de la firme 1 :</p>
        <MB tex="\pi_1 = p\,y_1 - F = (12 - y_1 - y_2 - \dots - y_n)\,y_1 - F" />
        <p>Sa condition de premier ordre :</p>
        <MB tex="\frac{d\pi_1}{dy_1} = 0 \;\iff\; 12 - 2y_1 - y_2 - y_3 - \dots - y_n = 0" />
        <p>
          On peut procéder de la même façon avec toutes les autres firmes (le « 2 » se déplace sur
          la quantité de la firme qui optimise). Comme toutes les firmes sont identiques, à
          l'équilibre <M tex="y_1 = y_2 = \dots = y_n = y_i" /> :
        </p>
        <MB tex="12 - (n+1)\,y_i = 0 \;\iff\; y_i = \frac{12}{n+1} \;\Rightarrow\; y_T = 12\,\frac{n}{n+1} \;\Rightarrow\; p = \frac{12}{n+1}" />
        <Steps
          items={[
            <>
              <strong>Production individuelle</strong> <M tex="y_i = \tfrac{12}{n+1}" /> :{" "}
              <em>diminue</em> avec le nombre de firmes (chacun se serre).
            </>,
            <>
              <strong>Production totale</strong> <M tex="y_T = \tfrac{12n}{n+1}" /> :{" "}
              <em>augmente</em> avec <M tex="n" /> (vérifie : <M tex="\tfrac{dy_T}{dn} > 0" />) — et
              le <strong>prix</strong> <M tex="p = \tfrac{12}{n+1}" /> <em>diminue</em>. Repères :
              monopole (n = 1) → p = 6 ; duopole → p = 4 ; n → ∞ → p → 0 = coût marginal (la
              concurrence parfaite en limite !).
            </>,
            <>
              <strong>Profits</strong> : <M tex="\pi_i = \left(\tfrac{12}{n+1}\right)^2 - F" />{" "}
              diminue avec <M tex="n" />, et le profit total{" "}
              <M tex="\pi_T = n\left(\tfrac{12}{n+1}\right)^2 - nF" /> aussi.
            </>,
            <>
              <strong>Surplus des consommateurs</strong> (le triangle sous la demande au-dessus du
              prix) : <M tex="SC = \tfrac{1}{2}(12 - p)\,y_T = 72\left(\tfrac{n}{n+1}\right)^2" /> —
              il <em>croît</em> avec le nombre de firmes.
            </>,
          ]}
        />

        <H4>Le verdict : le surplus total</H4>
        <FormulaBox
          tex="ST = SC + \pi_T = 72\left(\frac{n}{n+1}\right)^{\!2} + n\left(\frac{12}{n+1}\right)^{\!2} - nF = \frac{72\,n(n+2)}{(n+1)^2} - nF"
          label="Surplus total avec n firmes"
          caption={
            <>
              L'évolution de <M tex="ST" /> est <strong>ambiguë</strong> à cause des coûts fixes :
              il n'est pas garanti qu'un nombre plus élevé de firmes maximise le surplus total. Plus{" "}
              <M tex="F" /> est élevé, plus le nombre de firmes optimal est faible — on évite de
              trop gaspiller dans la multiplication des coûts fixes.
            </>
          }
        />

        <NFirmsTable />

        <NFirmsExplorer />

        <Callout variant="intuition" title="💡 L'arbitrage en une phrase">
          <p>
            Chaque firme supplémentaire apporte un <strong>gain de concurrence</strong> (prix plus
            bas, plus de quantités, plus de surplus consommateurs) qui va en s'amenuisant… mais
            coûte un <strong>coût fixe entier de plus</strong> (une usine, un réseau, une
            infrastructure dupliquée). Passé un certain point, le gain marginal de concurrence ne
            couvre plus le coût fixe dupliqué : le bien-être total <em>baisse</em>. Voilà pourquoi
            personne ne réclame 50 réseaux d'eau potable parallèles dans la même ville.
          </p>
        </Callout>

        <Quiz
          scope="ei2"
          id="q8"
          question={
            <>
              Dans le modèle (<M tex="p = 12 - y_T" />, Cm nul, coût fixe F = 2 par firme), d'après
              le tableau : que vaut le surplus total avec 2 firmes et avec 3 firmes, et que faut-il
              en conclure ?
            </>
          }
          options={[
            {
              text: (
                <>
                  60 puis 61,5 : passer de 2 à 3 firmes augmente encore le surplus total — mais on
                  devine qu'ajouter une 4ᵉ firme le ferait baisser.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : <M tex="64 - 2 \times 2 = 60" /> et <M tex="67{,}5 - 3 \times 2 = 61{,}5" />
                  . Et avec 4 firmes : <M tex="69{,}12 - 8 = 61{,}12" /> — ça baisse déjà. L'optimum
                  est à 3 firmes pour F = 2 (contre 4 firmes pour F = 1) : plus les coûts fixes sont
                  lourds, moins il faut de firmes.
                </>
              ),
            },
            {
              text: (
                <>62 puis 64,5 : le surplus total augmente toujours avec le nombre de firmes.</>
              ),
              explain: (
                <>
                  Ce sont les valeurs pour F = 1 (64 − 2 et 67,5 − 3)… et même pour F = 1 le surplus
                  finit par baisser (optimum à 4 firmes). Avec F = 2, il faut retrancher 2F et 3F.
                </>
              ),
            },
            {
              text: (
                <>
                  Le surplus total est forcément maximal en concurrence parfaite (n très grand),
                  comme toujours en économie.
                </>
              ),
              explain: (
                <>
                  C'est exactement le réflexe que cette section corrige : avec des coûts fixes,{" "}
                  <M tex="ST = \tfrac{72n(n+2)}{(n+1)^2} - nF" /> tend vers{" "}
                  <M tex="72 - nF \to -\infty" /> quand n explose. La duplication des coûts fixes
                  ruine le gain de concurrence.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3.7)">
          <ul>
            <li>
              Dériver l'équilibre de Cournot symétrique à <M tex="n" /> firmes :{" "}
              <strong>
                <M tex="y_i = \tfrac{12}{n+1}" />, <M tex="p = \tfrac{12}{n+1}" />
              </strong>{" "}
              (et retrouver monopole/duopole comme cas particuliers).
            </li>
            <li>
              Le sens de variation de chaque grandeur quand <M tex="n" /> augmente : yT ↑, p ↓, SC
              ↑, πi ↓, πT ↓.
            </li>
            <li>
              Le résultat contre-intuitif :{" "}
              <strong>
                le surplus total <M tex="\tfrac{72n(n+2)}{(n+1)^2} - nF" /> n'est pas croissant en n
              </strong>{" "}
              — les coûts fixes dupliqués rendent l'effet net ambigu.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4.1 — Bertrand, bien homogène                               */}
      {/* ============================================================ */}
      <Section id="bertrand" kicker="§ 4.1" title="La concurrence à la Bertrand (bien homogène)">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Changement d'arme : les firmes choisissent maintenant leur <strong>prix</strong>, et la
          concurrence fixe les quantités. Le résultat est l'un des plus spectaculaires de toute
          l'économie industrielle.
        </p>

        <H4>Les règles du jeu</H4>
        <p>
          Chaque firme choisit le prix qui maximise son profit en considérant le prix de son
          concurrent comme donné, et en anticipant que (bien homogène oblige — les consommateurs
          vont simplement chez le moins cher) :
        </p>
        <ul>
          <li>
            si <M tex="p_1 > p_2" />, alors <M tex="y_1 = 0" /> : la firme 2 fournit tout le marché
            (et inversement) ;
          </li>
          <li>
            si <M tex="p_1 = p_2" />, les deux firmes se partagent équitablement le marché.
          </li>
        </ul>
        <p>
          Les jeux dans lesquels les firmes choisissent leurs prix sont des{" "}
          <strong>jeux de Bertrand</strong>. Hypothèse supplémentaire : chaque firme a un{" "}
          <strong>
            coût marginal constant <M tex="c" />
          </strong>
          , et toutes choisissent leur prix simultanément.
        </p>

        <H4>Quel est l'équilibre de Nash ? Le raisonnement en trois verrous</H4>
        <p>
          Réponse : celui auquel toutes les firmes choisissent un prix{" "}
          <strong>égal au coût marginal</strong> <M tex="c" />. Pourquoi ? Trois observations
          éliminent tout le reste :
        </p>
        <Steps
          items={[
            <>
              <strong>
                Aucune firme ne veut fixer un prix inférieur à son coût marginal <M tex="c" />
              </strong>{" "}
              : à défaut, elle vendrait à perte sur chaque unité.
            </>,
            <>
              <strong>
                Aucune firme ne veut fixer un prix supérieur à celui de son concurrent
              </strong>{" "}
              : à défaut, elle ne vendrait rien (bien homogène : tous les clients partent chez le
              moins cher).
            </>,
            <>
              <strong>
                Chaque firme voudrait baisser son prix d'un tout petit montant si ce prix était égal
                à celui de son concurrent et supérieur à <M tex="c" />
              </strong>{" "}
              : elle s'accaparerait ainsi <em>tout</em> le marché (au lieu de la moitié), avec un
              prix encore supérieur à <M tex="c" />, en ne sacrifiant presque rien de ses recettes.
              Doubler ses ventes pour un centime de rabais : imbattable.
            </>,
          ]}
        />
        <FormulaBox
          tex="p_1^* = p_2^* = c"
          label="L'équilibre de Bertrand-Nash (bien homogène, coûts identiques)"
          caption={
            <>
              Le seul prix qui répond à tous ces critères est un prix égal à <M tex="c" />. C'est la
              seule situation où chaque firme choisit le prix qui maximise son profit étant donné le
              prix fixé par son concurrent — donc le seul équilibre de Bertrand-Nash de ce jeu.
              Profits : <strong>nuls</strong>.
            </>
          }
        />

        <Callout variant="attention" title="⚠️ Le « paradoxe de Bertrand »">
          <p>
            Relis bien : il suffit de <strong>deux</strong> firmes pour obtenir le résultat de la
            concurrence parfaite — prix au coût marginal, profits nuls, pouvoir de marché
            entièrement volatilisé. Comparé à Cournot (où deux firmes gardaient prix élevés et beaux
            profits : p = 39 dans notre exemple !), c'est un grand écart saisissant — on parle du{" "}
            <em>paradoxe de Bertrand</em>. Même jeu de duopole, même demande, seule l'arme change
            (prix au lieu de quantités)… et la conclusion s'inverse. D'où l'importance, en pratique,
            de savoir quel modèle décrit le mieux le marché étudié (voir la synthèse).
          </p>
        </Callout>

        <H4>Et si une firme est plus efficace que l'autre ?</H4>
        <p>
          Quid si la firme 1 a un coût marginal <M tex="c_1" /> plus petit que <M tex="c_2" /> ? La
          firme 2 baisse son prix jusqu'à son coût marginal <M tex="c_2" /> — en dessous, elle
          refuse de suivre. Mais la firme 1 baisse alors le sien{" "}
          <strong>
            légèrement sous <M tex="c_2" />
          </strong>{" "}
          pour capter tout le marché. Résultat : la firme 2 ne produit rien, et la firme 1 obtient
          un <strong>profit positif</strong>, égal à la différence entre son prix (quasi égal à{" "}
          <M tex="c_2" />) et son coût marginal <M tex="c_1" />, multipliée par la production.
          L'avantage de coût devient l'unique source de marge.
        </p>

        <BertrandUndercutSim />

        <Quiz
          scope="ei2"
          id="q9"
          question={
            <>
              Deux stations-service vendent exactement le même carburant (coût marginal 1,50
              €/litre, identique), affichent leurs prix simultanément et peuvent servir tout le
              marché. Que prédit l'équilibre de Bertrand-Nash ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Un prix de 1,50 €/litre pour les deux, et zéro profit — comme s'il y avait une
                  infinité de concurrents.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : c'est le paradoxe de Bertrand. Tout prix commun au-dessus de 1,50 €
                  déclenche une sous-enchère (baisser d'un centime double les ventes), et vendre
                  sous 1,50 € est à perte. Seul <M tex="p = c" /> est un équilibre.
                </>
              ),
            },
            {
              text: (
                <>
                  Un prix légèrement au-dessus de 1,50 €, car il faut bien que chacune couvre ses
                  coûts et garde une petite marge.
                </>
              ),
              explain: (
                <>
                  Séduisant, mais instable : à 1,51 € chacune, l'une des deux passe à 1,50 € et
                  rafle tout le marché avec encore une (micro) marge. La logique de sous-enchère ne
                  s'arrête qu'à <M tex="p = c" />.
                </>
              ),
            },
            {
              text: (
                <>
                  Le prix de monopole, partagé : à deux, elles se comportent comme un cartel
                  naturel.
                </>
              ),
              explain: (
                <>
                  Ce serait la collusion (section suivante !) — mais ce n'est pas un équilibre de
                  Nash du jeu joué une fois : au prix de monopole, chacune gagne à sous-coter d'un
                  centime pour doubler ses ventes.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 4.1)">
          <ul>
            <li>
              Les règles de partage de la demande (<M tex="p_1 > p_2 \Rightarrow y_1 = 0" /> ;
              égalité ⇒ partage 50/50).
            </li>
            <li>
              Le raisonnement en <strong>3 étapes</strong> qui établit que{" "}
              <strong>
                <M tex="p_1 = p_2 = c" />
              </strong>{" "}
              est l'unique équilibre de Bertrand-Nash — à savoir restituer intégralement.
            </li>
            <li>
              Le cas <M tex="c_1 < c_2" /> : la firme efficace vend juste sous <M tex="c_2" />, sert
              tout le marché, profit ≈ <M tex="(c_2 - c_1)\times" /> production.
            </li>
            <li>
              Le contraste Cournot / Bertrand : mêmes firmes, arme différente, résultats
              radicalement différents.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4.2 — La collusion en prix                                  */}
      {/* ============================================================ */}
      <Section id="collusion-p" kicker="§ 4.2" title="La collusion en prix">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Des profits nuls pour l'éternité ? Les firmes de Bertrand ont une motivation{" "}
          <em>maximale</em> pour s'entendre. Cette section montre quand l'entente peut tenir toute
          seule — sans contrat, sans réunion secrète, sans même se parler.
        </p>

        <H4>La collusion explicite : évidente… et doublement fragile</H4>
        <p>
          La collusion explicite entre plusieurs firmes ayant le même coût marginal est évidente à
          analyser : <strong>sans</strong> collusion, ces firmes ont un profit nul (Bertrand) ;{" "}
          <strong>avec</strong> collusion, elles peuvent ensemble répliquer le{" "}
          <strong>profit de monopole</strong> <M tex="\pi_m" /> et se le partager. Elles ont donc
          tout intérêt à s'entendre… sauf que :
        </p>
        <ul>
          <li>c'est légalement interdit (article 101 TFUE, section 3.4) ;</li>
          <li>
            une fois l'entente conclue, chaque firme a intérêt à violer l'accord en baissant{" "}
            <em>très légèrement</em> son prix pour capter tout le marché — le réflexe de
            sous-enchère de Bertrand ne disparaît pas par magie.
          </li>
        </ul>

        <H4>La collusion tacite : quand le futur discipline le présent</H4>
        <p>
          Une autre forme de collusion est la <strong>collusion tacite</strong> — assez simple à
          analyser dans le cas de Bertrand (plus simple qu'en Cournot, où les expressions deviennent
          lourdes). L'idée : les firmes ne se limitent pas au profit de la période en cours, elles
          envisagent leur situation sur <strong>toutes les périodes à venir</strong>. On considère
          donc un <strong>jeu répété à horizon infini</strong>, avec <M tex="n" /> firmes. Tu
          reconnais le cadre des jeux répétés du cours de stratégie — c'est rigoureusement la même
          mécanique :
        </p>
        <div className="flex flex-wrap gap-1.5">
          <TheoryRef
            chapter="b3"
            course="strategies"
            section="sec-grim"
            label="Stratégies · Grim trigger et condition de coopération (B3)"
          />
        </div>

        <Callout variant="definition" title="📖 Définition — la « trigger strategy »">
          <p>Chaque firme sélectionne la stratégie suivante :</p>
          <ul>
            <li>
              fixer un prix égal au <strong>prix du monopole</strong> si les autres firmes ont
              appliqué le prix de monopole aux périodes précédentes ;
            </li>
            <li>
              fixer un prix égal au <strong>coût marginal</strong> sinon (punition : retour à
              Bertrand, profits nuls, pour toujours).
            </li>
          </ul>
          <p>
            Si toutes les firmes adoptent cette stratégie, elles finissent par appliquer tout le
            temps soit le prix de monopole (collusion tacite), soit un prix égal au coût marginal
            (concurrence à la Bertrand).
          </p>
        </Callout>

        <H4>Le calcul : rester ou dévier ?</H4>
        <p>
          Pourquoi une firme choisirait-elle de ne pas pratiquer le prix de monopole ? Parce qu'à
          court terme, en baissant très légèrement son prix, elle capterait <strong>tout</strong> le
          marché et n'aurait pas à partager le profit de monopole… en revanche elle aurait un profit{" "}
          <strong>nul pour toutes les périodes restantes</strong>, car toutes les firmes
          basculeraient au coût marginal. Comparons les deux profits actualisés, avec <M tex="r" />{" "}
          le taux d'intérêt :
        </p>
        <MB tex="\pi_i^{Mono} = \frac{1}{n}\pi_m + \frac{1}{1+r}\cdot\frac{1}{n}\pi_m + \left(\frac{1}{1+r}\right)^{\!2}\frac{1}{n}\pi_m + \left(\frac{1}{1+r}\right)^{\!3}\frac{1}{n}\pi_m + \dots = \frac{1}{n}\pi_m\left(1 + \frac{1}{r}\right)" />
        <Callout
          variant="methode"
          title="🛠️ D'où sort le (1 + 1/r) ? L'astuce « décaler-soustraire »"
        >
          <p>
            Il faut sommer{" "}
            <M tex="S = \tfrac{1}{1+r} + \left(\tfrac{1}{1+r}\right)^2 + \left(\tfrac{1}{1+r}\right)^3 + \dots" />{" "}
            Remarque que <M tex="S = \tfrac{1}{1+r}\,(1 + S)" /> (chaque terme est le précédent
            multiplié par <M tex="\tfrac{1}{1+r}" />
            ). Donc <M tex="S(1+r) = 1 + S" />, soit <M tex="S\,r = 1" />, soit{" "}
            <strong>
              <M tex="S = \tfrac{1}{r}" />
            </strong>
            . Le profit total vaut alors{" "}
            <M tex="\tfrac{1}{n}\pi_m (1 + S) = \tfrac{1}{n}\pi_m\left(1 + \tfrac{1}{r}\right)" />.
            (C'est la somme géométrique du cours de stratégie, écrite avec{" "}
            <M tex="\delta = \tfrac{1}{1+r}" /> : patience et taux d'intérêt sont les deux faces de
            la même pièce.)
          </p>
        </Callout>
        <p>
          Et la déviation ? La firme qui sous-cote encaisse (quasiment) tout le profit de monopole
          une fois, puis plus rien :
        </p>
        <MB tex="\pi_i^{D\acute{e}vie} = \pi_m + \frac{1}{1+r}\cdot 0 + \left(\frac{1}{1+r}\right)^{\!2}\cdot 0 + \dots = \pi_m" />
        <p>
          Une firme (et donc toutes) préfère maintenir le prix de monopole si et seulement si{" "}
          <M tex="\pi_i^{Mono} > \pi_i^{D\acute{e}vie}" /> :
        </p>
        <FormulaBox
          tex="\frac{1}{n}\pi_m\left(1 + \frac{1}{r}\right) > \pi_m \;\iff\; n < 1 + \frac{1}{r} \;\iff\; r < \frac{1}{n-1}"
          label="La condition de soutenabilité de la collusion tacite"
          caption={
            <>
              La collusion tacite est donc plus facilement soutenable si{" "}
              <strong>le nombre de firmes impliquées n'est pas trop élevé</strong> (chaque part du
              gâteau reste grosse) et si{" "}
              <strong>
                les firmes ne dévalorisent pas trop le futur (<M tex="r" /> faible)
              </strong>
              . Exemple : à <M tex="r = 10\,\%" />, la collusion tient jusqu'à 10 firmes ; à{" "}
              <M tex="r = 50\,\%" />, à peine 3.
            </>
          }
        />

        <TacitCollusionExplorer />

        <H4>Trois remarques finales des slides (très « vie réelle »)</H4>
        <CardGrid
          items={[
            {
              title: "D'autres stratégies, même résultat",
              body: (
                <>
                  La trigger strategy n'est pas la seule : d'autres stratégies (punitions plus
                  courtes, par exemple) peuvent aussi soutenir la collusion tacite. Elle est
                  simplement la plus simple à analyser.
                </>
              ),
            },
            {
              title: "🤖 Les algorithmes collusifs",
              body: (
                <>
                  Il a été montré que des{" "}
                  <strong>algorithmes de fixation de prix par intelligence artificielle</strong>{" "}
                  pouvaient amener des firmes en duopole à de la collusion tacite…{" "}
                  <em>sans intervention humaine</em> (Calvano, Calzolari, Denicolò &amp; Pastorello,{" "}
                  <em>American Economic Review</em>, 2020). Un casse-tête pour les autorités : qui
                  sanctionner quand personne ne s'est entendu ?
                </>
              ),
            },
            {
              title: "« On vous rembourse la différence » — vraiment pro-consommateur ?",
              body: (
                <>
                  Les clauses du type « on vous rembourse la différence si vous trouvez moins cher
                  ailleurs » rendent les cartels <strong>plus stables</strong> : elles permettent de{" "}
                  <em>repérer plus vite les déviations</em> (les clients font la police des prix
                  gratuitement), réduisant la durée pendant laquelle dévier est profitable. De même,
                  « on vous rembourse si nos prix baissent après votre achat » réduit l'incitant à
                  baisser son prix (il faudrait rembourser tous les clients passés). Des clauses à
                  l'air aimable… qui verrouillent la collusion.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="ei2"
          id="q10"
          question={
            <>
              Cinq firmes identiques (même coût marginal) pratiquent une collusion tacite à la
              trigger strategy. Pour quels taux d'intérêt <M tex="r" /> tient-elle ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <M tex="r < 25\,\%" />, car la condition est{" "}
                  <M tex="r < \tfrac{1}{n-1} = \tfrac{1}{4}" />.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact : <M tex="n < 1 + \tfrac{1}{r} \iff r < \tfrac{1}{n-1}" />. Avec n = 5 : r
                  doit rester sous 1/4. Un cinquième du profit de monopole pour toujours doit battre
                  tout le profit une seule fois — il faut que le futur pèse assez lourd.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="r < 20\,\%" />, car la condition est <M tex="r < \tfrac{1}{n}" />.
                </>
              ),
              explain: (
                <>
                  Presque — mais la condition exacte est <M tex="r < \tfrac{1}{n-1}" /> (le « −1 »
                  vient du <M tex="1 + \tfrac{1}{r}" /> : la première période n'est pas escomptée).
                  Refais le calcul depuis <M tex="\tfrac{1}{n}\pi_m(1 + \tfrac{1}{r}) > \pi_m" />.
                </>
              ),
            },
            {
              text: (
                <>
                  Pour n'importe quel <M tex="r" /> : à cinq, le gâteau du monopole est toujours
                  plus intéressant que la guerre des prix.
                </>
              ),
              explain: (
                <>
                  Non : si <M tex="r" /> est élevé, le futur ne vaut presque rien — et « tout le
                  gâteau aujourd'hui, rien demain » bat « un cinquième du gâteau pour toujours ». La
                  patience est la clé de voûte de toute collusion tacite.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 4.2)">
          <ul>
            <li>
              Collusion explicite sous Bertrand : profits nuls sans entente, profit de monopole
              partagé avec — mais interdite <em>et</em> minée par la sous-enchère.
            </li>
            <li>
              La <strong>trigger strategy</strong> (prix de monopole tant que tout le monde l'a
              respecté, coût marginal sinon) et le calcul complet :{" "}
              <strong>
                <M tex="\pi_i^{Mono} = \tfrac{1}{n}\pi_m(1 + \tfrac{1}{r})" />
              </strong>{" "}
              contre{" "}
              <strong>
                <M tex="\pi_i^{D\acute{e}vie} = \pi_m" />
              </strong>
              , d'où{" "}
              <strong>
                <M tex="n < 1 + \tfrac{1}{r}" />
              </strong>
              .
            </li>
            <li>
              L'interprétation : peu de firmes + taux d'intérêt faible ⇒ collusion tacite soutenable
              — et difficile à sanctionner (pas d'entente à prouver).
            </li>
            <li>
              Les remarques : algorithmes de prix collusifs (Calvano et al. 2020), clauses de
              remboursement de la différence qui stabilisent les cartels.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4.3 — Biens différenciés                                    */}
      {/* ============================================================ */}
      <Section
        id="differencies"
        kicker="§ 4.3"
        title="Des biens différenciés et concurrence à la Bertrand"
      >
        <p className="text-[1.1rem] italic text-muted-foreground">
          Le paradoxe de Bertrand repose sur une hypothèse énorme : des biens rigoureusement
          identiques. Or dans la vraie vie, un iPhone n'est pas un Samsung et ton café de quartier
          n'est pas la chaîne d'en face. Que devient la concurrence en prix quand chaque firme a «
          son » produit ?
        </p>

        <p>
          Souvent, les firmes produisent des biens <strong>légèrement différents</strong> : le
          style, la performance, le lieu de vente… peuvent différer. Dans ce cas, une firme peut
          fixer un prix supérieur à celui de ses concurrents (et à son coût marginal) sans que la
          demande qui lui est adressée tombe à zéro :{" "}
          <strong>certains consommateurs veulent consommer ce bien même s'il est plus cher</strong>.
        </p>

        <Callout variant="exemple" title="🧪 Le modèle des slides">
          <p>Deux firmes, coût marginal nul. Les demandes adressées aux firmes 1 et 2 sont :</p>
          <MB tex="q_1 = 12 - p_1 - h\,(p_1 - p_2) \qquad q_2 = 12 - p_2 - h\,(p_2 - p_1) \qquad \text{(si positives)}" />
          <p>
            où <M tex="h" /> est un <strong>paramètre de non-différenciation (homogénéité)</strong>{" "}
            : ma demande baisse quand mon prix monte (le <M tex="-p_1" /> classique), mais aussi
            quand mon prix <em>dépasse celui du rival</em> (le terme <M tex="-h(p_1 - p_2)" /> : des
            clients me quittent pour lui).
          </p>
          <ul>
            <li>
              <strong>
                <M tex="h" /> très élevé
              </strong>{" "}
              : les biens sont peu différents — la demande de chaque firme est très sensible à la
              différence de prix. Le cas des biens homogènes déjà étudié correspond à{" "}
              <M tex="h \to \infty" /> : la moindre différence de prix change complètement la
              demande.
            </li>
            <li>
              <strong>
                <M tex="h = 0" />
              </strong>{" "}
              : biens totalement différenciés — une firme n'est pas affectée par le comportement de
              l'autre. Chaque firme dispose d'un pouvoir de monopole sur sa clientèle.
            </li>
          </ul>
        </Callout>

        <H4>Résolution — les fonctions de réaction en prix</H4>
        <p>Les profits (coût marginal nul : profit = recette) :</p>
        <MB tex="\Pi_1 = \big(12 - p_1 - h(p_1 - p_2)\big)\,p_1 \qquad \Pi_2 = \big(12 - p_2 - h(p_2 - p_1)\big)\,p_2" />
        <p>
          La firme 1 choisit <M tex="p_1" /> pour maximiser <M tex="\Pi_1" /> en considérant{" "}
          <M tex="p_2" /> comme donné. On dérive (développe d'abord :{" "}
          <M tex="12p_1 - p_1^2 - h p_1^2 + h p_1 p_2" />) et on annule :
        </p>
        <MB tex="\frac{d\Pi_1}{dp_1} = 12 - 2p_1 - h(2p_1 - p_2) = 0 \;\;\Rightarrow\;\; p_1 = \frac{12 + h\,p_2}{2(1+h)}" />
        <p>
          Et symétriquement pour la firme 2 : <M tex="p_2 = \frac{12 + h\,p_1}{2(1+h)}" />. Remarque
          capitale : ces fonctions de réaction sont <strong>croissantes</strong> en <M tex="p_2" />{" "}
          (pente <M tex="\tfrac{h}{2(1+h)} > 0" /> dès que <M tex="h > 0" />) — si mon concurrent
          monte son prix, ma meilleure réponse est de monter le mien. Tout l'inverse de Cournot, où
          les meilleures réponses étaient décroissantes !
        </p>

        <H4>L'équilibre</H4>
        <p>
          La solution de ce système de deux équations à deux inconnues (par symétrie,{" "}
          <M tex="p_1 = p_2 = p" /> : on résout <M tex="p\,(2+2h) = 12 + hp" />) est :
        </p>
        <FormulaBox
          tex="p_1^* = p_2^* = \frac{12}{2 + h}"
          label="Équilibre de Bertrand-Nash avec biens différenciés"
          caption={
            <>
              Au plus les biens sont homogènes (<M tex="h" /> très élevé), au plus le prix tend vers{" "}
              <strong>zéro, le coût marginal</strong> — on retrouve le paradoxe de Bertrand en
              limite. Si les biens sont totalement différenciés (<M tex="h = 0" />
              ), les prix sont égaux à <strong>6</strong> (et les quantités aussi), ce qui est
              précisément la situation du <strong>monopole</strong>.
            </>
          }
        />

        <Callout variant="retiens" title="⭐ La leçon stratégique">
          <p>
            Les firmes ont donc intérêt à <strong>différencier au maximum leurs produits</strong>.
            La différenciation est un rempart contre la guerre des prix : elle fidélise une
            clientèle qui ne s'enfuit pas au premier centime d'écart, et permet à chacun de
            conserver une marge au-dessus du coût marginal. Design, image de marque, localisation,
            services annexes… : ce sont autant de moyens de <em>faire baisser h</em>.
          </p>
        </Callout>

        <DiffBertrandExplorer />

        <Quiz
          scope="ei2"
          id="q11"
          question={
            <>
              Dans le modèle <M tex="q_1 = 12 - p_1 - h(p_1 - p_2)" /> (Cm nul), que se passe-t-il
              quand la différenciation entre les deux produits <strong>diminue</strong> (h augmente)
              ?
            </>
          }
          options={[
            {
              text: (
                <>
                  Le prix d'équilibre <M tex="\tfrac{12}{2+h}" /> baisse et tend vers le coût
                  marginal : on se rapproche du paradoxe de Bertrand.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui. Plus les biens se ressemblent, plus les clients basculent au moindre écart de
                  prix, plus la sous-enchère mord. À la limite <M tex="h \to \infty" /> : biens
                  homogènes, <M tex="p \to 0 = Cm" />, profits nuls.
                </>
              ),
            },
            {
              text: (
                <>
                  Le prix d'équilibre monte : des biens plus semblables sont plus faciles à vendre
                  cher.
                </>
              ),
              explain: (
                <>
                  C'est l'inverse : la ressemblance <em>intensifie</em> la concurrence en prix.
                  C'est la différenciation (h faible) qui protège les marges — d'où l'intérêt des
                  firmes à différencier au maximum.
                </>
              ),
            },
            {
              text: (
                <>
                  Rien : le prix d'équilibre ne dépend que des coûts, pas du degré de
                  différenciation.
                </>
              ),
              explain: (
                <>
                  Faux : <M tex="p^* = \tfrac{12}{2+h}" /> dépend explicitement de h — de 6
                  (monopoles indépendants, h = 0) à 0 (Bertrand homogène, h → ∞), pour des coûts
                  identiques (nuls) dans tous les cas.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 4.3)">
          <ul>
            <li>
              Les demandes croisées <M tex="q_1 = 12 - p_1 - h(p_1 - p_2)" /> et l'interprétation du
              paramètre <M tex="h" /> (h = 0 : monopoles indépendants ; h → ∞ : biens homogènes).
            </li>
            <li>
              Dériver les fonctions de réaction{" "}
              <strong>
                <M tex="p_1 = \tfrac{12 + h p_2}{2(1+h)}" />
              </strong>{" "}
              et noter qu'elles sont <strong>croissantes</strong> (contraste avec Cournot).
            </li>
            <li>
              L'équilibre{" "}
              <strong>
                <M tex="p^* = \tfrac{12}{2+h}" />
              </strong>{" "}
              et ses deux limites (6 et 0) ; la conclusion : intérêt à{" "}
              <strong>différencier au maximum</strong>.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* Synthèse                                                      */}
      {/* ============================================================ */}
      <Section id="synthese" kicker="🎯 Synthèse" title="À maîtriser absolument">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Le chapitre le plus riche du cours tient en un tableau, une boussole méthodologique, trois
          exercices type examen et une checklist. Objectif : tout vert.
        </p>

        <H4>Le tableau récapitulatif (fil rouge : p = 60 − yT)</H4>
        <RegimeTable />
        <p>
          Lecture verticale : des quantités totales, du cartel à Bertrand, on a{" "}
          <M tex="17{,}5 < 21 < 21{,}7 < y_T^{Bertrand}" /> — et les prix dans l'ordre inverse.{" "}
          <strong>Plus la concurrence est intense, plus on produit et moins c'est cher</strong> :
          collusion &gt; Cournot &gt; Stackelberg &gt; Bertrand, du point de vue des prix. Les
          consommateurs classent ces régimes exactement à l'envers des firmes.
        </p>

        <Callout variant="methode" title="🧭 Slide 100 — quel modèle pour quel marché ?">
          <p>
            Les conclusions dépendent fortement des hypothèses : Bertrand ou Cournot ? Décisions
            simultanées ou séquentielles (Stackelberg) ? Biens homogènes ou différenciés ?{" "}
            <strong>Chaque marché doit être étudié en fonction de ses caractéristiques</strong> — ce
            sont elles qui déterminent le modèle approprié :
          </p>
          <ul>
            <li>
              S'il est <strong>aisé d'ajuster les quantités</strong>, Bertrand est indiqué : la
              firme peut répondre à toute variation de demande causée par un changement de prix. Les
              achats dématérialisés en ligne sont dans cette veine.
            </li>
            <li>
              S'il n'est <strong>pas aisé de varier la production</strong> (capacités rigides),
              Cournot est indiqué. L'industrie lourde va plutôt dans ce sens.
            </li>
          </ul>
        </Callout>

        <Quiz
          scope="ei2"
          id="q12"
          kicker="QCM final"
          question={
            <>
              Sur un même marché en duopole (bien homogène), classe les prix du plus élevé au plus
              bas selon le régime de concurrence :
            </>
          }
          options={[
            {
              text: <>Collusion &gt; Cournot &gt; Stackelberg &gt; Bertrand (= Cm).</>,
              correct: true,
              explain: (
                <>
                  Dans notre fil rouge : 42,5 &gt; 39 &gt; 38,3 &gt; coût marginal. La collusion
                  restreint le plus les quantités ; Stackelberg produit plus que Cournot (le leader
                  surproduit) ; Bertrand écrase tout au coût marginal.
                </>
              ),
            },
            {
              text: <>Cournot &gt; Collusion &gt; Bertrand &gt; Stackelberg.</>,
              explain: (
                <>
                  Non : la collusion donne le prix le plus haut (comportement de monopole), et
                  Stackelberg donne un prix <em>plus bas</em> que Cournot (production totale 21,7
                  contre 21).
                </>
              ),
            },
            {
              text: <>Bertrand &gt; Cournot &gt; Stackelberg &gt; Collusion.</>,
              explain: (
                <>
                  C'est l'ordre exactement inverse ! Bertrand (bien homogène) donne le prix le plus{" "}
                  <em>bas</em> : p = Cm dès deux firmes — le paradoxe de Bertrand.
                </>
              ),
            },
          ]}
        />

        <H4>Exercices récapitulatifs (type examen)</H4>

        <ExerciseBlock
          scope="ei2"
          id="ex1"
          number={1}
          title="L'équilibre de Cournot-Nash de A à Z"
          difficulty={2}
          refs={[
            { chapter: "ei2", section: "cournot", label: "La concurrence à la Cournot" },
            { chapter: "ei2", section: "exemple-cournot", label: "L'exemple du cours" },
          ]}
          statement={
            <p>
              La demande de marché est <M tex="p(y_T) = 60 - y_T" /> avec{" "}
              <M tex="y_T = y_1 + y_2" />. Les coûts totaux sont <M tex="c_1(y_1) = y_1^2" /> et{" "}
              <M tex="c_2(y_2) = 15y_2 + y_2^2" />. Les firmes choisissent leurs quantités
              simultanément. <strong>a)</strong> Détermine les fonctions de meilleure réponse.{" "}
              <strong>b)</strong> Calcule l'équilibre de Cournot-Nash. <strong>c)</strong> Calcule
              le prix et les profits d'équilibre.
            </p>
          }
          steps={[
            {
              title: "a) Profit et condition de premier ordre de la firme 1",
              content: (
                <p>
                  <M tex="\Pi_1 = (60 - y_1 - y_2)y_1 - y_1^2" />. On dérive par rapport à{" "}
                  <M tex="y_1" /> (attention : <M tex="y_2" /> est un paramètre) :{" "}
                  <M tex="60 - 2y_1 - y_2 - 2y_1 = 0" />, d'où{" "}
                  <M tex="\boxed{R_1(y_2) = 15 - \tfrac{1}{4}y_2}" />.
                </p>
              ),
            },
            {
              title: "a) Même travail pour la firme 2",
              content: (
                <p>
                  <M tex="\Pi_2 = (60 - y_1 - y_2)y_2 - 15y_2 - y_2^2" />. CPO :{" "}
                  <M tex="60 - y_1 - 2y_2 - 15 - 2y_2 = 0" />, d'où{" "}
                  <M tex="\boxed{R_2(y_1) = \tfrac{45 - y_1}{4}}" />. Les deux fonctions sont
                  décroissantes : les quantités sont des substituts stratégiques.
                </p>
              ),
            },
            {
              title: "b) Résoudre le système",
              content: (
                <p>
                  Substitution :{" "}
                  <M tex="y_1 = 15 - \tfrac{1}{4}\cdot\tfrac{45 - y_1}{4} = 15 - \tfrac{45}{16} + \tfrac{y_1}{16}" />
                  , donc <M tex="\tfrac{15}{16}y_1 = \tfrac{195}{16}" />, soit{" "}
                  <M tex="y_1^* = 13" /> puis <M tex="y_2^* = \tfrac{45 - 13}{4} = 8" />.{" "}
                  <M tex="\boxed{(y_1^*, y_2^*) = (13, 8)}" /> Vérifie toujours :{" "}
                  <M tex="R_1(8) = 13" /> ✓, <M tex="R_2(13) = 8" /> ✓.
                </p>
              ),
            },
            {
              title: "c) Prix et profits",
              content: (
                <p>
                  <M tex="y_T = 21" /> donc <M tex="p = 60 - 21 = 39" />. Profits :{" "}
                  <M tex="\Pi_1 = 39 \times 13 - 169 = 338" /> et{" "}
                  <M tex="\Pi_2 = 39 \times 8 - (120 + 64) = 128" />. La firme au coût le plus bas
                  produit plus et gagne plus.
                </p>
              ),
            },
          ]}
          result={
            <p>
              <M tex="(y_1^*, y_2^*) = (13, 8)" />, <M tex="p^* = 39" />,{" "}
              <M tex="(\Pi_1, \Pi_2) = (338, 128)" />. La méthode en 4 réflexes : profit → CPO →
              fonctions de réaction → système. Elle marche pour <em>tous</em> les exercices de
              Cournot.
            </p>
          }
        />

        <ExerciseBlock
          scope="ei2"
          id="ex2"
          number={2}
          title="Stackelberg : l'avantage du premier joueur"
          difficulty={2}
          refs={[{ chapter: "ei2", section: "stackelberg", label: "L'équilibre de Stackelberg" }]}
          statement={
            <p>
              Mêmes données que l'exercice 1, mais la firme 1 choisit sa production{" "}
              <em>en premier</em>, la firme 2 observe puis choisit la sienne. <strong>a)</strong>{" "}
              Écris la fonction de profit du leader. <strong>b)</strong> Calcule l'équilibre de
              Stackelberg. <strong>c)</strong> Compare avec Cournot : productions, production
              totale, prix.
            </p>
          }
          steps={[
            {
              title: "a) Le leader internalise la réaction du follower",
              content: (
                <p>
                  Backward induction : le follower jouera <M tex="R_2(y_1) = \tfrac{45-y_1}{4}" />
                  . Le leader remplace donc <M tex="y_2" /> par cette réaction :{" "}
                  <M tex="\Pi_1^s(y_1) = \big(60 - y_1 - \tfrac{45 - y_1}{4}\big)y_1 - y_1^2 = \tfrac{195}{4}y_1 - \tfrac{7}{4}y_1^2" />
                  . (Développe soigneusement : <M tex="60 - \tfrac{45}{4} = \tfrac{195}{4}" /> et{" "}
                  <M tex="-1 + \tfrac{1}{4} - 1 = -\tfrac{7}{4}" />
                  .)
                </p>
              ),
            },
            {
              title: "b) Maximiser, puis faire réagir le follower",
              content: (
                <p>
                  CPO :{" "}
                  <M tex="\tfrac{195}{4} - \tfrac{7}{2}y_1 = 0 \Rightarrow y_1^s = \tfrac{195}{14} \approx 13{,}9" />
                  . Puis <M tex="y_2^s = R_2(13{,}9) = \tfrac{45 - 13{,}9}{4} \approx 7{,}8" />.
                </p>
              ),
            },
            {
              title: "c) Comparaison avec Cournot",
              content: (
                <p>
                  Cournot : (13 ; 8). Stackelberg : (13,9 ; 7,8) — le leader produit{" "}
                  <strong>plus</strong>, le follower <strong>moins</strong> (toujours vrai). La
                  production totale passe de 21 à 21,7 : le prix baisse (38,3 contre 39). Profit du
                  leader ≈ 339,5 ≥ 338 : jouer en premier rapporte — à condition de pouvoir
                  s'engager de façon crédible (sinon, retour à Cournot).
                </p>
              ),
            },
          ]}
          result={
            <p>
              <M tex="(y_1^s, y_2^s) \approx (13{,}9\,;\, 7{,}8)" />. Réflexe d'examen : pour
              Stackelberg, on n'égalise <em>jamais</em> deux fonctions de réaction — on{" "}
              <strong>injecte</strong> celle du follower dans le profit du leader, puis on maximise.
            </p>
          }
        />

        <ExerciseBlock
          scope="ei2"
          id="ex3"
          number={3}
          title="Collusion tacite : jusqu'à combien de firmes ?"
          difficulty={3}
          refs={[
            { chapter: "ei2", section: "collusion-p", label: "La collusion en prix" },
            {
              chapter: "b3",
              course: "strategies",
              section: "sec-grim",
              label: "Stratégies · La logique grim (B3)",
            },
          ]}
          statement={
            <p>
              <M tex="n" /> firmes identiques (coût marginal constant) se font une concurrence à la
              Bertrand à chaque période, indéfiniment. Toutes suivent la trigger strategy : prix de
              monopole tant que tout le monde l'a pratiqué, coût marginal sinon. Le profit de
              monopole du marché vaut <M tex="\pi_m" /> et le taux d'intérêt est <M tex="r" />.{" "}
              <strong>a)</strong> Calcule le profit actualisé d'une firme qui respecte la collusion.{" "}
              <strong>b)</strong> Celui d'une firme qui dévie aujourd'hui. <strong>c)</strong> Donne
              la condition de soutenabilité. <strong>d)</strong> Application : combien de firmes au
              maximum si <M tex="r = 10\,\%" /> ? Et quel taux maximal si <M tex="n = 5" /> ?
            </p>
          }
          steps={[
            {
              title: "a) Respecter : sa part du gâteau, pour toujours",
              content: (
                <p>
                  Chaque période, la firme touche <M tex="\tfrac{1}{n}\pi_m" /> :{" "}
                  <M tex="\pi_i^{Mono} = \tfrac{1}{n}\pi_m\big(1 + \tfrac{1}{1+r} + (\tfrac{1}{1+r})^2 + \dots\big)" />
                  . La somme <M tex="S = \tfrac{1}{1+r} + (\tfrac{1}{1+r})^2 + \dots" /> vérifie{" "}
                  <M tex="S = \tfrac{1}{1+r}(1+S)" /> d'où <M tex="S = \tfrac{1}{r}" />. Donc{" "}
                  <M tex="\pi_i^{Mono} = \tfrac{1}{n}\pi_m\big(1 + \tfrac{1}{r}\big)" />.
                </p>
              ),
            },
            {
              title: "b) Dévier : tout le gâteau, une seule fois",
              content: (
                <p>
                  En sous-cotant d'un cheveu, la firme capte (quasi) tout le marché :{" "}
                  <M tex="\pi_m" /> aujourd'hui. Dès demain, toutes les firmes punissent au coût
                  marginal : profit nul pour toujours.{" "}
                  <M tex="\pi_i^{D\acute{e}vie} = \pi_m + 0 + 0 + \dots = \pi_m" />.
                </p>
              ),
            },
            {
              title: "c) La condition",
              content: (
                <p>
                  <M tex="\tfrac{1}{n}\pi_m(1 + \tfrac{1}{r}) > \pi_m" /> : les <M tex="\pi_m" /> se
                  simplifient, il reste <M tex="1 + \tfrac{1}{r} > n" />, c'est-à-dire{" "}
                  <M tex="\boxed{n < 1 + \tfrac{1}{r} \iff r < \tfrac{1}{n-1}}" />. Peu de firmes et
                  un futur qui compte : les deux piliers de toute collusion.
                </p>
              ),
            },
            {
              title: "d) Applications numériques",
              content: (
                <p>
                  <M tex="r = 0{,}1" /> : <M tex="n < 1 + 10 = 11" /> → jusqu'à{" "}
                  <strong>10 firmes</strong>. <M tex="n = 5" /> :{" "}
                  <M tex="r < \tfrac{1}{4} = 25\,\%" />. Note la lecture « antitrust » : sur un
                  marché stable (r effectif faible) et concentré, la collusion tacite est très
                  plausible — sans le moindre e-mail à saisir en perquisition.
                </p>
              ),
            },
          ]}
          result={
            <p>
              <M tex="n < 1 + \tfrac{1}{r}" />. La démarche est identique à la condition{" "}
              <M tex="\delta \ge 1/2" /> des jeux répétés : (gain de la fidélité pour toujours)
              contre (gain de la trahison une fois) — seule la notation change (
              <M tex="\delta = \tfrac{1}{1+r}" />
              ).
            </p>
          }
        />

        <H4>Checklist de maîtrise — coche honnêtement !</H4>
        <MasteryChecklist
          items={[
            <>
              Je sais définir monopole / duopole / oligopole et expliquer pourquoi l'oligopole
              relève de la théorie des jeux.
            </>,
            <>
              Je connais les deux variables stratégiques possibles (quantités, prix) et comment
              l'autre variable s'ajuste dans chaque cas.
            </>,
            <>
              Je sais écrire <M tex="\Pi_1 = p(y_1+y_2)y_1 - c_1(y_1)" />, dériver la CPO et
              expliquer ses trois termes.
            </>,
            <>
              Je sais définir la fonction de meilleure réponse et expliquer pourquoi elle est
              décroissante en Cournot.
            </>,
            <>
              Je sais refaire l'exemple complet : <M tex="R_1(y_2) = 15 - \tfrac{1}{4}y_2" />,{" "}
              <M tex="R_2(y_1) = \tfrac{45-y_1}{4}" />, équilibre (13, 8), p = 39, profits (338 ;
              128).
            </>,
            <>
              Je sais dessiner les iso-profits des deux firmes, dire pourquoi « plus bas = profit
              plus élevé » et pourquoi la meilleure réponse passe par les sommets.
            </>,
            <>
              Je sais montrer la lentille où les deux firmes battent Cournot, et démontrer
              l'instabilité du cartel (<M tex="R_2(y_1^m) > y_2^m" />, dilemme du prisonnier, OPEP).
            </>,
            <>
              Je connais le volet légal : article 101 TFUE, ABC, clémence, collusion explicite vs
              tacite.
            </>,
            <>
              Je sais résoudre Stackelberg par backward induction (
              <M tex="\Pi_1^s = \tfrac{195}{4}y_1 - \tfrac{7}{4}y_1^2" /> → (13,9 ; 7,8)) et
              comparer avec Cournot.
            </>,
            <>
              Je peux expliquer le problème d'engagement du leader (ex post il voudrait dévier) et
              les remèdes (investissements, surcapacités).
            </>,
            <>
              Je sais raconter les trois cas de l'entrée (accommodation / exclusion délibérée =
              limit pricing / exclusion naturelle) et la frontière de l'abus de position dominante —
              avec les exemples Plavix, GEG, aérien, Netflix.
            </>,
            <>
              Je sais dériver <M tex="y_i = \tfrac{12}{n+1}" /> à n firmes et expliquer pourquoi le
              surplus total <M tex="\tfrac{72n(n+2)}{(n+1)^2} - nF" /> n'augmente pas toujours avec
              n.
            </>,
            <>
              Je sais démontrer en 3 étapes le paradoxe de Bertrand (<M tex="p = c" />, profits nuls
              à deux firmes) et le cas <M tex="c_1 < c_2" />.
            </>,
            <>
              Je sais dériver la condition de collusion tacite <M tex="n < 1 + \tfrac{1}{r}" />{" "}
              (trigger strategy, somme géométrique <M tex="S = 1/r" />
              ).
            </>,
            <>
              Je sais résoudre le duopole différencié : réactions croissantes,{" "}
              <M tex="p^* = \tfrac{12}{2+h}" />, limites h = 0 (monopole) et h → ∞ (Bertrand).
            </>,
            <>
              Je sais choisir le bon modèle selon le marché (slide 100) : Bertrand si les quantités
              s'ajustent facilement (en ligne), Cournot si la production est rigide (industrie
              lourde).
            </>,
          ]}
        />

        <Callout variant="retiens" title="🧭 Et après ?">
          <p>
            Tu disposes maintenant de la boîte à outils complète de la concurrence imparfaite :
            Cournot, Stackelberg, Bertrand, collusion — et leurs implications de politique de la
            concurrence (cartels, abus de position dominante). La suite du cours (EI3) retourne du
            côté du monopole pour étudier des stratégies de prix plus fines — discrimination,
            tarification en deux parties, double marge — avant les économies de réseau (EI4). Le fil
            rouge reste le même :{" "}
            <em>qui a du pouvoir de marché, d'où vient-il, et que peut-il en faire ?</em>
          </p>
        </Callout>

        <div className="mt-8 rounded-xl border bg-muted/40 px-4 py-3 text-[13.5px] leading-relaxed text-muted-foreground">
          <strong>Notes de rigueur.</strong> (1) Les slides donnent les quantités d'équilibre ; les
          prix et profits chiffrés (39, 338, 128, ≈ 339,5, ≈ 120,7) ainsi que le point de cartel
          (12,5 ; 5) et le profit joint 487,5 sont calculés à partir des fonctions de l'exemple du
          cours — vérifie-les en exercice. (2) Dans cet exemple aux coûts asymétriques, le point qui
          maximise le profit <em>joint</em> donne à la firme 2 un profit propre (112,5) inférieur à
          son profit de Cournot (128) : c'est pourquoi le cours précise que le cartel maximise le
          profit total <em>puis le partage</em> entre les firmes. (3) La matrice « respecter /
          dévier » de la section 3.4 et le π<sub>m</sub> = 36 de la section 4.2 utilisent le marché
          symétrique de la section 3.7 (p = 12 − y<sub>T</sub>, Cm nul) pour chiffrer des
          raisonnements que les slides présentent de façon générique ; de même, la demande D(p) = 60
          − p du simulateur de Bertrand est purement illustrative. (4) Le « sentier de convergence »
          du premier graphique et le seuil chiffré de production limite (
          <M tex="\hat{y}_1 = 45 - \sqrt{8F}" />) sont des illustrations pédagogiques construites
          sur l'exemple du cours ; les slides définissent l'équilibre comme point fixe et présentent
          l'exclusion de l'entrant de façon purement graphique.
        </div>
      </Section>
    </ChapterShell>
  );
}
