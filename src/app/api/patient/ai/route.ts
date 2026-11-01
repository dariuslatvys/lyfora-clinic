import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildPatientAiReply } from "@/lib/health/patient-ai";
import type { Locale } from "@/lib/i18n/dictionary";

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current?.patient || current.user.role !== "patient") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { message?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = (body.message || "").trim();
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const locale = (current.user.locale as Locale) || "lt";
  const result = buildPatientAiReply({
    patientId: current.patient.id,
    locale,
    message,
  });

  return NextResponse.json(result);
}
