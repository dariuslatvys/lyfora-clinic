import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";

export default async function UrgentPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  return (
    <div className="panel" style={{ borderColor: "color-mix(in srgb, var(--r-orange) 35%, var(--line))" }}>
      <p className="eyebrow" style={{ color: "var(--r-orange)" }}>
        24/7
      </p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
        {labels.urgentConsult}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
        {locale === "en"
          ? "For urgent but non-emergency questions, start a priority consultation with the clinic team. If you have chest pain, severe shortness of breath, or other emergency symptoms, call emergency services."
          : "Skubiems, bet ne gyvybei pavojingiems klausimams – prioritetinė konsultacija su klinikos komanda. Jei jaučiate krūtinės skausmą, sunkų dusulį ar kitus ūmius simptomus — kvieskite greitąją pagalbą."}
      </p>
      <div className="quick mt-5">
        <Link href="/patient/questions" className="btn">
          {labels.askDoctor247}
        </Link>
        <Link href="/patient/visits" className="btn ghost">
          {labels.bookVisit}
        </Link>
      </div>
    </div>
  );
}
