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
  type QuestionnaireAnswers,
  type QuestionnaireKind,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";

const DEMO_FILES: Record<string, Partial<Record<QuestionnaireKind, string>>> = {
  patient_female: {
    general: "general_questionnaire_demo_female.json",
    women: "women_hormone_demo_answers.json",
  },
  patient_male: {
    general: "general_questionnaire_demo_male.json",
  },
};

function filledCount(answers: QuestionnaireAnswers) {
  return Object.values(answers.values || {}).filter((v) => {
    if (v == null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;
}

function readDemoFile(name: string): QuestionnaireAnswers | null {
  const p = path.join(process.cwd(), "data", "parsed", name);
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, "utf8")) as QuestionnaireAnswers;
  return normalizeQuestionnaireAnswers({
    updatedAt: raw.updatedAt || new Date().toISOString(),
    values: raw.values || {},
    conditionDetails: raw.conditionDetails || {},
    familyMembers: raw.familyMembers || [],
    cancer: raw.cancer || { types: [], treatment: [] },
  });
}

function upsertAnswers(
  patientId: string,
  kind: QuestionnaireKind,
  answers: QuestionnaireAnswers
) {
  const db = getDb();
  const key = questionnaireStorageKey(kind);
  const payload = JSON.stringify(answers);
  const existing = db
    .select()
    .from(questionnaire)
    .where(
      and(eq(questionnaire.patientId, patientId), eq(questionnaire.key, key))
    )
    .get();
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

/** Restore demo questionnaire answers when missing/empty (Vercel /tmp reset). */
export async function ensureDemoQuestionnaire(
  patientId: string,
  kind: QuestionnaireKind
) {
  const file = DEMO_FILES[patientId]?.[kind];
  if (!file) return;

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey(kind);
  const existing = db
    .select()
    .from(questionnaire)
    .where(
      and(eq(questionnaire.patientId, patientId), eq(questionnaire.key, key))
    )
    .get();
  const current = parseStoredAnswers(existing?.value);
  if (filledCount(current) >= 8) return;

  const demo = readDemoFile(file);
  if (!demo) return;

  let answers = demo;
  if (kind === "women") {
    const def = await loadQuestionnaireDefinition("women");
    answers = syncWomenDerivedScores(demo, def);
  }
  upsertAnswers(patientId, kind, answers);
}

/** Keep DOB / height / weight aligned between general and women questionnaires. */
export async function syncSharedMetrics(patientId: string) {
  ensureSchema();
  const db = getDb();
  const generalKey = questionnaireStorageKey("general");
  const womenKey = questionnaireStorageKey("women");
  const generalRow = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, patientId),
        eq(questionnaire.key, generalKey)
      )
    )
    .get();
  const womenRow = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, patientId),
        eq(questionnaire.key, womenKey)
      )
    )
    .get();
  if (!generalRow && !womenRow) return;

  const general = parseStoredAnswers(generalRow?.value);
  const women = parseStoredAnswers(womenRow?.value);

  const gDob = general.values["1_basic_profile_health_metrics__date_of_birth"];
  const gHeight = general.values["1_basic_profile_health_metrics__height"];
  const gWeight = general.values["1_basic_profile_health_metrics__weight"];
  const wDob = women.values.w_birth_date;
  const wHeight = women.values.w_height;
  const wWeight = women.values.w_weight;

  const dob = (typeof gDob === "string" && gDob) || (typeof wDob === "string" && wDob) || null;
  const height =
    (typeof gHeight === "number" && gHeight) ||
    (typeof wHeight === "number" && wHeight) ||
    null;
  const weight =
    (typeof gWeight === "number" && gWeight) ||
    (typeof wWeight === "number" && wWeight) ||
    null;

  if (!dob && height == null && weight == null) return;

  let changed = false;
  if (dob) {
    if (general.values["1_basic_profile_health_metrics__date_of_birth"] !== dob) {
      general.values["1_basic_profile_health_metrics__date_of_birth"] = dob;
      changed = true;
    }
    if (women.values.w_birth_date !== dob) {
      women.values.w_birth_date = dob;
      changed = true;
    }
  }
  if (height != null) {
    if (general.values["1_basic_profile_health_metrics__height"] !== height) {
      general.values["1_basic_profile_health_metrics__height"] = height;
      changed = true;
    }
    if (women.values.w_height !== height) {
      women.values.w_height = height;
      changed = true;
    }
  }
  if (weight != null) {
    if (general.values["1_basic_profile_health_metrics__weight"] !== weight) {
      general.values["1_basic_profile_health_metrics__weight"] = weight;
      changed = true;
    }
    if (women.values.w_weight !== weight) {
      women.values.w_weight = weight;
      changed = true;
    }
  }
  if (!changed && generalRow && womenRow) return;

  const now = new Date().toISOString();
  if (generalRow || dob || height != null || weight != null) {
    const defG = await loadQuestionnaireDefinition("general");
    // recompute age/bmi via women sync helper pattern for general
    const { computeAge, computeBmi } = await import("@/lib/health/questionnaire");
    const age = computeAge(general, defG);
    const bmi = computeBmi(general, defG);
    if (age != null) general.values["1_basic_profile_health_metrics__age"] = age;
    if (bmi != null) general.values["1_basic_profile_health_metrics__bmi"] = bmi;
    general.updatedAt = general.updatedAt || now;
    upsertAnswers(patientId, "general", normalizeQuestionnaireAnswers(general));
  }
  if (womenRow || patientId === "patient_female") {
    const defW = await loadQuestionnaireDefinition("women");
    women.updatedAt = women.updatedAt || now;
    upsertAnswers(
      patientId,
      "women",
      syncWomenDerivedScores(normalizeQuestionnaireAnswers(women), defW)
    );
  }
}
