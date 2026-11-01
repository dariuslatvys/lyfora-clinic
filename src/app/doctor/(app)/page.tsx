import { ensureSchema, getDb } from "@/lib/db";
import { patients, markerResults, snpGenotypes, rareMutations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function DoctorHomePage() {
  ensureSchema();
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
    <div className="space-y-4">
      <section className="panel">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">
          Pacientai
        </h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Pirmoji gydytojo darbo vietos versija — pacientų duomenų santrauka.
          Detalesnės klinikinės funkcijos bus kitame etape.
        </p>
      </section>
      <div className="grid gap-3">
        {enriched.map((p) => (
          <article key={p.id} className="panel">
            <h3 className="text-xl font-semibold">{p.fullName}</h3>
            <p className="text-sm text-[var(--muted)]">
              {p.sex} · {p.dob}
              {p.nationalId ? ` · a.k. ${p.nationalId}` : ""}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{p.notes}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="detail-chip">Žymenys: {p.markers ?? 0}</span>
              <span className="detail-chip">SNP genotipai: {p.snps ?? 0}</span>
              <span className="detail-chip">NGS retos: {p.rare ?? 0}</span>
              <span className="detail-chip">
                SNP array: {p.hasSnpArray ? "taip" : "ne"}
              </span>
              <span className="detail-chip">
                NGS VCF: {p.hasNgsVcf ? "taip" : "ne"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
