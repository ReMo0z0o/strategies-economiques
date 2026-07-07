/**
 * TP · Séance 2 — Jeux simultanés (ECGEB366).
 *
 * Énoncés fidèles au document officiel « Séance d'exercices 2 » ;
 * résolutions pas à pas alignées sur le corrigé officiel
 * (« Devoir 2 : Solutions »). Les coquilles de numérotation du corrigé
 * sont signalées sur place dans des encadrés « attention ».
 *
 * Toutes les matrices de jeu sont rendues (PayoffMatrix interactive pour
 * les jeux numériques, SymbolicMatrix locale pour les jeux paramétrés)
 * afin que l'étudiant puisse chercher sans ouvrir le PDF.
 */
import { useState, type ReactNode } from "react";
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { Quiz } from "@/components/course/Quiz";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

/** Format français : d décimales, virgule décimale. */
function fmt(x: number, d = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(d).replace(".", ",");
}

/**
 * Matrice de jeu à payoffs symboliques (200 − p, 1 + m_B, f − c…) : même
 * mise en page que PayoffMatrix, mais chaque case est un ReactNode. On
 * l'utilise pour les jeux dépendant d'un paramètre (pénalité, prime, amende).
 */
function SymbolicMatrix({
  rowPlayer,
  colPlayer,
  rows,
  cols,
  cells,
  caption,
}: {
  rowPlayer: string;
  colPlayer: string;
  rows: ReactNode[];
  cols: ReactNode[];
  /** cells[r][c] = [payoff joueur ligne, payoff joueur colonne] */
  cells: Array<Array<[ReactNode, ReactNode]>>;
  caption?: ReactNode;
}) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto">
        <div className="inline-block rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-sky-700">
            {colPlayer}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 text-xs font-bold uppercase tracking-wider text-rose-700"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {rowPlayer}
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {cols.map((c, j) => (
                    <th
                      key={j}
                      className="min-w-[6.5rem] p-1.5 text-center text-sm font-semibold text-sky-700"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rLabel, r) => (
                  <tr key={r}>
                    <th className="p-1.5 pr-2 text-right text-sm font-semibold text-rose-700">
                      {rLabel}
                    </th>
                    {cols.map((_, c) => (
                      <td key={c} className="p-1">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-border bg-background px-3 py-2.5 text-[14.5px]">
                          <span className="font-semibold text-rose-700">{cells[r][c][0]}</span>
                          <span className="text-muted-foreground">;</span>
                          <span className="font-semibold text-sky-700">{cells[r][c][1]}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Diagramme de Venn de l'exercice 1.3 — ESD ⊆ EN ⊆ PSS ⊆ profils      */
/* ------------------------------------------------------------------ */

function VennEx1() {
  const profile = (x: number, y: number, txt: string) => (
    <text x={x} y={y} textAnchor="middle" fontSize={13} fontWeight={600} fill="#334155">
      {txt}
    </text>
  );
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 580 340"
        role="img"
        aria-label="Diagramme de Venn : l'équilibre en stratégies dominantes est vide, inclus dans les équilibres de Nash (U,l) et (M,m), inclus dans les PSS, inclus dans les neuf profils du jeu"
        className="mx-auto w-full max-w-2xl"
      >
        <ellipse cx="290" cy="180" rx="278" ry="150" fill="#fafaf9" stroke="#1c1917" strokeWidth="2" />
        <ellipse cx="315" cy="190" rx="188" ry="108" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
        <ellipse cx="335" cy="198" rx="112" ry="66" fill="#d1fae5" stroke="#047857" strokeWidth="2" />
        <ellipse cx="365" cy="206" rx="48" ry="31" fill="#ffe4e6" stroke="#be123c" strokeWidth="2" />

        {/* Étiquettes des ensembles */}
        <text x="215" y="50" textAnchor="middle" fontSize="14.5" fontWeight="600" fill="#1c1917">
          Tous les profils du jeu
        </text>
        <text x="315" y="100" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">
          PSS
        </text>
        <text x="295" y="150" textAnchor="middle" fontSize="14" fontWeight="700" fill="#047857">
          EN
        </text>
        <text x="365" y="190" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#be123c">
          ESD
        </text>
        <text x="365" y="216" textAnchor="middle" fontSize="17" fontWeight="700" fill="#be123c">
          ∅
        </text>

        {/* Profils hors PSS */}
        {profile(108, 82, "(U, r)")}
        {profile(62, 138, "(D, l)")}
        {profile(58, 188, "(D, m)")}
        {profile(74, 242, "(D, r)")}
        {profile(160, 292, "(M, r)")}
        {/* Profils PSS mais non EN */}
        {profile(196, 148, "(U, m)")}
        {profile(196, 236, "(M, l)")}
        {/* Équilibres de Nash (EN, hors ESD) */}
        {profile(260, 182, "(U, l)")}
        {profile(264, 222, "(M, m)")}
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Emboîtement des trois concepts de solution pour ce jeu : l'ESD est vide, strictement inclus
        dans les deux équilibres de Nash (U, l) et (M, m), eux-mêmes inclus dans les quatre PSS,
        inclus dans les neuf profils du jeu.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Widget · Exercice 5 — l'équilibre mixte du jeu fisc / citoyen       */
/* ------------------------------------------------------------------ */

const COL_CTRL = "#0284c7"; // sky-600 — probabilité de contrôle

function FraudeExplorer() {
  const [f, setF] = useState(4);
  const [c, setC] = useState(1);

  // Équilibre en stratégies mixtes (intérieur) :
  //   q* = P(fisc = Confiance) = 1 − 2/f   (indifférence du citoyen)
  //   p* = P(citoyen = Payer)  = 1 − c/f   (indifférence du fisc)
  const qStar = Math.max(0, Math.min(1, 1 - 2 / f));
  const pStar = Math.max(0, Math.min(1, 1 - c / f));
  const controlProb = Math.max(0, Math.min(1, 2 / f)); // = 1 − q*
  const uFisc = 2 - (2 * c) / f; // = 2 p*
  const degenere = c >= f || f <= 2;

  const FX = (v: number) => 44 + ((v - 2) / 6) * 366; // f ∈ [2, 8]
  const FY = (y: number) => 150 - y * 128; // y ∈ [0, 1]
  const curve: string[] = [];
  for (let v = 2; v <= 8.0001; v += 0.25) curve.push(`${FX(v)},${FY(2 / v)}`);

  const tiles = [
    { label: "p* = P(payer)", value: fmt(pStar) },
    { label: "q* = P(confiance)", value: fmt(qStar) },
    { label: "Contrôle 1 − q* = 2/f", value: fmt(controlProb) },
    { label: "Payoff espéré du fisc", value: fmt(uFisc) },
  ];

  return (
    <InteractiveCard
      title="Explore : comment l'équilibre mixte bouge avec l'amende f et le coût c ?"
      subtitle={
        <>
          Le modèle exact de l'exercice résolu pour chaque <M tex="(f,\,c)" />. La courbe trace la
          probabilité de contrôle <M tex="1 - q^{*} = 2/f" /> — le cœur de la question 5.4.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Amende <M tex="f" /> (avec <M tex="f \geq 2" />)
              </>
            }
            value={f}
            onChange={setF}
            min={2}
            max={8}
            step={0.5}
            format={(v) => fmt(v, 1)}
          />
          <SliderControl
            label={
              <>
                Coût du contrôle <M tex="c" />
              </>
            }
            value={c}
            onChange={setC}
            min={0}
            max={4}
            step={0.5}
            format={(v) => fmt(v, 1)}
          />
        </>
      }
      footer={
        <>
          quand l'amende <M tex="f" /> augmente, la probabilité de contrôle{" "}
          <M tex="2/f" /> <strong>diminue</strong> (courbe décroissante) : une amende plus lourde
          suffit à dissuader, le fisc peut relâcher sa surveillance. Le coût <M tex="c" />, lui, ne
          touche <em>pas</em> <M tex="q^{*}" /> (donc pas la probabilité de contrôle), mais fait
          chuter <M tex="p^{*}" /> : le citoyen fraude plus souvent, et le payoff du fisc baisse.
        </>
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((s) => (
          <div key={s.label} className="rounded-lg border bg-muted/40 px-2.5 py-1.5 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className="text-[15px] font-bold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
      {degenere ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
          ⚠️ Aux bords (<M tex="f = 2" />, ou <M tex="c \geq f" />), l'équilibre devient dégénéré
          (une des probabilités touche 0 ou 1) : on bascule alors sur un équilibre en stratégies
          pures. L'équilibre <em>mixte intérieur</em> suppose <M tex="f > 2" /> et{" "}
          <M tex="0 < c < f" />.
        </p>
      ) : null}
      <svg
        viewBox="0 0 420 172"
        className="w-full"
        role="img"
        aria-label="Probabilité de contrôle à l'équilibre en fonction de l'amende f"
      >
        {/* axes */}
        <line x1={44} y1={150} x2={410} y2={150} stroke="var(--color-border)" strokeWidth={1.2} />
        <line x1={44} y1={16} x2={44} y2={150} stroke="var(--color-border)" strokeWidth={1.2} />
        {/* graduations y */}
        {[0, 0.5, 1].map((y) => (
          <g key={y}>
            <line x1={41} x2={44} y1={FY(y)} y2={FY(y)} stroke="var(--color-muted-foreground)" />
            <text x={37} y={FY(y) + 4} fontSize={10} textAnchor="end" fill="var(--color-muted-foreground)">
              {fmt(y, 1)}
            </text>
          </g>
        ))}
        {/* graduations x */}
        {[2, 4, 6, 8].map((v) => (
          <text key={v} x={FX(v)} y={165} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
            {v}
          </text>
        ))}
        <text x={228} y={172} fontSize={11} textAnchor="middle" fill="var(--color-muted-foreground)">
          amende f
        </text>
        {/* courbe 2/f */}
        <polyline points={curve.join(" ")} fill="none" stroke={COL_CTRL} strokeWidth={2.5} />
        {/* marqueur au point courant */}
        <line
          x1={FX(f)}
          x2={FX(f)}
          y1={FY(controlProb)}
          y2={150}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.2}
          strokeDasharray="4 4"
        />
        <circle cx={FX(f)} cy={FY(controlProb)} r={4.5} fill={COL_CTRL} />
        <text x={FX(f) + 8} y={FY(controlProb) - 6} fontSize={11} fontWeight={700} fill={COL_CTRL}>
          2/f = {fmt(controlProb)}
        </text>
      </svg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={2}
      intro={
        <>
          <p>
            Cette séance ouvre la <strong>Partie B — les interactions stratégiques</strong> avec le
            chapitre <strong>B1 (jeux simultanés)</strong>. Tu vas manipuler les trois concepts de
            solution du cours : les stratégies (strictement) dominantes et l'équilibre en stratégies
            dominantes (ESD), l'élimination itérative des stratégies dominées (PSS), et surtout
            l'équilibre de Nash — d'abord en stratégies <em>pures</em>, puis en stratégies{" "}
            <em>mixtes</em>. Avant de te lancer, révise dans le chapitre B1 comment lire une matrice
            de jeu, souligner les meilleures réponses de chaque joueur, et la{" "}
            <strong>propriété d'indifférence</strong> qui donne les stratégies mixtes. Conseil de
            méthode : pour chaque jeu, commence toujours par souligner les meilleures réponses —
            une case doublement soulignée est un équilibre de Nash en stratégies pures. Sers-toi des
            matrices interactives pour t'entraîner avant de révéler les étapes !
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — Dominance, PSS, Nash, diagramme de Venn          */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex1"
        number={1}
        title="Dominance, élimination itérative et équilibres de Nash"
        difficulty={2}
        refs={[
          { chapter: "b1", section: "s3" },
          { chapter: "b1", section: "s4" },
          { chapter: "b1", section: "s5" },
          { chapter: "b1", section: "s6" },
        ]}
        statement={
          <>
            <p>
              Considère le jeu suivant entre deux joueurs ayant chacun trois stratégies. Les trois
              stratégies du joueur 1 sont <M tex="U" />, <M tex="M" /> et <M tex="D" />, tandis que
              celles du joueur 2 sont <M tex="l" />, <M tex="m" /> et <M tex="r" />. Dans chaque
              case, le premier nombre est le payoff du joueur 1 (ligne), le second celui du joueur 2
              (colonne).
            </p>
            <PayoffMatrix
              rowPlayer="Joueur 1"
              colPlayer="Joueur 2"
              rows={["U", "M", "D"]}
              cols={["l", "m", "r"]}
              payoffs={[
                [
                  [4, 3],
                  [0, 1],
                  [4, 2],
                ],
                [
                  [2, 1],
                  [1, 2],
                  [4, 0],
                ],
                [
                  [1, 2],
                  [0, 0],
                  [7, 1],
                ],
              ]}
              interactive
              caption={
                <>
                  Explore toi-même : révèle les meilleures réponses de chaque joueur, puis les
                  équilibres de Nash.
                </>
              }
            />
            <SubQuestion label="1.1">
              Un des deux joueurs a-t-il une stratégie dominante ? Un des deux joueurs a-t-il une
              stratégie dominée ?
            </SubQuestion>
            <SubQuestion label="1.2">
              S'ils existent, trouve (i) l'équilibre en stratégies dominantes, (ii) les profils de
              stratégies survivant au processus d'élimination itérative des stratégies dominées
              (PSS), et (iii) les équilibres de Nash.
            </SubQuestion>
            <SubQuestion label="1.3">
              Trace un diagramme de Venn montrant l'ensemble des profils de stratégies de ce jeu,
              les équilibres de Nash, les PSS et l'équilibre en stratégies dominantes.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Les bons outils : dominante, dominée, meilleure réponse",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <Callout variant="definition">
                  <p>
                    Une stratégie est <strong>dominante</strong> pour un joueur si elle lui donne le
                    meilleur payoff <em>quelle que soit</em> la stratégie de l'adversaire. Une
                    stratégie <M tex="s" /> est <strong>(strictement) dominée</strong> s'il existe
                    une autre stratégie qui rapporte <em>toujours</em> strictement plus, quelle que
                    soit la stratégie de l'adversaire.
                  </p>
                </Callout>
                <Callout variant="methode">
                  <p>
                    Pour tester si une colonne du joueur 2 est dominée, on <strong>fige</strong>{" "}
                    chaque ligne du joueur 1 l'une après l'autre et on compare les payoffs du
                    joueur 2 (les seconds nombres). Même réflexe pour les lignes du joueur 1 avec les
                    premiers nombres. Le tri est mécanique : ne raisonne jamais « à l'œil ».
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 — Chercher stratégies dominantes et dominées",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  <strong>Aucun</strong> joueur n'a de stratégie dominante. Par exemple,{" "}
                  <M tex="l" /> n'est pas dominante pour le joueur 2, car <M tex="m" /> lui rapporte
                  davantage lorsque le joueur 1 joue <M tex="M" /> :
                </p>
                <MB tex="u_2(M,l) = 1 < 2 = u_2(M,m)" />
                <p>
                  <strong>Le joueur 2 a une stratégie dominée</strong> : la stratégie <M tex="r" />{" "}
                  est dominée par <M tex="l" />, car pour n'importe quelle stratégie du joueur 1,{" "}
                  <M tex="l" /> rapporte strictement plus que <M tex="r" /> au joueur 2 :
                </p>
                <MB tex="u_2(U,l) = 3 > 2 = u_2(U,r), \quad u_2(M,l) = 1 > 0 = u_2(M,r), \quad u_2(D,l) = 2 > 1 = u_2(D,r)." />
                <p>
                  <strong>Le joueur 1 n'a aucune stratégie dominée.</strong> Par exemple,{" "}
                  <M tex="D" /> n'est pas dominée par <M tex="M" />, puisque <M tex="D" /> fait mieux
                  que <M tex="M" /> quand le joueur 2 joue <M tex="r" /> :
                </p>
                <MB tex="u_1(M,r) = 4 < 7 = u_1(D,r)." />
                <Callout variant="attention">
                  <p>
                    Ne confonds pas « dominante » et « dominée ». Une stratégie <em>dominante</em>{" "}
                    bat toutes les autres du <em>même</em> joueur ; une stratégie <em>dominée</em>{" "}
                    est battue par une autre du même joueur. Ici, aucune stratégie n'est dominante,
                    mais une seule (<M tex="r" />) est dominée.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 (i) & (ii) — Pas d'ESD, mais un PSS par élimination itérative",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b1", section: "s4" },
            ],
            content: (
              <>
                <p>
                  <strong>(i) Équilibre en stratégies dominantes (ESD).</strong> Il faudrait que{" "}
                  <em>chaque</em> joueur ait une stratégie dominante — or aucun n'en a. Il n'existe
                  donc <strong>pas d'ESD</strong>.
                </p>
                <p>
                  <strong>(ii) PSS.</strong> On élimine, tour à tour, les stratégies strictement
                  dominées.
                </p>
                <p>
                  <strong>Itération 0.</strong> La seule stratégie dominée est <M tex="r" /> (joueur
                  2). Un joueur 1 rationnel sait que le joueur 2 ne jouera jamais <M tex="r" />, d'où
                  le jeu réduit :
                </p>
                <PayoffMatrix
                  rowPlayer="Joueur 1"
                  colPlayer="Joueur 2"
                  rows={["U", "M", "D"]}
                  cols={["l", "m"]}
                  payoffs={[
                    [
                      [4, 3],
                      [0, 1],
                    ],
                    [
                      [2, 1],
                      [1, 2],
                    ],
                    [
                      [1, 2],
                      [0, 0],
                    ],
                  ]}
                  showBestResponses
                  caption={<>Après suppression de r. Les meilleures réponses sont soulignées.</>}
                />
                <p>
                  <strong>Itération 1.</strong> Dans ce jeu réduit, <M tex="D" /> devient dominée
                  par <M tex="M" /> pour le joueur 1 :
                </p>
                <MB tex="u_1(M,l) = 2 > 1 = u_1(D,l) \quad \text{et} \quad u_1(M,m) = 1 > 0 = u_1(D,m)." />
                <p>On supprime <M tex="D" />, ce qui laisse :</p>
                <PayoffMatrix
                  rowPlayer="Joueur 1"
                  colPlayer="Joueur 2"
                  rows={["U", "M"]}
                  cols={["l", "m"]}
                  payoffs={[
                    [
                      [4, 3],
                      [0, 1],
                    ],
                    [
                      [2, 1],
                      [1, 2],
                    ],
                  ]}
                  showBestResponses
                  caption={<>Aucune stratégie n'est plus dominée : le processus s'arrête.</>}
                />
                <Callout variant="retiens">
                  <p>
                    Quatre profils survivent à l'élimination itérative :{" "}
                    <strong>(U, l), (U, m), (M, l) et (M, m)</strong>.
                  </p>
                </Callout>
                <Callout variant="attention">
                  <p>
                    L'ordre d'élimination doit toujours respecter la rationalité « en cascade » : on
                    n'enlève <M tex="D" /> qu'<em>après</em> avoir enlevé <M tex="r" />, parce que
                    c'est seulement dans le jeu sans <M tex="r" /> que <M tex="D" /> devient dominée.
                    Avec la domination <em>stricte</em>, l'ordre n'affecte pas le résultat final,
                    mais il faut le justifier étape par étape.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 (iii) — Les équilibres de Nash par les meilleures réponses",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  On souligne, dans la matrice complète, la meilleure réponse de chaque joueur à
                  chaque stratégie de l'autre. Une case où les <em>deux</em> payoffs sont soulignés
                  est un équilibre de Nash (chacun y joue une meilleure réponse, personne n'a intérêt
                  à dévier seul).
                </p>
                <PayoffMatrix
                  rowPlayer="Joueur 1"
                  colPlayer="Joueur 2"
                  rows={["U", "M", "D"]}
                  cols={["l", "m", "r"]}
                  payoffs={[
                    [
                      [4, 3],
                      [0, 1],
                      [4, 2],
                    ],
                    [
                      [2, 1],
                      [1, 2],
                      [4, 0],
                    ],
                    [
                      [1, 2],
                      [0, 0],
                      [7, 1],
                    ],
                  ]}
                  showBestResponses
                  highlight={[
                    [0, 0],
                    [1, 1],
                  ]}
                  caption={
                    <>
                      Les deux cases encadrées — (U, l) et (M, m) — sont les seules où les deux
                      meilleures réponses coïncident.
                    </>
                  }
                />
                <p>
                  Il y a donc <strong>deux équilibres de Nash en stratégies pures : (U, l) et (M, m)</strong>.
                </p>
                <Callout variant="intuition">
                  <p>
                    Remarque le lien : les deux équilibres de Nash font partie des quatre PSS —
                    c'est général, tout équilibre de Nash survit à l'élimination des stratégies
                    strictement dominées. En revanche l'inverse est faux : (U, m) et (M, l)
                    survivent au PSS sans être des équilibres de Nash.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 — Le diagramme de Venn des solutions",
            refs: [{ chapter: "b1", section: "s6" }],
            content: (
              <>
                <p>
                  On empile les ensembles du plus petit au plus grand :{" "}
                  <M tex="\text{ESD} \subseteq \text{EN} \subseteq \text{PSS} \subseteq \text{profils}" />.
                  Ici l'ESD est vide, les deux équilibres de Nash sont au cœur, entourés des quatre
                  PSS, eux-mêmes noyés dans les neuf profils du jeu.
                </p>
                <VennEx1 />
                <Callout variant="retiens">
                  <p>
                    Ce jeu illustre parfaitement la hiérarchie : un ESD (quand il existe) est un
                    équilibre de Nash unique ; les équilibres de Nash sont toujours des PSS ; et les
                    PSS ne sont qu'un sous-ensemble des profils possibles. Plus le concept de
                    solution est exigeant, plus l'ensemble est petit.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> Aucune stratégie dominante ; une seule stratégie dominée :{" "}
              <M tex="r" /> (joueur 2), dominée par <M tex="l" />. · <strong>1.2</strong> (i) pas
              d'ESD ; (ii) PSS = {"{"}(U, l), (U, m), (M, l), (M, m){"}"} ; (iii) deux équilibres de
              Nash : (U, l) et (M, m). · <strong>1.3</strong> ESD (∅) ⊆ EN ⊆ PSS ⊆ profils.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> le tri dominante/dominée se fait colonne par
              colonne (ou ligne par ligne) en figeant l'adversaire ; l'élimination itérative se
              justifie « en cascade » ; et les équilibres de Nash se lisent d'un coup d'œil en
              soulignant les meilleures réponses. Les trois concepts s'emboîtent :{" "}
              <M tex="\text{ESD} \subseteq \text{EN} \subseteq \text{PSS}" />.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx1"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            La case (D, r) contient le plus gros gain de toute la matrice pour le joueur 1 (un
            payoff de 7). Pourtant (D, r) n'est pas un équilibre de Nash. Pourquoi ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce qu'un équilibre de Nash exige que <em>chaque</em> joueur joue une meilleure
                réponse. Face à <M tex="D" />, le joueur 2 préfère <M tex="l" /> (payoff 2) à{" "}
                <M tex="r" /> (payoff 1) : il dévie. La case n'est pas stable.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : un équilibre de Nash est une question de stabilité mutuelle, pas de
                « plus gros gain ». Le joueur 2 casse (D, r) en passant à <M tex="l" />.
              </>
            ),
          },
          {
            text: (
              <>
                Parce qu'un équilibre de Nash est forcément la case qui maximise la somme des deux
                payoffs.
              </>
            ),
            explain: (
              <>
                Non : l'équilibre de Nash n'a rien à voir avec la somme des payoffs. (M, m) est un
                Nash avec une somme de 3 seulement.
              </>
            ),
          },
          {
            text: (
              <>
                Parce qu'un équilibre de Nash exige que les deux joueurs obtiennent le même gain, or
                ici <M tex="7 \neq 1" />.
              </>
            ),
            explain: (
              <>
                Non : rien n'impose l'égalité des payoffs à l'équilibre. (U, l) est un Nash avec des
                payoffs (4, 3) différents.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Le réflexe : pour tester une case, demande-toi si <em>l'un des deux joueurs</em> peut
            améliorer son sort en changeant seul de stratégie. Si oui, ce n'est pas un Nash — quel
            que soit le montant des gains affichés.
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 2 — Course à l'armement : dilemme du prisonnier      */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex2"
        number={2}
        title="Course à l'armement nucléaire : concevoir la bonne pénalité"
        difficulty={2}
        refs={[
          { chapter: "b1", section: "s2" },
          { chapter: "b1", section: "s3" },
          { chapter: "b1", section: "s5" },
        ]}
        statement={
          <>
            <p>
              Les États-Unis et la Chine, deux superpuissances militaires, aimeraient éviter une
              course à l'armement nucléaire. Chacun doit décider <strong>simultanément</strong>{" "}
              d'investir davantage dans l'armement (INV / inv) ou de réduire son stock actuel
              (RED / red). Les fonctions d'utilité des deux pays sont
            </p>
            <MB tex="U_{US}(x) = \frac{x}{10^{9}} = U_{Ch}(x)," />
            <p>
              où <M tex="x" /> est un montant en $ (un milliard s'écrit <M tex="10^{9}" />). Les
              issues sont les suivantes :
            </p>
            <ul className="my-2 list-disc space-y-1 pl-6">
              <li>si les deux réduisent leur stock : chacun reçoit l'équivalent de 100 milliards $ ;</li>
              <li>si les deux investissent : chacun reçoit l'équivalent de −100 milliards $ ;</li>
              <li>
                si l'un investit et l'autre réduit : celui qui investit reçoit 200 milliards $, celui
                qui réduit reçoit −300 milliards $.
              </li>
            </ul>
            <p>
              En utilité (1 unité = 1 milliard $), la forme normale du jeu est donc :
            </p>
            <PayoffMatrix
              rowPlayer="États-Unis"
              colPlayer="Chine"
              rows={["INV", "RED"]}
              cols={["inv", "red"]}
              payoffs={[
                [
                  [-100, -100],
                  [200, -300],
                ],
                [
                  [-300, 200],
                  [100, 100],
                ],
              ]}
              interactive
              caption={<>Explore : cherche la stratégie dominante de chaque pays, puis l'équilibre de Nash.</>}
            />
            <SubQuestion label="2.1">À quel type appartient ce jeu ?</SubQuestion>
            <p>
              Pour atteindre le résultat optimal « les deux pays réduisent leur stock », les deux
              pays signent un pacte de contrôle des armes nucléaires prévoyant une pénalité{" "}
              <M tex="P" /> (en $) pour tout pays qui continue d'investir. On pose{" "}
              <M tex="p = P/10^{9}" />.
            </p>
            <SubQuestion label="2.2">
              Quelle est la pénalité minimum pour que le résultat optimal (RED, red) soit un{" "}
              <strong>équilibre de Nash</strong> ?
            </SubQuestion>
            <SubQuestion label="2.3">
              Quelle est la pénalité minimum pour que (RED, red) soit un{" "}
              <strong>équilibre en stratégies dominantes</strong> ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "2.1 — Reconnaître le dilemme du prisonnier",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "a1", section: "pareto" },
            ],
            content: (
              <>
                <p>
                  <strong>INV est une stratégie dominante pour les USA</strong> : elle bat RED quelle
                  que soit la décision de la Chine.
                </p>
                <MB tex="u_{US}(INV, inv) = -100 > -300 = u_{US}(RED, inv) \quad \text{et} \quad u_{US}(INV, red) = 200 > 100 = u_{US}(RED, red)." />
                <p>
                  Le jeu étant symétrique, <M tex="inv" /> est aussi dominante pour la Chine. Le
                  profil <strong>(INV, inv)</strong> est donc l'unique équilibre en stratégies
                  dominantes (et l'unique équilibre de Nash).
                </p>
                <Callout variant="retiens">
                  <p>
                    Le hic : l'issue (INV, inv) donne <M tex="(-100, -100)" />, alors que (RED, red)
                    donnerait <M tex="(100, 100)" /> — strictement mieux pour les deux. L'équilibre
                    est donc <strong>dominé au sens de Pareto</strong> par un autre résultat. C'est
                    la signature du <strong>dilemme du prisonnier</strong> : la rationalité
                    individuelle conduit à un résultat collectivement mauvais.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.2 — La pénalité qui fait de (RED, red) un équilibre de Nash",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  La pénalité <M tex="p" /> frappe uniquement le pays qui joue INV/inv. La matrice
                  devient :
                </p>
                <SymbolicMatrix
                  rowPlayer="États-Unis"
                  colPlayer="Chine"
                  rows={["INV", "RED"]}
                  cols={["inv", "red"]}
                  cells={[
                    [
                      [<M key="a" tex="-100 - p" />, <M key="b" tex="-100 - p" />],
                      [<M key="c" tex="200 - p" />, "-300"],
                    ],
                    [
                      ["-300", <M key="d" tex="200 - p" />],
                      ["100", "100"],
                    ],
                  ]}
                  caption={<>La pénalité p s'ajoute à chaque case où le pays concerné a joué « investir ».</>}
                />
                <p>
                  Pour que (RED, red) soit un équilibre de Nash, il faut que RED (resp. red) soit la
                  meilleure réponse de chaque pays à red (resp. RED) :
                </p>
                <MB tex="u_{US}(RED, red) \geq u_{US}(INV, red) \;\Longleftrightarrow\; 100 \geq 200 - p" />
                <MB tex="u_{Ch}(RED, red) \geq u_{Ch}(RED, inv) \;\Longleftrightarrow\; 100 \geq 200 - p" />
                <p>
                  Les deux conditions donnent <M tex="p \geq 100" />. La pénalité minimale est donc{" "}
                  <M tex="p = 100" />, soit
                </p>
                <MB tex="P = 10^{9} \times p = 100 \text{ milliards \$}." />
                <Callout variant="attention">
                  <p>
                    À <M tex="p = 100" /> exactement, les deux pays sont <em>indifférents</em> à red
                    entre RED et INV : (RED, red) devient un équilibre de Nash « au sens faible ».
                    (INV, inv) reste également un équilibre — le pacte crée un <em>second</em>{" "}
                    équilibre souhaitable, il ne détruit pas encore l'ancien.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 — La pénalité qui fait de (RED, red) un équilibre en stratégies dominantes",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  Cette fois, on veut que RED (resp. red) soit <strong>dominante</strong> : la
                  meilleure réponse <em>quelle que soit</em> la décision adverse. Il faut donc, en
                  plus des conditions de 2.2, que RED batte INV même quand l'autre investit :
                </p>
                <MB tex="u_{US}(RED, inv) \geq u_{US}(INV, inv) \;\Longleftrightarrow\; -300 \geq -100 - p \;\Longleftrightarrow\; p \geq 200," />
                <p>
                  et de même pour la Chine par symétrie. Comme il faut satisfaire à la fois{" "}
                  <M tex="p \geq 100" /> (de 2.2) et <M tex="p \geq 200" />, la contrainte
                  contraignante est <M tex="p \geq 200" />. La pénalité minimale est donc
                </p>
                <MB tex="P = 200 \text{ milliards \$}." />
                <Callout variant="intuition">
                  <p>
                    Pourquoi faut-il une pénalité <em>plus lourde</em> pour l'ESD que pour le Nash ?
                    Parce qu'un équilibre de Nash demande seulement que réduire soit la meilleure
                    réponse <em>quand l'autre réduit aussi</em>. Une stratégie dominante exige que
                    réduire reste la meilleure réponse <em>même si l'autre investit</em> — un cas où
                    le pays « lésé » (payoff −300) est très tenté d'investir en représailles. Il faut
                    donc dissuader plus fort.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>2.1</strong> Dilemme du prisonnier : INV/inv dominante, (INV, inv) est l'ESD,
              dominé au sens de Pareto par (RED, red). · <strong>2.2</strong> pénalité minimale pour
              un équilibre de Nash : <M tex="p = 100" />, soit <strong>P = 100 milliards $</strong>. ·{" "}
              <strong>2.3</strong> pénalité minimale pour un équilibre en stratégies dominantes :{" "}
              <M tex="p = 200" />, soit <strong>P = 200 milliards $</strong>.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> un accord avec pénalité peut transformer un
              dilemme du prisonnier en jeu coopératif. Rendre (RED, red) simplement stable (Nash) est
              deux fois moins coûteux que le rendre dominant : plus le concept de solution est
              exigeant, plus la pénalité requise est élevée.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx2"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Pourquoi la pénalité requise pour faire de (RED, red) un équilibre en stratégies
            dominantes est-elle strictement plus élevée que celle qui en fait un équilibre de Nash ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce que « dominante » impose que réduire soit la meilleure réponse{" "}
                <em>même si l'adversaire investit</em> — une condition supplémentaire par rapport au
                Nash, qui ne teste que la réponse à « l'adversaire réduit ».
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : l'ESD ajoute la condition <M tex="-300 \geq -100 - p" /> (soit{" "}
                <M tex="p \geq 200" />), plus exigeante que <M tex="p \geq 100" />.
              </>
            ),
          },
          {
            text: <>Parce que la pénalité pour un équilibre de Nash est toujours nulle.</>,
            explain: (
              <>
                Non : ici il faut déjà <M tex="p \geq 100" /> pour le Nash. Une pénalité nulle
                laisserait (INV, inv) comme seul équilibre.
              </>
            ),
          },
          {
            text: <>Parce qu'un équilibre en stratégies dominantes n'est jamais un équilibre de Nash.</>,
            explain: (
              <>
                Au contraire : tout équilibre en stratégies dominantes <em>est</em> un équilibre de
                Nash. C'est un cas particulier, plus exigeant.
              </>
            ),
          },
        ]}
      />

      {/* ============================================================ */}
      {/* Exercice 3 — Coup d'état au Turkistan                         */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex3"
        number={3}
        title="Coup d'état militaire au Turkistan : reconnaître les jeux classiques"
        difficulty={2}
        refs={[
          { chapter: "b1", section: "s2" },
          { chapter: "b1", section: "s5" },
          { chapter: "b1", section: "s3" },
        ]}
        statement={
          <>
            <p>
              Le Turkistan compte trois forces militaires indépendantes : une petite force{" "}
              <M tex="A" /> et deux grandes forces <M tex="B" /> et <M tex="C" />. Le général{" "}
              <M tex="A" /> lance un coup d'état. Les généraux <M tex="B" /> et <M tex="C" />, qui ne
              peuvent pas communiquer, doivent chacun décider <strong>simultanément</strong> de
              contre-attaquer pour repousser le coup d'état (stratégie <strong>Loyale</strong>) ou de
              rejoindre le coup d'état (stratégie <strong>Rebelle</strong>). Dans les deux cas
              ci-dessous, la pire issue pour <M tex="B" /> et <M tex="C" /> est de prendre des
              décisions <em>différentes</em> (risque de guerre civile).
            </p>
            <p>
              <strong>Cas 1</strong> — le général <M tex="B" /> est favorable au gouvernement civil,
              le général <M tex="C" /> y est défavorable :
            </p>
            <PayoffMatrix
              rowPlayer="Général B"
              colPlayer="Général C"
              rows={["Loyale", "Rebelle"]}
              cols={["Loyale", "Rebelle"]}
              payoffs={[
                [
                  [2, 1],
                  [0, 0],
                ],
                [
                  [0, 0],
                  [1, 2],
                ],
              ]}
              interactive
              caption={<>Cas 1. Explore les meilleures réponses puis les équilibres de Nash.</>}
            />
            <p>
              <strong>Cas 2</strong> — les deux généraux sont défavorables au gouvernement civil,
              mais celui-ci jouit d'un fort soutien populaire, ce qui rend un coup d'état solitaire
              très risqué :
            </p>
            <PayoffMatrix
              rowPlayer="Général B"
              colPlayer="Général C"
              rows={["Loyale", "Rebelle"]}
              cols={["Loyale", "Rebelle"]}
              payoffs={[
                [
                  [1, 1],
                  [1, -2],
                ],
                [
                  [-2, 1],
                  [2, 2],
                ],
              ]}
              interactive
              caption={<>Cas 2. Explore les meilleures réponses puis les équilibres de Nash.</>}
            />
            <SubQuestion label="3.1">
              À quels types de jeux classiques chaque cas s'apparente-t-il ?
            </SubQuestion>
            <p>
              Chaque général a une fonction d'utilité <M tex="u_i(\pi_i, x) = \pi_i + \dfrac{x}{10^{7}}" />,
              où <M tex="\pi_i" /> est le payoff du joueur <M tex="i" /> dans le jeu et <M tex="x" />{" "}
              un montant en $.
            </p>
            <SubQuestion label="3.2">
              Dans le cas 1, quel est le montant minimal <M tex="M_B" /> que le général <M tex="A" />{" "}
              doit promettre au général <M tex="B" /> (s'il rejoint la rébellion) pour que Rebelle
              devienne une stratégie <strong>dominante</strong> pour <M tex="B" /> ? Quel est le
              montant <M tex="M_C" /> correspondant pour le général <M tex="C" /> ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "3.1 — Identifier « bataille des sexes » et « chasse au cerf »",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  <strong>Cas 1 = bataille des sexes.</strong> Les deux généraux veulent{" "}
                  <em>se coordonner</em> (les cases diagonales rapportent plus que les cases
                  discordantes, qui donnent 0), mais ils ne sont pas d'accord sur laquelle : le
                  général <M tex="B" /> préfère (Loyale, Loyale) — payoff <M tex="(2,1)" /> — tandis
                  que <M tex="C" /> préfère (Rebelle, Rebelle) — payoff <M tex="(1,2)" />. Deux
                  équilibres de Nash purs, un « préféré » par chaque joueur : c'est la signature de
                  la bataille des sexes.
                </p>
                <p>
                  <strong>Cas 2 = chasse au cerf.</strong> Les deux généraux préfèrent{" "}
                  <em>tous les deux</em> se coordonner sur (Rebelle, Rebelle) — payoff{" "}
                  <M tex="(2,2)" />, qui domine au sens de Pareto (Loyale, Loyale) — payoff{" "}
                  <M tex="(1,1)" />. Mais rejoindre le coup d'état est <em>risqué</em> : si l'autre
                  reste loyal, on récolte <M tex="-2" /> (la pire issue). Coordination souhaitable
                  mais risquée : c'est la chasse au cerf, avec ses deux équilibres (Loyale, Loyale)
                  « prudent » et (Rebelle, Rebelle) « payant ».
                </p>
                <Callout variant="intuition">
                  <p>
                    Les deux jeux ont deux équilibres de Nash purs, mais l'enjeu diffère : dans la
                    bataille des sexes c'est un <em>conflit de préférences</em> (qui impose son
                    équilibre favori ?) ; dans la chasse au cerf c'est un <em>problème de confiance</em>{" "}
                    (oser l'équilibre payant, au risque de se faire lâcher ?).
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 — Rendre « Rebelle » dominante pour le général B",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  On pose <M tex="m_B = M_B/10^{7}" /> et <M tex="m_C = M_C/10^{7}" />. La prime{" "}
                  <M tex="m_B" /> s'ajoute au payoff de <M tex="B" /> dans chaque case où <M tex="B" />{" "}
                  joue Rebelle ; idem <M tex="m_C" /> pour <M tex="C" />. Le cas 1 devient :
                </p>
                <SymbolicMatrix
                  rowPlayer="Général B"
                  colPlayer="Général C"
                  rows={["Loyale", "Rebelle"]}
                  cols={["Loyale", "Rebelle"]}
                  cells={[
                    [
                      ["2", "1"],
                      ["0", <M key="mc1" tex="m_C" />],
                    ],
                    [
                      [<M key="mb1" tex="m_B" />, "0"],
                      [<M key="mb2" tex="1 + m_B" />, <M key="mc2" tex="2 + m_C" />],
                    ],
                  ]}
                  caption={<>Cas 1 modifié par les primes promises par le général A.</>}
                />
                <p>
                  Rebelle est dominante pour <M tex="B" /> si elle bat Loyale quelle que soit la
                  décision de <M tex="C" /> :
                </p>
                <MB tex="U_B(\text{Rebelle}, L_C) = m_B \;\geq\; 2 = U_B(\text{Loyale}, L_C)" />
                <MB tex="U_B(\text{Rebelle}, R_C) = 1 + m_B \;\geq\; 0 = U_B(\text{Loyale}, R_C)" />
                <p>
                  La seconde condition est toujours vraie ; la contrainte contraignante est{" "}
                  <M tex="m_B \geq 2" />, c'est-à-dire
                </p>
                <MB tex="M_B \geq 2 \times 10^{7} = 20\,000\,000 \text{ \$}." />
              </>
            ),
          },
          {
            title: "3.2 (suite) — Le montant pour le général C, et la comparaison",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  Même raisonnement pour <M tex="C" /> : Rebelle (<M tex="R_C" />) est dominante si
                </p>
                <MB tex="U_C(L_B, R_C) = m_C \;\geq\; 1 = U_C(L_B, L_C)" />
                <MB tex="U_C(R_B, R_C) = 2 + m_C \;\geq\; 0 = U_C(R_B, L_C)" />
                <p>
                  La contrainte contraignante est <M tex="m_C \geq 1" />, soit
                </p>
                <MB tex="M_C \geq 1 \times 10^{7} = 10\,000\,000 \text{ \$}." />
                <Callout variant="retiens">
                  <p>
                    Le général <M tex="A" /> doit promettre <strong>deux fois plus</strong> au
                    général <M tex="B" /> (20 M$) qu'au général <M tex="C" /> (10 M$). C'est logique :{" "}
                    <M tex="B" /> est favorable au gouvernement civil, donc plus « cher » à rallier,
                    tandis que <M tex="C" /> penche déjà pour la rébellion.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1</strong> Cas 1 = bataille des sexes (coordination avec conflit de
              préférences) ; Cas 2 = chasse au cerf (coordination payante mais risquée). ·{" "}
              <strong>3.2</strong> pour rendre Rebelle dominante : <M tex="M_B \geq 20\,000\,000" /> $
              pour <M tex="B" />, <M tex="M_C \geq 10\,000\,000" /> $ pour <M tex="C" />.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> savoir « étiqueter » un jeu (dilemme du
              prisonnier, bataille des sexes, chasse au cerf…) permet d'anticiper sa structure
              d'équilibres. Et pour rendre une stratégie dominante, il faut vérifier l'inégalité
              contre <em>toutes</em> les réponses de l'adversaire : c'est la contrainte la plus
              serrée qui fixe le montant.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 4 — Stratégies mixtes des trois jeux classiques      */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex4"
        number={4}
        title="Équilibres de Nash en stratégies mixtes de trois jeux classiques"
        difficulty={2}
        refs={[
          { chapter: "b1", section: "s8" },
          { chapter: "b1", section: "s5" },
        ]}
        statement={
          <>
            <p>
              Pour chacun des trois jeux classiques suivants, trouve l'équilibre de Nash (EN) en
              stratégies <strong>mixtes</strong>. (Chaque jeu possède aussi deux équilibres purs, que
              tu peux repérer avec les matrices interactives.)
            </p>
            <SubQuestion label="4.1">
              Bataille des sexes : <M tex="p" /> est la probabilité que l'homme choisisse Viande,{" "}
              <M tex="q" /> celle que la femme choisisse Rouge.
            </SubQuestion>
            <PayoffMatrix
              rowPlayer="L'homme"
              colPlayer="La femme"
              rows={["Viande", "Poisson"]}
              cols={["Rouge", "Blanc"]}
              payoffs={[
                [
                  [4, 2],
                  [0, 0],
                ],
                [
                  [0, 0],
                  [2, 4],
                ],
              ]}
              interactive
            />
            <SubQuestion label="4.2">Chasse au cerf.</SubQuestion>
            <PayoffMatrix
              rowPlayer="Joueur 1"
              colPlayer="Joueur 2"
              rows={["Cerf", "Lièvre"]}
              cols={["Cerf", "Lièvre"]}
              payoffs={[
                [
                  [4, 4],
                  [-4, 2],
                ],
                [
                  [2, -4],
                  [2, 2],
                ],
              ]}
              interactive
            />
            <SubQuestion label="4.3">Poule mouillée (chicken).</SubQuestion>
            <PayoffMatrix
              rowPlayer="Joueur 1"
              colPlayer="Joueur 2"
              rows={["Faucon", "Colombe"]}
              cols={["Faucon", "Colombe"]}
              payoffs={[
                [
                  [-3, -3],
                  [5, 0],
                ],
                [
                  [0, 5],
                  [2, 2],
                ],
              ]}
              interactive
            />
          </>
        }
        steps={[
          {
            title: "La méthode : la propriété d'indifférence de l'adversaire",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <Callout variant="definition">
                  <p>
                    À un équilibre en stratégies mixtes, la stratégie mixte d'un joueur rend son{" "}
                    <strong>adversaire indifférent</strong> entre ses propres stratégies pures. Sinon
                    l'adversaire jouerait une pure, et il n'y aurait pas de mélange.
                  </p>
                </Callout>
                <Callout variant="attention">
                  <p>
                    Le piège classique : la probabilité de <em>mon</em> mélange se calcule à partir
                    des payoffs de <em>l'autre</em> joueur (c'est elle qui doit le rendre
                    indifférent). Ainsi <M tex="p" /> (la probabilité de l'homme) se trouve avec les
                    payoffs de la femme, et <M tex="q" /> (celle de la femme) avec les payoffs de
                    l'homme.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 — Bataille des sexes → (p*, q*) = (2/3, 1/3)",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  L'homme (payoffs = premiers nombres) est indifférent entre Viande et Poisson quand
                  la femme joue Rouge avec probabilité <M tex="q" /> :
                </p>
                <MB tex="U_{hom}(\text{Viande}, q) = U_{hom}(\text{Poisson}, q) \;\Longleftrightarrow\; 4q = 2(1 - q) \;\Longrightarrow\; q^{*} = \tfrac{1}{3}." />
                <p>
                  La femme (payoffs = seconds nombres) est indifférente entre Rouge et Blanc quand
                  l'homme joue Viande avec probabilité <M tex="p" /> :
                </p>
                <MB tex="U_{fem}(p, \text{Rouge}) = U_{fem}(p, \text{Blanc}) \;\Longleftrightarrow\; 2p = 4(1 - p) \;\Longrightarrow\; p^{*} = \tfrac{2}{3}." />
                <p>
                  L'équilibre en stratégies mixtes est <M tex="(p^{*}, q^{*}) = \left(\tfrac{2}{3}, \tfrac{1}{3}\right)" />.
                </p>
              </>
            ),
          },
          {
            title: "4.2 — Chasse au cerf → (p*, q*) = (3/4, 3/4)",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  Le jeu est symétrique. Le joueur 1 est indifférent entre Cerf et Lièvre quand le
                  joueur 2 joue Cerf avec probabilité <M tex="q" /> :
                </p>
                <MB tex="U_1(\text{Cerf}, q) = U_1(\text{Lièvre}, q) \;\Longleftrightarrow\; 4q - 4(1 - q) = 2q + 2(1 - q)" />
                <MB tex="8q - 4 = 2 \;\Longrightarrow\; q^{*} = \tfrac{3}{4}." />
                <p>
                  Par symétrie, <M tex="p^{*} = \tfrac{3}{4}" />. L'équilibre en stratégies mixtes est{" "}
                  <M tex="(p^{*}, q^{*}) = \left(\tfrac{3}{4}, \tfrac{3}{4}\right)" />.
                </p>
              </>
            ),
          },
          {
            title: "4.3 — Poule mouillée → (p*, q*) = (1/2, 1/2)",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  Symétrique là aussi. Le joueur 1 est indifférent entre Faucon et Colombe quand le
                  joueur 2 joue Faucon avec probabilité <M tex="q" /> :
                </p>
                <MB tex="U_1(\text{Faucon}, q) = U_1(\text{Colombe}, q) \;\Longleftrightarrow\; -3q + 5(1 - q) = 0 \cdot q + 2(1 - q)" />
                <MB tex="5 - 8q = 2 - 2q \;\Longrightarrow\; q^{*} = \tfrac{1}{2}." />
                <p>
                  Par symétrie, <M tex="p^{*} = \tfrac{1}{2}" />. L'équilibre en stratégies mixtes est{" "}
                  <M tex="(p^{*}, q^{*}) = \left(\tfrac{1}{2}, \tfrac{1}{2}\right)" />.
                </p>
                <Callout variant="intuition">
                  <p>
                    Dans chacun de ces jeux, l'équilibre mixte est un <em>troisième</em> équilibre,
                    en plus des deux équilibres purs. Il décrit ce que font des joueurs qui ne
                    parviennent pas à se coordonner et « jouent au hasard » de façon cohérente.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>4.1</strong> Bataille des sexes :{" "}
              <M tex="(p^{*}, q^{*}) = \left(\tfrac{2}{3}, \tfrac{1}{3}\right)" />. ·{" "}
              <strong>4.2</strong> Chasse au cerf :{" "}
              <M tex="(p^{*}, q^{*}) = \left(\tfrac{3}{4}, \tfrac{3}{4}\right)" />. ·{" "}
              <strong>4.3</strong> Poule mouillée :{" "}
              <M tex="(p^{*}, q^{*}) = \left(\tfrac{1}{2}, \tfrac{1}{2}\right)" />.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> la recette est toujours la même — poser
              l'égalité des utilités espérées des deux stratégies pures de l'adversaire, et résoudre.
              Souviens-toi que <em>ma</em> probabilité se déduit des payoffs de <em>l'autre</em>.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx4"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Dans la bataille des sexes, pourquoi la probabilité <M tex="p" /> avec laquelle l'homme
            choisit Viande se calcule-t-elle à partir des payoffs de la <em>femme</em> ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce que la stratégie mixte de l'homme doit rendre la <em>femme</em> indifférente
                entre Rouge et Blanc — sinon elle jouerait une pure et il n'y aurait pas de mélange.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : <M tex="p" /> est choisi pour équilibrer les utilités de la femme,
                d'où <M tex="2p = 4(1-p)" /> et <M tex="p^{*} = 2/3" />.
              </>
            ),
          },
          {
            text: (
              <>
                Parce qu'on calcule toujours la probabilité d'un joueur à partir de ses propres
                payoffs.
              </>
            ),
            explain: (
              <>
                C'est justement l'erreur à éviter : ma probabilité se déduit des payoffs de
                l'adversaire, pas des miens.
              </>
            ),
          },
          {
            text: <>Parce que la femme joue en premier dans ce jeu.</>,
            explain: (
              <>
                Non : le jeu est <em>simultané</em>, personne ne joue en premier. C'est la propriété
                d'indifférence qui impose ce calcul croisé.
              </>
            ),
          },
        ]}
      />

      {/* ============================================================ */}
      {/* Exercice 5 — Fraude fiscale et audit : pur, mixte, statique    */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex5"
        number={5}
        title="Fraude fiscale et contrôle : équilibres purs, mixtes et statique comparative"
        difficulty={3}
        refs={[
          { chapter: "b1", section: "s5" },
          { chapter: "b1", section: "s8" },
        ]}
        statement={
          <>
            <p>
              Considère le jeu simultané entre le fisc et un citoyen incivique. Le citoyen choisit
              d'être honnête (Payer ses impôts) ou de Frauder. Le fisc choisit de faire confiance au
              citoyen (« Trust ») ou de Contrôler son dossier. Le paramètre <M tex="c \geq 0" /> est
              le coût du contrôle et <M tex="f \geq 2" /> l'amende infligée si une fraude est
              détectée. Le premier nombre de chaque case est le payoff du citoyen (ligne), le second
              celui du fisc (colonne) :
            </p>
            <SymbolicMatrix
              rowPlayer="Citoyen"
              colPlayer="Fisc"
              rows={["Payer", "Frauder"]}
              cols={["Confiance", "Contrôle"]}
              cells={[
                [
                  ["-2", "2"],
                  ["-2", <M key="f1" tex="2 - c" />],
                ],
                [
                  ["0", "0"],
                  [<M key="f2" tex="-f" />, <M key="f3" tex="f - c" />],
                ],
              ]}
              caption={
                <>
                  Forme normale générale. On note <M tex="p" /> la probabilité que le citoyen paie et{" "}
                  <M tex="q" /> celle que le fisc fasse confiance.
                </>
              }
            />
            <SubQuestion label="5.1">
              Suppose <M tex="f = 2" /> et <M tex="c = 1" />. Trouve l'équilibre de Nash en
              stratégies pures.
            </SubQuestion>
            <SubQuestion label="5.2">
              Suppose <M tex="f = 4" /> et <M tex="c = 1" />. Trouve tous les équilibres de Nash
              (purs et mixtes). Calcule le payoff espéré à l'équilibre mixte{" "}
              <M tex="(p^{*}, q^{*})" />.
            </SubQuestion>
            <SubQuestion label="5.3">
              Toujours avec <M tex="f = 4" />, comment change l'équilibre mixte{" "}
              <M tex="(p^{*}, q^{*})" /> trouvé en 5.2 lorsque le coût passe à <M tex="c = 2" /> ?
              Calcule le nouveau payoff espéré.
            </SubQuestion>
            <SubQuestion label="5.4">
              Suppose <M tex="c = 1" />. Montre qu'à l'équilibre, la probabilité pour le citoyen de
              se faire contrôler <strong>diminue</strong> lorsque l'amende <M tex="f" /> augmente.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "5.1 — Un unique équilibre pur : (Frauder, Contrôle)",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  Avec <M tex="f = 2" /> et <M tex="c = 1" />, la matrice devient :
                </p>
                <PayoffMatrix
                  rowPlayer="Citoyen"
                  colPlayer="Fisc"
                  rows={["Payer", "Frauder"]}
                  cols={["Confiance", "Contrôle"]}
                  payoffs={[
                    [
                      [-2, 2],
                      [-2, 1],
                    ],
                    [
                      [0, 0],
                      [-2, 1],
                    ],
                  ]}
                  interactive
                  caption={<>f = 2, c = 1. Explore : l'unique équilibre de Nash pur apparaît.</>}
                />
                <p>
                  En soulignant les meilleures réponses, on trouve un{" "}
                  <strong>unique équilibre de Nash pur : (Frauder, Contrôle)</strong>.
                </p>
                <Callout variant="intuition">
                  <p>
                    Quand <M tex="f = 2" />, la sanction (2) égale exactement l'impôt dû (2). Si le
                    fisc contrôle, le citoyen est donc <em>indifférent</em> entre payer et frauder
                    (payoff <M tex="-2" /> dans les deux cas) — d'où une meilleure réponse « faible »
                    à Contrôle. Comme frauder est strictement meilleur face à Confiance, et que
                    contrôler est la meilleure réponse du fisc à un fraudeur, (Frauder, Contrôle)
                    tient.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.2 — f = 4 : aucun équilibre pur, un équilibre mixte (3/4, 1/2)",
            refs: [
              { chapter: "b1", section: "s5" },
              { chapter: "b1", section: "s8" },
            ],
            content: (
              <>
                <p>
                  Avec <M tex="f = 4" /> et <M tex="c = 1" /> :
                </p>
                <PayoffMatrix
                  rowPlayer="Citoyen"
                  colPlayer="Fisc"
                  rows={["Payer", "Frauder"]}
                  cols={["Confiance", "Contrôle"]}
                  payoffs={[
                    [
                      [-2, 2],
                      [-2, 1],
                    ],
                    [
                      [0, 0],
                      [-4, 3],
                    ],
                  ]}
                  interactive
                  caption={<>f = 4, c = 1. Explore : aucune case n'est un équilibre pur.</>}
                />
                <p>
                  Aucun profil pur n'est un équilibre (les meilleures réponses « tournent » en
                  cycle). On cherche l'équilibre mixte par la propriété d'indifférence.
                </p>
                <p>
                  <strong>Probabilité <M tex="q^{*}" /> du fisc</strong> (indifférence du citoyen) :
                </p>
                <MB tex="U_{cit}(\text{Payer}, q) = U_{cit}(\text{Frauder}, q) \;\Longleftrightarrow\; -2q - 2(1 - q) = 0 - 4(1 - q)" />
                <MB tex="-2 = -4 + 4q \;\Longrightarrow\; q^{*} = \tfrac{1}{2}." />
                <p>
                  <strong>Probabilité <M tex="p^{*}" /> du citoyen</strong> (indifférence du fisc) :
                </p>
                <MB tex="U_{fisc}(p, \text{Confiance}) = U_{fisc}(p, \text{Contrôle}) \;\Longleftrightarrow\; 2p = p + 3(1 - p)" />
                <MB tex="4p = 3 \;\Longrightarrow\; p^{*} = \tfrac{3}{4}." />
                <p>
                  L'équilibre est <M tex="(p^{*}, q^{*}) = \left(\tfrac{3}{4}, \tfrac{1}{2}\right)" />.
                </p>
                <Callout variant="methode" title="Astuce — le payoff espéré sans le calcul complet">
                  <p>
                    À l'équilibre mixte, un joueur est indifférent entre ses pures : son payoff
                    espéré égale donc celui de <em>n'importe laquelle</em> de ses pures jouée contre
                    le mélange adverse. On évite ainsi la somme sur les quatre cases :
                  </p>
                  <MB tex="U_{cit} = U_{cit}\!\left(\text{Frauder}, \tfrac{1}{2}\right) = \tfrac{1}{2}\cdot 0 + \tfrac{1}{2}\cdot(-4) = -2," />
                  <MB tex="U_{fisc} = U_{fisc}\!\left(\tfrac{3}{4}, \text{Confiance}\right) = \tfrac{3}{4}\cdot 2 + \tfrac{1}{4}\cdot 0 = \tfrac{3}{2}." />
                  <p>
                    (La somme complète sur les quatre profils, pondérée par{" "}
                    <M tex="p^{*}q^{*},\, p^{*}(1-q^{*}),\ldots" />, donne bien les mêmes valeurs.)
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.3 — Le coût monte à c = 2 : le citoyen fraude plus",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  Avec <M tex="f = 4" /> et <M tex="c = 2" /> :
                </p>
                <PayoffMatrix
                  rowPlayer="Citoyen"
                  colPlayer="Fisc"
                  rows={["Payer", "Frauder"]}
                  cols={["Confiance", "Contrôle"]}
                  payoffs={[
                    [
                      [-2, 2],
                      [-2, 0],
                    ],
                    [
                      [0, 0],
                      [-4, 2],
                    ],
                  ]}
                  interactive
                  caption={<>f = 4, c = 2. Toujours aucun équilibre pur.</>}
                />
                <p>
                  <strong>La probabilité <M tex="q^{*}" /> ne change pas.</strong> Elle vient de
                  l'indifférence du citoyen, dont les payoffs ne dépendent pas de <M tex="c" /> :
                </p>
                <MB tex="-2q - 2(1 - q) = 0 - 4(1 - q) \;\Longrightarrow\; q^{*} = \tfrac{1}{2}." />
                <p>
                  <strong>La probabilité <M tex="p^{*}" /> change</strong>, car les payoffs du fisc
                  ont bougé :
                </p>
                <MB tex="U_{fisc}(p, \text{Confiance}) = U_{fisc}(p, \text{Contrôle}) \;\Longleftrightarrow\; 2p = 2(1 - p) \;\Longrightarrow\; p^{*} = \tfrac{1}{2}." />
                <p>
                  Le nouvel équilibre est <M tex="(p^{*}, q^{*}) = \left(\tfrac{1}{2}, \tfrac{1}{2}\right)" /> :
                  <M tex="p^{*}" /> chute de <M tex="\tfrac{3}{4}" /> à <M tex="\tfrac{1}{2}" />, donc le
                  citoyen <strong>fraude plus souvent</strong>. Payoffs espérés :
                </p>
                <MB tex="U_{cit} = \tfrac{1}{2}\cdot 0 + \tfrac{1}{2}\cdot(-4) = -2, \qquad U_{fisc} = \tfrac{1}{2}\cdot 2 + \tfrac{1}{2}\cdot 0 = 1." />
                <p>
                  Le payoff du citoyen reste <M tex="-2" />, mais celui du fisc <strong>tombe</strong>{" "}
                  de <M tex="\tfrac{3}{2}" /> à <M tex="1" /> : un contrôle plus coûteux nuit au fisc,
                  pas au fraudeur.
                </p>
                <Callout variant="attention" title="Coquille dans l'énoncé officiel">
                  <p>
                    L'énoncé de la question 5.3 renvoie à « l'équilibre trouvé en 2.2 » : il faut lire{" "}
                    <strong>5.2</strong> (numérotation décalée). Le résultat, lui, est correct.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.4 — La probabilité de contrôle décroît avec l'amende f",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  Avec <M tex="c = 1" /> et une amende générale <M tex="f \geq 2" />, la case
                  (Frauder, Contrôle) vaut <M tex="(-f,\; f - 1)" />. La probabilité de contrôle est{" "}
                  <M tex="1 - q^{*}" /> : montrer qu'elle diminue revient à montrer que{" "}
                  <M tex="q^{*}" /> augmente avec <M tex="f" />.
                </p>
                <p>On calcule <M tex="q^{*}" /> par l'indifférence du citoyen :</p>
                <MB tex="U_{cit}(\text{Payer}, q) = U_{cit}(\text{Frauder}, q) \;\Longleftrightarrow\; -2q - 2(1 - q) = 0 - f(1 - q)" />
                <MB tex="-2 = -f(1 - q) \;\Longrightarrow\; q^{*} = 1 - \frac{2}{f}." />
                <p>
                  On dérive par rapport à <M tex="f" /> :
                </p>
                <MB tex="\frac{d q^{*}}{d f} = \frac{d}{df}\!\left(1 - \frac{2}{f}\right) = \frac{2}{f^{2}} > 0." />
                <p>
                  Donc <M tex="q^{*}" /> croît avec <M tex="f" />, et la probabilité de contrôle{" "}
                  <M tex="1 - q^{*} = \dfrac{2}{f}" /> <strong>décroît</strong> avec <M tex="f" />.
                  CQFD.
                </p>
                <Callout variant="intuition">
                  <p>
                    Une amende plus lourde <em>dissuade</em> davantage : le fisc peut se permettre de
                    contrôler moins souvent tout en maintenant le citoyen indifférent (donc discipliné
                    à hauteur de <M tex="p^{*}" />). C'est l'idée d'économie de la dissuasion :
                    des sanctions fortes et rares plutôt que faibles et fréquentes.
                  </p>
                </Callout>
                <FraudeExplorer />
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>5.1</strong> (f = 2, c = 1) : unique équilibre pur <strong>(Frauder, Contrôle)</strong>. ·{" "}
              <strong>5.2</strong> (f = 4, c = 1) : aucun équilibre pur, un équilibre mixte{" "}
              <M tex="(p^{*}, q^{*}) = \left(\tfrac{3}{4}, \tfrac{1}{2}\right)" />, payoffs espérés{" "}
              <M tex="U_{cit} = -2" /> et <M tex="U_{fisc} = \tfrac{3}{2}" />. · <strong>5.3</strong>{" "}
              (f = 4, c = 2) : <M tex="(p^{*}, q^{*}) = \left(\tfrac{1}{2}, \tfrac{1}{2}\right)" /> — le
              citoyen fraude plus, <M tex="U_{cit} = -2" /> (inchangé), <M tex="U_{fisc} = 1" />{" "}
              (en baisse). · <strong>5.4</strong> <M tex="q^{*} = 1 - \tfrac{2}{f}" />, donc la
              probabilité de contrôle <M tex="\tfrac{2}{f}" /> décroît quand <M tex="f" /> augmente.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> <M tex="q^{*}" /> (le mélange du fisc) dépend
              des payoffs du <em>citoyen</em>, et <M tex="p^{*}" /> (le mélange du citoyen) des
              payoffs du <em>fisc</em>. D'où deux effets propres : augmenter le coût <M tex="c" /> ne
              touche que <M tex="p^{*}" /> (plus de fraude), tandis qu'augmenter l'amende{" "}
              <M tex="f" /> fait monter <M tex="q^{*}" /> (moins de contrôle). Contre-intuitif mais
              logique une fois la mécanique d'indifférence comprise.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx5"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Entre 5.2 et 5.3, seul le coût du contrôle <M tex="c" /> augmente (de 1 à 2), l'amende{" "}
            <M tex="f = 4" /> restant fixe. Pourquoi la probabilité de contrôle <M tex="1 - q^{*}" />{" "}
            reste-t-elle inchangée alors que <M tex="p^{*}" /> baisse ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce que <M tex="q^{*}" /> est fixé par l'indifférence du <em>citoyen</em>, dont les
                payoffs ne contiennent pas <M tex="c" /> ; seul <M tex="p^{*}" />, fixé par le fisc
                (dont les payoffs contiennent <M tex="c" />), réagit.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : <M tex="c" /> n'apparaît que dans les payoffs du fisc, donc il ne déplace
                que <M tex="p^{*}" /> (le citoyen fraude plus), pas <M tex="q^{*}" />.
              </>
            ),
          },
          {
            text: (
              <>
                Parce qu'augmenter <M tex="c" /> augmente mécaniquement la probabilité de contrôle du
                fisc.
              </>
            ),
            explain: (
              <>
                Non : la probabilité de contrôle <M tex="1 - q^{*} = 1/2" /> ne bouge pas ici. Un coût
                plus élevé n'incite pas le fisc à contrôler <em>plus</em>.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que le citoyen et le fisc ont les mêmes payoffs, donc leurs probabilités
                d'équilibre sont toujours égales.
              </>
            ),
            explain: (
              <>
                Non : leurs payoffs diffèrent, et <M tex="p^{*} \neq q^{*}" /> en général (en 5.2,{" "}
                <M tex="p^{*} = 3/4" /> mais <M tex="q^{*} = 1/2" />).
              </>
            ),
          },
        ]}
        explanation={
          <>
            La clé des statiques comparatives en stratégies mixtes : repère <em>dans quels payoffs</em>{" "}
            apparaît le paramètre que tu fais varier. Il ne déplacera que la probabilité de{" "}
            <em>l'autre</em> joueur — celui que ces payoffs rendent indifférent.
          </>
        }
      />
    </TpShell>
  );
}
