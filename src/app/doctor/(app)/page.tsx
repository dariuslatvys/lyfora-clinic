import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorWorkday } from "@/components/doctor/doctor-workday";

export default async function DoctorHomePage() {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  return <DoctorWorkday locale={locale} />;
}
