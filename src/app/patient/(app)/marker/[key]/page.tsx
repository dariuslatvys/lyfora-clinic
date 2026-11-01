import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { markerDefs, markerResults } from "@/lib/db/schema";
import { t } from "@/lib/i18n/dictionary";
import { markerItemColour } from "@/lib/health/marker-colour";
import { COLOUR_HEX, PILL_CLASS } from "@/lib/health/colours";
import { MarkerChart } from "@/components/patient/marker-chart";
import { AskAiButton } from "@/components/patient/ask-ai-button";
import { NormBar } from "@/components/patient/norm-bar";
import {
  HEALTH_CATEGORIES,
  type HealthCategoryId,
} from "@/lib/health/categories";

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

export default async function MarkerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { key } = await params;
  const sp = await searchParams;
  const markerKey = decodeURIComponent(key);
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  ensureSchema();
  const db = getDb();
  const def = db
    .select()
    .from(markerDefs)
    .where(eq(markerDefs.key, markerKey))
    .all()[0];

  const history = db
    .select()
    .from(markerResults)
    .where(
      and(
        eq(markerResults.patientId, current.patient.id),
        eq(markerResults.markerKey, markerKey)
      )
    )
    .all()
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));

  if (!history.length && !def) notFound();

  const latest = history[history.length - 1] || null;
  const name = def?.name || markerKey;
  const colour = latest
    ? markerItemColour({
        value: latest.value,
        refLow: latest.refLow,
        refHigh: latest.refHigh,
        flag: latest.flag,
      })
    : ("grey" as const);

  const catId =
    (sp.cat as HealthCategoryId | undefined) ||
    (def ? guessCategory(def.categoriesJson) : null);

  const description =
    (locale === "lt" ? def?.descriptionLt : def?.descriptionEn) ||
    (locale === "en"
      ? "Laboratory marker from your uploaded results. Compare the value with the reference range and trend over time."
      : "Laboratorinis rodiklis iš jūsų įkeltų tyrimų. Palyginkite reikšmę su norma ir pokyčiu laike.");

  const ask =
    locale === "en"
      ? `Explain my marker ${name} (${latest ? `${latest.value}${latest.unit ? " " + latest.unit : ""}` : "no value"}) in plain language using my data`
      : `Paaiškink mano žymenį ${name} (${latest ? `${latest.value}${latest.unit ? " " + latest.unit : ""}` : "nėra reikšmės"}) paprasta kalba pagal mano duomenis`;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Link
        href={catId ? `/patient/digital-twin/${catId}` : "/patient/labs"}
        className="text-sm text-[var(--muted)]"
      >
        ← {labels.back}
      </Link>

      <section
        className="panel"
        style={{
          borderColor: COLOUR_HEX[colour],
          background: `linear-gradient(160deg, color-mix(in srgb, ${COLOUR_HEX[colour]} 14%, white), white)`,
        }}
      >
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">{labels.markers}</span>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em]">
              {name}
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">{markerKey}</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className={`pill ${PILL_CLASS[colour]}`}>
              {labels.colourLabels[colour]}
            </span>
            <AskAiButton label={labels.askAi} question={ask} />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {locale === "en" ? "Your values" : "Jūsų reikšmės"}
          </h2>
        </div>
        {latest ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="eyebrow">{labels.value}</p>
              <p className="mt-1 text-2xl font-semibold">
                {latest.value}
                {latest.unit ? (
                  <span className="ml-1 text-base font-medium text-[var(--muted)]">
                    {latest.unit}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {latest.observedAt}
              </p>
            </div>
            <div>
              <p className="eyebrow">{labels.reference}</p>
              <p className="mt-1 text-lg font-medium">
                {latest.refLow != null || latest.refHigh != null
                  ? `${latest.refLow ?? "—"} – ${latest.refHigh ?? "—"}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">{labels.labsPosition}</p>
              <NormBar
                value={latest.value}
                refLow={latest.refLow}
                refHigh={latest.refHigh}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">{labels.noData}</p>
        )}
      </section>

      <section className="card">
        <p className="eyebrow">{labels.plainLanguage}</p>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-[var(--ink)]">
          {description}
        </p>
        <p className="disclaim mt-3">
          {locale === "en"
            ? "This is educational context for your lab marker — not a diagnosis. Discuss treatment only with your clinician."
            : "Tai edukacinis žymens paaiškinimas — ne diagnozė. Gydymą aptarkite tik su gydytoju."}
        </p>
      </section>

      <section className="card">
        <p className="eyebrow mb-2">{labels.trend}</p>
        <MarkerChart
          points={history.map((h) => ({
            date: h.observedAt,
            value: h.value,
          }))}
          refLow={latest?.refLow}
          refHigh={latest?.refHigh}
          unit={latest?.unit}
        />
        {history.length > 1 && (
          <div className="mt-4 overflow-x-auto">
            <table className="labs-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>{labels.labsResult}</th>
                  <th>{labels.labsStatus}</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((h) => {
                  const c = markerItemColour({
                    value: h.value,
                    refLow: h.refLow,
                    refHigh: h.refHigh,
                    flag: h.flag,
                  });
                  return (
                    <tr key={h.id}>
                      <td>{h.observedAt}</td>
                      <td className="labs-val">
                        {h.value}
                        {h.unit ? ` ${h.unit}` : ""}
                      </td>
                      <td>
                        <span className={`pill ${PILL_CLASS[c]}`}>
                          {labels.colourLabels[c]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
