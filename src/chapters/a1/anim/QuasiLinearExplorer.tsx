/*
 * A1 · slide 26 — Préférences « quasi-linéaires » : le revenu hors travail M
 * ne change pas le temps de travail choisi.
 *
 * Salaire net fixé s(1 − t) = 1,6 (s = 2, t = 0,2), a = 0,5, U = c + a·ln l.
 * Budget : c = M + 1,6 (1 − l), dotation ω = (1, M).
 * Tangence : a / l = 1,6 ⇒ l* = 0,3125 quel que soit M ; c* = M + 1,1 ;
 * U* = M + 1,1 + 0,5·ln 0,3125 ≈ M + 0,518.
 */
import { useEffect, useRef, useState } from "react";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M as Tex } from "@/components/course/Math";
import { C, Dot, Frame, Label, Legend, PlotSvg, curvePath, fmt, makePlot } from "../../shared/plot";

const A = 0.5;
const NET = 1.6;
const L_STAR = A / NET; // 0,3125
const WORK = 1 - L_STAR; // 0,6875

const budget = (M: number) => (l: number) => M + NET * (1 - l);
const uStar = (M: number) => budget(M)(L_STAR) + A * Math.log(L_STAR);
const indiff = (M: number) => (l: number) => uStar(M) - A * Math.log(l);

const GHOSTS: Array<{ M: number; name: string }> = [
  { M: 0, name: "M = 0" },
  { M: 0.5, name: "M′" },
  { M: 1, name: "M″" },
];

