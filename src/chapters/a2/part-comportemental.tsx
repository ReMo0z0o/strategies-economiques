/*
 * Chapitre A2 — PartComportemental (sections affichées dans la page du chapitre).
 * § 5 problèmes de self-contrôle · § 6 commitment devices · § 7 politiques
 * (deck S3, slides 20-42).
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { CardGrid, CommitCase, GoodClassifier, MiniCard, PollCard } from "./widgets";
import { H3, Lead, Tbl, TH, TD } from "./ui";
import { DiscountWeights } from "./anim/DiscountWeights";
import { PreferenceReversal } from "./anim/PreferenceReversal";
import { CommitmentSimulator } from "./anim/CommitmentSimulator";

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

function H4({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-7 text-[17px] font-bold tracking-tight">{children}</h4>;
}

/** Une étape d'une dérivation : un titre (le « quoi ») puis l'explication et le calcul. */
function Step({ n, title, children }: { n: ReactNode; title: ReactNode; children: ReactNode }) {
  return (
    <div className="my-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12.5px] font-bold text-primary-foreground">
          {n}
        </span>
        <div className="font-semibold leading-snug">{title}</div>
      </div>
      <div className="mt-1.5 space-y-2 text-[15.5px] leading-relaxed">{children}</div>
    </div>
  );
}

const fr = (v: number) => String(v).replace(".", ",");

