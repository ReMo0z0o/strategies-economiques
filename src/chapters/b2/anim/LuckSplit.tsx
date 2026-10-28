/*
 * B2.2 · § 6 — « Qui encaisse la chance ? » (B22-ped-3).
 *
 * Les trois contrats optimaux du cours (slide 20) et une chance x de l'année choisie au
 * curseur. Le cours ne donne que E(x) = 0 : on ne suppose AUCUNE loi de probabilité pour x,
 * on regarde simplement ce que chacun touche pour une valeur de x donnée.
 *   principal : z − w = (1 − β)(e* + x) − α      agent : w − c = α + β(e* + x) − e*²/2
 * Avec x = 0, on retrouve les valeurs espérées Uₚ et Uₐ du tableau du slide 20.
 * Placement prévu : sec-recap, dans (ou juste après) le callout « qui porte le risque ? ».
 */
import { useState } from "react";
import { ChoiceChips, InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { M } from "@/components/course/Math";
import { cn } from "@/lib/utils";

type CaseKey = "1" | "2" | "3";

/* contrats optimaux : Cas 1 α* = 0 ; Cas 2 β* = 1/2 ; Cas 3 α* = −0,5, β* = 1 (slides 11, 13, 18) */
const CASES: Record<CaseKey, { a: number; b: number; share: string }> = {
  "1": { a: 0, b: 0, share: "rien (β = 0)" },
  "2": { a: 0, b: 0.5, share: "la moitié (β = 1/2)" },
  "3": { a: -0.5, b: 1, share: "tout (β = 1)" },
};

/** nombre à la française, au plus 3 décimales, vrai signe moins */
function f3(v: number): string {
  const r = Math.round(v * 1000) / 1000 || 0;
  return r.toLocaleString("fr-FR", { maximumFractionDigits: 3 }).replace(/^[-−]/, "−");
}
/** entre parenthèses si négatif : « 0,5 + (−0,3) » */
const par = (v: number) => (v < 0 ? `(${f3(v)})` : f3(v));

export function LuckSplit() {
  const [cas, setCas] = useState<CaseKey>("2");
  const [x, setX] = useState(0);
  const K = CASES[cas];
  const e = K.b; // e* = β (Cas 1 : β = 0, donc e* = 0)
  const c = (e * e) / 2;
  const z = e + x;
  const w = K.a + K.b * z;
  const P = z - w; // réalisé du principal
  const A = w - c; // réalisé de l'agent
  const EP = (1 - K.b) * e - K.a; // espérance (x = 0) = Uₚ du slide 20
  const EA = K.a + K.b * e - c; // espérance (x = 0) = Uₐ du slide 20

  /* barres horizontales : échelle de −0,6 à 0,6 */
  const W = 400;
  const L = 104;
  const R = 16;
  const X = (v: number) => L + ((Math.max(-0.6, Math.min(0.6, v)) + 0.6) / 1.2) * (W - L - R);
  const rows = [
    { name: "Principal", sub: "z − w", v: P, ev: EP, color: "#be123c", text: "#9f1239", y: 34 },
    { name: "Agent", sub: "w − c", v: A, ev: EA, color: "#0369a1", text: "#075985", y: 96 },
  ];

  return (
    <InteractiveCard
      title="Qui encaisse la chance ?"
      subtitle={
        <>
          Choisis un contrat optimal, puis la chance <M tex="x" /> de l'année. Le cours dit
          seulement que <M tex="E(x) = 0" /> : ici, c'est toi qui fixes <M tex="x" />.
        </>
      }
      controls={
        <>
          <ChoiceChips<CaseKey>
            className="col-span-full"
            label="Contrat optimal (slide 20)"
            options={[
              { value: "1", label: "Cas 1 · w = 0" },
              { value: "2", label: "Cas 2 · w = 0,5 z" },
              { value: "3", label: "Cas 3 · w = −0,5 + z" },
            ]}
            value={cas}
            onChange={setCas}
          />
          <SliderControl
            label={<>x, la chance de l'année</>}
            value={x}
            onChange={setX}
            min={-0.5}
            max={0.5}
            step={0.05}
            format={f3}
          />
          <div className="flex flex-wrap items-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCas("3");
                setX(-0.3);
              }}
              className="rounded-full border bg-card px-3 py-1 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              Cas 3, x = −0,3 (quiz q10)
            </button>
          </div>
        </>
      }
      footer={
        <>
          l'agent encaisse la part β de la chance : rien au Cas 1, la moitié au Cas 2, tout au Cas
          3, où le principal touche 0,5 quoi qu'il arrive (slide 20). Plus le salaire dépend de{" "}
          <M tex="z" />, plus l'agent supporte une grande part du risque (slide 21). Avec{" "}
          <span className="whitespace-nowrap">
            <M tex="x = 0" />,
          </span>{" "}
          tu retrouves les payoffs espérés du tableau du slide 20.
        </>
      }
    >
      <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-[14px] leading-relaxed tabular-nums">
        <div>
          {cas === "1" ? (
            <>
              Effort de l'agent : <M tex="e^* = 0" /> (salaire fixe), donc coût c = 0
            </>
          ) : (
            <>
              Effort de l'agent : <M tex="e^* = \beta" /> = {f3(e)} ; coût c = e*²/2 = {f3(c)}
            </>
          )}
        </div>
        <div>
          Résultat : z = e* + x = {f3(e)} + {par(x)} = <strong>{f3(z)}</strong>
        </div>
        <div>
          Salaire : w = α + βz = {f3(K.a)} + {f3(K.b)} × {par(z)} = <strong>{f3(w)}</strong>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} 150`}
        role="img"
        aria-label={`Payoffs réalisés pour x = ${f3(x)} : principal ${f3(P)}, agent ${f3(A)}`}
        className="mx-auto mt-3 block h-auto w-full"
        style={{ maxWidth: 560 }}
      >
        {/* graduations */}
        {[-0.5, 0, 0.5].map((t) => (
          <g key={t}>
            <line x1={X(t)} y1={18} x2={X(t)} y2={128} stroke="#a1a1aa" strokeDasharray={t === 0 ? undefined : "3 4"} strokeWidth={t === 0 ? 1.6 : 1} />
            <text x={X(t)} y={146} textAnchor="middle" fontSize={13.5} fill="#71717a">
              {f3(t)}
            </text>
          </g>
        ))}
        {rows.map((r) => (
          <g key={r.name}>
            <text x={4} y={r.y + 19} fontSize={15} fontWeight={700} fill={r.text}>
              {r.name}
            </text>
            <text x={4} y={r.y + 37} fontSize={14} fontStyle="italic" fill={r.text}>
              {r.sub}
            </text>
            <rect
              x={Math.min(X(0), X(r.v))}
              y={r.y + 6}
              width={Math.max(Math.abs(X(r.v) - X(0)), 2)}
              height={30}
              rx={4}
              fill={r.color}
              opacity={0.85}
              style={{ transition: "all .25s" }}
            />
            {/* valeur espérée (x = 0) */}
            <line x1={X(r.ev)} y1={r.y + 1} x2={X(r.ev)} y2={r.y + 41} stroke="#d97706" strokeWidth={2.5} strokeDasharray="4 3" />
            <text
              x={r.v >= 0 ? X(r.v) + 6 : X(r.v) - 6}
              y={r.y + 26}
              textAnchor={r.v >= 0 ? "start" : "end"}
              fontSize={15}
              fontWeight={800}
              fill={r.text}
              stroke="#fff"
              strokeWidth={3.5}
              paintOrder="stroke"
            >
              {f3(r.v)}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        <span className="font-semibold text-amber-700">Trait orange pointillé</span> : la valeur
        espérée (avec x = 0), Uₚ = {f3(EP)} et Uₐ = {f3(EA)}, comme dans le tableau du slide 20.
      </p>

      <div
        className={cn(
          "mt-3 rounded-xl border px-4 py-3 text-[14px] leading-relaxed",
          cas === "3" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-border bg-muted/50 text-foreground/85",
        )}
      >
        Par rapport à l'espérance, l'agent reçoit β·x = {f3(K.b * x)} et le principal (1 − β)·x ={" "}
        {f3((1 - K.b) * x)} : l'agent encaisse <strong>{K.share}</strong> de la chance.
        {cas === "3" ? (
          <>
            {" "}
            Le principal touche <strong>0,5 quoi qu'il arrive</strong> (« pas d'incertitude »,
            slide 20) ; l'agent a <M tex="U_a = 0" /> en espérance, mais w − c = x = {f3(A)} cette
            année.
          </>
        ) : null}
      </div>
    </InteractiveCard>
  );
}
