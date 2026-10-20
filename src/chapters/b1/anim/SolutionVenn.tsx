/*
 * SolutionVenn — B1 · les trois solutions sur un même dessin (slides 36-37).
 *
 * Diagramme de Venn du slide 37 : ESD ⊂ EN ⊂ PSS ⊂ tous les profils
 * (« un ESD est un EN, un EN est un PSS¹ »). Pour le jeu choisi, chaque profil
 * (= une case de la matrice) est rangé dans sa zone, CALCULÉE ici à partir de
 * la matrice du slide :
 *  - PSS : élimination itérative des stratégies dominées, avec la définition du
 *    cours (slide 18 : « ≥ » face à tout ce que fait l'autre ; on exige en plus
 *    une inégalité stricte quelque part, sinon deux stratégies identiques
 *    s'élimineraient l'une l'autre). À chaque itération, on retire toutes les
 *    stratégies dominées des deux joueurs ;
 *  - EN  : meilleures réponses mutuelles (slides 26-27) ;
 *  - ESD : chaque joueur a une stratégie dominante (slides 11 et 13).
 * Le tri se rejoue pas à pas : tous → PSS → EN → ESD.
 * Note ¹ du slide 37 : avec le « ≥ », un EN peut être éliminé. C'est le cas de
 * (R, R) dans la panique bancaire avec g ≥ m (slide 33) ; un bouton montre
 * qu'avec l'élimination des stratégies STRICTEMENT dominées il redevient un PSS.
 * Matrices lues sur les PNG : slides 12, 14, 20, 27, 31, 33, 34, 54.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import { C } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const HALO = "var(--color-card)";

/* ------------------------------------------------------------------ */
/* Les jeux (matrices des slides)                                      */
/* ------------------------------------------------------------------ */

type Pay = readonly [number, number];
type GameId = "dp" | "rdv" | "g3" | "bds" | "cerf" | "poule" | "mp" | "bank0" | "bankg";

interface Player {
  /** nom court (en-têtes de la matrice) */
  short: string;
  /** forme en milieu de phrase : « pour l'Homme », « pour votre Amie » */
  the: string;
  /** sujet + verbe gagner conjugué */
  wins: string;
}

interface Game {
  chip: string;
  title: string;
  slide: string;
  /** deux jeux de la même famille partagent leurs profils : les points glissent */
  family: string;
  players: readonly [Player, Player];
  rows: readonly string[];
  cols: readonly string[];
  /** initiales utilisées dans les étiquettes des profils */
  rs: readonly string[];
  cs: readonly string[];
  pay: ReadonlyArray<ReadonlyArray<Pay>>;
  /** affichage d'un payoff (symbolique pour la panique bancaire) */
  val?: (v: number) => string;
  note?: ReactNode;
}

const P1: Player = { short: "P1", the: "P1", wins: "P1 gagne" };
const P2: Player = { short: "P2", the: "P2", wins: "P2 gagne" };

/*
 * Panique bancaire (slide 33) : m = montant placé, r = intérêt, g = garantie.
 * Le calcul utilise m = 100 et r = 10 % (n'importe quel r > 0 donne le même
 * classement) ; l'affichage reste symbolique : 110 → m(1+r), 100 → m, 0 → 0.
 * Sans garantie, min(g, m) = 0 ; avec g ≥ m, min(g, m) = m.
 */
const bankVal = (v: number) => (v === 110 ? "m(1+r)" : v === 100 ? "m" : "0");
const INV: readonly [Player, Player] = [
  { short: "Investisseur 1", the: "l'investisseur 1", wins: "l'investisseur 1 gagne" },
  { short: "Investisseur 2", the: "l'investisseur 2", wins: "l'investisseur 2 gagne" },
];
const BANK_NOTE = (
  <>
    <M tex="m" /> = montant placé, <M tex="r" /> = intérêt (<M tex="r>0" />), <M tex="g" /> =
    garantie publique ; celui qui a laissé son argent dans une banque en faillite reçoit{" "}
    <M tex="\min(g,m)" />.
  </>
);

