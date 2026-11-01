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

export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const sp = await searchParams;

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

  // Deep-link: ?step=1 uses 1-based human step numbers from the health card.
  const raw = Number(sp.step || "0");
  const initialStep =
    Number.isFinite(raw) && raw >= 1 ? Math.max(0, Math.floor(raw) - 1) : 0;

  return (
    <QuestionnaireForm
      locale={locale}
      initialDefinition={def}
      initialAnswers={answers}
      initialStep={initialStep}
    />
  );
}
