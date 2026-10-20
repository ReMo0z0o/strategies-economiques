/*
 * Chapitre B1 — composants interactifs.
 *
 * Chaque widget reproduit fidèlement la logique du manuel interactif source :
 *  - MatrixExplorer      : l'explorateur de matrice du jeu du rendez-vous
 *    (clique sur une case → d'où viennent les deux payoffs) ;
 *  - PollPrisoner        : le sondage « Nier ou Confesser ? » + données de
 *    laboratoire du cours (96 % de Confesser, joueurs « kantiens ») ;
 *  - IteratedElimination : l'élimination itérative pas à pas sur le jeu 3×3 ;
 *  - NashHunter          : la méthode des meilleures réponses sur 5 jeux types
 *    (meilleures réponses calculées automatiquement + inégalités du slide 28) ;
 *  - GuessTwoThirds      : « devine 2/3 de la moyenne » — escalier H1, H2.1…
 *    (borne (2/3)^{n+1}·100 à l'itération n), joueur pratique 50 → 33,3 → 22,2,
 *    « à toi de jouer » et cibles des 4 groupes du labo (slide 51) ;
 *  - PenaltyExplorer     : carré des probabilités, U_A = 20+60p+70q−100pq,
 *    3 cas des meilleures réponses et EN mixte (0,7 ; 0,6) (slides 61-64) ;
 *  - PoliceMafia         : p* = x/(80+x) et 1 − p* — le paradoxe de l'EN mixte ;
 *  - ConvergenceBars     : bataille des sexes répétée en labo (slide 45) ;
 *  - MasteryChecklist    : la checklist de maîtrise avec compteur.
 */

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Pause, Play, RotateCcw, Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M, MB } from "@/components/course/Math";
import { C, Dot, Frame, GuideH, GuideV, Label, Legend, PlotSvg, curvePath, fmt, makePlot } from "@/chapters/shared/plot";

/* ------------------------------------------------------------------ */
/* Helpers partagés                                                    */
/* ------------------------------------------------------------------ */

/** affiche −2 avec un vrai signe moins */
function fmtN(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

/** nombre pour KaTeX : virgule décimale française (0{,}5) et signe moins ASCII */
function tx(v: number, d = 2): string {
  return fmt(v, d).replace(",", "{,}").replace("−", "-");
}

/** tronque à une décimale, comme les slides (⅔·100 = 66,66… s'écrit 66,6) */
function trunc1(v: number): number {
  return Math.floor(v * 10 + 1e-9) / 10;
}

/** petit bouton lecture / pause pour les animations pas à pas */
function PlayButton({
  playing,
  onClick,
  label = "Animer",
}: {
  playing: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
    >
      {playing ? (
        <Pause className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Play className="h-3.5 w-3.5" aria-hidden />
      )}
      {playing ? "Pause" : label}
    </button>
  );
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
      <div className="inline-block rounded-2xl border bg-card p-2.5 sm:p-4">
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
                      "min-w-[4.25rem] p-1.5 text-center text-sm font-semibold text-sky-700 sm:min-w-[5rem]",
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
                            "flex items-center justify-center gap-1 rounded-lg border-2 px-2 py-2 text-[15px] tabular-nums transition-all sm:px-2.5",
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
      <span className="w-11 shrink-0 text-[13px] font-bold tabular-nums">{pct}&nbsp;%</span>
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
        <M tex="u_V(H, H) = 0" />
      </span>{" "}
      et{" "}
      <span className="font-bold text-sky-700">
        <M tex="u_A(H, H) = 0" />
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
          <M tex="u_V(H, R) = -2" />
        </strong>
      </span>
      .{" "}
      <span className="text-sky-700">
        Elle : elle te fait attendre (−1) <em>et</em> elle arrive en retard, ce qu'elle déteste
        (elle est de type « ponctuelle » : −3) →{" "}
        <strong>
          <M tex="u_A(H, R) = -4" />
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
          <M tex="u_V(R, H) = -1" />
        </strong>
      </span>
      .{" "}
      <span className="text-sky-700">
        Elle : elle attend →{" "}
        <strong>
          <M tex="u_A(R, H) = -2" />
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
          <M tex="u_V(R, R) = 0" />
        </strong>
      </span>
      .{" "}
      <span className="text-sky-700">
        Elle : personne n'attend, mais elle est en retard →{" "}
        <strong>
          <M tex="u_A(R, R) = -3" />
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
          retrouves les −2 / −1 / −3 de l'histoire dans chaque case. Notation du slide 7 :{" "}
          <M tex="u_V(H, R) = -2" /> se lit « payoff de Vous quand Vous jouez Heure et que l'Amie
          joue Retard ».
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
            En laboratoire, <strong className="text-foreground">96&nbsp;% des étudiants du cours</strong>{" "}
            ont joué leur stratégie dominante (Confesser, c'est-à-dire trahir l'autre) : certains
            joueurs n'utilisent donc pas leur stratégie dominante. Une explication avancée par
            J.&nbsp;Roemer : dans un dilemme du prisonnier, certains joueurs se comportent de
            manière «&nbsp;<strong>kantienne</strong>&nbsp;». Ils analysent le mérite d'une stratégie
            sur base du payoff qu'elle rapporte <em>si tout le monde adoptait cette stratégie</em>.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Ce raisonnement est rationnel du point de vue du groupe, mais n'est pas rationnel au
            niveau individuel : un joueur maximise toujours son payoff en trahissant. Ceci montre
            que la rationalité individuelle n'est pas le seul principe guidant les décisions
            humaines dans des interactions stratégiques : des considérations d'ordre moral peuvent
            aussi influencer les comportements (slide 39).
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
        <strong>Étape préliminaire (H1) — le jeu de départ.</strong> On cherche une stratégie
        dominée. Pour <span className="font-bold text-sky-700">P2</span>, compare{" "}
        <strong>d</strong> et <strong>m</strong> ligne par ligne (slide 20) :{" "}
        <M tex="u_2(H, m) = 0 \ge u_2(H, d) = 0" /> ; <M tex="u_2(M, m) = 2 > u_2(M, d) = 0" /> ;{" "}
        <M tex="u_2(B, m) = 4 > u_2(B, d) = 0" />. → <strong>d est dominée par m</strong> : un P2
        rationnel (H1) ne la jouera jamais. Clique sur « Étape suivante ».
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
        La prédiction reste imprécise : c'est la limite théorique des PSS (slide 25). Remarque :
        ce jeu réduit 2×2 est exactement la <strong>bataille des sexes</strong> (slide 27) :
        4 PSS, mais seulement 2 équilibres de Nash, (H, g) et (B, m). Tu le vérifieras avec la
        méthode des meilleures réponses (l'équilibre de Nash, § 5).
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
      subtitle="Le jeu 3×3 du cours (slides 20 et 24-25) — avance dans le raisonnement et note quelle hypothèse justifie chaque itération."
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
/* 4. Le chasseur d'équilibres — 5 jeux types (slides 27-35, 54)       */
/* ------------------------------------------------------------------ */

type GameKey = "bds" | "cerf" | "poule" | "dp" | "mp";

interface GameDef {
  p1: string;
  p2: string;
  /** « l'homme », « le chasseur 1 »… (phrases de la copie modèle) */
  n1: string;
  n2: string;
  /** indice des fonctions de payoff : u_H, u_F, u_1… */
  u1: string;
  u2: string;
  rows: string[];
  cols: string[];
  /** initiales des stratégies, comme sur les slides : (V, R)… */
  rs: string[];
  cs: string[];
  pay: Pay[][];
  concl: ReactNode;
}

const GAMES: Record<GameKey, GameDef> = {
  bds: {
    p1: "Homme",
    p2: "Femme",
    n1: "l'homme",
    n2: "la femme",
    u1: "H",
    u2: "F",
    rows: ["Viande", "Poisson"],
    cols: ["Rouge", "Blanc"],
    rs: ["V", "P"],
    cs: ["R", "B"],
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
        <strong>4 PSS mais seulement 2 EN</strong>. La prédiction n'est pas parfaitement précise
        (deux EN), mais elle est plus précise que celle des PSS (slide 29).
      </p>
    ),
  },
  cerf: {
    p1: "Chasseur 1",
    p2: "Chasseur 2",
    n1: "le chasseur 1",
    n2: "le chasseur 2",
    u1: "1",
    u2: "2",
    rows: ["Cerf", "Lièvre"],
    cols: ["Cerf", "Lièvre"],
    rs: ["C", "L"],
    cs: ["C", "L"],
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
        logique d'une panique bancaire (slide 32).
      </p>
    ),
  },
  poule: {
    p1: "Conducteur 1",
    p2: "Conducteur 2",
    n1: "le conducteur 1",
    n2: "le conducteur 2",
    u1: "1",
    u2: "2",
    rows: ["Faucon", "Colombe"],
    cols: ["Faucon", "Colombe"],
    rs: ["F", "C"],
    cs: ["F", "C"],
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
        seul joue l'action dangereuse, et c'est son équilibre préféré. Si les joueurs échouent à se
        coordonner : (F, F) = collision, un résultat que (C, C) Pareto-domine. Application : deux
        firmes qui hésitent à investir un marché trop petit pour deux (slide 35).
      </p>
    ),
  },
  dp: {
    p1: "Prisonnier 1",
    p2: "Prisonnier 2",
    n1: "le prisonnier 1",
    n2: "le prisonnier 2",
    u1: "1",
    u2: "2",
    rows: ["Nier", "Confesser"],
    cols: ["Nier", "Confesser"],
    rs: ["N", "C"],
    cs: ["N", "C"],
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
        coïncide ici avec l'ESD — et il est Pareto-dominé par (N, N) (slide 15).
      </p>
    ),
  },
  mp: {
    p1: "Joueur 1",
    p2: "Joueur 2",
    n1: "le joueur 1",
    n2: "le joueur 2",
    u1: "1",
    u2: "2",
    rows: ["Pile", "Face"],
    cols: ["Pile", "Face"],
    rs: ["P", "F"],
    cs: ["P", "F"],
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
        ses deux payoffs entourés. Normal : J2 veut montrer le même côté que J1, J1 veut montrer
        l'autre côté — le « perdant » de chaque case veut toujours dévier (slide 54). La solution
        existe pourtant… en stratégies <em>mixtes</em> (§ 8) : à
        l'équilibre, chacun joue Pile avec probabilité 1/2 (slide 70).
      </p>
    ),
  },
};

