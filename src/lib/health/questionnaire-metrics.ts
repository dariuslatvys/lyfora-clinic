import type { QDefinition, QuestionnaireAnswers } from "./questionnaire";

export type QuestionnaireMarkerUpsert = {
  markerKey: string;
  value: number;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  flag: string | null;
  observedAt: string;
  source: "questionnaire";
};

function fieldValue(
  answers: QuestionnaireAnswers,
  def: QDefinition,
  label: string
) {
  const f = def.fields.find((x) => x.label === label);
  return f ? answers.values[f.id] : undefined;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

function bpFlag(sys: number, dia: number): string | null {
  if (sys >= 140 || dia >= 90) return "high";
  if (sys > 129 || dia > 84) return "high";
  return null;
}

/**
 * Map questionnaire vitals into marker_results rows so the digital twin
 * reflects what the patient entered (not only seeded demo labs).
 */
export function markersFromQuestionnaire(
  answers: QuestionnaireAnswers,
  def: QDefinition,
  observedAt = new Date().toISOString().slice(0, 10)
): QuestionnaireMarkerUpsert[] {
  const out: QuestionnaireMarkerUpsert[] = [];

  const bp = fieldValue(answers, def, "Known Blood Pressure");
  if (bp && typeof bp === "object") {
    const sys = num((bp as { sys?: unknown }).sys);
    const dia = num((bp as { dia?: unknown }).dia);
    if (sys != null && dia != null) {
      out.push({
        markerKey: "BLOOD_PRESSURE",
        value: sys,
        unit: `${sys}/${dia} mmHg`,
        refLow: 90,
        refHigh: 129,
        flag: bpFlag(sys, dia),
        observedAt,
        source: "questionnaire",
      });
    }
  }

  const rhr = num(fieldValue(answers, def, "Resting Heart Rate"));
  if (rhr != null) {
    out.push({
      markerKey: "RESTING_HR",
      value: rhr,
      unit: "bpm",
      refLow: 50,
      refHigh: 75,
      flag: rhr > 75 ? "high" : rhr < 50 ? "low" : null,
      observedAt,
      source: "questionnaire",
    });
  }

  const hrv = num(fieldValue(answers, def, "HRV (30-Day Average)"));
  if (hrv != null) {
    out.push({
      markerKey: "HRV",
      value: hrv,
      unit: "ms",
      refLow: 40,
      refHigh: 120,
      flag: hrv < 40 ? "low" : null,
      observedAt,
      source: "questionnaire",
    });
  }

  const vo2 = num(fieldValue(answers, def, "VO₂max"));
  if (vo2 != null) {
    out.push({
      markerKey: "VO2MAX",
      value: vo2,
      unit: "ml/kg/min",
      refLow: 35,
      refHigh: 55,
      flag: vo2 < 35 ? "low" : null,
      observedAt,
      source: "questionnaire",
    });
  }

  const bmi = num(fieldValue(answers, def, "BMI"));
  if (bmi != null) {
    out.push({
      markerKey: "BMI",
      value: bmi,
      unit: "kg/m²",
      refLow: 18.5,
      refHigh: 24.9,
      flag: bmi > 24.9 ? "high" : bmi < 18.5 ? "low" : null,
      observedAt,
      source: "questionnaire",
    });
  }

  const waist = num(fieldValue(answers, def, "Waist Circumference"));
  if (waist != null) {
    out.push({
      markerKey: "WAIST_CIRCUMFERENCE",
      value: waist,
      unit: "cm",
      refLow: null,
      refHigh: 94,
      flag: waist > 94 ? "high" : null,
      observedAt,
      source: "questionnaire",
    });
  }

  return out;
}

export const QUESTIONNAIRE_PHYSICAL_KEYS = [
  "BLOOD_PRESSURE",
  "RESTING_HR",
  "HRV",
  "VO2MAX",
  "BMI",
  "WAIST_CIRCUMFERENCE",
] as const;
