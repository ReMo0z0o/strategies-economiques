/*
 * Chapitre B2 (jeux séquentiels) — PartApplications (sections affichées dans la page du chapitre).
 * § 5 les primaires et le vote stratégique (slides 19-25, question du slide 2) ·
 * § 6 au laboratoire : jeu de base, ultimatum, centipède (slides 26-33). Deck S6.
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { TheoryRef } from "@/components/course/TheoryRef";
import { H4, CardGrid } from "./ui";
import { PrimariesBackward } from "./anim/PrimariesBackward";
import { BaseGameLab } from "./anim/BaseGameLab";
import { UltimatumLab } from "./anim/UltimatumLab";
import { CentipedeLab } from "./anim/CentipedeLab";

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Sous-titre de second niveau à l'intérieur d'une section. */
function H5({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-6 text-[16.5px] font-bold tracking-tight">{children}</h4>;
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Une étape d'un raisonnement : pastille, titre (le « quoi »), puis l'explication. */
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

/** Tableau compact (largeur minimale réglable) pour les petites grilles de chiffres. */
function MiniTbl({
  head,
  rows,
  minW = 0,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  minW?: number;
}) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table
        className="w-full border-collapse text-[14.5px]"
        style={minW ? { minWidth: minW } : undefined}
      >
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-wide text-muted-foreground"
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
                <td key={j} className="px-3 py-2 align-top tabular-nums">
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

/** Un candidat (G, g, D, d), en gras violet comme les feuilles de l'arbre du slide 21. */
function K({ c }: { c: "G" | "g" | "D" | "d" }) {
  return <span className="font-bold text-violet-700">{c}</span>;
}

/** Une ligne du tableau des préférences : empilée sur téléphone, sur une ligne au-delà. */
const PREF_ROW = "flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4";

/** L'ENPS des primaires, écrit comme au slide 25 (une stratégie par ligne). */
function EnpsBox() {
  return (
    <div className="my-3 space-y-2 overflow-x-auto rounded-xl border bg-card px-4 py-3 text-[16px] shadow-sm">
      <div>
        <M tex="s^*_{MD} = d" />
      </div>
      <div>
        <M tex="s^*_{MG} = G \text{ si } D,\; g \text{ si } d" />
      </div>
      <div className="hidden sm:block">
        <M tex="s^*_{E} = G \text{ si } DG,\; g \text{ si } Dg,\; d \text{ si } dG,\; g \text{ si } dg" />
      </div>
      <div className="sm:hidden">
        <M tex="\begin{aligned} s^*_{E} = {} & G \text{ si } DG,\; g \text{ si } Dg, \\ & d \text{ si } dG,\; g \text{ si } dg \end{aligned}" />
      </div>
    </div>
  );
}

/** Verdicts du tableau bilan du labo. */
const Ok = () => <span className="font-bold text-emerald-700">✓</span>;
const Ko = () => <span className="font-bold text-rose-700">✗</span>;

/** Un bout de formule entre guillemets, qui ne se coupe pas en fin de ligne. */
function Q({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap">«&nbsp;{children}&nbsp;»</span>;
}

/** Les trois joueurs des primaires, avec la couleur du slide 21. */
const MG = () => <span className="font-semibold text-rose-700">MG</span>;
const MD = () => <span className="font-semibold text-blue-700">MD</span>;
const E = () => <span className="font-semibold">E</span>;

/**
 * Une donnée du labo : gros chiffre, légende courte, et pastille de verdict
 * (vert : l'hypothèse tient ; rouge : elle tombe).
 */
function Stat({
  value,
  verdict,
  tone,
  children,
}: {
  value: ReactNode;
  verdict: ReactNode;
  tone: "ok" | "ko";
  children: ReactNode;
}) {
  const pill =
    tone === "ok"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : "border-rose-300 bg-rose-50 text-rose-800";
  return (
    <div className="my-3 flex items-start gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="shrink-0 text-[26px] font-extrabold leading-none tabular-nums">{value}</div>
      <div className="min-w-0 text-[14.5px] leading-snug">
        <div className="text-muted-foreground">{children}</div>
        <span className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[12px] font-bold ${pill}`}>
          {verdict}
        </span>
      </div>
    </div>
  );
}

export function PartApplications() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 5 — Les primaires · slides 2 et 19-25                       */}
      {/* ============================================================ */}
      <Section id="s5" kicker="§ 5" title="Application : les primaires et le vote stratégique">
        <Lead>
          Le chapitre s'ouvrait sur une question (slide 2) : au premier tour d'une présidentielle,
          un électeur doit-il voter <strong>« utile »</strong> ou voter pour son{" "}
          <strong>candidat favori</strong> ? On a maintenant l'outil pour y réfléchir : l'ENPS,
          trouvé par backward induction. On l'applique à un petit modèle d'élection avec
          primaires (slides 19-25). La conclusion surprend : personne ne vote pour son favori.
        </Lead>

        <Callout variant="retiens" title="Les deux outils qu'on réutilise">
          <p>
            Un <strong>ENPS</strong> est un équilibre de Nash dont les stratégies forment aussi un
            équilibre de Nash dans chaque sous-jeu. On le trouve par{" "}
            <strong>backward induction</strong> : on résout d'abord les derniers sous-jeux, puis
            on remonte l'arbre jusqu'au nœud initial, en s'appuyant sur H1, puis H2.1, puis
            H2.2…
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <TheoryRef chapter="bseq" section="s3" />
            <TheoryRef chapter="bseq" section="s4" />
          </div>
        </Callout>

        <H4>Le modèle : des primaires très simplifiées (slide 19)</H4>
        <p>En France comme aux États-Unis, l'élection présidentielle se joue en deux temps :</p>
        <UL>
          <li>
            <strong>la primaire</strong> : dans chaque parti, les militants élisent, parmi les
            candidats, le <strong>nominé</strong> qui représentera le parti à l'élection ;
          </li>
          <li>
            <strong>l'élection</strong> : les nominés de chaque parti se présentent devant
            l'électeur.
          </li>
        </UL>
        <p>Pour pouvoir dessiner l'arbre, le slide 19 simplifie à l'extrême :</p>
        <UL>
          <li>
            seulement <strong>deux partis</strong>, la Gauche et la Droite ;
          </li>
          <li>
            seulement <strong>deux candidats</strong> par primaire : <K c="G" /> et <K c="g" />{" "}
            pour la Gauche, <K c="D" /> et <K c="d" /> pour la Droite ;
          </li>
          <li>
            à chaque primaire, <strong>un seul militant</strong> vote : <MG /> (militant de Gauche)
            et <MD /> (militant de Droite) ;
          </li>
          <li>
            la primaire de la <strong>Droite a lieu avant</strong> celle de la Gauche ;
          </li>
          <li>
            à l'élection, <strong>un seul électeur</strong>, <E />, vote entre les nominés.
          </li>
        </UL>
        <p>
          C'est donc un jeu séquentiel à trois joueurs qui jouent chacun à leur tour : <MD />{" "}
          d'abord, puis <MG />, puis <E />. Chacun observe les votes déjà faits : quand <MG />{" "}
          vote, il sait qui la Droite a nommé ; quand <E /> vote, il connaît les deux nominés.
          L'information est <strong>parfaite</strong>, comme dans le jeu de l'entrée.
        </p>

        <H4>Qui préfère quoi ? (slide 20)</H4>
        <p>
          Chaque joueur classe les quatre candidats, du préféré au pire. Le symbole{" "}
          <M tex="\succ_{MG}" /> se lit « est strictement préféré, par le militant de Gauche, à ».
        </p>
        <div className="my-4 space-y-2 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div className={PREF_ROW}>
            <span className="text-[14px] font-semibold text-rose-700">Militant de Gauche</span>
            <M tex="G \succ_{MG} g \succ_{MG} d \succ_{MG} D" />
          </div>
          <div className={`${PREF_ROW} border-t pt-2`}>
            <span className="text-[14px] font-semibold text-blue-700">Militant de Droite</span>
            <M tex="D \succ_{MD} d \succ_{MD} g \succ_{MD} G" />
          </div>
          <div className={`${PREF_ROW} border-t pt-2`}>
            <span className="text-[14px] font-semibold">Électeur</span>
            <M tex="g \succ_{E} d \succ_{E} G \succ_{E} D" />
          </div>
        </div>
        <p>Comment lire ces trois classements ?</p>
        <UL>
          <li>
            Chaque militant préfère les deux candidats de son parti aux deux candidats de l'autre
            parti. Son favori est la « grande » lettre : <K c="G" /> pour <MG />, <K c="D" /> pour{" "}
            <MD />.
          </li>
          <li>
            L'électeur, lui, préfère les deux « petites » lettres (<K c="g" /> puis <K c="d" />)
            aux deux « grandes » (<K c="G" /> puis <K c="D" />). Pour fixer les idées, tu peux
            imaginer que <K c="g" /> et <K c="d" /> sont des candidats plus modérés (c'est une
            image pour retenir, pas une hypothèse du slide).
          </li>
        </UL>
        <p>
          Pour calculer, il faut des payoffs. Le slide 20 précise que{" "}
          <strong>leur valeur exacte n'a pas d'importance</strong>, tant qu'ils représentent les
          préférences. Par exemple : <strong>3</strong> si le candidat préféré est élu,{" "}
          <strong>2</strong> pour le deuxième, <strong>1</strong> pour le troisième,{" "}
          <strong>0</strong> pour le pire. Le tableau ci-dessous range ces payoffs par candidat
          élu (chaque case : le payoff du joueur de la colonne). C'est tout ce dont on aura
          besoin.
        </p>
        <MiniTbl
          head={["Candidat élu", "MG", "MD", "E"]}
          rows={[
            [<K key="k" c="G" />, "3", "0", "1"],
            [<K key="k" c="g" />, "2", "1", "3"],
            [<K key="k" c="d" />, "1", "2", "2"],
            [<K key="k" c="D" />, "0", "3", "0"],
          ]}
        />
        <Callout variant="intuition" title="Pourquoi la valeur des payoffs ne compte pas ici">
          <p>
            À chaque nœud de l'arbre, un joueur compare seulement <strong>deux</strong> candidats
            et garde celui qu'il préfère. Seul l'<strong>ordre</strong> compte. Avec 10, 5, 2 et 0
            au lieu de 3, 2, 1 et 0, toutes les comparaisons donneraient le même gagnant, donc la
            même backward induction et le même ENPS.
          </p>
        </Callout>

        <H4>La forme étendue du jeu (slide 21)</H4>
        <p>L'arbre du slide 21 se lit de haut en bas, en trois étages :</p>
        <UL>
          <li>
            <strong>1 nœud</strong> pour <MD /> (le nœud de départ) : il vote <K c="D" /> ou{" "}
            <K c="d" /> ;
          </li>
          <li>
            <strong>2 nœuds</strong> pour <MG /> : un après <K c="D" />, un après <K c="d" />. À
            chacun, il vote <K c="G" /> ou <K c="g" /> ;
          </li>
          <li>
            <strong>4 nœuds</strong> pour <E /> : un par paire de nominés possible. À chacun, il
            vote pour l'un des deux nominés ;
          </li>
          <li>
            <strong>8 nœuds finaux</strong>. Sous chacun, le slide n'écrit pas de payoffs mais le
            nom du candidat <strong>élu président</strong> : les payoffs se lisent dans le tableau
            ci-dessus.
          </li>
        </UL>
        <p>
          L'animation reprend cet arbre. Clique sur « Étape suivante » pour suivre la backward
          induction nœud par nœud, ou passe en mode « À toi de jouer ». Les trois temps du
          raisonnement sont ensuite détaillés par écrit.
        </p>

        <PrimariesBackward />

        <H4>La backward induction en trois temps (slides 22-24)</H4>

        <Step n={1} title="L'électeur, dans les quatre sous-jeux finaux (slide 22, H1)">
          <p>
            Les quatre sous-jeux finaux commencent aux quatre nœuds de <E />. Chacun correspond à
            une paire de nominés. Dans chacun, s'il est rationnel (H1), l'électeur vote pour{" "}
            <strong>son nominé favori</strong>. Il suffit de regarder lequel des deux arrive le
            plus tôt dans son classement <M tex="g \succ_E d \succ_E G \succ_E D" /> :
          </p>
          <MiniTbl
            head={["Nominés", "Préférence de E", "Élu"]}
            minW={300}
            rows={[
              [<><K c="G" /> et <K c="D" /></>, <M key="m" tex="G \succ_E D" />, <K key="k" c="G" />],
              [<><K c="g" /> et <K c="D" /></>, <M key="m" tex="g \succ_E D" />, <K key="k" c="g" />],
              [<><K c="G" /> et <K c="d" /></>, <M key="m" tex="d \succ_E G" />, <K key="k" c="d" />],
              [<><K c="g" /> et <K c="d" /></>, <M key="m" tex="g \succ_E d" />, <K key="k" c="g" />],
            ]}
          />
          <p>
            Remarque utile pour la suite : <K c="D" /> perd contre n'importe qui (c'est le pire
            candidat pour <E />), et <K c="G" /> ne gagne que contre <K c="D" />.
          </p>
        </Step>

        <Step n={2} title="Le militant de Gauche, qui anticipe l'électeur (slide 23, H2.1)">
          <p>
            Si <MG /> pense que l'électeur est rationnel (H2.1), il sait qui sera élu au bout de
            chaque branche. Il peut donc travailler sur un <strong>jeu réduit</strong> : chaque
            sous-jeu de l'électeur est remplacé par le nominé élu. Il reste deux nœuds de <MG />,
            avec chacun deux issues.
          </p>
          <MiniTbl
            head={[
              "Droite a nommé",
              <>Si MG vote <span className="normal-case">G</span></>,
              <>Si MG vote <span className="normal-case">g</span></>,
            ]}
            rows={[
              [
                <K key="k" c="D" />,
                <strong key="s">
                  <K c="G" /> élu → 3 ✓
                </strong>,
                <><K c="g" /> élu → 2</>,
              ],
              [
                <K key="k" c="d" />,
                <><K c="d" /> élu → 1</>,
                <strong key="s">
                  <K c="g" /> élu → 2 ✓
                </strong>,
              ],
            ]}
          />
          <p className="text-[13.5px] text-muted-foreground">
            Dans chaque case : le candidat élu, puis le payoff de MG. ✓ = le choix de MG.
          </p>
          <p>
            Le cas intéressant est le second. Face à <K c="d" />, son favori <K c="G" /> perdrait
            l'élection : l'électeur préfère <K c="d" /> à <K c="G" />. <MG /> nomme alors{" "}
            <K c="g" />, qui bat <K c="d" />. Il obtient son deuxième choix plutôt que son
            troisième. Comme le dit le slide 23, s'il est rationnel, <MG /> vote pour <K c="G" />{" "}
            lorsque <K c="D" /> est le candidat de la Droite, et pour <K c="g" /> lorsque{" "}
            <K c="d" /> est le candidat de la Droite.
          </p>
        </Step>

        <Step n={3} title="Le militant de Droite, qui anticipe les deux autres (slide 24, H2.2)">
          <p>
            <MD /> anticipe le comportement rationnel de l'électeur (H2.1) et celui du militant de
            Gauche, qui lui-même anticipe l'électeur (H2.2 : <MD /> pense que <MG /> pense que{" "}
            <E /> est rationnel). Son jeu réduit n'a plus que deux branches, chacune menant à un
            élu :
          </p>
          <UL>
            <li>
              s'il vote <K c="D" />, <MG /> nomme <K c="G" />, et <K c="G" /> bat <K c="D" /> :{" "}
              <strong>
                <K c="G" /> est élu
              </strong>
              , son pire candidat (payoff 0) ;
            </li>
            <li>
              s'il vote <K c="d" />, <MG /> nomme <K c="g" />, et <K c="g" /> bat <K c="d" /> :{" "}
              <strong>
                <K c="g" /> est élu
              </strong>
              , son troisième choix (payoff 1).
            </li>
          </UL>
          <p>
            Ses préférences sont <M tex="D \succ_{MD} d \succ_{MD} g \succ_{MD} G" /> : il préfère
            que <K c="g" /> soit élu plutôt que <K c="G" />. S'il est rationnel, <MD /> vote donc
            pour <K c="d" />.
          </p>
        </Step>

        <Callout
          variant="attention"
          title={<>Pourquoi MD ne peut pas obtenir mieux que <span className="normal-case">g</span></>}
        >
          <p>
            Aucune branche ne permet à <MD /> de faire élire un candidat de Droite. S'il nomme{" "}
            <K c="D" />, le candidat que l'électeur aime le moins, la Gauche gagne avec son favori{" "}
            <K c="G" />. S'il nomme <K c="d" />, la Gauche s'adapte et nomme <K c="g" />, le
            favori de l'électeur. Entre deux défaites, <MD /> choisit la moins pénible.
          </p>
        </Callout>

        <H4>Le résultat et l'ENPS (slide 25)</H4>
        <p>
          La backward induction donne une <strong>prédiction unique</strong> pour le jeu de
          l'élection :{" "}
          <strong>
            <K c="g" /> est élu président
          </strong>
          . Ce résultat est supporté par le seul ENPS{" "}
          <M tex="(s^*_{MD},\, s^*_{MG},\, s^*_{E})" />, où :
        </p>
        <EnpsBox />
        <p>Comment lire cette écriture ?</p>
        <UL>
          <li>
            <Q>
              <M tex="G \text{ si } D" />
            </Q>{" "}
            veut dire : « vote <K c="G" /> si la Droite a nommé <K c="D" />&nbsp;». C'est une <strong>stratégie conditionnelle</strong> : l'action dépend de
            ce qui s'est passé avant.
          </li>
          <li>
            Dans la stratégie de l'électeur,{" "}
            <Q>
              <M tex="DG" />
            </Q>{" "}
            désigne l'histoire
            «&nbsp;la Droite a nommé <K c="D" />, puis la Gauche a nommé <K c="G" />&nbsp;». La première lettre est le vote
            de <MD />, la seconde celui de <MG />.
          </li>
          <li>
            Le slide 25 le souligne : pour le militant de Gauche et pour l'électeur, une stratégie
            précise l'action prise <strong>pour chaque nœud</strong> où il doit potentiellement
            faire un choix. <MG /> a 2 nœuds, donc sa stratégie contient 2 actions ; <E /> en a 4,
            donc 4 actions. <MD /> n'a qu'un nœud : sa stratégie est une seule action.
          </li>
        </UL>
        <p>
          Sur le chemin effectivement joué : <MD /> vote <K c="d" />, <MG /> vote <K c="g" />,
          puis l'électeur choisit entre <K c="g" /> et <K c="d" /> et vote <K c="g" />. Les autres
          morceaux des stratégies (
          <Q>
            <M tex="G \text{ si } D" />
          </Q>
          ,{" "}
          <Q>
            <M tex="G \text{ si } DG" />
          </Q>
          …) décrivent ce qui se passerait ailleurs dans l'arbre.
          Ils font pourtant partie de l'ENPS : ce sont eux qui expliquent pourquoi <MD /> évite{" "}
          <K c="D" />.
        </p>

        <Callout variant="examen" title="Le résultat n'est pas l'équilibre">
          <p>
            « <K c="g" /> est élu » est le <strong>résultat</strong>. « <K c="d" />, puis{" "}
            <K c="g" />, puis <K c="g" /> » est seulement le <strong>chemin</strong> suivi. L'
            <strong>ENPS</strong> est un <strong>profil de stratégies</strong> : un plan d'action
            complet pour chaque joueur, avec une action à chacun de ses nœuds, y compris ceux qui
            ne sont pas atteints. À l'examen, écris-le en entier, comme au slide 25.
          </p>
          <p className="mt-2">
            Petit calcul (pas dans le slide) pour mesurer l'effort que t'épargne la backward
            induction : <MD /> a 2 stratégies, <MG /> en a <M tex="2 \times 2 = 4" /> et <E /> en
            a <M tex="2^4 = 16" />. La forme normale compterait{" "}
            <M tex="2 \times 4 \times 16 = 128" /> profils de stratégies.
          </p>
        </Callout>

        <H4>La leçon : personne ne vote pour son favori</H4>
        <p>
          Le slide 25 en tire une conclusion frappante :{" "}
          <strong>
            ni le militant de Gauche ni le militant de Droite ne votent pour leur candidat préféré
          </strong>{" "}
          lors de leur primaire respective. <MD /> aime <K c="D" /> mais vote <K c="d" /> ;{" "}
          <MG /> aime <K c="G" /> mais vote <K c="g" />. La raison : ils anticipent que voter pour
          leur candidat préféré entraînerait l'élection d'un candidat qu'ils apprécient moins.
        </p>
        <CardGrid
          items={[
            {
              tag: "Militant de Droite",
              title: <>Voter D ⇒ G élu (son pire candidat)</>,
              body: (
                <>
                  Face à <K c="D" />, la Gauche nommerait <K c="G" />, que l'électeur préfère à{" "}
                  <K c="D" />. En votant <K c="d" />, <MD /> obtient <K c="g" />, son troisième
                  choix au lieu du quatrième.
                </>
              ),
            },
            {
              tag: "Militant de Gauche",
              title: <>Voter G ⇒ d élu (son 3e choix)</>,
              body: (
                <>
                  Face à <K c="d" />, son favori <K c="G" /> perdrait l'élection. En votant{" "}
                  <K c="g" />, <MG /> obtient son deuxième choix au lieu du troisième.
                </>
              ),
            },
          ]}
        />

        <Callout variant="attention" title="« Ne votent pas pour leur favori » : sur le chemin joué">
          <p>
            La stratégie de <MG /> contient bien{" "}
            <Q>
              <M tex="G \text{ si } D" />
            </Q>{" "}
            : si la Droite
            avait nommé <K c="D" />, il voterait pour son favori, car <K c="G" /> bat <K c="D" />.
            Mais ce nœud n'est pas atteint, puisque <MD /> vote <K c="d" />. La phrase du slide
            décrit donc ce qui se passe sur le chemin d'équilibre.
          </p>
        </Callout>

        <H5>Pourquoi l'électeur, qui vote en dernier, pèse sur tout le monde</H5>
        <p>
          L'électeur ne joue qu'à la fin, et pourtant c'est lui qui « tire les ficelles ». Comme
          il est rationnel (H1), son vote face à chaque paire de nominés est{" "}
          <strong>prévisible</strong>. Les militants l'anticipent : pour eux, choisir un nominé,
          c'est en réalité choisir <strong>quel duel</strong> l'électeur va trancher. Les
          préférences de l'électeur remontent ainsi tout l'arbre. Chaque militant se demande moins
          « qui est mon favori ? » que « qui peut gagner face au nominé d'en face ? ». Dans cet
          exemple, le candidat élu, <K c="g" />, est d'ailleurs le favori de l'électeur.
        </p>

        <H5>Retour à la question du slide 2 : voter « utile » ?</H5>
        <p>
          Dans ce modèle, voter pour son favori n'est pas dans l'intérêt des militants. Un votant
          qui anticipe la suite (les votes suivants, puis l'élection) peut avoir intérêt à voter
          « utile » : soutenir un candidat moins aimé mais capable de gagner, pour éviter
          l'élection d'un candidat qu'il aime encore moins. C'est exactement ce que font les deux
          militants. Voter « utile », c'est la backward induction appliquée au vote.
        </p>

        <Quiz
          scope="bseq"
          id="q-prim-mg"
          question={
            <>
              Supposons que la Droite ait nommé <K c="D" />. Que vote le militant de Gauche, et qui
              est élu ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <K c="G" />, et <K c="G" /> est élu.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui. L'électeur préfère <K c="G" /> à <K c="D" /> : <K c="G" /> gagne. C'est le
                  favori de <MG /> (payoff 3), qui n'a aucune raison de s'en priver.
                </>
              ),
            },
            {
              text: (
                <>
                  <K c="g" />, et <K c="g" /> est élu.
                </>
              ),
              explain: (
                <>
                  Non. <K c="g" /> gagnerait aussi contre <K c="D" />, mais <MG /> n'obtiendrait
                  que 2. Avec <K c="G" />, qui bat aussi <K c="D" />, il obtient 3.
                </>
              ),
            },
            {
              text: (
                <>
                  <K c="G" />, mais <K c="D" /> est élu.
                </>
              ),
              explain: (
                <>
                  Non. <K c="D" /> est le pire candidat pour l'électeur : il perd contre n'importe
                  quel nominé de Gauche.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="bseq"
          id="q-prim-md"
          question={
            <>
              Pourquoi le militant de Droite ne vote-t-il pas pour son favori <K c="D" /> ?
            </>
          }
          options={[
            {
              text: <>Parce que l'électeur le lui interdit.</>,
              explain: (
                <>
                  Non. L'électeur ne joue qu'à la fin et n'interdit rien. Ce sont les{" "}
                  <strong>anticipations</strong> de <MD /> qui le font changer d'avis.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce qu'il anticipe que, face à <K c="D" />, la Gauche nommerait <K c="G" /> et
                  gagnerait : <K c="G" /> élu, son pire candidat.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui. Avec <K c="d" />, la Gauche nomme <K c="g" /> et gagne aussi, mais <MD />{" "}
                  préfère <K c="g" /> à <K c="G" /> (payoff 1 au lieu de 0).
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que <K c="d" /> gagne l'élection.
                </>
              ),
              explain: (
                <>
                  Non. Dans l'ENPS, <K c="d" /> perd contre <K c="g" />. Aucun candidat de Droite
                  n'est élu : <MD /> choisit la défaite la moins pénible.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="À retenir du § 5">
          <UL>
            <li>
              Primaires simplifiées : <MD /> vote, puis <MG /> (qui a vu le vote de <MD />), puis
              l'électeur choisit entre les deux nominés. Information parfaite.
            </li>
            <li>
              Backward induction en trois temps : l'électeur (H1), puis <MG /> (H2.1), puis{" "}
              <MD /> (H2.2). On résout chaque étage sur un jeu réduit où chaque sous-jeu est
              remplacé par le nominé élu.
            </li>
            <li>
              Prédiction unique : <K c="g" /> est élu. Seul ENPS, écrit comme au slide 25 :
              <EnpsBox />
            </li>
            <li>
              Aucun militant ne vote pour son favori : il anticipe que ce vote ferait élire un
              candidat qu'il aime moins. C'est le vote « utile ».
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 6 — Au laboratoire · slides 26-33                           */}
      {/* ============================================================ */}
      <Section id="s6" kicker="§ 6" title="Au laboratoire : la théorie face aux joueurs réels">
        <Lead>
          La pertinence des prédictions de la théorie des jeux dépend du{" "}
          <strong>réalisme de ses hypothèses</strong> pour les interactions analysées (slide 26).
          Les étudiants du cours ont joué à plusieurs jeux séquentiels en laboratoire. Leurs
          comportements se conforment-ils à ceux que prédit la backward induction ? On le vérifie
          sur trois jeux : le jeu de « base », l'ultimatum et le centipède.
        </Lead>

        <p>
          Le slide 26 teste les deux premiers maillons de la backward induction, chacun avec sa
          conséquence observable :
        </p>
        <CardGrid
          items={[
            {
              tag: "H1 · les joueurs sont rationnels",
              title: <>Le dernier joueur évite ses actions dominées</>,
              body: (
                <>
                  Le joueur 2 évite ses stratégies dominées dans les derniers sous-jeux. Pour cela,
                  il n'a besoin que de sa propre rationalité : plus personne ne joue après lui.
                </>
              ),
            },
            {
              tag: "H2.1 · on croit les autres rationnels",
              title: <>Le joueur d'avant l'anticipe</>,
              body: (
                <>
                  Le joueur 1 anticipe que le joueur 2 ne jouera pas de stratégie dominée, et
                  choisit en conséquence. Il doit donc, en plus, croire que l'autre est rationnel.
                </>
              ),
            },
          ]}
        />
        <p>
          Tu as vu le même genre de tests pour les jeux simultanés au chapitre B1. Ici, l'ordre
          des coups rend les choses très lisibles : <strong>H1 se teste sur le dernier
          joueur</strong>, <strong>H2.1 sur l'avant-dernier</strong>.
        </p>
        <div className="my-2">
          <TheoryRef chapter="b1" section="s7" />
        </div>

        {/* ---------------------------------------------------------- */}
        <H4>1. Le jeu de « base » (slides 27-28)</H4>
        <p>
          Le joueur 1 (J1) choisit <strong>Gauche</strong> ou <strong>Droite</strong>. Le joueur 2
          (J2) observe ce choix, puis joue : <strong>A</strong> ou <strong>B</strong> après
          Gauche, <strong>C</strong> ou <strong>D</strong> après Droite. Les payoffs (J1 ; J2)
          sont : Gauche puis A → (4 ; 1), Gauche puis B → (1 ; 4), Droite puis C → (2 ; 2),
          Droite puis D → (0 ; 1). L'arbre est dessiné dans l'animation ci-dessous.
        </p>
        <p>
          Une stratégie de J2 est un <strong>plan d'action complet</strong> : ce qu'il fait après
          Gauche <em>et</em> ce qu'il fait après Droite. J2 a donc quatre stratégies, notées{" "}
          <strong>A−C</strong>, <strong>A−D</strong>, <strong>B−C</strong> et{" "}
          <strong>B−D</strong>. Par exemple, B−C signifie « B si Gauche, C si Droite ».
        </p>

        <BaseGameLab />

        <Step n={1} title="Ce que prédit H1 pour J2 (slide 27)">
          <p>
            Dans chacun des deux derniers sous-jeux, J2 compare ses deux actions :
          </p>
          <UL>
            <li>
              après Gauche, B lui rapporte 4 et A seulement 1 : <M tex="4 > 1" />, A est dominée ;
            </li>
            <li>
              après Droite, C lui rapporte 2 et D seulement 1 : <M tex="2 > 1" />, D est dominée.
            </li>
          </UL>
          <p>
            Le joueur 2 n'a donc qu'<strong>une seule stratégie non dominée : B−C</strong>.
          </p>
        </Step>
        <Stat value="90 %" tone="ok" verdict="H1 ✓">
          des étudiants ont utilisé B−C au premier round (le jeu a été joué 2 fois). H1 est
          largement vérifiée.
        </Stat>

        <Step n={2} title="Ce que prédit H2.1 pour J1 (slide 27)">
          <p>
            Si J1 pense que J2 est rationnel, il anticipe B−C. Il compare alors :
          </p>
          <UL>
            <li>
              Gauche → J2 joue B → (1 ; 4) : J1 obtient <strong>1</strong> ;
            </li>
            <li>
              Droite → J2 joue C → (2 ; 2) : J1 obtient <strong>2</strong>.
            </li>
          </UL>
          <p>
            Comme <M tex="2 > 1" />, J1 choisit <strong>Droite</strong>. La backward induction
            donne donc le profil (Droite, B−C), qui mène au résultat (2 ; 2).
          </p>
        </Step>
        <Stat value="48 %" tone="ko" verdict="H2.1 ✗">
          des étudiants seulement ont choisi Droite au premier round. H2.1 est loin d'être
          vérifiée.
        </Stat>

        <p>
          L'interprétation du slide 28 : au premier round, les étudiants sont en grande majorité{" "}
          <strong>rationnels</strong>, mais <strong>n'anticipent pas</strong> que les autres
          étudiants sont rationnels. Avec 48 %, à peu près une chance sur deux, on a
          l'impression qu'en tant que joueur 1, les étudiants choisissent leur stratégie{" "}
          <strong>au hasard</strong>.
        </p>

        <Step n={3} title="Gauche était-il un pari raisonnable ? (notre calcul, pas dans le slide)">
          <p>
            Le 4 du côté Gauche attire l'œil, mais J1 ne l'obtient que si J2 joue A, une action
            dominée. Notons <M tex="q" /> la part des J2 qui jouent A après Gauche, et supposons
            que tous jouent C après Droite. En moyenne, Gauche rapporte à J1
          </p>
          <MB tex="4q + 1 \cdot (1-q) = 1 + 3q" />
          <p>et Droite rapporte 2. Gauche rapporte plus que Droite seulement si :</p>
          <MB tex="1 + 3q > 2 \iff q > \tfrac{1}{3}" />
          <p>
            Il faudrait donc que plus d'un tiers des J2 jouent A. Or 90 % des J2 ont joué B−C :
            au plus 10 % ont joué A après Gauche, et au moins 90 % ont joué C après Droite. Face
            aux J2 de la classe :
          </p>
          <MB tex="\text{Gauche} \le 1 + 3 \times 0{,}1 = 1{,}3" />
          <MB tex="\text{Droite} \ge 2 \times 0{,}9 = 1{,}8" />
          <p>Faire confiance à la rationalité des autres payait.</p>
        </Step>

        <Callout variant="examen" title="Choisir Gauche viole H2.1, pas H1">
          <p>
            Gauche n'est pas une stratégie dominée pour J1 : si J2 jouait A après Gauche, Gauche
            rapporterait 4, plus que Droite. Un J1 rationnel qui doute de la rationalité de J2 peut
            donc choisir Gauche. Ce qui fait défaut, c'est H2.1 (croire que l'autre est
            rationnel). À l'inverse, un J2 qui joue A ou D viole H1 : il choisit une action qui
            lui rapporte moins, alors que plus personne ne joue après lui.
          </p>
        </Callout>

        {/* ---------------------------------------------------------- */}
        <H4>2. Le jeu de l'ultimatum (slides 28-30)</H4>
        <p>Les règles (slide 28) :</p>
        <UL>
          <li>
            un montant de <strong>8</strong> doit être partagé entre deux joueurs, un{" "}
            <strong>proposeur</strong> et un <strong>véto-eur</strong> ;
          </li>
          <li>
            le proposeur choisit une répartition de ce montant entre lui et le véto-eur. Par
            exemple, la répartition <strong>(5,3)</strong> signifie que le proposeur garde 5 pour
            lui et donne 3 au véto-eur ;
          </li>
          <li>
            ensuite, le véto-eur décide s'il <strong>accepte</strong> ou non la répartition. S'il
            accepte, elle est implémentée. S'il <strong>refuse</strong>, les deux joueurs
            obtiennent chacun <strong>zéro</strong>.
          </li>
        </UL>
        <p>
          C'est un jeu séquentiel : le proposeur joue d'abord, le véto-eur voit la proposition,
          puis répond. Dans l'arbre, chaque répartition possible mène à un nœud du véto-eur, avec
          deux branches : Accepter (la répartition est appliquée) ou Refuser (0 ; 0).
        </p>

        <Step n={1} title="Ce que prédit H1 pour le véto-eur (slide 29)">
          <p>
            Le dernier joueur à prendre une décision est le véto-eur. Face à la répartition (5,3),
            par exemple, accepter lui rapporte 3 et refuser 0 :
          </p>
          <MB tex="u_{\text{véto}}(\text{Accepter}) = 3 \;>\; 0 = u_{\text{véto}}(\text{Refuser})" />
          <p>
            Il en va de même pour tout montant positif : il vaut mieux avoir quelque chose plutôt
            que rien. Pour le véto-eur, refuser une répartition où il reçoit un montant positif{" "}
            <strong>n'est pas rationnel</strong>, et viole donc H1.
          </p>
        </Step>
        <Stat value="62 %" tone="ko" verdict="H1 ✗">
          des étudiants ont refusé une répartition avec montant positif (slide 29).
        </Stat>
        <p>
          Ce résultat indique que la comparaison des résultats du jeu par les véto-eurs{" "}
          <strong>ne dépend pas uniquement du montant qu'ils reçoivent</strong>. Le slide 29
          avance deux explications :
        </p>
        <CardGrid
          items={[
            {
              tag: "G. Kirchsteiger (1994)",
              title: <>L'envie</>,
              body: (
                <>
                  Les véto-eurs se soucient aussi du montant obtenu par le proposeur. Ils
                  pourraient être envieux du plus grand montant obtenu par ce dernier.
                </>
              ),
            },
            {
              tag: "Autre explication",
              title: <>L'équité et la punition</>,
              body: (
                <>
                  Les véto-eurs trouvent qu'une répartition trop inégale est injuste. Ils sont dès
                  lors prêts à punir le proposeur, même si punir leur coûte. Selon le slide, cette
                  explication est plus en phase avec les résultats obtenus pour d'autres versions
                  de ce jeu.
                </>
              ),
            },
          ]}
        />
        <Callout variant="intuition" title="Irrationnels, vraiment ?">
          <p>
            Avec des payoffs égaux aux montants reçus, refuser (7,1) viole H1 : 1 &gt; 0. Mais les
            deux explications disent autre chose : le véto-eur ne juge pas l'issue{" "}
            <strong>seulement</strong> à son montant. Pour quelqu'un qui déteste l'injustice,
            « 1 pour moi, 7 pour toi » peut être pire que « 0 pour tous les deux ». Ce sont alors
            les payoffs du modèle, égaux aux montants, qui représentent mal ses préférences.
          </p>
        </Callout>

        <Step n={2} title="Ce que prédit H2.1 pour le proposeur (slide 30)">
          <p>
            Si le proposeur pense que le véto-eur est rationnel, il anticipe que le véto-eur
            acceptera n'importe quel montant positif. Il a alors intérêt à lui laisser le moins
            possible, sans descendre à zéro. Le slide 30 conclut : le seul ENPS est tel que le
            proposeur choisit la répartition donnant au véto-eur{" "}
            <strong>le plus petit montant positif</strong>. Avec des montants entiers, comme dans
            les propositions du labo, c'est <strong>(7,1)</strong>.
          </p>
        </Step>

        <Callout variant="attention" title="Pour aller plus loin : et la répartition (8,0) ?">
          <p>
            Face à (8,0), le véto-eur reçoit 0 qu'il accepte ou qu'il refuse : il est{" "}
            <strong>indifférent</strong>. Le raisonnement du slide suppose qu'il refuse dans ce
            cas. S'il acceptait, le proposeur aurait intérêt à garder tout, et (8,0) serait aussi
            un ENPS. À l'examen, donne la réponse du slide 30 : (7,1).
          </p>
        </Callout>

        <H5>Ce qu'ont fait les proposeurs (slide 30)</H5>
        <p>
          Dans le rôle du proposeur, voici la répartition des stratégies choisies et des payoffs
          moyens qu'elles permettaient d'obtenir (sous-groupe de 29 étudiants) :
        </p>
        <MiniTbl
          head={["Proposition", "Part des proposeurs", "Payoff moyen"]}
          rows={[
            ["(8,0)", "0 %", "0,28"],
            [<strong key="p">(7,1) · ENPS</strong>, "28 %", "3,14"],
            ["(6,2)", "28 %", "3,31"],
            [<strong key="p">(5,3)</strong>, "31 %", <strong key="v">4,48</strong>],
            ["(4,4)", "13 %", "4"],
          ]}
        />
        <p>
          Remarque : personne n'a proposé (8,0), et le slide lui donne pourtant un payoff moyen
          (0,28). Ce chiffre se lit donc comme ce que la proposition{" "}
          <strong>aurait rapporté en moyenne face aux véto-eurs de la classe</strong>, qu'on
          l'ait choisie ou non.
        </p>
        <p>
          La proposition de l'ENPS, (7,1), ne rapportait que <strong>3,14</strong> en moyenne. La
          meilleure était <strong>(5,3)</strong>, avec <strong>4,48</strong>. Vu que le
          comportement des véto-eurs n'est pas souvent rationnel, les proposeurs n'ont que peu de
          raisons de satisfaire à l'hypothèse H2.1.
        </p>

        <Step n={3} title="Le taux d'acceptation caché derrière ces moyennes (notre calcul)">
          <p>
            Une proposition rapporte au proposeur le montant qu'il garde si elle est acceptée, et 0
            sinon. Son payoff moyen vaut donc « montant gardé × part des véto-eurs qui
            acceptent ». En divisant, on retrouve cette part :
          </p>
          <MB tex="\text{part qui accepte} = \frac{\text{payoff moyen}}{\text{montant gardé}}" />
          <UL>
            <li>
              (5,3) : <M tex="4{,}48 \div 5 \approx 0{,}90" />, acceptée par environ 90 % des
              véto-eurs ;
            </li>
            <li>
              (7,1) : <M tex="3{,}14 \div 7 \approx 0{,}45" />, acceptée par environ 45 %
              seulement.
            </li>
          </UL>
          <p>
            De même, on trouve environ 3,5 % pour (8,0), 55 % pour (6,2) et 100 % pour (4,4).
          </p>
          <p>
            Plus le proposeur garde pour lui, moins sa proposition est acceptée. C'est le{" "}
            <strong>trade-off</strong> du slide 30 : le proposeur doit arbitrer entre garder le
            plus grand montant pour lui-même et proposer un montant acceptable pour le véto-eur.
            Face à cette classe, (5,3) réalisait le meilleur compromis.
          </p>
        </Step>

        <UltimatumLab />

        <Quiz
          scope="bseq"
          id="q-ultim-h1"
          question={
            <>
              Un véto-eur refuse la répartition (7,1). Avec les payoffs du jeu (les montants
              reçus), ce refus est-il rationnel au sens de H1 ?
            </>
          }
          options={[
            {
              text: <>Oui : il punit un proposeur injuste.</>,
              explain: (
                <>
                  Non. Punir est peut-être une motivation réelle (c'est l'explication par l'équité),
                  mais elle ne figure pas dans les payoffs du jeu. Avec ces payoffs, accepter
                  rapporte 1 et refuser 0.
                </>
              ),
            },
            {
              text: <>Non : accepter rapporte 1, refuser 0. Refuser un montant positif viole H1.</>,
              correct: true,
              explain: (
                <>
                  Oui, c'est le raisonnement du slide 29. Les 62 % de refus indiquent que les
                  véto-eurs ne jugent pas l'issue uniquement à leur montant (envie, équité).
                </>
              ),
            },
            {
              text: <>On ne peut pas savoir : cela dépend de ce que fera le proposeur ensuite.</>,
              explain: (
                <>
                  Non. Le véto-eur joue en dernier et connaît déjà la proposition : plus personne ne
                  joue après lui. C'est justement pour ça que H1 suffit à prédire son choix.
                </>
              ),
            },
          ]}
        />

        {/* ---------------------------------------------------------- */}
        <H4>3. Le jeu du centipède (slides 31-33)</H4>
        <p>
          Deux joueurs, J1 et j2, jouent à tour de rôle, trois fois chacun (6 nœuds en tout). À
          chaque nœud, le joueur dont c'est le tour a deux options :
        </p>
        <UL>
          <li>
            <strong>arrêter</strong> le jeu (A₁, A₂, A₃ pour J1 ; a₁, a₂, a₃ pour j2) : le jeu
            s'arrête, et chacun reçoit les payoffs écrits sous ce nœud ;
          </li>
          <li>
            <strong>passer</strong> le jeu à l'adversaire (P₁, P₂, P₃ pour J1 ; p₁, p₂, p₃ pour
            j2). Si tout le monde passe jusqu'au bout, les payoffs sont (8 ; 6).
          </li>
        </UL>
        <MiniTbl
          head={["Nœud", "S'il arrête", "S'il passe"]}
          rows={[
            ["1 · J1", "A₁ → (2 ; 0)", "P₁ → nœud 2"],
            ["2 · j2", "a₁ → (1 ; 3)", "p₁ → nœud 3"],
            ["3 · J1", "A₂ → (4 ; 2)", "P₂ → nœud 4"],
            ["4 · j2", "a₂ → (3 ; 5)", "p₂ → nœud 5"],
            ["5 · J1", "A₃ → (6 ; 4)", "P₃ → nœud 6"],
            ["6 · j2", "a₃ → (5 ; 7)", <strong key="s">p₃ → (8 ; 6)</strong>],
          ]}
        />
        <p>
          Payoffs notés (J1 ; j2). Deux régularités à repérer avant de raisonner (notre lecture de
          l'arbre) :
        </p>
        <UL>
          <li>
            le « gâteau » grossit à chaque passe : la somme des payoffs vaut 2, 4, 6, 8, 10, 12,
            puis 14 si tout le monde passe ;
          </li>
          <li>
            mais à chaque nœud, <strong>arrêter</strong> rapporte au joueur{" "}
            <strong>1 de plus</strong> que ce qu'il obtiendrait si l'adversaire arrêtait juste
            après. Au nœud 5, par exemple, J1 obtient 6 en arrêtant, et 5 s'il passe et que j2
            arrête.
          </li>
        </UL>

        <CentipedeLab />

        <Step n={1} title="Le dernier nœud : j2 choisit a₃ (slide 31, H1)">
          <p>
            Si on atteint le dernier sous-jeu et si le joueur 2 est rationnel, il choisit a₃
            plutôt que p₃ : a₃ lui rapporte 7, p₃ seulement 6 (<M tex="7 > 6" />).
          </p>
        </Step>
        <Stat value="15 %" tone="ok" verdict="H1 ✓">
          des étudiants ayant choisi p₃ ou a₃ ont choisi p₃ (slide 31). Les 85 % restants ont
          choisi a₃ : un fort pourcentage des étudiants est rationnel à ce niveau du jeu.
        </Stat>
        <p>
          Ceux qui ne le sont pas peuvent éventuellement privilégier la{" "}
          <strong>réciprocité</strong> à la rationalité (slide 31) : par exemple, « rendre » à
          l'adversaire la confiance qu'il a montrée en passant le jeu.
        </p>

        <Step n={2} title="L'avant-dernier nœud : J1 choisit A₃ (slide 32, H2.1)">
          <p>
            Si J1 pense que j2 est rationnel, il anticipe a₃ au nœud 6. Passer (P₃) lui
            rapporterait alors 5, contre 6 en arrêtant (A₃) : <M tex="6 > 5" />. Si on atteint
            l'avant-dernier sous-jeu, J1 choisit donc A₃ plutôt que P₃.
          </p>
        </Step>
        <Stat value="85 %" tone="ok" verdict="H2.1 ✓ (presque)">
          des étudiants ayant choisi P₃ ou A₃ ont choisi A₃. H2.1 est proche d'être satisfaite
          dans le centipède.
        </Stat>

        <Step n={3} title="On remonte jusqu'au début : J1 arrête tout de suite (slide 32)">
          <p>
            On applique ce raisonnement de manière itérative. À chaque nœud, le joueur anticipe
            que l'adversaire arrêtera au nœud suivant, et préfère donc arrêter lui-même. Chaque
            nœud remonté demande un niveau de plus dans la connaissance réciproque de la
            rationalité :
          </p>
          <MiniTbl
            head={["Nœud", "Arrêter", "Passer", "Choix (hyp.)"]}
            rows={[
              ["6 · j2", "7", "6", <><strong>a₃</strong> (H1)</>],
              ["5 · J1", "6", "5", <><strong>A₃</strong> (H2.1)</>],
              ["4 · j2", "5", "4", <><strong>a₂</strong> (H2.2)</>],
              ["3 · J1", "4", "3", <><strong>A₂</strong> (H2.3)</>],
              ["2 · j2", "3", "2", <><strong>a₁</strong> (H2.4)</>],
              ["1 · J1", "2", "1", <><strong>A₁</strong> (H2.5)</>],
            ]}
          />
          <p className="text-[13.5px] text-muted-foreground">
            Chaque case donne le payoff du joueur qui décide à ce nœud. « Passer » : ce qu'il
            obtient s'il passe et que l'adversaire arrête juste après (au nœud 6, passer mène à
            la fin du jeu, (8 ; 6)). Exemple au nœud 5 : si J1 passe (P₃), j2 arrête (a₃) et J1
            obtient 5. Les niveaux H2.2 à H2.5 sont notre écriture du « de manière itérative »
            du slide 32.
          </p>
          <p>
            Le seul ENPS est tel que <strong>le joueur 1 choisit A₁ dès le nœud initial</strong>{" "}
            : le jeu s'arrête tout de suite, sur (2 ; 0). Écrit comme un profil de plans
            complets : J1 joue (A₁, A₂, A₃) et j2 joue (a₁, a₂, a₃). Tout le monde arrête à
            chacun de ses nœuds.
          </p>
        </Step>

        <Callout variant="attention" title="Rationnel… et très inefficace (slide 32)">
          <p>
            Ce comportement est rationnel lorsque la connaissance réciproque de la rationalité est
            complète. Mais il mène à un résultat <strong>très inefficace</strong> : les payoffs
            augmentent à mesure que les joueurs « passent » le jeu à leur adversaire. Si tout le
            monde passait, l'issue (8 ; 6) donnerait plus aux deux joueurs que (2 ; 0).
          </p>
          <p className="mt-2">
            La difficulté vient du fait que, si on anticipe que son adversaire arrêtera le jeu
            dans le cas où on lui passe le jeu, alors on a intérêt à arrêter le jeu tout de suite.
          </p>
        </Callout>

        <Stat value="15 %" tone="ko" verdict="ENPS ✗">
          des étudiants ont choisi A₁, c'est-à-dire arrêté le jeu dès que possible, comme le
          prédit l'ENPS (slide 33).
        </Stat>
        <p>
          Vu que le comportement de leurs adversaires n'est pas conforme à l'ENPS, les joueurs
          n'ont que peu de raisons d'arrêter le jeu dès que possible. Et de fait, c'est la
          stratégie A₁ qui rapportait au joueur 1 <strong>le moins de points</strong> lors du
          premier round. Le joueur 1 doit faire un <strong>trade-off</strong> entre :
        </p>
        <UL>
          <li>passer le jeu le plus loin possible (le gâteau grossit) ;</li>
          <li>arrêter juste avant que son adversaire n'arrête le jeu.</li>
        </UL>

        <Callout variant="retiens" title="Le lien avec « devine 2/3 de la moyenne »">
          <p>
            Comme lors de l'analyse du jeu « devine 2/3 de la moyenne » au chapitre B1, si un
            joueur pense que son adversaire ne satisfera pas aux hypothèses H1 et H2, alors il a
            intérêt à <strong>ne pas jouer sa stratégie d'équilibre</strong> (slide 33). Jouer 0
            au « 2/3 » ou arrêter au premier nœud du centipède, c'est la bonne réponse face à des
            joueurs parfaitement rationnels, pas face aux joueurs réels.
          </p>
          <div className="mt-2">
            <TheoryRef chapter="b1" section="s7" />
          </div>
        </Callout>

        <Quiz
          scope="bseq"
          id="q-centi"
          question={
            <>
              Au labo, 15 % des joueurs 1 ont arrêté le centipède au premier nœud (A₁), et c'est
              la stratégie qui leur a rapporté le moins. Que faut-il en conclure ?
            </>
          }
          options={[
            {
              text: <>Ces joueurs violent H1 : arrêter tout de suite est irrationnel.</>,
              explain: (
                <>
                  Non. A₁ est justement la stratégie de l'ENPS : elle est rationnelle si tout le
                  monde est rationnel et le sait, à tous les niveaux.
                </>
              ),
            },
            {
              text: (
                <>
                  Ils jouent l'ENPS, mais face à des adversaires qui ne le jouent pas, ce n'est pas
                  la meilleure réponse.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui. Les adversaires réels passent souvent. Face à eux, mieux vaut passer et
                  arrêter juste avant qu'ils n'arrêtent : c'est le trade-off du slide 33.
                </>
              ),
            },
            {
              text: <>La backward induction est fausse dans ce jeu.</>,
              explain: (
                <>
                  Non. Le calcul est juste : il donne l'unique ENPS. Ce sont les hypothèses (H1 et
                  la chaîne des H2) qui ne décrivent pas bien tous les joueurs réels.
                </>
              ),
            },
          ]}
        />

        {/* ---------------------------------------------------------- */}
        <H4>Bilan du laboratoire</H4>
        <MiniTbl
          head={["Ce que prédit la théorie", "Observé", ""]}
          rows={[
            [<><strong>Base · H1</strong> : J2 joue B−C</>, "90 %", <Ok key="v" />],
            [<><strong>Base · H2.1</strong> : J1 joue Droite</>, "48 %", <Ko key="v" />],
            [<><strong>Ultimatum · H1</strong> : le véto-eur accepte tout montant positif</>, "62 % refusent", <Ko key="v" />],
            [<><strong>Ultimatum · H2.1</strong> : le proposeur offre (7,1)</>, "28 %", <Ko key="v" />],
            [<><strong>Centipède · H1</strong> : j2 joue a₃ (nœud 6)</>, "85 % (15 % p₃)", <Ok key="v" />],
            [<><strong>Centipède · H2.1</strong> : J1 joue A₃ (nœud 5)</>, "85 %", <Ok key="v" />],
            [<><strong>Centipède · ENPS</strong> : J1 arrête d'emblée (A₁)</>, "15 %", <Ko key="v" />],
          ]}
        />
        <p>Ce qui ressort de ces trois jeux :</p>
        <UL>
          <li>
            <strong>H1 tient bien</strong> quand le dernier joueur ne compare que des gains pour
            lui-même (jeu de base, fin du centipède). Elle tombe dans l'ultimatum, où les
            véto-eurs ne jugent pas l'issue uniquement à leur montant.
          </li>
          <li>
            <strong>H2.1 est plus fragile</strong> : beaucoup de joueurs 1 n'anticipent pas la
            rationalité des autres (48 % dans le jeu de base).
          </li>
          <li>
            Plus la chaîne d'anticipations est longue, moins la prédiction colle : presque
            personne ne joue l'ENPS du centipède. Et quand les autres s'écartent de l'équilibre,
            s'en écarter aussi peut être la meilleure réponse.
          </li>
        </UL>

        <Callout variant="examen" title="Associer un chiffre du labo à la bonne hypothèse">
          <p>
            Question classique : « quelle hypothèse ce pourcentage teste-t-il ? ». Repère qui
            joue. Le <strong>dernier</strong> joueur n'a besoin que de sa propre rationalité :{" "}
            <strong>H1</strong> (90 % B−C, 62 % de refus, 15 % p₃). L'
            <strong>avant-dernier</strong> doit en plus croire l'autre rationnel :{" "}
            <strong>H2.1</strong> (48 % Droite, 85 % A₃, la proposition (7,1)). Un joueur placé
            encore plus tôt a besoin de H2.2, H2.3… (A₁ dans le centipède).
          </p>
        </Callout>
      </Section>
    </>
  );
}
