import labsJson from "../../../data/parsed/marketplace_labs.json";

export type MarketCategory =
  | "consultations"
  | "labs"
  | "genetics"
  | "wellness";

export type MarketKind = "single" | "package";

export type MarketItem = {
  id: string;
  category: MarketCategory;
  kind: MarketKind;
  nameLt: string;
  nameEn: string;
  summaryLt: string;
  summaryEn: string;
  priceEur: number;
  /** Optional list price before clinic markup (labs from source file). */
  basePriceEur?: number;
  durationMin?: number;
  badgeLt?: string;
  badgeEn?: string;
  metaLt?: string;
  metaEn?: string;
  includes?: string[];
  geneCount?: number;
  code?: string;
};

const labSingles: MarketItem[] = (
  labsJson.labSingles as {
    id: string;
    nameLt: string;
    nameEn: string;
    groupLt: string;
    price: number;
    basePrice: number;
  }[]
).map((r) => ({
  id: r.id,
  category: "labs" as const,
  kind: "single" as const,
  nameLt: r.nameLt,
  nameEn: r.nameEn,
  summaryLt: r.groupLt,
  summaryEn: r.groupLt,
  priceEur: r.price,
  basePriceEur: r.basePrice,
  badgeLt: "Vienetinis",
  badgeEn: "Single test",
}));

const labPackages: MarketItem[] = (
  labsJson.labPackages as {
    id: string;
    nameLt: string;
    nameEn: string;
    tier: string;
    price: number;
    basePrice: number;
    testCount: number | null;
    includes: string[];
  }[]
).map((r) => ({
  id: r.id,
  category: "labs" as const,
  kind: "package" as const,
  nameLt: r.nameLt,
  nameEn: r.nameEn,
  summaryLt:
    r.testCount != null
      ? `${r.testCount} tyrimai · klinikinė kaina aukštesnė nei šaltinio faile`
      : "Kompleksinis laboratorinių tyrimų paketas",
  summaryEn:
    r.testCount != null
      ? `${r.testCount} markers · clinic price above source file`
      : "Bundled laboratory package",
  priceEur: r.price,
  basePriceEur: r.basePrice,
  badgeLt: r.tier === "full" ? "FULL paketas" : r.tier === "core" ? "CORE paketas" : "Paketas",
  badgeEn: r.tier === "full" ? "FULL package" : r.tier === "core" ? "CORE package" : "Package",
  includes: r.includes,
  metaLt: r.testCount != null ? `${r.testCount} analitės` : undefined,
  metaEn: r.testCount != null ? `${r.testCount} analytes` : undefined,
}));

