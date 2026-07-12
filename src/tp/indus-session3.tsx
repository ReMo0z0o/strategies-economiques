/**
 * TP · Séance 3 — La discrimination avec coût marginal (Économie industrielle).
 *
 * Énoncé fidèle au document officiel « Exercice à préparer avant le cours —
 * Chapitre 3 : comportements de monopole » ; résolution pas à pas alignée sur
 * le corrigé officiel (7 slides). L'exercice reprend l'exemple fil conducteur
 * du chapitre EI3 (consommateurs L et S) en changeant UNE hypothèse : le coût
 * marginal passe de 0 à 2. Chaque étape compare donc systématiquement les
 * résultats avec ceux du chapitre.
 */
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { Quiz } from "@/components/course/Quiz";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Couleurs de séries (paire bleu/ambre, sûre pour daltonisme). */
const COL_L = "#0284c7"; // sky-600 — consommateur L
const COL_S = "#d97706"; // amber-600 — consommateur S

/* ------------------------------------------------------------------ */
/* Figure · les deux demandes avec la droite de coût marginal Cm = 2   */
/* ------------------------------------------------------------------ */

function DemandsFigure() {
  // Y(p) = 200 - 14p ; panneau L : X(q) = 40 + 14q ; panneau S : X(q) = 270 + 14q.
  return (
    <figure className="my-5">
      <svg
        viewBox="0 0 460 236"
        className="w-full"
        role="img"
        aria-label="Demandes des consommateurs L et S avec la droite de coût marginal à 2 euros : le monopole du premier degré vend 10 unités à L pour 70 euros et 5 unités à S pour 35 euros"
      >
        {/* Titres des panneaux */}
        <text x={40} y={16} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Consommateur L — lot de 10 unités
        </text>
        <text x={270} y={16} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Consommateur S — lot de 5 unités
        </text>

        {/* Panneau L : aire facturée (surplus brut jusqu'à 10) */}
        <polygon points="40,32 180,172 180,200 40,200" fill={COL_L} opacity={0.15} />
        {/* Panneau S : aire facturée (surplus brut jusqu'à 5) */}
        <polygon points="270,32 340,172 340,200 270,200" fill={COL_S} opacity={0.15} />

        {/* Droite de coût marginal Cm = 2 */}
        <line x1={40} y1={172} x2={215} y2={172} stroke="var(--color-muted-foreground)" strokeWidth={1.4} strokeDasharray="5 4" />
        <line x1={270} y1={172} x2={445} y2={172} stroke="var(--color-muted-foreground)" strokeWidth={1.4} strokeDasharray="5 4" />
        <text x={218} y={168} fontSize={10.5} fill="var(--color-muted-foreground)">
          Cm = 2
        </text>
        <text x={445} y={162} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">
          Cm = 2
        </text>

        {/* Demande de L : p = 12 - yL, de (0,12) à (12,0) */}
        <line x1={40} y1={32} x2={208} y2={200} stroke={COL_L} strokeWidth={2} />
        <text x={138} y={112} fontSize={11} fontWeight={600} fill={COL_L}>
          p = 12 − yL
        </text>
        {/* Demande de S : p = 12 - 2yS, de (0,12) à (6,0) */}
        <line x1={270} y1={32} x2={354} y2={200} stroke={COL_S} strokeWidth={2} />
        <text x={310} y={84} fontSize={11} fontWeight={600} fill={COL_S}>
          p = 12 − 2yS
        </text>

        {/* Lignes de rappel et points d'arrêt (disposition à payer = Cm) */}
        <line x1={180} y1={172} x2={180} y2={200} stroke={COL_L} strokeWidth={1.2} strokeDasharray="3 3" />
        <circle cx={180} cy={172} r={3.5} fill={COL_L} />
        <line x1={340} y1={172} x2={340} y2={200} stroke={COL_S} strokeWidth={1.2} strokeDasharray="3 3" />
        <circle cx={340} cy={172} r={3.5} fill={COL_S} />

        {/* Étiquettes des aires facturées */}
        <text x={78} y={158} fontSize={11} fontWeight={600} fill="var(--color-foreground)">
          mₗ = 70 €
        </text>
        <text x={276} y={158} fontSize={11} fontWeight={600} fill="var(--color-foreground)">
          mₛ = 35 €
        </text>

        {/* Axes */}
        <line x1={40} y1={32} x2={40} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <line x1={40} y1={200} x2={220} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <line x1={270} y1={32} x2={270} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <line x1={270} y1={200} x2={448} y2={200} stroke="var(--color-foreground)" strokeWidth={1.2} />

        {/* Graduations panneau L */}
        <text x={40} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">0</text>
        <text x={180} y={214} fontSize={10.5} textAnchor="middle" fontWeight={700} fill="var(--color-foreground)">10</text>
        <text x={208} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">12</text>
        <text x={214} y={228} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">yL</text>
        <text x={34} y={36} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">12</text>
        <text x={34} y={176} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">2</text>

        {/* Graduations panneau S */}
        <text x={270} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">0</text>
        <text x={340} y={214} fontSize={10.5} textAnchor="middle" fontWeight={700} fill="var(--color-foreground)">5</text>
        <text x={354} y={226} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">6</text>
        <text x={444} y={214} fontSize={10.5} textAnchor="middle" fill="var(--color-muted-foreground)">yS</text>
        <text x={264} y={36} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">12</text>
        <text x={264} y={176} fontSize={10.5} textAnchor="end" fill="var(--color-muted-foreground)">2</text>
      </svg>
      <figcaption className="mt-1 text-sm text-muted-foreground">
        Discrimination du 1er degré avec <M tex="Cm = 2" /> : chaque lot s'arrête là où la
        disposition à payer tombe à 2 € (10 unités pour L, 5 pour S), et le montant facturé est
        toute l'aire sous la demande jusqu'à cette quantité (trapèze = rectangle de hauteur 2 +
        triangle).
      </figcaption>
    </figure>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={3}
      intro={
        <>
          <p>
            Cette séance reprend <strong>l'exemple fil conducteur du chapitre EI3</strong> — les
            consommateurs L et S — en changeant une seule hypothèse : le coût marginal n'est plus
            nul mais constant et égal à <strong>2</strong>. C'est l'exercice idéal pour tester si
            tu maîtrises les <em>méthodes</em> et pas seulement les nombres du cours : monopole
            simple, discrimination du premier degré, puis du deuxième degré, tout est à refaire
            avec ce coût. Avant de commencer, révise les sections § 2 à § 4 du chapitre EI3 et
            garde leurs résultats sous la main (profits 54, 108 et 96 €) : à chaque question,
            demande-toi <em>ce qui change et pourquoi</em> quand le coût marginal devient positif.
            Et bien sûr : tente chaque question au brouillon avant de révéler les étapes !
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — L'exemple du cours avec Cm = 2                    */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp3"
        id="ex1"
        number={1}
        title="L et S face à un coût marginal de 2 — monopole simple, 1er et 2e degré"
        difficulty={2}
        refs={[
          { chapter: "ei3", section: "fil-conducteur" },
          { chapter: "ei3", section: "premier-degre" },
          { chapter: "ei3", section: "deuxieme-degre" },
        ]}
        statement={
          <>
            <p>
              <em>
                Exercice à préparer avant le cours (chapitre 3 « Comportements de monopole », à
                faire après avoir visionné les slides 1 à 30).
              </em>
            </p>
            <p>
              Reprenons l'exemple du cours. Nous considérions deux types de consommateurs : L et S
              avec les demandes suivantes :
            </p>
            <MB tex="\text{L} : \; p = 12 - y_L \;\;\Longleftrightarrow\;\; y_L = 12 - p \qquad \text{et} \qquad \text{S} : \; p = 12 - 2y_S \;\;\Longleftrightarrow\;\; y_S = 6 - \tfrac{1}{2}p" />
            <p>De sorte que la demande globale est donnée par</p>
            <MB tex="Y = y_L + y_S = 18 - \tfrac{3}{2}p \;\;\Longleftrightarrow\;\; p = 12 - \tfrac{2}{3}Y" />
            <p>
              Nous changeons une seule hypothèse : <strong>le coût marginal est constant et égal
              à 2</strong>.
            </p>
            <SubQuestion label="1">
              Calcule le comportement du monopole simple qui ne discrimine pas les deux
              consommateurs (quantité, prix, profit).
            </SubQuestion>
            <SubQuestion label="2">
              Calcule le comportement du monopole qui pratique de la discrimination du premier
              degré (quantités vendues à chaque consommateur, montants des ventes et profit).
            </SubQuestion>
            <SubQuestion label="3">
              Calcule le comportement du monopole qui pratique de la discrimination du deuxième
              degré (quantités vendues à chaque consommateur, montants des ventes et profit).
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Lire l'énoncé : ce qui change, ce qui ne change pas",
            refs: [{ chapter: "ei3", section: "fil-conducteur" }],
            content: (
              <>
                <p>
                  Les demandes sont <em>exactement</em> celles du chapitre EI3 : L le gros
                  acheteur (<M tex="y_L = 12 - p" />), S le petit (<M tex="y_S = 6 - p/2" />),
                  demande globale <M tex="Y = 18 - \tfrac{3}{2}p" />. La seule nouveauté est le
                  coût marginal <M tex="Cm = 2" /> : chaque unité produite coûte désormais 2 €.
                </p>
                <Callout variant="methode">
                  <p>
                    Les <strong>méthodes</strong> du chapitre restent valables mot pour mot :
                    « <M tex="Rm = Cm" /> » pour le monopole simple, « lots à prendre ou à
                    laisser calibrés sur le surplus brut » pour le 1er degré, « saturer la
                    participation du petit et l'incitation du gros » pour le 2e degré. Ce qui
                    change, c'est que <em>tous</em> les calculs doivent maintenant intégrer le
                    coût : à droite de <M tex="Rm = Cm" />, dans la taille optimale des lots, et
                    dans chaque ligne de profit (<M tex="\Pi = \text{recettes} - 2 \times \text{unités produites}" />).
                  </p>
                </Callout>
                <Callout variant="attention">
                  <p>
                    Ne recycle <strong>aucun</strong> résultat numérique du chapitre (« Y = 9,
                    p = 6, profit 54 »… ) : ils ont été calculés avec <M tex="Cm = 0" /> et sont
                    tous faux ici. C'est précisément le but de l'exercice : refaire chaque
                    dérivation et comprendre <em>pourquoi</em> chaque nombre bouge — et dans quel
                    sens.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 1 — Monopole simple : Rm = Cm avec Cm = 2",
            refs: [{ chapter: "ei3", section: "fil-conducteur" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi cette méthode ?</strong> Sans discrimination, le monopole fixe
                  un prix unique sur la demande <em>globale</em> : il produit tant qu'une unité
                  supplémentaire rapporte plus qu'elle ne coûte, c'est-à-dire jusqu'à ce que la
                  recette marginale égale le coût marginal. On déroule dans l'ordre : recette
                  totale, recette marginale, optimum, prix, profit.
                </p>
                <p>
                  <strong>Recette totale</strong> sur la demande inverse globale :
                </p>
                <MB tex="RT = p \cdot Y = \left(12 - \tfrac{2}{3}Y\right)Y" />
                <p>
                  <strong>Recette marginale</strong> — même ordonnée à l'origine, pente doublée
                  (le réflexe des chapitres EI1 et EI3) :
                </p>
                <MB tex="Rm = 12 - \tfrac{4}{3}Y" />
                <p>
                  <strong>Optimum</strong> : <M tex="Rm = Cm" /> avec, cette fois,{" "}
                  <M tex="Cm = 2" /> :
                </p>
                <MB tex="12 - \tfrac{4}{3}Y = 2 \;\;\Longleftrightarrow\;\; \tfrac{4}{3}Y = 10 \;\;\Longleftrightarrow\;\; Y^* = \tfrac{15}{2} = 7{,}5" />
                <p>
                  <strong>Prix</strong>, en remontant le long de la demande :
                </p>
                <MB tex="p^* = 12 - \tfrac{2}{3} \times \tfrac{15}{2} = 12 - 5 = 7" />
                <p>
                  <strong>Profit</strong> — attention, il faut maintenant soustraire les coûts :
                </p>
                <MB tex="\Pi = p\,Y - 2\,Y = (7 - 2) \times \tfrac{15}{2} = \tfrac{75}{2} = 37{,}5 \text{ €}" />
                <p>
                  Vérification utile : au prix de 7 €, chacun achète le long de sa propre
                  demande, <M tex="y_L = 12 - 7 = 5" /> et{" "}
                  <M tex="y_S = 6 - \tfrac{7}{2} = 2{,}5" />, soit bien{" "}
                  <M tex="5 + 2{,}5 = 7{,}5" /> unités au total (et les deux consommateurs
                  restent actifs, la formule de demande globale s'applique).
                </p>
                <Callout variant="attention">
                  <p>
                    Deux pièges classiques ici. (i) Écrire <M tex="p = Cm" /> au lieu de{" "}
                    <M tex="Rm = Cm" /> : c'est la condition de la <em>concurrence parfaite</em>,
                    pas celle du monopole. (ii) Conclure <M tex="\Pi = p \cdot Y = 52{,}5" /> en
                    oubliant les coûts : avec <M tex="Cm = 2" />, le profit est{" "}
                    <M tex="(p - 2)\,Y" />, soit 37,5 €.
                  </p>
                </Callout>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[24rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Monopole simple</th>
                        <th className={THc}>Chapitre EI3 (Cm = 0)</th>
                        <th className={THc}>Ce TP (Cm = 2)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Quantité Y", "9", "7,5"],
                        ["Prix p", "6 €", "7 €"],
                        ["Profit Π", "54 €", "37,5 €"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>{row[1]}</td>
                          <td className={TDc}>
                            <strong>{row[2]}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Callout variant="intuition" title="Comparaison avec le cours — comprends pourquoi">
                  <p>
                    Au chapitre EI3 tu avais trouvé <M tex="Y = 9" />, <M tex="p = 6" />,{" "}
                    <M tex="\Pi = 54" /> ; ici <M tex="Y = 7{,}5" />, <M tex="p = 7" />,{" "}
                    <M tex="\Pi = 37{,}5" />. Un coût marginal positif rend les dernières unités
                    non rentables : le monopole <strong>produit moins</strong> et{" "}
                    <strong>vend plus cher</strong>. Remarque fine : le coût monte de 2, mais le
                    prix ne monte que de 1. Avec une demande linéaire,{" "}
                    <M tex="p^* = \tfrac{12 + Cm}{2}" /> : le monopole ne répercute que la{" "}
                    <em>moitié</em> du coût sur le consommateur et absorbe le reste dans sa
                    marge.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 2 — Premier degré : jusqu'où pousser chaque lot ?",
            refs: [{ chapter: "ei3", section: "premier-degre" }],
            content: (
              <>
                <p>
                  <strong>La méthode du chapitre :</strong> en information parfaite, le monopole
                  fait à chaque consommateur une offre « à prendre ou à laisser » — un lot de{" "}
                  <M tex="y" /> unités contre un montant <M tex="m" /> égal à tout le surplus
                  brut (l'aire sous la demande jusqu'à <M tex="y" />). Le consommateur repart
                  avec un surplus net nul mais accepte.
                </p>
                <p>
                  <strong>Le « pourquoi » propre à ce TP :</strong> comme le monopole capture
                  tout le surplus, il veut des lots qui rendent ce surplus <em>maximal</em>… tout
                  en s'assurant que chaque unité vendue ne lui coûte pas plus que ce qu'elle lui
                  rapporte. Au chapitre (<M tex="Cm = 0" />), on poussait chaque lot jusqu'à ce
                  que la disposition à payer tombe à <strong>zéro</strong> (12 unités pour L, 6
                  pour S). Ici, chaque unité coûte 2 € : on s'arrête dès que la disposition à
                  payer tombe à <strong>2 €</strong> — les dernières unités vendues ne doivent
                  pas coûter plus qu'elles ne rapportent.
                </p>
                <p>Taille des lots — on cherche où chaque demande croise le coût marginal :</p>
                <MB tex="\text{L} : \; 12 - y_L = 2 \;\;\Longrightarrow\;\; y_L = 10 \qquad\qquad \text{S} : \; 12 - 2y_S = 2 \;\;\Longrightarrow\;\; y_S = 5" />
                <Callout variant="attention">
                  <p>
                    Piège : recopier les lots du cours (12 et 6 unités) ferait <em>perdre</em> de
                    l'argent sur les dernières unités. Vérifie-le : avec les lots{" "}
                    <M tex="[72\text{ €} ;\, 12]" /> et <M tex="[36\text{ €} ;\, 6]" />, le
                    profit vaudrait <M tex="72 + 36 - 2 \times 18 = 72\text{ €}" /> — moins que
                    les 75 € qu'on va obtenir. La 11e unité de L, par exemple, vaut moins de 2 €
                    à ses yeux mais coûte 2 € à produire : la vendre détruit de la valeur.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 2 — Les montants, aire par aire, et le profit",
            refs: [{ chapter: "ei3", section: "premier-degre" }],
            content: (
              <>
                <p>
                  Chaque montant est le <strong>surplus brut</strong> du consommateur sur son
                  lot : l'aire sous sa demande jusqu'à la quantité du lot. Avec l'arrêt à
                  hauteur 2, cette aire est un trapèze = rectangle de hauteur 2 + triangle
                  (c'est exactement la décomposition du corrigé) :
                </p>
                <MB tex="m_l = SC_L^{\text{brut}} = \underbrace{10 \times 2}_{\text{rectangle}} + \underbrace{\tfrac{1}{2} \times 10 \times (12 - 2)}_{\text{triangle}} = 20 + 50 = 70 \text{ €}" />
                <MB tex="m_s = SC_S^{\text{brut}} = \underbrace{5 \times 2}_{\text{rectangle}} + \underbrace{\tfrac{1}{2} \times 5 \times (12 - 2)}_{\text{triangle}} = 10 + 25 = 35 \text{ €}" />
                <DemandsFigure />
                <p>
                  <strong>Le monopole vend donc 10 unités à L pour 70 € et 5 unités à S pour
                  35 €.</strong> Son profit — recettes moins coût des 15 unités produites — vaut :
                </p>
                <MB tex="\Pi = 70 + 35 - 2 \times (10 + 5) = 105 - 30 = 75 \text{ €}" />
                <p>
                  Double vérification : 75 €, c'est exactement le surplus total{" "}
                  <em>maximal</em> de cette économie avec <M tex="Cm = 2" /> — le triangle net de
                  L (<M tex="\tfrac{1}{2} \times 10 \times 10 = 50" />) plus celui de S (
                  <M tex="\tfrac{1}{2} \times 5 \times 10 = 25" />). Comme au chapitre, le 1er
                  degré capture <strong>tout</strong> le gâteau, ne laisse{" "}
                  <strong>aucun surplus</strong> aux consommateurs et produit le volume{" "}
                  <strong>socialement efficace</strong> (15 unités : toutes celles qui valent
                  plus que leur coût, et seulement celles-là).
                </p>
                <Callout variant="intuition" title="Comparaison avec le cours — comprends pourquoi">
                  <p>
                    Au chapitre EI3 : lots <M tex="[72\text{ €} ;\, 12]" /> et{" "}
                    <M tex="[36\text{ €} ;\, 6]" />, profit 108 €. Ici : lots{" "}
                    <M tex="[70\text{ €} ;\, 10]" /> et <M tex="[35\text{ €} ;\, 5]" />, profit
                    75 €. La règle d'arrêt s'est déplacée de « disposition à payer = 0 » à
                    « disposition à payer = <M tex="Cm" /> » : les lots rétrécissent, les
                    montants aussi, et le gâteau maximal fond de 108 € à 75 € (produire n'est
                    plus gratuit). Mais la <em>logique</em> est identique : quantité efficace,
                    montant = surplus brut, surplus net nul pour l'acheteur.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 3 — Deuxième degré : poser les deux contraintes",
            refs: [{ chapter: "ei3", section: "deuxieme-degre" }],
            content: (
              <>
                <p>
                  <strong>Pourquoi on ne peut pas recopier la question 2 :</strong> le monopole
                  sait qu'il existe un gros et un petit consommateur, mais il ne peut pas les{" "}
                  <em>reconnaître</em>. Il affiche donc un menu de deux lots, le même pour tout
                  le monde, et chacun choisit librement. Or le lot conçu pour S est une bonne
                  affaire pour L (les premières unités valent très cher à ses yeux) : si le menu
                  est mal calibré, L « se déguise en petit ». Il faut donc construire le menu
                  avec deux contraintes : la <strong>participation</strong> de S et
                  l'<strong>incitation</strong> de L.
                </p>
                <p>
                  <strong>Le gros lot d'abord.</strong> Le monopole veut extraire le maximum de
                  L : il lui destine un lot de <strong>10 unités</strong> — comme au 1er degré,
                  la 11e unité lui coûterait 2 € alors que L est prêt à payer moins de 2 € pour
                  elle. La valeur totale de ce lot pour L est (étape précédente) 70 €. Si L
                  achète le gros lot au montant <M tex="m_l" />, son surplus net vaut :
                </p>
                <MB tex="70 - m_l" />
                <p>
                  <strong>Que vaut le petit lot aux yeux de L ?</strong> Un lot de{" "}
                  <M tex="y_S" /> unités à <M tex="m_S" /> € procurerait à L (aire sous{" "}
                  <em>sa</em> demande : rectangle de hauteur <M tex="12 - y_S" /> + triangle) un
                  surplus net de :
                </p>
                <MB tex="(12 - y_S)\,y_S + \tfrac{1}{2}\bigl(12 - (12 - y_S)\bigr)y_S - m_S = 12y_S - \tfrac{1}{2}y_S^2 - m_S" />
                <p>
                  <strong>Contrainte d'incitation de L</strong> — pour que L achète le gros lot,
                  il faut que celui-ci lui laisse au moins autant. Le monopole encaisse le plus
                  possible en saturant cette contrainte :
                </p>
                <MB tex="70 - m_l \;\ge\; 12y_S - \tfrac{1}{2}y_S^2 - m_S \;\;\Longrightarrow\;\; m_l = 70 - 12y_S + \tfrac{1}{2}y_S^2 + m_S" />
                <p>
                  <strong>Que fait S ?</strong> Il achète le petit lot si son surplus net est non
                  négatif. Son surplus brut sur <M tex="y_S" /> unités (aire sous la demande de
                  S : rectangle de hauteur <M tex="12 - 2y_S" /> + triangle) vaut{" "}
                  <M tex="12y_S - y_S^2" />. Le monopole sature cette{" "}
                  <strong>contrainte de participation</strong> :
                </p>
                <MB tex="m_S = 12y_S - y_S^2" />
                <p>
                  En remplaçant <M tex="m_S" /> dans l'expression de <M tex="m_l" /> :
                </p>
                <MB tex="m_l = 70 - 12y_S + \tfrac{1}{2}y_S^2 + 12y_S - y_S^2 = 70 - \tfrac{1}{2}y_S^2" />
                <Callout variant="methode">
                  <p>
                    Compare avec le chapitre : la structure est <em>identique</em> (saturer la
                    participation de S, saturer l'incitation de L, tout exprimer en fonction de{" "}
                    <M tex="y_S" />). Seul le « 72 » du chapitre — la valeur du gros lot pour L —
                    est devenu « 70 », parce que le gros lot est passé de 12 à 10 unités. Les
                    formules <M tex="m_S = 12y_S - y_S^2" /> et « valeur du petit lot pour L
                    = <M tex="12y_S - \tfrac{1}{2}y_S^2" /> » sont inchangées : elles ne
                    dépendent que des demandes, pas du coût.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Question 3 — Choisir yS : maximiser le profit… sans oublier les coûts",
            refs: [{ chapter: "ei3", section: "deuxieme-degre" }],
            content: (
              <>
                <p>
                  Il reste une seule inconnue : la taille <M tex="y_S" /> du petit lot. Le
                  monopole la choisit pour maximiser son profit — recettes des deux lots moins le
                  coût de production de <em>toutes</em> les unités (<M tex="10 + y_S" />) :
                </p>
                <MB tex="\Pi = m_l + m_S - 2 \times 10 - 2y_S" />
                <MB tex="\Pi = \Bigl(70 - \tfrac{1}{2}y_S^2\Bigr) + \bigl(12y_S - y_S^2\bigr) - 20 - 2y_S = 50 + 10y_S - \tfrac{3}{2}y_S^2" />
                <p>
                  <strong>Condition de premier ordre</strong> — on dérive par rapport à{" "}
                  <M tex="y_S" /> :
                </p>
                <MB tex="\frac{d\Pi}{dy_S} = 10 - 3y_S = 0 \;\;\Longrightarrow\;\; y_S^* = \frac{10}{3} \approx 3{,}33" />
                <p>D'où les montants des deux lots :</p>
                <MB tex="m_l = 70 - \tfrac{1}{2}\Bigl(\tfrac{10}{3}\Bigr)^{\!2} = 70 - \tfrac{50}{9} = \tfrac{580}{9} \approx 64{,}44 \text{ €}" />
                <MB tex="m_S = 12 \times \tfrac{10}{3} - \tfrac{100}{9} = 40 - \tfrac{100}{9} = \tfrac{260}{9} \approx 28{,}89 \text{ €}" />
                <p>Et le profit :</p>
                <MB tex="\Pi = \tfrac{580}{9} + \tfrac{260}{9} - 20 - 2 \times \tfrac{10}{3} = \tfrac{840}{9} - \tfrac{240}{9} = \tfrac{600}{9} = \tfrac{200}{3} \approx 66{,}67 \text{ €}" />
                <p>
                  <strong>Le menu optimal est donc : 10 unités pour 64,44 € (lot l) et 3,33
                  unités pour 28,89 € (lot s), pour un profit de 66,67 €</strong> — exactement
                  les valeurs du corrigé (580/9, 260/9 et 200/3 en fractions exactes).
                </p>
                <p>
                  Vérifions le libre choix. L prend le gros lot et garde une{" "}
                  <strong>rente d'information</strong> de{" "}
                  <M tex="70 - \tfrac{580}{9} = \tfrac{50}{9} \approx 5{,}56 \text{ €}" /> —
                  exactement ce que lui rapporterait le petit lot (
                  <M tex="12 \times \tfrac{10}{3} - \tfrac{50}{9} - \tfrac{260}{9} = \tfrac{50}{9}" /> :
                  la contrainte d'incitation est saturée, L est indifférent et choisit le lot qui
                  lui est destiné). S prend le petit lot avec un surplus net nul.
                </p>
                <Callout variant="attention">
                  <p>
                    <strong>Le piège n° 1 de tout l'exercice :</strong> oublier le terme de coût{" "}
                    <M tex="-2y_S" /> dans le profit. Sans lui, la CPO redonnerait{" "}
                    <M tex="12 - 3y_S = 0" />, soit <M tex="y_S = 4" /> — le résultat du
                    chapitre, faux ici. Autre piège : arrondir <M tex="y_S = 3{,}33" /> trop tôt
                    puis propager l'erreur ; garde les fractions (<M tex="\tfrac{10}{3}" />,{" "}
                    <M tex="\tfrac{580}{9}" />, <M tex="\tfrac{260}{9}" />) jusqu'au bout, comme
                    le corrigé.
                  </p>
                </Callout>
                <Callout variant="intuition" title="Comparaison avec le cours — comprends pourquoi">
                  <p>
                    Au chapitre EI3 tu avais trouvé <M tex="y_S = 4" />, lots{" "}
                    <M tex="[64\text{ €} ;\, 12]" /> et <M tex="[32\text{ €} ;\, 4]" />, profit
                    96 €, rente de L égale à 8 €. Ici : <M tex="y_S = \tfrac{10}{3}" />, lots{" "}
                    <M tex="[64{,}44\text{ €} ;\, 10]" /> et{" "}
                    <M tex="[28{,}89\text{ €} ;\, 3{,}33]" />, profit 66,67 €, rente{" "}
                    <M tex="\tfrac{50}{9} \approx 5{,}56 \text{ €}" />. Deux effets du coût :
                    (i) dans la CPO, le « 12 » devient « 10 » car chaque unité vendue à S coûte
                    désormais 2 € — le petit lot est donc <em>encore plus rationné</em> (3,33
                    unités, contre un niveau efficace de 5) ; (ii) comme la rente de L vaut
                    toujours <M tex="\tfrac{1}{2}y_S^2" />, un petit lot plus petit signifie une
                    rente plus faible (5,56 € contre 8 €). Les deux signatures du 2e degré —
                    petit lot rationné, gros client renté — survivent, mais le coût les
                    déplace toutes les deux.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>Réponses officielles.</strong> Q1 : <M tex="Y = 7{,}5" />,{" "}
              <M tex="p = 7 \text{ €}" />, <M tex="\Pi = 37{,}5 \text{ €}" /> · Q2 : 10 unités à
              L pour 70 €, 5 unités à S pour 35 €, <M tex="\Pi = 75 \text{ €}" /> · Q3 : lots de
              10 unités pour 64,44 € et de 3,33 unités pour 28,89 €,{" "}
              <M tex="\Pi = 66{,}67 \text{ €}" />.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-[14.5px]">
                <thead>
                  <tr>
                    <th className={TH}>Régime (Cm = 2)</th>
                    <th className={THc}>Quantités (L / S)</th>
                    <th className={THc}>Recettes</th>
                    <th className={THc}>Profit</th>
                    <th className={THc}>Surplus conso.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={TD}>Monopole simple</td>
                    <td className={TDc}>5 / 2,5 (p = 7 €)</td>
                    <td className={TDc}>52,50 €</td>
                    <td className={TDc}>37,50 €</td>
                    <td className={TDc}>18,75 €</td>
                  </tr>
                  <tr>
                    <td className={TD}>Discrimination 1er degré</td>
                    <td className={TDc}>10 / 5</td>
                    <td className={TDc}>70 € + 35 €</td>
                    <td className={TDc}>
                      <strong>75 €</strong>
                    </td>
                    <td className={TDc}>0 €</td>
                  </tr>
                  <tr>
                    <td className={TD}>Discrimination 2e degré</td>
                    <td className={TDc}>10 / 3,33</td>
                    <td className={TDc}>64,44 € + 28,89 €</td>
                    <td className={TDc}>66,67 €</td>
                    <td className={TDc}>5,56 € (rente de L)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Le classement des profits est le même qu'au chapitre (1er degré, puis 2e degré,
              puis monopole simple : 75 ; 66,67 ; 37,5 — contre 108 ; 96 ; 54 avec{" "}
              <M tex="Cm = 0" />), et les conclusions qualitatives survivent toutes : le 1er
              degré est efficace et tond les consommateurs, le 2e degré rationne le petit lot et
              laisse une rente au gros client.
            </p>
            <p>
              <strong>Le transfert de méthode à retenir :</strong> un coût marginal positif ne
              change aucune <em>méthode</em>, il déplace trois choses. (i) Monopole simple :
              c'est toujours <M tex="Rm = Cm" />, avec 2 à droite au lieu de 0. (ii) 1er degré :
              la règle d'arrêt des lots devient « disposition à payer = <M tex="Cm" /> » (10 et
              5 unités au lieu de 12 et 6), et les montants restent l'aire complète sous la
              demande jusqu'à cette quantité. (iii) 2e degré : mêmes contraintes de
              participation et d'incitation, mais le profit à maximiser soustrait{" "}
              <M tex="2(10 + y_S)" /> — le terme <M tex="-2y_S" /> rationne davantage le petit
              lot et fait fondre la rente d'information (<M tex="\tfrac{1}{2}y_S^2" />). Si tu
              sais refaire ces trois déplacements avec n'importe quel <M tex="Cm" />, l'exercice
              est maîtrisé.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp3"
        id="qx1"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Pourquoi l'exercice te fait-il calculer le monopole <em>simple</em> (question 1)
            avant les deux formes de discrimination ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce qu'il sert de <strong>référence</strong> : 37,5 € est le profit accessible{" "}
                <em>sans aucune information</em> sur les acheteurs ; les gains de la
                discrimination se mesurent par rapport à lui (75 € au 1er degré, 66,67 € au 2e).
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement. C'est le même rôle de « benchmark » que dans le chapitre EI3 (54 €
                face à 108 € et 96 €) : sans point de comparaison, impossible de dire ce que
                l'information sur les consommateurs <em>vaut</em> pour le monopole.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que le calcul <M tex="Rm = Cm" /> est indispensable pour trouver les lots
                du 1er degré.
              </>
            ),
            explain: (
              <>
                Non : le 1er degré n'utilise pas la recette marginale sur la demande globale. Il
                raisonne demande par demande, en poussant chaque lot jusqu'à « disposition à
                payer = <M tex="Cm" /> » et en facturant le surplus brut.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que le monopole simple est le régime le plus profitable, que les autres
                cherchent à égaler.
              </>
            ),
            explain: (
              <>
                C'est l'inverse : le prix unique est le régime le <em>moins</em> profitable des
                trois (37,5 € contre 66,67 € et 75 €). Plus le monopole peut discriminer, plus
                il extrait de surplus.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Réflexe d'examen : quand un énoncé enchaîne « monopole simple → 1er degré →
            2e degré », chiffre chaque régime puis <em>classe les profits</em>. Le classement
            (1er ≥ 2e ≥ simple) est une vérification gratuite de tes calculs — s'il n'est pas
            respecté, une erreur s'est glissée quelque part.
          </>
        }
      />

      <Quiz
        scope="tp3"
        id="qx2"
        kicker="Le réflexe clé du 1er degré"
        question={
          <>
            Au chapitre EI3 (<M tex="Cm = 0" />), le monopole du 1er degré vendait 12 unités à L
            et 6 à S. Pourquoi s'arrête-t-il ici à 10 et 5 ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce qu'au-delà, la disposition à payer de l'acheteur tombe sous 2 € : chaque
                unité supplémentaire augmenterait le montant facturable de moins qu'elle ne coûte
                à produire. La règle générale est « pousser le lot jusqu'à disposition à payer
                = <M tex="Cm" /> ».
              </>
            ),
            correct: true,
            explain: (
              <>
                C'est ça. Avec <M tex="Cm = 0" />, la règle donnait 12 et 6 (disposition à payer
                nulle) ; avec <M tex="Cm = 2" />, elle donne 10 et 5. Preuve par les chiffres :
                les lots « du cours » rapporteraient <M tex="72 + 36 - 2 \times 18 = 72" /> €,
                contre 75 € pour les lots optimaux.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que les consommateurs refusent d'acheter plus de 10 (respectivement 5)
                unités.
              </>
            ),
            explain: (
              <>
                Non : L valorise positivement les unités jusqu'à 12, S jusqu'à 6. C'est le{" "}
                <em>monopole</em> qui choisit de ne pas les inclure dans les lots, car elles
                valent moins que leur coût de production — les vendre détruirait du profit.
              </>
            ),
          },
          {
            text: <>Parce que la capacité de production est limitée à 15 unités.</>,
            explain: (
              <>
                Aucune contrainte de capacité dans le modèle : le monopole peut produire autant
                qu'il veut à 2 € l'unité. La limite vient de la comparaison valeur/coût de
                chaque unité, pas d'un plafond physique.
              </>
            ),
          },
        ]}
      />

      <Quiz
        scope="tp3"
        id="qx3"
        kicker="La rente d'information sous la loupe"
        question={
          <>
            Au chapitre EI3, L conservait une rente d'information de 8 €. Que devient-elle avec{" "}
            <M tex="Cm = 2" />, et pourquoi ?
          </>
        }
        options={[
          {
            text: (
              <>
                Elle diminue à <M tex="\tfrac{50}{9} \approx 5{,}56" /> € : la rente vaut
                toujours <M tex="\tfrac{1}{2}y_S^2" />, or le petit lot optimal rétrécit (
                <M tex="\tfrac{10}{3}" /> au lieu de 4) car chaque unité vendue à S coûte
                désormais 2 € — un lot s plus maigre tente moins L, donc il coûte moins cher de
                le garder sur le gros lot.
              </>
            ),
            correct: true,
            explain: (
              <>
                Parfait. La rente de L est la valeur de son « camouflage en petit
                consommateur » : elle ne dépend que de la taille du petit lot (
                <M tex="\tfrac{1}{2}y_S^2" />). Le coût marginal réduit <M tex="y_S^*" /> (la
                CPO passe de <M tex="12 - 3y_S = 0" /> à <M tex="10 - 3y_S = 0" />), donc la
                rente fond mécaniquement de 8 € à 5,56 €.
              </>
            ),
          },
          {
            text: (
              <>
                Elle disparaît : avec des coûts de production, le monopole ne peut plus se
                permettre de laisser du surplus à qui que ce soit.
              </>
            ),
            explain: (
              <>
                Non : tant que le menu contient un petit lot, L peut s'en emparer — le monopole{" "}
                <em>doit</em> donc lui laisser au moins l'équivalent (<M tex="\tfrac{50}{9}" /> €)
                pour qu'il choisisse le gros lot. La rente est le prix de l'auto-sélection, pas
                une générosité.
              </>
            ),
          },
          {
            text: (
              <>
                Elle augmente : le coût affaiblit le monopole, ce qui met L en meilleure position
                pour « négocier ».
              </>
            ),
            explain: (
              <>
                Il n'y a aucune négociation dans ce modèle : le monopole fixe le menu, les
                consommateurs choisissent. Et l'effet va dans l'autre sens — le coût pousse le
                monopole à rationner davantage le petit lot, ce qui <em>réduit</em> la rente de
                L.
              </>
            ),
          },
        ]}
        explanation={
          <>
            À retenir pour l'examen : dans tout problème de 2e degré, la rente du gros
            consommateur se lit directement sur la taille du petit lot. Tout ce qui réduit{" "}
            <M tex="y_S^*" /> (un coût marginal plus élevé, ici) réduit la rente — c'est le même
            arbitrage « efficacité contre extraction » que dans le screening du cours de
            stratégies.
          </>
        }
      />
    </TpShell>
  );
}
