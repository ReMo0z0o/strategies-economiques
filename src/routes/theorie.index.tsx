import { createFileRoute, redirect } from "@tanstack/react-router";

/* Ancienne URL mono-cours → redirige vers l'espace du cours Stratégies. */
export const Route = createFileRoute("/theorie/")({
  beforeLoad: () => {
    throw redirect({ to: "/$courseSlug/theorie", params: { courseSlug: "strategies" } });
  },
});
