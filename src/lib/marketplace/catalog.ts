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
  /** Longer description shown in package / item detail. */
  detailLt?: string;
  detailEn?: string;
  priceEur: number;
  durationMin?: number;
  badgeLt?: string;
  badgeEn?: string;
  metaLt?: string;
  metaEn?: string;
  /** Included markers / services (lab packages) or short gene preview. */
  includes?: string[];
  /** Full gene list for genetics packages (CeGaT-style). */
  genes?: string[];
  geneCount?: number;
  code?: string;
  /** Lab group label for singles. */
  groupLt?: string;
  /** Where the service is delivered (clinic / SPA centre / partner). */
  venueLt?: string;
  venueEn?: string;
  /** Who delivers it (specialists, therapists, dietitians…). */
  specialistLt?: string;
  specialistEn?: string;
};

const labSingles: MarketItem[] = (
  labsJson.labSingles as {
    id: string;
    nameLt: string;
    nameEn: string;
    groupLt: string;
    price: number;
  }[]
).map((r) => ({
  id: r.id,
  category: "labs" as const,
  kind: "single" as const,
  nameLt: r.nameLt,
  nameEn: r.nameEn,
  summaryLt: r.groupLt,
  summaryEn: r.groupLt,
  detailLt: `Laboratorinis tyrimas iš Markers katalogo. Grupė: ${r.groupLt}.`,
  detailEn: `Laboratory test from the Markers catalogue. Group: ${r.groupLt}.`,
  priceEur: r.price,
  groupLt: r.groupLt,
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
    testCount: number | null;
    includes: string[];
  }[]
).map((r) => {
  const n = r.testCount ?? r.includes.length;
  return {
    id: r.id,
    category: "labs" as const,
    kind: "package" as const,
    nameLt: r.nameLt,
    nameEn: r.nameEn,
    summaryLt:
      r.tier === "full"
        ? `Išplėstas ${n} analitės rinkinys pagal Markers lentelę.`
        : `Bazinis ${n} analitės rinkinys greitam įvertinimui.`,
    summaryEn:
      r.tier === "full"
        ? `Expanded set of ${n} analytes from the Markers table.`
        : `Baseline set of ${n} analytes for a quick review.`,
    detailLt:
      r.tier === "full"
        ? `FULL laboratorinių tyrimų paketas pagal Markers_Category lentelę. Apima ${n} analites šiai sveikatos sričiai stebėti. Kaina su klinikinio administravimo mokesčiu.`
        : `CORE laboratorinių tyrimų paketas pagal Markers_Category lentelę. Apima ${n} bazines analites greitam įvertinimui. Kaina su klinikinio administravimo mokesčiu.`,
    detailEn:
      r.tier === "full"
        ? `FULL lab package from the Markers_Category table. Includes ${n} analytes for monitoring this health area. Clinic administration included in the price.`
        : `CORE lab package from the Markers_Category table. Includes ${n} baseline analytes for a quick review. Clinic administration included in the price.`,
    priceEur: r.price,
    badgeLt:
      r.tier === "full"
        ? "FULL paketas"
        : r.tier === "core"
          ? "CORE paketas"
          : "Paketas",
    badgeEn:
      r.tier === "full"
        ? "FULL package"
        : r.tier === "core"
          ? "CORE package"
          : "Package",
    includes: r.includes,
    metaLt: `${n} analitės`,
    metaEn: `${n} analytes`,
  };
});

/** CeGaT Cardiac Diseases gene sets — genes from https://cegat.com/diagnostics/rare-diseases/cardiac-diseases/ */
const genetics: MarketItem[] = [
  {
    id: "gen-hrt01",
    category: "genetics",
    kind: "package",
    code: "HRT01",
    nameLt: "Dilatuota kardiomiopatija",
    nameEn: "Dilated Cardiomyopathy",
    summaryLt:
      "CeGaT Gene Set HRT01 — 58 genai, susiję su dilatuota kardiomiopatija.",
    summaryEn:
      "CeGaT Gene Set HRT01 — 58 genes linked to dilated cardiomyopathy.",
    detailLt:
      "NGS skydelio (ExomeXtra® tipo) genų rinkinys dilatuotai kardiomiopatijai. Analizuojami visi žinomi su DCM susiję genai; ataskaitoje — ACMG 3/4/5 klasės variantai. Mėginys: EDTA kraujas arba genominė DNR. Tipinis atlikimo laikas 2–4 sav.",
    detailEn:
      "NGS panel (ExomeXtra®-style) gene set for dilated cardiomyopathy. All known DCM-associated genes are analysed; report includes ACMG class 3/4/5 variants. Sample: EDTA blood or genomic DNA. Typical turnaround 2–4 weeks.",
    priceEur: 890,
    geneCount: 58,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "ABCC9", "ACTC1", "ACTN2", "BAG3", "BAG5", "C10orf71", "CAP2", "CRYAB",
      "DES", "DMD", "DOLK", "DSG2", "DSP", "EMD", "FKTN", "FLII", "FLNC", "HFE",
      "JPH2", "LAMA4", "LAMP2", "LDB3", "LMNA", "LMOD2", "MYBPC3", "MYH6",
      "MYH7", "MYLK3", "MYPN", "MYZAP", "NEXN", "NRAP", "PLEKHM2", "PLN",
      "PPA2", "PPCS", "PPP1R13L", "PRDM16", "PSEN2", "RAF1", "RBM20", "RPL3L",
      "RRAGC", "RRAGD", "RYR2", "SCN5A", "SDHA", "SGCD", "SPEG", "TAFAZZIN",
      "TNNC1", "TNNI3", "TNNI3K", "TNNT2", "TPM1", "TTN", "TTR", "VCL",
    ],
  },
  {
    id: "gen-hrt02",
    category: "genetics",
    kind: "package",
    code: "HRT02",
    nameLt: "Hipertrofinė kardiomiopatija",
    nameEn: "Hypertrophic Cardiomyopathy",
    summaryLt: "CeGaT Gene Set HRT02 — 37 genai hipertrofinei kardiomiopatijai.",
    summaryEn: "CeGaT Gene Set HRT02 — 37 genes for hypertrophic cardiomyopathy.",
    detailLt:
      "HCM genų rinkinys: sarkomeriniai ir susiję genai (MYBPC3, MYH7, TNNT2 ir kt.). Galima derinti su kitais Cardiac Diseases rinkiniais be pakartotinio sekoskaitos.",
    detailEn:
      "HCM gene set: sarcomeric and related genes (MYBPC3, MYH7, TNNT2 and more). Can be combined with other Cardiac Diseases sets without re-sequencing.",
    priceEur: 790,
    geneCount: 37,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "ACTC1", "ACTN2", "ALPK3", "APOA1", "B2M", "CAV3", "CSRP3", "FHOD3",
      "FLNC", "FNIP1", "GAA", "GLA", "JPH2", "KLHL24", "LAMP2", "LDB3",
      "MYBPC3", "MYH6", "MYH7", "MYL2", "MYL3", "MYLK2", "MYOZ2", "MYPN",
      "NEXN", "PLN", "PRKAG2", "SLC25A4", "TCAP", "TNNC1", "TNNI3", "TNNT2",
      "TPM1", "TRIM63", "TTR", "TULP3", "VCL",
    ],
  },
  {
    id: "gen-hrt03",
    category: "genetics",
    kind: "package",
    code: "HRT03",
    nameLt: "Kairiojo skilvelio nekompaktiškumas (LVNC)",
    nameEn: "Left Ventricular Noncompaction (LVNC)",
    summaryLt: "CeGaT Gene Set HRT03 — 17 genų NCCM/LVNC fenotipui.",
    summaryEn: "CeGaT Gene Set HRT03 — 17 genes for NCCM/LVNC phenotype.",
    detailLt:
      "LVNC / noncompaction kardiomiopatijos genų rinkinys. Naudinga esant šeimos anamnezei ar neaiškiam fenotipui kartu su DCM/HCM.",
    detailEn:
      "LVNC / noncompaction cardiomyopathy gene set. Useful with family history or overlapping DCM/HCM phenotypes.",
    priceEur: 690,
    geneCount: 17,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "ACTC1", "ACTN2", "DES", "DTNA", "HCN4", "LDB3", "MIB1", "MYBPC3",
      "MYH7", "NONO", "PRDM16", "RBM20", "SPEG", "TAFAZZIN", "TNNT2", "TPM1",
      "TTN",
    ],
  },
  {
    id: "gen-hrt04",
    category: "genetics",
    kind: "package",
    code: "HRT04",
    nameLt: "Trumpo QT sindromas",
    nameEn: "Short QT Syndrome",
    summaryLt: "CeGaT Gene Set HRT04 — 4 genai (KCNH2, KCNJ2, KCNQ1, SLC4A3).",
    summaryEn: "CeGaT Gene Set HRT04 — 4 genes (KCNH2, KCNJ2, KCNQ1, SLC4A3).",
    detailLt:
      "Trumpo QT sindromo jonų kanalų genai. Dažnai užsakomas kartu su ilgo QT / aritmijų rinkiniais.",
    detailEn:
      "Ion-channel genes for short QT syndrome. Often ordered with long QT / arrhythmia sets.",
    priceEur: 590,
    geneCount: 4,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: ["KCNH2", "KCNJ2", "KCNQ1", "SLC4A3"],
  },
  {
    id: "gen-hrt05",
    category: "genetics",
    kind: "package",
    code: "HRT05",
    nameLt: "Ilgo QT sindromas",
    nameEn: "Long QT Syndrome",
    summaryLt: "CeGaT Gene Set HRT05 — 11 genų ilgo QT sindromui.",
    summaryEn: "CeGaT Gene Set HRT05 — 11 genes for long QT syndrome.",
    detailLt:
      "Klasikiniai LQTS genai (KCNQ1, KCNH2, SCN5A ir kt.) — staigios mirties rizikos ir šeimos skriningo kontekste.",
    detailEn:
      "Classic LQTS genes (KCNQ1, KCNH2, SCN5A and more) — for sudden-death risk and family screening.",
    priceEur: 650,
    geneCount: 11,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "CACNA1C", "CALM1", "CALM2", "CALM3", "KCNE1", "KCNE2", "KCNH2",
      "KCNJ2", "KCNQ1", "SCN5A", "TRDN",
    ],
  },
  {
    id: "gen-hrt06",
    category: "genetics",
    kind: "package",
    code: "HRT06",
    nameLt: "Aritmogeninė dešiniojo skilvelio displazija (ARVD/C)",
    nameEn: "Arrhythmogenic Right Ventricular Dysplasia (ARVD/C)",
    summaryLt: "CeGaT Gene Set HRT06 — 11 genų ARVD/C.",
    summaryEn: "CeGaT Gene Set HRT06 — 11 genes for ARVD/C.",
    detailLt:
      "Desmosomų ir susiję ARVC/D genai (PKP2, DSP, DSG2, DSC2, JUP ir kt.).",
    detailEn:
      "Desmosomal and related ARVC/D genes (PKP2, DSP, DSG2, DSC2, JUP and more).",
    priceEur: 650,
    geneCount: 11,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "CDH2", "DES", "DSC2", "DSG2", "DSP", "JUP", "PKP2", "PLN", "SCN5A",
      "TMEM43", "TTN",
    ],
  },
  {
    id: "gen-hrt07",
    category: "genetics",
    kind: "package",
    code: "HRT07",
    nameLt: "Brugada sindromas",
    nameEn: "Brugada Syndrome",
    summaryLt: "CeGaT Gene Set HRT07 — 8 genai Brugada sindromui.",
    summaryEn: "CeGaT Gene Set HRT07 — 8 genes for Brugada syndrome.",
    detailLt:
      "Brugada sindromo genų rinkinys su SCN5A ir susijusiais kanalų genais.",
    detailEn:
      "Brugada syndrome gene set including SCN5A and related channel genes.",
    priceEur: 620,
    geneCount: 8,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "CACNA1C", "CACNB2", "GPD1L", "KCND3", "SCN1B", "SCN5A", "SEMA3A",
      "TRPM4",
    ],
  },
  {
    id: "gen-hrt08",
    category: "genetics",
    kind: "package",
    code: "HRT08",
    nameLt: "Katecholaminerginė polimorfinė VT (CPVT)",
    nameEn: "Catecholaminergic Polymorphic VT (CPVT)",
    summaryLt: "CeGaT Gene Set HRT08 — 8 genai CPVT.",
    summaryEn: "CeGaT Gene Set HRT08 — 8 genes for CPVT.",
    detailLt:
      "CPVT genai (RYR2, CASQ2, TECRL ir kt.) — streso / fizinio krūvio aritmijų kontekste.",
    detailEn:
      "CPVT genes (RYR2, CASQ2, TECRL and more) — for stress / exercise-triggered arrhythmias.",
    priceEur: 620,
    geneCount: 8,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "CALM1", "CALM2", "CALM3", "CASQ2", "KCNJ2", "RYR2", "TECRL", "TRDN",
    ],
  },
  {
    id: "gen-hrt17",
    category: "genetics",
    kind: "package",
    code: "HRT17",
    nameLt: "Širdies aritmijos (apjungiantis rinkinys)",
    nameEn: "Cardiac Arrhythmias (overarching set)",
    summaryLt:
      "CeGaT HRT17 — 39 genai: Short/Long QT, ARVD/C, Brugada, CPVT ir susiję fenotipai.",
    summaryEn:
      "CeGaT HRT17 — 39 genes covering Short/Long QT, ARVD/C, Brugada, CPVT and related phenotypes.",
    detailLt:
      "Apjungiantis aritmijų genų rinkinys — kai klinikinis fenotipas neaiškus arba reikia platesnės diferencialinės diagnostikos.",
    detailEn:
      "Overarching arrhythmia gene set — when the clinical phenotype is unclear or broader differential diagnosis is needed.",
    priceEur: 990,
    geneCount: 39,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "CACNA1C", "CACNA1D", "CACNB2", "CALM1", "CALM2", "CALM3", "CASQ2",
      "CDH2", "DES", "DSC2", "DSG2", "DSP", "GPD1L", "JUP", "KCND3", "KCNE1",
      "KCNE2", "KCNH2", "KCNJ2", "KCNQ1", "PKP2", "PLN", "POPDC2", "RYR2",
      "SCN1B", "SCN5A", "SLC4A3", "TECRL", "TMEM43", "TRDN", "TRPM4", "TTN",
      "ANK2", "GJA5", "HCN4", "NKX2-5", "PRKAG2", "RANGRF", "SNTA1",
    ],
  },
  {
    id: "gen-hrt09",
    category: "genetics",
    kind: "package",
    code: "HRT09",
    nameLt: "Įgimtos širdies ydos (izoliuotos ir sindrominės)",
    nameEn: "Isolated and Syndromal Congenital Heart Defects",
    summaryLt: "CeGaT Gene Set HRT09 — 126 genai įgimtoms širdies ydoms.",
    summaryEn: "CeGaT Gene Set HRT09 — 126 genes for congenital heart defects.",
    detailLt:
      "Platus CHD genų rinkinys (izoliuotos ir sindrominės formos, įskaitant Noonan / RASopathy diferencialą pagal CeGaT Cardiac Diseases panelį).",
    detailEn:
      "Broad CHD gene set (isolated and syndromal forms, including Noonan / RASopathy differential per CeGaT Cardiac Diseases panel).",
    priceEur: 1290,
    geneCount: 126,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "ABL1", "ACTA2", "ACTC1", "ACVR2B", "ADAMTS10", "ADAMTS19", "ALDH1A2",
      "ANKRD11", "B3GAT3", "BCOR", "CBL", "CCDC39", "CDK13", "CFAP53", "CHD4",
      "CHD7", "CIROP", "CIROZ", "CITED2", "CREBBP", "CRELD1", "CTNND1", "CUL3",
      "DNAAF1", "DNAAF3", "DNAH11", "DNAH5", "DNAI1", "EHMT1", "ELN", "ETS1",
      "EVC", "EVC2", "FLNA", "FLT4", "FOXC1", "FOXH1", "G6PC3", "GATA4",
      "GATA5", "GATA6", "GDF1", "GJA1", "GPC3", "HAAO", "HAND1", "HAND2",
      "HEY2", "HOXA1", "HRAS", "HYAL2", "ISL1", "JAG1", "KDM2B", "KDM6A",
      "KLF13", "KMT2D", "KYNU", "LZTR1", "MAP2K1", "MAP2K2", "MAP3K7",
      "MAPKAPK5", "MED12", "MEIS2", "MESP1", "MID1", "MMP21", "MNS1", "MYH6",
      "MYH7", "MYRF", "NADSYN1", "NEK8", "NIPBL", "NKX2-5", "NKX2-6", "NODAL",
      "NONO", "NOTCH1", "NOTCH2", "NR2F2", "NUP188", "PAN2", "PBX1", "PKD1L1",
      "PLD1", "PPP1CB", "PRKACA", "PRKACB", "PRKD1", "PTPN11", "RAF1",
      "RBFOX2", "RBM10", "RIT1", "ROBO1", "ROBO4", "ROCK2", "RRAGC", "SALL1",
      "SALL4", "SMAD2", "SMAD6", "SMG9", "SOS1", "SOS2", "SOX17", "SPRED2",
      "SRF", "STRA6", "TAB2", "TBX1", "TBX20", "TBX5", "TFAP2B", "TLL1",
      "TM2D3", "TMEM260", "TMEM94", "TRAF7", "WBP11", "ZEB2", "ZFPM1",
      "ZFPM2", "ZIC3",
    ],
  },
  {
    id: "gen-hrt-lipid",
    category: "genetics",
    kind: "package",
    code: "HRT-LIP",
    nameLt: "Šeiminė hiperlipidemia / dislipidemija",
    nameEn: "Familial Hypercholesterolemia / Dyslipidemia",
    summaryLt:
      "CeGaT lipidų rinkinys — 18 genų: LDLR, APOB, PCSK9, ABCG5/8, LPL ir kt.",
    summaryEn:
      "CeGaT lipid set — 18 genes: LDLR, APOB, PCSK9, ABCG5/8, LPL and more.",
    detailLt:
      "Šeiminės hiperlipidemijos / dislipidemijos genai iš Cardiac Diseases panelio. Tinka esant aukštam MTL, šeimos anamnezei ar blogai toleruojamiems statinams (derinama su PGX).",
    detailEn:
      "Familial hypercholesterolemia / dyslipidemia genes from the Cardiac Diseases panel. Useful for high LDL, family history or statin intolerance (combine with PGX).",
    priceEur: 690,
    geneCount: 18,
    badgeLt: "Gene set",
    badgeEn: "Gene set",
    genes: [
      "ABCA1", "ABCG5", "ABCG8", "APOA1", "APOA5", "APOB", "APOC2", "APOE",
      "CREB3L3", "GPD1", "GPIHBP1", "LCAT", "LDLR", "LDLRAP1", "LIPA", "LMF1",
      "LPL", "PCSK9",
    ],
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
    detailLt:
      "Pilnas CeGaT Cardiac Diseases diagnostinis skydelis pagal ExomeXtra® — kardiomiopatijos, aritmijos, šeiminės hiperlipidemijos, įgimtos ydos. Vienas mėginys, plati ataskaita su ACMG klasifikacija.",
    detailEn:
      "Full CeGaT Cardiac Diseases diagnostic panel on ExomeXtra® — cardiomyopathies, arrhythmias, familial hyperlipidemias, congenital defects. One sample, broad report with ACMG classification.",
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
    detailLt:
      "CeGaT PGX priedas: variantai, veikiantys vaistų metabolizmą (statinai, beta blokatoriai, antidepresantai ir kt.). Gydytojas gali individualiai koreguoti terapiją.",
    detailEn:
      "CeGaT PGX add-on: variants affecting drug metabolism (statins, beta-blockers, antidepressants and more). Helps tailor therapy.",
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
    detailLt:
      "Pagal ACMG gaires — patogeniniai / tikėtinai patogeniniai antriniai radiniai genuose, kuriems yra klinikinis veiksmų planas jums ar šeimai.",
    detailEn:
      "Per ACMG guidelines — pathogenic / likely pathogenic secondary findings in genes with an actionable care plan for you or your family.",
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
    detailLt:
      "Mikroarray SNP genotipavimas — rezultatai įkeliami į skaitmeninį dvynį (širdies, metabolizmo, miego ir kt. kategorijos).",
    detailEn:
      "Microarray SNP genotyping — results feed the digital twin (heart, metabolism, sleep and more).",
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
    detailLt:
      "Išsamus NGS (ExomeXtra® tipo) — baltymus koduojančios sritys ir žinomos patogeninės introninės / intergeninės vietos. Tinka platesnei paveldimų ligų diagnostikai.",
    detailEn:
      "Comprehensive NGS (ExomeXtra®-style) — protein-coding regions plus known pathogenic intronic / intergenic sites. For broader hereditary disease diagnostics.",
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
    detailLt:
      "Metinis paketas: keturi planiniai vizitai, prioritetinis chat su klinika ir vienas genetikos rezultatų aptarimas.",
    detailEn:
      "Annual package: four planned visits, priority clinic chat and one genetics results review.",
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
    detailLt:
      "3 mėn. širdies stebėsena: kardiologo vizitas, slaugytojos kontrolė ir EKG interpretacija.",
    detailEn:
      "3-month heart monitoring: cardiologist visit, nurse check-in and ECG interpretation.",
    priceEur: 320,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: ["Kardiologo vizitas", "Slaugytojos kontrolė", "EKG interpretacija"],
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
    detailLt:
      "Atpalaiduojantis klasikinis masažas Lyfora klinikos sveikatingumo kabinete. Tinka po streso, sėdimo darbo ar prieš SPA dieną.",
    detailEn:
      "Relaxing classic massage in the Lyfora clinic wellness room. Suits stress, desk work or before a SPA day.",
    priceEur: 69,
    durationMin: 60,
    badgeLt: "60 min",
    badgeEn: "60 min",
    venueLt: "Lyfora klinika · sveikatingumo kabinetas · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic · wellness room · Gediminas Ave 1, Vilnius",
    specialistLt: "Licencijuotas masažuotojas (klinikos komanda)",
    specialistEn: "Licensed massage therapist (clinic team)",
  },
  {
    id: "wel-massage-sport",
    category: "wellness",
    kind: "single",
    nameLt: "Sportinis / gilusis masažas",
    nameEn: "Sports / deep-tissue massage",
    summaryLt: "Raumenų įtampai, po treniruočių ar sėdimo darbo.",
    summaryEn: "For muscle tension after training or desk work.",
    detailLt:
      "Gilusis / sportinis masažas Lyfora klinikoje — raumenų įtampai, po treniruočių ar ilgo sėdėjimo. Galima derinti su kineziterapeuto rekomendacijomis.",
    detailEn:
      "Deep-tissue / sports massage at Lyfora clinic — for muscle tension after training or long sitting. Can be combined with physiotherapist advice.",
    priceEur: 79,
    durationMin: 60,
    badgeLt: "60 min",
    badgeEn: "60 min",
    venueLt: "Lyfora klinika · sveikatingumo kabinetas · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic · wellness room · Gediminas Ave 1, Vilnius",
    specialistLt: "Sportinio masažo specialistas · klinikos kineziterapijos komanda",
    specialistEn: "Sports-massage specialist · clinic physiotherapy team",
  },
  {
    id: "wel-massage-pkg5",
    category: "wellness",
    kind: "package",
    nameLt: "5 masažų abonementas",
    nameEn: "5-massage pass",
    summaryLt: "5× 60 min klasikinis arba sportinis masažas per 3 mėn.",
    summaryEn: "5× 60 min classic or sports massage within 3 months.",
    detailLt:
      "Penki 60 min masažai (klasikinis arba sportinis) per 3 mėnesius Lyfora klinikos sveikatingumo kabinete. Terminą derinate su registratūra.",
    detailEn:
      "Five 60 min massages (classic or sports) within 3 months in the Lyfora clinic wellness room. Book slots with the front desk.",
    priceEur: 310,
    badgeLt: "Paketas",
    badgeEn: "Package",
    metaLt: "Sutaupote ~35 €",
    metaEn: "Save ~€35",
    venueLt: "Lyfora klinika · sveikatingumo kabinetas · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic · wellness room · Gediminas Ave 1, Vilnius",
    specialistLt: "Licencijuoti masažuotojai (klinikos komanda)",
    specialistEn: "Licensed massage therapists (clinic team)",
  },
  {
    id: "wel-spa-day",
    category: "wellness",
    kind: "single",
    nameLt: "SPA diena klinikoje",
    nameEn: "Clinic SPA day",
    summaryLt: "Pirtis, kūno šveitimas, 45 min masažas ir arbatos ritualas.",
    summaryEn: "Sauna, body scrub, 45 min massage and tea ritual.",
    detailLt:
      "Visą dieną trunkanti programa Lyfora klinikos SPA zonoje: infraraudonųjų spindulių pirtis, kūno šveitimas, 45 min masažas ir arbatos / hidracijos ritualas. Registracija per klinikos registratūrą.",
    detailEn:
      "A half-day programme in the Lyfora clinic SPA zone: infrared sauna, body scrub, 45 min massage and a tea / hydration ritual. Book via the clinic desk.",
    priceEur: 149,
    durationMin: 180,
    badgeLt: "~3 val.",
    badgeEn: "~3 hrs",
    venueLt: "Lyfora klinikos SPA zona · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic SPA zone · Gediminas Ave 1, Vilnius",
    specialistLt: "SPA terapeutai ir masažuotojai · Lyfora sveikatingumo komanda",
    specialistEn: "SPA therapists and massage staff · Lyfora wellness team",
  },
  {
    id: "wel-spa-couple",
    category: "wellness",
    kind: "package",
    nameLt: "Porų SPA vakaras",
    nameEn: "Couples SPA evening",
    summaryLt: "Dviem: SPA zona, sinchroninis masažas ir lengvi užkandžiai.",
    summaryEn: "For two: SPA zone, synchronised massage and light snacks.",
    detailLt:
      "Porų vakaras partnerių SPA centre „SPA Vilnius Tauras“ (su Lyfora rezervacija): bendra SPA zona, sinchroninis masažas dviem ir lengvi užkandžiai. Transferas neįtrauktas — atvykimą derinate patys arba per registratūrą.",
    detailEn:
      "Couples evening at partner SPA centre “SPA Vilnius Tauras” (Lyfora booking): shared SPA zone, synchronised massage for two and light snacks. Transfer not included — arrive yourselves or arrange via the desk.",
    priceEur: 279,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: [
      "SPA zona dviem",
      "Sinchroninis masažas",
      "Lengvi užkandžiai",
      "Lyfora rezervacija",
    ],
    venueLt:
      "Partnerių SPA centras · SPA Vilnius Tauras (Vilnius) · rezervacija per Lyfora",
    venueEn:
      "Partner SPA centre · SPA Vilnius Tauras (Vilnius) · booked via Lyfora",
    specialistLt: "SPA Vilnius terapeutų pora · Lyfora koordinuoja vizitą",
    specialistEn: "SPA Vilnius therapist pair · Lyfora coordinates the visit",
  },
  {
    id: "wel-spa-detox",
    category: "wellness",
    kind: "package",
    nameLt: "Detox & recovery savaitgalis",
    nameEn: "Detox & recovery weekend",
    summaryLt: "2 dienos: SPA, 2 masažai, kvėpavimo sesija ir miego higienos planas.",
    summaryEn: "2 days: SPA, 2 massages, breathwork and a sleep-hygiene plan.",
    detailLt:
      "Savaitgalio atstatymas partnerių kurorte „Grand SPA Lietuva“ (Druskininkai) su Lyfora programa: SPA prieiga, du masažai, kvėpavimo sesija ir miego higienos planas iš Lyfora miego specialisto. Nakvynė ir kelionė derinamos atskirai.",
    detailEn:
      "Weekend recovery at partner resort “Grand SPA Lietuva” (Druskininkai) with a Lyfora programme: SPA access, two massages, breathwork and a sleep-hygiene plan from a Lyfora sleep specialist. Stay and travel arranged separately.",
    priceEur: 420,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: [
      "SPA prieiga (2 d.)",
      "2× masažas",
      "Kvėpavimo sesija",
      "Miego higienos planas",
    ],
    venueLt:
      "Partnerių SPA kurortas · Grand SPA Lietuva, Druskininkai · programa per Lyfora",
    venueEn:
      "Partner SPA resort · Grand SPA Lietuva, Druskininkai · programme via Lyfora",
    specialistLt:
      "Grand SPA terapeutai · Lyfora kvėpavimo treneris ir miego specialistas",
    specialistEn:
      "Grand SPA therapists · Lyfora breathwork coach and sleep specialist",
  },
  {
    id: "wel-diet-intro",
    category: "wellness",
    kind: "single",
    nameLt: "Dietologo konsultacija",
    nameEn: "Dietitian consultation",
    summaryLt: "Mitybos anamnezė, tikslai ir pirmasis savaitės planas.",
    summaryEn: "Nutrition history, goals and a first weekly plan.",
    detailLt:
      "Pirminė dietologo konsultacija Lyfora klinikoje arba online: mitybos anamnezė, tikslai ir pirmasis savaitės planas. Galima derinti su laboratoriniais tyrimais.",
    detailEn:
      "Initial dietitian consult at Lyfora clinic or online: nutrition history, goals and a first weekly plan. Can be combined with lab tests.",
    priceEur: 85,
    durationMin: 50,
    badgeLt: "50 min",
    badgeEn: "50 min",
    venueLt: "Lyfora klinika arba online · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic or online · Gediminas Ave 1, Vilnius",
    specialistLt: "Klinikinė dietologė Rūta Kazlauskė · Lyfora mitybos komanda",
    specialistEn: "Clinical dietitian Rūta Kazlauskė · Lyfora nutrition team",
  },
  {
    id: "wel-diet-follow",
    category: "wellness",
    kind: "single",
    nameLt: "Dietologo pakartotinis vizitas",
    nameEn: "Dietitian follow-up",
    summaryLt: "Plano korekcija pagal tyrimus ir savijautą.",
    summaryEn: "Plan adjustment based on labs and how you feel.",
    detailLt:
      "Pakartotinis dietologo vizitas Lyfora klinikoje arba online — plano korekcija pagal tyrimus, savijautą ir skaitmeninio dvynio signalus.",
    detailEn:
      "Dietitian follow-up at Lyfora clinic or online — plan adjustment based on labs, how you feel and digital-twin signals.",
    priceEur: 55,
    durationMin: 30,
    badgeLt: "30 min",
    badgeEn: "30 min",
    venueLt: "Lyfora klinika arba online · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic or online · Gediminas Ave 1, Vilnius",
    specialistLt: "Klinikinė dietologė Rūta Kazlauskė · Lyfora mitybos komanda",
    specialistEn: "Clinical dietitian Rūta Kazlauskė · Lyfora nutrition team",
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
    detailLt:
      "Aštuonių savaičių mentorystė su Lyfora dietologe: įvadinė konsultacija klinikoje arba online, trys kontrolės, savaitiniai meniu ir chat palaikymas.",
    detailEn:
      "Eight-week mentorship with a Lyfora dietitian: intro consult in clinic or online, three check-ins, weekly menus and chat support.",
    priceEur: 320,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: ["Įžanga", "3× kontrolė", "Savaitiniai meniu", "Chat"],
    venueLt: "Lyfora klinika + online chat · Gedimino pr. 1, Vilnius",
    venueEn: "Lyfora clinic + online chat · Gediminas Ave 1, Vilnius",
    specialistLt: "Klinikinė dietologė Rūta Kazlauskė · Lyfora mitybos komanda",
    specialistEn: "Clinical dietitian Rūta Kazlauskė · Lyfora nutrition team",
  },
  {
    id: "wel-recovery-pkg",
    category: "wellness",
    kind: "package",
    nameLt: "Atstatymo paketas po streso",
    nameEn: "Post-stress recovery package",
    summaryLt: "Dietologas + 3 masažai + 1 SPA diena.",
    summaryEn: "Dietitian + 3 massages + 1 SPA day.",
    detailLt:
      "Po streso: dietologo konsultacija Lyfora klinikoje, trys masažai sveikatingumo kabinete ir viena SPA diena Lyfora SPA zonoje. Visą paketą koordinuoja klinikos registratūra.",
    detailEn:
      "After stress: dietitian consult at Lyfora clinic, three massages in the wellness room and one SPA day in the Lyfora SPA zone. The clinic desk coordinates the whole package.",
    priceEur: 399,
    badgeLt: "Paketas",
    badgeEn: "Package",
    includes: ["1× dietologas", "3× masažas", "1× SPA diena"],
    venueLt:
      "Lyfora klinika + SPA zona · Gedimino pr. 1, Vilnius",
    venueEn:
      "Lyfora clinic + SPA zone · Gediminas Ave 1, Vilnius",
    specialistLt:
      "Dietologė Rūta Kazlauskė · masažuotojai · SPA terapeutai",
    specialistEn:
      "Dietitian Rūta Kazlauskė · massage therapists · SPA therapists",
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
    blurbLt: "Visi Markers lentelės tyrimai ir CORE/FULL paketai.",
    blurbEn: "All Markers-table tests and CORE/FULL packages.",
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

export function getMarketItem(id: string) {
  return MARKETPLACE_ITEMS.find((i) => i.id === id) || null;
}

export function formatEur(n: number, locale: "lt" | "en") {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "lt-LT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}
