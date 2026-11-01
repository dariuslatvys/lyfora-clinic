import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, ensureSchema } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const { locale } = await req.json();
  if (locale !== "lt" && locale !== "en") {
    return NextResponse.json({ error: "bad_locale" }, { status: 400 });
  }
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "auth" }, { status: 401 });
  ensureSchema();
  const db = getDb();
  db.update(users).set({ locale }).where(eq(users.id, current.user.id)).run();
  return NextResponse.json({ ok: true });
}