const GAMES: Record<GameId, Game> = {
  dp: {
    chip: "Prisonnier",
    title: "Dilemme du prisonnier",
    slide: "slide 14",
    family: "dp",
    players: [P1, P2],
    rows: ["Nier", "Confesser"],
    cols: ["Nier", "Confesser"],
    rs: ["N", "C"],
    cs: ["N", "C"],
    pay: [
      [[2, 2], [0, 3]],
      [[3, 0], [1, 1]],
    ],
  },
  rdv: {
    chip: "Rendez-vous",
    title: "Jeu du rendez-vous",
    slide: "slide 12",
    family: "rdv",
    players: [
      { short: "Vous", the: "Vous", wins: "vous gagnez" },
      { short: "Amie", the: "votre Amie", wins: "votre Amie gagne" },
    ],
    rows: ["Heure", "Retard"],
    cols: ["Heure", "Retard"],
    rs: ["H", "R"],
    cs: ["H", "R"],
    pay: [
      [[0, 0], [-2, -4]],
      [[-1, -2], [0, -3]],
    ],
  },
  g3: {
    chip: "3 × 3 (slide 20)",
    title: "Jeu à trois stratégies",
    slide: "slides 20, 24-25",
    family: "g3",
    players: [P1, P2],
    rows: ["H", "M", "B"],
    cols: ["g", "m", "d"],
    rs: ["H", "M", "B"],
    cs: ["g", "m", "d"],
    pay: [
      [[4, 2], [0, 0], [6, 0]],
      [[0, 6], [1, 2], [3, 0]],
      [[0, 0], [2, 4], [2, 0]],
    ],
    note: (
      <>
        Les deux éliminations utilisent le « ≥ » de la définition du cours (slide 18) : face à H,
        m et d rapportent toutes deux 0 à P2 (0 ≥ 0). Avec une dominance stricte (&gt;), on ne
        pourrait rien éliminer dans ce jeu.
      </>
    ),
  },
  bds: {
    chip: "Bataille des sexes",
    title: "Bataille des sexes",
    slide: "slide 27",
    family: "bds",
    players: [
      { short: "Homme", the: "l'Homme", wins: "l'Homme gagne" },
      { short: "Femme", the: "la Femme", wins: "la Femme gagne" },
    ],
    rows: ["Viande", "Poisson"],
    cols: ["Rouge", "Blanc"],
    rs: ["V", "P"],
    cs: ["R", "B"],
    pay: [
      [[4, 2], [0, 0]],
      [[0, 0], [2, 4]],
    ],
  },
  cerf: {
    chip: "Chasse au cerf",
    title: "Chasse au cerf",
    slide: "slide 31",
    family: "cerf",
    players: [
      { short: "Chasseur 1", the: "le chasseur 1", wins: "le chasseur 1 gagne" },
      { short: "Chasseur 2", the: "le chasseur 2", wins: "le chasseur 2 gagne" },
    ],
    rows: ["Cerf", "Lièvre"],
    cols: ["Cerf", "Lièvre"],
    rs: ["C", "L"],
    cs: ["C", "L"],
    pay: [
      [[2, 2], [0, 1]],
      [[1, 0], [1, 1]],
    ],
  },
  poule: {
    chip: "Poule mouillée",
    title: "Poule mouillée",
    slide: "slide 34",
    family: "poule",
    players: [
      { short: "Conducteur 1", the: "le conducteur 1", wins: "le conducteur 1 gagne" },
      { short: "Conducteur 2", the: "le conducteur 2", wins: "le conducteur 2 gagne" },
    ],
    rows: ["Faucon", "Colombe"],
    cols: ["Faucon", "Colombe"],
    rs: ["F", "C"],
    cs: ["F", "C"],
    pay: [
      [[-2, -2], [6, 0]],
      [[0, 6], [2, 2]],
    ],
  },
  mp: {
    chip: "Matching pennies",
    title: "Matching pennies",
    slide: "slide 54",
    family: "mp",
    players: [
      { short: "Joueur 1", the: "le joueur 1", wins: "le joueur 1 gagne" },
      { short: "Joueur 2", the: "le joueur 2", wins: "le joueur 2 gagne" },
    ],
    rows: ["Pile", "Face"],
    cols: ["Pile", "Face"],
    rs: ["P", "F"],
    cs: ["P", "F"],
    pay: [
      [[0, 3], [3, 0]],
      [[3, 0], [0, 3]],
    ],
  },
  bank0: {
    chip: "Banque, g = 0",
    title: "Panique bancaire sans garantie (g = 0)",
    slide: "slide 33",
    family: "bank",
    players: INV,
    rows: ["Laisser", "Retirer"],
    cols: ["Laisser", "Retirer"],
    rs: ["L", "R"],
    cs: ["L", "R"],
    pay: [
      [[110, 110], [0, 100]],
      [[100, 0], [100, 100]],
    ],
    val: bankVal,
    note: BANK_NOTE,
  },
  bankg: {
    chip: "Banque, g ≥ m",
    title: "Panique bancaire avec garantie g ≥ m",
    slide: "slide 33",
    family: "bank",
    players: INV,
    rows: ["Laisser", "Retirer"],
    cols: ["Laisser", "Retirer"],
    rs: ["L", "R"],
    cs: ["L", "R"],
    pay: [
      [[110, 110], [100, 100]],
      [[100, 100], [100, 100]],
    ],
    val: bankVal,
    note: BANK_NOTE,
  },
};

const ORDER: GameId[] = ["dp", "rdv", "g3", "bds", "cerf", "poule", "mp", "bank0", "bankg"];

/* ------------------------------------------------------------------ */
/* Calcul des trois solutions                                          */
/* ------------------------------------------------------------------ */

type Key = string;
const key = (r: number, c: number): Key => `${r},${c}`;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** payoff du joueur i quand il joue `own` et l'autre `opp` */
function payOf(g: Game, i: 0 | 1, own: number, opp: number): number {
  return i === 0 ? g.pay[own][opp][0] : g.pay[opp][own][1];
}

/** comparaison, face à chaque stratégie `o` de l'autre : a = payoff de `by`, b = payoff de `s` */
interface Cmp {
  o: number;
  a: number;
  b: number;
}
interface Elim {
  player: 0 | 1;
  s: number;
  by: number;
  cmps: Cmp[];
}

