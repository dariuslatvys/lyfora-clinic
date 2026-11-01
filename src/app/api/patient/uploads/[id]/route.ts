import fs from "fs";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { patientUploads } from "@/lib/db/schema";
import {
  deletePatientUpload,
  resolveUploadFile,
} from "@/lib/health/uploads";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const row = getDb()
    .select()
    .from(patientUploads)
    .where(
      and(
        eq(patientUploads.id, id),
        eq(patientUploads.patientId, current.patient.id)
      )
    )
    .get();
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const full = resolveUploadFile(current.patient.id, row.storedName);
  if (!full) {
    return NextResponse.json({ error: "missing_file" }, { status: 404 });
  }
  const buf = fs.readFileSync(full);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": row.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        row.originalName
      )}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "private, max-age=60",
    },
  });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const current = await getCurrentUser();
  if (!current?.patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureSchema();
  const ok = deletePatientUpload(current.patient.id, id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
