import { NextResponse } from "next/server";
import {
  loginWithPassword,
  sessionCookieName,
  buildSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "");
  const password = String(body.password || "");
  const role = body.role as "patient" | "doctor" | undefined;
  const result = await loginWithPassword(email, password, role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const { token, expiresAtMs } = buildSessionToken(result.user.id);
  const res = NextResponse.json({
    role: result.user.role,
    redirect: result.user.role === "doctor" ? "/doctor" : "/patient/digital-twin",
  });
  res.cookies.set(sessionCookieName, token, sessionCookieOptions(expiresAtMs));
  return res;
}
