/*
 * PrimariesBackward — B2 § 5 · primaires puis élection présidentielle (slides 19-25).
 *
 * Tableau des préférences (slide 20) + backward induction pas à pas sur l'arbre
 * du slide 21 (feuilles = candidat élu). Les payoffs 3/2/1/0 du slide 20 sont
 * DÉDUITS des classements et servent au calcul (backwardInduction) ; le
 * « jeu réduit » remplace chaque sous-jeu résolu par le candidat élu, comme
 * aux slides 23-24. L'ENPS de la conclusion (slide 25) est construit à partir
 * des choix calculés.
 *
 * Contournement : le « jeu réduit » de BackwardInductionPlayer affiche des
 * paiements, pas le nom du candidat ; on refait donc ici un petit lecteur pas à
 * pas avec GameTreeSvg (même logique, même mode « à toi de jouer »).
 */
import { useMemo, useState, type ReactNode } from "react";
import { InteractiveCard, ChoiceChips } from "@/components/course/Interactive";
import {
  GT_COLORS,
  GameTreeSvg,
  backwardInduction,
  choicesOf,
  findNode,
  leaf,
  node,
  playPath,
  type BIStep,
  type GTGame,
  type GTNode,
  type GTNodeOrLeaf,
} from "@/chapters/shared/gametree";
import { C } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

/* ---------- préférences (slide 20), du préféré au pire ------------------ */
type Cand = "G" | "g" | "d" | "D";
const RANK: Record<"MD" | "MG" | "E", Cand[]> = {
  MD: ["D", "d", "g", "G"],
  MG: ["G", "g", "d", "D"],
  E: ["g", "d", "G", "D"],
};
/** joueurs du jeu, dans l'ordre du jeu (MD joue en premier) */
const WHO = [
  { key: "MD" as const, name: "Militant Droite", full: "militant de Droite", color: GT_COLORS[1] },
  { key: "MG" as const, name: "Militant Gauche", full: "militant de Gauche", color: GT_COLORS[0] },
  { key: "E" as const, name: "Électeur", full: "Électeur", color: C.ink },
];
/** payoff 3 si 1er choix, 2 si 2e, 1 si 3e, 0 si pire (slide 20) */
const pay = (c: Cand) => WHO.map((w) => 3 - RANK[w.key].indexOf(c));

const vote = (id: string, a: Cand, b: Cand) =>
  node(id, 2, [
    [a, leaf(`${id}${a}`, pay(a), { caption: a, hidePayoffs: true })],
    [b, leaf(`${id}${b}`, pay(b), { caption: b, hidePayoffs: true })],
  ]);

const GAME: GTGame = {
  players: WHO.map((w) => ({ name: w.name, color: w.color })),
  root: node("md", 0, [
    ["D", node("mg1", 1, [["G", vote("e1", "G", "D")], ["g", vote("e2", "g", "D")]])],
    ["d", node("mg2", 1, [["G", vote("e3", "G", "d")], ["g", vote("e4", "g", "d")]])],
  ]),
};

/** même arbre, noms courts (MD, MG, E) pour l'affichage sur téléphone */
const SHORT = WHO.map((w) => ({ name: w.key, color: w.color }));

/** candidat élu si l'on part de `n` et que chacun suit `ch` */
function winner(n: GTNodeOrLeaf, ch: Record<string, number>): string {
  const p = playPath({ players: GAME.players, root: n }, ch);
  return p.leaf?.caption ?? "?";
}
/** actions qui mènent de la racine au nœud `id` (ex. ["D", "G"]) */
function history(id: string): string[] {
  const out: string[] = [];
  const rec = (n: GTNodeOrLeaf, acc: string[]): boolean => {
    if (n.id === id) {
      out.push(...acc);
      return true;
    }
    return n.kind === "node" && n.moves.some((m) => rec(m.to, [...acc, m.action]));
  };
  rec(GAME.root, []);
  return out;
}
/** jeu réduit : chaque sous-jeu résolu (sauf la racine) devient une feuille « candidat élu » */
function reduced(solved: Set<string>, ch: Record<string, number>, players = GAME.players): GTGame {
  const rec = (n: GTNodeOrLeaf): GTNodeOrLeaf => {
    if (n.kind === "leaf") return n;
    if (solved.has(n.id) && n.id !== GAME.root.id) return leaf(n.id, [], { caption: winner(n, ch), hidePayoffs: true });
    return { ...n, moves: n.moves.map((m) => ({ action: m.action, to: rec(m.to) })) };
  };
  return { players, root: rec(GAME.root) };
}

