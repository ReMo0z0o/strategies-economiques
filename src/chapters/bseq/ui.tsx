/*
 * Chapitre B2 (jeux séquentiels) — petits composants de mise en page
 * partagés par les parties du chapitre. Ne pas modifier pendant la
 * rédaction (plusieurs agents les utilisent) : définir un helper local au
 * besoin.
 */

import type { ReactNode } from "react";

/** Sous-titre interne à une section (équivalent des h3 de la source). */
export function H4({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-8 text-lg font-bold tracking-tight">{children}</h3>;
}

/** Tableau simple avec défilement horizontal sur mobile. */
export function Tbl({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[520px] border-collapse text-[15px]">
        <thead>
          <tr className="bg-muted/60">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className="px-3.5 py-2.5 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Grille de mini-cartes (l'équivalent des « minicards » de la source). */
export function CardGrid({
  items,
}: {
  items: Array<{ tag?: ReactNode; title: ReactNode; body: ReactNode; extra?: ReactNode }>;
}) {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          {it.tag ? (
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              {it.tag}
            </div>
          ) : null}
          <div className="text-[15px] font-bold">{it.title}</div>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
          {it.extra ? (
            <div className="mt-2 border-t pt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {it.extra}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Liste numérotée « à maîtriser absolument ». */
export function MustKnow({ items }: { items: ReactNode[] }) {
  return (
    <ul className="my-3 space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-xl border bg-card px-4 py-2.5 text-[15px] leading-relaxed shadow-sm"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-extrabold text-accent-foreground">
            {i + 1}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
