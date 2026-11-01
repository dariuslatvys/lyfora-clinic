import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // patient | doctor
  displayName: text("display_name").notNull(),
  locale: text("locale").notNull().default("lt"),
  createdAt: text("created_at").notNull(),
});

export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  fullName: text("full_name").notNull(),
  sex: text("sex").notNull(), // male | female
  dob: text("dob").notNull(),
  nationalId: text("national_id"),
  hasNgsVcf: integer("has_ngs_vcf", { mode: "boolean" }).notNull().default(false),
  hasSnpArray: integer("has_snp_array", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
});

export const geneSnpRisk = sqliteTable("gene_snp_risk", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupEn: text("group_en"),
  groupLt: text("group_lt"),
  nr: integer("nr"),
  gene: text("gene").notNull(),
  snpId: text("snp_id").notNull(),
  effectAllele1: text("effect_allele_1"),
  effectAllele2: text("effect_allele_2"),
  primaryCategory: text("primary_category").notNull(),
  secondaryCategory: text("secondary_category"),
  impactLevel: text("impact_level"),
  evidenceLevel: text("evidence_level"),
  match1: text("match_1"),
  match2: text("match_2"),
  subcategory: text("subcategory"),
  mechanism: text("mechanism"),
});

export const markerDefs = sqliteTable("marker_defs", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  categoriesJson: text("categories_json").notNull(),
  descriptionLt: text("description_lt"),
  descriptionEn: text("description_en"),
  unit: text("unit"),
});

export const markerResults = sqliteTable("marker_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").notNull(),
  markerKey: text("marker_key").notNull(),
  value: real("value").notNull(),
  unit: text("unit"),
  refLow: real("ref_low"),
  refHigh: real("ref_high"),
  flag: text("flag"),
  observedAt: text("observed_at").notNull(),
  source: text("source"),
});

export const snpGenotypes = sqliteTable("snp_genotypes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").notNull(),
  snpId: text("snp_id").notNull(),
  allele1: text("allele_1").notNull(),
  allele2: text("allele_2").notNull(),
  source: text("source").notNull(),
});

export const rareMutations = sqliteTable("rare_mutations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").notNull(),
  gene: text("gene").notNull(),
  transcript: text("transcript"),
  hgvs: text("hgvs"),
  chrom: text("chrom"),
  pos: integer("pos"),
  ref: text("ref"),
  alt: text("alt"),
  gt: text("gt"),
  significance: text("significance"),
  titleLt: text("title_lt"),
  titleEn: text("title_en"),
  summaryLt: text("summary_lt"),
  summaryEn: text("summary_en"),
  synthetic: integer("synthetic", { mode: "boolean" }).default(false),
});

export const questionnaire = sqliteTable("questionnaire", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const patientUploads = sqliteTable("patient_uploads", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  category: text("category").notNull(), // labs | vaccines | genetics | imaging | other
  originalName: text("original_name").notNull(),
  storedName: text("stored_name").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});
