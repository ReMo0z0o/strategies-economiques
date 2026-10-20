/*
 * EntryBackward — B2 § 1 · backward induction sur le jeu de l'entrée (slide 6).
 *
 * Le lecteur pas à pas de la boîte à outils (BackwardInductionPlayer) avec les
 * textes du slide 6 : d'abord la firme 2 dans son sous-jeu (H1), puis la
 * firme 1 au nœud de départ (H2, ici son premier niveau H2.1). Tous les
 * chiffres, les deux EN de la forme normale et l'ENPS sont CALCULÉS
 * (backwardInduction, normalForm2, pureNash). Les coquilles du slide 6
 * (« la firme 1 lance une Guerre », « Rentrer ») ne sont pas recopiées.
 */
import { useMemo, type ReactNode } from "react";
import {
  BackwardInductionPlayer,
  GT_COLORS,
  backwardInduction,
  choicesOf,
  leaf,
  node,
  normalForm2,
  playPath,
  pureNash,
  type BIStep,
  type GTGame,
  type GTStrategy,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const GAME: GTGame = {
  players: [
    { name: "Firme 1", color: GT_COLORS[0] },
    { name: "Firme 2", color: GT_COLORS[1] },
  ],
  root: node("r", 0, [
    [
      "Entrer",
      node("f2", 1, [
        ["Accommoder", leaf("a", [2, 1])],
        ["Guerre", leaf("g", [0, 0])],
      ]),
    ],
    ["Passer", leaf("p", [1, 2])],
  ]),
};
const COL = [GT_COLORS[0], GT_COLORS[1]];

const short = (s: GTStrategy) => s.actions.map((a) => a[0]).join("");

function Pay({ v }: { v: number[] }) {
  return (
    <span className="whitespace-nowrap font-bold tabular-nums">
      (<span style={{ color: COL[0] }}>{fmt(v[0])}</span> ;{" "}
      <span style={{ color: COL[1] }}>{fmt(v[1])}</span>)
    </span>
  );
}
function Act({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span className="font-semibold" style={{ color: COL[p] }}>
      {children}
    </span>
  );
}
function Firm({ p, cap = false }: { p: number; cap?: boolean }) {
  return (
    <strong style={{ color: COL[p] }}>
      {cap ? "La" : "la"} firme {p + 1}
    </strong>
  );
}

/** Les options comparées par le joueur de l'étape (chiffres tirés de la résolution). */
function Options({ s }: { s: BIStep }) {
  return (
    <ul className="my-1 space-y-0.5">
      {s.options.map((o, i) => (
        <li key={o.action} className={cn(s.best.includes(i) && "font-semibold")}>
          <Act p={s.player}>{o.action}</Act> → <Pay v={o.value} />, soit{" "}
          <strong>{fmt(o.value[s.player])}</strong> pour elle
          {s.best.includes(i) ? " ✓" : ""}
        </li>
      ))}
    </ul>
  );
}

export function EntryBackward() {
  const steps = useMemo(() => backwardInduction(GAME), []);
  const nf = useMemo(() => normalForm2(GAME), []);
  const eq = useMemo(() => pureNash(nf.cells).eq, [nf]);
  const bi = choicesOf(steps);
  const fits = (s: GTStrategy) => Object.entries(s.choice).every(([id, k]) => bi[id] === k);
  const sr = nf.rows.findIndex(fits);
  const sc = nf.cols.findIndex(fits);
  const spne = `(${short(nf.rows[sr])}, ${short(nf.cols[sc])})`;
  const enList = eq.map(([i, j]) => `(${short(nf.rows[i])}, ${short(nf.cols[j])})`);
  const others = enList.filter((e) => e !== spne);
  const outcome = playPath(GAME, bi).leaf?.payoffs ?? [];

  const explain = (s: BIStep) => {
    const chosen = s.options[s.chosen];
    const rejected = s.options.filter((_, i) => !s.best.includes(i)).map((o) => o.action);
    if (s.level === 0) {
      // nœud de la firme 2 : action qui y mène depuis la racine
      const via =
        GAME.root.kind === "node" ? GAME.root.moves.find((m) => m.to.id === s.nodeId)?.action : "";
      return (
        <>
          <p>
            <strong>Sous-jeu qui commence au nœud de la firme 2.</strong> <Firm p={0} cap /> a joué{" "}
            {via}, et <Firm p={1} /> l'a observé avant de jouer. Si la firme 2 est rationnelle (H1),
            elle compare :
          </p>
          <Options s={s} />
          <p>
            Elle ne va donc pas lancer une <Act p={1}>{rejected.join(", ")}</Act> si la firme 1
            décide d'{via} : <Act p={1}>{chosen.action}</Act> est la meilleure réponse à {via}{" "}
            (slide 6).
          </p>
        </>
      );
    }
    const f2Step = steps.find((x) => x.level === 0);
    const threat = f2Step
      ? f2Step.options
          .filter((_, i) => !f2Step.best.includes(i))
          .map((o) => o.action)
          .join(", ")
      : "";
    const reply = f2Step ? f2Step.options[f2Step.chosen].action : "";
    return (
      <>
        <p>
          <strong>Nœud de départ.</strong> Si <Firm p={0} /> pense que la firme 2 est rationnelle
          (H2 ; ici son premier niveau, H2.1), elle ne s'attend pas à ce que la firme 2 fasse une{" "}
          <Act p={1}>{threat}</Act> : elle anticipe <Act p={1}>{reply}</Act>. Elle compare donc :
        </p>
        <Options s={s} />
        <p>
          Elle joue <Act p={0}>{chosen.action}</Act> ({fmt(chosen.value[0])} &gt;{" "}
          {s.options
            .filter((_, i) => i !== s.chosen)
            .map((o) => fmt(o.value[0]))
            .join(", ")}
          ) : la menace de {threat.toLowerCase()} n'est <strong>pas crédible</strong>.
        </p>
      </>
    );
  };

  // contournement : la boîte à outils sous-estime la largeur des libellés en gras
  // (« Accommoder » choisi) ; on laisse le SVG déborder visiblement de sa boîte.
  return (
    <div className="[&_svg[role=img]]:overflow-visible">
      <BackwardInductionPlayer
        game={GAME}
        title="Le jeu de l'entrée résolu à rebours (backward induction)"
        subtitle={
          <>
            Slide 6. On part de la fin du jeu et on remonte : à chaque étape, le sous-jeu étudié est
            encadré. Clique « Étape suivante », ou choisis « À toi de jouer » pour deviner chaque
            choix.
          </>
        }
        explain={explain}
        conclusion={
          <>
            <p>
              <strong>Seul {spne} survit.</strong> La forme normale avait {enList.length} EN :{" "}
              {enList.join(" et ")}. Le raisonnement à rebours (H1 pour la firme 2, puis H2 pour la
              firme 1) n'en garde qu'un : la firme 1 joue <Act p={0}>{nf.rows[sr].label}</Act>, la
              firme 2 <Act p={1}>{nf.cols[sc].label}</Act>, issue <Pay v={outcome} />. C'est l'ENPS
              du jeu.
            </p>
            {others.length ? (
              <p className="mt-1">
                {others.join(", ")} reposait sur une menace non crédible : la firme 2 ne mettrait
                jamais sa menace à exécution une fois la firme 1 entrée. Conclusion du slide 6 : sur
                les deux EN, seul {spne} sera observé si les firmes satisfont aux hypothèses H1 et
                H2.
              </p>
            ) : null}
          </>
        }
        footer={
          <>
            l'hypothèse grandit d'une étape à l'autre. Pour prédire le choix de la firme 2, il
            suffit qu'elle soit rationnelle (H1). Pour prédire celui de la firme 1, il faut en plus
            qu'elle sache que la firme 2 est rationnelle (H2). Avec « Jeu réduit », le sous-jeu
            résolu est remplacé par son issue : la firme 1 ne compare plus que deux nombres.
          </>
        }
        ariaLabel="Arbre du jeu de l'entrée résolu par backward induction : la firme 2 accommoderait, donc la firme 1 entre."
        maxW={360}
      />
    </div>
  );
}
