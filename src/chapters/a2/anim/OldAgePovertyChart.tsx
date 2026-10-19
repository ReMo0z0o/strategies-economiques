/**
 * A2 · slide 3 — « Ces systèmes génèrent plus de pensionnés précarisés ».
 * Pauvreté des 65 ans et plus vs toute la population (définition OCDE),
 * 17 pays dans l'ordre du slide. Valeurs approximatives lues sur le slide
 * (mesure au pixel du PNG). Barres horizontales : lisible sur téléphone.
 */

type Frame = "vert" | "bleu" | "rouge" | null;

/** [pays, pauvreté 65+ (%), pauvreté toute la population (%), cadre sur le slide] */
const DATA: Array<[string, number, number, Frame]> = [
  ["Danemark", 3.2, 5.4, "vert"],
  ["France", 3.6, 8.2, "vert"],
  ["Pays-Bas", 3.7, 7.8, "vert"],
  ["Espagne", 5.4, 15.3, "bleu"],
  ["Pologne", 7.5, 10.4, null],
  ["Belgique", 7.7, 9.0, null],
  ["Grèce", 8.2, 14.8, "bleu"],
  ["Autriche", 8.8, 9.0, null],
  ["Italie", 9.3, 13.7, "bleu"],
  ["Allemagne", 9.5, 9.5, null],
  ["Portugal", 9.7, 13.5, "bleu"],
  ["Suède", 10.0, 9.0, null],
  ["Royaume-Uni", 13.7, 10.9, "rouge"],
  ["Japon", 18.9, 16.1, "rouge"],
  ["Suisse", 17.6, 9.8, "rouge"],
  ["États-Unis", 20.8, 16.8, "rouge"],
  ["Australie", 26.0, 14.4, "rouge"],
];

const OLD = "#4f7cc0"; // 65 ans et + (bleu des barres du slide)
const ALL = "#c0504d"; // toute la population (rouge des barres du slide)
const FRAME: Record<Exclude<Frame, null>, string> = {
  vert: "#16a34a",
  bleu: "#2563eb",
  rouge: "#dc2626",
};

const fr1 = (v: number) => v.toFixed(1).replace(".", ",");

