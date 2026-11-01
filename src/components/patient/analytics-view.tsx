"use client";

import Link from "next/link";
import { AskAiButton } from "@/components/patient/ask-ai-button";
import { MarkerChart } from "@/components/patient/marker-chart";
import {
  COLOUR_HEX,
  PILL_CLASS,
  type RiskColour,
} from "@/lib/health/colours";

export type AnalyticsCategoryRow = {
  id: string;
  title: string;
  biomarkerColour: RiskColour;
  geneticColour: RiskColour | null;
  colour: RiskColour;
  geneticBadge: boolean;
  drivers: string[];
  href: string;
};

export type AnalyticsSeries = {
  key: string;
  name: string;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  points: { date: string; value: number }[];
  delta: number;
  href: string;
};

export function AnalyticsView({
  locale,
  healthIndex,
  cvRiskLabel,
  cvRiskNote,
  labResultCount,
  visitCount,
  categories,
  series,
}: {
  locale: "lt" | "en";
  healthIndex: number;
  cvRiskLabel: string;
  cvRiskNote: string | null;
  labResultCount: number;
  visitCount: number;
  categories: AnalyticsCategoryRow[];
  series: AnalyticsSeries[];
}) {
  const copy =
    locale === "en"
      ? {
          eyebrow: "Trends from my data",
          title: "Analytics",
          blurb:
            "How key markers change over time and what drives each health-area colour from labs and DNA.",
          kpiIndex: "Health index",
          kpiCv: "CVD risk",
          kpiLabs: "Lab results on file",
          kpiVisits: "Visits in history",
          mapTitle: "Risk map",
          area: "Area",
          labs: "Labs",
          dna: "DNA",
          final: "Final",
          drivers: "Driving factors",
          trends: "Marker trends",
          noTrends: "Not enough repeated lab points for charts yet.",
          open: "Open",
          geneMark: "G",
        }
      : {
          eyebrow: "Mano duomenų tendencijos",
          title: "Analitika",
          blurb:
            "Kaip keičiasi svarbiausi rodikliai ir iš ko susideda kiekvienos sveikatos srities įvertinimas.",
          kpiIndex: "Sveikatos indeksas",
          kpiCv: "ŠKL rizika",
          kpiLabs: "Tyrimų rezultatų kortelėje",
          kpiVisits: "Vizitų istorijoje",
          mapTitle: "Rizikos žemėlapis",
          area: "Sritis",
          labs: "Tyrimai",
          dna: "DNR",
          final: "Galutinė",
          drivers: "Lemiantys veiksniai",
          trends: "Rodiklių tendencijos",
          noTrends: "Kol kas nėra pakartotinių tyrimų taškų diagramoms.",
          open: "Atidaryti",
          geneMark: "G",
        };

  const colourLabel = (c: RiskColour | null | "none") => {
    if (!c || c === "none") return locale === "en" ? "No data" : "Nėra duomenų";
    const lt: Record<RiskColour, string> = {
      grey: "Nėra duomenų",
      green: "Gerai",
      yellow: "Stebėti",
      orange: "Dėmesio",
      red: "Kritiška",
      badge: "Genetinis žymuo",
    };
    const en: Record<RiskColour, string> = {
      grey: "No data",
      green: "Good",
      yellow: "Watch",
      orange: "Attention",
      red: "Critical",
      badge: "Genetic marker",
    };
    return locale === "en" ? en[c] : lt[c];
  };

  return (
    <div className="stack analytics-page" style={{ gap: 16 }}>
      <header className="dna-page-head">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
            {copy.blurb}
          </p>
        </div>
        <AskAiButton
          label={locale === "en" ? "Explain with AI" : "Paaiškinti su AI"}
          question={
            locale === "en"
              ? "Summarise my analytics risk map and the main lab trends in plain language"
              : "Apibendrink mano analitikos rizikos žemėlapį ir pagrindines tyrimų tendencijas paprasta kalba"
          }
        />
      </header>

      <div className="dna-kpi-grid analytics-kpi-grid">
        <div className="card dna-kpi">
          <b className="num">{healthIndex}</b>
          <span>{copy.kpiIndex}</span>
        </div>
        <div className="card dna-kpi">
          <b>{cvRiskLabel}</b>
          <span>
            {copy.kpiCv}
            {cvRiskNote ? ` · ${cvRiskNote}` : ""}
          </span>
        </div>
        <div className="card dna-kpi">
          <b className="num">{labResultCount}</b>
          <span>{copy.kpiLabs}</span>
        </div>
        <div className="card dna-kpi">
          <b className="num">{visitCount}</b>
          <span>{copy.kpiVisits}</span>
        </div>
      </div>

      <section className="card">
        <div className="card-head" style={{ alignItems: "flex-start" }}>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
            {copy.mapTitle}
          </h2>
          <div className="analytics-legend">
            {(
              ["green", "badge", "yellow", "orange", "red", "grey"] as RiskColour[]
            ).map((c) => (
              <span key={c} className="analytics-legend-item">
                <i style={{ background: COLOUR_HEX[c] }} />
                {colourLabel(c)}
              </span>
            ))}
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl analytics-tbl">
            <thead>
              <tr>
                <th>{copy.area}</th>
                <th>{copy.labs}</th>
                <th>{copy.dna}</th>
                <th>{copy.final}</th>
                <th className="hide-mob">{copy.drivers}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="click">
                  <td>
                    <Link href={c.href} className="analytics-area-link">
                      <b>{c.title}</b>
                    </Link>
                  </td>
                  <td>
                    <span className={`pill plain ${PILL_CLASS[c.biomarkerColour]}`}>
                      {colourLabel(c.biomarkerColour)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pill plain ${
                        PILL_CLASS[c.geneticColour || "grey"]
                      }`}
                    >
                      {colourLabel(c.geneticColour)}
                    </span>
                  </td>
                  <td>
                    <span className={`pill plain ${PILL_CLASS[c.colour]}`}>
                      {colourLabel(c.colour)}
                    </span>
                    {c.geneticBadge ? (
                      <span className="gene-mark" title="DNA badge">
                        {copy.geneMark}
                      </span>
                    ) : null}
                  </td>
                  <td className="small muted hide-mob">
                    {c.drivers.length ? c.drivers.join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
          {copy.trends}
        </h2>
        {series.length === 0 ? (
          <div className="card empty">{copy.noTrends}</div>
        ) : (
          <div className="analytics-charts">
            {series.map((s) => (
              <article key={s.key} className="card analytics-chart-card">
                <div className="card-head">
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-base font-semibold m-0">
                      <Link href={s.href} className="analytics-area-link">
                        {s.name}
                      </Link>
                    </h3>
                    <p className="small muted m-0 mt-1">
                      {s.unit || "—"}
                      {s.refLow != null && s.refHigh != null
                        ? ` · ${s.refLow}–${s.refHigh}`
                        : s.refHigh != null
                          ? ` · < ${s.refHigh}`
                          : s.refLow != null
                            ? ` · > ${s.refLow}`
                            : ""}
                    </p>
                  </div>
                  <span
                    className={`pill plain ${
                      Math.abs(s.delta) < 1e-9 ? "c-none" : "c-acc"
                    } num`}
                  >
                    {s.delta > 0 ? "+" : ""}
                    {Number.isInteger(s.delta)
                      ? s.delta
                      : s.delta.toFixed(2)}
                  </span>
                </div>
                <div className="analytics-chart-body">
                  <MarkerChart
                    points={s.points}
                    refLow={s.refLow}
                    refHigh={s.refHigh}
                    unit={s.unit}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
