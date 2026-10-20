/*
 * Chapitre B2 — Jeux séquentiels (nouveau cours ECGEB366, deck « B2. Jeux
 * séquentiels » de B. Decerf).
 *
 * Jeu de l'entrée et menace non crédible, forme étendue et arbre du jeu,
 * stratégie = plan d'action complet, sous-jeux et équilibre de Nash parfait
 * en sous-jeux (ENPS), backward induction (H1, H2.1, H2.2…), application aux
 * primaires, comportements en laboratoire (jeu de base, ultimatum,
 * centipède), information imparfaite (marché public, ensembles
 * d'information) et stratégies mixtes dans un sous-jeu simultané.
 */

import { ChapterShell } from "@/components/course/ChapterShell";
import { PartFondements } from "./bseq/part-fondements";
import { PartApplications } from "./bseq/part-applications";
import { PartImparfaite } from "./bseq/part-imparfaite";

export default function Chapter() {
  return (
    <ChapterShell chapterId="bseq">
      <PartFondements />
      <PartApplications />
      <PartImparfaite />
    </ChapterShell>
  );
}
