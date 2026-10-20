/*
 * TreeAnatomy — B2 § 2 · anatomie d'un arbre de jeu (slides 8, 9 et 10).
 *
 * On repère, un élément à la fois, ce que contient l'arbre du jeu (forme
 * étendue) : nœud de départ, nœud(s) intermédiaire(s), nœuds finaux, arêtes
 * (= actions) et sous-jeux. Sous la figure : la définition du slide (« arêtes »
 * et non « arrêtes ») et sa lecture sur le jeu affiché, avec les comptes
 * CALCULÉS sur l'arbre. Jeu par défaut : le jeu de l'entrée (slides 8-10) ;
 * le jeu du § 4 (slide 14) est proposé pour s'exercer (deux sous-jeux
 * emboîtés en plus du jeu complet).
 */
import { useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard } from "@/components/course/Interactive";
import {
  GameTreeSvg,
  GT_COLORS,
  leaf,
  node,
  preorder,
  type GTGame,
  type GTNode,
  type GTNodeOrLeaf,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";

interface Game {
  chip: string;
  title: string;
  game: GTGame;
  /** « la firme 1 », « le joueur 1 »… */
  who: [string, string];
}

const GAMES: Record<"entree" | "s4", Game> = {
  entree: {
    chip: "Jeu de l'entrée (slides 8-10)",
    title: "Jeu de l'entrée",
    who: ["la firme 1", "la firme 2"],
    game: {
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
    },
  },
  s4: {
    chip: "Jeu du § 4 (slide 14)",
    title: "Jeu du § 4",
    who: ["le joueur 1", "le joueur 2"],
    game: {
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
    },
  },
};

type Part = "depart" | "inter" | "finaux" | "aretes" | "sousjeu";

const SUB = "₀₁₂₃₄₅₆₇₈₉";
const nice = (name: string) => name.replace(/\d/g, (d) => SUB[Number(d)]);
const NUM = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six"];
const listFr = (xs: string[]) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} et ${xs[xs.length - 1]}`;

function Def({ src, children }: { src: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-primary bg-accent/40 px-3 py-2 text-[14px] leading-relaxed">
      <span className="text-[12px] font-bold uppercase tracking-wide text-primary">
        Définition ({src})
      </span>
      <p className="mt-0.5">{children}</p>
    </div>
  );
}

export function TreeAnatomy() {
  const [gid, setGid] = useState<"entree" | "s4">("entree");
  const [part, setPart] = useState<Part>("depart");
  const [subRoot, setSubRoot] = useState<string | null>(null);
  const G = GAMES[gid];
  const g = G.game;
  const color = (p: number) => g.players[p].color;

  const all = preorder(g.root);
  const decisions = all.filter((n): n is GTNode => n.kind === "node");
  const leaves = all.filter((n) => n.kind === "leaf");
  const root = g.root as GTNode;
  const inter = decisions.filter((n) => n.id !== root.id);
  const nEdges = decisions.reduce((s, n) => s + n.moves.length, 0);
  // un sous-jeu par nœud non final (information parfaite)
  const subs = decisions;
  const sub = subs.find((n) => n.id === subRoot) ?? inter[0] ?? root;

  const atOf = (n: GTNode) => (n.name ? `en ${nice(n.name)}` : `au nœud de ${G.who[n.player]}`);
  const Who = ({ p }: { p: number }) => <strong style={{ color: color(p) }}>{G.who[p]}</strong>;
  const Acts = ({ n }: { n: GTNode }) => (
    <>
      {n.moves.map((m, k) => (
        <span key={m.action}>
          {k === 0 ? "" : k === n.moves.length - 1 ? " et " : ", "}
          <span className="font-semibold" style={{ color: color(n.player) }}>
            {m.action}
          </span>
        </span>
      ))}
    </>
  );

  let ring: string[] = [];
  let focus: string | undefined;
  let focusLabel = "Sous-jeu";
  let body: ReactNode = null;
  if (part === "depart") {
    ring = [root.id];
    body = (
      <>
        <Def src="slide 8">
          Le <strong>nœud de départ</strong> : la première position où le joueur 1 choisit une
          action.
        </Def>
        <p className="mt-2">
          Ici : le nœud de départ{root.name ? ` ${nice(root.name)}` : ""}, où{" "}
          <Who p={root.player} /> choisit entre ses {NUM[root.moves.length] ?? root.moves.length}{" "}
          actions <Acts n={root} />.
        </p>
      </>
    );
  } else if (part === "inter") {
    ring = inter.map((n) => n.id);
    body = (
      <>
        <Def src="slide 8">
          Les <strong>nœuds intermédiaires</strong> : les positions où un joueur choisit une action.
        </Def>
        {inter.length === 1 && !inter[0].name ? (
          <p className="mt-2">
            Ici : un nœud intermédiaire, où <Who p={inter[0].player} /> choisit entre ses{" "}
            {NUM[inter[0].moves.length]} actions <Acts n={inter[0]} />.
          </p>
        ) : (
          <>
            <p className="mt-2">Ici, {NUM[inter.length]} nœuds intermédiaires :</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {inter.map((n) => (
                <li key={n.id}>
                  <em>{n.name ? nice(n.name) : "un nœud"}</em>, où <Who p={n.player} /> choisit
                  entre ses {NUM[n.moves.length]} actions <Acts n={n} />.
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  } else if (part === "finaux") {
    ring = leaves.map((n) => n.id);
    const first = leaves[0] as Extract<GTNodeOrLeaf, { kind: "leaf" }>;
    body = (
      <>
        <Def src="slide 8">
          Les <strong>nœuds finaux</strong> : ils représentent chacun un résultat et son profil de
          payoffs associé.
        </Def>
        <p className="mt-2">
          Ici, {NUM[leaves.length]} nœuds terminaux (= finaux), un pour chaque résultat atteignable.
          Sous chacun, le profil de payoffs : en haut (rouge) le payoff de {G.who[0]}, en bas (bleu)
          celui de {G.who[1]}. Ainsi, sous le premier nœud final, ({fmt(first.payoffs[0])} ;{" "}
          {fmt(first.payoffs[1])}) se lit « {fmt(first.payoffs[0])} pour {G.who[0]},{" "}
          {fmt(first.payoffs[1])} pour {G.who[1]} ».
        </p>
      </>
    );
  } else if (part === "aretes") {
    body = (
      <>
        <Def src="slide 8">
          Les <strong>arêtes</strong> : les actions accessibles aux joueurs, qui relient chacune
          deux nœuds entre eux. (Le slide écrit « arrêtes ».)
        </Def>
        <p className="mt-2">
          Ici, {NUM[nEdges] ?? nEdges} arêtes, une par action :{" "}
          {decisions.map((n, k) => (
            <span key={n.id}>
              {k > 0 ? " ; " : ""}
              <Acts n={n} /> ({n.name ? `${G.who[n.player]} en ${nice(n.name)}` : G.who[n.player]})
            </span>
          ))}
          . Chaque arête part du nœud du joueur qui choisit et mène au nœud suivant : l'arbre se lit
          de haut en bas, dans l'ordre du temps.
        </p>
      </>
    );
  } else {
    focus = sub.id;
    focusLabel = sub.id === root.id ? "Sous-jeu = jeu complet" : "Sous-jeu";
    const inside = preorder(sub);
    const nNodes = inside.filter((n) => n.kind === "node").length;
    const nLeaves = inside.length - nNodes;
    body = (
      <>
        <Def src="slide 10">
          Un <strong>sous-jeu</strong> commence à un nœud qui n'est pas final, et il inclut tous les
          nœuds et les arêtes qui suivent ce nœud.
        </Def>
        <p className="mt-2">
          Ce jeu a {NUM[subs.length]} nœuds non finaux, donc {NUM[subs.length]} sous-jeux :{" "}
          {listFr(["le jeu complet", ...inter.map((n) => `celui qui commence ${atOf(n)}`)])}.
          {gid === "entree" ? (
            <>
              {" "}
              Le seul sous-jeu différent du jeu complet commence au nœud où la firme 2 choisit son
              action (slide 10).
            </>
          ) : (
            <>
              {" "}
              Le sous-jeu en x₂ est lui-même contenu dans celui en x₁ : les sous-jeux s'emboîtent.
            </>
          )}
        </p>
        <p className="mt-1">
          Encadré : le sous-jeu qui commence{" "}
          {sub.id === root.id ? "au nœud de départ (c'est le jeu complet)" : atOf(sub)}, avec{" "}
          {nNodes} {nNodes > 1 ? "nœuds" : "nœud"} de décision et {nLeaves}{" "}
          {nLeaves > 1 ? "nœuds finaux" : "nœud final"}. Un nœud final, lui, ne commence pas de
          sous-jeu : il n'y a plus rien à décider.
        </p>
      </>
    );
  }

  const counts: Record<Part, number> = {
    depart: 1,
    inter: inter.length,
    finaux: leaves.length,
    aretes: nEdges,
    sousjeu: subs.length,
  };
  const partChips: Array<{ value: Part; label: string }> = [
    { value: "depart", label: "Nœud de départ" },
    { value: "inter", label: inter.length > 1 ? "Nœuds intermédiaires" : "Nœud intermédiaire" },
    { value: "finaux", label: "Nœuds finaux" },
    { value: "aretes", label: "Arêtes (actions)" },
    { value: "sousjeu", label: "Sous-jeu" },
  ];

  return (
    <InteractiveCard
      title="Anatomie d'un arbre de jeu (forme étendue)"
      subtitle={
        <>
          Slides 8 à 10. Clique un élément : il s'allume dans l'arbre, avec la définition du slide
          et sa lecture sur le jeu.
        </>
      }
      controls={
        <>
          <ChoiceChips
            className="sm:col-span-2 lg:col-span-3"
            label="Repérer"
            value={part}
            onChange={setPart}
            options={partChips.map((c) => ({
              value: c.value,
              label: (
                <>
                  {c.label} <span className="opacity-70">({counts[c.value]})</span>
                </>
              ),
            }))}
          />
          {part === "sousjeu" ? (
            <ChoiceChips
              className="sm:col-span-2 lg:col-span-3"
              label="Quel sous-jeu ?"
              value={sub.id}
              onChange={setSubRoot}
              options={subs.map((n) => ({
                value: n.id,
                label:
                  n.id === root.id
                    ? "Le jeu complet"
                    : n.name
                      ? `Celui en ${nice(n.name)}`
                      : `Celui au nœud de ${G.who[n.player]}`,
              }))}
            />
          ) : null}
          <ChoiceChips
            className="sm:col-span-2 lg:col-span-3"
            label="Jeu"
            value={gid}
            onChange={(v) => {
              setGid(v);
              setSubRoot(null);
            }}
            options={(Object.keys(GAMES) as Array<"entree" | "s4">).map((k) => ({
              value: k,
              label: GAMES[k].chip,
            }))}
          />
        </>
      }
      footer={
        <>
          la forme normale ne dit ni quel joueur joue à quel moment, ni ce qu'un joueur sait au
          moment de jouer (slide 8). L'arbre le montre : on le lit de haut en bas, et chaque joueur,
          à son nœud, connaît toutes les actions passées (information parfaite).
        </>
      }
    >
      <GameTreeSvg
        game={g}
        ringLeaves={ring}
        emphasizeEdges={part === "aretes"}
        focus={focus}
        focusLabel={focusLabel}
        ariaLabel={`Arbre du ${G.title} : ${decisions.length} nœuds de décision, ${leaves.length} nœuds finaux, ${nEdges} arêtes.`}
        maxW={gid === "entree" ? 340 : 400}
        className="overflow-visible"
      />
      <div className="mt-3 text-[14px] leading-relaxed" aria-live="polite">
        {body}
      </div>
    </InteractiveCard>
  );
}
