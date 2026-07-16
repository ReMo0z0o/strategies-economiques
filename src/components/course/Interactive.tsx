import { useId, type ReactNode } from "react";
import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Panneau standard pour les explorations interactives (graphiques SVG pilotés
 * par des curseurs, simulations…). Donne une identité visuelle commune à
 * toutes les animations du site.
 */
export function InteractiveCard({
  title,
  subtitle,
  controls,
  children,
  footer,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** zone de curseurs / boutons */
  controls?: ReactNode;
  /** zone de visualisation (SVG, tableau animé…) */
  children: ReactNode;
  /** encadré "ce qu'il faut observer" */
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-no-speech="true"
      className={cn(
        "my-6 overflow-hidden rounded-2xl border-2 border-primary/25 bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-3 border-b border-primary/15 bg-accent/50 px-4 py-3 sm:px-5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MousePointerClick className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <div className="text-[15px] font-bold leading-snug">{title}</div>
          {subtitle ? (
            <div className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {controls ? (
        <div className="grid gap-3 border-b bg-muted/40 px-4 py-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
          {controls}
        </div>
      ) : null}
      <div className="px-4 py-4 sm:px-5">{children}</div>
      {footer ? (
        <div className="border-t bg-muted/40 px-4 py-3 text-sm text-muted-foreground sm:px-5">
          <span className="font-semibold text-foreground">👀 À observer : </span>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Curseur libellé, avec affichage de la valeur courante. */
export function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v: number) => String(v),
  className,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-foreground">
          {label}
        </label>
        <span className="rounded-md bg-accent px-1.5 py-0.5 text-[13px] font-bold tabular-nums text-accent-foreground">
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-[oklch(0.51_0.19_272)]"
      />
    </div>
  );
}

/** Groupe de boutons exclusifs (petits scénarios prédéfinis). */
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  label?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      {label ? <div className="mb-1.5 text-[13px] font-semibold">{label}</div> : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
              value === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
