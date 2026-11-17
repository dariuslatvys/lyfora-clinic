import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { ensureSchema, getDb } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { ensurePetraitisPatient } from "@/lib/health/petraitis-patient";
import { PhenotypeDetailView } from "@/components/patient/phenotype-detail";
import { PmosReportView } from "@/components/patient/pmos-report";
import {
  DEMO_PMOS_REPORT,
  getPhenotype,
  type ReproductivePhenotypeId,
} from "@/lib/health/reproductive-phenotypes";

const VALID: ReproductivePhenotypeId[] = [
  "pmos",
  "endometriosis",
  "early_perimenopause",
  "menopause",
];

export default async function DoctorReproductivePhenotypePage({
  params,
}: {
  params: Promise<{ id: string; phenotype: string }>;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  const { id, phenotype: raw } = await params;
  ensureSchema();
  ensurePetraitisPatient();
  const twin = loadDigitalTwin(id, locale);
  if (!twin) notFound();

  const db = getDb();
  const patientRow = db.select().from(patients).where(eq(patients.id, id)).get();
  if (!patientRow) notFound();
  if (twin.patient.sex !== "female") redirect(`/doctor/patients/${id}`);

  if (!VALID.includes(raw as ReproductivePhenotypeId)) notFound();
  const phenotype = getPhenotype(raw);
  if (!phenotype) notFound();

  const name = patientDisplayName(twin.patient.sex, locale, id);

  return (
    <div className="stack" style={{ gap: 12 }}>
      <Link
        href={`/doctor/patients/${id}/reproductive`}
        className="text-sm text-[var(--muted)]"
      >
        ← {labels.back} ·{" "}
        {locale === "en"
          ? "Women’s health and life stages"
          : "Moters sveikata ir gyvybiniai etapai"}
      </Link>
      <p className="small muted m-0">
        {locale === "en" ? "Patient" : "Pacientė"}: <b>{name}</b>
      </p>

      {phenotype.id === "pmos" ? (
        <PmosReportView locale={locale} report={DEMO_PMOS_REPORT} />
      ) : (
        <PhenotypeDetailView locale={locale} phenotype={phenotype} />
      )}
    </div>
  );
}
