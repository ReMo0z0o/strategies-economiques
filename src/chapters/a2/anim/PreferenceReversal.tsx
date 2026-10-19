/*
 * PreferenceReversal — A2 · problèmes de self-contrôle, slides 20-24.
 *
 * « 100 € dans D semaines » contre « 110 € dans D + 1 semaines », vus
 * d'aujourd'hui par un individu (β, δ) dont δ est le facteur d'escompte
 * HEBDOMADAIRE. Utilité linéaire u(x) = x pour la lisibilité (choix de
 * l'animation, dit à l'écran). Valeur vue d'aujourd'hui :
 *   100 € : 100 si D = 0, sinon 100·βδ^D ;   110 € : 110·βδ^(D+1).
 * Contrôles (β = 0,8 ; δ = 0,99) : D = 52 → 47,4 contre 51,7 ;
 * D = 1 → 79,2 contre 86,2 ; D = 0 → 100 contre 87,1.
 * Pour D ≥ 1, on divise par βδ^D : 100 contre 110δ (β disparaît, condition
 * B2 ≻ B1 du slide 24). Pour D = 0 : 100 contre 110βδ (condition A1 ≻ A2).
 * Avec δ ∈ [0,95 ; 1], 110δ > 100 : le choix ne peut basculer qu'en D = 0,
 * et seulement si 110βδ < 100 ; avec β = 1, jamais.
 */
import { useEffect, useState, type ReactNode } from "react";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M, MB } from "@/components/course/Math";
import { C, fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const D_MAX = 52;
const HALO = "var(--color-card)";
const COL100 = C.blue;
const COL110 = C.teal;

/** nombre au format TeX français : 87.12 → « 87{,}1 » */
function tx(v: number, d = 1): string {
  return fmt(v, d).replace(",", "{,}").replace("−", "-");
}

function Check({ ok }: { ok: boolean }) {
  return (
    <span className={cn("font-bold", ok ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
      {ok ? "✓ vrai" : "✗ faux"}
    </span>
  );
}

/** une ligne « montant → barre de valeur vue d'aujourd'hui » */
function ValueBar({
  color,
  title,
  formula,
  value,
  nominal,
  chosen,
}: {
  color: string;
  title: ReactNode;
  formula: ReactNode;
  value: number;
  nominal: number;
  chosen: boolean;
}) {
  const w = (value / 110) * 100;
  const wn = (nominal / 110) * 100;
  return (
    <div className={cn("rounded-xl border px-3 py-2.5 transition-colors", chosen ? "border-2 bg-card shadow-sm" : "bg-muted/30")} style={chosen ? { borderColor: color } : undefined}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="text-[14px] font-semibold">
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: color }} />
          {title}
        </div>
        {chosen ? (
          <span className="rounded-full px-2.5 py-0.5 text-[12.5px] font-bold text-white" style={{ background: color }}>
            ✓ choisi
          </span>
        ) : (
          <span className="text-[12.5px] text-muted-foreground">non choisi</span>
        )}
      </div>
      <div className="mt-1 text-[13px] text-muted-foreground">{formula}</div>
      <div className="relative mt-2 h-7">
        {/* montant nominal (pointillé) */}
        <div className="absolute inset-y-0 left-0 rounded-md border-2 border-dashed" style={{ width: `${wn}%`, borderColor: color, opacity: 0.45 }} />
        {/* valeur vue d'aujourd'hui */}
        <div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{ width: `${w}%`, background: color, transition: "width 220ms ease" }}
        />
        <span
          className="absolute text-[14px] font-bold tabular-nums"
          style={
            w > 22
              ? { top: "50%", left: `calc(${w}% - 0.4rem)`, transform: "translate(-100%, -50%)", color: "#fff" }
              : { top: "50%", left: `calc(${w}% + 0.4rem)`, transform: "translate(0, -50%)", color }
          }
        >
          {fmt(value, 1)}
        </span>
      </div>
    </div>
  );
}

