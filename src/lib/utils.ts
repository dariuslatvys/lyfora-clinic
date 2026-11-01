import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Display timezone for patient-facing timestamps (matches product locale). */
export const DISPLAY_TZ = "Europe/Vilnius";

/**
 * Stable SSR/client date-time formatting. Always pin timeZone so Node (UTC)
 * and the browser (Vilnius) do not hydrate-mismatch.
 */
export function formatDateTime(
  iso: string | number | Date,
  locale: "lt" | "en"
) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDate(
  iso: string | number | Date,
  locale: "lt" | "en",
  opts?: Intl.DateTimeFormatOptions
) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    timeZone: DISPLAY_TZ,
    ...opts,
  });
}
