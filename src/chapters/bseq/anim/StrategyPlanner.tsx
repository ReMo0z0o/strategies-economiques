/*
 * StrategyPlanner — B2 § 4 · une stratégie = un plan d'action complet
 * (slides 14 à 18).
 *
 * L'étudiant compose le plan de chaque joueur nœud par nœud : J1 en x₀ et en
 * x₂ (même quand x₂ n'est pas atteint : la stratégie doit le préciser), J2 en
 * x₁. On voit le libellé des stratégies (« DG », « E »), le chemin et l'issue
 * dans l'arbre, la case correspondante de la forme normale 4 × 2 (meilleures
 * réponses soulignées comme au slide 16, EN et ENPS marqués) et, pour le
 * profil courant, les verdicts « EN ? » et « ENPS ? » (EN dans chacun des
 * trois sous-jeux, définition du slide 11). Encart du slide 18 : le résultat
 * (2 ; 0) est atteint par quatre profils, dont un seul ENPS.
 * Tout est CALCULÉ (normalForm2, pureNash, backwardInduction, sous-jeux).
 */
import { useMemo, useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard } from "@/components/course/Interactive";
import {
  GameTreeSvg,
  GT_COLORS,
  backwardInduction,
  choicesOf,
  decisionLevel,
  leaf,
  node,
  normalForm2,
  playPath,
  preorder,
  pureNash,
  type GTGame,
  type GTNode,
  type GTStrategy,
} from "@/chapters/shared/gametree";
import { C, fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const GAME: GTGame = {
  players: [
    { name: "Joueur 1", color: GT_COLORS[0] },
    { name: "Joueur 2", color: GT_COLORS[1] },
  ],
  root: node(
    "x0",
    0,
    [
      [
        "C",
        node(
          "x1",
          1,
          [
            [
              "E",
              node(
                "x2",
                0,
                [
                  ["G", leaf("g", [1, 2])],
                  ["H", leaf("h", [0, 0])],
                ],
                { name: "x2" },
              ),
            ],
            ["F", leaf("f", [3, 1])],
          ],
          { name: "x1" },
        ),
      ],
      ["D", leaf("d", [2, 0])],
    ],
    { name: "x0" },
  ),
};
const COL = [GT_COLORS[0], GT_COLORS[1]];
const WHO = ["J1", "J2"];
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const nice = (s: string) => s.replace(/\d/g, (d) => SUB[Number(d)]);

type Choice = Record<string, number>;
const fits = (s: GTStrategy, c: Choice) => Object.entries(s.choice).every(([id, k]) => c[id] === k);

interface Dev {
  player: 0 | 1;
  from: GTStrategy;
  to: GTStrategy;
  cur: number;
  alt: number;
}
interface SubCheck {
  node: GTNode;
  ok: boolean;
  /** meilleure déviation unilatérale de chaque joueur qui a un choix dans le sous-jeu */
  devs: Dev[];
}

/** Le profil, restreint au sous-jeu qui commence en `n`, est-il un EN de ce sous-jeu ? */
function checkSubgame(n: GTNode, choice: Choice): SubCheck {
  const nf = normalForm2({ players: GAME.players, root: n });
  const i = nf.rows.findIndex((s) => fits(s, choice));
  const j = nf.cols.findIndex((s) => fits(s, choice));
  const devs: Dev[] = [];
  let b = -1;
  nf.rows.forEach((_, r) => {
    if (r !== i && (b < 0 || nf.cells[r][j][0] > nf.cells[b][j][0])) b = r;
  });
  if (b >= 0)
    devs.push({
      player: 0,
      from: nf.rows[i],
      to: nf.rows[b],
      cur: nf.cells[i][j][0],
      alt: nf.cells[b][j][0],
    });
  b = -1;
  nf.cols.forEach((_, c) => {
    if (c !== j && (b < 0 || nf.cells[i][c][1] > nf.cells[i][b][1])) b = c;
  });
  if (b >= 0)
    devs.push({
      player: 1,
      from: nf.cols[j],
      to: nf.cols[b],
      cur: nf.cells[i][j][1],
      alt: nf.cells[i][b][1],
    });
  return { node: n, devs, ok: devs.every((d) => d.alt <= d.cur + 1e-12) };
}

/** nœuds de décision du dernier sous-jeu au jeu complet */
const DECISIONS = (() => {
  const order = new Map(preorder(GAME.root).map((n, k) => [n.id, k]));
  return (preorder(GAME.root).filter((n) => n.kind === "node") as GTNode[]).sort(
    (a, b) => decisionLevel(a) - decisionLevel(b) || order.get(a.id)! - order.get(b.id)!,
  );
})();
const byId = Object.fromEntries(DECISIONS.map((n) => [n.id, n]));
/** nœuds de chaque joueur en préordre (ordre des lettres d'une stratégie : DG = D en x₀, G en x₂) */
const NODES_OF = [0, 1].map((p) =>
  preorder(GAME.root).filter((n): n is GTNode => n.kind === "node" && n.player === p),
);
const planText = (s: GTStrategy, p: number) =>
  s.actions.map((a, k) => `${a} en ${nice(NODES_OF[p][k].name ?? "")}`).join(", ");

function Pay({ v }: { v: number[] }) {
  return (
    <span className="whitespace-nowrap font-bold tabular-nums">
      (<span style={{ color: COL[0] }}>{fmt(v[0])}</span> ;{" "}
      <span style={{ color: COL[1] }}>{fmt(v[1])}</span>)
    </span>
  );
}
function S({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span className="font-bold" style={{ color: COL[p] }}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Le composant                                                        */
/* ------------------------------------------------------------------ */

export function StrategyPlanner() {
  const nf = useMemo(() => normalForm2(GAME), []);
  const ne = useMemo(() => pureNash(nf.cells), [nf]);
  const bi = useMemo(() => choicesOf(backwardInduction(GAME)), []);
  const spne = useMemo(
    () => [nf.rows.findIndex((s) => fits(s, bi)), nf.cols.findIndex((s) => fits(s, bi))] as const,
    [nf, bi],
  );
  const [choice, setChoice] = useState<Choice>({ x0: 0, x1: 0, x2: 0 });

  const i = nf.rows.findIndex((s) => fits(s, choice));
  const j = nf.cols.findIndex((s) => fits(s, choice));
  const row = nf.rows[i];
  const col = nf.cols[j];
  const path = playPath(GAME, choice);
  const outcome = path.leaf?.payoffs ?? [];
  const reached = (id: string) => path.ids.includes(id);
  const prof = (a: number, b: number) => `(${nf.rows[a].label}, ${nf.cols[b].label})`;
  const isEN = (a: number, b: number) => ne.eq.some(([x, y]) => x === a && y === b);
  const isSPNE = (a: number, b: number) => a === spne[0] && b === spne[1];

  const checks = DECISIONS.map((n) => checkSubgame(n, choice));
  const whole = checks[checks.length - 1];
  const en = isEN(i, j);
  const sp = checks.every((c) => c.ok);

  // slide 18 : profils qui mènent au même résultat que « D » en x₀
  const dLeaf = (
    byId.x0.moves[1].to.kind === "leaf" ? byId.x0.moves[1].to.payoffs : []
  ) as number[];
  const same = (target: number[]) =>
    nf.rows
      .flatMap((_, a) => nf.cols.map((__, b) => [a, b] as const))
      .filter(([a, b]) => nf.cells[a][b].every((v, k) => v === target[k]));
  const sameAsD = same(dLeaf);
  const sameAsMine = same(outcome);

  const setNode = (id: string, k: number) => setChoice((c) => ({ ...c, [id]: k }));
  const pickProfile = (a: number, b: number) =>
    setChoice({ ...nf.rows[a].choice, ...nf.cols[b].choice });

  const nodeControl = (id: string, label: ReactNode) => {
    const n = byId[id];
    return (
      <div className="min-w-0">
        <ChoiceChips
          label={label}
          value={String(choice[id])}
          onChange={(v) => setNode(id, Number(v))}
          options={n.moves.map((m, k) => ({ value: String(k), label: m.action }))}
        />
        <p
          className={cn(
            "mt-1 text-[12px] leading-snug",
            reached(id) ? "text-muted-foreground" : "font-semibold text-amber-700",
          )}
        >
          {reached(id)
            ? "nœud atteint avec ces choix"
            : "nœud non atteint, mais la stratégie doit le préciser"}
        </p>
      </div>
    );
  };

  return (
    <InteractiveCard
      title="Composer une stratégie : un plan d'action complet"
      subtitle={
        <>
          Slides 14 à 18. Choisis ce que fait chaque joueur à <em>chacun</em> de ses nœuds, même
          ceux qui ne seront pas atteints. Tu peux aussi cliquer une case de la forme normale.
        </>
      }
      controls={
        <>
          {nodeControl("x0", <span style={{ color: COL[0] }}>Joueur 1 en x₀</span>)}
          {nodeControl("x2", <span style={{ color: COL[0] }}>Joueur 1 en x₂</span>)}
          {nodeControl("x1", <span style={{ color: COL[1] }}>Joueur 2 en x₁</span>)}
        </>
      }
      footer={
        <>
          D n'est pas une stratégie du joueur 1 : DG (« D en x₀, G en x₂ ») en est une (slide 15).
          J1 a donc 2 × 2 = 4 stratégies et J2 en a 2 : la forme normale a 8 cases. Quand J1 joue D,
          le chemin s'arrête tout de suite, mais changer G ↔ H ou E ↔ F change le <em>profil</em>{" "}
          sans changer le <em>résultat</em> : c'est la remarque du slide 18, et c'est là que se
          cachent les menaces non crédibles.
        </>
      }
    >
      <div className="mb-3 flex flex-wrap justify-center gap-2 text-[14px]">
        <span className="rounded-full border px-3 py-1">
          Stratégie de J1 : <S p={0}>{row.label}</S>{" "}
          <span className="text-muted-foreground">({planText(row, 0)})</span>
        </span>
        <span className="rounded-full border px-3 py-1">
          Stratégie de J2 : <S p={1}>{col.label}</S>{" "}
          <span className="text-muted-foreground">({planText(col, 1)})</span>
        </span>
        <span className="rounded-full border border-primary/50 bg-accent px-3 py-1 font-semibold">
          Profil {prof(i, j)} → résultat <Pay v={outcome} />
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="min-w-0">
          <GameTreeSvg
            game={GAME}
            chosen={choice}
            dimOthers
            showPath
            ariaLabel={`Arbre du jeu des slides 14-18. Profil ${prof(i, j)} : chemin ${path.edges.map(([id, k]) => byId[id].moves[k].action).join(" puis ")}, résultat ${outcome.join(" ; ")}.`}
            maxW={360}
            className="overflow-visible"
          />
          <p className="mt-1 text-center text-[12.5px] text-muted-foreground">
            Trait épais = plan prévu · surligné = chemin joué · cercle = résultat
          </p>
        </div>
        <div className="min-w-0">
          <NFTable nf={nf} ne={ne} cur={[i, j]} spne={spne} onPick={pickProfile} />
          <p className="mx-auto mt-1 max-w-[17rem] text-center text-[12.5px] leading-snug text-muted-foreground">
            Souligné : meilleure réponse (slide 16).{" "}
            <span className="font-semibold text-emerald-700">EN</span> : équilibre de Nash ;{" "}
            <span className="font-semibold" style={{ color: C.violet }}>
              ★ ENPS
            </span>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2" aria-live="polite">
        <Card ok={en} title="EN ?">
          <ul className="space-y-1">
            {whole.devs.map((d) => (
              <li key={d.player}>
                <S p={d.player}>{WHO[d.player]}</S> : sa meilleure autre stratégie,{" "}
                <S p={d.player}>{d.to.label}</S>, lui donnerait <strong>{fmt(d.alt)}</strong> au
                lieu de <strong>{fmt(d.cur)}</strong>{" "}
                {d.alt > d.cur ? (
                  <span className="font-semibold text-rose-700">
                    → il gagnerait {fmt(d.alt - d.cur)} à dévier.
                  </span>
                ) : (
                  <span className="text-emerald-700">→ pas de gain à dévier.</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-1 font-semibold">
            {en ? `${prof(i, j)} est un EN.` : `${prof(i, j)} n'est pas un EN.`}
          </p>
        </Card>
        <Card ok={sp} title="ENPS ? (EN dans chaque sous-jeu)">
          <ul className="space-y-1">
            {checks.map((c) => {
              const isRoot = c.node.id === GAME.root.id;
              const bad = c.devs.find((d) => d.alt > d.cur);
              return (
                <li key={c.node.id}>
                  <span
                    className={cn("font-semibold", c.ok ? "text-emerald-700" : "text-rose-700")}
                  >
                    {c.ok ? "✓" : "✗"}
                  </span>{" "}
                  {isRoot ? "Jeu complet (x₀)" : `Sous-jeu en ${nice(c.node.name ?? "")}`}
                  {!isRoot && !reached(c.node.id) ? (
                    <span className="text-muted-foreground"> (non atteint)</span>
                  ) : null}{" "}
                  :{" "}
                  {c.ok ? (
                    isRoot ? (
                      "EN du jeu complet."
                    ) : (
                      "EN de ce sous-jeu."
                    )
                  ) : bad ? (
                    <>
                      <S p={bad.player}>{WHO[bad.player]}</S> y gagnerait à remplacer{" "}
                      <S p={bad.player}>{bad.from.label}</S> par{" "}
                      <S p={bad.player}>{bad.to.label}</S> ({fmt(bad.alt)} au lieu de {fmt(bad.cur)}
                      ).
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-1 font-semibold">
            {sp
              ? `${prof(i, j)} est un ENPS : c'est le résultat de la backward induction.`
              : en
                ? `${prof(i, j)} est un EN, mais pas un ENPS : il repose sur un plan non crédible.`
                : `${prof(i, j)} n'est pas un ENPS.`}
          </p>
        </Card>
      </div>

      <div className="mt-3 rounded-xl border border-dashed bg-muted/40 px-3 py-2.5 text-[14px] leading-relaxed sm:px-4">
        <p className="font-bold">Même résultat, profils différents (slide 18)</p>
        <p className="mt-0.5">
          Le résultat <Pay v={dLeaf} /> est atteint par {sameAsD.length} profils de stratégies.
          Clique-les : le chemin reste le même, seuls les plans aux nœuds non atteints changent.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sameAsD.map(([a, b]) => {
            const active = a === i && b === j;
            return (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => pickProfile(a, b)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-[13px] font-semibold tabular-nums transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {prof(a, b)}
                {isSPNE(a, b) ? " ★ ENPS" : isEN(a, b) ? " · EN" : ""}
              </button>
            );
          })}
        </div>
        <p className="mt-2">
          Cela dit, seulement{" "}
          <strong>
            {sameAsD
              .filter(([a, b]) => isSPNE(a, b))
              .map(([a, b]) => prof(a, b))
              .join(", ")}
          </strong>{" "}
          est un ENPS.
          {sameAsMine.length > 0 &&
          !sameAsMine.some(([a, b]) => sameAsD.some(([c, d]) => c === a && d === b)) ? (
            <>
              {" "}
              (Ton profil actuel mène à <Pay v={outcome} />, atteint par{" "}
              {sameAsMine.length === 1
                ? "ce seul profil"
                : `${sameAsMine.length} profils : ${sameAsMine.map(([a, b]) => prof(a, b)).join(", ")}`}
              .)
            </>
          ) : null}
        </p>
      </div>
    </InteractiveCard>
  );
}

function Card({ ok, title, children }: { ok: boolean; title: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border-2 px-3 py-2.5 text-[14px] leading-relaxed",
        ok ? "border-emerald-500/50 bg-emerald-500/5" : "border-rose-400/50 bg-rose-500/5",
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[12.5px] font-bold",
            ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
          )}
        >
          {ok ? "✓ Oui" : "✗ Non"}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Forme normale 4 × 2 du slide 16 : meilleures réponses soulignées, EN et ENPS marqués, case courante. */
function NFTable({
  nf,
  ne,
  cur,
  spne,
  onPick,
}: {
  nf: ReturnType<typeof normalForm2>;
  ne: ReturnType<typeof pureNash>;
  cur: readonly [number, number];
  spne: readonly [number, number];
  onPick: (a: number, b: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-[14px]">
        <thead>
          <tr>
            <th
              className="p-1 text-left align-bottom text-[11.5px] font-bold uppercase leading-tight"
              style={{ color: COL[0] }}
            >
              Joueur 1 ↓
            </th>
            <th
              colSpan={nf.cols.length}
              className="p-1 text-center text-[11.5px] font-bold uppercase"
              style={{ color: COL[1] }}
            >
              Joueur 2 →
            </th>
          </tr>
          <tr>
            <th />
            {nf.cols.map((c) => (
              <th
                key={c.label}
                className="px-1 py-0.5 text-center font-semibold"
                style={{ color: COL[1] }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nf.rows.map((r, a) => (
            <tr key={r.label}>
              <th className="px-1.5 py-0.5 text-right font-semibold" style={{ color: COL[0] }}>
                {r.label}
              </th>
              {nf.cols.map((c, b) => {
                const v = nf.cells[a][b];
                const isCur = a === cur[0] && b === cur[1];
                const en = ne.eq.some(([x, y]) => x === a && y === b);
                const sp = a === spne[0] && b === spne[1];
                const br1 = ne.rowBest[b].includes(a);
                const br2 = ne.colBest[a].includes(b);
                return (
                  <td key={c.label} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => onPick(a, b)}
                      aria-pressed={isCur}
                      aria-label={`Profil (${r.label}, ${c.label}) : ${v.join(" ; ")}${sp ? ", ENPS" : en ? ", EN" : ""}`}
                      className={cn(
                        "block w-[4.9rem] rounded-lg border-2 px-1 pb-0.5 pt-1 text-center tabular-nums transition-all duration-300",
                        isCur
                          ? "border-primary bg-accent shadow-[0_0_0_3px_oklch(0.51_0.19_272_/_0.18)]"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "font-semibold",
                          br1 && "underline decoration-2 underline-offset-4",
                        )}
                        style={{ color: COL[0] }}
                      >
                        {fmt(v[0])}
                      </span>
                      <span className="text-muted-foreground"> ; </span>
                      <span
                        className={cn(
                          "font-semibold",
                          br2 && "underline decoration-2 underline-offset-4",
                        )}
                        style={{ color: COL[1] }}
                      >
                        {fmt(v[1])}
                      </span>
                      <span
                        className="block text-[11px] font-bold leading-tight"
                        style={{ color: sp ? C.violet : C.green }}
                      >
                        {sp ? "★ ENPS" : en ? "EN" : " "}
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
  );
}
