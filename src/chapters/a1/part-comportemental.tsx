/*
 * Chapitre A1 — approche comportementale (deck S2 « A1. Préférences et choix —
 * approche comportementale »). Sections : comporte, transaction, sunk, dotation,
 * framing, vs, nudge (ids à ne jamais changer : des pages d'examens y renvoient).
 */

import type { ReactNode } from "react";
import { Section } from "@/components/course/ChapterShell";
import { Callout } from "@/components/course/Callout";
import { M, MB } from "@/components/course/Math";
import { Quiz } from "@/components/course/Quiz";
import { TheoryRef } from "@/components/course/TheoryRef";
import { H4, Tbl, CardGrid } from "./ui";
import { PollAB2 } from "./anim/PollAB2";
import { TransactionRuler } from "./anim/TransactionRuler";
import { EndowmentBars } from "./anim/EndowmentBars";
import { FramingGrid } from "./anim/FramingGrid";

/* ------------------------------------------------------------------ */
/* Helpers locaux                                                      */
/* ------------------------------------------------------------------ */

/** Grande sous-partie à l'intérieur d'une section (h3). */
function PartTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 mt-10 border-b pb-1.5 text-xl font-bold tracking-tight">{children}</h3>
  );
}

/** Sous-titre d'exemple à l'intérieur d'une sous-partie (h4). */
function SubTitle({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-7 text-lg font-bold tracking-tight">{children}</h4>;
}

/** Liste numérotée 1-2-3-4 (la « réponse type en 4 étapes »). */
function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="my-3 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          >
            {i + 1}
          </span>
          <span className="min-w-0">{it}</span>
        </li>
      ))}
    </ol>
  );
}

/** Puces simples. */
function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="my-3 list-disc space-y-1.5 pl-6">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/** Rappel « version B », affiché en tête de chaque explication de sondage. */
function VersionB({ children }: { children: ReactNode }) {
  return (
    <p>
      <strong>La version B</strong>, posée à un <em>autre</em> groupe d'étudiants : {children}
    </p>
  );
}

/** Récapitulatif du slide 16 : tableau sur grand écran, cartes sur téléphone. */
const RECAP_HEAD = [
  "Expérience · biais",
  "Ce qui change (non pertinent)",
  "Vraie question (identique)",
  "Prédiction rationnelle",
  "Observé (A vs B)",
];
const RECAP_ROWS: ReactNode[][] = [
  [
    <><strong>Calculatrice</strong> · utilité de transaction</>,
    <>prix : 15 € ou 200 €</>,
    <>marcher 20 min pour 5 € ?</>,
    <>même %</>,
    <>82 % vs 25 % disent que ça vaut la peine</>,
  ],
  [
    <><strong>Bière</strong> · utilité de transaction</>,
    <>lieu d'achat : hôtel de luxe ou supermarché</>,
    <>combien pour cette bière fraîche ?</>,
    <>même prix moyen</>,
    <>4,72 € vs 3,61 €</>,
  ],
  [
    <><strong>Cinéma</strong> · coûts irrécupérables</>,
    <>place payée 14 € ou gratuite</>,
    <>1 h de soleil ou la fin d'un film ennuyeux ?</>,
    <>même % (un Econo part)</>,
    <>52 % vs 61 % quittent</>,
  ],
  [
    <><strong>Ticket</strong> · effet de dotation</>,
    <>recevoir 200 € ou recevoir le ticket</>,
    <>la finale ou 200 € ?</>,
    <>même % (DAP = DAA)</>,
    <>35 % achètent vs 50 % gardent</>,
  ],
  [
    <><strong>Antidote</strong> · effet de dotation</>,
    <>diminuer ou augmenter son risque de 1/1000</>,
    <>combien vaut 1/1000 de risque de décès ?</>,
    <>même montant</>,
    <>127 018 € vs 437 857 €</>,
  ],
  [
    <><strong>Maladie</strong> · framing</>,
    <>mots : « sauver » ou « mourir »</>,
    <>mesure sûre ou risquée ?</>,
    <>même % (A1 = B1)</>,
    <>100 % vs 39 % choisissent la mesure sûre</>,
  ],
];

