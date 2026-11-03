import { eq, and } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { todayIsoDate } from "@/lib/health/demo-visits";
import { t, type Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "@/lib/health/colours";
import type {
  DeathClockCause,
  DeathClockDriver,
  DeathClockPayload,
} from "@/lib/health/death-clock-shared";

export type {
  DeathClockCause,
  DeathClockDriver,
  DeathClockPayload,
  DeathClockUnit,
} from "@/lib/health/death-clock-shared";
export { remainingInUnit } from "@/lib/health/death-clock-shared";

/** Oliver Burkeman framing: ~4000 weeks in an average life. */
export const BASE_LIFE_WEEKS = 4000;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000; // used for age fallback birth estimate

const COLOUR_WEEK_HIT: Record<RiskColour, number> = {
  grey: 0,
  green: 4,
  badge: -8,
  yellow: -12,
  orange: -28,
  red: -55,
};

function ageFromDob(dob: string | null, asOfIso: string): number | null {
  if (!dob) return null;
  const d = new Date(`${dob}T12:00:00`);
  const now = new Date(`${asOfIso}T12:00:00`);
  if (Number.isNaN(d.getTime()) || Number.isNaN(now.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function latestMarker(
  markers: Array<{
    markerKey: string;
    value: number | null;
    unit: string | null;
    flag: string | null;
    observedAt: string;
  }>,
  key: string
) {
  const rows = markers
    .filter((m) => m.markerKey === key)
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  return rows[0] || null;
}

function historyTrendDelta(
  markers: Array<{
    markerKey: string;
    value: number | null;
    observedAt: string;
  }>,
  key: string,
  higherIsWorse: boolean
): number {
  const rows = markers
    .filter((m) => m.markerKey === key && m.value != null)
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  if (rows.length < 2) return 0;
  const first = rows[0]!.value as number;
  const last = rows[rows.length - 1]!.value as number;
  const delta = last - first;
  if (Math.abs(delta) < 1e-6) return 0;
  const worse = higherIsWorse ? delta > 0 : delta < 0;
  return worse ? -18 : 10;
}

function parseBpSystolic(unit: string | null, value: number | null): number | null {
  if (unit && /\d+\s*\/\s*\d+/.test(unit)) {
    const m = unit.match(/(\d+)\s*\/\s*\d+/);
    if (m) return Number(m[1]);
  }
  if (value != null && value > 60) return value;
  return null;
}

export function loadDeathClock(
  patientId: string,
  locale: Locale,
  patientName: string
): DeathClockPayload | null {
  ensureSchema();
  const twin = loadDigitalTwin(patientId, locale);
  if (!twin) return null;

  const db = getDb();
  const key = questionnaireStorageKey();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(eq(questionnaire.patientId, patientId), eq(questionnaire.key, key))
    )
    .get();
  const answers = parseStoredAnswers(row?.value);
  const v = answers as Record<string, unknown>;

  const asOf = todayIsoDate();
  const dob = twin.patient.dob;
  const age = ageFromDob(dob, asOf);
  const sex = twin.patient.sex as "male" | "female";
  const drivers: DeathClockDriver[] = [];
  let delta = 0;

  // Sex baseline (population tables, illustrative)
  if (sex === "female") {
    delta += 80;
    drivers.push({
      id: "sex",
      labelLt: "Lytis (moteris) — ilgesnė vidutinė trukmė",
      labelEn: "Sex (female) — longer average expectancy",
      deltaWeeks: 80,
      kind: "protect",
    });
  } else {
    delta -= 40;
    drivers.push({
      id: "sex",
      labelLt: "Lytis (vyras) — trumpesnė vidutinė trukmė",
      labelEn: "Sex (male) — shorter average expectancy",
      deltaWeeks: -40,
      kind: "risk",
    });
  }

  const labels = t(locale);
  // Digital-twin category colours
  for (const c of twin.categories) {
    const hit = COLOUR_WEEK_HIT[c.colour as RiskColour] || 0;
    if (!hit) continue;
    delta += hit;
    const title = labels.categoryNames[c.id] || c.id;
    const colourLabel = labels.colourLabels[c.colour as RiskColour] || c.colour;
    drivers.push({
      id: `cat-${c.id}`,
      labelLt: `${title} · ${colourLabel}`,
      labelEn: `${title} · ${colourLabel}`,
      deltaWeeks: hit,
      kind: hit < 0 ? "risk" : "protect",
    });
  }

  // Rare NGS findings
  const rare = twin.categories.flatMap((c) => c.rare || []);
  const rareGenes = [...new Set(rare.map((r) => r.gene))];
  for (const gene of rareGenes) {
    const hit =
      gene === "MYBPC3" || gene === "MSH2" || gene === "PALB2" ? -120 : -60;
    delta += hit;
    drivers.push({
      id: `rare-${gene}`,
      labelLt: `NGS / VCF: ${gene}`,
      labelEn: `NGS / VCF: ${gene}`,
      deltaWeeks: hit,
      kind: "risk",
    });
  }

  // SNP risk allele load (orange/red matches)
  let snpRisk = 0;
  for (const c of twin.categories) {
    for (const s of c.snps || []) {
      if (s.matchCount >= 2) snpRisk += 1;
      else if (s.matchCount === 1) snpRisk += 0.4;
    }
  }
  if (snpRisk > 0) {
    const hit = -Math.min(140, Math.round(snpRisk * 4));
    delta += hit;
    drivers.push({
      id: "snp-load",
      labelLt: `SNP rizikos alelių apkrova (~${snpRisk.toFixed(1)})`,
      labelEn: `SNP risk-allele load (~${snpRisk.toFixed(1)})`,
      deltaWeeks: hit,
      kind: "risk",
    });
  }

  const markers = twin.markers;
  const ldl = latestMarker(markers, "LDL");
  if (ldl?.value != null && ldl.value > 3) {
    const hit = -Math.round((ldl.value - 3) * 35);
    delta += hit;
    drivers.push({
      id: "ldl",
      labelLt: `LDL ${ldl.value} (istorija + dabartis)`,
      labelEn: `LDL ${ldl.value} (history + current)`,
      deltaWeeks: hit,
      kind: "risk",
    });
  }
  delta += historyTrendDelta(markers, "LDL", true);
  delta += historyTrendDelta(markers, "GLUCOSE", true);
  delta += historyTrendDelta(markers, "eGFR", false);

  const bp = latestMarker(markers, "BLOOD_PRESSURE");
  const sys = parseBpSystolic(bp?.unit ?? null, bp?.value ?? null);
  if (sys != null && sys >= 140) {
    const hit = -50;
    delta += hit;
    drivers.push({
      id: "bp",
      labelLt: `Kraujo spaudimas ~${sys} mmHg`,
      labelEn: `Blood pressure ~${sys} mmHg`,
      deltaWeeks: hit,
      kind: "risk",
    });
  } else if (sys != null && sys < 120) {
    delta += 15;
    drivers.push({
      id: "bp",
      labelLt: `Kraujo spaudimas ~${sys} mmHg`,
      labelEn: `Blood pressure ~${sys} mmHg`,
      deltaWeeks: 15,
      kind: "protect",
    });
  }

  const vo2 = latestMarker(markers, "VO2MAX");
  if (vo2?.value != null) {
    const hit = vo2.value >= 40 ? 35 : vo2.value >= 32 ? 10 : -40;
    delta += hit;
    drivers.push({
      id: "vo2",
      labelLt: `VO₂max ${vo2.value}`,
      labelEn: `VO₂max ${vo2.value}`,
      deltaWeeks: hit,
      kind: hit >= 0 ? "protect" : "risk",
    });
  }

  const hrv = latestMarker(markers, "HRV");
  if (hrv?.value != null) {
    const hit = hrv.value >= 50 ? 20 : hrv.value >= 35 ? 0 : -30;
    if (hit) {
      delta += hit;
      drivers.push({
        id: "hrv",
        labelLt: `HRV ${hrv.value} ms`,
        labelEn: `HRV ${hrv.value} ms`,
        deltaWeeks: hit,
        kind: hit >= 0 ? "protect" : "risk",
      });
    }
  }

  // Lifestyle from questionnaire
  const smoke = String(
    v["7_lifestyle__do_you_smoke_or_use_nicotine_products"] || ""
  ).toLowerCase();
  if (/yes|taip|daily|kasdien|smoke/.test(smoke)) {
    delta -= 220;
    drivers.push({
      id: "smoke",
      labelLt: "Rūkymas / nikotinas (klausimynas)",
      labelEn: "Smoking / nicotine (questionnaire)",
      deltaWeeks: -220,
      kind: "risk",
    });
  } else if (smoke) {
    delta += 25;
    drivers.push({
      id: "smoke",
      labelLt: "Nerūko (klausimynas)",
      labelEn: "Non-smoker (questionnaire)",
      deltaWeeks: 25,
      kind: "protect",
    });
  }

  const alcohol = String(v["7_lifestyle__alcohol_consumption"] || "").toLowerCase();
  if (/daily|heavy|gaus|kasdien|frequent/.test(alcohol)) {
    delta -= 90;
    drivers.push({
      id: "alcohol",
      labelLt: "Alkoholio vartojimas (klausimynas)",
      labelEn: "Alcohol use (questionnaire)",
      deltaWeeks: -90,
      kind: "risk",
    });
  }

  const exercise = String(v["7_lifestyle__exercise_frequency"] || "").toLowerCase();
  if (/3|4|5|daily|kasdien|regular|reguliar/.test(exercise)) {
    delta += 55;
    drivers.push({
      id: "exercise",
      labelLt: "Fizinis aktyvumas (klausimynas)",
      labelEn: "Physical activity (questionnaire)",
      deltaWeeks: 55,
      kind: "protect",
    });
  } else if (/rarely|never|niekada|retai|0/.test(exercise)) {
    delta -= 40;
    drivers.push({
      id: "exercise",
      labelLt: "Mažas aktyvumas (klausimynas)",
      labelEn: "Low activity (questionnaire)",
      deltaWeeks: -40,
      kind: "risk",
    });
  }

  const sleep = String(v["7_lifestyle__average_sleep_duration"] || "");
  if (/< ?5|4–5|4-5|under 5/.test(sleep)) {
    delta -= 35;
    drivers.push({
      id: "sleep",
      labelLt: "Trumpas miegas (klausimynas)",
      labelEn: "Short sleep (questionnaire)",
      deltaWeeks: -35,
      kind: "risk",
    });
  } else if (/7|8|9/.test(sleep)) {
    delta += 20;
    drivers.push({
      id: "sleep",
      labelLt: "Pakankamas miegas (klausimynas)",
      labelEn: "Adequate sleep (questionnaire)",
      deltaWeeks: 20,
      kind: "protect",
    });
  }

  // Family history
  const familyBlock = (v["10_family_history"] || {}) as {
    familyMembers?: Array<{
      conditions?: string[];
      relation?: string;
    }>;
  };
  const familyConds = (familyBlock.familyMembers || []).flatMap(
    (m) => m.conditions || []
  );
  const familyText = familyConds.join(" ").toLowerCase();
  if (/cancer|vėž|oncolog|heart|šird|infarkt|stroke|insult/.test(familyText)) {
    delta -= 70;
    drivers.push({
      id: "family",
      labelLt: "Šeimos anamnezė (širdis / onkologija)",
      labelEn: "Family history (heart / oncology)",
      deltaWeeks: -70,
      kind: "risk",
    });
  }

  // Clamp adjusted life so remaining stays positive for demo adults
  let lifeWeeks = BASE_LIFE_WEEKS + delta;
  lifeWeeks = Math.max(2200, Math.min(5200, lifeWeeks));

  const birthMs = dob
    ? new Date(`${dob}T12:00:00`).getTime()
    : Date.now() - (age ?? 45) * MS_PER_YEAR;
  const deathMs = birthMs + lifeWeeks * MS_PER_WEEK;
  const builtAtMs = Date.now();
  const remainingMsAtBuild = Math.max(0, deathMs - builtAtMs);
  const projected = new Date(deathMs);
  const projectedDeathIso = projected.toISOString();

  const causes: DeathClockCause[] = [];
  const cardio = twin.categories.find((c) => c.id === "cardiovascular");
  const onco = twin.categories.find((c) => c.id === "oncology");
  const meta = twin.categories.find((c) => c.id === "metabolic");
  if (cardio && (cardio.colour === "red" || cardio.colour === "orange")) {
    causes.push({
      id: "cvd",
      labelLt: "Širdies ir kraujagyslių ligos",
      labelEn: "Cardiovascular disease",
      weight: cardio.colour === "red" ? 0.38 : 0.28,
      noteLt: "Pagal skaitmeninio dvynio signalus, lipidus, spaudimą ir genetikos radinius.",
      noteEn: "From digital-twin signals, lipids, blood pressure and genetic findings.",
    });
  }
  if (onco && (onco.colour === "red" || onco.colour === "orange" || rareGenes.length)) {
    causes.push({
      id: "cancer",
      labelLt: "Onkologinės ligos",
      labelEn: "Cancer",
      weight: onco?.colour === "red" ? 0.32 : 0.22,
      noteLt: "NGS / šeimos anamnezė ir onkologijos kategorijos spalva.",
      noteEn: "NGS / family history and oncology category colour.",
    });
  }
  if (meta && (meta.colour === "orange" || meta.colour === "red")) {
    causes.push({
      id: "metab",
      labelLt: "Metabolinės ligos (diabetas, lipidai)",
      labelEn: "Metabolic disease (diabetes, lipids)",
      weight: 0.18,
      noteLt: "Gliukozė, lipidai ir metabolinės srities signalai.",
      noteEn: "Glucose, lipids and metabolic-area signals.",
    });
  }
  causes.push({
    id: "other",
    labelLt: "Kitos priežastys / senėjimas",
    labelEn: "Other causes / ageing",
    weight: Math.max(
      0.12,
      1 - causes.reduce((s, c) => s + c.weight, 0)
    ),
    noteLt: "Bazinis 4000 savaičių modelis ir likę populiaciniai veiksniai.",
    noteEn: "Baseline 4000-week model and residual population factors.",
  });
  const causeSum = causes.reduce((s, c) => s + c.weight, 0) || 1;
  for (const c of causes) c.weight = Math.round((c.weight / causeSum) * 100) / 100;

  // Prefer strongest drivers in UI
  drivers.sort((a, b) => Math.abs(b.deltaWeeks) - Math.abs(a.deltaWeeks));

  return {
    locale,
    patientName,
    sex,
    dob,
    ageYears: age,
    baseLifeWeeks: BASE_LIFE_WEEKS,
    adjustedLifeWeeks: Math.round(lifeWeeks),
    expectancyYears: Math.round((lifeWeeks / 52.1775) * 10) / 10,
    projectedDeathIso,
    projectedDeathMs: deathMs,
    remainingMsAtBuild,
    builtAtMs,
    causes,
    drivers: drivers.slice(0, 12),
    disclaimerLt:
      "Tai iliustratyvus modelis pagal jūsų Lyfora duomenis (žymenys, genetika, klausimynas, fiziniai rodikliai). Tai nėra medicininė prognozė ar diagnozė.",
    disclaimerEn:
      "An illustrative model from your Lyfora data (markers, genetics, questionnaire, physical metrics). Not a medical prognosis or diagnosis.",
  };
}

