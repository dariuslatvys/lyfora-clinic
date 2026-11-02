import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorSickLeaveView } from "@/components/doctor/doctor-sick-leave-view";

export default async function DoctorSickLeavePage() {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  return <DoctorSickLeaveView locale={locale} />;
}