function compareTo(g: Game, i: 0 | 1, s: number, by: number, opps: number[]): Cmp[] {
  return opps.map((o) => ({ o, a: payOf(g, i, by, o), b: payOf(g, i, s, o) }));
}

function isDominated(cmps: Cmp[], strict: boolean): boolean {
  if (strict) return cmps.every((c) => c.a > c.b);
  return cmps.every((c) => c.a >= c.b) && cmps.some((c) => c.a > c.b);
}

interface Analysis {
  profiles: Array<[number, number]>;
  rounds: Elim[][];
  liveRows: number[];
  liveCols: number[];
  pss: Set<Key>;
  en: Set<Key>;
  esd: Set<Key>;
  dom: [number | null, number | null];
  /** 0 = hors PSS, 1 = PSS hors EN, 2 = EN hors ESD, 3 = ESD */
  depth: Map<Key, number>;
  /** EN éliminé par la dominance « ≥ » (note ¹ du slide 37) */
  special: Set<Key>;
}

function dominantOf(g: Game, i: 0 | 1): number | null {
  const own = range(i === 0 ? g.rows.length : g.cols.length);
  const opp = range(i === 0 ? g.cols.length : g.rows.length);
  for (const s of own) {
    const ok = own.every((s2) => s2 === s || opp.every((o) => payOf(g, i, s, o) >= payOf(g, i, s2, o)));
    if (ok) return s;
  }
  return null;
}

function isBR(g: Game, i: 0 | 1, r: number, c: number): boolean {
  if (i === 0) return range(g.rows.length).every((r2) => g.pay[r][c][0] >= g.pay[r2][c][0]);
  return range(g.cols.length).every((c2) => g.pay[r][c][1] >= g.pay[r][c2][1]);
}

/**
 * Parmi les stratégies qui dominent `s`, on cite celle qui a le plus d'inégalités
 * strictes ; à égalité, la plus proche dans la matrice (slide 20 : d est dominée
 * par m — elle l'est aussi par g, mais le slide cite m).
 */
function pickDominator(g: Game, i: 0 | 1, s: number, own: number[], opps: number[], strict: boolean): Elim | null {
  let best: Elim | null = null;
  let bestScore = -1;
  for (const by of own) {
    if (by === s) continue;
    const cmps = compareTo(g, i, s, by, opps);
    if (!isDominated(cmps, strict)) continue;
    const score = cmps.filter((c) => c.a > c.b).length * 100 - Math.abs(by - s);
    if (score > bestScore) {
      best = { player: i, s, by, cmps };
      bestScore = score;
    }
  }
  return best;
}

function analyse(g: Game, strict: boolean): Analysis {
  let R = range(g.rows.length);
  let Cc = range(g.cols.length);
  const rounds: Elim[][] = [];
  for (let guard = 0; guard < 12; guard++) {
    const elims: Elim[] = [];
    for (const s of R) {
      const e = pickDominator(g, 0, s, R, Cc, strict);
      if (e) elims.push(e);
    }
    for (const s of Cc) {
      const e = pickDominator(g, 1, s, Cc, R, strict);
      if (e) elims.push(e);
    }
    if (elims.length === 0) break;
    rounds.push(elims);
    R = R.filter((s) => !elims.some((e) => e.player === 0 && e.s === s));
    Cc = Cc.filter((s) => !elims.some((e) => e.player === 1 && e.s === s));
  }
  const profiles: Array<[number, number]> = [];
  for (const r of range(g.rows.length)) for (const c of range(g.cols.length)) profiles.push([r, c]);
  const pss = new Set<Key>();
  for (const r of R) for (const c of Cc) pss.add(key(r, c));
  const en = new Set<Key>(profiles.filter(([r, c]) => isBR(g, 0, r, c) && isBR(g, 1, r, c)).map(([r, c]) => key(r, c)));
  const dom: [number | null, number | null] = [dominantOf(g, 0), dominantOf(g, 1)];
  const esd = new Set<Key>(dom[0] !== null && dom[1] !== null ? [key(dom[0], dom[1])] : []);
  const depth = new Map<Key, number>();
  const special = new Set<Key>();
  for (const [r, c] of profiles) {
    const k = key(r, c);
    if (esd.has(k)) depth.set(k, 3);
    else if (en.has(k) && pss.has(k)) depth.set(k, 2);
    else if (pss.has(k)) depth.set(k, 1);
    else depth.set(k, 0);
    if (en.has(k) && !pss.has(k)) special.add(k);
  }
  return { profiles, rounds, liveRows: R, liveCols: Cc, pss, en, esd, dom, depth, special };
}

/* ------------------------------------------------------------------ */
/* Géométrie du diagramme (vérifiée en Python : marges ≥ 4 px)         */
/* ------------------------------------------------------------------ */

