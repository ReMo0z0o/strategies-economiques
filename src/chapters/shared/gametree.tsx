/**
 * Boîte à outils « arbres de jeu » (jeux séquentiels) partagée par les chapitres.
 *
 * - Un jeu en forme étendue est décrit par un arbre de nœuds de décision
 *   (`node`) et de nœuds finaux (`leaf`). Les nœuds qui partagent le même
 *   `info` forment un ensemble d'information (le joueur ne sait pas auquel
 *   de ces nœuds il se trouve) et sont reliés par un pointillé.
 * - Le tracé est calculé automatiquement (`layoutTree`) : feuilles également
 *   espacées, chaque nœud centré au-dessus de ses branches, comme dans les
 *   slides. Variante « peigne » pour le jeu du centipède.
 * - `backwardInduction` résout un jeu à information parfaite en partant des
 *   derniers sous-jeux (dans l'ordre exact du raisonnement des slides) et
 *   indique l'hypothèse utilisée à chaque étape (H1, H2.1, H2.2…).
 * - `enumerateStrategies` / `normalForm2` / `pureNash` construisent la forme
 *   normale d'un jeu séquentiel (une stratégie = un plan d'action complet).
 * - `BackwardInductionPlayer` : animation pas à pas (avec mode « à toi »).
 *
 * Tout est calculé à partir des paiements : aucune solution n'est écrite à la
 * main, ce qui garantit que la figure et le texte concordent.
 */
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InteractiveCard, ChoiceChips } from "@/components/course/Interactive";
import { C, fmt } from "./plot";

/* ------------------------------------------------------------------ */
/* Modèle                                                              */
/* ------------------------------------------------------------------ */

export interface GTPlayer {
  /** nom affiché près des nœuds (ex. « Firme 1 », « J2 ») */
  name: string;
  /** couleur du joueur (branches, paiements) */
  color: string;
}

export interface GTLeaf {
  kind: "leaf";
  id: string;
  /** un paiement par joueur, dans l'ordre de `players` (vide = pas affiché) */
  payoffs: number[];
  /** texte sous la feuille, à la place ou en plus des paiements (ex. « g ») */
  caption?: string;
  /** masquer les paiements (ex. arbre « sans payoffs » des élections) */
  hidePayoffs?: boolean;
}

export interface GTMove {
  action: string;
  to: GTNodeOrLeaf;
}

export interface GTNode {
  kind: "node";
  id: string;
  /** indice du joueur qui choisit (dans `players`) */
  player: number;
  /** nom du nœud (ex. « x0 », affiché « x₀ ») */
  name?: string;
  /** identifiant d'ensemble d'information (nœuds indiscernables) */
  info?: string;
  moves: GTMove[];
}

export type GTNodeOrLeaf = GTNode | GTLeaf;

export interface GTGame {
  players: GTPlayer[];
  root: GTNodeOrLeaf;
}

/** Couleurs des joueurs, comme dans les slides : J1 rouge, J2 bleu, J3 olive. */
export const GT_COLORS = [C.red, C.blue, "#65a30d", C.violet] as const;

/** Constructeur concis d'une feuille. */
export function leaf(id: string, payoffs: number[], opts: Partial<Omit<GTLeaf, "kind" | "id" | "payoffs">> = {}): GTLeaf {
  return { kind: "leaf", id, payoffs, ...opts };
}

/** Constructeur concis d'un nœud de décision : `moves` = [action, sous-arbre]… */
export function node(
  id: string,
  player: number,
  moves: Array<[string, GTNodeOrLeaf]>,
  opts: { name?: string; info?: string } = {},
): GTNode {
  return { kind: "node", id, player, moves: moves.map(([action, to]) => ({ action, to })), ...opts };
}

/* ------------------------------------------------------------------ */
/* Parcours                                                            */
/* ------------------------------------------------------------------ */

/** Tous les nœuds (décision et finaux) en préordre (racine d'abord, gauche → droite). */
export function preorder(root: GTNodeOrLeaf): GTNodeOrLeaf[] {
  const out: GTNodeOrLeaf[] = [];
  const visit = (n: GTNodeOrLeaf) => {
    out.push(n);
    if (n.kind === "node") n.moves.forEach((m) => visit(m.to));
  };
  visit(root);
  return out;
}

export function findNode(root: GTNodeOrLeaf, id: string): GTNodeOrLeaf | undefined {
  return preorder(root).find((n) => n.id === id);
}

/** Identifiants du sous-arbre qui commence en `id` (inclus). */
export function subtreeIds(root: GTNodeOrLeaf, id: string): Set<string> {
  const start = findNode(root, id);
  return new Set(start ? preorder(start).map((n) => n.id) : []);
}

/**
 * « Profondeur stratégique » d'un nœud : 0 si toutes ses branches mènent à
 * des nœuds finaux ; sinon 1 + la plus grande profondeur de ses successeurs.
 * Elle donne l'hypothèse nécessaire pour prédire le choix en ce nœud :
 * 0 → H1 (rationalité), k → H2.k (rationalité connue à k niveaux).
 */
