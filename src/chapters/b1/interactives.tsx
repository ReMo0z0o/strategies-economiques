/*
 * Chapitre B1 — composants interactifs.
 *
 * Chaque widget reproduit fidèlement la logique du manuel interactif source :
 *  - MatrixExplorer      : l'explorateur de matrice du jeu du rendez-vous
 *    (clique sur une case → d'où viennent les deux payoffs) ;
 *  - PollPrisoner        : le sondage « Nier ou Confesser ? » + données de
 *    laboratoire du cours (96 % de Confesser, joueurs « kantiens ») ;
 *  - IteratedElimination : l'élimination itérative pas à pas sur le jeu 3×3 ;
 *  - NashHunter          : la méthode du soulignage sur 5 jeux célèbres
 *    (meilleures réponses calculées automatiquement, comme la source) ;
 *  - GuessTwoThirds      : « devine 2/3 de la moyenne » — borne (2/3)^n·100
 *    et joueur pratique 50·(2/3)^n, + « à toi de jouer » ;
 *  - PenaltyExplorer     : U_A = 20+60p+70q−100pq, U_G = 80−60p−70q+100pq,
 *    fonctions de meilleure réponse et EN mixte (0.7, 0.6) ;
 *  - PoliceMafia         : p* = x/(80+x) — le paradoxe de l'équilibre mixte ;
 *  - ConvergenceBars     : données du cours, bataille des sexes répétée ;
 *  - MasteryChecklist    : la checklist de maîtrise avec compteur.
 */

import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, RotateCcw, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";

/* ------------------------------------------------------------------ */
/* Helpers partagés                                                    */
/* ------------------------------------------------------------------ */

