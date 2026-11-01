import type { Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "./colours";
import type { EvaluatedSnp } from "./evaluate";
import mechanismLtMap from "./snp_mechanism_lt.json";
import {
  humanizeMechanism,
  riskAllelePhrase,
  riskAllelePhraseObject,
} from "./plain-mechanism";

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
  const allelePhrase = riskAllelePhrase(snp.matchCount, locale);
  const alleleObject = riskAllelePhraseObject(snp.matchCount, locale);

  if (locale === "en") {
    const why =
      !snp.genotypeAvailable
        ? "The DNA file for this position is not loaded yet, so a personal colour cannot be assigned."
        : snp.matchCount === 0
          ? `Your genotype ${gt} has no risk alleles at this SNP, so it does not raise the category colour.`
          : snp.matchCount === 1
            ? `Your genotype ${gt} carries ${alleleObject}. In the risk matrix that maps to “${colourWord("en", colour)}” (Match 1).`
            : `Your genotype ${gt} carries ${alleleObject}. In the risk matrix that maps to “${colourWord("en", colour)}” (Match 2) — the stronger of the two match levels.`;

    const raw =
      snp.mechanism?.trim() ||
      "No mechanism text is available for this SNP in the reference table.";

    return {
      title: `${snp.gene} · ${rsId}`,
      genotypeLine: gt
        ? `Your result: ${gt} · ${allelePhrase}`
        : "Genotype not available yet",
      whyColour: why,
      subcategoryLine: snp.subcategory
        ? `Focus area: ${snp.subcategory}`
        : null,
      plainBody: humanizeMechanism(raw, "en"),
      disclaimer:
        "Plain-language explanation based on the Mechanism column — not a diagnosis or a prescription change. Discuss medicines and doses only with your clinician.",
    };
  }

  const why =
    !snp.genotypeAvailable
      ? "Šios pozicijos DNR rezultatas dar neįkeltas, todėl asmeninės spalvos priskirti negalima."
      : snp.matchCount === 0
        ? `Jūsų genotipas ${gt} šioje SNP pozicijoje neturi rizikos alelių, todėl kategorijos spalvos nekelia.`
        : snp.matchCount === 1
          ? `Jūsų genotipas ${gt} turi ${alleleObject}. Pagal rizikos matricą (stulpelis Match 1) tai atitinka signalą „${colourWord("lt", colour)}“.`
          : `Jūsų genotipas ${gt} turi ${alleleObject}. Pagal rizikos matricą (stulpelis Match 2) tai atitinka stipresnį signalą „${colourWord("lt", colour)}“.`;

  const raw =
    LT_MAP[snp.snpId]?.trim() ||
    snp.mechanism?.trim() ||
    "";

  return {
    title: `${snp.gene} · ${rsId}`,
    genotypeLine: gt
      ? `Jūsų rezultatas: ${gt} · ${allelePhrase}`
      : "Genotipas dar neprieinamas",
    whyColour: why,
    subcategoryLine: snp.subcategory
      ? `Sritis: ${snp.subcategory}`
      : null,
    plainBody: humanizeMechanism(raw, "lt"),
    disclaimer:
      "Paaiškinimas paprasta kalba pagal rizikos lentelės Mechanism gaires. Tai nėra diagnozė ir ne vaisto skyrimo keitimas — dozes ir gydymą aptarkite tik su gydytoju.",
  };
}
