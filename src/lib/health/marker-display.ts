import { isPhysicalMarkerKey } from "./physical-metrics";

/** Prefer human reading (e.g. 127/77 mmHg) over raw value + duplicated unit. */
export function formatMarkerReading(
  value: number,
  unit?: string | null,
  markerKey?: string
): string {
  const u = (unit || "").trim();
  // Questionnaire stores full reading in unit: "127/77 mmHg"
  if (/\d+\s*\/\s*\d+/.test(u)) {
    return u.replace(/\s+/g, " ").trim();
  }
  if (!u) return String(value);
  // Avoid "127 127/77 mmHg" if unit somehow starts with the value
  if (u.startsWith(String(value))) return u;
  if (markerKey === "BLOOD_PRESSURE") {
    // Seeded SYS-only rows: show systolic with unit, not "127/mmHg"
    return `${value} ${u}`.replace(/\s+/g, " ").trim();
  }
  return `${value} ${u}`.replace(/\s+/g, " ").trim();
}

export function formatMarkerReference(
  refLow?: number | null,
  refHigh?: number | null,
  markerKey?: string,
  locale: "lt" | "en" = "lt"
): string {
  if (markerKey === "BLOOD_PRESSURE") {
    return locale === "en"
      ? "Optimal < 120/80 · elevated from 130/85"
      : "Optimalu < 120/80 · padidėjęs nuo 130/85";
  }
  if (refLow != null || refHigh != null) {
    return `${refLow ?? "—"} – ${refHigh ?? "—"}`;
  }
  return "—";
}

type Locale = "lt" | "en";

const PHYSICAL_COPY: Record<
  string,
  {
    nameLt: string;
    nameEn: string;
    blurbLt: string;
    blurbEn: string;
    highLt: string;
    highEn: string;
    lowLt: string;
    lowEn: string;
  }