/** CeGaT Cardiac Diseases gene sets (HRT) — prices aligned with typical EU NGS panel quotes. */
const genetics: MarketItem[] = [
  {
    id: "gen-hrt01",
    category: "genetics",
    kind: "package",
    code: "HRT01",
    nameLt: "Dilatuota kardiomiopatija",
    nameEn: "Dilated Cardiomyopathy",
    summaryLt:
      "CeGaT tipo genų rinkinys (HRT01) — 58 genai, susiję su dilatuota kardiomiopatija.",
    summaryEn:
      "CeGaT-style gene set (HRT01) — 58 genes linked to dilated cardiomyopathy.",
    priceEur: 890,
    geneCount: 58,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    includes: ["MYBPC3", "MYH7", "TTN", "LMNA", "RBM20", "SCN5A", "+52"],
  },
  {
    id: "gen-hrt02",
    category: "genetics",
    kind: "package",
    code: "HRT02",
    nameLt: "Hipertrofinė kardiomiopatija",
    nameEn: "Hypertrophic Cardiomyopathy",
    summaryLt: "HRT02 — 37 genai hipertrofinei kardiomiopatijai.",
    summaryEn: "HRT02 — 37 genes for hypertrophic cardiomyopathy.",
    priceEur: 790,
    geneCount: 37,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    includes: ["MYBPC3", "MYH7", "TNNT2", "TNNI3", "TPM1", "GLA", "+31"],
  },
  {
    id: "gen-hrt03",
    category: "genetics",
    kind: "package",
    code: "HRT03",
    nameLt: "Kairiojo skilvelio nekompaktiškumas (LVNC)",
    nameEn: "Left Ventricular Noncompaction (LVNC)",
    summaryLt: "HRT03 — 17 genų NCCM/LVNC fenotipui.",
    summaryEn: "HRT03 — 17 genes for NCCM/LVNC phenotype.",
    priceEur: 690,
    geneCount: 17,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt04",
    category: "genetics",
    kind: "package",
    code: "HRT04",
    nameLt: "Trumpo QT sindromas",
    nameEn: "Short QT Syndrome",
    summaryLt: "HRT04 — 4 genai (KCNH2, KCNJ2, KCNQ1, SLC4A3).",
    summaryEn: "HRT04 — 4 genes (KCNH2, KCNJ2, KCNQ1, SLC4A3).",
    priceEur: 590,
    geneCount: 4,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt05",
    category: "genetics",
    kind: "package",
    code: "HRT05",
    nameLt: "Ilgo QT sindromas",
    nameEn: "Long QT Syndrome",
    summaryLt: "HRT05 — 11 genų ilgo QT sindromui.",
    summaryEn: "HRT05 — 11 genes for long QT syndrome.",
    priceEur: 650,
    geneCount: 11,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt06",
    category: "genetics",
    kind: "package",
    code: "HRT06",
    nameLt: "Aritmogeninė dešiniojo skilvelio displazija (ARVD/C)",
    nameEn: "Arrhythmogenic Right Ventricular Dysplasia (ARVD/C)",
    summaryLt: "HRT06 — 11 genų ARVD/C.",
    summaryEn: "HRT06 — 11 genes for ARVD/C.",
    priceEur: 650,
    geneCount: 11,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt07",
    category: "genetics",
    kind: "package",
    code: "HRT07",
    nameLt: "Brugada sindromas",
    nameEn: "Brugada Syndrome",
    summaryLt: "HRT07 — 8 genai Brugada sindromui.",
    summaryEn: "HRT07 — 8 genes for Brugada syndrome.",
    priceEur: 620,
    geneCount: 8,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt08",
    category: "genetics",
    kind: "package",
    code: "HRT08",
    nameLt: "Katecholaminerginė polimorfinė VT (CPVT)",
    nameEn: "Catecholaminergic Polymorphic VT (CPVT)",
    summaryLt: "HRT08 — 8 genai CPVT.",
    summaryEn: "HRT08 — 8 genes for CPVT.",
    priceEur: 620,
    geneCount: 8,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt17",
    category: "genetics",
    kind: "package",
    code: "HRT17",
    nameLt: "Širdies aritmijos (apjungiantis rinkinys)",
    nameEn: "Cardiac Arrhythmias (overarching set)",
    summaryLt:
      "HRT17 — 39 genai: Short/Long QT, ARVD/C, Brugada, CPVT ir susiję fenotipai.",
    summaryEn:
      "HRT17 — 39 genes covering Short/Long QT, ARVD/C, Brugada, CPVT and related phenotypes.",
    priceEur: 990,
    geneCount: 39,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt09",
    category: "genetics",
    kind: "package",
    code: "HRT09",
    nameLt: "Įgimtos širdies ydos (izoliuotos ir sindrominės)",
    nameEn: "Isolated and Syndromal Congenital Heart Defects",
    summaryLt: "HRT09 — 126 genai įgimtoms širdies ydoms.",
    summaryEn: "HRT09 — 126 genes for congenital heart defects.",
    priceEur: 1290,
    geneCount: 126,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
  },
  {
    id: "gen-hrt-lipid",
    category: "genetics",
    kind: "package",
    code: "HRT-LIP",
    nameLt: "Šeiminė hiperlipidemia / dislipidemija",
    nameEn: "Familial Hypercholesterolemia / Dyslipidemia",
    summaryLt:
      "18 genų: LDLR, APOB, PCSK9, ABCG5/8, LPL ir kt. (CeGaT kardiologinio skydelio lipidų rinkinys).",
    summaryEn:
      "18 genes: LDLR, APOB, PCSK9, ABCG5/8, LPL and more (CeGaT cardiac panel lipid set).",
    priceEur: 690,
    geneCount: 18,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    includes: ["LDLR", "APOB", "PCSK9", "APOE", "LPL", "ABCG5", "+12"],
  },
  {
    id: "gen-hrt-full",
    category: "genetics",
    kind: "package",
    code: "HRT-FULL",
    nameLt: "Pilnas širdies ligų NGS skydelis",
    nameEn: "Full Cardiac Diseases NGS Panel",
    summaryLt:
      "Visas Cardiac Diseases skydelis (~257 genai): kardiomiopatijos, aritmijos, lipidai, įgimtos ydos.",
    summaryEn:
      "Full Cardiac Diseases panel (~257 genes): cardiomyopathies, arrhythmias, lipids, congenital defects.",
    priceEur: 2490,
    geneCount: 257,
    badgeLt: "Pilnas skydelis",
    badgeEn: "Full panel",
  },
  {
    id: "gen-pgx",
    category: "genetics",
    kind: "package",
    code: "PGX",
    nameLt: "Farmakogenetika (PGX)",
    nameEn: "Pharmacogenetics (PGX)",
    summaryLt:
      "21 geno farmakogenetinis profilis — vaistų metabolizmas, tolerancija ir dozavimas.",
    summaryEn:
      "21-gene pharmacogenetic profile — drug metabolism, tolerance and dosing.",
    priceEur: 390,
    geneCount: 21,
    badgeLt: "Papildoma analizė",
    badgeEn: "Add-on analysis",
  },
  {
    id: "gen-acmg",
    category: "genetics",
    kind: "single",
    code: "ACMG",
    nameLt: "ACMG antriniai radiniai",
    nameEn: "ACMG Secondary Findings",
    summaryLt:
      "Papildoma ACMG 4/5 klasės patogeninių variantų ataskaita (antriniai radiniai).",
    summaryEn:
      "Optional ACMG class 4/5 pathogenic secondary-findings report.",
    priceEur: 190,
    badgeLt: "Priedas",
    badgeEn: "Add-on",
  },
  {
    id: "gen-snp",
    category: "genetics",
    kind: "single",
    code: "SNP",
    nameLt: "Bazinis genetinis genotipavimas (SNP microarray)",
    nameEn: "Microarray SNP Genotyping Test",
    summaryLt:
      "Platus SNP genotipavimas sveikatos kategorijoms ir rizikos aleliams skaitmeniniame dvyne.",
    summaryEn:
      "Broad SNP genotyping for digital-twin health categories and risk alleles.",
    priceEur: 450,
    badgeLt: "Vienetinis",
    badgeEn: "Single test",
  },
  {
    id: "gen-ngs-exome",
    category: "genetics",
    kind: "package",
    code: "NGS",
    nameLt: "Išsamus genetinio kodo sekoskaitos tyrimas (NGS)",
    nameEn: "Next-Generation Sequencing (NGS) Test",
    summaryLt:
      "Retų genų mutacijų ir paveldimų ligų rizikos paieška nuskaitant giliąją DNR seką (ExomeXtra® tipo).",
    summaryEn:
      "Deep DNA sequencing to detect rare genetic mutations and hereditary disease risks (ExomeXtra®-style).",
    priceEur: 1890,
    badgeLt: "Išsamus NGS",
    badgeEn: "Comprehensive NGS",
  },
];

