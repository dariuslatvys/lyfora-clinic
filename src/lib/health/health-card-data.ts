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

export type HealthCardCondition = {
  code: string;
  nameLt: string;
  nameEn: string;
  since: string;
  statusLt: string;
  statusEn: string;
  byLt: string;
  byEn: string;
};

export type HealthCardEpisode = {
  code: string;
  nameLt: string;
  nameEn: string;
  from: string;
  to: string;
  noteLt: string;
  noteEn: string;
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
  stopReasonLt?: string;
  stopReasonEn?: string;
};

export type HealthCardVaccine = {
  nameLt: string;
  nameEn: string;
  date: string | null;
  lot: string | null;
  next: string | null;
};

export type HealthCardProcedure = {
  nameLt: string;
  nameEn: string;
  date: string;
  whereLt: string;
  whereEn: string;
  typeLt: string;
  typeEn: string;
  resultLt?: string;
  resultEn?: string;
};

export type HealthCardDoc = {
  nameLt: string;
  nameEn: string;
  date: string;
  size: string;
  kind: "lab" | "report" | "note";
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
  allergies: { lt: string; en: string }[];
  vitals: {
    bp: string | null;
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
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
  };
  family: { lt: string; en: string }[];
  conditions: HealthCardCondition[];
  episodes: HealthCardEpisode[];
  meds: HealthCardMed[];
  vaccines: HealthCardVaccine[];
  procedures: HealthCardProcedure[];
  visits: DemoVisit[];
  docs: HealthCardDoc[];
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
    return { lt: "Metė rūkyti / buvęs rūkalius", en: "Former smoker" };
  if (/never|no/i.test(s)) return { lt: "Nerūko", en: "Does not smoke" };
  if (/current|yes/i.test(s)) return { lt: "Rūko", en: "Current smoker" };
  return { lt: "Nenurodyta", en: "Not specified" };
}

