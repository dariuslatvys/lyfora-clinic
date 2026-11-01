"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
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
import { buildVaccineCalendar } from "@/lib/health/vaccine-calendar";
import {
  assessLabelGeneRisk,
  geneRiskDisclaimer,
} from "@/lib/health/assess-drug-gene-risk";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  type RiskColour,
} from "@/lib/health/colours";
import { MedToleranceCheck } from "@/components/patient/med-tolerance-check";
import type { PharmaSnpRow } from "@/components/patient/pharma-genes-tabs";

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
  pharmaSnps = [],
}: {
  locale: "lt" | "en";
  labels: Dictionary;
  card: HealthCardModel;
  pharmaSnps?: PharmaSnpRow[];
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
      {tab === "meds" ? (
        <MedsPane
          locale={locale}
          card={card}
          pharmaSnps={pharmaSnps}
          colourLabels={labels.colourLabels}
          awaitingDna={labels.awaitingDna}
        />
      ) : null}
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
  const lifestyleRows = [
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
  ] as [string, string][];

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="hc-grid-3">
        <section className="card">
          <h3 className="hc-h3">
            {locale === "en" ? "Allergies" : "Alergijos"}
          </h3>
          <div className="stack mt-3" style={{ gap: 8 }}>
            {card.allergies.map((a) =>
              a.href ? (
                <Link key={a.lt} href={a.href} className="hc-alert clickable">
                  <b>{locale === "en" ? a.en : a.lt}</b>
                </Link>
              ) : (
                <div key={a.lt} className="hc-alert">
                  <b>{locale === "en" ? a.en : a.lt}</b>
                </div>
              )
            )}
          </div>
        </section>

        <section className="card">
          <h3 className="hc-h3">
            {locale === "en" ? "Measurements" : "Matavimai"}
          </h3>
          <div className="hc-kpi-grid mt-3">
            <Link
              href={card.vitals.bpHref || "#"}
              className="hc-kpi clickable"
            >
              <b className="num">{card.vitals.bp || "—"}</b>
              <span>AKS, mmHg</span>
            </Link>
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
          <div className="card-head" style={{ marginBottom: 0 }}>
            <h3 className="hc-h3 m-0">
              {locale === "en" ? "Lifestyle" : "Gyvensena"}
            </h3>
            <Link href={card.lifestyle.href} className="btn ghost sm">
              {locale === "en" ? "Edit" : "Keisti"}
            </Link>
          </div>
          <div className="hc-life-list mt-3">
            {lifestyleRows.map(([k, val]) => (
              <Link
                key={k}
                href={card.lifestyle.href}
                className="hc-life-row"
              >
                <span className="hc-life-k">{k}</span>
                <span className="hc-life-v">{val}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="hc-grid-2">
        <section className="card">
          <div className="card-head" style={{ marginBottom: 0 }}>
            <h3 className="hc-h3 m-0">
              {locale === "en" ? "Family history" : "Šeimos anamnezė"}
            </h3>
            <Link href={card.familyHref} className="btn ghost sm">
              {locale === "en" ? "Questionnaire" : "Klausimynas"}
            </Link>
          </div>
          <ul className="hc-ul">
            {card.family.map((f) => (
              <li key={f.lt}>
                {f.href ? (
                  <Link href={f.href} className="hc-inline-link">
                    {locale === "en" ? f.en : f.lt}
                  </Link>
                ) : locale === "en" ? (
                  f.en
                ) : (
                  f.lt
                )}
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="card-head" style={{ marginBottom: 0 }}>
            <h3 className="hc-h3 m-0">
              {locale === "en"
                ? "Chronic & active conditions"
                : "Lėtinės ir aktyvios būklės"}
            </h3>
            <Link href={card.conditionsHref} className="btn ghost sm">
              {locale === "en" ? "Questionnaire" : "Klausimynas"}
            </Link>
          </div>
          <div className="list mt-2">
            {card.conditions.map((c, i) => {
              const rowKey = `${c.code}-${c.since}-${c.nameEn}-${i}`;
              const body = (
                <>
                  <span className="mono small" style={{ width: 56 }}>
                    {c.code}
                  </span>
                  <span className="grow small">
                    {locale === "en" ? c.nameEn : c.nameLt}
                  </span>
                  <span
                    className={`pill ${
                      c.statusEn === "active" ? "c-yellow" : "c-none"
                    }`}
                  >
                    {locale === "en" ? c.statusEn : c.statusLt}
                  </span>
                </>
              );
              return c.href ? (
                <Link key={rowKey} href={c.href} className="li click">
                  {body}
                </Link>
              ) : (
                <div key={rowKey} className="li">
                  {body}
                </div>
              );
            })}
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
                <th>{locale === "en" ? "Links" : "Nuorodos"}</th>
              </tr>
            </thead>
            <tbody>
              {card.conditions.map((c, i) => (
                <tr key={`${c.code}-${c.since}-${c.nameEn}-${i}`}>
                  <td className="mono">{c.code}</td>
                  <td>
                    {c.href ? (
                      <Link href={c.href} className="hc-inline-link">
                        {locale === "en" ? c.nameEn : c.nameLt}
                      </Link>
                    ) : locale === "en" ? (
                      c.nameEn
                    ) : (
                      c.nameLt
                    )}
                  </td>
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
                    <div className="hc-link-row">
                      {(c.links || []).map((l) => (
                        <Link key={l.href} href={l.href} className="hc-chip-link">
                          {locale === "en" ? l.labelEn : l.labelLt}
                        </Link>
                      ))}
                    </div>
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
          {card.episodes.map((e) => {
            const inner = (
              <>
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
              </>
            );
            return e.href ? (
              <Link
                key={e.code + e.from}
                href={e.href}
                className="li click"
                style={{ alignItems: "flex-start" }}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={e.code + e.from}
                className="li"
                style={{ alignItems: "flex-start" }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MedsPane({
  locale,
  card,
  pharmaSnps,
  colourLabels,
  awaitingDna,
}: {
  locale: "lt" | "en";
  card: HealthCardModel;
  pharmaSnps: PharmaSnpRow[];
  colourLabels: Record<RiskColour, string>;
  awaitingDna: string;
}) {
  const [sub, setSub] = useState<"list" | "tolerance">("list");
  const [openRisk, setOpenRisk] = useState<string | null>(null);
  const presetLabels = useMemo(
    () => card.meds.filter((m) => m.active).map((m) => m.name),
    [card.meds]
  );
  const riskCount = useMemo(
    () =>
      card.meds.filter(
        (m) =>
          assessLabelGeneRisk(m.name, pharmaSnps, locale, { atcCode: m.atc })
            .hasRisk
      ).length,
    [card.meds, pharmaSnps, locale]
  );

  return (
    <section className="card">
      <div className="card-head">
        <h3 className="hc-h3 m-0">
          {locale === "en" ? "Medications" : "Vaistai"}
        </h3>
        <div className="row" style={{ gap: 8 }}>
          <Link href={card.medsHref} className="btn ghost sm">
            {locale === "en" ? "Questionnaire" : "Klausimynas"}
          </Link>
          <Link href="/patient/prescriptions" className="btn sm">
            {locale === "en" ? "Prescriptions" : "Receptai"}
          </Link>
        </div>
      </div>

      <div
        className="tabs visits-tabs mt-2"
        role="tablist"
        aria-label={locale === "en" ? "Medications views" : "Vaistų vaizdai"}
      >
        <button
          type="button"
          role="tab"
          className={sub === "list" ? "on" : undefined}
          aria-selected={sub === "list"}
          onClick={() => setSub("list")}
        >
          {locale === "en" ? "Current list" : "Sąrašas"}
          <span className="visits-tab-count">{card.meds.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={sub === "tolerance" ? "on" : undefined}
          aria-selected={sub === "tolerance"}
          onClick={() => setSub("tolerance")}
        >
          {locale === "en"
            ? "Medicine tolerance check"
            : "Vaistų toleravimo tikrinimas"}
        </button>
      </div>

      {sub === "list" ? (
        <div className="mt-3 stack" style={{ gap: 10 }}>
          {riskCount > 0 ? (
            <p className="small m-0 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[var(--ink-soft)]">
              {locale === "en"
                ? `${riskCount} medicine(s) match risk alleles in your DNA — tap the coloured badge to see which gene. `
                : `${riskCount} vaistas(-ai) sutampa su rizikos aleliais jūsų DNR — spauskite spalvotą žymą, kad pamatytumėte geną. `}
              <b>{geneRiskDisclaimer(locale)}</b>
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="labs-table">
              <thead>
                <tr>
                  <th>{locale === "en" ? "Medicine" : "Vaistas"}</th>
                  <th>ATC</th>
                  <th>{locale === "en" ? "Use" : "Vartojimas"}</th>
                  <th>{locale === "en" ? "From" : "Nuo"}</th>
                  <th>{locale === "en" ? "Genetics" : "Genetika"}</th>
                  <th>{locale === "en" ? "Status" : "Būsena"}</th>
                </tr>
              </thead>
              <tbody>
                {card.meds.map((m) => {
                  const risk = assessLabelGeneRisk(m.name, pharmaSnps, locale, {
                    atcCode: m.atc,
                  });
                  const key = m.name + m.from;
                  const open = openRisk === key;
                  const c = risk.worstColour;
                  return (
                    <Fragment key={key}>
                      <tr
                        style={
                          risk.hasRisk && c
                            ? {
                                background: `linear-gradient(90deg, ${COLOUR_SOFT[c]}, transparent 70%)`,
                                boxShadow: `inset 4px 0 0 ${COLOUR_HEX[c]}`,
                              }
                            : undefined
                        }
                      >
                        <td>
                          <b>{m.name}</b>
                          <div className="xs muted">
                            {locale === "en" ? m.byEn : m.byLt}
                          </div>
                        </td>
                        <td className="mono">{m.atc}</td>
                        <td className="small">
                          {locale === "en" ? m.doseEn : m.doseLt}
                        </td>
                        <td className="num small">{m.from}</td>
                        <td>
                          {risk.hasRisk && c ? (
                            <button
                              type="button"
                              className={`pill ${PILL_CLASS[c]}`}
                              style={{ cursor: "pointer" }}
                              aria-expanded={open}
                              onClick={() =>
                                setOpenRisk(open ? null : key)
                              }
                            >
                              {colourLabels[c]}
                              {" · "}
                              {risk.hits[0]?.gene || "DNR"}
                            </button>
                          ) : risk.hasPanelLink ? (
                            <span className="pill c-green">
                              {locale === "en" ? "No risk alleles" : "Be rizikos alelių"}
                            </span>
                          ) : (
                            <span className="xs muted">—</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`pill ${m.active ? "c-green" : "c-none"}`}
                          >
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
                      {open && risk.hasRisk ? (
                        <tr>
                          <td colSpan={6}>
                            <div
                              className="rounded-md border border-[var(--line)] p-3 my-1"
                              style={{
                                borderLeft: c
                                  ? `4px solid ${COLOUR_HEX[c]}`
                                  : undefined,
                              }}
                            >
                              <p className="eyebrow m-0 mb-2">
                                {locale === "en"
                                  ? "Why this medicine is flagged"
                                  : "Kodėl šis vaistas pažymėtas"}
                              </p>
                              <p className="small muted m-0 mb-2">
                                {risk.focusLabels[0]}
                              </p>
                              <div className="stack" style={{ gap: 8 }}>
                                {risk.hits.map((h) => (
                                  <Link
                                    key={`${h.gene}-${h.snpId}`}
                                    href={h.href}
                                    className="block rounded-md border border-[var(--line)] px-3 py-2 text-[var(--ink)] no-underline hover:border-[var(--accent)]"
                                    style={{
                                      borderLeft: `4px solid ${COLOUR_HEX[h.colour]}`,
                                      background: COLOUR_SOFT[h.colour],
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div>
                                        <b>
                                          {h.gene}{" "}
                                          <span className="font-normal text-[var(--ink-soft)]">
                                            {h.snpId.split("__")[0]}
                                          </span>
                                        </b>
                                        <div className="xs muted">
                                          {h.allele1}/{h.allele2} ·{" "}
                                          {h.matchCount}{" "}
                                          {locale === "en"
                                            ? "risk allele(s)"
                                            : "rizikos alelis(-iai)"}
                                          {" · "}
                                          {h.focusLabel}
                                        </div>
                                      </div>
                                      <span className={`pill ${PILL_CLASS[h.colour]}`}>
                                        {colourLabels[h.colour]}
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                              <p className="small m-0 mt-3 text-[var(--ink-soft)]">
                                <b>{geneRiskDisclaimer(locale)}</b>
                              </p>
                              <div className="hc-link-row mt-2">
                                <Link
                                  href="/patient/digital-twin/pharmacogenetics"
                                  className="hc-chip-link"
                                >
                                  {locale === "en"
                                    ? "Pharmacogenetics"
                                    : "Farmakogenetika"}
                                </Link>
                                <Link
                                  href="/patient/prescriptions"
                                  className="hc-chip-link"
                                >
                                  {locale === "en" ? "Prescriptions" : "Receptai"}
                                </Link>
                                <Link
                                  href="/patient/questions"
                                  className="hc-chip-link"
                                >
                                  {locale === "en"
                                    ? "Ask doctor 24/7"
                                    : "Klausti gydytojo 24/7"}
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <MedToleranceCheck
            locale={locale}
            snps={pharmaSnps}
            colourLabels={colourLabels}
            awaitingDna={awaitingDna}
            presetLabels={presetLabels}
          />
          <p className="small muted mt-3 mb-0">
            <b>{geneRiskDisclaimer(locale)}</b>
          </p>
          <p className="small muted mt-2 mb-0">
            <Link href="/patient/digital-twin/pharmacogenetics">
              {locale === "en"
                ? "Open full pharmacogenetics"
                : "Atidaryti farmakogenetiką"}
            </Link>
          </p>
        </div>
      )}
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
  const [sub, setSub] = useState<"history" | "calendar">("history");
  const calendar = useMemo(
    () => buildVaccineCalendar(card.vaccines),
    [card.vaccines]
  );

  return (
    <section className="card">
      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={locale === "en" ? "Vaccines views" : "Skiepų vaizdai"}
      >
        <button
          type="button"
          role="tab"
          className={sub === "history" ? "on" : undefined}
          aria-selected={sub === "history"}
          onClick={() => setSub("history")}
        >
          {locale === "en" ? "History" : "Istorija"}
          <span className="visits-tab-count">{card.vaccines.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={sub === "calendar" ? "on" : undefined}
          aria-selected={sub === "calendar"}
          onClick={() => setSub("calendar")}
        >
          {locale === "en" ? "Vaccine calendar" : "Skiepų kalendorius"}
          <span className="visits-tab-count">{calendar.length}</span>
        </button>
      </div>

      {sub === "history" ? (
        <div className="overflow-x-auto mt-3">
          <table className="labs-table">
            <thead>
              <tr>
                <th>{locale === "en" ? "Vaccine" : "Vakcina"}</th>
                <th>{locale === "en" ? "Done" : "Atlikta"}</th>
                <th>{locale === "en" ? "Lot" : "Serija"}</th>
                <th>
                  {locale === "en" ? "Place / product" : "Vieta / preparatas"}
                </th>
                <th>
                  {locale === "en" ? "Next / document" : "Kitas / dokumentas"}
                </th>
              </tr>
            </thead>
            <tbody>
              {card.vaccines.map((v) => {
                const due = daysUntil(v.next);
                const overdue = due != null && due < 0;
                const soon = due != null && due <= 45;
                return (
                  <tr key={v.id}>
                    <td>
                      <b>{locale === "en" ? v.nameEn : v.nameLt}</b>
                    </td>
                    <td className="num">{v.date || "—"}</td>
                    <td className="mono small">{v.lot || "—"}</td>
                    <td className="small">
                      {locale === "en" ? v.placeEn : v.placeLt}
                      {(locale === "en" ? v.productEn : v.productLt) ? (
                        <div className="xs muted">
                          {locale === "en" ? v.productEn : v.productLt}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div className="hc-link-row">
                        {v.next ? (
                          soon ? (
                            <span
                              className={`pill ${overdue ? "c-orange" : "c-yellow"}`}
                            >
                              {overdue
                                ? locale === "en"
                                  ? `Overdue ${v.next}`
                                  : `Vėluoja ${v.next}`
                                : locale === "en"
                                  ? `Due ${v.next}`
                                  : `Iki ${v.next}`}
                            </span>
                          ) : (
                            <span className="num small">{v.next}</span>
                          )
                        ) : null}
                        {v.docHref ? (
                          <a
                            href={v.docHref}
                            target="_blank"
                            rel="noreferrer"
                            className="hc-chip-link"
                          >
                            PDF
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3">
          <p className="small muted mt-0 mb-3">
            {locale === "en"
              ? "Upcoming doses from your records, plus computed boosters (e.g. TBE ≈ 3 years after the last TicoVac, flu each season)."
              : "Būsimi skiepai pagal įrašus ir apskaičiuoti kontroliniai (pvz. erkinis encefalitas ≈ 3 m. po paskutinio TicoVac, gripas kas sezoną)."}
          </p>
          {!calendar.length ? (
            <div className="empty">
              {locale === "en"
                ? "No upcoming vaccinations calculated yet."
                : "Kol kas nėra apskaičiuotų būsimų skiepų."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="labs-table">
                <thead>
                  <tr>
                    <th>{locale === "en" ? "Vaccine" : "Vakcina"}</th>
                    <th>{locale === "en" ? "Due" : "Data"}</th>
                    <th>{locale === "en" ? "In" : "Po"}</th>
                    <th>{locale === "en" ? "Note" : "Pastaba"}</th>
                  </tr>
                </thead>
                <tbody>
                  {calendar.map((item) => {
                    const overdue = item.daysFromNow < 0;
                    const soon =
                      item.daysFromNow >= 0 && item.daysFromNow <= 60;
                    const when =
                      item.daysFromNow === 0
                        ? locale === "en"
                          ? "Today"
                          : "Šiandien"
                        : overdue
                          ? locale === "en"
                            ? `${Math.abs(item.daysFromNow)} d overdue`
                            : `vėluoja ${Math.abs(item.daysFromNow)} d.`
                          : locale === "en"
                            ? `${item.daysFromNow} d`
                            : `${item.daysFromNow} d.`;
                    return (
                      <tr key={item.id}>
                        <td>
                          <b>
                            {locale === "en" ? item.nameEn : item.nameLt}
                          </b>
                          <div className="xs muted">
                            {item.kind === "computed"
                              ? locale === "en"
                                ? "Computed schedule"
                                : "Apskaičiuota"
                              : locale === "en"
                                ? "From record"
                                : "Iš įrašo"}
                          </div>
                        </td>
                        <td className="num">{item.due}</td>
                        <td>
                          <span
                            className={`pill ${
                              overdue
                                ? "c-orange"
                                : soon
                                  ? "c-yellow"
                                  : "c-none"
                            }`}
                          >
                            {when}
                          </span>
                        </td>
                        <td className="small">
                          {locale === "en" ? item.noteEn : item.noteLt}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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
          <Link
            key={p.id}
            href={p.href || "#"}
            className="li click"
            style={{ alignItems: "flex-start" }}
          >
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
          </Link>
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
      <div className="card-head">
        <h3 className="hc-h3 m-0">
          {locale === "en" ? "Visit history" : "Vizitų istorija"}
        </h3>
        <Link href={card.visitsHref} className="btn ghost sm">
          {locale === "en" ? "All visits" : "Visi vizitai"}
        </Link>
      </div>
      <div className="list mt-2">
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
        <Link href={card.docsUploadHref} className="btn sm">
          {locale === "en" ? "Upload" : "Įkelti"}
        </Link>
      </div>
      <div className="list mt-2">
        {card.docs.map((d) => {
          const kindLabel =
            d.kind === "lab"
              ? locale === "en"
                ? "Lab"
                : "Tyrimas"
              : d.kind === "report"
                ? locale === "en"
                  ? "Report"
                  : "Aprašymas"
                : d.kind === "vaccine"
                  ? locale === "en"
                    ? "Vaccine"
                    : "Skiepas"
                  : locale === "en"
                    ? "Note"
                    : "Pastaba";
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
                  {locale === "en" ? "New" : "Naujas"}
                </span>
              ) : (
                <span className="pill c-none">{kindLabel}</span>
              )}
            </>
          );
          return d.href ? (
            d.href.startsWith("/docs/") ? (
              <a
                key={d.nameLt + d.date}
                href={d.href}
                target="_blank"
                rel="noreferrer"
                className="li click"
              >
                {inner}
              </a>
            ) : (
              <Link key={d.nameLt + d.date} href={d.href} className="li click">
                {inner}
              </Link>
            )
          ) : (
            <div key={d.nameLt + d.date} className="li">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
