"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useEffect } from "react";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  colourRank,
  type RiskColour,
} from "@/lib/health/colours";
import {
  formatMedicationLabel,
  searchMedications,
  type MedicationSuggestion,
} from "@/lib/health/medications";
import {
  mapDrugToPharmaFocus,
  parseMedicationLabel,
  type DrugLookupInput,
} from "@/lib/health/drug-pharma-map";
import { pharmaSubcategoryLabel } from "@/lib/health/pharma-plain";
import type { PharmaSnpRow } from "@/components/patient/pharma-genes-tabs";

export type SelectedDrug = DrugLookupInput & {
  key: string;
  display: string;
};

function drugKey(d: DrugLookupInput) {
  return `${d.brandName || ""}|${d.activeSubstance || ""}|${d.label || ""}`.toLowerCase();
}

export function MedToleranceCheck({
  locale,
  snps,
  colourLabels,
  awaitingDna,
  categoryHref = "/patient/digital-twin/pharmacogenetics",
  presetLabels,
}: {
  locale: "lt" | "en";
  snps: PharmaSnpRow[];
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
  categoryHref?: string;
  /** Optional pre-selected labels (e.g. from health-card meds). */
  presetLabels?: string[];
}) {
  const [selected, setSelected] = useState<SelectedDrug[]>(() =>
    (presetLabels || []).map((label) => {
      const parsed = parseMedicationLabel(label);
      return { ...parsed, key: drugKey(parsed), display: label };
    })
  );
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = useMemo(() => searchMedications(draft, 12), [draft]);

  useEffect(() => {
    setActive(0);
  }, [draft]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function addDrug(input: DrugLookupInput, display: string) {
    const key = drugKey(input);
    if (selected.some((s) => s.key === key)) return;
    setSelected((prev) => [...prev, { ...input, key, display }]);
    setDraft("");
    setOpen(false);
  }

  function addSuggestion(s: MedicationSuggestion) {
    addDrug(
      {
        brandName: s.brandName,
        activeSubstance: s.activeSubstance,
        atcCode: s.atcCode,
        categoryName: s.categoryName,
        label: formatMedicationLabel(s),
      },
      formatMedicationLabel(s)
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[active]) {
        addSuggestion(suggestions[active]!);
      } else if (draft.trim()) {
        const parsed = parseMedicationLabel(draft.trim());
        addDrug(parsed, draft.trim());
      }
      return;
    }
    if (e.key === "Escape") setOpen(false);
  }

  const copy =
    locale === "en"
      ? {
          blurb:
            "Pick prescribed medicines from the catalogue. The system checks whether your DNA has risk alleles linked to those drugs — the reverse of browsing genes first.",
          hint: "Type brand or substance (e.g. Atoris, Plavix, Warfarin)…",
          emptyPick: "Add at least one medicine to see genetic tolerance signals.",
          noPgx:
            "No pharmacogenetic panel link found for this medicine in the portal catalogue. That does not mean it is risk-free — ask your clinician.",
          riskTitle: "Genes with risk alleles for this medicine",
          clearTitle: "Related genes — no elevated risk alleles in your sample",
          awaitingTitle: "Related genes — DNA result not available",
          alleles: (n: number) =>
            n === 1 ? "1 risk allele" : `${n} risk alleles`,
          focus: "Focus",
          openGene: "Open gene",
          remove: "Remove",
        }
      : {
          blurb:
            "Pasirinkite paskirtus vaistus iš klasifikatoriaus. Sistema parodo, ar jūsų DNR turi rizikos alelių, susijusių su tais vaistais — atvirkščiai nei naršant nuo genų.",
          hint: "Įveskite pavadinimą ar veikliąją medžiagą (pvz. Atoris, Plavix, Warfarin)…",
          emptyPick:
            "Pridėkite bent vieną vaistą, kad pamatytumėte genetinio toleravimo signalus.",
          noPgx:
            "Šiam vaistui portalo farmakogenetikos skydelyje nuorodos nerasta. Tai nereiškia, kad rizika lygi nuliui — pasitarkite su gydytoju.",
          riskTitle: "Genai su rizikos aleliais šiam vaistui",
          clearTitle: "Susiję genai — jūsų mėginyje nėra padidėjusių rizikos alelių",
          awaitingTitle: "Susiję genai — DNR rezultato nėra",
          alleles: (n: number) =>
            n === 1 ? "1 rizikos alelis" : `${n} rizikos aleliai`,
          focus: "Sritis",
          openGene: "Atidaryti geną",
          remove: "Pašalinti",
        };

  const results = useMemo(() => {
    return selected.map((drug) => {
      const focuses = mapDrugToPharmaFocus(drug);
      const related = snps.filter((s) =>
        focuses.some(
          (f) =>
            (s.subcategory || "").trim().toLowerCase() ===
            f.subcategory.toLowerCase()
        )
      );
      const withRisk = related
        .filter((s) => (s.matchCount || 0) > 0)
        .sort(
          (a, b) =>
            colourRank(b.colour) - colourRank(a.colour) ||
            b.matchCount - a.matchCount
        );
      const clear = related
        .filter((s) => s.genotypeAvailable && (s.matchCount || 0) === 0)
        .sort((a, b) => a.gene.localeCompare(b.gene));
      const awaiting = related.filter((s) => !s.genotypeAvailable);
      return { drug, focuses, withRisk, clear, awaiting };
    });
  }, [selected, snps]);

  return (
    <div className="stack med-tolerance" style={{ gap: 14 }}>
      <p className="small muted m-0">{copy.blurb}</p>

      <div className="stack med-picker" style={{ gap: 8 }} ref={rootRef}>
        <div className="q-chips">
          {selected.map((s) => (
            <button
              key={s.key}
              type="button"
              className="chip on"
              aria-label={`${copy.remove} ${s.display}`}
              onClick={() =>
                setSelected((prev) => prev.filter((x) => x.key !== s.key))
              }
            >
              {s.display} ×
            </button>
          ))}
        </div>
        <div className="med-picker-field">
          <input
            value={draft}
            placeholder={copy.hint}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            role="combobox"
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {open && draft.trim().length >= 2 ? (
            <div className="med-suggest" id={listId} role="listbox">
              {suggestions.length ? (
                suggestions.map((s, i) => (
                  <button
                    key={`${s.brandName}-${s.atcCode}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={i === active ? "on" : undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => addSuggestion(s)}
                  >
                    <span className="med-suggest-main">
                      <b>{s.brandName}</b>
                      {s.activeSubstance ? <em>{s.activeSubstance}</em> : null}
                    </span>
                    <span className="med-suggest-meta">
                      {s.categoryName}
                      {s.form ? ` · ${s.form}` : ""}
                    </span>
                  </button>
                ))
              ) : (
                <div className="med-suggest-empty">
                  {locale === "en"
                    ? `No catalogue match — press Enter to check “${draft.trim()}”`
                    : `Kataloge nerasta — Enter tikrins „${draft.trim()}“`}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {!selected.length ? (
        <div className="empty">{copy.emptyPick}</div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {results.map(({ drug, focuses, withRisk, clear, awaiting }) => (
            <section
              key={drug.key}
              className="rounded-md border border-[var(--line)] bg-[var(--surface-raised)] p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="m-0 text-base font-semibold text-[var(--ink)]">
                    {drug.display}
                  </h4>
                  {drug.activeSubstance ? (
                    <p className="xs muted m-0 mt-1">{drug.activeSubstance}</p>
                  ) : null}
                </div>
                {focuses.length ? (
                  <div className="hc-link-row">
                    {focuses.map((f) => (
                      <span key={f.subcategory} className="pill plain c-acc">
                        {pharmaSubcategoryLabel(f.subcategory, locale) ||
                          f.subcategory}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {!focuses.length ? (
                <p className="small muted mt-3 mb-0">{copy.noPgx}</p>
              ) : (
                <div className="stack mt-3" style={{ gap: 12 }}>
                  {focuses.map((f) => (
                    <p key={f.subcategory} className="small m-0 text-[var(--ink-soft)]">
                      <span className="eyebrow">{copy.focus}: </span>
                      {locale === "en" ? f.reasonEn : f.reasonLt}
                    </p>
                  ))}

                  {withRisk.length ? (
                    <div>
                      <p className="eyebrow mb-2">{copy.riskTitle}</p>
                      <div className="space-y-2">
                        {withRisk.map((s) => (
                          <GeneHit
                            key={`${s.gene}-${s.snpId}`}
                            s={s}
                            locale={locale}
                            colourLabels={colourLabels}
                            awaitingDna={awaitingDna}
                            allelesLabel={copy.alleles(s.matchCount)}
                            openLabel={copy.openGene}
                            categoryHref={categoryHref}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {clear.length ? (
                    <div>
                      <p className="eyebrow mb-2">{copy.clearTitle}</p>
                      <div className="space-y-2">
                        {clear.map((s) => (
                          <GeneHit
                            key={`${s.gene}-${s.snpId}`}
                            s={s}
                            locale={locale}
                            colourLabels={colourLabels}
                            awaitingDna={awaitingDna}
                            allelesLabel={copy.alleles(0)}
                            openLabel={copy.openGene}
                            categoryHref={categoryHref}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {awaiting.length ? (
                    <div>
                      <p className="eyebrow mb-2">{copy.awaitingTitle}</p>
                      <div className="space-y-2">
                        {awaiting.map((s) => (
                          <GeneHit
                            key={`${s.gene}-${s.snpId}`}
                            s={s}
                            locale={locale}
                            colourLabels={colourLabels}
                            awaitingDna={awaitingDna}
                            allelesLabel={awaitingDna}
                            openLabel={copy.openGene}
                            categoryHref={categoryHref}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!withRisk.length && !clear.length && !awaiting.length ? (
                    <p className="small muted m-0">
                      {locale === "en"
                        ? "Focus area matched, but no genotype rows are loaded for these genes yet."
                        : "Sritis sutampa, bet šių genų genotipų eilučių dar nėra."}
                    </p>
                  ) : null}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function GeneHit({
  s,
  locale,
  colourLabels,
  awaitingDna,
  allelesLabel,
  openLabel,
  categoryHref,
}: {
  s: PharmaSnpRow;
  locale: "lt" | "en";
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
  allelesLabel: string;
  openLabel: string;
  categoryHref: string;
}) {
  const c: RiskColour = s.colour || "grey";
  const href = `/patient/snp/${encodeURIComponent(s.snpId)}?cat=pharmacogenetics`;
  return (
    <Link
      href={href}
      className="block rounded-md border border-[var(--line)] px-3 py-2 text-[var(--ink)] no-underline transition hover:border-[var(--accent)]"
      style={{
        borderLeft: `4px solid ${COLOUR_HEX[c]}`,
        background: `linear-gradient(90deg, ${COLOUR_SOFT[c]}, var(--surface-raised) 55%)`,
      }}
      title={openLabel}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-medium">
            {s.gene}{" "}
            <span className="font-normal text-[var(--ink-soft)]">
              {s.snpId.split("__")[0]}
            </span>
          </span>
          <p className="text-xs text-[var(--ink-soft)] m-0 mt-1">
            {s.genotypeAvailable
              ? `${s.allele1}/${s.allele2} · ${allelesLabel}`
              : awaitingDna}
            {" · "}
            <span className="text-[var(--accent)]">
              {locale === "en" ? "from" : "iš"} {categoryHref.split("/").pop()}
            </span>
          </p>
        </div>
        <span className={`pill ${PILL_CLASS[c]}`}>
          {s.colour ? colourLabels[s.colour] : colourLabels.grey}
        </span>
      </div>
    </Link>
  );
}
