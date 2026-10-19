/*
 * TransactionRuler — utilité de transaction (A1, approche comportementale,
 * slides S2 p. 2-4 : la calculatrice à 15 € ou à 200 €).
 *
 * Chaque règle va de 0 € au prix de référence (le prix qu'on s'attendait à
 * payer). Le segment vert = les 5 € économisés en marchant 20 minutes. En
 * euros, il est toujours le même ; rapporté au prix, il pèse 1/3 (15 €) ou
 * 2,5 % (200 €). Le curseur généralise : gain réel = 5 € quel que soit le prix,
 * « affaire » ressentie = 5 / P qui s'effondre quand P monte.
 */
import { useState } from "react";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { C, Dot, Frame, Label, PlotSvg, curvePath, makePlot } from "@/chapters/shared/plot";

const NBSP = "\u00a0";
const SAVING = 5;

/** « 33 % », « 2,5 % », « 1,7 % » */
function fmtShare(share: number): string {
  const v = share * 100;
  const s =
    v >= 10 ? Math.round(v).toString() : (Math.round(v * 10) / 10).toString().replace(".", ",");
  return s + NBSP + "%";
}

function euros(v: number): string {
  // virgule décimale française (graduation 2,5 € quand le curseur est à 10 €)
  return `${String(v).replace(".", ",")}${NBSP}€`;
}

/** graduations d'une règle 0 → ref, sans chevauchement avec l'étiquette finale */
function rulerTicks(ref: number): number[] {
  const raw = ref / 4;
  const k = Math.pow(10, Math.floor(Math.log10(raw)));
  let step = 10 * k;
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * k >= raw - 1e-9) {
      step = m * k;
      break;
    }
  }
  const ticks: number[] = [];
  for (let t = 0; t < ref - 0.12 * ref; t += step) ticks.push(Math.round(t * 100) / 100);
  ticks.push(ref);
  return ticks;
}

