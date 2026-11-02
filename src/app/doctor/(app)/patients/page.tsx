import Link from "next/link";
import { ensureSchema, getDb } from "@/lib/db";
import {
  patients,
  markerResults,
  snpGenotypes,
  rareMutations,
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t, type Locale } from "@/lib/i18n/dictionary";

export default async function DoctorPatientsPage() {
  ensureSchema();
  const current = await getCurrentUser();
  const locale = ((current?.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  const db = getDb();
  const list = db.select().from(patients).all();

  const enriched = list.map((p) => {
    const markers = db
      .select({ c: sql<number>`count(*)` })
      .from(markerResults)
      .where(eq(markerResults.patientId, p.id))
      .get()?.c;
    const snps = db
      .select({ c: sql<number>`count(*)` })
      .from(snpGenotypes)
      .where(eq(snpGenotypes.patientId, p.id))
      .get()?.c;
    const rare = db
      .select({ c: sql<number>`count(*)` })
      .from(rareMutations)
      .where(eq(rareMutations.patientId, p.id))
      .get()?.c;
    const twin = loadDigitalTwin(p.id, locale);
    const hot =
      twin?.categories
        .filter((c) => c.colour === "red" || c.colour === "orange")
        .map((c) => labels.categoryNames[c.id] || c.id) || [];
    return { ...p, markers, snps, rare, hot, twin };
  });

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "Clinic panel" : "Klinikos panelė"}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {locale === "en" ? "Patients" : "Pacientai"}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-[var(--muted)]">
            {locale === "en"
              ? "Same anonymised demo patients as the patient portal — labs, DNA and NGS already linked."
              : "Tie patys anonimizuoti demo pacientai kaip savitarnoje — tyrimai, DNR ir NGS jau susieti."}
          </p>
        </div>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {enriched.map((p) => (
          <article key={p.id} className="card">
            <div className="card-head">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold m-0">
                  {patientDisplayName(p.sex, locale)}
                </h3>
                <p className="small muted m-0 mt-1">
                  {p.dob || "—"} ·{" "}
                  {p.sex === "male"
                    ? locale === "en"
                      ? "Male"
                      : "Vyras"
                    : locale === "en"
                      ? "Female"
                      : "Moteris"}
                </p>
              </div>
              <Link href={`/doctor/patients/${p.id}`} className="btn sm">
                {locale === "en" ? "Patient chart" : "Paciento kortelė"}
              </Link>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-soft)] mb-0">
              {p.notes}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="detail-chip">
                {locale === "en" ? "Markers" : "Žymenys"}: {p.markers ?? 0}
              </span>
              <span className="detail-chip">SNP: {p.snps ?? 0}</span>
              <span className="detail-chip">NGS: {p.rare ?? 0}</span>
            </div>
            {p.hot.length ? (
              <div className="hc-link-row mt-3" style={{ gap: 6 }}>
                {p.hot.map((h) => (
                  <span key={h} className="pill c-orange">
                    {h}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
