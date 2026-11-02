import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDoctorAnalytics } from "@/lib/doctor/doctor-analytics-data";
import { DoctorAnalyticsView } from "@/components/doctor/doctor-analytics-view";
import type { Locale } from "@/lib/i18n/dictionary";

export default async function DoctorAnalyticsPage() {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const data = loadDoctorAnalytics(locale);
  return <DoctorAnalyticsView data={data} />;
}