const consultations: MarketItem[] = [
  {
    id: "con-gp-30",
    category: "consultations",
    kind: "single",
    nameLt: "Šeimos gydytojo konsultacija",
    nameEn: "GP consultation",
    summaryLt: "Pirminė arba pakartotinė konsultacija klinikoje arba online.",
    summaryEn: "Initial or follow-up visit in clinic or online.",
    priceEur: 65,
    durationMin: 30,
    badgeLt: "30 min",
    badgeEn: "30 min",
  },
  {
    id: "con-cardio-45",
    category: "consultations",
    kind: "single",
    nameLt: "Kardiologo konsultacija",
    nameEn: "Cardiologist consultation",
    summaryLt: "Širdies ir kraujagyslių rizikos, tyrimų ir genetikos rezultatų aptarimas.",
    summaryEn: "Cardiovascular risk, labs and genetics results review.",
    priceEur: 120,
    durationMin: 45,
    badgeLt: "45 min",
    badgeEn: "45 min",
  },
  {
    id: "con-gastro-40",
    category: "consultations",
    kind: "single",
    nameLt: "Gastroenterologo konsultacija",
    nameEn: "Gastroenterologist consultation",
    summaryLt: "Virškinimo trakto simptomai, H. pylori, endoskopijų planavimas.",
    summaryEn: "GI symptoms, H. pylori, endoscopy planning.",
    priceEur: 110,
    durationMin: 40,
    badgeLt: "40 min",
    badgeEn: "40 min",
  },
  {
    id: "con-endo-40",
    category: "consultations",
    kind: "single",
    nameLt: "Endokrinologo konsultacija",
    nameEn: "Endocrinologist consultation",
    summaryLt: "Hormonų, skydliaukės, metabolizmo ir miego klausimai.",
    summaryEn: "Hormones, thyroid, metabolism and sleep.",
    priceEur: 115,
    durationMin: 40,
    badgeLt: "40 min",
    badgeEn: "40 min",
  },
  {
    id: "con-genetics-60",
    category: "consultations",
    kind: "single",
    nameLt: "Klinikinio genetiiko konsultacija",
    nameEn: "Clinical geneticist consultation",
    summaryLt: "NGS / SNP rezultatų išaiškinimas ir šeimos rizikos planas.",
    summaryEn: "NGS / SNP result counselling and family-risk plan.",
    priceEur: 160,
    durationMin: 60,
    badgeLt: "60 min",
    badgeEn: "60 min",
  },
  {
    id: "con-urgent-20",
    category: "consultations",
    kind: "single",
    nameLt: "Skubi online konsultacija 24/7",
    nameEn: "Urgent online consult 24/7",
    summaryLt: "Greitas ryšys su budinčiu gydytoju dėl ūmaus skausmo ar simptomų.",
    summaryEn: "Fast link to an on-call doctor for acute pain or symptoms.",
    priceEur: 89,
    durationMin: 20,
    badgeLt: "Skubu",
    badgeEn: "Urgent",
  },
  {
    id: "con-pkg-annual",
    category: "consultations",
    kind: "package",
    nameLt: "Metinis priežiūros paketas",
    nameEn: "Annual care package",
    summaryLt:
      "4 planinės konsultacijos + prioritetinis chat + 1 genetikos rezultatų aptarimas.",
    summaryEn:
      "4 planned consults + priority chat + 1 genetics results review.",
    priceEur: 490,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: [
      "4× gydytojo vizitai",
      "Prioritetinis chat",
      "1× genetikos aptarimas",
      "Rezultatų santrauka",
    ],
  },
  {
    id: "con-pkg-cardio",
    category: "consultations",
    kind: "package",
    nameLt: "Širdies stebėsenos paketas",
    nameEn: "Heart monitoring package",
    summaryLt: "Kardiologas + slaugytoja + EKG interpretacija per 3 mėnesius.",
    summaryEn: "Cardiologist + nurse + ECG interpretation over 3 months.",
    priceEur: 320,
    badgeLt: "Paketas",
    badgeEn: "Package",
  },
];