const VB_W = 520;
const VB_H = 370;
type ZoneId = "O" | "P" | "E" | "D" | "S";
const ELL = {
  O: { cx: 260, cy: 196, rx: 255, ry: 166 },
  P: { cx: 260, cy: 202, rx: 178, ry: 122 },
  E: { cx: 260, cy: 218, rx: 112, ry: 82 },
  D: { cx: 260, cy: 236, rx: 54, ry: 30 },
} as const;
type Place = "below" | "above" | "left" | "right";
type Slot = readonly [number, number, Place];
const SLOTS: Record<ZoneId, readonly Slot[]> = {
  D: [[238, 247, "right"]],
  E: [
    [224, 188, "left"],
    [296, 188, "right"],
  ],
  P: [
    [192, 128, "left"],
    [328, 128, "right"],
    [118, 205, "below"],
    [402, 205, "below"],
  ],
  O: [
    [64, 144, "above"],
    [456, 144, "above"],
    [48, 208, "above"],
    [472, 208, "above"],
    [62, 270, "above"],
    [458, 270, "above"],
    [136, 70, "below"],
    [384, 70, "below"],
    [260, 50, "below"],
  ],
  S: [[230, 343, "right"]],
};
const ZONE_COLOR: Record<ZoneId, string> = {
  O: C.soft,
  P: C.sky,
  E: C.green,
  D: C.red,
  S: C.green,
};

type Step = 0 | 1 | 2 | 3;
const STEP_CHIPS: Array<{ value: "0" | "1" | "2" | "3"; label: string }> = [
  { value: "0", label: "① Tous" },
  { value: "1", label: "② PSS" },
  { value: "2", label: "③ EN" },
  { value: "3", label: "④ ESD" },
];
const STEP_MS = 2600;

/** zone où l'on dessine le profil à l'étape `step` du tri */
function zoneAt(a: Analysis, k: Key, step: Step): ZoneId {
  if (a.special.has(k)) return step >= 2 ? "S" : "O";
  const d = Math.min(a.depth.get(k) ?? 0, step);
  return (["O", "P", "E", "D"] as const)[d];
}

