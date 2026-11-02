import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/dictionary";
import { DoctorRequestsView } from "@/components/doctor/doctor-requests-view";

export default async function DoctorRequestsPage() {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  return (
    <Suspense fallback={null}>
      <DoctorRequestsView locale={locale} />
    </Suspense>
  );
}
