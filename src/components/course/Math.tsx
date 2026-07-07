import { useMemo } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

interface MathProps {
  /** code LaTeX ; en attribut JSX les backslashes ne sont pas échappés : tex="\delta" fonctionne */
  tex?: string;
  children?: string;
  className?: string;
}

function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, {
    throwOnError: false,
    displayMode,
    strict: false,
    output: "html",
  });
}

/** Formule en ligne : <M tex="U(l,c)=c+2\ln(l)" /> */
export function M({ tex, children, className }: MathProps) {
  const src = tex ?? children ?? "";
  const html = useMemo(() => render(src, false), [src]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Formule centrée (display mode) : <MB tex="\max_{c_0,c_1} \ln(c_0)+\delta\ln(c_1)" /> */
export function MB({ tex, children, className }: MathProps) {
  const src = tex ?? children ?? "";
  const html = useMemo(() => render(src, true), [src]);
  return (
    <div
      className={cn("my-3 overflow-x-auto text-[1.05rem]", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Encadré formule-clé : formule mise en valeur avec légende optionnelle */
export function FormulaBox({
  tex,
  label,
  caption,
  className,
}: {
  tex: string;
  label?: string;
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-5 rounded-xl border border-primary/20 bg-accent/60 px-5 py-4",
        className,
      )}
    >
      {label ? (
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground/80">
          {label}
        </div>
      ) : null}
      <MB tex={tex} className="my-0" />
      {caption ? <div className="mt-2 text-sm text-muted-foreground">{caption}</div> : null}
    </div>
  );
}
