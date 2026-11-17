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
import { ReproductivePhenotypesPanel } from "@/components/patient/reproductive-phenotypes";

export default async function DoctorPatientWomenHealthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  const { id } = await params;
  ensureSchema();
  ensurePetraitisPatient();
  const twin = loadDigitalTwin(id, locale);
  if (!twin) notFound();

  const db = getDb();
  const patientRow = db.select().from(patients).where(eq(patients.id, id)).get();
  if (!patientRow) notFound();
  if (twin.patient.sex !== "female") {
    redirect(`/doctor/patients/${id}`);
  }

  const name = patientDisplayName(twin.patient.sex, locale, id);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Link href={`/doctor/patients/${id}`} className="small muted">
        ← {name} · {locale === "en" ? "Patient chart" : "Paciento kortelė"}
      </Link>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "Women’s health" : "Moters sveikata"}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {locale === "en"
              ? "Women’s health and life stages"
              : "Moters sveikata ir gyvybiniai etapai"}
          </h1>
          <p className="mt-2 mb-0 text-sm text-[var(--muted)]">
            {name} ·{" "}
            {locale === "en"
              ? "Same phenotypes the patient sees in her digital twin."
              : "Tie patys fenotipai, kuriuos pacientė mato savo skaitmeniniame dvynyje."}
          </p>
        </div>
      </div>

      <ReproductivePhenotypesPanel
        locale={locale}
        basePath={`/doctor/patients/${id}/reproductive`}
        interactive
      />
      <p className="small muted m-0">
        ←{" "}
        <Link href={`/doctor/patients/${id}`}>
          {labels.back}
        </Link>
      </p>
    </div>
  );
}
