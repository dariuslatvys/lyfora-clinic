import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { CategoryCard } from "@/components/patient/category-card";

export default async function DigitalTwinPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  return (
    <div className="space-y-6">
      <section className="panel rise-in">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          {labels.overview}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          {labels.categoriesTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ink-soft)]">
          {labels.categoriesHint}
        </p>
        {!twin.patient.hasSnpArray && (
          <p className="mt-3 detail-chip">{labels.awaitingDna} · SNP</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {twin.categories.map((cat, i) => (
          <div
            key={cat.id}
            className={i % 2 === 0 ? "rise-in" : "rise-in-delay"}
          >
            <CategoryCard
              id={cat.id}
              title={labels.categoryNames[cat.id] || cat.id}
              colour={cat.colour}
              summary={cat.summary}
              openLabel={labels.openCategory}
              colourLabel={labels.colourLabels[cat.colour]}
              markerCount={cat.latestMarkerCount}
              snpMatches={cat.snpMatchCount}
              geneticBadge={cat.geneticBadge}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