/** affiche −2 avec un vrai signe moins */
function fmtN(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

type Pay = readonly [number, number];

/**
 * Table de jeu « riche » : payoffs entourables (meilleures réponses),
 * cases dorées (EN / PSS survivants), lignes/colonnes barrées (éliminées).
 */
function GameTable({
  p1,
  p2,
  rows,
  cols,
  pay,
  ringRow,
  ringCol,
  gold,
  deadRows,
  deadCols,
}: {
  p1: string;
  p2: string;
  rows: string[];
  cols: string[];
  pay: Pay[][];
  /** clés "r,c" dont le payoff du joueur ligne est entouré */
  ringRow?: Set<string>;
  /** clés "r,c" dont le payoff du joueur colonne est entouré */
  ringCol?: Set<string>;
  /** clés "r,c" de cases surlignées en doré */
  gold?: Set<string>;
  deadRows?: Set<number>;
  deadCols?: Set<number>;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block rounded-2xl border bg-card p-3 sm:p-4">
        <div className="mb-1 text-center text-xs font-bold uppercase tracking-wider text-sky-700">
          {p2}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="shrink-0 text-xs font-bold uppercase tracking-wider text-rose-700"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {p1}
          </div>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-1.5" />
                {cols.map((c, j) => (
                  <th
                    key={c}
                    className={cn(
                      "min-w-[5rem] p-1.5 text-center text-sm font-semibold text-sky-700",
                      deadCols?.has(j) && "opacity-30 line-through",
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((rLabel, r) => (
                <tr key={rLabel}>
                  <th
                    className={cn(
                      "p-1.5 pr-2 text-right text-sm font-semibold text-rose-700",
                      deadRows?.has(r) && "opacity-30 line-through",
                    )}
                  >
                    {rLabel}
                  </th>
                  {cols.map((_, c) => {
                    const k = `${r},${c}`;
                    const dead = Boolean(deadRows?.has(r) || deadCols?.has(c));
                    const isGold = Boolean(gold?.has(k)) && !dead;
                    return (
                      <td key={c} className="p-1">
                        <div
                          className={cn(
                            "flex items-center justify-center gap-1 rounded-lg border-2 px-2.5 py-2 text-[15px] tabular-nums transition-all",
                            dead
                              ? "border-border bg-background opacity-30 line-through"
                              : isGold
                                ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                                : "border-border bg-background",
                          )}
                        >
                          <span
                            className={cn(
                              "rounded-full px-1 font-semibold text-rose-700",
                              ringRow?.has(k) && !dead && "bg-rose-100 ring-2 ring-rose-500",
                            )}
                          >
                            {fmtN(pay[r][c][0])}
                          </span>
                          <span className="text-muted-foreground">;</span>
                          <span
                            className={cn(
                              "rounded-full px-1 font-semibold text-sky-700",
                              ringCol?.has(k) && !dead && "bg-sky-100 ring-2 ring-sky-500",
                            )}
                          >
                            {fmtN(pay[r][c][1])}
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
  );
}

/** calcule les meilleures réponses (mêmes formules que la source) */
function bestResponses(pay: Pay[][]) {
  const nR = pay.length;
  const nC = pay[0].length;
  const br1 = new Set<string>();
  for (let c = 0; c < nC; c++) {
    let mx = -Infinity;
    for (let r = 0; r < nR; r++) mx = Math.max(mx, pay[r][c][0]);
    for (let r = 0; r < nR; r++) if (pay[r][c][0] === mx) br1.add(`${r},${c}`);
  }
  const br2 = new Set<string>();
  for (let r = 0; r < nR; r++) {
    let mx = -Infinity;
    for (let c = 0; c < nC; c++) mx = Math.max(mx, pay[r][c][1]);
    for (let c = 0; c < nC; c++) if (pay[r][c][1] === mx) br2.add(`${r},${c}`);
  }
  const nash = new Set<string>([...br1].filter((k) => br2.has(k)));
  return { br1, br2, nash };
}

/** panneau d'explication sous les widgets (équivalent du .wexpl source) */
function ExplainPanel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 min-h-[3rem] rounded-xl border border-dashed bg-muted/50 px-4 py-3 text-[14.5px] leading-relaxed">
      {children}
    </div>
  );
}

/** barre de pourcentage (sondages & données de labo) */
function Bar({
  label,
  pct,
  color = "bg-sky-600",
}: {
  label: string;
  pct: number;
  color?: string;
}) {
  return (
    <div className="my-1.5 flex items-center gap-2.5 text-sm">
      <span className="w-24 shrink-0 text-right text-[13px] text-muted-foreground">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-full border bg-background">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-11 shrink-0 text-[13px] font-bold tabular-nums">{pct}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Explorateur de matrice — le jeu du rendez-vous                   */
/* ------------------------------------------------------------------ */

const RDV_PAY: Pay[][] = [
  [
    [0, 0],
    [-2, -4],
  ],
  [
    [-1, -2],
    [0, -3],
  ],
];

const RDV_EXPL: Record<string, ReactNode> = {
  "0,0": (
    <p>
      <strong>(Heure, Heure)</strong> — Résultat : vous arrivez tous les deux à 16h. Personne
      n'attend, personne ne culpabilise, elle n'est pas en retard. Payoffs :{" "}
      <span className="font-bold text-rose-700">
        <M tex="u_V = 0" />
      </span>{" "}
      et{" "}
      <span className="font-bold text-sky-700">
        <M tex="u_A = 0" />
      </span>
      . Rien à additionner !
    </p>
  ),
  "0,1": (
    <p>
      <strong>(Heure, Retard)</strong> — Résultat : tu es à 16h, elle arrive à 16h15.{" "}
      <span className="text-rose-700">
        Toi : tu attends →{" "}
        <strong>
          <M tex="u_V = -2" />
        </strong>
      </span>
      .{" "}
      <span className="text-sky-700">
        Elle : elle te fait attendre (−1) <em>et</em> elle est en retard, ce qui la stresse (−3) →{" "}
        <strong>
          <M tex="u_A = -4" />
        </strong>
      </span>
      . La pire case du jeu pour elle.
    </p>
  ),
  "1,0": (
    <p>
      <strong>(Retard, Heure)</strong> — Résultat : elle est à 16h, toi à 16h15.{" "}
      <span className="text-rose-700">
        Toi : tu la fais attendre →{" "}
        <strong>
          <M tex="u_V = -1" />
        </strong>
      </span>
      .{" "}
      <span className="text-sky-700">
        Elle : elle attend →{" "}
        <strong>
          <M tex="u_A = -2" />
        </strong>
      </span>
      . Note qu'être en retard ne TE coûte rien en soi — contrairement à elle.
    </p>
  ),
  "1,1": (
    <p>
      <strong>(Retard, Retard)</strong> — Résultat : vous arrivez tous les deux à 16h15. Personne
      n'attend !{" "}
      <span className="text-rose-700">
        Toi : rien →{" "}
        <strong>
          <M tex="u_V = 0" />
        </strong>
      </span>
      .{" "}
      <span className="text-sky-700">
        Elle : personne n'attend, mais elle est en retard →{" "}
        <strong>
          <M tex="u_A = -3" />
        </strong>
      </span>
      .
    </p>
  ),
};

export function MatrixExplorer() {
  const [sel, setSel] = useState<string | null>(null);
  const rows = ["Heure", "Retard"];
  const cols = ["Heure", "Retard"];

  return (
    <InteractiveCard
      title="Explorateur de matrice — le jeu du rendez-vous"
      subtitle="Clique sur chaque case pour voir d'où viennent les nombres."
      footer={
        <>
          chaque case = un <strong>scénario</strong> raconté jusqu'au bout, puis évalué joueur par
          joueur. Le premier nombre (rouge) appartient toujours au joueur des <strong>lignes</strong>{" "}
          (Vous), le second (bleu) au joueur des <strong>colonnes</strong> (Amie). Vérifie que tu
          retrouves les −2 / −1 / −3 de l'histoire dans chaque case.
        </>
      }
    >
      <div className="overflow-x-auto">
        <div className="inline-block rounded-2xl border bg-card p-3 sm:p-4">
          <div className="mb-1 text-center text-xs font-bold uppercase tracking-wider text-sky-700">
            Amie
          </div>
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 text-xs font-bold uppercase tracking-wider text-rose-700"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Vous
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {cols.map((c) => (
                    <th
                      key={c}
                      className="min-w-[5.5rem] p-1.5 text-center text-sm font-semibold text-sky-700"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rLabel, r) => (
                  <tr key={rLabel}>
                    <th className="p-1.5 pr-2 text-right text-sm font-semibold text-rose-700">
                      {rLabel}
                    </th>
                    {cols.map((_, c) => {
                      const k = `${r},${c}`;
                      return (
                        <td key={c} className="p-1">
                          <button
                            type="button"
                            onClick={() => setSel(k)}
                            className={cn(
                              "flex w-full items-center justify-center gap-1 rounded-lg border-2 px-3 py-2.5 text-[15px] tabular-nums transition-all",
                              sel === k
                                ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                                : "border-border bg-background hover:bg-muted",
                            )}
                          >
                            <span className="font-semibold text-rose-700">
                              {fmtN(RDV_PAY[r][c][0])}
                            </span>
                            <span className="text-muted-foreground">;</span>
                            <span className="font-semibold text-sky-700">
                              {fmtN(RDV_PAY[r][c][1])}
                            </span>
                          </button>
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
      <figcaption className="mt-2 text-sm italic text-muted-foreground">
        Forme normale du jeu du rendez-vous
      </figcaption>
      <ExplainPanel>
        {sel ? (
          RDV_EXPL[sel]
        ) : (
          <p className="italic text-muted-foreground">
            Clique sur une case pour comprendre comment ses deux payoffs ont été calculés à partir
            de l'histoire…
          </p>
        )}
      </ExplainPanel>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Sondage du dilemme du prisonnier                                 */
/* ------------------------------------------------------------------ */

export function PollPrisoner() {
  const [choice, setChoice] = useState<"nier" | "conf" | null>(null);

  return (
    <div className="my-6 rounded-2xl border-2 border-primary/25 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <Vote className="h-4 w-4" aria-hidden />
        Sondage
      </div>
      <p className="mt-2 font-semibold">
        Et toi, à la place d'un prisonnier, tu ferais quoi ? (réponds, puis compare aux étudiants
        du cours)
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={choice !== null}
          onClick={() => setChoice("nier")}
          className={cn(
            "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
            choice === "nier"
              ? "border-sky-600 bg-sky-600 text-white"
              : "border-sky-600 text-sky-700 hover:bg-sky-50 disabled:opacity-40",
          )}
        >
          Nier
        </button>
        <button
          type="button"
          disabled={choice !== null}
          onClick={() => setChoice("conf")}
          className={cn(
            "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
            choice === "conf"
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-rose-600 text-rose-700 hover:bg-rose-50 disabled:opacity-40",
          )}
        >
          Confesser
        </button>
      </div>
      {choice !== null ? (
        <div className="mt-4 animate-in fade-in slide-in-from-top-1">
          <Bar label="Confesser" pct={96} color="bg-rose-600" />
          <Bar label="Nier" pct={4} color="bg-emerald-600" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            En laboratoire, <strong className="text-foreground">96 % des étudiants du cours</strong>{" "}
            ont joué leur stratégie dominante (Confesser). Les 4 % restants ? Une explication de
            J.&nbsp;Roemer : certains raisonnent de façon «&nbsp;<strong>kantienne</strong>&nbsp;»
            — ils évaluent une stratégie par le payoff qu'elle donnerait <em>si tout le monde
            l'adoptait</em>. C'est rationnel pour le groupe, mais pas au niveau individuel.
            Moralité : la rationalité individuelle n'est pas le seul moteur des décisions humaines.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Élimination itérative pas à pas (jeu 3×3)                        */
/* ------------------------------------------------------------------ */

const PSS_PAY: Pay[][] = [
  [
    [4, 2],
    [0, 0],
    [6, 0],
  ],
  [
    [0, 6],
    [1, 2],
    [3, 0],
  ],
  [
    [0, 0],
    [2, 4],
    [2, 0],
  ],
];

const PSS_STEPS: Array<{
  deadRows: Set<number>;
  deadCols: Set<number>;
  gold: boolean;
  expl: ReactNode;
}> = [
  {
    deadRows: new Set(),
    deadCols: new Set(),
    gold: false,
    expl: (
      <p>
        <strong>Étape 0 — le jeu de départ.</strong> On cherche une stratégie dominée. Pour{" "}
        <span className="font-bold text-sky-700">P2</span>, compare <strong>d</strong> et{" "}
        <strong>m</strong> ligne par ligne : <M tex="u_2(H, m) = 0 \ge u_2(H, d) = 0" /> ;{" "}
        <M tex="u_2(M, m) = 2 > 0" /> ; <M tex="u_2(B, m) = 4 > 0" />. →{" "}
        <strong>d est dominée par m</strong> : un P2 rationnel (H1) ne la jouera jamais. Clique
        sur « Étape suivante ».
      </p>
    ),
  },
  {
    deadRows: new Set(),
    deadCols: new Set([2]),
    gold: false,
    expl: (
      <p>
        <strong>Itération 1 (justifiée par H2.1).</strong> P1 <em>sait</em> que P2 est rationnel,
        donc P1 raye mentalement la colonne d et raisonne sur le jeu <em>réduit</em> 3×2. Dans ce
        jeu réduit, compare M et B pour <span className="font-bold text-rose-700">P1</span> :{" "}
        <M tex="u_1(B, g) = 0 \ge u_1(M, g) = 0" /> ; <M tex="u_1(B, m) = 2 > u_1(M, m) = 1" />. →{" "}
        <strong>M est dominée par B</strong> dans le jeu réduit. (Remarque : dans le jeu complet,
        M n'était PAS dominée — c'est l'élimination de d qui la rend dominée !)
      </p>
    ),
  },
  {
    deadRows: new Set([1]),
    deadCols: new Set([2]),
    gold: false,
    expl: (
      <p>
        <strong>Itération 2 (justifiée par H2.2).</strong> Tout le monde raisonne maintenant sur
        le jeu 2×2 restant. Vérifie : P1 préfère H contre g (<M tex="4 > 0" />) mais B contre m (
        <M tex="2 > 0" />)… aucune dominée. P2 préfère g contre H (<M tex="2 > 0" />) mais m
        contre B (<M tex="4 > 0" />)… aucune dominée. <strong>Le processus s'arrête.</strong>
      </p>
    ),
  },
  {
    deadRows: new Set([1]),
    deadCols: new Set([2]),
    gold: true,
    expl: (
      <p>
        <strong>Résultat : 4 PSS</strong> — (H, g), (H, m), (B, g) et (B, m), surlignés en doré.
        La prédiction reste imprécise : c'est la limite théorique des PSS. (Au fait : parmi ces 4
        profils, seuls (H, g) et (B, m) sont des équilibres de Nash — vérifie-le avec la méthode
        du soulignage de la partie 5 !)
      </p>
    ),
  },
];

export function IteratedElimination() {
  const [step, setStep] = useState(0);
  const st = PSS_STEPS[step];

  const gold = useMemo(() => {
    if (!st.gold) return undefined;
    const g = new Set<string>();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (!st.deadRows.has(r) && !st.deadCols.has(c)) g.add(`${r},${c}`);
      }
    }
    return g;
  }, [st]);

  return (
    <InteractiveCard
      title="L'élimination itérative, étape par étape"
      subtitle="Le jeu 3×3 de la partie 3 — avance dans le raisonnement et note quelle hypothèse justifie chaque itération."
      footer={
        <>
          chaque itération supplémentaire « consomme » un niveau de H2 : itération 1 ← H2.1,
          itération 2 ← H2.2… Et surtout : M n'était <strong>pas</strong> dominée dans le jeu
          complet — elle ne le devient qu'<em>après</em> l'élimination de d. C'est ça, le côté
          « itératif ».
        </>
      }
    >
      <GameTable
        p1="P1"
        p2="P2"
        rows={["H", "M", "B"]}
        cols={["g", "m", "d"]}
        pay={PSS_PAY}
        deadRows={st.deadRows}
        deadCols={st.deadCols}
        gold={gold}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-full border px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Étape précédente
        </button>
        <button
          type="button"
          disabled={step === PSS_STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(PSS_STEPS.length - 1, s + 1))}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Étape suivante →
        </button>
      </div>
      <ExplainPanel>{st.expl}</ExplainPanel>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Le chasseur d'équilibres — 5 jeux célèbres                       */
/* ------------------------------------------------------------------ */

type GameKey = "bds" | "cerf" | "poule" | "dp" | "mp";

const GAMES: Record<
  GameKey,
  { p1: string; p2: string; rows: string[]; cols: string[]; pay: Pay[][]; concl: ReactNode }
> = {
  bds: {
    p1: "Homme",
    p2: "Femme",
    rows: ["Viande", "Poisson"],
    cols: ["Rouge", "Blanc"],
    pay: [
      [
        [4, 2],
        [0, 0],
      ],
      [
        [0, 0],
        [2, 4],
      ],
    ],
    concl: (
      <p>
        <strong>2 équilibres de Nash :</strong> (Viande, Rouge) et (Poisson, Blanc) — les deux
        façons de se coordonner. Chacun préfère un équilibre différent : lui (V, R) qui lui donne
        4, elle (P, B) qui lui donne 4. Aucune stratégie n'est dominée ici : le jeu a{" "}
        <strong>4 PSS mais seulement 2 EN</strong> — l'EN est plus sélectif.
      </p>
    ),
  },
  cerf: {
    p1: "Chasseur 1",
    p2: "Chasseur 2",
    rows: ["Cerf", "Lièvre"],
    cols: ["Cerf", "Lièvre"],
    pay: [
      [
        [2, 2],
        [0, 1],
      ],
      [
        [1, 0],
        [1, 1],
      ],
    ],
    concl: (
      <p>
        <strong>2 EN :</strong> (Cerf, Cerf) et (Lièvre, Lièvre). Ici (C, C) Pareto-domine (L, L) :
        tout le monde préfère le même équilibre ! Le problème n'est pas le désaccord mais la{" "}
        <em>peur de l'erreur de l'autre</em> : si je crois que tu vas jouer Lièvre, ma meilleure
        réponse est Lièvre. La peur devient une prophétie auto-réalisatrice — exactement la
        logique d'une panique bancaire.
      </p>
    ),
  },
  poule: {
    p1: "Conducteur 1",
    p2: "Conducteur 2",
    rows: ["Faucon", "Colombe"],
    cols: ["Faucon", "Colombe"],
    pay: [
      [
        [-2, -2],
        [6, 0],
      ],
      [
        [0, 6],
        [2, 2],
      ],
    ],
    concl: (
      <p>
        <strong>2 EN :</strong> (Faucon, Colombe) et (Colombe, Faucon) — dans chaque équilibre, un
        seul joue l'action dangereuse et c'est son équilibre préféré. Si les joueurs échouent à se
        coordonner : (F, F) = collision, un résultat que (C, C) Pareto-domine. Application : deux
        firmes qui hésitent à entrer sur un marché trop petit pour deux.
      </p>
    ),
  },
  dp: {
    p1: "Prisonnier 1",
    p2: "Prisonnier 2",
    rows: ["Nier", "Confesser"],
    cols: ["Nier", "Confesser"],
    pay: [
      [
        [2, 2],
        [0, 3],
      ],
      [
        [3, 0],
        [1, 1],
      ],
    ],
    concl: (
      <p>
        <strong>1 seul EN :</strong> (Confesser, Confesser). Remarque que Confesser est la
        meilleure réponse à TOUT (les deux payoffs rouges entourés sont sur la même ligne, les
        deux bleus sur la même colonne) : c'est la signature d'une stratégie dominante. L'EN
        coïncide ici avec l'ESD — et il est Pareto-dominé par (N, N).
      </p>
    ),
  },
  mp: {
    p1: "Joueur 1",
    p2: "Joueur 2",
    rows: ["Pile", "Face"],
    cols: ["Pile", "Face"],
    pay: [
      [
        [0, 3],
        [3, 0],
      ],
      [
        [3, 0],
        [0, 3],
      ],
    ],
    concl: (
      <p>
        <strong>Aucun équilibre de Nash en stratégies pures !</strong> Regarde : aucune case n'a
        ses deux payoffs entourés. Normal : J2 veut copier J1, J1 veut faire l'inverse — le
        « perdant » de chaque case veut toujours dévier. La solution existe pourtant… en
        stratégies <em>mixtes</em> (partie 8) : chacun joue Pile avec probabilité 1/2.
      </p>
    ),
  },
};

export function NashHunter() {
  const [gameKey, setGameKey] = useState<GameKey>("bds");
  const [showBr1, setShowBr1] = useState(false);
  const [showBr2, setShowBr2] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const g = GAMES[gameKey];
  const { br1, br2, nash } = useMemo(() => bestResponses(g.pay), [g]);

  function selectGame(k: GameKey) {
    setGameKey(k);
    setShowBr1(false);
    setShowBr2(false);
    setRevealed(false);
  }

  return (
    <InteractiveCard
      title="Le chasseur d'équilibres — la méthode du soulignage sur 5 jeux célèbres"
      subtitle="Choisis un jeu, essaie de deviner les équilibres de tête, puis déroule la méthode dans l'ordre."
      controls={
        <ChoiceChips
          className="sm:col-span-2 lg:col-span-3"
          label="Choisis un jeu :"
          value={gameKey}
          onChange={selectGame}
          options={[
            { value: "bds", label: "⚔️ Bataille des sexes" },
            { value: "cerf", label: "🦌 Chasse au cerf" },
            { value: "poule", label: "🐔 Poule mouillée" },
            { value: "dp", label: "🔒 Dilemme du prisonnier" },
            { value: "mp", label: "🪙 Matching pennies" },
          ]}
        />
      }
      footer={
        <>
          les cases où <strong>les deux payoffs sont entourés</strong> sont les équilibres de Nash
          — des meilleures réponses <em>mutuelles</em>. Compte les EN de chaque jeu : 2, 2, 2, 1…
          et 0 pour matching pennies. C'est ce dernier cas qui motivera les stratégies mixtes.
        </>
      }
    >
      <GameTable
        p1={g.p1}
        p2={g.p2}
        rows={g.rows}
        cols={g.cols}
        pay={g.pay}
        ringRow={showBr1 ? br1 : undefined}
        ringCol={showBr2 ? br2 : undefined}
        gold={revealed ? nash : undefined}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowBr1(true)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
            showBr1
              ? "border-rose-300 bg-rose-100 text-rose-800"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          1 · Meilleures réponses de <span className="text-rose-700">{g.p1}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowBr2(true)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
            showBr2
              ? "border-sky-300 bg-sky-100 text-sky-800"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          2 · Meilleures réponses de <span className="text-sky-700">{g.p2}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setShowBr1(true);
            setShowBr2(true);
            setRevealed(true);
          }}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors",
            revealed
              ? "bg-amber-500 text-white"
              : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          3 · Révéler les équilibres
        </button>
        <button
          type="button"
          onClick={() => {
            setShowBr1(false);
            setShowBr2(false);
            setRevealed(false);
          }}
          className="inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Réinitialiser
        </button>
      </div>
      <ExplainPanel>
        {revealed ? (
          g.concl
        ) : showBr1 && showBr2 ? (
          <p>
            Les deux jeux de meilleures réponses sont marqués. Cherche les cases où{" "}
            <strong>les deux payoffs sont entourés</strong>… puis clique sur « Révéler les
            équilibres » pour vérifier.
          </p>
        ) : showBr1 ? (
          <p>
            Pour chaque <strong>colonne</strong> (chaque stratégie de {g.p2}), le{" "}
            <span className="font-bold text-rose-700">payoff rouge maximal</span> est entouré :
            c'est ce que ferait {g.p1} s'il anticipait cette colonne. Passe à l'étape 2.
          </p>
        ) : showBr2 ? (
          <p>
            Pour chaque <strong>ligne</strong>, le{" "}
            <span className="font-bold text-sky-700">payoff bleu maximal</span> est entouré : la
            meilleure réponse de {g.p2} à chaque stratégie de {g.p1}. Ajoute maintenant les
            meilleures réponses de J1.
          </p>
        ) : (
          <p>
            Applique la méthode dans l'ordre : étape 1, étape 2, puis révèle. Essaie d'abord de
            deviner les équilibres de tête !
          </p>
        )}
      </ExplainPanel>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Devine 2/3 de la moyenne                                         */
/* ------------------------------------------------------------------ */

export function GuessTwoThirds() {
  const [n, setN] = useState(0);
  const [mine, setMine] = useState(25);
  const [played, setPlayed] = useState<number | null>(null);

  const bound = 100 * Math.pow(2 / 3, n);
  const level = 50 * Math.pow(2 / 3, n);

  // repère SVG identique à la source : X(k) = 42 + k·(316/12), Y(v) = 205 − v·1.73
  const X = (k: number) => 42 + (k * 316) / 12;
  const Y = (v: number) => 205 - v * 1.73;
  const pts1: string[] = [];
  const pts2: string[] = [];
  for (let k = 0; k <= 12; k++) {
    pts1.push(`${X(k)},${Y(100 * Math.pow(2 / 3, k))}`);
    pts2.push(`${X(k)},${Y(50 * Math.pow(2 / 3, k))}`);
  }

  const nTexts: ReactNode[] = [
    <>
      <strong>n = 0</strong> : aucun raisonnement. Théorie : rien n'est encore éliminé (borne
      100). Pratique : « les autres jouent au hasard, moyenne 50 ».
    </>,
    <>
      <strong>n = 1</strong> : la théorie élimine tout ce qui dépasse ⅔·100 = 66.7 (dominé par
      66.7). Le joueur pratique répond à une moyenne de 50 : il joue ⅔·50 = 33.3. En labo,
      beaucoup d'humains s'arrêtent ICI.
    </>,
    <>
      <strong>n = 2</strong> : « je sais que tu sais… » (H2.2). Borne : 44.4. Joueur pratique :
      22.2 — proche des cibles observées en labo au round 1 (18 à 28) !
    </>,
    <>
      <strong>n = 3</strong> : borne 29.6, joueur pratique 14.8. On dépasse déjà la profondeur de
      raisonnement de la plupart des humains au premier round.
    </>,
  ];

  let playMsg: ReactNode = null;
  if (played !== null) {
    const v = played;
    if (v > 66.7) {
      playMsg = (
        <>
          Aïe : {v} est une <strong>stratégie dominée</strong> (la cible ne peut jamais dépasser
          66.7). Jouer 66.7 ferait strictement mieux dans tous les cas.
        </>
      );
    } else if (v >= 15 && v <= 30) {
      playMsg = (
        <>
          Bien joué : {v} correspond à 1–2 niveaux de raisonnement — exactement la zone des cibles
          gagnantes observées au round 1 en labo (entre 18.2 et 27.7 selon les groupes). Tu
          raisonnes comme un humain… face à des humains, c'est optimal !
        </>
      );
    } else if (v < 5) {
      playMsg = (
        <>
          {v} est (presque) la prédiction théorique… mais face à des humains au round 1, tu aurais
          probablement <strong>perdu</strong> : les cibles observées étaient entre 18 et 28. Être
          hyper-rationnel face à des joueurs qui ne le sont pas n'est pas une meilleure réponse.
          (Aux rounds suivants, en revanche…)
        </>
      );
    } else {
      playMsg = (
        <>
          {v} : jouable, mais un peu éloigné des cibles observées au round 1 en labo (18 à 28).
          Vise environ ⅔ de la moyenne que tu anticipes chez les autres.
        </>
      );
    }
  }

  return (
    <InteractiveCard
      title="Descendre l'escalier du raisonnement — « devine 2/3 de la moyenne »"
      subtitle={
        <>
          Chaque cran de raisonnement multiplie la borne par ⅔ : après <M tex="n" /> itérations,
          rien au-dessus de <M tex="(2/3)^n \cdot 100" /> ne survit.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Profondeur de raisonnement <M tex="n" />
              </>
            }
            value={n}
            onChange={setN}
            min={0}
            max={12}
            step={1}
            format={(v) => `n = ${v}`}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              Borne théorique <M tex="(2/3)^n \cdot 100" /> ={" "}
              <span className="tabular-nums text-rose-700">{bound.toFixed(1)}</span>
            </span>
            <span className="text-muted-foreground">« rien au-dessus ne survit »</span>
          </div>
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              Joueur « pratique » de niveau n ={" "}
              <span className="tabular-nums text-sky-700">{level.toFixed(1)}</span>
            </span>
            <span className="text-muted-foreground">
              (part de <M tex="\bar{x} = 50" /> et itère ⅔)
            </span>
          </div>
        </>
      }
      footer={
        <>
          la <span className="font-semibold text-rose-700">borne théorique</span> et le{" "}
          <span className="font-semibold text-sky-700">joueur pratique</span> convergent tous les
          deux vers 0 — mais les humains s'arrêtent en route (1–2 itérations au round 1). La
          « bonne » réponse dépend donc… de la profondeur de raisonnement des autres.
        </>
      }
    >
      <svg
        viewBox="0 0 380 250"
        role="img"
        aria-label="Convergence vers zéro du jeu devine deux tiers de la moyenne"
        className="mx-auto w-full max-w-md"
      >
        <line x1="42" y1="205" x2="358" y2="205" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <line x1="42" y1="205" x2="42" y2="22" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <text x="200" y="238" textAnchor="middle" fontSize="12" className="fill-muted-foreground">
          itérations n
        </text>
        <text
          x="16"
          y="115"
          textAnchor="middle"
          fontSize="12"
          className="fill-muted-foreground"
          transform="rotate(-90 16 115)"
        >
          nombre choisi
        </text>
        <text x="36" y="40" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          100
        </text>
        <text x="36" y="122" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          50
        </text>
        <text x="36" y="209" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          0
        </text>
        <line x1="42" y1={Y(50)} x2="358" y2={Y(50)} stroke="#e2e8f0" strokeWidth="1" />
        <polyline fill="none" stroke="#e11d48" strokeWidth="2.5" points={pts1.join(" ")} />
        <polyline
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeDasharray="5 4"
          points={pts2.join(" ")}
        />
        <circle cx={X(n)} cy={Y(bound)} r="5" fill="#e11d48" />
        <circle cx={X(n)} cy={Y(level)} r="5" fill="#0284c7" />
        <text x="352" y="30" textAnchor="end" fontSize="12" fontWeight="600" fill="#e11d48">
          borne théorique
        </text>
        <text x="352" y="46" textAnchor="end" fontSize="12" fontWeight="600" fill="#0284c7">
          joueur pratique
        </text>
      </svg>
      <ExplainPanel>
        <p>
          {n < nTexts.length ? (
            nTexts[n]
          ) : (
            <>
              <strong>n = {n}</strong> : borne {bound.toFixed(1)}, joueur pratique{" "}
              {level.toFixed(1)}. Chaque itération multiplie par ⅔. À l'infini, tout converge vers
              0 : l'unique PSS est « tout le monde joue 0 ».
            </>
          )}
        </p>
      </ExplainPanel>

      <div className="mt-4 rounded-xl border bg-muted/40 p-3.5">
        <div className="mb-2 text-[13.5px] font-bold">
          🎮 À toi : quel nombre jouerais-tu au 1ᵉʳ round ?
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <SliderControl
            className="min-w-[220px] flex-1"
            label="Ton nombre"
            value={mine}
            onChange={(v) => {
              setMine(v);
              setPlayed(null);
            }}
            min={0}
            max={100}
            step={0.5}
            format={(v) => v.toFixed(1)}
          />
          <button
            type="button"
            onClick={() => setPlayed(mine)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Jouer
          </button>
        </div>
        {playMsg !== null ? (
          <div className="mt-3 rounded-lg border border-dashed bg-background px-3.5 py-2.5 text-sm leading-relaxed animate-in fade-in">
            {playMsg}
          </div>
        ) : null}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Le pénalty : trouve l'EN mixte à la main                         */
/* ------------------------------------------------------------------ */

export function PenaltyExplorer() {
  const [p, setP] = useState(0.3);
  const [q, setQ] = useState(0.3);

  // mêmes formules que la source
  const UA = 20 + 60 * p + 70 * q - 100 * p * q;
  const UG = 80 - 60 * p - 70 * q + 100 * p * q;
  const dUAdp = 60 - 100 * q;
  const dUGdq = 100 * p - 70;

  const brA =
    q < 0.6 ? "p = 1 (tirer à Droite)" : q > 0.6 ? "p = 0 (tirer à Gauche)" : "n'importe quel p (indifférent !)";
  const brG =
    p < 0.7 ? "q = 0 (plonger à Gauche)" : p > 0.7 ? "q = 1 (plonger à Droite)" : "n'importe quel q (indifférent !)";
  const atEq = Math.abs(p - 0.7) < 0.005 && Math.abs(q - 0.6) < 0.005;

  // repère : X(p) = 50 + 280p ; Y(q) = 250 − 220q
  const X = (pp: number) => 50 + 280 * pp;
  const Y = (qq: number) => 250 - 220 * qq;

  return (
    <InteractiveCard
      title="Trouve l'équilibre du pénalty à la main"
      subtitle={
        <>
          Le point noir = ton profil <M tex="(p, q)" />. Amène-le sur l'intersection des deux
          fonctions de meilleure réponse.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <span className="text-rose-700">
                p — proba que l'attaquant tire à Droite
              </span>
            }
            value={p}
            onChange={setP}
            min={0}
            max={1}
            step={0.01}
            format={(v) => v.toFixed(2)}
          />
          <SliderControl
            label={
              <span className="text-sky-700">q — proba que le gardien plonge à Droite</span>
            }
            value={q}
            onChange={setQ}
            min={0}
            max={1}
            step={0.01}
            format={(v) => v.toFixed(2)}
          />
          <div className="flex flex-col justify-center gap-0.5 text-[13px]">
            <span className="font-semibold text-rose-700">
              Payoff attendu attaquant <M tex="U_A" /> ={" "}
              <span className="tabular-nums">{UA.toFixed(1)}</span>
            </span>
            <span className="font-semibold text-sky-700">
              Payoff attendu gardien <M tex="U_G" /> ={" "}
              <span className="tabular-nums">{UG.toFixed(1)}</span>
            </span>
          </div>
        </>
      }
      footer={
        <>
          la ligne <span className="font-semibold text-rose-700">rouge</span> = meilleure réponse
          de l'attaquant à chaque q ; la ligne{" "}
          <span className="font-semibold text-sky-700">bleue</span> (pointillée) = celle du
          gardien à chaque p. L'EN est leur <strong>unique intersection</strong> (0.7, 0.6) :
          place le point dessus et constate que plus personne ne peut améliorer son payoff attendu
          en déviant seul.
        </>
      }
    >
      <svg
        viewBox="0 0 380 310"
        role="img"
        aria-label="Fonctions de meilleure réponse et équilibre de Nash mixte du jeu de pénalty"
        className="mx-auto w-full max-w-md"
      >
        <line x1="50" y1="250" x2="335" y2="250" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <line x1="50" y1="250" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <text x="330" y="272" textAnchor="end" fontSize="12.5" className="fill-muted-foreground">
          p (attaquant → Droit)
        </text>
        <text
          x="24"
          y="140"
          textAnchor="middle"
          fontSize="12.5"
          className="fill-muted-foreground"
          transform="rotate(-90 24 140)"
        >
          q (gardien → Droit)
        </text>
        <text x="46" y="264" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          0
        </text>
        <text x="330" y="264" textAnchor="middle" fontSize="11" className="fill-muted-foreground">
          1
        </text>
        <text x="42" y="34" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          1
        </text>
        <text x="246" y="264" textAnchor="middle" fontSize="11" fontWeight="600" fill="#e11d48">
          0.7
        </text>
        <text x="42" y="122" textAnchor="end" fontSize="11" fontWeight="600" fill="#0284c7">
          0.6
        </text>
        {/* meilleure réponse de l'attaquant : p = 1 si q < 0.6, p = 0 si q > 0.6 */}
        <polyline
          fill="none"
          stroke="#e11d48"
          strokeWidth="3"
          points="330,250 330,118 50,118 50,30"
          opacity="0.9"
        />
        {/* meilleure réponse du gardien : q = 0 si p < 0.7, q = 1 si p > 0.7 */}
        <polyline
          fill="none"
          stroke="#0284c7"
          strokeWidth="3"
          points="50,250 246,250 246,30 330,30"
          opacity="0.9"
          strokeDasharray="7 5"
        />
        <circle cx="246" cy="118" r="7" fill="#d97706" stroke="#111827" strokeWidth="1.5" />
        <text x="258" y="108" fontSize="12.5" fontWeight="700" fill="#d97706">
          EN (0.7, 0.6)
        </text>
        <circle cx={X(p)} cy={Y(q)} r="6" fill="#111827" />
        <text x="62" y="44" fontSize="12" fontWeight="600" fill="#e11d48">
          meilleure réponse attaquant
        </text>
        <text x="62" y="240" fontSize="12" fontWeight="600" fill="#0284c7">
          meilleure réponse gardien
        </text>
      </svg>
      <ExplainPanel>
        <p>
          Face à q = {q.toFixed(2)}, la meilleure réponse de l'
          <span className="font-bold text-rose-700">attaquant</span> est : <strong>{brA}</strong>{" "}
          (car <M tex="\partial U_A / \partial p = 60 - 100q" /> = {dUAdp.toFixed(0)}).
          <br />
          Face à p = {p.toFixed(2)}, la meilleure réponse du{" "}
          <span className="font-bold text-sky-700">gardien</span> est : <strong>{brG}</strong>{" "}
          (car <M tex="\partial U_G / \partial q = 100p - 70" /> = {dUGdq.toFixed(0)}).
        </p>
        {atEq ? (
          <p className="mt-2 font-semibold text-emerald-700">
            🎯 Tu es sur l'équilibre de Nash mixte ! Chacun est indifférent, donc personne ne peut
            gagner en déviant seul : <M tex="U_A = 62" /> et <M tex="U_G = 38" /> quoi qu'on fasse
            localement.
          </p>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Ce profil n'est <strong>pas</strong> un équilibre : au moins un joueur voudrait
            dévier. Amène le point noir sur l'intersection (0.7, 0.6).
          </p>
        )}
      </ExplainPanel>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Police vs mafia : p* = x / (80 + x)                              */
/* ------------------------------------------------------------------ */

export function PoliceMafia() {
  const [x, setX] = useState(20);
  const p = x / (80 + x);

  // repère : X(x) = 46 + 3.04x ; Y(p) = 190 − 243p
  const PX = (xx: number) => 46 + 3.04 * xx;
  const PY = (pp: number) => 190 - 243 * pp;
  const pts: string[] = [];
  for (let xx = 0; xx <= 100; xx += 2) pts.push(`${PX(xx)},${PY(xx / (80 + xx))}`);

  return (
    <InteractiveCard
      title="Quand mieux réprimer en banlieue… vide la banlieue de policiers"
      subtitle={
        <>
          À l'équilibre mixte, la stratégie de la police <M tex="p^* = x/(80+x)" /> sort de
          l'équation d'indifférence de la <em>mafia</em>. Augmente <M tex="x" /> et observe.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                <M tex="x" /> — efficacité de la police en banlieue
              </>
            }
            value={x}
            onChange={setX}
            min={0}
            max={100}
            step={1}
            format={(v) => v.toFixed(0)}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              <M tex="p^*" /> = proba d'aller en VILLE :{" "}
              <span className="tabular-nums text-rose-700">{(p * 100).toFixed(1)} %</span>
            </span>
            <span className="text-muted-foreground">
              <M tex="1 - p^*" /> = proba d'aller en BANLIEUE :{" "}
              <span className="tabular-nums">{((1 - p) * 100).toFixed(1)} %</span>
            </span>
          </div>
        </>
      }
      footer={
        <>
          la courbe est <strong>croissante</strong> : plus la police devient efficace en banlieue
          (x ↑), plus elle patrouille… en ville ! À l'équilibre mixte, ta stratégie sert à
          maintenir l'<em>adversaire</em> indifférent — pas à exploiter tes propres forces.
        </>
      }
    >
      <svg
        viewBox="0 0 380 230"
        role="img"
        aria-label="Courbe p étoile égale x sur 80 plus x"
        className="mx-auto w-full max-w-md"
      >
        <line x1="46" y1="190" x2="350" y2="190" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <line x1="46" y1="190" x2="46" y2="24" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <text x="200" y="222" textAnchor="middle" fontSize="12" className="fill-muted-foreground">
          x (efficacité en banlieue)
        </text>
        <text
          x="20"
          y="107"
          textAnchor="middle"
          fontSize="12"
          className="fill-muted-foreground"
          transform="rotate(-90 20 107)"
        >
          p* (police en ville)
        </text>
        <text x="42" y="194" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          0
        </text>
        <text x="42" y="48" textAnchor="end" fontSize="11" className="fill-muted-foreground">
          0.6
        </text>
        <line x1="46" y1="44" x2="350" y2="44" stroke="#e2e8f0" strokeWidth="1" />
        <polyline fill="none" stroke="#e11d48" strokeWidth="2.5" points={pts.join(" ")} />
        <circle cx={PX(x)} cy={PY(p)} r="6" fill="#111827" />
      </svg>
      <ExplainPanel>
        <p>
          {x <= 10 ? (
            <>
              Avec x = {x.toFixed(0)} (police peu efficace en banlieue), la banlieue est un refuge
              tentant pour la mafia : pour la dissuader, la police doit y passer presque tout son
              temps ({((1 - p) * 100).toFixed(1)} %) et ne va en ville que{" "}
              {(p * 100).toFixed(1)} % du temps. Augmente x et observe le paradoxe…
            </>
          ) : (
            <>
              Avec x = {x.toFixed(0)}, la police patrouille en ville {(p * 100).toFixed(1)} % du
              temps. Augmente x : la police devient plus efficace en banlieue… et y va MOINS
              souvent ({((1 - p) * 100).toFixed(1)} %). La mafia, terrifiée par la banlieue, s'est
              reportée sur la ville — la police l'y suit. À l'équilibre mixte, ta stratégie sert à
              maintenir l'adversaire indifférent.
            </>
          )}
        </p>
      </ExplainPanel>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Données du cours : bataille des sexes répétée                    */
/* ------------------------------------------------------------------ */

export function ConvergenceBars() {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border-2 border-primary/25 bg-card shadow-sm">
      <div className="border-b border-primary/15 bg-accent/50 px-4 py-3 sm:px-5">
        <div className="text-[15px] font-bold leading-snug">
          Données du cours · Bataille des sexes répétée (26 étudiants)
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          % des joueurs choisissant chaque stratégie, round après round
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5">
        <p className="mb-1 text-sm font-bold text-emerald-700">
          % Poisson (hommes) — converge vers 100 %
        </p>
        <Bar label="Round 1" pct={79} color="bg-emerald-600" />
        <Bar label="Round 2" pct={85} color="bg-emerald-600" />
        <Bar label="Round 3" pct={83} color="bg-emerald-600" />
        <Bar label="Round 4" pct={92} color="bg-emerald-600" />
        <p className="mb-1 mt-4 text-sm font-bold text-sky-700">% Blanc (femmes) — converge aussi</p>
        <Bar label="Round 1" pct={69} />
        <Bar label="Round 2" pct={85} />
        <Bar label="Round 3" pct={92} />
        <Bar label="Round 4" pct={92} />
      </div>
      <div className="border-t bg-muted/40 px-4 py-3 text-sm text-muted-foreground sm:px-5">
        Le payoff moyen de Blanc grimpe de 3.14 à 3.69 au fil des rounds, celui de Rouge
        s'effondre à 0.15 : l'équilibre (P, B) devient une <strong>convention</strong>. Remarque :
        c'est l'équilibre <em>préféré des femmes</em> qui s'est imposé ici.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Checklist de maîtrise                                            */
/* ------------------------------------------------------------------ */

export function MasteryChecklist({ items }: { items: ReactNode[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

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
                checked
                  ? "border-emerald-300 bg-emerald-50"
                  : "bg-card hover:border-emerald-300",
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
