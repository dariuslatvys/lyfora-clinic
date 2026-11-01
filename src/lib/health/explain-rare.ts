/**
 * Plain-language NGS rare-variant explanations with sex-aware disease links.
 * Always informational — not a diagnosis.
 */

export type RareExplainInput = {
  gene: string;
  hgvs?: string | null;
  titleLt?: string | null;
  titleEn?: string | null;
  summaryLt?: string | null;
  summaryEn?: string | null;
};

export type RareExplanation = {
  title: string;
  plainBody: string;
  cancersLt?: string;
  cancersEn?: string;
};

type GeneCue = {
  gene: string;
  /** Shared core meaning */
  coreLt: string;
  coreEn: string;
  femaleLt: string;
  femaleEn: string;
  maleLt: string;
  maleEn: string;
  cancersFemaleLt: string;
  cancersFemaleEn: string;
  cancersMaleLt: string;
  cancersMaleEn: string;
};

const CUES: GeneCue[] = [
  {
    gene: "PALB2",
    coreLt:
      "Rasta reta PALB2 geno atmaina. Šis genas padeda taisyti DNR pažeidimus (dirba kartu su BRCA keliais).",
    coreEn:
      "A rare PALB2 variant was found. This gene helps repair DNA damage (it works with the BRCA pathways).",
    femaleLt:
      "Moterims toks pokytis dažniausiai siejamas su padidėjusia paveldimos krūties ir kiaušidžių vėžio rizika; taip pat gali didėti kasos vėžio rizika. Tai ne reiškia, kad vėžys jau yra — tai signalas aptarti su gydytoju genetiku prevencinę priežiūrą ir šeimos rizikos planą.",
    femaleEn:
      "In women this change is most often linked with higher hereditary breast and ovarian cancer risk; pancreatic cancer risk may also rise. It does not mean cancer is already present — it is a signal to discuss prevention and a family-risk plan with a clinical geneticist.",
    maleLt:
      "Vyrams toks pokytis siejamas su padidėjusia paveldimos krūties vėžio (vyrų) ir kasos vėžio rizika; kai kuriuose tyrimuose minėta ir prostatos vėžio rizikos sąsaja. Tai ne diagnozė — aptarkite su gydytoju genetiku, ar reikia papildomos stebėsenos ar šeimos narių tyrimų.",
    maleEn:
      "In men this change is linked with higher hereditary male breast and pancreatic cancer risk; some studies also mention prostate cancer. This is not a diagnosis — discuss with a clinical geneticist whether extra surveillance or family testing is needed.",
    cancersFemaleLt: "Krūties vėžys, kiaušidžių vėžys, kasos vėžys",
    cancersFemaleEn: "Breast cancer, ovarian cancer, pancreatic cancer",
    cancersMaleLt: "Vyrų krūties vėžys, kasos vėžys, (galimai) prostatos vėžys",
    cancersMaleEn: "Male breast cancer, pancreatic cancer, (possibly) prostate cancer",
  },
  {
    gene: "MSH2",
    coreLt:
      "Rasta reta MSH2 geno atmaina. Šis genas dalyvauja DNR klaidų taisymo sistemoje (mismatch repair) ir siejamas su Lynch sindromo spektru.",
    coreEn:
      "A rare MSH2 variant was found. This gene is part of DNA mismatch repair and is linked with the Lynch syndrome spectrum.",
    femaleLt:
      "Moterims Lynch spektras dažniausiai siejamas su storosios / tiesiosios žarnos, endometriumo (gimdos gleivinės) ir kiaušidžių vėžio rizika; taip pat gali didėti skrandžio ir kitų virškinimo trakto vėžių rizika. Tai ne vėžio diagnozė — verta kuo greičiau aptarti prevencinį stebėjimo planą su genetiku.",
    femaleEn:
      "In women the Lynch spectrum most often raises colorectal, endometrial (uterine lining) and ovarian cancer risk; stomach and other GI cancers may also be more likely. This is not a cancer diagnosis — discuss a prevention plan with a geneticist promptly.",
    maleLt:
      "Vyrams Lynch spektras dažniausiai siejamas su storosios / tiesiosios žarnos vėžio rizika; taip pat gali didėti skrandžio, plonosios žarnos ir šlapimo takų vėžių rizika. Tai ne diagnozė — aptarkite su genetiku kolonoskopijų ir kitų prevencijos žingsnių grafiką.",
    maleEn:
      "In men the Lynch spectrum most often raises colorectal cancer risk; stomach, small-bowel and urinary-tract cancers may also be more likely. This is not a diagnosis — discuss colonoscopy timing and other prevention steps with a geneticist.",
    cancersFemaleLt:
      "Storosios žarnos vėžys, endometriumo vėžys, kiaušidžių vėžys, skrandžio / VT vėžiai",
    cancersFemaleEn:
      "Colorectal cancer, endometrial cancer, ovarian cancer, stomach / GI cancers",
    cancersMaleLt:
      "Storosios žarnos vėžys, skrandžio / plonosios žarnos vėžys, šlapimo takų vėžiai",
    cancersMaleEn:
      "Colorectal cancer, stomach / small-bowel cancer, urinary-tract cancers",
  },
  {
    gene: "BRCA1",
    coreLt:
      "Rasta reta BRCA1 geno atmaina. Šis genas padeda taisyti DNR ir yra vienas pagrindinių paveldimos vėžio rizikos genų.",
    coreEn:
      "A rare BRCA1 variant was found. This gene helps repair DNA and is a major hereditary cancer-risk gene.",
    femaleLt:
      "Moterims BRCA1 pokyčiai stipriai siejami su krūties ir kiaušidžių vėžio rizika; taip pat gali didėti kasos vėžio rizika. Tai ne reiškia, kad liga jau yra — genetikas padės sudaryti stebėjimo ar prevencijos planą.",
    femaleEn:
      "In women BRCA1 changes are strongly linked with breast and ovarian cancer risk; pancreatic cancer risk may also rise. It does not mean disease is already present — a geneticist can help build a surveillance or prevention plan.",
    maleLt:
      "Vyrams BRCA1 pokyčiai siejami su padidėjusia vyrų krūties vėžio ir prostatos vėžio rizika; taip pat gali didėti kasos vėžio rizika. Aptarkite rezultatą su genetiku ir, jei reikia, urologu / onkologu.",
    maleEn:
      "In men BRCA1 changes are linked with higher male breast and prostate cancer risk; pancreatic cancer risk may also rise. Discuss the result with a geneticist and, if needed, a urologist / oncologist.",
    cancersFemaleLt: "Krūties vėžys, kiaušidžių vėžys, kasos vėžys",
    cancersFemaleEn: "Breast cancer, ovarian cancer, pancreatic cancer",
    cancersMaleLt: "Vyrų krūties vėžys, prostatos vėžys, kasos vėžys",
    cancersMaleEn: "Male breast cancer, prostate cancer, pancreatic cancer",
  },
  {
    gene: "BRCA2",
    coreLt:
      "Rasta reta BRCA2 geno atmaina. Šis genas padeda taisyti DNR ir siejamas su paveldima vėžio rizika šeimoje.",
    coreEn:
      "A rare BRCA2 variant was found. This gene helps repair DNA and is linked with hereditary cancer risk in families.",
    femaleLt:
      "Moterims BRCA2 pokyčiai siejami su krūties ir kiaušidžių vėžio rizika; taip pat gali didėti kasos vėžio rizika. Tai signalas, ne diagnozė — planą derinkite su genetiku.",
    femaleEn:
      "In women BRCA2 changes are linked with breast and ovarian cancer risk; pancreatic cancer risk may also rise. This is a signal, not a diagnosis — plan next steps with a geneticist.",
    maleLt:
      "Vyrams BRCA2 pokyčiai siejami su prostatos, vyrų krūties ir kasos vėžio rizika. Aptarkite su genetiku, ar reikia PSA stebėsenos ar šeimos narių tyrimų.",
    maleEn:
      "In men BRCA2 changes are linked with prostate, male breast and pancreatic cancer risk. Discuss with a geneticist whether PSA surveillance or family testing is needed.",
    cancersFemaleLt: "Krūties vėžys, kiaušidžių vėžys, kasos vėžys",
    cancersFemaleEn: "Breast cancer, ovarian cancer, pancreatic cancer",
    cancersMaleLt: "Prostatos vėžys, vyrų krūties vėžys, kasos vėžys",
    cancersMaleEn: "Prostate cancer, male breast cancer, pancreatic cancer",
  },
  {
    gene: "MLH1",
    coreLt:
      "Rasta reta MLH1 geno atmaina — dar vienas Lynch sindromo spektro genas (DNR klaidų taisymas).",
    coreEn:
      "A rare MLH1 variant was found — another Lynch syndrome–spectrum gene (DNA mismatch repair).",
    femaleLt:
      "Moterims dažniausiai siejama su storosios žarnos, endometriumo ir kiaušidžių vėžio rizika. Aptarkite prevencinę priežiūrą su genetiku.",
    femaleEn:
      "In women this is most often linked with colorectal, endometrial and ovarian cancer risk. Discuss prevention with a geneticist.",
    maleLt:
      "Vyrams dažniausiai siejama su storosios žarnos ir kai kurių kitų virškinimo trakto vėžių rizika. Aptarkite kolonoskopijų planą su genetiku.",
    maleEn:
      "In men this is most often linked with colorectal and some other GI cancer risks. Discuss a colonoscopy plan with a geneticist.",
    cancersFemaleLt: "Storosios žarnos, endometriumo, kiaušidžių vėžys",
    cancersFemaleEn: "Colorectal, endometrial, ovarian cancer",
    cancersMaleLt: "Storosios žarnos ir VT vėžiai",
    cancersMaleEn: "Colorectal and GI cancers",
  },
  {
    gene: "MSH6",
    coreLt:
      "Rasta reta MSH6 geno atmaina (Lynch spektras / DNR klaidų taisymas).",
    coreEn:
      "A rare MSH6 variant was found (Lynch spectrum / DNA mismatch repair).",
    femaleLt:
      "Moterims dažnai siejama su endometriumo ir storosios žarnos vėžio rizika. Tai ne diagnozė — derinkite stebėjimą su genetiku.",
    femaleEn:
      "In women this is often linked with endometrial and colorectal cancer risk. Not a diagnosis — align surveillance with a geneticist.",
    maleLt:
      "Vyrams dažniausiai siejama su storosios žarnos vėžio rizika. Aptarkite prevencinį planą su genetiku.",
    maleEn:
      "In men this is most often linked with colorectal cancer risk. Discuss a prevention plan with a geneticist.",
    cancersFemaleLt: "Endometriumo vėžys, storosios žarnos vėžys",
    cancersFemaleEn: "Endometrial cancer, colorectal cancer",
    cancersMaleLt: "Storosios žarnos vėžys",
    cancersMaleEn: "Colorectal cancer",
  },
  {
    gene: "PMS2",
    coreLt:
      "Rasta reta PMS2 geno atmaina (Lynch spektras). Rizika dažnai šiek tiek mažesnė nei MLH1/MSH2, bet vis tiek svarbi aptarti.",
    coreEn:
      "A rare PMS2 variant was found (Lynch spectrum). Risk is often somewhat lower than MLH1/MSH2, but still important to discuss.",
    femaleLt:
      "Moterims gali didėti storosios žarnos ir endometriumo vėžio rizika. Sudarykite planą su genetiku.",
    femaleEn:
      "In women colorectal and endometrial cancer risk may rise. Build a plan with a geneticist.",
    maleLt:
      "Vyrams gali didėti storosios žarnos vėžio rizika. Aptarkite stebėjimą su genetiku.",
    maleEn:
      "In men colorectal cancer risk may rise. Discuss surveillance with a geneticist.",
    cancersFemaleLt: "Storosios žarnos vėžys, endometriumo vėžys",
    cancersFemaleEn: "Colorectal cancer, endometrial cancer",
    cancersMaleLt: "Storosios žarnos vėžys",
    cancersMaleEn: "Colorectal cancer",
  },
  {
    gene: "TP53",
    coreLt:
      "Rasta reta TP53 geno atmaina. Šis genas yra svarbus DNR pažeidimų „saugiklis“; patogeniniai pokyčiai siejami su Li-Fraumeni spektru.",
    coreEn:
      "A rare TP53 variant was found. This gene is a key DNA-damage “guardian”; pathogenic changes are linked with the Li-Fraumeni spectrum.",
    femaleLt:
      "Moterims Li-Fraumeni spektras gali apimti krūties vėžį, sarkomas, smegenų navikus ir kitus ankstyvus vėžius. Tai labai svarbus signalas — skubiai aptarkite su genetiku.",
    femaleEn:
      "In women the Li-Fraumeni spectrum can include breast cancer, sarcomas, brain tumours and other early-onset cancers. This is a high-priority signal — discuss promptly with a geneticist.",
    maleLt:
      "Vyrams Li-Fraumeni spektras gali apimti sarkomas, smegenų navikus, antinksčių ir kitus ankstyvus vėžius. Skubiai aptarkite su genetiku.",
    maleEn:
      "In men the Li-Fraumeni spectrum can include sarcomas, brain tumours, adrenal and other early-onset cancers. Discuss promptly with a geneticist.",
    cancersFemaleLt: "Krūties vėžys, sarkomos, smegenų navikai ir kt.",
    cancersFemaleEn: "Breast cancer, sarcomas, brain tumours, and others",
    cancersMaleLt: "Sarkomos, smegenų navikai, antinksčių vėžys ir kt.",
    cancersMaleEn: "Sarcomas, brain tumours, adrenal cancer, and others",
  },
];

