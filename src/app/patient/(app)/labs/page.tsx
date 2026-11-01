import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { markerResults, markerDefs } from "@/lib/db/schema";
import { t } from "@/lib/i18n/dictionary";
import { LabsView } from "@/components/patient/labs-view";
import {
  HEALTH_CATEGORIES,
  type HealthCategoryId,
} from "@/lib/health/categories";
import { markerAllowedForSex } from "@/lib/health/marker-sex";

function guessCategory(categoriesJson: string): HealthCategoryId | null {
  let cats: string[] = [];
  try {
    cats = JSON.parse(categoriesJson) as string[];
  } catch {
    return null;
  }
  for (const name of cats) {
    const hit = HEALTH_CATEGORIES.find((c) =>
      c.markerCategoryNames.some(
        (n) => n.toLowerCase() === String(name).toLowerCase()
      )
    );
    if (hit) return hit.id;
  }
  return null;
}

export default async function LabsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  ensureSchema();
  const db = getDb();
  const defs = new Map(
    db
      .select()
      .from(markerDefs)
      .all()
      .map((d) => [d.key, d])
  );
  const sex = current.patient.sex as "male" | "female";
  const rows = db
    .select()
    .from(markerResults)
    .where(eq(markerResults.patientId, current.patient.id))
    .all()
    .filter((r) => markerAllowedForSex(r.markerKey, sex))
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt))
    .map((r) => {
      const def = defs.get(r.markerKey);
      return {
        id: r.id,
        markerKey: r.markerKey,
        name: def?.name || r.markerKey,
        value: r.value,
        unit: r.unit,
        refLow: r.refLow,
        refHigh: r.refHigh,
        flag: r.flag,
        observedAt: r.observedAt,
        source: r.source,
        categoryId: def ? guessCategory(def.categoriesJson) : null,
      };
    });

  return <LabsView rows={rows} labels={labels} locale={locale} />;
}
