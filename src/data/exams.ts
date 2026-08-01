import type { CourseId } from "@/data/course";

/*
 * Registre des examens blancs téléchargeables (PDF générés par exams/build.mjs
 * dans public/examens/). Chaque examen a un énoncé (à imprimer pour s'entraîner
 * en conditions réelles) et un corrigé détaillé.
 */

export interface MockExam {
  /** id = préfixe des fichiers PDF (ex. "p1-blanc-1") */
  id: string;
  course: CourseId;
  number: number;
  title: string;
  duration: string;
  totalPoints: number;
  questionCount: number;
  description: string;
  coverage: string[];
}

export const mockExams: MockExam[] = [
  {
    id: "p1-blanc-1",
    course: "strategies",
    number: 1,
    title: "Examen blanc n° 1",
    duration: "2h",
    totalPoints: 200,
    questionCount: 5,
    description:
      "Le tour d'horizon classique : concepts de choix et de Pareto, décision face au risque, jeux simultanés purs et mixtes, contrat principal-agent et coopération répétée.",
    coverage: [
      "Préférences, Pareto & comportemental (A1)",
      "Incertitude & assurance (A3)",
      "Jeux simultanés & stratégies mixtes (B1)",
      "Contrat principal-agent (B2)",
      "Jeux répétés (B3)",
    ],
  },
  {
    id: "p1-blanc-2",
    course: "strategies",
    number: 2,
    title: "Examen blanc n° 2",
    duration: "2h",
    totalPoints: 200,
    questionCount: 5,
    description:
      "L'accent sur la dynamique : self-contrôle et commitment, investissement risqué, un grand jeu séquentiel en forme extensive, collusion répétée et concepts transversaux.",
    coverage: [
      "Décision inter-temporelle & self-contrôle (A2)",
      "Investissement risqué (A3)",
      "Jeu séquentiel & ENPS (B1/B3)",
      "Collusion en jeu répété (B3)",
      "Concepts : biais, commitment, information incomplète (A1/A2/B4)",
    ],
  },
  {
    id: "p1-blanc-3",
    course: "strategies",
    number: 3,
    title: "Examen blanc n° 3",
    duration: "2h",
    totalPoints: 200,
    questionCount: 5,
    description:
      "Le plus technique : Lagrangien et redistribution, loteries et prime de risque, jeu bayésien complet, stratégies mixtes et le lien Stackelberg ↔ perfection en sous-jeux.",
    coverage: [
      "Offre de travail & redistribution (A1)",
      "Loteries & prime de risque (A3)",
      "Jeu bayésien (B4)",
      "Stratégies mixtes (B1)",
      "Stackelberg & ENPS (B1/B3)",
    ],
  },
  {
    id: "p2-blanc-1",
    course: "industrielle",
    number: 1,
    title: "Examen blanc n° 1",
    duration: "1h",
    totalPoints: 100,
    questionCount: 3,
    description:
      "Le socle du cours : l'analyse complète du monopole (Lerner, surplus, perte sèche), la discrimination par les prix et le paradoxe de Bertrand avec coûts asymétriques.",
    coverage: [
      "Monopole, Lerner & perte sèche (EI1)",
      "Discrimination par les prix (EI3)",
      "Bertrand asymétrique (EI2)",
    ],
  },
  {
    id: "p2-blanc-2",
    course: "industrielle",
    number: 2,
    title: "Examen blanc n° 2",
    duration: "1h",
    totalPoints: 100,
    questionCount: 3,
    description:
      "Calqué sur le test le plus récent : la grande chaîne monopole → Cournot → Stackelberg → dissuasion d'entrée, puis effets de réseau et régulation du monopole.",
    coverage: [
      "Monopole → Cournot → Stackelberg → entrée (EI2)",
      "Effets de réseau (EI4)",
      "Régulation & taxation du monopole (EI1)",
    ],
  },
  {
    id: "p2-blanc-3",
    course: "industrielle",
    number: 3,
    title: "Examen blanc n° 3",
    duration: "1h",
    totalPoints: 100,
    questionCount: 3,
    description:
      "Les stratégies de prix avancées : tarif en deux parties et double marginalisation, concurrence en prix avec biens différenciés, et l'indice de Lerner à n firmes.",
    coverage: [
      "Deux parties & double marge (EI3)",
      "Bertrand différencié (EI2)",
      "Lerner & Cournot à n firmes (EI1/EI2)",
    ],
  },
];

export function examsForCourse(courseId: CourseId): MockExam[] {
  return mockExams.filter((e) => e.course === courseId);
}

export function examPdfUrl(id: string, kind: "enonce" | "corrige"): string {
  return `/examens/${id}-${kind}.pdf`;
}
