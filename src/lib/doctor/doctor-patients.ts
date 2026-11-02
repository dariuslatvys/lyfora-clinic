import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { patients, users } from "@/lib/db/schema";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import type { DoctorPatientOption } from "@/lib/doctor/doctor-calendar";
import { ensurePetraitisPatient } from "@/lib/health/petraitis-patient";

/** Demo contact fields for fragment search (phone / asmens kodas). */
const DEMO_CONTACTS: Record<
  string,
  {
    phone: string;
    nationalId: string;
    nameLt: [string, string];
    nameEn: [string, string];
  }
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
  patient_petraitis: {
    phone: "+370 686 11 902",
    nationalId: "37506181234",
    nameLt: ["Petras", "Petraitis"],
    nameEn: ["Peter", "Peters"],
  },
};

export function loadDoctorPatientOptions(): DoctorPatientOption[] {
  ensurePetraitisPatient();
  const db = getDb();
  const list = db.select().from(patients).all();
  return list.map((p) => {
    const user = db.select().from(users).where(eq(users.id, p.userId)).get();
    const demo = DEMO_CONTACTS[p.id];
    const nameLt = patientDisplayName(p.sex, "lt", p.id);
    const nameEn = patientDisplayName(p.sex, "en", p.id);
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
}
