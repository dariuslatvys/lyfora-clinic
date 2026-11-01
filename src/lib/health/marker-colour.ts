import type { RiskColour } from "./colours";

/** Per-marker display colour for lists (not the whole-category algorithm). */
export function markerItemColour(m: {
  value: number;
  refLow?: number | null;
  refHigh?: number | null;
  flag?: string | null;
}): RiskColour {
  const high =
    m.flag === "high" || (m.refHigh != null && m.value > m.refHigh);
  const low = m.flag === "low" || (m.refLow != null && m.value < m.refLow);

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
