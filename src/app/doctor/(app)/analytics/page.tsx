import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { patients, markerResults, snpGenotypes, rareMutations } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { activeDoctorRequests, historicalDoctorRequests } from "@/lib/doctor/doctor-requests";
import { baseDoctorAppointments } from "@/lib/doctor/doctor-calendar";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t, type Locale } from "@/lib/i18n/dictionary";

export default async function DoctorAnalyticsPage() {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  ensureSchema();
  const db = getDb();
  const pts = db.select().from(patients).all();
  const markerN =
    db.select({ c: sql<number>`count(*)` }).from(markerResults).get()?.c || 0;
  const snpN =
    db.select({ c: sql<number>`count(*)` }).from(snpGenotypes).get()?.c || 0;
  const rareN =
    db.select({ c: sql<number>`count(*)` }).from(rareMutations).get()?.c || 0;
  const appts = baseDoctorAppointments(locale);
  const activeReq = activeDoctorRequests().length;
  const histReq = historicalDoctorRequests().length;

  const areaHeat: Record<string, number> = {};
  for (const p of pts) {
    const twin = loadDigitalTwin(p.id, locale);
    for (const c of twin?.categories || []) {
      if (c.colour === "red" || c.colour === "orange") {
        areaHeat[c.id] = (areaHeat[c.id] || 0) + 1;
      }
    }
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "Clinic metrics · demo" : "Klinikos rodikliai · demo"}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {locale === "en" ? "Analytics" : "Analitika"}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-[var(--muted)]">
            {locale === "en"
              ? "Aggregates from the same patients, visits and requests used in the patient portal."
              : "Agregatai iš tų pačių pacientų, vizitų ir užklausų kaip paciento savitarnoje."}
          </p>
        </div>
      </div>

      <div className="grid g4 doctor-kpi-grid">
        <div className="card kpi">
          <b className="num">{pts.length}</b>
          <span>{locale === "en" ? "Patients" : "Pacientai"}</span>
        </div>
        <div className="card kpi">
          <b className="num">{appts.length}</b>
          <span>{locale === "en" ? "Appointments" : "Vizitai"}</span>
        </div>
        <div className="card kpi">
          <b className="num">{activeReq}</b>
          <span>{locale === "en" ? "Open requests" : "Atviros užklausos"}</span>
        </div>
        <div className="card kpi">
          <b className="num">{histReq}</b>
          <span>{locale === "en" ? "Closed requests" : "Uždarytos užklausos"}</span>
        </div>
      </div>

      <div className="grid g3 doctor-kpi-grid">
        <div className="card kpi">
          <b className="num">{markerN}</b>
          <span>{locale === "en" ? "Lab results" : "Tyrimų rezultatai"}</span>
        </div>
        <div className="card kpi">
          <b className="num">{snpN}</b>
          <span>SNP</span>
        </div>
        <div className="card kpi">
          <b className="num">{rareN}</b>
          <span>NGS</span>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h3 className="m-0">
            {locale === "en"
              ? "Areas with attention signals"
              : "Sritys su dėmesio signalais"}
          </h3>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {Object.entries(areaHeat)
            .sort((a, b) => b[1] - a[1])
            .map(([id, n]) => (
              <div key={id} className="doctor-appt-row">
                <div className="doctor-appt-main">
                  <b>{labels.categoryNames[id] || id}</b>
                </div>
                <span className="pill c-orange">{n}</span>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
