import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  formatVisitWhen,
  getVisit,
  visitDoctor,
  visitNotes,
  visitPlace,
  visitSpecialty,
  visitTitle,
} from "@/lib/health/demo-visits";

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const visit = getVisit(id);
  if (!visit) notFound();

  return (
    <div className="stack" style={{ gap: 14 }}>
      <Link href="/patient/visits" className="text-sm text-[var(--muted)]">
        ← {labels.visits}
      </Link>

      <section className="panel">
        <div className="row between" style={{ alignItems: "flex-start", gap: 12 }}>
          <div>
            <span className="eyebrow">
              {visit.status === "upcoming"
                ? locale === "en"
                  ? "Upcoming visit"
                  : "Suplanuotas vizitas"
                : locale === "en"
                  ? "Past visit"
                  : "Įvykęs vizitas"}
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-1 mb-0">
              {visitTitle(visit, locale)}
            </h1>
          </div>
          <span
            className={`pill ${visit.status === "upcoming" ? "c-green" : "c-none"}`}
          >
            {visit.status === "upcoming"
              ? locale === "en"
                ? "Planned"
                : "Suplanuota"
              : locale === "en"
                ? "Completed"
                : "Įvyko"}
          </span>
        </div>

        <div className="visit-meta mt-4">
          <div>
            <p className="eyebrow mb-1">
              {locale === "en" ? "When" : "Kada"}
            </p>
            <p className="m-0 font-medium">{formatVisitWhen(visit, locale)}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">
              {locale === "en" ? "Clinician" : "Gydytojas"}
            </p>
            <p className="m-0 font-medium">{visitDoctor(visit, locale)}</p>
            <p className="small muted m-0">{visitSpecialty(visit, locale)}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">
              {locale === "en" ? "Place" : "Vieta"}
            </p>
            <p className="m-0 font-medium">{visitPlace(visit, locale)}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
          {locale === "en" ? "Visit notes" : "Vizito pastabos"}
        </h2>
        <p className="mt-3 mb-0 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
          {visitNotes(visit, locale)}
        </p>
        {visit.relatedLabDates?.length ? (
          <div className="mt-4">
            <p className="eyebrow mb-2">
              {locale === "en"
                ? "Related lab dates"
                : "Susiję tyrimų datos"}
            </p>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {visit.relatedLabDates.map((d) => (
                <Link
                  key={d}
                  href="/patient/labs"
                  className="pill plain c-acc"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="row" style={{ gap: 8 }}>
        <Link href="/patient/visits" className="btn ghost">
          {locale === "en" ? "All visits" : "Visi vizitai"}
        </Link>
        <Link href="/patient/labs" className="btn ghost">
          {labels.labs}
        </Link>
      </div>
    </div>
  );
}
