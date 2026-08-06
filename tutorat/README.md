# Documents « cours particulier »

Reprise intégrale d'un examen blanc, expliquée depuis zéro pour un étudiant qui
n'a aucune connaissance préalable du cours. Contrairement aux corrigés de
`exams/` (qui supposent le cours connu) et aux résolutions guidées de l'app
(qui renvoient vers la théorie), ces documents **réexpliquent tout sur place**.

## Structure

- `template/tutorat.css` — mise en page A4 pour l'apprentissage : encadrés typés
  (définition, pourquoi, piège, méthode, copie modèle, rappel, exemple), blocs de
  calcul où chaque ligne porte sa justification, figures SVG légendées.
- `<id>/meta.json` — page de garde, sommaire, liste ordonnée des fragments.
- `<id>/*.html` — un fragment par chapitre, écrit avec les classes du gabarit.
- `out/` — les PDF générés (non versionnés dans l'app : ce dossier ne fait pas
  partie du build du site).

## Commandes

```sh
node tutorat/check-fragment.mjs tutorat/<id>/<fichier>.html   # avant assemblage
node tutorat/build.mjs <id>                                   # génère le PDF
```

Le vérificateur signale les formules KaTeX en erreur, les débordements
horizontaux (élément plus large que la page imprimable) et les classes CSS
inconnues, et estime le nombre de pages.

## Documents existants

- `p1-blanc-1` — Examen blanc n° 1, Partie 1 (249 pages) : chapitre 0 boîte à
  outils, un chapitre par question, lexique & formulaire.
