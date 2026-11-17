import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRequestRateLimit } from "@/lib/auth/request-rate-limit";
import { ensureSchema, getDb } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import { buildPatientAiReply } from "@/lib/health/patient-ai";
import { tryLlmPatientReply } from "@/lib/health/llm-ai";
import type { Locale } from "@/lib/i18n/dictionary";

const AI_WINDOW_MS = 15 * 60 * 1000;
const AI_MAX = 40;

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limited = checkRequestRateLimit({
    key: `ai:doctor:${current.user.id}`,
    windowMs: AI_WINDOW_MS,
    max: AI_MAX,
  });
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

  let body: { message?: string; patientId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message || message.length > 4000) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const patientId =
    typeof body.patientId === "string" && body.patientId.trim()
      ? body.patientId.trim()
      : "patient_male";

  ensureSchema();
  const patient = getDb()
    .select({ id: patients.id })
    .from(patients)
    .where(eq(patients.id, patientId))
    .get();
  if (!patient) {
    return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
  }

  const locale = (current.user.locale as Locale) || "lt";
  const llm = await tryLlmPatientReply({ patientId, locale, message });
  const result =
    llm ||
    buildPatientAiReply({
      patientId,
      locale,
      message,
    });

  return NextResponse.json(result);
}
