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
  normalizeColour,
  type RiskColour,
} from "@/lib/health/colours";
import { markerItemColour } from "@/lib/health/marker-colour";
import { MarkerChart } from "@/components/patient/marker-chart";
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
  const showRare = twin.patient.hasNgsVcf && catRare.length > 0;

  const snpTitle =
    cat.id === "pharmacogenetics"
      ? locale === "lt"
        ? "Farmakogenetika (SNP)"
        : "Pharmacogenetics (SNP)"
      : labels.snpTestTitle;

  const geneticColour: RiskColour = cat.geneticColour ?? "grey";
  const biomarkerColour = cat.biomarkerColour;
  const driverSnps = sortedSnps.filter(
    (s) => s.colour && colourRank(s.colour) >= colourRank(cat.colour) && cat.colour !== "grey"
  );
  const driverMarkers = latestMarkers.filter(
    (m) =>
      colourRank(markerItemColour(m)) >= colourRank(cat.colour) &&
      cat.colour !== "grey" &&
      colourRank(markerItemColour(m)) >= 2
  );
  const hasDrivers =
    driverSnps.length > 0 || driverMarkers.length > 0 || catRare.length > 0;

  return (
    <div className="space-y-5">
      <Link href="/patient/digital-twin" className="text-sm text-[var(--muted)]">
        ← {labels.back}
      </Link>

      <section
        className="panel"
        style={{
          borderColor: COLOUR_HEX[cat.colour],
          background: `linear-gradient(160deg, ${COLOUR_SOFT[cat.colour]}, rgba(255,255,255,0.8))`,
        }}
      >
        <Pill colour={cat.colour} label={labels.colourLabels[cat.colour]} />
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
          {labels.categoryNames[cat.id as HealthCategoryId]}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ink-soft)]">
          {cat.summary}
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <span className="eyebrow">{labels.howCalculated}</span>
            <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">
              {labels.colourLabels[cat.colour]}
            </h3>
          </div>
          <Pill colour={cat.colour} label={labels.colourLabels[cat.colour]} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--radius-s)] border border-[var(--line-2)] bg-[var(--surface-2)] p-3">
            <p className="eyebrow">{labels.fromMarkers}</p>
            <div className="mt-2">
              <Pill
                colour={biomarkerColour}
                label={labels.colourLabels[biomarkerColour]}
              />
            </div>
          </div>
          <div className="rounded-[var(--radius-s)] border border-[var(--line-2)] bg-[var(--surface-2)] p-3">
            <p className="eyebrow">{labels.fromGenetics}</p>
            <div className="mt-2">
              <Pill
                colour={geneticColour}
                label={
                  cat.geneticColour
                    ? labels.colourLabels[geneticColour]
                    : labels.noRiskAlleles
                }
              />
            </div>
          </div>
          <div className="rounded-[var(--radius-s)] border border-[var(--line-2)] bg-[var(--surface-2)] p-3">
            <p className="eyebrow">{labels.fromNgs}</p>
            <div className="mt-2">
              {catRare.length ? (
                <Pill colour="red" label={labels.colourLabels.red} />
              ) : (
                <Pill colour="grey" label={labels.colourLabels.grey} />
              )}
            </div>
          </div>
        </div>

        {hasDrivers && (
          <div className="mt-4">
            <p className="eyebrow mb-2">{labels.colourDrivers}</p>
            <div className="flex flex-col gap-2">
              {catRare.map((v) => (
                <div
                  key={v.id ?? `${v.gene}-rare`}
                  className="row between rounded-[var(--radius-s)] border border-[var(--r-red)]/25 bg-[var(--r-red-bg)]/50 px-3 py-2"
                >
                  <div>
                    <b className="text-sm">{v.gene}</b>
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      NGS · {v.hgvs}
                    </span>
                  </div>
                  <Pill colour="red" label={labels.colourLabels.red} />
                </div>
              ))}
              {driverMarkers.map((m) => {
                const c = markerItemColour(m);
                return (
                  <Link
                    key={`drv-m-${m.markerKey}`}
                    href={`/patient/digital-twin/${category}?marker=${m.markerKey}`}
                    className="row between rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 no-underline text-inherit"
                  >
                    <div>
                      <b className="text-sm">{m.name || m.markerKey}</b>
                      <span className="ml-2 text-xs text-[var(--muted)]">
                        {labels.markers} · {m.value}
                        {m.unit ? ` ${m.unit}` : ""}
                      </span>
                    </div>
                    <Pill colour={c} label={labels.colourLabels[c]} />
                  </Link>
                );
              })}
              {driverSnps.map((s) => (
                <Link
                  key={`drv-s-${s.snpId}`}
                  href={`/patient/digital-twin/${category}?snp=${s.snpId}`}
                  className="row between rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 no-underline text-inherit"
                >
                  <div>
                    <b className="text-sm">
                      {s.gene}{" "}
                      <span className="font-normal text-[var(--muted)]">
                        {s.snpId}
                      </span>
                    </b>
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {s.allele1}/{s.allele2} · {s.matchCount}{" "}
                      {labels.riskAlleleMatches}
                    </span>
                  </div>
                  <Pill
                    colour={s.colour || "grey"}
                    label={labels.colourLabels[s.colour || "grey"]}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {showRare && (
        <section className="panel space-y-3">
          <h3 className="font-[family-name:var(--font-display)] text-2xl">
            {labels.rareMutations}
          </h3>
          <div className="rounded-lg border border-[var(--line)] bg-white/70 p-4">
            <p className="text-sm font-semibold">{labels.ngsTitle}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{labels.ngsBlurb}</p>
          </div>
          <div className="grid gap-3">
            {catRare.map((v) => (
              <article
                key={v.id ?? `${v.gene}-${v.hgvs}`}
                className="rounded-lg border border-[var(--r-red)]/30 bg-[var(--r-red-bg)]/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pill colour="red" label={labels.colourLabels.red} />
                  <h4 className="text-lg font-semibold">
                    {locale === "lt" ? v.titleLt : v.titleEn}
                  </h4>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {v.gene} · {v.hgvs} · {v.chrom}:{v.pos} · GT {v.gt}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {locale === "lt" ? v.summaryLt : v.summaryEn}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel">
          <div className="card-head" style={{ marginBottom: 0 }}>
            <h3 className="font-[family-name:var(--font-display)] text-2xl">
              {labels.markers}
            </h3>
            <Pill
              colour={biomarkerColour}
              label={labels.colourLabels[biomarkerColour]}
            />
          </div>
          <div className="mt-3 space-y-2">
            {latestMarkers.length === 0 && (
              <p className="text-sm text-[var(--muted)]">{labels.noData}</p>
            )}
            {latestMarkers.map((m) => {
              const c = markerItemColour(m);
              return (
                <Link
                  key={m.markerKey}
                  href={`/patient/digital-twin/${category}?marker=${m.markerKey}`}
                  className={`block rounded-md border px-3 py-2 transition hover:border-[var(--accent)] ${
                    selectedMarkerKey === m.markerKey
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-white/70"
                  }`}
                  style={{ borderLeft: `4px solid ${COLOUR_HEX[c]}` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{m.name || m.markerKey}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--ink-soft)]">
                        {m.value}
                        {m.unit ? ` ${m.unit}` : ""}
                      </span>
                      <Pill colour={c} label={labels.colourLabels[c]} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {markerMeta && (
            <div
              className="mt-4 rounded-lg border bg-white/80 p-4"
              style={{
                borderColor: COLOUR_HEX[markerItemColour(markerMeta)],
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill
                  colour={markerItemColour(markerMeta)}
                  label={labels.colourLabels[markerItemColour(markerMeta)]}
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
                    {markerMeta.refLow != null || markerMeta.refHigh != null
                      ? `${markerMeta.refLow ?? "—"} – ${markerMeta.refHigh ?? "—"}`
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-sm text-[var(--muted)]">{labels.trend}</p>
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

        <div className="panel">
          <div className="card-head" style={{ marginBottom: 0 }}>
            <h3 className="font-[family-name:var(--font-display)] text-2xl">
              {labels.genes}
            </h3>
            <Pill
              colour={geneticColour}
              label={
                cat.geneticColour
                  ? labels.colourLabels[geneticColour]
                  : labels.colourLabels.grey
              }
            />
          </div>
          {cat.id !== "pharmacogenetics" && (
            <div className="mt-2 rounded-lg border border-[var(--line)] bg-white/70 p-3">
              <p className="text-sm font-semibold">{snpTitle}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                {labels.snpTestBlurb}
              </p>
            </div>
          )}
          <div className="mt-3 max-h-[480px] space-y-2 overflow-auto pr-1">
            {sortedSnps.length === 0 && (
              <p className="text-sm text-[var(--muted)]">{labels.noData}</p>
            )}
            {sortedSnps.map((s) => {
              const c: RiskColour = s.colour || "grey";
              const isDriver =
                s.colour != null && colourRank(s.colour) >= Math.max(2, colourRank(cat.colour));
              return (
                <Link
                  key={`${s.gene}-${s.snpId}`}
                  href={`/patient/digital-twin/${category}?snp=${s.snpId}`}
                  className={`block rounded-md border px-3 py-2 transition hover:border-[var(--accent)] ${
                    selectedSnpId === s.snpId
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-white/70"
                  }`}
                  style={{
                    borderLeft: `4px solid ${COLOUR_HEX[c]}`,
                    background: isDriver
                      ? `linear-gradient(90deg, ${COLOUR_SOFT[c]}, transparent 55%)`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-medium">
                        {s.gene}{" "}
                        <span className="text-[var(--muted)] font-normal">
                          {s.snpId}
                        </span>
                      </span>
                      <p className="text-xs text-[var(--muted)]">
                        {s.genotypeAvailable
                          ? `${s.allele1}/${s.allele2} · ${s.matchCount} ${labels.riskAlleleMatches}`
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

          {selectedSnp && (
            <div
              className="mt-4 rounded-lg border bg-white/80 p-4"
              style={{
                borderColor: COLOUR_HEX[selectedSnp.colour || "grey"],
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill
                  colour={selectedSnp.colour || "grey"}
                  label={
                    labels.colourLabels[selectedSnp.colour || "grey"]
                  }
                />
                <h4 className="text-lg font-semibold">
                  {selectedSnp.gene} · {selectedSnp.snpId}
                </h4>
              </div>
              {cat.id !== "pharmacogenetics" && (
                <p className="mt-1 text-xs text-[var(--muted)]">{snpTitle}</p>
              )}
              <p className="mt-2 text-sm">
                <span className="text-[var(--muted)]">{labels.genotype}: </span>
                {selectedSnp.genotypeAvailable
                  ? `${selectedSnp.allele1}/${selectedSnp.allele2} (${selectedSnp.matchCount} ${labels.riskAlleleMatches})`
                  : labels.awaitingDna}
              </p>
              {selectedSnp.match1 && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  1× →{" "}
                  {
                    labels.colourLabels[
                      normalizeColour(selectedSnp.match1) || "grey"
                    ]
                  }
                  {selectedSnp.match2
                    ? ` · 2× → ${
                        labels.colourLabels[
                          normalizeColour(selectedSnp.match2) || "grey"
                        ]
                      }`
                    : ""}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                <span className="font-medium text-[var(--ink)]">
                  {labels.mechanism}.{" "}
                </span>
                {selectedSnp.mechanism || "—"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