/** Slide 22 : les deux observations de Laibson et al. (2009), en % du revenu annuel. */
function LaibsonBars() {
  const max = 240;
  const rows = [
    {
      label: "Dette sur carte de crédit",
      value: 12,
      note: "≈ 12 % du revenu annuel",
      color: "bg-rose-500",
    },
    {
      label: "Actifs illiquides, vers 50 ans",
      value: 216,
      note: "≈ 216 % du revenu annuel",
      color: "bg-emerald-600",
    },
  ];
  return (
    <figure className="my-3 rounded-xl border bg-card p-3.5 sm:p-4">
      <div className="relative">
        {/* repères verticaux : 100 % = une année de revenu */}
        {[100, 200].map((g) => (
          <div
            key={g}
            aria-hidden
            className="absolute bottom-5 top-0 border-l border-dashed border-muted-foreground/40"
            style={{ left: `${(g / max) * 100}%` }}
          />
        ))}
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[13.5px]">
                <span className="relative bg-card pr-1 font-semibold text-foreground">{r.label}</span>
                <span className="relative bg-card pl-1 tabular-nums text-muted-foreground">
                  {r.note}
                </span>
              </div>
              <div className="mt-1 h-4 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${r.color}`}
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-1 h-5 text-[11.5px] tabular-nums text-muted-foreground">
          <span className="absolute left-0">0</span>
          {[100, 200].map((g) => (
            <span
              key={g}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${(g / max) * 100}%` }}
            >
              {g} %
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
        En % du revenu annuel (100 % = une année entière de revenu). Source : slide 22, Laibson
        et al. (2009) — valeurs approximatives données sur le slide.
      </figcaption>
    </figure>
  );
}

/** Slides 41-42 : les deux chiffres clés des politiques, qui ne mesurent PAS la même chose. */
function AvantApres() {
  const panels = [
    {
      title: "Option par défaut",
      what: "Part des employés qui épargnent pour leur retraite",
      src: "Madrian et Shea (2001)",
      before: 50,
      after: 86,
      max: 100,
      scale: "échelle de 0 à 100 %",
      afterLabel: "Après (défaut à 3 %)",
      beforeLabel: "Avant (défaut à 0 %)",
    },
    {
      title: "SmarTplan",
      what: "Taux d'épargne (part du salaire épargnée)",
      src: "Thaler et Benartzi (2004)",
      before: 3.5,
      after: 13.6,
      max: 15,
      scale: "échelle de 0 à 15 %",
      afterLabel: "Après à peine 4 ans",
      beforeLabel: "Au départ",
    },
  ];
  return (
    <figure className="my-6 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {panels.map((p) => (
          <div key={p.title}>
            <div className="text-[13.5px] font-bold text-primary">{p.title}</div>
            <div className="text-[14px] font-medium leading-snug">{p.what}</div>
            <div className="mt-2.5 space-y-2">
              {[
                { label: p.beforeLabel, v: p.before, color: "bg-muted-foreground/45" },
                { label: p.afterLabel, v: p.after, color: "bg-emerald-600" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between gap-2 text-[12.5px] text-muted-foreground">
                    <span>{b.label}</span>
                    <span className="font-bold tabular-nums text-foreground">{fr(b.v)} %</span>
                  </div>
                  <div className="mt-0.5 h-3.5 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${b.color}`}
                      style={{ width: `${(b.v / p.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1.5 text-[12px] text-muted-foreground">
              {p.src} · {p.scale}
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-[12.5px] leading-snug text-muted-foreground">
        Chiffres des slides 41 et 42. Les deux panneaux ne mesurent pas la même chose (une part
        d'employés à gauche, une part du salaire à droite) et n'ont pas la même échelle.
      </figcaption>
    </figure>
  );
}

export function PartComportemental() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 5 · SELF-CONTRÔLE (slides 20-29)                           */}
      {/* ============================================================ */}
      <Section id="selfcontrole" kicker="§ 5" title="Les problèmes de self-contrôle">
        <Lead>
          Le modèle rationnel des § 2 à § 4 suppose qu'on suit à la lettre le plan qu'on s'est fixé.
          Dans la vraie vie, on dit « j'épargnerai plus demain »… et le lendemain, on repousse
          encore. On va mettre le modèle rationnel en défaut avec une expérience toute simple — à
          laquelle tu vas participer — puis construire le modèle qui l'explique : le modèle (β, δ).
        </Lead>

        <H3>Une expérience de pensée : à toi de jouer</H3>
        <p>
          Réponds <em>honnêtement</em> aux deux questions avant de révéler les vrais résultats. Ne
          réfléchis pas trop : choisis par instinct.
        </p>

        <PollCard
          tag="Version A · tout de suite"
          question={<>Tu préfères…</>}
          options={[
            { key: "A1", label: <>recevoir 100 € <strong>maintenant</strong></>, pct: 18 },
            {
              key: "A2",
              label: <>recevoir 110 € <strong>dans une semaine</strong></>,
              pct: 82,
              alt: true,
            },
          ]}
          note={
            <>
              Chez les étudiants interrogés : <strong>18 %</strong> choisissent A1 (l'argent tout
              de suite). L'attrait du « maintenant » fait craquer presque un étudiant sur cinq,
              alors qu'attendre 7 jours rapporte 10 % de plus.
            </>
          }
        />

        <PollCard
          tag="Version B · dans un an"
          question={<>Et maintenant, tu préfères…</>}
          options={[
            { key: "B1", label: <>recevoir 100 € <strong>dans un an</strong></>, pct: 3 },
            {
              key: "B2",
              label: <>recevoir 110 € <strong>dans un an et une semaine</strong></>,
              pct: 97,
              alt: true,
            },
          ]}
          note={
            <>
              Cette fois, seulement <strong>3 %</strong> choisissent B1 ! C'est{" "}
              <em>exactement la même attente d'une semaine</em> pour les mêmes 10 % de bonus… mais
              comme tout est repoussé loin dans le futur, presque tout le monde sait patienter.
            </>
          }
        />

        <Callout variant="attention" title="L'incohérence : le double choix A1 + B2">
          <p>
            18 % des étudiants prennent A1, mais seulement 3 % prennent B1.{" "}
            <strong>Si ce sont les mêmes étudiants</strong> qui ont répondu aux deux versions, alors
            au moins 18 − 3 = <strong>15 %</strong> d'entre eux ont fait le double choix{" "}
            <strong>A1 + B2</strong> : impatients quand la récompense est immédiate, patients quand
            tout est repoussé d'un an.
          </p>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            Pourquoi « au moins » ? Parmi les 18 % qui ont pris A1, au plus 3 % ont pu prendre B1
            (seuls 3 % l'ont choisi au total). Les autres — au moins 15 % — ont donc pris B2. Le
            slide ne dit pas que ce sont les mêmes étudiants : d'où le « si ».
          </p>
          <p className="mt-2">
            Or, dit le slide 21, <strong>il n'est pas rationnel de préférer A1 et en même temps
            B2</strong> : ce double choix viole l'hypothèse de <strong>stationnarité</strong> (§ 3).
            La version B, c'est la version A décalée d'un an : même attente d'une semaine, même
            bonus de 10 €. Un individu stationnaire fait donc le même choix dans les deux versions
            (A1 et B1, ou bien A2 et B2).
          </p>
        </Callout>

        <p>
          Le tableau du slide 21 le rend limpide. Chaque ligne donne ta consommation à chaque date :{" "}
          <M tex="c" /> est ta consommation habituelle, et la récompense s'y ajoute à une seule
          date.
        </p>
        <Tbl minW={340}>
          <thead>
            <tr>
              <th className={TH}></th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=0" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=1" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=2" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=3" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={`${TD} font-bold`}>A1</td>
              <td className={TD}>
                <M tex="c+100" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-bold`}>A2</td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c+110" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-bold`}>B1</td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c+100" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
            </tr>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={`${TD} font-bold`}>B2</td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c" />
              </td>
              <td className={TD}>
                <M tex="c+110" />
              </td>
            </tr>
          </tbody>
        </Tbl>
        <p className="text-[15px] text-muted-foreground">
          Les dates du tableau sont stylisées : <M tex="t=0" /> = maintenant, <M tex="t=1" /> =
          dans une semaine, <M tex="t=2" /> = dans un an, <M tex="t=3" /> = dans un an et une
          semaine. Ce qui compte : entre B1 et B2, il y a le même écart d'une période qu'entre A1 et
          A2. Les lignes surlignées (A1 et B2) forment le double choix incohérent.
        </p>
        <p>
          Ce n'est pas propre à cette expérience. Le slide 21 résume :{" "}
          <em>
            dans la pratique, la préférence entre deux « récompenses » futures peut s'inverser en
            faveur de la plus proche quand le délai jusqu'aux récompenses diminue.
          </em>{" "}
          Ce type d'inversion a été documenté aussi bien chez les humains (Green et al., 1994) que
          chez les pigeons (Ainslie et al., 1981).
        </p>
        <Callout variant="definition" title="Problème de self-contrôle">
          Un individu a un <strong>problème de self-contrôle</strong> si,{" "}
          <strong>au moment de passer à l'action</strong>, il éprouve des difficultés à mettre en
          œuvre le programme optimal de consommation qu'il avait prévu de suivre. Exemple : le
          dimanche, tu prévois de réviser une heure chaque soir ; le lundi soir venu, tu remets à
          demain.
        </Callout>

        <H3>Patient pour plus tard, impatient pour tout de suite</H3>
        <p>
          Le slide 22 résume ce que montre l'expérience :{" "}
          <strong>
            typiquement, les humains ont moins de patience quand ils considèrent le futur immédiat
            que lorsqu'ils considèrent le futur lointain.
          </strong>{" "}
          Pense aux résolutions suivantes :
        </p>
        <ul className="my-3 list-disc space-y-1 pl-6">
          <li>« Je me mettrai au régime dès demain. »</li>
          <li>« J'épargnerai plus demain. »</li>
          <li>« Demain, j'arrête de fumer et de boire de l'alcool. »</li>
        </ul>
        <p>
          Vu d'aujourd'hui, l'effort tombe dans le futur : on est patient, on le planifie sans peine.
          Mais le lendemain, l'effort devient « maintenant »… et on le repousse encore.
        </p>
        <Callout variant="exemple" title="Le mystère de Laibson et al. (2009)">
          <p>
            Deux observations faites aux USA. Les Américains empruntent beaucoup sur leur carte de
            crédit. Et, en même temps, ils accumulent beaucoup d'<strong>actifs illiquides</strong>{" "}
            (des placements qu'on ne peut pas récupérer facilement avant une certaine date — une
            maison, une épargne-pension bloquée jusqu'à la retraite…).
          </p>
          <LaibsonBars />
          <p>
            Pourquoi est-ce un mystère ? Le taux d'intérêt d'une carte de crédit est{" "}
            <strong>bien plus élevé</strong> que ce que rapportent ces placements. Un individu
            rationnel rembourserait d'abord sa dette la plus chère (la carte de crédit) au lieu de
            bloquer autant d'argent : il économiserait des intérêts. Le slide le dit ainsi : le
            modèle rationnel{" "}
            <em>
              a des difficultés à expliquer ces observations, étant donné le bien plus grand taux
              d'intérêt s'appliquant sur les cartes de crédit
            </em>
            .
          </p>
          <p className="mt-2">
            Garde ce mystère en tête : le modèle (β, δ) va le résoudre au § 6.
          </p>
        </Callout>

        <H3>Le modèle (β, δ) de O'Donoghue &amp; Rabin (2001)</H3>
        <p>
          Comment traduire « moins patient pour le futur immédiat » en formule ? O'Donoghue et Rabin
          (2001) gardent l'utilité escomptée du § 3 et ajoutent{" "}
          <strong>un seul nouveau paramètre</strong>, <M tex="\beta" /> (« bêta »). L'idée : tout ce
          qui n'est pas « maintenant » reçoit un rabot supplémentaire <M tex="\beta" />, en plus de
          l'escompte habituel <M tex="\delta" />.
        </p>
        <FormulaBox
          tex="\begin{aligned} U_0^{\beta}(c) &= u(c_0) + \beta \sum_{t=1}^{T} \delta^t\, u(c_t) \\ &= u(c_0) + \beta\delta\,u(c_1) + \beta\delta^2 u(c_2) + \cdots + \beta\delta^T u(c_T) \end{aligned}"
          label="Utilité (β, δ) — slide 23"
          caption={
            <>
              <M tex="U_0^{\beta}" /> se lit « utilité du programme <M tex="c" />, vue depuis{" "}
              <M tex="t=0" />, avec un biais <M tex="\beta" /> ». <M tex="\beta \in [0,1]" />{" "}
              capture le biais de self-contrôle. Le présent (<M tex="c_0" />) n'a{" "}
              <strong>pas</strong> de <M tex="\beta" /> ; toutes les dates futures, si.
            </>
          }
        />
        <p>
          Lis la formule comme une liste de <strong>poids</strong> : le poids devant{" "}
          <M tex="u(c_t)" /> dit combien la consommation de la date <M tex="t" /> compte, vue
          d'aujourd'hui. Exemple avec <M tex="\beta = 0{,}5" /> et <M tex="\delta = 0{,}9" />{" "}
          (chiffres illustratifs) :
        </p>
        <Tbl minW={380}>
          <thead>
            <tr>
              <th className={TH}>Date</th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=0" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=1" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=2" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=3" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${TD} font-semibold`}>
                Rationnel : <M tex="\delta^t" />
              </td>
              <td className={TD}>1</td>
              <td className={TD}>0,9</td>
              <td className={TD}>0,81</td>
              <td className={TD}>0,729</td>
            </tr>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={`${TD} font-semibold`}>
                (β, δ) : <M tex="\beta\delta^t" />
              </td>
              <td className={TD}>1</td>
              <td className={TD}>0,45</td>
              <td className={TD}>0,405</td>
              <td className={TD}>0,3645</td>
            </tr>
          </tbody>
        </Tbl>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Entre « maintenant » et « demain », le poids <strong>chute brutalement</strong> : de 1 à{" "}
            <M tex="\beta\delta = 0{,}45" /> (au lieu de 0,9 pour le rationnel).
          </li>
          <li>
            Ensuite, d'une date future à la suivante, le rapport des poids est{" "}
            <M tex="\delta" />, <strong>exactement comme chez le rationnel</strong> :{" "}
            <M tex="0{,}405 / 0{,}45 = 0{,}9" />. Le biais ne touche que le passage « maintenant →
            plus tard ».
          </li>
        </ul>

        <DiscountWeights />

        <CardGrid>
          <MiniCard title={<>Le rôle de β</>}>
            Plus <M tex="\beta" /> est <strong>petit</strong>, plus le biais est{" "}
            <strong>fort</strong> : l'individu sur-valorise brutalement le présent par rapport à{" "}
            <em>tout</em> le futur.
          </MiniCard>
          <MiniCard title={<>Cas spécial β = 1</>} tone="gold">
            Le <M tex="\beta" /> disparaît et on{" "}
            <strong>retombe pile sur le modèle rationnel</strong> d'utilité escomptée (§ 3) :{" "}
            <M tex="U_0(c) = u(c_0) + \delta u(c_1) + \delta^2 u(c_2) + \cdots" />. Le modèle (β, δ){" "}
            <em>contient</em> donc le modèle rationnel.
          </MiniCard>
        </CardGrid>

        <H3>Pourquoi le modèle (β, δ) explique l'expérience</H3>
        <p>
          Reprenons les quatre options du tableau et calculons l'utilité de chacune, vue
          d'aujourd'hui (<M tex="t=0" />), avec la formule (β, δ). Le slide 24 donne directement les
          deux conditions finales ; voici d'où elles viennent, pas à pas.
        </p>

        <Step n={1} title="Version A : préférer A1 (100 € maintenant) à A2 (110 € dans une semaine)">
          <p>On écrit les deux utilités. Les dates 2 et 3 sont identiques des deux côtés : on les barre.</p>
          <MB tex="\begin{aligned} U_0^{\beta}(A1) &= u(c+100) + \beta\delta\,u(c) + \cancel{\beta\delta^2 u(c) + \beta\delta^3 u(c)} \\ U_0^{\beta}(A2) &= u(c) + \beta\delta\,u(c+110) + \cancel{\beta\delta^2 u(c) + \beta\delta^3 u(c)} \end{aligned}" />
          <p>
            Préférer A1, c'est <M tex="U_0^{\beta}(A1) > U_0^{\beta}(A2)" />. On passe les{" "}
            <M tex="u(c)" /> du même côté :
          </p>
          <MB tex="u(c+100) - u(c) \;>\; \beta\delta\,\big[u(c+110) - u(c)\big]" />
          <p>
            À gauche : ce que rapportent 100 € <strong>maintenant</strong> (poids 1, sans{" "}
            <M tex="\beta" />). À droite : ce que rapportent 110 € dans une semaine, raboté par{" "}
            <M tex="\beta\delta" />. Ici, <strong>le β reste</strong>, parce qu'une seule des deux
            récompenses est future.
          </p>
        </Step>

        <Step n={2} title="Version B : préférer B2 (110 € dans un an et une semaine) à B1 (100 € dans un an)">
          <p>Cette fois, ce sont les dates 0 et 1 qui sont identiques : on les barre.</p>
          <MB tex="\begin{aligned} U_0^{\beta}(B1) &= \cancel{u(c) + \beta\delta\,u(c)} + \beta\delta^2 u(c+100) + \beta\delta^3 u(c) \\ U_0^{\beta}(B2) &= \cancel{u(c) + \beta\delta\,u(c)} + \beta\delta^2 u(c) + \beta\delta^3 u(c+110) \end{aligned}" />
          <p>
            Préférer B2, c'est <M tex="U_0^{\beta}(B1) < U_0^{\beta}(B2)" />. On regroupe, puis on
            divise les deux côtés par <M tex="\beta\delta^2" /> (un nombre positif : le sens de
            l'inégalité ne change pas) :
          </p>
          <MB tex="\begin{aligned} \beta\delta^2\,\big[u(c+100) - u(c)\big] &< \beta\delta^3\,\big[u(c+110) - u(c)\big] \\ \iff\quad u(c+100) - u(c) &< \delta\,\big[u(c+110) - u(c)\big] \end{aligned}" />
          <p>
            <strong>Le β a disparu !</strong> Les deux récompenses sont futures : elles portent{" "}
            <em>toutes les deux</em> le rabot <M tex="\beta" />, qui se simplifie. Il ne reste que{" "}
            <M tex="\delta" />, l'écart d'une période entre les deux récompenses.
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            (Si « dans un an » valait 52 périodes d'une semaine, le facteur commun serait{" "}
            <M tex="\beta\delta^{52}" /> au lieu de <M tex="\beta\delta^2" /> : il se simplifierait
            de la même façon.)
          </p>
        </Step>

        <Step n={3} title="Les deux conditions ensemble">
          <p>
            Note <M tex="X = u(c+100) - u(c)" /> (le gain de 100 €) et{" "}
            <M tex="Y = u(c+110) - u(c)" /> (le gain de 110 €). Le double choix A1 + B2 demande :
          </p>
          <MB tex="\underbrace{\beta\delta\,Y < X}_{\text{A1 préféré à A2}} \qquad \text{et} \qquad \underbrace{X < \delta\,Y}_{\text{B2 préféré à B1}}" />
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              Si <M tex="\beta = 1" /> (modèle rationnel) : il faudrait <M tex="X > \delta Y" /> et{" "}
              <M tex="X < \delta Y" /> en même temps. Impossible : les deux conditions sont en
              conflit logique.
            </li>
            <li>
              Si <M tex="\beta < 1" /> : <M tex="\beta\delta Y" /> est plus petit que{" "}
              <M tex="\delta Y" />. Il y a de la place entre les deux, et <M tex="X" /> peut s'y
              glisser. Plus de conflit.
            </li>
          </ul>
          <p>
            Exemple (chiffres illustratifs) : <M tex="u" /> linéaire, donc <M tex="X = 100" /> et{" "}
            <M tex="Y = 110" /> ; <M tex="\delta = 0{,}99" /> par semaine ; <M tex="\beta = 0{,}8" />
            . Alors <M tex="\beta\delta Y = 0{,}8 \times 0{,}99 \times 110 \approx 87{,}1" /> et{" "}
            <M tex="\delta Y = 0{,}99 \times 110 = 108{,}9" />. On a bien{" "}
            <M tex="87{,}1 < 100 < 108{,}9" /> : A1 et B2 à la fois.
          </p>
        </Step>

        <Callout variant="retiens" title="Où agit le β ?">
          Le <M tex="\beta" /> ne frappe que le passage « maintenant → futur ». Quand on compare{" "}
          <strong>deux dates futures</strong>, il se simplifie : seul <M tex="\delta" /> compte,
          comme chez le rationnel. Quand l'une des dates est <strong>aujourd'hui</strong>, il reste
          et favorise le présent. D'où le renversement : de loin, on est patient (B2) ; de près, on
          craque (A1). Ces deux conditions ne sont pas en conflit dès que <M tex="\beta < 1" /> ;
          elles le sont si <M tex="\beta = 1" /> (slide 24).
        </Callout>

        <p>
          Vois-le en mouvement : fais défiler les semaines jusqu'à la première récompense. Tant
          qu'elles sont lointaines, on choisit 110 € ; le choix bascule au moment précis où les
          100 € deviennent « maintenant ».
        </p>
        <PreferenceReversal />

        <Quiz
          scope="a2"
          id="q4"
          question={<>Dans le modèle (β, δ), que se passe-t-il quand <M tex="\beta = 1" /> ?</>}
          options={[
            {
              text: <>L'individu devient parfaitement impatient : seul le présent compte.</>,
              explain: (
                <>
                  C'est l'inverse : l'impatience extrême correspond à <M tex="\beta" /> proche de{" "}
                  <strong>0</strong> (le futur ne pèse presque plus rien).
                </>
              ),
            },
            {
              text: <>On retombe exactement sur le modèle rationnel d'utilité escomptée (§ 3).</>,
              correct: true,
              explain: (
                <>
                  Oui : avec <M tex="\beta = 1" />, la formule redevient{" "}
                  <M tex="u(c_0) + \delta u(c_1) + \delta^2 u(c_2) + \cdots" /> — l'utilité
                  escomptée classique (slide 23). Le modèle (β, δ) <em>généralise</em> le modèle
                  rationnel, il ne le remplace pas.
                </>
              ),
            },
            {
              text: <>L'individu ne consomme plus rien en période 0.</>,
              explain: (
                <>Rien de tel : β ne pèse que sur les périodes futures, jamais sur la période 0.</>
              ),
            },
            {
              text: (
                <>
                  Le facteur <M tex="\delta" /> disparaît de la formule.
                </>
              ),
              explain: (
                <>
                  Non : <M tex="\delta" /> reste, c'est lui qui continue de décoter chaque période
                  future. Seul le rabot <em>supplémentaire</em> β devient neutre.
                </>
              ),
            },
          ]}
        />

        <H3>Deux types de biens : tentation vs investissement</H3>
        <p>
          Le modèle (β, δ) permet aussi de classer les biens selon l'effet du self-contrôle sur leur
          consommation. Le décor (slide 25) : trois périodes <M tex="t \in \{0, 1, 2\}" />. En{" "}
          <M tex="t=0" />, un individu décide s'il va consommer en <M tex="t=1" /> un bien dont
          l'effet se fait sentir pendant deux périodes : un bénéfice d'utilité <M tex="b_1" /> en{" "}
          <M tex="t=1" /> et un bénéfice d'utilité <M tex="b_2" /> en <M tex="t=2" /> (un bénéfice
          négatif est un coût).
        </p>
        <p>
          Notons <M tex="u_0" />, <M tex="u_1" />, <M tex="u_2" /> l'utilité que lui apporte le
          reste de sa consommation à chaque période. Consommer le bien ajoute <M tex="b_1" /> à la
          période 1 et <M tex="b_2" /> à la période 2 ; ne pas le consommer n'ajoute rien.
        </p>

        <H4>Ce qu'il veut en t = 0 : le critère « ex-ante »</H4>
        <p>
          <strong>Ex-ante</strong> veut dire « vu d'avant » : depuis <M tex="t=0" />, au moment de
          planifier. Avec la formule (β, δ) vue de <M tex="t=0" />, les périodes 1 et 2 sont toutes
          les deux futures :
        </p>
        <MB tex="\begin{aligned} U_0^{\beta}(\text{conso}) &= \cancel{u_0} + \beta\delta\,(\cancel{u_1} + b_1) + \beta\delta^2\,(\cancel{u_2} + b_2) \\ U_0^{\beta}(\text{pas conso}) &= \cancel{u_0} + \beta\delta\,\cancel{u_1} + \beta\delta^2\,\cancel{u_2} \end{aligned}" />
        <p>
          Il programme la consommation si <M tex="U_0^{\beta}(\text{conso}) > U_0^{\beta}(\text{pas conso})" />
          . Les termes <M tex="u_0" />, <M tex="\beta\delta u_1" /> et <M tex="\beta\delta^2 u_2" />{" "}
          sont des deux côtés : ils s'annulent. Il reste une inégalité qu'on divise par{" "}
          <M tex="\beta\delta" /> (positif) :
        </p>
        <MB tex="\beta\delta\,b_1 + \beta\delta^2\,b_2 > 0 \iff b_1 + \delta\,b_2 > 0" />
        <p>
          Vu de <M tex="t=0" />, <M tex="b_1" /> et <M tex="b_2" /> sont tous les deux futurs : ils
          portent tous les deux <M tex="\beta" />, qui se simplifie — exactement comme pour B1 et
          B2.
        </p>

        <H4>Ce qu'il fait une fois arrivé en t = 1</H4>
        <p>
          En <M tex="t=1" />, la période 1 est devenue « maintenant » : elle n'a plus de{" "}
          <M tex="\beta" />. Seule la période 2 est future :
        </p>
        <MB tex="\begin{aligned} U_1^{\beta}(\text{conso}) &= (\cancel{u_1} + b_1) + \beta\delta\,(\cancel{u_2} + b_2) \\ U_1^{\beta}(\text{pas conso}) &= \cancel{u_1} + \beta\delta\,\cancel{u_2} \end{aligned}" />
        <MB tex="U_1^{\beta}(\text{conso}) > U_1^{\beta}(\text{pas conso}) \iff b_1 + \beta\delta\,b_2 > 0" />
        <p>
          Cette fois <M tex="\beta" /> ne se simplifie pas : <M tex="b_1" /> est « maintenant »,
          seul <M tex="b_2" /> est raboté.
        </p>

        <CardGrid>
          <MiniCard title={<>Ex-ante (t = 0) : il veut le consommer si…</>}>
            <MB tex="b_1 + \delta b_2 > 0" className="my-1 text-center" />
          </MiniCard>
          <MiniCard title={<>Une fois en t = 1 : il le consomme vraiment si…</>}>
            <MB tex="b_1 + \beta\delta b_2 > 0" className="my-1 text-center" />
          </MiniCard>
        </CardGrid>
        <p>
          La <em>seule</em> différence : le <M tex="\beta" /> qui rabote le bénéfice futur{" "}
          <M tex="b_2" /> au moment d'agir. Cela crée deux pièges symétriques (slide 26). Un
          individu avec des problèmes de self-contrôle (<M tex="\beta < 1" />) va{" "}
          <strong>parfois</strong> :
        </p>
        <CardGrid>
          <MiniCard title="Bien d'investissement" tone="good">
            <M tex="b_1 < 0" />, <M tex="b_2 > 0" /> (effort maintenant, bénéfice plus tard) :
            jogging, épargne. Il arrive qu'il <strong>ne le consomme pas</strong> en{" "}
            <M tex="t=1" /> (<M tex="\beta\delta b_2 < -b_1" />) alors qu'ex-ante il souhaitait le
            consommer (<M tex="\delta b_2 > -b_1" />). ⇒ Les biens d'investissement sont{" "}
            <strong>sous-consommés</strong>.
          </MiniCard>
          <MiniCard title="Bien de tentation" tone="bad">
            <M tex="b_1 > 0" />, <M tex="b_2 < 0" /> (plaisir maintenant, regret plus tard) : junk
            food, alcool. Il arrive qu'il <strong>craque</strong> en <M tex="t=1" /> (
            <M tex="b_1 > -\beta\delta b_2" />) alors qu'ex-ante il souhaitait s'abstenir (
            <M tex="b_1 < -\delta b_2" />). ⇒ Les biens de tentation sont{" "}
            <strong>sur-consommés</strong>.
          </MiniCard>
        </CardGrid>
        <p className="text-[15px] text-muted-foreground">
          Les inégalités entre parenthèses sont les deux critères réécrits : par exemple,{" "}
          <M tex="b_1 + \beta\delta b_2 < 0" /> devient <M tex="\beta\delta b_2 < -b_1" /> en
          passant <M tex="b_1" /> de l'autre côté.
        </p>

        <p>
          L'exemple du slide 26, avec <M tex="\beta = \tfrac{1}{2}" /> et <M tex="\delta = 1" /> :
        </p>
        <CardGrid>
          <MiniCard title={<>🏃 Jogging : b₁ = −2, b₂ = 3</>} tone="good">
            <MB tex="\begin{aligned} \text{ex-ante : } & -2 + 1 \times 3 = +1 > 0 \\ \text{en } t=1 : \ & -2 + \tfrac{1}{2} \times 1 \times 3 = -0{,}5 < 0 \end{aligned}" />
            Il voulait courir, mais le moment venu il ne court pas :{" "}
            <strong>sous-consommé</strong>.
          </MiniCard>
          <MiniCard title={<>🍟 Chips : b₁ = 2, b₂ = −3</>} tone="bad">
            <MB tex="\begin{aligned} \text{ex-ante : } & 2 + 1 \times (-3) = -1 < 0 \\ \text{en } t=1 : \ & 2 + \tfrac{1}{2} \times 1 \times (-3) = +0{,}5 > 0 \end{aligned}" />
            Il voulait s'abstenir, mais le moment venu il craque :{" "}
            <strong>sur-consommé</strong>.
          </MiniCard>
        </CardGrid>
        <Callout variant="attention" title="« Parfois », pas « toujours »">
          Le piège ne se déclenche que lorsque les deux critères n'ont <strong>pas le même
          signe</strong>. Si le bénéfice futur est très grand, il n'y a pas de conflit. Exemple
          (chiffres illustratifs) : <M tex="b_1 = -1" />, <M tex="b_2 = 10" />,{" "}
          <M tex="\beta = \tfrac{1}{2}" />, <M tex="\delta = 1" /> donne +9 ex-ante et +4 en{" "}
          <M tex="t=1" /> : il veut courir et il court. À l'examen, vérifie toujours les deux signes
          avant de conclure.
        </Callout>

        <H3>Naïf ou sophistiqué ? La conscience du biais</H3>
        <p>
          Question décisive : l'individu <em>sait-il</em> qu'il a un biais ? On note{" "}
          <M tex="\hat{\beta}" /> (« bêta chapeau ») l'estimation qu'il fait de son propre biais de
          self-contrôle <M tex="\beta < 1" /> (slide 27).
        </p>
        <CardGrid cols={3}>
          <MiniCard title={<>Naïf : <M tex="\hat{\beta} = 1" /></>} tone="bad">
            Il <strong>ignore</strong> entièrement son biais. Il croit que son « moi de demain » sera
            parfaitement rationnel. Il ne se méfie pas de lui-même.
          </MiniCard>
          <MiniCard title={<>Sophistiqué : <M tex="\hat{\beta} = \beta" /></>} tone="good">
            Il <strong>anticipe parfaitement</strong> son biais. Il sait que son « moi de demain »
            va craquer, et il peut agir en conséquence.
          </MiniCard>
          <MiniCard title={<>Entre les deux : <M tex="\hat{\beta} \in (\beta, 1)" /></>}>
            <strong>Partiellement conscient</strong> de son biais. Il le sous-estime sans l'ignorer
            complètement.
          </MiniCard>
        </CardGrid>
        <Callout variant="intuition" title="L'image des « deux moi »">
          Pense à un individu en <M tex="t=0" /> qui essaie de deviner ce que fera un{" "}
          <em>second</em> individu en <M tex="t=1" />. Le premier estime que le second a un biais{" "}
          <M tex="\hat{\beta}" />, alors qu'en réalité le second a un biais <M tex="\beta" />. Dans
          ce modèle, <strong>les deux « individus » sont en fait la même personne</strong>, à deux
          moments. Le naïf se fait des illusions sur son moi futur ; le sophistiqué le connaît
          exactement.
        </Callout>

        <H4>Ce qu'il croit qu'il fera, et ce qu'il fera vraiment</H4>
        <p>
          En <M tex="t=0" />, l'individu prévoit son comportement de <M tex="t=1" /> avec son
          estimation <M tex="\hat{\beta}" /> : il refait le calcul du moi de <M tex="t=1" />, mais
          avec <M tex="\hat{\beta}" /> à la place de <M tex="\beta" /> (slide 28).
        </p>
        <CardGrid>
          <MiniCard title={<>Ce qu'il croit en t = 0 (avec β̂)</>}>
            Il s'attend à consommer le bien en <M tex="t=1" /> si{" "}
            <M tex="\hat{U}_1^{\beta}(\text{conso}) > \hat{U}_1^{\beta}(\text{pas conso})" /> :
            <MB tex="\begin{aligned} &(u_1 + b_1) + \hat{\beta}\delta\,(u_2 + b_2) > u_1 + \hat{\beta}\delta\,u_2 \\ \iff\ & b_1 + \hat{\beta}\delta\,b_2 > 0 \end{aligned}" />
          </MiniCard>
          <MiniCard title={<>Ce qu'il fait en t = 1 (avec le vrai β)</>}>
            Il consomme effectivement le bien si{" "}
            <M tex="U_1^{\beta}(\text{conso}) > U_1^{\beta}(\text{pas conso})" /> :
            <MB tex="\begin{aligned} &(u_1 + b_1) + \beta\delta\,(u_2 + b_2) > u_1 + \beta\delta\,u_2 \\ \iff\ & b_1 + \beta\delta\,b_2 > 0 \end{aligned}" />
          </MiniCard>
        </CardGrid>
        <p>
          Conséquence : quand il n'est pas parfaitement sophistiqué (<M tex="\hat{\beta} > \beta" />
          ), l'individu <strong>surestime</strong> sa consommation future de biens d'investissement
          et <strong>sous-estime</strong> sa consommation future de biens de tentation. Pourquoi ?
        </p>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Investissement (<M tex="b_2 > 0" />) : <M tex="\hat{\beta}\delta b_2 > \beta\delta b_2" />
            . Le critère qu'il imagine est plus favorable que le vrai : il croit qu'il s'y mettra
            plus souvent qu'en réalité (« promis, je cours demain »).
          </li>
          <li>
            Tentation (<M tex="b_2 < 0" />) : <M tex="\hat{\beta}\delta b_2 < \beta\delta b_2" /> (plus
            négatif). Il croit qu'il résistera plus souvent qu'en réalité (« je ne mangerai qu'une
            chips »).
          </li>
        </ul>
        <p>
          Le sophistiqué (<M tex="\hat{\beta} = \beta" />), lui, prévoit juste : ses deux critères
          sont identiques.
        </p>

        <p>
          Le testeur ci-dessous réunit les trois critères : ce qu'il veut ex-ante (
          <M tex="b_1 + \delta b_2" />
          ), ce qu'il croit qu'il fera (<M tex="b_1 + \hat{\beta}\delta b_2" />, curseur{" "}
          <M tex="\hat{\beta}" />) et ce qu'il fera vraiment (<M tex="b_1 + \beta\delta b_2" />).
          Essaie le jogging et les chips du slide 26, puis le scénario de l'exercice ci-dessous en
          faisant glisser <M tex="\hat{\beta}" /> de 1 (naïf) jusqu'à <M tex="\beta" />{" "}
          (sophistiqué).
        </p>
        <GoodClassifier />

        <ExerciseBlock
          scope="a2"
          id="ex2"
          number={2}
          title="Vais-je vraiment aller courir ?"
          difficulty={2}
          refs={[{ chapter: "a2", section: "selfcontrole", label: "Modèle (β, δ)" }]}
          statement={
            <>
              Exercice du slide 29. Soit un individu dont le facteur d'escompte est{" "}
              <M tex="\delta = \tfrac{1}{2}" /> et dont le biais de self-contrôle est{" "}
              <M tex="\beta = \tfrac{1}{2}" />. Il envisage en <M tex="t=0" /> d'aller courir en{" "}
              <M tex="t=1" />. Courir lui procure en <M tex="t=1" /> une <strong>dis</strong>utilité{" "}
              <M tex="b_1 = -3" /> (l'effort) et en <M tex="t=2" /> une utilité <M tex="b_2 = 8" />{" "}
              (la forme physique). <strong>(a)</strong> En <M tex="t=0" />, <em>souhaite</em>-t-il
              aller courir ? <strong>(b)</strong> S'il est naïf (<M tex="\hat{\beta} = 1" />),{" "}
              <em>pense</em>-t-il qu'il va effectivement courir ? <strong>(c)</strong> Et s'il est
              sophistiqué (<M tex="\hat{\beta} = \beta" />) ? <strong>(d)</strong> Que fera-t-il{" "}
              <em>réellement</em> en <M tex="t=1" /> ?
            </>
          }
          steps={[
            {
              title: "(a) Ce qu'il souhaite en t = 0 — critère ex-ante",
              content: (
                <>
                  <p>
                    Il <em>veut</em> courir si <M tex="b_1 + \delta b_2 > 0" /> (vu de{" "}
                    <M tex="t=0" />, l'effort et le bénéfice sont tous deux futurs : β se
                    simplifie).
                  </p>
                  <p>
                    Calcul : <M tex="-3 + \tfrac{1}{2} \times 8 = -3 + 4 = +1 > 0" />. ✓{" "}
                    <strong>Oui, il souhaite aller courir.</strong> Vu de loin, l'effort en vaut la
                    peine.
                  </p>
                </>
              ),
            },
            {
              title: "(b) Ce que le NAÏF croit — il prévoit avec β̂ = 1",
              content: (
                <>
                  <p>
                    Le naïf prévoit son comportement de <M tex="t=1" /> avec le critère{" "}
                    <M tex="b_1 + \hat{\beta}\delta b_2" /> et <M tex="\hat{\beta} = 1" /> :
                  </p>
                  <p>
                    <M tex="-3 + 1 \times \tfrac{1}{2} \times 8 = -3 + 4 = +1 > 0" />. ✓{" "}
                    <strong>Il pense qu'il ira courir.</strong> Il se fait confiance… on verra en
                    (d) si c'est à raison.
                  </p>
                </>
              ),
            },
            {
              title: "(c) Ce que le SOPHISTIQUÉ croit — il prévoit avec β̂ = β = ½",
              content: (
                <>
                  <p>
                    Même critère de prévision <M tex="b_1 + \hat{\beta}\delta b_2" />, mais avec{" "}
                    <M tex="\hat{\beta} = \beta = \tfrac{1}{2}" /> :
                  </p>
                  <p>
                    <M tex="-3 + \tfrac{1}{2} \times \tfrac{1}{2} \times 8 = -3 + 2 = -1 < 0" />. ✗{" "}
                    <strong>Il se rend compte qu'il n'ira pas courir.</strong> Il sait que, le
                    moment venu, l'effort immédiat pèsera plus lourd que le bénéfice futur raboté.
                  </p>
                </>
              ),
            },
            {
              title: "(d) Ce qui se passe RÉELLEMENT en t = 1 — vrai β = ½",
              content: (
                <>
                  <p>
                    En <M tex="t=1" />, l'effort est « maintenant » et le bénéfice est futur : il
                    court si <M tex="b_1 + \beta\delta b_2 > 0" /> :
                  </p>
                  <p>
                    <M tex="-3 + \tfrac{1}{2} \times \tfrac{1}{2} \times 8 = -1 < 0" />. ✗{" "}
                    <strong>Il ne court pas.</strong> Le naïf s'est trompé (il prévoyait +1) ; le
                    sophistiqué avait vu juste.
                  </p>
                  <p>
                    Les calculs (c) et (d) donnent le même nombre parce que{" "}
                    <M tex="\hat{\beta} = \beta" /> : c'est la définition du sophistiqué. Ils ne
                    répondent pas à la même question (une prévision faite en <M tex="t=0" /> /
                    le comportement réel en <M tex="t=1" />).
                  </p>
                </>
              ),
            },
          ]}
          result={
            <>
              <p>
                Ex-ante : <strong>+1</strong> → il souhaite courir. Naïf (
                <M tex="\hat{\beta} = 1" />) : <strong>+1</strong> → il croit qu'il courra.
                Sophistiqué (<M tex="\hat{\beta} = \tfrac{1}{2}" />) : <strong>−1</strong> → il sait
                qu'il ne courra pas. Réalité (<M tex="\beta = \tfrac{1}{2}" />) :{" "}
                <strong>−1</strong> → il ne court pas.
              </p>
              <p className="mt-2">
                Réponse du slide : il souhaite aller courir, il pense qu'il le fera s'il est naïf,
                mais se rend compte qu'il ne le fera pas s'il est sophistiqué. Pour aller plus loin :
                un individu partiellement conscient prévoit <M tex="-3 + 4\hat{\beta}" /> ; il croit
                encore qu'il courra tant que <M tex="\hat{\beta} > 0{,}75" />.
              </p>
            </>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 6 · COMMITMENT DEVICES (slides 30-40)                      */}
      {/* ============================================================ */}
      <Section id="commit" kicker="§ 6" title="Se lier les mains : les « commitment devices »">
        <Lead>
          Si je sais que mon « moi de demain » va craquer, je peux agir <em>aujourd'hui</em> pour
          l'en empêcher. C'est la stratégie de l'individu (partiellement) sophistiqué : il se lie
          les mains, volontairement, pour son propre bien.
        </Lead>

        <H3>Qui cherche à lutter contre son biais ?</H3>
        <CardGrid>
          <MiniCard title="Le naïf" tone="bad">
            Il ignore qu'il ne suivra pas, en <M tex="t=1" />, le programme de consommation qu'il a
            calculé en <M tex="t=0" />. Il ne cherche donc <strong>pas</strong> à lutter contre son
            propre biais.
          </MiniCard>
          <MiniCard title="Le (partiellement) sophistiqué" tone="good">
            Il anticipe qu'il ne suivra pas, en <M tex="t=1" />, le programme qu'il trouve optimal
            en <M tex="t=0" />. Il va donc chercher des <strong>commitment devices</strong> (outils
            d'engagement) pour contraindre son « moi du futur » à suivre un programme proche de
            l'optimum calculé en <M tex="t=0" />.
          </MiniCard>
        </CardGrid>

        <Callout variant="intuition" title="L'image d'Ulysse et les sirènes">
          Ulysse veut entendre le chant des sirènes sans s'y jeter. Il sait que, le moment venu, il
          sera incapable de résister. Sa solution : <strong>se faire attacher au mât</strong> à
          l'avance et ordonner à l'équipage de ne pas le détacher, quoi qu'il crie. Il{" "}
          <em>réduit volontairement ses propres options futures</em>. Un commitment device, c'est
          exactement ça : un mât qu'on se choisit soi-même.
        </Callout>

        <H3>Deux familles d'outils</H3>
        <p>
          Selon qu'on lutte contre une tentation ou qu'on s'oblige à un effort, l'outil change de
          forme (slide 30) :
        </p>
        <CardGrid>
          <MiniCard title="Contre une tentation" tone="bad">
            La rendre <strong>indisponible</strong>. Ne pas acheter de cigarettes du tout ; garder
            les chips dans l'armoire plutôt que sur la table. Si la tentation n'est pas à portée, le
            « moi de demain » ne peut pas craquer.
          </MiniCard>
          <MiniCard title="Pour un investissement" tone="good">
            Passer en <M tex="t=0" /> un <strong>contrat qui contraint ou incite</strong> le moi de{" "}
            <M tex="t=1" /> à adopter le comportement désiré. Acheter une maison à crédit (pour se{" "}
            <em>forcer</em> à épargner chaque mois), prendre un abonnement à la salle de gym,
            annoncer publiquement qu'on va aller courir.
          </MiniCard>
        </CardGrid>
        <Callout variant="retiens" title="Le paradoxe à retenir">
          Réduire ses propres options paraît absurde : un individu rationnel (<M tex="\beta = 1" />)
          n'y gagnerait rien, puisqu'il suit déjà son plan. Mais pour quelqu'un qui a un biais et
          qui le sait (<M tex="\beta < 1" /> <strong>et</strong> (partiellement) sophistiqué),{" "}
          <strong>se limiter peut augmenter son bien-être</strong>. Renoncer à de la liberté demain,
          c'est se protéger de soi-même.
        </Callout>

        <H3>Application : actifs illiquides et emprunts</H3>
        <p>
          Le slide 31 applique le modèle (β, δ) au mystère de Laibson et al. du § 5. Un individu
          ayant un problème de self-contrôle doit répartir sa consommation entre deux périodes, 1 et
          2. Il peut faire deux opérations potentiellement coûteuses :{" "}
          <strong>acheter des actifs illiquides</strong> (un placement bloqué, impossible à revendre
          avant <M tex="t=2" />) et <strong>emprunter</strong>. On va montrer que, s'il est
          sophistiqué, il fait les deux : il achète des actifs illiquides comme commitment device,
          et il emprunte à cause de son problème de self-contrôle.
        </p>

        <H4>Le décor (slides 31-32)</H4>
        <ul className="my-3 list-disc space-y-2 pl-6">
          <li>
            Préférences (β, δ) avec <M tex="\beta = 0{,}5" />, <M tex="\delta = 1" /> et{" "}
            <M tex="u(c_t) = \ln(c_t)" />. Individu <strong>sophistiqué</strong> :{" "}
            <M tex="\hat{\beta} = \beta" />.
          </li>
          <li>
            <strong>
              En <M tex="t=0" />
            </strong>{" "}
            : il reçoit un revenu <M tex="m = 9" /> et achète des actifs pour un montant{" "}
            <M tex="a" />, de dépréciation unitaire <M tex="p" /> (chaque euro placé ne vaut plus
            que <M tex="1-p" /> euro en <M tex="t=2" />). Il ne consomme rien en <M tex="t=0" /> :
            la consommation n'a lieu qu'en <M tex="t=1" /> et <M tex="t=2" />.
          </li>
          <li>
            <strong>
              En <M tex="t=1" />
            </strong>{" "}
            : il <strong>ne peut pas vendre ses actifs</strong>, mais dispose du reste de son revenu,{" "}
            <M tex="m-a" />. Il peut emprunter un montant <M tex="e" /> au taux d'intérêt{" "}
            <M tex="r" />. Il consomme <M tex="c_1" />. L'argent qu'il garde pour <M tex="t=2" />{" "}
            <strong>ne lui rapporte aucun intérêt</strong>.
          </li>
          <li>
            <strong>
              En <M tex="t=2" />
            </strong>{" "}
            : ses actifs sont libérés avec dépréciation, il récupère <M tex="a(1-p)" />. Il
            rembourse son emprunt avec les intérêts, <M tex="e(1+r)" />, et consomme ce qui lui
            reste, <M tex="c_2" />.
          </li>
        </ul>
        <Tbl minW={420}>
          <thead>
            <tr>
              <th className={TH}>Ligne du temps</th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=0" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=1" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="t=2" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${TD} font-semibold`}>Argent qui arrive</td>
              <td className={TD}>
                revenu <M tex="m" />
              </td>
              <td className={TD}>
                emprunt <M tex="e" />
              </td>
              <td className={TD}>
                actifs libérés <M tex="a(1-p)" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Argent qui part</td>
              <td className={TD}>
                achat d'actifs <M tex="a" />
              </td>
              <td className={TD}>—</td>
              <td className={TD}>
                remboursement <M tex="e(1+r)" />
              </td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Consommation</td>
              <td className={TD}>—</td>
              <td className={TD}>
                <M tex="c_1" />
              </td>
              <td className={TD}>
                <M tex="c_2" />
              </td>
            </tr>
          </tbody>
        </Tbl>
        <FormulaBox
          tex="c_1 + c_2 \;\le\; m - e\,r - a\,p"
          label="Contrainte de budget inter-temporelle (slide 32)"
          caption={
            <>
              Tout ce qu'il consomme sur les deux périodes = son revenu <M tex="m" />, moins les
              intérêts payés sur l'emprunt (<M tex="e\,r" />
              ), moins la perte due à la dépréciation des actifs (<M tex="a\,p" />).
            </>
          }
        />
        <FormulaBox
          tex="c_1 \;\le\; (m - a) + e"
          label="Contrainte de budget en t = 1 (slide 32)"
          caption={
            <>
              En <M tex="t=1" />, il n'a sous la main que ce qui n'est pas bloqué (
              <M tex="m-a" />
              ), plus ce qu'il emprunte (<M tex="e" />).
            </>
          }
        />
        <p>
          D'où vient la contrainte inter-temporelle ? Le slide l'énonce ; voici le calcul, en trois
          lignes.
        </p>
        <Step n={1} title="En t = 1 : ce qui reste après avoir consommé">
          <p>
            Il a <M tex="m - a + e" /> en main et consomme <M tex="c_1" />. Il garde le reste pour{" "}
            <M tex="t=2" />, sans intérêt :
          </p>
          <MB tex="\text{reste} = m - a + e - c_1" />
        </Step>
        <Step n={2} title="En t = 2 : on ajoute les actifs libérés et on rembourse l'emprunt">
          <MB tex="c_2 \;\le\; (m - a + e - c_1) + a(1-p) - e(1+r)" />
        </Step>
        <Step n={3} title="On développe : −a et +a s'annulent, +e et −e aussi">
          <MB tex="c_2 \;\le\; m - c_1 - a\,p - e\,r \iff c_1 + c_2 \;\le\; m - e\,r - a\,p" />
          <p className="text-[14.5px] text-muted-foreground">
            Vérification avec le cas 3 plus bas (<M tex="a = 4{,}5" />, <M tex="p = 0" />,{" "}
            <M tex="e = 0{,}5" />, <M tex="r = 0{,}5" />) :{" "}
            <M tex="m - er - ap = 9 - 0{,}25 - 0 = 8{,}75 = 5 + 3{,}75 = c_1 + c_2" />. ✓
          </p>
        </Step>

        <Callout variant="methode" title="Comment on compare les programmes">
          <p>
            <strong>On juge toujours ex-ante</strong>, avec l'utilité vue de <M tex="t=0" />. Comme
            il ne consomme rien en <M tex="t=0" />, la formule (β, δ) donne :
          </p>
          <MB tex="U_0 = \beta\delta\,\ln c_1 + \beta\delta^2 \ln c_2 = \beta\,(\ln c_1 + \ln c_2) \qquad (\text{car } \delta = 1)" />
          <p>
            Tous les programmes ont le même facteur <M tex="\beta" /> devant : il suffit de comparer{" "}
            <M tex="\ln c_1 + \ln c_2" />. C'est pour ça que les slides écrivent « U₀ = 3,008β » : U₀
            est exprimée <strong>en unités de β</strong>.
          </p>
          <p className="mt-2">
            <strong>Chaque cas se résout comme en A1</strong> : on écrit le Lagrangien{" "}
            <M tex="\mathcal{L}" /> (l'objectif, moins <M tex="\lambda" /> fois la contrainte), puis
            ses <strong>conditions de premier ordre</strong> (CPO) : les dérivées partielles de{" "}
            <M tex="\mathcal{L}" /> par rapport à <M tex="c_1" /> et à <M tex="c_2" /> doivent être
            nulles. Rappel : la dérivée de <M tex="\ln c" /> est <M tex="1/c" />.{" "}
            <TheoryRef chapter="a1" section="optim" />
          </p>
        </Callout>

        <p>
          On compare cinq programmes. Clique sur chacun pour dérouler le calcul et son
          interprétation. Plus <M tex="U_0" /> est haute, mieux c'est.
        </p>

        <CommitCase tag="Référence" tone="gold" title="Le programme optimal calculé en t = 0">
          <p>
            Vu de <M tex="t=0" />, acheter des actifs ou emprunter coûte sans rien rapporter
            ex-ante : ils n'entrent pas dans le programme optimal, <M tex="a^* = 0" /> et{" "}
            <M tex="e^* = 0" />. La contrainte devient simplement <M tex="c_1 + c_2 \le m" />.
          </p>
          <p>
            Le Lagrangien en <M tex="t=0" /> (les deux consommations sont futures : poids{" "}
            <M tex="\beta\delta" /> et <M tex="\beta\delta^2" />) :
          </p>
          <MB tex="\mathcal{L}(c_1, c_2, \lambda) = \beta\delta\,u(c_1) + \beta\delta^2 u(c_2) - \lambda\,[c_1 + c_2 - m]" />
          <p>Les CPO :</p>
          <MB tex="\frac{\partial \mathcal{L}}{\partial c_1} = \frac{\beta\delta}{c_1} - \lambda = 0 \qquad \frac{\partial \mathcal{L}}{\partial c_2} = \frac{\beta\delta^2}{c_2} - \lambda = 0" />
          <p>
            Les deux expressions valent <M tex="\lambda" />, donc{" "}
            <M tex="\frac{\beta\delta}{c_1} = \frac{\beta\delta^2}{c_2}" />, soit{" "}
            <M tex="c_2 = \delta\, c_1 = c_1" /> (car <M tex="\delta = 1" />) : c'est{" "}
            <M tex="c_1^* = c_2^*" />. Avec la contrainte <M tex="c_1 + c_2 = 9" /> :
          </p>
          <MB tex="c_1^* = c_2^* = 4{,}5 \qquad U_0(4{,}5\,;\,4{,}5) = \beta\,(\ln 4{,}5 + \ln 4{,}5) \approx 3{,}008\,\beta" />
          <p>
            (Car <M tex="\ln 4{,}5 \approx 1{,}504" />.) C'est l'objectif à atteindre : un lissage
            parfait, puisque <M tex="\delta = 1" />. <strong>Problème :</strong> ce n'est qu'un plan
            sur le papier. Rien ne garantit que le moi de <M tex="t=1" /> le suivra.
          </p>
        </CommitCase>

        <CommitCase tag="Le naïf" tone="bad" title="Le programme réellement suivi en t = 1 si a = 0">
          <p>
            Sans achat d'actifs (<M tex="a = 0" />), il dispose en <M tex="t=1" /> de tout son revenu{" "}
            <M tex="m" /> : il ne va donc rien emprunter, <M tex="e = 0" />. Mais c'est maintenant le
            moi de <M tex="t=1" /> qui décide, avec <em>sa</em> formule : la période 1 est
            « maintenant » (poids 1), la période 2 est future (poids <M tex="\beta\delta" />).
          </p>
          <MB tex="\mathcal{L}(c_1, c_2, \lambda) = u(c_1) + \beta\delta\,u(c_2) - \lambda\,[c_1 + c_2 - m]" />
          <p>Les CPO :</p>
          <MB tex="\frac{1}{c_1} - \lambda = 0 \quad\text{et}\quad \frac{\beta\delta}{c_2} - \lambda = 0 \;\Longrightarrow\; c_2 = \beta\delta\,c_1 = 0{,}5\,c_1" />
          <p>
            Le slide l'écrit <M tex="\beta c_1^* = c_2^*" /> : il sur-pondère le présent. Avec la
            contrainte : <M tex="c_1 + 0{,}5\,c_1 = 9" />, donc <M tex="c_1 = 6" /> et{" "}
            <M tex="c_2 = 3" />.
          </p>
          <MB tex="c_1^* = 6, \quad c_2^* = 3 \qquad U_0(6\,;\,3) = \beta\,(\ln 6 + \ln 3) = \beta \ln 18 \approx 2{,}89\,\beta" />
          <p>
            On juge ce programme ex-ante : <M tex="2{,}89 < 3{,}008" />. Le programme réel apporte
            une utilité ex-ante <strong>moindre</strong> : de l'utilité est gâchée. C'est le
            programme suivi si l'individu est <strong>naïf</strong> (<M tex="\hat{\beta} = 1" />
            ) : il ne se méfie pas de lui-même.
          </p>
        </CommitCase>

        <H4>Le sophistiqué peut-il faire mieux que le naïf ?</H4>
        <p>
          Le sophistiqué sait que, s'il ne fait rien (<M tex="a = 0" />), son moi de <M tex="t=1" />{" "}
          consommera (6 ; 3). Peut-il obtenir une utilité ex-ante <M tex="U_0" /> plus élevée que le
          naïf ? Le slide 35 considère trois cas stylisés :
        </p>
        <ul className="my-3 list-disc space-y-1.5 pl-6">
          <li>
            <strong>Cas 1</strong> : <M tex="p = 0" /> et <M tex="r = \infty" /> — actifs non
            coûteux, emprunts impossibles ;
          </li>
          <li>
            <strong>Cas 2</strong> : <M tex="p = 0{,}05" /> et <M tex="r = \infty" /> — actifs
            coûteux, emprunts impossibles ;
          </li>
          <li>
            <strong>Cas 3</strong> : <M tex="p = 0" /> et <M tex="r = 0{,}5" /> — actifs non
            coûteux, emprunts possibles.
          </li>
        </ul>
        <p className="text-[15px] text-muted-foreground">
          « <M tex="r = \infty" /> » est une façon de dire qu'emprunter coûterait infiniment cher :
          l'emprunt est impossible.
        </p>
        <Callout variant="examen" title="Ce que le slide 35 montre — et ce qu'il ne montre pas">
          <p>
            « Sauf pour le premier cas, nous ne dérivons pas le comportement optimal mais nous nous
            contentons de montrer qu'il existe des programmes <em>incentive compatible</em>{" "}
            améliorant U₀. »
          </p>
          <p className="mt-2">
            <strong>Incentive compatible</strong> = un programme que le moi de <M tex="t=1" />{" "}
            suivra effectivement, parce qu'il correspond à ce que ce moi a lui-même envie de faire
            dans la situation créée en <M tex="t=0" />. Dans les cas 2 et 3, on{" "}
            <strong>suppose</strong> donc <M tex="a = 4{,}5" /> et on vérifie que ce programme bat
            le naïf. À l'examen, ne présente pas <M tex="a = 4{,}5" /> comme « le choix optimal » :
            le slide 35 ne calcule pas l'optimum (dans le cas 3, un autre montant fait d'ailleurs
            encore un peu mieux).
          </p>
        </Callout>

        <CommitCase tag="Cas 1" tone="good" title="p = 0, r = ∞ — l'outil parfait">
          <p>
            Étant sophistiqué, il anticipe que si <M tex="a = 0" />, son moi de <M tex="t=1" />{" "}
            voudra consommer plus en période 1 qu'en période 2 (<M tex="\beta c_1^* = c_2^*" />,
            comme le naïf). Vu l'impossibilité d'emprunter, <M tex="e = 0" />.
          </p>
          <p>
            S'il achète <M tex="a = 4{,}5" />, il se contraint à <M tex="c_1 \le m - a = 4{,}5" />.
            En <M tex="t=1" />, il souhaite emprunter pour consommer davantage, mais ne le peut pas
            : <M tex="c_1 = 4{,}5" />. En <M tex="t=2" />, ses actifs se libèrent intacts (
            <M tex="p = 0" />) : <M tex="c_2 = a = 4{,}5" />.
          </p>
          <MB tex="a^* = 4{,}5, \quad c_1^* = c_2^* = 4{,}5 \qquad U_0(4{,}5\,;\,4{,}5) \approx 3{,}008\,\beta" />
          <p>
            Il obtient <strong>exactement le programme optimal</strong> ! En mettant de côté, via
            l'achat d'actifs illiquides, le montant optimal pour <M tex="c_2" />, il contraint sa
            consommation <M tex="c_1" />. Le mât d'Ulysse, version épargne. Ici, c'est bien le
            meilleur choix : on ne peut pas dépasser le programme optimal.
          </p>
        </CommitCase>

        <CommitCase tag="Cas 2" title="p = 0,05, r = ∞ — un outil coûteux mais utile">
          <p>
            Même anticipation que dans le cas 1, mais l'actif <strong>se déprécie</strong> : chaque
            euro bloqué ne vaut plus que 0,95 € en <M tex="t=2" />. La question du slide 37 :
            améliore-t-il son utilité ex-ante <em>s'il achète</em> <M tex="a = 4{,}5" /> ?
          </p>
          <p>
            <strong>Supposons qu'il achète</strong> <M tex="a = 4{,}5" />. Il se contraint à{" "}
            <M tex="c_1 \le m - a = 4{,}5" />. En <M tex="t=1" />, il souhaite emprunter mais ne le
            peut pas : <M tex="c_1 = 4{,}5" />. En <M tex="t=2" />, ses actifs se libèrent
            dépréciés : <M tex="c_2 = a(1-p) = 4{,}5 \times 0{,}95 = 4{,}275" />.
          </p>
          <MB tex="a = 4{,}5, \quad c_1 = 4{,}5, \quad c_2 = 4{,}275 \qquad U_0(4{,}5\,;\,4{,}275) \approx 2{,}96\,\beta" />
          <p>
            (Détail : <M tex="\ln 4{,}5 + \ln 4{,}275 \approx 1{,}504 + 1{,}453 = 2{,}957" />.) Vu la
            dépréciation, il ne peut pas obtenir le programme optimal. Mais{" "}
            <M tex="2{,}96 > 2{,}89" /> :{" "}
            <strong>
              malgré la dépréciation, les actifs illiquides permettent un gain d'utilité ex-ante
            </strong>
            , car ils aident à résoudre le problème de self-contrôle. On n'a pas cherché le meilleur{" "}
            <M tex="a" /> : on a seulement montré que ce programme fait mieux que le naïf.
          </p>
        </CommitCase>

        <CommitCase tag="Cas 3" title="p = 0, r = 0,5 — pourquoi il finit par emprunter">
          <p>
            Si <M tex="a = 0" />, il dispose en <M tex="t=1" /> de tout le revenu <M tex="m" /> et
            n'emprunte rien : c'est le programme du naïf. Améliore-t-il son utilité ex-ante s'il
            achète <M tex="a = 4{,}5" /> ?
          </p>
          <p>
            <strong>Supposons qu'il achète</strong> <M tex="a = 4{,}5" />. En <M tex="t=1" />, il
            dispose de <M tex="m - a = 4{,}5" />. Vu son problème de self-contrôle, il souhaite
            avoir <M tex="c_1 > c_2" /> : pour augmenter sa consommation en <M tex="t=1" />, il
            empruntera un montant <M tex="e > 0" />. Sa consommation de <M tex="t=1" /> vient de son
            argent libre et de l'emprunt :
          </p>
          <MB tex="c_1 = (m - a) + e = \tfrac{m}{2} + e \quad\iff\quad e = c_1 - \tfrac{m}{2}" />
          <p>
            Le Lagrangien en <M tex="t=1" /> utilise la contrainte inter-temporelle avec{" "}
            <M tex="p = 0" /> (<M tex="c_1 + c_2 \le m - er" />), où l'on remplace <M tex="e" /> par{" "}
            <M tex="c_1 - \tfrac{m}{2}" /> :
          </p>
          <MB tex="\begin{aligned} \mathcal{L}(c_1, c_2, \lambda) &= u(c_1) + \beta\delta\,u(c_2) - \lambda\,\big[c_1 + c_2 - (m - e\,r)\big] \\ &= u(c_1) + \beta\delta\,u(c_2) - \lambda\,\big[c_1 + c_2 - m + c_1 r - \tfrac{m}{2}\,r\big] \end{aligned}" />
          <p>Les CPO (le terme <M tex="c_1 r" /> fait apparaître <M tex="1+r" />) :</p>
          <MB tex="\frac{\partial \mathcal{L}}{\partial c_1} = \frac{1}{c_1} - \lambda\,(1+r) = 0 \qquad \frac{\partial \mathcal{L}}{\partial c_2} = \frac{\beta\delta}{c_2} - \lambda = 0" />
          <p>
            On égalise les deux expressions de <M tex="\lambda" /> :{" "}
            <M tex="\frac{1}{(1+r)\,c_1} = \frac{\beta\delta}{c_2}" />, donc (avec{" "}
            <M tex="\delta = 1" />) :
          </p>
          <MB tex="c_2 = \beta(1+r)\,c_1 = 0{,}5 \times 1{,}5\;c_1 = 0{,}75\,c_1" />
          <p>
            Avec la contrainte <M tex="c_1 + c_2 = m - er" />, où <M tex="e = c_1 - 4{,}5" /> :
          </p>
          <MB tex="\begin{aligned} c_1 + 0{,}75\,c_1 &= 9 - 0{,}5\,(c_1 - 4{,}5) \\ 2{,}25\,c_1 &= 11{,}25 \;\Longrightarrow\; c_1 = 5, \quad c_2 = 3{,}75, \quad e = 5 - 4{,}5 = 0{,}5 \end{aligned}" />
          <MB tex="a = 4{,}5, \quad c_1 = 5, \quad c_2 = 3{,}75, \quad e = 0{,}5 \qquad U_0(5\,;\,3{,}75) \approx 2{,}93\,\beta" />
          <p>
            (Détail : <M tex="\ln 5 + \ln 3{,}75 \approx 1{,}609 + 1{,}322 = 2{,}931" />. Vérification
            en <M tex="t=2" /> : <M tex="c_2 = a - e(1+r) = 4{,}5 - 0{,}75 = 3{,}75" />. ✓)
          </p>
          <p>
            Voilà le comportement « absurde » : il a de l'argent bloqué <strong>et</strong> il
            emprunte à 50 % ! Le slide 39 conclut :
          </p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              <strong>La possibilité d'emprunter empêche d'atteindre le programme optimal</strong>{" "}
              (<M tex="2{,}93 < 3{,}008" />).
            </li>
            <li>
              Lorsqu'il achète des actifs pour limiter son revenu disponible en <M tex="t=1" />, son
              problème de self-contrôle l'incite à emprunter malgré le taux d'intérêt élevé.
            </li>
            <li>
              Plus le taux d'intérêt est élevé, moins il emprunte, et donc plus l'achat d'actifs
              illiquides est un commitment device efficace.
            </li>
            <li>
              Lorsque <M tex="r > 0" />, les actifs illiquides permettent un gain d'utilité ex-ante,
              car ils aident à résoudre le problème de self-contrôle.
            </li>
          </ul>
          <p>
            Bilan : <M tex="2{,}93 > 2{,}89" />, ce programme <strong>bat le naïf</strong>. On ne
            prétend pas que <M tex="a = 4{,}5" /> soit son meilleur choix (slide 35).
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            Pourquoi « lorsque <M tex="r > 0" /> » ? Avec <M tex="r = 0" />, emprunter serait
            gratuit : la même méthode donne <M tex="c_2 = 0{,}5\,c_1" /> et{" "}
            <M tex="c_1 + c_2 = 9" />, soit (6 ; 3) avec <M tex="e = 1{,}5" />. Il annulerait
            entièrement l'effet de l'actif et retomberait sur le programme du naïf.
          </p>
        </CommitCase>

        <p>Les cinq programmes en un coup d'œil :</p>
        <Tbl minW={470}>
          <thead>
            <tr>
              <th className={TH}>Programme</th>
              <th className={TH}>
                <span className="normal-case"><M tex="a" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="e" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="(c_1\,;\,c_2)" /></span>
              </th>
              <th className={TH}>
                <span className="normal-case"><M tex="U_0" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-100/60 dark:bg-amber-400/10">
              <td className={`${TD} font-semibold`}>Optimal (calculé en t = 0)</td>
              <td className={TD}>0</td>
              <td className={TD}>0</td>
              <td className={`${TD} whitespace-nowrap`}>(4,5 ; 4,5)</td>
              <td className={`${TD} font-semibold`}>3,008β</td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Naïf (a = 0)</td>
              <td className={TD}>0</td>
              <td className={TD}>0</td>
              <td className={`${TD} whitespace-nowrap`}>(6 ; 3)</td>
              <td className={`${TD} font-semibold text-rose-700 dark:text-rose-400`}>2,89β</td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Cas 1 : p = 0, r = ∞</td>
              <td className={TD}>4,5</td>
              <td className={TD}>0</td>
              <td className={`${TD} whitespace-nowrap`}>(4,5 ; 4,5)</td>
              <td className={`${TD} font-semibold`}>3,008β</td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Cas 2 : p = 0,05, r = ∞</td>
              <td className={TD}>4,5 (supposé)</td>
              <td className={TD}>0</td>
              <td className={`${TD} whitespace-nowrap`}>(4,5 ; 4,275)</td>
              <td className={`${TD} font-semibold`}>2,96β</td>
            </tr>
            <tr>
              <td className={`${TD} font-semibold`}>Cas 3 : p = 0, r = 0,5</td>
              <td className={TD}>4,5 (supposé)</td>
              <td className={TD}>0,5</td>
              <td className={`${TD} whitespace-nowrap`}>(5 ; 3,75)</td>
              <td className={`${TD} font-semibold`}>2,93β</td>
            </tr>
          </tbody>
        </Tbl>
        <p>
          Les trois cas battent le naïf (2,89β) ; seul le cas 1 atteint le programme optimal
          (3,008β).
        </p>

        <p>
          À toi de jouer : le simulateur reproduit ces programmes (boutons) et te laisse changer{" "}
          <M tex="a" />, <M tex="p" /> et <M tex="r" />. Dans le cas 3, augmente <M tex="r" /> :
          plus <M tex="r" /> est élevé, moins il emprunte (slide 39). Attention :{" "}
          <M tex="a = 4{,}5" /> est un <em>exemple</em> de programme incentive compatible qui bat le
          naïf. En bougeant <M tex="a" />, tu verras que d'autres montants font parfois encore mieux
          : le slide 35 ne cherche pas le meilleur <M tex="a" />.
        </p>
        <CommitmentSimulator />

        <Callout variant="exemple" title="Le mystère de Laibson et al. (2009) résolu">
          <p>
            Retour au mystère du § 5 : une dette sur carte de crédit de ≈ 12 % du revenu annuel{" "}
            <strong>et</strong> des actifs illiquides de ≈ 216 % du revenu annuel vers 50 ans. Le
            modèle (β, δ) l'explique (slide 40). Notre analyse des trois cas stylisés montre qu'il
            est <strong>raisonnable</strong> pour un individu sophistiqué de détenir des actifs
            illiquides et, en même temps, d'emprunter pour sa consommation, même si le taux
            d'intérêt sur ses emprunts est plus élevé que celui qu'il perçoit sur ses actifs.
          </p>
          <p className="mt-2">
            La raison : il détient des actifs illiquides <strong>pour lutter contre</strong> son
            problème de self-contrôle. Et lorsqu'il détient des actifs illiquides, ce{" "}
            <em>même</em> problème de self-contrôle le pousse à emprunter. Au global, la
            combinaison actifs illiquides + emprunts lui donne une utilité ex-ante plus élevée que
            s'il ne détenait pas d'actifs (et donc n'empruntait pas).
          </p>
        </Callout>
        <Callout variant="examen" title="« Raisonnable », pas « optimal »">
          Le slide 40 dit qu'il est <strong>raisonnable</strong> de détenir des actifs illiquides
          tout en empruntant : ce comportement fait mieux que de ne rien bloquer. Il ne dit pas que
          c'est le meilleur programme possible — le slide 35 ne dérive pas l'optimum dans les cas 2
          et 3. À l'examen, n'écris donc pas que ce comportement est « optimal ».
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 7 · POLITIQUES COMPORTEMENTALES (slides 41-42)             */}
      {/* ============================================================ */}
      <Section
        id="politiques"
        kicker="§ 7"
        title="Politiques comportementales sur l'épargne : les « nudges »"
      >
        <Lead>
          On revient à la question de départ : comment lutter contre le manque d'épargne volontaire
          ? Le § 4 proposait un levier « rationnel » : subventionner l'épargne. Les slides 41 et 42
          présentent deux politiques <em>comportementales</em>, qui s'appuient sur nos problèmes de
          self-contrôle au lieu de les ignorer — sans jamais forcer personne.
        </Lead>

        <H3>Levier n°1 — Changer l'option par défaut</H3>
        <p>
          Aux USA, les employés doivent choisir un plan d'épargne retraite au moment de leur
          engagement. L'un des plans est déjà coché : c'est l'<strong>option par défaut</strong>,
          celle qu'on obtient si on ne fait rien.
        </p>
        <CardGrid>
          <MiniCard title="Avant" tone="bad">
            Plan par défaut : <strong>ne pas épargner</strong> (0 %). Pour épargner, il faut
            choisir activement un autre plan. Part des employés qui épargnent pour leur retraite :{" "}
            <strong>50 %</strong>.
          </MiniCard>
          <MiniCard title="Après" tone="good">
            Plan par défaut : <strong>un taux d'épargne de 3 %</strong>. Pour ne pas épargner, il
            faut choisir activement un autre plan. Part des employés qui épargnent pour leur
            retraite : <strong>86 %</strong> (Madrian et Shea, 2001).
          </MiniCard>
        </CardGrid>
        <p>
          Les plans disponibles, l'effort pour en changer (un coup de fil ou un formulaire) et la
          liberté de partir sont identiques ;{" "}
          <strong>seule l'option par défaut a changé (0 % → 3 %)</strong>. Résultat : la part des
          employés qui épargnent pour leur retraite passe de 50 % à 86 % (+36 points de
          pourcentage).
        </p>
        <Callout variant="retiens" title="Le même biais, retourné contre lui-même">
          <p>
            Pourquoi un simple changement de case a-t-il un tel effet ? Changer de plan demande un
            petit effort. Le moi d'aujourd'hui se dit : « je m'en occuperai demain »… et le
            lendemain, il se dit la même chose. Naïf sur sa propre procrastination, il croit
            toujours qu'il changera bientôt — et il reste sur l'option par défaut. Si le défaut est
            0 %, ce biais le laisse sans épargne ; si le défaut est 3 %, ce <em>même</em> biais le
            fait épargner.
          </p>
          <p className="mt-2">
            O'Donoghue et Rabin (2001) ont montré que cette politique{" "}
            <strong>
              utilise le biais de self-contrôle (naïveté par rapport à sa procrastination sur la
              décision de quel plan choisir) pour résoudre ce même biais de self-contrôle (manque
              d'épargne)
            </strong>
            .
          </p>
        </Callout>

        <H3>Levier n°2 — Le SmarTplan (« Save More Tomorrow », Thaler et Benartzi 2004)</H3>
        <p>Le slide 42 part de deux constats :</p>
        <ol className="my-3 list-decimal space-y-2 pl-6">
          <li>
            Les gens n'aiment pas <strong>ré-optimiser leur plan de retraite</strong> chaque fois
            qu'ils obtiennent une augmentation de salaire.
          </li>
          <li>
            Ils n'aiment pas non plus <strong>voir leur salaire nominal diminuer</strong> dans le
            temps — ce qui pourrait arriver avec un plan de retraite qui impose des augmentations
            d'épargne <strong>à dates fixes</strong>. (« Nominal » veut dire : le montant en euros
            tel qu'il apparaît sur la fiche de paie, sans corriger de l'inflation. Ici, il s'agit du
            salaire qui reste une fois l'épargne prélevée.)
          </li>
        </ol>
        <Callout variant="intuition" title="L'idée du SmarTplan">
          Le SmarTplan propose d'<strong>augmenter automatiquement</strong> le pourcentage épargné{" "}
          <strong>chaque fois que l'employé obtient une augmentation</strong>, en s'assurant de ne
          jamais diminuer le salaire après épargne. Les deux obstacles tombent : rien à recalculer
          (c'est automatique), et le salaire après épargne ne baisse jamais (il augmente juste un
          peu moins vite). Dans leur échantillon, Thaler et Benartzi (2004) observent qu'un tel plan
          a permis d'augmenter le taux d'épargne de <strong>3,5 % à 13,6 %</strong> en à peine 4
          ans.
        </Callout>
        <Callout variant="exemple" title="Dates fixes ou augmentations ? (chiffres illustratifs)">
          <p>
            Salaire de 2 000 € et taux d'épargne de 3,5 % : il reste{" "}
            <M tex="2000 \times 0{,}965 = 1930" /> € après épargne.
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-6">
            <li>
              <strong>Plan à dates fixes</strong> : au 1<sup>er</sup> janvier, l'épargne passe à
              5 %, sans augmentation. Il reste <M tex="2000 \times 0{,}95 = 1900" /> € : le salaire
              après épargne <strong>baisse</strong> de 30 €.
            </li>
            <li>
              <strong>SmarTplan</strong> : l'épargne ne passe à 5 % qu'au moment d'une augmentation,
              disons à 2 060 €. Il reste <M tex="2060 \times 0{,}95 = 1957" /> € : plus qu'avant
              (1 930 €).
            </li>
          </ul>
        </Callout>

        <AvantApres />
        <Callout variant="attention" title="Deux chiffres à ne pas confondre">
          <strong>50 % → 86 %</strong> est une <em>part d'employés</em> : combien de personnes
          épargnent pour leur retraite (option par défaut). <strong>3,5 % → 13,6 %</strong> est un{" "}
          <em>taux d'épargne</em> : quelle part de leur salaire les participants épargnent
          (SmarTplan).
        </Callout>

        <H3>Le nom de cette philosophie : le paternalisme libertaire</H3>
        <p>
          Ces politiques de <strong>« nudging »</strong> (coups de pouce) incarnent un
          paternalisme « libertaire » (slide 42). Deux mots qui semblent contradictoires :{" "}
          <TheoryRef chapter="a1" section="nudge" />
        </p>
        <CardGrid>
          <MiniCard title="Paternaliste…">
            parce qu'elles sont basées sur l'idée que <strong>les individus font des erreurs</strong>{" "}
            (ils épargnent trop peu à cause de leurs problèmes de self-contrôle) et cherchent à les
            aider.
          </MiniCard>
          <MiniCard title="…mais libertaire" tone="good">
            parce qu'elles <strong>ne contraignent pas</strong> les individus. On peut toujours
            refuser. Un individu purement rationnel n'est donc <em>pas affecté</em> : il choisit ce
            qu'il voulait de toute façon.
          </MiniCard>
        </CardGrid>
        <Callout variant="retiens" title="À retenir">
          Ces deux politiques aident ceux qui ont des problèmes de self-contrôle et{" "}
          <strong>n'ont pas d'effet sur les individus purement rationnels</strong>.
        </Callout>

        <Quiz
          scope="a2"
          id="q5"
          question={
            <>
              Pourquoi le simple changement d'option par défaut (épargne automatique de 3 %)
              fait-il passer la part des employés qui épargnent de 50 % à 86 %, alors que changer
              de plan ne demande qu'un coup de fil ?
            </>
          }
          options={[
            {
              text: <>Parce que quitter le plan par défaut est financièrement pénalisé.</>,
              explain: (
                <>
                  Non : changer de plan est libre et ne demande qu'un coup de fil ou un formulaire.
                  C'est justement ce qui rend le résultat si frappant : seule l'option par défaut a
                  changé (0 % → 3 %).
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'on <strong>procrastine</strong> la décision de changer de plan : le même
                  biais de self-contrôle (procrastination naïve) est retourné contre le manque
                  d'épargne.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement ce qu'ont montré O'Donoghue et Rabin (2001) : naïf sur sa
                  procrastination (« je changerai de plan demain »), l'employé reste sur le défaut.
                  Si le défaut est d'épargner 3 %, ce biais de self-contrôle le fait épargner : il
                  sert à résoudre ce même biais (le manque d'épargne).
                </>
              ),
            },
            {
              text: <>Parce que la loi rend l'épargne obligatoire à partir de ce moment-là.</>,
              explain: (
                <>
                  Non : un nudge ne contraint jamais. C'est toute la différence avec une obligation
                  légale — et c'est pour ça qu'on parle de paternalisme <em>libertaire</em>.
                </>
              ),
            },
            {
              text: <>Parce que le rendement de l'épargne a été augmenté en parallèle.</>,
              explain: (
                <>
                  Non : ce serait le levier « rationnel » du § 4 (le subside <M tex="s" />, qui
                  augmente le taux <M tex="r" />
                  ). Ici, aucun paramètre économique ne change — seulement l'option cochée d'avance.
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
