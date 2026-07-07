import { Link } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { globalStats, useProgress } from "@/lib/progress";

const NAV = [
  { to: "/", label: "Accueil", exact: true },
  { to: "/theorie", label: "Théorie" },
  { to: "/exercices", label: "Exercices" },
] as const;

export function SiteHeader() {
  const progress = useProgress();
  const { totalQuiz, correctQuiz } = globalStats(progress);
  const pct = totalQuiz > 0 ? Math.round((correctQuiz / totalQuiz) * 100) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <LineChart className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-bold tracking-tight">
              Stratégies économiques
            </span>
            <span className="hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
              ECGEB366 · cours interactif
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item && item.exact }}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
              activeProps={{
                className: cn("bg-accent text-accent-foreground hover:bg-accent"),
              }}
            >
              {item.label}
            </Link>
          ))}
          {pct !== null ? (
            <span
              title={`${correctQuiz} quiz réussis sur ${totalQuiz} rencontrés`}
              className="ml-1 hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground md:inline-flex"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  pct >= 80 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-primary",
                )}
              />
              {pct}% des quiz
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