const wellness: MarketItem[] = [
  {
    id: "wel-massage-60",
    category: "wellness",
    kind: "single",
    nameLt: "Klasikinis masažas",
    nameEn: "Classic massage",
    summaryLt: "Viso kūno atpalaiduojantis masažas su šiltais aliejais.",
    summaryEn: "Full-body relaxation massage with warm oils.",
    priceEur: 69,
    durationMin: 60,
    badgeLt: "60 min",
    badgeEn: "60 min",
  },
  {
    id: "wel-massage-sport",
    category: "wellness",
    kind: "single",
    nameLt: "Sportinis / gilusis masažas",
    nameEn: "Sports / deep-tissue massage",
    summaryLt: "Raumenų įtampai, po treniruočių ar sėdimo darbo.",
    summaryEn: "For muscle tension after training or desk work.",
    priceEur: 79,
    durationMin: 60,
    badgeLt: "60 min",
    badgeEn: "60 min",
  },
  {
    id: "wel-massage-pkg5",
    category: "wellness",
    kind: "package",
    nameLt: "5 masažų abonementas",
    nameEn: "5-massage pass",
    summaryLt: "5× 60 min klasikinis arba sportinis masažas per 3 mėn.",
    summaryEn: "5× 60 min classic or sports massage within 3 months.",
    priceEur: 310,
    badgeLt: "Paketas",
    badgeEn: "Package",
    metaLt: "Sutaupote ~35 €",
    metaEn: "Save ~€35",
  },
  {
    id: "wel-spa-day",
    category: "wellness",
    kind: "single",
    nameLt: "SPA diena klinikoje",
    nameEn: "Clinic SPA day",
    summaryLt: "Pirtis, kūno šveitimas, 45 min masažas ir arbatos ritualas.",
    summaryEn: "Sauna, body scrub, 45 min massage and tea ritual.",
    priceEur: 149,
    durationMin: 180,
    badgeLt: "~3 val.",
    badgeEn: "~3 hrs",
  },
  {
    id: "wel-spa-couple",
    category: "wellness",
    kind: "package",
    nameLt: "Porų SPA vakaras",
    nameEn: "Couples SPA evening",
    summaryLt: "Dviem: SPA zona, sinchroninis masažas ir lengvi užkandžiai.",
    summaryEn: "For two: SPA zone, synchronised massage and light snacks.",
    priceEur: 279,
    badgeLt: "Paketas",
    badgeEn: "Package",
  },
  {
    id: "wel-spa-detox",
    category: "wellness",
    kind: "package",
    nameLt: "Detox & recovery savaitgalis",
    nameEn: "Detox & recovery weekend",
    summaryLt: "2 dienos: SPA, 2 masažai, kvėpavimo sesija ir miego higienos planas.",
    summaryEn: "2 days: SPA, 2 massages, breathwork and a sleep-hygiene plan.",
    priceEur: 420,
    badgeLt: "Paketas",
    badgeEn: "Package",
  },
  {
    id: "wel-diet-intro",
    category: "wellness",
    kind: "single",
    nameLt: "Dietologo konsultacija",
    nameEn: "Dietitian consultation",
    summaryLt: "Mitybos anamnezė, tikslai ir pirmasis savaitės planas.",
    summaryEn: "Nutrition history, goals and a first weekly plan.",
    priceEur: 85,
    durationMin: 50,
    badgeLt: "50 min",
    badgeEn: "50 min",
  },
  {
    id: "wel-diet-follow",
    category: "wellness",
    kind: "single",
    nameLt: "Dietologo pakartotinis vizitas",
    nameEn: "Dietitian follow-up",
    summaryLt: "Plano korekcija pagal tyrimus ir savijautą.",
    summaryEn: "Plan adjustment based on labs and how you feel.",
    priceEur: 55,
    durationMin: 30,
    badgeLt: "30 min",
    badgeEn: "30 min",
  },
  {
    id: "wel-diet-pkg",
    category: "wellness",
    kind: "package",
    nameLt: "8 sav. mitybos mentorystė",
    nameEn: "8-week nutrition mentorship",
    summaryLt:
      "Įžanga + 3 kontrolės + savaitiniai meniu + chat palaikymas.",
    summaryEn:
      "Intro + 3 check-ins + weekly menus + chat support.",
    priceEur: 320,
    badgeLt: "Paketas",
    badgeEn: "Package",
  },
  {
    id: "wel-recovery-pkg",
    category: "wellness",
    kind: "package",
    nameLt: "Atstatymo paketas po streso",
    nameEn: "Post-stress recovery package",
    summaryLt: "Dietologas + 3 masažai + 1 SPA diena.",
    summaryEn: "Dietitian + 3 massages + 1 SPA day.",
    priceEur: 399,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: ["1× dietologas", "3× masažas", "1× SPA diena"],
  },
];

