/*
 * Chapitre B2 — PartContrats (sections affichées dans la page du chapitre).
 * § 3 Cas 1, salaire fixe (slides 9-11) · § 4 Cas 2, salaire proportionnel (slides 12-14) ·
 * § 5 Cas 3, salaire linéaire (slides 15-19) · § 6 vue d'ensemble (slide 20). Deck S7.
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { TheoryRef } from "@/components/course/TheoryRef";
import { ContractLab, EffortExplorer, PayoffComparison, SurplusExplorer } from "./interactives";
import { H4, VocabGrid, Steps, Hl } from "./ui";
import { LuckSplit } from "./anim/LuckSplit";

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section (même style que les autres parties de B2.2). */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[1.1rem] leading-relaxed">{children}</p>;
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Pastille « hypothèse » de B2.1 (H1, H2.1), comme dans le chapitre des jeux séquentiels. */
function Hyp({ children }: { children: ReactNode }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 align-middle text-[12px] font-bold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
      {children}
    </span>
  );
}

/** « où » entre l'objectif et son développement, comme dans les slides. */
function Ou() {
  return <p className="-my-1 text-center text-[15px] italic text-muted-foreground">où</p>;
}

/** Petit tableau sans largeur minimale (le Tbl partagé impose 560 px, inutile pour 3-4 colonnes). */
function MiniTbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border bg-background">
      <table className="w-full border-collapse text-[14.5px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th key={i} className="px-2 py-2 text-center text-[13px] font-semibold text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap px-2 py-2 text-center align-middle tabular-nums">
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

