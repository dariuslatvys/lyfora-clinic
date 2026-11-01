import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { sessions, users, patients } from "@/lib/db/schema";

const COOKIE = "lyfora_session";

export async function createSession(userId: string) {
  ensureSchema();
  const db = getDb();
  const id = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  db.insert(sessions)
    .values({ id, userId, expiresAt: expires })
    .run();
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
  return id;
}

export async function destroySession() {
  ensureSchema();
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) {
    const db = getDb();
    db.delete(sessions).where(eq(sessions.id, id)).run();
    jar.delete(COOKIE);
  }
}

export async function getCurrentUser() {
  ensureSchema();
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  const db = getDb();
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    db.delete(sessions).where(eq(sessions.id, id)).run();
    return null;
  }
  const user = db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user) return null;
  const patient =
    user.role === "patient"
      ? db.select().from(patients).where(eq(patients.userId, user.id)).get()
      : null;
  return { user, patient };
}

export async function loginWithPassword(
  email: string,
  password: string,
  role?: "patient" | "doctor"
) {
  ensureSchema();
  const db = getDb();
  const user = db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .get();
  if (!user) return { ok: false as const, error: "invalid" };
  if (role && user.role !== role) return { ok: false as const, error: "role" };
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return { ok: false as const, error: "invalid" };
  await createSession(user.id);
  return { ok: true as const, user };
}
