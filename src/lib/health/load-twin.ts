import { eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import {
  geneSnpRisk,
  markerDefs,
  markerResults,
  patients,
  rareMutations,
  snpGenotypes,
  questionnaire,
} from "@/lib/db/schema";
import { evaluateDigitalTwin, summarizeCategory } from "./evaluate";
import type { Locale } from "@/lib/i18n/dictionary";

export function loadDigitalTwin(patientId: string, locale: Locale) {
  ensureSchema();
  const db = getDb();
  const patient = db.select().from(patients).where(eq(patients.id, patientId)).get();
  if (!patient) return null;

  const snpRows = db.select().from(geneSnpRisk).all().map((r) => ({
    gene: r.gene,
    snpId: r.snpId,
    effectAllele1: r.effectAllele1,
    effectAllele2: r.effectAllele2,
    primaryCategory: r.primaryCategory,
    secondaryCategory: r.secondaryCategory,
    match1: r.match1,
    match2: r.match2,
    impactLevel: r.impactLevel,
    evidenceLevel: r.evidenceLevel,
    subcategory: r.subcategory,
    mechanism: r.mechanism,
    groupLt: r.groupLt,
    groupEn: r.groupEn,
  }));

  const genotypes = db
    .select()
    .from(snpGenotypes)
    .where(eq(snpGenotypes.patientId, patientId))
    .all()
    .map((g) => ({
      snpId: g.snpId,
      allele1: g.allele1,
      allele2: g.allele2,
    }));

  const defs = db.select().from(markerDefs).all();
  const defMap = new Map(defs.map((d) => [d.key, d]));

  const results = db
    .select()
    .from(markerResults)
    .where(eq(markerResults.patientId, patientId))
    .all()
    .map((m) => {
      const def = defMap.get(m.markerKey);
      return {
        markerKey: m.markerKey,
        name: def?.name || m.markerKey,
        value: m.value,
        unit: m.unit,
        refLow: m.refLow,
        refHigh: m.refHigh,
        flag: m.flag,
        observedAt: m.observedAt,
        source: m.source,
        categories: def ? (JSON.parse(def.categoriesJson) as string[]) : [],
        descriptionLt: def?.descriptionLt,
        descriptionEn: def?.descriptionEn,
      };
    });

  const rare = db
    .select()
    .from(rareMutations)
    .where(eq(rareMutations.patientId, patientId))
    .all();

  const questions = db
    .select()
    .from(questionnaire)
    .where(eq(questionnaire.patientId, patientId))
    .all();

  const categories = evaluateDigitalTwin({
    sex: patient.sex as "male" | "female",
    snpRows,
    genotypes,
    markers: results,
    rare,
  }).map((c) => ({
    ...c,
    summary: summarizeCategory(c, locale),
  }));

  return { patient, categories, rare, questions, markers: results };
}
