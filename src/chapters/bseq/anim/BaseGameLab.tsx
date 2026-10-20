/*
 * BaseGameLab — B2 § 6 · le jeu de « base » joué en classe (slides 26-28).
 *
 * Quatre étapes : (1) l'arbre ; (2) H1 : dans chaque sous-jeu, J2 évite son
 * action dominée ⇒ ses 4 stratégies (plans complets) A−C, A−D, B−C, B−D et
 * la seule non dominée B−C ; (3) H2.1 : J1 anticipe B−C, jeu réduit ⇒ Droite ;
 * (4) prédiction vs comportement observé au 1er round (90 % B−C, 48 % Droite).
 * Stratégies, dominances et choix CALCULÉS (enumerateStrategies, normalForm2,
 * backwardInduction) ; seuls 90 % et 48 % viennent du slide 27.
 */
import { useMemo, useState, type ReactNode } from "react";
import { InteractiveCard } from "@/components/course/Interactive";
import {
  GT_COLORS,
  GameTreeSvg,
  PayoffChip,
  backwardInduction,
  choicesOf,
  findNode,
  leaf,
  node,
  normalForm2,
  playPath,
  type GTGame,
  type GTNode,
  type GTStrategy,
} from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const GAME: GTGame = {
  players: [
    { name: "J1", color: GT_COLORS[0] },
    { name: "J2", color: GT_COLORS[1] },
  ],
  root: node("j1", 0, [
    ["Gauche", node("j2g", 1, [["A", leaf("a", [4, 1])], ["B", leaf("b", [1, 4])]])],
    ["Droite", node("j2d", 1, [["C", leaf("c", [2, 2])], ["D", leaf("d", [0, 1])]])],
  ]),
};
const COL = [GT_COLORS[0], GT_COLORS[1]];
/** observé au 1er round (slide 27) */
const OBS = { bc: 0.9, droite: 0.48 };

const lab = (s: GTStrategy) => s.actions.join("−");
const pctFr = (v: number) => `${fmt(v * 100, 0)} %`;

function Act({ p, children }: { p: number; children: ReactNode }) {
  return (
    <strong style={{ color: COL[p] }} className="whitespace-nowrap">
      {children}
    </strong>
  );
}

function Bar({ label, value, color, note }: { label: ReactNode; value: number; color: string; note?: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr_2.8rem] items-center gap-2 text-[13px] sm:grid-cols-[8.5rem_1fr_3rem]">
      <div className="text-muted-foreground">{label}</div>
      <div className="relative h-6 rounded-md bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-md transition-[width] duration-700"
          style={{ width: `${value * 100}%`, background: color }}
        />
        {note}
      </div>
      <span className="text-right font-bold tabular-nums">{pctFr(value)}</span>
    </div>
  );
}

const STEPS = ["Le jeu", "H1 : le joueur 2", "H2.1 : le joueur 1", "En classe"];