function labelProps(place: Place) {
  switch (place) {
    case "below":
      return { x: 0, y: 20, textAnchor: "middle" as const };
    case "above":
      return { x: 0, y: -11, textAnchor: "middle" as const };
    case "left":
      return { x: -10, y: 4.5, textAnchor: "end" as const };
    case "right":
      return { x: 10, y: 4.5, textAnchor: "start" as const };
  }
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------------------------------------------ */
/* Textes générés à partir du calcul                                   */
/* ------------------------------------------------------------------ */

function num(g: Game, v: number): string {
  if (g.val) return g.val(v);
  return v < 0 ? `−${-v}` : String(v);
}
function sName(g: Game, i: 0 | 1, s: number): string {
  return i === 0 ? g.rows[s] : g.cols[s];
}
function prof(g: Game, r: number, c: number): string {
  return `(${g.rs[r]}, ${g.cs[c]})`;
}
function listProfiles(g: Game, keys: Key[]): string {
  if (keys.length === 0) return "—";
  return keys
    .map((k) => {
      const [r, c] = k.split(",").map(Number);
      return prof(g, r, c);
    })
    .join(", ");
}
/** « face à Nier : 3 > 2 ; face à Confesser : 1 > 0 » (≥ en cas d'égalité, comme au slide 20) */
function cmpText(g: Game, i: 0 | 1, cmps: Cmp[]): string {
  return cmps
    .map(({ o, a, b }) => `face à ${sName(g, i === 0 ? 1 : 0, o)} : ${num(g, a)} ${a > b ? ">" : "≥"} ${num(g, b)}`)
    .join(" ; ");
}

function StepText({ g, a, step, strict }: { g: Game; a: Analysis; step: Step; strict: boolean }) {
  const nR = g.rows.length;
  const nC = g.cols.length;
  if (step === 0) {
    return (
      <>
        <p>
          <strong>① Tous les profils.</strong> Un profil de stratégies = un choix pour chaque
          joueur = une case de la matrice. Ce jeu a {nR} × {nC} = {nR * nC} profils. On va les
          trier avec les trois solutions du cours, de la plus large (PSS) à la plus étroite (ESD).
        </p>
      </>
    );
  }
  if (step === 1) {
    const survivors = a.profiles.filter(([r, c]) => a.pss.has(key(r, c))).map(([r, c]) => key(r, c));
    return (
      <>
        <p>
          <strong>② PSS (H1 + H2).</strong> Un joueur rationnel ne joue pas une stratégie dominée
          (H1) ; s'il sait que l'autre est rationnel (H2.1, H2.2…), il raisonne dans le jeu réduit
          et on recommence.
          {strict ? " (Ici : élimination des stratégies strictement dominées.)" : null}
        </p>
        <ul className="mt-1.5 space-y-1">
          {a.rounds.length === 0 ? (
            <li>
              Aucune stratégie n'est dominée : on n'élimine rien, les {nR * nC} profils sont des PSS.
            </li>
          ) : (
            a.rounds.map((elims, k) =>
              elims.map((e) => (
                <li key={`${k}-${e.player}-${e.s}`}>
                  <span className="font-semibold">{k === 0 ? "Par H1" : `Itération ${k} (H2.${k})`}</span>
                  {" : "}
                  {k === 0 ? "" : "dans le jeu réduit, "}
                  {sName(g, e.player, e.s)} est dominée par {sName(g, e.player, e.by)} pour{" "}
                  {g.players[e.player].the} ({cmpText(g, e.player, e.cmps)}).
                </li>
              )),
            )
          )}
          {a.rounds.length > 0 ? (
            <li>
              Plus aucune stratégie dominée : le processus s'arrête. PSS :{" "}
              <strong>{listProfiles(g, survivors)}</strong>.
            </li>
          ) : null}
        </ul>
      </>
    );
  }
  if (step === 2) {
    const checked = a.profiles.filter(([r, c]) => a.pss.has(key(r, c)) || a.special.has(key(r, c)));
    return (
      <>
        <p>
          <strong>③ EN (H1 + H3).</strong> Chacun anticipe correctement ce que fait l'autre (H3) et
          y répond au mieux (H1) : on garde les profils faits de meilleures réponses mutuelles.
        </p>
        <ul className="mt-1.5 space-y-1">
          {checked.map(([r, c]) => (
            <li key={key(r, c)}>
              <EnLine g={g} a={a} r={r} c={c} />
            </li>
          ))}
          {a.en.size === 0 ? (
            <li>
              Aucun profil n'est fait de meilleures réponses mutuelles : pas d'EN en stratégies pures
              (slide 54).
            </li>
          ) : null}
        </ul>
      </>
    );
  }
  // step 3 : ESD
  return (
    <>
      <p>
        <strong>④ ESD (H1).</strong> Il faut que CHAQUE joueur ait une stratégie dominante : la
        meilleure quoi que fasse l'autre.
      </p>
      <ul className="mt-1.5 space-y-1">
        {([0, 1] as const).map((i) => (
          <li key={i}>
            <DominantLine g={g} a={a} i={i} />
          </li>
        ))}
        <li>
          {a.esd.size > 0 ? (
            <>
              → <strong>{listProfiles(g, [...a.esd])}</strong> est un ESD.
            </>
          ) : (
            <>→ Il manque une stratégie dominante : pas d'ESD (slide 13).</>
          )}
        </li>
      </ul>
    </>
  );
}

function EnLine({ g, a, r, c }: { g: Game; a: Analysis; r: number; c: number }) {
  const k = key(r, c);
  const p = prof(g, r, c);
  const ineq1 = range(g.rows.length)
    .filter((r2) => r2 !== r)
    .map((r2) => `${num(g, g.pay[r][c][0])} ≥ ${num(g, g.pay[r2][c][0])}`)
    .join(" et ");
  const ineq2 = range(g.cols.length)
    .filter((c2) => c2 !== c)
    .map((c2) => `${num(g, g.pay[r][c][1])} ≥ ${num(g, g.pay[r][c2][1])}`)
    .join(" et ");
  const why = (
    <>
      {g.rows[r]} est une meilleure réponse à {g.cols[c]} ({ineq1}) et {g.cols[c]} est une
      meilleure réponse à {g.rows[r]} ({ineq2})
    </>
  );
  if (a.special.has(k)) {
    return (
      <span>
        <span className="font-bold text-amber-700 dark:text-amber-400">⚠ {p}</span> est un EN : {why}…
        mais il a été éliminé à l'étape ② ! Voir la note ¹ ci-dessous.
      </span>
    );
  }
  if (a.en.has(k)) {
    return (
      <span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">✓ {p}</span> : {why} → EN.
      </span>
    );
  }
  // première déviation profitable trouvée (joueur ligne d'abord)
  let best1 = r;
  for (const r2 of range(g.rows.length)) if (g.pay[r2][c][0] > g.pay[best1][c][0]) best1 = r2;
  if (best1 !== r) {
    return (
      <span>
        <span className="font-bold text-sky-700 dark:text-sky-400">✗ {p}</span> : face à {g.cols[c]},{" "}
        {g.players[0].wins} {num(g, g.pay[best1][c][0])} avec {g.rows[best1]} au lieu de{" "}
        {num(g, g.pay[r][c][0])} → pas un EN.
      </span>
    );
  }
  let best2 = c;
  for (const c2 of range(g.cols.length)) if (g.pay[r][c2][1] > g.pay[r][best2][1]) best2 = c2;
  return (
    <span>
      <span className="font-bold text-sky-700 dark:text-sky-400">✗ {p}</span> : face à {g.rows[r]},{" "}
      {g.players[1].wins} {num(g, g.pay[r][best2][1])} avec {g.cols[best2]} au lieu de{" "}
      {num(g, g.pay[r][c][1])} → pas un EN.
    </span>
  );
}

function DominantLine({ g, a, i }: { g: Game; a: Analysis; i: 0 | 1 }) {
  const own = range(i === 0 ? g.rows.length : g.cols.length);
  const opp = range(i === 0 ? g.cols.length : g.rows.length);
  const d = a.dom[i];
  const who = g.players[i].the;
  if (d !== null) {
    const others = own.filter((s) => s !== d);
    return (
      <span>
        Pour {who} : <strong>{sName(g, i, d)}</strong> est dominante
        {others.length === 1 ? <> ({cmpText(g, i, compareTo(g, i, others[0], d, opp))})</> : null}.
      </span>
    );
  }
  const bests = opp.map((o) => {
    const mx = Math.max(...own.map((s) => payOf(g, i, s, o)));
    const names = own.filter((s) => payOf(g, i, s, o) === mx).map((s) => sName(g, i, s));
    return `${names.join(" ou ")} face à ${sName(g, i === 0 ? 1 : 0, o)}`;
  });
  return (
    <span>
      Pour {who} : pas de stratégie dominante, la meilleure réponse dépend de l'autre ({bests.join(", ")}).
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Matrice colorée par zone                                            */
/* ------------------------------------------------------------------ */

const CELL_TONE: Record<ZoneId, string> = {
  O: "border-border bg-background",
  P: "border-sky-400/70 bg-sky-500/10",
  E: "border-emerald-500/70 bg-emerald-500/15",
  D: "border-rose-500/70 bg-rose-500/15",
  S: "border-dashed border-amber-500 bg-emerald-500/15",
};

function ZoneMatrix({ g, a, step }: { g: Game; a: Analysis; step: Step }) {
  const deadRows = new Set(step >= 1 ? range(g.rows.length).filter((r) => !a.liveRows.includes(r)) : []);
  const deadCols = new Set(step >= 1 ? range(g.cols.length).filter((c) => !a.liveCols.includes(c)) : []);
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-[13.5px]">
        <thead>
          <tr>
            <th className="p-1 text-left align-bottom text-[11px] font-bold uppercase leading-tight tracking-wide text-rose-700 dark:text-rose-400">
              {g.players[0].short} ↓
            </th>
            <th
              colSpan={g.cols.length}
              className="p-1 text-center text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400"
            >
              {g.players[1].short} →
            </th>
          </tr>
          <tr>
            <th className="p-1" />
            {g.cols.map((c, j) => (
              <th
                key={c + j}
                className={cn(
                  "px-1.5 py-1 text-center font-semibold text-sky-700 transition-opacity dark:text-sky-400",
                  deadCols.has(j) && "line-through opacity-40",
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {g.rows.map((rl, r) => (
            <tr key={rl + r}>
              <th
                className={cn(
                  "px-1.5 py-1 text-right font-semibold text-rose-700 transition-opacity dark:text-rose-400",
                  deadRows.has(r) && "line-through opacity-40",
                )}
              >
                {rl}
              </th>
              {g.cols.map((_, c) => {
                const z = zoneAt(a, key(r, c), step);
                const dead = deadRows.has(r) || deadCols.has(c);
                return (
                  <td key={c} className="p-0.5">
                    <div
                      className={cn(
                        "whitespace-nowrap rounded-lg border-2 px-2 py-1.5 text-center tabular-nums transition-colors duration-500",
                        CELL_TONE[z],
                        dead && z === "O" && "opacity-45",
                      )}
                    >
                      <span className="font-semibold text-rose-700 dark:text-rose-400">{num(g, g.pay[r][c][0])}</span>
                      <span className="text-muted-foreground"> ; </span>
                      <span className="font-semibold text-sky-700 dark:text-sky-400">{num(g, g.pay[r][c][1])}</span>
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

/* ------------------------------------------------------------------ */
/* Le composant                                                        */
/* ------------------------------------------------------------------ */

export function SolutionVenn() {
  const [gameId, setGameId] = useState<GameId>("g3");
  const [step, setStep] = useState<Step>(3);
  const [playing, setPlaying] = useState(false);
  const [strictBank, setStrictBank] = useState(false);

  const g = GAMES[gameId];
  const strict = gameId === "bankg" && strictBank;
  const a = useMemo(() => analyse(g, strict), [g, strict]);

  // lecture automatique du tri : une étape toutes les STEP_MS millisecondes
  useEffect(() => {
    if (!playing) return;
    if (step >= 3) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => (Math.min(3, s + 1) as Step)), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  function selectGame(id: GameId) {
    if (id === gameId) return;
    const sameFamily = GAMES[id].family === g.family;
    setGameId(id);
    if (sameFamily) return; // banque g = 0 ↔ g ≥ m : les points glissent directement
    if (reducedMotion()) {
      setPlaying(false);
      setStep(3);
    } else {
      setStep(0);
      setPlaying(true);
    }
  }

  function replay() {
    setStep(0);
    setPlaying(!reducedMotion());
  }

  // positions : un profil éliminé garde sa place ; les autres se rangent dans leur zone
  const pOrder = a.profiles
    .map(([r, c]) => key(r, c))
    .filter((k) => !a.special.has(k) && (a.depth.get(k) ?? 0) >= 1)
    .sort((k1, k2) => Number((a.depth.get(k1) ?? 0) > 1) - Number((a.depth.get(k2) ?? 0) > 1));
  const eOrder = a.profiles
    .map(([r, c]) => key(r, c))
    .filter((k) => !a.special.has(k) && (a.depth.get(k) ?? 0) >= 2)
    .sort((k1, k2) => Number((a.depth.get(k1) ?? 0) > 2) - Number((a.depth.get(k2) ?? 0) > 2));
  const dots = a.profiles.map(([r, c], idx) => {
    const k = key(r, c);
    const z = zoneAt(a, k, step);
    const list = SLOTS[z];
    const slotIdx = z === "O" ? idx : z === "P" ? pOrder.indexOf(k) : z === "E" ? eOrder.indexOf(k) : 0;
    const [x, y, place] = list[Math.max(0, slotIdx) % list.length];
    return { k, r, c, z, x, y, place };
  });

  const focus: ZoneId = (["O", "P", "E", "D"] as const)[step];
  const zoneKeys = (z: ZoneId) => dots.filter((d) => d.z === z).map((d) => d.k);
  const legendRows: Array<{ z: ZoneId; title: string; keys: Key[] | null; later?: string }> = [
    { z: "D", title: "ESD (H1)", keys: step >= 3 ? zoneKeys("D") : null, later: "étape ④" },
    {
      z: "E",
      title: step >= 3 ? "EN (H1 + H3), hors ESD" : "EN (H1 + H3)",
      keys: step >= 2 ? zoneKeys("E") : null,
      later: "étape ③",
    },
    {
      z: "P",
      title: step >= 2 ? "PSS (H1 + H2), hors EN" : "PSS (H1 + H2)",
      keys: step >= 1 ? zoneKeys("P") : null,
      later: "étape ②",
    },
    {
      z: "O",
      title: step === 0 ? "Pas encore triés" : "Hors PSS (éliminés)",
      keys: zoneKeys("O"),
    },
  ];
  if (a.special.size > 0 && step >= 2) {
    legendRows.push({ z: "S", title: "EN éliminé par le « ≥ » (note ¹)", keys: zoneKeys("S") });
  }

  const ellipseStyle = (z: "P" | "E" | "D", base: number) => ({
    fill: ZONE_COLOR[z],
    fillOpacity: focus === z ? base * 1.9 : base,
    stroke: ZONE_COLOR[z],
  });

  return (
    <InteractiveCard
      title="Les trois solutions sur un même dessin : ESD ⊂ EN ⊂ PSS"
      subtitle={
        <>
          Slide 37 : « un ESD est un EN, un EN est un PSS¹ ». Choisis un jeu : chaque profil (une case
          de la matrice) est rangé dans sa zone, calculée à partir de la matrice du slide.
        </>
      }
      controls={
        <>
          <ChoiceChips<GameId>
            className="sm:col-span-2 lg:col-span-3"
            label="Jeu"
            value={gameId}
            onChange={selectGame}
            options={ORDER.map((id) => ({ value: id, label: GAMES[id].chip }))}
          />
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
            <ChoiceChips<"0" | "1" | "2" | "3">
              label="Étape du tri"
              value={String(step) as "0" | "1" | "2" | "3"}
              onChange={(v) => {
                setPlaying(false);
                setStep(Number(v) as Step);
              }}
              options={STEP_CHIPS}
            />
            <button
              type="button"
              onClick={replay}
              className="rounded-full border border-primary/40 bg-background px-3 py-1 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
            >
              {playing ? "Tri en cours…" : "▶ Rejouer le tri"}
            </button>
          </div>
        </>
      }
      footer={
        <>
          un point n'entre jamais dans l'ESD sans être dans l'EN : une stratégie dominante est une
          meilleure réponse à tout. Un EN survit à l'élimination, car une stratégie jouée dans un EN
          est une meilleure réponse, donc jamais <em>strictement</em> dominée (la seule exception
          vient du « ≥ » : note ¹). Paradoxe apparent : le plus petit ensemble, l'ESD, ne demande que
          l'hypothèse la plus faible (H1). C'est le jeu qui fait le travail, pas les hypothèses : il
          faut que chaque joueur ait une stratégie dominante, ce qui est rare (slide 18). Sinon, il
          faut ajouter H2 (PSS) ou H3 (EN) pour prédire quelque chose.
        </>
      }
    >
      <div className="mb-2 text-center text-[14px] font-bold">
        {g.title} <span className="font-normal text-muted-foreground">({g.slide})</span>
      </div>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="mx-auto block h-auto w-full"
        style={{ maxWidth: 600 }}
        role="img"
        aria-label={`Diagramme de Venn : tous les profils contiennent les PSS, qui contiennent les EN, qui contiennent les ESD. Jeu : ${g.title}. ESD : ${listProfiles(g, [...a.esd])} ; EN : ${listProfiles(g, [...a.en])} ; PSS : ${listProfiles(g, [...a.pss])}.`}
      >
        <text x={260} y={20} textAnchor="middle" fontSize={13} fontWeight={600} style={{ fill: C.ink }}>
          Tous les profils de stratégies d'un jeu
        </text>
        <ellipse
          cx={ELL.O.cx}
          cy={ELL.O.cy}
          rx={ELL.O.rx}
          ry={ELL.O.ry}
          style={{ fill: C.soft, fillOpacity: focus === "O" ? 0.09 : 0.04, stroke: C.soft }}
          strokeWidth={focus === "O" ? 2.8 : 1.6}
          className="transition-all duration-500"
        />
        <ellipse
          cx={ELL.P.cx}
          cy={ELL.P.cy}
          rx={ELL.P.rx}
          ry={ELL.P.ry}
          style={ellipseStyle("P", 0.06)}
          strokeWidth={focus === "P" ? 3.2 : 1.8}
          className="transition-all duration-500"
        />
        <ellipse
          cx={ELL.E.cx}
          cy={ELL.E.cy}
          rx={ELL.E.rx}
          ry={ELL.E.ry}
          style={ellipseStyle("E", 0.08)}
          strokeWidth={focus === "E" ? 3.2 : 1.8}
          className="transition-all duration-500"
        />
        <ellipse
          cx={ELL.D.cx}
          cy={ELL.D.cy}
          rx={ELL.D.rx}
          ry={ELL.D.ry}
          style={ellipseStyle("D", 0.1)}
          strokeWidth={focus === "D" ? 3.2 : 1.8}
          className="transition-all duration-500"
        />
        {(
          [
            ["PSS (H1 + H2)", 102, "P"],
            ["EN (H1 + H3)", 164, "E"],
            ["ESD (H1)", 230, "D"],
          ] as const
        ).map(([t, y, z]) => (
          <text
            key={t}
            x={260}
            y={y}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            style={{ fill: ZONE_COLOR[z], stroke: HALO }}
            strokeWidth={3}
            paintOrder="stroke"
          >
            {t}
          </text>
        ))}
        {dots.map((d) => {
          const lp = labelProps(d.place);
          return (
            <g
              key={`${g.family}-${d.k}`}
              className="transition-transform duration-700 ease-in-out motion-reduce:transition-none"
              style={{ transform: `translate(${d.x}px, ${d.y}px)` }}
            >
              {d.z === "S" ? (
                <circle r={10.5} fill="none" style={{ stroke: C.gold }} strokeWidth={2} strokeDasharray="3 2.5" />
              ) : null}
              <circle
                r={6}
                className="transition-[fill] duration-500"
                style={{ fill: ZONE_COLOR[d.z], stroke: HALO }}
                strokeWidth={1.6}
              />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor={lp.textAnchor}
                fontSize={13}
                fontWeight={600}
                style={{ fill: C.ink, stroke: HALO }}
                strokeWidth={3.5}
                paintOrder="stroke"
              >
                {prof(g, d.r, d.c)}
                {d.z === "S" ? "¹" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center text-[12.5px] text-muted-foreground">
        ¹ « Pour être précis, un EN est un PSS si on définit les PSS sur base de l'élimination des
        stratégies <em>strictement</em> dominées » (slide 37). Exemple : la banque avec g ≥ m.
      </p>

      <ul className="mx-auto mt-3 grid max-w-xl gap-1 text-[13.5px]">
        {legendRows.map((row) => (
          <li key={row.z} className="flex items-baseline gap-2">
            <span
              className={cn("inline-block h-3 w-3 shrink-0 translate-y-[1px] rounded-full", row.z === "S" && "ring-2 ring-amber-500")}
              style={{ background: ZONE_COLOR[row.z] }}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="font-semibold">{row.title} :</span>{" "}
              {row.keys === null ? (
                <span className="text-muted-foreground">(on le saura à l'{row.later})</span>
              ) : (
                listProfiles(g, row.keys)
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
        <div className="min-w-0">
          <ZoneMatrix g={g} a={a} step={step} />
          {g.note ? <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-snug text-muted-foreground">{g.note}</p> : null}
        </div>
        <div
          className="min-w-0 rounded-xl border border-dashed bg-muted/50 px-4 py-3 text-[14px] leading-relaxed"
          aria-live="polite"
        >
          <StepText g={g} a={a} step={step} strict={strict} />
        </div>
      </div>

      {gameId === "bankg" && step >= 1 ? (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50/70 px-4 py-3 text-[14px] leading-relaxed dark:border-amber-800 dark:bg-amber-950/30">
          <p>
            <strong>Note ¹ du slide 37, en direct.</strong> Avec la définition du cours (≥), Retirer
            est dominée par Laisser (face à Laisser : <M tex="m(1+r)>m" /> ; face à Retirer :{" "}
            <M tex="m\geq m" />
            ). On l'élimine, et (R, R) sort des PSS. Pourtant (R, R) est un EN : face à Retirer,
            Retirer rapporte <M tex="m" />, autant que Laisser. Si l'on n'élimine que les stratégies{" "}
            <em>strictement</em> dominées, Retirer reste{" "}
            <span className="whitespace-nowrap">
              (<M tex="m=m" /> n'est
            </span>{" "}
            pas une inégalité stricte) et (R, R) redevient un PSS.
          </p>
          <button
            type="button"
            onClick={() => setStrictBank((v) => !v)}
            className="mt-2 rounded-full border border-amber-500 bg-background px-3 py-1 text-[13px] font-semibold text-amber-800 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            {strictBank
              ? "Revenir à la définition du cours (≥)"
              : "Voir avec l'élimination des stratégies strictement dominées (>)"}
          </button>
        </div>
      ) : null}
    </InteractiveCard>
  );
}
