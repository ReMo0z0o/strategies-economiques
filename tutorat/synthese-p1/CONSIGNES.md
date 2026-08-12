# Consignes communes — fiche de synthèse de la Partie 1

## Ce qu'on produit

Un PDF de **synthèse condensée** de la Partie 1 (« Théorie de la décision et Théorie des jeux »),
**complément de l'app** — pas un cours, pas une ré-explication. L'étudiant l'a déjà travaillée en
profondeur (deux volumes « cours particulier » de 249 et 406 pages existent). Ici il veut
**vérifier vite ce qu'il sait**, et savoir **où retourner dans l'app** quand ça coince.

Assemblage : `node tutorat/build.mjs synthese-p1`. Un fragment HTML par chapitre, dans
`tutorat/synthese-p1/`.

## Le ton juste

Ni le ton du volume « cours particulier » (qui part de zéro, tutoie et explique tout), ni un
formulaire sec. Vise **la fiche d'un bon étudiant** : phrases courtes, affirmatives, denses.
Le tutoiement reste, mais on ne raconte plus d'histoires et on ne redémontre rien.

- Un point = une affirmation qu'on doit pouvoir restituer, puis **2 à 4 lignes** qui disent
  *pourquoi c'est vrai* ou *à quoi ça sert* — jamais la démonstration complète.
- Un **mini-exemple chiffré d'une ligne** quand il évite un contresens (« avec \( \delta = 0{,}4 \) :
  \( 4/0{,}6 = 6{,}67 < 6 + 1{,}33 \), l'entente ne tient pas »).
- Reprends **le vocabulaire et les notations du prof**, pas les tiens. La fiche doit refléter le
  cours tel qu'il est dans l'app.

## Longueur

**Environ 7 pages PDF par chapitre.** Le vérificateur affiche l'estimation. En dessous de 5, tu es
trop sec ; au-dessus de 9, tu réexpliques — coupe.

## Gabarit d'un chapitre (à suivre exactement, dans cet ordre)

```html
<section class="chapter">
  <div class="chapter-tag">A3 · Partie A — La décision individuelle</div>
  <h1>Décision sous incertitude</h1>
  <p class="chapter-intro">La question du chapitre, en une phrase.</p>

  <h2>La carte du chapitre</h2>
  <!-- <table class="compare"> : une ligne par section de l'app, dans l'ordre :
       §  |  titre de la section  |  ce qu'elle apporte, en une ligne -->

  <h2>Les points à retenir</h2>
  <!-- une série de <div class="point"> — voir ci-dessous -->

  <h2>Les formules du chapitre</h2>
  <!-- <table class="compare"> : formule | ce que désigne chaque symbole | quand l'utiliser -->

  <h2>Les définitions à savoir réciter</h2>
  <!-- <dl class="lexique"> : terme + définition condensée du cours -->

  <h2>La méthode type</h2>
  <!-- <div class="box box-methode"> : la procédure du chapitre en étapes numérotées.
       À omettre si le chapitre ne porte aucune procédure de résolution. -->

  <h2>Les pièges du chapitre</h2>
  <!-- <div class="box box-piege"> : les confusions que le cours signale explicitement -->
</section>
```

### Le bloc « point à retenir »

```html
<div class="point">
  <div class="point-title"><span class="num">7.</span> Le titre du point, affirmatif et complet.</div>
  <p>Deux à quatre lignes d'explication : pourquoi c'est vrai, à quoi ça sert, ce que ça implique.</p>
  <a class="ref-app" href="https://strategies-economiques.vercel.app/strategies/theorie/a3#s6">A3 · §6 — Équivalent certain et prime de risque <span class="path">https://strategies-economiques.vercel.app/strategies/theorie/a3#s6</span></a>
</div>
```

Le `ref-app` est **obligatoire sur chaque point** : c'est la raison d'être du document. C'est un
`<a>` **cliquable dans le PDF** : l'URL complète figure à la fois dans le `href` et, en toutes
lettres, dans le `<span class="path">`. Libellé : `CODE · REPÈRE — Titre exact de la section`.

Base de l'URL : `https://strategies-economiques.vercel.app` · théorie
`/strategies/theorie/<id>#<ancre>` · TP `/strategies/exercices/session-N#exK`.

⚠️ Les identifiants d'ancre diffèrent d'un chapitre à l'autre — **prends-les dans
`src/data/course.ts`**, ne les invente pas :

