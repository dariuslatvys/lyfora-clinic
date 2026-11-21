"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  colourRank,
  type RiskColour,
} from "@/lib/health/colours";
import { pharmaSubcategoryLabel } from "@/lib/health/pharma-plain";
import {
  pharmaActiveSubstances,
  pharmaActivesForRows,
} from "@/lib/health/pharma-actives";
import { MedToleranceCheck } from "@/components/patient/med-tolerance-check";

export type PharmaSnpRow = {
  gene: string;
  snpId: string;
  allele1: string | null;
  allele2: string | null;
  matchCount: number;
  colour: RiskColour | null;
  genotypeAvailable: boolean;
  subcategory: string | null;
};

/** Higher-level medicine-effect buckets (what the related drugs are for). */
const PURPOSE_ORDER: {
  id: string;
  match: RegExp;
  lt: string;
  en: string;
  blurbLt: string;
  blurbEn: string;
}[] = [
  {
    id: "cholesterol",
    match: /statin|myopath/i,
    lt: "Cholesterolis / lipidai",
    en: "Cholesterol / lipids",
    blurbLt: "Statinai ir kiti lipidų vaistai.",
    blurbEn: "Statins and related lipid medicines.",
  },
  {
    id: "clotting",
    match: /antiplatelet|coumarin|warfarin|phenytoin|clopidogrel/i,
    lt: "Kraujo krešėjimas",
    en: "Blood clotting",
    blurbLt: "Antiagregantai, varfarinas ir susiję vaistai.",
    blurbEn: "Antiplatelets, warfarin and related medicines.",
  },
  {
    id: "pain",
    match: /opioid|cyp2d6|codeine|tramadol/i,
    lt: "Skausmas",
    en: "Pain",
    blurbLt: "Opioidiniai skausmo vaistai.",
    blurbEn: "Opioid pain medicines.",
  },
  {
    id: "cancer",
    match: /fluoropyrimid|irinotecan|thiopurine|ugt1a1|dpyd/i,
    lt: "Onkologija / chemoterapija",
    en: "Oncology / chemotherapy",
    blurbLt: "Chemoterapijos ir kai kurie imunosupresantai.",
    blurbEn: "Chemotherapy and some immunosuppressants.",
  },
  {
    id: "infection",
    match: /aminoglycoside|efavirenz|nat2|g6pd|abacavir/i,
    lt: "Infekcijos / antibiotikai / antivirusiniai",
    en: "Infections / antibiotics / antivirals",
    blurbLt: "Antibiotikai, ŽIV ir susiję vaistai.",
    blurbEn: "Antibiotics, HIV and related medicines.",
  },
  {
    id: "neuro",
    match: /valproate|carbamazepine|epileps|aria|alzheimer/i,
    lt: "Neurologija / psichiatrija",
    en: "Neurology / psychiatry",
    blurbLt: "Epilepsijos, nuotaikos ir Alzheimerio vaistai.",
    blurbEn: "Epilepsy, mood and Alzheimer medicines.",
  },
  {
    id: "transplant",
    match: /tacrolimus|transplant/i,
    lt: "Transplantacija",
    en: "Transplant",
    blurbLt: "Imunosupresija po transplantacijos.",
    blurbEn: "Immunosuppression after transplant.",
  },
  {
    id: "allergy",
    match: /hla|hypersensitiv/i,
    lt: "Padidėjęs jautrumas / alergija",
    en: "Hypersensitivity / allergy",
    blurbLt: "Vaistai su didesne alerginės reakcijos rizika.",
    blurbEn: "Medicines with higher hypersensitivity risk.",
  },
  {
    id: "anaesthesia",
    match: /anaesth|anesthes|apnoea|apnea/i,
    lt: "Anestezija",
    en: "Anaesthesia",
    blurbLt: "Kai kurios anestezijos priemonės.",
    blurbEn: "Some anaesthetic medicines.",
  },
  {
    id: "other",
    match: /./,
    lt: "Kitos vaistų grupės",
    en: "Other medicine groups",
    blurbLt: "Kitos farmakogenetikos sritys.",
    blurbEn: "Other pharmacogenetic focus areas.",
  },
];

