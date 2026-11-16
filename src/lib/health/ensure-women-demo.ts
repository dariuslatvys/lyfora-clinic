import {
  ensureDemoQuestionnaire,
  syncSharedMetrics,
} from "@/lib/health/ensure-demo-questionnaires";

/** @deprecated use ensureDemoQuestionnaire — kept for existing imports */
export async function ensureWomenDemoAnswers(patientId: string) {
  await ensureDemoQuestionnaire(patientId, "women");
  if (patientId === "patient_female") {
    await syncSharedMetrics(patientId);
  }
}