function Ruler({
  title,
  refPrice,
  verdict,
  verdictTone,
}: {
  title: string;
  refPrice: number;
  verdict?: string;
  verdictTone?: "good" | "meh";
}) {
  const paid = refPrice - SAVING;
  const paidPct = (paid / refPrice) * 100;
  const savePct = (SAVING / refPrice) * 100;
  const share = SAVING / refPrice;
  const ticks = rulerTicks(refPrice);
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-[13px] font-bold uppercase tracking-wide text-foreground">
          {title}
        </span>
        <span className="text-[13px] text-muted-foreground">
          référence {euros(refPrice)} · payé {euros(paid)} si tu marches
        </span>
      </div>
      {/* repère «&nbsp;5&nbsp;€&nbsp;» au-dessus du segment vert, aligné à droite */}
      <div
        className="relative mt-1 h-4 text-[12px] font-bold text-emerald-700 dark:text-emerald-400"
        aria-hidden
      >
        <span className="absolute right-0 whitespace-nowrap">5&nbsp;€ économisés ▾</span>
      </div>
      <div
        className="relative flex h-8 overflow-hidden rounded-md ring-1 ring-foreground/15"
        role="img"
        aria-label={`Règle de 0 à ${refPrice} euros : prix payé ${paid} euros, économie de 5 euros soit ${fmtShare(share)} du prix de référence`}
      >
        <div
          className="flex items-center overflow-hidden whitespace-nowrap bg-slate-300 px-2 text-[12px] font-semibold text-slate-800 dark:bg-slate-600 dark:text-slate-100"
          style={{ width: `${paidPct}%` }}
        >
          prix payé : {euros(paid)}
        </div>
        <div className="bg-emerald-500" style={{ width: `${savePct}%`, minWidth: 2 }} />
      </div>
      <div className="relative h-4 text-[11px] tabular-nums text-muted-foreground" aria-hidden>
        {ticks.map((t, i) => (
          <span
            key={t}
            className="absolute top-0.5 whitespace-nowrap"
            style={{
              left: `${(t / refPrice) * 100}%`,
              transform:
                i === 0
                  ? "none"
                  : i === ticks.length - 1
                    ? "translateX(-100%)"
                    : "translateX(-50%)",
            }}
          >
            {euros(t)}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[14px] leading-snug">
        <strong className="text-emerald-700 dark:text-emerald-400">
          5&nbsp;€ = {fmtShare(share)} du prix
        </strong>
        {verdict ? (
          <>
            {" "}
            →{" "}
            <strong
              className={
                verdictTone === "good"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {verdict}
            </strong>
          </>
        ) : null}
      </p>
    </div>
  );
}

export function TransactionRuler() {
  const [P, setP] = useState(60);
  const share = SAVING / P;

  // mini-graphique : « affaire » ressentie 5/P en fonction du prix de référence P
  const p = makePlot({ w: 380, h: 230, pL: 46, pR: 18, pB: 40, pT: 18, x: [0, 300], y: [0, 0.5] });

  return (
    <InteractiveCard
      title="Même gain de 5&nbsp;€ en poche, «&nbsp;affaire&nbsp;» ressentie très différente"
      subtitle="Slides 2-4 · chaque règle va de 0&nbsp;€ au prix de référence (le prix que tu t'attendais à payer)&nbsp;; le segment vert = les 5&nbsp;€ économisés en marchant 20 minutes."
      controls={
        <SliderControl
          className="sm:col-span-2 lg:col-span-3"
          label="Ta version&nbsp;: prix de référence de la calculatrice"
          value={P}
          onChange={setP}
          min={10}
          max={300}
          step={5}
          format={(v) => euros(v)}
        />
      }
      footer={
        <>
          bouge le curseur. Le segment vert vaut <strong>toujours 5&nbsp;€</strong>, mais il occupe
          une part de plus en plus petite de la règle. Un Econo ne compare que deux choses&nbsp;:
          5&nbsp;€ contre 20 minutes de marche. Sa réponse ne dépend donc pas du prix de la
          calculatrice.
        </>
      }
    >
      <div className="space-y-5">
        <Ruler
          title="Version A du slide"
          refPrice={15}
          verdict="grosse affaire&nbsp;!"
          verdictTone="good"
        />
        <Ruler title="Version B du slide" refPrice={200} verdict="bof" verdictTone="meh" />
        <div className="rounded-xl border-2 border-dashed border-primary/30 p-3">
          <Ruler title="Ta version (curseur)" refPrice={P} />
        </div>
      </div>

      {/* les deux compteurs : gain réel vs affaire ressentie */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-muted/40 px-4 py-3">
          <div className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
            Gain réel en poche
          </div>
          <div className="text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">
            5&nbsp;€
          </div>
          <div className="text-[13px] leading-snug text-muted-foreground">
            toujours 5&nbsp;€ — et toujours 20 minutes de marche, quel que soit le prix
          </div>
        </div>
        <div className="rounded-xl border bg-muted/40 px-4 py-3">
          <div className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
            «&nbsp;Affaire&nbsp;» ressentie = 5&nbsp;€ ÷ prix
          </div>
          <div className="text-3xl font-extrabold tabular-nums text-primary">{fmtShare(share)}</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className="h-full rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
          </div>
          <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
            s'effondre quand le prix de référence monte
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 text-center text-[13px] font-semibold text-muted-foreground">
          «&nbsp;Affaire&nbsp;» ressentie (5&nbsp;€ ÷ prix de référence) selon le prix de référence
        </div>
        <PlotSvg
          p={p}
          maxW={460}
          label={`Courbe 5 divisé par P : 33\u00a0% pour 15\u00a0€, 2,5\u00a0% pour 200\u00a0€, ${fmtShare(share)} pour ${P} €`}
        >
          <Frame
            p={p}
            xticks={[0, 100, 200, 300]}
            yticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
            yfmt={(t) => `${Math.round(t * 100)} %`}
            xfmt={(t) => `${t} €`}
          />
          <path
            d={curvePath(p, (x) => SAVING / x, 10, 300, 240)}
            fill="none"
            stroke={C.blue}
            strokeWidth={2.5}
          />
          <Dot p={p} x={15} y={SAVING / 15} fill={C.green} />
          <Label p={p} x={15} y={SAVING / 15} dx={9} dy={4} size={13} color={C.green}>
            A : 15&nbsp;€ → 33&nbsp;%
          </Label>
          <Dot p={p} x={200} y={SAVING / 200} fill={C.soft} />
          <Label
            p={p}
            x={200}
            y={SAVING / 200}
            anchor="middle"
            dx={0}
            dy={-12}
            size={13}
            color={C.soft}
          >
            B : 200&nbsp;€ → 2,5&nbsp;%
          </Label>
          <Dot p={p} x={P} y={share} fill={C.blue} r={6} />
        </PlotSvg>
      </div>

      <div className="mt-4 rounded-xl border bg-accent/40 px-4 py-3 text-[14px] leading-relaxed">
        <div className="text-center text-[15px] font-bold">
          Utilité de transaction = prix de référence − prix payé
        </div>
        <p className="mt-2">
          Ici, 15 − 10 = 5&nbsp;€ (A) et 200 − 195 = 5&nbsp;€ (B)&nbsp;:{" "}
          <strong>en euros, l'écart est le même</strong>. Mais le plaisir de «&nbsp;faire une
          affaire&nbsp;» se juge <strong>par rapport au prix de référence</strong>&nbsp;: 5&nbsp;€ sur
          15&nbsp;€, c'est un tiers du prix&nbsp;; sur 200&nbsp;€, presque rien. La théorie
          rationnelle, elle, dit d'ignorer ce prix de référence.
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Légende&nbsp;: même gain de 5&nbsp;€ en poche&nbsp;; le «&nbsp;bon plan&nbsp;» ressenti
          dépend du prix de référence.
        </p>
      </div>
    </InteractiveCard>
  );
}
