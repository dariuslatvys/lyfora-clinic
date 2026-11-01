import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { IntegrationsView } from "@/components/patient/integrations-view";

export default async function IntegrationsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  return <IntegrationsView labels={labels} locale={locale} />;
}
