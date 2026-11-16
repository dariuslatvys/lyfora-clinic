/**
 * Active substances linked to each pharmacogenetics focus area.
 * Shown next to purpose groups so patients see which molecule the signal is about.
 */

export const PHARMA_ACTIVES_LT: Record<string, string[]> = {
  "Fluoropyrimidine Toxicity": ["fluorouracilas (5-FU)", "kapecitabinas"],
  "Statin Myopathy": ["simvastatinas", "atorvastatinas", "rosuvastatinas"],
  "Thiopurine Toxicity": ["azatioprinas", "merkaptopurinas"],
  "Opioid & CYP2D6": ["kodeinas", "tramadolis"],
  "Antiplatelet Response": ["klopidogrelis"],
  "Coumarin & Phenytoin Dosing": ["varfarinas", "fenitoinas"],
  "HLA Hypersensitivity": ["abakaviras", "karbamazepinas", "alopurinolis"],
  "G6PD Deficiency": ["primakvinas", "dapsonas", "nitrofurantoinas"],
  "Irinotecan / UGT1A1": ["irinotekanas"],
  "Tacrolimus Dosing": ["takrolimuzas"],
  "Anaesthesia / Apnoea": ["suksamilcholinas", "mivakuriumas"],
  "Alcohol & Nitrates": ["alkoholis", "nitratai"],
  "Aminoglycoside Ototoxicity": ["gentamicinas", "tobramicinas", "amikacinas"],
  "Efavirenz Dosing": ["efavirenzas"],
  "Valproate Hepatotoxicity": ["valproatas"],
  "NAT2 Acetylation": ["izoniazidas"],
  "CFTR Modulators": ["ivakaftoras", "lumakaftoras"],
  "ARIA Risk": ["adukanumabas", "lekanemabas"],
};

export const PHARMA_ACTIVES_EN: Record<string, string[]> = {
  "Fluoropyrimidine Toxicity": ["fluorouracil (5-FU)", "capecitabine"],
  "Statin Myopathy": ["simvastatin", "atorvastatin", "rosuvastatin"],
  "Thiopurine Toxicity": ["azathioprine", "mercaptopurine"],
  "Opioid & CYP2D6": ["codeine", "tramadol"],
  "Antiplatelet Response": ["clopidogrel"],
  "Coumarin & Phenytoin Dosing": ["warfarin", "phenytoin"],
  "HLA Hypersensitivity": ["abacavir", "carbamazepine", "allopurinol"],
  "G6PD Deficiency": ["primaquine", "dapsone", "nitrofurantoin"],
  "Irinotecan / UGT1A1": ["irinotecan"],
  "Tacrolimus Dosing": ["tacrolimus"],
  "Anaesthesia / Apnoea": ["succinylcholine", "mivacurium"],
  "Alcohol & Nitrates": ["alcohol", "nitrates"],
  "Aminoglycoside Ototoxicity": ["gentamicin", "tobramycin", "amikacin"],
  "Efavirenz Dosing": ["efavirenz"],
  "Valproate Hepatotoxicity": ["valproate"],
  "NAT2 Acetylation": ["isoniazid"],
  "CFTR Modulators": ["ivacaftor", "lumacaftor"],
  "ARIA Risk": ["aducanumab", "lecanemab"],
};

export function pharmaActiveSubstances(
  subcategory: string | null | undefined,
  locale: "lt" | "en"
): string[] {
  if (!subcategory?.trim()) return [];
  const key = subcategory.trim();
  return (locale === "lt" ? PHARMA_ACTIVES_LT : PHARMA_ACTIVES_EN)[key] || [];
}

/** Flatten unique actives from several SNP rows (same purpose group). */
export function pharmaActivesForRows(
  rows: { subcategory: string | null }[],
  locale: "lt" | "en"
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    for (const a of pharmaActiveSubstances(row.subcategory, locale)) {
      const k = a.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(a);
    }
  }
  return out;
}
