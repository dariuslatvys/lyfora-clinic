"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { activeDoctorRequests } from "@/lib/doctor/doctor-requests";

const items: Array<{
  href: string;
  key: keyof Dictionary | "workday" | "calendar" | "requests" | "sickLeave";
  labelLt: string;
  labelEn: string;
  icon: string;
  match?: (path: string) => boolean;
}> = [
  {
    href: "/doctor",
    key: "workday",
    labelLt: "Darbo diena",
    labelEn: "Workday",
    icon: "home",
    match: (p) => p === "/doctor",
  },
  {
    href: "/doctor/patients",
    key: "patientsNav",
    labelLt: "Pacientai",
    labelEn: "Patients",
    icon: "users",
    match: (p) => p.startsWith("/doctor/patients"),
  },
  {
    href: "/doctor/calendar",
    key: "calendar",
    labelLt: "Kalendorius",
    labelEn: "Calendar",
    icon: "cal",
    match: (p) => p.startsWith("/doctor/calendar"),
  },
  {
    href: "/doctor/requests",
    key: "requests",
    labelLt: "Užklausos",
    labelEn: "Requests",
    icon: "inbox",
    match: (p) => p.startsWith("/doctor/requests"),
  },
  {
    href: "/doctor/sick-leave",
    key: "sickLeave",
    labelLt: "Nedarbingumo biuleteniai",
    labelEn: "Sick-leave certificates",
    icon: "leave",
    match: (p) => p.startsWith("/doctor/sick-leave"),
  },
  {
    href: "/doctor/analytics",
    key: "analytics",
    labelLt: "Analitika",
    labelEn: "Analytics",
    icon: "chart",
    match: (p) => p.startsWith("/doctor/analytics"),
  },
];

const ICONS: Record<string, ReactNode> = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  users: (
    <g>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M14.5 19a4.2 4.2 0 0 1 6 0" />
    </g>
  ),
  cal: (
    <g>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </g>
  ),
  inbox: (
    <g>
      <path d="M4 6h16v12H4z" />
      <path d="M4 13h4l2 2h4l2-2h4" />
    </g>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  leave: (
    <g>
      <path d="M7 3h10v18H7z" />
      <path d="M10 7h4M10 11h4M10 15h3" />
    </g>
  ),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export function DoctorRail({
  labels,
  doctorName,
  logoutLabel,
  logoutAction,
  locale,
}: {
  labels: Dictionary;
  doctorName: string;
  logoutLabel: string;
  logoutAction: () => Promise<void>;
  locale: "lt" | "en";
}) {
  const pathname = usePathname() || "";
  const waiting = activeDoctorRequests().length;

  return (
    <aside className="rail">
      <div className="brand">
        <Link href="/" className="logo" aria-label="Lyfora home">
          <Image
            src="/brand/lyfora-logo.png"
            alt="Lyfora"
            width={140}
            height={46}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <span>{labels.doctorPortal}</span>
      </div>

      <div className="who">
        <div className="av">GR</div>
        <div style={{ minWidth: 0 }}>
          <b>{doctorName}</b>
          <span>{labels.brandDoctor}</span>
        </div>
      </div>

      <nav className="nav" aria-label={locale === "en" ? "Doctor menu" : "Gydytojo meniu"}>
        <div className="nav-label">Meniu</div>
        {items.map((item) => {
          const on = item.match ? item.match(pathname) : pathname.startsWith(item.href);
          const label =
            item.key === "patientsNav" || item.key === "analytics"
              ? String(labels[item.key])
              : locale === "en"
                ? item.labelEn
                : item.labelLt; // sickLeave / workday / calendar / requests use labelLt/En
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(on && "on")}
              aria-current={on ? "page" : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{label}</span>
              {item.href === "/doctor/requests" && waiting > 0 ? (
                <span className="visits-tab-count" style={{ marginLeft: "auto" }}>
                  {waiting}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="rail-foot">
        <div className="sync ok">
          <i />
          Demo duomenys
        </div>
        <form action={logoutAction}>
          <button type="submit">{logoutLabel}</button>
        </form>
      </div>
    </aside>
  );
}