export function PartContrats() {
  return (
    <>

      {/* ============================================================ */}
      {/* §3 — Cas 1 : le salaire fixe (slides 9-11)                    */}
      {/* ============================================================ */}
      <Section
        id="sec-cas1"
        kicker="§ 3"
        title={
          <>
            Cas 1 — le salaire fixe&nbsp;: <M tex="w(z) = \alpha" />
          </>
        }
      >
        <Callout variant="methode" title="🗺️ La feuille de route des trois cas (slide 9)">
          <p>
            Le cours étudie d'abord un agent <strong>neutre au risque</strong>. S'il refuse le
            contrat, il obtient une <strong>utilité par défaut</strong>{" "}
            <M tex="\tilde{u} = 0" /> (slide 9). On compare trois ensembles de contrats. Retiens
            dès maintenant leur verdict&nbsp;: les §&nbsp;3 à 5 le démontrent.
          </p>
          <UL>
            <li>
              <strong>Cas 1 — salaire fixe</strong> <M tex="w(z) = \alpha" />&nbsp;: pas d'incitant à
              l'effort.
            </li>
            <li>
              <strong>Cas 2 — salaire proportionnel</strong> <M tex="w(z) = \beta z" />&nbsp;: l'effort
              induit est inefficace.
            </li>
            <li>
              <strong>Cas 3 — salaire linéaire</strong> <M tex="w(z) = \alpha + \beta z" />&nbsp;:
              l'effort induit est efficace et le principal extrait tout le surplus.
            </li>
          </UL>
          <p>
            Un effort est <em>efficace</em> quand il crée le plus de valeur possible, une fois son
            coût déduit. On verra au §&nbsp;5 que c'est <span className="whitespace-nowrap"><M tex="e = 1" />.</span>
          </p>
          <p className="mt-2">
            Pour chaque cas, on cherche l'<strong>ENPS</strong> du jeu séquentiel par{" "}
            <strong>backward induction</strong> (slide 9), avec la méthode du §&nbsp;2&nbsp;:{" "}
            <strong>③</strong> l'effort de l'agent, <strong>②</strong> sa décision de signer (la
            CP), <strong>①</strong> le contrat du principal. Comme dans les slides, chaque cas est
            rédigé en deux problèmes&nbsp;: l'<strong>étape A</strong> est celui de l'agent (③),
            l'<strong>étape B</strong> celui du principal (①), dans lequel entre la décision de
            signer (②). Le lecteur «&nbsp;L'arbre du jeu et sa résolution par backward
            induction&nbsp;» du §&nbsp;2 rejoue ces étapes pour les trois cas.{" "}
            <TheoryRef chapter="bseq" section="s4" />
          </p>
        </Callout>

        <H4>Les outils des trois cas (rappel du §&nbsp;2)</H4>
        <UL>
          <li>
            Le résultat&nbsp;: <span className="whitespace-nowrap"><M tex="z = e + x" />,</span> où la chance <M tex="x" /> vaut zéro en moyenne,{" "}
            <M tex="E(x) = 0" /> (slide 5).
          </li>
          <li>
            Le contrat&nbsp;: <M tex="w(z) = \alpha + \beta z" />, avec le fixe <M tex="\alpha" /> et
            le taux de bonus <M tex="\beta" /> (slide 6).
          </li>
          <li>
            Les payoffs&nbsp;: <M tex="U_p = E(z - w)" /> pour le principal,{" "}
            <M tex="U_a = E(w - c)" /> pour l'agent, avec le coût d'effort{" "}
            <M tex="c(e) = e^2/2" /> (slide 7).
          </li>
          <li>
            Deux règles de calcul. L'espérance d'un nombre certain est ce nombre. Et{" "}
            <M tex="E(e + x) = e + E(x) = e" />&nbsp;: l'agent connaît son effort, seule la chance est
            aléatoire.
          </li>
        </UL>

        <Lead>
          Premier contrat candidat, le plus simple&nbsp;: un salaire fixe. L'agent touche{" "}
          <M tex="\alpha" /> quoi qu'il arrive, qu'il vende beaucoup de licences ou aucune.
          Résolvons ce cas par backward induction&nbsp;: l'agent d'abord.
        </Lead>

        <H4>
          Étape A — le problème de l'agent <Hyp>H1&nbsp;: l'agent est rationnel</Hyp>
        </H4>
        <p>
          On résout la fin du jeu (étape ③). L'agent a signé. Il cherche le niveau d'effort qui
          maximise son utilité espérée (slide 10)&nbsp;:
        </p>
        <MB tex="\max_{e} \; E(w - c)" />
        <Ou />
        <MB tex="\begin{aligned} E(w - c) &= E\!\left(\alpha - \frac{e^2}{2}\right) \\ &= \alpha - \frac{e^2}{2} \end{aligned}" />
        <Steps
          items={[
            <>
              <p>
                <strong>Ligne 1&nbsp;: on remplace.</strong> Au Cas 1, <M tex="w = \alpha" />&nbsp;; le coût
                de l'effort est <span className="whitespace-nowrap"><M tex="c = e^2/2" />.</span>
              </p>
              <p>
                <strong>Ligne 2&nbsp;: l'espérance disparaît.</strong> Rien n'est aléatoire dans{" "}
                <M tex="\alpha - e^2/2" />&nbsp;: le fixe ne dépend pas du résultat <span className="whitespace-nowrap"><M tex="z" />,</span> et
                l'agent connaît son propre effort. L'espérance d'un nombre certain est ce nombre.
              </p>
            </>,
            <>
              <p>
                <strong>CPO</strong> (condition du premier ordre)&nbsp;: on dérive par rapport à{" "}
                <M tex="e" /> et on annule. Pour l'agent, <M tex="\alpha" /> est une constante&nbsp;:
                sa dérivée est 0. La dérivée de <M tex="e^2/2" /> est <span className="whitespace-nowrap"><M tex="e" />.</span>
              </p>
              <MB tex="\frac{\partial E(w - c)}{\partial e} = -e = 0 \;\;\Rightarrow\;\; \boxed{e^* = 0}" />
              <p>
                C'est bien un maximum&nbsp;: <M tex="\alpha - e^2/2" /> est une parabole tournée vers
                le bas, de sommet <span className="whitespace-nowrap"><M tex="e = 0" />.</span> Chaque unité d'effort ajoute du coût et ne
                rapporte rien.
              </p>
            </>,
            <>
              <p>
                <strong>Interprétation.</strong> Payé pareil quoi qu'il arrive, l'agent n'a
                aucune raison de supporter le coût d'un effort. Sa meilleure réponse est{" "}
                <span className="whitespace-nowrap"><M tex="e^*(\alpha) = 0" />,</span> <em>quel que soit</em> le fixe. Doubler le salaire
                fixe ne crée aucun effort en plus.
              </p>
              <p>
                La notation <M tex="e^*(\alpha)" /> rappelle que c'est une{" "}
                <strong>règle</strong>&nbsp;: l'effort que l'agent choisirait face à chaque fixe{" "}
                <M tex="\alpha" /> possible. Ici, la règle donne 0 pour tous les{" "}
                <span className="whitespace-nowrap"><M tex="\alpha" />.</span>
              </p>
            </>,
          ]}
        />

        <H4>
          Étape B — le problème du principal{" "}
          <Hyp>H2.1&nbsp;: il pense que l'agent est rationnel</Hyp>
        </H4>
        <p>
          On remonte l'arbre. Le principal joue en premier, mais il pense que l'agent est
          rationnel&nbsp;: il <strong>anticipe</strong> ses réactions. Slide 10&nbsp;: «&nbsp;le principal
          anticipe la meilleure réponse de l'agent <span className="whitespace-nowrap"><M tex="e^*(\alpha) = 0" />,</span> et conçoit le
          contrat de manière à maximiser ses profits attendus&nbsp;».
        </p>
        <Steps
          items={[
            <>
              <p>
                <strong>Ce que le principal anticipe.</strong>
              </p>
              <UL>
                <li>
                  Étape ③&nbsp;: quel que soit <span className="whitespace-nowrap"><M tex="\alpha" />,</span> l'agent fera <span className="whitespace-nowrap"><M tex="e = 0" />.</span>
                </li>
                <li>
                  Étape ②&nbsp;: avec <span className="whitespace-nowrap"><M tex="e = 0" />,</span> l'agent obtient en signant{" "}
                  <M tex="E(w - c) = \alpha - 0 = \alpha" />. Il signe si{" "}
                  <M tex="\alpha \ge \tilde{u} = 0" /> et refuse si <span className="whitespace-nowrap"><M tex="\alpha < 0" />.</span> À{" "}
                  <M tex="\alpha = 0" /> pile, signer ou refuser lui est égal.
                </li>
              </UL>
            </>,
            <>
              <p>
                <strong>L'objectif du principal</strong> (slide 11)&nbsp;:
              </p>
              <MB tex="\max_{\alpha} \; E(z - w)" />
              <Ou />
              <MB tex="\begin{aligned} E(z - w) &= E\big(z(\alpha) - w(\alpha)\big) \\ &= e^*(\alpha) + E(x) - w(\alpha) \\ &= 0 + 0 - \alpha \end{aligned}" />
              <UL>
                <li>Ligne 1&nbsp;: le résultat et le salaire dépendent du contrat choisi.</li>
                <li>
                  Ligne 2&nbsp;: <span className="whitespace-nowrap"><M tex="z = e^*(\alpha) + x" />,</span> donc{" "}
                  <M tex="E(z) = e^*(\alpha) + E(x)" />&nbsp;; le salaire{" "}
                  <M tex="w(\alpha) = \alpha" /> est certain.
                </li>
                <li>
                  Ligne 3&nbsp;: <M tex="e^*(\alpha) = 0" /> (étape A) et <M tex="E(x) = 0" />{" "}
                  (slide 5).
                </li>
              </UL>
              <p>
                Le profit attendu vaut <M tex="-\alpha" />&nbsp;: chaque euro de fixe est un euro
                perdu, sans aucun effort en retour.
              </p>
            </>,
            <>
              <p>
                <strong>Solution</strong> (slide 11). Le principal veut le fixe le plus bas
                possible. Mais «&nbsp;un salaire négatif inciterait l'agent à refuser le contrat&nbsp;»&nbsp;:
                c'est la décision de l'étape ②. Le plus petit fixe que l'agent accepte est 0,
                donc&nbsp;:
              </p>
              <MB tex="\boxed{\alpha^* = 0}" />
            </>,
          ]}
        />

        <Callout variant="definition" title="📖 Résultat du Cas 1 (slide 11)">
          <p>
            L'ENPS est <M tex="(s_p^*,\, s_a^*) = (\alpha^* = 0,\; e^*(\alpha) = 0)" />.
          </p>
          <UL>
            <li>
              <span className="whitespace-nowrap"><M tex="s_p^*" />,</span> la stratégie du principal, est le contrat{" "}
              <span className="whitespace-nowrap"><M tex="\alpha^* = 0" />.</span>
            </li>
            <li>
              <span className="whitespace-nowrap"><M tex="s_a^*" />,</span> la stratégie de l'agent, est la règle{" "}
              <M tex="e^*(\alpha) = 0" />&nbsp;: son effort face à <em>chaque</em> contrat possible,
              pas seulement face à <span className="whitespace-nowrap"><M tex="\alpha^*" />.</span> Une stratégie est un plan d'action
              complet (B2.1, S6 slide 15).
            </li>
          </UL>
          <p>
            «&nbsp;Le résultat est que le principal paie un salaire nul et l'agent ne fait aucun
            effort, s'il accepte le contrat&nbsp;» (slide 11). Le «&nbsp;s'il accepte&nbsp;» vient de
            l'étape ②&nbsp;: à <span className="whitespace-nowrap"><M tex="\alpha = 0" />,</span> l'agent obtient exactement{" "}
            <span className="whitespace-nowrap"><M tex="\tilde{u} = 0" />,</span> qu'il signe ou non.
          </p>
          <p className="mt-2">
            Payoffs&nbsp;: <M tex="U_p = 0" /> et <M tex="U_a = 0" /> (tableau du slide 20).{" "}
            <strong>Aucune valeur n'est créée.</strong> C'est l'aléa moral du slide 4&nbsp;: de
            mauvais incitants font perdre du bien-être. Un effort <M tex="e = 1" /> aurait
            pourtant produit un résultat espéré de 1, pour un coût de 0,5 seulement.
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
              text: <>plus élevé&nbsp;: on est plus motivé quand on est bien payé.</>,
              explain: (
                <>
                  Non, c'est le piège classique. Relis l'étape A&nbsp;: la dérivée de{" "}
                  <M tex="\alpha" /> par rapport à <M tex="e" /> est nulle. Le fixe ne figure pas
                  dans l'arbitrage marginal de l'agent.
                </>
              ),
            },
            {
              text: (
                <>
                  toujours <M tex="e^* = 0" />&nbsp;: le fixe ne crée aucun incitant marginal.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exact&nbsp;: <M tex="e^* = 0" /> quel que soit <span className="whitespace-nowrap"><M tex="\alpha" />.</span> La CPO donne{" "}
                  <M tex="-e = 0" /> dans tous les cas. Un fixe généreux transfère de l'argent,
                  mais ne change pas les incitants marginaux (dans ce modèle, l'agent ne se
                  soucie que de <span className="whitespace-nowrap"><M tex="w - c" />).</span>
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§3)">
          <UL>
            <li>
              La résolution du Cas 1 dans l'ordre de la backward induction&nbsp;: effort{" "}
              <M tex="e^*(\alpha) = 0" /> → l'agent signe si <M tex="\alpha \ge 0" /> →{" "}
              <span className="whitespace-nowrap"><M tex="\alpha^* = 0" />.</span>
            </li>
            <li>
              L'ENPS écrit comme au slide 11&nbsp;: <M tex="(\alpha^* = 0,\; e^*(\alpha) = 0)" />.
            </li>
            <li>
              La morale&nbsp;: <strong>un paiement qui ne varie pas avec le résultat n'incite à
              rien</strong>. Ce qui motive l'effort, ce n'est pas le niveau du salaire, mais sa
              sensibilité au résultat.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §4 — Cas 2 : le salaire proportionnel (slides 12-14)          */}
      {/* ============================================================ */}
      <Section
        id="sec-cas2"
        kicker="§ 4"
        title={
          <>
            Cas 2 — le salaire proportionnel&nbsp;: <M tex="w(z) = \beta z" />
          </>
        }
      >
        <Lead>
          Deuxième idée&nbsp;: payer à la commission. Pas de fixe (<span className="whitespace-nowrap"><M tex="\alpha = 0" />)</span>&nbsp;; chaque
          unité de résultat (chaque licence vendue) rapporte <M tex="\beta" /> à l'agent. Cette
          fois, l'effort de l'agent change son propre salaire. Voyons ce que cela change.
        </Lead>

        <H4>
          Étape A — le problème de l'agent <Hyp>H1&nbsp;: l'agent est rationnel</Hyp>
        </H4>
        <p>L'agent qui a signé maximise son utilité espérée (slide 12)&nbsp;:</p>
        <MB tex="\max_{e} \; E(w - c)" />
        <Ou />
        <MB tex="\begin{aligned} E(w - c) &= E\!\left(\beta z - \frac{e^2}{2}\right) \\ &= \beta\, E(e + x) - \frac{e^2}{2} \\ &= \beta e + \beta\, E(x) - \frac{e^2}{2} \\ &= \beta e - \frac{e^2}{2} \end{aligned}" />
        <Steps
          items={[
            <>
              <p>
                <strong>Lignes 1 à 3.</strong> On remplace <M tex="w" /> par{" "}
                <span className="whitespace-nowrap"><M tex="\beta z" />,</span> puis <M tex="z" /> par <span className="whitespace-nowrap"><M tex="e + x" />.</span> La constante{" "}
                <M tex="\beta" /> sort de l'espérance, et le coût <M tex="e^2/2" /> est certain.
                Enfin, <span className="whitespace-nowrap"><M tex="E(e + x) = e + E(x)" />.</span>
              </p>
              <p>
                <strong>Ligne 4.</strong> <M tex="E(x) = 0" />&nbsp;: la chance ne rapporte rien en
                moyenne.
              </p>
            </>,
            <>
              <p>
                <strong>CPO</strong>&nbsp;: on dérive par rapport à <M tex="e" /> et on annule.
              </p>
              <MB tex="\frac{\partial E(w - c)}{\partial e} = \beta - e = 0 \;\;\Rightarrow\;\; \boxed{e^* = \beta}" />
              <p>
                C'est un maximum&nbsp;: <M tex="\beta e - e^2/2" /> est une parabole tournée vers le
                bas, de sommet <span className="whitespace-nowrap"><M tex="e = \beta" />.</span>
              </p>
            </>,
            <>
              <p>
                <strong>Lecture marginale</strong> (une façon de lire la CPO). Une visite de plus
                (une unité d'effort) augmente le résultat espéré de 1, donc le salaire espéré de{" "}
                <M tex="\beta" />&nbsp;: c'est le bénéfice marginal. Elle coûte <M tex="e" />&nbsp;: c'est
                le coût marginal, qui croît avec l'effort. L'agent augmente son effort tant que{" "}
                <span className="whitespace-nowrap"><M tex="\beta > e" />,</span> et s'arrête quand{" "}
                <strong>bénéfice marginal = coût marginal</strong>.
              </p>
              <p>
                Plus la commission est forte, plus il travaille&nbsp;: sa meilleure réponse{" "}
                <M tex="e^*(\beta) = \beta" /> croît avec <span className="whitespace-nowrap"><M tex="\beta" />.</span> Par exemple,{" "}
                <M tex="\beta = 0{,}3" /> donne <span className="whitespace-nowrap"><M tex="e^* = 0{,}3" />.</span>
              </p>
            </>,
          ]}
        />

        <p>
          Dans l'explorateur ci-dessous, bouge <M tex="\beta" />&nbsp;: le sommet de la courbe (l'effort
          choisi) suit <M tex="e^* = \beta" />. La ligne <M tex="\tilde{u} = 0" /> montre aussi
          l'étape ②&nbsp;: tant que le sommet reste au-dessus, l'agent signe.
        </p>
        <EffortExplorer />

        <H4>
          Étape B — le problème du principal{" "}
          <Hyp>H2.1&nbsp;: il pense que l'agent est rationnel</Hyp>
        </H4>
        <p>
          Slide 12&nbsp;: «&nbsp;le principal anticipe la meilleure réponse de l'agent{" "}
          <span className="whitespace-nowrap"><M tex="e^*(\beta) = \beta" />,</span> et conçoit le contrat de manière à maximiser ses
          profits attendus&nbsp;».
        </p>
        <Steps
          items={[
            <>
              <p>
                <strong>Ce que le principal anticipe.</strong>
              </p>
              <UL>
                <li>
                  Étape ③&nbsp;: face au bonus <span className="whitespace-nowrap"><M tex="\beta" />,</span> l'agent fera{" "}
                  <span className="whitespace-nowrap"><M tex="e = \beta" />.</span>
                </li>
                <li>
                  Étape ②&nbsp;: avec cet effort, l'agent obtient en signant{" "}
                  <M tex="E(w - c) = \beta \cdot \beta - \beta^2/2 = \beta^2/2" />, jamais moins
                  que <span className="whitespace-nowrap"><M tex="\tilde{u} = 0" />.</span> Il accepte donc le contrat, quel que soit{" "}
                  <M tex="\beta" /> (à <span className="whitespace-nowrap"><M tex="\beta = 0" />,</span> cela lui est égal).
                </li>
              </UL>
            </>,
            <>
              <p>
                <strong>L'objectif du principal</strong> (slide 13)&nbsp;:
              </p>
              <MB tex="\max_{\beta} \; E(z - w)" />
              <Ou />
              <MB tex="\begin{aligned} E(z - w) &= E\big(z(\beta) - w(\beta)\big) \\ &= E\big(z(\beta)\big) - \beta\, E\big(z(\beta)\big) \\ &= e^*(\beta) + E(x) \\ &\quad\; - \beta\, e^*(\beta) - \beta\, E(x) \\ &= \beta - \beta^2 \end{aligned}" />
              <UL>
                <li>Ligne 1&nbsp;: le résultat et le salaire dépendent du bonus choisi.</li>
                <li>
                  Ligne 2&nbsp;: <span className="whitespace-nowrap"><M tex="w = \beta z" />,</span> et la constante <M tex="\beta" /> sort de
                  l'espérance.
                </li>
                <li>
                  Lignes 3-4&nbsp;: <span className="whitespace-nowrap"><M tex="z = e^*(\beta) + x" />,</span> donc{" "}
                  <M tex="E(z) = e^*(\beta) + E(x)" />.
                </li>
                <li>
                  Ligne 5&nbsp;: <M tex="E(x) = 0" /> et <span className="whitespace-nowrap"><M tex="e^*(\beta) = \beta" />,</span> d'où{" "}
                  <M tex="\beta - \beta \cdot \beta" />.
                </li>
              </UL>
            </>,
            <>
              <p>
                <strong>Le dilemme du principal.</strong> Le profit s'écrit aussi{" "}
                <M tex="(1 - \beta)\,\beta" />&nbsp;: le principal garde la part{" "}
                <M tex="1 - \beta" /> d'un résultat espéré égal à <span className="whitespace-nowrap"><M tex="\beta" />.</span> Un bonus plus
                élevé fait grossir le résultat (l'agent travaille plus), mais réduit la part que
                garde le principal. En chiffres, avec la formule du slide 13&nbsp;:
              </p>
              <MiniTbl
                head={[
                  <M key="b" tex="\beta" />,
                  <span key="e">
                    Effort <M tex="e^* = \beta" />
                  </span>,
                  <span key="k">
                    Part gardée <M tex="1 - \beta" />
                  </span>,
                  <span key="p">
                    Profit <M tex="\beta - \beta^2" />
                  </span>,
                ]}
                rows={[
                  ["0", "0", "1", "0"],
                  ["0,25", "0,25", "0,75", "0,1875"],
                  [
                    <Hl key="b">0,5</Hl>,
                    <Hl key="e">0,5</Hl>,
                    <Hl key="k">0,5</Hl>,
                    <Hl key="p">0,25</Hl>,
                  ],
                  ["0,75", "0,75", "0,25", "0,1875"],
                  ["1", "1", "0", "0"],
                ]}
              />
            </>,
            <>
              <p>
                <strong>CPO</strong> par rapport à <M tex="\beta" />&nbsp;:
              </p>
              <MB tex="\frac{\partial E(z - w)}{\partial \beta} = 1 - 2\beta = 0 \;\;\Rightarrow\;\; \boxed{\beta^* = 1/2}" />
              <p>
                Le tableau le confirme&nbsp;: le profit monte jusqu'à <span className="whitespace-nowrap"><M tex="\beta = 0{,}5" />,</span> puis
                redescend.
              </p>
            </>,
          ]}
        />

        <Callout variant="definition" title="📖 Résultat du Cas 2 (slides 13-14)">
          <p>
            L'ENPS est{" "}
            <M tex="(s_p^*,\, s_a^*) = (\beta^* = 1/2,\; e^*(\beta) = \beta)" /> (slide 13)&nbsp;: le
            principal paie la moitié du résultat et, sur le chemin d'équilibre, l'agent fait{" "}
            <span className="whitespace-nowrap"><M tex="e = \beta^* = 1/2" />.</span> Payoffs (slide 14)&nbsp;:
          </p>
          <MB tex="\begin{aligned} U_p &= E(z - w) = 0{,}5 - 0{,}25 = \mathbf{0{,}25} \\ U_a &= E(w - c) = 0{,}25 - \frac{(0{,}5)^2}{2} = \mathbf{0{,}125} \end{aligned}" />
          <p>
            Pour le principal&nbsp;: le résultat espéré 0,5, moins le salaire espéré{" "}
            <M tex="0{,}5 \times 0{,}5 = 0{,}25" />. Pour l'agent&nbsp;: ce salaire de 0,25, moins le
            coût de son effort, <span className="whitespace-nowrap"><M tex="0{,}5^2/2 = 0{,}125" />.</span>
          </p>
        </Callout>

        <Callout variant="examen" title="🎯 À l'examen : une règle, pas un nombre">
          <p>
            Écris <M tex="s_a^* = e^*(\beta) = \beta" />, comme au slide 13. La stratégie de
            l'agent dit quel effort il fait face à <em>n'importe quel</em> bonus. Le nombre{" "}
            <M tex="1/2" /> n'est que l'effort réalisé sur le chemin d'équilibre, face à{" "}
            <span className="whitespace-nowrap"><M tex="\beta^* = 1/2" />.</span>
          </p>
        </Callout>

        <H4>Ce résultat est-il efficace au sens de Pareto&nbsp;? (slide 14)</H4>
        <p>
          Rappel d'A1&nbsp;: un résultat est <strong>efficace au sens de Pareto</strong> s'il n'existe
          aucun autre résultat techniquement faisable qui rend les deux joueurs plus satisfaits
          (formulation du slide 19). Pour montrer qu'un résultat n'est <em>pas</em> efficace, il
          suffit donc d'en trouver un autre, faisable, que les deux joueurs préfèrent.{" "}
          <TheoryRef chapter="a1" section="pareto" />
        </p>
        <p>
          Le slide 14 en propose un&nbsp;: <span className="whitespace-nowrap"><M tex="e = 1" />,</span> <M tex="\alpha = 0{,}7" /> et{" "}
          <span className="whitespace-nowrap"><M tex="\beta = 0" />.</span> Ses payoffs&nbsp;:
        </p>
        <MB tex="\begin{aligned} U_p &= 1 - 0{,}7 = \mathbf{0{,}3} \;>\; 0{,}25 \\ U_a &= 0{,}7 - \frac{1^2}{2} = \mathbf{0{,}2} \;>\; 0{,}125 \end{aligned}" />
        <p>
          Pour le principal&nbsp;: le résultat espéré 1, moins le salaire 0,7. Pour l'agent&nbsp;: le
          salaire 0,7, moins le coût <span className="whitespace-nowrap"><M tex="1^2/2 = 0{,}5" />.</span>{" "}
          <strong>Les deux joueurs préfèrent ce résultat.</strong> Le slide 14 conclut&nbsp;: «&nbsp;Non, ce
          résultat n'est pas efficace.&nbsp;»
        </p>

        <Callout variant="intuition" title="💡 D'où vient la valeur en plus ?">
          <p>
            L'effort passe de 0,5 à 1. Le résultat espéré gagne 0,5, alors que le coût de
            l'effort ne monte que de 0,125 à 0,5, soit 0,375 de plus. Il reste 0,125 de valeur
            nouvelle, que le contrat partage&nbsp;: 0,05 de plus pour le principal, 0,075 de plus pour
            l'agent (calcul fait avec les chiffres du slide 14). L'effort <M tex="1/2" /> du Cas 2
            est donc trop faible&nbsp;: c'est le sens de «&nbsp;l'effort induit est inefficace&nbsp;» (slide 9).
          </p>
        </Callout>

        <Callout
          variant="attention"
          title="⚠️ Pourquoi ce meilleur résultat n'est-il pas atteint ? (slide 14)"
        >
          <p>
            «&nbsp;Bien que ce résultat soit techniquement faisable, il n'est pas stable étant donné le
            contrôle imparfait exercé par le principal sur l'agent. En effet, ce résultat n'est
            pas <strong>compatible aux incitants</strong> (“incentive compatible”)&nbsp;:{" "}
            <M tex="e = 1" /> n'est pas une meilleure réponse à <M tex="\alpha = 0{,}7" /> et{" "}
            <span className="whitespace-nowrap"><M tex="\beta = 0" />.</span>&nbsp;» (slide 14)
          </p>
          <UL>
            <li>
              Le contrat <span className="whitespace-nowrap"><M tex="\alpha = 0{,}7" />,</span> <M tex="\beta = 0" /> est un salaire fixe.
              Face à lui, l'agent fait comme au Cas 1&nbsp;: <span className="whitespace-nowrap"><M tex="e^*(\alpha) = 0" />.</span> Il
              toucherait 0,7 sans faire d'effort.
            </li>
            <li>
              Le principal ne peut pas écrire «&nbsp;<M tex="e = 1" />&nbsp;» dans le contrat&nbsp;: il
              n'observe pas l'effort (slide 3). Le salaire ne peut dépendre que du résultat{" "}
              <span className="whitespace-nowrap"><M tex="z" />.</span>
            </li>
          </UL>
          <p>
            <strong>Compatible aux incitants</strong> veut donc dire&nbsp;: l'effort prévu est bien la
            meilleure réponse de l'agent au contrat prévu. Un contrat n'obtient que ce que
            l'agent a lui-même intérêt à faire.
          </p>
        </Callout>

        <Quiz
          scope="b2"
          id="q6"
          kicker="Quiz éclair · §4"
          question={
            <p>
              Avec un coût d'effort <M tex="c(e) = e^2/2" /> et un contrat <M tex="w = 2z" />{" "}
              (commission de 200 %), quel effort l'agent choisit-il&nbsp;?
            </p>
          }
          options={[
            {
              text: <M tex="e^* = 1" />,
              explain: (
                <>
                  Non. Relis la meilleure réponse&nbsp;: la CPO <M tex="\beta - e = 0" /> donne{" "}
                  <span className="whitespace-nowrap"><M tex="e^* = \beta" />.</span>
                </>
              ),
            },
            {
              text: <M tex="e^* = 2" />,
              correct: true,
              explain: (
                <>
                  Oui&nbsp;: <span className="whitespace-nowrap"><M tex="e^* = \beta = 2" />.</span> La règle <M tex="e^* = \beta" /> vaut pour
                  tout <span className="whitespace-nowrap"><M tex="\beta" />.</span> Un <M tex="\beta" /> aussi élevé n'est pas dans
                  l'intérêt du principal, mais l'agent, lui, répond mécaniquement aux incitants.
                </>
              ),
            },
            {
              text: <M tex="e^* = 1/2" />,
              explain: (
                <>
                  Non&nbsp;: 1/2 est le <M tex="\beta" /> optimal choisi par le principal au Cas 2,
                  pas la réponse de l'agent à <span className="whitespace-nowrap"><M tex="\beta = 2" />.</span>
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
              Que signifie exactement «&nbsp;le résultat{" "}
              <M tex="(e = 1,\; \alpha = 0{,}7,\; \beta = 0)" /> n'est pas compatible aux
              incitants&nbsp;»&nbsp;?
            </p>
          }
          options={[
            {
              text: <>Qu'il est techniquement impossible à réaliser.</>,
              explain: (
                <>
                  Non&nbsp;: il est techniquement faisable (slide 14), et c'est justement ce qui rend
                  la situation frustrante. Le problème est ailleurs.
                </>
              ),
            },
            {
              text: (
                <>
                  Que l'effort <M tex="e = 1" /> n'est pas la meilleure réponse de l'agent à ce
                  contrat&nbsp;: il dévierait.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement&nbsp;: <M tex="e = 1" /> n'est pas une meilleure réponse à{" "}
                  <M tex="(\alpha = 0{,}7,\; \beta = 0)" />. Face à ce contrat, l'agent dévie vers{" "}
                  <span className="whitespace-nowrap"><M tex="e = 0" />.</span> «&nbsp;Compatible aux incitants&nbsp;»&nbsp;: l'action prévue est bien la
                  meilleure réponse de l'agent au contrat.
                </>
              ),
            },
            {
              text: <>Que l'agent refuserait de signer ce contrat.</>,
              explain: (
                <>
                  Non&nbsp;: l'agent signerait volontiers. Avec <span className="whitespace-nowrap"><M tex="e = 1" />,</span> il aurait{" "}
                  <span className="whitespace-nowrap"><M tex="U_a = 0{,}2" />,</span> et même <M tex="0{,}7" /> en ne faisant aucun effort,
                  bien plus que <span className="whitespace-nowrap"><M tex="\tilde{u} = 0" />.</span> La participation n'est pas le problème.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§4)">
          <UL>
            <li>
              Le calcul complet, dans l'ordre&nbsp;: <M tex="e^*(\beta) = \beta" /> (agent) → l'agent
              signe, car <M tex="E(w - c) = \beta^2/2 \ge 0" /> → CPO du principal,{" "}
              <M tex="\beta^* = 1/2" /> → payoffs (0,25&nbsp;; 0,125).
            </li>
            <li>
              L'ENPS écrit comme au slide 13&nbsp;:{" "}
              <M tex="(\beta^* = 1/2,\; e^*(\beta) = \beta)" />.
            </li>
            <li>
              Montrer que ce résultat <strong>n'est pas efficace au sens de Pareto</strong> avec
              le contre-exemple du slide 14&nbsp;: <M tex="(e = 1,\; \alpha = 0{,}7,\; \beta = 0)" />{" "}
              donne (0,3&nbsp;; 0,2).
            </li>
            <li>
              Expliquer «&nbsp;<strong>compatible aux incitants</strong>&nbsp;» et pourquoi ce contre-exemple
              ne l'est pas.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §5 — Cas 3 : le salaire linéaire (slides 15-19)               */}
      {/* ============================================================ */}
      <Section
        id="sec-cas3"
        kicker="§ 5"
        title={
          <>
            Cas 3 — le salaire linéaire&nbsp;: <M tex="w(z) = \alpha + \beta z" />
          </>
        }
      >
        <Lead>
          On combine maintenant les deux leviers&nbsp;: un fixe <M tex="\alpha" /> <em>et</em> un
          bonus <span className="whitespace-nowrap"><M tex="\beta" />.</span> Le Cas 2 a donné l'indice&nbsp;: <M tex="\beta" /> décide de
          l'effort. Le fixe <span className="whitespace-nowrap"><M tex="\alpha" />,</span> lui, pourra servir à répartir l'argent. Deux
          leviers, deux rôles.
        </Lead>

        <H4>
          Étape A — le problème de l'agent <Hyp>H1&nbsp;: l'agent est rationnel</Hyp>
        </H4>
        <p>Rien de neuf (slide 15)&nbsp;:</p>
        <MB tex="\max_{e} \; E(w - c)" />
        <Ou />
        <MB tex="\begin{aligned} E(w - c) &= E\!\left(\alpha + \beta z - \frac{e^2}{2}\right) \\ &= \alpha + \beta e - \frac{e^2}{2} \end{aligned}" />
        <Steps
          items={[
            <>
              <p>
                <strong>Le calcul du Cas 2, plus la constante <span className="whitespace-nowrap"><M tex="\alpha" />.</span></strong> On a{" "}
                <M tex="E(\alpha + \beta z) = \alpha + \beta\,E(e + x) = \alpha + \beta e" />, car{" "}
                <span className="whitespace-nowrap"><M tex="E(x) = 0" />.</span>
              </p>
            </>,
            <>
              <p>
                <strong>CPO</strong>&nbsp;: <M tex="\alpha" /> disparaît en dérivant (c'est une
                constante), et l'on retrouve «&nbsp;de nouveau&nbsp;» (slide 15)&nbsp;:
              </p>
              <MB tex="\frac{\partial E(w - c)}{\partial e} = \beta - e = 0 \;\;\Rightarrow\;\; \boxed{e^* = \beta}" />
              <p>
                Le principal anticipe donc la meilleure réponse de l'agent{" "}
                <M tex="e^*(\alpha, \beta) = \beta" /> (slide 15). Le fixe n'a aucun effet sur
                l'effort&nbsp;: seul le bonus compte. C'est ce que montrait l'explorateur du §&nbsp;4.
              </p>
            </>,
          ]}
        />

        <H4>
          Étape B — le problème du principal{" "}
          <Hyp>H2.1&nbsp;: il pense que l'agent est rationnel</Hyp>
        </H4>
        <p>
          Slide 16&nbsp;: «&nbsp;le problème du principal est de trouver le contrat qui maximise ses
          profits attendus étant donné la réaction anticipée de l'agent&nbsp;»&nbsp;:
        </p>
        <MB tex="\max_{\alpha,\,\beta} \; E(z - w)" />
        <p>
          «&nbsp;Cet objectif est maximisé sous deux contraintes&nbsp;: la contrainte de participation (CP)
          et la contrainte de compatibilité aux incitants (CI), qui prend en compte la réaction
          de l'agent&nbsp;» (slide 16&nbsp;; le slide écrit «&nbsp;comptabilité&nbsp;», une coquille pour
          «&nbsp;compatibilité&nbsp;», cf. slide 14 «&nbsp;compatible aux incitants&nbsp;»). C'est la structure à
          retenir de tout le chapitre.
        </p>
        <VocabGrid
          items={[
            {
              term: "Contrainte de participation (CP)",
              body: (
                <>
                  <MB tex="E(w - c) \ge \tilde{u}" />
                  En clair&nbsp;: en signant, l'agent doit obtenir au moins son utilité par défaut{" "}
                  <M tex="\tilde{u}" /> (ce qu'il obtient s'il refuse), sinon il refuse de signer.
                  C'est la décision de l'étape ② de l'arbre, écrite comme une contrainte.
                  Remarque du cours (slide 16)&nbsp;: la CP était satisfaite dans les cas 1 et 2. Au
                  Cas 1, <M tex="U_a = 0 = \tilde{u}" /> (de justesse)&nbsp;; au Cas 2,{" "}
                  <M tex="U_a = 0{,}125 > \tilde{u} = 0" />.
                </>
              ),
            },
            {
              term: "Contrainte de compatibilité aux incitants (CI)",
              body: (
                <>
                  <MB tex="e^*(\alpha, \beta) = \beta" />
                  En clair&nbsp;: le principal ne peut pas imposer l'effort&nbsp;; il doit prendre la
                  réaction de l'agent, <M tex="e^*(\alpha, \beta) = \beta" />, comme une donnée.
                  C'est la meilleure réponse de l'étape ③, calculée à l'étape A.
                </>
              ),
            },
          ]}
        />
        <p>
          Pourquoi la CP compte-t-elle maintenant&nbsp;? Au Cas 3, le fixe peut devenir négatif. Le
          principal a donc intérêt à baisser <span className="whitespace-nowrap"><M tex="\alpha" />,</span> et seule la CP l'arrête&nbsp;: en
          dessous d'un certain fixe, l'agent ne signe plus.
        </p>

        <Callout variant="intuition" title="💡 L'astuce décisive : saturer la CP (slide 16)">
          <p>
            «&nbsp;À l'optimum, le principal choisira le contrat de manière à ce que la contrainte de
            participation soit satisfaite de justesse. Autrement dit, il s'arrange pour que
            l'utilité espérée obtenue par l'agent s'il signe le contrat soit juste égale à{" "}
            <span className="whitespace-nowrap"><M tex="\tilde{u} = 0" />.</span>&nbsp;» (slide 16)
          </p>
          <p className="mt-2">
            Pourquoi&nbsp;? Si l'agent obtenait plus que <span className="whitespace-nowrap"><M tex="\tilde{u}" />,</span> le principal pourrait
            baisser un peu <span className="whitespace-nowrap"><M tex="\alpha" />.</span> L'agent signerait encore (il resterait au-dessus de{" "}
            <span className="whitespace-nowrap"><M tex="\tilde{u}" />),</span> son effort ne bougerait pas (il ne dépend que de{" "}
            <span className="whitespace-nowrap"><M tex="\beta" />),</span> et le principal gagnerait exactement ce qu'il retire à l'agent. Il
            baisse donc <M tex="\alpha" /> jusqu'à ce que l'agent obtienne pile{" "}
            <span className="whitespace-nowrap"><M tex="\tilde{u}" />.</span>
          </p>
        </Callout>

        <p>La résolution suit alors quatre pas (slides 17-18).</p>
        <Steps
          items={[
            <>
              <p>
                <strong>CP saturée</strong> (slide 17)&nbsp;: on écrit l'égalité et on isole{" "}
                <span className="whitespace-nowrap"><M tex="\alpha" />.</span>
              </p>
              <MB tex="\begin{aligned} E(w - c) &= 0 \\ E(\alpha + \beta z) &= c(e) \\ \alpha &= \frac{e^2}{2} - \beta e \end{aligned}" />
              <UL>
                <li>
                  Ligne 2&nbsp;: <M tex="w - c = \alpha + \beta z - c(e)" />, et le coût est certain.
                </li>
                <li>
                  Ligne 3&nbsp;: <M tex="E(\alpha + \beta z) = \alpha + \beta e" />, donc{" "}
                  <M tex="\alpha + \beta e = e^2/2" />.
                </li>
              </UL>
              <p>
                En mots&nbsp;: le fixe est réglé pour que le salaire espéré couvre tout juste le coût
                de l'effort. «&nbsp;La CP lie les valeurs optimales de <M tex="\alpha" /> et de{" "}
                <span className="whitespace-nowrap"><M tex="\beta" />.</span> On peut donc remplacer <M tex="\alpha" /> dans l'objectif du
                principal, qui ne maximise alors son profit que par rapport à{" "}
                <span className="whitespace-nowrap"><M tex="\beta" />.</span>&nbsp;» (slide 17)
              </p>
            </>,
            <>
              <p>
                <strong>Substitution de <M tex="\alpha" /></strong> (slide 17). On note{" "}
                <M tex="\alpha(\beta)" />&nbsp;: le fixe n'est plus libre, il découle de{" "}
                <M tex="\beta" /> par la CP.
              </p>
              <MB tex="\max_{\alpha(\beta),\,\beta} \; E(z - w)" />
              <Ou />
              <MB tex="\begin{aligned} E(z - w) &= E\big(z - (\alpha + \beta z)\big) \\ &= E\big(e + x - (\alpha + \beta(e + x))\big) \\ &= e + E(x) - \left(\frac{e^2}{2} - \beta e\right) \\ &\quad\; - \beta e^*(\beta) - \beta E(x) \\ &= e - \frac{e^2}{2} \end{aligned}" />
              <UL>
                <li>
                  Ligne 1&nbsp;: on remplace <M tex="w" /> par <span className="whitespace-nowrap"><M tex="\alpha + \beta z" />.</span>
                </li>
                <li>
                  Ligne 2&nbsp;: on remplace <M tex="z" /> par <span className="whitespace-nowrap"><M tex="e + x" />.</span>
                </li>
                <li>
                  Lignes 3-4&nbsp;: on prend l'espérance. Le bloc entre parenthèses est le{" "}
                  <M tex="\alpha" /> tiré de la CP&nbsp;; <M tex="\beta(e + x)" /> donne{" "}
                  <M tex="\beta e^*(\beta) + \beta E(x)" />, car l'agent fait sa meilleure
                  réponse.
                </li>
                <li>
                  Ligne 5&nbsp;: <span className="whitespace-nowrap"><M tex="E(x) = 0" />,</span> et avec <span className="whitespace-nowrap"><M tex="e = e^*(\beta)" />,</span> les deux
                  termes en <M tex="\beta e" /> s'annulent&nbsp;: le <M tex="+\beta e" /> qui sort de
                  la parenthèse compense le <span className="whitespace-nowrap"><M tex="-\beta e^*(\beta)" />.</span>
                </li>
              </UL>
              <p>
                Résultat remarquable&nbsp;: le profit du principal devient <span className="whitespace-nowrap"><M tex="e - e^2/2" />,</span> la
                valeur créée par l'effort (le résultat espéré <span className="whitespace-nowrap"><M tex="e" />)</span> moins son coût (
                <span className="whitespace-nowrap"><M tex="e^2/2" />).</span> C'est le <strong>surplus total</strong> de la relation, le
                «&nbsp;gâteau&nbsp;». Logique&nbsp;: la CP saturée laisse exactement 0 à l'agent, donc le
                principal récupère tout le gâteau. Il a intérêt à ce qu'il soit le plus gros
                possible.
              </p>
            </>,
            <>
              <p>
                <strong>On injecte la CI, puis CPO sur <M tex="\beta" /></strong> (slide 18). «&nbsp;En
                introduisant la CI dans l'objectif du principal, on obtient&nbsp;»&nbsp;:
              </p>
              <MB tex="\begin{aligned} E(z - w) &= e - \frac{e^2}{2} \\ &= \beta - \frac{\beta^2}{2} \end{aligned}" />
              <MB tex="\frac{\partial E(z - w)}{\partial \beta} = 1 - \beta = 0 \;\;\Rightarrow\;\; \boxed{\beta^* = 1}" />
            </>,
            <>
              <p>
                <strong>On trouve ensuite <M tex="\alpha^*" /> avec la CP</strong> (slide 18), en
                remplaçant <M tex="e" /> par <M tex="\beta" /> (CI), puis <M tex="\beta" /> par 1&nbsp;:
              </p>
              <MB tex="\begin{aligned} \alpha^* &= \frac{e^2}{2} - \beta^* e \\ &= \frac{\beta^2}{2} - \beta^2 = \boxed{-0{,}5} \end{aligned}" />
              <p>
                Un fixe <strong>négatif</strong>&nbsp;: c'est l'agent qui paie 0,5 au principal. On
                l'interprète juste après (la franchise).
              </p>
            </>,
          ]}
        />

        <Callout variant="definition" title="📖 Résultat du Cas 3 (slides 18-19)">
          <p>
            L'ENPS est <M tex="(s_p^*,\, s_a^*) = (w^*(z) = -0{,}5 + z,\; e^*(w) = \beta)" />{" "}
            (slide 18).
          </p>
          <UL>
            <li>
              <M tex="s_p^*" />&nbsp;: le contrat <span className="whitespace-nowrap"><M tex="w^*(z) = -0{,}5 + z" />,</span> c'est-à-dire{" "}
              <M tex="\alpha^* = -0{,}5" /> et <span className="whitespace-nowrap"><M tex="\beta^* = 1" />.</span>
            </li>
            <li>
              <M tex="s_a^*" />&nbsp;: la règle <M tex="e^*(w) = \beta" /> («&nbsp;face à un contrat de
              bonus <span className="whitespace-nowrap"><M tex="\beta" />,</span> je fais l'effort <M tex="\beta" />&nbsp;»). Sur le chemin
              d'équilibre, l'agent fait donc <span className="whitespace-nowrap"><M tex="e = 1" />.</span>
            </li>
          </UL>
          <p>Payoffs (slide 19)&nbsp;:</p>
          <MB tex="\begin{aligned} U_p &= E(z - w) = 1 - (-0{,}5 + 1) = \mathbf{0{,}5} \\ U_a &= E(w - c) = -0{,}5 + 1 - \frac{1^2}{2} = \mathbf{0} \end{aligned}" />
          <p>
            Pour le principal&nbsp;: le résultat espéré 1, moins le salaire espéré{" "}
            <span className="whitespace-nowrap"><M tex="-0{,}5 + 1 = 0{,}5" />.</span> Pour l'agent&nbsp;: ce salaire de 0,5, moins le coût{" "}
            <span className="whitespace-nowrap"><M tex="1^2/2 = 0{,}5" />.</span> Il obtient exactement <span className="whitespace-nowrap"><M tex="\tilde{u} = 0" />,</span> comme le
            veut la CP saturée.
          </p>
        </Callout>

        <H4>
          Le gâteau&nbsp;: pourquoi <M tex="e = 1" /> est l'effort efficace
        </H4>
        <p>
          Additionne les deux payoffs. Le salaire <M tex="w" /> est payé par l'un et reçu par
          l'autre&nbsp;: il disparaît de la somme.
        </p>
        <MB tex="\begin{aligned} U_p + U_a &= E(z - w) + E(w - c) \\ &= E(z) - c(e) \\ &= e - \frac{e^2}{2} \end{aligned}" />
        <p>
          Notons ce surplus total <span className="whitespace-nowrap"><M tex="S(e) = e - e^2/2" />.</span> Il ne dépend que de l'effort&nbsp;: à
          effort donné, le contrat ne fait que le répartir. Mais l'agent choisit{" "}
          <M tex="e = \beta" /> (CI)&nbsp;: <M tex="\beta" /> fixe donc la taille du gâteau, et{" "}
          <M tex="\alpha" /> sert ensuite à le partager.
        </p>
        <p>
          Le gâteau culmine en <M tex="e = 1" /> (CPO&nbsp;: <span className="whitespace-nowrap"><M tex="1 - e = 0" />,</span> là où le bénéfice
          marginal 1 égale le coût marginal <span className="whitespace-nowrap"><M tex="e" />)</span> et vaut alors 0,5. C'est l'effort
          «&nbsp;efficace&nbsp;» du slide 9&nbsp;: le Cas 3 l'obtient (<span className="whitespace-nowrap"><M tex="e = 1" />),</span> le Cas 2 reste en
          dessous (<span className="whitespace-nowrap"><M tex="e = 1/2" />),</span> le Cas 1 à zéro.
        </p>

        <SurplusExplorer />

        <H4>L'interprétation du cours&nbsp;: franchise et «&nbsp;residual claimant&nbsp;» (slide 19)</H4>
        <Callout variant="definition" title="📖 Le contrat optimal, en mots (slide 19)">
          <p>
            «&nbsp;Ce contrat est tel que l'agent paie une <strong>franchise</strong> (
            <span className="whitespace-nowrap"><M tex="\alpha = -0{,}5" />)</span> au principal et devient le seul propriétaire du résultat
            de ses efforts (<em>residual claimant</em>). En d'autres termes, une fois la franchise
            acquittée, l'agent peut garder tout le résultat <span className="whitespace-nowrap"><M tex="z" />.</span>&nbsp;» (slide 19)
          </p>
          <UL>
            <li>
              <strong>Residual claimant</strong>&nbsp;: celui qui a droit au «&nbsp;résidu&nbsp;», ce qui reste
              du résultat une fois les autres payés. Ici, le principal est payé d'avance (la
              franchise)&nbsp;; tout le reste revient à l'agent.
            </li>
            <li>
              <strong>Le taux de bonus</strong> <M tex="\beta = 1" />&nbsp;: «&nbsp;l'agent peut garder le
              résultat de ses efforts, ce qui induit un effort optimal&nbsp;» (slide 19). Chaque unité
              de résultat en plus lui revient en entier&nbsp;: il fait l'effort qui maximise le
              gâteau, <span className="whitespace-nowrap"><M tex="e = 1" />.</span>
            </li>
            <li>
              <strong>La franchise</strong> <M tex="\alpha = -0{,}5" />&nbsp;: «&nbsp;la valeur de la
              franchise est fixée par le principal de manière à extraire tout le surplus de leur
              association (<span className="whitespace-nowrap"><M tex="U_a = \tilde{u}" />)</span>&nbsp;» (slide 19). Le principal encaisse 0,5,
              soit tout le gâteau&nbsp;; l'agent garde <span className="whitespace-nowrap"><M tex="z - 0{,}5" />,</span> qui couvre en moyenne
              tout juste le coût de son effort.
            </li>
          </UL>
          <p>
            <strong>Exemple du cours&nbsp;: la licence de taxi</strong> (slide 19). Le chauffeur paie
            une somme fixe pour sa licence (ou la location du véhicule), puis garde l'intégralité
            de ses recettes&nbsp;: <span className="whitespace-nowrap"><M tex="\alpha < 0" />,</span> <span className="whitespace-nowrap"><M tex="\beta = 1" />.</span> Autre exemple
            (illustratif, pas dans les slides)&nbsp;: le salon de coiffure qui loue ses fauteuils à
            des coiffeurs indépendants.
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ Le verdict d'efficacité (slide 19)">
          <p>
            «&nbsp;Le résultat est efficace au sens de Pareto&nbsp;: il n'existe aucun autre résultat
            techniquement faisable qui rend les deux joueurs plus satisfaits.&nbsp;» (slide 19)
          </p>
          <p className="mt-2">
            Pourquoi&nbsp;? Quel que soit le résultat, <M tex="U_p + U_a = S(e) \le 0{,}5" />. Ici, la
            somme vaut déjà 0,5 (0,5 pour le principal, 0 pour l'agent). Pour donner plus à l'un,
            il faudrait donc prendre à l'autre. Autre façon de le voir (A1, S1 slide 41, condition
            2)&nbsp;: un résultat qui maximise la somme des utilités est efficace.
          </p>
          <p className="mt-2">
            Efficace ne veut pas dire équitable&nbsp;: l'agent obtient 0. Le critère de Pareto ne dit
            rien sur l'égalité (S1 slide 42).
          </p>
        </Callout>

        <p>
          À toi de jouer le principal dans le laboratoire ci-dessous. Augmente d'abord{" "}
          <M tex="\beta" />&nbsp;: l'effort et le gâteau grossissent. Puis <strong>baisse</strong>{" "}
          <M tex="\alpha" /> (la franchise) jusqu'à ce que l'agent obtienne pile{" "}
          <M tex="\tilde{u} = 0" />&nbsp;: c'est la CP saturée.
        </p>
        <ContractLab />

        <Quiz
          scope="b2"
          id="q8"
          kicker="Quiz éclair · §5"
          question={
            <p>
              Pourquoi le principal choisit-il de saturer la contrainte de participation (donner
              exactement <M tex="\tilde{u} = 0" /> à l'agent)&nbsp;?
            </p>
          }
          options={[
            {
              text: <>Parce que la CI l'y oblige.</>,
              explain: (
                <>
                  Non. La CI est une égalité, la réaction de l'agent&nbsp;: le principal la prend en
                  compte, il ne la «&nbsp;sature&nbsp;» pas. C'est la CP, une inégalité, que le principal
                  ajuste au plus juste.
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
                  Exact. Tout surplus laissé à l'agent peut être récupéré en baissant{" "}
                  <span className="whitespace-nowrap"><M tex="\alpha" />,</span> sans changer ni l'acceptation ni l'effort (qui ne dépend que
                  de <span className="whitespace-nowrap"><M tex="\beta" />).</span> Le principal ajuste donc <M tex="\alpha" /> pour que{" "}
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
                  Non&nbsp;: baisser <M tex="\alpha" /> ne change pas l'effort (
                  <M tex="e^* = \beta" /> ne dépend pas de <span className="whitespace-nowrap"><M tex="\alpha" />).</span> C'est justement
                  pour cela que l'extraction ne coûte rien au principal.
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
              Un chauffeur de taxi loue son véhicule 90 € par jour et garde toutes ses recettes
              (chiffre illustratif). Dans notre modèle, cela correspond à...
            </p>
          }
          options={[
            {
              text: (
                <>
                  <M tex="\alpha < 0" /> et <M tex="\beta = 1" />&nbsp;: franchise + residual
                  claimant.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui&nbsp;: la location est la franchise, donc un <M tex="\alpha" /> négatif&nbsp;;
                  «&nbsp;garde toutes ses recettes&nbsp;» veut dire <span className="whitespace-nowrap"><M tex="\beta = 1" />,</span> residual
                  claimant. C'est la forme du contrat optimal du Cas 3.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\alpha > 0" /> et <M tex="\beta = 0" />&nbsp;: salaire fixe.
                </>
              ),
              explain: (
                <>
                  Non&nbsp;: avec <span className="whitespace-nowrap"><M tex="\beta = 0" />,</span> ses recettes ne lui rapporteraient rien.
                  C'est le contraire de «&nbsp;garde toutes ses recettes&nbsp;».
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\alpha < 0" /> et <span className="whitespace-nowrap"><M tex="\beta = 1/2" />.</span>
                </>
              ),
              explain: (
                <>
                  Pas tout à fait&nbsp;: <M tex="\beta = 1/2" /> voudrait dire qu'il reverse la moitié
                  de chaque course. Ici, il garde tout, après la location fixe.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§5)">
          <UL>
            <li>
              Énoncer la <strong>CP</strong> et la <strong>CI</strong>, avec leurs formules et
              leur sens&nbsp;: la CP traduit la décision de signer (étape ②), la CI la réaction
              d'effort (étape ③).
            </li>
            <li>
              Refaire la résolution complète des slides 15-18&nbsp;: CI (<span className="whitespace-nowrap"><M tex="e^* = \beta" />)</span> →
              CP saturée, <M tex="\alpha = e^2/2 - \beta e" /> → substitution de{" "}
              <M tex="\alpha" />&nbsp;: l'objectif devient le gâteau <M tex="e - e^2/2" /> → on injecte
              la CI → CPO sur <M tex="\beta" />&nbsp;: <M tex="\beta^* = 1" /> →{" "}
              <M tex="\alpha^* = -0{,}5" /> par la CP.
            </li>
            <li>
              Écrire l'ENPS comme au slide 18&nbsp;:{" "}
              <M tex="(w^*(z) = -0{,}5 + z,\; e^*(w) = \beta)" />, avec les payoffs (0,5&nbsp;; 0).
            </li>
            <li>
              Interpréter&nbsp;: <strong>franchise</strong>, <strong>residual claimant</strong>, la
              licence de taxi, et le verdict «&nbsp;<strong>efficace au sens de Pareto</strong>&nbsp;».
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* §6 — Vue d'ensemble (slide 20)                                */}
      {/* ============================================================ */}
      <Section id="sec-recap" kicker="§ 6" title="Vue d'ensemble — les trois contrats côte à côte">
        <Lead>
          Le slide 20 résume les trois cas dans un tableau. Sache le reconstruire de tête&nbsp;:
          chaque ligne se retrouve par la même backward induction (l'effort de l'agent, puis sa
          décision de signer, puis le contrat du principal).
        </Lead>

        <MiniTbl
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
        <p className="text-sm text-muted-foreground">
          Le tableau «&nbsp;Résumé&nbsp;» du slide 20 (sur téléphone, il défile horizontalement).
        </p>

        <PayoffComparison />

        <p>
          Et le Cas 1, en (0&nbsp;; 0)&nbsp;? Les slides ne posent pas la question. Mais le résultat (0,3&nbsp;;
          0,2) du slide 14 donne là aussi plus aux deux joueurs&nbsp;: le Cas 1 n'est pas efficace non
          plus (remarque, pas dans les slides).
        </p>

        <Callout
          variant="definition"
          title="📖 Le point de comparaison : le cas d'information parfaite"
        >
          <p>
            Dans les slides 20 et 22, le <strong>cas d'information parfaite</strong> est la
            situation de référence où le principal <em>observerait</em> l'effort <M tex="e" /> de
            l'agent, et pourrait donc l'écrire dans le contrat. C'est l'inverse de l'information
            asymétrique du slide 3 («&nbsp;le principal n'observe pas l'action de l'agent&nbsp;»).
            «&nbsp;Information imparfaite&nbsp;» (slide 22) veut dire que le principal n'observe pas{" "}
            <span className="whitespace-nowrap"><M tex="e" />.</span>
          </p>
          <p className="mt-2">
            <strong>Calcul de vérification (pas dans les slides).</strong> Si le principal voyait{" "}
            <span className="whitespace-nowrap"><M tex="e" />,</span> il pourrait exiger l'effort qui maximise le gâteau, <span className="whitespace-nowrap"><M tex="e = 1" />,</span>{" "}
            et payer juste le coût de cet effort, <M tex="w = c(1) = 0{,}5" /> (CP saturée). Son
            profit serait <M tex="E(z) - w = 1 - 0{,}5 = 0{,}5" />, le gâteau maximal{" "}
            <M tex="S(1)" /> du §&nbsp;5.
          </p>
          <UL>
            <li>
              <strong>Agent neutre au risque</strong>&nbsp;: la franchise atteint ce même profit de 0,5
              sans observer <M tex="e" /> (slide 20).
            </li>
            <li>
              <strong>Agent averse au risque</strong>&nbsp;: le principal n'atteint plus ce 0,5, car il
              doit payer la compensation pour le risque (slide 22, §&nbsp;7).
            </li>
          </UL>
          <p className="mt-2">
            <strong>Attention au vocabulaire.</strong> En B2.1 (S6, slides 7 et 36),
            «&nbsp;information parfaite / imparfaite&nbsp;» décrit la structure d'un jeu&nbsp;: chaque joueur
            connaît-il les actions passées au moment de jouer&nbsp;? Ici, ces mots disent si le
            principal observe l'effort de l'agent. <TheoryRef chapter="bseq" section="s2" />
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ La conclusion du cours (slide 20)">
          <p>
            «&nbsp;Lorsque l'agent est neutre au risque,{" "}
            <strong>
              le contrat linéaire optimal permet au principal d'atteindre le même profit attendu
              que dans le cas d'information parfaite
            </strong>
            .&nbsp;» (slide 20)
          </p>
          <p className="mt-2">
            Autrement dit&nbsp;: avec un agent neutre au risque, ne pas observer l'effort ne coûte rien
            au principal, en profit attendu (0,5 dans les deux cas). Avec la franchise, l'agent
            fait de lui-même l'effort efficace <span className="whitespace-nowrap"><M tex="e = 1" />,</span> celui que le principal aurait
            exigé s'il avait pu l'observer.
          </p>
        </Callout>

        <Callout variant="attention" title="⚠️ Qui porte le risque ? (slide 20)">
          <p>
            «&nbsp;Ce contrat optimal <strong>transfère tout le risque</strong> (lié à <span className="whitespace-nowrap"><M tex="x" />)</span>{" "}
            <strong>sur l'agent</strong>.&nbsp;» (slide 20) Avec <span className="whitespace-nowrap"><M tex="e = 1" />,</span> on a{" "}
            <M tex="z = 1 + x" /> et <M tex="w = -0{,}5 + z = 0{,}5 + x" />&nbsp;:
          </p>
          <UL>
            <li>
              Le principal reçoit <M tex="z - w = z - (-0{,}5 + z) = 0{,}5" />{" "}
              <em>quoi qu'il arrive</em>&nbsp;: <span className="whitespace-nowrap"><M tex="U_p = E(0{,}5) = 0{,}5" />,</span> «&nbsp;pas
              d'incertitude&nbsp;». La chance <M tex="x" /> disparaît de son profit.
            </li>
            <li>
              L'agent a <M tex="U_a = 0" /> en espérance, «&nbsp;mais l'utilité obtenue{" "}
              <M tex="w - c" /> peut être différente de <M tex="\tilde{u} = 0" /> si{" "}
              <M tex="x" /> est différent de 0&nbsp;» (slide 20). En effet,{" "}
              <M tex="w - c = (0{,}5 + x) - 0{,}5 = x" />. Bonne année, son utilité nette{" "}
              <M tex="w - c = x" /> est positive&nbsp;; mauvaise année, elle est négative&nbsp;: une fois
              la franchise payée, ce qu'il garde ne couvre plus le coût de son effort (son salaire{" "}
              <span className="whitespace-nowrap"><M tex="w = 0{,}5 + x" />,</span> lui, ne devient négatif que si <span className="whitespace-nowrap"><M tex="x < -0{,}5" />).</span>
            </li>
          </UL>
          <p className="mt-2">
            Comparons les trois contrats optimaux, de bonus{" "}
            <span className="whitespace-nowrap"><M tex="\beta^* = 0" />,</span>{" "}
            <M tex="1/2" /> et <span className="whitespace-nowrap"><M tex="1" />,</span> une année
            où la chance vaut <M tex="x" /> (calcul, pas dans les slides)&nbsp;:
          </p>
          <MiniTbl
            head={[
              "Cas",
              <span key="p">
                Principal
                <br />
                <M tex="z - w" />
              </span>,
              <span key="a">
                Agent
                <br />
                <M tex="w - c" />
              </span>,
            ]}
            rows={[
              [
                "Cas 1",
                <M key="p" tex="x" />,
                <M key="a" tex="0" />,
              ],
              [
                "Cas 2",
                <M key="p" tex="0{,}25 + 0{,}5\,x" />,
                <M key="a" tex="0{,}125 + 0{,}5\,x" />,
              ],
              [
                "Cas 3",
                <M key="p" tex="0{,}5" />,
                <M key="a" tex="x" />,
              ],
            ]}
          />
          <p>
            L'agent encaisse la part <M tex="\beta" /> de la chance&nbsp;: rien au Cas 1, la moitié au
            Cas 2, tout au Cas 3. C'est la phrase du slide 21&nbsp;: plus le salaire dépend de{" "}
            <span className="whitespace-nowrap"><M tex="z" />,</span> plus l'agent supporte une grande part du risque.
          </p>
          <p className="mt-2">
            Tant que l'agent est neutre au risque, cela lui est égal&nbsp;: seule compte la moyenne,{" "}
            <span className="whitespace-nowrap"><M tex="E(w - c) = 0" />.</span> Mais s'il n'aime pas le risque&nbsp;? C'est le §&nbsp;7.
          </p>
        </Callout>

        <LuckSplit />

        <Quiz
          scope="b2"
          id="q10"
          kicker="Quiz éclair · §6"
          question={
            <p>
              Dans le Cas 3, une mauvaise année où <span className="whitespace-nowrap"><M tex="x = -0{,}3" />,</span> le profit{" "}
              <em>réalisé</em> du principal est...
            </p>
          }
          options={[
            {
              text: <>0,2&nbsp;: la malchance ampute son profit.</>,
              explain: (
                <>
                  Non. Refais le calcul&nbsp;: <M tex="z - w = z - (-0{,}5 + z)" />. Les{" "}
                  <M tex="z" /> s'annulent, et la chance <M tex="x" /> avec eux.
                </>
              ),
            },
            {
              text: <>0,5&nbsp;: exactement comme prévu&nbsp;; c'est l'agent qui encaisse le choc.</>,
              correct: true,
              explain: (
                <>
                  Exact&nbsp;: <M tex="z - (-0{,}5 + z) = 0{,}5" /> quel que soit <span className="whitespace-nowrap"><M tex="x" />.</span> Avec{" "}
                  <span className="whitespace-nowrap"><M tex="\beta = 1" />,</span> toute la chance passe à l'agent&nbsp;: son utilité nette vaut{" "}
                  <span className="whitespace-nowrap"><M tex="w - c = x = -0{,}3" />.</span> Le principal touche un montant certain, comme
                  le loueur de taxis du quiz précédent, qui encaisse ses 90 € par jour quelles
                  que soient les recettes.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§6)">
          <UL>
            <li>Reconstruire de tête le tableau du slide 20.</li>
            <li>
              Énoncer la conclusion du slide 20, et dire ce qu'est ici le «&nbsp;cas d'information
              parfaite&nbsp;»&nbsp;: le principal observerait l'effort.
            </li>
            <li>
              Expliquer qui porte le risque au Cas 3&nbsp;: le principal touche 0,5 quoi qu'il arrive,
              l'agent encaisse toute la chance (<span className="whitespace-nowrap"><M tex="w - c = x" />).</span>
            </li>
          </UL>
        </Callout>
      </Section>
    </>
  );
}