const MYBPC3 = {
  coreLt:
    "Rasta reta MYBPC3 geno atmaina (heterozigotinė). Šis genas koduoja širdies raumens baltymą, svarbų širdies susitraukimui.",
  coreEn:
    "A rare heterozygous MYBPC3 variant was found. This gene encodes a heart-muscle protein important for contraction.",
  moreLt:
    "Tokie pokyčiai siejami su padidėjusia hipertrofinės kardiomiopatijos (širdies raumens sustorėjimo) rizika šeimoje — ne vėžiu. Tai nėra diagnozė: aptarkite su kardiologu ar genetiku EKG / Echo ir šeimos narių patikrą, jei gydytojas rekomenduoja.",
  moreEn:
    "Such changes are linked with higher familial hypertrophic cardiomyopathy (thickened heart muscle) risk — not cancer. This is not a diagnosis: discuss ECG / Echo and relatives’ screening with a cardiologist or geneticist if advised.",
};

const RYR1 = {
  coreLt:
    "Rasta RYR1 geno atmaina, siejama su padidėjusiu jautrumu kai kurioms anestezijos medžiagoms (piktybinės hipertermijos rizika).",
  coreEn:
    "An RYR1 variant linked to increased sensitivity to certain anaesthetics (malignant hyperthermia risk) was found.",
  moreLt:
    "Prieš operacijas ar sedaciją būtinai informuokite anesteziologą. Tai ne vėžio genas — tai saugumo signalas procedūroms.",
  moreEn:
    "Tell your anaesthesiologist before surgery or sedation. This is not a cancer gene — it is a safety signal for procedures.",
};

