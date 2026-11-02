import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { collectFlaggedLabs } from "@/lib/health/marker-colour";
import { goalsFromMetrics } from "@/lib/health/goals-from-metrics";
import type { RiskColour } from "@/lib/health/colours";
import {
  formatVisitWhen,
  upcomingVisits,
  visitDoctor,
  visitTitle,
} from "@/lib/health/demo-visits";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire, patients } from "@/lib/db/schema";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { buildHealthCard } from "@/lib/health/health-card-data";
import { DoctorPatientChart } from "@/components/doctor/doctor-patient-chart";

const RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

export default async function DoctorPatientChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  const { id } = await params;
  const twin = loadDigitalTwin(id, locale);
  if (!twin) notFound();

  ensureSchema();
  const db = getDb();
  const patientRow = db.select().from(patients).where(eq(patients.id, id)).get();
  if (!patientRow) notFound();

  const name = patientDisplayName(twin.patient.sex, locale);
  const attention = twin.categories
    .filter((c) => RANK[c.colour] >= 3)
    .sort((a, b) => RANK[b.colour] - RANK[a.colour]);

  const mapCategories = twin.categories.map((c) => ({
    id: c.id,
    title: labels.categoryNames[c.id] || c.id,
    colour: c.colour,
    colourLabel: labels.colourLabels[c.colour],
    geneticBadge: c.geneticBadge || c.rare.length > 0,
    geneticMark: labels.geneMarkShort,
  }));

  const flaggedLabs = collectFlaggedLabs(twin.markers);
  const steps = attention.map((c) => ({
    id: c.id,
    title: labels.categoryNames[c.id] || c.id,
    why: c.summary,
    colour: c.colour,
    href: `/patient/digital-twin/${c.id}`,
  }));

  const visits = upcomingVisits(3).map((v) => ({
    id: v.id,
    when: formatVisitWhen(v, locale),
    title: visitTitle(v, locale),
    withWhom: visitDoctor(v, locale),
    href: `/patient/visits/${v.id}`,
  }));

  const computedGoals = goalsFromMetrics(twin.markers, locale, 5);
  const goals =
    computedGoals.length > 0
      ? computedGoals.map((g) => ({
          title: g.title,
          detail: g.detail,
          progress: g.progress,
        }))
      : locale === "en"
        ? [
            {
              title: "Keep labs and vitals in range",
              detail: "No out-of-range signals right now — maintain the habit.",
              progress: 100,
            },
          ]
        : [
            {
              title: "Išlaikyti rodiklius normoje",
              detail: "Šiuo metu nukrypimų nėra — tęskite gerus įpročius.",
              progress: 100,
            },
          ];

  const key = questionnaireStorageKey();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(eq(questionnaire.patientId, id), eq(questionnaire.key, key))
    )
    .get();
  const answers = parseStoredAnswers(row?.value);
  const card = buildHealthCard({
    patientName: name,
    sex: patientRow.sex,
    dob: patientRow.dob,
    answers,
  });

  const pharmaSnps =
    twin.categories
      .find((c) => c.id === "pharmacogenetics")
      ?.snps.map((s) => ({
        gene: s.gene,
        snpId: s.snpId,
        allele1: s.allele1,
        allele2: s.allele2,
        matchCount: s.matchCount,
        colour: s.colour,
        genotypeAvailable: s.genotypeAvailable,
        subcategory: s.subcategory,
      })) || [];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Link href="/doctor/patients" className="small muted">
        ← {locale === "en" ? "Patients" : "Pacientai"}
      </Link>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "Patient chart" : "Paciento kortelė"}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {name}
          </h1>
          <p className="mt-2 mb-0 text-sm text-[var(--muted)]">
            {twin.patient.dob || "—"} ·{" "}
            {twin.patient.sex === "male"
              ? locale === "en"
                ? "Male"
                : "Vyras"
              : locale === "en"
                ? "Female"
                : "Moteris"}
          </p>
        </div>
      </div>

      <DoctorPatientChart
        locale={locale}
        labels={labels}
        overviewLabels={{
          healthMapTitle: labels.healthMapTitle,
          cardSummary: labels.cardSummary,
          categoriesTitle: labels.categoriesTitle,
          categoriesHint: labels.categoriesHint,
          geneMarkerHint: labels.geneMarkerHint,
          geneMarkShort: labels.geneMarkShort,
          recommendations: labels.recommendations,
          visits: labels.visits,
          labs: labels.labs,
          outOfRange: locale === "en" ? "Out of range" : "Už normos ribų",
          allInRange:
            locale === "en"
              ? "Latest results are within range"
              : "Visi paskutiniai rezultatai normos ribose",
          keySteps: locale === "en" ? "Key next steps" : "Svarbiausi žingsniai",
          allRecommendations:
            locale === "en" ? "All recommendations" : "Visos rekomendacijos",
          upcomingVisits:
            locale === "en" ? "Upcoming visits" : "Artimiausi vizitai",
          allVisits: locale === "en" ? "All visits" : "Visi vizitai",
          myGoals: locale === "en" ? "My goals" : "Mano tikslai",
          myPlan: locale === "en" ? "My plan" : "Mano planas",
          changePlan: locale === "en" ? "Change plan" : "Keisti planą",
          noUpcomingVisits:
            locale === "en" ? "No upcoming visits" : "Būsimų vizitų nėra",
          goalsProgressHint:
            locale === "en"
              ? "Percentages show how close you are to the target: achieved vs still remaining."
              : "Procentai rodo, kiek jau esate arti tikslo: pasiekta ir kiek dar liko.",
          goalAchieved: locale === "en" ? "Achieved" : "Pasiekta",
          goalRemaining: locale === "en" ? "Remaining" : "Liko",
          colourLabels: labels.colourLabels,
        }}
        categories={mapCategories}
        flaggedLabs={flaggedLabs}
        steps={steps}
        visits={visits}
        goals={goals}
        planName="Lyfora Care+"
        planPerks={
          locale === "en"
            ? "Unlimited messaging · Priority booking · Twin updates"
            : "Neriboti klausimai · Prioritetinė registracija · Dvynio atnaujinimai"
        }
        card={card}
        pharmaSnps={pharmaSnps}
      />
    </div>
  );
}
