
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
const WOMEN_ANSWER_KEY = "women_hormone_questionnaire_v1";
const CURRENT_YEAR = () => new Date().getFullYear();

export type QuestionnaireKind = "general" | "women";

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

export function questionnaireStorageKey(kind: QuestionnaireKind = "general") {
  return kind === "women" ? WOMEN_ANSWER_KEY : ANSWER_KEY;
}

export function questionnaireLocalStoragePrefix(
  kind: QuestionnaireKind = "general"
) {
  // Bump suffix when demo seeds change so stale empty browser drafts are ignored.
  return kind === "women"
    ? "lyfora_women_questionnaire_v4:"
    : "lyfora_questionnaire_v4:";
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
    findFieldValue(
      answers,
      def,
      (f) =>
        f.label === "Height" ||
        f.label === "Ūgis" ||
        f.id === "w_height" ||
        f.id.endsWith("__height")
    )
  );
  const w = Number(
    findFieldValue(
      answers,
      def,
      (f) =>
        f.label === "Weight" ||
        f.label === "Svoris" ||
        f.id === "w_weight" ||
        f.id.endsWith("__weight")
    )
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
    (f) =>
      f.label === "Date of Birth" ||
      f.label === "Gimimo data" ||
      f.id === "w_birth_date" ||
      f.id.endsWith("__date_of_birth")
  );
  return typeof dob === "string" ? ageFromDob(dob) : null;
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string" && value) return [value];
  return [];
}

function numericAnswer(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const m = value.trim().match(/^-?\d+/);
    if (m) return Number(m[0]);
  }
  return null;
}

function splitTopLevel(expr: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && expr.startsWith(sep, i)) {
      parts.push(expr.slice(start, i).trim());
      i += sep.length - 1;
      start = i + 1;
    }
  }
  parts.push(expr.slice(start).trim());
  return parts.filter(Boolean);
}

function stripOuterParens(expr: string): string {
  let rule = expr.trim();
  while (rule.startsWith("(") && rule.endsWith(")")) {
    let depth = 0;
    let wrapsAll = true;
    for (let i = 0; i < rule.length; i++) {
      if (rule[i] === "(") depth += 1;
      else if (rule[i] === ")") {
        depth -= 1;
        if (depth === 0 && i !== rule.length - 1) {
          wrapsAll = false;
          break;
        }
      }
    }
    if (!wrapsAll) break;
    rule = rule.slice(1, -1).trim();
  }
  return rule;
}

function evalShowAtom(
  atom: string,
  answers: QuestionnaireAnswers,
  def: QDefinition
): boolean {
  const rule = stripOuterParens(atom);
  if (!rule || rule === "Visada" || rule === "always" || rule === "@always") {
    return true;
  }

  const orParts = splitTopLevel(rule, "||");
  if (orParts.length > 1) {
    return orParts.some((p) => evalShowAtom(p, answers, def));
  }
  const andParts = splitTopLevel(rule, "&&");
  if (andParts.length > 1) {
    return andParts.every((p) => evalShowAtom(p, answers, def));
  }

  if (!rule.startsWith("@")) return true;

  const age = computeAge(answers, def);
  if (rule.startsWith("@age_gte:")) {
    const n = Number(rule.slice(9));
    return age != null && age >= n;
  }
  if (rule.startsWith("@age_lt:")) {
    const n = Number(rule.slice(8));
    return age != null && age < n;
  }
  if (rule.startsWith("@bmi_lt:")) {
    const n = Number(rule.slice(8));
    const bmi = computeBmi(answers, def);
    return bmi != null && bmi < n;
  }
  if (rule.startsWith("@bmi_gte:")) {
    const n = Number(rule.slice(9));
    const bmi = computeBmi(answers, def);
    return bmi != null && bmi >= n;
  }
  if (rule.startsWith("@samanta_gte:")) {
    const n = Number(rule.slice(13));
    return samantaScore(answers) >= n;
  }
  if (rule.startsWith("@phq2_gte:")) {
    const n = Number(rule.slice(10));
    return phq2Score(answers) >= n;
  }
  if (rule.startsWith("@eq:")) {
    const rest = rule.slice(4);
    const colon = rest.indexOf(":");
    if (colon < 0) return true;
    const id = rest.slice(0, colon);
    const opts = rest.slice(colon + 1).split("|");
    const v = answers.values[id];
    return typeof v === "string" && opts.includes(v);
  }
  if (rule.startsWith("@not_eq:")) {
    const rest = rule.slice(8);
    const colon = rest.indexOf(":");
    if (colon < 0) return true;
    const id = rest.slice(0, colon);
    const opts = rest.slice(colon + 1).split("|");
    const v = answers.values[id];
    return !(typeof v === "string" && opts.includes(v));
  }
  if (rule.startsWith("@includes:")) {
    const rest = rule.slice(10);
    const colon = rest.indexOf(":");
    if (colon < 0) return true;
    const id = rest.slice(0, colon);
    const opts = rest.slice(colon + 1).split("|");
    const list = asStringList(answers.values[id]);
    return opts.some((o) => list.includes(o));
  }
  if (rule.startsWith("@not_includes:")) {
    const rest = rule.slice(14);
    const colon = rest.indexOf(":");
    if (colon < 0) return true;
    const id = rest.slice(0, colon);
    const opts = rest.slice(colon + 1).split("|");
    const list = asStringList(answers.values[id]);
    // If unanswered, treat as "does not include"
    if (list.length === 0) return true;
    return !opts.some((o) => list.includes(o));
  }
  if (rule.startsWith("@num_gte:")) {
    const rest = rule.slice(9);
    const colon = rest.indexOf(":");
    if (colon < 0) return true;
    const id = rest.slice(0, colon);
    const n = Number(rest.slice(colon + 1));
    const v = numericAnswer(answers.values[id]);
    return v != null && v >= n;
  }
  return true;
}