export const MARKET_CATEGORIES: {
  id: MarketCategory;
  lt: string;
  en: string;
  blurbLt: string;
  blurbEn: string;
}[] = [
  {
    id: "consultations",
    lt: "Konsultacijos",
    en: "Consultations",
    blurbLt: "Gydytojų vizitai ir priežiūros paketai.",
    blurbEn: "Doctor visits and care packages.",
  },
  {
    id: "labs",
    lt: "Laboratoriniai tyrimai",
    en: "Laboratory tests",
    blurbLt: "Vienetiniai žymenys ir CORE/FULL paketai iš Markers lentelės.",
    blurbEn: "Single markers and CORE/FULL packages from the Markers table.",
  },
  {
    id: "genetics",
    lt: "Genetiniai tyrimai",
    en: "Genetic tests",
    blurbLt: "CeGaT Cardiac Diseases gene sets, SNP, NGS ir PGX.",
    blurbEn: "CeGaT Cardiac Diseases gene sets, SNP, NGS and PGX.",
  },
  {
    id: "wellness",
    lt: "Sveikatingumo paslaugos",
    en: "Wellness services",
    blurbLt: "Masažai, SPA ir dietologo paslaugos — vienetinės ir paketai.",
    blurbEn: "Massage, SPA and dietitian services — singles and packages.",
  },
];

export const MARKETPLACE_ITEMS: MarketItem[] = [
  ...consultations,
  ...labPackages,
  ...labSingles,
  ...genetics,
  ...wellness,
];

export function formatEur(n: number, locale: "lt" | "en") {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "lt-LT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}
