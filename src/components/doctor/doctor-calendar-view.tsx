"use client";

import { useMemo, useState, useEffect } from "react";
import {
  DOCTOR_APPT_EVENT,
  appointmentCountsByDate,
  appointmentsForDay,
  baseDoctorAppointments,
  mergeAppointments,
  modeBadgeLabel,
  modeLabel,
  modePillClass,
  monthMatrix,
  readCreatedAppointments,
  statusLabel,
  videoPlatformLabel,
  type DoctorAppointment,
  type DoctorPatientOption,
} from "@/lib/doctor/doctor-calendar";
import { todayIsoDate } from "@/lib/health/demo-visits";
import { DoctorAppointmentDetail } from "@/components/doctor/doctor-appointment-detail";
import { DoctorNewVisitForm } from "@/components/doctor/doctor-new-visit-form";
import { doctorVisitCopy } from "@/components/doctor/doctor-visit-copy";

const WEEKDAYS_LT = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function DoctorCalendarView({
  locale,
  patients,
  initialDate,
}: {
  locale: "lt" | "en";
  patients: DoctorPatientOption[];
  initialDate?: string;
}) {
  const today = todayIsoDate();
  const visitCopy = useMemo(() => doctorVisitCopy(locale), [locale]);
  const [selected, setSelected] = useState(initialDate || today);
  const [anchor, setAnchor] = useState(
    (initialDate || today).slice(0, 7) + "-01"
  );
  const [created, setCreated] = useState<DoctorAppointment[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      setCreated(readCreatedAppointments());
    }
    sync();
    window.addEventListener(DOCTOR_APPT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DOCTOR_APPT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const base = useMemo(() => baseDoctorAppointments(locale), [locale]);
  const all = useMemo(
    () => mergeAppointments(base, created),
    [base, created]
  );
  const counts = useMemo(() => appointmentCountsByDate(all), [all]);
  const dayList = useMemo(
    () => appointmentsForDay(all, selected),
    [all, selected]
  );
  const matrix = useMemo(() => monthMatrix(anchor), [anchor]);
  const selectedAppt =
    dayList.find((a) => a.id === selectedApptId) ||
    all.find((a) => a.id === selectedApptId) ||
    null;

  useEffect(() => {
    setSelectedApptId(null);
    setOpenForm(false);
  }, [selected]);

  const copy =
    locale === "en"
      ? {
          eyebrow: "Schedule",
          title: "Calendar",
          blurb:
            "Month view with today’s date selected by default. Open a day to see occupancy and create a visit.",
          today: "Today",
          schedule: "Day schedule",
          empty: "No appointments on this day.",
          visits: "visits",
          prev: "Previous month",
          next: "Next month",
          referral: visitCopy.referral,
          selfPhone: visitCopy.selfPhone,
        }
      : {
          eyebrow: "Darbotvarkė",
          title: "Kalendorius",
          blurb:
            "Mėnesio kalendorius — einamoji diena pažymėta. Pasirinkite dieną, kad matytumėte užimtumą ir sukurtumėte vizitą.",
          today: "Šiandien",
          schedule: "Dienos užimtumas",
          empty: "Šią dieną vizitų nėra.",
          visits: "vizit.",
          prev: "Ankstesnis mėnuo",
          next: "Kitas mėnuo",
          referral: visitCopy.referral,
          selfPhone: visitCopy.selfPhone,
        };

  function openCreate() {
    setSelectedApptId(null);
    setOpenForm(true);
  }

  function shiftMonth(delta: number) {
    const [y, m] = anchor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setAnchor(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_LT;

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
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => {
              setSelected(today);
              setAnchor(today.slice(0, 7) + "-01");
            }}
          >
            {copy.today}
          </button>
          <button type="button" className="btn sm" onClick={openCreate}>
            {visitCopy.create}
          </button>
        </div>
      </div>

      <div className="doctor-cal-grid">
        <section className="card doctor-cal-month">
          <div className="card-head">
            <button
              type="button"
              className="btn ghost sm"
              aria-label={copy.prev}
              onClick={() => shiftMonth(-1)}
            >
              ←
            </button>
            <h3 className="m-0 capitalize">{matrix.monthLabel}</h3>
            <button
              type="button"
              className="btn ghost sm"
              aria-label={copy.next}
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
            {matrix.weeks.flat().map((cell) => {
              const n = counts[cell.iso] || 0;
              const isSelected = cell.iso === selected;
              const isToday = cell.iso === today;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={[
                    "doctor-cal-day",
                    cell.inMonth ? "" : "out",
                    isSelected ? "on" : "",
                    isToday ? "today" : "",
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
        </section>

        <section className="card doctor-cal-daypanel">
          <div className="card-head">
            <div>
              <h3 className="m-0">{copy.schedule}</h3>
              <p className="small muted m-0 mt-1">
                {selected}
                {selected === today ? ` · ${copy.today}` : ""}
                {` · ${dayList.length} ${copy.visits}`}
              </p>
            </div>
            {!openForm && !selectedAppt ? (
              <button type="button" className="btn sm" onClick={openCreate}>
                {visitCopy.create}
              </button>
            ) : null}
          </div>

          {selectedAppt && !openForm ? (
            <DoctorAppointmentDetail
              locale={locale}
              a={selectedAppt}
              patients={patients}
              copy={visitCopy}
              onBack={() => setSelectedApptId(null)}
            />
          ) : openForm ? (
            <DoctorNewVisitForm
              locale={locale}
              patients={patients}
              date={selected}
              all={all}
              copy={visitCopy}
              onCancel={() => setOpenForm(false)}
              onSaved={() => {
                setCreated(readCreatedAppointments());
                setOpenForm(false);
              }}
            />
          ) : (
            <div className="stack mt-3" style={{ gap: 8 }}>
              {dayList.length ? (
                dayList.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="doctor-appt-row doctor-appt-row-btn"
                    onClick={() => setSelectedApptId(a.id)}
                  >
                    <div className="doctor-appt-time">
                      <b>{a.time}</b>
                    </div>
                    <div className="doctor-appt-main">
                      <div className="doctor-appt-title-row">
                        <b>{locale === "en" ? a.titleEn : a.titleLt}</b>
                        <span
                          className={`pill ${modePillClass(a.mode)}`}
                          title={modeLabel(a.mode, locale)}
                        >
                          {modeBadgeLabel(a.mode, locale)}
                        </span>
                      </div>
                      <span className="small muted">
                        {locale === "en" ? a.patientNameEn : a.patientNameLt}
                        {` · ${modeLabel(a.mode, locale)}`}
                        {a.placeLt
                          ? ` · ${locale === "en" ? a.placeEn : a.placeLt}`
                          : ""}
                      </span>
                      {a.mode === "video" && a.videoUrl ? (
                        <span className="xs" style={{ color: "var(--accent)" }}>
                          {videoPlatformLabel(a.videoPlatform)}
                        </span>
                      ) : a.source?.kind === "referral" ? (
                        <span className="xs" style={{ color: "var(--accent)" }}>
                          {copy.referral}
                        </span>
                      ) : a.source?.kind === "self" &&
                        a.source.self.channel === "phone" ? (
                        <span className="xs muted">{copy.selfPhone}</span>
                      ) : null}
                    </div>
                    <span
                      className={`pill ${
                        a.status === "upcoming"
                          ? "c-acc"
                          : a.status === "missed" || a.status === "cancelled"
                            ? "c-none"
                            : "c-green"
                      }`}
                    >
                      {statusLabel(a.status, locale)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="empty">{copy.empty}</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
