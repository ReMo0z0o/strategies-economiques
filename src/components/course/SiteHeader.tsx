import { Link } from "@tanstack/react-router";
import { Check, ChevronsUpDown, LayoutGrid, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { courses } from "@/data/course";
import { courseStats, useProgress } from "@/lib/progress";
import { useCourseOptional } from "@/components/course/CourseContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/*
 * En-tête de site. « Conscient du cours » : dans un cours, il affiche la
 * marque du cours, une navigation vers ses pages (/{slug}/…), un indicateur de
 * progression propre au cours et un sélecteur pour changer de cours. Sur le
 * hub (hors cours), il affiche la marque plateforme.
 */
export function SiteHeader() {
  const ctx = useCourseOptional();
  const progress = useProgress();
  const course = ctx?.course ?? null;
  const slug = course?.slug;

  const stats = course ? courseStats(progress, course.id) : null;
  const pct =
    stats && stats.totalQuiz > 0
      ? Math.round((stats.correctQuiz / stats.totalQuiz) * 100)
      : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <LineChart className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-bold tracking-tight">
                {course ? (
                  <>
                    <span className="sm:hidden">{course.code}</span>
                    <span className="hidden sm:inline">{course.shortTitle}</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Projet Éco.</span>
                    <span className="hidden sm:inline">Stratégies & décisions éco.</span>
                  </>
                )}
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
                {course ? `${course.code} · cours interactif` : "Projet interactif · 2 parties"}
              </span>
            </span>
          </Link>

          {course ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Changer de cours"
                title="Changer de cours"
              >
                <ChevronsUpDown className="h-4 w-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Changer de cours</DropdownMenuLabel>
                {courses.map((c) => (
                  <DropdownMenuItem key={c.id} asChild>
                    <Link
                      to="/$courseSlug"
                      params={{ courseSlug: c.slug }}
                      className="flex cursor-pointer items-center justify-between gap-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{c.shortTitle}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.code}
                        </span>
                      </span>
                      {c.id === course.id ? (
                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex cursor-pointer items-center gap-2">
                    <LayoutGrid className="h-4 w-4" aria-hidden />
                    Tous les cours
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {course && slug ? (
            <>
              <Link
                to="/$courseSlug"
                params={{ courseSlug: slug }}
                activeOptions={{ exact: true }}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
                activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent" }}
              >
                Accueil
              </Link>
              <Link
                to="/$courseSlug/theorie"
                params={{ courseSlug: slug }}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
                activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent" }}
              >
                Théorie
              </Link>
              <Link
                to="/$courseSlug/exercices"
                params={{ courseSlug: slug }}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
                activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent" }}
              >
                Exercices
              </Link>
              {pct !== null ? (
                <span
                  title={`${stats?.correctQuiz} quiz réussis sur ${stats?.totalQuiz} rencontrés`}
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
            </>
          ) : (
            <Link
              to="/"
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3"
            >
              Tous les cours
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
