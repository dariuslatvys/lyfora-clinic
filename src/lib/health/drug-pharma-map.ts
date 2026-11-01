/**
 * Map a prescribed/catalogued medicine → pharmacogenetic focus areas
 * (the reverse of gene → drug messaging).
 */

export type PharmaFocusId =
  | "Statin Myopathy"
  | "Antiplatelet Response"
  | "Coumarin & Phenytoin Dosing"
  | "Opioid & CYP2D6"
  | "Thiopurine Toxicity"
  | "Fluoropyrimidine Toxicity"
  | "Irinotecan / UGT1A1"
  | "HLA Hypersensitivity"
  | "G6PD Deficiency"
  | "Tacrolimus Dosing"
  | "Efavirenz Dosing"
  | "Valproate Hepatotoxicity"
  | "NAT2 Acetylation"
  | "Aminoglycoside Ototoxicity"
  | "Anaesthesia / Apnoea"
  | "Alcohol & Nitrates"
  | "CFTR Modulators"
  | "ARIA Risk";

export type DrugPharmaHit = {
  subcategory: PharmaFocusId;
  /** Why this medicine matched this focus area. */
  reasonLt: string;
  reasonEn: string;
};

type Rule = {
  subcategory: PharmaFocusId;
  /** Match brand, substance, ATC, category, or free-text label. */
  test: RegExp;
  reasonLt: string;
  reasonEn: string;
};

function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** More specific substance rules first. */
const RULES: Rule[] = [
  {
    subcategory: "Statin Myopathy",
    test: /\b(simvastatin|atorvastatin|rosuvastatin|pravastatin|fluvastatin|pitavastatin|lovastatin|zocor|simvacor|atoris|sortis|torvacard|crestor|roswera|rosulip|atozet)\b/,
    reasonLt: "Statinų grupės cholesterolio vaistas — SLCO1B1 ir susiję genai",
    reasonEn: "Statin cholesterol medicine — SLCO1B1 and related genes",
  },
  {
    subcategory: "Antiplatelet Response",
    test: /\b(clopidogrel|plavix|zyllt|egitromb|prasugrel|efient|ticagrelor|brilique)\b/,
    reasonLt: "Antiagregantas (pvz. klopidogrelis) — CYP2C19 atsakas",
    reasonEn: "Antiplatelet (e.g. clopidogrel) — CYP2C19 response",
  },
  {
    subcategory: "Coumarin & Phenytoin Dosing",
    test: /\b(warfarin|orfari?n|phenytoin|fenitoin)\b/,
    reasonLt: "Varfarinas / fenitoinas — CYP2C9, VKORC1 dozavimas",
    reasonEn: "Warfarin / phenytoin — CYP2C9, VKORC1 dosing",
  },
  {
    subcategory: "Opioid & CYP2D6",
    test: /\b(codeine|kodein|tramadol|tramadolis|morphine|morfin|oxycodone|oksi?kodon|dihydrocodeine)\b/,
    reasonLt: "Opioidinis skausmo vaistas — CYP2D6 metabolizmas",
    reasonEn: "Opioid pain medicine — CYP2D6 metabolism",
  },
  {
    subcategory: "Thiopurine Toxicity",
    test: /\b(azathioprine|imuran|mercaptopurine|tioguanin|thioguanine|6-?\s*mp)\b/,
    reasonLt: "Tiopurinas — TPMT / NUDT15 šalutinio poveikio rizika",
    reasonEn: "Thiopurine — TPMT / NUDT15 toxicity risk",
  },
  {
    subcategory: "Fluoropyrimidine Toxicity",
    test: /\b(capecitabine|xeloda|fluorouracil|5-?\s*fu|tegafur)\b/,
    reasonLt: "Fluoropirimidinas — DPYD toksikumo rizika",
    reasonEn: "Fluoropyrimidine — DPYD toxicity risk",
  },
  {
    subcategory: "Irinotecan / UGT1A1",
    test: /\b(irinotecan|irinotekan|campto)\b/,
    reasonLt: "Irinotekanas — UGT1A1 šalutinio poveikio rizika",
    reasonEn: "Irinotecan — UGT1A1 side-effect risk",
  },
  {
    subcategory: "HLA Hypersensitivity",
    test: /\b(abacavir|ziagen|carbamazepine|finlepsin|tegretol|allopurinol|milurit|oxcarbazepine|trileptal|lamotrigine|lamictal)\b/,
    reasonLt: "Vaistas su HLA padidėjusio jautrumo rizika",
    reasonEn: "Medicine with HLA hypersensitivity risk",
  },
  {
    subcategory: "Valproate Hepatotoxicity",
    test: /\b(valproat|valproic|depakine|convulex)\b/,
    reasonLt: "Valproatas — kepenų toksikumo genetinė rizika",
    reasonEn: "Valproate — genetic liver toxicity risk",
  },
  {
    subcategory: "Tacrolimus Dosing",
    test: /\b(tacrolimus|takrolimuz|prograf|advagraf)\b/,
    reasonLt: "Takrolimuzas — dozavimo genetika",
    reasonEn: "Tacrolimus — dosing genetics",
  },
  {
    subcategory: "Efavirenz Dosing",
    test: /\b(efavirenz|sustiva|stocrin)\b/,
    reasonLt: "Efavirenzas — CYP2B6 dozavimas",
    reasonEn: "Efavirenz — CYP2B6 dosing",
  },
  {
    subcategory: "NAT2 Acetylation",
    test: /\b(isoniazid|izoniazid|hydralazine|hidralazin|sulfasalazine|salazopyrin|procainamide)\b/,
    reasonLt: "Vaistas, kurio skaidymas priklauso nuo NAT2 acetilinimo",
    reasonEn: "Medicine cleared via NAT2 acetylation",
  },
  {
    subcategory: "Aminoglycoside Ototoxicity",
    test: /\b(gentamicin|gentamicin|amikacin|tobramycin|streptomycin|neomycin)\b/,
    reasonLt: "Aminoglikozidas — klausos (ototoksiškumo) rizika",
    reasonEn: "Aminoglycoside — hearing (ototoxicity) risk",
  },
  {
    subcategory: "G6PD Deficiency",
    test: /\b(primaquine|dapson|dapsone|nitrofurantoin|furagin|rasburicase|methylene blue)\b/,
    reasonLt: "Vaistas, kuriam svarbus G6PD statusas",
    reasonEn: "Medicine where G6PD status matters",
  },
  {
    subcategory: "Anaesthesia / Apnoea",
    test: /\b(succinylcholine|suxamethonium|mivacurium)\b/,
    reasonLt: "Anestezijos priemonė — BCHE / apnėjos rizika",
    reasonEn: "Anaesthetic agent — BCHE / apnoea risk",
  },
  {
    subcategory: "CFTR Modulators",
    test: /\b(ivacaftor|lumacaftor|tezacaftor|elexacaftor|kalydeco|orkambi|symdeko|trikafta)\b/,
    reasonLt: "CFTR moduliatorius — cistinės fibrozės genetika",
    reasonEn: "CFTR modulator — cystic fibrosis genetics",
  },
  {
    subcategory: "ARIA Risk",
    test: /\b(aducanumab|lecanemab|donanemab|aduhelm|leqembi)\b/,
    reasonLt: "Alzheimerio gydymo vaistas — ARIA rizika (APOE)",
    reasonEn: "Alzheimer treatment medicine — ARIA risk (APOE)",
  },
  {
    subcategory: "Alcohol & Nitrates",
    test: /\b(isosorbide|nitroglycerin|nitroglicerin|nitrosorbid|glyceryl trinitrate)\b/,
    reasonLt: "Nitratai — ALDH2 netoleravimo rizika su alkoholiu",
    reasonEn: "Nitrates — ALDH2 intolerance risk with alcohol",
  },
];

