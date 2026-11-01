import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n/dictionary";

const tabs = [
  "cardSummary",
  "cardDiagnoses",
  "cardMeds",
  "cardVaccines",
  "cardProcedures",
  "cardVisitHistory",
  "cardDocuments",
] as const;

export default async function HealthCardPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const labels = t((current.user.locale as "lt" | "en") || "lt");

  return (
    <div className="panel space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-3xl">
        {labels.healthCard}
      </h2>
      <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
        {tabs.map((tab) => (
          <span
            key={tab}
            className="rounded-md bg-white/80 px-3 py-1.5 text-sm text-[var(--ink-soft)]"
          >
            {labels[tab]}
          </span>
        ))}
      </div>
      <p className="text-sm text-[var(--muted)]">{labels.comingSoon}</p>
    </div>
  );
}
