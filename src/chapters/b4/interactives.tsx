/*
 * Chapitre B4 — Jeux bayésiens : composants interactifs et figures.
 *
 * Chaque widget reproduit fidèlement la logique du manuel interactif source :
 *  - CourseMap        : la carte du cours (décision individuelle → jeux
 *    simultanés → jeux bayésiens, avec le retour de l'espérance de gain) ;
 *  - NatureFigure     : la Nature tire le type du joueur 2 (0,8 / 0,2) ;
 *  - EnbDiagram       : « Nash (B1) + Espérance (A3) = ENB (B4) » ;
 *  - ExtensiveTree    : la forme extensive de la bataille des sexes
 *    bayésienne, avec les information sets en pointillés ;
 *  - BeliefExplorer   : widget 1 — les espérances de l'Homme selon
 *    p = P(T1) : E[V] = 2p, E[P] = 1−p (candidat 1) ; E[V] = 2(1−p),
 *    E[P] = p (candidat 2) ; seuils 1/3 et 2/3 ;
 *  - MenuBuilder      : widget 2 — construis ton menu (y, x) et vérifie les
 *    4 contraintes IC/IR du screening de la compagnie aérienne ;
 *  - MenuBattle       : widget 3 — profits des menus selon λ : screening
 *    (100 + 250λ) contre P_B (550λ), bascule à λ = 1/3.
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** format FR : 0.5 → "0,50" ; -6 → "−6" */
function fr(x: number, d = 2): string {
  return x
    .toFixed(d)
    .replace(".", ",")
    .replace("-", "−");
}

/** pastille verte / rouge (les .pill ok/ko de la source) */
function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold",
        ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
      )}
    >
      {children}
    </span>
  );
}

/** conteneur de figure statique */
function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* couleurs cohérentes avec le reste du site */
const C = {
  j1: "#be123c", // joueur 1 / Homme (rose-700)
  j2: "#0369a1", // joueur 2 / Femme (sky-700)
  nature: "#047857", // la Nature (emerald-700)
  accent: "#4f46e5", // indigo (couleur du chapitre)
  gold: "#b45309", // information sets / seuils (amber-700)
  ink: "#1e293b",
  soft: "#64748b",
  grid: "#e2e8f0",
  gray: "#94a3b8",
};

/* ------------------------------------------------------------------ */
/* Figure · La carte du cours (section 00)                             */
/* ------------------------------------------------------------------ */

