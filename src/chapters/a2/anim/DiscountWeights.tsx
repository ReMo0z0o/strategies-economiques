/*
 * DiscountWeights — A2 · problèmes de self-contrôle, slide 23.
 *
 * Hauteur de chaque barre = poids devant u(c_t) dans l'utilité, t = 0…8.
 *  - gris    : modèle rationnel, poids δ^k (k = distance au présent) ;
 *  - couleur : modèle (β, δ), poids 1 pour le présent puis βδ^k.
 * Bascule « vu depuis t = 0 / vu depuis t = 1 » : depuis t = 1, c'est t = 1
 * qui devient « aujourd'hui » (poids 1), t = 2 pèse βδ, t = 3 βδ²… et t = 0
 * est passé. La grande marche (× βδ) suit donc le présent.
 * À β = 1, les deux séries coïncident (fin du slide 23).
 */
import { useState, type ReactNode } from "react";
import { InteractiveCard, SliderControl, ChoiceChips } from "@/components/course/Interactive";
import { M, MB } from "@/components/course/Math";
import { C, Frame, PlotSvg, fmt, makePlot } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const T_MAX = 8;
const HALO = "var(--color-card)";
const GREY = C.guide;
const BLUE = C.blue;

type View = "t0" | "t1";

/** texte SVG avec halo (lisible par-dessus les barres, en clair comme en sombre) */
function Txt({
  x,
  y,
  children,
  color = C.ink,
  anchor = "middle",
  size = 12,
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

function Stat({
  title,
  value,
  sub,
  tone = "default",
}: {
  title: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "blue";
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border px-3.5 py-2.5",
        tone === "blue" ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30" : "bg-card",
      )}
    >
      <div className="text-[13px] font-semibold text-muted-foreground">{title}</div>
      <div className="mt-0.5 text-[15px] font-bold tabular-nums text-foreground">{value}</div>
      {sub ? <div className="mt-0.5 text-[13px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

export function DiscountWeights() {
  const [beta, setBeta] = useState(0.5);
  const [delta, setDelta] = useState(0.9);
  const [view, setView] = useState<View>("t0");
  const now = view === "t0" ? 0 : 1;

  const p = makePlot({ x: [-0.5, T_MAX + 0.5], y: [0, 1.2], w: 440, h: 290, pL: 40, pR: 8, pT: 16, pB: 54 });
  const base = p.Y(0);
  const bars = Array.from({ length: T_MAX + 1 }, (_, t) => {
    const k = t - now; // distance au présent
    if (k < 0) return { t, k, past: true, rat: 0, bd: 0 };
    return { t, k, past: false, rat: delta ** k, bd: k === 0 ? 1 : beta * delta ** k };
  });
  const bd = beta * delta;
  const isRational = beta >= 0.999;

  const barRect = (t: number, v: number, side: "L" | "R", fill: string, opacity = 1) => {
    const a = side === "L" ? t - 0.37 : t + 0.03;
    const b = side === "L" ? t - 0.03 : t + 0.37;
    const y = p.Y(v);
    return (
      <rect
        x={p.X(a)}
        y={y}
        width={p.X(b) - p.X(a)}
        height={Math.max(0, base - y)}
        rx={2}
        fill={fill}
        opacity={opacity}
        style={{ transition: "y 250ms ease, height 250ms ease" }}
      />
    );
  };

  return (
    <InteractiveCard
      title="Les poids du futur : rationnel contre modèle (β, δ)"
      subtitle={
        <>
          Chaque barre donne le poids que reçoit l'utilité <M tex="u(c_t)" /> de la période{" "}
          <M tex="t" /> (slide 23). Vu depuis <M tex="t=0" /> : gris = modèle rationnel (
          <M tex="\delta^t" />) ; couleur = modèle (β, δ) (<M tex="1" /> en <M tex="t=0" />, puis{" "}
          <M tex="\beta\delta^t" />).
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
            min={0}
            max={1}
            step={0.05}
            format={(v) => fmt(v, 2)}
          />
          <SliderControl
            label={
              <>
                Facteur d'escompte <M tex="\delta" />
              </>
            }
            value={delta}
            onChange={setDelta}
            min={0.5}
            max={1}
            step={0.05}
            format={(v) => fmt(v, 2)}
          />
          <ChoiceChips<View>
            label="D'où regarde-t-on ?"
            value={view}
            onChange={setView}
            options={[
              { value: "t0", label: "vu depuis t = 0" },
              { value: "t1", label: "vu depuis t = 1" },
            ]}
          />
        </>
      }
      footer={
        <>
          dans la série colorée, il n'y a qu'<strong>une seule grande marche</strong>, juste après
          aujourd'hui (× βδ) ; ensuite chaque pas vaut × δ, exactement comme dans la série grise.
          Bascule sur « vu depuis t = 1 » : la grande marche <strong>se déplace avec le présent</strong>.
          Mets β = 1 : les deux séries coïncident, on retrouve le modèle rationnel.
        </>
      }
    >
      <div className="mb-1 text-center text-[13px] text-muted-foreground">
        {view === "t0" ? "Vu depuis t = 0, l'individu maximise :" : "Arrivé en t = 1, il maximise :"}
      </div>
      {view === "t0" ? (
        <MB tex="U_0^{\beta} = u(c_0) + \beta\delta\, u(c_1) + \beta\delta^2 u(c_2) + \beta\delta^3 u(c_3) + \cdots" />
      ) : (
        <MB tex="U_1^{\beta} = u(c_1) + \beta\delta\, u(c_2) + \beta\delta^2 u(c_3) + \beta\delta^3 u(c_4) + \cdots" />
      )}

      <PlotSvg
        p={p}
        maxW={560}
        label={`Poids des périodes 0 à 8, vu depuis t = ${now} : barres grises du modèle rationnel et barres colorées du modèle bêta-delta avec bêta = ${fmt(beta, 2)} et delta = ${fmt(delta, 2)}`}
      >
        {/* colonne du présent */}
        <rect
          x={p.X(now - 0.5)}
          y={p.pT}
          width={p.X(now + 0.5) - p.X(now - 0.5)}
          height={base - p.pT}
          fill={BLUE}
          opacity={0.07}
          style={{ transition: "x 300ms ease" }}
        />
        <Frame
          p={p}
          xticks={bars.map((b) => b.t)}
          yticks={[0, 0.25, 0.5, 0.75, 1]}
          xfmt={(t) => `t = ${t}`}
          ylabel="poids"
        />
        {bars.map((b) =>
          b.past ? (
            <g key={b.t}>
              <Txt x={p.X(b.t)} y={p.Y(0.4)} color={C.soft} weight={500} italic>
                passé
              </Txt>
            </g>
          ) : (
            <g key={b.t}>
              {barRect(b.t, b.rat, "L", GREY, 0.75)}
              {barRect(b.t, b.bd, "R", BLUE)}
              <Txt x={p.X(b.t + 0.2)} y={p.Y(b.bd) - 5} color={BLUE}>
                {b.bd < 0.005 ? "0" : fmt(b.bd, 2)}
              </Txt>
            </g>
          ),
        )}
        {/* multiplicateurs de la série colorée, entre deux barres voisines */}
        {bars
          .filter((b) => b.k >= 1)
          .map((b) => (
            <Txt
              key={`m${b.t}`}
              x={p.X(b.t - 0.5)}
              y={p.Y(1.12) + 4}
              color={b.k === 1 ? C.red : BLUE}
              weight={b.k === 1 ? 700 : 500}
            >
              ×{fmt(b.k === 1 ? bd : delta, 2)}
            </Txt>
          ))}
        <Txt x={p.X(now)} y={base + 36} color={BLUE} weight={700}>
          aujourd'hui
        </Txt>
        <Txt x={p.w - p.pR} y={base + 36} anchor="end" color={C.soft} weight={500}>
          période t
        </Txt>
      </PlotSvg>

      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: GREY, opacity: 0.75 }} />
          rationnel : <M tex="\delta^k" />
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: BLUE }} />
          modèle (β, δ) : <M tex="1" /> puis <M tex="\beta\delta^k" />
        </span>
        <span>
          <M tex="k" /> = nombre de périodes après aujourd'hui · « × » = ce par quoi on multiplie pour
          passer d'une barre colorée à la suivante
        </span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <Stat
          title="Poids de demain, vu d'aujourd'hui"
          value={
            <>
              <M tex="\beta\delta" /> = {fmt(bd, 3)}
            </>
          }
          sub={
            <>
              rationnel : <M tex="\delta" /> = {fmt(delta, 2)}
            </>
          }
        />
        <Stat
          title="Poids d'après-demain ÷ poids de demain"
          value={
            <>
              <M tex="\beta\delta^2 \div \beta\delta = \delta" /> = {fmt(delta, 2)}
            </>
          }
          sub="comme le rationnel : entre deux dates futures, seul δ compte"
        />
      </div>

      <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3 text-[14px] leading-relaxed dark:border-amber-900 dark:bg-amber-950/30">
        <div className="font-bold text-amber-800 dark:text-amber-300">
          Les mêmes dates, deux regards : poids de t = 2 ÷ poids de t = 1
        </div>
        <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
          <div className={cn("rounded-lg px-2.5 py-1.5", view === "t0" && "bg-card font-semibold shadow-sm")}>
            vu depuis t = 0 : <M tex="\beta\delta^2 \div \beta\delta = \delta" /> ={" "}
            <span className="tabular-nums">{fmt(delta, 2)}</span>
          </div>
          <div className={cn("rounded-lg px-2.5 py-1.5", view === "t1" && "bg-card font-semibold shadow-sm")}>
            vu depuis t = 1 : <M tex="\beta\delta \div 1 = \beta\delta" /> ={" "}
            <span className="tabular-nums">{fmt(bd, 3)}</span>
          </div>
        </div>
        <p className="mt-2 text-foreground/85">
          {isRational ? (
            <>
              Avec β = 1, les deux regards donnent δ : l'individu ne change jamais d'avis. C'est le
              modèle rationnel, qui respecte la stationnarité.
            </>
          ) : (
            <>
              Vu depuis t = 0, attendre de t = 1 à t = 2 ne coûte qu'un facteur δ : il prévoit d'être
              patient. Arrivé en t = 1, t = 1 est devenu « aujourd'hui » et la même attente coûte βδ,
              bien plus : il veut consommer tout de suite. Ce <strong>changement d'avis</strong> est
              exactement le problème de self-contrôle.
            </>
          )}
        </p>
      </div>
    </InteractiveCard>
  );
}
