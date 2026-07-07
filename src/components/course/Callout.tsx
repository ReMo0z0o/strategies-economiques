import type { ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  ListOrdered,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutVariant =
  | "definition"
  | "intuition"
  | "exemple"
  | "attention"
  | "retiens"
  | "examen"
  | "methode";

const VARIANTS: Record<
  CalloutVariant,
  { icon: typeof BookOpen; label: string; frame: string; iconColor: string; labelColor: string }
> = {
  definition: {
    icon: BookOpen,
    label: "Définition",
    frame: "border-indigo-200 bg-indigo-50/70",
    iconColor: "text-indigo-600",
    labelColor: "text-indigo-800",
  },
  intuition: {
    icon: Lightbulb,
    label: "Intuition",
    frame: "border-amber-200 bg-amber-50/70",
    iconColor: "text-amber-600",
    labelColor: "text-amber-800",
  },
  exemple: {
    icon: FlaskConical,
    label: "Exemple",
    frame: "border-sky-200 bg-sky-50/70",
    iconColor: "text-sky-600",
    labelColor: "text-sky-800",
  },
  attention: {
    icon: AlertTriangle,
    label: "Attention — piège fréquent",
    frame: "border-rose-200 bg-rose-50/70",
    iconColor: "text-rose-600",
    labelColor: "text-rose-800",
  },
  retiens: {
    icon: Star,
    label: "À retenir",
    frame: "border-emerald-200 bg-emerald-50/70",
    iconColor: "text-emerald-600",
    labelColor: "text-emerald-800",
  },
  examen: {
    icon: GraduationCap,
    label: "Réflexe d'examen",
    frame: "border-violet-200 bg-violet-50/70",
    iconColor: "text-violet-600",
    labelColor: "text-violet-800",
  },
  methode: {
    icon: ListOrdered,
    label: "Méthode",
    frame: "border-teal-200 bg-teal-50/70",
    iconColor: "text-teal-600",
    labelColor: "text-teal-800",
  },
};

export function Callout({
  variant,
  title,
  children,
  className,
}: {
  variant: CalloutVariant;
  /** titre affiché à la place du libellé par défaut de la variante */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  return (
    <aside className={cn("my-5 rounded-xl border px-4 py-3.5 sm:px-5", v.frame, className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", v.iconColor)} aria-hidden />
        <span className={cn("text-[13px] font-bold uppercase tracking-wide", v.labelColor)}>
          {title ?? v.label}
        </span>
      </div>
      <div className="course-prose mt-2 text-[15px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </aside>
  );
}
