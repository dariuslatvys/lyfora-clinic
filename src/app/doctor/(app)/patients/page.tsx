import { ensureSchema, getDb } from "@/lib/db";
import {
  patients,
  markerResults,
  snpGenotypes,
  rareMutations,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { ensurePetraitisPatient } from "@/lib/health/petraitis-patient";
import { t, type Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "@/lib/health/colours";
import {
  PATIENT_SPECIAL_NOTES,
  birthYearFromDob,
  countPatientVisits,
} from "@/lib/doctor/doctor-patients-meta";
import { DoctorPatientsList } from "@/components/doctor/doctor-patients-list";

const RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

export default async function DoctorPatientsPage() {
  ensureSchema();
  ensurePetraitisPatient();
  const current = await getCurrentUser();
  const locale = ((current?.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  const db = getDb();
  const list = db.select().from(patients).all();

  const enriched = list.map((p) => {
    const markers =
      db
        .select({ c: sql<number>`count(*)` })
        .from(markerResults)
        .where(eq(markerResults.patientId, p.id))
        .get()?.c || 0;
    const snps =
      db
        .select({ c: sql<number>`count(*)` })
        .from(snpGenotypes)
        .where(eq(snpGenotypes.patientId, p.id))
        .get()?.c || 0;
    const rare =
      db
        .select({ c: sql<number>`count(*)` })
        .from(rareMutations)
        .where(eq(rareMutations.patientId, p.id))
        .get()?.c || 0;
    const twin = loadDigitalTwin(p.id, locale);
    const categories =
      twin?.categories
        .filter((c) => RANK[c.colour] >= 3)
        .sort((a, b) => RANK[b.colour] - RANK[a.colour])
        .map((c) => ({
          id: c.id,
          title: labels.categoryNames[c.id] || c.id,
          colour: c.colour as RiskColour,
          colourLabel: labels.colourLabels[c.colour as RiskColour],
        })) || [];

    return {
      id: p.id,
      name: patientDisplayName(p.sex, locale, p.id),
      dob: p.dob,
      birthYear: birthYearFromDob(p.dob),
      sex: (p.sex === "female" ? "female" : "male") as "male" | "female",
      sexLabel:
        p.sex === "male"
          ? locale === "en"
            ? "Male"
            : "Vyras"
          : locale === "en"
            ? "Female"
            : "Moteris",
      notes: p.notes,
      visitCount: countPatientVisits(p.id, locale),
      markers: Number(markers) || 0,
      snps: Number(snps) || 0,
      rare: Number(rare) || 0,
      categories,
      specialNotes: PATIENT_SPECIAL_NOTES[p.id] || [],
    };
  });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "Clinic panel" : "Klinikos panelė"}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {locale === "en" ? "Patients" : "Pacientai"}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-[var(--muted)]">
            {locale === "en"
              ? "Searchable list with problem areas, visit counts and special clinical notes."
              : "Paieška, probleminės sveikatos sritys, vizitų skaičius ir spec. pastabos."}
          </p>
        </div>
      </div>

      <DoctorPatientsList locale={locale} patients={enriched} />
    </div>
  );
}
