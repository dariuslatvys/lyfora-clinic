import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema } from "@/lib/db";
import {
  UPLOAD_CATEGORIES,
  ensureDemoUploadsSeeded,
  formatBytes,
  listPatientUploads,
  savePatientUpload,
  type UploadCategory,
} from "@/lib/health/uploads";

export const runtime = "nodejs";

export async function GET() {
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();
  ensureDemoUploadsSeeded(current.patient.id);
  const rows = listPatientUploads(current.patient.id).map((r) => ({
    id: r.id,
    category: r.category,
    originalName: r.originalName,
    sizeBytes: r.sizeBytes,
    sizeLabel: formatBytes(r.sizeBytes || 0),
    mimeType: r.mimeType,
    note: r.note,
    createdAt: r.createdAt,
    href: `/api/patient/uploads/${r.id}`,
  }));
  return NextResponse.json({ uploads: rows, categories: UPLOAD_CATEGORIES });
}

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const category = String(form.get("category") || "other") as UploadCategory;
  if (!UPLOAD_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "bad_category" }, { status: 400 });
  }
  const note = form.get("note") ? String(form.get("note")) : null;
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.size <= 0) {
    return NextResponse.json({ error: "empty_file" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const saved = savePatientUpload({
    patientId: current.patient.id,
    category,
    originalName: file.name || "upload.bin",
    mimeType: file.type || null,
    bytes,
    note,
  });

  return NextResponse.json({
    ok: true,
    upload: {
      ...saved,
      sizeLabel: formatBytes(saved.sizeBytes),
      href: `/api/patient/uploads/${saved.id}`,
    },
  });
}
