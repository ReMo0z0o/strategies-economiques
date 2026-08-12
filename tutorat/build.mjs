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
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "tutorat");
const OUT_DIR = join(DIR, "out");
const KATEX = join(ROOT, "node_modules", "katex", "dist");
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";
// Interpréteur disposant de pypdf, pour relever les numéros de page du sommaire.
const PYTHON = process.env.PYTHON_BIN ?? "/tmp/pv/bin/python";

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
    ${howto(meta)}
    <div class="footnote">${meta.footnote}</div>
  </section>`;
}

/*
 * Encadré « comment lire ce document » de la page de garde.
 *
 * Chaque document a son mode d'emploi : `meta.howto = { title, lead, items[] }`.
 * À défaut, on retombe sur celui des volumes « cours particulier », pour que les
 * documents déjà produits se reconstruisent à l'identique.
 */
const HOWTO_DEFAUT = {
  title: "Comment lire ce document",
  lead:
    "Ce document est écrit pour quelqu'un qui <strong>part de zéro</strong> : on ne suppose " +
    "aucune connaissance préalable du cours. Chaque question de l'examen est reprise, puis " +
    "expliquée intégralement — y compris les notions des chapitres précédents dont elle a besoin.",
  items: [
    "<strong>Le chapitre 0</strong> est la boîte à outils : le vocabulaire et les maths " +
      "nécessaires. Lis-le en premier, tout le reste s'appuie dessus.",
    "<strong>Chaque chapitre suivant</strong> traite une question : l'énoncé rappelé, le cours " +
      "dont elle a besoin, la résolution où <em>chaque</em> ligne de calcul est justifiée, puis " +
      "la réponse telle qu'il fallait l'écrire sur la copie.",
    "<strong>Les encadrés colorés</strong> se lisent d'un coup d'œil : bleu = définition, " +
      "orange = pourquoi on fait ça, rouge = piège, turquoise = méthode réutilisable, " +
      "vert = ce qu'il fallait écrire.",
    "<strong>Le lexique final</strong> reprend tous les termes, à consulter dès qu'un mot te bloque.",
  ],
};

function howto(meta) {
  const h = meta.howto ?? HOWTO_DEFAUT;
  const items = (h.items ?? []).map((li) => `<li>${li}</li>`).join("");
  return `<div class="promise">
      <h3>${h.title}</h3>
      ${h.lead ? `<p>${h.lead}</p>` : ""}
      ${items ? `<ul>${items}</ul>` : ""}
    </div>`;
}

/* Marqueur invisible fermant le sommaire : il sert à l'extracteur de pages
 * pour savoir à partir d'où chercher les titres (le sommaire les contient tous). */
const TOC_MARKER = "FinDuSommaireQ7X";

/*
 * Titres réels du document : un h1 par chapitre, puis ses h2.
 *
 * Chaque entrée porte deux formes. `display` conserve les délimiteurs
 * mathématiques, pour que KaTeX rende la formule dans le sommaire comme dans le
 * titre. `key` en est débarrassée : Chromium n'expose pas de table Unicode
 * exploitable pour les glyphes des polices KaTeX, si bien que les formules
 * n'apparaissent pas du tout dans le texte extrait du PDF — les inclure dans la
 * clé de recherche rendrait le titre introuvable.
 */
function headings(body) {
  const out = [];
  const re = /<(h1|h2)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    const display = m[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
    const key = display
      .replace(/\\\([\s\S]*?\\\)/g, " ")
      .replace(/\\\[[\s\S]*?\\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (display) out.push({ level: m[1].toLowerCase(), display, key });
  }
  return out;
}

/** Sommaire avec conducteurs de points et numéros de page (si connus). */
function toc(entries, pages) {
  const items = entries
    .map((e, i) => {
      const n = pages?.[i];
      return (
        `<li class="toc-line ${e.level === "h1" ? "lvl1" : "lvl2"}">` +
        `<span class="t">${e.display}</span>` +
        `<span class="dots"></span>` +
        `<span class="p">${n ?? "—"}</span>` +
        `</li>`
      );
    })
    .join("");
  return `
  <section class="toc">
    <h2>Sommaire</h2>
    <p class="toc-hint">
      Les numéros renvoient aux pages de ce document. Les entrées en gras sont les chapitres ;
      les entrées en retrait, leurs sections.
    </p>
    <ul class="toc-list">${items}</ul>
    <span style="font-size:1px;color:#ffffff">${TOC_MARKER}</span>
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

/** Numéros de page de chaque titre, relevés dans le PDF déjà rendu. */
function locatePages(pdfPath, entries, running) {
  const input = JSON.stringify({
    pdf: pdfPath,
    marker: TOC_MARKER,
    running,
    titles: entries.map((e) => e.key),
  });
  const res = spawnSync(PYTHON, [join(DIR, "pdf-pages.py")], { input, encoding: "utf8" });
  if (res.status !== 0) {
    console.warn(`  ⚠ pagination du sommaire indisponible : ${(res.stderr || "").trim()}`);
    return null;
  }
  return JSON.parse(res.stdout);
}

for (const id of ids) {
  const dir = join(DIR, id);
  const meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  const fragments = meta.chapters.map((c) => readFileSync(join(dir, c.file), "utf8"));
  const body = fragments.join("\n");

  /*
   * Entrées du sommaire. Pour un chapitre, on affiche l'intitulé de meta.json
   * (il porte le numéro de chapitre, absent du <h1> du fragment) mais on
   * localise la page grâce au <h1> réel. Pour les sections, le <h2> sert des
   * deux côtés.
   */
  const entries = [];
  meta.chapters.forEach((c, i) => {
    const hs = headings(fragments[i]);
    const h1 = hs.find((h) => h.level === "h1");
    entries.push({ level: "h1", display: c.title, key: h1 ? h1.key : c.title });
    for (const h of hs) if (h.level === "h2") entries.push(h);
  });
  const out = join(OUT_DIR, meta.filename || `${id}-cours-particulier.pdf`);
  const tmp = join(dir, ".tmp.html");
  const title = `${meta.title} — ${meta.part}`;

  /*
   * Deux passes : la première produit le document avec un sommaire dont les
   * numéros sont inconnus, la seconde le reproduit avec les numéros relevés.
   * Le nombre de lignes du sommaire ne changeant pas, la pagination est stable ;
   * on la revérifie tout de même et on recommence une fois si besoin.
   */
  let pages = null;
  for (let pass = 1; pass <= 3; pass++) {
    await renderPdf(browser, wrap(cover(meta) + toc(entries, pages) + body), out, tmp, title);
    const found = locatePages(out, entries, title);
    if (!found) break;
    const stable = pages && found.every((p, i) => p === pages[i]);
    pages = found;
    if (stable) break;
    if (pass === 3) {
      await renderPdf(browser, wrap(cover(meta) + toc(entries, pages) + body), out, tmp, title);
    }
  }
  const missing = pages ? pages.filter((p) => p === null).length : entries.length;
  console.log(
    `✓ ${id} → ${out}\n   sommaire : ${entries.length} entrées` +
      (missing ? `, ${missing} sans numéro de page` : ", toutes paginées"),
  );
}

await browser.close();
console.log(`\nPDF écrit(s) dans tutorat/out/ (${ids.length} document(s)).`);
