"use client";

import { useEffect, useState } from "react";
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

type ChartTab = "map" | "women" | "summary" | "health";

function parseInitialTab(
  raw: string | undefined,
  sex: "male" | "female"
): ChartTab {
  if (raw === "map" || raw === "summary" || raw === "health") return raw;
  if (raw === "women" && sex === "female") return "women";
  return sex === "female" ? "map" : "summary";
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
  initialTab,
  focusCategory,
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
  initialTab?: string;
  focusCategory?: string;
}) {
  const isFemale = sex === "female";
  const [tab, setTab] = useState<ChartTab>(() =>
    parseInitialTab(initialTab, sex)
  );
  const [healthTab] = useState<HealthCardTabId>("sum");
  const [focusId, setFocusId] = useState(focusCategory || "");

  useEffect(() => {
    setTab(parseInitialTab(initialTab, sex));
  }, [initialTab, sex]);

  useEffect(() => {
    setFocusId(focusCategory || "");
  }, [focusCategory]);

  useEffect(() => {
    if (!focusId || tab !== "map") return;
    const el = document.getElementById(`doctor-cat-${focusId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId, tab]);

  const womenHealthHref = `/doctor/patients/${patientId}/reproductive`;
  const hrefForCategory = (categoryId: string) => {
    if (categoryId === "reproductive") return womenHealthHref;
    // Keep focus on the map tile for problem-area deep links.
    return `/doctor/patients/${patientId}?tab=map&focus=${encodeURIComponent(categoryId)}`;
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
          onClick={() => setTab("health")}
        >
          {labels.healthCard}
        </button>
      </div>

      {tab === "map" ? (
        <div
          className={
            focusId ? `doctor-map-focus focus-${focusId}` : "doctor-map-focus"
          }
          data-focus={focusId || undefined}
        >
          {isFemale ? (
            <WomenHealthMap
              categories={categories}
              geneHint={overviewLabels.geneMarkerHint}
              locale={locale}
              interactive
              hrefForCategory={hrefForCategory}
              tileIdPrefix="doctor-cat-"
              focusCategoryId={focusId || undefined}
            />
          ) : (
            <MenHealthMap
              categories={categories}
              geneHint={overviewLabels.geneMarkerHint}
              locale={locale}
              interactive
              hrefForCategory={hrefForCategory}
              tileIdPrefix="doctor-cat-"
              focusCategoryId={focusId || undefined}
            />
          )}
        </div>
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
