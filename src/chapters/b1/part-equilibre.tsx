/*
 * Chapitre B1 — PartEquilibre (sections affichées dans la page du chapitre).
 * § 5 l'équilibre de Nash (slides 26-35) · § 6 les trois solutions (slides 36-37) ·
 * § 7 le labo et « devine 2/3 de la moyenne » (slides 38-53). Deck S5 « Jeux simultanés ».
 */

import { useState, type ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { ExerciseBlock } from "@/components/course/StepSolution";
import { TheoryRef } from "@/components/course/TheoryRef";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { ConvergenceBars, GuessTwoThirds, NashHunter } from "./interactives";
import { H4, CardGrid } from "./ui";
import { SolutionVenn } from "./anim/SolutionVenn";
import { LabGames } from "./anim/LabGames";

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

/** Liste numérotée. */
function OL({ children }: { children: ReactNode }) {
  return <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:font-semibold">{children}</ol>;
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

/**
 * Une meilleure réponse écrite comme au slide 28 : la phrase, puis l'inégalité
 * entre payoffs, puis la même inégalité en chiffres.
 */
function BR({
  who,
  side,
  against,
  answer,
  ineq,
  nums,
}: {
  who: ReactNode;
  side: "row" | "col";
  against: ReactNode;
  answer: ReactNode;
  ineq: string;
  nums: string;
}) {
  const tone = side === "row" ? "text-rose-700" : "text-sky-700";
  return (
    <div className="rounded-xl border bg-background px-3.5 py-2.5">
      <div className="text-[14px] leading-snug">
        Meilleure réponse de <span className={`font-semibold ${tone}`}>{who}</span> à{" "}
        <strong>{against}</strong> : <strong className={tone}>{answer}</strong>
      </div>
      <div className="mt-1.5 text-center leading-relaxed">
        <M tex={ineq} />
        <br />
        <M tex={nums} />
      </div>
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

/**
 * Matrice compacte (locale) : même code couleur que PayoffMatrix (joueur ligne en rouge,
 * joueur colonne en bleu), mais plus étroite pour tenir sur un téléphone. Avec `stack`,
 * les deux payoffs d'une case s'empilent sur petit écran.
 */
function CompactMatrix({
  rowPlayer,
  colPlayer,
  rows,
  cols,
  cells,
  marks,
  highlight = [],
  stack = false,
  caption,
}: {
  rowPlayer: string;
  colPlayer: string;
  rows: ReactNode[];
  cols: ReactNode[];
  cells: Array<Array<[ReactNode, ReactNode]>>;
  /** marks[r][c] = [souligner le payoff ligne, souligner le payoff colonne] */
  marks?: Array<Array<[boolean, boolean]>>;
  highlight?: Array<[number, number]>;
  stack?: boolean;
  caption?: ReactNode;
}) {
  const hl = new Set(highlight.map(([r, c]) => `${r},${c}`));
  const u = "underline decoration-2 underline-offset-4";
  return (
    <figure className="my-5">
      <div className="overflow-x-auto">
        <div className="inline-block rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
          <div className="mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-sky-700">
            {colPlayer}
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-rose-700"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {rowPlayer}
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1" />
                  {cols.map((c, j) => (
                    <th key={j} className="p-1 text-center text-[13.5px] font-semibold text-sky-700">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rl, r) => (
                  <tr key={r}>
                    <th className="p-1 pr-1.5 text-right text-[13.5px] font-semibold text-rose-700">
                      {rl}
                    </th>
                    {cols.map((_, c) => {
                      const on = hl.has(`${r},${c}`);
                      const [m1, m2] = marks?.[r]?.[c] ?? [false, false];
                      return (
                        <td key={c} className="p-1">
                          <div
                            className={`flex items-center justify-center whitespace-nowrap rounded-lg border-2 px-2 py-2 text-[14.5px] tabular-nums transition-colors ${
                              stack ? "flex-col gap-0.5 sm:flex-row sm:gap-1.5" : "gap-1.5"
                            } ${on ? "border-primary bg-accent" : "border-border bg-background"}`}
                          >
                            <span className={`font-semibold text-rose-700 ${m1 ? u : ""}`}>
                              {cells[r][c][0]}
                            </span>
                            <span className={`text-muted-foreground ${stack ? "hidden sm:inline" : ""}`}>
                              ;
                            </span>
                            <span className={`font-semibold text-sky-700 ${m2 ? u : ""}`}>
                              {cells[r][c][1]}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

/** Meilleures réponses (égalités comprises) : [ligne meilleure dans sa colonne, colonne meilleure dans sa ligne]. */
function brMarks(pay: Pay[][]): Array<Array<[boolean, boolean]>> {
  return pay.map((row, r) =>
    row.map((cell, c) => {
      const best1 = Math.max(...pay.map((rr) => rr[c][0]));
      const best2 = Math.max(...row.map((cc) => cc[1]));
      return [cell[0] === best1, cell[1] === best2] as [boolean, boolean];
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Matrices des slides (joueur ligne ; joueur colonne)                  */
/* ------------------------------------------------------------------ */

type Pay = [number, number];

/** Slide 27 — bataille des sexes (Homme en lignes, Femme en colonnes). */
const BOS: Pay[][] = [
  [
    [4, 2],
    [0, 0],
  ],
  [
    [0, 0],
    [2, 4],
  ],
];

/** Slide 31 — chasse au cerf. */
const CERF: Pay[][] = [
  [
    [2, 2],
    [0, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
];

/** Slide 34 — poule mouillée. */
const POULE: Pay[][] = [
  [
    [-2, -2],
    [6, 0],
  ],
  [
    [0, 6],
    [2, 2],
  ],
];

/** Slide 38 — jeu X/Y (Y dominante). */
const XY: Pay[][] = [
  [
    [1, 1],
    [0, 3],
  ],
  [
    [3, 0],
    [2, 2],
  ],
];

/** Slides 40 et 42 — jeu Haut/Bas × Gauche/Droite. */
const HB: Pay[][] = [
  [
    [3, 3],
    [0, 2],
  ],
  [
    [1, 2],
    [5, 1],
  ],
];

/** Slide 41 — jeu 3×3 (H dominée par B pour P1). */
const G33: Pay[][] = [
  [
    [2, 2],
    [1, 0],
    [1, 2],
  ],
  [
    [0, 1],
    [3, 3],
    [1, 1],
  ],
  [
    [2, 1],
    [1, 1],
    [2, 2],
  ],
];

/* ------------------------------------------------------------------ */
/* § 5 — La garantie des dépôts, curseur en main (slide 33)            */
/* ------------------------------------------------------------------ */

function BankGuaranteeExplorer() {
  const [g, setG] = useState(0);
  // Chiffres illustratifs : m = 100 €, r = 5 %, donc m(1 + r) = 105 €.
  const m = 100;
  const stay = 105;
  const mg = Math.min(g, m);
  const payoffs: Pay[][] = [
    [
      [stay, stay],
      [mg, m],
    ],
    [
      [m, mg],
      [m, m],
    ],
  ];
  const regime = g === 0 ? "none" : g < m ? "partial" : "full";

  return (
    <InteractiveCard
      title="La garantie des dépôts, curseur en main"
      subtitle={
        <>
          Chiffres illustratifs : chacun a déposé <M tex="m = 100" /> €, l'intérêt est{" "}
          <M tex="r = 5\,\%" />, donc <M tex="m(1+r) = 105" /> €. Fais varier la garantie{" "}
          <M tex="g" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Garantie publique <M tex="g" />
              </>
            }
            value={g}
            onChange={setG}
            min={0}
            max={150}
            step={10}
            format={(v) => `${v} €`}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              « Je laisse, l'autre retire » : <M tex="\min(g, m)" /> ={" "}
              <span className="tabular-nums text-rose-700">{mg} €</span>
            </span>
            <span className="text-muted-foreground">
              la seule case (et sa symétrique) que la garantie modifie
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
            <span className="rounded-full border bg-background px-2.5 py-0.5 font-semibold">
              EN : (L, L) et (R, R)
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-semibold ${
                regime === "full"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300"
                  : "bg-background text-muted-foreground"
              }`}
            >
              ESD : {regime === "full" ? "(L, L)" : "aucun"}
            </span>
          </div>
        </>
      }
      footer={
        <>
          tant que <M tex="g < m" />, laisser son argent pendant que l'autre retire coûte quelque
          chose, et Retirer reste la meilleure réponse à Retirer. Dès que <M tex="g" /> atteint{" "}
          <M tex="m" />, cette case vaut <M tex="m" /> : Retirer n'est plus jamais strictement
          meilleur que Laisser.
        </>
      }
    >
      <CompactMatrix
        rowPlayer="Investisseur 1"
        colPlayer="Investisseur 2"
        rows={["Laisser", "Retirer"]}
        cols={["Laisser", "Retirer"]}
        cells={payoffs.map((row) => row.map(([a, b]) => [a, b] as [ReactNode, ReactNode]))}
        marks={brMarks(payoffs)}
        highlight={[
          [0, 0],
          [1, 1],
        ]}
      />
      <p className="text-[13px] text-muted-foreground">
        Souligné : meilleure réponse (en cas d'égalité, les deux payoffs sont soulignés). Encadré
        : équilibre de Nash.
      </p>
      <div
        className={`mt-3 rounded-xl border px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
          regime === "full"
            ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-400/40 dark:bg-emerald-400/10"
            : "border-rose-200 bg-rose-50/70 dark:border-rose-400/40 dark:bg-rose-400/10"
        }`}
      >
        {regime === "none" ? (
          <>
            <strong>Sans garantie.</strong> Face à Retirer, Laisser rapporte 0 € contre 100 € pour
            Retirer : Retirer est la meilleure réponse à Retirer. Deux EN, (L, L) et (R, R), et
            aucune stratégie dominante. La panique est <strong>possible et rationnelle</strong>.
          </>
        ) : regime === "partial" ? (
          <>
            <strong>Garantie partielle ({g} € &lt; m).</strong> Face à Retirer, Laisser ne
            rapporte que {g} € contre 100 € pour Retirer. Rien ne change sur le fond : deux EN,
            pas de stratégie dominante. La panique <strong>reste possible</strong>.
          </>
        ) : (
          <>
            <strong>Garantie complète ({g} € ≥ m).</strong> Face à Retirer, Laisser rapporte
            aussi 100 €. Laisser est dominante pour chacun (105 &gt; 100 et 100 ≥ 100) :
            (L, L) est un <strong>ESD</strong>, céder à la panique devient irrationnel. (R, R)
            reste un EN, mais seulement grâce à l'égalité 100 = 100.
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* § 6 — Les trois solutions côte à côte (slides 18, 23, 25, 29, 35, 36) */
/* ------------------------------------------------------------------ */

function SolutionCards() {
  const dt = "text-[11.5px] font-bold uppercase tracking-wide";
  const items = [
    {
      key: "ESD",
      name: "Équilibre en stratégies dominantes",
      hyp: "H1",
      tone: "border-rose-200 dark:border-rose-400/30",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200",
      needs: <>chaque joueur joue sa stratégie dominante (§&nbsp;3)</>,
      plus: (
        <>
          ne suppose que la rationalité de chacun : quand il existe, c'est la prédiction la plus
          solide
        </>
      ),
      minus: <>beaucoup de jeux n'ont aucun ESD, comme le jeu du rendez-vous (slide 18)</>,
    },
    {
      key: "PSS",
      name: "Profils de stratégies survivants",
      hyp: "H1 + H2",
      tone: "border-sky-200 dark:border-sky-400/30",
      badge: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
      needs: <>survivre à l'élimination itérative des stratégies dominées (§&nbsp;4)</>,
      plus: (
        <>
          prédit quelque chose même sans stratégie dominante : (H,&nbsp;H) dans le jeu du
          rendez-vous (slide 23)
        </>
      ),
      minus: (
        <>
          beaucoup de jeux ont de nombreux PSS, donc des prédictions peu précises : 4 PSS dans le
          jeu 3×3 (slide 25)
        </>
      ),
    },
    {
      key: "EN",
      name: "Équilibre de Nash",
      hyp: "H1 + H3",
      tone: "border-emerald-200 dark:border-emerald-400/30",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
      needs: <>des meilleures réponses mutuelles (§&nbsp;5)</>,
      plus: (
        <>
          plus précis que les PSS : 2 EN contre 4 PSS dans la bataille des sexes (slide 29).{" "}
          <em>Avantage théorique</em> : avec les stratégies mixtes, tout jeu a au moins un EN
          (slide 65, §&nbsp;8)
        </>
      ),
      minus: (
        <>
          souvent plusieurs EN, donc des prédictions imprécises (slide 35) ; certains jeux n'ont
          aucun EN en stratégies pures (slide 54)
        </>
      ),
    },
  ];
  return (
    <div className="my-5 grid gap-3 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.key} className={`rounded-xl border-2 bg-card p-4 shadow-sm ${it.tone}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xl font-extrabold tracking-tight">{it.key}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-bold ${it.badge}`}>
              basé sur {it.hyp}
            </span>
          </div>
          <div className="text-[13.5px] font-semibold text-muted-foreground">{it.name}</div>
          <dl className="mt-2.5 space-y-2 text-[14.5px] leading-snug">
            <div>
              <dt className={`${dt} text-muted-foreground`}>Ce qu'il demande</dt>
              <dd>{it.needs}</dd>
            </div>
            <div>
              <dt className={`${dt} text-emerald-700 dark:text-emerald-400`}>Avantage</dt>
              <dd>{it.plus}</dd>
            </div>
            <div>
              <dt className={`${dt} text-rose-700 dark:text-rose-400`}>Limitation théorique</dt>
              <dd>{it.minus}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* § 7 — Ce que le labo teste (slides 38-45) : des branches, pas un escalier */
/* ------------------------------------------------------------------ */

function LabMap() {
  const rows = [
    {
      hyp: "H1",
      what: "les joueurs sont rationnels",
      sol: "ESD",
      tone: "border-rose-200 bg-rose-50/60 dark:border-rose-400/30 dark:bg-rose-400/10",
      badge: "bg-rose-600",
      tests: [
        <>
          jouer sa stratégie dominante : <strong>87 %</strong> (jeu X/Y),{" "}
          <strong>96 %</strong> (dilemme du prisonnier)
        </>,
        <>
          éviter ses stratégies dominées : <strong>12 %</strong> jouent pourtant Droite (jeu
          Haut/Bas), <strong>0 %</strong> jouent H (jeu 3×3)
        </>,
      ],
    },
    {
      hyp: "H1 + H2.1",
      what: "on croit que les autres sont rationnels",
      sol: "PSS",
      tone: "border-sky-200 bg-sky-50/60 dark:border-sky-400/30 dark:bg-sky-400/10",
      badge: "bg-sky-600",
      tests: [
        <>
          ne jouer que des stratégies d'un PSS : <strong>29 %</strong> jouent pourtant Bas (jeu
          Haut/Bas)
        </>,
      ],
    },
    {
      hyp: "H1 + H3",
      what: "on anticipe correctement les autres",
      sol: "EN",
      tone: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/30 dark:bg-emerald-400/10",
      badge: "bg-emerald-600",
      tests: [
        <>
          se coordonner sur un EN : au round 1 de la bataille des sexes, <strong>21 %</strong>{" "}
          Viande et <strong>31 %</strong> Rouge, donc pas de coordination ; puis convergence
          vers (P,&nbsp;B) quand on répète le jeu
        </>,
      ],
    },
  ];
  return (
    <figure className="my-6">
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div
            key={r.hyp}
            className={`flex flex-col gap-2 rounded-xl border-2 px-3.5 py-3 sm:flex-row sm:items-start sm:gap-4 ${r.tone}`}
          >
            <div className="shrink-0 sm:w-60">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[13px] font-extrabold text-white ${r.badge}`}
                >
                  {r.hyp}
                </span>
                <span className="text-[13px] font-bold">→ prédit un {r.sol}</span>
              </div>
              <div className="mt-1 text-[13px] leading-snug text-muted-foreground">{r.what}</div>
            </div>
            <ul className="list-disc space-y-1 pl-5 marker:text-muted-foreground">
              {r.tests.map((t, i) => (
                <li key={i} className="text-[14.5px] leading-snug">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-[12.5px] leading-snug text-muted-foreground">
        Chaque concept ajoute <em>une</em> hypothèse à H1 : H2 pour le PSS (le labo n'en teste
        que le premier niveau, H2.1), H3 pour l'EN (slide 36). Ce sont deux branches, pas deux
        marches d'un même escalier. Chiffres des slides 38 à 45.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* § 7 — « Devine 2/3 » et marché financier, la même logique (slide 53) */
/* ------------------------------------------------------------------ */

function MarketCompare() {
  const rows = [
    {
      k: "Le repère « rationnel »",
      a: (
        <>
          la moyenne « rationnelle » <M tex="\bar{x} = 0" />
        </>
      ),
      b: (
        <>
          le prix « correct » <M tex="p^*" />
        </>
      ),
    },
    {
      k: "Si tout le monde était parfaitement rationnel",
      a: (
        <>
          jouer <M tex="x_i = 0" />
        </>
      ),
      b: (
        <>
          vendre si <M tex="p > p^*" />, acheter dans le cas inverse
        </>
      ),
    },
    {
      k: "Avec des humains",
      a: (
        <>
          jouer 0 « a peu de chances de gagner, en tous cas sur les premiers rounds »
        </>
      ),
      b: (
        <>
          « il est possible d'augmenter ses gains en adoptant une logique différente » : celle du
          concours de beauté
        </>
      ),
    },
    {
      k: "La vraie question",
      a: <>quel nombre les autres vont-ils choisir ?</>,
      b: <>à quel prix les autres achèteront-ils demain ?</>,
    },
  ];
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="grid grid-cols-2 border-b bg-muted/60 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
        <div className="px-3 py-2">🎯 Devine 2/3</div>
        <div className="border-l px-3 py-2">📈 Marché financier</div>
      </div>
      {rows.map((r) => (
        <div key={r.k} className="border-b last:border-b-0">
          <div className="px-3 pt-2 text-[12.5px] font-semibold text-primary">{r.k}</div>
          <div className="grid grid-cols-2 text-[14px] leading-snug">
            <div className="px-3 pb-2.5 pt-1">{r.a}</div>
            <div className="border-l px-3 pb-2.5 pt-1">{r.b}</div>
          </div>
        </div>
      ))}
      <figcaption className="border-t bg-muted/40 px-3 py-2 text-[12.5px] leading-snug text-muted-foreground">
        Slide 53 (citations entre guillemets). La même logique « deviner ce que les autres vont
        faire » est à l'œuvre dans les deux cas.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* § 7 — Comment naît une bulle (slide 53)                              */
/* ------------------------------------------------------------------ */

function BubbleLoop() {
  const steps: ReactNode[] = [
    <>
      Un investisseur pense que <M tex="p > p^*" /> : l'action est surévaluée…
    </>,
    <>… mais il anticipe que d'autres voudront l'acheter demain à un prix encore plus élevé.</>,
    <>
      Étant donné cette croyance, il a intérêt à <strong>acheter</strong>.
    </>,
    <>
      D'autres raisonnent de la même manière : leurs achats tirent le prix <M tex="p" /> encore
      plus haut.
    </>,
  ];
  return (
    <figure className="my-6 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:gap-1.5">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1 sm:flex-1 sm:flex-row sm:gap-1.5">
            <div className="w-full rounded-xl border bg-background px-3 py-2.5 text-[14px] leading-snug sm:h-full">
              <span className="mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <div>{s}</div>
            </div>
            {i < steps.length - 1 ? (
              <span aria-hidden className="text-lg leading-none text-muted-foreground">
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/60 px-3 py-2 text-center text-[14px] leading-snug dark:bg-amber-400/10">
        ↻ La hausse du prix <strong>valide la croyance</strong> de l'investisseur… et la boucle
        recommence, de plus en plus loin de <M tex="p^*" />.
      </div>
      <figcaption className="mt-2 text-[12.5px] text-muted-foreground">
        Le mécanisme de bulle décrit au slide 53.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Les sections                                                        */
/* ================================================================== */

export function PartEquilibre() {
  return (
    <>

      {/* ============================================================ */}
      {/* § 5 — L'équilibre de Nash (H3) · slides 26-35                 */}
      {/* ============================================================ */}
      <Section id="s5" kicker="§ 5 · Hypothèse 3" title="L'équilibre de Nash">
        <Lead>
          H1 et H2 ne suffisent pas toujours. Dans beaucoup de jeux, aucune stratégie n'est
          dominée : l'élimination itérative ne retire rien, et on ne sait toujours pas quoi
          prédire. Pour obtenir des prédictions plus précises, la théorie fait une hypothèse sur la
          capacité des joueurs à <strong>anticiper</strong> ce que leurs adversaires vont faire
          (slide 26).
        </Lead>

        <Callout variant="definition" title="Hypothèse 3 (H3) — anticipations correctes">
          <p>
            Les joueurs <strong>anticipent correctement</strong> les stratégies que leurs
            adversaires vont utiliser.
          </p>
          <p className="mt-2">
            <strong>Implications de H1 et H3.</strong> Les joueurs :
          </p>
          <UL>
            <li>anticipent correctement la stratégie de chacun de leurs adversaires (H3) ;</li>
            <li>choisissent la meilleure réponse possible à ce qu'ils anticipent (H1) ;</li>
            <li>
              et vont donc se coordonner sur un <strong>équilibre de Nash</strong>.
            </li>
          </UL>
        </Callout>

        <Callout variant="attention" title="H3 ne s'empile pas sur H2">
          <p>
            L'équilibre de Nash repose sur <strong>H1 et H3</strong> (slide 36), pas sur H1, H2 et
            H3. H2 (« je sais que tu es rationnel ») et H3 (« j'anticipe correctement ce que tu vas
            jouer ») sont deux façons différentes de compléter H1.
          </p>
        </Callout>

        <H4>Deux définitions à savoir par cœur</H4>

        <Callout variant="definition" title="Meilleure réponse (slide 26)">
          <p>
            Une stratégie est une <strong>meilleure réponse</strong> à ce que font les autres
            joueurs si <strong>aucune autre stratégie n'apporte de payoff plus grand</strong>.
            Formellement, la stratégie <M tex="s_i^*" /> est une meilleure réponse au profil{" "}
            <M tex="s_{-i}" /> si
          </p>
          <MB tex="u_i(s_i^*, s_{-i}) \;\ge\; u_i(s_i', s_{-i})" />
          <p>
            pour toutes les autres stratégies <M tex="s_i'" /> du joueur <M tex="i" />.
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            Rappel : <M tex="s_{-i}" /> désigne les stratégies de tous les joueurs{" "}
            <em>sauf</em> le joueur <M tex="i" />. Le signe <M tex="\ge" /> autorise les égalités
            : si deux stratégies donnent le même payoff, le plus grand possible, les deux sont des
            meilleures réponses.
          </p>
        </Callout>

        <Callout variant="intuition" title="Meilleure réponse ou stratégie dominante ?">
          <p>Les deux définitions utilisent la même inégalité. Toute la différence est là :</p>
          <UL>
            <li>
              une stratégie <strong>dominante</strong> doit être la meilleure{" "}
              <em>pour tous les</em> <M tex="s_{-i}" />, quoi que fassent les autres (slide 11) ;
            </li>
            <li>
              une <strong>meilleure réponse</strong> doit seulement être la meilleure face à{" "}
              <em>un</em> <M tex="s_{-i}" /> précis.
            </li>
          </UL>
          <p className="mt-2">
            Une stratégie dominante est donc une meilleure réponse à tout. L'inverse est faux :
            dans la bataille des sexes ci-dessous, Viande est la meilleure réponse de l'homme à
            Rouge (4 &gt; 0), mais pas à Blanc (0 &lt; 2). Viande n'est donc pas dominante.
          </p>
        </Callout>

        <Callout variant="definition" title="Équilibre de Nash (slide 27)">
          <p>
            Le profil de stratégies <M tex="(s_1, \dots, s_n)" /> est un{" "}
            <strong>équilibre de Nash (EN)</strong> si <M tex="s_i" /> est une meilleure réponse
            à <M tex="s_{-i}" /> <strong>pour tous les joueurs</strong> <M tex="i" />. Dans un
            équilibre de Nash, les stratégies sont des{" "}
            <strong>meilleures réponses mutuelles</strong>.
          </p>
        </Callout>

        <Callout variant="intuition" title="Le test du regret">
          <p>
            Pour tester une case, demande à chaque joueur : « sachant ce que les autres jouent dans
            cette case, regrettes-tu ton choix ? ». Si <strong>personne</strong> ne regrette,
            c'est-à-dire si personne ne gagnerait plus en changeant <em>seul</em> de stratégie, la
            case est un EN. Il suffit qu'un seul joueur regrette pour qu'elle n'en soit pas un.
          </p>
        </Callout>

        <H4>Pas à pas : la bataille des sexes (slides 27-29)</H4>
        <p>
          Un homme invite une femme à manger chez lui. Il cuisinera soit de la{" "}
          <strong>viande</strong>, soit du <strong>poisson</strong>. Elle apportera soit du vin{" "}
          <strong>rouge</strong>, soit du vin <strong>blanc</strong>. Chacun choisit sans savoir ce
          que fait l'autre. Ils sont d'accord sur un point : la viande se marie bien avec le rouge,
          le poisson avec le blanc. Mais la femme tend à préférer le poisson, et l'homme la viande.
        </p>

        <PayoffMatrix
          rowPlayer="Homme"
          colPlayer="Femme"
          rows={["Viande", "Poisson"]}
          cols={["Rouge", "Blanc"]}
          payoffs={BOS}
          caption={
            <>
              Slide 27. Dans chaque case : payoff de l'homme ; payoff de la femme. Repas bien
              assorti : 4 pour celui ou celle dont c'est le repas préféré, 2 pour l'autre. Repas
              mal assorti : 0 pour les deux.
            </>
          }
        />

        <p>
          Pour trouver les EN, on analyse les meilleures réponses{" "}
          <strong>à chaque stratégie</strong> de l'adversaire (slide 28). Pour chaque stratégie de
          l'autre, on compare deux payoffs et on écrit l'inégalité. Notation : <M tex="u_H" /> est
          le payoff de l'homme, <M tex="u_F" /> celui de la femme ; dans <M tex="(V, R)" />, la
          stratégie de l'homme vient en premier.
        </p>

        <Step n={1} title="Les meilleures réponses de l'homme : une par stratégie de la femme">
          <p>
            Si la femme apporte du rouge, on reste dans la colonne Rouge et on compare les deux
            payoffs de l'homme : 4 avec Viande, 0 avec Poisson. Si elle apporte du blanc, on
            compare 0 (Viande) et 2 (Poisson).
          </p>
          <div className="my-3 grid gap-2.5 sm:grid-cols-2">
            <BR
              who="l'homme"
              side="row"
              against="Rouge"
              answer="Viande"
              ineq="u_H(V,R) > u_H(P,R)"
              nums="4 > 0"
            />
            <BR
              who="l'homme"
              side="row"
              against="Blanc"
              answer="Poisson"
              ineq="u_H(V,B) < u_H(P,B)"
              nums="0 < 2"
            />
          </div>
        </Step>

        <Step n={2} title="Les meilleures réponses de la femme : une par stratégie de l'homme">
          <p>
            Si l'homme cuisine de la viande, on reste dans la ligne Viande et on compare les deux
            payoffs de la femme : 2 avec Rouge, 0 avec Blanc. S'il cuisine du poisson : 0 avec
            Rouge, 4 avec Blanc.
          </p>
          <div className="my-3 grid gap-2.5 sm:grid-cols-2">
            <BR
              who="la femme"
              side="col"
              against="Viande"
              answer="Rouge"
              ineq="u_F(V,R) > u_F(V,B)"
              nums="2 > 0"
            />
            <BR
              who="la femme"
              side="col"
              against="Poisson"
              answer="Blanc"
              ineq="u_F(P,R) < u_F(P,B)"
              nums="0 < 4"
            />
          </div>
        </Step>

        <Step n={3} title="On cherche les meilleures réponses mutuelles (slide 29)">
          <p>
            Viande est la meilleure réponse à Rouge, <em>et</em> Rouge est la meilleure réponse à
            Viande : (V, R) est un EN. De même, Poisson et Blanc sont des meilleures réponses l'une
            à l'autre : (P, B) est un EN.
          </p>
          <p>
            Les deux autres cases échouent au test du regret. En (V, B), l'homme regrette : face à
            Blanc, Poisson lui rapporterait 2 au lieu de 0. En (P, R), il regrette aussi : face à
            Rouge, Viande lui rapporterait 4 au lieu de 0.
          </p>
          <p>
            <strong>Conclusion : la bataille des sexes admet deux EN, (V, R) et (P, B).</strong>
          </p>
        </Step>

        <Callout variant="examen" title="À l'examen : écris les inégalités">
          <p>
            Ne te contente pas d'écrire « (V, R) est un EN ». Justifie chaque meilleure réponse
            comme au slide 28 : « la meilleure réponse de l'homme à Rouge est Viande, car{" "}
            <M tex="u_H(V,R) > u_H(P,R)" />, soit <M tex="4 > 0" /> ». Puis conclus : « Viande et
            Rouge sont des meilleures réponses mutuelles ». Une case est un EN seulement si{" "}
            <strong>chaque</strong> joueur y joue une meilleure réponse.
          </p>
        </Callout>

        <p>
          <strong>Plus précis que les PSS, mais pas parfaitement précis (slide 29).</strong> Il
          reste deux EN : la théorie ne dit pas lequel sera joué. C'est quand même mieux qu'avec H1
          et H2 seules. Ici, aucune stratégie n'est dominée : Viande gagne face à Rouge mais perd
          face à Blanc, et c'est pareil pour chaque stratégie des deux joueurs. L'élimination
          itérative ne retire donc rien, et les <strong>quatre</strong> profils sont des PSS. On
          passe de 4 PSS à 2 EN.
        </p>

        <Callout variant="methode" title="Méthode des meilleures réponses : le raccourci visuel">
          <OL>
            <li>
              Pour <strong>chaque colonne</strong> (chaque stratégie du joueur colonne), entoure
              (ou souligne) le <span className="font-bold text-rose-700">payoff rouge</span> le
              plus élevé : c'est la meilleure réponse du joueur ligne.
            </li>
            <li>
              Pour <strong>chaque ligne</strong> (chaque stratégie du joueur ligne), entoure le{" "}
              <span className="font-bold text-sky-700">payoff bleu</span> le plus élevé : c'est la
              meilleure réponse du joueur colonne.
            </li>
            <li>
              Les cases dont <strong>les deux payoffs sont entourés</strong> sont les EN.
            </li>
          </OL>
          <p className="mt-2">
            C'est exactement l'analyse du slide 28, en version graphique : chaque payoff entouré
            correspond à une inégalité. En cas d'égalité, entoure les deux payoffs : les deux
            stratégies sont des meilleures réponses. Les marques t'aident à trouver ; les
            inégalités justifient ta réponse.
          </p>
        </Callout>

        <p>
          Entraîne-toi : le widget ci-dessous déroule la méthode sur la bataille des sexes et sur
          les autres jeux célèbres du chapitre.
        </p>

        <NashHunter />

        <H5>Ce qu'illustre la bataille des sexes (slides 29-30)</H5>
        <p>
          Les joueurs <strong>veulent se coordonner</strong> sur un résultat, mais{" "}
          <strong>ne sont pas d'accord sur lequel</strong> : l'homme préfère se coordonner sur un
          repas viande avec vin rouge (4 pour lui), la femme sur un repas poisson avec vin blanc (4
          pour elle).
        </p>
        <p>Autres situations du même type (slide 30) :</p>
        <UL>
          <li>
            Samsung et son fournisseur de hardware doivent adopter un standard technologique
            commun, mais ne sont pas forcément d'accord sur le standard le plus souhaitable.
          </li>
          <li>
            Un fonctionnaire et un businessman doivent décider si la demande de permis du
            businessman sera traitée suivant les règles officielles ou fera l'objet de pots-de-vin.
          </li>
        </UL>

        <H4>La chasse au cerf (slides 31-32)</H4>
        <p>
          Deux chasseurs habitent de part et d'autre d'une forêt. Chaque matin, chacun décide s'il
          chasse le <strong>cerf</strong> ou le <strong>lièvre</strong>. Les cerfs vivent dans une
          partie précise de la forêt. Si les deux chasseurs s'y retrouvent, ils coopèrent et ont de
          grandes chances d'abattre un cerf. Seul, un chasseur a beaucoup moins de chances.
          Chasser le lièvre ailleurs dans la forêt est sans risque.
        </p>

        <PayoffMatrix
          rowPlayer="Chasseur 1"
          colPlayer="Chasseur 2"
          rows={["Cerf", "Lièvre"]}
          cols={["Cerf", "Lièvre"]}
          payoffs={CERF}
          caption={
            <>
              Slide 31. Le cerf à deux rapporte 2 à chacun ; seul au cerf, on obtient 0 ; le
              lièvre rapporte toujours 1.
            </>
          }
        />

        <div className="my-3 grid gap-2.5 sm:grid-cols-2">
          <BR
            who="le chasseur 1"
            side="row"
            against="Cerf"
            answer="Cerf"
            ineq="u_1(C,C) > u_1(L,C)"
            nums="2 > 1"
          />
          <BR
            who="le chasseur 1"
            side="row"
            against="Lièvre"
            answer="Lièvre"
            ineq="u_1(C,L) < u_1(L,L)"
            nums="0 < 1"
          />
        </div>
        <p>
          Le jeu est symétrique : le chasseur 2 a les mêmes meilleures réponses (Cerf face à Cerf,
          Lièvre face à Lièvre). Cerf et Cerf sont donc des meilleures réponses mutuelles, Lièvre
          et Lièvre aussi : <strong>deux EN, (C, C) et (L, L)</strong>.
        </p>

        <H5>Ce qu'illustre la chasse au cerf (slide 32)</H5>
        <p>
          Cette fois, les deux joueurs préfèrent le <strong>même</strong> équilibre : (C, C) donne
          2 à chacun, contre 1 en (L, L). Ils veulent se coordonner sur la chasse au cerf… mais ont
          du mal à y arriver. Chacun a peur que l'autre fasse une erreur (chasser le lièvre au lieu
          du cerf). Or, si je crains que tu fasses l'erreur, ma meilleure réponse est de la faire
          moi-même : je chasse le lièvre.{" "}
          <strong>La peur de l'erreur devient une prophétie auto-réalisatrice.</strong>
        </p>

        <H4>⭐ Application : les paniques bancaires et la garantie des dépôts (slides 32-33)</H4>
        <p>
          Les paniques bancaires ont la structure d'une chasse au cerf (slide 32). Laisser son
          argent dormir sous son matelas ne rapporte rien. Le laisser à la banque, qui peut
          l'investir, rapporte un intérêt. Mais si les autres clients retirent leur argent en même
          temps, la banque peut faire faillite, et ceux qui avaient laissé leur argent le perdent.
          Un client qui a peur que les autres retirent va donc vouloir retirer, lui aussi.
        </p>
        <p>
          La solution indiquée au slide 32 : <strong>l'État garantit les dépôts bancaires à
          hauteur de 100 000 euros</strong>. Le slide 33 montre, avec un petit jeu, pourquoi cela
          suffit à rendre la panique irrationnelle.
        </p>
        <p>
          Deux investisseurs ont chacun placé un montant <M tex="m" /> à la banque. Notons{" "}
          <M tex="r" /> l'intérêt perçu sur l'argent placé, et <M tex="g" /> le montant garanti par
          les pouvoirs publics en cas de faillite. Chacun peut <strong>Laisser</strong> son argent
          ou le <strong>Retirer</strong> :
        </p>
        <UL>
          <li>
            si les deux laissent leur argent, la banque ne fait pas faillite et leur paie l'intérêt
            : chacun reçoit <M tex="m(1+r)" /> ;
          </li>
          <li>
            si quelqu'un retire, la banque fait faillite. Celui qui retire récupère sa mise{" "}
            <M tex="m" />. Celui qui a laissé son argent reçoit de l'État le minimum entre{" "}
            <M tex="m" /> et <M tex="g" />.
          </li>
        </UL>

        <CompactMatrix
          stack
          rowPlayer="Investisseur 1"
          colPlayer="Investisseur 2"
          rows={["Laisser", "Retirer"]}
          cols={["Laisser", "Retirer"]}
          cells={[
            [
              [<M key="a" tex="m(1+r)" />, <M key="b" tex="m(1+r)" />],
              [<M key="a" tex="\min(g, m)" />, <M key="b" tex="m" />],
            ],
            [
              [<M key="a" tex="m" />, <M key="b" tex="\min(g, m)" />],
              [<M key="a" tex="m" />, <M key="b" tex="m" />],
            ],
          ]}
          caption={
            <>
              Slide 33. Payoff de l'investisseur 1 (rouge) ; payoff de l'investisseur 2 (bleu).
            </>
          }
        />

        <Step n={1} title="Sans garantie (g = 0) : deux EN, la panique est possible">
          <p>
            Avec <M tex="g = 0" />, la case « je laisse, l'autre retire » vaut{" "}
            <M tex="\min(0, m) = 0" />. Meilleures réponses de l'investisseur 1 :
          </p>
          <UL>
            <li>
              si l'autre laisse : <strong>Laisser</strong>, car{" "}
              <M tex="u_1(L,L) = m(1+r) > u_1(R,L) = m" /> ;
            </li>
            <li>
              si l'autre retire : <strong>Retirer</strong>, car{" "}
              <M tex="u_1(R,R) = m > u_1(L,R) = 0" />.
            </li>
          </UL>
          <p>
            Le jeu est symétrique : même chose pour l'investisseur 2. Le jeu admet donc deux EN,{" "}
            <strong>(L, L) et (R, R)</strong> : c'est une chasse au cerf. Le slide 33 conclut :
            l'existence de l'EN (R, R) rend la panique bancaire{" "}
            <strong>possible et rationnelle</strong>. Si je crois que tu vas retirer, ma meilleure
            réponse est de retirer.
          </p>
        </Step>

        <Step n={2} title="Avec une garantie qui couvre le dépôt (g ≥ m) : (L, L) devient un ESD">
          <p>
            Avec <M tex="g \ge m" />, on a <M tex="\min(g, m) = m" /> : même si l'autre retire,
            celui qui laisse son argent récupère sa mise. Comparons Laisser et Retirer pour
            l'investisseur 1 :
          </p>
          <UL>
            <li>
              si l'autre laisse : <M tex="m(1+r) > m" />, Laisser rapporte plus ;
            </li>
            <li>
              si l'autre retire : <M tex="m \ge m" />, Laisser rapporte autant.
            </li>
          </UL>
          <p>
            Quoi que fasse l'autre, Laisser rapporte au moins autant que Retirer :{" "}
            <strong>Laisser est une stratégie dominante</strong> (la définition du slide 11 utilise{" "}
            <M tex="\ge" />, l'égalité est donc permise). C'est vrai pour les deux investisseurs :{" "}
            <strong>(L, L) devient un ESD</strong>, et céder à la panique devient donc{" "}
            <strong>irrationnel</strong> (slide 33).
          </p>
        </Step>

        <Callout variant="examen" title="Piège : (R, R) est-il encore un EN quand g ≥ m ?">
          <p>
            Oui. Face à Retirer, Retirer rapporte <M tex="m" /> et Laisser rapporte{" "}
            <M tex="\min(g, m) = m" /> : les deux sont des meilleures réponses (égalité). (R, R)
            reste donc un EN. Mais Retirer est dominée par Laisser, et par H1, un joueur rationnel
            n'utilise pas ses stratégies dominées (slide 18). C'est pourquoi le slide conclut que
            céder à la panique devient irrationnel.
          </p>
        </Callout>

        <BankGuaranteeExplorer />

        <Callout variant="retiens" title="Ce que fait la garantie des dépôts">
          <p>
            La garantie <strong>change les payoffs</strong> du jeu : dès que{" "}
            <M tex="g \ge m" />, elle remplace le 0 de la case « je laisse, l'autre retire » par{" "}
            <M tex="m" />. Retirer n'est alors plus jamais strictement meilleur que Laisser : même
            si je crains que tu retires, je n'ai plus de raison de retirer. La peur ne se réalise
            plus d'elle-même, et (L, L) devient un ESD. Une garantie de 100 000 € (slide 32)
            remplit la condition <M tex="g \ge m" /> pour tout dépôt <M tex="m" /> jusqu'à
            100 000 €. Une garantie partielle (<M tex="g < m" />) ne suffit pas : (R, R) reste un
            EN strict. Dans le modèle, tant que personne ne retire, la banque ne fait pas faillite
            et la garantie n'a pas à être versée.
          </p>
        </Callout>

        <H4>La poule mouillée (slides 34-35)</H4>
        <p>
          Deux conducteurs roulent à grande vitesse l'un vers l'autre, devant un public. Chacun
          décide s'il roule droit devant lui, de manière agressive (la stratégie du{" "}
          <strong>faucon</strong>), ou s'il tourne pour éviter la collision (la stratégie de la{" "}
          <strong>colombe</strong>). Si aucun ne tourne, c'est la collision. Si l'un roule tout
          droit pendant que l'autre tourne, celui qui roule tout droit gagne et l'autre perd la
          face.
        </p>

        <PayoffMatrix
          rowPlayer="Conducteur 1"
          colPlayer="Conducteur 2"
          rows={["Faucon", "Colombe"]}
          cols={["Faucon", "Colombe"]}
          payoffs={POULE}
          caption={
            <>
              Slide 34. Collision : −2 chacun. Celui qui fonce pendant que l'autre tourne gagne 6,
              l'autre 0. Deux colombes : 2 chacun.
            </>
          }
        />

        <div className="my-3 grid gap-2.5 sm:grid-cols-2">
          <BR
            who="le conducteur 1"
            side="row"
            against="Faucon"
            answer="Colombe"
            ineq="u_1(C,F) > u_1(F,F)"
            nums="0 > -2"
          />
          <BR
            who="le conducteur 1"
            side="row"
            against="Colombe"
            answer="Faucon"
            ineq="u_1(F,C) > u_1(C,C)"
            nums="6 > 2"
          />
        </div>
        <p>
          Par symétrie, c'est pareil pour le conducteur 2. Faucon et Colombe sont des meilleures
          réponses mutuelles, Colombe et Faucon aussi : <strong>deux EN, (F, C) et (C, F)</strong>
          . Dans chaque équilibre, un seul conducteur cède.
        </p>

        <H5>Ce qu'illustre la poule mouillée (slide 35)</H5>
        <UL>
          <li>
            Il y a deux équilibres, et les joueurs ont des préférences{" "}
            <strong>opposées</strong> entre eux : le conducteur 1 préfère (F, C), où il gagne 6 ;
            le conducteur 2 préfère (C, F).
          </li>
          <li>
            L'équilibre préféré de chaque joueur passe par <strong>son action « dangereuse »</strong>{" "}
            : foncer.
          </li>
          <li>
            Si les joueurs n'arrivent pas à se coordonner, le résultat (C, C) domine (F, F) au sens
            de Pareto : 2 pour chacun au lieu de −2.
          </li>
        </UL>
        <p>
          Autre situation du même type (slide 35) : deux firmes décident en même temps d'investir
          sur un marché trop petit pour que deux firmes y fassent des profits. Si les deux
          investissent, elles font toutes les deux des pertes.
        </p>

        <H4>Fiche mémo : trois jeux, deux EN chacun</H4>
        <CardGrid
          items={[
            {
              tag: "2 EN · désaccord sur l'équilibre",
              title: "⚔️ Bataille des sexes",
              body: (
                <>
                  EN : (V, R) et (P, B). On veut se coordonner, mais pas sur le même résultat.
                </>
              ),
              extra: (
                <>
                  <strong>Autres situations :</strong> un standard technologique commun (Samsung
                  et son fournisseur) ; règles officielles ou pots-de-vin (fonctionnaire et
                  businessman).
                </>
              ),
            },
            {
              tag: "2 EN · le même équilibre préféré",
              title: "🦌 Chasse au cerf",
              body: (
                <>
                  EN : (C, C) et (L, L). Tous préfèrent (C, C), mais la peur de l'erreur de
                  l'autre peut mener à (L, L) : une prophétie auto-réalisatrice.
                </>
              ),
              extra: (
                <>
                  <strong>Autre situation :</strong> les paniques bancaires (remède : la garantie
                  des dépôts).
                </>
              ),
            },
            {
              tag: "2 EN · préférences opposées",
              title: "🐔 Poule mouillée",
              body: (
                <>
                  EN : (F, C) et (C, F). Chacun préfère l'équilibre où il fonce ; sans
                  coordination, (C, C) Pareto-domine (F, F).
                </>
              ),
              extra: (
                <>
                  <strong>Autre situation :</strong> deux firmes et un marché trop petit pour
                  deux.
                </>
              ),
            },
            {
              tag: "Et parfois… 0 EN en stratégies pures",
              title: "🪙 Matching pennies",
              body: (
                <>
                  Le joueur 2 veut montrer le même côté de la pièce que le joueur 1, qui veut
                  l'inverse. Aucune case n'est une paire de meilleures réponses mutuelles (slide
                  54).
                </>
              ),
              extra: <>La solution passe par les stratégies mixtes : → § 8.</>,
            },
          ]}
        />

        <Callout variant="attention" title="Limitation théorique des EN (slide 35)">
          <p>
            Beaucoup de jeux ont des <strong>équilibres multiples</strong>. Les prédictions faites
            par le concept d'EN sont alors souvent <strong>imprécises</strong>, comme dans la
            bataille des sexes, la chasse au cerf ou la poule mouillée : la théorie annonce « l'un
            de ces équilibres », sans dire lequel.
          </p>
        </Callout>

        <Quiz
          scope="b1"
          id="q4"
          question={<>Un équilibre de Nash, c'est un profil de stratégies tel que…</>}
          options={[
            {
              text: <>…les payoffs de tous les joueurs sont maximisés.</>,
              explain: (
                <>
                  Non — ce n'est ni la définition d'un EN, ni celle de l'efficacité de Pareto. Dans
                  l'EN (V, R) de la bataille des sexes, la femme n'obtient que 2, pas son maximum
                  4. Et un EN peut même être Pareto-dominé (dilemme du prisonnier !).
                </>
              ),
            },
            {
              text: (
                <>
                  …aucun joueur n'a intérêt à dévier seul, étant donné les stratégies des autres.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement. Chaque stratégie est une meilleure réponse à celles des autres :
                  étant donné ce que font les autres, personne ne peut gagner plus en changeant
                  SEUL de stratégie. C'est ce qui rend l'équilibre « stable » (slide 44).
                </>
              ),
            },
            {
              text: <>…chaque joueur joue une stratégie dominante.</>,
              explain: (
                <>
                  Non — ça, c'est un ESD, beaucoup plus exigeant. Tout ESD est un EN, mais
                  l'inverse est faux : la bataille des sexes a deux EN et aucun ESD (→ § 6).
                </>
              ),
            },
          ]}
        />

        <ExerciseBlock
          scope="b1"
          id="ex3"
          number={3}
          title="Le ménage des colocataires"
          difficulty={2}
          statement={
            <>
              <p>
                Léa et Max doivent décider, chacun de leur côté, s'ils nettoient l'appartement ce
                week-end. Nettoyer coûte 2 unités d'utilité (effort). Un appartement propre — il
                suffit qu'<em>au moins un</em> des deux nettoie — rapporte 3 unités à{" "}
                <em>chacun</em>. Si personne ne nettoie, personne ne gagne rien.
              </p>
              <p>
                <strong>a)</strong> Écris la forme normale (Léa en lignes). <strong>b)</strong>{" "}
                Quelqu'un a-t-il une stratégie dominante ? <strong>c)</strong> Trouve tous les EN,
                en justifiant chaque meilleure réponse par une inégalité. <strong>d)</strong> À
                quel jeu du cours cette situation ressemble-t-elle ?
              </p>
            </>
          }
          steps={[
            {
              title: "a) Construire la matrice case par case",
              content: (
                <>
                  <p>
                    Scénarios : les deux nettoient → <M tex="3 - 2 = 1" /> chacun. Un seul nettoie
                    → lui : <M tex="3 - 2 = 1" />, l'autre : 3 (propre sans effort !). Personne →
                    (0, 0).
                  </p>
                  <CompactMatrix
                    rowPlayer="Léa"
                    colPlayer="Max"
                    rows={["Nettoyer", "Paresser"]}
                    cols={["Nettoyer", "Paresser"]}
                    cells={[
                      [
                        [1, 1],
                        [1, 3],
                      ],
                      [
                        [3, 1],
                        [0, 0],
                      ],
                    ]}
                  />
                </>
              ),
            },
            {
              title: "b) Pas de stratégie dominante",
              content: (
                <p>
                  Pour Léa : si Max nettoie, Paresser (<M tex="3 > 1" />) ; si Max paresse,
                  Nettoyer (<M tex="1 > 0" />
                  ). Son meilleur choix dépend de Max → <strong>pas de dominante</strong> (idem
                  pour Max, par symétrie).
                </p>
              ),
            },
            {
              title: "c) Les meilleures réponses, inégalité par inégalité",
              content: (
                <>
                  <p>
                    Meilleures réponses de Léa (une par stratégie de Max) : à Nettoyer, Paresser,
                    car <M tex="u_L(P,N) > u_L(N,N)" />, soit <M tex="3 > 1" /> ; à Paresser,
                    Nettoyer, car <M tex="u_L(N,P) > u_L(P,P)" />, soit <M tex="1 > 0" />.
                  </p>
                  <p>
                    Meilleures réponses de Max (une par stratégie de Léa) : à Nettoyer, Paresser,
                    car <M tex="u_M(N,P) > u_M(N,N)" />, soit <M tex="3 > 1" /> ; à Paresser,
                    Nettoyer, car <M tex="u_M(P,N) > u_M(P,P)" />, soit <M tex="1 > 0" />.
                  </p>
                  <p>
                    Meilleures réponses mutuelles : <strong>(Nettoyer, Paresser) et (Paresser,
                    Nettoyer)</strong>. Deux EN, et dans chacun un seul colocataire nettoie.
                    Vérifie avec les boutons (les meilleures réponses sont soulignées) :
                  </p>
                  <PayoffMatrix
                    rowPlayer="Léa"
                    colPlayer="Max"
                    rows={["Nettoyer", "Paresser"]}
                    cols={["Nettoyer", "Paresser"]}
                    payoffs={[
                      [
                        [1, 1],
                        [1, 3],
                      ],
                      [
                        [3, 1],
                        [0, 0],
                      ],
                    ]}
                    interactive
                  />
                </>
              ),
            },
            {
              title: "d) Quel jeu du cours ?",
              content: (
                <p>
                  C'est la structure de la <strong>poule mouillée</strong> (slides 34-35), avec
                  Paresser dans le rôle de Faucon et Nettoyer dans le rôle de Colombe. Deux EN, et
                  chacun préfère celui où <em>l'autre</em> fait l'effort (3 au lieu de 1). Si les
                  deux « jouent dur » (personne ne nettoie), on obtient le pire résultat, (0, 0),
                  que (Nettoyer, Nettoyer) = (1, 1) domine au sens de Pareto.
                </p>
              ),
            },
          ]}
          result={
            <p>
              Deux EN : (Nettoyer, Paresser) et (Paresser, Nettoyer). Structure de poule mouillée
              : chacun espère que l'autre fera l'effort, et l'échec de coordination (personne ne
              nettoie) est le pire résultat collectif.
            </p>
          }
        />
      </Section>

      {/* ============================================================ */}
      {/* § 6 — Trois solutions, un diagramme · slides 36-37            */}
      {/* ============================================================ */}
      <Section id="s6" kicker="§ 6" title="Trois solutions, un diagramme">
        <Lead>
          Tu connais maintenant les trois outils de prédiction du cours. Mettons-les côte à côte
          (slides 36-37) : sur quelles hypothèses reposent-ils, que prédisent-ils, et quels liens
          les unissent ?
        </Lead>

        <p>
          Pour analyser une situation stratégique, la théorie des jeux propose des{" "}
          <strong>solutions</strong> (en anglais <em>solution concepts</em>) : l'
          <strong>équilibre en stratégies dominantes</strong> (ESD), les{" "}
          <strong>profils de stratégies survivants</strong> (PSS) et l'
          <strong>équilibre de Nash</strong> (EN). Dans chaque jeu, une solution{" "}
          <strong>sélectionne un sous-ensemble des profils de stratégies</strong>. Ces solutions
          prédisent le résultat qu'il faut s'attendre à observer si les joueurs sont rationnels,
          savent que leurs adversaires sont rationnels et anticipent correctement leurs actions.
        </p>

        <SolutionCards />

        <H4>Comment les trois solutions s'emboîtent (slide 37)</H4>
        <p>
          Le slide 37 relie les trois solutions par deux phrases : <strong>un ESD est un EN</strong>
          , et <strong>un EN est un PSS</strong>
          <sup>†</sup>. En langage d'ensembles :
        </p>

        <FormulaBox
          tex="\text{ESD} \;\subseteq\; \text{EN} \;\subseteq\; \text{PSS} \;\subseteq\; \text{tous les profils}"
          label="L'emboîtement des solutions (slide 37)"
          caption={
            <>
              L'ESD est au cœur, le PSS est le plus large. <sup>†</sup> Pour être précis, un EN
              est un PSS si on définit les PSS sur base de l'élimination des stratégies{" "}
              <em>strictement</em> dominées (note du slide 37, voir l'étape 3).
            </>
          }
        />

        <p>Pourquoi ces inclusions sont-elles vraies ? Trois étapes, sans calcul.</p>

        <Step n={1} title="Un ESD est toujours un EN">
          <p>
            Dans un ESD, chaque joueur joue sa stratégie dominante : la meilleure{" "}
            <em>quoi que fassent les autres</em>. Elle est donc en particulier la meilleure face à
            ce que les autres jouent vraiment. Chaque stratégie est une meilleure réponse aux
            autres : ce sont des meilleures réponses mutuelles, donc un EN.
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            Exemple : dans le dilemme du prisonnier, Confesser est dominante pour chacun, donc
            (C,&nbsp;C) est un ESD. Et c'est bien un EN : face à Confesser, Confesser rapporte 1
            et Nier 0.
          </p>
        </Step>

        <Step n={2} title="Un EN survit à l'élimination des stratégies strictement dominées">
          <p>
            Dans un EN, chaque stratégie est une meilleure réponse à ce que jouent les autres.
            Or une stratégie <em>strictement</em> dominée n'est jamais une meilleure réponse : la
            stratégie qui la domine fait strictement mieux face à tout, donc aussi face à ce que
            jouent les autres. Une stratégie d'EN n'est donc jamais éliminée au premier tour.
          </p>
          <p>
            Le jeu réduit contient encore toutes les stratégies de l'EN, et le même argument se
            répète à chaque itération. L'EN survit jusqu'au bout : c'est un PSS.
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            Exemple : dans la bataille des sexes, rien n'est éliminé (4 PSS) et les deux EN font
            bien partie de ces 4 profils.
          </p>
        </Step>

        <Step n={3} title="La note † : avec l'élimination « faible », un EN peut disparaître">
          <p>
            Le cours définit la dominance avec <M tex="\ge" /> (slide 18) : on peut éliminer une
            stratégie qui ne fait qu'<em>aussi bien</em> dans certains cas. L'argument de l'étape 2
            ne marche plus, et un EN peut être éliminé. C'est pourquoi le slide 37 précise que
            « EN ⊆ PSS » vaut pour l'élimination des stratégies <em>strictement</em> dominées.
          </p>
          <p>
            <strong>Exemple de la note † : la banque avec g ≥ m (§&nbsp;5).</strong> (R,&nbsp;R)
            est un EN : face à Retirer, Retirer et Laisser rapportent tous deux <M tex="m" />.
          </p>
          <UL>
            <li>
              Avec <M tex="\ge" /> : Retirer est dominée par Laisser (
              <M tex="m(1+r) > m" /> et <M tex="m \ge m" />
              ). On l'élimine pour les deux joueurs : seul (L,&nbsp;L) survit, et l'EN (R,&nbsp;R)
              n'est pas un PSS.
            </li>
            <li>
              Avec l'élimination stricte : face à Retirer, Laisser ne fait qu'aussi bien (
              <M tex="m = m" />
              ), donc Retirer n'est pas <em>strictement</em> dominée. Rien n'est éliminé, et
              (R,&nbsp;R) reste un PSS.
            </li>
          </UL>
        </Step>

        <Callout variant="examen" title="Le sens des inclusions">
          <p>
            Retiens <strong>ESD ⊆ EN ⊆ PSS</strong>, et pas l'inverse. Tout ESD est un EN, mais un
            EN n'est pas forcément un ESD (bataille des sexes : 2 EN, aucun ESD). Tout EN est un PSS
            (au sens strict), mais un PSS n'est pas forcément un EN (bataille des sexes : 4 PSS, 2
            EN).
          </p>
        </Callout>

        <Callout
          variant="intuition"
          title="Le paradoxe apparent : le plus petit ensemble repose sur l'hypothèse la plus faible"
        >
          <p>
            L'ESD ne demande que H1, l'hypothèse la plus faible, et c'est pourtant le plus petit
            des trois ensembles. D'habitude, on s'attend à l'inverse : plus on suppose de choses,
            plus on prédit précisément. Il n'y a pas de contradiction.
          </p>
          <UL>
            <li>
              <strong>L'ESD demande peu aux joueurs, mais beaucoup au jeu</strong> : chaque joueur
              doit avoir une stratégie dominante. C'est rare. Dans la plupart des jeux, l'ESD est
              vide : il ne prédit rien. Un ensemble vide est « petit », mais ce n'est pas une
              prédiction précise, c'est une absence de prédiction.
            </li>
            <li>
              <strong>Quand l'ESD existe, il est en général réduit à un seul profil</strong>, qui
              est aussi un EN et un PSS : les trois solutions sont d'accord, et cette prédiction ne
              demande que H1. C'est la plus solide.
            </li>
            <li>
              <strong>Les PSS et les EN ajoutent une hypothèse</strong> (H2 ou H3) pour pouvoir
              prédire quelque chose dans beaucoup plus de jeux. Ils sont plus grands que l'ESD
              parce qu'ils sont rarement vides, pas parce qu'ils reposent sur moins d'hypothèses.
            </li>
          </UL>
          <p className="mt-2">
            Image : l'ESD est un témoin très prudent, qui ne parle que lorsqu'il est absolument
            sûr. Il se tait souvent, mais quand il parle, tu peux le croire. Note enfin que l'EN
            repose sur H1 et H3, pas sur H2 : l'inclusion EN ⊆ PSS est un résultat (étape 2), pas
            un empilement d'hypothèses.
          </p>
        </Callout>

        <p>
          Vérifie ces inclusions jeu par jeu : choisis un jeu du chapitre, et ses profils
          viennent se placer dans le diagramme du slide 37.
        </p>

        <SolutionVenn />

        <Quiz
          scope="b1"
          id="q5"
          question={
            <>
              Un jeu possède un équilibre de Nash unique (V,&nbsp;W). Laquelle de ces affirmations
              est forcément vraie ?
            </>
          }
          options={[
            {
              text: <>(V,&nbsp;W) est un ESD.</>,
              explain: (
                <>
                  Faux — l'inclusion va dans l'autre sens : un ESD est un EN, mais un EN n'est pas
                  forcément un ESD. Exemple : le jeu du rendez-vous a un EN unique, (H,&nbsp;H), mais
                  pas d'ESD (vous n'avez pas de stratégie dominante : H face à H, R face à R).
                </>
              ),
            },
            {
              text: (
                <>
                  (V,&nbsp;W) est un PSS (au sens de la note † du slide 37 : élimination des
                  stratégies <em>strictement</em> dominées).
                </>
              ),
              correct: true,
              explain: (
                <>
                  Correct : un EN est un PSS (slide 37). Chaque stratégie de l'EN est une meilleure
                  réponse aux autres, donc jamais strictement dominée : elle survit à chaque étape
                  de l'élimination des stratégies strictement dominées. Attention : avec
                  l'élimination faible (<M tex="\ge" />) utilisée dans le cours, un EN peut être
                  éliminé, comme (R,&nbsp;R) dans la banque avec <M tex="g \ge m" />.
                </>
              ),
            },
            {
              text: <>(V,&nbsp;W) est efficace au sens de Pareto.</>,
              explain: (
                <>
                  Faux — le dilemme du prisonnier prouve le contraire : son EN unique (C,&nbsp;C)
                  est Pareto-dominé par (N,&nbsp;N).
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 7 — Théorie vs joueurs réels · slides 38-53                 */}
      {/* ============================================================ */}
      <Section id="s7" kicker="§ 7" title="Théorie vs joueurs réels : les données du labo">
        <Lead>
          La pertinence des prédictions de la théorie des jeux dépend du{" "}
          <strong>réalisme de ses hypothèses</strong> pour les interactions analysées (slide 38).
          Les étudiants du cours ont joué à plusieurs jeux en laboratoire. Leurs comportements se
          conforment-ils à ceux que prédit la théorie ? On teste les hypothèses une par une.
        </Lead>

        <LabMap />

        <p>
          Tous les jeux du labo en un coup d'œil : choisis un jeu pour voir sa matrice, ce qui a
          été joué et l'hypothèse testée. On les décortique ensuite un par un.
        </p>

        <LabGames />

        <H4>Test de H1 (1/2) : joue-t-on sa stratégie dominante ? (slides 38-39)</H4>
        <p>
          H1 dit que les joueurs sont rationnels. Première conséquence :{" "}
          <strong>un joueur rationnel utilise sa stratégie dominante quand il en a une</strong>.
        </p>

        <PayoffMatrix
          rowPlayer="P1"
          colPlayer="P2"
          rows={["X", "Y"]}
          cols={["X", "Y"]}
          payoffs={XY}
          caption={<>Slide 38. Payoff de P1 ; payoff de P2.</>}
        />

        <p>Pour le joueur 1, Y est dominante : elle rapporte plus que X, quoi que fasse P2.</p>
        <div className="my-3 grid gap-2.5 sm:grid-cols-2">
          <BR who="P1" side="row" against="X" answer="Y" ineq="u_1(Y,X) > u_1(X,X)" nums="3 > 1" />
          <BR who="P1" side="row" against="Y" answer="Y" ineq="u_1(Y,Y) > u_1(X,Y)" nums="2 > 0" />
        </div>
        <p>
          <strong>Résultat : 87 % des étudiants ont joué Y.</strong> Dans le dilemme du prisonnier,
          où tous les joueurs ont aussi une stratégie dominante (trahir, c'est-à-dire confesser),{" "}
          <strong>96 %</strong> l'ont jouée (slide 39). La grande majorité se comporte comme le
          prédit H1… mais pas tout le monde.
        </p>

        <Callout
          variant="intuition"
          title="Pourquoi certains ne trahissent pas ? L'explication de J. Roemer (slide 39)"
        >
          <p>
            Certains joueurs se comportent de manière <strong>« kantienne »</strong> : ils jugent
            une stratégie d'après le payoff qu'elle rapporterait <em>si tout le monde l'adoptait</em>
            . Si tout le monde nie, chacun obtient 2 ; si tout le monde confesse, chacun obtient 1.
            D'où leur conclusion : « nier est meilleur ».
          </p>
          <p className="mt-2">
            Ce raisonnement est rationnel du point de vue du groupe, mais pas au niveau individuel
            : un joueur maximise toujours son payoff en trahissant.
          </p>
          <p className="mt-2">
            Leçon du slide 39 : la rationalité individuelle n'est pas le seul principe qui guide
            les décisions humaines dans les interactions stratégiques. Des considérations d'ordre
            moral peuvent aussi influencer les comportements.
          </p>
        </Callout>

        <H4>Test de H1 (2/2) : évite-t-on ses stratégies dominées ? (slides 40-41)</H4>
        <p>
          Seconde conséquence de H1 :{" "}
          <strong>un joueur rationnel n'utilise pas ses stratégies dominées</strong>.
        </p>

        <PayoffMatrix
          rowPlayer="P1"
          colPlayer="P2"
          rows={["Haut", "Bas"]}
          cols={["Gauche", "Droite"]}
          payoffs={HB}
          caption={
            <>
              Slides 40 et 42. Ce jeu sert deux fois : pour tester H1 (côté P2), puis H2.1 (côté
              P1).
            </>
          }
        />

        <p>Pour P2, Droite est dominée par Gauche : Gauche rapporte plus, quoi que fasse P1.</p>
        <div className="my-3 grid gap-2.5 sm:grid-cols-2">
          <BR
            who="P2"
            side="col"
            against="Haut"
            answer="Gauche"
            ineq="u_2(H,G) > u_2(H,D)"
            nums="3 > 2"
          />
          <BR
            who="P2"
            side="col"
            against="Bas"
            answer="Gauche"
            ineq="u_2(B,G) > u_2(B,D)"
            nums="2 > 1"
          />
        </div>
        <p>
          <strong>Résultat : 12 % des étudiants ont joué Droite</strong>, la stratégie dominée. Il
          arrive aux humains de jouer une stratégie dominée (slide 40).
        </p>

        <p>Dans le jeu 3×3 suivant (slide 41), H est dominée par B pour le joueur 1 :</p>

        <PayoffMatrix
          rowPlayer="P1"
          colPlayer="P2"
          rows={["H", "M", "B"]}
          cols={["H", "M", "B"]}
          payoffs={G33}
          caption={<>Slide 41. Payoff de P1 ; payoff de P2.</>}
        />

        <p>
          Compare les lignes H et B de P1, colonne par colonne :{" "}
          <M tex="u_1(B,H) = 2 \ge 2 = u_1(H,H)" />, <M tex="u_1(B,M) = 1 \ge 1 = u_1(H,M)" /> et{" "}
          <M tex="u_1(B,B) = 2 > 1 = u_1(H,B)" />. B fait toujours au moins aussi bien que H, et
          mieux face à B : H est dominée (au sens du slide 18, avec <M tex="\ge" />).{" "}
          <strong>Résultat : 0 % des étudiants ont joué H.</strong>
        </p>

        <Callout variant="intuition" title="Une surprise : moins d'erreurs dans le jeu le plus difficile">
          <p>
            Un jeu à trois stratégies est plus difficile à analyser qu'un jeu à deux stratégies.
            On pourrait donc s'attendre à plus d'erreurs dans le jeu 3×3. C'est l'inverse : 0 %
            contre 12 %. Une explication possible (slide 41) : les étudiants ont peut-être appris
            à éviter les stratégies dominées en analysant les résultats du jeu précédent.
          </p>
        </Callout>

        <H4>Test de H2.1 : croit-on que les autres sont rationnels ? (slide 42)</H4>
        <p>
          H2.1 dit que chaque joueur <strong>croit que ses adversaires sont rationnels</strong>.
          Conséquence : les joueurs n'utilisent pas de stratégies qui n'entrent pas dans un PSS.
          Reprenons le jeu Haut/Bas, cette fois du côté de P1.
        </p>

        <Step n={1} title="P1 anticipe que P2 ne jouera pas Droite (H2.1)">
          <p>
            Droite est dominée pour P2. Si P1 croit que P2 est rationnel, il s'attend à ce que P2
            joue Gauche. P1 raisonne donc dans le jeu réduit à la seule colonne Gauche.
          </p>
        </Step>
        <Step n={2} title="Dans le jeu réduit, Bas est dominée par Haut">
          <p>
            Face à Gauche, Haut rapporte 3 et Bas 1 : <M tex="u_1(H,G) = 3 > u_1(B,G) = 1" />. Bas
            est éliminée à l'itération 1, et le seul PSS est (Haut,&nbsp;Gauche).
          </p>
        </Step>

        <p>
          <strong>Résultat : 29 % des étudiants ont pourtant joué Bas.</strong> Pas si étonnant :
          12 % des joueurs P2 ont joué la stratégie dominée Droite. Les étudiants P1 ne croyaient
          donc pas forcément que les P2 éviteraient leur stratégie dominée (slide 42).
        </p>
        <p>
          Cela dit, le payoff moyen obtenu par les P1 qui ont joué Bas est <strong>1,48</strong>,
          moins que celui des P1 qui ont joué Haut, <strong>2,64</strong>. Un calcul de payoff
          espéré explique ces deux moyennes.
        </p>

        <Step n={3} title="Le payoff espéré de Haut et de Bas face aux P2 observés">
          <p>
            Un P1 rencontre un P2 tiré au hasard : avec probabilité 0,88, ce P2 joue Gauche ; avec
            probabilité 0,12, il joue Droite. On pondère chaque payoff de P1 par sa probabilité :
          </p>
          <MB tex="\text{Haut} : \; 0{,}88 \times 3 + 0{,}12 \times 0 = 2{,}64" />
          <MB tex="\text{Bas} : \; 0{,}88 \times 1 + 0{,}12 \times 5 = 0{,}88 + 0{,}60 = 1{,}48" />
          <p>
            On retrouve exactement les moyennes du slide 42. Face aux P2 réellement observés, Haut
            rapportait plus : faire confiance à la rationalité des autres payait.
          </p>
        </Step>

        <Step n={4} title="À partir de quelle croyance Bas devient-il une bonne idée ?">
          <p>
            Notons <M tex="q" /> la part des P2 qui jouent Droite. Haut rapporte{" "}
            <M tex="3(1-q)" />, et Bas rapporte <M tex="1 \cdot (1-q) + 5q = 1 + 4q" />. Bas est
            meilleur si :
          </p>
          <MB tex="1 + 4q > 3 - 3q \iff 7q > 2 \iff q > \tfrac{2}{7} \approx 28{,}6\,\%" />
          <p>
            Bas n'est une meilleure réponse que si P1 croit que plus de 2/7 (environ 29 %) des P2
            jouent Droite. Avec les 12 % observés, on en est loin.
          </p>
        </Step>

        <Callout variant="attention" title="Ne confonds pas les deux « 29 % »">
          <p>
            <strong>29 %</strong>, c'est la part des P1 qui ont joué Bas (donnée du slide 42).{" "}
            <strong>2/7 ≈ 28,6 %</strong>, c'est le seuil de croyance sur la part des P2 qui jouent
            Droite, au-delà duquel Bas devient meilleur que Haut (notre calcul). Les deux nombres
            se ressemblent par hasard, mais ne mesurent pas du tout la même chose.
          </p>
        </Callout>

        <Callout variant="examen" title="Jouer Bas viole H2.1, pas H1">
          <p>
            Dans le jeu complet, Bas n'est pas dominée pour P1 (face à Droite, Bas rapporte 5 et
            Haut 0). Un joueur rationnel (H1) qui doute de la rationalité des P2 peut donc jouer
            Bas : c'est sa meilleure réponse s'il croit que plus de 2/7 des P2 jouent Droite. Ce
            qui est en défaut, c'est H2.1 (croire que les autres sont rationnels), pas H1.
          </p>
        </Callout>

        <Quiz
          scope="b1"
          id="q-labo"
          question={
            <>
              En labo, 29 % des joueurs P1 ont joué Bas, une stratégie qui n'entre pas dans le PSS
              du jeu Haut/Bas. Que peut-on en conclure ?
            </>
          }
          options={[
            {
              text: <>Ces joueurs sont irrationnels : H1 est violée.</>,
              explain: (
                <>
                  Non — dans le jeu complet, Bas n'est pas dominée (face à Droite, 5 &gt; 0). Un
                  joueur rationnel qui croit que plus de 2/7 des P2 jouent Droite a raison de jouer
                  Bas.
                </>
              ),
            },
            {
              text: (
                <>
                  Ces joueurs ne croient pas (assez) que les P2 sont rationnels : H2.1 est en
                  défaut.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui. Bas ne disparaît qu'une fois Droite éliminée, c'est-à-dire si P1 croit que P2
                  est rationnel (H2.1). Vu les 12 % de P2 qui ont joué Droite, ce doute n'était pas
                  absurde… mais il n'allait pas jusqu'à rendre Bas rentable.
                </>
              ),
            },
            {
              text: <>Jouer Bas était la meilleure réponse au comportement réel des P2.</>,
              explain: (
                <>
                  Non — face aux 12 % de Droite observés, Bas rapporte 1,48 et Haut 2,64 (slide 42).
                  Il aurait fallu plus de 2/7 ≈ 29 % de Droite pour que Bas devienne meilleur.
                </>
              ),
            },
          ]}
        />

        <H4>Test de H3 : se coordonne-t-on sur un EN ? (slides 43-46)</H4>
        <p>
          H3 dit que les joueurs <strong>anticipent correctement</strong> les stratégies de leurs
          adversaires. Avec H1, ils devraient donc se coordonner sur un EN. Test : la bataille des
          sexes (§&nbsp;5), avec ses deux EN, (V,&nbsp;R) et (P,&nbsp;B).
        </p>
        <p>
          <strong>
            Résultat au premier round : 21 % des hommes ont joué Viande, et 31 % des femmes ont
            joué Rouge.
          </strong>{" "}
          Les joueurs ne se sont pas coordonnés sur un des deux équilibres en stratégies pures
          (slide 43). Coordonnés sur (V,&nbsp;R), on aurait eu 100 % de Viande et 100 % de Rouge ;
          sur (P,&nbsp;B), 0 % des deux.
        </p>
        <p>
          Le slide 43 ajoute : le payoff obtenu par l'homme était un peu plus grand avec Poisson,
          alors que celui de la femme était beaucoup plus grand avec Blanc. Au round 1, Poisson
          rapportait en moyenne 1,38 contre 1,23 pour Viande ; Blanc rapportait 3,14 contre 0,43
          pour Rouge (slide 45). Les femmes avaient donc une raison bien plus forte de jouer Blanc
          que les hommes de jouer Poisson.
        </p>

        <H5>Est-il réaliste de supposer des anticipations correctes ? (slide 44)</H5>
        <UL>
          <li>
            Quand un jeu a plusieurs équilibres, comme la bataille des sexes, une coordination
            « spontanée » sur un des EN paraît <strong>peu probable</strong>.
          </li>
          <li>
            <strong>La communication</strong> : si les joueurs peuvent communiquer avant de jouer,
            la coordination devient plus vraisemblable, même si elle reste difficile dans ce type
            de jeu (les joueurs ne préfèrent pas le même EN).
          </li>
          <li>
            <strong>La répétition</strong> : si un jeu est joué de manière répétée, on s'attend à
            ce que les joueurs finissent par se coordonner sur un équilibre. Exemple : le sens de
            la marche sur les trottoirs de New York. Un équilibre particulier peut devenir une{" "}
            <strong>convention</strong>, un <strong>point focal</strong>.
          </li>
          <li>
            <strong>La stabilité</strong> : un EN est stable, au sens où aucun joueur n'a
            d'incitant à dévier de la stratégie qu'il joue, étant donné ce que jouent ses
            adversaires. Une fois qu'on y est, personne n'a intérêt à en sortir seul.
          </li>
        </UL>

        <H5>La répétition en labo : la bataille des sexes rejouée quatre fois (slide 45)</H5>
        <p>
          La répétition a-t-elle permis de se rapprocher d'un équilibre en stratégies pures ? Les
          26 étudiants ont rejoué la bataille des sexes pendant 4 rounds :
        </p>

        <ConvergenceBars />

        <p>
          Les payoffs suivent le même mouvement. Côté femmes, Blanc passe de 3,14 à 3,69 en moyenne
          et Rouge tombe de 0,43 à 0,15 ; côté hommes, Poisson passe de 1,38 à 1,85 et Viande tombe
          de 1,23 à 0,31. <strong>On observe une convergence vers l'équilibre (P,&nbsp;B)</strong>{" "}
          (slide 45) : comme l'annonçait le slide 44, la répétition aide les joueurs à se
          coordonner sur un équilibre.
        </p>

        <H5>D'autres facteurs rapprochent les comportements de la théorie (slide 46)</H5>
        <UL>
          <li>
            <strong>L'expérience des joueurs</strong> : un joueur expérimenté a eu le temps de se
            familiariser avec le jeu. Il a donc appris à le jouer de manière rationnelle.
          </li>
          <li>
            <strong>Les enjeux</strong> : plus les payoffs sont élevés, plus les joueurs sont
            incités à jouer le jeu sérieusement. De grands enjeux rendent plus coûteuse
            l'utilisation de stratégies qui ne sont pas des meilleures réponses.
          </li>
        </UL>
        <p>
          Pour cette raison, on s'attend à ce que les comportements de marché des firmes ou des
          traders soient <strong>proches</strong> de ce que prédit la théorie.
        </p>

        <H4>⭐ Le jeu « Devine 2/3 de la moyenne » (slides 47-51)</H4>
        <p>
          Ce jeu illustre à merveille les différences qui peuvent exister entre les prédictions de
          la théorie et le comportement de joueurs humains (slide 47). Les règles :
        </p>
        <UL>
          <li>
            il y a un grand nombre <M tex="N" /> de joueurs ;
          </li>
          <li>
            simultanément, chaque joueur <M tex="i" /> choisit un nombre réel{" "}
            <M tex="x_i \in [0, 100]" /> ;
          </li>
          <li>
            on calcule la moyenne des nombres choisis,{" "}
            <M tex="\bar{x} = \tfrac{1}{N} \sum_{i=1}^{N} x_i" /> ;
          </li>
          <li>
            le joueur dont le nombre <M tex="x_i" /> est le plus proche de{" "}
            <M tex="\tfrac{2}{3}\,\bar{x}" /> gagne.
          </li>
        </UL>
        <p>
          Exemple (chiffres illustratifs) : si la moyenne des nombres choisis vaut 30, la cible vaut{" "}
          <M tex="\tfrac{2}{3} \times 30 = 20" />, et celui qui a choisi le nombre le plus proche de
          20 gagne. On va analyser les PSS de ce jeu, voir ce qui se passe quand on le répète, puis
          ce qu'il nous apprend sur les marchés financiers.
        </p>

        <H5>Le raisonnement de la théorie : tout le monde joue 0 (slides 48-50)</H5>

        <Step n={0} title="Étape préliminaire (H1) : tout nombre au-dessus de 66,6 est dominé">
          <p>
            La moyenne vaut au maximum 100, si tous les joueurs jouent 100. La cible vaut donc au
            maximum <M tex="\tfrac{2}{3} \times 100 = 66{,}6" />. Un nombre{" "}
            <M tex="x_i > 66{,}6" /> est toujours plus éloigné de la cible que{" "}
            <M tex="x_i' = 66{,}6" /> : chaque fois que <M tex="i" /> gagne avec <M tex="x_i" />,
            il gagne aussi avec 66,6, mais l'inverse n'est pas vrai. Tout <M tex="x_i > 66{,}6" />{" "}
            est donc dominé par 66,6, et un joueur rationnel ne le joue pas.
          </p>
        </Step>
        <Step n={1} title="Itération 1 (H2.1) : tout nombre au-dessus de 44,4 est dominé">
          <p>
            Par H2.1, chaque joueur croit que ses adversaires sont rationnels, donc qu'ils ne
            jouent pas au-dessus de 66,6. La moyenne vaut alors au maximum 66,6, et la cible au
            maximum <M tex="\tfrac{2}{3} \times 66{,}6 = 44{,}4" />. Par le même raisonnement, dans
            le jeu réduit, tout <M tex="x_i > 44{,}4" /> est dominé par 44,4.
          </p>
        </Step>
        <Step n={2} title="Itération 2 (H2.2) : tout nombre au-dessus de 29,6 est dominé">
          <p>
            Par H2.2, chaque joueur croit que ses adversaires croient que leurs adversaires sont
            rationnels. La moyenne vaut au maximum 44,4, et la cible au maximum{" "}
            <M tex="\tfrac{2}{3} \times 44{,}4 = 29{,}6" />. Et ainsi de suite.
          </p>
        </Step>
        <Step n="n" title="Itération n (H2.n) : la borne tend vers 0">
          <p>
            Par H2.n, la moyenne vaut au maximum <M tex="(\tfrac{2}{3})^n \cdot 100" />, et la
            cible au maximum :
          </p>
          <MB tex="\left(\tfrac{2}{3}\right)^{n+1} \cdot 100 \;\xrightarrow[\;n \to \infty\;]{}\; 0" />
          <p>
            Quand <M tex="n \to \infty" />, le seul PSS est celui où{" "}
            <strong>
              tous les joueurs jouent <M tex="x_i = 0" />
            </strong>
            .
          </p>
        </Step>

        <MiniTbl
          head={[
            "Étape",
            "Hypothèse",
            <>
              max de <M tex="\bar{x}" />
            </>,
            <>
              max de la cible <M tex="\tfrac{2}{3}\bar{x}" />
            </>,
          ]}
          rows={[
            ["Étape préliminaire", "H1", "100", "66,6"],
            ["Itération 1", "H2.1", "66,6", "44,4"],
            ["Itération 2", "H2.2", "44,4", "29,6"],
            ["Itération 3", "H2.3", "29,6", "19,7"],
            [
              "Itération n",
              "H2.n",
              <M key="a" tex="(\tfrac{2}{3})^n \cdot 100" />,
              <M key="b" tex="(\tfrac{2}{3})^{n+1} \cdot 100" />,
            ],
            [<>quand <M key="c" tex="n \to \infty" /></>, "", "0", "0"],
          ]}
        />
        <p className="text-[13.5px] text-muted-foreground">
          Valeurs tronquées à une décimale, comme sur les slides (⅔ × 100 = 66,66… s'écrit 66,6).
          La ligne « itération 3 » est notre calcul : le slide 49 s'arrête à « etc. ».
        </p>

        <H5>En pratique : partir d'adversaires « peu sophistiqués » (slide 50)</H5>
        <p>
          Dans la pratique, ceux qui suivent ce genre de raisonnement itératif le débutent
          typiquement ailleurs. Au lieu de supposer que leurs adversaires ne jouent pas de
          stratégies dominées, ils supposent que ces adversaires,{" "}
          <strong>peu sophistiqués, choisissent un nombre au hasard</strong> :
        </p>
        <OL>
          <li>
            des adversaires qui jouent au hasard donnent une moyenne <M tex="\bar{x} = 50" /> : la
            meilleure réponse est <M tex="x_i = \tfrac{2}{3} \times 50 = 33{,}3" /> ;
          </li>
          <li>
            si un joueur croit que ses adversaires raisonnent tous comme ça, il s'attend à{" "}
            <M tex="\bar{x} = 33{,}3" /> : sa meilleure réponse est <M tex="x_i = 22{,}2" /> ;
          </li>
          <li>et ainsi de suite.</li>
        </OL>

        <GuessTwoThirds />

        <H5>Quand on répète le jeu (slide 51)</H5>
        <p>
          Après un round, tout le monde connaît le nombre gagnant, <M tex="\tfrac{2}{3}\bar{x}" />.
          Au round suivant, un joueur peut se dire que ses adversaires peu sophistiqués vont tous
          jouer ce nombre. Sa meilleure réponse est alors{" "}
          <M tex="\tfrac{2}{3} \cdot \tfrac{2}{3}\,\bar{x}" />. S'il croit que ses adversaires
          raisonnent tous comme ça, sa meilleure réponse devient{" "}
          <M tex="x_i = \tfrac{2}{3} \cdot \tfrac{2}{3} \cdot \tfrac{2}{3}\,\bar{x}" />. Et ainsi de
          suite : la cible a toutes les raisons de baisser d'un round à l'autre.
        </p>
        <p>
          Les données du labo (4 groupes d'étudiants ; dans chaque case, la cible{" "}
          <M tex="\tfrac{2}{3}\bar{x}" /> du round) :
        </p>
        <MiniTbl
          head={["", "Round 1", "Round 2", "Round 3", "Round 4"]}
          rows={[
            [<strong key="g">Groupe 1</strong>, "25,4", "12,7", "6,4", "—"],
            [<strong key="g">Groupe 2</strong>, "27,7", "14,6", "6,1", "—"],
            [<strong key="g">Groupe 3</strong>, "18,2", "11,5", "4,9", "1,3"],
            [<strong key="g">Groupe 4</strong>, "22,9", "9,6", "3", "0,6"],
          ]}
        />
        <p className="text-[13.5px] text-muted-foreground">
          Slide 51. Les groupes 1 et 2 n'ont pas de round 4 (case vide sur le slide). Lis chaque
          ligne séparément : chaque groupe a sa propre trajectoire.
        </p>
        <p>
          Au round 1, la cible était entre <strong>18,2 et 27,7</strong> selon le groupe : très
          loin de 0, la prédiction théorique. Puis, dans chaque groupe, elle dégringole d'un round
          à l'autre. Groupe 4 : 22,9 → 9,6 → 3 → 0,6 ; groupe 3 : 18,2 → 11,5 → 4,9 → 1,3. En
          répétant le jeu, les joueurs se rapprochent de la prédiction théorique.
        </p>

        <Callout variant="attention" title="La leçon stratégique du jeu (slide 53)">
          <p>
            La moyenne « rationnelle » est <M tex="\bar{x} = 0" />. Mais quand le jeu est joué par
            des humains, qui ne satisfont pas toutes les hypothèses de rationalité, un joueur qui
            choisit <M tex="x_i = 0" /> <strong>a peu de chances de gagner</strong>, en tout cas
            sur les premiers rounds. Ta meilleure réponse dépend de ce que les autres jouent
            vraiment : il vaut mieux anticiper leur raisonnement que jouer la prédiction théorique.
          </p>
        </Callout>

        <H4>Keynes, le concours de beauté et les bulles (slides 52-53)</H4>
        <p>
          La théorie rationnelle affirme que le prix <M tex="p" /> d'une action sur les marchés
          financiers est égal à son prix « correct » :
        </p>
        <FormulaBox
          tex="p^* = \Pi_0 + \delta\,\Pi_1 + \delta^2\,\Pi_2 + \delta^3\,\Pi_3 + \cdots"
          label="Prix « correct » d'une action (slide 52)"
          caption={
            <>
              <M tex="\Pi_t" /> désigne le dividende reçu au temps <M tex="t" />, et{" "}
              <M tex="\delta" /> le facteur d'escompte (<M tex="0 < \delta < 1" />).
            </>
          }
        />
        <p>
          Conséquence (slide 52) : l'évolution du prix de marché <M tex="p" /> doit seulement
          refléter l'impact des <strong>chocs économiques</strong> sur les profits futurs{" "}
          <M tex="\Pi_t" />. Par exemple, une nouvelle qui réduit les dividendes futurs fait baisser{" "}
          <M tex="p^*" />, donc le prix.
        </p>

        <Callout variant="intuition" title="🔗 Rappel du chapitre A2 : le facteur d'escompte">
          <p>
            Tu reconnais le <strong>facteur d'escompte</strong> <M tex="\delta" /> du chapitre A2.
            Un dividende <M tex="\Pi_t" /> reçu dans <M tex="t" /> périodes ne vaut aujourd'hui que{" "}
            <M tex="\delta^t\,\Pi_t" />, avec <M tex="\delta < 1" />. Exemple (chiffres
            illustratifs) : avec <M tex="\delta = 0{,}9" />, un dividende de 100 € reçu dans 2
            périodes vaut aujourd'hui <M tex="0{,}9^2 \times 100 = 81" /> €. Le prix « correct »
            est la somme de ces valeurs présentes. (En A2, <M tex="\delta" /> escompte l'utilité ;
            ici, il escompte des dividendes.)
          </p>
          <p className="mt-2">
            <TheoryRef chapter="a2" />
          </p>
        </Callout>

        <p>
          Keynes pensait que l'évolution du prix des actifs obéit à une logique différente, celle
          d'un <strong>« concours de beauté »</strong> où les participants votent pour désigner la
          plus belle femme. Pour réussir, un participant ne doit pas se demander quelle femme est
          la plus belle selon lui, mais plutôt{" "}
          <strong>anticiper quelle femme les autres participants vont trouver la plus belle</strong>
          . En itérant, il se demande quelle femme les autres pensent que leurs adversaires vont
          trouver la plus belle… On reconnaît la logique du jeu « devine 2/3 de la moyenne »
          (slide 52).
        </p>
        <p>
          Le slide 53 pousse le parallèle jusqu'au bout. Si le prix « correct » est{" "}
          <M tex="p^*" />, l'équivalent dans le jeu est la moyenne « rationnelle »{" "}
          <M tex="\bar{x} = 0" /> :
        </p>

        <MarketCompare />

        <H5>Comment naît une bulle (slide 53)</H5>

        <BubbleLoop />

        <p>
          Une bulle peut se former{" "}
          <strong>
            car il peut être intéressant d'acheter une action même si on sait que son prix est
            surévalué
          </strong>{" "}
          : ce qui compte, c'est le prix auquel les autres l'achèteront demain.
        </p>
      </Section>
    </>
  );
}
