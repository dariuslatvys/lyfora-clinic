import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import {
  emptyAnswers,
  parseStoredAnswers,
  questionnaireStorageKey,
  type QuestionnaireAnswers,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";
import { syncQuestionnaireMetrics } from "@/lib/health/sync-questionnaire-metrics";

export async function GET() {
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
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
  // Prefill sex from patient profile if empty
  const sexField = def.fields.find(
    (f: { label: string; id: string }) => f.label === "Biological Sex"
  );
  if (sexField && !answers.values[sexField.id]) {
    answers.values[sexField.id] =
      current.patient.sex === "female" ? "Female" : "Male";
  }

  return NextResponse.json({
    definition: def,
    answers,
    patientSex: current.patient.sex,
  });
}

export async function PUT(req: Request) {
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { answers?: QuestionnaireAnswers };
  try {
    body = (await req.json()) as { answers?: QuestionnaireAnswers };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.answers) {
    return NextResponse.json({ error: "answers required" }, { status: 400 });
  }

  const answers: QuestionnaireAnswers = {
    ...emptyAnswers(),
    ...body.answers,
    updatedAt: new Date().toISOString(),
  };

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey();
  const existing = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, key)
      )
    )
    .get();

  const payload = JSON.stringify(answers);
  if (existing) {
    db.update(questionnaire)
      .set({ value: payload })
      .where(eq(questionnaire.id, existing.id))
      .run();
  } else {
    db.insert(questionnaire)
      .values({
        patientId: current.patient.id,
        key,
        value: payload,
      })
      .run();
  }

  // Push vitals (BP, HRV, VO₂max, …) into the twin marker store
  const def = await loadQuestionnaireDefinition();
  syncQuestionnaireMetrics(current.patient.id, answers, def);

  return NextResponse.json({ ok: true, answers });
}
