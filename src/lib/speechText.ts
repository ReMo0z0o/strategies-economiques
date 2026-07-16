/*
 * Extraction du texte « lisible à voix haute » d'un fragment de page.
 *
 * On parcourt le DOM rendu et on produit une liste ordonnée de morceaux
 * { texte, élément } — un par bloc de prose — que le moteur de synthèse
 * vocale lit l'un après l'autre (l'élément sert au surlignage).
 *
 * Deux difficultés traitées :
 *  - les formules KaTeX sont converties en français parlé (texToFrench) ;
 *  - les éléments interactifs (quiz, graphiques, boutons, liens) sont ignorés.
 */

export interface SpeechChunk {
  text: string;
  el: HTMLElement;
}

/* Sous-arbres à ne jamais lire (interactifs, décoratifs, déjà cachés). */
const SKIP_SELECTOR =
  'button, a[href], input, select, textarea, svg, canvas, [role="button"], [data-no-speech="true"], [aria-hidden="true"]';

/* Éléments-blocs porteurs de prose. */
const BLOCK_SELECTOR = "h1,h2,h3,h4,h5,h6,p,li,figcaption,blockquote,summary,dt,dd,th,td,caption";

const GREEK: Record<string, string> = {
  alpha: "alpha",
  beta: "bêta",
  gamma: "gamma",
  delta: "delta",
  epsilon: "epsilon",
  varepsilon: "epsilon",
  zeta: "zêta",
  eta: "êta",
  theta: "thêta",
  kappa: "kappa",
  lambda: "lambda",
  mu: "mu",
  nu: "nu",
  xi: "xi",
  rho: "rhô",
  sigma: "sigma",
  tau: "tau",
  phi: "phi",
  varphi: "phi",
  chi: "chi",
  psi: "psi",
  omega: "oméga",
  Delta: "delta majuscule",
  Gamma: "gamma majuscule",
  Lambda: "lambda majuscule",
  Pi: "pi majuscule",
  Sigma: "somme",
  Omega: "oméga majuscule",
  Phi: "phi majuscule",
};

