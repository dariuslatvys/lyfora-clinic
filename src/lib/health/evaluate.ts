import type { RiskColour } from "./colours";
import { combineCategoryColour, maxColour, normalizeColour } from "./colours";
import {
  categoriesForSex,
  matchPrimaryCategory,
  type HealthCategoryId,
} from "./categories";
import { rareGeneCategory, rareMutationForcesRed } from "./rare-genes";

export type SnpRiskRow = {
  gene: string;
  snpId: string;
  effectAllele1: string | null;
  effectAllele2: string | null;
  primaryCategory: string;
  secondaryCategory: string | null;
  match1: string | null;
  match2: string | null;
  impactLevel: string | null;
  evidenceLevel: string | null;
  subcategory: string | null;
  mechanism: string | null;
  groupLt: string | null;
  groupEn: string | null;
};

export type Genotype = { snpId: string; allele1: string; allele2: string };

export type MarkerResult = {
  markerKey: string;
  name?: string;
  value: number;
  unit?: string | null;
  refLow?: number | null;
  refHigh?: number | null;
  flag?: string | null;
  observedAt: string;
  categories: string[];
  descriptionLt?: string | null;
  descriptionEn?: string | null;
};

export type EvaluatedSnp = SnpRiskRow & {
  allele1: string | null;
  allele2: string | null;
  matchCount: number;
  colour: RiskColour | null;
  genotypeAvailable: boolean;
};

function alleleMatchCount(
  alleles: [string, string],
  effect1?: string | null,
  effect2?: string | null
) {
  const effects = [effect1, effect2]
    .filter(Boolean)
    .map((a) => a!.toUpperCase());
  if (!effects.length) return 0;
  let count = 0;
  for (const a of alleles) {
    if (effects.includes(a.toUpperCase())) count += 1;
  }
  return count;
}

export function evaluateSnp(
  row: SnpRiskRow,
  genotype?: Genotype | null
): EvaluatedSnp {
  if (!genotype) {
    return {
      ...row,
      allele1: null,
      allele2: null,
      matchCount: 0,
      colour: null,
      genotypeAvailable: false,
    };
  }
  const alleles: [string, string] = [genotype.allele1, genotype.allele2];
  const matchCount = alleleMatchCount(
    alleles,
    row.effectAllele1,
    row.effectAllele2
  );
  let colour: RiskColour | null = null;
  if (matchCount === 1) colour = normalizeColour(row.match1);
  if (matchCount === 2) colour = normalizeColour(row.match2);
  // Genotype known but no risk alleles → calm/green, not "no data"
  if (matchCount === 0) colour = "green";
  return {
    ...row,
    allele1: genotype.allele1,
    allele2: genotype.allele2,
    matchCount,
    colour,
    genotypeAvailable: true,
  };
}

/** Biomarker colour per Health Category Colour Determination (markers). */
export function evaluateMarkerColour(
  markers: MarkerResult[]
): RiskColour {
  if (!markers.length) return "grey";

  const latestByKey = new Map<string, MarkerResult>();
  for (const m of [...markers].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt)
  )) {
    latestByKey.set(m.markerKey, m);
  }
  const latest = [...latestByKey.values()];
  const abnormal = latest.filter((m) => {
    if (m.flag === "high" || m.flag === "low") return true;
    if (m.refHigh != null && m.value > m.refHigh) return true;
    if (m.refLow != null && m.value < m.refLow) return true;
    return false;
  });

  if (latest.length < 2) return "grey";
  if (!abnormal.length) return "green";
  if (abnormal.length === 1) return "yellow";
  // Multiple abnormalities → orange; strong lipid panel elevations → red
  const strong = abnormal.filter((m) => {
    if (m.refHigh == null) return m.flag === "high";
    return m.value >= m.refHigh * 1.35;
  });
  if (strong.length >= 2 && abnormal.length >= 3) return "red";
  if (abnormal.length >= 2) return "orange";
  return "yellow";
}

export function geneticCategoryColour(
  snps: EvaluatedSnp[]
): RiskColour | null {
  const colours = snps
    .map((s) => s.colour)
    .filter((c): c is RiskColour => !!c);
  if (!colours.length) {
    // No genotypes or no matches → do not change category colour
    return null;
  }
  return maxColour(colours);
}

