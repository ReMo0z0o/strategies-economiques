/*
 * EndowmentBars — effet de dotation (A1, approche comportementale,
 * slides S2 p. 9-13). Figure statique, deux panneaux à l'échelle :
 *  ① ticket de la finale : part qui valorise le ticket à plus de 200 €,
 *     A « doit l'acheter » 35 % (= 100 − 65 % qui n'achètent pas, slide 9)
 *     contre B « l'a déjà » 50 % ; prédiction rationnelle : barres égales ;
 *  ② antidote, même risque de 1/1000 : DAP 127 018 € contre DAA 437 857 €
 *     (slide 12), soit × 3,45.
 * Toutes les valeurs sont celles des slides (aucun chiffre inventé).
 */
import { C, Frame, Label, PlotSvg, makePlot, type Plot } from "@/chapters/shared/plot";

const NBSP = "\u00a0";
const COLOR_A = C.blue;
const COLOR_B = C.teal;
const BAR_A: [number, number] = [0.35, 0.85];
const BAR_B: [number, number] = [2.15, 2.65];

/** 127018 → « 127 018 » (espace fine insécable) */
function group(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
}

function Bar({ p, x, v, color }: { p: Plot; x: [number, number]; v: number; color: string }) {
  return (
    <rect
      x={p.X(x[0])}
      y={p.Y(v)}
      width={p.X(x[1]) - p.X(x[0])}
      height={p.Y(0) - p.Y(v)}
      rx={3}
      fill={color}
    />
  );
}

