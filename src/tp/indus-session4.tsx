/**
 * TP · Séance 4 — Les économies de réseau (Économie industrielle, EI4).
 *
 * Énoncé fidèle au document officiel « Exercice à préparer avant le cours —
 * Chapitre 4 Les économies de réseau » (Alice et Baptiste) ; résolution pas à
 * pas alignée sur le corrigé officiel (9 diapositives), graphiques compris :
 * demande en escalier sans effet de réseau, puis demande avec effet de réseau
 * et zone d'équilibres multiples selon p.
 */
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TDc = "border-b px-3 py-2.5 text-center";

/* Couleurs des paliers de demande (cohérentes sur les trois graphiques). */
const COL_Y0 = "#e11d48"; // rose-600 — y = 0, personne n'achète
const COL_Y1 = "#d97706"; // amber-600 — y = 1, seule Alice achète
const COL_Y2 = "#0284c7"; // sky-600 — y = 2, les deux achètent
const COL_ZONE = "#8b5cf6"; // violet-500 — zone d'équilibres multiples

/* Géométrie commune des graphiques de demande (axes p vertical, y horizontal). */
const X0 = 48; // axe des prix (quantité 0)
const XR = 312; // bout de l'axe des quantités
const Y0 = 196; // axe des quantités (prix 0)
const YT = 18; // sommet de l'axe des prix
const X1 = 168; // abscisse de la quantité 1
const X2 = 262; // abscisse de la quantité 2
const Y_HAUT = 64; // ordonnée du seuil de prix élevé
const Y_BAS = 132; // ordonnée du seuil de prix bas

/** Étiquette de prix « r_X » (avec indice), éventuellement suivie de « + v ». */
function LabelR({ y, sub, plusV }: { y: number; sub: string; plusV?: boolean }) {
  return (
    <text
      x={X0 - 8}
      y={y}
      textAnchor="end"
      fontSize={12.5}
      fontStyle="italic"
      fill="var(--color-foreground)"
    >
      r
      <tspan dy={3} fontSize={9}>
        {sub}
      </tspan>
      {plusV ? <tspan dy={-3}> + v</tspan> : null}
    </text>
  );
}

/** Axes, flèches, graduations 1 et 2 — le squelette commun des graphiques. */
function AxesDemande() {
  return (
    <>
      <line x1={X0} y1={Y0} x2={XR} y2={Y0} stroke="var(--color-foreground)" strokeWidth={1.2} />
      <line x1={X0} y1={Y0} x2={X0} y2={YT} stroke="var(--color-foreground)" strokeWidth={1.2} />
      <polyline
        points={`${XR - 6},${Y0 - 4} ${XR},${Y0} ${XR - 6},${Y0 + 4}`}
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth={1.2}
      />
      <polyline
        points={`${X0 - 4},${YT + 6} ${X0},${YT} ${X0 + 4},${YT + 6}`}
        fill="none"
        stroke="var(--color-foreground)"
        strokeWidth={1.2}
      />
      <text x={X0 - 16} y={YT + 10} fontSize={13} fontStyle="italic" fill="var(--color-foreground)">
        p
      </text>
      <text x={XR - 2} y={Y0 + 18} fontSize={13} fontStyle="italic" fill="var(--color-foreground)">
        y
      </text>
      {[
        [X1, "1"],
        [X2, "2"],
      ].map(([x, lab]) => (
        <g key={lab}>
          <line x1={Number(x)} y1={Y0} x2={Number(x)} y2={Y0 + 4} stroke="var(--color-foreground)" strokeWidth={1.2} />
          <text
            x={Number(x)}
            y={Y0 + 17}
            fontSize={11.5}
            fontStyle="italic"
            textAnchor="middle"
            fill="var(--color-muted-foreground)"
          >
            {lab}
          </text>
        </g>
      ))}
    </>
  );
}

function LigneSeuil({ y }: { y: number }) {
  return (
    <line
      x1={X0}
      y1={y}
      x2={XR - 26}
      y2={y}
      stroke="var(--color-muted-foreground)"
      strokeWidth={1}
      strokeDasharray="4 4"
      opacity={0.75}
    />
  );
}

/**
 * Demande en escalier à trois paliers (questions 1 et 2.3 cas 1) : y = 0
 * au-dessus du seuil haut, y = 1 entre les deux seuils, y = 2 en dessous.
 * `basPlusV` remplace l'étiquette du seuil bas r_B par r_B + v (cas 1 de 2.3).
 */
function GrapheDemandeEscalier({ basPlusV, ariaLabel }: { basPlusV?: boolean; ariaLabel: string }) {
  return (
    <svg viewBox="0 0 330 224" className="w-full" role="img" aria-label={ariaLabel}>
      <LigneSeuil y={Y_HAUT} />
      <LigneSeuil y={Y_BAS} />
      <AxesDemande />
      <line x1={X0} y1={YT + 8} x2={X0} y2={Y_HAUT} stroke={COL_Y0} strokeWidth={5} strokeLinecap="round" />
      <line x1={X1} y1={Y_HAUT} x2={X1} y2={Y_BAS} stroke={COL_Y1} strokeWidth={5} strokeLinecap="round" />
      <line x1={X2} y1={Y_BAS} x2={X2} y2={Y0 - 3} stroke={COL_Y2} strokeWidth={5} strokeLinecap="round" />
      <LabelR y={Y_HAUT + 4} sub="A" />
      <LabelR y={Y_BAS + 4} sub="B" plusV={basPlusV} />
    </svg>
  );
}

