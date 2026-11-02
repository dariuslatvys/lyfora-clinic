import type { Locale } from "./dictionary";

export const PETRAITIS_PATIENT_ID = "patient_petraitis";

/** Demo patient display names — never use real personal identities in UI. */
export function patientDisplayName(
  sex: "male" | "female" | string,
  locale: Locale,
  patientId?: string | null
): string {
  if (patientId === PETRAITIS_PATIENT_ID) {
    return locale === "en" ? "Peter Peters" : "Petras Petraitis";
  }
  if (sex === "female") {
    return locale === "en" ? "Jane Smith" : "Rasa Rasaitė";
  }
  return locale === "en" ? "John Doe" : "Jonas Jonaitis";
}