> = {
  BLOOD_PRESSURE: {
    nameLt: "Kraujospūdis",
    nameEn: "Blood pressure",
    blurbLt:
      "Kraujospūdis rodo, koks spaudimas kraujagyslėse širdžiai pumpuojant kraują. Paprastai užrašomas kaip sistolinis / diastolinis (pvz. 120/80).",
    blurbEn:
      "Blood pressure shows how hard blood pushes on your arteries. It is usually written as systolic / diastolic (e.g. 120/80).",
    highLt:
      "Jūsų matavimas yra aukščiau įprastos ribos. Vertinga aptarti su gydytoju — ypač jei kartojasi ar jaučiate simptomus.",
    highEn:
      "Your reading is above the usual range. Worth discussing with a clinician — especially if it repeats or you have symptoms.",
    lowLt:
      "Jūsų matavimas yra žemiau įprastos ribos. Jei svaigsta galva ar silpnumas — pasitarkite su gydytoju.",
    lowEn:
      "Your reading is below the usual range. If you feel dizzy or weak — talk with a clinician.",
  },
  RESTING_HR: {
    nameLt: "Ramybės pulsas",
    nameEn: "Resting heart rate",
    blurbLt:
      "Ramybės pulsas — širdies dūžių skaičius per minutę, kai esate ramūs. Tai fizinės būklės ir atsigavimo signalas, ne laboratorinis tyrimas.",
    blurbEn:
      "Resting heart rate is beats per minute while you are calm. It is a fitness and recovery signal, not a lab test.",
    highLt:
      "Pulsas ramybėje aukštesnis nei įprasta — verta aptarti su gydytoju, ypač jei jaučiate širdies plakimą ar nuovargį.",
    highEn:
      "Resting rate is higher than usual — discuss with a clinician, especially with palpitations or fatigue.",
    lowLt:
      "Labai žemas ramybės pulsas kai kuriems sportininkams būna normalu, bet jei silpnumas — pasitarkite su gydytoju.",
    lowEn:
      "A low resting rate can be normal in athletes, but seek advice if you feel weak or faint.",
  },
  HRV: {
    nameLt: "Širdies ritmo kintamumas (HRV)",
    nameEn: "Heart rate variability (HRV)",
    blurbLt:
      "HRV rodo, kaip lanksčiai širdis reaguoja į stresą ir atsigavimą. Tai dėvimo įrenginio / fizinis rodiklis, ne laboratorinis žymuo.",
    blurbEn:
      "HRV shows how flexibly your heart responds to stress and recovery. It is a wearable / physical metric, not a lab marker.",
    highLt: "Aukštesnis HRV dažnai siejamas su geresniu atsigavimu.",
    highEn: "Higher HRV is often linked with better recovery.",
    lowLt:
      "Žemesnis HRV gali reikšti didesnį stresą ar prastesnį atsigavimą — verta peržiūrėti miegą ir, jei reikia, pasitarti su gydytoju.",
    lowEn:
      "Lower HRV can mean more stress or poorer recovery — review sleep and talk to a clinician if needed.",
  },
  VO2MAX: {
    nameLt: "VO₂max",
    nameEn: "VO₂max",
    blurbLt:
      "VO₂max apytiksliai rodo, kiek deguonies jūsų kūnas gali panaudoti fizinio krūvio metu — aerobinės ištvermės rodiklis.",
    blurbEn:
      "VO₂max roughly shows how much oxygen your body can use during effort — an aerobic fitness marker.",
    highLt: "Aukštesnis VO₂max paprastai reiškia geresnę ištvermę.",
    highEn: "Higher VO₂max usually means better endurance.",
    lowLt:
      "Žemesnis VO₂max — signalas stiprinti aerobinį krūvį; jei yra širdies simptomų, prieš didinant apkrovą pasitarkite su gydytoju.",
    lowEn:
      "Lower VO₂max is a cue to build aerobic training; with heart symptoms, check with a clinician before pushing harder.",
  },
  ACTIVITY_DATA: {
    nameLt: "Aktyvumas",
    nameEn: "Activity",
    blurbLt:
      "Kasdienio judėjimo apimtis (pvz. žingsniai). Tai gyvenimo būdo rodiklis, ne laboratorinis tyrimas.",
    blurbEn:
      "Daily movement volume (e.g. steps). A lifestyle metric, not a lab test.",
    highLt: "Aktyvumas viršija įprastą tikslą — puiku, jei jaučiatės gerai.",
    highEn: "Activity is above the usual target — great if you feel well.",
    lowLt:
      "Judėjimo mažiau nei siekiamybė — palaipsniui didinkite žingsnius; jei skausmai ar dusulys — kreipkitės į gydytoją.",
    lowEn:
      "Movement is below the aim — build steps gradually; with pain or breathlessness see a clinician.",
  },
  BMI: {
    nameLt: "Kūno masės indeksas (KMI)",
    nameEn: "Body mass index (BMI)",
    blurbLt:
      "KMI apskaičiuojamas iš ūgio ir svorio. Tai orientyras, ne diagnozė ir ne laboratorinis žymuo.",
    blurbEn:
      "BMI is calculated from height and weight. It is a guide — not a diagnosis or lab marker.",
    highLt:
      "KMI aukščiau įprastos zonos — tikslus planas geriausiai derinamas su gydytoju ar mitybos specialistu.",
    highEn:
      "BMI is above the usual zone — a plan is best made with a clinician or dietitian.",
    lowLt:
      "KMI žemiau įprastos zonos — verta aptarti su gydytoju, ypač jei svoris krenta neplanuotai.",
    lowEn:
      "BMI is below the usual zone — discuss with a clinician, especially with unplanned weight loss.",
  },
  WAIST_CIRCUMFERENCE: {
    nameLt: "Juosmens apimtis",
    nameEn: "Waist circumference",
    blurbLt:
      "Juosmens apimtis padeda įvertinti riebalų pasiskirstymą aplink pilvą — metabolinės rizikos orientyras.",
    blurbEn:
      "Waist circumference helps estimate abdominal fat distribution — a metabolic risk guide.",
    highLt:
      "Apimtis didesnė nei siekiamybė — verta derinti gyvenimo būdą su gydytoju.",
    highEn:
      "Circumference is above the aim — worth aligning lifestyle changes with a clinician.",
    lowLt: "Apimtis žemiau tipinės zonos — jei nėra simptomų, dažnai tai nėra problema.",
    lowEn: "Below typical range — often fine if you feel well.",
  },
};

