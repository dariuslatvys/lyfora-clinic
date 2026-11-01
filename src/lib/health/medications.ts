import classifier from "../../../data/parsed/medication_classifier.json";

export type MedicationDrug = {
  brandName: string;
  activeSubstance: string;
  atcCode: string;
  form: string;
  categoryName: string;
  lyforaCategory: string;
  searchKeywords: string[];
};

export type MedicationCategory = {
  categoryName: string;
  lyforaCategory: string;
  helperText: string;
  searchKeywords: string[];
};

export type MedicationSuggestion = MedicationDrug & {
  score: number;
  reason: "brand" | "substance" | "keyword" | "indication";
};

const drugs = (classifier.drugs as MedicationDrug[]).map((d) => ({
  ...d,
  searchKeywords: d.searchKeywords || [],
}));

const categories = (classifier.categories as MedicationCategory[]).map((c) => ({
  ...c,
  searchKeywords: c.searchKeywords || [],
}));

function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function starts(hay: string, needle: string) {
  return fold(hay).startsWith(needle);
}

function includes(hay: string, needle: string) {
  return fold(hay).includes(needle);
}

/** Prefix / indication search across brand, substance, keywords, and categories. */
export function searchMedications(
  query: string,
  limit = 12
): MedicationSuggestion[] {
  const q = fold(query);
  if (q.length < 2) return [];

  const matchedCategoryNames = new Set<string>();
  for (const c of categories) {
    if (
      starts(c.categoryName, q) ||
      includes(c.categoryName, q) ||
      c.searchKeywords.some((k) => starts(k, q) || includes(k, q)) ||
      includes(c.helperText, q)
    ) {
      matchedCategoryNames.add(c.categoryName);
    }
  }

  const scored: MedicationSuggestion[] = [];
  for (const d of drugs) {
    let score = 0;
    let reason: MedicationSuggestion["reason"] = "keyword";

    if (starts(d.brandName, q)) {
      score = 100 - Math.min(40, d.brandName.length);
      reason = "brand";
    } else if (starts(d.activeSubstance, q)) {
      score = 80 - Math.min(30, d.activeSubstance.length);
      reason = "substance";
    } else if (d.searchKeywords.some((k) => starts(k, q))) {
      score = 60;
      reason = "keyword";
    } else if (
      d.searchKeywords.some((k) => includes(k, q)) ||
      includes(d.brandName, q) ||
      includes(d.activeSubstance, q)
    ) {
      score = 40;
      reason = "keyword";
    } else if (matchedCategoryNames.has(d.categoryName)) {
      score = 25;
      reason = "indication";
    } else {
      continue;
    }

    scored.push({ ...d, score, reason });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.brandName.localeCompare(b.brandName, "lt", { sensitivity: "base" })
  );

  // Deduplicate by brand name (keep best score)
  const seen = new Set<string>();
  const out: MedicationSuggestion[] = [];
  for (const s of scored) {
    const key = fold(s.brandName);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

export function medicationCatalogStats() {
  return { drugs: drugs.length, categories: categories.length };
}

export function formatMedicationLabel(d: Pick<MedicationDrug, "brandName" | "activeSubstance">) {
  if (d.activeSubstance && fold(d.activeSubstance) !== fold(d.brandName)) {
    return `${d.brandName} (${d.activeSubstance})`;
  }
  return d.brandName;
}
