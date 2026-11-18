import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { PatientCalendarView } from "@/components/patient/patient-calendar-view";
import { buildHealthCard } from "@/lib/health/health-card-data";
import { listPatientCalendarEvents } from "@/lib/health/patient-monitoring";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { ensurePetraitisPatient } from "@/lib/health/petraitis-patient";

export default async function PatientCalendarPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const sex =
    current.patient.sex === "female" ? ("female" as const) : ("male" as const);

  ensureSchema();
  ensurePetraitisPatient();
  const db = getDb();
  const key = questionnaireStorageKey();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, key)
      )
    )
    .get();
  const answers = parseStoredAnswers(row?.value);
  const card = buildHealthCard({
    patientName: current.patient.fullName,
    sex,
    dob: current.patient.dob,
    answers,
    patientId: current.patient.id,
  });
  const events = listPatientCalendarEvents({
    patientId: current.patient.id,
    sex,
    vaccines: card.vaccines,
  });

  return <PatientCalendarView locale={locale} events={events} />;
}
