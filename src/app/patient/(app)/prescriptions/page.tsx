import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  activePrescriptions,
  historicalPrescriptions,
} from "@/lib/health/demo-prescriptions";
import { PrescriptionsView } from "@/components/patient/prescriptions-view";

export default async function PrescriptionsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";

  return (
    <PrescriptionsView
      locale={locale}
      active={activePrescriptions()}
      history={historicalPrescriptions()}
    />
  );
}
