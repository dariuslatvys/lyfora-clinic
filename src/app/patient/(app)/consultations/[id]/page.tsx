import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  consultModeLabel,
  formatConsultWhen,
  getConsultation,
} from "@/lib/health/demo-consultations";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const c = getConsultation(id);
  if (!c) notFound();

  const title = locale === "en" ? c.titleEn : c.titleLt;
  const reason = locale === "en" ? c.reasonEn : c.reasonLt;
  const doctor = locale === "en" ? c.doctorEn : c.doctorLt;
  const specialty = locale === "en" ? c.specialtyEn : c.specialtyLt;
  const place = locale === "en" ? c.placeEn : c.placeLt;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <Link href="/patient/consultations" className="text-sm text-[var(--muted)]">
        ← {labels.consultations}
      </Link>

      <section className="panel">
        <div className="row between" style={{ gap: 12, alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">
              {c.status === "upcoming"
                ? locale === "en"
                  ? "Upcoming consultation"
                  : "Būsima konsultacija"
                : locale === "en"
                  ? "Past consultation"
                  : "Įvykusi konsultacija"}
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-1 mb-0">
              {title}
            </h1>
          </div>
          <span
            className={`pill ${
              c.urgency === "urgent" ? "c-orange" : "c-green"
            }`}
          >
            {c.urgency === "urgent"
              ? locale === "en"
                ? "Urgent"
                : "Skubi"
              : locale === "en"
                ? "Planned"
                : "Planinė"}
          </span>
        </div>

        <div className="visit-meta mt-4">
          <div>
            <p className="eyebrow mb-1">{locale === "en" ? "When" : "Kada"}</p>
            <p className="m-0 font-medium">{formatConsultWhen(c, locale)}</p>
            <p className="small muted m-0 mt-1">
              {consultModeLabel(c.mode, locale)}
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">
              {locale === "en" ? "Clinician" : "Gydytojas"}
            </p>
            <p className="m-0 font-medium">{doctor}</p>
            <p className="small muted m-0">{specialty}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">{locale === "en" ? "Place" : "Vieta"}</p>
            <p className="m-0 font-medium">{place}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
          {locale === "en" ? "Reason" : "Priežastis"}
        </h2>
        <p className="mt-3 mb-0 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
          {reason}
        </p>
      </section>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Link href="/patient/consultations" className="btn ghost">
          {labels.consultations}
        </Link>
        {c.visitId ? (
          <Link href={`/patient/visits/${c.visitId}`} className="btn ghost">
            {locale === "en" ? "Related visit" : "Susijęs vizitas"}
          </Link>
        ) : null}
        <Link href="/patient/questions" className="btn">
          {labels.askDoctor247}
        </Link>
      </div>
    </div>
  );
}
