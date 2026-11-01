"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function DoctorRail({
  labels,
  doctorName,
  logoutLabel,
  logoutAction,
}: {
  labels: Dictionary;
  doctorName: string;
  logoutLabel: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith("/doctor");

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

      <nav className="nav" aria-label="Gydytojo meniu">
        <div className="nav-label">Meniu</div>
        <Link
          href="/doctor"
          className={cn(active && "on")}
          aria-current={active ? "page" : undefined}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="8" r="3.2" />
            <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
            <circle cx="17" cy="9" r="2.4" />
            <path d="M14.5 19a4.2 4.2 0 0 1 6 0" />
          </svg>
          <span>{labels.patientsNav}</span>
        </Link>
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