export function decisionLevel(n: GTNodeOrLeaf): number {
  if (n.kind === "leaf") return -1;
  const sub = n.moves.map((m) => decisionLevel(m.to));
  const max = Math.max(...sub);
  return max < 0 ? 0 : max + 1;
}

export function hypothesisLabel(level: number): string {
  return level <= 0 ? "H1" : `H2.${level}`;
}

/* ------------------------------------------------------------------ */
/* Backward induction (information parfaite)                           */
/* ------------------------------------------------------------------ */

export interface BIStep {
  nodeId: string;
  player: number;
  /** H1, H2.1, H2.2… */
  hyp: string;
  level: number;
  /** pour chaque action : le profil de paiements auquel elle mène (sous-jeux déjà résolus) */
  options: Array<{ action: string; value: number[] }>;
  /** indices des actions qui maximisent le paiement du joueur (plusieurs = indifférence) */
  best: number[];
  /** action retenue (la première des meilleures) */
  chosen: number;
  /** profil de paiements du sous-jeu une fois résolu */
  value: number[];
}

/**
 * Backward induction : renvoie les étapes dans l'ordre du raisonnement (les
 * derniers sous-jeux d'abord ; à profondeur égale, de gauche à droite).
 * Le jeu doit être à information parfaite (pas d'ensemble d'information à
 * plusieurs nœuds) : sinon, il faut résoudre les sous-jeux simultanés à part.
 */
export function backwardInduction(game: GTGame): BIStep[] {
  const steps: BIStep[] = [];
  const value = new Map<string, number[]>();
  const solve = (n: GTNodeOrLeaf): number[] => {
    if (n.kind === "leaf") return n.payoffs;
    const opts = n.moves.map((m) => ({ action: m.action, value: solve(m.to) }));
    const mine = opts.map((o) => o.value[n.player] ?? Number.NEGATIVE_INFINITY);
    const max = Math.max(...mine);
    const best = mine.map((v, i) => (Math.abs(v - max) < 1e-12 ? i : -1)).filter((i) => i >= 0);
    const chosen = best[0];
    const level = decisionLevel(n);
    steps.push({
      nodeId: n.id,
      player: n.player,
      hyp: hypothesisLabel(level),
      level,
      options: opts,
      best,
      chosen,
      value: opts[chosen].value,
    });
    value.set(n.id, opts[chosen].value);
    return opts[chosen].value;
  };
  solve(game.root);
  // ordre pédagogique : par niveau croissant, puis de gauche à droite (préordre)
  const order = new Map(preorder(game.root).map((n, i) => [n.id, i]));
  return steps.sort((a, b) => a.level - b.level || (order.get(a.nodeId)! - order.get(b.nodeId)!));
}

/** Choix (nœud → indice d'action) d'une liste d'étapes. */
export function choicesOf(steps: BIStep[]): Record<string, number> {
  return Object.fromEntries(steps.map((s) => [s.nodeId, s.chosen]));
}

/** Chemin suivi depuis la racine avec des choix donnés : ids des nœuds traversés + feuille finale. */
export function playPath(game: GTGame, choice: Record<string, number>): { ids: string[]; edges: Array<[string, number]>; leaf: GTLeaf | null } {
  const ids: string[] = [];
  const edges: Array<[string, number]> = [];
  let n: GTNodeOrLeaf = game.root;
  for (let guard = 0; guard < 200; guard++) {
    ids.push(n.id);
    if (n.kind === "leaf") return { ids, edges, leaf: n };
    const k: number | undefined = choice[n.id] ?? (n.info !== undefined ? choice[`info:${n.info}`] : undefined);
    if (k === undefined) return { ids, edges, leaf: null };
    edges.push([n.id, k]);
    n = n.moves[k].to;
  }
  return { ids, edges, leaf: null };
}

/* ------------------------------------------------------------------ */
/* Stratégies et forme normale                                         */
/* ------------------------------------------------------------------ */

/** Ensembles d'information d'un joueur, en préordre (un nœud seul = son propre ensemble). */
export function infoSetsOf(game: GTGame, player: number): Array<{ key: string; nodes: GTNode[] }> {
  const sets: Array<{ key: string; nodes: GTNode[] }> = [];
  for (const n of preorder(game.root)) {
    if (n.kind !== "node" || n.player !== player) continue;
    const key = n.info !== undefined ? `info:${n.info}` : n.id;
    const found = sets.find((s) => s.key === key);
    if (found) found.nodes.push(n);
    else sets.push({ key, nodes: [n] });
  }
  return sets;
}

export interface GTStrategy {
  /** libellé compact : actions concaténées dans l'ordre des ensembles d'information (ex. « DG ») */
  label: string;
  /** actions par ensemble d'information, dans l'ordre */
  actions: string[];
  /** choix (id de nœud → indice d'action) pour TOUS les nœuds du joueur */
  choice: Record<string, number>;
}

/**
 * Toutes les stratégies pures d'un joueur : un plan d'action complet, qui dit
 * quoi faire à CHAQUE ensemble d'information du joueur (même ceux que ses
 * propres choix empêchent d'atteindre).
 */
