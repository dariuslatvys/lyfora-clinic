import type { Locale } from "@/lib/i18n/dictionary";
import type { DnaSnpResult } from "./dna-panel";
import type { RiskColour } from "./colours";
import mechanismLtMap from "./snp_mechanism_lt.json";
import mechanismEnMap from "./snp_mechanism_en.json";
import { humanizeMechanism } from "./plain-mechanism";

const LT_MAP = mechanismLtMap as Record<string, string>;
const EN_MAP = mechanismEnMap as Record<string, string>;

export type DnaSnpExplanation = {
  genotypeLine: string;
  whyColour: string;
  plainParas: string[];
  disclaimer: string;
};

function colourWord(locale: Locale, colour: DnaSnpResult["colour"]): string {
  if (colour === "none") {
    return locale === "en" ? "not determined" : "nenustatyta";
  }
  const lt: Record<RiskColour, string> = {
    grey: "nepakanka duomenų",
    green: "nėra rizikos",
    yellow: "nedidelė",
    orange: "padidėjusi",
    red: "ženkli",
    badge: "nedidelė",
  };
  const en: Record<RiskColour, string> = {
    grey: "insufficient data",
    green: "no risk",
    yellow: "low",
    orange: "elevated",
    red: "significant",
    badge: "low",
  };
  return locale === "en" ? en[colour] : lt[colour];
}

function impactPhrase(level: string, locale: Locale): string | null {
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

function evidencePhrase(level: string, locale: Locale): string | null {
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

function buildWhy(row: DnaSnpResult, locale: Locale): string {
  const impact = impactPhrase(row.impact, locale);
  const evidence = evidencePhrase(row.evidence, locale);
  const colour = colourWord(locale, row.colour);

  if (locale === "en") {
    if (row.matchCount == null) {
      return `SNP ${row.snpId} belongs to the ${row.gene} gene. The DNA result for this position is not loaded yet, so a personal colour cannot be assigned.`;
    }
    let text = `SNP ${row.snpId} belongs to the ${row.gene} gene. Based on your genetic data, ${matchPlain(row.matchCount, "en")}.`;
    if (row.matchCount > 0 && impact && evidence) {
      text += ` This is ${impact}, supported by ${evidence}.`;
    } else if (row.matchCount > 0 && impact) {
      text += ` This is ${impact}.`;
    } else if (row.matchCount > 0 && evidence) {
      text += ` The finding is supported by ${evidence}.`;
    }
    if (row.matchCount > 0) {
      text += ` That is why this result is marked “${colour}”.`;
    } else {
      text += ` The genotype is known and does not carry risk alleles here, so it is marked “${colour}”.`;
    }
    return text;
  }

  if (row.matchCount == null) {
    return `SNP ${row.snpId} priklauso genui ${row.gene}. Šios pozicijos DNR rezultatas dar neįkeltas, todėl asmeninės spalvos priskirti negalima.`;
  }
  let text = `SNP ${row.snpId} priklauso genui ${row.gene}. Pagal jūsų genetinius duomenis ${matchPlain(row.matchCount, "lt")}.`;
  if (row.matchCount > 0 && impact && evidence) {
    text += ` Tai ${impact}, paremtas ${evidence}.`;
  } else if (row.matchCount > 0 && impact) {
    text += ` Tai ${impact}.`;
  } else if (row.matchCount > 0 && evidence) {
    text += ` Radinys paremtas ${evidence}.`;
  }
  if (row.matchCount > 0) {
    text += ` Todėl rezultatas pažymėtas kaip „${colour}“.`;
  } else {
    text += ` Genotipas žinomas ir rizikos alelių čia nėra, todėl pažymėta kaip „${colour}“.`;
  }
  return text;
}

function rawMechanism(row: DnaSnpResult, locale: Locale): string {
  if (locale === "en") {
    return (
      EN_MAP[row.snpId]?.trim() ||
      row.infoEn?.trim() ||
      ""
    );
  }
  return LT_MAP[row.snpId]?.trim() || row.infoLt?.trim() || "";
}

export function explainDnaSnp(
  row: DnaSnpResult,
  locale: Locale
): DnaSnpExplanation {
  const gt =
    row.allele1 && row.allele2 ? `${row.allele1}/${row.allele2}` : null;
  const raw = rawMechanism(row, locale);
  const plainBody = humanizeMechanism(raw, locale, {
    gene: row.gene,
    subcategory: row.primaryCategoryEn,
    matchCount: row.matchCount,
  });
  const plainParas = plainBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (locale === "en") {
    return {
      genotypeLine: gt
        ? `Your genotype: ${gt}${
            row.matchCount != null
              ? ` · risk alleles ${row.matchCount}/2 (effect allele ${row.effectAllele1})`
              : ""
          }`
        : "Genotype not available yet",
      whyColour: buildWhy(row, "en"),
      plainParas,
      disclaimer:
        "Plain-language explanation from the gene, your genotype, impact/evidence levels and mechanism notes — not a diagnosis or a prescription change. Discuss medicines and doses only with your clinician.",
    };
  }

  return {
    genotypeLine: gt
      ? `Jūsų genotipas: ${gt}${
          row.matchCount != null
            ? ` · rizikos aleliai ${row.matchCount}/2 (efekto alelis ${row.effectAllele1})`
            : ""
        }`
      : "Genotipas dar neprieinamas",
    whyColour: buildWhy(row, "lt"),
    plainParas,
    disclaimer:
      "Paaiškinimas paprasta kalba pagal geno, jūsų genotipo, poveikio / įrodymų lygį ir mechanizmo gaires. Tai nėra diagnozė ir ne vaisto skyrimo keitimas — dozes ir gydymą aptarkite tik su gydytoju.",
  };
}
