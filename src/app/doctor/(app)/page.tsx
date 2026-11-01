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
import type { Locale } from "@/lib/i18n/dictionary";

export default async function DoctorHomePage() {
  ensureSchema();
  const current = await getCurrentUser();
  const locale = ((current?.user.locale as Locale) || "lt") as Locale;
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
    return { ...p, markers, snps, rare };
  });

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">{locale === "en" ? "Workspace" : "Darbo vieta"}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em]">
            {locale === "en" ? "Patients" : "Pacientai"}
          </h1>
          <p>
            {locale === "en"
              ? "First clinician workspace slice — anonymised demo patients."
              : "Pirmoji gydytojo darbo vietos versija — anonimizuotų demo pacientų santrauka."}
          </p>
        </div>
      </div>
      <div className="stack">
        {enriched.map((p) => (
          <article key={p.id} className="card">
            <div className="card-head">
              <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-semibold">
                {patientDisplayName(p.sex, locale)}
              </h3>
              <span className="pill c-green plain">
                {p.sex === "male"
                  ? locale === "en"
                    ? "Male"
                    : "Vyras"
                  : locale === "en"
                    ? "Female"
                    : "Moteris"}
              </span>
            </div>
            <p className="small muted">{p.dob}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{p.notes}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="detail-chip">Žymenys: {p.markers ?? 0}</span>
              <span className="detail-chip">SNP: {p.snps ?? 0}</span>
              <span className="detail-chip">NGS: {p.rare ?? 0}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
