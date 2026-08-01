/**
 * Résolution guidée · Examen blanc n° 1 — Partie 1 (Théorie de la décision
 * et Théorie des jeux).
 *
 * Énoncé et valeurs strictement alignés sur exams/p1-blanc-1/enonce-body.html
 * et exams/p1-blanc-1/corrige-body.html : chaque résultat numérique de cette
 * page correspond au corrigé officiel. La page ajoute ce que le PDF ne peut
 * pas donner : le décodage de l'énoncé, le pourquoi de chaque étape, les
 * pièges de barème et les visuels.
 */
import { ExamSolutionShell } from "@/components/course/ExamSolutionShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { TpRefList } from "@/components/course/TpRef";

/* ================================================================== */
/* Visuels SVG locaux                                                  */
/* ================================================================== */

/**
 * Question 1.3 — profils d'utilité des projets A et C : C fait au moins
 * aussi bien pour tout le monde, strictement mieux pour l'habitant 3.
 */
function SvgProfilsProjets() {
  const X = [150, 255, 360]; // habitants 1, 2, 3
  const y = (u: number) => 210 - u * 22.5;
  const A = [6, 3, 5];
  const C = [6, 3, 7];
  const ptsA = A.map((u, i) => `${X[i]},${y(u)}`).join(" ");
  const ptsC = C.map((u, i) => `${X[i]},${y(u)}`).join(" ");
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 480 270"
        role="img"
        aria-label="Profils d'utilité des projets A et C : mêmes utilités pour les habitants 1 et 2, utilité strictement supérieure de C pour l'habitant 3"
        className="mx-auto h-auto w-full max-w-md"
      >
        {/* axes */}
        <line x1={90} y1={30} x2={90} y2={210} stroke="#94a3b8" strokeWidth={1.4} />
        <line x1={90} y1={210} x2={430} y2={210} stroke="#94a3b8" strokeWidth={1.4} />
        {[0, 2, 4, 6, 8].map((u) => (
          <g key={u}>
            <line x1={86} x2={90} y1={y(u)} y2={y(u)} stroke="#64748b" />
            <text x={80} y={y(u) + 4} fontSize={11} textAnchor="end" fill="#64748b">
              {u}
            </text>
          </g>
        ))}
        <text x={62} y={20} fontSize={11.5} fill="#64748b">
          utilité
        </text>
        {[1, 2, 3].map((h, i) => (
          <text key={h} x={X[i]} y={230} fontSize={12} textAnchor="middle" fill="#334155">
            Habitant {h}
          </text>
        ))}
        {/* projet A : ligne pointillée, cercles creux */}
        <polyline points={ptsA} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="6 5" />
        {A.map((u, i) => (
          <circle key={i} cx={X[i]} cy={y(u)} r={7} fill="white" stroke="#64748b" strokeWidth={2} />
        ))}
        {/* projet C : ligne pleine, points pleins */}
        <polyline points={ptsC} fill="none" stroke="#047857" strokeWidth={2.5} />
        {C.map((u, i) => (
          <circle key={i} cx={X[i]} cy={y(u)} r={4.5} fill="#047857" />
        ))}
        {/* annotation du gain strict de l'habitant 3 */}
        <line
          x1={360}
          y1={y(5) - 9}
          x2={360}
          y2={y(7) + 8}
          stroke="#be123c"
          strokeWidth={1.8}
          markerEnd="url(#flecheQ1)"
        />
        <defs>
          <marker id="flecheQ1" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#be123c" />
          </marker>
        </defs>
        <text x={372} y={78} fontSize={11.5} fontWeight={700} fill="#be123c">
          +2 pour
        </text>
        <text x={372} y={92} fontSize={11.5} fontWeight={700} fill="#be123c">
          l'habitant 3
        </text>
        <text x={150} y={62} fontSize={11} textAnchor="middle" fill="#64748b">
          mêmes utilités
        </text>
        {/* légende */}
        <g>
          <line x1={106} y1={252} x2={136} y2={252} stroke="#64748b" strokeWidth={2} strokeDasharray="6 5" />
          <circle cx={121} cy={252} r={5.5} fill="white" stroke="#64748b" strokeWidth={2} />
          <text x={142} y={256} fontSize={12} fill="#334155">
            Projet A
          </text>
          <line x1={230} y1={252} x2={260} y2={252} stroke="#047857" strokeWidth={2.5} />
          <circle cx={245} cy={252} r={4} fill="#047857" />
          <text x={266} y={256} fontSize={12} fill="#334155">
            Projet C
          </text>
        </g>
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Le profil de C ne passe jamais <em>sous</em> celui de A et le dépasse strictement pour
        l'habitant 3 : c'est exactement la définition graphique de « C domine A au sens de Pareto ».
      </figcaption>
    </figure>
  );
}

/**
 * Question 2.3 — fonction d'utilité concave, corde, équivalent certain et
 * prime de risque (les valeurs exactes de l'examen).
 */
function SvgUtiliteConcave() {
  const xw = (w: number) => 55 + ((w - 3200) * 490) / 7400;
  const yu = (u: number) => 340 - 5.6 * (u - 52);
  const courbe: string[] = [];
  for (let w = 3200; w <= 10300; w += 100) {
    courbe.push(`${xw(w).toFixed(1)},${yu(Math.sqrt(w)).toFixed(1)}`);
  }
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 580 380"
        role="img"
        aria-label="Fonction d'utilité concave racine de w avec la corde entre les points vol et pas de vol : l'équivalent certain 8 100 est à gauche de la VMA 8 400, l'écart est la prime de risque de 300 euros"
        className="mx-auto h-auto w-full max-w-lg"
      >
        {/* axes */}
        <line x1={50} y1={20} x2={50} y2={352} stroke="#94a3b8" strokeWidth={1.4} />
        <line x1={50} y1={352} x2={565} y2={352} stroke="#94a3b8" strokeWidth={1.4} />
        <text x={545} y={344} fontSize={11.5} textAnchor="end" fill="#64748b">
          richesse w (euros)
        </text>
        <text x={58} y={16} fontSize={11.5} fill="#64748b">
          utilité u
        </text>
        {/* corde entre (3 600 ; 60) et (10 000 ; 100) */}
        <line
          x1={xw(3600)}
          y1={yu(60)}
          x2={xw(10000)}
          y2={yu(100)}
          stroke="#94a3b8"
          strokeWidth={1.8}
          strokeDasharray="7 5"
        />
        {/* courbe u(w) = racine de w */}
        <polyline points={courbe.join(" ")} fill="none" stroke="#6d28d9" strokeWidth={2.6} />
        <text x={xw(4400)} y={yu(Math.sqrt(4400)) - 12} fontSize={13} fontWeight={700} fill="#6d28d9">
          u(w) = √w
        </text>
        <text x={xw(6500) + 10} y={yu(80.6) + 26} fontSize={11} fill="#64748b">
          corde (loteries entre vol et pas de vol)
        </text>
        {/* guides verticaux */}
        <line x1={xw(8100)} y1={yu(90)} x2={xw(8100)} y2={352} stroke="#0369a1" strokeWidth={1.1} strokeDasharray="4 4" />
        <line x1={xw(8400)} y1={yu(90)} x2={xw(8400)} y2={352} stroke="#b45309" strokeWidth={1.1} strokeDasharray="4 4" />
        {/* guide horizontal u = 90 */}
        <line x1={50} y1={yu(90)} x2={xw(8400)} y2={yu(90)} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
        <text x={44} y={yu(90) + 4} fontSize={11.5} textAnchor="end" fill="#334155" fontWeight={700}>
          90
        </text>
        {/* points extrêmes */}
        <circle cx={xw(3600)} cy={yu(60)} r={5} fill="#be123c" />
        <text x={xw(3600) + 9} y={yu(60) + 14} fontSize={11.5} fill="#be123c" fontWeight={600}>
          vol : (3 600 ; 60), proba 1/4
        </text>
        <circle cx={xw(10000)} cy={yu(100)} r={5} fill="#047857" />
        <text x={xw(10000) - 8} y={yu(100) - 10} fontSize={11.5} textAnchor="end" fill="#047857" fontWeight={600}>
          pas de vol : (10 000 ; 100), proba 3/4
        </text>
        {/* espérance sur la corde */}
        <circle cx={xw(8400)} cy={yu(90)} r={5} fill="#b45309" />
        <text x={xw(8400) + 10} y={yu(90) + 4} fontSize={11.5} fill="#b45309" fontWeight={700}>
          (VMA ; U) = (8 400 ; 90)
        </text>
        {/* équivalent certain sur la courbe */}
        <circle cx={xw(8100)} cy={yu(90)} r={5} fill="#0369a1" />
        {/* u(VMA) sur la courbe, au-dessus de la corde */}
        <circle cx={xw(8400)} cy={yu(Math.sqrt(8400))} r={4} fill="#6d28d9" />
        <text x={xw(8400) + 9} y={yu(Math.sqrt(8400)) - 6} fontSize={11} fill="#6d28d9">
          u(VMA) ≈ 91,65 &gt; 90
        </text>
        {/* prime de risque */}
        <line x1={xw(8100)} y1={yu(90)} x2={xw(8400)} y2={yu(90)} stroke="#be123c" strokeWidth={3.4} />
        <line x1={xw(8250)} y1={yu(90) + 2} x2={xw(7300)} y2={yu(90) + 52} stroke="#be123c" strokeWidth={1} />
        <text x={xw(7300) - 4} y={yu(90) + 66} fontSize={12} textAnchor="middle" fill="#be123c" fontWeight={700}>
          prime de risque = 8 400 − 8 100 = 300 euros
        </text>
        {/* étiquettes sur l'axe */}
        <text x={xw(8100) - 6} y={368} fontSize={11.5} textAnchor="end" fill="#0369a1" fontWeight={700}>
          EC = 8 100
        </text>
        <text x={xw(8400) + 6} y={368} fontSize={11.5} fill="#b45309" fontWeight={700}>
          VMA = 8 400
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Toute la question 2.3 sur un seul dessin : l'utilité espérée U = 90 se lit sur la{" "}
        <em>corde</em> au-dessus de la VMA ; l'équivalent certain est la richesse sûre qui donne la
        même utilité sur la <em>courbe</em>. Comme la courbe est concave, EC &lt; VMA : l'écart est
        la prime de risque.
      </figcaption>
    </figure>
  );
}

/**
 * Question 3.4 — meilleures réponses en probabilités : les deux « escaliers »
 * ne se croisent qu'au point (p* ; q*) = (0,6 ; 0,4).
 */
function SvgReponsesMixtes() {
  const x = (p: number) => 80 + p * 320;
  const y = (q: number) => 350 - q * 300;
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 480 420"
        role="img"
        aria-label="Diagramme des meilleures réponses en stratégies mixtes : la courbe du pirate et celle de la responsable ne se croisent qu'au point p égale 0,6 et q égale 0,4"
        className="mx-auto h-auto w-full max-w-md"
      >
        {/* légende */}
        <line x1={90} y1={22} x2={122} y2={22} stroke="#be123c" strokeWidth={3.5} />
        <text x={128} y={26} fontSize={12} fill="#334155">
          meilleure réponse du pirate
        </text>
        <line x1={90} y1={42} x2={122} y2={42} stroke="#0369a1" strokeWidth={3.5} />
        <text x={128} y={46} fontSize={12} fill="#334155">
          meilleure réponse de la responsable
        </text>
        {/* axes */}
        <line x1={76} y1={56} x2={76} y2={356} stroke="#94a3b8" strokeWidth={1.4} />
        <line x1={76} y1={356} x2={414} y2={356} stroke="#94a3b8" strokeWidth={1.4} />
        <text x={x(0)} y={372} fontSize={11} textAnchor="middle" fill="#64748b">
          0
        </text>
        <text x={x(1)} y={372} fontSize={11} textAnchor="middle" fill="#64748b">
          1
        </text>
        <text x={68} y={y(0) + 4} fontSize={11} textAnchor="end" fill="#64748b">
          0
        </text>
        <text x={68} y={y(1) + 4} fontSize={11} textAnchor="end" fill="#64748b">
          1
        </text>
        <text x={245} y={402} fontSize={12} textAnchor="middle" fill="#334155">
          p = probabilité que le pirate attaque A
        </text>
        <text
          x={22}
          y={206}
          fontSize={12}
          textAnchor="middle"
          fill="#334155"
          transform="rotate(-90 22 206)"
        >
          q = probabilité de surveiller A
        </text>
        {/* meilleure réponse du pirate : p = 1 si q < 0,4 ; tout p si q = 0,4 ; p = 0 sinon */}
        <polyline
          points={`${x(1)},${y(0)} ${x(1)},${y(0.4)} ${x(0)},${y(0.4)} ${x(0)},${y(1)}`}
          fill="none"
          stroke="#be123c"
          strokeWidth={3.5}
        />
        {/* meilleure réponse de la responsable : q = 0 si p < 0,6 ; tout q si p = 0,6 ; q = 1 sinon */}
        <polyline
          points={`${x(0)},${y(0)} ${x(0.6)},${y(0)} ${x(0.6)},${y(1)} ${x(1)},${y(1)}`}
          fill="none"
          stroke="#0369a1"
          strokeWidth={3.5}
        />
        {/* guides pointillés vers les axes */}
        <line x1={x(0.6)} y1={y(0.4)} x2={x(0.6)} y2={356} stroke="#6d28d9" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={76} y1={y(0.4)} x2={x(0.6)} y2={y(0.4)} stroke="#6d28d9" strokeWidth={1} strokeDasharray="4 4" />
        <text x={x(0.6)} y={372} fontSize={11.5} textAnchor="middle" fill="#6d28d9" fontWeight={700}>
          p* = 0,6
        </text>
        <text x={68} y={y(0.4) + 4} fontSize={11.5} textAnchor="end" fill="#6d28d9" fontWeight={700}>
          q* = 0,4
        </text>
        {/* équilibre */}
        <circle cx={x(0.6)} cy={y(0.4)} r={6.5} fill="#6d28d9" />
        <text x={x(0.6) + 12} y={y(0.4) - 10} fontSize={12} fill="#6d28d9" fontWeight={700}>
          équilibre mixte (0,6 ; 0,4)
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Chaque « escalier » est la meilleure réponse d'un joueur à la stratégie mixte de l'autre.
        Aucun coin de la boîte n'est sur les deux courbes (pas d'équilibre pur) : l'unique
        intersection est le point intérieur (0,6 ; 0,4).
      </figcaption>
    </figure>
  );
}

/**
 * Question 4.2 — le surplus S(e) = 4e − e² : maximum en e* = 2, et la
 * propriétaire empoche S(2) − Ū = 3.
 */
