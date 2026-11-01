import { isPhysicalMarkerKey } from "./physical-metrics";
import { markerItemColour } from "./marker-colour";
import type { RiskColour } from "./colours";

export type GoalItem = {
  title: string;
  detail?: string;
  progress: number;
  markerKey: string;
  colour: RiskColour;
  kind: "physical" | "lab";
};

type MarkerLike = {
  markerKey: string;
  name?: string;
  value: number;
  unit?: string | null;
  refLow?: number | null;
  refHigh?: number | null;
  flag?: string | null;
  observedAt: string;
};

type Locale = "lt" | "en";

type TargetSpec = {
  keys: string[];
  /** Ideal / target value used for progress toward the goal. */
  target: (m: MarkerLike) => number;
  title: (m: MarkerLike, locale: Locale) => string;
  detail?: (m: MarkerLike, locale: Locale) => string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Progress 0–100 toward being in range (100 = already ok). */
function progressTowardRange(m: MarkerLike, target: number): number {
  const high =
    m.flag === "high" || (m.refHigh != null && m.value > m.refHigh);
  const low = m.flag === "low" || (m.refLow != null && m.value < m.refLow);

  if (!high && !low) return 100;

  if (high) {
    const ceiling = m.refHigh ?? target;
    if (m.value <= ceiling) return 100;
    // How far above the limit — closer to target ⇒ higher progress
    const overshoot = m.value - ceiling;
    const span = Math.max(ceiling * 0.35, 1);
    return Math.round(clamp(100 - (overshoot / span) * 100, 5, 95));
  }

  // low
  const floor = m.refLow ?? target;
  if (m.value >= floor) return 100;
  const deficit = floor - m.value;
  const span = Math.max(floor * 0.35, 1);
  return Math.round(clamp(100 - (deficit / span) * 100, 5, 95));
}

function bpDisplay(m: MarkerLike) {
  // Unit may already be "127/77 mmHg" after questionnaire sync
  if (m.unit && /\d+\s*\/\s*\d+/.test(m.unit)) return m.unit.replace(/\s*mmHg/i, "");
  return String(m.value);
}

const TARGETS: TargetSpec[] = [
  {
    keys: ["BLOOD_PRESSURE"],
    target: () => 120,
    title: (m, locale) =>
      locale === "en"
        ? `Blood pressure toward < 130/85 (now ${bpDisplay(m)})`
        : `Kraujospūdis link < 130/85 (dabar ${bpDisplay(m)})`,
    detail: (_m, locale) =>
      locale === "en"
        ? "Aim for under 130 systolic and 85 diastolic with lifestyle and follow-up."
        : "Siekti sistolinio < 130 ir diastolinio < 85 — gyvenimo būdas ir kontrolė.",
  },
  {
    keys: ["RESTING_HR"],
    target: () => 65,
    title: (m, locale) =>
      locale === "en"
        ? `Resting heart rate toward 50–75 bpm (now ${m.value})`
        : `Ramybės pulsas link 50–75 dūž./min (dabar ${m.value})`,
  },
  {
    keys: ["HRV"],
    target: () => 50,
    title: (m, locale) =>
      locale === "en"
        ? `HRV toward ≥ 40 ms (now ${m.value} ms)`
        : `HRV link ≥ 40 ms (dabar ${m.value} ms)`,
    detail: (_m, locale) =>
      locale === "en"
        ? "Sleep, recovery and stress management help raise HRV."
        : "Miegas, atsigavimas ir streso valdymas padeda kelti HRV.",
  },
  {
    keys: ["VO2MAX"],
    target: () => 38,
    title: (m, locale) =>
      locale === "en"
        ? `VO₂max toward ≥ 35 ml/kg/min (now ${m.value})`
        : `VO₂max link ≥ 35 ml/kg/min (dabar ${m.value})`,
    detail: (_m, locale) =>
      locale === "en"
        ? "Regular aerobic training is the main lever."
        : "Reguliarus aerobinis krūvis — pagrindinis svertas.",
  },
  {
    keys: ["ACTIVITY_DATA"],
    target: () => 8000,
    title: (m, locale) =>
      locale === "en"
        ? `Daily steps toward ≥ 7,000 (now ${Math.round(m.value)})`
        : `Žingsniai link ≥ 7 000 / dieną (dabar ${Math.round(m.value)})`,
  },
  {
    keys: ["BMI"],
    target: () => 24,
    title: (m, locale) =>
      locale === "en"
        ? `BMI toward 18.5–24.9 (now ${m.value})`
        : `KMI link 18,5–24,9 (dabar ${m.value})`,
  },
  {
    keys: ["WAIST", "WAIST_CIRCUMFERENCE"],
    target: () => 90,
    title: (m, locale) =>
      locale === "en"
        ? `Waist toward < 94 cm (now ${m.value} cm)`
        : `Juosmuo link < 94 cm (dabar ${m.value} cm)`,
  },
  {
    keys: ["SLEEP_DATA"],
    target: () => 7.5,
    title: (m, locale) =>
      locale === "en"
        ? `Sleep toward 7+ hours (now ${m.value})`
        : `Miegas link 7+ val. (dabar ${m.value})`,
  },
  {
    keys: ["LDL"],
    target: () => 2.6,
    title: (m, locale) =>
      locale === "en"
        ? `LDL toward < ${m.refHigh ?? 2.6} mmol/L (now ${m.value})`
        : `MTL link < ${String(m.refHigh ?? 2.6).replace(".", ",")} mmol/L (dabar ${String(m.value).replace(".", ",")})`,
  },
  {
    keys: ["HS_CRP", "CRP"],
    target: (m) => m.refHigh ?? 3,
    title: (m, locale) =>
      locale === "en"
        ? `Inflammation (CRP) toward normal (now ${m.value})`
        : `Uždegimas (CRP) link normos (dabar ${m.value})`,
  },
  {
    keys: ["GLUCOSE"],
    target: () => 5.2,
    title: (m, locale) =>
      locale === "en"
        ? `Glucose toward normal range (now ${m.value})`
        : `Gliukozė link normos (dabar ${m.value})`,
  },
  {
    keys: ["HBA1C"],
    target: () => 5.5,
    title: (m, locale) =>
      locale === "en"
        ? `HbA1c toward target (now ${m.value})`
        : `HbA1c link tikslo (dabar ${m.value})`,
  },
  {
    keys: ["VITAMIN_D"],
    target: () => 75,
    title: (m, locale) =>
      locale === "en"
        ? `Vitamin D toward ≥ 75 nmol/L (now ${m.value})`
        : `Vitaminas D link ≥ 75 nmol/L (dabar ${m.value})`,
  },
];

function latestByKey(markers: MarkerLike[]) {
  const map = new Map<string, MarkerLike>();
  for (const m of [...markers].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt)
  )) {
    map.set(m.markerKey, m);
  }
  return [...map.values()];
}

