import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { buildRecommendations } from "@/lib/health/recommendations";
import { RecommendationsView } from "@/components/patient/recommendations-view";

export default async function RecommendationsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const items = buildRecommendations(twin, locale, labels.categoryNames);

  return (
    <RecommendationsView
      locale={locale}
      items={items}
      colourLabels={labels.colourLabels}
    />
  );
}
