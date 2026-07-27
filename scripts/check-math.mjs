/*
 * Vérifie que TOUTES les formules TeX du cours sont valides.
 *
 * En production, le composant Math rend les formules avec throwOnError: false :
 * une formule invalide n'empêche pas la page de s'afficher, mais apparaît en
 * rouge à l'écran (message d'erreur KaTeX) au lieu de la formule attendue.
 * Ce script rejoue toutes les formules avec throwOnError: true pour attraper
 * ces cas AVANT la mise en ligne.
 *
 * Piège classique attrapé ici : le caractère % démarre un commentaire en LaTeX
 * et avale la fin de la formule — il faut écrire \%.
 *
 * Usage : npm run check:math
 */
import katex from "katex";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

// Les avertissements « No character metrics for … » (€, ①…) sont bénins :
// KaTeX rend le caractère avec une police de repli. On les masque.
const origWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].startsWith("No character metrics")) return;
  origWarn(...args);
};

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p)) files.push(p);
  }
})(SRC);

const failures = [];
let checked = 0;
let dynamic = 0;

function validate(tex, file, line) {
  checked += 1;
  try {
    katex.renderToString(tex, { throwOnError: true, strict: false });
  } catch (err) {
    failures.push({ file: relative(SRC, file), line, tex, message: String(err.message) });
  }
}

for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      // tex="…" : attribut JSX, contenu littéral (les backslashes ne sont pas échappés)
      for (const m of line.matchAll(/tex="([^"]*)"/g)) validate(m[1], file, i + 1);
      // tex={`…`} : gabarit ; ignoré s'il contient une interpolation
      for (const m of line.matchAll(/tex=\{`([^`]*)`\}/g)) {
        if (m[1].includes("${")) dynamic += 1;
        else validate(m[1], file, i + 1);
      }
    });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} formule(s) TeX invalide(s) :\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    ${f.tex}`);
    console.error(`    → ${f.message}\n`);
  }
  process.exit(1);
}

console.log(
  `✓ ${checked} formules TeX valides (${files.length} fichiers, ${dynamic} formules dynamiques ignorées).`,
);
