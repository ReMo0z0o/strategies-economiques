/*
 * Chapitre B3 — Jeux répétés.
 *
 * Conversion fidèle du manuel interactif « B3 · Jeux répétés » (cours
 * ECGEB366, B. Decerf) : le dilemme du fritkot, le cadre des jeux répétés,
 * l'échec de la coopération à deux périodes, le théorème de l'horizon fini,
 * la boîte à outils de l'horizon infini (somme géométrique), « toujours
 * trahir » comme ENPS, la condition δ ≥ 1/2 pour grim-grim, l'interprétation
 * (probabilité de continuation, seuil général), le tournoi d'Axelrod et les
 * données de laboratoire, puis exercices récapitulatifs, QCM final et
 * checklist de maîtrise.
 */

import { ChapterShell } from "@/components/course/ChapterShell";
import { PartFini } from "./b3/part-fini";
import { PartInfini } from "./b3/part-infini";
import { PartPratique } from "./b3/part-pratique";

export default function Chapter() {
  return (
    <ChapterShell chapterId="b3">
      <PartFini />
      <PartInfini />
      <PartPratique />
    </ChapterShell>
  );
}