export function BaseGameLab() {
  const [step, setStep] = useState(0);
  const [grown, setGrown] = useState(false);

  const bi = useMemo(() => backwardInduction(GAME), []);
  const nf = useMemo(() => normalForm2(GAME), []);
  const j2Steps = bi.filter((s) => s.player === 1);
  const j1Step = bi.find((s) => s.player === 0)!;
  const all = choicesOf(bi);

  // dominance des stratégies de J2 (forme normale : colonnes = stratégies de J2)
  const j2Pay = (j: number) => nf.rows.map((_, i) => nf.cells[i][j][1]);
  const dominatedBy = nf.cols.map((_, j) => {
    const mine = j2Pay(j);
    const by = nf.cols.findIndex((__, h) => {
      if (h === j) return false;
      const o = j2Pay(h);
      return o.every((v, i) => v >= mine[i]) && o.some((v, i) => v > mine[i]);
    });
    return by;
  });
  const undominated = nf.cols.filter((_, j) => dominatedBy[j] < 0);
  const biStrat = nf.cols.find((c) => Object.entries(c.choice).every(([id, k]) => all[id] === k))!;
  const j1Choice = j1Step.options[j1Step.chosen].action;
  const outcome = playPath(GAME, all).leaf!;
  // « appât » : la meilleure issue de J1, atteignable seulement si J2 se trompe
  const lure = (() => {
    const root = GAME.root as GTNode;
    let best = { via: "", action: "", pay: -Infinity };
    root.moves.forEach((m) => {
      if (m.to.kind !== "node") return;
      m.to.moves.forEach((mm) => {
        if (mm.to.kind === "leaf" && mm.to.payoffs[0] > best.pay) best = { via: m.action, action: mm.action, pay: mm.to.payoffs[0] };
      });
    });
    return best;
  })();

  // vue de l'arbre selon l'étape
  const treeProps =
    step === 0
      ? {}
      : step === 1
        ? {
            chosen: Object.fromEntries(j2Steps.map((s) => [s.nodeId, s.chosen])),
            dimOthers: true,
            boxes: j2Steps.map((s) => ({
              root: s.nodeId,
              label: `après ${GAME.root.kind === "node" ? GAME.root.moves.find((m) => m.to.id === s.nodeId)?.action : ""}`,
            })),
          }
        : {
            chosen: all,
            dimOthers: true,
            showPath: true,
            collapsed: Object.fromEntries(j2Steps.map((s) => [s.nodeId, s.value])),
          };

  const go = (i: number) => {
    setStep(i);
    setGrown(false);
    if (i === 3) window.setTimeout(() => setGrown(true), 60);
  };

  return (
    <InteractiveCard
      title="Le jeu de « base » : ce que prédit la théorie, ce que la classe a fait"
      subtitle={
        <>
          Slides 26-28. J1 choisit Gauche ou Droite ; J2 voit ce choix, puis joue A ou B (après Gauche) ou C ou D (après
          Droite). Paiements (J1 ; J2). Avance étape par étape.
        </>
      }
      controls={
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="mb-1.5 text-[13px] font-semibold">Étapes</div>
          <div className="flex flex-wrap gap-1.5">
            {STEPS.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                  step === i ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {i + 1}. {t}
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        <>
          prédire J2 ne demande que H1 (il est rationnel) ; prédire J1 demande en plus H2.1 (il sait que J2 est
          rationnel). En classe, H1 tient ({pctFr(OBS.bc)}), H2.1 non ({pctFr(OBS.droite)}, à peu près un choix à pile ou face).
        </>
      }
    >
      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <GameTreeSvg
          game={GAME}
          {...treeProps}
          ariaLabel="Jeu de base : J1 choisit Gauche ou Droite ; après Gauche, J2 choisit A (4 ; 1) ou B (1 ; 4) ; après Droite, C (2 ; 2) ou D (0 ; 1)."
          maxW={330}
        />

        <div className="text-[14px] leading-relaxed" aria-live="polite">
          {step === 0 ? (
            <>
              <p>
                <strong>Un jeu séquentiel à information parfaite.</strong> J1 joue d'abord ; J2 observe son choix avant
                de jouer. Le jeu a donc <strong>deux sous-jeux finaux</strong> : l'un après Gauche, l'autre après Droite.
              </p>
              <p className="mt-2">
                Une stratégie de J2 est un <strong>plan d'action complet</strong> : que faire après Gauche <em>et</em>{" "}
                que faire après Droite. J2 en a donc {nf.cols.length} :{" "}
                {nf.cols.map((c, i) => (
                  <span key={c.label}>
                    {i > 0 ? ", " : ""}
                    <Act p={1}>{lab(c)}</Act>
                  </span>
                ))}
                .
              </p>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <p>
                <strong>H1 : J2 est rationnel.</strong> Dans chaque sous-jeu final, il évite son action dominée :
              </p>
              <ul className="my-1.5 space-y-0.5">
                {j2Steps.map((s) => {
                  const nd = findNode(GAME.root, s.nodeId) as GTNode;
                  const via = GAME.root.kind === "node" ? GAME.root.moves.find((m) => m.to.id === s.nodeId)?.action : "";
                  const lose = s.options.findIndex((_, i) => i !== s.chosen);
                  return (
                    <li key={s.nodeId}>
                      après {via} : <Act p={1}>{nd.moves[s.chosen].action}</Act> &gt; <Act p={1}>{nd.moves[lose].action}</Act>{" "}
                      car {fmt(s.options[s.chosen].value[1])} &gt; {fmt(s.options[lose].value[1])}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[12.5px] text-muted-foreground">
                Les 4 plans de J2 (action après Gauche · action après Droite ; ✓ = meilleure action du sous-jeu) :
              </p>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                {nf.cols.map((c, j) => {
                  const ok = dominatedBy[j] < 0;
                  return (
                    <div
                      key={c.label}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-[13px]",
                        ok ? "border-emerald-500 bg-emerald-50" : "opacity-70",
                      )}
                    >
                      <div className="font-bold">
                        <Act p={1}>{lab(c)}</Act> {ok ? "✓ non dominée" : "✗ dominée"}
                      </div>
                      <div className="text-muted-foreground">
                        {c.actions.map((a, i) => {
                          const st = j2Steps[i];
                          const good = (findNode(GAME.root, st.nodeId) as GTNode).moves[st.chosen].action === a;
                          return (
                            <span key={a}>
                              {i > 0 ? " · " : ""}
                              {a} {good ? "✓" : "✗"}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2">
                Seule <Act p={1}>{undominated.map(lab).join(", ")}</Act> n'est dominée par aucune autre : c'est la seule
                stratégie non dominée de J2 (slide 27).
              </p>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p>
                <strong>H2.1 : J1 pense que J2 est rationnel.</strong> Il anticipe <Act p={1}>{lab(biStrat)}</Act> et
                remplace chaque sous-jeu par son issue (jeu réduit) :
              </p>
              <ul className="my-1.5 space-y-0.5">
                {j1Step.options.map((o, i) => (
                  <li key={o.action} className={cn(i === j1Step.chosen && "font-semibold")}>
                    <Act p={0}>{o.action}</Act> → <PayoffChip game={GAME} value={o.value} />, soit{" "}
                    <strong>{fmt(o.value[0])}</strong> pour J1{i === j1Step.chosen ? " ✓" : ""}
                  </li>
                ))}
              </ul>
              <p>
                J1 choisit donc <Act p={0}>{j1Choice}</Act> ({fmt(j1Step.value[0])} &gt;{" "}
                {j1Step.options
                  .filter((_, i) => i !== j1Step.chosen)
                  .map((o) => fmt(o.value[0]))
                  .join(", ")}
                ). ENPS : (<Act p={0}>{j1Choice}</Act>, <Act p={1}>{lab(biStrat)}</Act>), issue{" "}
                <PayoffChip game={GAME} value={outcome.payoffs} />.
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Remarque : {lure.via} pourrait rapporter {fmt(lure.pay)} à J1, mais seulement si J2 jouait {lure.action},
                une action dominée. Compter dessus, c'est supposer J2 irrationnel.
              </p>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="mb-2">
                <strong>Premier round en classe</strong> (le jeu a été joué 2 fois). La théorie prédit 100 % pour chaque
                comportement d'équilibre :
              </p>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-[13px] font-semibold">
                    J2 joue <Act p={1}>{lab(biStrat)}</Act> <span className="font-normal">(test de H1)</span>
                  </div>
                  <div className="space-y-1">
                    <Bar label="prédit (ENPS)" value={grown ? 1 : 0} color="#c7d2fe" />
                    <Bar label="observé" value={grown ? OBS.bc : 0} color={COL[1]} />
                  </div>
                  <p className="mt-1 text-[13px] text-emerald-700">✓ H1 est largement vérifiée : les J2 sont rationnels.</p>
                </div>
                <div>
                  <div className="mb-1 text-[13px] font-semibold">
                    J1 joue <Act p={0}>{j1Choice}</Act> <span className="font-normal">(test de H2.1)</span>
                  </div>
                  <div className="space-y-1">
                    <Bar label="prédit (ENPS)" value={grown ? 1 : 0} color="#fecdd3" />
                    <Bar
                      label="observé"
                      value={grown ? OBS.droite : 0}
                      color={COL[0]}
                      note={
                        <span
                          className="absolute inset-y-[-3px] border-l-2 border-dashed border-foreground/60"
                          style={{ left: "50%" }}
                          title="50 % : pile ou face"
                        />
                      }
                    />
                    <p className="text-[12px] text-muted-foreground">Trait pointillé : 50 %, ce que donnerait un choix à pile ou face.</p>
                  </div>
                  <p className="mt-1 text-[13px] text-rose-700">
                    ✗ H2.1 n'est pas vérifiée : seulement {pctFr(OBS.droite)} jouent {j1Choice}, à peu près comme un
                    choix au hasard.
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[13px]">
                Conclusion du slide 28 : les étudiants sont en grande majorité <strong>rationnels</strong>, mais
                n'anticipent pas que les autres le sont.
              </p>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => go(Math.max(0, step - 1))}
          disabled={step === 0}
          className="rounded-lg border px-3 py-1.5 text-[13px] font-semibold disabled:opacity-40"
        >
          ◀ Retour
        </button>
        <button
          type="button"
          onClick={() => go(Math.min(STEPS.length - 1, step + 1))}
          disabled={step === STEPS.length - 1}
          className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-40"
        >
          Étape suivante ▶
        </button>
      </div>
    </InteractiveCard>
  );
}
