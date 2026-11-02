"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  activeDoctorRequests,
  historicalDoctorRequests,
  requestPriorityLabel,
  requestStatusLabel,
  type DoctorRequest,
} from "@/lib/doctor/doctor-requests";

export function DoctorRequestsView({ locale }: { locale: "lt" | "en" }) {
  const sp = useSearchParams();
  const [tab, setTab] = useState<"active" | "history">("active");
  const active = useMemo(() => activeDoctorRequests(), []);
  const history = useMemo(() => historicalDoctorRequests(), []);
  const list = tab === "active" ? active : history;
  const [selectedId, setSelectedId] = useState<string | null>(
    list[0]?.id || null
  );

  useEffect(() => {
    const id = sp.get("id");
    if (!id) return;
    if (active.some((r) => r.id === id)) {
      setTab("active");
      setSelectedId(id);
    } else if (history.some((r) => r.id === id)) {
      setTab("history");
      setSelectedId(id);
    }
  }, [sp, active, history]);

  const selected =
    list.find((r) => r.id === selectedId) || list[0] || null;

  const copy =
    locale === "en"
      ? {
          eyebrow: "Written consultations",
          title: "Requests",
          blurb:
            "Patient questions assigned to you. Aim to answer within 24 hours. Active requests show live status; history keeps closed threads.",
          active: "Active",
          history: "History",
          emptyActive: "No active requests.",
          emptyHistory: "No historical requests yet.",
          openChart: "Open chart",
          reply: "Latest reply",
          body: "Details",
          sla: "SLA",
          channel: "Channel",
          priority: "Priority",
        }
      : {
          eyebrow: "Konsultacijos raštu",
          title: "Užklausos",
          blurb:
            "Pacientų klausimai, skirti jums. Tikslas – atsakyti per 24 val. Aktyviose matote statusą; istorijoje — uždarytos ir atsakyta.",
          active: "Aktyvios",
          history: "Istorinės",
          emptyActive: "Aktyvių užklausų nėra.",
          emptyHistory: "Istorinių užklausų dar nėra.",
          openChart: "Atidaryti kortelę",
          reply: "Paskutinis atsakymas",
          body: "Detalės",
          sla: "SLA",
          channel: "Kanalas",
          priority: "Prioritetas",
        };

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {copy.title}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-[var(--muted)]">
            {copy.blurb}
          </p>
        </div>
      </div>

      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={copy.title}
      >
        <button
          type="button"
          role="tab"
          className={tab === "active" ? "on" : undefined}
          aria-selected={tab === "active"}
          onClick={() => {
            setTab("active");
            setSelectedId(active[0]?.id || null);
          }}
        >
          {copy.active}
          <span className="visits-tab-count">{active.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "history" ? "on" : undefined}
          aria-selected={tab === "history"}
          onClick={() => {
            setTab("history");
            setSelectedId(history[0]?.id || null);
          }}
        >
          {copy.history}
          <span className="visits-tab-count">{history.length}</span>
        </button>
      </div>

      {!list.length ? (
        <div className="empty">
          {tab === "active" ? copy.emptyActive : copy.emptyHistory}
        </div>
      ) : (
        <div className="doctor-req-split">
          <section className="card">
            <div className="stack" style={{ gap: 6 }}>
              {list.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={
                    selected?.id === r.id
                      ? "doctor-req-li on"
                      : "doctor-req-li"
                  }
                  onClick={() => setSelectedId(r.id)}
                >
                  <div className="doctor-req-li-main">
                    <b>
                      {locale === "en" ? r.subjectEn : r.subjectLt}
                    </b>
                    <span className="xs muted">
                      {locale === "en" ? r.patientNameEn : r.patientNameLt}
                      {" · "}
                      {new Date(r.updatedAt).toLocaleString(
                        locale === "en" ? "en-GB" : "lt-LT",
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>
                  <span
                    className={`pill ${
                      r.status === "waiting"
                        ? "c-yellow"
                        : r.status === "in_progress"
                          ? "c-acc"
                          : r.status === "answered"
                            ? "c-green"
                            : "c-none"
                    }`}
                  >
                    {requestStatusLabel(r.status, locale)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {selected ? (
            <RequestDetail locale={locale} r={selected} copy={copy} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function RequestDetail({
  locale,
  r,
  copy,
}: {
  locale: "lt" | "en";
  r: DoctorRequest;
  copy: {
    openChart: string;
    reply: string;
    body: string;
    sla: string;
    channel: string;
    priority: string;
  };
}) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h3 className="m-0">
            {locale === "en" ? r.subjectEn : r.subjectLt}
          </h3>
          <p className="small muted m-0 mt-1">
            {locale === "en" ? r.patientNameEn : r.patientNameLt}
            {" · "}
            {locale === "en" ? r.specialtyEn : r.specialtyLt}
          </p>
        </div>
        <Link
          href={`/doctor/patients/${r.patientId}`}
          className="btn ghost sm"
        >
          {copy.openChart}
        </Link>
      </div>

      <div className="doctor-req-meta">
        <span className="detail-chip">
          {copy.priority}: {requestPriorityLabel(r.priority, locale)}
        </span>
        <span className="detail-chip">
          {copy.sla}: {r.slaHours}h
        </span>
        <span className="detail-chip">
          {copy.channel}: {r.channel}
        </span>
        <span
          className={`pill ${
            r.status === "waiting"
              ? "c-yellow"
              : r.status === "in_progress"
                ? "c-acc"
                : r.status === "answered"
                  ? "c-green"
                  : "c-none"
          }`}
        >
          {requestStatusLabel(r.status, locale)}
        </span>
      </div>

      <div className="hc-link-row mt-3" style={{ gap: 6 }}>
        {(locale === "en" ? r.tagsEn : r.tagsLt).map((t) => (
          <span key={t} className="pill plain c-acc">
            {t}
          </span>
        ))}
      </div>

      <p className="eyebrow mt-4 mb-2">{copy.body}</p>
      <p className="small m-0 whitespace-pre-wrap text-[var(--ink-soft)]">
        {locale === "en" ? r.bodyEn : r.bodyLt}
      </p>

      {r.replyLt || r.replyEn ? (
        <>
          <p className="eyebrow mt-4 mb-2">{copy.reply}</p>
          <p className="small m-0 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 whitespace-pre-wrap">
            {locale === "en" ? r.replyEn : r.replyLt}
          </p>
        </>
      ) : null}

      <p className="xs muted mt-4 mb-0">
        {locale === "en" ? "Updated" : "Atnaujinta"}:{" "}
        {new Date(r.updatedAt).toLocaleString(
          locale === "en" ? "en-GB" : "lt-LT"
        )}
      </p>
    </section>
  );
}
