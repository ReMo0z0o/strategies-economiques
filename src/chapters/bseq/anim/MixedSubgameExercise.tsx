/*
 * MixedSubgameExercise — B2 § 8 · exercice du slide 42 (info imparfaite + mixtes).
 *
 * Arbre du slide 42 ; matrice 2×2 du sous-jeu J2-J3 avec le cycle des
 * déviations (pas d'EN pur, vérifié par pureNash) ; curseurs p = P(J2 joue H)
 * et q = P(J3 joue G) ; paiements espérés de J2 (selon q) et de J3 (selon p)
 * qui se croisent en 3/4 (mixed2x2) ; paiement espéré de J1 avec In comparé à
 * Out ⇒ jeu réduit et ENPS du slide 42. Tout est CALCULÉ à partir des paiements.
 */
import { useMemo, useState, type ReactNode } from "react";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import {
  GT_COLORS,
  GameTreeSvg,
  PayoffChip,
  leaf,
  mixed2x2,
  node,
  pureNash,
  type GTGame,
  type GTNode,
} from "@/chapters/shared/gametree";
import { C, Dot, Frame, GuideV, Label, PlotSvg, curvePath, fmt, makePlot, type Plot } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const COL = [GT_COLORS[0], GT_COLORS[1], GT_COLORS[2]];
const GAME: GTGame = {
  players: [
    { name: "J1", color: COL[0] },
    { name: "J2", color: COL[1] },
    { name: "J3", color: COL[2] },
  ],
  root: node("j1", 0, [
    ["Out", leaf("out", [8, 8, 8])],
    [
      "In",
      node("j2", 1, [
        ["H", node("j3h", 2, [["G", leaf("hg", [16, 1, 0])], ["D", leaf("hd", [0, 0, 1])]], { info: "j3" })],
        ["B", node("j3b", 2, [["G", leaf("bg", [0, 0, 3])], ["D", leaf("bd", [0, 3, 0])]], { info: "j3" })],
      ]),
    ],
  ]),
};
const ROOT = GAME.root as GTNode;
const OUT = (ROOT.moves[0].to.kind === "leaf" ? ROOT.moves[0].to.payoffs : []) as number[];
const SUB = ROOT.moves[1].to as GTNode;
const ROWS = SUB.moves.map((m) => m.action); // J2 : H, B
const COLS = (SUB.moves[0].to as GTNode).moves.map((m) => m.action); // J3 : G, D
/** FULL[i][j] = paiements (J1 ; J2 ; J3) quand J2 joue ROWS[i] et J3 COLS[j] */
const FULL: number[][][] = SUB.moves.map((r) =>
  (r.to as GTNode).moves.map((c) => (c.to.kind === "leaf" ? c.to.payoffs : [])),
);
const A = FULL.map((r) => r.map((v) => v[1])); // J2 (lignes)
const B = FULL.map((r) => r.map((v) => v[2])); // J3 (colonnes)

const EPS = 1e-9;
/** 0,75 → « 3/4 » quand c'est une fraction simple, sinon décimal */
function frac(v: number): string {
  for (let d = 1; d <= 8; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < EPS) return d === 1 ? String(n) : `${n}/${d}`;
  }
  return fmt(v);
}
/** « a·x + b·(1 − x) » simplifié : 1·q + 0·(1 − q) → « q » ; 0·q + 3·(1 − q) → « 3(1 − q) » */
function lin(a: number, b: number, x: string): string {
  const t: string[] = [];
  if (a !== 0) t.push(a === 1 ? x : `${fmt(a)}${x}`);
  if (b !== 0) t.push(b === 1 ? `(1 − ${x})` : `${fmt(b)}(1 − ${x})`);
  return t.length ? t.join(" + ") : "0";
}

function P({ p, children }: { p: number; children: ReactNode }) {
  return (
    <strong style={{ color: COL[p] }} className="whitespace-nowrap">
      {children}
    </strong>
  );
}

