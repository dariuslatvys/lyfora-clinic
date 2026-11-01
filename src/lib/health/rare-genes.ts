import type { HealthCategoryId } from "./categories";

/**
 * NGS (VCF) rare-gene → health category mapping.
 * Presence of a mapped rare variant forces that category colour to red.
 */
export const RARE_GENE_CATEGORY: Record<string, HealthCategoryId> = {
  MYBPC3: "cardiovascular", // hypertrophic cardiomyopathy / heart muscle
  MSH2: "oncology", // Lynch / hereditary cancer
  PALB2: "oncology", // hereditary cancer risk
  BRCA1: "oncology",
  BRCA2: "oncology",
  MLH1: "oncology",
  MSH6: "oncology",
  PMS2: "oncology",
  TP53: "oncology",
  RYR1: "pharmacogenetics", // anesthetic / malignant hyperthermia sensitivity
};

export function rareGeneCategory(gene: string): HealthCategoryId | null {
  const key = gene.trim().toUpperCase();
  return RARE_GENE_CATEGORY[key] ?? null;
}

/** Rare pathogenic / risk NGS findings elevate the category to red. */
export function rareMutationForcesRed(gene: string): boolean {
  return rareGeneCategory(gene) != null;
}
