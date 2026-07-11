/*
 * Registre central des cours de la plateforme.
 *
 * L'app héberge plusieurs cours distincts (« strategies » = ECGEB366
 * Stratégies et Décisions Économiques ; « industrielle » = Économie
 * industrielle). Chaque cours possède ses propres parties, chapitres et
 * séances de TP.
 *
 * Les ids de sections correspondent aux ancres utilisées dans les pages de
 * théorie (/{cours}/theorie/<slug>#<sectionId>) : les pages de TP s'y réfèrent
 * pour relier chaque étape de résolution à la théorie correspondante.
 */

/** Identifiant de cours = segment d'URL de premier niveau. */
export type CourseId = "strategies" | "industrielle";

/**
 * Ids de chapitres. Union ouverte par cours ; les ids doivent être uniques
 * à travers TOUS les cours pour éviter toute collision (le cours « strategies »
 * utilise a1…b4 ; les autres cours emploient un préfixe distinct).
 */
export type ChapterId = "a1" | "a2" | "a3" | "b1" | "b2" | "b3" | "b4" | (string & {});
export type PartId = string;

export interface ChapterSection {
  id: string;
  title: string;
}

export interface ChapterColor {
  /** dégradé du hero et des cartes, ex. "from-sky-500 to-blue-600" */
  gradient: string;
  /** pastille/badge, ex. "bg-sky-100 text-sky-800" */
  badge: string;
  /** texte accentué, ex. "text-sky-700" */
  text: string;
  /** fond très léger, ex. "bg-sky-50" */
  soft: string;
}

export interface Chapter {
  /** cours auquel appartient ce chapitre (injecté par le registre) */
  course: CourseId;
  id: ChapterId;
  part: PartId;
  code: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  color: ChapterColor;
  sections: ChapterSection[];
  /** séances de TP qui s'entraînent sur ce chapitre */
  tpSessions: number[];
}

export interface Part {
  id: PartId;
  title: string;
  subtitle: string;
}

export interface TpSession {
  /** cours auquel appartient cette séance (injecté par le registre) */
  course: CourseId;
  number: number;
  slug: string;
  scope: string;
  title: string;
  subtitle: string;
  exerciseCount: number;
  chapters: ChapterId[];
  topics: string[];
}

/** Un cours complet : identité, thème visuel, parties, chapitres, TP. */
export interface Course {
  id: CourseId;
  /** segment d'URL, ex. "strategies" */
  slug: string;
  /** code académique affiché, ex. "ECGEB366" */
  code: string;
  /** titre complet, ex. "Stratégies et Décisions Économiques" */
  title: string;
  /** titre court pour le header, ex. "Stratégies économiques" */
  shortTitle: string;
  tagline: string;
  description: string;
  /** identité visuelle du cours (hero de la home, carte du hub, header) */
  theme: ChapterColor;
  parts: Part[];
  chapters: Chapter[];
  tpSessions: TpSession[];
}

/* Les tableaux de contenu ci-dessous sont déclarés sans le champ `course` ;
 * il est injecté au moment de la construction du Course (voir plus bas). */
type ChapterData = Omit<Chapter, "course">;
type TpSessionData = Omit<TpSession, "course">;

const strategiesParts: Part[] = [
  {
    id: "A",
    title: "Partie A — La décision individuelle",
    subtitle:
      "Comment un individu choisit seul : préférences, arbitrages dans le temps et face au risque — et comment les vrais humains s'écartent du modèle rationnel.",
  },
  {
    id: "B",
    title: "Partie B — Les interactions stratégiques",
    subtitle:
      "Quand mon résultat dépend aussi des choix des autres : théorie des jeux, contrats et incitations, coopération répétée et information incomplète.",
  },
];

