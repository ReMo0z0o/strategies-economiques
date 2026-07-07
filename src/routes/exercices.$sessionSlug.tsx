import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { tpSessions } from "@/data/course";
import { SiteHeader } from "@/components/course/SiteHeader";

/*
 * Chaque séance de TP vit dans son propre module (src/tp/session<N>.tsx)
 * chargé à la demande.
 */
const CONTENT: Record<number, LazyExoticComponent<ComponentType>> = {
  1: lazy(() => import("@/tp/session1")),
  2: lazy(() => import("@/tp/session2")),
  3: lazy(() => import("@/tp/session3")),
  4: lazy(() => import("@/tp/session4")),
};

export const Route = createFileRoute("/exercices/$sessionSlug")({
  loader: ({ params }) => {
    const session = tpSessions.find((s) => s.slug === params.sessionSlug);
    if (!session) throw notFound();
    return { sessionNumber: session.number };
  },
  head: ({ params }) => {
    const session = tpSessions.find((s) => s.slug === params.sessionSlug);
    return {
      meta: [
        {
          title: session
            ? `TP ${session.number} · ${session.title} — Stratégies économiques`
            : "Exercices — Stratégies économiques",
        },
      ],
    };
  },
  component: TpPage,
});

function LoadingTp() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container flex flex-col items-center gap-3 py-24 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Chargement de la séance…</p>
      </div>
    </div>
  );
}

function TpPage() {
  const { sessionNumber } = Route.useLoaderData();
  const Content = CONTENT[sessionNumber];
  return (
    <Suspense fallback={<LoadingTp />}>
      <Content />
    </Suspense>
  );
}
