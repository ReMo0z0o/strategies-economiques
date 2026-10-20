/*
 * SpneVenn — B2 § 3 · « un ENPS est un EN » (diagramme de Venn du slide 12).
 *
 * Grande ellipse « Tous les profils de stratégies d'un jeu séquentiel », EN à
 * l'intérieur, ENPS à l'intérieur de EN. Trois vues :
 *  - « Schéma du slide » : les 15 points du slide (10 hors EN, 3 dans EN∖ENPS,
 *    2 dans ENPS ; compté sur le PNG p12) ;
 *  - « Jeu de l'entrée » (4 profils) et « Jeu du § 4 » (8 profils) : chaque
 *    profil est rangé dans sa zone, CALCULÉE à partir des paiements :
 *    EN = normalForm2 + pureNash ; ENPS = backwardInduction (vérifié par la
 *    définition du slide 11 : EN dans chaque sous-jeu). Le tri se rejoue pas à
 *    pas : tous → EN → ENPS.
 * Géométrie vérifiée en Python (étiquettes dans leur zone, marges ≥ 4 px, pas
 * de chevauchement).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChoiceChips, InteractiveCard } from "@/components/course/Interactive";
import {
  GT_COLORS,
  backwardInduction,
  choicesOf,
  decisionLevel,
  leaf,
  node,
  normalForm2,
  playPath,
  preorder,
  pureNash,
  type GTGame,
  type GTNode,
  type GTStrategy,
  type NormalForm2,
} from "@/chapters/shared/gametree";
import { C, fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const HALO = "var(--color-card)";
const COL = [GT_COLORS[0], GT_COLORS[1]];
const Z_COLOR = { O: C.soft, E: C.green, S: C.violet } as const;
type Zone = keyof typeof Z_COLOR;

/* ------------------------------------------------------------------ */
/* Les deux jeux du cours                                              */
/* ------------------------------------------------------------------ */

interface Game {
  chip: string;
  title: string;
  game: GTGame;
  /** « la firme 1 »… / « J1 »… */
  who: [string, string];
  /** libellé d'une stratégie dans les profils : initiales (entrée) ou libellé (§ 4) */
  short: (s: GTStrategy) => string;
}
const initials = (s: GTStrategy) => s.actions.map((a) => a[0]).join("");

