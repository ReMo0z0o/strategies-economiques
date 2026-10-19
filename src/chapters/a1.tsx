/*
 * Chapitre A1 — Préférences et choix.
 *
 * Conversion fidèle du manuel interactif « A1 · Préférences et choix »
 * (cours ECGEB366, B. Decerf) : le modèle du choix rationnel (offre de
 * travail, préférences, courbes d'indifférence, Lagrangien, redistribution,
 * Laffer, Pareto) puis l'économie comportementale (utilité de transaction,
 * coûts irrécupérables, effet de dotation, framing, nudges).
 */

import { ChapterShell } from "@/components/course/ChapterShell";
import { PartRationnel } from "./a1/part-rationnel";
import { PartComportemental } from "./a1/part-comportemental";
import { PartSynthese } from "./a1/part-synthese";

export default function Chapter() {
  return (
    <ChapterShell chapterId="a1">
      <PartRationnel />
      <PartComportemental />
      <PartSynthese />
    </ChapterShell>
  );
}
