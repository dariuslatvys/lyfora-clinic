/**
 * Patient-facing labels for pharmacogenetics focus areas and drugs.
 * Keep wording concrete: which medicines, what can go wrong, what is NOT affected.
 */

export const PHARMA_SUBCATEGORY_LT: Record<string, string> = {
  "Fluoropyrimidine Toxicity":
    "Vėžio chemoterapija (fluorouracilas / kapecitabinas) — šalutinio poveikio rizika",
  "Statin Myopathy": "Cholesterolio vaistai (statinai) — raumenų šalutinis poveikis",
  "Thiopurine Toxicity":
    "Imunosupresantai / kai kurie vėžio vaistai (tiopurinai) — šalutinio poveikio rizika",
  "Opioid & CYP2D6": "Skausmo vaistai (opioidai) — kaip organizmas juos skaido",
  "Antiplatelet Response": "Kraujo krešėjimo vaistai (pvz. klopidogrelis) — atsako stiprumas",
  "Coumarin & Phenytoin Dosing":
    "Kraujo skystikliai (varfarinas) ir kai kurie epilepsijos vaistai — dozavimas",
  "HLA Hypersensitivity": "Tam tikri vaistai — padidėjusio jautrumo / alerginės reakcijos rizika",
  "G6PD Deficiency": "Kai kurie vaistai ir infekcijos — raudonųjų kraujo ląstelių rizika",
  "Irinotecan / UGT1A1": "Vėžio chemoterapija (irinotekanas) — šalutinio poveikio rizika",
  "Tacrolimus Dosing": "Transplantacijos vaistas (takrolimuzas) — dozavimas",
  "Anaesthesia / Apnoea": "Kai kurios anestezijos priemonės — ilgesnis poveikis",
  "Alcohol & Nitrates": "Alkoholis ir nitratai — netoleravimo rizika",
  "Aminoglycoside Ototoxicity": "Aminoglikozidų antibiotikai — klausos rizika",
  "Efavirenz Dosing": "ŽIV vaistas (efavirenzas) — dozavimas ir šalutinis poveikis",
  "Valproate Hepatotoxicity": "Valproatas (epilepsijos / nuotaikos vaistas) — kepenų rizika",
  "NAT2 Acetylation": "Kai kurie vaistai (pvz. izoniazidas) — kaip greitai juos skaido organizmas",
  "CFTR Modulators": "Cistinės fibrozės vaistai (CFTR moduliatoriai)",
  "ARIA Risk": "Kai kurie Alzheimerio gydymo vaistai — ARIA rizika",
};

export const PHARMA_SUBCATEGORY_EN: Record<string, string> = {
  "Fluoropyrimidine Toxicity":
    "Cancer chemotherapy (fluorouracil / capecitabine) — toxicity risk",
  "Statin Myopathy": "Cholesterol medicines (statins) — muscle side effects",
  "Thiopurine Toxicity":
    "Immunosuppressants / some cancer medicines (thiopurines) — toxicity risk",
  "Opioid & CYP2D6": "Pain medicines (opioids) — how the body breaks them down",
  "Antiplatelet Response": "Antiplatelet medicines (e.g. clopidogrel) — response strength",
  "Coumarin & Phenytoin Dosing":
    "Blood thinners (warfarin) and some epilepsy medicines — dosing",
  "HLA Hypersensitivity": "Certain medicines — hypersensitivity / allergy risk",
  "G6PD Deficiency": "Some medicines and infections — red blood cell risk",
  "Irinotecan / UGT1A1": "Cancer chemotherapy (irinotecan) — side-effect risk",
  "Tacrolimus Dosing": "Transplant medicine (tacrolimus) — dosing",
  "Anaesthesia / Apnoea": "Some anaesthetic medicines — longer effect",
  "Alcohol & Nitrates": "Alcohol and nitrates — intolerance risk",
  "Aminoglycoside Ototoxicity": "Aminoglycoside antibiotics — hearing risk",
  "Efavirenz Dosing": "HIV medicine (efavirenz) — dosing and side effects",
  "Valproate Hepatotoxicity": "Valproate (epilepsy / mood medicine) — liver risk",
  "NAT2 Acetylation": "Some medicines (e.g. isoniazid) — how fast the body clears them",
  "CFTR Modulators": "Cystic fibrosis medicines (CFTR modulators)",
  "ARIA Risk": "Some Alzheimer treatment medicines — ARIA risk",
};