const GAMES: Record<"entree" | "s4", Game> = {
  entree: {
    chip: "Jeu de l'entrée",
    title: "Jeu de l'entrée (slides 3-11)",
    who: ["la firme 1", "la firme 2"],
    short: initials,
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
    chip: "Jeu du § 4",
    title: "Jeu du § 4 (slides 14-18)",
    who: ["J1", "J2"],
    short: (s) => s.label,
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

/* ------------------------------------------------------------------ */
/* Calculs : EN, ENPS, raisons                                         */
/* ------------------------------------------------------------------ */

type Choice = Record<string, number>;
interface Dev {
  player: 0 | 1;
  from: GTStrategy;
  to: GTStrategy;
  cur: number;
  alt: number;
}
interface SubCheck {
  node: GTNode;
  ok: boolean;
  /** déviation profitable (la meilleure), s'il y en a une */
  dev?: Dev;
}

/** Le profil, restreint au sous-jeu qui commence en `n`, est-il un EN de ce sous-jeu ? */
function checkSubgame(g: GTGame, n: GTNode, choice: Choice): SubCheck {
  const nf = normalForm2({ players: g.players, root: n });
  const fits = (s: GTStrategy) => Object.entries(s.choice).every(([id, k]) => choice[id] === k);
  const i = nf.rows.findIndex(fits);
  const j = nf.cols.findIndex(fits);
  const devs: Dev[] = [];
  nf.rows.forEach((r, k) => {
    if (k !== i && nf.cells[k][j][0] > nf.cells[i][j][0])
      devs.push({
        player: 0,
        from: nf.rows[i],
        to: r,
        cur: nf.cells[i][j][0],
        alt: nf.cells[k][j][0],
      });
  });
  nf.cols.forEach((c, k) => {
    if (k !== j && nf.cells[i][k][1] > nf.cells[i][j][1])
      devs.push({
        player: 1,
        from: nf.cols[j],
        to: c,
        cur: nf.cells[i][j][1],
        alt: nf.cells[i][k][1],
      });
  });
  devs.sort((a, b) => b.alt - b.cur - (a.alt - a.cur));
  return { node: n, ok: devs.length === 0, dev: devs[0] };
}

interface Profile {
  key: string;
  i: number;
  j: number;
  name: string;
  choice: Choice;
  outcome: number[];
  isEN: boolean;
  isSPNE: boolean;
  /** EN dans chaque sous-jeu (du dernier au jeu complet) */
  checks: SubCheck[];
}
interface Analysis {
  nf: NormalForm2;
  profiles: Profile[];
  nSub: number;
}

function analyse(G: Game): Analysis {
  const g = G.game;
  const nf = normalForm2(g);
  const { eq } = pureNash(nf.cells);
  const bi = choicesOf(backwardInduction(g));
  const order = new Map(preorder(g.root).map((n, k) => [n.id, k]));
  const decisions = (preorder(g.root).filter((n) => n.kind === "node") as GTNode[]).sort(
    (a, b) => decisionLevel(a) - decisionLevel(b) || order.get(a.id)! - order.get(b.id)!,
  );
  const profiles: Profile[] = [];
  nf.rows.forEach((r, i) =>
    nf.cols.forEach((c, j) => {
      const choice = { ...r.choice, ...c.choice };
      const isEN = eq.some(([a, b]) => a === i && b === j);
      const isSPNE = isEN && Object.entries(choice).every(([id, k]) => bi[id] === k);
      const checks = decisions.map((n) => checkSubgame(g, n, choice));
      if (isSPNE !== checks.every((x) => x.ok))
        console.warn("SpneVenn : backward induction et définition divergent", r.label, c.label);
      profiles.push({
        key: `${i},${j}`,
        i,
        j,
        name: `(${G.short(r)}, ${G.short(c)})`,
        choice,
        outcome: nf.cells[i][j],
        isEN,
        isSPNE,
        checks,
      });
    }),
  );
  return { nf, profiles, nSub: decisions.length };
}

/* ------------------------------------------------------------------ */
/* Géométries (vérifiées en Python)                                    */
/* ------------------------------------------------------------------ */

type Place = "below" | "above" | "right" | "left";
type Slot = readonly [number, number, Place];
interface Geom {
  w: number;
  h: number;
  ell: Record<Zone, { cx: number; cy: number; rx: number; ry: number }>;
  slots: Record<Zone, readonly Slot[]>;
  /** les 15 points du slide 12 (positions du PNG ramenées à cette géométrie) */
  slide: ReadonlyArray<readonly [number, number, Zone]>;
  /** titre (une ou deux lignes) : [texte, x, y] */
  title: ReadonlyArray<readonly [string, number, number]>;
  en: readonly [number, number];
  enps: readonly [number, number];
}
/** Paysage (écran large) — vérifié : SP/anB2a/venn_geom.py */
const WIDE: Geom = {
  w: 520,
  h: 362,
  ell: {
    O: { cx: 260, cy: 196, rx: 254, ry: 156 },
    E: { cx: 250, cy: 205, rx: 160, ry: 108 },
    S: { cx: 282, cy: 228, rx: 88, ry: 56 },
  },
  slots: {
    S: [[266, 232, "right"]],
    E: [
      [142, 196, "below"],
      [204, 138, "right"],
      [330, 124, "below"],
    ],
    O: [
      [60, 150, "below"],
      [450, 140, "below"],
      [450, 245, "below"],
      [176, 326, "right"],
      [268, 330, "right"],
      [150, 68, "below"],
      [378, 72, "below"],
      [474, 196, "above"],
    ],
  },
  slide: [
    [165, 88, "O"],
    [93, 139, "O"],
    [394, 123, "O"],
    [457, 191, "O"],
    [483, 220, "O"],
    [76, 239, "O"],
    [430, 258, "O"],
    [160, 309, "O"],
    [352, 296, "O"],
    [273, 326, "O"],
    [312, 133, "E"],
    [166, 161, "E"],
    [166, 236, "E"],
    [228, 207, "S"],
    [340, 224, "S"],
  ],
  title: [["Tous les profils de stratégies d'un jeu séquentiel", 260, 22]],
  en: [232, 88],
  enps: [268, 166],
};
/** Portrait (téléphone) : étiquettes affichées à ~12 px — vérifié : SP/anB2a/venn_tall_near.py */
const TALL: Geom = {
  w: 360,
  h: 482,
  ell: {
    O: { cx: 180, cy: 262, rx: 176, ry: 214 },
    E: { cx: 178, cy: 276, rx: 124, ry: 138 },
    S: { cx: 188, cy: 312, rx: 74, ry: 58 },
  },
  slots: {
    S: [[176, 306, "right"]],
    E: [
      [132, 186, "right"],
      [96, 262, "above"],
      [236, 200, "below"],
    ],
    O: [
      [104, 104, "below"],
      [190, 66, "below"],
      [282, 122, "below"],
      [62, 178, "above"],
      [303, 187, "above"],
      [116, 440, "right"],
      [215, 450, "above"],
      [259, 400, "below"],
    ],
  },
  slide: [
    [114, 114, "O"],
    [64, 184, "O"],
    [273, 162, "O"],
    [317, 255, "O"],
    [335, 295, "O"],
    [53, 321, "O"],
    [298, 347, "O"],
    [111, 417, "O"],
    [244, 399, "O"],
    [189, 440, "O"],
    [216, 176, "E"],
    [115, 214, "E"],
    [92, 322, "E"],
    [158, 277, "S"],
    [235, 300, "S"],
  ],
  title: [
    ["Tous les profils de stratégies", 180, 18],
    ["d'un jeu séquentiel", 180, 35],
  ],
  en: [178, 160],
  enps: [188, 252],
};

/** écran étroit ? (rendu serveur : non ; mis à jour au montage) */
function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 560px)");
    if (!mq) return;
    const up = () => setNarrow(mq.matches);
    up();
    mq.addEventListener("change", up);
    return () => mq.removeEventListener("change", up);
  }, []);
  return narrow;
}

