/*
 * EntryGameExplorer — B2 § 1 · le jeu de l'entrée, profil par profil
 * (slides 3, 5, 6, 10 et 11).
 *
 * L'arbre (forme étendue) et la forme normale côte à côte. Pour le profil
 * choisi : le plan de chaque firme est surligné dans l'arbre (y compris le
 * choix prévu par la firme 2 quand son nœud n'est pas atteint), l'issue est
 * entourée, la case de la matrice est surlignée et les deux déviations
 * unilatérales sont repérées. Deux verdicts CALCULÉS à partir des paiements :
 *  - « EN ? » : chaque firme gagnerait-elle à changer seule de stratégie ?
 *  - « ENPS ? » : le profil forme-t-il aussi un EN dans le sous-jeu qui
 *    commence au nœud de la firme 2 (définition du slide 11) ?
 * Pour l'EN qui n'est pas un ENPS, la menace non crédible est décortiquée
 * comme au slide 6 (sans ses coquilles : « firme 2 », « Entrer »).
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
  type GTGame,
  type GTNode,
  type GTStrategy,
  type NormalForm2,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Le jeu (slide 3) et les calculs                                     */
/* ------------------------------------------------------------------ */

const GAME: GTGame = {
  players: [
    { name: "Firme 1", color: GT_COLORS[0] },
    { name: "Firme 2", color: GT_COLORS[1] },
  ],
  root: node("r", 0, [
    ["Entrer", node("f2", 1, [["Accommoder", leaf("a", [2, 1])], ["Guerre", leaf("g", [0, 0])]])],
    ["Passer", leaf("p", [1, 2])],
  ]),
};
const COL = [GT_COLORS[0], GT_COLORS[1]];
const NAMES = ["la firme 1", "la firme 2"];

type Choice = Record<string, number>;

/** « de » ou « d' » devant un mot (« au lieu d'Entrer ») */
const de = (w: string) => (/^[aeiouyéèêàh]/i.test(w) ? "d'" : "de ");

/** initiale(s) d'une stratégie : « Entrer » → « E » */
const short = (s: GTStrategy) => s.actions.map((a) => a[0]).join("");

interface Dev {
  player: 0 | 1;
  from: GTStrategy;
  to: GTStrategy;
  cur: number;
  alt: number;
}
interface SubCheck {
  node: GTNode;
  nf: NormalForm2;
  i: number;
  j: number;
  /** meilleure déviation unilatérale de chaque joueur qui a un choix dans le sous-jeu */
  devs: Dev[];
  /** le profil (restreint au sous-jeu) est-il un EN de ce sous-jeu ? */
  ok: boolean;
}

/** Le profil `choice`, restreint au sous-jeu qui commence en `n`, est-il un EN de ce sous-jeu ? */
function checkSubgame(n: GTNode, choice: Choice): SubCheck {
  const nf = normalForm2({ players: GAME.players, root: n });
  const fits = (s: GTStrategy) => Object.entries(s.choice).every(([id, k]) => choice[id] === k);
  const i = nf.rows.findIndex(fits);
  const j = nf.cols.findIndex(fits);
  const devs: Dev[] = [];
  let b = -1;
  nf.rows.forEach((_, r) => {
    if (r !== i && (b < 0 || nf.cells[r][j][0] > nf.cells[b][j][0])) b = r;
  });
  if (b >= 0) devs.push({ player: 0, from: nf.rows[i], to: nf.rows[b], cur: nf.cells[i][j][0], alt: nf.cells[b][j][0] });
  b = -1;
  nf.cols.forEach((_, c) => {
    if (c !== j && (b < 0 || nf.cells[i][c][1] > nf.cells[i][b][1])) b = c;
  });
  if (b >= 0) devs.push({ player: 1, from: nf.cols[j], to: nf.cols[b], cur: nf.cells[i][j][1], alt: nf.cells[i][b][1] });
  return { node: n, nf, i, j, devs, ok: devs.every((d) => d.alt <= d.cur + 1e-12) };
}

/** nœuds de décision, du dernier sous-jeu au jeu complet (ordre de la backward induction) */
const DECISION_NODES = (() => {
  const order = new Map(preorder(GAME.root).map((n, k) => [n.id, k]));
  return (preorder(GAME.root).filter((n) => n.kind === "node") as GTNode[]).sort(
    (a, b) => decisionLevel(a) - decisionLevel(b) || order.get(a.id)! - order.get(b.id)!,
  );
})();

