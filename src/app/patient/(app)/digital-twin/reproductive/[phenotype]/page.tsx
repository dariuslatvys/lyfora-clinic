import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
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

export default async function ReproductivePhenotypePage({
  params,
}: {
  params: Promise<{ phenotype: string }>;
}) {
  const { phenotype: raw } = await params;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  if (current.patient.sex !== "female") redirect("/patient/digital-twin");

  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  if (!VALID.includes(raw as ReproductivePhenotypeId)) notFound();
  const phenotype = getPhenotype(raw);
  if (!phenotype) notFound();

  return (
    <div className="stack" style={{ gap: 12 }}>
      <Link href="/patient/digital-twin/reproductive" className="text-sm text-[var(--muted)]">
        ← {labels.back} ·{" "}
        {locale === "en"
          ? "Women’s health and life stages"
          : "Moters sveikata ir gyvybiniai etapai"}
      </Link>

      {phenotype.id === "pmos" ? (
        <PmosReportView locale={locale} report={DEMO_PMOS_REPORT} />
      ) : (
        <PhenotypeDetailView locale={locale} phenotype={phenotype} />
      )}
    </div>
  );
}