export function CourseMap() {
  const box = { fill: "#ffffff", stroke: C.grid, strokeWidth: 1.5 };
  return (
    <Figure
      caption={
        <>
          La trajectoire du cours : de la décision seule (partie A) aux interactions
          stratégiques (partie B). Le chapitre B4 mélange les deux mondes — les{" "}
          <strong>jeux</strong> de B1 et les <strong>probabilités</strong> de A3.
        </>
      }
    >
      <svg viewBox="0 0 720 300" role="img" aria-label="Carte du cours" className="mx-auto w-full max-w-[720px]">
        <defs>
          <marker id="b4-map-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill={C.accent} />
          </marker>
        </defs>
        {/* A1-A3 */}
        <rect x="20" y="20" width="200" height="78" rx="12" {...box} />
        <text x="36" y="44" fontSize="11" fontFamily="monospace" fill={C.accent}>A1 · A2 · A3</text>
        <text x="36" y="64" fontSize="13" fontWeight="600" fill={C.ink}>Décision individuelle</text>
        <text x="36" y="82" fontSize="11.5" fill={C.soft}>Un seul décideur face au monde</text>
        {/* B1 */}
        <rect x="20" y="150" width="200" height="94" rx="12" {...box} />
        <text x="36" y="174" fontSize="11" fontFamily="monospace" fill={C.accent}>B1</text>
        <text x="36" y="194" fontSize="13" fontWeight="600" fill={C.ink}>Jeux simultanés</text>
        <text x="36" y="212" fontSize="11.5" fill={C.soft}>Plusieurs joueurs, gains connus</text>
        <text x="36" y="228" fontSize="11.5" fill={C.soft}>de tous → équilibre de Nash</text>
        {/* B4 ICI */}
        <rect x="290" y="150" width="200" height="94" rx="12" fill="#eef2ff" stroke={C.accent} strokeWidth="2.5" />
        <text x="306" y="174" fontSize="11" fontFamily="monospace" fill={C.accent}>B4 · ICI</text>
        <text x="306" y="194" fontSize="13" fontWeight="600" fill={C.ink}>Jeux bayésiens</text>
        <text x="306" y="212" fontSize="11.5" fill={C.soft}>Gains inconnus : on joue</text>
        <text x="306" y="228" fontSize="11.5" fill={C.soft}>avec des probabilités</text>
        {/* A3 rappel */}
        <rect x="290" y="20" width="200" height="78" rx="12" {...box} strokeDasharray="5 4" />
        <text x="306" y="44" fontSize="11" fontFamily="monospace" fill={C.accent}>A3, tu te souviens ?</text>
        <text x="306" y="64" fontSize="13" fontWeight="600" fill={C.ink}>Espérance de gain</text>
        <text x="306" y="82" fontSize="11.5" fill={C.soft}>L'outil clé revient ici !</text>
        {/* screening */}
        <rect x="530" y="150" width="170" height="94" rx="12" {...box} strokeDasharray="5 4" />
        <text x="546" y="174" fontSize="11" fontFamily="monospace" fill={C.accent}>FIN DU CHAPITRE</text>
        <text x="546" y="194" fontSize="13" fontWeight="600" fill={C.ink}>Screening</text>
        <text x="546" y="212" fontSize="11.5" fill={C.soft}>Jeux bayésiens</text>
        <text x="546" y="228" fontSize="11.5" fill={C.soft}>séquentiels</text>
        {/* flèches */}
        <path d="M120,98 L120,148" fill="none" stroke={C.accent} strokeWidth="2" markerEnd="url(#b4-map-arrow)" />
        <path d="M222,197 L288,197" fill="none" stroke={C.accent} strokeWidth="2" markerEnd="url(#b4-map-arrow)" />
        <path d="M390,148 L390,100" fill="none" stroke={C.accent} strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#b4-map-arrow)" />
        <path d="M492,197 L528,197" fill="none" stroke={C.accent} strokeWidth="2" markerEnd="url(#b4-map-arrow)" />
      </svg>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure · La Nature tire le type (section 02)                        */
/* ------------------------------------------------------------------ */

export function NatureFigure() {
  return (
    <Figure
      caption={
        <>
          La Nature « choisit » le type du joueur 2 avant le début du jeu. Un type = une
          table de gains.
        </>
      }
    >
      <svg viewBox="0 0 640 250" role="img" aria-label="La Nature tire le type du joueur 2" className="mx-auto w-full max-w-[640px]">
        <circle cx="320" cy="42" r="9" fill={C.nature} />
        <text x="320" y="20" textAnchor="middle" fontSize="13.5" fontWeight="600" fill={C.nature}>
          Nature
        </text>
        <line x1="320" y1="50" x2="150" y2="150" stroke={C.ink} strokeWidth="1.8" />
        <line x1="320" y1="50" x2="490" y2="150" stroke={C.ink} strokeWidth="1.8" />
        <text x="205" y="90" textAnchor="middle" fontSize="12" fill={C.soft}>proba 0,8</text>
        <text x="440" y="90" textAnchor="middle" fontSize="12" fill={C.soft}>proba 0,2</text>
        <rect x="60" y="150" width="180" height="66" rx="12" fill="#e0f2fe" stroke={C.j2} strokeWidth="1.5" />
        <text x="150" y="178" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.j2}>
          Joueur 2 « égoïste »
        </text>
        <text x="150" y="198" textAnchor="middle" fontSize="12" fill={C.soft}>table de gains n°1</text>
        <rect x="400" y="150" width="180" height="66" rx="12" fill="#e0f2fe" stroke={C.j2} strokeWidth="1.5" />
        <text x="490" y="178" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.j2}>
          Joueur 2 « altruiste »
        </text>
        <text x="490" y="198" textAnchor="middle" fontSize="12" fill={C.soft}>table de gains n°2</text>
        <text x="320" y="240" textAnchor="middle" fontSize="12" fill={C.soft}>
          Le joueur 2 apprend le résultat du tirage. Le joueur 1, non : il ne connaît que les probabilités.
        </text>
      </svg>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure · Nash + Espérance = ENB (section 06)                        */
/* ------------------------------------------------------------------ */

export function EnbDiagram() {
  return (
    <figure className="my-6">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-5 py-4 text-center">
          <div className="font-bold">Équilibre de Nash</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            meilleures réponses mutuelles (B1)
          </div>
        </div>
        <div className="text-center text-2xl font-extrabold text-primary">+</div>
        <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 px-5 py-4 text-center">
          <div className="font-bold">Espérance de gain</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            gains pondérés par les croyances (A3)
          </div>
        </div>
        <div className="text-center text-2xl font-extrabold text-primary">=</div>
        <div className="rounded-2xl border-2 border-primary bg-accent px-5 py-4 text-center shadow-sm">
          <div className="font-extrabold">ENB</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            équilibre de Nash bayésien (B4)
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        Rien de magique : l'ENB n'est pas un nouveau concept d'équilibre, c'est le Nash de B1
        recalculé en espérance.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure · Forme extensive de la bataille des sexes bayésienne (07)   */
/* ------------------------------------------------------------------ */

export function ExtensiveTree() {
  const es = { fontSize: 12, fill: C.soft } as const;
  return (
    <Figure
      caption={
        <>
          La forme extensive de la bataille des sexes bayésienne, fidèle à celle des slides.
          Gains : <strong className="text-rose-700">Homme</strong> ;{" "}
          <strong className="text-sky-700">Femme</strong> — à gauche l'univers T1, à droite
          l'univers T2. Pointillés dorés = « je ne sais pas dans lequel de ces nœuds je me
          trouve ».
        </>
      }
    >
      <svg viewBox="0 0 760 360" role="img" aria-label="Forme extensive de la bataille des sexes bayésienne" className="mx-auto w-full min-w-[560px] max-w-[760px]">
        {/* Nature */}
        <circle cx="380" cy="34" r="8" fill={C.nature} />
        <text x="380" y="16" textAnchor="middle" fontSize="13" fontWeight="600" fill={C.nature}>Nature</text>
        <line x1="380" y1="42" x2="180" y2="110" stroke={C.ink} strokeWidth="1.6" />
        <line x1="380" y1="42" x2="580" y2="110" stroke={C.ink} strokeWidth="1.6" />
        <text x="248" y="70" textAnchor="middle" {...es}>50 % · T1</text>
        <text x="512" y="70" textAnchor="middle" {...es}>50 % · T2</text>
        {/* nœuds de l'Homme */}
        <circle cx="180" cy="116" r="7.5" fill={C.j1} />
        <circle cx="580" cy="116" r="7.5" fill={C.j1} />
        <text x="146" y="112" textAnchor="end" fontSize="13" fontWeight="600" fill={C.j1}>Homme</text>
        <text x="614" y="112" textAnchor="start" fontSize="13" fontWeight="600" fill={C.j1}>Homme</text>
        <path d="M190,116 L570,116" fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="6 5" />
        <text x="380" y="108" textAnchor="middle" fontSize="12" fill={C.gold}>information set de l'Homme</text>
        {/* branches de l'Homme */}
        <line x1="180" y1="124" x2="95" y2="212" stroke={C.j1} strokeWidth="1.8" />
        <line x1="180" y1="124" x2="265" y2="212" stroke={C.j1} strokeWidth="1.8" />
        <line x1="580" y1="124" x2="495" y2="212" stroke={C.j1} strokeWidth="1.8" />
        <line x1="580" y1="124" x2="665" y2="212" stroke={C.j1} strokeWidth="1.8" />
        <text x="118" y="170" textAnchor="end" fontSize="12" fill={C.j1}>Viande</text>
        <text x="243" y="170" textAnchor="start" fontSize="12" fill={C.j1}>Poisson</text>
        <text x="518" y="170" textAnchor="end" fontSize="12" fill={C.j1}>Viande</text>
        <text x="643" y="170" textAnchor="start" fontSize="12" fill={C.j1}>Poisson</text>
        {/* nœuds de la Femme */}
        <circle cx="95" cy="218" r="7.5" fill={C.j2} />
        <circle cx="265" cy="218" r="7.5" fill={C.j2} />
        <circle cx="495" cy="218" r="7.5" fill={C.j2} />
        <circle cx="665" cy="218" r="7.5" fill={C.j2} />
        <text x="62" y="214" textAnchor="end" fontSize="13" fontWeight="600" fill={C.j2}>Femme</text>
        <path d="M105,218 L255,218" fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="6 5" />
        <text x="180" y="210" textAnchor="middle" fontSize="12" fill={C.gold}>info set Femme T1</text>
        <path d="M505,218 L655,218" fill="none" stroke={C.gold} strokeWidth="2" strokeDasharray="6 5" />
        <text x="580" y="210" textAnchor="middle" fontSize="12" fill={C.gold}>info set Femme T2</text>
        {/* branches de la Femme */}
        <line x1="95" y1="226" x2="55" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="95" y1="226" x2="135" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="265" y1="226" x2="225" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="265" y1="226" x2="305" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="495" y1="226" x2="455" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="495" y1="226" x2="535" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="665" y1="226" x2="625" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <line x1="665" y1="226" x2="705" y2="310" stroke={C.j2} strokeWidth="1.8" />
        <text x="63" y="268" textAnchor="end" fontSize="12" fill={C.j2}>R</text>
        <text x="128" y="268" textAnchor="start" fontSize="12" fill={C.j2}>B</text>
        <text x="233" y="268" textAnchor="end" fontSize="12" fill={C.j2}>R</text>
        <text x="298" y="268" textAnchor="start" fontSize="12" fill={C.j2}>B</text>
        <text x="463" y="268" textAnchor="end" fontSize="12" fill={C.j2}>R</text>
        <text x="528" y="268" textAnchor="start" fontSize="12" fill={C.j2}>B</text>
        <text x="633" y="268" textAnchor="end" fontSize="12" fill={C.j2}>R</text>
        <text x="698" y="268" textAnchor="start" fontSize="12" fill={C.j2}>B</text>
        {/* gains */}
        {(
          [
            [55, "2", "1"],
            [135, "0", "0"],
            [225, "0", "0"],
            [305, "1", "2"],
            [455, "2", "0"],
            [535, "0", "2"],
            [625, "0", "1"],
            [705, "1", "0"],
          ] as const
        ).map(([x, u1, u2]) => (
          <text key={x} x={x} y="334" textAnchor="middle" fontSize="12.5" fontFamily="monospace">
            <tspan fill={C.j1}>{u1}</tspan>
            <tspan fill={C.soft}> ; </tspan>
            <tspan fill={C.j2}>{u2}</tspan>
          </text>
        ))}
      </svg>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 1 · Bataille des sexes : la croyance p = P(T1)               */
/*                                                                     */
/* Candidat 1 : Femme joue (Rouge si T1 · Blanc si T2)                 */
/*   E[Viande] = 2p ; E[Poisson] = 1 − p ; ENB ssi 2p ≥ 1−p (p ≥ 1/3)  */
/* Candidat 2 : Femme joue (Blanc si T1 · Rouge si T2)                 */
/*   E[Viande] = 2(1−p) ; E[Poisson] = p ; ENB ssi p ≥ 2(1−p) (p ≥ 2/3)*/
/* ------------------------------------------------------------------ */

export function BeliefExplorer() {
  const [pPct, setPPct] = useState(50);
  const p = pPct / 100;

  const eV1 = 2 * p;
  const eP1 = 1 - p;
  const eV2 = 2 * (1 - p);
  const eP2 = p;
  const c1 = eV1 >= eP1; // le candidat 1 tient si Viande reste la meilleure réponse
  const c2 = eP2 >= eV2; // le candidat 2 tient si Poisson est bien la meilleure réponse

  // géométrie du graphe
  const W = 660;
  const H = 280;
  const L = 52;
  const R = 16;
  const T = 18;
  const B = 42;
  const pw = W - L - R;
  const ph = H - T - B;
  const ymax = 2;
  const X = (v: number) => L + v * pw;
  const Y = (v: number) => T + (1 - v / ymax) * ph;

  return (
    <InteractiveCard
      title="Et si la croyance n'était pas 50/50 ?"
      subtitle={
        <>
          Dans le cours, p = P(T1) = 0,5. Fais varier p et observe les espérances de l'Homme
          face à chacune des deux règles de la Femme. Tu verras les deux candidats d'équilibre
          vivre et mourir selon la croyance — la preuve que dans un jeu bayésien,{" "}
          <strong>les croyances font partie du jeu</strong>.
        </>
      }
      controls={
        <SliderControl
          label={<>p = P(Femme de type T1)</>}
          value={pPct}
          onChange={setPPct}
          min={0}
          max={100}
          step={1}
          format={(v) => fr(v / 100)}
          className="sm:col-span-2 lg:col-span-3"
        />
      }
      footer={
        <>
          le candidat 1 (Viande) survit dès que p ≥ 1/3, le candidat 2 (Poisson) exige p ≥ 2/3.
          Trois zones : sous 1/3, aucun ENB en règles pures ; entre 1/3 et 2/3, seul le candidat
          1 ; au-delà de 2/3, les deux coexistent. À p = 0,5 (le cours), seul le candidat 1
          survit — exactement le résultat des slides.
        </>
      }
    >
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full min-w-[480px] max-w-[660px]" role="img" aria-label="Espérances de gain de l'Homme selon p">
          {/* grille horizontale */}
          {[0, 0.5, 1, 1.5, 2].map((v) => (
            <g key={v}>
              <line x1={L} y1={Y(v)} x2={W - R} y2={Y(v)} stroke={C.grid} strokeWidth="1" />
              <text x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={C.soft}>
                {fr(v, 1)}
              </text>
            </g>
          ))}
          {/* graduations x */}
          {[
            [0, "0"],
            [1 / 3, "1/3"],
            [2 / 3, "2/3"],
            [1, "1"],
          ].map(([v, lab]) => (
            <text key={lab as string} x={X(v as number)} y={H - B + 18} textAnchor="middle" fontSize="11" fill={C.soft}>
              {lab}
            </text>
          ))}
          <text x={W - R} y={H - B + 34} textAnchor="end" fontSize="11" fill={C.soft}>
            p = P(T1) →
          </text>
          {/* seuils 1/3 et 2/3 */}
          <line x1={X(1 / 3)} y1={T} x2={X(1 / 3)} y2={H - B} stroke={C.gold} strokeDasharray="4 4" strokeWidth="1.2" />
          <line x1={X(2 / 3)} y1={T} x2={X(2 / 3)} y2={H - B} stroke={C.gold} strokeDasharray="4 4" strokeWidth="1.2" />
          {/* candidat 1 : E[V] = 2p (plein rose), E[P] = 1 − p (plein bleu) */}
          <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(2)} stroke={C.j1} strokeWidth="2.4" />
          <line x1={X(0)} y1={Y(1)} x2={X(1)} y2={Y(0)} stroke={C.j2} strokeWidth="2.4" />
          {/* candidat 2 : E[V] = 2(1−p) pointillé rose, E[P] = p pointillé bleu */}
          <line x1={X(0)} y1={Y(2)} x2={X(1)} y2={Y(0)} stroke={C.j1} strokeWidth="2" strokeDasharray="7 5" opacity="0.6" />
          <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={C.j2} strokeWidth="2" strokeDasharray="7 5" opacity="0.6" />
          {/* curseur vertical */}
          <line x1={X(p)} y1={T} x2={X(p)} y2={H - B} stroke={C.ink} strokeWidth="1.6" />
          {/* points sur les 4 droites */}
          <circle cx={X(p)} cy={Y(eV1)} r="5.5" fill={C.j1} />
          <circle cx={X(p)} cy={Y(eP1)} r="5.5" fill={C.j2} />
          <circle cx={X(p)} cy={Y(eV2)} r="4.5" fill={C.j1} opacity="0.55" />
          <circle cx={X(p)} cy={Y(eP2)} r="4.5" fill={C.j2} opacity="0.55" />
        </svg>
      </div>

      {/* légende */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="font-bold text-rose-700">rose = E[Viande]</span> ·{" "}
          <span className="font-bold text-sky-700">bleu = E[Poisson]</span>
        </span>
        <span>traits pleins : Homme face à (Rouge si T1 · Blanc si T2)</span>
        <span>pointillés : face à (Blanc si T1 · Rouge si T2)</span>
        <span className="font-semibold text-amber-700">verticales dorées : seuils 1/3 et 2/3</span>
      </div>

      {/* verdicts */}
      <div className="mt-3 space-y-2 rounded-xl bg-muted/60 p-3 text-sm leading-relaxed">
        <div>
          <Pill ok={c1}>{c1 ? "ENB ✓" : "pas un ENB ✗"}</Pill>{" "}
          <strong>Candidat 1</strong> ( Viande , (Rouge si T1 · Blanc si T2) ) :{" "}
          <M tex="E[\text{Viande}] = 2p" /> = <strong>{fr(eV1)}</strong> contre{" "}
          <M tex="E[\text{Poisson}] = 1 - p" /> = <strong>{fr(eP1)}</strong>
          {c1 ? " — Viande reste la meilleure réponse de l'Homme." : " — l'Homme dévierait vers Poisson."}
        </div>
        <div>
          <Pill ok={c2}>{c2 ? "ENB ✓" : "pas un ENB ✗"}</Pill>{" "}
          <strong>Candidat 2</strong> ( Poisson , (Blanc si T1 · Rouge si T2) ) :{" "}
          <M tex="E[\text{Poisson}] = p" /> = <strong>{fr(eP2)}</strong> contre{" "}
          <M tex="E[\text{Viande}] = 2(1-p)" /> = <strong>{fr(eV2)}</strong>
          {c2 ? " — Poisson est bien la meilleure réponse de l'Homme." : " — l'Homme dévierait vers Viande."}
        </div>
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 2 · Screening : construis ton menu (y, x)                    */
/*                                                                     */
/* IC_T : 220 − y ≤ 200 − x   |  IC_B : 700 − y ≥ 400 − x              */
/* IR_T : x ≤ 200             |  IR_B : y ≤ 700                        */
/* ------------------------------------------------------------------ */

function ConstraintCard({
  ok,
  name,
  detail,
  failMsg,
}: {
  ok: boolean;
  name: string;
  detail: ReactNode;
  failMsg: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 px-3 py-2.5",
        ok ? "border-emerald-300 bg-emerald-50/70" : "border-rose-300 bg-rose-50/70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold">{name}</span>
        <span className={cn("text-xs font-extrabold", ok ? "text-emerald-700" : "text-rose-700")}>
          {ok ? "✓ respectée" : "✗ violée"}
        </span>
      </div>
      <div className="mt-1 text-sm tabular-nums">{detail}</div>
      {!ok ? <div className="mt-1 text-xs font-semibold text-rose-800">{failMsg}</div> : null}
    </div>
  );
}

export function MenuBuilder() {
  const [x, setX] = useState(150); // prix Économie
  const [y, setY] = useState(600); // prix Premium

  const icT = 220 - y <= 200 - x;
  const icB = 700 - y >= 400 - x;
  const irT = x <= 200;
  const irB = y <= 700;
  const all = icT && icB && irT && irB;
  const sB = 700 - y;
  const sT = 200 - x;
  const isOptimal = x === 200 && y === 500;

  return (
    <InteractiveCard
      title="Construis ton propre menu (y, x)"
      subtitle={
        <>
          Déplace les deux prix et observe : les quatre contraintes s'allument en vert quand
          elles sont respectées. Essaie de retrouver le menu optimal (500, 200)… puis essaie
          (700, 200) pour voir l'auto-sélection se casser la figure.
        </>
      }
      controls={
        <>
          <SliderControl
            label={<>x — prix Économie</>}
            value={x}
            onChange={setX}
            min={0}
            max={450}
            step={10}
          />
          <SliderControl
            label={<>y — prix Premium</>}
            value={y}
            onChange={setY}
            min={0}
            max={800}
            step={10}
          />
          <div className="flex flex-wrap items-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setX(200);
                setY(500);
              }}
              className="rounded-full border px-3 py-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              Menu optimal (500, 200)
            </button>
            <button
              type="button"
              onClick={() => {
                setX(200);
                setY(700);
              }}
              className="rounded-full border px-3 py-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              Menu naïf (700, 200)
            </button>
          </div>
        </>
      }
      footer={
        <>
          au menu optimal (500, 200), exactement deux contraintes sont saturées : l'IR du
          Touriste (x = 200 pile) et l'IC du Business (y − x = 300 pile). Monte y au-dessus de
          500 : c'est l'IC du Business qui casse en premier — bien avant son IR (y ≤ 700).
          C'est elle, la vraie limite du prix Premium.
        </>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <ConstraintCard
          ok={icT}
          name="IC Touriste — il doit préférer l'Économie"
          detail={
            <>
              220 − y ≤ 200 − x : {fr(220 - y, 0)} ≤ {fr(200 - x, 0)}
            </>
          }
          failMsg="Le Touriste préfère le Premium !"
        />
        <ConstraintCard
          ok={icB}
          name="IC Business — il doit préférer le Premium"
          detail={
            <>
              700 − y ≥ 400 − x : {fr(700 - y, 0)} ≥ {fr(400 - x, 0)}
            </>
          }
          failMsg="Le Business file en Économie !"
        />
        <ConstraintCard
          ok={irT}
          name="IR Touriste — il doit accepter d'acheter"
          detail={<>x ≤ 200 : x = {x}</>}
          failMsg="Le Touriste reste chez lui."
        />
        <ConstraintCard
          ok={irB}
          name="IR Business — il doit accepter d'acheter"
          detail={<>y ≤ 700 : y = {y}</>}
          failMsg="Le Business reste chez lui."
        />
      </div>

      <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm leading-relaxed">
        {all ? (
          <>
            <p>
              <Pill ok>Auto-sélection réussie</Pill> Le Business prend le Premium (surplus{" "}
              <strong>{fr(sB, 0)}</strong>), le Touriste prend l'Économie (surplus{" "}
              <strong>{fr(sT, 0)}</strong>).
            </p>
            <p className="mt-1.5">
              Profit moyen : <M tex="\Pi(\lambda) = \lambda(y-150) + (1-\lambda)(x-100)" /> ={" "}
              <strong>
                {fr(x - 100, 0)} + {fr(y - x - 50, 0)} λ
              </strong>
              {isOptimal ? (
                <>
                  {" "}
                  <Pill ok>🎯 C'est le menu optimal du cours !</Pill>
                </>
              ) : (
                <> — compare avec l'optimum 100 + 250 λ : peux-tu faire mieux en respectant tout ?</>
              )}
            </p>
          </>
        ) : (
          <>
            <p>
              <Pill ok={false}>Pas de séparation propre</Pill> Avec ces prix, au moins un type
              ne joue pas le rôle prévu. Ajuste x ou y.
            </p>
            {!icB ? (
              <p className="mt-1.5 text-muted-foreground">
                <em>
                  Indice : l'écart y − x = {fr(y - x, 0)} dépasse 300, le rabais Économie est
                  trop tentant pour le Business.
                </em>
              </p>
            ) : null}
            {!irT ? (
              <p className="mt-1.5 text-muted-foreground">
                <em>Indice : x = {x} dépasse 200, le consentement à payer du Touriste.</em>
              </p>
            ) : null}
          </>
        )}
      </div>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget 3 · La bataille des menus : profits selon λ                  */
/*                                                                     */
/* Π_parf = 100 + 450λ | Π_scr = 100 + 250λ | P_B = 550λ | E_all = 100 */
/* ------------------------------------------------------------------ */

export function MenuBattle() {
  const [lPct, setLPct] = useState(20);
  const l = lPct / 100;

  const Pperf = (v: number) => 100 + 450 * v;
  const Pscr = (v: number) => 100 + 250 * v;
  const PB = (v: number) => 550 * v;

  const ps = Pscr(l);
  const pb = PB(l);
  const pf = Pperf(l);
  const nearTie = Math.abs(ps - pb) < 3; // λ ≈ 1/3 (le pas de 1 % ne tombe jamais pile dessus)
  const scrWins = ps >= pb;

  // géométrie
  const W = 660;
  const H = 300;
  const L = 56;
  const R = 16;
  const T = 18;
  const B = 42;
  const pw = W - L - R;
  const ph = H - T - B;
  const ymax = 560;
  const X = (v: number) => L + v * pw;
  const Y = (v: number) => T + (1 - v / ymax) * ph;

  const seg = (f: (v: number) => number) => ({
    x1: X(0),
    y1: Y(f(0)),
    x2: X(1),
    y2: Y(f(1)),
  });

  return (
    <InteractiveCard
      title="Quel menu gagne selon λ ?"
      subtitle={
        <>
          Fais glisser λ (la part de voyageurs Affaires) et regarde les profits des menus se
          croiser. Le point de bascule est à λ = 1/3. La droite grise du haut, c'est le rêve
          inaccessible de la discrimination parfaite.
        </>
      }
      controls={
        <SliderControl
          label={<>λ = part de voyageurs Affaires</>}
          value={lPct}
          onChange={setLPct}
          min={0}
          max={100}
          step={1}
          format={(v) => fr(v / 100)}
          className="sm:col-span-2 lg:col-span-3"
        />
      }
      footer={
        <>
          sous λ = 1/3, la droite bleue (screening) est au-dessus de la rouge (P_B) : on sert
          tout le monde. Au-delà, P_B l'emporte : on abandonne les touristes. Et la droite
          grise reste toujours au-dessus du meilleur menu — l'écart entre les deux, c'est le
          coût de l'asymétrie d'information.
        </>
      }
    >
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full min-w-[480px] max-w-[660px]" role="img" aria-label="Profits des menus selon lambda">
          {[0, 100, 200, 300, 400, 500].map((v) => (
            <g key={v}>
              <line x1={L} y1={Y(v)} x2={W - R} y2={Y(v)} stroke={C.grid} strokeWidth="1" />
              <text x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={C.soft}>
                {v}
              </text>
            </g>
          ))}
          {[
            [0, "0"],
            [1 / 3, "1/3"],
            [0.5, "0,5"],
            [1, "1"],
          ].map(([v, lab]) => (
            <text key={lab as string} x={X(v as number)} y={H - B + 18} textAnchor="middle" fontSize="11" fill={C.soft}>
              {lab}
            </text>
          ))}
          <text x={W - R} y={H - B + 34} textAnchor="end" fontSize="11" fill={C.soft}>
            λ = part de Business →
          </text>
          {/* seuil 1/3 */}
          <line x1={X(1 / 3)} y1={T} x2={X(1 / 3)} y2={H - B} stroke={C.gold} strokeDasharray="4 4" strokeWidth="1.2" />
          {/* les 4 droites de profit */}
          <line {...seg(Pperf)} stroke={C.gray} strokeWidth="1.8" strokeDasharray="3 4" />
          <line x1={X(0)} y1={Y(100)} x2={X(1)} y2={Y(100)} stroke={C.nature} strokeWidth="1.8" strokeDasharray="7 5" />
          <line {...seg(Pscr)} stroke={C.j2} strokeWidth="2.6" />
          <line {...seg(PB)} stroke={C.j1} strokeWidth="2.6" />
          {/* curseur + points */}
          <line x1={X(l)} y1={T} x2={X(l)} y2={H - B} stroke={C.ink} strokeWidth="1.6" />
          <circle cx={X(l)} cy={Y(ps)} r="5.5" fill={C.j2} />
          <circle cx={X(l)} cy={Y(pb)} r="5.5" fill={C.j1} />
          <circle cx={X(l)} cy={Y(pf)} r="4" fill={C.gray} />
        </svg>
      </div>

      {/* légende */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-bold text-sky-700">bleu = screening (100 + 250λ)</span>
        <span className="font-bold text-rose-700">rouge = P_B (550λ)</span>
        <span className="font-semibold text-emerald-700">vert = E_all (100)</span>
        <span>gris pointillé = discrimination parfaite (100 + 450λ)</span>
      </div>

      <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm leading-relaxed">
        <p className="tabular-nums">
          Π<sub>screening</sub> = <strong>{fr(ps, 0)}</strong> &ensp; Π<sub>P_B</sub> ={" "}
          <strong>{fr(pb, 0)}</strong> &ensp; (rêve inaccessible : {fr(pf, 0)})
        </p>
        <p className="mt-1.5">
          {nearTie ? (
            <>
              <Pill ok>λ ≈ 1/3 : le point de bascule</Pill> Les deux menus rapportent
              (quasiment) autant — en dessous le screening gagne, au-dessus c'est P_B.
            </>
          ) : scrWins ? (
            <>
              <Pill ok>Menu optimal : screening (500, 200)</Pill> Les Business sont assez rares
              pour que servir aussi les touristes vaille le coup.
            </>
          ) : (
            <>
              <Pill ok={false}>Menu optimal : P_B (Premium à 700, touristes abandonnés)</Pill>{" "}
              Trop de Business : le rabais du screening coûte plus cher que ce que les touristes
              rapportent.
            </>
          )}
        </p>
        <p className="mt-1.5">
          Coût de l'asymétrie d'information (rêve − meilleur menu) :{" "}
          <strong>{fr(pf - Math.max(ps, pb), 0)}</strong> par client potentiel.
        </p>
      </div>
    </InteractiveCard>
  );
}
