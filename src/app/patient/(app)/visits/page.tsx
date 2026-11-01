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
import { VisitsTabs } from "@/components/patient/visits-tabs";

export default async function VisitsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  const upcoming = upcomingVisits().map((v) => ({
    id: v.id,
    title: visitTitle(v, locale),
    doctor: visitDoctor(v, locale),
    specialty: visitSpecialty(v, locale),
    place: visitPlace(v, locale),
    when: formatVisitWhen(v, locale),
  }));

  const past = pastVisits().map((v) => ({
    id: v.id,
    title: visitTitle(v, locale),
    doctor: visitDoctor(v, locale),
    specialty: visitSpecialty(v, locale),
    place: visitPlace(v, locale),
    when: formatVisitWhen(v, locale),
  }));

  return (
    <VisitsTabs
      locale={locale}
      upcoming={upcoming}
      past={past}
      bookLabel={labels.bookVisit}
    />
  );
}
