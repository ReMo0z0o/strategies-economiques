/*
 * Génère les PDF des examens blancs (énoncés + corrigés).
 *
 * Chaque examen vit dans exams/<id>/ avec :
 *   - meta.json          : titre, durée, barème (page de garde auto-générée)
 *   - enonce-body.html   : fragment HTML des questions (cadres de réponse vides)
 *   - corrige-body.html  : fragment HTML du corrigé détaillé
 *
 * Le script enveloppe chaque fragment avec le template (exam.css + KaTeX
 * auto-render), l'ouvre dans Chromium headless et imprime en A4 vers
 * public/examens/<id>-{enonce|corrige}.pdf (pagination en pied de page).
 *
 * Usage : node exams/build.mjs [id …]   (sans argument : tous les examens)
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMS_DIR = join(ROOT, "exams");
const OUT_DIR = join(ROOT, "public", "examens");
const KATEX = join(ROOT, "node_modules", "katex", "dist");
const CHROMIUM =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

const RULES_ENONCE = (duration) => `
  <div class="rules">
    <h3>Règles</h3>
    <ul>
      <li>Cette évaluation à livre fermé dure <strong>${duration}</strong>.</li>
      <li>Vous pouvez utiliser une calculatrice, mais pas votre smartphone.</li>
      <li>Lisez attentivement les questions et ne répondez qu'à ce qui est demandé.</li>
      <li>Répondez uniquement dans les cadres.</li>
      <li>Détaillez vos réponses.</li>
      <li>Vous pouvez écrire au stylo, au bic, au crayon… tant que votre écriture est lisible.</li>
    </ul>
  </div>`;

function coverEnonce(meta) {
  const heads = meta.questions.map((q) => `<th>Q${q.n}</th>`).join("");
  const scores = meta.questions.map(() => `<td></td>`).join("");
  const pts = meta.questions.map((q) => `<td>/${q.points}</td>`).join("");
  return `
  <section class="cover">
    <div class="identity">
      <span class="field">PRÉNOM : <span class="blank"></span></span>
      <span class="field">NOM : <span class="blank"></span></span>
    </div>
    <div class="identity">
      <span class="field">NOMA (n° étudiant) : <span class="blank"></span></span>
    </div>
    <div class="title-block">
      <div class="kind">${meta.kind}</div>
      <div class="code">ECGEB366</div>
      <div class="project">Projet : stratégies et décisions économiques</div>
      <div class="session">${meta.part}</div>
      <div class="tagline">${meta.tagline ?? ""}</div>
    </div>
    ${RULES_ENONCE(meta.duration)}
    <table class="points-table">
      <tr>${heads}<th>TOTAL</th></tr>
      <tr class="score">${scores}<td></td></tr>
      <tr>${pts}<td>/${meta.total}</td></tr>
    </table>
    <div class="warning">
      Examen blanc d'entraînement (non officiel), rédigé dans le format des évaluations
      des années précédentes et calibré sur la matière actuelle du cours. Entraîne-toi en
      conditions réelles : ${meta.duration}, sans notes, calculatrice autorisée.
    </div>
  </section>`;
}

function headerCorrige(meta) {
  const bar = meta.questions.map((q) => `Q${q.n} /${q.points}`).join(" · ");
  return `
  <section style="margin-bottom:0.8cm">
    <div style="text-align:center">
      <div style="font-size:16pt;font-weight:bold">${meta.kind} — CORRIGÉ</div>
      <div style="font-size:12.5pt;margin-top:0.2cm">ECGEB366 · ${meta.part}</div>
      <div class="note" style="margin-top:0.25cm">Durée de l'épreuve : ${meta.duration} · Barème : ${bar} · Total /${meta.total}</div>
    </div>
    <hr style="margin-top:0.5cm;border:none;border-top:1.2px solid #111827">
  </section>`;
}

function wrap(meta, inner) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(join(KATEX, "katex.min.css")).href}">
<link rel="stylesheet" href="${pathToFileURL(join(EXAMS_DIR, "template", "exam.css")).href}">
<script src="${pathToFileURL(join(KATEX, "katex.min.js")).href}"></script>
<script src="${pathToFileURL(join(KATEX, "contrib", "auto-render.min.js")).href}"></script>
</head>
<body>
${inner}
</body>
</html>`;
}

async function renderPdf(browser, html, outPath, tmpPath) {
  writeFileSync(tmpPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(tmpPath).href, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    // eslint-disable-next-line no-undef
    renderMathInElement(document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  });
  await page.waitForTimeout(250);
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate:
      '<div style="width:100%;text-align:center;font-size:8.5px;color:#6b7280;font-family:Arial">' +
      '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    margin: { top: "1.5cm", bottom: "1.7cm", left: "1.7cm", right: "1.7cm" },
  });
  await page.close();
  rmSync(tmpPath, { force: true });
}

const requested = process.argv.slice(2);
const ids = readdirSync(EXAMS_DIR).filter(
  (d) =>
    statSync(join(EXAMS_DIR, d)).isDirectory() &&
    d !== "template" &&
    (requested.length === 0 || requested.includes(d)),
);

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const id of ids) {
  const dir = join(EXAMS_DIR, id);
  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  const enonce = readFileSync(join(dir, "enonce-body.html"), "utf8");
  const corrige = readFileSync(join(dir, "corrige-body.html"), "utf8");

  await renderPdf(
    browser,
    wrap(meta, coverEnonce(meta) + enonce),
    join(OUT_DIR, `${id}-enonce.pdf`),
    join(dir, ".tmp-enonce.html"),
  );
  await renderPdf(
    browser,
    wrap(meta, headerCorrige(meta) + corrige),
    join(OUT_DIR, `${id}-corrige.pdf`),
    join(dir, ".tmp-corrige.html"),
  );
  console.log(`✓ ${id} → ${id}-enonce.pdf + ${id}-corrige.pdf`);
}

await browser.close();
console.log(`\nPDF écrits dans public/examens/ (${ids.length} examen(s)).`);
