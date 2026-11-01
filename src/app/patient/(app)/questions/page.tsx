import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";

export default async function Page() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const labels = t((current.user.locale as "lt" | "en") || "lt");
  return (
    <div className="panel">
      <h2 className="font-[family-name:var(--font-display)] text-3xl">{labels.questions}</h2>
      <p className="mt-3 text-sm text-[var(--muted)]">{labels.comingSoon}</p>
    </div>
  );
}
