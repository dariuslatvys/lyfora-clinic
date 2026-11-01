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

/** Higher-level “what are these medicines for?” buckets. */
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
}: {
  s: PharmaSnpRow;
  category: string;
  locale: "lt" | "en";
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
  selected: boolean;
}) {
  const c: RiskColour = s.colour || "grey";
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
          label={
            s.colour ? colourLabels[s.colour] : colourLabels.grey
          }
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
  const [tab, setTab] = useState<"risk" | "purpose">("risk");

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            risk: "By risk",
            purpose: "By medicine use",
            riskBlurb:
              "Genes sorted by your personal risk colour — highest first.",
            purposeBlurb:
              "Same genes grouped by what the related medicines are typically taken for.",
            focus: "Focus",
            empty: "No genes in this group.",
          }
        : {
            risk: "Pagal riziką",
            purpose: "Pagal vaistų paskirtį",
            riskBlurb:
              "Genai surikiuoti pagal jūsų rizikos spalvą — didžiausia rizika pirmiausia.",
            purposeBlurb:
              "Tie patys genai sugrupuoti pagal tai, nuo ko paprastai geriami susiję vaistai.",
            focus: "Sritis",
            empty: "Šioje grupėje genų nėra.",
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

  const byPurpose = useMemo(() => {
    const map = new Map<
      string,
      {
        purpose: (typeof PURPOSE_ORDER)[number];
        groups: Map<
          string,
          { label: string; rows: PharmaSnpRow[] }
        >;
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

    // sort rows inside each subcategory by risk
    for (const bucket of map.values()) {
      for (const g of bucket.groups.values()) {
        g.rows.sort(
          (a, b) =>
            colourRank(b.colour) - colourRank(a.colour) ||
            a.gene.localeCompare(b.gene)
        );
      }
    }

    return PURPOSE_ORDER.map((p) => map.get(p.id)).filter(
      Boolean
    ) as {
      purpose: (typeof PURPOSE_ORDER)[number];
      groups: Map<string, { label: string; rows: PharmaSnpRow[] }>;
    }[];
  }, [snps, locale]);

  return (
    <div className="pharma-genes">
      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={locale === "en" ? "Pharmacogenetics views" : "Farmakogenetikos vaizdai"}
      >
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
          className={tab === "purpose" ? "on" : undefined}
          aria-selected={tab === "purpose"}
          onClick={() => setTab("purpose")}
        >
          {copy.purpose}
          <span className="visits-tab-count">{byPurpose.length}</span>
        </button>
      </div>

      <p className="small muted mt-2 mb-3">
        {tab === "risk" ? copy.riskBlurb : copy.purposeBlurb}
      </p>

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
            />
          ))}
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {byPurpose.map(({ purpose, groups }) => {
            const total = [...groups.values()].reduce(
              (n, g) => n + g.rows.length,
              0
            );
            return (
              <section key={purpose.id} className="pharma-purpose-block">
                <div className="pharma-purpose-head">
                  <div>
                    <h4 className="pharma-purpose-title">
                      {locale === "en" ? purpose.en : purpose.lt}
                    </h4>
                    <p className="small muted m-0 mt-1">
                      {locale === "en" ? purpose.blurbEn : purpose.blurbLt}
                    </p>
                  </div>
                  <span className="pill plain c-acc">{total}</span>
                </div>
                <div className="stack mt-3" style={{ gap: 12 }}>
                  {[...groups.entries()].map(([subKey, g]) => (
                    <div key={subKey}>
                      <p className="eyebrow mb-2">
                        {copy.focus}: {g.label}
                      </p>
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
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          {!byPurpose.length ? (
            <div className="empty">{copy.empty}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
