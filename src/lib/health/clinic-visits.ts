import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { clinicVisits, patientUploads } from "@/lib/db/schema";
import {
  formatBytes,
  savePatientUpload,
  type UploadCategory,
} from "@/lib/health/uploads";

export type ClinicVisitMode = "in_person" | "video" | "phone";

export type ClinicVisitRecord = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  titleLt: string;
  titleEn: string;
  mode: ClinicVisitMode;
  status: string;
  placeLt: string | null;
  placeEn: string | null;
  reasonLt: string | null;
  reasonEn: string | null;
  videoPlatform: string | null;
  videoUrl: string | null;
  createdAt: string;
};

export type ClinicVisitAttachment = {
  id: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  sizeLabel: string;
  note: string | null;
  createdAt: string;
  href: string;
};

export function clinicVisitUploadNote(visitId: string) {
  return `clinic_visit:${visitId}`;
}

export function listClinicVisitsForPatient(patientId: string): ClinicVisitRecord[] {
  return getDb()
    .select()
    .from(clinicVisits)
    .where(eq(clinicVisits.patientId, patientId))
    .orderBy(desc(clinicVisits.date), desc(clinicVisits.time))
    .all()
    .map((r) => ({
      ...r,
      mode: r.mode as ClinicVisitMode,
    }));
}

export function getClinicVisit(id: string): ClinicVisitRecord | null {
  const row = getDb()
    .select()
    .from(clinicVisits)
    .where(eq(clinicVisits.id, id))
    .get();
  if (!row) return null;
  return { ...row, mode: row.mode as ClinicVisitMode };
}

export function listClinicVisitAttachments(
  patientId: string,
  visitId: string
): ClinicVisitAttachment[] {
  const note = clinicVisitUploadNote(visitId);
  return getDb()
    .select()
    .from(patientUploads)
    .where(eq(patientUploads.patientId, patientId))
    .orderBy(desc(patientUploads.createdAt))
    .all()
    .filter((r) => r.note === note || r.note?.startsWith(`${note}|`))
    .map((r) => ({
      id: r.id,
      originalName: r.originalName,
      mimeType: r.mimeType,
      sizeBytes: r.sizeBytes || 0,
      sizeLabel: formatBytes(r.sizeBytes || 0),
      note: r.note,
      createdAt: r.createdAt,
      href: `/api/patient/uploads/${r.id}`,
    }));
}

export function createClinicVisit(input: {
  patientId: string;
  date: string;
  time: string;
  titleLt: string;
  titleEn: string;
  mode: ClinicVisitMode;
  placeLt?: string | null;
  placeEn?: string | null;
  reasonLt?: string | null;
  reasonEn?: string | null;
  videoPlatform?: string | null;
  videoUrl?: string | null;
  files?: Array<{
    originalName: string;
    mimeType: string | null;
    bytes: Buffer;
    category?: UploadCategory;
  }>;
}): { visit: ClinicVisitRecord; attachments: ClinicVisitAttachment[] } {
  const id = `clinic-${randomUUID()}`;
  const createdAt = new Date().toISOString();
  getDb()
    .insert(clinicVisits)
    .values({
      id,
      patientId: input.patientId,
      date: input.date,
      time: input.time,
      titleLt: input.titleLt,
      titleEn: input.titleEn,
      mode: input.mode,
      status: "upcoming",
      placeLt: input.placeLt || null,
      placeEn: input.placeEn || null,
      reasonLt: input.reasonLt || null,
      reasonEn: input.reasonEn || null,
      videoPlatform: input.videoPlatform || null,
      videoUrl: input.videoUrl || null,
      createdAt,
    })
    .run();

  const attachments: ClinicVisitAttachment[] = [];
  for (const file of input.files || []) {
    const saved = savePatientUpload({
      patientId: input.patientId,
      category: file.category || "other",
      originalName: file.originalName,
      mimeType: file.mimeType,
      bytes: file.bytes,
      note: clinicVisitUploadNote(id),
    });
    attachments.push({
      id: saved.id,
      originalName: saved.originalName,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      sizeLabel: formatBytes(saved.sizeBytes),
      note: saved.note,
      createdAt: saved.createdAt,
      href: `/api/patient/uploads/${saved.id}`,
    });
  }

  const visit = getClinicVisit(id)!;
  return { visit, attachments };
}

export function formatClinicVisitWhen(
  v: Pick<ClinicVisitRecord, "date" | "time">,
  locale: "lt" | "en"
) {
  try {
    const d = new Date(`${v.date}T${v.time}:00`);
    return d.toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return `${v.date} ${v.time}`;
  }
}
