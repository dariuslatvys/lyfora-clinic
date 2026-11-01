import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";

export default async function PrescriptionsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  return (
    <div className="panel">
      <p className="eyebrow">
        {locale === "en" ? "Medications" : "Vaistai"}
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
        {labels.prescriptions}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
        {locale === "en"
          ? "Active prescriptions from your clinic will appear here. You can request a refill through Ask doctor 24/7."
          : "Čia matysite aktyvius klinikos receptus. Pratęsti ar paklausti galite per „Klausti gydytojo 24/7“."}
      </p>
      <div className="mt-6 rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface-2)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--ink-soft)]">{labels.comingSoon}</p>
      </div>
    </div>
  );
}
