import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";

export default async function ConsultationsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  const options = [
    {
      href: "/patient/urgent",
      title: labels.urgentConsult,
      blurb:
        locale === "en"
          ? "Priority clinic contact for urgent but non-emergency concerns."
          : "Prioritetinis ryšys su klinika skubiems, bet ne gyvybei pavojingiems klausimams.",
      primary: true,
    },
    {
      href: "/patient/visits",
      title: labels.bookVisit,
      blurb:
        locale === "en"
          ? "Choose a time for an in-person or remote visit with your clinician."
          : "Pasirinkite laiką vizitui arba nuotolinei konsultacijai su gydytoju.",
      primary: false,
    },
    {
      href: "/patient/questions",
      title: labels.askDoctor247,
      blurb:
        locale === "en"
          ? "Write to your doctor any time — answers usually during clinic hours."
          : "Rašykite gydytojui bet kuriuo metu — atsakymai paprastai klinikinėmis valandomis.",
      primary: false,
    },
  ];

  return (
    <div className="stack" style={{ gap: 18 }}>
      <section className="panel">
        <p className="eyebrow">24/7</p>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em]">
          {labels.consultations}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          {locale === "en"
            ? "Pick how you want to reach the clinic — urgent help, a booked visit, or a 24/7 written question."
            : "Pasirinkite, kaip norite susisiekti su klinika — skubi pagalba, rezervuotas vizitas ar klausimas gydytojui 24/7."}
        </p>
      </section>

      <div className="consult-grid">
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className={`consult-card ${opt.primary ? "primary" : ""}`}
          >
            <b>{opt.title}</b>
            <p>{opt.blurb}</p>
            <span className="consult-cta">
              {locale === "en" ? "Open" : "Atidaryti"} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
