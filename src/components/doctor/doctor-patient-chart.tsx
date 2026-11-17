"use client";

import { useMemo, useState } from "react";
import { OverviewPanels } from "@/components/patient/overview-panels";
import { HealthCardTabs } from "@/components/patient/health-card-tabs";
import { ReproductivePhenotypesPanel } from "@/components/patient/reproductive-phenotypes";
import { WomenHealthMap } from "@/components/patient/women-health-map";
import { MenHealthMap } from "@/components/patient/men-health-map";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type {
  HealthCardModel,
  HealthCardTabId,
} from "@/lib/health/health-card-data";
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

function hasDiagnosisFiles(card: HealthCardModel) {
  return card.conditions.some((c) => (c.links || []).length > 0);
}

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
  sex = "male",
  patientId,
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
  sex?: "male" | "female";
  patientId: string;
}) {
  const isFemale = sex === "female";
  const startOnDiagnoses = useMemo(() => hasDiagnosisFiles(card), [card]);
  const [tab, setTab] = useState<"map" | "women" | "summary" | "health">(
    startOnDiagnoses ? "health" : isFemale ? "map" : "summary"
  );
  const [healthTab, setHealthTab] = useState<HealthCardTabId>(
    startOnDiagnoses ? "dx" : "sum"
  );

  const womenHealthHref = `/doctor/patients/${patientId}/reproductive`;
  const hrefForCategory = (categoryId: string) => {
    if (categoryId === "reproductive") return womenHealthHref;
    return null;
  };

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
          className={tab === "map" ? "on" : undefined}
          aria-selected={tab === "map"}
          onClick={() => setTab("map")}
        >
          {overviewLabels.healthMapTitle}
        </button>
        {isFemale ? (
          <button
            type="button"
            role="tab"
            className={tab === "women" ? "on" : undefined}
            aria-selected={tab === "women"}
            onClick={() => setTab("women")}
          >
            {locale === "en" ? "Women’s health" : "Moters sveikata"}
          </button>
        ) : null}
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
          onClick={() => {
            setTab("health");
            if (startOnDiagnoses) setHealthTab("dx");
          }}
        >
          {labels.healthCard}
        </button>
        {startOnDiagnoses ? (
          <button
            type="button"
            role="tab"
            className={tab === "health" && healthTab === "dx" ? "on" : undefined}
            aria-selected={tab === "health" && healthTab === "dx"}
            onClick={() => {
              setHealthTab("dx");
              setTab("health");
            }}
          >
            {labels.cardDiagnoses}
          </button>
        ) : null}
      </div>

      {tab === "map" ? (
        isFemale ? (
          <WomenHealthMap
            categories={categories}
            geneHint={overviewLabels.geneMarkerHint}
            locale={locale}
            interactive={false}
            hrefForCategory={hrefForCategory}
          />
        ) : (
          <MenHealthMap
            categories={categories}
            geneHint={overviewLabels.geneMarkerHint}
            locale={locale}
            interactive={false}
          />
        )
      ) : tab === "women" && isFemale ? (
        <div className="stack" style={{ gap: 14 }} id="women-health">
          <div className="panel" style={{ padding: "14px 16px" }}>
            <h3 className="m-0 font-[family-name:var(--font-display)] text-xl">
              {locale === "en"
                ? "Women’s health and life stages"
                : "Moters sveikata ir gyvybiniai etapai"}
            </h3>
            <p className="small muted m-0 mt-2">
              {locale === "en"
                ? "Cycle, hormones, fertility and the four key phenotypes — the same women’s health area the patient sees in her twin."
                : "Ciklas, hormonai, vaisingumas ir keturi pagrindiniai fenotipai — ta pati moters sveikatos sritis, kurią pacientė mato savo dvynyje."}
            </p>
          </div>
          <ReproductivePhenotypesPanel
            locale={locale}
            basePath={`/doctor/patients/${patientId}/reproductive`}
            interactive
          />
        </div>
      ) : tab === "summary" ? (
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
          sex={sex}
        />
      ) : (
        <HealthCardTabs
          locale={locale}
          labels={labels}
          card={card}
          pharmaSnps={pharmaSnps}
          readOnly
          initialTab={healthTab}
          key={healthTab}
        />
      )}
    </div>
  );
}
