/**
 * Résolution guidée — Examen blanc n° 1 · Partie 2 « Économie industrielle ».
 *
 * Trois questions, /100 points, 1 h :
 *   Q1 (40 pts) — Le monopole de A à Z (EI1) : Rm, optimum, Lerner, perte sèche,
 *     monopole naturel. Valeurs officielles : y* = 12, p* = 36, Π* = 288,
 *     ε = 3/2, marge = 24, L = 2/3, SC = 144, (pᵉ, yᵉ) = (12, 24), PS = 144.
 *   Q2 (35 pts) — Discrimination par les prix (EI3) : Y* = 12, p* = 12, Π = 96
 *     (yL = 8, yS = 4) ; 1er degré : [192 € ; 16 kg] et [96 € ; 8 kg], Π = 192,
 *     SC = 0, Pareto-efficace ; 2.3 : rente d'information (réflexion).
 *   Q3 (25 pts) — Bertrand asymétrique (EI2) : p* ≃ c₂ = 90, Q* = 210 servies
 *     par Cimex, Π_Cimex ≈ 6 300, Π_Bétolith = 0 ; cas symétrique : p = 60,
 *     Q = 240, profits nuls (paradoxe de Bertrand).
 *
 * Tous les résultats ont été recalculés et coïncident avec le corrigé officiel.
 */
import type { ReactNode } from "react";
import { ExamSolutionShell } from "@/components/course/ExamSolutionShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { TpRefList } from "@/components/course/TpRef";

/* ------------------------------------------------------------------ */
/* Styles de tableau (identiques aux TP)                               */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Couleurs validées (mêmes séries que les TP : bande de luminance,
 * séparation daltonisme et contraste OK sur fond clair). */
const COL_DEMANDE = "#0284c7"; // sky-600
const COL_RM = "#d97706"; // amber-600
const COL_CM = "#059669"; // emerald-600
const COL_PERTE = "#e11d48"; // rose-600

/* ------------------------------------------------------------------ */
/* Figure Q1 — le marché de Thermolaine : demande, Rm, Cm              */
/* ------------------------------------------------------------------ */

type Q1Mode = "optimum" | "surplus" | "perte";

const Q1_ARIA: Record<Q1Mode, string> = {
  optimum:
    "Demande, recette marginale et coût marginal de Thermolaine ; la recette marginale croise le coût marginal en y égal 12, et le prix de monopole, lu sur la demande, vaut 36 euros",
  surplus:
    "À l'optimum du monopole, le surplus des consommateurs est le triangle de 144 euros au-dessus du prix de 36, et le profit de 288 euros est le rectangle entre le prix et le coût marginal de 12",
  perte:
    "La perte sèche du monopole est le triangle de 144 euros entre la demande et le coût marginal, pour les quantités comprises entre 12 (monopole) et 24 (concurrence parfaite)",
};

