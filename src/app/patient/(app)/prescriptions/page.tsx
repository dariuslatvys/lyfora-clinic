import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  activePrescriptions,
  historicalPrescriptions,
} from "@/lib/health/demo-prescriptions";
import { PrescriptionsView } from "@/components/patient/prescriptions-view";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ rx?: string }>;
}) {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const sp = await searchParams;

  return (
    <PrescriptionsView
      locale={locale}
      active={activePrescriptions()}
      history={historicalPrescriptions()}
      initialRxId={sp.rx || null}
    />
  );
}
