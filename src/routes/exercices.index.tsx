import { createFileRoute, redirect } from "@tanstack/react-router";

/* Ancienne URL mono-cours → redirige vers l'espace du cours Stratégies. */
export const Route = createFileRoute("/exercices/")({
  beforeLoad: () => {
    throw redirect({ to: "/$courseSlug/exercices", params: { courseSlug: "strategies" } });
  },
});