/**
 * Demande avec effet de réseau fort (2.3 cas 2, v > r_A − r_B) : les seuils
 * s'inversent et une zone de prix (r_A, r_B + v) admet DEUX équilibres.
 */
function GrapheDemandeMultiple() {
  return (
    <svg
      viewBox="0 0 330 224"
      className="w-full"
      role="img"
      aria-label="Demande avec effet de réseau fort : pour un prix entre rA et rB plus v, deux équilibres coexistent, personne n'achète ou les deux achètent"
    >
      <rect
        x={X0 + 1}
        y={Y_HAUT}
        width={XR - 27 - X0}
        height={Y_BAS - Y_HAUT}
        fill={COL_ZONE}
        opacity={0.12}
      />
      <LigneSeuil y={Y_HAUT} />
      <LigneSeuil y={Y_BAS} />
      <AxesDemande />
      <line x1={X0} y1={YT + 8} x2={X0} y2={Y_BAS} stroke={COL_Y0} strokeWidth={5} strokeLinecap="round" />
      <line x1={X2} y1={Y_HAUT} x2={X2} y2={Y0 - 3} stroke={COL_Y2} strokeWidth={5} strokeLinecap="round" />
      <text
        x={(X0 + XR - 26) / 2}
        y={(Y_HAUT + Y_BAS) / 2 - 3}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={COL_ZONE}
      >
        deux équilibres possibles
      </text>
      <text
        x={(X0 + XR - 26) / 2}
        y={(Y_HAUT + Y_BAS) / 2 + 12}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={COL_ZONE}
      >
        y = 0 ou y = 2
      </text>
      <LabelR y={Y_HAUT + 4} sub="B" plusV />
      <LabelR y={Y_BAS + 4} sub="A" />
    </svg>
  );
}

