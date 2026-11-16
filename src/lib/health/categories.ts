export type HealthCategoryId =
  | "cardiovascular"
  | "pharmacogenetics"
  | "metabolic"
  | "hormones_men"
  | "hormones_women"
  | "mental"
  | "immune"
  | "oncology"
  /** Female overview: reproductive / gyn health (was hormones_women). */
  | "reproductive"
  /** Female overview: merged cardiovascular + metabolic. */
  | "cardio_metabolic"
  /** Female overview: bone / muscle / joint / functional. */
  | "physical";

export const HEALTH_CATEGORIES: {
  id: HealthCategoryId;
  primaryKeys: string[];
  markerCategoryNames: string[];
  sex?: "male" | "female";
}[] = [
  {
    id: "cardiovascular",
    primaryKeys: ["Cardiovascular Health"],
    markerCategoryNames: ["Cardiovascular Health"],
    sex: "male",
  },
  {
    id: "pharmacogenetics",
    primaryKeys: ["Pharmacogenetics"],
    markerCategoryNames: [
      "Nutrient & Drug metabolism",
      "Nutrient & Drug Metabolism",
    ],
  },
  {
    id: "metabolic",
    primaryKeys: ["Metabolic Health"],
    markerCategoryNames: ["Metabolic Health"],
    sex: "male",
  },
  {
    id: "hormones_men",
    primaryKeys: ["Hormones (men)", "Hormones (Men)"],
    markerCategoryNames: ["Hormonal Health", "Hormonal Health MEN"],
    sex: "male",
  },
  {
    id: "reproductive",
    primaryKeys: [
      "Hormones (Women)",
      "Hormones (women)",
      "Reproductive Health",
      "Reproductive & Gynecological Health",
    ],
    markerCategoryNames: ["Hormonal Health", "Hormonal Health WOMEN"],
    sex: "female",
  },
  {
    id: "cardio_metabolic",
    primaryKeys: [
      "Cardiovascular Health",
      "Metabolic Health",
      "Cardiovascular & Metabolic Health",
    ],
    markerCategoryNames: ["Cardiovascular Health", "Metabolic Health"],
    sex: "female",
  },
  {
    id: "physical",
    primaryKeys: [
      "Physical & Functional Health",
      "Bone & Joint Health",
      "Physical Health",
    ],
    markerCategoryNames: ["Physical & Functional Health"],
    sex: "female",
  },
  {
    id: "mental",
    primaryKeys: [
      "Mental and Cognitive Health",
      "Mental Health & Whole-Person Care",
    ],
    markerCategoryNames: [
      "Mental and Cognitive Health",
      "Mental & Cognitive Health",
    ],
  },
  {
    id: "immune",
    primaryKeys: ["Immune & Inflammation"],
    markerCategoryNames: ["Immune & Inflammation"],
    // Dropped from female first-ring overview; keep for male.
    sex: "male",
  },
  {
    id: "oncology",
    primaryKeys: [
      "Oncology",
      "Cancer Risk",
      "Oncology / Cancer Risk",
      "Cancer Screenings & Prevention",
    ],
    markerCategoryNames: ["Oncology", "Cancer Risk"],
  },
];

/** Display order for female overview mosaic. */
export const FEMALE_OVERVIEW_ORDER: HealthCategoryId[] = [
  "reproductive",
  "oncology",
  "cardio_metabolic",
  "physical",
  "mental",
  "pharmacogenetics",
];

export function categoriesForSex(sex: "male" | "female") {
  return HEALTH_CATEGORIES.filter((c) => !c.sex || c.sex === sex);
}

export function matchPrimaryCategory(
  primary: string,
  category: (typeof HEALTH_CATEGORIES)[number]
) {
  return category.primaryKeys.some(
    (k) => k.toLowerCase() === primary.toLowerCase()
  );
}

/** Family-history / rare-gene ids that should elevate a category. */
export function categorySignalAliases(categoryId: string): string[] {
  switch (categoryId) {
    case "cardio_metabolic":
      return ["cardio_metabolic", "cardiovascular", "metabolic"];
    case "reproductive":
      return ["reproductive", "hormones_women", "hormones_men"];
    case "cardiovascular":
      return ["cardiovascular", "cardio_metabolic"];
    case "metabolic":
      return ["metabolic", "cardio_metabolic"];
    case "hormones_women":
      return ["hormones_women", "reproductive"];
    default:
      return [categoryId];
  }
}

/** Resolve legacy category URLs to the patient's active category id. */
export function resolveCategoryId(
  requested: string,
  sex: "male" | "female"
): string {
  if (sex === "female") {
    if (requested === "hormones_women") return "reproductive";
    if (requested === "cardiovascular" || requested === "metabolic") {
      return "cardio_metabolic";
    }
  }
  if (sex === "male" && requested === "reproductive") return "hormones_men";
  if (sex === "male" && requested === "cardio_metabolic") return "cardiovascular";
  return requested;
}
