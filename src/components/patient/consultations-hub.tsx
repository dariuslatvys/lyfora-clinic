"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ConsultListItem = {
  id: string;
  title: string;
  reason: string;
  doctor: string;
  specialty: string;
  when: string;
  place: string;
  mode: string;
  urgency: "urgent" | "planned";
  visitHref?: string;
};

export type ChatListItem = {
  id: string;
  title: string;
  doctor: string;
  specialty: string;
  preview: string;
  when: string;
  unread?: boolean;
};

export function ConsultationsHub({
  locale,
  upcoming,
  past,
  chats,
  labels,
}: {
  locale: "lt" | "en";
  upcoming: ConsultListItem[];
  past: ConsultListItem[];
  chats: ChatListItem[];
  labels: {
    consultations: string;
    urgentConsult: string;
    bookVisit: string;
    askDoctor247: string;
  };
}) {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            upcoming: "Upcoming consultations",
            history: "Consultation history",
            emptyUp: "No upcoming consultations.",
            emptyHist: "No past consultations yet.",
            urgent: "Urgent",
            planned: "Planned",
            chats: "Online chat history",
            chatsBlurb:
              "Written conversations with your clinicians — open a thread to continue.",
            unread: "New",
            openChat: "Open chat",
          }
        : {
            upcoming: "Būsimos konsultacijos",
            history: "Konsultacijų istorija",
            emptyUp: "Būsimų konsultacijų nėra.",
            emptyHist: "Konsultacijų istorijos dar nėra.",
            urgent: "Skubi",
            planned: "Planinė",
            chats: "Online pokalbių istorija",
            chatsBlurb:
              "Rašytiniai pokalbiai su gydytojais — atidarykite giją ir tęskite.",
            unread: "Nauja",
            openChat: "Atidaryti pokalbį",
          },
    [locale]
  );

  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="stack" style={{ gap: 18 }}>
      <section className="panel">
        <p className="eyebrow">24/7</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {labels.consultations}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)] mb-0">
          {locale === "en"
            ? "Booked consultations, urgent slots, and written chats with your clinic team."
            : "Suplanuotos ir skubios konsultacijos bei rašytiniai pokalbiai su klinikos komanda."}
        </p>
      </section>

      <div className="consult-grid">
        <Link href="/patient/urgent" className="consult-card primary">
          <b>{labels.urgentConsult}</b>
          <p>
            {locale === "en"
              ? "Priority contact for urgent but non-emergency concerns."
              : "Prioritetinis ryšys skubiems, bet ne gyvybei pavojingiems klausimams."}
          </p>
          <span className="consult-cta">
            {locale === "en" ? "Open" : "Atidaryti"} →
          </span>
        </Link>
        <Link href="/patient/visits" className="consult-card">
          <b>{labels.bookVisit}</b>
          <p>
            {locale === "en"
              ? "Choose a time for an in-person or remote visit."
              : "Pasirinkite laiką vizitui ar nuotolinei konsultacijai."}
          </p>
          <span className="consult-cta">
            {locale === "en" ? "Open" : "Atidaryti"} →
          </span>
        </Link>
        <Link href="/patient/questions" className="consult-card">
          <b>{labels.askDoctor247}</b>
          <p>
            {locale === "en"
              ? "Start a new written question any time."
              : "Pradėkite naują rašytinį klausimą bet kuriuo metu."}
          </p>
          <span className="consult-cta">
            {locale === "en" ? "Open" : "Atidaryti"} →
          </span>
        </Link>
      </div>

      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={labels.consultations}
      >
        <button
          type="button"
          role="tab"
          className={tab === "upcoming" ? "on" : undefined}
          aria-selected={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
        >
          {copy.upcoming}
          <span className="visits-tab-count">{upcoming.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "history" ? "on" : undefined}
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
        >
          {copy.history}
          <span className="visits-tab-count">{past.length}</span>
        </button>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {tab === "upcoming" ? copy.upcoming : copy.history}
          </h2>
          <span className="pill plain c-acc">{list.length}</span>
        </div>
        {list.length ? (
          <div className="list mt-2">
            {list.map((c) => (
              <Link
                key={c.id}
                href={`/patient/consultations/${c.id}`}
                className="li click consult-li"
              >
                <div className="grow">
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <b>{c.title}</b>
                    <span
                      className={`pill ${
                        c.urgency === "urgent" ? "c-orange" : "c-green"
                      }`}
                    >
                      {c.urgency === "urgent" ? copy.urgent : copy.planned}
                    </span>
                  </div>
                  <p className="small muted m-0 mt-1">
                    {c.doctor} · {c.specialty} · {c.mode}
                  </p>
                  <p className="small m-0 mt-1 text-[var(--ink-soft)]">
                    {c.reason}
                  </p>
                  <p className="small muted m-0 mt-1">{c.place}</p>
                </div>
                <span className="small muted whitespace-nowrap">{c.when}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">
            {tab === "upcoming" ? copy.emptyUp : copy.emptyHist}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {copy.chats}
          </h2>
          <span className="pill plain c-acc">{chats.length}</span>
        </div>
        <p className="small muted mt-1 mb-3">{copy.chatsBlurb}</p>
        <div className="list">
          {chats.map((t) => (
            <Link
              key={t.id}
              href={`/patient/consultations/chat/${t.id}`}
              className="li click chat-li"
            >
              <div className="grow">
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <b>{t.title}</b>
                  {t.unread ? (
                    <span className="pill c-orange">{copy.unread}</span>
                  ) : null}
                </div>
                <p className="small muted m-0 mt-1">
                  {t.doctor} · {t.specialty}
                </p>
                <p className="small m-0 mt-1 text-[var(--ink-soft)] line-clamp-2">
                  {t.preview}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="small muted m-0">{t.when}</p>
                <span className="btn ghost sm mt-2 inline-flex">{copy.openChat}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
