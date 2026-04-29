import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Share2, Check, Play } from "lucide-react";
import type { Video } from "@/data/videos";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoCardProps {
  video: Video;
  index?: number;
}

const VideoCard = ({ video, index }: VideoCardProps) => {
  const [copied, setCopied] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/v/${video.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien de partage copié !", { description: shareUrl });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  return (
    <article className="group">
      <div className="flex items-baseline gap-2 sm:gap-3 mb-3">
        {index !== undefined && (
          <span className="text-2xl sm:text-3xl font-bold text-primary leading-none shrink-0">
            {index}.
          </span>
        )}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink uppercase tracking-tight sm:tracking-wide underline underline-offset-4 decoration-ink/60 break-words">
          {video.title}
        </h2>
      </div>

      <Link
        to="/v/$slug"
        params={{ slug: video.slug }}
        className="block relative aspect-video overflow-hidden rounded-sm bg-background-secondary border-2 border-ink/80 shadow-[6px_6px_0_0_var(--background-secondary)] transition-transform duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        <img
          src={thumbnail}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover opacity-95 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-background-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>
      </Link>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <p className="text-ink/85 text-sm leading-relaxed flex-1">
          {video.description}
        </p>
        <Button
          onClick={handleShare}
          size="sm"
          variant="outline"
          className="self-end sm:self-auto shrink-0 border-ink/60 text-ink hover:bg-primary hover:text-primary-foreground hover:border-primary font-sans-ui"
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span className="ml-2">{copied ? "Copié" : "Partager"}</span>
        </Button>
      </div>
    </article>
  );
};

export default VideoCard;