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
import { explainSnp } from "@/lib/health/explain-snp";
import { MarkerChart } from "@/components/patient/marker-chart";
import { SnpDetailPanel } from "@/components/patient/snp-detail";
import { AskAiButton } from "@/components/patient/ask-ai-button";
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

        <div
          className={`grid gap-3 ${
            [hasMarkers, hasSnps, hasRare].filter(Boolean).length > 1
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : ""
          }`}
        >
          {hasMarkers && (
            <div className="rounded-[var(--radius-s)] border border-[var(--line-2)] bg-[var(--surface-2)] p-3">
              <p className="eyebrow">{labels.fromMarkers}</p>
              <div className="mt-2">
                <Pill
                  colour={biomarkerColour}
                  label={labels.colourLabels[biomarkerColour]}
                />
              </div>
            </div>
          )}
          {hasSnps && (
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
          )}
          {hasRare && (
            <div className="rounded-[var(--radius-s)] border border-[var(--line-2)] bg-[var(--surface-2)] p-3">
              <p className="eyebrow">{labels.fromNgs}</p>
              <div className="mt-2">
                <Pill colour="red" label={labels.colourLabels.red} />
              </div>
            </div>
          )}
        </div>

        {hasDrivers && (
          <div className="mt-4">
            <p className="eyebrow mb-2">{labels.colourDrivers}</p>
            <div className="flex flex-col gap-3">
              {catRare.map((v) => {
                const title =
                  (locale === "lt" ? v.titleLt : v.titleEn) || v.gene;
                const summary =
                  (locale === "lt" ? v.summaryLt : v.summaryEn) || "";
                const ask =
                  locale === "en"
                    ? `Explain my NGS finding ${v.gene} (${v.hgvs}) in plain language using my data`
                    : `Paaiškink mano NGS radinį ${v.gene} (${v.hgvs}) paprasta kalba pagal mano duomenis`;
                return (
                  <article
                    key={v.id ?? `${v.gene}-rare`}
                    className="rounded-[var(--radius)] border border-[var(--r-red)]/30 bg-[var(--r-red-bg)]/35 p-4"
                  >
                    <div className="row between" style={{ alignItems: "flex-start" }}>
                      <div>
                        <div className="row" style={{ gap: 8 }}>
                          <Pill colour="red" label={labels.colourLabels.red} />
                          <b className="text-sm">{title}</b>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          NGS · {v.gene} · {v.hgvs}
                        </p>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <AskAiButton question={ask} label={labels.askAi} />
                        <Link
                          href={`/patient/rare/${encodeURIComponent(String(v.id ?? v.gene))}`}
                          className="btn ghost sm"
                        >
                          {labels.openCategory}
                        </Link>
                      </div>
                    </div>
                    <p className="eyebrow mt-3">{labels.plainLanguage}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
                      {summary}
                    </p>
                  </article>
                );
              })}
              {driverMarkers.map((m) => {
                const c = markerItemColour(m);
                const desc =
                  (locale === "lt" ? m.descriptionLt : m.descriptionEn) ||
                  (locale === "en"
                    ? `Your latest value is ${m.value}${m.unit ? " " + m.unit : ""}. Reference: ${m.refLow ?? "—"}–${m.refHigh ?? "—"}.`
                    : `Jūsų paskutinė reikšmė: ${m.value}${m.unit ? " " + m.unit : ""}. Norma: ${m.refLow ?? "—"}–${m.refHigh ?? "—"}.`);
                const ask =
                  locale === "en"
                    ? `Explain my marker ${m.name || m.markerKey} (${m.value}${m.unit ? " " + m.unit : ""}) in plain language`
                    : `Paaiškink mano žymenį ${m.name || m.markerKey} (${m.value}${m.unit ? " " + m.unit : ""}) paprasta kalba`;
                return (
                  <article
                    key={`drv-m-${m.markerKey}`}
                    className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4"
                    style={{ borderLeft: `4px solid ${COLOUR_HEX[c]}` }}
                  >
                    <div className="row between" style={{ alignItems: "flex-start" }}>
                      <div>
                        <div className="row" style={{ gap: 8 }}>
                          <Pill colour={c} label={labels.colourLabels[c]} />
                          <b className="text-sm">{m.name || m.markerKey}</b>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {labels.markers} · {m.value}
                          {m.unit ? ` ${m.unit}` : ""}
                        </p>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <AskAiButton question={ask} label={labels.askAi} />
                        <Link
                          href={`/patient/marker/${encodeURIComponent(m.markerKey)}?cat=${category}`}
                          className="btn ghost sm"
                        >
                          {labels.openCategory}
                        </Link>
                      </div>
                    </div>
                    <p className="eyebrow mt-3">{labels.plainLanguage}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
                      {desc}
                    </p>
                  </article>
                );
              })}
              {driverSnps.map((s) => {
                const expl = explainSnp(s, locale);
                const c = s.colour || "grey";
                const ask =
                  locale === "en"
                    ? `Explain ${s.gene} ${s.snpId} (${s.allele1}/${s.allele2}) from my SNP data in plain language`
                    : `Paaiškink ${s.gene} ${s.snpId} (${s.allele1}/${s.allele2}) pagal mano SNP duomenis paprasta kalba`;
                return (
                  <article
                    key={`drv-s-${s.snpId}`}
                    className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4"
                    style={{ borderLeft: `4px solid ${COLOUR_HEX[c]}` }}
                  >
                    <div className="row between" style={{ alignItems: "flex-start" }}>
                      <div>
                        <div className="row" style={{ gap: 8 }}>
                          <Pill colour={c} label={labels.colourLabels[c]} />
                          <b className="text-sm">
                            {s.gene}{" "}
                            <span className="font-normal text-[var(--muted)]">
                              {s.snpId}
                            </span>
                          </b>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {s.allele1}/{s.allele2} · {s.matchCount}{" "}
                          {labels.riskAlleleMatches}
                        </p>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <AskAiButton question={ask} label={labels.askAi} />
                        <Link
                          href={`/patient/snp/${encodeURIComponent(s.snpId)}?cat=${category}`}
                          className="btn ghost sm"
                        >
                          {labels.mechanism}
                        </Link>
                      </div>
                    </div>
                    <p className="eyebrow mt-3">{labels.plainLanguage}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
                      {expl.whyColour} {expl.plainBody}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {hasRare && (
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
              <Link
                key={v.id ?? `${v.gene}-${v.hgvs}`}
                href={`/patient/rare/${encodeURIComponent(String(v.id ?? v.gene))}`}
                className="block rounded-lg border border-[var(--r-red)]/30 bg-[var(--r-red-bg)]/40 p-4 transition hover:border-[var(--r-red)]"
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
              </Link>
            ))}
          </div>
        </section>
      )}

      {(hasMarkers || hasSnps) && (
        <section className={columnsClass}>
          {hasMarkers && (
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
                {latestMarkers.map((m) => {
                  const c = markerItemColour(m);
                  return (
                    <Link
                      key={m.markerKey}
                      href={`/patient/marker/${encodeURIComponent(m.markerKey)}?cat=${category}`}
                      className={`block rounded-md border px-3 py-2 transition hover:border-[var(--accent)] ${
                        selectedMarkerKey === m.markerKey
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white/70"
                      }`}
                      style={{ borderLeft: `4px solid ${COLOUR_HEX[c]}` }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {m.name || m.markerKey}
                        </span>
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
                {sortedSnps.map((s) => {
                  const c: RiskColour = s.colour || "grey";
                  const isDriver =
                    s.colour != null &&
                    colourRank(s.colour) >=
                      Math.max(2, colourRank(cat.colour));
                  return (
                    <Link
                      key={`${s.gene}-${s.snpId}`}
                      href={`/patient/snp/${encodeURIComponent(s.snpId)}?cat=${category}`}
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
                              {s.snpId.split("__")[0]}
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
