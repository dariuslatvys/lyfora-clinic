/**
 * Sex-restricted lab markers. Used when seeding demos and when loading a twin
 * so male-only panels never appear for female patients (and vice versa).
 */

const MALE_ONLY = new Set([
  "PSA",
  "FREE_PSA",
  "FPSA",
  "PSA_FREE",
  "TESTOSTERONE",
  "TOTAL_TESTOSTERONE",
  "FREE_TESTOSTERONE",
  "SHBG_MALE", // if ever used as distinct
]);

const FEMALE_ONLY = new Set([
  "ESTRADIOL",
  "PROGESTERONE",
  "AMH",
  // FSH/LH/prolactin are used in both sexes clinically — keep shared
]);

export function markerAllowedForSex(
  markerKey: string,
  sex: "male" | "female" | string | null | undefined
): boolean {
  const key = (markerKey || "").trim().toUpperCase();
  if (!key) return true;
  if (sex === "female" && MALE_ONLY.has(key)) return false;
  if (sex === "male" && FEMALE_ONLY.has(key)) return false;
  return true;
}

export function filterMarkersForSex<T extends { markerKey: string }>(
  markers: T[],
  sex: "male" | "female" | string | null | undefined
): T[] {
  return markers.filter((m) => markerAllowedForSex(m.markerKey, sex));
}
