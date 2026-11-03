export type DeathClockUnit = "seconds" | "minutes" | "days" | "weeks" | "years";

export type DeathClockCause = {
  id: string;
  labelLt: string;
  labelEn: string;
  weight: number;
  noteLt: string;
  noteEn: string;
};

export type DeathClockDriver = {
  id: string;
  labelLt: string;
  labelEn: string;
  deltaWeeks: number;
  kind: "protect" | "risk" | "neutral";
};

export type DeathClockRecommendation = {
  id: string;
  labelLt: string;
  labelEn: string;
  detailLt: string;
  detailEn: string;
  /** Extra life weeks if the person commits to this action. */
  gainWeeks: number;
  category: "lifestyle" | "clinical" | "monitoring";
};

export type DeathClockAlgorithmRule = {
  id: string;
  titleLt: string;
  titleEn: string;
  bodyLt: string;
  bodyEn: string;
};

export type DeathClockPayload = {
  locale: "lt" | "en";
  patientName: string;
  sex: "male" | "female";
  dob: string | null;
  ageYears: number | null;
  baseLifeWeeks: number;
  adjustedLifeWeeks: number;
  expectancyYears: number;
  projectedDeathIso: string;
  projectedDeathMs: number;
  remainingMsAtBuild: number;
  builtAtMs: number;
  birthMs: number;
  causes: DeathClockCause[];
  drivers: DeathClockDriver[];
  recommendations: DeathClockRecommendation[];
  algorithmRules: DeathClockAlgorithmRule[];
  disclaimerLt: string;
  disclaimerEn: string;
};

/** Clamp used both on server build and client projection after recommendations. */
export function clampLifeWeeks(weeks: number): number {
  return Math.max(2200, Math.min(5200, weeks));
}

export function weeksToExpectancyYears(weeks: number): number {
  return Math.round((weeks / 52.1775) * 10) / 10;
}

export function projectFromWeeks(birthMs: number, lifeWeeks: number) {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const clamped = clampLifeWeeks(lifeWeeks);
  const deathMs = birthMs + clamped * MS_PER_WEEK;
  return {
    adjustedLifeWeeks: Math.round(clamped),
    expectancyYears: weeksToExpectancyYears(clamped),
    projectedDeathMs: deathMs,
    projectedDeathIso: new Date(deathMs).toISOString(),
  };
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

export function remainingInUnit(ms: number, unit: DeathClockUnit): number {
  const safe = Math.max(0, ms);
  switch (unit) {
    case "seconds":
      return Math.floor(safe / 1000);
    case "minutes":
      return Math.floor(safe / 60_000);
    case "days":
      return Math.floor(safe / 86_400_000);
    case "weeks":
      return Math.floor(safe / MS_PER_WEEK);
    case "years":
      return Math.floor((safe / MS_PER_YEAR) * 100) / 100;
  }
}
