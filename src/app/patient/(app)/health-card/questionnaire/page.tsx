import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { QuestionnaireForm } from "@/components/patient/questionnaire-form";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QuestionnairePage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";

  ensureSchema();
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

  const def = await loadQuestionnaireDefinition();
  const answers = parseStoredAnswers(row?.value);
  const sexField = def.fields.find((f) => f.label === "Biological Sex");
  if (sexField && !answers.values[sexField.id]) {
    answers.values[sexField.id] =
      current.patient.sex === "female" ? "Female" : "Male";
  }

  return (
    <QuestionnaireForm
      locale={locale}
      initialDefinition={def}
      initialAnswers={answers}
    />
  );
}