export function enumerateStrategies(game: GTGame, player: number): GTStrategy[] {
  const sets = infoSetsOf(game, player);
  let acc: GTStrategy[] = [{ label: "", actions: [], choice: {} }];
  for (const s of sets) {
    const moves = s.nodes[0].moves;
    const next: GTStrategy[] = [];
    for (const st of acc) {
      moves.forEach((m, k) => {
        const choice = { ...st.choice };
        s.nodes.forEach((nd) => (choice[nd.id] = k));
        next.push({ label: st.label + m.action, actions: [...st.actions, m.action], choice });
      });
    }
    acc = next;
  }
  return acc;
}

/** Profil de paiements obtenu quand chaque joueur suit sa stratégie. */
export function outcomeOf(game: GTGame, strategies: GTStrategy[]): number[] {
  const choice = Object.assign({}, ...strategies.map((s) => s.choice)) as Record<string, number>;
  return playPath(game, choice).leaf?.payoffs ?? [];
}

export interface NormalForm2 {
  rows: GTStrategy[];
  cols: GTStrategy[];
  /** cells[i][j] = [paiement joueur 0, paiement joueur 1] */
  cells: number[][][];
}

/** Forme normale d'un jeu séquentiel à deux joueurs (joueur 0 en lignes). */
export function normalForm2(game: GTGame): NormalForm2 {
  const rows = enumerateStrategies(game, 0);
  const cols = enumerateStrategies(game, 1);
  const cells = rows.map((r) => cols.map((c) => outcomeOf(game, [r, c])));
  return { rows, cols, cells };
}

/** Meilleures réponses et équilibres de Nash en stratégies pures d'une bimatrice. */
export function pureNash(cells: number[][][]): {
  /** rowBest[j] = lignes meilleures réponses à la colonne j */
  rowBest: number[][];
  /** colBest[i] = colonnes meilleures réponses à la ligne i */
  colBest: number[][];
  eq: Array<[number, number]>;
} {
  const nr = cells.length;
  const nc = cells[0]?.length ?? 0;
  const rowBest: number[][] = [];
  for (let j = 0; j < nc; j++) {
    const m = Math.max(...cells.map((row) => row[j][0]));
    rowBest.push(cells.map((row, i) => (Math.abs(row[j][0] - m) < 1e-12 ? i : -1)).filter((i) => i >= 0));
  }
  const colBest: number[][] = [];
  for (let i = 0; i < nr; i++) {
    const m = Math.max(...cells[i].map((c) => c[1]));
    colBest.push(cells[i].map((c, j) => (Math.abs(c[1] - m) < 1e-12 ? j : -1)).filter((j) => j >= 0));
  }
  const eq: Array<[number, number]> = [];
  for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) if (rowBest[j].includes(i) && colBest[i].includes(j)) eq.push([i, j]);
  return { rowBest, colBest, eq };
}

/**
 * Équilibre en stratégies mixtes d'un jeu 2×2 sans équilibre pur :
 * p = probabilité que le joueur-ligne joue sa 1re stratégie (rend le
 * joueur-colonne indifférent), q = idem pour le joueur-colonne.
 * A[i][j] = paiement ligne, B[i][j] = paiement colonne. `null` si pas intérieur.
 */
export function mixed2x2(A: number[][], B: number[][]): { p: number; q: number } | null {
  const dp = B[0][0] - B[1][0] - B[0][1] + B[1][1];
  const dq = A[0][0] - A[0][1] - A[1][0] + A[1][1];
  if (Math.abs(dp) < 1e-12 || Math.abs(dq) < 1e-12) return null;
  const p = (B[1][1] - B[1][0]) / dp;
  const q = (A[1][1] - A[0][1]) / dq;
  if (!(p > 0 && p < 1 && q > 0 && q < 1)) return null;
  return { p, q };
}

/* ------------------------------------------------------------------ */
/* Tracé                                                               */
/* ------------------------------------------------------------------ */

export interface TreeLayoutOpts {
  /** écart horizontal entre deux feuilles voisines */
  leafGap?: number;
  /** écart vertical entre deux niveaux */
  levelGap?: number;
  /** « down » (arbre classique) ou « comb » (centipède : nœuds en ligne, arrêts vers le bas) */
  orientation?: "down" | "comb";
}

export interface Pos {
  x: number;
  y: number;
  depth: number;
  parent?: string;
  /** indice de la branche qui mène à ce nœud depuis son parent */
  via?: number;
}

