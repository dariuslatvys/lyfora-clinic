"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  DOCTOR_APPT_EVENT,
  VIDEO_LINK_OPTIONS,
  addCreatedAppointment,
  appointmentCountsByDate,
  appointmentsForDay,
  baseDoctorAppointments,
  freeSlotsForDay,
  mergeAppointments,
  modeLabel,
  monthMatrix,
  readCreatedAppointments,
  searchDoctorPatients,
  statusLabel,
  type DoctorAppointment,
  type DoctorPatientOption,
  type VideoPlatform,
} from "@/lib/doctor/doctor-calendar";
import { todayIsoDate } from "@/lib/health/demo-visits";

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
  const [patientQuery, setPatientQuery] = useState("");
  const [form, setForm] = useState({
    patientId: "" as string,
    time: "",
    title: "",
    mode: "in_person" as DoctorAppointment["mode"],
    videoPlatform: "meet" as VideoPlatform,
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
  const freeSlots = useMemo(
    () => freeSlotsForDay(all, selected),
    [all, selected]
  );
  const matrix = useMemo(() => monthMatrix(anchor), [anchor]);

  const patientHits = useMemo(
    () => searchDoctorPatients(patients, patientQuery, locale),
    [patients, patientQuery, locale]
  );
  const selectedPatient = patients.find((p) => p.id === form.patientId) || null;

  useEffect(() => {
    if (!openForm) return;
    setForm((f) => {
      if (f.time && freeSlots.includes(f.time)) return f;
      return { ...f, time: freeSlots[0] || "" };
    });
  }, [openForm, selected, freeSlots]);

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
          patientSearch:
            "Search by name, phone, email, personal code or date of birth…",
          patientHint: "Type at least 2 characters — fragment match.",
          noPatients: "No patients match.",
          time: "Time",
          freeTimes: "Available times",
          noSlots: "No free times left on this day.",
          reason: "Reason",
          mode: "Mode",
          videoLinks: "Video link",
          visits: "visits",
          prev: "Previous month",
          next: "Next month",
          clearPatient: "Change",
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
          patientSearch:
            "Ieškoti pagal vardą, pavardę, telefoną, el. paštą, asmens kodą ar gimimo datą…",
          patientHint: "Įveskite bent 2 simbolius — veikia fragmentinė paieška.",
          noPatients: "Pacientų nerasta.",
          time: "Laikas",
          freeTimes: "Laisvi laikai",
          noSlots: "Šią dieną laisvų laikų neliko.",
          reason: "Priežastis",
          mode: "Būdas",
          videoLinks: "Vaizdo nuoroda",
          visits: "vizit.",
          prev: "Ankstesnis mėnuo",
          next: "Kitas mėnuo",
          clearPatient: "Keisti",
        };

  function openCreate() {
    setOpenForm(true);
    setPatientQuery("");
    setForm({
      patientId: "",
      time: freeSlotsForDay(all, selected)[0] || "",
      title: "",
      mode: "in_person",
      videoPlatform: "meet",
    });
  }

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
    if (!freeSlots.includes(form.time)) return;
    const title =
      form.title.trim() ||
      (locale === "en" ? "Clinic visit" : "Klinikinis vizitas");
    const video =
      form.mode === "video"
        ? VIDEO_LINK_OPTIONS.find((v) => v.id === form.videoPlatform)
        : undefined;
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
      placeLt:
        form.mode === "in_person"
          ? "Kabinetas 12"
          : form.mode === "phone"
            ? "Skambutis"
            : video?.label || "Video",
      placeEn:
        form.mode === "in_person"
          ? "Room 12"
          : form.mode === "phone"
            ? "Call"
            : video?.label || "Video",
      videoPlatform: video?.id,
      videoUrl: video?.url,
    };
    addCreatedAppointment(appt);
    setCreated(readCreatedAppointments());
    setOpenForm(false);
    setPatientQuery("");
    setForm({
      patientId: "",
      time: "",
      title: "",
      mode: "in_person",
      videoPlatform: "meet",
    });
  }

  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_LT;
  const canSave = Boolean(form.patientId && form.time && freeSlots.includes(form.time));

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
            {!openForm ? (
              <button type="button" className="btn sm" onClick={openCreate}>
                {copy.create}
              </button>
            ) : null}
          </div>

          {openForm ? (
            <div className="doctor-cal-form stack" style={{ gap: 12 }}>
              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.patient}</span>
                {selectedPatient ? (
                  <div className="doctor-cal-patient-picked">
                    <div>
                      <b>
                        {locale === "en"
                          ? selectedPatient.nameEn
                          : selectedPatient.nameLt}
                      </b>
                      <span className="xs muted">
                        {selectedPatient.phone}
                        {selectedPatient.email
                          ? ` · ${selectedPatient.email}`
                          : ""}
                        {selectedPatient.dob
                          ? ` · ${selectedPatient.dob}`
                          : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => {
                        setForm((f) => ({ ...f, patientId: "" }));
                        setPatientQuery("");
                      }}
                    >
                      {copy.clearPatient}
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="search"
                      value={patientQuery}
                      placeholder={copy.patientSearch}
                      autoComplete="off"
                      onChange={(e) => setPatientQuery(e.target.value)}
                    />
                    <span className="xs muted">{copy.patientHint}</span>
                    {patientQuery.trim().length >= 2 ? (
                      patientHits.length ? (
                        <ul className="doctor-cal-patient-hits">
                          {patientHits.map((p) => (
                            <li key={p.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setForm((f) => ({ ...f, patientId: p.id }));
                                  setPatientQuery("");
                                }}
                              >
                                <b>
                                  {locale === "en" ? p.nameEn : p.nameLt}
                                </b>
                                <span className="xs muted">
                                  {p.phone}
                                  {p.email ? ` · ${p.email}` : ""}
                                  {p.nationalId
                                    ? ` · ${p.nationalId}`
                                    : ""}
                                  {p.dob ? ` · ${p.dob}` : ""}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="empty">{copy.noPatients}</div>
                      )
                    ) : null}
                  </>
                )}
              </label>

              <div className="stack" style={{ gap: 6 }}>
                <span className="eyebrow">{copy.freeTimes}</span>
                {freeSlots.length ? (
                  <div className="doctor-cal-slots" role="listbox" aria-label={copy.time}>
                    {freeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="option"
                        aria-selected={form.time === t}
                        className={
                          form.time === t
                            ? "doctor-cal-slot on"
                            : "doctor-cal-slot"
                        }
                        onClick={() => setForm((f) => ({ ...f, time: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="empty">{copy.noSlots}</div>
                )}
              </div>

              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.mode}</span>
                <div className="doctor-cal-modes" role="group">
                  {(
                    [
                      ["phone", modeLabel("phone", locale)],
                      ["video", modeLabel("video", locale)],
                      ["in_person", modeLabel("in_person", locale)],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        form.mode === value
                          ? "doctor-cal-mode on"
                          : "doctor-cal-mode"
                      }
                      onClick={() =>
                        setForm((f) => ({ ...f, mode: value }))
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>

              {form.mode === "video" ? (
                <div className="stack" style={{ gap: 6 }}>
                  <span className="eyebrow">{copy.videoLinks}</span>
                  <div className="doctor-cal-video-links">
                    {VIDEO_LINK_OPTIONS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={
                          form.videoPlatform === v.id
                            ? "doctor-cal-video on"
                            : "doctor-cal-video"
                        }
                        onClick={() =>
                          setForm((f) => ({ ...f, videoPlatform: v.id }))
                        }
                      >
                        <b>{v.label}</b>
                        <span className="xs muted mono">{v.url}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

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
                <button
                  type="button"
                  className="btn"
                  disabled={!canSave}
                  onClick={saveVisit}
                >
                  {copy.save}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setOpenForm(false);
                    setPatientQuery("");
                  }}
                >
                  {copy.cancel}
                </button>
              </div>
            </div>
          ) : (
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
                      {a.mode === "video" && a.videoUrl ? (
                        <a
                          href={a.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="xs"
                          style={{ color: "var(--accent)" }}
                        >
                          {a.videoPlatform === "meet"
                            ? "Google Meet"
                            : a.videoPlatform === "zoom"
                              ? "Zoom"
                              : a.videoPlatform === "teams"
                                ? "Teams"
                                : a.videoUrl}
                        </a>
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
          )}
        </section>
      </div>
    </div>
  );
}
