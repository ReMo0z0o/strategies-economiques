import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { chapters, type ChapterId } from "@/data/course";
import { SiteHeader } from "@/components/course/SiteHeader";

/*
 * Chaque chapitre vit dans son propre module (src/chapters/<id>.tsx) chargé
 * à la demande : le bundle initial reste léger malgré la taille du cours.
 */
const CONTENT: Record<ChapterId, LazyExoticComponent<ComponentType>> = {
  a1: lazy(() => import("@/chapters/a1")),
  a2: lazy(() => import("@/chapters/a2")),
  a3: lazy(() => import("@/chapters/a3")),
  b1: lazy(() => import("@/chapters/b1")),
  b2: lazy(() => import("@/chapters/b2")),
  b3: lazy(() => import("@/chapters/b3")),
  b4: lazy(() => import("@/chapters/b4")),
};

export const Route = createFileRoute("/theorie/$chapterId")({
  loader: ({ params }) => {
    const chapter = chapters.find((c) => c.slug === params.chapterId);
    if (!chapter) throw notFound();
    return { chapterId: chapter.id };
  },
  head: ({ params }) => {
    const chapter = chapters.find((c) => c.slug === params.chapterId);
    return {
      meta: [
        {
          title: chapter
            ? `${chapter.code} · ${chapter.title} — Stratégies économiques`
            : "Théorie — Stratégies économiques",
        },
      ],
    };
  },
  component: ChapterPage,
});

function LoadingChapter() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container flex flex-col items-center gap-3 py-24 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Chargement du chapitre…</p>
      </div>
    </div>
  );
}

function ChapterPage() {
  const { chapterId } = Route.useLoaderData();
  const Content = CONTENT[chapterId];
  return (
    <Suspense fallback={<LoadingChapter />}>
      <Content />
    </Suspense>
  );
}
