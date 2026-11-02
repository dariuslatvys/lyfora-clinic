import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { patients, users } from "@/lib/db/schema";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorCalendarView } from "@/components/doctor/doctor-calendar-view";
import type { DoctorPatientOption } from "@/lib/doctor/doctor-calendar";

/** Demo contact fields for fragment search (phone / asmens kodas). */
const DEMO_CONTACTS: Record<
  string,
  { phone: string; nationalId: string; nameLt: [string, string]; nameEn: [string, string] }
> = {
  patient_male: {
    phone: "+370 612 44 018",
    nationalId: "37204178512",
    nameLt: ["Jonas", "Jonaitis"],
    nameEn: ["John", "Doe"],
  },
  patient_female: {
    phone: "+370 655 20 377",
    nationalId: "48803121234",
    nameLt: ["Rasa", "Rasaitė"],
    nameEn: ["Jane", "Smith"],
  },
};

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
  const db = getDb();
  const list = db.select().from(patients).all();
  const patientOpts: DoctorPatientOption[] = list.map((p) => {
    const user = db.select().from(users).where(eq(users.id, p.userId)).get();
    const demo = DEMO_CONTACTS[p.id];
    const nameLt = patientDisplayName(p.sex, "lt");
    const nameEn = patientDisplayName(p.sex, "en");
    const [firstLt, ...restLt] = nameLt.split(/\s+/);
    const [firstEn, ...restEn] = nameEn.split(/\s+/);
    return {
      id: p.id,
      nameLt,
      nameEn,
      firstNameLt: demo?.nameLt[0] || firstLt || nameLt,
      lastNameLt: demo?.nameLt[1] || restLt.join(" ") || nameLt,
      firstNameEn: demo?.nameEn[0] || firstEn || nameEn,
      lastNameEn: demo?.nameEn[1] || restEn.join(" ") || nameEn,
      sex: p.sex as "male" | "female",
      dob: p.dob,
      email: user?.email || "",
      phone: demo?.phone || "",
      nationalId: p.nationalId || demo?.nationalId || "",
    };
  });

  return (
    <DoctorCalendarView
      locale={locale}
      patients={patientOpts}
      initialDate={sp.date}
    />
  );
}