const SAMANTA_IDS = [
  "w_samanta_duration",
  "w_samanta_heavy_days",
  "w_samanta_change_day",
  "w_samanta_change_night",
  "w_samanta_clots",
  "w_samanta_cancel",
] as const;

export function samantaScore(answers: QuestionnaireAnswers) {
  let n = 0;
  for (const id of SAMANTA_IDS) {
    if (answers.values[id] === "Taip") n += 1;
  }
  return n;
}

const MRS_IDS = [
  "w_mrs_hot",
  "w_mrs_heart",
  "w_mrs_sleep",
  "w_mrs_depressed",
  "w_mrs_irritable",
  "w_mrs_anxiety",
  "w_mrs_exhaustion",
  "w_mrs_sexual",
  "w_mrs_bladder",
  "w_mrs_vaginal",
  "w_mrs_joints",
] as const;

export function mrsScore(answers: QuestionnaireAnswers) {
  let n = 0;
  for (const id of MRS_IDS) {
    const v = numericAnswer(answers.values[id]);
    if (v != null) n += v;
  }
  return n;
}

export function phq2Score(answers: QuestionnaireAnswers) {
  const a = numericAnswer(answers.values.w_phq2_interest) ?? 0;
  const b = numericAnswer(answers.values.w_phq2_depressed) ?? 0;
  return a + b;
}

/** Keep calculated women-questionnaire scores in sync. */
export function syncWomenDerivedScores(
  answers: QuestionnaireAnswers,
  def: QDefinition
): QuestionnaireAnswers {
  const next = { ...answers, values: { ...answers.values } };
  const ageField = def.fields.find((f) => f.id === "w_age");
  const bmiField = def.fields.find((f) => f.id === "w_bmi");
  const age = computeAge(next, def);
  const bmi = computeBmi(next, def);
  if (ageField) next.values[ageField.id] = age;
  if (bmiField) next.values[bmiField.id] = bmi;
  if (def.fields.some((f) => f.id === "w_samanta_score")) {
    next.values.w_samanta_score = samantaScore(next);
  }
  if (def.fields.some((f) => f.id === "w_mrs_score")) {
    next.values.w_mrs_score = mrsScore(next);
  }
  if (def.fields.some((f) => f.id === "w_phq2_score")) {
    next.values.w_phq2_score = phq2Score(next);
  }
  return next;
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
    // Female-only step in the general questionnaire only
    if (
      field.step.startsWith("6.") &&
      def.fields.some((f) => f.label === "Biological Sex")
    ) {
      return biologicalSex(answers, def) === "Female";
    }
    return true;
  }

  // Women hormone questionnaire DSL: @eq / @includes / && / || / (...)
  if (rule.startsWith("@") || rule.includes("&&") || rule.includes("||")) {
    return evalShowAtom(rule, answers, def);
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

  if (
    field.step.startsWith("6.") &&
    def.fields.some((f) => f.label === "Biological Sex")
  ) {
    return sex === "Female";
  }
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
  // Women hormone questionnaire (already LT titles — identity map)
  "1. Apie Jus": "1. Apie Jus",
  "2. Sveikatos istorija": "2. Sveikatos istorija",
  "3. Mėnesinių ciklas": "3. Mėnesinių ciklas",
  "4. Kraujavimo gausa": "4. Kraujavimo gausa",
  "5. Skausmas": "5. Skausmas",
  "6. Plaukai ir oda": "6. Plaukai ir oda",
  "7. Savijauta prieš mėnesines": "7. Savijauta prieš mėnesines",
  "8. Bendra savijauta": "8. Bendra savijauta",
  "9. Lytinė sveikata": "9. Lytinė sveikata",
  "10. Menopauzės simptomai": "10. Menopauzės simptomai",
  "11. Nuotaika": "11. Nuotaika",
  "12. Simptomų trukmė": "12. Simptomų trukmė",
};

export const SECTION_TITLE_LT: Record<string, string> = {
  "Family longevity": "Šeimos ilgaamžiškumas",
  "Family diseases": "Šeimos ligos",
  "Family Member Entry (repeatable)": "Šeimos narys (kartojama)",
};
