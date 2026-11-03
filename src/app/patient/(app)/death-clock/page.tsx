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
  const sex = (current.patient.sex as "male" | "female") || "male";
  const name = patientDisplayName(sex, locale, current.patient.id);
  const data = loadDeathClock(current.patient.id, locale, name);
  if (!data) {
    // Twin missing should not silently send women/men to login — retry not needed;
    // fall back only when data truly cannot be built.
    redirect("/patient/digital-twin");
  }
  return <DeathClockView data={data} />;
}
