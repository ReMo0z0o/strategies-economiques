import { useMemo, useState, type ReactNode } from "react";
import { Crosshair, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

type Cell = readonly [number, number];

export interface PayoffMatrixProps {
  rowPlayer?: string;
  colPlayer?: string;
  rows: string[];
  cols: string[];
  /** payoffs[r][c] = [utilité joueur ligne, utilité joueur colonne] */
  payoffs: Cell[][];
  /**
   * mode interactif : l'étudiant révèle les meilleures réponses de chaque
   * joueur puis les équilibres de Nash (calculés automatiquement)
   */
  interactive?: boolean;
  /** surligner statiquement ces cellules [ligne, colonne] */
  highlight?: Array<readonly [number, number]>;
  /** souligner statiquement les meilleures réponses (sans interaction) */
  showBestResponses?: boolean;
  caption?: ReactNode;
  className?: string;
}

function computeBestResponses(payoffs: Cell[][]) {
  const nRows = payoffs.length;
  const nCols = payoffs[0]?.length ?? 0;
  // meilleures réponses du joueur ligne : pour chaque colonne, lignes maximisant u1
  const rowBR = new Set<string>();
  for (let c = 0; c < nCols; c++) {
    let best = -Infinity;
    for (let r = 0; r < nRows; r++) best = Math.max(best, payoffs[r][c][0]);
    for (let r = 0; r < nRows; r++) if (payoffs[r][c][0] === best) rowBR.add(`${r},${c}`);
  }
  // meilleures réponses du joueur colonne : pour chaque ligne, colonnes maximisant u2
  const colBR = new Set<string>();
  for (let r = 0; r < nRows; r++) {
    let best = -Infinity;
    for (let c = 0; c < nCols; c++) best = Math.max(best, payoffs[r][c][1]);
    for (let c = 0; c < nCols; c++) if (payoffs[r][c][1] === best) colBR.add(`${r},${c}`);
  }
  const nash = new Set<string>([...rowBR].filter((k) => colBR.has(k)));
  return { rowBR, colBR, nash };
}

export function PayoffMatrix({
  rowPlayer = "Joueur 1",
  colPlayer = "Joueur 2",
  rows,
  cols,
  payoffs,
  interactive = false,
  highlight = [],
  showBestResponses = false,
  caption,
  className,
}: PayoffMatrixProps) {
  const [showRowBR, setShowRowBR] = useState(false);
  const [showColBR, setShowColBR] = useState(false);
  const [showNash, setShowNash] = useState(false);

  const { rowBR, colBR, nash } = useMemo(() => computeBestResponses(payoffs), [payoffs]);
  const highlightSet = useMemo(
    () => new Set(highlight.map(([r, c]) => `${r},${c}`)),
    [highlight],
  );

  const underlineRow = showBestResponses || (interactive && showRowBR);
  const underlineCol = showBestResponses || (interactive && showColBR);
  const markNash = interactive && showNash;

  return (
    <figure data-no-speech="true" className={cn("my-6", className)}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {colPlayer}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {rowPlayer}
            </div>
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5" />
                  {cols.map((c) => (
                    <th
                      key={c}
                      className="min-w-[5.5rem] p-1.5 text-center text-sm font-semibold text-sky-700"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((rLabel, r) => (
                  <tr key={rLabel}>
                    <th className="p-1.5 pr-2 text-right text-sm font-semibold text-rose-700">
                      {rLabel}
                    </th>
                    {cols.map((_, c) => {
                      const key = `${r},${c}`;
                      const isNash = nash.has(key);
                      const cellMarked =
                        highlightSet.has(key) || (markNash && isNash);
                      return (
                        <td key={c} className="p-1">
                          <div
                            className={cn(
                              "flex items-center justify-center gap-1 rounded-lg border-2 px-3 py-2.5 text-[15px] tabular-nums transition-all",
                              cellMarked
                                ? "border-primary bg-accent shadow-[0_0_0_3px_oklch(0.51_0.19_272_/_0.15)]"
                                : "border-border bg-background",
                            )}
                          >
                            <span
                              className={cn(
                                "font-semibold text-rose-700",
                                underlineRow && rowBR.has(key) && "underline decoration-2 underline-offset-4",
                              )}
                            >
                              {payoffs[r][c][0]}
                            </span>
                            <span className="text-muted-foreground">;</span>
                            <span
                              className={cn(
                                "font-semibold text-sky-700",
                                underlineCol && colBR.has(key) && "underline decoration-2 underline-offset-4",
                              )}
                            >
                              {payoffs[r][c][1]}
                            </span>
                            {cellMarked && markNash && isNash ? (
                              <Crosshair className="ml-0.5 h-3.5 w-3.5 text-primary" aria-hidden />
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {interactive ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MousePointerClick className="h-3.5 w-3.5" aria-hidden /> Explore :
              </span>
              <button
                type="button"
                onClick={() => setShowRowBR((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  showRowBR
                    ? "border-rose-300 bg-rose-100 text-rose-800"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Meilleures réponses de {rowPlayer}
              </button>
              <button
                type="button"
                onClick={() => setShowColBR((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  showColBR
                    ? "border-sky-300 bg-sky-100 text-sky-800"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Meilleures réponses de {colPlayer}
              </button>
              <button
                type="button"
                onClick={() => setShowNash((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  showNash
                    ? "border-primary bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Équilibre(s) de Nash
              </button>
              {markNash && nash.size === 0 ? (
                <span className="text-xs font-medium text-muted-foreground">
                  → aucun équilibre de Nash en stratégies pures !
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
