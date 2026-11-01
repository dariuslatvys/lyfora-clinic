import { pastVisits, type DemoVisit } from "./demo-visits";
import type { QuestionnaireAnswers } from "./questionnaire";

export type HealthCardTabId =
  | "sum"
  | "dx"
  | "meds"
  | "vacc"
  | "proc"
  | "hist"
  | "docs";

export type HealthCardLink = {
  href: string;
  labelLt: string;
  labelEn: string;
};

export type HealthCardCondition = {
  code: string;
  nameLt: string;
  nameEn: string;
  since: string;
  statusLt: string;
  statusEn: string;
  byLt: string;
  byEn: string;
  href?: string;
  links?: HealthCardLink[];
};

export type HealthCardEpisode = {
  code: string;
  nameLt: string;
  nameEn: string;
  from: string;
  to: string;
  noteLt: string;
  noteEn: string;
  href?: string;
};

export type HealthCardMed = {
  name: string;
  atc: string;
  doseLt: string;
  doseEn: string;
  from: string;
  to?: string;
  byLt: string;
  byEn: string;
  active: boolean;
  href?: string;
  links?: HealthCardLink[];
};

export type HealthCardVaccine = {
  id: string;
  nameLt: string;
  nameEn: string;
  date: string | null;
  lot: string | null;
  next: string | null;
  placeLt?: string;
  placeEn?: string;
  productLt?: string;
  productEn?: string;
  href?: string;
  docHref?: string;
};

export type HealthCardProcedure = {
  id: string;
  nameLt: string;
  nameEn: string;
  date: string;
  whereLt: string;
  whereEn: string;
  typeLt: string;
  typeEn: string;
  resultLt?: string;
  resultEn?: string;
  detailLt?: string;
  detailEn?: string;
  imageSrc?: string;
  href?: string;
  visitHref?: string;
};

export type HealthCardDoc = {
  nameLt: string;
  nameEn: string;
  date: string;
  size: string;
  kind: "lab" | "report" | "note" | "vaccine";
  fresh?: boolean;
  href?: string;
};

