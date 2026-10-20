/*
 * Chapitre B1 — Jeux simultanés.
 *
 * Conversion fidèle du manuel interactif « B1 · Jeux simultanés » (cours
 * ECGEB366, B. Decerf) : forme normale, stratégies dominantes et dominées
 * (H1), élimination itérative et PSS (H2), équilibre de Nash (H3), les jeux
 * célèbres et leurs applications (climat, paniques bancaires…), les données
 * de laboratoire du cours, puis les stratégies mixtes (pénalty, théorème
 * d'indifférence, police vs mafia).
 */

import { ChapterShell } from "@/components/course/ChapterShell";
import { PartFondements } from "./b1/part-fondements";
import { PartEquilibre } from "./b1/part-equilibre";
import { PartMixtes } from "./b1/part-mixtes";

export default function Chapter() {
  return (
    <ChapterShell chapterId="b1">
      <PartFondements />
      <PartEquilibre />
      <PartMixtes />
    </ChapterShell>
  );
}
