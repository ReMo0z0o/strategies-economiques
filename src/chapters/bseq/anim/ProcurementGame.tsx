/*
 * ProcurementGame — B2 § 7-8 · le jeu du marché public (slides 34-41).
 *
 * Cinq étapes : (1) l'arbre et l'ensemble d'information de la firme 2 ;
 * (2) les sous-jeux (après U ; après D = sous-jeu simultané ; pourquoi les
 * nœuds de la firme 2 ne commencent pas de sous-jeu) ; (3) sous-jeu après U ;
 * (4) sous-jeu après D en matrice 2×2 : (B, B) équilibre en stratégies
 * dominantes ; (5) jeu réduit ⇒ D et ENPS du slide 41. Panneau : S_F, S_1, S_2.
 * Ensembles de stratégies (enumerateStrategies), dominances, équilibre
 * (pureNash) et choix CALCULÉS à partir des paiements.
 */
import { useMemo, useState, type ReactNode } from "react";
import { InteractiveCard } from "@/components/course/Interactive";
import {
  GT_COLORS,
  GameTreeSvg,
  PayoffChip,
  enumerateStrategies,
  leaf,
  node,
  pureNash,
  type GTGame,
  type GameTreeSvgProps,
  type GTNode,
  type GTStrategy,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const COL = [GT_COLORS[0], GT_COLORS[1], GT_COLORS[2]];
const GAME: GTGame = {
  players: [
    { name: "Fonctionnaire", color: COL[0] },
    { name: "Firme 1", color: COL[1] },
    { name: "Firme 2", color: COL[2] },
  ],
  root: node("f", 0, [
    ["Une", node("u", 1, [["H", leaf("uh", [0, 6, 0])], ["B", leaf("ub", [2, 4, 0])]])],
    [
      "Deux",
      node("d", 1, [
        ["H", node("d2h", 2, [["H", leaf("hh", [0, 3, 3])], ["B", leaf("hb", [2, 0, 4])]], { info: "f2" })],
        ["B", node("d2b", 2, [["H", leaf("bh", [2, 4, 0])], ["B", leaf("bb", [2, 2, 2])]], { info: "f2" })],
      ]),
    ],
  ]),
};
const ROOT = GAME.root as GTNode;
const NODE_U = ROOT.moves[0].to as GTNode;
const NODE_D = ROOT.moves[1].to as GTNode;
/** lettre de stratégie du fonctionnaire (slide 38) : U = une offre, D = deux offres */
const LETTER: Record<string, string> = { Une: "U", Deux: "D" };
const PRIME = ["", "′", "″", "‴"];

const STEPS = ["L'arbre", "Les sous-jeux", "Sous-jeu après U", "Sous-jeu après D", "Jeu réduit et ENPS"];

function P({ p, children }: { p: number; children: ReactNode }) {
  return (
    <strong style={{ color: COL[p] }} className="whitespace-nowrap">
      {children}
    </strong>
  );
}
/** stratégie de la firme 1 écrite comme au slide 38 : « H si U, B si D » */
const f1Plan = (s: GTStrategy) => `${s.actions[0]} si U, ${s.actions[1]} si D`;

/** action strictement dominante d'un joueur dans une bimatrice (0 = ligne, 1 = colonne), ou -1 */
function strictlyDominant(cells: number[][][], who: 0 | 1): number {
  const n = who === 0 ? cells.length : cells[0].length;
  const m = who === 0 ? cells[0].length : cells.length;
  const pay = (a: number, o: number) => (who === 0 ? cells[a][o][0] : cells[o][a][1]);
  for (let a = 0; a < n; a++) {
    let ok = true;
    for (let b = 0; b < n && ok; b++) if (b !== a) for (let o = 0; o < m && ok; o++) if (!(pay(a, o) > pay(b, o))) ok = false;
    if (ok) return a;
  }
  return -1;
}

export function ProcurementGame() {
  const [step, setStep] = useState(0);

  const calc = useMemo(() => {
    // stratégies (slide 38)
    const SF = enumerateStrategies(GAME, 0);
    const S1 = enumerateStrategies(GAME, 1);
    const S2 = enumerateStrategies(GAME, 2);
    // sous-jeu après U : la firme 1 choisit seule
    const uPay = NODE_U.moves.map((m) => (m.to.kind === "leaf" ? m.to.payoffs : []));
    const uBest = uPay[0][1] >= uPay[1][1] ? 0 : 1;
    // sous-jeu après D : matrice firme 1 (lignes) × firme 2 (colonnes), paiements complets
    const full = NODE_D.moves.map((r) => (r.to as GTNode).moves.map((c) => (c.to.kind === "leaf" ? c.to.payoffs : [])));
    const cells = full.map((row) => row.map((v) => [v[1], v[2]]));
    const d1 = strictlyDominant(cells, 0);
    const d2 = strictlyDominant(cells, 1);
    const ne = pureNash(cells).eq;
    const dVal = full[d1][d2];
    // jeu réduit
    const red = [uPay[uBest], dVal];
    const fBest = red[0][0] >= red[1][0] ? 0 : 1;
    const s1Star = S1.findIndex((s) => s.actions[0] === NODE_U.moves[uBest].action && s.actions[1] === NODE_D.moves[d1].action);
    return { SF, S1, S2, uPay, uBest, full, cells, d1, d2, ne, dVal, red, fBest, s1Star };
  }, []);
  const { SF, S1, S2, uPay, uBest, full, cells, d1, d2, ne, dVal, red, fBest, s1Star } = calc;
  const actU = NODE_U.moves.map((m) => m.action);
  const actD = NODE_D.moves.map((m) => m.action);
  const done = step === 4;

  const tree: Partial<GameTreeSvgProps> =
    step === 0
      ? {}
      : step === 1
        ? {
            boxes: [
              { root: "u", label: "Sous-jeu suivant U" },
              { root: "d", label: "Sous-jeu suivant D", color: "#a16207" },
            ],
          }
        : step === 2
          ? { focus: "u", focusLabel: "Sous-jeu suivant U", chosen: { u: uBest }, dimOthers: true }
          : step === 3
            ? { focus: "d", focusLabel: "Sous-jeu suivant D", chosen: { d: d1, d2h: d2, d2b: d2 }, dimOthers: true }
            : { collapsed: { u: red[0], d: red[1] }, chosen: { f: fBest }, dimOthers: true, showPath: true };

  return (
    <InteractiveCard
      title="Le marché public : backward induction avec un sous-jeu simultané"
      subtitle={
        <>
          Slides 34-41. Le fonctionnaire demande une offre (U, branche « Une ») à la firme 1, ou deux offres (D, branche
          « Deux ») aux firmes 1 et 2, qui répondent alors en même temps. Prix haut H = 8, bas B = 6, coût 2, utilité 8.
          Paiements (Fonctionnaire ; Firme 1 ; Firme 2).
        </>
      }
      controls={
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="mb-1.5 text-[13px] font-semibold">Étapes</div>
          <div className="flex flex-wrap gap-1.5">
            {STEPS.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setStep(i)}
                aria-pressed={step === i}
                className={cn(
                  "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                  step === i ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {i + 1}. {t}
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        <>
          la méthode est la même qu'en information parfaite : identifier les derniers sous-jeux, trouver leurs EN,
          les remplacer par leurs payoffs, recommencer jusqu'au nœud initial. Seule nouveauté : un dernier sous-jeu peut
          être simultané, et on le résout alors comme un jeu en forme normale (chapitre B1).
        </>
      }
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="order-1">
          <GameTreeSvg
            game={GAME}
            {...tree}
            infoLabels={{ f2: "Firme 2" }}
            ariaLabel="Marché public : le fonctionnaire demande une offre (Une) ou deux (Deux) ; la firme 1 choisit H ou B ; avec deux offres, la firme 2 choisit H ou B sans voir le prix de la firme 1 (pointillé)."
            maxW={470}
          />

        </div>

        {/* ensembles de stratégies (slide 38) */}
        <aside className="order-3 rounded-xl border p-3 text-[13.5px] leading-relaxed lg:order-2">
          <div className="mb-1 font-bold">Ensembles de stratégies (slide 38)</div>
          <p className="text-[12.5px] text-muted-foreground">
            Une stratégie dit quelle action prendre à <em>chaque ensemble d'information</em> du joueur.
          </p>
          <div className="mt-2">
            <P p={0}>Fonctionnaire</P> (1 nœud) : S<sub>F</sub> = {"{"}
            {SF.map((s, i) => (
              <span key={s.label}>
                {i > 0 ? ", " : ""}
                <span className={cn(done && i === fBest && "rounded bg-amber-200 px-0.5")}>{LETTER[s.actions[0]]}</span>
              </span>
            ))}
            {"}"}
          </div>
          <div className="mt-1.5">
            <P p={1}>Firme 1</P> (2 nœuds, 2 ensembles d'information) : {S1.length} stratégies
            <ul className="mt-0.5 space-y-0.5 pl-1 font-mono text-[13px]">
              {S1.map((s, i) => (
                <li key={s.label} className={cn("rounded px-1", done && i === s1Star && "bg-amber-200")}>
                  s{PRIME[i]}
                  <sub>1</sub> = {f1Plan(s)}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-1.5">
            <P p={2}>Firme 2</P> (2 nœuds, mais 1 seul ensemble d'information) : S<sub>2</sub> = {"{"}
            {S2.map((s, i) => (
              <span key={s.label}>
                {i > 0 ? ", " : ""}
                <span className={cn(done && i === d2 && "rounded bg-amber-200 px-0.5")}>{s.actions[0]}</span>
              </span>
            ))}
            {"}"}
          </div>
          <p className="mt-2 text-[12.5px] text-muted-foreground">
            La firme 2 ne peut pas jouer « H si la firme 1 a joué H, B sinon » : elle ne voit pas le prix de la firme 1.
            {done ? " Surligné : l'ENPS." : ""}
          </p>
        </aside>
        {/* explications de l'étape */}
        <div className="order-2 rounded-xl border bg-muted/30 px-3 py-2.5 text-[14px] leading-relaxed lg:order-3 lg:col-span-2" aria-live="polite">
          <div className="mb-1 text-[12.5px] font-semibold text-muted-foreground">
            Étape {step + 1} / {STEPS.length}
          </div>
          {step === 0 ? (
            <>
              <p>
                <strong>Information complète, mais imparfaite.</strong> Tous connaissent la structure du jeu, les
                stratégies et les payoffs de tous. Mais, au moment de choisir son prix, <P p={2}>la firme 2</P> ignore
                le prix choisi par <P p={1}>la firme 1</P>.
              </p>
              <p className="mt-1">
                Le <strong>pointillé</strong> relie les deux nœuds de la firme 2 : c'est son{" "}
                <strong>ensemble d'information</strong>. Elle ne sait pas auquel des deux nœuds elle se trouve. Les deux
                nœuds permettent donc les mêmes actions (H ou B).
              </p>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <p>
                <strong>Un sous-jeu commence à un nœud de décision dont l'ensemble d'information ne contient qu'un seul
                nœud.</strong>
              </p>
              <ul className="my-1 list-disc space-y-0.5 pl-5">
                <li>
                  Nœud de la firme 1 après U : un seul nœud ⇒ <strong>sous-jeu suivant U</strong>.
                </li>
                <li>
                  Nœud de la firme 1 après D : un seul nœud ⇒ <strong>sous-jeu suivant D</strong>. Il contient la
                  décision des deux firmes, prises sans se voir : c'est un <strong>sous-jeu simultané</strong>.
                </li>
                <li>
                  Nœuds de la firme 2 : leur ensemble d'information en contient <strong>deux</strong> ⇒ aucun sous-jeu
                  ne commence là. Si on coupait l'arbre en l'un d'eux, la firme 2 « saurait » ce qu'a fait la firme 1,
                  ce qui est faux.
                </li>
              </ul>
              <p>(Le jeu entier est aussi un sous-jeu : celui qui commence au nœud initial.)</p>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <p>
                <strong>Sous-jeu suivant U</strong> : seule <P p={1}>la firme 1</P> joue, et elle le sait.
              </p>
              <ul className="my-1 space-y-0.5">
                {actU.map((a, i) => (
                  <li key={a} className={cn(i === uBest && "font-semibold")}>
                    <P p={1}>{a}</P> → <PayoffChip game={GAME} value={uPay[i]} />, soit <strong>{fmt(uPay[i][1])}</strong> pour
                    elle{i === uBest ? " ✓" : ""}
                  </li>
                ))}
              </ul>
              <p>
                La stratégie (de sous-jeu) <P p={1}>{actU[1 - uBest]}</P> est dominée par <P p={1}>{actU[uBest]}</P> :
                seule sollicitée, la firme 1 demande le prix haut.
              </p>
            </>
          ) : null}
          {step === 3 ? (
            <>
              <p>
                <strong>Sous-jeu suivant D</strong> : les firmes choisissent en même temps. On l'écrit en forme normale
                (firme 1 en lignes, firme 2 en colonnes) :
              </p>
              <SubMatrix full={full} d1={d1} d2={d2} rows={actD} />
              <ul className="my-1 space-y-0.5 text-[13.5px]">
                <li>
                  <P p={1}>Firme 1</P> : {actD[d1]} rapporte plus que {actD[1 - d1]} quoi que fasse la firme 2 (
                  {cells[0].map((_, j) => `${fmt(cells[d1][j][0])} > ${fmt(cells[1 - d1][j][0])}`).join(" et ")}).
                </li>
                <li>
                  <P p={2}>Firme 2</P> : {actD[d2]} rapporte plus que {actD[1 - d2]} quoi que fasse la firme 1 (
                  {cells.map((_, i) => `${fmt(cells[i][d2][1])} > ${fmt(cells[i][1 - d2][1])}`).join(" et ")}).
                </li>
              </ul>
              <p>
                Chaque firme a une stratégie strictement dominante : ({actD[d1]}, {actD[d2]}) est un{" "}
                <strong>ESD</strong> (équilibre en stratégies dominantes)
                {ne.length === 1 ? ", donc aussi le seul EN du sous-jeu" : ""}. Issue : <PayoffChip game={GAME} value={dVal} />. La concurrence fait baisser
                les prix.
              </p>
            </>
          ) : null}
          {step === 4 ? (
            <>
              <p>
                <strong>Jeu réduit</strong> : chaque sous-jeu est remplacé par le profil de payoffs qu'il génère.{" "}
                <P p={0}>Le fonctionnaire</P> compare :
              </p>
              <ul className="my-1 space-y-0.5">
                {ROOT.moves.map((m, i) => (
                  <li key={m.action} className={cn(i === fBest && "font-semibold")}>
                    {LETTER[m.action]} ({m.action}) → <PayoffChip game={GAME} value={red[i]} />, soit{" "}
                    <strong>{fmt(red[i][0])}</strong> pour lui{i === fBest ? " ✓" : ""}
                  </li>
                ))}
              </ul>
              <p>
                La stratégie {LETTER[ROOT.moves[1 - fBest].action]} est dominée par {LETTER[ROOT.moves[fBest].action]}.
                Seul ENPS : (s*<sub>F</sub>, s*<sub>1</sub>, s*<sub>2</sub>) avec
              </p>
              <ul className="my-1 space-y-0.5 font-mono text-[13.5px]">
                <li>
                  s*<sub>F</sub> = {LETTER[ROOT.moves[fBest].action]}
                </li>
                <li>
                  s*<sub>1</sub> = {f1Plan(S1[s1Star])}
                </li>
                <li>
                  s*<sub>2</sub> = {actD[d2]}
                </li>
              </ul>
              <p className="text-[13px] text-muted-foreground">
                Piège : s*<sub>1</sub> dit aussi quoi faire après U ({actU[uBest]}), même si U n'est pas joué.
              </p>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold disabled:opacity-40"
        >
          ◀ Retour
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={done}
          className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
        >
          Étape suivante ▶
        </button>
      </div>
    </InteractiveCard>
  );
}

/** matrice 2×2 du sous-jeu simultané, aux couleurs de l'arbre ; paiement du fonctionnaire en petit */
function SubMatrix({ full, d1, d2, rows }: { full: number[][][]; d1: number; d2: number; rows: string[] }) {
  return (
    <div className="my-2 overflow-x-auto">
      <table className="mx-auto border-collapse text-center text-[14px]">
        <thead>
          <tr>
            <th className="pb-1 pr-2 text-right text-[12.5px] font-bold" style={{ color: COL[1] }}>
              Firme 1 ↓
            </th>
            <th colSpan={2} className="pb-1 text-[12.5px] font-bold" style={{ color: COL[2] }}>
              Firme 2
            </th>
          </tr>
          <tr>
            <th />
            {rows.map((c, j) => (
              <th key={c} className={cn("px-3 pb-1 font-bold", j !== d2 && "line-through opacity-50")} style={{ color: COL[2] }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r}>
              <th className={cn("pr-2 text-right font-bold", i !== d1 && "line-through opacity-50")} style={{ color: COL[1] }}>
                {r}
              </th>
              {rows.map((_, j) => {
                const v = full[i][j];
                const eq = i === d1 && j === d2;
                return (
                  <td
                    key={j}
                    className={cn("border px-3 py-1.5", eq ? "border-2 border-amber-500 bg-amber-100" : "bg-background")}
                  >
                    <div className="font-bold tabular-nums">
                      (<span style={{ color: COL[1] }}>{fmt(v[1])}</span> ; <span style={{ color: COL[2] }}>{fmt(v[2])}</span>)
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      fonct. <span style={{ color: COL[0] }}>{fmt(v[0])}</span>
                    </div>
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
