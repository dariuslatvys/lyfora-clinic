import Link from "next/link";
import {
  appointmentsForDay,
  baseDoctorAppointments,
  modeLabel,
  statusLabel,
} from "@/lib/doctor/doctor-calendar";
import {
  activeDoctorRequests,
  requestStatusLabel,
} from "@/lib/doctor/doctor-requests";
import { todayIsoDate } from "@/lib/health/demo-visits";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";

export function DoctorWorkday({ locale }: { locale: Locale }) {
  const labels = t(locale);
  const today = todayIsoDate();
  const todays = appointmentsForDay(baseDoctorAppointments(locale), today);
  const waiting = activeDoctorRequests();
  const male = loadDigitalTwin("patient_male", locale);
  const female = loadDigitalTwin("patient_female", locale);
  const critical = [male, female]
    .filter(Boolean)
    .flatMap((twin) =>
      (twin?.categories || [])
        .filter((c) => c.colour === "red" || c.colour === "orange")
        .map((c) => ({
          patientId: twin!.patient.id,
          name: patientDisplayName(twin!.patient.sex, locale),
          cat: labels.categoryNames[c.id] || c.id,
          colour: c.colour,
          summary: c.summary,
        }))
    )
    .slice(0, 6);

  const copy =
    locale === "en"
      ? {
          eyebrow: "Workspace",
          title: "Workday",
          blurb: "Today’s schedule, open requests and clinical signals from the same demo data as the patient portal.",
          kVisits: "Visits today",
          kRequests: "Awaiting reply",
          kSignals: "Attention signals",
          kLabs: "Recent lab markers",
          agenda: "Today’s agenda",
          signals: "Clinical signals",
          inbox: "Open requests",
          openCal: "Calendar",
          openReq: "All requests",
          emptyAgenda: "No visits scheduled today.",
        }
      : {
          eyebrow: "Darbo vieta",
          title: "Darbo diena",
          blurb:
            "Šiandienos darbotvarkė, atviros užklausos ir klinikiniai signalai — tie patys demo duomenys kaip paciento savitarnoje.",
          kVisits: "Vizitai šiandien",
          kRequests: "Laukia atsakymo",
          kSignals: "Dėmesio signalai",
          kLabs: "Žymenų įrašai",
          agenda: "Šiandienos darbotvarkė",
          signals: "Klinikiniai signalai",
          inbox: "Atviros užklausos",
          openCal: "Kalendorius",
          openReq: "Visos užklausos",
          emptyAgenda: "Šiandien vizitų nėra.",
        };

  const labCount =
    (male?.markers.length || 0) + (female?.markers.length || 0);

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
          <Link href="/doctor/calendar" className="btn ghost sm">
            {copy.openCal}
          </Link>
          <Link href="/doctor/requests" className="btn sm">
            {copy.openReq}
          </Link>
        </div>
      </div>

      <div className="grid g4 doctor-kpi-grid">
        <div className="card kpi">
          <b className="num">{todays.length}</b>
          <span>{copy.kVisits}</span>
        </div>
        <div className="card kpi">
          <b className="num">{waiting.length}</b>
          <span>{copy.kRequests}</span>
        </div>
        <div className="card kpi">
          <b className="num">{critical.length}</b>
          <span>{copy.kSignals}</span>
        </div>
        <div className="card kpi">
          <b className="num">{labCount}</b>
          <span>{copy.kLabs}</span>
        </div>
      </div>

      <div className="doctor-home-split">
        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.agenda}</h3>
            <Link href="/doctor/calendar" className="btn ghost sm">
              {copy.openCal}
            </Link>
          </div>
          {todays.length ? (
            <div className="stack" style={{ gap: 8 }}>
              {todays.map((a) => (
                <div key={a.id} className="doctor-appt-row">
                  <div className="doctor-appt-time">
                    <b>{a.time}</b>
                    <span>{modeLabel(a.mode, locale)}</span>
                  </div>
                  <div className="doctor-appt-main">
                    <b>{locale === "en" ? a.titleEn : a.titleLt}</b>
                    <span className="small muted">
                      {locale === "en" ? a.patientNameEn : a.patientNameLt}
                    </span>
                  </div>
                  <span className="pill c-acc">
                    {statusLabel(a.status, locale)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">{copy.emptyAgenda}</div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.inbox}</h3>
            <Link href="/doctor/requests" className="btn ghost sm">
              {copy.openReq}
            </Link>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {waiting.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href={`/doctor/requests?id=${encodeURIComponent(r.id)}`}
                className="doctor-req-li"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="doctor-req-li-main">
                  <b>{locale === "en" ? r.subjectEn : r.subjectLt}</b>
                  <span className="xs muted">
                    {locale === "en" ? r.patientNameEn : r.patientNameLt}
                  </span>
                </div>
                <span
                  className={`pill ${
                    r.status === "waiting" ? "c-yellow" : "c-acc"
                  }`}
                >
                  {requestStatusLabel(r.status, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h3 className="m-0">{copy.signals}</h3>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {critical.map((s, i) => (
            <Link
              key={`${s.patientId}-${s.cat}-${i}`}
              href={`/doctor/patients/${s.patientId}`}
              className="doctor-signal-row"
            >
              <span
                className={`pill ${
                  s.colour === "red" ? "c-red" : "c-orange"
                }`}
              >
                {labels.colourLabels[s.colour as "red" | "orange"]}
              </span>
              <div>
                <b>
                  {s.name} · {s.cat}
                </b>
                <p className="small muted m-0 mt-1">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
