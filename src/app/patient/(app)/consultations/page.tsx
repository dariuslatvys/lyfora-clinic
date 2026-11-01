import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { ConsultationsHub } from "@/components/patient/consultations-hub";
import {
  chatThreadsSorted,
  consultModeLabel,
  formatChatWhen,
  formatConsultWhen,
  pastConsultations,
  upcomingConsultations,
} from "@/lib/health/demo-consultations";

export default async function ConsultationsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  const mapConsult = (c: ReturnType<typeof upcomingConsultations>[number]) => ({
    id: c.id,
    title: locale === "en" ? c.titleEn : c.titleLt,
    reason: locale === "en" ? c.reasonEn : c.reasonLt,
    doctor: locale === "en" ? c.doctorEn : c.doctorLt,
    specialty: locale === "en" ? c.specialtyEn : c.specialtyLt,
    when: formatConsultWhen(c, locale),
    place: locale === "en" ? c.placeEn : c.placeLt,
    mode: consultModeLabel(c.mode, locale),
    urgency: c.urgency,
    visitHref: c.visitId ? `/patient/visits/${c.visitId}` : undefined,
  });

  const upcoming = upcomingConsultations().map(mapConsult);
  const past = pastConsultations().map(mapConsult);
  const chats = chatThreadsSorted().map((th) => ({
    id: th.id,
    title: locale === "en" ? th.titleEn : th.titleLt,
    doctor: locale === "en" ? th.doctorEn : th.doctorLt,
    specialty: locale === "en" ? th.specialtyEn : th.specialtyLt,
    preview: locale === "en" ? th.previewEn : th.previewLt,
    when: formatChatWhen(th.lastAt, locale),
    unread: th.unread,
  }));

  return (
    <ConsultationsHub
      locale={locale}
      upcoming={upcoming}
      past={past}
      chats={chats}
      labels={{
        consultations: labels.consultations,
        urgentConsult: labels.urgentConsult,
        bookVisit: labels.bookVisit,
        askDoctor247: labels.askDoctor247,
      }}
    />
  );
}
