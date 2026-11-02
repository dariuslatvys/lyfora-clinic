import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorCalendarView } from "@/components/doctor/doctor-calendar-view";

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
  const list = getDb().select().from(patients).all();
  const patientOpts = list.map((p) => ({
    id: p.id,
    nameLt: patientDisplayName(p.sex, "lt"),
    nameEn: patientDisplayName(p.sex, "en"),
    sex: p.sex as "male" | "female",
    dob: p.dob,
  }));

  return (
    <DoctorCalendarView
      locale={locale}
      patients={patientOpts}
      initialDate={sp.date}
    />
  );
}
