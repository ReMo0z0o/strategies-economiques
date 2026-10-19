/**
 * Chapitre A2 · Décision inter-temporelle.
 * Conversion fidèle du manuel interactif HTML (épargne, impatience,
 * self-contrôle) : tout le contenu pédagogique de la source est porté,
 * les widgets sont recréés en React/SVG dans ./a2/widgets.
 */
import { ChapterShell } from "@/components/course/ChapterShell";
import { PartRationnel } from "./a2/part-rationnel";
import { PartComportemental } from "./a2/part-comportemental";
import { PartSynthese } from "./a2/part-synthese";

export default function Chapter() {
  return (
    <ChapterShell chapterId="a2">
      <PartRationnel />
      <PartComportemental />
      <PartSynthese />
    </ChapterShell>
  );
}
