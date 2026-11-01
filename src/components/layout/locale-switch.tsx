"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LocaleSwitch({ locale }: { locale: "lt" | "en" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function setLocale(next: "lt" | "en") {
    start(async () => {
      await fetch("/api/auth/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-1 text-xs">
      {(["lt", "en"] as const).map((l) => (
        <button
          key={l}
          disabled={pending}
          onClick={() => setLocale(l)}
          className={`rounded px-2 py-1 uppercase tracking-wide ${
            locale === l
              ? "bg-[var(--ink)] text-white"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
