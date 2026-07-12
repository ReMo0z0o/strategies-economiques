/**
 * TP · Séance 2 — L'oligopole (Économie industrielle).
 *
 * Les deux exercices officiels du chapitre EI2 :
 *  · Exercice 1 — Alice et Baptiste, bûcherons (Cournot, dynamique
 *    d'ajustement, Stackelberg, collusion) — énoncé « Chapitre 2 l'oligopole »,
 *    corrigé en 27 diapositives.
 *  · Exercice 2 — dissuasion d'entrée (monopole cm = 4 face à un entrant
 *    cm = 7/2, coût fixe F) — énoncé « Chapitre 2 l'oligopole (partie 2) »,
 *    corrigé en 15 diapositives.
 *
 * Énoncés fidèles aux PDF officiels ; résolutions pas à pas alignées sur les
 * corrigés. La coquille arithmétique du corrigé de l'exercice 2
 * (π₁ de Stackelberg : 457/32 au lieu de 225/32) est signalée sur place,
 * avec vérification que toutes les conclusions restent inchangées.
 */
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { Quiz } from "@/components/course/Quiz";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Paire de couleurs de séries validée (bleu/ambre, sûre pour daltonisme,
 * contrastée sur fond clair et sombre). */
const COL_A = "#0284c7"; // sky-600 — Alice / « bloquer »
const COL_B = "#d97706"; // amber-600 — Baptiste / « accommoder »

/* ------------------------------------------------------------------ */
/* Graphique · Ex. 1 — fonctions de réaction, convergence, équilibre   */
/* ------------------------------------------------------------------ */

