import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { markerDefs, markerResults } from "@/lib/db/schema";
import { t } from "@/lib/i18n/dictionary";
import { markerItemColour } from "@/lib/health/marker-colour";
import { COLOUR_HEX, COLOUR_SOFT, PILL_CLASS } from "@/lib/health/colours";
import { MarkerChart } from "@/components/patient/marker-chart";
import { AskAiButton } from "@/components/patient/ask-ai-button";
import { NormBar } from "@/components/patient/norm-bar";
import { BookSpecialtySlots } from "@/components/patient/book-specialty-slots";
import {
  HEALTH_CATEGORIES,
  type HealthCategoryId,
} from "@/lib/health/categories";
import { isPhysicalMarkerKey } from "@/lib/health/physical-metrics";
import { importSourceLabel } from "@/lib/health/integrations-demo";
import {
  explainMarkerPlain,
  formatMarkerReading,
  formatMarkerReference,
  physicalBookingSpecialty,
  physicalMarkerName,
} from "@/lib/health/marker-display";
import {
  formatVisitWhen,
  upcomingVisits,
  visitDoctor,
  visitPlace,
  visitTitle,
} from "@/lib/health/demo-visits";

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

function bookingSlotsFor(
  markerKey: string,
  locale: "lt" | "en"
) {
  const kind = physicalBookingSpecialty(markerKey);
  const all = upcomingVisits();
  const filtered = all.filter((v) => {
    const s = `${v.specialtyEn} ${v.specialtyLt}`.toLowerCase();
    if (kind === "cardio") return /cardio|kardiolog/.test(s);
    if (kind === "metabolic") return /metabol|internal|vidaus|endocrin|endokrin/.test(s);
    return true;
  });
  const mapped = (filtered.length ? filtered : all.slice(0, 3)).map((v) => ({
    id: v.id,
    when: formatVisitWhen(v, locale),
    title: visitTitle(v, locale),
    doctor: visitDoctor(v, locale),
    place: visitPlace(v, locale),
    href: `/patient/visits/${v.id}`,
  }));
  return mapped;
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
  const physical = isPhysicalMarkerKey(markerKey);
  const name =
    physicalMarkerName(markerKey, locale) || def?.name || markerKey;
  const colour = latest
    ? markerItemColour({
        value: latest.value,
        refLow: latest.refLow,
        refHigh: latest.refHigh,
        flag: latest.flag,
        unit: latest.unit,
        markerKey,
      })
    : ("grey" as const);

  const reading = latest
    ? formatMarkerReading(latest.value, latest.unit, markerKey)
    : null;

  const catId =
    (sp.cat as HealthCategoryId | undefined) ||
    (def ? guessCategory(def.categoriesJson) : null) ||
    (markerKey === "BLOOD_PRESSURE" ? "cardiovascular" : null);

  const plain = explainMarkerPlain(markerKey, {
    locale,
    flag: latest?.flag,
    colour,
    fallbackLt: def?.descriptionLt,
    fallbackEn: def?.descriptionEn,
  });

  const ask =
    locale === "en"
      ? `Explain my ${physical ? "physical metric" : "marker"} ${name} (${reading || "no value"}) in plain language using my data`
      : `Paaiškink mano ${physical ? "fizinį rodiklį" : "žymenį"} ${name} (${reading || "nėra reikšmės"}) paprasta kalba pagal mano duomenis`;

  const bookKind = physicalBookingSpecialty(markerKey);
  const bookSlots = plain.adviseDoctor ? bookingSlotsFor(markerKey, locale) : [];
  const bookLabel =
    bookKind === "cardio"
      ? locale === "en"
        ? "Book cardiology consultation"
        : "Rezervuoti kardiologo konsultaciją"
      : bookKind === "metabolic"
        ? locale === "en"
          ? "Book metabolic consultation"
          : "Rezervuoti metabolinės sveikatos konsultaciją"
        : locale === "en"
          ? "Book a consultation"
          : "Rezervuoti konsultaciją";
  const specialtyLabel =
    bookKind === "cardio"
      ? locale === "en"
        ? "cardiology"
        : "kardiologo"
      : bookKind === "metabolic"
        ? locale === "en"
          ? "metabolic health"
          : "metabolinės sveikatos"
        : locale === "en"
          ? "clinic"
          : "klinikos";

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Link
        href={catId ? `/patient/digital-twin/${catId}` : "/patient/labs"}
        className="text-sm text-[var(--muted)]"
      >
        ← {labels.back}
      </Link>

      <section
        className="panel marker-hero"
        style={{
          borderColor: COLOUR_HEX[colour],
          background: `linear-gradient(160deg, ${COLOUR_SOFT[colour]}, var(--surface) 55%)`,
        }}
      >
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div className="min-w-0" style={{ flex: 1 }}>
            <span className="eyebrow">
              {physical
                ? locale === "en"
                  ? "Physical metric"
                  : "Fizinis rodiklis"
                : labels.markers}
            </span>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em]">
              {name}
            </h1>
            <p className="marker-hero-blurb mt-3">{plain.blurb}</p>
            <p className="marker-hero-note mt-2">{plain.disclaimer}</p>
            {plain.advice ? (
              <p className="marker-hero-advice mt-3">{plain.advice}</p>
            ) : null}
            {plain.adviseDoctor && bookSlots.length > 0 ? (
              <div className="mt-4">
                <BookSpecialtySlots
                  locale={locale}
                  specialtyLabel={specialtyLabel}
                  buttonLabel={bookLabel}
                  hint={
                    locale === "en"
                      ? "Choose an available time — we’ll open the visit details."
                      : "Pasirinkite laisvą laiką — atsidarys vizito detalės."
                  }
                  slots={bookSlots}
                />
              </div>
            ) : null}
          </div>
          <div className="row" style={{ gap: 8, flexShrink: 0 }}>
            <span className={`pill ${PILL_CLASS[colour]}`}>
              {labels.colourLabels[colour]}
            </span>
            <AskAiButton label={labels.askAi} question={ask} />
          </div>
        </div>
      </section>

      <section
        className={`card surface-raised-card reading-card reading-card-${colour}`}
        style={
          colour !== "green" && colour !== "grey"
            ? {
                borderColor: COLOUR_HEX[colour],
                background: `linear-gradient(160deg, ${COLOUR_SOFT[colour]}, var(--surface-raised) 60%)`,
                boxShadow: `inset 0 0 0 1px ${COLOUR_HEX[colour]}55`,
              }
            : undefined
        }
      >
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {locale === "en" ? "Your reading" : "Jūsų matavimas"}
          </h2>
          {latest ? (
            <span className={`pill ${PILL_CLASS[colour]}`}>
              {labels.colourLabels[colour]}
            </span>
          ) : null}
        </div>
        {latest ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="eyebrow">{labels.value}</p>
              <p
                className="mt-1 text-2xl font-semibold"
                style={
                  colour !== "green" && colour !== "grey"
                    ? { color: COLOUR_HEX[colour] }
                    : undefined
                }
              >
                {reading}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {latest.observedAt}
                {importSourceLabel(latest.source, locale)
                  ? ` ${importSourceLabel(latest.source, locale)}`
                  : ""}
              </p>
            </div>
            <div>
              <p className="eyebrow">{labels.reference}</p>
              <p className="mt-1 text-lg font-medium">
                {formatMarkerReference(
                  latest.refLow,
                  latest.refHigh,
                  markerKey,
                  locale
                )}
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

      {!physical ? (
        <section className="card surface-raised-card">
          <p className="eyebrow">
            {locale === "en" ? "In plain language" : "Paprastai tariant"}
          </p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-[var(--ink)]">
            {plain.blurb}
            {plain.advice ? ` ${plain.advice}` : ""}
          </p>
          <p className="disclaim mt-3">{plain.disclaimer}</p>
        </section>
      ) : null}

      <section className="card surface-raised-card">
        <p className="eyebrow mb-2">{labels.trend}</p>
        <MarkerChart
          points={history.map((h) => ({
            date: h.observedAt,
            value: h.value,
          }))}
          refLow={latest?.refLow}
          refHigh={latest?.refHigh}
          unit={
            markerKey === "BLOOD_PRESSURE"
              ? "mmHg SYS"
              : latest?.unit || undefined
          }
        />
        {history.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="labs-table">
              <thead>
                <tr>
                  <th>{locale === "en" ? "Date" : "Data"}</th>
                  <th>{labels.labsResult}</th>
                  <th>{labels.labsStatus}</th>
                  <th>{locale === "en" ? "Source" : "Šaltinis"}</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((h) => {
                  const c = markerItemColour({
                    value: h.value,
                    refLow: h.refLow,
                    refHigh: h.refHigh,
                    flag: h.flag,
                    unit: h.unit,
                    markerKey,
                  });
                  const src = importSourceLabel(h.source, locale);
                  return (
                    <tr key={h.id}>
                      <td>{h.observedAt}</td>
                      <td className="labs-val">
                        {formatMarkerReading(h.value, h.unit, markerKey)}
                      </td>
                      <td>
                        <span className={`pill ${PILL_CLASS[c]}`}>
                          {labels.colourLabels[c]}
                        </span>
                      </td>
                      <td className="small muted">
                        {src ||
                          (locale === "en" ? "Clinic / profile" : "Klinika / profilis")}
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