const strategiesChaptersData: ChapterData[] = [
  {
    id: "a1",
    part: "A",
    code: "A1",
    slug: "a1",
    title: "Préférences et choix",
    tagline: "Le modèle du choix rationnel… et ce que les humains en font vraiment.",
    description:
      "Offre de travail, courbes d'indifférence, optimisation sous contrainte, critère de Pareto — puis les biais comportementaux : coûts irrécupérables, effet de dotation, framing et nudges.",
    color: {
      gradient: "from-sky-500 to-blue-600",
      badge: "bg-sky-100 text-sky-800",
      text: "text-sky-700",
      soft: "bg-sky-50",
    },
    sections: [
      { id: "intro", title: "Pourquoi ce chapitre ?" },
      { id: "offre", title: "Le modèle d'offre de travail" },
      { id: "pref", title: "Les préférences" },
      { id: "indiff", title: "Les courbes d'indifférence" },
      { id: "optim", title: "L'optimisation sous contrainte" },
      { id: "redistrib", title: "Application : la redistribution" },
      { id: "pareto", title: "Le critère de Pareto" },
      { id: "comporte", title: "Économie comportementale : l'idée centrale" },
      { id: "transaction", title: "L'utilité de transaction" },
      { id: "sunk", title: "Les coûts irrécupérables" },
      { id: "dotation", title: "L'effet de dotation" },
      { id: "framing", title: "Le framing" },
      { id: "vs", title: "Rationnel vs comportemental" },
      { id: "nudge", title: "Hors du labo : le nudge" },
      { id: "synthese", title: "À maîtriser absolument" },
      { id: "exos", title: "Exercices corrigés" },
    ],
    tpSessions: [1],
  },
  {
    id: "a2",
    part: "A",
    code: "A2",
    slug: "a2",
    title: "Décision inter-temporelle",
    tagline: "Épargner ou consommer aujourd'hui ? Le taux d'escompte, et les pièges du self-contrôle.",
    description:
      "Le modèle d'épargne à deux périodes, la contrainte de budget en valeur présente, le choix optimal par le Lagrangien — puis le biais présent (β, δ), les commitment devices et les nudges d'épargne.",
    color: {
      gradient: "from-teal-500 to-cyan-600",
      badge: "bg-teal-100 text-teal-800",
      text: "text-teal-700",
      soft: "bg-teal-50",
    },
    sections: [
      { id: "intro", title: "Pourquoi ce chapitre existe" },
      { id: "outils", title: "La boîte à outils" },
      { id: "modele", title: "Le modèle d'épargne" },
      { id: "prefs", title: "Les préférences rationnelles" },
      { id: "choix", title: "Le choix optimal" },
      { id: "selfcontrole", title: "Les problèmes de self-contrôle" },
      { id: "commit", title: "Se lier les mains : les commitment devices" },
      { id: "politiques", title: "Les politiques publiques : les nudges" },
      { id: "maitrise", title: "À maîtriser absolument" },
      { id: "exos", title: "Exercices corrigés" },
    ],
    tpSessions: [1],
  },
  {
    id: "a3",
    part: "A",
    code: "A3",
    slug: "a3",
    title: "Décision sous incertitude",
    tagline: "Risquer, assurer, diversifier : l'utilité espérée et ses limites.",
    description:
      "Loteries et valeur monétaire attendue, utilité espérée de von Neumann–Morgenstern, aversion au risque, équivalent certain et prime de risque, investissement et assurance optimale — puis théorie des perspectives et biais sur les probabilités.",
    color: {
      gradient: "from-violet-500 to-purple-600",
      badge: "bg-violet-100 text-violet-800",
      text: "text-violet-700",
      soft: "bg-violet-50",
    },
    sections: [
      { id: "s1", title: "Le mystère de l'argent qui dort" },
      { id: "s2", title: "Actifs risqués et valeur monétaire attendue" },
      { id: "s3", title: "Préférences rationnelles sur des loteries" },
      { id: "s4", title: "L'utilité espérée de von Neumann–Morgenstern" },
      { id: "s5", title: "Les trois attitudes face au risque" },
      { id: "s6", title: "Équivalent certain et prime de risque" },
      { id: "s7", title: "Application 1 · Combien investir dans un projet risqué ?" },
      { id: "s8", title: "Diversification : ne pas mettre tous ses œufs dans le même panier" },
      { id: "s9", title: "Application 2 · Combien s'assurer ?" },
      { id: "s10", title: "Théorie des perspectives : le point de référence" },
      { id: "s11", title: "Cadrage étroit — narrow framing" },
      { id: "s12", title: "Biais sur les probabilités" },
      { id: "s13", title: "Synthèse & auto-évaluation" },
    ],
    tpSessions: [1],
  },
  {
    id: "b1",
    part: "B",
    code: "B1",
    slug: "b1",
    title: "Jeux simultanés",
    tagline: "Matrices, dominance, équilibre de Nash : le langage de la stratégie.",
    description:
      "Représenter un jeu en forme normale, stratégies dominantes et dominées, élimination itérative, équilibre de Nash en stratégies pures et mixtes — et ce que font les joueurs réels au laboratoire.",
    color: {
      gradient: "from-amber-500 to-orange-600",
      badge: "bg-amber-100 text-amber-800",
      text: "text-amber-700",
      soft: "bg-amber-50",
    },
    sections: [
      { id: "s0", title: "Pourquoi ce chapitre ?" },
      { id: "s1", title: "C'est quoi, un jeu ?" },
      { id: "s2", title: "Lire (et écrire) une matrice de jeu" },
      { id: "s3", title: "Stratégies dominantes & dominées" },
      { id: "s4", title: "L'élimination itérative (PSS)" },
      { id: "s5", title: "L'équilibre de Nash" },
      { id: "s6", title: "Trois solutions, un diagramme" },
      { id: "s7", title: "Théorie vs joueurs réels : les données du labo" },
      { id: "s8", title: "Stratégies mixtes : jouer au hasard, rationnellement" },
      { id: "s9", title: "Exercices récapitulatifs" },
      { id: "s10", title: "Checklist de maîtrise" },
    ],
    tpSessions: [2, 3],
  },
  {
    id: "b2",
    part: "B",
    code: "B2",
    slug: "b2",
    title: "Théorie des contrats",
    tagline: "Salaire fixe, commission ou mixte ? Concevoir les bonnes incitations.",
    description:
      "Le modèle principal-agent : effort inobservable, salaire fixe, proportionnel ou linéaire, contrainte de participation et d'incitation, partage du risque quand l'agent est averse au risque.",
    color: {
      gradient: "from-rose-500 to-pink-600",
      badge: "bg-rose-100 text-rose-800",
      text: "text-rose-700",
      soft: "bg-rose-50",
    },
    sections: [
      { id: "sec-reperes", title: "Repères — où en sommes-nous ?" },
      { id: "sec-histoire", title: "L'histoire du commercial" },
      { id: "sec-modele", title: "Le modèle principal-agent" },
      { id: "sec-cas1", title: "Cas 1 — le salaire fixe" },
      { id: "sec-cas2", title: "Cas 2 — le salaire proportionnel" },
      { id: "sec-cas3", title: "Cas 3 — le salaire linéaire" },
      { id: "sec-recap", title: "Les trois contrats côte à côte" },
      { id: "sec-risque", title: "Et si l'agent est averse au risque ?" },
      { id: "sec-exos", title: "Exercices résolus" },
      { id: "sec-bilan", title: "Bilan — checklist de maîtrise" },
    ],
    tpSessions: [4],
  },
  {
    id: "b3",
    part: "B",
    code: "B3",
    slug: "b3",
    title: "Jeux répétés",
    tagline: "Quand rejouer change tout : coopération, punition et facteur d'escompte.",
    description:
      "Du dilemme du prisonnier joué une fois aux jeux répétés : horizon fini et backward induction, horizon infini, stratégie grim trigger et la condition δ ≥ 1/2, le tournoi d'Axelrod et les données de laboratoire.",
    color: {
      gradient: "from-emerald-500 to-green-600",
      badge: "bg-emerald-100 text-emerald-800",
      text: "text-emerald-700",
      soft: "bg-emerald-50",
    },
    sections: [
      { id: "sec-reperes", title: "Repères — où en sommes-nous ?" },
      { id: "sec-fritkot", title: "Le dilemme du fritkot" },
      { id: "sec-cadre", title: "C'est quoi, un jeu répété ?" },
      { id: "sec-deux", title: "Deux périodes : la coopération échoue" },
      { id: "sec-fini", title: "Le théorème de l'horizon fini" },
      { id: "sec-infini", title: "Horizon infini : la boîte à outils" },
      { id: "sec-tt", title: "« Toujours trahir » reste un équilibre" },
      { id: "sec-grim", title: "Grim contre grim : la condition δ ≥ 1/2" },
      { id: "sec-interp", title: "Interpréter & généraliser" },
      { id: "sec-axelrod", title: "Le tournoi d'Axelrod" },
      { id: "sec-labo", title: "Au laboratoire : et les vrais humains ?" },
      { id: "sec-exos", title: "Exercices récapitulatifs" },
      { id: "sec-final", title: "QCM final & checklist de maîtrise" },
    ],
    tpSessions: [3],
  },
  {
    id: "b4",
    part: "B",
    code: "B4",
    slug: "b4",
    title: "Jeux bayésiens",
    tagline: "Jouer sans connaître l'adversaire : types, croyances et équilibre bayésien.",
    description:
      "Information incomplète : types et croyances, la Nature, dilemme du prisonnier et bataille des sexes bayésiens, équilibre de Nash bayésien, forme extensive et screening.",
    color: {
      gradient: "from-indigo-500 to-blue-700",
      badge: "bg-indigo-100 text-indigo-800",
      text: "text-indigo-700",
      soft: "bg-indigo-50",
    },
    sections: [
      { id: "s0", title: "Où en est-on dans le cours ?" },
      { id: "s1", title: "L'information incomplète, c'est quoi ?" },
      { id: "s2", title: "Types, croyances & la Nature" },
      { id: "s3", title: "Le dilemme du prisonnier bayésien" },
      { id: "s4", title: "Les stratégies deviennent des règles d'action" },
      { id: "s5", title: "La bataille des sexes bayésienne" },
      { id: "s6", title: "L'équilibre de Nash bayésien (ENB)" },
      { id: "s7", title: "La forme extensive : dessiner l'incertitude" },
      { id: "s8", title: "Le screening : faire parler l'information" },
      { id: "s9", title: "À maîtriser absolument" },
      { id: "s10", title: "Exercices corrigés" },
    ],
    tpSessions: [4],
  },
];

