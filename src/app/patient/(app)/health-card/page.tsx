import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { buildHealthCard } from "@/lib/health/health-card-data";
import { HealthCardTabs } from "@/components/patient/health-card-tabs";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { ensurePetraitisPatient } from "@/lib/health/petraitis-patient";

export default async function HealthCardPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  ensureSchema();
  ensurePetraitisPatient();
  const db = getDb();
  const key = questionnaireStorageKey();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, key)
      )
    )
    .get();
  const answers = parseStoredAnswers(row?.value);

  const card = buildHealthCard({
    patientName: current.patient.fullName,
    sex: current.patient.sex,
    dob: current.patient.dob,
    answers,
    patientId: current.patient.id,
  });

  const twin = loadDigitalTwin(current.patient.id, locale);
  const pharmaSnps =
    twin?.categories
      .find((c) => c.id === "pharmacogenetics")
      ?.snps.map((s) => ({
        gene: s.gene,
        snpId: s.snpId,
        allele1: s.allele1,
        allele2: s.allele2,
        matchCount: s.matchCount,
        colour: s.colour,
        genotypeAvailable: s.genotypeAvailable,
        subcategory: s.subcategory,
      })) || [];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <HealthCardTabs
        locale={locale}
        labels={labels}
        card={card}
        pharmaSnps={pharmaSnps}
      />
    </div>
  );
}
