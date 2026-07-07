/**
 * TP · Séance 3 — Jeux séquentiels & duopole (ECGEB366).
 *
 * Énoncés fidèles au document officiel « Séance d'exercices 3 » ;
 * résolutions pas à pas alignées sur le corrigé officiel
 * (« Séance d'exercices 3 : Solutions »). Les arbres en forme extensive
 * sont redessinés en SVG (composant local GameTree) ; l'induction à
 * rebours est mise en évidence par le surlignage des branches retenues.
 */
import { type ReactNode } from "react";
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { Quiz } from "@/components/course/Quiz";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Palette des joueurs (sûre en clair comme en sombre) et surlignage    */
/* ------------------------------------------------------------------ */

const P1 = "#2563eb"; // blue-600  — joueur 1 / Cortés / Iran
const P2 = "#d97706"; // amber-600 — joueur 2 / Troupes / Arabie Saoudite
const P3 = "#7c3aed"; // violet-600 — joueur 3
const HL = "#059669"; // emerald-600 — branche retenue par backward induction

/* ================================================================== */
/* Composant local · GameTree — arbre de jeu en forme extensive         */
/* ================================================================== */

interface Pt {
  x: number;
  y: number;
}
interface GTNode extends Pt {
  id: string;
  /** nom du joueur affiché près du nœud */
  player?: string;
  labelDx?: number;
  labelDy?: number;
  labelAnchor?: "start" | "middle" | "end";
  color?: string;
}
interface GTLeaf extends Pt {
  id: string;
  /** payoffs, 2 (a ; b) ou 3 (empilés) composantes */
  payoff: Array<number | string>;
  /** étiquette du nœud terminal, ex. « x₀ » */
  name?: string;
  /** issue effectivement atteinte à l'équilibre */
  on?: boolean;
}
interface GTEdge {
  from: string;
  to: string;
  label: string;
  dx?: number;
  dy?: number;
  anchor?: "start" | "middle" | "end";
  /** branche retenue (surlignée) */
  on?: boolean;
}
interface GTInfoSet {
  a: string;
  b: string;
  label?: string;
  dy?: number;
}
interface GameTreeProps {
  viewBox: string;
  nodes: GTNode[];
  leaves: GTLeaf[];
  edges: GTEdge[];
  infoSets?: GTInfoSet[];
  /** couleur de chaque composante de payoff (par défaut [P1, P2]) */
  payoffColors?: string[];
  maxW?: number;
  ariaLabel: string;
  caption?: ReactNode;
  className?: string;
}