/** une ligne de la copie modèle : « la meilleure réponse à X est Y » + inégalité (slide 28) */
interface BrLine {
  key: string;
  vs: string;
  best: string;
  tex: string;
}

/** inégalités de meilleure réponse au format du slide 28, calculées à partir de la matrice */
function brLines(g: GameDef): { l1: BrLine[]; l2: BrLine[] } {
  const sign = (a: number, b: number) => (a > b ? ">" : a < b ? "<" : "=");
  const l1 = g.cols.map((cName, c) => {
    const a = g.pay[0][c][0];
    const b = g.pay[1][c][0];
    const best = a > b ? g.rows[0] : a < b ? g.rows[1] : `${g.rows[0]} ou ${g.rows[1]}`;
    return {
      key: `r${c}`,
      vs: cName,
      best,
      tex: `\\begin{array}{c} u_{${g.u1}}(${g.rs[0]}, ${g.cs[c]}) ${sign(a, b)} u_{${g.u1}}(${g.rs[1]}, ${g.cs[c]}) \\\\ ${a} ${sign(a, b)} ${b} \\end{array}`,
    };
  });
  const l2 = g.rows.map((rName, r) => {
    const a = g.pay[r][0][1];
    const b = g.pay[r][1][1];
    const best = a > b ? g.cols[0] : a < b ? g.cols[1] : `${g.cols[0]} ou ${g.cols[1]}`;
    return {
      key: `c${r}`,
      vs: rName,
      best,
      tex: `\\begin{array}{c} u_{${g.u2}}(${g.rs[r]}, ${g.cs[0]}) ${sign(a, b)} u_{${g.u2}}(${g.rs[r]}, ${g.cs[1]}) \\\\ ${a} ${sign(a, b)} ${b} \\end{array}`,
    };
  });
  return { l1, l2 };
}

/** phrase de conclusion des slides 29, 31, 34 et 54, calculée à partir des EN trouvés */
function mutualSentence(g: GameDef, nash: Set<string>): ReactNode {
  const cells = [...nash]
    .map((k) => k.split(",").map(Number) as [number, number])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (cells.length === 0) {
    return (
      <>
        Il n'y a pas de profil de stratégies constitué de meilleures réponses mutuelles ⇒{" "}
        <strong>pas d'EN en stratégies pures</strong>.
      </>
    );
  }
  const pair = ([r, c]: [number, number]) => `${g.rows[r]} et ${g.cols[c]}`;
  const prof = ([r, c]: [number, number]) => `(${g.rs[r]}, ${g.cs[c]})`;
  return (
    <>
      {pair(cells[0])} sont des meilleures réponses mutuelles
      {cells.length > 1 ? `, et c'est le cas aussi de ${cells.slice(1).map(pair).join(", ")}` : ""}{" "}
      ⇒{" "}
      <strong>
        {cells.length} EN : {cells.map(prof).join(" et ")}
      </strong>
      .
    </>
  );
}

