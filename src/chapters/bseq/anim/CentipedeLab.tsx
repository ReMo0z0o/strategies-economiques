/*
 * CentipedeLab — B2 § 6 · le jeu du centipède (slides 31-33).
 *
 * 1) Backward induction pas à pas sur le centipède en « peigne »
 *    (BackwardInductionPlayer), avec à chaque étape l'hypothèse H1, H2.1, …
 *    et, aux nœuds concernés, ce qu'a fait la classe (slides 31-33).
 * 2) « En classe » : le même arbre avec les pourcentages du labo aux bons
 *    nœuds, et la comparaison issue de l'ENPS / issue si tout le monde passe.
 * Choix et issues CALCULÉS (backwardInduction, playPath) ; seuls les
 * pourcentages 15 % / 85 % viennent des slides.
 */
import { useEffect, useMemo, useState } from "react";
import { InteractiveCard, ChoiceChips } from "@/components/course/Interactive";
import {
  BackwardInductionPlayer,
  GT_COLORS,
  GameTreeSvg,
  PayoffChip,
  backwardInduction,
  choicesOf,
  findNode,
  leaf,
  node,
  playPath,
  preorder,
  type BIStep,
  type GTGame,
  type GTNode,
  type GTNodeOrLeaf,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";

const PLAYERS = [
  { name: "J1", color: GT_COLORS[0] },
  { name: "j2", color: GT_COLORS[1] },
];
/** payoffs du slide 31 : arrêt à chaque nœud, puis (8 ; 6) si tout le monde passe */
const STOPS: number[][] = [
  [2, 0],
  [1, 3],
  [4, 2],
  [3, 5],
  [6, 4],
  [5, 7],
];
const END = [8, 6];
const NAMES = ["A1", "a1", "A2", "a2", "A3", "a3"];
const PASS = ["P1", "p1", "P2", "p2", "P3", "p3"];

/** pourcentages observés (slides 31-33), par action */
const LAB: Record<string, string> = {
  A1: "15 %",
  A3: "85 %",
  P3: "15 %",
  a3: "85 %",
  p3: "15 %",
};

function build(lab: boolean): GTGame {
  // P3 n'a pas de feuille : son pourcentage (complément de A3) est donné dans la légende
  const cap = (a: string) => (lab && LAB[a] ? { caption: LAB[a] } : {});
  const label = (a: string) => a;
  let next: GTNodeOrLeaf = leaf("l7", END, cap(PASS[PASS.length - 1]));
  for (let i = STOPS.length - 1; i >= 0; i--) {
    next = node(`n${i + 1}`, i % 2, [
      [label(NAMES[i]), leaf(`l${i + 1}`, STOPS[i], cap(NAMES[i]))],
      [label(PASS[i]), next],
    ]);
  }
  return { players: PLAYERS, root: next };
}
const GAME = build(false);
/** même jeu, avec la part de la classe sous les feuilles */
const LAB_GAME = build(true);
const LAYOUT = { orientation: "comb" as const, leafGap: 64, levelGap: 74 };
const LAYOUT_N = { orientation: "comb" as const, leafGap: 46, levelGap: 66 };
const LAB_LAYOUT = { orientation: "comb" as const, leafGap: 84, levelGap: 78 };
const LAB_LAYOUT_N = { orientation: "comb" as const, leafGap: 48, levelGap: 70 };

/** écran étroit (téléphone) : arbre resserré pour rester lisible */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

function Act({ p, a }: { p: number; a: string }) {
  return <strong style={{ color: PLAYERS[p].color }}>{a}</strong>;
}

export function CentipedeLab() {
  const steps = useMemo(() => backwardInduction(GAME), []);
  const all = choicesOf(steps);
  const enps = playPath(GAME, all).leaf!;
  const passAll = Object.fromEntries(
    preorder(GAME.root)
      .filter((n): n is GTNode => n.kind === "node")
      .map((n) => [n.id, 1]),
  );
  const [path, setPath] = useState<"enps" | "passe">("enps");
  const narrow = useNarrow();

  // issues successives le long du jeu (arrêt au nœud i, puis fin)
  const outcomes = [...STOPS, END];
  const sums = outcomes.map((o) => o[0] + o[1]);
  // gain d'arrêter plutôt que de passer (sous-jeux résolus), s'il est le même partout
  const gains = steps.map((s) => s.options[0].value[s.player] - s.options[1].value[s.player]);
  const gain = gains.every((g) => Math.abs(g - gains[0]) < 1e-9) ? gains[0] : null;

  const explain = (s: BIStep, idx: number) => {
    const nd = findNode(GAME.root, s.nodeId) as GTNode;
    const [stop, pass] = s.options;
    const pos = Number(s.nodeId.slice(1));
    const last = idx === 0;
    return (
      <>
        <p>
          {last ? (
            <>
              <strong>Dernier sous-jeu</strong> : <Act p={s.player} a={PLAYERS[s.player].name} /> choisit entre arrêter et
              passer, et le jeu s'arrête.{" "}
            </>
          ) : (
            <>
              <strong>
                {pos === 1 ? "Nœud initial" : `${pos}e décision`}
              </strong>{" "}
              : <Act p={s.player} a={PLAYERS[s.player].name} /> sait (hypothèse {s.hyp}) ce qui se passera s'il passe : son
              adversaire arrêtera au coup suivant.{" "}
            </>
          )}
          Il compare :
        </p>
        <ul className="my-1 space-y-0.5">
          <li className={s.chosen === 0 ? "font-semibold" : undefined}>
            arrêter (<Act p={s.player} a={nd.moves[0].action} />) → <PayoffChip game={GAME} value={stop.value} />, soit{" "}
            <strong>{fmt(stop.value[s.player])}</strong> pour lui{s.best.includes(0) ? " ✓" : ""}
          </li>
          <li className={s.chosen === 1 ? "font-semibold" : undefined}>
            passer (<Act p={s.player} a={nd.moves[1].action} />) → <PayoffChip game={GAME} value={pass.value} />, soit{" "}
            <strong>{fmt(pass.value[s.player])}</strong> pour lui{s.best.includes(1) ? " ✓" : ""}
          </li>
        </ul>
        {s.nodeId === "n6" ? (
          <p className="mt-1 rounded-lg bg-sky-50 px-2 py-1 text-[13px]">
            <strong>En classe</strong> (slide 31) : parmi ceux qui ont choisi p3 ou a3, {LAB.p3} ont choisi p3 (donc{" "}
            {LAB.a3} a3). Un fort pourcentage est rationnel ici ; les autres privilégient peut-être la réciprocité.
          </p>
        ) : null}
        {s.nodeId === "n5" ? (
          <p className="mt-1 rounded-lg bg-sky-50 px-2 py-1 text-[13px]">
            <strong>En classe</strong> (slide 32) : parmi ceux qui ont choisi P3 ou A3, {LAB.A3} ont choisi A3. H2.1 semble
            proche d'être satisfaite.
          </p>
        ) : null}
        {s.nodeId === "n1" ? (
          <p className="mt-1 rounded-lg bg-sky-50 px-2 py-1 text-[13px]">
            <strong>En classe</strong> (slide 33) : seulement {LAB.A1} ont choisi A1, c'est-à-dire arrêté dès que
            possible.
          </p>
        ) : null}
      </>
    );
  };

  return (
    <>
      <BackwardInductionPlayer
        game={GAME}
        layout={narrow ? LAYOUT_N : LAYOUT}
        title="Le centipède résolu à rebours"
        subtitle={
          <>
            Slides 31-32. À chaque nœud, le joueur arrête (A, a : on descend) ou passe le jeu à l'autre (P, p : on avance
            vers la droite). Paiements (J1 ; j2). On part du dernier nœud.
          </>
        }
        explain={explain}
        conclusion={
          <>
            <p>
              En itérant la backward induction jusqu'au nœud initial, le seul ENPS est tel que <strong>J1 choisit A1</strong>{" "}
              dès le nœud initial : issue <PayoffChip game={GAME} value={enps.payoffs} />.
            </p>
            <p className="mt-1">
              C'est rationnel si la connaissance réciproque de la rationalité est complète (jusqu'à {steps[steps.length - 1].hyp}{" "}
              ici), mais très <strong>inefficace</strong> : si tout le monde passait, l'issue serait{" "}
              <PayoffChip game={GAME} value={END} />, mieux pour les deux.
            </p>
          </>
        }
        footer={
          <>
            l'hypothèse nécessaire grandit d'un niveau à chaque nœud remonté : H1 au dernier nœud, puis H2.1, H2.2… jusqu'à{" "}
            {steps[steps.length - 1].hyp} au nœud initial. Si l'on anticipe que l'adversaire arrêtera dès qu'on lui passe le
            jeu, on a intérêt à arrêter tout de suite.
          </>
        }
        ariaLabel="Centipède : six nœuds alternant J1 et j2 ; arrêter donne successivement (2 ; 0), (1 ; 3), (4 ; 2), (3 ; 5), (6 ; 4), (5 ; 7) ; passer partout donne (8 ; 6)."
        maxW={520}
      />

      <InteractiveCard
        title="Le centipède en classe : ENPS ou « tout le monde passe » ?"
        subtitle="Slides 31-33. Les pourcentages du premier round sont écrits sur les branches concernées."
        controls={
          <ChoiceChips
            label="Chemin surligné"
            value={path}
            onChange={setPath}
            options={[
              { value: "enps", label: "ENPS" },
              { value: "passe", label: "Tout le monde passe" },
            ]}
          />
        }
        footer={
          <>
            les payoffs augmentent à mesure que les joueurs « passent » le jeu à leur adversaire : la somme des deux
            payoffs vaut {sums.map((v) => fmt(v)).join(" → ")}.{" "}
            {gain !== null ? (
              <>
                Mais, à chaque nœud, celui qui joue gagne {fmt(gain)} de plus en arrêtant qu'en passant à un adversaire
                qui arrêtera : c'est ce qui détruit la coopération.
              </>
            ) : null}
          </>
        }
      >
        <GameTreeSvg
          game={LAB_GAME}
          layout={narrow ? LAB_LAYOUT_N : LAB_LAYOUT}
          chosen={path === "enps" ? { [GAME.root.id]: all[GAME.root.id] } : passAll}
          showPath
          ariaLabel="Centipède avec les choix de la classe : A1 15 %, A3 85 % contre P3 15 %, a3 85 % contre p3 15 %."
          maxW={620}
        />
        <p className="mt-1 text-center text-[12.5px] text-muted-foreground">
          En violet : part de la classe qui a choisi cette action. A1 : {LAB.A1} ; A3 : {LAB.A3} contre P3 : {LAB.P3} ;
          a3 : {LAB.a3} contre p3 : {LAB.p3}.
        </p>
        <div className="mt-3 grid gap-2 text-[13.5px] leading-relaxed sm:grid-cols-2">
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3">
            <div className="font-bold">
              ENPS : <PayoffChip game={GAME} value={enps.payoffs} />
            </div>
            <p className="mt-1">
              Seulement {LAB.A1} de la classe ont arrêté dès A1. Et A1 est la stratégie qui rapportait <strong>le moins</strong>{" "}
              de points au joueur 1 au premier round (slide 33) : face à des adversaires qui passent, arrêter tôt ne paie
              pas.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3">
            <div className="font-bold">
              Tout le monde passe : <PayoffChip game={GAME} value={END} />
            </div>
            <p className="mt-1">
              J1 gagne {fmt(END[0] - enps.payoffs[0])} de plus et j2 {fmt(END[1] - enps.payoffs[1])} de plus qu'à l'ENPS.
              J1 doit arbitrer entre passer le jeu le plus loin possible et arrêter juste avant que l'adversaire n'arrête.
            </p>
          </div>
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Comme dans « devine 2/3 de la moyenne » (B1) : si tu penses que ton adversaire ne satisfera pas H1 et H2, tu as
          intérêt à ne pas jouer ta stratégie d'équilibre.
        </p>
      </InteractiveCard>
    </>
  );
}