function GameTree({
  viewBox,
  nodes,
  leaves,
  edges,
  infoSets = [],
  payoffColors,
  maxW = 440,
  ariaLabel,
  caption,
  className,
}: GameTreeProps) {
  const pts = new Map<string, Pt>();
  nodes.forEach((n) => pts.set(n.id, { x: n.x, y: n.y }));
  leaves.forEach((l) => pts.set(l.id, { x: l.x, y: l.y }));
  const colors = payoffColors ?? [P1, P2];

  return (
    <figure className={cn("my-5", className)}>
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox={viewBox}
          role="img"
          aria-label={ariaLabel}
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: maxW }}
        >
          {/* ensembles d'information (dessinés derrière) */}
          {infoSets.map((s, i) => {
            const a = pts.get(s.a);
            const b = pts.get(s.b);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={`is-${i}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--color-muted-foreground)"
                  strokeWidth={1.3}
                  strokeDasharray="5 4"
                />
                {s.label ? (
                  <text
                    x={mx}
                    y={my + (s.dy ?? -8)}
                    textAnchor="middle"
                    fontSize={11.5}
                    fontStyle="italic"
                    fill="var(--color-muted-foreground)"
                  >
                    {s.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* arêtes (actions) */}
          {edges.map((e, i) => {
            const a = pts.get(e.from);
            const b = pts.get(e.to);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2 + (e.dx ?? 0);
            const my = (a.y + b.y) / 2 + (e.dy ?? 0);
            return (
              <g key={`e-${i}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={e.on ? HL : "var(--color-foreground)"}
                  strokeOpacity={e.on ? 1 : 0.72}
                  strokeWidth={e.on ? 2.6 : 1.5}
                  strokeLinecap="round"
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor={e.anchor ?? "middle"}
                  fontSize={12.5}
                  fontWeight={700}
                  fill={e.on ? HL : "var(--color-foreground)"}
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* feuilles (payoffs) */}
          {leaves.map((l) => {
            const stacked = l.payoff.length > 2;
            return (
              <g key={l.id}>
                {l.on ? (
                  <circle cx={l.x} cy={l.y} r={7} fill="none" stroke={HL} strokeWidth={2} />
                ) : null}
                <circle cx={l.x} cy={l.y} r={3.4} fill={l.on ? HL : "var(--color-foreground)"} />
                {l.name ? (
                  <text
                    x={l.x - 7}
                    y={l.y - 5}
                    textAnchor="end"
                    fontSize={11}
                    fontStyle="italic"
                    fill="var(--color-muted-foreground)"
                  >
                    {l.name}
                  </text>
                ) : null}
                {stacked ? (
                  <text x={l.x} y={l.y} textAnchor="middle" fontSize={12} fontWeight={700}>
                    {l.payoff.map((v, i) => (
                      <tspan
                        key={i}
                        x={l.x}
                        dy={i === 0 ? 16 : 13}
                        fill={colors[i] ?? "var(--color-foreground)"}
                      >
                        {v}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  <text x={l.x} y={l.y + 17} textAnchor="middle" fontSize={12.5} fontWeight={700}>
                    <tspan fill={colors[0] ?? "var(--color-foreground)"}>{l.payoff[0]}</tspan>
                    <tspan fill="var(--color-muted-foreground)">{" ; "}</tspan>
                    <tspan fill={colors[1] ?? "var(--color-foreground)"}>{l.payoff[1]}</tspan>
                  </text>
                )}
              </g>
            );
          })}

          {/* nœuds de décision */}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={5} fill={n.color ?? "var(--color-foreground)"} />
              {n.player ? (
                <text
                  x={n.x + (n.labelDx ?? 0)}
                  y={n.y + (n.labelDy ?? -10)}
                  textAnchor={n.labelAnchor ?? "middle"}
                  fontSize={12}
                  fontWeight={700}
                  fill={n.color ?? "var(--color-foreground)"}
                >
                  {n.player}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Petite légende des couleurs de joueurs, réutilisée sous les arbres. */
function PlayerLegend({ items }: { items: Array<{ color: string; label: string }> }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
            aria-hidden
          />
          {it.label}
        </span>
      ))}
    </span>
  );
}

/* ================================================================== */
/* Composant local · BestResponseDiagram — Cournot (exercice 4.2)       */
/* ================================================================== */

function BestResponseDiagram() {
  const X = (q: number) => 46 + q * 0.26;
  const Y = (q: number) => 286 - q * 0.26;
  const ne = 1000 / 3; // 333,33

  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox="0 0 344 320"
          role="img"
          aria-label="Fonctions de meilleure réponse de l'Iran et de l'Arabie Saoudite et leur intersection, l'équilibre de Nash de Cournot"
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: 360 }}
        >
          {/* axes */}
          <line x1={46} y1={286} x2={322} y2={286} stroke="var(--color-foreground)" strokeWidth={1.4} />
          <line x1={46} y1={286} x2={46} y2={22} stroke="var(--color-foreground)" strokeWidth={1.4} />
          <text x={326} y={290} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
            Qᵢ
          </text>
          <text x={40} y={18} fontSize={12} fontWeight={700} textAnchor="end" fill="var(--color-foreground)">
            Qₛ
          </text>

          {/* meilleure réponse de l'Iran : Qᵢ*(Qₛ) = 500 − Qₛ/2 → (500,0)…(0,1000) */}
          <line x1={176} y1={286} x2={46} y2={26} stroke={P1} strokeWidth={2.3} />
          <text x={120} y={104} fontSize={12} fontWeight={700} fill={P1}>
            Qᵢ*(Qₛ)
          </text>

          {/* meilleure réponse de l'Arabie S. : Qₛ*(Qᵢ) = 500 − Qᵢ/2 → (0,500)…(1000,0) */}
          <line x1={46} y1={156} x2={306} y2={286} stroke={P2} strokeWidth={2.3} />
          <text x={232} y={250} fontSize={12} fontWeight={700} fill={P2}>
            Qₛ*(Qᵢ)
          </text>

          {/* équilibre de Nash */}
          <line
            x1={X(ne)}
            y1={286}
            x2={X(ne)}
            y2={Y(ne)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <line
            x1={46}
            y1={Y(ne)}
            x2={X(ne)}
            y2={Y(ne)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <circle cx={X(ne)} cy={Y(ne)} r={4.5} fill={HL} />
          <text x={X(ne) + 8} y={Y(ne) - 6} fontSize={12} fontWeight={700} fill={HL}>
            EN
          </text>

          {/* graduations */}
          <text x={X(ne)} y={300} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
            333,3
          </text>
          <text x={176} y={300} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
            500
          </text>
          <text x={306} y={300} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
            1000
          </text>
          <text x={42} y={Y(ne) + 3} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
            333,3
          </text>
          <text x={42} y={159} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
            500
          </text>
          <text x={42} y={30} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
            1000
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Chaque droite est la meilleure réponse d'un pays à la quantité de l'autre. L'équilibre de
        Nash est leur unique intersection : <M tex="(Q_I^*, Q_S^*) = (333{,}3,\ 333{,}3)" />.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Composant local · SequentialFan — duopole séquentiel (exercice 4.5)  */
/* ================================================================== */

function SequentialFan() {
  const fan = (cx: number, cy: number, ay: number, x0: number, x1: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / (n - 1);
      return { x, y: ay };
    });
  const iranFan = fan(180, 34, 96, 66, 294, 9);
  const saudiFan = fan(180, 104, 168, 66, 294, 9);

  return (
    <figure className="my-5">
      <div className="overflow-x-auto rounded-xl border bg-card p-3 sm:p-4">
        <svg
          viewBox="0 0 360 196"
          role="img"
          aria-label="Jeu séquentiel : l'Iran choisit d'abord une quantité dans un continuum, puis l'Arabie Saoudite choisit la sienne après l'avoir observée"
          className="mx-auto block h-auto w-full"
          style={{ maxWidth: 380 }}
        >
          {/* éventail de l'Iran */}
          {iranFan.map((p, i) => (
            <line
              key={`i-${i}`}
              x1={180}
              y1={34}
              x2={p.x}
              y2={p.y}
              stroke={P1}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
          ))}
          <path d="M 66 96 Q 180 112 294 96" fill="none" stroke={P1} strokeWidth={1.6} />
          <text x={150} y={70} fontSize={12} fontWeight={700} fill={P1}>
            Qᵢ
          </text>
          <text x={60} y={100} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
            0
          </text>
          <text x={300} y={100} fontSize={10.5} fill="var(--color-muted-foreground)">
            1000
          </text>

          {/* éventail de l'Arabie Saoudite */}
          {saudiFan.map((p, i) => (
            <line
              key={`s-${i}`}
              x1={180}
              y1={104}
              x2={p.x}
              y2={p.y}
              stroke={P2}
              strokeOpacity={0.55}
              strokeWidth={1.2}
            />
          ))}
          <path d="M 66 168 Q 180 184 294 168" fill="none" stroke={P2} strokeWidth={1.6} />
          <text x={140} y={142} fontSize={12} fontWeight={700} fill={P2}>
            Qₛ(Qᵢ)
          </text>
          <text x={60} y={172} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
            0
          </text>
          <text x={300} y={172} fontSize={10.5} fill="var(--color-muted-foreground)">
            1000
          </text>

          {/* nœuds */}
          <circle cx={180} cy={34} r={5} fill={P1} />
          <text x={180} y={22} fontSize={12} fontWeight={700} textAnchor="middle" fill={P1}>
            Iran
          </text>
          <circle cx={180} cy={104} r={5} fill={P2} />
          <text x={188} y={102} fontSize={12} fontWeight={700} fill={P2}>
            Arabie S.
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        L'Iran choisit d'abord <M tex="Q_I" /> dans un continuum <M tex="[0,\ 1000]" /> : chaque
        valeur ouvre un <strong>sous-jeu différent</strong>. L'Arabie Saoudite, qui observe{" "}
        <M tex="Q_I" />, répond ensuite par <M tex="Q_S(Q_I)" />. Il y a donc une infinité de
        sous-jeux.
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={3}
      intro={
        <>
          <p>
            Cette séance fait basculer le cours des jeux simultanés (chapitre B1) vers les jeux{" "}
            <strong>séquentiels</strong> : on apprend à lire une <strong>forme extensive</strong>{" "}
            (un arbre), à y repérer les <strong>sous-jeux</strong>, et à appliquer l'
            <strong>induction à rebours</strong> (backward induction) pour trouver les{" "}
            <strong>équilibres de Nash parfaits en sous-jeux</strong> (ENPS). Les trois premiers
            exercices te font manipuler des arbres — de la ruse de Cortés « brûler ses navires »
            (engagement crédible) à un jeu à trois joueurs avec ensemble d'information. Le quatrième
            déroule tout le programme du duopole sur un cas concret, le marché du pétrole : Cournot
            simultané, version séquentielle « à la Stackelberg », puis cartel de l'OPEP soutenu — ou
            non — par une stratégie <em>grim</em> dans un jeu répété (chapitre B3). Conseil de
            méthode : dessine toujours l'arbre, résous les sous-jeux du bas vers le haut, et
            distingue bien une <em>stratégie</em> (un plan complet) du <em>résultat</em>{" "}
            effectivement joué.
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — Brûler ses propres navires                       */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp3"
        id="ex1"
        number={1}
        title="La stratégie « brûler ses propres navires »"
        difficulty={2}
        refs={[
          { chapter: "b4", section: "s7" },
          { chapter: "b1", section: "s5" },
          { chapter: "b3", section: "sec-fini" },
        ]}
        statement={
          <>
            <p>
              Une légende raconte que, lorsque le conquistador espagnol Hernán Cortés et ses troupes
              arrivèrent sur les côtes du Mexique pour conquérir l'Empire aztèque, Cortés ordonna de
              brûler tous les bateaux de la flotte. Décision irrationnelle, ou rationalisable par la
              théorie des jeux ?
            </p>
            <p>
              En rencontrant l'armée aztèque, les soldats espagnols ont le choix entre se battre{" "}
              <strong>corps et âme (CA)</strong> ou <strong>avec retenue (R)</strong>. Se battre
              corps et âme augmente les pertes espagnoles mais aussi la probabilité de vaincre. Si
              les troupes sont défaites, les survivants peuvent rentrer en Espagne{" "}
              <em>à condition que les navires n'aient pas été brûlés</em> ; s'ils l'ont été, il n'y a
              plus d'échappatoire. Anticipant cela, Cortés a le choix entre{" "}
              <strong>brûler les navires (B)</strong> ou <strong>les garder (G)</strong>.
            </p>
            <GameTree
              ariaLabel="Arbre du jeu : Cortés choisit B ou G, puis les troupes choisissent CA ou R"
              viewBox="0 0 440 250"
              maxW={440}
              nodes={[
                { id: "cortes", x: 220, y: 32, player: "Cortés", labelDy: -14, color: P1 },
                { id: "n1", x: 120, y: 120, player: "Troupes", labelDx: -10, labelDy: -6, labelAnchor: "end", color: P2 },
                { id: "n2", x: 330, y: 120, player: "Troupes", labelDx: 10, labelDy: -6, labelAnchor: "start", color: P2 },
              ]}
              leaves={[
                { id: "l1", x: 70, y: 200, payoff: [4, 1] },
                { id: "l2", x: 165, y: 200, payoff: [0, 0] },
                { id: "l3", x: 285, y: 200, payoff: [4, 1] },
                { id: "l4", x: 385, y: 200, payoff: [2, 2] },
              ]}
              edges={[
                { from: "cortes", to: "n1", label: "B", anchor: "end", dx: -6, dy: -4 },
                { from: "cortes", to: "n2", label: "G", anchor: "start", dx: 6, dy: -4 },
                { from: "n1", to: "l1", label: "CA", anchor: "end", dx: -4, dy: -2 },
                { from: "n1", to: "l2", label: "R", anchor: "start", dx: 4, dy: -2 },
                { from: "n2", to: "l3", label: "CA", anchor: "end", dx: -4, dy: -2 },
                { from: "n2", to: "l4", label: "R", anchor: "start", dx: 4, dy: -2 },
              ]}
              caption={
                <>
                  Payoffs <M tex="(\text{Cortés}\,;\ \text{Troupes})" />.{" "}
                  <PlayerLegend
                    items={[
                      { color: P1, label: "Cortés" },
                      { color: P2, label: "Troupes espagnoles" },
                    ]}
                  />
                  . Abréviations : <strong>B</strong> = brûler les navires, <strong>G</strong> =
                  garder les navires, <strong>CA</strong> = se battre corps et âme, <strong>R</strong>{" "}
                  = se battre avec retenue.
                </>
              }
            />
            <SubQuestion label="1.1">
              Trouve tous les sous-jeux différents du jeu entier. Pour chacun, trouve l'équilibre de
              Nash.
            </SubQuestion>
            <SubQuestion label="1.2">
              Quel est l'ensemble des stratégies disponibles pour Cortés ? Pour les troupes
              espagnoles ?
            </SubQuestion>
            <SubQuestion label="1.3">
              Représente ce jeu sous sa forme normale et trouve tous les équilibres de Nash.
            </SubQuestion>
            <SubQuestion label="1.4">
              Trouve les équilibres de Nash parfaits en sous-jeux (ENPS). Quel est le résultat
              associé ? Est-il efficace au sens de Pareto ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Les bons outils : sous-jeu, forme normale, ENPS",
            refs: [
              { chapter: "b4", section: "s7" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <Callout variant="definition">
                  <p>
                    Un <strong>sous-jeu</strong> est la partie de l'arbre qui démarre à un nœud de
                    décision (hors racine) et contient tout ce qui en descend, à condition de ne
                    jamais couper un ensemble d'information. Une <strong>stratégie</strong> est un
                    plan <em>complet</em> : elle prescrit une action à chaque nœud où le joueur doit
                    jouer, <em>même hors du chemin effectivement suivi</em>.
                  </p>
                </Callout>
                <Callout variant="definition">
                  <p>
                    Un <strong>équilibre de Nash parfait en sous-jeux (ENPS)</strong> est un profil
                    de stratégies qui induit un équilibre de Nash dans <em>chaque</em> sous-jeu — y
                    compris ceux qu'on n'atteint pas. On le trouve par{" "}
                    <strong>induction à rebours</strong> : on résout les sous-jeux du bas de l'arbre
                    vers le haut.
                  </p>
                </Callout>
                <Callout variant="methode">
                  <p>
                    Ici un seul joueur agit dans chaque sous-jeu du bas (les troupes) : « équilibre
                    de Nash du sous-jeu » veut simplement dire « meilleure action pour ce joueur ».
                    Attention à bien lire les payoffs : le <em>second</em> nombre est celui des
                    troupes.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 — Les deux sous-jeux et leurs équilibres de Nash",
            refs: [
              { chapter: "b3", section: "sec-fini" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  Hors la racine (le nœud de Cortés), l'arbre contient <strong>deux</strong> nœuds
                  de décision : <M tex="N_1" /> (atteint si Cortés joue B) et <M tex="N_2" />{" "}
                  (atteint si Cortés joue G). Chacun ouvre un sous-jeu où seules les troupes jouent.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <GameTree
                    ariaLabel="Sous-jeu N1 : les troupes choisissent CA (4;1) ou R (0;0)"
                    viewBox="0 0 170 130"
                    maxW={210}
                    nodes={[{ id: "n1", x: 85, y: 24, player: "N₁", labelDx: 11, labelDy: 3, labelAnchor: "start", color: P2 }]}
                    leaves={[
                      { id: "a", x: 40, y: 96, payoff: [4, 1], on: true },
                      { id: "b", x: 125, y: 96, payoff: [0, 0] },
                    ]}
                    edges={[
                      { from: "n1", to: "a", label: "CA", anchor: "end", dx: -4, dy: -2, on: true },
                      { from: "n1", to: "b", label: "R", anchor: "start", dx: 4, dy: -2 },
                    ]}
                    caption={
                      <>
                        Sous-jeu <M tex="N_1" /> : les troupes comparent leur payoff{" "}
                        <M tex="1 > 0" /> → <strong>CA</strong>.
                      </>
                    }
                  />
                  <GameTree
                    ariaLabel="Sous-jeu N2 : les troupes choisissent CA (4;1) ou R (2;2)"
                    viewBox="0 0 170 130"
                    maxW={210}
                    nodes={[{ id: "n2", x: 85, y: 24, player: "N₂", labelDx: 11, labelDy: 3, labelAnchor: "start", color: P2 }]}
                    leaves={[
                      { id: "a", x: 40, y: 96, payoff: [4, 1] },
                      { id: "b", x: 125, y: 96, payoff: [2, 2], on: true },
                    ]}
                    edges={[
                      { from: "n2", to: "a", label: "CA", anchor: "end", dx: -4, dy: -2 },
                      { from: "n2", to: "b", label: "R", anchor: "start", dx: 4, dy: -2, on: true },
                    ]}
                    caption={
                      <>
                        Sous-jeu <M tex="N_2" /> : les troupes comparent <M tex="2 > 1" /> →{" "}
                        <strong>R</strong>.
                      </>
                    }
                  />
                </div>
                <p>
                  Dans <M tex="N_1" /> (navires brûlés), il n'y a plus d'échappatoire : se battre
                  corps et âme rapporte <M tex="1" /> contre <M tex="0" /> pour la retenue.
                  L'équilibre de Nash est <strong>CA</strong> (c'est même une action dominante ici).
                  Dans <M tex="N_2" /> (navires gardés), la retenue permet de fuir : elle rapporte{" "}
                  <M tex="2 > 1" />. L'équilibre de Nash est <strong>R</strong>.
                </p>
                <Callout variant="intuition">
                  <p>
                    C'est tout le sel de la légende : en brûlant les navires, Cortés{" "}
                    <em>change le sous-jeu</em> dans lequel ses troupes se retrouveront, et les pousse
                    à se battre à fond. L'engagement irréversible est une arme stratégique.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 — Les ensembles de stratégies",
            refs: [
              { chapter: "b1", section: "s2" },
              { chapter: "b4", section: "s4" },
            ],
            content: (
              <>
                <p>
                  Cortés ne joue qu'une fois, à la racine : ses stratégies sont ses actions,
                </p>
                <MB tex="\mathcal{S}_{\text{Cortés}} = \{\,B,\ G\,\}." />
                <p>
                  Les troupes, elles, jouent dans <em>deux</em> situations distinctes (<M tex="N_1" />{" "}
                  et <M tex="N_2" />). Une stratégie complète doit prévoir une action{" "}
                  <em>dans chacune</em> — d'où <M tex="2 \times 2 = 4" /> stratégies
                  conditionnelles :
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>(CA si B, CA si G)</li>
                  <li>(CA si B, R si G)</li>
                  <li>(R si B, CA si G)</li>
                  <li>(R si B, R si G)</li>
                </ul>
                <Callout variant="attention">
                  <p>
                    Une stratégie n'est pas « ce que je joue » mais « ce que je jouerais dans
                    <em> toutes</em> les situations possibles ». Même si Cortés brûle les navires
                    (donc <M tex="N_2" /> n'est jamais atteint), la stratégie des troupes doit quand
                    même préciser ce qu'elles feraient en <M tex="N_2" />. C'est ce qui rend la forme
                    normale du 1.3 non triviale.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 — La forme normale et tous les équilibres de Nash",
            refs: [
              { chapter: "b1", section: "s2" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  On croise les <M tex="2" /> stratégies de Cortés (lignes) avec les <M tex="4" />{" "}
                  stratégies des troupes (colonnes). Chaque case se lit sur l'arbre. Par exemple,
                  face à (CA si B, R si G) : si Cortés joue B, on va en <M tex="N_1" /> et les troupes
                  jouent CA → <M tex="(4,1)" /> ; s'il joue G, on va en <M tex="N_2" /> et elles
                  jouent R → <M tex="(2,2)" />.
                </p>
                <PayoffMatrix
                  rowPlayer="Cortés"
                  colPlayer="Troupes espagnoles"
                  rows={["B", "G"]}
                  cols={["CA, CA", "CA, R", "R, CA", "R, R"]}
                  payoffs={[
                    [
                      [4, 1],
                      [4, 1],
                      [0, 0],
                      [0, 0],
                    ],
                    [
                      [4, 1],
                      [2, 2],
                      [4, 1],
                      [2, 2],
                    ],
                  ]}
                  interactive
                  caption={
                    <>
                      Colonnes = (action si B, action si G). Clique pour révéler les meilleures
                      réponses puis les équilibres de Nash.
                    </>
                  }
                />
                <p>En soulignant les meilleures réponses, on trouve <strong>trois</strong> équilibres de Nash :</p>
                <MB tex="NE_1 = (B\,;\ CA\text{ si }B,\ CA\text{ si }G),\quad NE_2 = (B\,;\ CA\text{ si }B,\ R\text{ si }G),\quad NE_3 = (G\,;\ R\text{ si }B,\ R\text{ si }G)." />
                <p>
                  Les trois sont bien des équilibres de Nash : aucun joueur ne gagne à dévier{" "}
                  <em>unilatéralement</em>. Mais tous ne « résistent » pas à l'exigence de perfection
                  en sous-jeux — c'est l'objet du 1.4.
                </p>
              </>
            ),
          },
          {
            title: "1.4 — L'unique ENPS et l'efficacité de Pareto",
            refs: [
              { chapter: "b3", section: "sec-fini" },
              { chapter: "a1", section: "pareto" },
            ],
            content: (
              <>
                <p>
                  On confronte chaque équilibre de Nash aux solutions des sous-jeux trouvées en
                  1.1 (CA dans <M tex="N_1" />, R dans <M tex="N_2" />) :
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <strong>
                      <M tex="NE_1" />
                    </strong>{" "}
                    prescrit <strong>CA en <M tex="N_2" /></strong> : or l'équilibre de ce sous-jeu
                    est R. <em>Pas</em> parfait en sous-jeux.
                  </li>
                  <li>
                    <strong>
                      <M tex="NE_3" />
                    </strong>{" "}
                    prescrit <strong>R en <M tex="N_1" /></strong> : or l'équilibre de ce sous-jeu
                    est CA. <em>Pas</em> parfait en sous-jeux.
                  </li>
                  <li>
                    <strong>
                      <M tex="NE_2" />
                    </strong>{" "}
                    prescrit <strong>CA en <M tex="N_1" /></strong> et <strong>R en <M tex="N_2" /></strong>{" "}
                    : il induit l'équilibre de Nash dans les deux sous-jeux. C'est le seul{" "}
                    <strong>ENPS</strong>.
                  </li>
                </ul>
                <MB tex="\boxed{\ \text{ENPS} = NE_2 = (B\,;\ CA\text{ si }B,\ R\text{ si }G)\ }" />
                <p>
                  Vérifions par induction à rebours sur l'arbre complet : les troupes joueront CA en{" "}
                  <M tex="N_1" /> et R en <M tex="N_2" />. Cortés anticipe donc <M tex="4" /> s'il
                  brûle (issue <M tex="(4,1)" />) contre <M tex="2" /> s'il garde (issue{" "}
                  <M tex="(2,2)" />). Il <strong>brûle</strong> les navires.
                </p>
                <GameTree
                  ariaLabel="Arbre résolu par backward induction : Cortés joue B, les troupes CA en N1 et R en N2, issue 4;1"
                  viewBox="0 0 440 250"
                  maxW={440}
                  nodes={[
                    { id: "cortes", x: 220, y: 32, player: "Cortés", labelDy: -14, color: P1 },
                    { id: "n1", x: 120, y: 120, player: "N₁", labelDx: -10, labelDy: -6, labelAnchor: "end", color: P2 },
                    { id: "n2", x: 330, y: 120, player: "N₂", labelDx: 10, labelDy: -6, labelAnchor: "start", color: P2 },
                  ]}
                  leaves={[
                    { id: "l1", x: 70, y: 200, payoff: [4, 1], on: true },
                    { id: "l2", x: 165, y: 200, payoff: [0, 0] },
                    { id: "l3", x: 285, y: 200, payoff: [4, 1] },
                    { id: "l4", x: 385, y: 200, payoff: [2, 2] },
                  ]}
                  edges={[
                    { from: "cortes", to: "n1", label: "B", anchor: "end", dx: -6, dy: -4, on: true },
                    { from: "cortes", to: "n2", label: "G", anchor: "start", dx: 6, dy: -4 },
                    { from: "n1", to: "l1", label: "CA", anchor: "end", dx: -4, dy: -2, on: true },
                    { from: "n1", to: "l2", label: "R", anchor: "start", dx: 4, dy: -2 },
                    { from: "n2", to: "l3", label: "CA", anchor: "end", dx: -4, dy: -2 },
                    { from: "n2", to: "l4", label: "R", anchor: "start", dx: 4, dy: -2, on: true },
                  ]}
                  caption={
                    <>
                      En vert : les actions retenues par induction à rebours (CA en <M tex="N_1" />,
                      R en <M tex="N_2" />, B à la racine). L'issue effectivement jouée est{" "}
                      <M tex="(4,1)" />.
                    </>
                  }
                />
                <p>
                  Le résultat de l'ENPS : les navires sont brûlés et les troupes se battent corps et
                  âme — profil de payoffs <M tex="(4,1)" />. Est-il{" "}
                  <strong>efficace au sens de Pareto</strong> ? Les autres issues possibles donnent{" "}
                  <M tex="(0,0)" /> et <M tex="(2,2)" /> : aucune ne domine <M tex="(4,1)" /> (aucune
                  ne fait au moins aussi bien pour les deux joueurs avec un strictement mieux). Donc{" "}
                  <strong>oui</strong>, <M tex="(4,1)" /> est efficace au sens de Pareto.
                </p>
                <Callout variant="retiens">
                  <p>
                    Un équilibre de Nash peut reposer sur une <em>menace non crédible</em> (ici :
                    « je me battrai à fond même si je peux fuir »). La perfection en sous-jeux élimine
                    ces menaces en exigeant la rationalité <em>dans chaque sous-jeu</em>, atteint ou
                    non.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> Deux sous-jeux : équilibre <strong>CA</strong> en <M tex="N_1" />,{" "}
              <strong>R</strong> en <M tex="N_2" />. · <strong>1.2</strong>{" "}
              <M tex="\mathcal S_{\text{Cortés}} = \{B, G\}" /> ; les troupes ont 4 stratégies
              conditionnelles. · <strong>1.3</strong> Forme normale → 3 équilibres de Nash{" "}
              (<M tex="NE_1, NE_2, NE_3" />). · <strong>1.4</strong> Unique ENPS ={" "}
              <M tex="(B\,;\ CA\text{ si }B,\ R\text{ si }G)" />, issue <M tex="(4,1)" />,
              Pareto-efficace.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> un équilibre de Nash n'est parfait en
              sous-jeux que s'il induit un équilibre de Nash dans <em>chaque</em> sous-jeu. La
              backward induction élimine les menaces non crédibles ; « brûler ses navires » est un{" "}
              <em>engagement</em> qui, en supprimant une option, améliore le sort de celui qui s'y
              lie.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp3"
        id="qx1"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            <M tex="NE_1 = (B\,;\ CA\text{ si }B,\ CA\text{ si }G)" /> est bien un équilibre de Nash.
            Pourquoi n'est-il pourtant pas un ENPS ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce qu'il prescrit <strong>CA dans le sous-jeu <M tex="N_2" /></strong>, alors que
                l'équilibre de ce sous-jeu est R : la perfection en sous-jeux est violée là où on ne
                joue pas.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement. <M tex="NE_1" /> tient comme équilibre de Nash uniquement parce que{" "}
                <M tex="N_2" /> n'est jamais atteint (Cortés joue B). Mais l'action CA y serait
                irrationnelle : la menace n'est pas crédible.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que son issue <M tex="(4,1)" /> n'est pas efficace au sens de Pareto.
              </>
            ),
            explain: (
              <>
                Non : <M tex="(4,1)" /> est justement efficace. Le problème de <M tex="NE_1" /> n'est
                pas son issue (identique à celle de <M tex="NE_2" />) mais son comportement hors du
                chemin, en <M tex="N_2" />.
              </>
            ),
          },
          {
            text: <>Parce que Cortés pourrait gagner davantage en jouant G.</>,
            explain: (
              <>
                Non : en anticipant les sous-jeux (CA en <M tex="N_1" />, R en <M tex="N_2" />),
                Cortés obtient 4 avec B contre 2 avec G. B reste son meilleur choix.
              </>
            ),
          },
        ]}
        explanation={
          <>
            La perfection en sous-jeux se teste <strong>partout dans l'arbre</strong>, y compris sur
            les branches non empruntées. Un équilibre de Nash qui repose sur une action
            irrationnelle « hors chemin » est éliminé.
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 2 — Ensemble d'information et ENPS                    */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp3"
        id="ex2"
        number={2}
        title="Ensemble d'information et stratégie dominante"
        difficulty={2}
        refs={[
          { chapter: "b4", section: "s7" },
          { chapter: "b1", section: "s3" },
          { chapter: "b3", section: "sec-fini" },
        ]}
        statement={
          <>
            <p>
              Considère le jeu suivant en forme étendue. Le joueur 1 choisit d'abord entre{" "}
              <M tex="A" />, <M tex="B" /> et <M tex="C" />. L'ensemble d'information atteint quand
              le joueur 1 <em>ne joue pas</em> <M tex="C" /> (c'est-à-dire s'il joue <M tex="A" /> ou{" "}
              <M tex="B" />) est appelé <strong>« nC »</strong> : le joueur 2 y répond par{" "}
              <M tex="L" /> ou <M tex="R" /> <em>sans savoir</em> si le joueur 1 a joué <M tex="A" />{" "}
              ou <M tex="B" />. En revanche, si le joueur 1 joue <M tex="C" />, le joueur 2 le sait et
              répond par <M tex="U" /> ou <M tex="D" />.
            </p>
            <GameTree
              ariaLabel="Arbre du jeu : joueur 1 choisit A, B ou C ; le joueur 2 répond dans l'ensemble d'information nC ou après C"
              viewBox="0 0 460 220"
              maxW={460}
              nodes={[
                { id: "j1", x: 230, y: 30, player: "Joueur 1", labelDy: -14, color: P1 },
                { id: "j2a", x: 110, y: 120, color: P2 },
                { id: "j2b", x: 250, y: 120, color: P2 },
                { id: "j2c", x: 372, y: 120, player: "Joueur 2", labelDx: 12, labelDy: -6, labelAnchor: "start", color: P2 },
              ]}
              leaves={[
                { id: "la", x: 68, y: 198, payoff: [5, 1] },
                { id: "lb", x: 150, y: 198, payoff: [1, 4] },
                { id: "lc", x: 210, y: 198, payoff: [0, 3] },
                { id: "ld", x: 292, y: 198, payoff: [2, 0] },
                { id: "le", x: 338, y: 198, payoff: [6, 1] },
                { id: "lf", x: 408, y: 198, payoff: [6, 0] },
              ]}
              edges={[
                { from: "j1", to: "j2a", label: "A", anchor: "end", dx: -5, dy: -4 },
                { from: "j1", to: "j2b", label: "B", anchor: "start", dx: 6, dy: -2 },
                { from: "j1", to: "j2c", label: "C", anchor: "start", dx: 5, dy: -4 },
                { from: "j2a", to: "la", label: "L", anchor: "end", dx: -3, dy: -1 },
                { from: "j2a", to: "lb", label: "R", anchor: "start", dx: 3, dy: -1 },
                { from: "j2b", to: "lc", label: "L", anchor: "end", dx: -3, dy: -1 },
                { from: "j2b", to: "ld", label: "R", anchor: "start", dx: 3, dy: -1 },
                { from: "j2c", to: "le", label: "U", anchor: "end", dx: -3, dy: -1 },
                { from: "j2c", to: "lf", label: "D", anchor: "start", dx: 3, dy: -1 },
              ]}
              infoSets={[{ a: "j2a", b: "j2b", label: "nC", dy: 20 }]}
              caption={
                <>
                  Payoffs <M tex="(\text{Joueur 1}\,;\ \text{Joueur 2})" />.{" "}
                  <PlayerLegend
                    items={[
                      { color: P1, label: "Joueur 1" },
                      { color: P2, label: "Joueur 2" },
                    ]}
                  />
                  . Le trait tireté relie les deux nœuds de l'ensemble d'information{" "}
                  <strong>nC</strong> : le joueur 2 ne peut pas les distinguer.
                </>
              }
            />
            <SubQuestion label="2.1">
              Quel est l'ensemble des stratégies du joueur 1 ? Du joueur 2 ?
            </SubQuestion>
            <SubQuestion label="2.2">
              Le joueur 1 a-t-il une stratégie dominée ? Une stratégie dominante ?
            </SubQuestion>
            <SubQuestion label="2.3">
              Le joueur 2 a-t-il une stratégie dominée ? Une stratégie dominante ?
            </SubQuestion>
            <SubQuestion label="2.4">
              Donne un équilibre de Nash parfait en sous-jeux (ENPS). Quel est le résultat associé ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Lire l'arbre : ce que change l'ensemble d'information nC",
            refs: [{ chapter: "b4", section: "s7" }],
            content: (
              <>
                <p>
                  Le joueur 2 joue à deux endroits, mais pas dans les mêmes conditions. Après{" "}
                  <M tex="C" />, il sait qu'il est là : c'est un nœud « singleton ». Après{" "}
                  <M tex="A" /> ou <M tex="B" />, il est dans l'ensemble d'information{" "}
                  <strong>nC</strong> et <em>ne sait pas</em> lequel des deux a été joué : il doit y
                  choisir <strong>la même action</strong> (L ou R), quelle que soit la branche.
                </p>
                <Callout variant="attention" title="Attention — un sous-jeu ne coupe jamais un ensemble d'information">
                  <p>
                    Un sous-jeu ne peut commencer qu'à un nœud <em>singleton</em>. Comme nC contient
                    deux nœuds reliés, <strong>aucun sous-jeu ne peut démarrer à l'intérieur de nC</strong>
                    . Le <em>seul</em> sous-jeu propre du jeu commence au nœud du joueur 2 qui suit{" "}
                    <M tex="C" />. C'est la clé du 2.4.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 — Les ensembles de stratégies",
            refs: [
              { chapter: "b1", section: "s2" },
              { chapter: "b4", section: "s4" },
            ],
            content: (
              <>
                <p>Le joueur 1 agit une fois, à la racine :</p>
                <MB tex="\mathcal{S}_1 = \{\,A,\ B,\ C\,\}." />
                <p>
                  Le joueur 2 agit dans <em>deux</em> ensembles d'information : nC (choix L/R) et le
                  nœud après C (choix U/D). Une stratégie précise une action{" "}
                  <em>pour chacun</em> — soit <M tex="2 \times 2 = 4" /> stratégies :
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>(L si nC, U si C)</li>
                  <li>(L si nC, D si C)</li>
                  <li>(R si nC, U si C)</li>
                  <li>(R si nC, D si C)</li>
                </ul>
                <Callout variant="retiens">
                  <p>
                    Une stratégie se définit sur les <strong>ensembles d'information</strong>, pas
                    sur les nœuds : le joueur 2 ne peut pas conditionner son action dans nC sur
                    « A ou B », puisqu'il ne les distingue pas.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.2 — Stratégie dominée / dominante du joueur 1",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  Regarde les payoffs du joueur 1 (le premier nombre). Après <M tex="C" />, le joueur
                  2 choisira toujours entre <M tex="6" /> (U) et <M tex="6" /> (D) : le joueur 1
                  obtient <strong>6</strong> quoi qu'il arrive. Or, en jouant <M tex="A" /> il obtient
                  au mieux <M tex="5" />, et en jouant <M tex="B" /> au mieux <M tex="2" />.
                </p>
                <MB tex="\Pi_1(C, \cdot) = 6 \;>\; 5 \ge \Pi_1(A, \cdot) \qquad\text{et}\qquad \Pi_1(C, \cdot) = 6 \;>\; 2 \ge \Pi_1(B, \cdot)" />
                <p>
                  Donc <M tex="A" /> et <M tex="B" /> sont toutes deux{" "}
                  <strong>dominées par <M tex="C" /></strong>, et <M tex="C" /> est une{" "}
                  <strong>stratégie dominante</strong> pour le joueur 1.
                </p>
                <Callout variant="attention">
                  <p>
                    <M tex="B" /> n'est pas dominée <em>par <M tex="A" /></em> : contre (R si nC, U si
                    C) on a <M tex="\Pi_1(B) = 2 > 1 = \Pi_1(A)" />. Une stratégie peut être dominée
                    par l'une sans l'être par une autre — ce qui compte, c'est qu'elle le soit par{" "}
                    <em>au moins une</em>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 — Stratégie dominée / dominante du joueur 2",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>Regarde à présent les payoffs du joueur 2 (le second nombre). Après <M tex="C" /> :</p>
                <MB tex="U \text{ rapporte } 1 \;>\; 0 \text{ que rapporte } D." />
                <p>
                  Donc toute stratégie « … D si C » est dominée par la même stratégie avec « … U si
                  C » : <strong>(L si nC, D si C)</strong> est dominée par <strong>(L si nC, U si C)</strong>,
                  et <strong>(R si nC, D si C)</strong> par <strong>(R si nC, U si C)</strong>.
                </p>
                <p>
                  En revanche, le joueur 2 n'a <strong>pas</strong> de stratégie dominante, car le
                  bon choix dans nC dépend de ce que fait le joueur 1 :
                </p>
                <MB tex="\Pi_2(A;\ R\text{ si nC}) = 4 \;>\; 1 = \Pi_2(A;\ L\text{ si nC})" />
                <MB tex="\Pi_2(B;\ L\text{ si nC}) = 3 \;>\; 0 = \Pi_2(B;\ R\text{ si nC})" />
                <p>
                  Aucune de « L si nC » et « R si nC » ne domine l'autre : pas de stratégie
                  dominante pour le joueur 2.
                </p>
              </>
            ),
          },
          {
            title: "2.4 — L'ENPS par backward induction",
            refs: [
              { chapter: "b3", section: "sec-fini" },
              { chapter: "b4", section: "s7" },
            ],
            content: (
              <>
                <p>
                  On part du seul sous-jeu propre (celui qui suit <M tex="C" />). Le joueur 2 y choisit{" "}
                  <M tex="U" /> (car <M tex="1 > 0" />). En remontant, le joueur 1 a <M tex="C" /> pour
                  stratégie dominante (2.2). Un ENPS est donc :
                </p>
                <MB tex="(S_1^*,\ S_2^*) = \bigl(\,C\ ;\ L\text{ si nC},\ U\text{ si }C\,\bigr)." />
                <GameTree
                  ariaLabel="Arbre résolu : le joueur 1 joue C, le joueur 2 joue U, issue 6;1"
                  viewBox="0 0 460 220"
                  maxW={460}
                  nodes={[
                    { id: "j1", x: 230, y: 30, player: "Joueur 1", labelDy: -14, color: P1 },
                    { id: "j2a", x: 110, y: 120, color: P2 },
                    { id: "j2b", x: 250, y: 120, color: P2 },
                    { id: "j2c", x: 372, y: 120, player: "Joueur 2", labelDx: 12, labelDy: -6, labelAnchor: "start", color: P2 },
                  ]}
                  leaves={[
                    { id: "la", x: 68, y: 198, payoff: [5, 1] },
                    { id: "lb", x: 150, y: 198, payoff: [1, 4] },
                    { id: "lc", x: 210, y: 198, payoff: [0, 3] },
                    { id: "ld", x: 292, y: 198, payoff: [2, 0] },
                    { id: "le", x: 338, y: 198, payoff: [6, 1], on: true },
                    { id: "lf", x: 408, y: 198, payoff: [6, 0] },
                  ]}
                  edges={[
                    { from: "j1", to: "j2a", label: "A", anchor: "end", dx: -5, dy: -4 },
                    { from: "j1", to: "j2b", label: "B", anchor: "start", dx: 6, dy: -2 },
                    { from: "j1", to: "j2c", label: "C", anchor: "start", dx: 5, dy: -4, on: true },
                    { from: "j2a", to: "la", label: "L", anchor: "end", dx: -3, dy: -1 },
                    { from: "j2a", to: "lb", label: "R", anchor: "start", dx: 3, dy: -1 },
                    { from: "j2b", to: "lc", label: "L", anchor: "end", dx: -3, dy: -1 },
                    { from: "j2b", to: "ld", label: "R", anchor: "start", dx: 3, dy: -1 },
                    { from: "j2c", to: "le", label: "U", anchor: "end", dx: -3, dy: -1, on: true },
                    { from: "j2c", to: "lf", label: "D", anchor: "start", dx: 3, dy: -1 },
                  ]}
                  infoSets={[{ a: "j2a", b: "j2b", label: "nC", dy: 20 }]}
                  caption={
                    <>
                      En vert : C (joueur 1) puis U (joueur 2). Le chemin d'équilibre n'atteint jamais
                      nC ; « L si nC » complète la stratégie sans être joué.
                    </>
                  }
                />
                <p>
                  Le résultat associé : le joueur 1 obtient <strong>6</strong> et le joueur 2 obtient{" "}
                  <strong>1</strong> — profil <M tex="(6,1)" />.
                </p>
                <Callout variant="intuition">
                  <p>
                    Comme le chemin d'équilibre passe par C, l'ensemble nC n'est jamais atteint : la
                    perfection en sous-jeux ne contraint pas l'action qu'on y prescrit. « L si nC »
                    est la réponse officielle, mais « R si nC » donnerait le même résultat{" "}
                    <M tex="(6,1)" /> — la seule exigence forte porte sur le sous-jeu après C, où U
                    est obligatoire.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1</strong> <M tex="\mathcal S_1 = \{A,B,C\}" /> ; le joueur 2 a 4 stratégies
              du type (action si nC, action si C). · <strong>2.2</strong> <M tex="A" /> et{" "}
              <M tex="B" /> sont dominées par <M tex="C" /> → <M tex="C" /> dominante. ·{" "}
              <strong>2.3</strong> « … D si C » est dominée par « … U si C », mais le joueur 2 n'a{" "}
              <em>pas</em> de stratégie dominante. · <strong>2.4</strong> ENPS ={" "}
              <M tex="(C\,;\ L\text{ si nC},\ U\text{ si }C)" />, résultat <M tex="(6,1)" />.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> un ensemble d'information non-singleton{" "}
              <em>empêche</em> un sous-jeu de démarrer en son sein ; on résout donc d'abord les vrais
              sous-jeux (ici, celui après C), puis on remonte. Et une stratégie se définit sur les
              ensembles d'information, pas sur les nœuds.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 3 — Trois joueurs, un sous-jeu, trois ENPS            */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp3"
        id="ex3"
        number={3}
        title="Trois joueurs, un sous-jeu… trois ENPS"
        difficulty={3}
        refs={[
          { chapter: "b4", section: "s7" },
          { chapter: "b1", section: "s5" },
          { chapter: "b1", section: "s8" },
        ]}
        statement={
          <>
            <p>
              Soit le jeu suivant en forme étendue, à trois joueurs. Le joueur 1 (J1) choisit{" "}
              <M tex="\text{Out}" /> ou <M tex="\text{In}" />. S'il joue <M tex="\text{In}" />, le
              joueur 2 (J2) choisit <M tex="G" /> ou <M tex="D" />. Le joueur 3 (J3) joue ensuite{" "}
              <M tex="H" /> ou <M tex="B" />, <em>sans observer</em> le choix de J2 : ses deux nœuds
              forment un unique ensemble d'information (trait tireté).
            </p>
            <GameTree
              ariaLabel="Arbre à trois joueurs : J1 Out ou In, puis J2 G ou D, puis J3 H ou B dans un ensemble d'information"
              viewBox="0 0 440 270"
              maxW={440}
              payoffColors={[P1, P2, P3]}
              nodes={[
                { id: "j1", x: 150, y: 28, player: "Joueur 1", labelDy: -12, color: P1 },
                { id: "j2", x: 255, y: 95, player: "Joueur 2", labelDx: 12, labelDy: -4, labelAnchor: "start", color: P2 },
                { id: "ng", x: 200, y: 175, color: P3 },
                { id: "j3", x: 320, y: 175, color: P3 },
              ]}
              leaves={[
                { id: "x0", x: 60, y: 95, payoff: [1, 0, 0], name: "x₀" },
                { id: "x1", x: 150, y: 246, payoff: [0, 4, 4], name: "x₁" },
                { id: "x2", x: 240, y: 246, payoff: [3, 0, 3], name: "x₂" },
                { id: "x3", x: 300, y: 246, payoff: [3, 3, 0], name: "x₃" },
                { id: "x4", x: 385, y: 246, payoff: [0, 3, 3], name: "x₄" },
              ]}
              edges={[
                { from: "j1", to: "x0", label: "Out", anchor: "end", dx: -5, dy: -4 },
                { from: "j1", to: "j2", label: "In", anchor: "start", dx: 5, dy: -4 },
                { from: "j2", to: "ng", label: "G", anchor: "end", dx: -5, dy: -2 },
                { from: "j2", to: "j3", label: "D", anchor: "start", dx: 5, dy: -2 },
                { from: "ng", to: "x1", label: "H", anchor: "end", dx: -3, dy: -1 },
                { from: "ng", to: "x2", label: "B", anchor: "start", dx: 3, dy: -1 },
                { from: "j3", to: "x3", label: "H", anchor: "end", dx: -3, dy: -1 },
                { from: "j3", to: "x4", label: "B", anchor: "start", dx: 3, dy: -1 },
              ]}
              infoSets={[{ a: "ng", b: "j3", label: "Joueur 3", dy: -12 }]}
              caption={
                <>
                  Payoffs empilés <M tex="(\text{J1}\,;\ \text{J2}\,;\ \text{J3})" />.{" "}
                  <PlayerLegend
                    items={[
                      { color: P1, label: "J1" },
                      { color: P2, label: "J2" },
                      { color: P3, label: "J3" },
                    ]}
                  />
                  . Les deux nœuds de J3 forment un seul ensemble d'information.
                </>
              }
            />
            <SubQuestion label="3.1">Identifie l'ensemble des stratégies de chaque joueur.</SubQuestion>
            <SubQuestion label="3.2">Trouve tous les ENPS.</SubQuestion>
            <SubQuestion label="3.3">
              Parmi les nœuds terminaux <M tex="x_0, x_1, x_2, x_3, x_4" />, lesquels peuvent être
              atteints lorsque les joueurs jouent un ENPS ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Cadre : information imparfaite et stratégies",
            refs: [{ chapter: "b4", section: "s7" }],
            content: (
              <>
                <p>
                  Dans un jeu à information imparfaite, une stratégie précise l'action prise à chaque{" "}
                  <strong>ensemble d'information</strong> où le joueur doit choisir. Ici, chaque
                  joueur n'a qu'un ensemble d'information, donc une seule action à décider.
                </p>
                <Callout variant="attention">
                  <p>
                    J3 possède <em>deux</em> nœuds mais un <em>seul</em> ensemble d'information : il
                    ne sait pas si J2 a joué G ou D. Un sous-jeu ne pouvant pas couper cet ensemble,
                    le <strong>seul sous-jeu propre</strong> commence au nœud de J2.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.1 — Les ensembles de stratégies",
            refs: [{ chapter: "b1", section: "s2" }],
            content: (
              <>
                <p>Chaque joueur décide à un seul ensemble d'information :</p>
                <MB tex="\mathcal S_1 = \{\text{Out},\ \text{In}\}, \qquad \mathcal S_2 = \{G,\ D\}, \qquad \mathcal S_3 = \{H,\ B\}." />
              </>
            ),
          },
          {
            title: "3.2 (a) — Le seul sous-jeu propre et ses équilibres de Nash",
            refs: [
              { chapter: "b1", section: "s5" },
              { chapter: "b1", section: "s8" },
            ],
            content: (
              <>
                <p>
                  Le sous-jeu commence au nœud de J2 : J2 et J3 y jouent « simultanément » (J3
                  n'observe pas J2). Extrayons-le, puis écrivons sa forme normale entre J2 (lignes) et
                  J3 (colonnes) — on n'y garde que leurs payoffs :
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <GameTree
                    ariaLabel="Sous-jeu commençant au nœud du joueur 2"
                    viewBox="0 0 340 210"
                    maxW={360}
                    payoffColors={[P1, P2, P3]}
                    nodes={[
                      { id: "j2", x: 170, y: 24, player: "Joueur 2", labelDy: -12, color: P2 },
                      { id: "ng", x: 110, y: 108, color: P3 },
                      { id: "j3", x: 250, y: 108, color: P3 },
                    ]}
                    leaves={[
                      { id: "x1", x: 60, y: 178, payoff: [0, 4, 4], name: "x₁" },
                      { id: "x2", x: 150, y: 178, payoff: [3, 0, 3], name: "x₂" },
                      { id: "x3", x: 210, y: 178, payoff: [3, 3, 0], name: "x₃" },
                      { id: "x4", x: 300, y: 178, payoff: [0, 3, 3], name: "x₄" },
                    ]}
                    edges={[
                      { from: "j2", to: "ng", label: "G", anchor: "end", dx: -5, dy: -2 },
                      { from: "j2", to: "j3", label: "D", anchor: "start", dx: 5, dy: -2 },
                      { from: "ng", to: "x1", label: "H", anchor: "end", dx: -3, dy: -1 },
                      { from: "ng", to: "x2", label: "B", anchor: "start", dx: 3, dy: -1 },
                      { from: "j3", to: "x3", label: "H", anchor: "end", dx: -3, dy: -1 },
                      { from: "j3", to: "x4", label: "B", anchor: "start", dx: 3, dy: -1 },
                    ]}
                    infoSets={[{ a: "ng", b: "j3", label: "J3", dy: -10 }]}
                    caption={<>Le sous-jeu propre, isolé.</>}
                  />
                  <PayoffMatrix
                    rowPlayer="Joueur 2"
                    colPlayer="Joueur 3"
                    rows={["G", "D"]}
                    cols={["H", "B"]}
                    payoffs={[
                      [
                        [4, 4],
                        [0, 3],
                      ],
                      [
                        [3, 0],
                        [3, 3],
                      ],
                    ]}
                    interactive
                    caption={<>Payoffs (J2 ; J3). Deux équilibres purs apparaissent.</>}
                  />
                </div>
                <p>Ce sous-jeu a <strong>trois</strong> équilibres de Nash :</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    deux en stratégies pures : <strong>(G, H)</strong> et <strong>(D, B)</strong> ;
                  </li>
                  <li>
                    un en stratégies mixtes. En notant <M tex="p" /> la probabilité que J2 joue{" "}
                    <M tex="G" /> et <M tex="q" /> celle que J3 joue <M tex="H" />, on annule les
                    incitations à dévier :
                  </li>
                </ul>
                <MB tex="\text{J3 indifférent} : \underbrace{4p}_{u_3(H)} = \underbrace{3}_{u_3(B)} \;\Rightarrow\; p^* = \tfrac{3}{4}" />
                <MB tex="\text{J2 indifférent} : \underbrace{4q}_{u_2(G)} = \underbrace{3}_{u_2(D)} \;\Rightarrow\; q^* = \tfrac{3}{4}" />
                <p>
                  L'équilibre mixte est <M tex="(p^*, q^*) = (\tfrac{3}{4}, \tfrac{3}{4})" />. Son
                  profil de payoffs <em>attendus</em> se calcule en pondérant les quatre issues :
                </p>
                <MB tex="\bigl(\mathbb{E}u_1,\ \mathbb{E}u_2,\ \mathbb{E}u_3\bigr) = \left(\tfrac{9}{8},\ 3,\ 3\right)." />
                <Callout variant="methode" title="D'où vient le 9/8 ?">
                  <p>
                    J1 gagne <M tex="3" /> en <M tex="x_2" /> (G,B) et en <M tex="x_3" /> (D,H), et{" "}
                    <M tex="0" /> ailleurs. Avec <M tex="p = q = \tfrac{3}{4}" /> :{" "}
                    <M tex="\mathbb{E}u_1 = 3\,p(1-q) + 3\,(1-p)q = 3\cdot\tfrac{3}{16} + 3\cdot\tfrac{3}{16} = \tfrac{9}{8}." />
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 (b) — Réduire le jeu et trouver les trois ENPS",
            refs: [{ chapter: "b3", section: "sec-fini" }],
            content: (
              <>
                <p>
                  On remplace le sous-jeu par le profil de payoffs qu'il génère, puis J1 arbitre entre{" "}
                  <M tex="\text{Out}" /> (qui vaut <M tex="1" /> pour lui) et <M tex="\text{In}" />.
                  Un équilibre de Nash <em>différent</em> du sous-jeu donne un ENPS différent :
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <GameTree
                    ariaLabel="Jeu réduit si le sous-jeu joue (G,H) : In vaut 0 pour J1, Out vaut 1"
                    viewBox="0 0 190 150"
                    maxW={200}
                    payoffColors={[P1, P2, P3]}
                    nodes={[{ id: "j1", x: 95, y: 24, player: "J1", labelDy: -12, color: P1 }]}
                    leaves={[
                      { id: "out", x: 40, y: 100, payoff: [1, 0, 0], on: true },
                      { id: "in", x: 150, y: 100, payoff: [0, 4, 4] },
                    ]}
                    edges={[
                      { from: "j1", to: "out", label: "Out", anchor: "end", dx: -3, dy: -3, on: true },
                      { from: "j1", to: "in", label: "In", anchor: "start", dx: 3, dy: -3 },
                    ]}
                    caption={
                      <>
                        Sous-jeu → <strong>(G, H)</strong> : <M tex="1 > 0" /> → Out. ENPS{" "}
                        <M tex="(\text{Out}; G; H)" />.
                      </>
                    }
                  />
                  <GameTree
                    ariaLabel="Jeu réduit si le sous-jeu joue (D,B) : In vaut 0 pour J1, Out vaut 1"
                    viewBox="0 0 190 150"
                    maxW={200}
                    payoffColors={[P1, P2, P3]}
                    nodes={[{ id: "j1", x: 95, y: 24, player: "J1", labelDy: -12, color: P1 }]}
                    leaves={[
                      { id: "out", x: 40, y: 100, payoff: [1, 0, 0], on: true },
                      { id: "in", x: 150, y: 100, payoff: [0, 3, 3] },
                    ]}
                    edges={[
                      { from: "j1", to: "out", label: "Out", anchor: "end", dx: -3, dy: -3, on: true },
                      { from: "j1", to: "in", label: "In", anchor: "start", dx: 3, dy: -3 },
                    ]}
                    caption={
                      <>
                        Sous-jeu → <strong>(D, B)</strong> : <M tex="1 > 0" /> → Out. ENPS{" "}
                        <M tex="(\text{Out}; D; B)" />.
                      </>
                    }
                  />
                  <GameTree
                    ariaLabel="Jeu réduit si le sous-jeu joue l'équilibre mixte : In vaut 9/8 pour J1, Out vaut 1"
                    viewBox="0 0 190 150"
                    maxW={200}
                    payoffColors={[P1, P2, P3]}
                    nodes={[{ id: "j1", x: 95, y: 24, player: "J1", labelDy: -12, color: P1 }]}
                    leaves={[
                      { id: "out", x: 40, y: 100, payoff: [1, 0, 0] },
                      { id: "in", x: 150, y: 100, payoff: ["9/8", 3, 3], on: true },
                    ]}
                    edges={[
                      { from: "j1", to: "out", label: "Out", anchor: "end", dx: -3, dy: -3 },
                      { from: "j1", to: "in", label: "In", anchor: "start", dx: 3, dy: -3, on: true },
                    ]}
                    caption={
                      <>
                        Sous-jeu → mixte : <M tex="\tfrac{9}{8} > 1" /> → In. ENPS{" "}
                        <M tex="(\text{In}; p^*; q^*)" />.
                      </>
                    }
                  />
                </div>
                <p>Il y a donc <strong>trois ENPS</strong> :</p>
                <MB tex="(\text{Out};\, G;\, H), \qquad (\text{Out};\, D;\, B), \qquad \bigl(\text{In};\, p^*;\, q^*\bigr)\ \text{avec}\ (p^*,q^*)=\left(\tfrac{3}{4},\tfrac{3}{4}\right)." />
                <Callout variant="attention">
                  <p>
                    Dans les deux équilibres purs du sous-jeu, J1 obtiendrait <M tex="0" /> en
                    entrant : il préfère sortir (<M tex="1 > 0" />). Mais dans l'équilibre mixte, J1
                    obtient <M tex="\tfrac{9}{8} > 1" /> en entrant : la stratégie <M tex="\text{In}" />{" "}
                    devient la meilleure. C'est <em>le même J1</em> qui change de décision selon
                    l'équilibre retenu en bas — d'où trois ENPS.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 — Quels nœuds terminaux sont atteints ?",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>On balaie les trois ENPS :</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    <M tex="(\text{Out}; G; H)" /> et <M tex="(\text{Out}; D; B)" /> mènent tous deux
                    à <strong><M tex="x_0" /></strong> (J1 sort).
                  </li>
                  <li>
                    <M tex="(\text{In}; p^*; q^*)" /> : J1 entre, puis J2 et J3 mixent. Les quatre
                    issues <M tex="x_1, x_2, x_3, x_4" /> sont atteintes{" "}
                    <strong>avec probabilité strictement positive</strong>.
                  </li>
                </ul>
                <MB tex="\text{Nœuds atteignables à l'équilibre} : \ x_0,\ x_1,\ x_2,\ x_3,\ x_4 \ \text{(tous)}." />
                <p>
                  <strong>Tous</strong> les nœuds terminaux peuvent donc être atteints par un ENPS :{" "}
                  <M tex="x_0" /> via les deux ENPS purs, <M tex="x_1" /> à <M tex="x_4" /> via l'ENPS
                  mixte.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1</strong> <M tex="\mathcal S_1=\{\text{Out},\text{In}\}" />,{" "}
              <M tex="\mathcal S_2=\{G,D\}" />, <M tex="\mathcal S_3=\{H,B\}" />. ·{" "}
              <strong>3.2</strong> le sous-jeu a 3 équilibres de Nash — deux purs{" "}
              <M tex="(G,H)" />, <M tex="(D,B)" /> et un mixte{" "}
              <M tex="(\tfrac{3}{4},\tfrac{3}{4})" /> de payoffs <M tex="(\tfrac{9}{8},3,3)" /> — d'où{" "}
              <strong>trois ENPS</strong> : <M tex="(\text{Out};G;H)" />, <M tex="(\text{Out};D;B)" />{" "}
              et <M tex="(\text{In};p^*;q^*)" />. · <strong>3.3</strong> tous les nœuds terminaux{" "}
              <M tex="x_0,\dots,x_4" /> sont atteignables.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> on résout d'abord le(s) sous-jeu(s) propre(s),
              y compris les équilibres <em>mixtes</em>, puis on remonte. Chaque équilibre du sous-jeu
              peut engendrer un ENPS distinct — la perfection en sous-jeux ne garantit pas l'unicité.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp3"
        id="qx3"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Pourquoi ce jeu possède-t-il <strong>trois</strong> ENPS, alors que J1 fait toujours face
            au même choix Out / In ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce que le sous-jeu a trois équilibres de Nash, et que la valeur de{" "}
                <M tex="\text{In}" /> pour J1 change selon celui qui est joué (<M tex="0" /> dans les
                purs, <M tex="\tfrac{9}{8}" /> dans le mixte).
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : la perfection en sous-jeux impose un équilibre <em>dans</em> le sous-jeu, mais
                il y en a trois. Chacun donne une valeur différente à In, donc une décision différente
                de J1, donc un ENPS différent.
              </>
            ),
          },
          {
            text: <>Parce que J1 a trois stratégies possibles.</>,
            explain: (
              <>
                Non : J1 n'a que deux stratégies (Out, In). La multiplicité vient des équilibres du
                sous-jeu, pas de l'ensemble de stratégies de J1.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que l'équilibre mixte n'est pas un vrai équilibre et ne devrait pas être
                compté.
              </>
            ),
            explain: (
              <>
                Au contraire : l'équilibre mixte <M tex="(\tfrac34,\tfrac34)" /> est un équilibre de
                Nash à part entière du sous-jeu, et c'est lui qui rend <M tex="\text{In}" /> attractif
                pour J1.
              </>
            ),
          },
        ]}
      />

      {/* ============================================================ */}
      {/* Exercice 4 — Offre de pétrole et cartel de l'OPEP             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp3"
        id="ex4"
        number={4}
        title="Offre de pétrole et cartel de l'OPEP"
        difficulty={3}
        refs={[
          { chapter: "b1", section: "s5" },
          { chapter: "b3", section: "sec-grim" },
          { chapter: "b3", section: "sec-infini" },
        ]}
        statement={
          <>
            <p>
              La demande mondiale de pétrole est <M tex="Q^D(p) = 1000 - 5p" />, où <M tex="Q^D" /> est
              en <M tex="10^6" /> barils/an et <M tex="p" /> le prix du baril en $. Deux offreurs
              seulement : l'<strong>Iran</strong> et l'<strong>Arabie Saoudite</strong>, qui
              choisissent leurs productions <M tex="Q_I" /> et <M tex="Q_S" />. Leur utilité est{" "}
              <M tex="U_i(\pi_i) = \pi_i/10^6" />, où <M tex="\pi_i" /> est le profit annuel. Avec un
              coût de production nul,
            </p>
            <MB tex="\pi_i(Q_i, p^*) = 10^6 \times Q_i \times p^*, \qquad\text{donc}\qquad U_i = Q_i \times p^*." />
            <p>
              <strong>Équilibre de Nash (duopole simultané).</strong> Une stratégie du pays{" "}
              <M tex="i" /> est une quantité <M tex="Q_i \in [0, \infty)" />.
            </p>
            <SubQuestion label="4.1">
              Calcule les fonctions de meilleure réponse <M tex="Q_S^*(Q_I)" /> et{" "}
              <M tex="Q_I^*(Q_S)" />.
            </SubQuestion>
            <SubQuestion label="4.2">
              À l'aide de ces deux fonctions, trouve l'équilibre de Nash <M tex="(Q_I^*, Q_S^*)" /> du
              jeu simultané.
            </SubQuestion>
            <SubQuestion label="4.3">
              Cet équilibre maximise-t-il la somme des profits <M tex="\pi_I + \pi_S" /> ? Sinon,
              calcule les quantités <M tex="Q_I^C = Q_S^C" /> qui maximiseraient le profit joint d'un
              cartel.
            </SubQuestion>
            <SubQuestion label="4.4">
              Explique pourquoi ce cartel aurait du mal à obtenir les profits associés à{" "}
              <M tex="(Q_I^C, Q_S^C)" />.
            </SubQuestion>
            <p>
              <strong>ENPS (duopole séquentiel).</strong> L'Arabie Saoudite observe la production de
              l'Iran <em>avant</em> de choisir <M tex="Q_S" />.
            </p>
            <SubQuestion label="4.5">
              Donne un exemple de stratégie <M tex="S_S" /> pour l'Arabie Saoudite, et un exemple de
              stratégie <M tex="S_I" /> pour l'Iran.
            </SubQuestion>
            <SubQuestion label="4.6">
              D'après le point 4.1, quelle est la stratégie dominante de l'Arabie Saoudite ?
            </SubQuestion>
            <SubQuestion label="4.7">
              Trouve par backward induction l'ENPS <M tex="(S_I^*, S_S^*)" /> de ce jeu séquentiel.
            </SubQuestion>
            <SubQuestion label="4.8">
              Le résultat de cet ENPS maximise-t-il la somme des profits ? Qui gagne et qui perd par
              rapport à l'équilibre simultané <M tex="(Q_I^*, Q_S^*)" /> ?
            </SubQuestion>
            <p>
              <strong>Jeu répété une infinité de fois.</strong> À chaque étape, un duopole simultané où
              chaque pays a deux quantités possibles : <M tex="Q_i^*" /> et <M tex="Q_i^C" />. Chaque
              pays annonce la stratégie <strong>« grim »</strong> <M tex="S_i^G" /> : produire{" "}
              <M tex="Q_i^C" /> tant que l'autre coopère, et basculer définitivement sur{" "}
              <M tex="Q_i^*" /> dès que l'autre a dévié.
            </p>
            <SubQuestion label="4.9">
              Si <M tex="\delta_S = 1" /> et <M tex="\delta_I = 0{,}4" />, le profil{" "}
              <M tex="(S_I^G, S_S^G)" /> est-il un équilibre de Nash ?
            </SubQuestion>
            <SubQuestion label="4.10">
              Quel est le taux d'escompte minimal <M tex="\delta_I^m" /> pour lequel{" "}
              <M tex="(S_I^G, S_S^G)" /> est un équilibre de Nash ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Mise en place : prix d'équilibre et fonctions d'utilité",
            refs: [{ chapter: "b1", section: "s2" }],
            content: (
              <>
                <p>
                  Le prix d'équilibre égalise offre et demande :{" "}
                  <M tex="Q^D(p^*) = Q_I + Q_S" />, soit <M tex="1000 - 5p^* = Q_I + Q_S" />, d'où :
                </p>
                <MB tex="p^* = 200 - \frac{Q_I + Q_S}{5}. \qquad (1)" />
                <p>
                  En reportant dans <M tex="U_i = Q_i \times p^*" />, on obtient les deux fonctions
                  d'utilité (à maximiser par chaque pays) :
                </p>
                <MB tex="U_I(Q_I, Q_S) = 200\,Q_I - \frac{Q_I^2}{5} - \frac{Q_I Q_S}{5}, \qquad U_S(Q_I, Q_S) = 200\,Q_S - \frac{Q_I Q_S}{5} - \frac{Q_S^2}{5}." />
                <Callout variant="intuition">
                  <p>
                    C'est un <strong>duopole de Cournot</strong> : chacun choisit une quantité, et le
                    prix — donc le profit de chacun — dépend de la quantité <em>totale</em>. Produire
                    plus fait grimper mon chiffre d'affaires… mais baisser le prix pour tout le monde.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 — Les fonctions de meilleure réponse",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b1", section: "s5" },
            ],
            content: (
              <>
                <p>
                  La meilleure réponse de l'Iran maximise <M tex="U_I" /> en prenant <M tex="Q_S" />{" "}
                  comme donné. On annule la dérivée partielle :
                </p>
                <MB tex="\frac{\partial U_I}{\partial Q_I} = 200 - \frac{2}{5}Q_I - \frac{Q_S}{5} = 0 \quad\Longrightarrow\quad Q_I^*(Q_S) = 500 - \frac{Q_S}{2}." />
                <p>Par symétrie entre les deux pays :</p>
                <MB tex="Q_S^*(Q_I) = 500 - \frac{Q_I}{2}." />
                <Callout variant="intuition">
                  <p>
                    Ces fonctions sont <strong>décroissantes</strong> : plus l'adversaire produit,
                    moins il m'est profitable de produire (le prix serait déjà tiré vers le bas). La
                    pente <M tex="-\tfrac{1}{2}" /> dit qu'à chaque baril supplémentaire de l'autre,
                    je retire un demi-baril.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.2 — L'équilibre de Nash (Cournot)",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  À l'équilibre, les deux stratégies sont des meilleures réponses mutuelles : on
                  résout le système. En injectant <M tex="Q_S^* = 500 - \tfrac{Q_I}{2}" /> dans{" "}
                  <M tex="Q_I^* = 500 - \tfrac{Q_S}{2}" /> :
                </p>
                <MB tex="Q_I = 500 - \frac{1}{2}\left(500 - \frac{Q_I}{2}\right) = 250 + \frac{Q_I}{4} \quad\Longrightarrow\quad \frac{3}{4}Q_I = 250 \quad\Longrightarrow\quad Q_I^* = \frac{1000}{3} \approx 333{,}3." />
                <p>
                  Par symétrie <M tex="Q_S^* = 333{,}3" />. L'équilibre de Nash est l'intersection des
                  deux droites de meilleure réponse :
                </p>
                <BestResponseDiagram />
                <p>Le prix et les profits qui en découlent :</p>
                <MB tex="p^*(333{,}3,\ 333{,}3) = 200 - \frac{666{,}7}{5} \approx 66{,}7, \qquad \pi_I = \pi_S = 10^6 \times 333{,}3 \times 66{,}7 \approx 22\,222 \times 10^6\ \$." />
                <p>
                  La somme des profits vaut donc <M tex="\approx 44\,444 \times 10^6\ \$" /> par an.
                </p>
              </>
            ),
          },
          {
            title: "4.3 — Le cartel maximise-t-il la somme des profits ?",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  Non. En coopérant, un <strong>cartel</strong> choisit une quantité commune{" "}
                  <M tex="Q^C" /> par pays qui maximise le profit joint. Avec{" "}
                  <M tex="Q_I = Q_S = Q^C" /> dans <M tex="U_I" /> :
                </p>
                <MB tex="U_I(Q^C, Q^C) = 200\,Q^C - \frac{(Q^C)^2}{5} - \frac{(Q^C)^2}{5} = 200\,Q^C - \frac{2}{5}(Q^C)^2." />
                <p>La condition de premier ordre donne :</p>
                <MB tex="\frac{\partial U_I}{\partial Q^C} = 200 - \frac{4}{5}Q^C = 0 \quad\Longrightarrow\quad Q^C = 250." />
                <p>
                  Chaque pays produit <strong>moins</strong> qu'à l'équilibre de Nash (<M tex="250 < 333{,}3" />
                  ), ce qui fait <em>monter</em> le prix et les profits :
                </p>
                <MB tex="p^*(250, 250) = 200 - \frac{500}{5} = 100, \qquad \pi_I^C = \pi_S^C = 10^6 \times 250 \times 100 = 25\,000 \times 10^6\ \$." />
                <p>
                  Somme des profits du cartel : <M tex="50\,000 \times 10^6\ \$ > 44\,444 \times 10^6\ \$" />
                  . Le cartel fait donc mieux que l'équilibre de Nash — sur le papier.
                </p>
                <Callout variant="intuition">
                  <p>
                    En restreignant l'offre, le cartel se comporte comme un <em>monopole</em> partagé :
                    il sacrifie du volume contre un prix bien plus élevé (100 contre 66,7). C'est
                    précisément ce que fait l'OPEP en fixant des quotas.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.4 — Pourquoi le cartel est instable",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b3", section: "sec-deux" },
            ],
            content: (
              <>
                <p>
                  Le profil <M tex="(Q_I^C, Q_S^C) = (250, 250)" /> n'est <strong>pas</strong> un
                  équilibre de Nash : chaque pays a intérêt à dévier. Si l'Arabie Saoudite s'en tient
                  à <M tex="250" />, la meilleure réponse de l'Iran (formule 4.1) est :
                </p>
                <MB tex="Q_I^*(Q_S = 250) = 500 - \frac{250}{2} = 375 \;\neq\; 250." />
                <p>On peut aussi le voir sur la dérivée de l'utilité au point de cartel :</p>
                <MB tex="\left.\frac{\partial U_I}{\partial Q_I}\right|_{(250,250)} = 200 - \frac{2}{5}(250) - \frac{1}{5}(250) = 200 - 100 - 50 = 50 > 0." />
                <p>
                  La dérivée est <em>positive</em> : l'Iran augmenterait son profit en produisant plus
                  que <M tex="250" />. Chacun est tenté de « tricher » sur son quota pour vendre
                  davantage au prix élevé maintenu par l'autre — c'est la logique du{" "}
                  <strong>dilemme du prisonnier</strong>.
                </p>
                <Callout variant="attention">
                  <p>
                    Ne confonds pas « maximise le profit joint » et « équilibre de Nash ». Le cartel{" "}
                    <M tex="(250,250)" /> est <em>collectivement</em> optimal mais{" "}
                    <em>individuellement</em> instable : sans mécanisme d'engagement, il se défait.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.5 — Jeu séquentiel : exemples de stratégies",
            refs: [{ chapter: "b4", section: "s7" }],
            content: (
              <>
                <p>
                  L'Arabie Saoudite observe désormais <M tex="Q_I" /> avant de jouer. Chaque valeur de{" "}
                  <M tex="Q_I" /> ouvre un sous-jeu différent : il y a une infinité de sous-jeux.
                </p>
                <SequentialFan />
                <p>
                  L'Iran joue en premier : une stratégie pour lui est simplement une quantité, par
                  exemple <M tex="S_I = Q_I = 40" /> (un exemple, pas forcément une meilleure réponse).
                </p>
                <p>
                  L'Arabie Saoudite joue <em>après</em> avoir vu <M tex="Q_I" /> : sa stratégie doit
                  spécifier une quantité <M tex="Q_S" /> <strong>pour chaque</strong> <M tex="Q_I" />{" "}
                  possible — c'est une <em>fonction</em>. Par exemple{" "}
                  <M tex="S_S = Q_S(Q_I) = 1000 - 0{,}1\,Q_I" />.
                </p>
                <Callout variant="attention">
                  <p>
                    Piège classique : pour le second joueur, une stratégie n'est <strong>pas</strong>{" "}
                    un nombre mais une <strong>règle</strong> <M tex="Q_S(\cdot)" /> qui répond à
                    toute quantité observée. Un simple nombre ne dirait pas quoi faire dans les autres
                    sous-jeux.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.6 — La stratégie dominante de l'Arabie Saoudite",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  Quelle que soit la quantité <M tex="Q_I" /> observée, l'Arabie Saoudite maximise son
                  profit en jouant sa meilleure réponse calculée en 4.1. Sa stratégie dominante est
                  donc précisément cette fonction :
                </p>
                <MB tex="S_S^* = Q_S^*(Q_I) = 500 - \frac{Q_I}{2}." />
                <p>
                  Elle indique la meilleure action <em>dans chaque sous-jeu</em> : c'est exactement ce
                  qu'exige la perfection en sous-jeux.
                </p>
              </>
            ),
          },
          {
            title: "4.7 — L'ENPS par backward induction (Stackelberg)",
            refs: [{ chapter: "b3", section: "sec-fini" }],
            content: (
              <>
                <p>
                  L'Iran anticipe que l'Arabie Saoudite jouera <M tex="S_S^* = 500 - \tfrac{Q_I}{2}" />
                  . Il maximise donc son utilité <em>en y intégrant la réaction saoudienne</em> :
                </p>
                <MB tex="U_I\bigl(Q_I, Q_S^*(Q_I)\bigr) = 200\,Q_I - \frac{Q_I^2}{5} - \frac{Q_I\left(500 - \frac{Q_I}{2}\right)}{5} = 100\,Q_I - \frac{1}{10}Q_I^2." />
                <p>La condition de premier ordre donne la quantité optimale de l'Iran :</p>
                <MB tex="\frac{\partial U_I}{\partial Q_I} = 100 - \frac{1}{5}Q_I = 0 \quad\Longrightarrow\quad \hat{Q}_I = 500." />
                <p>L'ENPS est donc le couple (quantité de l'Iran ; fonction de réponse saoudienne) :</p>
                <MB tex="\text{ENPS} = (S_I^*, S_S^*) = \left(\,500\ ;\ 500 - \frac{Q_I}{2}\,\right)." />
                <p>
                  Le <em>résultat</em> associé : l'Iran produit <M tex="500" /> et l'Arabie Saoudite{" "}
                  <M tex="Q_S = 500 - \tfrac{500}{2} = 250" />.
                </p>
                <Callout variant="attention" title="Une stratégie n'est pas un résultat">
                  <p>
                    Le couple <M tex="(500, 250)" /> n'est <strong>pas</strong> l'ENPS :{" "}
                    <M tex="250" /> est la <em>quantité produite</em> par l'Arabie Saoudite dans le
                    résultat, pas sa <em>stratégie</em>. Sa stratégie reste la fonction{" "}
                    <M tex="500 - \tfrac{Q_I}{2}" />, qui dit quoi faire pour <em>tout</em>{" "}
                    <M tex="Q_I" />.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.8 — Résultat, comparaison et efficacité",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  Prix et profits de l'ENPS séquentiel (avec <M tex="Q_I = 500" />,{" "}
                  <M tex="Q_S = 250" />) :
                </p>
                <MB tex="p^* = 200 - \frac{500 + 250}{5} = 50, \qquad \pi_I = 10^6\times 500 \times 50 = 25\,000\times 10^6, \qquad \pi_S = 10^6\times 250 \times 50 = 12\,500\times 10^6." />
                <p>
                  La somme <M tex="37\,500 \times 10^6" /> est <em>inférieure</em> à celle du cartel{" "}
                  (<M tex="50\,000 \times 10^6" />) : l'ENPS séquentiel ne maximise donc{" "}
                  <strong>pas</strong> la somme des profits. En comparant à l'équilibre{" "}
                  <em>simultané</em> (où chacun gagnait <M tex="22\,222" />) :
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    l'<strong>Iran gagne</strong> : <M tex="25\,000 > 22\,222" /> — c'est l'
                    <strong>avantage du premier joueur</strong> (il s'engage sur une grosse quantité,
                    forçant l'Arabie Saoudite à se réduire) ;
                  </li>
                  <li>
                    l'<strong>Arabie Saoudite perd</strong> : <M tex="12\,500 < 22\,222" />.
                  </li>
                </ul>
                <p>
                  Enfin, le résultat de l'ENPS n'est <strong>pas efficace au sens de Pareto</strong> :
                  le cartel donnerait à l'Iran le même profit (<M tex="25\,000" />) tout en donnant à
                  l'Arabie Saoudite <em>bien plus</em> (<M tex="25\,000 > 12\,500" />). On pourrait
                  donc améliorer le sort de l'Arabie Saoudite sans nuire à l'Iran.
                </p>
              </>
            ),
          },
          {
            title: "Jeu répété : la forme normale d'une étape",
            refs: [
              { chapter: "b3", section: "sec-fritkot" },
              { chapter: "b3", section: "sec-cadre" },
            ],
            content: (
              <>
                <p>
                  On restreint chaque étape à deux quantités par pays : <M tex="Q^C = 250" />{" "}
                  (coopérer) ou <M tex="Q^* = 333" /> (dévier). Les utilités des quatre profils
                  (calculées avec <M tex="U_i = Q_i p^*" />) :
                </p>
                <MB tex="U_i(250,250) = 25\,000, \quad U_i(333,333) = 22\,222, \quad U_I(333,250) = 27\,777, \quad U_I(250,333) = 20\,833." />
                <PayoffMatrix
                  rowPlayer="Iran"
                  colPlayer="Arabie Saoudite"
                  rows={["Qᶜ = 250", "Q* = 333"]}
                  cols={["Qᶜ = 250", "Q* = 333"]}
                  payoffs={[
                    [
                      [25000, 25000],
                      [20833, 27777],
                    ],
                    [
                      [27777, 20833],
                      [22222, 22222],
                    ],
                  ]}
                  interactive
                  caption={
                    <>
                      Payoffs en <M tex="10^6\ \$" />. C'est un <strong>dilemme du prisonnier</strong>{" "}
                      : l'unique équilibre de Nash d'étape est <M tex="(Q^*, Q^*)" />, alors que{" "}
                      <M tex="(Q^C, Q^C)" /> serait meilleur pour les deux.
                    </>
                  }
                />
                <p>
                  Coopérer pour toujours rapporte, à chaque pays, la somme géométrique{" "}
                  <M tex="\sum_{t\ge 0}\delta^t\, 25\,000 = \dfrac{25\,000}{1-\delta}" />.
                </p>
              </>
            ),
          },
          {
            title: "4.9 — La stratégie grim est-elle un équilibre de Nash ?",
            refs: [
              { chapter: "b3", section: "sec-grim" },
              { chapter: "b3", section: "sec-infini" },
            ],
            content: (
              <>
                <p>
                  <M tex="(S_I^G, S_S^G)" /> est un équilibre de Nash si <em>aucun</em> pays ne gagne à
                  dévier. La déviation la plus profitable : produire <M tex="Q^*" /> une fois (gagner{" "}
                  <M tex="27\,777" /> pendant que l'autre coopère encore), puis subir la punition{" "}
                  <M tex="(Q^*, Q^*) = 22\,222" /> pour toujours.
                </p>
                <MB tex="\Pi^{\text{coop}} = \frac{25\,000}{1-\delta}, \qquad \Pi^{\text{dév}} = 27\,777 + \frac{\delta \cdot 22\,222}{1-\delta}." />
                <p>
                  <strong>Arabie Saoudite (<M tex="\delta_S = 1" />).</strong> Le pays est infiniment
                  patient. La différence coopérer − dévier vaut{" "}
                  <M tex="-2\,777 + \sum_{t\ge 1}\delta_S^t\,(2\,777) \to +\infty > 0" /> : elle ne
                  dévie pas. <M tex="S_S^G" /> est bien sa meilleure réponse.
                </p>
                <p>
                  <strong>Iran (<M tex="\delta_I = 0{,}4" />).</strong> On compare :
                </p>
                <MB tex="\Pi_I^{\text{coop}} = \frac{25\,000}{1 - 0{,}4} = \frac{25\,000}{0{,}6} \approx 41\,666" />
                <MB tex="\Pi_I^{\text{dév}} = 27\,777 + \frac{0{,}4 \times 22\,222}{0{,}6} \approx 27\,777 + 14\,815 = 42\,591." />
                <p>
                  Comme <M tex="42\,591 > 41\,666" />, l'Iran <strong>a intérêt à dévier</strong> :{" "}
                  <M tex="S_I^G" /> n'est pas sa meilleure réponse. Donc{" "}
                  <M tex="(S_I^G, S_S^G)" /> <strong>n'est pas</strong> un équilibre de Nash du jeu
                  répété : l'Iran est trop impatient pour que la menace de punition le retienne.
                </p>
              </>
            ),
          },
          {
            title: "4.10 — Le facteur d'escompte minimal",
            refs: [{ chapter: "b3", section: "sec-grim" }],
            content: (
              <>
                <p>
                  Le seuil <M tex="\delta_I^m" /> est la patience à partir de laquelle coopérer devient
                  au moins aussi bon que dévier. On résout l'égalité{" "}
                  <M tex="\Pi_I^{\text{coop}} = \Pi_I^{\text{dév}}" /> :
                </p>
                <MB tex="\frac{25\,000}{1-\delta} = 27\,777 + \frac{\delta\cdot 22\,222}{1-\delta}." />
                <p>On multiplie par <M tex="(1-\delta)" /> :</p>
                <MB tex="25\,000 = 27\,777\,(1-\delta) + 22\,222\,\delta = 27\,777 - 5\,555\,\delta." />
                <MB tex="5\,555\,\delta = 2\,777 \quad\Longrightarrow\quad \delta_I^m = \frac{2\,777}{5\,555} = 0{,}5." />
                <p>
                  Il faut donc <M tex="\delta_I \ge 0{,}5" /> pour que la coopération de cartel soit
                  soutenable par la stratégie grim. Avec <M tex="\delta_I = 0{,}4 < 0{,}5" />, on
                  retrouve bien le résultat du 4.9 : l'Iran dévie.
                </p>
                <Callout variant="retiens">
                  <p>
                    On retrouve la <strong>condition <M tex="\delta \ge \tfrac{1}{2}" /></strong> du
                    chapitre B3 : la coopération n'est un équilibre du jeu répété que si les joueurs
                    accordent assez de poids au futur. La punition « grim » ne dissuade que les
                    patients.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>4.1</strong> <M tex="Q_i^*(Q_{-i}) = 500 - \tfrac{Q_{-i}}{2}" />. ·{" "}
              <strong>4.2</strong> EN de Cournot <M tex="(333{,}3,\ 333{,}3)" />, profit{" "}
              <M tex="22\,222" /> chacun. · <strong>4.3</strong> cartel{" "}
              <M tex="Q^C = 250" />, profit <M tex="25\,000" /> (somme plus élevée). ·{" "}
              <strong>4.4</strong> instable : la meilleure réponse à <M tex="250" /> est{" "}
              <M tex="375" /> (dérivée <M tex="= 50 > 0" />). · <strong>4.7</strong> ENPS séquentiel{" "}
              <M tex="\bigl(500\,;\ 500 - \tfrac{Q_I}{2}\bigr)" />, résultat <M tex="(500, 250)" />. ·{" "}
              <strong>4.8</strong> profits Iran <M tex="25\,000" />, Arabie <M tex="12\,500" /> :
              avantage au premier, non Pareto-efficace. · <strong>4.9</strong> grim n'est{" "}
              <em>pas</em> un EN si <M tex="\delta_I = 0{,}4" /> (l'Iran dévie). ·{" "}
              <strong>4.10</strong> <M tex="\delta_I^m = 0{,}5" />.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> le duopole de Cournot se résout par les
              fonctions de meilleure réponse et leur intersection ; le cartel maximise le profit joint
              mais n'est pas un équilibre de Nash (chacun triche) ; décider en premier confère un{" "}
              <em>avantage stratégique</em> ; et la coopération répétée ne tient que si l'on est assez
              patient — la condition <M tex="\delta \ge \tfrac{1}{2}" />.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp3"
        id="qx4"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Dans le duopole séquentiel, l'Iran produit <M tex="500" /> et l'Arabie Saoudite{" "}
            <M tex="250" />. Pourquoi dit-on que <M tex="(500, 250)" /> n'est pas l'ENPS ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce que <M tex="250" /> est la quantité <em>produite</em> par l'Arabie Saoudite, pas
                sa stratégie : sa stratégie est la fonction <M tex="500 - \tfrac{Q_I}{2}" />, qui
                répond à tout <M tex="Q_I" />.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement. Le second joueur agit après avoir observé <M tex="Q_I" /> : sa stratégie
                est une <em>règle</em>. <M tex="(500, 250)" /> est le <em>résultat</em> de l'ENPS{" "}
                <M tex="\bigl(500\,;\ 500 - \tfrac{Q_I}{2}\bigr)" />, pas l'ENPS lui-même.
              </>
            ),
          },
          {
            text: <>Parce que l'Iran pourrait obtenir davantage en produisant moins.</>,
            explain: (
              <>
                Non : <M tex="\hat Q_I = 500" /> maximise déjà l'utilité de l'Iran compte tenu de la
                réaction saoudienne. Le problème n'est pas la quantité mais le statut de{" "}
                <M tex="250" /> (résultat vs stratégie).
              </>
            ),
          },
          {
            text: (
              <>
                Parce que <M tex="(500, 250)" /> n'est pas efficace au sens de Pareto.
              </>
            ),
            explain: (
              <>
                C'est vrai que le résultat n'est pas Pareto-efficace, mais ce n'est pas la raison :
                même efficace, <M tex="(500, 250)" /> resterait un couple de <em>quantités</em>, pas
                un profil de <em>stratégies</em>.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Dans un jeu séquentiel, distingue toujours la <strong>stratégie</strong> du second joueur
            (une fonction de ce qu'il observe) du <strong>résultat</strong> effectivement réalisé sur
            le chemin d'équilibre.
          </>
        }
      />
    </TpShell>
  );
}