export type DrugLookupInput = {
  brandName?: string | null;
  activeSubstance?: string | null;
  atcCode?: string | null;
  categoryName?: string | null;
  /** Free-text label from health card / prescription. */
  label?: string | null;
};

/**
 * Return pharmacogenetic focus areas relevant to this medicine.
 * Empty = no known PGx panel link in this portal (not “safe”).
 */
export function mapDrugToPharmaFocus(
  input: DrugLookupInput
): DrugPharmaHit[] {
  const hay = fold(
    [
      input.brandName,
      input.activeSubstance,
      input.atcCode,
      input.categoryName,
      input.label,
    ]
      .filter(Boolean)
      .join(" ")
  );
  if (!hay) return [];

  const hits: DrugPharmaHit[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    if (rule.test.test(hay) && !seen.has(rule.subcategory)) {
      seen.add(rule.subcategory);
      hits.push({
        subcategory: rule.subcategory,
        reasonLt: rule.reasonLt,
        reasonEn: rule.reasonEn,
      });
    }
  }

  // Category-level fallbacks when substance string is thin
  const cat = fold(input.categoryName || "");
  if (cat.includes("cholesterol") && !seen.has("Statin Myopathy")) {
    // Only if substance looks like a statin ATC C10AA*
    const atc = fold(input.atcCode || "");
    if (atc.startsWith("c10aa") || /statin/.test(hay)) {
      hits.push({
        subcategory: "Statin Myopathy",
        reasonLt: "Cholesterolio (statinų) klasifikatorius",
        reasonEn: "Cholesterol (statin) classifier category",
      });
    }
  }

  return hits;
}

/** Parse “Brand (Substance)” labels produced by formatMedicationLabel. */
export function parseMedicationLabel(label: string): DrugLookupInput {
  const m = label.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) {
    return { brandName: m[1]!.trim(), activeSubstance: m[2]!.trim(), label };
  }
  return { brandName: label.trim(), label };
}
