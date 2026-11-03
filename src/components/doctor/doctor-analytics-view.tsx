"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AnalyticsPayload } from "@/lib/doctor/doctor-analytics-data";

type Panel =
  | "overview"
  | "patients"
  | "attention"
  | "labs"
  | "channels"
  | "diagnoses"
  | "pgx";

type Period = "30d" | "90d" | "6m" | "all";

function ageGroupOf(age: number | null): string {
  if (age == null) return "unknown";
  if (age < 30) return "18-29";
  if (age < 45) return "30-44";
  if (age < 60) return "45-59";
  return "60+";
}

export function DoctorAnalyticsView({
  data,
}: {
  data: AnalyticsPayload;
}) {
  const locale = data.locale;
  const [panel, setPanel] = useState<Panel>("overview");
  const [attentionId, setAttentionId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("6m");
  const [sex, setSex] = useState<"all" | "male" | "female">("all");
  const [ageGroup, setAgeGroup] = useState<string>("all");
  const [labQuery, setLabQuery] = useState("");
  const [labPatientId, setLabPatientId] = useState<string | null>(null);

  const copy =
    locale === "en"
      ? {
          eyebrow: "Clinic metrics · 6 mo.",
          title: "Analytics",
          blurb:
            "Click a block to filter the details below — patients, attention areas and lab results.",
          patients: "Patients",
          visits: "Visits",
          openReq: "Open requests",
          closedReq: "Closed requests",
          labs: "Lab results",
          nps: "Patient NPS",
          reply: "Avg. written reply",
          noShow: "No-shows",
          revenue: "Last month revenue",
          hours: "h",
          channels: "Consultations by channel",
          risk: "Patient group risk",
          diagnoses: "Most common diagnoses in the group",
          pgx: "Clinically relevant pharmacogenetic findings",
          pgxHint: "Patients with at least one risk allele",
          detail: "Filtered detail",
          period: "Period",
          sex: "Sex",
          age: "Age group",
          all: "All",
          served: "Patients served",
          visitsTotal: "Visits in cohort",
          male: "Male",
          female: "Female",
          attention: "Attention areas",
          patientsInArea: "Patients with signal",
          openChart: "Chart",
          searchPatient: "Search patient…",
          pickPatient: "Select a patient to see lab results.",
          noLabs: "No lab results for this patient.",
          critical: "Critical",
          attentionLbl: "Attention",
          watch: "Watch",
          good: "Good",
          genetic: "Low",
          clinic: "In clinic",
          video: "Video",
          written: "Written",
          urgent: "Urgent",
          remoteNote: "Remote consultations (video + written) in the latest month:",
          empty: "Nothing matches these filters.",
          open: "Open",
          withSignal: "with signal",
        }
      : {
          eyebrow: "Klinikos rodikliai · 6 mėn.",
          title: "Analitika",
          blurb:
            "Spauskite bloką — apačioje filtruojasi detalės: pacientai, dėmesio sritys ir tyrimai.",
          patients: "Pacientai",
          visits: "Vizitai",
          openReq: "Atviros užklausos",
          closedReq: "Uždarytos užklausos",
          labs: "Tyrimų rezultatai",
          nps: "Pacientų NPS",
          reply: "Vid. atsakymo laikas raštu",
          noShow: "Neatvykimai",
          revenue: "Paskutinio mėn. pajamos",
          hours: "val.",
          channels: "Konsultacijos pagal kanalą",
          risk: "Pacientų grupės rizika",
          diagnoses: "Dažniausios diagnozės grupėje",
          pgx: "Kliniškai reikšmingi farmakogenetiniai radiniai",
          pgxHint: "Pacientų su bent vienu rizikos aleliu skaičius",
          detail: "Filtruota detalė",
          period: "Laikotarpis",
          sex: "Lytis",
          age: "Amžiaus grupė",
          all: "Visi",
          served: "Aptarnauta pacientų",
          visitsTotal: "Vizitų kohortoje",
          male: "Vyrai",
          female: "Moterys",
          attention: "Sritys su dėmesio signalais",
          patientsInArea: "Pacientai su signalu",
          openChart: "Kortelė",
          searchPatient: "Ieškoti paciento…",
          pickPatient: "Pasirinkite pacientą — pamatysite tyrimus.",
          noLabs: "Šiam pacientui tyrimų nėra.",
          critical: "Kritiška",
          attentionLbl: "Dėmesio",
          watch: "Stebėti",
          good: "Gerai",
          genetic: "Nedidelė",
          clinic: "Klinikoje",
          video: "Video",
          written: "Raštu",
          urgent: "Skubios",
          remoteNote:
            "Nuotolinės konsultacijos (video + raštu) paskutiniame mėnesyje sudarė",
          empty: "Pagal filtrus nieko nerasta.",
          open: "Atidaryti",
          withSignal: "su signalu",
        };

  const lastMonth = data.consultMonths[data.consultMonths.length - 1];
  const remotePct = lastMonth
    ? Math.round(
        ((lastMonth.video + lastMonth.written) /
          Math.max(
            1,
            lastMonth.clinic +
              lastMonth.video +
              lastMonth.written +
              lastMonth.urgent
          )) *
          100
      )
    : 0;

  const filteredPatients = useMemo(() => {
    return data.patients.filter((p) => {
      if (sex !== "all" && p.sex !== sex) return false;
      if (ageGroup !== "all" && ageGroupOf(p.age) !== ageGroup) return false;
      return true;
    });
  }, [data.patients, sex, ageGroup]);

  const attentionArea =
    data.areas.find((a) => a.id === attentionId) || data.areas[0] || null;
  const attentionPatients = attentionArea
    ? data.patients.filter((p) => attentionArea.patientIds.includes(p.id))
    : [];

  const labHits = useMemo(() => {
    const q = labQuery.trim().toLowerCase();
    if (!q) return data.patients;
    return data.patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [data.patients, labQuery]);

  const selectedLabPatient =
    data.patients.find((p) => p.id === labPatientId) || null;

  function openPanel(next: Panel, areaId?: string) {
    setPanel(next);
    if (areaId) setAttentionId(areaId);
    if (typeof document !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById("analytics-detail")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  const maxConsult = Math.max(
    ...data.consultMonths.map(
      (m) => m.clinic + m.video + m.written + m.urgent
    ),
    1
  );
  const maxDx = Math.max(...data.diagnoses.map((d) => d.n), 1);
  const maxPgx = Math.max(...data.pgx.map((g) => g.n), 1);

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

      <div className="grid g4 doctor-kpi-grid">
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "patients" ? "on" : ""}`}
          onClick={() => openPanel("patients")}
        >
          <b className="num">{data.kpis.nps}</b>
          <span>{copy.nps}</span>
        </button>
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "channels" ? "on" : ""}`}
          onClick={() => openPanel("channels")}
        >
          <b className="num">
            {String(data.kpis.avgReplyHours).replace(".", ",")} {copy.hours}
          </b>
          <span>{copy.reply}</span>
        </button>
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "attention" ? "on" : ""}`}
          onClick={() => openPanel("attention")}
        >
          <b className="num">
            {String(data.kpis.noShowPct).replace(".", ",")} %
          </b>
          <span>{copy.noShow}</span>
        </button>
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "labs" ? "on" : ""}`}
          onClick={() => openPanel("labs")}
        >
          <b className="num">
            {String(data.kpis.revenueKe).replace(".", ",")} k€
          </b>
          <span>{copy.revenue}</span>
        </button>
      </div>

      <div className="grid g4 doctor-kpi-grid">
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "patients" ? "on" : ""}`}
          onClick={() => openPanel("patients")}
        >
          <b className="num">{data.kpis.patients}</b>
          <span>{copy.patients}</span>
        </button>
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "channels" ? "on" : ""}`}
          onClick={() => openPanel("channels")}
        >
          <b className="num">{data.kpis.appointments}</b>
          <span>{copy.visits}</span>
        </button>
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "attention" ? "on" : ""}`}
          onClick={() => openPanel("attention")}
        >
          <b className="num">{data.kpis.activeRequests}</b>
          <span>{copy.openReq}</span>
        </button>
        <button
          type="button"
          className={`card kpi doctor-kpi-btn ${panel === "labs" ? "on" : ""}`}
          onClick={() => openPanel("labs")}
        >
          <b className="num">{data.kpis.labResults}</b>
          <span>{copy.labs}</span>
        </button>
      </div>

      <div className="doctor-analytics-split">
        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.channels}</h3>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => openPanel("channels")}
            >
              {copy.open}
            </button>
          </div>
          <div className="doctor-analytics-bars">
            {data.consultMonths.map((m) => {
              const total = m.clinic + m.video + m.written + m.urgent;
              return (
                <button
                  key={m.key}
                  type="button"
                  className="doctor-analytics-col"
                  title={`${m.label}: ${total}`}
                  onClick={() => openPanel("channels")}
                >
                  <div
                    className="doctor-analytics-stack"
                    style={{
                      height: `${Math.max(8, (total / maxConsult) * 160)}px`,
                    }}
                  >
                    <i className="seg clinic" style={{ flex: m.clinic || 0.001 }} />
                    <i className="seg video" style={{ flex: m.video || 0.001 }} />
                    <i
                      className="seg written"
                      style={{ flex: m.written || 0.001 }}
                    />
                    <i
                      className="seg urgent"
                      style={{ flex: m.urgent || 0.001 }}
                    />
                  </div>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
          <div className="doctor-analytics-legend mt-3">
            <span>
              <i className="dot clinic" /> {copy.clinic}
            </span>
            <span>
              <i className="dot video" /> {copy.video}
            </span>
            <span>
              <i className="dot written" /> {copy.written}
            </span>
            <span>
              <i className="dot urgent" /> {copy.urgent}
            </span>
          </div>
          <p className="small muted m-0 mt-3">
            {copy.remoteNote} <b>{remotePct}%</b>
            {locale === "lt" ? " visų kontaktų." : ""}
          </p>
        </section>

        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.risk}</h3>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {data.areas.map((a) => {
              const total = Math.max(
                1,
                a.counts.red +
                  a.counts.orange +
                  a.counts.yellow +
                  a.counts.green +
                  a.counts.badge
              );
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`doctor-risk-row ${
                    attentionId === a.id && panel === "attention" ? "on" : ""
                  }`}
                  onClick={() => openPanel("attention", a.id)}
                >
                  <div className="doctor-risk-label">
                    <b>{a.title}</b>
                    <span className="xs muted">
                      {a.patientIds.length} {copy.withSignal}
                    </span>
                  </div>
                  <div className="doctor-risk-bar">
                    <i
                      className="red"
                      style={{ width: `${(a.counts.red / total) * 100}%` }}
                    />
                    <i
                      className="orange"
                      style={{ width: `${(a.counts.orange / total) * 100}%` }}
                    />
                    <i
                      className="yellow"
                      style={{ width: `${(a.counts.yellow / total) * 100}%` }}
                    />
                    <i
                      className="badge"
                      style={{ width: `${(a.counts.badge / total) * 100}%` }}
                    />
                    <i
                      className="green"
                      style={{ width: `${(a.counts.green / total) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="doctor-analytics-legend mt-3">
            <span>
              <i className="dot urgent" /> {copy.critical}
            </span>
            <span>
              <i className="dot orange" /> {copy.attentionLbl}
            </span>
            <span>
              <i className="dot written" /> {copy.watch}
            </span>
            <span>
              <i className="dot video" /> {copy.genetic}
            </span>
            <span>
              <i className="dot clinic" /> {copy.good}
            </span>
          </div>
        </section>
      </div>

      <div className="doctor-analytics-split">
        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.diagnoses}</h3>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => openPanel("diagnoses")}
            >
              {copy.open}
            </button>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {data.diagnoses.map((d) => (
              <button
                key={d.code}
                type="button"
                className="doctor-hbar-row"
                onClick={() => openPanel("diagnoses")}
              >
                <span className="grow">
                  <code className="mono">{d.code}</code>{" "}
                  {locale === "en" ? d.nameEn : d.nameLt}
                </span>
                <b>{d.n}</b>
                <i style={{ width: `${(d.n / maxDx) * 100}%` }} />
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.pgx}</h3>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => openPanel("pgx")}
            >
              {copy.open}
            </button>
          </div>
          <p className="small muted mt-0 mb-3">{copy.pgxHint}</p>
          <div className="stack" style={{ gap: 8 }}>
            {data.pgx.map((g) => (
              <button
                key={g.gene}
                type="button"
                className="doctor-hbar-row pgx"
                onClick={() => openPanel("pgx")}
              >
                <span className="grow">
                  <b>{g.gene}</b>
                </span>
                <b>{g.n}</b>
                <i style={{ width: `${(g.n / maxPgx) * 100}%` }} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card" id="analytics-detail">
        <div className="card-head">
          <h3 className="m-0">
            {copy.detail}
            {panel === "attention" && attentionArea
              ? ` · ${attentionArea.title}`
              : ""}
            {panel === "labs" ? ` · ${copy.labs}` : ""}
            {panel === "patients" ? ` · ${copy.patients}` : ""}
          </h3>
        </div>

        {panel === "overview" || panel === "channels" ? (
          <div className="stack" style={{ gap: 10 }}>
            <p className="small muted m-0">
              {locale === "en"
                ? "Visit mode mix from the current demo calendar."
                : "Vizito būdų pasiskirstymas iš dabartinio demo kalendoriaus."}
            </p>
            <div className="doctor-patient-stats">
              {data.modeMix.map((m) => (
                <div key={m.mode} className="doctor-patient-stat">
                  <b>{m.n}</b>
                  <span>{m.label}</span>
                </div>
              ))}
              <div className="doctor-patient-stat">
                <b>{data.kpis.closedRequests}</b>
                <span>{copy.closedReq}</span>
              </div>
            </div>
          </div>
        ) : null}

        {panel === "patients" ? (
          <div className="stack" style={{ gap: 14 }}>
            <div className="doctor-analytics-filters">
              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.period}</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                >
                  <option value="30d">
                    {locale === "en" ? "30 days" : "30 d."}
                  </option>
                  <option value="90d">
                    {locale === "en" ? "90 days" : "90 d."}
                  </option>
                  <option value="6m">
                    {locale === "en" ? "6 months" : "6 mėn."}
                  </option>
                  <option value="all">{copy.all}</option>
                </select>
              </label>
              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.sex}</span>
                <select
                  value={sex}
                  onChange={(e) =>
                    setSex(e.target.value as "all" | "male" | "female")
                  }
                >
                  <option value="all">{copy.all}</option>
                  <option value="male">{copy.male}</option>
                  <option value="female">{copy.female}</option>
                </select>
              </label>
              <label className="stack" style={{ gap: 4 }}>
                <span className="eyebrow">{copy.age}</span>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                >
                  <option value="all">{copy.all}</option>
                  <option value="18-29">18–29</option>
                  <option value="30-44">30–44</option>
                  <option value="45-59">45–59</option>
                  <option value="60+">60+</option>
                </select>
              </label>
            </div>

            <div className="doctor-patient-stats">
              <div className="doctor-patient-stat">
                <b>{filteredPatients.length}</b>
                <span>{copy.served}</span>
              </div>
              <div className="doctor-patient-stat">
                <b>
                  {filteredPatients.reduce((n, p) => n + p.visitCount, 0)}
                </b>
                <span>{copy.visitsTotal}</span>
              </div>
              <div className="doctor-patient-stat">
                <b>
                  {filteredPatients.filter((p) => p.sex === "male").length}
                </b>
                <span>{copy.male}</span>
              </div>
              <div className="doctor-patient-stat">
                <b>
                  {filteredPatients.filter((p) => p.sex === "female").length}
                </b>
                <span>{copy.female}</span>
              </div>
            </div>
            <p className="xs muted m-0">
              {locale === "en"
                ? `Period filter (${period}) is demo-scoped to the current cohort.`
                : `Laikotarpio filtras (${period}) demo režime taikomas dabartinei kohortai.`}
            </p>

            {filteredPatients.length ? (
              <div className="stack" style={{ gap: 8 }}>
                {filteredPatients.map((p) => (
                  <div key={p.id} className="doctor-appt-row">
                    <div className="doctor-appt-main">
                      <b>{p.name}</b>
                      <span className="small muted">
                        {p.sexLabel} · {p.birthYear}
                        {p.age != null ? ` · ${p.age} m.` : ""} · {p.visitCount}{" "}
                        {locale === "en" ? "visits" : "vizit."}
                      </span>
                    </div>
                    <Link
                      href={`/doctor/patients/${p.id}`}
                      className="btn ghost sm"
                    >
                      {copy.openChart}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">{copy.empty}</div>
            )}
          </div>
        ) : null}

        {panel === "attention" ? (
          <div className="stack" style={{ gap: 12 }}>
            <div className="doctor-cal-modes" role="group">
              {data.areas.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={
                    attentionArea?.id === a.id
                      ? "doctor-cal-mode on"
                      : "doctor-cal-mode"
                  }
                  onClick={() => setAttentionId(a.id)}
                >
                  {a.title}
                  <span className="xs muted" style={{ display: "block" }}>
                    {a.patientIds.length}
                  </span>
                </button>
              ))}
            </div>
            <p className="small muted m-0">{copy.patientsInArea}</p>
            {attentionPatients.length ? (
              <div className="stack" style={{ gap: 8 }}>
                {attentionPatients.map((p) => {
                  const hit = p.categories.find(
                    (c) => c.id === attentionArea?.id
                  );
                  return (
                    <div
                      key={p.id}
                      className="doctor-appt-source-card stack"
                      style={{ gap: 6 }}
                    >
                      <div className="row between">
                        <div>
                          <b>{p.name}</b>
                          <p className="small muted m-0 mt-1">
                            {p.sexLabel} · {p.birthYear}
                          </p>
                        </div>
                        <Link
                          href={`/doctor/patients/${p.id}`}
                          className="btn ghost sm"
                        >
                          {copy.openChart}
                        </Link>
                      </div>
                      {hit ? (
                        <>
                          <span
                            className={`pill ${
                              hit.colour === "red" ? "c-red" : "c-orange"
                            }`}
                          >
                            {hit.colourLabel}
                          </span>
                          <p className="small m-0">{hit.summary}</p>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">{copy.empty}</div>
            )}
          </div>
        ) : null}

        {panel === "labs" ? (
          <div className="stack" style={{ gap: 12 }}>
            <input
              type="search"
              className="doctor-patients-search"
              value={labQuery}
              placeholder={copy.searchPatient}
              onChange={(e) => {
                setLabQuery(e.target.value);
                setLabPatientId(null);
              }}
            />
            <div className="stack" style={{ gap: 6 }}>
              {labHits.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`doctor-appt-row doctor-appt-row-btn ${
                    labPatientId === p.id ? "on" : ""
                  }`}
                  onClick={() => setLabPatientId(p.id)}
                >
                  <div className="doctor-appt-main">
                    <b>{p.name}</b>
                    <span className="small muted">
                      {p.labs.length}{" "}
                      {locale === "en" ? "results" : "rezultatų"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {!selectedLabPatient ? (
              <div className="empty">{copy.pickPatient}</div>
            ) : selectedLabPatient.labs.length ? (
              <div className="overflow-x-auto">
                <table className="labs-table">
                  <thead>
                    <tr>
                      <th>{locale === "en" ? "Marker" : "Rodiklis"}</th>
                      <th>{locale === "en" ? "Value" : "Rezultatas"}</th>
                      <th>{locale === "en" ? "Date" : "Data"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLabPatient.labs.map((l, i) => (
                      <tr key={`${l.key}-${l.observedAt}-${i}`}>
                        <td>{l.name}</td>
                        <td className="num">
                          {l.value}
                          {l.unit ? ` ${l.unit}` : ""}
                        </td>
                        <td className="num">{l.observedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty">{copy.noLabs}</div>
            )}
          </div>
        ) : null}

        {panel === "diagnoses" ? (
          <div className="stack" style={{ gap: 8 }}>
            {data.diagnoses.map((d) => (
              <div key={d.code} className="doctor-appt-row">
                <div className="doctor-appt-main">
                  <b>
                    <code className="mono">{d.code}</code>{" "}
                    {locale === "en" ? d.nameEn : d.nameLt}
                  </b>
                </div>
                <span className="pill c-acc">{d.n}</span>
              </div>
            ))}
          </div>
        ) : null}

        {panel === "pgx" ? (
          <div className="stack" style={{ gap: 8 }}>
            {data.pgx.map((g) => (
              <div key={g.gene} className="doctor-appt-row">
                <div className="doctor-appt-main">
                  <b>{g.gene}</b>
                  <span className="small muted">{copy.pgxHint}</span>
                </div>
                <span className="pill c-acc">{g.n}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