export type HealthCardModel = {
  patientName: string;
  sexLt: string;
  sexEn: string;
  age: number | null;
  dob: string | null;
  bloodGroup: string;
  familyDoctorLt: string;
  familyDoctorEn: string;
  allergies: { lt: string; en: string; href?: string }[];
  vitals: {
    bp: string | null;
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    bpHref?: string;
  };
  lifestyle: {
    smokingLt: string;
    smokingEn: string;
    alcoholLt: string;
    alcoholEn: string;
    activityLt: string;
    activityEn: string;
    sleepLt: string;
    sleepEn: string;
    href: string;
  };
  family: { lt: string; en: string; href?: string }[];
  familyHref: string;
  conditions: HealthCardCondition[];
  conditionsHref: string;
  episodes: HealthCardEpisode[];
  meds: HealthCardMed[];
  medsHref: string;
  vaccines: HealthCardVaccine[];
  procedures: HealthCardProcedure[];
  visits: DemoVisit[];
  visitsHref: string;
  docs: HealthCardDoc[];
  docsUploadHref: string;
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date("2026-11-01T12:00:00Z");
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function bmiOf(h: number | null, w: number | null): number | null {
  if (!h || !w || h <= 0) return null;
  return Math.round((w / (h / 100) ** 2) * 10) / 10;
}

const CONDITION_MAP: Record<
  string,
  { code: string; nameLt: string; nameEn: string }
> = {
  "High Blood Pressure (Hypertension)": {
    code: "I10",
    nameLt: "Pirminė hipertenzija",
    nameEn: "Essential (primary) hypertension",
  },
  "Acid Reflux (GERD)": {
    code: "K21.9",
    nameLt: "Gastroezofaginio refliukso liga, nepatikslinta",
    nameEn: "Gastro-oesophageal reflux disease, unspecified",
  },
};

const MED_META: Record<
  string,
  { atc: string; doseLt: string; doseEn: string; byLt: string; byEn: string }
> = {
  "Tezeo (Telmisartan)": {
    atc: "C09CA07",
    doseLt: "40 mg 1 k./d. ryte",
    doseEn: "40 mg once daily in the morning",
    byLt: "Dr. Rūta Petrauskienė",
    byEn: "Dr. Ruta Petrauskienė",
  },
  "Roswera (Rosuvastatin)": {
    atc: "C10AA07",
    doseLt: "10 mg 1 k./d. vakare",
    doseEn: "10 mg once daily in the evening",
    byLt: "Dr. Andrius Kazlauskas",
    byEn: "Dr. Andrius Kazlauskas",
  },
};

function mapSmoking(v: unknown): { lt: string; en: string } {
  const s = String(v || "");
  if (/former/i.test(s))
    return { lt: "Metė rūkyti", en: "Former smoker" };
  if (/never|no/i.test(s)) return { lt: "Nerūko", en: "Does not smoke" };
  if (/current|yes/i.test(s)) return { lt: "Rūko", en: "Current smoker" };
  return { lt: "Nenurodyta", en: "Not specified" };
}

function mapAlcohol(v: unknown): { lt: string; en: string } {
  const s = String(v || "");
  if (/occas/i.test(s)) return { lt: "Retkarčiais", en: "Occasionally" };
  if (/never/i.test(s)) return { lt: "Nevartoja", en: "Never" };
  if (/regular|week/i.test(s)) return { lt: "Reguliariai", en: "Regularly" };
  return { lt: s || "Nenurodyta", en: s || "Not specified" };
}

function mapActivityLt(freq: string, types: string[]): string {
  const f = /regularly/i.test(freq)
    ? "Kelis kartus per savaitę"
    : /daily/i.test(freq)
      ? "Kasdien"
      : freq || "Vidutinis";
  const map: Record<string, string> = {
    Walking: "Ėjimas",
    Cycling: "Dviračiai",
    "Gym / Strength Training": "Sporto salė / jėga",
  };
  const t = types.map((x) => map[x] || x).join(", ");
  return t ? `${f} · ${t}` : f;
}

function mapActivityEn(freq: string, types: string[]): string {
  const f = /regularly/i.test(freq)
    ? "Several times per week"
    : freq || "Moderate";
  return types.length ? `${f} · ${types.join(", ")}` : f;
}

function mapSleep(dur: string, qual: string, locale: "lt" | "en") {
  const d = /6.?7/.test(dur) ? (locale === "en" ? "6–7 h" : "6–7 val.") : dur;
  const qMap: Record<string, { lt: string; en: string }> = {
    Average: { lt: "vidutinė kokybė", en: "average quality" },
    Good: { lt: "gera kokybė", en: "good quality" },
    Poor: { lt: "prasta kokybė", en: "poor quality" },
  };
  const q = qMap[qual] || { lt: qual, en: qual };
  return locale === "en"
    ? `${d}${qual ? ` · ${q.en}` : ""}`
    : `${d}${qual ? ` · ${q.lt}` : ""}`;
}

export function buildHealthCard(input: {
  patientName: string;
  sex: string | null;
  dob: string | null;
  answers: QuestionnaireAnswers;
}): HealthCardModel {
  const v = input.answers.values || {};
  const height = num(v["1_basic_profile_health_metrics__height"]);
  const weight = num(v["1_basic_profile_health_metrics__weight"]);
  const bpRaw = v["1_basic_profile_health_metrics__known_blood_pressure"] as
    | { sys?: unknown; dia?: unknown }
    | undefined;
  const sys = num(bpRaw?.sys);
  const dia = num(bpRaw?.dia);
  const bp =
    sys != null && dia != null ? `${Math.round(sys)}/${Math.round(dia)}` : null;

  const qLifestyle = "/patient/health-card/questionnaire?step=7";
  const qFamily = "/patient/health-card/questionnaire?step=10";
  const qConditions = "/patient/health-card/questionnaire?step=2";
  const qMeds = "/patient/health-card/questionnaire?step=4";
  const qAllergies = "/patient/health-card/questionnaire?step=3";

  const allergyItems: { lt: string; en: string; href?: string }[] = [];
  const food = (v["3_allergies__food_allergies"] as string[]) || [];
  const env = (v["3_allergies__environmental_allergies"] as string[]) || [];
  const insect = (v["3_allergies__insect_allergies"] as string[]) || [];
  for (const a of food)
    allergyItems.push({ lt: `Maistas: ${a}`, en: `Food: ${a}`, href: qAllergies });
  for (const a of env)
    allergyItems.push({
      lt: `Aplinka: ${a}`,
      en: `Environmental: ${a}`,
      href: qAllergies,
    });
  for (const a of insect)
    allergyItems.push({
      lt: `Vabzdžiai: ${a}`,
      en: `Insect: ${a}`,
      href: qAllergies,
    });
  if (!allergyItems.some((x) => /penicilin/i.test(x.lt + x.en))) {
    allergyItems.push({
      lt: "Penicilinas (bėrimas)",
      en: "Penicillin (rash)",
      href: qAllergies,
    });
  }

  const condRaw =
    (v[
      "2_current_past_medical_conditions__conditions__medical_conditions"
    ] as string[]) || [];
  const conditions: HealthCardCondition[] = condRaw.map((name) => {
    const m = CONDITION_MAP[name] || {
      code: "Z86.9",
      nameLt: name,
      nameEn: name,
    };
    const href =
      m.code === "I10"
        ? "/patient/marker/BLOOD_PRESSURE?cat=cardiovascular"
        : m.code.startsWith("K21")
          ? "/patient/visits/v-2025-08-07"
          : qConditions;
    return {
      code: m.code,
      nameLt: m.nameLt,
      nameEn: m.nameEn,
      since: "2021-05-12",
      statusLt: "lėtinė",
      statusEn: "chronic",
      byLt: "Dr. Rūta Petrauskienė",
      byEn: "Dr. Ruta Petrauskienė",
      href,
      links: [
        { href: qConditions, labelLt: "Klausimynas", labelEn: "Questionnaire" },
        ...(m.code === "I10"
          ? [
              {
                href: "/patient/visits/v-2026-09-22",
                labelLt: "Metinė apžiūra",
                labelEn: "Annual review",
              },
            ]
          : []),
      ],
    };
  });
  if (!conditions.some((c) => c.code.startsWith("E78"))) {
    conditions.push({
      code: "E78.0",
      nameLt: "Gryna hipercholesterolemija",
      nameEn: "Pure hypercholesterolaemia",
      since: "2024-05-14",
      statusLt: "lėtinė",
      statusEn: "chronic",
      byLt: "Dr. Andrius Kazlauskas",
      byEn: "Dr. Andrius Kazlauskas",
      href: "/patient/marker/LDL?cat=cardiovascular",
      links: [
        {
          href: "/patient/visits/v-2024-05-14",
          labelLt: "Kardiologo vizitas",
          labelEn: "Cardiology visit",
        },
        {
          href: "/patient/prescriptions",
          labelLt: "Receptai",
          labelEn: "Prescriptions",
        },
      ],
    });
  }
  conditions.push({
    code: "Z15.89",
    nameLt: "Genetinis polinkis į širdies ligas (MYBPC3)",
    nameEn: "Genetic susceptibility to cardiac disease (MYBPC3)",
    since: "2025-12-16",
    statusLt: "aktyvi",
    statusEn: "active",
    byLt: "Dr. Eglė Navickaitė",
    byEn: "Dr. Eglė Navickaitė",
    href: "/patient/digital-twin/cardiovascular#section-rare",
    links: [
      {
        href: "/patient/visits/v-2025-12-16",
        labelLt: "Genetiko vizitas",
        labelEn: "Genetics visit",
      },
    ],
  });

  const episodes: HealthCardEpisode[] = [
    {
      code: "J01.9",
      nameLt: "Ūminis sinusitas",
      nameEn: "Acute sinusitis",
      from: "2025-09-02",
      to: "2025-09-16",
      noteLt: "Dėl alergijos penicilinui skirtas klaritromicinas 7 d.",
      noteEn: "Clarithromycin 7 days due to penicillin allergy.",
      href: qAllergies,
    },
    {
      code: "U07.1",
      nameLt: "COVID-19, virusas nustatytas",
      nameEn: "COVID-19, virus identified",
      from: "2022-02-03",
      to: "2022-02-14",
      noteLt: "Lengva eiga, gydytas namuose.",
      noteEn: "Mild course, managed at home.",
    },
    {
      code: "M54.2",
      nameLt: "Kaklo skausmas",
      nameEn: "Cervicalgia",
      from: "2025-03-01",
      to: "2025-04-15",
      noteLt: "KT + fizioterapija; dešinės C5–C6 foraminalinė stenozė.",
      noteEn: "CT + physiotherapy; right C5–C6 foraminal stenosis.",
      href: "/patient/visits/v-2025-03-18",
    },
    {
      code: "K29.70",
      nameLt: "Gastritas, nepatikslintas, be kraujavimo",
      nameEn: "Gastritis, unspecified, without bleeding",
      from: "2025-08-07",
      to: "2025-09-20",
      noteLt: "Po EGD — antralinis erozinis gastritas; PPI kursas.",
      noteEn: "After EGD — antral erosive gastritis; PPI course.",
      href: "/patient/visits/v-2025-08-07",
    },
  ];

  const medNames =
    (v[
      "4_current_medications_supplements__current_medications"
    ] as string[]) || [];
  const meds: HealthCardMed[] = medNames.map((name) => {
    const meta = MED_META[name] || {
      atc: "—",
      doseLt: "Pagal paskyrimą",
      doseEn: "As prescribed",
      byLt: "Dr. Rūta Petrauskienė",
      byEn: "Dr. Ruta Petrauskienė",
    };
    return {
      name,
      atc: meta.atc,
      doseLt: meta.doseLt,
      doseEn: meta.doseEn,
      from: name.includes("Roswera") ? "2024-05-20" : "2021-05-12",
      byLt: meta.byLt,
      byEn: meta.byEn,
      active: true,
      href: "/patient/prescriptions",
      links: [
        { href: qMeds, labelLt: "Klausimynas", labelEn: "Questionnaire" },
        {
          href: "/patient/prescriptions",
          labelLt: "Receptai",
          labelEn: "Prescriptions",
        },
      ],
    };
  });
  if (
    v["4_current_medications_supplements__are_you_currently_taking_any_supplements"] ===
    "Yes"
  ) {
    meds.push({
      name: "Vitaminas D3",
      atc: "A11CC05",
      doseLt: "2000 TV 1 k./d.",
      doseEn: "2000 IU once daily",
      from: "2025-10-01",
      byLt: "Dr. Rūta Petrauskienė",
      byEn: "Dr. Ruta Petrauskienė",
      active: true,
      href: qMeds,
      links: [
        { href: qMeds, labelLt: "Klausimynas", labelEn: "Questionnaire" },
      ],
    });
  }

  // Vaccines from uploaded PDFs / invoices
  const vaccines: HealthCardVaccine[] = [
    {
      id: "vacc-flu-2026",
      nameLt: "Gripo vakcina (sezoninė) — Influvac",
      nameEn: "Seasonal influenza — Influvac",
      date: "2026-10-28",
      lot: "p34",
      next: "2027-10-01",
      placeLt: "Eurovaistinė, Vilnius",
      placeEn: "Eurovaistine, Vilnius",
      productLt: "Influvac 0,5 ml · dozė 1",
      productEn: "Influvac 0.5 ml · dose 1",
      docHref: "/docs/vaccines/gripas-2026-10-28.pdf",
    },
    {
      id: "vacc-flu-2025",
      nameLt: "Gripo vakcina (sezoninė) — Influvac",
      nameEn: "Seasonal influenza — Influvac",
      date: "2025-12-08",
      lot: "L47A",
      next: null,
      placeLt: "Eurovaistinė, Vilnius",
      placeEn: "Eurovaistine, Vilnius",
      productLt: "Influvac 0,5 ml · dozė 1",
      productEn: "Influvac 0.5 ml · dose 1",
      docHref: "/docs/vaccines/gripas-2025-12-08.pdf",
    },
    {
      id: "vacc-tbe-2024",
      nameLt: "Erkinis encefalitas — TicoVac (4 dozė)",
      nameEn: "Tick-borne encephalitis — TicoVac (dose 4)",
      date: "2024-04-29",
      lot: "HJ1684",
      next: "2027-04-29",
      placeLt: "Affidea Lietuva, Kaunas",
      placeEn: "Affidea Lithuania, Kaunas",
      productLt: "TicoVac 2,4 µg / 0,5 ml",
      productEn: "TicoVac 2.4 µg / 0.5 ml",
      docHref: "/docs/vaccines/ticovac-2024-04-29.pdf",
    },
    {
      id: "vacc-tbe-2021",
      nameLt: "Erkinis encefalitas — TicoVac (pirkimas / skiepas)",
      nameEn: "Tick-borne encephalitis — TicoVac (purchase / dose)",
      date: "2021-09-17",
      lot: null,
      next: null,
      placeLt: "Diagnostikos laboratorija (Antėja)",
      placeEn: "Diagnostic laboratory (Anteja)",
      productLt: "Ticovac 2,4 mcg 0,5 ml",
      productEn: "Ticovac 2.4 mcg 0.5 ml",
      docHref: "/docs/vaccines/invoice-ticovac-2021-09-17.pdf",
    },
    {
      id: "vacc-tbe-prevenar-2020",
      nameLt: "TicoVac + Prevenar 13 (sąskaita)",
      nameEn: "TicoVac + Prevenar 13 (invoice)",
      date: "2020-10-26",
      lot: null,
      next: null,
      placeLt: "Diagnostikos laboratorija (Antėja)",
      placeEn: "Diagnostic laboratory (Anteja)",
      productLt: "Ticovac + Prevenar 13",
      productEn: "Ticovac + Prevenar 13",
      docHref: "/docs/vaccines/invoice-ticovac-prevenar-2020-10-26.pdf",
    },
    {
      id: "vacc-td",
      nameLt: "Stabligė, difterija (Td)",
      nameEn: "Tetanus, diphtheria (Td)",
      date: "2017-06-20",
      lot: "TD-4471",
      next: "2027-06-20",
      placeLt: "Poliklinika / šeimos gydytoja",
      placeEn: "Clinic / family doctor",
      productLt: "Td stiprinamoji dozė",
      productEn: "Td booster",
    },
  ];

  const procedures: HealthCardProcedure[] = [
    {
      id: "proc-egd",
      nameLt: "Fibroezofagogastroduodenoskopija (EGD)",
      nameEn: "Upper endoscopy (EGD)",
      date: "2025-08-07",
      whereLt: "Lyfora Endoskopijos kabinetas, Vilnius",
      whereEn: "Lyfora Endoscopy Suite, Vilnius",
      typeLt: "procedūra",
      typeEn: "procedure",
      resultLt: "Antralinis erozinis gastritas; biopsijos H. pylori.",
      resultEn: "Antral erosive gastritis; biopsies for H. pylori.",
      detailLt:
        "Diagnostinė EGD vietinėje anestezijoje. Pacientas ryjo lanksčią endoskopinę slangą; apžiūrėta stemplė, skrandis ir dvylikapirštė žarna iki D2. Antrume erozijos, paimtos biopsijos.",
      detailEn:
        "Diagnostic EGD under topical anaesthesia. Flexible endoscope swallowed; oesophagus, stomach and duodenum to D2 inspected. Antral erosions with biopsies taken.",
      href: "/patient/health-card/procedures/proc-egd",
      visitHref: "/patient/visits/v-2025-08-07",
    },
    {
      id: "proc-neck-ct",
      nameLt: "Kaklo stuburo kompiuterinė tomografija (KT)",
      nameEn: "Cervical spine CT",
      date: "2025-03-25",
      whereLt: "Affidea Diagnostikos centras, Vilnius",
      whereEn: "Affidea Diagnostic Centre, Vilnius",
      typeLt: "tyrimas",
      typeEn: "imaging",
      resultLt: "C5–C6 dešinė foraminalinė stenozė, osteochondrozė.",
      resultEn: "Right C5–C6 foraminal stenosis, osteochondrosis.",
      detailLt:
        "Spiralinė KT be kontrasto, C2–Th1. Dešinėje C5–C6 neuroforameninė stenozė dėl uncinatinių ataugų hipertrofijos; stuburo kanalas pakankamas.",
      detailEn:
        "Helical CT without contrast, C2–Th1. Right C5–C6 foraminal stenosis from uncovertebral hypertrophy; canal calibre preserved.",
      imageSrc: "/docs/neck-ct-c5c6.png",
      href: "/patient/health-card/procedures/proc-neck-ct",
      visitHref: "/patient/visits/v-2025-03-18",
    },
    {
      id: "proc-echo",
      nameLt: "Echokardiografija",
      nameEn: "Echocardiography",
      date: "2025-06-02",
      whereLt: "Lyfora Heart Center",
      whereEn: "Lyfora Heart Center",
      typeLt: "tyrimas",
      typeEn: "imaging",
      resultLt: "KS sienelės nežymiai sustorėjusios (11 mm), IF 60 %.",
      resultEn: "Mild LV wall thickening (11 mm), EF 60%.",
      detailLt:
        "Transtorakalinė echo: kairiojo skilvelio sienelės 11 mm, išstūmimo frakcija ~60 %, vožtuvai be reikšmingos regurgitacijos. Stebėti MYBPC3 kontekste.",
      detailEn:
        "Transthoracic echo: LV walls 11 mm, EF ~60%, no significant valvular regurgitation. Monitor in MYBPC3 context.",
      href: "/patient/health-card/procedures/proc-echo",
      visitHref: "/patient/visits/v-2024-05-14",
    },
    {
      id: "proc-knee",
      nameLt: "Kairio kelio artroskopija (menisko rezekcija)",
      nameEn: "Left knee arthroscopy (meniscus resection)",
      date: "2019-11-18",
      whereLt: "Lyfora klinika",
      whereEn: "Lyfora Clinic",
      typeLt: "operacija",
      typeEn: "surgery",
      resultLt: "Be komplikacijų; reabilitacija 6 sav.",
      resultEn: "Uneventful; 6-week rehab.",
      detailLt:
        "Artroskopinė dalinė medialinio menisko rezekcija. Pooperacinė eiga be komplikacijų, kineziterapija 6 savaites.",
      detailEn:
        "Arthroscopic partial medial meniscus resection. Uneventful recovery; physiotherapy 6 weeks.",
      href: "/patient/health-card/procedures/proc-knee",
    },
  ];

  const types =
    (v["7_lifestyle__type_of_exercise_sport"] as string[]) || [];
  const freq = String(v["7_lifestyle__exercise_frequency"] || "");
  const sleepDur = String(
    v["7_lifestyle__average_sleep_duration"] || "6–7 hours"
  );
  const sleepQual = String(v["7_lifestyle__sleep_quality"] || "");

  const family: { lt: string; en: string; href?: string }[] = [];
  const members =
    (
      input.answers as {
        familyMembers?: {
          relative?: string;
          conditions?: string[];
          notes?: string;
        }[];
      }
    ).familyMembers || [];
  for (const m of members) {
    const conds = (m.conditions || []).join(", ");
    if (!conds) continue;
    family.push({
      lt: `${m.relative || "Šeimos narys"} — ${conds}`,
      en: `${m.relative || "Family member"} — ${conds}`,
      href: qFamily,
    });
  }
  family.push({
    lt: "Tėvas — miokardo infarktas (~58 m.)",
    en: "Father — myocardial infarction (~age 58)",
    href: qFamily,
  });
  if (!family.some((f) => /hipertenz/i.test(f.lt))) {
    family.push({
      lt: "Motina — hipertenzija",
      en: "Mother — hypertension",
      href: qFamily,
    });
  }

  const docs: HealthCardDoc[] = [
    {
      nameLt: "Helicobacter pylori IgG (2026-09-15)",
      nameEn: "Helicobacter pylori IgG (2026-09-15)",
      date: "2026-09-15",
      size: "58 KB",
      kind: "lab",
      fresh: true,
      href: "/docs/labs/helicobacter-2026-09-15.pdf",
    },
    {
      nameLt: "Helicobacter pylori IgG (2023-12-01)",
      nameEn: "Helicobacter pylori IgG (2023-12-01)",
      date: "2023-12-01",
      size: "423 KB",
      kind: "lab",
      href: "/docs/labs/helicobacter-2023-12-01.pdf",
    },
    {
      nameLt: "Gripo skiepo įrašas (Influvac) 2026-10-28",
      nameEn: "Influenza vaccination record 2026-10-28",
      date: "2026-10-28",
      size: "58 KB",
      kind: "vaccine",
      fresh: true,
      href: "/docs/vaccines/gripas-2026-10-28.pdf",
    },
    {
      nameLt: "Gripo skiepo įrašas 2025-12-08",
      nameEn: "Influenza vaccination record 2025-12-08",
      date: "2025-12-08",
      size: "57 KB",
      kind: "vaccine",
      href: "/docs/vaccines/gripas-2025-12-08.pdf",
    },
    {
      nameLt: "TicoVac vakcinacijos įrašas 2024-04-29",
      nameEn: "TicoVac vaccination record 2024-04-29",
      date: "2024-04-29",
      size: "87 KB",
      kind: "vaccine",
      href: "/docs/vaccines/ticovac-2024-04-29.pdf",
    },
    {
      nameLt: "Kaklo stuburo KT aprašymas (Affidea)",
      nameEn: "Cervical spine CT report (Affidea)",
      date: "2025-03-25",
      size: "—",
      kind: "report",
      href: "/patient/visits/v-2025-03-18",
    },
    {
      nameLt: "EGD aprašymas",
      nameEn: "EGD report",
      date: "2025-08-07",
      size: "—",
      kind: "report",
      href: "/patient/visits/v-2025-08-07",
    },
    {
      nameLt: "Priešvizitinė kraujo panelė (kaklas)",
      nameEn: "Pre-visit blood panel (neck)",
      date: "2025-03-17",
      size: "—",
      kind: "lab",
      href: "/patient/visits/v-2025-03-18",
    },
  ];

  const smoking = mapSmoking(
    v["7_lifestyle__do_you_smoke_or_use_nicotine_products"]
  );
  const alcohol = mapAlcohol(v["7_lifestyle__alcohol_consumption"]);

  return {
    patientName: input.patientName,
    sexLt: input.sex === "female" ? "Moteris" : "Vyras",
    sexEn: input.sex === "female" ? "Female" : "Male",
    age: ageFromDob(input.dob),
    dob: input.dob,
    bloodGroup: "A(II) Rh+",
    familyDoctorLt: "Dr. Rūta Petrauskienė",
    familyDoctorEn: "Dr. Ruta Petrauskienė",
    allergies: allergyItems,
    vitals: {
      bp,
      weightKg: weight,
      heightCm: height,
      bmi: bmiOf(height, weight),
      bpHref: "/patient/marker/BLOOD_PRESSURE?cat=cardiovascular",
    },
    lifestyle: {
      smokingLt: smoking.lt,
      smokingEn: smoking.en,
      alcoholLt: alcohol.lt,
      alcoholEn: alcohol.en,
      activityLt: mapActivityLt(freq, types),
      activityEn: mapActivityEn(freq, types),
      sleepLt: mapSleep(sleepDur, sleepQual, "lt"),
      sleepEn: mapSleep(sleepDur, sleepQual, "en"),
      href: qLifestyle,
    },
    family,
    familyHref: qFamily,
    conditions,
    conditionsHref: qConditions,
    episodes,
    meds,
    medsHref: qMeds,
    vaccines,
    procedures,
    visits: pastVisits(),
    visitsHref: "/patient/visits?tab=history",
    docs,
    docsUploadHref: "/patient/uploads",
  };
}

export function getHealthCardProcedure(
  id: string,
  input: Parameters<typeof buildHealthCard>[0]
) {
  return buildHealthCard(input).procedures.find((p) => p.id === id) || null;
}
