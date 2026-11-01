import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { patients, snpGenotypes } from "@/lib/db/schema";
import { normalizeColour } from "./colours";
import {
  CORE_SNPS,
  DEMO_CORE_COUNTS_FEMALE,
  DEMO_CORE_COUNTS_MALE,
  genotypeFromRiskCount,
  type CoreSnpDef,
} from "./core-snps";
import type { DnaPanel, DnaResultColour, DnaSnpResult } from "./dna-panel";

export type { DnaPanel, DnaResultColour, DnaSnpResult } from "./dna-panel";
export { dnaCategoryLabel, dnaGroupLabel } from "./dna-panel";

function countRiskAlleles(
  def: CoreSnpDef,
  allele1: string,
  allele2: string
): number {
  const effects = [def.effectAllele1, def.effectAllele2]
    .filter(Boolean)
    .map((a) => a.toUpperCase());
  let n = 0;
  if (effects.includes(allele1.toUpperCase())) n += 1;
  if (effects.includes(allele2.toUpperCase())) n += 1;
  return n;
}

function colourForCount(
  def: CoreSnpDef,
  count: number | null
): DnaResultColour {
  if (count == null) return "none";
  if (count === 0) return "green";
  if (count === 1) return normalizeColour(def.match1) || "yellow";
  return normalizeColour(def.match2) || "orange";
}

export function loadDnaPanel(patientId: string): DnaPanel | null {
  ensureSchema();
  const db = getDb();
  const patient = db.select().from(patients).where(eq(patients.id, patientId)).get();
  if (!patient) return null;

  const sex = patient.sex === "female" ? "female" : "male";
  const demoCounts =
    sex === "female" ? DEMO_CORE_COUNTS_FEMALE : DEMO_CORE_COUNTS_MALE;

  const genoRows = db
    .select()
    .from(snpGenotypes)
    .where(eq(snpGenotypes.patientId, patientId))
    .all();

  const genoByBase = new Map<string, { allele1: string; allele2: string }>();
  for (const g of genoRows) {
    const base = g.snpId.split("__")[0] ?? g.snpId;
    if (!genoByBase.has(base)) {
      genoByBase.set(base, { allele1: g.allele1, allele2: g.allele2 });
    }
  }

  const results: DnaSnpResult[] = CORE_SNPS.map((def) => {
    let allele1: string | null = null;
    let allele2: string | null = null;
    const fromDb = genoByBase.get(def.snpId);
    if (fromDb) {
      allele1 = fromDb.allele1;
      allele2 = fromDb.allele2;
    } else if (demoCounts[def.snpId] != null) {
      const syn = genotypeFromRiskCount(def, demoCounts[def.snpId]!);
      allele1 = syn.allele1;
      allele2 = syn.allele2;
    }

    const matchCount =
      allele1 && allele2 ? countRiskAlleles(def, allele1, allele2) : null;
    const colour = colourForCount(def, matchCount);

    return {
      gene: def.gene,
      snpId: def.snpId,
      group: def.group,
      primaryCategoryEn: def.primaryCategoryEn,
      impact: def.impact,
      evidence: def.evidence,
      infoLt: def.infoLt,
      infoEn: def.infoEn,
      allele1,
      allele2,
      genotype: allele1 && allele2 ? `${allele1}${allele2}` : null,
      matchCount,
      colour,
      effectAllele1: def.effectAllele1,
    };
  });

  const testedCount = results.filter((r) => r.matchCount != null).length;
  const counts = {
    green: results.filter((r) => r.colour === "green").length,
    badge: results.filter((r) => r.colour === "badge").length,
    yellow: results.filter((r) => r.colour === "yellow").length,
    orange: results.filter(
      (r) => r.colour === "orange" || r.colour === "red"
    ).length,
    none: results.filter((r) => r.colour === "none").length,
  };

  return {
    patientId,
    sex,
    fileName:
      sex === "female" ? "Lyfora_SNP_RK_2026.txt" : "Lyfora_SNP_JJ_2026.txt",
    labNameLt: "Lyfora genomikos laboratorija",
    labNameEn: "Lyfora genomics laboratory",
    testedAt: "2026-09-22",
    testedCount,
    totalCount: results.length,
    results,
    counts,
  };
}
