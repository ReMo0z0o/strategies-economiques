/**
 * TP · Séance 1 — La décision individuelle (ECGEB366).
 *
 * Énoncés fidèles au document officiel « Séance d'exercices 1 » ;
 * résolutions pas à pas alignées sur le corrigé officiel
 * (« Séance d'exercices 1 : Solutions »). Les rares coquilles du
 * corrigé sont signalées sur place dans des encadrés « attention ».
 */
import { useState } from "react";
import { TpShell } from "@/components/course/TpShell";
import { ExerciseBlock, SubQuestion } from "@/components/course/StepSolution";
import { M, MB } from "@/components/course/Math";
import { Callout } from "@/components/course/Callout";
import { Quiz } from "@/components/course/Quiz";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

/** Format français : d décimales, virgule. */
function fmt(x: number, d = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(d).replace(".", ",");
}

const TH =
  "border-b bg-muted/70 px-3 py-2 text-left text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const THc =
  "border-b bg-muted/70 px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-muted-foreground";
const TD = "border-b px-3 py-2 align-top";
const TDc = "border-b px-3 py-2 text-center tabular-nums";

/* Couleurs de séries validées (paire bleu/ambre, sûre pour daltonisme). */
const COL_H = "#0284c7"; // sky-600
const COL_B = "#d97706"; // amber-600

/* ------------------------------------------------------------------ */
/* Widget · Exercice 2 — utilités des deux types selon le taux t       */
/* ------------------------------------------------------------------ */

function TaxExplorer() {
  const [tPct, setTPct] = useState(50);
  const t = tPct / 100;
  const p = 1;
  const sH = 10;
  const sB = 5;
  const lH = Math.min(1, (2 * p) / (sH * (1 - t)));
  const lB = Math.min(1, (2 * p) / (sB * (1 - t)));
  const workH = 1 - lH;
  const workB = 1 - lB;
  const mt = (t / 2) * (sH * workH + sB * workB);
  const uH = sH * (1 - t) * workH + mt + 2 * Math.log(lH);
  const uB = sB * (1 - t) * workB + mt + 2 * Math.log(lB);
  const X = (v: number) => 12 + (Math.max(0, Math.min(5, v)) / 5) * 400;

  return (
    <InteractiveCard
      title="Explore : qui gagne, qui perd quand t bouge ?"
      subtitle={
        <>
          Le modèle exact de l'exercice, résolu pour chaque taux de taxe : utilités d'équilibre{" "}
          <M tex="U_H" /> et <M tex="U_B" />.
        </>
      }
      controls={
        <SliderControl
          label={
            <>
              Taux de taxe <M tex="t" />
            </>
          }
          value={tPct}
          onChange={setTPct}
          min={0}
          max={55}
          step={5}
          format={(v) => `${v} %`}
        />
      }
      footer={
        <>
          l'utilité du type H baisse continûment quand la taxe monte, tandis que celle du type B
          monte d'abord (la redistribution l'emporte) avant de retomber quand la taxe décourage
          trop le travail. Entre <M tex="t = 0{,}2" /> et <M tex="t = 0{,}5" />, l'un gagne et
          l'autre perd : aucun des deux taux ne domine l'autre au sens de Pareto — c'est la
          conclusion de la question 2.6.
        </>
      }
    >
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Travail type H", value: fmt(workH) },
          { label: "Travail type B", value: fmt(workB) },
          { label: "Transfert M(t)", value: fmt(mt) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-muted/40 px-2.5 py-1.5 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className="text-[15px] font-bold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
      <svg
        viewBox="0 0 430 122"
        className="w-full"
        role="img"
        aria-label="Utilités d'équilibre des deux types de travailleurs pour le taux de taxe choisi"
      >
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line
              x1={X(v)}
              x2={X(v)}
              y1={16}
              y2={104}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={X(v)}
              y={117}
              fontSize={10.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {v}
            </text>
          </g>
        ))}
        <line x1={X(0)} x2={X(0)} y1={16} y2={104} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <text x={12} y={13} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Type H (salaire 10) — U = {fmt(uH)}
        </text>
        <rect x={X(0)} y={20} width={Math.max(2, X(uH) - X(0))} height={18} rx={4} fill={COL_H} />
        <text x={12} y={67} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Type B (salaire 5) — U = {fmt(uB)}
        </text>
        <rect x={X(0)} y={74} width={Math.max(2, X(uB) - X(0))} height={18} rx={4} fill={COL_B} />
      </svg>
    </InteractiveCard>
  );
}

/* ------------------------------------------------------------------ */
/* Widget · Exercice 5 — s'arrêter ou continuer ?                      */
/* ------------------------------------------------------------------ */

