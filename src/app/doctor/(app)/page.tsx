import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorWorkday } from "@/components/doctor/doctor-workday";
import { loadDoctorPatientOptions } from "@/lib/doctor/doctor-patients";

export default async function DoctorHomePage() {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  ensureSchema();
  const patients = loadDoctorPatientOptions();
  return <DoctorWorkday locale={locale} patients={patients} />;
}
