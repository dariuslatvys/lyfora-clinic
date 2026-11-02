"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { activeDoctorRequests } from "@/lib/doctor/doctor-requests";

type Notice = {
  id: string;
  title: string;
  body: string;
  when: string;
  href: string;
  unread?: boolean;
};

function demoNotices(locale: "lt" | "en"): Notice[] {
  const waiting = activeDoctorRequests().length;
  return locale === "en"
    ? [
        {
          id: "dn1",
          title: `${waiting} open request(s)`,
          body: "Patient written questions waiting in Requests.",
          when: "now",
          href: "/doctor/requests",
          unread: true,
        },
        {
          id: "dn2",
          title: "Today’s schedule",
          body: "Review today’s appointments in Calendar.",
          when: "1 h",
          href: "/doctor/calendar",
          unread: true,
        },
        {
          id: "dn3",
          title: "Critical signal — MYBPC3",
          body: "John Doe cardiovascular NGS finding needs review.",
          when: "3 h",
          href: "/doctor/patients/patient_male",
          unread: true,
        },
        {
          id: "dn4",
          title: "New labs synced",
          body: "Lipid panel available on the male demo chart.",
          when: "Yesterday",
          href: "/doctor/patients/patient_male",
        },
      ]
    : [
        {
          id: "dn1",
          title: `${waiting} atvira(-os) užklausa(-os)`,
          body: "Pacientų klausimai raštu laukia skiltyje Užklausos.",
          when: "dabar",
          href: "/doctor/requests",
          unread: true,
        },
        {
          id: "dn2",
          title: "Šiandienos darbotvarkė",
          body: "Peržiūrėkite šiandienos vizitus Kalendoriuje.",
          when: "prieš 1 val.",
          href: "/doctor/calendar",
          unread: true,
        },
        {
          id: "dn3",
          title: "Kritinis signalas — MYBPC3",
          body: "Jono Jonaičio NGS radinys reikalauja peržiūros.",
          when: "prieš 3 val.",
          href: "/doctor/patients/patient_male",
          unread: true,
        },
        {
          id: "dn4",
          title: "Nauji tyrimai",
          body: "Lipidų panelė sinchronizuota vyro demo kortelėje.",
          when: "vakar",
          href: "/doctor/patients/patient_male",
        },
      ];
}

export function DoctorTopbarActions({ locale }: { locale: "lt" | "en" }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const notices = useMemo(() => demoNotices(locale), [locale]);
  const unread = notices.filter((n) => n.unread && !readIds.has(n.id)).length;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const copy =
    locale === "en"
      ? { notices: "Notifications", markAll: "Mark all read", empty: "No notifications" }
      : {
          notices: "Pranešimai",
          markAll: "Žymėti visus skaitytais",
          empty: "Pranešimų nėra",
        };

  return (
    <div className="topbar-actions">
      <div className="topbar-notice" ref={rootRef}>
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label={copy.notices}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
          </svg>
          {unread > 0 ? (
            <span className="topbar-badge danger" aria-hidden="true">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
        {open ? (
          <div className="topbar-notice-panel" id={panelId} role="dialog">
            <div className="topbar-notice-head">
              <b>{copy.notices}</b>
              {unread > 0 ? (
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => setReadIds(new Set(notices.map((n) => n.id)))}
                >
                  {copy.markAll}
                </button>
              ) : null}
            </div>
            <div className="topbar-notice-list">
              {notices.map((n) => {
                const isUnread = !!n.unread && !readIds.has(n.id);
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    className={
                      isUnread ? "topbar-notice-item unread" : "topbar-notice-item"
                    }
                    onClick={() => {
                      setReadIds((prev) => new Set(prev).add(n.id));
                      setOpen(false);
                    }}
                  >
                    <span className="topbar-notice-main">
                      <b>{n.title}</b>
                      <em>{n.body}</em>
                    </span>
                    <span className="topbar-notice-when">{n.when}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
