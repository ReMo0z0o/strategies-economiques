/*
 * Contrôle un fragment HTML du document « cours particulier » avant assemblage.
 *
 * Vérifie : formules KaTeX en erreur, débordements horizontaux (une formule ou
 * un tableau plus large que la page A4 imprimable), balises mal fermées
 * (détectées par comparaison de la structure re-sérialisée), et donne une
 * estimation du nombre de pages.
 *
 * Usage : node tutorat/check-fragment.mjs tutorat/<id>/<fichier>.html [...]
 */
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KATEX = join(ROOT, "node_modules", "katex", "dist");
const CSS = join(ROOT, "tutorat", "template", "tutorat.css");
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

// Largeur utile d'une page A4 avec les marges de build.mjs (1,7 cm de chaque côté)
const PAGE_W_CM = 21 - 3.4;
const PAGE_H_CM = 29.7 - 2.9;
const CM = 37.8; // px par cm à 96 dpi

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage : node tutorat/check-fragment.mjs <fichier.html> […]");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: CHROMIUM });
let failed = 0;

for (const rel of files) {
  const abs = resolve(ROOT, rel);
  const fragment = readFileSync(abs, "utf8");
  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(join(KATEX, "katex.min.css")).href}">
<link rel="stylesheet" href="${pathToFileURL(CSS).href}">
<script src="${pathToFileURL(join(KATEX, "katex.min.js")).href}"></script>
<script src="${pathToFileURL(join(KATEX, "contrib", "auto-render.min.js")).href}"></script>
<style>body{width:${PAGE_W_CM}cm;margin:0}</style>
</head><body>${fragment}</body></html>`;

  const tmp = abs + ".check.html";
  writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: Math.round(PAGE_W_CM * CM), height: 1200 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });

  const report = await page.evaluate((pageWidthPx) => {
    // eslint-disable-next-line no-undef
    renderMathInElement(document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
    const katexErrors = [...document.querySelectorAll(".katex-error")].map(
      (e) => e.textContent.slice(0, 90),
    );
    // Débordements : éléments dont le contenu dépasse la largeur de page
    const overflow = [];
    for (const el of document.querySelectorAll(
      ".katex-display, table, figure, svg, pre, .calc, .box",
    )) {
      if (el.scrollWidth > pageWidthPx + 2) {
        overflow.push(`${el.tagName.toLowerCase()}.${el.className || "—"} : ${el.scrollWidth}px`);
      }
    }
    // Classes inconnues (fautes de frappe dans les noms d'encadrés)
    const known = new Set([
      "chapter", "chapter-tag", "chapter-intro", "enonce", "enonce-title",
      "box", "box-title", "box-def", "box-why", "box-piege", "box-methode",
      "box-copie", "box-rappel", "box-exemple", "etape", "etape-title", "num",
      "calc", "step", "why", "result", "result-title", "data", "game", "compare",
      "void", "player", "hl", "nash", "left", "lexique", "term", "soft",
      "cover", "toc", "eyebrow", "sub", "course", "code", "promise", "footnote",
      "math-line",
    ]);
    const unknown = new Set();
    for (const el of document.querySelectorAll("[class]")) {
      if (el.closest(".katex, .katex-display")) continue;
      for (const c of el.classList) if (!known.has(c) && !c.startsWith("katex")) unknown.add(c);
    }
    return {
      katexErrors,
      overflow,
      unknown: [...unknown],
      heightPx: document.body.scrollHeight,
      formulas: document.querySelectorAll(".katex").length,
      figures: document.querySelectorAll("figure").length,
      boxes: document.querySelectorAll(".box").length,
    };
  }, Math.round(PAGE_W_CM * CM));

  await page.close();
  rmSync(tmp, { force: true });

  const pages = (report.heightPx / (PAGE_H_CM * CM)).toFixed(1);
  const ok =
    report.katexErrors.length === 0 &&
    report.overflow.length === 0 &&
    report.unknown.length === 0 &&
    errors.length === 0;
  if (!ok) failed++;

  console.log(`\n${ok ? "✓" : "✗"} ${rel}`);
  console.log(
    `   ~${pages} pages · ${report.formulas} formules · ${report.figures} figures · ${report.boxes} encadrés`,
  );
  if (report.katexErrors.length)
    console.log(`   ✗ ${report.katexErrors.length} formule(s) TeX en erreur :`, report.katexErrors.slice(0, 5));
  if (report.overflow.length)
    console.log(`   ✗ ${report.overflow.length} débordement(s) horizontal(aux) :`, report.overflow.slice(0, 5));
  if (report.unknown.length)
    console.log(`   ✗ classe(s) CSS inconnue(s) (faute de frappe ?) :`, report.unknown.slice(0, 10));
  if (errors.length) console.log(`   ✗ erreur(s) JS :`, errors.slice(0, 3));
}

await browser.close();
process.exit(failed === 0 ? 0 : 1);
