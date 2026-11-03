
export type QFieldType =
  | "select"
  | "select_list"
  | "multiselect"
  | "number"
  | "year"
  | "date"
  | "text"
  | "tags"
  | "calculated"
  | "blood_pressure"
  | "yes_no_details";

export type QField = {
  nr: number;
  id: string;
  step: string;
  section: string | null;
  label: string;
  required: boolean;
  auto: boolean;
  type: QFieldType;
  options: string[] | null;
  listRef: string | null;
  showWhen: string;
  notes: string | null;
  repeatOf: string | null;
  unit: string | null;
};

export type QList =
  | { grouped: false; items: string[] }
  | { grouped: true; groups: { name: string; items: string[] }[] };

export type QDefinition = {
  version: string;
  source: string;
  steps: { id: string; title: string; fields: string[] }[];
  fields: QField[];
  lists: Record<string, QList>;
};

export type ConditionDetail = {
  status?: string;
  year?: string;
  notes?: string;
};

/** One relative: relation, lifespan years, and known diseases. */
export type FamilyMember = {
  id: string;
  relative: string;
  conditions: string[];
  /** Year of birth */
  birthYear?: number | null;
  /** Living / Deceased / Unknown */
  vitalStatus?: string;
  /** Year of death when deceased */
  deathYear?: number | null;
  notes?: string;
};

export type QuestionnaireAnswers = {
  updatedAt: string | null;
  values: Record<string, unknown>;
  conditionDetails: Record<string, ConditionDetail>;
  familyMembers: FamilyMember[];
  cancer: {
    types: string[];
    status?: string;
    year?: string;
    treatment: string[];
    info?: string;
  };
};

const ANSWER_KEY = "health_questionnaire_v1";
const CURRENT_YEAR = () => new Date().getFullYear();

export function emptyAnswers(): QuestionnaireAnswers {
  return {
    updatedAt: null,
    values: {},
    conditionDetails: {},
    familyMembers: [],
    cancer: { types: [], treatment: [] },
  };
}

function coerceYear(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return Math.round(n);
  }
  return null;
}

function normalizeVitalStatus(raw: unknown): string {
  const s = String(raw || "").trim();
  if (/^(living|gyvas|alive)$/i.test(s)) return "Living";
  if (/^(deceased|miręs|mires|dead)$/i.test(s)) return "Deceased";
  if (/^(unknown|nežinoma|nezinoma)$/i.test(s)) return "Unknown";
  return s;
}

function normalizeMember(m: {
  id?: string;
  relative?: string;
  conditions?: string[];
  birthYear?: number | string | null;
  vitalStatus?: string;
  deathYear?: number | string | null;
  ageYears?: number | null;
  notes?: string;
}): FamilyMember {
  const year = CURRENT_YEAR();
  let birthYear = coerceYear(m.birthYear);
  let deathYear = coerceYear(m.deathYear);
  const vitalStatus = normalizeVitalStatus(m.vitalStatus);
  // Migrate legacy ageYears → approximate birth/death years
  if (
    birthYear == null &&
    typeof m.ageYears === "number" &&
    Number.isFinite(m.ageYears)
  ) {
    if (/^deceased$/i.test(vitalStatus)) {
      deathYear = deathYear ?? year;
      birthYear = deathYear - Math.round(m.ageYears);
    } else {
      birthYear = year - Math.round(m.ageYears);
    }
  }
  if (birthYear != null && (birthYear < 1850 || birthYear > year)) {
    birthYear = null;
  }
  if (
    deathYear != null &&
    (deathYear < 1850 ||
      deathYear > year ||
      (birthYear != null && deathYear < birthYear))
  ) {
    deathYear = null;
  }
  return {
    id: m.id || `fm_${Math.random().toString(36).slice(2, 9)}`,
    relative: m.relative || "",
    conditions: Array.isArray(m.conditions)
      ? m.conditions.filter((c) => typeof c === "string" && c.trim())
      : [],
    birthYear,
    vitalStatus,
    deathYear: /^deceased$/i.test(vitalStatus) ? deathYear : null,
    notes: m.notes,
  };
}

