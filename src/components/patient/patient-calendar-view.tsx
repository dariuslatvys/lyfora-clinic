"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  monitoringKindLabel,
  type MonitoringKind,
  type PatientCalendarEvent,
} from "@/lib/health/patient-monitoring-shared";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthLabel(d: Date, locale: "lt" | "en") {
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    month: "long",
    year: "numeric",
  });
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
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState(isoDay(today));

  const byDate = useMemo(() => {
    const map = new Map<string, PatientCalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0
    ).getDate();
    const out: Array<{ iso: string; inMonth: boolean; day: number }> = [];
    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startWeekday - i));
      out.push({ iso: isoDay(d), inMonth: false, day: d.getDate() });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      out.push({ iso: isoDay(d), inMonth: true, day });
    }
    while (out.length % 7 !== 0) {
      const last = out[out.length - 1]!;
      const d = new Date(`${last.iso}T12:00:00`);
      d.setDate(d.getDate() + 1);
      out.push({ iso: isoDay(d), inMonth: false, day: d.getDate() });
    }
    return out;
  }, [cursor]);

  const selectedEvents = byDate.get(selected) || [];
  const upcoming = events
    .filter((e) => e.date >= isoDay(today))
    .slice(0, 8);

  const weekdays =
    locale === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="page-head-row">
        <div>
          <p className="eyebrow">
            {locale === "en" ? "My schedule" : "Mano grafikas"}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[1.7rem] font-bold m-0">
            {locale === "en" ? "Calendar" : "Kalendorius"}
          </h1>
          <p className="small muted mt-1 mb-0 max-w-2xl">
            {locale === "en"
              ? "Visits, vaccine reminders, lab rechecks, screenings and prevention — in one place."
              : "Vizitai, skiepų priminimai, žymenų kontrolės, atrankos ir prevencija — vienoje vietoje."}
          </p>
        </div>
      </div>

      <div className="patient-cal-layout">
        <div className="panel patient-cal-grid-wrap" style={{ padding: 14 }}>
          <div className="patient-cal-nav">
            <button
              type="button"
              className="btn sm"
              onClick={() => setCursor((c) => addMonths(c, -1))}
            >
              ←
            </button>
            <b className="capitalize">{monthLabel(cursor, locale)}</b>
            <button
              type="button"
              className="btn sm"
              onClick={() => setCursor((c) => addMonths(c, 1))}
            >
              →
            </button>
          </div>

          <div className="patient-cal-weekdays">
            {weekdays.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="patient-cal-days">
            {cells.map((cell) => {
              const dayEvents = byDate.get(cell.iso) || [];
              const isToday = cell.iso === isoDay(today);
              const isOn = cell.iso === selected;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={`patient-cal-day${cell.inMonth ? "" : " out"}${
                    isToday ? " today" : ""
                  }${isOn ? " on" : ""}`}
                  onClick={() => setSelected(cell.iso)}
                >
                  <b>{cell.day}</b>
                  <span className="patient-cal-dots" aria-hidden>
                    {dayEvents.slice(0, 3).map((e) => (
                      <i key={e.id} className={kindDotClass(e.kind)} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="patient-cal-legend">
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
        </div>

        <div className="stack" style={{ gap: 12 }}>
          <div className="panel" style={{ padding: "14px 16px" }}>
            <h3 className="m-0 font-[family-name:var(--font-display)] text-lg">
              {locale === "en" ? "Selected day" : "Pasirinkta diena"}
            </h3>
            <p className="small muted m-0 mt-1">
              {new Date(`${selected}T12:00:00`).toLocaleDateString(
                locale === "en" ? "en-GB" : "lt-LT",
                { weekday: "long", year: "numeric", month: "long", day: "numeric" }
              )}
            </p>
            {selectedEvents.length ? (
              <ul className="patient-cal-event-list">
                {selectedEvents.map((e) => (
                  <li key={e.id}>
                    {e.href ? (
                      <Link href={e.href} className="patient-cal-event">
                        <EventBody e={e} locale={locale} />
                      </Link>
                    ) : (
                      <div className="patient-cal-event">
                        <EventBody e={e} locale={locale} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted mb-0 mt-3">
                {locale === "en"
                  ? "No events this day."
                  : "Šią dieną įvykių nėra."}
              </p>
            )}
          </div>

          <div className="panel" style={{ padding: "14px 16px" }}>
            <h3 className="m-0 font-[family-name:var(--font-display)] text-lg">
              {locale === "en" ? "Coming up" : "Artėjantys"}
            </h3>
            <ul className="patient-cal-event-list">
              {upcoming.map((e) => (
                <li key={`up-${e.id}`}>
                  {e.href ? (
                    <Link href={e.href} className="patient-cal-event">
                      <EventBody e={e} locale={locale} showDate />
                    </Link>
                  ) : (
                    <div className="patient-cal-event">
                      <EventBody e={e} locale={locale} showDate />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="hc-link-row mt-3">
              <Link href="/patient/health-card?tab=mon" className="hc-chip-link">
                {locale === "en" ? "Monitoring in health card" : "Stebėsena kortelėje"}
              </Link>
              <Link href="/patient/visits" className="hc-chip-link">
                {locale === "en" ? "All visits" : "Visi vizitai"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventBody({
  e,
  locale,
  showDate,
}: {
  e: PatientCalendarEvent;
  locale: "lt" | "en";
  showDate?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <i className={kindDotClass(e.kind)} />
        <span className="pill plain">{monitoringKindLabel(e.kind, locale)}</span>
        {showDate ? (
          <span className="xs muted">
            {e.date}
            {e.time ? ` · ${e.time}` : ""}
          </span>
        ) : e.time ? (
          <span className="xs muted">{e.time}</span>
        ) : null}
      </div>
      <b className="block mt-1">
        {locale === "en" ? e.titleEn : e.titleLt}
      </b>
      <span className="small muted">
        {locale === "en" ? e.detailEn : e.detailLt}
      </span>
    </>
  );
}
