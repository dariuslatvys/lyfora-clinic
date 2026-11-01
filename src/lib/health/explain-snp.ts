import type { Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "./colours";
import type { EvaluatedSnp } from "./evaluate";
import mechanismLtMap from "./snp_mechanism_lt.json";
import { humanizeMechanism } from "./plain-mechanism";

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

function impactPhrase(level: string | null | undefined, locale: Locale): string | null {
  if (!level) return null;
  const key = level.trim().toLowerCase();
  const lt: Record<string, string> = {
    high: "gana stiprus poveikio lygis",
    moderate: "vidutinis poveikio lygis",
    low: "nedidelis poveikio lygis",
    clinical: "klinikinėje praktikoje naudojamas poveikio lygis",
  };
  const en: Record<string, string> = {
    high: "a fairly strong influence level",
    moderate: "a moderate influence level",
    low: "a low influence level",
    clinical: "a clinically used influence level",
  };
  return (locale === "en" ? en : lt)[key] || null;
}

function evidencePhrase(level: string | null | undefined, locale: Locale): string | null {
  if (!level) return null;
  const key = level.trim().toLowerCase();
  const lt: Record<string, string> = {
    strong: "tvirtais moksliniais įrodymais",
    moderate: "vidutinio stiprumo moksliniais įrodymais",
    preliminary: "preliminariais (dar ankstyvais) įrodymais",
    low: "silpnesniais įrodymais",
    clinical: "klinikiniais stebėjimais ir praktika",
  };
  const en: Record<string, string> = {
    strong: "strong scientific evidence",
    moderate: "moderate scientific evidence",
    preliminary: "preliminary (early) evidence",
    low: "weaker evidence",
    clinical: "clinical observations and practice",
  };
  return (locale === "en" ? en : lt)[key] || null;
}

function matchPlain(matchCount: number, locale: Locale): string {
  if (locale === "en") {
    if (matchCount <= 0) return "you do not carry risk alleles at this position";
    if (matchCount === 1) return "you carry one risk allele (one copy)";
    return "you carry both risk alleles (two copies)";
  }
  if (matchCount <= 0) return "neturite rizikos alelių šioje pozicijoje";
  if (matchCount === 1) return "turite vieną rizikos alelį (vieną kopiją)";
  return "turite abu rizikos alelius (dvi kopijas)";
}

function buildWhy(snp: EvaluatedSnp, locale: Locale): string {
  const rsId = displaySnpId(snp.snpId);
  const impact = impactPhrase(snp.impactLevel, locale);
  const evidence = evidencePhrase(snp.evidenceLevel, locale);
  const colour = colourWord(locale, snp.colour);

  if (locale === "en") {
    if (!snp.genotypeAvailable) {
      return `SNP ${rsId} belongs to the ${snp.gene} gene. The DNA result for this position is not loaded yet, so a personal colour cannot be assigned.`;
    }
    let text = `SNP ${rsId} belongs to the ${snp.gene} gene. Based on your genetic data, ${matchPlain(snp.matchCount, "en")}.`;
    if (snp.matchCount > 0 && impact && evidence) {
      text += ` This is ${impact}, supported by ${evidence}.`;
    } else if (snp.matchCount > 0 && impact) {
      text += ` This is ${impact}.`;
    } else if (snp.matchCount > 0 && evidence) {
      text += ` The finding is supported by ${evidence}.`;
    }
    if (snp.matchCount > 0 && snp.colour) {
      text += ` That is why this result is marked “${colour}”.`;
    } else if (snp.matchCount === 0) {
      text += ` The genotype is known and does not carry risk alleles here, so it is marked “${colour}”.`;
    }
    return text;
  }

  if (!snp.genotypeAvailable) {
    return `SNP ${rsId} priklauso genui ${snp.gene}. Šios pozicijos DNR rezultatas dar neįkeltas, todėl asmeninės spalvos priskirti negalima.`;
  }

  let text = `SNP ${rsId} priklauso genui ${snp.gene}. Pagal jūsų genetinius duomenis ${matchPlain(snp.matchCount, "lt")}.`;
  if (snp.matchCount > 0 && impact && evidence) {
    text += ` Tai ${impact}, paremtas ${evidence}.`;
  } else if (snp.matchCount > 0 && impact) {
    text += ` Tai ${impact}.`;
  } else if (snp.matchCount > 0 && evidence) {
    text += ` Radinys paremtas ${evidence}.`;
  }
  if (snp.matchCount > 0 && snp.colour) {
    text += ` Todėl rezultatas pažymėtas kaip „${colour}“.`;
  } else if (snp.matchCount === 0) {
    text += ` Genotipas žinomas ir rizikos alelių čia nėra, todėl pažymėta kaip „${colour}“.`;
  }
  return text;
}

export function explainSnp(snp: EvaluatedSnp, locale: Locale): SnpExplanation {
  const rsId = displaySnpId(snp.snpId);
  const gt = snp.genotypeAvailable
    ? `${snp.allele1}/${snp.allele2}`
    : null;

  const raw =
    locale === "lt"
      ? LT_MAP[snp.snpId]?.trim() || snp.mechanism?.trim() || ""
      : snp.mechanism?.trim() || "";

  if (locale === "en") {
    return {
      title: `${snp.gene} · ${rsId}`,
      genotypeLine: gt
        ? `Your genotype: ${gt}`
        : "Genotype not available yet",
      whyColour: buildWhy(snp, "en"),
      subcategoryLine: snp.subcategory
        ? `Focus area: ${snp.subcategory}`
        : null,
      plainBody: humanizeMechanism(raw, "en"),
      disclaimer:
        "Plain-language explanation based on gene, SNP, impact/evidence levels and the Mechanism notes — not a diagnosis or a prescription change. Discuss medicines and doses only with your clinician.",
    };
  }

  return {
    title: `${snp.gene} · ${rsId}`,
    genotypeLine: gt ? `Jūsų genotipas: ${gt}` : "Genotipas dar neprieinamas",
    whyColour: buildWhy(snp, "lt"),
    subcategoryLine: snp.subcategory
      ? `Sritis: ${snp.subcategory}`
      : null,
    plainBody: humanizeMechanism(raw, "lt"),
    disclaimer:
      "Paaiškinimas paprasta kalba pagal geno, SNP, poveikio / įrodymų lygį ir Mechanism gaires. Tai nėra diagnozė ir ne vaisto skyrimo keitimas — dozes ir gydymą aptarkite tik su gydytoju.",
  };
}