function FuelExplorer() {
  const [pPct, setPPct] = useState(50);
  const [uPanne, setUPanne] = useState(-10);
  const p = pPct / 100;
  const uCont = p * 20 + (1 - p) * uPanne;
  const X = (v: number) => 12 + ((Math.max(-10, Math.min(20, v)) + 10) / 30) * 400;
  const verdict =
    uCont > 10 ? "tu continues jusqu'à la pompe suivante" : uCont < 10 ? "tu t'arrêtes à 500 m" : "tu es indifférent";

  return (
    <InteractiveCard
      title="Explore : où est le seuil de bascule ?"
      subtitle={
        <>
          Utilité sûre de s'arrêter (10) contre utilité espérée de continuer{" "}
          <M tex="p \times 20 + (1-p)\times u_{\text{panne}}" />.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Probabilité <M tex="p" /> d'arriver à la pompe suivante
              </>
            }
            value={pPct}
            onChange={setPPct}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v} %`}
          />
          <SliderControl
            label="Utilité en cas de panne"
            value={uPanne}
            onChange={setUPanne}
            min={-10}
            max={10}
            step={1}
            format={(v) => fmt(v, 0)}
          />
        </>
      }
      footer={
        <>
          avec <M tex="u_{\text{panne}} = -10" />, il faut <M tex="p > 2/3 \approx 67\,\%" /> pour
          continuer ; si la panne devient moins pénible (<M tex="u_{\text{panne}} = 5" />), le
          seuil tombe à <M tex="1/3" />. Règle générale : continuer dès que{" "}
          <M tex="p\times 20 + (1-p)\times u_{\text{panne}} > 10" />.
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
        <span className="tabular-nums">
          <strong>U(Continuer) = {fmt(uCont, 1)}</strong> contre U(S'arrêter) = 10
        </span>
        <span
          className={
            "rounded-full border px-2.5 py-0.5 text-[13px] font-bold " +
            (uCont > 10
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-sky-200 bg-sky-50 text-sky-800")
          }
        >
          Décision rationnelle : {verdict}
        </span>
      </div>
      <svg
        viewBox="0 0 430 136"
        className="w-full"
        role="img"
        aria-label="Comparaison entre l'utilité certaine de s'arrêter et l'utilité espérée de continuer"
      >
        {[-10, 0, 10, 20].map((v) => (
          <g key={v}>
            <line
              x1={X(v)}
              x2={X(v)}
              y1={16}
              y2={114}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={X(v)}
              y={128}
              fontSize={10.5}
              textAnchor="middle"
              fill="var(--color-muted-foreground)"
            >
              {v}
            </text>
          </g>
        ))}
        <line x1={X(0)} x2={X(0)} y1={16} y2={114} stroke="var(--color-foreground)" strokeWidth={1.2} />
        <line
          x1={X(10)}
          x2={X(10)}
          y1={16}
          y2={114}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.4}
          strokeDasharray="4 4"
        />
        <text x={12} y={13} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          S'arrêter à 500 m (sûr) — 10
        </text>
        <rect x={X(0)} y={20} width={Math.max(2, X(10) - X(0))} height={18} rx={4} fill={COL_H} />
        <text x={12} y={72} fontSize={12.5} fontWeight={700} fill="var(--color-foreground)">
          Continuer (espérance) — {fmt(uCont, 1)}
        </text>
        <rect
          x={Math.min(X(0), X(uCont))}
          y={79}
          width={Math.max(2, Math.abs(X(uCont) - X(0)))}
          height={18}
          rx={4}
          fill={COL_B}
        />
      </svg>
    </InteractiveCard>
  );
}

/* ================================================================== */
/* Page de la séance                                                   */
/* ================================================================== */

export default function TpSession() {
  return (
    <TpShell
      sessionNumber={1}
      intro={
        <>
          <p>
            Cette séance balaie toute la <strong>Partie A — la décision individuelle</strong> : le
            critère de Pareto et l'offre de travail (chapitre A1), l'épargne inter-temporelle et
            le self-contrôle (chapitre A2), puis le risque, l'investissement et l'assurance
            (chapitre A3). Avant de te lancer, révise en priorité la méthode du Lagrangien et le
            trio « valeur monétaire attendue → utilité espérée → équivalent certain ». Conseil de
            méthode : commence toujours par <em>poser</em> le problème par écrit — contrainte de
            budget, états du monde, probabilités — avant de calculer quoi que ce soit ; c'est ce
            que valorise la correction. Et tente chaque question au brouillon avant de révéler les
            étapes !
          </p>
        </>
      }
    >
      {/* ============================================================ */}
      {/* Exercice 1 — Efficacité de Pareto                             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex1"
        number={1}
        title="Le samedi des trois amis — efficacité de Pareto"
        difficulty={1}
        refs={[{ chapter: "a1", section: "pareto" }]}
        statement={
          <>
            <p>
              Considère 3 amis, Arthur, Fatima et Mamadou, qui font face à 7 alternatives quant à
              la manière de passer leur samedi après-midi. Ils peuvent soit choisir de rester chez
              eux, soit organiser l'une de ces activités : regarder un film au cinéma, aller au
              musée, faire du sport à la salle de gym, se balader au parc, boire un verre au café,
              ou aider Fatima à créer sa page web professionnelle. Leurs préférences pour chacune
              de ces alternatives sont représentées par les utilités résumées dans le tableau
              ci-dessous.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full min-w-[22rem] border-collapse text-[14.5px]">
                <thead>
                  <tr>
                    <th className={TH}>Alternatives</th>
                    <th className={THc}>
                      <M tex="U_A" />
                    </th>
                    <th className={THc}>
                      <M tex="U_F" />
                    </th>
                    <th className={THc}>
                      <M tex="U_M" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Rester à la maison", 1, 0, 2],
                    ["Cinéma", 8, 4, 2],
                    ["Musée", 0, 5, 2],
                    ["Salle", 4, 4, 0],
                    ["Parc", 3, 3, 3],
                    ["Café", 2, 0, 2],
                    ["Aider Fatima", 0, 10, 4],
                  ].map((row) => (
                    <tr key={String(row[0])}>
                      <td className={TD}>{row[0]}</td>
                      <td className={TDc}>{row[1]}</td>
                      <td className={TDc}>{row[2]}</td>
                      <td className={TDc}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SubQuestion label="1.1">
              Lesquelles de ces alternatives ne sont pas efficaces au sens de Pareto ?
            </SubQuestion>
            <SubQuestion label="1.2">
              Lesquelles de ces alternatives satisfont à la condition suffisante (pour être
              efficace au sens de Pareto) suivante : l'alternative maximise la somme des utilités.
            </SubQuestion>
            <SubQuestion label="1.3">
              Lesquelles de ces alternatives satisfont à la condition suffisante (pour être
              efficace au sens de Pareto) suivante : être l'alternative favorite d'un individu.
            </SubQuestion>
            <SubQuestion label="1.4">
              Quelle alternative n'est pas efficace et domine une autre au sens de Pareto ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Se munir du bon critère : domination et efficacité de Pareto",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  Tout l'exercice repose sur deux définitions qu'il faut avoir parfaitement en
                  tête avant de toucher au tableau.
                </p>
                <Callout variant="definition">
                  <p>
                    Une alternative <M tex="X" /> <strong>domine</strong> une alternative{" "}
                    <M tex="Y" /> au sens de Pareto si <em>personne</em> n'est strictement moins
                    bien avec <M tex="X" /> qu'avec <M tex="Y" />, et si{" "}
                    <em>au moins une personne</em> est strictement mieux. Une alternative est{" "}
                    <strong>efficace au sens de Pareto</strong> s'il n'existe{" "}
                    <em>aucune</em> autre alternative qui la domine.
                  </p>
                </Callout>
                <Callout variant="methode">
                  <p>
                    Pour chaque alternative, cherche un « challenger » qui donne au moins autant
                    d'utilité aux trois amis et strictement plus à au moins l'un d'eux. Tu en
                    trouves un ? L'alternative est dominée, donc non efficace. Tu n'en trouves
                    aucun après avoir tout passé en revue ? Elle est efficace.
                  </p>
                </Callout>
                <Callout variant="attention">
                  <p>
                    « Efficace » ne veut dire ni « bonne » ni « équitable » : l'efficacité de
                    Pareto dit seulement qu'on ne peut pas améliorer le sort de quelqu'un sans
                    détériorer celui d'un autre. Ne classe pas les alternatives selon tes goûts !
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.1 — Passer chaque alternative au crible",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  On cherche, pour chaque ligne du tableau, un challenger qui la domine. Quatre
                  alternatives tombent :
                </p>
                <p>
                  <strong>Rester à la maison</strong> <M tex="(1,\,0,\,2)" /> est dominée par{" "}
                  <strong>Cinéma</strong> <M tex="(8,\,4,\,2)" /> — c'est l'exemple détaillé du
                  corrigé :
                </p>
                <MB tex="U_A(\text{Rester}) = 1 < 8 = U_A(\text{Cin.}), \quad U_F(\text{Rester}) = 0 < 4 = U_F(\text{Cin.}), \quad U_M(\text{Rester}) = 2 = 2 = U_M(\text{Cin.})" />
                <p>
                  Arthur et Fatima y gagnent strictement, Mamadou est indifférent : personne ne
                  perd, au moins un gagne → domination.
                </p>
                <p>
                  <strong>Musée</strong> <M tex="(0,\,5,\,2)" /> est dominée par{" "}
                  <strong>Aider Fatima</strong> <M tex="(0,\,10,\,4)" /> :{" "}
                  <M tex="0 = 0,\; 10 > 5,\; 4 > 2" />.
                </p>
                <p>
                  <strong>Salle</strong> <M tex="(4,\,4,\,0)" /> est dominée par{" "}
                  <strong>Cinéma</strong> <M tex="(8,\,4,\,2)" /> : <M tex="8 > 4,\; 4 = 4,\; 2 > 0" />.
                </p>
                <p>
                  <strong>Café</strong> <M tex="(2,\,0,\,2)" /> est dominée par{" "}
                  <strong>Parc</strong> <M tex="(3,\,3,\,3)" /> : <M tex="3 > 2,\; 3 > 0,\; 3 > 2" />{" "}
                  — domination stricte pour les trois amis.
                </p>
                <p>
                  Restent <strong>Cinéma</strong>, <strong>Parc</strong> et{" "}
                  <strong>Aider Fatima</strong> : vérifie qu'aucun challenger ne les domine. Par
                  exemple, pour dominer Parc <M tex="(3,\,3,\,3)" /> il faudrait donner au moins 3
                  à chacun — or Cinéma fait retomber Mamadou à 2, et Aider Fatima fait retomber
                  Arthur à 0. Ces trois alternatives sont donc efficaces.
                </p>
                <Callout variant="retiens">
                  <p>
                    Les alternatives <strong>non efficaces</strong> au sens de Pareto sont{" "}
                    <strong>
                      {"{"}Rester à la maison, Musée, Salle, Café{"}"}
                    </strong>
                    .
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.2 — Qui maximise la somme des utilités ?",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>Calcule la somme des trois utilités pour chaque alternative :</p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Alternative</th>
                        <th className={THc}>
                          <M tex="U_A + U_F + U_M" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Rester à la maison", "1 + 0 + 2 = 3"],
                        ["Cinéma", "8 + 4 + 2 = 14"],
                        ["Musée", "0 + 5 + 2 = 7"],
                        ["Salle", "4 + 4 + 0 = 8"],
                        ["Parc", "3 + 3 + 3 = 9"],
                        ["Café", "2 + 0 + 2 = 4"],
                        ["Aider Fatima", "0 + 10 + 4 = 14"],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className={TD}>{row[0]}</td>
                          <td className={TDc}>{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Le maximum est <strong>14</strong>, atteint par{" "}
                  <strong>
                    {"{"}Cinéma, Aider Fatima{"}"}
                  </strong>{" "}
                  — c'est la réponse.
                </p>
                <Callout variant="intuition">
                  <p>
                    Pourquoi cette condition est-elle <em>suffisante</em> ? Si une alternative
                    dominait un maximiseur de la somme, elle donnerait au moins autant à chacun et
                    strictement plus à quelqu'un : sa somme d'utilités serait strictement plus
                    grande — contradiction. Mais la condition n'est pas <em>nécessaire</em> : Parc
                    est efficace avec une somme de 9 seulement.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.3 — Les alternatives « chouchou »",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>Repère le maximum de chaque colonne du tableau :</p>
                <p>
                  Arthur : son utilité maximale est <M tex="8" /> → sa favorite est le{" "}
                  <strong>Cinéma</strong>. Fatima : maximum <M tex="10" /> →{" "}
                  <strong>Aider Fatima</strong>. Mamadou : maximum <M tex="4" /> →{" "}
                  <strong>Aider Fatima</strong> également.
                </p>
                <p>
                  L'ensemble des alternatives favorites d'au moins un individu est donc{" "}
                  <strong>
                    {"{"}Cinéma, Aider Fatima{"}"}
                  </strong>
                  .
                </p>
                <Callout variant="intuition">
                  <p>
                    Pourquoi est-ce suffisant pour l'efficacité ? Si <M tex="X" /> est{" "}
                    <em>la</em> favorite (stricte) de l'individu <M tex="i" />, alors toute autre
                    alternative rend <M tex="i" /> strictement moins heureux : aucune ne peut
                    dominer <M tex="X" />, puisqu'une domination exige que personne ne perde.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "1.4 — Non efficace… et pourtant dominante",
            refs: [{ chapter: "a1", section: "pareto" }],
            content: (
              <>
                <p>
                  On cherche une alternative qui soit à la fois <em>dominée</em> (donc non
                  efficace) et qui <em>domine</em> une autre. La réponse est le{" "}
                  <strong>Café</strong> :
                </p>
                <p>
                  d'un côté, Café est dominée par Parc (vu en 1.1), donc elle n'est pas efficace ;
                  de l'autre, Café <M tex="(2,\,0,\,2)" /> domine{" "}
                  <strong>Rester à la maison</strong> <M tex="(1,\,0,\,2)" /> :
                </p>
                <MB tex="2 > 1, \qquad 0 = 0, \qquad 2 = 2" />
                <p>
                  Arthur gagne strictement, personne ne perd : c'est bien une domination de
                  Pareto.
                </p>
                <Callout variant="retiens">
                  <p>
                    La domination de Pareto n'est qu'un <strong>ordre partiel</strong> : une
                    alternative peut être « au milieu d'une chaîne » — meilleure que certaines,
                    dominée par d'autres. Ne pas être efficace ne signifie pas être la pire.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>1.1</strong> Non efficaces : {"{"}Rester à la maison, Musée, Salle, Café
              {"}"} · <strong>1.2</strong> Somme maximale (14) : {"{"}Cinéma, Aider Fatima{"}"} ·{" "}
              <strong>1.3</strong> Favorites d'un individu : {"{"}Cinéma, Aider Fatima{"}"} ·{" "}
              <strong>1.4</strong> Café (dominée par Parc, domine Rester à la maison).
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> l'efficacité se teste par un crible
              systématique de dominations ; « maximiser la somme » et « être la favorite de
              quelqu'un » sont des conditions <em>suffisantes</em> mais pas <em>nécessaires</em>{" "}
              (Parc est efficace sans vérifier aucune des deux) ; et Pareto ne dit rien sur
              l'équité du choix.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp1"
        id="qx1"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Le Parc est efficace au sens de Pareto, mais il ne maximise pas la somme des utilités
            (9 contre 14) et il n'est la favorite de personne. Qu'est-ce que cela montre ?
          </>
        }
        options={[
          {
            text: (
              <>
                Que les deux conditions de l'exercice sont <strong>suffisantes</strong> mais pas{" "}
                <strong>nécessaires</strong> : une alternative peut être efficace sans vérifier
                aucune des deux.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement : vérifier l'une de ces conditions garantit l'efficacité, mais des
                alternatives efficaces existent en dehors — le Parc en est la preuve.
              </>
            ),
          },
          {
            text: <>Qu'il y a une erreur : toute alternative efficace doit maximiser la somme des utilités.</>,
            explain: (
              <>
                Non : maximiser la somme implique l'efficacité, mais l'implication inverse est
                fausse. C'est toute la différence entre condition suffisante et nécessaire.
              </>
            ),
          },
          {
            text: (
              <>
                Que le Parc n'est en fait pas efficace, puisque Arthur et Fatima préfèrent le
                Cinéma.
              </>
            ),
            explain: (
              <>
                Pour dominer le Parc, il faudrait que <em>personne</em> n'y perde. Or avec le
                Cinéma, Mamadou passe de 3 à 2 : pas de domination.
              </>
            ),
          },
        ]}
        explanation={
          <>
            Retiens la logique : condition <strong>suffisante</strong> = « si elle est vérifiée,
            l'efficacité est garantie » — rien de plus. Pour prouver qu'une alternative est
            efficace sans ces raccourcis, il faut vérifier qu'aucune autre ne la domine.
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 2 — Offre de travail et redistribution               */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex2"
        number={2}
        title="Taxe et offre de travail sur l'île"
        difficulty={3}
        refs={[
          { chapter: "a1", section: "offre" },
          { chapter: "a1", section: "optim" },
          { chapter: "a1", section: "redistrib" },
        ]}
        statement={
          <>
            <p>
              Soit une île où habitent un très grand nombre <M tex="N" /> de travailleurs. La
              moitié de ces travailleurs a un salaire brut <M tex="s_H = 10" /> et l'autre moitié
              un salaire brut <M tex="s_B = 5" />. La dotation en temps de chaque travailleur est{" "}
              <M tex="L = 1" />. Le prix d'une unité de consommation est <M tex="p = 1" />. Leurs
              préférences sur les quantités consommées <M tex="c" /> et le temps de loisir{" "}
              <M tex="l" /> sont représentées par la fonction d'utilité
            </p>
            <MB tex="U(l, c) = c + 2\ln(l)" />
            <p>
              Le gouvernement impose une taxe à la valeur <M tex="t" /> sur les revenus bruts du
              travail. Il répartit le montant total de taxe collecté en parts égales entre tous
              les travailleurs, qui reçoivent donc chacun un montant <M tex="M(t)" />.
            </p>
            <p>
              <strong>
                En faisant l'hypothèse que <M tex="t = 0{,}5" /> :
              </strong>
            </p>
            <SubQuestion label="2.1">
              Quelle est la contrainte de budget d'un travailleur à haut salaire ? à bas salaire ?
            </SubQuestion>
            <SubQuestion label="2.2">
              En utilisant la méthode du Lagrangien, calcule le temps de travail optimal de chacun
              des deux types de travailleurs.
            </SubQuestion>
            <SubQuestion label="2.3">
              Calcule les revenus du travail nets perçus par chaque type de travailleur.
            </SubQuestion>
            <SubQuestion label="2.4">
              Calcule le montant hors salaire <M tex="M(t)" /> reçu par chaque travailleur.
            </SubQuestion>
            <SubQuestion label="2.5">Calcule l'utilité de chaque type de travailleur.</SubQuestion>
            <p>
              <strong>
                En faisant l'hypothèse que <M tex="t = 0{,}2" />
              </strong>
              , réponds aux mêmes questions. Ensuite :
            </p>
            <SubQuestion label="2.6">
              Compare l'allocation obtenue lorsque <M tex="t = 0{,}2" /> avec celle obtenue
              lorsque <M tex="t = 0{,}5" /> : y en a-t-il une qui domine l'autre au sens de
              Pareto ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "2.1 — Poser la contrainte de budget",
            refs: [
              { chapter: "a1", section: "offre" },
              { chapter: "a1", section: "redistrib" },
            ],
            content: (
              <>
                <p>
                  La contrainte de budget empêche l'individu de consommer plus que les ressources
                  dont il dispose. Ici, les ressources d'un travailleur ont{" "}
                  <strong>deux origines</strong> : le revenu net de son travail et le transfert
                  fiscal <M tex="M(t)" /> du gouvernement.
                </p>
                <p>
                  Le travailleur partage sa dotation en temps <M tex="L = 1" /> entre loisir{" "}
                  <M tex="l" /> et travail <M tex="1 - l" />. Son revenu <em>net</em> (après taxe
                  au taux <M tex="t" />) est donc, pour un type <M tex="i \in \{H, B\}" /> :
                </p>
                <MB tex="s_i(1-t)(1-l_i)" />
                <p>
                  Côté transfert : la moitié des <M tex="N" /> travailleurs est de type H, l'autre
                  moitié de type B. La taxe collectée <em>par tête</em>, redistribuée à parts
                  égales, vaut donc
                </p>
                <MB tex="M(t) = \frac{t}{2}\bigl(s_H(1-l_H) + s_B(1-l_B)\bigr)" />
                <p>Les contraintes de budget des deux types s'écrivent alors :</p>
                <MB tex="p\,c_H \le s_H(1-t)(1-l_H) + \frac{t}{2}\bigl(s_H(1-l_H) + s_B(1-l_B)\bigr)" />
                <MB tex="p\,c_B \le s_B(1-t)(1-l_B) + \frac{t}{2}\bigl(s_H(1-l_H) + s_B(1-l_B)\bigr)" />
                <p>
                  où <M tex="p\,c_H" /> et <M tex="p\,c_B" /> sont les dépenses de consommation de
                  chaque type.
                </p>
              </>
            ),
          },
          {
            title: "2.2 — Écrire le Lagrangien… sans tomber dans le piège du « grand N »",
            refs: [{ chapter: "a1", section: "optim" }],
            content: (
              <>
                <p>Pour le travailleur à haut salaire, le Lagrangien s'écrit :</p>
                <MB tex="\mathcal{L}_H = c_H + 2\ln(l_H) - \lambda_H\Bigl(p\,c_H - s_H(1-t)(1-l_H) - M(t)\Bigr)" />
                <Callout variant="attention" title="Attention — le piège central de l'exercice">
                  <p>
                    Dans ce Lagrangien, <M tex="M(t)" /> est traité comme une{" "}
                    <strong>donnée</strong> : comme <M tex="N" /> est très grand, chaque
                    travailleur sait que son propre choix de temps de travail a un impact
                    négligeable sur la caisse commune. Il serait <strong>incorrect</strong>{" "}
                    d'écrire
                  </p>
                  <MB tex="\mathcal{L}_H = c_H + 2\ln(l_H) - \lambda_H\Bigl(p\,c_H - s_H(1-t)(1-l_H) - \tfrac{t}{2}\bigl(s_H(1-l_H)+s_B(1-l_B)\bigr)\Bigr)" />
                  <p>
                    car la condition de premier ordre de cette version impliquerait qu'un
                    travailleur croit que son choix personnel serait suivi par tous les
                    travailleurs de son type, avec un effet fort sur <M tex="M(t)" /> — alors que
                    l'impact d'un seul individu est négligeable.
                  </p>
                </Callout>
                <p>
                  Les trois conditions de premier ordre{" "}
                  <M tex="\tfrac{\partial \mathcal{L}_H}{\partial l_H} = 0" />,{" "}
                  <M tex="\tfrac{\partial \mathcal{L}_H}{\partial c_H} = 0" /> et{" "}
                  <M tex="\tfrac{\partial \mathcal{L}_H}{\partial \lambda_H} = 0" /> donnent
                  respectivement :
                </p>
                <MB tex="\frac{2}{l_H} - \lambda_H\, s_H(1-t) = 0 \qquad (1)" />
                <MB tex="1 - \lambda_H\, p = 0 \qquad (2)" />
                <MB tex="p\,c_H = s_H(1-t)(1-l_H) + M(t) \qquad (3)" />
                <p>
                  L'équation (2) donne <M tex="\lambda_H = 1/p = 1" />. En l'injectant dans (1),
                  puis en refaisant le même raisonnement pour le type B (par symétrie) :
                </p>
                <MB tex="l_H^* = \frac{2p}{s_H(1-t)} \qquad \text{et} \qquad l_B^* = \frac{2p}{s_B(1-t)}" />
                <p>
                  Avec <M tex="t = 0{,}5" /> :{" "}
                  <M tex="l_H^* = \tfrac{2}{10 \times 0{,}5} = \tfrac{2}{5}" /> et{" "}
                  <M tex="l_B^* = \tfrac{2}{5 \times 0{,}5} = \tfrac{4}{5}" />, d'où les temps de
                  travail optimaux :
                </p>
                <MB tex="1 - l_H^* = \frac{3}{5} \qquad \text{et} \qquad 1 - l_B^* = \frac{1}{5}" />
                <Callout variant="intuition">
                  <p>
                    Le type B travaille beaucoup moins : son salaire net{" "}
                    <M tex="s_B(1-t) = 2{,}5" /> rémunère faiblement chaque heure de travail, le
                    loisir lui « coûte » donc moins cher.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "2.3 — Les revenus nets du travail",
            refs: [{ chapter: "a1", section: "offre" }],
            content: (
              <>
                <p>
                  Le revenu net est le salaire brut après taxe, gagné sur le temps travaillé :{" "}
                  <M tex="s_i(1-t)(1-l_i^*)" /> pour <M tex="i \in \{H, B\}" />.
                </p>
                <MB tex="\text{Type H} : \quad 10 \times (1-0{,}5) \times \frac{3}{5} = 3" />
                <MB tex="\text{Type B} : \quad 5 \times (1-0{,}5) \times \frac{1}{5} = \frac{1}{2}" />
              </>
            ),
          },
          {
            title: "2.4 — Le transfert M(t)",
            refs: [{ chapter: "a1", section: "redistrib" }],
            content: (
              <>
                <p>
                  On remplace les temps de travail optimaux dans la formule de{" "}
                  <M tex="M(t) = \tfrac{t}{2}\bigl(s_H(1-l_H^*) + s_B(1-l_B^*)\bigr)" /> :
                </p>
                <MB tex="M(0{,}5) = \frac{0{,}5}{2}\Bigl(10 \times \frac{3}{5} + 5 \times \frac{1}{5}\Bigr) = \frac{1}{4}\bigl(6 + 1\bigr) = \frac{7}{4}" />
                <p>
                  Chaque travailleur — quel que soit son type — reçoit donc un transfert de{" "}
                  <M tex="7/4 = 1{,}75" />.
                </p>
              </>
            ),
          },
          {
            title: "2.5 — Consommations et utilités",
            refs: [{ chapter: "a1", section: "offre" }],
            content: (
              <>
                <p>
                  La contrainte de budget est saturée à l'optimum : chaque type consomme{" "}
                  <M tex="c_i^* = s_i(1-t)(1-l_i^*) + M(t)" /> :
                </p>
                <MB tex="c_H^* = 3 + \frac{7}{4} = \frac{19}{4} \qquad \text{et} \qquad c_B^* = \frac{1}{2} + \frac{7}{4} = \frac{9}{4}" />
                <p>
                  On injecte <M tex="l_i^*" /> et <M tex="c_i^*" /> dans la fonction d'utilité{" "}
                  <M tex="U(l,c) = c + 2\ln(l)" /> :
                </p>
                <MB tex="U_H(l_H^*, c_H^*) = \frac{19}{4} + 2\ln\Bigl(\frac{2}{5}\Bigr) = 2{,}92" />
                <MB tex="U_B(l_B^*, c_B^*) = \frac{9}{4} + 2\ln\Bigl(\frac{4}{5}\Bigr) = 1{,}8" />
                <p>
                  Malgré la redistribution, le type à bas salaire obtient une utilité plus faible
                  que le type à haut salaire.
                </p>
              </>
            ),
          },
          {
            title: "Rejouer tout le scénario avec t = 0,2",
            refs: [
              { chapter: "a1", section: "optim" },
              { chapter: "a1", section: "redistrib" },
            ],
            content: (
              <>
                <p>
                  Les formules ne changent pas, seul le taux change — c'est l'intérêt d'avoir
                  résolu le problème <em>en général</em> avant de remplacer les valeurs.
                </p>
                <p>
                  <strong>Temps de loisir et de travail</strong> (mêmes formules{" "}
                  <M tex="l_i^* = \tfrac{2p}{s_i(1-t)}" />) :
                </p>
                <MB tex="l_H^* = \frac{2}{10 \times 0{,}8} = \frac{1}{4} \;\Rightarrow\; 1 - l_H^* = \frac{3}{4} \qquad ; \qquad l_B^* = \frac{2}{5 \times 0{,}8} = \frac{1}{2} \;\Rightarrow\; 1 - l_B^* = \frac{1}{2}" />
                <p>
                  <strong>Revenus nets</strong> :
                </p>
                <MB tex="\text{H} : \; 10 \times (1-0{,}2) \times \frac{3}{4} = 6 \qquad ; \qquad \text{B} : \; 5 \times (1-0{,}2) \times \frac{1}{2} = 2" />
                <p>
                  <strong>Transfert</strong> :
                </p>
                <MB tex="M(0{,}2) = \frac{0{,}2}{2}\Bigl(10 \times \frac{3}{4} + 5 \times \frac{1}{2}\Bigr) = 0{,}1 \times 10 = 1" />
                <p>
                  <strong>Utilités</strong> (consommations <M tex="c_H^* = 6 + 1 = 7" /> et{" "}
                  <M tex="c_B^* = 2 + 1 = 3" />) :
                </p>
                <MB tex="U_H = 6 + 1 + 2\ln\Bigl(\frac{1}{4}\Bigr) = 4{,}23 \qquad ; \qquad U_B = 2 + 1 + 2\ln\Bigl(\frac{1}{2}\Bigr) = 1{,}61" />
                <p>
                  Remarque au passage : avec une taxe plus faible, <em>les deux types</em>{" "}
                  travaillent davantage (3/4 contre 3/5 pour H, 1/2 contre 1/5 pour B) — la taxe
                  décourage l'offre de travail.
                </p>
              </>
            ),
          },
          {
            title: "2.6 — Duel des deux taux : Pareto tranche-t-il ?",
            refs: [
              { chapter: "a1", section: "pareto" },
              { chapter: "a1", section: "redistrib" },
            ],
            content: (
              <>
                <p>Mets les utilités côte à côte :</p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[20rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Utilité</th>
                        <th className={THc}>t = 0,5</th>
                        <th className={THc}>t = 0,2</th>
                        <th className={TH}>Préférence</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>
                          <M tex="U_H" />
                        </td>
                        <td className={TDc}>2,92</td>
                        <td className={TDc}>
                          <strong>4,23</strong>
                        </td>
                        <td className={TD}>H préfère t = 0,2</td>
                      </tr>
                      <tr>
                        <td className={TD}>
                          <M tex="U_B" />
                        </td>
                        <td className={TDc}>
                          <strong>1,8</strong>
                        </td>
                        <td className={TDc}>1,61</td>
                        <td className={TD}>B préfère t = 0,5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Lorsqu'on diminue le taux d'imposition de <M tex="t = 0{,}5" /> à{" "}
                  <M tex="t = 0{,}2" />, l'utilité du travailleur à haut revenu augmente, tandis
                  que celle du travailleur à bas revenu diminue. Il n'y a{" "}
                  <strong>pas d'unanimité</strong> entre ces deux taux :{" "}
                  <strong>aucune des deux allocations ne domine l'autre au sens de Pareto</strong>.
                </p>
                <Callout variant="retiens">
                  <p>
                    C'est l'arbitrage équité–efficacité en miniature : le critère de Pareto est
                    muet dès qu'une politique fait des gagnants <em>et</em> des perdants. Choisir
                    un taux de taxe exige alors un jugement de valeur supplémentaire.
                  </p>
                </Callout>
                <TaxExplorer />
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>Avec t = 0,5 :</strong> travail <M tex="3/5" /> (H) et <M tex="1/5" /> (B) ;
              revenus nets 3 et 1/2 ; <M tex="M = 7/4" /> ; utilités 2,92 et 1,8.{" "}
              <strong>Avec t = 0,2 :</strong> travail <M tex="3/4" /> et <M tex="1/2" /> ; revenus
              nets 6 et 2 ; <M tex="M = 1" /> ; utilités 4,23 et 1,61. <strong>2.6 :</strong>{" "}
              aucune allocation ne domine l'autre au sens de Pareto.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> (i) dans une économie avec un grand nombre
              d'agents, chacun traite le transfert <M tex="M(t)" /> comme donné dans son
              Lagrangien ; (ii) la CPO sur la consommation donne toujours{" "}
              <M tex="\lambda = 1/p" /> ici, ce qui rend la CPO sur le loisir immédiate ; (iii)
              baisser la taxe stimule le travail mais réduit la redistribution — Pareto ne peut
              pas départager.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 3 — Épargne inter-temporelle                         */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex3"
        number={3}
        title="Épargner pour la retraite"
        difficulty={2}
        refs={[
          { chapter: "a2", section: "modele" },
          { chapter: "a2", section: "choix" },
        ]}
        statement={
          <>
            <p>
              Soit un épargnant vivant deux périodes : la vie active (période 0) et la retraite
              (période 1). Ses revenus durant la vie active sont <M tex="m_0 = 10" /> et durant la
              retraite <M tex="m_1 = 0" />. Les quantités consommées durant chaque période
              définissent le programme de consommation <M tex="(c_0, c_1)" />. Le prix d'une unité
              de consommation à chaque période est <M tex="p_0 = p_1 = 1" />. Le taux d'intérêt
              cumulé entre ces deux périodes est <M tex="r = 0{,}5" />. L'épargnant a des
              préférences sur les programmes de consommation représentées par
            </p>
            <MB tex="U(c_0, c_1) = \ln(c_0) + \delta\ln(c_1)" />
            <p>
              <strong>
                En faisant l'hypothèse que <M tex="\delta = \tfrac{1}{2}" /> :
              </strong>
            </p>
            <SubQuestion label="3.1">
              Quelle est la contrainte de budget de l'épargnant (exprimée en valeur présente) ?
            </SubQuestion>
            <SubQuestion label="3.2">
              En utilisant la méthode du Lagrangien, calcule le programme de consommation optimal
              de l'épargnant. Combien épargne-t-il en période 0 ? Combien consomme-t-il en
              période 1 ?
            </SubQuestion>
            <SubQuestion label="3.3">
              De combien l'épargnant augmente-t-il son utilité s'il disposait d'une unité
              supplémentaire de revenu en période 0 ? Truc : base ta réponse sur le multiplicateur
              de Lagrange.
            </SubQuestion>
            <p>
              Le gouvernement dispose en période 0 d'un montant <M tex="m_g = 10" />, qu'il
              souhaite utiliser pour aider l'épargnant à augmenter sa consommation durant sa
              retraite. Le gouvernement peut soit donner <M tex="m_g" /> à l'épargnant en
              période 0, soit investir <M tex="m_g" /> au taux d'intérêt cumulé <M tex="r" /> et
              ensuite donner le montant obtenu à l'épargnant en période 1.{" "}
              <strong>
                Toujours avec <M tex="\delta = \tfrac{1}{2}" /> :
              </strong>
            </p>
            <SubQuestion label="3.4">
              Pour chacune des deux options (donner <M tex="m_g" /> en période 0 ou donner le
              montant capitalisé en période 1), calcule combien l'épargnant consomme en période 1.
              Y a-t-il une différence ?
            </SubQuestion>
            <SubQuestion label="3.5">
              Sans faire de calculs, discute la différence entre ces deux options si l'épargnant
              fait face à des problèmes de self-contrôle.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "3.1 — La contrainte de budget en valeur présente",
            refs: [
              { chapter: "a2", section: "modele" },
              { chapter: "a2", section: "outils" },
            ],
            content: (
              <>
                <p>
                  L'idée-clé : 1 euro placé en période 0 rapporte <M tex="1 + r" /> euros en
                  période 1. Donc 1 euro de période 1 « vaut » <M tex="\tfrac{1}{1+r}" /> euro
                  d'aujourd'hui — c'est le facteur d'actualisation. La contrainte budgétaire
                  intertemporelle s'écrit :
                </p>
                <MB tex="c_0 + \frac{c_1}{1+r} \;\le\; m_0 + \frac{m_1}{1+r}" />
                <p>
                  Avec <M tex="r = 0{,}5" /> (donc <M tex="\tfrac{1}{1+r} = \tfrac{2}{3}" />),{" "}
                  <M tex="m_0 = 10" /> et <M tex="m_1 = 0" /> :
                </p>
                <MB tex="c_0 + \frac{2}{3}c_1 \;\le\; 10" />
              </>
            ),
          },
          {
            title: "3.2 — Le Lagrangien et le programme optimal",
            refs: [{ chapter: "a2", section: "choix" }],
            content: (
              <>
                <p>
                  Soit <M tex="(c_0^*, c_1^*)" /> le plan de consommation optimal, solution du
                  programme :
                </p>
                <MB tex="\max_{c_0,\,c_1} \;\bigl[\ln(c_0) + \delta\ln(c_1)\bigr] \quad \text{sous contrainte de budget}" />
                <p>Le Lagrangien est :</p>
                <MB tex="\mathcal{L} = \ln(c_0) + \delta\ln(c_1) + \lambda\Bigl(10 - \frac{2}{3}c_1 - c_0\Bigr)" />
                <p>Les trois conditions de premier ordre donnent :</p>
                <MB tex="\frac{1}{c_0} - \lambda = 0, \qquad \frac{\delta}{c_1} - \frac{2}{3}\lambda = 0, \qquad 10 - \frac{2}{3}c_1 - c_0 = 0" />
                <p>
                  En éliminant <M tex="\lambda" /> des deux premières équations :
                </p>
                <MB tex="c_1^* = \frac{3\,\delta\, c_0^*}{2}" />
                <p>puis en remplaçant dans la contrainte budgétaire :</p>
                <MB tex="c_0^* + \frac{2}{3}\cdot\frac{3\delta c_0^*}{2} = c_0^*(1+\delta) = 10 \quad\Longrightarrow\quad c_0^* = \frac{10}{1+\delta}" />
                <p>
                  Avec <M tex="\delta = \tfrac{1}{2}" /> :
                </p>
                <MB tex="c_0^* = \frac{20}{3} \approx 6{,}67 \qquad \text{et} \qquad c_1^* = 5" />
                <p>Son épargne en période 0 est donc :</p>
                <MB tex="m_0 - c_0^* = 10 - \frac{20}{3} = \frac{10}{3} \approx 3{,}33" />
                <Callout variant="methode" title="Vérification express">
                  <p>
                    L'épargne placée au taux <M tex="r" /> doit financer exactement{" "}
                    <M tex="c_1^*" /> :{" "}
                    <M tex="\tfrac{10}{3} \times (1+r) = \tfrac{10}{3}\times\tfrac{3}{2} = 5 = c_1^*" />
                    . Le compte est bon — prends ce réflexe de vérification à l'examen.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.3 — Le multiplicateur de Lagrange, prix d'un euro de plus",
            refs: [{ chapter: "a2", section: "choix" }],
            content: (
              <>
                <p>
                  Le multiplicateur <M tex="\lambda" /> mesure l'
                  <strong>utilité marginale du revenu</strong> à l'optimum : de combien l'utilité
                  augmenterait si on relâchait la contrainte d'une unité (un euro de revenu en
                  plus en période 0). Il n'y a rien à recalculer — la première CPO le donne
                  directement :
                </p>
                <MB tex="\frac{1}{c_0^*} - \lambda = 0 \quad\Longrightarrow\quad \lambda = \frac{1}{c_0^*} = \frac{1}{20/3} = \frac{3}{20} = 0{,}15" />
                <p>
                  Avec une unité de revenu supplémentaire en période 0, l'épargnant augmenterait
                  donc son utilité d'environ <M tex="3/20 = 0{,}15" />.
                </p>
                <Callout variant="attention" title="Coquille dans le corrigé officiel">
                  <p>
                    Le corrigé officiel écrit « <M tex="\lambda = \tfrac{20}{3}" /> » : c'est une
                    inversion de fraction. Sa propre équation{" "}
                    <M tex="\tfrac{1}{c_0^*} - \lambda = 0" /> avec <M tex="c_0^* = \tfrac{20}{3}" />{" "}
                    donne bien <M tex="\lambda = \tfrac{3}{20}" />. Un bon test de cohérence :
                    l'utilité totale vaut ici environ 2,7 — un seul euro de plus ne peut pas
                    l'augmenter de 6,67 !
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.4 — Deux façons d'aider, une seule contrainte de budget",
            refs: [{ chapter: "a2", section: "modele" }],
            content: (
              <>
                <p>
                  <strong>Option 1 :</strong> donner <M tex="m_g = 10" /> en période 0. La
                  nouvelle contrainte budgétaire intertemporelle est :
                </p>
                <MB tex="c_0 + \frac{c_1}{1+r} \le m_0 + m_g + \frac{m_1}{1+r} \quad\text{soit}\quad c_0 + \frac{2}{3}c_1 \le 20" />
                <p>
                  La résolution de la question 3.2 s'applique telle quelle avec un revenu total de
                  20 :
                </p>
                <MB tex="c_0^* = \frac{20}{1+\delta} = \frac{40}{3} \qquad \text{et} \qquad c_1^* = \frac{3\delta c_0^*}{2} = 10" />
                <p>
                  <strong>Option 2 :</strong> donner <M tex="m_g(1+r) = 15" /> en période 1. La
                  contrainte devient :
                </p>
                <MB tex="c_0 + \frac{c_1}{1+r} \le m_0 + \frac{m_g(1+r)}{1+r} + \frac{m_1}{1+r} \quad\text{soit}\quad c_0 + \frac{2}{3}c_1 \le 20" />
                <p>
                  C'est <strong>exactement la même contrainte</strong> : les deux options
                  conduisent au même programme optimal, donc à la même consommation de retraite{" "}
                  <M tex="c_1^* = 10" />. <strong>Aucune différence.</strong>
                </p>
                <Callout variant="intuition">
                  <p>
                    Pourquoi ? L'épargnant a accès au <em>même taux d'intérêt</em> que le
                    gouvernement. Recevoir 10 aujourd'hui ou 15 demain, c'est la même richesse en
                    valeur présente : il peut toujours défaire lui-même le « timing » du
                    versement en épargnant ou en empruntant.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "3.5 — Et si l'épargnant manque de self-contrôle ?",
            refs: [
              { chapter: "a2", section: "selfcontrole" },
              { chapter: "a2", section: "commit" },
            ],
            content: (
              <>
                <p>
                  Si l'épargnant fait face à des problèmes de self-contrôle, un gouvernement qui
                  veut augmenter la consommation à la retraite devrait favoriser l'
                  <strong>option 2</strong> — en tout cas si l'épargnant ne peut pas emprunter (en
                  promettant de rembourser avec le montant qu'il recevra en période 1).
                </p>
                <p>
                  En effet, l'épargnant pourrait avoir du mal à résister à la tentation en
                  période 0 et consommer une grande part des ressources auxquelles il a accès. En
                  donnant <M tex="m_g" /> en période 0 (option 1), le gouvernement{" "}
                  <em>augmente précisément sa capacité à surconsommer</em> pendant cette période.
                  En revanche, s'il verse <M tex="m_g(1+r)" /> en période 1 et que l'épargnant ne
                  peut pas emprunter, celui-ci ne pourra pas consommer en période 0 plus que ses{" "}
                  <M tex="m_0 = 10" /> : sa consommation de retraite sera d'au moins{" "}
                  <M tex="m_g(1+r) = 15" />.
                </p>
                <Callout variant="retiens">
                  <p>
                    Le versement différé fonctionne comme un <strong>commitment device</strong>{" "}
                    imposé de l'extérieur : il met les ressources hors de portée du « moi
                    présent » tenté. C'est le principe des plans d'épargne-pension bloqués.
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>3.1</strong> <M tex="c_0 + \tfrac{2}{3}c_1 \le 10" /> · <strong>3.2</strong>{" "}
              <M tex="c_0^* = \tfrac{20}{3}" />, <M tex="c_1^* = 5" />, épargne{" "}
              <M tex="\tfrac{10}{3}" /> · <strong>3.3</strong>{" "}
              <M tex="\lambda = \tfrac{3}{20} = 0{,}15" /> (le corrigé officiel écrit 20/3 par
              coquille) · <strong>3.4</strong> les deux options donnent la même contrainte{" "}
              <M tex="c_0 + \tfrac{2}{3}c_1 \le 20" /> et donc <M tex="c_1^* = 10" /> : aucune
              différence · <strong>3.5</strong> avec du self-contrôle limité, l'option 2 (verser
              en période 1) protège la consommation de retraite.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> tout se joue sur la contrainte en valeur
              présente — deux flux de revenus de même valeur actualisée donnent le même choix
              optimal pour un agent rationnel. Le <em>timing</em> des versements ne compte que
              lorsque l'agent a des problèmes de self-contrôle (ou ne peut pas emprunter).
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 4 — Self-contrôle : l'abonnement fitness              */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex4"
        number={4}
        title="L'abonnement à la salle de fitness — self-contrôle"
        difficulty={3}
        refs={[
          { chapter: "a2", section: "selfcontrole" },
          { chapter: "a2", section: "commit" },
        ]}
        statement={
          <>
            <p>
              Soit un sportif prévoyant de faire de l'exercice en salle de fitness. La salle
              propose deux tarifications : soit le sportif paie un prix <M tex="p = 4" /> pour
              chacune de ses visites, soit il prend un abonnement au prix <M tex="C = 25" /> et
              peut alors faire autant de visites qu'il le désire. On considère trois périodes : la
              période 0 durant laquelle le sportif décide de prendre un abonnement ou non, la
              période 1 durant laquelle il fait un nombre <M tex="k" /> de visites, et la
              période 2 durant laquelle il reçoit un bénéfice santé de <M tex="b = 10" /> pour
              chaque visite réalisée en période 1.
            </p>
            <p>
              Le sportif a un problème de self-contrôle : ses préférences en <M tex="t = 0" /> sur
              le nombre de visites et sur le fait de prendre un abonnement (<M tex="a = 1" />) ou
              pas (<M tex="a = 0" />) sont représentées par
            </p>
            <MB tex="U_0(a,k) = \underbrace{-\beta\frac{k^2}{2} - \beta\bigl[aC + (1-a)pk\bigr]}_{\text{période 1}} + \underbrace{\beta b k}_{\text{période 2}}" />
            <p>
              où le biais de self-contrôle est <M tex="\beta = \tfrac{1}{2}" /> et le premier
              terme capture le coût d'effort des visites (les visites sont un{" "}
              <em>bien d'investissement</em>). Ses préférences en <M tex="t = 1" /> sont
              représentées par
            </p>
            <MB tex="U_1(a,k) = \underbrace{-\frac{k^2}{2} - \bigl[aC + (1-a)pk\bigr]}_{\text{période 1}} + \underbrace{\beta b k}_{\text{période 2}}" />
            <p>
              où <M tex="a" /> est fixé à la valeur choisie en <M tex="t = 0" />.
            </p>
            <p className="text-sm text-muted-foreground">
              NB — <M tex="U_0" /> suppose que le sportif paie le montant dû à la salle en
              période 1 : le self-contrôle n'affecte ainsi que la décision de faire du sport, pas
              l'allocation des coûts monétaires dans le temps. On suppose aussi un facteur
              d'escompte <M tex="\delta = 1" />.
            </p>
            <SubQuestion label="4.1">
              En période 0, combien de visites le sportif souhaite-t-il faire s'il prend un
              abonnement (<M tex="a = 1" />) ?
            </SubQuestion>
            <SubQuestion label="4.2">
              En période 0, combien de visites le sportif souhaite-t-il faire s'il ne prend pas
              d'abonnement (<M tex="a = 0" />) ?
            </SubQuestion>
            <p>
              <strong>
                En supposant le sportif naïf sur son problème de self-contrôle (
                <M tex="\hat\beta = 1" />) :
              </strong>
            </p>
            <SubQuestion label="4.3">
              En te basant sur tes réponses aux questions précédentes, le sportif va-t-il prendre
              un abonnement ?
            </SubQuestion>
            <SubQuestion label="4.4">
              Étant donné la réponse à la question précédente, calcule combien de visites le
              sportif va effectuer en période 1.
            </SubQuestion>
            <p>
              <strong>
                En supposant le sportif sophistiqué sur son problème de self-contrôle (
                <M tex="\hat\beta = \beta" />) :
              </strong>
            </p>
            <SubQuestion label="4.5">
              En te basant sur tes réponses aux questions précédentes, le sportif va-t-il prendre
              un abonnement ?
            </SubQuestion>
            <SubQuestion label="4.6">
              Étant donné la réponse à la question précédente, calcule combien de visites le
              sportif va effectuer en période 1. Aurait-il été moins cher d'effectuer ce nombre de
              visites en utilisant l'autre option tarifaire ? Discute les raisons pour lesquelles
              le sportif sophistiqué a choisi l'option tarifaire sélectionnée à la question 4.5.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "Décoder le modèle : ce que le sportif veut… et ce qu'il fera",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  Regarde bien la structure des deux fonctions d'utilité. Vue de la période 0,{" "}
                  <em>toute</em> l'histoire (effort, paiements, bénéfice santé) se déroule dans le
                  futur : chaque terme de <M tex="U_0" /> est multiplié par <M tex="\beta" />. Vue
                  de la période 1 en revanche, le coût d'effort et le paiement sont{" "}
                  <em>immédiats</em> (pas de <M tex="\beta" />) alors que le bénéfice santé reste
                  futur (toujours multiplié par <M tex="\beta" />).
                </p>
                <Callout variant="intuition">
                  <p>
                    C'est le cœur du biais présent : en période 0, le sportif compare coûts et
                    bénéfices « à froid », sans distorsion (le <M tex="\beta" /> commun se
                    simplifie). En période 1, le coût est ressenti plein pot mais le bénéfice est
                    déprécié par <M tex="\beta = \tfrac{1}{2}" /> : son « moi du moment » est
                    tenté d'en faire moins. Les questions 4.1–4.2 décrivent ce qu'il{" "}
                    <em>souhaite</em>, la suite ce qu'il <em>fera</em>.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.1 — Visites souhaitées avec abonnement (a = 1)",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  Pour <M tex="a = 1" />, on a :
                </p>
                <MB tex="U_0(1,k) = -\beta\frac{k^2}{2} - \beta C + \beta b k" />
                <p>
                  Le nombre optimal de visites vient de la condition de premier ordre{" "}
                  <M tex="\tfrac{\partial U_0(1,k)}{\partial k} = 0" /> :
                </p>
                <MB tex="-\beta k^* + \beta b = 0 \quad\Longrightarrow\quad k^* = b = 10" />
                <p>
                  Le sportif souhaite faire <strong>10 visites</strong> s'il prend un abonnement.
                  Note que <M tex="\beta" /> s'est simplifié : le biais ne déforme pas ce qu'il{" "}
                  <em>souhaite</em> depuis la période 0.
                </p>
              </>
            ),
          },
          {
            title: "4.2 — Visites souhaitées sans abonnement (a = 0)",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  Pour <M tex="a = 0" />, chaque visite coûte <M tex="p" /> :
                </p>
                <MB tex="U_0(0,k) = -\beta\frac{k^2}{2} - \beta p k + \beta b k" />
                <p>La CPO donne :</p>
                <MB tex="-\beta k^* - \beta p + \beta b = 0 \quad\Longrightarrow\quad k^* = b - p = 6" />
                <p>
                  Le sportif souhaite faire <strong>6 visites</strong> s'il paie chaque visite.
                </p>
                <Callout variant="attention">
                  <p>
                    Il souhaite plus de visites avec abonnement (10) que sans (6), mais{" "}
                    <strong>le self-contrôle n'y est pour rien</strong> : c'est une pure histoire
                    de coût marginal. Sans abonnement, une visite supplémentaire coûte{" "}
                    <M tex="p = 4" /> ; avec abonnement, elle ne coûte rien de plus. Il est
                    rationnel d'augmenter sa consommation quand le prix marginal tombe à zéro.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "4.3 — Le naïf choisit son tarif",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  Le sportif naïf (<M tex="\hat\beta = 1" />) croit qu'il implémentera en
                  période 1 le programme qu'il trouve optimal en période 0 : pour chaque option
                  tarifaire, il pense faire le nombre de visites souhaité (10 avec abonnement, 6
                  sans). Il prend l'abonnement si <M tex="U_0(1, k^*) > U_0(0, k^*)" /> — attention,
                  le <M tex="k^*" /> change avec l'option ! Comme <M tex="\beta" /> est en facteur
                  des deux côtés, on peut le simplifier :
                </p>
                <MB tex="-\frac{(k^*)^2}{2} - C + b k^* \;>\; -\frac{(k^*)^2}{2} - p k^* + b k^*" />
                <MB tex="\underbrace{-\frac{(10)^2}{2} - 25 + 10 \times 10}_{=\,25} \;>\; \underbrace{-\frac{(6)^2}{2} - 4\times 6 + 10\times 6}_{=\,18}" />
                <p>
                  <M tex="25 > 18" /> : le sportif naïf décide de{" "}
                  <strong>prendre un abonnement</strong>.
                </p>
              </>
            ),
          },
          {
            title: "4.4 — Période 1 : ce que le naïf fait vraiment",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  En période 1, c'est <M tex="U_1" /> qui commande, avec <M tex="a = 1" /> déjà
                  fixé :
                </p>
                <MB tex="U_1(1,k) = -\frac{k^2}{2} - C + \beta b k" />
                <p>La CPO donne :</p>
                <MB tex="-k^* + \beta b = 0 \quad\Longrightarrow\quad k^* = \beta b = 5" />
                <p>
                  Le sportif n'effectuera que <strong>5 visites</strong> — la moitié des 10 qu'il
                  souhaitait. Le self-contrôle mord ici : le coût d'effort est immédiat, le
                  bénéfice santé est futur et déprécié par <M tex="\beta = \tfrac{1}{2}" />.
                </p>
              </>
            ),
          },
          {
            title: "4.5 — Le sophistiqué anticipe son futur moi",
            refs: [{ chapter: "a2", section: "selfcontrole" }],
            content: (
              <>
                <p>
                  Le sportif sophistiqué (<M tex="\hat\beta = \beta" />) sait que, s'il prend
                  l'abonnement, il ne fera que <M tex="k^* = \beta b = 5" /> visites (le calcul de
                  4.4). L'utilité <M tex="U_0" /> qu'il anticipe avec abonnement vaut :
                </p>
                <MB tex="U_0(1, 5) = -\frac{1}{2}\cdot\frac{(5)^2}{2} - \frac{1}{2}\cdot 25 + \frac{1}{2}\cdot 10\times 5 = \frac{25}{4}" />
                <p>
                  Et sans abonnement ? Son futur moi maximisera{" "}
                  <M tex="\hat U_1(0,k) = -\tfrac{k^2}{2} - pk + \hat\beta b k" />, dont la CPO
                  donne :
                </p>
                <MB tex="-k^* - p + \hat\beta b = 0 \quad\Longrightarrow\quad k^* = \hat\beta b - p = 5 - 4 = 1" />
                <p>
                  Il anticipe donc <strong>1 seule visite</strong> sans abonnement (au lieu des 6
                  souhaitées). L'utilité <M tex="U_0" /> de ce programme est :
                </p>
                <MB tex="U_0(0, 1) = -\frac{1}{2}\cdot\frac{(1)^2}{2} - \frac{1}{2}\cdot 4\times 1 + \frac{1}{2}\cdot 10 \times 1 = \frac{11}{4}" />
                <p>
                  Comparaison : <M tex="\tfrac{25}{4} > \tfrac{11}{4}" /> — le sportif sophistiqué{" "}
                  <strong>prend aussi un abonnement</strong>.
                </p>
              </>
            ),
          },
          {
            title: "4.6 — Payer 25 pour 5 visites : l'abonnement comme commitment device",
            refs: [{ chapter: "a2", section: "commit" }],
            content: (
              <>
                <p>
                  Ayant pris l'abonnement, le sophistiqué effectuera <strong>5 visites</strong>{" "}
                  (le nombre qui maximise <M tex="U_1(1,k)" />, cf. 4.4). Or 5 visites payées à
                  l'unité auraient coûté <M tex="pk = 4 \times 5 = 20" />, contre{" "}
                  <M tex="C = 25" /> pour l'abonnement :{" "}
                  <strong>oui, l'autre tarif aurait été moins cher</strong> pour ce nombre de
                  visites.
                </p>
                <p>
                  Pourquoi le sophistiqué choisit-il quand même l'abonnement ? Parce que la
                  comparaison « 25 contre 20 » est un contrefactuel trompeur : sans abonnement, il
                  ne ferait <em>pas</em> 5 visites, mais <strong>une seule</strong>. Le vrai choix
                  est entre <M tex="U_0(1,5) = \tfrac{25}{4}" /> et{" "}
                  <M tex="U_0(0,1) = \tfrac{11}{4}" />.
                </p>
                <Callout variant="retiens">
                  <p>
                    L'abonnement sert de <strong>« commitment device »</strong> : en ramenant le
                    coût marginal d'une visite à zéro, il pousse le « moi du futur » à se
                    rapprocher du programme souhaité (5 visites au lieu d'une). Le sophistiqué
                    paie 5 de plus <em>pour se lier les mains</em>.
                  </p>
                </Callout>
                <p>
                  Note la subtilité : le naïf prend l'abonnement pour une{" "}
                  <strong>autre raison</strong> — c'est l'option qui maximise le programme{" "}
                  <em>souhaité</em> en l'absence de self-contrôle (question 4.3). Il ignore qu'il
                  déviera de ce programme en période 1. Même choix final, raisonnements
                  radicalement différents.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>4.1</strong> <M tex="k^* = b = 10" /> visites · <strong>4.2</strong>{" "}
              <M tex="k^* = b - p = 6" /> visites · <strong>4.3</strong> le naïf prend
              l'abonnement (25 contre 18) · <strong>4.4</strong> il ne fera que{" "}
              <M tex="k^* = \beta b = 5" /> visites · <strong>4.5</strong> le sophistiqué prend
              aussi l'abonnement (<M tex="\tfrac{25}{4}" /> contre <M tex="\tfrac{11}{4}" />) ·{" "}
              <strong>4.6</strong> 5 visites ; à l'unité elles auraient coûté 20 au lieu de 25,
              mais l'abonnement est un commitment device contre le biais.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> distingue toujours trois objets — le
              programme <em>souhaité</em> en période 0 (maximiser <M tex="U_0" />), le
              comportement <em>réalisé</em> en période 1 (maximiser <M tex="U_1" />), et la{" "}
              <em>croyance</em> <M tex="\hat\beta" /> qui relie les deux. Le naïf se trompe sur
              son futur moi ; le sophistiqué le connaît et achète de l'engagement.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp1"
        id="qx4"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Le sportif naïf et le sportif sophistiqué prennent tous les deux l'abonnement.
            Est-ce pour la même raison ?
          </>
        }
        options={[
          {
            text: (
              <>
                Non : le naïf croit qu'il fera les 10 visites souhaitées ; le sophistiqué sait
                qu'il n'en ferait qu'une seule sans abonnement et l'utilise comme commitment
                device.
              </>
            ),
            correct: true,
            explain: (
              <>
                C'est la distinction-clé de l'exercice : même décision, mais fondée sur des
                croyances <M tex="\hat\beta" /> opposées quant au comportement futur.
              </>
            ),
          },
          {
            text: (
              <>Oui : tous deux calculent que l'abonnement est l'option la moins chère par visite.</>
            ),
            explain: (
              <>
                Au contraire — pour les 5 visites finalement effectuées, l'abonnement (25) coûte{" "}
                <em>plus</em> cher que le paiement à l'unité (20). Ce n'est pas une logique de
                prix par visite.
              </>
            ),
          },
          {
            text: <>Non : le naïf fait une erreur de calcul, le sophistiqué calcule correctement.</>,
            explain: (
              <>
                Les deux optimisent parfaitement <em>étant donné leurs croyances</em>. L'erreur du
                naïf ne porte pas sur le calcul mais sur la croyance <M tex="\hat\beta = 1" /> à
                propos de son propre biais.
              </>
            ),
          },
        ]}
      />

      {/* ============================================================ */}
      {/* Exercice 5 — Utilité espérée : la panne d'essence              */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex5"
        number={5}
        title="S'arrêter à la pompe ? Décider sous incertitude"
        difficulty={1}
        refs={[{ chapter: "a3", section: "s4" }]}
        statement={
          <>
            <p>
              En conduisant sur l'autoroute, tu te rends compte que tu es sur la réserve de
              carburant. Tu dois décider entre t'arrêter ou non à la pompe à essence située à
              500 mètres. L'alternative est de continuer à rouler jusqu'à la prochaine pompe qui
              se trouve, elle, à 30 km. Tu penses qu'il y a une probabilité de <M tex="1/2" />{" "}
              d'avoir assez de carburant pour arriver à cette pompe. Tu retires une utilité de 10
              si tu t'arrêtes à la pompe située à 500 mètres, une utilité de 20 si tu t'arrêtes à
              celle à 30 km, et une utilité de <M tex="-10" /> si tu tombes en panne et dois
              t'arrêter sur la bande d'arrêt d'urgence.
            </p>
            <SubQuestion label="5.1">
              Si tu es rationnel, vas-tu t'arrêter à la pompe dans 500 mètres ?
            </SubQuestion>
            <SubQuestion label="5.2">
              Suppose maintenant que tu attribues une probabilité de <M tex="3/4" /> d'avoir assez
              de carburant pour arriver à la prochaine pompe. Réponds à la question 5.1.
            </SubQuestion>
            <SubQuestion label="5.3">
              Suppose maintenant que tu attribues une probabilité de <M tex="3/4" /> d'avoir assez
              de carburant pour arriver à la prochaine pompe, mais que l'utilité que tu retires de
              t'arrêter sur la bande d'arrêt d'urgence soit de 5. Réponds à la question 5.1.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "5.1 — Poser la loterie et comparer les utilités espérées",
            refs: [{ chapter: "a3", section: "s4" }],
            content: (
              <>
                <p>
                  Confronté à l'incertitude, un décideur rationnel choisit l'alternative qui lui
                  apporte la plus grande <strong>utilité espérée</strong>. Ici, « s'arrêter » est
                  une option sûre, « continuer » est une loterie à deux issues (arriver à la pompe
                  suivante, ou tomber en panne) :
                </p>
                <MB tex="U(\text{Stop}) = 10" />
                <MB tex="U(\text{Continuer}) = \frac{1}{2}\times u(\text{Suivante}) + \frac{1}{2}\times u(\text{Panne}) = \frac{1}{2}\times 20 - \frac{1}{2}\times 10 = 5" />
                <p>
                  <M tex="10 > 5" /> : tu préfères <strong>t'arrêter</strong> à la pompe située à
                  500 mètres.
                </p>
                <Callout variant="methode">
                  <p>
                    Réflexe systématique : (1) liste les issues, (2) attache une probabilité et
                    une utilité à chacune, (3) calcule l'espérance, (4) compare. Ici les utilités
                    sont données directement — pas besoin de fonction <M tex="u(\cdot)" /> sur la
                    richesse.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "5.2 — La probabilité d'arriver monte à 3/4",
            refs: [{ chapter: "a3", section: "s4" }],
            content: (
              <>
                <p>Seules les pondérations changent :</p>
                <MB tex="U(\text{Continuer}) = \frac{3}{4}\times 20 - \frac{1}{4}\times 10 = 12{,}5" />
                <p>
                  <M tex="12{,}5 > 10" /> : cette fois tu préfères <strong>continuer</strong>{" "}
                  jusqu'à la prochaine pompe. Une même personne, avec les mêmes utilités, change
                  rationnellement de décision quand ses croyances changent.
                </p>
              </>
            ),
          },
          {
            title: "5.3 — Une panne (beaucoup) moins pénible",
            refs: [{ chapter: "a3", section: "s4" }],
            content: (
              <>
                <p>
                  L'utilité en cas de panne passe de <M tex="-10" /> à <M tex="5" /> (par exemple,
                  tu as une assurance dépannage efficace). Le corrigé officiel effectue le calcul
                  avec la probabilité <M tex="1/2" /> :
                </p>
                <MB tex="U(\text{Continuer}) = \frac{1}{2}\times 20 + \frac{1}{2}\times 5 = 12{,}5" />
                <p>
                  Avec les données littérales de l'énoncé (probabilité <M tex="3/4" />), tu
                  obtiendrais :
                </p>
                <MB tex="U(\text{Continuer}) = \frac{3}{4}\times 20 + \frac{1}{4}\times 5 = 16{,}25" />
                <p>
                  Dans les deux cas, l'utilité espérée de continuer dépasse 10 : tu préfères{" "}
                  <strong>continuer</strong>.
                </p>
                <Callout variant="attention" title="Petit écart entre énoncé et corrigé">
                  <p>
                    L'énoncé de 5.3 annonce une probabilité de <M tex="3/4" />, mais le corrigé
                    officiel calcule avec <M tex="1/2" /> (comme en 5.1) et trouve 12,5. La
                    conclusion est identique quelle que soit la version — retiens surtout la
                    logique : moins la panne fait mal, plus continuer devient attractif.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "Pour explorer — où se trouve le seuil de bascule ?",
            refs: [{ chapter: "a3", section: "s4" }],
            content: (
              <>
                <p>
                  Généralisons : tu continues dès que{" "}
                  <M tex="p \times 20 + (1-p)\times u_{\text{panne}} > 10" />, c'est-à-dire dès
                  que
                </p>
                <MB tex="p > \frac{10 - u_{\text{panne}}}{20 - u_{\text{panne}}}" />
                <p>
                  Avec <M tex="u_{\text{panne}} = -10" />, le seuil vaut <M tex="2/3" /> ; avec{" "}
                  <M tex="u_{\text{panne}} = 5" />, il tombe à <M tex="1/3" />. Manipule les deux
                  curseurs pour retrouver les trois questions de l'exercice :
                </p>
                <FuelExplorer />
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>5.1</strong> tu t'arrêtes (<M tex="10 > 5" />) · <strong>5.2</strong> tu
              continues (<M tex="12{,}5 > 10" />) · <strong>5.3</strong> tu continues (12,5 dans
              le corrigé, qui calcule avec <M tex="p = 1/2" /> ; 16,25 avec la probabilité 3/4 de
              l'énoncé — même conclusion).
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> la décision rationnelle sous incertitude se
              réduit à une comparaison d'utilités espérées, et elle est sensible à deux
              ingrédients distincts : les <em>croyances</em> (probabilités) et les{" "}
              <em>conséquences</em> (utilités). Changer l'un ou l'autre peut faire basculer le
              choix.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 6 — Investissement risqué                             */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex6"
        number={6}
        title="Investir dans le projet de Koen ?"
        difficulty={2}
        refs={[
          { chapter: "a3", section: "s5" },
          { chapter: "a3", section: "s6" },
          { chapter: "a3", section: "s7" },
        ]}
        statement={
          <>
            <p>
              Ton ami Koen a besoin de 10 000 euros pour démarrer un projet. Il te demande si tu
              serais prêt à y investir 10 000 euros. Il y a une probabilité de <M tex="3/4" /> que
              son projet soit couronné de succès. Dans ce cas, Koen promet de te rembourser
              14 400 euros. Si, dans le cas contraire, son projet ne fonctionnait pas, Koen ne
              pourrait rien te rendre. Tu as exactement 10 000 euros sur ton compte en banque. Ta
              fonction d'utilité de Bernoulli est donnée par <M tex="u(x) = \sqrt{x}" />.
            </p>
            <SubQuestion label="6.1">
              Utilise le Théorème de l'aversion au risque pour montrer que tu es averse au risque.
            </SubQuestion>
            <SubQuestion label="6.2">
              Calcule la valeur monétaire attendue de l'investissement que Koen te propose.
              Calcule l'équivalent certain de cet investissement.
            </SubQuestion>
            <SubQuestion label="6.3">
              Si tu es rationnel et que Koen ne te permet pas d'investir moins de 10 000 euros
              dans son projet, vas-tu investir ?
            </SubQuestion>
            <SubQuestion label="6.4">
              Si Koen te permet d'investir un montant <M tex="A \in [0,\, 10\,000]" />, quel
              montant <M tex="A^*" /> souhaiteras-tu investir ?
            </SubQuestion>
            <SubQuestion label="6.5">
              Suppose que tu investisses le montant <M tex="A^*" /> calculé ci-dessus : quel est
              l'équivalent certain de ton portefeuille (compte en banque + investissement) ?
              Quelle est la prime de risque minimale de ton portefeuille ?
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "6.1 — Montrer l'aversion au risque : le signe de u''",
            refs: [{ chapter: "a3", section: "s5" }],
            content: (
              <>
                <p>
                  D'après le théorème de l'aversion au risque, tu es averse au risque si et
                  seulement si ta fonction d'utilité de Bernoulli est concave :{" "}
                  <M tex="u''(x) < 0" /> pour tout <M tex="x \ge 0" />. Avec{" "}
                  <M tex="u(x) = x^{1/2}" /> :
                </p>
                <MB tex="u'(x) = \frac{1}{2}x^{-1/2} \qquad \text{et} \qquad u''(x) = -\frac{1}{2}\cdot\frac{1}{2}x^{-3/2} = -\frac{1}{4}x^{-3/2} < 0" />
                <p>
                  La dérivée seconde est strictement négative : tu es bien{" "}
                  <strong>averse au risque</strong>. Intuitivement, la racine carrée aplatit les
                  gains : chaque euro supplémentaire apporte de moins en moins d'utilité.
                </p>
              </>
            ),
          },
          {
            title: "6.2 — VMA et équivalent certain du tout-ou-rien",
            refs: [
              { chapter: "a3", section: "s2" },
              { chapter: "a3", section: "s6" },
            ],
            content: (
              <>
                <p>
                  La <strong>valeur monétaire attendue</strong> d'investir les 10 000 euros est :
                </p>
                <MB tex="VMA(\text{investir}) = \frac{3}{4}\times 14\,400 + \frac{1}{4}\times 0 = 10\,800 \text{ euros}" />
                <p>
                  L'<strong>équivalent certain</strong> est le montant sûr <M tex="C" /> qui te
                  donnerait la même utilité espérée : <M tex="u(C) = U(\text{investir})" />, où
                </p>
                <MB tex="U(\text{investir}) = \frac{3}{4}\times u(14\,400) + \frac{1}{4}\times u(0) = \frac{3}{4}\times\sqrt{14\,400} + \frac{1}{4}\times 0 = \frac{3}{4}\times 120 = 90" />
                <p>On en déduit :</p>
                <MB tex="\sqrt{C} = 90 \quad\Longleftrightarrow\quad C = 90^2 = 8\,100 \text{ euros}" />
                <Callout variant="intuition">
                  <p>
                    Regarde l'écart : la loterie « vaut » 10 800 en espérance, mais tu ne serais
                    prêt à l'échanger que contre 8 100 sûrs. Les 2 700 d'écart, c'est le prix du
                    risque pour toi.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "6.3 — Tout investir ? Non.",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>Si tu es rationnel, tu n'investiras pas : </p>
                <MB tex="u(10\,000) = 100 \;>\; 90 = U(\text{investir})" />
                <p>
                  On peut aussi le lire avec les équivalents certains : l'équivalent certain
                  d'investir (8 100 euros) est plus faible que celui de ne pas investir (garder
                  tes 10 000 euros sûrs). Le projet a beau être favorable en espérance
                  (10 800 contre 10 000), le risque de tout perdre pèse trop lourd pour un agent
                  averse au risque.
                </p>
              </>
            ),
          },
          {
            title: "6.4 — Le montant optimal A*",
            refs: [{ chapter: "a3", section: "s7" }],
            content: (
              <>
                <p>
                  Soit <M tex="A \in [0,\, 10\,000]" /> le montant investi. Chaque euro investi
                  rapporte <M tex="14\,400/10\,000 = 1{,}44" /> euro en cas de succès et 0 en cas
                  d'échec. Ta richesse finale vaut donc{" "}
                  <M tex="10\,000 - A + 1{,}44A = 10\,000 + 0{,}44A" /> en cas de succès et{" "}
                  <M tex="10\,000 - A" /> en cas d'échec. L'utilité espérée est :
                </p>
                <MB tex="U(\text{investir } A) = \frac{3}{4}\,(10\,000 + 0{,}44A)^{1/2} + \frac{1}{4}\,(10\,000 - A)^{1/2}" />
                <p>On dérive par rapport à <M tex="A" /> :</p>
                <MB tex="\frac{\partial U}{\partial A} = \frac{3}{4}\cdot\frac{1}{2}\cdot 0{,}44\,(10\,000+0{,}44A)^{-1/2} - \frac{1}{4}\cdot\frac{1}{2}\,(10\,000-A)^{-1/2}" />
                <MB tex="= \frac{33}{200}\,(10\,000+0{,}44A)^{-1/2} - \frac{1}{8}\,(10\,000-A)^{-1/2}" />
                <p>
                  Le montant <M tex="A^*" /> qui maximise l'utilité espérée annule cette dérivée :
                </p>
                <MB tex="\frac{33}{200}\,(10\,000+0{,}44A^*)^{-1/2} = \frac{1}{8}\,(10\,000-A^*)^{-1/2}" />
                <MB tex="\frac{25}{33}\,(10\,000+0{,}44A^*)^{1/2} = (10\,000-A^*)^{1/2}" />
                <MB tex="\Bigl(\frac{25}{33}\Bigr)^{2}(10\,000+0{,}44A^*) = 10\,000-A^*" />
                <MB tex="A^* \approx 3\,400 \text{ euros}" />
                <Callout variant="intuition">
                  <p>
                    Étonnant ? Tu refuses le tout-ou-rien, mais tu investis volontiers{" "}
                    <em>une partie</em>. Autour de <M tex="A = 0" />, le coût du risque est du
                    second ordre alors que le gain d'espérance (44 centimes par euro, en
                    espérance) est du premier ordre : les premiers euros investis sont presque
                    « gratuits » en risque.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "6.5 — Équivalent certain et prime de risque du portefeuille",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>
                  Avec <M tex="A^* = 3\,400" />, ton portefeuille vaut{" "}
                  <M tex="10\,000 + 0{,}44\times 3\,400 = 11\,496" /> en cas de succès et{" "}
                  <M tex="10\,000 - 3\,400 = 6\,600" /> en cas d'échec. L'équivalent certain{" "}
                  <M tex="C^*" /> vérifie <M tex="u(C^*) = U(\text{investir } A^*)" /> :
                </p>
                <MB tex="\sqrt{C^*} = \frac{3}{4}\sqrt{11\,496} + \frac{1}{4}\sqrt{6\,600} \quad\Longrightarrow\quad C^* \approx 10\,145 \text{ euros}" />
                <p>
                  La <strong>prime de risque minimale</strong> est la différence entre la VMA du
                  portefeuille et son équivalent certain :
                </p>
                <MB tex="VMA(\text{investir } A^*) = \frac{3}{4}\times 11\,496 + \frac{1}{4}\times 6\,600 = 10\,272" />
                <MB tex="PRM = 10\,272 - 10\,145 = 127 \text{ euros}" />
                <p>
                  Tu serais prêt à sacrifier jusqu'à 127 euros d'espérance pour te débarrasser du
                  risque de ce portefeuille. Et note que{" "}
                  <M tex="C^* \approx 10\,145 > 10\,000" /> : investir <M tex="A^*" /> vaut
                  strictement mieux que ne rien investir du tout.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>6.1</strong> <M tex="u''(x) = -\tfrac{1}{4}x^{-3/2} < 0" /> : averse au
              risque · <strong>6.2</strong> VMA = 10 800 euros ; équivalent certain = 8 100 euros
              · <strong>6.3</strong> non : <M tex="100 > 90" /> · <strong>6.4</strong>{" "}
              <M tex="A^* \approx 3\,400" /> euros · <strong>6.5</strong>{" "}
              <M tex="C^* \approx 10\,145" /> euros et prime de risque = 127 euros.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> refuser un pari en bloc n'implique pas le
              refuser en partie — pour un agent averse au risque, le montant optimal dans un actif
              risqué favorable est souvent intérieur (ni 0, ni tout). L'équivalent certain est{" "}
              <em>l'outil</em> pour comparer des situations risquées en euros, et la prime de
              risque en mesure le coût.
            </p>
          </>
        }
      />

      {/* ============================================================ */}
      {/* Exercice 7 — Assurance optimale                                */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex7"
        number={7}
        title="Assurer la voiture électrique"
        difficulty={2}
        refs={[
          { chapter: "a3", section: "s9" },
          { chapter: "a3", section: "s6" },
        ]}
        statement={
          <>
            <p>
              Tes parents disposent de 30 000 euros. Ils utilisent une partie de cette somme pour
              acheter une voiture électrique neuve qui coûte 20 000 euros. Étant donné qu'ils
              utilisent cette voiture une fois par semaine, il y a 1 chance sur 10 (probabilité de{" "}
              <M tex="1/10" />) que la voiture soit détruite dans un accident au cours de l'année
              à venir. La compagnie d'assurance facture 0,12 euro par euro assuré.
            </p>
            <SubQuestion label="7.1">
              En supposant que la fonction d'utilité de Bernoulli de tes parents est{" "}
              <M tex="u(x) = \sqrt{x}" />, calcule le montant optimal{" "}
              <M tex="C^* \in [0,\, 20\,000]" /> qu'ils choisissent de couvrir.
            </SubQuestion>
            <SubQuestion label="7.2">
              Quel est l'équivalent certain des actifs de tes parents lorsqu'ils assurent ce
              montant <M tex="C^*" /> ?
            </SubQuestion>
            <SubQuestion label="7.3">Le coût de cette assurance est-il actuariellement juste ?</SubQuestion>
            <p>
              <strong>
                Faisons maintenant l'hypothèse que les parents disposent de 40 000 euros au lieu
                de 30 000.
              </strong>
            </p>
            <SubQuestion label="7.4">
              Calcule la nouvelle couverture optimale <M tex="C^* \in [0,\, 20\,000]" />.
            </SubQuestion>
            <SubQuestion label="7.5">
              Compare la nouvelle couverture optimale à celle obtenue à la question 7.1. Sans
              faire de calculs, discute comment évolue l'aversion au risque des parents avec leur
              richesse.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "7.1 — Écrire la richesse dans chaque état du monde, puis optimiser",
            refs: [{ chapter: "a3", section: "s9" }],
            content: (
              <>
                <p>
                  Soit <M tex="C \in [0,\, 20\,000]" /> le nombre d'euros couverts. La prime{" "}
                  <M tex="0{,}12\,C" /> est payée <em>dans tous les cas</em> ; l'indemnité{" "}
                  <M tex="C" /> n'est versée qu'en cas d'accident. La richesse <M tex="x" /> en
                  cas d'accident et la richesse <M tex="y" /> sans accident valent :
                </p>
                <MB tex="x = 30\,000 - 0{,}12C - 20\,000 + C = 10\,000 + 0{,}88C" />
                <MB tex="y = 30\,000 - 0{,}12C" />
                <p>L'utilité espérée lorsque le montant assuré est <M tex="C" /> :</p>
                <MB tex="U(C) = \frac{1}{10}\,(10\,000 + 0{,}88C)^{1/2} + \frac{9}{10}\,(30\,000 - 0{,}12C)^{1/2}" />
                <p>La condition de premier ordre s'écrit :</p>
                <MB tex="\frac{\partial U}{\partial C} = 0{,}044\,(10\,000+0{,}88C)^{-1/2} - 0{,}054\,(30\,000-0{,}12C)^{-1/2} = 0" />
                <p>
                  (les coefficients viennent de <M tex="\tfrac{1}{10}\times\tfrac{0{,}88}{2} = 0{,}044" />{" "}
                  et <M tex="\tfrac{9}{10}\times\tfrac{0{,}12}{2} = 0{,}054" />). La solution est :
                </p>
                <MB tex="C^* \approx 10\,338 \text{ euros couverts}" />
                <p className="text-sm text-muted-foreground">
                  (Valeur du corrigé officiel ; selon les arrondis intermédiaires tu peux trouver
                  ≈ 10 334 — c'est le même résultat à l'arrondi près.)
                </p>
                <Callout variant="attention">
                  <p>
                    N'oublie pas que la prime se paie <em>aussi</em> quand il n'y a pas
                    d'accident : elle apparaît dans <M tex="x" /> <em>et</em> dans <M tex="y" />.
                    L'erreur classique est de ne la soustraire que dans l'état « accident ».
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "7.2 — L'équivalent certain des actifs assurés",
            refs: [{ chapter: "a3", section: "s6" }],
            content: (
              <>
                <p>
                  L'équivalent certain <M tex="E^*" /> est la somme sûre qui procure la même
                  utilité que la situation risquée avec couverture <M tex="C^*" /> :
                </p>
                <MB tex="\sqrt{E^*} = \frac{1}{10}\,(10\,000 + 0{,}88C^*)^{1/2} + \frac{9}{10}\,(30\,000 - 0{,}12C^*)^{1/2}" />
                <MB tex="E^* \approx 27\,705 \text{ euros}" />
                <p>
                  À comparer aux 30 000 euros de départ : le risque d'accident, même
                  partiellement assuré, « coûte » l'équivalent d'environ 2 300 euros de richesse
                  sûre.
                </p>
              </>
            ),
          },
          {
            title: "7.3 — La prime est-elle actuariellement juste ?",
            refs: [
              { chapter: "a3", section: "s9" },
              { chapter: "a3", section: "s5" },
            ],
            content: (
              <>
                <p>
                  <strong>Non.</strong> Chaque euro couvert coûte 0,12 euro, alors que la
                  probabilité d'accident est <M tex="\pi = 0{,}1" />. La valeur monétaire attendue
                  d'un euro assuré est :
                </p>
                <MB tex="VMA(1\text{ euro assuré}) = \frac{9}{10}\times 0 + \frac{1}{10}\times 1 = 0{,}1" />
                <p>
                  Le prix actuariellement juste serait donc 0,10 euro par euro couvert. À
                  0,12 euro, chaque euro d'assurance <em>réduit</em> la VMA des actifs de tes
                  parents. S'ils s'assurent quand même (à hauteur de 10 338 euros), c'est parce
                  qu'un agent averse au risque est prêt à échanger un peu de VMA contre une
                  réduction du risque.
                </p>
                <Callout variant="retiens">
                  <p>
                    Repère d'examen : avec une prime actuariellement juste, un agent averse au
                    risque se couvre <em>totalement</em> ; avec une prime plus chère que juste, il
                    se couvre <em>partiellement</em> — exactement ce qu'on trouve ici (
                    <M tex="C^* < 20\,000" />).
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "7.4 — Des parents plus riches : nouvelle couverture optimale",
            refs: [{ chapter: "a3", section: "s9" }],
            content: (
              <>
                <p>
                  Avec 40 000 euros de richesse initiale, seules les richesses d'état changent :
                </p>
                <MB tex="x = 20\,000 + 0{,}88C \qquad \text{et} \qquad y = 40\,000 - 0{,}12C" />
                <p>La CPO garde la même forme :</p>
                <MB tex="0{,}044\,(20\,000+0{,}88C^*)^{-1/2} = 0{,}054\,(40\,000-0{,}12C^*)^{-1/2}" />
                <MB tex="C^* \approx 6\,832 \text{ euros couverts}" />
              </>
            ),
          },
          {
            title: "7.5 — L'aversion au risque diminue avec la richesse",
            refs: [{ chapter: "a3", section: "s5" }],
            content: (
              <>
                <p>
                  Le nombre d'euros couverts lorsque tes parents disposent de 40 000 euros
                  (≈ 6 832) est <strong>inférieur</strong> à celui qu'ils couvrent avec
                  30 000 euros (≈ 10 338). Cela illustre que leur aversion au risque a tendance à{" "}
                  <strong>diminuer avec la richesse</strong>.
                </p>
                <p>
                  L'intuition : il est moins grave de perdre 20 000 euros dans un accident
                  lorsqu'on en possède 40 000 que lorsqu'on n'en possède que 30 000. Avec{" "}
                  <M tex="u(x) = \sqrt{x}" />, la courbure relative de l'utilité s'atténue quand
                  la richesse augmente — le même risque « fait moins mal », donc on paie moins
                  pour s'en protéger.
                </p>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>7.1</strong> <M tex="C^* \approx 10\,338" /> euros couverts ·{" "}
              <strong>7.2</strong> <M tex="E^* \approx 27\,705" /> euros · <strong>7.3</strong>{" "}
              non : 0,12 par euro couvert contre un prix juste de 0,10 (= la probabilité
              d'accident) · <strong>7.4</strong> <M tex="C^* \approx 6\,832" /> euros ·{" "}
              <strong>7.5</strong> la couverture diminue quand la richesse augmente : aversion au
              risque décroissante avec la richesse.
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> la méthode « états du monde » — écrire la
              richesse dans chaque état (prime payée partout, indemnité seulement en cas de
              sinistre), poser l'utilité espérée, dériver. Et deux repères : prime juste = tarif
              égal à la probabilité du sinistre ; prime plus chère → couverture partielle, qui
              diminue encore si la richesse augmente.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp1"
        id="qx7"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            La prime est de 0,12 euro par euro couvert alors que le prix actuariellement juste
            serait 0,10 euro. Pourquoi les parents s'assurent-ils quand même ?
          </>
        }
        options={[
          {
            text: (
              <>
                Parce qu'ils sont averses au risque : ils acceptent de sacrifier un peu de valeur
                monétaire attendue pour réduire le risque auquel ils font face.
              </>
            ),
            correct: true,
            explain: (
              <>
                Exactement le raisonnement du corrigé : l'assurance « surfacturée » diminue la VMA
                des actifs, mais l'agent averse au risque valorise la réduction du risque.
              </>
            ),
          },
          {
            text: <>Parce que l'assurance augmente la valeur monétaire attendue de leurs actifs.</>,
            explain: (
              <>
                C'est l'inverse : chaque euro couvert coûte 0,12 et ne rapporte que 0,10 en
                espérance — la VMA <em>baisse</em> avec la couverture.
              </>
            ),
          },
          {
            text: (
              <>
                Parce que dès que la prime n'est pas juste, il est optimal de couvrir la totalité
                des 20 000 euros.
              </>
            ),
            explain: (
              <>
                Non : c'est avec une prime <em>juste</em> que la couverture totale est optimale.
                Une prime plus chère que juste conduit à une couverture partielle —{" "}
                <M tex="C^* \approx 10\,338 < 20\,000" /> ici.
              </>
            ),
          },
        ]}
      />

      {/* ============================================================ */}
      {/* Exercice 8 — Paris répétés et cadrage étroit                   */}
      {/* ============================================================ */}
      <ExerciseBlock
        scope="tp1"
        id="ex8"
        number={8}
        title="Un pari, deux paris — le cadrage étroit"
        difficulty={3}
        refs={[
          { chapter: "a3", section: "s4" },
          { chapter: "a3", section: "s11" },
        ]}
        statement={
          <>
            <p>
              Soit un individu rationnel qui possède <M tex="w = 100" /> euros et dont la fonction
              d'utilité de Bernoulli est donnée par
            </p>
            <MB tex="u(w) = \sqrt{w}" />
            <p>
              Soit le pari suivant, basé sur le lancer d'une pièce de monnaie : pile, l'individu
              gagne <M tex="a" /> euros ; face, il perd 10 euros — avec <M tex="a > 10" />.
              Considère les deux propositions A et B. La proposition <strong>A</strong> consiste à
              prendre ce pari ou pas. La proposition <strong>B</strong> consiste à prendre ce pari
              deux fois de suite ou aucune fois.
            </p>
            <SubQuestion label="8.1">
              Sous quelle condition sur <M tex="a" /> l'individu accepte-t-il la proposition A ?
            </SubQuestion>
            <SubQuestion label="8.2">
              Sous quelle condition sur <M tex="a" /> l'individu accepte-t-il la proposition B ?
            </SubQuestion>
            <p>
              Imaginons que l'individu ait déjà accepté de prendre une fois le pari mais que,
              avant de connaître le résultat de ce premier pari, on lui demande s'il souhaite le
              prendre une seconde fois.
            </p>
            <SubQuestion label="8.3">
              Sous quelle condition sur <M tex="a" /> l'individu accepte-t-il cette dernière
              proposition ? La condition d'acceptation est-elle différente de celle obtenue à la
              question 8.1 ?
            </SubQuestion>
            <SubQuestion label="8.4">
              Discute quelle condition un individu atteint du biais de cadrage étroit utiliserait
              pour répondre à la question 8.3.
            </SubQuestion>
          </>
        }
        steps={[
          {
            title: "8.1 — Condition d'acceptation de la proposition A",
            refs: [
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s5" },
            ],
            content: (
              <>
                <p>
                  L'individu accepte la proposition A si l'utilité espérée en l'acceptant dépasse
                  l'utilité de ses 100 euros sûrs, <M tex="u(100) = \sqrt{100} = 10" /> :
                </p>
                <MB tex="U(\text{un pari}) = \frac{1}{2}\sqrt{100+a} + \frac{1}{2}\sqrt{100-10}" />
                <p>Il accepte donc si :</p>
                <MB tex="\frac{1}{2}\sqrt{100+a} + \frac{1}{2}\sqrt{90} \;>\; 10 \qquad (5)" />
                <p>En isolant la racine et en élevant au carré :</p>
                <MB tex="\sqrt{100+a} > 20 - \sqrt{90} \quad\Longleftrightarrow\quad a > \bigl(20 - \sqrt{90}\bigr)^2 - 100 \approx 10{,}52" />
                <p>
                  L'individu accepte la proposition A si le gain <M tex="a" /> en cas de victoire
                  est supérieur à environ <strong>10,52 euros</strong> (arrondi du corrigé ; à la
                  deuxième décimale près tu peux obtenir 10,53).
                </p>
                <Callout variant="intuition">
                  <p>
                    Un agent neutre au risque accepterait dès <M tex="a > 10" />. L'aversion au
                    risque exige une compensation supplémentaire — ici environ 52 centimes.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "8.2 — Proposition B : construire la loterie des deux paris",
            refs: [{ chapter: "a3", section: "s4" }],
            content: (
              <>
                <p>
                  Deux lancers indépendants donnent <strong>trois richesses finales</strong>{" "}
                  possibles :
                </p>
                <div className="my-4 overflow-x-auto">
                  <table className="w-full min-w-[22rem] border-collapse text-[14.5px]">
                    <thead>
                      <tr>
                        <th className={TH}>Issue</th>
                        <th className={THc}>Probabilité</th>
                        <th className={THc}>Richesse finale</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={TD}>Pile – Pile</td>
                        <td className={TDc}>1/4</td>
                        <td className={TDc}>
                          <M tex="100 + 2a" />
                        </td>
                      </tr>
                      <tr>
                        <td className={TD}>Pile – Face ou Face – Pile</td>
                        <td className={TDc}>1/2</td>
                        <td className={TDc}>
                          <M tex="100 + a - 10 = 90 + a" />
                        </td>
                      </tr>
                      <tr>
                        <td className={TD}>Face – Face</td>
                        <td className={TDc}>1/4</td>
                        <td className={TDc}>
                          <M tex="100 - 20 = 80" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  L'individu accepte la proposition B si{" "}
                  <M tex="U(\text{deux paris}) > u(100) = 10" />, c'est-à-dire si :
                </p>
                <MB tex="\frac{1}{4}\sqrt{100+2a} + \frac{1}{2}\sqrt{90+a} + \frac{1}{4}\sqrt{80} \;>\; 10 \qquad (6)" />
                <Callout variant="methode">
                  <p>
                    Le réflexe : toujours raisonner sur les <strong>richesses finales</strong>{" "}
                    (100 + gains cumulés), jamais sur les gains isolés. C'est ce qui permet
                    d'agréger correctement les deux lancers en une seule loterie.
                  </p>
                </Callout>
              </>
            ),
          },
          {
            title: "8.3 — Un second pari… quand on détient déjà le premier",
            refs: [
              { chapter: "a3", section: "s4" },
              { chapter: "a3", section: "s11" },
            ],
            content: (
              <>
                <p>
                  Cette fois, refuser ne signifie plus « garder 100 euros sûrs » : l'individu a{" "}
                  <em>déjà</em> un pari en cours. Il compare donc l'utilité espérée avec deux
                  paris à l'utilité espérée avec un seul :
                </p>
                <MB tex="U(\text{deux paris}) > U(\text{un pari})" />
                <p>soit :</p>
                <MB tex="\frac{1}{4}\sqrt{100+2a} + \frac{1}{2}\sqrt{90+a} + \frac{1}{4}\sqrt{80} \;>\; \frac{1}{2}\sqrt{100+a} + \frac{1}{2}\sqrt{90} \qquad (7)" />
                <p>
                  La condition (7) est <strong>différente</strong> de la condition (5). La raison :
                  au moment de décider, ses actifs ne sont pas les mêmes —
                </p>
                <ul className="my-2 list-disc space-y-1 pl-6">
                  <li>
                    ici, il possède 100 euros <em>et</em> un pari déjà accepté (ses actifs
                    incluent un risque en cours) ;
                  </li>
                  <li>dans la proposition A, il possédait simplement 100 euros sûrs.</li>
                </ul>
                <p>
                  Même « nouveau pari », mais point de comparaison différent → condition
                  différente.
                </p>
              </>
            ),
          },
          {
            title: "8.4 — Ce que ferait un individu au cadrage étroit",
            refs: [{ chapter: "a3", section: "s11" }],
            content: (
              <>
                <p>
                  Un individu atteint du <strong>biais de cadrage étroit</strong> évalue un actif
                  risqué <em>pour lui-même</em>, indépendamment de son portefeuille d'actifs. Pour
                  répondre à la question 8.3, il ne tiendrait donc pas compte du fait qu'il a déjà
                  pris un pari : sa condition sur <M tex="a" /> serait différente de la
                  condition (7).
                </p>
                <p>
                  On pourrait par exemple imaginer qu'il raisonne ainsi : il calcule l'équivalent
                  certain <M tex="C" /> de ses actifs avec un seul pari,
                </p>
                <MB tex="u(C) = \frac{1}{2}\sqrt{100+a} + \frac{1}{2}\sqrt{90}" />
                <p>
                  puis traite ce <M tex="C" /> comme une richesse sûre et accepte le second pari
                  si :
                </p>
                <MB tex="\frac{1}{2}\sqrt{C+a} + \frac{1}{2}\sqrt{C-10} \;>\; u(C)" />
                <p>
                  Ce faisant, il « écrase » le risque du premier pari en un montant certain au
                  lieu de raisonner sur les quatre combinaisons pile/face réelles : il ignore la
                  façon dont les deux paris s'agrègent (et notamment la compensation entre un gain
                  sur l'un et une perte sur l'autre).
                </p>
                <Callout variant="retiens">
                  <p>
                    Le cadrage étroit consiste à évaluer chaque risque isolément. Le décideur
                    rationnel évalue toujours son <strong>portefeuille complet</strong> de
                    richesses finales — c'est tout l'écart entre la condition (7) et celle du
                    « narrow framer ».
                  </p>
                </Callout>
              </>
            ),
          },
        ]}
        result={
          <>
            <p>
              <strong>8.1</strong> accepte A si{" "}
              <M tex="\tfrac{1}{2}\sqrt{100+a} + \tfrac{1}{2}\sqrt{90} > 10" />, soit{" "}
              <M tex="a \gtrsim 10{,}52" /> euros · <strong>8.2</strong> accepte B si{" "}
              <M tex="\tfrac{1}{4}\sqrt{100+2a} + \tfrac{1}{2}\sqrt{90+a} + \tfrac{1}{4}\sqrt{80} > 10" />{" "}
              · <strong>8.3</strong> accepte si <M tex="U(\text{deux paris}) > U(\text{un pari})" />{" "}
              — condition (7), différente de (5) car ses actifs incluent déjà le premier pari ·{" "}
              <strong>8.4</strong> le « narrow framer » évalue le second pari isolément (par
              exemple à partir de l'équivalent certain du premier), et sa condition diffère de
              (7).
            </p>
            <p>
              <strong>Ce qu'il faut retenir :</strong> une condition d'acceptation dépend toujours
              de <em>deux</em> choses — la loterie proposée <em>et</em> les actifs déjà détenus.
              Comparer des richesses finales de portefeuille est la marque du raisonnement
              rationnel ; évaluer chaque pari « dans sa bulle » est la marque du cadrage étroit.
            </p>
          </>
        }
      />

      <Quiz
        scope="tp1"
        id="qx8"
        kicker="Pour vérifier que tu as compris la méthode"
        question={
          <>
            Qu'est-ce qui distingue fondamentalement la condition de la question 8.3 de celle de
            la question 8.1 ?
          </>
        }
        options={[
          {
            text: (
              <>
                Le point de comparaison : en 8.3, les actifs incluent déjà le premier pari — on
                compare « deux paris » à « un pari », et non plus « un pari » à « 100 euros
                sûrs ».
              </>
            ),
            correct: true,
            explain: (
              <>
                Oui : la loterie proposée est la même, mais la situation de référence a changé, et
                donc la condition sur <M tex="a" /> aussi.
              </>
            ),
          },
          {
            text: (
              <>
                Rien : accepter « un pari de plus » est toujours la même décision, quelle que soit
                la situation de départ.
              </>
            ),
            explain: (
              <>
                C'est précisément le raisonnement du biais de cadrage étroit ! Le décideur
                rationnel, lui, tient compte de son portefeuille : les conditions (5) et (7) sont
                différentes.
              </>
            ),
          },
          {
            text: <>La probabilité de pile change une fois qu'on a accepté le premier pari.</>,
            explain: (
              <>
                Non, la pièce reste équilibrée (1/2 – 1/2). Ce sont les richesses finales
                associées à chaque issue qui changent, pas les probabilités.
              </>
            ),
          },
        ]}
      />
    </TpShell>
  );
}
