import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { QuestionnaireForm } from "@/components/patient/questionnaire-form";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
  syncWomenDerivedScores,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WomenQuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  if (current.patient.sex !== "female") {
    redirect("/patient/health-card/questionnaire");
  }
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const sp = await searchParams;

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey("women");
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

  const def = await loadQuestionnaireDefinition("women");
  let answers = parseStoredAnswers(row?.value);

  // Prefill DOB / height / weight from patient profile or general questionnaire.
  if (!answers.values.w_birth_date && current.patient.dob) {
    answers.values.w_birth_date = current.patient.dob;
  }
  const generalKey = questionnaireStorageKey("general");
  const generalRow = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, generalKey)
      )
    )
    .get();
  if (generalRow?.value) {
    const general = parseStoredAnswers(generalRow.value);
    const map: Array<[string, (id: string) => boolean]> = [
      ["w_birth_date", (id) => id.includes("date_of_birth")],
      ["w_height", (id) => id.endsWith("__height") || id.includes("height")],
      ["w_weight", (id) => id.endsWith("__weight") || id.includes("weight")],
    ];
    for (const [target, match] of map) {
      if (answers.values[target] != null && answers.values[target] !== "") {
        continue;
      }
      for (const [id, value] of Object.entries(general.values)) {
        if (match(id) && value != null && value !== "") {
          answers.values[target] = value;
          break;
        }
      }
    }
  }

  answers = syncWomenDerivedScores(answers, def);

  const raw = Number(sp.step || "0");
  const initialStep =
    Number.isFinite(raw) && raw >= 1 ? Math.max(0, Math.floor(raw) - 1) : 0;

  return (
    <QuestionnaireForm
      locale={locale}
      patientId={current.patient.id}
      kind="women"
      initialDefinition={def}
      initialAnswers={answers}
      initialStep={initialStep}
      titleLt={def.titleLt || "Papildomas moters klausimynas"}
      titleEn={def.titleEn || "Additional women's questionnaire"}
      introLt={def.introLt}
      introEn={def.introEn}
    />
  );
}