export function QuasiLinearExplorer() {
  const [mPct, setMPct] = useState(25);
  const raf = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );
  const Mv = mPct / 100;
  const cs = budget(Mv)(L_STAR);
  const Us = uStar(Mv);

  function play() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const reduce =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMPct(100);
      return;
    }
    const t0 = performance.now();
    const dur = 2600;
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      setMPct(Math.round(100 * u));
      raf.current = u < 1 ? requestAnimationFrame(step) : null;
    };
    raf.current = requestAnimationFrame(step);
  }

  const p = makePlot({ w: 520, h: 386, pL: 46, pR: 30, pT: 30, pB: 70, x: [0, 1.15], y: [0, 3.2] });
  const yBrace = p.h - p.pB + 36;

  return (
    <InteractiveCard
      title="Plus de revenu hors travail M : la tangence ne bouge pas de verticale"
      subtitle={
        <>
          Salaire net fixé <Tex tex="s(1-t) = 1{,}6" />, <Tex tex="a = 0{,}5" />,{" "}
          <Tex tex="U = c + 0{,}5\,\ln l" />. Bouge <Tex tex="M" /> : la dotation{" "}
          <Tex tex="\omega = (1, M)" /> monte, la droite de budget monte avec elle (même pente), et la
          courbe d'indifférence tangente aussi.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Revenu hors travail <Tex tex="M" />
              </>
            }
            value={mPct}
            onChange={(v) => {
              if (raf.current !== null) cancelAnimationFrame(raf.current);
              raf.current = null;
              setMPct(v);
            }}
            min={0}
            max={100}
            step={1}
            format={(v) => fmt(v / 100, 2)}
          />
          <div className="flex flex-col justify-center gap-0.5 text-[13px] tabular-nums">
            <span className="font-semibold text-emerald-700">
              loisir <Tex tex="l^*" /> = 0,3125 (fixe)
            </span>
            <span className="font-semibold text-rose-700">
              travail <Tex tex="1-l^*" /> = 0,6875 (fixe)
            </span>
            <span>
              <Tex tex="c^* = M + 1{,}1" /> = {fmt(cs, 3)}
            </span>
            <span>
              <Tex tex="U^*" /> = {fmt(Us, 3)}
            </span>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={play}
              className="rounded-lg bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              ▶ Fais monter M de 0 à 1
            </button>
          </div>
        </>
      }
      footer={
        <>
          tout monte d'un bloc (dotation, droite, courbe, point choisi), mais le point de tangence
          reste sur la même verticale <Tex tex="l^* = 0{,}3125" /> : seule la consommation{" "}
          <Tex tex="c^*" /> augmente, exactement du montant ajouté à <Tex tex="M" />. Pourquoi ?
          Avec <Tex tex="U = c + a\ln l" />, on a <Tex tex="U_{mc} = 1" />, donc la condition de
          tangence <Tex tex="\tfrac{a}{l} = s(1-t)" /> ne contient pas <Tex tex="M" /> : c'est ce qu'on
          appelle des préférences « quasi-linéaires » en revenu.
        </>
      }
    >
      <PlotSvg p={p} label="Trois droites de budget parallèles et la droite courante ; les points de tangence sont tous sur la verticale l* = 0,3125" maxW={560}>
        <Frame
          p={p}
          xticks={[0, 1]}
          yticks={[0, 0.5, 1, 2, 3]}
          yfmt={(t) => (t === 0.5 ? "M′" : t === 1 ? "M″" : fmt(t))}
          grid={false}
        />
        <text x={p.X(1.15) - 2} y={p.Y(0) - 8} textAnchor="end" fontSize={16} fontStyle="italic" fill={C.ink}>
          l
        </text>
        <text x={p.pL - 20} y={p.pT - 8} fontSize={16} fontStyle="italic" fill={C.ink}>
          c
        </text>
        {/* verticale l = 1 (temps total) */}
        <line x1={p.X(1)} y1={p.Y(0)} x2={p.X(1)} y2={p.Y(3.05)} stroke={C.soft} strokeWidth={1.2} />
        {/* verticale fixe l* */}
        <line x1={p.X(L_STAR)} y1={p.Y(0)} x2={p.X(L_STAR)} y2={p.Y(3.15)} stroke={C.ink} strokeWidth={1.3} strokeDasharray="5 4" />
        <text x={p.X(L_STAR)} y={p.h - p.pB + 18} textAnchor="middle" fontSize={14} fontStyle="italic" fill={C.ink}>
          l*
        </text>
        {/* positions fantômes M = 0, M′, M″ */}
        {GHOSTS.map((g) => (
          <g key={g.M} opacity={0.3}>
            <path d={curvePath(p, budget(g.M), 0, 1, 2)} stroke={C.red} strokeWidth={2} fill="none" />
            <path d={curvePath(p, indiff(g.M), 0.04, 0.95, 160)} stroke={C.blue} strokeWidth={1.8} fill="none" />
            <line x1={p.pL} y1={p.Y(g.M)} x2={p.X(1)} y2={p.Y(g.M)} stroke={C.guide} strokeWidth={1} strokeDasharray="4 4" />
            <Dot p={p} x={1} y={g.M} r={4.5} />
          </g>
        ))}
        {/* situation courante */}
        <path d={curvePath(p, budget(Mv), 0, 1, 2)} stroke={C.red} strokeWidth={3} fill="none" />
        <path d={curvePath(p, indiff(Mv), 0.035, 0.97, 200)} stroke={C.blue} strokeWidth={2.6} fill="none" />
        <Dot p={p} x={1} y={Mv} r={6} />
        <Label p={p} x={1} y={Mv} dx={8} dy={5} size={14} weight={500}>
          ω
        </Label>
        <Dot p={p} x={L_STAR} y={cs} r={7} fill={C.green} />
        <Label p={p} x={L_STAR} y={cs} dx={9} dy={-10} size={14} color={C.green}>
          (l*, c*)
        </Label>
        {/* temps de travail */}
        <g>
          <line x1={p.X(L_STAR) + 2} y1={yBrace} x2={p.X(1)} y2={yBrace} stroke={C.red} strokeWidth={1.8} />
          <polygon points={`${p.X(L_STAR) + 2},${yBrace} ${p.X(L_STAR) + 10},${yBrace - 4} ${p.X(L_STAR) + 10},${yBrace + 4}`} fill={C.red} />
          <polygon points={`${p.X(1)},${yBrace} ${p.X(1) - 8},${yBrace - 4} ${p.X(1) - 8},${yBrace + 4}`} fill={C.red} />
          <text x={(p.X(L_STAR) + p.X(1)) / 2} y={yBrace + 18} textAnchor="middle" fontSize={14} fontWeight={600} fill={C.red}>
            temps de travail = 1 − l* = 0,6875
          </text>
        </g>
      </PlotSvg>
      <Legend
        items={[
          { color: C.red, label: "droite de budget (pente −1,6)" },
          { color: C.blue, label: "courbe d'indifférence tangente" },
          { color: "#d4d4d8", label: "positions M = 0, M′ = 0,5, M″ = 1" },
        ]}
      />
      <p className="mt-2 text-sm text-muted-foreground">
        Avec <Tex tex="M" /> = {fmt(Mv, 2)} : le travailleur garde toujours 0,3125 de loisir, travaille
        0,6875 et consomme {fmt(cs, 3)} = 0,6875 × 1,6 (revenu du travail, 1,1) + {fmt(Mv, 2)} (revenu
        hors travail).
      </p>
    </InteractiveCard>
  );
}