export function parseStoredAnswers(raw: string | null | undefined): QuestionnaireAnswers {
  if (!raw) return emptyAnswers();
  try {
    type LegacyLongevity = {
      id?: string;
      relative?: string;
      vitalStatus?: string;
      ageYears?: number | null;
      notes?: string;
    };
    const data = JSON.parse(raw) as {
      updatedAt?: string | null;
      values?: Record<string, unknown>;
      conditionDetails?: Record<string, ConditionDetail>;
      familyMembers?: Array<Parameters<typeof normalizeMember>[0]>;
      longevityMembers?: LegacyLongevity[];
      cancer?: QuestionnaireAnswers["cancer"];
    };
    const byKey = new Map<string, FamilyMember>();
    for (const rawMember of data.familyMembers || []) {
      const m = normalizeMember(rawMember);
      byKey.set(m.id, m);
    }
    // Fold legacy separate longevity list into the same cards
    for (const lon of data.longevityMembers || []) {
      const rel = lon.relative || "";
      const existing = [...byKey.values()].find(
        (m) => m.relative && rel && m.relative === rel
      );
      if (existing) {
        const merged = normalizeMember({
          ...existing,
          vitalStatus: existing.vitalStatus || lon.vitalStatus,
          ageYears:
            existing.birthYear != null ? undefined : lon.ageYears ?? undefined,
        });
        byKey.set(existing.id, merged);
      } else if (rel || lon.ageYears != null) {
        const m = normalizeMember({
          id: lon.id || `fm_lon_${Math.random().toString(36).slice(2, 7)}`,
          relative: rel,
          conditions: [],
          vitalStatus: lon.vitalStatus,
          ageYears: lon.ageYears,
          notes: lon.notes,
        });
        byKey.set(m.id, m);
      }
    }
    const values = { ...(data.values || {}) };
    // Drop obsolete longevity gate keys from values
    for (const k of Object.keys(values)) {
      if (k.startsWith("10_family_history__longevity__")) delete values[k];
    }
    return {
      ...emptyAnswers(),
      updatedAt: data.updatedAt ?? null,
      values,
      conditionDetails: data.conditionDetails || {},
      familyMembers: [...byKey.values()],
      cancer: {
        types: data.cancer?.types || [],
        status: data.cancer?.status,
        year: data.cancer?.year,
        treatment: data.cancer?.treatment || [],
        info: data.cancer?.info,
      },
    };
  } catch {
    return emptyAnswers();
  }
}