/** Convertit une chaîne LaTeX en une approximation lisible en français. */
export function texToFrench(tex: string): string {
  let s = ` ${tex} `;
  // Texte littéral et unités
  s = s.replace(/\\text\s*\{([^{}]*)\}/g, " $1 ");
  s = s.replace(/\\mathrm\s*\{([^{}]*)\}/g, " $1 ");
  s = s.replace(/€/g, " euros ");
  s = s.replace(/\$/g, " ");
  // Fractions et racines (plusieurs passes pour les imbrications simples)
  for (let k = 0; k < 5; k++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, " $1 sur $2 ");
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, " racine de $1 ");
  }
  s = s.replace(/\\left|\\right/g, " ");
  s = s.replace(/\\cdot|\\times|\\ast/g, " fois ");
  s = s.replace(/\\div/g, " divisé par ");
  s = s.replace(/\\geq|\\geqslant|\\ge\b/g, " supérieur ou égal à ");
  s = s.replace(/\\leq|\\leqslant|\\le\b/g, " inférieur ou égal à ");
  s = s.replace(/\\neq|\\ne\b/g, " différent de ");
  s = s.replace(/\\approx|\\simeq/g, " environ égal à ");
  s = s.replace(/\\equiv/g, " équivalent à ");
  s = s.replace(/\\Rightarrow|\\rightarrow|\\to|\\implies/g, " donne ");
  s = s.replace(/\\Leftrightarrow|\\iff/g, " équivaut à ");
  s = s.replace(/\\in\b/g, " appartient à ");
  s = s.replace(/\\notin\b/g, " n'appartient pas à ");
  s = s.replace(/\\infty/g, " l'infini ");
  s = s.replace(/\\sum/g, " somme ");
  s = s.replace(/\\prod/g, " produit ");
  s = s.replace(/\\int/g, " intégrale ");
  s = s.replace(/\\max/g, " maximum ");
  s = s.replace(/\\min/g, " minimum ");
  s = s.replace(/\\ln/g, " logarithme népérien ");
  s = s.replace(/\\log/g, " logarithme ");
  s = s.replace(/\\exp/g, " exponentielle ");
  s = s.replace(/\\partial/g, " d ");
  s = s.replace(/\\pi\b/g, " pi ");
  // Lettres grecques génériques
  s = s.replace(/\\([A-Za-z]+)/g, (_m, name: string) => (GREEK[name] ? ` ${GREEK[name]} ` : " "));
  // Exposants
  s = s.replace(/\^\{\s*\*\s*\}|\^\*/g, " étoile ");
  s = s.replace(/\^\{\s*2\s*\}|\^2/g, " au carré ");
  s = s.replace(/\^\{\s*3\s*\}|\^3/g, " au cube ");
  s = s.replace(/\^\{([^{}]*)\}/g, " puissance $1 ");
  s = s.replace(/\^(\w)/g, " puissance $1 ");
  // Indices
  s = s.replace(/_\{([^{}]*)\}/g, " indice $1 ");
  s = s.replace(/_(\w)/g, " indice $1 ");
  // Pourcentage, espaces LaTeX, accolades restantes
  s = s.replace(/\\%|%/g, " pour cent ");
  s = s.replace(/\\,|\\;|\\:|\\!|\\quad|\\qquad|\\ /g, " ");
  s = s.replace(/[{}]/g, " ");
  // Opérateurs
  s = s.replace(/\*/g, " fois ");
  s = s.replace(/=/g, " égale ");
  s = s.replace(/\+/g, " plus ");
  s = s.replace(/[-−]/g, " moins ");
  s = s.replace(/</g, " inférieur à ");
  s = s.replace(/>/g, " supérieur à ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Texte parlé d'un élément : concatène ses nœuds texte, convertit les KaTeX,
 * ignore les sous-arbres interactifs. */
function spokenTextOf(el: HTMLElement): string {
  let out = "";
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? "";
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const e = node as HTMLElement;
    if (e.matches?.(SKIP_SELECTOR)) return;
    if (e.classList?.contains("katex")) {
      const ann = e.querySelector('annotation[encoding="application/x-tex"]');
      if (ann?.textContent) out += " " + texToFrench(ann.textContent) + " ";
      return; // ne pas descendre (éviter le doublon katex-html)
    }
    for (const child of Array.from(e.childNodes)) walk(child);
  };
  for (const child of Array.from(el.childNodes)) walk(child);
  return out.replace(/\s+/g, " ").trim();
}

/** Découpe un fragment en morceaux de prose lisibles, dans l'ordre du document. */
export function extractSpeechChunks(root: HTMLElement): SpeechChunk[] {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));
  // Blocs de prose « nus » (ex. corps d'un Callout sans <p>) : .course-prose
  // qui ne contiennent aucun bloc structurant.
  const proseLeaves = Array.from(root.querySelectorAll<HTMLElement>(".course-prose")).filter(
    (e) => !e.querySelector(BLOCK_SELECTOR),
  );

  // Union, hors sous-arbres ignorés, dédupliquée.
  const set = new Set<HTMLElement>();
  for (const el of [...blocks, ...proseLeaves]) {
    if (!el.closest(SKIP_SELECTOR)) set.add(el);
  }
  const candidates = Array.from(set);
  // Ne garder que les blocs « feuilles » (aucun autre candidat à l'intérieur).
  const leaves = candidates.filter((el) => !candidates.some((o) => o !== el && el.contains(o)));
  // Ordre du document.
  leaves.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );

  const chunks: SpeechChunk[] = [];
  for (const el of leaves) {
    const text = spokenTextOf(el);
    if (text.trim().length > 1) chunks.push({ text, el });
  }
  return chunks;
}
