import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
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
import { syncQuestionnaireMetrics } from "@/lib/health/sync-questionnaire-metrics";

function parseKind(raw: unknown): QuestionnaireKind {
  return raw === "women" ? "women" : "general";
}

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const kind = parseKind(url.searchParams.get("kind"));

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey(kind);
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

  const def = await loadQuestionnaireDefinition(kind);
  let answers = parseStoredAnswers(row?.value);
  if (kind === "general") {
    const sexField = def.fields.find(
      (f: { label: string; id: string }) => f.label === "Biological Sex"
    );
    if (sexField && !answers.values[sexField.id]) {
      answers.values[sexField.id] =
        current.patient.sex === "female" ? "Female" : "Male";
    }
  } else {
    answers = syncWomenDerivedScores(answers, def);
  }

  return NextResponse.json({
    kind,
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
  let body: { answers?: QuestionnaireAnswers; kind?: QuestionnaireKind };
  try {
    body = (await req.json()) as {
      answers?: QuestionnaireAnswers;
      kind?: QuestionnaireKind;
    };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.answers) {
    return NextResponse.json({ error: "answers required" }, { status: 400 });
  }

  const kind = parseKind(body.kind);
  const def = await loadQuestionnaireDefinition(kind);
  let answers: QuestionnaireAnswers = normalizeQuestionnaireAnswers({
    ...body.answers,
    updatedAt: new Date().toISOString(),
  });
  if (kind === "women") {
    answers = syncWomenDerivedScores(answers, def);
  }

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey(kind);
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

  if (kind === "general") {
    syncQuestionnaireMetrics(current.patient.id, answers, def);
  }

  return NextResponse.json({ ok: true, answers, kind });
}
