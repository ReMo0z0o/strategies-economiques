import { useEffect, useId, useState, type RefObject } from "react";
import { Gauge, Headphones, Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractSpeechChunks } from "@/lib/speechText";
import {
  cycleRate,
  pause,
  play,
  resume,
  speechSupported,
  stop,
  useSpeech,
} from "@/lib/speech";

/*
 * Bouton « Écouter » qui lit à voix haute le contenu de l'élément visé
 * (targetRef) via la synthèse vocale du navigateur. Quand la lecture est
 * active, il se transforme en mini-lecteur (pause/reprise, arrêt, vitesse,
 * progression). Un seul bloc est lu à la fois dans toute la page.
 */
export function ReadAloudButton({
  targetRef,
  label = "Écouter",
  className,
}: {
  targetRef: RefObject<HTMLElement | null>;
  label?: string;
  className?: string;
}) {
  const speech = useSpeech();
  const id = useId();
  const [mounted, setMounted] = useState(false);

  // Rendu client uniquement (l'API n'existe pas au prérendu) → évite tout
  // décalage d'hydratation.
  useEffect(() => setMounted(true), []);

  if (!mounted || !speechSupported) return null;

  const isActive = speech.activeId === id;
  const playing = isActive && speech.status === "playing";
  const paused = isActive && speech.status === "paused";

  function start() {
    const root = targetRef.current;
    if (!root) return;
    const chunks = extractSpeechChunks(root);
    if (chunks.length === 0) return;
    play(id, chunks);
  }

  if (!isActive) {
    return (
      <button
        type="button"
        data-no-speech="true"
        onClick={start}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
          className,
        )}
        title="Lire cette section à voix haute"
      >
        <Headphones className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <div
      data-no-speech="true"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-accent px-1.5 py-1 text-accent-foreground shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => (playing ? pause() : resume())}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        title={playing ? "Pause" : "Reprendre"}
        aria-label={playing ? "Pause" : "Reprendre"}
      >
        {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
      </button>
      <button
        type="button"
        onClick={stop}
        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        title="Arrêter"
        aria-label="Arrêter la lecture"
      >
        <Square className="h-3 w-3" aria-hidden />
      </button>
      <span className="px-1 text-[11px] font-bold tabular-nums">
        {Math.min(speech.index + 1, speech.total)}/{speech.total}
      </span>
      <button
        type="button"
        onClick={cycleRate}
        className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        title="Vitesse de lecture"
        aria-label="Changer la vitesse de lecture"
      >
        <Gauge className="h-3 w-3" aria-hidden />
        {speech.rate.toLocaleString("fr-FR")}×
      </button>
    </div>
  );
}
