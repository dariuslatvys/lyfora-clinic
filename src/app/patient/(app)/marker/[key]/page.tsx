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
import {
  explainMarkerPlain,
  formatMarkerReading,
  formatMarkerReference,
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
    physicalMarkerName(markerKey, locale) ||
    def?.name ||
    markerKey;
  const colour = latest
    ? markerItemColour({
        value: latest.value,
        refLow: latest.refLow,
        refHigh: latest.refHigh,
        flag: latest.flag,
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

  const cardioSlots =
    markerKey === "BLOOD_PRESSURE" || markerKey === "RESTING_HR" || markerKey === "HRV"
      ? upcomingVisits()
          .filter((v) => /cardio|kardiolog/i.test(v.specialtyEn + v.specialtyLt))
          .map((v) => ({
            id: v.id,
            when: formatVisitWhen(v, locale),
            title: visitTitle(v, locale),
            doctor: visitDoctor(v, locale),
            place: visitPlace(v, locale),
            href: `/patient/visits/${v.id}`,
          }))
      : [];

  // Extra demo cardiology slots if only one upcoming exists
  const bookSlots =
    cardioSlots.length > 0
      ? cardioSlots
      : markerKey === "BLOOD_PRESSURE"
        ? [
            {
              id: "slot-cardio-1",
              when:
                locale === "en"
                  ? "12 Nov 2026 · 10:30"
                  : "2026-11-12 · 10:30",
              title:
                locale === "en"
                  ? "Cardiology consultation"
                  : "Kardiologo konsultacija",
              doctor: "Dr. Andrius Kazlauskas",
              place:
                locale === "en" ? "Lyfora Heart Center" : "Lyfora Heart Center",
              href: "/patient/visits/v-2026-11-12",
            },
            {
              id: "slot-cardio-2",
              when:
                locale === "en"
                  ? "19 Nov 2026 · 09:00"
                  : "2026-11-19 · 09:00",
              title:
                locale === "en"
                  ? "Cardiology consultation"
                  : "Kardiologo konsultacija",
              doctor: "Dr. Andrius Kazlauskas",
              place:
                locale === "en" ? "Lyfora Heart Center" : "Lyfora Heart Center",
              href: "/patient/consultations",
            },
            {
              id: "slot-cardio-3",
              when:
                locale === "en"
                  ? "3 Dec 2026 · 14:15"
                  : "2026-12-03 · 14:15",
              title:
                locale === "en"
                  ? "Cardiology consultation"
                  : "Kardiologo konsultacija",
              doctor: "Dr. Andrius Kazlauskas",
              place:
                locale === "en" ? "Lyfora Heart Center" : "Lyfora Heart Center",
              href: "/patient/consultations",
            },
          ]
        : [];

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
          <div>
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
            {reading ? (
              <p className="marker-hero-reading mt-2">{reading}</p>
            ) : null}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className={`pill ${PILL_CLASS[colour]}`}>
              {labels.colourLabels[colour]}
            </span>
            <AskAiButton label={labels.askAi} question={ask} />
          </div>
        </div>
      </section>

      <section className="card surface-raised-card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {locale === "en" ? "Your reading" : "Jūsų matavimas"}
          </h2>
        </div>
        {latest ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="eyebrow">{labels.value}</p>
              <p className="mt-1 text-2xl font-semibold">{reading}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {latest.observedAt}
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

      <section className="card surface-raised-card">
        <p className="eyebrow">{plain.eyebrow}</p>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-[var(--ink)]">
          {plain.body}
        </p>
        <p className="disclaim mt-3">
          {physical
            ? locale === "en"
              ? "This is a physical reading — not a lab test and not a diagnosis."
              : "Tai fizinis matavimas — ne laboratorinis tyrimas ir ne diagnozė."
            : locale === "en"
              ? "Educational context for your lab marker — not a diagnosis. Discuss treatment only with your clinician."
              : "Edukacinis žymens paaiškinimas — ne diagnozė. Gydymą aptarkite tik su gydytoju."}
        </p>

        {plain.adviseDoctor && bookSlots.length > 0 ? (
          <div className="mt-4">
            <BookSpecialtySlots
              locale={locale}
              specialtyLabel={
                locale === "en" ? "cardiology" : "kardiologo"
              }
              buttonLabel={
                locale === "en"
                  ? "Book cardiology consultation"
                  : "Rezervuoti kardiologo konsultaciją"
              }
              hint={
                locale === "en"
                  ? "Choose an available time — we’ll open the visit details."
                  : "Pasirinkite laisvą laiką — atsidarys vizito detalės."
              }
              slots={bookSlots}
            />
          </div>
        ) : null}
      </section>

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
                        {formatMarkerReading(h.value, h.unit, markerKey)}
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
