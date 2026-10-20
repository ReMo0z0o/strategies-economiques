/*
 * UltimatumLab — B2 § 6 · le jeu de l'ultimatum joué en classe (slides 28-30).
 *
 * Données du slide 30 (sous-groupe de 29 étudiants, rôle de proposeur) : part
 * des proposeurs et payoff moyen de chaque répartition. Le « taux
 * d'acceptation implicite » = payoff moyen ÷ montant gardé est un calcul
 * DÉRIVÉ (étiqueté comme tel). L'ENPS (7,1) est CALCULÉ par backward
 * induction sur le jeu complet (répartitions entières de 8).
 */
import { useMemo, useState } from "react";
import { InteractiveCard } from "@/components/course/Interactive";
import { GT_COLORS, GameTreeSvg, backwardInduction, leaf, node, type GTGame } from "@/chapters/shared/gametree";
import { fmt } from "@/chapters/shared/plot";
import { cn } from "@/lib/utils";

const TOTAL = 8;
/** slide 30 : [montant gardé, part des proposeurs, payoff moyen] */
const DATA: Array<{ keep: number; share: number; avg: number }> = [
  { keep: 8, share: 0, avg: 0.28 },
  { keep: 7, share: 0.28, avg: 3.14 },
  { keep: 6, share: 0.28, avg: 3.31 },
  { keep: 5, share: 0.31, avg: 4.48 },
  { keep: 4, share: 0.13, avg: 4 },
];
/** slide 29 */
const REFUSE_POSITIVE = 0.62;

const PLAYERS = [
  { name: "Proposeur", color: GT_COLORS[0] },
  { name: "Véto-eur", color: GT_COLORS[1] },
];
const split = (keep: number) => `(${keep},${TOTAL - keep})`;
const pct0 = (v: number) => `${fmt(v * 100, 0)} %`;
/** taux d'acceptation implicite : une décimale sous 10 % (0,28 ÷ 8 = 3,5 %), entier au-delà */
const pctRate = (v: number) => `${fmt(v * 100, v < 0.1 ? 1 : 0)} %`;

/** jeu complet : le proposeur choisit ce qu'il garde (8, 7, …, 0), le véto-eur refuse ou accepte */
const FULL: GTGame = {
  players: PLAYERS,
  root: node(
    "p",
    0,
    Array.from({ length: TOTAL + 1 }, (_, i) => {
      const keep = TOTAL - i;
      return [
        split(keep),
        node(`v${keep}`, 1, [
          ["Refuser", leaf(`r${keep}`, [0, 0])],
          ["Accepter", leaf(`a${keep}`, [keep, TOTAL - keep])],
        ]),
      ] as [string, ReturnType<typeof node>];
    }),
  ),
};

