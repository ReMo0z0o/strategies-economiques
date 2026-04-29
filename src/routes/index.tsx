import { createFileRoute } from "@tanstack/react-router";
import { videos } from "@/data/videos";
import VideoCard from "@/components/VideoCard";
import unamurLogo from "@/assets/unamur-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'IA dans l'industrie musicale — Aperçus vidéo" },
      {
        name: "description",
        content:
          "Sélection de quatre aperçus vidéo accompagnant le poster « L'IA dans l'industrie musicale » — Romane Tahir & Rémi de Buisseret-D, Université de Namur, 2025–2026.",
      },
      { property: "og:title", content: "L'IA dans l'industrie musicale — Aperçus vidéo" },
      {
        property: "og:description",
        content:
          "Quatre extraits illustrant les enjeux de l'IA dans la musique : propriété, éthique, création.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "L'IA dans l'industrie musicale — Aperçus vidéo" },
      {
        name: "twitter:description",
        content:
          "Quatre extraits illustrant les enjeux de l'IA dans la musique : propriété, éthique, création.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="border-b border-ink/20">
        <div className="container py-2 flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-primary font-sans-ui">
          <span>Poster · Intelligence artificielle · enjeux et opportunités · 2025–2026</span>
          <span className="hidden md:inline text-ink/70">Aperçus vidéo</span>
        </div>
      </div>

      <header className="container pt-10 pb-8">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end border-b-2 border-ink pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] text-ink">
              L'IA dans
              <br />
              l'industrie <em className="text-primary italic font-normal">musicale</em>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-primary font-sans-ui">
              Aperçus vidéo · partage individuel pour chaque extrait
            </p>
            <p className="mt-3 text-ink/80 max-w-2xl leading-relaxed">
              Sélection de quatre vidéos illustrant les enjeux abordés dans le poster :
              propriété intellectuelle, éthique et avenir de la création quand la machine
              imite la voix, le style et l'œuvre en quelques secondes.
            </p>
          </div>
          <div className="flex items-end gap-5 justify-end">
            <div className="text-right text-sm text-ink/80 font-sans-ui leading-relaxed">
              Romane Tahir
              <br />
              Rémi de Buisseret-D
              <br />
              Université de Namur
              <br />
              <span className="text-primary">2025 — 2026</span>
            </div>
            <img
              src={unamurLogo}
              alt="Logo Université de Namur"
              className="h-20 md:h-24 w-auto object-contain shrink-0"
            />
          </div>
        </div>
      </header>

      <section className="container pb-16">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
          {videos.map((video, idx) => (
            <VideoCard key={video.id} video={video} index={idx + 1} />
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/20">
        <div className="container py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-ink/70 font-sans-ui">
          <span>Cliquez sur « Partager » pour copier le lien d'aperçu d'une vidéo.</span>
          <span className="text-primary uppercase tracking-[0.2em]">Complément du poster</span>
        </div>
      </footer>
    </main>
  );
}
