import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { markerDefs, markerResults } from "@/lib/db/schema";
import { t } from "@/lib/i18n/dictionary";
import { markerItemColour } from "@/lib/health/marker-colour";
import {
  formatMarkerReading,
  physicalMarkerName,
} from "@/lib/health/marker-display";
import { isPhysicalMarkerKey } from "@/lib/health/physical-metrics";
import { PILL_CLASS } from "@/lib/health/colours";
import {
  HEALTH_CATEGORIES,
  type HealthCategoryId,
} from "@/lib/health/categories";
import {
  formatVisitWhen,
  getVisit,
  referralStatusLabel,
  visitDoctor,
  visitNotes,
  visitPlace,
  visitReportBody,
  visitReportClinic,
  visitReportKindLabel,
  visitReportTitle,
  visitSpecialty,
  visitTitle,
} from "@/lib/health/demo-visits";
import {
  prescriptionsForVisit,
  rxStatusLabel,
} from "@/lib/health/demo-prescriptions";

function guessCategory(categoriesJson: string): HealthCategoryId | null {
  let cats: string[] = [];
  try {
    cats = JSON.parse(categoriesJson) as string[];
  } catch {
    return null;
  }
  for (const name of cats) {
    const hit = HEALTH_CATEGORIES.find((c) =>
      c.markerCategoryNames.some(
        (n) => n.toLowerCase() === String(name).toLowerCase()
      )
    );
    if (hit) return hit.id;
  }
  return null;
}

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

  const relatedRx = prescriptionsForVisit(visit.id);

  ensureSchema();
  const db = getDb();
  const relatedDates = visit.relatedLabDates || [];

  const relatedRows =
    relatedDates.length > 0
      ? db
          .select()
          .from(markerResults)
          .where(
            and(
              eq(markerResults.patientId, current.patient.id),
              inArray(markerResults.observedAt, relatedDates)
            )
          )
          .all()
      : [];

  const defs = db.select().from(markerDefs).all();
  const defMap = new Map(defs.map((d) => [d.key, d]));

  const relatedLabs = relatedRows
    .filter((r) => !isPhysicalMarkerKey(r.markerKey))
    .map((r) => {
      const def = defMap.get(r.markerKey);
      const catId = def ? guessCategory(def.categoriesJson) : null;
      const colour = markerItemColour({
        value: r.value,
        refLow: r.refLow,
        refHigh: r.refHigh,
        flag: r.flag,
        unit: r.unit,
        markerKey: r.markerKey,
      });
      return {
        id: r.id,
        markerKey: r.markerKey,
        name:
          physicalMarkerName(r.markerKey, locale) ||
          def?.name ||
          r.markerKey,
        reading: formatMarkerReading(r.value, r.unit, r.markerKey),
        observedAt: r.observedAt,
        colour,
        href: catId
          ? `/patient/marker/${encodeURIComponent(r.markerKey)}?cat=${catId}`
          : `/patient/marker/${encodeURIComponent(r.markerKey)}`,
      };
    })
    .sort(
      (a, b) =>
        b.observedAt.localeCompare(a.observedAt) ||
        a.name.localeCompare(b.name, locale === "en" ? "en" : "lt")
    );

  const byDate = new Map<string, typeof relatedLabs>();
  for (const row of relatedLabs) {
    const cur = byDate.get(row.observedAt) || [];
    cur.push(row);
    byDate.set(row.observedAt, cur);
  }

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
                : visit.status === "missed"
                  ? locale === "en"
                    ? "Missed visit"
                    : "Praleistas vizitas"
                  : locale === "en"
                    ? "Past visit"
                    : "Įvykęs vizitas"}
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-1 mb-0">
              {visitTitle(visit, locale)}
            </h1>
          </div>
          <span
            className={`pill ${
              visit.status === "upcoming"
                ? "c-green"
                : visit.status === "missed"
                  ? "c-orange"
                  : "c-none"
            }`}
          >
            {visit.status === "upcoming"
              ? locale === "en"
                ? "Planned"
                : "Suplanuota"
              : visit.status === "missed"
                ? locale === "en"
                  ? "Missed"
                  : "Praleista"
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
      </section>

      {visit.reports && visit.reports.length > 0 ? (
        <section className="card">
          <div className="card-head">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
              {locale === "en"
                ? "Visit / test reports"
                : "Vizito / tyrimo aprašymai"}
            </h2>
            <span className="pill plain c-acc">{visit.reports.length}</span>
          </div>
          <p className="small muted mt-1 mb-3">
            {locale === "en"
              ? "Procedure, imaging and ambulatory notes linked to this visit."
              : "Procedūrų, vaizdinių tyrimų ir ambulatoriniai aprašymai, susiję su šiuo vizitu."}
          </p>
          <div className="stack" style={{ gap: 12 }}>
            {visit.reports.map((report) => {
              const clinic = visitReportClinic(report, locale);
              return (
                <article key={report.id} className="visit-report">
                  <div className="row between" style={{ gap: 10, alignItems: "flex-start" }}>
                    <div>
                      <span className="pill plain c-acc">
                        {visitReportKindLabel(report.kind, locale)}
                      </span>
                      <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-semibold mt-2 mb-0">
                        {visitReportTitle(report, locale)}
                      </h3>
                      {clinic ? (
                        <p className="visit-report-clinic m-0 mt-1">
                          {locale === "en" ? "Clinic" : "Klinika"}: {clinic}
                        </p>
                      ) : null}
                    </div>
                    <span className="small muted whitespace-nowrap">{report.date}</span>
                  </div>
                  <div className="visit-report-body">
                    {visitReportBody(report, locale)
                      .split("\n")
                      .filter(Boolean)
                      .map((line, idx) => (
                        <p key={idx} className="m-0">
                          {line}
                        </p>
                      ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {relatedRx.length > 0 ? (
        <section className="card">
          <div className="card-head">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
              {locale === "en" ? "Related prescriptions" : "Susiję receptai"}
            </h2>
            <span className="pill plain c-acc">{relatedRx.length}</span>
          </div>
          <p className="small muted mt-1 mb-3">
            {locale === "en"
              ? "e-Prescriptions issued during or after this visit — open for full ESPBI-style details."
              : "E. receptai, išrašyti šio vizito metu ar po jo — atidarykite detales."}
          </p>
          <div className="list">
            {relatedRx.map((r) => (
              <Link
                key={r.id}
                href={`/patient/prescriptions?rx=${encodeURIComponent(r.id)}`}
                className="li click"
              >
                <div className="grow">
                  <b>
                    {locale === "en" ? r.substanceEn : r.substanceLt}{" "}
                    {r.strength}
                  </b>
                  <p className="small muted m-0 mt-1">
                    {r.diagnosisCode} ·{" "}
                    {locale === "en" ? r.diagnosisEn : r.diagnosisLt}
                  </p>
                  <p className="small muted m-0 mt-1">
                    {locale === "en" ? r.directionsEn : r.directionsLt}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`pill ${
                      r.status === "active"
                        ? "c-green"
                        : r.status === "dispensed"
                          ? "c-acc"
                          : "c-none"
                    }`}
                  >
                    {rxStatusLabel(r.status, locale)}
                  </span>
                  <p className="small muted m-0 mt-2">{r.issuedAt}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/patient/prescriptions" className="btn ghost sm">
              {locale === "en" ? "All prescriptions" : "Visi receptai"}
            </Link>
          </div>
        </section>
      ) : null}

      {visit.referrals && visit.referrals.length > 0 ? (
        <section className="card">
          <div className="card-head">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
              {locale === "en" ? "Related referrals" : "Susiję siuntimai"}
            </h2>
            <span className="pill plain c-acc">{visit.referrals.length}</span>
          </div>
          <p className="small muted mt-1 mb-3">
            {locale === "en"
              ? "Referrals issued from this visit for imaging, therapy or specialists."
              : "Siuntimai, išduoti šiame vizite — tyrimams, terapijai ar specialistams."}
          </p>
          <div className="list">
            {visit.referrals.map((r) => (
              <div key={r.id} className="li referral-li">
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
                  <span
                    className={`pill ${
                      r.status === "completed"
                        ? "c-green"
                        : r.status === "scheduled"
                          ? "c-yellow"
                          : "c-acc"
                    }`}
                  >
                    {referralStatusLabel(r.status, locale)}
                  </span>
                  <p className="small muted m-0 mt-2">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link href="/patient/referrals" className="btn ghost sm">
              {locale === "en" ? "All referrals" : "Visi siuntimai"}
            </Link>
          </div>
        </section>
      ) : null}

      {relatedDates.length > 0 ? (
        <section className="card">
          <div className="card-head">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
              {locale === "en" ? "Related tests" : "Susiję tyrimai"}
            </h2>
            <span className="pill plain c-acc">{relatedLabs.length}</span>
          </div>
          <p className="small muted mt-1 mb-3">
            {locale === "en"
              ? "Lab results linked to this visit. Open a marker for details."
              : "Tyrimai, susiję su šiuo vizitu. Paspauskite rodiklį — pamatysite detales."}
          </p>

          {relatedLabs.length ? (
            <div className="stack" style={{ gap: 14 }}>
              {[...byDate.entries()].map(([date, rows]) => (
                <div key={date}>
                  <p className="eyebrow mb-2">{date}</p>
                  <div className="list">
                    {rows.map((r) => (
                      <Link key={r.id} href={r.href} className="li click">
                        <div className="grow">
                          <b>{r.name}</b>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <b className="num">{r.reading}</b>
                          <div>
                            <span className={`pill ${PILL_CLASS[r.colour]}`}>
                              {labels.colourLabels[r.colour]}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              {locale === "en"
                ? "No lab results found for the linked dates."
                : "Susijusioms datoms tyrimų rezultatų nerasta."}
            </div>
          )}
        </section>
      ) : null}

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