export function UltimatumLab() {
  const steps = useMemo(() => backwardInduction(FULL), []);
  const root = steps.find((s) => s.nodeId === "p")!;
  const enpsKeep = root.options[root.chosen].value[0];
  const minGive = TOTAL - enpsKeep;
  const rows = DATA.map((d) => ({ ...d, rate: d.avg / d.keep }));
  const best = rows.reduce((a, b) => (b.avg > a.avg ? b : a));
  const [sel, setSel] = useState(best.keep);
  const r = rows.find((x) => x.keep === sel)!;
  const give = TOTAL - sel;
  const vStep = steps.find((s) => s.nodeId === `v${sel}`)!;
  const indiff = vStep.best.length > 1;

  const mini: GTGame = useMemo(
    () => ({
      players: PLAYERS,
      root: node("p", 0, [
        [
          split(sel),
          node("v", 1, [
            ["Accepter", leaf("a", [sel, TOTAL - sel])],
            ["Refuser", leaf("r", [0, 0])],
          ]),
        ],
      ]),
    }),
    [sel],
  );
  const accepts = vStep.options[vStep.chosen].action === "Accepter";

  return (
    <InteractiveCard
      title="L'ultimatum en classe : la théorie face aux vrais véto-eurs"
      subtitle={
        <>
          Slides 28-30. Il faut partager {TOTAL}. Le proposeur choisit une répartition (garde ; donne) ; le véto-eur
          l'accepte (elle est appliquée) ou la refuse (les deux reçoivent 0). Clique sur une répartition.
        </>
      }
      footer={
        <>
          la barre pâle est ce que le proposeur garderait si sa proposition était toujours acceptée ; la barre pleine est
          ce qu'elle lui a vraiment rapporté en moyenne. Plus il donne, plus la barre pleine « remplit » la pâle : le
          proposeur arbitre entre garder beaucoup et proposer un montant acceptable.
        </>
      }
    >
      {/* H1 violée chez les véto-eurs */}
      <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-[13.5px] leading-relaxed">
        <div className="flex items-baseline gap-2">
          <span className="whitespace-nowrap text-2xl font-extrabold tabular-nums text-rose-700">{pct0(REFUSE_POSITIVE)}</span>
          <span>
            des étudiants véto-eurs ont <strong>refusé</strong> une répartition qui leur donnait un montant positif.
          </span>
        </div>
        <p className="mt-1">
          H1 prédit le contraire : mieux vaut quelque chose que rien. Les véto-eurs ne regardent donc pas que leur
          montant. Explication de G. Kirchsteiger (1994) : ils <strong>envient</strong> le plus grand montant du
          proposeur. Autre explication (plus en phase avec d'autres versions du jeu) : ils trouvent une répartition trop
          inégale <strong>injuste</strong> et sont prêts à <strong>punir</strong> le proposeur, même si punir leur coûte.
        </p>
      </div>

      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* répartitions */}
        <div>
          <div className="mb-1 text-[13px] font-semibold">
            Rôle de proposeur, sous-groupe de 29 étudiants (slide 30)
          </div>
          <div className="space-y-1.5">
            {rows.map((d) => {
              const on = d.keep === sel;
              const isEnps = d.keep === enpsKeep;
              const isBest = d.keep === best.keep;
              return (
                <button
                  key={d.keep}
                  type="button"
                  onClick={() => setSel(d.keep)}
                  aria-pressed={on}
                  className={cn(
                    "block w-full rounded-lg border px-2 py-1.5 text-left transition-colors",
                    on ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/60",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
                    <span className="font-mono text-[14px] font-bold">{split(d.keep)}</span>
                    {isEnps ? (
                      <span className="rounded-full bg-amber-100 px-1.5 text-[11.5px] font-bold text-amber-800">ENPS</span>
                    ) : null}
                    {isBest ? (
                      <span className="rounded-full bg-emerald-100 px-1.5 text-[11.5px] font-bold text-emerald-800">
                        meilleure en classe
                      </span>
                    ) : null}
                    <span className="ml-auto text-muted-foreground">
                      proposée par <strong className="text-foreground">{pct0(d.share)}</strong>
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-[1fr_3rem] items-center gap-2">
                    <div className="relative h-4 rounded bg-muted" aria-hidden>
                      <div
                        className="absolute inset-y-0 left-0 rounded"
                        style={{ width: `${(d.keep / TOTAL) * 100}%`, background: GT_COLORS[0], opacity: 0.18 }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 rounded transition-[width] duration-500"
                        style={{ width: `${(d.avg / TOTAL) * 100}%`, background: GT_COLORS[0] }}
                      />
                    </div>
                    <span className="text-right text-[13px] font-bold tabular-nums">{fmt(d.avg)}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {fmt(d.avg)} ÷ {d.keep} (gardé si acceptée) ⇒ acceptée ≈ {pctRate(d.rate)} du temps*
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            * Calculé à partir du slide : taux d'acceptation implicite = payoff moyen ÷ montant gardé (si la proposition
            est refusée, le proposeur reçoit 0). Ce n'est pas un chiffre du slide.
          </p>
        </div>

        {/* répartition choisie */}
        <div className="rounded-xl border bg-muted/30 p-3 text-[14px] leading-relaxed" aria-live="polite">
          <GameTreeSvg
            game={mini}
            chosen={indiff ? {} : { v: accepts ? 0 : 1 }}
            dimOthers
            ariaLabel={`Le proposeur propose ${split(sel)} ; le véto-eur accepte (${sel} ; ${give}) ou refuse (0 ; 0).`}
            maxW={260}
          />
          <p className="mt-2">
            <strong>Proposition {split(sel)}</strong> : le proposeur garde {sel} et donne {give}.
          </p>
          <p className="mt-1">
            {indiff ? (
              <>
                Le véto-eur reçoit 0 dans les deux cas : il n'a rien à perdre en refusant (indifférent). C'est pourquoi
                le slide retient le plus petit montant <em>positif</em>.
              </>
            ) : (
              <>
                H1 : le véto-eur accepte, car {give} &gt; 0. Le proposeur devrait donc recevoir {sel}.
              </>
            )}
          </p>
          <p className="mt-1">
            En classe, elle lui a rapporté en moyenne <strong>{fmt(r.avg)}</strong>, soit {fmt(r.avg)} ÷ {sel} ≈{" "}
            <strong>{pctRate(r.rate)}</strong> du montant gardé : comme si ≈ {pctRate(r.rate)} des véto-eurs l'acceptaient
            (calcul dérivé).
          </p>
        </div>
      </div>

      {/* ENPS vs meilleure proposition observée */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-[13.5px] leading-relaxed">
          <div className="font-bold text-amber-900">
            ENPS : {split(enpsKeep)} <span className="font-normal">(H1 + H2.1)</span>
          </div>
          <p className="mt-1">
            Anticipant que le véto-eur accepte n'importe quel montant positif, le proposeur lui donne le plus petit
            montant positif ({minGive}) et garde {enpsKeep}. En classe : payoff moyen{" "}
            {fmt(rows.find((x) => x.keep === enpsKeep)!.avg)} seulement.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-[13.5px] leading-relaxed">
          <div className="font-bold text-emerald-900">
            Meilleure en classe : {split(best.keep)} <span className="font-normal">(payoff moyen {fmt(best.avg)})</span>
          </div>
          <p className="mt-1">
            Les véto-eurs n'étant souvent pas rationnels, les proposeurs avaient peu de raisons de satisfaire H2.1 :
            donner {TOTAL - best.keep} au lieu de {minGive} rapportait {fmt(best.avg)} au lieu de{" "}
            {fmt(rows.find((x) => x.keep === enpsKeep)!.avg)}.
          </p>
        </div>
      </div>
    </InteractiveCard>
  );
}
