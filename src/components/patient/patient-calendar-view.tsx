"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  monitoringKindLabel,
  type MonitoringKind,
  type PatientCalendarEvent,
} from "@/lib/health/patient-monitoring-shared";

const WEEKDAYS_LT = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthMatrix(anchorIso: string) {
  const [y, m] = anchorIso.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: Array<{ iso: string; inMonth: boolean }> = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(y, m - 1, 1 - (startWeekday - i));
    cells.push({ iso: isoDay(d), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: isoDay(new Date(y, m - 1, day)), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!;
    const d = new Date(`${last.iso}T12:00:00`);
    d.setDate(d.getDate() + 1);
    cells.push({ iso: isoDay(d), inMonth: false });
  }
  return {
    cells,
    labelLt: first.toLocaleDateString("lt-LT", {
      month: "long",
      year: "numeric",
    }),
    labelEn: first.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    }),
  };
}

function kindDotClass(kind: MonitoringKind): string {
  switch (kind) {
    case "visit":
      return "patient-cal-dot visit";
    case "vaccine":
      return "patient-cal-dot vaccine";
    case "lab_recheck":
      return "patient-cal-dot lab";
    case "screening":
      return "patient-cal-dot screen";
    case "prevention":
      return "patient-cal-dot prevent";
    default:
      return "patient-cal-dot consult";
  }
}

export function PatientCalendarView({
  locale,
  events,
}: {
  locale: "lt" | "en";
  events: PatientCalendarEvent[];
}) {
  const today = useMemo(() => isoDay(new Date()), []);
  const [selected, setSelected] = useState(today);
  const [anchor, setAnchor] = useState(today.slice(0, 7) + "-01");

  const byDate = useMemo(() => {
    const map = new Map<string, PatientCalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of events) {
      map[e.date] = (map[e.date] || 0) + 1;
    }
    return map;
  }, [events]);

  const matrix = useMemo(() => monthMatrix(anchor), [anchor]);
  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_LT;

  const chronological = useMemo(
    () =>
      [...events]
        .filter((e) => e.date >= today)
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            (a.time || "").localeCompare(b.time || "")
        ),
    [events, today]
  );

  const selectedEvents = chronological.filter((e) => e.date === selected);
  const rest = chronological.filter((e) => e.date !== selected);

  function shiftMonth(delta: number) {
    const [y, m] = anchor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setAnchor(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="page-head-row">
        <div>
          <p className="eyebrow">
            {locale === "en" ? "My schedule" : "Mano grafikas"}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[1.7rem] font-bold m-0">
            {locale === "en" ? "Visits & calendar" : "Vizitai ir kalendorius"}
          </h1>
          <p className="small muted mt-1 mb-0 max-w-2xl">
            {locale === "en"
              ? "Left: month calendar. Right: visits and monitoring events, nearest first."
              : "Kairėje mėnesio kalendorius. Dešinėje vizitai ir stebėsenos įvykiai — nuo artimiausio."}
          </p>
        </div>
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => {
            setSelected(today);
            setAnchor(today.slice(0, 7) + "-01");
          }}
        >
          {locale === "en" ? "Today" : "Šiandien"}
        </button>
      </div>

      <div className="doctor-cal-grid">
        <section className="card doctor-cal-month">
          <div className="card-head">
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => shiftMonth(-1)}
            >
              ←
            </button>
            <h3 className="m-0 capitalize">
              {locale === "en" ? matrix.labelEn : matrix.labelLt}
            </h3>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => shiftMonth(1)}
            >
              →
            </button>
          </div>
          <div className="doctor-cal-weekdays">
            {weekdays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="doctor-cal-days">
            {matrix.cells.map((cell) => {
              const n = counts[cell.iso] || 0;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={[
                    "doctor-cal-day",
                    cell.inMonth ? "" : "out",
                    cell.iso === selected ? "on" : "",
                    cell.iso === today ? "today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelected(cell.iso)}
                >
                  <b>{Number(cell.iso.slice(8))}</b>
                  {n > 0 ? <i>{n}</i> : <i className="empty" />}
                </button>
              );
            })}
          </div>
          <div className="patient-cal-legend mt-3">
            {(
              [
                "visit",
                "vaccine",
                "lab_recheck",
                "screening",
                "prevention",
                "consult",
              ] as MonitoringKind[]
            ).map((k) => (
              <span key={k}>
                <i className={kindDotClass(k)} />
                {monitoringKindLabel(k, locale)}
              </span>
            ))}
          </div>
        </section>

        <section className="card doctor-cal-daypanel mon-event-panel">
          <div className="card-head" style={{ alignItems: "flex-start" }}>
            <div>
              <h3 className="m-0">
                {locale === "en" ? "Upcoming events" : "Artėjantys įvykiai"}
              </h3>
              <p className="small muted m-0 mt-1">
                {locale === "en"
                  ? `${chronological.length} items · nearest → latest`
                  : `${chronological.length} punktai · nuo artimiausio`}
              </p>
            </div>
          </div>

          {chronological.length ? (
            <div className="stack" style={{ gap: 12 }}>
              <div className="stack" style={{ gap: 8 }}>
                <span className="eyebrow">
                  {locale === "en" ? "Selected day" : "Pasirinkta diena"}
                  {` · ${selected}`}
                </span>
                {selectedEvents.length ? (
                  selectedEvents.map((e) => (
                    <CalEventCard key={e.id} e={e} locale={locale} emphasize />
                  ))
                ) : (
                  <p className="small muted m-0">
                    {locale === "en"
                      ? "No events this day."
                      : "Šią dieną įvykių nėra."}
                  </p>
                )}
              </div>

              {rest.length ? (
                <div className="stack" style={{ gap: 8 }}>
                  <span className="eyebrow">
                    {locale === "en" ? "All upcoming" : "Visi artėjantys"}
                  </span>
                  {rest.map((e) => (
                    <CalEventCard key={`all-${e.id}`} e={e} locale={locale} />
                  ))}
                </div>
              ) : null}

              <div className="hc-link-row">
                <Link href="/patient/health-card?tab=mon" className="hc-chip-link">
                  {locale === "en"
                    ? "Monitoring in health card"
                    : "Stebėsena kortelėje"}
                </Link>
                <Link href="/patient/visits" className="hc-chip-link">
                  {locale === "en" ? "All visits" : "Visi vizitai"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty">
              {locale === "en" ? "No upcoming events." : "Artėjančių įvykių nėra."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CalEventCard({
  e,
  locale,
  emphasize,
}: {
  e: PatientCalendarEvent;
  locale: "lt" | "en";
  emphasize?: boolean;
}) {
  const body = (
    <div className="mon-event-card-inner">
      <div className={`mon-event-rail ${kindDotClass(e.kind).replace("patient-cal-dot ", "mon-kind ")}`} aria-hidden />
      <div className="mon-event-body">
        <div className="flex items-center gap-2 flex-wrap">
          <i className={kindDotClass(e.kind)} />
          <span className="pill plain">{monitoringKindLabel(e.kind, locale)}</span>
          <span className="xs muted">
            {e.date}
            {e.time ? ` · ${e.time}` : ""}
          </span>
        </div>
        <b className="block mt-1">
          {locale === "en" ? e.titleEn : e.titleLt}
        </b>
        <span className="small muted">
          {locale === "en" ? e.detailEn : e.detailLt}
        </span>
      </div>
    </div>
  );
  const className = `mon-event-card${emphasize ? " is-selected" : ""}`;
  if (e.href) {
    return (
      <Link href={e.href} className={`${className} no-underline text-[var(--ink)]`}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
