"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  DOCTOR_APPT_EVENT,
  addCreatedAppointment,
  appointmentCountsByDate,
  appointmentsForDay,
  baseDoctorAppointments,
  mergeAppointments,
  modeLabel,
  monthMatrix,
  readCreatedAppointments,
  statusLabel,
  type DoctorAppointment,
  type DoctorPatientOption,
} from "@/lib/doctor/doctor-calendar";
import { todayIsoDate, addCalendarDays } from "@/lib/health/demo-visits";

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
  const [selected, setSelected] = useState(initialDate || today);
  const [anchor, setAnchor] = useState(
    (initialDate || today).slice(0, 7) + "-01"
  );
  const [created, setCreated] = useState<DoctorAppointment[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    patientId: patients[0]?.id || "",
    time: "10:00",
    title: "",
    mode: "in_person" as DoctorAppointment["mode"],
  });

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
          create: "New visit",
          save: "Save visit",
          cancel: "Cancel",
          patient: "Patient",
          time: "Time",
          reason: "Reason",
          mode: "Mode",
          visits: "visits",
          prev: "Previous month",
          next: "Next month",
        }
      : {
          eyebrow: "Darbotvarkė",
          title: "Kalendorius",
          blurb:
            "Mėnesio kalendorius — einamoji diena pažymėta. Pasirinkite dieną, kad matytumėte užimtumą ir sukurtumėte vizitą.",
          today: "Šiandien",
          schedule: "Dienos užimtumas",
          empty: "Šią dieną vizitų nėra.",
          create: "Naujas vizitas",
          save: "Išsaugoti vizitą",
          cancel: "Atšaukti",
          patient: "Pacientas",
          time: "Laikas",
          reason: "Priežastis",
          mode: "Būdas",
          visits: "vizit.",
          prev: "Ankstesnis mėnuo",
          next: "Kitas mėnuo",
        };

  function shiftMonth(delta: number) {
    const [y, m] = anchor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setAnchor(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  function saveVisit() {
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient || !form.time) return;
    const title =
      form.title.trim() ||
      (locale === "en" ? "Clinic visit" : "Klinikinis vizitas");
    const appt: DoctorAppointment = {
      id: `created:${Date.now()}`,
      date: selected,
      time: form.time,
      titleLt: title,
      titleEn: title,
      patientId: patient.id,
      patientNameLt: patient.nameLt,
      patientNameEn: patient.nameEn,
      mode: form.mode,
      status: "upcoming",
      createdByDoctor: true,
      placeLt: "Kabinetas 12",
      placeEn: "Room 12",
    };
    addCreatedAppointment(appt);
    setCreated(readCreatedAppointments());
    setOpenForm(false);
    setForm((f) => ({ ...f, title: "" }));
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
          <button
            type="button"
            className="btn sm"
            onClick={() => setOpenForm(true)}
          >
            {copy.create}
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
            <button
              type="button"
              className="btn sm"
              onClick={() => setOpenForm(true)}
            >
              {copy.create}
            </button>
          </div>

          {openForm ? (
            <div className="doctor-cal-form stack" style={{ gap: 10 }}>
              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.patient}</span>
                <select
                  value={form.patientId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patientId: e.target.value }))
                  }
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {locale === "en" ? p.nameEn : p.nameLt}
                    </option>
                  ))}
                </select>
              </label>
              <div className="row" style={{ gap: 10 }}>
                <label className="stack grow" style={{ gap: 4 }}>
                  <span className="eyebrow">{copy.time}</span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time: e.target.value }))
                    }
                  />
                </label>
                <label className="stack grow" style={{ gap: 4 }}>
                  <span className="eyebrow">{copy.mode}</span>
                  <select
                    value={form.mode}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mode: e.target.value as DoctorAppointment["mode"],
                      }))
                    }
                  >
                    <option value="in_person">
                      {modeLabel("in_person", locale)}
                    </option>
                    <option value="video">{modeLabel("video", locale)}</option>
                    <option value="phone">{modeLabel("phone", locale)}</option>
                  </select>
                </label>
              </div>
              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.reason}</span>
                <input
                  value={form.title}
                  placeholder={
                    locale === "en"
                      ? "e.g. Lipid follow-up"
                      : "pvz. Lipidų kontrolė"
                  }
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </label>
              <div className="row" style={{ gap: 8 }}>
                <button type="button" className="btn" onClick={saveVisit}>
                  {copy.save}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setOpenForm(false)}
                >
                  {copy.cancel}
                </button>
              </div>
            </div>
          ) : null}

          <div className="stack mt-3" style={{ gap: 8 }}>
            {dayList.length ? (
              dayList.map((a) => (
                <div key={a.id} className="doctor-appt-row">
                  <div className="doctor-appt-time">
                    <b>{a.time}</b>
                    <span>{modeLabel(a.mode, locale)}</span>
                  </div>
                  <div className="doctor-appt-main">
                    <b>{locale === "en" ? a.titleEn : a.titleLt}</b>
                    <span className="small muted">
                      {locale === "en" ? a.patientNameEn : a.patientNameLt}
                      {a.placeLt
                        ? ` · ${locale === "en" ? a.placeEn : a.placeLt}`
                        : ""}
                    </span>
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
                  {a.patientId ? (
                    <Link
                      href={`/doctor/patients/${a.patientId}`}
                      className="btn ghost sm"
                    >
                      {locale === "en" ? "Chart" : "Kortelė"}
                    </Link>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="empty">{copy.empty}</div>
            )}
          </div>

          <div className="row mt-3" style={{ gap: 8, flexWrap: "wrap" }}>
            {[-1, 0, 1, 2].map((d) => {
              const iso = addCalendarDays(selected, d);
              return (
                <button
                  key={iso}
                  type="button"
                  className={`chip ${iso === selected ? "on" : ""}`}
                  onClick={() => setSelected(iso)}
                >
                  {iso.slice(5)}
                  {counts[iso] ? ` · ${counts[iso]}` : ""}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
