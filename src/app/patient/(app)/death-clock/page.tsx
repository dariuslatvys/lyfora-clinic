import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import type { Locale } from "@/lib/i18n/dictionary";
import { loadDeathClock } from "@/lib/health/death-clock";
import { DeathClockView } from "@/components/patient/death-clock-view";

export default async function DeathClockPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const name = patientDisplayName(current.patient.sex, locale, current.patient.id);
  const data = loadDeathClock(current.patient.id, locale, name);
  if (!data) redirect("/login/patient");
  return <DeathClockView data={data} />;
}