function Who({ p, cap = false }: { p: number; cap?: boolean }) {
  const t = WHO[p].full;
  return <strong style={{ color: WHO[p].color }}>{p === 2 ? `${cap ? "L" : "l"}'${t}` : cap ? `Le ${t}` : `le ${t}`}</strong>;
}
function Cd({ c, strong = true }: { c: string; strong?: boolean }) {
  return <span className={cn("font-mono", strong && "font-bold")} style={{ color: C.violet }}>{c}</span>;
}
function Pref({ k }: { k: "MD" | "MG" | "E" }) {
  return (
    <span className="whitespace-nowrap">
      {RANK[k].map((c, i) => (
        <span key={c}>
          {i > 0 ? <span className="mx-0.5 text-muted-foreground">≻</span> : null}
          <Cd c={c} />
        </span>
      ))}
    </span>
  );
}

/* ---------- tableau des préférences -------------------------------------- */
function PrefTable({ hi }: { hi: { p: number; compare: string[]; win: string } | null }) {
  const order = [1, 0, 2]; // ordre du slide 20 : MG, MD, E
  return (
    <div className="mb-3 overflow-hidden rounded-xl border">
      <table className="w-full border-collapse text-[13px] sm:text-[14px]">
        <thead>
          <tr className="bg-muted/60 text-[12px] text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-bold">Joueur</th>
            {["1er choix", "2e", "3e", "pire"].map((r, i) => (
              <th key={r} className="px-1 py-1.5 text-center font-bold">
                {r}
                <div className="text-[11px] font-semibold">payoff {3 - i}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {order.map((p) => {
            const active = hi?.p === p;
            return (
              <tr key={p} className={cn("border-t transition-colors", active && "bg-amber-50")}>
                <td className="px-2 py-1.5 font-bold" style={{ color: WHO[p].color }}>
                  <span className="sm:hidden">{WHO[p].key}</span>
                  <span className="hidden sm:inline">
                    {WHO[p].name} ({WHO[p].key})
                  </span>
                </td>
                {RANK[WHO[p].key].map((c) => {
                  const cmp = active && hi!.compare.includes(c);
                  const win = active && hi!.win === c;
                  return (
                    <td key={c} className="px-1 py-1 text-center">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-[15px] font-bold transition-all",
                          cmp && "ring-2 ring-amber-500",
                        )}
                        style={{ color: C.violet, background: win ? "#fcd34d" : undefined }}
                      >
                        {c}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t bg-muted/30 px-2 py-1 text-[12px] text-muted-foreground">
        <Cd c="G" />, <Cd c="g" /> : candidats de Gauche · <Cd c="D" />, <Cd c="d" /> : candidats de Droite. Payoffs du
        slide 20 : seul l'ordre compte.
      </p>
    </div>
  );
}

/* ---------- composant ----------------------------------------------------- */
const LAYOUT_L = { leafGap: 52 };
const LAYOUT_S = { leafGap: 40, levelGap: 70 };
export function PrimariesBackward() {
  const steps = useMemo(() => backwardInduction(GAME), []);
  const all = useMemo(() => choicesOf(steps), [steps]);
  const [k, setK] = useState(0);
  const [view, setView] = useState<"complet" | "reduit">("complet");
  const [mode, setMode] = useState<"voir" | "deviner">("voir");
  const [guess, setGuess] = useState<{ step: number; pick: number } | null>(null);

  const done = k >= steps.length;
  const solved = steps.slice(0, k);
  const chosen = choicesOf(solved);
  const [shown, shownShort] = useMemo(() => {
    if (view !== "reduit") return [GAME, { players: SHORT, root: GAME.root }];
    const set = new Set(steps.slice(0, k).map((s) => s.nodeId));
    return [reduced(set, all), reduced(set, all, SHORT)];
  }, [view, k, steps, all]);
  const cur: BIStep | null = done ? null : steps[k];
  const guessing = mode === "deviner" && cur !== null && (!guess || guess.step !== k);
  const guessed = mode === "deviner" && cur && guess && guess.step === k ? guess.pick : null;
  const finalLeaf = done ? playPath(GAME, all).leaf : null;

  /** candidat élu au bout de chaque option du joueur courant */
  const elected = (s: BIStep) => {
    const nd = findNode(GAME.root, s.nodeId) as GTNode;
    return nd.moves.map((m) => winner(m.to, all));
  };
  const hi = cur
    ? { p: cur.player, compare: elected(cur), win: elected(cur)[cur.chosen] }
    : null;

  const eSteps = steps.filter((s) => s.player === 2);
  const explain = (s: BIStep): ReactNode => {
    const nd = findNode(GAME.root, s.nodeId) as GTNode;
    const el = elected(s);
    const h = history(s.nodeId);
    const opts = (
      <ul className="my-1 space-y-0.5">
        {nd.moves.map((m, i) => (
          <li key={m.action} className={cn(s.best.includes(i) && "font-semibold")}>
            voter{" "}
            <span style={{ color: WHO[s.player].color }} className="font-bold">
              {m.action}
            </span>{" "}
            → <Cd c={el[i]} /> est élu → payoff <strong>{s.options[i].value[s.player]}</strong> pour lui
            {s.best.includes(i) ? " ✓" : ""}
          </li>
        ))}
      </ul>
    );
    if (s.player === 2) {
      const i = eSteps.indexOf(s) + 1;
      return (
        <>
          <p>
            <strong>
              Sous-jeu final {i} / {eSteps.length} : les deux nominés sont <Cd c={nd.moves[0].action} /> et{" "}
              <Cd c={nd.moves[1].action} />
            </strong>{" "}
            (le MD a voté {h[0]}, puis le MG {h[1]}). <Who p={2} cap /> vote en dernier. S'il est rationnel (H1), il
            vote pour son nominé favori. Ses préférences : <Pref k="E" />.
          </p>
          {opts}
          <p>
            Donc <Cd c={el[s.chosen]} /> est élu président dans ce sous-jeu.
          </p>
        </>
      );
    }
    if (s.player === 1) {
      return (
        <>
          <p>
            <strong>Primaire de Gauche, après le vote {h[0]} du MD.</strong> <Who p={1} cap /> anticipe le comportement
            rationnel de l'Électeur (H2.1 : il sait que l'Électeur est rationnel). Il remplace chaque sous-jeu de
            l'Électeur par le candidat élu (« Jeu réduit », slide 23). Ses préférences : <Pref k="MG" />.
          </p>
          {opts}
          <p>
            S'il est rationnel, il vote <strong style={{ color: WHO[1].color }}>{s.options[s.chosen].action}</strong>{" "}
            lorsque <Cd c={h[0]} /> est le candidat de la Droite.
          </p>
        </>
      );
    }
    const worse = el.find((_, i) => i !== s.chosen)!;
    const fav = RANK.MD[0];
    return (
      <>
        <p>
          <strong>Primaire de Droite (nœud de départ).</strong> Anticipant les comportements rationnels du MG et de
          l'Électeur (H2.2), <Who p={0} /> ne voit plus que le jeu réduit du slide 24. Ses préférences :{" "}
          <Pref k="MD" />.
        </p>
        {opts}
        <p>
          Il vote <strong style={{ color: WHO[0].color }}>{s.options[s.chosen].action}</strong>, car il préfère que{" "}
          <Cd c={el[s.chosen]} /> soit élu plutôt que <Cd c={worse} />. Voter pour son favori <Cd c={fav} /> ferait
          élire <Cd c={worse} />, son pire candidat.
        </p>
      </>
    );
  };

  /* ---- ENPS (slide 25), construit à partir des choix calculés ---- */
  const act = (id: string) => (findNode(GAME.root, id) as GTNode).moves[all[id]].action;
  const mgNodes = ["mg1", "mg2"];
  const eNodes = ["e1", "e2", "e3", "e4"];
  const sMG = mgNodes.map((id) => `${act(id)} si ${history(id).join("")}`).join(", ");
  const sE = eNodes.map((id) => `${act(id)} si ${history(id).join("")}`).join(", ");
  const pathMG = playPath(GAME, all).ids.find((id) => id.startsWith("mg"))!;
  const mdVote = act("md");
  const mgVote = act(pathMG);
  const conclusion = (
    <>
      <p>
        <strong>
          Prédiction unique : <Cd c={finalLeaf?.caption ?? ""} /> est élu président.
        </strong>{" "}
        Ce résultat est supporté par le seul ENPS (s*<sub>MD</sub>, s*<sub>MG</sub>, s*<sub>E</sub>) :
      </p>
      <ul className="my-1 space-y-0.5 font-mono text-[13.5px]">
        <li>
          s*<sub>MD</sub> = {mdVote}
        </li>
        <li>
          s*<sub>MG</sub> = {sMG}
        </li>
        <li>
          s*<sub>E</sub> = {sE}
        </li>
      </ul>
      <p className="mt-1">
        Aucun militant ne vote pour son favori : le MD vote <strong>{mdVote}</strong> (pas {RANK.MD[0]}), et le MG, sur le
        chemin joué, vote <strong>{mgVote}</strong> (pas {RANK.MG[0]}). Chacun anticipe que voter pour son favori ferait
        élire un candidat qu'il apprécie moins.
      </p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Une stratégie dit quoi faire à <em>chaque</em> nœud où le joueur doit potentiellement choisir : 2 nœuds pour le
        MG, 4 pour l'Électeur, même s'ils ne sont pas atteints.
      </p>
    </>
  );

  return (
    <InteractiveCard
      title="Primaires puis élection : on remonte l'arbre (backward induction)"
      subtitle={
        <>
          Slides 19-25. La Droite vote d'abord (MD choisit D ou d), puis la Gauche (MG choisit G ou g en ayant vu le
          vote de la Droite), puis l'Électeur choisit entre les deux nominés. Sous chaque feuille : le candidat élu.
        </>
      }
      controls={
        <>
          <ChoiceChips
            label="Affichage"
            value={view}
            onChange={setView}
            options={[
              { value: "complet", label: "Arbre complet" },
              { value: "reduit", label: "Jeu réduit" },
            ]}
          />
          <ChoiceChips
            label="Mode"
            value={mode}
            onChange={(v) => {
              setMode(v);
              setGuess(null);
            }}
            options={[
              { value: "voir", label: "Voir le raisonnement" },
              { value: "deviner", label: "À toi de jouer" },
            ]}
          />
        </>
      }
      footer={
        <>
          chaque joueur ne regarde que son tableau de préférences, mais il doit d'abord savoir qui sera élu au bout de
          chaque branche. L'hypothèse grandit en remontant : H1 pour l'Électeur, H2.1 pour le MG, H2.2 pour le MD.
          Avec « Jeu réduit », chaque sous-jeu résolu devient le candidat élu, comme aux slides 23 et 24.
        </>
      }
    >
      <PrefTable hi={hi} />

      <div className="hidden sm:block">
        <GameTreeSvg
          game={shown}
          layout={LAYOUT_L}
          chosen={chosen}
          dimOthers
          showPath={done}
          focus={cur?.nodeId}
          focusLabel="Sous-jeu étudié"
          pick={guessing && cur ? { nodeId: cur.nodeId, onPick: (p) => setGuess({ step: k, pick: p }) } : undefined}
          ariaLabel="Arbre des primaires et de l'élection : le militant de Droite vote D ou d, le militant de Gauche G ou g, puis l'Électeur choisit entre les deux nominés."
          maxW={480}
        />
      </div>
      <div className="sm:hidden">
        <GameTreeSvg
          game={shownShort}
          layout={LAYOUT_S}
          chosen={chosen}
          dimOthers
          showPath={done}
          focus={cur?.nodeId}
          focusLabel="Sous-jeu"
          pick={guessing && cur ? { nodeId: cur.nodeId, onPick: (p) => setGuess({ step: k, pick: p }) } : undefined}
          ariaLabel="Arbre des primaires et de l'élection : le militant de Droite vote D ou d, le militant de Gauche G ou g, puis l'Électeur choisit entre les deux nominés."
          maxW={400}
        />
      </div>

      <div className="mt-3 rounded-xl border bg-muted/30 px-3 py-2.5 text-[14px] leading-relaxed sm:px-4" aria-live="polite">
        {cur ? (
          <>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
              <span>
                Étape {k + 1} / {steps.length}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Hypothèse : {cur.hyp}</span>
            </div>
            {guessing ? (
              <p>
                <strong>À toi :</strong> clique sur la branche que choisit <Who p={cur.player} /> dans le sous-jeu
                encadré (aide-toi du tableau : sa ligne est surlignée).
              </p>
            ) : (
              <>
                {guessed !== null ? (
                  <p className={cn("mb-1 font-semibold", cur.best.includes(guessed) ? "text-emerald-700" : "text-rose-700")}>
                    {cur.best.includes(guessed)
                      ? `✓ Bien vu : ${cur.options[guessed].action}.`
                      : `✗ Pas tout à fait : ${cur.options[guessed].action} fait élire un candidat moins apprécié. Regarde la comparaison.`}
                  </p>
                ) : null}
                {explain(cur)}
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-1 text-[12.5px] font-semibold text-emerald-700">Jeu entièrement résolu ✓</div>
            {conclusion}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setGuess(null);
            setK((v) => Math.max(0, v - 1));
          }}
          disabled={k === 0}
          className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold disabled:opacity-40"
        >
          ◀ Retour
        </button>
        <button
          type="button"
          onClick={() => {
            setGuess(null);
            setK((v) => Math.min(steps.length, v + 1));
          }}
          disabled={done || guessing}
          className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
        >
          Étape suivante ▶
        </button>
        <button
          type="button"
          onClick={() => {
            setGuess(null);
            setK(steps.length);
          }}
          disabled={done}
          className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold disabled:opacity-40"
        >
          Tout résoudre
        </button>
        <button
          type="button"
          onClick={() => {
            setGuess(null);
            setK(0);
          }}
          className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold"
        >
          Recommencer
        </button>
      </div>
    </InteractiveCard>
  );
}
