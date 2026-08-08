# Consignes communes — volume 2 du « cours particulier »

## Contexte

On produit le **volume 2** d'un PDF de soutien destiné à un étudiant qui ne connaît
**absolument rien** du cours ECGEB366 (Partie 1 — Théorie de la décision et Théorie des jeux).
Ses mots : « j'ai eu 0, aucune connaissance, je n'ai jamais mis les pieds à un cours ».

- Le **volume 1** (`tutorat/p1-blanc-1/`, 249 pages, déjà livré) couvre l'examen blanc n° 1.
- Le **volume 2** (`tutorat/p1-blanc-2-3/`) couvre les examens blancs n° 2 et n° 3 et doit en être
  le **prolongement direct** : même ton, même structure, numérotation des chapitres qui continue.
- Assemblage : `node tutorat/build.mjs p1-blanc-2-3`.

## Ce que le volume 1 a déjà construit (à NE PAS refaire en entier)

Chapitre 0 : fractions/pourcentages, racine carrée, équations, systèmes 2×2, la dérivée et ses
règles de base, maximiser par « dérivée = 0 » + dérivée seconde, probabilités, espérance E(·),
E[u(w)] ≠ u(E[w]), sommes géométriques 1/(1−δ) et δ/(1−δ), lecture d'un tableau de jeu, notations.
Chapitres 1–5 : Pareto (domination, efficacité), effet de dotation, DAP/DAA, théorie du choix
rationnel ; VMA, utilité espérée, Bernoulli, concavité, aversion au risque, équivalent certain,
prime de risque, assurance ; jeux simultanés, dominance, élimination itérative, PSS, équilibre de
Nash, stratégies mixtes et principe d'indifférence ; principal-agent, aléa moral, contrainte de
participation ; dilemme du prisonnier, jeu répété, grim, facteur d'escompte.

→ Ces notions se **rappellent** en encadrés `box-rappel` compacts, avec renvoi explicite au
chapitre correspondant du volume 1. Toute la profondeur va aux notions **nouvelles**.

## Règle d'or — le niveau d'explication

Écris comme un professeur particulier patient face à un élève qui n'a jamais assisté à un cours :

- aucun terme technique sans définition préalable en français simple **+ un exemple concret** de
  la vie quotidienne ;
- aucun calcul enchaîné sans être verbalisé : « je fais ceci **parce que** cela, ce qui signifie
  cela » ; chaque passage d'une ligne à la suivante est justifié (« je multiplie les deux côtés
  par (1−δ) pour faire disparaître les dénominateurs ») ;
- chaque notation décodée à sa première apparition, **y compris comment la lire à voix haute** ;
- tutoiement, phrases courtes, ton chaleureux et encourageant, aucune condescendance.

## Structure attendue d'un chapitre de question

Pour **chaque sous-question**, dans cet ordre :

1. **L'énoncé rappelé** dans `<div class="enonce">` (avec le barème), matrices/tableaux redessinés.
2. **« Traduisons la question en français simple »** : mot par mot, dans `<dl class="lexique">`.
3. **« Le cours dont tu as besoin »** : le mini-cours, depuis zéro pour tout ce qui est nouveau.
4. **La résolution pas à pas** en `<div class="etape">`, chaque calcul dans un `<div class="calc">`
   avec un `<div class="why">` sous **chaque** ligne. Zéro saut algébrique.
5. **`box-copie`** : « Ce qu'il fallait écrire sur la copie », rédigé mot à mot.
6. **`box-piege`** (les pièges) et **`box-methode`** (la recette réutilisable).

Et en fin de chapitre : un **récapitulatif** (tableau des réponses + checklist).

## Mise en page — classes autorisées (strictement ; le vérificateur refuse toute classe inconnue)

- Racine : `<section class="chapter">` … `</section>`, commençant par
  `<div class="chapter-tag">…</div><h1>…</h1><p class="chapter-intro">…</p>`