| chapitre | ancres |
| --- | --- |
| a1 | `intro`, `offre`, `pref`, `indiff`, `optim`, `redistrib`, `pareto`, `comporte`, `transaction`, `sunk`, `dotation`, `framing`, `vs`, `nudge`, `synthese`, `exos` |
| a2 | `intro`, `outils`, `modele`, `prefs`, `choix`, `selfcontrole`, `commit`, `politiques`, `maitrise`, `exos` |
| a3 | `s1` … `s13` |
| b1 | `s0` … `s10` |
| b2 | `sec-reperes`, `sec-histoire`, `sec-modele`, `sec-cas1`, `sec-cas2`, `sec-cas3`, `sec-recap`, `sec-risque`, `sec-exos`, `sec-bilan` |
| b3 | `sec-reperes`, `sec-fritkot`, `sec-cadre`, `sec-deux`, `sec-fini`, `sec-infini`, `sec-tt`, `sec-grim`, `sec-interp`, `sec-axelrod`, `sec-labo`, `sec-exos`, `sec-final` |
| b4 | `s0` … `s10` |

⚠️ Le **REPÈRE** est le `kicker` que l'app affiche en tête de la section, recopié tel quel (seule
l'espace après `§` est supprimée). Il ne se déduit pas du rang : les conventions diffèrent d'un
chapitre à l'autre — **prends-le dans le `<Section id=… kicker=…>` de `src/chapters/<id>.tsx`**.

| chapitre | convention du `kicker` | exemples |
| --- | --- | --- |
| a1 | lettre + numéro | `A.1 · A.2`, `A.10`, `B.3 · Biais n°2`, `★`, `✎` |
| a2 | partie + § | `§0 · La motivation`, `Partie A · §3`, `★ · Récapitulatif` |
| a3 | `§N`, démarre à 1 | `§1` … `§13` |
| b1 | `Partie N` | `Introduction`, `Partie 5 · Hypothèse 3`, `Partie 10` |
| b2 | `§N`, **démarre à 0** | `§0 · Jeux séquentiels appliqués`, `§1` … `§9` |
| b3 | `§N`, **démarre à 0** | `§0` … `§12` |
| b4 | `§N`, **démarre à 0** | `§0` … `§10` |

Pour un renvoi vers un TP : `TP 3 · Jeux séquentiels & duopole` + `/strategies/exercices/session-3`.

## Classes autorisées (strictement — le vérificateur refuse toute classe inconnue)

`chapter`, `chapter-tag`, `chapter-intro` · `h2`, `h3`, `h4` · **`point`, `point-title`, `num`,
`ref-app`, `path`** · `box` + `box-def` / `box-why` / `box-piege` / `box-methode` / `box-copie` /
`box-rappel` / `box-exemple`, avec `box-title` · `table` en `data` / `compare` (`th.left`,
`td.left`) / `game` (`td.void`, `td.player`, `td.hl`, `td.nash`) · `dl.lexique` ·
`figure` + `figcaption` · `span.term` · `hr.soft` · `etape` / `etape-title` · `result` /
`result-title`.

## Maths (KaTeX)

inline `\( … \)` · bloc `\[ … \]` · c'est du HTML, les backslashes s'écrivent tels quels ·
**jamais de `%` nu** dans une formule → `\%` · texte français `\text{…}` · virgule décimale
`0{,}25` · pas de `\begin{align}` mais `\begin{aligned}` dans un `\[ … \]` · la page fait ~17 cm :
coupe les longues égalités.

## Figures

**Une ou deux au maximum par chapitre**, et seulement si un schéma remplace un paragraphe (par
exemple le diagramme d'inclusion ESD ⊆ EN ⊆ PSS, ou la courbe concave avec l'équivalent certain).
Une fiche de révision n'est pas un manuel illustré. SVG inline, `viewBox` + `width="100%"` +
`style="max-width:11cm"`, police ≥ 11 unités, lisible en noir et blanc, légende en `figcaption`.

## Économie de lecture

- **Ne lis jamais un `src/chapters/*.tsx` en entier** (2 000 à 2 700 lignes). Utilise `Grep`, puis
  `Read` avec `offset`/`limit` sur les zones utiles.
- La **section de synthèse du chapitre** est ta source principale — elle condense déjà tout :
  a1 `synthese` · a2 `maitrise` · a3 `s13` · b1 `s10` (+ le callout de `s0`) · b2 `sec-bilan`
  (+ les « ⭐ À maîtriser absolument (§n) » de chaque section) · b3 `sec-final` (idem) · b4 `s9`.
- Complète ensuite avec les `variant="retiens"`, `variant="examen"`, `variant="attention"`,
  `variant="definition"`, `variant="methode"` et les `<FormulaBox`.
- **Ne lis pas les autres fragments de `tutorat/`** : ils sont énormes et tu n'en as pas besoin.

## Interdits

Ne modifie **aucun** autre fichier (ni `src/`, ni `public/`, ni `exams/`, ni les autres fragments).
Ne commite pas. D'autres rédacteurs travaillent en parallèle sur les autres chapitres.

## Vérification obligatoire avant de rendre

```sh
cd /workspace/strategies-economiques && node tutorat/check-fragment.mjs tutorat/synthese-p1/<ton-fichier>.html
```

Doit afficher ✓ (0 formule TeX en erreur, 0 débordement horizontal, 0 classe CSS inconnue) et une
estimation autour de 7 pages. Corrige et relance jusqu'au ✓.
