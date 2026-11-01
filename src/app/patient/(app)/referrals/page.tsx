import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  allReferrals,
  referralStatusLabel,
} from "@/lib/health/demo-visits";
import { ReferralsTabs } from "@/components/patient/referrals-tabs";

export default async function ReferralsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const rows = allReferrals();

  const mapRow = (r: (typeof rows)[number]) => ({
    id: r.id,
    visitId: r.visitId,
    title: locale === "en" ? r.titleEn : r.titleLt,
    specialty: locale === "en" ? r.toSpecialtyEn : r.toSpecialtyLt,
    place: locale === "en" ? r.toPlaceEn : r.toPlaceLt,
    visitTitle: locale === "en" ? r.visitTitleEn : r.visitTitleLt,
    notes: locale === "en" ? r.notesEn : r.notesLt,
    date: r.date,
    status: r.status,
    statusLabel: referralStatusLabel(r.status, locale),
  });

  const active = rows
    .filter((r) => r.status === "issued" || r.status === "scheduled")
    .map(mapRow);
  const history = rows.filter((r) => r.status === "completed").map(mapRow);

  return (
    <ReferralsTabs
      locale={locale}
      active={active}
      history={history}
      blurb={labels.referralsBlurb}
    />
  );
}
