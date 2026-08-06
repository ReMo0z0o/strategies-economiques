/*
 * Génère le PDF « cours particulier » d'un examen blanc.
 *
 * Un dossier tutorat/<id>/ contient :
 *   - meta.json  : titre, sous-titre, liste ordonnée des fragments
 *   - *.html     : les fragments (un par chapitre), écrits avec les classes
 *                  de tutorat/template/tutorat.css
 *
 * Le script assemble page de garde + sommaire + fragments, fait rendre les
 * formules par KaTeX dans Chromium headless, et imprime en A4 vers
 * tutorat/out/<id>-cours-particulier.pdf.
 *
 * Usage : node tutorat/build.mjs [id …]   (sans argument : tous les dossiers)
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "tutorat");
const OUT_DIR = join(DIR, "out");
const KATEX = join(ROOT, "node_modules", "katex", "dist");
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

function cover(meta) {
  return `
  <section class="cover">
    <div class="eyebrow">${meta.eyebrow}</div>
    <h1>${meta.title}</h1>
    <div class="sub">${meta.subtitle}</div>
    <div class="course">
      <div class="code">${meta.code}</div>
      <div>${meta.project}</div>
      <div>${meta.part}</div>
    </div>
    <div class="promise">
      <h3>Comment lire ce document</h3>
      <p>
        Ce document est écrit pour quelqu'un qui <strong>part de zéro</strong> : on ne suppose
        aucune connaissance préalable du cours. Chaque question de l'examen est reprise, puis
        expliquée intégralement — y compris les notions des chapitres précédents dont elle a besoin.
      </p>
      <ul>
        <li><strong>Le chapitre 0</strong> est la boîte à outils : le vocabulaire et les maths
            nécessaires. Lis-le en premier, tout le reste s'appuie dessus.</li>
        <li><strong>Chaque chapitre suivant</strong> traite une question : l'énoncé rappelé, le
            cours dont elle a besoin, la résolution où <em>chaque</em> ligne de calcul est
            justifiée, puis la réponse telle qu'il fallait l'écrire sur la copie.</li>
        <li><strong>Les encadrés colorés</strong> se lisent d'un coup d'œil : bleu = définition,
            orange = pourquoi on fait ça, rouge = piège, turquoise = méthode réutilisable,
            vert = ce qu'il fallait écrire.</li>
        <li><strong>Le lexique final</strong> reprend tous les termes, à consulter dès qu'un mot
            te bloque.</li>
      </ul>
    </div>
    <div class="footnote">${meta.footnote}</div>
  </section>`;
}

function toc(meta) {
  const items = meta.chapters
    .map((c) => {
      const subs = (c.sections ?? []).map((s) => `<li>${s}</li>`).join("");
      return `<li>${c.title}${subs ? `<ol>${subs}</ol>` : ""}</li>`;
    })
    .join("");
  return `
  <section class="toc">
    <h2>Sommaire</h2>
    <ol>${items}</ol>
  </section>`;
}

function wrap(inner) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(join(KATEX, "katex.min.css")).href}">
<link rel="stylesheet" href="${pathToFileURL(join(DIR, "template", "tutorat.css")).href}">
<script src="${pathToFileURL(join(KATEX, "katex.min.js")).href}"></script>
<script src="${pathToFileURL(join(KATEX, "contrib", "auto-render.min.js")).href}"></script>
</head>
<body>
${inner}
</body>
</html>`;
}

async function renderPdf(browser, html, outPath, tmpPath, footerTitle) {
  writeFileSync(tmpPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(tmpPath).href, { waitUntil: "networkidle" });
  const bad = await page.evaluate(() => {
    // eslint-disable-next-line no-undef
    renderMathInElement(document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
    return document.querySelectorAll(".katex-error").length;
  });
  if (bad > 0) console.warn(`  ⚠ ${bad} formule(s) TeX en erreur`);
  await page.waitForTimeout(300);
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate:
      '<div style="width:100%;padding:0 1.7cm;font-size:7.5px;color:#9ca3af;font-family:Arial">' +
      `<span>${footerTitle}</span></div>`,
    footerTemplate:
      '<div style="width:100%;text-align:center;font-size:8.5px;color:#6b7280;font-family:Arial">' +
      '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: "1.4cm", bottom: "1.5cm", left: "1.7cm", right: "1.7cm" },
  });
  await page.close();
  rmSync(tmpPath, { force: true });
}

const requested = process.argv.slice(2);
const ids = readdirSync(DIR).filter(
  (d) =>
    statSync(join(DIR, d)).isDirectory() &&
    !["template", "out"].includes(d) &&
    (requested.length === 0 || requested.includes(d)),
);

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const id of ids) {
  const dir = join(DIR, id);
  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  const body = meta.chapters.map((c) => readFileSync(join(dir, c.file), "utf8")).join("\n");
  const out = join(OUT_DIR, `${id}-cours-particulier.pdf`);
  await renderPdf(
    browser,
    wrap(cover(meta) + toc(meta) + body),
    out,
    join(dir, ".tmp.html"),
    `${meta.title} — ${meta.part}`,
  );
  console.log(`✓ ${id} → ${out}`);
}

await browser.close();
console.log(`\nPDF écrit(s) dans tutorat/out/ (${ids.length} document(s)).`);
