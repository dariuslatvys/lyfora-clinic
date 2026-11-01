"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

const items = [
  { href: "/patient/digital-twin", key: "overview" as const },
  { href: "/patient/health-card", key: "healthCard" as const },
  { href: "/patient/uploads", key: "uploads" as const },
  { href: "/patient/labs", key: "labs" as const },
  { href: "/patient/visits", key: "visits" as const },
  { href: "/patient/questions", key: "questions" as const },
  { href: "/patient/recommendations", key: "recommendations" as const },
  { href: "/patient/marketplace", key: "marketplace" as const },
  { href: "/patient/analytics", key: "analytics" as const },
  { href: "/patient/privacy", key: "privacy" as const },
];

export function PatientSidebar({ labels }: { labels: Dictionary }) {
  const pathname = usePathname();
  return (
    <aside className="patient-sidebar">
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--ink-soft)] hover:bg-black/5"
              )}
            >
              {labels[item.key]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