function labelProps(place: Place) {
  if (place === "below") return { x: 0, y: 21, textAnchor: "middle" as const };
  if (place === "above") return { x: 0, y: -11, textAnchor: "middle" as const };
  if (place === "left") return { x: -10, y: 4.5, textAnchor: "end" as const };
  return { x: 10, y: 4.5, textAnchor: "start" as const };
}
function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

type View = "slide" | "entree" | "s4";
type Step = 0 | 1 | 2;
const STEP_MS = 2200;

/** zone d'un profil à l'étape `step` du tri */
const zoneAt = (p: Profile, step: Step): Zone =>
  step >= 2 && p.isSPNE ? "S" : step >= 1 && p.isEN ? "E" : "O";

/* ------------------------------------------------------------------ */
/* Textes                                                              */
/* ------------------------------------------------------------------ */

const SUB = "₀₁₂₃₄₅₆₇₈₉";
/** « que » ou « qu' » devant un mot */
const que = (w: string) => (/^[aeiouyéèêàh]/i.test(w) ? "qu'" : "que ");
const nice = (s: string) => s.replace(/\d/g, (d) => SUB[Number(d)]);

function Strat({ p, children }: { p: number; children: ReactNode }) {
  return (
    <span className="font-semibold" style={{ color: COL[p] }}>
      {children}
    </span>
  );
}

function ENLine({ G, a, p }: { G: Game; a: Analysis; p: Profile }) {
  const whole = p.checks[p.checks.length - 1];
  if (p.isEN) {
    return (
      <span>
        <span className="font-bold text-emerald-700">✓ {p.name}</span> : aucun joueur ne gagne à
        changer seul de stratégie → EN.
      </span>
    );
  }
  const d = whole.dev!;
  const opp = d.player === 0 ? a.nf.cols[p.j] : a.nf.rows[p.i];
  return (
    <span>
      <span className="font-bold text-muted-foreground">✗ {p.name}</span> : face à{" "}
      <Strat p={1 - d.player}>{opp.label}</Strat>, {G.who[d.player]} obtiendrait {fmt(d.alt)} au
      lieu de {fmt(d.cur)} avec <Strat p={d.player}>{d.to.label}</Strat> → pas un EN.
    </span>
  );
}

