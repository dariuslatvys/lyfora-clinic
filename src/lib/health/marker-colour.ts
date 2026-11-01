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

  // Blood pressure: parse "132/79 mmHg" and grade by ESC-style bands.
  if (m.markerKey === "BLOOD_PRESSURE" || (m.unit && /\d+\s*\/\s*\d+/.test(m.unit))) {
    const match = String(m.unit || "").match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const sys = Number(match[1]);
      const dia = Number(match[2]);
      if (sys < 90 || dia < 60) return "orange"; // too low
      if (sys >= 160 || dia >= 100) return "red";
      if (sys >= 140 || dia >= 90) return "orange";
      // High-normal / elevated — not green optimal (e.g. 132/79)
      if (sys >= 130 || dia >= 85) return "yellow";
      if (sys >= 120 && sys <= 129 && dia < 85) return "green";
      return "green"; // optimal <120/<80 and normal band
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
