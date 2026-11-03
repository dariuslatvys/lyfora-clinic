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
  causes: DeathClockCause[];
  drivers: DeathClockDriver[];
  disclaimerLt: string;
  disclaimerEn: string;
};

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
