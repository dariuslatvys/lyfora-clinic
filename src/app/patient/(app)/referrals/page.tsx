import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  allReferrals,
  referralStatusLabel,
} from "@/lib/health/demo-visits";

export default async function ReferralsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const rows = allReferrals();

  const open = rows.filter((r) => r.status !== "completed");
  const done = rows.filter((r) => r.status === "completed");

  return (
    <div className="stack" style={{ gap: 16 }}>
      <header>
        <p className="eyebrow">
          {locale === "en" ? "Care pathway" : "Gydymo kelias"}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {labels.referrals}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
          {labels.referralsBlurb}
        </p>
      </header>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {locale === "en" ? "Open / scheduled" : "Aktyvūs / suplanuoti"}
          </h2>
          <span className="pill plain c-acc">{open.length}</span>
        </div>
        {open.length ? (
          <div className="list mt-3">
            {open.map((r) => (
              <Link
                key={r.id}
                href={`/patient/visits/${r.visitId}`}
                className="li click referral-li"
              >
                <div className="grow">
                  <b>{locale === "en" ? r.titleEn : r.titleLt}</b>
                  <p className="small muted m-0 mt-1">
                    {locale === "en" ? r.toSpecialtyEn : r.toSpecialtyLt}
                    {" · "}
                    {locale === "en" ? r.toPlaceEn : r.toPlaceLt}
                  </p>
                  <p className="small muted m-0 mt-1">
                    {locale === "en" ? "From visit" : "Iš vizito"}:{" "}
                    {locale === "en" ? r.visitTitleEn : r.visitTitleLt}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`pill ${
                      r.status === "scheduled" ? "c-yellow" : "c-acc"
                    }`}
                  >
                    {referralStatusLabel(r.status, locale)}
                  </span>
                  <p className="small muted m-0 mt-2">{r.date}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty mt-3">
            {locale === "en"
              ? "No open referrals right now."
              : "Šiuo metu aktyvių siuntimų nėra."}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {locale === "en" ? "Completed" : "Atlikti"}
          </h2>
          <span className="pill plain c-acc">{done.length}</span>
        </div>
        {done.length ? (
          <div className="list mt-3">
            {done.map((r) => (
              <Link
                key={r.id}
                href={`/patient/visits/${r.visitId}`}
                className="li click referral-li"
              >
                <div className="grow">
                  <b>{locale === "en" ? r.titleEn : r.titleLt}</b>
                  <p className="small muted m-0 mt-1">
                    {locale === "en" ? r.toSpecialtyEn : r.toSpecialtyLt}
                    {" · "}
                    {locale === "en" ? r.toPlaceEn : r.toPlaceLt}
                  </p>
                  <p className="small m-0 mt-1 text-[var(--ink-soft)]">
                    {locale === "en" ? r.notesEn : r.notesLt}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="pill c-green">
                    {referralStatusLabel(r.status, locale)}
                  </span>
                  <p className="small muted m-0 mt-2">{r.date}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty mt-3">
            {locale === "en"
              ? "No completed referrals yet."
              : "Atliktų siuntimų dar nėra."}
          </div>
        )}
      </section>
    </div>
  );
}