function SvgSurplusEffort() {
  const x = (e: number) => 60 + e * 95;
  const y = (s: number) => 250 - 45 * s;
  const parabole = Array.from({ length: 41 }, (_, i) => {
    const e = i * 0.1;
    return `${x(e).toFixed(1)},${y(4 * e - e * e).toFixed(1)}`;
  }).join(" ");
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 480 300"
        role="img"
        aria-label="Parabole du surplus 4e moins e carré, maximum 4 atteint en effort 2 ; la propriétaire garde le surplus au-dessus de l'utilité de réserve 1, soit 3"
        className="mx-auto h-auto w-full max-w-md"
      >
        {/* axes */}
        <line x1={60} y1={30} x2={60} y2={250} stroke="#94a3b8" strokeWidth={1.4} />
        <line x1={60} y1={250} x2={460} y2={250} stroke="#94a3b8" strokeWidth={1.4} />
        {[0, 1, 2, 3, 4].map((e) => (
          <text key={e} x={x(e)} y={266} fontSize={11} textAnchor="middle" fill="#64748b">
            {e}
          </text>
        ))}
        <text x={442} y={282} fontSize={12} textAnchor="middle" fill="#334155">
          effort e
        </text>
        <text x={68} y={24} fontSize={12} fill="#334155">
          surplus S(e) = 4e − e²
        </text>
        {/* utilité de réserve */}
        <line x1={60} y1={y(1)} x2={440} y2={y(1)} stroke="#b45309" strokeWidth={1.4} strokeDasharray="6 5" />
        <text x={438} y={y(1) - 7} fontSize={11.5} textAnchor="end" fill="#b45309" fontWeight={600}>
          utilité de réserve Ū = 1 (part de la directrice)
        </text>
        {/* parabole */}
        <polyline points={parabole} fill="none" stroke="#be123c" strokeWidth={2.6} />
        {/* sommet */}
        <line x1={x(2)} y1={y(4)} x2={x(2)} y2={250} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={60} y1={y(4)} x2={x(2)} y2={y(4)} stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" />
        <circle cx={x(2)} cy={y(4)} r={5.5} fill="#be123c" />
        <text x={x(2) + 10} y={y(4) - 8} fontSize={12} fill="#be123c" fontWeight={700}>
          maximum : e* = 2, S = 4
        </text>
        <text x={52} y={y(4) + 4} fontSize={11.5} textAnchor="end" fill="#334155" fontWeight={700}>
          4
        </text>
        <text x={52} y={y(1) + 4} fontSize={11.5} textAnchor="end" fill="#334155" fontWeight={700}>
          1
        </text>
        {/* profit de la propriétaire : accolade entre S = 4 et Ū = 1 */}
        <line x1={x(2.35)} y1={y(4)} x2={x(2.35)} y2={y(1)} stroke="#047857" strokeWidth={2.4} />
        <line x1={x(2.35) - 6} y1={y(4)} x2={x(2.35)} y2={y(4)} stroke="#047857" strokeWidth={2.4} />
        <line x1={x(2.35) - 6} y1={y(1)} x2={x(2.35)} y2={y(1)} stroke="#047857" strokeWidth={2.4} />
        <text x={x(2.35) + 9} y={(y(4) + y(1)) / 2 + 4} fontSize={12} fill="#047857" fontWeight={700}>
          profit de la propriétaire = 4 − 1 = 3
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Après substitution, la propriétaire maximise le surplus total S(e) = 4e − e² : elle choisit
        le contrat qui induit e* = 2 (sommet de la parabole), laisse Ū = 1 à la directrice et garde
        le reste.
      </figcaption>
    </figure>
  );
}

/**
 * Question 5.2 — frise des périodes : coopérer pour toujours vs dévier
 * aujourd'hui puis subir la punition (B ; B) à jamais.
 */
