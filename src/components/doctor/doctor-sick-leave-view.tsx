"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  demoSickLeaves,
  sickLeavesActive,
  sickLeavesEndingOn,
  sickLeavesHistorical,
  type SickLeaveCertificate,
} from "@/lib/doctor/sick-leave";
import { addCalendarDays, todayIsoDate } from "@/lib/health/demo-visits";

type EndingHorizon = "today" | "tomorrow" | "day2";

export function DoctorSickLeaveView({ locale }: { locale: "lt" | "en" }) {
  const today = todayIsoDate();
  const all = useMemo(() => demoSickLeaves(), []);
  const [tab, setTab] = useState<"ending" | "active" | "history">("ending");
  const [horizon, setHorizon] = useState<EndingHorizon>("today");

  const copy =
    locale === "en"
      ? {
          eyebrow: "Certificates",
          title: "Sick-leave certificates",
          blurb:
            "Track certificates ending soon, currently valid, and historical records.",
          ending: "Ending",
          active: "Valid",
          history: "Historical",
          horizonToday: "Today",
          horizonTomorrow: "Tomorrow",
          horizonDay2: "In 2 days",
          horizonHint: "Show certificates ending on:",
          empty: "No certificates in this list.",
          from: "From",
          to: "Until",
          workplace: "Workplace",
          open: "Chart",
          diagnosis: "Diagnosis",
        }
      : {
          eyebrow: "Pažymos",
          title: "Nedarbingumo biuleteniai",
          blurb:
            "Stebėkite baigiančius, galiojančius ir istorinius nedarbingumo biuletenius — data matosi prie paciento.",
          ending: "Baigiasi",
          active: "Galiojantys",
          history: "Istoriniai",
          horizonToday: "Šiandien",
          horizonTomorrow: "Rytoj",
          horizonDay2: "Poryt",
          horizonHint: "Rodyti biuletenius, kurie baigiasi:",
          empty: "Šiame sąraše biuletenių nėra.",
          from: "Nuo",
          to: "Iki",
          workplace: "Darbovietė",
          open: "Kortelė",
          diagnosis: "Diagnozė",
        };

  const endingDate =
    horizon === "today"
      ? today
      : horizon === "tomorrow"
        ? addCalendarDays(today, 1)
        : addCalendarDays(today, 2);

  const ending = sickLeavesEndingOn(all, endingDate);
  const active = sickLeavesActive(all, today);
  const history = sickLeavesHistorical(all, today);
  const list =
    tab === "ending" ? ending : tab === "active" ? active : history;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {copy.title}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-[var(--muted)]">
            {copy.blurb}
          </p>
        </div>
      </div>

      <div className="tabs visits-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={tab === "ending" ? "on" : undefined}
          aria-selected={tab === "ending"}
          onClick={() => setTab("ending")}
        >
          {copy.ending}
          <span className="visits-tab-count">
            {sickLeavesEndingOn(all, today).length}
          </span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "active" ? "on" : undefined}
          aria-selected={tab === "active"}
          onClick={() => setTab("active")}
        >
          {copy.active}
          <span className="visits-tab-count">{active.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "history" ? "on" : undefined}
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
        >
          {copy.history}
          <span className="visits-tab-count">{history.length}</span>
        </button>
      </div>

      <section className="card">
        {list.length ? (
          <div className="stack" style={{ gap: 10 }}>
            {list.map((s) => (
              <SickLeaveRow
                key={s.id}
                locale={locale}
                s={s}
                copy={copy}
                tab={tab}
              />
            ))}
          </div>
        ) : (
          <div className="empty">{copy.empty}</div>
        )}

        {tab === "ending" ? (
          <div className="doctor-sl-horizon">
            <span className="eyebrow">{copy.horizonHint}</span>
            <div className="doctor-cal-modes mt-2" role="group">
              {(
                [
                  ["today", copy.horizonToday],
                  ["tomorrow", copy.horizonTomorrow],
                  ["day2", copy.horizonDay2],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={
                    horizon === id ? "doctor-cal-mode on" : "doctor-cal-mode"
                  }
                  onClick={() => setHorizon(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SickLeaveRow({
  locale,
  s,
  copy,
  tab,
}: {
  locale: "lt" | "en";
  s: SickLeaveCertificate;
  copy: {
    from: string;
    to: string;
    workplace: string;
    open: string;
    diagnosis: string;
  };
  tab: "ending" | "active" | "history";
}) {
  const endPill =
    tab === "ending"
      ? locale === "en"
        ? `Ends ${s.to}`
        : `Baigiasi ${s.to}`
      : tab === "history"
        ? locale === "en"
          ? `Ended ${s.to}`
          : `Baigėsi ${s.to}`
        : locale === "en"
          ? `Until ${s.to}`
          : `Iki ${s.to}`;

  return (
    <div className="doctor-appt-source-card stack" style={{ gap: 8 }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <b>{locale === "en" ? s.patientNameEn : s.patientNameLt}</b>
          <p className="small muted m-0 mt-1">
            {copy.from} {s.from} · {copy.to} {s.to}
          </p>
        </div>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <span
            className={`pill ${
              tab === "ending" ? "c-orange" : tab === "history" ? "c-acc" : "c-green"
            }`}
          >
            {endPill}
          </span>
          <Link
            href={`/doctor/patients/${s.patientId}`}
            className="btn ghost sm"
          >
            {copy.open}
          </Link>
        </div>
      </div>
      <div>
        <span className="eyebrow">{copy.diagnosis}</span>
        <p className="small m-0 mt-1">
          <code className="mono">{s.diagnosisCode}</code>
          {" · "}
          {locale === "en" ? s.diagnosisEn : s.diagnosisLt}
        </p>
      </div>
      <p className="small muted m-0">
        {copy.workplace}:{" "}
        {locale === "en" ? s.workplaceEn : s.workplaceLt}
        {" · "}
        {locale === "en" ? s.doctorEn : s.doctorLt}
      </p>
      {(s.noteLt || s.noteEn) && (
        <p className="small m-0" style={{ color: "var(--accent)" }}>
          {locale === "en" ? s.noteEn : s.noteLt}
        </p>
      )}
    </div>
  );
}
