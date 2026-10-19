/*
 * CommitmentSimulator — A2 · commitment devices, slides 31-39.
 *
 * Modèle des slides : m = 9, β = 0,5, δ = 1, u = ln, individu sophistiqué.
 *  t = 0 : il reçoit m et achète un actif illiquide a (le « coffre »).
 *  t = 1 : il a m − a en poche, peut emprunter e au taux r (pas d'intérêt sur
 *          son épargne) ; il consomme c1.
 *  t = 2 : le coffre libère a(1 − p) ; il rembourse e(1 + r) ; il consomme c2.
 * Le moi de t = 1 maximise ln c1 + β ln c2 (forme fermée ci-dessous, vérifiée
 * contre une recherche brute en Python). U0 = β(ln c1 + ln c2) car δ = 1.
 * Contrôles : naïf (a = 0) 6 / 3 → 2,890 ; cas 1 4,5 / 4,5 → 3,008 ;
 * cas 2 4,5 / 4,275 → 2,957 (slide : 2,96) ; cas 3 5 / 3,75, e = 0,5 → 2,931
 * (slide : 2,93).
 */
import { useState, type ReactNode } from "react";
import { InteractiveCard, SliderControl, ChoiceChips } from "@/components/course/Interactive";
import { M, MB } from "@/components/course/Math";
import { C, fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

// MODEL-BEGIN
const M_INC = 9; // revenu m (slide 31)
const BETA = 0.5; // β (slide 31) ; δ = 1 ; u = ln

type Regime = "epargne" | "coin" | "emprunt";

interface T1Result {
  /** m − a : argent liquide disponible en t = 1 */
  cash: number;
  /** a(1 − p) : ce que le coffre libère en t = 2 */
  libere: number;
  c1: number;
  c2: number;
  /** emprunt en t = 1 */
  e: number;
  /** épargne gardée (sans intérêt) de t = 1 à t = 2 */
  s: number;
  /** remboursement e(1 + r) en t = 2 */
  remb: number;
  regime: Regime;
  /** U0 / β = ln c1 + ln c2 (δ = 1) */
  u0: number;
}

/**
 * Choix du moi de t = 1, qui maximise ln c1 + β ln c2.
 * r = Infinity : emprunt impossible.
 *  - « epargne » : il a plus en poche qu'il ne veut consommer → c2 = βc1,
 *    c1 = (cash + libéré)/(1 + β), il garde le surplus s = cash − c1 ;
 *  - « emprunt » : il veut plus que son cash et emprunter vaut la peine →
 *    c2 = β(1 + r)c1, c1 = ((1 + r)cash + libéré)/((1 + r)(1 + β)) ;
 *  - « coin »    : entre les deux (ou emprunt impossible) → c1 = cash, c2 = libéré.
 */
function t1Choice(a: number, p: number, r: number): T1Result {
  const cash = M_INC - a;
  const libere = a * (1 - p);
  let c1: number;
  let c2: number;
  let e = 0;
  let s = 0;
  let regime: Regime;
  if (libere <= BETA * cash) {
    c1 = (cash + libere) / (1 + BETA);
    c2 = BETA * c1;
    s = cash - c1;
    regime = "epargne";
  } else if (Number.isFinite(r) && libere > BETA * (1 + r) * cash) {
    c1 = ((1 + r) * cash + libere) / ((1 + r) * (1 + BETA));
    e = c1 - cash;
    c2 = libere - e * (1 + r);
    regime = "emprunt";
  } else {
    c1 = cash;
    c2 = libere;
    regime = "coin";
  }
  const u0 = c1 > 0 && c2 > 0 ? Math.log(c1) + Math.log(c2) : -Infinity;
  const remb = Number.isFinite(r) ? e * (1 + r) : 0;
  return { cash, libere, c1, c2, e, s, remb, regime, u0 };
}
// MODEL-END

/* ------------------------------------------------------------------ */
/* Réglages, préréglages                                               */
/* ------------------------------------------------------------------ */

type PKey = "0" | "0.05" | "0.1";
type RKey = "0" | "0.25" | "0.5" | "1" | "inf";
type PresetKey = "plan" | "naif" | "cas1" | "cas2" | "cas3";

const P_VAL: Record<PKey, number> = { "0": 0, "0.05": 0.05, "0.1": 0.1 };
const R_KEYS: RKey[] = ["0", "0.25", "0.5", "1", "inf"];
const R_VAL: Record<RKey, number> = { "0": 0, "0.25": 0.25, "0.5": 0.5, "1": 1, inf: Infinity };
const R_TXT: Record<RKey, string> = { "0": "0", "0.25": "0,25", "0.5": "0,5", "1": "1", inf: "∞" };

const U_NAIF = Math.log(6) + Math.log(3); // 2,890 (slide 34)
const U_IDEAL = 2 * Math.log(4.5); // 3,008 (slide 33)
/** programme calculé en t = 0 (slide 33) : a* = 0, e* = 0, c1* = c2* = 4,5 */
const PLAN: T1Result = { cash: M_INC, libere: 0, c1: 4.5, c2: 4.5, e: 0, s: 4.5, remb: 0, regime: "epargne", u0: U_IDEAL };

const PRESETS: Array<{ key: PresetKey; label: string }> = [
  { key: "plan", label: "Plan idéal (t = 0)" },
  { key: "naif", label: "Naïf (a = 0)" },
  { key: "cas1", label: "Cas 1" },
  { key: "cas2", label: "Cas 2" },
  { key: "cas3", label: "Cas 3" },
];

const BANNER: Record<PresetKey, { title: string; text: ReactNode }> = {
  plan: {
    title: "Plan idéal, calculé en t = 0 (slide 33).",
    text: (
      <>
        Vu de <M tex="t=0" />, bloquer de l'argent ou emprunter coûte sans rien rapporter :{" "}
        <M tex="a^* = 0" /> et <M tex="e^* = 0" />. Il veut lisser : <M tex="c_1^* = c_2^* = 4{,}5" />.
        Mais ce plan compte sur le moi de <M tex="t=1" /> pour épargner 4,5… Clique « Naïf (a = 0) »
        pour voir ce qu'il fait vraiment.
      </>
    ),
  },
  naif: {
    title: "Déviation naïve (slide 34).",
    text: (
      <>
        Sans coffre (<M tex="a = 0" />), il a tout <M tex="m" /> en poche en <M tex="t=1" /> et
        n'emprunte rien. Son moi du présent choisit <M tex="\beta c_1 = c_2" /> : <M tex="c_1 = 6" />,{" "}
        <M tex="c_2 = 3" />.
      </>
    ),
  },
  cas1: {
    title: "Cas 1 (slide 36) : p = 0 et r = ∞.",
    text: "Actif non coûteux, emprunt impossible. Il achète a = 4,5 (ici, c'est son meilleur choix : a* = 4,5).",
  },
  cas2: {
    title: "Cas 2 (slide 37) : p = 0,05 et r = ∞.",
    text: "Actif coûteux, emprunt impossible. Supposons qu'il achète a = 4,5.",
  },
  cas3: {
    title: "Cas 3 (slides 38-39) : p = 0 et r = 0,5.",
    text: "Actif non coûteux, emprunt possible. Supposons qu'il achète a = 4,5.",
  },
};

const SLIDE_CHECK: Record<PresetKey, string> = {
  plan: "Slide 33 : c₁* = c₂* = 4,5 et U₀ = 3,008β.",
  naif: "Slide 34 : c₁ = 6, c₂ = 3 et U₀ = 2,89β.",
  cas1: "Slide 36 : a* = 4,5, c₁ = c₂ = 4,5 et U₀ = 3,008β.",
  cas2: "Slide 37 : c₁ = 4,5, c₂ = 4,275 et U₀ = 2,96β (2,957 arrondi).",
  cas3: "Slide 39 : c₁ = 5, c₂ = 3,75, e = 0,5 et U₀ = 2,93β (2,931 arrondi).",
};

const HALO = "var(--color-card)";
const EPS = 1e-9;
const near = (x: number, y: number) => Math.abs(x - y) < EPS;

/** U0/β avec 3 décimales fixes (2,890 ; 3,008) */
function f3(u: number): string {
  if (u === -Infinity) return "−∞";
  return u.toFixed(3).replace(".", ",").replace(/^-/, "−");
}

/** nombre au format TeX français : 4.275 → « 4{,}275 » */
function tx(v: number, d = 3): string {
  return fmt(v, d).replace(",", "{,}").replace("−", "-");
}

/* ------------------------------------------------------------------ */
/* Petits éléments SVG                                                 */
/* ------------------------------------------------------------------ */

/** texte SVG avec halo (lisible par-dessus les traits, en clair comme en sombre) */
function Txt({
  x,
  y,
  children,
  color = C.ink,
  anchor = "middle",
  size = 12.5,
  weight = 600,
  italic = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  italic?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fontStyle={italic ? "italic" : undefined}
      fill={color}
      stroke={HALO}
      strokeWidth={3.5}
      paintOrder="stroke"
    >
      {children}
    </text>
  );
}

/** pointe de flèche dont la pointe est en (x, y) */
function Head({ x, y, dir, color }: { x: number; y: number; dir: "up" | "down" | "left" | "right"; color: string }) {
  const d =
    dir === "down"
      ? `M${x} ${y} l-5 -8 h10 z`
      : dir === "up"
        ? `M${x} ${y} l-5 8 h10 z`
        : dir === "right"
          ? `M${x} ${y} l-8 -5 v10 z`
          : `M${x} ${y} l8 -5 v10 z`;
  return <path d={d} fill={color} />;
}

/* ------------------------------------------------------------------ */
/* Frise t = 0 / t = 1 / t = 2 avec les flux d'argent                  */
/* ------------------------------------------------------------------ */

const X0 = 64;
const X1 = 260;
const X2 = 440;
const AY = 104; // axe du temps
const PW = 58; // pastilles « t = … »
const PH = 26;
const VY = 186; // haut du coffre

function Frise({ res, a, p, r, plan }: { res: T1Result; a: number; p: number; r: number; plan: boolean }) {
  const { cash, libere, c1, c2, e, s, remb } = res;
  const finite = Number.isFinite(r) && !plan;
  const borrow = e > EPS && !plan;
  const save = s > EPS;
  const locked = a > EPS && !plan;
  const top = AY - PH / 2;
  const bot = AY + PH / 2;
  const rTxt = Number.isFinite(r) ? fmt(r, 2) : "∞";

  const label = plan
    ? "Frise du programme prévu en t = 0 : coffre vide, 9 en poche en t = 1, consommation prévue 4,5 en t = 1, épargne 4,5 sans intérêt, consommation prévue 4,5 en t = 2."
    : `Frise : en t = 0, revenu 9 et coffre a = ${fmt(a, 2)} ; en t = 1, ${fmt(cash, 3)} en poche${
        borrow ? `, emprunt ${fmt(e, 3)}` : ""
      }, consommation ${fmt(c1, 3)}${save ? `, épargne ${fmt(s, 3)}` : ""} ; en t = 2, le coffre libère ${fmt(
        libere,
        3,
      )}${borrow ? `, remboursement ${fmt(remb, 3)}` : ""}, consommation ${fmt(c2, 3)}.`;

  return (
    <svg viewBox="0 0 520 240" className="mx-auto mt-2 block h-auto w-full max-w-[600px]" role="img" aria-label={label}>
      {/* revenu m en t = 0 */}
      <Txt x={X0} y={38}>
        revenu m = 9
      </Txt>
      <line x1={X0} y1={46} x2={X0} y2={top - 8} stroke={C.sky} strokeWidth={2.5} />
      <Head x={X0} y={top - 1} dir="down" color={C.sky} />

      {/* banque : emprunt en t = 1, remboursement en t = 2 */}
      <rect
        x={222}
        y={8}
        width={256}
        height={26}
        rx={8}
        fill={finite ? C.red : "none"}
        fillOpacity={0.07}
        stroke={finite ? C.red : C.guide}
        strokeOpacity={finite ? 0.55 : 1}
        strokeDasharray={finite ? undefined : "4 4"}
      />
      <Txt x={350} y={26} color={finite ? C.red : C.soft} weight={finite ? 600 : 500}>
        {plan
          ? "aucun emprunt prévu (e* = 0)"
          : !finite
            ? "emprunt impossible (r = ∞)"
            : borrow
              ? `banque : taux r = ${rTxt}`
              : `banque (r = ${rTxt}) : il n'emprunte pas`}
      </Txt>
      {borrow ? (
        <g>
          <line x1={X1} y1={34} x2={X1} y2={top - 8} stroke={C.red} strokeWidth={2.5} />
          <Head x={X1} y={top - 1} dir="down" color={C.red} />
          <Txt x={X1 - 8} y={58} anchor="end" color={C.red}>
            emprunt
          </Txt>
          <Txt x={X1 - 8} y={74} anchor="end" color={C.red}>
            e = {fmt(e, 3)}
          </Txt>
          <line x1={X2} y1={top - 1} x2={X2} y2={42} stroke={C.red} strokeWidth={2.5} />
          <Head x={X2} y={35} dir="up" color={C.red} />
          <Txt x={X2 - 8} y={58} anchor="end" color={C.red}>
            rembourse
          </Txt>
          <Txt x={X2 - 8} y={74} anchor="end" color={C.red}>
            e(1+r) = {fmt(remb, 3)}
          </Txt>
        </g>
      ) : null}

      {/* t = 0 → t = 1 : l'argent liquide gardé en poche */}
      <line
        x1={X0 + PW / 2}
        y1={AY}
        x2={X1 - PW / 2 - 8}
        y2={AY}
        stroke={cash > EPS ? C.sky : C.guide}
        strokeWidth={2.5}
      />
      <Head x={X1 - PW / 2 - 1} y={AY} dir="right" color={cash > EPS ? C.sky : C.guide} />
      <Txt x={(X0 + X1) / 2} y={AY - 9} color={C.sky}>
        poche : m − a = {fmt(cash, 3)}
      </Txt>

      {/* t = 1 → t = 2 : épargne sans intérêt */}
      {save ? (
        <g>
          <line x1={X1 + PW / 2} y1={AY} x2={X2 - PW / 2 - 8} y2={AY} stroke={C.sky} strokeWidth={2.5} />
          <Head x={X2 - PW / 2 - 1} y={AY} dir="right" color={C.sky} />
          <Txt x={(X1 + X2) / 2} y={AY - 9} color={C.sky}>
            épargne s = {fmt(s, 3)}
          </Txt>
          <Txt x={(X1 + X2) / 2} y={AY + 21} color={C.soft} weight={500}>
            (sans intérêt)
          </Txt>
        </g>
      ) : (
        <line
          x1={X1 + PW / 2}
          y1={AY}
          x2={X2 - PW / 2}
          y2={AY}
          stroke={C.guide}
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
      )}

      {/* les trois dates */}
      {[X0, X1, X2].map((x, i) => (
        <g key={i}>
          <rect
            x={x - PW / 2}
            y={top}
            width={PW}
            height={PH}
            rx={PH / 2}
            fill="var(--color-card)"
            stroke={C.ink}
            strokeWidth={1.6}
          />
          <text x={x} y={AY + 4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill={C.ink}>
            t = {i}
          </text>
        </g>
      ))}

      {/* consommations */}
      {[
        { x: X1, c: c1, n: "₁" },
        { x: X2, c: c2, n: "₂" },
      ].map(({ x, c, n }) => (
        <g key={n}>
          <Txt x={x} y={AY + 33} color={C.soft} weight={500}>
            {plan ? "prévoit" : "consomme"}
          </Txt>
          <Txt x={x} y={AY + 51} color={C.blue} size={15} weight={700}>
            c{n} = {fmt(c, 3)}
          </Txt>
        </g>
      ))}

      {/* le coffre : bloqué en t = 0, libéré en t = 2 */}
      {locked ? (
        <g>
          <line x1={X0} y1={bot} x2={X0} y2={VY - 8} stroke={C.gold} strokeWidth={2.5} />
          <Head x={X0} y={VY - 1} dir="down" color={C.gold} />
          <Txt x={X0 + 8} y={AY + 50} anchor="start" color={C.gold}>
            achète a = {fmt(a, 2)}
          </Txt>
        </g>
      ) : null}
      <rect
        x={40}
        y={VY}
        width={462}
        height={26}
        rx={8}
        fill={C.gold}
        fillOpacity={locked ? 0.14 : 0}
        stroke={locked ? C.gold : C.guide}
        strokeWidth={1.5}
        strokeDasharray={locked ? undefined : "4 4"}
      />
      <Txt x={271} y={VY + 17.5} color={locked ? C.ink : C.soft} weight={locked ? 600 : 500}>
        {locked ? `coffre bloqué (actif illiquide) : a = ${fmt(a, 2)}` : "coffre vide (a = 0)"}
      </Txt>
      {locked ? (
        <g>
          <path d={`M494 ${VY} V${AY} H${X2 + PW / 2 + 8}`} fill="none" stroke={C.gold} strokeWidth={2.5} />
          <Head x={X2 + PW / 2 + 1} y={AY} dir="left" color={C.gold} />
          <Txt x={487} y={VY - 9} anchor="end" color={C.gold}>
            libéré : a(1 − p) = {fmt(libere, 3)}
          </Txt>
          {p > 0 ? (
            <Txt x={502} y={VY + 46} anchor="end" color={C.red}>
              perdu (dépréciation) : a·p = {fmt(a * p, 3)}
            </Txt>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Frise verticale (téléphone) : mêmes flux, en texte                  */
/* ------------------------------------------------------------------ */

type LedgerLine = { amt: string; text: ReactNode; color: string; total?: boolean };

function Ledger({ res, a, p, r, plan }: { res: T1Result; a: number; p: number; r: number; plan: boolean }) {
  const { cash, libere, c1, c2, e, s, remb } = res;
  const locked = a > EPS && !plan;
  const borrow = e > EPS && !plan;
  const save = s > EPS;
  const noLoan = plan
    ? "aucun emprunt prévu"
    : Number.isFinite(r)
      ? `n'emprunte pas (r = ${fmt(r, 2)})`
      : "emprunt impossible (r = ∞)";
  const rows: Array<{ t: number; lines: LedgerLine[] }> = [
    {
      t: 0,
      lines: [
        { amt: "+9", text: "revenu m", color: C.sky },
        ...(locked ? [{ amt: `−${fmt(a, 2)}`, text: "bloqué dans le coffre : a", color: C.gold }] : []),
        { amt: `= ${fmt(cash, 3)}`, text: "reste en poche : m − a", color: C.sky, total: true },
      ],
    },
    {
      t: 1,
      lines: [
        { amt: `+${fmt(cash, 3)}`, text: "en poche : m − a", color: C.sky },
        borrow
          ? { amt: `+${fmt(e, 3)}`, text: `emprunt e (taux r = ${fmt(r, 2)})`, color: C.red }
          : { amt: "·", text: noLoan, color: C.soft },
        ...(save
          ? [{ amt: `−${fmt(s, 3)}`, text: `${plan ? "épargne prévue" : "épargne"} s (sans intérêt)`, color: C.sky }]
          : []),
        { amt: `= ${fmt(c1, 3)}`, text: plan ? "consommation prévue c₁" : "consomme c₁", color: C.blue, total: true },
      ],
    },
    {
      t: 2,
      lines: [
        ...(locked
          ? [
              {
                amt: `+${fmt(libere, 3)}`,
                text: (
                  <>
                    libéré par le coffre : a(1 − p)
                    {p > 0 ? (
                      <span style={{ color: C.red }}> · perdu a·p = {fmt(a * p, 3)}</span>
                    ) : null}
                  </>
                ),
                color: C.gold,
              },
            ]
          : []),
        ...(save ? [{ amt: `+${fmt(s, 3)}`, text: "épargne récupérée", color: C.sky }] : []),
        ...(borrow ? [{ amt: `−${fmt(remb, 3)}`, text: "rembourse e(1 + r)", color: C.red }] : []),
        { amt: `= ${fmt(c2, 3)}`, text: plan ? "consommation prévue c₂" : "consomme c₂", color: C.blue, total: true },
      ],
    },
  ];
  return (
    <ol className="mt-2.5 space-y-1.5" aria-label="Frise des flux d'argent en t = 0, t = 1 et t = 2">
      {rows.map((row) => (
        <li key={row.t} className="flex gap-2">
          <div className="flex shrink-0 flex-col items-center">
            <span className="whitespace-nowrap rounded-full border-2 border-foreground/70 bg-card px-1.5 py-0.5 text-[12.5px] font-bold">
              t = {row.t}
            </span>
            {row.t < 2 ? <span className="mt-1 w-0.5 flex-1 bg-border" aria-hidden /> : null}
          </div>
          <div className="min-w-0 flex-1 rounded-lg border bg-card px-2.5 py-1.5">
            {row.lines.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-baseline gap-2 text-[13.5px] leading-snug",
                  l.total && "mt-0.5 border-t pt-0.5 font-bold",
                )}
              >
                <span className="w-14 shrink-0 whitespace-nowrap text-right font-semibold tabular-nums" style={{ color: l.color }}>
                  {l.amt}
                </span>
                <span className="min-w-0">{l.text}</span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Jauge U0/β (axe zoomé) avec les références naïf / idéal             */
/* ------------------------------------------------------------------ */

const G_MIN = 2.75;
const G_MAX = 3.05;
const GX0 = 30;
const GW = 460;
const gx = (u: number) => GX0 + ((Math.min(Math.max(u, G_MIN), G_MAX) - G_MIN) / (G_MAX - G_MIN)) * GW;

function Gauge({ u0, plan }: { u0: number; plan: boolean }) {
  const fin = Number.isFinite(u0);
  const diff = u0 - U_NAIF;
  const color = plan ? C.gold : !fin || diff < -5e-4 ? C.red : diff > 5e-4 ? C.green : C.soft;
  const end = fin ? gx(u0) : GX0;
  const w = Math.max(5, end - GX0);
  const off = !fin || u0 < G_MIN;
  return (
    <svg
      viewBox="0 0 520 84"
      className="mx-auto block h-auto w-full max-w-[600px]"
      role="img"
      aria-label={`Jauge : U0 divisé par bêta vaut ${f3(u0)}, contre 2,890 pour le naïf et 3,008 pour le plan idéal`}
    >
      <rect x={GX0} y={30} width={GW} height={24} rx={6} fill={C.guide} fillOpacity={0.16} />
      <rect
        x={GX0}
        y={30}
        width={w}
        height={24}
        rx={6}
        fill={color}
        style={{ transition: "width 250ms ease, fill 250ms ease" }}
      />
      {(
        [
          ["2,8", 2.8],
          ["2,9", 2.9],
          ["3,0", 3.0],
        ] as const
      ).map(([t, v]) => (
        <g key={t}>
          <line x1={gx(v)} y1={54} x2={gx(v)} y2={60} stroke={C.soft} strokeWidth={1.2} />
          <text x={gx(v)} y={74} textAnchor="middle" fontSize={12} fill={C.soft}>
            {t}
          </text>
        </g>
      ))}
      <line x1={gx(U_NAIF)} y1={22} x2={gx(U_NAIF)} y2={62} stroke={C.red} strokeWidth={1.8} strokeDasharray="4 3" />
      <Txt x={gx(U_NAIF)} y={17} color={C.red}>
        naïf 2,890
      </Txt>
      <line x1={gx(U_IDEAL)} y1={22} x2={gx(U_IDEAL)} y2={62} stroke={C.gold} strokeWidth={1.8} strokeDasharray="4 3" />
      <Txt x={gx(U_IDEAL)} y={17} color={C.gold}>
        idéal 3,008
      </Txt>
      {off ? (
        <Txt x={GX0 + 10} y={47} anchor="start" color={C.red} size={13} weight={700}>
          ◀ {f3(u0)} : hors échelle
        </Txt>
      ) : w > 70 ? (
        <text x={end - 6} y={47} textAnchor="end" fontSize={13} fontWeight={700} fill="#fff">
          {f3(u0)}
        </text>
      ) : (
        <Txt x={end + 6} y={47} anchor="start" size={13} weight={700}>
          {f3(u0)}
        </Txt>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Ce que décide le moi de t = 1 (texte selon le régime)               */
/* ------------------------------------------------------------------ */

function Explain({ res, a, p, r, plan }: { res: T1Result; a: number; p: number; r: number; plan: boolean }) {
  const { cash, libere, c1, c2, e, s, regime } = res;
  if (plan) {
    return (
      <p>
        Pour le moi de <M tex="t=0" />, <M tex="c_1" /> et <M tex="c_2" /> pèsent autant (
        <M tex="\beta\delta" /> et <M tex="\beta\delta^2" />, avec <M tex="\delta = 1" />
        ). Il veut donc <M tex="c_1^* = c_2^*" />, soit 4,5 chacun, et compte sur son moi de{" "}
        <M tex="t=1" /> pour épargner 4,5 sur les 9.
      </p>
    );
  }
  if (regime === "epargne") {
    return (
      <>
        <p>
          {a > EPS ? <>Le coffre est trop petit pour le gêner : avec </> : <>Avec </>}
          <M tex={`m - a = ${tx(cash)}`} /> en poche, il a plus qu'il ne veut consommer. Il choisit,
          comme au slide 34, <M tex="c_2 = \beta c_1" /> et garde le reste pour <M tex="t=2" /> (sans
          intérêt) :
        </p>
        <MB tex={`c_1 = \\frac{(m-a) + a(1-p)}{1+\\beta} = \\frac{${tx(cash)} + ${tx(libere)}}{1{,}5} = ${tx(c1)}`} />
        <MB tex={`c_2 = \\beta c_1 = ${tx(c2)}, \\qquad s = (m-a) - c_1 = ${tx(s)}`} />
        {a > EPS ? (
          <p>
            Résultat : {p > 0 ? "un peu moins bien que" : "exactement comme"} le naïf. Pour servir de
            commitment device, le coffre doit le priver d'argent qu'il voudrait dépenser en{" "}
            <M tex="t=1" />.
          </p>
        ) : null}
      </>
    );
  }
  if (regime === "coin") {
    if (c1 <= 0) {
      return (
        <p>
          Tout est bloqué et il ne peut pas emprunter : <M tex="c_1 = 0" />, et{" "}
          <M tex="\ln 0 = -\infty" />. Catastrophe : il faut lui laisser un peu d'argent pour{" "}
          <M tex="t=1" /> !
        </p>
      );
    }
    return (
      <>
        <p>
          Le verrou mord : il voudrait consommer plus que ses <M tex={`m - a = ${tx(cash)}`} /> en poche
          (son moi du présent préférerait <M tex="c_2 = \beta c_1" />
          ),{" "}
          {Number.isFinite(r) ? (
            <>
              mais avec <M tex={`r = ${tx(r, 2)}`} />, emprunter lui coûte trop cher : il n'emprunte pas (
              <M tex="e = 0" />
              ). Il n'emprunterait que si <M tex="a(1-p) > \beta(1+r)(m-a)" /> ; ici{" "}
              <M tex={`${tx(libere)} \\le ${tx(BETA * (1 + r) * cash)}`} />.
            </>
          ) : (
            <>
              mais il ne peut pas emprunter (<M tex="r = \infty" />
              ).
            </>
          )}
        </p>
        <MB tex={`c_1 = m - a = ${tx(cash)}, \\qquad c_2 = a(1-p) = ${tx(libere)}`} />
      </>
    );
  }
  return (
    <>
      <p>
        Ses <M tex={`m - a = ${tx(cash)}`} /> en poche lui semblent trop justes : il emprunte. Condition
        du premier ordre (slide 39) : <M tex="c_2 = \beta(1+r)\,c_1" />, ici{" "}
        <M tex={`c_2 = ${tx(BETA * (1 + r))}\\,c_1`} />. Avec <M tex="c_1 = (m-a) + e" /> et{" "}
        <M tex="c_2 = a(1-p) - e(1+r)" /> :
      </p>
      <MB tex={`c_1 = \\frac{(1+r)(m-a) + a(1-p)}{(1+r)(1+\\beta)} = ${tx(c1)}`} />
      <MB tex={`e = c_1 - (m-a) = ${tx(e)}`} />
      <MB tex={`c_2 = a(1-p) - e(1+r) = ${tx(c2)}`} />
      {r === 0 ? (
        <p>
          Avec <M tex="r = 0" />, emprunter ne coûte rien : l'emprunt annule complètement l'effet du coffre
          {p > 0 ? ", et la dépréciation le rend même coûteux" : ""}.
        </p>
      ) : null}
    </>
  );
}

function Tile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "blue" | "red";
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border px-3 py-2",
        tone === "blue"
          ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30"
          : tone === "red"
            ? "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30"
            : "bg-card",
      )}
    >
      <div className="text-[12.5px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[16px] font-bold tabular-nums text-foreground">{value}</div>
      {sub ? <div className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export function CommitmentSimulator() {
  const [a, setA] = useState(4.5);
  const [pKey, setPKey] = useState<PKey>("0");
  const [rKey, setRKey] = useState<RKey>("inf");
  const [plan, setPlan] = useState(false);

  const p = P_VAL[pKey];
  const r = R_VAL[rKey];
  const res = plan ? PLAN : t1Choice(a, p, r);

  const at45 = near(a, 4.5);
  const preset: PresetKey | null = plan
    ? "plan"
    : near(a, 0)
      ? "naif"
      : at45 && pKey === "0" && rKey === "inf"
        ? "cas1"
        : at45 && pKey === "0.05" && rKey === "inf"
          ? "cas2"
          : at45 && pKey === "0" && rKey === "0.5"
            ? "cas3"
            : null;

  function applyPreset(k: PresetKey) {
    if (k === "plan") {
      setPlan(true);
      setA(0);
      return;
    }
    setPlan(false);
    if (k === "naif") {
      setA(0);
      return;
    }
    setA(4.5);
    if (k === "cas1") {
      setPKey("0");
      setRKey("inf");
    } else if (k === "cas2") {
      setPKey("0.05");
      setRKey("inf");
    } else {
      setPKey("0");
      setRKey("0.5");
    }
  }

  const diff = res.u0 - U_NAIF;
  const atIdeal = Math.abs(res.u0 - U_IDEAL) < 5e-4;
  const sweep = R_KEYS.map((k) => ({ k, ...t1Choice(a, p, R_VAL[k]) }));

  return (
    <InteractiveCard
      title="Simulateur : coffre (actif illiquide) et emprunt"
      subtitle={
        <>
          Modèle des slides 31-39 : <M tex="m = 9" />, <M tex="\beta = 0{,}5" />, <M tex="\delta = 1" />,{" "}
          <M tex="u = \ln" />, individu sophistiqué. En <M tex="t=0" />, tu choisis combien bloquer dans le
          coffre ; en <M tex="t=1" />, c'est le moi du présent qui décide seul de <M tex="c_1" /> et de
          l'emprunt <M tex="e" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Bloqué dans le coffre en <M tex="t=0" /> : <M tex="a" />
              </>
            }
            value={a}
            onChange={(v) => {
              setPlan(false);
              setA(v);
            }}
            min={0}
            max={9}
            step={0.05}
            format={(v) => fmt(v, 2)}
          />
          <ChoiceChips<PKey>
            label={
              <>
                Dépréciation du coffre <M tex="p" />
              </>
            }
            value={pKey}
            onChange={(v) => {
              setPlan(false);
              setPKey(v);
            }}
            options={[
              { value: "0", label: "0" },
              { value: "0.05", label: "0,05" },
              { value: "0.1", label: "0,10" },
            ]}
          />
          <ChoiceChips<RKey>
            label={
              <>
                Taux d'intérêt de l'emprunt <M tex="r" />
              </>
            }
            value={rKey}
            onChange={(v) => {
              setPlan(false);
              setRKey(v);
            }}
            options={R_KEYS.map((k) => ({ value: k, label: k === "inf" ? "∞ : emprunt impossible" : R_TXT[k] }))}
          />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
            <span className="text-[13px] font-semibold text-muted-foreground">Préréglages :</span>
            {PRESETS.map((pr) => (
              <button
                key={pr.key}
                type="button"
                onClick={() => applyPreset(pr.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                  preset === pr.key
                    ? "border-primary bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {pr.label}
              </button>
            ))}
          </div>
        </>
      }
      footer={
        <>
          <strong>Cas 1</strong> : le coffre met de côté exactement les 4,5 voulus pour <M tex="t=2" /> et
          l'emprunt est impossible : on retrouve le plan idéal (3,008). <strong>Cas 2</strong> : le coffre
          perd 0,225, mais 2,957 &gt; 2,890 : il reste utile. <strong>Cas 3</strong> : il bloque 4,5 puis
          emprunte 0,5 ; l'emprunt défait une partie du verrou (2,931). Change <M tex="r" /> : à{" "}
          <M tex="r = 0" />, le coffre ne sert plus à rien ; à <M tex="r = 1" />, il n'emprunte plus. Un
          coffre trop petit (<M tex="a \le 3" /> si <M tex="p = 0" />) ne contraint pas le moi de{" "}
          <M tex="t=1" /> : il épargne de lui-même et finit comme le naïf.
        </>
      }
    >
      {/* ---------------- situation ---------------- */}
      <div className="rounded-xl border bg-muted/30 px-3.5 py-2.5 text-[14px] leading-relaxed">
        {preset ? (
          <>
            <strong>{BANNER[preset].title}</strong> {BANNER[preset].text}
          </>
        ) : (
          <>
            <strong>Réglage libre :</strong> <M tex={`a = ${tx(a, 2)}`} />, <M tex={`p = ${tx(p, 2)}`} />,{" "}
            {Number.isFinite(r) ? <M tex={`r = ${tx(r, 2)}`} /> : <>emprunt impossible</>}.
          </>
        )}
      </div>

      {/* ---------------- frise (SVG ≥ 640 px, version texte sur téléphone) ---------------- */}
      <div className="hidden sm:block">
        <Frise res={res} a={a} p={p} r={r} plan={plan} />
      </div>
      <div className="sm:hidden">
        <Ledger res={res} a={a} p={p} r={r} plan={plan} />
      </div>

      {/* ---------------- décision du moi de t = 1 ---------------- */}
      <div className="mt-2 rounded-xl border bg-card px-3.5 py-3 text-[14px] leading-relaxed">
        <div className="mb-1 font-bold">
          {plan ? "Ce que prévoit le moi de t = 0" : "Ce que décide le moi de t = 1 (il maximise ln c₁ + β ln c₂)"}
        </div>
        <Explain res={res} a={a} p={p} r={r} plan={plan} />
      </div>

      {/* ---------------- lectures ---------------- */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile
          label={
            <>
              Conso en <M tex="t=1" /> : <M tex="c_1" />
            </>
          }
          value={fmt(res.c1, 3)}
          tone="blue"
        />
        <Tile
          label={
            <>
              Conso en <M tex="t=2" /> : <M tex="c_2" />
            </>
          }
          value={fmt(res.c2, 3)}
          tone="blue"
        />
        <Tile
          label={
            <>
              Emprunt <M tex="e" />
            </>
          }
          value={fmt(res.e, 3)}
          sub={
            res.e > EPS ? (
              <>rembourse {fmt(res.remb, 3)}</>
            ) : res.s > EPS ? (
              <>épargne s = {fmt(res.s, 3)}</>
            ) : undefined
          }
          tone={res.e > EPS ? "red" : "default"}
        />
        <Tile
          label={<M tex="U_0/\beta" />}
          value={f3(res.u0)}
          sub={res.c1 > 0 ? <>ln {fmt(res.c1, 3)} + ln {fmt(res.c2, 3)}</> : <>ln 0 = −∞</>}
        />
      </div>

      {/* ---------------- jauge U0/β ---------------- */}
      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        Juge de paix : l'utilité <strong>ex-ante</strong>, vue de <M tex="t=0" /> :{" "}
        <M tex="U_0 = \beta\delta\ln c_1 + \beta\delta^2\ln c_2 = \beta(\ln c_1 + \ln c_2)" /> car{" "}
        <M tex="\delta = 1" />. On compare donc <M tex="U_0/\beta" /> (axe zoomé de 2,75 à 3,05).
      </p>
      <Gauge u0={res.u0} plan={plan} />
      <div
        className={cn(
          "mt-1 rounded-xl border px-3.5 py-2 text-[14px] font-medium leading-relaxed",
          plan
            ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            : diff > 5e-4
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : diff < -5e-4 || !Number.isFinite(res.u0)
                ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                : "bg-muted/40",
        )}
      >
        {plan ? (
          <>Plan prévu : 3,008, le maximum possible… à condition d'être suivi.</>
        ) : !Number.isFinite(res.u0) ? (
          <>✗ U₀/β = −∞ : pire que tout.</>
        ) : diff > 5e-4 ? (
          <>
            ✓ Bat le naïf : {f3(res.u0)} &gt; 2,890 (+{f3(diff)}){atIdeal ? ", et atteint le plan idéal !" : "."}
          </>
        ) : diff < -5e-4 ? (
          <>✗ Moins bien que le naïf : {f3(res.u0)} &lt; 2,890.</>
        ) : preset === "naif" ? (
          <>C'est le programme du naïf : 2,890, sous le plan idéal (3,008).</>
        ) : (
          <>
            ≈ Comme le naïf ({f3(res.u0)} contre 2,890) : ici, le coffre ne change {Math.abs(diff) < 1e-6 ? "rien" : "presque rien"}.
          </>
        )}
        {preset ? (
          <span className="mt-0.5 block text-[13px] text-emerald-700 dark:text-emerald-400">
            ✓ {SLIDE_CHECK[preset]}
          </span>
        ) : null}
      </div>

      {/* ---------------- effet du taux r (slide 39) ---------------- */}
      {!plan ? (
        <div className="mt-4">
          <div className="text-[14px] font-bold">
            Effet du taux <M tex="r" /> (avec <M tex={`a = ${tx(a, 2)}`} /> et <M tex={`p = ${tx(p, 2)}`} />)
          </div>
          <p className="text-[13px] text-muted-foreground">
            Slide 39 : plus le taux d'intérêt est élevé, moins il emprunte, et plus le coffre est un
            commitment device efficace.
          </p>
          <div className="mt-1.5 overflow-x-auto">
            <table className="w-full min-w-[290px] border-collapse text-center text-[13px] tabular-nums">
              <thead>
                <tr className="border-b">
                  <th className="py-1 pr-2 text-left font-semibold text-muted-foreground">
                    <M tex="r" />
                  </th>
                  {sweep.map((x) => (
                    <th
                      key={x.k}
                      className={cn("px-1 py-1 font-semibold", x.k === rKey && "rounded-t-md bg-accent text-accent-foreground")}
                    >
                      {R_TXT[x.k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <th className="py-1 pr-2 text-left font-semibold text-muted-foreground">
                    <M tex="e" />
                  </th>
                  {sweep.map((x) => (
                    <td key={x.k} className={cn("px-1 py-1", x.k === rKey && "bg-accent/60 font-bold")}>
                      {fmt(x.e, 2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="py-1 pr-2 text-left font-semibold text-muted-foreground">
                    <M tex="U_0/\beta" />
                  </th>
                  {sweep.map((x) => (
                    <td key={x.k} className={cn("px-1 py-1", x.k === rKey && "rounded-b-md bg-accent/60 font-bold")}>
                      {f3(x.u0)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* ---------------- mise en garde du slide 35 ---------------- */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3 text-[14px] leading-relaxed dark:border-amber-900 dark:bg-amber-950/30">
        <strong>a = 4,5 est un exemple.</strong> Au slide 35, le prof ne cherche pas le meilleur{" "}
        <M tex="a" /> (sauf dans le cas 1) : il montre seulement qu'il existe des programmes « incentive
        compatible » (que le moi de <M tex="t=1" /> suivra effectivement) qui font mieux que le naïf. Bouge
        le curseur <M tex="a" /> : tu verras que d'autres valeurs font parfois encore mieux.
      </div>
    </InteractiveCard>
  );
}
