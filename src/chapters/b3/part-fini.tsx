/*
 * Chapitre B3 — PartFini : § 0 à § 4 (deck S8, slides 1-9).
 * § 0 repères · § 1 le dilemme du fritkot (slides 2-3) · § 2 le cadre (slide 4) ·
 * § 3 deux périodes : backward induction et stratégie grim (slides 5-8) ·
 * § 4 le théorème du slide 8 et son intuition (slides 8-9).
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB, FormulaBox } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { PayoffMatrix } from "@/components/course/PayoffMatrix";
import { TheoryRef } from "@/components/course/TheoryRef";
import { PollTwoDays, TwoPeriodExplorer } from "./interactives";
import { H4, Steps, CardGrid, TwoPeriodTimeline } from "./ui";

/* ------------------------------------------------------------------ */
/* Petits helpers locaux                                               */
/* ------------------------------------------------------------------ */

/** Paragraphe d'ouverture d'une section. */
function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Sous-titre de second niveau à l'intérieur d'une section. */
function H5({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-6 text-[16.5px] font-bold tracking-tight">{children}</h4>;
}

/** Liste à puces (la prose du cours ne stylise pas les listes nues). */
function UL({ children }: { children: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-muted-foreground">{children}</ul>;
}

/** Les deux joueurs, avec le code couleur des slides : 1 en rouge, 2 en bleu. */
function P1({ children = "1" }: { children?: ReactNode }) {
  return <span className="font-semibold text-rose-700">{children}</span>;
}
function P2({ children = "2" }: { children?: ReactNode }) {
  return <span className="font-semibold text-sky-700">{children}</span>;
}

/** Petit bouton de navigation des figures pas à pas. */
function StepButton({
  onClick,
  disabled,
  primary,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-3.5 py-2 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40",
        primary ? "bg-primary text-primary-foreground hover:opacity-90" : "border bg-background hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Le dilemme du fritkot (slide 2)                                     */
/* ------------------------------------------------------------------ */

type Act = "C" | "T";
const ACTS: Act[] = ["C", "T"];
/** Payoffs du jour : [fritkot 1, fritkot 2], indexés par (action de 1)(action de 2). */
const PD: Record<`${Act}${Act}`, [number, number]> = {
  CC: [4, 4],
  CT: [0, 6],
  TC: [6, 0],
  TT: [2, 2],
};
/** Les quatre histoires possibles de la période 0 : (action de 1, action de 2). */
const HISTS: Array<[Act, Act]> = [
  ["C", "C"],
  ["C", "T"],
  ["T", "C"],
  ["T", "T"],
];

/** « a ; b » avec le payoff de 1 en rouge et celui de 2 en bleu (empilés si `stack`). */
function Pay({ a, b, stack = false }: { a: ReactNode; b: ReactNode; stack?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        stack ? "flex-col leading-tight sm:flex-row sm:gap-1" : "gap-1",
      )}
    >
      <span className="text-rose-700">{a}</span>
      <span className={cn("text-muted-foreground", stack && "hidden sm:inline")}>;</span>
      <span className="text-sky-700">{b}</span>
    </span>
  );
}

/** Matrice 2 × 2 compacte (1 en lignes, 2 en colonnes) ; `hot` surligne la case (T, T). */
function MiniMatrix({
  title,
  cell,
  hot = false,
  big = false,
}: {
  title?: ReactNode;
  cell: (r: Act, c: Act) => ReactNode;
  hot?: boolean;
  big?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-background p-2">
      {title ? (
        <div className="mb-1 text-center text-[12.5px] font-semibold text-muted-foreground">{title}</div>
      ) : null}
      <table className="mx-auto border-collapse">
        <thead>
          <tr>
            <th />
            {ACTS.map((c) => (
              <th key={c} className="px-1 pb-0.5 text-center text-[12.5px] font-bold text-sky-700">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACTS.map((r) => (
            <tr key={r}>
              <th className="pr-1 text-right text-[12.5px] font-bold text-rose-700">{r}</th>
              {ACTS.map((c) => {
                const on = hot && r === "T" && c === "T";
                return (
                  <td key={c} className="p-0.5">
                    <div
                      className={cn(
                        "rounded-md border-2 px-1.5 py-1 text-center tabular-nums transition-colors duration-500",
                        big ? "min-w-[4.5rem] text-[14px]" : "whitespace-nowrap text-[13px]",
                        on
                          ? "border-emerald-500 bg-emerald-50 font-bold dark:bg-emerald-950/40"
                          : "border-transparent bg-muted/50",
                      )}
                    >
                      {cell(r, c)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** « n + 2δ » : un payoff de la période 0 augmenté de la valeur escomptée de la période 1. */
function Plus2d({ n }: { n: number }) {
  return (
    <span className="whitespace-nowrap">
      {n} + 2<i>δ</i>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* § 3 — La backward induction du jeu à deux périodes, en 3 étapes     */
/* ------------------------------------------------------------------ */

const BI_TITLES = [
  "Les derniers sous-jeux : la période 1",
  "Dans chaque sous-jeu, T est dominante",
  "On remonte : le jeu réduit de la période 0",
];

function BackwardTwoPeriods() {
  const [step, setStep] = useState(1);
  return (
    <figure className="my-6 rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Backward induction en 3 étapes
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Choisir l'étape">
          {[1, 2, 3].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setStep(k)}
              aria-pressed={step === k}
              aria-label={`Étape ${k}`}
              className={cn(
                "h-7 w-7 rounded-full text-[13px] font-bold transition-colors",
                step === k
                  ? "bg-primary text-primary-foreground"
                  : step > k
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 font-semibold leading-snug">
        Étape {step} · {BI_TITLES[step - 1]}
      </div>

      <div key={step} className="animate-in fade-in duration-500" aria-live="polite">
        {step < 3 ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {HISTS.map(([a, b]) => (
                <div key={a + b}>
                  <MiniMatrix
                    title={
                      <>
                        après (<P1>{a}</P1>, <P2>{b}</P2>)
                      </>
                    }
                    hot={step === 2}
                    cell={(r, c) => <Pay a={PD[`${r}${c}`][0]} b={PD[`${r}${c}`][1]} />}
                  />
                  {step === 2 ? (
                    <div className="mt-1 text-center text-[12.5px] font-semibold text-emerald-700">
                      EN (T, T) → (2 ; 2)
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed">
              {step === 1 ? (
                <>
                  Après la période 0, quatre histoires sont possibles (action de <P1 />, action de{" "}
                  <P2 />). Chacune ouvre un sous-jeu : le même dilemme, rejoué en période 1. Les
                  payoffs de la période 0 sont déjà encaissés : ils ne changent plus, quoi qu'on joue
                  en période 1.
                </>
              ) : (
                <>
                  Pour <P1 /> : 6 &gt; 4 si <P2 /> coopère, 2 &gt; 0 si <P2 /> trahit. T est
                  dominante, et pour <P2 /> aussi (le jeu est symétrique). Dans les quatre
                  sous-jeux, l'EN est (T, T) et rapporte (2 ; 2) : l'histoire n'y change rien.
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {HISTS.map(([a, b]) => (
                <span
                  key={a + b}
                  className="rounded-full border bg-background px-2.5 py-1 text-[12.5px] tabular-nums"
                >
                  après ({a}, {b}) → (2 ; 2)
                </span>
              ))}
            </div>
            <div className="my-2 text-center text-[13px] text-muted-foreground">
              ↓ chaque case de la période 0 reçoit <i>δ</i> × 2 = 2<i>δ</i> en plus
            </div>
            <div className="mx-auto max-w-xs">
              <MiniMatrix
                title="Période 0 : le jeu réduit"
                big
                hot
                cell={(r, c) => (
                  <Pay
                    stack
                    a={<Plus2d n={PD[`${r}${c}`][0]} />}
                    b={<Plus2d n={PD[`${r}${c}`][1]} />}
                  />
                )}
              />
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed">
              Pour <P1 /> : si <P2 /> coopère, 6 + 2<i>δ</i> &gt; 4 + 2<i>δ</i> ; si <P2 /> trahit,
              2 + 2<i>δ</i> &gt; 0 + 2<i>δ</i>. Le même 2<i>δ</i> des deux côtés ne change aucune
              comparaison : T reste dominante, pour <P2 /> aussi. EN du jeu réduit : (T, T).
            </p>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <StepButton onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          ← Étape précédente
        </StepButton>
        <StepButton primary onClick={() => setStep(step === 3 ? 1 : step + 1)}>
          {step === 3 ? "Recommencer" : "Étape suivante →"}
        </StepButton>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Dans chaque matrice : lignes = action du fritkot <P1 />, colonnes = action du fritkot{" "}
        <P2 /> ; dans chaque case, payoff de <P1 /> ; payoff de <P2 /> (slide 2).
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* § 3 — Les trois options du joueur 2 face au grim de 1 (slide 7)     */
/* ------------------------------------------------------------------ */

type Move = { a1: Act; why?: string; a2: Act; pay: number };
const OPTIONS: Array<{ key: string; name: ReactNode; p0: Move; p1: Move; tex: string }> = [
  {
    key: "grim",
    name: (
      <>
        <M tex="s_2^{G}" /> (grim)
      </>
    ),
    p0: { a1: "C", a2: "C", pay: 4 },
    p1: { a1: "C", a2: "C", pay: 4 },
    tex: "\\Pi_2 = 4 + \\delta \\cdot 4 = 4 + 4\\delta",
  },
  {
    key: "s2",
    name: (
      <>
        <M tex="s_2" /> : trahit les deux périodes
      </>
    ),
    p0: { a1: "C", a2: "T", pay: 6 },
    p1: { a1: "T", why: "punit", a2: "T", pay: 2 },
    tex: "\\Pi_2 = 6 + \\delta \\cdot 2 = 6 + 2\\delta",
  },
  {
    key: "s2p",
    name: (
      <>
        <M tex="s_2'" /> : coopère en période 0 et trahit en période 1
      </>
    ),
    p0: { a1: "C", a2: "C", pay: 4 },
    p1: { a1: "C", why: "rien à punir", a2: "T", pay: 6 },
    tex: "\\Pi_2 = 4 + \\delta \\cdot 6 = 4 + 6\\delta",
  },
];

function PeriodBox({ label, m }: { label: string; m: Move }) {
  return (
    <div className="rounded-lg border bg-background px-2.5 py-2 text-[13.5px] leading-snug">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>
        <P1 /> joue <b className="text-rose-700">{m.a1}</b>
        {m.why ? <span className="text-muted-foreground"> ({m.why})</span> : null}
      </div>
      <div>
        <P2 /> joue <b className="text-sky-700">{m.a2}</b>
      </div>
      <div className="mt-0.5 font-semibold">
        → <P2 /> reçoit {m.pay}
      </div>
    </div>
  );
}

function ThreeOptionsFilm() {
  return (
    <div className="my-5 space-y-3">
      {OPTIONS.map((o) => (
        <div key={o.key} className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="text-[14.5px] font-semibold leading-snug">{o.name}</div>
          <div className="mt-2 grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_1.3fr]">
            <PeriodBox label="période 0" m={o.p0} />
            <PeriodBox label="période 1" m={o.p1} />
            <div className="col-span-2 text-center sm:col-span-1">
              <M tex={o.tex} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* § 4 — Les dominos de la backward induction (slide 9)                */
/* ------------------------------------------------------------------ */

const DOMINO_N = 5; // un festival de 5 jours : périodes 0 à 4

const DOMINO_MSG: ReactNode[] = [
  <>On part de la fin. Clique sur « Étape suivante ».</>,
  <>
    <strong>Période 4, la dernière :</strong> plus de lendemain, donc plus de punition possible.
    Quel que soit le passé, c'est le dilemme joué une seule fois : (T, T).
  </>,
  <>
    <strong>Période 3 :</strong> quoi qu'on fasse aujourd'hui, la période 4 sera (T, T). Elle
    ajoute la même valeur à chaque case : T reste dominante, donc (T, T).
  </>,
  <>
    <strong>Période 2 :</strong> la suite (périodes 3 et 4) sera (T, T) quoi qu'il arrive. Même
    raisonnement : (T, T).
  </>,
  <>
    <strong>Période 1 :</strong> idem, (T, T).
  </>,
  <>
    <strong>Période 0 :</strong> idem, (T, T). Tous les dominos sont tombés : trahir à chaque
    période est le seul ENPS.
  </>,
];

function DominoBackward() {
  const [k, setK] = useState(0); // nombre de périodes déjà résolues, en partant de la fin
  return (
    <figure className="my-6 rounded-2xl border bg-card p-3 shadow-sm sm:p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Un festival de 5 jours, résolu en partant de la fin
      </div>
      <div
        className="mx-auto mt-3 grid max-w-md grid-cols-5 gap-1.5"
        role="img"
        aria-label={`Périodes 0 à 4 ; ${k} période(s) résolue(s) en partant de la dernière`}
      >
        {Array.from({ length: DOMINO_N }, (_, t) => {
          const done = t >= DOMINO_N - k;
          const current = t === DOMINO_N - k;
          return (
            <div key={t}>
              <div
                className={cn(
                  "flex h-[4.25rem] w-full flex-col items-center justify-center rounded-xl border-2 text-[11px] transition-all duration-500",
                  done
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40"
                    : "border-border bg-background",
                  current && "scale-105 shadow-md",
                )}
              >
                <span className="text-muted-foreground">{t === DOMINO_N - 1 ? "dernière" : "période"}</span>
                <b className="text-[15px]">{t}</b>
                <span className={cn("font-bold", done ? "text-rose-700" : "text-muted-foreground")}>
                  {done ? "T, T" : "?"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 min-h-[3.5rem] text-[14.5px] leading-relaxed" aria-live="polite">
        {DOMINO_MSG[k]}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <StepButton primary onClick={() => setK(Math.min(DOMINO_N, k + 1))} disabled={k === DOMINO_N}>
          Étape suivante →
        </StepButton>
        <StepButton onClick={() => setK(0)} disabled={k === 0}>
          Recommencer
        </StepButton>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        La backward induction remonte de la dernière période vers la première (slide 9). Avec 10 ou
        100 jours, il y a plus de dominos, mais ils tombent de la même façon.
      </figcaption>
    </figure>
  );
}

export function PartFini() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 0 — Repères                                                 */}
      {/* ============================================================ */}
      <Section id="sec-reperes" kicker="§ 0" title="Repères — où en sommes-nous ?">
        <p className="text-[1.15rem] leading-relaxed">
          En B1, le dilemme du prisonnier finissait mal : deux joueurs rationnels trahissent, et
          tout le monde y perd. Mais dans la vraie vie, on ne joue presque jamais « une seule
          fois ». On recroise les mêmes gens demain, après-demain… Est-ce que ça change tout ? La
          réponse de ce chapitre : <strong>oui, mais pas toujours</strong>. Il faudra que les
          joueurs ne puissent pas anticiper la fin du jeu, et qu'ils soient assez patients.
        </p>
        <p className="mt-4 italic text-muted-foreground">
          B3 réutilise surtout des briques que tu possèdes déjà : le dilemme du prisonnier (B1), la
          backward induction et l'ENPS (B2.1), le facteur d'escompte (A2). Il y ajoute peu
          d'éléments nouveaux : la somme <M tex="a/(1-\delta)" />, les stratégies grim et
          « toujours trahir », et un théorème. Vérifions les trois briques avant de démarrer.
        </p>

        <H4>Le fil du chapitre en trois situations</H4>
        <div className="my-4 grid gap-3 md:grid-cols-3">
          {[
            {
              tag: "Un seul jour (B1)",
              body: <>Chacun a intérêt à trahir : (T, T).</>,
            },
            {
              tag: (
                <>
                  Un nombre fini de jours <span className="whitespace-nowrap">(§ 3-4)</span>
                </>
              ),
              body: (
                <>
                  Toujours (T, T), à chaque période : la menace de punition ne tient pas. C'est le
                  théorème du slide 8.
                </>
              ),
            },
            {
              tag: (
                <>
                  Un nombre infini de périodes <span className="whitespace-nowrap">(§ 5-8)</span>
                </>
              ),
              body: (
                <>
                  La coopération devient <strong>possible</strong> (mais pas certaine) si les joueurs
                  sont assez patients : <M tex="\delta \ge 1/2" /> pour le fritkot.
                </>
              ),
            },
          ].map((it, i) => (
            <div key={i} className="rounded-xl border bg-card p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12.5px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-[14.5px] font-bold">{it.tag}</span>
              </div>
              <div className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{it.body}</div>
            </div>
          ))}
        </div>
        <p className="text-[15px]">
          Enfin, les § 9 et 10 confrontent la théorie aux faits : le tournoi d'Axelrod et vos propres
          parties en laboratoire.
        </p>

        <H4>La boîte à outils : rappels express</H4>
        <CardGrid
          items={[
            {
              title: "Dilemme du prisonnier (B1)",
              body: (
                <>
                  Un jeu où chaque joueur a une <em>stratégie dominante</em> (trahir), mais où le
                  résultat (Trahir, Trahir) est <em>pire pour tout le monde</em> que (Coopérer,
                  Coopérer). (T, T) est un <em>équilibre en stratégies dominantes (ESD)</em> et
                  l'unique <em>équilibre de Nash (EN)</em>. B3 fait rejouer exactement ce jeu,
                  plusieurs fois.
                </>
              ),
            },
            {
              title: "Efficacité de Pareto (B1)",
              body: (
                <>
                  Un résultat est <em>efficace au sens de Pareto</em> si on ne peut pas améliorer
                  le sort d'un joueur sans détériorer celui d'un autre. (T, T) donne (2 ; 2)
                  alors que (C, C) donnerait (4 ; 4) à chacun : (T, T) n'est{" "}
                  <strong>pas</strong> efficace.
                </>
              ),
            },
            {
              title: "Backward induction & ENPS (B2.1)",
              body: (
                <>
                  Pour résoudre un jeu qui se déroule dans le temps, on commence par la{" "}
                  <em>dernière</em> décision, puis on remonte. Le profil de stratégies obtenu est
                  un <strong>ENPS</strong> : il forme un équilibre de Nash dans chaque sous-jeu,
                  donc aucune menace n'y est « en l'air ». Un jeu répété <strong>est</strong> un
                  jeu séquentiel : on le résout avec les mêmes armes.
                </>
              ),
            },
            {
              title: (
                <>
                  Facteur d'escompte <M tex="\delta" /> (A2)
                </>
              ),
              body: (
                <>
                  Un nombre entre 0 et 1. Recevoir <M tex="\pi" /> demain « vaut »{" "}
                  <M tex="\delta \cdot \pi" /> aujourd'hui. <M tex="\delta" /> proche de 1 :
                  joueur <em>patient</em> (demain compte presque autant qu'aujourd'hui).{" "}
                  <M tex="\delta" /> proche de 0 : joueur <em>impatient</em> (seul le présent
                  compte). Ici, il compare le profit d'aujourd'hui et celui de demain : la
                  conclusion du chapitre tiendra dans une condition sur <M tex="\delta" />.
                </>
              ),
            },
          ]}
        />
        <div className="-mt-2 mb-4 flex flex-wrap gap-1.5">
          <TheoryRef chapter="b1" section="s3" />
          <TheoryRef chapter="b1" section="s5" />
          <TheoryRef chapter="bseq" section="s3" />
          <TheoryRef chapter="bseq" section="s4" />
          <TheoryRef chapter="a2" section="outils" label="Le facteur d'escompte δ" />
        </div>

        <Quiz
          scope="b3"
          id="q1"
          kicker="Check de départ"
          question={
            <>
              Un joueur a un facteur d'escompte <M tex="\delta = 0{,}9" />. Que préfère-t-il :
              10 € demain ou 8 € aujourd'hui ?
            </>
          }
          options={[
            {
              text: <>10 € demain, car 0,9 × 10 = 9 &gt; 8.</>,
              correct: true,
              explain: (
                <>
                  Exact ! 10 € demain valent 0,9 × 10 = 9 € d'aujourd'hui, ce qui bat 8 €. Un
                  joueur patient valorise fortement le futur. Retiens ce réflexe de calcul : on va
                  le refaire tout le chapitre.
                </>
              ),
            },
            {
              text: (
                <>8 € aujourd'hui, car un euro aujourd'hui vaut toujours plus qu'un euro demain.</>
              ),
              explain: (
                <>
                  Presque : il faut convertir le futur en « valeur d'aujourd'hui » en multipliant
                  par <M tex="\delta" />. Ici, 10 € demain valent 0,9 × 10 = 9 € aujourd'hui… ce
                  qui est plus que 8 €.
                </>
              ),
            },
            {
              text: <>Impossible à dire, on ne peut pas comparer deux dates différentes.</>,
              explain: (
                <>
                  Non : <M tex="\delta" /> sert exactement à ça, rendre comparables des montants
                  reçus à des dates différentes. On multiplie le montant futur par{" "}
                  <M tex="\delta" />.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 0)">
          <p>
            Le réflexe A2 :{" "}
            <strong>
              une somme reçue en période <M tex="t" /> vaut <M tex="\delta^t" /> fois cette somme
              en période 0
            </strong>
            . Demain : <M tex="\times\,\delta" /> ; après-demain : <M tex="\times\,\delta^2" /> ;
            etc. Tout le chapitre applique ce réflexe aux profits des fritkots.
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 1 — Le dilemme du fritkot                                   */}
      {/* ============================================================ */}
      <Section id="sec-fritkot" kicker="§ 1" title="Le dilemme du fritkot">
        <Lead>
          Comme toujours dans ce cours, tout part d'une histoire. Deux baraques à frites, un
          festival, et une tentation bien belge : casser les prix du voisin (slides 2-3).
        </Lead>

        <p className="mt-4">
          Deux <strong>fritkots</strong> vendent des frites sur la plaine d'un festival. Chaque
          matin, chaque fritkot choisit le prix de ses frites : <strong>prix haut</strong> ou{" "}
          <strong>prix bas</strong>. Il l'inscrit sur son menu et ne peut plus le changer de la
          journée. Les deux choix se font en même temps, sans voir celui de l'autre : c'est un{" "}
          <strong>jeu simultané</strong>, exactement comme en B1.
        </p>
        <UL>
          <li>
            <strong>Coopérer (C)</strong> = choisir le prix <em>haut</em>. Les fritkots
            souhaiteraient coopérer tous les deux, pour maximiser leurs profits : c'est le
            comportement de <em>cartel</em>. Malheureusement, ce comportement de cartel ne peut pas
            être contractualisé (slide 2), par exemple parce qu'un cartel est illégal : impossible
            de signer un contrat « on promet de rester chers ».
          </li>
          <li>
            <strong>Trahir (T)</strong> = choisir le prix <em>bas</em>, pour gagner des parts de
            marché. C'est la compétition par les prix qui pousse chaque fritkot à trahir.
          </li>
        </UL>

        <PayoffMatrix
          rowPlayer="Fritkot 1"
          colPlayer="Fritkot 2"
          rows={["Coopérer", "Trahir"]}
          cols={["Coopérer", "Trahir"]}
          payoffs={[
            [
              [4, 4],
              [0, 6],
            ],
            [
              [6, 0],
              [2, 2],
            ],
          ]}
          interactive
          caption={
            <>
              Slide 2. Payoffs (profits du jour) :{" "}
              <span className="font-semibold text-rose-700">Fritkot 1</span> ;{" "}
              <span className="font-semibold text-sky-700">Fritkot 2</span>. Utilise les boutons
              pour révéler les meilleures réponses et l'équilibre de Nash.
            </>
          }
        />

        <H4>Pourquoi c'est un dilemme du prisonnier (réflexe B1)</H4>
        <p>
          Mets-toi à la place du <P1>Fritkot 1</P1> et compare ses payoffs, colonne par colonne.
          Notation de B1 : <M tex="u_1(T, C)" /> est le payoff de 1 quand 1 trahit et 2 coopère
          (l'action de 1 vient en premier).
        </p>
        <Steps
          items={[
            <>
              Si <P2>2 coopère</P2> : trahir rapporte <strong>6</strong> au lieu de 4,{" "}
              <M tex="u_1(T, C) = 6 > u_1(C, C) = 4" />. Trahir est mieux.
            </>,
            <>
              Si <P2>2 trahit</P2> : trahir rapporte <strong>2</strong> au lieu de 0,{" "}
              <M tex="u_1(T, T) = 2 > u_1(C, T) = 0" />. Trahir est <em>encore</em> mieux.
            </>,
            <>
              Quoi que fasse 2, trahir est le meilleur choix : T est une{" "}
              <strong>stratégie dominante</strong> pour 1. Le jeu est symétrique, donc T est aussi
              dominante pour 2 (<M tex="u_2(C, T) = 6 > 4" /> et <M tex="u_2(T, T) = 2 > 0" />).{" "}
              <strong>(T, T) est un ESD</strong> (slide 3), avec les payoffs (2 ; 2).
            </>,
          ]}
        />

        <Callout variant="attention" title="⚠️ La tragédie">
          <p>
            S'ils se comportent de manière rationnelle, les fritkots obtiennent le profil de
            payoffs (2 ; 2), qui n'est <strong>pas efficace au sens de Pareto</strong> : en (C, C),
            chacun aurait 4 au lieu de 2. Chacun, individuellement, a pourtant intérêt à trahir. La
            rationalité individuelle détruit le gain collectif : c'est <em>exactement</em> la
            conclusion de B1. D'où la question du slide 3 : ce résultat tragique peut-il être
            évité si le jeu est répété ?
          </p>
        </Callout>

        <Callout variant="definition" title="📖 La question du chapitre (slide 3)">
          <p>
            Le festival dure <strong>plusieurs jours</strong>. Chaque jour, les fritkots jouent ce
            même jeu. Au moment de choisir leur prix, ils se souviennent de tout ce qui s'est passé
            depuis le début du festival. Un fritkot pourrait alors proposer à l'autre :
          </p>
          <p className="my-2 text-center italic">
            « Tant que tu coopères, je coopère. Mais si tu trahis, alors je trahirai les jours
            suivants. »
          </p>
          <p>
            Pour l'adversaire, trahir est avantageux immédiatement, mais cela réduit ses profits
            futurs. D'où la question :{" "}
            <strong>
              est-il possible que des joueurs rationnels coopèrent lorsque le dilemme du
              prisonnier est répété ? Sous quelles conditions ?
            </strong>
          </p>
        </Callout>

        <p>
          Avec les chiffres du slide 2, l'arbitrage se voit tout de suite. Trahir un jour où l'autre
          coopère rapporte 6 au lieu de 4 : <strong>+2 aujourd'hui</strong>. Mais ensuite, l'autre
          trahit tous les jours ; le mieux que tu puisses faire est alors de trahir aussi, et tu
          touches 2 au lieu de 4 : <strong>−2 chaque jour suivant</strong>.
        </p>
        <div
          className="my-4 flex flex-wrap items-center justify-center gap-1.5 text-[13.5px] font-semibold tabular-nums"
          role="img"
          aria-label="Trahir : plus 2 aujourd'hui, puis moins 2 chaque jour suivant"
        >
          <span className="rounded-lg border-2 border-emerald-400 bg-emerald-50 px-2.5 py-1.5 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            aujourd'hui : +2
          </span>
          {["demain", "après-demain", "…"].map((d) => (
            <span
              key={d}
              className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2.5 py-1.5 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {d} : −2
            </span>
          ))}
        </div>
        <p>
          Qu'est-ce qui pèse le plus ? Cela dépend du poids que le fritkot accorde au futur (son
          facteur d'escompte <M tex="\delta" />) et du nombre de jours qui restent. Les § 3 à 7
          font le calcul.
        </p>

        <PollTwoDays />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 1)">
          <UL>
            <li>
              Reconnaître un dilemme du prisonnier et montrer que{" "}
              <strong>(T, T) est un ESD</strong> en écrivant les inégalités (6 &gt; 4 et 2 &gt; 0).
            </li>
            <li>
              Expliquer pourquoi le résultat (2 ; 2) n'est <strong>pas efficace au sens de
              Pareto</strong>.
            </li>
            <li>
              Savoir que le cartel ne peut pas être contractualisé : la coopération, si elle
              existe, doit tenir toute seule.
            </li>
            <li>
              Formuler la question du chapitre : des joueurs rationnels peuvent-ils coopérer quand
              le dilemme du prisonnier est répété, et sous quelles conditions ?
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 2 — C'est quoi, un jeu répété ?                             */}
      {/* ============================================================ */}
      <Section id="sec-cadre" kicker="§ 2" title="C'est quoi, un jeu répété ?">
        <Lead>
          Avant de calculer, fixons le vocabulaire (slide 4). Un jeu répété, c'est un sandwich : du
          jeu simultané à l'intérieur de chaque période, du jeu séquentiel d'une période à
          l'autre.
        </Lead>

        <Callout variant="definition" title="📖 Définition — jeu répété (slide 4)">
          <p>
            Un <strong>jeu répété</strong> est un jeu où un même <em>jeu simultané</em> est répété
            pendant plusieurs <strong>périodes</strong>. À la fin de chaque période, les stratégies
            utilisées sont <strong>observées</strong> (ici : qui a joué C, qui a joué T) et les{" "}
            <strong>payoffs de période</strong> sont réalisés.
          </p>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            Comme dans les slides, on numérote les périodes à partir de 0 : la première période
            est la période 0, la suivante la période 1, et ainsi de suite ; une période quelconque
            se note <M tex="t" />.
          </p>
        </Callout>

        <p>
          Les jeux étudiés en B3 ont quatre caractéristiques (slide 4). Trois te sont déjà
          familières :
        </p>
        <CardGrid
          items={[
            {
              title: "Non-coopératifs",
              body: (
                <>
                  Les joueurs ne peuvent pas conclure d'accords contraignants (B1). Ici, aucun
                  contrat n'est possible : le cartel ne peut pas être contractualisé. S'il y a
                  coopération, elle doit tenir <em>toute seule</em>, par le seul intérêt de
                  chacun.
                </>
              ),
            },
            {
              title: "Séquentiels",
              body: (
                <>
                  Le temps s'écoule : période 0, puis 1, puis 2… Au moment de choisir, chacun
                  connaît ce qui s'est passé avant. Comme pour les jeux séquentiels (B2.1), on
                  raisonnera par backward induction et on cherchera un ENPS.
                </>
              ),
            },
            {
              title: "Information complète (mais imparfaite)",
              body: (
                <>
                  <em>Complète</em> : chacun connaît la structure du jeu, les stratégies et les
                  payoffs de tous. <em>Imparfaite</em> : au sein d'une période, on choisit en même
                  temps, donc sans voir le choix courant de l'autre. On ne voit que le{" "}
                  <strong>passé</strong>.
                </>
              ),
            },
            {
              title: "Répétés",
              body: (
                <>
                  La nouveauté ! Le même jeu simultané revient période après période. À la fin de
                  chaque période, les actions sont observées par tous : l'
                  <strong>histoire du jeu</strong> (tout ce qui a été joué avant) est connue de
                  tous.
                </>
              ),
            },
          ]}
        />

        <Callout variant="intuition" title="💡 L'idée-clé du chapitre">
          <p>
            Puisque chacun observe le passé, une <strong>stratégie</strong> peut maintenant être{" "}
            <em>contingente à l'histoire du jeu</em> : « je coopère <u>si</u> tu as coopéré
            jusqu'ici, sinon je trahis ». C'est ce qui rend une <strong>punition</strong>{" "}
            possible, et donc, peut-être, la coopération. En B1, une stratégie était juste « C »
            ou « T ». Ici, c'est un <em>plan complet</em> : il dit quoi jouer à chaque période,
            pour chaque passé possible.
          </p>
        </Callout>

        <Callout variant="exemple" title="Combien de stratégies, avec seulement deux périodes ?">
          <p>
            Rappel de B2.1 : une stratégie précise l'action du joueur à <em>chaque</em> moment où il
            doit choisir, même dans les situations qui n'arriveront pas. Pour le fritkot 1, dans un
            festival de deux jours (périodes 0 et 1) :
          </p>
          <UL>
            <li>une action en période 0 : 2 choix (C ou T) ;</li>
            <li>
              une action en période 1 pour <em>chacune</em> des 4 histoires possibles de la
              période 0, (C, C), (C, T), (T, C) et (T, T) : 2 choix à chaque fois.
            </li>
          </UL>
          <p>
            Total : <M tex="2 \times 2 \times 2 \times 2 \times 2 = 2^5 = 32" /> stratégies !
            Exemple : « C en période 0 ; puis, en période 1, C si 2 a coopéré en période 0, T
            sinon ». C'est la stratégie grim du § 3. Lister toutes les stratégies dans une matrice
            serait pénible : on raisonnera plutôt par backward induction.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <TheoryRef chapter="bseq" section="s7" />
          </div>
        </Callout>

        <Quiz
          scope="b3"
          id="q2"
          question={<>Pendant la période 3, le Fritkot 1 peut baser sa décision sur…</>}
          options={[
            {
              text: <>…le choix que fait le Fritkot 2 en période 3.</>,
              explain: (
                <>
                  Non : au sein d'une période, le jeu est simultané. Le choix courant de
                  l'adversaire est invisible (information imparfaite).
                </>
              ),
            },
            {
              text: <>…tout ce qui a été joué aux périodes 0, 1 et 2.</>,
              correct: true,
              explain: (
                <>
                  Exactement. On observe tout le passé (périodes 0, 1 et 2) mais pas le présent :
                  au sein de chaque période, le jeu reste simultané.
                </>
              ),
            },
            {
              text: <>…rien du tout, car les payoffs de l'adversaire sont secrets.</>,
              explain: (
                <>
                  Non, l'information est complète : les payoffs sont connus de tous dès le
                  départ. Ce qui est caché, c'est seulement le choix simultané de la période en
                  cours.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 2)">
          <UL>
            <li>
              La définition du slide 4 : un même jeu simultané répété pendant plusieurs périodes ;
              à la fin de chaque période, les stratégies utilisées sont observées et les payoffs de
              période sont réalisés.
            </li>
            <li>
              Les 4 caractéristiques :{" "}
              <strong>
                non-coopératif, séquentiel, information complète (mais imparfaite), répété
              </strong>
              , et savoir expliquer chacune en une phrase.
            </li>
            <li>
              Ce qu'est une stratégie dans un jeu répété : un{" "}
              <strong>plan contingent à l'histoire du jeu</strong>, pas un simple choix C ou T.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 3 — Deux périodes : la coopération échoue                   */}
      {/* ============================================================ */}
      <Section id="sec-deux" kicker="§ 3" title="Deux périodes : la coopération échoue">
        <Lead>
          Commençons petit : le festival dure exactement 2 jours, les périodes 0 et 1 (slide 5).
          C'est le jeu répété le plus simple, et il livre déjà une leçon brutale.
        </Lead>

        <TwoPeriodTimeline />

        <H4>Le payoff total : du A2 pur jus (slide 5)</H4>
        <p>
          Comment un fritkot évalue-t-il le jeu <em>entier</em> ? Il additionne ses payoffs de
          période, après avoir <strong>escompté</strong> le futur, exactement comme en A2 :
        </p>
        <FormulaBox
          tex="\Pi \;=\; \pi_0 + \delta\,\pi_1"
          label="Payoff d'un fritkot pour le jeu répété à deux périodes"
          caption={
            <>
              où <M tex="\pi_t" /> est le payoff du fritkot pour la période <M tex="t" />, et{" "}
              <M tex="\delta \in [0,1]" /> son facteur d'escompte, qui marque sa préférence pour
              un payoff aujourd'hui plutôt qu'un payoff demain. Un grand <M tex="\Pi" />{" "}
              (majuscule) pour le jeu entier, un petit <M tex="\pi" /> (minuscule) pour chaque
              période.
            </>
          }
        />
        <p>
          <strong>Exemple.</strong> Les deux fritkots coopèrent les deux jours :{" "}
          <M tex="\pi_0 = 4" /> et <M tex="\pi_1 = 4" />. Avec <M tex="\delta = 0{,}5" />,{" "}
          <M tex="\Pi = 4 + 0{,}5 \times 4 = 6" />. Les deux cas extrêmes : avec{" "}
          <M tex="\delta = 0" />, <M tex="\Pi = \pi_0" /> (seul aujourd'hui compte) ; avec{" "}
          <M tex="\delta = 1" />, <M tex="\Pi = \pi_0 + \pi_1" /> (demain compte autant
          qu'aujourd'hui).
        </p>

        <H4>L'ENPS par backward induction (slide 6)</H4>
        <p>
          Un jeu répété est un jeu séquentiel à information imparfaite. On applique donc la
          recette de B2.1 : identifier les derniers sous-jeux, trouver leurs EN, remplacer chaque
          dernier sous-jeu par les payoffs de son EN, puis remonter jusqu'au début du jeu.
        </p>
        <Steps
          items={[
            <>
              <strong>Les derniers sous-jeux.</strong> Après la période 0, quatre histoires sont
              possibles, (C, C), (C, T), (T, C) et (T, T) : chacune ouvre un sous-jeu, la période 1.
            </>,
            <>
              <strong>On résout la période 1.</strong> C'est la dernière : plus de « demain », donc
              plus aucune punition possible, et les payoffs de la période 0 sont déjà encaissés. Il
              reste un dilemme du prisonnier joué une fois : dans chacun des quatre sous-jeux, l'EN
              est (T, T), et chacun touche <M tex="\pi_1 = 2" />.
            </>,
            <>
              <strong>On remonte en période 0 : le jeu réduit.</strong> On remplace chaque
              sous-jeu par les payoffs de son EN : chaque case de la période 0 reçoit{" "}
              <M tex="\delta \times 2 = 2\delta" /> en plus. T reste dominante, donc chacun trahit
              aussi en période 0. Coopérer aujourd'hui n'achète aucune récompense demain, et trahir
              ne coûte aucune punition. La figure ci-dessous déroule ces trois étapes.
            </>,
          ]}
        />

        <BackwardTwoPeriods />
        <div className="flex flex-wrap gap-1.5">
          <TheoryRef chapter="bseq" section="s4" />
          <TheoryRef chapter="bseq" section="s7" />
        </div>

        <Callout variant="definition" title="📖 L'ENPS du jeu à deux périodes (slide 6)">
          <p>
            Par backward induction, on trouve l'ENPS <span className="whitespace-nowrap">(<M tex="s_1^*" />, <M tex="s_2^*" />)</span>, où :
          </p>
          <UL>
            <li>
              <M tex="s_1^*" /> est tel que <P1 /> joue T en période 0 ; et puis joue T en période
              1 pour toute action de <P2 /> en période 0 ;
            </li>
            <li>
              <M tex="s_2^*" /> est tel que <P2 /> joue T en période 0 ; et puis joue T en période
              1 pour toute action de <P1 /> en période 0.
            </li>
          </UL>
          <p>
            Cet ENPS montre que des joueurs rationnels ne coopèrent pas nécessairement lorsque le
            dilemme du prisonnier est répété.
          </p>
        </Callout>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          <strong>Cas limite <M tex="\delta = 0" /> (remarque hors slides).</strong> Le joueur
          ignore alors la période 1 : toutes ses actions de période 1 lui rapportent le même{" "}
          <M tex="\Pi" />. <span className="whitespace-nowrap">(<M tex="s_1^*" />, <M tex="s_2^*" />)</span>{" "}
          reste un ENPS, mais ce n'est plus le seul : jouer autre chose en période 1 ne coûte
          rien.
        </p>

        <H4>Peut-on faire coopérer par la menace ? Les deux questions du slide 6</H4>
        <p>Le slide 6 pose ensuite deux questions :</p>
        <UL>
          <li>
            <strong>Y a-t-il d'autres ENPS ?</strong> (Réponse au § 4.)
          </li>
          <li>
            <strong>
              Est-il possible que des joueurs rationnels coopèrent pour éviter que leur adversaire
              ne les punisse la période suivante ?
            </strong>
          </li>
        </UL>
        <p>
          Pour que ce soit possible, les joueurs devraient utiliser une stratégie qui (1){" "}
          <strong>punisse</strong> l'adversaire s'il ne coopère pas, et (2) soit{" "}
          <strong>rationnelle à jouer</strong> (et donc pas une stratégie dominée). La candidate
          naturelle :
        </p>

        <Callout
          variant="definition"
          title={
            <>
              📖 Définition — la stratégie « grim » <M tex="s^{G}" /> (grim trigger strategy, slide 7)
            </>
          }
        >
          <UL>
            <li>le joueur coopère en période 0 ;</li>
            <li>
              en période <M tex="t" />, le joueur <strong>coopère</strong> si son adversaire a
              toujours coopéré dans le passé, <strong>sinon il trahit</strong>.
            </li>
          </UL>
          <p>
            En d'autres mots : tant que son adversaire coopère, le joueur coopère, mais dès que son
            adversaire le trahit, le joueur trahit pour toujours. (« Grim » veut dire
            « implacable » : une seule trahison déclenche la punition, sans pardon.)
          </p>
        </Callout>

        <H4>
          <span className="whitespace-nowrap">(<M tex="s_1^{G}" />, <M tex="s_2^{G}" />)</span> est-il un ENPS ? Le test du slide 7
        </H4>
        <p>
          Supposons que le joueur <P1 /> utilise <M tex="s_1^{G}" />. Un ENPS est d'abord un EN :
          il faut donc que <M tex="s_2^{G}" /> soit une meilleure réponse de <P2 /> à{" "}
          <M tex="s_1^{G}" />. Comparons-la aux deux déviations du slide 7. Pour chacune, on
          déroule le film : que fait <P1 /> (avec sa grim), que fait <P2 />, et combien <P2 />{" "}
          touche-t-il à chaque période ?
        </p>

        <ThreeOptionsFilm />

        <p>
          Chaque total suit la formule <M tex="\Pi_2 = \pi_0 + \delta\,\pi_1" /> du slide 5 : le
          payoff de la période 0, plus <M tex="\delta" /> fois celui de la période 1.
        </p>

        <H4>
          Pourquoi <M tex="s_2^{G}" /> n'est jamais une meilleure réponse (slide 8)
        </H4>
        <p>
          Regarde <M tex="s_2'" /> : <P2 /> encaisse la coopération de <P1 /> en période 0 (la
          grim de <P1 /> n'a encore rien à punir), puis le poignarde au dernier jour, quand{" "}
          <strong>la punition ne peut plus exister</strong>. Comparons <M tex="s_2^{G}" /> aux deux
          déviations en calculant les écarts :
        </p>
        <MB tex="\begin{aligned} (4+6\delta) - (4+4\delta) &= 2\delta \\ (6+2\delta) - (4+4\delta) &= 2 - 2\delta \\ &= 2(1-\delta) \end{aligned}" />
        <UL>
          <li>
            Le premier écart, <M tex="2\delta" />, est strictement positif dès que{" "}
            <M tex="\delta > 0" /> : <M tex="s_2'" /> rapporte alors plus que{" "}
            <M tex="s_2^{G}" />.
          </li>
          <li>
            Le second, <M tex="2(1-\delta)" />, est strictement positif dès que{" "}
            <M tex="\delta < 1" /> : <M tex="s_2" /> rapporte alors plus que <M tex="s_2^{G}" />.
          </li>
        </UL>
        <p>
          Pour tout <M tex="\delta \in [0,1]" />, au moins une des deux déviations rapporte donc{" "}
          <strong>strictement plus</strong> que <M tex="s_2^{G}" /> : à <M tex="\delta = 0" />,
          c'est <M tex="s_2" /> (6 &gt; 4) ; à <M tex="\delta = 1" />, c'est <M tex="s_2'" /> (10
          &gt; 8) ; entre les deux, ce sont les deux (slide 8 : « <M tex="s_2" /> et{" "}
          <M tex="s_2'" /> apportent un plus grand payoff <M tex="\Pi_2" /> que{" "}
          <M tex="s_2^{G}" /> »).
        </p>

        <div className="my-5 overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-center text-[14px] tabular-nums">
            <thead>
              <tr className="bg-muted/60 text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2 text-left">Stratégie de 2</th>
                <th className="px-2 py-2">
                  <M tex="\delta = 0" />
                </th>
                <th className="px-2 py-2">
                  <M tex="\delta = 0{,}5" />
                </th>
                <th className="px-2 py-2">
                  <M tex="\delta = 1" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: "s_2^{G}", f: "4+4\\delta", v: ["4", "6", "8"], win: [false, false, false] },
                { s: "s_2", f: "6+2\\delta", v: ["6", "7", "8"], win: [true, true, false] },
                { s: "s_2'", f: "4+6\\delta", v: ["4", "7", "10"], win: [false, true, true] },
              ].map((row) => (
                <tr key={row.s} className="border-t">
                  <td className="px-2 py-2 text-left">
                    <M tex={`${row.s} : ${row.f}`} />
                  </td>
                  {row.v.map((x, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-2 py-2",
                        row.win[i] && "bg-amber-100/80 font-bold dark:bg-amber-900/30",
                      )}
                    >
                      {x}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="-mt-3 text-[13.5px] text-muted-foreground">
          En surligné : les déviations qui rapportent strictement plus que grim. Il y en a toujours
          au moins une.
        </p>

        <p>
          <M tex="s_2^{G}" /> n'est donc <strong>jamais</strong> une meilleure réponse à{" "}
          <M tex="s_1^{G}" /> : <span className="whitespace-nowrap">(<M tex="s_1^{G}" />, <M tex="s_2^{G}" />)</span> n'est pas un EN, et donc{" "}
          <strong>pas un ENPS</strong>, quel que soit <M tex="\delta" />. La menace grim est{" "}
          <em>vide</em> en période 1 : il n'y aura plus d'autres périodes, donc le mieux qu'un
          joueur puisse faire en période 1 est de trahir (slide 8).
        </p>

        <Callout variant="examen" title="🎯 Pourquoi grim échoue : elle est dominée (slides 6 et 8)">
          <p>
            Le slide 6 demandait une stratégie rationnelle à jouer, donc pas dominée. Grim ne passe
            pas ce test. Compare <M tex="s_2'" /> et <M tex="s_2^{G}" /> face à{" "}
            <em>n'importe quelle</em> stratégie de{" "}
            <span className="whitespace-nowrap"><P1 /> :</span>
          </p>
          <UL>
            <li>en période 0, les deux jouent C : même payoff ;</li>
            <li>
              si <P1 /> a coopéré en période 0 : en période 1, <M tex="s_2^{G}" /> joue C alors
              que <M tex="s_2'" /> joue T. Or, en période 1, T rapporte toujours plus que C : 6
              &gt; 4 si <P1 /> joue C, 2 &gt; 0 si <P1 /> joue T (tableau ci-dessous) ;
            </li>
            <li>si <P1 /> a trahi en période 0 : les deux stratégies jouent T en période 1.</li>
          </UL>
          <div className="my-3 overflow-x-auto">
            <table className="mx-auto border-collapse text-center text-[14px] tabular-nums">
              <thead>
                <tr className="text-[12.5px] text-muted-foreground">
                  <th className="px-3 py-1.5 text-left font-semibold">
                    Période 1, après C de <P1 /> en période 0
                  </th>
                  <th className="px-3 py-1.5 font-semibold">
                    <M tex="s_2^{G}" /> (C)
                  </th>
                  <th className="px-3 py-1.5 font-semibold">
                    <M tex="s_2'" /> (T)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-1.5 text-left">
                    <P1 /> joue C
                  </td>
                  <td className="px-3 py-1.5">4</td>
                  <td className="px-3 py-1.5 font-bold">6</td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-1.5 text-left">
                    <P1 /> joue T
                  </td>
                  <td className="px-3 py-1.5">0</td>
                  <td className="px-3 py-1.5 font-bold">2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Pour <M tex="\delta > 0" />, <M tex="s_2'" /> rapporte donc au moins autant que{" "}
            <M tex="s_2^{G}" /> contre toute stratégie de <P1 />, et strictement plus quand{" "}
            <P1 /> coopère en période 0 : <M tex="s_2^{G}" /> est (faiblement) dominée par{" "}
            <M tex="s_2'" /> (définition de B1, avec le signe <M tex="\ge" />). Pour{" "}
            <M tex="\delta = 0" />, c'est <M tex="s_2" /> qui la domine strictement : dès la
            période 0, trahir rapporte 6 &gt; 4 ou 2 &gt; 0, et la période 1 ne compte pas.
          </p>
          <p>
            Grim ne remplit donc pas la deuxième exigence du slide 6. C'est le sens de la phrase du slide
            8 : « il n'existe pas dans ce jeu de stratégie non-dominée qui puisse susciter la
            coopération ».
          </p>
        </Callout>

        <TwoPeriodExplorer />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 3)">
          <UL>
            <li>
              Écrire le payoff du jeu répété,{" "}
              <strong>
                <M tex="\Pi = \pi_0 + \delta\pi_1" />
              </strong>
              , et expliquer chaque symbole.
            </li>
            <li>
              Dérouler la backward induction : <strong>période 1 ⇒ (T, T)</strong> dans les quatre
              sous-jeux ; puis jeu réduit (+ <M tex="2\delta" /> dans chaque case){" "}
              <strong>⇒ (T, T) en période 0</strong>. Énoncer <M tex="s_1^*" /> et{" "}
              <M tex="s_2^*" /> avec les mots du slide 6.
            </li>
            <li>
              Définir la stratégie <strong>grim</strong> par cœur, calculer les trois payoffs (
              <M tex="4+4\delta" />, <M tex="6+2\delta" />, <M tex="4+6\delta" />) et montrer avec
              les écarts <M tex="2\delta" /> et <M tex="2(1-\delta)" /> que{" "}
              <M tex="s_2^{G}" /> n'est jamais une meilleure réponse, pour tout{" "}
              <M tex="\delta \in [0,1]" />.
            </li>
            <li>
              Dire pourquoi grim échoue : la menace est vide en dernière période, et grim est une
              stratégie dominée.
            </li>
          </UL>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4 — Le théorème de l'horizon fini                           */}
      {/* ============================================================ */}
      <Section id="sec-fini" kicker="§ 4" title="Le théorème de l'horizon fini">
        <Lead>
          Deux périodes, c'était peut-être trop court ? Et si le festival durait 10 jours ? 100
          jours ? Mauvaise nouvelle : tant que le nombre de périodes est fini, rien ne change. Voici
          pourquoi, et c'est un des plus beaux raisonnements du cours (slides 8-9).
        </Lead>

        <p className="mt-4">
          Le slide 8 tire d'abord la leçon du § 3 : « il n'existe pas dans ce jeu de stratégie
          non-dominée qui puisse susciter la coopération ». Puis il généralise : lorsque le dilemme
          du prisonnier est répété un nombre fini de fois, il n'existe pas de stratégie
          « contingente à l'histoire du jeu » qui puisse susciter la coopération entre des joueurs
          rationnels. Le résultat général s'énonce ainsi :
        </p>

        <Callout variant="examen" title="🏛️ Théorème (slide 8, à connaître mot pour mot)">
          <p>
            Dans un jeu répété un <strong>nombre fini de fois</strong>, si le jeu simultané qui est
            répété a un <strong>unique EN</strong>, alors le jeu répété a un{" "}
            <strong>unique ENPS</strong> tel que le EN du jeu simultané est joué{" "}
            <strong>à chaque période</strong>.
          </p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            « Théorème de l'horizon fini » est le surnom utilisé dans cette app ; à l'examen, cite
            l'énoncé du slide 8.
          </p>
        </Callout>

        <H5>Décortiquer l'énoncé</H5>
        <div className="my-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto_1.3fr] sm:items-stretch">
          <div className="rounded-xl border bg-card p-3 text-[14.5px] leading-snug shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Si (hypothèse 1)
            </div>
            le jeu est répété un <strong>nombre fini</strong> de fois,
          </div>
          <div className="rounded-xl border bg-card p-3 text-[14.5px] leading-snug shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              et si (hypothèse 2)
            </div>
            le jeu simultané qui est répété a un <strong>unique EN</strong>,
          </div>
          <div className="self-center text-center text-xl font-bold text-primary" aria-hidden>
            ⇒
          </div>
          <div className="rounded-xl border-2 border-primary/40 bg-accent/60 p-3 text-[14.5px] leading-snug">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              alors (conclusion)
            </div>
            le jeu répété a un <strong>unique ENPS</strong>, dans lequel cet EN est joué à{" "}
            <strong>chaque période</strong>.
          </div>
        </div>
        <p>
          Appliqué au fritkot : le dilemme du prisonnier a un unique EN, (T, T). L'hypothèse 2 est
          remplie. Donc, si le festival dure un nombre fini de jours, l'unique ENPS est : trahir
          tous les jours.
        </p>

        <H4>Pourquoi ? L'effet domino, à l'envers (slide 9)</H4>
        <p>Le slide 9 donne la raison en deux temps :</p>
        <UL>
          <li>
            la peur de la punition n'opère plus dans la dernière période, et les joueurs trahissent
            durant cette dernière période ;
          </li>
          <li>la backward induction étend ce raisonnement aux périodes qui la précèdent.</li>
        </UL>
        <Steps
          items={[
            <>
              <strong>Dernière période :</strong> plus de lendemain, donc plus de peur de la
              punition. Quoi qu'il se soit passé avant, c'est le jeu simultané joué une seule fois :
              on y joue son unique EN, (T, T).
            </>,
            <>
              <strong>Avant-dernière période :</strong> tout le monde sait que la dernière sera (T,
              T) quoi qu'il arrive. La suite ajoute donc la même valeur à chaque case, comme le{" "}
              <M tex="+\,2\delta" /> du § 3. Ajouter la même valeur partout ne change aucune
              meilleure réponse : le jeu réduit a le même EN, (T, T).
            </>,
            <>
              <strong>Et ainsi de suite :</strong> la backward induction fait tomber les dominos un
              à un, de la fin vers le début, jusqu'à la période 0.{" "}
              <strong>Tout le monde trahit à toutes les périodes.</strong>
            </>,
          ]}
        />
        <p>
          À chaque étape, on utilise l'hypothèse « unique EN » : c'est elle qui garantit que la
          suite du jeu est la même, quel que soit le passé. Fais tomber les dominos toi-même :
        </p>

        <DominoBackward />

        <p>
          <strong>Réponse à la question du § 3</strong> (slide 6 : « Y a-t-il d'autres ENPS ? ») :{" "}
          <strong>non</strong>. Le dilemme du prisonnier a un unique EN, donc, d'après le théorème,
          le jeu à deux périodes a un unique ENPS : <span className="whitespace-nowrap">(<M tex="s_1^*" />, <M tex="s_2^*" />)</span>, trahir
          à chaque période. Plus généralement, le théorème implique que le seul ENPS, lorsque le
          dilemme du prisonnier est répété un nombre fini de fois, est le suivant : les joueurs
          trahissent à chaque période (slide 9). (L'unicité suppose <M tex="\delta > 0" /> : voir
          le cas limite <M tex="\delta = 0" /> du § 3.)
        </p>
        <p>
          Il n'existe donc <strong>aucune stratégie contingente à l'histoire</strong>, aussi
          maligne soit-elle, capable de faire coopérer des joueurs rationnels. La grim, ou
          n'importe quelle autre stratégie qui punit (on verra le tit-for-tat au § 9) : rien n'y
          fait, tout se fait dévorer par la dernière période.
        </p>

        <Callout variant="intuition" title="💡 La leçon à retenir (slide 9)">
          <p>
            Pour faire coopérer des joueurs rationnels, il faut que la peur d'une punition dans les
            périodes futures soit <strong>toujours présente</strong>. En d'autres mots,{" "}
            <strong>les joueurs ne doivent pas pouvoir anticiper la fin du jeu</strong>. La
            coopération meurt dès que l'on peut compter les jours qui restent. C'est exactement ce
            que change le § 5 : un nombre infini de périodes.
          </p>
        </Callout>

        <Quiz
          scope="b3"
          id="q3"
          question={
            <>
              Le jeu « bataille des sexes » possède <em>deux</em> équilibres de Nash. Si on le
              répète 5 fois, le théorème du slide 8 dit que…
            </>
          }
          options={[
            {
              text: <>…l'unique ENPS consiste à jouer le même EN à chaque période.</>,
              explain: (
                <>
                  Attention à l'hypothèse ! Le théorème exige que le jeu simultané qui est répété
                  ait un EN <em>unique</em>. Avec deux EN, il ne s'applique pas.
                </>
              ),
            },
            {
              text: <>…rien du tout : l'hypothèse « unique EN » n'est pas remplie.</>,
              correct: true,
              explain: (
                <>
                  Bien vu : le théorème ne s'applique que si le jeu simultané a un UNIQUE EN. Le
                  dilemme du prisonnier remplit cette condition ; la bataille des sexes, non.
                  C'est le genre de piège d'énoncé que l'examen adore.
                </>
              ),
            },
            {
              text: <>…la coopération devient possible dès la période 2.</>,
              explain: (
                <>
                  Non : le théorème ne parle pas de coopération en général, et de toute façon son
                  hypothèse (EN unique) n'est pas remplie ici.
                </>
              ),
            },
          ]}
        />

        <Callout variant="retiens" title="⭐ À maîtriser absolument (§ 4)">
          <UL>
            <li>
              Le <strong>théorème du slide 8</strong>, mot pour mot, avec ses deux hypothèses
              (nombre fini de répétitions ; EN unique du jeu simultané qui est répété) et sa
              conclusion.
            </li>
            <li>
              Le raisonnement du slide 9 : la peur de la punition n'opère plus en dernière période,
              puis la <strong>backward induction</strong> remonte période par période.
            </li>
            <li>
              La phrase-clé :{" "}
              <em>« les joueurs ne doivent pas pouvoir anticiper la fin du jeu »</em>.
            </li>
          </UL>
        </Callout>
      </Section>
    </>
  );
}
