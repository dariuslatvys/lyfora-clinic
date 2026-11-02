import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import {
  createClinicVisit,
  formatClinicVisitWhen,
  listClinicVisitAttachments,
  listClinicVisitsForPatient,
  type ClinicVisitMode,
} from "@/lib/health/clinic-visits";
import { UPLOAD_CATEGORIES, type UploadCategory } from "@/lib/health/uploads";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");
  if (!patientId) {
    return NextResponse.json({ error: "missing_patient" }, { status: 400 });
  }
  const visits = listClinicVisitsForPatient(patientId).map((v) => ({
    ...v,
    whenLt: formatClinicVisitWhen(v, "lt"),
    whenEn: formatClinicVisitWhen(v, "en"),
    attachments: listClinicVisitAttachments(patientId, v.id),
  }));
  return NextResponse.json({ visits });
}

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const patientId = String(form.get("patientId") || "");
  const date = String(form.get("date") || "");
  const time = String(form.get("time") || "");
  const title = String(form.get("title") || "").trim();
  const reason = String(form.get("reason") || "").trim();
  const mode = String(form.get("mode") || "in_person") as ClinicVisitMode;
  const placeLt = form.get("placeLt") ? String(form.get("placeLt")) : null;
  const placeEn = form.get("placeEn") ? String(form.get("placeEn")) : null;
  const videoPlatform = form.get("videoPlatform")
    ? String(form.get("videoPlatform"))
    : null;
  const videoUrl = form.get("videoUrl") ? String(form.get("videoUrl")) : null;

  if (!patientId || !date || !time) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!["in_person", "video", "phone"].includes(mode)) {
    return NextResponse.json({ error: "bad_mode" }, { status: 400 });
  }

  const patient = getDb()
    .select()
    .from(patients)
    .where(eq(patients.id, patientId))
    .get();
  if (!patient) {
    return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
  }

  const files: Array<{
    originalName: string;
    mimeType: string | null;
    bytes: Buffer;
    category?: UploadCategory;
  }> = [];

  for (const [key, value] of form.entries()) {
    if (key !== "file" && !key.startsWith("file")) continue;
    if (!(value instanceof File)) continue;
    if (value.size <= 0) continue;
    if (value.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "too_large" }, { status: 413 });
    }
    const bytes = Buffer.from(await value.arrayBuffer());
    const categoryRaw = String(form.get("category") || "other");
    const category = (
      UPLOAD_CATEGORIES.includes(categoryRaw as UploadCategory)
        ? categoryRaw
        : "other"
    ) as UploadCategory;
    files.push({
      originalName: value.name || "upload.bin",
      mimeType: value.type || null,
      bytes,
      category,
    });
  }

  const titleLt = title || "Klinikinis vizitas";
  const titleEn = title || "Clinic visit";
  const { visit, attachments } = createClinicVisit({
    patientId,
    date,
    time,
    titleLt,
    titleEn,
    mode,
    placeLt,
    placeEn,
    reasonLt: reason || null,
    reasonEn: reason || null,
    videoPlatform,
    videoUrl,
    files,
  });

  return NextResponse.json({
    ok: true,
    visit: {
      ...visit,
      whenLt: formatClinicVisitWhen(visit, "lt"),
      whenEn: formatClinicVisitWhen(visit, "en"),
      attachments,
    },
  });
}
