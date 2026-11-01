import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import type { Locale } from "@/lib/i18n/dictionary";
import {
  runPatientSearch,
  searchKindLabel,
} from "@/lib/health/global-search";

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current?.patient || current.user.role !== "patient") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limitRaw = Number(url.searchParams.get("limit") || "24");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(40, Math.max(1, Math.floor(limitRaw)))
    : 24;

  if (q.length < 2) {
    return NextResponse.json({ q, results: [] });
  }
  if (q.length > 120) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  const locale = (current.user.locale as Locale) || "lt";
  const sex = (current.patient.sex as "male" | "female") || "male";
  const patientName = patientDisplayName(current.patient.sex, locale);

  const hits = runPatientSearch({
    patientId: current.patient.id,
    locale,
    sex,
    patientName,
    query: q,
    limit,
  });

  return NextResponse.json({
    q,
    results: hits.map((h) => ({
      ...h,
      kindLabel: searchKindLabel(h.kind, locale),
    })),
  });
}
