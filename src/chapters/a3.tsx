/**
 * Chapitre A3 · Décision sous incertitude.
 * Conversion fidèle du manuel interactif HTML : loteries et VMA, utilité
 * espérée de von Neumann–Morgenstern, attitudes face au risque, équivalent
 * certain et prime de risque, investissement, diversification, assurance,
 * puis théorie des perspectives, cadrage étroit et biais de probabilité.
 * Les 6 widgets du manuel sont recréés en React/SVG dans ./a3/widgets.
 */
import { ChapterShell } from "@/components/course/ChapterShell";
import { PartTheorie } from "./a3/part-theorie";
import { PartApplications } from "./a3/part-applications";
import { PartComportemental } from "./a3/part-comportemental";
import { PartSynthese } from "./a3/part-synthese";

export default function Chapter() {
  return (
    <ChapterShell chapterId="a3">
      <PartTheorie />
      <PartApplications />
      <PartComportemental />
      <PartSynthese />
    </ChapterShell>
  );
}
