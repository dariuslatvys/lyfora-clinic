import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorCalendarView } from "@/components/doctor/doctor-calendar-view";
import { loadDoctorPatientOptions } from "@/lib/doctor/doctor-patients";

export default async function DoctorCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const sp = await searchParams;

  ensureSchema();
  const patientOpts = loadDoctorPatientOptions();

  return (
    <DoctorCalendarView
      locale={locale}
      patients={patientOpts}
      initialDate={sp.date}
    />
  );
}
