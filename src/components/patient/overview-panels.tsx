"use client";

import Link from "next/link";
import { useState } from "react";
import { BodyMap, type BodyMapCategory } from "@/components/patient/body-map";
import { CategoryCard } from "@/components/patient/category-card";
import { PILL_CLASS, type RiskColour } from "@/lib/health/colours";
import type { FlaggedLab } from "@/lib/health/marker-colour";

export type OverviewFlaggedLab = FlaggedLab;

export type OverviewStep = {
  id: string;
  title: string;
  why: string;
  colour: RiskColour;
  href: string;
};

export type OverviewVisit = {
  id: string;
  when: string;
  title: string;
  withWhom: string;
  href: string;
};

type Labels = {
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
  colourLabels: Record<string, string>;
};

export function OverviewPanels({
  locale,
  labels,
  categories,
  flaggedLabs,
  steps,
  visits,
  goals,
  planName,
  planPerks,
}: {
  locale: "lt" | "en";
  labels: Labels;
  categories: BodyMapCategory[];
  flaggedLabs: OverviewFlaggedLab[];
  steps: OverviewStep[];
  visits: OverviewVisit[];
  goals: { title: string; progress: number }[];
  planName: string;
  planPerks: string;
}) {
  const [tab, setTab] = useState<"map" | "summary">("map");

  return (
    <section className="stack overview-section" style={{ gap: 12 }}>
      <div className="tabs overview-tabs" role="tablist" aria-label={labels.healthMapTitle}>
        <button
          type="button"
          role="tab"
          className={tab === "map" ? "on" : undefined}
          aria-selected={tab === "map"}
          onClick={() => setTab("map")}
        >
          {labels.healthMapTitle}
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "summary" ? "on" : undefined}
          aria-selected={tab === "summary"}
          onClick={() => setTab("summary")}
        >
          {labels.cardSummary}
        </button>
      </div>

      {tab === "map" ? (
        <BodyMap
          categories={categories}
          geneHint={labels.geneMarkerHint}
          centerLabel="Lyfora"
        />
      ) : (
        <div className="stack overview-summary" style={{ gap: 14 }}>
          <div className="row between" style={{ alignItems: "baseline" }}>
            <h3 className="overview-subhead">{labels.categoriesTitle}</h3>
            <span className="small muted">{labels.categoriesHint}</span>
          </div>
          <div className="cats">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                id={c.id}
                title={c.title}
                colour={c.colour}
                colourLabel={c.colourLabel}
                geneticBadge={!!c.geneticBadge}
                geneticMark={c.geneticMark || labels.geneMarkShort}
              />
            ))}
          </div>

          <div className="grid g-main">
            <div className="stack" style={{ gap: 12 }}>
              <section className="card">
                <div className="card-head">
                  <h2>{labels.keySteps}</h2>
                  <Link href="/patient/recommendations" className="link">
                    {labels.allRecommendations} ({steps.length})
                  </Link>
                </div>
                <div className="stack" style={{ gap: 10 }}>
                  {steps.slice(0, 3).map((s) => (
                    <Link
                      key={s.id}
                      href={s.href}
                      className="rec"
                      style={{ ["--cc" as string]: `var(--r-${s.colour === "grey" ? "none" : s.colour})` }}
                    >
                      <div className="row between nowrap" style={{ alignItems: "flex-start" }}>
                        <h3>{s.title}</h3>
                        <span className={`pill ${PILL_CLASS[s.colour]}`}>
                          {labels.colourLabels[s.colour]}
                        </span>
                      </div>
                      <p className="small" style={{ color: "var(--ink-soft)", margin: 0 }}>
                        {s.why}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="card-head">
                  <h2>{labels.upcomingVisits}</h2>
                  <Link href="/patient/visits" className="link">
                    {labels.allVisits}
                  </Link>
                </div>
                {visits.length ? (
                  <div className="list">
                    {visits.map((v) => (
                      <Link
                        key={v.id}
                        href={v.href}
                        className="li click"
                      >
                        <div className="grow">
                          <b>{v.title}</b>
                          <span className="xs muted">{v.withWhom}</span>
                        </div>
                        <span className="small muted">{v.when}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty">{labels.noUpcomingVisits}</div>
                )}
              </section>
            </div>

            <div className="stack" style={{ gap: 12 }}>
              <section className="card">
                <div className="card-head">
                  <h2>{labels.outOfRange}</h2>
                  <Link href="/patient/labs" className="link">
                    {locale === "en" ? "All labs" : "Visi tyrimai"}
                  </Link>
                </div>
                {flaggedLabs.length ? (
                  <div className="list">
                    {flaggedLabs.slice(0, 5).map((m) => (
                      <Link
                        key={m.markerKey}
                        href={`/patient/marker/${encodeURIComponent(m.markerKey)}`}
                        className="li click"
                      >
                        <div className="grow">
                          <b>{m.name}</b>
                          <span className="xs muted">
                            {new Date(m.observedAt).toLocaleDateString(
                              locale === "en" ? "en-GB" : "lt-LT"
                            )}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <b className="num">
                            {m.value}
                            {m.unit ? (
                              <span className="xs muted"> {m.unit}</span>
                            ) : null}
                          </b>
                          <div>
                            <span className={`pill ${PILL_CLASS[m.colour]}`}>
                              {labels.colourLabels[m.colour]}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty">{labels.allInRange}</div>
                )}
              </section>

              <section className="card">
                <div className="card-head">
                  <h2>{labels.myGoals}</h2>
                </div>
                <div className="stack" style={{ gap: 10 }}>
                  {goals.map((g) => (
                    <div key={g.title}>
                      <div className="row between small">
                        <span>{g.title}</span>
                        <b className="num">{g.progress} %</b>
                      </div>
                      <div className="progress">
                        <i style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="card-head">
                  <h2>{labels.myPlan}</h2>
                  <span className="pill plain c-acc">{planName}</span>
                </div>
                <p className="small muted" style={{ margin: 0 }}>
                  {planPerks}
                </p>
                <div className="row" style={{ marginTop: 10 }}>
                  <Link href="/patient/marketplace" className="btn sm ghost">
                    {labels.changePlan}
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

