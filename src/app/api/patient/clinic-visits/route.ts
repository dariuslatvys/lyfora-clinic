import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db";
import {
  formatClinicVisitWhen,
  listClinicVisitAttachments,
  listClinicVisitsForPatient,
} from "@/lib/health/clinic-visits";

export const runtime = "nodejs";

export async function GET() {
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const visits = listClinicVisitsForPatient(current.patient.id).map((v) => ({
    ...v,
    whenLt: formatClinicVisitWhen(v, "lt"),
    whenEn: formatClinicVisitWhen(v, "en"),
    attachments: listClinicVisitAttachments(current.patient!.id, v.id),
  }));
  return NextResponse.json({ visits });
}
