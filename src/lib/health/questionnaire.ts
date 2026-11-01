
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

export type FamilyMember = {
  id: string;
  relative: string;
  conditions: string[];
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


export function emptyAnswers(): QuestionnaireAnswers {
  return {
    updatedAt: null,
    values: {},
    conditionDetails: {},
    familyMembers: [],
    cancer: { types: [], treatment: [] },
  };
}

export function parseStoredAnswers(raw: string | null | undefined): QuestionnaireAnswers {
  if (!raw) return emptyAnswers();
  try {
    const data = JSON.parse(raw) as QuestionnaireAnswers;
    return {
      ...emptyAnswers(),
      ...data,
      values: data.values || {},
      conditionDetails: data.conditionDetails || {},
      familyMembers: data.familyMembers || [],
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
};

export const OPTION_LABEL_LT: Record<string, string> = {
  Male: "Vyras",
  Female: "Moteris",
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
  // Repeatable meta-fields are rendered inside special UI blocks
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
