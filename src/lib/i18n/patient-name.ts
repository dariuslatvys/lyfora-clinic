import type { Locale } from "./dictionary";

/** Demo patient display names — never use real personal identities in UI. */
export function patientDisplayName(
  sex: "male" | "female" | string,
  locale: Locale
): string {
  if (sex === "female") {
    return locale === "en" ? "Jane Smith" : "Rasa Rasaitė";
  }
  return locale === "en" ? "John Doe" : "Jonas Jonaitis";
}
