import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { OverviewPanels } from "@/components/patient/overview-panels";
import { collectFlaggedLabs } from "@/lib/health/marker-colour";
import type { RiskColour } from "@/lib/health/colours";

const RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

function firstName(full: string) {
  return full.split(/\s+/)[0] || full;
}

export default async function DigitalTwinPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const name = patientDisplayName(current.patient.sex, locale);
  const attention = twin.categories.filter((c) => RANK[c.colour] >= 3);
  const today = new Date().toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const visits =
    locale === "en"
      ? [
          {
            id: "v1",
            when: "12 Nov · 10:30",
            title: "Cardiology follow-up",
            withWhom: "Dr. Lyfora",
          },
        ]
      : [
          {
            id: "v1",
            when: "11-12 · 10:30",
            title: "Kardiologo kontrolė",
            withWhom: "Dr. Lyfora",
          },
        ];

  const goals =
    locale === "en"
      ? [
          { title: "LDL under 2.6 mmol/L", progress: 62 },
          { title: "Walk 7,000 steps / day", progress: 48 },
          { title: "Sleep 7+ hours", progress: 71 },
        ]
      : [
          { title: "MTL < 2,6 mmol/L", progress: 62 },
          { title: "7 000 žingsnių per dieną", progress: 48 },
          { title: "Miegas 7+ val.", progress: 71 },
        ];

  return (
    <div className="stack overview-page" style={{ gap: 14 }}>
      <section className="hero hero-plain hero-compact rise-in">
        <div className="hero-top">
          <span className="eyebrow">{today}</span>
          <div className="quick quick-top">
            <Link href="/patient/urgent" className="btn">
              {labels.urgentConsult}
            </Link>
            <Link href="/patient/visits" className="btn ghost">
              {labels.bookVisit}
            </Link>
            <Link href="/patient/questions" className="btn ghost">
              {labels.askDoctor247}
            </Link>
          </div>
        </div>
        <div className="stack" style={{ gap: 6, width: "100%" }}>
          <h1>
            {labels.goodMorning}, {firstName(name)}
          </h1>
          <p className="diag-line">
            <span className="eyebrow" style={{ marginRight: 8 }}>
              {labels.diagnosisSummary}
            </span>
            {attention.length === 0 ? (
              <span className="muted">{labels.areasStable}</span>
            ) : (
              <>
                <strong>
                  {attention.length}{" "}
                  {attention.length === 1
                    ? labels.areaNeedsAttention
                    : labels.areasNeedAttention}
                </strong>
                <span className="muted">: </span>
                {attention.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 ? <span className="muted">, </span> : null}
                    <Link
                      href={`/patient/digital-twin/${c.id}`}
                      className="diag-link"
                      style={{
                        color:
                          c.colour === "red" ? "var(--r-red)" : "var(--r-orange)",
                      }}
                    >
                      {(labels.categoryNames[c.id] || c.id).toLowerCase()}
                    </Link>
                  </span>
                ))}
                <span className="muted">.</span>
              </>
            )}
          </p>
        </div>
      </section>

      <OverviewPanels
        locale={locale}
        labels={{
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
          upcomingVisits: locale === "en" ? "Upcoming visits" : "Artimiausi vizitai",
          allVisits: locale === "en" ? "All visits" : "Visi vizitai",
          myGoals: locale === "en" ? "My goals" : "Mano tikslai",
          myPlan: locale === "en" ? "My plan" : "Mano planas",
          changePlan: locale === "en" ? "Change plan" : "Keisti planą",
          noUpcomingVisits:
            locale === "en" ? "No upcoming visits" : "Būsimų vizitų nėra",
          colourLabels: labels.colourLabels,
        }}
        categories={mapCategories}
        flaggedLabs={flaggedLabs}
        steps={steps}
        visits={visits}
        goals={goals}
        planName={locale === "en" ? "Lyfora Care+" : "Lyfora Care+"}
        planPerks={
          locale === "en"
            ? "Unlimited messaging · Priority booking · Twin updates"
            : "Neriboti klausimai · Prioritetinė registracija · Dvynio atnaujinimai"
        }
      />
    </div>
  );
}
