import type { RiskColour } from "@/lib/health/colours";

export type ReproductivePhenotypeId =
  | "pmos"
  | "endometriosis"
  | "early_perimenopause"
  | "menopause";

export type PhenotypeSignal =
  | "active"
  | "watch"
  | "ruled_out"
  | "no_signal"
  | "not_applicable";

export type ReproductivePhenotype = {
  id: ReproductivePhenotypeId;
  nameLt: string;
  nameEn: string;
  shortLt: string;
  shortEn: string;
  /** How it affects reproductive health, fertility, daily QoL. */
  impactLt: string;
  impactEn: string;
  fertilityLt: string;
  fertilityEn: string;
  dailyLt: string;
  dailyEn: string;
};

export const REPRODUCTIVE_PHENOTYPES: ReproductivePhenotype[] = [
  {
    id: "pmos",
    nameLt: "PMOS",
    nameEn: "PMOS",
    shortLt:
      "PMOS — policistinių kiaušidžių metabolinis–ovuliacijos sindromas. Anksčiau vadintas PKS (policistinių kiaušidžių sindromu). Signalas, ne diagnozė.",
    shortEn:
      "PMOS — polycystic ovary metabolic–ovulatory syndrome. Formerly PKS / PCOS (polycystic ovary syndrome). A signal, not a diagnosis.",
    impactLt:
      "Dažnai siejamas su nereguliariu ciklu, androgenų pertekliumi (plaukuotumas, aknė, viršugalvio retėjimas) ir medžiagų apykaitos pokyčiais.",
    impactEn:
      "Often linked with irregular cycles, androgen excess (hair growth, acne, crown thinning) and metabolic changes.",
    fertilityLt:
      "Ovuliacija gali vykti ne kiekvieną ciklą, todėl pastoti kartais užtrunka ilgiau — laiku atpažinus, tai gerai valdoma.",
    fertilityEn:
      "Ovulation may not happen every cycle, so conception can take longer — when recognised early, it is usually manageable.",
    dailyLt:
      "Nuovargis, odos ir plaukų pokyčiai, svorio valdymas ir nuotaika dažnai veikia kasdienę savijautą.",
    dailyEn:
      "Fatigue, skin and hair changes, weight management and mood often affect day-to-day wellbeing.",
  },
  {
    id: "endometriosis",
    nameLt: "Endometriozė",
    nameEn: "Endometriosis",
    shortLt:
      "Audinys, panašus į gimdos gleivinę, auga už gimdos ribų ir gali sukelti skausmą.",
    shortEn:
      "Tissue like the uterine lining grows outside the uterus and can cause pain.",
    impactLt:
      "Skausmas mėnesinių metu, lytinių santykių metu ar tuštinantis / šlapinantis — dažnas signalas, kurį verta aptarti anksčiau.",
    impactEn:
      "Pain with periods, sex, or bowel / bladder function is a common signal worth discussing earlier.",
    fertilityLt:
      "Gali apsunkinti pastoti; ankstyvas įtarimas padeda greičiau kreiptis į ginekologą.",
    fertilityEn:
      "Can make conception harder; earlier suspicion helps you see a gynaecologist sooner.",
    dailyLt:
      "Skausmas ir nuovargis kartais trukdo darbui, mokslams ir santykiams; gydymas gali gerokai palengvinti savijautą.",
    dailyEn:
      "Pain and fatigue can disrupt work, study and relationships; treatment often improves quality of life.",
  },
  {
    id: "early_perimenopause",
    nameLt: "Anksti prasidėjusi perimenopauzė",
    nameEn: "Early-onset perimenopause",
    shortLt:
      "Menopauzės perėjimas, prasidedantis anksčiau nei įprasta (apie 40–44 m. ar su priešlaikiniais požymiais).",
    shortEn:
      "The menopause transition starting earlier than usual (around 40–44, or with premature signs).",
    impactLt:
      "Ciklo pokyčiai, karščio bangos, miego ir nuotaikos svyravimai gali atsirasti anksčiau nei tikimasi.",
    impactEn:
      "Cycle changes, hot flushes, sleep and mood shifts can appear earlier than expected.",
    fertilityLt:
      "Vaisingumas mažėja greičiau; jei planuojate nėštumą — verta nevilkinti vaisingumo įvertinimo.",
    fertilityEn:
      "Fertility declines sooner; if you plan pregnancy, fertility assessment should not be delayed.",
    dailyLt:
      "Miegas, koncentracija ir savijauta darbe gali nukentėti; atpažinus, yra gydymo ir palaikymo galimybių.",
    dailyEn:
      "Sleep, focus and workday comfort can suffer; once recognised, treatment and support options exist.",
  },
  {
    id: "menopause",
    nameLt: "Menopauzė",
    nameEn: "Menopause",
    shortLt:
      "12 mėnesių be mėnesinių. Priešlaikinė (< 40 m.) ar ankstyva (40–44 m.) reikalauja atskiro dėmesio.",
    shortEn:
      "12 months without periods. Premature (< 40) or early (40–44) menopause needs extra attention.",
    impactLt:
      "Estrogenų trūkumas veikia kaulus, širdį, urogenitalinę sveikatą ir ilgalaikę riziką.",
    impactEn:
      "Lower oestrogen affects bones, heart, urogenital health and longer-term risk.",
    fertilityLt:
      "Natūralus nėštumas po menopauzės nebegalimas; priešlaikinės menopauzės atveju vaisingumo klausimą aptarkite greitai.",
    fertilityEn:
      "Natural pregnancy after menopause is no longer possible; with premature menopause, discuss fertility promptly.",
    dailyLt:
      "Karščio bangos, makties sausumas, miegas ir nuotaika — dažni, gydomi simptomai; hormonų terapija dažnai svarstoma iki ~51 m.",
    dailyEn:
      "Hot flushes, vaginal dryness, sleep and mood are common, treatable symptoms; HRT is often considered until ~age 51.",
  },
];