export function pharmaSubcategoryLabel(
  subcategory: string | null | undefined,
  locale: "lt" | "en"
): string | null {
  if (!subcategory?.trim()) return null;
  const key = subcategory.trim();
  if (locale === "lt") return PHARMA_SUBCATEGORY_LT[key] || key;
  return PHARMA_SUBCATEGORY_EN[key] || key;
}

type PharmaCue = {
  test: RegExp;
  meaningLt: string;
  meaningEn: string;
};

/** Order matters: more specific drug classes first. */
const PHARMA_MEANINGS: PharmaCue[] = [
  {
    test: /dpyd|dpd|fluorouracil|capecitabine|fluoropyrimid|5-?\s*fu|xeloda/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai svarbu, jei kada nors būtų skiriama vėžio chemoterapija fluorouracilu (5-FU) ar kapecitabinu (pvz. Xeloda / Kapecitabine). Tuomet įprasta dozė gali būti per stipri — didesnė sunkaus šalutinio poveikio rizika (stiprus viduriavimas, burnos opos, kraujo ląstelių kritimas). Kasdieniams vaistams nuo skausmo, kraujospūdžio ar infekcijų šis genas paprastai netaikomas. Prieš pradedant tokią chemoterapiją parodykite šį rezultatą onkologui — dozę parenka tik gydytojas.",
    meaningEn:
      "What this may mean for you: this matters if you ever need cancer chemotherapy with fluorouracil (5-FU) or capecitabine (e.g. Xeloda). Usual doses can then be too strong — higher risk of severe side effects (bad diarrhoea, mouth sores, low blood counts). Everyday medicines for pain, blood pressure or infections are usually not affected by this gene. Show this result to your oncologist before starting that chemotherapy — only a clinician adjusts the dose.",
  },
  {
    test: /slco1b1|statin|simvastatin|atorvastatin|myopath/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai susiję su cholesterolio vaistais — statinais (pvz. simvastatinas, atorvastatinas). Kai kuriems žmonėms jie labiau kelia raumenų skausmą ar silpnumą. Tai nereiškia, kad statinų negalima — gydytojas gali parinkti kitą statiną ar dozę. Kitų kasdienių vaistų grupių šis rezultatas paprastai neliečia.",
    meaningEn:
      "What this may mean for you: this relates to cholesterol medicines called statins (e.g. simvastatin, atorvastatin). Some people get more muscle pain or weakness on them. It does not mean you must avoid all statins — a clinician can choose a different statin or dose. Other everyday medicine groups are usually unaffected.",
  },
  {
    test: /tpmt|nudt15|thiopurine|azathioprine|mercaptopurine|6-mp/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai susiję su tiopurinų grupės vaistais (pvz. azatioprinas, merkaptopurinas), naudojamais autoimuninėms ligoms ar kai kurioms onkologijos schemoms. Organizmas gali juos skaidyti lėčiau, todėl įprasta dozė gali būti per stipri. Kitų kasdienių vaistų šis genas paprastai neliečia — dozę keičia tik gydytojas.",
    meaningEn:
      "What this may mean for you: this relates to thiopurine medicines (e.g. azathioprine, mercaptopurine) used in autoimmune disease or some oncology regimens. The body may clear them more slowly, so a usual dose can be too strong. Other everyday medicines are usually unaffected — only a clinician changes the dose.",
  },
  {
    test: /cyp2d6|opioid|codeine|tramadol|morphine/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai gali keisti, kaip veikia kai kurie skausmo vaistai (pvz. kodeinas, tramadolis) — vieniems poveikis silpnesnis, kitiems stipresnis ar su daugiau šalutinio poveikio. Tai ne apie visus vaistus iš eilės; konkretų skausmo gydymą parenka gydytojas.",
    meaningEn:
      "What this may mean for you: this can change how some pain medicines work (e.g. codeine, tramadol) — weaker effect in some people, stronger effect or more side effects in others. It is not about every medicine; a clinician chooses the right pain plan.",
  },
  {
    test: /cyp2c19|clopidogrel|antiplatelet|prasugrel|ticagrelor/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai gali turėti įtakos, kaip gerai veikia kai kurie kraujo krešėjimą veikiantys vaistai po stentų ar širdies įvykių (pvz. klopidogrelis). Gydytojas gali rinktis kitą vaistą ar stebėti atsako stiprumą. Tai ne apie visus širdies vaistus.",
    meaningEn:
      "What this may mean for you: this can affect how well some antiplatelet medicines work after stents or heart events (e.g. clopidogrel). A clinician may choose another medicine or monitor response. It is not about every heart medicine.",
  },
  {
    test: /vkorc1|cyp2c9|warfarin|coumarin|phenytoin/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai gali keisti, kokios dozės reikia kraujo skystikliui varfarinui (ar kai kuriems epilepsijos vaistams, pvz. fenitoinui). Dozę parenka ir koreguoja tik gydytojas pagal tyrimus — patys dozės nekeiskite.",
    meaningEn:
      "What this may mean for you: this can change the dose needed for the blood thinner warfarin (or some epilepsy medicines such as phenytoin). Only a clinician sets and adjusts the dose with lab checks — do not change doses yourself.",
  },
  {
    test: /hla|hypersensitiv|abacavir|carbamazepine|allopurinol|stevens/i,
    meaningLt:
      "Ką tai gali reikšti jums: tam tikri vaistai (priklausomai nuo HLA varianto — pvz. abakaviras, karbamazepinas, alopurinolis) gali sukelti stiprią alerginę / padidėjusio jautrumo reakciją. Tai nereiškia alergijos visiems vaistams — prieš skiriant rizikingą vaistą gydytojas turi žinoti šį rezultatą.",
    meaningEn:
      "What this may mean for you: certain medicines (depending on the HLA variant — e.g. abacavir, carbamazepine, allopurinol) can trigger a severe allergic / hypersensitivity reaction. This is not an allergy to all medicines — show this result before those specific drugs are prescribed.",
  },
  {
    test: /ugt1a1|irinotecan/i,
    meaningLt:
      "Ką tai gali reikšti jums: tai susiję su vėžio chemoterapijos vaistu irinotekanu — šalutinio poveikio rizika gali būti didesnė. Kitų kasdienių vaistų šis rezultatas paprastai neliečia; dozę ir schemą parenka onkologas.",
    meaningEn:
      "What this may mean for you: this relates to the cancer chemotherapy medicine irinotecan — side-effect risk may be higher. Other everyday medicines are usually unaffected; an oncologist sets the dose and plan.",
  },
  {
    test: /g6pd/i,
    meaningLt:
      "Ką tai gali reikšti jums: kai kurie vaistai, infekcijos ar fava pupos gali sukelti raudonųjų kraujo ląstelių irimą. Prieš skiriant rizikingus vaistus gydytojas turi žinoti šį rezultatą — tai ne apie visus vaistus iš eilės.",
    meaningEn:
      "What this may mean for you: some medicines, infections or fava beans can trigger red blood cell breakdown. Tell your clinician before those medicines are prescribed — this is not about every drug.",
  },
];

export function pharmaPersonalMeaning(
  raw: string,
  locale: "lt" | "en",
  ctx?: { gene?: string | null; subcategory?: string | null }
): string | null {
  const hay = `${ctx?.gene || ""} ${ctx?.subcategory || ""} ${raw}`;
  for (const cue of PHARMA_MEANINGS) {
    if (cue.test.test(hay)) {
      return locale === "lt" ? cue.meaningLt : cue.meaningEn;
    }
  }
  return null;
}