export function layoutTree(game: GTGame, opts: TreeLayoutOpts = {}): Map<string, Pos> {
  const leafGap = opts.leafGap ?? (opts.orientation === "comb" ? 78 : 70);
  const levelGap = opts.levelGap ?? 78;
  const pos = new Map<string, Pos>();
  if (opts.orientation === "comb") {
    // centipède : la branche qui continue reste sur la ligne, l'autre descend
    let x = 0;
    const walk = (n: GTNodeOrLeaf, parent?: string, via?: number) => {
      if (n.kind === "leaf") {
        pos.set(n.id, { x: x + leafGap * 0.75, y: 0, depth: 0, parent, via });
        return;
      }
      pos.set(n.id, { x, y: 0, depth: 0, parent, via });
      const cont = n.moves.findIndex((m) => m.to.kind === "node");
      n.moves.forEach((m, k) => {
        if (m.to.kind === "leaf" && (k !== cont || cont < 0) && !(cont < 0 && k === n.moves.length - 1)) {
          pos.set(m.to.id, { x, y: levelGap, depth: 1, parent: n.id, via: k });
        }
      });
      const nx = n.moves[cont >= 0 ? cont : n.moves.length - 1];
      x += leafGap;
      if (cont >= 0) walk(nx.to, n.id, cont);
      else pos.set(nx.to.id, { x: x - leafGap * 0.25, y: 0, depth: 0, parent: n.id, via: n.moves.length - 1 });
    };
    walk(game.root);
    return pos;
  }
  let i = 0;
  const walk = (n: GTNodeOrLeaf, depth: number, parent?: string, via?: number): number => {
    if (n.kind === "leaf") {
      const x = i * leafGap;
      i += 1;
      pos.set(n.id, { x, y: depth * levelGap, depth, parent, via });
      return x;
    }
    const xs = n.moves.map((m, k) => walk(m.to, depth + 1, n.id, k));
    const x = (xs[0] + xs[xs.length - 1]) / 2;
    pos.set(n.id, { x, y: depth * levelGap, depth, parent, via });
    return x;
  };
  walk(game.root, 0);
  return pos;
}

/** « x0 » → x + indice 0 (SVG). */
function SubName({ name }: { name: string }) {
  const m = name.match(/^([^\d]+)(\d+)$/);
  if (!m) return <>{name}</>;
  return (
    <>
      {m[1]}
      <tspan baselineShift="sub" fontSize="0.75em">
        {m[2]}
      </tspan>
    </>
  );
}

export interface GameTreeSvgProps {
  game: GTGame;
  layout?: TreeLayoutOpts;
  /** branches choisies (id de nœud → indice d'action) : épaissies, couleur du joueur */
  chosen?: Record<string, number>;
  /** atténuer les branches non choisies des nœuds de `chosen` */
  dimOthers?: boolean;
  /** chemin d'équilibre à surligner (depuis la racine, en suivant `chosen`) */
  showPath?: boolean;
  /** nœud dont le sous-jeu est encadré (pointillés) */
  focus?: string;
  focusLabel?: string;
  /** sous-jeux remplacés par leur profil de paiements (« jeu réduit ») */
  collapsed?: Record<string, number[]>;
  /** branches cliquables : nœud concerné + rappel */
  pick?: { nodeId: string; onPick: (k: number) => void };
  /** nœuds ou feuilles à entourer (issue d'équilibre, nœud à repérer…) */
  ringLeaves?: string[];
  /** épaissir toutes les branches (pour montrer les « arêtes ») */
  emphasizeEdges?: boolean;
  /** libellé d'ensemble d'information (ex. « Firme 2 ») */
  infoLabels?: Record<string, string>;
  /** encadrés supplémentaires autour de sous-arbres (ex. sous-jeux simultanés) */
  boxes?: Array<{ root: string; label: string; color?: string }>;
  /** afficher le nom du joueur à côté de CHAQUE nœud (par défaut : une fois par niveau) */
  labelAll?: boolean;
  ariaLabel: string;
  maxW?: number;
  className?: string;
}

const FONT = 13;
/** largeur approximative d'un texte (police sans empattement, gras) */
const textW = (s: string, size = FONT) => s.length * size * 0.68;

interface TextSpec {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  text: string;
  size?: number;
}

function extent(t: TextSpec): [number, number] {
  const w = textW(t.text, t.size);
  if (t.anchor === "start") return [t.x, t.x + w];
  if (t.anchor === "end") return [t.x - w, t.x];
  return [t.x - w / 2, t.x + w / 2];
}

