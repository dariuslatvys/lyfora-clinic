import { eq, desc } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import {
  patients,
  markerResults,
  markerDefs,
} from "@/lib/db/schema";
import {
  activeDoctorRequests,
  historicalDoctorRequests,
} from "@/lib/doctor/doctor-requests";
import {
  baseDoctorAppointments,
  modeLabel,
} from "@/lib/doctor/doctor-calendar";
import { countPatientVisits } from "@/lib/doctor/doctor-patients-meta";
import { ensurePetraitisPatient } from "@/lib/health/petraitis-patient";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { t, type Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "@/lib/health/colours";
import { todayIsoDate, addCalendarDays } from "@/lib/health/demo-visits";

export type AnalyticsPatient = {
  id: string;
  name: string;
  sex: "male" | "female";
  sexLabel: string;
  dob: string | null;
  birthYear: string;
  age: number | null;
  visitCount: number;
  categories: Array<{
    id: string;
    title: string;
    colour: RiskColour;
    colourLabel: string;
    summary: string;
  }>;
  labs: Array<{
    key: string;
    name: string;
    value: string;
    unit: string | null;
    observedAt: string;
    colour: RiskColour;
  }>;
};

export type AnalyticsPayload = {
  locale: Locale;
  kpis: {
    patients: number;
    appointments: number;
    activeRequests: number;
    closedRequests: number;
    labResults: number;
    nps: number;
    avgReplyHours: number;
    noShowPct: number;
    revenueKe: number;
  };
  patients: AnalyticsPatient[];
  areas: Array<{
    id: string;
    title: string;
    counts: Record<"red" | "orange" | "yellow" | "green" | "badge", number>;
    patientIds: string[];
  }>;
  diagnoses: Array<{ code: string; nameLt: string; nameEn: string; n: number }>;
  pgx: Array<{ gene: string; n: number }>;
  consultMonths: Array<{
    key: string;
    label: string;
    clinic: number;
    video: number;
    written: number;
    urgent: number;
  }>;
  modeMix: Array<{ mode: string; label: string; n: number }>;
};

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(`${dob}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date(`${todayIsoDate()}T12:00:00`);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function colourOfFlag(flag: string | null | undefined): RiskColour {
  const f = (flag || "").toLowerCase();
  if (f.includes("crit") || f === "h" || f === "l" || f === "red") return "red";
  if (f.includes("orange") || f === "hh" || f === "ll") return "orange";
  if (f.includes("yellow") || f === "warn") return "yellow";
  if (f.includes("green") || f === "n" || f === "ok") return "green";
  return "grey";
}

export function loadDoctorAnalytics(locale: Locale): AnalyticsPayload {
  ensureSchema();
  ensurePetraitisPatient();
  const labels = t(locale);
  const db = getDb();
  const pts = db.select().from(patients).all();
  const defs = db.select().from(markerDefs).all();
  const defMap = new Map(defs.map((d) => [d.key, d]));
  const appts = baseDoctorAppointments(locale);

  const patientsOut: AnalyticsPatient[] = pts.map((p) => {
    const twin = loadDigitalTwin(p.id, locale);
    const categories =
      twin?.categories.map((c) => ({
        id: c.id,
        title: labels.categoryNames[c.id] || c.id,
        colour: c.colour as RiskColour,
        colourLabel: labels.colourLabels[c.colour as RiskColour],
        summary: c.summary,
      })) || [];
    const rows = db
      .select()
      .from(markerResults)
      .where(eq(markerResults.patientId, p.id))
      .orderBy(desc(markerResults.observedAt))
      .all()
      .slice(0, 40);
    const labs = rows.map((r) => ({
      key: r.markerKey,
      name: defMap.get(r.markerKey)?.name || r.markerKey,
      value: String(r.value ?? "—"),
      unit: r.unit,
      observedAt: r.observedAt,
      colour: colourOfFlag(r.flag),
    }));
    return {
      id: p.id,
      name: patientDisplayName(p.sex, locale, p.id),
      sex: p.sex as "male" | "female",
      sexLabel:
        p.sex === "male"
          ? locale === "en"
            ? "Male"
            : "Vyras"
          : locale === "en"
            ? "Female"
            : "Moteris",
      dob: p.dob,
      birthYear: (p.dob || "————").slice(0, 4),
      age: ageFromDob(p.dob),
      visitCount: countPatientVisits(p.id, locale),
      categories,
      labs,
    };
  });

  const areaMap = new Map<
    string,
    {
      id: string;
      title: string;
      counts: Record<"red" | "orange" | "yellow" | "green" | "badge", number>;
      patientIds: Set<string>;
    }
  >();
  for (const p of patientsOut) {
    for (const c of p.categories) {
      if (!areaMap.has(c.id)) {
        areaMap.set(c.id, {
          id: c.id,
          title: c.title,
          counts: { red: 0, orange: 0, yellow: 0, green: 0, badge: 0 },
          patientIds: new Set(),
        });
      }
      const row = areaMap.get(c.id)!;
      if (c.colour === "red" || c.colour === "orange" || c.colour === "yellow" || c.colour === "green" || c.colour === "badge") {
        row.counts[c.colour] += 1;
      }
      if (c.colour === "red" || c.colour === "orange") {
        row.patientIds.add(p.id);
      }
    }
  }

  const modeCounts: Record<string, number> = {};
  for (const a of appts) {
    modeCounts[a.mode] = (modeCounts[a.mode] || 0) + 1;
  }

  // Demo volumes shaped like the clinic mock (peak ~1900 in the latest month).
  const monthBases = [980, 1120, 1280, 1410, 1620, 1902];
  const months = [5, 4, 3, 2, 1, 0].map((ago, i) => {
    const d = new Date(`${todayIsoDate()}T12:00:00`);
    d.setMonth(d.getMonth() - ago);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
      month: "short",
    });
    const base = monthBases[i] ?? 1200;
    return {
      key,
      label,
      clinic: Math.round(base * 0.38),
      video: Math.round(base * 0.27),
      written: Math.round(base * 0.24),
      urgent: Math.round(base * 0.11),
    };
  });

  const labResults = patientsOut.reduce((n, p) => n + p.labs.length, 0);

  return {
    locale,
    kpis: {
      patients: patientsOut.length,
      appointments: appts.length,
      activeRequests: activeDoctorRequests().length,
      closedRequests: historicalDoctorRequests().length,
      labResults,
      nps: 71,
      avgReplyHours: 5.8,
      noShowPct: 3.9,
      revenueKe: 52.6,
    },
    patients: patientsOut,
    areas: [...areaMap.values()]
      .map((a) => ({
        id: a.id,
        title: a.title,
        counts: a.counts,
        patientIds: [...a.patientIds],
      }))
      .sort(
        (a, b) =>
          b.counts.red +
          b.counts.orange -
          (a.counts.red + a.counts.orange)
      ),
    diagnoses: [
      {
        code: "I10",
        nameLt: "Pirminė (esencinė) hipertenzija",
        nameEn: "Essential hypertension",
        n: 3,
      },
      {
        code: "E78.0",
        nameLt: "Gryna hipercholesterolemija",
        nameEn: "Pure hypercholesterolaemia",
        n: 1,
      },
      {
        code: "G43.0",
        nameLt: "Migrena be auros",
        nameEn: "Migraine without aura",
        n: 1,
      },
      {
        code: "D68.5",
        nameLt: "Pirminė trombofilija",
        nameEn: "Primary thrombophilia",
        n: 1,
      },
      {
        code: "E55.9",
        nameLt: "Vitamino D stoka",
        nameEn: "Vitamin D deficiency",
        n: 1,
      },
      {
        code: "I48.0",
        nameLt: "Paroksizminė prieširdžių virpėjimas",
        nameEn: "Paroxysmal atrial fibrillation",
        n: 1,
      },
      {
        code: "E11.9",
        nameLt: "2 tipo cukrinis diabetas be komplikacijų",
        nameEn: "Type 2 diabetes mellitus without complications",
        n: 1,
      },
      {
        code: "I35.0",
        nameLt: "Aortos vožtuvo stenozė",
        nameEn: "Aortic valve stenosis",
        n: 1,
      },
    ],
    pgx: [
      { gene: "CYP2C19", n: 3 },
      { gene: "SLCO1B1", n: 2 },
      { gene: "VKORC1", n: 2 },
      { gene: "CYP2C9", n: 2 },
      { gene: "F5", n: 1 },
      { gene: "ABCG2", n: 1 },
    ],
    consultMonths: months,
    modeMix: (["in_person", "video", "phone"] as const).map((mode) => ({
      mode,
      label: modeLabel(mode, locale),
      n: modeCounts[mode] || 0,
    })),
  };
}

