/*
 * Après le build Vite, l'entrée SPA est émise sous dist/client/_shell.html.
 * Les hébergeurs statiques servent index.html : on la crée donc à partir du
 * shell pour que le site soit déployable tel quel sur N'IMPORTE quel hébergeur
 * (Vercel, Cloudflare Pages, Netlify, GitHub Pages…), sans dépendre d'une
 * commande de build spécifique à une plateforme.
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.cwd(), "dist/client");
const shell = resolve(dir, "_shell.html");
const index = resolve(dir, "index.html");

if (!existsSync(shell)) {
  console.error("[postbuild] dist/client/_shell.html introuvable — le build a-t-il réussi ?");
  process.exit(1);
}

copyFileSync(shell, index);
console.log("[postbuild] dist/client/index.html créé depuis _shell.html");