export type PhenotypeStatus = {
  id: ReproductivePhenotypeId;
  signal: PhenotypeSignal;
  colour: RiskColour;
  statusLt: string;
  statusEn: string;
};

/** Demo statuses for Rasa Rasaitė (PKS/PMOS sample case). */
export const DEMO_PHENOTYPE_STATUS: PhenotypeStatus[] = [
  {
    id: "pmos",
    signal: "active",
    colour: "orange",
    statusLt: "Stiprus signalas — verta pasitikrinti",
    statusEn: "Strong signal — worth checking",
  },
  {
    id: "endometriosis",
    signal: "no_signal",
    colour: "green",
    statusLt: "Šiuo metu signalo nėra",
    statusEn: "No signal right now",
  },
  {
    id: "early_perimenopause",
    signal: "ruled_out",
    colour: "green",
    statusLt: "Atmesta pagal amžių ir simptomus",
    statusEn: "Ruled out by age and symptoms",
  },
  {
    id: "menopause",
    signal: "not_applicable",
    colour: "grey",
    statusLt: "Dar neaktualu (26 m.)",
    statusEn: "Not applicable yet (age 26)",
  },
];

export type CalcRow = {
  labelLt: string;
  labelEn: string;
  fromLt: string;
  fromEn: string;
  resultLt: string;
  resultEn: string;
};

export type AssessmentItem = {
  titleLt: string;
  titleEn: string;
  detailLt: string;
  detailEn: string;
  kind: "present" | "ruled_out" | "watch";
};

export type TargetTest = {
  nameLt: string;
  nameEn: string;
  whyLt: string;
  whyEn: string;
  /** Marketplace item id for order link. */
  marketItemId?: string;
  /** Extra consult / package links. */
  links?: { labelLt: string; labelEn: string; href: string }[];
};