function ReactionCobwebSvg() {
  const X = (v: number) => 52 + (v / 5000) * 364;
  const Y = (v: number) => 296 - (v / 5000) * 280;
  // Trajectoire (y^A_t, y^B_t) calculée à la question 4.
  const traj: Array<[number, number]> = [
    [3600, 2400],
    [3300, 2700],
    [3150, 2850],
    [3075, 2925],
    [3037.5, 2962.5],
    [3000, 3000],
  ];
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 332"
        className="w-full"
        role="img"
        aria-label="Fonctions de réaction d'Alice et de Baptiste, trajectoire des productions depuis l'année 0 et équilibre de Cournot-Nash en (3000, 3000)"
      >
        {/* Grille et graduations */}
        {[0, 1000, 2000, 3000, 4000, 5000].map((v) => (
          <g key={v}>
            <line
              x1={X(v)}
              x2={X(v)}
              y1={Y(0)}
              y2={Y(5000)}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            <line
              x1={X(0)}
              x2={X(5000)}
              y1={Y(v)}
              y2={Y(v)}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            <text
              x={X(v)}
              y={311}
              fontSize={9.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {v}
            </text>
            {v > 0 ? (
              <text
                x={47}
                y={Y(v) + 3.5}
                fontSize={9.5}
                textAnchor="end"
                fill="var(--color-muted-foreground)"
              >
                {v}
              </text>
            ) : null}
          </g>
        ))}
        <text
          x={(X(0) + X(5000)) / 2}
          y={327}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
        >
          production d'Alice yᴬ (stères)
        </text>
        <text
          x={14}
          y={156}
          fontSize={11}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          transform="rotate(-90 14 156)"
        >
          production de Baptiste yᴮ
        </text>

        {/* Réaction d'Alice : y^A = 4500 − y^B/2, soit y^B = 9000 − 2y^A */}
        <line
          x1={X(2000)}
          y1={Y(5000)}
          x2={X(4500)}
          y2={Y(0)}
          stroke={COL_A}
          strokeWidth={2.2}
        />
        <text
          x={X(2100) + 10}
          y={34}
          fontSize={11.5}
          fontWeight={700}
          fill="var(--color-foreground)"
        >
          Réaction d'Alice
        </text>

        {/* Réaction de Baptiste : y^B = 4500 − y^A/2 */}
        <line
          x1={X(0)}
          y1={Y(4500)}
          x2={X(5000)}
          y2={Y(2000)}
          stroke={COL_B}
          strokeWidth={2.2}
        />
        <text
          x={412}
          y={200}
          fontSize={11.5}
          fontWeight={700}
          textAnchor="end"
          fill="var(--color-foreground)"
        >
          Réaction de Baptiste
        </text>

        {/* Trajectoire année 0 → équilibre */}
        <polyline
          points={traj.map(([a, b]) => `${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(" ")}
          fill="none"
          stroke="var(--color-foreground)"
          strokeWidth={1.4}
          strokeDasharray="3 3"
        />
        {traj.slice(0, -1).map(([a, b], i) => (
          <circle
            key={i}
            cx={X(a)}
            cy={Y(b)}
            r={3}
            fill="var(--color-foreground)"
            stroke="var(--color-card)"
            strokeWidth={1.5}
          />
        ))}
        <text x={X(3600) + 7} y={Y(2400) + 12} fontSize={10.5} fill="var(--color-muted-foreground)">
          année 0 : (3600 ; 2400)
        </text>

        {/* Équilibre de Cournot-Nash */}
        <circle
          cx={X(3000)}
          cy={Y(3000)}
          r={5}
          fill="var(--color-foreground)"
          stroke="var(--color-card)"
          strokeWidth={2}
        />
        <text
          x={262}
          y={149}
          fontSize={11.5}
          fontWeight={700}
          textAnchor="end"
          fill="var(--color-foreground)"
        >
          Équilibre de Cournot-Nash
        </text>
        <text x={262} y={162} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
          (3000 ; 3000)
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Les deux fonctions de réaction se coupent en (3000 ; 3000). La trajectoire pointillée part
        de l'année 0 et converge vers l'équilibre en glissant le long de la droite{" "}
        <M tex="y^A + y^B = 6000" />.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Ex. 1 — profits : Cournot vs Stackelberg vs collusion   */
/* ------------------------------------------------------------------ */

function RegimeCompareSvg() {
  const Y = (v: number) => 208 - (v / 110) * 172; // v en milliers d'euros
  const groups = [
    { label: "Cournot", price: "p = 50 €", a: 90, b: 90, va: "90 000", vb: "90 000" },
    { label: "Stackelberg", price: "p = 42,5 €", a: 101.25, b: 50.625, va: "101 250", vb: "50 625" },
    { label: "Collusion", price: "p = 65 €", a: 101.25, b: 101.25, va: "101 250", vb: "101 250" },
  ];
  const cx = [108, 233, 358];
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 250"
        className="w-full"
        role="img"
        aria-label="Profits annuels d'Alice et de Baptiste sous Cournot (90 000 chacun), Stackelberg (101 250 pour Alice, 50 625 pour Baptiste) et collusion (101 250 chacun)"
      >
        {/* Légende */}
        <rect x={46} y={4} width={10} height={10} rx={2} fill={COL_A} />
        <text x={60} y={13} fontSize={11} fill="var(--color-foreground)">
          Alice
        </text>
        <rect x={104} y={4} width={10} height={10} rx={2} fill={COL_B} />
        <text x={118} y={13} fontSize={11} fill="var(--color-foreground)">
          Baptiste
        </text>
        <text x={420} y={13} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
          profit annuel (€)
        </text>

        {/* Grille */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={46}
              x2={420}
              y1={Y(v)}
              y2={Y(v)}
              stroke={v === 0 ? "var(--color-foreground)" : "var(--color-border)"}
              strokeWidth={v === 0 ? 1.2 : 1}
            />
            <text
              x={41}
              y={Y(v) + 3.5}
              fontSize={9.5}
              textAnchor="end"
              fill="var(--color-muted-foreground)"
            >
              {v === 0 ? "0" : `${v} k`}
            </text>
          </g>
        ))}

        {groups.map((g, i) => (
          <g key={g.label}>
            <rect
              x={cx[i] - 43}
              y={Y(g.a)}
              width={42}
              height={208 - Y(g.a)}
              rx={3}
              fill={COL_A}
            />
            <rect x={cx[i] + 1} y={Y(g.b)} width={42} height={208 - Y(g.b)} rx={3} fill={COL_B} />
            <text
              x={cx[i] - 22}
              y={Y(g.a) - 5}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.va}
            </text>
            <text
              x={cx[i] + 22}
              y={Y(g.b) - 5}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.vb}
            </text>
            <text
              x={cx[i]}
              y={224}
              fontSize={11.5}
              fontWeight={700}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.label}
            </text>
            <text
              x={cx[i]}
              y={238}
              fontSize={10.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {g.price}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Alice préfère jouer en premier (Stackelberg) plutôt que simultanément (Cournot), et la
        collusion bat Cournot pour les deux — mais Baptiste, lui, souffre du Stackelberg.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Ex. 2 — production limite ȳ₁(F) et régimes d'entrée     */
/* ------------------------------------------------------------------ */

function EntryLimitSvg() {
  const X = (f: number) => 46 + (f / 10) * 370;
  const Y = (v: number) => 270 - (v / 9) * 240;
  const curve = Array.from({ length: 41 }, (_, i) => {
    const f = (i * 10) / 40;
    return `${X(f).toFixed(1)},${Y(8.5 - 2 * Math.sqrt(f)).toFixed(1)}`;
  }).join(" ");
  const pts: Array<{ f: number; v: number }> = [
    { f: 0.25, v: 7.5 },
    { f: 4, v: 4.5 },
    { f: 9, v: 2.5 },
  ];
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 302"
        className="w-full"
        role="img"
        aria-label="Production limite de la firme 1 en fonction du coût fixe F de l'entrant, comparée à la production de monopole (4) et à celle du leader de Stackelberg (15/4)"
      >
        {/* Grille */}
        {[0, 2, 4, 6, 8, 10].map((f) => (
          <g key={f}>
            <line
              x1={X(f)}
              x2={X(f)}
              y1={Y(0)}
              y2={Y(9)}
              stroke="var(--color-border)"
              strokeWidth={f === 0 ? 1.4 : 1}
            />
            <text
              x={X(f)}
              y={283}
              fontSize={9.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {f}
            </text>
          </g>
        ))}
        {[0, 2, 4, 6, 8].map((v) => (
          <g key={v}>
            <line
              x1={X(0)}
              x2={X(10)}
              y1={Y(v)}
              y2={Y(v)}
              stroke="var(--color-border)"
              strokeWidth={v === 0 ? 1.4 : 1}
            />
            {v > 0 ? (
              <text
                x={41}
                y={Y(v) + 3.5}
                fontSize={9.5}
                textAnchor="end"
                fill="var(--color-muted-foreground)"
              >
                {v}
              </text>
            ) : null}
          </g>
        ))}
        <text x={231} y={298} fontSize={11} textAnchor="middle" fill="var(--color-muted-foreground)">
          coût fixe F de l'entrant
        </text>
        <text x={16} y={24} fontSize={11} fill="var(--color-muted-foreground)">
          y₁
        </text>

        {/* Repères : production de monopole et du leader de Stackelberg */}
        <line
          x1={X(0)}
          x2={X(10)}
          y1={Y(4)}
          y2={Y(4)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.3}
          strokeDasharray="6 3"
        />
        <text x={414} y={Y(4) - 5} fontSize={10.5} textAnchor="end" fill="var(--color-foreground)">
          production de monopole : 4
        </text>
        <line
          x1={X(0)}
          x2={X(10)}
          y1={Y(3.75)}
          y2={Y(3.75)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.3}
          strokeDasharray="2 3"
        />
        <text x={414} y={Y(3.75) + 13} fontSize={10.5} textAnchor="end" fill="var(--color-foreground)">
          leader de Stackelberg : 15/4
        </text>

        {/* Courbe de production limite */}
        <polyline points={curve} fill="none" stroke={COL_A} strokeWidth={2.4} />
        <text x={118} y={100} fontSize={11.5} fontWeight={700} fill="var(--color-foreground)">
          ȳ₁(F) = 17/2 − 2√F
        </text>
        <text x={118} y={113} fontSize={10.5} fill="var(--color-muted-foreground)">
          production limite qui dissuade l'entrée
        </text>

        {/* Les trois valeurs de F de l'énoncé */}
        {pts.map((p) => (
          <circle
            key={p.f}
            cx={X(p.f)}
            cy={Y(p.v)}
            r={4.5}
            fill={COL_A}
            stroke="var(--color-card)"
            strokeWidth={2}
          />
        ))}
        <text x={64} y={64} fontSize={10.5} fontWeight={700} fill="var(--color-foreground)">
          F = 1/4 : ȳ₁ = 15/2
        </text>
        <text x={64} y={77} fontSize={10} fill="var(--color-muted-foreground)">
          bloquer coûte trop cher → accommoder
        </text>
        <text x={202} y={131} fontSize={10.5} fontWeight={700} fill="var(--color-foreground)">
          F = 4 : ȳ₁ = 9/2
        </text>
        <text x={202} y={144} fontSize={10} fill="var(--color-muted-foreground)">
          dissuasion stratégique : produire 9/2
        </text>
        <text x={373} y={197} fontSize={10.5} fontWeight={700} textAnchor="end" fill="var(--color-foreground)">
          F = 9 : ȳ₁ = 5/2
        </text>
        <text x={373} y={222} fontSize={10} textAnchor="end" fill="var(--color-muted-foreground)">
          l'entrée est bloquée d'office : le monopole (4) suffit
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Plus le coût fixe <M tex="F" /> de l'entrant est élevé, plus la production limite{" "}
        <M tex="\bar y_1" /> est basse : à <M tex="F = 9" />, elle passe même sous la production de
        monopole — la firme 1 n'a plus aucun effort à faire.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Graphique · Ex. 2 — bloquer ou accommoder : profits selon F         */
/* ------------------------------------------------------------------ */

function EntryProfitsSvg() {
  const Y = (v: number) => 34 + ((12 - v) / 15) * 192; // v ∈ [−3 ; 12]
  const groups = [
    { label: "F = 1/4", verdict: "→ accommoder", block: 3.5, acc: 6.78, vb: "7/2", va: "≈ 6,8 ✓" },
    { label: "F = 4", verdict: "→ bloquer (y₁ = 9/2)", block: 11.75, acc: 3.03, vb: "47/4 ✓", va: "≈ 3,0" },
    { label: "F = 9", verdict: "→ monopole tranquille", block: 7, acc: -1.97, vb: "16 − 9 = 7 ✓", va: "≈ −2,0" },
  ];
  const cx = [108, 233, 358];
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 430 264"
        className="w-full"
        role="img"
        aria-label="Profit de la firme 1 selon qu'elle bloque l'entrée ou l'accommode, pour F égal à un quart, quatre et neuf"
      >
        {/* Légende */}
        <rect x={46} y={4} width={10} height={10} rx={2} fill={COL_A} />
        <text x={60} y={13} fontSize={11} fill="var(--color-foreground)">
          π₁ si elle bloque l'entrée
        </text>
        <rect x={196} y={4} width={10} height={10} rx={2} fill={COL_B} />
        <text x={210} y={13} fontSize={11} fill="var(--color-foreground)">
          π₁ si elle accommode (Stackelberg)
        </text>

        {/* Grille */}
        {[0, 4, 8, 12].map((v) => (
          <g key={v}>
            <line
              x1={46}
              x2={420}
              y1={Y(v)}
              y2={Y(v)}
              stroke={v === 0 ? "var(--color-foreground)" : "var(--color-border)"}
              strokeWidth={v === 0 ? 1.2 : 1}
            />
            <text
              x={41}
              y={Y(v) + 3.5}
              fontSize={9.5}
              textAnchor="end"
              fill="var(--color-muted-foreground)"
            >
              {v}
            </text>
          </g>
        ))}

        {groups.map((g, i) => (
          <g key={g.label}>
            <rect
              x={cx[i] - 43}
              y={Y(g.block)}
              width={42}
              height={Y(0) - Y(g.block)}
              rx={3}
              fill={COL_A}
            />
            {g.acc >= 0 ? (
              <rect
                x={cx[i] + 1}
                y={Y(g.acc)}
                width={42}
                height={Y(0) - Y(g.acc)}
                rx={3}
                fill={COL_B}
              />
            ) : (
              <rect
                x={cx[i] + 1}
                y={Y(0)}
                width={42}
                height={Y(g.acc) - Y(0)}
                rx={3}
                fill={COL_B}
              />
            )}
            <text
              x={cx[i] - 22}
              y={Y(g.block) - 5}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.vb}
            </text>
            <text
              x={cx[i] + 22}
              y={g.acc >= 0 ? Y(g.acc) - 5 : Y(g.acc) + 13}
              fontSize={10}
              fontWeight={600}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.va}
            </text>
            <text
              x={cx[i]}
              y={244}
              fontSize={11.5}
              fontWeight={700}
              textAnchor="middle"
              fill="var(--color-foreground)"
            >
              {g.label}
            </text>
            <text
              x={cx[i]}
              y={258}
              fontSize={10.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {g.verdict}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-[13px] text-muted-foreground">
        Pour <M tex="F = 9" />, « bloquer » ne coûte rien : la production de monopole suffit (
        <M tex="\pi_1 = 16 - 9 = 7" />), tandis qu'accommoder donnerait même un profit négatif.
        Les valeurs Stackelberg utilisent le calcul corrigé <M tex="225/32 - F" /> (voir l'étape
        3.5).
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
      sessionNumber={2}
      intro={
        <>
          <p>
            Cette séance fait travailler tout le <strong>chapitre EI2 — l'oligopole</strong> : la
            concurrence à la Cournot et ses fonctions de réaction, la collusion, l'équilibre de
            Stackelberg, puis la dissuasion d'entrée. Avant de commencer, révise en priorité les
            sections « concurrence à la Cournot », « Stackelberg » et « empêcher l'entrée d'un
            concurrent » du chapitre. Conseil de méthode valable pour <em>toutes</em> les
            questions : pose toujours la fonction de profit complète —{" "}
            <M tex="\pi = p(y)\,y - c\,y - F" /> — <em>avant</em> de dériver ; presque toutes les
            erreurs viennent d'une recette marginale improvisée de tête. Et tente chaque question
            au brouillon avant de révéler les étapes !
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — Alice et Baptiste, bûcherons                     */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex1"
        number={1}
        title="Alice et Baptiste, bûcherons du village — de Cournot à la collusion"
        difficulty={2}
        refs={[
          { chapter: "ei2", section: "cournot" },
          { chapter: "ei2", section: "stackelberg" },
          { chapter: "ei2", section: "collusion-q" },
        ]}
        statement={
          <>
            <p>
              Alice et Baptiste sont les deux seuls bûcherons actifs à proximité d'un village.
              Chaque année, ils dressent chacun leur liste de demande d'autorisation d'abattage
              d'arbres. Un garde forestier indépendant doit ensuite approuver ces deux listes
              d'arbres à abattre. Une fois sa liste approuvée, un bûcheron doit abattre les arbres
              inscrits sur sa liste et en vendre le bois de chauffage aux villageois.
            </p>
            <p>
              La fonction de demande de bois de chauffage est donnée par{" "}
              <M tex="y = 11000 - 100p" /> où <M tex="y" /> représente la quantité de bois demandée
              (mesurée en stères — en m³) et <M tex="p" /> représente le prix en euros d'un stère
              de bois. On note <M tex="y^A" /> (resp. <M tex="y^B" />) la production d'Alice (resp.
              de Baptiste). Les coûts de production et de vente d'un stère de bois s'élèvent à 20
              euros, quel que soit le nombre de stères vendus.
            </p>
            <SubQuestion label="1">
              Comment s'écrit la fonction de demande inverse qui exprime le prix du stère de bois
              en fonction des ventes réalisées par Alice et Baptiste ? Note : le prix est commun
              pour Alice et Baptiste.
            </SubQuestion>
            <SubQuestion label="2">
              Au moment où un bûcheron dresse sa liste de demande d'autorisation d'abattage, il
              connaît ce que son concurrent a vendu l'année précédente. Les deux bûcherons
              connaissent aussi la demande inverse. On suppose que chaque bûcheron pense que
              l'autre bûcheron vendra à l'année <M tex="t" /> la même quantité que celle qu'il a
              vendue l'année précédente (à l'année <M tex="t-1" />
              ). En précisant la notation à l'aide d'indices <M tex="t" /> et <M tex="t-1" />, de
              sorte que <M tex="y_t^A" /> (resp. <M tex="y_t^B" />) représente la production
              d'Alice (resp. Baptiste) à l'année <M tex="t" />, et <M tex="y_{t-1}^A" /> (resp.{" "}
              <M tex="y_{t-1}^B" />) la production d'Alice (resp. Baptiste) à l'année{" "}
              <M tex="t-1" />, écris le prix attendu par Alice (resp. Baptiste) pour l'année{" "}
              <M tex="t" />.
            </SubQuestion>
            <SubQuestion label="3">
              Supposons encore que chaque bûcheron pense que l'autre bûcheron vendra à l'année{" "}
              <M tex="t" /> la même quantité que celle qu'il a vendue l'année précédente.
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>
                  Écris la recette totale attendue par Alice (resp. Baptiste) pour l'année{" "}
                  <M tex="t" /> (en fonction de <M tex="y_t^A" /> et <M tex="y_{t-1}^B" />
                  ).
                </li>
                <li>
                  Écris la recette marginale attendue par Alice (resp. Baptiste) pour l'année{" "}
                  <M tex="t" /> (en fonction de <M tex="y_t^B" /> et <M tex="y_{t-1}^A" />
                  ).
                </li>
                <li>
                  Si Alice et Baptiste choisissent chacun les quantités qui maximisent leur profit
                  attendu à l'année <M tex="t" />, quelles sont ces quantités <M tex="y_t^A" /> et{" "}
                  <M tex="y_t^B" /> (en fonction de <M tex="y_{t-1}^A" /> et/ou{" "}
                  <M tex="y_{t-1}^B" />) ?
                </li>
              </ul>
            </SubQuestion>
            <SubQuestion label="4">
              Supposons qu'Alice ait produit 3600 stères à l'année 0 et que Baptiste en ait produit
              2400. Quelles vont être leurs productions aux années 1, 2, 3, 4 ? Tend-on vers une
              valeur particulière de la production ?
            </SubQuestion>
            <SubQuestion label="5">
              Écris un système de deux équations à deux inconnues qui permet de trouver les
              productions <M tex="y^A" /> et <M tex="y^B" /> telles que si Alice produit{" "}
              <M tex="y^A" /> et Baptiste produit <M tex="y^B" />, chacun souhaitera produire la
              même quantité à la période suivante.
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>
                  Résous ce système de deux équations à deux inconnues pour trouver les productions
                  d'Alice et de Baptiste.
                </li>
                <li>Quel est le nombre total de stères vendus sur le marché ?</li>
                <li>À quel prix sont-ils vendus ?</li>
                <li>Quels sont les profits d'Alice et de Baptiste ?</li>
              </ul>
            </SubQuestion>
            <SubQuestion label="6">
              Modifions légèrement l'énoncé pour tenir compte du fait qu'Alice a la possibilité de
              dresser sa liste de demande d'abattage d'arbres avant que Baptiste n'en ait
              l'occasion. En approuvant la liste d'Alice, le garde forestier appose un marquage
              spécifique sur tous les arbres autorisés à être abattus. Quand il dresse sa propre
              liste, Baptiste observe le marquage opéré dans le bois d'Alice et sait donc ce
              qu'Alice va abattre cette année. Baptiste ne va donc plus supposer qu'Alice vendra
              cette année le même nombre de stères que l'année dernière ; il sait combien de stères
              Alice vendra effectivement cette année et il tient compte de cette information avant
              de dresser sa liste.
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>
                  Si Alice peut vendre <M tex="y_t^A" /> stères cette année <M tex="t" />, quel est
                  le prix attendu par Baptiste pour cette année <M tex="t" /> ?
                </li>
                <li>
                  Quelles sont les recettes totales et marginales de Baptiste (à exprimer en
                  fonction de <M tex="y_t^A" /> et <M tex="y_t^B" />) ?
                </li>
                <li>
                  Quelle est la production optimale de Baptiste (à exprimer en fonction de{" "}
                  <M tex="y_t^A" />) ?
                </li>
              </ul>
            </SubQuestion>
            <SubQuestion label="7">
              Nous poursuivons avec les mêmes hypothèses qu'à la question 6. Ainsi, quand elle
              dresse sa liste de demande d'abattage d'arbres, Alice anticipe que la production de
              Baptiste cette année sera déterminée par la production qu'elle-même déterminera.
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>
                  En tenant compte de la réponse donnée à la dernière sous-question du point 6,
                  quelle sera la production totale des deux bûcherons (à exprimer en fonction de{" "}
                  <M tex="y_t^A" /> uniquement) ?
                </li>
                <li>
                  Quel sera le prix de vente attendu par Alice pour l'année <M tex="t" /> ?
                </li>
                <li>
                  Quelles sont les recettes totales et marginales d'Alice (à exprimer en fonction
                  de <M tex="y_t^A" />) ?
                </li>
                <li>
                  Quelle est sa production optimale (à exprimer en fonction de <M tex="y_t^A" />) ?
                </li>
              </ul>
            </SubQuestion>
            <SubQuestion label="8">
              Quelle est la production optimale de Baptiste ?
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>Quel est le prix d'équilibre du stère ?</li>
                <li>À combien s'élèvent les profits d'Alice et Baptiste ?</li>
              </ul>
            </SubQuestion>
            <SubQuestion label="9">
              Si elle le voulait, Alice pourrait dresser sa liste de demande d'abattage d'arbres au
              même moment que Baptiste. Ainsi, Baptiste ne pourrait plus anticiper correctement la
              quantité qu'elle va décider de produire. Est-ce dans son intérêt de procéder de la
              sorte ?
            </SubQuestion>
            <SubQuestion label="10">
              Supposons qu'Alice et Baptiste passent un accord qui fixe de façon conjointe leur
              production totale, chacun s'engageant à ne produire que la moitié de celle-ci.
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>Quelle est cette production totale qui maximise les profits joints ?</li>
                <li>Quel est le prix du stère ?</li>
                <li>Quel est le profit de chaque bûcheron ?</li>
              </ul>
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Question 1 — Inverser la demande : le prix dépend de la production TOTALE",
            refs: [{ chapter: "ei2", section: "cournot" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette question d'abord ?</strong> Dans toute la suite, Alice et
                  Baptiste choisissent des <em>quantités</em> ; c'est le marché qui fixe le prix.
                  Il faut donc exprimer <M tex="p" /> en fonction des quantités — c'est la demande{" "}
                  <em>inverse</em>, le point de départ obligé de tout exercice de Cournot.
                </p>
                <p>
                  On part de <M tex="y = 11000 - 100p" /> et on isole <M tex="p" /> :
                </p>
                <MB tex="y = 11000 - 100p \iff 100p = 11000 - y \iff p = 110 - \frac{y}{100}" />
                <p>
                  Le bois d'Alice et celui de Baptiste sont identiques et vendus au même prix : ce
                  qui compte est la quantité totale <M tex="y = y^A + y^B" />. Donc :
                </p>
                <MB tex="p = 110 - \frac{y^A + y^B}{100}" />
                <Callout variant="attention">
                  <p>
                    Erreur classique : écrire « le prix d'Alice » <M tex="p = 110 - y^A/100" /> en
                    oubliant Baptiste. Le prix dépend de la production <strong>totale</strong> mise
                    sur le marché — c'est précisément ce qui rend les deux bûcherons
                    interdépendants, et donc le problème stratégique.
                  </p>
                </Callout>
                <p>
                  <em>Mini-vérification :</em> si <M tex="y = 0" />, <M tex="p = 110" /> (prix
                  d'étranglement) ; si <M tex="y = 9000" />, <M tex="p = 20 = Cm" /> — retiens ce
                  9000, c'est la production qui annulerait toute marge.
                </p>
              </>
            ),
          },
          {
            title: "Question 2 — Les prix attendus avec des croyances « naïves »",
            refs: [{ chapter: "ei2", section: "cournot" }],
            content: (
              <>
                <p>
                  <strong>Méthode :</strong> chaque bûcheron remplace, dans la demande inverse, la
                  production de l'autre par sa <em>croyance</em> : « il fera cette année ce qu'il a
                  fait l'an dernier ». Alice connaît sa propre production <M tex="y_t^A" /> mais ne
                  peut qu'anticiper celle de Baptiste par <M tex="y_{t-1}^B" /> (et
                  symétriquement) :
                </p>
                <MB tex="p_t^A = 110 - \frac{y_t^A + y_{t-1}^B}{100} \qquad \text{et} \qquad p_t^B = 110 - \frac{y_{t-1}^A + y_t^B}{100}" />
                <Callout variant="intuition">
                  <p>
                    Remarque du corrigé : si leurs productions diffèrent, Alice et Baptiste
                    s'attendent à des prix <em>différents</em>. Or le prix effectif sera unique,
                    identique pour les deux. Au moins l'un des deux se trompe donc dans ses
                    attentes — sauf si les productions ne bougent plus d'une année à l'autre.
                    Garde cette idée en tête : elle définira l'équilibre à la question 5.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 3 — Recettes, recette marginale et productions optimales",
            refs: [
              { chapter: "ei2", section: "cournot" },
              { chapter: "ei1", section: "recette" },
            ],
            content: (
              <>
                <p>
                  <strong>Recette totale attendue</strong> : prix attendu × quantité vendue.
                  L'énoncé donne les variables d'Alice dans la première puce et celles de Baptiste
                  dans la seconde — par symétrie, on écrit tout pour les deux :
                </p>
                <MB tex="RT_t^A = \Bigl(110 - \frac{y_t^A + y_{t-1}^B}{100}\Bigr)\,y_t^A \qquad \text{et} \qquad RT_t^B = \Bigl(110 - \frac{y_{t-1}^A + y_t^B}{100}\Bigr)\,y_t^B" />
                <p>
                  <strong>Recette marginale attendue</strong> : on dérive <M tex="RT_t^A" /> par
                  rapport à <M tex="y_t^A" />, en traitant <M tex="y_{t-1}^B" /> comme une
                  constante (c'est une croyance figée, Alice ne la contrôle pas) :
                </p>
                <MB tex="Rm_t^A = 110 - \frac{2\,y_t^A + y_{t-1}^B}{100} \qquad \text{et} \qquad Rm_t^B = 110 - \frac{y_{t-1}^A + 2\,y_t^B}{100}" />
                <Callout variant="attention">
                  <p>
                    D'où vient le « 2 » devant <M tex="y_t^A" /> (et seulement devant lui) ? Quand
                    Alice vend un stère de plus, elle gagne le prix de ce stère, mais elle fait
                    aussi baisser le prix de <em>tous</em> les stères qu'elle vendait déjà. Sa
                    propre quantité compte donc « double » dans la dérivée, tandis que la quantité
                    de Baptiste, qu'elle croit figée, garde un coefficient 1. Si tu retrouves un 2
                    devant les deux quantités, tu as dérivé par rapport à la mauvaise variable.
                  </p>
                </Callout>
                <p>
                  <strong>Productions optimales</strong> : le coût marginal est constant,{" "}
                  <M tex="Cm = 20" />. Chacun pousse sa production jusqu'à <M tex="Rm = Cm" /> —
                  la condition d'optimalité vue au chapitre EI1, appliquée ici à la demande{" "}
                  <em>perçue</em>. Pour Alice, ligne par ligne :
                </p>
                <MB tex="110 - \frac{2\,y_t^A + y_{t-1}^B}{100} = 20 \iff 11000 - 2\,y_t^A - y_{t-1}^B = 2000 \iff 9000 - 2\,y_t^A - y_{t-1}^B = 0" />
                <MB tex="\iff\; y_t^A = 4500 - \tfrac{1}{2}\,y_{t-1}^B" />
                <p>Et par le calcul symétrique pour Baptiste :</p>
                <MB tex="y_t^B = 4500 - \tfrac{1}{2}\,y_{t-1}^A" />
                <p>
                  <em>Mini-vérification :</em> si Baptiste n'avait rien produit l'an dernier (
                  <M tex="y_{t-1}^B = 0" />
                  ), Alice produirait 4500 stères — exactement la production d'un{" "}
                  <strong>monopole</strong> (<M tex="110 - y/50 = 20 \iff y = 4500" />
                  ). Cohérent : seule sur le marché perçu, elle se comporte en monopole.
                </p>
              </>
            ),
          },
          {
            title: "Question 4 — La dynamique : les productions convergent vers 3000",
            refs: [{ chapter: "ei2", section: "exemple-cournot" }],
            content: (
              <>
                <p>
                  <strong>Méthode :</strong> on applique mécaniquement les deux règles de la
                  question 3, année après année, en partant de <M tex="y_0^A = 3600" /> et{" "}
                  <M tex="y_0^B = 2400" /> :
                </p>
                <MB tex="y_1^A = 4500 - \frac{2400}{2} = 3300 \qquad \text{et} \qquad y_1^B = 4500 - \frac{3600}{2} = 2700" />
                <MB tex="y_2^A = 4500 - \frac{2700}{2} = 3150 \qquad \text{et} \qquad y_2^B = 4500 - \frac{3300}{2} = 2850" />
                <MB tex="y_3^A = 4500 - \frac{2850}{2} = 3075 \qquad \text{et} \qquad y_3^B = 4500 - \frac{3150}{2} = 2925" />
                <MB tex="y_4^A = 4500 - \frac{2925}{2} = 3037{,}5 \qquad \text{et} \qquad y_4^B = 4500 - \frac{3075}{2} = 2962{,}5" />
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Année</th>
                        <th className={THc}>
                          <M tex="y^A" />
                        </th>
                        <th className={THc}>
                          <M tex="y^B" />
                        </th>
                        <th className={THc}>Écart à 3000</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["0", "3600", "2400", "± 600"],
                        ["1", "3300", "2700", "± 300"],
                        ["2", "3150", "2850", "± 150"],
                        ["3", "3075", "2925", "± 75"],
                        ["4", "3037,5", "2962,5", "± 37,5"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>{row[1]}</td>
                          <td className={TDc}>{row[2]}</td>
                          <td className={TDc}>{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  On semble tendre vers des productions de <strong>3000 stères par bûcheron</strong>.
                </p>
                <p>
                  <em>Mini-vérification :</em> l'écart à 3000 est <strong>divisé par deux</strong>{" "}
                  chaque année (600 → 300 → 150 → 75 → 37,5) : c'est le coefficient{" "}
                  <M tex="\tfrac{1}{2}" /> des fonctions de réaction qui agit. La convergence est
                  donc certaine, quel que soit le point de départ.
                </p>
              </>
            ),
          },
          {
            title: "Question 5 — Le point fixe : l'équilibre de Cournot-Nash",
            refs: [
              { chapter: "ei2", section: "exemple-cournot" },
              { chapter: "b1", course: "strategies", section: "s5" },
            ],
            content: (
              <>
                <p>
                  <strong>L'idée :</strong> on cherche des productions qui, une fois atteintes, ne
                  bougent plus — chacun, en réagissant de façon optimale à l'autre, veut refaire
                  exactement pareil. Il suffit d'enlever les indices de temps dans les règles de la
                  question 3 :
                </p>
                <MB tex="\begin{cases} y^A = 4500 - \tfrac{1}{2}\,y^B \\[4pt] y^B = 4500 - \tfrac{1}{2}\,y^A \end{cases}" />
                <p>
                  <strong>Résolution</strong> — on substitue la seconde équation dans la première :
                </p>
                <MB tex="2\,y^A = 9000 - \Bigl(4500 - \tfrac{1}{2}\,y^A\Bigr) \iff \tfrac{3}{2}\,y^A = 4500 \iff y^A = 3000" />
                <MB tex="\text{et de même} \quad \tfrac{3}{2}\,y^B = 4500 \iff y^B = 3000" />
                <p>
                  <strong>Production totale, prix, profits</strong> :
                </p>
                <MB tex="y = y^A + y^B = 6000 \qquad ; \qquad p = 110 - \frac{6000}{100} = 50" />
                <MB tex="\pi^A = \pi^B = 50 \times 3000 - 20 \times 3000 = 90\,000 \text{ euros}" />
                <ReactionCobwebSvg />
                <Callout variant="retiens">
                  <p>
                    Nous venons de calculer l'<strong>équilibre de Cournot-Nash</strong>. « Point
                    fixe de la dynamique » et « intersection des fonctions de réaction » désignent
                    la même chose : un profil où chacun joue sa meilleure réponse à l'autre —
                    c'est-à-dire un équilibre de Nash du jeu en quantités. Personne n'a intérêt à
                    dévier seul.
                  </p>
                </Callout>
                <p>
                  <em>Mini-vérification :</em> à (3000 ; 3000), chacun est bien sur sa fonction de
                  réaction : <M tex="4500 - \tfrac{3000}{2} = 3000" /> ✓. Et la question 4
                  convergeait précisément vers ce point.
                </p>
              </>
            ),
          },
          {
            title: "Question 6 — Baptiste observe Alice : la fonction de réaction du suiveur",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  Changement d'information : Baptiste <em>voit</em> le marquage des arbres d'Alice.
                  Il ne forme plus de croyance sur le passé, il réagit à la production{" "}
                  <strong>effective</strong> <M tex="y_t^A" /> de cette année. Son prix attendu :
                </p>
                <MB tex="p_t^B = 110 - \frac{y_t^A + y_t^B}{100}" />
                <p>Ses recettes totale et marginale (même mécanique qu'à la question 3) :</p>
                <MB tex="RT_t^B = \Bigl(110 - \frac{y_t^A + y_t^B}{100}\Bigr)\,y_t^B \qquad \text{et} \qquad Rm_t^B = 110 - \frac{y_t^A + 2\,y_t^B}{100}" />
                <p>
                  Sa production optimale, via <M tex="Rm_t^B = Cm = 20" /> :
                </p>
                <MB tex="110 - \frac{y_t^A + 2\,y_t^B}{100} = 20 \iff 9000 - y_t^A - 2\,y_t^B = 0 \iff y_t^B = 4500 - \tfrac{1}{2}\,y_t^A" />
                <Callout variant="attention">
                  <p>
                    La formule est <em>identique</em> à celle de la question 3, mais son sens a
                    changé : <M tex="y_{t-1}^A" /> (une croyance sur le passé) est devenu{" "}
                    <M tex="y_t^A" /> (une quantité observée aujourd'hui). C'est désormais une
                    vraie <strong>fonction de réaction du suiveur</strong> — et Alice va pouvoir
                    l'exploiter.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 7 — Alice internalise la réaction de Baptiste",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  <strong>Production totale.</strong> Alice sait que Baptiste répondra{" "}
                  <M tex="y_t^B = 4500 - \tfrac{1}{2}y_t^A" />. La production totale ne dépend donc
                  plus que de son propre choix :
                </p>
                <MB tex="y_t = y_t^A + y_t^B = y_t^A + 4500 - \tfrac{1}{2}\,y_t^A = \tfrac{1}{2}\,y_t^A + 4500" />
                <Callout variant="intuition">
                  <p>
                    C'est la remarque-clé du corrigé : quand Alice augmente sa production d'un
                    stère, elle incite Baptiste à en produire <strong>1/2 en moins</strong>. La
                    production totale ne monte donc que d'un demi-stère — le prix baisse{" "}
                    <em>deux fois moins vite</em> pour Alice que si Baptiste était figé. Vendre
                    beaucoup est devenu moins coûteux pour elle : voilà l'avantage du leader.
                  </p>
                </Callout>
                <p>
                  <strong>Prix attendu par Alice.</strong> On remplace dans la demande inverse :
                </p>
                <MB tex="p_t = 110 - \frac{y_t}{100} = 110 - \frac{1}{200}\,y_t^A - 45 = 65 - \frac{1}{200}\,y_t^A" />
                <p>
                  <strong>Recettes totale et marginale d'Alice.</strong>
                </p>
                <MB tex="RT_t^A = \Bigl(65 - \frac{1}{200}\,y_t^A\Bigr)\,y_t^A \qquad \text{et} \qquad Rm_t^A = 65 - \frac{1}{100}\,y_t^A" />
                <p>
                  <strong>Production optimale</strong>, via <M tex="Rm_t^A = Cm = 20" /> :
                </p>
                <MB tex="65 - \frac{1}{100}\,y_t^A = 20 \iff 6500 - y_t^A - 2000 = 0 \iff y_t^A = 4500" />
                <p>
                  <em>Mini-vérification :</em> la pente de la recette marginale d'Alice est passée
                  de <M tex="2/100" /> (question 3) à <M tex="1/100" /> : c'est exactement l'effet
                  « Baptiste absorbe la moitié de mes hausses ». Une demande perçue moins pentue
                  pousse à produire plus (4500 contre 3000).
                </p>
              </>
            ),
          },
          {
            title: "Question 8 — L'équilibre de Stackelberg : quantités, prix, profits",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  <strong>Production de Baptiste</strong> — on injecte <M tex="y_t^A = 4500" />{" "}
                  dans sa fonction de réaction :
                </p>
                <MB tex="y_t^B = 4500 - \tfrac{1}{2} \times 4500 = 2250" />
                <p>
                  <strong>Prix d'équilibre</strong> :
                </p>
                <MB tex="p_t = 110 - \frac{4500 + 2250}{100} = 110 - 67{,}5 = 42{,}5 \text{ euros}" />
                <p>
                  <strong>Profits</strong> (marge de <M tex="42{,}5 - 20 = 22{,}5" /> euros par
                  stère) :
                </p>
                <MB tex="\pi^A = 42{,}5 \times 4500 - 20 \times 4500 = 101\,250 \text{ euros}" />
                <MB tex="\pi^B = 42{,}5 \times 2250 - 20 \times 2250 = 50\,625 \text{ euros}" />
                <Callout variant="retiens">
                  <p>
                    Nous venons de calculer l'<strong>équilibre de Stackelberg</strong> : le leader
                    (Alice) produit 4500, le suiveur (Baptiste) 2250. Compare avec Cournot : la
                    production totale monte (6750 contre 6000), le prix baisse (42,5 contre 50), et
                    le profit se déplace du suiveur vers le leader.
                  </p>
                </Callout>
                <p>
                  <em>Mini-vérification :</em> <M tex="\pi^A = 2\,\pi^B" /> — logique, Alice vend
                  deux fois plus que Baptiste à la même marge unitaire.
                </p>
              </>
            ),
          },
          {
            title: "Question 9 — Alice a-t-elle intérêt à redevenir « simultanée » ?",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  <strong>Manifestement non.</strong> Il suffit de comparer ses profits dans les
                  deux configurations :
                </p>
                <MB tex="\underbrace{101\,250}_{\text{elle joue en premier (Stackelberg)}} \; > \; \underbrace{90\,000}_{\text{décisions simultanées (Cournot)}}" />
                <p>
                  En jouant en premier, Alice influence à son avantage le comportement de Baptiste :
                  avant qu'il ne prenne sa décision, elle lui <em>montre</em> qu'elle va produire
                  beaucoup, ce qui l'incite à limiter sa production pour éviter d'obtenir un prix
                  trop faible. C'est l'<strong>avantage au premier coup</strong> (first-mover
                  advantage).
                </p>
                <Callout variant="attention">
                  <p>
                    L'avantage ne vient pas de « décider avant » dans l'absolu, mais du fait que la
                    décision d'Alice est <strong>observable et irréversible</strong> (le marquage
                    des arbres l'engage). Une simple annonce non contraignante ne changerait rien :
                    Baptiste n'y croirait pas, et on retomberait sur Cournot. Note aussi que
                    Baptiste, lui, perd à la séquentialité (50 625 contre 90 000) : être informé
                    n'est pas toujours un avantage en stratégie.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 10 — La collusion : produire comme un monopole et partager",
            refs: [
              { chapter: "ei2", section: "collusion-q" },
              { chapter: "ei1", section: "maximisation" },
            ],
            content: (
              <>
                <p>
                  <strong>Méthode :</strong> l'accord fixe la production totale <M tex="y" /> pour
                  maximiser le profit <em>joint</em> — les deux bûcherons se comportent comme les
                  deux divisions d'un même monopole :
                </p>
                <MB tex="\pi = p\,y - 20\,y = \Bigl(110 - \frac{y}{100}\Bigr)y - 20\,y" />
                <p>
                  Cette expression est maximisée quand la recette marginale jointe égale le coût
                  marginal (c'est le <M tex="Rm = Cm" /> du monopole joint) :
                </p>
                <MB tex="110 - \frac{y}{50} = 20 \iff y = 4500" />
                <p>
                  Chaque bûcheron en produit la moitié : <M tex="y^A = y^B = 2250" />. Le prix et
                  les profits :
                </p>
                <MB tex="p = 110 - \frac{4500}{100} = 65 \text{ euros}" />
                <MB tex="\pi^A = \pi^B = 65 \times 2250 - 20 \times 2250 = 101\,250 \text{ euros}" />
                <p>
                  soit un profit plus élevé que lorsqu'ils décident simultanément sans se
                  coordonner (90 000). Nous venons d'analyser la <strong>collusion</strong>.
                </p>
                <RegimeCompareSvg />
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Régime</th>
                        <th className={THc}>
                          <M tex="y^A" />
                        </th>
                        <th className={THc}>
                          <M tex="y^B" />
                        </th>
                        <th className={THc}>
                          <M tex="y" />
                        </th>
                        <th className={THc}>
                          <M tex="p" />
                        </th>
                        <th className={THc}>
                          <M tex="\pi^A" />
                        </th>
                        <th className={THc}>
                          <M tex="\pi^B" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Cournot (q. 5)", "3000", "3000", "6000", "50", "90 000", "90 000"],
                        ["Stackelberg (q. 8)", "4500", "2250", "6750", "42,5", "101 250", "50 625"],
                        ["Collusion (q. 10)", "2250", "2250", "4500", "65", "101 250", "101 250"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>{row[1]}</td>
                          <td className={TDc}>{row[2]}</td>
                          <td className={TDc}>{row[3]}</td>
                          <td className={TDc}>{row[4]}</td>
                          <td className={TDc}>{row[5]}</td>
                          <td className={TDc}>{row[6]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Callout variant="attention">
                  <p>
                    La collusion est <strong>instable</strong> : si Baptiste respecte l'accord et
                    produit 2250, la meilleure réponse d'Alice n'est pas 2250 mais{" "}
                    <M tex="4500 - \tfrac{2250}{2} = 3375" /> stères. Chacun a intérêt à tricher —
                    c'est exactement la « tentation de dévier » étudiée dans la section sur la
                    collusion en quantités. L'accord ne tient que s'il peut être surveillé et puni.
                  </p>
                </Callout>
                <p>
                  <em>Mini-vérification :</em> 4500 est la production de <strong>monopole</strong>{" "}
                  (déjà croisée aux questions 3 et 7), et le profit joint{" "}
                  <M tex="202\,500 = 45 \times 4500" /> est le maximum atteignable sur ce marché.
                  Remarque élégante : le profit de leader de Stackelberg (101 250) vaut exactement
                  la moitié du profit de monopole — ce n'est pas un hasard avec une demande
                  linéaire et des coûts marginaux constants identiques.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>Q1</strong> <M tex="p = 110 - (y^A+y^B)/100" /> · <strong>Q2</strong>{" "}
              <M tex="p_t^A = 110 - (y_t^A + y_{t-1}^B)/100" /> (sym. pour B) · <strong>Q3</strong>{" "}
              <M tex="y_t^A = 4500 - \tfrac{1}{2}y_{t-1}^B" /> et{" "}
              <M tex="y_t^B = 4500 - \tfrac{1}{2}y_{t-1}^A" /> · <strong>Q4</strong> (3300 ; 2700),
              (3150 ; 2850), (3075 ; 2925), (3037,5 ; 2962,5) → convergence vers 3000 ·{" "}
              <strong>Q5</strong> Cournot-Nash : 3000 chacun, <M tex="y = 6000" />,{" "}
              <M tex="p = 50" />, profits 90 000 chacun · <strong>Q6</strong>{" "}
              <M tex="y_t^B = 4500 - \tfrac{1}{2}y_t^A" /> · <strong>Q7–Q8</strong> Stackelberg :
              Alice 4500, Baptiste 2250, <M tex="p = 42{,}5" />, profits 101 250 et 50 625 ·{" "}
              <strong>Q9</strong> non : 101 250 &gt; 90 000 · <strong>Q10</strong> collusion :{" "}
              <M tex="y = 4500" />, 2250 chacun, <M tex="p = 65" />, 101 250 chacun.
            </p>
            <p>
              <strong>Transfert de méthode :</strong> quel que soit l'habillage (bûcherons,
              compagnies aériennes, OPEP…), la recette est la même. (1) Écris la demande inverse
              avec la production <em>totale</em>. (2) Pose le profit de chaque firme et dérive par
              rapport à <em>sa</em> quantité : <M tex="Rm = Cm" /> donne les fonctions de réaction.
              (3) Cournot = intersection des réactions (résous le système). (4) Stackelberg =
              substitue la réaction du suiveur dans le profit du leader <em>avant</em> de dériver.
              (5) Collusion = maximise le profit joint (un seul <M tex="Rm = Cm" /> de monopole),
              puis vérifie la tentation de dévier avec les fonctions de réaction.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx1"
        kicker="Pour vérifier que tu maîtrises la recette marginale"
        question={
          <>
            Dans la recette marginale attendue d'Alice,{" "}
            <M tex="Rm_t^A = 110 - \tfrac{2y_t^A + y_{t-1}^B}{100}" />, pourquoi y a-t-il un
            coefficient 2 devant <M tex="y_t^A" /> mais pas devant <M tex="y_{t-1}^B" /> ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce qu'en vendant un stère de plus, Alice encaisse le prix de ce stère{" "}
                <em>mais</em> fait aussi baisser le prix de toutes ses unités déjà vendues — alors
                que la quantité de Baptiste, traitée comme donnée, n'est pas un levier de son
                choix.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : en dérivant <M tex="(110 - \tfrac{y_t^A + y_{t-1}^B}{100})y_t^A" />{" "}
                par rapport à <M tex="y_t^A" />, le terme en <M tex="(y_t^A)^2" /> produit le 2 ;{" "}
                <M tex="y_{t-1}^B" /> est une constante dans ce calcul.
              </>
            ),
          },
          {
            text: <>Parce qu'Alice a un coût marginal deux fois plus élevé que Baptiste.</>,
            explain: (
              <>
                Non : les coûts sont identiques (20 €/stère) et le coût n'apparaît de toute façon
                pas dans la recette marginale — il intervient après, dans <M tex="Rm = Cm" />.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que Baptiste réagira dans l'année à la hausse de production d'Alice, ce qui
                double son effet sur le prix.
              </>
            ),
            explain: (
              <>
                C'est l'inverse ! Dans le cadre de Cournot, chacun croit l'autre <em>figé</em>. La
                réaction du rival dans l'année, c'est le monde de Stackelberg (questions 6-8) — et
                elle donne un coefficient <M tex="1/100" />, pas <M tex="2/100" />.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Le « 2 » traduit la double peine du vendeur en demande décroissante : plus de volume,
            mais un prix plus bas sur tout le volume. C'est le même mécanisme que{" "}
            <M tex="Rm < p" /> pour le monopole du chapitre EI1.
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx2"
        kicker="Cournot ou Stackelberg : la différence de méthode"
        question={
          <>
            Quelle est LA différence de calcul entre l'équilibre de Cournot (question 5) et
            l'équilibre de Stackelberg (questions 7-8) ?
          </>
        }
        options={[
          {
            text: (
              <>
                En Stackelberg, le leader <strong>substitue la fonction de réaction du suiveur</strong>{" "}
                dans son profit avant de dériver, au lieu de traiter la quantité rivale comme une
                constante.
              </>
            ),
            correct: true,
            explain: (
              <>
                C'est tout le secret : Alice remplace <M tex="y_t^B" /> par{" "}
                <M tex="4500 - \tfrac{1}{2}y_t^A" /> dans son profit, ce qui aplatit sa recette
                marginale (pente 1/100 au lieu de 2/100) et la pousse à produire 4500 au lieu de
                3000.
              </>
            ),
          },
          {
            text: (
              <>
                En Stackelberg, on maximise le profit joint des deux firmes au lieu des profits
                individuels.
              </>
            ),
            explain: (
              <>
                Non, ça c'est la <strong>collusion</strong> (question 10). En Stackelberg, chacun
                maximise son propre profit — seul l'ordre des coups change.
              </>
            ),
          },
          {
            text: (
              <>
                En Stackelberg, le suiveur utilise une autre fonction de réaction que celle de
                Cournot.
              </>
            ),
            explain: (
              <>
                Non : la réaction du suiveur est algébriquement identique (
                <M tex="y^B = 4500 - \tfrac{1}{2}y^A" />
                ). Ce qui change, c'est que le leader la connaît et l'<em>exploite</em>.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Réflexe d'examen : « qui sait quoi au moment de choisir ? ». Choix simultanés → résous
            le système des réactions. Choix séquentiels observables → remonte l'arbre : d'abord la
            réaction du suiveur, puis le programme du leader avec cette réaction injectée.
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 2 — Dissuasion d'entrée                              */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp2"
        id="ex2"
        number={2}
        title="Dissuader l'entrée d'un concurrent plus efficace"
        difficulty={3}
        refs={[
          { chapter: "ei2", section: "entree" },
          { chapter: "ei2", section: "cournot" },
          { chapter: "ei1", section: "maximisation" },
        ]}
        statement={
          <>
            <p>
              Soit un marché caractérisé par la demande inverse suivante : <M tex="p = 12 - y_T" />{" "}
              où <M tex="y_T" /> représente la production mise en vente sur ce marché et{" "}
              <M tex="p" /> est le prix de vente. Depuis longtemps la firme 1 bénéficie d'un
              monopole sur ce marché. Son coût marginal est égal à 4 et son coût fixe est noté{" "}
              <M tex="F" />.
            </p>
            <p className="font-semibold">1. Le monopole</p>
            <SubQuestion label="1.1">
              Quelle est la production qui maximise le profit du monopole ?
            </SubQuestion>
            <SubQuestion label="1.2">À quel prix le monopole vend-il sa production ?</SubQuestion>
            <SubQuestion label="1.3">Quel est le profit du monopole ?</SubQuestion>
            <p>
              La firme 1 est inquiète car un concurrent potentiel (la firme 2) vient d'annoncer
              avoir découvert une nouvelle technique qui lui permettrait de produire le même bien
              pour un coût marginal inférieur, égal à <M tex="7/2" />. Le coût fixe de cet entrant
              potentiel est aussi égal à <M tex="F" />. Suppose que la firme 2 entre effectivement
              sur ce marché et qu'elle mène une concurrence à la Cournot avec la firme 1. Les
              productions des deux firmes sont notées <M tex="y_1" /> et <M tex="y_2" />.
            </p>
            <p className="font-semibold">2. La concurrence à la Cournot</p>
            <SubQuestion label="2.1">
              Quelle est la production qui maximise le profit de chaque firme ?
            </SubQuestion>
            <SubQuestion label="2.2">Quel est le prix de vente ?</SubQuestion>
            <SubQuestion label="2.3">Quel est le profit de chaque firme ?</SubQuestion>
            <p className="font-semibold">
              3. Suppose que la firme 2 entre effectivement sur ce marché mais que la firme
              historique (firme 1) a l'avantage de définir sa production en premier (équilibre de
              Stackelberg).
            </p>
            <SubQuestion label="3.1">
              Comment la firme 2 va-t-elle déterminer sa production en fonction de la production
              mise en vente par la firme 1 ?
            </SubQuestion>
            <SubQuestion label="3.2">
              Quelle production la firme 1 va-t-elle mettre en vente ?
            </SubQuestion>
            <SubQuestion label="3.3">Quelle sera la production de la firme 2 ?</SubQuestion>
            <SubQuestion label="3.4">Quel sera le prix de vente ?</SubQuestion>
            <SubQuestion label="3.5">Que seront les profits des deux firmes ?</SubQuestion>
            <p className="font-semibold">
              4. Suppose que la firme historique décide de déterminer sa production de façon à
              amener le profit de la firme 2 à zéro et à ainsi l'inciter à ne pas entrer sur ce
              marché.
            </p>
            <SubQuestion label="4.1">
              Si elle entrait quand même, comment la firme 2 déterminerait-elle sa production en
              fonction de la production mise en vente par la firme 1 ?
            </SubQuestion>
            <SubQuestion label="4.2">
              Quel serait le profit de la firme 2 (à exprimer en fonction de la production de la
              firme 1) ?
            </SubQuestion>
            <SubQuestion label="4.3">
              Pour quelle valeur de <M tex="y_1" /> la firme 2 déciderait-elle effectivement de ne
              pas entrer ?
            </SubQuestion>
            <SubQuestion label="4.4">
              Considère successivement les coûts fixes suivants : <M tex="F = 1/4" />,{" "}
              <M tex="F = 4" /> et <M tex="F = 9" />.
              <ul className="my-2 ml-5 list-disc space-y-1">
                <li>
                  Pour laquelle des trois valeurs de <M tex="F" /> la firme 1 bloquerait-elle
                  l'entrée sans avoir à produire autant qu'à l'équilibre de Stackelberg ? Combien
                  produirait-elle ?
                </li>
                <li>
                  Pour laquelle des deux autres valeurs de <M tex="F" /> la firme 1 a-t-elle
                  intérêt à bloquer l'entrée ?
                </li>
                <li>
                  Pourquoi la firme 1 n'a-t-elle pas intérêt à bloquer l'entrée dans le dernier
                  cas ?
                </li>
              </ul>
            </SubQuestion>
            <SubQuestion label="5">
              Considère <M tex="F = 4" />. En justifiant ta réponse, classe les quatre situations
              suivantes de la plus désirable pour les consommateurs à la moins désirable :
              monopole, Cournot, Stackelberg, entrée bloquée.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "1.1 — La production du monopole : Rm = Cm",
            refs: [
              { chapter: "ei1", section: "maximisation" },
              { chapter: "ei1", section: "exemple-analytique" },
            ],
            content: (
              <>
                <p>
                  <strong>Méthode :</strong> avant toute dérivée, pose le profit complet du
                  monopole — c'est le réflexe qui t'évitera 90 % des erreurs de la séance :
                </p>
                <MB tex="\pi_T = (12 - y_T)\,y_T - 4\,y_T - F" />
                <p>La recette totale et la recette marginale s'en déduisent :</p>
                <MB tex="RT = (12 - y_T)\,y_T \qquad \Rightarrow \qquad Rm = 12 - 2\,y_T" />
                <p>
                  Le coût marginal vaut 4. La recette marginale égale le coût marginal si :
                </p>
                <MB tex="12 - 2\,y_T = 4 \iff 2\,y_T = 8 \iff y_T = 4" />
                <p>
                  <em>Mini-vérification :</em> avec une demande linéaire, la <M tex="Rm" /> a la
                  même ordonnée à l'origine (12) et une pente <strong>double</strong> (2 au lieu
                  de 1). Si ta <M tex="Rm" /> n'a pas cette forme, la dérivée est fausse.
                </p>
              </>
            ),
          },
          {
            title: "1.2 — Le prix de monopole",
            refs: [{ chapter: "ei1", section: "exemple-analytique" }],
            content: (
              <>
                <p>
                  On remonte simplement la demande inverse au niveau de production choisi — c'est
                  la demande qui fixe le prix, jamais la firme directement :
                </p>
                <MB tex="p = 12 - y_T = 12 - 4 = 8" />
              </>
            ),
          },
          {
            title: "1.3 — Le profit de monopole : ne pas oublier F",
            refs: [{ chapter: "ei1", section: "maximisation" }],
            content: (
              <>
                <MB tex="\pi_T = p\,y_T - 4\,y_T - F = 8 \times 4 - 4 \times 4 - F = 16 - F" />
                <Callout variant="attention">
                  <p>
                    Le coût fixe <M tex="F" /> ne modifie <em>pas</em> la production optimale (il
                    disparaît dans la dérivée), mais il ampute le profit. Retiens bien ce{" "}
                    <M tex="16 - F" /> : dans la partie 4, c'est <M tex="F" /> — et lui seul — qui
                    décidera si l'entrée peut être bloquée facilement ou non.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 — Cournot : deux CPO, deux fonctions de réaction, un système",
            refs: [
              { chapter: "ei2", section: "cournot" },
              { chapter: "ei2", section: "exemple-cournot" },
            ],
            content: (
              <>
                <p>
                  <strong>Attention, les coûts diffèrent maintenant</strong> : 4 pour la firme 1,{" "}
                  <M tex="7/2" /> pour la firme 2. On pose les deux profits :
                </p>
                <MB tex="\pi_1 = (12 - y_1 - y_2)\,y_1 - 4\,y_1 - F \qquad ; \qquad \pi_2 = (12 - y_1 - y_2)\,y_2 - \tfrac{7}{2}\,y_2 - F" />
                <p>
                  Condition de premier ordre de la firme 1 (dérivée par rapport à <M tex="y_1" />,{" "}
                  <M tex="y_2" /> traité comme donné) :
                </p>
                <MB tex="12 - 2\,y_1 - y_2 - 4 = 0 \iff 8 - 2\,y_1 - y_2 = 0 \iff y_1 = 4 - \tfrac{1}{2}\,y_2" />
                <p>Condition de premier ordre de la firme 2 :</p>
                <MB tex="12 - y_1 - 2\,y_2 - \tfrac{7}{2} = 0 \iff \tfrac{17}{2} - y_1 - 2\,y_2 = 0 \iff y_2 = \tfrac{17}{4} - \tfrac{1}{2}\,y_1" />
                <p>On résout le système en substituant la seconde réaction dans la première :</p>
                <MB tex="y_1 = 4 - \tfrac{1}{2}\Bigl(\tfrac{17}{4} - \tfrac{1}{2}\,y_1\Bigr) = 4 - \tfrac{17}{8} + \tfrac{1}{4}\,y_1 \iff \tfrac{3}{4}\,y_1 = \tfrac{15}{8} \iff y_1 = \tfrac{5}{2}" />
                <MB tex="y_2 = \tfrac{17}{4} - \tfrac{1}{2}\times\tfrac{5}{2} = \tfrac{17}{4} - \tfrac{5}{4} = 3 \qquad \text{et} \qquad y_{Tot} = \tfrac{5}{2} + 3 = \tfrac{11}{2}" />
                <Callout variant="attention">
                  <p>
                    Deux pièges ici. (1) N'oublie pas de soustraire le coût marginal{" "}
                    <em>de la bonne firme</em> dans chaque CPO (<M tex="-4" /> pour l'une,{" "}
                    <M tex="-7/2" /> pour l'autre) : les fonctions de réaction ne sont plus
                    symétriques. (2) Vérifie le sens du résultat : la firme 2, plus efficace (coût
                    7/2 contre 4), produit <em>plus</em> (3 contre 5/2). Si tu trouves l'inverse,
                    tu as interverti les coûts.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.2 — Le prix de vente sous Cournot",
            refs: [{ chapter: "ei2", section: "exemple-cournot" }],
            content: (
              <>
                <MB tex="p = 12 - y_{Tot} = 12 - \tfrac{11}{2} = \tfrac{13}{2} = 6{,}5" />
                <p>
                  <em>Mini-vérification :</em> le prix est au-dessus des deux coûts marginaux (4 et
                  3,5) — chaque firme dégage une marge positive, sinon l'une des productions serait
                  aberrante.
                </p>
              </>
            ),
          },
          {
            title: "2.3 — Les profits sous Cournot",
            refs: [{ chapter: "ei2", section: "exemple-cournot" }],
            content: (
              <>
                <MB tex="\pi_1 = p\,y_1 - 4\,y_1 - F = \tfrac{13}{2}\times\tfrac{5}{2} - 4\times\tfrac{5}{2} - F = \tfrac{65}{4} - 10 - F = \tfrac{25}{4} - F" />
                <MB tex="\pi_2 = p\,y_2 - \tfrac{7}{2}\,y_2 - F = \tfrac{13}{2}\times 3 - \tfrac{7}{2}\times 3 - F = \tfrac{39}{2} - \tfrac{21}{2} - F = 9 - F" />
                <Callout variant="methode" title="Astuce de vérification express">
                  <p>
                    Avec une demande de pente 1, la CPO de chaque firme s'écrit{" "}
                    <M tex="p - c_i = y_i" /> : la marge unitaire d'équilibre égale la quantité.
                    Donc <M tex="\pi_i = y_i^2 - F" /> hors coût fixe :{" "}
                    <M tex="(5/2)^2 = 25/4" /> ✓ et <M tex="3^2 = 9" /> ✓. Ce raccourci resservira
                    aux questions 3.5 et 4.2.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.1 — La fonction de réaction du suiveur (firme 2)",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  Le profit de la firme 2 s'écrit{" "}
                  <M tex="\pi_2 = (12 - y_1 - y_2)\,y_2 - \tfrac{7}{2}\,y_2 - F" />. Elle observe{" "}
                  <M tex="y_1" /> et maximise : c'est exactement le calcul de la question 2.1, qui
                  donnait
                </p>
                <MB tex="\tfrac{17}{2} - y_1 - 2\,y_2 = 0 \iff y_2 = \tfrac{17}{4} - \tfrac{1}{2}\,y_1" />
                <p>
                  Que <M tex="y_1" /> soit une croyance (Cournot) ou une quantité observée
                  (Stackelberg), le problème mathématique du suiveur est le même — seule
                  l'interprétation change, comme pour les bûcherons à la question 6 de
                  l'exercice 1.
                </p>
              </>
            ),
          },
          {
            title: "3.2 — Le programme du leader : substituer AVANT de dériver",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  Le profit de la firme 1 s'écrit{" "}
                  <M tex="\pi_1 = (12 - y_1 - y_2)\,y_1 - 4\,y_1 - F" />. La firme 1 anticipe la
                  réaction de la firme 2 trouvée en 3.1 et la substitue dans son profit :
                </p>
                <MB tex="\pi_1 = \Bigl(12 - y_1 - \tfrac{17}{4} + \tfrac{1}{2}\,y_1\Bigr)y_1 - 4\,y_1 - F = \Bigl(\tfrac{31}{4} - \tfrac{1}{2}\,y_1\Bigr)y_1 - 4\,y_1 - F" />
                <MB tex="= \Bigl(\tfrac{15}{4} - \tfrac{1}{2}\,y_1\Bigr)y_1 - F = \tfrac{1}{4}\,y_1\,(15 - 2\,y_1) - F" />
                <p>Condition de premier ordre (forme du corrigé, après multiplication par 4) :</p>
                <MB tex="15 - 4\,y_1 = 0 \iff y_1 = \tfrac{15}{4}" />
                <p>
                  <em>Mini-vérification :</em> <M tex="15/4 = 3{,}75" /> est supérieur à la
                  production Cournot de la firme 1 (<M tex="5/2" />) : le leader surproduit pour
                  faire reculer le suiveur — même logique qu'Alice à l'exercice 1.
                </p>
              </>
            ),
          },
          {
            title: "3.3 — La production du suiveur",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  On injecte <M tex="y_1 = 15/4" /> dans la réaction de la firme 2 :
                </p>
                <MB tex="y_2 = \tfrac{17}{4} - \tfrac{1}{2}\times\tfrac{15}{4} = \tfrac{34}{8} - \tfrac{15}{8} = \tfrac{19}{8}" />
              </>
            ),
          },
          {
            title: "3.4 — Le prix de vente sous Stackelberg",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <MB tex="p = 12 - y_1 - y_2 = \tfrac{96}{8} - \tfrac{30}{8} - \tfrac{19}{8} = \tfrac{47}{8} = 5{,}875" />
                <p>
                  <em>Mini-vérification :</em> production totale{" "}
                  <M tex="15/4 + 19/8 = 49/8 = 6{,}125" />, supérieure au total Cournot{" "}
                  <M tex="11/2 = 5{,}5" /> ; le prix est donc plus bas (5,875 contre 6,5). La
                  séquentialité augmente l'offre, comme chez les bûcherons.
                </p>
              </>
            ),
          },
          {
            title: "3.5 — Les profits sous Stackelberg (et une coquille du corrigé)",
            refs: [{ chapter: "ei2", section: "stackelberg" }],
            content: (
              <>
                <p>
                  <strong>Firme 1</strong> (marge <M tex="p - 4 = \tfrac{47}{8} - \tfrac{32}{8} = \tfrac{15}{8}" />) :
                </p>
                <MB tex="\pi_1^S = p\,y_1 - 4\,y_1 - F = \tfrac{15}{8}\times\tfrac{15}{4} - F = \tfrac{225}{32} - F \approx 7{,}03 - F" />
                <p>
                  <strong>Firme 2</strong> (marge{" "}
                  <M tex="p - \tfrac{7}{2} = \tfrac{47}{8} - \tfrac{28}{8} = \tfrac{19}{8}" />,
                  égale à sa quantité — l'astuce de 2.3) :
                </p>
                <MB tex="\pi_2^S = p\,y_2 - \tfrac{7}{2}\,y_2 - F = \tfrac{19}{8}\times\tfrac{19}{8} - F = \tfrac{361}{64} - F \approx 5{,}64 - F" />
                <Callout variant="attention" title="Coquille dans le corrigé officiel">
                  <p>
                    Les diapositives écrivent{" "}
                    <M tex="\pi_1^S = \tfrac{47}{8}\times\tfrac{15}{4} - 4\times\tfrac{15}{4} - F = \tfrac{457}{32} - F" />{" "}
                    : or <M tex="\tfrac{705}{32} - \tfrac{480}{32} = \tfrac{225}{32}" />, pas{" "}
                    <M tex="\tfrac{457}{32}" />. Test de vraisemblance : <M tex="457/32 \approx 14{,}3" />{" "}
                    frôlerait le profit de monopole (<M tex="16 - F" />) alors que l'entrant vend{" "}
                    <M tex="19/8" /> unités — impossible. La bonne valeur{" "}
                    <M tex="225/32 \approx 7{,}03" /> dépasse bien le profit Cournot{" "}
                    <M tex="25/4 = 6{,}25" />, et modestement — c'est cohérent. La coquille se propage en
                    4.4 (<M tex="329/32" /> et <M tex="449/32" />) mais — on le vérifiera — toutes
                    les conclusions du corrigé restent valables avec les valeurs corrigées.
                  </p>
                </Callout>
                <p>
                  <em>Mini-vérification :</em> par rapport à Cournot, le leader gagne (
                  <M tex="225/32 > 25/4 = 200/32" />) et le suiveur perd (
                  <M tex="361/64 \approx 5{,}64 < 9" />) : c'est la signature de Stackelberg.
                </p>
              </>
            ),
          },
          {
            title: "4.1 — Si la firme 2 entrait quand même…",
            refs: [{ chapter: "ei2", section: "entree" }],
            content: (
              <>
                <p>
                  Rien de neuf à calculer : une fois entrée, la firme 2 choisirait sa meilleure
                  réponse à la production observée de la firme 1 — la fonction de réaction déjà
                  établie en 2.1 et 3.1 :
                </p>
                <MB tex="y_2 = \tfrac{17}{4} - \tfrac{1}{2}\,y_1" />
                <p>
                  C'est le point de départ de toute analyse de dissuasion : pour évaluer la menace,
                  on raisonne <em>comme si</em> l'entrée avait lieu, avec l'entrant jouant au
                  mieux.
                </p>
              </>
            ),
          },
          {
            title: "4.2 — Le profit de l'entrant en fonction de y₁ seul",
            refs: [{ chapter: "ei2", section: "entree" }],
            content: (
              <>
                <p>
                  On repart du profit de la firme 2 et on regroupe les termes (
                  <M tex="12 - \tfrac{7}{2} = \tfrac{17}{2}" />) :
                </p>
                <MB tex="\pi_2 = (12 - y_1 - y_2)\,y_2 - \tfrac{7}{2}\,y_2 - F = \Bigl(\tfrac{17}{2} - y_1 - y_2\Bigr)y_2 - F" />
                <p>
                  Puis on remplace <M tex="y_2" /> par sa meilleure réponse{" "}
                  <M tex="\tfrac{17}{4} - \tfrac{1}{2}y_1" /> :
                </p>
                <MB tex="\tfrac{17}{2} - y_1 - \Bigl(\tfrac{17}{4} - \tfrac{1}{2}\,y_1\Bigr) = \tfrac{17}{4} - \tfrac{1}{2}\,y_1" />
                <MB tex="\pi_2 = \Bigl(\tfrac{17}{4} - \tfrac{1}{2}\,y_1\Bigr)\Bigl(\tfrac{17}{4} - \tfrac{1}{2}\,y_1\Bigr) - F = \Bigl(\tfrac{17}{4} - \tfrac{1}{2}\,y_1\Bigr)^{\!2} - F" />
                <Callout variant="methode">
                  <p>
                    Retrouve l'astuce de 2.3 : à sa meilleure réponse, la marge de la firme 2 égale
                    sa quantité, donc son profit vaut « quantité au carré moins <M tex="F" /> ».
                    Plus la firme 1 produit, plus cette quantité fond — et le carré avec elle.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.3 — La production limite : rendre l'entrée non rentable",
            refs: [{ chapter: "ei2", section: "entree" }],
            content: (
              <>
                <p>
                  La firme 2 renonce à entrer si son profit post-entrée est négatif :{" "}
                  <M tex="\pi_2 < 0" />. Ligne par ligne :
                </p>
                <MB tex="\Bigl(\tfrac{17}{4} - \tfrac{1}{2}\,y_1\Bigr)^{\!2} < F \iff \tfrac{17}{4} - \tfrac{1}{2}\,y_1 < \sqrt{F} \iff \tfrac{1}{2}\,y_1 > \tfrac{17}{4} - \sqrt{F}" />
                <MB tex="\iff\; y_1 > \tfrac{17}{2} - 2\sqrt{F}" />
                <p>
                  La quantité <M tex="\bar y_1 = \tfrac{17}{2} - 2\sqrt{F}" /> est la{" "}
                  <strong>production limite</strong> : au-delà, l'entrée n'est plus rentable.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux précautions en prenant la racine : (1) elle n'est légitime que parce que{" "}
                    <M tex="\tfrac{17}{4} - \tfrac{1}{2}y_1 \geq 0" /> dans la zone pertinente (
                    <M tex="y_1 \leq 17/2" />) — sinon la firme 2 ne produirait rien de toute
                    façon ; (2) c'est <em>ici</em> que <M tex="F" /> entre enfin en scène : sans
                    coût fixe (<M tex="F = 0" />
                    ), il faudrait pousser <M tex="y_1" /> jusqu'à <M tex="17/2" /> pour dissuader
                    — la dissuasion vit du coût fixe de l'entrant.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.4 — Trois coûts fixes, trois régimes d'entrée",
            refs: [{ chapter: "ei2", section: "entree" }],
            content: (
              <>
                <p>
                  <strong>Remarque préalable</strong> (comme dans le corrigé) : l'entrée est
                  bloquée si <M tex="y_1 > \tfrac{17}{2} - 2\sqrt{F}" />, c'est-à-dire
                </p>
                <MB tex="F = \tfrac{1}{4} : \; y_1 > \tfrac{15}{2} \qquad ; \qquad F = 4 : \; y_1 > \tfrac{9}{2} \qquad ; \qquad F = 9 : \; y_1 > \tfrac{5}{2}" />
                <p>
                  et en équilibre de Stackelberg la firme 1 produirait <M tex="15/4" />.
                </p>
                <p>
                  <strong>Cas F = 9 — l'entrée est bloquée sans effort.</strong> Une production
                  supérieure à <M tex="5/2" /> suffit, or la firme 1 produirait{" "}
                  <em>plus</em> que cela à l'équilibre de Stackelberg (<M tex="15/4" />) — et même
                  en restant simple monopole : sa production de monopole est{" "}
                  <M tex="y_1 = 4 > 5/2" /> (question 1.1). Elle peut donc conserver son
                  comportement de monopole, produire <strong>4</strong>, et l'entrée est bloquée
                  d'office. C'est la réponse à la première puce : <M tex="F = 9" />, en produisant
                  4.
                </p>
                <p>
                  <strong>Cas F = 4 — la dissuasion stratégique paie.</strong> Il faut pousser la
                  production jusqu'à <M tex="9/2" /> (au-delà du Stackelberg <M tex="15/4" />) pour
                  amener <M tex="y_2 = 0" />. Le prix serait alors :
                </p>
                <MB tex="p = 12 - \tfrac{9}{2} = \tfrac{15}{2} \qquad ; \qquad \pi_1^{bloq} = \Bigl(\tfrac{15}{2} - 4\Bigr)\tfrac{9}{2} - 4 = \tfrac{63}{4} - 4 = \tfrac{47}{4} = 11{,}75" />
                <p>À comparer au profit de leader accommodant l'entrée :</p>
                <MB tex="\pi_1^S = \tfrac{225}{32} - 4 = \tfrac{97}{32} \approx 3{,}03 \; < \; \tfrac{47}{4}" />
                <p>
                  La firme 1 a donc intérêt à bloquer l'entrée (avec la valeur du corrigé,{" "}
                  <M tex="329/32 \approx 10{,}28 < 47/4" /> : même conclusion).
                </p>
                <p>
                  <strong>Cas F = 1/4 — bloquer coûte trop cher.</strong> Il faudrait produire{" "}
                  <M tex="15/2" />, le double du Stackelberg. Le prix s'effondrerait :
                </p>
                <MB tex="p = 12 - \tfrac{15}{2} = \tfrac{9}{2} \qquad ; \qquad \pi_1^{bloq} = \Bigl(\tfrac{9}{2} - 4\Bigr)\tfrac{15}{2} - \tfrac{1}{4} = \tfrac{15}{4} - \tfrac{1}{4} = \tfrac{7}{2}" />
                <MB tex="\pi_1^S = \tfrac{225}{32} - \tfrac{1}{4} = \tfrac{217}{32} \approx 6{,}78 \; > \; \tfrac{7}{2}" />
                <p>
                  La firme 1 n'a donc <em>pas</em> intérêt à bloquer : mieux vaut accommoder
                  l'entrée en leader de Stackelberg (avec la valeur du corrigé,{" "}
                  <M tex="449/32 \approx 14{,}03 > 7/2" /> : même conclusion).
                </p>
                <EntryLimitSvg />
                <EntryProfitsSvg />
                <Callout variant="retiens">
                  <p>
                    Trois régimes, pilotés par <M tex="F" /> : (1) <M tex="F" /> élevé →{" "}
                    <strong>entrée bloquée d'office</strong>, le monopole n'a rien à changer ; (2){" "}
                    <M tex="F" /> intermédiaire → <strong>dissuasion stratégique</strong>,
                    surproduire jusqu'à la production limite est rentable ; (3) <M tex="F" />{" "}
                    faible → la production limite est hors de portée rentable,{" "}
                    <strong>accommoder</strong> l'entrée en leader est le moindre mal.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 5 — Le classement du point de vue des consommateurs",
            refs: [
              { chapter: "ei2", section: "entree" },
              { chapter: "ei1", section: "inefficacite" },
            ],
            content: (
              <>
                <p>
                  <strong>Méthode :</strong> pour les consommateurs, une situation est d'autant
                  meilleure que la quantité totale est grande et le prix bas (surplus du
                  consommateur croissant avec la quantité le long de la demande). On compare donc{" "}
                  <M tex="y_T" /> et <M tex="p" /> dans les quatre situations avec{" "}
                  <M tex="F = 4" /> :
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[24rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Situation</th>
                        <th className={THc}>
                          <M tex="y_T" />
                        </th>
                        <th className={THc}>
                          <M tex="p" />
                        </th>
                        <th className={TH}>Rang (consommateurs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Stackelberg", "49/8 = 6,125", "47/8 = 5,875", "1ᵉʳ — le meilleur"],
                        ["Cournot", "11/2 = 5,5", "13/2 = 6,5", "2ᵉ"],
                        ["Entrée bloquée", "9/2 = 4,5", "15/2 = 7,5", "3ᵉ"],
                        ["Monopole", "4", "8", "4ᵉ — le pire"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>{row[1]}</td>
                          <td className={TDc}>{row[2]}</td>
                          <td className={TD}>{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Les consommateurs préfèrent donc <strong>Stackelberg</strong>, puis{" "}
                  <strong>Cournot</strong>, puis l'<strong>entrée bloquée</strong>, puis le{" "}
                  <strong>monopole</strong>.
                </p>
                <Callout variant="intuition">
                  <p>
                    La formulation du corrigé mérite d'être retenue : Stackelberg, c'est la{" "}
                    <em>position dominante</em> (le leader surproduit, tant mieux pour les
                    consommateurs) ; l'entrée bloquée, c'est l'<em>abus</em> de position dominante
                    (on surproduit juste assez pour tuer la concurrence, puis on reste seul). Même
                    la dissuasion (4,5 unités) reste toutefois meilleure pour les consommateurs que
                    le monopole tranquille (4 unités) — la simple <em>menace</em> d'entrée
                    discipline déjà le marché.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.</strong> Monopole : <M tex="y_T = 4" />, <M tex="p = 8" />,{" "}
              <M tex="\pi_T = 16 - F" /> · <strong>2.</strong> Cournot : <M tex="y_1 = 5/2" />,{" "}
              <M tex="y_2 = 3" />, <M tex="p = 13/2" />, <M tex="\pi_1 = 25/4 - F" />,{" "}
              <M tex="\pi_2 = 9 - F" /> · <strong>3.</strong> Stackelberg :{" "}
              <M tex="y_2 = 17/4 - y_1/2" />, <M tex="y_1 = 15/4" />, <M tex="y_2 = 19/8" />,{" "}
              <M tex="p = 47/8" />, <M tex="\pi_1^S = 225/32 - F" /> (le corrigé écrit 457/32 :
              coquille), <M tex="\pi_2^S = 361/64 - F" /> · <strong>4.</strong>{" "}
              <M tex="\pi_2 = (17/4 - y_1/2)^2 - F" />, entrée dissuadée si{" "}
              <M tex="y_1 > 17/2 - 2\sqrt{F}" /> ; <M tex="F = 9" /> : blocage sans effort en
              produisant 4 ; <M tex="F = 4" /> : bloquer (produire 9/2, <M tex="\pi_1 = 47/4" />) ;{" "}
              <M tex="F = 1/4" /> : accommoder · <strong>5.</strong> Stackelberg ≻ Cournot ≻ entrée
              bloquée ≻ monopole.
            </p>
            <p>
              <strong>Transfert de méthode :</strong> face à toute question de dissuasion d'entrée,
              déroule les quatre temps de cet exercice. (1) Calcule la <em>réaction de l'entrant</em>{" "}
              s'il entrait. (2) Exprime son profit en fonction de la seule production de
              l'installé. (3) Annule ce profit (coût fixe compris !) pour obtenir la{" "}
              <em>production limite</em> <M tex="\bar y_1(F)" />. (4) Compare le profit de
              l'installé qui bloque à son meilleur profit s'il accommode (ici : leader de
              Stackelberg) — la réponse dépend de <M tex="F" />, avec trois régimes possibles :
              entrée bloquée d'office, dissuasion stratégique, entrée accommodée.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx3"
        kicker="La logique de la production limite"
        question={
          <>
            Pour trouver la production <M tex="\bar y_1" /> qui dissuade la firme 2 d'entrer, quelle
            équation résout-on ?
          </>
        }
        options={[
          {
            text: (
              <>
                On annule le profit que la firme 2 obtiendrait <em>en jouant sa meilleure réponse</em>{" "}
                après l'entrée, coût fixe <M tex="F" /> compris :{" "}
                <M tex="(17/4 - y_1/2)^2 - F = 0" />.
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : l'entrant compare son <em>meilleur</em> profit post-entrée à zéro. Il faut
                donc d'abord sa fonction de réaction, puis son profit réduit en fonction de{" "}
                <M tex="y_1" />, et le coût fixe est décisif — sans lui, aucune production finie ne
                dissuade.
              </>
            ),
          },
          {
            text: (
              <>
                On cherche la production qui rend le prix égal au coût marginal de la firme 2 :{" "}
                <M tex="12 - y_1 = 7/2" />.
              </>
            ),
            explain: (
              <>
                Non : ce calcul ignore que la firme 2 <em>réagit</em> (elle ajoute sa propre
                quantité) et surtout qu'elle supporte un coût fixe. Avec <M tex="F > 0" />, pas
                besoin d'écraser le prix jusqu'au coût marginal pour dissuader.
              </>
            ),
          },
          {
            text: (
              <>
                On égalise les profits des deux firmes : <M tex="\pi_1 = \pi_2" />.
              </>
            ),
            explain: (
              <>
                Non : la décision d'entrée de la firme 2 ne dépend que de <em>son</em> profit
                comparé à zéro (son option extérieure), pas du profit de la firme 1.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Schéma à retenir : réaction de l'entrant → profit de l'entrant en fonction de{" "}
            <M tex="y_1" /> seul → condition <M tex="\pi_2 \leq 0" /> → production limite{" "}
            <M tex="\bar y_1 = 17/2 - 2\sqrt{F}" />, décroissante en <M tex="F" />.
          </>
        }
      />

      <Quiz
        scope="tp2"
        id="qx4"
        kicker="Bloquer ou accommoder : le rôle du coût fixe"
        question={
          <>
            Comment le coût fixe <M tex="F" /> de l'entrant détermine-t-il la stratégie optimale de
            la firme installée ?
          </>
        }
        options={[
          {
            text: (
              <>
                Plus <M tex="F" /> est élevé, plus la production limite est basse : à{" "}
                <M tex="F" /> très élevé l'entrée est bloquée sans rien changer au comportement de
                monopole ; à <M tex="F" /> intermédiaire il faut surproduire mais c'est rentable ;
                à <M tex="F" /> faible, bloquer coûte plus que d'accommoder.
              </>
            ),
            correct: true,
            explain: (
              <>
                C'est exactement la lecture de la question 4.4 : <M tex="F = 9" /> → monopole
                tranquille (produire 4) ; <M tex="F = 4" /> → dissuasion stratégique (produire
                9/2) ; <M tex="F = 1/4" /> → accommoder en leader de Stackelberg.
              </>
            ),
          },
          {
            text: (
              <>
                <M tex="F" /> ne joue aucun rôle : ce qui compte est que la firme 2 a un coût
                marginal plus faible, elle entrera donc toujours.
              </>
            ),
            explain: (
              <>
                Non : l'avantage de coût marginal rend l'entrée tentante, mais la décision d'entrer
                compare le profit variable au coût fixe. Avec <M tex="F = 9" />, la firme 2
                n'entre pas même face à un monopole passif.
              </>
            ),
          },
          {
            text: (
              <>
                Plus <M tex="F" /> est élevé, plus il faut produire pour dissuader l'entrée,
                puisque l'entrant a davantage à récupérer.
              </>
            ),
            explain: (
              <>
                C'est l'inverse : <M tex="\bar y_1 = 17/2 - 2\sqrt{F}" /> est{" "}
                <em>décroissante</em> en <M tex="F" />. Un gros coût fixe est un fardeau pour
                l'entrant : il faut moins d'efforts pour le décourager.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Le coût fixe de l'entrant est la vraie « barrière à l'entrée » de cet exercice : il
            fixe la hauteur de la marche que l'installé peut exploiter. Retiens le diagramme des
            trois régimes — c'est une question de cours classique.
          </>
        }
      />
    </TpShell>
  );
}