export function OldAgePovertyChart() {
  const W = 520;
  const top = 32; // place pour l'échelle
  const rowH = 29;
  const x0 = 108; // début des barres
  const pxPerPt = 12.9; // 28 % ≈ 361 px
  const H = top + DATA.length * rowH + 8;
  const X = (v: number) => x0 + v * pxPerPt;
  const ink = "var(--color-foreground)";
  const muted = "var(--color-muted-foreground)";

  // cadres contigus (vert : lignes 0-2 ; rouge : lignes 12-16) ; bleu : un cadre par pays
  const rowY = (i: number) => top + i * rowH;
  const groupFrame = (from: number, to: number, color: string) => (
    <rect
      x={4}
      y={rowY(from) + 1}
      width={W - 8}
      height={(to - from + 1) * rowH - 2}
      rx={9}
      fill={color}
      fillOpacity={0.05}
      stroke={color}
      strokeWidth={2}
    />
  );

  return (
    <figure className="my-6">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-1 text-center text-[15px] font-bold text-foreground">
          Ces systèmes génèrent plus de pensionnés précarisés
        </div>
        <div className="mb-2 text-center text-[13px] text-muted-foreground">
          Taux de pauvreté (définition OCDE), en % — valeurs approximatives lues sur le slide
        </div>
        <div className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] text-foreground/85">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: OLD }} />
            65 ans et plus
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: ALL }} />
            toute la population
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mx-auto block h-auto w-full max-w-[560px]"
          role="img"
          aria-label="Taux de pauvreté des 65 ans et plus comparé à celui de toute la population, dans 17 pays de l'OCDE. Les âgés sont plus pauvres que la moyenne au Royaume-Uni, au Japon, en Suisse, aux États-Unis et en Australie."
        >
          {/* cadres colorés du slide */}
          {groupFrame(0, 2, FRAME.vert)}
          {groupFrame(12, 16, FRAME.rouge)}
          {DATA.map(([name, , , f], i) =>
            f === "bleu" ? (
              <rect
                key={`b-${name}`}
                x={4}
                y={rowY(i) + 1}
                width={W - 8}
                height={rowH - 2}
                rx={9}
                fill={FRAME.bleu}
                fillOpacity={0.05}
                stroke={FRAME.bleu}
                strokeWidth={2}
              />
            ) : null,
          )}
          {/* échelle */}
          {[0, 5, 10, 15, 20, 25].map((t) => (
            <g key={t}>
              <line
                x1={X(t)}
                y1={top - 6}
                x2={X(t)}
                y2={H - 6}
                stroke="var(--color-border)"
                strokeWidth={1}
                strokeDasharray={t === 0 ? undefined : "3 3"}
              />
              <text x={X(t)} y={top - 12} fontSize={12} fill={muted} textAnchor="middle">
                {t === 25 ? "25 %" : t}
              </text>
            </g>
          ))}
          {/* barres */}
          {DATA.map(([name, old, all], i) => {
            const y = rowY(i);
            return (
              <g key={name}>
                <text x={x0 - 8} y={y + 18} fontSize={12.5} fontWeight={600} fill={ink} textAnchor="end">
                  {name}
                </text>
                <rect x={x0} y={y + 4} width={old * pxPerPt} height={9} rx={2} fill={OLD} />
                <rect x={x0} y={y + 15} width={all * pxPerPt} height={9} rx={2} fill={ALL} />
                <text x={X(old) + 4} y={y + 12.5} fontSize={12} fontWeight={600} fill={OLD}>
                  {fr1(old)}
                </text>
                <text x={X(all) + 4} y={y + 23.5} fontSize={12} fontWeight={600} fill={ALL}>
                  {fr1(all)}
                </text>
                {name === "Pologne" ? (
                  <text x={X(all) + 42} y={y + 18} fontSize={12} fontStyle="italic" fill={muted}>
                    ◄ remplacement 39 % : voir la note
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 space-y-1.5 px-1 text-sm leading-relaxed text-muted-foreground">
        <span className="block">
          <strong>Comment lire.</strong> Pour chaque pays, la barre bleue donne la part des 65 ans et
          plus qui sont pauvres, la barre rouge la même part dans toute la population (définition
          OCDE : revenu inférieur à la moitié du revenu médian du pays). Bleu plus long que rouge ⇒
          les personnes âgées sont <em>plus</em> pauvres que la moyenne.
        </span>
        <span className="block">
          <strong>Les cadres.</strong> Sur le slide, les cadres colorés n'ont pas de légende : nous
          les lisons comme suit.{" "}
          <span style={{ color: FRAME.rouge }} className="font-semibold">
            Rouge
          </span>{" "}
          : Royaume-Uni, Japon, Suisse, États-Unis, Australie — des 65 ans et plus plus pauvres que
          le reste de la population, et un taux de remplacement inférieur à 50&nbsp;% sur le slide 2 (des
          pensions qui reposent en partie sur l'épargne volontaire).{" "}
          <span style={{ color: FRAME.vert }} className="font-semibold">
            Vert
          </span>{" "}
          : Danemark, France, Pays-Bas — très peu de pauvreté chez les âgés (moins de 4&nbsp;%), et un
          taux de remplacement supérieur à 67&nbsp;%.{" "}
          <span style={{ color: FRAME.bleu }} className="font-semibold">
            Bleu
          </span>{" "}
          : Espagne, Grèce, Italie, Portugal — une pauvreté élevée dans toute la population, mais des
          âgés nettement moins touchés (sur le slide, un seul cadre réunit ces quatre pays).
        </span>
        <span className="block">
          <strong>Attention à la Pologne.</strong> Son taux de remplacement est de 39&nbsp;% (moins de
          50&nbsp;%, cadre rouge du slide 2), et pourtant ses 65 ans et plus sont <em>moins</em> pauvres
          (≈&nbsp;7,5&nbsp;%) que l'ensemble de la population (≈&nbsp;10,4&nbsp;%) : elle n'est pas dans le cadre rouge.
          La règle « moins de 50&nbsp;% ⇒ âgés plus pauvres » n'est donc pas automatique.
        </span>
      </figcaption>
    </figure>
  );
}