/** Repère : y (quantité) en abscisse de 0 à 30, p (€) en ordonnée de 0 à 60. */
function GraphMonopoleQ1({ mode, caption }: { mode: Q1Mode; caption?: ReactNode }) {
  const X = (v: number) => 46 + (v / 30) * 400;
  const Y = (v: number) => 272 - (v / 60) * 244;
  const guides = "5 4";
  const showConcurrence = mode === "perte";

  return (
    <figure className="my-4 rounded-xl border bg-card p-3">
      <svg
        viewBox="0 0 460 316"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={Q1_ARIA[mode]}
      >
        {/* Surfaces (dessinées d'abord, sous les courbes) */}
        {mode === "surplus" || mode === "perte" ? (
          <>
            {/* SC : triangle (0,60)-(0,36)-(12,36) */}
            <polygon
              points={`${X(0)},${Y(60)} ${X(0)},${Y(36)} ${X(12)},${Y(36)}`}
              fill={COL_DEMANDE}
              opacity={mode === "surplus" ? 0.28 : 0.12}
            />
            {/* Profit : rectangle (0..12) × (12..36) */}
            <rect
              x={X(0)}
              y={Y(36)}
              width={X(12) - X(0)}
              height={Y(12) - Y(36)}
              fill={COL_RM}
              opacity={mode === "surplus" ? 0.28 : 0.12}
            />
          </>
        ) : null}
        {mode === "perte" ? (
          <polygon
            points={`${X(12)},${Y(36)} ${X(12)},${Y(12)} ${X(24)},${Y(12)}`}
            fill={COL_PERTE}
            opacity={0.38}
            stroke={COL_PERTE}
            strokeWidth={1.5}
          />
        ) : null}

        {/* Guides pointillés (point de monopole) */}
        <line
          x1={X(0)}
          y1={Y(36)}
          x2={X(12)}
          y2={Y(36)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.3}
          strokeDasharray={guides}
        />
        <line
          x1={X(12)}
          y1={Y(36)}
          x2={X(12)}
          y2={Y(0)}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.3}
          strokeDasharray={guides}
        />
        {showConcurrence ? (
          <line
            x1={X(24)}
            y1={Y(12)}
            x2={X(24)}
            y2={Y(0)}
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.3}
            strokeDasharray={guides}
          />
        ) : null}

        {/* Axes */}
        <line x1={X(0)} y1={Y(0)} x2={X(30) + 6} y2={Y(0)} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(60) - 6} stroke="var(--color-foreground)" strokeWidth={1.3} />

        {/* Graduations en y (abscisse) */}
        {[0, 12, 15, 24, 30].map((v) => (
          <g key={`x${v}`}>
            <line x1={X(v)} y1={Y(0)} x2={X(v)} y2={Y(0) + 5} stroke="var(--color-foreground)" strokeWidth={1} />
            <text
              x={X(v)}
              y={Y(0) + 18}
              fontSize={11}
              textAnchor="middle"
              fontWeight={v === 12 || (v === 24 && showConcurrence) ? 700 : 400}
              fill={
                v === 12 || (v === 24 && showConcurrence)
                  ? "var(--color-foreground)"
                  : "var(--color-muted-foreground)"
              }
            >
              {v}
            </text>
          </g>
        ))}
        {/* Graduations en p (ordonnée) */}
        {[12, 36, 60].map((v) => (
          <g key={`y${v}`}>
            <line x1={X(0) - 5} y1={Y(v)} x2={X(0)} y2={Y(v)} stroke="var(--color-foreground)" strokeWidth={1} />
            <text
              x={X(0) - 9}
              y={Y(v) + 4}
              fontSize={11}
              textAnchor="end"
              fontWeight={v === 36 || v === 12 ? 700 : 400}
              fill={v === 36 || v === 12 ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
            >
              {v}
            </text>
          </g>
        ))}

        {/* Courbes : demande, Rm, Cm */}
        <line x1={X(0)} y1={Y(60)} x2={X(30)} y2={Y(0)} stroke={COL_DEMANDE} strokeWidth={2.5} />
        <line x1={X(0)} y1={Y(60)} x2={X(15)} y2={Y(0)} stroke={COL_RM} strokeWidth={2.5} />
        <line x1={X(0)} y1={Y(12)} x2={X(30)} y2={Y(12)} stroke={COL_CM} strokeWidth={2.5} />

        {/* Étiquettes des courbes */}
        <text x={X(6.4)} y={Y(51.5)} fontSize={12} fontWeight={600} fill="var(--color-foreground)">
          Demande : p = 60 − 2y
        </text>
        <text x={X(15.4)} y={Y(3.5)} fontSize={12} fontWeight={600} fill="var(--color-foreground)">
          Rm = 60 − 4y
        </text>
        <text x={X(30)} y={Y(12) - 8} fontSize={12} fontWeight={600} textAnchor="end" fill="var(--color-foreground)">
          Cm = 12
        </text>

        {/* Étiquettes des surfaces */}
        {mode === "surplus" ? (
          <>
            <text x={X(0.9)} y={Y(44.5)} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
              SC = 144
            </text>
            <text x={X(3.2)} y={Y(23.5)} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
              Π = 288
            </text>
          </>
        ) : null}
        {mode === "perte" ? (
          <text x={X(13)} y={Y(15.5)} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
            Perte sèche
          </text>
        ) : null}

        {/* Points remarquables */}
        {/* Intersection Rm = Cm en (12, 12) */}
        <circle cx={X(12)} cy={Y(12)} r={4} fill="var(--color-card)" stroke="var(--color-foreground)" strokeWidth={1.8} />
        {/* Point de monopole sur la demande en (12, 36) */}
        <circle cx={X(12)} cy={Y(36)} r={4.5} fill="var(--color-foreground)" />
        {showConcurrence ? <circle cx={X(24)} cy={Y(12)} r={4.5} fill="var(--color-foreground)" /> : null}

        {/* Titres d'axes */}
        <text x={X(30) + 6} y={Y(0) + 34} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
          y (quantité)
        </text>
        <text x={10} y={16} fontSize={11} fill="var(--color-muted-foreground)">
          p (€)
        </text>
      </svg>
      {caption ? (
        <figcaption className="mt-1.5 text-center text-[13px] text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q2 — discrimination du 1er degré : les deux offres [m ; y]   */
/* ------------------------------------------------------------------ */

function GraphPremierDegre({ caption }: { caption?: ReactNode }) {
  const YP = (v: number) => 282 - (v / 22) * 240;
  const XL = (v: number) => 46 + (v / 22) * 250;
  const XR = (v: number) => 366 + (v / 22) * 250;
  const guides = "5 4";

  return (
    <figure className="my-4 rounded-xl border bg-card p-3">
      <svg
        viewBox="0 0 640 330"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Pour chaque client, la quantité offerte est celle où sa demande croise le coût marginal de 4 euros : 16 kilos pour L et 8 kilos pour S. Le montant demandé égale toute l'aire sous la demande : 192 euros pour L (64 de coût plus 128 de profit) et 96 euros pour S (32 de coût plus 64 de profit)"
      >
        {/* ============ Panneau de gauche : client L ============ */}
        <text x={XL(10)} y={30} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Client L — p = 20 − y
        </text>
        <text x={XL(10)} y={48} fontSize={11.5} fontWeight={600} textAnchor="middle" fill="var(--color-muted-foreground)">
          Offre : [ 192 € ; 16 kg ]
        </text>

        {/* coût (rectangle sous Cm) puis profit (triangle demande/Cm) */}
        <rect x={XL(0)} y={YP(4)} width={XL(16) - XL(0)} height={YP(0) - YP(4)} fill={COL_CM} opacity={0.2} />
        <polygon
          points={`${XL(0)},${YP(20)} ${XL(16)},${YP(4)} ${XL(0)},${YP(4)}`}
          fill={COL_RM}
          opacity={0.3}
        />
        {/* guide : quantité offerte */}
        <line x1={XL(16)} y1={YP(4)} x2={XL(16)} y2={YP(0)} stroke="var(--color-muted-foreground)" strokeWidth={1.3} strokeDasharray={guides} />

        {/* axes */}
        <line x1={XL(0)} y1={YP(0)} x2={XL(21.5) + 4} y2={YP(0)} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <line x1={XL(0)} y1={YP(0)} x2={XL(0)} y2={YP(21.5)} stroke="var(--color-foreground)" strokeWidth={1.3} />

        {/* courbes */}
        <line x1={XL(0)} y1={YP(20)} x2={XL(20)} y2={YP(0)} stroke={COL_DEMANDE} strokeWidth={2.5} />
        <line x1={XL(0)} y1={YP(4)} x2={XL(21)} y2={YP(4)} stroke={COL_CM} strokeWidth={2.5} />
        <circle cx={XL(16)} cy={YP(4)} r={4.5} fill="var(--color-foreground)" />

        {/* graduations */}
        {[16, 20].map((v) => (
          <g key={`lx${v}`}>
            <line x1={XL(v)} y1={YP(0)} x2={XL(v)} y2={YP(0) + 5} stroke="var(--color-foreground)" strokeWidth={1} />
            <text
              x={XL(v)}
              y={YP(0) + 18}
              fontSize={11}
              textAnchor="middle"
              fontWeight={v === 16 ? 700 : 400}
              fill={v === 16 ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
            >
              {v}
            </text>
          </g>
        ))}
        {[4, 20].map((v) => (
          <g key={`ly${v}`}>
            <line x1={XL(0) - 5} y1={YP(v)} x2={XL(0)} y2={YP(v)} stroke="var(--color-foreground)" strokeWidth={1} />
            <text x={XL(0) - 9} y={YP(v) + 4} fontSize={11} textAnchor="end" fontWeight={v === 4 ? 700 : 400} fill="var(--color-foreground)">
              {v}
            </text>
          </g>
        ))}

        {/* étiquettes */}
        <text x={XL(0.9)} y={YP(8.3)} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
          Π = 128 €
        </text>
        <text x={XL(4.2)} y={YP(1.5)} fontSize={11.5} fontWeight={600} fill="var(--color-foreground)">
          coût = 64 €
        </text>
        <text x={XL(21)} y={YP(4) - 8} fontSize={11.5} fontWeight={600} textAnchor="end" fill="var(--color-foreground)">
          Cm = 4
        </text>
        <text x={XL(21.5) + 4} y={YP(0) + 32} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
          y (kg)
        </text>

        {/* ============ Panneau de droite : client S ============ */}
        <text x={XR(10)} y={30} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          Client S — p = 20 − 2y
        </text>
        <text x={XR(10)} y={48} fontSize={11.5} fontWeight={600} textAnchor="middle" fill="var(--color-muted-foreground)">
          Offre : [ 96 € ; 8 kg ]
        </text>

        <rect x={XR(0)} y={YP(4)} width={XR(8) - XR(0)} height={YP(0) - YP(4)} fill={COL_CM} opacity={0.2} />
        <polygon
          points={`${XR(0)},${YP(20)} ${XR(8)},${YP(4)} ${XR(0)},${YP(4)}`}
          fill={COL_RM}
          opacity={0.3}
        />
        <line x1={XR(8)} y1={YP(4)} x2={XR(8)} y2={YP(0)} stroke="var(--color-muted-foreground)" strokeWidth={1.3} strokeDasharray={guides} />

        <line x1={XR(0)} y1={YP(0)} x2={XR(21.5) + 4} y2={YP(0)} stroke="var(--color-foreground)" strokeWidth={1.3} />
        <line x1={XR(0)} y1={YP(0)} x2={XR(0)} y2={YP(21.5)} stroke="var(--color-foreground)" strokeWidth={1.3} />

        <line x1={XR(0)} y1={YP(20)} x2={XR(10)} y2={YP(0)} stroke={COL_DEMANDE} strokeWidth={2.5} />
        <line x1={XR(0)} y1={YP(4)} x2={XR(21)} y2={YP(4)} stroke={COL_CM} strokeWidth={2.5} />
        <circle cx={XR(8)} cy={YP(4)} r={4.5} fill="var(--color-foreground)" />

        {[8, 10].map((v) => (
          <g key={`rx${v}`}>
            <line x1={XR(v)} y1={YP(0)} x2={XR(v)} y2={YP(0) + 5} stroke="var(--color-foreground)" strokeWidth={1} />
            <text
              x={XR(v)}
              y={YP(0) + 18}
              fontSize={11}
              textAnchor="middle"
              fontWeight={v === 8 ? 700 : 400}
              fill={v === 8 ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
            >
              {v}
            </text>
          </g>
        ))}
        {[4, 20].map((v) => (
          <g key={`ry${v}`}>
            <line x1={XR(0) - 5} y1={YP(v)} x2={XR(0)} y2={YP(v)} stroke="var(--color-foreground)" strokeWidth={1} />
            <text x={XR(0) - 9} y={YP(v) + 4} fontSize={11} textAnchor="end" fontWeight={v === 4 ? 700 : 400} fill="var(--color-foreground)">
              {v}
            </text>
          </g>
        ))}

        <text x={XR(0.7)} y={YP(8)} fontSize={12} fontWeight={700} fill="var(--color-foreground)">
          Π = 64 €
        </text>
        <text x={XR(1.6)} y={YP(1.5)} fontSize={11.5} fontWeight={600} fill="var(--color-foreground)">
          coût = 32 €
        </text>
        <text x={XR(21)} y={YP(4) - 8} fontSize={11.5} fontWeight={600} textAnchor="end" fill="var(--color-foreground)">
          Cm = 4
        </text>
        <text x={XR(21.5) + 4} y={YP(0) + 32} fontSize={11} textAnchor="end" fill="var(--color-muted-foreground)">
          y (kg)
        </text>
      </svg>
      {caption ? (
        <figcaption className="mt-1.5 text-center text-[13px] text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Figure Q3 — Bertrand asymétrique : la droite des prix               */
/* ------------------------------------------------------------------ */

function GraphBertrandLigne({ caption }: { caption?: ReactNode }) {
  const PX = (p: number) => 40 + ((p - 40) / 160) * 560;

  return (
    <figure className="my-4 rounded-xl border bg-card p-3">
      <svg
        viewBox="0 0 640 214"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label="Sur la droite des prix, tout prix au-dessus de 90 euros est aussitôt sous-coté ; entre 60 et 90, seule Cimex est rentable ; sous 60, les deux vendraient à perte. L'équilibre est juste sous 90 : Cimex sert tout le marché"
      >
        <defs>
          <marker
            id="fleche-sous-enchere"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COL_RM} />
          </marker>
        </defs>

        {/* Flèche de sous-enchère */}
        <text x={407} y={52} fontSize={11.5} fontWeight={600} textAnchor="middle" fill="var(--color-foreground)">
          {"tout prix au-dessus de 90 € est aussitôt sous-coté"}
        </text>
        <line
          x1={PX(192)}
          y1={70}
          x2={PX(97)}
          y2={70}
          stroke={COL_RM}
          strokeWidth={2.5}
          markerEnd="url(#fleche-sous-enchere)"
        />

        {/* Zones colorées sur la droite des prix */}
        <rect x={PX(40)} y={98} width={PX(60) - PX(40)} height={14} fill={COL_PERTE} opacity={0.45} />
        <rect x={PX(60)} y={98} width={PX(90) - PX(60)} height={14} fill={COL_CM} opacity={0.55} />
        <rect x={PX(90)} y={98} width={PX(200) - PX(90)} height={14} fill={COL_RM} opacity={0.45} />

        {/* Axe des prix */}
        <line x1={25} y1={105} x2={615} y2={105} stroke="var(--color-foreground)" strokeWidth={1.4} />
        <polygon points="615,100 624,105 615,110" fill="var(--color-foreground)" />
        <text x={614} y={92} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
          p (€ / tonne)
        </text>

        {/* Équilibre : juste sous 90 */}
        <text x={PX(88)} y={88} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
          p* ≃ 90
        </text>
        <circle cx={PX(88)} cy={105} r={5} fill="var(--color-foreground)" stroke="var(--color-card)" strokeWidth={1.5} />

        {/* Repères : c1, c2, prix de monopole */}
        {[
          { p: 60, num: "60", nom: "c₁ (Cimex)" },
          { p: 90, num: "90", nom: "c₂ (Bétolith)" },
          { p: 180, num: "180", nom: "p de monopole de Cimex" },
        ].map((t) => (
          <g key={t.p}>
            <line x1={PX(t.p)} y1={105} x2={PX(t.p)} y2={121} stroke="var(--color-foreground)" strokeWidth={1.2} />
            <text x={PX(t.p)} y={136} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="var(--color-foreground)">
              {t.num}
            </text>
            <text x={PX(t.p)} y={151} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">
              {t.nom}
            </text>
          </g>
        ))}

        {/* Légende des zones */}
        <rect x={40} y={168} width={10} height={10} fill={COL_PERTE} opacity={0.45} />
        <text x={56} y={177} fontSize={10.5} fill="var(--color-foreground)">
          {"p < 60 : vendre à perte pour les deux"}
        </text>
        <rect x={280} y={168} width={10} height={10} fill={COL_CM} opacity={0.55} />
        <text x={296} y={177} fontSize={10.5} fill="var(--color-foreground)">
          {"60 ≤ p < 90 : seule Cimex est rentable"}
        </text>
        <rect x={40} y={190} width={10} height={10} fill={COL_RM} opacity={0.45} />
        <text x={56} y={199} fontSize={10.5} fill="var(--color-foreground)">
          {"p > 90 : chacune veut passer juste sous l'autre → sous-enchère"}
        </text>
      </svg>
      {caption ? (
        <figcaption className="mt-1.5 text-center text-[13px] text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/* ================================================================== */
/* Page de résolution                                                  */
/* ================================================================== */

export default function ExamSolution() {
  return (
    <ExamSolutionShell examId="p2-blanc-1">
      {/* Vue d'ensemble de l'épreuve */}
      <div className="mb-8 rounded-2xl border bg-card px-5 py-4 text-[15px] leading-relaxed">
        <p className="font-bold">Vue d'ensemble de l'épreuve (1 h · /100 pts)</p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Question 1 (40 pts)</strong> — le monopole de A à
            Z : chapitre EI1 en entier. Budget conseillé : ≈ 24 minutes.
          </li>
          <li>
            <strong className="text-foreground">Question 2 (35 pts)</strong> — discrimination par
            les prix : chapitre EI3 (monopole simple, 1er degré, réflexion sur le 2e degré).
            Budget : ≈ 21 minutes.
          </li>
          <li>
            <strong className="text-foreground">Question 3 (25 pts)</strong> — Bertrand avec coûts
            asymétriques : chapitre EI2. Budget : ≈ 15 minutes.
          </li>
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Règle d'or du /100 en 1 h : 0,6 minute par point. Une question de réflexion à 5 ou
          8 points ne mérite jamais 15 minutes.
        </p>
      </div>

      {/* ============================================================ */}
      {/* Question 1 — Le monopole de A à Z (40 pts)                    */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-1"
        id="q1"
        number={1}
        title="Question 1 — Le monopole de A à Z (40 pts)"
        difficulty={2}
        refs={[
          { chapter: "ei1", section: "maximisation" },
          { chapter: "ei1", section: "pouvoir" },
          { chapter: "ei1", section: "inefficacite" },
          { chapter: "ei1", section: "regulation" },
        ]}
        statement={
          <>
            <p>
              L'entreprise <strong>Thermolaine</strong> détient le brevet d'une fibre isolante
              haute performance et est, de ce fait, <strong>seule à vendre ce produit</strong>.
              Elle fait face à la fonction de demande inverse suivante :
            </p>
            <MB tex="p = 60 - 2y" />
            <p>
              où <M tex="p" /> est le prix en euros et <M tex="y" /> la quantité totale vendue sur
              ce marché. Thermolaine est confrontée à un <strong>coût marginal constant de 12</strong>{" "}
              et n'a <strong>pas de coût fixe</strong>.
            </p>
            <SubQuestion label="1.1)">
              Donne l'expression de la recette marginale de Thermolaine, puis détermine sa
              production optimale <M tex="y^*" />. Détaille ton raisonnement. (10 points)
            </SubQuestion>
            <SubQuestion label="1.2)">
              À quel prix Thermolaine va-t-elle vendre cette production ? Quel est son profit ?
              (8 points)
            </SubQuestion>
            <SubQuestion label="1.3)">
              Calcule l'élasticité de la demande <M tex="\varepsilon" /> au point optimal choisi
              par Thermolaine, sa marge <M tex="p - Cm" /> et son indice de Lerner. Vérifie que
              l'indice de Lerner est bien égal à l'inverse de l'élasticité. (8 points)
            </SubQuestion>
            <SubQuestion label="1.4)">
              Calcule le surplus des consommateurs à l'optimum du monopole. Quels seraient le prix
              et la quantité échangée si ce marché fonctionnait comme un marché de concurrence
              parfaite (avec le même coût marginal) ? Calcule la perte sèche due au monopole.
              (9 points)
            </SubQuestion>
            <SubQuestion label="1.5)">
              Question de réflexion. Considère maintenant un monopole <em>naturel</em> : sa
              technologie présente un coût fixe très élevé et un coût marginal constant. Un
              régulateur envisage de l'obliger à tarifer au coût marginal, comme en concurrence
              parfaite. Explique pourquoi cette régulation, appliquée « sans autre mesure », pose
              problème. Aucun calcul chiffré n'est demandé. (5 points)
            </SubQuestion>
          </>
        }
        steps={[
          /* ------------------------------------------------------ */
          {
            title: "Décoder l'énoncé : reconnaître un « monopole complet »",
            refs: [
              { chapter: "ei1", section: "demande" },
              { chapter: "ei1", section: "maximisation" },
            ],
            content: (
              <>
                <p>
                  Deux indices sautent aux yeux dès la première phrase : « détient le brevet » et
                  « seule à vendre ce produit ». Une seule firme face à toute la demande du
                  marché : c'est un <strong>monopole</strong>, le chapitre EI1. Et comme l'énoncé
                  te donne une <strong>demande inverse linéaire</strong> (<M tex="p = 60 - 2y" />)
                  et un <strong>coût marginal constant</strong> (<M tex="Cm = 12" />, pas de coût
                  fixe), tu sais que tout se traite analytiquement, sans surprise.
                </p>
                <p>Repère ensuite la logique des sous-questions — c'est le chapitre dans l'ordre :</p>
                <ul className="my-2 list-disc space-y-1 pl-6">
                  <li>
                    <strong>1.1 et 1.2</strong> : l'optimum du monopole (recette marginale, puis{" "}
                    <M tex="Rm = Cm" />, puis prix et profit) ;
                  </li>
                  <li>
                    <strong>1.3</strong> : la mesure du pouvoir de marché (élasticité, marge,
                    Lerner) ;
                  </li>
                  <li>
                    <strong>1.4</strong> : le bien-être (surplus, comparaison avec la concurrence
                    parfaite, perte sèche) ;
                  </li>
                  <li>
                    <strong>1.5</strong> : la régulation (monopole naturel) — pure rédaction.
                  </li>
                </ul>
                <Callout variant="methode" title="La routine « monopole » en cinq temps">
                  <ol className="my-1 list-decimal space-y-1 pl-5">
                    <li>
                      Écrire (ou obtenir) la demande inverse <M tex="p(y)" />.
                    </li>
                    <li>
                      Poser la recette totale <M tex="R(y) = p(y)\cdot y" /> et la dériver pour
                      obtenir <M tex="Rm(y)" />.
                    </li>
                    <li>
                      Résoudre <M tex="Rm = Cm" /> pour trouver <M tex="y^*" />.
                    </li>
                    <li>
                      Remonter <strong>le long de la demande</strong> pour le prix :{" "}
                      <M tex="p^* = p(y^*)" />.
                    </li>
                    <li>
                      Finir par le profit, les surplus et la comparaison avec la concurrence
                      parfaite.
                    </li>
                  </ol>
                </Callout>
                <Callout variant="examen">
                  <p>
                    40 points sur 100 : prends le temps de <strong>dessiner le graphique au
                    brouillon dès le départ</strong> (demande, Rm, Cm). Les sous-questions 1.2 et
                    1.4 se <em>lisent</em> littéralement dessus, et le correcteur valorise un
                    schéma propre sur ta copie. Presque toutes les erreurs classiques (prix mal
                    lu, mauvais triangle de perte sèche) disparaissent quand le dessin est posé.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Écrire la recette totale, puis dériver la recette marginale (1.1)",
            refs: [
              { chapter: "ei1", section: "recette" },
              { chapter: "ei1", section: "exemple-analytique" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi commencer par là ?</strong> Le monopole n'est pas preneur de
                  prix : quand il choisit sa quantité <M tex="y" />, le prix de vente s'ajuste le
                  long de la demande. Sa recette dépend donc de <M tex="y" /> par deux canaux (la
                  quantité vendue <em>et</em> le prix), et c'est la recette <em>marginale</em> qui
                  résume l'effet net d'une unité de plus.
                </p>
                <p>
                  La recette totale est le prix multiplié par la quantité, où le prix se lit sur
                  la demande inverse :
                </p>
                <MB tex="R(y) = p(y)\,y = (60 - 2y)\,y" />
                <p>On développe le produit :</p>
                <MB tex="R(y) = 60y - 2y^2" />
                <p>
                  La recette marginale est la dérivée de la recette totale par rapport à{" "}
                  <M tex="y" /> (dérivée de <M tex="60y" /> : 60 ; dérivée de <M tex="2y^2" /> :{" "}
                  <M tex="4y" />) :
                </p>
                <MB tex="Rm(y) = \frac{dR}{dy} = 60 - 4y" />
                <FormulaBox
                  label="Le réflexe « pente double » (demande linéaire)"
                  tex="p = a - by \;\;\Longrightarrow\;\; Rm = a - 2by"
                  caption={
                    <>
                      Même ordonnée à l'origine (ici 60), pente doublée (de −2 à −4). Idéal pour
                      vérifier ta dérivée en une seconde… mais au barème, c'est la dérivation qui
                      rapporte : pose-la.
                    </>
                  }
                />
                <p>
                  <strong>Interprétation</strong> — remarque que <M tex="Rm(y) < p(y)" /> dès que{" "}
                  <M tex="y > 0" /> : pour vendre une unité de plus, Thermolaine doit baisser son
                  prix sur <em>toutes</em> les unités, pas seulement sur la dernière. La recette
                  gagnée sur l'unité supplémentaire est donc rognée par la perte de recette sur
                  toutes les autres. C'est LE mécanisme central du chapitre EI1.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Égaliser Rm et Cm pour trouver la production optimale (1.1)",
            refs: [{ chapter: "ei1", section: "maximisation" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette condition ?</strong> Raisonne à la marge : tant que{" "}
                  <M tex="Rm > Cm" />, l'unité suivante rapporte plus qu'elle ne coûte — il faut
                  la produire. Dès que <M tex="Rm < Cm" />, elle détruit du profit. Le profit est
                  donc maximal exactement là où :
                </p>
                <MB tex="Rm(y^*) = Cm" />
                <p>On remplace par les expressions trouvées :</p>
                <MB tex="60 - 4y^* = 12" />
                <p>
                  On isole le terme en <M tex="y^*" /> en passant 12 à gauche et{" "}
                  <M tex="4y^*" /> à droite :
                </p>
                <MB tex="4y^* = 60 - 12 = 48" />
                <p>puis on divise les deux membres par 4 :</p>
                <MB tex="y^* = \frac{48}{4} = 12" />
                <p>
                  <strong>La production optimale de Thermolaine est <M tex="y^* = 12" />.</strong>{" "}
                  Variante tout aussi valable : maximiser directement le profit{" "}
                  <M tex="\Pi(y) = (60 - 2y)y - 12y" /> ; la condition de premier ordre{" "}
                  <M tex="60 - 4y - 12 = 0" /> redonne exactement <M tex="y^* = 12" />.
                </p>
                <Callout variant="examen">
                  <p>
                    « Détaille ton raisonnement » n'est pas une formule de politesse : au barème,
                    la recette marginale correcte vaut 4 pts, la condition <M tex="Rm = Cm" />{" "}
                    <em>énoncée</em> vaut 3 pts, et la résolution 3 pts. Écris noir sur blanc « le
                    monopole produit jusqu'à ce que la recette marginale égale le coût marginal »
                    avant de calculer : c'est 3 points gratuits.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Remonter le long de la demande pour le prix, puis calculer le profit (1.2)",
            refs: [{ chapter: "ei1", section: "exemple-analytique" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi remonter à la demande ?</strong> La condition{" "}
                  <M tex="Rm = Cm" /> dit <em>combien produire</em>, pas à quel prix vendre. Le
                  prix, c'est ce que les consommateurs sont prêts à payer pour absorber ces 12
                  unités — et ça se lit sur la <strong>courbe de demande</strong>, jamais ailleurs :
                </p>
                <MB tex="p^* = 60 - 2 \times 12 = 60 - 24 = 36 \text{ €}" />
                <Callout variant="attention">
                  <p>
                    Le piège le plus payant de tout le chapitre : lire le prix à l'intersection de{" "}
                    <M tex="Rm" /> et <M tex="Cm" />, c'est-à-dire répondre 12 €. Le corrigé
                    officiel est explicite : un prix lu à cette intersection ne rapporte{" "}
                    <strong>aucun point</strong> sur les 4 du prix. L'intersection donne la{" "}
                    <em>quantité</em> ; le <em>prix</em> se lit toujours en remontant
                    verticalement jusqu'à la demande.
                  </p>
                </Callout>
                <p>
                  Le profit est la marge unitaire multipliée par la quantité — il n'y a pas de
                  coût fixe à soustraire :
                </p>
                <MB tex="\Pi^* = (p^* - Cm)\,y^* = (36 - 12) \times 12" />
                <MB tex="\Pi^* = 24 \times 12 = 288 \text{ €}" />
                <p>
                  Vérification par les totaux : recette <M tex="36 \times 12 = 432" />, coût{" "}
                  <M tex="12 \times 12 = 144" />, profit <M tex="432 - 144 = 288" />. Tout
                  concorde.
                </p>
                <GraphMonopoleQ1
                  mode="optimum"
                  caption={
                    <>
                      L'optimum de Thermolaine : <M tex="Rm" /> croise <M tex="Cm" /> en{" "}
                      <M tex="y^* = 12" /> (point creux), et le prix se lit en remontant sur la
                      demande : <M tex="p^* = 36" /> (point plein).
                    </>
                  }
                />
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Mesurer le pouvoir de marché : élasticité, marge et indice de Lerner (1.3)",
            refs: [{ chapter: "ei1", section: "pouvoir" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette sous-question ?</strong> L'élasticité et l'indice de
                  Lerner quantifient le <em>pouvoir de marché</em> : de combien le monopole
                  peut-il s'écarter de son coût sans perdre trop de clients ? L'élasticité se
                  calcule avec la demande <strong>directe</strong> (quantité en fonction du prix),
                  qu'il faut donc reconstruire d'abord :
                </p>
                <MB tex="p = 60 - 2y \;\;\Longleftrightarrow\;\; 2y = 60 - p \;\;\Longleftrightarrow\;\; y = 30 - \tfrac{1}{2}p" />
                <p>
                  La pente de la demande directe est donc <M tex="\tfrac{dy}{dp} = -\tfrac{1}{2}" />.
                </p>
                <Callout variant="attention">
                  <p>
                    Erreur qui coûte 2 pts au barème : utiliser la pente de la demande{" "}
                    <em>inverse</em> (−2) à la place de <M tex="dy/dp = -\tfrac{1}{2}" />. Les
                    deux pentes sont inverses l'une de l'autre — l'élasticité exige celle de la
                    demande directe, <M tex="y(p)" />.
                  </p>
                </Callout>
                <p>
                  Au point optimal <M tex="(y^*, p^*) = (12,\, 36)" />, l'élasticité (en valeur
                  absolue) vaut :
                </p>
                <MB tex="\varepsilon = -\frac{p}{y}\,\frac{dy}{dp} = -\frac{36}{12} \times \left(-\frac{1}{2}\right) = 3 \times \frac{1}{2} = \frac{3}{2}" />
                <p>La marge est l'écart entre le prix et le coût marginal :</p>
                <MB tex="p^* - Cm = 36 - 12 = 24 \text{ €}" />
                <p>et l'indice de Lerner rapporte cette marge au prix :</p>
                <MB tex="L = \frac{p^* - Cm}{p^*} = \frac{24}{36} = \frac{2}{3}" />
                <p>Vérification demandée par l'énoncé :</p>
                <MB tex="\frac{1}{\varepsilon} = \frac{1}{3/2} = \frac{2}{3} = L \;\;\checkmark" />
                <FormulaBox
                  label="Relation de Lerner"
                  tex="L = \frac{p - Cm}{p} = \frac{1}{\varepsilon}"
                  caption={
                    <>
                      Plus la demande est inélastique (<M tex="\varepsilon" /> proche de 1), plus
                      la marge relative du monopole est élevée. <M tex="L" /> est toujours compris
                      entre 0 et 1.
                    </>
                  }
                />
                <Callout variant="intuition">
                  <p>
                    Note que <M tex="\varepsilon = 3/2 > 1" /> : un monopole opère{" "}
                    <strong>toujours dans la partie élastique</strong> de la demande. S'il était
                    en zone inélastique, sa recette marginale serait négative : vendre une unité
                    de plus détruirait de la recette <em>tout en</em> augmentant les coûts —
                    absurde. Ici <M tex="L = 2/3" /> : deux tiers du prix sont de la marge pure,
                    un pouvoir de marché élevé, cohérent avec une demande peu élastique.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Calculer le surplus des consommateurs au point de monopole (1.4)",
            refs: [{ chapter: "ei1", section: "inefficacite" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi un triangle ?</strong> Chaque consommateur qui achète paie 36 €
                  mais aurait été prêt à payer jusqu'au prix lu sur la demande. Le surplus des
                  consommateurs additionne tous ces écarts : c'est l'aire{" "}
                  <strong>entre la courbe de demande et la ligne de prix</strong>, de{" "}
                  <M tex="y = 0" /> à <M tex="y^* = 12" />. La demande part de 60 (le prix
                  d'exclusion), le prix payé est 36, donc le triangle a pour hauteur{" "}
                  <M tex="60 - 36 = 24" /> et pour base <M tex="12" /> :
                </p>
                <MB tex="SC^{mono} = \frac{(60 - 36) \times 12}{2} = \frac{24 \times 12}{2} = \frac{288}{2} = 144 \text{ €}" />
                <GraphMonopoleQ1
                  mode="surplus"
                  caption={
                    <>
                      Les deux aires à l'optimum du monopole : le triangle bleu est le surplus des
                      consommateurs (144 €), le rectangle orange le profit de Thermolaine (288 €).
                    </>
                  }
                />
                <p>
                  <strong>Interprétation</strong> : le marché crée pour l'instant{" "}
                  <M tex="144 + 288 = 432" /> € de richesse. Garde ce total sous le coude, il va
                  servir de vérification à l'étape suivante.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Basculer en concurrence parfaite et chiffrer la perte sèche (1.4)",
            refs: [
              { chapter: "ei1", section: "concurrence" },
              { chapter: "ei1", section: "inefficacite" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi comparer ?</strong> La perte sèche se mesure par rapport à la
                  référence efficace : la concurrence parfaite. Là, les firmes sont preneuses de
                  prix et produisent jusqu'à ce que le prix égale le coût marginal :
                </p>
                <MB tex="p^e = Cm = 12" />
                <p>On reporte ce prix dans la demande pour la quantité échangée :</p>
                <MB tex="60 - 2y^e = 12 \;\;\Longleftrightarrow\;\; 2y^e = 48 \;\;\Longleftrightarrow\;\; y^e = 24" />
                <p>
                  Le diagnostic est immédiat : le monopole <strong>produit trop peu</strong>{" "}
                  (<M tex="y^* = 12 < 24 = y^e" />) et <strong>vend trop cher</strong>{" "}
                  (<M tex="36 > 12" />).
                </p>
                <p>
                  La <strong>perte sèche</strong> est la valeur des échanges gagnant-gagnant qui
                  ne se font pas : toutes les unités entre 12 et 24 valaient plus pour les
                  consommateurs (la demande) que ce qu'elles coûtaient à produire (<M tex="Cm" />).
                  C'est le triangle entre la demande et le coût marginal, entre <M tex="y^*" /> et{" "}
                  <M tex="y^e" />. Sa base verticale en <M tex="y^* = 12" /> vaut{" "}
                  <M tex="p^* - Cm = 36 - 12 = 24" /> et il s'étend sur{" "}
                  <M tex="y^e - y^* = 24 - 12 = 12" /> unités :
                </p>
                <MB tex="PS = \frac{(36 - 12) \times (24 - 12)}{2} = \frac{24 \times 12}{2} = 144 \text{ €}" />
                <GraphMonopoleQ1
                  mode="perte"
                  caption={
                    <>
                      Le triangle rose est la perte sèche (144 €) : les unités entre 12 et 24 que
                      le monopole ne produit pas alors qu'elles valaient plus que leur coût.
                    </>
                  }
                />
                <p>
                  <strong>Vérification par les surplus totaux</strong> (excellent réflexe de
                  copie) — sous le monopole :
                </p>
                <MB tex="SC + \Pi = 144 + 288 = 432 \text{ €}" />
                <p>
                  En concurrence parfaite, le profit est nul (<M tex="p = Cm" />, pas de coût
                  fixe) et tout le surplus va aux consommateurs :
                </p>
                <MB tex="SC^{e} = \frac{(60 - 12) \times 24}{2} = \frac{48 \times 24}{2} = 576 \text{ €}" />
                <p>L'écart entre les deux totaux retombe exactement sur la perte sèche :</p>
                <MB tex="576 - 432 = 144 \text{ €} \;\;\checkmark" />
                <Callout variant="intuition">
                  <p>
                    La perte sèche n'est <strong>pas un transfert</strong> vers le monopole : les
                    288 € de profit, eux, sont bien un transfert (les consommateurs paient, la
                    firme encaisse). Les 144 € de perte sèche, c'est de la richesse{" "}
                    <em>détruite</em>, que personne ne récupère — la valeur des échanges
                    mutuellement avantageux auxquels le monopole renonce pour maintenir son prix
                    élevé.
                  </p>
                </Callout>
                <Callout variant="examen">
                  <p>
                    Le barème exige « la perte sèche 144 <strong>avec le bon triangle</strong> ».
                    Beaucoup de copies calculent une aire au hasard entre deux courbes. Décris ton
                    triangle par ses trois sommets — <M tex="(12,\,36)" />, <M tex="(12,\,12)" />,{" "}
                    <M tex="(24,\,12)" /> — ou hachure-le sur ton graphique : le correcteur doit
                    voir que tu sais <em>où</em> est la perte sèche, pas seulement combien elle
                    vaut.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Rédiger la réflexion : pourquoi « p = Cm » tuerait un monopole naturel (1.5)",
            refs: [
              { chapter: "ei1", section: "regulation" },
              { chapter: "ei1", section: "exemples" },
            ],
            content: (
              <>
                <p>
                  <strong>Ce que teste la question :</strong> as-tu compris que la tarification au
                  coût marginal, idéale sur le papier, se heurte à la structure de coûts d'un
                  monopole naturel ? Pose d'abord cette structure : un coût fixe <M tex="F" />{" "}
                  très élevé et un coût marginal constant <M tex="k" /> :
                </p>
                <MB tex="CT(y) = F + k\,y \;\;\Longrightarrow\;\; CM(y) = \frac{F}{y} + k" />
                <p>
                  Le coût moyen <M tex="CM" /> décroît sans cesse (le coût fixe se répartit sur
                  plus d'unités) et reste <strong>toujours au-dessus</strong> du coût marginal{" "}
                  <M tex="k" />. C'est le cœur du problème : vendre chaque unité à son coût
                  marginal, c'est vendre <em>en dessous du coût moyen</em>.
                </p>
                <p>
                  Si le régulateur impose <M tex="p = Cm = k" /> « sans autre mesure », la firme
                  couvre exactement ses coûts variables mais rien de son coût fixe :
                </p>
                <MB tex="\Pi = (p - k)\,y - F = (k - k)\,y - F = -F < 0" />
                <p>
                  Elle perd <M tex="F" /> à chaque période et, à terme,{" "}
                  <strong>quitte le marché</strong>. La régulation détruirait le marché et tous
                  les gains de l'échange qu'il permettait : le remède serait pire que le mal.
                </p>
                <p>
                  Termine par une piste de solution (le barème en attend une) : soit{" "}
                  <strong>subventionner le coût fixe</strong> — mais les subventions peuvent être
                  interdites, exigent de lever des taxes distorsives ailleurs et affaiblissent
                  l'incitation de la firme à réduire ses coûts (recherche de rente) ; soit se
                  rabattre sur la <strong>tarification au coût moyen</strong>, solution de second
                  rang : profit nul, production plus faible que l'efficace mais supérieure à celle
                  du monopole non régulé.
                </p>
                <Callout variant="methode" title="Rédiger une question de réflexion à 5 pts">
                  <p>
                    Le barème est ton plan : (1) <M tex="Cm < CM" /> à cause du coût fixe — 2 pts ;
                    (2) pertes égales à <M tex="-F" /> et sortie du marché — 2 pts ; (3) une piste
                    de solution — 1 pt. Trois paragraphes courts, une formule chacun, zéro calcul
                    chiffré : 6 à 7 minutes maximum.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>Réponses officielles.</strong> 1.1 : <M tex="Rm = 60 - 4y" /> et{" "}
              <M tex="y^* = 12" /> · 1.2 : <M tex="p^* = 36 \text{ €}" />,{" "}
              <M tex="\Pi^* = 288 \text{ €}" /> · 1.3 : <M tex="\varepsilon = 3/2" />, marge{" "}
              <M tex="= 24 \text{ €}" />, <M tex="L = 2/3 = 1/\varepsilon" /> · 1.4 :{" "}
              <M tex="SC^{mono} = 144 \text{ €}" />, concurrence parfaite{" "}
              <M tex="(p^e, y^e) = (12,\, 24)" />, perte sèche <M tex="= 144 \text{ €}" /> · 1.5 :
              sous <M tex="p = Cm" />, un monopole naturel perd son coût fixe (<M tex="\Pi = -F" />)
              et sort du marché — il faut une subvention ou une tarification au coût moyen.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> le triple réflexe du monopole — <M tex="Rm = Cm" />{" "}
              pour la quantité, la <em>demande</em> pour le prix, le graphique pour les surplus.
              Et la relation <M tex="L = 1/\varepsilon" /> comme vérification systématique.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList refs={[{ session: 1, exercise: "ex1" }]} className="mt-1.5" />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 2 — Discrimination par les prix (35 pts)             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-1"
        id="q2"
        number={2}
        title="Question 2 — Discrimination par les prix (35 pts)"
        difficulty={3}
        refs={[
          { chapter: "ei3", section: "fil-conducteur" },
          { chapter: "ei3", section: "premier-degre" },
          { chapter: "ei3", section: "deuxieme-degre" },
        ]}
        statement={
          <>
            <p>
              La brûlerie <strong>Arabica &amp; Co</strong> est l'unique fournisseur d'un café de
              spécialité qu'elle produit à un <strong>coût marginal constant de 4 euros le kilo</strong>,
              sans coût fixe. Elle n'a que deux clients : le restaurant L (le « gros »
              consommateur) et le salon de thé S (le « petit » consommateur). Leurs demandes
              inverses sont :
            </p>
            <MB tex="\text{L} : \; p = 20 - y_L \qquad\qquad \text{S} : \; p = 20 - 2y_S" />
            <p>où les quantités sont en kilos par semaine et les prix en euros.</p>
            <SubQuestion label="2.1)">
              Suppose d'abord que la brûlerie ne peut pas discriminer : elle affiche un prix
              unique <M tex="p" /> au kilo, auquel chaque client achète la quantité qu'il désire.
              Détermine la demande agrégée, puis la quantité totale optimale, le prix optimal et
              le profit de la brûlerie. Précise les quantités achetées par chacun des deux
              clients. (12 points)
            </SubQuestion>
            <SubQuestion label="2.2)">
              La brûlerie connaît maintenant parfaitement chacun de ses deux clients et peut
              pratiquer une discrimination du <em>premier degré</em> : elle propose à chacun une
              offre personnalisée « à prendre ou à laisser » de la forme [montant total{" "}
              <M tex="m" /> ; quantité <M tex="y" />]. Détermine la quantité et le montant de
              chaque offre, ainsi que le profit de la brûlerie. Cette situation est-elle efficace
              au sens de Pareto ? Que devient le surplus des consommateurs ? (15 points)
            </SubQuestion>
            <SubQuestion label="2.3)">
              Question de réflexion. La brûlerie envisage plutôt d'afficher les deux offres de la
              sous-question 2.2 sur son site et de laisser chaque client choisir librement son lot
              (discrimination du <em>deuxième degré</em>). Explique pourquoi elle est alors
              obligée de laisser au gros consommateur L une « rente d'information » : indique quel
              lot L serait tenté de choisir et pourquoi, quelle contrainte cela impose au monopole
              sur le montant du gros lot, et comment le monopole réagit sur la taille du petit lot
              pour limiter cette rente. Aucun calcul complet n'est demandé. (8 points)
            </SubQuestion>
          </>
        }
        steps={[
          /* ------------------------------------------------------ */
          {
            title: "Décoder l'énoncé : trois régimes de tarification à identifier",
            refs: [
              { chapter: "ei3", section: "intro" },
              { chapter: "ei3", section: "fil-conducteur" },
            ],
            content: (
              <>
                <p>
                  Un vendeur unique, <strong>deux clients aux demandes différentes</strong> — un
                  « gros » (L) et un « petit » (S) : tu es exactement dans la structure du
                  chapitre EI3, celle de l'exemple fil conducteur (avec des nombres différents et
                  un coût marginal de 4). Chaque sous-question correspond à un régime de
                  tarification, et l'énoncé te le souffle mot pour mot :
                </p>
                <ul className="my-2 list-disc space-y-1 pl-6">
                  <li>
                    « affiche un <strong>prix unique</strong> auquel chacun achète ce qu'il
                    désire » → <strong>monopole simple</strong> sur la demande agrégée (2.1) ;
                  </li>
                  <li>
                    « connaît parfaitement chacun » + « offre personnalisée{" "}
                    <strong>à prendre ou à laisser</strong> [montant ; quantité] » →{" "}
                    <strong>discrimination du premier degré</strong> (2.2) ;
                  </li>
                  <li>
                    « affiche les offres et laisse chacun <strong>choisir librement</strong> » →{" "}
                    <strong>discrimination du deuxième degré</strong>, en question de réflexion
                    (2.3).
                  </li>
                </ul>
                <Callout variant="methode" title="Les mots de l'énoncé qui trahissent le régime">
                  <p>
                    Prix unique pour tous = monopole simple. Offres personnalisées imposées client
                    par client = 1er degré (information parfaite). Menu affiché, libre choix =
                    2e degré (information privée : chacun peut se faire passer pour un autre).
                    Prix différents par <em>groupe observable</em> (étudiants, seniors…) =
                    3e degré — absent de cet examen, mais garde le radar allumé.
                  </p>
                </Callout>
                <p>
                  Données à encadrer au brouillon : <M tex="y_L : p = 20 - y_L" />,{" "}
                  <M tex="y_S : p = 20 - 2y_S" />, <M tex="Cm = 4" />, pas de coût fixe. Note que
                  les deux demandes partent du même prix d'exclusion (20 €) mais que celle de L
                  est deux fois plus « large » : à tout prix, L achète le double de S.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Agréger les demandes : inverser, sommer, ré-inverser (2.1)",
            refs: [{ chapter: "ei3", section: "fil-conducteur" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi agréger ?</strong> Avec un prix unique, la brûlerie ne voit
                  qu'une seule chose : la quantité <em>totale</em> demandée à chaque prix. Il faut
                  donc construire la demande du marché. Or les demandes sont données sous forme{" "}
                  <em>inverse</em> (prix en fonction des quantités), et on ne peut pas les
                  additionner telles quelles : à un prix donné, ce sont les <em>quantités</em> qui
                  s'ajoutent. D'où la routine en trois temps.
                </p>
                <p>
                  <strong>Temps 1 — inverser</strong> chaque demande pour obtenir les quantités en
                  fonction du prix :
                </p>
                <MB tex="p = 20 - y_L \;\;\Longleftrightarrow\;\; y_L = 20 - p" />
                <MB tex="p = 20 - 2y_S \;\;\Longleftrightarrow\;\; 2y_S = 20 - p \;\;\Longleftrightarrow\;\; y_S = 10 - \tfrac{1}{2}p" />
                <p>
                  <strong>Temps 2 — sommer les quantités</strong> au prix commun <M tex="p" /> :
                </p>
                <MB tex="Y = y_L + y_S = (20 - p) + \left(10 - \tfrac{1}{2}p\right) = 30 - \tfrac{3}{2}p" />
                <p>
                  <strong>Temps 3 — ré-inverser</strong> pour retrouver une demande inverse, la
                  forme dont on a besoin pour écrire la recette :
                </p>
                <MB tex="\tfrac{3}{2}p = 30 - Y \;\;\Longleftrightarrow\;\; p = 20 - \tfrac{2}{3}Y" />
                <Callout variant="attention">
                  <p>
                    On somme <strong>les quantités, jamais les prix</strong> ! Additionner les
                    demandes inverses (« <M tex="p = 40 - 3Y" /> »…) est un grand classique des
                    copies et fausse toute la suite — l'agrégation correcte vaut 3 pts à elle
                    seule. Petit confort ici : les deux demandes partent du même prix de 20 €,
                    donc pas de « coude » à gérer — en dessous de 20 €, les deux clients sont
                    actifs et la formule agrégée est valable partout où l'on travaille.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Résoudre le monopole simple sur la demande agrégée (2.1)",
            refs: [
              { chapter: "ei3", section: "fil-conducteur" },
              { chapter: "ei1", section: "maximisation" },
            ],
            content: (
              <>
                <p>
                  <strong>Pourquoi la même méthode qu'en Q1 ?</strong> Une fois la demande
                  agrégée posée, la brûlerie est un monopole ordinaire face à une demande
                  linéaire : recette totale, recette marginale, <M tex="Rm = Cm" />. La recette
                  totale s'écrit :
                </p>
                <MB tex="RT(Y) = p(Y)\,Y = \left(20 - \tfrac{2}{3}Y\right)Y = 20Y - \tfrac{2}{3}Y^2" />
                <p>La recette marginale en est la dérivée (règle de la pente double) :</p>
                <MB tex="Rm(Y) = 20 - \tfrac{4}{3}Y" />
                <p>
                  La condition d'optimum <M tex="Rm = Cm" /> avec <M tex="Cm = 4" /> :
                </p>
                <MB tex="20 - \tfrac{4}{3}Y^* = 4 \;\;\Longleftrightarrow\;\; \tfrac{4}{3}Y^* = 16" />
                <p>
                  On multiplie les deux membres par <M tex="\tfrac{3}{4}" /> :
                </p>
                <MB tex="Y^* = 16 \times \tfrac{3}{4} = 12 \text{ kilos}" />
                <p>Le prix se lit sur la demande agrégée :</p>
                <MB tex="p^* = 20 - \tfrac{2}{3} \times 12 = 20 - 8 = 12 \text{ €}" />
                <p>et le profit vaut la marge fois la quantité :</p>
                <MB tex="\Pi^* = (p^* - Cm)\,Y^* = (12 - 4) \times 12 = 96 \text{ €}" />
                <p>
                  <strong>Qui achète quoi ?</strong> Au prix de 12 €, chaque client se sert sur sa
                  propre demande directe :
                </p>
                <MB tex="y_L = 20 - 12 = 8 \text{ kilos} \qquad\qquad y_S = 10 - \tfrac{12}{2} = 10 - 6 = 4 \text{ kilos}" />
                <p>
                  Vérification immédiate : <M tex="8 + 4 = 12 = Y^*" /> — les quantités
                  individuelles rebouclent sur le total, et L achète bien le double de S.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux faux optimums vus et revus par les correcteurs : (i) écrire{" "}
                    <M tex="p = Cm" /> — c'est la concurrence parfaite, pas le monopole ; (ii)
                    oublier le coût marginal et résoudre <M tex="Rm = 0" /> — valable uniquement
                    quand <M tex="Cm = 0" />, ce qui n'est <em>pas</em> le cas ici. Les deux
                    mènent à des valeurs fausses en cascade sur prix, quantités et profit.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Poser la logique du premier degré : deux questions, deux réponses (2.2)",
            refs: [{ chapter: "ei3", section: "premier-degre" }],
            content: (
              <>
                <p>
                  <strong>Changement complet de logique.</strong> La brûlerie connaît maintenant
                  parfaitement chaque client et lui impose une offre « à prendre ou à laisser »
                  [montant <M tex="m" /> ; quantité <M tex="y" />] : le client paie{" "}
                  <M tex="m" /> pour le lot entier ou repart sans rien. Il n'y a plus de « prix au
                  kilo » — et le monopole se pose, client par client, deux questions séparées :
                </p>
                <ul className="my-2 list-disc space-y-1 pl-6">
                  <li>
                    <strong>Quelle quantité mettre dans le lot ?</strong> Celle qui maximise le
                    surplus créé par l'échange : on produit chaque kilo tant qu'il vaut plus pour
                    le client (sa disposition à payer marginale, lue sur sa demande) qu'il ne
                    coûte (<M tex="Cm" />). On s'arrête là où la demande croise le coût marginal.
                  </li>
                  <li>
                    <strong>Quel montant demander ?</strong> Le maximum que le client est prêt à
                    payer pour le lot entier : sa disposition à payer <em>totale</em>,
                    c'est-à-dire <strong>toute l'aire sous sa demande</strong> jusqu'à la quantité
                    du lot. Le client est alors exactement indifférent entre accepter et refuser —
                    il accepte, avec un surplus nul.
                  </li>
                </ul>
                <FormulaBox
                  label="Premier degré — la recette en deux temps"
                  tex="\underbrace{p_i(y_i) = Cm}_{\text{taille du lot du client } i} \qquad\qquad \underbrace{m_i = \int_0^{y_i} p_i(u)\,du}_{\text{montant : aire sous sa demande}}"
                  caption={
                    <>
                      En pratique, avec une demande linéaire, l'aire se calcule sans intégrale :
                      c'est un trapèze (ou un rectangle + un triangle).
                    </>
                  }
                />
                <Callout variant="methode" title="Raisonner sur le lot entier, pas kilo par kilo">
                  <p>
                    Avec un forfait « à prendre ou à laisser », la décision du client est binaire :
                    accepter si (valeur totale du lot) − (montant) <M tex="\geq 0" />. C'est
                    pourquoi le montant se calibre sur la valeur <em>totale</em> (l'aire complète
                    sous la demande) et non sur le prix de la dernière unité — l'erreur classique
                    étant d'écrire <M tex="m = p(y) \times y" />, ce qui n'extrait qu'une partie
                    du surplus.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Calculer les deux offres personnalisées [m ; y] (2.2)",
            refs: [{ chapter: "ei3", section: "premier-degre" }],
            content: (
              <>
                <p>
                  <strong>Les quantités</strong> — chaque demande croise le coût marginal{" "}
                  <M tex="Cm = 4" /> :
                </p>
                <MB tex="\text{L} : \;\; 20 - y_\ell = 4 \;\;\Longrightarrow\;\; y_\ell = 16 \text{ kilos}" />
                <MB tex="\text{S} : \;\; 20 - 2y_s = 4 \;\;\Longrightarrow\;\; 2y_s = 16 \;\;\Longrightarrow\;\; y_s = 8 \text{ kilos}" />
                <p>
                  <strong>Les montants</strong> — l'aire sous chaque demande jusqu'à la quantité
                  offerte. Pour L, l'aire sous <M tex="p = 20 - y" /> de 0 à 16 est un trapèze de
                  bases 20 (en 0) et 4 (en 16) :
                </p>
                <MB tex="m_\ell = \frac{20 + 4}{2} \times 16 = 12 \times 16 = 192 \text{ €}" />
                <p>
                  Même calcul par découpage, pour vérifier : rectangle de hauteur 4 (
                  <M tex="4 \times 16 = 64" />) plus triangle au-dessus (
                  <M tex="\tfrac{(20 - 4) \times 16}{2} = 128" />), soit{" "}
                  <M tex="64 + 128 = 192" />. Pour S, trapèze de bases 20 et 4 sur 8 kilos :
                </p>
                <MB tex="m_s = \frac{20 + 4}{2} \times 8 = 12 \times 8 = 96 \text{ €}" />
                <p>
                  (Découpage : <M tex="4 \times 8 = 32" /> de rectangle plus{" "}
                  <M tex="\tfrac{16 \times 8}{2} = 64" /> de triangle, soit 96.) Chaque client{" "}
                  <strong>accepte</strong> son offre : le lot lui procure exactement la valeur
                  qu'il paie — surplus nul, mais pas négatif.
                </p>
                <GraphPremierDegre
                  caption={
                    <>
                      Les deux offres du premier degré : la quantité s'arrête où la demande croise{" "}
                      <M tex="Cm = 4" />, et le montant égale <em>toute</em> l'aire colorée sous
                      la demande (coût en vert + profit en orange) : 192 € pour L, 96 € pour S.
                    </>
                  }
                />
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Calculer le profit et juger l'efficacité de la situation (2.2)",
            refs: [
              { chapter: "ei3", section: "premier-degre" },
              { chapter: "ei1", section: "inefficacite" },
            ],
            content: (
              <>
                <p>
                  <strong>Le profit</strong> : recettes des deux lots, moins le coût de production
                  des <M tex="16 + 8 = 24" /> kilos à 4 € pièce :
                </p>
                <MB tex="\Pi = (m_\ell - 4 \times 16) + (m_s - 4 \times 8) = (192 - 64) + (96 - 32)" />
                <MB tex="\Pi = 128 + 64 = 192 \text{ €}" />
                <p>
                  Le profit fait un bond de 96 € à 192 € : la discrimination parfaite{" "}
                  <strong>double</strong> le profit du monopole simple.
                </p>
                <p>
                  <strong>Efficacité au sens de Pareto ?</strong> Oui. Pour chaque client, toutes
                  les unités dont la valeur dépasse le coût marginal sont produites, et on
                  s'arrête exactement quand les deux s'égalisent — le critère même de
                  l'efficacité. Compare les surplus totaux : sous le monopole simple,
                </p>
                <MB tex="W^{simple} = \underbrace{96}_{\Pi} + \underbrace{\tfrac{(20 - 12) \times 8}{2}}_{SC_L = 32} + \underbrace{\tfrac{(20 - 12) \times 4}{2}}_{SC_S = 16} = 144 \text{ €}" />
                <p>tandis qu'au premier degré :</p>
                <MB tex="W^{1er} = 192 + 0 = 192 \text{ €}" />
                <p>
                  Le surplus total est maximal : la perte sèche du monopole simple (
                  <M tex="192 - 144 = 48" /> €) a entièrement disparu. Mais ce surplus est{" "}
                  <strong>intégralement capté par la brûlerie</strong> : le surplus des
                  consommateurs est <strong>nul</strong>.
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Régime</th>
                        <th className={THc}>Quantités (L / S)</th>
                        <th className={THc}>Profit</th>
                        <th className={THc}>Surplus conso.</th>
                        <th className={THc}>Surplus total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>Monopole simple (p = 12 €)</td>
                        <td className={TDc}>8 / 4</td>
                        <td className={TDc}>96 €</td>
                        <td className={TDc}>32 € + 16 €</td>
                        <td className={TDc}>144 €</td>
                      </tr>
                      <tr>
                        <td className={TD}>Discrimination 1er degré</td>
                        <td className={TDc}>16 / 8</td>
                        <td className={TDc}>
                          <strong>192 €</strong>
                        </td>
                        <td className={TDc}>0 €</td>
                        <td className={TDc}>
                          <strong>192 €</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Callout variant="intuition" title="Efficace ne veut pas dire équitable">
                  <p>
                    C'est la conclusion officielle du cours, et elle déroute au premier abord : la
                    discrimination parfaite <em>supprime</em> l'inefficacité du monopole (toutes
                    les unités utiles sont produites) tout en laissant les consommateurs à zéro
                    surplus. L'efficacité de Pareto parle de la <em>taille</em> du gâteau, pas de
                    son <em>partage</em>. Une réponse d'examen complète mentionne les deux
                    facettes : « efficace, oui ; mais tout le surplus va au monopole ».
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Expliquer la rente d'information du deuxième degré (2.3)",
            refs: [{ chapter: "ei3", section: "deuxieme-degre" }],
            content: (
              <>
                <p>
                  <strong>Ce qui change :</strong> les offres ne sont plus imposées client par
                  client — elles sont affichées, et chacun choisit librement. La brûlerie ne peut
                  plus « viser » L avec le gros lot : il faut que L le choisisse{" "}
                  <em>volontairement</em>. La réponse attendue s'articule en trois temps, qui sont
                  exactement les trois lignes du barème.
                </p>
                <p>
                  <strong>(i) Le petit lot est une bonne affaire pour L.</strong> Le montant{" "}
                  <M tex="m_s = 96" /> € est calibré pour capter exactement la disposition à payer
                  de S. Or, à toute quantité, la demande de L est au-dessus de celle de S : les
                  8 kilos du petit lot valent strictement plus pour L que pour S. Si le menu du
                  premier degré restait affiché tel quel, L obtiendrait un surplus strictement
                  positif en prenant le petit lot, alors que le gros lot (calibré pour tout lui
                  prendre) le laisse à zéro : L se ferait passer pour un petit consommateur.
                  Calcul éclair pour t'en convaincre (non exigé) : les 8 premiers kilos valent{" "}
                  <M tex="\tfrac{20 + 12}{2} \times 8 = 128" /> € pour L, payés 96 € — soit 32 €
                  de surplus en « trichant », contre 0 € en jouant le jeu.
                </p>
                <p>
                  <strong>(ii) La contrainte d'incitation.</strong> Pour que L choisisse quand
                  même le gros lot, la brûlerie doit <strong>baisser son montant</strong>{" "}
                  <M tex="m_\ell" /> jusqu'à ce que le surplus de L sur le gros lot soit au moins
                  égal à celui que lui offrirait le petit lot. Ce surplus positif concédé à L est
                  la <strong>rente d'information</strong> : le prix que le monopole paie pour que
                  L révèle son type. Elle vient de l'avantage informationnel de L — lui seul sait
                  qu'il est un gros consommateur, et le petit lot lui offre une porte de sortie.
                </p>
                <p>
                  <strong>(iii) La réaction du monopole : rationner le petit lot.</strong> Pour
                  réduire cette rente, la brûlerie déforme le petit lot <em>vers le bas</em> —
                  moins de 8 kilos, donc moins que la taille efficace du premier degré. Moins le
                  petit lot est attrayant pour L, moins il faut lui concéder pour le garder sur le
                  gros lot. Le monopole arbitre entre la rente laissée à L et le profit perdu sur
                  S : d'où un petit lot rationné, et une perte d'efficacité par rapport au premier
                  degré.
                </p>
                <Callout variant="examen">
                  <p>
                    Le barème suit mot pour mot cette structure : (i) le petit lot vaut plus pour
                    L que pour S, donc surplus positif s'il le prend — 3 pts ; (ii) baisse de{" "}
                    <M tex="m_\ell" />, contrainte d'incitation = rente d'information — 3 pts ;
                    (iii) rationnement du petit lot pour réduire la rente — 2 pts. « Aucun calcul
                    complet n'est demandé » : ne pars pas résoudre le programme du 2e degré, tu
                    perdrais 10 minutes pour 0 point supplémentaire.
                  </p>
                </Callout>
                <Callout variant="retiens">
                  <p>
                    La hiérarchie des profits à mémoriser : 1er degré (192 €){" "}
                    <M tex="\;>\;" /> 2e degré <M tex="\;>\;" /> monopole simple (96 €). Le
                    2e degré s'intercale toujours entre les deux : l'information privée des
                    clients coûte au monopole (la rente de L), mais discriminer, même
                    imparfaitement, rapporte plus qu'un prix unique.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>Réponses officielles.</strong> 2.1 : demande agrégée{" "}
              <M tex="Y = 30 - \tfrac{3}{2}p" /> (soit <M tex="p = 20 - \tfrac{2}{3}Y" />),{" "}
              <M tex="Y^* = 12" />, <M tex="p^* = 12 \text{ €}" />,{" "}
              <M tex="\Pi^* = 96 \text{ €}" />, avec <M tex="y_L = 8" /> et <M tex="y_S = 4" /> ·
              2.2 : offres [192 € ; 16 kg] pour L et [96 € ; 8 kg] pour S,{" "}
              <M tex="\Pi = 192 \text{ €}" />, situation Pareto-efficace, surplus des
              consommateurs nul · 2.3 : L serait tenté par le petit lot (surplus positif), donc
              baisse de <M tex="m_\ell" /> = rente d'information, et rationnement du petit lot
              pour limiter la rente.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> prix unique → agréger les <em>quantités</em> puis{" "}
              <M tex="Rm = Cm" /> ; premier degré → taille du lot où la demande croise{" "}
              <M tex="Cm" />, montant = aire sous la demande ; libre choix → contrainte
              d'incitation et rente d'information pour le gros client.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                { session: 3, exercise: "ex1" },
                { session: 1, exercise: "ex1", label: "revoir la routine Rm = Cm du monopole" },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />

      {/* ============================================================ */}
      {/* Question 3 — Bertrand avec coûts asymétriques (25 pts)        */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="exam-p2-blanc-1"
        id="q3"
        number={3}
        title="Question 3 — Bertrand avec coûts asymétriques (25 pts)"
        difficulty={2}
        refs={[{ chapter: "ei2", section: "bertrand" }]}
        statement={
          <>
            <p>
              Soit un marché régional du ciment en vrac, un bien <strong>parfaitement homogène</strong> :
              les clients achètent simplement chez le producteur le moins cher. La demande y est
            </p>
            <MB tex="Q = 300 - p" />
            <p>
              où <M tex="Q" /> est la quantité en tonnes et <M tex="p" /> le prix en euros la
              tonne. Deux cimenteries se font une <strong>concurrence en prix (à la Bertrand)</strong> :
              Cimex a un coût marginal constant <M tex="c_1 = 60" /> et Bétolith un coût marginal
              constant <M tex="c_2 = 90" />. Aucune des deux n'a de coût fixe. Si les deux firmes
              affichent le même prix, elles se partagent le marché à parts égales.
            </p>
            <SubQuestion label="3.1)">
              Trouve le prix de l'équilibre de Bertrand. Justifie soigneusement ta réponse :
              pourquoi le prix s'établit-il à ce niveau, et quelle firme sert le marché ? Quelle
              quantité est échangée à l'équilibre ? (12 points)
            </SubQuestion>
            <SubQuestion label="3.2)">
              Calcule le profit de chacune des deux firmes à cet équilibre. (7 points)
            </SubQuestion>
            <SubQuestion label="3.3)">
              Que devient l'équilibre si les deux cimenteries ont le même coût marginal,{" "}
              <M tex="c_1 = c_2 = 60" /> ? Quel nom donne-t-on à ce résultat, et pourquoi est-il
              remarquable ? Explique brièvement. (6 points)
            </SubQuestion>
          </>
        }
        steps={[
          /* ------------------------------------------------------ */
          {
            title: "Décoder l'énoncé : Bertrand asymétrique, pas Cournot",
            refs: [{ chapter: "ei2", section: "bertrand" }],
            content: (
              <>
                <p>
                  Trois indices, tous décisifs : « <strong>bien parfaitement homogène</strong> »,
                  « les clients achètent chez le <strong>moins cher</strong> », «{" "}
                  <strong>concurrence en prix (à la Bertrand)</strong> ». Tu es dans le modèle de
                  Bertrand du chapitre EI2 — mais avec une torsion : les coûts sont{" "}
                  <strong>asymétriques</strong> (<M tex="c_1 = 60" /> pour Cimex,{" "}
                  <M tex="c_2 = 90" /> pour Bétolith). Le résultat du cours « prix = coût
                  marginal, profits nuls » doit être <em>adapté</em>, pas récité.
                </p>
                <p>
                  Autre particularité : un exercice de Bertrand{" "}
                  <strong>ne se résout pas avec une dérivée</strong>. Pas de fonction de réaction
                  continue, pas de condition de premier ordre : la demande de chaque firme saute
                  brutalement selon qu'elle est la moins chère ou non. On raisonne par{" "}
                  <strong>élimination de déviations profitables</strong> — un raisonnement rédigé,
                  pas un calcul.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux réflexes à réprimer : (i) sortir la machinerie de Cournot (fonctions de
                    réaction, <M tex="q_1, q_2" />…) — hors sujet, l'arme stratégique est ici le{" "}
                    <em>prix</em> ; (ii) réciter « Bertrand <M tex="\Rightarrow" /> p = Cm et
                    profits nuls » — ce résultat suppose des coûts <em>identiques</em>. Avec des
                    coûts différents, le prix s'établit au coût du concurrent le{" "}
                    <strong>moins efficace</strong>, et la firme efficace gagne de l'argent.
                    Justement ce que la question 3.3 te fera comparer.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Comprendre l'arme du jeu : une demande en tout ou rien",
            refs: [{ chapter: "ei2", section: "bertrand" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi ce détour ?</strong> Toute la logique de Bertrand découle de la
                  forme très particulière de la demande adressée à chaque firme. Le bien étant
                  homogène, le client n'a qu'un critère : le prix. Pour Cimex (et symétriquement
                  pour Bétolith) :
                </p>
                <MB tex="D_1(p_1, p_2) = \begin{cases} 300 - p_1 & \text{si } p_1 < p_2 \\[2pt] \tfrac{300 - p_1}{2} & \text{si } p_1 = p_2 \\[2pt] 0 & \text{si } p_1 > p_2 \end{cases}" />
                <p>
                  Passer un centime <em>sous</em> le prix du rival fait bondir la demande de
                  moitié du marché à tout le marché ; passer un centime <em>au-dessus</em> la fait
                  tomber à zéro. C'est cette discontinuité qui alimente la{" "}
                  <strong>sous-enchère</strong> : tant qu'un prix laisse une marge positive aux
                  deux firmes, chacune a intérêt à passer juste en dessous de l'autre.
                </p>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Éliminer tous les candidats : le raisonnement de sous-enchère (3.1)",
            refs: [{ chapter: "ei2", section: "bertrand" }],
            content: (
              <>
                <p>
                  On procède par élimination, en trois arguments — c'est le cœur du barème
                  (8 points sur 12) :
                </p>
                <p>
                  <strong>(i) Jamais en dessous de son propre coût marginal.</strong> Une firme
                  qui vend sous son coût perd de l'argent sur chaque tonne : Bétolith ne
                  descendra donc jamais sous <M tex="c_2 = 90" />, ni Cimex sous{" "}
                  <M tex="c_1 = 60" />.
                </p>
                <p>
                  <strong>(ii) Aucun prix strictement supérieur à 90 ne tient.</strong> À un tel
                  prix, la firme la plus chère ne vend rien (bien homogène), et chacune des deux
                  peut encore gagner tout le marché avec une marge positive en passant légèrement
                  sous l'autre. La sous-enchère se poursuit donc tant que les <em>deux</em> firmes
                  peuvent suivre… c'est-à-dire jusqu'à 90.
                </p>
                <p>
                  <strong>(iii) En p = 90, Bétolith décroche.</strong> Elle refuserait de vendre
                  sous son coût marginal, tandis que Cimex conserve une marge confortable de{" "}
                  <M tex="90 - 60 = 30" /> € par tonne. Cimex fixe donc son prix{" "}
                  <strong>juste en dessous de 90</strong> et rafle tout le marché ; Bétolith ne
                  produit rien.
                </p>
                <GraphBertrandLigne
                  caption={
                    <>
                      La logique de Bertrand asymétrique sur la droite des prix : la sous-enchère
                      balaie tout prix au-dessus de 90, Bétolith ne peut pas suivre en dessous, et
                      Cimex s'installe juste sous 90 — loin de son prix de monopole (180).
                    </>
                  }
                />
                <Callout variant="methode" title="Prouver un équilibre de Bertrand">
                  <p>
                    Un équilibre de Nash en prix se démontre en deux mouvements : (1){" "}
                    <em>éliminer</em> tous les autres candidats (chacun est détruit par une
                    déviation profitable — la sous-enchère) ; (2) <em>vérifier</em> qu'au prix
                    retenu, aucune des deux firmes n'a de déviation profitable. Rédige toujours
                    ces deux mouvements : un prix affirmé sans justification ne rapporte que les
                    points de résultat.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Conclure : p* ≃ 90, Cimex sert tout le marché, Q* = 210 (3.1)",
            refs: [{ chapter: "ei2", section: "bertrand" }],
            content: (
              <>
                <p>L'équilibre est donc :</p>
                <MB tex="p^* \simeq c_2 = 90 \text{ €/tonne} \qquad\qquad Q^* = 300 - 90 = 210 \text{ tonnes}" />
                <p>
                  toutes vendues par <strong>Cimex</strong>, la firme au coût le plus bas.
                  Vérifions qu'aucune déviation ne paie. Bétolith : égaler ou battre 90 la ferait
                  vendre à perte ; rester au-dessus la laisse à zéro vente — rien à faire. Cimex :
                  baisser son prix rognerait sa marge sans gagner de clients supplémentaires
                  qu'elle n'ait déjà ; monter au-dessus de 90 redonnerait à Bétolith la
                  possibilité de la sous-coter avec profit.
                </p>
                <p>
                  Et remarque bien que Cimex <em>aimerait</em> vendre plus cher : seule sur le
                  marché, elle choisirait son prix de monopole,
                </p>
                <MB tex="\max_p \;(p - 60)(300 - p) \;\;\Longrightarrow\;\; p^{M} = \frac{300 + 60}{2} = 180 \text{ €}" />
                <p>
                  très au-dessus de 90. C'est la présence de Bétolith — pourtant{" "}
                  <strong>inactive à l'équilibre</strong> — qui plafonne le prix à 90.
                </p>
                <FormulaBox
                  label="Bertrand avec coûts asymétriques"
                  tex="c_1 < c_2 \;\;\Longrightarrow\;\; p^* \simeq c_2 \;\; \text{et la firme efficace sert tout le marché}"
                  caption={
                    <>
                      Le prix d'équilibre est déterminé par le coût du concurrent le{" "}
                      <em>moins</em> efficace — c'est lui qui fixe le niveau en dessous duquel la
                      sous-enchère s'arrête (tant que le prix de monopole de la firme efficace le
                      dépasse, comme ici : 180 &gt; 90).
                    </>
                  }
                />
                <Callout variant="intuition" title="La concurrence agit même sans vendre">
                  <p>
                    Bétolith ne produit rien, et pourtant elle « travaille » : sa simple capacité
                    à entrer sous tout prix supérieur à 90 discipline Cimex, qui doit renoncer à
                    90 € de marge par tonne (180 − 90). La concurrence <em>potentielle</em> suffit
                    à contraindre les prix — une idée que tu retrouveras dans la dissuasion
                    d'entrée du TP 2.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Calculer les profits des deux firmes (3.2)",
            refs: [{ chapter: "ei2", section: "bertrand" }],
            content: (
              <>
                <p>
                  <strong>Cimex</strong> vend les 210 tonnes à (quasiment) 90 € l'une, pour un
                  coût marginal de 60 € — sa marge unitaire est de 30 € :
                </p>
                <MB tex="\Pi_{\text{Cimex}} \simeq (90 - 60) \times 210 = 30 \times 210 = 6\,300 \text{ €}" />
                <p>
                  <strong>Bétolith</strong> ne vend rien et n'a pas de coût fixe :
                </p>
                <MB tex="\Pi_{\text{Bétolith}} = 0 \text{ €}" />
                <p>
                  <strong>Interprétation</strong> — contrairement au cas symétrique du cours,
                  Bertrand ne condamne pas ici les profits à zéro : la firme efficace transforme
                  son avantage de coût <M tex="c_2 - c_1 = 30" /> € en marge. Son profit est
                  précisément la valeur de son avantage technologique sur les tonnes vendues.
                </p>
                <Callout variant="examen">
                  <p>
                    Écris le « ≃ » (ou signale que le prix est « juste en dessous de 90 ») mais
                    calcule avec 90 tout rond : c'est ce que fait le corrigé officiel, et les
                    7 points se répartissent en 5 pts pour les 6 300 € de Cimex et 2 pts pour le
                    profit nul de Bétolith — n'oublie pas cette seconde moitié de réponse, même si
                    elle paraît évidente.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------ */
          {
            title: "Traiter le cas symétrique : le paradoxe de Bertrand (3.3)",
            refs: [
              { chapter: "ei2", section: "bertrand" },
              { chapter: "ei2", section: "cournot" },
            ],
            content: (
              <>
                <p>
                  Si <M tex="c_1 = c_2 = 60" />, le même raisonnement de sous-enchère descend
                  maintenant jusqu'à 60 : tout prix commun supérieur à 60 est détruit (baisser
                  d'un centime fait passer de la moitié à la totalité du marché — la déviation
                  paie), et aucune firme ne descend sous 60. En <M tex="p = 60" />, aucune
                  déviation n'est profitable : monter, c'est perdre tous ses clients ; descendre,
                  c'est vendre à perte. Le seul équilibre de Bertrand-Nash est donc :
                </p>
                <MB tex="p_1^* = p_2^* = c = 60 \qquad Q = 300 - 60 = 240 \text{ tonnes} \qquad \Pi_1 = \Pi_2 = 0" />
                <p>
                  Les deux firmes se partagent les 240 tonnes et réalisent un{" "}
                  <strong>profit nul</strong>.
                </p>
                <p>
                  Ce résultat porte un nom, exigé par le barème : le{" "}
                  <strong>paradoxe de Bertrand</strong>. Il est remarquable parce qu'il suffit de{" "}
                  <em>deux</em> firmes en concurrence par les prix pour retrouver l'issue de la
                  concurrence parfaite — prix au coût marginal, pouvoir de marché entièrement
                  volatilisé — alors que le même duopole en concurrence par les{" "}
                  <em>quantités</em> (Cournot) maintiendrait un prix au-dessus du coût marginal et
                  des profits positifs. À demande et coûts identiques, l'issue change du tout au
                  tout selon l'arme stratégique choisie : prix ou quantités.
                </p>
                <Callout variant="retiens">
                  <p>
                    Le triptyque à connaître : <strong>Bertrand symétrique</strong> → p = Cm,
                    profits nuls dès 2 firmes (paradoxe) ; <strong>Bertrand asymétrique</strong> →
                    p ≃ coût du moins efficace, seule la firme efficace gagne ;{" "}
                    <strong>Cournot</strong> → prix entre Cm et prix de monopole, profits positifs
                    qui fondent avec le nombre de firmes.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>Réponses officielles.</strong> 3.1 : <M tex="p^* \simeq c_2 = 90 \text{ €}" />{" "}
              la tonne, fixé par Cimex juste sous le coût de Bétolith ; Cimex sert tout le marché,{" "}
              <M tex="Q^* = 300 - 90 = 210" /> tonnes · 3.2 :{" "}
              <M tex="\Pi_{\text{Cimex}} \simeq 6\,300 \text{ €}" />,{" "}
              <M tex="\Pi_{\text{Bétolith}} = 0 \text{ €}" /> · 3.3 : avec{" "}
              <M tex="c_1 = c_2 = 60" />, l'équilibre devient <M tex="p_1^* = p_2^* = 60" />,{" "}
              <M tex="Q = 240" />, profits nuls — le <strong>paradoxe de Bertrand</strong> : deux
              firmes suffisent pour l'issue concurrentielle.
            </p>
            <p className="mt-2">
              <strong>À retenir :</strong> Bertrand se résout par un raisonnement de sous-enchère
              et de déviations, jamais par une dérivée ; avec des coûts asymétriques, le prix est
              plafonné par le coût du concurrent le moins efficace, et l'avantage de coût est la
              seule source de profit.
            </p>
            <p className="mt-3 font-semibold">🏋️ Pour t'entraîner sur ce type de question :</p>
            <TpRefList
              refs={[
                {
                  session: 2,
                  exercise: "ex1",
                  label: "Alice & Baptiste — comparer avec la concurrence en quantités (Cournot)",
                },
                {
                  session: 2,
                  exercise: "ex2",
                  label: "dissuasion d'entrée — la concurrence potentielle en action",
                },
              ]}
              className="mt-1.5"
            />
          </>
        }
      />
    </ExamSolutionShell>
  );
}
