/*
 * Chapitre A1 — figures statiques (SVG artisanal, fidèles au manuel source).
 */

import type { ReactNode } from "react";

/** Cadre commun : carte blanche + légende. */
export function Figure({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <figure className="my-6">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">{children}</div>
      <figcaption className="mt-2 px-1 text-sm leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

/* palette commune */
const INK = "#0f172a";
const SOFT = "#475569";
const FAINT = "#94a3b8";
const BLUE = "#2563eb";
const BLUE_DEEP = "#1e40af";
const RED = "#e11d48";
const GREEN = "#059669";

const axis = { stroke: INK, strokeWidth: 1.6 } as const;
const dash = { stroke: FAINT, strokeWidth: 1.3, strokeDasharray: "4 4", fill: "none" } as const;

/* ------------------------------------------------------------------ */
/* 0.2 — Le moteur de l'analyse : positif → normatif                   */
/* ------------------------------------------------------------------ */

export function FigMethode() {
  return (
    <svg viewBox="0 0 680 250" role="img" aria-label="Schéma : analyse positive et normative" className="w-full">
      <text x="50" y="26" fontSize="13" fontWeight="700" fill={RED} letterSpacing="2">
        ANALYSE POSITIVE
      </text>
      {/* le modèle */}
      <rect x="180" y="55" width="200" height="110" rx="8" fill="#f1f5f9" stroke={SOFT} strokeWidth="1.6" />
      <text x="280" y="46" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={INK}>
        le MODÈLE
      </text>
      {/* entrées */}
      <text x="40" y="86" fontSize="12.5" fill={SOFT}>
        Mesure 1
      </text>
      <line x1="105" y1="82" x2="178" y2="82" {...dash} />
      <polygon points="178,82 170,78 170,86" fill={FAINT} />
      <text x="40" y="142" fontSize="12.5" fill={SOFT}>
        Mesure 2
      </text>
      <line x1="105" y1="138" x2="178" y2="138" {...dash} />
      <polygon points="178,138 170,134 170,142" fill={FAINT} />
      {/* engrenage */}
      <circle cx="280" cy="110" r="22" fill="none" stroke={BLUE} strokeWidth="2" />
      <circle cx="280" cy="110" r="7" fill="none" stroke={BLUE} strokeWidth="2" />
      <g stroke={BLUE} strokeWidth="2">
        <line x1="280" y1="84" x2="280" y2="92" />
        <line x1="280" y1="128" x2="280" y2="136" />
        <line x1="254" y1="110" x2="262" y2="110" />
        <line x1="298" y1="110" x2="306" y2="110" />
      </g>
      {/* sorties */}
      <line x1="382" y1="82" x2="455" y2="82" {...dash} />
      <polygon points="455,82 447,78 447,86" fill={FAINT} />
      <text x="462" y="86" fontSize="12.5" fill={INK}>
        Résultat 1
      </text>
      <line x1="382" y1="138" x2="455" y2="138" {...dash} />
      <polygon points="455,138 447,134 447,142" fill={FAINT} />
      <text x="462" y="142" fontSize="12.5" fill={INK}>
        Résultat 2
      </text>
      {/* volet normatif */}
      <text x="462" y="198" fontSize="12.5" fontWeight="700" fill={GREEN} letterSpacing="1.5">
        NORMATIVE → on classe
      </text>
      <line x1="462" y1="208" x2="640" y2="208" stroke={GREEN} strokeWidth="2" />
      <line x1="466" y1="208" x2="500" y2="224" stroke={GREEN} strokeWidth="2" />
      <text x="505" y="230" fontSize="12.5" fill={GREEN}>
        « Résultat 2 est meilleur »
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* A.5 — Une courbe d'indifférence, quatre paniers                     */
/* ------------------------------------------------------------------ */

export function FigIndiff() {
  return (
    <svg viewBox="0 0 520 340" role="img" aria-label="Une courbe d'indifférence avec quatre paniers" className="w-full">
      <line x1="60" y1="300" x2="470" y2="300" {...axis} />
      <line x1="60" y1="300" x2="60" y2="30" {...axis} />
      <polygon points="470,300 460,295 460,305" fill={INK} />
      <polygon points="60,30 55,40 65,40" fill={INK} />
      <text x="475" y="305" fontSize="16" fontStyle="italic" fill={INK}>
        l
      </text>
      <text x="48" y="36" fontSize="16" fontStyle="italic" fill={INK}>
        c
      </text>
      {/* courbe d'indifférence (convexe) */}
      <path d="M 100 80 Q 150 150 230 175 T 420 270" stroke={BLUE} strokeWidth="2.4" fill="none" />
      {/* flèche « mieux » */}
      <line x1="135" y1="120" x2="175" y2="90" stroke={BLUE} strokeWidth="2" />
      <polygon points="175,90 163,90 172,101" fill={BLUE} />
      <text x="178" y="88" fontSize="12.5" fill={BLUE_DEEP} fontWeight="600">
        mieux
      </text>
      {/* x et x′ sur la courbe */}
      <circle cx="158" cy="148" r="6" fill={INK} />
      <text x="138" y="143" fontSize="16" fontStyle="italic" fill={INK}>
        x
      </text>
      <circle cx="300" cy="207" r="6" fill={INK} />
      <text x="308" y="205" fontSize="16" fontStyle="italic" fill={INK}>
        x′
      </text>
      {/* y au-dessus */}
      <circle cx="250" cy="120" r="6" fill={RED} />
      <text x="258" y="118" fontSize="16" fontStyle="italic" fill={RED}>
        y
      </text>
      {/* z en dessous */}
      <circle cx="170" cy="245" r="6" fill={GREEN} />
      <text x="150" y="248" fontSize="16" fontStyle="italic" fill={GREEN}>
        z
      </text>
      <text x="295" y="295" fontSize="12.5" fill={BLUE} fontWeight="600">
        courbe d'indifférence
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* A.5 — La carte d'indifférence                                       */
/* ------------------------------------------------------------------ */

export function FigCarte() {
  return (
    <svg viewBox="0 0 520 320" role="img" aria-label="Carte d'indifférence avec trois courbes" className="w-full">
      <line x1="60" y1="285" x2="470" y2="285" {...axis} />
      <line x1="60" y1="285" x2="60" y2="25" {...axis} />
      <polygon points="470,285 460,280 460,290" fill={INK} />
      <polygon points="60,25 55,35 65,35" fill={INK} />
      <text x="475" y="290" fontSize="16" fontStyle="italic" fill={INK}>
        l
      </text>
      <text x="48" y="33" fontSize="16" fontStyle="italic" fill={INK}>
        c
      </text>
      <path d="M 95 110 Q 130 175 210 200 T 360 270" stroke={BLUE} strokeWidth="2.4" fill="none" opacity="0.5" />
      <path d="M 120 75 Q 165 145 250 170 T 410 245" stroke={BLUE} strokeWidth="2.4" fill="none" opacity="0.75" />
      <path d="M 150 48 Q 200 120 295 145 T 450 222" stroke={BLUE} strokeWidth="2.4" fill="none" />
      <line x1="170" y1="150" x2="215" y2="105" stroke={BLUE} strokeWidth="2" />
      <polygon points="215,105 203,106 212,116" fill={BLUE} />
      <text x="220" y="103" fontSize="12.5" fill={BLUE_DEEP} fontWeight="600">
        satisfaction croissante
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* A.7 — L'optimum : le point de tangence                              */
/* ------------------------------------------------------------------ */

export function FigTangence() {
  return (
    <svg viewBox="0 0 520 360" role="img" aria-label="L'optimum du consommateur : la tangence" className="w-full">
      <line x1="65" y1="305" x2="475" y2="305" {...axis} />
      <line x1="65" y1="305" x2="65" y2="30" {...axis} />
      <polygon points="475,305 465,300 465,310" fill={INK} />
      <polygon points="65,30 60,40 70,40" fill={INK} />
      <text x="480" y="310" fontSize="16" fontStyle="italic" fill={INK}>
        l
      </text>
      <text x="53" y="36" fontSize="16" fontStyle="italic" fill={INK}>
        c
      </text>
      {/* droite de budget */}
      <line x1="65" y1="60" x2="400" y2="285" stroke={RED} strokeWidth="2.6" />
      <text x="18" y="56" fontSize="12" fontStyle="italic" fill={INK}>
        s(1−t)L+M
      </text>
      <circle cx="400" cy="285" r="6" fill={INK} />
      <text x="408" y="283" fontSize="16" fontStyle="italic" fill={INK}>
        ω
      </text>
      {/* courbe d'indifférence tangente en x* */}
      <path d="M 120 150 Q 180 195 230 197 Q 300 200 360 250" stroke={BLUE} strokeWidth="2.4" fill="none" />
      <circle cx="225" cy="197" r="7" fill={INK} />
      <text x="233" y="190" fontSize="16" fontStyle="italic" fill={INK}>
        x*
      </text>
      {/* pointillés */}
      <line x1="65" y1="197" x2="225" y2="197" {...dash} />
      <text x="42" y="201" fontSize="14" fontStyle="italic" fill={INK}>
        c*
      </text>
      <line x1="225" y1="305" x2="225" y2="197" {...dash} />
      <text x="219" y="323" fontSize="14" fontStyle="italic" fill={INK}>
        l*
      </text>
      {/* accolades en bas : loisir / travail */}
      <line x1="65" y1="338" x2="223" y2="338" stroke={GREEN} strokeWidth="1.5" />
      <text x="110" y="353" fontSize="12.5" fill={GREEN} fontWeight="600">
        loisir
      </text>
      <line x1="227" y1="338" x2="400" y2="338" stroke={RED} strokeWidth="1.5" />
      <text x="270" y="353" fontSize="12.5" fill={RED} fontWeight="600">
        offre de travail
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* A.10 — Les utilités selon la taxe, et la zone Pareto-dominée         */
/* ------------------------------------------------------------------ */

export function FigParetoTaxe() {
  return (
    <svg viewBox="0 0 540 320" role="img" aria-label="Utilités selon la taxe et zone dominée" className="w-full">
      <line x1="55" y1="265" x2="510" y2="265" {...axis} />
      <line x1="55" y1="265" x2="55" y2="20" {...axis} />
      <polygon points="510,265 500,260 500,270" fill={INK} />
      <polygon points="55,20 50,30 60,30" fill={INK} />
      <text x="500" y="285" fontSize="16" fontStyle="italic" fill={INK}>
        t
      </text>
      <text x="20" y="30" fontSize="15" fontStyle="italic" fill={INK}>
        U(t)
      </text>
      {/* U_H : décroissante */}
      <path d="M 70 55 Q 230 80 350 140 T 480 250" stroke={BLUE} strokeWidth="2.5" fill="none" />
      <text x="428" y="178" fontSize="15" fontStyle="italic" fill={BLUE_DEEP}>
        U_H(t)
      </text>
      {/* U_B : en cloche, sommet en t*_UB */}
      <path d="M 70 175 Q 200 120 300 128 Q 380 134 480 230" stroke={GREEN} strokeWidth="2.5" fill="none" />
      <text x="380" y="172" fontSize="15" fontStyle="italic" fill={GREEN}>
        U_B(t)
      </text>
      {/* repère du sommet t*_UB */}
      <line x1="300" y1="128" x2="300" y2="265" {...dash} />
      <text x="282" y="283" fontSize="13" fontStyle="italic" fill={INK}>
        t*_UB
      </text>
      {/* zone dominée */}
      <line x1="310" y1="252" x2="470" y2="252" stroke={RED} strokeWidth="4" />
      <text x="316" y="244" fontSize="12.5" fill={RED} fontWeight="700">
        zone Pareto-dominée
      </text>
    </svg>
  );
}