export function NashHunter() {
  const [gameKey, setGameKey] = useState<GameKey>("bds");
  const [showBr1, setShowBr1] = useState(false);
  const [showBr2, setShowBr2] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const g = GAMES[gameKey];
  const { br1, br2, nash } = useMemo(() => bestResponses(g.pay), [g]);
  const lines = useMemo(() => brLines(g), [g]);

  function selectGame(k: GameKey) {
    setGameKey(k);
    setShowBr1(false);
    setShowBr2(false);
    setRevealed(false);
  }

  const lineList = (ls: BrLine[]) => (
    <ul className="mt-1 space-y-1.5">
      {ls.map((l) => (
        <li key={l.key} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 animate-in fade-in">
          <span>
            la meilleure réponse à <strong>{l.vs}</strong> est <strong>{l.best}</strong> :
          </span>
          <M tex={l.tex} />
        </li>
      ))}
    </ul>
  );

  return (
    <InteractiveCard
      title="Le chasseur d'équilibres — la méthode des meilleures réponses sur 5 jeux types"
      subtitle="Choisis un jeu, essaie de deviner les équilibres de tête, puis déroule la méthode dans l'ordre : entourer, justifier par une inégalité (slide 28), conclure."
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
          et 0 pour matching pennies. À l'examen, justifie chaque meilleure réponse par son
          inégalité, comme dans la copie modèle.
        </>
      }
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="shrink-0">
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
        </div>
        <div className="min-w-0 flex-1 rounded-xl border bg-background px-3.5 py-3 text-[14px] leading-relaxed">
          <div className="text-[12.5px] font-bold uppercase tracking-wider text-muted-foreground">
            Copie modèle (format des slides 28-29)
          </div>
          {!showBr1 && !showBr2 ? (
            <p className="mt-1 italic text-muted-foreground">
              Elle se remplit au fil des étapes 1, 2 et 3.
            </p>
          ) : null}
          {showBr1 ? (
            <div className="mt-1.5">
              <div className="font-semibold text-rose-700">Pour {g.n1} :</div>
              {lineList(lines.l1)}
            </div>
          ) : null}
          {showBr2 ? (
            <div className="mt-2">
              <div className="font-semibold text-sky-700">Pour {g.n2} :</div>
              {lineList(lines.l2)}
            </div>
          ) : null}
          {revealed ? (
            <p className="mt-2 border-t pt-2 animate-in fade-in">
              <span className="font-semibold">Conclusion : </span>
              {mutualSentence(g, nash)}
            </p>
          ) : null}
        </div>
      </div>
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
            c'est ce que ferait {g.p1} s'il anticipait cette colonne. L'inégalité de la copie
            modèle compare les deux payoffs rouges de la colonne. Passe à l'étape 2.
          </p>
        ) : showBr2 ? (
          <p>
            Pour chaque <strong>ligne</strong>, le{" "}
            <span className="font-bold text-sky-700">payoff bleu maximal</span> est entouré : la
            meilleure réponse de {g.p2} à chaque stratégie de {g.p1}. Ajoute maintenant les
            meilleures réponses de {g.p1}.
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
/* 5. Devine 2/3 de la moyenne (slides 47-53)                          */
/* ------------------------------------------------------------------ */

/** dernière étape affichée : départ, H1, H2.1 … H2.6 */
const G23_MAX = 7;
/** plus grand nombre encore possible après l'étape k : (2/3)^k·100 */
const g23Bound = (k: number) => 100 * Math.pow(2 / 3, k);
/** joueur « pratique » du slide 50 : part de x̄ = 50, puis ×2/3 à chaque cran */
const g23Prac = (k: number) => 50 * Math.pow(2 / 3, k);
/** hypothèse utilisée à l'étape k (numérotation des slides 48-50) */
const g23Hyp = (k: number) => (k === 0 ? "départ" : k === 1 ? "H1" : `H2.${k - 1}`);
/** valeurs tronquées à une décimale, comme sur les slides (66,6 ; 44,4 ; 29,6…) */
const g23f = (v: number) => fmt(trunc1(v), 1);

/** cibles ⅔·x̄ observées en labo, groupe par groupe (slide 51 ; pas de round 4 pour G1 et G2) */
const G23_GROUPS: Array<{ name: string; color: string; vals: number[] }> = [
  { name: "Groupe 1", color: "#7c3aed", vals: [25.4, 12.7, 6.4] },
  { name: "Groupe 2", color: "#0d9488", vals: [27.7, 14.6, 6.1] },
  { name: "Groupe 3", color: "#d97706", vals: [18.2, 11.5, 4.9, 1.3] },
  { name: "Groupe 4", color: "#db2777", vals: [22.9, 9.6, 3, 0.6] },
];

/** texte « théorie » de l'étape k (slides 48-50) */
function g23StepText(k: number): ReactNode {
  if (k === 0) {
    return (
      <>
        <strong>Départ.</strong> Chacun peut choisir n'importe quel nombre entre 0 et 100 : rien
        n'est encore éliminé. Clique sur « Animer » (ou bouge le curseur) pour descendre
        l'escalier, une hypothèse à la fois.
      </>
    );
  }
  if (k === 1) {
    return (
      <>
        <strong>Étape préliminaire — H1 (slide 48).</strong> La moyenne <M tex="\bar{x}" /> vaut au
        plus 100 (si tout le monde joue 100). La cible <M tex="\tfrac{2}{3}\bar{x}" /> vaut donc au
        plus <M tex="\tfrac{2}{3} \cdot 100 = 66{,}6" /> (66,66…, que le slide écrit 66,6). Un
        nombre <M tex="x_i > 66{,}6" /> est toujours plus loin de la cible que 66,6 : chaque fois
        que <M tex="x_i" /> gagne, 66,6 gagne aussi, mais pas l'inverse. ⇒ Tout{" "}
        <M tex="x_i > 66{,}6" /> est <strong>dominé</strong> par 66,6 (dominance faible : jamais
        moins bien, parfois mieux). Un joueur rationnel (H1) ne le joue pas.
      </>
    );
  }
  if (k === 2) {
    return (
      <>
        <strong>Itération 1 — H2.1 (slide 49).</strong> Chaque joueur croit que ses adversaires
        sont rationnels : personne ne joue au-dessus de 66,6. Donc <M tex="\bar{x} \le 66{,}6" /> et
        la cible vaut au plus <M tex="\tfrac{2}{3} \cdot 66{,}6 = 44{,}4" />. Dans le jeu réduit,
        tout <M tex="x_i > 44{,}4" /> est dominé (par 44,4).
      </>
    );
  }
  if (k === 3) {
    return (
      <>
        <strong>Itération 2 — H2.2 (slide 49).</strong> Chaque joueur croit que ses adversaires
        croient que leurs adversaires sont rationnels : <M tex="\bar{x} \le 44{,}4" />, donc la
        cible vaut au plus <M tex="\tfrac{2}{3} \cdot 44{,}4 = 29{,}6" />. Tout{" "}
        <M tex="x_i > 29{,}6" /> tombe à son tour.
      </>
    );
  }
  const n = k - 1;
  return (
    <>
      <strong>
        Itération {n} — H2.{n} (slide 50).
      </strong>{" "}
      Même raisonnement :{" "}
      <M tex={String.raw`\bar{x} \le (\tfrac{2}{3})^{${n}} \cdot 100 = ${tx(trunc1(g23Bound(n)), 1)}`} />
      , donc la cible vaut au plus{" "}
      <M tex={String.raw`(\tfrac{2}{3})^{${n + 1}} \cdot 100 = ${tx(trunc1(g23Bound(k)), 1)}`} />.
      En général, à l'itération <M tex="n" /> (H2.n) : <M tex="\bar{x} \le (\tfrac{2}{3})^{n} \cdot 100" />{" "}
      et la cible <M tex="\le (\tfrac{2}{3})^{n+1} \cdot 100" />. Quand <M tex="n \to \infty" />, la
      borne tend vers 0 : <strong>le seul PSS est « tout le monde joue 0 »</strong>.
    </>
  );
}

/** texte « joueur pratique » de l'étape k (slide 50) */
function g23PracText(k: number): ReactNode {
  if (k === 0) {
    return (
      <>
        Le joueur « pratique » du slide 50 part d'ailleurs : ses adversaires, peu sophistiqués,
        choisiraient au hasard, donc <M tex="\bar{x} = 50" />.
      </>
    );
  }
  if (k === 1) {
    return (
      <>
        Joueur pratique : face à <M tex="\bar{x} = 50" />, sa meilleure réponse est{" "}
        <M tex="\tfrac{2}{3} \cdot 50 = 33{,}3" />.
      </>
    );
  }
  if (k === 2) {
    return (
      <>
        Joueur pratique : s'il croit que tous les autres raisonnent comme ça, il s'attend à{" "}
        <M tex="\bar{x} = 33{,}3" /> et joue <M tex="\tfrac{2}{3} \cdot 33{,}3 = 22{,}2" />.
      </>
    );
  }
  if (k === 3) {
    return (
      <>
        Joueur pratique : « et ainsi de suite » (slide 50) →{" "}
        <M tex="\tfrac{2}{3} \cdot 22{,}2 = 14{,}8" />.
      </>
    );
  }
  return <>Joueur pratique : {g23f(g23Prac(k))} — lui aussi est multiplié par ⅔ à chaque cran.</>;
}

/** retour du mini-jeu « À toi » (zones : slides 48-53) */
function g23Feedback(v: number): ReactNode {
  const s = fmt(v, 1);
  if (v > 200 / 3) {
    return (
      <>
        Aïe : {s} est une <strong>stratégie dominée</strong> (slide 48) : la cible ne peut jamais
        dépasser 66,6. Jouer 66,6 ferait au moins aussi bien dans tous les cas, et strictement mieux
        dans certains : ton nombre est dominé. Un joueur rationnel (H1) ne le joue pas.
      </>
    );
  }
  if (v > 400 / 9) {
    return (
      <>
        {s} n'est pas dominé au départ, mais il est éliminé dès l'itération 1 : si tu crois que les
        autres sont rationnels (H2.1), la cible ne dépasse pas 44,4. Et en labo, les cibles du
        round 1 étaient bien plus basses (de 18,2 à 27,7 selon les groupes, slide 51).
      </>
    );
  }
  if (v > 27.7) {
    return (
      <>
        {s} : c'est la zone du raisonnement « pratique » du slide 50 au premier cran (les autres
        choisissent au hasard → <M tex="\bar{x} = 50" /> → meilleure réponse 33,3). Raisonnable !
        Au round 1 en labo, les cibles gagnantes étaient un peu plus basses (de 18,2 à 27,7 selon
        les groupes, slide 51) : le cran suivant du slide 50 (22,2) tombait en plein dedans.
      </>
    );
  }
  if (v >= 18.2) {
    return (
      <>
        Bien joué : {s} est dans la zone des cibles gagnantes observées au round 1 en labo (de 18,2
        à 27,7 selon les groupes, slide 51). Le 2ᵉ cran du raisonnement pratique du slide 50
        (22,2) tombe aussi dans cette zone.
      </>
    );
  }
  if (v >= 5) {
    return (
      <>
        {s} : plus bas que toutes les cibles gagnantes du round 1 en labo (de 18,2 à 27,7, slide
        51). Au round 1, un nombre de cette zone était donc trop bas pour gagner. Aux rounds
        suivants, en revanche, les cibles descendent (de 9,6 à 14,6 au round 2, de 3 à 6,4 au
        round 3) : un nombre de cette zone peut alors gagner.
      </>
    );
  }
  return (
    <>
      {s} est (presque) la prédiction du PSS (0)… mais face à des humains, un joueur qui choisit 0
      a peu de chances de gagner, en tous cas sur les premiers rounds (slide 53) : au round 1, les
      cibles observées allaient de 18,2 à 27,7. Être rationnel (H1), c'est choisir sa meilleure
      réponse à ce que les autres font <em>réellement</em> : quand H2 n'est pas satisfaite, 0 n'est
      pas une meilleure réponse au round 1.
    </>
  );
}