function purposeFor(subcategory: string | null | undefined) {
  const hay = subcategory || "";
  for (const p of PURPOSE_ORDER) {
    if (p.id === "other") continue;
    if (p.match.test(hay)) return p;
  }
  return PURPOSE_ORDER[PURPOSE_ORDER.length - 1];
}

function hasReaction(rows: PharmaSnpRow[]) {
  return rows.some((r) => colourRank(r.colour) >= 3);
}

function maxReactionRank(rows: PharmaSnpRow[]) {
  return rows.reduce((m, r) => Math.max(m, colourRank(r.colour)), 0);
}

function Pill({
  colour,
  label,
}: {
  colour: RiskColour;
  label: string;
}) {
  return <span className={`pill ${PILL_CLASS[colour]}`}>{label}</span>;
}

function SnpRow({
  s,
  category,
  locale,
  colourLabels,
  awaitingDna,
  selected,
  showActives,
}: {
  s: PharmaSnpRow;
  category: string;
  locale: "lt" | "en";
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
  selected: boolean;
  showActives?: boolean;
}) {
  const c: RiskColour = s.colour || "grey";
  const actives = showActives
    ? pharmaActiveSubstances(s.subcategory, locale)
    : [];
  return (
    <Link
      href={`/patient/snp/${encodeURIComponent(s.snpId)}?cat=${category}`}
      className={`block rounded-md border px-3 py-2 text-[var(--ink)] no-underline transition hover:border-[var(--accent)] ${
        selected ? "border-[var(--accent)]" : "border-[var(--line)]"
      }`}
      style={{
        borderLeft: `4px solid ${COLOUR_HEX[c]}`,
        background: selected
          ? "var(--accent-soft)"
          : `linear-gradient(90deg, ${COLOUR_SOFT[c]}, var(--surface-raised) 55%)`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-medium text-[var(--ink)]">
            {s.gene}{" "}
            <span className="text-[var(--ink-soft)] font-normal">
              {s.snpId.split("__")[0]}
            </span>
          </span>
          {actives.length ? (
            <p className="text-xs text-[var(--ink)] m-0 mt-1 font-medium">
              {locale === "en"
                ? "Active substance with sensitivity: "
                : "Veiklioji medžiaga su jautrumu: "}
              <span className="text-[var(--accent-ink,var(--ink))]">
                {actives.join(", ")}
              </span>
            </p>
          ) : null}
          <p className="text-xs text-[var(--ink-soft)] m-0 mt-1">
            {s.genotypeAvailable
              ? `${s.allele1}/${s.allele2} · ${s.matchCount} ${
                  s.matchCount === 1
                    ? locale === "en"
                      ? "risk allele"
                      : "rizikos alelis"
                    : locale === "en"
                      ? "risk alleles"
                      : "rizikos aleliai"
                }`
              : awaitingDna}
          </p>
        </div>
        <Pill
          colour={c}
          label={s.colour ? colourLabels[s.colour] : colourLabels.grey}
        />
      </div>
    </Link>
  );
}

export function PharmaGenesTabs({
  locale,
  category,
  snps,
  selectedSnpId,
  colourLabels,
  awaitingDna,
}: {
  locale: "lt" | "en";
  category: string;
  snps: PharmaSnpRow[];
  selectedSnpId?: string;
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
}) {
  const [tab, setTab] = useState<"effect" | "risk" | "tolerance">("effect");

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            effect: "By medicine effect",
            risk: "By risk",
            tolerance: "Medicine tolerance check",
            effectBlurb:
              "Cholesterol / lipid medicines are listed first, then other groups (reaction signals before quiet groups). Each group names the active substance you may be sensitive to.",
            riskBlurb:
              "Genes sorted by your personal risk colour — highest first.",
            toleranceBlurb:
              "Instant check: enter one or more medicines and press Check.",
            focus: "Focus",
            empty: "No genes in this group.",
            withReaction: "Reaction signal",
            noReaction: "No reaction signal",
            activesLabel: "Active substance with sensitivity",
          }
        : {
            effect: "Pagal vaistų poveikį",
            risk: "Pagal riziką",
            tolerance: "Vaistų toleravimo tikrinimas",
            effectBlurb:
              "Pirma — cholesterolio / lipidų vaistai, toliau kitos grupės (su reakcijos signalu prieš be signalo). Kiekvienoje grupėje matote veikliąją medžiagą, kuriai yra jautrumas.",
            riskBlurb:
              "Genai surikiuoti pagal jūsų rizikos spalvą — didžiausia rizika pirmiausia.",
            toleranceBlurb:
              "Momentinis tikrinimas: įveskite vieną ar kelis vaistus ir paspauskite „Tikrinti“.",
            focus: "Sritis",
            empty: "Šioje grupėje genų nėra.",
            withReaction: "Yra reakcijos signalas",
            noReaction: "Reakcijos signalo nėra",
            activesLabel: "Veiklioji medžiaga su jautrumu",
          },
    [locale]
  );

  const byRisk = useMemo(
    () =>
      [...snps].sort((a, b) => {
        const ra = colourRank(a.colour);
        const rb = colourRank(b.colour);
        if (rb !== ra) return rb - ra;
        return a.gene.localeCompare(b.gene) || a.snpId.localeCompare(b.snpId);
      }),
    [snps]
  );

  const byEffect = useMemo(() => {
    const map = new Map<
      string,
      {
        purpose: (typeof PURPOSE_ORDER)[number];
        groups: Map<string, { label: string; rows: PharmaSnpRow[] }>;
      }
    >();

    for (const s of snps) {
      const purpose = purposeFor(s.subcategory);
      const subKey = s.subcategory?.trim() || "_other";
      const label =
        pharmaSubcategoryLabel(s.subcategory, locale) ||
        (locale === "en" ? "Other focus area" : "Kita sritis");
      if (!map.has(purpose.id)) {
        map.set(purpose.id, { purpose, groups: new Map() });
      }
      const bucket = map.get(purpose.id)!;
      if (!bucket.groups.has(subKey)) {
        bucket.groups.set(subKey, { label, rows: [] });
      }
      bucket.groups.get(subKey)!.rows.push(s);
    }

    for (const bucket of map.values()) {
      for (const g of bucket.groups.values()) {
        g.rows.sort(
          (a, b) =>
            colourRank(b.colour) - colourRank(a.colour) ||
            a.gene.localeCompare(b.gene)
        );
      }
    }

    const buckets = PURPOSE_ORDER.map((p) => map.get(p.id)).filter(
      Boolean
    ) as {
      purpose: (typeof PURPOSE_ORDER)[number];
      groups: Map<string, { label: string; rows: PharmaSnpRow[] }>;
    }[];

    // Cholesterol / lipids always first; then reaction-signal groups, then quiet ones.
    return [...buckets].sort((a, b) => {
      if (a.purpose.id === "cholesterol") return -1;
      if (b.purpose.id === "cholesterol") return 1;
      const aRows = [...a.groups.values()].flatMap((g) => g.rows);
      const bRows = [...b.groups.values()].flatMap((g) => g.rows);
      const aHit = hasReaction(aRows) ? 1 : 0;
      const bHit = hasReaction(bRows) ? 1 : 0;
      if (bHit !== aHit) return bHit - aHit;
      return maxReactionRank(bRows) - maxReactionRank(aRows);
    });
  }, [snps, locale]);

  return (
    <div className="pharma-genes">
      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={
          locale === "en" ? "Pharmacogenetics views" : "Farmakogenetikos vaizdai"
        }
      >
        <button
          type="button"
          role="tab"
          className={tab === "effect" ? "on" : undefined}
          aria-selected={tab === "effect"}
          onClick={() => setTab("effect")}
        >
          {copy.effect}
          <span className="visits-tab-count">{byEffect.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "risk" ? "on" : undefined}
          aria-selected={tab === "risk"}
          onClick={() => setTab("risk")}
        >
          {copy.risk}
          <span className="visits-tab-count">{snps.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "tolerance" ? "on" : undefined}
          aria-selected={tab === "tolerance"}
          onClick={() => setTab("tolerance")}
        >
          {copy.tolerance}
        </button>
      </div>

      {tab !== "tolerance" ? (
        <p className="small muted mt-2 mb-3">
          {tab === "effect" ? copy.effectBlurb : copy.riskBlurb}
        </p>
      ) : (
        <div className="mt-2" />
      )}

      {tab === "risk" ? (
        <div className="space-y-2">
          {byRisk.map((s) => (
            <SnpRow
              key={`${s.gene}-${s.snpId}`}
              s={s}
              category={category}
              locale={locale}
              colourLabels={colourLabels}
              awaitingDna={awaitingDna}
              selected={selectedSnpId === s.snpId}
              showActives={colourRank(s.colour) >= 2}
            />
          ))}
        </div>
      ) : tab === "effect" ? (
        <div className="stack" style={{ gap: 16 }}>
          {byEffect.map(({ purpose, groups }) => {
            const allRows = [...groups.values()].flatMap((g) => g.rows);
            const total = allRows.length;
            const reacted = hasReaction(allRows);
            // Only name actives tied to a yellow/orange/red sensitivity signal.
            const sensitiveRows = allRows.filter(
              (r) => colourRank(r.colour) >= 2
            );
            const actives = pharmaActivesForRows(
              sensitiveRows.length ? sensitiveRows : [],
              locale
            );
            const sortedGroups = [...groups.entries()].sort(([, a], [, b]) => {
              const aHit = hasReaction(a.rows) ? 1 : 0;
              const bHit = hasReaction(b.rows) ? 1 : 0;
              if (bHit !== aHit) return bHit - aHit;
              return maxReactionRank(b.rows) - maxReactionRank(a.rows);
            });
            return (
              <section
                key={purpose.id}
                className={`pharma-purpose-block ${
                  reacted ? "has-reaction" : "no-reaction"
                }`}
              >
                <div className="pharma-purpose-head">
                  <div>
                    <h4 className="pharma-purpose-title">
                      {locale === "en" ? purpose.en : purpose.lt}
                    </h4>
                    <p className="small muted m-0 mt-1">
                      {locale === "en" ? purpose.blurbEn : purpose.blurbLt}
                    </p>
                    {actives.length ? (
                      <p className="pharma-actives m-0 mt-2">
                        <span className="pharma-actives-label">
                          {copy.activesLabel}:
                        </span>{" "}
                        <strong>{actives.join(", ")}</strong>
                      </p>
                    ) : null}
                  </div>
                  <div className="pharma-purpose-badges">
                    <span
                      className={`pill plain ${
                        reacted ? "c-orange" : "c-none"
                      }`}
                    >
                      {reacted ? copy.withReaction : copy.noReaction}
                    </span>
                    <span className="pill plain c-acc">{total}</span>
                  </div>
                </div>
                <div className="stack mt-3" style={{ gap: 12 }}>
                  {sortedGroups.map(([subKey, g]) => {
                    const focusActives = pharmaActivesForRows(
                      g.rows.filter((r) => colourRank(r.colour) >= 2),
                      locale
                    );
                    return (
                      <div key={subKey}>
                        <p className="eyebrow mb-1">
                          {copy.focus}: {g.label}
                        </p>
                        {focusActives.length ? (
                          <p className="pharma-actives pharma-actives-focus m-0 mb-2">
                            <span className="pharma-actives-label">
                              {copy.activesLabel}:
                            </span>{" "}
                            <strong>{focusActives.join(", ")}</strong>
                          </p>
                        ) : null}
                        <div className="space-y-2">
                          {g.rows.map((s) => (
                            <SnpRow
                              key={`${s.gene}-${s.snpId}`}
                              s={s}
                              category={category}
                              locale={locale}
                              colourLabels={colourLabels}
                              awaitingDna={awaitingDna}
                              selected={selectedSnpId === s.snpId}
                              showActives={colourRank(s.colour) >= 2}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {!byEffect.length ? (
            <div className="empty">{copy.empty}</div>
          ) : null}
        </div>
      ) : (
        <MedToleranceCheck
          locale={locale}
          snps={snps}
          colourLabels={colourLabels}
          awaitingDna={awaitingDna}
        />
      )}
    </div>
  );
}
