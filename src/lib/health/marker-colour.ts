import type { RiskColour } from "./colours";
import type { MarkerResult } from "./evaluate";

/** Per-marker display colour for lists (not the whole-category algorithm). */
export function markerItemColour(m: MarkerResult): RiskColour {
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
