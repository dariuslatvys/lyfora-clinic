import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { ensureSchema, getSqlite } from "../src/lib/db";

type JsonSnp = {
  groupEn: string | null;
  groupLt: string | null;
  nr: number | null;
  gene: string;
  snpId: string;
  effectAllele1: string | null;
  effectAllele2: string | null;
  primaryCategory: string;
  secondaryCategory: string | null;
  impactLevel: string | null;
  evidenceLevel: string | null;
  match1: string | null;
  match2: string | null;
  subcategory: string | null;
  mechanism: string | null;
};

const ROOT = process.cwd();
const PARSED = path.join(ROOT, "data", "parsed");

function readJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(PARSED, name), "utf8")) as T;
}

const MARKER_COPY: Record<
  string,
  { lt: string; en: string; unit?: string }
> = {
  LDL: {
    lt: "MTL cholesterolis — pagrindinis lipidų žymuo, susijęs su arterijų apnašų rizika.",
    en: "LDL cholesterol — a key lipid marker linked to arterial plaque risk.",
    unit: "mmol/L",
  },
  HDL: {
    lt: "DTL cholesterolis — „gerasis“ cholesterolis, padedantis šalinti cholesterolį iš kraujotakos.",
    en: "HDL cholesterol — the “good” cholesterol that helps clear cholesterol from circulation.",
    unit: "mmol/L",
  },
  TOTAL_CHOLESTEROL: {
    lt: "Bendras cholesterolis — bendras lipidų kiekio kraujyje vaizdas.",
    en: "Total cholesterol — overall blood lipid picture.",
    unit: "mmol/L",
  },
  TRIGLYCERIDES: {
    lt: "Trigliceridai — riebalų rūšis kraujyje, jautri mitybai ir metabolizmui.",
    en: "Triglycerides — blood fats sensitive to diet and metabolism.",
    unit: "mmol/L",
  },
  APO_B: {
    lt: "Apo B — dalelių, gabenančių „blogąjį“ cholesterolį, skaičiaus žymuo.",
    en: "Apo B — a marker of particles that carry atherogenic cholesterol.",
    unit: "g/L",
  },
  LPA: {
    lt: "Lp(a) — genetiškai nulemtas lipidų žymuo; aukštesnės reikšmės siejamos su širdies rizika.",
    en: "Lp(a) — a genetically influenced lipid marker; higher values relate to heart risk.",
    unit: "nmol/L",
  },
  GLUCOSE: {
    lt: "Gliukozė — cukraus kiekis kraujyje, metabolinės sveikatos atramos taškas.",
    en: "Glucose — blood sugar, a cornerstone of metabolic health.",
    unit: "mmol/L",
  },
  eGFR: {
    lt: "GFG (eGFR) — inkstų filtracijos įvertinimas.",
    en: "eGFR — estimate of kidney filtration.",
    unit: "ml/min/1.73m²",
  },
  HS_CRP: {
    lt: "CRB / hs-CRP — jautrus uždegimo žymuo.",
    en: "hs-CRP — a sensitive inflammation marker.",
    unit: "mg/L",
  },
  HEMOGLOBIN: {
    lt: "Hemoglobinas — deguonies pernešimo kraujyje žymuo.",
    en: "Hemoglobin — oxygen-carrying capacity of blood.",
    unit: "g/L",
  },
  WBC: {
    lt: "Leukocitai — imuninių ląstelių kiekis kraujyje.",
    en: "White blood cells — immune cell count in blood.",
    unit: "10^9/L",
  },
  ALT: {
    lt: "ALT — kepenų fermentas, naudojamas kepenų būklei stebėti.",
    en: "ALT — a liver enzyme used to monitor liver status.",
    unit: "U/L",
  },
  AST: {
    lt: "AST — fermentas, susijęs su kepenų ir raumenų būkle.",
    en: "AST — an enzyme related to liver and muscle status.",
    unit: "U/L",
  },
  GGT: {
    lt: "GGT — kepenų ir tulžies takų žymuo.",
    en: "GGT — a marker of liver and biliary tract status.",
    unit: "U/L",
  },
  K: {
    lt: "Kalis — elektrolitas, svarbus širdies ritmui ir raumenims.",
    en: "Potassium — an electrolyte important for heart rhythm and muscles.",
    unit: "mmol/L",
  },
  CREATININE: {
    lt: "Kreatininas — inkstų funkcijos laboratorinis žymuo.",
    en: "Creatinine — a laboratory marker of kidney function.",
    unit: "µmol/L",
  },
  PSA: {
    lt: "PSA — prostatos žymuo, stebimas vyrų sveikatos kontekste.",
    en: "PSA — a prostate marker monitored in men’s health.",
    unit: "µg/L",
  },
  CORTISOL: {
    lt: "Kortizolis — streso ir antinksčių ašies hormonas; reikšmė priklauso nuo paros meto.",
    en: "Cortisol — a stress and adrenal-axis hormone; values depend on time of day.",
    unit: "nmol/L",
  },
  H_PYLORI: {
    lt: "Helicobacter pylori IgG — antikūnai, rodantys kontaktą su H. pylori bakterija.",
    en: "Helicobacter pylori IgG — antibodies indicating exposure to H. pylori.",
    unit: "index",
  },
};

