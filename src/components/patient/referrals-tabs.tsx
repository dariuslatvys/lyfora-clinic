"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ReferralRow = {
  id: string;
  visitId: string;
  title: string;
  specialty: string;
  place: string;
  visitTitle: string;
  notes?: string;
  date: string;
  status: "issued" | "scheduled" | "completed";
  statusLabel: string;
};

export function ReferralsTabs({
  locale,
  active,
  history,
  blurb,
}: {
  locale: "lt" | "en";
  active: ReferralRow[];
  history: ReferralRow[];
  blurb: string;
}) {
  const [tab, setTab] = useState<"active" | "history">("active");

  const labels = useMemo(
    () =>
      locale === "en"
        ? {
            title: "Referrals",
            active: "Active & upcoming",
            history: "Historical",
            emptyActive: "No open or upcoming referrals right now.",
            emptyHistory: "No historical referrals yet.",
            fromVisit: "From visit",
          }
        : {
            title: "Siuntimai",
            active: "Aktyvūs ir būsimi",
            history: "Istoriniai",
            emptyActive: "Šiuo metu aktyvių ar būsimų siuntimų nėra.",
            emptyHistory: "Istorinių siuntimų dar nėra.",
            fromVisit: "Iš vizito",
          },
    [locale]
  );

  const list = tab === "active" ? active : history;
  const empty = tab === "active" ? labels.emptyActive : labels.emptyHistory;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <header>
        <p className="eyebrow">
          {locale === "en" ? "Care pathway" : "Gydymo kelias"}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {labels.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
          {blurb}
        </p>
      </header>

      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={labels.title}
      >
        <button
          type="button"
          role="tab"
          className={tab === "active" ? "on" : undefined}
          aria-selected={tab === "active"}
          onClick={() => setTab("active")}
        >
          {labels.active}
          <span className="visits-tab-count">{active.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "history" ? "on" : undefined}
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
        >
          {labels.history}
          <span className="visits-tab-count">{history.length}</span>
        </button>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {tab === "active" ? labels.active : labels.history}
          </h2>
          <span className="pill plain c-acc">{list.length}</span>
        </div>
        {list.length ? (
          <div className="list mt-3">
            {list.map((r) => (
              <Link
                key={r.id}
                href={`/patient/visits/${r.visitId}`}
                className="li click referral-li"
              >
                <div className="grow">
                  <b>{r.title}</b>
                  <p className="small muted m-0 mt-1">
                    {r.specialty}
                    {" · "}
                    {r.place}
                  </p>
                  <p className="small muted m-0 mt-1">
                    {labels.fromVisit}: {r.visitTitle}
                  </p>
                  {tab === "history" && r.notes ? (
                    <p className="small m-0 mt-1 text-[var(--ink-soft)]">
                      {r.notes}
                    </p>
                  ) : null}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`pill ${
                      r.status === "completed"
                        ? "c-green"
                        : r.status === "scheduled"
                          ? "c-yellow"
                          : "c-acc"
                    }`}
                  >
                    {r.statusLabel}
                  </span>
                  <p className="small muted m-0 mt-2">{r.date}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty mt-3">{empty}</div>
        )}
      </section>
    </div>
  );
}
