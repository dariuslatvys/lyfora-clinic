import { colourRank, type RiskColour } from "./colours";
import {
  mapDrugToPharmaFocus,
  parseMedicationLabel,
  type DrugLookupInput,
} from "./drug-pharma-map";
import { pharmaSubcategoryLabel } from "./pharma-plain";

export type GeneRiskSnp = {
  gene: string;
  snpId: string;
  allele1: string | null;
  allele2: string | null;
  matchCount: number;
  colour: RiskColour | null;
  genotypeAvailable: boolean;
  subcategory: string | null;
};

export type DrugGeneRiskHit = {
  gene: string;
  snpId: string;
  allele1: string | null;
  allele2: string | null;
  matchCount: number;
  colour: RiskColour;
  subcategory: string;
  focusLabel: string;
  href: string;
};

export type DrugGeneRiskAssessment = {
  hasPanelLink: boolean;
  /** True when at least one related gene has risk alleles (matchCount > 0). */
  hasRisk: boolean;
  worstColour: RiskColour | null;
  hits: DrugGeneRiskHit[];
  focusLabels: string[];
};

export function assessDrugGeneRisk(
  input: DrugLookupInput,
  snps: GeneRiskSnp[],
  locale: "lt" | "en"
): DrugGeneRiskAssessment {
  const focuses = mapDrugToPharmaFocus(input);
  if (!focuses.length) {
    return {
      hasPanelLink: false,
      hasRisk: false,
      worstColour: null,
      hits: [],
      focusLabels: [],
    };
  }

  const focusKeys = new Set(
    focuses.map((f) => f.subcategory.trim().toLowerCase())
  );
  const related = snps.filter((s) =>
    focusKeys.has((s.subcategory || "").trim().toLowerCase())
  );

  const hits: DrugGeneRiskHit[] = related
    .filter((s) => s.genotypeAvailable && (s.matchCount || 0) > 0)
    .map((s) => {
      const subcategory = (s.subcategory || "").trim();
      return {
        gene: s.gene,
        snpId: s.snpId,
        allele1: s.allele1,
        allele2: s.allele2,
        matchCount: s.matchCount,
        colour: (s.colour || "yellow") as RiskColour,
        subcategory,
        focusLabel:
          pharmaSubcategoryLabel(subcategory, locale) || subcategory,
        href: `/patient/snp/${encodeURIComponent(s.snpId)}?cat=pharmacogenetics`,
      };
    })
    .sort(
      (a, b) =>
        colourRank(b.colour) - colourRank(a.colour) ||
        b.matchCount - a.matchCount ||
        a.gene.localeCompare(b.gene)
    );

  let worst: RiskColour | null = null;
  for (const h of hits) {
    if (!worst || colourRank(h.colour) > colourRank(worst)) worst = h.colour;
  }

  return {
    hasPanelLink: true,
    hasRisk: hits.length > 0,
    worstColour: worst,
    hits,
    focusLabels: focuses.map((f) =>
      locale === "en" ? f.reasonEn : f.reasonLt
    ),
  };
}

export function assessLabelGeneRisk(
  label: string,
  snps: GeneRiskSnp[],
  locale: "lt" | "en",
  extra?: Partial<DrugLookupInput>
) {
  return assessDrugGeneRisk(
    { ...parseMedicationLabel(label), ...extra, label },
    snps,
    locale
  );
}

export const GENE_RISK_DISCLAIMER_LT =
  "Tai informacinis genetikos signalas, ne diagnozė ir ne rekomendacija nutraukti ar keisti vaistus. Būtinai pasikonsultuokite su gydytoju prieš bet kokius gydymo pakeitimus.";

export const GENE_RISK_DISCLAIMER_EN =
  "This is an informational genetics signal — not a diagnosis and not advice to stop or change medicines. Always consult your doctor before any treatment changes.";

export function geneRiskDisclaimer(locale: "lt" | "en") {
  return locale === "en" ? GENE_RISK_DISCLAIMER_EN : GENE_RISK_DISCLAIMER_LT;
}
