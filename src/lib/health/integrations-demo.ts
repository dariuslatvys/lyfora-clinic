export type IntegrationSlug = "apple-health" | "oura";

export type IntegrationMetric = {
  id: string;
  labelLt: string;
  labelEn: string;
  value: string;
  hintLt?: string;
  hintEn?: string;
  /** Optional link into a physical marker page */
  markerKey?: string;
  cat?: string;
};

export type IntegrationDemo = {
  slug: IntegrationSlug;
  /** Exact item name as shown in the integrations list */
  listName: string;
  titleLt: string;
  titleEn: string;
  blurbLt: string;
  blurbEn: string;
  /** ISO datetime of last sync */
  syncedAt: string;
  metrics: IntegrationMetric[];
  series: {
    titleLt: string;
    titleEn: string;
    unit: string;
    markerKey?: string;
    cat?: string;
    points: { date: string; value: number; noteLt?: string; noteEn?: string }[];
  }[];
};

export const CONNECTED_INTEGRATION_NAMES = new Set([
  "Apple Health",
  "OURA",
  "Oura",
]);

export const INTEGRATION_DEMOS: Record<IntegrationSlug, IntegrationDemo> = {
  "apple-health": {
    slug: "apple-health",
    listName: "Apple Health",
    titleLt: "Apple Health",
    titleEn: "Apple Health",
    blurbLt:
      "Santrauka iš Apple Health — žingsniai, aktyvumas, VO₂max ir širdies rodikliai, sinchronizuoti į jūsų skaitmeninį dvynį.",
    blurbEn:
      "Summary from Apple Health — steps, activity, VO₂max and heart metrics synced into your digital twin.",
    syncedAt: "2026-11-01T06:42:00.000Z",
    metrics: [
      {
        id: "steps",
        labelLt: "Žingsniai (šiandien)",
        labelEn: "Steps (today)",
        value: "8 420",
        hintLt: "7 dienų vidurkis: 7 960",
        hintEn: "7-day average: 7,960",
        markerKey: "ACTIVITY_DATA",
        cat: "cardiovascular",
      },
      {
        id: "active-kcal",
        labelLt: "Aktyvios kcal",
        labelEn: "Active energy",
        value: "412 kcal",
        hintLt: "Tikslas 500 kcal",
        hintEn: "Goal 500 kcal",
      },
      {
        id: "distance",
        labelLt: "Atstumas",
        labelEn: "Distance",
        value: "6,1 km",
        hintLt: "Ėjimas + bėgimas",
        hintEn: "Walk + run",
      },
      {
        id: "rhr",
        labelLt: "Ramybės pulsas",
        labelEn: "Resting heart rate",
        value: "62 bpm",
        hintLt: "Apple Watch vidurkis (7 d.)",
        hintEn: "Apple Watch 7-day average",
        markerKey: "RESTING_HR",
        cat: "cardiovascular",
      },
      {
        id: "vo2",
        labelLt: "VO₂max",
        labelEn: "VO₂max",
        value: "41 ml/kg/min",
        hintLt: "Augimas nuo 31 per metus",
        hintEn: "Up from 31 over the past year",
        markerKey: "VO2MAX",
        cat: "cardiovascular",
      },
      {
        id: "workouts",
        labelLt: "Treniruotės (7 d.)",
        labelEn: "Workouts (7 d.)",
        value: "4",
        hintLt: "Ėjimas, dviratis, jėga",
        hintEn: "Walk, bike, strength",
      },
    ],
    series: [
      {
        titleLt: "VO₂max istorija",
        titleEn: "VO₂max history",
        unit: "ml/kg/min",
        markerKey: "VO2MAX",
        cat: "cardiovascular",
        points: [
          { date: "2025-11-01", value: 31 },
          { date: "2026-01-15", value: 33 },
          { date: "2026-03-20", value: 35 },
          { date: "2026-06-03", value: 37 },
          { date: "2026-08-12", value: 39 },
          { date: "2026-10-20", value: 41 },
        ],
      },
      {
        titleLt: "Žingsniai (dienos vidurkis)",
        titleEn: "Steps (daily average)",
        unit: "steps",
        markerKey: "ACTIVITY_DATA",
        cat: "cardiovascular",
        points: [
          { date: "2026-06-01", value: 4800 },
          { date: "2026-07-01", value: 5600 },
          { date: "2026-08-01", value: 6400 },
          { date: "2026-09-01", value: 7200 },
          { date: "2026-10-01", value: 7900 },
          { date: "2026-10-28", value: 8420 },
        ],
      },
    ],
  },
  oura: {
    slug: "oura",
    listName: "OURA",
    titleLt: "Oura",
    titleEn: "Oura",
    blurbLt:
      "Santrauka iš Oura žiedo — miegas, pasirengimas, HRV ir atsigavimo rodikliai.",
    blurbEn:
      "Summary from the Oura Ring — sleep, readiness, HRV and recovery metrics.",
    syncedAt: "2026-11-01T05:18:00.000Z",
    metrics: [
      {
        id: "readiness",
        labelLt: "Pasirengimas",
        labelEn: "Readiness",
        value: "78",
        hintLt: "Geras atsigavimas",
        hintEn: "Solid recovery",
      },
      {
        id: "sleep-score",
        labelLt: "Miego balas",
        labelEn: "Sleep score",
        value: "82",
        hintLt: "Efektyvumas 91 %",
        hintEn: "Efficiency 91%",
      },
      {
        id: "sleep-hours",
        labelLt: "Miego trukmė",
        labelEn: "Sleep duration",
        value: "7,4 val.",
        hintLt: "Gilus 1,6 val. · REM 1,8 val.",
        hintEn: "Deep 1.6 h · REM 1.8 h",
        markerKey: "SLEEP_DATA",
        cat: "mental",
      },
      {
        id: "hrv",
        labelLt: "HRV (naktinis)",
        labelEn: "HRV (nightly)",
        value: "52 ms",
        hintLt: "Pagerėjo nuo 28 ms",
        hintEn: "Improved from 28 ms",
        markerKey: "HRV",
        cat: "cardiovascular",
      },
      {
        id: "rhr",
        labelLt: "Ramybės pulsas (naktinis)",
        labelEn: "Lowest resting HR",
        value: "54 bpm",
        hintLt: "Naktinis minimumas",
        hintEn: "Overnight low",
        markerKey: "RESTING_HR",
        cat: "cardiovascular",
      },
      {
        id: "temp",
        labelLt: "Temperatūros nuokrypis",
        labelEn: "Temp. deviation",
        value: "+0,1 °C",
        hintLt: "Normos ribose",
        hintEn: "Within baseline",
      },
    ],
    series: [
      {
        titleLt: "HRV istorija",
        titleEn: "HRV history",
        unit: "ms",
        markerKey: "HRV",
        cat: "cardiovascular",
        points: [
          { date: "2026-07-01", value: 28 },
          { date: "2026-08-01", value: 32 },
          { date: "2026-09-01", value: 38 },
          { date: "2026-09-14", value: 42 },
          { date: "2026-10-15", value: 48 },
          { date: "2026-10-28", value: 52 },
        ],
      },
      {
        titleLt: "Miego trukmė",
        titleEn: "Sleep duration",
        unit: "h",
        markerKey: "SLEEP_DATA",
        cat: "mental",
        points: [
          { date: "2026-07-15", value: 6.2 },
          { date: "2026-08-15", value: 6.6 },
          { date: "2026-09-15", value: 7.0 },
          { date: "2026-10-01", value: 7.2 },
          { date: "2026-10-15", value: 7.3 },
          { date: "2026-10-28", value: 7.4 },
        ],
      },
    ],
  },
};

export function integrationSlugForName(name: string): IntegrationSlug | null {
  const n = name.trim().toLowerCase();
  if (n === "apple health") return "apple-health";
  if (n === "oura" || n === "oura ring") return "oura";
  return null;
}

export function getIntegrationDemo(slug: string): IntegrationDemo | null {
  if (slug === "apple-health" || slug === "oura") {
    return INTEGRATION_DEMOS[slug];
  }
  return null;
}

export function isConnectedIntegrationName(name: string) {
  return CONNECTED_INTEGRATION_NAMES.has(name);
}

export function formatSyncWhen(iso: string, locale: "lt" | "en") {
  const d = new Date(iso);
  return d.toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Vilnius",
  });
}

/** Human label for marker_results.source values. */
export function importSourceLabel(
  source: string | null | undefined,
  locale: "lt" | "en"
): string | null {
  if (!source) return null;
  const s = source.toLowerCase();
  if (s === "apple-health" || s === "apple_health" || s === "apple health") {
    return locale === "en"
      ? "(imported from Apple Health)"
      : "(importuota iš Apple Health)";
  }
  if (s === "oura" || s === "oura-ring") {
    return locale === "en"
      ? "(imported from Oura)"
      : "(importuota iš Oura)";
  }
  return null;
}
