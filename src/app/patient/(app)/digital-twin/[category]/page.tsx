import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  colourRank,
  type RiskColour,
} from "@/lib/health/colours";
import { markerItemColour } from "@/lib/health/marker-colour";
import { MarkerChart } from "@/components/patient/marker-chart";
import { Sparkline } from "@/components/patient/sparkline";
import { SnpDetailPanel } from "@/components/patient/snp-detail";
import type { HealthCategoryId } from "@/lib/health/categories";

function Pill({
  colour,
  label,
}: {
  colour: RiskColour;
  label: string;
}) {
  return <span className={`pill ${PILL_CLASS[colour]}`}>{label}</span>;
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ marker?: string; snp?: string }>;
}) {
  const { category } = await params;
  const sp = await searchParams;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const cat = twin.categories.find((c) => c.id === category);
  if (!cat) notFound();

  const selectedMarkerKey = sp.marker;
  const selectedSnpId = sp.snp;

  const historyByKey = (() => {
    const map = new Map<string, number[]>();
    for (const m of [...cat.markers].sort((a, b) =>
      a.observedAt.localeCompare(b.observedAt)
    )) {
      const cur = map.get(m.markerKey) || [];
      cur.push(m.value);
      map.set(m.markerKey, cur);
    }
    return map;
  })();

  const latestMarkers = (() => {
    const map = new Map<string, (typeof cat.markers)[number]>();
    for (const m of [...cat.markers].sort((a, b) =>
      a.observedAt.localeCompare(b.observedAt)
    )) {
      map.set(m.markerKey, m);
    }
    return [...map.values()].sort(
      (a, b) => colourRank(markerItemColour(b)) - colourRank(markerItemColour(a))
    );
  })();

  const sortedSnps = [...cat.snps].sort((a, b) => {
    const ra = colourRank(a.colour);
    const rb = colourRank(b.colour);
    if (rb !== ra) return rb - ra;
    return a.gene.localeCompare(b.gene) || a.snpId.localeCompare(b.snpId);
  });

  const selectedMarker = selectedMarkerKey
    ? cat.markers.filter((m) => m.markerKey === selectedMarkerKey)
    : [];
  const markerMeta = selectedMarker[0];
  const selectedSnp = selectedSnpId
    ? cat.snps.find((s) => s.snpId === selectedSnpId)
    : null;

  const catRare = cat.rare ?? [];
  const hasMarkers = latestMarkers.length > 0;
  const hasSnps = sortedSnps.length > 0;
  const hasRare = catRare.length > 0;

  const snpTitle =
    cat.id === "pharmacogenetics"
      ? locale === "lt"
        ? "Farmakogenetika (SNP)"
        : "Pharmacogenetics (SNP)"
      : labels.snpTestTitle;

  const geneticColour: RiskColour = cat.geneticColour ?? "grey";
  const biomarkerColour = cat.biomarkerColour;
  const driverSnps = sortedSnps.filter(
    (s) =>
      s.colour &&
      colourRank(s.colour) >= colourRank(cat.colour) &&
      cat.colour !== "grey"
  );
  const driverMarkers = latestMarkers.filter(
    (m) =>
      colourRank(markerItemColour(m)) >= colourRank(cat.colour) &&
      cat.colour !== "grey" &&
      colourRank(markerItemColour(m)) >= 2
  );
  const hasDrivers =
    driverSnps.length > 0 || driverMarkers.length > 0 || hasRare;
  // Pharmacogenetics (and any genes-only category): skip colour/driver chrome.
  const genesOnly = hasSnps && !hasMarkers && !hasRare;

  const bothColumns = hasMarkers && hasSnps;
  const columnsClass = bothColumns
    ? "grid gap-5 lg:grid-cols-2"
    : "grid gap-5";

  return (
    <div className="space-y-5">
      <Link href="/patient/digital-twin" className="text-sm text-[var(--muted)]">
        ← {labels.back}
      </Link>

      <section
        className="panel cat-hero"
        style={
          genesOnly
            ? undefined
            : {
                borderColor: COLOUR_HEX[cat.colour],
                background: `linear-gradient(160deg, ${COLOUR_SOFT[cat.colour]}, var(--surface) 55%)`,
              }
        }
      >
        <div className={`cat-hero-top ${genesOnly ? "genes-only" : ""}`}>
          <h2 className="cat-hero-title">
            {labels.categoryNames[cat.id as HealthCategoryId]}
          </h2>
          {!genesOnly ? (
            <Pill colour={cat.colour} label={labels.colourLabels[cat.colour]} />
          ) : null}
        </div>
        <p className="cat-hero-summary">
          {genesOnly
            ? locale === "en"
              ? "SNP results that can affect how your body responds to medicines. Open a gene for the plain-language explanation."
              : "SNP rezultatai, kurie gali keisti vaistų poveikį. Paspauskite geną — pamatysite paaiškinimą paprasta kalba."
            : cat.summary}
        </p>
      </section>

      {!genesOnly && (
        <section className="card colour-sources">
          <div className="colour-sources-head">
            <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold">
              {labels.colourLabels[cat.colour]}
            </h3>
            <Pill colour={cat.colour} label={labels.colourLabels[cat.colour]} />
          </div>

          <div
            className={`colour-source-grid ${
              [hasMarkers, hasSnps, hasRare].filter(Boolean).length > 1
                ? "multi"
                : ""
            }`}
          >
            {hasMarkers && (
              <a href="#section-markers" className="colour-source">
                <span className="colour-source-label">{labels.markers}</span>
                <Pill
                  colour={biomarkerColour}
                  label={labels.colourLabels[biomarkerColour]}
                />
              </a>
            )}
            {hasSnps && (
              <a href="#section-genes" className="colour-source">
                <span className="colour-source-label">{labels.genes}</span>
                <Pill
                  colour={geneticColour}
                  label={
                    cat.geneticColour
                      ? labels.colourLabels[geneticColour]
                      : labels.noRiskAlleles
                  }
                />
              </a>
            )}
            {hasRare && (
              <a href="#section-rare" className="colour-source">
                <span className="colour-source-label">{labels.rareShort}</span>
                <Pill colour="red" label={labels.colourLabels.red} />
              </a>
            )}
          </div>

          {hasDrivers && (
            <div className="mt-4">
              <p className="eyebrow mb-2">{labels.colourDrivers}</p>
              <div className="driver-chips">
                {catRare.map((v) => {
                  const title =
                    (locale === "lt" ? v.titleLt : v.titleEn) ||
                    (locale === "en"
                      ? `${v.gene} gene change`
                      : `${v.gene} geno pokytis`);
                  const anchor = `rare-${encodeURIComponent(String(v.id ?? v.gene))}`;
                  return (
                    <a
                      key={v.id ?? `${v.gene}-rare`}
                      href={`#${anchor}`}
                      className="driver-chip driver-chip-red"
                    >
                      <Pill colour="red" label={labels.colourLabels.red} />
                      <span className="driver-chip-text">
                        <b>{title}</b>
                      </span>
                    </a>
                  );
                })}
                {driverMarkers.map((m) => {
                  const c = markerItemColour(m);
                  return (
                    <Link
                      key={`drv-m-${m.markerKey}`}
                      href={`/patient/marker/${encodeURIComponent(m.markerKey)}?cat=${category}`}
                      className="driver-chip"
                      style={{ borderColor: COLOUR_HEX[c] }}
                    >
                      <Pill colour={c} label={labels.colourLabels[c]} />
                      <span className="driver-chip-text">
                        <b>{m.name || m.markerKey}</b>
                        <em>
                          {m.value}
                          {m.unit ? ` ${m.unit}` : ""}
                        </em>
                      </span>
                    </Link>
                  );
                })}
                {driverSnps.map((s) => {
                  const c = s.colour || "grey";
                  return (
                    <Link
                      key={`drv-s-${s.snpId}`}
                      href={`/patient/snp/${encodeURIComponent(s.snpId)}?cat=${category}`}
                      className="driver-chip"
                      style={{ borderColor: COLOUR_HEX[c] }}
                    >
                      <Pill colour={c} label={labels.colourLabels[c]} />
                      <span className="driver-chip-text">
                        <b>{s.gene}</b>
                        <em>{s.snpId.split("__")[0]}</em>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {hasRare && (
        <section id="section-rare" className="panel space-y-3 scroll-mt-24">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">
            {labels.rareMutations}
          </h3>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-4">
            <p className="text-sm font-semibold">{labels.ngsTitle}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{labels.ngsBlurb}</p>
          </div>
          <div className="grid gap-3">
            {catRare.map((v) => {
              const anchor = `rare-${encodeURIComponent(String(v.id ?? v.gene))}`;
              return (
                <Link
                  key={v.id ?? `${v.gene}-${v.hgvs}`}
                  id={anchor}
                  href={`/patient/rare/${encodeURIComponent(String(v.id ?? v.gene))}`}
                  className="block scroll-mt-24 rounded-lg border border-[var(--r-red)]/30 bg-[var(--r-red-bg)]/40 p-4 transition hover:border-[var(--r-red)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill colour="red" label={labels.colourLabels.red} />
                    <h4 className="text-lg font-semibold">
                      {(locale === "lt" ? v.titleLt : v.titleEn) || v.gene}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {v.gene} · {v.hgvs} · {v.chrom}:{v.pos} · GT {v.gt}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {locale === "lt" ? v.summaryLt : v.summaryEn}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {(hasMarkers || hasSnps) && (
        <section className={columnsClass}>
          {hasMarkers && (
            <div id="section-markers" className="panel scroll-mt-24">
              <div className="card-head" style={{ marginBottom: 0 }}>
                <h3 className="font-[family-name:var(--font-display)] text-2xl">
                  {labels.markers}
                </h3>
                <Pill
                  colour={biomarkerColour}
                  label={labels.colourLabels[biomarkerColour]}
                />
              </div>
              <div className="marker-list mt-3">
                <div className="marker-list-head" aria-hidden="true">
                  <span>{labels.labsIndicator}</span>
                  <span>{labels.labsResult}</span>
                  <span>{labels.labsChange}</span>
                  <span>{labels.labsStatus}</span>
                </div>
                {latestMarkers.map((m) => {
                  const c = markerItemColour(m);
                  const series = historyByKey.get(m.markerKey) || [m.value];
                  return (
                    <Link
                      key={m.markerKey}
                      href={`/patient/marker/${encodeURIComponent(m.markerKey)}?cat=${category}`}
                      className={`marker-row ${
                        selectedMarkerKey === m.markerKey ? "on" : ""
                      }`}
                      style={{ borderLeftColor: COLOUR_HEX[c] }}
                    >
                      <span className="marker-row-name">
                        {m.name || m.markerKey}
                      </span>
                      <span className="marker-row-val">
                        {m.value}
                        {m.unit ? ` ${m.unit}` : ""}
                      </span>
                      <span className="marker-row-spark">
                        <Sparkline values={series} width={84} height={28} />
                      </span>
                      <span className="marker-row-status">
                        <Pill colour={c} label={labels.colourLabels[c]} />
                      </span>
                    </Link>
                  );
                })}
              </div>

              {markerMeta && (
                <div
                  className="mt-4 rounded-lg border bg-[var(--surface-raised)] p-4"
                  style={{
                    borderColor: COLOUR_HEX[markerItemColour(markerMeta)],
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill
                      colour={markerItemColour(markerMeta)}
                      label={
                        labels.colourLabels[markerItemColour(markerMeta)]
                      }
                    />
                    <h4 className="text-lg font-semibold">
                      {markerMeta.name || markerMeta.markerKey}
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {locale === "lt"
                      ? markerMeta.descriptionLt
                      : markerMeta.descriptionEn}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[var(--muted)]">{labels.value}</p>
                      <p className="font-medium">
                        {markerMeta.value}
                        {markerMeta.unit ? ` ${markerMeta.unit}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--muted)]">{labels.reference}</p>
                      <p className="font-medium">
                        {markerMeta.refLow != null ||
                        markerMeta.refHigh != null
                          ? `${markerMeta.refLow ?? "—"} – ${markerMeta.refHigh ?? "—"}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-[var(--muted)]">
                      {labels.trend}
                    </p>
                    <MarkerChart
                      points={selectedMarker.map((m) => ({
                        date: m.observedAt,
                        value: m.value,
                      }))}
                      refLow={markerMeta.refLow}
                      refHigh={markerMeta.refHigh}
                      unit={markerMeta.unit}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {hasSnps && (
            <div id="section-genes" className="panel scroll-mt-24">
              <div className="card-head" style={{ marginBottom: 0 }}>
                <h3 className="font-[family-name:var(--font-display)] text-2xl">
                  {labels.genes}
                </h3>
                {!genesOnly && (
                  <Pill
                    colour={geneticColour}
                    label={
                      cat.geneticColour
                        ? labels.colourLabels[geneticColour]
                        : labels.colourLabels.grey
                    }
                  />
                )}
              </div>
              {!genesOnly && cat.id !== "pharmacogenetics" && (
                <div className="mt-2 rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-3">
                  <p className="text-sm font-semibold">{snpTitle}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    {labels.snpTestBlurb}
                  </p>
                </div>
              )}
              <div
                className={`mt-3 space-y-2 pr-1 ${
                  genesOnly ? "" : "max-h-[480px] overflow-auto"
                }`}
              >
                {sortedSnps.map((s) => {
                  const c: RiskColour = s.colour || "grey";
                  const isDriver =
                    !genesOnly &&
                    s.colour != null &&
                    colourRank(s.colour) >=
                      Math.max(2, colourRank(cat.colour));
                  const selected = selectedSnpId === s.snpId;
                  return (
                    <Link
                      key={`${s.gene}-${s.snpId}`}
                      href={`/patient/snp/${encodeURIComponent(s.snpId)}?cat=${category}`}
                      className={`block rounded-md border px-3 py-2 text-[var(--ink)] no-underline transition hover:border-[var(--accent)] ${
                        selected
                          ? "border-[var(--accent)]"
                          : "border-[var(--line)]"
                      }`}
                      style={{
                        borderLeft: `4px solid ${COLOUR_HEX[c]}`,
                        background: selected
                          ? "var(--accent-soft)"
                          : isDriver
                            ? `linear-gradient(90deg, ${COLOUR_SOFT[c]}, var(--surface-raised) 55%)`
                            : "var(--surface-raised)",
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
                          <p className="text-xs text-[var(--ink-soft)]">
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
                              : labels.awaitingDna}
                          </p>
                        </div>
                        <Pill
                          colour={c}
                          label={
                            s.colour
                              ? labels.colourLabels[s.colour]
                              : labels.colourLabels.grey
                          }
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {selectedSnp && (
        <SnpDetailPanel
          snp={selectedSnp}
          locale={locale}
          labels={labels}
          snpTestLabel={
            cat.id === "pharmacogenetics" ? undefined : snpTitle
          }
        />
      )}
    </div>
  );
}