function isOutOfRange(m: MarkerLike) {
  const c = markerItemColour(m);
  return c !== "green" && c !== "grey";
}

/**
 * Build personal goals from out-of-range physical metrics first,
 * then lab markers — so Summary “Mano tikslai” mirrors real deviations.
 */
export function goalsFromMetrics(
  markers: MarkerLike[],
  locale: Locale,
  limit = 5
): GoalItem[] {
  const latest = latestByKey(markers).filter(isOutOfRange);
  const physical = latest.filter((m) => isPhysicalMarkerKey(m.markerKey));
  const labs = latest.filter((m) => !isPhysicalMarkerKey(m.markerKey));
  const ordered = [...physical, ...labs];

  const goals: GoalItem[] = [];
  const usedKeys = new Set<string>();

  for (const m of ordered) {
    if (goals.length >= limit) break;
    if (usedKeys.has(m.markerKey)) continue;
    const spec = TARGETS.find((t) => t.keys.includes(m.markerKey));
    if (!spec) {
      // Generic fallback for unknown OOR markers
      const colour = markerItemColour(m);
      const high =
        m.flag === "high" || (m.refHigh != null && m.value > m.refHigh);
      const target =
        high && m.refHigh != null
          ? m.refHigh
          : m.refLow != null
            ? m.refLow
            : m.value;
      goals.push({
        title:
          locale === "en"
            ? `${m.name || m.markerKey}: move toward reference (now ${m.value}${m.unit ? ` ${m.unit}` : ""})`
            : `${m.name || m.markerKey}: link normos (dabar ${m.value}${m.unit ? ` ${m.unit}` : ""})`,
        progress: progressTowardRange(m, target),
        markerKey: m.markerKey,
        colour,
        kind: isPhysicalMarkerKey(m.markerKey) ? "physical" : "lab",
      });
      usedKeys.add(m.markerKey);
      continue;
    }

    const colour = markerItemColour(m);
    const target = spec.target(m);
    goals.push({
      title: spec.title(m, locale),
      detail: spec.detail?.(m, locale),
      progress: progressTowardRange(m, target),
      markerKey: m.markerKey,
      colour,
      kind: isPhysicalMarkerKey(m.markerKey) ? "physical" : "lab",
    });
    usedKeys.add(m.markerKey);
  }

  return goals;
}
