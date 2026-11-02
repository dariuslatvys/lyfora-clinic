import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildPatientAiReply } from "@/lib/health/patient-ai";
import type { Locale } from "@/lib/i18n/dictionary";

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  const locale = (current.user.locale as Locale) || "lt";
  const result = buildPatientAiReply({
    patientId,
    locale,
    message,
  });

  return NextResponse.json(result);
}
