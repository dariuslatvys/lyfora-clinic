import { ensureSchema, getDb } from "@/lib/db";
import { patients, markerResults, rareMutations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import {
  normalizeSearchText,
  searchKindLabel,
  type SearchHit,
  type SearchKind,
} from "@/lib/health/global-search";
import {
  baseDoctorAppointments,
  modeLabel,
  statusLabel,
} from "@/lib/doctor/doctor-calendar";
import {
  allDoctorRequests,
  requestStatusLabel,
} from "@/lib/doctor/doctor-requests";
import { DEMO_PRESCRIPTIONS } from "@/lib/health/demo-prescriptions";
import { loadDigitalTwin } from "@/lib/health/load-twin";

type Doc = {
  id: string;
  kind: SearchKind | "request" | "patient" | "appointment";
  title: string;
  subtitle: string;
  href: string;
  hay: string;
  boost?: number;
};

function score(doc: Doc, tokens: string[]): number {
  if (!tokens.length) return 0;
  const title = normalizeSearchText(doc.title);
  const hay = doc.hay;
  let s = doc.boost || 0;
  for (const token of tokens) {
    if (!token) continue;
    let best = 0;
    if (title === token) best = 120;
    else if (title.startsWith(token)) best = 95;
    else if (title.includes(token)) best = 70;
    else {
      const words = hay.split(" ").filter(Boolean);
      for (const w of words) {
        if (w.startsWith(token)) best = Math.max(best, 55);
        else if (token.length >= 5 && w.includes(token)) best = Math.max(best, 40);
        else if (token.length >= 5 && w.startsWith(token.slice(0, -1)))
          best = Math.max(best, 38);
      }
    }
    if (best <= 0) return 0;
    s += best;
  }
  return s;
}

export function doctorKindLabel(
  kind: string,
  locale: Locale
): string {
  const lt: Record<string, string> = {
    page: "Skyrius",
    patient: "Pacientas",
    appointment: "Vizitas",
    request: "Užklausa",
    prescription: "Receptas",
    lab: "Tyrimas",
    gene: "Genas",
    rare: "Reta mutacija",
    category: "Sritis",
  };
  const en: Record<string, string> = {
    page: "Section",
    patient: "Patient",
    appointment: "Appointment",
    request: "Request",
    prescription: "Prescription",
    lab: "Lab",
    gene: "Gene",
    rare: "Rare mutation",
    category: "Area",
  };
  if (kind in (locale === "en" ? en : lt)) {
    return (locale === "en" ? en : lt)[kind]!;
  }
  try {
    return searchKindLabel(kind as SearchKind, locale);
  } catch {
    return kind;
  }
}

export function runDoctorSearch(input: {
  locale: Locale;
  query: string;
  limit?: number;
}): Array<SearchHit & { kindLabel: string }> {
  const locale = input.locale;
  const labels = t(locale);
  const docs: Doc[] = [];

  const pages = [
    {
      href: "/doctor",
      title: locale === "en" ? "Workday" : "Darbo diena",
      aliases: "darbo diena workday home dashboard",
    },
    {
      href: "/doctor/patients",
      title: labels.patientsNav,
      aliases: "pacientai patients",
    },
    {
      href: "/doctor/calendar",
      title: locale === "en" ? "Calendar" : "Kalendorius",
      aliases: "kalendorius calendar schedule vizitai",
    },
    {
      href: "/doctor/requests",
      title: locale === "en" ? "Requests" : "Užklausos",
      aliases: "uzklausos requests inbox klausimai",
    },
    {
      href: "/doctor/analytics",
      title: labels.analytics,
      aliases: "analitika analytics",
    },
  ];
  for (const p of pages) {
    docs.push({
      id: `page:${p.href}`,
      kind: "page",
      title: p.title,
      subtitle: locale === "en" ? "Doctor section" : "Gydytojo skyrius",
      href: p.href,
      hay: normalizeSearchText(`${p.title} ${p.aliases}`),
      boost: 10,
    });
  }

  ensureSchema();
  const db = getDb();
  for (const p of db.select().from(patients).all()) {
    const name = patientDisplayName(p.sex, locale);
    const twin = loadDigitalTwin(p.id, locale);
    const attention =
      twin?.categories
        .filter((c) => c.colour === "orange" || c.colour === "red")
        .map((c) => labels.categoryNames[c.id] || c.id)
        .join(", ") || "";
    docs.push({
      id: `patient:${p.id}`,
      kind: "patient",
      title: name,
      subtitle: [
        p.sex === "male"
          ? locale === "en"
            ? "Male"
            : "Vyras"
          : locale === "en"
            ? "Female"
            : "Moteris",
        p.dob,
        attention,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/doctor/patients/${p.id}`,
      hay: normalizeSearchText(
        `${name} ${p.id} ${p.sex} ${p.dob || ""} ${p.notes || ""} ${attention} jonas rasa john jane`
      ),
      boost: 12,
    });

    if (twin) {
      for (const c of twin.categories) {
        docs.push({
          id: `cat:${p.id}:${c.id}`,
          kind: "category",
          title: `${name} · ${labels.categoryNames[c.id] || c.id}`,
          subtitle: c.summary,
          href: `/doctor/patients/${p.id}`,
          hay: normalizeSearchText(
            `${name} ${c.id} ${labels.categoryNames[c.id]} ${c.summary}`
          ),
        });
      }
      const seen = new Set<string>();
      for (const m of twin.markers) {
        if (seen.has(m.markerKey)) continue;
        seen.add(m.markerKey);
        docs.push({
          id: `lab:${p.id}:${m.markerKey}`,
          kind: "lab",
          title: `${m.name || m.markerKey} · ${name}`,
          subtitle: `${m.markerKey} · ${m.value}${m.unit ? ` ${m.unit}` : ""}`,
          href: `/doctor/patients/${p.id}`,
          hay: normalizeSearchText(
            `${m.name} ${m.markerKey} ${name} cholesterol lipid cholesterolis`
          ),
        });
      }
      for (const v of twin.rare || []) {
        docs.push({
          id: `rare:${p.id}:${v.id}`,
          kind: "rare",
          title: String(v.gene || v.id),
          subtitle: `${name} · ${v.significance || ""}`,
          href: `/doctor/patients/${p.id}`,
          hay: normalizeSearchText(
            `${v.gene} ${v.titleLt} ${v.titleEn} ${name} ngs`
          ),
        });
      }
    }

    const markerCount = db
      .select({ c: sql<number>`count(*)` })
      .from(markerResults)
      .where(eq(markerResults.patientId, p.id))
      .get()?.c;
    const rareCount = db
      .select({ c: sql<number>`count(*)` })
      .from(rareMutations)
      .where(eq(rareMutations.patientId, p.id))
      .get()?.c;
    void markerCount;
    void rareCount;
  }

  for (const a of baseDoctorAppointments(locale)) {
    docs.push({
      id: `appt:${a.id}`,
      kind: "appointment",
      title: locale === "en" ? a.titleEn : a.titleLt,
      subtitle: `${a.date} ${a.time} · ${
        locale === "en" ? a.patientNameEn : a.patientNameLt
      } · ${modeLabel(a.mode, locale)} · ${statusLabel(a.status, locale)}`,
      href: `/doctor/calendar?date=${a.date}`,
      hay: normalizeSearchText(
        `${a.titleLt} ${a.titleEn} ${a.patientNameLt} ${a.patientNameEn} ${a.notesLt} ${a.notesEn} ${a.placeLt} ${a.placeEn} vizitas calendar`
      ),
    });
  }

  for (const r of allDoctorRequests()) {
    docs.push({
      id: `req:${r.id}`,
      kind: "request",
      title: locale === "en" ? r.subjectEn : r.subjectLt,
      subtitle: `${
        locale === "en" ? r.patientNameEn : r.patientNameLt
      } · ${requestStatusLabel(r.status, locale)}`,
      href: `/doctor/requests?id=${encodeURIComponent(r.id)}`,
      hay: normalizeSearchText(
        `${r.subjectLt} ${r.subjectEn} ${r.previewLt} ${r.previewEn} ${r.questionLt} ${r.questionEn} ${r.patientNameLt} ${r.tagsLt.join(" ")} uzklausa`
      ),
    });
  }

  for (const rx of DEMO_PRESCRIPTIONS.slice(0, 40)) {
    docs.push({
      id: `rx:${rx.id}`,
      kind: "prescription",
      title: locale === "en" ? rx.substanceEn : rx.substanceLt,
      subtitle: `${rx.diagnosisCode} · ${
        locale === "en" ? rx.diagnosisEn : rx.diagnosisLt
      }`,
      href: `/doctor/patients/patient_male`,
      hay: normalizeSearchText(
        `${rx.substanceLt} ${rx.substanceEn} ${rx.inn} ${rx.diagnosisLt} ${rx.diagnosisEn} receptas`
      ),
    });
  }

  const q = normalizeSearchText(input.query);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter((x) => x.length >= 2);
  const scored: Array<SearchHit & { kindLabel: string }> = [];
  for (const doc of docs) {
    const sc = score(doc, tokens);
    if (sc <= 0) continue;
    scored.push({
      id: doc.id,
      kind: doc.kind as SearchKind,
      title: doc.title,
      subtitle: doc.subtitle,
      href: doc.href,
      score: sc,
      kindLabel: doctorKindLabel(doc.kind, locale),
    });
  }
  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return scored.slice(0, input.limit ?? 24);
}
