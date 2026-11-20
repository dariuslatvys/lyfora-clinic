import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, ensureSchema } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { localeCookieName, localeCookieOptions } from "@/lib/auth/locale-cookie";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const locale = body?.locale;
  if (locale !== "lt" && locale !== "en") {
    return NextResponse.json({ error: "bad_locale" }, { status: 400 });
  }
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "auth" }, { status: 401 });

  try {
    ensureSchema();
    const db = getDb();
    db.update(users).set({ locale }).where(eq(users.id, current.user.id)).run();
  } catch {
    // Writable DB may be unavailable on some hosts — cookie still switches UI.
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(localeCookieName, locale, localeCookieOptions());
  return res;
}
