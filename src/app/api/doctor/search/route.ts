import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/dictionary";
import { runDoctorSearch } from "@/lib/doctor/doctor-search";

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limitRaw = Number(url.searchParams.get("limit") || "24");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(40, Math.max(1, Math.floor(limitRaw)))
    : 24;

  if (q.length < 2) return NextResponse.json({ q, results: [] });
  if (q.length > 120) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  const locale = (current.user.locale as Locale) || "lt";
  const results = runDoctorSearch({ locale, query: q, limit });
  return NextResponse.json({ q, results });
}
