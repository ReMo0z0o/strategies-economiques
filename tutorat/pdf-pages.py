"""
Localise chaque titre du document dans le PDF déjà rendu et renvoie son
numéro de page. Utilisé par tutorat/build.mjs pour paginer le sommaire.

Entrée (JSON sur stdin) :
    {"pdf": "...", "marker": "...", "running": "...", "titles": ["...", ...]}
Sortie (JSON sur stdout) : [numéro de page ou null, ...] dans le même ordre.

« running » est le texte de l'en-tête courant, répété sur chaque page. Il est
retiré du texte avant la recherche : sans cela, un titre de chapitre contenu
dans le titre du document (par exemple un chapitre « Tit-for-tat » dans un
document intitulé « Grim, toujours trahir, tit-for-tat ») serait trouvé dès la
première page venue.

La comparaison se fait sur du texte normalisé (minuscules, seuls les
caractères alphanumériques conservés) car Chromium exporte le texte sans
espaces fiables. La recherche est séquentielle : chaque titre est cherché à
partir de la page du précédent, ce qui lève l'ambiguïté des titres répétés
(« Récapitulatif », « Traduisons la question »…).
"""
import json
import sys
import unicodedata

from pypdf import PdfReader


def norm(s):
    # NFKD ramène les lettres mathématiques de KaTeX (« 𝐴 » italique, U+1D434)
    # sur leur équivalent ASCII : sans cela elles ne correspondraient pas au
    # « A » ordinaire écrit dans le sommaire.
    s = unicodedata.normalize("NFKD", s)
    return "".join(ch.lower() for ch in s if ch.isalnum())


req = json.load(sys.stdin)
reader = PdfReader(req["pdf"])
pages = [norm(p.extract_text() or "") for p in reader.pages]

# L'en-tête courant se répète sur chaque page : on le retire, sinon les titres
# qu'il contient seraient « trouvés » partout.
running = norm(req.get("running", ""))
if running:
    pages = [txt.replace(running, "") for txt in pages]

# Le sommaire contient tous les titres : on ne commence à chercher qu'après lui.
start = 0
marker = norm(req.get("marker", ""))
if marker:
    for i, txt in enumerate(pages):
        if marker in txt:
            start = i + 1
            break

out = []
cursor = start
for title in req["titles"]:
    key = norm(title)[:40]
    found = None
    if key:
        for i in range(cursor, len(pages)):
            if key in pages[i]:
                found = i + 1
                cursor = i
                break
    out.append(found)

json.dump(out, sys.stdout)
