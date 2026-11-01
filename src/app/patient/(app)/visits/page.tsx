import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  formatVisitWhen,
  pastVisits,
  upcomingVisits,
  visitDoctor,
  visitPlace,
  visitSpecialty,
  visitTitle,
} from "@/lib/health/demo-visits";
import { prescriptionsForVisit } from "@/lib/health/demo-prescriptions";
import { VisitsTabs } from "@/components/patient/visits-tabs";

function mapVisit(
  v: ReturnType<typeof upcomingVisits>[number],
  locale: "lt" | "en"
) {
  const relatedRx = prescriptionsForVisit(v.id).map((r) =>
    locale === "en"
      ? `${r.substanceEn} ${r.strength}`
      : `${r.substanceLt} ${r.strength}`
  );
  return {
    id: v.id,
    title: visitTitle(v, locale),
    doctor: visitDoctor(v, locale),
    specialty: visitSpecialty(v, locale),
    place: visitPlace(v, locale),
    when: formatVisitWhen(v, locale),
    status: v.status,
    relatedRx,
  };
}

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const sp = await searchParams;

  const upcoming = upcomingVisits().map((v) => mapVisit(v, locale));
  const past = pastVisits().map((v) => mapVisit(v, locale));

  return (
    <VisitsTabs
      locale={locale}
      upcoming={upcoming}
      past={past}
      bookLabel={labels.bookVisit}
      initialTab={sp.tab === "history" ? "history" : "upcoming"}
    />
  );
}