export type RareVariant = {
  id?: number;
  gene: string;
  transcript?: string | null;
  hgvs?: string | null;
  chrom?: string | null;
  pos?: number | null;
  ref?: string | null;
  alt?: string | null;
  gt?: string | null;
  significance?: string | null;
  titleLt?: string | null;
  titleEn?: string | null;
  summaryLt?: string | null;
  summaryEn?: string | null;
  synthetic?: boolean | null;
};

export type CategoryEvaluation = {
  id: HealthCategoryId;
  biomarkerColour: RiskColour;
  geneticColour: RiskColour | null;
  colour: RiskColour;
  geneticBadge: boolean;
  markers: MarkerResult[];
  snps: EvaluatedSnp[];
  rare: RareVariant[];
  latestMarkerCount: number;
  snpMatchCount: number;
};

function markerBelongs(
  markerCats: string[],
  categoryNames: string[]
) {
  // Exact match only — substring matching wrongly pulled Hormonal Health
  // markers (e.g. Cortisol) into Oncology via a corrupted "Cancer RiskHormonal Health" label.
  const normalized = new Set(markerCats.map((c) => c.trim().toLowerCase()));
  return categoryNames.some((n) => normalized.has(n.trim().toLowerCase()));
}

export function evaluateDigitalTwin(input: {
  sex: "male" | "female";
  snpRows: SnpRiskRow[];
  genotypes: Genotype[];
  markers: MarkerResult[];
  rare?: RareVariant[];
}): CategoryEvaluation[] {
  const genoMap = new Map(input.genotypes.map((g) => [g.snpId.toLowerCase(), g]));
  const cats = categoriesForSex(input.sex);
  const rare = input.rare ?? [];
  /** Base rsID when risk rows disambiguate duplicate SNPs as rsID__tag. */
  const baseSnpId = (snpId: string) => snpId.split("__")[0]!.toLowerCase();

  return cats.map((cat) => {
    // Only show SNPs that have a real genotype in the patient's DNA file.
    // Missing positions are omitted entirely (better than grey "no data").
    const snps = input.snpRows
      .filter((r) => matchPrimaryCategory(r.primaryCategory, cat))
      .map((r) =>
        evaluateSnp(
          r,
          genoMap.get(r.snpId.toLowerCase()) ??
            genoMap.get(baseSnpId(r.snpId)) ??
            null
        )
      )
      .filter((s) => s.genotypeAvailable);

    const markers = input.markers.filter((m) =>
      markerBelongs(m.categories, cat.markerCategoryNames)
    );

    const catRare = rare.filter((v) => rareGeneCategory(v.gene) === cat.id);

    const biomarkerColour = evaluateMarkerColour(markers);
    const geneticColour = geneticCategoryColour(snps);
    const combined = geneticColour
      ? combineCategoryColour(biomarkerColour, geneticColour)
      : { colour: biomarkerColour, geneticBadge: false };

    // NGS rare pathogenic findings force the category to red
    const hasRedRare = catRare.some((v) => rareMutationForcesRed(v.gene));
    const colour = hasRedRare
      ? maxColour([combined.colour, "red"])
      : combined.colour;

    const latestByKey = new Map<string, MarkerResult>();
    for (const m of markers) latestByKey.set(m.markerKey, m);

    return {
      id: cat.id,
      biomarkerColour,
      geneticColour,
      colour,
      geneticBadge: combined.geneticBadge,
      markers,
      snps,
      rare: catRare,
      latestMarkerCount: latestByKey.size,
      snpMatchCount: snps.filter((s) => s.matchCount > 0).length,
    };
  });
}

