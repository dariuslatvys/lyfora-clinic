"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PILL_CLASS, type RiskColour } from "@/lib/health/colours";
import type { RecommendationItem } from "@/lib/health/recommendations";

type GroupId = RecommendationItem["group"];

export function RecommendationsView({
  locale,
  items,
  colourLabels,
}: {
  locale: "lt" | "en";
  items: RecommendationItem[];
  colourLabels: Record<RiskColour, string>;
}) {
  const [filter, setFilter] = useState<"all" | GroupId>("all");

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Personal plan",
            title: "Recommendations",
            blurb:
              "Priorities from your digital twin — health areas, out-of-range labs, goals and suggested Marketplace packages.",
            all: "All",
            priority: "Priority areas",
            labs: "Labs to watch",
            goals: "Goals",
            shop: "Suggested offers",
            care: "Care actions",
            empty: "No recommendations in this filter right now.",
            count: "items",
          }
        : {
            eyebrow: "Asmeninis planas",
            title: "Rekomendacijos",
            blurb:
              "Prioritetai iš skaitmeninio dvynio — sveikatos sritys, tyrimai už normos, tikslai ir Marketplace pasiūlymai.",
            all: "Visos",
            priority: "Prioritetinės sritys",
            labs: "Stebėtini tyrimai",
            goals: "Tikslai",
            shop: "Siūlomi pasiūlymai",
            care: "Priežiūros veiksmai",
            empty: "Šiame filtre rekomendacijų nėra.",
            count: "vnt.",
          },
    [locale]
  );

  const groups: { id: GroupId; label: string }[] = [
    { id: "priority", label: copy.priority },
    { id: "labs", label: copy.labs },
    { id: "goals", label: copy.goals },
    { id: "shop", label: copy.shop },
    { id: "care", label: copy.care },
  ];

  const filtered =
    filter === "all" ? items : items.filter((i) => i.group === filter);

  const byGroup = groups
    .map((g) => ({
      ...g,
      rows: filtered.filter((i) => i.group === g.id),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="stack" style={{ gap: 14 }}>
      <header>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
          {copy.blurb}
        </p>
      </header>

      <div className="upload-filter" role="tablist" aria-label={copy.title}>
        <button
          type="button"
          className={`upload-filter-btn${filter === "all" ? " on" : ""}`}
          onClick={() => setFilter("all")}
        >
          {copy.all}
          <span className="visits-tab-count">{items.length}</span>
        </button>
        {groups.map((g) => {
          const n = items.filter((i) => i.group === g.id).length;
          if (!n) return null;
          return (
            <button
              key={g.id}
              type="button"
              className={`upload-filter-btn${filter === g.id ? " on" : ""}`}
              onClick={() => setFilter(g.id)}
            >
              {g.label}
              <span className="visits-tab-count">{n}</span>
            </button>
          );
        })}
      </div>

      {!byGroup.length ? (
        <div className="card empty">{copy.empty}</div>
      ) : (
        byGroup.map((g) => (
          <section key={g.id} className="card">
            <div className="card-head">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
                {g.label}
              </h2>
              <span className="pill plain c-acc">{g.rows.length}</span>
            </div>
            <div className="stack mt-3" style={{ gap: 10 }}>
              {g.rows.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className="rec"
                  style={{
                    ["--cc" as string]: `var(--r-${
                      s.colour === "grey" ? "none" : s.colour
                    })`,
                  }}
                >
                  <div
                    className="row between nowrap"
                    style={{ alignItems: "flex-start", gap: 10 }}
                  >
                    <h3 className="m-0">{s.title}</h3>
                    <span className={`pill ${PILL_CLASS[s.colour]}`}>
                      {colourLabels[s.colour]}
                    </span>
                  </div>
                  <p
                    className="small m-0 mt-2"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {s.why}
                  </p>
                  {s.cta ? (
                    <span className="small mt-2" style={{ color: "var(--accent)" }}>
                      {s.cta} →
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
