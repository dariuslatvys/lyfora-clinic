import type { Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "./colours";
import type { EvaluatedSnp } from "./evaluate";
import mechanismLtMap from "./snp_mechanism_lt.json";

const LT_MAP = mechanismLtMap as Record<string, string>;

export type SnpExplanation = {
  title: string;
  genotypeLine: string;
  whyColour: string;
  subcategoryLine: string | null;
  plainBody: string;
  disclaimer: string;
};

function colourWord(locale: Locale, colour: RiskColour | null): string {
  if (!colour) return locale === "en" ? "no colour signal" : "be spalvos signalo";
  const lt: Record<RiskColour, string> = {
    grey: "nepakanka duomenų",
    green: "gerai / ramu",
    yellow: "stebėti",
    orange: "dėmesio",
    red: "kritiška",
    badge: "genetinis žymuo",
  };
  const en: Record<RiskColour, string> = {
    grey: "insufficient data",
    green: "good / calm",
    yellow: "watch",
    orange: "attention",
    red: "critical",
    badge: "genetic badge",
  };
  return locale === "en" ? en[colour] : lt[colour];
}

function displaySnpId(snpId: string): string {
  return snpId.split("__")[0] ?? snpId;
}

export function explainSnp(snp: EvaluatedSnp, locale: Locale): SnpExplanation {
  const colour = snp.colour;
  const rsId = displaySnpId(snp.snpId);
  const gt = snp.genotypeAvailable
    ? `${snp.allele1}/${snp.allele2}`
    : null;

  if (locale === "en") {
    const why =
      !snp.genotypeAvailable
        ? "The DNA file for this position is not loaded yet, so a personal colour cannot be assigned."
        : snp.matchCount === 0
          ? `Your genotype ${gt} has no risk alleles at this SNP, so it does not raise the category colour.`
          : snp.matchCount === 1
            ? `Your genotype ${gt} carries 1 risk allele. In the risk matrix that maps to “${colourWord("en", colour)}” (Match 1).`
            : `Your genotype ${gt} carries 2 risk alleles. In the risk matrix that maps to “${colourWord("en", colour)}” (Match 2) — the stronger of the two match levels.`;

    return {
      title: `${snp.gene} · ${rsId}`,
      genotypeLine: gt
        ? `Your result: ${gt} · ${snp.matchCount} risk allele(s)`
        : "Genotype not available yet",
      whyColour: why,
      subcategoryLine: snp.subcategory
        ? `Focus area: ${snp.subcategory}`
        : null,
      plainBody:
        snp.mechanism?.trim() ||
        "No mechanism text is available for this SNP in the reference table.",
      disclaimer:
        "This is information from the Mechanism column of the gene–SNP risk table, written for understanding — not a diagnosis or a prescription change. Discuss medicines and doses only with your clinician.",
    };
  }

  const why =
    !snp.genotypeAvailable
      ? "Šios pozicijos DNR rezultatas dar neįkeltas, todėl asmeninės spalvos priskirti negalima."
      : snp.matchCount === 0
        ? `Jūsų genotipas ${gt} šioje SNP pozicijoje neturi rizikos alelių, todėl kategorijos spalvos nekelia.`
        : snp.matchCount === 1
          ? `Jūsų genotipas ${gt} turi 1 rizikos alelį. Pagal rizikos matricą (stulpelis Match 1) tai atitinka signalą „${colourWord("lt", colour)}“.`
          : `Jūsų genotipas ${gt} turi 2 rizikos alelius. Pagal rizikos matricą (stulpelis Match 2) tai atitinka stipresnį signalą „${colourWord("lt", colour)}“.`;

  const plainBody =
    LT_MAP[snp.snpId]?.trim() ||
    (snp.mechanism
      ? `Pagal rizikos lentelės Mechanism stulpelį: ${snp.mechanism}`
      : "Šiam SNP Mechanism paaiškinimas lentelėje dar nepateiktas.");

  return {
    title: `${snp.gene} · ${rsId}`,
    genotypeLine: gt
      ? `Jūsų rezultatas: ${gt} · ${snp.matchCount} rizikos aleliai (-ių)`
      : "Genotipas dar neprieinamas",
    whyColour: why,
    subcategoryLine: snp.subcategory
      ? `Sritis: ${snp.subcategory}`
      : null,
    plainBody,
    disclaimer:
      "Tai informacija pagal rizikos lentelės Mechanism stulpelį, pateikta paprasta kalba. Tai nėra diagnozė ir ne vaisto skyrimo keitimas — dozes ir gydymą aptarkite tik su gydytoju.",
  };
}