- Titres : `<h2>`, `<h3>`, `<h4>`
- Énoncé : `<div class="enonce"><div class="enonce-title">Énoncé — question X.Y (N points)</div>…</div>`
- Encadrés : `<div class="box box-XXX"><div class="box-title">…</div>…</div>` avec `XXX` parmi
  `def` (définition), `why` (pourquoi on fait ça), `piege` (piège), `methode` (recette),
  `copie` (ce qu'il fallait écrire), `rappel` (rappel du volume 1), `exemple` (exemple concret)
- Étapes : `<div class="etape"><div class="etape-title"><span class="num">1.</span> …</div>…</div>`
- Calculs : `<div class="calc"><div class="step">\[ … \]<div class="why">…</div></div>…</div>`
- Résultat : `<div class="result"><div class="result-title">Résultat</div>…</div>`
- Tableaux : `<table class="data">`, `<table class="game">` (cellules `td.void`, `td.player`,
  `td.hl` pour surligner une meilleure réponse, `td.nash` pour un équilibre),
  `<table class="compare">` (`th.left` / `td.left` pour aligner à gauche)
- Figures : `<figure><svg …></svg><figcaption>…</figcaption></figure>`
- Lexique : `<dl class="lexique"><dt>…</dt><dd>…</dd></dl>`
- `<span class="term">…</span>` pour un mot de vocabulaire · `<hr class="soft">` pour séparer

## Maths (KaTeX)

- inline `\( … \)` · bloc `\[ … \]` · c'est du HTML : les backslashes s'écrivent tels quels
- **jamais de `%` nu** dans une formule (c'est un commentaire LaTeX) → écris `\%`
- texte français dans une formule : `\text{…}` · virgule décimale : `0{,}25`
- pas de `\begin{align}` : utilise `\begin{aligned} … \end{aligned}` dans un `\[ … \]`
- la page fait ~17 cm de large : coupe les longues égalités en plusieurs `\[ … \]` successifs

## Figures SVG

Inline uniquement, avec `viewBox` + `width="100%"` + `style="max-width:12cm"` (jamais de hauteur
fixe en px). Textes en français, police ≥ 11 unités de viewBox. Le PDF peut être imprimé en noir
et blanc : distingue aussi par le trait (pointillés, épaisseurs, hachures), pas seulement par la
couleur. Légende explicative dans `<figcaption>`.

## Interdits

Ne modifie **aucun** autre fichier (ni `src/`, ni `public/`, ni `exams/`, ni les autres fragments
de `tutorat/`). Ne commite pas. D'autres agents écrivent les autres chapitres en parallèle.

## Vérification obligatoire avant de rendre

```sh
cd /workspace/strategies-economiques && node tutorat/check-fragment.mjs tutorat/p1-blanc-2-3/<ton-fichier>.html
```

Doit afficher ✓ : 0 formule TeX en erreur, 0 débordement horizontal, 0 classe CSS inconnue.
Corrige et relance jusqu'au ✓.

## Si ton fichier existe déjà partiellement

Une première tentative a pu écrire le début de ton chapitre (elle s'est interrompue en cours de
route et a fermé `</section>` provisoirement, parfois après un commentaire du type `<!--SUITE-->`).
Dans ce cas : **lis le fichier existant, garde-le, et complète-le** — retire le `</section>`
provisoire et le commentaire marqueur, écris la suite, puis referme `</section>` à la fin.
Ne recommence pas de zéro : c'est du travail déjà fait, et il est de bonne qualité.

## Écrire un fichier très long sans se faire couper

Écris par **morceaux successifs** : un premier `Write`, puis des ajouts en fin de fichier via
`cat >> fichier <<'HTMLEOF' … HTMLEOF` en Bash. Ne tente pas d'écrire 2 000 lignes en un seul
appel. Vérifie avec `wc -l` après chaque ajout.

## ⚠️ Économie de lecture (important)

La rédaction de ce volume a déjà épuisé deux fenêtres d'usage. Sois **économe en lecture** :

- **Ne lis JAMAIS un fichier de `tutorat/p1-blanc-1/` en entier** (ils font 90 à 170 Ko). Lis-en
  au maximum **300 lignes** (`Read` avec `limit: 300`) — c'est assez pour capter le ton.
- **Ne lis pas les fichiers `src/chapters/*.tsx` en entier** (2 000 à 3 000 lignes chacun).
  Utilise `Grep` pour trouver les 2 ou 3 passages qui te concernent, et ne lis que ceux-là.
- Dans les énoncés et corrigés d'examen, **cible ta question** : ne relis pas les autres.
- Écris en **3 ou 4 gros morceaux**, pas en quinze petits ajouts.

Le budget doit aller à la **rédaction**, pas à la lecture.