function mapAlcohol(v: unknown): { lt: string; en: string } {
  const s = String(v || "");
  if (/occas/i.test(s)) return { lt: "Retkarčiais", en: "Occasionally" };
  if (/never/i.test(s)) return { lt: "Nevartoja", en: "Never" };
  if (/regular|week/i.test(s))
    return { lt: "Reguliariai", en: "Regularly" };
  return { lt: s || "Nenurodyta", en: s || "Not specified" };
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

  const allergyItems: { lt: string; en: string }[] = [];
  const food = (v["3_allergies__food_allergies"] as string[]) || [];
  const env = (v["3_allergies__environmental_allergies"] as string[]) || [];
  const insect = (v["3_allergies__insect_allergies"] as string[]) || [];
  for (const a of food)
    allergyItems.push({ lt: `Maistas: ${a}`, en: `Food: ${a}` });
  for (const a of env)
    allergyItems.push({
      lt: `Aplinka: ${a}`,
      en: `Environmental: ${a}`,
    });
  for (const a of insect)
    allergyItems.push({ lt: `Vabzdžiai: ${a}`, en: `Insect: ${a}` });
  // Demo clinical allergy often relevant with antibiotics history
  if (!allergyItems.some((x) => /penicilin/i.test(x.lt + x.en))) {
    allergyItems.push({
      lt: "Penicilinas (bėrimas) — pagal klinikos įrašą",
      en: "Penicillin (rash) — per clinic record",
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
    return {
      code: m.code,
      nameLt: m.nameLt,
      nameEn: m.nameEn,
      since: "2021-05-12",
      statusLt: "lėtinė",
      statusEn: "chronic",
      byLt: "Dr. Rūta Petrauskienė",
      byEn: "Dr. Ruta Petrauskienė",
    };
  });
  // Dyslipidaemia inferred from statin + labs
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
    },
    {
      code: "K29.70",
      nameLt: "Gastritas, nepatikslintas, be kraujavimo",
      nameEn: "Gastritis, unspecified, without bleeding",
      from: "2025-08-07",
      to: "2025-09-20",
      noteLt: "Po EGD — antralinis erozinis gastritas; PPI kursas.",
      noteEn: "After EGD — antral erosive gastritis; PPI course.",
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
    };
  });
  // Supplement placeholder from questionnaire yes
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
    });
  }

  const vaccines: HealthCardVaccine[] = [
    {
      nameLt: "Gripo vakcina (sezoninė)",
      nameEn: "Seasonal influenza vaccine",
      date: "2025-10-15",
      lot: "FL2025-118",
      next: "2026-10-01",
    },
    {
      nameLt: "COVID-19 (pritaikyta XBB/JN.1)",
      nameEn: "COVID-19 (XBB/JN.1 adapted)",
      date: "2025-09-20",
      lot: "CV-JN1-77",
      next: null,
    },
    {
      nameLt: "Stabligė, difterija (Td)",
      nameEn: "Tetanus, diphtheria (Td)",
      date: "2017-06-20",
      lot: "TD-4471",
      next: "2027-06-20",
    },
    {
      nameLt: "Erkinis encefalitas (3 dozė)",
      nameEn: "Tick-borne encephalitis (3rd dose)",
      date: "2020-04-10",
      lot: "TBE-0921",
      next: "2026-12-10",
    },
  ];

  const procedures: HealthCardProcedure[] = [
    {
      nameLt: "Fibroezofagogastroduodenoskopija (EGD)",
      nameEn: "Upper endoscopy (EGD)",
      date: "2025-08-07",
      whereLt: "Lyfora Endoskopijos kabinetas, Vilnius",
      whereEn: "Lyfora Endoscopy Suite, Vilnius",
      typeLt: "procedūra",
      typeEn: "procedure",
      resultLt: "Antralinis erozinis gastritas; biopsijos H. pylori.",
      resultEn: "Antral erosive gastritis; biopsies for H. pylori.",
    },
    {
      nameLt: "Kaklo stuburo kompiuterinė tomografija (KT)",
      nameEn: "Cervical spine CT",
      date: "2025-03-25",
      whereLt: "Affidea Diagnostikos centras, Vilnius",
      whereEn: "Affidea Diagnostic Centre, Vilnius",
      typeLt: "tyrimas",
      typeEn: "imaging",
      resultLt: "C5–C6 dešinė foraminalinė stenozė, osteochondrozė.",
      resultEn: "Right C5–C6 foraminal stenosis, osteochondrosis.",
    },
    {
      nameLt: "Echokardiografija",
      nameEn: "Echocardiography",
      date: "2025-06-02",
      whereLt: "Lyfora Heart Center",
      whereEn: "Lyfora Heart Center",
      typeLt: "tyrimas",
      typeEn: "imaging",
      resultLt: "KS sienelės nežymiai sustorėjusios (11 mm), IF 60 %.",
      resultEn: "Mild LV wall thickening (11 mm), EF 60%.",
    },
    {
      nameLt: "Kairio kelio artroskopija (menisko rezekcija)",
      nameEn: "Left knee arthroscopy (meniscus resection)",
      date: "2019-11-18",
      whereLt: "Lyfora klinika",
      whereEn: "Lyfora Clinic",
      typeLt: "operacija",
      typeEn: "surgery",
      resultLt: "Be komplikacijų; reabilitacija 6 sav.",
      resultEn: "Uneventful; 6-week rehab.",
    },
  ];

  const exercise = (
    (v["7_lifestyle__type_of_exercise_sport"] as string[]) || []
  ).join(", ");
  const freq = String(v["7_lifestyle__exercise_frequency"] || "");
  const activityLt = exercise
    ? `${freq || "Aktyvus"} · ${exercise}`
    : "Vidutinis";
  const activityEn = exercise
    ? `${freq || "Active"} · ${exercise}`
    : "Moderate";

  const sleepDur = String(
    v["7_lifestyle__average_sleep_duration"] || "6–7 hours"
  );
  const sleepQual = String(v["7_lifestyle__sleep_quality"] || "");

  const family: { lt: string; en: string }[] = [];
  const members = (input.answers as { familyMembers?: { relative?: string; conditions?: string[]; notes?: string }[] }).familyMembers || [];
  for (const m of members) {
    const conds = (m.conditions || []).join(", ");
    if (!conds) continue;
    family.push({
      lt: `${m.relative || "Šeimos narys"} — ${conds}${m.notes ? ` (${m.notes})` : ""}`,
      en: `${m.relative || "Family member"} — ${conds}${m.notes ? ` (${m.notes})` : ""}`,
    });
  }
  // From seed questionnaire key
  family.push({
    lt: "Tėvas — miokardo infarktas (~58 m.)",
    en: "Father — myocardial infarction (~age 58)",
  });
  if (!family.some((f) => /hipertenz/i.test(f.lt))) {
    family.push({
      lt: "Motina — hipertenzija",
      en: "Mother — hypertension",
    });
  }

  const docs: HealthCardDoc[] = [
    {
      nameLt: "Helicobacter pylori IgG protokolas",
      nameEn: "Helicobacter pylori IgG protocol",
      date: "2026-09-15",
      size: "84 KB",
      kind: "lab",
      fresh: true,
    },
    {
      nameLt: "Lipidų / ApoB panelė",
      nameEn: "Lipid / ApoB panel",
      date: "2026-06-03",
      size: "120 KB",
      kind: "lab",
    },
    {
      nameLt: "Laboratoriniai tyrimai (2025-12-08)",
      nameEn: "Laboratory results (2025-12-08)",
      date: "2025-12-08",
      size: "1.0 MB",
      kind: "lab",
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
      nameLt: "NGS / genetikos konsultacijos pastabos",
      nameEn: "NGS / genetics consult notes",
      date: "2025-12-16",
      size: "—",
      kind: "note",
      href: "/patient/visits/v-2025-12-16",
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
    },
    lifestyle: {
      smokingLt: smoking.lt,
      smokingEn: smoking.en,
      alcoholLt: alcohol.lt,
      alcoholEn: alcohol.en,
      activityLt,
      activityEn,
      sleepLt: `${sleepDur}${sleepQual ? ` · ${sleepQual}` : ""}`,
      sleepEn: `${sleepDur}${sleepQual ? ` · ${sleepQual}` : ""}`,
    },
    family,
    conditions,
    episodes,
    meds,
    vaccines,
    procedures,
    visits: pastVisits(),
    docs,
  };
}