export function PreferenceReversal() {
  const [beta, setBeta] = useState(0.8);
  const [delta, setDelta] = useState(0.99);
  const [D, setD] = useState(D_MAX);
  const [playing, setPlaying] = useState(false);

  // ▶ : le temps passe d'une semaine à la fois (plus lentement à la fin, pour voir la bascule)
  useEffect(() => {
    if (!playing) return;
    if (D <= 0) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setD((d) => Math.max(0, d - 1)), D <= 3 ? 650 : 120);
    return () => window.clearTimeout(id);
  }, [playing, D]);

  function play() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (D <= 0) setD(D_MAX);
    setPlaying(true);
  }

  const v100 = D === 0 ? 100 : 100 * beta * delta ** D;
  const v110 = 110 * beta * delta ** (D + 1);
  const pick100 = v100 > v110;
  const condA = 100 > 110 * beta * delta; // A1 ≻ A2
  const condB = 100 < 110 * delta; // B2 ≻ B1
  const now = D === 0;

  // frise : semaine → abscisse
  const X = (wk: number) => 22 + (wk / (D_MAX + 1)) * 400;
  const axisY = 58;

  return (
    <InteractiveCard
      title="Machine à renversement : 100 € plus tôt ou 110 € une semaine plus tard ?"
      subtitle={
        <>
          Pour des calculs lisibles, on prend ici une utilité linéaire <M tex="u(x) = x" /> (choix de
          l'animation). Vu d'aujourd'hui, <M tex="x" /> € reçus dans <M tex="t" /> semaines valent{" "}
          <M tex="x\,\beta\delta^{t}" />, et <M tex="x" /> s'ils arrivent maintenant ; <M tex="\delta" />{" "}
          est le facteur d'escompte <strong>par semaine</strong>.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Biais de self-contrôle <M tex="\beta" />
              </>
            }
            value={beta}
            onChange={setBeta}
            min={0.5}
            max={1}
            step={0.01}
            format={(v) => fmt(v, 2)}
          />
          <SliderControl
            label={
              <>
                Facteur d'escompte par semaine <M tex="\delta" />
              </>
            }
            value={delta}
            onChange={setDelta}
            min={0.95}
            max={1}
            step={0.005}
            format={(v) => fmt(v, 3)}
          />
          <SliderControl
            label={<>Le temps passe → (attente D)</>}
            value={D_MAX - D}
            onChange={(v) => {
              setPlaying(false);
              setD(D_MAX - v);
            }}
            min={0}
            max={D_MAX}
            step={1}
            format={(v) => `D = ${D_MAX - v}`}
          />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
            <button
              type="button"
              onClick={play}
              className="rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              {playing ? "⏸ Pause" : "▶ Faire passer le temps"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setD(D_MAX);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                D === D_MAX ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              Version B : dans un an (D = 52)
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setD(0);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                D === 0 ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              Version A : maintenant (D = 0)
            </button>
          </div>
        </>
      }
      footer={
        <>
          tant que les deux récompenses sont dans le futur, les deux barres bougent{" "}
          <strong>ensemble</strong> (leur rapport reste 110δ/100) et le choix ne change pas. Le choix
          bascule <strong>exactement</strong> quand la première récompense devient « maintenant » : le β
          ne frappe plus que l'option tardive. Il faut pour cela que β soit assez petit (
          <M tex="110\,\beta\delta < 100" />
          ). Mets β = 1 : plus aucune bascule.
        </>
      }
    >
      {/* ---------------- frise ---------------- */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COL100 }} />
          100 € dans <strong className="tabular-nums text-foreground">{D}</strong> sem.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COL110 }} />
          110 € dans <strong className="tabular-nums text-foreground">{D + 1}</strong> sem.
        </span>
      </div>
      <svg
        viewBox="0 0 440 92"
        className="mx-auto mt-1 block h-auto w-full max-w-[560px]"
        role="img"
        aria-label={`Ligne du temps : 100 euros dans ${D} semaines et 110 euros dans ${D + 1} semaines`}
      >
        <line x1={X(0)} y1={axisY} x2={X(D_MAX + 1) + 6} y2={axisY} stroke={C.soft} strokeWidth={1.5} />
        <path d={`M${X(D_MAX + 1) + 12} ${axisY} l-7 -4 v8 z`} fill={C.soft} />
        {[0, 13, 26, 39, 52].map((wk) => (
          <g key={wk}>
            <line x1={X(wk)} y1={axisY} x2={X(wk)} y2={axisY + 5} stroke={C.soft} strokeWidth={1.2} />
            {wk === 0 || wk === 26 || wk === 52 ? (
              <text
                x={wk === 52 ? X(wk) + 8 : X(wk)}
                y={axisY + 20}
                textAnchor={wk === 0 ? "start" : wk === 52 ? "end" : "middle"}
                fontSize={12.5}
                fontWeight={wk === 0 ? 700 : 500}
                fill={wk === 0 ? C.ink : C.soft}
                dx={wk === 0 ? -6 : 0}
              >
                {wk === 0 ? "aujourd'hui" : wk === 52 ? "52 sem. ≈ 1 an" : `${wk} sem.`}
              </text>
            ) : null}
          </g>
        ))}
        {/* accolade d'attente */}
        {D > 0 ? (
          <g>
            <path
              d={`M${X(0)} ${axisY - 14} v-6 H${X(D)} v6`}
              fill="none"
              stroke={COL100}
              strokeWidth={1.4}
              style={{ transition: "d 120ms linear" }}
            />
            <text
              x={X(0) + 2}
              y={axisY - 26}
              textAnchor="start"
              fontSize={12.5}
              fontWeight={600}
              fill={COL100}
              stroke={HALO}
              strokeWidth={3.5}
              paintOrder="stroke"
            >
              attente avant les 100 € : D = {D} semaine{D > 1 ? "s" : ""}
            </text>
          </g>
        ) : (
          <text x={X(0) + 16} y={axisY - 22} fontSize={13} fontWeight={700} fill={COL100}>
            les 100 €, c'est maintenant !
          </text>
        )}
        {/* les deux récompenses */}
        <circle cx={X(D + 1)} cy={axisY} r={7} fill={COL110} stroke={HALO} strokeWidth={2} style={{ transition: "cx 120ms linear" }} />
        <circle
          cx={X(D)}
          cy={axisY}
          r={now ? 9 : 7}
          fill={COL100}
          stroke={HALO}
          strokeWidth={2}
          style={{ transition: "cx 120ms linear" }}
        />
      </svg>

      {/* ---------------- barres ---------------- */}
      <div className="mt-2 text-[13px] font-semibold text-muted-foreground">
        Valeur vue d'aujourd'hui (pointillés : montant reçu)
      </div>
      <div className="mt-1.5 grid gap-2">
        <ValueBar
          color={COL100}
          title={now ? "100 € maintenant" : `100 € dans ${D} semaine${D > 1 ? "s" : ""}`}
          formula={
            now ? (
              <>
                reçu maintenant : pas de <M tex="\beta" />, il vaut <M tex="100" />
              </>
            ) : (
              <>
                <M tex={`100\\,\\beta\\delta^{${D}} = ${tx(v100)}`} />
              </>
            )
          }
          value={v100}
          nominal={100}
          chosen={pick100}
        />
        <ValueBar
          color={COL110}
          title={`110 € dans ${D + 1} semaine${D + 1 > 1 ? "s" : ""}`}
          formula={<M tex={`110\\,\\beta\\delta^{${D + 1}} = ${tx(v110)}`} />}
          value={v110}
          nominal={110}
          chosen={!pick100}
        />
      </div>
      <div
        className={cn(
          "mt-2.5 rounded-xl border px-3.5 py-2.5 text-[14px] font-medium leading-relaxed",
          pick100
            ? "border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200"
            : "border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200",
        )}
      >
        {pick100 ? (
          <>Vu d'aujourd'hui, il choisit les <strong>100 € tout de suite</strong>.</>
        ) : (
          <>
            Vu d'aujourd'hui, il choisit les <strong>110 €</strong> (dans {D + 1} semaine{D + 1 > 1 ? "s" : ""}).
          </>
        )}
      </div>

      {/* ---------------- dérivation du slide 24 ---------------- */}
      <div className="mt-5 text-[15px] font-bold">Pourquoi le choix bascule-t-il ? (slide 24)</div>
      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
        <div className={cn("min-w-0 rounded-xl border px-3.5 py-3 text-[14px] leading-relaxed", !now ? "border-2 border-primary/50 bg-card shadow-sm" : "bg-muted/30 opacity-80")}>
          <div className="font-bold">Les deux récompenses sont futures (D ≥ 1)</div>
          <div className="text-[13px] text-muted-foreground">comme la version B : B1 contre B2</div>
          <p className="mt-1.5">
            Il compare <M tex="100\,\beta\delta^{D}" /> et <M tex="110\,\beta\delta^{D+1}" />. On divise
            les deux côtés par <M tex="\beta\delta^{D}" /> (un nombre positif : le sens de la comparaison
            ne change pas) :
          </p>
          <MB tex={`100 \\quad\\text{contre}\\quad 110\\,\\delta = ${tx(110 * delta)}`} />
          <p>
            <strong>β a disparu !</strong> Seul δ compte, quel que soit D. C'est la condition{" "}
            <M tex="B2 \succ B1" /> du slide : <M tex="u(c+100)-u(c) < \delta\,[u(c+110)-u(c)]" />, qui
            devient ici <M tex="100 < 110\,\delta" /> : <Check ok={condB} />.
          </p>
        </div>
        <div className={cn("min-w-0 rounded-xl border px-3.5 py-3 text-[14px] leading-relaxed", now ? "border-2 border-primary/50 bg-card shadow-sm" : "bg-muted/30 opacity-80")}>
          <div className="font-bold">La 1re récompense est maintenant (D = 0)</div>
          <div className="text-[13px] text-muted-foreground">comme la version A : A1 contre A2</div>
          <p className="mt-1.5">
            Maintenant n'est pas raboté par β : les 100 € valent 100. Les 110 € dans une semaine valent{" "}
            <M tex="110\,\beta\delta" />. Il compare donc :
          </p>
          <MB tex={`100 \\quad\\text{contre}\\quad 110\\,\\beta\\delta = ${tx(110 * beta * delta)}`} />
          <p>
            <strong>β reste dans la comparaison.</strong> C'est la condition <M tex="A1 \succ A2" /> du
            slide : <M tex="u(c+100)-u(c) > \beta\delta\,[u(c+110)-u(c)]" />, qui devient ici{" "}
            <M tex="100 > 110\,\beta\delta" /> : <Check ok={condA} />.
          </p>
        </div>
      </div>
      <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3 text-[14px] leading-relaxed dark:border-amber-900 dark:bg-amber-950/30">
        Préférer A1 <strong>et</strong> B2 demande les deux conditions à la fois :{" "}
        <M tex="110\,\beta\delta < 100 < 110\,\delta" />. Avec tes réglages :{" "}
        <M tex={`${tx(110 * beta * delta)} < 100 < ${tx(110 * delta)}`} /> →{" "}
        {condA && condB ? (
          <strong className="text-emerald-700 dark:text-emerald-400">les deux tiennent : renversement.</strong>
        ) : (
          <strong className="text-rose-700 dark:text-rose-400">pas de renversement avec ces valeurs.</strong>
        )}{" "}
        Avec β = 1, il faudrait <M tex="110\,\delta < 100 < 110\,\delta" /> : c'est impossible. Le modèle
        rationnel ne renverse donc jamais son choix ; le modèle (β, δ) le peut dès que β &lt; 1.
      </div>

      <details className="group mt-2.5 rounded-xl border bg-card">
        <summary className="cursor-pointer list-none px-3.5 py-2.5 text-[14px] font-semibold text-primary [&::-webkit-details-marker]:hidden">
          <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
          D'où viennent les deux conditions du slide 24 ? (le calcul complet)
        </summary>
        <div className="border-t px-3.5 pb-3 pt-2 text-[14px] leading-relaxed">
          <p>
            On reprend le tableau du slide 21 : <M tex="c" /> chaque période, plus la récompense à sa
            date (A1 en <M tex="t=0" />, A2 en <M tex="t=1" />, B1 en <M tex="t=2" />, B2 en{" "}
            <M tex="t=3" />
            ). Version A :
          </p>
          <MB tex="U_0^{\beta}(A1) = u(c+100) + \beta\delta\,u(c) + \beta\delta^2 u(c) + \beta\delta^3 u(c)" />
          <MB tex="U_0^{\beta}(A2) = u(c) + \beta\delta\,u(c+110) + \beta\delta^2 u(c) + \beta\delta^3 u(c)" />
          <p>
            Les deux derniers termes sont identiques des deux côtés : ils s'annulent. Il reste{" "}
            <M tex="u(c+100) + \beta\delta\,u(c) > u(c) + \beta\delta\,u(c+110)" />, c'est-à-dire :
          </p>
          <MB tex="U_0^{\beta}(A1) > U_0^{\beta}(A2) \iff u(c+100)-u(c) > \beta\delta\,[u(c+110)-u(c)]" />
          <p>Version B :</p>
          <MB tex="U_0^{\beta}(B1) = u(c) + \beta\delta\,u(c) + \beta\delta^2 u(c+100) + \beta\delta^3 u(c)" />
          <MB tex="U_0^{\beta}(B2) = u(c) + \beta\delta\,u(c) + \beta\delta^2 u(c) + \beta\delta^3 u(c+110)" />
          <p>
            Les deux premiers termes s'annulent. Il reste{" "}
            <M tex="\beta\delta^2 u(c) + \beta\delta^3 u(c+110) > \beta\delta^2 u(c+100) + \beta\delta^3 u(c)" />
            . On divise tout par <M tex="\beta\delta^2 > 0" /> : le β s'en va.
          </p>
          <MB tex="U_0^{\beta}(B1) < U_0^{\beta}(B2) \iff u(c+100)-u(c) < \delta\,[u(c+110)-u(c)]" />
          <p>
            Pourquoi le β disparaît-il seulement en version B ? Parce que ses deux récompenses sont
            futures : elles portent <em>toutes les deux</em> un β, qui se simplifie. En version A, la
            récompense de <M tex="t=0" /> n'en porte pas. Avec <M tex="u(x) = x" />, on a{" "}
            <M tex="u(c+100)-u(c) = 100" /> et <M tex="u(c+110)-u(c) = 110" /> : on retrouve les
            conditions affichées plus haut. (Dans le tableau du slide, l'attente d'un an est résumée par{" "}
            <M tex="t=2" /> ; dans l'animation, une période = une semaine et on divise par{" "}
            <M tex="\beta\delta^{D}" /> au lieu de <M tex="\beta\delta^{2}" /> : même raisonnement.)
          </p>
        </div>
      </details>
    </InteractiveCard>
  );
}
