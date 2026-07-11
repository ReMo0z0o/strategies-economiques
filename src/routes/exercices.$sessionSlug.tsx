import { createFileRoute, redirect } from "@tanstack/react-router";

/* Ancienne URL mono-cours → redirige vers l'espace du cours Stratégies. */
export const Route = createFileRoute("/exercices/$sessionSlug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$courseSlug/exercices/$sessionSlug",
      params: { courseSlug: "strategies", sessionSlug: params.sessionSlug },
    });
  },
});