/** action qui mène au nœud `id` depuis son parent (ex. f2 ← « Entrer ») */
function incomingAction(id: string): string | null {
  for (const n of preorder(GAME.root)) {
    if (n.kind !== "node") continue;
    const m = n.moves.find((mv) => mv.to.id === id);
    if (m) return m.action;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Petits affichages                                                   */
/* ------------------------------------------------------------------ */

function Pay({ v }: { v: number[] }) {
  return (
    <span className="whitespace-nowrap font-bold tabular-nums">
      (<span style={{ color: COL[0] }}>{fmt(v[0])}</span> ; <span style={{ color: COL[1] }}>{fmt(v[1])}</span>)
    </span>
  );
}
function Firm({ p, cap = false }: { p: 0 | 1; cap?: boolean }) {
  const t = cap ? `Firme ${p + 1}` : NAMES[p];
  return <strong style={{ color: COL[p] }}>{t}</strong>;
}
function Act({ p, children }: { p: 0 | 1; children: ReactNode }) {
  return (
    <span className="font-semibold" style={{ color: COL[p] }}>
      {children}
    </span>
  );
}
function Verdict({ ok, title, children }: { ok: boolean; title: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border-2 px-3 py-2.5 text-[14px] leading-relaxed",
        ok ? "border-emerald-500/50 bg-emerald-500/5" : "border-rose-400/50 bg-rose-500/5",
      )}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-bold uppercase tracking-wide text-muted-foreground">{title}</span>
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

/** Forme normale 2 × 2 : case du profil + cases atteintes par une déviation unilatérale. */
function EntryMatrix({ nf, i, j, onPick }: { nf: NormalForm2; i: number; j: number; onPick: (i: number, j: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-[14px]">
        <thead>
          <tr>
            <th className="p-1 text-left align-bottom text-[11.5px] font-bold uppercase leading-tight tracking-wide" style={{ color: COL[0] }}>
              Firme 1 ↓
            </th>
            <th colSpan={nf.cols.length} className="p-1 text-center text-[11.5px] font-bold uppercase tracking-wide" style={{ color: COL[1] }}>
              Firme 2 →
            </th>
          </tr>
          <tr>
            <th className="p-1" />
            {nf.cols.map((c) => (
              <th key={c.label} className="px-1 py-1 text-center text-[13px] font-semibold" style={{ color: COL[1] }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nf.rows.map((r, ri) => (
            <tr key={r.label}>
              <th className="px-1.5 py-1 text-right text-[13px] font-semibold" style={{ color: COL[0] }}>
                {r.label}
              </th>
              {nf.cols.map((c, ci) => {
                const cur = ri === i && ci === j;
                const dev1 = ri !== i && ci === j;
                const dev2 = ri === i && ci !== j;
                const v = nf.cells[ri][ci];
                return (
                  <td key={c.label} className="p-1">
                    <button
                      type="button"
                      onClick={() => onPick(ri, ci)}
                      aria-label={`Choisir le profil (${short(r)}, ${short(c)})`}
                      aria-pressed={cur}
                      className={cn(
                        "block w-[5.6rem] rounded-lg border-2 px-1 py-1.5 text-center tabular-nums transition-all duration-300 sm:w-24",
                        cur && "border-primary bg-accent shadow-[0_0_0_3px_oklch(0.51_0.19_272_/_0.18)]",
                        (dev1 || dev2) && "border-dashed bg-background",
                        !cur && !dev1 && !dev2 && "border-border bg-background opacity-55",
                      )}
                      style={dev1 ? { borderColor: COL[0] } : dev2 ? { borderColor: COL[1] } : undefined}
                    >
                      <span className={cn("text-[15px]", dev1 && "text-[17px]")} style={{ color: COL[0], fontWeight: dev1 ? 800 : 600 }}>
                        {fmt(v[0])}
                      </span>
                      <span className="text-muted-foreground"> ; </span>
                      <span className={cn("text-[15px]", dev2 && "text-[17px]")} style={{ color: COL[1], fontWeight: dev2 ? 800 : 600 }}>
                        {fmt(v[1])}
                      </span>
                      <span
                        className="mt-0.5 block text-[11.5px] font-semibold leading-tight"
                        style={{ color: dev1 ? COL[0] : dev2 ? COL[1] : undefined }}
                      >
                        {cur ? "profil choisi" : dev1 ? "si F1 dévie" : dev2 ? "si F2 dévie" : " "}
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

/** Mini-légende de l'arbre (traits). */
function TreeLegend() {
  const sw = (el: ReactNode) => (
    <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden className="inline-block shrink-0">
      {el}
    </svg>
  );
  return (
    <ul className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
      <li className="flex items-center gap-1.5">
        {sw(<line x1="2" y1="6" x2="24" y2="6" stroke={COL[1]} strokeWidth="3.6" strokeLinecap="round" />)}
        plan prévu
      </li>
      <li className="flex items-center gap-1.5">
        {sw(
          <>
            <line x1="2" y1="6" x2="24" y2="6" stroke="#facc15" strokeWidth="10" strokeLinecap="round" opacity="0.55" />
            <line x1="2" y1="6" x2="24" y2="6" stroke={COL[0]} strokeWidth="3" strokeLinecap="round" />
          </>,
        )}
        chemin joué
      </li>
      <li className="flex items-center gap-1.5">
        {sw(<circle cx="13" cy="6" r="5" fill="none" stroke="#d97706" strokeWidth="2.2" />)}
        issue
      </li>
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Le composant                                                        */
/* ------------------------------------------------------------------ */

export function EntryGameExplorer() {
  const nf = useMemo(() => normalForm2(GAME), []);
  // profils dans l'ordre de la mission : (E, A), (P, G), (E, G), (P, A)
  const chips = useMemo(
    () =>
      ([[0, 0], [1, 1], [0, 1], [1, 0]] as const).map(([i, j]) => ({
        value: `${i}-${j}`,
        label: `(${short(nf.rows[i])}, ${short(nf.cols[j])})`,
      })),
    [nf],
  );
  const [sel, setSel] = useState("1-1");
  const [i, j] = sel.split("-").map(Number);
  const row = nf.rows[i];
  const col = nf.cols[j];
  const choice: Choice = { ...row.choice, ...col.choice };
  const path = playPath(GAME, choice);
  const outcome = path.leaf?.payoffs ?? [];
  const prof = `(${short(row)}, ${short(col)})`;

  // EN : jeu complet ; ENPS : EN dans chaque sous-jeu (le jeu complet compris)
  const checks = DECISION_NODES.map((n) => checkSubgame(n, choice));
  const whole = checks[checks.length - 1];
  const proper = checks.slice(0, -1);
  const isEN = whole.ok;
  const isSPNE = checks.every((c) => c.ok);

  // ENPS par backward induction (pour la conclusion de la menace)
  const bi = useMemo(() => choicesOf(backwardInduction(GAME)), []);
  const spneRow = nf.rows.findIndex((s) => Object.entries(s.choice).every(([id, k]) => bi[id] === k));
  const spneCol = nf.cols.findIndex((s) => Object.entries(s.choice).every(([id, k]) => bi[id] === k));
  const spneName = `(${short(nf.rows[spneRow])}, ${short(nf.cols[spneCol])})`;

  const f2 = DECISION_NODES.find((n) => n.player === 1)!;
  const f2Reached = path.ids.includes(f2.id);
  const trigger = incomingAction(f2.id) ?? "";
  const planF2 = f2.moves[col.choice[f2.id]].action;

  return (
    <InteractiveCard
      title="Le jeu de l'entrée : un profil, deux lectures (arbre et forme normale)"
      subtitle={
        <>
          Slides 3, 5, 6, 10 et 11. Un profil de stratégies = le plan de la firme 1 ET le plan de la firme 2.
          Choisis-en un (ou clique une case de la matrice) : l'arbre montre ce qui se passe, la matrice donne la
          même issue, et les verdicts sont calculés à partir des paiements.
        </>
      }
      controls={
        <ChoiceChips
          className="sm:col-span-2 lg:col-span-3"
          label="Profil (stratégie de la firme 1, stratégie de la firme 2)"
          value={sel}
          onChange={setSel}
          options={chips}
        />
      }
      footer={
        <>
          (E, A) et (P, G) sont tous deux des EN de la forme normale (théorème du slide 5). Mais la forme normale
          « oublie » que la firme 2 joue <em>après</em> avoir vu la firme 1. Dans l'arbre, on voit que Guerre ne
          serait jamais choisie une fois la firme 1 entrée : (P, G) repose sur une menace non crédible. Seul (E, A)
          est un ENPS.
        </>
      }
    >
      <p className="mb-3 text-center text-[14px] leading-relaxed">
        <strong>{prof}</strong> : <Firm p={0} /> joue <Act p={0}>{row.label}</Act> ; <Firm p={1} /> prévoit{" "}
        « si la firme 1 joue {trigger}, je joue <Act p={1}>{planF2}</Act> ». Issue : <Pay v={outcome} />.
      </p>

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <div className="min-w-0">
          <div className="mb-1 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground">
            L'arbre (forme étendue)
          </div>
          <GameTreeSvg
            game={GAME}
            chosen={choice}
            dimOthers
            showPath
            focus={f2.id}
            focusLabel="Sous-jeu"
            ariaLabel={`Arbre du jeu de l'entrée. Profil ${prof} : la firme 1 joue ${row.label}, la firme 2 prévoit ${planF2} si la firme 1 entre. Issue ${outcome.join(" ; ")}.`}
            maxW={330}
            className="overflow-visible"
          />
          <TreeLegend />
          {!f2Reached ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[13px] leading-snug text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Le nœud de la firme 2 n'est pas atteint : son plan ({planF2}) n'est jamais exécuté. Il fait pourtant
              partie de sa stratégie, et c'est lui qui pèse sur le choix de la firme 1.
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground">
            La forme normale (slide 5)
          </div>
          <EntryMatrix nf={nf} i={i} j={j} onPick={(a, b) => setSel(`${a}-${b}`)} />
          <p className="mx-auto mt-2 max-w-xs text-center text-[12.5px] leading-snug text-muted-foreground">
            Pointillé rouge : la case atteinte si la firme 1 change seule de stratégie ; pointillé bleu : si la firme
            2 change seule.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2" aria-live="polite">
        <Verdict ok={isEN} title="EN ?">
          <ul className="space-y-1">
            {whole.devs.map((d) => (
              <li key={d.player}>
                <Firm p={d.player} cap /> : avec <Act p={d.player}>{d.to.label}</Act> au lieu {de(d.from.label)}
                <Act p={d.player}>{d.from.label}</Act> (l'autre gardant son plan), elle obtiendrait{" "}
                <strong>{fmt(d.alt)}</strong> au lieu de <strong>{fmt(d.cur)}</strong>{" "}
                {d.alt > d.cur ? (
                  <span className="font-semibold text-rose-700">→ elle gagnerait {fmt(d.alt - d.cur)} à dévier.</span>
                ) : d.alt < d.cur ? (
                  <span className="text-emerald-700">→ elle y perdrait {fmt(d.cur - d.alt)}.</span>
                ) : (
                  <span className="text-emerald-700">
                    → elle n'y gagne rien{d.player === 1 && !f2Reached ? " (son nœud n'est pas atteint : son plan ne change pas l'issue)" : ""}.
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-1 font-semibold">
            {isEN
              ? `Aucune firme ne gagne à dévier seule : ${prof} est un EN.`
              : `Une firme gagne à dévier seule : ${prof} n'est pas un EN.`}
          </p>
        </Verdict>

        <Verdict ok={isSPNE} title="ENPS ?">
          {proper.map((c) => {
            const p = c.node.player as 0 | 1;
            const vals = c.node.moves.map((m) => ({ a: m.action, v: m.to.kind === "leaf" ? m.to.payoffs[p] : Number.NaN }));
            const planned = c.node.moves[choice[c.node.id]].action;
            const best = Math.max(...vals.map((x) => x.v));
            return (
              <p key={c.node.id}>
                Sous-jeu qui commence au nœud de la <Firm p={p} cap /> (après {incomingAction(c.node.id)}) : seule la
                firme {p + 1} y joue, un EN de ce sous-jeu est donc son meilleur choix.{" "}
                {vals.map((x, k) => (
                  <span key={x.a}>
                    {k > 0 ? " ; " : ""}
                    <Act p={p}>{x.a}</Act> → <strong>{fmt(x.v)}</strong>
                  </span>
                ))}
                . Son plan, <Act p={p}>{planned}</Act>,{" "}
                {c.ok ? (
                  <span className="font-semibold text-emerald-700">est bien une meilleure réponse ✓</span>
                ) : (
                  <span className="font-semibold text-rose-700">
                    n'en est pas une ({fmt(vals[choice[c.node.id]].v)} &lt; {fmt(best)}) ✗
                  </span>
                )}
              </p>
            );
          })}
          <p className="mt-1 font-semibold">
            {isSPNE
              ? `EN du jeu complet et EN du sous-jeu : ${prof} est un ENPS.`
              : !isEN && proper.every((c) => c.ok)
                ? `Le plan de la firme 2 est crédible, mais ${prof} n'est déjà pas un EN : pas d'ENPS.`
                : !isEN
                  ? `${prof} n'est ni un EN, ni un EN du sous-jeu : pas d'ENPS.`
                  : `${prof} est un EN, mais pas un EN dans le sous-jeu : il n'est pas parfait en sous-jeux.`}
          </p>
        </Verdict>
      </div>

      {isEN && !isSPNE ? <ThreatBox nf={nf} i={i} j={j} f2={f2} spneName={spneName} spneRow={spneRow} /> : null}
    </InteractiveCard>
  );
}

/** La menace non crédible décortiquée (slide 6), chiffres tirés de la forme normale et de l'arbre. */
function ThreatBox({ nf, i, j, f2, spneName, spneRow }: { nf: NormalForm2; i: number; j: number; f2: GTNode; spneName: string; spneRow: number }) {
  const other = i === 0 ? 1 : 0;
  const planK = nf.cols[j].choice[f2.id];
  const sub = f2.moves.map((m) => (m.to.kind === "leaf" ? m.to.payoffs : []));
  const bestK = sub.reduce((b, v, k) => (v[1] > sub[b][1] ? k : b), 0);
  const trigger = incomingAction(f2.id);
  const enterPay = sub[bestK][0];
  const stayPay = nf.cells[i][j][0];
  return (
    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-3 text-[14px] leading-relaxed sm:px-4 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="mb-1 font-bold">La menace de guerre, décortiquée (slide 6)</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          Pour <Firm p={0} />, <Act p={0}>{nf.rows[i].label}</Act> est la meilleure réponse à (la menace d'une){" "}
          <Act p={1}>{f2.moves[planK].action}</Act> : face à {f2.moves[planK].action}, {nf.rows[i].label} rapporte{" "}
          <strong>{fmt(nf.cells[i][j][0])}</strong> et {nf.rows[other].label} seulement{" "}
          <strong>{fmt(nf.cells[other][j][0])}</strong>. C'est pour cela que ({short(nf.rows[i])},{" "}
          {short(nf.cols[j])}) est un EN.
        </li>
        <li>
          Mais <Firm p={1} /> observe l'action de la firme 1 avant de jouer. Si la firme 1 jouait {trigger}, une
          firme 2 rationnelle (H1) comparerait <Act p={1}>{f2.moves[planK].action}</Act> (
          <strong>{fmt(sub[planK][1])}</strong>) et <Act p={1}>{f2.moves[bestK].action}</Act> (
          <strong>{fmt(sub[bestK][1])}</strong>) : elle choisirait {f2.moves[bestK].action}. Elle ne lancera pas
          une {f2.moves[planK].action}.
        </li>
        <li>
          Si la firme 1 pense que la firme 2 est rationnelle (H2), elle ne s'attend donc pas à une{" "}
          {f2.moves[planK].action} : la menace n'est <strong>pas crédible</strong>. En jouant{" "}
          {nf.rows[spneRow].label}, elle obtient <strong>{fmt(enterPay)}</strong> plutôt que{" "}
          <strong>{fmt(stayPay)}</strong>.
        </li>
      </ol>
      <p className="mt-1.5">
        Conclusion du slide 6 : sur les deux EN, seul <strong>{spneName}</strong> sera observé si les firmes
        satisfont aux hypothèses H1 et H2.
      </p>
    </div>
  );
}
