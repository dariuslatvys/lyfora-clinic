import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { COLOUR_HEX, COLOUR_SOFT } from "@/lib/health/colours";
import { MarkerChart } from "@/components/patient/marker-chart";
import type { HealthCategoryId } from "@/lib/health/categories";

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
    return [...map.values()];
  })();

  const selectedMarker = selectedMarkerKey
    ? cat.markers.filter((m) => m.markerKey === selectedMarkerKey)
    : [];
  const markerMeta = selectedMarker[0];
  const selectedSnp = selectedSnpId
    ? cat.snps.find((s) => s.snpId === selectedSnpId)
    : null;

  const showRare =
    cat.id === "cardiovascular" &&
    twin.patient.hasNgsVcf &&
    twin.rare.length > 0;

  const snpTitle =
    cat.id === "pharmacogenetics"
      ? locale === "lt"
        ? "Farmakogenetika (SNP)"
        : "Pharmacogenetics (SNP)"
      : labels.snpTestTitle;

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
        <p className="detail-chip">{labels.colourLabels[cat.colour]}</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl">
          {labels.categoryNames[cat.id as HealthCategoryId]}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--ink-soft)]">
          {cat.summary}
        </p>
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
            {twin.rare.map((v) => (
              <article
                key={v.id}
                className="rounded-lg border border-[var(--line)] bg-white/80 p-4"
              >
                <h4 className="text-lg font-semibold">
                  {locale === "lt" ? v.titleLt : v.titleEn}
                </h4>
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
          <h3 className="font-[family-name:var(--font-display)] text-2xl">
            {labels.markers}
          </h3>
          <div className="mt-3 space-y-2">
            {latestMarkers.length === 0 && (
              <p className="text-sm text-[var(--muted)]">{labels.noData}</p>
            )}
            {latestMarkers.map((m) => {
              const abnormal =
                m.flag === "high" ||
                m.flag === "low" ||
                (m.refHigh != null && m.value > m.refHigh) ||
                (m.refLow != null && m.value < m.refLow);
              return (
                <Link
                  key={m.markerKey}
                  href={`/patient/digital-twin/${category}?marker=${m.markerKey}`}
                  className={`block rounded-md border px-3 py-2 transition hover:border-[var(--accent)] ${
                    selectedMarkerKey === m.markerKey
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-[var(--line)] bg-white/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{m.name || m.markerKey}</span>
                    <span
                      className={`text-sm ${abnormal ? "text-[#C23B2E]" : "text-[var(--ink-soft)]"}`}
                    >
                      {m.value}
                      {m.unit ? ` ${m.unit}` : ""}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {markerMeta && (
            <div className="mt-4 rounded-lg border border-[var(--line)] bg-white/80 p-4">
              <h4 className="text-lg font-semibold">
                {markerMeta.name || markerMeta.markerKey}
              </h4>
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
          <h3 className="font-[family-name:var(--font-display)] text-2xl">
            {labels.genes}
          </h3>
          {cat.id !== "pharmacogenetics" && (
            <div className="mt-2 rounded-lg border border-[var(--line)] bg-white/70 p-3">
              <p className="text-sm font-semibold">{snpTitle}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                {labels.snpTestBlurb}
              </p>
            </div>
          )}
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
            {cat.snps.length === 0 && (
              <p className="text-sm text-[var(--muted)]">{labels.noData}</p>
            )}
            {cat.snps.map((s) => (
              <Link
                key={`${s.gene}-${s.snpId}-${s.nr ?? 0}`}
                href={`/patient/digital-twin/${category}?snp=${s.snpId}`}
                className={`block rounded-md border px-3 py-2 transition hover:border-[var(--accent)] ${
                  selectedSnpId === s.snpId
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)] bg-white/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {s.gene}{" "}
                    <span className="text-[var(--muted)] font-normal">
                      {s.snpId}
                    </span>
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {s.genotypeAvailable
                      ? `${s.allele1}/${s.allele2}`
                      : labels.awaitingDna}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {selectedSnp && (
            <div className="mt-4 rounded-lg border border-[var(--line)] bg-white/80 p-4">
              <h4 className="text-lg font-semibold">
                {selectedSnp.gene} · {selectedSnp.snpId}
              </h4>
              {cat.id !== "pharmacogenetics" && (
                <p className="mt-1 text-xs text-[var(--muted)]">{snpTitle}</p>
              )}
              <p className="mt-2 text-sm">
                <span className="text-[var(--muted)]">{labels.genotype}: </span>
                {selectedSnp.genotypeAvailable
                  ? `${selectedSnp.allele1}/${selectedSnp.allele2} (${selectedSnp.matchCount} match)`
                  : labels.awaitingDna}
              </p>
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
