import fs from "fs";
import path from "path";
import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import {
  normalizeQuestionnaireAnswers,
  parseStoredAnswers,
  questionnaireStorageKey,
  syncWomenDerivedScores,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";

const FEMALE_DEMO_ID = "patient_female";

/**
 * On Vercel the /tmp DB may predate the women questionnaire seed.
 * Ensure the demo female patient always has filled PDF v2.8 answers.
 */
export async function ensureWomenDemoAnswers(patientId: string) {
  if (patientId !== FEMALE_DEMO_ID) return;

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey("women");
  const existing = db
    .select()
    .from(questionnaire)
    .where(
      and(eq(questionnaire.patientId, patientId), eq(questionnaire.key, key))
    )
    .get();

  const parsed = parseStoredAnswers(existing?.value);
  const hasAnswers =
    !!parsed.updatedAt && Object.keys(parsed.values || {}).length > 5;
  if (hasAnswers) return;

  const demoPath = path.join(
    process.cwd(),
    "data",
    "parsed",
    "women_hormone_demo_answers.json"
  );
  if (!fs.existsSync(demoPath)) return;

  const raw = JSON.parse(fs.readFileSync(demoPath, "utf8")) as {
    updatedAt?: string;
    values?: Record<string, unknown>;
    cancer?: { types: string[]; treatment: string[] };
  };
  const def = await loadQuestionnaireDefinition("women");
  const seeded = syncWomenDerivedScores(
    normalizeQuestionnaireAnswers({
      updatedAt: raw.updatedAt || new Date().toISOString(),
      values: raw.values || {},
      conditionDetails: {},
      familyMembers: [],
      cancer: raw.cancer || { types: [], treatment: [] },
    }),
    def
  );
  const payload = JSON.stringify(seeded);

  if (existing) {
    db.update(questionnaire)
      .set({ value: payload })
      .where(eq(questionnaire.id, existing.id))
      .run();
  } else {
    db.insert(questionnaire)
      .values({ patientId, key, value: payload })
      .run();
  }
}