function nonRiskAllele(effect1?: string | null, effect2?: string | null) {
  const effects = new Set(
    [effect1, effect2].filter(Boolean).map((a) => a!.toUpperCase())
  );
  for (const a of ["A", "C", "G", "T"]) {
    if (!effects.has(a)) return a;
  }
  return "N";
}

function main() {
  const dbPath = path.join(ROOT, "data", "db", "lyfora.sqlite");
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  if (fs.existsSync(dbPath + "-wal")) fs.unlinkSync(dbPath + "-wal");
  if (fs.existsSync(dbPath + "-shm")) fs.unlinkSync(dbPath + "-shm");

  ensureSchema();
  const sqlite = getSqlite();

  const snps = readJson<JsonSnp[]>("gene_snp_risk.json");
  const markerDefs = readJson<
    { key: string; name: string; categories: string[] }[]
  >("markers_category.json");
  const blood = readJson<{
    patient: string;
    sex: string;
    dob: string;
    markers: {
      markerKey: string;
      name: string;
      value: number;
      unit: string;
      refLow: number | null;
      refHigh: number | null;
      flag: string | null;
      date: string;
      source: string;
    }[];
  }>("blood_markers.json");
  type RareFile = {
    variants: {
      gene: string;
      transcript: string;
      hgvs: string;
      chrom: string;
      pos: number;
      ref: string;
      alt: string;
      gt: string;
      significance: string;
      titleLt: string;
      titleEn: string;
      summaryLt: string;
      summaryEn: string;
      synthetic: boolean;
    }[];
  };
  const rareFemale = readJson<RareFile>("vcf_rare_mutations_female.json");
  const rareMale = readJson<RareFile>("vcf_rare_mutations_male.json");

  const hash = bcrypt.hashSync("lyfora2026", 10);
  const now = new Date().toISOString();

  const patientUserId = "user_patient_male";
  const femaleUserId = "user_patient_female";
  const doctorUserId = "user_doctor";
  const patientId = "patient_male";
  const femaleId = "patient_female";

  const insertUser = sqlite.prepare(`
    INSERT INTO users (id, email, password_hash, role, display_name, locale, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(patientUserId, "pacientas@lyfora.lt", hash, "patient", "Jonas Jonaitis", "lt", now);
  insertUser.run(femaleUserId, "paciente@lyfora.lt", hash, "patient", "Rasa Rasaitė", "lt", now);
  insertUser.run(doctorUserId, "gydytojas@lyfora.lt", hash, "doctor", "Dr. Lyfora", "lt", now);

  sqlite.prepare(`
    INSERT INTO patients (id, user_id, full_name, sex, dob, national_id, has_ngs_vcf, has_snp_array, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    patientId,
    patientUserId,
    "Jonas Jonaitis",
    "male",
    blood.dob,
    null,
    1,
    1,
    "Demo vyrų paciento laboratoriniai žymenys + bazinis SNP microarray + NGS VCF (sintetinės MYBPC3/MSH2 pozicijos)."
  );

  sqlite.prepare(`
    INSERT INTO patients (id, user_id, full_name, sex, dob, national_id, has_ngs_vcf, has_snp_array, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    femaleId,
    femaleUserId,
    "Rasa Rasaitė",
    "female",
    "1988-03-12",
    null,
    1,
    1,
    "Demo moters pacientė su sintetiniu NGS VCF ir demonstraciniais SNP genotipais."
  );

  const insertSnp = sqlite.prepare(`
    INSERT INTO gene_snp_risk (
      group_en, group_lt, nr, gene, snp_id, effect_allele_1, effect_allele_2,
      primary_category, secondary_category, impact_level, evidence_level,
      match_1, match_2, subcategory, mechanism
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const snpTx = sqlite.transaction((rows: JsonSnp[]) => {
    for (const r of rows) {
      insertSnp.run(
        r.groupEn,
        r.groupLt,
        r.nr,
        r.gene,
        r.snpId,
        r.effectAllele1,
        r.effectAllele2,
        r.primaryCategory,
        r.secondaryCategory,
        r.impactLevel,
        r.evidenceLevel,
        r.match1,
        r.match2,
        r.subcategory,
        r.mechanism
      );
    }
  });
  snpTx(snps);

  const insertDef = sqlite.prepare(`
    INSERT INTO marker_defs (key, name, categories_json, description_lt, description_en, unit)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const m of markerDefs) {
    const copy = MARKER_COPY[m.key];
    insertDef.run(
      m.key,
      m.name,
      JSON.stringify(m.categories),
      copy?.lt ?? `${m.name} — laboratorinis sveikatos žymuo.`,
      copy?.en ?? `${m.name} — a laboratory health marker.`,
      copy?.unit ?? null
    );
  }
  // Extra keys used by imported blood PDFs (aliases / infection markers)
  const extraDefs: {
    key: string;
    name: string;
    categories: string[];
  }[] = [
    {
      key: "APO_B",
      name: "Apolipoprotein B",
      categories: ["Cardiovascular Health", "Metabolic Health"],
    },
    {
      key: "LPA",
      name: "Lipoprotein (a)",
      categories: ["Cardiovascular Health"],
    },
    {
      key: "CORTISOL",
      name: "Cortisol",
      categories: ["Hormonal Health", "Mental & Cognitive Health"],
    },
    {
      key: "H_PYLORI",
      name: "Helicobacter pylori IgG",
      categories: ["Immune & Inflammation"],
    },
    {
      key: "CREATININE",
      name: "Creatinine",
      categories: ["Cardiovascular Health", "Metabolic Health"],
    },
  ];
  const existingKeys = new Set(markerDefs.map((m) => m.key));
  for (const m of extraDefs) {
    if (existingKeys.has(m.key)) continue;
    const copy = MARKER_COPY[m.key];
    insertDef.run(
      m.key,
      m.name,
      JSON.stringify(m.categories),
      copy?.lt ?? `${m.name} — laboratorinis sveikatos žymuo.`,
      copy?.en ?? `${m.name} — a laboratory health marker.`,
      copy?.unit ?? null
    );
  }

  const insertResult = sqlite.prepare(`
    INSERT INTO marker_results (patient_id, marker_key, value, unit, ref_low, ref_high, flag, observed_at, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of blood.markers) {
    insertResult.run(
      patientId,
      m.markerKey,
      m.value,
      m.unit,
      m.refLow,
      m.refHigh,
      m.flag,
      m.date,
      m.source
    );
  }

  // Light marker set for female demo (synthetic)
  const femaleMarkers = [
    { key: "LDL", value: 2.4, unit: "mmol/L", low: 0, high: 2.59, flag: null, date: "2026-05-01" },
    { key: "HDL", value: 1.55, unit: "mmol/L", low: 1.2, high: 2.5, flag: null, date: "2026-05-01" },
    { key: "TOTAL_CHOLESTEROL", value: 4.6, unit: "mmol/L", low: null, high: 5.2, flag: null, date: "2026-05-01" },
    { key: "HS_CRP", value: 1.2, unit: "mg/L", low: 0, high: 5, flag: null, date: "2026-05-01" },
    { key: "GLUCOSE", value: 5.1, unit: "mmol/L", low: 4, high: 6, flag: null, date: "2026-05-01" },
    { key: "TSH", value: 2.1, unit: "mU/L", low: 0.4, high: 4.0, flag: null, date: "2026-05-01" },
    { key: "VITAMIN_D", value: 48, unit: "nmol/L", low: 75, high: 250, flag: "low", date: "2026-05-01" },
    { key: "ESTROGEN", value: 220, unit: "pmol/L", low: 100, high: 600, flag: null, date: "2026-05-01" },
  ];
  for (const m of femaleMarkers) {
    insertResult.run(femaleId, m.key, m.value, m.unit, m.low, m.high, m.flag, m.date, "demo");
  }

  const insertGeno = sqlite.prepare(`
    INSERT INTO snp_genotypes (patient_id, snp_id, allele_1, allele_2, source)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Real microarray genotypes for male demo patient (23andMe-format sample)
  const maleGeno = readJson<{
    genotypes: { snpId: string; allele1: string; allele2: string }[];
    source?: string;
  }>("snp_genotypes_male.json");
  for (const g of maleGeno.genotypes) {
    insertGeno.run(
      patientId,
      g.snpId,
      g.allele1,
      g.allele2,
      maleGeno.source || "snp_microarray"
    );
  }

  // Demo SNP genotypes for female patient — create 1-match / 2-match patterns
  const cardio = snps.filter((s) => s.primaryCategory === "Cardiovascular Health");
  const hormonesW = snps.filter((s) => s.primaryCategory === "Hormones (Women)");
  const mental = snps.filter((s) => s.primaryCategory === "Mental and Cognitive Health");
  const immune = snps.filter((s) => s.primaryCategory === "Immune & Inflammation");
  const metabolic = snps.filter((s) => s.primaryCategory === "Metabolic Health");
  const pharma = snps.filter((s) => s.primaryCategory === "Pharmacogenetics");

  function seedGenotypes(rows: JsonSnp[], pattern: "sparse" | "light") {
    rows.forEach((r, i) => {
      const eff = (r.effectAllele1 || "A").toUpperCase();
      const safe = nonRiskAllele(r.effectAllele1, r.effectAllele2);
      let a1 = safe;
      let a2 = safe;
      // Keep most genotypes non-risk so category colours stay readable
      const mode =
        pattern === "sparse"
          ? i % 6 === 0
            ? "het"
            : "none"
          : i % 8 === 0
            ? "het"
            : "none";
      if (mode === "het") {
        a1 = eff;
        a2 = safe;
      } else if (mode === "hom") {
        a1 = eff;
        a2 = eff;
      }
      insertGeno.run(femaleId, r.snpId, a1, a2, "demo_microarray");
    });
  }

  seedGenotypes(cardio, "sparse");
  seedGenotypes(hormonesW, "sparse");
  seedGenotypes(mental, "light");
  seedGenotypes(immune, "light");
  seedGenotypes(metabolic, "sparse");
  seedGenotypes(pharma.slice(0, 40), "light");

  const insertRare = sqlite.prepare(`
    INSERT INTO rare_mutations (
      patient_id, gene, transcript, hgvs, chrom, pos, ref, alt, gt, significance,
      title_lt, title_en, summary_lt, summary_en, synthetic
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  function insertRareFor(patient: string, variants: RareFile["variants"]) {
    for (const v of variants) {
      insertRare.run(
        patient,
        v.gene,
        v.transcript,
        v.hgvs,
        v.chrom,
        v.pos,
        v.ref,
        v.alt,
        v.gt,
        v.significance,
        v.titleLt,
        v.titleEn,
        v.summaryLt,
        v.summaryEn,
        v.synthetic ? 1 : 0
      );
    }
  }
  insertRareFor(patientId, rareMale.variants);
  insertRareFor(femaleId, rareFemale.variants);

  // Minimal questionnaire for male demo patient
  const insertQ = sqlite.prepare(
    `INSERT INTO questionnaire (patient_id, key, value) VALUES (?, ?, ?)`
  );
  insertQ.run(patientId, "family_heart_disease", "taip — tėvas");
  insertQ.run(patientId, "smoking", "ne");
  insertQ.run(patientId, "activity", "vidutinis");
  insertQ.run(patientId, "sleep_hours", "6-7");

  console.log("Seeded Lyfora DB");
  console.log("  patients: Jonas Jonaitis / John Doe (labs + SNP + NGS), Rasa Rasaitė / Jane Smith (demo SNP + female VCF)");
  console.log("  SNPs:", snps.length);
  console.log("  marker results:", blood.markers.length);
  console.log("  male microarray genotypes:", maleGeno.genotypes.length);
  console.log("  male rare:", rareMale.variants.length, "female rare:", rareFemale.variants.length);
  console.log("  logins: pacientas@lyfora.lt / paciente@lyfora.lt / gydytojas@lyfora.lt  pass: lyfora2026");
}

main();
