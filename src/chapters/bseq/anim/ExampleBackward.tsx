/*
 * ExampleBackward — B2 § 4 · backward induction sur le jeu des slides 14-18,
 * avec le raisonnement du slide 17 mot à mot : H1 en x₂, H2.1 en x₁, H2.2 en
 * x₀. Les phrases suivent le slide, mais chaque action et chaque payoff cité
 * est tiré des étapes CALCULÉES (backwardInduction) ; la chaîne « le joueur 1
 * pense que le joueur 2 pense que… » est construite à partir des joueurs qui
 * jouent après le nœud étudié. Conclusion : (DG, E) est le seul des trois EN
 * (normalForm2 + pureNash) parfait en sous-jeux, et son résultat est dominé
 * par celui de (CH, F) (remarque d'efficacité du slide 16).
 */
import { useMemo, type ReactNode } from "react";
import {
  BackwardInductionPlayer,
  GT_COLORS,
  backwardInduction,
  choicesOf,
  findNode,
  leaf,
  node,
  normalForm2,
  playPath,
  pureNash,
  type BIStep,
  type GTGame,
  type GTNode,
  type GTStrategy,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";
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
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const nice = (s: string) => s.replace(/\d/g, (d) => SUB[Number(d)]);
const fits = (s: GTStrategy, c: Record<string, number>) =>
  Object.entries(s.choice).every(([id, k]) => c[id] === k);

function A({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span className="font-semibold" style={{ color: COL[p] }}>
      {children}
    </span>
  );
}
function Pay({ v }: { v: number[] }) {
  return (
    <span className="whitespace-nowrap font-bold tabular-nums">
      (<span style={{ color: COL[0] }}>{fmt(v[0])}</span> ;{" "}
      <span style={{ color: COL[1] }}>{fmt(v[1])}</span>)
    </span>
  );
}
const J = (p: number) => `le joueur ${p + 1}`;

export function ExampleBackward() {
  const steps = useMemo(() => backwardInduction(GAME), []);
  const bi = useMemo(() => choicesOf(steps), [steps]);
  const nf = useMemo(() => normalForm2(GAME), []);
  const eq = useMemo(() => pureNash(nf.cells).eq, [nf]);

  const prof = (i: number, j: number) => `(${nf.rows[i].label}, ${nf.cols[j].label})`;
  const sr = nf.rows.findIndex((s) => fits(s, bi));
  const sc = nf.cols.findIndex((s) => fits(s, bi));
  const spne = prof(sr, sc);
  const spneOut = nf.cells[sr][sc];
  // EN dont le résultat domine (au sens de Pareto) celui de l'ENPS (slide 16)
  const better = eq.find(([i, j]) => {
    const v = nf.cells[i][j];
    return v.every((x, k) => x >= spneOut[k]) && v.some((x, k) => x > spneOut[k]);
  });
  // le plan non crédible de cet EN : le nœud le plus profond où il s'écarte de la backward induction
  const betterChoice = better
    ? { ...nf.rows[better[0]].choice, ...nf.cols[better[1]].choice }
    : null;
  const offStep = betterChoice ? steps.find((s) => betterChoice[s.nodeId] !== s.chosen) : undefined;

  /** joueurs qui choisissent après l'action `k` du nœud `id`, en suivant la backward induction */
  const chainAfter = (id: string, k: number) => {
    const n = findNode(GAME.root, id) as GTNode;
    const out: Array<{ player: number; action: string }> = [];
    let cur = n.moves[k].to;
    while (cur.kind === "node") {
      const c = bi[cur.id];
      out.push({ player: cur.player, action: cur.moves[c].action });
      cur = cur.moves[c].to;
    }
    return out;
  };

  const explain = (s: BIStep) => {
    const n = findNode(GAME.root, s.nodeId) as GTNode;
    const where = nice(n.name ?? "");
    const me = s.player;
    const chosen = s.options[s.chosen];
    if (s.level === 0) {
      return (
        <>
          <p>
            « Dans le sous-jeu débutant au nœud <em>{where}</em>, si {J(me)} est rationnel (H1), il
            jouera <A p={me}>{chosen.action}</A>. »
          </p>
          <Compare s={s} />
        </>
      );
    }
    // action qui mène au sous-jeu déjà résolu (« continuer ») et la chaîne des joueurs qui suivent
    const kc = n.moves.findIndex((m) => m.to.kind === "node");
    const cont = s.options[kc];
    const chain = chainAfter(n.id, kc);
    const nested = [...chain.map((c) => J(c.player))];
    const belief =
      nested.slice(0, -1).reduce((acc, who) => `${acc}${who} pense que `, "") +
      `${nested[nested.length - 1]} est rationnel`;
    const others = s.options.filter((_, k) => k !== kc);
    const initial = s.nodeId === GAME.root.id;
    return (
      <>
        <p>
          « {initial ? <>Au nœud initial </> : <>Dans le sous-jeu débutant au nœud </>}
          <em>{where}</em>, si {J(me)} pense que {belief} ({s.hyp}), alors {J(me)} anticipe que
          jouer <A p={me}>{cont.action}</A> lui rapportera un payoff de{" "}
          <strong>{fmt(cont.value[me])}</strong> (vu que{" "}
          {chain.map((c, k) => (
            <span key={k}>
              {k === 0 ? (
                <>
                  {J(c.player)} fera alors <A p={c.player}>{c.action}</A>
                </>
              ) : (
                <>
                  {" "}
                  et qu'ensuite {c.player === chain[0].player
                    ? "il"
                    : `il [${J(c.player)}]`} fera <A p={c.player}>{c.action}</A>
                </>
              )}
            </span>
          ))}
          ).
        </p>
        <p className="mt-1">
          Étant donné cette anticipation, si {J(me)} est rationnel, il fera{" "}
          {s.chosen === kc ? (
            <>
              <A p={me}>{cont.action}</A> plutôt que{" "}
              {others.map((o, k) => (
                <span key={o.action}>
                  {k > 0 ? ", " : ""}
                  <A p={me}>{o.action}</A> (qui amène un payoff de seulement{" "}
                  <strong>{fmt(o.value[me])}</strong>)
                </span>
              ))}
            </>
          ) : (
            <>
              <A p={me}>{chosen.action}</A> (qui amène un payoff de{" "}
              <strong>{fmt(chosen.value[me])}</strong>) plutôt que <A p={me}>{cont.action}</A>
            </>
          )}
          . »
        </p>
        <Compare s={s} />
      </>
    );
  };

  return (
    <div className="[&_svg[role=img]]:overflow-visible">
      <BackwardInductionPlayer
        game={GAME}
        title="Backward induction pas à pas : le jeu des slides 14 à 18"
        subtitle={
          <>
            Le raisonnement du slide 17, nœud par nœud, du dernier sous-jeu (x₂) au nœud initial
            (x₀). Les citations sont celles du slide ; les chiffres sont recalculés à partir des
            paiements.
          </>
        }
        explain={explain}
        conclusion={
          <>
            <p>
              ⇒{" "}
              <strong>
                Le seul des {eq.length === 3 ? "trois" : eq.length} EN à être parfait en sous-jeux
                est {spne}.
              </strong>{" "}
              Les EN de la forme normale étaient {eq.map(([i, j]) => prof(i, j)).join(", ")} ; la
              backward induction ne garde que {spne}, de résultat <Pay v={spneOut} />.
            </p>
            {better && offStep ? (
              <p className="mt-1">
                Remarque d'efficacité (slide 16) : le résultat de {spne}, <Pay v={spneOut} />, est
                dominé par celui de {prof(better[0], better[1])},{" "}
                <Pay v={nf.cells[better[0]][better[1]]} /> : les deux joueurs y gagneraient. Mais{" "}
                {prof(better[0], better[1])} repose sur un plan non crédible : en{" "}
                {nice((findNode(GAME.root, offStep.nodeId) as GTNode).name ?? "")},{" "}
                <A p={offStep.player}>{offStep.options[betterChoice![offStep.nodeId]].action}</A>{" "}
                rapporterait{" "}
                {fmt(offStep.options[betterChoice![offStep.nodeId]].value[offStep.player])} au
                joueur {offStep.player + 1}, contre{" "}
                {fmt(offStep.options[offStep.chosen].value[offStep.player])} avec{" "}
                <A p={offStep.player}>{offStep.options[offStep.chosen].action}</A>. Arrivé là, il ne
                le suivrait pas.
              </p>
            ) : null}
          </>
        }
        footer={
          <>
            l'hypothèse s'allonge d'un niveau à chaque nœud remonté : H1 en x₂, H2.1 en x₁ (« J2
            pense que J1 est rationnel »), H2.2 en x₀ (« J1 pense que J2 pense que J1 est rationnel
            »). À l'examen, écris chaque étape ainsi (nœud, hypothèse, comparaison chiffrée, choix),
            puis donne l'ENPS comme un <em>profil</em> de stratégies, {spne}, et pas seulement son
            résultat.
          </>
        }
        ariaLabel={`Arbre du jeu des slides 14 à 18 résolu par backward induction : ENPS ${spne}, résultat ${spneOut.join(" ; ")}.`}
        maxW={380}
      />
    </div>
  );
}

/** Rappel chiffré des options comparées à l'étape (calculé). */
function Compare({ s }: { s: BIStep }) {
  return (
    <ul className="mt-1.5 space-y-0.5 rounded-lg bg-background/70 px-2.5 py-1.5 text-[13.5px]">
      {s.options.map((o, i) => (
        <li key={o.action} className={cn(s.best.includes(i) && "font-semibold")}>
          <A p={s.player}>{o.action}</A> → <Pay v={o.value} />, soit{" "}
          <strong>{fmt(o.value[s.player])}</strong> pour le joueur {s.player + 1}
          {s.best.includes(i) ? " ✓" : ""}
        </li>
      ))}
    </ul>
  );
}
