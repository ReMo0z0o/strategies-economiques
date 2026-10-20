/*
 * Chapitre B2 (jeux séquentiels) — PartImparfaite : § 7 à § 10 (slides 34-42 du deck S6).
 * § 7 information imparfaite : le jeu du marché public (histoire, paiements recalculés,
 * ensemble d'information, sous-jeu et stratégie précisés, backward induction adaptée,
 * résolution et ENPS) · § 8 exercice guidé du slide 42 (sous-jeu simultané sans EN pur,
 * EN mixte par indifférence) · § 9 exercices récapitulatifs (jeux d'entraînement, solutions
 * vérifiées par calcul) · § 10 checklist de maîtrise et mini-quiz final.
 *
 * Les arbres sont dessinés avec la boîte à outils partagée `@/chapters/shared/gametree`
 * (tracé calculé à partir des paiements).
 */

import { useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { cn } from "@/lib/utils";
import {
  BackwardInductionPlayer,
  GameTreeSvg,
  GT_COLORS,
  PayoffChip,
  leaf,
  node,
  type GTGame,
} from "@/chapters/shared/gametree";
import { H4 } from "./ui";
import { ProcurementGame } from "./anim/ProcurementGame";
import { MixedSubgameExercise } from "./anim/MixedSubgameExercise";

/* ------------------------------------------------------------------ */
/* Petits helpers de mise en page locaux                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Listes (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Une étape d'un raisonnement : pastille, titre (le « quoi »), puis l'explication. */
function Step({ n, title, children }: { n: ReactNode; title: ReactNode; children: ReactNode }) {
  return (
    <div className="my-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[12.5px] font-bold text-primary-foreground">
          {n}
        </span>
        <div className="font-semibold leading-snug">{title}</div>
      </div>
      <div className="mt-1.5 space-y-2 text-[15.5px] leading-relaxed">{children}</div>
    </div>
  );
}

/** Pastille de renvoi au slide (repère pour réviser avec le deck du cours). */
function Slide({ n }: { n: string }) {
  return (
    <span className="ml-1 inline-flex items-center rounded-md border px-1.5 py-0.5 align-middle text-[11.5px] font-semibold text-muted-foreground">
      slide {n}
    </span>
  );
}

/** Étiquette « exemple d'entraînement » (jeux inventés pour s'exercer). */
function Training() {
  return (
    <span className="mr-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 align-middle text-[11.5px] font-bold uppercase tracking-wide text-amber-800">
      exemple d'entraînement
    </span>
  );
}

/**
 * Cadre d'un arbre statique. Le SVG peut déborder de quelques pixels (largeur
 * des libellés gras légèrement sous-estimée par le tracé) : on le laisse visible.
 */
function TreeFigure({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
  return (
    <figure className="my-5 rounded-xl border bg-card px-3 py-4 shadow-sm sm:px-5 [&_svg[role=img]]:overflow-visible">
      {children}
      {caption ? (
        <figcaption className="mt-3 text-center text-[13.5px] leading-snug text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/** Nom (ou action) coloré d'un joueur. */
function Who({ c, children }: { c: number; children: ReactNode }) {
  return (
    <strong className="whitespace-nowrap" style={{ color: GT_COLORS[c] }}>
      {children}
    </strong>
  );
}

/**
 * Matrice 2×2 d'un sous-jeu simultané, aux couleurs des joueurs de l'arbre
 * (le composant PayoffMatrix impose rouge/bleu, ce qui contredirait l'arbre
 * quand les joueurs du sous-jeu sont la firme 1 et la firme 2, ou J2 et J3).
 * `extra` : petite mention sous chaque case (ex. payoff d'un troisième joueur).
 */
function BiMatrix({
  rowName,
  colName,
  rows,
  cols,
  cells,
  colors,
  highlight = [],
  extra,
  caption,
}: {
  rowName: string;
  colName: string;
  rows: string[];
  cols: string[];
  cells: Array<Array<[number | string, number | string]>>;
  colors: [string, string];
  highlight?: Array<[number, number]>;
  extra?: ReactNode[][];
  caption?: ReactNode;
}) {
  const isHl = (i: number, j: number) => highlight.some(([a, b]) => a === i && b === j);
  return (
    <figure className="my-4">
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1.5 text-[15px]">
          <thead>
            <tr>
              <th />
              <th
                colSpan={cols.length}
                className="pb-0.5 text-center text-xs font-bold uppercase tracking-wide"
                style={{ color: colors[1] }}
              >
                {colName}
              </th>
            </tr>
            <tr>
              <th className="pr-1 text-right text-xs font-bold uppercase tracking-wide" style={{ color: colors[0] }}>
                {rowName}
              </th>
              {cols.map((c) => (
                <th key={c} className="px-2 text-center font-bold" style={{ color: colors[1] }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r}>
                <th className="pr-1 text-right font-bold" style={{ color: colors[0] }}>
                  {r}
                </th>
                {cols.map((c, j) => (
                  <td
                    key={c}
                    className={cn(
                      "min-w-[5.5rem] rounded-lg border bg-card px-3 py-2 text-center font-bold tabular-nums",
                      isHl(i, j) && "border-2 border-primary bg-accent",
                    )}
                  >
                    <span style={{ color: colors[0] }}>{cells[i][j][0]}</span> ;{" "}
                    <span style={{ color: colors[1] }}>{cells[i][j][1]}</span>
                    {extra ? (
                      <div className="mt-0.5 text-[11.5px] font-medium text-muted-foreground">{extra[i][j]}</div>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="mt-1 text-center text-[13px] leading-snug text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/** Carte « une fin du jeu » : qui est retenu, le calcul, les paiements. */
function EndCard({ title, who, calc, value }: { title: ReactNode; who: ReactNode; calc: ReactNode; value: number[] }) {
  return (
    <div className="rounded-xl border bg-card px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold">{title}</span>
        <PayoffChip game={PROC} value={value} />
      </div>
      <div className="text-muted-foreground">{who}</div>
      <div className="text-[13.5px]">{calc}</div>
    </div>
  );
}

/** Liste à cocher (progression locale à la page). */
function MasteryChecklist({ items }: { items: ReactNode[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  return (
    <div className="my-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Progression : {done.size} / {items.length}
      </div>
      <div className="grid gap-2">
        {items.map((it, i) => {
          const checked = done.has(i);
          return (
            <label
              key={i}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[15px] leading-relaxed transition-colors",
                checked ? "border-emerald-300 bg-emerald-50" : "bg-card hover:border-emerald-300",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(i)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>{it}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jeux du deck (paiements vérifiés sur les PNG des slides 35 et 42)   */
/* ------------------------------------------------------------------ */

/** Marché public (slide 35) : paiements (Fonctionnaire ; Firme 1 ; Firme 2). */
const PROC: GTGame = {
  players: [
    { name: "Fonctionnaire", color: GT_COLORS[0] },
    { name: "Firme 1", color: GT_COLORS[1] },
    { name: "Firme 2", color: GT_COLORS[2] },
  ],
  root: node("f", 0, [
    [
      "Une",
      node("u", 1, [
        ["H", leaf("uh", [0, 6, 0])],
        ["B", leaf("ub", [2, 4, 0])],
      ]),
    ],
    [
      "Deux",
      node("d", 1, [
        [
          "H",
          node("d2h", 2, [
            ["H", leaf("hh", [0, 3, 3])],
            ["B", leaf("hb", [2, 0, 4])],
          ], { info: "f2" }),
        ],
        [
          "B",
          node("d2b", 2, [
            ["H", leaf("bh", [2, 4, 0])],
            ["B", leaf("bb", [2, 2, 2])],
          ], { info: "f2" }),
        ],
      ]),
    ],
  ]),
};

/** Tracé resserré : arbre plus grand (donc plus lisible) sur téléphone. */
const PROC_LAYOUT = { leafGap: 54, levelGap: 72 };

/** Exercice du slide 42 : paiements (J1 ; J2 ; J3). */
const EXO42: GTGame = {
  players: [
    { name: "J1", color: GT_COLORS[0] },
    { name: "J2", color: GT_COLORS[1] },
    { name: "J3", color: GT_COLORS[2] },
  ],
  root: node("j1", 0, [
    ["Out", leaf("out", [8, 8, 8])],
    [
      "In",
      node("j2", 1, [
        [
          "H",
          node("j3h", 2, [
            ["G", leaf("hg", [16, 1, 0])],
            ["D", leaf("hd", [0, 0, 1])],
          ], { info: "j3" }),
        ],
        [
          "B",
          node("j3b", 2, [
            ["G", leaf("bg", [0, 0, 3])],
            ["D", leaf("bd", [0, 3, 0])],
          ], { info: "j3" }),
        ],
      ]),
    ],
  ]),
};

/* ------------------------------------------------------------------ */
/* Jeux d'entraînement du § 9 (inventés ; solutions vérifiées par      */
/* calcul : backward induction, forme normale, EN purs et mixtes)       */
/* ------------------------------------------------------------------ */

const TWO: GTGame["players"] = [
  { name: "J1", color: GT_COLORS[0] },
  { name: "J2", color: GT_COLORS[1] },
];
const THREE: GTGame["players"] = [...TWO, { name: "J3", color: GT_COLORS[2] }];

/** Ex. 2 : J1 joue deux fois (x0, x3), J2 deux fois (x1, x2). */
const G_PLANS: GTGame = {
  players: TWO,
  root: node(
    "x0",
    0,
    [
      [
        "A",
        node(
          "x1",
          1,
          [
            ["c", leaf("c", [1, 3])],
            [
              "d",
              node(
                "x3",
                0,
                [
                  ["e", leaf("e", [4, 1])],
                  ["f", leaf("f", [0, 0])],
                ],
                { name: "x3" },
              ),
            ],
          ],
          { name: "x1" },
        ),
      ],
      [
        "B",
        node(
          "x2",
          1,
          [
            ["g", leaf("g", [2, 1])],
            ["h", leaf("h", [3, 0])],
          ],
          { name: "x2" },
        ),
      ],
    ],
    { name: "x0" },
  ),
};

/** Ex. 3 : une menace non crédible de J2. */
const G_THREAT: GTGame = {
  players: TWO,
  root: node("r", 0, [
    [
      "G",
      node("n1", 1, [
        ["a", leaf("la", [3, 1])],
        ["b", leaf("lb", [0, 0])],
      ]),
    ],
    [
      "D",
      node("n2", 1, [
        ["c", leaf("lc", [2, 2])],
        ["d", leaf("ld", [1, 1])],
      ]),
    ],
  ]),
};

/** Ex. 4 : trois joueurs, quatre nœuds (H1, H2.1, H2.2). */
const G_THREE: GTGame = {
  players: THREE,
  root: node(
    "x0",
    0,
    [
      [
        "A",
        node(
          "x1",
          1,
          [
            [
              "a",
              node(
                "x2",
                2,
                [
                  ["g", leaf("g", [3, 0, 1])],
                  ["d", leaf("d", [4, 2, 0])],
                ],
                { name: "x2" },
              ),
            ],
            [
              "b",
              node(
                "x3",
                0,
                [
                  ["e", leaf("e", [1, 3, 2])],
                  ["f", leaf("f", [0, 1, 4])],
                ],
                { name: "x3" },
              ),
            ],
          ],
          { name: "x1" },
        ),
      ],
      ["B", leaf("B", [2, 1, 3])],
    ],
    { name: "x0" },
  ),
};

/** Ex. 5 : entrée puis choix simultané d'un format (deux EN dans le sous-jeu). */
const G_FORMAT: GTGame = {
  players: [
    { name: "Firme 1", color: GT_COLORS[0] },
    { name: "Firme 2", color: GT_COLORS[1] },
  ],
  root: node("e0", 0, [
    ["Passer", leaf("p", [2, 4])],
    [
      "Entrer",
      node("e1", 0, [
        [
          "X",
          node("fx", 1, [
            ["x", leaf("xx", [4, 1])],
            ["y", leaf("xy", [0, 0])],
          ], { info: "f2" }),
        ],
        [
          "Y",
          node("fy", 1, [
            ["x", leaf("yx", [0, 0])],
            ["y", leaf("yy", [1, 3])],
          ], { info: "f2" }),
        ],
      ]),
    ],
  ]),
};

/** Ex. 6 : sous-jeu simultané sans EN pur (variante du slide 42). */
const G_MIXED: GTGame = {
  players: THREE,
  root: node("k1", 0, [
    ["Out", leaf("kout", [5, 1, 1])],
    [
      "In",
      node("k2", 1, [
        [
          "H",
          node("k3h", 2, [
            ["G", leaf("khg", [12, 2, 0])],
            ["D", leaf("khd", [0, 0, 1])],
          ], { info: "k3" }),
        ],
        [
          "B",
          node("k3b", 2, [
            ["G", leaf("kbg", [0, 0, 1])],
            ["D", leaf("kbd", [6, 1, 0])],
          ], { info: "k3" }),
        ],
      ]),
    ],
  ]),
};

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export function PartImparfaite() {
  return (
    <>
      <SectionMarchePublic />
      <SectionExerciceGuide />
      <SectionExercices />
      <SectionChecklist />
    </>
  );
}

/* ================================================================== */
/* § 7 — Information imparfaite : le jeu du marché public             */
/* ================================================================== */

function SectionMarchePublic() {
  return (
    <Section id="s7" kicker="§ 7" title="Information imparfaite : le jeu du marché public">
      <Lead>
        Jusqu'ici, chaque joueur voyait tout ce qui s'était passé avant lui : c'est l'
        <strong>information parfaite</strong>. Mais certains jeux séquentiels contiennent un
        « morceau simultané » : deux joueurs choisissent sans voir le choix de l'autre{" "}
        <Slide n="34" />. Ce paragraphe t'apprend à dessiner ce morceau, puis à adapter tes trois
        outils : sous-jeu, stratégie et backward induction.
      </Lead>
      <p className="mt-2">
        <TheoryRef chapter="bseq" section="s2" />
      </p>

      {/* -------------------------------------------------------------- */}
      <H4>1. L'histoire : un fonctionnaire, une ou deux offres <Slide n="34" /></H4>
      <p>
        Un <strong>fonctionnaire</strong> doit faire réaliser une infrastructure publique (un pont,
        une école…). Voici les règles du jeu, une par une :
      </p>
      <UL>
        <li>
          Le fonctionnaire choisit d'abord : demander une offre de prix à{" "}
          <strong>une seule firme</strong> (la firme 1), ou à <strong>deux firmes</strong> (firmes 1
          et 2). On note ces deux actions <strong>U</strong> (« Une ») et <strong>D</strong>{" "}
          (« Deux »).
        </li>
        <li>
          Les firmes <strong>savent combien d'offres</strong> le fonctionnaire a demandées.
        </li>
        <li>
          Chaque firme sollicitée remet une offre au <strong>prix haut (H)</strong> ou au{" "}
          <strong>prix bas (B)</strong>.
        </li>
        <li>
          Si les deux firmes sont sollicitées, elles remettent leur offre{" "}
          <strong>simultanément</strong> : aucune ne connaît le prix de l'autre au moment de choisir.
        </li>
        <li>
          Le fonctionnaire accepte l'offre au <strong>prix le plus bas</strong>. Si les deux offres
          sont identiques, il en choisit une à <strong>pile ou face</strong>.
        </li>
      </UL>

      {/* -------------------------------------------------------------- */}
      <H4>2. Des règles aux paiements <Slide n="35" /></H4>
      <p>Le slide fixe quatre nombres :</p>
      <UL>
        <li>
          l'<strong>utilité du fonctionnaire</strong> quand l'infrastructure est réalisée : 8 ;
        </li>
        <li>
          le <strong>prix haut</strong> : 8, et le <strong>prix bas</strong> : 6 ;
        </li>
        <li>
          le <strong>coût de construction</strong> pour la firme sélectionnée : 2.
        </li>
      </UL>
      <p>On en déduit trois règles de calcul (ce que chacun gagne, une fois le prix connu) :</p>
      <MB tex="\begin{aligned} u_{\text{Fonctionnaire}} &= 8 - \text{prix payé} \\ u_{\text{firme retenue}} &= \text{prix} - 2 \\ u_{\text{firme non retenue}} &= 0 \end{aligned}" />
      <p>
        Il reste le cas de l'<strong>égalité</strong> : le fonctionnaire tire à pile ou face. Chaque
        firme a alors <strong>1 chance sur 2</strong> d'être retenue. Son payoff est son gain{" "}
        <strong>moyen</strong> (son gain espéré), comme le payoff attendu des stratégies mixtes en
        B1. Par exemple, si les deux firmes proposent 8 :
      </p>
      <MB tex="u_{\text{firme}} = \tfrac{1}{2} \times (8 - 2) + \tfrac{1}{2} \times 0 = \tfrac{1}{2} \times 6 = 3" />
      <p>
        Et le fonctionnaire paie 8 quelle que soit la firme tirée au sort : il obtient{" "}
        <span className="whitespace-nowrap"><M tex="8 - 8 = 0" />.</span> Voici les six fins possibles, recalculées une à une (ordre des
        paiements : <Who c={0}>Fonctionnaire</Who> ; <Who c={1}>Firme 1</Who> ;{" "}
        <Who c={2}>Firme 2</Who>) :
      </p>
      <div className="my-4 grid gap-2.5 sm:grid-cols-2">
        <EndCard
          title="U, firme 1 : H"
          who="Firme 1 retenue (seule offre), au prix 8."
          calc={
            <>
              <M tex="8-8=0" /> ; <M tex="8-2=6" /> ; 0 (pas sollicitée)
            </>
          }
          value={[0, 6, 0]}
        />
        <EndCard
          title="U, firme 1 : B"
          who="Firme 1 retenue (seule offre), au prix 6."
          calc={
            <>
              <M tex="8-6=2" /> ; <M tex="6-2=4" /> ; 0
            </>
          }
          value={[2, 4, 0]}
        />
        <EndCard
          title="D, H et H"
          who="Égalité à 8 : pile ou face."
          calc={
            <>
              <M tex="8-8=0" /> ; <M tex="\tfrac12 \times 6=3" /> ; <M tex="\tfrac12 \times 6=3" />
            </>
          }
          value={[0, 3, 3]}
        />
        <EndCard
          title="D, H et B"
          who="Firme 2 retenue (moins chère), au prix 6."
          calc={
            <>
              <M tex="8-6=2" /> ; 0 ; <M tex="6-2=4" />
            </>
          }
          value={[2, 0, 4]}
        />
        <EndCard
          title="D, B et H"
          who="Firme 1 retenue (moins chère), au prix 6."
          calc={
            <>
              <M tex="8-6=2" /> ; <M tex="6-2=4" /> ; 0
            </>
          }
          value={[2, 4, 0]}
        />
        <EndCard
          title="D, B et B"
          who="Égalité à 6 : pile ou face."
          calc={
            <>
              <M tex="8-6=2" /> ; <M tex="\tfrac12 \times 4=2" /> ; <M tex="\tfrac12 \times 4=2" />
            </>
          }
          value={[2, 2, 2]}
        />
      </div>
      <p className="text-[13.5px] text-muted-foreground">
        Dans les cartes « D », la première lettre est le prix de la firme 1, la seconde celui de la
        firme 2. Chaque calcul suit l'ordre fonctionnaire ; firme 1 ; firme 2.
      </p>
      <p>On obtient la forme étendue du slide 35 :</p>
      <TreeFigure
        caption={
          <>
            Le jeu du marché public (slide 35). Le <strong>pointillé</strong> relie les deux nœuds de
            la firme 2 : elle ne sait pas si la firme 1 a proposé H ou B. Paiements de haut en bas :
            fonctionnaire, firme 1, firme 2.
          </>
        }
      >
        <GameTreeSvg
          game={PROC}
          layout={PROC_LAYOUT}
          infoLabels={{ f2: "Firme 2" }}
          ariaLabel="Arbre du jeu du marché public : le fonctionnaire choisit Une ou Deux offres ; après Une, la firme 1 choisit H ou B ; après Deux, la firme 1 choisit H ou B puis la firme 2 choisit H ou B sans voir le prix de la firme 1."
        />
      </TreeFigure>
      <Callout variant="attention" title="Lis bien l'ordre des paiements">
        <p>
          Il y a <strong>trois</strong> joueurs, donc trois nombres sous chaque nœud final, dans
          l'ordre fonctionnaire, firme 1, firme 2 (les couleurs t'aident : rouge, bleu, vert). Après
          « Une », la firme 2 n'est pas sollicitée : elle reçoit 0, mais on écrit quand même son
          paiement.
        </p>
      </Callout>

      {/* -------------------------------------------------------------- */}
      <H4>3. Information complète, mais imparfaite <Slide n="36" /></H4>
      <p>
        Le slide 36 dit que ce jeu est à information <strong>complète, mais imparfaite</strong>.
        Compare avec le jeu de l'entrée, qui était à information parfaite (slide 7) :
      </p>
      <div className="my-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
            Jeu de l'entrée
          </div>
          <div className="text-[15px] font-bold">Information parfaite</div>
          <UL>
            <li>
              <strong>Information complète</strong> : chacun connaît la structure du jeu, l'ensemble
              de stratégies et la fonction de payoffs de tous ses adversaires.
            </li>
            <li>
              <strong>Toutes</strong> les actions passées sont connues avant que l'action suivante
              soit choisie.
            </li>
          </UL>
          <p className="text-[14px] text-muted-foreground">
            La firme 2 voit si la firme 1 est entrée avant de choisir.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Marché public
          </div>
          <div className="text-[15px] font-bold">Information imparfaite</div>
          <UL>
            <li>
              <strong>Information complète</strong> : pareil, chacun connaît le jeu et tous les
              payoffs.
            </li>
            <li>
              <strong>Certaines</strong> actions passées ne sont pas connues avant que l'action
              suivante soit choisie.
            </li>
          </UL>
          <p className="text-[14px] text-muted-foreground">
            Au moment de choisir son prix, la firme 2 ignore le prix choisi par la firme 1.
          </p>
        </div>
      </div>
      <Callout variant="examen" title="Complète ≠ parfaite">
        <p>
          « Complète » parle de ce que les joueurs savent <em>du jeu</em> (règles, payoffs).
          « Parfaite » parle de ce qu'ils savent <em>de la partie en cours</em> (les coups déjà
          joués). Le marché public est à information <strong>complète</strong> (la firme 2 connaît
          tous les payoffs) mais <strong>imparfaite</strong> (elle ne voit pas un coup).
        </p>
      </Callout>

      {/* -------------------------------------------------------------- */}
      <H4>4. L'ensemble d'information <Slide n="36" /></H4>
      <Callout variant="definition" title="Définition — ensemble d'information">
        <p>
          Un <strong>ensemble d'information</strong> contient tous les nœuds de décision entre
          lesquels le joueur <strong>ne sait pas faire la différence</strong> au moment de choisir son
          action. Le joueur ignore auquel de ces nœuds il se trouve. On le dessine en reliant ces
          nœuds par un <strong>segment en pointillé</strong>.
        </p>
      </Callout>
      <Callout variant="intuition" title="Une image : la pièce sans fenêtre">
        <p>
          Imagine la firme 2 dans une pièce sans fenêtre. On lui dit : « le fonctionnaire a demandé
          deux offres, la firme 1 a déjà remis la sienne ; à toi ». Elle sait qu'elle est{" "}
          <em>soit</em> au nœud « après H », <em>soit</em> au nœud « après B », mais pas lequel.
          Pour elle, ces deux nœuds sont <strong>une seule et même situation</strong> : c'est son
          ensemble d'information. Sur l'arbre, ses deux nœuds sont reliés par le pointillé.
        </p>
      </Callout>
      <p>Le slide ajoute deux remarques :</p>
      <Step n="a" title="Tous les nœuds d'un ensemble d'information permettent les mêmes actions.">
        <p>
          Ici, la firme 2 a le choix entre H et B à ses deux nœuds. C'est logique : si les actions
          possibles étaient différentes, la firme 2 n'aurait qu'à regarder ses options pour deviner
          où elle se trouve, et elle ne serait plus dans l'ignorance.
        </p>
      </Step>
      <Step n="b" title="Si le joueur sait exactement où il se trouve, son ensemble d'information contient un seul nœud.">
        <p>
          La firme 1 a deux nœuds (après U et après D), mais elle sait combien d'offres ont été
          demandées : elle sait toujours où elle est. Elle a donc{" "}
          <strong>deux ensembles d'information d'un seul nœud</strong> chacun. Le fonctionnaire, au
          nœud de départ, a lui aussi un ensemble d'un seul nœud. Dans un jeu à information
          parfaite, <em>tous</em> les ensembles d'information ont un seul nœud.
        </p>
      </Step>
      <Callout variant="attention" title="Le pointillé n'est pas une action">
        <p>
          Le segment en pointillé ne relie pas deux positions par un coup : personne ne « passe » de
          l'un à l'autre. Il dit seulement « ces deux nœuds, le joueur ne les distingue pas ».
        </p>
      </Callout>

      {/* -------------------------------------------------------------- */}
      <H4>5. Où commence un sous-jeu ? <Slide n="37" /></H4>
      <p>
        Rappel (§ 3) : un sous-jeu commence à un nœud qui n'est pas final et contient tous les
        nœuds et les arêtes qui suivent ce nœud. En information parfaite, on en déduisait que{" "}
        <strong>chaque nœud non final ouvre un sous-jeu</strong>. Avec de l'information
        imparfaite, ce n'est plus vrai : il faut préciser la règle.{" "}
        <TheoryRef chapter="bseq" section="s3" />
      </p>
      <Callout variant="definition" title="Définition précisée — sous-jeu (slide 37)">
        <p>
          Un <strong>sous-jeu</strong> commence à un nœud de décision qui appartient à un{" "}
          <strong>ensemble d'information ne contenant qu'un seul nœud</strong>.
        </p>
      </Callout>
      <p>
        Pourquoi ? Si on faisait commencer un sous-jeu au nœud « firme 2 après H », on couperait le
        pointillé : dans ce morceau de jeu, la firme 2 saurait qu'elle est après H. Ce ne serait plus
        le problème qu'elle affronte vraiment. Un sous-jeu doit être un « jeu à part entière », où
        chacun sait exactement ce qu'il sait dans le jeu complet.
      </p>
      <p>Le jeu du marché public a donc trois sous-jeux :</p>
      <UL>
        <li>
          le <strong>jeu complet</strong> (il commence au nœud du fonctionnaire) ;
        </li>
        <li>
          le <strong>sous-jeu qui suit U</strong> : la firme 1 seule choisit H ou B ;
        </li>
        <li>
          le <strong>sous-jeu qui suit D</strong> : la firme 1 choisit, puis la firme 2 choisit
          « dans le noir ». C'est le <strong>sous-jeu simultané</strong> du slide 37 : tout se passe
          comme si les deux firmes jouaient en même temps.
        </li>
      </UL>
      <p>Les deux nœuds de la firme 2 ne commencent aucun sous-jeu (ils sont dans le même ensemble).</p>
      <TreeFigure
        caption={
          <>
            Les deux derniers sous-jeux (slides 37 et 40). Le sous-jeu qui suit D est le « sous-jeu
            simultané » du slide 37.
          </>
        }
      >
        <GameTreeSvg
          game={PROC}
          layout={PROC_LAYOUT}
          infoLabels={{ f2: "Firme 2" }}
          boxes={[
            { root: "u", label: "Sous-jeu suivant U" },
            { root: "d", label: "Sous-jeu suivant D (simultané)", color: "#a16207" },
          ]}
          ariaLabel="Arbre du marché public avec deux encadrés : le sous-jeu qui suit Une (firme 1 seule) et le sous-jeu simultané qui suit Deux."
        />
      </TreeFigure>

      {/* -------------------------------------------------------------- */}
      <H4>6. Une stratégie = une action pour chaque ensemble d'information <Slide n="38" /></H4>
      <p>
        En information parfaite, une stratégie est un <strong>plan d'action complet</strong> : ce que
        le joueur fait à chacun de ses nœuds, même ceux que ses propres choix empêchent d'atteindre
        (slide 15). Le slide 38 précise cette définition :
      </p>
      <Callout variant="definition" title="Définition précisée — stratégie (slide 38)">
        <p>
          Une <strong>stratégie</strong> précise l'action que le joueur prend pour{" "}
          <strong>chaque ensemble d'information</strong> auquel il doit faire un choix.
        </p>
      </Callout>
      <p>
        Pourquoi par ensemble d'information et pas par nœud ? Parce qu'un joueur ne peut pas faire
        dépendre son action de ce qu'il ne sait pas. La firme 2 ne peut pas dire « je joue B si la
        firme 1 a joué H » : elle ne le voit pas. Appliquons la définition aux trois joueurs :
      </p>
      <Step n={1} title="Le fonctionnaire : un seul nœud de décision.">
        <MB tex="S_F = \{U, D\}" />
      </Step>
      <Step n={2} title="La firme 1 : deux nœuds, dans deux ensembles d'information différents.">
        <p>
          Elle choisit un prix après U <em>et</em> un prix après D, soit <M tex="2 \times 2 = 4" />{" "}
          stratégies :
        </p>
        <MB tex="S_1 = \{s_1,\ s_1',\ s_1'',\ s_1'''\}" />
        <UL>
          <li>
            <M tex="s_1 = (H \text{ si } U,\ H \text{ si } D)" /> ;
          </li>
          <li>
            <M tex="s_1' = (H \text{ si } U,\ B \text{ si } D)" /> ;
          </li>
          <li>
            <M tex="s_1'' = (B \text{ si } U,\ H \text{ si } D)" /> ;
          </li>
          <li>
            <span className="whitespace-nowrap"><M tex="s_1''' = (B \text{ si } U,\ B \text{ si } D)" />.</span>
          </li>
        </UL>
      </Step>
      <Step n={3} title="La firme 2 : deux nœuds, mais un seul ensemble d'information.">
        <p>
          Elle ne choisit qu'une fois, « dans le noir » : <span className="whitespace-nowrap"><M tex="S_2 = \{H, B\}" />.</span> Seulement deux
          stratégies.
        </p>
      </Step>
      <Callout variant="methode" title="Compter les stratégies d'un joueur">
        <p>
          Multiplie entre eux les nombres d'actions disponibles à{" "}
          <strong>chacun de ses ensembles d'information</strong>. Firme 1 : deux ensembles à 2
          actions → <span className="whitespace-nowrap"><M tex="2 \times 2 = 4" />.</span> Firme 2 : un seul ensemble à 2 actions → 2. Si on
          avait compté (à tort) nœud par nœud, on aurait trouvé 4 pour la firme 2.
        </p>
      </Callout>
      <Callout variant="retiens" title="Les deux règles des § 3 et § 4, généralisées">
        <UL>
          <li>
            <strong>Nombre de stratégies.</strong> Information parfaite : produit des nombres
            d'actions à chacun des <em>nœuds</em> du joueur. Information imparfaite : produit des
            nombres d'actions à chacun de ses <strong>ensembles d'information</strong> (slide 38).
          </li>
          <li>
            <strong>Où commence un sous-jeu ?</strong> Information parfaite : à chaque nœud non
            final. Information imparfaite : seulement à un nœud dont l'ensemble d'information ne
            contient <strong>qu'un seul nœud</strong> (slide 37).
          </li>
        </UL>
        <p>
          En information parfaite, chaque ensemble d'information est un nœud seul : les deux
          versions disent alors la même chose. Les règles de l'information imparfaite sont donc les
          règles générales.
        </p>
      </Callout>

      {/* -------------------------------------------------------------- */}
      <H4>7. La backward induction, version information imparfaite <Slide n="39" /></H4>
      <p>
        Une fois les sous-jeux et les stratégies précisés, la méthode reste celle du § 4 : partir
        des derniers sous-jeux et remonter. Une seule différence : un dernier sous-jeu peut être{" "}
        <strong>simultané</strong>. On n'y cherche plus « le meilleur choix d'un joueur » mais un{" "}
        <strong>équilibre de Nash</strong>, avec les outils de B1 (dominance, meilleures réponses,
        stratégies mixtes).
      </p>
      <p className="flex flex-wrap gap-1.5">
        <TheoryRef chapter="bseq" section="s4" />
        <TheoryRef chapter="b1" section="s5" />
      </p>
      <Callout variant="methode" title="Backward induction en information imparfaite (slide 39)">
        <ol className="my-1 list-decimal space-y-1.5 pl-5">
          <li>
            <strong>Identifier les derniers sous-jeux.</strong>
          </li>
          <li>
            <strong>Trouver les EN des derniers sous-jeux.</strong>
          </li>
          <li>
            <strong>Remplacer les derniers sous-jeux par les payoffs associés à leur EN.</strong>{" "}
            S'il y a plusieurs EN, en choisir un et continuer ; ensuite, recommencer la procédure à
            cet endroit pour chacun des autres EN.
          </li>
          <li>
            <strong>Itérer jusqu'à atteindre le nœud initial.</strong>
          </li>
        </ol>
      </Callout>
      <p>
        Le point 3 compte à l'examen : un sous-jeu qui a deux EN ouvre deux pistes de raisonnement,
        et donc parfois deux ENPS. Tu le pratiqueras à l'exercice 5 du § 9.
      </p>

      <p>
        L'animation ci-dessous déroule toute l'analyse du marché public en cinq étapes ; le texte
        qui suit reprend chaque étape en détail.
      </p>
      <ProcurementGame />

      {/* -------------------------------------------------------------- */}
      <H4>8. Résolution du marché public <Slide n="40" /> <Slide n="41" /></H4>
      <p>On applique la méthode. Les deux derniers sous-jeux sont ceux qui suivent U et D.</p>

      <Step n={1} title="Le sous-jeu qui suit U : la firme 1 est seule.">
        <p>
          La firme 1 compare H, qui lui rapporte <strong>6</strong>, et B, qui lui rapporte{" "}
          <strong>4</strong>. Comme <span className="whitespace-nowrap"><M tex="6 > 4" />,</span> la stratégie (de sous-jeu) B est{" "}
          <strong>dominée par H</strong> : une firme rationnelle (H1) joue H. Sans concurrente, elle
          n'a aucune raison de baisser son prix. Ce sous-jeu génère{" "}
          <PayoffChip game={PROC} value={[0, 6, 0]} />.
        </p>
      </Step>

      <Step n={2} title="Le sous-jeu qui suit D : on l'écrit comme un jeu simultané.">
        <p>
          Les deux firmes choisissent sans se voir : on peut donc écrire ce sous-jeu sous forme
          normale. Firme 1 en lignes, firme 2 en colonnes ; chaque case donne (firme 1 ; firme 2).
          Le fonctionnaire ne joue pas dans ce sous-jeu : ses paiements (0 si H et H, 2 sinon) sont
          simplement « transportés » jusqu'au bout.
        </p>
        <BiMatrix
          rowName="Firme 1"
          colName="Firme 2"
          rows={["H", "B"]}
          cols={["H", "B"]}
          cells={[
            [
              [3, 3],
              [0, 4],
            ],
            [
              [4, 0],
              [2, 2],
            ],
          ]}
          colors={[GT_COLORS[1], GT_COLORS[2]]}
          extra={[
            ["fonct. : 0", "fonct. : 2"],
            ["fonct. : 2", "fonct. : 2"],
          ]}
          highlight={[[1, 1]]}
          caption="Sous-jeu simultané qui suit D (slide 40) : (firme 1 ; firme 2), et en petit le payoff du fonctionnaire."
        />
        <p>Cherchons une stratégie dominante pour la firme 1 :</p>
        <UL>
          <li>
            si la firme 2 joue H : B rapporte 4, H rapporte 3, et <M tex="4 > 3" /> ;
          </li>
          <li>
            si la firme 2 joue B : B rapporte 2, H rapporte 0, et <span className="whitespace-nowrap"><M tex="2 > 0" />.</span>
          </li>
        </UL>
        <p>
          B est donc <strong>strictement dominante</strong> pour la firme 1. Les payoffs sont
          symétriques : même raisonnement pour la firme 2 (4 &gt; 3 et 2 &gt; 0). Le profil{" "}
          <strong>(B, B) est un ESD</strong> (équilibre en stratégies dominantes), donc aussi
          l'unique EN de ce sous-jeu. Il génère <PayoffChip game={PROC} value={[2, 2, 2]} />.
        </p>
        <p>
          <TheoryRef chapter="b1" section="s3" />
        </p>
        <Callout variant="intuition" title="Lien avec B1 : un dilemme du prisonnier">
          <p>
            Les deux firmes préféreraient (H, H), qui leur donne 3 chacune, à (B, B), qui leur donne
            2 chacune. Mais chacune est tentée de « casser les prix » pour emporter le marché, et
            elles finissent toutes les deux au prix bas. C'est la structure du dilemme du prisonnier
            de B1 (rapprochement fait ici, le slide ne le dit pas).
          </p>
        </Callout>
      </Step>

      <Step n={3} title="Le jeu réduit : le fonctionnaire anticipe.">
        <p>
          On remplace chaque sous-jeu par le profil de payoffs qu'il génère. Il ne reste que le
          choix du fonctionnaire :
        </p>
        <TreeFigure caption="Le jeu réduit (slide 41) : chaque sous-jeu est remplacé par les payoffs de son EN.">
          <GameTreeSvg
            game={PROC}
            collapsed={{ u: [0, 6, 0], d: [2, 2, 2] }}
            chosen={{ f: 1 }}
            dimOthers
            ariaLabel="Jeu réduit du marché public : Une mène à (0 ; 6 ; 0), Deux mène à (2 ; 2 ; 2)."
            maxW={360}
          />
        </TreeFigure>
        <p>
          Le fonctionnaire compare 0 (avec U) et 2 (avec D). Comme <span className="whitespace-nowrap"><M tex="2 > 0" />,</span> la
          stratégie <strong>U est dominée par la stratégie D</strong> : il demande deux offres.
        </p>
      </Step>

      <Step n={4} title="L'ENPS, écrit comme au slide 41.">
        <p>
          Le seul ENPS de ce jeu est <M tex="(s_F^*, s_1^*, s_2^*)" /> où
        </p>
        <MB tex="\begin{aligned} s_F^* &= D, \\ s_1^* &= (H \text{ si } U,\ B \text{ si } D), \\ s_2^* &= B. \end{aligned}" />
        <p>
          Regarde bien la stratégie de la firme 1 : elle dit ce que la firme 1 ferait{" "}
          <em>aussi</em> après U, alors que U n'est pas joué. C'est un plan d'action complet. Le{" "}
          <strong>résultat</strong> de cet ENPS : deux offres au prix bas, une firme tirée au sort,
          paiements <PayoffChip game={PROC} value={[2, 2, 2]} />.
        </p>
      </Step>

      <Callout variant="retiens" title="Ce que raconte ce jeu">
        <p>
          Avec une seule offre, la firme 1 est en position de monopole et demande le prix haut. Avec
          deux offres, la mise en concurrence pousse les deux firmes vers le prix bas. Le
          fonctionnaire l'anticipe : il a intérêt à solliciter deux firmes.
        </p>
      </Callout>

      <Callout variant="examen" title="Les trois erreurs classiques">
        <UL>
          <li>
            Écrire <M tex="s_1^* = B" /> : ce n'est qu'une action. Il faut le plan complet{" "}
            <span className="whitespace-nowrap"><M tex="(H \text{ si } U,\ B \text{ si } D)" />.</span>
          </li>
          <li>
            Donner à la firme 2 une stratégie qui dépend du prix de la firme 1 : impossible, elle ne
            le voit pas (un seul ensemble d'information, donc <span className="whitespace-nowrap"><M tex="S_2 = \{H, B\}" />).</span>
          </li>
          <li>
            Confondre l'ENPS (un profil de stratégies) avec son résultat (les payoffs{" "}
            <PayoffChip game={PROC} value={[2, 2, 2]} />).
          </li>
        </UL>
      </Callout>

      <Quiz
        scope="bseq"
        id="b2c-q1"
        question="Dans le jeu du marché public, combien de stratégies la firme 2 possède-t-elle ?"
        options={[
          {
            text: "2 : H et B",
            correct: true,
            explain:
              "Oui : ses deux nœuds forment un seul ensemble d'information. Elle choisit une seule fois, sans savoir ce qu'a fait la firme 1.",
          },
          {
            text: "4 : une action après H de la firme 1, une action après B",
            explain:
              "Ce serait vrai si la firme 2 voyait le prix de la firme 1 (information parfaite). Ici elle ne le voit pas : une stratégie donne une action par ensemble d'information, pas par nœud.",
          },
          {
            text: "1 : elle n'a pas le choix",
            explain:
              "Elle choisit bien entre H et B ; elle le fait seulement sans connaître le prix de la firme 1.",
          },
        ]}
      />
      <Quiz
        scope="bseq"
        id="b2c-q2"
        question="Pourquoi aucun sous-jeu ne commence-t-il à un nœud de la firme 2 ?"
        options={[
          {
            text: "Parce que ses nœuds appartiennent à un ensemble d'information qui contient deux nœuds.",
            correct: true,
            explain:
              "C'est la règle du slide 37 : un sous-jeu commence à un nœud dont l'ensemble d'information ne contient qu'un seul nœud. Sinon, on couperait le pointillé et la firme 2 « saurait » où elle est.",
          },
          {
            text: "Parce que la firme 2 joue en dernier.",
            explain:
              "Non : dans le jeu de l'entrée, la firme 2 joue en dernier et un sous-jeu commence pourtant à son nœud (information parfaite).",
          },
          {
            text: "Parce que la firme 2 n'est pas toujours sollicitée.",
            explain:
              "Ce n'est pas le critère. Le critère est la taille de l'ensemble d'information du nœud.",
          },
        ]}
      />
    </Section>
  );
}

/* ================================================================== */
/* § 8 — Exercice guidé du slide 42                                    */
/* ================================================================== */

function SectionExerciceGuide() {
  return (
    <Section id="s8" kicker="§ 8" title="Exercice guidé : information imparfaite et stratégies mixtes">
      <Lead>
        Le deck se termine par un exercice qui réunit deux idées : un{" "}
        <strong>sous-jeu simultané</strong> (comme au § 7) et des{" "}
        <strong>stratégies mixtes</strong> (comme en B1) <Slide n="42" />. Nouveauté : ici, le
        sous-jeu simultané n'a <em>aucun</em> équilibre de Nash en stratégies pures. Il faut donc
        jouer au hasard, de façon rationnelle.
      </Lead>
      <p className="mt-2 flex flex-wrap gap-1.5">
        <TheoryRef chapter="b1" section="s8" />
      </p>

      <ExerciseBlock
        scope="bseq"
        id="b2ex1"
        number={1}
        title="Trouver l'ENPS du jeu du slide 42"
        difficulty={2}
        refs={[
          { chapter: "bseq", section: "s7", label: "Information imparfaite" },
          { chapter: "b1", section: "s8", label: "Stratégies mixtes" },
        ]}
        statement={
          <>
            <p>
              <strong>Exercice (slide 42) : trouver l'ENPS du jeu suivant.</strong> J1 choisit Out
              (le jeu s'arrête, chacun reçoit 8) ou In. Après In, J2 choisit H ou B ; puis J3 choisit
              G ou D <strong>sans savoir</strong> ce qu'a choisi J2 (pointillé). Paiements de haut en
              bas : J1, J2, J3.
            </p>
            <TreeFigure caption="Le jeu du slide 42. Les deux nœuds de J3 forment un seul ensemble d'information.">
              <GameTreeSvg
                game={EXO42}
                layout={{ leafGap: 58, levelGap: 72 }}
                infoLabels={{ j3: "J3" }}
                ariaLabel="Arbre du slide 42 : J1 choisit Out (8 ; 8 ; 8) ou In ; J2 choisit H ou B ; J3 choisit G ou D sans voir le choix de J2. Paiements : HG (16 ; 1 ; 0), HD (0 ; 0 ; 1), BG (0 ; 0 ; 3), BD (0 ; 3 ; 0)."
              />
            </TreeFigure>
          </>
        }
        steps={[
          {
            title: "Repérer les sous-jeux et les stratégies",
            content: (
              <>
                <p>
                  Les deux nœuds de J3 sont dans le <strong>même ensemble d'information</strong> :
                  aucun sous-jeu ne commence chez J3 (slide 37). Il y a donc deux sous-jeux : le jeu
                  complet, et le sous-jeu qui commence au nœud de J2 (après In).
                </p>
                <p>
                  Ce dernier sous-jeu est <strong>simultané</strong> : J3 choisit sans voir J2, tout
                  se passe comme si J2 et J3 jouaient en même temps. Chaque joueur n'a qu'un ensemble
                  d'information, donc deux stratégies pures :{" "}
                  <span className="whitespace-nowrap"><M tex="S_1 = \{In, Out\}" />,</span> <span className="whitespace-nowrap"><M tex="S_2 = \{H, B\}" />,</span>{" "}
                  <span className="whitespace-nowrap"><M tex="S_3 = \{G, D\}" />.</span>
                </p>
              </>
            ),
          },
          {
            title: "Écrire le sous-jeu J2-J3 sous forme normale",
            content: (
              <>
                <p>
                  J2 en lignes, J3 en colonnes ; chaque case donne (J2 ; J3). J1 ne joue pas dans ce
                  sous-jeu : son payoff est noté en petit, on en aura besoin à la fin.
                </p>
                <BiMatrix
                  rowName="J2"
                  colName="J3"
                  rows={["H", "B"]}
                  cols={["G", "D"]}
                  cells={[
                    [
                      [1, 0],
                      [0, 1],
                    ],
                    [
                      [0, 3],
                      [3, 0],
                    ],
                  ]}
                  colors={[GT_COLORS[1], GT_COLORS[2]]}
                  extra={[
                    ["J1 : 16", "J1 : 0"],
                    ["J1 : 0", "J1 : 0"],
                  ]}
                  caption="Le sous-jeu qui suit In : (J2 ; J3), et en petit le payoff de J1."
                />
              </>
            ),
          },
          {
            title: "Chercher un EN en stratégies pures : il n'y en a pas",
            content: (
              <>
                <p>
                  Teste chaque case : y a-t-il un joueur qui gagnerait à changer seul d'action ?
                  Partons de (H, G) et suivons les déviations :
                </p>
                <ol className="my-2 list-decimal space-y-1 pl-5">
                  <li>
                    En (H, G), J3 reçoit 0 ; avec D il recevrait 1. <strong>J3 dévie</strong> → (H, D).
                  </li>
                  <li>
                    En (H, D), J2 reçoit 0 ; avec B il recevrait 3. <strong>J2 dévie</strong> → (B, D).
                  </li>
                  <li>
                    En (B, D), J3 reçoit 0 ; avec G il recevrait 3. <strong>J3 dévie</strong> → (B, G).
                  </li>
                  <li>
                    En (B, G), J2 reçoit 0 ; avec H il recevrait 1. <strong>J2 dévie</strong> → (H, G),
                    et on est revenu au départ.
                  </li>
                </ol>
                <p>
                  On tourne en rond : dans chacune des quatre cases, quelqu'un veut bouger. Le
                  sous-jeu n'a <strong>aucun EN en stratégies pures</strong>. J2 veut « suivre » J3
                  (H avec G, B avec D) ; J3 veut « éviter » J2 (D contre H, G contre B). C'est la
                  logique du matching pennies de B1.
                </p>
              </>
            ),
          },
          {
            title: "L'EN mixte du sous-jeu, par le théorème d'indifférence",
            content: (
              <>
                <p>
                  Notations : <M tex="p" /> = probabilité que J2 joue H (donc B avec{" "}
                  <span className="whitespace-nowrap"><M tex="1-p" />)</span> ; <M tex="q" /> = probabilité que J3 joue G (donc D avec{" "}
                  <span className="whitespace-nowrap"><M tex="1-q" />).</span> Rappel de B1 : dans un EN mixte, chaque joueur qui mélange est{" "}
                  <strong>indifférent</strong> entre ses actions. L'indifférence de J2 fixe donc la
                  probabilité de <em>J3</em>, et inversement.
                </p>
                <SubQuestion label="a) J2 indifférent → q.">
                  Ce que J2 attend de chaque action, si J3 joue G avec la probabilité q :
                </SubQuestion>
                <MB tex="\begin{aligned} u_2(H) &= 1 \cdot q + 0 \cdot (1-q) = q \\ u_2(B) &= 0 \cdot q + 3 \cdot (1-q) = 3 - 3q \end{aligned}" />
                <MB tex="q = 3 - 3q \;\Longrightarrow\; 4q = 3 \;\Longrightarrow\; q^* = \tfrac{3}{4}" />
                <SubQuestion label="b) J3 indifférent → p.">
                  Ce que J3 attend de chaque action, si J2 joue H avec la probabilité p :
                </SubQuestion>
                <MB tex="\begin{aligned} u_3(G) &= 0 \cdot p + 3 \cdot (1-p) = 3 - 3p \\ u_3(D) &= 1 \cdot p + 0 \cdot (1-p) = p \end{aligned}" />
                <MB tex="3 - 3p = p \;\Longrightarrow\; 4p = 3 \;\Longrightarrow\; p^* = \tfrac{3}{4}" />
                <p>
                  <strong>Vérification.</strong> Avec <M tex="q = \tfrac34" /> : J2 obtient{" "}
                  <M tex="\tfrac34" /> avec H et <M tex="3 \times \tfrac14 = \tfrac34" /> avec B ✓.
                  Avec <M tex="p = \tfrac34" /> : J3 obtient <M tex="3 \times \tfrac14 = \tfrac34" />{" "}
                  avec G et <M tex="\tfrac34" /> avec D ✓. Aucun des deux ne gagne à changer : c'est
                  bien un EN (mixte) du sous-jeu.
                </p>
              </>
            ),
          },
          {
            title: "Remplacer le sous-jeu par ses payoffs espérés",
            content: (
              <>
                <p>
                  J1 ne reçoit 16 que si J2 joue H <em>et</em> J3 joue G. Les deux tirages sont
                  indépendants, donc cela arrive avec la probabilité{" "}
                  <span className="whitespace-nowrap"><M tex="p \times q = \tfrac34 \times \tfrac34 = \tfrac{9}{16}" />.</span> Dans les trois
                  autres cases, J1 reçoit 0 :
                </p>
                <MB tex="u_1(In) = 16 \times \tfrac{9}{16} + 0 \times \tfrac{7}{16} = 9" />
                <p>
                  J2 et J3 obtiennent chacun leur valeur d'indifférence, <span className="whitespace-nowrap"><M tex="\tfrac34" />.</span> Le
                  sous-jeu est remplacé par le profil <M tex="(9\ ;\ \tfrac34\ ;\ \tfrac34)" /> :
                </p>
                <TreeFigure caption="Jeu réduit : le sous-jeu qui suit In est remplacé par les payoffs espérés de son EN mixte (0,75 = 3/4).">
                  <GameTreeSvg
                    game={EXO42}
                    collapsed={{ j2: [9, 0.75, 0.75] }}
                    chosen={{ j1: 1 }}
                    dimOthers
                    maxW={300}
                    ariaLabel="Jeu réduit du slide 42 : Out mène à (8 ; 8 ; 8), In mène à (9 ; 0,75 ; 0,75)."
                  />
                </TreeFigure>
              </>
            ),
          },
          {
            title: "Le choix de J1, puis l'ENPS",
            content: (
              <>
                <p>
                  J1 compare Out, qui lui rapporte 8, et In, qui lui rapporte 9 en espérance. Comme{" "}
                  <span className="whitespace-nowrap"><M tex="9 > 8" />,</span> il joue <strong>In</strong>.
                </p>
                <p>
                  L'ENPS, écrit comme au slide 42 : <M tex="(s_1^*, s_2^*, s_3^*)" /> où
                </p>
                <MB tex="\begin{aligned} s_1^* &= In, \\ s_2^* &= H \text{ avec proba } 3/4, \\ s_3^* &= G \text{ avec proba } 3/4. \end{aligned}" />
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              ENPS : J1 joue In ; J2 joue H avec probabilité 3/4 ; J3 joue G avec probabilité 3/4.
              Paiements espérés : 9 pour J1, 3/4 pour J2 et pour J3.
            </p>
            <p>
              La recette : (1) repérer le sous-jeu simultané, (2) constater qu'il n'a pas d'EN pur,
              (3) calculer l'EN mixte par indifférence, (4) remplacer le sous-jeu par ses payoffs{" "}
              <em>espérés</em>, (5) remonter jusqu'au nœud initial.
            </p>
          </>
        }
      />

      <p>
        Manipule maintenant les probabilités toi-même : l'animation montre pourquoi seul le couple
        (3/4 ; 3/4) est un équilibre, et comment le payoff espéré de J1 se compare à 8.
      </p>
      <MixedSubgameExercise />

      <Callout variant="examen" title="Les trois pièges de cet exercice">
        <UL>
          <li>
            <strong>Inverser les rôles.</strong> La probabilité de J2 (<span className="whitespace-nowrap"><M tex="p" />)</span> se calcule
            avec les payoffs de <em>J3</em>, et celle de J3 (<span className="whitespace-nowrap"><M tex="q" />)</span> avec les payoffs de{" "}
            <em>J2</em>. Chacun mélange de façon à rendre l'autre indifférent.
          </li>
          <li>
            <strong>Oublier une probabilité.</strong> Pour avoir 16, il faut H <em>et</em> G :{" "}
            <M tex="16 \times \tfrac34 = 12" /> est faux ; le bon calcul est{" "}
            <span className="whitespace-nowrap"><M tex="16 \times \tfrac34 \times \tfrac34 = 9" />.</span>
          </li>
          <li>
            <strong>Donner seulement « In ».</strong> L'ENPS est un profil de stratégies : il faut
            aussi écrire les stratégies (mixtes) de J2 et de J3.
          </li>
        </UL>
      </Callout>
      <Callout variant="intuition" title="Pourquoi J1 prend-il le risque ?">
        <p>
          Avec In, J1 reçoit 0 dans 7 cas sur 16. Mais il raisonne en payoff espéré, comme tous les
          joueurs de ce cours : 9 en moyenne, c'est plus que les 8 sûrs de Out. À l'inverse, J2 et J3
          préféreraient que J1 joue Out (8 chacun, contre 3/4), mais ce n'est pas eux qui
          choisissent au premier nœud.
        </p>
      </Callout>
      <Callout variant="retiens" title="Pourquoi un ENPS existe quand même">
        <p>
          Le sous-jeu n'a pas d'EN pur, mais il a un EN en stratégies mixtes. C'est l'avantage
          théorique de l'EN vu en B1 : si les joueurs peuvent utiliser des stratégies mixtes, tous
          les jeux ont (au moins) un équilibre de Nash. Chaque sous-jeu simultané a donc un EN, et
          la backward induction peut remonter jusqu'au nœud initial.
        </p>
      </Callout>

      <Quiz
        scope="bseq"
        id="b2c-q3"
        question="Supposons que J3 joue G avec probabilité 1/2 (au lieu de 3/4). Que fait J2 ?"
        options={[
          {
            text: "Il joue B : il en attend 3/2, contre 1/2 avec H.",
            correct: true,
            explain:
              "u₂(H) = 1 × 1/2 = 1/2 et u₂(B) = 3 × 1/2 = 3/2. J2 n'est plus indifférent : il joue B à coup sûr. C'est pour cela que q = 1/2 ne peut pas faire partie d'un équilibre ; seul q = 3/4 rend J2 indifférent.",
          },
          {
            text: "Il reste indifférent entre H et B.",
            explain: "Non : l'indifférence de J2 n'a lieu que pour q = 3/4. Calcule u₂(H) = q et u₂(B) = 3(1 − q) avec q = 1/2.",
          },
          {
            text: "Il joue H : 1 est plus grand que 0.",
            explain:
              "Il faut comparer des payoffs espérés, pas des cases isolées : u₂(H) = 1/2 et u₂(B) = 3/2.",
          },
        ]}
      />
    </Section>
  );
}

/* ================================================================== */
/* § 9 — Exercices récapitulatifs                                      */
/* ================================================================== */

function SectionExercices() {
  return (
    <Section id="s9" kicker="§ 9" title="Exercices récapitulatifs">
      <Lead>
        Six exercices « format examen », dans l'ordre du chapitre. Fais-les{" "}
        <strong>sur papier d'abord</strong>, puis révèle les étapes une à une pour comparer.
      </Lead>
      <p>
        <Training /> Les jeux de ce § sont inventés pour s'entraîner : leurs paiements ne viennent
        pas des slides. Chaque solution a été vérifiée par calcul (backward induction, forme normale,
        équilibres purs et mixtes).
      </p>
      <UL>
        <li>
          <strong>Exercice 2</strong> : écrire et compter les stratégies (plans complets),
          backward induction, résultat ≠ profil.
        </li>
        <li>
          <strong>Exercice 3</strong> : forme normale d'un jeu séquentiel, tous les EN, menace non
          crédible, EN qui n'est pas un ENPS.
        </li>
        <li>
          <strong>Exercice 4</strong> : backward induction à trois joueurs, en citant H1, H2.1 et
          H2.2.
        </li>
        <li>
          <strong>Exercice 5</strong> : information imparfaite, sous-jeu simultané avec deux EN
          (règle « plusieurs EN » du slide 39).
        </li>
        <li>
          <strong>Exercice 6</strong> : sous-jeu simultané sans EN pur, stratégies mixtes.
        </li>
        <li>
          <strong>Exercice 7</strong> : vrai ou faux ? Les questions de théorie du chapitre.
        </li>
      </UL>

      {/* ---------------------------------------------------------- */}
      <ExerciseBlock
        scope="bseq"
        id="b2ex2"
        number={2}
        title="Plans complets, résultat et profil"
        difficulty={1}
        refs={[
          { chapter: "bseq", section: "s4", label: "Stratégie = plan complet" },
          { chapter: "bseq", section: "s4", label: "Backward induction" },
        ]}
        statement={
          <>
            <p>
              <Training /> Deux joueurs jouent le jeu ci-dessous (paiements : J1 en haut, J2 en
              bas).
            </p>
            <TreeFigure>
              <GameTreeSvg
                game={G_PLANS}
                layout={{ leafGap: 62 }}
                ariaLabel="Arbre : en x0, J1 choisit A ou B. Après A, J2 choisit en x1 : c (1 ; 3) ou d ; après d, J1 choisit en x3 : e (4 ; 1) ou f (0 ; 0). Après B, J2 choisit en x2 : g (2 ; 1) ou h (3 ; 0)."
              />
            </TreeFigure>
            <p>
              <strong>a)</strong> Écris toutes les stratégies de J1 et de J2. Combien y a-t-il de
              profils de stratégies ? <strong>b)</strong> Trouve l'ENPS par backward induction, en
              citant l'hypothèse utilisée à chaque étape. <strong>c)</strong> Quels profils de
              stratégies mènent au même résultat que l'ENPS ? Lesquels sont des EN ?
            </p>
          </>
        }
        steps={[
          {
            title: "a) Les stratégies : une action à chaque nœud du joueur",
            content: (
              <>
                <p>
                  J1 décide en <M tex="x_0" /> et en <span className="whitespace-nowrap"><M tex="x_3" />.</span> Une stratégie de J1 dit quoi
                  faire aux <strong>deux</strong> nœuds, même si B empêche d'atteindre{" "}
                  <span className="whitespace-nowrap"><M tex="x_3" />.</span> Avec 2 actions à chaque nœud : <M tex="2 \times 2 = 4" />{" "}
                  stratégies, notées comme au slide 15 (action en <span className="whitespace-nowrap"><M tex="x_0" />,</span> puis en{" "}
                  <span className="whitespace-nowrap"><M tex="x_3" />)</span> :
                </p>
                <MB tex="S_1 = \{Ae,\ Af,\ Be,\ Bf\}" />
                <p>
                  J2 décide en <M tex="x_1" /> et en <M tex="x_2" /> : encore{" "}
                  <M tex="2 \times 2 = 4" /> stratégies (action en <span className="whitespace-nowrap"><M tex="x_1" />,</span> puis en{" "}
                  <span className="whitespace-nowrap"><M tex="x_2" />)</span> :
                </p>
                <MB tex="S_2 = \{cg,\ ch,\ dg,\ dh\}" />
                <p>
                  Un profil = une stratégie pour chaque joueur, soit <M tex="4 \times 4 = 16" />{" "}
                  profils.
                </p>
              </>
            ),
          },
          {
            title: "b) Backward induction : des derniers sous-jeux vers x₀",
            content: (
              <>
                <p>
                  <strong>
                    En <M tex="x_3" /> (H1).
                  </strong>{" "}
                  J1 compare e (4) et f (0) : il joue <strong>e</strong>.
                </p>
                <p>
                  <strong>
                    En <M tex="x_2" /> (H1).
                  </strong>{" "}
                  J2 compare g (1) et h (0) : il joue <strong>g</strong>.
                </p>
                <p>
                  <strong>
                    En <M tex="x_1" /> (H2.1).
                  </strong>{" "}
                  J2 pense que J1 est rationnel : s'il joue d, J1 jouera e et J2 recevra 1. Avec c,
                  il reçoit 3. Comme <span className="whitespace-nowrap"><M tex="3 > 1" />,</span> il joue <strong>c</strong>.
                </p>
                <p>
                  <strong>
                    En <M tex="x_0" /> (H2.2).
                  </strong>{" "}
                  J1 pense que J2 pense que J1 est rationnel : A mène à c, donc à (1 ; 3), soit 1
                  pour lui ; B mène à g, donc à (2 ; 1), soit 2. Comme <span className="whitespace-nowrap"><M tex="2 > 1" />,</span> il joue{" "}
                  <strong>B</strong>.
                </p>
                <TreeFigure caption="Les choix de la backward induction ; le chemin surligné mène au résultat (2 ; 1).">
                  <GameTreeSvg
                    game={G_PLANS}
                    layout={{ leafGap: 62 }}
                    chosen={{ x3: 0, x2: 0, x1: 0, x0: 1 }}
                    dimOthers
                    showPath
                    ariaLabel="Solution : e en x3, g en x2, c en x1, B en x0. Résultat (2 ; 1)."
                  />
                </TreeFigure>
                <p>
                  ENPS : <strong>(Be, cg)</strong>, résultat (2 ; 1). Note que l'ENPS contient e et
                  c, deux actions qui ne sont jamais jouées : un ENPS dit aussi ce qui se passerait
                  hors du chemin suivi.
                </p>
              </>
            ),
          },
          {
            title: "c) Un résultat, plusieurs profils",
            content: (
              <>
                <p>
                  Le résultat (2 ; 1) est atteint dès que J1 joue B en <M tex="x_0" /> et J2 joue g
                  en <span className="whitespace-nowrap"><M tex="x_2" />.</span> Ce que prévoient leurs stratégies ailleurs n'y change rien. Il
                  y a donc <strong>4 profils</strong> : (Be, cg), (Be, dg), (Bf, cg), (Bf, dg).
                </p>
                <UL>
                  <li>
                    <strong>(Be, cg)</strong> : EN, et c'est l'ENPS.
                  </li>
                  <li>
                    <strong>(Bf, cg)</strong> : EN (aucun joueur ne gagne à dévier seul : avec cg, A
                    ne rapporte que 1 à J1), mais <strong>pas ENPS</strong>. Dans le sous-jeu qui
                    commence en <span className="whitespace-nowrap"><M tex="x_3" />,</span> f rapporte 0 à J1 au lieu de 4 : ce n'est pas un EN
                    de ce sous-jeu. Comme <M tex="x_3" /> n'est jamais atteint, ce mauvais plan ne
                    coûte rien dans le jeu complet.
                  </li>
                  <li>
                    <strong>(Be, dg)</strong> et <strong>(Bf, dg)</strong> : <strong>pas des EN</strong>.
                    Si J2 prévoit d en <span className="whitespace-nowrap"><M tex="x_1" />,</span> J1 gagne à dévier vers Ae : A, puis d, puis
                    e lui rapporte 4 au lieu de 2.
                  </li>
                </UL>
              </>
            ),
          },
        ]}
        result={
          <p>
            4 stratégies pour chacun, 16 profils. ENPS : (Be, cg), résultat (2 ; 1). Quatre profils
            mènent à ce résultat, deux sont des EN, un seul est l'ENPS (même idée qu'au slide 18).
          </p>
        }
      />

      {/* ---------------------------------------------------------- */}
      <ExerciseBlock
        scope="bseq"
        id="b2ex3"
        number={3}
        title="Forme normale, EN et menace non crédible"
        difficulty={2}
        refs={[
          { chapter: "bseq", section: "s1", label: "Menace non crédible" },
          { chapter: "bseq", section: "s3", label: "ENPS" },
        ]}
        statement={
          <>
            <p>
              <Training /> J1 choisit G ou D. J2 observe ce choix, puis répond : a ou b après G, c ou
              d après D.
            </p>
            <TreeFigure>
              <GameTreeSvg
                game={G_THREAT}
                ariaLabel="Arbre : J1 choisit G ou D. Après G, J2 choisit a (3 ; 1) ou b (0 ; 0). Après D, J2 choisit c (2 ; 2) ou d (1 ; 1)."
              />
            </TreeFigure>
            <p>
              <strong>a)</strong> Écris les stratégies de chaque joueur et la forme normale du jeu.{" "}
              <strong>b)</strong> Trouve tous les EN en stratégies pures. <strong>c)</strong> Trouve
              l'ENPS. <strong>d)</strong> Pour chaque EN qui n'est pas un ENPS, explique ce qui
              cloche. Lequel repose sur une menace non crédible ?
            </p>
          </>
        }
        steps={[
          {
            title: "a) Stratégies et forme normale",
            content: (
              <>
                <p>
                  J1 n'a qu'un nœud : <span className="whitespace-nowrap"><M tex="S_1 = \{G, D\}" />.</span> J2 a deux nœuds (après G, après
                  D), donc 4 stratégies. On note « ac » le plan « a si G, c si D » :
                </p>
                <MB tex="S_2 = \{ac,\ ad,\ bc,\ bd\}" />
                <p>
                  Pour remplir une case, on suit l'arbre. Exemple : (G, bc) : J1 joue G, J2 répond
                  par la première lettre de son plan, b, donc (0 ; 0). La seconde lettre (c) ne sert
                  pas, car le nœud qui suit D n'est pas atteint.
                </p>
                <PayoffMatrix
                  rowPlayer="J1"
                  colPlayer="J2"
                  rows={["G", "D"]}
                  cols={["ac", "ad", "bc", "bd"]}
                  payoffs={[
                    [
                      [3, 1],
                      [3, 1],
                      [0, 0],
                      [0, 0],
                    ],
                    [
                      [2, 2],
                      [1, 1],
                      [2, 2],
                      [1, 1],
                    ],
                  ]}
                />
              </>
            ),
          },
          {
            title: "b) Tous les EN, par les meilleures réponses",
            content: (
              <>
                <p>
                  <strong>Meilleures réponses de J1</strong> (colonne par colonne) : contre ac → G
                  (3 &gt; 2) ; contre ad → G (3 &gt; 1) ; contre bc → D (2 &gt; 0) ; contre bd → D
                  (1 &gt; 0).
                </p>
                <p>
                  <strong>Meilleures réponses de J2</strong> (ligne par ligne) : contre G → ac et ad
                  (1, contre 0 pour bc et bd) ; contre D → ac et bc (2, contre 1).
                </p>
                <p>
                  Les cases où les deux se croisent sont les EN :{" "}
                  <strong>(G, ac)</strong>, <strong>(G, ad)</strong> et <strong>(D, bc)</strong>.
                  D'après le théorème du slide 5, ce sont aussi les EN du jeu séquentiel. Vérifie
                  avec les boutons :
                </p>
                <PayoffMatrix
                  rowPlayer="J1"
                  colPlayer="J2"
                  rows={["G", "D"]}
                  cols={["ac", "ad", "bc", "bd"]}
                  payoffs={[
                    [
                      [3, 1],
                      [3, 1],
                      [0, 0],
                      [0, 0],
                    ],
                    [
                      [2, 2],
                      [1, 1],
                      [2, 2],
                      [1, 1],
                    ],
                  ]}
                  interactive
                />
              </>
            ),
          },
          {
            title: "c) L'ENPS par backward induction",
            content: (
              <p>
                Après G, J2 compare a (1) et b (0) : il joue a (H1). Après D, il compare c (2) et d
                (1) : il joue c (H1). J1 anticipe (H2.1) : G lui rapporte 3, D lui rapporte 2. Il
                joue G. ENPS : <strong>(G, ac)</strong>, résultat (3 ; 1).
              </p>
            ),
          },
          {
            title: "d) Les deux EN qui ne sont pas des ENPS",
            content: (
              <>
                <p>
                  <strong>(D, bc) : la menace non crédible.</strong> J2 « menace » de jouer b si J1
                  joue G, ce qui leur donnerait 0 à tous les deux. Face à cette menace, J1 préfère D
                  (2 &gt; 0), et J2 obtient 2 au lieu de 1. Mais la menace n'est pas crédible : si J1
                  jouait vraiment G, J2 rationnel jouerait a (1 &gt; 0). Dans le sous-jeu qui suit
                  G, b n'est pas un EN : (D, bc) n'est donc pas parfait en sous-jeux. C'est
                  exactement le (P, G) du jeu de l'entrée.
                </p>
                <p>
                  <strong>(G, ad) : même résultat que l'ENPS, mais pas ENPS.</strong> Il mène à
                  (3 ; 1), comme (G, ac). Mais le plan de J2 prévoit d après D, alors que c lui
                  rapporterait 2 au lieu de 1. Dans le sous-jeu qui suit D, d n'est pas un EN. Ce
                  nœud n'étant pas atteint, l'erreur ne se voit pas dans le jeu complet.
                </p>
              </>
            ),
          },
        ]}
        result={
          <p>
            3 EN : (G, ac), (G, ad), (D, bc). Seul (G, ac) est un ENPS. (D, bc) repose sur la menace
            non crédible « b si G » ; (G, ad) contient un choix irrationnel hors du chemin suivi.
          </p>
        }
      />

      {/* ---------------------------------------------------------- */}
      <ExerciseBlock
        scope="bseq"
        id="b2ex4"
        number={4}
        title="Trois joueurs : citer H1, H2.1, H2.2"
        difficulty={2}
        refs={[{ chapter: "bseq", section: "s4", label: "Backward induction" }]}
        statement={
          <>
            <p>
              <Training /> Trois joueurs (paiements de haut en bas : J1, J2, J3).
            </p>
            <TreeFigure>
              <GameTreeSvg
                game={G_THREE}
                layout={{ leafGap: 62 }}
                ariaLabel="Arbre : en x0, J1 choisit A ou B (2 ; 1 ; 3). Après A, J2 choisit en x1 : a ou b. Après a, J3 choisit en x2 : g (3 ; 0 ; 1) ou d (4 ; 2 ; 0). Après b, J1 choisit en x3 : e (1 ; 3 ; 2) ou f (0 ; 1 ; 4)."
              />
            </TreeFigure>
            <p>
              <strong>a)</strong> Combien de stratégies a chaque joueur ? <strong>b)</strong> Trouve
              l'ENPS par backward induction en citant, à chaque étape, l'hypothèse nécessaire.{" "}
              <strong>c)</strong> Quel est le résultat ?
            </p>
          </>
        }
        steps={[
          {
            title: "a) Compter les stratégies",
            content: (
              <p>
                J1 décide en <M tex="x_0" /> et en <M tex="x_3" /> : <M tex="2 \times 2 = 4" />{" "}
                stratégies (Ae, Af, Be, Bf). J2 n'a qu'un nœud (<span className="whitespace-nowrap"><M tex="x_1" />)</span> : 2 stratégies (a,
                b). J3 aussi (<span className="whitespace-nowrap"><M tex="x_2" />)</span> : 2 stratégies (g, d).
              </p>
            ),
          },
          {
            title: "b) Les derniers sous-jeux : x₂ et x₃ (H1)",
            content: (
              <>
                <p>
                  Toutes leurs branches mènent à des nœuds finaux. Il suffit que le joueur soit
                  rationnel (H1).
                </p>
                <p>
                  <strong>
                    En <M tex="x_2" />
                  </strong>
                  , J3 compare g (1) et d (0) : il joue <strong>g</strong>.{" "}
                  <strong>
                    En <M tex="x_3" />
                  </strong>
                  , J1 compare e (1) et f (0) : il joue <strong>e</strong>.
                </p>
              </>
            ),
          },
          {
            title: "b) Le sous-jeu en x₁ (H2.1)",
            content: (
              <p>
                J2 pense que J3 et J1 sont rationnels (H2.1) : il anticipe g après a, et e après b.
                Donc a lui rapporte 0 (issue (3 ; 0 ; 1)) et b lui rapporte 3 (issue (1 ; 3 ; 2)).
                Comme <span className="whitespace-nowrap"><M tex="3 > 0" />,</span> il joue <strong>b</strong>.
              </p>
            ),
          },
          {
            title: "b) Le nœud initial x₀ (H2.2)",
            content: (
              <p>
                J1 pense que J2 pense que les autres sont rationnels (H2.2) : il anticipe que A mène
                à b puis e, soit (1 ; 3 ; 2), donc 1 pour lui. B lui rapporte 2. Comme{" "}
                <span className="whitespace-nowrap"><M tex="2 > 1" />,</span> il joue <strong>B</strong>.
              </p>
            ),
          },
          {
            title: "c) L'ENPS et son résultat",
            content: (
              <>
                <p>
                  ENPS : <span className="whitespace-nowrap"><M tex="(s_1^*, s_2^*, s_3^*) = (Be,\ b,\ g)" />,</span> résultat{" "}
                  <strong>(2 ; 1 ; 3)</strong>. Les stratégies de J2 et J3 décrivent des nœuds qui
                  ne sont pas atteints : elles restent indispensables, car ce sont elles qui
                  expliquent pourquoi J1 joue B. Rejoue le raisonnement :
                </p>
                <div className="[&_svg[role=img]]:overflow-visible">
                  <BackwardInductionPlayer
                    game={G_THREE}
                    layout={{ leafGap: 62 }}
                    title="Backward induction à trois joueurs"
                    subtitle="Exemple d'entraînement : x₂ et x₃ (H1), puis x₁ (H2.1), puis x₀ (H2.2)."
                    ariaLabel="Animation de la backward induction de l'exercice 4."
                  />
                </div>
              </>
            ),
          },
        ]}
        result={
          <p>
            J1 : 4 stratégies, J2 : 2, J3 : 2. ENPS (Be, b, g), résultat (2 ; 1 ; 3). Plus un nœud
            est loin de la fin, plus l'hypothèse est exigeante : H1 aux derniers nœuds, H2.1 juste
            avant, H2.2 au nœud initial.
          </p>
        }
      />

      {/* ---------------------------------------------------------- */}
      <ExerciseBlock
        scope="bseq"
        id="b2ex5"
        number={5}
        title="Entrer, puis choisir un format sans voir l'autre"
        difficulty={2}
        refs={[
          { chapter: "bseq", section: "s7", label: "Backward induction adaptée" },
          { chapter: "b1", section: "s8", label: "Stratégies mixtes" },
        ]}
        statement={
          <>
            <p>
              <Training /> La firme 1 hésite à entrer sur le marché de la firme 2. Si elle passe, la
              firme 2 garde son marché : (2 ; 4). Si elle entre, les deux firmes choisissent{" "}
              <strong>simultanément</strong> un format technique : X ou Y pour la firme 1, x ou y
              pour la firme 2 (la même lettre désigne le même format). Formats compatibles : elles se
              partagent le marché, mais la firme 1 préfère le format X, la firme 2 le format y.
              Formats incompatibles : personne ne gagne rien.
            </p>
            <TreeFigure>
              <GameTreeSvg
                game={G_FORMAT}
                infoLabels={{ f2: "Firme 2" }}
                ariaLabel="Arbre : la firme 1 choisit Passer (2 ; 4) ou Entrer ; après Entrer, elle choisit X ou Y ; la firme 2 choisit x ou y sans voir ce choix. Paiements : X-x (4 ; 1), X-y (0 ; 0), Y-x (0 ; 0), Y-y (1 ; 3)."
              />
            </TreeFigure>
            <p>
              <strong>a)</strong> Pourquoi ce jeu est-il à information imparfaite ? Quels sont ses
              sous-jeux ? <strong>b)</strong> Écris les ensembles de stratégies.{" "}
              <strong>c)</strong> Trouve tous les ENPS en stratégies pures. <strong>d)</strong>{" "}
              (Pour aller plus loin) Le sous-jeu a aussi un EN mixte. Quel ENPS donne-t-il ?
            </p>
          </>
        }
        steps={[
          {
            title: "a) Information imparfaite et sous-jeux",
            content: (
              <p>
                La firme 2 choisit son format sans connaître celui de la firme 1 : ses deux nœuds
                forment <strong>un seul ensemble d'information</strong>. Information complète
                (tout le monde connaît les payoffs) mais imparfaite. Sous-jeux : le jeu complet et
                celui qui commence au second nœud de la firme 1 (après Entrer), qui est seul dans son
                ensemble. Aucun sous-jeu ne commence chez la firme 2. Il y a donc{" "}
                <strong>2 sous-jeux</strong>.
              </p>
            ),
          },
          {
            title: "b) Les stratégies",
            content: (
              <>
                <p>
                  La firme 1 a deux ensembles d'information (le départ, et après Entrer) :{" "}
                  <M tex="2 \times 2 = 4" /> stratégies.
                </p>
                <MB tex="S_1 = \{(\text{Passer}, X),\ (\text{Passer}, Y),\ (\text{Entrer}, X),\ (\text{Entrer}, Y)\}" />
                <p>
                  La firme 2 a un seul ensemble d'information : <span className="whitespace-nowrap"><M tex="S_2 = \{x, y\}" />.</span>
                </p>
              </>
            ),
          },
          {
            title: "c) Les EN du sous-jeu simultané",
            content: (
              <>
                <BiMatrix
                  rowName="Firme 1"
                  colName="Firme 2"
                  rows={["X", "Y"]}
                  cols={["x", "y"]}
                  cells={[
                    [
                      [4, 1],
                      [0, 0],
                    ],
                    [
                      [0, 0],
                      [1, 3],
                    ],
                  ]}
                  colors={[GT_COLORS[0], GT_COLORS[1]]}
                  highlight={[
                    [0, 0],
                    [1, 1],
                  ]}
                  caption="Le sous-jeu qui suit Entrer (exemple d'entraînement)."
                />
                <p>
                  Meilleures réponses de la firme 1 : contre x → X (4 &gt; 0) ; contre y → Y (1 &gt;
                  0). Meilleures réponses de la firme 2 : contre X → x (1 &gt; 0) ; contre Y → y (3
                  &gt; 0). Deux EN purs : <strong>(X, x)</strong> et <strong>(Y, y)</strong>. C'est
                  une bataille des sexes (B1).
                </p>
                <p>
                  Le slide 39 dit : <em>s'il y a plusieurs EN, en choisir un et continuer, puis
                  recommencer à cet endroit pour chacun des autres EN</em>. Deux pistes, donc.
                </p>
              </>
            ),
          },
          {
            title: "c) Piste 1 : le sous-jeu joue (X, x)",
            content: (
              <p>
                Le sous-jeu est remplacé par (4 ; 1). Au départ, la firme 1 compare Entrer (4) et
                Passer (2) : elle entre. <strong>ENPS n° 1</strong> :{" "}
                <span className="whitespace-nowrap"><M tex="s_1 = (\text{Entrer}, X)" />,</span> <span className="whitespace-nowrap"><M tex="s_2 = x" />.</span> Résultat (4 ; 1).
              </p>
            ),
          },
          {
            title: "c) Piste 2 : le sous-jeu joue (Y, y)",
            content: (
              <>
                <p>
                  Le sous-jeu est remplacé par (1 ; 3). La firme 1 compare Entrer (1) et Passer (2) :
                  elle passe. <strong>ENPS n° 2</strong> : <span className="whitespace-nowrap"><M tex="s_1 = (\text{Passer}, Y)" />,</span>{" "}
                  <span className="whitespace-nowrap"><M tex="s_2 = y" />.</span> Résultat (2 ; 4).
                </p>
                <p>
                  Ici, « y » n'est <em>pas</em> une menace non crédible : si la firme 1 entrait,
                  (Y, y) serait un EN du sous-jeu, donc un comportement rationnel. Et le plan de la
                  firme 1 contient Y, même si elle passe : c'est ce qu'elle ferait si elle entrait.
                </p>
              </>
            ),
          },
          {
            title: "d) Pour aller plus loin : l'EN mixte du sous-jeu",
            content: (
              <>
                <p>
                  Notations : <M tex="p" /> = probabilité de X (firme 1), <M tex="q" /> =
                  probabilité de x (firme 2).
                </p>
                <p>Firme 2 indifférente (cela fixe p) :</p>
                <MB tex="\begin{aligned} u_2(x) &= 1 \cdot p + 0 \cdot (1-p) = p \\ u_2(y) &= 0 \cdot p + 3 \cdot (1-p) = 3 - 3p \end{aligned}" />
                <MB tex="p = 3 - 3p \;\Longrightarrow\; 4p = 3 \;\Longrightarrow\; p^* = \tfrac34" />
                <p>Firme 1 indifférente (cela fixe q) :</p>
                <MB tex="\begin{aligned} u_1(X) &= 4 \cdot q + 0 \cdot (1-q) = 4q \\ u_1(Y) &= 0 \cdot q + 1 \cdot (1-q) = 1 - q \end{aligned}" />
                <MB tex="4q = 1 - q \;\Longrightarrow\; 5q = 1 \;\Longrightarrow\; q^* = \tfrac15" />
                <p>
                  Payoff espéré de la firme 1 dans le sous-jeu : <M tex="4 \times \tfrac15 = 0{,}8" />{" "}
                  (même chose avec Y : <span className="whitespace-nowrap"><M tex="1 - \tfrac15 = 0{,}8" />).</span> Au départ :{" "}
                  <span className="whitespace-nowrap"><M tex="2 > 0{,}8" />,</span> elle passe. <strong>ENPS n° 3</strong> :{" "}
                  <span className="whitespace-nowrap"><M tex="s_1 = (\text{Passer} ;\ X \text{ avec proba } 3/4)" />,</span>{" "}
                  <span className="whitespace-nowrap"><M tex="s_2 = x \text{ avec proba } 1/5" />.</span>
                </p>
              </>
            ),
          },
        ]}
        result={
          <p>
            Deux ENPS en stratégies pures : ((Entrer, X), x) avec le résultat (4 ; 1), et ((Passer,
            Y), y) avec le résultat (2 ; 4). L'EN mixte du sous-jeu donne un troisième ENPS, où la
            firme 1 passe. Retiens la règle du slide 39 : un EN du sous-jeu = une piste à suivre
            jusqu'au bout.
          </p>
        }
      />

      {/* ---------------------------------------------------------- */}
      <ExerciseBlock
        scope="bseq"
        id="b2ex6"
        number={6}
        title="Un sous-jeu sans EN pur : entrer ou pas ?"
        difficulty={2}
        refs={[
          { chapter: "bseq", section: "s8", label: "Exercice du slide 42" },
          { chapter: "b1", section: "s8", label: "Stratégies mixtes" },
        ]}
        statement={
          <>
            <p>
              <Training /> Même structure qu'au slide 42, autres paiements. J3 choisit sans voir le
              choix de J2 (paiements de haut en bas : J1, J2, J3).
            </p>
            <TreeFigure>
              <GameTreeSvg
                game={G_MIXED}
                layout={{ leafGap: 58, levelGap: 72 }}
                infoLabels={{ k3: "J3" }}
                ariaLabel="Arbre : J1 choisit Out (5 ; 1 ; 1) ou In ; J2 choisit H ou B ; J3 choisit G ou D sans voir J2. Paiements : HG (12 ; 2 ; 0), HD (0 ; 0 ; 1), BG (0 ; 0 ; 1), BD (6 ; 1 ; 0)."
              />
            </TreeFigure>
            <p>Trouve l'ENPS de ce jeu. Détaille chaque calcul.</p>
          </>
        }
        steps={[
          {
            title: "Le sous-jeu simultané et ses EN purs (il n'y en a pas)",
            content: (
              <>
                <BiMatrix
                  rowName="J2"
                  colName="J3"
                  rows={["H", "B"]}
                  cols={["G", "D"]}
                  cells={[
                    [
                      [2, 0],
                      [0, 1],
                    ],
                    [
                      [0, 1],
                      [1, 0],
                    ],
                  ]}
                  colors={[GT_COLORS[1], GT_COLORS[2]]}
                  extra={[
                    ["J1 : 12", "J1 : 0"],
                    ["J1 : 0", "J1 : 6"],
                  ]}
                  caption="Le sous-jeu qui suit In : (J2 ; J3), et en petit le payoff de J1."
                />
                <p>
                  Cycle des déviations : en (H, G), J3 passe à D (1 &gt; 0) ; en (H, D), J2 passe à B
                  (1 &gt; 0) ; en (B, D), J3 passe à G (1 &gt; 0) ; en (B, G), J2 passe à H (2 &gt;
                  0). Aucune case n'est stable : <strong>pas d'EN pur</strong>.
                </p>
              </>
            ),
          },
          {
            title: "L'EN mixte par indifférence",
            content: (
              <>
                <p>
                  <M tex="p" /> = probabilité que J2 joue H, <M tex="q" /> = probabilité que J3 joue
                  G.
                </p>
                <p>J2 indifférent (cela fixe q) :</p>
                <MB tex="\begin{aligned} u_2(H) &= 2 \cdot q + 0 \cdot (1-q) = 2q \\ u_2(B) &= 0 \cdot q + 1 \cdot (1-q) = 1 - q \end{aligned}" />
                <MB tex="2q = 1 - q \;\Longrightarrow\; 3q = 1 \;\Longrightarrow\; q^* = \tfrac13" />
                <p>J3 indifférent (cela fixe p) :</p>
                <MB tex="\begin{aligned} u_3(G) &= 0 \cdot p + 1 \cdot (1-p) = 1 - p \\ u_3(D) &= 1 \cdot p + 0 \cdot (1-p) = p \end{aligned}" />
                <MB tex="1 - p = p \;\Longrightarrow\; 2p = 1 \;\Longrightarrow\; p^* = \tfrac12" />
                <p>
                  Vérification : avec <span className="whitespace-nowrap"><M tex="q = \tfrac13" />,</span> J2 obtient <M tex="\tfrac23" /> avec
                  H comme avec B ✓ ; avec <span className="whitespace-nowrap"><M tex="p = \tfrac12" />,</span> J3 obtient{" "}
                  <M tex="\tfrac12" /> avec G comme avec D ✓.
                </p>
              </>
            ),
          },
          {
            title: "Le payoff espéré de J1 s'il joue In",
            content: (
              <>
                <p>
                  Cette fois, J1 gagne quelque chose dans <strong>deux</strong> cases : 12 en (H, G)
                  et 6 en (B, D). Leurs probabilités :
                </p>
                <MB tex="\begin{aligned} P(H, G) &= p\,q = \tfrac12 \times \tfrac13 = \tfrac16 \\ P(B, D) &= (1-p)(1-q) = \tfrac12 \times \tfrac23 = \tfrac13 \end{aligned}" />
                <MB tex="u_1(In) = 12 \times \tfrac16 + 6 \times \tfrac13 = 2 + 2 = 4" />
              </>
            ),
          },
          {
            title: "Le choix de J1 et l'ENPS",
            content: (
              <>
                <p>
                  Out rapporte 5 à J1, In seulement 4 en espérance. Comme <span className="whitespace-nowrap"><M tex="5 > 4" />,</span> J1
                  joue <strong>Out</strong>. ENPS :
                </p>
                <MB tex="\begin{aligned} s_1^* &= Out, \\ s_2^* &= H \text{ avec proba } 1/2, \\ s_3^* &= G \text{ avec proba } 1/3. \end{aligned}" />
                <p>
                  Le sous-jeu n'est pas joué, mais les stratégies de J2 et J3 doivent être écrites :
                  ce sont elles qui expliquent pourquoi J1 préfère Out.
                </p>
              </>
            ),
          },
        ]}
        result={
          <p>
            ENPS : (Out ; H avec proba 1/2 ; G avec proba 1/3), résultat (5 ; 1 ; 1). Le 12 attire
            l'œil, mais (H, G) n'arrive qu'une fois sur 6 : toujours calculer le payoff espéré avant
            de conclure.
          </p>
        }
      />

      {/* ---------------------------------------------------------- */}
      <ExerciseBlock
        scope="bseq"
        id="b2ex7"
        number={7}
        title="Vrai ou faux ? Justifie."
        difficulty={1}
        statement={
          <ol className="list-[lower-alpha] space-y-1 pl-6">
            <li>Tout ENPS est un EN.</li>
            <li>Tout EN d'un jeu séquentiel est un ENPS.</li>
            <li>Pour trouver tous les EN d'un jeu séquentiel, on peut passer par sa forme normale.</li>
            <li>La forme normale contient toute la structure d'un jeu séquentiel.</li>
            <li>
              Un joueur qui a 3 ensembles d'information, avec 2 actions à chacun, a 6 stratégies.
            </li>
            <li>Deux profils de stratégies différents mènent toujours à deux résultats différents.</li>
            <li>Dans un jeu à information imparfaite, chaque nœud de décision commence un sous-jeu.</li>
            <li>Tout jeu séquentiel fini à information complète admet au moins un ENPS.</li>
          </ol>
        }
        steps={[
          {
            title: "a) et b)",
            content: (
              <>
                <p>
                  <strong>a) Vrai.</strong> Un ENPS est, par définition, un EN dont les stratégies
                  forment un EN dans tous les sous-jeux (slide 11). Dans le diagramme de Venn du
                  slide 12, l'ensemble des ENPS est à l'intérieur de celui des EN.
                </p>
                <p>
                  <strong>b) Faux.</strong> Contre-exemple : dans le jeu de l'entrée, (P, G) est un
                  EN mais pas un ENPS, car il repose sur la menace non crédible de guerre des prix.
                </p>
              </>
            ),
          },
          {
            title: "c) et d)",
            content: (
              <>
                <p>
                  <strong>c) Vrai.</strong> Théorème du slide 5 : l'ensemble des EN d'un jeu
                  séquentiel correspond à l'ensemble des EN de sa forme normale.
                </p>
                <p>
                  <strong>d) Faux.</strong> La forme normale ne dit pas quel joueur joue à quel
                  moment, ni ce qu'un joueur sait au moment de jouer (slide 8). C'est pour cela qu'on
                  utilise la forme étendue (l'arbre).
                </p>
              </>
            ),
          },
          {
            title: "e) et f)",
            content: (
              <>
                <p>
                  <strong>e) Faux.</strong> Une stratégie choisit une action à <em>chaque</em>{" "}
                  ensemble d'information : <M tex="2 \times 2 \times 2 = 8" /> stratégies, pas{" "}
                  <span className="whitespace-nowrap"><M tex="2 + 2 + 2 = 6" />.</span>
                </p>
                <p>
                  <strong>f) Faux.</strong> Un même résultat peut être atteint par plusieurs profils
                  : au slide 18, le résultat (2 ; 0) est atteint par (DG, E), (DG, F), (DH, E) et
                  (DH, F).
                </p>
              </>
            ),
          },
          {
            title: "g) et h)",
            content: (
              <>
                <p>
                  <strong>g) Faux.</strong> Un sous-jeu ne commence qu'à un nœud dont l'ensemble
                  d'information ne contient qu'un seul nœud (slide 37). Les nœuds de la firme 2 du
                  marché public ne commencent aucun sous-jeu.
                </p>
                <p>
                  <strong>h) Vrai.</strong> C'est le théorème du slide 13 : un tel jeu admet au moins
                  un ENPS, qu'on trouve par backward induction. Avec un sous-jeu simultané sans EN
                  pur, cet ENPS peut faire appel à des stratégies mixtes (slide 42).
                </p>
              </>
            ),
          },
        ]}
        result={
          <p>
            Vrai : a, c, h. Faux : b, d, e, f, g. À l'examen, un « faux » se justifie toujours par
            un contre-exemple ou par la définition exacte.
          </p>
        }
      />
    </Section>
  );
}

/* ================================================================== */
/* § 10 — Checklist de maîtrise                                        */
/* ================================================================== */

function SectionChecklist() {
  return (
    <Section id="s10" kicker="§ 10" title="Checklist de maîtrise">
      <p>
        Coche honnêtement. Chaque case correspond à ce que le deck te demande de savoir faire ; si
        tu hésites, le § à revoir est indiqué entre parenthèses.
      </p>

      <MasteryChecklist
        items={[
          <>
            J'explique pourquoi l'EN (P, G) du jeu de l'entrée n'est pas une bonne prédiction : il
            repose sur une <strong>menace non crédible</strong> (H1 : la firme 2 accommoderait ;
            H2 : la firme 1 le sait). <em>(§ 1)</em>
          </>,
          <>
            Je connais le cadre du chapitre : jeux <strong>non coopératifs</strong>,{" "}
            <strong>séquentiels</strong>, à <strong>information parfaite</strong> (information
            complète + toutes les actions passées connues), <strong>non répétés</strong>.{" "}
            <em>(§ 2)</em>
          </>,
          <>
            Je sais lire et dessiner un <strong>arbre du jeu</strong> : nœud de départ, nœuds
            intermédiaires, nœuds finaux (un résultat et son profil de payoffs), arêtes (les
            actions). Je sais ce que la forme normale ne dit pas : qui joue quand, qui sait quoi.{" "}
            <em>(§ 2)</em>
          </>,
          <>
            J'écris une stratégie comme un <strong>plan d'action complet</strong>, y compris aux
            nœuds jamais atteints, et je sais compter les stratégies d'un joueur.{" "}
            <em>(§ 4, exercice 2)</em>
          </>,
          <>
            Je sais construire la <strong>forme normale</strong> d'un jeu séquentiel et y trouver
            tous les EN (théorème : les EN du jeu sont les EN de sa forme normale).{" "}
            <em>(§ 1, § 4, exercice 3)</em>
          </>,
          <>
            Je sais définir un <strong>sous-jeu</strong> et un <strong>ENPS</strong>, dessiner
            ENPS ⊂ EN, et montrer qu'un EN n'est pas un ENPS en désignant le sous-jeu où ses
            stratégies ne forment pas un EN. <em>(§ 3, exercice 3)</em>
          </>,
          <>
            Je déroule la <strong>backward induction</strong> en citant l'hypothèse de chaque étape
            (H1, H2.1, H2.2…), avec ou sans jeu réduit, et je connais le théorème d'existence d'un
            ENPS. <em>(§ 4, exercice 4)</em>
          </>,
          <>
            Je distingue <strong>résultat</strong> et <strong>profil de stratégies</strong> : un même
            résultat peut venir de plusieurs profils, dont un seul est l'ENPS.{" "}
            <em>(§ 4, exercice 2)</em>
          </>,
          <>
            Je sais résoudre les <strong>primaires</strong> (4 sous-jeux de l'Électeur, puis MG,
            puis MD), écrire l'ENPS complet et expliquer pourquoi aucun militant ne vote pour son
            candidat favori (g est élu). <em>(§ 5)</em>
          </>,
          <>
            Je sais ce que le <strong>labo</strong> dit de H1 et H2.1 : jeu de base (90 % B−C, mais
            48 % Droite), ultimatum (62 % des véto-eurs refusent un montant positif ; ENPS (7,1) ;
            envie ou équité-punition), centipède (85 % A3, mais seulement 15 % A1).{" "}
            <em>(§ 6)</em>
          </>,
          <>
            Je distingue information <strong>complète</strong> et information{" "}
            <strong>parfaite</strong>, et je sais dessiner un <strong>ensemble d'information</strong>{" "}
            (pointillé, mêmes actions à chaque nœud, un seul nœud si le joueur sait où il est).{" "}
            <em>(§ 7)</em>
          </>,
          <>
            J'applique les définitions précisées : un sous-jeu commence à un ensemble d'information
            d'<strong>un seul nœud</strong> ; une stratégie donne une action par{" "}
            <strong>ensemble d'information</strong> (marché public : 4 stratégies pour la firme 1,
            2 pour la firme 2). <em>(§ 7)</em>
          </>,
          <>
            Je sais faire la backward induction <strong>adaptée</strong> : EN des derniers sous-jeux,
            remplacement par leurs payoffs, une piste par EN s'il y en a plusieurs. Je retrouve
            l'ENPS du marché public : (D ; H si U, B si D ; B). <em>(§ 7, exercice 5)</em>
          </>,
          <>
            Face à un sous-jeu simultané <strong>sans EN pur</strong>, je montre le cycle des
            déviations, je calcule l'EN mixte par indifférence, puis le payoff espéré du joueur
            précédent. Je retrouve l'ENPS du slide 42 (In ; H avec proba 3/4 ; G avec proba 3/4).{" "}
            <em>(§ 8, exercice 6)</em>
          </>,
        ]}
      />

      <H4>Mini-quiz final</H4>
      <p>Six questions qui balaient le chapitre.</p>

      <Quiz
        scope="bseq"
        id="b2c-f1"
        kicker="Quiz final · 1/6"
        question="Dans le jeu de l'entrée, pourquoi l'EN (P, G) n'est-il pas un ENPS ?"
        options={[
          {
            text: "Parce que, dans le sous-jeu qui suit Entrer, Guerre n'est pas un EN : la firme 2 préfère Accommoder.",
            correct: true,
            explain:
              "Oui (slide 11) : Guerre est dominée dans ce sous-jeu (0 < 1). La menace de guerre n'est pas crédible.",
          },
          {
            text: "Parce que (P, G) n'est pas un équilibre de Nash.",
            explain: "Si : c'est un EN de la forme normale (slide 5). Il n'est simplement pas parfait en sous-jeux.",
          },
          {
            text: "Parce que la firme 1 y gagne moins qu'en (E, A).",
            explain:
              "Ce n'est pas le critère : un ENPS se reconnaît à ce que les stratégies forment un EN dans chaque sous-jeu.",
          },
        ]}
      />
      <Quiz
        scope="bseq"
        id="b2c-f2"
        kicker="Quiz final · 2/6"
        question="Un joueur a trois nœuds de décision : deux dans le même ensemble d'information (2 actions possibles), et un troisième seul dans son ensemble (3 actions possibles). Combien a-t-il de stratégies ?"
        options={[
          {
            text: "6",
            correct: true,
            explain:
              "Deux ensembles d'information : 2 actions pour le premier, 3 pour le second, donc 2 × 3 = 6. Les deux nœuds reliés par le pointillé ne comptent qu'une fois.",
          },
          {
            text: "12",
            explain: "Ce serait 2 × 2 × 3, en comptant nœud par nœud. Or on compte par ensemble d'information.",
          },
          { text: "7", explain: "On ne fait pas la somme 2 + 2 + 3 : on multiplie, et par ensemble d'information." },
        ]}
      />
      <Quiz
        scope="bseq"
        id="b2c-f3"
        kicker="Quiz final · 3/6"
        question="Aux primaires, pour qui vote le militant de Droite à l'ENPS ?"
        options={[
          {
            text: "Pour d, qui n'est pas son favori.",
            correct: true,
            explain:
              "S'il votait D, le militant de Gauche répondrait G et l'Électeur élirait G, le pire candidat pour lui. Avec d, g est élu, ce qu'il préfère à G (slides 24-25).",
          },
          {
            text: "Pour D, son candidat favori.",
            explain:
              "Ce serait voter « sincère ». Mais il anticipe que D mène à l'élection de G, qu'il classe en dernier.",
          },
          {
            text: "On ne peut pas le savoir sans connaître le résultat du militant de Gauche.",
            explain:
              "La backward induction répond justement à cette question : le militant de Droite anticipe la réaction du militant de Gauche et de l'Électeur.",
          },
        ]}
      />
      <Quiz
        scope="bseq"
        id="b2c-f4"
        kicker="Quiz final · 4/6"
        question="Au labo (jeu de base), 90 % des joueurs 2 jouent B−C, mais seulement 48 % des joueurs 1 jouent Droite. Quelle hypothèse est surtout mise en défaut ?"
        options={[
          {
            text: "H2.1 : les joueurs 1 n'anticipent pas que les joueurs 2 sont rationnels.",
            correct: true,
            explain:
              "Les joueurs 2 sont en grande majorité rationnels (H1 respectée à 90 %), mais les joueurs 1 semblent choisir au hasard (slide 28).",
          },
          {
            text: "H1 : les joueurs 2 ne sont pas rationnels.",
            explain: "90 % des joueurs 2 évitent leurs stratégies dominées : H1 est plutôt bien vérifiée.",
          },
          {
            text: "Aucune : 48 % est proche de la prédiction.",
            explain: "La théorie prédit 100 % de Droite sous H2.1. 48 %, c'est à peu près le hasard.",
          },
        ]}
      />
      <Quiz
        scope="bseq"
        id="b2c-f5"
        kicker="Quiz final · 5/6"
        question="Jeu de l'ultimatum (montant de 8) : quelle répartition le proposeur choisit-il à l'ENPS ?"
        options={[
          {
            text: "(7,1) : il donne au véto-eur le plus petit montant positif.",
            correct: true,
            explain:
              "Slide 30 : le proposeur anticipe que le véto-eur rationnel accepte n'importe quel montant positif. En classe, pourtant, 62 % des véto-eurs refusaient un montant positif.",
          },
          {
            text: "(4,4) : le partage égal.",
            explain: "C'est un choix fréquent en pratique (13 % des proposeurs), mais ce n'est pas l'ENPS.",
          },
          {
            text: "(5,3) : celle qui a rapporté le plus en classe.",
            explain:
              "(5,3) a obtenu le meilleur payoff moyen (4,48) face aux véto-eurs réels, justement parce qu'ils ne sont pas tous rationnels. L'ENPS, lui, suppose H1 et H2.1.",
          },
        ]}
      />
      <Quiz
        scope="bseq"
        id="b2c-f6"
        kicker="Quiz final · 6/6"
        question="Dans un sous-jeu simultané sans EN pur entre J2 et J3, comment trouves-tu la probabilité p avec laquelle J2 joue H ?"
        options={[
          {
            text: "Avec les payoffs de J3 : p est la valeur qui rend J3 indifférent entre ses deux actions.",
            correct: true,
            explain:
              "C'est le théorème d'indifférence : chacun mélange de façon à rendre l'autre indifférent. Au slide 42 : 3(1 − p) = p, donc p = 3/4.",
          },
          {
            text: "Avec les payoffs de J2 : p est la valeur qui rend J2 indifférent.",
            explain: "C'est le piège classique : l'indifférence de J2 donne la probabilité de J3 (q), pas la sienne.",
          },
          {
            text: "p vaut toujours 1/2 quand il n'y a pas d'EN pur.",
            explain: "Non : dans l'exercice du slide 42, p = 3/4 ; dans l'exercice 6, p = 1/2 mais q = 1/3.",
          },
        ]}
      />

      <Callout variant="retiens" title="🧭 Pour réviser ce chapitre">
        <p>
          Refais les exercices 1 à 7 sans regarder les solutions, puis rejoue les animations de
          backward induction des § 1 à § 5. Le réflexe à garder : <strong>partir de la fin</strong>,
          résoudre chaque dernier sous-jeu (meilleure réponse, ou EN s'il est simultané), le
          remplacer par ses payoffs, et remonter. Puis écrire l'ENPS comme un profil de plans
          complets.
        </p>
      </Callout>
    </Section>
  );
}
