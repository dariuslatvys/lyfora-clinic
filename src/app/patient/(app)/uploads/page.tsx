import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db";
import { ensureDemoUploadsSeeded } from "@/lib/health/uploads";
import { UploadsView } from "@/components/patient/uploads-view";

export default async function UploadsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  ensureSchema();
  ensureDemoUploadsSeeded(current.patient.id);
  return <UploadsView locale={locale} />;
}
