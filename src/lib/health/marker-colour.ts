import type { RiskColour } from "./colours";

/** Per-marker display colour for lists (not the whole-category algorithm). */
export function markerItemColour(m: {
  value: number;
  refLow?: number | null;
  refHigh?: number | null;
  flag?: string | null;
  unit?: string | null;
  markerKey?: string;
}): RiskColour {
  let high =
    m.flag === "high" || (m.refHigh != null && m.value > m.refHigh);
  let low = m.flag === "low" || (m.refLow != null && m.value < m.refLow);

  // Blood pressure unit may carry "145/95 mmHg" — honour diastolic too.
  if (m.markerKey === "BLOOD_PRESSURE" || (m.unit && /\d+\s*\/\s*\d+/.test(m.unit))) {
    const match = String(m.unit || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const sys = Number(match[1]);
      const dia = Number(match[2]);
      if (sys >= 140 || dia >= 90) high = true;
      else if (sys > 129 || dia > 84) high = true;
      if (sys < 90 || dia < 60) low = true;
    }
  }

  if (!high && !low) {
    if (m.refLow == null && m.refHigh == null && !m.flag) return "grey";
    return "green";
  }

  if (high && m.refHigh != null && m.value >= m.refHigh * 1.35) return "red";
  if (low && m.refLow != null && m.refLow !== 0 && m.value <= m.refLow * 0.65) {
    return "red";
  }
  if (high || low) return "orange";
  return "yellow";
}

export type FlaggedLab = {
  markerKey: string;
  name: string;
  value: number;
  unit?: string | null;
  observedAt: string;
  colour: RiskColour;
};

/** Latest abnormal markers across the twin. */
export function collectFlaggedLabs(
  markers: {
    markerKey: string;
    name?: string;
    value: number;
    unit?: string | null;
    refLow?: number | null;
    refHigh?: number | null;
    flag?: string | null;
    observedAt: string;
  }[]
): FlaggedLab[] {
  const latest = new Map<string, (typeof markers)[number]>();
  for (const m of [...markers].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt)
  )) {
    latest.set(m.markerKey, m);
  }
  return [...latest.values()]
    .map((m) => ({
      markerKey: m.markerKey,
      name: m.name || m.markerKey,
      value: m.value,
      unit: m.unit,
      observedAt: m.observedAt,
      colour: markerItemColour(m),
    }))
    .filter((m) => m.colour !== "green" && m.colour !== "grey")
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
}