/* ---------- matrice du sous-jeu avec le cycle des déviations ------------- */
function CycleMatrix({ p, q }: { p: number; q: number }) {
  const L = 62;
  const T = 46;
  const W = 100;
  const H = 66;
  const G = 40;
  const cx = (j: number) => L + j * (W + G);
  const cy = (i: number) => T + i * (H + G);
  const prob = [
    [p * q, p * (1 - q)],
    [(1 - p) * q, (1 - p) * (1 - q)],
  ];
  // déviations : dans chaque colonne, J2 va vers sa meilleure ligne ; dans chaque ligne, J3 vers sa meilleure colonne
  const vArrows = COLS.map((_, j) => {
    const best = A[0][j] > A[1][j] ? 0 : A[1][j] > A[0][j] ? 1 : -1;
    return { j, best, gain: `${fmt(A[best === 0 ? 0 : 1][j])} > ${fmt(A[best === 0 ? 1 : 0][j])}` };
  });
  const hArrows = ROWS.map((_, i) => {
    const best = B[i][0] > B[i][1] ? 0 : B[i][1] > B[i][0] ? 1 : -1;
    return { i, best, gain: `${fmt(B[i][best === 0 ? 0 : 1])} > ${fmt(B[i][best === 0 ? 1 : 0])}` };
  });
  const w = L + 2 * W + G + 8;
  const h = T + 2 * H + G + 8;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block h-auto w-full" style={{ maxWidth: 340 }} role="img"
      aria-label="Matrice du sous-jeu entre J2 (lignes H, B) et J3 (colonnes G, D) ; les flèches montrent qu'à chaque case un joueur veut dévier : aucun équilibre en stratégies pures.">
      <defs>
        {[1, 2].map((k) => (
          <marker key={k} id={`mx-arr${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={COL[k]} />
          </marker>
        ))}
      </defs>
      <text x={L + W + G / 2} y={14} textAnchor="middle" fontSize={13} fontWeight={700} fill={COL[2]}>
        J3
      </text>
      {COLS.map((c, j) => (
        <text key={c} x={cx(j) + W / 2} y={T - 10} textAnchor="middle" fontSize={14} fontWeight={700} fill={COL[2]}>
          {c}
        </text>
      ))}
      <text x={12} y={T + H + G / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={COL[1]}>
        J2
      </text>
      {ROWS.map((r, i) => (
        <text key={r} x={L - 12} y={cy(i) + H / 2 + 5} textAnchor="end" fontSize={14} fontWeight={700} fill={COL[1]}>
          {r}
        </text>
      ))}
      {ROWS.map((_, i) =>
        COLS.map((__, j) => {
          const v = FULL[i][j];
          return (
            <g key={`${i}${j}`}>
              <rect x={cx(j)} y={cy(i)} width={W} height={H} rx={8} fill={C.gold} fillOpacity={0.05 + 0.4 * prob[i][j]} stroke={C.guide} />
              <text x={cx(j) + W / 2} y={cy(i) + 22} textAnchor="middle" fontSize={14} fontWeight={700}>
                <tspan fill={C.ink}>(</tspan>
                <tspan fill={COL[1]}>{fmt(v[1])}</tspan>
                <tspan fill={C.ink}> ; </tspan>
                <tspan fill={COL[2]}>{fmt(v[2])}</tspan>
                <tspan fill={C.ink}>)</tspan>
              </text>
              <text x={cx(j) + W / 2} y={cy(i) + 39} textAnchor="middle" fontSize={12} fill={C.soft}>
                J1 : <tspan fill={COL[0]} fontWeight={700}>{fmt(v[0])}</tspan>
              </text>
              <text x={cx(j) + W / 2} y={cy(i) + 56} textAnchor="middle" fontSize={12} fill={C.soft}>
                proba {fmt(prob[i][j] * 100, 0)} %
              </text>
            </g>
          );
        }),
      )}
      {/* flèches de J2 (verticales) */}
      {vArrows.map(({ j, best, gain }) =>
        best < 0 ? null : (
          <g key={`v${j}`}>
            <line
              x1={cx(j) + W / 2}
              x2={cx(j) + W / 2}
              y1={best === 1 ? cy(0) + H + 5 : cy(1) - 5}
              y2={best === 1 ? cy(1) - 5 : cy(0) + H + 5}
              stroke={COL[1]}
              strokeWidth={2.4}
              markerEnd="url(#mx-arr1)"
            />
            <text x={cx(j) + W / 2 + (j === 0 ? -8 : 8)} y={cy(0) + H + G / 2 + 4} textAnchor={j === 0 ? "end" : "start"} fontSize={12} fontWeight={700} fill={COL[1]}>
              {gain}
            </text>
          </g>
        ),
      )}
      {/* flèches de J3 (horizontales) */}
      {hArrows.map(({ i, best, gain }) =>
        best < 0 ? null : (
          <g key={`h${i}`}>
            <line
              y1={cy(i) + H / 2}
              y2={cy(i) + H / 2}
              x1={best === 1 ? cx(0) + W + 5 : cx(1) - 5}
              x2={best === 1 ? cx(1) - 5 : cx(0) + W + 5}
              stroke={COL[2]}
              strokeWidth={2.4}
              markerEnd="url(#mx-arr2)"
            />
            <text x={L + W + G / 2} y={cy(i) + H / 2 + (i === 0 ? -8 : 20)} textAnchor="middle" fontSize={12} fontWeight={700} fill={COL[2]}>
              {gain}
            </text>
          </g>
        ),
      )}
    </svg>
  );
}

/* ---------- graphe des paiements espérés d'un joueur --------------------- */
function EUPlot({
  who,
  xName,
  x,
  lines,
  cross,
  aria,
}: {
  who: number;
  xName: string;
  x: number;
  lines: Array<{ name: string; f: (t: number) => number; dash?: boolean; formula: string }>;
  cross: number | null;
  aria: string;
}) {
  const ymax = Math.max(...lines.flatMap((l) => [l.f(0), l.f(1)]));
  const p: Plot = makePlot({ w: 320, h: 230, x: [0, 1], y: [0, Math.ceil(ymax)], pL: 34, pR: 14, pT: 26, pB: 40 });
  const yt = Array.from({ length: Math.ceil(ymax) + 1 }, (_, k) => k);
  const vals = lines.map((l) => l.f(x));
  const best = Math.abs(vals[0] - vals[1]) < EPS ? -1 : vals[0] > vals[1] ? 0 : 1;
  return (
    <div>
      <PlotSvg p={p} label={aria} maxW={360}>
        <Frame p={p} xticks={[0, 0.25, 0.5, 0.75, 1]} xfmt={(t) => fmt(t)} yticks={yt} xlabel={xName} ylabel={`paiement espéré de ${GAME.players[who].name}`} />
        {cross !== null ? (
          <>
            <GuideV p={p} x={cross} y={lines[0].f(cross)} color={C.gold} />
            <Dot p={p} x={cross} y={lines[0].f(cross)} fill={C.gold} r={5} />
            <Label p={p} x={cross} y={lines[0].f(cross)} color={C.gold} anchor="middle" dy={-10} size={12.5}>
              {xName} = {frac(cross)}
            </Label>
          </>
        ) : null}
        {lines.map((l, k) => {
          // étiquette du côté où la droite est au-dessus de l'autre
          const other = lines[1 - k];
          const lx = l.f(0) - other.f(0) >= l.f(1) - other.f(1) ? 0.12 : 0.88;
          return (
            <g key={l.name}>
              <path d={curvePath(p, l.f, 0, 1, 2)} fill="none" stroke={COL[who]} strokeWidth={best === k ? 3.4 : 2} strokeDasharray={l.dash ? "7 5" : undefined} />
              <Label p={p} x={lx} y={l.f(lx)} color={COL[who]} anchor="middle" dx={0} dy={-10} size={13} weight={700}>
                {l.name}
              </Label>
            </g>
          );
        })}
        <line x1={p.X(x)} x2={p.X(x)} y1={p.pT} y2={p.h - p.pB} stroke={C.ink} strokeWidth={1.2} opacity={0.5} />
        {lines.map((l, k) => (
          <Dot key={k} p={p} x={x} y={l.f(x)} fill={COL[who]} />
        ))}
      </PlotSvg>
      <ul className="mt-1 space-y-0.5 text-center text-[12.5px]">
        {lines.map((l, k) => (
          <li key={l.name} className={cn(best === k && "font-semibold")}>
            si <P p={who}>{l.name}</P> : {l.formula} = {fmt(vals[k])}
            {best === k ? " ✓" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MixedSubgameExercise() {
  const [p, setP] = useState(0.5);
  const [q, setQ] = useState(0.5);

  const eq = useMemo(() => mixed2x2(A, B), []);
  const pure = useMemo(() => pureNash(FULL.map((r) => r.map((v) => [v[1], v[2]]))).eq, []);

  // paiements espérés (curseurs)
  const e2 = (row: number, qq: number) => qq * A[row][0] + (1 - qq) * A[row][1];
  const e3 = (col: number, pp: number) => pp * B[0][col] + (1 - pp) * B[1][col];
  const prob = [
    [p * q, p * (1 - q)],
    [(1 - p) * q, (1 - p) * (1 - q)],
  ];
  const expect = [0, 1, 2].map((k) => prob.flat().reduce((s, w, idx) => s + w * FULL[Math.floor(idx / 2)][idx % 2][k], 0));
  const j1Cells = FULL.flatMap((r, i) => r.map((v, j) => ({ i, j, u: v[0] }))).filter((c) => c.u !== 0);
  const j1Formula = j1Cells
    .map((c) => `${fmt(c.u)} × ${c.i === 0 ? "p" : "(1 − p)"} × ${c.j === 0 ? "q" : "(1 − q)"}`)
    .join(" + ");
  const inBetter = expect[0] > OUT[0] + EPS;
  const atEq = eq !== null && Math.abs(p - eq.p) < EPS && Math.abs(q - eq.q) < EPS;

  // contentement de chaque joueur avec sa probabilité actuelle
  const j2Indiff = Math.abs(e2(0, q) - e2(1, q)) < EPS;
  const j2Best = j2Indiff ? null : e2(0, q) > e2(1, q) ? 0 : 1;
  const j2Ok = j2Indiff || (j2Best === 0 ? p > 1 - EPS : p < EPS);
  const j3Indiff = Math.abs(e3(0, p) - e3(1, p)) < EPS;
  const j3Best = j3Indiff ? null : e3(0, p) > e3(1, p) ? 0 : 1;
  const j3Ok = j3Indiff || (j3Best === 0 ? q > 1 - EPS : q < EPS);

  const fmtP = (v: number) => fmt(v);

  return (
    <InteractiveCard
      title="Exercice du slide 42 : un sous-jeu simultané sans équilibre pur"
      subtitle={
        <>
          J1 choisit Out (8 ; 8 ; 8) ou In. Après In, J2 choisit H ou B, et J3 choisit G ou D sans voir le choix de J2
          (pointillé). Paiements (J1 ; J2 ; J3). Cherche l'ENPS avec les curseurs.
        </>
      }
      controls={
        <>
          <SliderControl label={<>p = proba que <P p={1}>J2</P> joue H</>} value={p} onChange={setP} min={0} max={1} step={0.01} format={fmtP} />
          <SliderControl label={<>q = proba que <P p={2}>J3</P> joue G</>} value={q} onChange={setQ} min={0} max={1} step={0.01} format={fmtP} />
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (eq) {
                  setP(eq.p);
                  setQ(eq.q);
                }
              }}
              className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground"
            >
              Placer l'équilibre
            </button>
            <button
              type="button"
              onClick={() => {
                setP(0.5);
                setQ(0.5);
              }}
              className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold"
            >
              Recommencer
            </button>
          </div>
        </>
      }
      footer={
        <>
          chaque joueur ne mélange que s'il est indifférent. C'est la probabilité de l'<em>autre</em> qui le rend
          indifférent : q = {eq ? frac(eq.q) : "?"} rend J2 indifférent, p = {eq ? frac(eq.p) : "?"} rend J3 indifférent.
          Ensuite seulement, J1 compare In et Out.
        </>
      }
    >
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div>
          <GameTreeSvg
            game={GAME}
            infoLabels={{ j3: "J3" }}
            boxes={[{ root: "j2", label: "Sous-jeu après In" }]}
            ariaLabel="Arbre du slide 42 : J1 choisit Out (8 ; 8 ; 8) ou In ; J2 choisit H ou B ; J3, sans voir J2, choisit G ou D : HG (16 ; 1 ; 0), HD (0 ; 0 ; 1), BG (0 ; 0 ; 3), BD (0 ; 3 ; 0)."
            maxW={380}
          />
        </div>
        <div>
          <div className="mb-1 text-center text-[13px] font-semibold">
            Le sous-jeu en forme normale : (<P p={1}>J2</P> ; <P p={2}>J3</P>)
          </div>
          <CycleMatrix p={p} q={q} />
          <p className="mt-1 text-[13px] leading-relaxed">
            Les flèches tournent en rond : dans chaque case, un joueur gagne à dévier.{" "}
            {pure.length === 0 ? (
              <strong>Aucun EN en stratégies pures</strong>
            ) : (
              <strong>{pure.length} EN pur(s)</strong>
            )}{" "}
            : il faut chercher un équilibre en stratégies mixtes (B1).
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className={cn("rounded-xl border p-2", j2Ok ? "border-emerald-300" : "border-rose-200")}>
          <div className="mb-1 text-[13px] font-semibold">
            <P p={1}>J2</P> regarde q (ce que fait J3)
          </div>
          <EUPlot
            who={1}
            xName="q"
            x={q}
            cross={eq?.q ?? null}
            lines={ROWS.map((r, i) => ({ name: r, f: (t: number) => e2(i, t), formula: lin(A[i][0], A[i][1], "q") }))}
            aria="Paiements espérés de J2 selon q : avec H, q ; avec B, 3(1 − q). Les deux droites se croisent en q = 3/4."
          />
          <p className="mt-1 text-[12.5px]">
            {j2Indiff ? (
              <>J2 est indifférent : il peut mélanger, p quelconque lui convient.</>
            ) : (
              <>
                J2 préfère <P p={1}>{ROWS[j2Best!]}</P> à coup sûr (p = {j2Best === 0 ? 1 : 0}).{" "}
                {j2Ok ? "C'est ce qu'il fait ✓" : "Il voudrait changer p ✗"}
              </>
            )}
          </p>
        </div>
        <div className={cn("rounded-xl border p-2", j3Ok ? "border-emerald-300" : "border-rose-200")}>
          <div className="mb-1 text-[13px] font-semibold">
            <P p={2}>J3</P> regarde p (ce que fait J2)
          </div>
          <EUPlot
            who={2}
            xName="p"
            x={p}
            cross={eq?.p ?? null}
            lines={COLS.map((c, j) => ({ name: c, f: (t: number) => e3(j, t), formula: lin(B[0][j], B[1][j], "p") }))}
            aria="Paiements espérés de J3 selon p : avec G, 3(1 − p) ; avec D, p. Les deux droites se croisent en p = 3/4."
          />
          <p className="mt-1 text-[12.5px]">
            {j3Indiff ? (
              <>J3 est indifférent : il peut mélanger, q quelconque lui convient.</>
            ) : (
              <>
                J3 préfère <P p={2}>{COLS[j3Best!]}</P> à coup sûr (q = {j3Best === 0 ? 1 : 0}).{" "}
                {j3Ok ? "C'est ce qu'il fait ✓" : "Il voudrait changer q ✗"}
              </>
            )}
          </p>
        </div>
      </div>

      {/* J1 : In ou Out ? */}
      <div className="mt-4 rounded-xl border bg-muted/30 p-3 text-[14px] leading-relaxed" aria-live="polite">
        <div className="font-semibold">
          <P p={0}>J1</P> : In ou Out ?
        </div>
        <p className="mt-1">
          Avec In, J1 ne gagne quelque chose que dans {j1Cells.length === 1 ? "la case" : "les cases"}{" "}
          {j1Cells.map((c) => `(${ROWS[c.i]}, ${COLS[c.j]})`).join(", ")} : u<sub>1</sub>(In) = {j1Formula} = {fmt(j1Cells[0]?.u ?? 0)} ×{" "}
          {fmt(p)} × {fmt(q)} = <strong>{fmt(expect[0])}</strong>, contre <strong>{fmt(OUT[0])}</strong> avec Out.
        </p>
        <div className="mt-2 space-y-1">
          {[
            { name: "In", v: expect[0] },
            { name: "Out", v: OUT[0] },
          ].map((r) => (
            <div key={r.name} className="grid grid-cols-[2.5rem_1fr_3rem] items-center gap-2 text-[13px]">
              <span className="font-bold" style={{ color: COL[0] }}>
                {r.name}
              </span>
              <div className="relative h-4 rounded bg-muted">
                <div className="absolute inset-y-0 left-0 rounded transition-[width] duration-300" style={{ width: `${(r.v / 16) * 100}%`, background: COL[0], opacity: r.name === "In" ? 1 : 0.45 }} />
              </div>
              <span className="text-right font-bold tabular-nums">{fmt(r.v)}</span>
            </div>
          ))}
        </div>
        {atEq && eq ? (
          <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50/70 p-2.5">
            <p>
              <strong>Équilibre du sous-jeu</strong> : p = {frac(eq.p)}, q = {frac(eq.q)}. Jeu réduit : In →{" "}
              <PayoffChip game={GAME} value={expect} />, Out → <PayoffChip game={GAME} value={OUT} />. Comme{" "}
              {fmt(expect[0])} {inBetter ? ">" : "≤"} {fmt(OUT[0])}, J1 joue {inBetter ? "In" : "Out"}.
            </p>
            <p className="mt-1 font-semibold">ENPS (slide 42) : (s*<sub>1</sub>, s*<sub>2</sub>, s*<sub>3</sub>) avec</p>
            <ul className="font-mono text-[13.5px]">
              <li>s*<sub>1</sub> = {inBetter ? "In" : "Out"}</li>
              <li>s*<sub>2</sub> = H avec proba {frac(eq.p)}</li>
              <li>s*<sub>3</sub> = G avec proba {frac(eq.q)}</li>
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Attention : ce calcul n'a de sens pour l'ENPS que si (p, q) est un équilibre du sous-jeu ({j2Ok && j3Ok ? "c'est le cas ✓" : "ce n'est pas le cas ici"}).
            Clique « Placer l'équilibre ».
          </p>
        )}
      </div>
    </InteractiveCard>
  );
}
