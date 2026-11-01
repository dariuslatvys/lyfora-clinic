import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  activePrescriptions,
  historicalPrescriptions,
} from "@/lib/health/demo-prescriptions";
import { PrescriptionsView } from "@/components/patient/prescriptions-view";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ rx?: string }>;
}) {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const sp = await searchParams;
  const labels = t(locale);
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
    <PrescriptionsView
      locale={locale}
      active={activePrescriptions()}
      history={historicalPrescriptions()}
      initialRxId={sp.rx || null}
      pharmaSnps={pharmaSnps}
      colourLabels={labels.colourLabels as Record<import("@/lib/health/colours").RiskColour, string>}
    />
  );
}
