/*
 * A1 · slides 14 et 17-20 — Trouver le meilleur panier en glissant le long
 * de la droite de budget.
 *
 * Travailleur seul (paramètres fixés pour tout le chapitre) : s = 2, t = 0,2,
 * M = 0,5, L = 1, a = 0,5, U(l, c) = c + a·ln l.
 *  - budget : c = 0,5 + 1,6 (1 − l)   (salaire net s(1 − t) = 1,6)
 *  - courbe d'indifférence par le panier choisi : c = U − 0,5·ln l
 *  - TMS = U_ml / U_mc = a / l, à comparer au rapport des prix 1,6
 *  - optimum : a / l* = 1,6 ⇒ l* = 0,3125, c* = 1,6, U* ≈ 1,018
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import { C, Dot, Frame, GuideH, GuideV, Label, Legend, PlotSvg, curvePath, fmt, makePlot, polyPath } from "../../shared/plot";

const A = 0.5;
const NET = 1.6; // s(1 − t) = 2 × 0,8
const MREV = 0.5;
const STEPS = 400; // le curseur avance par pas de 1/400 = 0,0025
const K_STAR = 125; // l* = 125/400 = 0,3125
const L_STAR = K_STAR / STEPS;

const budget = (l: number) => MREV + NET * (1 - l);
const utility = (l: number) => budget(l) + A * Math.log(l);
const U_STAR = utility(L_STAR);

function Brace({ x1, x2, y, color, label }: { x1: number; x2: number; y: number; color: string; label: string }) {
  if (x2 - x1 < 2) return null;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.8} />
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke={color} strokeWidth={1.8} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} stroke={color} strokeWidth={1.8} />
      <text x={(x1 + x2) / 2} y={y + 19} textAnchor="middle" fontSize={13.5} fontWeight={600} fill={color}>
        {label}
      </text>
    </g>
  );
}

export function TangencyExplorer() {
  const [k, setK] = useState(40); // l = 0,1 au départ
  const raf = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const l = k / STEPS;
  const c = budget(l);
  const U = utility(l);
  const tms = A / l;
  const atStar = k === K_STAR;
  const near = Math.abs(k - K_STAR) <= 2 && !atStar;

  function showOptimum() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const reduce =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = k;
    if (reduce || from === K_STAR) {
      setK(K_STAR);
      return;
    }
    const t0 = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - u, 3);
      setK(u >= 1 ? K_STAR : Math.round(from + (K_STAR - from) * e));
      if (u < 1) raf.current = requestAnimationFrame(step);
      else raf.current = null;
    };
    raf.current = requestAnimationFrame(step);
  }

  const p = makePlot({ w: 520, h: 376, pL: 46, pR: 30, pT: 30, pB: 72, x: [0, 1.15], y: [0, 2.6] });

  // petite tangente à la courbe d'indifférence au panier courant (pente −a/l)
  const kx = p.X(1) - p.X(0);
  const ky = p.Y(0) - p.Y(1);
  const slope = -tms;
  const d = 46 / Math.hypot(kx, slope * ky);

  let tone: string;
  let msg: ReactNode;
  if (atStar) {
    tone = "border-emerald-300 bg-emerald-50 text-emerald-900";
    msg = (
      <>
        <strong>Tangence : c'est le meilleur panier.</strong> TMS = 1,6 = rapport des prix. La courbe
        d'indifférence touche la droite de budget sans la traverser : aucun panier accessible n'est
        sur une courbe plus haute. <M tex="l^* = 0{,}3125" />, <M tex="c^* = 1{,}6" />,{" "}
        <M tex="U^* \approx 1{,}018" />.
      </>
    );
  } else if (tms > NET) {
    tone = "border-sky-300 bg-sky-50 text-sky-900";
    msg = (
      <>
        <strong>
          TMS = {fmt(tms, 2)} &gt; 1,6 : une heure de loisir vaut plus pour toi qu'elle ne coûte —
          prends plus de loisir
        </strong>{" "}
        (glisse vers la droite). Tu es prêt·e à céder {fmt(tms, 2)} unité(s) de consommation pour une
        heure de loisir, alors qu'elle ne t'en coûte que 1,6.
        {near ? " Tu es tout près de la tangence !" : ""}
      </>
    );
  } else {
    tone = "border-amber-300 bg-amber-50 text-amber-900";
    msg = (
      <>
        <strong>
          TMS = {fmt(tms, 2)} &lt; 1,6 : une heure de loisir vaut moins pour toi qu'elle ne coûte —
          prends moins de loisir
        </strong>{" "}
        (glisse vers la gauche, c.-à-d. travaille plus). Une heure de loisir te coûte 1,6 de
        consommation, mais tu n'es prêt·e à céder que {fmt(tms, 2)} pour l'avoir.
        {near ? " Tu es tout près de la tangence !" : ""}
      </>
    );
  }

  const yBrace = p.h - p.pB + 36;

  return (
    <InteractiveCard
      title="Glisse le long du budget : où est le meilleur panier ?"
      subtitle={
        <>
          Salaire brut <M tex="s = 2" />, taxe <M tex="t = 0{,}2" /> (salaire net{" "}
          <M tex="s(1-t) = 1{,}6" />
          ), <M tex="M = 0{,}5" />, <M tex="L = 1" />, utilité <M tex="U = c + 0{,}5\,\ln l" />. Le
          panier se déplace sur la droite de budget ; la courbe bleue est la courbe d'indifférence qui
          passe par lui.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Loisir <M tex="l" /> du panier
              </>
            }
            value={k}
            onChange={(v) => {
              if (raf.current !== null) cancelAnimationFrame(raf.current);
              raf.current = null;
              setK(v);
            }}
            min={20}
            max={STEPS}
            step={1}
            format={(v) => fmt(v / STEPS, 4)}
          />
          <div className="flex flex-col justify-center gap-0.5 text-[13px] tabular-nums">
            <span>
              panier <M tex="(l, c)" /> = ({fmt(l, 4)} ; {fmt(c, 3)})
            </span>
            <span className="font-semibold text-blue-700">
              utilité <M tex="U" /> = {fmt(U, 3)}
            </span>
            <span>
              <span className="font-semibold text-violet-700">
                TMS = <M tex="a/l" /> = {fmt(tms, 2)}
              </span>{" "}
              vs <span className="font-semibold text-rose-700">prix 1,6</span>
            </span>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={showOptimum}
              className="rounded-lg bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              Montre l'optimum
            </button>
          </div>
        </>
      }
      footer={
        <>
          quand le TMS (la pente de la courbe bleue, en valeur absolue) est plus grand que 1,6 (la
          pente du budget), la courbe coupe la droite et on peut monter sur une courbe plus haute en
          prenant plus de loisir ; quand il est plus petit, c'est l'inverse. Le maximum de{" "}
          <M tex="U" /> est atteint là où les deux pentes sont égales :{" "}
          <M tex="\tfrac{a}{l} = s(1-t)" />, c'est la <strong>condition de tangence</strong> du slide 20.
        </>
      }
    >
      <PlotSvg p={p} label="Plan loisir-consommation : droite de budget, panier mobile et courbe d'indifférence passant par ce panier" maxW={560}>
        <path
          d={polyPath(p, [
            [0, 0],
            [0, budget(0)],
            [1, MREV],
            [1, 0],
          ])}
          fill="#e0e7ff"
          opacity={0.5}
        />
        <Frame p={p} xticks={[0, 0.5, 1]} yticks={[0.5, 1, 1.5, 2, 2.5]} />
        <text x={p.X(1.15) - 2} y={p.Y(0) - 8} textAnchor="end" fontSize={16} fontStyle="italic" fill={C.ink}>
          l
        </text>
        <text x={p.pL - 20} y={p.pT - 8} fontSize={16} fontStyle="italic" fill={C.ink}>
          c
        </text>
        {/* optimum (fantôme) une fois atteint */}
        {atStar ? (
          <>
            <GuideV p={p} x={L_STAR} y={budget(L_STAR)} color={C.green} />
            <GuideH p={p} x={L_STAR} y={budget(L_STAR)} color={C.green} />
          </>
        ) : null}
        {/* droite de budget */}
        <path d={curvePath(p, budget, 0, 1, 2)} stroke={C.red} strokeWidth={3} fill="none" />
        <Label p={p} x={0.5} y={budget(0.5)} dx={6} dy={-10} color={C.red} size={14}>
          budget : c = 0,5 + 1,6 (1 − l)
        </Label>
        {/* courbe d'indifférence par le panier */}
        <path d={curvePath(p, (x) => U - A * Math.log(x), 0.02, 1.12, 220)} stroke={atStar ? C.green : C.blue} strokeWidth={2.6} fill="none" />
        <Label p={p} x={1.12} y={U - A * Math.log(1.12)} anchor="end" dx={0} dy={20} color={atStar ? C.green : C.blue} size={14}>
          U = {fmt(U, 3)}
        </Label>
        {/* tangente à la courbe au panier */}
        <line
          x1={p.X(l - d)}
          y1={p.Y(c - slope * d)}
          x2={p.X(l + d)}
          y2={p.Y(c + slope * d)}
          stroke={C.violet}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        {/* ω */}
        <GuideV p={p} x={1} y={MREV} />
        <Dot p={p} x={1} y={MREV} r={5.5} />
        <Label p={p} x={1} y={MREV} dx={8} dy={-6} size={15} weight={500}>
          ω
        </Label>
        {/* panier courant */}
        <Dot p={p} x={l} y={c} r={7} fill={atStar ? C.green : C.ink} />
        <Label p={p} x={l} y={c} dx={l > 0.8 ? -10 : 9} dy={-12} anchor={l > 0.8 ? "end" : "start"} size={14} color={atStar ? C.green : C.ink}>
          {atStar ? "x* (optimum)" : "panier"}
        </Label>
        {/* accolades loisir / offre de travail */}
        <Brace x1={p.X(0)} x2={p.X(l) - 2} y={yBrace} color={C.green} label={atStar ? "loisir l* = 0,3125" : "loisir"} />
        <Brace
          x1={p.X(l) + 2}
          x2={p.X(1)}
          y={yBrace}
          color={C.red}
          label={atStar ? "offre de travail 0,6875" : "offre de travail"}
        />
      </PlotSvg>
      <Legend
        items={[
          { color: C.red, label: "droite de budget" },
          { color: atStar ? C.green : C.blue, label: "courbe d'indifférence du panier" },
          { color: C.violet, label: "sa pente (−TMS)", dashed: true },
        ]}
      />
      <div className={`mt-3 rounded-xl border px-3 py-2 text-[14px] leading-relaxed ${tone}`}>{msg}</div>
    </InteractiveCard>
  );
}