const strategiesTpData: TpSessionData[] = [
  {
    number: 1,
    slug: "session-1",
    scope: "tp1",
    title: "La décision individuelle",
    subtitle:
      "Efficacité de Pareto, offre de travail et taxation, épargne inter-temporelle, self-contrôle, risque et assurance.",
    exerciseCount: 8,
    chapters: ["a1", "a2", "a3"],
    topics: [
      "Efficacité de Pareto",
      "Lagrangien : offre de travail & taxe",
      "Épargne à deux périodes",
      "Self-contrôle (β) : l'abonnement fitness",
      "Utilité espérée & choix risqué",
      "Investissement optimal",
      "Assurance optimale",
      "Cadrage étroit",
    ],
  },
  {
    number: 2,
    slug: "session-2",
    scope: "tp2",
    title: "Jeux simultanés",
    subtitle:
      "Stratégies dominantes, élimination itérative, équilibres de Nash en stratégies pures et mixtes sur des jeux classiques et appliqués.",
    exerciseCount: 5,
    chapters: ["b1"],
    topics: [
      "Dominance et équilibre en stratégies dominantes",
      "PSS : profils survivant à l'élimination itérative",
      "Équilibres de Nash",
      "Jeux classiques (dilemme, bataille des sexes, matching pennies)",
      "Stratégies mixtes : fraude fiscale et audit",
    ],
  },
  {
    number: 3,
    slug: "session-3",
    scope: "tp3",
    title: "Jeux séquentiels & duopole",
    subtitle:
      "Forme extensive, sous-jeux, équilibre de Nash parfait en sous-jeux (ENPS), duopole de Cournot et cartel de l'OPEP.",
    exerciseCount: 4,
    chapters: ["b1", "b3"],
    topics: [
      "« Brûler ses navires » : engagement crédible",
      "Sous-jeux et backward induction",
      "ENPS dans un jeu à trois joueurs",
      "Cournot : fonctions de meilleure réponse, cartel de l'OPEP",
    ],
  },
  {
    number: 4,
    slug: "session-4",
    scope: "tp4",
    title: "Jeux bayésiens & contrats",
    subtitle:
      "Équilibre de Nash bayésien en duopole, information incomplète, et conception d'un contrat salarial incitatif.",
    exerciseCount: 3,
    chapters: ["b4", "b2"],
    topics: [
      "Duopole avec coûts privés : équilibre de Nash bayésien",
      "Jeu bayésien en forme normale",
      "Contrat principal-agent : salaire w(π) = a + bπ",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Construction des cours                                              */
/* ------------------------------------------------------------------ */

/** Injecte le champ `course` dans les données brutes d'un cours. */
function buildCourse(
  meta: Omit<Course, "parts" | "chapters" | "tpSessions">,
  parts: Part[],
  chaptersData: ChapterData[],
  tpData: TpSessionData[],
): Course {
  return {
    ...meta,
    parts,
    chapters: chaptersData.map((c) => ({ ...c, course: meta.id })),
    tpSessions: tpData.map((t) => ({ ...t, course: meta.id })),
  };
}

const strategiesCourse: Course = buildCourse(
  {
    id: "strategies",
    slug: "strategies",
    code: "ECGEB366",
    title: "Stratégies et Décisions Économiques",
    shortTitle: "Stratégies économiques",
    tagline: "La décision individuelle et les interactions stratégiques.",
    description:
      "Comment un individu choisit seul (préférences, temps, risque), puis comment les choix s'entremêlent : théorie des jeux, contrats et incitations, coopération répétée et information incomplète.",
    theme: {
      gradient: "from-indigo-600 to-violet-700",
      badge: "bg-indigo-100 text-indigo-800",
      text: "text-indigo-700",
      soft: "bg-indigo-50",
    },
  },
  strategiesParts,
  strategiesChaptersData,
  strategiesTpData,
);

/** Tous les cours de la plateforme. Le contenu d'un cours peut être vide
 * (chapitres/TP à venir) : la home l'affichera comme « bientôt disponible ». */
export const courses: Course[] = [strategiesCourse];

/* ------------------------------------------------------------------ */
/* Helpers (bornés au cours)                                           */
/* ------------------------------------------------------------------ */

export function getCourse(idOrSlug: string): Course {
  const c = courses.find((co) => co.id === idOrSlug || co.slug === idOrSlug);
  if (!c) throw new Error(`Cours inconnu : ${idOrSlug}`);
  return c;
}

export function findCourse(idOrSlug: string): Course | undefined {
  return courses.find((co) => co.id === idOrSlug || co.slug === idOrSlug);
}

export function getChapter(courseId: CourseId, chapterId: string): Chapter {
  const c = getCourse(courseId).chapters.find((ch) => ch.id === chapterId || ch.slug === chapterId);
  if (!c) throw new Error(`Chapitre inconnu : ${courseId}/${chapterId}`);
  return c;
}

export function findChapterBySlug(courseId: CourseId, slug: string): Chapter | undefined {
  return getCourse(courseId).chapters.find((ch) => ch.slug === slug);
}

export function getSection(
  courseId: CourseId,
  chapterId: string,
  sectionId: string,
): ChapterSection | undefined {
  return getChapter(courseId, chapterId).sections.find((s) => s.id === sectionId);
}

export function adjacentChapters(
  courseId: CourseId,
  chapterId: string,
): { prev?: Chapter; next?: Chapter } {
  const list = getCourse(courseId).chapters;
  const idx = list.findIndex((c) => c.id === chapterId);
  return {
    prev: idx > 0 ? list[idx - 1] : undefined,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined,
  };
}

export function getTpSession(courseId: CourseId, number: number): TpSession {
  const s = getCourse(courseId).tpSessions.find((t) => t.number === number);
  if (!s) throw new Error(`Séance de TP inconnue : ${courseId}/${number}`);
  return s;
}

export function findTpSessionBySlug(courseId: CourseId, slug: string): TpSession | undefined {
  return getCourse(courseId).tpSessions.find((t) => t.slug === slug);
}
