/*
 * Chapitre B3 — PartInfini (sections affichées dans la page du chapitre).
 * § 5 horizon infini (slide 10) · § 6 « toujours trahir » (slides 11-12) ·
 * § 7 grim contre grim, δ ≥ 1/2 (slides 13-14) · § 8 interpréter (slide 15). Deck S8.
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { TheoryRef } from "@/components/course/TheoryRef";
import { InteractiveCard, SliderControl } from "@/components/course/Interactive";
import { GeneralThreshold, GeometricSeriesExplorer, ThresholdDuel } from "./interactives";
import { H4, Steps } from "./ui";

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

/** Nombre au format français (virgule décimale). */
function fr(v: number, digits = 4): string {
  return v.toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Petite tuile « libellé : valeur ». */
function Readout({ label, value, tone }: { label: ReactNode; value: ReactNode; tone?: "good" | "bad" }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-3 py-1.5 text-sm",
        tone === "good" && "border-emerald-300 bg-emerald-50 text-emerald-900",
        tone === "bad" && "border-rose-300 bg-rose-50 text-rose-900",
      )}
    >
      <span className={tone ? undefined : "text-muted-foreground"}>{label} </span>
      <b className="font-mono">{value}</b>
    </div>
  );
}

/** Bouton sobre pour les petits widgets locaux. */
function SmallButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * Dérivation ligne par ligne : la formule à gauche, le « pourquoi » à droite
 * (en dessous sur téléphone). Chaque ligne découle de la précédente.
 */
