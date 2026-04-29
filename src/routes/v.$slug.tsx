import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Share2, Check } from "lucide-react";
import { getVideoBySlug, videos } from "@/data/videos";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import unamurLogo from "@/assets/unamur-logo.png";

export const Route = createFileRoute("/v/$slug")({
  loader: ({ params }) => {
    const video = getVideoBySlug(params.slug);
    if (!video) throw notFound();
    return { video };
  },
  head: ({ loaderData }) => {
    const video = loaderData?.video;
    if (!video) {
      return {
        meta: [
          { title: "Vidéo introuvable — IA & musique" },
          { name: "description", content: "Cet aperçu vidéo n'existe pas." },
        ],
      };
    }
    const title = `${video.title} — IA & musique`;
    const description = `${video.description} Extrait du poster « L'IA dans l'industrie musicale », Université de Namur.`;
    const image = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.other" },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1280" },
        { property: "og:image:height", content: "720" },
        { property: "og:video", content: `https://www.youtube.com/watch?v=${video.youtubeId}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:player", content: `https://www.youtube.com/embed/${video.youtubeId}` },
      ],
    };
  },
  component: VideoView,
});

function VideoView() {
  const { video } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  const index = videos.findIndex((v) => v.slug === video.slug) + 1;

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined" ? `${window.location.origin}/v/${video.slug}` : "";
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !", { description: shareUrl });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="border-b border-ink/20">
        <div className="container py-2 text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-primary font-sans-ui truncate">
          Poster · Intelligence artificielle · aperçu vidéo
        </div>
      </div>

      <div className="container py-6 sm:py-10 max-w-5xl">
        <Link
          to="/"
          className="sm:inline-flex hidden items-center gap-2 text-ink/70 hover:text-primary transition-colors mb-6 font-sans-ui text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la galerie
        </Link>
        <Link
          to="/"
          className="sm:hidden inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-sm border-2 border-ink bg-paper text-ink font-sans-ui text-sm font-semibold uppercase tracking-wide shadow-[3px_3px_0_0_var(--ink)] hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[3px_3px_0_0_var(--primary)] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la galerie
        </Link>

        <div className="flex items-baseline gap-2 sm:gap-3 mb-2 border-b-2 border-ink pb-4">
          <span className="text-2xl sm:text-4xl font-bold text-primary leading-none shrink-0">{index}.</span>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-ink uppercase tracking-tight sm:tracking-wide break-words">
            {video.title}
          </h1>
        </div>
        <div className="mt-4 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <p className="text-ink/80 text-sm sm:text-base">{video.description}</p>
          <div className="flex items-end gap-4 sm:justify-end">
            <p className="text-xs sm:text-sm text-ink/80 font-sans-ui sm:text-right leading-relaxed">
              Romane Tahir
              <br />
              Rémi de Buisseret-D
            </p>
            <img
              src={unamurLogo}
              alt="Logo Université de Namur"
              className="h-12 sm:h-16 w-auto object-contain shrink-0"
            />
          </div>
        </div>

        <div className="rounded-sm overflow-hidden bg-background-secondary border-2 border-ink/80 shadow-[8px_8px_0_0_var(--background-secondary)]">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full sm:w-auto border-ink/60 text-ink hover:bg-primary hover:text-primary-foreground hover:border-primary font-sans-ui"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            <span className="ml-2">
              <span className="sm:hidden">{copied ? "Lien copié" : "Copier le lien"}</span>
              <span className="hidden sm:inline">{copied ? "Lien copié" : "Copier le lien de partage"}</span>
            </span>
          </Button>
        </div>
      </div>
    </main>
  );
}