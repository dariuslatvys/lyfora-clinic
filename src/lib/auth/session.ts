import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { users, patients } from "@/lib/db/schema";

export const sessionCookieName = "lyfora_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 14;

/** Demo-safe secret; override with SESSION_SECRET in production if desired. */
function secret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.LYFORA_SESSION_SECRET ||
    "lyfora-demo-session-v1"
  );
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function buildSessionToken(userId: string, now = Date.now()) {
  const expiresAtMs = now + TTL_MS;
  const payload = `${userId}.${expiresAtMs}`;
  const token = `${payload}.${sign(payload)}`;
  return { token, expiresAtMs };
}

function decodeSession(token: string): { userId: string; expiresAtMs: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  const expiresAtMs = Number(expStr);
  if (!userId || !Number.isFinite(expiresAtMs)) return null;
  const payload = `${userId}.${expStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  if (expiresAtMs < Date.now()) return null;
  return { userId, expiresAtMs };
}

function cookieSecure() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function sessionCookieOptions(expiresAtMs: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/",
    expires: new Date(expiresAtMs),
  };
}

export async function createSession(userId: string) {
  const { token, expiresAtMs } = buildSessionToken(userId);
  const jar = await cookies();
  jar.set(sessionCookieName, token, sessionCookieOptions(expiresAtMs));
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(sessionCookieName);
}

export async function getCurrentUser() {
  ensureSchema();
  const jar = await cookies();
  const token = jar.get(sessionCookieName)?.value;
  if (!token) return null;
  const parsed = decodeSession(token);
  if (!parsed) return null;

  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, parsed.userId)).get();
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
  return { ok: true as const, user };
}
