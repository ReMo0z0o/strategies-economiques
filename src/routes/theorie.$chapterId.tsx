import { createFileRoute, redirect } from "@tanstack/react-router";

/* Ancienne URL mono-cours → redirige vers l'espace du cours Stratégies. */
export const Route = createFileRoute("/theorie/$chapterId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$courseSlug/theorie/$chapterId",
      params: { courseSlug: "strategies", chapterId: params.chapterId },
    });
  },
});
