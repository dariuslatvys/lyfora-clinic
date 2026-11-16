import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Session HMAC key.
 * Hosted / published builds require SESSION_SECRET (or LYFORA_SESSION_SECRET).
 * Locally, a random key is persisted under data/db/ (gitignored) so restarts
 * keep cookies valid without embedding a fixed secret in source.
 */
export function sessionSigningSecret(): string {
  const fromEnv =
    process.env.SESSION_SECRET?.trim() ||
    process.env.LYFORA_SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;

  // No fixed key in source. Persist a random key outside the repo (local) or
  // under /tmp (hosted) until SESSION_SECRET is provided.
  const hosted =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    !!process.env.CURSOR_APP_ID;
  const secretPath = hosted
    ? path.join("/tmp", "lyfora-session-secret")
    : path.join(process.cwd(), "data", "db", ".session-secret");

  try {
    if (fs.existsSync(secretPath)) {
      const existing = fs.readFileSync(secretPath, "utf8").trim();
      if (existing.length >= 32) return existing;
    }
  } catch {
    // fall through and recreate
  }

  const generated = randomBytes(48).toString("base64url");
  try {
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, generated, { mode: 0o600 });
  } catch {
    // /tmp or data/db may be unavailable in some sandboxes — keep in memory.
  }
  return generated;
}

/**
 * Password for local `npm run db:seed` only.
 * Never commit a known demo password that matches a shipped database.
 */
export function localSeedPassword(): string {
  const fromEnv = process.env.DEMO_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  throw new Error(
    "Set DEMO_PASSWORD before seeding (e.g. DEMO_PASSWORD='…' npm run db:seed)"
  );
}