export type PmosReport = {
  headlineLt: string;
  headlineEn: string;
  /** English expansion of PMOS */
  pmosExpandEn: string;
  /** Lithuanian expansion of PKS */
  pksExpandLt: string;
  patientStoryLt: string;
  patientStoryEn: string;
  disclaimerLt: string;
  disclaimerEn: string;
  nextStepsLt: string;
  nextStepsEn: string;
  calculated: CalcRow[];
  /** Combined assessment: present signs (left) vs ruled out / absent (right). */
  assessment: AssessmentItem[];
  tests: TargetTest[];
  noteLt: string;
  noteEn: string;
};

/** Patient-facing PMOS report from the PKS sample case (Rasa), sections 3–7 style. */
export const DEMO_PMOS_REPORT: PmosReport = {
  headlineLt: "Verta pasitikrinti dėl PMOS",
  headlineEn: "Worth checking for PMOS",
  pmosExpandEn: "polycystic ovary metabolic–ovulatory syndrome",
  pksExpandLt: "policistinių kiaušidžių sindromas",
  patientStoryLt:
    "Verta pasitikrinti dėl policistinių kiaušidžių sindromo (PKS)\n\nJūsų mėnesinės kartojasi vidutiniškai kas 57 dienas (apie 6 kartus per metus), ir tai rodo, kad ovuliacija vyksta ne kiekvieną mėnesį. Kartu yra kelių požymių, būdingų androgenų (vyriškųjų hormonų) pertekliui: plaukai ant smakro ir pilvo, aknė, retėjantys plaukai viršugalvyje. Toks derinys atitinka PKS požymius. PKS turi maždaug 1 iš 8 moterų, ir jis gerai valdomas.\n\nTaip pat verta atkreipti dėmesį į medžiagų apykaitą. Gliukozė, trigliceridai ir kepenų fermentas ALT šiek tiek padidėję, o gerojo cholesterolio mažiau. Kartu su tamsiomis odos dėmėmis tai rodo insulino rezistenciją, kuri dažnai lydi PKS ir yra pagrindinis veiksnys, kurį galima keisti.",
  patientStoryEn:
    "Worth checking for polycystic ovary syndrome (PCOS)\n\nYour periods repeat about every 57 days (around 6 times a year), which suggests ovulation does not happen every month. Together with several signs of androgen (male hormone) excess — hair on the chin and abdomen, acne, thinning at the crown — this pattern matches PCOS. About 1 in 8 women have PCOS, and it is usually manageable.\n\nMetabolism also deserves attention. Glucose, triglycerides and the liver enzyme ALT are a little high, and HDL (“good”) cholesterol is lower. Together with dark skin patches, that points to insulin resistance, which often accompanies PCOS and is a key factor you can change.",
  disclaimerLt:
    "Tai ne diagnozė. Rezultatas parodo, kokie Jūsų simptomai gali būti susiję ir ką verta aptarti su gydytoju.",
  disclaimerEn:
    "This is not a diagnosis. The result shows how your symptoms may relate and what to discuss with a clinician.",
  nextStepsLt:
    "Ką daryti toliau: prie to paties kraujo ėmimo siūlome atlikti testosteroną ir SHBG, 17-OH progesteroną, prolaktiną, hCG ir gliukozės toleravimo mėginį. Su rezultatais kreipkitės į šeimos gydytoją, ginekologą ar endokrinologą. Gydytojas, atmetęs kitas priežastis, gali patvirtinti diagnozę ir aptarti gydymą: mitybą, fizinį aktyvumą, ciklo reguliavimą, aknės ir plaukuotumo gydymą.",
  nextStepsEn:
    "Next steps: with the same blood draw we suggest testosterone and SHBG, 17-OH progesterone, prolactin, hCG and a glucose tolerance test. Take the results to your GP, gynaecologist or endocrinologist. After ruling out other causes, they can confirm the diagnosis and discuss care: diet, activity, cycle regulation, and treatment for acne or excess hair.",
  calculated: [
    {
      labelLt: "Ciklo trukmės (6 intervalai)",
      labelEn: "Cycle lengths (6 intervals)",
      fromLt: "Nr. 14 datos (Flo)",
      fromEn: "Q14 dates (Flo)",
      resultLt:
        "49, 65, 47, 79, 42, 70 d.; vidurkis 59 d., mediana 57 d.; ~6 ciklai per metus; dabartinė pertrauka 50 d.",
      resultEn:
        "49, 65, 47, 79, 42, 70 days; mean 59, median 57; ~6 cycles/year; current gap 50 days",
    },
    {
      labelLt: "Ovuliacijos sutrikimas",
      labelEn: "Ovulation disruption",
      fromLt: "Apibrėžimas: mediana > 35 d. arba < 8 ciklai per metus",
      fromEn: "Definition: median > 35 days or < 8 cycles per year",
      resultLt: "Taip (abu kriterijai)",
      resultEn: "Yes (both criteria)",
    },
    {
      labelLt: "Androgenų pertekliaus požymiai",
      labelEn: "Androgen-excess signs",
      fromLt: "Nr. 32, 33, 35",
      fromEn: "Q32, 33, 35",
      resultLt:
        "3 požymiai – ryškus: plaukuotumas (smakras, lūpa, pilvas), viršugalvio retėjimas, suaugusiųjų aknė",
      resultEn:
        "3 signs – marked: hair growth (chin, lip, abdomen), crown thinning, adult acne",
    },
    {
      labelLt: "Insulino rezistencijos požymiai",
      labelEn: "Insulin-resistance signs",
      fromLt: "Nr. 2, 35, kraujas",
      fromEn: "Q2, 35, blood panel",
      resultLt:
        "6 iš 6: KMI 28,3, tamsios aksominės dėmės, gliukozė 5,7, TG 1,9, DTL 1,05, ALT 41",
      resultEn:
        "6 of 6: BMI 28.3, dark velvet patches, glucose 5.7, TG 1.9, HDL 1.05, ALT 41",
    },
    {
      labelLt: "Pradžia",
      labelEn: "Onset",
      fromLt: "Nr. 53",
      fromEn: "Q53",
      resultLt: "Nuo pirmųjų mėnesinių – būdinga PKS",
      resultEn: "Since first periods – typical for PCOS",
    },
  ],
  assessment: [
    {
      kind: "present",
      titleLt: "Ovuliacijos sutrikimas + androgenų požymiai",
      titleEn: "Ovulation disruption + androgen signs",
      detailLt:
        "Stiprus derinys (≥ 2 androgenų požymiai, nuo pirmųjų mėnesinių). Atitinka PKS / PMOS signalą — verta tikslinių tyrimų.",
      detailEn:
        "Strong pattern (≥ 2 androgen signs since first periods). Matches a PCOS / PMOS signal — targeted tests are warranted.",
    },
    {
      kind: "present",
      titleLt: "Insulino rezistencijos požymiai",
      titleEn: "Insulin-resistance signs",
      detailLt:
        "6 iš 6 požymių (KMI, odos dėmės, gliukozė, TG, DTL, ALT). Siūloma OGTT arba HbA1c; ALT — kepenų įvertinimas.",
      detailEn:
        "6 of 6 signs (BMI, skin patches, glucose, TG, HDL, ALT). Suggest OGTT or HbA1c; ALT — liver assessment.",
    },
    {
      kind: "present",
      titleLt: "Viršugalvio retėjimas su plaukuotumu ir akne",
      titleEn: "Crown thinning with hair growth and acne",
      detailLt: "Plaukų retėjimas siejamas su androgenais (simptomų žemėlapis).",
      detailEn: "Hair thinning linked with androgens (symptom map).",
    },
    {
      kind: "watch",
      titleLt: "Nėštumas",
      titleEn: "Pregnancy",
      detailLt:
        "Dabartinė pertrauka 50 d. (< 60 d.) — privalomo hCG nėra, bet jis įtrauktas į tikslinius tyrimus.",
      detailEn:
        "Current gap 50 days (< 60) — hCG is not mandatory yet, but it is included in targeted tests.",
    },
    {
      kind: "ruled_out",
      titleLt: "Raudonos vėliavos",
      titleEn: "Red flags",
      detailLt:
        "Staigaus plaukuotumo, balso pokyčio, spenelių išskyrų ar nuolatinio pūtimo nėra — plaukuotumas nuo paauglystės.",
      detailEn:
        "No sudden hair growth, voice change, nipple discharge or persistent bloating — hair growth since adolescence.",
    },
    {
      kind: "ruled_out",
      titleLt: "Prolaktino signalas",
      titleEn: "Prolactin signal",
      detailLt:
        "Pieno išsiskyrimo nėra; prolaktinas lieka tiksliniuose tyrimuose atmetimui.",
      detailEn:
        "No milk leakage; prolactin stays in targeted tests to exclude excess.",
    },
    {
      kind: "ruled_out",
      titleLt: "Skydliaukė",
      titleEn: "Thyroid",
      detailLt: "TSH 1,9 mIU/l — normoje, skydliaukės priežastis mažai tikėtina.",
      detailEn: "TSH 1.9 mIU/l — in range, thyroid cause unlikely.",
    },
    {
      kind: "ruled_out",
      titleLt: "Energijos trūkumas",
      titleEn: "Energy deficit",
      detailLt:
        "KMI 28,3; intensyvaus sporto / mažo valgymo požymių nėra.",
      detailEn:
        "BMI 28.3; no heavy sport / under-eating signs.",
    },
    {
      kind: "ruled_out",
      titleLt: "Priešlaikinė menopauzė / perimenopauzė",
      titleEn: "Premature menopause / perimenopause",
      detailLt: "26 m., pertrauka < 4 mėn., karščio bangų nėra.",
      detailEn: "Age 26, gap < 4 months, no hot flushes.",
    },
    {
      kind: "ruled_out",
      titleLt: "Endometriozė (NICE)",
      titleEn: "Endometriosis (NICE)",
      detailLt: "0 požymių — endometriozės signalo nėra.",
      detailEn: "0 signs — no endometriosis signal.",
    },
    {
      kind: "ruled_out",
      titleLt: "Gausios mėnesinės, anemija, PMDD, depresija",
      titleEn: "Heavy periods, anaemia, PMDD, depression",
      detailLt: "Šių derinių požymių dabar nėra.",
      detailEn: "No signs of these combinations right now.",
    },
    {
      kind: "watch",
      titleLt: "Gimdos gleivinės apsauga (> 90 d. pertraukos)",
      titleEn: "Endometrial protection (> 90-day gaps)",
      detailLt:
        "Ilgiausia pertrauka 79 d. — kol kas stebėti; jei ilgės, aptarti su gydytoju.",
      detailEn:
        "Longest gap 79 days — watch for now; if gaps lengthen, discuss with a clinician.",
    },
  ],
  tests: [
    {
      nameLt: "Testosteronas + SHBG (laisvo androgeno indeksas)",
      nameEn: "Testosterone + SHBG (free androgen index)",
      whyLt: "Patvirtinti biocheminį androgenų perteklių kraujyje.",
      whyEn: "Confirm biochemical androgen excess in blood.",
      marketItemId: "lab-lai-laisvu-androgenu-indeksas-isskaiciuojamas-is-testost",
      links: [
        {
          labelLt: "Testosteronas",
          labelEn: "Testosterone",
          href: "/patient/marketplace?item=lab-testosteronas",
        },
        {
          labelLt: "SHBG",
          labelEn: "SHBG",
          href: "/patient/marketplace?item=lab-lytinius-hormonus-surisantis-globulinas-shbg",
        },
      ],
    },
    {
      nameLt: "17-OH progesteronas (ryte, ankstyvoje folikulinėje fazėje)",
      nameEn: "17-OH progesterone (morning, early follicular phase)",
      whyLt:
        "Atmesti neklasikinę įgimtą antinksčių hiperplaziją, kuri gali atrodyti kaip PMOS.",
      whyEn:
        "Rule out non-classic congenital adrenal hyperplasia, which can look like PMOS.",
      marketItemId: "lab-pkg-hormonal-w-core",
      links: [
        {
          labelLt: "Endokrinologo konsultacija",
          labelEn: "Endocrinology consult",
          href: "/patient/marketplace?item=con-endo-40",
        },
      ],
    },
    {
      nameLt: "Prolaktinas",
      nameEn: "Prolactin",
      whyLt: "Atmesti prolaktino perteklių kaip ciklo sutrikimo priežastį.",
      whyEn: "Rule out high prolactin as a cause of cycle disruption.",
      marketItemId: "lab-prolaktinas-prl-makroprolaktinas",
    },
    {
      nameLt: "hCG",
      nameEn: "hCG",
      whyLt: "Atmesti nėštumą prieš tolesnius sprendimus.",
      whyEn: "Rule out pregnancy before further decisions.",
      marketItemId: "lab-chorioninis-gonadotropinas-hcg",
    },
    {
      nameLt: "OGTT 75 g (arba HbA1c)",
      nameEn: "OGTT 75 g (or HbA1c)",
      whyLt:
        "PMOS gairė rekomenduoja visoms; Jums gliukozė nevalgius jau padidėjusi.",
      whyEn:
        "PMOS guidelines recommend it for all; your fasting glucose is already raised.",
      marketItemId: "lab-gliukozes-toleravimo-meginys-2-tasku",
      links: [
        {
          labelLt: "HbA1c",
          labelEn: "HbA1c",
          href: "/patient/marketplace?item=lab-glikozilintas-hemoglobinas-hba1c",
        },
        {
          labelLt: "Metabolinis paketas",
          labelEn: "Metabolic package",
          href: "/patient/marketplace?item=lab-pkg-metabolic-core",
        },
      ],
    },
    {
      nameLt: "Kepenų įvertinimas (gydytojo nuožiūra: UG, FIB-4)",
      nameEn: "Liver assessment (clinician choice: ultrasound, FIB-4)",
      whyLt: "ALT 41 su insulino rezistencija — galima riebi kepenų liga.",
      whyEn: "ALT 41 with insulin resistance — fatty liver is possible.",
      marketItemId: "lab-alaninaminotransferaze-gpt-alt",
      links: [
        {
          labelLt: "Endokrinologo konsultacija",
          labelEn: "Endocrinology consult",
          href: "/patient/marketplace?item=con-endo-40",
        },
        {
          labelLt: "Šeimos gydytojo konsultacija",
          labelEn: "GP consultation",
          href: "/patient/marketplace?item=con-gp-30",
        },
      ],
    },
  ],
  noteLt:
    "AMH ir kiaušidžių ultragarsas diagnozei nebūtini: esant ovuliacijos sutrikimui ir androgenų pertekliui, kriterijai jau tenkinami (tarptautinė gairė, 2023).",
  noteEn:
    "AMH and ovarian ultrasound are not required for diagnosis when ovulation disruption and androgen excess are already present (international guideline, 2023).",
};

export function getPhenotype(id: string) {
  return REPRODUCTIVE_PHENOTYPES.find((p) => p.id === id) ?? null;
}

export function getPhenotypeStatus(id: ReproductivePhenotypeId) {
  return DEMO_PHENOTYPE_STATUS.find((s) => s.id === id) ?? null;
}
