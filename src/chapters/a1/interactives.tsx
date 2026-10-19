/*
 * Chapitre A1 — composants interactifs.
 *
 *  - BudgetExplorer      : la droite de budget qui pivote avec la taxe (slide 9) ;
 *  - LaborSupplyExplorer : l* = min(1, a / (s(1−t))) dans le plan (l, c) et en
 *    barre loisir/travail (slides 25 et 27, solution en coin dès t ≥ 1 − a/s) ;
 *  - LafferExplorer      : le VRAI M(t) du modèle de l'île (s_H = 5, s_B = 3,
 *    a = 0,5), solutions en coin comprises (slides 28-29).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Vote } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import {
  C,
  Dot,
  Frame,
  GuideV,
  Label,
  Legend,
  PlotSvg,
  curvePath,
  fmt as pfmt,
  makePlot,
} from "../shared/plot";

/** format « 0,42 » comme dans la source */
function fmt(x: number): string {
  return x.toFixed(2).replace(".", ",");
}

/** Respecte le réglage « réduire les animations » du système. */
function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/* ------------------------------------------------------------------ */
/* 1. La droite de budget qui pivote avec la taxe                      */
/* ------------------------------------------------------------------ */

export function BudgetExplorer() {
  const [tPct, setTPct] = useState(20);
  const t = tPct / 100;

  // paramètres pédagogiques : s = 2, L = 1, M = 0,5
  const s = 2;
  const L = 1;
  const Mrev = 0.5;
  const wealth = s * (1 - t) * L + Mrev; // ordonnée à l'origine : s(1−t)L + M
  const slope = s * (1 - t); // |pente|

  // repère : l ∈ [0 ; 1,15], c ∈ [0 ; 2,8]
  const X = (l: number) => 62 + (l * 430) / 1.15;
  const Y = (c: number) => 312 - (c * 282) / 2.8;

  return (
    <InteractiveCard
      title="La droite de budget sous l'effet de la taxe"
      subtitle={
        <>
          Paramètres : salaire brut <M tex="s = 2" />, temps total <M tex="L = 1" />, revenu hors
          travail <M tex="M = 0{,}5" />. Bouge la taxe <M tex="t" /> et regarde ce qui devient
          possible… ou non.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taux de taxe <M tex="t" />
              </>
            }
            value={tPct}
            onChange={setTPct}
            min={0}
            max={80}
            step={1}
            format={(v) => fmt(v / 100)}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="font-semibold">
              Richesse max <M tex="s(1-t)L + M" /> ={" "}
              <span className="tabular-nums text-primary">{fmt(wealth)}</span>
            </span>
            <span className="text-muted-foreground">
              Pente = <span className="tabular-nums">−{fmt(slope)}</span> (en valeur absolue, le
              « prix » d'une heure de loisir)
            </span>
          </div>
        </>
      }
      footer={
        <>
          quand la taxe monte, la droite <strong>pivote autour de ω</strong> (le point « zéro
          travail » ne dépend pas de la taxe !) et s'aplatit : le salaire net baisse, donc chaque
          heure de loisir coûte moins de consommation sacrifiée — mais l'ensemble des paniers
          accessibles rétrécit. (Ici <M tex="M" /> est fixé. Dans le modèle de l'île, plus loin,{" "}
          <M tex="M" /> dépend lui-même de <M tex="t" /> : ω montera puis redescendra.)
        </>
      }
    >
      <svg viewBox="0 0 540 360" role="img" aria-label="Droite de budget interactive" className="w-full">
        {/* zone accessible */}
        <polygon
          points={`${X(0)},${Y(0)} ${X(0)},${Y(wealth)} ${X(L)},${Y(Mrev)} ${X(L)},${Y(0)}`}
          fill="#e0e7ff"
          opacity="0.55"
        />
        {/* grille légère */}
        {[0.5, 1, 1.5, 2, 2.5].map((c) => (
          <line key={c} x1={X(0)} y1={Y(c)} x2={X(1.1)} y2={Y(c)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* axes */}
        <line x1={X(0)} y1={Y(0)} x2={X(1.13)} y2={Y(0)} stroke="#0f172a" strokeWidth="1.6" />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(2.75)} stroke="#0f172a" strokeWidth="1.6" />
        <polygon points={`${X(1.13)},${Y(0)} ${X(1.13) - 9},${Y(0) - 4} ${X(1.13) - 9},${Y(0) + 4}`} fill="#0f172a" />
        <polygon points={`${X(0)},${Y(2.75)} ${X(0) - 4},${Y(2.75) + 9} ${X(0) + 4},${Y(2.75) + 9}`} fill="#0f172a" />
        <text x={X(1.13) + 6} y={Y(0) + 5} fontSize="16" fontStyle="italic" fill="#0f172a">
          l
        </text>
        <text x={X(0) - 16} y={Y(2.75) + 4} fontSize="16" fontStyle="italic" fill="#0f172a">
          c
        </text>
        {/* droite de budget */}
        <line x1={X(0)} y1={Y(wealth)} x2={X(L)} y2={Y(Mrev)} stroke="#e11d48" strokeWidth="3" />
        {/* pointillés vers ω */}
        <line x1={X(L)} y1={Y(0)} x2={X(L)} y2={Y(Mrev)} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
        <line x1={X(0)} y1={Y(Mrev)} x2={X(L)} y2={Y(Mrev)} stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
        {/* point de dotation ω */}
        <circle cx={X(L)} cy={Y(Mrev)} r="6" fill="#0f172a" />
        <text x={X(L) + 10} y={Y(Mrev) + 4} fontSize="16" fontStyle="italic" fill="#0f172a">
          ω
        </text>
        <text x={X(L) - 4} y={Y(0) + 18} fontSize="14" fontStyle="italic" fill="#475569">
          L
        </text>
        <text x={X(0) - 26} y={Y(Mrev) + 4} fontSize="14" fontStyle="italic" fill="#475569">
          M
        </text>
        {/* ordonnée à l'origine */}
        <circle cx={X(0)} cy={Y(wealth)} r="4.5" fill="#e11d48" />
        <text x={X(0) + 10} y={Y(wealth) - 8} fontSize="12.5" fill="#be123c" fontWeight="600">
          s(1−t)L + M = {fmt(wealth)}
        </text>
        {/* étiquettes */}
        <text x={X(0.16)} y={Y(0.28)} fontSize="12.5" fill="#4338ca" fontWeight="600">
          paniers accessibles
        </text>
        <text x={X(0.42)} y={(Y(wealth) + Y(Mrev)) / 2 - 12} fontSize="12.5" fill="#be123c" fontWeight="600">
          pente = −s(1−t) = −{fmt(slope)}
        </text>
      </svg>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. L'effet de la taxe sur l'offre de travail (slides 25 et 27)       */
/* ------------------------------------------------------------------ */

const LS_S = 2;
const LS_A = 0.5;
/** loisir optimal du travailleur seul (s = 2, a = 0,5), solution en coin comprise */
const lsLeisure = (t: number) => Math.min(1, LS_A / (LS_S * (1 - t)));

/**
 * Fantômes du slide 27 : trois salaires nets s₃ > s₂ > s₁ (droite la plus
 * raide = −s₃), d'où l*₃ < l*₂ < l*₁ comme sur le slide.
 */
const LS_GHOSTS: Array<{ t: number; slope: string; lab: string }> = [
  { t: 0, slope: "−s₃", lab: "l*₃" },
  { t: 0.3, slope: "−s₂", lab: "l*₂" },
  { t: 0.6, slope: "−s₁", lab: "l*₁" },
];

export function LaborSupplyExplorer() {
  const [tPct, setTPct] = useState(20);
  const t = tPct / 100;

  // s = 2, a = 0,5, L = 1 et M = 0 (ω = (1, 0) comme sur le slide 27 ;
  // M ne change pas l* : préférences quasi-linéaires, slide 26)
  const s = LS_S;
  const a = LS_A;
  const net = s * (1 - t);
  const formula = a / net; // a / (s(1 − t)), valable seulement si ≤ 1
  const leisure = lsLeisure(t);
  const work = 1 - leisure;
  const cStar = net * (1 - leisure);
  const uStar = cStar + a * Math.log(leisure);
  const atBound = tPct === 75;
  const corner = tPct > 75;

  const W = 600; // largeur de la barre en unités de viewBox
  const lx = leisure * W;

  let message: string;
  if (corner)
    message =
      "Le salaire net est devenu si bas qu'aucune heure de travail ne vaut la peine : le travailleur ne travaille plus du tout.";
  else if (atBound)
    message = "On est pile à la borne t = 0,75 : la formule donne exactement l* = 1, plus aucun travail.";
  else if (work > 0.6) message = "La taxe est modérée : le travailleur offre encore beaucoup de travail, mais déjà moins qu'à t = 0.";
  else if (work > 0.3) message = "La taxe pèse : le travail offert baisse nettement.";
  else message = "La taxe décourage fortement : il ne reste presque plus de travail offert.";

  const p = makePlot({ w: 520, h: 356, pL: 46, pR: 30, pT: 30, pB: 46, x: [0, 1.15], y: [0, 2.2] });
  const ghostData = LS_GHOSTS.map((g) => {
    const n = s * (1 - g.t);
    const l = lsLeisure(g.t);
    const c = n * (1 - l);
    return { ...g, n, l, c, U: c + a * Math.log(l) };
  });

  return (
    <InteractiveCard
      title="L'effet de la taxe sur le travail"
      subtitle={
        <>
          Ici : salaire brut <M tex="s = 2" />, paramètre <M tex="a = 0{,}5" />, temps total{" "}
          <M tex="L = 1" /> et, comme sur le slide 27, <M tex="M = 0" /> (la dotation est{" "}
          <M tex="\omega = (1, 0)" /> ; <M tex="M" /> ne change de toute façon pas{" "}
          <M tex="l^*" />
          ). Tant que <M tex="t \le 1 - a/s = 0{,}75" />, le loisir choisi suit{" "}
          <M tex="l^*(t)=\dfrac{a}{s(1-t)}" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taxe <M tex="t" />
              </>
            }
            value={tPct}
            onChange={setTPct}
            min={0}
            max={90}
            step={1}
            format={(v) => fmt(v / 100)}
          />
          <div className="flex flex-col justify-center text-[13px]">
            <span className="text-muted-foreground">
              salaire net <M tex="s(1-t)" /> = <span className="tabular-nums">{fmt(net)}</span>
            </span>
            <span className="font-semibold text-emerald-700">
              loisir <M tex="l^*" /> = <span className="tabular-nums">{pfmt(leisure, 4)}</span>
              {corner || atBound ? " (coin)" : ""}
            </span>
            <span className="font-semibold text-rose-700">
              travail <M tex="1-l^*" /> = <span className="tabular-nums">{pfmt(work, 4)}</span>
            </span>
          </div>
        </>
      }
      footer={
        <>
          à chaque hausse de <M tex="t" />, la droite de budget pivote autour de{" "}
          <M tex="\omega = (1, 0)" /> et s'aplatit ; le point de tangence glisse vers la droite :
          le loisir monte et le travail baisse <strong>progressivement</strong> (sur le slide 27 :{" "}
          <M tex="l^*_3 < l^*_2 < l^*_1" />
          ). C'est cette baisse progressive du travail à chaque hausse de la taxe — et pas seulement
          son arrêt complet à <M tex="t = 0{,}75" /> — qui finira par faire baisser les recettes de
          la courbe de Laffer, un peu plus bas.
        </>
      }
    >
      <PlotSvg p={p} label="Plan loisir-consommation : droites de budget pivotant autour de (1, 0) et points de tangence" maxW={560}>
        <Frame p={p} xticks={[0, 1]} yticks={[0.5, 1, 1.5, 2]} />
        <text x={p.X(1.15) - 2} y={p.Y(0) - 8} textAnchor="end" fontSize={16} fontStyle="italic" fill={C.ink}>
          l
        </text>
        <text x={p.pL - 20} y={p.pT - 8} fontSize={16} fontStyle="italic" fill={C.ink}>
          c
        </text>
        <line x1={p.X(1)} y1={p.Y(0)} x2={p.X(1)} y2={p.Y(1.6)} stroke={C.soft} strokeWidth={1.2} />
        {/* fantômes t = 0 ; 0,3 ; 0,6 */}
        {ghostData.map((g) => (
          <g key={g.t} opacity={0.38}>
            <path d={curvePath(p, (l) => g.n * (1 - l), 0, 1, 2)} stroke={C.red} strokeWidth={1.8} fill="none" />
            <path d={curvePath(p, (l) => g.U - a * Math.log(l), 0.03, 0.97, 160)} stroke={C.blue} strokeWidth={1.6} fill="none" />
            <GuideV p={p} x={g.l} y={g.c} />
            <Dot p={p} x={g.l} y={g.c} r={3.5} />
          </g>
        ))}
        {ghostData.map((g) => (
          <g key={`lab${g.t}`}>
            <Label p={p} x={0.74} y={g.n * 0.26} dx={0} dy={-4} size={14} color="#be123c" weight={600}>
              {g.slope}
            </Label>
            <text x={p.X(g.l)} y={p.h - p.pB + 33} textAnchor="middle" fontSize={13} fill={C.soft} fontStyle="italic">
              {g.lab}
            </text>
          </g>
        ))}
        {/* situation courante */}
        <path d={curvePath(p, (l) => net * (1 - l), 0, 1, 2)} stroke={C.red} strokeWidth={3} fill="none" />
        <path d={curvePath(p, (l) => uStar - a * Math.log(l), 0.025, 1.0, 200)} stroke={C.blue} strokeWidth={2.6} fill="none" />
        <GuideV p={p} x={leisure} y={cStar} color={C.green} />
        <Dot p={p} x={1} y={0} r={5} />
        <Label p={p} x={1} y={0} dx={8} dy={-8} size={15} weight={500}>
          ω
        </Label>
        <Dot p={p} x={leisure} y={cStar} r={7} fill={C.green} />
        {corner || atBound ? (
          <text x={p.X(1) + 22} y={p.h - p.pB + 34} textAnchor="end" fontSize={14} fontWeight={600} fill={C.green}>
            coin : l* = 1
          </text>
        ) : (
          <Label p={p} x={leisure} y={cStar} dx={9} dy={-12} size={14} color={C.green}>
            {`l* = ${pfmt(leisure, 4)}`}
          </Label>
        )}
      </PlotSvg>
      <Legend
        items={[
          { color: C.red, label: <>budget c = s(1−t)(1 − l)</> },
          { color: C.blue, label: "courbe d'indifférence la plus haute" },
          { color: "#d4d4d8", label: "t = 0 ; 0,3 ; 0,6 (slide 27)" },
        ]}
      />
      {corner || atBound ? (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[14px] leading-relaxed text-amber-900">
          {corner ? (
            <>
              <strong>Solution en coin : l* = 1.</strong> La formule <M tex="a/(s(1-t))" /> donnerait{" "}
              {pfmt(formula, 3)} &gt; 1 : impossible, on n'a que <M tex="L = 1" />. Elle n'est plus
              valable dès que <M tex="t > 1 - a/s = 0{,}75" /> ; le meilleur panier accessible est
              alors ω (aucune heure de travail).
            </>
          ) : (
            <>
              <strong>Borne de validité :</strong> à <M tex="t = 1 - a/s = 0{,}75" /> pile, la formule
              donne <M tex="l^* = 0{,}5/(2 \times 0{,}25) = 1" /> : la tangence a lieu exactement en ω.
              Au-delà, la formule dépasserait 1 et ne vaudrait plus (solution en coin).
            </>
          )}
        </div>
      ) : null}
      <svg viewBox="0 0 600 132" className="mt-4 w-full" role="img" aria-label="Répartition loisir / travail">
        <text x="0" y="16" fontSize="13" fontWeight="600" fill="#0f172a">
          Répartition du temps disponible (ramené à L = 1)
        </text>
        <rect x="0" y="34" width={W} height="46" rx="6" fill="#e2e8f0" />
        <rect x="0" y="34" width={Math.max(lx, 0.5)} height="46" rx="6" fill="#059669" />
        {W - lx > 1 ? <rect x={lx} y="34" width={W - lx} height="46" fill="#e11d48" /> : null}
        <line x1={lx} y1="29" x2={lx} y2="85" stroke="#0f172a" strokeWidth="2" />
        {lx > 55 ? (
          <text x={lx / 2} y="62" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
            loisir
          </text>
        ) : null}
        {W - lx > 55 ? (
          <text x={lx + (W - lx) / 2} y="62" textAnchor="middle" fontSize="13" fontWeight="600" fill="#fff">
            travail
          </text>
        ) : null}
        <text x="0" y="106" fontSize="13" fontWeight="600" fill="#059669">
          loisir l* = {fmt(leisure)}
        </text>
        <text x={W} y="106" textAnchor="end" fontSize="13" fontWeight="600" fill="#e11d48">
          travail = {fmt(work)}
        </text>
      </svg>
      <p className="mt-2 text-sm text-muted-foreground">
        À une taxe de {tPct}&nbsp;%, le travailleur garde {pfmt(leisure, 4)} de loisir et offre{" "}
        {pfmt(work, 4)} de travail (consommation <M tex="c^*" /> = {pfmt(cStar, 3)}). {message}
      </p>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* 3. La courbe de Laffer — le vrai M(t) du modèle de l'île (slides 28-29) */
/* ------------------------------------------------------------------ */

const IS_SH = 5;
const IS_SB = 3;
const IS_A = 0.5;
/** loisir optimal d'un travailleur de salaire s, avec solution en coin l* = 1 */
const isLeisure = (s: number, t: number) => (t >= 1 ? 1 : Math.min(1, IS_A / (s * (1 - t))));
/** M(t) = (t/2) [s_H (1 − l*_H) + s_B (1 − l*_B)] : recette moyenne redistribuée */
const isM = (t: number) => (t / 2) * (IS_SH * (1 - isLeisure(IS_SH, t)) + IS_SB * (1 - isLeisure(IS_SB, t)));
/** formule du slide 28, valable seulement tant que les deux groupes travaillent */
const naiveM = (t: number) => ((IS_SH + IS_SB) * t) / 2 - (IS_A * t) / (1 - t);
const T_UB = 0.5; // sommet de U_B (voir Pareto)
const T_M = 1 - Math.sqrt((2 * IS_A) / (IS_SH + IS_SB)); // ≈ 0,646
const M_MAX = isM(T_M); // ≈ 1,672
const T_B_STOP = 1 - IS_A / IS_SB; // 5/6 ≈ 0,833
const T_H_STOP = 1 - IS_A / IS_SH; // 0,9

const LAFFER_PRESETS: Array<{ v: number; label: ReactNode }> = [
  { v: 0, label: "0" },
  { v: 300, label: "0,3" },
  { v: 500, label: "0,5" },
  { v: Math.round(T_M * 1000), label: <>t*<sub>M</sub></> },
  { v: 800, label: "0,8" },
  { v: 900, label: "0,9" },
];

export function LafferExplorer() {
  const [tm, setTm] = useState(300); // t en millièmes
  const raf = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );
  const stop = () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };
  const t = tm / 1000;
  const lH = isLeisure(IS_SH, t);
  const lB = isLeisure(IS_SB, t);
  const Mv = isM(t);

  function sweep() {
    stop();
    if (reducedMotion()) {
      setTm(Math.round(T_M * 1000));
      return;
    }
    const t0 = performance.now();
    const dur = 5000;
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      setTm(Math.round(990 * u));
      raf.current = u < 1 ? requestAnimationFrame(step) : null;
    };
    raf.current = requestAnimationFrame(step);
  }

  let message: ReactNode;
  if (tm === 0) message = "Taxe nulle : on ne prélève rien, donc M = 0.";
  else if (t < T_M - 0.006)
    message =
      "À gauche du sommet : augmenter t rapporte ENCORE PLUS. Le travail baisse un peu, mais le taux plus élevé l'emporte.";
  else if (t <= T_M + 0.006)
    message = (
      <>
        Tu es au sommet <M tex="t^*_M \approx 0{,}646" /> : c'est le taux qui maximise le montant
        collecté et redistribué (<M tex="M \approx 1{,}672" />
        ).
      </>
    );
  else if (t < T_B_STOP)
    message =
      "À droite du sommet : les deux groupes travaillent encore, mais chaque hausse de t réduit encore leur travail ; cette baisse progressive de la base taxée l'emporte désormais sur le taux plus élevé : les recettes baissent.";
  else if (t < T_H_STOP)
    message = (
      <>
        Les bas salaires ne travaillent plus du tout (<M tex="l^*_B = 1" />, solution en coin) : seuls
        les hauts salaires paient encore la taxe, et de moins en moins.
      </>
    );
  else
    message = (
      <>
        Plus personne ne travaille (<M tex="l^*_H = l^*_B = 1" />) : <M tex="M = 0" /> sur tout
        l'intervalle <M tex="[0{,}9 ; 1]" />. Le slide 29, stylisé, place ce zéro en <M tex="t = 1" />.
      </>
    );

  const p = makePlot({ w: 520, h: 350, pL: 46, pR: 26, pT: 24, pB: 46, x: [0, 1], y: [-0.55, 2.05] });
  const yAxis = p.Y(0);
  const row1 = p.h - p.pB + 17;
  const row2 = p.h - p.pB + 34;
  const vline = (x: number, color: string, dashArray: string, yTop = 2.0) => (
    <line x1={p.X(x)} y1={p.Y(-0.55)} x2={p.X(x)} y2={p.Y(yTop)} stroke={color} strokeWidth={1.3} strokeDasharray={dashArray} />
  );

  return (
    <InteractiveCard
      title="La courbe de Laffer de l'île"
      subtitle={
        <>
          Hauts salaires <M tex="s_H = 5" />, bas salaires <M tex="s_B = 3" /> (moitié-moitié),{" "}
          <M tex="a = 0{,}5" />. Chacun choisit <M tex="l^* = \min\!\big(1, \tfrac{a}{s(1-t)}\big)" />{" "}
          et l'État redistribue à chacun{" "}
          <M tex="M(t) = \tfrac{t}{2}\big[s_H(1-l^*_H) + s_B(1-l^*_B)\big]" />. Bouge la taxe et
          cherche le sommet.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Taxe <M tex="t" />
              </>
            }
            value={tm}
            onChange={(v) => {
              stop();
              setTm(v);
            }}
            min={0}
            max={990}
            step={1}
            format={(v) => pfmt(v / 1000, 3)}
          />
          <div className="flex flex-col justify-center gap-0.5 text-[13px] tabular-nums">
            <span>
              <span className="font-semibold text-blue-700">
                <M tex="l^*_H" /> = {pfmt(lH, 3)}
                {lH >= 1 ? " (coin)" : ""}
              </span>{" "}
              ·{" "}
              <span className="font-semibold text-emerald-700">
                <M tex="l^*_B" /> = {pfmt(lB, 3)}
                {lB >= 1 ? " (coin)" : ""}
              </span>
            </span>
            <span>
              <span className="rounded-md bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
                M(t) = {pfmt(Mv, 3)}
              </span>
            </span>
          </div>
          <div className="min-w-0">
            <div className="mb-1.5 text-[13px] font-semibold">Aller à t =</div>
            <div className="flex flex-wrap gap-1.5">
              {LAFFER_PRESETS.map((pr) => (
                <button
                  key={pr.v}
                  type="button"
                  onClick={() => {
                    stop();
                    setTm(pr.v);
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[13px] font-semibold transition-colors",
                    tm === pr.v ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {pr.label}
                </button>
              ))}
              <button
                type="button"
                onClick={sweep}
                className="rounded-full border border-primary px-2.5 py-0.5 text-[13px] font-semibold text-primary hover:bg-accent"
              >
                ▶ balayer
              </button>
            </div>
          </div>
        </>
      }
      footer={
        <>
          les recettes sont nulles à <M tex="t=0" /> (on ne prélève rien) et redeviennent nulles quand
          plus personne ne travaille. Entre les deux, elles montent puis redescendent après{" "}
          <M tex="t^*_M = 1 - \sqrt{2a/(s_H+s_B)} \approx 0{,}646" />. La descente commence alors que{" "}
          <strong>les deux groupes travaillent encore</strong> : c'est la baisse progressive du
          travail à chaque hausse de <M tex="t" /> qui finit par l'emporter. Et dès{" "}
          <M tex="t^*_{UB} = 0{,}5" />, plus bas que <M tex="t^*_M" />, monter la taxe n'est même plus
          dans l'intérêt des bas salaires (voir Pareto).
        </>
      }
    >
      <PlotSvg p={p} label="Courbe de Laffer : montant redistribué M selon la taxe t, avec ses seuils" maxW={560}>
        {/* zones « en coin » */}
        <rect x={p.X(T_B_STOP)} y={p.pT} width={p.X(T_H_STOP) - p.X(T_B_STOP)} height={p.Y(-0.55) - p.pT} fill="#fef3c7" opacity={0.7} />
        <rect x={p.X(T_H_STOP)} y={p.pT} width={p.X(1) - p.X(T_H_STOP)} height={p.Y(-0.55) - p.pT} fill="#e4e4e7" opacity={0.7} />
        {/* grille + graduations de M */}
        {[0.5, 1, 1.5, 2].map((v) => (
          <g key={v}>
            <line x1={p.pL} y1={p.Y(v)} x2={p.X(1)} y2={p.Y(v)} stroke={C.guide} strokeWidth={1} opacity={0.3} />
            <text x={p.pL - 7} y={p.Y(v) + 4} textAnchor="end" fontSize={12.5} fill={C.soft}>
              {pfmt(v)}
            </text>
          </g>
        ))}
        <text x={p.pL - 7} y={yAxis + 4} textAnchor="end" fontSize={12.5} fill={C.soft}>
          0
        </text>
        {/* seuils */}
        {vline(T_UB, C.violet, "2 4")}
        {vline(T_B_STOP, C.soft, "2 3", 1.95)}
        {vline(T_H_STOP, C.soft, "2 3", 1.95)}
        <line x1={p.X(T_M)} y1={p.Y(-0.55)} x2={p.X(T_M)} y2={p.Y(M_MAX)} stroke={C.gold} strokeWidth={1.4} strokeDasharray="5 4" />
        <line x1={p.pL} y1={p.Y(M_MAX)} x2={p.X(T_M)} y2={p.Y(M_MAX)} stroke={C.gold} strokeWidth={1.4} strokeDasharray="5 4" />
        {/* axes */}
        <line x1={p.pL} y1={yAxis} x2={p.X(1) + 12} y2={yAxis} stroke={C.ink} strokeWidth={1.5} />
        <polygon points={`${p.X(1) + 20},${yAxis} ${p.X(1) + 10},${yAxis - 5} ${p.X(1) + 10},${yAxis + 5}`} fill={C.ink} />
        <line x1={p.pL} y1={p.Y(-0.55)} x2={p.pL} y2={p.pT} stroke={C.ink} strokeWidth={1.5} />
        <text x={p.X(1) + 18} y={yAxis - 9} textAnchor="end" fontSize={16} fontStyle="italic" fill={C.ink}>
          t
        </text>
        <text x={p.pL + 6} y={p.pT + 4} fontSize={15} fontStyle="italic" fill={C.ink}>
          M(t)
        </text>
        {/* formule naïve hors domaine */}
        <path d={curvePath(p, naiveM, T_B_STOP, 0.99, 160)} fill="none" stroke={C.soft} strokeWidth={1.8} strokeDasharray="5 4" opacity={0.75} />
        {/* vraie courbe */}
        <path d={curvePath(p, isM, 0, 0.995, 400)} fill="none" stroke={C.gold} strokeWidth={3} />
        {/* étiquettes des seuils */}
        <Label p={p} x={T_M} y={M_MAX} dx={8} dy={-8} size={12.5} color="#b45309">
          sommet : M ≈ 1,672
        </Label>
        <text x={p.X(0)} y={row1} textAnchor="middle" fontSize={12.5} fill={C.soft}>
          0
        </text>
        <text x={p.X(T_UB)} y={row1} textAnchor="middle" fontSize={12.5} fill={C.violet} fontWeight={600}>
          t*<tspan fontSize={12} dy={3}>UB</tspan>
          <tspan dy={-3}> = 0,5</tspan>
        </text>
        <text x={p.X(T_B_STOP)} y={row1} textAnchor="middle" fontSize={12.5} fill={C.soft}>
          ≈ 0,833
        </text>
        <text x={p.X(1)} y={row1} textAnchor="middle" fontSize={12.5} fill={C.soft}>
          1
        </text>
        <text x={p.X(T_M)} y={row2} textAnchor="middle" fontSize={12.5} fill="#b45309" fontWeight={600}>
          t*<tspan fontSize={12} dy={3}>M</tspan>
          <tspan dy={-3}> ≈ 0,646</tspan>
        </text>
        <text x={p.X(T_H_STOP)} y={row2} textAnchor="middle" fontSize={12.5} fill={C.soft}>
          0,9
        </text>
        {/* point courant */}
        <line x1={p.X(t)} y1={yAxis} x2={p.X(t)} y2={p.Y(Mv)} stroke={C.blue} strokeWidth={1.3} strokeDasharray="3 3" />
        <Dot p={p} x={t} y={Mv} r={7} fill={C.blue} />
      </PlotSvg>
      <Legend
        items={[
          { color: C.gold, label: <>vrai <M tex="M(t)" /></> },
          { color: C.soft, label: "formule du slide 28 hors de son domaine", dashed: true },
          { color: C.violet, label: <><M tex="t^*_{UB}" /> : seuil des bas salaires (voir Pareto)</>, dashed: true },
        ]}
      />
      <ul className="mt-2 grid gap-0.5 text-[13px] text-muted-foreground sm:grid-cols-2">
        <li>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: "#fef3c7" }} />
          dès <M tex="t = 1 - a/s_B \approx 0{,}833" /> : les bas salaires arrêtent de travailler
        </li>
        <li>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: "#e4e4e7" }} />
          dès <M tex="t = 1 - a/s_H = 0{,}9" /> : plus personne ne travaille, <M tex="M = 0" />
        </li>
      </ul>
      <p className="mt-2 border-t border-dashed pt-2 text-sm text-muted-foreground">
        <strong className="text-foreground">t = {pfmt(t, 3)}</strong> — {message}
        {t > T_UB + 0.0005 && t < T_H_STOP ? (
          <>
            {" "}
            <span className="text-violet-700">
              (Tu as dépassé <M tex="t^*_{UB} = 0{,}5" /> : chaque hausse de t fait maintenant perdre
              les bas salaires eux-mêmes.)
            </span>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Pourquoi la courbe pointillée ? La formule du slide 28,{" "}
        <M tex="M(t) = \tfrac{(s_H+s_B)\,t}{2} - \tfrac{a\,t}{1-t}" />, suppose que les deux groupes
        travaillent (<M tex="l^* \le 1" />, donc <M tex="t \le 1 - a/s_B" />
        ). Au-delà, elle devient fausse puis négative, alors que le vrai montant ne peut pas être
        négatif. Le slide 29 est stylisé et place le zéro en <M tex="t = 1" /> ; dans le modèle, il
        arrive dès <M tex="t = 0{,}9" />.
      </p>
    </InteractiveCard>
  );
}

