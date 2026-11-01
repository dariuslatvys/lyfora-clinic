"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type VisitListItem = {
  id: string;
  title: string;
  doctor: string;
  specialty: string;
  when: string;
  place?: string;
};

export function VisitsTabs({
  locale,
  upcoming,
  past,
  bookLabel,
  initialTab = "upcoming",
}: {
  locale: "lt" | "en";
  upcoming: VisitListItem[];
  past: VisitListItem[];
  bookLabel: string;
  initialTab?: "upcoming" | "history";
}) {
  const [tab, setTab] = useState<"upcoming" | "history">(initialTab);

  const labels = useMemo(
    () =>
      locale === "en"
        ? {
            upcoming: "Planned & upcoming",
            history: "Visit history",
            emptyUpcoming: "No upcoming visits planned.",
            emptyHistory: "No past visits yet.",
          }
        : {
            upcoming: "Suplanuoti ir būsimi",
            history: "Vizitų istorija",
            emptyUpcoming: "Suplanuotų vizitų nėra.",
            emptyHistory: "Vizitų istorijos dar nėra.",
          },
    [locale]
  );

  const list = tab === "upcoming" ? upcoming : past;
  const empty =
    tab === "upcoming" ? labels.emptyUpcoming : labels.emptyHistory;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <h2 className="font-[family-name:var(--font-display)] text-3xl m-0">
          {locale === "en" ? "Visits" : "Vizitai"}
        </h2>
        <Link href="/patient/consultations" className="btn sm">
          {bookLabel}
        </Link>
      </div>

      <div className="tabs visits-tabs" role="tablist" aria-label={locale === "en" ? "Visits" : "Vizitai"}>
        <button
          type="button"
          role="tab"
          className={tab === "upcoming" ? "on" : undefined}
          aria-selected={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
        >
          {labels.upcoming}
          <span className="visits-tab-count">{upcoming.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "history" ? "on" : undefined}
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
        >
          {labels.history}
          <span className="visits-tab-count">{past.length}</span>
        </button>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>{tab === "upcoming" ? labels.upcoming : labels.history}</h2>
          <span className="pill plain c-acc">{list.length}</span>
        </div>
        {list.length ? (
          <div className="list">
            {list.map((v) => (
              <Link
                key={v.id}
                href={`/patient/visits/${v.id}`}
                className="li click"
              >
                <div className="grow">
                  <b>{v.title}</b>
                  <span className="xs muted">
                    {v.doctor} · {v.specialty}
                    {v.place ? ` · ${v.place}` : ""}
                  </span>
                </div>
                <span className="small muted">{v.when}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">{empty}</div>
        )}
      </section>
    </div>
  );
}