function Derivation({ rows, label }: { rows: Array<{ tex: string; why?: ReactNode }>; label?: ReactNode }) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-primary/20 bg-accent/40">
      {label ? (
        <div className="border-b border-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-accent-foreground/80">
          {label}
        </div>
      ) : null}
      <ol className="divide-y divide-primary/10">
        {rows.map((r, i) => (
          <li
            key={i}
            className="grid gap-x-4 gap-y-1 px-4 py-2.5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">({i + 1})</span>
              <div className="min-w-0 overflow-x-auto whitespace-nowrap py-0.5 text-[14px] sm:text-base">
                <M tex={r.tex} />
              </div>
            </div>
            {r.why ? <div className="pl-9 text-sm leading-snug text-muted-foreground sm:pl-0">{r.why}</div> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** § 5 — la barre qui se remplit : 2 + 1 + 0,5 + … = 4 (a = 2, δ = 0,5). */
function HalvingBar() {
  const a = 2;
  const d = 0.5;
  const total = a / (1 - d); // = 4
  const MAX = 10;
  const [n, setN] = useState(4);
  const terms = Array.from({ length: n }, (_, t) => a * Math.pow(d, t));
  const sum = terms.reduce((s, v) => s + v, 0);
  const shades = ["bg-sky-700", "bg-sky-600", "bg-sky-500", "bg-sky-400", "bg-sky-300", "bg-sky-200"];
  return (
    <InteractiveCard
      title="La barre qui se remplit sans jamais déborder"
      subtitle={
        <>
          Exemple : <M tex="a = 2" /> et <M tex="\delta = 0{,}5" />. Chaque clic ajoute le terme suivant
          de la somme <M tex="2 + 1 + 0{,}5 + 0{,}25 + \dots" />
        </>
      }
      controls={
        <div className="flex flex-wrap gap-2">
          <SmallButton onClick={() => setN((k) => Math.min(MAX, k + 1))} disabled={n >= MAX}>
            + un terme
          </SmallButton>
          <SmallButton onClick={() => setN(1)} disabled={n === 1}>
            Recommencer
          </SmallButton>
        </div>
      }
      footer={
        <>
          Chaque nouveau terme comble exactement la moitié de ce qui manque encore. Le
          morceau qui manque devient minuscule, mais la barre ne déborde jamais : la somme infinie vaut
          exactement 4, c'est-à-dire <M tex="2/(1-0{,}5)" />.
        </>
      }
    >
      <div
        className="flex h-11 w-full overflow-hidden rounded-lg border bg-muted/40"
        role="img"
        aria-label={`Barre de longueur 4 remplie par ${n} termes : la somme vaut ${fr(sum)}`}
      >
        {terms.map((v, t) => (
          <div
            key={t}
            className={cn(
              "flex h-full shrink-0 items-center justify-center border-r border-white/70 text-xs font-bold text-white transition-all duration-500",
              shades[Math.min(t, shades.length - 1)],
            )}
            style={{ width: `${(v / total) * 100}%` }}
          >
            {v / total >= 0.1 ? fr(v) : ""}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>4 = 2/(1 − 0,5)</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <Readout label="Termes additionnés :" value={n} />
        <Readout label="Somme :" value={fr(sum)} />
        <Readout label="Il manque :" value={fr(total - sum)} />
      </div>
    </InteractiveCard>
  );
}

/**
 * § 7 — le film du slide 13 avec des nombres : première trahison de 2 en période t.
 * Montre que l'écart « coopérer − dévier » vaut δ^t·(4δ − 2)/(1 − δ) : le signe ne dépend pas de t.
 */
function DeviationTiming() {
  const [t, setT] = useState(2);
  const [d, setD] = useState(0.6);
  const N = 8; // périodes affichées : 0 à 7
  const coop = 4 / (1 - d);
  let dev = 0;
  for (let k = 0; k < t; k++) dev += 4 * Math.pow(d, k);
  dev += 6 * Math.pow(d, t) + (2 * Math.pow(d, t + 1)) / (1 - d);
  const gap0 = (4 * d - 2) / (1 - d);
  const gap = Math.pow(d, t) * gap0;
  const same = Math.abs(gap) < 0.0005;
  const z = (v: number) => (Math.abs(v) < 0.0005 ? 0 : v); // évite l'affichage « −0 »
  const cells = (row: "coop" | "dev") =>
    Array.from({ length: N }, (_, k) => (row === "coop" ? 4 : k < t ? 4 : k === t ? 6 : 2));
  return (
    <InteractiveCard
      title="Trahir plus tard change-t-il quelque chose ?"
      subtitle={
        <>
          Le film du slide 13 avec des nombres : le joueur 2 trahit pour la première fois en période{" "}
          <M tex="t" />, face au grim du joueur 1.
        </>
      }
      controls={
        <>
          <SliderControl
            label={
              <>
                Première trahison en période <M tex="t" />
              </>
            }
            value={t}
            onChange={(v) => setT(Math.round(v))}
            min={0}
            max={5}
            step={1}
            format={(v) => String(Math.round(v))}
          />
          <SliderControl
            label={
              <>
                Facteur d'escompte <M tex="\delta" />
              </>
            }
            value={d}
            onChange={setD}
            min={0.05}
            max={0.95}
            step={0.01}
            format={(v) => fr(v, 2)}
          />
        </>
      }
      footer={
        <>
          Les colonnes grisées (avant <M tex="t" />) sont identiques dans les deux
          lignes. Reculer la trahison multiplie l'écart par <M tex="\delta" /> à chaque période de
          retard, mais son signe ne bouge jamais : il ne dépend que de <M tex="4\delta - 2" />.
        </>
      }
    >
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse text-center font-mono text-[13px]">
          <thead>
            <tr className="bg-muted/60 font-sans text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-1.5 py-1.5 text-left">période</th>
              {Array.from({ length: N }, (_, k) => (
                <th key={k} className={cn("px-1 py-1.5", k === t && "text-sky-700")}>
                  {k}
                </th>
              ))}
              <th className="px-1 py-1.5">…</th>
            </tr>
          </thead>
          <tbody>
            {(["coop", "dev"] as const).map((row) => (
              <tr key={row} className="border-t">
                <td className="px-1.5 py-1.5 text-left font-sans text-[12px] font-semibold text-sky-700">
                  {row === "coop" ? "π de 2 : coopère toujours" : "π de 2 : trahit en t"}
                </td>
                {cells(row).map((v, k) => (
                  <td
                    key={k}
                    className={cn(
                      "px-1 py-1.5",
                      k < t && "bg-muted/70 text-muted-foreground",
                      row === "dev" && k === t && "bg-amber-100/80 font-bold",
                    )}
                  >
                    {v}
                  </td>
                ))}
                <td className="px-1 py-1.5 text-muted-foreground">{row === "coop" ? "4" : "2"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <Readout label="Coopérer : 4/(1 − δ) =" value={fr(coop, 3)} />
        <Readout label={`Trahir d'abord en t = ${t} :`} value={fr(dev, 3)} />
        <Readout
          label="Écart coopérer − trahir :"
          value={`${fr(Math.pow(d, t), 3)} × ${fr(z(gap0), 3)} = ${fr(z(gap), 3)}`}
          tone={same ? undefined : gap > 0 ? "good" : "bad"}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {same
          ? "Écart nul : trahir ne rapporte ni plus ni moins que coopérer."
          : gap > 0
            ? "Écart positif : coopérer rapporte plus, quel que soit t."
            : "Écart négatif : trahir rapporte plus, quel que soit t."}{" "}
        (Écart = <M tex="\delta^t \times \frac{4\delta - 2}{1-\delta}" />.)
      </p>
    </InteractiveCard>
  );
}

/**
 * § 7 — le tableau du slide 13 (première trahison de 2 en période t face au grim de 1),
 * en version compacte lisible sur téléphone (en-têtes sans majuscules : « t−1 » ≠ « T »).
 */
function FilmSlide13() {
  const head = ["0", "…", "t−1", "t", "t+1", "…"];
  const rows: Array<{ label: ReactNode; cells: string[]; cls: string }> = [
    { label: <span className="text-rose-700">Action de 1 (grim)</span>, cells: ["C", "C", "C", "C", "T", "T"], cls: "font-bold text-rose-700" },
    { label: <span className="text-sky-700">Action de 2 (dévie)</span>, cells: ["C", "C", "C", "T", "T", "T"], cls: "font-bold text-sky-700" },
    { label: <>π de 1</>, cells: ["4", "4", "4", "0", "2", "2"], cls: "" },
    { label: <>π de 2</>, cells: ["4", "4", "4", "6", "2", "2"], cls: "" },
  ];
  return (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table
        className="w-full border-collapse text-center font-mono text-[14px]"
        aria-label="Tableau du slide 13 : le joueur 2 trahit pour la première fois en période t, le joueur 1 (grim) trahit ensuite pour toujours"
      >
        <thead>
          <tr className="bg-muted/60 font-sans text-[12px] font-bold text-muted-foreground">
            <th className="px-2 py-2 text-left">période</th>
            {head.map((h, i) => (
              <th key={i} className={cn("px-1.5 py-2", i === 3 && "text-amber-700")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, j) => (
            <tr key={j} className="border-t">
              <td className="px-2 py-2 text-left font-sans text-[12.5px] font-semibold text-muted-foreground">{r.label}</td>
              {r.cells.map((c, i) => (
                <td key={i} className={cn("px-1.5 py-2", r.cls, i === 3 && (j === 1 || j === 3) && "bg-amber-100/80 font-bold")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PartInfini() {
  return (
    <>

      {/* ============================================================ */}
      {/* § 5 — Horizon infini : la boîte à outils                      */}
      {/* ============================================================ */}
      <Section id="sec-infini" kicker="§ 5" title="Horizon infini : la boîte à outils">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Si la fin du jeu tue la coopération… supprimons la fin ! Le dilemme du prisonnier est
          maintenant répété un nombre <strong>infini</strong> de périodes : 0, 1, …,{" "}
          <M tex="t-1" />, <M tex="t" />, <M tex="t+1" />, … (slide 10). Avant d'y chercher des
          équilibres, il nous faut deux outils mathématiques. Rassure-toi : il n'y en a que deux, et
          le second tient en une formule.
        </p>
        <p>
          Chaque période se joue comme avant : les deux fritkots choisissent leur prix en même
          temps, puis chacun voit ce que l'autre a fait. Et comme à deux périodes,{" "}
          <strong>
            en période <M tex="t" />, les joueurs peuvent baser leurs actions sur tout ce qui s'est
            passé avant la période <M tex="t" />
          </strong>{" "}
          (slide 10). C'est ce qui permettra de récompenser ou de punir l'adversaire.
        </p>

        <H4>Outil n°1 — le payoff escompté d'une infinité de périodes</H4>
        <p>
          En période 0, un joueur évalue le jeu entier comme au § 3 (où{" "}
          <M tex="\Pi = \pi_0 + \delta\,\pi_1" />, slide 5), mais la somme ne s'arrête plus :
        </p>
        <FormulaBox
          tex="\Pi \;=\; \pi_0 + \delta\,\pi_1 + \delta^2\,\pi_2 + \dots \;=\; \sum_{t=0}^{\infty} \delta^t\,\pi_t"
          label="Payoff escompté à horizon infini (slide 10)"
          caption={
            <>
              <M tex="\pi_t" /> est le payoff de la période <M tex="t" />. Le facteur d'escompte{" "}
              <M tex="\delta" /> (entre 0 et 1) marque la préférence pour un payoff aujourd'hui
              plutôt que demain (slide 5) : le payoff de la période <M tex="t" /> est multiplié par{" "}
              <M tex="\delta^t" />. Avec <M tex="\delta = 0{,}5" />, les périodes 0, 1, 2, 3 pèsent
              1 ; 0,5 ; 0,25 ; 0,125, et la période 10 ne pèse plus qu'environ 0,001.
            </>
          }
        />

        <H4>Outil n°2 — sommer une infinité de termes (sans y passer l'éternité)</H4>
        <p>
          Question naturelle : si un joueur reçoit{" "}
          <strong>
            le même payoff <M tex="a" /> à chaque période
          </strong>
          , combien vaut le total ? Le slide 10 l'appelle la{" "}
          <strong>
            valeur présente d'une séquence infinie de payoffs de période <M tex="a, a, a, \dots" />
          </strong>{" "}
          : ce que vaut, vu de la période 0, toute cette suite de payoffs.
        </p>
        <p>
          Additionner une infinité de nombres semble impossible. Commence par un exemple : avec{" "}
          <M tex="a = 2" /> et <M tex="\delta = 0{,}5" />, chaque terme vaut la moitié du précédent.
        </p>
        <MB tex="2 + 1 + 0{,}5 + 0{,}25 + 0{,}125 + \dots" />
        <p>
          Les sommes successives valent 2 ; 3 ; 3,5 ; 3,75 ; 3,875 ; … Chaque nouveau terme comble la
          moitié de ce qui manque pour atteindre 4. On s'approche donc de 4 sans jamais le dépasser :
          le total vaut exactement 4. Vois-le par toi-même :
        </p>

        <HalvingBar />

        <p>
          C'est général : comme chaque terme vaut <M tex="\delta" /> fois le précédent, avec{" "}
          <M tex="\delta < 1" />, la somme converge vers une valeur finie :
        </p>
        <FormulaBox
          tex="\sum_{t=0}^{\infty} \delta^t\,a \;=\; a + \delta a + \delta^2 a + \dots \;=\; \frac{a}{1-\delta}"
          label="Valeur présente d'une séquence infinie de payoffs constants (slide 10)"
          caption={
            <>
              Valable pour <M tex="0 \le \delta < 1" /> (à <M tex="\delta = 1" />, la somme est
              infinie). Contrôle sur l'exemple : <M tex="2/(1-0{,}5) = 2/0{,}5 = 4" /> ✓.
            </>
          }
        />

        <Callout variant="intuition" title="💡 D'où sort cette formule ? (facultatif : pour comprendre)">
          <p>
            Le slide 10 la donne comme « un résultat mathématique utile », sans preuve : tu peux
            l'utiliser telle quelle. Si tu veux voir d'où elle vient, voici l'astuce en 3 lignes.
          </p>
          <Steps
            items={[
              <>
                Appelle <M tex="S" /> la somme : <M tex="S = a + \delta a + \delta^2 a + \dots" />
              </>,
              <>
                Multiplie tout par <M tex="\delta" /> :{" "}
                <M tex="\delta S = \delta a + \delta^2 a + \dots" />. C'est exactement <M tex="S" />{" "}
                privé de son premier terme <M tex="a" /> : décaler la somme d'une période revient à
                la multiplier par <M tex="\delta" />.
              </>,
              <>
                Soustrais : <M tex="S - \delta S = a" />, donc <M tex="S(1-\delta) = a" />, donc{" "}
                <strong>
                  <M tex="S = a/(1-\delta)" />
                </strong>{" "}
                (on peut diviser par <M tex="1-\delta" />, qui n'est pas nul car{" "}
                <M tex="\delta < 1" />
                ).
              </>,
            ]}
          />
          <p>
            Cette formule resservira au § 7, avec la même idée : décaler une somme d'une période
            revient à la multiplier par <M tex="\delta" />.
          </p>
        </Callout>

        <p>
          À toi de jouer : choisis <M tex="a" /> et <M tex="\delta" />, et regarde la somme des
          premières périodes se rapprocher de <M tex="a/(1-\delta)" />.
        </p>

        <GeometricSeriesExplorer />

        <Quiz
          scope="b3"
          id="q4"
          question={
            <>
              Un fritkot (<M tex="\delta = 0{,}8" />) reçoit 2 à chaque période pour toujours, à
              partir de la période 0 (guerre des prix). Valeur totale ?
            </>
          }
          options={[
            {
              text: (
                <>
                  8, car <M tex="0{,}8 \times 2/(1-0{,}8)" />.
                </>
              ),
              explain: (
                <>
                  Tu as oublié la période 0, qui n'est pas escomptée (son poids vaut{" "}
                  <M tex="\delta^0 = 1" />
                  ). <M tex="\delta \cdot 2/(1-\delta)" /> est la valeur d'une suite de 2 qui
                  commence en période 1 : c'est le terme <M tex="\delta\,\frac{2}{1-\delta}" /> du
                  § 7.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="2/(1-0{,}8) = 10" />.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : la formule <M tex="a/(1-\delta)" /> avec <M tex="a = 2" /> donne 2/0,2 = 10.
                </>
              ),
            },
            {
              text: <>2,5, car 2/0,8.</>,
              explain: (
                <>
                  Le dénominateur est <M tex="1-\delta" />, pas <M tex="\delta" /> : 2/(1 − 0,8) =
                  2/0,2 = 10.
                </>
              ),
            },
            {
              text: <>L'infini : on additionne une infinité de 2.</>,
              explain: (
                <>
                  Non : chaque terme vaut <M tex="\delta" /> fois le précédent, avec{" "}
                  <M tex="\delta < 1" />, donc la somme converge vers une valeur finie. C'est tout
                  l'intérêt de la formule <M tex="a/(1-\delta)" />.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 5)">
          <UL>
            <li>
              La formule du payoff escompté :{" "}
              <strong>
                <M tex="\Pi = \sum \delta^t \pi_t" />
              </strong>{" "}
              (slide 10).
            </li>
            <li>
              La formule{" "}
              <strong>
                <M tex="\sum \delta^t a = a/(1-\delta)" />
              </strong>
              , pour <M tex="0 \le \delta < 1" /> (résultat donné au slide 10), et savoir
              l'appliquer : 4 pour toujours vaut <M tex="4/(1-\delta)" />, 2 pour toujours vaut{" "}
              <M tex="2/(1-\delta)" />. Sa preuve « décaler, soustraire » est facultative : elle
              sert à comprendre.
            </li>
            <li>
              Une suite qui commence en période 1 au lieu de 0 est multipliée par{" "}
              <M tex="\delta" /> : <M tex="2\delta + 2\delta^2 + \dots = \delta\,\frac{2}{1-\delta}" />{" "}
              (on s'en sert au § 7).
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 6 — « Toujours trahir » reste un équilibre                  */}
      {/* ============================================================ */}
      <Section id="sec-tt" kicker="§ 6" title="« Toujours trahir » reste un équilibre">
        <p className="text-[1.1rem] italic text-muted-foreground">
          L'horizon infini ouvre des portes… mais commençons par une douche froide : le mauvais
          équilibre de B1 ne disparaît pas pour autant.
        </p>

        <p>Le slide 11 met deux stratégies face à face. La première est nouvelle :</p>
        <Callout
          variant="definition"
          title={
            <>
              📖 Définition — stratégie « toujours trahir » <M tex="s^{TT}" /> (slide 11)
            </>
          }
        >
          <p>
            Le joueur trahit dans <strong>toutes</strong> les périodes, quoi que son adversaire ait
            joué dans le passé. C'est une stratégie « sourde » : elle ignore l'histoire du jeu.
          </p>
        </Callout>
        <p>
          La seconde est le grim <M tex="s^{G}" /> du § 3 : coopérer en période 0 ; en période{" "}
          <M tex="t" />, coopérer si l'adversaire a toujours coopéré dans le passé, sinon trahir. Le
          slide 11 annonce alors <strong>deux choses à montrer</strong> :
        </p>
        <Steps
          labels={["①", "②"]}
          items={[
            <>
              le profil (<M tex="s_1^{TT}" />, <M tex="s_2^{TT}" />) est un ENPS : c'est l'objet de
              ce § 6 ;
            </>,
            <>
              le profil (<M tex="s_1^{G}" />, <M tex="s_2^{G}" />) est un ENPS : c'est le § 7, et il
              faudra une condition sur <M tex="\delta" /> (slide 14).
            </>,
          ]}
        />

        <Callout variant="methode" title="La méthode du cours (slide 11)">
          <p>
            Pour montrer qu'un profil de stratégies est un ENPS, on montre que les stratégies sont
            des <strong>meilleures réponses mutuelles</strong>. Concrètement : on fixe la stratégie
            d'un joueur et on vérifie qu'aucune autre stratégie ne rapporte strictement plus à
            l'autre joueur. Puis on fait pareil dans l'autre sens. C'est la méthode de toutes les
            démonstrations de B3.
          </p>
          <p className="mt-2">
            Rappel B2.1 : un ENPS est un EN dont les stratégies forment un EN dans tous les
            sous-jeux. <TheoryRef chapter="bseq" section="s3" />
          </p>
        </Callout>

        <H4>La preuve en deux temps (slide 12)</H4>
        <p>
          Fixons la stratégie du <span className="font-semibold text-rose-700">joueur 1</span> : il
          trahit toujours. Que peut faire le{" "}
          <span className="font-semibold text-sky-700">joueur 2</span> ?
        </p>
        <p>
          <strong>Temps 1 — s'il trahit toujours aussi.</strong> À chaque période, les deux
          trahissent et 2 touche 2. C'est la formule du § 5 avec <M tex="a = 2" /> :
        </p>
        <MB tex="\Pi_2(s_1^{TT}, s_2^{TT}) \;=\; 2 + 2\delta + 2\delta^2 + \dots \;=\; \frac{2}{1-\delta}" />
        <p>
          <strong>
            Temps 2 — s'il joue n'importe quelle autre stratégie <M tex="s_2" />.
          </strong>{" "}
          Face à un adversaire qui trahit à chaque période, le joueur 2 ne peut gagner que{" "}
          <strong>2</strong> (s'il trahit aussi) ou <strong>0</strong> (s'il coopère) : c'est la
          ligne « Trahir » du joueur 1 dans la matrice du § 1. Donc <M tex="\pi_t \le 2" /> pour tout{" "}
          <M tex="t" />, et on peut comparer les deux sommes terme à terme :
        </p>
        <Derivation
          rows={[
            {
              tex: "\\Pi_2(s_1^{TT}, s_2) = \\pi_0 + \\delta\\,\\pi_1 + \\delta^2\\pi_2 + \\dots",
              why: <>la définition du payoff escompté (slide 10)</>,
            },
            {
              tex: "\\le 2 + \\delta\\cdot 2 + \\delta^2\\cdot 2 + \\dots",
              why: (
                <>
                  chaque <M tex="\pi_t" /> vaut au plus 2, et <M tex="\delta^t \ge 0" /> : chaque
                  terme vaut au plus <M tex="\delta^t \cdot 2" />
                </>
              ),
            },
            {
              tex: "= \\dfrac{2}{1-\\delta}",
              why: <>la formule du § 5 avec <M tex="a = 2" /></>,
            },
          ]}
        />
        <p>
          Exemple : coopérer en période 0 puis trahir toujours rapporte{" "}
          <M tex="0 + 2\delta + 2\delta^2 + \dots = \delta\,\frac{2}{1-\delta}" />, moins que{" "}
          <M tex="\frac{2}{1-\delta}" />. Chaque période où 2 coopère lui coûte 2 (escompté), sans
          rien lui rapporter ensuite : <M tex="s_1^{TT}" /> ne récompense jamais la coopération.
        </p>
        <p>
          <strong>Conclusion.</strong> Aucune stratégie ne rapporte plus que{" "}
          <M tex="2/(1-\delta)" /> au joueur 2 : <M tex="s_2^{TT}" /> est une meilleure réponse à{" "}
          <M tex="s_1^{TT}" />. Le jeu est symétrique, donc{" "}
          <M tex="s_1^{TT}" /> est une meilleure réponse à <M tex="s_2^{TT}" />. Ce sont des
          meilleures réponses mutuelles :{" "}
          <strong>
            (<M tex="s_1^{TT}" />, <M tex="s_2^{TT}" />) est un ENPS
          </strong>
          .
        </p>
        <p>
          « Sans surprise, il n'est pas garanti que deux joueurs rationnels coopèrent lorsque le
          dilemme du prisonnier est répété un nombre infini de fois » (slide 12). La vraie question
          devient : la coopération est-elle au moins <em>possible</em> ? Réponse au § 7.
        </p>

        <Callout variant="attention" title="⚠️ Piège d'examen classique">
          <p>
            « Horizon infini ⇒ les joueurs coopèrent » est <strong>FAUX</strong>. L'horizon infini
            rend la coopération <em>possible</em> (§ 7), pas <em>certaine</em> : « toujours trahir
            contre toujours trahir » reste un ENPS parfaitement valable. Quand{" "}
            <M tex="\delta \ge 1/2" />, ce jeu a donc <strong>au moins deux ENPS</strong> : (
            <M tex="s_1^{TT}" />, <M tex="s_2^{TT}" />) et (<M tex="s_1^{G}" />,{" "}
            <M tex="s_2^{G}" />) (slides 11-14).
          </p>
        </Callout>

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 6)">
          <UL>
            <li>
              La méthode du cours (slide 11) : pour montrer qu'un profil est un ENPS, on montre que
              les stratégies sont des <strong>meilleures réponses mutuelles</strong> (on teste
              toutes les déviations d'un joueur, l'autre étant fixé).
            </li>
            <li>
              Le calcul <M tex="\Pi_2 = 2/(1-\delta)" /> et l'argument de majoration «{" "}
              <M tex="\pi_t \le 2" /> pour tout <M tex="t" /> » (slide 12).
            </li>
            <li>
              La nuance <strong>possible ≠ garanti</strong>.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 7 — Grim contre grim : δ ≥ 1/2                              */}
      {/* ============================================================ */}
      <Section
        id="sec-grim"
        kicker="§ 7"
        title={
          <>
            Grim contre grim : la condition{" "}
            <span className="whitespace-nowrap">
              <M tex="\delta \ge 1/2" />
            </span>
          </>
        }
      >
        <p className="text-[1.1rem] italic text-muted-foreground">
          Voici LE résultat du chapitre, la démonstration à savoir refaire seul. « Voyons maintenant
          s'il est possible que deux joueurs rationnels coopèrent » (slide 13). On reprend la
          stratégie grim du § 3, mais cette fois la menace ne s'éteint jamais : il y a toujours un
          lendemain pour punir.
        </p>

        <H4>Étape 1 — le payoff si tout le monde coopère (slide 13)</H4>
        <p>
          Si le <span className="font-semibold text-rose-700">joueur 1</span> joue{" "}
          <M tex="s_1^{G}" /> et le <span className="font-semibold text-sky-700">joueur 2</span>{" "}
          joue <M tex="s_2^{G}" />, personne ne trahit jamais : les deux coopèrent à chaque période
          et touchent 4 pour toujours. Formule du § 5 avec <M tex="a = 4" /> :
        </p>
        <MB tex="\Pi_2(s_1^{G}, s_2^{G}) \;=\; 4 + 4\delta + 4\delta^2 + \dots \;=\; \frac{4}{1-\delta}" />

        <H4>Étape 2 — que rapporte la meilleure déviation ? (slides 13-14)</H4>
        <p>
          Le joueur 2 peut-il gagner plus avec une autre stratégie <M tex="s_2" /> ? Pour que{" "}
          <M tex="s_2" /> soit plus profitable que <M tex="s_2^{G}" />, il faut qu'elle induise
          d'autres actions (slide 13). Une stratégie qui ne trahit jamais face à grim produit
          exactement le même déroulement (C à chaque période), donc le même payoff{" "}
          <M tex="4/(1-\delta)" />. Il faut donc que 2 trahisse, pour la première fois, à une
          période <M tex="t" />.
        </p>
        <p>
          Mais alors la machine infernale s'enclenche : puisque 1 joue grim,{" "}
          <strong>1 trahira à toutes les périodes suivant <M tex="t" /></strong>. Face à ça, le
          mieux que 2 puisse faire ensuite est de trahir aussi pour toujours. Voici le film de la
          déviation (le tableau du slide 13) :
        </p>

        <FilmSlide13 />

        <p>
          Lis la dernière ligne : la trahison offre à 2 un <strong>festin unique de 6</strong> (il
          vend moins cher pendant que 1 reste cher)… suivi d'une <strong>éternité à 2</strong>{" "}
          (guerre des prix). Le slide 14 suppose, « pour faire simple », que cette première
          trahison a lieu en <M tex="t = 0" /> (on verra juste après l'étape 3 pourquoi ce choix ne
          fait rien perdre). Le payoff de la déviation se calcule alors en trois lignes :
        </p>
        <Derivation
          rows={[
            {
              tex: "\\Pi_2(s_1^{G}, s_2) = 6 + 2\\delta + 2\\delta^2 + \\dots",
              why: <>6 en période 0, puis 2 à chaque période (le film ci-dessus)</>,
            },
            {
              tex: "= 6 + \\delta\\,(2 + 2\\delta + 2\\delta^2 + \\dots)",
              why: (
                <>
                  on met <M tex="\delta" /> en évidence :{" "}
                  <M tex="2\delta + 2\delta^2 + \dots = \delta\,(2 + 2\delta + \dots)" />
                </>
              ),
            },
            {
              tex: "= 6 + \\delta\\,\\dfrac{2}{1-\\delta}",
              why: (
                <>
                  la parenthèse est la somme infinie de 2 : formule <M tex="a/(1-\delta)" /> du § 5,
                  exactement comme au slide 14
                </>
              ),
            },
          ]}
        />

        <H4>Étape 3 — coopérer bat dévier si… (slide 14)</H4>
        <p>
          <M tex="s_2^{G}" /> est une meilleure réponse à <M tex="s_1^{G}" /> si coopérer rapporte
          au moins autant que dévier : <M tex="\Pi_2(s_1^{G}, s_2^{G}) \ge \Pi_2(s_1^{G}, s_2)" />.
          On résout cette inégalité ligne par ligne :
        </p>
        <Derivation
          label="La dérivation à savoir refaire"
          rows={[
            {
              tex: "\\dfrac{4}{1-\\delta} \\ge 6 + \\delta\\,\\dfrac{2}{1-\\delta}",
              why: <>coopérer (étape 1) ≥ dévier (étape 2)</>,
            },
            {
              tex: "4 \\ge 6(1-\\delta) + 2\\delta",
              why: (
                <>
                  × <M tex="(1-\delta)" />, positif car <M tex="\delta < 1" /> : le sens ne change
                  pas
                </>
              ),
            },
            {
              tex: "4 \\ge 6 - 4\\delta",
              why: (
                <>
                  on développe : <M tex="6 - 6\delta + 2\delta" />
                </>
              ),
            },
            {
              tex: "4\\delta \\ge 2",
              why: (
                <>
                  on ajoute <M tex="4\delta" /> et on retire 4 des deux côtés
                </>
              ),
            },
            {
              tex: "\\delta \\ge \\tfrac{1}{2}",
              why: <>on divise par 4 (positif)</>,
            },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Contrôle : à <M tex="\delta = 1/2" />, <M tex="4/(1-\delta) = 8" /> et{" "}
          <M tex="6 + 2\delta/(1-\delta) = 8" /> : les deux options se valent pile au seuil.
        </p>

        <Callout variant="retiens" title="🏛️ Résultat central du chapitre (slide 14)">
          <p>
            Si <M tex="\delta \ge 1/2" />, <M tex="s_2^{G}" /> est une meilleure réponse à{" "}
            <M tex="s_1^{G}" />, et par symétrie <M tex="s_1^{G}" /> en est une à{" "}
            <M tex="s_2^{G}" /> : (<M tex="s_1^{G}" />, <M tex="s_2^{G}" />) est un ENPS du
            dilemme du prisonnier répété à l'infini. « On constate qu'il est possible que deux
            joueurs rationnels coopèrent si <M tex="\delta \ge 1/2" />, c'est-à-dire s'ils ne sont
            pas trop impatients. » Possible, mais pas certain : (<M tex="s_1^{TT}" />,{" "}
            <M tex="s_2^{TT}" />) reste aussi un ENPS (§ 6).
          </p>
          <p className="mt-2">
            Si <M tex="\delta < 1/2" />, « les joueurs ne se soucient pas assez des payoffs futurs,
            et la menace de les voir diminuer n'inflige pas un coût suffisamment élevé pour les
            dissuader de trahir ».
          </p>
        </Callout>

        <H4>Pourquoi « supposons t = 0 » ne fait rien perdre</H4>
        <p>
          Compare les deux films, coopérer toujours et trahir pour la première fois en période{" "}
          <M tex="t" /> :
        </p>
        <UL>
          <li>
            <strong>Avant <M tex="t" /></strong>, les deux déroulements sont identiques (4 à chaque
            période) : ces périodes ne changent rien à la comparaison.
          </li>
          <li>
            <strong>À partir de <M tex="t" /></strong>, coopérer donne 4, 4, 4, … et dévier donne 6,
            2, 2, … : ce sont les suites d'une trahison en <M tex="t = 0" />, commencées{" "}
            <M tex="t" /> périodes plus tard. Commencer <M tex="t" /> périodes plus tard revient à
            tout multiplier par <M tex="\delta^t" /> (l'idée du § 5).
          </li>
        </UL>
        <p>
          La comparaison est donc exactement celle d'une trahison en <M tex="t = 0" />, multipliée
          par <M tex="\delta^t" /> :
        </p>
        <MB tex="\text{coopérer} - \text{dévier} \;=\; \delta^t \cdot \frac{4\delta - 2}{1-\delta}" />
        <p>
          (pour <M tex="t = 0" />, c'est la différence <M tex="\frac{4}{1-\delta} - 6 - \delta\frac{2}{1-\delta}" />{" "}
          de l'étape 3, qui se simplifie en <M tex="\frac{4\delta-2}{1-\delta}" />). Comme{" "}
          <M tex="\delta^t" /> est positif, le signe ne dépend pas de <M tex="t" /> : si trahir en{" "}
          <M tex="t = 0" /> ne paie pas, trahir plus tard ne paie pas non plus. D'où « supposons{" "}
          <M tex="t = 0" /> » (slide 14). Par exemple, à <M tex="\delta = 0{,}6" /> l'écart vaut
          +1 si <M tex="t = 0" />, +0,6 si <M tex="t = 1" /> et +0,216 si <M tex="t = 3" /> ; à{" "}
          <M tex="\delta = 0{,}3" />, il vaut −1,143 ; −0,343 et −0,031.
        </p>

        <DeviationTiming />

        <p>Et voici le duel des deux payoffs quand <M tex="\delta" /> varie :</p>

        <ThresholdDuel />

        <Callout variant="examen" title="⚠️ Deux réflexes pour l'examen">
          <UL>
            <li>
              <strong>D'où vient chaque morceau :</strong> <M tex="4/(1-\delta)" /> = coopération
              éternelle ; <M tex="6" /> = tentation immédiate ; <M tex="2\delta/(1-\delta)" /> =
              punition éternelle <em>qui commence demain</em> (d'où le <M tex="\delta" /> devant !).
              Oublier ce <M tex="\delta" /> est LA faute classique.
            </li>
            <li>
              <strong>Pourquoi « dévier une seule fois puis revenir » n'est pas envisagé :</strong>{" "}
              face à un grim, revenir à C après avoir trahi rapporte 0 (tu coopères, il te trahit).
              Une fois la gâchette pressée, « le mieux que 2 pourra faire ensuite est de trahir pour
              toutes les périodes suivant <M tex="t" /> » (slide 13) : la déviation étudiée est donc
              « 6 puis 2 pour toujours ».
            </li>
          </UL>
        </Callout>

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 7)">
          <UL>
            <li>
              Refaire la démonstration complète en 3 étapes :{" "}
              <strong>
                <M tex="4/(1-\delta)" />
              </strong>{" "}
              contre{" "}
              <strong>
                <M tex="6 + \delta\,2/(1-\delta)" />
              </strong>
              , puis résoudre l'inégalité ligne par ligne jusqu'à{" "}
              <strong>
                <M tex="\delta \ge 1/2" />
              </strong>
              .
            </li>
            <li>
              Savoir dire pourquoi la déviation doit contenir une trahison (sinon, même déroulement
              et même payoff) et pourquoi, après la trahison, trahir pour toujours est la meilleure
              suite.
            </li>
            <li>
              Savoir dire pourquoi on peut supposer la déviation en <M tex="t = 0" /> : avant{" "}
              <M tex="t" />, rien ne change ; à partir de <M tex="t" />, tout est multiplié par{" "}
              <M tex="\delta^t > 0" />, ce qui ne change pas le signe de l'écart.
            </li>
            <li>Interpréter chaque terme : tentation (6), punition (2 pour toujours), patience (δ).</li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 8 — Interpréter & généraliser                               */}
      {/* ============================================================ */}
      <Section id="sec-interp" kicker="§ 8" title="Interpréter & généraliser">
        <p className="text-[1.1rem] italic text-muted-foreground">
          Le calcul est fait. Prenons trois pas de recul : que signifie vraiment «{" "}
          <M tex="\delta \ge 1/2" /> » ? Personne ne vit éternellement, alors à quoi sert un
          horizon infini ? Et le seuil 1/2, d'où vient-il ?
        </p>

        <H4>1. « Ne pas être trop impatient »</H4>
        <p>
          La coopération tient si la <strong>peur du futur</strong> pèse plus lourd que la{" "}
          <strong>gourmandise du présent</strong>. Face à grim, trahir, c'est échanger +2
          aujourd'hui (6 au lieu de 4) contre −2 à chaque période future (2 au lieu de 4). Vu
          d'aujourd'hui, ces pertes futures valent :
        </p>
        <MB tex="2\delta + 2\delta^2 + 2\delta^3 + \dots \;=\; \delta\,\frac{2}{1-\delta}" />
        <p>
          Coopérer vaut mieux si cette perte est au moins égale au gain immédiat :{" "}
          <M tex="\delta\,\frac{2}{1-\delta} \ge 2" />, ce qui donne encore{" "}
          <M tex="\delta \ge 1/2" /> (c'est l'inégalité du slide 14, réarrangée). À{" "}
          <M tex="\delta = 0{,}9" />, la perte future vaut 18, bien plus que le gain de 2 : un
          joueur patient a intérêt à coopérer. À <M tex="\delta = 0{,}3" />, elle ne vaut
          qu'environ 0,86 : un joueur impatient a intérêt à trahir.
        </p>

        <H4>2. « Mais personne ne vit un nombre infini de périodes ! »</H4>
        <p>
          Objection légitime, et le cours y répond : l'infini n'est{" "}
          <strong>pas nécessaire</strong>. « La coopération est également possible si, à chaque
          période, il y a une <strong>probabilité non-nulle que le jeu soit répété</strong> à la
          période suivante » (slide 15). Ce qui compte, ce n'est pas que le jeu soit réellement
          éternel, c'est que{" "}
          <strong>les joueurs ne puissent jamais dire « c'est la dernière fois »</strong> : c'est
          cette certitude-là qui déclenche l'effet domino du § 4.
        </p>
        <Callout variant="intuition" title="💡 Pourquoi ça marche (complément hors slides)">
          <p>
            Si le jeu continue avec une probabilité <M tex="p" /> à chaque période, le payoff de la
            période <M tex="t" /> n'est reçu qu'avec la probabilité <M tex="p^t" /> (il faut que le
            jeu ait continué <M tex="t" /> fois de suite). Il compte donc avec le poids{" "}
            <M tex="\delta^t \cdot p^t = (\delta p)^t" /> (calcul d'espérance, comme en A3). Tout se
            passe comme si le facteur d'escompte valait <M tex="\delta \cdot p" />.
          </p>
          <p className="mt-2">
            Avec grim dans le fritkot, la condition devient <M tex="\delta \cdot p \ge 1/2" /> :
            par exemple <M tex="\delta = 0{,}9" /> et <M tex="p = 0{,}6" /> donnent 0,54 ✓, mais{" "}
            <M tex="p = 0{,}5" /> donne 0,45 ✗. La probabilité de continuer doit donc être assez
            grande, comme <M tex="\delta" />.
          </p>
        </Callout>

        <H4>3. Pour aller plus loin (hors slides) : d'où vient le 1/2 ?</H4>
        <p>
          <em>
            Ce prolongement n'est pas dans les slides. À l'examen, refais le calcul du slide 14
            avec les payoffs de l'énoncé.
          </em>
        </p>
        <p>
          Le 1/2 n'a rien de magique : il vient des nombres 4, 6 et 2. Notons{" "}
          <M tex="\pi_{\text{coop}}" /> le payoff quand les deux coopèrent (4),{" "}
          <M tex="\pi_{\text{tent}}" /> celui de la tentation, quand on trahit un adversaire qui
          coopère (6), et <M tex="\pi_{\text{pun}}" /> celui de la punition, quand les deux
          trahissent (2), avec <M tex="\pi_{\text{tent}} > \pi_{\text{coop}} > \pi_{\text{pun}}" />.
          Le calcul du § 7 devient :
        </p>
        <Derivation
          rows={[
            {
              tex: "\\dfrac{\\pi_{\\text{coop}}}{1-\\delta} \\ge \\pi_{\\text{tent}} + \\delta\\,\\dfrac{\\pi_{\\text{pun}}}{1-\\delta}",
              why: <>coopérer ≥ dévier, comme à l'étape 3</>,
            },
            {
              tex: "\\pi_{\\text{coop}} \\ge \\pi_{\\text{tent}}(1-\\delta) + \\delta\\,\\pi_{\\text{pun}}",
              why: (
                <>
                  × <M tex="(1-\delta)" />, positif
                </>
              ),
            },
            {
              tex: "\\delta\\,(\\pi_{\\text{tent}} - \\pi_{\\text{pun}}) \\ge \\pi_{\\text{tent}} - \\pi_{\\text{coop}}",
              why: (
                <>
                  on développe et on regroupe les termes en <M tex="\delta" />
                </>
              ),
            },
            {
              tex: "\\delta \\ge \\dfrac{\\pi_{\\text{tent}} - \\pi_{\\text{coop}}}{\\pi_{\\text{tent}} - \\pi_{\\text{pun}}}",
              why: (
                <>
                  ÷ <M tex="(\pi_{\text{tent}} - \pi_{\text{pun}})" />, positif
                </>
              ),
            },
          ]}
        />
        <FormulaBox
          tex="\delta \;\ge\; \frac{\pi_{\text{tent}} - \pi_{\text{coop}}}{\pi_{\text{tent}} - \pi_{\text{pun}}}"
          label="Le seuil général de coopération (hors slides)"
          caption={
            <>
              En mots : <strong>gain immédiat de la trahison</strong> / (<strong>gain immédiat</strong>{" "}
              + <strong>coût par période de la punition</strong>). Avec les nombres du cours : (6 −
              4)/(6 − 2) = 1/2 ✓. Le dénominateur se décompose en{" "}
              <M tex="\pi_{\text{tent}} - \pi_{\text{pun}} = (\pi_{\text{tent}} - \pi_{\text{coop}}) + (\pi_{\text{coop}} - \pi_{\text{pun}})" />{" "}
              : le gain immédiat (6 − 4 = 2) plus le coût par période de la punition (4 − 2 =
              2).
            </>
          }
        />

        <GeneralThreshold />

        <Callout variant="intuition" title="💡 Conclusion officielle du chapitre (slide 15, à savoir reformuler)">
          <p>
            « Dans un dilemme du prisonnier répété un nombre infini de périodes, il est{" "}
            <strong>possible (mais pas certain)</strong> que deux joueurs rationnels coopèrent, et
            tirent donc les bénéfices de la coopération. »
          </p>
          <p className="mt-2">
            « La coopération peut émerger entre des joueurs rationnels même si les incitants
            individuels les poussent chaque période à vouloir trahir,{" "}
            <strong>
              pourvu que les joueurs ne sachent pas d'avance quelle sera la dernière période
            </strong>
            . Cette coopération est possible si les joueurs peuvent menacer leurs adversaires de
            leur infliger en cas de trahison une punition dont le coût est suffisamment élevé. Ce
            coût dépend des <strong>payoffs du jeu simultané</strong> et du{" "}
            <strong>facteur d'escompte du joueur puni</strong>. »
          </p>
          <p className="mt-2">
            Dans le fritkot : les payoffs fixent la perte par période de punition (4 − 2 = 2) ; le
            facteur d'escompte du puni fixe le poids de ces pertes, soit{" "}
            <M tex="\delta\,\frac{2}{1-\delta}" /> vu d'aujourd'hui (point 1).
          </p>
        </Callout>

        <Quiz
          scope="b3"
          id="q5"
          question={<>Dans la vraie vie, quel cartel a le plus de chances de tenir ?</>}
          options={[
            {
              text: (
                <>
                  Deux entreprises au bord de la faillite, qui ont un besoin urgent de
                  liquidités.
                </>
              ),
              explain: (
                <>
                  C'est l'inverse : une entreprise au bord de la faillite est très impatiente, et
                  demain elle n'existera peut-être plus (son <M tex="\delta \cdot p" /> est faible,
                  voir l'encadré hors slides du point 2). Elle a intérêt à casser les prix
                  aujourd'hui.
                </>
              ),
            },
            {
              text: <>Deux entreprises solidement installées, sûres d'être encore là dans 20 ans.</>,
              correct: true,
              explain: (
                <>
                  Oui : des acteurs installés, sûrs de se recroiser (forte probabilité de
                  continuation) et pas pressés (<M tex="\delta" /> élevé), réunissent les conditions
                  qui rendent la coopération possible (pas certaine : « toujours trahir » reste un
                  équilibre). C'est pour ça que les autorités de la concurrence surveillent les
                  marchés stables à peu d'acteurs.
                </>
              ),
            },
            {
              text: <>Deux entreprises sur un marché qui ferme définitivement dans 3 mois.</>,
              explain: (
                <>
                  Un marché qui disparaît bientôt = une dernière période prévisible = effet domino
                  du § 4 : la coopération s'effondre.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 8)">
          <UL>
            <li>
              Interpréter{" "}
              <strong>
                <M tex="\delta \ge 1/2" />
              </strong>{" "}
              en français : patience suffisante = coopération <em>possible</em> (mais pas
              certaine).
            </li>
            <li>
              L'argument de la <strong>probabilité de continuation</strong> (slide 15) : l'infini
              n'est pas nécessaire ; la coopération est également possible s'il y a, à chaque
              période, une probabilité non-nulle que le jeu continue. Ce qui la tue, c'est de
              connaître d'avance la dernière période.
            </li>
            <li>
              Les deux déterminants du coût de la punition :{" "}
              <strong>payoffs du jeu simultané</strong> +{" "}
              <strong>facteur d'escompte du joueur puni</strong>.
            </li>
          </UL>
        </Callout>
      </Section>
    </>
  );
}
