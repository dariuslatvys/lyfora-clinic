import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db";
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
import {
  formatClinicVisitWhen,
  listClinicVisitsForPatient,
} from "@/lib/health/clinic-visits";
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

  ensureSchema();
  const clinic = listClinicVisitsForPatient(current.patient.id);
  const clinicUpcoming = clinic
    .filter((v) => v.status === "upcoming")
    .map((v) => ({
      id: v.id,
      title: locale === "en" ? v.titleEn : v.titleLt,
      doctor: locale === "en" ? "Your clinician" : "Jūsų gydytojas",
      specialty: locale === "en" ? "Clinic booking" : "Klinikinė registracija",
      place:
        (locale === "en" ? v.placeEn : v.placeLt) ||
        undefined,
      when: formatClinicVisitWhen(v, locale),
      status: "upcoming" as const,
      relatedRx: [] as string[],
    }));
  const clinicPast = clinic
    .filter((v) => v.status !== "upcoming")
    .map((v) => ({
      id: v.id,
      title: locale === "en" ? v.titleEn : v.titleLt,
      doctor: locale === "en" ? "Your clinician" : "Jūsų gydytojas",
      specialty: locale === "en" ? "Clinic booking" : "Klinikinė registracija",
      place:
        (locale === "en" ? v.placeEn : v.placeLt) ||
        undefined,
      when: formatClinicVisitWhen(v, locale),
      status: "past" as const,
      relatedRx: [] as string[],
    }));

  const upcoming = [
    ...clinicUpcoming,
    ...upcomingVisits().map((v) => mapVisit(v, locale)),
  ];
  const past = [
    ...clinicPast,
    ...pastVisits().map((v) => mapVisit(v, locale)),
  ];

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
