export const localeCookieName = "lyfora_locale";

export function localeCookieOptions() {
  return {
    httpOnly: false as const,
    sameSite: "lax" as const,
    secure:
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function parseLocaleCookie(
  value: string | undefined
): "lt" | "en" | null {
  if (value === "lt" || value === "en") return value;
  return null;
}
