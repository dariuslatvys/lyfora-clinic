import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";

export default async function Page() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  return (
    <div className="panel">
      <p className="eyebrow">24/7</p>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
        {labels.questions}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-[var(--ink-soft)]">
        {locale === "en"
          ? "Write to your clinician any time. Responses are typically within clinic hours; urgent cases can use Urgent consultation."
          : "Rašykite gydytojui bet kuriuo metu. Atsakymai paprastai per klinikines darbo valandas; skubiems atvejams naudokite Skubią konsultaciją."}
      </p>
      <div className="mt-5 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface-2)] p-4">
        <label className="eyebrow" htmlFor="q">
          {locale === "en" ? "Your question" : "Jūsų klausimas"}
        </label>
        <textarea
          id="q"
          rows={5}
          className="mt-2 w-full rounded-[var(--radius-s)] border border-[var(--line)] bg-white px-3 py-2 text-sm"
          placeholder={
            locale === "en"
              ? "Describe symptoms, medications, or what you need clarified…"
              : "Aprašykite simptomus, vaistus ar ką reikia paaiškinti…"
          }
        />
        <div className="quick">
          <button type="button" className="btn">
            {locale === "en" ? "Send" : "Siųsti"}
          </button>
          <Link href="/patient/urgent" className="btn ghost">
            {labels.urgentConsult}
          </Link>
        </div>
      </div>
    </div>
  );
}
