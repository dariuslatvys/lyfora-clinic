import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { ensureSchema, getDb, getSqlite } from "@/lib/db";
import { patients, users } from "@/lib/db/schema";
import fs from "fs";
import path from "path";
import { patientUploadDir } from "@/lib/health/uploads";

import { PETRAITIS_PATIENT_ID } from "@/lib/i18n/patient-name";

export const PETRAITIS_ID = PETRAITIS_PATIENT_ID;
export const PETRAITIS_USER_ID = "user_patient_petraitis";
export const PETRAITIS_EMAIL = "petras@lyfora.lt";

export const PETRAITIS_DOCS = [
  {
    id: "petraitis-spine-pdf",
    category: "imaging" as const,
    publicRel: "demo/petraitis/stuburo_isvarza.pdf",
    name: "stuburo_isvarza.pdf",
    note: "Stuburo iškrypimas / spondiliozė · siuntimas / išrašas",
  },
  {
    id: "petraitis-spine-img",
    category: "imaging" as const,
    publicRel: "demo/petraitis/stuburas.jpg",
    name: "stuburas.jpg",
    note: "Stuburo rentgeno nuotrauka",
  },
  {
    id: "petraitis-trauma-img",
    category: "imaging" as const,
    publicRel: "demo/petraitis/trauma_varztai.jpg",
    name: "trauma_varztai.jpg",
    note: "Blauzdos / šlaunikaulio trauma · varžtai",
  },
  {
    id: "petraitis-poliklinika-2010",
    category: "other" as const,
    publicRel: "demo/petraitis/israsas_poliklinikai_2010.pdf",
    name: "israsas_poliklinikai_2010.pdf",
    note: "Poliklinikos išrašas · 2010",
  },
  {
    id: "petraitis-trauma-2009",
    category: "other" as const,
    publicRel: "demo/petraitis/traumos_israsas_2009.pdf",
    name: "traumos_israsas_2009.pdf",
    note: "Traumos išrašas · 2009",
  },
] as const;

/** Ensure Petraitis demo patient + documents exist (idempotent). */
export function ensurePetraitisPatient() {
  ensureSchema();
  const db = getDb();
  const existing = db
    .select()
    .from(patients)
    .where(eq(patients.id, PETRAITIS_ID))
    .get();
  if (!existing) {
    const seedPassword =
      process.env.DEMO_PASSWORD?.trim() ||
      // Unusable until local seed sets DEMO_PASSWORD — never a fixed shipped secret.
      `locked-${randomUUID()}`;
    const hash = bcrypt.hashSync(seedPassword, 10);
    const now = new Date().toISOString();
    const userExists = db
      .select()
      .from(users)
      .where(eq(users.id, PETRAITIS_USER_ID))
      .get();
    if (!userExists) {
      db.insert(users)
        .values({
          id: PETRAITIS_USER_ID,
          email: PETRAITIS_EMAIL,
          passwordHash: hash,
          role: "patient",
          displayName: "Petras Petraitis",
          locale: "lt",
          createdAt: now,
        })
        .run();
    }
    db.insert(patients)
      .values({
        id: PETRAITIS_ID,
        userId: PETRAITIS_USER_ID,
        fullName: "Petras Petraitis",
        sex: "male",
        dob: "1975-06-18",
        nationalId: "37506181234",
        hasNgsVcf: false,
        hasSnpArray: false,
        notes:
          "Demo pacientas su stuburo ir traumų istorija (išrašai + vaizdai).",
      })
      .run();
  }

  seedPetraitisUploads();
}

function seedPetraitisUploads() {
  const sqlite = getSqlite();
  const insert = sqlite.prepare(`
    INSERT OR IGNORE INTO patient_uploads
      (id, patient_id, category, original_name, stored_name, mime_type, size_bytes, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const dir = patientUploadDir(PETRAITIS_ID);
  fs.mkdirSync(dir, { recursive: true });
  for (const d of PETRAITIS_DOCS) {
    const src = path.join(process.cwd(), "public", d.publicRel);
    if (!fs.existsSync(src)) continue;
    const bytes = fs.readFileSync(src);
    const storedName = `seed-${path.basename(d.publicRel)}`;
    const dest = path.join(dir, storedName);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, bytes);
    const mime = d.publicRel.endsWith(".jpg")
      ? "image/jpeg"
      : d.publicRel.endsWith(".png")
        ? "image/png"
        : "application/pdf";
    insert.run(
      d.id,
      PETRAITIS_ID,
      d.category,
      d.name,
      storedName,
      mime,
      bytes.length,
      d.note,
      new Date().toISOString()
    );
  }
}

export function petraitisDisplayName(locale: "lt" | "en") {
  return locale === "en" ? "Peter Peters" : "Petras Petraitis";
}
