/** Extra copy for Death Clock recommendation detail panel. */
export type RecDetailExtra = {
  explainLt: string;
  explainEn: string;
  actionsLt: string[];
  actionsEn: string[];
};

const DEFAULT_EXTRA: RecDetailExtra = {
  explainLt:
    "Šis pokytis mažina ilgalaikę riziką pagal populiacinius ir klinikinės praktikos modelius. Pažymėjus, savaitės pridedamos prie projekcijos kaip iliustratyvus prevencinis efektas — ne medicininė garantija.",
  explainEn:
    "This change lowers long-term risk in population and clinical-practice models. Checking it adds weeks to the projection as an illustrative prevention effect — not a medical guarantee.",
  actionsLt: [
    "Užsibrėžkite konkretų savaitinį tikslą.",
    "Po 2–4 sav. peržiūrėkite, ar pavyksta išlaikyti.",
    "Jei reikia — aptarkite su šeimos gydytoju.",
  ],
  actionsEn: [
    "Set a concrete weekly target.",
    "After 2–4 weeks, review whether you can sustain it.",
    "Discuss with your GP if you need support.",
  ],
};

const BY_ID: Record<string, RecDetailExtra> = {
  "quit-smoke": {
    explainLt:
      "Rūkymas ir nikotinas stipriai trumpina modeliuojamą trukmę. Metsimas grąžina didžiąją dalį baudos ir mažina vėžio bei širdies riziką.",
    explainEn:
      "Smoking and nicotine sharply shorten modelled span. Quitting restores most of the penalty and lowers cancer and heart risk.",
    actionsLt: [
      "Pasirinkite metimo datą per artimiausias 7 dienas.",
      "Naudokite pakaitalus / konsultaciją (šeimos gydytojas, linija).",
      "Pašalinkite cigaretes, žiebtuvėlius ir nikotino atsargas iš namų.",
      "Po 2 sav. patikrinkite kraujospūdį ir savijautą.",
    ],
    actionsEn: [
      "Pick a quit date within the next 7 days.",
      "Use NRT / counselling (GP, quitline).",
      "Remove cigarettes, lighters and nicotine stock from home.",
      "Recheck blood pressure and how you feel after 2 weeks.",
    ],
  },
  "stay-smoke-free": {
    explainLt:
      "Net jei dabar nerūkote, grįžimas prie nikotino greitai grąžintų riziką. Išlaikymas — stabilus apsauginis veiksnys.",
    explainEn:
      "Even if you do not smoke now, returning to nicotine would quickly restore risk. Staying clear is a stable protective factor.",
    actionsLt: [
      "Venkite „socialinio“ rūkymo ir vapingo.",
      "Jei kyla potraukis — turėkite planą (pasivaikščiojimas, kramtomoji).",
      "Paprašykite aplinkos nerūkyti šalia jūsų.",
    ],
    actionsEn: [
      "Avoid social smoking and vaping.",
      "If craving appears — have a plan (walk, gum).",
      "Ask others not to smoke near you.",
    ],
  },
  "cut-alcohol": {
    explainLt:
      "Alkoholis kelia kraujospūdį, blogina miegą ir kepenų apkrovą. Saikingumas ar „be alkoholio“ savaitės prailgina modeliuojamą trukmę.",
    explainEn:
      "Alcohol raises blood pressure, worsens sleep and loads the liver. Moderation or alcohol-free weeks extends modelled span.",
    actionsLt: [
      "Nustatykite limitą: ≤1–2 dozės / savaitę arba 0.",
      "Suplanuokite 2 „sausas“ savaites per mėnesį.",
      "Vakarais rinkitės nealkoholines alternatyvas.",
      "Stebėkite miegą ir rytinį spaudimą 3–4 sav.",
    ],
    actionsEn: [
      "Set a limit: ≤1–2 drinks / week or zero.",
      "Plan 2 alcohol-free weeks per month.",
      "Choose non-alcoholic options in the evening.",
      "Track sleep and morning BP for 3–4 weeks.",
    ],
  },
  "exercise-3x": {
    explainLt:
      "Reguliarus judėjimas gerina VO₂max, jautrumą insulinui ir kraujagyslių sveikatą — vienas stipriausių keičiamų veiksnių.",
    explainEn:
      "Regular movement improves VO₂max, insulin sensitivity and vessel health — one of the strongest modifiable levers.",
    actionsLt: [
      "Suplanuokite ≥150 min. vidutinio intensyvumo / sav.",
      "Pridėkite 2 jėgos sesijas (kojos, nugaros, krūtinė).",
      "Kalendoriuje pažymėkite dienas kaip vizitus sau.",
      "Kas 4 sav. padidinkite trukmę ar intensyvumą 10 %.",
    ],
    actionsEn: [
      "Plan ≥150 min moderate activity / week.",
      "Add 2 strength sessions (legs, back, chest).",
      "Block the days in your calendar like appointments.",
      "Every 4 weeks raise duration or intensity by ~10%.",
    ],
  },
  "daily-steps": {
    explainLt:
      "Kasdienis ėjimas mažina sėdimą apkrovą ir palaiko metabolinę sveikatą, net jei jau treniruojatės kelis kartus per savaitę.",
    explainEn:
      "Daily walking cuts sedentary load and supports metabolic health even if you already train a few times a week.",
    actionsLt: [
      "Tikslas: ≥8 000 žingsnių ≥5 d. / sav.",
      "Po pietų — 10–15 min. pasivaikščiojimas.",
      "Naudokite laikrodį / telefoną priminimui.",
    ],
    actionsEn: [
      "Target: ≥8,000 steps on ≥5 days / week.",
      "After lunch — a 10–15 min walk.",
      "Use a watch / phone reminder.",
    ],
  },
  "strength-2x": {
    explainLt:
      "Raumenų masė siejama su ilgaamžiškumu, griuvimų prevencija ir geresne gliukozės kontrole.",
    explainEn:
      "Muscle mass links to longevity, fall prevention and better glucose control.",
    actionsLt: [
      "2 sesijos / sav. po 30–40 min.",
      "Pratimai: pritūpimai, atsispaudimai / traukimai, plank.",
      "Poilsis tarp sesijų ≥48 h.",
    ],
    actionsEn: [
      "2 sessions / week of 30–40 min.",
      "Moves: squats, push / pull, plank.",
      "Rest ≥48 h between sessions.",
    ],
  },
  "sleep-7": {
    explainLt:
      "Trumpas ar nereguliarus miegas didina širdies ir metabolinę riziką. 7–9 val. daugumą naktų — bazinis atsistatymas.",
    explainEn:
      "Short or irregular sleep raises heart and metabolic risk. 7–9 hours most nights is baseline recovery.",
    actionsLt: [
      "Fiksuotas kėlimosi laikas (±30 min.), įskaitant savaitgalius.",
      "Likusią valandą prieš miegą — be ekranų / silpna šviesa.",
      "Kava — ne vėliau kaip 8 val. prieš miegą.",
    ],
    actionsEn: [
      "Fixed wake time (±30 min), including weekends.",
      "Last hour before bed — no screens / dim light.",
      "No caffeine within 8 hours of bedtime.",
    ],
  },
  "stress-routine": {
    explainLt:
      "Lėtinis stresas blogina HRV ir kraujospūdį. Trumpa kasdienė atsigavimo rutina duoda matomą efektą per kelias savaites.",
    explainEn:
      "Chronic stress worsens HRV and blood pressure. A short daily recovery routine shows effect within weeks.",
    actionsLt: [
      "10–15 min. kvėpavimo / meditacijos kasdien.",
      "Viena „be telefono“ pertrauka dienos viduryje.",
      "Kartą per savaitę — ilgesnis poilsio blokas (gamta, hobiai).",
    ],
    actionsEn: [
      "10–15 min breathing / meditation daily.",
      "One phone-free break midday.",
      "Once a week — a longer recovery block (outdoors, hobbies).",
    ],
  },
  "med-diet": {
    explainLt:
      "Viduržemio tipo mityba siejama su mažesne širdies ir onkologine rizika: daržovės, žuvis, alyvuogių aliejus, mažiau perdirbtos mėsos.",
    explainEn:
      "A Mediterranean-style pattern links to lower heart and cancer risk: vegetables, fish, olive oil, less processed meat.",
    actionsLt: [
      "≥5 porcijos daržovių / vaisių per dieną.",
      "Žuvis ≥2× / sav.; raudona / perdirbta mėsa — retai.",
      "Pagrindinis riebalas — alyvuogių aliejus.",
      "Ankštinės ir riešutai — kelis kartus per savaitę.",
    ],
    actionsEn: [
      "≥5 portions of veg / fruit per day.",
      "Fish ≥2× / week; red / processed meat rarely.",
      "Main fat — olive oil.",
      "Legumes and nuts several times a week.",
    ],
  },
  "cut-ultra-processed": {
    explainLt:
      "Ultraprocessuotas maistas ir saldūs gėrimai skatina svorio augimą, uždegimą ir blogesnį lipidų profilį.",
    explainEn:
      "Ultra-processed food and sugary drinks drive weight gain, inflammation and a worse lipid profile.",
    actionsLt: [
      "Saldūs gėrimai — ne dažniau kaip 1× / sav. arba 0.",
      "Pirkinių krepšelyje — daugiau neperdirbtų produktų.",
      "Greitas maistas — ne dažniau kaip retas malonumas.",
    ],
    actionsEn: [
      "Sugary drinks — at most 1× / week or zero.",
      "Fill the cart with less-processed foods.",
      "Fast food — rare treat only.",
    ],
  },
  "fibre-30": {
    explainLt:
      "Skaidulos palaiko lipidus, gliukozę ir žarnyno sveikatą — lengvas, bet pastovus prevencinis svertas.",
    explainEn:
      "Fibre supports lipids, glucose and gut health — a simple, steady prevention lever.",
    actionsLt: [
      "Tikslas ≥30 g skaidulų / dieną.",
      "Viso grūdo produktai vietoj balto milto.",
      "Ankštinės ≥3× / sav.",
    ],
    actionsEn: [
      "Target ≥30 g fibre / day.",
      "Whole grains instead of white flour.",
      "Legumes ≥3× / week.",
    ],
  },
  "salt-5g": {
    explainLt:
      "Druska tiesiogiai kelia kraujospūdį. <5 g / dieną — aiškus klinikinis tikslas daugumai suaugusiųjų.",
    explainEn:
      "Salt directly raises blood pressure. Under 5 g / day is a clear clinical target for most adults.",
    actionsLt: [
      "Nenaudokite druskos pabarstymui prie stalo.",
      "Rinkitės mažiau sūdytus užkandžius ir gatavus patiekalus.",
      "Matuokite namų kraujospūdį 2× / sav.",
    ],
    actionsEn: [
      "No table salt topping.",
      "Choose lower-salt snacks and ready meals.",
      "Measure home BP 2× / week.",
    ],
  },
  "weight-stable": {
    explainLt:
      "Svorio ar juosmens mažinimas 5–10 % (jei antsvoris) sumažina spaudimą, lipidus ir diabeto riziką.",
    explainEn:
      "Losing 5–10% of weight or waist (if overweight) lowers BP, lipids and diabetes risk.",
    actionsLt: [
      "Išmatuokite juosmenį ir svorį kartą per savaitę.",
      "Kalorijų deficitas ~300–500 kcal / d., jei tikslas — mažinti.",
      "Derinkite su baltymų ir jėgos treniruotėmis.",
    ],
    actionsEn: [
      "Measure waist and weight once a week.",
      "About 300–500 kcal / day deficit if the goal is loss.",
      "Combine with protein and strength training.",
    ],
  },
  "lower-ldl": {
    explainLt:
      "LDL yra pagrindinis aterosklerozės veiksnys. Mityba + gydytojo planas (įskaitant vaistus, jei reikia) stipriai keičia prognozę.",
    explainEn:
      "LDL is a main atherosclerosis driver. Diet plus a clinician plan (including meds if needed) strongly shifts outlook.",
    actionsLt: [
      "Aptarkite LDL tikslą su gydytoju.",
      "Padidinkite skaidulas ir sočiųjų riebalų mažinimą.",
      "Jei paskirta — vartokite lipidus mažinančius vaistus reguliariai.",
      "Pakartokite lipidų panelę po 8–12 sav.",
    ],
    actionsEn: [
      "Agree an LDL target with your clinician.",
      "Raise fibre and cut saturated fat.",
      "If prescribed — take lipid-lowering therapy regularly.",
      "Repeat lipid panel in 8–12 weeks.",
    ],
  },
  "control-bp": {
    explainLt:
      "Kontroliuojamas kraujospūdis mažina insulto ir infarkto riziką. Namų matavimai padeda matyti tikrąją situaciją.",
    explainEn:
      "Controlled blood pressure cuts stroke and heart-attack risk. Home readings show the real picture.",
    actionsLt: [
      "Matuokite BP ryte ir vakare 7 dienas iš eilės.",
      "Druska <5 g / d., daugiau judėjimo.",
      "Jei paskirta — vartokite antihipertenzinius kasdien.",
      "Rezultatus parodykite gydytojui.",
    ],
    actionsEn: [
      "Measure BP morning and evening for 7 days.",
      "Salt <5 g / day, more movement.",
      "If prescribed — take antihypertensives daily.",
      "Show the log to your clinician.",
    ],
  },
  "raise-vo2": {
    explainLt:
      "Aukštesnis VO₂max siejamas su ilgesne gyvenimo trukme. Intervalai ir ilgesni žingsniai kelia ištvermę.",
    explainEn:
      "Higher VO₂max links to longer lifespan. Intervals and longer walks raise fitness.",
    actionsLt: [
      "1–2 intervalinės sesijos / sav. (pvz. 4×4 min.).",
      "Viena ilgesnė ėjimo / bėgimo sesija.",
      "Kas 6–8 sav. — pakartokite VO₂max ar panašų testą.",
    ],
    actionsEn: [
      "1–2 interval sessions / week (e.g. 4×4 min).",
      "One longer walk / run session.",
      "Every 6–8 weeks — repeat VO₂max or a similar test.",
    ],
  },
  "glucose-control": {
    explainLt:
      "Gliukozė virš optimalios ribos didina metabolinę ir kraujagyslių riziką. Mityba + judėjimas po valgio greitai gerina kontrolę.",
    explainEn:
      "Glucose above the optimal range raises metabolic and vessel risk. Diet plus post-meal movement improves control quickly.",
    actionsLt: [
      "Mažiau greitųjų angliavandenių ir saldžių gėrimų.",
      "10–15 min. ėjimas po pagrindinių valgių.",
      "Aptarkite HbA1c / gliukozės tikslą su gydytoju.",
    ],
    actionsEn: [
      "Fewer refined carbs and sugary drinks.",
      "10–15 min walk after main meals.",
      "Agree HbA1c / glucose targets with your clinician.",
    ],
  },
  "glucose-steady": {
    explainLt:
      "Net esant normaliai gliukozei, mažesni svyravimai saugo nuo metabolinės rizikos ateityje.",
    explainEn:
      "Even with normal glucose, smaller swings protect against future metabolic risk.",
    actionsLt: [
      "Baltymų / skaidulų pusryčiai.",
      "Be saldžių gėrimų kasdienybėje.",
      "Trumpas ėjimas po pietų.",
    ],
    actionsEn: [
      "Protein / fibre breakfasts.",
      "No daily sugary drinks.",
      "Short walk after lunch.",
    ],
  },
  "genetics-followup": {
    explainLt:
      "NKS radiniai reikalauja klinikinio plano (genetikas, specialistas, šeimos patikra) — tai mažina vėlyvos diagnostikos riziką.",
    explainEn:
      "NGS findings need a clinical plan (geneticist, specialist, family screening) — this lowers late-diagnosis risk.",
    actionsLt: [
      "Užsisakykite genetiko konsultaciją.",
      "Atlikite organų patikrą pagal geną (pvz. Echo, onko-prevencija).",
      "Aptarkite šeimos narių tyrimus.",
    ],
    actionsEn: [
      "Book a genetics consult.",
      "Do organ screening matched to the gene (e.g. Echo, cancer prevention).",
      "Discuss testing for relatives.",
    ],
  },
  "family-screening": {
    explainLt:
      "Šeimos anamnezė keičia atrankos grafiką — ankstesnė patikra gali aptikti ligą laiku.",
    explainEn:
      "Family history changes screening timing — earlier checks can catch disease in time.",
    actionsLt: [
      "Sudarykite šeimos ligų sąrašą su amžiumi.",
      "Su šeimos gydytoju nustatykite atrankos amžių.",
      "Įrašykite vizitus į kalendorių.",
    ],
    actionsEn: [
      "List family conditions with ages.",
      "Agree screening ages with your GP.",
      "Put visits in the calendar.",
    ],
  },
  "cardio-labs": {
    explainLt:
      "Švieži lipidų ir širdies žymenys leidžia koreguoti gydymą ir modelį pagal dabartinę situaciją.",
    explainEn:
      "Fresh lipid and heart markers let care and the model track the current situation.",
    actionsLt: [
      "Užsisakykite lipidų + gliukozės panelę.",
      "Matuokite kraujospūdį prieš vizitą.",
      "Rezultatus aptarkite su gydytoju per 2 sav.",
    ],
    actionsEn: [
      "Order lipid + glucose panel.",
      "Measure blood pressure before the visit.",
      "Review results with your clinician within 2 weeks.",
    ],
  },
  "annual-check": {
    explainLt:
      "Metinė apžiūra ir skiepai pagal amžių mažina komplikacijų riziką ir padeda anksti pastebėti pokyčius.",
    explainEn:
      "An annual check and age-based vaccines cut complication risk and catch changes early.",
    actionsLt: [
      "Užsiregistruokite pas šeimos gydytoją metinei apžiūrai.",
      "Patikrinkite skiepų kalendorių (gripas, kita pagal amžių).",
      "Atlikite vėžio atranką pagal amžių / lytį.",
    ],
    actionsEn: [
      "Book a GP annual check.",
      "Review vaccine calendar (flu, age-based).",
      "Complete cancer screening by age / sex.",
    ],
  },
};

export function enrichRecDetail(
  id: string,
  detailLt: string,
  detailEn: string
): RecDetailExtra {
  const extra = BY_ID[id];
  if (extra) return extra;
  return {
    ...DEFAULT_EXTRA,
    explainLt: detailLt || DEFAULT_EXTRA.explainLt,
    explainEn: detailEn || DEFAULT_EXTRA.explainEn,
  };
}
