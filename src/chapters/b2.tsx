/*
 * Chapitre B2.2 — Jeux séquentiels appliqués à la théorie des contrats.
 *
 * Conversion fidèle du manuel interactif « B2 · Théorie des contrats »
 * (cours ECGEB366, d'après les slides de B. Decerf) : le problème de
 * l'agence et l'aléa moral, le modèle principal-agent (technologie,
 * contrat, payoffs, timing), les trois contrats (fixe, proportionnel,
 * linéaire) résolus par backward induction, les contraintes CP et CI,
 * la franchise et le residual claimant, puis l'agent averse au risque.
 */

import { ChapterShell } from "@/components/course/ChapterShell";
import { PartModele } from "./b2/part-modele";
import { PartContrats } from "./b2/part-contrats";
import { PartRisque } from "./b2/part-risque";

export default function Chapter() {
  return (
    <ChapterShell chapterId="b2">
      <PartModele />
      <PartContrats />
      <PartRisque />
    </ChapterShell>
  );
}
