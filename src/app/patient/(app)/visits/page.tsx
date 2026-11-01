import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  formatVisitWhen,
  pastVisits,
  upcomingVisits,
  visitDoctor,
  visitSpecialty,
  visitTitle,
} from "@/lib/health/demo-visits";

export default async function VisitsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const upcoming = upcomingVisits();
  const past = pastVisits();

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <h2 className="font-[family-name:var(--font-display)] text-3xl m-0">
          {labels.visits}
        </h2>
        <Link href="/patient/consultations" className="btn sm">
          {labels.bookVisit}
        </Link>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>
            {locale === "en" ? "Upcoming" : "Suplanuoti"}
          </h2>
          <span className="pill plain c-acc">{upcoming.length}</span>
        </div>
        <div className="list">
          {upcoming.map((v) => (
            <Link
              key={v.id}
              href={`/patient/visits/${v.id}`}
              className="li click"
            >
              <div className="grow">
                <b>{visitTitle(v, locale)}</b>
                <span className="xs muted">
                  {visitDoctor(v, locale)} · {visitSpecialty(v, locale)}
                </span>
              </div>
              <span className="small muted">{formatVisitWhen(v, locale)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>{locale === "en" ? "Past visits" : "Buvę vizitai"}</h2>
          <span className="small muted">{past.length}</span>
        </div>
        <div className="list">
          {past.map((v) => (
            <Link
              key={v.id}
              href={`/patient/visits/${v.id}`}
              className="li click"
            >
              <div className="grow">
                <b>{visitTitle(v, locale)}</b>
                <span className="xs muted">
                  {visitDoctor(v, locale)} · {visitSpecialty(v, locale)}
                </span>
              </div>
              <span className="small muted">{formatVisitWhen(v, locale)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
