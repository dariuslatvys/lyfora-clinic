import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { getDb, getSqlite } from "@/lib/db";
import { patientUploads } from "@/lib/db/schema";

export const UPLOAD_CATEGORIES = [
  "labs",
  "vaccines",
  "genetics",
  "imaging",
  "other",
] as const;

export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

export function uploadsRoot() {
  if (process.env.VERCEL) return path.join("/tmp", "lyfora-uploads");
  return path.join(process.cwd(), "data", "uploads");
}

export function patientUploadDir(patientId: string) {
  return path.join(uploadsRoot(), patientId);
}

export function listPatientUploads(patientId: string) {
  const db = getDb();
  return db
    .select()
    .from(patientUploads)
    .where(eq(patientUploads.patientId, patientId))
    .orderBy(desc(patientUploads.createdAt))
    .all();
}

export function savePatientUpload(input: {
  patientId: string;
  category: UploadCategory;
  originalName: string;
  mimeType: string | null;
  bytes: Buffer;
  note?: string | null;
}) {
  const id = randomUUID();
  const safeBase = input.originalName
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 80);
  const storedName = `${Date.now()}-${id.slice(0, 8)}-${safeBase || "file"}`;
  const dir = patientUploadDir(input.patientId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, storedName), input.bytes);

  const createdAt = new Date().toISOString();
  getDb()
    .insert(patientUploads)
    .values({
      id,
      patientId: input.patientId,
      category: input.category,
      originalName: input.originalName,
      storedName,
      mimeType: input.mimeType,
      sizeBytes: input.bytes.length,
      note: input.note || null,
      createdAt,
    })
    .run();

  return {
    id,
    category: input.category,
    originalName: input.originalName,
    storedName,
    mimeType: input.mimeType,
    sizeBytes: input.bytes.length,
    note: input.note || null,
    createdAt,
  };
}

export function resolveUploadFile(patientId: string, storedName: string) {
  const full = path.join(patientUploadDir(patientId), storedName);
  if (!full.startsWith(patientUploadDir(patientId))) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

export function deletePatientUpload(patientId: string, uploadId: string) {
  const db = getDb();
  const row = db
    .select()
    .from(patientUploads)
    .where(eq(patientUploads.id, uploadId))
    .get();
  if (!row || row.patientId !== patientId) return false;

  const full = resolveUploadFile(patientId, row.storedName);
  if (full) {
    try {
      fs.unlinkSync(full);
    } catch {
      /* ignore missing disk file */
    }
  }
  db.delete(patientUploads).where(eq(patientUploads.id, uploadId)).run();
  return true;
}

/** Seed bundled public demo docs into patient_uploads once. */
export function ensureDemoUploadsSeeded(patientId: string) {
  const existing = listPatientUploads(patientId);
  if (existing.length > 0) return;

  const demo: {
    category: UploadCategory;
    publicRel: string;
    name: string;
  }[] = [
    {
      category: "labs",
      publicRel: "docs/labs/helicobacter-2026-09-15.pdf",
      name: "Helicobacteri_2026.pdf",
    },
    {
      category: "labs",
      publicRel: "docs/labs/helicobacter-2023-12-01.pdf",
      name: "Helicobacter.pdf",
    },
    {
      category: "vaccines",
      publicRel: "docs/vaccines/gripas-2026-10-28.pdf",
      name: "gripas.pdf",
    },
    {
      category: "vaccines",
      publicRel: "docs/vaccines/ticovac-2024-04-29.pdf",
      name: "TicoVac Adults (Erkinis encefalitas) 2024-04-29.pdf",
    },
    {
      category: "imaging",
      publicRel: "docs/neck-ct-c5c6.png",
      name: "kaklo-KT-iliustracija.png",
    },
  ];

  const sqlite = getSqlite();
  const insert = sqlite.prepare(`
    INSERT INTO patient_uploads
      (id, patient_id, category, original_name, stored_name, mime_type, size_bytes, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const d of demo) {
    const src = path.join(process.cwd(), "public", d.publicRel);
    if (!fs.existsSync(src)) continue;
    const bytes = fs.readFileSync(src);
    const id = randomUUID();
    const storedName = `seed-${path.basename(d.publicRel)}`;
    const dir = patientUploadDir(patientId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, storedName), bytes);
    insert.run(
      id,
      patientId,
      d.category,
      d.name,
      storedName,
      d.publicRel.endsWith(".png") ? "image/png" : "application/pdf",
      bytes.length,
      "Demo / įkeltas šaltinis",
      new Date().toISOString()
    );
  }
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