/** Arbre de jeu en SVG (forme étendue), lisible sur téléphone. */
export function GameTreeSvg({
  game,
  layout,
  chosen = {},
  dimOthers = false,
  showPath = false,
  focus,
  focusLabel = "Sous-jeu",
  collapsed = {},
  pick,
  ringLeaves = [],
  infoLabels = {},
  boxes = [],
  labelAll = false,
  emphasizeEdges = false,
  ariaLabel,
  maxW = 560,
  className,
}: GameTreeSvgProps) {
  const pos = useMemo(() => layoutTree(game, layout), [game, layout]);
  const all = useMemo(() => preorder(game.root), [game]);
  const nPay = game.players.length;
  const comb = layout?.orientation === "comb";

  // nœuds cachés : descendants des sous-jeux remplacés par leur valeur
  const hidden = new Set<string>();
  for (const id of Object.keys(collapsed)) {
    subtreeIds(game.root, id).forEach((d) => d !== id && hidden.add(d));
  }
  // chemin d'équilibre
  const pathEdges = new Set<string>();
  let pathLeaf: string | null = null;
  if (showPath) {
    const p = playPath(game, chosen);
    p.edges.forEach(([id, k]) => pathEdges.add(`${id}:${k}`));
    if (p.leaf) pathLeaf = p.leaf.id;
    else if (p.ids.length) {
      const last = p.ids[p.ids.length - 1];
      if (collapsed[last]) pathLeaf = last;
    }
  }

  const visible = all.filter((n) => !hidden.has(n.id));
  const payLines = (n: GTNodeOrLeaf) => {
    if (collapsed[n.id]) return nPay;
    if (n.kind !== "leaf") return 0;
    return (n.hidePayoffs ? 0 : n.payoffs.length) + (n.caption ? 1 : 0);
  };
  const bottomOf = (n: GTNodeOrLeaf) => pos.get(n.id)!.y + (payLines(n) ? 6 + payLines(n) * 15 : 6);

  // ensembles d'information visibles
  const infoGroups = new Map<string, GTNode[]>();
  for (const n of visible) {
    if (n.kind === "node" && n.info !== undefined && !collapsed[n.id]) {
      infoGroups.set(n.info, [...(infoGroups.get(n.info) ?? []), n]);
    }
  }

  // ---- étiquettes des branches -------------------------------------------
  const edgeLabels = new Map<string, TextSpec>();
  for (const n of visible) {
    if (n.kind !== "node" || collapsed[n.id]) continue;
    const p = pos.get(n.id)!;
    n.moves.forEach((m, k) => {
      const q = pos.get(m.to.id)!;
      const left = q.x < p.x - 1;
      const right = q.x > p.x + 1;
      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      let spec: TextSpec;
      if (comb) {
        spec = q.y > p.y ? { x: p.x - 7, y: my + 4, anchor: "end", text: m.action } : { x: mx, y: p.y + 18, anchor: "middle", text: m.action };
      } else if (left) spec = { x: mx - 7, y: my - 2, anchor: "end", text: m.action };
      else if (right) spec = { x: mx + 7, y: my - 2, anchor: "start", text: m.action };
      else spec = { x: mx + 7, y: my, anchor: "start", text: m.action };
      edgeLabels.set(`${n.id}:${k}`, spec);
    });
  }

  // ---- noms des joueurs (une fois par joueur et par niveau, comme les slides)
  const nameShown = new Set<string>();
  const seen = new Set<string>();
  for (const n of [...visible].sort((a, b) => pos.get(a.id)!.x - pos.get(b.id)!.x)) {
    if (n.kind !== "node" || collapsed[n.id]) continue;
    if (n.info !== undefined && (infoGroups.get(n.info)?.length ?? 0) > 1) continue;
    const key = `${n.player}@${pos.get(n.id)!.depth}`;
    if (labelAll || comb || !seen.has(key) || n.name) {
      nameShown.add(n.id);
      seen.add(key);
    }
  }
  const nodeLabels = new Map<string, { main: TextSpec; sub?: TextSpec }>();
  for (const n of visible) {
    if (n.kind !== "node" || !nameShown.has(n.id) || collapsed[n.id]) continue;
    const p = pos.get(n.id)!;
    const parent = p.parent ? pos.get(p.parent) : undefined;
    const pname = game.players[n.player]?.name ?? "";
    if (!parent || comb) {
      const txt = pname + (n.name ? `  ${n.name}` : "");
      nodeLabels.set(n.id, { main: { x: p.x, y: p.y - 13, anchor: "middle", text: txt } });
    } else {
      const onLeft = p.x <= parent.x;
      nodeLabels.set(n.id, {
        main: { x: onLeft ? p.x - 11 : p.x + 11, y: p.y + 4, anchor: onLeft ? "end" : "start", text: pname },
        sub: n.name ? { x: onLeft ? p.x + 10 : p.x - 10, y: p.y - 6, anchor: onLeft ? "start" : "end", text: n.name, size: 12 } : undefined,
      });
    }
  }

  // ---- boîte englobante (étiquettes comprises) -----------------------------
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const grow = ([a, b]: [number, number]) => {
    minX = Math.min(minX, a);
    maxX = Math.max(maxX, b);
  };
  for (const n of visible) {
    const p = pos.get(n.id)!;
    grow([p.x - 14, p.x + 14]);
    maxY = Math.max(maxY, bottomOf(n));
    if (n.kind === "leaf" && n.caption) grow(extent({ x: p.x, y: 0, anchor: "middle", text: n.caption }));
  }
  edgeLabels.forEach((t) => grow(extent(t)));
  nodeLabels.forEach((l) => {
    grow(extent(l.main));
    if (l.sub) grow(extent(l.sub));
  });
  infoGroups.forEach((ns, key) => {
    if (ns.length < 2 || !infoLabels[key]) return;
    const b = ns.map((n) => pos.get(n.id)!).sort((u, v) => u.x - v.x)[ns.length - 1];
    grow(extent({ x: b.x + 12, y: 0, anchor: "start", text: infoLabels[key] }));
  });

  const subBox = (rootId: string, pad = 14) => {
    const ids = subtreeIds(game.root, rootId);
    const pts = visible.filter((n) => ids.has(n.id));
    const xs: number[] = [];
    pts.forEach((n) => {
      const p = pos.get(n.id)!;
      xs.push(p.x - 10, p.x + 10);
    });
    edgeLabels.forEach((t, key) => {
      if (ids.has(key.split(":")[0])) {
        const [a, b] = extent(t);
        xs.push(a, b);
      }
    });
    nodeLabels.forEach((l, id) => {
      if (ids.has(id)) {
        const [a, b] = extent(l.main);
        xs.push(a, b);
      }
    });
    // le nom du joueur de la racine est écrit AU-DESSUS du nœud : la boîte doit l'englober
    const top = Math.min(...pts.map((n) => pos.get(n.id)!.y)) - (comb || rootId === game.root.id ? 32 : 16);
    const bottom = Math.max(...pts.map((n) => bottomOf(n))) + 22;
    return { x: Math.min(...xs) - pad, y: top, w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: bottom - top };
  };
  for (const b of [...boxes.map((x) => x.root), ...(focus ? [focus] : [])]) {
    if (hidden.has(b) || !findNode(game.root, b)) continue;
    const r = subBox(b);
    grow([r.x - 2, r.x + r.w + 2]);
    maxY = Math.max(maxY, r.y + r.h + 2);
  }

  minX -= 6;
  maxX += 6;
  const minY = -36;
  maxY += 8;
  const W = maxX - minX;
  const H = maxY - minY;

  // halo couleur de fond de carte (lisible en mode clair comme en mode sombre)
  const halo = { style: { stroke: "var(--color-card, #fff)" }, strokeWidth: 3, paintOrder: "stroke" as const };

  const payoffText = (x: number, y: number, values: number[], hideNums = false, caption?: string) => (
    <g>
      {!hideNums &&
        values.map((v, k) => (
          <text key={k} x={x} y={y + 18 + k * 15} textAnchor="middle" fontSize={FONT} fontWeight={700} fill={game.players[k]?.color ?? C.ink} {...halo}>
            {fmt(v)}
          </text>
        ))}
      {caption ? (
        <text x={x} y={y + 18 + (hideNums ? 0 : values.length) * 15} textAnchor="middle" fontSize={FONT} fontWeight={700} fill={C.violet} {...halo}>
          {caption}
        </text>
      ) : null}
    </g>
  );

  return (
    <svg
      viewBox={`${minX} ${minY} ${W} ${H}`}
      className={cn("mx-auto block h-auto w-full", className)}
      style={{ maxWidth: Math.min(maxW, W * 1.2) }}
      role="img"
      aria-label={ariaLabel}
      overflow="visible"
    >
      {/* encadrés (sous-jeux) */}
      {boxes.map((b, i) => {
        if (hidden.has(b.root) || !findNode(game.root, b.root)) return null;
        const r = subBox(b.root);
        const col = b.color ?? C.sky;
        return (
          <g key={`box${i}`}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={12} fill={col} fillOpacity={0.06} stroke={col} strokeDasharray="6 4" strokeWidth={1.4} />
            <text x={r.x + 8} y={r.y + r.h - 7} fontSize={12} fontWeight={700} fill={col}>
              {b.label}
            </text>
          </g>
        );
      })}
      {focus && !hidden.has(focus) && findNode(game.root, focus)
        ? (() => {
            const r = subBox(focus);
            return (
              <g>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={14} fill={C.gold} fillOpacity={0.08} stroke={C.gold} strokeDasharray="7 5" strokeWidth={1.8} />
                <text x={r.x + r.w - 8} y={r.y + r.h - 7} textAnchor="end" fontSize={12} fontWeight={700} fill={C.gold} {...halo}>
                  {focusLabel}
                </text>
              </g>
            );
          })()
        : null}

      {/* ensembles d'information */}
      {[...infoGroups.entries()].map(([key, ns]) => {
        if (ns.length < 2) return null;
        const pts = ns.map((n) => pos.get(n.id)!).sort((a, b) => a.x - b.x);
        const a = pts[0];
        const b = pts[pts.length - 1];
        return (
          <g key={`is-${key}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.ink} strokeWidth={1.6} strokeDasharray="6 5" />
            {infoLabels[key] ? (
              <text x={b.x + 12} y={b.y + 4} fontSize={FONT} fontWeight={700} fill={game.players[ns[0].player]?.color ?? C.ink} {...halo}>
                {infoLabels[key]}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* branches */}
      {visible.map((n) => {
        if (n.kind !== "node" || collapsed[n.id]) return null;
        const p = pos.get(n.id)!;
        const color = game.players[n.player]?.color ?? C.ink;
        return n.moves.map((m, k) => {
          const q = pos.get(m.to.id)!;
          const isChosen = chosen[n.id] === k;
          const dim = dimOthers && chosen[n.id] !== undefined && !isChosen;
          const onPath = pathEdges.has(`${n.id}:${k}`);
          const t = edgeLabels.get(`${n.id}:${k}`)!;
          const pickable = pick && pick.nodeId === n.id;
          return (
            <g key={`${n.id}-${k}`} style={{ transition: "opacity 300ms" }} opacity={dim ? 0.28 : 1}>
              {onPath ? <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#facc15" strokeWidth={10} strokeLinecap="round" opacity={0.55} /> : null}
              <line
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={color}
                strokeWidth={isChosen || emphasizeEdges ? 3.6 : 1.7}
                strokeDasharray={dim ? "5 4" : undefined}
                strokeLinecap="round"
              />
              <text x={t.x} y={t.y} textAnchor={t.anchor} fontSize={FONT} fontWeight={isChosen ? 800 : 600} fill={color} {...halo}>
                {m.action}
              </text>
              {pickable ? (
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  stroke="transparent"
                  strokeWidth={22}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Choisir ${m.action}`}
                  onClick={() => pick!.onPick(k)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pick!.onPick(k);
                    }
                  }}
                />
              ) : null}
            </g>
          );
        });
      })}

      {/* nœuds */}
      {visible.map((n) => {
        const p = pos.get(n.id)!;
        const ring = ringLeaves.includes(n.id) || pathLeaf === n.id;
        if (collapsed[n.id]) {
          return (
            <g key={n.id}>
              {ring ? <circle cx={p.x} cy={p.y} r={9} fill="none" stroke={C.gold} strokeWidth={2.4} /> : null}
              <rect x={p.x - 5} y={p.y - 5} width={10} height={10} rx={2} fill={C.ink} />
              {payoffText(p.x, p.y, collapsed[n.id])}
            </g>
          );
        }
        if (n.kind === "leaf") {
          return (
            <g key={n.id}>
              {ring ? <circle cx={p.x} cy={p.y} r={9} fill="none" stroke={C.gold} strokeWidth={2.4} /> : null}
              <circle cx={p.x} cy={p.y} r={4.6} fill={C.ink} />
              {payoffText(p.x, p.y, n.payoffs, n.hidePayoffs, n.caption)}
            </g>
          );
        }
        const color = game.players[n.player]?.color ?? C.ink;
        const lab = nodeLabels.get(n.id);
        return (
          <g key={n.id}>
            {pick && pick.nodeId === n.id ? <circle cx={p.x} cy={p.y} r={12} fill={C.gold} opacity={0.35} /> : null}
            {ring ? <circle cx={p.x} cy={p.y} r={11} fill="none" stroke={C.gold} strokeWidth={2.4} /> : null}
            <circle cx={p.x} cy={p.y} r={6} fill={color} stroke="#fff" strokeWidth={1.5} />
            {lab ? (
              lab.main.anchor === "middle" ? (
                <text x={lab.main.x} y={lab.main.y} textAnchor="middle" fontSize={FONT} fontWeight={700} fill={color} {...halo}>
                  {game.players[n.player]?.name}
                  {n.name ? (
                    <tspan fill={C.soft} fontStyle="italic" fontWeight={500} dx={5}>
                      <SubName name={n.name} />
                    </tspan>
                  ) : null}
                </text>
              ) : (
                <>
                  <text x={lab.main.x} y={lab.main.y} textAnchor={lab.main.anchor} fontSize={FONT} fontWeight={700} fill={color} {...halo}>
                    {lab.main.text}
                  </text>
                  {lab.sub ? (
                    <text x={lab.sub.x} y={lab.sub.y} textAnchor={lab.sub.anchor} fontSize={12} fontStyle="italic" fill={C.soft} {...halo}>
                      <SubName name={lab.sub.text} />
                    </text>
                  ) : null}
                </>
              )
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Petits affichages                                                   */
/* ------------------------------------------------------------------ */

/** Profil de paiements coloré « (2 ; 1) ». */
export function PayoffChip({ game, value }: { game: GTGame; value: number[] }) {
  return (
    <span className="whitespace-nowrap font-bold tabular-nums">
      (
      {value.map((v, k) => (
        <span key={k}>
          {k > 0 ? " ; " : ""}
          <span style={{ color: game.players[k]?.color }}>{fmt(v)}</span>
        </span>
      ))}
      )
    </span>
  );
}

/** Nom de joueur coloré. */
export function PlayerName({ game, player }: { game: GTGame; player: number }) {
  return (
    <strong style={{ color: game.players[player]?.color }}>{game.players[player]?.name}</strong>
  );
}

/* ------------------------------------------------------------------ */
/* Animation : backward induction pas à pas                            */
/* ------------------------------------------------------------------ */

export interface BackwardInductionPlayerProps {
  game: GTGame;
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  layout?: TreeLayoutOpts;
  /** texte propre à une étape (sinon un texte générique est construit) */
  explain?: (step: BIStep, index: number) => ReactNode;
  /** texte affiché une fois le jeu entièrement résolu */
  conclusion?: ReactNode;
  /** libellé des ensembles d'information */
  infoLabels?: Record<string, string>;
  /** autoriser le mode « à toi » */
  allowGuess?: boolean;
  /** afficher par défaut le jeu réduit plutôt que les flèches */
  defaultView?: "fleches" | "reduit";
  ariaLabel: string;
  maxW?: number;
}

/**
 * Animation de la backward induction : à chaque étape, le sous-jeu étudié est
 * encadré, les options du joueur sont comparées, le choix rationnel est
 * surligné ; on peut afficher le « jeu réduit » (chaque sous-jeu résolu
 * remplacé par ses paiements), comme dans les slides.
 */
export function BackwardInductionPlayer({
  game,
  title,
  subtitle,
  footer,
  layout,
  explain,
  conclusion,
  infoLabels,
  allowGuess = true,
  defaultView = "fleches",
  ariaLabel,
  maxW,
}: BackwardInductionPlayerProps) {
  const steps = useMemo(() => backwardInduction(game), [game]);
  const [k, setK] = useState(0);
  const [view, setView] = useState<"fleches" | "reduit">(defaultView);
  const [mode, setMode] = useState<"voir" | "deviner">("voir");
  const [guess, setGuess] = useState<{ step: number; pick: number } | null>(null);

  const done = k >= steps.length;
  const solved = steps.slice(0, k);
  const chosen = choicesOf(solved);
  const collapsed: Record<string, number[]> = view === "reduit" ? Object.fromEntries(solved.map((s) => [s.nodeId, s.value])) : {};
  const cur = done ? null : steps[k];
  const curNode = cur ? (findNode(game.root, cur.nodeId) as GTNode) : null;
  const guessing = mode === "deviner" && cur && (!guess || guess.step !== k);
  const guessed = mode === "deviner" && cur && guess && guess.step === k ? guess.pick : null;

  const next = () => {
    setGuess(null);
    setK((v) => Math.min(steps.length, v + 1));
  };
  const reset = () => {
    setGuess(null);
    setK(0);
  };

  const genericText = (s: BIStep) => {
    const nd = findNode(game.root, s.nodeId) as GTNode;
    const who = <PlayerName game={game} player={s.player} />;
    const where = nd.name ? (
      <>
        {" "}au nœud <em>{nd.name.replace(/(\d+)$/, (d) => String.fromCharCode(...[...d].map((c) => 0x2080 + Number(c))))}</em>
      </>
    ) : null;
    return (
      <>
        <p>
          {s.level === 0 ? (
            <>Dernier sous-jeu{where} : {who} choisit et le jeu s'arrête. </>
          ) : (
            <>Sous-jeu{where} : {who} sait déjà ce qui se passera après chacune de ses actions (les sous-jeux suivants sont résolus). </>
          )}
          Il compare :
        </p>
        <ul className="mt-1 space-y-0.5">
          {s.options.map((o, i) => (
            <li key={i} className={cn(s.best.includes(i) && "font-semibold")}>
              {o.action} → <PayoffChip game={game} value={o.value} />, soit <strong>{fmt(o.value[s.player])}</strong> pour lui
              {s.best.includes(i) ? " ✓" : ""}
            </li>
          ))}
        </ul>
        {s.best.length > 1 ? (
          <p className="mt-1 text-amber-700">Il est indifférent entre ces actions : on retient ici {s.options[s.chosen].action}.</p>
        ) : null}
      </>
    );
  };

  return (
    <InteractiveCard
      title={title}
      subtitle={subtitle}
      footer={footer}
      controls={
        <>
          <ChoiceChips
            label="Affichage"
            value={view}
            onChange={setView}
            options={[
              { value: "fleches", label: "Arbre complet" },
              { value: "reduit", label: "Jeu réduit" },
            ]}
          />
          {allowGuess ? (
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
          ) : null}
        </>
      }
    >
      <GameTreeSvg
        game={game}
        layout={layout}
        chosen={chosen}
        dimOthers
        showPath={done}
        focus={cur?.nodeId}
        focusLabel="Sous-jeu étudié"
        collapsed={collapsed}
        infoLabels={infoLabels}
        pick={guessing && curNode ? { nodeId: curNode.id, onPick: (p) => setGuess({ step: k, pick: p }) } : undefined}
        ariaLabel={ariaLabel}
        maxW={maxW}
      />

      <div className="mt-3 rounded-xl border bg-muted/30 px-3 py-2.5 text-[14px] leading-relaxed sm:px-4" aria-live="polite">
        {cur ? (
          <>
            <div className="mb-1 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
              <span>
                Étape {k + 1} / {steps.length}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                Hypothèse : {cur.hyp}
              </span>
            </div>
            {guessing ? (
              <p>
                <strong>À toi :</strong> clique sur la branche que choisit <PlayerName game={game} player={cur.player} /> dans le
                sous-jeu encadré.
              </p>
            ) : (
              <>
                {guessed !== null ? (
                  <p className={cn("mb-1 font-semibold", cur.best.includes(guessed) ? "text-emerald-700" : "text-rose-700")}>
                    {cur.best.includes(guessed)
                      ? `✓ Bien vu : ${cur.options[guessed].action}.`
                      : `✗ Pas tout à fait : ${cur.options[guessed].action} rapporte moins. Regarde la comparaison.`}
                  </p>
                ) : null}
                {explain ? explain(cur, k) : genericText(cur)}
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-1 text-[12.5px] font-semibold text-emerald-700">Jeu entièrement résolu ✓</div>
            {conclusion ?? (
              <p>
                Le chemin surligné est celui qui est effectivement joué ; l'issue entourée est le résultat de l'ENPS.
              </p>
            )}
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
          onClick={next}
          disabled={done || !!guessing}
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
        <button type="button" onClick={reset} className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold">
          Recommencer
        </button>
      </div>
    </InteractiveCard>
  );
}