/** libellé de catégorie sous une barre (une ou deux lignes) */
function Cat({ p, x, lines, color }: { p: Plot; x: number; lines: string[]; color: string }) {
  return (
    <text
      x={p.X(x)}
      y={p.Y(0) + 20}
      textAnchor="middle"
      fontSize={12.5}
      fontWeight={700}
      fill={color}
    >
      {lines.map((l, i) => (
        <tspan key={i} x={p.X(x)} dy={i === 0 ? 0 : 15}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

/** accolade verticale entre y = a et y = b, à l'abscisse x (pointe vers la droite) */
function Brace({ p, x, a, b, color }: { p: Plot; x: number; a: number; b: number; color: string }) {
  const X = p.X(x);
  const y1 = p.Y(b);
  const y2 = p.Y(a);
  const ym = (y1 + y2) / 2;
  const w = 7;
  const d = `M${X} ${y1} q${w} 0 ${w} ${w} V${ym - w} q0 ${w} ${w} ${w} q-${w} 0 -${w} ${w} V${y2 - w} q0 ${w} -${w} ${w}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={2} />;
}

function TicketPanel() {
  const p = makePlot({ w: 340, h: 290, pL: 44, pR: 10, pT: 30, pB: 50, x: [0, 3], y: [0, 60] });
  const cA = (BAR_A[0] + BAR_A[1]) / 2;
  const cB = (BAR_B[0] + BAR_B[1]) / 2;
  return (
    <PlotSvg
      p={p}
      maxW={400}
      label="Ticket de la finale&nbsp;: 35&nbsp;% des étudiants de la version A achètent le ticket, 50&nbsp;% de ceux de la version B le gardent. La théorie rationnelle prédit deux barres égales&nbsp;; l'écart de 15 points est l'effet de dotation."
    >
      <Frame p={p} yticks={[0, 20, 40, 60]} yfmt={(t) => `${t}${NBSP}%`} />
      {/* «&nbsp;barre fantôme&nbsp;» hachurée : ce qui manque à A pour égaler B */}
      <defs>
        <pattern
          id="endow-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill={C.red} opacity={0.08} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={C.red} strokeWidth={2.2} opacity={0.45} />
        </pattern>
      </defs>
      <rect
        x={p.X(BAR_A[0])}
        y={p.Y(50)}
        width={p.X(BAR_A[1]) - p.X(BAR_A[0])}
        height={p.Y(35) - p.Y(50)}
        fill="url(#endow-hatch)"
        stroke={C.red}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <Bar p={p} x={BAR_A} v={35} color={COLOR_A} />
      <Bar p={p} x={BAR_B} v={50} color={COLOR_B} />
      {/* valeurs dans les barres */}
      <text
        x={p.X(cA)}
        y={p.Y(35) + 20}
        textAnchor="middle"
        fontSize={15}
        fontWeight={800}
        fill="#fff"
      >
        35{NBSP}%
      </text>
      <text
        x={p.X(cB)}
        y={p.Y(50) + 20}
        textAnchor="middle"
        fontSize={15}
        fontWeight={800}
        fill="#fff"
      >
        50{NBSP}%
      </text>
      {/* prédiction rationnelle : même hauteur */}
      <line
        x1={p.X(BAR_A[0]) - 4}
        y1={p.Y(50)}
        x2={p.X(BAR_B[1]) + 4}
        y2={p.Y(50)}
        stroke={C.ink}
        strokeWidth={1.6}
        strokeDasharray="6 4"
      />
      <Label p={p} x={1.5} y={50} anchor="middle" dx={0} dy={-8} size={12.5}>
        prédiction rationnelle&nbsp;: égales
      </Label>
      {/* accolade de l'écart */}
      <Brace p={p} x={BAR_A[1] + 0.06} a={35} b={50} color={C.red} />
      <Label p={p} x={BAR_A[1] + 0.2} y={42.5} dy={-10} color={C.red} size={13} weight={800}>
        +15 points
      </Label>
      <Label p={p} x={BAR_A[1] + 0.2} y={42.5} dy={5} color={C.red} size={12.5}>
        = effet de
      </Label>
      <Label p={p} x={BAR_A[1] + 0.2} y={42.5} dy={20} color={C.red} size={12.5}>
        dotation
      </Label>
      <Cat p={p} x={cA} lines={["A · doit l'acheter"]} color={COLOR_A} />
      <Cat p={p} x={cB} lines={["B · l'a déjà"]} color={COLOR_B} />
    </PlotSvg>
  );
}

function AntidotePanel() {
  const DAP = 127018;
  const DAA = 437857;
  const p = makePlot({ w: 340, h: 290, pL: 66, pR: 10, pT: 30, pB: 50, x: [0, 3], y: [0, 500000] });
  const cA = (BAR_A[0] + BAR_A[1]) / 2;
  const cB = (BAR_B[0] + BAR_B[1]) / 2;
  const xm = 1.5;
  return (
    <PlotSvg
      p={p}
      maxW={400}
      label="Antidote, même risque de 1 sur 1000&nbsp;: disposition à payer moyenne 127 018 euros, disposition à accepter moyenne 437 857 euros, soit 3,45 fois plus."
    >
      <Frame
        p={p}
        yticks={[0, 100000, 200000, 300000, 400000, 500000]}
        yfmt={(t) => (t === 0 ? "0" : group(t))}
        ylabel="en €"
      />
      <Bar p={p} x={BAR_A} v={DAP} color={COLOR_A} />
      <Bar p={p} x={BAR_B} v={DAA} color={COLOR_B} />
      <Label
        p={p}
        x={cA}
        y={DAP}
        anchor="middle"
        dx={0}
        dy={-8}
        size={13}
        weight={800}
        color={COLOR_A}
      >
        {group(DAP)}
        {NBSP}€
      </Label>
      <Label
        p={p}
        x={cB}
        y={DAA}
        anchor="middle"
        dx={0}
        dy={-8}
        size={13}
        weight={800}
        color={COLOR_B}
      >
        {group(DAA)}
        {NBSP}€
      </Label>
      {/* niveau de la DAP prolongé, puis flèche jusqu'à la DAA */}
      <line
        x1={p.X(BAR_A[1])}
        y1={p.Y(DAP)}
        x2={p.X(BAR_B[0])}
        y2={p.Y(DAP)}
        stroke={C.soft}
        strokeWidth={1.3}
        strokeDasharray="5 4"
      />
      <line
        x1={p.X(BAR_A[1])}
        y1={p.Y(DAA)}
        x2={p.X(BAR_B[0])}
        y2={p.Y(DAA)}
        stroke={C.soft}
        strokeWidth={1.3}
        strokeDasharray="5 4"
      />
      <line
        x1={p.X(xm)}
        y1={p.Y(DAP) - 2}
        x2={p.X(xm)}
        y2={p.Y(DAA) + 9}
        stroke={C.red}
        strokeWidth={2.2}
      />
      <polygon
        points={`${p.X(xm)},${p.Y(DAA) + 1} ${p.X(xm) - 5},${p.Y(DAA) + 10} ${p.X(xm) + 5},${p.Y(DAA) + 10}`}
        fill={C.red}
      />
      <Label
        p={p}
        x={xm}
        y={(DAP + DAA) / 2}
        anchor="middle"
        dx={0}
        dy={5}
        color={C.red}
        size={16}
        weight={800}
      >
        × 3,45
      </Label>
      <Cat p={p} x={cA} lines={["A · DAP", "réduire le risque"]} color={COLOR_A} />
      <Cat p={p} x={cB} lines={["B · DAA", "accepter le risque"]} color={COLOR_B} />
    </PlotSvg>
  );
}

export function EndowmentBars() {
  return (
    <figure className="my-6">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="text-[15px] font-bold leading-snug">
          L'effet de dotation en deux expériences&nbsp;: on demande plus pour céder un bien qu'on ne
          paierait pour l'obtenir
        </div>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          <strong className="text-foreground">DAP</strong> = disposition à payer (le maximum que tu
          paierais pour <em>obtenir</em> un bien). <strong className="text-foreground">DAA</strong>{" "}
          = disposition à accepter (le minimum que tu exigerais pour <em>céder</em> un bien que tu
          as).
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="min-w-0">
            <div className="mb-1 text-[14px] font-bold">
              ① Part qui valorise le ticket à plus de 200&nbsp;€
            </div>
            <TicketPanel />
            <ul className="mt-2 space-y-1 text-[13px] leading-snug text-muted-foreground">
              <li>
                <strong style={{ color: COLOR_A }}>A · doit l'acheter</strong> (on reçoit
                200&nbsp;€)&nbsp;: 35&nbsp;% l'achètent (= 100&nbsp;% − 65&nbsp;% qui n'achètent pas,
                chiffre du slide 9). Pour eux, DAP &gt; 200&nbsp;€.
              </li>
              <li>
                <strong style={{ color: COLOR_B }}>B · l'a déjà</strong> (ticket reçu
                gratuitement)&nbsp;: 50&nbsp;% le gardent. Pour eux, DAA &gt; 200&nbsp;€.
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <div className="mb-1 text-[14px] font-bold">② Antidote&nbsp;: même risque de 1/1000</div>
            <AntidotePanel />
            <ul className="mt-2 space-y-1 text-[13px] leading-snug text-muted-foreground">
              <li>
                <strong style={{ color: COLOR_A }}>A · réduire le risque</strong>&nbsp;: prix moyen
                annoncé pour l'antidote = 127&nbsp;018&nbsp;€ (DAP).
              </li>
              <li>
                <strong style={{ color: COLOR_B }}>B · accepter le risque</strong>&nbsp;: somme moyenne
                demandée pour entrer dans la pièce = 437&nbsp;857&nbsp;€ (DAA), soit 3,45 fois plus.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 px-1 text-sm leading-relaxed text-muted-foreground">
        Acheter des probabilités de vivre (l'antidote) → on révèle sa <strong>DAP</strong> ; en
        vendre (accepter le risque) → on révèle sa <strong>DAA</strong>. Théorie rationnelle :{" "}
        <strong>DAP = DAA</strong>, donc deux barres égales dans chaque panneau (groupes tirés au
        hasard, donc semblables). Valeurs exactes des slides 9 et 12.
      </figcaption>
    </figure>
  );
}
