"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LocaleSwitch({ locale }: { locale: "lt" | "en" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [optimistic, setOptimistic] = useState<"lt" | "en" | null>(null);
  const active = optimistic ?? locale;

  async function setLocale(next: "lt" | "en") {
    if (next === active || pending) return;
    setPending(true);
    setOptimistic(next);
    try {
      const res = await fetch("/api/auth/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locale: next }),
        cache: "no-store",
      });
      if (!res.ok) {
        setOptimistic(null);
        return;
      }
      router.refresh();
      // Hard navigate so the patient/doctor shell re-renders in the new language.
      window.location.assign(
        `${window.location.pathname}${window.location.search}`
      );
    } catch {
      setOptimistic(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-1 text-xs"
      role="group"
      aria-label="Language"
    >
      {(["lt", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          aria-pressed={active === l}
          onClick={() => setLocale(l)}
          className={`rounded px-2 py-1 uppercase tracking-wide ${
            active === l
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