function RecapDeviations() {
  return (
    <>
      <div className="hidden sm:block">
        <Tbl head={RECAP_HEAD} rows={RECAP_ROWS} />
      </div>
      <div className="my-5 space-y-3 sm:hidden">
        {RECAP_ROWS.map((r, i) => (
          <div key={i} className="rounded-xl border bg-card px-4 py-3 text-[15px] shadow-sm">
            <div className="font-semibold">{r[0]}</div>
            <dl className="mt-1.5 space-y-1 text-sm leading-relaxed">
              {RECAP_HEAD.slice(1).map((h, j) => (
                <div key={j}>
                  <dt className="inline font-semibold text-muted-foreground">{h} : </dt>
                  <dd className="inline">{r[j + 1]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

export function PartComportemental() {
  return (
    <>
      {/* ============================================================ */}
      {/* § 1 — L'idée centrale (slides 3, 10, 16)                     */}
      {/* ============================================================ */}
      <Section
        id="comporte"
        kicker="Approche comportementale · § 1"
        title="Économie comportementale : l'idée centrale"
      >
        <p>
          Jusqu'ici, l'<strong>approche rationnelle</strong> a décrit comment un preneur de
          décision parfaitement rationnel <em>devrait</em> choisir. L'
          <strong>approche comportementale</strong> pose une autre question : comment les vrais
          gens choisissent-ils <em>en pratique</em> ? Sa réponse :{" "}
          <strong>pas toujours de façon rationnelle — et leurs écarts sont prévisibles.</strong>{" "}
          Tout repose sur une seule phrase :
        </p>

        <p className="my-4 rounded-xl border-l-4 border-primary bg-accent/50 px-4 py-3 text-[1.1rem] font-semibold">
          Une décision rationnelle n'est pas influencée par des variables non-pertinentes.
        </p>

        <p>
          Décortiquons-la. Selon la théorie rationnelle, une variable est{" "}
          <strong>pertinente</strong> si elle influence les <strong>alternatives</strong> entre
          lesquelles tu choisis, c'est-à-dire ce que chaque option t'apporte réellement. Si une
          variable ne change pas le <strong>résultat économique</strong> de ta décision, elle
          n'est pas pertinente : un preneur de décision rationnel l'ignore complètement.
        </p>

        <Callout variant="definition" title="Variable non-pertinente">
          <p>
            Une information qui <strong>ne change pas les alternatives</strong> entre lesquelles
            tu choisis. Exemple à venir : que la calculatrice coûte 15 € ou 200 €, la question
            reste « est-ce que je marche 20 minutes pour économiser 5 € ? ». Le prix de la
            calculatrice est ici non pertinent.
          </p>
        </Callout>

        <p>
          La théorie rationnelle fait donc une <strong>prédiction</strong> : si deux situations ne
          diffèrent que par une variable non pertinente, les gens doivent décider de la même façon
          dans les deux. L'économie comportementale <strong>teste</strong> cette prédiction sur
          de vraies personnes… et observe des écarts.
        </p>

        <Callout variant="intuition" title="Pourquoi ces écarts sont intéressants">
          <p>
            Les variables non pertinentes influencent les décisions dans une direction qui{" "}
            <strong>n'est pas aléatoire</strong> : cette direction est{" "}
            <strong>prédictible</strong>. C'est ce qui transforme « les gens font des erreurs »
            (banal) en une vraie science : on peut anticiper l'erreur, la mesurer, et même
            concevoir des politiques qui en tiennent compte (voir § 7).
          </p>
        </Callout>

        <H4>Comment lire une expérience « version A / version B »</H4>
        <p>
          Toutes les expériences de cette partie ont la même structure. Si tu la comprends, tu
          comprends tout le raisonnement des slides.
        </p>

        <Callout variant="methode" title="Lire une expérience A/B en 4 points">
          <Steps
            items={[
              <>
                Chaque version est posée à un <strong>groupe différent</strong> : personne ne
                répond aux deux versions.
              </>,
              <>
                Les groupes sont <strong>tirés au hasard</strong>, donc ils sont{" "}
                <strong>semblables</strong> : ils contiennent la même proportion de personnes
                prêtes à marcher 20 minutes pour 5 €, de fans de foot, etc. (Comme deux poignées
                de bonbons tirées du même sac : elles contiennent à peu près la même part de
                bonbons rouges.)
              </>,
              <>
                Les deux versions ne diffèrent que par une variable non pertinente. Si les gens
                sont rationnels, on doit donc obtenir{" "}
                <strong>la même proportion</strong> (ou la même moyenne) dans les deux groupes.
              </>,
              <>
                Un <strong>écart systématique</strong> entre les deux versions montre que la
                variable non pertinente a influencé les décisions : c'est une{" "}
                <strong>déviation</strong> par rapport à la décision rationnelle.
              </>,
            ]}
          />
          <p>
            Attention : on ne dit jamais « une personne a changé d'avis » (personne n'a vu les
            deux versions). On compare <strong>deux groupes semblables</strong>, et c'est cette
            hypothèse qui permet de conclure.
          </p>
        </Callout>

        <Callout variant="examen" title="La réponse type en 4 étapes">
          <p>
            Question d'examen typique : « Pourquoi le plus fort (ou le plus faible) pourcentage
            dans la version A est-il une déviation par rapport à la prise de décision
            rationnelle ? » Réponds toujours dans cet ordre :
          </p>
          <Steps
            items={[
              <>
                <strong>La vraie question.</strong> Dis ce qui distingue vraiment les deux
                alternatives, et montre que c'est la même chose dans A et dans B.
              </>,
              <>
                <strong>La variable qui change, et pourquoi elle est non pertinente.</strong>{" "}
                Nomme ce qui diffère entre A et B, puis explique qu'elle n'influence pas les
                alternatives.
              </>,
              <>
                <strong>La prédiction rationnelle.</strong> Les groupes, tirés au hasard, sont
                semblables : des personnes rationnelles donneraient{" "}
                <strong>le même pourcentage</strong> dans A et dans B.
              </>,
              <>
                <strong>L'observation.</strong> Cite les chiffres : l'écart montre une déviation.
                Nomme le biais et la théorie alternative qui l'explique.
              </>,
            ]}
          />
          <p>
            Chaque sondage ci-dessous est corrigé avec ces 4 étapes : à la fin de la partie, tu
            sauras les réciter.
          </p>
        </Callout>

        <p>
          Ces déviations prévisibles ont été mises en lumière par trois moyens : des{" "}
          <strong>expériences de pensée</strong> (on pose une question et on observe les
          réponses), des <strong>expériences en laboratoire</strong> et des{" "}
          <strong>données empiriques</strong> (des données réelles). Les sondages des sections
          suivantes sont de vraies expériences de pensée : les chiffres révélés sont ceux des
          slides, obtenus auprès d'étudiants.{" "}
          <strong>À toi de jouer : vote avant de voir les résultats.</strong>
        </p>
      </Section>

      {/* ============================================================ */}
      {/* § 2 — L'utilité de transaction (slides 2-6)                   */}
      {/* ============================================================ */}
      <Section id="transaction" kicker="Approche comportementale · § 2" title="L'utilité de transaction">
        <p className="text-[1.15rem] leading-relaxed">
          Première déviation : le rôle du <strong>prix de référence</strong>. Lis bien la
          situation, puis vote honnêtement avant de voir le résultat.
        </p>

        <PollAB2
          scenario={
            <>
              Tu es sur le point d'acheter une <strong>calculatrice à 15 €</strong>. Le vendeur
              t'informe que tu peux trouver la <em>même</em> calculatrice pour{" "}
              <strong>10 € seulement</strong> dans un magasin situé à{" "}
              <strong>20 minutes à pied</strong>.
            </>
          }
          question="Prends-tu la peine de faire le trajet à pied jusqu'à ce magasin ?"
          options={[<>Oui, le déplacement vaut la peine</>, <>Non, ça ne vaut pas la peine</>]}
          measure="Part des étudiants qui disent que le déplacement vaut la peine"
          statA={{ version: "Version A · 15 € → 10 €", value: 82, label: "disent que ça vaut la peine" }}
          statB={{ version: "Version B · 200 € → 195 €", value: 25, label: "disent que ça vaut la peine" }}
          bias="utilité de transaction"
          explanation={
            <>
              <VersionB>
                même histoire, mais la calculatrice coûte <strong>200 €</strong> ici et{" "}
                <strong>195 €</strong> dans l'autre magasin.
              </VersionB>
              <Steps
                items={[
                  <>
                    <strong>Vraie question</strong> : dans les deux versions, la différence entre
                    les deux alternatives est la même : « es-tu prêt à marcher 20 minutes pour
                    5 € ? ».
                  </>,
                  <>
                    <strong>Ce qui change</strong> : le prix de la calculatrice (15 € ou 200 €).
                    Il est <strong>non pertinent</strong> : il ne change pas les alternatives
                    (marcher 20 minutes et garder 5 € de plus, ou ne pas marcher). Il n'est pas
                    rationnel de faire le trajet dans la version A mais pas dans la B.
                  </>,
                  <>
                    <strong>Prédiction rationnelle</strong> : les deux groupes, tirés au hasard,
                    contiennent la même proportion de personnes prêtes à marcher 20 minutes pour
                    5 €. On devrait donc obtenir le même pourcentage dans A et dans B.
                  </>,
                  <>
                    <strong>Observé</strong> : 82 % disent que le trajet vaut la peine dans la
                    version A, mais seulement 25 % dans la B. Les gens ne se comportent donc pas
                    de manière purement rationnelle : la théorie rationnelle décrit mal ce type
                    de décisions.
                  </>,
                ]}
              />
            </>
          }
        />

        <H4>La théorie alternative : la comptabilité mentale</H4>
        <p>
          Comment expliquer cet écart ? Par une théorie de la décision alternative, la{" "}
          <strong>comptabilité mentale</strong>. Selon elle, les décisions qui impliquent de
          l'argent mettent en jeu <strong>deux</strong> types d'utilité, et pas un seul :
        </p>

        <CardGrid
          items={[
            {
              title: "Utilité d'acquisition / de consommation",
              body: (
                <>
                  C'est le <strong>surplus du consommateur</strong> au sens de la théorie
                  rationnelle : l'utilité du bien obtenu <em>moins</em> son{" "}
                  <strong>coût d'opportunité</strong> (ce à quoi tu renonces en payant, c.-à-d.
                  ce que tu aurais pu t'offrir d'autre avec cet argent).
                </>
              ),
            },
            {
              title: "Utilité de transaction",
              body: (
                <>
                  C'est la différence entre le prix <strong>réellement payé</strong> et le prix
                  de <strong>référence</strong> (celui qu'on s'attendait à payer). Elle est
                  positive quand on paie moins que le prix de référence : faire « une bonne
                  affaire » fait plaisir <em>en soi</em>. La théorie rationnelle prescrit de ne
                  pas tenir compte de ce prix de référence.
                </>
              ),
            },
          ]}
        />

        <MB tex="\text{utilité de transaction} \;=\; p_{\text{réf}} - p_{\text{payé}}" />
        <p className="text-sm text-muted-foreground">
          <M tex="p_{\text{réf}}" /> : prix de référence (celui qu'on s'attendait à payer) ;{" "}
          <M tex="p_{\text{payé}}" /> : prix réellement payé. Le slide dit simplement « la
          différence entre » les deux prix ; on l'écrit dans ce sens pour qu'une bonne affaire
          compte positivement.
        </p>

        <Callout variant="exemple" title="Les deux utilités sur un exemple (chiffres illustratifs)">
          <p>
            Tu achètes une bière à <strong>4 €</strong>. Pour toi, elle vaut{" "}
            <strong>6 €</strong> (le maximum que tu accepterais de payer).
          </p>
          <Bullets
            items={[
              <>
                Utilité d'acquisition : 6 − 4 = <strong>2 €</strong>. C'est ce que la bière
                t'apporte en plus de l'argent dépensé.
              </>,
              <>
                Si tu t'attendais à la payer 5 € : utilité de transaction = 5 − 4 ={" "}
                <strong>+1 €</strong> → « bonne affaire ! ».
              </>,
              <>
                Si tu t'attendais à la payer 3 € : utilité de transaction = 3 − 4 ={" "}
                <strong>−1 €</strong> → « arnaque ! ».
              </>,
            ]}
          />
          <p>
            Un Econo (un preneur de décision parfaitement rationnel) ne regarde que les 2 €. Un
            Humain y ajoute le +1 € ou le −1 € de l'utilité de transaction.
          </p>
        </Callout>

        <H4>Pourquoi 82 % contre 25 % ?</H4>
        <p>
          Attention au piège : la différence « prix de référence − prix payé » vaut{" "}
          <strong>5 € dans les deux versions</strong> (15 − 10 = 5 et 200 − 195 = 5). L'écart ne
          vient donc pas du montant économisé. L'intuition (ce n'est pas une formule du slide) :
          un humain juge l'affaire <em>par rapport au prix de référence</em>.
        </p>
        <p>
          Sur 15 €, économiser 5 €, c'est <strong>un tiers du prix</strong> (33 %) : l'affaire
          paraît énorme. Sur 200 €, les mêmes 5 € ne font que <strong>2,5 %</strong> du prix :
          l'affaire paraît dérisoire. Pourtant, les 5 € dans ta poche sont rigoureusement
          identiques. Les règles graduées ci-dessous le montrent à l'échelle.
        </p>

        <TransactionRuler />

        <H4>Deuxième expérience : la bière sur la plage</H4>
        <p>Même mécanisme, autre expérience. Vote d'abord.</p>

        <PollAB2
          scenario={
            <>
              Tu es allongé·e sur une plage, il fait chaud et tu n'as que de l'eau glacée. Depuis
              une heure, tu rêves d'une bouteille bien fraîche de ta bière préférée. Un ami doit
              quitter la plage pour faire une course. Il propose de t'en rapporter une du{" "}
              <strong>seul endroit</strong> où on peut en acheter : un{" "}
              <strong>hôtel de luxe</strong>. Elle pourrait être chère, alors il te demande ton
              prix : il l'achètera si elle coûte <strong>au plus</strong> le montant que tu
              annonces ; si elle coûte plus, il ne l'achètera pas. Tu lui fais confiance, et il
              est impossible de marchander avec le barman.
            </>
          }
          question="Quel prix annonces-tu à ton ami ?"
          options={[<>Moins de 3 €</>, <>Entre 3 € et 4 €</>, <>Entre 4 € et 5 €</>, <>Plus de 5 €</>]}
          measure="Prix moyen annoncé par les étudiants"
          statA={{ version: "Version A · hôtel de luxe", value: 4.72, label: "prix moyen annoncé" }}
          statB={{ version: "Version B · petit supermarché", value: 3.61, label: "prix moyen annoncé" }}
          unit="€"
          max={6}
          bias="utilité de transaction (prix de référence)"
          explanation={
            <>
              <VersionB>
                même histoire, mais le seul endroit où acheter cette bière (sans négocier) est un{" "}
                <strong>petit supermarché</strong>.
              </VersionB>
              <p>
                Pourquoi annoncer ton <strong>vrai maximum</strong> ? Si tu annonces moins, tu
                risques de rater une bière que tu aurais volontiers payée. Si tu annonces plus,
                tu risques de la payer plus cher qu'elle ne vaut pour toi. Le prix annoncé mesure
                donc bien ce que tu es prêt·e à payer.
              </p>
              <Steps
                items={[
                  <>
                    <strong>Vraie question</strong> : « combien es-tu prêt à payer pour boire
                    cette bière bien fraîche ? », la même dans les deux versions.
                  </>,
                  <>
                    <strong>Ce qui change</strong> : le lieu d'achat (hôtel de luxe ou petit
                    supermarché). Il est <strong>non pertinent</strong> car il n'influence pas
                    les alternatives : même bière, même plage, même soif, et c'est ton ami qui
                    va l'acheter.
                  </>,
                  <>
                    <strong>Prédiction rationnelle</strong> : deux groupes semblables → le même
                    prix moyen annoncé dans A et dans B.
                  </>,
                  <>
                    <strong>Observé</strong> : 4,72 € (hôtel) contre 3,61 € (supermarché). La
                    comptabilité mentale explique cette déviation : le prix de référence anticipé
                    pour un hôtel de luxe est plus élevé que pour un petit supermarché. Payer
                    cher à l'hôtel donne donc une utilité de transaction moins négative : ça « fait
                    moins mal ».
                  </>,
                ]}
              />
            </>
          }
        />

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            Les commerçants essaient de faire <strong>monter le prix de référence</strong> que
            tu associes à leur produit (par exemple un « prix conseillé » ou un prix barré
            affiché à côté du prix de vente). Tu as alors l'impression de faire une affaire : ton
            utilité de transaction augmente, et leurs ventes aussi.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="qc1"
          question={
            <>
              Un magasin affiche : « Prix conseillé <s>80 €</s> — notre prix : 60 € ». Quel
              concept le commerçant utilise-t-il ?
            </>
          }
          options={[
            {
              text: <>L'utilité de transaction (il gonfle le prix de référence).</>,
              correct: true,
              explain: (
                <>
                  Oui : le « prix conseillé » de 80 € sert de prix de référence. Payer 60 € donne
                  l'impression d'une affaire de 20 € (utilité de transaction), ce qui fait vendre
                  — alors que, pour un Econo, seul compte ce que l'objet vaut pour lui par rapport
                  aux 60 € payés.
                </>
              ),
            },
            {
              text: <>Les coûts irrécupérables.</>,
              explain: (
                <>
                  Non : aucun montant n'a déjà été dépensé ici. Les coûts irrécupérables
                  concernent l'argent déjà perdu quoi qu'on décide (§ 3).
                </>
              ),
            },
            {
              text: <>L'effet de dotation.</>,
              explain: (
                <>
                  Non : l'effet de dotation compare le prix pour acheter et le prix pour revendre
                  un bien qu'on possède (§ 4). Ici, tu ne possèdes encore rien.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 3 — Les coûts irrécupérables (slides 7-8)                   */}
      {/* ============================================================ */}
      <Section id="sunk" kicker="Approche comportementale · § 3" title="Les coûts irrécupérables">
        <p className="text-[1.15rem] leading-relaxed">
          Deuxième déviation. Un coût <strong>irrécupérable</strong> (en anglais :{" "}
          <em>sunk cost</em>) est un montant déjà dépensé qu'on ne peut plus récupérer,{" "}
          <strong>quoi qu'on décide ensuite.</strong>
        </p>

        <PollAB2
          scenario={
            <>
              Tu as acheté une <strong>place de cinéma à 14 €</strong> pour voir un film dont la
              bande-annonce t'avait paru prometteuse. Tu y vas <strong>seul·e</strong>. Après 30
              minutes, il est clair que le film n'est pas terrible : il t'ennuie un peu. Il reste
              encore 1 heure, et tu te demandes s'il ne vaudrait pas mieux quitter la séance tout
              de suite pour profiter du beau temps.
            </>
          }
          question="Que décides-tu ?"
          options={[<>Je reste jusqu'au bout du film</>, <>Je quitte la séance</>]}
          measure="Part des étudiants qui décident de quitter la séance"
          statA={{ version: "Version A · place payée 14 €", value: 52, label: "quittent la séance" }}
          statB={{ version: "Version B · séance gratuite", value: 61, label: "quittent la séance" }}
          bias="coûts irrécupérables"
          explanation={
            <>
              <VersionB>
                même histoire, mais c'est une <strong>séance de projection gratuite</strong>.
              </VersionB>
              <Steps
                items={[
                  <>
                    <strong>Vraie question</strong> : « préfères-tu 1 heure de soleil ou la fin
                    d'un film ennuyeux ? », la même dans les deux versions. Tu y vas seul : aucune
                    raison de rester par politesse pour quelqu'un.
                  </>,
                  <>
                    <strong>Ce qui change</strong> : avoir payé 14 € ou non. C'est{" "}
                    <strong>non pertinent</strong> : que tu restes ou que tu partes, ces 14 € sont
                    perdus. Ils ne changent aucune des deux alternatives.
                  </>,
                  <>
                    <strong>Prédiction rationnelle</strong> : deux groupes semblables → le même
                    pourcentage de départs. Le slide va plus loin : regarder un film ennuyeux est
                    déplaisant, profiter du soleil est plaisant, donc un preneur de décision
                    rationnel quitte <em>systématiquement</em> la séance, dans les deux versions.
                  </>,
                  <>
                    <strong>Observé</strong> : 52 % quittent la séance quand la place a été payée,
                    contre 61 % quand elle était gratuite. Avoir payé « retient » des gens : les
                    humains ont tendance à tenir compte des coûts irrécupérables.
                  </>,
                ]}
              />
            </>
          }
        />

        <H4>Le raisonnement en un tableau</H4>
        <p>
          Compare les deux options <em>à partir de maintenant</em> :
        </p>
        <Tbl
          head={["Option", "Déjà dépensé", "Ce que tu obtiens dans l'heure qui vient"]}
          rows={[
            [<strong key="o">Rester</strong>, <>14 € (perdus)</>, <>1 h de film ennuyeux</>],
            [<strong key="o">Partir</strong>, <>14 € (perdus)</>, <>1 h de soleil</>],
          ]}
        />
        <p>
          Les 14 € apparaissent sur les <strong>deux</strong> lignes : ils ne peuvent pas faire
          pencher la balance. Seule la dernière colonne compte. C'est exactement ce que dit le
          slide : ce montant est perdu, il n'est donc pas rationnel de le prendre en compte dans
          sa décision.
        </p>

        <Callout variant="attention" title="Le réflexe à désamorcer">
          <p>
            « J'ai déjà investi, je ne vais pas abandonner maintenant » est un raisonnement{" "}
            <strong>irrationnel</strong>. Le passé est passé. La seule chose qui compte pour
            décider, c'est l'avenir : <em>à partir de maintenant</em>, qu'est-ce qui me rend la vie
            meilleure ? L'argent ou le temps déjà dépensés ne reviennent pas, quelle que soit la
            décision.
          </p>
        </Callout>

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            Un pays décide de continuer une <strong>guerre</strong> pour que ses soldats déjà
            morts ne soient pas morts « en vain ». Une équipe s'acharne sur un{" "}
            <strong>projet voué à l'échec</strong> pour ne pas perdre toutes les heures déjà
            investies. Dans les deux cas, on jette de nouvelles ressources après les anciennes,
            déjà perdues. La bonne question reste :{" "}
            <em>en repartant de zéro aujourd'hui, est-ce que je m'y lancerais ?</em>
          </p>
        </Callout>
      </Section>

      {/* ============================================================ */}
      {/* § 4 — L'effet de dotation (slides 9-13)                       */}
      {/* ============================================================ */}
      <Section id="dotation" kicker="Approche comportementale · § 4" title="L'effet de dotation">
        <p className="text-[1.15rem] leading-relaxed">
          Troisième déviation. L'<strong>effet de dotation</strong> : les humains demandent plus
          d'argent pour <strong>se séparer</strong> d'un bien qu'ils possèdent qu'ils ne seraient
          prêts à payer pour l'<strong>acheter</strong> s'ils ne le possédaient pas encore.
        </p>

        <PollAB2
          scenario={
            <>
              La finale de la Coupe du monde de football se joue dans deux mois à{" "}
              <strong>Bruxelles</strong>. Les tickets sont déjà sold-out. Ils{" "}
              <strong>ne sont pas nominatifs</strong> (n'importe qui peut les utiliser) et
              s'échangent en seconde main sur eBay pour <strong>200 €</strong>. Tu viens justement
              de recevoir <strong>200 € inattendus</strong>, à dépenser comme bon te semble.
            </>
          }
          question="Vas-tu acheter un de ces tickets, ou garder l'argent pour autre chose ?"
          options={[<>J'achète un ticket pour aller à la finale</>, <>Je garde les 200 € pour autre chose</>]}
          measure="Part des étudiants qui veulent le ticket : l'achètent (A) / le gardent (B)"
          statA={{
            version: "Version A · tu as reçu 200 €",
            value: 35,
            label: (
              <>
                ACHÈTENT le ticket (→ il vaut plus de 200 € pour eux)
                <br />
                <span className="text-xs">(65 % n'achètent pas : chiffre du slide)</span>
              </>
            ),
          }}
          statB={{
            version: "Version B · tu as reçu le ticket",
            value: 50,
            label: <>GARDENT le ticket (→ il vaut plus de 200 € pour eux)</>,
          }}
          bias="effet de dotation"
          explanation={
            <>
              <VersionB>
                même histoire, mais une entreprise privée t'a tiré·e au sort et t'a{" "}
                <strong>donné un ticket</strong> gratuitement. Le gardes-tu, ou le revends-tu
                200 € sur eBay ?
              </VersionB>
              <p>
                Remarque que les deux groupes sont <strong>aussi riches</strong> : l'un a reçu
                200 €, l'autre un ticket revendable 200 € (puisqu'il n'est pas nominatif). Seule
                différence : <em>ce qu'on possède</em> au départ.
              </p>
              <Steps
                items={[
                  <>
                    <strong>Vraie question</strong> : « préfères-tu assister à la finale ou avoir
                    200 € ? », la même dans les deux versions.
                  </>,
                  <>
                    <strong>Ce qui change</strong> : posséder l'argent (A) ou posséder le ticket
                    (B). La version A mesure la <strong>disposition à payer</strong> (pour
                    acheter le bien) ; la version B, la <strong>disposition à accepter</strong>{" "}
                    (pour le revendre). Pour la théorie rationnelle, posséder le bien ou non n'est
                    pas pertinent : les deux doivent être <strong>égales</strong>.
                  </>,
                  <>
                    <strong>Prédiction rationnelle</strong> : si elles sont égales, et puisque les
                    deux groupes sont semblables, la fraction qui veut <em>acheter</em> le ticket
                    doit être la même que la fraction qui veut le <em>garder</em>.
                  </>,
                  <>
                    <strong>Observé</strong> : seulement 35 % (= 100 − 65) l'achètent, contre 50 %
                    qui le gardent. La fraction voulant acheter est plus faible : la disposition à
                    payer est plus faible que la disposition à accepter. C'est l'effet de dotation.
                  </>,
                ]}
              />
            </>
          }
        />

        <Callout variant="examen" title="Piège : comparer la même mesure">
          <p>
            Le slide donne « 65 % ne vont <em>pas</em> acheter » (A) et « 50 % vont{" "}
            <em>garder</em> » (B). Ne compare pas 65 % et 50 % : ce sont des catégories
            opposées. Compare ceux qui <strong>veulent le ticket</strong> dans les deux versions :{" "}
            <strong>35 % achètent</strong> (100 − 65) contre <strong>50 % gardent</strong>. C'est
            pour ça que le slide parle du « plus <em>faible</em> pourcentage dans la version A ».
          </p>
        </Callout>

        <Callout variant="definition" title="Deux notions clés : DAP et DAA">
          <p>
            <strong>Disposition à payer</strong> (DAP) : le maximum que tu accepterais de{" "}
            <em>débourser</em> pour acquérir un bien que tu n'as pas.
          </p>
          <p>
            <strong>Disposition à accepter</strong> (DAA) : le minimum que tu exigerais pour{" "}
            <em>te séparer</em> d'un bien que tu possèdes.
          </p>
          <p>
            La théorie rationnelle implique <M tex="\text{DAP} = \text{DAA}" /> : le fait de
            posséder un bien ou non n'est pas pertinent pour évaluer son utilité d'acquisition /
            de consommation. En pratique, les humains ont tendance à avoir{" "}
            <M tex="\text{DAP} < \text{DAA}" /> : c'est cette différence qui est responsable de
            l'effet de dotation.
          </p>
        </Callout>

        <H4>Une variante frappante : l'antidote</H4>
        <p>Deux versions, posées à deux groupes différents :</p>
        <Bullets
          items={[
            <>
              <strong>Version A.</strong> En assistant à une séance, tu as été exposé·e à une
              maladie rare et mortelle : tu as <strong>1 risque sur 1000</strong> de l'avoir
              attrapée (mort douce et rapide la semaine prochaine). Il existe une seule dose
              d'antidote, vendue au plus offrant ; elle fait tomber ton risque à zéro. Combien
              es-tu prêt·e à payer ? Si tu n'as pas la somme, on te la prête{" "}
              <strong>sur 30 ans sans intérêts</strong>.
            </>,
            <>
              <strong>Version B.</strong> Des chercheurs d'un hôpital universitaire cherchent des
              volontaires pour marcher 5 minutes dans une pièce infectée par cette maladie :{" "}
              <strong>1 chance sur 1000</strong> de l'attraper, et il n'y a pas d'antidote. Quelle
              somme demanderais-tu pour participer ?
            </>,
          ]}
        />
        <p>
          Montants moyens annoncés : <strong>127&nbsp;018 €</strong> pour supprimer le risque
          (A), mais <strong>437&nbsp;857 €</strong> pour l'accepter (B), soit environ{" "}
          <strong>3,45 fois plus</strong> (437 857 / 127 018 ≈ 3,45).
        </p>
        <Bullets
          items={[
            <>
              Diminuer son risque de décès, c'est <strong>acheter</strong> un bien qu'on ne
              possède pas (des probabilités de vivre) : on mesure la{" "}
              <strong>disposition à payer</strong>.
            </>,
            <>
              Augmenter son risque de décès, c'est <strong>vendre</strong> un bien qu'on possède
              (des probabilités de vivre) : on mesure la <strong>disposition à accepter</strong>.
            </>,
            <>
              Il n'est pas rationnel d'être prêt à débourser beaucoup moins pour diminuer son
              risque d'un pour mille que ce qu'on exige pour l'augmenter d'un pour mille.
            </>,
          ]}
        />
        <p>
          Pourquoi le prêt sur 30 ans sans intérêts ? Sans lui, on pourrait dire « je ne peux pas
          payer plus que ce que j'ai sur mon compte ». Le prêt retire cette excuse : la différence
          entre 127 018 € et 437 857 € ne vient pas du budget.
        </p>

        <EndowmentBars />

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            L'effet de dotation implique que les gens ont tendance à vouloir vendre leur{" "}
            <strong>maison au-dessus de sa valeur de marché</strong>, même si cela implique de
            mettre beaucoup plus de temps pour la vendre.
          </p>
        </Callout>

        <Callout variant="intuition" title="Pour aller plus loin — vu en A3">
          <p>
            La théorie des perspectives (chapitre A3) offre une explication de l'effet de
            dotation : se séparer d'un bien est vécu comme une <em>perte</em>, et les pertes
            pèsent plus lourd que les gains de même taille.
          </p>
          <p>
            <TheoryRef chapter="a3" section="s10" />
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q8"
          question={
            <>
              Que prédit la <strong>théorie rationnelle</strong> sur la disposition à payer (DAP)
              et la disposition à accepter (DAA) pour un même bien ?
            </>
          }
          options={[
            {
              text: (
                <>
                  <M tex="\text{DAP} = \text{DAA}" /> : la valeur d'un bien ne dépend pas du fait
                  de le posséder.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui : pour un Econo, « combien vaut ce bien pour moi ? » a une seule réponse,
                  qu'il s'agisse de l'acheter ou de le vendre. C'est précisément cette égalité que
                  l'effet de dotation viole : en pratique on observe{" "}
                  <M tex="\text{DAP} < \text{DAA}" />.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\text{DAP} > \text{DAA}" /> : on paie toujours plus qu'on n'exige.
                </>
              ),
              explain: (
                <>
                  Non — et ce n'est ni la prédiction rationnelle, ni ce qu'on observe. En pratique
                  c'est l'inverse : on exige <em>plus</em> pour vendre qu'on n'accepterait de payer.
                </>
              ),
            },
            {
              text: (
                <>
                  <M tex="\text{DAP} < \text{DAA}" /> : posséder augmente la valeur.
                </>
              ),
              explain: (
                <>
                  C'est ce qu'on observe <em>en pratique</em> (l'effet de dotation), mais ce n'est
                  pas la <em>prédiction de la théorie rationnelle</em> — qui exige l'égalité.
                  Attention à bien distinguer prédiction théorique et observation.
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 5 — Le framing (slides 14-16)                               */}
      {/* ============================================================ */}
      <Section id="framing" kicker="Approche comportementale · § 5" title="Le framing">
        <p className="text-[1.15rem] leading-relaxed">
          Quatrième déviation. Le <strong>framing</strong> (ou « cadrage ») : les décisions sont
          influencées par la <strong>manière dont les alternatives sont décrites</strong>, même
          quand les options sont rigoureusement identiques.
        </p>

        <PollAB2
          scenario={
            <>
              <strong>600 personnes</strong> souffrent d'une maladie mortelle venue d'Asie, et tu
              dois choisir entre deux mesures. Les effets de la mesure A1 sont connus à
              l'avance ; ceux de la mesure A2 sont aléatoires.
            </>
          }
          question="Quelle mesure choisis-tu ?"
          options={[
            <>
              La mesure A1, qui permet de sauver exactement <strong>200 personnes</strong>
            </>,
            <>
              La mesure A2, qui a 1 chance sur 3 de sauver les 600 personnes, mais 2 chances sur
              3 de les laisser toutes mourir
            </>,
          ]}
          optionKeys={["A1", "A2"]}
          measure="Part des étudiants qui choisissent la mesure sûre (A1 / B1)"
          statA={{ version: "Version A · « sauver »", value: 100, label: "choisissent A1 (mesure sûre)" }}
          statB={{ version: "Version B · « mourir »", value: 39, label: "choisissent B1 (mesure sûre)" }}
          bias="framing (effet de cadrage)"
          explanation={
            <>
              <VersionB>
                même maladie, mais les mesures sont décrites en termes de <em>morts</em> :{" "}
                <strong>B1</strong> entraîne la mort d'exactement 400 personnes ;{" "}
                <strong>B2</strong> donne 1 chance sur 3 que personne ne meure et 2 chances sur 3
                que tous meurent.
              </VersionB>
              <Steps
                items={[
                  <>
                    <strong>Vraie question</strong> : les mesures sont identiques. Sauver 200
                    personnes sur 600, c'est en laisser mourir 400 : <strong>A1 = B1</strong>. Et
                    « 1/3 : tout le monde survit, 2/3 : tout le monde meurt » :{" "}
                    <strong>A2 = B2</strong>. La question est donc toujours « mesure sûre ou
                    mesure risquée ? ».
                  </>,
                  <>
                    <strong>Ce qui change</strong> : seulement les mots (« sauver » en A,
                    « mourir » en B). Ils sont non pertinents : ils n'influencent pas les
                    alternatives.
                  </>,
                  <>
                    <strong>Prédiction rationnelle</strong> : un preneur de décision rationnel ne
                    peut pas préférer A1 à A2 et, en même temps, B2 à B1. Avec deux groupes
                    semblables, le même pourcentage devrait choisir la mesure sûre.
                  </>,
                  <>
                    <strong>Observé</strong> : 100 % choisissent la mesure sûre quand elle est
                    décrite en « sauver », seulement 39 % quand elle est décrite en « mourir ».
                    C'est le framing.
                  </>,
                ]}
              />
            </>
          }
        />

        <Callout variant="intuition" title="Pourquoi ? Les mots mettent en avant certains aspects">
          <p>
            La différence principale entre les deux versions : en A, ce sont les aspects{" "}
            <strong>positifs</strong> de la mesure sûre qui sont mis en avant (« 200 personnes
            sauvées ») ; en B, ce sont les aspects <strong>négatifs</strong> de cette même mesure
            (« 400 personnes meurent »). Les mots employés font ressortir certains aspects et les
            rendent plus visibles au moment de prendre la décision.
          </p>
        </Callout>

        <FramingGrid />

        <Callout variant="exemple" title="Dans la vie réelle">
          <p>
            « Yaourt <strong>90 % sans matière grasse</strong> » se vend mieux que « contient{" "}
            <strong>10 % de matière grasse</strong> ». Une opération « avec{" "}
            <strong>95 % de réussite</strong> » rassure plus que « 5 % de mortalité ». Mêmes
            chiffres, perception inversée : chaque formulation met un autre aspect en avant.
          </p>
        </Callout>

        <Callout variant="intuition" title="Pour aller plus loin — vu en A3 (théorie des perspectives)">
          <p>
            Le chapitre A3 propose une autre lecture de cette expérience. Présentées comme des{" "}
            <strong>gains</strong> (« sauver 200 »), les options rendent prudent : on préfère le
            sûr. Présentées comme des <strong>pertes</strong> (« 400 meurent »), elles poussent
            à prendre des risques : on tente le pari pour éviter la perte certaine. Pour ce
            chapitre (A1), retiens d'abord l'explication du slide : les mots mettent en avant un
            aspect positif ou négatif.
          </p>
          <p>
            <TheoryRef chapter="a3" section="s10" />
          </p>
        </Callout>

        <H4>Récapitulatif : les déviations par rapport à la décision rationnelle</H4>
        <p>
          Les six expériences suivent toutes le même schéma : une variable{" "}
          <strong>non pertinente</strong> change entre les versions A et B, et elle influence
          pourtant les décisions, dans une direction qui n'est pas aléatoire mais{" "}
          <strong>prédictible</strong>.
        </p>
        <RecapDeviations />
      </Section>

      {/* ============================================================ */}
      {/* § 6 — Théorie rationnelle vs comportementale (slides 17-18)   */}
      {/* ============================================================ */}
      <Section id="vs" kicker="Approche comportementale · § 6" title="Rationnel vs comportemental">
        <p className="text-[1.15rem] leading-relaxed">
          Après ces quatre déviations, une question naturelle : faut-il <strong>jeter</strong> la
          théorie de la décision rationnelle ? La réponse est <strong>non</strong> — et il faut
          comprendre pourquoi.
        </p>

        <p>
          La clé : les deux théories ne font pas le même travail. L'économiste Richard Thaler
          (prix Nobel 2017) a coutume de dire que la théorie rationnelle définit le comportement
          des « <strong>Econos</strong> » (des <em>homo œconomicus</em> parfaits), et que la
          théorie comportementale documente le comportement des « <strong>Humains</strong> »
          (nous, avec nos biais). En anglais, Thaler écrit <em>Econs</em> et <em>Humans</em>.
        </p>

        <Bullets
          items={[
            <>
              <strong>Prescriptive</strong> = qui dit ce qu'il <em>faut</em> faire. La théorie
              rationnelle veut être un guide pour prendre des décisions cohérentes avec les
              objectifs qu'on se fixe.
            </>,
            <>
              <strong>Descriptive</strong> = qui décrit ce que les gens <em>font</em>. La théorie
              comportementale investigue comment les gens décident en pratique ; elle documente
              les biais systématiques et permet donc de prédire dans quelle direction les
              décisions dévieront des prescriptions de la théorie rationnelle.
            </>,
          ]}
        />

        <Callout variant="exemple" title="Le cinéma, vu par les deux théories">
          <p>
            <strong>Prescriptif</strong> (Econos) : « si tu t'ennuies et préfères le soleil,
            pars : les 14 € sont perdus de toute façon ». <strong>Descriptif</strong> (Humains) :
            « en pratique, avoir payé 14 € fait passer le taux de départ de 61 % à 52 % ».
          </p>
        </Callout>

        <Tbl
          head={["", "Théorie rationnelle", "Théorie comportementale"]}
          rows={[
            [
              <strong key="k">Nature</strong>,
              <>
                <strong>Prescriptive</strong>
                <br />
                comment on <em>devrait</em> décider
              </>,
              <>
                <strong>Descriptive</strong>
                <br />
                comment on décide <em>vraiment</em>
              </>,
            ],
            [
              <strong key="k">Question</strong>,
              <>Quelle décision est cohérente avec mes objectifs ?</>,
              <>Quels écarts systématiques observe-t-on en pratique ?</>,
            ],
            [
              <strong key="k">Repose sur</strong>,
              <>
                des propriétés définissant la rationalité (complétude, transitivité… vues dans
                l'approche rationnelle)
              </>,
              <>des expériences et des données empiriques</>,
            ],
            [
              <strong key="k">Décrit les… (Thaler)</strong>,
              <>Econos (homo œconomicus)</>,
              <>Humains (les vrais gens)</>,
            ],
            [
              <strong key="k">Sert à</strong>,
              <>guider les décisions importantes</>,
              <>
                documenter les biais systématiques et prédire dans quelle direction on dévie
                (base des nudges)
              </>,
            ],
          ]}
        />
        <p>
          <TheoryRef chapter="a1" section="pref" label="Revoir les propriétés des préférences" />
        </p>

        <p>
          Trois arguments pour <strong>garder</strong> la théorie rationnelle :
        </p>
        <ol className="my-3 list-decimal space-y-2 pl-6">
          <li>
            <strong>C'est un guide utile.</strong> Étant prescriptive, elle te dit comment prendre
            de bonnes décisions quand l'enjeu est important. Connaître les biais de l'approche
            comportementale, c'est justement pouvoir s'en protéger en revenant aux principes
            rationnels.
          </li>
          <li>
            <strong>C'est le benchmark.</strong> La théorie comportementale s'est développée
            contre ce point de référence : elle ne fait que documenter des{" "}
            <em>déviations par rapport à</em> la théorie rationnelle. Sans lui, le mot « biais »
            n'aurait aucun sens — un biais est un écart, il faut une norme pour le mesurer.
          </li>
          <li>
            <strong>C'est souvent une bonne approximation.</strong> Si les Humains ne se
            comportent pas comme des Econos dans certaines situations, il y a beaucoup de
            situations où le comportement des Econos est une bonne approximation du comportement
            humain.
          </li>
        </ol>

        <Callout variant="retiens" title="La bonne façon de voir les choses">
          <p>
            Les deux théories sont <strong>complémentaires</strong>, pas concurrentes. La
            rationnelle dit ce qui <em>devrait</em> être ; la comportementale dit ce qui{" "}
            <em>est</em>, et dans quelle direction on s'en écarte. On a besoin des deux.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q9"
          multi
          question={
            <>
              Pourquoi <strong>garde-t-on</strong> la théorie rationnelle malgré les biais observés ?
              (Coche toutes les bonnes raisons.)
            </>
          }
          options={[
            {
              text: <>Elle sert de guide prescriptif pour bien décider quand l'enjeu est important.</>,
              correct: true,
              explain: <>Oui — c'est l'argument « guide » : elle dit comment on <em>devrait</em> choisir.</>,
            },
            {
              text: (
                <>
                  Elle est le benchmark sans lequel le mot « biais » (= écart à une norme) n'aurait
                  aucun sens.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Oui — la théorie comportementale ne documente que des <em>déviations par rapport
                  à</em> la rationnelle.
                </>
              ),
            },
            {
              text: (
                <>
                  Elle reste une bonne approximation des comportements réels dans beaucoup de
                  situations.
                </>
              ),
              correct: true,
              explain: <>Oui — le comportement des Econos approxime souvent bien celui des Humains.</>,
            },
            {
              text: <>Elle décrit toujours fidèlement ce que font les vrais gens.</>,
              explain: (
                <>
                  Non — c'est exactement ce que les quatre déviations viennent de réfuter. La
                  théorie rationnelle est prescriptive, pas une description parfaite des Humains.
                </>
              ),
            },
          ]}
        />

        <Quiz
          scope="a1"
          id="qc2"
          question={
            <>
              « En pratique, avoir payé sa place fait passer le taux de départ de 61 % à 52 %. »
              Cette phrase est…
            </>
          }
          options={[
            {
              text: <>descriptive : elle dit ce que les Humains font.</>,
              correct: true,
              explain: (
                <>
                  Oui : elle rapporte une observation (ce qui <em>est</em>). C'est le travail de la
                  théorie comportementale.
                </>
              ),
            },
            {
              text: <>prescriptive : elle dit ce qu'il faut faire.</>,
              explain: (
                <>
                  Non : une phrase prescriptive dirait ce qu'on <em>devrait</em> faire, par
                  exemple « pars, les 14 € sont perdus de toute façon ».
                </>
              ),
            },
          ]}
        />
      </Section>

      {/* ============================================================ */}
      {/* § 7 — Hors du labo & politiques comportementales (19-23)      */}
      {/* ============================================================ */}
      <Section
        id="nudge"
        kicker="Approche comportementale · § 7"
        title="Hors du labo & politiques comportementales"
      >
        <p className="text-[1.15rem] leading-relaxed">
          L'économie comportementale n'est pas qu'un catalogue de curiosités de laboratoire. Son
          programme de recherche se décline en <strong>trois volets</strong>.
        </p>

        <CardGrid
          items={[
            {
              title: "1 · Documenter",
              body: (
                <>
                  Documenter des déviations <strong>systématiques</strong>. C'est ce qu'on a fait
                  aux § 2 à 5 (calculatrice, bière, cinéma, ticket, antidote, maladie).
                </>
              ),
            },
            {
              title: "2 · Montrer l'impact réel",
              body: (
                <>
                  Montrer empiriquement que ces déviations influencent des aspects importants de
                  l'économie réelle (comme les prix de marché).
                </>
              ),
            },
            {
              title: "3 · Politiques comportementales",
              body: (
                <>
                  Proposer des politiques publiques « comportementales » pour aider les individus
                  à éviter les erreurs liées à leurs biais (le <strong>nudging</strong>).
                </>
              ),
            },
          ]}
        />

        <p>
          Voici trois exemples réels. Les deux premiers montrent que les déviations existent aussi{" "}
          <strong>en dehors du laboratoire</strong>, dans de vraies décisions (volet 2). Le
          troisième est une <strong>politique publique comportementale</strong> (volet 3).
        </p>

        <PartTitle>En dehors du laboratoire (volet 2)</PartTitle>

        <SubTitle>
          Les taximans de New York{" "}
          <span className="text-sm font-normal text-muted-foreground">(Camerer, 1997)</span>
        </SubTitle>
        <p>
          Un taximan décide chaque jour combien d'heures il travaille. Certains jours, la demande
          est forte (par exemple quand il pleut) : il attend peu entre deux courses, donc son{" "}
          <strong>revenu par heure travaillée augmente</strong>. Question : travaille-t-il plus
          ou moins d'heures ces jours-là ?
        </p>
        <p>
          <strong>Ce que ferait un Econo.</strong> Un seul jour bien payé ne change presque rien à
          son revenu du mois. Pour gagner le plus possible avec le même nombre total d'heures, il
          a donc intérêt à placer ses heures là où chaque heure rapporte le plus : travailler{" "}
          <em>plus</em> les jours bien payés, moins les jours creux. Dans le même esprit, en
          laboratoire, <strong>94 % des étudiants choisissent de travailler plus d'heures
          lorsque le salaire est plus élevé</strong>.
        </p>
        <p>
          <strong>Ce que montrent les données.</strong> Selon les données rassemblées par
          Camerer, les taximans ont tendance à travailler <strong>moins</strong> d'heures les
          jours où leur salaire horaire est élevé.
        </p>
        <p>
          <strong>L'explication : l'heuristique de la cible de revenus.</strong> Une{" "}
          <strong>heuristique</strong> est une <em>règle de décision simple</em>. Allouer
          optimalement son temps de travail sur un mois est compliqué. Pour s'assurer de gagner
          le montant mensuel dont ils estiment avoir besoin, les taximans suivraient une règle
          simple : <em>continuer à travailler jusqu'à avoir gagné un certain montant
          journalier</em>. Conséquence : ils travaillent plus longtemps les jours où le salaire
          horaire est faible, et moins longtemps les jours où il est élevé — l'inverse de l'Econo.
        </p>

        <Callout variant="exemple" title="Ce que coûte la règle (chiffres illustratifs)">
          <p>
            Cible : 200 € par jour. Un jour creux paie 20 €/h, un jour de pluie 40 €/h.
          </p>
          <Tbl
            head={["", "Jour creux (20 €/h)", "Jour de pluie (40 €/h)", "Total"]}
            rows={[
              [
                <strong key="r">Cible de revenus</strong>,
                <>10 h → 200 €</>,
                <>5 h → 200 €</>,
                <>15 h → 400 €</>,
              ],
              [
                <strong key="r">Heures inversées</strong>,
                <>5 h → 100 €</>,
                <>10 h → 400 €</>,
                <>15 h → 500 €</>,
              ],
            ]}
          />
          <p>
            Avec le même nombre total d'heures (15 h), placer les heures les jours bien payés
            rapporte 100 € de plus. La règle simple évite un calcul compliqué, mais elle coûte de
            l'argent.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="qc3"
          question={
            <>
              Un jour où son salaire horaire est <strong>faible</strong>, un taximan qui suit
              l'heuristique de la cible de revenus travaille…
            </>
          }
          options={[
            {
              text: <>plus longtemps.</>,
              correct: true,
              explain: (
                <>
                  Oui : chaque heure rapporte peu, donc il lui faut plus d'heures pour atteindre
                  son montant journalier. Un Econo ferait l'inverse (moins d'heures les jours
                  creux, plus les jours bien payés).
                </>
              ),
            },
            {
              text: <>moins longtemps.</>,
              explain: (
                <>
                  Non : c'est ce que ferait un Econo. Le taximan à cible de revenus s'arrête quand
                  il a gagné son montant ; un jour mal payé, il lui faut plus longtemps.
                </>
              ),
            },
            {
              text: <>autant que les autres jours.</>,
              explain: (
                <>
                  Non : la règle fixe un <em>montant</em> journalier, pas un nombre d'heures. Le
                  nombre d'heures s'adapte donc au salaire horaire.
                </>
              ),
            },
          ]}
        />

        <SubTitle>
          Les crèches de Haïfa{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (Levitt &amp; Dubner, <em>Freakonomics</em>)
          </span>
        </SubTitle>
        <p>
          Les parents devaient reprendre leur enfant <strong>pour 16h00 au plus tard</strong>,
          mais arrivaient souvent en retard. Pour diminuer les retards, les crèches ont instauré
          une <strong>pénalité monétaire</strong> (une amende) pour tout retard.
        </p>
        <p>
          <strong>Ce que prédit un Econo.</strong> L'amende rend l'alternative « arriver en
          retard » moins désirable qu'avant. Elle ne peut donc que <em>diminuer</em> les retards.
        </p>
        <p>
          <strong>Ce qui s'est passé.</strong> Le nombre de retards a <strong>augmenté</strong>.
          L'explication avancée : monétiser les retards a changé la façon dont les parents voient
          la décision. Sans pénalité, la décision est de nature <strong>morale</strong> : il faut
          arriver à l'heure, comme les règles l'exigent. Avec la pénalité, elle devient de nature{" "}
          <strong>économique</strong> : « suis-je prêt à payer la pénalité pour reprendre mon
          enfant plus tard ? »
        </p>
        <Callout variant="retiens" title="La leçon de Haïfa">
          <p>
            Les décisions humaines sont affectées par des{" "}
            <strong>considérations non matérielles</strong> (ici, morales). De plus, instaurer
            des <strong>incitants matériels</strong> peut <strong>évincer</strong> les{" "}
            <strong>incitants intrinsèques</strong>.
          </p>
          <Bullets
            items={[
              <>
                <strong>Incitant</strong> : ce qui pousse à agir.
              </>,
              <>
                <strong>Matériel</strong> : de l'argent (ici, l'amende).
              </>,
              <>
                <strong>Intrinsèque</strong> : qui vient de soi (la morale, le sens du devoir).
              </>,
              <>
                <strong>Évincer</strong> : chasser, prendre la place de.
              </>,
            ]}
          />
          <p>
            Attention : l'amende de Haïfa n'est <strong>pas un nudge</strong>. Elle change les
            options (le retard devient payant) : c'est un incitant matériel classique, qui s'est
            retourné contre son objectif.
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="q10"
          question={
            <>
              Dans les crèches de Haïfa, instaurer une amende pour les retards a{" "}
              <strong>augmenté</strong> les retards. Pourquoi ?
            </>
          }
          options={[
            {
              text: <>Parce que l'amende était trop faible pour dissuader qui que ce soit.</>,
              explain: (
                <>
                  Ce n'est pas l'explication retenue : même une petite amende aurait dû, pour un
                  Econo, réduire au moins un peu les retards — pas les <em>augmenter</em>.
                </>
              ),
            },
            {
              text: (
                <>
                  Parce que l'incitant matériel (l'amende) a évincé l'incitant intrinsèque (moral) :
                  payer a remplacé la culpabilité de faire attendre.
                </>
              ),
              correct: true,
              explain: (
                <>
                  Exactement : en monétisant le retard, on a transformé une décision morale
                  (« il faut arriver à l'heure ») en une décision économique (« suis-je prêt à
                  payer pour arriver plus tard ? »). Le frein moral a disparu.
                </>
              ),
            },
            {
              text: <>Parce que les parents n'étaient pas informés de l'amende.</>,
              explain: (
                <>
                  Ils étaient bien informés — c'est justement en <em>connaissant</em> l'amende que
                  leur regard sur le retard a changé.
                </>
              ),
            },
          ]}
        />

        <PartTitle>Les politiques publiques comportementales — nudging (volet 3)</PartTitle>

        <SubTitle>
          Le subside EITC{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (Bhargava &amp; Manoli, 2015)
          </span>
        </SubTitle>
        <p>
          L'EITC est un des plus grands programmes sociaux des États-Unis. C'est un{" "}
          <strong>subside qui dépend des revenus du travail</strong> : les citoyens qui gagnent
          peu sont éligibles et, <strong>plus ils gagnent, plus leur subside est élevé</strong>.
          Contrairement à une aide classique, il récompense donc le fait de travailler.
        </p>
        <p>
          <strong>Le problème : le « non take-up ».</strong> Un certain nombre de ménages
          éligibles ne réclament pas leur subside. Les explications traditionnelles — le coût de
          la démarche, le manque d'information, la stigmatisation (la honte de demander une aide)
          — ne peuvent pas expliquer l'ampleur du phénomène.
        </p>
        <p>
          <strong>L'expérience.</strong> D'habitude, les ménages qui ne réclament pas reçoivent du
          fisc américain un <strong>unique courrier de rappel</strong> (ils sont éligibles, voici
          la procédure). L'expérience porte sur ceux qui n'ont toujours rien réclamé malgré ce
          rappel : on leur envoie un <strong>deuxième courrier</strong>.
        </p>
        <Bullets
          items={[
            <>
              <strong>Groupe de contrôle</strong> : le deuxième courrier est identique au premier.
            </>,
            <>
              <strong>Groupes de traitement</strong> : le deuxième courrier est modifié, de
              différentes manières. Objectif : voir quelles modifications poussent le plus à
              réclamer.
            </>,
          ]}
        />
        <Tbl
          head={["Deuxième courrier", "Ont réclamé leur subside"]}
          rows={[
            [
              <>
                <strong>Contrôle</strong> : identique au premier
              </>,
              <>
                <strong>22 %</strong> — la 1<sup>re</sup> surprise : une lettre contenant la même
                information a suffi à les convaincre
              </>,
            ],
            [
              <>
                <strong>Traitement « montant »</strong> : mentionne l'ordre de grandeur du montant
                qu'ils peuvent réclamer
              </>,
              <>
                <strong>30 %</strong>, soit 8 points de pourcentage de plus que le contrôle (30 −
                22) → le traitement <strong>le plus efficace</strong>
              </>,
            ],
            [
              <>
                <strong>Traitement « présentation simplifiée »</strong> : sections « En résumé »,
                « Ce que vous devez faire », « Étapes suivantes »…
              </>,
              <>
                le <strong>2<sup>e</sup> traitement le plus efficace</strong> (le slide ne donne
                pas son pourcentage)
              </>,
            ],
          ]}
        />
        <Callout variant="examen" title="Piège classique">
          <p>
            Le traitement le plus efficace est la <strong>mention du montant</strong> (30 %), pas
            la lettre simplifiée, qui n'arrive qu'en 2<sup>e</sup> position. Et « 8 % de plus »
            (le mot du slide) signifie ici 8 points de pourcentage : on passe de 22 % à 30 %.
          </p>
        </Callout>
        <p>
          <strong>Conclusion du slide :</strong> il est possible de lutter contre des erreurs
          comportementales (ne pas réclamer son subside) en utilisant des mesures
          comportementales (simplifier le traitement de l'information, etc.).
        </p>

        <Callout variant="intuition" title="L'idée du nudge">
          <p>
            Un <em>nudge</em> (« coup de pouce ») ne <em>force</em> personne et ne change pas les
            options : il modifie seulement la <strong>présentation</strong> de l'information (ou
            le <strong>réglage par défaut</strong>) pour aider les gens à faire le choix qui les
            arrange. Puisque les biais sont prévisibles, on peut concevoir l'environnement de
            décision pour les contrer en douceur. Des trois exemples de cette section,{" "}
            <strong>seul l'EITC est un nudge</strong>.
          </p>
          <p>
            <TheoryRef chapter="a2" section="politiques" label="Changer l'option par défaut" />
          </p>
        </Callout>

        <Quiz
          scope="a1"
          id="qc4"
          question={<>Dans l'expérience EITC, quel deuxième courrier a été le plus efficace ?</>}
          options={[
            {
              text: <>Celui qui mentionnait l'ordre de grandeur du montant à réclamer.</>,
              correct: true,
              explain: (
                <>
                  Oui : 30 % ont réclamé, contre 22 % dans le groupe de contrôle (+8 points de
                  pourcentage).
                </>
              ),
            },
            {
              text: <>Celui qui présentait l'information de manière simplifiée.</>,
              explain: (
                <>
                  Non : c'est le 2<sup>e</sup> traitement le plus efficace. Le plus efficace est la
                  mention du montant.
                </>
              ),
            },
            {
              text: <>Le courrier identique au premier.</>,
              explain: (
                <>
                  Non : c'est le groupe de contrôle (22 %). Surprise quand même : renvoyer la même
                  information a suffi à convaincre 22 % des ménages.
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
