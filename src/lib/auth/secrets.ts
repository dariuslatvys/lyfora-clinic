import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

function isHostedRuntime() {
  return (
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    !!process.env.CURSOR_APP_ID
  );
}

/**
 * Session HMAC key.
 * Hosted runtimes (Vercel / published app) MUST set SESSION_SECRET — a
 * per-instance /tmp key breaks login because each serverless invoke signs
 * with a different secret.
 * Locally, a random key is persisted under data/db/ (gitignored).
 */
export function sessionSigningSecret(): string {
  const fromEnv =
    process.env.SESSION_SECRET?.trim() ||
    process.env.LYFORA_SESSION_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (isHostedRuntime()) {
    throw new Error(
      "SESSION_SECRET is missing. Set it in the host environment and redeploy."
    );
  }

  const secretPath = path.join(process.cwd(), "data", "db", ".session-secret");
  try {
    if (fs.existsSync(secretPath)) {
      const existing = fs.readFileSync(secretPath, "utf8").trim();
      if (existing.length >= 32) return existing;
    }
  } catch {
    // fall through and recreate
  }

  const generated = randomBytes(48).toString("base64url");
  fs.mkdirSync(path.dirname(secretPath), { recursive: true });
  fs.writeFileSync(secretPath, generated, { mode: 0o600 });
  return generated;
}

/**
 * Password for local `npm run db:seed` / hosted DEMO_PASSWORD unlock.
 * Never commit a known demo password that matches a shipped database.
 */
export function localSeedPassword(): string {
  const fromEnv = process.env.DEMO_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  throw new Error(
    "Set DEMO_PASSWORD before seeding (e.g. DEMO_PASSWORD='…' npm run db:seed)"
  );
}
