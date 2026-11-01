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
import {
  assessDrugGeneRisk,
  geneRiskDisclaimer,
} from "@/lib/health/assess-drug-gene-risk";
import { pharmaSubcategoryLabel } from "@/lib/health/pharma-plain";
import type { PharmaSnpRow } from "@/components/patient/pharma-genes-tabs";

type SelectedDrug = DrugLookupInput & {
  key: string;
  display: string;
};

function drugKey(d: DrugLookupInput) {
  return `${d.brandName || ""}|${d.activeSubstance || ""}|${d.label || ""}`.toLowerCase();
}

/**
 * Instant medicine → genetics check: add one or more drugs, press Check, see results.
 * Current / prescribed lists with colour flags live on the Vaistai “Sąrašas” tab.
 */
export function MedToleranceCheck({
  locale,
  snps,
  colourLabels,
  awaitingDna,
}: {
  locale: "lt" | "en";
  snps: PharmaSnpRow[];
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
}) {
  const [queue, setQueue] = useState<SelectedDrug[]>([]);
  const [checked, setChecked] = useState<SelectedDrug[] | null>(null);
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
    setQueue((prev) => {
      if (prev.some((s) => s.key === key)) return prev;
      return [...prev, { ...input, key, display }];
    });
    setDraft("");
    setOpen(false);
    setChecked(null);
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
          title: "Instant tolerance check",
          blurb:
            "Add one or more medicines from the catalogue and press Check. The system shows whether your DNA has risk alleles linked to those drugs.",
          hint: "Type brand or substance (e.g. Atoris, Plavix, Warfarin)…",
          check: "Check",
          clear: "Clear",
          empty: "Add at least one medicine, then press Check.",
          results: "Results",
          noPgx:
            "No pharmacogenetic panel link for this medicine in the portal — ask your clinician.",
          riskTitle: "Possible genetic intolerance / dosing signal",
          clearTitle: "No elevated risk alleles for this medicine",
          alleles: (n: number) =>
            n === 1 ? "1 risk allele" : `${n} risk alleles`,
          focus: "Focus",
          openGene: "Open gene",
          remove: "Remove",
          flagRisk: "Genetic signal",
          flagOk: "No risk alleles",
          flagUnknown: "Not in PGx panel",
        }
      : {
          title: "Momentinis toleravimo tikrinimas",
          blurb:
            "Įveskite vieną ar kelis vaistus iš klasifikatoriaus ir paspauskite „Tikrinti“. Sistema parodys, ar jūsų DNR turi su tais vaistais susijusių rizikos alelių.",
          hint: "Įveskite pavadinimą ar veikliąją medžiagą (pvz. Atoris, Plavix, Warfarin)…",
          check: "Tikrinti",
          clear: "Išvalyti",
          empty: "Pridėkite bent vieną vaistą ir paspauskite „Tikrinti“.",
          results: "Rezultatai",
          noPgx:
            "Šiam vaistui portalo farmakogenetikos skydelyje nuorodos nerasta — pasitarkite su gydytoju.",
          riskTitle: "Galimas genetinis netoleravimas / dozavimo signalas",
          clearTitle: "Šiam vaistui padidėjusių rizikos alelių nerasta",
          alleles: (n: number) =>
            n === 1 ? "1 rizikos alelis" : `${n} rizikos aleliai`,
          focus: "Sritis",
          openGene: "Atidaryti geną",
          remove: "Pašalinti",
          flagRisk: "Genetikos signalas",
          flagOk: "Be rizikos alelių",
          flagUnknown: "Ne PGx skydelyje",
        };

  const checkResults = useMemo(() => {
    if (!checked) return null;
    return checked.map((drug) => {
      const risk = assessDrugGeneRisk(drug, snps, locale);
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
      const clearGenes = related
        .filter((s) => s.genotypeAvailable && (s.matchCount || 0) === 0)
        .sort((a, b) => a.gene.localeCompare(b.gene));
      return { drug, risk, focuses, withRisk, clearGenes };
    });
  }, [checked, snps, locale]);

  return (
    <div className="stack med-tolerance" style={{ gap: 14 }}>
      <div>
        <h4 className="m-0 text-base font-semibold">{copy.title}</h4>
        <p className="small muted m-0 mt-1">{copy.blurb}</p>
      </div>

      <div className="stack med-picker" style={{ gap: 8 }} ref={rootRef}>
        <div className="q-chips">
          {queue.map((s) => (
            <button
              key={s.key}
              type="button"
              className="chip on"
              aria-label={`${copy.remove} ${s.display}`}
              onClick={() => {
                setQueue((prev) => prev.filter((x) => x.key !== s.key));
                setChecked(null);
              }}
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
                    ? `No catalogue match — press Enter to add “${draft.trim()}”`
                    : `Kataloge nerasta — Enter pridės „${draft.trim()}“`}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn"
          disabled={!queue.length}
          onClick={() => setChecked([...queue])}
        >
          {copy.check}
        </button>
        {queue.length ? (
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setQueue([]);
              setChecked(null);
            }}
          >
            {copy.clear}
          </button>
        ) : null}
      </div>

      {!checked ? (
        <p className="small muted m-0">{copy.empty}</p>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          <p className="eyebrow m-0">{copy.results}</p>
          {checkResults?.some((r) => r.risk.hasRisk) ? (
            <p className="small m-0">
              <b>{geneRiskDisclaimer(locale)}</b>
            </p>
          ) : null}
          {checkResults?.map(({ drug, risk, focuses, withRisk, clearGenes }) => (
            <section
              key={`res-${drug.key}`}
              className="rounded-md border border-[var(--line)] bg-[var(--surface-raised)] p-3"
              style={
                risk.hasRisk && risk.worstColour
                  ? {
                      borderLeft: `4px solid ${COLOUR_HEX[risk.worstColour]}`,
                      background: COLOUR_SOFT[risk.worstColour],
                    }
                  : undefined
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="m-0 text-base font-semibold">{drug.display}</h4>
                  {drug.activeSubstance ? (
                    <p className="xs muted m-0 mt-1">{drug.activeSubstance}</p>
                  ) : null}
                </div>
                {risk.hasRisk && risk.worstColour ? (
                  <span className={`pill ${PILL_CLASS[risk.worstColour]}`}>
                    {copy.flagRisk} · {risk.hits[0]?.gene}
                  </span>
                ) : risk.hasPanelLink ? (
                  <span className="pill c-green">{copy.flagOk}</span>
                ) : (
                  <span className="pill c-none">{copy.flagUnknown}</span>
                )}
              </div>

              {!focuses.length ? (
                <p className="small muted mt-3 mb-0">{copy.noPgx}</p>
              ) : (
                <div className="stack mt-3" style={{ gap: 10 }}>
                  <p className="eyebrow m-0">
                    {risk.hasRisk ? copy.riskTitle : copy.clearTitle}
                  </p>
                  {focuses.map((f) => (
                    <p key={f.subcategory} className="small m-0 text-[var(--ink-soft)]">
                      <span className="eyebrow">{copy.focus}: </span>
                      {locale === "en" ? f.reasonEn : f.reasonLt}
                    </p>
                  ))}
                  {withRisk.length ? (
                    <div className="space-y-2">
                      {withRisk.map((s) => (
                        <GeneHit
                          key={`${s.gene}-${s.snpId}`}
                          s={s}
                          colourLabels={colourLabels}
                          awaitingDna={awaitingDna}
                          allelesLabel={copy.alleles(s.matchCount)}
                          openLabel={copy.openGene}
                          locale={locale}
                        />
                      ))}
                    </div>
                  ) : null}
                  {!withRisk.length && clearGenes.length ? (
                    <div className="space-y-2">
                      {clearGenes.slice(0, 4).map((s) => (
                        <GeneHit
                          key={`${s.gene}-${s.snpId}`}
                          s={s}
                          colourLabels={colourLabels}
                          awaitingDna={awaitingDna}
                          allelesLabel={copy.alleles(0)}
                          openLabel={copy.openGene}
                          locale={locale}
                        />
                      ))}
                    </div>
                  ) : null}
                  {risk.hasRisk ? (
                    <p className="small m-0">
                      <b>{geneRiskDisclaimer(locale)}</b>
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
}: {
  s: PharmaSnpRow;
  locale: "lt" | "en";
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
  allelesLabel: string;
  openLabel: string;
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
            {s.subcategory ? (
              <>
                {" · "}
                {pharmaSubcategoryLabel(s.subcategory, locale) || s.subcategory}
              </>
            ) : null}
          </p>
        </div>
        <span className={`pill ${PILL_CLASS[c]}`}>
          {s.colour ? colourLabels[s.colour] : colourLabels.grey}
        </span>
      </div>
    </Link>
  );
}
