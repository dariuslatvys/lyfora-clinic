"use client";

import { useState } from "react";
import { OverviewPanels } from "@/components/patient/overview-panels";
import { HealthCardTabs } from "@/components/patient/health-card-tabs";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { HealthCardModel } from "@/lib/health/health-card-data";
import type { BodyMapCategory } from "@/components/patient/body-map";
import type {
  OverviewFlaggedLab,
  OverviewStep,
  OverviewVisit,
} from "@/components/patient/overview-panels";
import type { PharmaSnpRow } from "@/components/patient/pharma-genes-tabs";

type OverviewLabels = {
  healthMapTitle: string;
  cardSummary: string;
  categoriesTitle: string;
  categoriesHint: string;
  geneMarkerHint: string;
  geneMarkShort: string;
  recommendations: string;
  visits: string;
  labs: string;
  outOfRange: string;
  allInRange: string;
  keySteps: string;
  allRecommendations: string;
  upcomingVisits: string;
  allVisits: string;
  myGoals: string;
  myPlan: string;
  changePlan: string;
  noUpcomingVisits: string;
  goalsProgressHint: string;
  goalAchieved: string;
  goalRemaining: string;
  colourLabels: Record<string, string>;
};

export function DoctorPatientChart({
  locale,
  labels,
  overviewLabels,
  categories,
  flaggedLabs,
  steps,
  visits,
  goals,
  planName,
  planPerks,
  card,
  pharmaSnps,
}: {
  locale: "lt" | "en";
  labels: Dictionary;
  overviewLabels: OverviewLabels;
  categories: BodyMapCategory[];
  flaggedLabs: OverviewFlaggedLab[];
  steps: OverviewStep[];
  visits: OverviewVisit[];
  goals: { title: string; detail?: string; progress: number; href?: string }[];
  planName: string;
  planPerks: string;
  card: HealthCardModel;
  pharmaSnps: PharmaSnpRow[];
}) {
  const [tab, setTab] = useState<"summary" | "health">("summary");

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={locale === "en" ? "Patient chart" : "Paciento kortelė"}
      >
        <button
          type="button"
          role="tab"
          className={tab === "summary" ? "on" : undefined}
          aria-selected={tab === "summary"}
          onClick={() => setTab("summary")}
        >
          {labels.cardSummary}
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "health" ? "on" : undefined}
          aria-selected={tab === "health"}
          onClick={() => setTab("health")}
        >
          {labels.healthCard}
        </button>
      </div>

      {tab === "summary" ? (
        <OverviewPanels
          locale={locale}
          labels={overviewLabels}
          categories={categories}
          flaggedLabs={flaggedLabs}
          steps={steps}
          visits={visits}
          goals={goals}
          planName={planName}
          planPerks={planPerks}
          mode="summary"
          interactive={false}
        />
      ) : (
        <HealthCardTabs
          locale={locale}
          labels={labels}
          card={card}
          pharmaSnps={pharmaSnps}
          readOnly
        />
      )}
    </div>
  );
}
