import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { markerResults, markerDefs } from "@/lib/db/schema";
import { t } from "@/lib/i18n/dictionary";

export default async function LabsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const labels = t((current.user.locale as "lt" | "en") || "lt");
  ensureSchema();
  const db = getDb();
  const defs = new Map(
    db
      .select()
      .from(markerDefs)
      .all()
      .map((d) => [d.key, d.name])
  );
  const rows = db
    .select()
    .from(markerResults)
    .where(eq(markerResults.patientId, current.patient.id))
    .all()
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));

  return (
    <div className="panel">
      <h2 className="font-[family-name:var(--font-display)] text-3xl">
        {labels.labs}
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[var(--muted)]">
            <tr>
              <th className="py-2">Data</th>
              <th>Žymuo</th>
              <th>Reikšmė</th>
              <th>Norma</th>
              <th>Šaltinis</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--line)]">
                <td className="py-2">{r.observedAt}</td>
                <td>{defs.get(r.markerKey) || r.markerKey}</td>
                <td>
                  {r.value}
                  {r.unit ? ` ${r.unit}` : ""}
                  {r.flag ? ` (${r.flag})` : ""}
                </td>
                <td>
                  {r.refLow ?? "—"} – {r.refHigh ?? "—"}
                </td>
                <td className="text-[var(--muted)]">{r.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
