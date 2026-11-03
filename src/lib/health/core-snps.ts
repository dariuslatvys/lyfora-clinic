/**
 * Core 32-SNP cardiovascular / metabolic / PGx panel used on Mano DNR.
 * Ported from the Lyfora Klinika HTML prototype (Gene_SNP_Risk_Table / Risk SNP table).
 */

export type CoreSnpImpact =
  | "high"
  | "moderate"
  | "low"
  | "clinical";

export type CoreSnpMatch = "green" | "badge" | "yellow" | "orange" | "red";

export type CoreSnpDef = {
  gene: string;
  snpId: string;
  effectAllele1: string;
  effectAllele2: string;
  otherAllele: string;
  primaryCategoryEn: string;
  secondaryCategoryEn: string;
  impact: CoreSnpImpact;
  evidence: string;
  match1: CoreSnpMatch;
  match2: CoreSnpMatch;
  group: 1 | 2 | 3 | 4 | 5;
  infoLt: string;
  infoEn: string;
};

export const CORE_SNP_GROUPS: Record<
  1 | 2 | 3 | 4 | 5,
  { lt: string; en: string }
> = {
  1: {
    lt: "Lipidų apykaita ir aterogeniniai lipoproteinai",
    en: "Lipid metabolism and atherogenic lipoproteins",
  },
  2: {
    lt: "Kraujospūdis ir kraujagyslių tonusas",
    en: "Blood pressure and vascular tone",
  },
  3: {
    lt: "Uždegimas, endotelio funkcija ir homocisteinas",
    en: "Inflammation, endothelial function and homocysteine",
  },
  4: {
    lt: "Gliukozės apykaita ir metabolinė pusiausvyra",
    en: "Glucose metabolism and metabolic balance",
  },
  5: {
    lt: "Širdies ir kraujagyslių farmakogenomika",
    en: "Cardiovascular pharmacogenomics",
  },
};

