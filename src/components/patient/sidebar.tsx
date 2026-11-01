"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

const items = [
  { href: "/patient/digital-twin", key: "navOverview" as const, icon: "home" },
  { href: "/patient/health-card", key: "healthCard" as const, icon: "card" },
  { href: "/patient/uploads", key: "uploads" as const, icon: "upload" },
  { href: "/patient/labs", key: "labs" as const, icon: "flask" },
  { href: "/patient/prescriptions", key: "prescriptions" as const, icon: "rx" },
  { href: "/patient/integrations", key: "integrations" as const, icon: "plug" },
  { href: "/patient/visits", key: "visits" as const, icon: "cal" },
  { href: "/patient/questions", key: "questions" as const, icon: "chat" },
  { href: "/patient/urgent", key: "urgentConsult" as const, icon: "alert" },
  { href: "/patient/recommendations", key: "recommendations" as const, icon: "bulb" },
  { href: "/patient/marketplace", key: "marketplace" as const, icon: "cart" },
  { href: "/patient/analytics", key: "analytics" as const, icon: "chart" },
  { href: "/patient/privacy", key: "privacy" as const, icon: "shield" },
];

const ICONS: Record<string, ReactNode> = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  card: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h5M7 13h10M7 17h6" />
    </>
  ),
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  rx: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h5M12 12v5M10 14l4 3" />
    </>
  ),
  plug: (
    <>
      <path d="M9 7V3M15 7V3M8 7h8v4a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4V7z" />
      <path d="M12 15v6" />
    </>
  ),
  cal: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  alert: (
    <>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  bulb: (
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  ),
  cart: (
    <>
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function PatientRail({
  labels,
  patientName,
  sexLabel,
  logoutLabel,
  logoutAction,
}: {
  labels: Dictionary;
  patientName: string;
  sexLabel: string;
  logoutLabel: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="rail">
      <div className="brand">
        <Link href="/patient/digital-twin" className="logo">
          <Image
            src="/brand/lyfora-logo.png"
            alt="Lyfora"
            width={140}
            height={46}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <span>{labels.patientPortal}</span>
      </div>

      <div className="who">
        <div className="av">{initials(patientName)}</div>
        <div style={{ minWidth: 0 }}>
          <b>{patientName}</b>
          <span>{sexLabel}</span>
        </div>
      </div>

      <nav className="nav" aria-label="Pagrindinis meniu">
        <div className="nav-label">Meniu</div>
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(active && "on")}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{labels[item.key]}</span>
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