function SPNELine({ G, p, nSub }: { G: Game; p: Profile; nSub: number }) {
  if (p.isSPNE) {
    return (
      <span>
        <span className="font-bold" style={{ color: Z_COLOR.S }}>
          ★ {p.name}
        </span>{" "}
        : EN dans chacun des {nSub} sous-jeux → ENPS. C'est le profil que trouve la backward
        induction.
      </span>
    );
  }
  const bad = p.checks.find((c) => !c.ok)!;
  const d = bad.dev!;
  const where = bad.node.name
    ? `en ${nice(bad.node.name)}`
    : `au nœud de ${G.who[bad.node.player]}`;
  const reached = playPath(G.game, p.choice).ids.includes(bad.node.id);
  return (
    <span>
      <span className="font-bold text-emerald-700">✗ {p.name}</span> : un EN, mais pas un ENPS. Dans
      le sous-jeu qui commence {where}
      {reached ? "" : " (jamais atteint avec ce profil)"}, {G.who[d.player]} prévoit{" "}
      <Strat p={d.player}>{d.from.label}</Strat>, qui lui rapporte {fmt(d.cur)}, alors{" "}
      {que(d.to.label)}
      <Strat p={d.player}>{d.to.label}</Strat> lui rapporterait {fmt(d.alt)}. Ce n'est pas un EN de
      ce sous-jeu : arrivé là, {G.who[d.player]} ne suivrait pas ce plan, qui n'est donc{" "}
      <strong>pas crédible</strong>.
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Matrice colorée par zone                                            */
/* ------------------------------------------------------------------ */

const CELL_TONE: Record<Zone, string> = {
  O: "border-border bg-background",
  E: "border-emerald-500/70 bg-emerald-500/10",
  S: "border-violet-500/80 bg-violet-500/15",
};

function ZoneMatrix({ G, a, step }: { G: Game; a: Analysis; step: Step }) {
  const P = G.game.players;
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse text-[13.5px]">
        <thead>
          <tr>
            <th
              className="p-1 text-left align-bottom text-[11px] font-bold uppercase leading-tight"
              style={{ color: COL[0] }}
            >
              {P[0].name} ↓
            </th>
            <th
              colSpan={a.nf.cols.length}
              className="p-1 text-center text-[11px] font-bold uppercase"
              style={{ color: COL[1] }}
            >
              {P[1].name} →
            </th>
          </tr>
          <tr>
            <th />
            {a.nf.cols.map((c) => (
              <th
                key={c.label}
                className="px-1 py-0.5 text-center font-semibold"
                style={{ color: COL[1] }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {a.nf.rows.map((r, i) => (
            <tr key={r.label}>
              <th className="px-1.5 py-0.5 text-right font-semibold" style={{ color: COL[0] }}>
                {r.label}
              </th>
              {a.nf.cols.map((c, j) => {
                const p = a.profiles.find((x) => x.i === i && x.j === j)!;
                const z = zoneAt(p, step);
                return (
                  <td key={c.label} className="p-0.5">
                    <div
                      className={cn(
                        "whitespace-nowrap rounded-lg border-2 px-2 py-1 text-center tabular-nums transition-colors duration-500",
                        CELL_TONE[z],
                      )}
                    >
                      <span className="font-semibold" style={{ color: COL[0] }}>
                        {fmt(p.outcome[0])}
                      </span>
                      <span className="text-muted-foreground"> ; </span>
                      <span className="font-semibold" style={{ color: COL[1] }}>
                        {fmt(p.outcome[1])}
                      </span>
                      {z === "S" ? <span className="ml-1 text-violet-600">★</span> : null}
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

export function SpneVenn() {
  const [view, setView] = useState<View>("slide");
  const [step, setStep] = useState<Step>(2);
  const [playing, setPlaying] = useState(false);
  const geo = useNarrow() ? TALL : WIDE;
  const analyses = useMemo(() => ({ entree: analyse(GAMES.entree), s4: analyse(GAMES.s4) }), []);

  useEffect(() => {
    if (!playing) return;
    if (step >= 2) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => Math.min(2, s + 1) as Step), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  const start = (v: View) => {
    setView(v);
    if (v === "slide" || reducedMotion()) {
      setPlaying(false);
      setStep(2);
    } else {
      setStep(0);
      setPlaying(true);
    }
  };

  const G = view === "slide" ? null : GAMES[view];
  const a = view === "slide" ? null : analyses[view];

  // positions : un profil hors EN garde sa place ; les autres se rangent dans leur zone
  const dots = (() => {
    if (!a || !G) return [];
    const eOrder = a.profiles
      .filter((p) => p.isEN)
      .sort((p, q) => Number(p.isSPNE) - Number(q.isSPNE));
    return a.profiles.map((p, idx) => {
      const z = zoneAt(p, step);
      const list = geo.slots[z];
      const slot = z === "O" ? idx : z === "E" ? eOrder.indexOf(p) : 0;
      const [x, y, place] = list[slot % list.length];
      return { p, z, x, y, place };
    });
  })();

  const counts = a
    ? {
        all: a.profiles.length,
        en: a.profiles.filter((p) => p.isEN).length,
        spne: a.profiles.filter((p) => p.isSPNE).length,
      }
    : {
        all: geo.slide.length,
        en: geo.slide.filter((d) => d[2] !== "O").length,
        spne: geo.slide.filter((d) => d[2] === "S").length,
      };

  const aria =
    a && G
      ? `Diagramme de Venn, ${G.title} : ${counts.all} profils ; EN : ${a.profiles
          .filter((p) => p.isEN)
          .map((p) => p.name)
          .join(", ")} ; ENPS : ${a.profiles
          .filter((p) => p.isSPNE)
          .map((p) => p.name)
          .join(", ")}.`
      : `Diagramme de Venn du slide 12 : ${counts.all} profils de stratégies, dont ${counts.en} EN, dont ${counts.spne} ENPS. L'ensemble des ENPS est contenu dans celui des EN.`;

  const ell = (z: Zone, base: number) => {
    const e = geo.ell[z];
    const lit = a && ((z === "E" && step === 1) || (z === "S" && step === 2));
    return (
      <ellipse
        cx={e.cx}
        cy={e.cy}
        rx={e.rx}
        ry={e.ry}
        style={{
          fill: Z_COLOR[z],
          fillOpacity: lit ? base * 2 : base,
          stroke: z === "O" ? C.ink : Z_COLOR[z],
        }}
        strokeWidth={lit ? 3 : 1.8}
        className="transition-all duration-500"
      />
    );
  };

  return (
    <InteractiveCard
      title="Un ENPS est un EN (diagramme de Venn du slide 12)"
      subtitle={
        <>
          Chaque point est un profil de stratégies. Choisis un jeu : ses profils sont triés, d'abord
          les EN (forme normale), puis les ENPS (EN dans chaque sous-jeu), calculés à partir des
          paiements.
        </>
      }
      controls={
        <>
          <ChoiceChips<View>
            className="sm:col-span-2 lg:col-span-3"
            label="Vue"
            value={view}
            onChange={start}
            options={[
              { value: "slide", label: "Schéma du slide" },
              {
                value: "entree",
                label: `${GAMES.entree.chip} (${analyses.entree.profiles.length} profils)`,
              },
              { value: "s4", label: `${GAMES.s4.chip} (${analyses.s4.profiles.length} profils)` },
            ]}
          />
          {a ? (
            <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
              <ChoiceChips<"0" | "1" | "2">
                label="Étape du tri"
                value={String(step) as "0" | "1" | "2"}
                onChange={(v) => {
                  setPlaying(false);
                  setStep(Number(v) as Step);
                }}
                options={[
                  { value: "0", label: "① Tous" },
                  { value: "1", label: "② EN" },
                  { value: "2", label: "③ ENPS" },
                ]}
              />
              <button
                type="button"
                onClick={() => start(view)}
                className="rounded-full border border-primary/40 bg-background px-3 py-1 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
              >
                {playing ? "Tri en cours…" : "▶ Rejouer le tri"}
              </button>
            </div>
          ) : null}
        </>
      }
      footer={
        <>
          l'ellipse ENPS est entièrement dans l'ellipse EN : pour être parfait en sous-jeux, un
          profil doit d'abord être un EN du jeu complet (le jeu complet est lui-même un sous-jeu).
          La réciproque est fausse : un EN peut reposer sur une menace non crédible. Et la zone ENPS
          n'est jamais vide : tout jeu séquentiel fini à information complète a au moins un ENPS,
          que la backward induction trouve (théorème du slide 13).
        </>
      }
    >
      {G ? (
        <div className="mb-1 text-center text-[14px] font-bold">{G.title}</div>
      ) : (
        <div className="mb-1 text-center text-[14px] font-bold">
          Le schéma du slide 12{" "}
          <span className="font-normal text-muted-foreground">(profils non nommés)</span>
        </div>
      )}
      <svg
        viewBox={`0 0 ${geo.w} ${geo.h}`}
        className="mx-auto block h-auto w-full"
        style={{ maxWidth: 600 }}
        role="img"
        aria-label={aria}
      >
        {geo.title.map(([t, x, y]) => (
          <text
            key={t}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={13.5}
            fontWeight={600}
            style={{ fill: C.ink }}
          >
            {t}
          </text>
        ))}
        {ell("O", 0.03)}
        {ell("E", 0.07)}
        {ell("S", 0.1)}
        {(
          [
            ["EN", geo.en[0], geo.en[1], "E"],
            ["ENPS", geo.enps[0], geo.enps[1], "S"],
          ] as const
        ).map(([t, x, y, z]) => (
          <text
            key={t}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            style={{ fill: Z_COLOR[z], stroke: HALO }}
            strokeWidth={3}
            paintOrder="stroke"
          >
            {t}
          </text>
        ))}
        {view === "slide"
          ? geo.slide.map(([x, y, z], k) => (
              <circle
                key={k}
                cx={x}
                cy={y}
                r={5.5}
                style={{ fill: z === "O" ? C.ink : Z_COLOR[z], stroke: HALO }}
                strokeWidth={1.4}
              />
            ))
          : dots.map((d) => {
              const lp = labelProps(d.place);
              return (
                <g
                  key={`${view}-${d.p.key}`}
                  className="transition-transform duration-700 ease-in-out motion-reduce:transition-none"
                  style={{ transform: `translate(${d.x}px, ${d.y}px)` }}
                >
                  <circle
                    r={6}
                    className="transition-[fill] duration-500"
                    style={{ fill: d.z === "O" ? C.soft : Z_COLOR[d.z], stroke: HALO }}
                    strokeWidth={1.6}
                  />
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor={lp.textAnchor}
                    fontSize={13}
                    fontWeight={d.z === "S" ? 800 : 600}
                    style={{ fill: d.z === "S" ? Z_COLOR.S : C.ink, stroke: HALO }}
                    strokeWidth={3.5}
                    paintOrder="stroke"
                  >
                    {d.p.name}
                  </text>
                </g>
              );
            })}
      </svg>

      <p className="mt-1 text-center text-[13.5px]">
        <strong>{counts.all}</strong> profils · dont{" "}
        <strong className="text-emerald-700">{counts.en} EN</strong> · dont{" "}
        <strong style={{ color: Z_COLOR.S }}>{counts.spne} ENPS</strong>
      </p>

      {a && G ? (
        <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
          <div className="min-w-0">
            <ZoneMatrix G={G} a={a} step={step} />
            <p className="mx-auto mt-1 max-w-[16rem] text-center text-[12.5px] leading-snug text-muted-foreground">
              Forme normale : une case = un profil, colorée selon sa zone.
            </p>
          </div>
          <div
            className="min-w-0 rounded-xl border border-dashed bg-muted/50 px-3 py-2.5 text-[14px] leading-relaxed sm:px-4"
            aria-live="polite"
          >
            {step === 0 ? (
              <p>
                <strong>① Tous les profils.</strong> {G.who[0] === "J1" ? "J1" : "La firme 1"} a{" "}
                {a.nf.rows.length} stratégies et {G.who[1] === "J2" ? "J2" : "la firme 2"} en a{" "}
                {a.nf.cols.length} : {a.nf.rows.length} × {a.nf.cols.length} = {a.profiles.length}{" "}
                profils, une case de la forme normale chacun. Reste à les trier.
              </p>
            ) : step === 1 ? (
              <>
                <p>
                  <strong>② EN.</strong> On garde les profils faits de meilleures réponses mutuelles
                  dans la forme normale (théorème du slide 5) :
                </p>
                <ul className="mt-1 space-y-1">
                  {a.profiles.map((p) => (
                    <li key={p.key}>
                      <ENLine G={G} a={a} p={p} />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p>
                  <strong>③ ENPS.</strong> Parmi les EN, on garde ceux qui forment un EN dans{" "}
                  <em>chacun</em> des {a.nSub} sous-jeux (slide 11) :
                </p>
                <ul className="mt-1 space-y-1">
                  {a.profiles
                    .filter((p) => p.isEN)
                    .map((p) => (
                      <li key={p.key}>
                        <SPNELine G={G} p={p} nSub={a.nSub} />
                      </li>
                    ))}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed bg-muted/50 px-3 py-2.5 text-[14px] leading-relaxed sm:px-4">
          <p>
            Comme au slide 12 : {counts.all} profils (points), dont {counts.en} EN, dont{" "}
            {counts.spne} ENPS. Un ENPS est un EN : aucun point violet hors de l'ellipse EN. Mais{" "}
            {counts.en - counts.spne} EN ne sont pas parfaits en sous-jeux. Choisis « Jeu de
            l'entrée » ou « Jeu du § 4 » pour voir de vrais profils triés.
          </p>
        </div>
      )}
    </InteractiveCard>
  );
}