export function physicalMarkerName(markerKey: string, locale: Locale) {
  const c = PHYSICAL_COPY[markerKey];
  if (!c) return null;
  return locale === "en" ? c.nameEn : c.nameLt;
}

export function explainMarkerPlain(
  markerKey: string,
  opts: {
    locale: Locale;
    flag?: string | null;
    colour?: string;
    fallbackLt?: string | null;
    fallbackEn?: string | null;
  }
): {
  blurb: string;
  advice: string | null;
  disclaimer: string;
  adviseDoctor: boolean;
} {
  const physical = isPhysicalMarkerKey(markerKey);
  const copy = PHYSICAL_COPY[markerKey];
  const outOfRange =
    opts.flag === "high" ||
    opts.flag === "low" ||
    opts.colour === "orange" ||
    opts.colour === "red" ||
    opts.colour === "yellow";
  const low = opts.flag === "low";

  const disclaimer = physical
    ? opts.locale === "en"
      ? "This is a physical reading — not a lab test and not a diagnosis."
      : "Tai fizinis matavimas — ne laboratorinis tyrimas ir ne diagnozė."
    : opts.locale === "en"
      ? "Educational context for your lab marker — not a diagnosis. Discuss treatment only with your clinician."
      : "Edukacinis žymens paaiškinimas — ne diagnozė. Gydymą aptarkite tik su gydytoju.";

  if (copy) {
    const blurb = opts.locale === "en" ? copy.blurbEn : copy.blurbLt;
    let advice: string | null = null;
    if (outOfRange) {
      advice = low
        ? opts.locale === "en"
          ? copy.lowEn
          : copy.lowLt
        : opts.locale === "en"
          ? copy.highEn
          : copy.highLt;
    }
    return { blurb, advice, disclaimer, adviseDoctor: outOfRange };
  }

  if (physical) {
    return {
      blurb:
        opts.locale === "en"
          ? "This is a physical / functional reading from your profile or device — not a laboratory blood test."
          : "Tai fizinis / funkcinis matavimas iš jūsų profilio ar įrenginio — ne laboratorinis kraujo tyrimas.",
      advice: outOfRange
        ? opts.locale === "en"
          ? "The reading is outside the usual range — discuss it with your clinician."
          : "Rodiklis už įprastos ribos — verta aptarti su gydytoju."
        : null,
      disclaimer,
      adviseDoctor: outOfRange,
    };
  }

  return {
    blurb:
      (opts.locale === "en" ? opts.fallbackEn : opts.fallbackLt) ||
      (opts.locale === "en"
        ? "Laboratory marker from your uploaded results. Compare the value with the reference range and trend over time."
        : "Laboratorinis rodiklis iš jūsų įkeltų tyrimų. Palyginkite reikšmę su norma ir pokyčiu laike."),
    advice: outOfRange
      ? opts.locale === "en"
        ? "This value is outside the reference range — review it with your clinician."
        : "Reikšmė už normos ribų — aptarkite su gydytoju."
      : null,
    disclaimer,
    adviseDoctor: outOfRange,
  };
}

/** Specialty hint for booking CTA on physical metrics. */
export function physicalBookingSpecialty(markerKey: string): "cardio" | "metabolic" | "general" {
  if (
    markerKey === "BLOOD_PRESSURE" ||
    markerKey === "RESTING_HR" ||
    markerKey === "HRV" ||
    markerKey === "VO2MAX"
  ) {
    return "cardio";
  }
  if (
    markerKey === "BMI" ||
    markerKey === "WAIST_CIRCUMFERENCE" ||
    markerKey === "ACTIVITY_DATA"
  ) {
    return "metabolic";
  }
  return "general";
}