/** Plain-language category summary without diagnoses. */
export function summarizeCategory(
  evaluation: CategoryEvaluation,
  locale: "lt" | "en"
): string {
  const colour = evaluation.colour;
  const hasGeno = evaluation.snps.some((s) => s.genotypeAvailable);
  const abn = (() => {
    const latest = new Map<string, MarkerResult>();
    for (const m of evaluation.markers) latest.set(m.markerKey, m);
    return [...latest.values()].filter((m) => {
      if (m.flag === "high" || m.flag === "low") return true;
      if (m.refHigh != null && m.value > m.refHigh) return true;
      if (m.refLow != null && m.value < m.refLow) return true;
      return false;
    });
  })();

  if (locale === "lt") {
    const parts: string[] = [];
    if (colour === "grey") {
      parts.push(
        "Šiai sričiai dar trūksta pakankamai tyrimų duomenų, todėl vertinimas kol kas ribotas."
      );
    } else if (colour === "green") {
      parts.push(
        "Pagal turimus žymenis ši sritis atrodo rami — reikšmės daugiausia telpa į įprastas ribas."
      );
    } else if (colour === "yellow") {
      parts.push(
        "Matyti ankstyvas signalas: vienas ar keli žymenys yra ties riba arba šiek tiek nukrypę. Vertinga stebėti tendenciją."
      );
    } else if (colour === "orange") {
      parts.push(
        "Keletas žymenų rodo, kad šiai sričiai verta skirti daugiau dėmesio ir aptarti rezultatus su gydytoju."
      );
    } else {
      parts.push(
        "Turimi duomenys rodo ryškesnius nukrypimus. Tai nėra diagnozė — tai signalas prioritetui konsultacijai."
      );
    }
    if (abn.length) {
      parts.push(
        `Stebimi žymenys: ${abn
          .slice(0, 5)
          .map((m) => m.name || m.markerKey)
          .join(", ")}.`
      );
    }
    if (evaluation.rare.length) {
      parts.push(
        `NGS (išsamus genetinio kodo sekoskaitos tyrimas) rado ${evaluation.rare.length} retą(-as) mutaciją(-as): ${evaluation.rare
          .map((r) => r.gene)
          .join(", ")}. Tai kelia kategorijos signalą į raudoną — aptarkite su gydytoju genetiku.`
      );
    }
    if (!hasGeno) {
      parts.push(
        "Bazinio genetinio genotipavimo (SNP) rezultatai dar neįkelti — genetinė dalis bus papildyta gavus DNR failą."
      );
    } else if (evaluation.snpMatchCount > 0) {
      parts.push(
        `Genetikoje (bazinis SNP tyrimas) rasta ${evaluation.snpMatchCount} pozicijų su rizikos aleliais; jos paaiškintos atskirai prie kiekvieno geno.`
      );
    } else {
      parts.push(
        "Genetikoje (bazinis SNP tyrimas) šioje kategorijoje rizikos alelių sutapimų nerasta."
      );
    }
    return parts.join(" ");
  }

  const parts: string[] = [];
  if (colour === "grey") {
    parts.push("There is not enough lab data yet to assess this area confidently.");
  } else if (colour === "green") {
    parts.push("Based on available markers, this area looks calm — values mostly sit within usual ranges.");
  } else if (colour === "yellow") {
    parts.push("There is an early signal: one or a few markers are borderline or mildly off. Worth monitoring the trend.");
  } else if (colour === "orange") {
    parts.push("Several markers suggest this area deserves more attention and a discussion with your clinician.");
  } else {
    parts.push("Available data show clearer deviations. This is not a diagnosis — it is a signal to prioritise a consultation.");
  }
  if (abn.length) {
    parts.push(
      `Markers in focus: ${abn
        .slice(0, 5)
        .map((m) => m.name || m.markerKey)
        .join(", ")}.`
    );
  }
  if (evaluation.rare.length) {
    parts.push(
      `NGS found ${evaluation.rare.length} rare mutation(s): ${evaluation.rare
        .map((r) => r.gene)
        .join(", ")}. This raises the category signal to red — discuss with a clinical geneticist.`
    );
  }
  if (!hasGeno) {
    parts.push(
      "Microarray SNP genotyping results are not loaded yet — the genetic layer will appear once the DNA file is imported."
    );
  } else if (evaluation.snpMatchCount > 0) {
    parts.push(
      `Genetics (basic SNP test) flagged ${evaluation.snpMatchCount} positions with risk alleles; each gene card explains what that means.`
    );
  } else {
    parts.push(
      "Genetics (basic SNP test) found no risk-allele matches in this category."
    );
  }
  return parts.join(" ");
}
