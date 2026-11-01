import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDnaPanel } from "@/lib/health/load-dna";
import { DnaView } from "@/components/patient/dna-view";

export default async function DnaPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const panel = loadDnaPanel(current.patient.id);
  if (!panel) redirect("/login/patient");

  return <DnaView locale={locale} panel={panel} />;
}