/** l'escalier : intervalle des nombres encore possibles, étape après étape */
function G23Staircase({ step }: { step: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const P = makePlot({
    w: 520,
    h: 300,
    pL: 50,
    pR: 10,
    pT: 24,
    pB: 50,
    x: [-0.5, G23_MAX + 0.5],
    y: [0, 100],
  });
  const colW = (P.X(1) - P.X(0)) * 0.6;
  const ks = Array.from({ length: G23_MAX + 1 }, (_, k) => k);
  const pracPts = ks
    .filter((k) => k <= step)
    .map((k) => `${P.X(k).toFixed(1)},${P.Y(g23Prac(k)).toFixed(1)}`)
    .join(" ");
  const toRight = step < G23_MAX - 1;
  return (
    <PlotSvg
      p={P}
      label="Escalier du raisonnement : à chaque étape, le plus grand nombre encore possible est multiplié par deux tiers"
    >
      <defs>
        <pattern
          id={`g23hatch${uid}`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill={C.red} fillOpacity={0.07} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={C.red} strokeOpacity={0.4} strokeWidth="2" />
        </pattern>
      </defs>
      <Frame p={P} yticks={[0, 20, 40, 60, 80, 100]} />
      <text
        x={13}
        y={(P.pT + P.h - P.pB) / 2}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={600}
        fill={C.soft}
        transform={`rotate(-90 13 ${(P.pT + P.h - P.pB) / 2})`}
      >
        nombre choisi
      </text>
      {ks.map((k) => {
        const b = g23Bound(k);
        const x = P.X(k) - colW / 2;
        const cur = k === step;
        return (
          <g key={k} opacity={k <= step ? 1 : 0} style={{ transition: "opacity 0.6s ease" }}>
            {k > 0 ? (
              <rect
                x={x}
                y={P.Y(100)}
                width={colW}
                height={P.Y(b) - P.Y(100)}
                fill={`url(#g23hatch${uid})`}
                stroke={C.red}
                strokeOpacity={0.3}
              />
            ) : null}
            <rect
              x={x}
              y={P.Y(b)}
              width={colW}
              height={P.Y(0) - P.Y(b)}
              fill={C.green}
              fillOpacity={cur ? 0.3 : 0.16}
              stroke={C.green}
              strokeWidth={cur ? 2.2 : 1}
            />
            <Label
              p={P}
              x={k}
              y={b}
              anchor="middle"
              dx={0}
              dy={-5}
              color={cur ? C.green : C.soft}
              weight={cur ? 700 : 600}
              size={cur ? 14 : 12.5}
            >
              {g23f(b)}
            </Label>
          </g>
        );
      })}
      <polyline
        points={pracPts}
        fill="none"
        stroke={C.sky}
        strokeWidth={2.2}
        strokeDasharray="5 4"
      />
      {ks
        .filter((k) => k <= step)
        .map((k) => (
          <circle
            key={`pr${k}`}
            cx={P.X(k)}
            cy={P.Y(g23Prac(k))}
            r={k === step ? 5.5 : 4}
            fill={C.sky}
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}
      <Label
        p={P}
        x={step}
        y={g23Prac(step)}
        anchor={toRight ? "start" : "end"}
        dx={toRight ? colW / 2 + 4 : -colW / 2 - 4}
        dy={4}
        color={C.sky}
        weight={700}
      >
        {step === 0 ? "50 (hasard)" : g23f(g23Prac(step))}
      </Label>
      {ks.map((k) => (
        <text
          key={`t${k}`}
          x={P.X(k)}
          y={P.h - P.pB + 18}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={k === step ? 700 : 500}
          fill={k <= step ? C.ink : C.guide}
        >
          {g23Hyp(k)}
        </text>
      ))}
      <text
        x={(P.pL + P.w - P.pR) / 2}
        y={P.h - 8}
        textAnchor="middle"
        fontSize={12.5}
        fill={C.soft}
      >
        étape du raisonnement (hypothèse utilisée)
      </text>
    </PlotSvg>
  );
}

/** répétition du jeu en labo : une ligne par groupe, jamais mélangés (slide 51) */
function G23Lab() {
  const [sel, setSel] = useState<string>("all");
  const [shown, setShown] = useState(4);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (shown >= 4) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setShown((s) => Math.min(4, s + 1)), 900);
    return () => window.clearTimeout(id);
  }, [playing, shown]);

  const P = makePlot({ w: 520, h: 250, pL: 46, pR: 16, pT: 22, pB: 42, x: [0.6, 4.4], y: [0, 30] });
  const selIdx = sel === "all" ? -1 : Number(sel);
  const g = selIdx >= 0 ? G23_GROUPS[selIdx] : null;

  return (
    <div className="mt-4 rounded-xl border bg-card p-3.5">
      <div className="text-[13.5px] font-bold">
        🔁 Et si on rejoue ? Les cibles <M tex="\tfrac{2}{3}\bar{x}" /> des 4 groupes du labo
        (slide 51)
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ChoiceChips
          value={sel}
          onChange={setSel}
          options={[
            { value: "all", label: "Les 4 groupes" },
            ...G23_GROUPS.map((gr, i) => ({
              value: String(i),
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: gr.color }}
                    aria-hidden
                  />
                  {gr.name}
                </span>
              ),
            })),
          ]}
        />
        <PlayButton
          playing={playing}
          label="Rejouer les rounds"
          onClick={() => {
            if (playing) {
              setPlaying(false);
            } else {
              setShown(1);
              setPlaying(true);
            }
          }}
        />
      </div>
      <PlotSvg p={P} label="Cible deux tiers de la moyenne, round par round, pour chacun des quatre groupes du labo">
        <Frame
          p={P}
          xticks={[1, 2, 3, 4]}
          xfmt={(t) => `round ${t}`}
          yticks={[0, 10, 20, 30]}
          ylabel="cible (⅔ de la moyenne)"
        />
        {G23_GROUPS.map((gr, gi) => {
          const pts = gr.vals.slice(0, shown);
          const on = selIdx < 0 || selIdx === gi;
          return (
            <g key={gr.name} opacity={on ? 1 : 0.15} style={{ transition: "opacity 0.3s" }}>
              <polyline
                points={pts.map((v, i) => `${P.X(i + 1).toFixed(1)},${P.Y(v).toFixed(1)}`).join(" ")}
                fill="none"
                stroke={gr.color}
                strokeWidth={2.4}
              />
              {pts.map((v, i) => (
                <circle
                  key={i}
                  cx={P.X(i + 1)}
                  cy={P.Y(v)}
                  r={4.5}
                  fill={gr.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}
        {g
          ? g.vals.slice(0, shown).map((v, i) => (
              <Label
                key={i}
                p={P}
                x={i + 1}
                y={v}
                anchor={i === 0 ? "start" : "middle"}
                dx={i === 0 ? 8 : 0}
                dy={-9}
                color={g.color}
                weight={700}
                size={13}
              >
                {fmt(v, 1)}
              </Label>
            ))
          : null}
      </PlotSvg>
      <div className="mt-1 text-[14px] leading-relaxed">
        {g ? (
          <p>
            <strong style={{ color: g.color }}>{g.name}</strong> :{" "}
            {g.vals.map((v) => fmt(v, 1)).join(" → ")}
            {g.vals.length < 4 ? " (pas de donnée au round 4)" : ""}. La cible baisse à chaque
            round et se rapproche de 0, la prédiction du PSS.
          </p>
        ) : (
          <p>
            Une ligne = un groupe (on ne mélange pas les groupes). Au round 1, la cible gagnante
            vaut entre 18,2 et 27,7 selon le groupe ; au round 3, entre 3 et 6,4. Dans les 4
            groupes, elle baisse à chaque round et se rapproche de 0, la prédiction du PSS. Clique
            sur un groupe pour lire ses valeurs.
          </p>
        )}
        <p className="mt-1.5 text-muted-foreground">
          Pourquoi ça baisse ? (slide 51) Si la cible du round précédent valait <M tex="T" />, des
          adversaires peu sophistiqués pourraient tous rejouer <M tex="T" /> : ta meilleure réponse
          est alors <M tex="\tfrac{2}{3}T" />. Si tu crois que tous raisonnent ainsi :{" "}
          <M tex="\tfrac{2}{3}\cdot\tfrac{2}{3}T" />. Et ainsi de suite.
        </p>
      </div>
    </div>
  );
}

export function GuessTwoThirds() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mine, setMine] = useState(50);
  const [played, setPlayed] = useState<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= G23_MAX) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => Math.min(G23_MAX, s + 1)), 1300);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (step >= G23_MAX) setStep(0);
    setPlaying(true);
  }

  return (
    <InteractiveCard
      title="Descendre l'escalier du raisonnement — « devine 2/3 de la moyenne »"
      subtitle={
        <>
          Étape préliminaire (H1), puis itérations H2.1, H2.2… : à chaque étape, le plus grand
          nombre encore possible est multiplié par ⅔ (slides 48-50).
        </>
      }
      controls={
        <>
          <div className="flex min-w-0 items-end gap-2">
            <SliderControl
              className="flex-1"
              label="Étape du raisonnement"
              value={step}
              onChange={(v) => {
                setPlaying(false);
                setStep(v);
              }}
              min={0}
              max={G23_MAX}
              step={1}
              format={g23Hyp}
            />
            <PlayButton playing={playing} onClick={togglePlay} />
          </div>
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              Plus grand nombre encore possible :{" "}
              <span className="tabular-nums text-emerald-700">{g23f(g23Bound(step))}</span>
            </span>
            <span className="text-muted-foreground">
              {step === 0 ? "rien n'est encore éliminé" : "tout ce qui dépasse est dominé"}
            </span>
          </div>
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              Joueur « pratique » :{" "}
              <span className="tabular-nums text-sky-700">
                {step === 0 ? <M tex="\bar{x} = 50" /> : g23f(g23Prac(step))}
              </span>
            </span>
            <span className="text-muted-foreground">
              part de <M tex="\bar{x} = 50" /> (hasard) et itère ⅔ (slide 50)
            </span>
          </div>
        </>
      }
      footer={
        <>
          la <span className="font-semibold text-emerald-700">borne théorique</span> et le{" "}
          <span className="font-semibold text-sky-700">joueur pratique</span> descendent tous les
          deux vers 0 (×⅔ à chaque cran) — mais au round 1, les cibles observées en labo (18,2 à
          27,7, slide 51) restent loin de 0. La « bonne » réponse dépend donc de ce que les autres
          font réellement.
        </>
      }
    >
      <G23Staircase step={step} />
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded-sm border border-emerald-600 bg-emerald-500/25" />
          nombres encore possibles
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-4 rounded-sm border border-rose-300"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(225,29,72,0.45) 0 2px, rgba(225,29,72,0.07) 2px 6px)",
            }}
          />
          nombres dominés (éliminés)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-5 border-t-[3px] border-dashed border-sky-600" />
          joueur « pratique » (slide 50)
        </span>
      </div>
      <ExplainPanel>
        <p>{g23StepText(step)}</p>
        <p className="mt-2 text-sky-800">{g23PracText(step)}</p>
      </ExplainPanel>
      <p className="mt-1.5 text-[12.5px] text-muted-foreground">
        Valeurs tronquées à une décimale, comme sur les slides (⅔·100 = 66,66… s'écrit 66,6).
      </p>

      <div className="mt-4 rounded-xl border bg-muted/40 p-3.5">
        <div className="mb-2 text-[13.5px] font-bold">
          🎮 À toi : quel nombre jouerais-tu au 1ᵉʳ round ?
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <SliderControl
            className="min-w-[200px] flex-1"
            label="Ton nombre"
            value={mine}
            onChange={(v) => {
              setMine(v);
              setPlayed(null);
            }}
            min={0}
            max={100}
            step={0.1}
            format={(v) => fmt(v, 1)}
          />
          <button
            type="button"
            onClick={() => setPlayed(mine)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Jouer
          </button>
        </div>
        {played !== null ? (
          <div className="mt-3 rounded-lg border border-dashed bg-background px-3.5 py-2.5 text-sm leading-relaxed animate-in fade-in">
            {g23Feedback(played)}
          </div>
        ) : null}
      </div>

      <G23Lab />
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Le pénalty : payoffs attendus, meilleures réponses, EN mixte      */
/*    (slides 59-65)                                                    */
/* ------------------------------------------------------------------ */

type PenView = "carre" | "br" | "en";

/** payoffs attendus du slide 61 */
const penUA = (p: number, q: number) => 20 + 60 * p + 70 * q - 100 * p * q;
const penUG = (p: number, q: number) => 80 - 60 * p - 70 * q + 100 * p * q;
/** égalité à la précision des curseurs (pas de 0,01) */
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
/** format français à deux décimales au plus */
const f2 = (v: number) => fmt(v, 2);

/** ① le « carré des probabilités » : chaque case a pour aire sa probabilité */
function PenSquare({ p, q }: { p: number; q: number }) {
  const W = 520;
  const H = 300;
  const x0 = 128;
  const y0 = 50;
  const SW = 376;
  const SH = 236;
  const cells = [
    { i: 0, j: 0, prob: p * q, lab: "p·q", pay: [50, 50] },
    { i: 0, j: 1, prob: p * (1 - q), lab: "p(1−q)", pay: [80, 20] },
    { i: 1, j: 0, prob: (1 - p) * q, lab: "(1−p)q", pay: [90, 10] },
    { i: 1, j: 1, prob: (1 - p) * (1 - q), lab: "(1−p)(1−q)", pay: [20, 80] },
  ];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: 640 }}
      role="img"
      aria-label="Carré des probabilités : chaque case du jeu de pénalty a pour aire la probabilité que ce profil soit joué"
    >
      <text x={x0 + SW / 2} y={16} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.sky}>
        Gardien
      </text>
      <text x={x0} y={36} textAnchor="start" fontSize={12.5} fontWeight={600} fill={C.sky}>
        Droit · q = {f2(q)}
      </text>
      <text x={x0 + SW} y={36} textAnchor="end" fontSize={12.5} fontWeight={600} fill={C.sky}>
        Gauche · 1 − q = {f2(1 - q)}
      </text>
      <line x1={x0} y1={42} x2={x0 + q * SW} y2={42} stroke={C.sky} strokeWidth={3} />
      <line x1={x0 + q * SW} y1={42} x2={x0 + SW} y2={42} stroke={C.sky} strokeWidth={3} strokeOpacity={0.4} />
      <text
        x={16}
        y={y0 + SH / 2}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill={C.red}
        transform={`rotate(-90 16 ${y0 + SH / 2})`}
      >
        Attaquant
      </text>
      <text x={x0 - 10} y={y0 + 14} textAnchor="end" fontSize={12.5} fontWeight={700} fill={C.red}>
        Droit
      </text>
      <text x={x0 - 10} y={y0 + 29} textAnchor="end" fontSize={12.5} fill={C.red}>
        p = {f2(p)}
      </text>
      <text x={x0 - 10} y={y0 + SH - 19} textAnchor="end" fontSize={12.5} fontWeight={700} fill={C.red}>
        Gauche
      </text>
      <text x={x0 - 10} y={y0 + SH - 4} textAnchor="end" fontSize={12.5} fill={C.red}>
        1 − p = {f2(1 - p)}
      </text>
      <line x1={x0 - 4} y1={y0} x2={x0 - 4} y2={y0 + p * SH} stroke={C.red} strokeWidth={3} />
      <line
        x1={x0 - 4}
        y1={y0 + p * SH}
        x2={x0 - 4}
        y2={y0 + SH}
        stroke={C.red}
        strokeWidth={3}
        strokeOpacity={0.4}
      />
      {cells.map((c) => {
        const x = x0 + (c.j ? q * SW : 0);
        const w = (c.j ? 1 - q : q) * SW;
        const y = y0 + (c.i ? p * SH : 0);
        const h = (c.i ? 1 - p : p) * SH;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const full = w > 92 && h > 58;
        const mini = !full && w > 40 && h > 20;
        return (
          <g key={`${c.i}${c.j}`}>
            <rect
              x={x}
              y={y}
              width={Math.max(0, w)}
              height={Math.max(0, h)}
              fill={C.gold}
              fillOpacity={0.08 + 0.4 * c.prob}
              stroke="#a16207"
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
            {full ? (
              <>
                <text x={cx} y={cy - 12} textAnchor="middle" fontSize={12.5} fill={C.soft}>
                  {c.lab}
                </text>
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink}>
                  = {fmt(c.prob, 4)}
                </text>
                <text x={cx} y={cy + 21} textAnchor="middle" fontSize={13} fontWeight={600}>
                  <tspan fill={C.red}>{c.pay[0]}</tspan>
                  <tspan fill={C.soft}> ; </tspan>
                  <tspan fill={C.sky}>{c.pay[1]}</tspan>
                </text>
              </>
            ) : mini ? (
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.ink}>
                {fmt(c.prob, 2)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/** ② payoff attendu de chaque stratégie pure, en fonction de la stratégie de l'adversaire */
function PenLines({ who, v }: { who: "A" | "G"; v: number }) {
  const P = makePlot({ w: 300, h: 236, pL: 36, pR: 12, pT: 26, pB: 40, x: [0, 1], y: [0, 100] });
  const isA = who === "A";
  const fD = isA ? (t: number) => 80 - 30 * t : (t: number) => 10 + 40 * t;
  const fGa = isA ? (t: number) => 20 + 70 * t : (t: number) => 80 - 60 * t;
  const star = isA ? 0.6 : 0.7;
  const yStar = isA ? 62 : 38;
  const col = isA ? C.red : C.sky;
  const d = fD(v);
  const g = fGa(v);
  const best = near(d, g) ? "both" : d > g ? "D" : "G";
  const sym = isA ? "q" : "p";
  return (
    <PlotSvg
      p={P}
      maxW={420}
      label={
        isA
          ? "Payoff attendu de l'attaquant s'il tire à droite ou à gauche, selon la probabilité q que le gardien plonge à droite"
          : "Payoff attendu du gardien s'il plonge à droite ou à gauche, selon la probabilité p que l'attaquant tire à droite"
      }
    >
      <Frame
        p={P}
        xticks={[0, star, 1]}
        yticks={[0, yStar, 100]}
        xlabel={isA ? "q (gardien → Droit)" : "p (attaquant → Droit)"}
        ylabel={isA ? "payoff attendu de l'attaquant" : "payoff attendu du gardien"}
      />
      <line
        x1={P.X(v)}
        y1={P.Y(0)}
        x2={P.X(v)}
        y2={P.Y(100)}
        stroke={C.ink}
        strokeOpacity={0.35}
        strokeWidth={1.2}
        strokeDasharray="4 4"
      />
      <path d={curvePath(P, fD, 0, 1, 2)} fill="none" stroke={col} strokeWidth={2.6} />
      <path d={curvePath(P, fGa, 0, 1, 2)} fill="none" stroke={col} strokeWidth={2.6} strokeDasharray="7 5" />
      {isA ? (
        <>
          <Label p={P} x={0.02} y={fD(0)} color={col} dy={-8}>
            Droit : 80 − 30q
          </Label>
          <Label p={P} x={0.02} y={fGa(0)} color={col} dy={16}>
            Gauche : 20 + 70q
          </Label>
        </>
      ) : (
        <>
          <Label p={P} x={0.02} y={fGa(0)} color={col} dy={-8}>
            Gauche : 80 − 60p
          </Label>
          <Label p={P} x={0.98} y={fD(1)} color={col} anchor="end" dx={0} dy={-10}>
            Droit : 10 + 40p
          </Label>
        </>
      )}
      <GuideH p={P} x={star} y={yStar} color={C.ink} />
      <GuideV p={P} x={star} y={yStar} color={C.ink} />
      <circle cx={P.X(star)} cy={P.Y(yStar)} r={4.5} fill={C.ink} stroke="#fff" strokeWidth={1.2}>
        <title>{`${sym} = ${fmt(star, 1)} : les deux droites valent ${yStar}`}</title>
      </circle>
      <Dot p={P} x={v} y={d} fill={col} r={best === "D" || best === "both" ? 6 : 3.5} />
      <Dot p={P} x={v} y={g} fill={col} r={best === "G" || best === "both" ? 6 : 3.5} />
    </PlotSvg>
  );
}

/** ③ fonctions de meilleure réponse et EN (slide 64), avec les envies de dévier */
function PenBRGraph({ p, q }: { p: number; q: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const P = makePlot({ w: 420, h: 330, pL: 46, pR: 12, pT: 26, pB: 44, x: [0, 1], y: [0, 1] });
  const pBR = near(q, 0.6) ? p : q < 0.6 ? 1 : 0;
  const qBR = near(p, 0.7) ? q : p < 0.7 ? 0 : 1;
  const aMoves = !near(pBR, p);
  const gMoves = !near(qBR, q);
  const toPx = (pp: number, qq: number) => `${P.X(pp).toFixed(1)},${P.Y(qq).toFixed(1)}`;
  return (
    <PlotSvg
      p={P}
      maxW={500}
      label="Fonctions de meilleure réponse de l'attaquant et du gardien ; elles se croisent en un seul point, l'équilibre de Nash mixte (0,7 ; 0,6)"
    >
      <defs>
        <marker id={`penA${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={C.red} />
        </marker>
        <marker id={`penG${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={C.sky} />
        </marker>
      </defs>
      <Frame
        p={P}
        xticks={[0, 0.7, 1]}
        yticks={[0, 0.6, 1]}
        grid={false}
        xlabel="p (attaquant → Droit)"
        ylabel="q (gardien → Droit)"
      />
      <polyline
        points={[toPx(0, 1), toPx(0, 0.6), toPx(1, 0.6), toPx(1, 0)].join(" ")}
        fill="none"
        stroke={C.red}
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <polyline
        points={[toPx(0, 0), toPx(0.7, 0), toPx(0.7, 1), toPx(1, 1)].join(" ")}
        fill="none"
        stroke={C.sky}
        strokeWidth={3.2}
        strokeDasharray="8 5"
        strokeLinejoin="round"
      />
      <Label p={P} x={0.03} y={0.6} color={C.red} dy={-9}>
        meilleure réponse de l'attaquant
      </Label>
      <Label p={P} x={0.7} y={0.92} color={C.sky} anchor="end" dx={-8} dy={4}>
        meilleure réponse du gardien
      </Label>
      {aMoves ? (
        <line
          x1={P.X(p)}
          y1={P.Y(q)}
          x2={P.X(pBR) + (pBR > p ? -8 : 8)}
          y2={P.Y(q)}
          stroke={C.red}
          strokeWidth={2.2}
          strokeOpacity={0.85}
          markerEnd={`url(#penA${uid})`}
        />
      ) : null}
      {gMoves ? (
        <line
          x1={P.X(p)}
          y1={P.Y(q)}
          x2={P.X(p)}
          y2={P.Y(qBR) + (qBR > q ? 8 : -8)}
          stroke={C.sky}
          strokeWidth={2.2}
          strokeOpacity={0.85}
          markerEnd={`url(#penG${uid})`}
        />
      ) : null}
      <circle cx={P.X(0.7)} cy={P.Y(0.6)} r={7} fill={C.gold} stroke="#111827" strokeWidth={1.5} />
      <Label p={P} x={0.7} y={0.6} dx={10} dy={-10} color={C.gold} weight={700} size={13}>
        EN (0,7 ; 0,6)
      </Label>
      <circle cx={P.X(p)} cy={P.Y(q)} r={6} fill="#111827" stroke="#fff" strokeWidth={1.5} />
    </PlotSvg>
  );
}

/** les 3 cas d'une fonction de meilleure réponse (slides 62-63), le cas actif en surbrillance */
function PenCases({ who, p, q }: { who: "A" | "G"; p: number; q: number }) {
  const isA = who === "A";
  const v = isA ? q : p;
  const s = isA ? 0.6 : 0.7;
  const active = near(v, s) ? 3 : v < s ? 1 : 2;
  const slope = isA ? 60 - 100 * q : 100 * p - 70;
  const rows = isA
    ? [
        { tex: "q < 0{,}6", txt: <><M tex="U_A" /> augmente avec <M tex="p" /></>, br: "p = 1 : Droit" },
        { tex: "q > 0{,}6", txt: <><M tex="U_A" /> diminue avec <M tex="p" /></>, br: "p = 0 : Gauche" },
        { tex: "q = 0{,}6", txt: <><M tex="U_A" /> ne dépend pas de <M tex="p" /></>, br: "tout p ∈ [0, 1]" },
      ]
    : [
        { tex: "p < 0{,}7", txt: <><M tex="U_G" /> diminue avec <M tex="q" /></>, br: "q = 0 : Gauche" },
        { tex: "p > 0{,}7", txt: <><M tex="U_G" /> augmente avec <M tex="q" /></>, br: "q = 1 : Droit" },
        { tex: "p = 0{,}7", txt: <><M tex="U_G" /> ne dépend pas de <M tex="q" /></>, br: "tout q ∈ [0, 1]" },
      ];
  return (
    <div className={cn("rounded-xl border p-3", isA ? "border-rose-200" : "border-sky-200")}>
      <div className={cn("text-[13.5px] font-bold", isA ? "text-rose-700" : "text-sky-700")}>
        {isA ? "Attaquant" : "Gardien"} :{" "}
        {isA ? (
          <M tex={String.raw`\dfrac{\partial U_A}{\partial p} = 60 - 100q = ${tx(slope, 0)}`} />
        ) : (
          <M tex={String.raw`\dfrac{\partial U_G}{\partial q} = 100p - 70 = ${tx(slope, 0)}`} />
        )}
      </div>
      <ul className="mt-2 space-y-1.5 text-[13.5px]">
        {rows.map((r, i) => (
          <li
            key={r.tex}
            className={cn(
              "rounded-lg px-2.5 py-1.5 transition-colors",
              active === i + 1
                ? isA
                  ? "bg-rose-100 font-semibold text-rose-900"
                  : "bg-sky-100 font-semibold text-sky-900"
                : "text-muted-foreground",
            )}
          >
            Cas {i + 1} : <M tex={r.tex} /> → {r.txt} → <strong>{r.br}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PenaltyExplorer() {
  const [p, setP] = useState(0.3);
  const [q, setQ] = useState(0.3);
  const [view, setView] = useState<PenView>("carre");

  const UA = penUA(p, q);
  const UG = penUG(p, q);
  const pq = p * q;
  const p1q = p * (1 - q);
  const q1p = (1 - p) * q;
  const p1q1 = (1 - p) * (1 - q);
  const atEq = near(p, 0.7) && near(q, 0.6);
  const aHappy = near(q, 0.6) || (q < 0.6 ? near(p, 1) : near(p, 0));
  const gHappy = near(p, 0.7) || (p < 0.7 ? near(q, 0) : near(q, 1));
  const brA = near(q, 0.6) ? "n'importe quel p (indifférent)" : q < 0.6 ? "p = 1 (tirer à Droite)" : "p = 0 (tirer à Gauche)";
  const brG = near(p, 0.7) ? "n'importe quel q (indifférent)" : p < 0.7 ? "q = 0 (plonger à Gauche)" : "q = 1 (plonger à Droite)";

  const nextBtn = (to: PenView, label: string) => (
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        onClick={() => setView(to)}
        className="rounded-full bg-primary px-4 py-1.5 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {label} →
      </button>
    </div>
  );

  return (
    <InteractiveCard
      title="Le pénalty pas à pas : payoffs attendus, meilleures réponses, équilibre"
      subtitle={
        <>
          Bouge <M tex="p" /> (attaquant) et <M tex="q" /> (gardien), puis suis les trois étapes du
          cours (slides 61 à 64).
        </>
      }
      controls={
        <>
          <SliderControl
            label={<span className="text-rose-700">p — proba que l'attaquant tire à Droite</span>}
            value={p}
            onChange={setP}
            min={0}
            max={1}
            step={0.01}
            format={(v) => fmt(v, 2)}
          />
          <SliderControl
            label={<span className="text-sky-700">q — proba que le gardien plonge à Droite</span>}
            value={q}
            onChange={setQ}
            min={0}
            max={1}
            step={0.01}
            format={(v) => fmt(v, 2)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-rose-700">
                Payoff attendu <M tex="U_A" /> = <span className="tabular-nums">{f2(UA)}</span>
              </span>
              <span className="font-semibold text-sky-700">
                Payoff attendu <M tex="U_G" /> = <span className="tabular-nums">{f2(UG)}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setP(0.7);
                setQ(0.6);
              }}
              className="rounded-full border px-3 py-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              Placer sur l'EN
            </button>
          </div>
        </>
      }
      footer={
        <>
          ① chaque case du carré pèse sa probabilité ; ② la droite la plus haute donne la
          meilleure réponse (les droites se croisent en <M tex="q = 0{,}6" /> et en{" "}
          <M tex="p = 0{,}7" />) ; ③ l'EN est l'<strong>unique intersection</strong> des deux
          fonctions de meilleure réponse, <M tex="(0{,}7\,;\,0{,}6)" /> : là, plus personne ne peut
          améliorer son payoff attendu en déviant seul.
        </>
      }
    >
      <ChoiceChips
        className="mb-3"
        value={view}
        onChange={setView}
        options={[
          { value: "carre", label: "① Payoffs attendus" },
          { value: "br", label: "② Meilleures réponses" },
          { value: "en", label: "③ L'équilibre" },
        ]}
      />

      {view === "carre" ? (
        <>
          <PenSquare p={p} q={q} />
          <div className="mt-2 text-[14px] leading-relaxed">
            <p>
              Le <strong>carré des probabilités</strong> (une image du calcul du slide 61) : la case (Droit, Droit) est
              jouée avec probabilité <M tex="p \cdot q" />, la case (Droit, Gauche) avec{" "}
              <M tex="p(1-q)" />… Plus une case est probable, plus elle est grande. Le payoff
              attendu additionne les 4 cases : probabilité × payoff.
            </p>
            <MB
              tex={String.raw`\begin{aligned} U_A &= pq\cdot 50 + p(1-q)\cdot 80 + (1-p)q\cdot 90 + (1-p)(1-q)\cdot 20 \\ &= ${tx(pq, 4)}\cdot 50 + ${tx(p1q, 4)}\cdot 80 + ${tx(q1p, 4)}\cdot 90 + ${tx(p1q1, 4)}\cdot 20 = ${tx(UA, 2)} \end{aligned}`}
            />
            <MB
              tex={String.raw`\begin{aligned} U_G &= pq\cdot 50 + p(1-q)\cdot 20 + (1-p)q\cdot 10 + (1-p)(1-q)\cdot 80 \\ &= ${tx(pq, 4)}\cdot 50 + ${tx(p1q, 4)}\cdot 20 + ${tx(q1p, 4)}\cdot 10 + ${tx(p1q1, 4)}\cdot 80 = ${tx(UG, 2)} \end{aligned}`}
            />
            <p className="text-muted-foreground">
              Même résultat avec la forme simplifiée du slide 61 :{" "}
              <M
                tex={String.raw`U_A = 20 + 60p + 70q - 100pq = 20 + 60\cdot ${tx(p)} + 70\cdot ${tx(q)} - 100\cdot ${tx(p)}\cdot ${tx(q)} = ${tx(UA, 2)}`}
              />
              . Et <M tex="U_A + U_G = 100" /> : dans chaque case, les deux payoffs somment à
              100.
            </p>
          </div>
          {nextBtn("br", "② Meilleures réponses")}
        </>
      ) : null}

      {view === "br" ? (
        <>
          <p className="mb-2 text-[14px] leading-relaxed">
            Chaque droite donne le payoff attendu d'une <strong>stratégie pure</strong>, selon ce
            que fait l'adversaire. La plus haute est la meilleure réponse (gros point). Les deux
            droites se croisent exactement au seuil des 3 cas : en <M tex="q = 0{,}6" />, Droit
            et Gauche rapportent 62 à l'attaquant ; en <M tex="p = 0{,}7" />, elles rapportent 38
            au gardien.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-center text-[13px] font-bold text-rose-700">
                Attaquant, face à q = {f2(q)}
              </div>
              <PenLines who="A" v={q} />
            </div>
            <div>
              <div className="mb-1 text-center text-[13px] font-bold text-sky-700">
                Gardien, face à p = {f2(p)}
              </div>
              <PenLines who="G" v={p} />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <PenCases who="A" p={p} q={q} />
            <PenCases who="G" p={p} q={q} />
          </div>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            La pente <M tex="60 - 100q" />, c'est l'écart entre les deux droites de l'attaquant :{" "}
            <M tex="(80 - 30q) - (20 + 70q) = 60 - 100q" />. Elle change de signe en{" "}
            <M tex="q = 0{,}6" />, là où les droites se croisent.
          </p>
          {nextBtn("en", "③ L'équilibre")}
        </>
      ) : null}

      {view === "en" ? (
        <>
          <PenBRGraph p={p} q={q} />
          <ExplainPanel>
            <p>
              Face à q = {f2(q)}, la meilleure réponse de l'
              <span className="font-bold text-rose-700">attaquant</span> est :{" "}
              <strong>{brA}</strong>.
              <br />
              Face à p = {f2(p)}, la meilleure réponse du{" "}
              <span className="font-bold text-sky-700">gardien</span> est : <strong>{brG}</strong>.
            </p>
            {atEq ? (
              <p className="mt-2 font-semibold text-emerald-700">
                🎯 Tu es sur l'équilibre de Nash mixte (0,7 ; 0,6) ! Chacun est indifférent entre
                ses deux stratégies pures, donc personne ne peut gagner en déviant seul :{" "}
                <M tex="U_A = 62" /> et <M tex="U_G = 38" />, quoi que fasse un joueur qui dévie
                seul.
              </p>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Ce profil n'est <strong>pas</strong> un équilibre :{" "}
                {!aHappy && !gHappy
                  ? "les deux joueurs voudraient dévier"
                  : !aHappy
                    ? "l'attaquant voudrait dévier"
                    : "le gardien voudrait dévier"}{" "}
                (flèche{!aHappy && !gHappy ? "s" : ""} vers sa meilleure réponse). Amène le point
                noir sur l'intersection (0,7 ; 0,6).
              </p>
            )}
          </ExplainPanel>
        </>
      ) : null}
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Police vs mafia : p* = x / (80 + x)  (slides 66-67)               */
/* ------------------------------------------------------------------ */

/** probabilité d'équilibre « Ville » : p* (police) = q* (mafia) = x/(80+x) */
const pmStar = (x: number) => x / (80 + x);

export function PoliceMafia() {
  const [x, setX] = useState(20);
  const p = pmStar(x);
  const q = pmStar(x);
  const umV = 20 * p + 100 * (1 - p);
  const umB = 100 * p + (100 - x) * (1 - p);

  const P = makePlot({ w: 440, h: 280, pL: 50, pR: 14, pT: 26, pB: 44, x: [0, 100], y: [0, 1] });
  const fV = (t: number) => pmStar(t);
  const fB = (t: number) => 1 - pmStar(t);
  const pc = (v: number) => `${fmt(v * 100, 1)}\u00a0%`;
  /** les deux points sont proches (autour de x = 80) : étiquettes de part et d'autre */
  const close = Math.abs(1 - 2 * p) < 0.12;

  return (
    <InteractiveCard
      title="Quand mieux réprimer en banlieue… vide la banlieue de policiers"
      subtitle={
        <>
          À l'équilibre mixte, la stratégie de la police <M tex="p^* = x/(80+x)" /> sort de
          l'équation d'indifférence de la <em>mafia</em> (slide 67). Augmente <M tex="x" /> et
          observe les deux courbes.
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
            min={1}
            max={100}
            step={1}
            format={(v) => v.toFixed(0)}
          />
          <div className="flex flex-col justify-center gap-0.5 text-[13px]">
            <span className="font-semibold text-rose-700">
              Police en VILLE : <M tex="p^*" /> = <span className="tabular-nums">{pc(p)}</span>
            </span>
            <span className="font-semibold text-violet-700">
              Police en BANLIEUE : <M tex="1 - p^*" /> ={" "}
              <span className="tabular-nums">{pc(1 - p)}</span>
            </span>
          </div>
          <div className="flex flex-col justify-center gap-0.5 text-[13px] text-muted-foreground">
            <span>
              Mafia en ville : <M tex="q^* = x/(80+x)" /> ={" "}
              <span className="tabular-nums">{pc(q)}</span>
            </span>
            <span>(même formule ici, tirée de l'indifférence de la police)</span>
          </div>
        </>
      }
      footer={
        <>
          les deux courbes se croisent en <M tex="x = 80" /> (50 % / 50 %). Plus <M tex="x" />{" "}
          augmente, plus la police va en ville… et <strong>moins</strong> en banlieue, là où elle
          est devenue plus efficace (slide 67). À l'équilibre mixte, la stratégie de la police est
          fixée par l'indifférence de la <em>mafia</em>, pas par ses propres forces.
        </>
      }
    >
      <PlotSvg p={P} maxW={560} label="Probabilités d'équilibre de la police en ville, p étoile égale x sur 80 plus x, et en banlieue, 1 moins p étoile, en fonction de x">
        <Frame
          p={P}
          xticks={[0, 20, 40, 60, 80, 100]}
          yticks={[0, 0.25, 0.5, 0.75, 1]}
          yfmt={(t) => `${fmt(t * 100, 0)} %`}
          xlabel="x (efficacité en banlieue)"
          ylabel="probabilité (police)"
        />
        <path d={curvePath(P, fV, 0, 100)} fill="none" stroke={C.red} strokeWidth={2.8} />
        <path
          d={curvePath(P, fB, 0, 100)}
          fill="none"
          stroke={C.violet}
          strokeWidth={2.8}
          strokeDasharray="8 5"
        />
        <circle cx={P.X(80)} cy={P.Y(0.5)} r={3.5} fill={C.soft} />
        <GuideV p={P} x={x} y={Math.max(p, 1 - p)} color={C.ink} />
        <Dot p={P} x={x} y={p} fill={C.red} r={5.5} />
        <Dot p={P} x={x} y={1 - p} fill={C.violet} r={5.5} />
        <Label
          p={P}
          x={x}
          y={p}
          anchor={x > 60 ? "end" : "start"}
          dx={x > 60 ? -9 : 9}
          dy={close ? (p >= 0.5 ? -10 : 18) : 4}
          color={C.red}
          weight={700}
        >
          {pc(p)}
        </Label>
        <Label
          p={P}
          x={x}
          y={1 - p}
          anchor={x > 60 ? "end" : "start"}
          dx={x > 60 ? -9 : 9}
          dy={close ? (p >= 0.5 ? 18 : -10) : 4}
          color={C.violet}
          weight={700}
        >
          {pc(1 - p)}
        </Label>
      </PlotSvg>
      <Legend
        items={[
          { color: C.red, label: <>police en ville : <M tex="p^* = x/(80+x)" /></> },
          { color: C.violet, label: <>police en banlieue : <M tex="1 - p^*" /></>, dashed: true },
        ]}
      />
      <ExplainPanel>
        <p>
          Avec <M tex={`x = ${x}`} /> : la police va en ville <strong>{pc(p)}</strong> du temps et
          en banlieue <strong>{pc(1 - p)}</strong> du temps.
        </p>
        <p className="mt-1.5">
          <strong>Vérification</strong> — la mafia est bien indifférente (slide 67) :{" "}
          <M
            tex={String.raw`U_M(p^*, V) = 20\,p^* + 100\,(1 - p^*) = ${tx(umV, 1)}`}
          />{" "}
          et{" "}
          <M
            tex={String.raw`U_M(p^*, B) = 100\,p^* + (100 - x)(1 - p^*) = ${tx(umB, 1)}`}
          />
          .
        </p>
        <p className="mt-1.5">
          <strong>Pourquoi moins en banlieue quand x augmente ?</strong> En banlieue, la mafia
          garde <M tex="100 - x" /> quand elle y croise la police : plus <M tex="x" /> est grand,
          plus la banlieue lui coûte cher. Pour que la mafia reste indifférente entre Ville et
          Banlieue, la police doit donc y aller <em>moins</em> souvent. De son côté, la mafia va
          plus souvent en ville : <M tex="q^*" /> augmente aussi.
        </p>
      </ExplainPanel>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Bataille des sexes répétée en labo (slides 43-45)                 */
/* ------------------------------------------------------------------ */

/** slide 45 : résultats en laboratoire (26 étudiants), rounds 1 à 4 */
const BOS_LAB = {
  pV: [21, 15, 17, 8],
  pP: [79, 85, 83, 92],
  payV: [1.23, 0.62, 0.31, 0.31],
  payP: [1.38, 1.69, 1.85, 1.85],
  pR: [31, 15, 8, 8],
  pB: [69, 85, 92, 92],
  payR: [0.43, 0.31, 0.33, 0.15],
  payB: [3.14, 3.38, 3.33, 3.69],
};

/** barre 100 % partagée entre deux stratégies */
function SplitBar({ items }: { items: Array<{ label: string; pct: number; cls: string }> }) {
  return (
    <div>
      <div className="flex h-7 w-full overflow-hidden rounded-lg border text-[12.5px] font-bold text-white">
        {items.map((it) => (
          <div
            key={it.label}
            className={cn(
              "flex items-center justify-center overflow-hidden whitespace-nowrap transition-all duration-700",
              it.cls,
            )}
            style={{ width: `${it.pct}%` }}
          >
            {it.pct >= 15 ? `${it.pct} %` : ""}
          </div>
        ))}
      </div>
      <div className="mt-1 text-[12.5px] text-muted-foreground">
        {items.map((it) => `${it.label} : ${it.pct} %`).join(" · ")}
      </div>
    </div>
  );
}

/** payoff moyen obtenu avec une stratégie (échelle : 4 = payoff maximal du jeu) */
function PayRow({ label, v, cls, best }: { label: string; v: number; cls: string; best: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="w-16 shrink-0 text-right text-muted-foreground">{label}</span>
      <div className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full border bg-background">
        <div
          className={cn("h-full rounded-full transition-all duration-700", cls)}
          style={{ width: `${(v / 4) * 100}%` }}
        />
      </div>
      <span className={cn("w-10 shrink-0 tabular-nums", best ? "font-bold text-foreground" : "text-muted-foreground")}>
        {fmt(v, 2)}
      </span>
    </div>
  );
}

export function ConvergenceBars() {
  const [r, setR] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (r >= 3) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setR((v) => Math.min(3, v + 1)), 1300);
    return () => window.clearTimeout(id);
  }, [playing, r]);

  const L = BOS_LAB;
  const P = makePlot({ w: 440, h: 200, pL: 50, pR: 14, pT: 26, pB: 40, x: [0.6, 4.4], y: [0, 100] });
  const ptsP = L.pP.map((v, i) => `${P.X(i + 1).toFixed(1)},${P.Y(v).toFixed(1)}`).join(" ");
  const ptsB = L.pB.map((v, i) => `${P.X(i + 1).toFixed(1)},${P.Y(v).toFixed(1)}`).join(" ");
  const same = L.pP[r] === L.pB[r];
  const pHigher = L.pP[r] >= L.pB[r];

  return (
    <InteractiveCard
      title="Bataille des sexes répétée en labo (26 étudiants) : convergence vers (P, B)"
      subtitle="Données du slide 45. Choisis un round (ou lance l'animation) : les choix des joueurs et le payoff moyen obtenu avec chaque stratégie."
      controls={
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
          <ChoiceChips
            value={String(r)}
            onChange={(v) => {
              setPlaying(false);
              setR(Number(v));
            }}
            options={[0, 1, 2, 3].map((i) => ({ value: String(i), label: `Round ${i + 1}` }))}
          />
          <PlayButton
            playing={playing}
            label="Rejouer les 4 rounds"
            onClick={() => {
              if (playing) {
                setPlaying(false);
              } else {
                setR(0);
                setPlaying(true);
              }
            }}
          />
        </div>
      }
      footer={
        <>
          « On observe une convergence vers l'équilibre (P, B) » (slide 45) : de 79 % à 92 % de
          Poisson, de 69 % à 92 % de Blanc — pas tout à fait en ligne droite (85 % puis 83 % de
          Poisson). L'équilibre qui s'impose est celui que préfèrent les femmes : dès le round 1,
          Blanc leur rapportait bien plus que Rouge.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3">
          <div className="mb-2 text-[13.5px] font-bold">Hommes (choisissent le plat)</div>
          <SplitBar
            items={[
              { label: "Viande", pct: L.pV[r], cls: "bg-rose-600" },
              { label: "Poisson", pct: L.pP[r], cls: "bg-emerald-600" },
            ]}
          />
          <div className="mb-1 mt-2.5 text-[12.5px] font-semibold text-muted-foreground">
            Payoff moyen obtenu (sur 4)
          </div>
          <div className="space-y-1">
            <PayRow label="Viande" v={L.payV[r]} cls="bg-rose-500" best={L.payV[r] > L.payP[r]} />
            <PayRow label="Poisson" v={L.payP[r]} cls="bg-emerald-500" best={L.payP[r] > L.payV[r]} />
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="mb-2 text-[13.5px] font-bold">Femmes (choisissent le vin)</div>
          <SplitBar
            items={[
              { label: "Rouge", pct: L.pR[r], cls: "bg-red-700" },
              { label: "Blanc", pct: L.pB[r], cls: "bg-sky-600" },
            ]}
          />
          <div className="mb-1 mt-2.5 text-[12.5px] font-semibold text-muted-foreground">
            Payoff moyen obtenu (sur 4)
          </div>
          <div className="space-y-1">
            <PayRow label="Rouge" v={L.payR[r]} cls="bg-red-600" best={L.payR[r] > L.payB[r]} />
            <PayRow label="Blanc" v={L.payB[r]} cls="bg-sky-500" best={L.payB[r] > L.payR[r]} />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <PlotSvg p={P} maxW={560} label="Part des hommes jouant Poisson et des femmes jouant Blanc, round par round">
          <rect
            x={P.X(r + 1) - 26}
            y={P.pT}
            width={52}
            height={P.h - P.pT - P.pB}
            fill={C.gold}
            fillOpacity={0.12}
            style={{ transition: "x 0.5s" }}
          />
          <Frame
            p={P}
            xticks={[1, 2, 3, 4]}
            xfmt={(t) => `round ${t}`}
            yticks={[0, 50, 100]}
            yfmt={(t) => `${t} %`}
            ylabel="part des joueurs"
          />
          <polyline points={ptsP} fill="none" stroke={C.green} strokeWidth={2.6} />
          <polyline points={ptsB} fill="none" stroke={C.sky} strokeWidth={2.6} strokeDasharray="7 5" />
          {L.pP.map((v, i) => (
            <circle key={`p${i}`} cx={P.X(i + 1)} cy={P.Y(v)} r={i === r ? 5.5 : 3.5} fill={C.green} stroke="#fff" strokeWidth={1.2} />
          ))}
          {L.pB.map((v, i) => (
            <circle key={`b${i}`} cx={P.X(i + 1)} cy={P.Y(v)} r={i === r ? 5.5 : 3.5} fill={C.sky} stroke="#fff" strokeWidth={1.2} />
          ))}
          {same ? (
            <Label
              p={P}
              x={r + 1}
              y={L.pP[r]}
              anchor={r === 3 ? "end" : "middle"}
              dx={r === 3 ? 8 : 0}
              dy={-10}
              color={C.ink}
              weight={700}
            >
              {`${L.pP[r]} % (les deux)`}
            </Label>
          ) : (
            <>
              <Label p={P} x={r + 1} y={L.pP[r]} anchor="middle" dx={0} dy={pHigher ? -10 : 18} color={C.green} weight={700}>
                {`${L.pP[r]} %`}
              </Label>
              <Label p={P} x={r + 1} y={L.pB[r]} anchor="middle" dx={0} dy={pHigher ? 18 : -10} color={C.sky} weight={700}>
                {`${L.pB[r]} %`}
              </Label>
            </>
          )}
        </PlotSvg>
        <Legend
          items={[
            { color: C.green, label: "% Poisson (hommes)" },
            { color: C.sky, label: "% Blanc (femmes)", dashed: true },
          ]}
        />
      </div>

      <ExplainPanel>
        {r === 0 ? (
          <p>
            <strong>Round 1 (slide 43).</strong> 21 % des hommes jouent Viande et 31 % des femmes
            jouent Rouge : les joueurs ne se sont <strong>pas coordonnés</strong> sur un des deux
            EN (en stratégies pures). Le payoff de l'homme était un peu plus grand avec Poisson
            (1,38 contre 1,23 pour Viande), celui de la femme beaucoup plus grand avec Blanc (3,14
            contre 0,43 pour Rouge).
          </p>
        ) : (
          <p>
            <strong>Round {r + 1}.</strong> {L.pP[r]} % de Poisson et {L.pB[r]} % de Blanc. Payoffs
            moyens : Poisson {fmt(L.payP[r], 2)} contre Viande {fmt(L.payV[r], 2)} ; Blanc{" "}
            {fmt(L.payB[r], 2)} contre Rouge {fmt(L.payR[r], 2)}.
            {r === 3
              ? " Au round 4, la grande majorité joue (Poisson, Blanc) : la répétition a rapproché les joueurs de cet équilibre (slide 44 : un équilibre peut devenir une convention, un point focal)."
              : ""}
          </p>
        )}
        <p className="mt-1.5 text-muted-foreground">
          D'où viennent ces payoffs ? Une femme qui apporte du Blanc gagne 4 si l'homme a cuisiné
          du Poisson, 0 sinon : face à {L.pP[r]} % de Poisson, elle peut espérer environ{" "}
          <M tex={String.raw`4 \times ${tx(L.pP[r] / 100)} = ${tx((4 * L.pP[r]) / 100)}`} />{" "}
          (observé : {fmt(L.payB[r], 2)}). Un homme qui cuisine du Poisson gagne 2 si la femme
          apporte du Blanc : environ{" "}
          <M tex={String.raw`2 \times ${tx(L.pB[r] / 100)} = ${tx((2 * L.pB[r]) / 100)}`} />{" "}
          (observé : {fmt(L.payP[r], 2)}).
        </p>
      </ExplainPanel>
    </InteractiveCard>
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