/** Normalize client payload before persisting. */
export function normalizeQuestionnaireAnswers(
  input: QuestionnaireAnswers
): QuestionnaireAnswers {
  return {
    ...emptyAnswers(),
    ...input,
    values: input.values || {},
    conditionDetails: input.conditionDetails || {},
    familyMembers: (input.familyMembers || []).map((m) => normalizeMember(m)),
    cancer: {
      types: input.cancer?.types || [],
      status: input.cancer?.status,
      year: input.cancer?.year,
      treatment: input.cancer?.treatment || [],
      info: input.cancer?.info,
    },
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function questionnaireStorageKey() {
  return ANSWER_KEY;
}

export function fieldById(def: QDefinition, id: string) {
  return def.fields.find((f) => f.id === id);
}

export function listItems(def: QDefinition, listRef: string | null): string[] {
  if (!listRef) return [];
  const list = def.lists[listRef];
  if (!list) return [];
  if (!list.grouped) return list.items;
  return list.groups.flatMap((g) => g.items);
}

function val(answers: QuestionnaireAnswers, id: string) {
  return answers.values[id];
}

function findFieldValue(
  answers: QuestionnaireAnswers,
  def: QDefinition,
  match: (f: QField) => boolean
) {
  const f = def.fields.find(match);
  return f ? val(answers, f.id) : undefined;
}

export function biologicalSex(answers: QuestionnaireAnswers, def: QDefinition) {
  const v = findFieldValue(
    answers,
    def,
    (f) => f.label === "Biological Sex"
  );
  return typeof v === "string" ? v : null;
}

export function computeBmi(answers: QuestionnaireAnswers, def: QDefinition) {
  const h = Number(
    findFieldValue(answers, def, (f) => f.label === "Height")
  );
  const w = Number(
    findFieldValue(answers, def, (f) => f.label === "Weight")
  );
  if (!h || !w || h < 50 || h > 260 || w < 20 || w > 400) return null;
  const m = h / 100;
  return Math.round((w / (m * m)) * 10) / 10;
}

/** Whole years from an ISO date string (YYYY-MM-DD). */
export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const born = new Date(`${dob}T12:00:00`);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

export function computeAge(answers: QuestionnaireAnswers, def: QDefinition) {
  const dob = findFieldValue(
    answers,
    def,
    (f) => f.label === "Date of Birth"
  );
  return typeof dob === "string" ? ageFromDob(dob) : null;
}

/** LT display labels for common English questionnaire fields. */
export const FIELD_LABEL_LT: Record<string, string> = {
  "Biological Sex": "Lytis",
  "Date of Birth": "Gimimo data",
  Age: "Amžius",
  Height: "Ūgis",
  Weight: "Svoris",
  BMI: "KMI",
  "Waist Circumference": "Juosmens apimtis",
  "Known Blood Pressure": "Kraujo spaudimas",
  "Resting Heart Rate": "Ramybės pulsas",
  "HRV (30-Day Average)": "HRV (30 d. vidurkis)",
  "VO₂max": "VO₂ max",
  "How would you rate your overall health?": "Kaip vertinate bendrą sveikatą?",
  "Are you currently taking any prescription medications?":
    "Ar šiuo metu vartojate receptinius vaistus?",
  "Current Medications": "Vartojami vaistai",
  "Are you currently taking any supplements?":
    "Ar šiuo metu vartojate maisto papildus?",
  Supplements: "Papildai",
  Relative: "Giminaitis",
  "Medical Conditions": "Ligos",
  "Living or deceased": "Gyvas ar miręs",
  "Age (current or at death)": "Amžius (dabartinis arba mirties)",
  Notes: "Pastabos",
  "Has any blood relative lived to age 80 or older?":
    "Ar kas nors iš kraujo giminaičių nugyveno 80 metų ar daugiau?",
};

export const OPTION_LABEL_LT: Record<string, string> = {
  Male: "Vyras",
  Female: "Moteris",
  Yes: "Taip",
  No: "Ne",
  Current: "Dabartinė",
  Past: "Buvusi",
  Active: "Aktyvus",
  Remission: "Remisija",
  Resolved: "Išspręsta",
  Living: "Gyvas",
  Deceased: "Miręs",
  Unknown: "Nežinau",
  "2 or more": "2 ar daugiau",
  Mother: "Motina",
  Father: "Tėvas",
  Sister: "Sesuo",
  Brother: "Brolis",
  Daughter: "Dukra",
  Son: "Sūnus",
  "Maternal Grandmother": "Senelė (motinos pusė)",
  "Maternal Grandfather": "Senelis (motinos pusė)",
  "Paternal Grandmother": "Senelė (tėvo pusė)",
  "Paternal Grandfather": "Senelis (tėvo pusė)",
  Cardiovascular: "Širdis ir kraujagyslės",
  Metabolic: "Medžiagų apykaita",
  Cancer: "Vėžys",
  Neurological: "Neurologija",
  Autoimmune: "Autoimuninės",
  "Other Hereditary Risks": "Kitos paveldimos rizikos",
  "Heart Attack / Myocardial Infarction": "Infarktas",
  "Stroke / TIA": "Insultas / TIA",
  "High Blood Pressure": "Padidėjęs kraujospūdis",
  "High Cholesterol": "Padidėjęs cholesterolis",
  "Heart Failure": "Širdies nepakankamumas",
  Arrhythmia: "Aritmija",
  "Sudden Cardiac Death": "Staigi širdies mirtis",
  "Type 2 Diabetes": "2 tipo cukrinis diabetas",
  "Type 1 Diabetes": "1 tipo cukrinis diabetas",
  Obesity: "Nutukimas",
  "Thyroid Disease": "Skydliaukės liga",
  "Breast Cancer": "Krūties vėžys",
  "Ovarian Cancer": "Kiaušidžių vėžys",
  "Prostate Cancer": "Prostatos vėžys",
  "Colon Cancer": "Storosos žarnos vėžys",
  "Lung Cancer": "Plaučių vėžys",
  Melanoma: "Melanoma",
  "Other Cancer": "Kitas vėžys",
  "Alzheimer's / Dementia": "Alzheimeris / demencija",
  "Parkinson's Disease": "Parkinsono liga",
  "Multiple Sclerosis": "Išsėtinė sklerozė",
  Epilepsy: "Epilepsija",
  "Rheumatoid Arthritis": "Reumatoidinis artritas",
  Lupus: "Vilklige",
  "Inflammatory Bowel Disease": "Uždegiminė žarnų liga",
  Psoriasis: "Psoriazė",
  "Celiac Disease": "Celiakija",
  "Blood Clotting Disorder": "Krešėjimo sutrikimas",
  "Kidney Disease": "Inkstų liga",
  "Liver Disease": "Kepenų liga",
  Asthma: "Astma",
  "Early Hearing Loss": "Ankstyvas klausos praradimas",
  "Macular Degeneration": "Geltonosios dėmės degeneracija",
};

export function fieldLabel(field: QField, locale: "lt" | "en") {
  if (locale === "lt") return FIELD_LABEL_LT[field.label] || field.label;
  return field.label;
}

export function optionLabel(value: string, locale: "lt" | "en") {
  if (locale === "lt") return OPTION_LABEL_LT[value] || value;
  return value;
}

/** Filter medical-condition options by sex. */
export function conditionsForSex(
  def: QDefinition,
  sex: string | null
): QList {
  const list = def.lists["Medical Conditions"];
  if (!list || !list.grouped) return list || { grouped: false, items: [] };
  const groups = list.groups.filter((g) => {
    const n = g.name.toLowerCase();
    if (n.includes("female") && sex !== "Female") return false;
    if (n.includes("male-specific") || (n.includes("male") && !n.includes("female"))) {
      if (n.includes("female")) return sex === "Female";
      if (sex !== "Male") return false;
    }
    return true;
  });
  return { grouped: true, groups };
}

export function isFieldVisible(
  field: QField,
  answers: QuestionnaireAnswers,
  def: QDefinition
): boolean {
  // Repeatable / custom family blocks are rendered outside FieldRenderer
  if (field.repeatOf === "conditions" || field.repeatOf === "family") {
    return false;
  }
  if (field.section === "Cancer details") {
    const selected = (val(
      answers,
      def.fields.find((f) => f.label === "Medical conditions")?.id || ""
    ) || []) as string[];
    const hasCancer =
      selected.some((c) => /cancer/i.test(c)) || answers.cancer.types.length > 0;
    return hasCancer;
  }

  const rule = (field.showWhen || "Visada").trim();
  if (!rule || rule === "Visada") {
    // Female-only step
    if (field.step.startsWith("6.")) {
      return biologicalSex(answers, def) === "Female";
    }
    return true;
  }

  const sex = biologicalSex(answers, def);

  if (rule === "Biological Sex = Female") return sex === "Female";
  if (rule === "Biological Sex = Male") return sex === "Male";
  if (rule.startsWith("Female;")) {
    if (sex !== "Female") return false;
    const situation = findFieldValue(
      answers,
      def,
      (f) => f.label.startsWith("Which best describes your current situation")
    );
    if (/not Pregnant|Menopause/i.test(rule)) {
      if (situation === "Pregnant") return false;
      if (
        typeof situation === "string" &&
        /Menopause \(no menstrual periods/i.test(situation)
      ) {
        return false;
      }
    }
    return true;
  }

  const yesGates: Record<string, (f: QField) => boolean> = {
    "Diagnosed = Yes": (f) =>
      f.label.startsWith("Have you ever been diagnosed with any medical"),
    "Allergies = Yes": (f) => f.label.startsWith("Do you have any known allergies"),
    "Medications = Yes": (f) =>
      f.label.startsWith("Are you currently taking any prescription"),
    "Supplements = Yes": (f) =>
      f.label.startsWith("Are you currently taking any supplements"),
    "Surgery = Yes": (f) =>
      f.label.startsWith("Have you ever undergone any surgery"),
    "Events = Yes": (f) =>
      f.label.startsWith("Have you experienced any major injuries"),
    "Hospitalized = Yes": (f) =>
      f.label.startsWith("Have you ever been hospitalized"),
    "Abnormal = Yes": (f) =>
      f.label.startsWith("Have you ever been informed that any of the following"),
    "Symptoms = Yes": (f) =>
      f.label.startsWith("Do you currently experience any persistent"),
    "Exercise = Yes": (f) =>
      f.label.startsWith("Do you exercise or participate in sports"),
    "Smoking = Current User": (f) =>
      f.label.startsWith("Do you smoke or use nicotine"),
    "Cancer selected": () => false, // handled above
    "Condition selected": () => false,
    "Family member added": () => false,
  };

  const gate = yesGates[rule];
  if (gate) {
    if (rule === "Smoking = Current User") {
      return (
        findFieldValue(answers, def, gate) === "Current User"
      );
    }
    return findFieldValue(answers, def, gate) === "Yes";
  }

  if (field.step.startsWith("6.")) return sex === "Female";
  return true;
}

export function visibleFieldsForStep(
  def: QDefinition,
  stepTitle: string,
  answers: QuestionnaireAnswers
) {
  return def.fields.filter(
    (f) => f.step === stepTitle && isFieldVisible(f, answers, def)
  );
}

export function completionStats(
  def: QDefinition,
  answers: QuestionnaireAnswers
) {
  const visible = def.fields.filter((f) => isFieldVisible(f, answers, def));
  const required = visible.filter((f) => f.required && !f.auto);
  let filled = 0;
  for (const f of required) {
    const v = answers.values[f.id];
    if (v == null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    filled += 1;
  }
  return {
    required: required.length,
    filled,
    percent: required.length
      ? Math.round((filled / required.length) * 100)
      : 0,
  };
}

export const STEP_TITLE_LT: Record<string, string> = {
  "1. Basic Profile & Health Metrics": "1. Pagrindinis profilis ir sveikatos rodikliai",
  "2. Current & Past Medical Conditions": "2. Dabartinės ir buvusios ligos",
  "3. Allergies": "3. Alergijos",
  "4. Current Medications & Supplements": "4. Vaistai ir papildai",
  "5. Significant Medical Events & Symptoms": "5. Svarbūs įvykiai ir simptomai",
  "6. Female Health": "6. Moterų sveikata",
  "7. Lifestyle": "7. Gyvenimo būdas",
  "8. Environment & Social Support": "8. Aplinka ir socialinė parama",
  "9. Psychological & Emotional Health": "9. Psichologinė ir emocinė sveikata",
  "10. Family History": "10. Šeimos anamnezė",
};

export const SECTION_TITLE_LT: Record<string, string> = {
  "Family longevity": "Šeimos ilgaamžiškumas",
  "Family diseases": "Šeimos ligos",
  "Family Member Entry (repeatable)": "Šeimos narys (kartojama)",
};