function SvgFriseRepetee() {
  const cols = [150, 245, 340, 435];
  const poids = ["1", "δ", "δ²", "δ³"];
  return (
    <figure className="my-6">
      <svg
        viewBox="0 0 560 250"
        role="img"
        aria-label="Frise des périodes d'un jeu répété : la coopération rapporte 6 à chaque période, la déviation rapporte 12 immédiatement puis 2 pour toujours"
        className="mx-auto h-auto w-full max-w-lg"
      >
        {/* en-têtes de périodes */}
        {cols.map((cx, t) => (
          <g key={t}>
            <text x={cx + 40} y={26} fontSize={12} textAnchor="middle" fill="#334155" fontWeight={700}>
              t = {t}
            </text>
            <text x={cx + 40} y={44} fontSize={11.5} textAnchor="middle" fill="#64748b">
              poids {poids[t]}
            </text>
          </g>
        ))}
        <text x={532} y={26} fontSize={14} textAnchor="middle" fill="#334155" fontWeight={700}>
          …
        </text>
        {/* ligne coopération */}
        <text x={10} y={74} fontSize={11.5} fill="#047857" fontWeight={700}>
          Coopération
        </text>
        <text x={10} y={88} fontSize={10.5} fill="#64748b">
          (E ; E) pour toujours
        </text>
        {cols.map((cx, t) => (
          <g key={t}>
            <rect x={cx} y={58} width={80} height={42} rx={9} fill="#d1fae5" stroke="#047857" strokeWidth={1.6} />
            <text x={cx + 40} y={85} fontSize={16} textAnchor="middle" fill="#047857" fontWeight={700}>
              6
            </text>
          </g>
        ))}
        <text x={532} y={85} fontSize={15} textAnchor="middle" fill="#047857" fontWeight={700}>
          …
        </text>
        {/* ligne déviation */}
        <text x={10} y={154} fontSize={11.5} fill="#b45309" fontWeight={700}>
          Déviation en t = 0
        </text>
        <text x={10} y={168} fontSize={10.5} fill="#64748b">
          puis punition (B ; B)
        </text>
        <rect x={cols[0]} y={138} width={80} height={42} rx={9} fill="#fef3c7" stroke="#b45309" strokeWidth={1.8} />
        <text x={cols[0] + 40} y={165} fontSize={16} textAnchor="middle" fill="#b45309" fontWeight={700}>
          12
        </text>
        {cols.slice(1).map((cx, i) => (
          <g key={i}>
            <rect x={cx} y={138} width={80} height={42} rx={9} fill="#ffe4e6" stroke="#be123c" strokeWidth={1.6} />
            <text x={cx + 40} y={165} fontSize={16} textAnchor="middle" fill="#be123c" fontWeight={700}>
              2
            </text>
          </g>
        ))}
        <text x={532} y={165} fontSize={15} textAnchor="middle" fill="#be123c" fontWeight={700}>
          …
        </text>
        {/* annotations */}
        <text x={cols[0] + 40} y={205} fontSize={11.5} textAnchor="middle" fill="#b45309" fontWeight={600}>
          gain immédiat : +6
        </text>
        <text x={cols[0] + 40} y={219} fontSize={10.5} textAnchor="middle" fill="#64748b">
          (12 au lieu de 6)
        </text>
        <text x={cols[2] + 40} y={205} fontSize={11.5} textAnchor="middle" fill="#be123c" fontWeight={600}>
          perte future : −4 à chaque période
        </text>
        <text x={cols[2] + 40} y={219} fontSize={10.5} textAnchor="middle" fill="#64748b">
          (2 au lieu de 6, pour toujours)
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        L'arbitrage de la question 5.2 : dévier échange un bonus unique de +6 aujourd'hui contre une
        perte de 4 à chaque période future — pertes pesées par δ, δ², δ³…
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function ExamSolution() {
  return (
    <ExamSolutionShell examId="p1-blanc-1">
      {/* ============================================================ */}
      {/* Question 1 — Préférences, Pareto & comportemental             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-1"
        id="q1"
        number={1}
        title="Question 1 — Pareto, effet de dotation et choix rationnel (40 pts)"
        difficulty={2}
        refs={[
          { chapter: "a1", section: "pareto" },
          { chapter: "a1", section: "dotation" },
          { chapter: "a1", section: "vs" },
        ]}
        statement={
          <>
            <p>
              Quatre volets <strong>indépendants</strong> sur les concepts du chapitre A1, 10 points
              chacun.
            </p>
            <SubQuestion label="1.1">
              Neuf parts égales d'un gâteau doivent être réparties entre trois collègues qui ne se
              soucient que de leur propre consommation (plus de parts, c'est toujours mieux). Donne
              une allocation <M tex="(x_1;\, x_2;\, x_3)" /> qui domine l'allocation{" "}
              <M tex="(2;\, 3;\, 2)" /> au sens de Pareto <em>sans être elle-même efficace</em> au
              sens de Pareto. Justifie brièvement les deux propriétés. (10 points)
            </SubQuestion>
            <SubQuestion label="1.2">
              Lors d'une expérience en auditoire, on distribue gratuitement et <em>au hasard</em>{" "}
              une gourde frappée du logo de l'université à la moitié des étudiants. On demande
              ensuite à chaque détenteur le prix minimal auquel il accepterait de vendre sa gourde
              (sa disposition à accepter, DAA) et à chaque non-détenteur le prix maximal qu'il
              serait prêt à payer pour en obtenir une (sa disposition à payer, DAP). Résultat : DAA
              moyenne = 8 euros, DAP moyenne = 4 euros. Pourquoi ce résultat constitue-t-il une
              déviation par rapport à la théorie de la décision rationnelle ? Comment appelle-t-on
              ce biais ? (10 points)
            </SubQuestion>
            <SubQuestion label="1.3">
              Une commune doit choisir l'emplacement d'un nouveau parc parmi quatre projets (A, B,
              C et D). Les utilités des trois habitants concernés sont données dans le tableau
              ci-dessous. a) Y a-t-il un ou plusieurs projets dominés au sens de Pareto ? Le cas
              échéant, précise par quel projet et vérifie-le. b) Quels projets sont efficaces au
              sens de Pareto ? Détaille ton raisonnement. (10 points)
            </SubQuestion>
            <div className="overflow-x-auto">
              <table className="my-3 border-collapse text-sm tabular-nums">
                <thead>
                  <tr>
                    <th className="border bg-muted/60 px-3 py-1.5" />
                    <th className="border bg-muted/60 px-3 py-1.5 font-semibold">Projet A</th>
                    <th className="border bg-muted/60 px-3 py-1.5 font-semibold">Projet B</th>
                    <th className="border bg-muted/60 px-3 py-1.5 font-semibold">Projet C</th>
                    <th className="border bg-muted/60 px-3 py-1.5 font-semibold">Projet D</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="border bg-muted/60 px-3 py-1.5 text-left font-semibold">
                      Habitant 1
                    </th>
                    <td className="border px-3 py-1.5 text-center">6</td>
                    <td className="border px-3 py-1.5 text-center">4</td>
                    <td className="border px-3 py-1.5 text-center">6</td>
                    <td className="border px-3 py-1.5 text-center">5</td>
                  </tr>
                  <tr>
                    <th className="border bg-muted/60 px-3 py-1.5 text-left font-semibold">
                      Habitant 2
                    </th>
                    <td className="border px-3 py-1.5 text-center">3</td>
                    <td className="border px-3 py-1.5 text-center">5</td>
                    <td className="border px-3 py-1.5 text-center">3</td>
                    <td className="border px-3 py-1.5 text-center">4</td>
                  </tr>
                  <tr>
                    <th className="border bg-muted/60 px-3 py-1.5 text-left font-semibold">
                      Habitant 3
                    </th>
                    <td className="border px-3 py-1.5 text-center">5</td>
                    <td className="border px-3 py-1.5 text-center">5</td>
                    <td className="border px-3 py-1.5 text-center">7</td>
                    <td className="border px-3 py-1.5 text-center">5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <SubQuestion label="1.4">
              Un ami te dit : « Les expériences de laboratoire montrent que les humains violent
              régulièrement les prédictions de la théorie du choix rationnel. Il faut donc
              abandonner cette théorie. » Donne deux arguments, vus au cours, pour lesquels les
              économistes conservent malgré tout la théorie du choix rationnel. (10 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé",
            refs: [
              { chapter: "a1", section: "pareto" },
              { chapter: "a1", section: "comporte" },
            ],
            content: (
              <>
                <p>
                  Quatre volets indépendants, <strong>aucun calcul lourd</strong> : c'est une
                  question de <em>concepts</em>. Le vocabulaire de l'énoncé te dit immédiatement où
                  aller chercher dans le cours :
                </p>
                <ul>
                  <li>
                    « <em>domine au sens de Pareto</em> », « <em>efficace</em> » (1.1 et 1.3) → le
                    critère de Pareto du chapitre A1 ;
                  </li>
                  <li>
                    « <em>DAA / DAP</em> », « <em>biais</em> » (1.2) → l'économie comportementale,
                    et plus précisément l'effet de dotation ;
                  </li>
                  <li>
                    « <em>abandonner la théorie du choix rationnel ?</em> » (1.4) → le débat
                    rationnel vs comportemental de la fin du chapitre A1.
                  </li>
                </ul>
                <p>
                  Comme les volets sont indépendants, tu peux les traiter dans n'importe quel ordre
                  — commence par celui où tu es le plus solide pour sécuriser des points.
                </p>
                <Callout variant="methode">
                  <p>
                    Sur une question de concepts, structure <em>chaque</em> réponse en trois temps :{" "}
                    <strong>définition</strong> précise → <strong>application</strong> aux données
                    de l'énoncé → <strong>conclusion</strong> en une phrase. La définition exacte
                    vaut à elle seule une bonne partie des points.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 — Poser les deux définitions qu'on va devoir vérifier",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  On nous demande une allocation qui vérifie <em>deux</em> propriétés à la fois. Il
                  faut donc d'abord savoir exactement ce qu'on devra prouver :
                </p>
                <Callout variant="definition">
                  <p>
                    Une allocation <M tex="x" /> <strong>domine</strong> une allocation{" "}
                    <M tex="y" /> au sens de Pareto si personne n'est strictement moins bien loti
                    en <M tex="x" /> qu'en <M tex="y" /> et si <em>au moins une</em> personne est
                    strictement mieux lotie. Une allocation est <strong>efficace</strong> au sens
                    de Pareto si <em>aucune</em> allocation réalisable ne la domine.
                  </p>
                </Callout>
                <p>
                  L'astuce de l'énoncé : l'allocation de départ <M tex="(2;\, 3;\, 2)" /> ne
                  distribue que
                </p>
                <MB tex="2 + 3 + 2 = 7 \text{ parts sur les } 9 \text{ disponibles.}" />
                <p>
                  Il reste <strong>2 parts sur la table</strong>. Comme les collègues préfèrent
                  toujours plus de parts (préférences monotones), donner une part de plus à
                  quelqu'un sans rien retirer aux autres crée une amélioration de Pareto. Et si on
                  ne distribue <em>pas tout</em>, l'allocation obtenue reste elle-même améliorable,
                  donc non efficace.
                </p>
              </>
            ),
          },
          {
            title: "1.1 — Construire l'allocation et vérifier les deux propriétés",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  On distribue <em>une</em> des deux parts restantes (et une seule !) au collègue
                  1, par exemple. Proposition :
                </p>
                <MB tex="(x_1;\, x_2;\, x_3) = (3;\, 3;\, 2)." />
                <p>
                  <strong>Propriété 1 — elle domine (2 ; 3 ; 2).</strong> On compare collègue par
                  collègue :
                </p>
                <MB tex="x_1 = 3 > 2, \qquad x_2 = 3 \ge 3, \qquad x_3 = 2 \ge 2." />
                <p>
                  Personne ne perd, et le collègue 1 gagne strictement : c'est exactement la
                  définition d'une amélioration de Pareto.
                </p>
                <p>
                  <strong>Propriété 2 — elle n'est pas efficace.</strong> Elle ne distribue que
                </p>
                <MB tex="3 + 3 + 2 = 8 < 9 \text{ parts.}" />
                <p>
                  Il reste donc une part non attribuée, et <M tex="(3;\, 3;\, 2)" /> est elle-même
                  dominée, par exemple par <M tex="(4;\, 3;\, 2)" /> ou <M tex="(3;\, 3;\, 3)" /> :
                  elle n'est pas efficace. Avec des préférences monotones, être efficace exigerait
                  de distribuer les 9 parts.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème du corrigé : allocation valide 4 pts, justification de la domination
                    3 pts, justification de la non-efficacité 3 pts. Donner l'allocation sans{" "}
                    <em>prouver</em> les deux propriétés fait perdre 6 points sur 10 ! Pour la
                    non-efficacité, le plus convaincant est d'exhiber explicitement une allocation
                    qui domine la tienne. Toute allocation qui donne au moins autant à chacun avec
                    une inégalité stricte <em>et</em> distribue au plus 8 parts est acceptée.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 — Énoncer la prédiction rationnelle, constater la déviation, nommer le biais",
            refs: [{ chapter: "a1", section: "dotation" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi commencer par la prédiction rationnelle ?</strong> Parce qu'un
                  biais se définit toujours comme un écart <em>par rapport à</em> ce que prédit la
                  théorie rationnelle. Pour un être rationnel, la valeur d'un bien ne dépend que de
                  l'usage et du plaisir qu'il en retire — pas du fait de le posséder déjà. La
                  théorie prédit donc :
                </p>
                <MB tex="\text{DAP} = \text{DAA}." />
                <p>
                  Le prix minimal pour vendre la gourde devrait être égal au prix maximal pour
                  l'acheter. L'énoncé ajoute un détail crucial : la gourde a été attribuée{" "}
                  <em>au hasard</em>. Les deux groupes (détenteurs et non-détenteurs) ont donc, en
                  moyenne, les <strong>mêmes préférences</strong> — leurs évaluations moyennes
                  devraient coïncider. Or on observe :
                </p>
                <MB tex="\text{DAA moyenne} = 8 \text{ euros} > 4 \text{ euros} = \text{DAP moyenne,}" />
                <p>
                  soit un rapport du simple au double. Le simple fait de <em>posséder</em> la
                  gourde — une variable non pertinente pour sa valeur d'usage — augmente
                  l'évaluation qu'on en fait. Ce biais s'appelle{" "}
                  <strong>l'effet de dotation</strong> (endowment effect).
                </p>
                <Callout variant="intuition">
                  <p>
                    D'où vient l'effet de dotation ? De l'aversion à la perte : dès que la gourde
                    entre dans mon « point de référence », la céder est ressenti comme une{" "}
                    <em>perte</em> — et les pertes pèsent psychologiquement plus lourd que les
                    gains équivalents. Vendre exige donc une compensation plus élevée que ce qu'on
                    aurait payé pour acheter.
                  </p>
                </Callout>
                <Callout variant="examen">
                  <p>
                    Ne saute pas l'argument de la <strong>randomisation</strong> : c'est lui qui
                    exclut l'explication « les détenteurs aiment simplement plus les gourdes ». Le
                    barème le récompense explicitement (3 pts), en plus de la prédiction DAP = DAA
                    (4 pts) et du nom du biais (3 pts).
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 a) — Traquer les dominations en comparant les projets deux à deux",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette méthode ?</strong> « Dominé » est une relation entre{" "}
                  <em>deux</em> projets : il faut donc balayer les paires. Avec 4 projets, il y a 6
                  paires — pour chacune, on regarde si l'un des deux fait au moins aussi bien pour{" "}
                  <em>tous</em> les habitants. Dès qu'un habitant préfère X et un autre préfère Y,
                  la paire est <em>incomparable</em> au sens de Pareto et on passe à la suivante.
                </p>
                <p>La seule paire où tout va dans le même sens est A contre C :</p>
                <MB tex="u_1(C) = 6 \ge 6 = u_1(A), \qquad u_2(C) = 3 \ge 3 = u_2(A), \qquad u_3(C) = 7 > 5 = u_3(A)." />
                <p>
                  Personne ne perd au passage de A à C et l'habitant 3 gagne strictement :{" "}
                  <strong>A est dominé par C</strong>.
                </p>
                <SvgProfilsProjets />
                <p>Toutes les autres paires font au moins un gagnant et un perdant :</p>
                <MB tex="\text{B vs D : } u_1(D) = 5 > 4 = u_1(B) \text{ mais } u_2(B) = 5 > 4 = u_2(D)," />
                <p>
                  donc B et D sont incomparables — et de même pour A–B, A–D, B–C et C–D (vérifie-le
                  : à chaque fois, l'habitant 1 et l'habitant 2 tirent dans des directions
                  opposées). Aucune autre domination n'existe.
                </p>
                <Callout variant="methode">
                  <p>
                    Pour tester « X domine-t-il Y ? », parcours les habitants <em>ligne par ligne</em>{" "}
                    : il faut <M tex="u_i(X) \ge u_i(Y)" /> pour tous, avec au moins une inégalité
                    stricte. Un <strong>seul</strong> habitant strictement perdant suffit à casser
                    la domination — inutile de continuer la colonne.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 b) — En déduire l'ensemble des projets efficaces",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi c'est presque fini :</strong> un projet est efficace s'il n'est
                  dominé par <em>aucun</em> autre. On vient d'établir la liste complète des
                  dominations : il n'y en a qu'une seule (A dominé par C). Donc :
                </p>
                <MB tex="\text{Projets efficaces} = \{\text{B, C, D}\}, \qquad \text{seul A n'est pas efficace.}" />
                <Callout variant="attention">
                  <p>
                    Le piège classique de ce genre de tableau : <strong>D est efficace</strong>{" "}
                    alors qu'il n'est « le meilleur » pour <em>personne</em> (aucun habitant ne le
                    classe premier). Peu importe : pour être efficace, il suffit qu'aucun projet ne
                    fasse au moins aussi bien pour <em>tous</em> les habitants à la fois. Et
                    n'oublie pas que le critère de Pareto <em>ne classe pas</em> B, C et D entre
                    eux : « efficace » ne veut dire ni « optimal socialement », ni « qui maximise
                    la somme des utilités ».
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.4 — Défendre la théorie rationnelle : deux arguments parmi trois",
            refs: [
              { chapter: "a1", section: "vs" },
              { chapter: "a1", section: "comporte" },
            ],
            content: (
              <>
                <p>
                  L'ami commet un raccourci : « la théorie est violée en labo, donc il faut la
                  jeter ». Le cours donne <strong>trois</strong> raisons de la conserver — il en
                  faut deux, <em>développées</em> :
                </p>
                <p>
                  <strong>1. Un guide normatif (benchmark).</strong> La théorie rationnelle décrit
                  ce qu'un décideur <em>devrait</em> faire pour servir au mieux ses propres
                  objectifs. Connaître ses biais, c'est justement pouvoir s'en protéger en revenant
                  aux principes rationnels : la théorie reste la référence à viser, même si les
                  humains s'en écartent.
                </p>
                <p>
                  <strong>2. Le point de comparaison indispensable.</strong> Les biais
                  comportementaux se définissent précisément comme des <em>déviations par rapport
                  à</em> la théorie rationnelle. Sans ce point de référence, on ne pourrait ni les
                  identifier, ni les mesurer : la théorie comportementale a <em>besoin</em> de la
                  théorie rationnelle pour exister. (Tu viens d'ailleurs de l'utiliser en 1.2 : la
                  déviation se mesure par rapport à la prédiction DAP = DAA !)
                </p>
                <p>
                  <strong>3. Une bonne approximation.</strong> Dans les décisions familières,
                  répétées ou à enjeux importants, les comportements observés restent très proches
                  des prédictions rationnelles : le modèle rationnel demeure une bonne première
                  approximation de la réalité.
                </p>
                <Callout variant="examen">
                  <p>
                    Barème : 5 pts par argument correct <em>et développé</em> — un simple mot-clé
                    (« benchmark ! ») ne rapporte que 2 pts. Écris deux ou trois phrases par
                    argument, et n'en donne que deux si l'énoncé en demande deux : le troisième ne
                    rapporte rien et te coûte du temps.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <ul>
              <li>
                <strong>1.1</strong> — Par exemple <M tex="(3;\, 3;\, 2)" /> : elle domine{" "}
                <M tex="(2;\, 3;\, 2)" /> (le collègue 1 gagne, personne ne perd) et n'est pas
                efficace (8 parts distribuées sur 9 ; dominée par <M tex="(4;\, 3;\, 2)" />).
              </li>
              <li>
                <strong>1.2</strong> — La théorie rationnelle prédit DAP = DAA (randomisation →
                mêmes préférences moyennes) ; observer 8 contre 4 euros est une déviation :
                c'est <strong>l'effet de dotation</strong>.
              </li>
              <li>
                <strong>1.3</strong> — a) A est dominé par C (6 ≥ 6, 3 ≥ 3, 7 &gt; 5) ; aucune
                autre domination. b) Efficaces : <strong>B, C et D</strong>.
              </li>
              <li>
                <strong>1.4</strong> — Deux arguments parmi : guide normatif, point de comparaison
                pour définir les biais, bonne approximation dans les décisions familières.
              </li>
            </ul>
            <p className="mt-2">
              <strong>À retenir :</strong> « X domine Y » = personne ne perd, quelqu'un gagne ;
              « efficace » = dominé par personne — deux définitions à réciter <em>puis</em> à
              vérifier inégalité par inégalité sur les données.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList refs={[{ session: 1, exercise: "ex1" }]} className="mt-1.5" />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 2 — Décision sous incertitude : assurance            */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-1"
        id="q2"
        number={2}
        title="Question 2 — Vol de vélo cargo : VMA, utilité espérée et assurance (40 pts)"
        difficulty={2}
        refs={[
          { chapter: "a3", section: "s2" },
          { chapter: "a3", section: "s4" },
          { chapter: "a3", section: "s6" },
          { chapter: "a3", section: "s9" },
        ]}
        statement={
          <>
            <p>
              Une livreuse indépendante rationnelle possède <strong>10 000 euros</strong> d'actifs :
              3 600 euros sur un compte d'épargne et un vélo cargo électrique d'une valeur de 6 400
              euros. Sa fonction d'utilité de Bernoulli est
            </p>
            <MB tex="u(w) = \sqrt{w} \qquad \text{où } w \text{ est un montant en euros.}" />
            <p>
              Au cours de l'année à venir, le vélo cargo a une probabilité <M tex="\tfrac{1}{4}" />{" "}
              d'être volé (et donc une probabilité <M tex="\tfrac{3}{4}" /> de ne pas l'être). En
              cas de vol, le vélo est entièrement perdu.
            </p>
            <SubQuestion label="2.1">
              En l'absence d'assurance, calcule la valeur monétaire attendue (VMA) des actifs de la
              livreuse. (6 points)
            </SubQuestion>
            <SubQuestion label="2.2">
              En l'absence d'assurance, calcule son utilité espérée. (8 points)
            </SubQuestion>
            <SubQuestion label="2.3">
              Calcule l'équivalent certain de ses actifs ainsi que sa prime de risque (minimale).
              Interprète brièvement ces deux valeurs. (10 points)
            </SubQuestion>
            <SubQuestion label="2.4">
              Une compagnie d'assurance propose de couvrir le vol du vélo au tarif de 0,25 euro par
              euro couvert. Ce tarif est-il actuariellement juste ? Détermine la couverture
              optimale <M tex="C^* \in [0;\, 6\,400]" /> choisie par la livreuse ainsi que sa
              richesse finale dans chacun des deux scénarios (vol / pas de vol). Détaille ton
              raisonnement. (10 points)
            </SubQuestion>
            <SubQuestion label="2.5">
              Sans refaire de calcul complet : si le tarif passait à 0,32 euro par euro couvert, la
              couverture optimale serait-elle complète, partielle ou nulle ? Justifie à l'aide de
              la condition de premier ordre ou d'un résultat du cours. (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé",
            refs: [
              { chapter: "a3", section: "s2" },
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s9" },
            ],
            content: (
              <>
                <p>
                  Tous les signaux du chapitre A3 sont là : une <em>fonction d'utilité de
                  Bernoulli</em> <M tex="u(w) = \sqrt{w}" /> (concave → aversion au risque), une{" "}
                  <em>probabilité</em> de sinistre, puis les mots-clés « VMA », « utilité
                  espérée », « équivalent certain », « prime de risque » et « couverture » —
                  exactement la chaîne d'outils des sections s2 à s9.
                </p>
                <p>
                  La question déroule la <strong>chaîne standard</strong> du cours, dans l'ordre :
                </p>
                <ul>
                  <li>
                    poser la <strong>loterie</strong> (les deux états du monde et leurs richesses) ;
                  </li>
                  <li>
                    2.1 : <strong>VMA</strong> = espérance des richesses ;
                  </li>
                  <li>
                    2.2 : <strong>utilité espérée</strong> = espérance des <em>utilités</em> ;
                  </li>
                  <li>
                    2.3 : <strong>EC</strong> (inverser <M tex="u" />) puis{" "}
                    <strong>prime de risque</strong> = VMA − EC ;
                  </li>
                  <li>
                    2.4–2.5 : <strong>assurance</strong> — richesses d'état avec prime et
                    indemnité, condition de premier ordre, théorème « prix juste → couverture
                    complète ».
                  </li>
                </ul>
                <Callout variant="methode">
                  <p>
                    Cette chaîne « loterie → VMA → UE → EC → PRM → assurance » tombe à presque
                    chaque examen de la partie A3. Automatise-la : chaque maillon utilise le
                    résultat du précédent, donc une erreur en 2.1 se propage — vérifie tes
                    premières valeurs avec soin.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Poser la loterie : deux états du monde, deux richesses finales",
            refs: [
              { chapter: "a3", section: "s2" },
              { chapter: "a3", section: "s3" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi commencer ici ?</strong> Toutes les formules du chapitre
                  s'appliquent à une loterie « richesse finale × probabilité ». On fige donc
                  d'abord le tableau des états :
                </p>
                <MB tex="\begin{array}{lcc} & \text{probabilité} & \text{richesse finale} \\ \hline \text{pas de vol} & \tfrac{3}{4} & 10\,000 \\ \text{vol} & \tfrac{1}{4} & 10\,000 - 6\,400 = 3\,600 \end{array}" />
                <p>
                  En cas de vol, la livreuse perd le vélo (6 400 euros) mais conserve son épargne :
                  sa richesse ne tombe pas à zéro, elle tombe à 3 600 euros.
                </p>
                <Callout variant="attention">
                  <p>
                    Piège n° 1 de ce type d'énoncé : raisonner en <em>pertes</em> (« −6 400 ») au
                    lieu de raisonner en <strong>richesse finale totale</strong>. La fonction{" "}
                    <M tex="u(w) = \sqrt{w}" /> s'applique à la richesse totale — si tu écris{" "}
                    <M tex="\sqrt{-6\,400}" />, c'est le signe que tu as posé la mauvaise loterie.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.1 — Calculer la VMA : l'espérance des richesses",
            refs: [{ chapter: "a3", section: "s2" }],
            content: (
              <>
                <p>
                  La valeur monétaire attendue est la moyenne des richesses finales, pondérée par
                  les probabilités :
                </p>
                <MB tex="\mathrm{VMA} = \tfrac{3}{4} \times 10\,000 + \tfrac{1}{4} \times 3\,600." />
                <p>On calcule chaque terme :</p>
                <MB tex="\tfrac{3}{4} \times 10\,000 = 7\,500, \qquad \tfrac{1}{4} \times 3\,600 = 900," />
                <p>puis on additionne :</p>
                <MB tex="\mathrm{VMA} = 7\,500 + 900 = 8\,400 \text{ euros.}" />
                <p>
                  <em>Interprétation :</em> si la livreuse revivait cette année un très grand
                  nombre de fois, sa richesse moyenne serait de 8 400 euros. C'est la valeur de
                  référence d'un décideur <em>neutre au risque</em> — pas encore celle de notre
                  livreuse averse au risque.
                </p>
              </>
            ),
          },
          {
            title: "2.2 — Calculer l'utilité espérée : u d'abord, espérance ensuite",
            refs: [
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s5" },
            ],
            content: (
              <>
                <p>
                  L'utilité espérée de von Neumann–Morgenstern applique <M tex="u" /> à la richesse
                  de <em>chaque scénario</em>, puis prend l'espérance :
                </p>
                <MB tex="U = \tfrac{3}{4}\, u(10\,000) + \tfrac{1}{4}\, u(3\,600) = \tfrac{3}{4}\sqrt{10\,000} + \tfrac{1}{4}\sqrt{3\,600}." />
                <p>Les deux racines sont exactes (c'est voulu par l'énoncé) :</p>
                <MB tex="\sqrt{10\,000} = 100, \qquad \sqrt{3\,600} = 60." />
                <p>D'où :</p>
                <MB tex="U = \tfrac{3}{4} \times 100 + \tfrac{1}{4} \times 60 = 75 + 15 = 90." />
                <Callout variant="attention">
                  <p>
                    Le piège classique (et le plus coûteux du chapitre) : calculer{" "}
                    <M tex="u(\mathrm{VMA}) = \sqrt{8\,400} \approx 91{,}65" /> et l'appeler
                    « utilité espérée ». C'est l'inverse ! On prend l'espérance <em>des utilités</em>,
                    pas l'utilité <em>de l'espérance</em>. Ici{" "}
                    <M tex="u(\mathrm{VMA}) \approx 91{,}65 > 90 = U" /> : cet écart n'est pas une
                    erreur, c'est l'inégalité de Jensen — la marque d'une fonction concave, donc
                    d'une livreuse <strong>averse au risque</strong>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 — Inverser u pour l'équivalent certain, puis soustraire pour la prime",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette étape ?</strong> L'utilité espérée « 90 » n'a pas d'unité
                  parlante. L'équivalent certain la reconvertit en euros : c'est le montant sûr qui
                  procure exactement la même utilité que la loterie.
                </p>
                <FormulaBox
                  label="Définition — équivalent certain"
                  tex="u(EC) = U \iff EC = u^{-1}(U)"
                  caption={
                    <>
                      Le montant certain qui rend le décideur indifférent avec la situation
                      risquée. Avec <M tex="u(w) = \sqrt{w}" />, inverser revient à élever au
                      carré.
                    </>
                  }
                />
                <p>On résout :</p>
                <MB tex="\sqrt{EC} = 90 \iff EC = 90^2 = 8\,100 \text{ euros.}" />
                <p>
                  La prime de risque (minimale) est l'écart entre la valeur moyenne de la loterie
                  et ce que la livreuse est prête à accepter à coup sûr :
                </p>
                <MB tex="\mathrm{PRM} = \mathrm{VMA} - EC = 8\,400 - 8\,100 = 300 \text{ euros.}" />
                <SvgUtiliteConcave />
                <p>
                  <em>Interprétation :</em> la livreuse est indifférente entre sa situation risquée
                  et recevoir <strong>8 100 euros à coup sûr</strong> — le risque de vol lui
                  « coûte » l'équivalent de 300 euros de richesse sûre. C'est aussi le montant
                  maximal qu'elle accepterait de sacrifier, en plus du coût attendu du sinistre,
                  pour être débarrassée du risque : exactement la marge qu'un assureur peut capter.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème récompense trois choses distinctes : la <em>définition</em> (poser{" "}
                    <M tex="u(EC) = U" />), la <em>valeur</em> (8 100 puis 300) et{" "}
                    l'<em>interprétation</em> en une ou deux phrases. Écris les trois
                    systématiquement — l'interprétation vaut ici 3 points sur 10.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.4 — Vérifier que le tarif est actuariellement juste, poser les richesses d'état",
            refs: [{ chapter: "a3", section: "s9" }],
            content: (
              <>
                <p>
                  <strong>Prix juste ?</strong> Un tarif est actuariellement juste s'il est égal au
                  coût attendu d'un euro de couverture pour l'assureur. Ici, un euro couvert coûte
                  1 euro avec probabilité 1/4 (vol) et 0 euro sinon :
                </p>
                <MB tex="\text{coût attendu} = \tfrac{1}{4} \times 1 = 0{,}25 \text{ euro} = \text{tarif.}" />
                <p>
                  Le tarif est exactement égal à la probabilité du sinistre : il est{" "}
                  <strong>actuariellement juste</strong>.
                </p>
                <p>
                  <strong>Richesses d'état.</strong> Si la livreuse couvre <M tex="C" /> euros,
                  elle paie la prime <M tex="0{,}25\,C" /> <em>dans tous les cas</em> et touche
                  l'indemnité <M tex="C" /> <em>seulement</em> en cas de vol :
                </p>
                <MB tex="y = 10\,000 - 0{,}25\,C \quad \text{(pas de vol)}," />
                <MB tex="x = 3\,600 - 0{,}25\,C + C = 3\,600 + 0{,}75\,C \quad \text{(vol).}" />
                <p>
                  Chaque euro de couverture <em>transfère</em> donc de la richesse de l'état « pas
                  de vol » (−0,25) vers l'état « vol » (+0,75) : l'assurance est une machine à
                  déplacer de la richesse entre états du monde.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux oublis fréquents dans les richesses d'état : (i) la prime se paie{" "}
                    <strong>aussi quand rien ne se passe</strong> — elle apparaît dans les deux
                    états ; (ii) en cas de vol, la livreuse touche l'indemnité <M tex="C" />{" "}
                    <em>et</em> paie la prime, d'où le coefficient net <M tex="+0{,}75" />.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.4 — Écrire la condition de premier ordre et en déduire C* = 6 400",
            refs: [
              { chapter: "a3", section: "s9" },
              { chapter: "a3", section: "s5" },
            ],
            content: (
              <>
                <p>La livreuse choisit <M tex="C" /> pour maximiser son utilité espérée :</p>
                <MB tex="U(C) = \tfrac{3}{4}\, u\big(y\big) + \tfrac{1}{4}\, u\big(x\big) = \tfrac{3}{4}\, u\big(10\,000 - 0{,}25\,C\big) + \tfrac{1}{4}\, u\big(3\,600 + 0{,}75\,C\big)." />
                <p>
                  On dérive par rapport à <M tex="C" /> (règle de la chaîne :{" "}
                  <M tex="y" /> varie de <M tex="-0{,}25" /> et <M tex="x" /> de{" "}
                  <M tex="+0{,}75" /> par euro couvert) et on annule :
                </p>
                <MB tex="U'(C) = \tfrac{3}{4} \times (-0{,}25) \times u'(y) + \tfrac{1}{4} \times 0{,}75 \times u'(x) = 0." />
                <p>On fait passer le terme négatif de l'autre côté :</p>
                <MB tex="\tfrac{1}{4} \times 0{,}75 \times u'(x) = \tfrac{3}{4} \times 0{,}25 \times u'(y)." />
                <p>
                  Les deux coefficients valent <M tex="0{,}1875" /> : ils se simplifient
                  exactement, et il reste
                </p>
                <MB tex="u'(x) = u'(y)." />
                <p>
                  Comme <M tex="u" /> est strictement concave, <M tex="u'" /> est strictement
                  décroissante : <M tex="u'(x) = u'(y)" /> impose <M tex="x = y" />. Au prix juste,
                  la livreuse égalise ses richesses dans les deux états — elle s'assure{" "}
                  <strong>complètement</strong> (c'est le théorème du cours). On résout :
                </p>
                <MB tex="3\,600 + 0{,}75\,C = 10\,000 - 0{,}25\,C" />
                <p>
                  soit, en regroupant les <M tex="C" /> à gauche (<M tex="0{,}75 + 0{,}25 = 1" />) :
                </p>
                <MB tex="C^* = 6\,400 \text{ euros} = L \quad \text{(couverture complète de la perte).}" />
                <Callout variant="methode">
                  <p>
                    Retiens le raccourci : <strong>prime actuariellement juste → couverture
                    complète</strong> pour tout agent averse au risque. Tu peux invoquer ce
                    théorème directement… mais quand l'énoncé dit « détaille ton raisonnement »,
                    montre la CPO comme ci-dessus : c'est elle qui rapporte les points.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.4 — Calculer les richesses finales et vérifier que l'assurance vaut le coup",
            refs: [
              { chapter: "a3", section: "s9" },
              { chapter: "a3", section: "s6" },
            ],
            content: (
              <>
                <p>Avec <M tex="C^* = 6\,400" />, la prime totale vaut :</p>
                <MB tex="0{,}25 \times 6\,400 = 1\,600 \text{ euros.}" />
                <p>Richesse finale dans chaque scénario :</p>
                <MB tex="\text{pas de vol : } 10\,000 - 1\,600 = 8\,400 \text{ euros,}" />
                <MB tex="\text{vol : } 3\,600 - 1\,600 + 6\,400 = 8\,400 \text{ euros.}" />
                <p>
                  La richesse est <strong>identique dans les deux états</strong> : le risque a
                  disparu. Deux vérifications élégantes (et payantes en points) :
                </p>
                <ul>
                  <li>
                    8 400 euros, c'est exactement la <strong>VMA de la question 2.1</strong> :
                    l'assurance au prix juste ne change pas la valeur attendue des actifs, elle en
                    supprime seulement le risque ;
                  </li>
                  <li>
                    l'utilité passe de <M tex="U = 90" /> à{" "}
                    <M tex="\sqrt{8\,400} \approx 91{,}65 > 90" /> : la livreuse gagne bien à
                    s'assurer — l'équivalent de <M tex="8\,400 - 8\,100 = 300" /> euros sûrs, sa
                    prime de risque.
                  </li>
                </ul>
                <Callout variant="intuition">
                  <p>
                    Au prix juste, s'assurer revient à échanger une loterie contre sa propre
                    moyenne. Pour un agent averse au risque, cet échange est toujours gagnant : il
                    récupère exactement sa prime de risque en bien-être. C'est tout le modèle
                    économique de l'assurance.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.5 — Tarif à 0,32 : prédire « partielle » avec la CPO, sans tout recalculer",
            refs: [{ chapter: "a3", section: "s9" }],
            content: (
              <>
                <p>
                  À 0,32 euro par euro couvert, le tarif est <em>au-dessus</em> du prix juste
                  (0,25) : chaque euro couvert réduit désormais la VMA des actifs. La CPO générale
                  avec un tarif <M tex="p" /> et une probabilité de sinistre <M tex="\pi" />{" "}
                  s'écrit :
                </p>
                <MB tex="\pi\,(1-p)\, u'(x) = (1-\pi)\, p\, u'(y)." />
                <p>Avec <M tex="p = 0{,}32" /> et <M tex="\pi = 0{,}25" /> :</p>
                <MB tex="0{,}25 \times 0{,}68 \times u'(x) = 0{,}75 \times 0{,}32 \times u'(y) \iff 0{,}17\, u'(x) = 0{,}24\, u'(y)." />
                <p>
                  Donc <M tex="u'(x) = \tfrac{0{,}24}{0{,}17}\, u'(y) > u'(y)" />. Comme{" "}
                  <M tex="u'" /> est strictement décroissante, cela impose <M tex="x < y" /> : il{" "}
                  <em>reste du risque</em> à l'optimum. La couverture n'est ni complète ni nulle :
                </p>
                <MB tex="0 < C^{**} < 6\,400 \text{ euros : couverture \textbf{partielle}.}" />
                <p>
                  C'est le repère du cours : <strong>prime juste → couverture complète ; prime
                  plus chère que juste → couverture partielle</strong>. Averse au risque, la
                  livreuse accepte de payer un peu de VMA pour réduire le risque — mais plus le
                  tarif s'écarte du juste, moins elle couvre.
                </p>
                <Callout variant="examen">
                  <p>
                    « Sans refaire de calcul complet » est une consigne, pas un piège : le
                    correcteur attend soit la CPO qualitative (comme ci-dessus), soit le théorème
                    du cours correctement cité. Refaire toute l'optimisation te coûte dix minutes
                    pour 6 points — et répondre « nulle » parce que « c'est trop cher » est
                    l'erreur type : tant que le tarif reste inférieur à 1, un peu d'assurance vaut
                    toujours mieux que rien pour un agent suffisamment averse au risque.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <ul>
              <li>
                <strong>2.1</strong> — <M tex="\mathrm{VMA} = 8\,400" /> euros.
              </li>
              <li>
                <strong>2.2</strong> — <M tex="U = \tfrac{3}{4} \times 100 + \tfrac{1}{4} \times 60 = 90" />.
              </li>
              <li>
                <strong>2.3</strong> — <M tex="EC = 8\,100" /> euros ;{" "}
                <M tex="\mathrm{PRM} = 300" /> euros.
              </li>
              <li>
                <strong>2.4</strong> — Tarif actuariellement juste (0,25 = 1/4) ;{" "}
                <M tex="C^* = 6\,400" /> euros (couverture complète) ; richesse finale de{" "}
                <strong>8 400 euros dans les deux scénarios</strong>.
              </li>
              <li>
                <strong>2.5</strong> — À 0,32 &gt; 0,25 : couverture <strong>partielle</strong>{" "}
                (<M tex="u'(x) > u'(y) \Rightarrow x < y" />).
              </li>
            </ul>
            <p className="mt-2">
              <strong>À retenir :</strong> utilité espérée = espérance <em>des utilités</em> ;
              l'équivalent certain s'obtient en inversant <M tex="u" /> ; et au prix
              actuariellement juste, un agent averse au risque s'assure toujours complètement.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 1, exercise: "ex5" },
                { session: 1, exercise: "ex7" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 3 — Jeux simultanés : 3×3 puis mixte 2×2             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-1"
        id="q3"
        number={3}
        title="Question 3 — Emplacements de magasins et cybersécurité : dominance, PSS, Nash pur et mixte (50 pts)"
        difficulty={3}
        refs={[
          { chapter: "b1", section: "s3" },
          { chapter: "b1", section: "s4" },
          { chapter: "b1", section: "s5" },
          { chapter: "b1", section: "s8" },
        ]}
        statement={
          <>
            <p>
              Deux chaînes de magasins d'articles de sport, <strong>Athlex</strong> (joueur 1) et{" "}
              <strong>Boréal</strong> (joueur 2), veulent chacune ouvrir un magasin unique dans une
              ville moyenne. Trois emplacements sont possibles : le Centre-ville (C), le quartier
              de la Gare (G) et la Périphérie (P). Les deux enseignes choisissent leur emplacement{" "}
              <em>simultanément</em>. La matrice donne les profits mensuels (en milliers d'euros) ;
              dans chaque cellule, le premier nombre est le profit d'Athlex, le second celui de
              Boréal.
            </p>
            <PayoffMatrix
              rowPlayer="Athlex"
              colPlayer="Boréal"
              rows={["C", "G", "P"]}
              cols={["C", "G", "P"]}
              payoffs={[
                [
                  [30, 30],
                  [60, 40],
                  [60, 35],
                ],
                [
                  [40, 60],
                  [20, 20],
                  [40, 15],
                ],
                [
                  [20, 55],
                  [25, 35],
                  [70, 10],
                ],
              ]}
              interactive
              caption={
                <>
                  Le jeu des emplacements. Explore : révèle les meilleures réponses de chaque
                  enseigne, puis les équilibres de Nash — avant de dérouler les étapes.
                </>
              }
            />
            <SubQuestion label="3.1">
              Dans ce jeu, quelle stratégie est dominée ? Par quelle stratégie est-elle dominée ?
              Explique. (8 points)
            </SubQuestion>
            <SubQuestion label="3.2">
              Identifie tous les PSS de ce jeu en appliquant l'élimination itérative des stratégies
              dominées. Détaille chaque étape. (12 points)
            </SubQuestion>
            <SubQuestion label="3.3">
              Identifie tous les équilibres de Nash en stratégies pures. Détaille ta méthode. (10
              points)
            </SubQuestion>
            <p>
              Considère maintenant le jeu suivant, <em>indépendant du précédent</em>. Chaque nuit,
              un pirate informatique choisit d'attaquer l'un des deux serveurs d'une banque : le
              serveur A ou le serveur B. Simultanément, la responsable de la sécurité choisit
              lequel des deux serveurs elle surveille cette nuit-là. Si le pirate attaque le
              serveur surveillé, il est repéré et bloqué ; sinon, son attaque réussit. Le premier
              nombre est le payoff du pirate, le second celui de la responsable.
            </p>
            <PayoffMatrix
              rowPlayer="Pirate"
              colPlayer="Responsable"
              rows={["Attaquer A", "Attaquer B"]}
              cols={["Surveiller A", "Surveiller B"]}
              payoffs={[
                [
                  [10, 90],
                  [70, 30],
                ],
                [
                  [70, 10],
                  [30, 100],
                ],
              ]}
              interactive
              caption={
                <>
                  Le jeu de surveillance. Essaie le bouton « Équilibre(s) de Nash » : tu verras
                  qu'aucune cellule ne tient en stratégies pures…
                </>
              }
            />
            <SubQuestion label="3.4">
              Montre d'abord que ce jeu n'admet aucun équilibre de Nash en stratégies pures.
              Calcule ensuite l'équilibre de Nash en stratégies mixtes : la probabilité{" "}
              <M tex="p^*" /> avec laquelle le pirate attaque le serveur A et la probabilité{" "}
              <M tex="q^*" /> avec laquelle la responsable surveille le serveur A. Détaille ton
              raisonnement. (14 points)
            </SubQuestion>
            <SubQuestion label="3.5">
              Calcule le payoff espéré de chaque joueur à cet équilibre. (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b1", section: "s5" },
              { chapter: "b1", section: "s8" },
            ],
            content: (
              <>
                <p>
                  Deux jeux <strong>indépendants</strong>, qui couvrent à eux deux tout le chapitre
                  B1 :
                </p>
                <ul>
                  <li>
                    <strong>Jeu 1 (3.1–3.3)</strong> : un 3×3 sur lequel on déroule la trilogie du
                    cours — stratégie <em>dominée</em> (s3), <em>élimination itérative</em> → PSS
                    (s4), <em>équilibres de Nash purs</em> par les meilleures réponses (s5). Les
                    verbes de l'énoncé (« quelle stratégie est dominée », « en appliquant
                    l'élimination itérative », « détaille ta méthode ») t'imposent la méthode : pas
                    le choix des outils, seulement de la rigueur.
                  </li>
                  <li>
                    <strong>Jeu 2 (3.4–3.5)</strong> : un 2×2 de pure « anti-coordination »
                    (gardien contre tireur). « Montre qu'il n'y a aucun EN pur puis calcule
                    l'équilibre mixte » = propriété d'indifférence de la section s8.
                  </li>
                </ul>
                <Callout variant="methode">
                  <p>
                    Réflexe systématique sur <em>toute</em> matrice : souligne les meilleures
                    réponses (au brouillon) dès la lecture. Ça te donne 3.3 et la première moitié
                    de 3.4 immédiatement, et ça te sert de garde-fou pour 3.1–3.2 : une stratégie
                    strictement dominée n'est <em>jamais</em> une meilleure réponse.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.1 — Passer les stratégies au crible pour trouver la dominée",
            refs: [{ chapter: "b1", section: "s3" }],
            content: (
              <>
                <p>
                  <strong>Comment chercher sans rien oublier ?</strong> Pour Boréal (joueuse
                  colonne), on compare ses colonnes deux à deux en figeant chaque ligne d'Athlex et
                  en ne lisant que les <em>seconds</em> nombres. Compare G et P :
                </p>
                <MB tex="u_B(\mathrm{C},\mathrm{G}) = 40 > 35 = u_B(\mathrm{C},\mathrm{P})," />
                <MB tex="u_B(\mathrm{G},\mathrm{G}) = 20 > 15 = u_B(\mathrm{G},\mathrm{P})," />
                <MB tex="u_B(\mathrm{P},\mathrm{G}) = 35 > 10 = u_B(\mathrm{P},\mathrm{P})." />
                <p>
                  Trois inégalités strictes sur trois : <strong>la stratégie P (Périphérie) de
                  Boréal est strictement dominée par sa stratégie G (Gare)</strong>. Quelle que
                  soit la décision d'Athlex, Boréal gagne strictement plus à la Gare qu'en
                  Périphérie.
                </p>
                <p>Deux vérifications qui montrent au correcteur que tu maîtrises la définition :</p>
                <ul>
                  <li>
                    P n'est <em>pas</em> dominée par C : dans la ligne C,{" "}
                    <M tex="u_B(\mathrm{C},\mathrm{P}) = 35 > 30 = u_B(\mathrm{C},\mathrm{C})" /> —
                    il faut donc bien nommer G comme stratégie dominante ;
                  </li>
                  <li>
                    côté Athlex, aucune stratégie n'est dominée dans le jeu complet : sa ligne P
                    rapporte 70 contre la colonne P, ce qu'aucune autre ligne ne fait.
                  </li>
                </ul>
                <Callout variant="attention">
                  <p>
                    « Dominée » exige qu'une <em>même</em> stratégie fasse strictement mieux contre{" "}
                    <em>toutes</em> les stratégies adverses. Vérifie les trois lignes, et précise
                    toujours <em>par quoi</em> la stratégie est dominée : le barème (4 + 4)
                    récompense l'identification <em>et</em> les trois inégalités.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.2 — Étape 1 de l'élimination : Boréal rationnelle ne joue jamais P",
            refs: [{ chapter: "b1", section: "s4" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi on a le droit d'éliminer :</strong> par l'hypothèse de
                  rationalité (H1), Boréal ne joue jamais une stratégie strictement dominée. La
                  colonne P peut donc être rayée du jeu — elle n'arrivera jamais. Le jeu réduit :
                </p>
                <PayoffMatrix
                  rowPlayer="Athlex"
                  colPlayer="Boréal"
                  rows={["C", "G", "P"]}
                  cols={["C", "G"]}
                  payoffs={[
                    [
                      [30, 30],
                      [60, 40],
                    ],
                    [
                      [40, 60],
                      [20, 20],
                    ],
                    [
                      [20, 55],
                      [25, 35],
                    ],
                  ]}
                  caption={<>Jeu réduit après élimination de la colonne P de Boréal.</>}
                />
                <p>
                  On repart ensuite à la chasse aux stratégies dominées <em>dans ce jeu réduit</em>
                  — c'est ça, le côté « itératif ».
                </p>
              </>
            ),
          },
          {
            title: "3.2 — Étape 2 : dans le jeu réduit, la ligne P d'Athlex tombe à son tour",
            refs: [{ chapter: "b1", section: "s4" }],
            content: (
              <>
                <p>
                  Dans le jeu réduit, compare les lignes C et P d'Athlex (premiers nombres
                  uniquement) :
                </p>
                <MB tex="u_A(\mathrm{C},\mathrm{C}) = 30 > 20 = u_A(\mathrm{P},\mathrm{C}), \qquad u_A(\mathrm{C},\mathrm{G}) = 60 > 25 = u_A(\mathrm{P},\mathrm{G})." />
                <p>
                  <strong>P d'Athlex est strictement dominée par C</strong> dans le jeu réduit.
                  Justification à écrire noir sur blanc : Athlex sait que Boréal est rationnelle,
                  donc qu'elle ne jouera pas P (hypothèse H2 — la rationalité est connaissance
                  commune) ; dans le monde restant, P ne sert plus à rien. On élimine la ligne P :
                </p>
                <PayoffMatrix
                  rowPlayer="Athlex"
                  colPlayer="Boréal"
                  rows={["C", "G"]}
                  cols={["C", "G"]}
                  payoffs={[
                    [
                      [30, 30],
                      [60, 40],
                    ],
                    [
                      [40, 60],
                      [20, 20],
                    ],
                  ]}
                  showBestResponses
                  caption={
                    <>
                      Jeu réduit final (meilleures réponses soulignées) : plus aucune stratégie
                      n'est dominée.
                    </>
                  }
                />
                <p>
                  <strong>Étape 3 — constat d'arrêt.</strong> Pour Athlex, C est meilleure contre G
                  (<M tex="60 > 20" />) mais moins bonne contre C (<M tex="30 < 40" />) ; pour
                  Boréal, C est meilleure contre G (<M tex="60 > 20" />) mais moins bonne contre C
                  (<M tex="30 < 40" />). Plus rien à éliminer : les PSS sont les quatre profils
                  restants,
                </p>
                <MB tex="\text{PSS} = \{(\mathrm{C};\mathrm{C}),\ (\mathrm{C};\mathrm{G}),\ (\mathrm{G};\mathrm{C}),\ (\mathrm{G};\mathrm{G})\}." />
                <Callout variant="attention">
                  <p>
                    Le piège central de l'exercice : la ligne P d'Athlex n'est{" "}
                    <strong>pas dominée dans le jeu complet</strong> (elle rapporte 70 contre la
                    colonne P !). Elle ne le devient qu'<em>après</em> l'élimination de la colonne
                    P de Boréal. Éliminer les deux « P » d'un coup dès la première étape est une
                    erreur de logique — l'ordre des étapes et leur justification (H1, puis H2) font
                    partie de la réponse attendue.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 — Souligner les meilleures réponses sur le jeu complet et lire les EN",
            refs: [
              { chapter: "b1", section: "s5" },
              { chapter: "b1", section: "s6" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi revenir au jeu complet ?</strong> L'équilibre de Nash se définit
                  sur le jeu d'origine — et c'est la méthode que le correcteur veut voir. Pour
                  chaque colonne de Boréal, on repère la meilleure réponse d'Athlex (premier
                  nombre) ; pour chaque ligne d'Athlex, celle de Boréal (second nombre) :
                </p>
                <MB tex="\text{Athlex : contre C} \to \mathrm{G}\ (40), \quad \text{contre G} \to \mathrm{C}\ (60), \quad \text{contre P} \to \mathrm{P}\ (70)." />
                <MB tex="\text{Boréal : contre C} \to \mathrm{G}\ (40), \quad \text{contre G} \to \mathrm{C}\ (60), \quad \text{contre P} \to \mathrm{C}\ (55)." />
                <PayoffMatrix
                  rowPlayer="Athlex"
                  colPlayer="Boréal"
                  rows={["C", "G", "P"]}
                  cols={["C", "G", "P"]}
                  payoffs={[
                    [
                      [30, 30],
                      [60, 40],
                      [60, 35],
                    ],
                    [
                      [40, 60],
                      [20, 20],
                      [40, 15],
                    ],
                    [
                      [20, 55],
                      [25, 35],
                      [70, 10],
                    ],
                  ]}
                  showBestResponses
                  highlight={[
                    [0, 1],
                    [1, 0],
                  ]}
                  caption={
                    <>
                      Meilleures réponses soulignées ; les deux cellules doublement soulignées sont
                      encadrées : ce sont les équilibres de Nash.
                    </>
                  }
                />
                <p>
                  Un équilibre de Nash est une cellule où <em>les deux</em> payoffs sont soulignés
                  — chacun joue une meilleure réponse à la stratégie de l'autre. Il y en a
                  exactement deux :
                </p>
                <MB tex="(\mathrm{C};\mathrm{G}) \text{ avec } (60;\, 40) \qquad \text{et} \qquad (\mathrm{G};\mathrm{C}) \text{ avec } (40;\, 60)." />
                <p>
                  Remarque le « presque-équilibre » (P ; P) : Athlex adorerait la Périphérie si
                  Boréal y allait (70 !)… mais Boréal, elle, dévierait vers C (55 &gt; 10). Une
                  seule flèche de déviation suffit à tuer une cellule.
                </p>
                <Callout variant="examen">
                  <p>
                    Deux réflexes de barème : (i) énonce la <em>méthode</em> (« meilleures réponses
                    soulignées, cellule doublement soulignée = EN ») avant de donner la liste ; le
                    corrigé retire 2 points par « équilibre fantôme » ; (ii) vérifie la cohérence{" "}
                    <M tex="\text{EN} \subseteq \text{PSS}" /> : (C ; G) et (G ; C) figurent bien
                    dans les quatre PSS de 3.2. Si un de tes EN n'est pas un PSS, l'une des deux
                    réponses est fausse.
                  </p>
                </Callout>
                <Callout variant="intuition">
                  <p>
                    Économiquement, c'est un jeu d'<strong>anti-coordination</strong> : les deux
                    enseignes veulent éviter de s'installer au même endroit, et chacune préférerait
                    être celle qui décroche le Centre-ville pendant que l'autre prend la Gare. Les
                    deux EN sont exactement ces deux partages asymétriques.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.4 — Montrer qu'aucune cellule ne tient : pas d'équilibre en stratégies pures",
            refs: [{ chapter: "b1", section: "s5" }],
            content: (
              <>
                <p>
                  Même méthode des meilleures réponses sur le jeu pirate / responsable :
                </p>
                <MB tex="\text{Pirate : contre Surv. A} \to \text{Attaquer B } (70 > 10), \quad \text{contre Surv. B} \to \text{Attaquer A } (70 > 30)." />
                <MB tex="\text{Responsable : contre Att. A} \to \text{Surveiller A } (90 > 30), \quad \text{contre Att. B} \to \text{Surveiller B } (100 > 10)." />
                <PayoffMatrix
                  rowPlayer="Pirate"
                  colPlayer="Responsable"
                  rows={["Attaquer A", "Attaquer B"]}
                  cols={["Surveiller A", "Surveiller B"]}
                  payoffs={[
                    [
                      [10, 90],
                      [70, 30],
                    ],
                    [
                      [70, 10],
                      [30, 100],
                    ],
                  ]}
                  showBestResponses
                  caption={
                    <>
                      Aucune cellule n'a ses deux payoffs soulignés : dans chacune, un joueur veut
                      dévier.
                    </>
                  }
                />
                <p>
                  Dans chacune des quatre cellules, l'un des deux joueurs souhaite dévier — le
                  pirate fuit la surveillance, la responsable la recherche. Le jeu tourne en rond :
                  il n'existe <strong>aucun équilibre de Nash en stratégies pures</strong>. C'est
                  la structure « gardien–tireur » typique : les intérêts sont diamétralement
                  opposés sur la rencontre.
                </p>
                <Callout variant="intuition">
                  <p>
                    Quand aucune cellule ne tient, la seule façon d'être imprévisible… c'est de
                    l'être vraiment : jouer au hasard. Le théorème de Nash garantit qu'un équilibre
                    existe toujours — il faut simplement le chercher en stratégies{" "}
                    <em>mixtes</em>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.4 — Rendre le pirate indifférent : l'équation qui donne q*",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  <strong>Le principe d'indifférence :</strong> à un équilibre mixte, chaque joueur
                  mélange ses deux stratégies pures — il faut donc qu'il soit <em>indifférent</em>{" "}
                  entre elles (sinon il jouerait uniquement la meilleure, et son mélange ne serait
                  pas optimal). C'est donc la stratégie <em>de l'adversaire</em> qui crée cette
                  indifférence.
                </p>
                <p>
                  Soit <M tex="q" /> la probabilité que la responsable surveille A. Le payoff
                  espéré du pirate pour chacune de ses stratégies pures :
                </p>
                <MB tex="E[\text{Attaquer A}] = 10\,q + 70\,(1-q) = 70 - 60\,q," />
                <MB tex="E[\text{Attaquer B}] = 70\,q + 30\,(1-q) = 30 + 40\,q." />
                <p>On égalise (indifférence du pirate) :</p>
                <MB tex="70 - 60\,q = 30 + 40\,q." />
                <p>
                  On regroupe : on ajoute <M tex="60\,q" /> des deux côtés puis on soustrait 30 :
                </p>
                <MB tex="40 = 100\,q \iff q^* = 0{,}4." />
                <p>
                  <em>Interprétation :</em> la responsable surveille le serveur A 4 nuits sur 10 —
                  juste assez pour que le pirate n'ait aucune attaque « évidemment » préférable.
                </p>
              </>
            ),
          },
          {
            title: "3.4 — Rendre la responsable indifférente : l'équation qui donne p*",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  Symétriquement, soit <M tex="p" /> la probabilité que le pirate attaque A. Les
                  payoffs espérés de la responsable :
                </p>
                <MB tex="E[\text{Surveiller A}] = 90\,p + 10\,(1-p) = 10 + 80\,p," />
                <MB tex="E[\text{Surveiller B}] = 30\,p + 100\,(1-p) = 100 - 70\,p." />
                <p>Indifférence de la responsable :</p>
                <MB tex="10 + 80\,p = 100 - 70\,p." />
                <p>On ajoute <M tex="70\,p" /> des deux côtés puis on soustrait 10 :</p>
                <MB tex="150\,p = 90 \iff p^* = \tfrac{90}{150} = 0{,}6." />
                <p>L'unique équilibre de Nash du jeu est donc en stratégies mixtes :</p>
                <MB tex="(p^*;\, q^*) = (0{,}6;\, 0{,}4)" />
                <p>
                  — le pirate attaque A 6 nuits sur 10, la responsable surveille A 4 nuits sur 10.
                </p>
                <SvgReponsesMixtes />
                <Callout variant="attention">
                  <p>
                    Le piège du <strong>chiasme</strong> : l'équation d'indifférence du{" "}
                    <em>pirate</em> ne contient que <M tex="q" /> — elle détermine la stratégie de
                    la <em>responsable</em>, et réciproquement. Si ton équation « côté pirate » te
                    donne <M tex="p" />, tu as égalisé les mauvais payoffs. Vérifie aussi
                    systématiquement que tes probabilités tombent dans <M tex="[0;\,1]" />.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.5 — Calculer les payoffs espérés en exploitant l'indifférence",
            refs: [{ chapter: "b1", section: "s8" }],
            content: (
              <>
                <p>
                  <strong>L'astuce qui fait gagner du temps :</strong> à l'équilibre mixte, chaque
                  joueur est <em>indifférent</em> entre ses deux stratégies pures — son payoff
                  d'équilibre se lit donc sur n'importe laquelle d'entre elles, évaluée contre la
                  stratégie mixte adverse. Inutile de sommer les quatre cellules.
                </p>
                <p>Pirate, via « Attaquer A » contre <M tex="q^* = 0{,}4" /> :</p>
                <MB tex="U_{\text{pirate}} = 10 \times 0{,}4 + 70 \times 0{,}6 = 4 + 42 = 46." />
                <p>Contre-vérification avec « Attaquer B » (doit donner pareil) :</p>
                <MB tex="70 \times 0{,}4 + 30 \times 0{,}6 = 28 + 18 = 46.\ \checkmark" />
                <p>Responsable, via « Surveiller A » contre <M tex="p^* = 0{,}6" /> :</p>
                <MB tex="U_{\text{resp.}} = 90 \times 0{,}6 + 10 \times 0{,}4 = 54 + 4 = 58." />
                <p>Contre-vérification avec « Surveiller B » :</p>
                <MB tex="30 \times 0{,}6 + 100 \times 0{,}4 = 18 + 40 = 58.\ \checkmark" />
                <Callout variant="methode">
                  <p>
                    Cette double évaluation est le <strong>meilleur auto-test du chapitre</strong> :
                    si tes deux stratégies pures ne donnent pas le même payoff espéré contre la
                    stratégie mixte adverse, alors ton <M tex="p^*" /> ou ton <M tex="q^*" /> est
                    faux — tu peux corriger avant de rendre la copie.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <ul>
              <li>
                <strong>3.1</strong> — P (Périphérie) de <strong>Boréal</strong> est strictement
                dominée par G (40 &gt; 35, 20 &gt; 15, 35 &gt; 10).
              </li>
              <li>
                <strong>3.2</strong> — Élimination : colonne P (H1), puis ligne P d'Athlex (H2) ;{" "}
                <M tex="\text{PSS} = \{(\mathrm{C};\mathrm{C}), (\mathrm{C};\mathrm{G}), (\mathrm{G};\mathrm{C}), (\mathrm{G};\mathrm{G})\}" />.
              </li>
              <li>
                <strong>3.3</strong> — Deux EN purs : <strong>(C ; G)</strong> avec (60 ; 40) et{" "}
                <strong>(G ; C)</strong> avec (40 ; 60).
              </li>
              <li>
                <strong>3.4</strong> — Aucun EN pur ; équilibre mixte{" "}
                <M tex="(p^*;\, q^*) = (0{,}6;\, 0{,}4)" />.
              </li>
              <li>
                <strong>3.5</strong> — Payoffs espérés : pirate <strong>46</strong>, responsable{" "}
                <strong>58</strong>.
              </li>
            </ul>
            <p className="mt-2">
              <strong>À retenir :</strong> dominance → PSS → EN forment une chaîne cohérente
              (EN ⊆ PSS) ; et quand aucune cellule ne tient, l'équilibre mixte se calcule en
              rendant <em>l'adversaire</em> indifférent.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 2, exercise: "ex1" },
                { session: 2, exercise: "ex4" },
                { session: 2, exercise: "ex5" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 4 — Contrat principal-agent                          */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-1"
        id="q4"
        number={4}
        title="Question 4 — Embaucher une directrice commerciale : le contrat optimal w(z) = a + bz (40 pts)"
        difficulty={3}
        refs={[
          { chapter: "b2", section: "sec-modele" },
          { chapter: "b2", section: "sec-cas3" },
        ]}
        statement={
          <>
            <p>
              La propriétaire d'une entreprise doit engager une directrice commerciale. Le chiffre
              d'affaires de la firme est donné par
            </p>
            <MB tex="z = 4e + x," />
            <p>
              où <M tex="e" /> est l'effort de la directrice et <M tex="x" /> une variable
              aléatoire de valeur attendue nulle : <M tex="E(x) = 0" />. La propriétaire observe le
              chiffre d'affaires <M tex="z" />, mais <em>ni</em> l'effort <M tex="e" />,{" "}
              <em>ni</em> la réalisation de <M tex="x" />. Elle propose un contrat de la forme
            </p>
            <MB tex="w(z) = a + b\,z," />
            <p>
              où <M tex="a" /> et <M tex="b" /> sont des réels. Le coût de l'effort pour la
              directrice est <M tex="c(e) = e^2" />. Les deux parties sont{" "}
              <strong>neutres au risque</strong>. Si la directrice refuse le contrat, elle obtient
              son utilité de réserve <M tex="\bar{U} = 1" />.
            </p>
            <SubQuestion label="4.1">
              Pour un contrat <M tex="(a,\, b)" /> donné, détermine l'effort optimal{" "}
              <M tex="e^*(b)" /> choisi par la directrice. Pourquoi le fixe <M tex="a" />{" "}
              n'influence-t-il pas cet effort ? (10 points)
            </SubQuestion>
            <SubQuestion label="4.2">
              Détermine les valeurs <M tex="a^*" /> et <M tex="b^*" /> qui maximisent la
              fonction-objectif de la propriétaire. Détaille ton raisonnement (contrainte de
              participation, substitution dans l'objectif, condition de premier ordre). (14 points)
            </SubQuestion>
            <SubQuestion label="4.3">
              Calcule l'utilité attendue de la propriétaire et celle de la directrice sous le
              contrat optimal <M tex="(a^*,\, b^*)" />. (8 points)
            </SubQuestion>
            <SubQuestion label="4.4">
              Interprète le contrat optimal : pourquoi dit-on que la propriétaire « vend
              l'entreprise » à la directrice ? Quel rôle joue chacun des deux paramètres{" "}
              <M tex="a^*" /> et <M tex="b^*" /> ? (8 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé",
            refs: [
              { chapter: "b2", section: "sec-modele" },
              { chapter: "b2", section: "sec-cas3" },
            ],
            content: (
              <>
                <p>
                  Tous les marqueurs du modèle <strong>principal-agent</strong> (chapitre B2) sont
                  là : un effort <M tex="e" /> <em>inobservable</em>, un résultat{" "}
                  <M tex="z = 4e + x" /> observable mais bruité, un contrat <em>linéaire</em>{" "}
                  <M tex="w(z) = a + bz" /> (c'est le « cas 3 » du cours), un coût d'effort{" "}
                  <M tex="c(e) = e^2" /> et une utilité de réserve <M tex="\bar{U} = 1" />. Les
                  deux parties neutres au risque : aucun terme de prime de risque ne viendra
                  compliquer les calculs.
                </p>
                <p>La résolution suit toujours le même plan en deux temps, « à rebours » :</p>
                <ul>
                  <li>
                    <strong>Temps 1 (la directrice)</strong> : pour un contrat{" "}
                    <M tex="(a, b)" /> donné, quel effort choisit-elle ? → la{" "}
                    <em>contrainte d'incitation</em> <M tex="e^*(b)" /> (question 4.1) ;
                  </li>
                  <li>
                    <strong>Temps 2 (la propriétaire)</strong> : anticipant cette réaction, elle
                    choisit <M tex="(a, b)" /> sous la <em>contrainte de participation</em>{" "}
                    (questions 4.2 à 4.4).
                  </li>
                </ul>
                <Callout variant="methode">
                  <p>
                    C'est la logique de la backward induction appliquée aux contrats : on résout
                    d'abord le <em>dernier</em> décideur (l'agente), puis on remonte au principal
                    qui intègre la réaction de l'agente comme une contrainte. Ne commence jamais
                    par la propriétaire : sans <M tex="e^*(b)" />, son programme est incomplet.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 — Écrire l'utilité attendue de la directrice",
            refs: [{ chapter: "b2", section: "sec-modele" }],
            content: (
              <>
                <p>
                  Neutre au risque, la directrice maximise l'espérance de son salaire moins son
                  coût d'effort :
                </p>
                <MB tex="U_a(e) = E\big(w(z) - c(e)\big) = E\big(a + b\,(4e + x) - e^2\big)." />
                <p>
                  On développe à l'intérieur de l'espérance, puis on utilise sa linéarité (les
                  termes <M tex="a" />, <M tex="4be" /> et <M tex="e^2" /> sont certains, seule{" "}
                  <M tex="x" /> est aléatoire) :
                </p>
                <MB tex="U_a(e) = a + 4b\,e + b\,E(x) - e^2." />
                <p>Comme <M tex="E(x) = 0" />, le bruit disparaît de l'objectif :</p>
                <MB tex="U_a(e) = a + 4b\,e - e^2." />
                <Callout variant="attention">
                  <p>
                    Deux oublis qui coûtent cher ici : (i) oublier le coût d'effort{" "}
                    <M tex="-e^2" /> (la directrice maximiserait alors un effort infini !) ; (ii)
                    traîner le terme <M tex="b\,E(x)" /> sans le mettre à zéro. Écris explicitement
                    « <M tex="E(x) = 0" /> » : le barème (4 pts pour le programme) le mentionne.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 — Dériver, annuler : e*(b) = 2b — et comprendre pourquoi a ne joue pas",
            refs: [{ chapter: "b2", section: "sec-cas3" }],
            content: (
              <>
                <p>
                  <M tex="U_a(e) = a + 4b\,e - e^2" /> est une parabole tournée vers le bas en{" "}
                  <M tex="e" /> : son maximum est donné par la condition de premier ordre.
                </p>
                <MB tex="\frac{\partial U_a}{\partial e} = 4b - 2e = 0" />
                <p>d'où l'effort optimal :</p>
                <FormulaBox
                  label="Contrainte d'incitation"
                  tex="e^*(b) = 2b"
                  caption={
                    <>
                      La « fonction de réaction » de la directrice : c'est elle que la propriétaire
                      devra intégrer dans son propre programme. (Condition de second ordre :{" "}
                      <M tex="\partial^2 U_a / \partial e^2 = -2 < 0" />, c'est bien un maximum.)
                    </>
                  }
                />
                <p>
                  <strong>Pourquoi <M tex="a" /> n'influence-t-il pas l'effort ?</strong> Dans le
                  programme de la directrice, <M tex="a" /> est une constante : il disparaît dès
                  qu'on dérive. Économiquement, l'effort se décide <em>à la marge</em> — « un peu
                  plus d'effort me rapporte <M tex="4b" /> et me coûte <M tex="2e" /> » — et un
                  transfert forfaitaire ne modifie aucun de ces deux termes. Le fixe déplace le{" "}
                  <em>niveau</em> de rémunération, pas l'<em>incitation</em>.
                </p>
                <Callout variant="intuition">
                  <p>
                    Seule la <strong>pente</strong> du contrat incite. Plus la directrice garde de
                    centimes sur chaque euro de chiffre d'affaires (plus <M tex="b" /> est grand),
                    plus elle pousse son effort loin : <M tex="e^* = 2b" /> est croissant en{" "}
                    <M tex="b" />. Ce sera la clé de l'interprétation finale.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.2 — Poser le programme de la propriétaire avec ses deux contraintes",
            refs: [{ chapter: "b2", section: "sec-modele" }],
            content: (
              <>
                <p>
                  La propriétaire garde le chiffre d'affaires moins le salaire. Neutre au risque,
                  elle maximise (en utilisant <M tex="E(z) = 4e" />) :
                </p>
                <MB tex="\max_{a,\,b}\; E(z - w) = 4e - (a + 4b\,e)" />
                <p>sous deux contraintes :</p>
                <ul>
                  <li>
                    la <strong>contrainte de participation</strong> (CP) — la directrice doit
                    accepter le contrat :
                    <MB tex="a + 4b\,e - e^2 \ \ge\ \bar{U} = 1 ;" />
                  </li>
                  <li>
                    la <strong>contrainte d'incitation</strong> (CI) — l'effort n'est pas
                    contractualisable, c'est la directrice qui le choisit :
                    <MB tex="e = e^*(b) = 2b." />
                  </li>
                </ul>
                <p>
                  La CI est le cœur du problème d'aléa moral : la propriétaire ne peut pas
                  « acheter » un effort, elle ne peut qu'en <em>induire</em> un via la pente{" "}
                  <M tex="b" />.
                </p>
              </>
            ),
          },
          {
            title: "4.2 — Saturer la contrainte de participation et isoler a",
            refs: [{ chapter: "b2", section: "sec-cas3" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi la CP est-elle une égalité à l'optimum ?</strong> Suppose
                  qu'elle soit lâche (la directrice obtient strictement plus que{" "}
                  <M tex="\bar{U}" />). La propriétaire pourrait alors baisser <M tex="a" /> d'un
                  petit montant : l'effort ne bouge pas (on vient de voir que <M tex="a" />{" "}
                  n'influence pas <M tex="e^*" />), la directrice accepte toujours, et le profit
                  augmente d'autant. Tout surplus laissé au-delà de <M tex="\bar{U}" /> est donc
                  une perte sèche pour la propriétaire — à l'optimum :
                </p>
                <MB tex="a + 4b\,e - e^2 = 1" />
                <p>ce qui permet d'isoler le fixe :</p>
                <MB tex="a = 1 + e^2 - 4b\,e." />
                <Callout variant="examen">
                  <p>
                    La phrase de justification (« si la CP était lâche, baisser <M tex="a" />{" "}
                    augmenterait le profit sans rien changer d'autre ») vaut 4 points au barème.
                    Écrire « CP saturée » sans dire pourquoi, c'est laisser ces points sur la
                    table.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.2 — Substituer dans l'objectif : le surplus total apparaît",
            refs: [{ chapter: "b2", section: "sec-cas3" }],
            content: (
              <>
                <p>On remplace <M tex="a" /> dans l'objectif de la propriétaire :</p>
                <MB tex="E(z - w) = 4e - a - 4b\,e = 4e - \big(1 + e^2 - 4b\,e\big) - 4b\,e." />
                <p>
                  On distribue le signe moins, et les deux termes <M tex="+4b\,e" /> et{" "}
                  <M tex="-4b\,e" /> se compensent :
                </p>
                <MB tex="E(z - w) = 4e - e^2 - 1." />
                <p>
                  Résultat remarquable : le <M tex="b" /> a disparu ! La propriétaire empoche le{" "}
                  <strong>surplus total</strong> de la relation, <M tex="S(e) = 4e - e^2" />{" "}
                  (valeur créée moins coût de l'effort), diminué de l'utilité de réserve. Elle a
                  donc intérêt à induire l'effort qui <em>maximise le gâteau</em>, pas à rogner sur
                  la part de la directrice.
                </p>
                <SvgSurplusEffort />
                <Callout variant="intuition">
                  <p>
                    Grâce à la CP saturée, « payer la directrice » ne coûte à la propriétaire que{" "}
                    <M tex="\bar{U}" /> plus le coût réel de l'effort : les intérêts des deux
                    parties s'alignent sur la maximisation du surplus. C'est pour ça que le contrat
                    optimal sera <em>efficace</em> malgré l'asymétrie d'information — un résultat
                    qui tient parce que la directrice est neutre au risque.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.2 — Injecter la contrainte d'incitation et optimiser : b* = 1, a* = −3",
            refs: [{ chapter: "b2", section: "sec-cas3" }],
            content: (
              <>
                <p>
                  La propriétaire ne choisit pas <M tex="e" /> directement : elle le pilote via{" "}
                  <M tex="b" />. On injecte <M tex="e = 2b" /> dans l'objectif :
                </p>
                <MB tex="E(z - w) = 4\,(2b) - (2b)^2 - 1 = 8b - 4b^2 - 1." />
                <p>Condition de premier ordre en <M tex="b" /> :</p>
                <MB tex="\frac{\partial}{\partial b}\big(8b - 4b^2 - 1\big) = 8 - 8b = 0 \iff b^* = 1." />
                <p>On remonte la chaîne : l'effort induit vaut</p>
                <MB tex="e^* = 2b^* = 2," />
                <p>et le fixe se récupère dans l'expression de la CP saturée :</p>
                <MB tex="a^* = 1 + (e^*)^2 - 4b^*e^* = 1 + 4 - 8 = -3." />
                <p>
                  Le contrat optimal est donc <M tex="w(z) = -3 + z" />. Vérification d'efficacité
                  : l'effort qui maximise <M tex="S(e) = 4e - e^2" /> résout{" "}
                  <M tex="4 - 2e = 0" />, soit <M tex="e = 2" /> — exactement l'effort induit.
                  L'asymétrie d'information ne crée ici aucune perte d'efficacité.
                </p>
                <Callout variant="attention">
                  <p>
                    Un fixe <strong>négatif</strong> (<M tex="a^* = -3" />) n'est pas une erreur de
                    calcul — c'est la bonne réponse ! Beaucoup de copies « corrigent » en{" "}
                    <M tex="a^* = 3" /> par réflexe. Vérifie plutôt la CP :{" "}
                    <M tex="-3 + 4 \times 1 \times 2 - 4 = 1 = \bar{U}" /> ✓. La directrice paie
                    pour obtenir le poste, et se rattrape sur le chiffre d'affaires.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.3 — Calculer les deux utilités attendues sous le contrat optimal",
            refs: [{ chapter: "b2", section: "sec-recap" }],
            content: (
              <>
                <p>
                  Avec <M tex="b^* = 1" />, <M tex="a^* = -3" /> et <M tex="e^* = 2" />, on calcule
                  d'abord les espérances de base :
                </p>
                <MB tex="E(z) = 4\,e^* = 4 \times 2 = 8, \qquad E(w) = a^* + b^*E(z) = -3 + 8 = 5." />
                <p>Utilité attendue de la propriétaire :</p>
                <MB tex="U_p = E(z - w) = 8 - 5 = 3." />
                <p>Utilité attendue de la directrice :</p>
                <MB tex="U_a = E(w) - c(e^*) = 5 - 2^2 = 5 - 4 = 1 = \bar{U}." />
                <p>
                  Tout est cohérent : la directrice est exactement à son utilité de réserve (CP
                  saturée), et la propriétaire s'approprie tout le surplus net,
                </p>
                <MB tex="U_p = S(e^*) - \bar{U} = (4 \times 2 - 2^2) - 1 = 4 - 1 = 3.\ \checkmark" />
                <Callout variant="examen">
                  <p>
                    Cette double lecture de <M tex="U_p" /> (calcul direct <em>et</em>{" "}
                    <M tex="S - \bar{U}" />) est le meilleur auto-contrôle de la question : si les
                    deux ne coïncident pas, une erreur s'est glissée en 4.2. Le barème donne 4 pts
                    par utilité <em>avec le détail du calcul</em>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.4 — Interpréter : la propriétaire « vend l'entreprise » à la directrice",
            refs: [
              { chapter: "b2", section: "sec-cas3" },
              { chapter: "b2", section: "sec-recap" },
            ],
            content: (
              <>
                <p>
                  Chaque paramètre du contrat <M tex="w(z) = -3 + z" /> a un rôle bien distinct :
                </p>
                <ul>
                  <li>
                    <strong><M tex="b^* = 1" /> — le rôle incitatif.</strong> La directrice
                    conserve <strong>100 pour cent du chiffre d'affaires à la marge</strong> : elle
                    devient <em>créancière résiduelle</em> (residual claimant) du résultat. Chaque
                    euro créé par son effort finit dans sa poche, donc elle internalise
                    parfaitement le rendement de son effort et choisit d'elle-même l'effort
                    efficace <M tex="e^* = 2" />. L'asymétrie d'information ne coûte plus rien.
                  </li>
                  <li>
                    <strong><M tex="a^* = -3" /> — le rôle distributif.</strong> Le fixe négatif
                    est une <em>franchise</em> : le prix que la directrice paie d'avance pour
                    « acheter » le droit de garder tout le résultat. Ce transfert forfaitaire ne
                    déforme aucune incitation (étape 4.1) ; il sert uniquement à répartir le
                    surplus en ramenant la directrice à <M tex="\bar{U} = 1" />.
                  </li>
                </ul>
                <p>
                  Tout se passe comme si la propriétaire <strong>vendait l'entreprise</strong> à la
                  directrice au prix de 3 : la directrice devient l'unique bénéficiaire des flux
                  (à la marge) et en paie la valeur d'avance. Exemples du cours : la licence de
                  taxi (le chauffeur paie la licence puis garde ses recettes), le contrat de
                  franchise (le franchisé paie la redevance puis garde ses profits).
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <ul>
              <li>
                <strong>4.1</strong> — <M tex="e^*(b) = 2b" /> ; le fixe <M tex="a" /> disparaît en
                dérivant : il ne modifie pas l'incitation à la marge.
              </li>
              <li>
                <strong>4.2</strong> — CP saturée <M tex="a = 1 + e^2 - 4be" />, objectif substitué{" "}
                <M tex="4e - e^2 - 1" />, puis <M tex="b^* = 1" /> et <M tex="a^* = -3" /> (effort
                induit <M tex="e^* = 2" />, efficace).
              </li>
              <li>
                <strong>4.3</strong> — <M tex="U_p = 3" /> ; <M tex="U_a = 1 = \bar{U}" />.
              </li>
              <li>
                <strong>4.4</strong> — <M tex="b^* = 1" /> : créancière résiduelle → effort
                efficace ; <M tex="a^* = -3" /> : franchise qui répartit le surplus. La
                propriétaire « vend l'entreprise » au prix de 3.
              </li>
            </ul>
            <p className="mt-2">
              <strong>À retenir :</strong> avec une agente neutre au risque, le contrat optimal met
              tout le risque et tout le rendement marginal sur l'agente (<M tex="b = 1" />) et
              récupère le surplus par le fixe — la pente incite, le fixe répartit.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList refs={[{ session: 4, exercise: "ex3" }]} className="mt-1.5" />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 5 — Jeu répété : entente sur les prix                */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p1-blanc-1"
        id="q5"
        number={5}
        title="Question 5 — L'entente des pizzerias : dilemme répété et stratégie grim (30 pts)"
        difficulty={2}
        refs={[
          { chapter: "b3", section: "sec-fini" },
          { chapter: "b3", section: "sec-grim" },
          { chapter: "b3", section: "sec-interp" },
        ]}
        statement={
          <>
            <p>
              Les deux seules pizzerias d'une petite ville, <strong>Piccolo</strong> (joueur 1) et{" "}
              <strong>Rustica</strong> (joueur 2), se sont entendues sur un prix élevé. Chaque
              mois, chacune choisit simultanément de respecter l'entente (E) ou de baisser son prix
              (B). Les profits mensuels (en milliers d'euros) :
            </p>
            <PayoffMatrix
              rowPlayer="Piccolo"
              colPlayer="Rustica"
              rows={["E", "B"]}
              cols={["E", "B"]}
              payoffs={[
                [
                  [6, 6],
                  [0, 12],
                ],
                [
                  [12, 0],
                  [2, 2],
                ],
              ]}
              interactive
              caption={
                <>
                  Le jeu d'étape. Révèle les meilleures réponses : tu verras que (B ; B) est
                  l'unique équilibre de Nash… alors que (E ; E) rapporte plus aux deux.
                </>
              }
            />
            <SubQuestion label="5.1">
              Montre que ce jeu en une période est un dilemme du prisonnier : identifie la
              stratégie dominante de chaque pizzeria et l'équilibre de Nash du jeu. Explique
              ensuite, sans calcul, pourquoi l'entente ne peut être soutenue à <em>aucune</em>{" "}
              période si le jeu est répété un nombre fini et connu de mois. (10 points)
            </SubQuestion>
            <SubQuestion label="5.2">
              Suppose maintenant que le jeu soit répété à horizon infini et que chaque pizzeria
              évalue ses profits futurs avec le même facteur d'escompte{" "}
              <M tex="\delta \in [0;\, 1[" />. Les deux pizzerias jouent la stratégie{" "}
              <em>grim</em> : « je joue E tant que mon adversaire a toujours joué E dans le passé ;
              sinon, je joue B pour toujours ». Calcule le payoff escompté d'une pizzeria lorsque
              les deux respectent l'entente, puis le payoff escompté de la meilleure déviation
              possible, et déduis-en la condition sur <M tex="\delta" /> pour que (grim ; grim)
              soit un équilibre de Nash. Détaille tes calculs (somme géométrique). (14 points)
            </SubQuestion>
            <SubQuestion label="5.3">
              Interprète économiquement la condition obtenue : que mesure <M tex="\delta" />, et
              pourquoi la coopération devient-elle impossible lorsque les firmes sont trop
              impatientes ? (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder l'énoncé",
            refs: [
              { chapter: "b3", section: "sec-cadre" },
              { chapter: "b3", section: "sec-grim" },
            ],
            content: (
              <>
                <p>
                  « Chaque mois », « répété un nombre fini et connu », « horizon infini », « facteur
                  d'escompte <M tex="\delta" /> », « stratégie <em>grim</em> » : on est en plein
                  chapitre B3 (jeux répétés). Le plan de réponse est dicté par l'énoncé, en trois
                  blocs :
                </p>
                <ul>
                  <li>
                    <strong>5.1a</strong> — analyser le <em>jeu d'étape</em> : stratégies
                    dominantes, équilibre de Nash, structure de dilemme du prisonnier ;
                  </li>
                  <li>
                    <strong>5.1b</strong> — horizon <em>fini</em> : backward induction → théorème
                    de l'horizon fini (aucun calcul demandé) ;
                  </li>
                  <li>
                    <strong>5.2–5.3</strong> — horizon <em>infini</em> : comparer le payoff
                    escompté de la coopération et celui de la meilleure déviation (sommes
                    géométriques), en déduire le seuil de patience.
                  </li>
                </ul>
                <Callout variant="methode">
                  <p>
                    La recette « grim » est toujours la même :{" "}
                    <M tex="\Pi^{\text{coop}} \ \text{vs}\ \Pi^{\text{dév}}" /> où la déviation
                    encaisse le gain de trahison <em>une fois</em>, puis le payoff de punition{" "}
                    <em>pour toujours</em>. La condition d'équilibre est{" "}
                    <M tex="\Pi^{\text{coop}} \ge \Pi^{\text{dév}}" />.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.1 — Identifier la stratégie dominante et l'équilibre du jeu d'étape",
            refs: [
              { chapter: "b1", section: "s3" },
              { chapter: "b3", section: "sec-cadre" },
            ],
            content: (
              <>
                <p>
                  Pour Piccolo, on compare B et E contre chaque stratégie de Rustica (premiers
                  nombres) :
                </p>
                <MB tex="\text{si Rustica joue E : } u_1(\mathrm{B},\mathrm{E}) = 12 > 6 = u_1(\mathrm{E},\mathrm{E})," />
                <MB tex="\text{si Rustica joue B : } u_1(\mathrm{B},\mathrm{B}) = 2 > 0 = u_1(\mathrm{E},\mathrm{B})." />
                <p>
                  <strong>B domine strictement E</strong> pour Piccolo — et par symétrie du jeu,
                  pour Rustica aussi. Chacune joue donc sa stratégie dominante, et l'unique
                  équilibre de Nash du jeu en une période est
                </p>
                <MB tex="(\mathrm{B};\mathrm{B}) \text{ avec les payoffs } (2;\,2)," />
                <p>
                  alors que (E ; E) donnerait (6 ; 6). Chacune a individuellement intérêt à trahir,
                  mais les deux préfèrent l'issue coopérative à l'équilibre : c'est exactement la
                  définition d'un <strong>dilemme du prisonnier</strong>.
                </p>
                <Callout variant="examen">
                  <p>
                    « Montre que c'est un dilemme du prisonnier » = deux éléments à écrire : (i) la
                    stratégie dominante de chaque joueur (avec les inégalités), (ii) le fait que
                    l'équilibre (B ; B) est Pareto-dominé par (E ; E). L'un sans l'autre ne suffit
                    pas — c'est la coexistence des deux qui fait le « dilemme ».
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.1 — Dérouler la backward induction : l'horizon fini tue l'entente",
            refs: [
              { chapter: "b3", section: "sec-fini" },
              { chapter: "b3", section: "sec-deux" },
            ],
            content: (
              <>
                <p>
                  Supposons le jeu répété <M tex="T" /> mois, <M tex="T" /> connu des deux
                  pizzerias. On remonte depuis la fin :
                </p>
                <ul>
                  <li>
                    <strong>Dernière période <M tex="T" /></strong> : plus aucune punition ni
                    récompense future n'est possible — le jeu restant est le jeu d'étape, chacune
                    joue sa stratégie dominante B.
                  </li>
                  <li>
                    <strong>Période <M tex="T-1" /></strong> : les deux savent que la période{" "}
                    <M tex="T" /> sera (B ; B) <em>quoi qu'il arrive aujourd'hui</em>. Coopérer
                    n'achète donc aucune récompense future, trahir ne coûte aucune punition future
                    : le futur étant figé, chacune joue B dès maintenant.
                  </li>
                  <li>
                    <strong>Et ainsi de suite</strong> : le raisonnement remonte de proche en
                    proche jusqu'au premier mois.
                  </li>
                </ul>
                <p>
                  Conclusion (théorème de l'horizon fini) : l'unique issue par récurrence à rebours
                  est <strong>« B à toutes les périodes »</strong> — l'entente ne tient à{" "}
                  <em>aucune</em> période dès que l'on peut compter les mois restants.
                </p>
                <Callout variant="attention">
                  <p>
                    Piège d'intuition : « avec 1 000 périodes, ils coopéreront bien un peu au
                    début »… Non ! Ce n'est pas le <em>nombre</em> de périodes qui compte, c'est
                    l'existence d'une <em>dernière</em> période connue : elle amorce la
                    contagion de la trahison, aussi long que soit l'horizon. La coopération
                    exigera un horizon <em>infini</em> (ou une fin incertaine).
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.2 — Calculer le payoff escompté de la coopération : 6/(1−δ)",
            refs: [{ chapter: "b3", section: "sec-infini" }],
            content: (
              <>
                <p>
                  Si les deux pizzerias jouent grim, personne ne déclenche jamais la punition :
                  chacune touche 6 à chaque période. La valeur actualisée de ce flux :
                </p>
                <MB tex="\Pi^{\text{coop}} = 6 + 6\,\delta + 6\,\delta^2 + 6\,\delta^3 + \cdots = 6\,(1 + \delta + \delta^2 + \cdots)." />
                <FormulaBox
                  label="Formule-clé — somme géométrique"
                  tex="\sum_{t=0}^{\infty} \delta^t\, a = a + a\,\delta + a\,\delta^2 + \cdots = \frac{a}{1-\delta} \qquad (0 \le \delta < 1)"
                  caption={
                    <>
                      L'outil central de tout le chapitre B3 — à savoir réciter <em>et</em>{" "}
                      redémontrer (multiplier la somme par <M tex="\delta" /> et soustraire).
                    </>
                  }
                />
                <p>En appliquant la formule avec <M tex="a = 6" /> :</p>
                <MB tex="\Pi^{\text{coop}} = \frac{6}{1-\delta}." />
              </>
            ),
          },
          {
            title: "5.2 — Calculer le payoff de la meilleure déviation : 12 + 2δ/(1−δ)",
            refs: [{ chapter: "b3", section: "sec-grim" }],
            content: (
              <>
                <p>
                  Supposons que Piccolo dévie (le jeu est symétrique, le raisonnement vaut pour les
                  deux). Sa meilleure déviation : jouer B dès aujourd'hui, pendant que Rustica joue
                  encore E — elle empoche <strong>12</strong> en période 0. Mais dès la période 1,
                  la grim de Rustica bascule en punition : <strong>B pour toujours</strong>. Face à
                  ce mur de B, la meilleure réponse de Piccolo est de jouer B aussi (<M tex="2 > 0" />
                  ) : elle touche 2 à chaque période future.
                </p>
                <SvgFriseRepetee />
                <p>On actualise ce flux « 12 aujourd'hui, 2 pour toujours à partir de demain » :</p>
                <MB tex="\Pi^{\text{dév}} = 12 + 2\,\delta + 2\,\delta^2 + \cdots = 12 + \delta\,(2 + 2\,\delta + \cdots)" />
                <p>et la parenthèse est une somme géométrique de terme 2 :</p>
                <MB tex="\Pi^{\text{dév}} = 12 + \delta\,\frac{2}{1-\delta}." />
                <Callout variant="attention">
                  <p>
                    Deux erreurs classiques ici : (i) écrire un payoff de punition de{" "}
                    <strong>0</strong> au lieu de 2 — le déviant répond <em>au mieux</em> à la
                    punition, il ne se laisse pas exploiter en jouant E contre B ; (ii) oublier le
                    facteur <M tex="\delta" /> devant la somme de punition — elle ne commence
                    qu'en période 1, pas en période 0.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.2 — Poser l'inéquation d'équilibre et la résoudre : δ ≥ 3/5",
            refs: [{ chapter: "b3", section: "sec-grim" }],
            content: (
              <>
                <p>
                  (grim ; grim) est un équilibre de Nash si dévier ne rapporte pas plus que
                  coopérer :
                </p>
                <MB tex="\frac{6}{1-\delta} \ \ge\ 12 + \frac{2\,\delta}{1-\delta}." />
                <p>
                  On multiplie les deux membres par <M tex="(1-\delta) > 0" /> — le sens de
                  l'inégalité est conservé car ce facteur est strictement positif :
                </p>
                <MB tex="6 \ \ge\ 12\,(1-\delta) + 2\,\delta." />
                <p>On développe le membre de droite :</p>
                <MB tex="6 \ \ge\ 12 - 12\,\delta + 2\,\delta = 12 - 10\,\delta." />
                <p>
                  On isole <M tex="\delta" /> : on ajoute <M tex="10\,\delta" /> des deux côtés et
                  on soustrait 6 :
                </p>
                <MB tex="10\,\delta \ \ge\ 6 \iff \boxed{\ \delta \ \ge\ \tfrac{3}{5} = 0{,}6\ }" />
                <p>
                  Pour <M tex="\delta \ge 3/5" />, l'entente est soutenue par la menace grim ; en
                  dessous, chaque pizzeria préfère empocher le gain immédiat de la trahison.
                </p>
                <Callout variant="examen">
                  <p>
                    L'énoncé exige « détaille tes calculs (somme géométrique) » : écris les flux
                    période par période <em>avant</em> d'appliquer la formule, mentionne que
                    multiplier par <M tex="(1-\delta) > 0" /> conserve le sens de l'inégalité, et
                    encadre la condition finale. Le barème découpe exactement ainsi : 4 pts le
                    payoff de coopération, 5 pts la déviation, 5 pts la résolution.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.3 — Interpréter δ : la patience, prix de la coopération",
            refs: [{ chapter: "b3", section: "sec-interp" }],
            content: (
              <>
                <p>
                  <M tex="\delta" /> mesure la <strong>patience</strong> des firmes : le poids
                  qu'elles accordent aux profits futurs par rapport aux profits immédiats — 1 euro
                  dans un mois vaut <M tex="\delta" /> euro aujourd'hui. La coopération repose sur
                  un arbitrage intertemporel :
                </p>
                <ul>
                  <li>
                    trahir rapporte un <strong>bonus immédiat</strong> de <M tex="12 - 6 = 6" /> ;
                  </li>
                  <li>
                    mais coûte la différence entre entente et guerre des prix,{" "}
                    <M tex="6 - 2 = 4" />, à <em>toutes</em> les périodes futures.
                  </li>
                </ul>
                <p>On peut d'ailleurs réécrire la condition d'équilibre sous cette forme :</p>
                <MB tex="\underbrace{6}_{\text{bonus immédiat}} \ \le\ \underbrace{\frac{4\,\delta}{1-\delta}}_{\text{pertes futures actualisées}} \iff 6\,(1-\delta) \le 4\,\delta \iff 10\,\delta \ge 6 \iff \delta \ge \tfrac{3}{5}." />
                <p>
                  Si les firmes sont impatientes (<M tex="\delta < 3/5" />), les pertes futures
                  pèsent trop peu face au gain immédiat : la menace de punition ne dissuade plus et
                  l'entente s'effondre.
                </p>
                <Callout variant="intuition">
                  <p>
                    Message général du chapitre : la coopération entre joueurs rationnels n'est
                    possible que si <strong>l'avenir compte suffisamment</strong> — interaction
                    fréquente (un <M tex="\delta" /> mensuel élevé), durable, et sans fin connue.
                    C'est pour ça que les cartels sont plus stables sur des marchés où l'on se
                    recroise souvent… et que les autorités de la concurrence essaient justement de
                    rendre la trahison (la baisse de prix) plus attrayante.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <ul>
              <li>
                <strong>5.1</strong> — B est strictement dominante pour les deux ; unique EN du jeu
                d'étape : <strong>(B ; B)</strong>, payoffs (2 ; 2) alors que (E ; E) donne (6 ; 6)
                → dilemme du prisonnier. Horizon fini : par backward induction, B partout —
                l'entente ne tient à aucune période.
              </li>
              <li>
                <strong>5.2</strong> — <M tex="\Pi^{\text{coop}} = \tfrac{6}{1-\delta}" /> ;{" "}
                <M tex="\Pi^{\text{dév}} = 12 + \tfrac{2\,\delta}{1-\delta}" /> ; condition :{" "}
                <M tex="\delta \ge \tfrac{3}{5}" />.
              </li>
              <li>
                <strong>5.3</strong> — <M tex="\delta" /> = patience ; bonus immédiat de 6 contre
                perte de 4 par période future : trop d'impatience fait s'effondrer l'entente.
              </li>
            </ul>
            <p className="mt-2">
              <strong>À retenir :</strong> horizon fini connu → jamais de coopération ; horizon
              infini → coopération possible si{" "}
              <M tex="\Pi^{\text{coop}} \ge \Pi^{\text{dév}}" />, c'est-à-dire si les joueurs sont
              assez patients.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 2, exercise: "ex3" },
                { session: 3, exercise: "ex4" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />
    </ExamSolutionShell>
  );
}
