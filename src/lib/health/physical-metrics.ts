/** Keys treated as physical / functional metrics (not lab biomarkers). */
export const PHYSICAL_MARKER_KEYS = new Set([
  "HRV",
  "RESTING_HR",
  "BLOOD_PRESSURE",
  "VO2MAX",
  "ACTIVITY_DATA",
  "BMI",
  "SLEEP_DATA",
  "WAIST",
  "WAIST_CIRCUMFERENCE",
  "WAIST_CIRC",
]);

export function isPhysicalMarkerKey(key: string) {
  return PHYSICAL_MARKER_KEYS.has(key);
}

export function splitMarkersByKind<T extends { markerKey: string }>(
  markers: T[]
): { biomarkers: T[]; physical: T[] } {
  const biomarkers: T[] = [];
  const physical: T[] = [];
  for (const m of markers) {
    if (isPhysicalMarkerKey(m.markerKey)) physical.push(m);
    else biomarkers.push(m);
  }
  return { biomarkers, physical };
}
