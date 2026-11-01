/**
 * Client-safe DNA panel types and labels (no Node / SQLite imports).
 */
import type { RiskColour } from "./colours";
import { CORE_SNP_GROUPS, type CoreSnpImpact } from "./core-snps";

export type DnaResultColour = RiskColour | "none";

export type DnaSnpResult = {
  gene: string;
  snpId: string;
  group: 1 | 2 | 3 | 4 | 5;
  primaryCategoryEn: string;
  impact: CoreSnpImpact;
  evidence: string;
  infoLt: string;
  infoEn: string;
  allele1: string | null;
  allele2: string | null;
  genotype: string | null;
  matchCount: number | null;
  colour: DnaResultColour;
  effectAllele1: string;
};

export type DnaPanel = {
  patientId: string;
  sex: "male" | "female";
  fileName: string;
  labNameLt: string;
  labNameEn: string;
  testedAt: string;
  testedCount: number;
  totalCount: number;
  results: DnaSnpResult[];
  counts: {
    green: number;
    badge: number;
    yellow: number;
    orange: number;
    none: number;
  };
};

const CAT_LT: Record<string, string> = {
  "Cardiovascular Health": "Širdis ir kraujagyslės",
  "Metabolic Health": "Medžiagų apykaita",
  "Immune & Inflammation": "Imunitetas ir uždegimas",
  "Hormonal Health": "Hormonai",
  "Renal Health": "Inkstai",
  "Lifestyle & Behavior": "Gyvensena",
  "Drug Metabolism": "Vaistų metabolizmas",
};

const CAT_EN: Record<string, string> = {
  "Cardiovascular Health": "Heart & vessels",
  "Metabolic Health": "Metabolism",
  "Immune & Inflammation": "Immune & inflammation",
  "Hormonal Health": "Hormones",
  "Renal Health": "Kidneys",
  "Lifestyle & Behavior": "Lifestyle",
  "Drug Metabolism": "Drug metabolism",
};

export function dnaCategoryLabel(primaryEn: string, locale: "lt" | "en") {
  if (locale === "en") return CAT_EN[primaryEn] || primaryEn;
  return CAT_LT[primaryEn] || primaryEn;
}

export function dnaGroupLabel(group: 1 | 2 | 3 | 4 | 5, locale: "lt" | "en") {
  return locale === "en" ? CORE_SNP_GROUPS[group].en : CORE_SNP_GROUPS[group].lt;
}
