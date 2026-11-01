"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import {
  formatVisitWhen,
  visitDoctor,
  visitSpecialty,
  visitTitle,
} from "@/lib/health/demo-visits";
import type {
  HealthCardModel,
  HealthCardTabId,
} from "@/lib/health/health-card-data";

const TAB_ORDER: { id: HealthCardTabId; labelKey: keyof Dictionary }[] = [
  { id: "sum", labelKey: "cardSummary" },
  { id: "dx", labelKey: "cardDiagnoses" },
  { id: "meds", labelKey: "cardMeds" },
  { id: "vacc", labelKey: "cardVaccines" },
  { id: "proc", labelKey: "cardProcedures" },
  { id: "hist", labelKey: "cardVisitHistory" },
  { id: "docs", labelKey: "cardDocuments" },
];

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(`${iso}T12:00:00`).getTime();
  if (Number.isNaN(t)) return null;
  const now = new Date("2026-11-01T12:00:00").getTime();
  return Math.round((t - now) / 86400000);
}

export function HealthCardTabs({
  locale,
  labels,
  card,
}: {
  locale: "lt" | "en";
  labels: Dictionary;
  card: HealthCardModel;
}) {
  const [tab, setTab] = useState<HealthCardTabId>("sum");

  const headMeta = useMemo(() => {
    const sex = locale === "en" ? card.sexEn : card.sexLt;
    const age =
      card.age != null
        ? locale === "en"
          ? `${card.age} y`
          : `${card.age} m.`
        : "—";
    const dob = card.dob || "—";
    const fd = locale === "en" ? card.familyDoctorEn : card.familyDoctorLt;
    return locale === "en"
      ? `${sex}, ${age} · born ${dob} · blood ${card.bloodGroup} · family doctor ${fd}`
      : `${sex}, ${age} · gim. ${dob} · kraujo grupė ${card.bloodGroup} · šeimos gydytoja ${fd}`;
  }, [card, locale]);

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="page-head-row">
        <div>
          <p className="eyebrow">
            {locale === "en"
              ? "Electronic health record"
              : "Elektroninė sveikatos kortelė"}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[1.7rem] font-bold m-0">
            {card.patientName}
          </h1>
          <p className="small muted mt-1 mb-0">{headMeta}</p>
        </div>
        <Link href="/patient/health-card/questionnaire" className="btn ghost sm">
          {locale === "en" ? "Questionnaire" : "Klausimynas"}
        </Link>
      </div>

      <div
        className="tabs visits-tabs hc-tabs"
        role="tablist"
        aria-label={labels.healthCard}
      >
        {TAB_ORDER.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className={tab === t.id ? "on" : undefined}
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {String(labels[t.labelKey])}
          </button>
        ))}
      </div>

      {tab === "sum" ? <SummaryPane locale={locale} card={card} /> : null}
      {tab === "dx" ? <DiagnosesPane locale={locale} card={card} /> : null}
      {tab === "meds" ? <MedsPane locale={locale} card={card} /> : null}
      {tab === "vacc" ? <VaccinesPane locale={locale} card={card} /> : null}
      {tab === "proc" ? <ProceduresPane locale={locale} card={card} /> : null}
      {tab === "hist" ? <HistoryPane locale={locale} card={card} /> : null}
      {tab === "docs" ? <DocsPane locale={locale} card={card} /> : null}
    </div>
  );
}

function SummaryPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="hc-grid-3">
        <section className="card">
          <h3 className="hc-h3">
            {locale === "en" ? "Allergies" : "Alergijos"}
          </h3>
          <div className="stack mt-3" style={{ gap: 8 }}>
            {card.allergies.length ? (
              card.allergies.map((a) => (
                <div key={a.lt} className="hc-alert">
                  <b>{locale === "en" ? a.en : a.lt}</b>
                </div>
              ))
            ) : (
              <span className="muted small">
                {locale === "en" ? "Unknown" : "Nežinomos"}
              </span>
            )}
          </div>
        </section>

        <section className="card">
          <h3 className="hc-h3">
            {locale === "en" ? "Measurements" : "Matavimai"}
          </h3>
          <div className="hc-kpi-grid mt-3">
            <div className="hc-kpi">
              <b className="num">{card.vitals.bp || "—"}</b>
              <span>AKS, mmHg</span>
            </div>
            <div className="hc-kpi">
              <b className="num">
                {card.vitals.weightKg != null
                  ? String(card.vitals.weightKg).replace(".", ",")
                  : "—"}
              </b>
              <span>{locale === "en" ? "Weight, kg" : "Svoris, kg"}</span>
            </div>
            <div className="hc-kpi">
              <b className="num">
                {card.vitals.bmi != null
                  ? String(card.vitals.bmi).replace(".", ",")
                  : "—"}
              </b>
              <span>KMI</span>
            </div>
            <div className="hc-kpi">
              <b className="num">{card.vitals.heightCm ?? "—"}</b>
              <span>{locale === "en" ? "Height, cm" : "Ūgis, cm"}</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="hc-h3">
            {locale === "en" ? "Lifestyle" : "Gyvensena"}
          </h3>
          <div className="list small mt-2">
            {(
              [
                [
                  locale === "en" ? "Smoking" : "Rūkymas",
                  locale === "en" ? card.lifestyle.smokingEn : card.lifestyle.smokingLt,
                ],
                [
                  locale === "en" ? "Alcohol" : "Alkoholis",
                  locale === "en" ? card.lifestyle.alcoholEn : card.lifestyle.alcoholLt,
                ],
                [
                  locale === "en" ? "Activity" : "Aktyvumas",
                  locale === "en" ? card.lifestyle.activityEn : card.lifestyle.activityLt,
                ],
                [
                  locale === "en" ? "Sleep" : "Miegas",
                  locale === "en" ? card.lifestyle.sleepEn : card.lifestyle.sleepLt,
                ],
              ] as [string, string][]
            ).map(([k, val]) => (
              <div key={k} className="li">
                <span className="grow muted">{k}</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="hc-grid-2">
        <section className="card">
          <h3 className="hc-h3">
            {locale === "en" ? "Family history" : "Šeimos anamnezė"}
          </h3>
          <ul className="hc-ul">
            {card.family.map((f) => (
              <li key={f.lt}>{locale === "en" ? f.en : f.lt}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3 className="hc-h3">
            {locale === "en"
              ? "Chronic & active conditions"
              : "Lėtinės ir aktyvios būklės"}
          </h3>
          <div className="list mt-2">
            {card.conditions.map((c) => (
              <div key={c.code + c.since} className="li">
                <span className="mono small" style={{ width: 56 }}>
                  {c.code}
                </span>
                <span className="grow small">
                  {locale === "en" ? c.nameEn : c.nameLt}
                </span>
                <span
                  className={`pill ${
                    (locale === "en" ? c.statusEn : c.statusLt).includes("aktyv") ||
                    c.statusEn === "active"
                      ? "c-yellow"
                      : "c-none"
                  }`}
                >
                  {locale === "en" ? c.statusEn : c.statusLt}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function DiagnosesPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  return (
    <div className="stack" style={{ gap: 12 }}>
      <section className="card">
        <div className="overflow-x-auto">
          <table className="labs-table">
            <thead>
              <tr>
                <th>{locale === "en" ? "Code (ICD-10)" : "Kodas (TLK-10)"}</th>
                <th>{locale === "en" ? "Diagnosis" : "Diagnozė"}</th>
                <th>{locale === "en" ? "Since" : "Nuo"}</th>
                <th>{locale === "en" ? "Status" : "Būsena"}</th>
                <th>{locale === "en" ? "Recorded by" : "Nustatė"}</th>
              </tr>
            </thead>
            <tbody>
              {card.conditions.map((c) => (
                <tr key={c.code + c.since}>
                  <td className="mono">{c.code}</td>
                  <td>{locale === "en" ? c.nameEn : c.nameLt}</td>
                  <td className="num">{c.since}</td>
                  <td>
                    <span
                      className={`pill ${
                        c.statusEn === "active" ? "c-yellow" : "c-none"
                      }`}
                    >
                      {locale === "en" ? c.statusEn : c.statusLt}
                    </span>
                  </td>
                  <td className="small">
                    {locale === "en" ? c.byEn : c.byLt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3 className="hc-h3">
          {locale === "en"
            ? "Past illnesses (episodes)"
            : "Persirgtos ligos (epizodai)"}
        </h3>
        <div className="list mt-2">
          {card.episodes.map((e) => (
            <div key={e.code + e.from} className="li" style={{ alignItems: "flex-start" }}>
              <span className="mono small" style={{ width: 56 }}>
                {e.code}
              </span>
              <div className="grow">
                <b className="small">
                  {locale === "en" ? e.nameEn : e.nameLt}
                </b>
                <span className="xs muted">
                  {e.from} – {e.to}
                  {" · "}
                  {locale === "en" ? e.noteEn : e.noteLt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MedsPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  return (
    <section className="card">
      <div className="overflow-x-auto">
        <table className="labs-table">
          <thead>
            <tr>
              <th>{locale === "en" ? "Medicine" : "Vaistas"}</th>
              <th>ATC</th>
              <th>{locale === "en" ? "Use" : "Vartojimas"}</th>
              <th>{locale === "en" ? "From" : "Nuo"}</th>
              <th>{locale === "en" ? "Prescribed by" : "Paskyrė"}</th>
              <th>{locale === "en" ? "Status" : "Būsena"}</th>
            </tr>
          </thead>
          <tbody>
            {card.meds.map((m) => (
              <tr key={m.name + m.from}>
                <td>
                  <b>{m.name}</b>
                </td>
                <td className="mono">{m.atc}</td>
                <td className="small">
                  {locale === "en" ? m.doseEn : m.doseLt}
                </td>
                <td className="num small">
                  {m.from}
                  {m.to ? ` – ${m.to}` : ""}
                </td>
                <td className="small">
                  {locale === "en" ? m.byEn : m.byLt}
                </td>
                <td>
                  <span className={`pill ${m.active ? "c-green" : "c-none"}`}>
                    {m.active
                      ? locale === "en"
                        ? "Taking"
                        : "Vartoja"
                      : locale === "en"
                        ? "Stopped"
                        : "Nutraukta"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted mt-3 mb-0">
        {locale === "en"
          ? "Doses are changed only by a clinician. Questions? Ask doctor 24/7."
          : "Vaistų dozes keičia tik gydytojas. Klausimų? Klausti gydytojo 24/7."}
      </p>
    </section>
  );
}

function VaccinesPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  return (
    <section className="card">
      <div className="overflow-x-auto">
        <table className="labs-table">
          <thead>
            <tr>
              <th>{locale === "en" ? "Vaccine" : "Vakcina"}</th>
              <th>{locale === "en" ? "Done" : "Atlikta"}</th>
              <th>{locale === "en" ? "Lot" : "Serija"}</th>
              <th>{locale === "en" ? "Next dose" : "Kitas skiepas"}</th>
            </tr>
          </thead>
          <tbody>
            {card.vaccines.map((v) => {
              const due = daysUntil(v.next);
              const overdue = due != null && due < 0;
              const soon = due != null && due <= 40;
              return (
                <tr key={v.nameLt}>
                  <td>
                    <b>{locale === "en" ? v.nameEn : v.nameLt}</b>
                  </td>
                  <td className="num">
                    {v.date || (
                      <span className="muted">
                        {locale === "en" ? "Not done" : "Neatlikta"}
                      </span>
                    )}
                  </td>
                  <td className="mono small">{v.lot || "—"}</td>
                  <td>
                    {!v.next ? (
                      <span className="muted">—</span>
                    ) : soon ? (
                      <span className={`pill ${overdue ? "c-orange" : "c-yellow"}`}>
                        {overdue
                          ? locale === "en"
                            ? `Overdue since ${v.next}`
                            : `Vėluoja nuo ${v.next}`
                          : locale === "en"
                            ? `Due by ${v.next}`
                            : `Iki ${v.next}`}
                      </span>
                    ) : (
                      <span className="num">{v.next}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProceduresPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  const rows = [...card.procedures].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return (
    <section className="card">
      <div className="list">
        {rows.map((p) => (
          <div key={p.nameLt + p.date} className="li" style={{ alignItems: "flex-start" }}>
            <div className="grow">
              <b>{locale === "en" ? p.nameEn : p.nameLt}</b>
              <span className="small muted">
                {p.date}
                {" · "}
                {locale === "en" ? p.whereEn : p.whereLt}
              </span>
              {(locale === "en" ? p.resultEn : p.resultLt) ? (
                <div className="small mt-1 text-[var(--ink-soft)]">
                  {locale === "en" ? p.resultEn : p.resultLt}
                </div>
              ) : null}
            </div>
            <span className="pill c-none">
              {locale === "en" ? p.typeEn : p.typeLt}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  return (
    <section className="card">
      <div className="list">
        {card.visits.map((v) => (
          <Link
            key={v.id}
            href={`/patient/visits/${v.id}`}
            className="li click"
            style={{ alignItems: "flex-start" }}
          >
            <div className="grow">
              <div className="row between" style={{ gap: 8 }}>
                <b>{visitTitle(v, locale)}</b>
                <span className="pill plain c-acc">
                  {locale === "en" ? "Visit" : "Vizitas"}
                </span>
              </div>
              <span className="small muted">
                {visitDoctor(v, locale)} · {visitSpecialty(v, locale)} ·{" "}
                {formatVisitWhen(v, locale)}
              </span>
              <p className="small m-0 mt-1 text-[var(--ink-soft)]">
                {locale === "en" ? v.notesEn : v.notesLt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DocsPane({
  locale,
  card,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <h3 className="hc-h3 m-0">
          {locale === "en" ? "Documents" : "Dokumentai"}
        </h3>
        <Link href="/patient/uploads" className="btn sm">
          {locale === "en" ? "Upload" : "Įkelti"}
        </Link>
      </div>
      <div className="list mt-2">
        {card.docs.map((d) => {
          const inner = (
            <>
              <div className="grow">
                <b>{locale === "en" ? d.nameEn : d.nameLt}</b>
                <span className="small muted">
                  {d.date} · {d.size}
                </span>
              </div>
              {d.fresh ? (
                <span className="pill plain c-acc">
                  {locale === "en" ? "Uploaded" : "Įkelta"}
                </span>
              ) : (
                <span className="pill c-none">
                  {d.kind === "lab"
                    ? locale === "en"
                      ? "Lab"
                      : "Tyrimas"
                    : d.kind === "report"
                      ? locale === "en"
                        ? "Report"
                        : "Aprašymas"
                      : locale === "en"
                        ? "Note"
                        : "Pastaba"}
                </span>
              )}
            </>
          );
          return d.href ? (
            <Link key={d.nameLt + d.date} href={d.href} className="li click">
              {inner}
            </Link>
          ) : (
            <div key={d.nameLt + d.date} className="li">
              {inner}
            </div>
          );
        })}
      </div>
      <p className="xs muted mt-3 mb-0">
        {locale === "en"
          ? "Upload a photo or PDF of a lab report — AI can suggest markers to add to your twin."
          : "Nuotrauką ar PDF galima įkelti principu „nufotografuok → įkelk“. Nuotraukose AI atpažįsta rodiklius ir pasiūlo juos įtraukti į dvynį."}
      </p>
    </section>
  );
}
