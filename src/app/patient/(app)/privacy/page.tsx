import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { PrivacyView } from "@/components/patient/privacy-view";

export default async function PrivacyPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  return (
    <PrivacyView locale={locale} patientHint={current.patient.id} />
  );
}
