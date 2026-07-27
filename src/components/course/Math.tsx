import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

interface MathProps {
  /** code LaTeX ; en attribut JSX les backslashes ne sont pas échappés : tex="\delta" fonctionne */
  tex?: string;
  children?: string;
  className?: string;
}

function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, {
    throwOnError: false,
    displayMode,
    strict: false,
    // htmlAndMathml : embarque le MathML (avec le LaTeX source en annotation).
    // Invisible à l'écran, mais lisible par les lecteurs d'écran ET récupéré
    // par le mode « lecture à voix haute » pour énoncer les formules.
    output: "htmlAndMathml",
  });
}

/** Formule en ligne : <M tex="U(l,c)=c+2\ln(l)" /> */
export function M({ tex, children, className }: MathProps) {
  const src = tex ?? children ?? "";
  const html = useMemo(() => render(src, false), [src]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ------------------------------------------------------------------ */
/* Formule centrée, ajustée à la largeur disponible                    */
/* ------------------------------------------------------------------ */

/** En dessous de ce facteur la formule devient illisible : on garde alors le
 * défilement horizontal (avec un dégradé indiquant qu'il reste du contenu). */
const MIN_SCALE = 0.62;

// useLayoutEffect côté client (évite un saut visuel), useEffect au prérendu.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Formule centrée (display mode) : <MB tex="\max_{c_0,c_1} \ln(c_0)+\delta\ln(c_1)" />
 *
 * Les formules longues dépassaient de leur cadre (contenu coupé à droite,
 * surtout sur mobile). On mesure ici la largeur naturelle de la formule et on
 * réduit sa taille de police juste ce qu'il faut pour qu'elle tienne — la
 * hauteur suit naturellement, contrairement à un transform: scale(). En
 * dessous de MIN_SCALE on cesse de réduire et le défilement prend le relais.
 */
export function MB({ tex, children, className }: MathProps) {
  const src = tex ?? children ?? "";
  const html = useMemo(() => render(src, true), [src]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scrollable, setScrollable] = useState(false);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const available = wrap.clientWidth;
    if (available <= 0) return;
    // Largeur naturelle : on remet la police à 100 % le temps de la mesure,
    // puis on restaure aussitôt la valeur en place — sans cette restauration,
    // une mesure qui aboutit au même facteur ne déclenche aucun rendu React et
    // la formule resterait à sa taille non réduite.
    const previous = inner.style.fontSize;
    inner.style.fontSize = "";
    // KaTeX applique son propre overflow-x sur .katex-display : c'est donc CET
    // élément qui « contient » le dépassement, et c'est lui qu'il faut mesurer
    // (le conteneur externe, lui, paraît toujours à la bonne taille).
    const target = inner.querySelector<HTMLElement>(".katex-display") ?? inner;
    const natural = target.scrollWidth;
    inner.style.fontSize = previous;
    const next = natural > available ? Math.max(MIN_SCALE, available / natural) : 1;
    setScale(next);
    setScrollable(natural * next > available + 1);
  }, []);

  useIsomorphicLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [html, measure]);

  // Les polices mathématiques arrivent après le premier rendu : re-mesurer.
  useEffect(() => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts?.ready) return;
    let cancelled = false;
    fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

  return (
    <div
      ref={wrapRef}
      // data-math-block : repère le bloc pour la lecture à voix haute, qui
      // énonce les formules centrées au même titre que les paragraphes.
      data-math-block=""
      data-math-scrollable={scrollable ? "true" : undefined}
      className={cn("my-3 overflow-x-auto text-[1.05rem]", className)}
    >
      <div
        ref={innerRef}
        style={scale < 1 ? { fontSize: `${scale}em` } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** Encadré formule-clé : formule mise en valeur avec légende optionnelle */
export function FormulaBox({
  tex,
  label,
  caption,
  className,
}: {
  tex: string;
  label?: string;
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-5 rounded-xl border border-primary/20 bg-accent/60 px-5 py-4",
        className,
      )}
    >
      {label ? (
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground/80">
          {label}
        </div>
      ) : null}
      <MB tex={tex} className="my-0" />
      {caption ? <div className="mt-2 text-sm text-muted-foreground">{caption}</div> : null}
    </div>
  );
}