export const CORE_SNPS: CoreSnpDef[] = [
  {
    gene: "APOE",
    snpId: "rs429358",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Metabolic Health",
    impact: "high",
    evidence: "strong",
    match1: "yellow",
    match2: "orange",
    group: 1,
    infoLt:
      "APOE ε4 žymuo. Veikia cholesterolio pernašą kraujyje; rizikos alelis siejamas su didesniu MTL cholesteroliu ir ateroskleroze.",
    infoEn:
      "APOE ε4 marker. Affects blood cholesterol transport; the risk allele is linked to higher LDL-C and atherosclerosis.",
  },
  {
    gene: "LPA",
    snpId: "rs10455872",
    effectAllele1: "G",
    effectAllele2: "C",
    otherAllele: "A",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Metabolic Health",
    impact: "high",
    evidence: "strong",
    match1: "yellow",
    match2: "orange",
    group: 1,
    infoLt:
      "Lemia lipoproteino(a) kiekį. Lp(a) beveik nepriklauso nuo mitybos, todėl verta jį bent kartą gyvenime išsimatuoti.",
    infoEn:
      "Drives lipoprotein(a) level. Lp(a) is barely changed by diet, so it is worth measuring at least once in life.",
  },
  {
    gene: "LPA",
    snpId: "rs3798220",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Metabolic Health",
    impact: "high",
    evidence: "strong",
    match1: "yellow",
    match2: "orange",
    group: 1,
    infoLt:
      "Antras LPA geno žymuo, susijęs su padidėjusiu Lp(a) ir vainikinių arterijų ligos rizika.",
    infoEn:
      "Second LPA marker linked to higher Lp(a) and coronary artery disease risk.",
  },
  {
    gene: "SORT1",
    snpId: "rs12740374",
    effectAllele1: "G",
    effectAllele2: "C",
    otherAllele: "T",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Metabolic Health",
    impact: "moderate",
    evidence: "strong",
    match1: "badge",
    match2: "yellow",
    group: 1,
    infoLt:
      "Veikia, kaip kepenys apdoroja MTL cholesterolį. Rizikos alelis siejamas su aukštesniu MTL.",
    infoEn:
      "Affects how the liver processes LDL cholesterol. The risk allele is linked to higher LDL.",
  },
  {
    gene: "APOC3",
    snpId: "rs2854116",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Metabolic Health",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 1,
    infoLt:
      "Trigliceridų apykaitos reguliatorius. Rizikos alelis siejamas su aukštesniais trigliceridais.",
    infoEn:
      "Triglyceride metabolism regulator. The risk allele is linked to higher triglycerides.",
  },
  {
    gene: "CDKN2A/CDKN2B",
    snpId: "rs10757278",
    effectAllele1: "G",
    effectAllele2: "C",
    otherAllele: "A",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Immune & Inflammation",
    impact: "moderate",
    evidence: "strong",
    match1: "badge",
    match2: "yellow",
    group: 1,
    infoLt:
      "9p21 sritis – vienas labiausiai patvirtintų vainikinių arterijų ligos žymenų.",
    infoEn:
      "9p21 locus — one of the most replicated coronary artery disease markers.",
  },
  {
    gene: "NOS3",
    snpId: "rs1799983",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "G",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Hormonal Health",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 2,
    infoLt:
      "Azoto oksido gamyba kraujagyslėse. Veikia kraujagyslių išsiplėtimą ir kraujospūdį.",
    infoEn:
      "Nitric oxide production in vessels. Affects vasodilation and blood pressure.",
  },
  {
    gene: "AGT",
    snpId: "rs699",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Renal Health",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 2,
    infoLt:
      "Angiotenzinogenas (RAAS sistema). Siejamas su didesniu kraujospūdžiu ir jautrumu druskai.",
    infoEn:
      "Angiotensinogen (RAAS). Linked to higher blood pressure and salt sensitivity.",
  },
  {
    gene: "ADD1",
    snpId: "rs4961",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "G",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Renal Health",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 2,
    infoLt:
      "Natrio sulaikymas inkstuose (ADD1). Rizikos alelis siejamas su didesniu jautrumu druskai ir kraujospūdžiui.",
    infoEn:
      "Sodium retention in the kidneys (ADD1). The risk allele is linked to greater salt sensitivity and blood-pressure response.",
  },
  {
    gene: "AGTR1",
    snpId: "rs5186",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "A",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Renal Health",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 2,
    infoLt:
      "Angiotenzino II 1 tipo receptorius (A1166C). Rizikos alelis siejamas su jautresne kraujospūdžio reguliacija ir kraujagyslių tonusu.",
    infoEn:
      "Angiotensin II type 1 receptor (A1166C). The risk allele is linked to more sensitive blood-pressure regulation and vessel tone.",
  },
  {
    gene: "MTHFR",
    snpId: "rs1801133",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "C",
    primaryCategoryEn: "Immune & Inflammation",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "moderate",
    evidence: "strong",
    match1: "badge",
    match2: "yellow",
    group: 3,
    infoLt:
      "Folatų apykaita. TT genotipas dažnai lemia aukštesnį homocisteiną, ypač trūkstant folatų ir B2.",
    infoEn:
      "Folate metabolism. The TT genotype often raises homocysteine, especially with low folate or B2.",
  },
  {
    gene: "CRP",
    snpId: "rs1205",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Immune & Inflammation",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "low",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 3,
    infoLt:
      "Bazinis C reaktyviojo baltymo (CRP) lygis – uždegimo žymuo, susijęs su širdies rizika ilgainiui.",
    infoEn:
      "Baseline C-reactive protein (CRP) — an inflammation marker linked with long-term heart risk.",
  },
  {
    gene: "PHACTR1 / EDN1",
    snpId: "rs9349379",
    effectAllele1: "G",
    effectAllele2: "C",
    otherAllele: "A",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Immune & Inflammation",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 3,
    infoLt:
      "Kraujagyslių sienelės funkcija per endoteliną-1 – siejama su kraujagyslių tonusu ir vainikinių arterijų rizika.",
    infoEn:
      "Vessel-wall function via endothelin-1 — linked to vascular tone and coronary artery risk.",
  },
  {
    gene: "PON1",
    snpId: "rs662",
    effectAllele1: "G",
    effectAllele2: "C",
    otherAllele: "A",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Immune & Inflammation",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 3,
    infoLt:
      "Paraoksonazė-1 (PON1) – antioksidacinė MTL apsauga; silpnesnė veikla siejama su ateroskleroze.",
    infoEn:
      "Paraoxonase-1 (PON1) — antioxidant protection of LDL; lower activity is linked with atherosclerosis.",
  },
  {
    gene: "MMP9",
    snpId: "rs3918242",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "C",
    primaryCategoryEn: "Immune & Inflammation",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "low",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 3,
    infoLt:
      "Kraujagyslių audinio remodeliavimas (MMP-9) – siejamas su arterijų sienelės pokyčiais ir plokštelių nestabilumu.",
    infoEn:
      "Vascular tissue remodelling (MMP-9) — linked to artery-wall changes and plaque instability.",
  },
  {
    gene: "F5",
    snpId: "rs6025",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "G",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Immune & Inflammation",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 3,
    infoLt:
      "V faktorius Leiden. Didina venų trombozės riziką, ypač vartojant estrogenus, po operacijų ar ilgų kelionių.",
    infoEn:
      "Factor V Leiden. Raises venous thrombosis risk, especially with estrogen, after surgery or long travel.",
  },
  {
    gene: "F2",
    snpId: "rs1799963",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "G",
    primaryCategoryEn: "Cardiovascular Health",
    secondaryCategoryEn: "Immune & Inflammation",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 3,
    infoLt:
      "Protrombino G20210A variantas. Didina venų trombozės riziką.",
    infoEn:
      "Prothrombin G20210A variant. Raises venous thrombosis risk.",
  },
  {
    gene: "IL6R",
    snpId: "rs4845625",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Immune & Inflammation",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "moderate",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 3,
    infoLt:
      "IL-6 receptorius – uždegimo signalizacija, susijusi su chronišku uždegimu ir širdies rizika.",
    infoEn:
      "IL-6 receptor — inflammation signalling linked with chronic inflammation and heart risk.",
  },
  {
    gene: "TCF7L2",
    snpId: "rs7903146",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "C",
    primaryCategoryEn: "Metabolic Health",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "high",
    evidence: "strong",
    match1: "yellow",
    match2: "orange",
    group: 4,
    infoLt:
      "Stipriausiai patvirtintas 2 tipo diabeto genetinis žymuo. Veikia insulino išsiskyrimą.",
    infoEn:
      "Strongest replicated type-2 diabetes genetic marker. Affects insulin release.",
  },
  {
    gene: "SLC30A8",
    snpId: "rs13266634",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Metabolic Health",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "moderate",
    evidence: "strong",
    match1: "badge",
    match2: "yellow",
    group: 4,
    infoLt:
      "Cinko pernaša kasos β ląstelėse – veikia insulino gamybą ir cukraus apykaitos polinkį.",
    infoEn:
      "Zinc transport in pancreatic β cells — affects insulin production and blood-sugar predisposition.",
  },
  {
    gene: "KCNJ11",
    snpId: "rs5219",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "G",
    primaryCategoryEn: "Metabolic Health",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "moderate",
    evidence: "strong",
    match1: "badge",
    match2: "yellow",
    group: 4,
    infoLt:
      "Kalio kanalas (KCNJ11), valdantis insulino išsiskyrimą – siejamas su 2 tipo diabeto polinkiu.",
    infoEn:
      "Potassium channel (KCNJ11) controlling insulin release — linked to type 2 diabetes predisposition.",
  },
  {
    gene: "FTO",
    snpId: "rs9939609",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "T",
    primaryCategoryEn: "Metabolic Health",
    secondaryCategoryEn: "Lifestyle & Behavior",
    impact: "low",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 4,
    infoLt:
      "Apetitas ir polinkis priaugti svorio. Fizinis aktyvumas šį poveikį gerokai sumažina.",
    infoEn:
      "Appetite and weight-gain tendency. Physical activity greatly reduces this effect.",
  },
  {
    gene: "LEPR",
    snpId: "rs1137101",
    effectAllele1: "G",
    effectAllele2: "C",
    otherAllele: "A",
    primaryCategoryEn: "Metabolic Health",
    secondaryCategoryEn: "Lifestyle & Behavior",
    impact: "low",
    evidence: "moderate",
    match1: "badge",
    match2: "yellow",
    group: 4,
    infoLt:
      "Leptino receptorius (LEPR) – sotumo signalas smegenyse; variantas siejamas su apetito ir svorio polinkiu.",
    infoEn:
      "Leptin receptor (LEPR) — satiety signalling in the brain; the variant is linked to appetite and weight predisposition.",
  },
  {
    gene: "MC4R",
    snpId: "rs17782313",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Metabolic Health",
    secondaryCategoryEn: "Lifestyle & Behavior",
    impact: "moderate",
    evidence: "strong",
    match1: "badge",
    match2: "yellow",
    group: 4,
    infoLt:
      "Apetito reguliacija smegenyse (MC4R) – rizikos alelis siejamas su didesniu polinkiu priaugti svorio.",
    infoEn:
      "Appetite regulation in the brain (MC4R) — the risk allele is linked to a greater tendency to gain weight.",
  },
  {
    gene: "SLCO1B1",
    snpId: "rs4149056",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "T",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "Statinų pernaša į kepenis. Rizikos alelis didina raumenų skausmų riziką vartojant simvastatiną.",
    infoEn:
      "Statin transport into the liver. The risk allele raises myalgia risk with simvastatin.",
  },
  {
    gene: "CYP2C19",
    snpId: "rs4244285",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "G",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "CYP2C19*2 – sumažėjęs klopidogrelio aktyvavimas; gali silpninti antitrombocitinį poveikį.",
    infoEn:
      "CYP2C19*2 — reduced clopidogrel activation; may weaken the antiplatelet effect.",
  },
  {
    gene: "CYP2C19",
    snpId: "rs4986893",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "G",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "CYP2C19*3 – sumažėjęs klopidogrelio aktyvavimas; gali silpninti antitrombocitinį poveikį.",
    infoEn:
      "CYP2C19*3 — reduced clopidogrel activation; may weaken the antiplatelet effect.",
  },
  {
    gene: "ABCG2",
    snpId: "rs2231142",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "G",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Metabolic Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "Šlapimo rūgšties šalinimas (podagros rizika); veikia rozuvastatino koncentraciją.",
    infoEn:
      "Uric-acid clearance (gout risk); also affects rosuvastatin levels.",
  },
  {
    gene: "CYP2C19",
    snpId: "rs12248560",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "C",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "CYP2C19*17 – greitesnis kai kurių vaistų metabolizmas; dozę parenka gydytojas.",
    infoEn:
      "CYP2C19*17 — faster metabolism of some medicines; dosing is decided by a clinician.",
  },
  {
    gene: "VKORC1",
    snpId: "rs9923231",
    effectAllele1: "A",
    effectAllele2: "T",
    otherAllele: "G",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "Jautrumas varfarinui (VKORC1) – dažnai reikia mažesnės dozės; dozę parenka tik gydytojas.",
    infoEn:
      "Warfarin sensitivity (VKORC1) — a lower dose is often needed; only a clinician sets the dose.",
  },
  {
    gene: "CYP2C9",
    snpId: "rs1799853",
    effectAllele1: "T",
    effectAllele2: "A",
    otherAllele: "C",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "CYP2C9*2. Lėtesnis varfarino ir kai kurių NVNU metabolizmas.",
    infoEn:
      "CYP2C9*2. Slower metabolism of warfarin and some NSAIDs.",
  },
  {
    gene: "CYP2C9",
    snpId: "rs1057910",
    effectAllele1: "C",
    effectAllele2: "G",
    otherAllele: "A",
    primaryCategoryEn: "Drug Metabolism",
    secondaryCategoryEn: "Cardiovascular Health",
    impact: "clinical",
    evidence: "clinical",
    match1: "yellow",
    match2: "orange",
    group: 5,
    infoLt:
      "CYP2C9*3. Lėtesnis varfarino ir kai kurių NVNU metabolizmas.",
    infoEn:
      "CYP2C9*3. Slower metabolism of warfarin and some NSAIDs.",
  },
];

