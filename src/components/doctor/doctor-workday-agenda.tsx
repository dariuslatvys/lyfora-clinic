"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DOCTOR_APPT_EVENT,
  appointmentsForDay,
  baseDoctorAppointments,
  listAppointmentDocuments,
  mergeAppointments,
  modeLabel,
  readCreatedAppointments,
  statusLabel,
  type DoctorAppointment,
  type DoctorPatientOption,
} from "@/lib/doctor/doctor-calendar";
import { todayIsoDate } from "@/lib/health/demo-visits";
import { DoctorAppointmentDetail } from "@/components/doctor/doctor-appointment-detail";
import { DoctorNewVisitForm } from "@/components/doctor/doctor-new-visit-form";
import { doctorVisitCopy } from "@/components/doctor/doctor-visit-copy";

export function DoctorWorkdayAgenda({
  locale,
  patients,
  title,
  openCal,
  emptyAgenda,
}: {
  locale: "lt" | "en";
  patients: DoctorPatientOption[];
  title: string;
  openCal: string;
  emptyAgenda: string;
}) {
  const today = todayIsoDate();
  const visitCopy = useMemo(() => doctorVisitCopy(locale), [locale]);
  const [created, setCreated] = useState<DoctorAppointment[]>([]);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

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
  const todays = useMemo(
    () => appointmentsForDay(all, today),
    [all, today]
  );
  const selectedAppt =
    todays.find((a) => a.id === selectedApptId) ||
    all.find((a) => a.id === selectedApptId) ||
    null;

  function openCreate() {
    setSelectedApptId(null);
    setOpenForm(true);
  }

  return (
    <section className="card">
      <div className="card-head">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <h3 className="m-0">{title}</h3>
          {!openForm && !selectedAppt ? (
            <button
              type="button"
              className="doctor-agenda-add"
              aria-label={visitCopy.create}
              title={visitCopy.create}
              onClick={openCreate}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        <Link href="/doctor/calendar" className="btn ghost sm">
          {openCal}
        </Link>
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
          date={today}
          all={all}
          copy={visitCopy}
          onCancel={() => setOpenForm(false)}
          onSaved={() => {
            setCreated(readCreatedAppointments());
            setOpenForm(false);
          }}
        />
      ) : todays.length ? (
        <div className="stack" style={{ gap: 8 }}>
          {todays.map((a) => {
            const docCount = listAppointmentDocuments(a).length;
            return (
              <button
                key={a.id}
                type="button"
                className="doctor-appt-row doctor-appt-row-btn"
                onClick={() => setSelectedApptId(a.id)}
              >
                <div className="doctor-appt-time">
                  <b>{a.time}</b>
                  <span>{modeLabel(a.mode, locale)}</span>
                </div>
                <div className="doctor-appt-main">
                  <b>{locale === "en" ? a.titleEn : a.titleLt}</b>
                  <span className="small muted">
                    {locale === "en" ? a.patientNameEn : a.patientNameLt}
                  </span>
                  {a.source?.kind === "referral" ? (
                    <span className="xs" style={{ color: "var(--accent)" }}>
                      {visitCopy.referral}
                      {docCount > 1 ? ` · ${docCount}` : ""}
                    </span>
                  ) : docCount > 0 ? (
                    <span className="xs muted">
                      {locale === "en"
                        ? `${docCount} document${docCount === 1 ? "" : "s"}`
                        : `${docCount} dok.`}
                    </span>
                  ) : a.source?.kind === "self" &&
                    a.source.self.channel === "phone" ? (
                    <span className="xs muted">{visitCopy.selfPhone}</span>
                  ) : null}
                </div>
                <span className="pill c-acc">
                  {statusLabel(a.status, locale)}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty">{emptyAgenda}</div>
      )}
    </section>
  );
}
