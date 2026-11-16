export type IntegrationSlug = "apple-health" | "oura" | "flo";

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
  "Flo",
]);

/** Period start dates imported from Flo for the demo female patient (PKS/PMOS case). */
export const FLO_PERIOD_STARTS = [
  "2025-10-02",
  "2025-11-20",
  "2026-01-24",
  "2026-03-12",
  "2026-05-30",
  "2026-07-11",
  "2026-09-19",
] as const;

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
  flo: {
    slug: "flo",
    listName: "Flo",
    titleLt: "Flo",
    titleEn: "Flo",
    blurbLt:
      "Mėnesinių ciklo duomenys iš Flo — 7 paskutinės pradžios datos, intervalai ir dabartinė pertrauka, naudojami Moters sveikatos (PMOS) vertinime.",
    blurbEn:
      "Cycle data from Flo — 7 latest period start dates, intervals and the current gap, used in Women’s health (PMOS) evaluation.",
    syncedAt: "2026-11-08T09:15:00.000Z",
    metrics: [
      {
        id: "last-period",
        labelLt: "Paskutinė pradžia",
        labelEn: "Last period start",
        value: "2026-09-19",
        hintLt: "Importuota iš Flo",
        hintEn: "Imported from Flo",
      },
      {
        id: "cycle-median",
        labelLt: "Ciklo mediana",
        labelEn: "Cycle median",
        value: "57 d.",
        hintLt: "6 intervalai iš 7 datų",
        hintEn: "6 intervals from 7 dates",
      },
      {
        id: "cycle-mean",
        labelLt: "Ciklo vidurkis",
        labelEn: "Cycle average",
        value: "59 d.",
        hintLt: "Ilgesnis nei 35 d. — ovuliacijos signalas",
        hintEn: "Longer than 35 d. — ovulation signal",
      },
      {
        id: "cycles-year",
        labelLt: "Ciklai per metus",
        labelEn: "Cycles per year",
        value: "~6",
        hintLt: "Mažiau nei 8 — ovuliacijos sutrikimo kriterijus",
        hintEn: "Under 8 — ovulation-disruption criterion",
      },
      {
        id: "current-gap",
        labelLt: "Dabartinė pertrauka",
        labelEn: "Current gap",
        value: "50 d.",
        hintLt: "Nuo 2026-09-19",
        hintEn: "Since 2026-09-19",
      },
      {
        id: "dates-count",
        labelLt: "Importuotos datos",
        labelEn: "Imported dates",
        value: "7",
        hintLt: "Programėlės istorija",
        hintEn: "App history",
      },
    ],
    series: [
      {
        titleLt: "Mėnesinių pradžios datos",
        titleEn: "Period start dates",
        unit: "d. tarp ciklų",
        points: [
          {
            date: "2025-10-02",
            value: 0,
            noteLt: "Pirmoji importuota data",
            noteEn: "First imported date",
          },
          {
            date: "2025-11-20",
            value: 49,
            noteLt: "Intervalas nuo ankstesnės",
            noteEn: "Interval from previous",
          },
          {
            date: "2026-01-24",
            value: 65,
            noteLt: "Intervalas nuo ankstesnės",
            noteEn: "Interval from previous",
          },
          {
            date: "2026-03-12",
            value: 47,
            noteLt: "Intervalas nuo ankstesnės",
            noteEn: "Interval from previous",
          },
          {
            date: "2026-05-30",
            value: 79,
            noteLt: "Ilgiausias tarpas",
            noteEn: "Longest gap",
          },
          {
            date: "2026-07-11",
            value: 42,
            noteLt: "Intervalas nuo ankstesnės",
            noteEn: "Interval from previous",
          },
          {
            date: "2026-09-19",
            value: 70,
            noteLt: "Paskutinė pradžia",
            noteEn: "Latest start",
          },
        ],
      },
    ],
  },
};

export function integrationSlugForName(name: string): IntegrationSlug | null {
  const n = name.trim().toLowerCase();
  if (n === "apple health") return "apple-health";
  if (n === "oura" || n === "oura ring") return "oura";
  if (n === "flo") return "flo";
  return null;
}

export function getIntegrationDemo(slug: string): IntegrationDemo | null {
  if (slug === "apple-health" || slug === "oura" || slug === "flo") {
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
  if (s === "flo" || s === "flo-health" || s === "flo app") {
    return locale === "en"
      ? "(imported from Flo)"
      : "(importuota iš Flo)";
  }
  return null;
}
