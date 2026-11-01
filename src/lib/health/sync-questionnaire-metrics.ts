import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { markerResults } from "@/lib/db/schema";
import type { QDefinition, QuestionnaireAnswers } from "./questionnaire";
import {
  QUESTIONNAIRE_PHYSICAL_KEYS,
  markersFromQuestionnaire,
} from "./questionnaire-metrics";

/** Upsert physical vitals from questionnaire into marker_results. */
export function syncQuestionnaireMetrics(
  patientId: string,
  answers: QuestionnaireAnswers,
  def: QDefinition
) {
  const db = getDb();
  const rows = markersFromQuestionnaire(answers, def);
  const keys = [...QUESTIONNAIRE_PHYSICAL_KEYS];

  // Drop prior questionnaire-sourced rows for these keys
  db.delete(markerResults)
    .where(
      and(
        eq(markerResults.patientId, patientId),
        eq(markerResults.source, "questionnaire"),
        inArray(markerResults.markerKey, keys)
      )
    )
    .run();

  // Also remove seeded physical-demo rows for keys the patient now provides,
  // so the twin shows their numbers (e.g. 127/77) instead of demo 142.
  const provided = rows.map((r) => r.markerKey);
  if (provided.length) {
    db.delete(markerResults)
      .where(
        and(
          eq(markerResults.patientId, patientId),
          eq(markerResults.source, "physical-demo"),
          inArray(markerResults.markerKey, provided)
        )
      )
      .run();
  }

  for (const r of rows) {
    db.insert(markerResults)
      .values({
        patientId,
        markerKey: r.markerKey,
        value: r.value,
        unit: r.unit,
        refLow: r.refLow,
        refHigh: r.refHigh,
        flag: r.flag,
        observedAt: r.observedAt,
        source: r.source,
      })
      .run();
  }

  return rows;
}
