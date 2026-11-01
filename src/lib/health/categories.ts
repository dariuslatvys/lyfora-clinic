export type HealthCategoryId =
  | "cardiovascular"
  | "pharmacogenetics"
  | "metabolic"
  | "hormones_men"
  | "hormones_women"
  | "mental"
  | "immune"
  | "oncology";

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
  },
  {
    id: "pharmacogenetics",
    primaryKeys: ["Pharmacogenetics"],
    markerCategoryNames: ["Nutrient & Drug metabolism", "Nutrient & Drug Metabolism"],
  },
  {
    id: "metabolic",
    primaryKeys: ["Metabolic Health"],
    markerCategoryNames: ["Metabolic Health"],
  },
  {
    id: "hormones_men",
    primaryKeys: ["Hormones (men)", "Hormones (Men)"],
    markerCategoryNames: ["Hormonal Health", "Hormonal Health MEN"],
    sex: "male",
  },
  {
    id: "hormones_women",
    primaryKeys: ["Hormones (Women)", "Hormones (women)"],
    markerCategoryNames: ["Hormonal Health", "Hormonal Health WOMEN"],
    sex: "female",
  },
  {
    id: "mental",
    primaryKeys: ["Mental and Cognitive Health"],
    markerCategoryNames: [
      "Mental and Cognitive Health",
      "Mental & Cognitive Health",
    ],
  },
  {
    id: "immune",
    primaryKeys: ["Immune & Inflammation"],
    markerCategoryNames: ["Immune & Inflammation"],
  },
  {
    id: "oncology",
    primaryKeys: ["Oncology", "Cancer Risk", "Oncology / Cancer Risk"],
    markerCategoryNames: ["Oncology", "Cancer Risk"],
  },
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
