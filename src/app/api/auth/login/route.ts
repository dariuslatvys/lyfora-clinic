import { NextResponse } from "next/server";
import {
  loginWithPassword,
  sessionCookieName,
  buildSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { checkLoginRateLimit } from "@/lib/auth/login-rate-limit";

export async function POST(req: Request) {
  const limited = checkLoginRateLimit(req);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec || 60),
        },
      }
    );
  }

  const body = await req.json();
  const email = String(body.email || "").trim();
  const password = String(body.password || "").trim();
  const role = body.role as "patient" | "doctor" | undefined;
  const result = await loginWithPassword(email, password, role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  try {
    const { token, expiresAtMs } = buildSessionToken(result.user.id);
    const res = NextResponse.json({
      role: result.user.role,
      redirect:
        result.user.role === "doctor" ? "/doctor" : "/patient/digital-twin",
    });
    res.cookies.set(sessionCookieName, token, sessionCookieOptions(expiresAtMs));
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "session_error";
    const missingSecret = /SESSION_SECRET/i.test(message);
    return NextResponse.json(
      {
        error: missingSecret ? "missing_session_secret" : "session_error",
        message: missingSecret
          ? "SESSION_SECRET missing on server — set it in Vercel and Redeploy"
          : message,
      },
      { status: 500 }
    );
  }
}