function LegendeDemande({ avecY1 = true }: { avecY1?: boolean }) {
  const items = [
    { color: COL_Y0, label: "y = 0 — personne n'achète" },
    ...(avecY1 ? [{ color: COL_Y1, label: "y = 1 — seule Alice achète" }] : []),
    { color: COL_Y2, label: "y = 2 — les deux achètent" },
  ];
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* Matrice symbolique de la question 2.1 (bénéfices en KaTeX : la           */
/* PayoffMatrix interactive exige des nombres, on la réserve à l'exemple).  */
function MatriceSymbolique() {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-[15px]">
        <thead>
          <tr>
            <th className={TH} />
            <th className={THc}>
              <span className="text-sky-700">Baptiste achète</span>
            </th>
            <th className={THc}>
              <span className="text-sky-700">Baptiste n'achète pas</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={TH + " text-rose-700"}>Alice achète</th>
            <td className={TDc}>
              <span className="font-semibold text-rose-700">
                <M tex="r_A + v - p" />
              </span>
              <span className="text-muted-foreground">{" ; "}</span>
              <span className="font-semibold text-sky-700">
                <M tex="r_B + v - p" />
              </span>
            </td>
            <td className={TDc}>
              <span className="font-semibold text-rose-700">
                <M tex="r_A - p" />
              </span>
              <span className="text-muted-foreground">{" ; "}</span>
              <span className="font-semibold text-sky-700">
                <M tex="0" />
              </span>
            </td>
          </tr>
          <tr>
            <th className={TH + " text-rose-700"}>Alice n'achète pas</th>
            <td className={TDc}>
              <span className="font-semibold text-rose-700">
                <M tex="0" />
              </span>
              <span className="text-muted-foreground">{" ; "}</span>
              <span className="font-semibold text-sky-700">
                <M tex="r_B - p" />
              </span>
            </td>
            <td className={TDc}>
              <span className="font-semibold text-rose-700">
                <M tex="0" />
              </span>
              <span className="text-muted-foreground">{" ; "}</span>
              <span className="font-semibold text-sky-700">
                <M tex="0" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Dans chaque case : bénéfice net d'<span className="font-semibold text-rose-700">Alice</span>
        {" ; "}bénéfice net de <span className="font-semibold text-sky-700">Baptiste</span>.
      </p>
    </div>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={4}
      intro={
        <>
          <p>
            Cette séance est consacrée au chapitre <strong>EI4 — les économies de réseau</strong> :
            tu y résous l'exercice officiel à préparer, où la valeur d'un bien pour Alice et
            Baptiste dépend de ce que fait l'autre. Avant de te lancer, révise en priorité les
            sections « Effets de réseau directs et indirects » et « Effets de réseau directs en
            monopole » du chapitre EI4, ainsi que l'équilibre de Nash vu dans le cours de
            stratégies. Conseil de méthode : ici tout se joue <em>cas par cas</em> — pour chaque
            profil (« les deux achètent », « seule Alice achète »…), écris les deux conditions de
            non-déviation, puis traduis-les en conditions sur le prix <M tex="p" />. Et tente
            chaque question au brouillon avant de révéler les étapes !
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — Alice, Baptiste et le bien à effet de réseau     */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp4"
        id="ex1"
        number={1}
        title="Alice, Baptiste et le bien à effet de réseau"
        difficulty={2}
        refs={[
          { chapter: "ei4", section: "intro" },
          { chapter: "ei4", section: "effets-directs-mono" },
          { chapter: "b1", course: "strategies", section: "s5" },
        ]}
        statement={
          <>
            <p>
              Considérez deux consommateurs (Alice et Baptiste) qui envisagent d'acheter chacun un
              bien particulier. Une unité du bien procurerait un bénéfice <M tex="r_A" /> à Alice
              et un bénéfice <M tex="r_B" /> à Baptiste. Acheter des unités supplémentaires ne
              changerait pas leur utilité. Supposez que <M tex="r_A > r_B" />. Notez <M tex="p" />{" "}
              le prix du bien.
            </p>
            <SubQuestion label="1">
              Dessinez la demande pour ce bien (en fonction du prix elle vaut 0 ou 1 ou 2).
            </SubQuestion>
            <p>
              2. Supposez maintenant qu'il existe un bénéfice supplémentaire pour chaque
              utilisateur s'ils achètent tous les deux le bien (ils peuvent interagir). Notez ce
              bénéfice <M tex="v" />, qui n'existe donc que si Alice <strong>et</strong> Baptiste
              achètent le bien.
            </p>
            <SubQuestion label="2.1">
              Tracez une matrice de jeux dans laquelle les stratégies de chaque joueur
              correspondent à l'achat ou au non-achat du bien. Reportez-y les bénéfices nets de
              chaque joueur.
            </SubQuestion>
            <p className="text-sm italic text-muted-foreground">
              Les quatre tirets de la question 2.2 sont numérotés (a)–(d) ci-dessous pour pouvoir
              s'y référer dans la résolution.
            </p>
            <SubQuestion label="2.2 (a)">
              Pour quelles valeurs de <M tex="p" /> existe-t-il un équilibre de Nash où Alice et
              Baptiste achètent tous les deux le bien ?
            </SubQuestion>
            <SubQuestion label="2.2 (b)">
              Pour quelles valeurs de <M tex="p" /> existe-t-il un équilibre de Nash où seule
              Alice achète le bien ?
            </SubQuestion>
            <SubQuestion label="2.2 (c)">
              Pour quelles valeurs de <M tex="p" /> existe-t-il un équilibre de Nash où seul
              Baptiste achète le bien ?
            </SubQuestion>
            <SubQuestion label="2.2 (d)">
              Pour quelles valeurs de <M tex="p" /> existe-t-il un équilibre de Nash où personne
              n'achète le bien ?
            </SubQuestion>
            <SubQuestion label="2.3">
              Tracez la demande pour le bien en distinguant ces deux cas : (1){" "}
              <M tex="v < r_A - r_B" /> et (2) <M tex="v > r_A - r_B" />.
            </SubQuestion>
          </>
        }
        steps={[
          /* ------------------------------------------------------- */
          {
            title: "1 — La demande sans effet de réseau : compter qui achète à chaque prix",
            refs: [{ chapter: "ei4", section: "intro" }],
            content: (
              <>
                <p>
                  Sans effet de réseau, chaque consommateur décide <em>seul</em> : il achète si et
                  seulement si son bénéfice net est positif. Alice achète si{" "}
                  <M tex="r_A - p > 0" />, c'est-à-dire <M tex="p < r_A" /> ; Baptiste achète si{" "}
                  <M tex="p < r_B" />. La demande au prix <M tex="p" /> est simplement le{" "}
                  <em>nombre</em> de consommateurs dont la disposition à payer dépasse{" "}
                  <M tex="p" />. Comme <M tex="r_A > r_B" />, trois zones de prix se dessinent :
                </p>
                <MB tex="\text{Si } p > r_A : \quad y = 0 \qquad \text{(même Alice renonce)}" />
                <MB tex="\text{Si } p \in (r_B,\, r_A) : \quad y = 1 \qquad \text{(seule Alice achète)}" />
                <MB tex="\text{Si } p < r_B : \quad y = 2 \qquad \text{(les deux achètent)}" />
                <p>
                  Il s'agit d'une <strong>demande décroissante par paliers</strong> (en escalier),
                  exactement comme dans le corrigé :
                </p>
                <figure className="my-4 rounded-xl border bg-card p-3 sm:p-4">
                  <GrapheDemandeEscalier ariaLabel="Demande en escalier sans effet de réseau : zéro unité au-dessus de rA, une unité entre rB et rA, deux unités sous rB" />
                  <LegendeDemande />
                </figure>
                <Callout variant="methode">
                  <p>
                    Avec des biens « unitaires » (chacun achète 0 ou 1 unité), trace toujours la
                    demande en <strong>classant les dispositions à payer</strong> de la plus haute
                    à la plus basse : chaque fois que le prix passe sous l'une d'elles, la demande
                    gagne un palier. Aux prix-frontière exacts (<M tex="p = r_A" /> ou{" "}
                    <M tex="p = r_B" />), le consommateur concerné est indifférent — le corrigé
                    raisonne donc en inégalités strictes, et nous ferons pareil.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "2.1 — Construire la matrice de jeu, case par case",
            refs: [
              { chapter: "ei4", section: "effets-directs-mono" },
              { chapter: "b1", course: "strategies", section: "s2" },
            ],
            content: (
              <>
                <p>
                  Avec le bénéfice d'interaction <M tex="v" />, le gain de chacun dépend du choix
                  de l'autre : la décision d'achat devient un <strong>jeu simultané</strong> à
                  deux joueurs, chacun ayant deux stratégies (acheter / ne pas acheter). On
                  remplit les quatre cases en écrivant le bénéfice <em>net</em> (bénéfice moins
                  prix payé) :
                </p>
                <ul className="my-2 list-disc space-y-1 pl-6">
                  <li>
                    <strong>Les deux achètent</strong> : chacun paie <M tex="p" /> et touche son
                    bénéfice de base <em>plus</em> <M tex="v" /> → <M tex="r_A + v - p" /> pour
                    Alice, <M tex="r_B + v - p" /> pour Baptiste.
                  </li>
                  <li>
                    <strong>Seule Alice achète</strong> : Alice consomme sans partenaire
                    d'interaction → <M tex="r_A - p" /> ; Baptiste ne paie rien et n'a rien →{" "}
                    <M tex="0" />.
                  </li>
                  <li>
                    <strong>Seul Baptiste achète</strong> : symétriquement <M tex="0" /> pour
                    Alice et <M tex="r_B - p" /> pour Baptiste.
                  </li>
                  <li>
                    <strong>Personne n'achète</strong> : <M tex="(0,\ 0)" />.
                  </li>
                </ul>
                <MatriceSymbolique />
                <Callout variant="attention">
                  <p>
                    Le bonus <M tex="v" /> n'apparaît que dans <strong>une seule case</strong> :
                    celle où les deux achètent. Erreur classique : ajouter <M tex="v" /> au
                    bénéfice d'un joueur qui achète seul. Non — l'effet de réseau n'existe que si
                    l'<em>autre</em> utilisateur est là aussi. Garde ce point en tête : il
                    resurgit à chaque condition de déviation de la question 2.2.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "La méthode pour 2.2 — tester un équilibre de Nash, profil par profil",
            refs: [{ chapter: "b1", course: "strategies", section: "s5" }],
            content: (
              <>
                <Callout variant="definition">
                  <p>
                    Un profil de stratégies est un <strong>équilibre de Nash</strong> si aucun
                    joueur ne peut augmenter son gain en <em>déviant seul</em>, la stratégie de
                    l'autre restant fixée.
                  </p>
                </Callout>
                <p>
                  Dans une matrice 2×2, cela donne une recette mécanique : pour la case testée,
                  écris <strong>deux conditions</strong> — une par joueur — en comparant son gain
                  dans la case à son gain s'il bascule seul vers son autre stratégie (Alice se
                  déplace verticalement, Baptiste horizontalement). La question « pour quelles
                  valeurs de <M tex="p" /> existe-t-il un équilibre où… ? » se traduit alors par :
                  « pour quels <M tex="p" /> ces deux inégalités sont-elles satisfaites
                  simultanément ? ».
                </p>
                <Callout variant="methode">
                  <p>
                    Plan des quatre étapes suivantes, une par profil : (a) les deux achètent, (b)
                    seule Alice, (c) seul Baptiste, (d) personne. À chaque fois : condition du
                    joueur 1, condition du joueur 2, puis on garde la condition la plus exigeante
                    (celle qui « mord »). C'est exactement la structure du corrigé.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "2.2 (a) — Équilibre où Alice et Baptiste achètent tous les deux",
            refs: [{ chapter: "b1", course: "strategies", section: "s5" }],
            content: (
              <>
                <p>
                  On teste la case <M tex="(r_A + v - p,\ r_B + v - p)" />. Il faut que :
                </p>
                <p>
                  <strong>(1)</strong> Alice préfère acheter si Baptiste a acheté (sinon elle
                  dévierait vers 0) :
                </p>
                <MB tex="r_A + v - p > 0 \;\Longleftrightarrow\; p < r_A + v" />
                <p>
                  <strong>(2)</strong> Baptiste préfère acheter si Alice a acheté :
                </p>
                <MB tex="r_B + v - p > 0 \;\Longleftrightarrow\; p < r_B + v" />
                <p>
                  Comme <M tex="r_A > r_B" />, la condition (2) est la plus exigeante : dès que{" "}
                  <M tex="p < r_B + v" />, on a automatiquement <M tex="p < r_A + v" />. La
                  réponse du corrigé est donc :
                </p>
                <MB tex="p < r_B + v" />
                <Callout variant="intuition">
                  <p>
                    C'est le consommateur qui valorise le <em>moins</em> le bien (Baptiste) qui
                    fixe la limite : pour garder tout le monde dans le réseau, le prix doit rester
                    sous sa disposition à payer <em>effet de réseau inclus</em>, soit{" "}
                    <M tex="r_B + v" /> — un seuil plus haut que son <M tex="r_B" /> de départ.
                    L'effet de réseau élargit la zone de prix où la demande totale est de 2.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "2.2 (b) — Équilibre où seule Alice achète",
            refs: [{ chapter: "b1", course: "strategies", section: "s5" }],
            content: (
              <>
                <p>
                  On teste la case <M tex="(r_A - p,\ 0)" />. Deux conditions, une par joueur —
                  et cette fois l'une des deux porte sur le <em>non-acheteur</em> :
                </p>
                <p>
                  <strong>(1)</strong> Alice préfère acheter si Baptiste n'a pas acheté. Attention
                  : elle achèterait <em>seule</em>, donc sans le bonus <M tex="v" /> :
                </p>
                <MB tex="r_A - p > 0 \;\Longleftrightarrow\; p < r_A" />
                <p>
                  <strong>(2)</strong> Baptiste préfère <em>ne pas</em> acheter si Alice a acheté.
                  Ici le <M tex="v" /> réapparaît : si Baptiste déviait, ils seraient <em>deux</em>{" "}
                  dans le réseau, et son gain de déviation serait <M tex="r_B + v - p" /> :
                </p>
                <MB tex="0 > r_B + v - p \;\Longleftrightarrow\; p > r_B + v" />
                <p>Il faut donc que le prix soit dans l'intervalle :</p>
                <MB tex="p \in (r_B + v,\; r_A)" />
                <p>
                  … et pour que cet intervalle soit non vide, il faut aussi que{" "}
                  <M tex="r_B + v < r_A" />, c'est-à-dire <M tex="v < r_A - r_B" /> : cet
                  équilibre ne peut exister que si l'effet de réseau est <em>faible</em> par
                  rapport à l'écart des dispositions à payer.
                </p>
                <Callout variant="attention">
                  <p>
                    Deux pièges dans cette question. (i) Oublier la condition du non-acheteur :
                    « Baptiste n'achète pas » doit être sa <em>meilleure réponse</em>, pas un
                    simple constat — c'est elle qui impose <M tex="p > r_B + v" />. (ii) Mal
                    placer le <M tex="v" /> : dans la condition (1) Alice achèterait seule (pas de{" "}
                    <M tex="v" />), dans la condition (2) la déviation de Baptiste créerait la
                    paire (le <M tex="v" /> est là). Demande-toi toujours : « après la déviation,
                    combien d'utilisateurs y a-t-il ? »
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "2.2 (c) — Équilibre où seul Baptiste achète : impossible",
            refs: [{ chapter: "b1", course: "strategies", section: "s5" }],
            content: (
              <>
                <p>
                  Même mécanique sur la case <M tex="(0,\ r_B - p)" /> :
                </p>
                <p>
                  <strong>(1)</strong> Baptiste préfère acheter si Alice n'a pas acheté (achat en
                  solo, sans <M tex="v" />) :
                </p>
                <MB tex="r_B - p > 0 \;\Longleftrightarrow\; p < r_B" />
                <p>
                  <strong>(2)</strong> Alice préfère ne pas acheter si Baptiste a acheté (sa
                  déviation formerait la paire, donc gain <M tex="r_A + v - p" />) :
                </p>
                <MB tex="0 > r_A + v - p \;\Longleftrightarrow\; p > r_A + v" />
                <p>
                  Ces deux conditions sont <strong>incompatibles</strong> car{" "}
                  <M tex="r_A > r_B" /> : il faudrait à la fois
                </p>
                <MB tex="p < r_B < r_A < r_A + v < p" />
                <p>
                  ce qui est impossible. Il n'existe <strong>aucune</strong> valeur de{" "}
                  <M tex="p" /> pour laquelle « seul Baptiste achète » est un équilibre de Nash.
                </p>
                <Callout variant="intuition">
                  <p>
                    Logique : si le bien vaut le coup pour Baptiste <em>tout seul</em>, alors il
                    vaut a fortiori le coup pour Alice, qui le valorise davantage (
                    <M tex="r_A > r_B" />) et qui toucherait <em>en plus</em> le bonus{" "}
                    <M tex="v" /> en rejoignant Baptiste. Le « petit » acheteur ne peut jamais
                    être seul dans le réseau à l'équilibre.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "2.2 (d) — Équilibre où personne n'achète",
            refs: [{ chapter: "b1", course: "strategies", section: "s5" }],
            content: (
              <>
                <p>
                  Dernière case, <M tex="(0,\ 0)" />. Chaque joueur doit préférer rester dehors,
                  sachant que l'autre est dehors. Le déviant achèterait <em>seul</em> — donc,
                  encore une fois, <strong>sans le bonus</strong> <M tex="v" /> :
                </p>
                <p>
                  <strong>(1)</strong> Alice préfère ne pas acheter si Baptiste n'a pas acheté :
                </p>
                <MB tex="0 > r_A - p \;\Longleftrightarrow\; p > r_A" />
                <p>
                  <strong>(2)</strong> Baptiste préfère ne pas acheter si Alice n'a pas acheté :
                </p>
                <MB tex="0 > r_B - p \;\Longleftrightarrow\; p > r_B" />
                <p>
                  Comme <M tex="r_A > r_B" />, c'est la condition d'Alice qui mord : il faut
                </p>
                <MB tex="p > r_A" />
                <Callout variant="attention">
                  <p>
                    Remarque bien que <M tex="v" /> n'apparaît <em>nulle part</em> ici : partant
                    de « personne n'achète », toute déviation est un achat en solitaire. C'est
                    précisément pour cela que « personne n'achète » peut rester un équilibre même
                    à des prix où « les deux achètent » en serait un aussi — personne ne veut
                    faire le premier pas seul. Tu vas le voir en 2.3.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "2.3 — La demande avec effet de réseau : deux cas, et une zone à deux équilibres",
            refs: [
              { chapter: "ei4", section: "effets-directs-mono" },
              { chapter: "b1", course: "strategies", section: "s5" },
            ],
            content: (
              <>
                <p>On résume les résultats de 2.2 (c'est le résumé exact du corrigé) :</p>
                <MB tex="y = 0 \ \text{ si } p > r_A, \qquad y = 1 \ \text{ si } p \in (r_B + v,\ r_A), \qquad y = 2 \ \text{ si } p < r_B + v." />
                <p>
                  Tout dépend alors de l'ordre des deux seuils <M tex="r_A" /> et{" "}
                  <M tex="r_B + v" /> — d'où les deux cas demandés par l'énoncé.
                </p>
                <p>
                  <strong>
                    Cas 1 : <M tex="v < r_A - r_B" />
                  </strong>{" "}
                  (effet de réseau faible, donc <M tex="r_B + v < r_A" />). Les trois zones de
                  prix se suivent sans se chevaucher : la demande reste un escalier à trois
                  paliers, avec un équilibre <em>unique</em> à chaque prix. Par rapport à la
                  question 1, une seule chose change : le seuil du palier <M tex="y = 2" /> monte
                  de <M tex="r_B" /> à <M tex="r_B + v" /> — l'effet de réseau rehausse la
                  disposition à payer de Baptiste quand Alice est dans le réseau.
                </p>
                <p>
                  <strong>
                    Cas 2 : <M tex="v > r_A - r_B" />
                  </strong>{" "}
                  (effet de réseau fort, donc <M tex="r_B + v > r_A" />). L'intervalle{" "}
                  <M tex="(r_B + v,\ r_A)" /> est <em>vide</em> : le palier <M tex="y = 1" />{" "}
                  disparaît. Surtout, les deux zones restantes se <strong>chevauchent</strong> :
                  pour tout prix <M tex="p \in (r_A,\ r_B + v)" />, on a à la fois{" "}
                  <M tex="p > r_A" /> (donc « personne n'achète » est un équilibre) et{" "}
                  <M tex="p < r_B + v" /> (donc « les deux achètent » est un équilibre). La
                  « demande » n'est plus une fonction mais une <strong>correspondance</strong> :
                  au même prix, <M tex="y = 0" /> et <M tex="y = 2" /> sont tous deux possibles.
                </p>
                <div className="my-4 grid gap-4 sm:grid-cols-2">
                  <figure className="rounded-xl border bg-card p-3">
                    <figcaption className="mb-1 text-center text-[13px] font-bold">
                      Cas 1 : <M tex="v < r_A - r_B" />
                    </figcaption>
                    <GrapheDemandeEscalier
                      basPlusV
                      ariaLabel="Demande avec effet de réseau faible : escalier à trois paliers, seuils rA puis rB plus v"
                    />
                  </figure>
                  <figure className="rounded-xl border bg-card p-3">
                    <figcaption className="mb-1 text-center text-[13px] font-bold">
                      Cas 2 : <M tex="v > r_A - r_B" />
                    </figcaption>
                    <GrapheDemandeMultiple />
                  </figure>
                </div>
                <LegendeDemande />
                <Callout variant="attention">
                  <p>
                    Ne confonds pas « un équilibre <em>existe</em> » et « l'équilibre est{" "}
                    <em>unique</em> ». Les quatre questions de 2.2 sont des questions
                    d'<strong>existence</strong>, traitées profil par profil : rien n'empêche
                    plusieurs réponses d'être vraies pour un même prix. C'est exactement ce qui
                    arrive dans le cas 2 sur <M tex="(r_A,\ r_B + v)" /> — et c'est le cœur du
                    chapitre, pas une bizarrerie de l'exercice.
                  </p>
                </Callout>
                <Callout variant="retiens">
                  <p>
                    Dans la zone à deux équilibres, ce sont les <strong>anticipations</strong> qui
                    tranchent : si chacun croit que l'autre achète, les deux achètent (et la
                    croyance se confirme) ; si chacun croit que l'autre s'abstient, personne
                    n'achète (et la croyance se confirme aussi). Ce sont les{" "}
                    <em>demandes auto-réalisatrices</em> du cours : pour décoller, un réseau doit
                    atteindre sa <strong>masse critique</strong> — d'où les stratégies de
                    lancement (prix bas, gratuité initiale, subvention des premiers utilisateurs)
                    qui visent à coordonner les croyances sur le « bon » équilibre.
                  </p>
                </Callout>
              </>
            ),
          },
          /* ------------------------------------------------------- */
          {
            title: "Vérifier avec des nombres — le jeu de coordination en action",
            refs: [
              { chapter: "ei4", section: "effets-directs-mono" },
              { chapter: "b1", course: "strategies", section: "s5" },
            ],
            content: (
              <>
                <p>
                  Pour ancrer la mécanique, prenons <M tex="r_A = 10" />, <M tex="r_B = 8" /> et{" "}
                  <M tex="v = 5" /> : on est dans le cas 2, car{" "}
                  <M tex="v = 5 > r_A - r_B = 2" />, et la zone à deux équilibres est{" "}
                  <M tex="p \in (10,\ 13)" />. Choisissons <M tex="p = 11" /> et remplissons la
                  matrice : <M tex="r_A + v - p = 4" />, <M tex="r_B + v - p = 2" />,{" "}
                  <M tex="r_A - p = -1" />, <M tex="r_B - p = -3" />. Révèle les meilleures
                  réponses puis les équilibres :
                </p>
                <PayoffMatrix
                  rowPlayer="Alice"
                  colPlayer="Baptiste"
                  rows={["Achète", "N'achète pas"]}
                  cols={["Achète", "N'achète pas"]}
                  payoffs={[
                    [
                      [4, 2],
                      [-1, 0],
                    ],
                    [
                      [0, -3],
                      [0, 0],
                    ],
                  ]}
                  interactive
                  caption={
                    <>
                      Le jeu d'Alice et Baptiste pour <M tex="r_A = 10" />, <M tex="r_B = 8" />,{" "}
                      <M tex="v = 5" />, <M tex="p = 11" /> : deux équilibres de Nash, (Achète ;
                      Achète) et (N'achète pas ; N'achète pas).
                    </>
                  }
                />
                <p>
                  C'est un <strong>jeu de coordination</strong> : les deux joueurs préfèrent
                  l'équilibre (Achète ; Achète), qui donne <M tex="(4,\ 2)" /> au lieu de{" "}
                  <M tex="(0,\ 0)" /> — et pourtant « personne n'achète » reste un équilibre,
                  car acheter seul rapporte <M tex="-1" /> à Alice et <M tex="-3" /> à Baptiste.
                  Des anticipations pessimistes peuvent donc enfermer le marché dans le mauvais
                  équilibre : c'est un <em>échec de coordination</em>, pas un défaut de
                  rationalité.
                </p>
                <p>
                  Contre-expérience : baisse le prix à <M tex="p = 9 < r_A" />. Alors{" "}
                  <M tex="r_A - p = 1 > 0" /> : Alice achète même si elle croit Baptiste absent,
                  « personne n'achète » cesse d'être un équilibre, et « les deux achètent »
                  devient l'<em>unique</em> issue. Voilà pourquoi passer le prix sous{" "}
                  <M tex="r_A" /> garantit la masse critique : le vendeur « achète » la
                  coordination en sacrifiant de la marge au lancement.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1</strong> : <M tex="y = 0" /> si <M tex="p > r_A" /> ; <M tex="y = 1" /> si{" "}
              <M tex="p \in (r_B,\ r_A)" /> ; <M tex="y = 2" /> si <M tex="p < r_B" /> (escalier
              décroissant). · <strong>2.2</strong> : « les deux achètent » ⇔{" "}
              <M tex="p < r_B + v" /> ; « seule Alice » ⇔ <M tex="p \in (r_B + v,\ r_A)" />{" "}
              (possible seulement si <M tex="v < r_A - r_B" />) ; « seul Baptiste » : aucune
              valeur de <M tex="p" /> (conditions incompatibles car <M tex="r_A > r_B" />) ;
              « personne » ⇔ <M tex="p > r_A" />. · <strong>2.3</strong> : si{" "}
              <M tex="v < r_A - r_B" />, escalier à trois paliers (seuils <M tex="r_A" /> et{" "}
              <M tex="r_B + v" />), équilibre unique à chaque prix ; si <M tex="v > r_A - r_B" />,
              le palier <M tex="y = 1" /> disparaît et pour <M tex="p \in (r_A,\ r_B + v)" />{" "}
              deux équilibres coexistent (<M tex="y = 0" /> et <M tex="y = 2" />).
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> quand l'effet de réseau est fort, le prix
              ne suffit plus à déterminer la demande — ce sont les <em>anticipations</em> qui
              sélectionnent l'équilibre (demandes auto-réalisatrices), et le réseau ne décolle
              que s'il atteint sa <em>masse critique</em>. Côté méthode, ce raisonnement se
              transfère à tout problème « participer ou non » (standards, plateformes, réseaux
              sociaux) : écris la matrice des bénéfices nets, teste chaque profil avec les deux
              conditions de non-déviation (en te demandant à chaque déviation combien
              d'utilisateurs resteraient dans le réseau), puis vérifie si plusieurs équilibres
              coexistent avant de conclure.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Quiz de méthode                                               */}
      {/* ============================================================ */}
      <Quiz
        scope="tp4"
        id="qx1"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Tu veux vérifier si « seule Alice achète » est un équilibre de Nash. Quelles
            conditions dois-tu écrire ?
          </>
        }
        options={[
          {
            text: (
              <>
                Une seule : Alice doit préférer acheter (<M tex="r_A - p > 0" />), puisque c'est
                elle qui achète dans ce profil.
              </>
            ),
            explain: (
              <>
                Non : le non-acheteur aussi doit être à sa meilleure réponse. Oublier la condition
                de Baptiste est l'erreur classique — c'est pourtant elle qui impose{" "}
                <M tex="p > r_B + v" /> et rend l'intervalle si étroit.
              </>
            ),
          },
          {
            text: (
              <>
                Deux : Alice ne regrette pas d'avoir acheté (<M tex="r_A - p > 0" />){" "}
                <strong>et</strong> Baptiste ne regrette pas de s'être abstenu (
                <M tex="0 > r_B + v - p" />).
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : une condition de non-déviation <em>par joueur</em>, chacun comparant
                son gain à celui de sa déviation unilatérale, la stratégie de l'autre restant
                fixée. D'où <M tex="p \in (r_B + v,\ r_A)" />.
              </>
            ),
          },
          {
            text: (
              <>
                Il faut que ce profil donne la somme des bénéfices la plus élevée des quatre
                cases.
              </>
            ),
            explain: (
              <>
                Non : l'équilibre de Nash ne dit rien sur l'efficacité collective. Il exige
                seulement qu'aucune déviation <em>individuelle</em> ne soit profitable — un
                profil peut être un équilibre tout en étant collectivement mauvais (pense à
                « personne n'achète » dans la zone de chevauchement).
              </>
            ),
          },
        ]}
        explanation={
          <>
            Retiens le réflexe : dans une matrice 2×2, tester une case = écrire{" "}
            <strong>deux inégalités</strong>, une par joueur, contre sa déviation unilatérale.
            Puis « existe-t-il un équilibre où… ? » = « pour quels <M tex="p" /> ces deux
            inégalités tiennent-elles ensemble ? ».
          </>
        }
      />

      <Quiz
        scope="tp4"
        id="qx2"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            On est dans le cas <M tex="v > r_A - r_B" /> et le prix vérifie{" "}
            <M tex="p \in (r_A,\ r_B + v)" />. Que peux-tu conclure ?
          </>
        }
        options={[
          {
            text: (
              <>
                Deux équilibres de Nash coexistent — « les deux achètent » et « personne
                n'achète » — et ce sont les anticipations qui déterminent lequel se réalise.
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : <M tex="p < r_B + v" /> rend « les deux achètent » stable, et{" "}
                <M tex="p > r_A" /> rend « personne n'achète » stable. Même prix, deux demandes
                possibles : c'est la demande auto-réalisatrice.
              </>
            ),
          },
          {
            text: (
              <>
                « Les deux achètent » est le seul équilibre, car il donne un bénéfice strictement
                positif aux deux joueurs alors que l'autre donne <M tex="(0,\ 0)" />.
              </>
            ),
            explain: (
              <>
                Attention : qu'un équilibre soit meilleur pour tout le monde ne fait pas
                disparaître l'autre ! Si chacun anticipe que l'autre s'abstient, ne pas acheter
                est bien la meilleure réponse (<M tex="r_A - p < 0" /> puisque{" "}
                <M tex="p > r_A" />). La domination au sens de Pareto ne sélectionne pas
                l'équilibre.
              </>
            ),
          },
          {
            text: (
              <>
                Aucun équilibre n'existe : les conditions <M tex="p > r_A" /> et{" "}
                <M tex="p < r_B + v" /> se contredisent.
              </>
            ),
            explain: (
              <>
                Elles ne se contredisent pas : quand <M tex="v > r_A - r_B" />, on a{" "}
                <M tex="r_A < r_B + v" /> et les deux inégalités sont compatibles. Surtout, elles
                portent sur des <em>profils différents</em> — chacune garantit l'existence d'un
                équilibre distinct.
              </>
            ),
          },
        ]}
        explanation={
          <>
            La multiplicité d'équilibres n'est pas un accident de calcul : c'est la signature des
            effets de réseau. Le rôle de l'économiste (et du stratège) est alors de comprendre
            quel équilibre les croyances vont sélectionner — et comment un vendeur peut les
            coordonner (prix de lancement sous <M tex="r_A" />, gratuité, subventions).
          </>
        }
      />

      <Quiz
        scope="tp4"
        id="qx3"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Tu testes le profil « personne n'achète ». Pour Alice, quel bénéfice de déviation
            compares-tu à 0 ?
          </>
        }
        options={[
          {
            text: (
              <>
                <M tex="r_A + v - p" />
              </>
            ),
            explain: (
              <>
                Non : si Alice dévie <em>seule</em>, Baptiste n'achète toujours pas — il n'y a
                donc pas d'interaction, et le bonus <M tex="v" /> n'existe pas. Le <M tex="v" />{" "}
                ne s'applique que si les <em>deux</em> sont dans le réseau.
              </>
            ),
          },
          {
            text: (
              <>
                <M tex="r_A - p" />
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : la déviation est unilatérale, Alice achèterait seule, donc son gain de
                déviation est <M tex="r_A - p" /> — d'où la condition d'équilibre{" "}
                <M tex="p > r_A" />.
              </>
            ),
          },
          {
            text: (
              <>
                <M tex="r_A" />
              </>
            ),
            explain: (
              <>
                N'oublie pas le prix : ce sont les bénéfices <em>nets</em> qui figurent dans la
                matrice. Acheter seule rapporte <M tex="r_A - p" />, pas <M tex="r_A" />.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Le bon réflexe avant chaque condition : « après cette déviation, combien
            d'utilisateurs y a-t-il dans le réseau ? ». Un seul → pas de <M tex="v" /> ; deux →{" "}
            <M tex="v" /> présent. C'est ce détail qui distingue les quatre cas de la
            question 2.2.
          </>
        }
      />
    </TpShell>
  );
}