const CLOSING_LT =
  "NGS radinys pats savaime nėra diagnozė ir nekeičia gydymo be gydytojo. Būtinai pasikonsultuokite su gydytoju genetiku.";
const CLOSING_EN =
  "An NGS finding alone is not a diagnosis and does not change treatment without a clinician. Always consult a clinical geneticist.";

function cueFor(gene: string) {
  const key = gene.trim().toUpperCase();
  return CUES.find((c) => c.gene === key) || null;
}

export function explainRareVariant(
  variant: RareExplainInput,
  locale: "lt" | "en",
  sex: "male" | "female" | string
): RareExplanation {
  const gene = (variant.gene || "").trim().toUpperCase();
  const isFemale = sex === "female";
  const title =
    (locale === "lt" ? variant.titleLt : variant.titleEn) ||
    variant.gene ||
    gene;

  const cue = cueFor(gene);
  if (cue) {
    const body =
      locale === "lt"
        ? `${cue.coreLt} ${isFemale ? cue.femaleLt : cue.maleLt} ${CLOSING_LT}`
        : `${cue.coreEn} ${isFemale ? cue.femaleEn : cue.maleEn} ${CLOSING_EN}`;
    return {
      title,
      plainBody: body,
      cancersLt: isFemale ? cue.cancersFemaleLt : cue.cancersMaleLt,
      cancersEn: isFemale ? cue.cancersFemaleEn : cue.cancersMaleEn,
    };
  }

  if (gene === "MYBPC3") {
    return {
      title,
      plainBody:
        locale === "lt"
          ? `${MYBPC3.coreLt} ${MYBPC3.moreLt}`
          : `${MYBPC3.coreEn} ${MYBPC3.moreEn}`,
    };
  }

  if (gene === "RYR1") {
    return {
      title,
      plainBody:
        locale === "lt"
          ? `${RYR1.coreLt} ${RYR1.moreLt}`
          : `${RYR1.coreEn} ${RYR1.moreEn}`,
    };
  }

  // Fallback: enrich stored summary slightly, keep honesty
  const stored =
    (locale === "lt" ? variant.summaryLt : variant.summaryEn) || "";
  const fallbackExtra =
    locale === "lt"
      ? isFemale
        ? " Jei genas siejamas su onkologija, moterims dažnai svarbu žinoti konkrečias vėžio rūšis (pvz. krūties, kiaušidžių, endometriumo, storosios žarnos) — tikslų spektrą pasakys genetikas pagal geną."
        : " Jei genas siejamas su onkologija, vyrams dažnai svarbu žinoti konkrečias vėžio rūšis (pvz. storosios žarnos, prostatos, kasos, vyrų krūties) — tikslų spektrą pasakys genetikas pagal geną."
      : isFemale
        ? " If the gene is oncology-related, women often need to know which cancers (e.g. breast, ovarian, endometrial, colorectal) — a geneticist will name the exact spectrum for this gene."
        : " If the gene is oncology-related, men often need to know which cancers (e.g. colorectal, prostate, pancreatic, male breast) — a geneticist will name the exact spectrum for this gene.";

  return {
    title,
    plainBody:
      (stored ||
        (locale === "lt"
          ? `Rasta reta ${variant.gene} geno atmaina.`
          : `A rare ${variant.gene} variant was found.`)) +
      fallbackExtra +
      " " +
      (locale === "lt" ? CLOSING_LT : CLOSING_EN),
  };
}

/** Short chip text for cards. */
export function rareCancerChip(
  gene: string,
  locale: "lt" | "en",
  sex: "male" | "female" | string
): string | null {
  const cue = cueFor(gene);
  if (!cue) return null;
  const isFemale = sex === "female";
  return locale === "lt"
    ? isFemale
      ? cue.cancersFemaleLt
      : cue.cancersMaleLt
    : isFemale
      ? cue.cancersFemaleEn
      : cue.cancersMaleEn;
}
