import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const DB_PATH =
  process.env.LYFORA_DB_PATH ||
  path.join(process.cwd(), "data", "db", "lyfora.sqlite");

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqlite: Database.Database | null = null;

export function getSqlite() {
  if (_sqlite) return _sqlite;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  _sqlite = new Database(DB_PATH);
  _sqlite.pragma("journal_mode = WAL");
  _sqlite.pragma("foreign_keys = ON");
  return _sqlite;
}

export function getDb() {
  if (_db) return _db;
  _db = drizzle(getSqlite(), { schema });
  return _db;
}

export function ensureSchema() {
  const sqlite = getSqlite();
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      display_name TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT 'lt',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      sex TEXT NOT NULL,
      dob TEXT NOT NULL,
      national_id TEXT,
      has_ngs_vcf INTEGER NOT NULL DEFAULT 0,
      has_snp_array INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS gene_snp_risk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_en TEXT,
      group_lt TEXT,
      nr INTEGER,
      gene TEXT NOT NULL,
      snp_id TEXT NOT NULL,
      effect_allele_1 TEXT,
      effect_allele_2 TEXT,
      primary_category TEXT NOT NULL,
      secondary_category TEXT,
      impact_level TEXT,
      evidence_level TEXT,
      match_1 TEXT,
      match_2 TEXT,
      subcategory TEXT,
      mechanism TEXT
    );
    CREATE TABLE IF NOT EXISTS marker_defs (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      categories_json TEXT NOT NULL,
      description_lt TEXT,
      description_en TEXT,
      unit TEXT
    );
    CREATE TABLE IF NOT EXISTS marker_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      marker_key TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      ref_low REAL,
      ref_high REAL,
      flag TEXT,
      observed_at TEXT NOT NULL,
      source TEXT
    );
    CREATE TABLE IF NOT EXISTS snp_genotypes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      snp_id TEXT NOT NULL,
      allele_1 TEXT NOT NULL,
      allele_2 TEXT NOT NULL,
      source TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rare_mutations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      gene TEXT NOT NULL,
      transcript TEXT,
      hgvs TEXT,
      chrom TEXT,
      pos INTEGER,
      ref TEXT,
      alt TEXT,
      gt TEXT,
      significance TEXT,
      title_lt TEXT,
      title_en TEXT,
      summary_lt TEXT,
      summary_en TEXT,
      synthetic INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS questionnaire (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_marker_results_patient ON marker_results(patient_id);
    CREATE INDEX IF NOT EXISTS idx_snp_geno_patient ON snp_genotypes(patient_id);
    CREATE INDEX IF NOT EXISTS idx_gene_snp_cat ON gene_snp_risk(primary_category);
  `);
}