/** Demo risk-allele counts (0/1/2) for male patient when raw genotype file lacks the SNP. */
export const DEMO_CORE_COUNTS_MALE: Record<string, 0 | 1 | 2> = {
  rs429358: 1,
  rs10455872: 1,
  rs3798220: 0,
  rs12740374: 1,
  rs2854116: 0,
  rs10757278: 2,
  rs1799983: 1,
  rs699: 1,
  rs4961: 0,
  rs5186: 1,
  rs1801133: 1,
  rs1205: 0,
  rs9349379: 1,
  rs662: 1,
  rs3918242: 0,
  rs6025: 0,
  rs1799963: 0,
  rs4845625: 1,
  rs7903146: 0,
  rs13266634: 1,
  rs5219: 1,
  rs9939609: 1,
  rs1137101: 1,
  rs17782313: 0,
  rs4149056: 1,
  rs4244285: 0,
  rs4986893: 0,
  rs2231142: 0,
  rs12248560: 1,
  rs9923231: 1,
  rs1799853: 0,
  rs1057910: 0,
};

/** Demo risk-allele counts for female patient fallback. */
export const DEMO_CORE_COUNTS_FEMALE: Record<string, 0 | 1 | 2> = {
  rs429358: 0,
  rs10455872: 0,
  rs3798220: 0,
  rs12740374: 1,
  rs2854116: 0,
  rs10757278: 1,
  rs1799983: 0,
  rs699: 1,
  rs4961: 0,
  rs5186: 0,
  rs1801133: 2,
  rs1205: 1,
  rs9349379: 2,
  rs662: 0,
  rs3918242: 0,
  rs6025: 1,
  rs1799963: 0,
  rs4845625: 0,
  rs7903146: 0,
  rs13266634: 1,
  rs5219: 0,
  rs9939609: 0,
  rs1137101: 1,
  rs17782313: 0,
  rs4149056: 0,
  rs4244285: 0,
  rs4986893: 0,
  rs2231142: 0,
  rs12248560: 0,
  rs9923231: 0,
  rs1799853: 1,
  rs1057910: 0,
};

export function genotypeFromRiskCount(
  def: CoreSnpDef,
  count: 0 | 1 | 2
): { allele1: string; allele2: string } {
  if (count === 0) {
    return { allele1: def.otherAllele, allele2: def.otherAllele };
  }
  if (count === 1) {
    return { allele1: def.otherAllele, allele2: def.effectAllele1 };
  }
  return { allele1: def.effectAllele1, allele2: def.effectAllele1 };
}
