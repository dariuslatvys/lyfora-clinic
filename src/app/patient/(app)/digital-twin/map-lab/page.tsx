import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { RadialHealthMapLab } from "@/components/patient/radial-health-map-lab";

export default async function HealthMapLabPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const sex =
    current.patient.sex === "female" ? ("female" as const) : ("male" as const);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const mapCategories = twin.categories.map((c) => ({
    id: c.id,
    title: labels.categoryNames[c.id] || c.id,
    colour: c.colour,
    colourLabel: labels.colourLabels[c.colour],
    geneticBadge: c.geneticBadge || c.rare.length > 0,
    geneticMark: labels.geneMarkShort,
  }));

  return (
    <div className="stack" style={{ gap: 14 }}>
      <RadialHealthMapLab
        locale={locale}
        sex={sex}
        categories={mapCategories}
        geneHint={labels.geneMarkerHint}
      />
      <p className="small muted m-0">
        {locale === "en" ? (
          <>
            Preview only —{" "}
            <Link href="/patient/digital-twin">open the live overview</Link>.
          </>
        ) : (
          <>
            Tik peržiūra —{" "}
            <Link href="/patient/digital-twin">atidaryti dabartinę apžvalgą</Link>
            .
          </>
        )}
      </p>
    </div>
  );
}
