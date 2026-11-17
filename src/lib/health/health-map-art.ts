/** Illustrated tile art for the overview health-map mosaic. */

export type HealthMapArt = {
  src: string;
  altLt: string;
  altEn: string;
};

export const FEMALE_HEALTH_MAP_ART: Record<string, HealthMapArt> = {
  reproductive: {
    src: "/brand/categories/reproductive.jpg",
    altLt: "Moters sveikata ir gyvybiniai etapai",
    altEn: "Women’s health and life stages",
  },
  oncology: {
    src: "/brand/categories/oncology.jpg",
    altLt: "Vėžio prevencija",
    altEn: "Cancer prevention",
  },
  cardio_metabolic: {
    src: "/brand/categories/cardio_metabolic.jpg",
    altLt: "Širdies, kraujagyslių ir metabolinė sveikata",
    altEn: "Heart, vessels and metabolic health",
  },
  physical: {
    src: "/brand/categories/physical.jpg",
    altLt: "Fizinė sveikata",
    altEn: "Physical health",
  },
  mental: {
    src: "/brand/categories/mental.jpg",
    altLt: "Psichikos ir emocinė sveikata",
    altEn: "Mental and emotional health",
  },
  pharmacogenetics: {
    src: "/brand/categories/pharmacogenetics.jpg",
    altLt: "Farmakogenetika",
    altEn: "Pharmacogenetics",
  },
};

export const MALE_HEALTH_MAP_ART: Record<string, HealthMapArt> = {
  cardiovascular: {
    src: "/brand/categories/cardiovascular-botanical.jpg",
    altLt: "Širdies ir kraujagyslių sveikata",
    altEn: "Heart and vessel health",
  },
  metabolic: {
    src: "/brand/categories/metabolic-botanical.jpg",
    altLt: "Metabolinė sveikata",
    altEn: "Metabolic health",
  },
  hormones_men: {
    src: "/brand/categories/hormones_men-botanical.jpg",
    altLt: "Vyrų hormonų sveikata",
    altEn: "Men’s hormone health",
  },
  immune: {
    src: "/brand/categories/immune-botanical.jpg",
    altLt: "Imuninė sveikata",
    altEn: "Immune health",
  },
  mental: {
    src: "/brand/categories/mental_men-botanical.jpg",
    altLt: "Psichikos ir emocinė sveikata",
    altEn: "Mental and emotional health",
  },
  oncology: {
    src: "/brand/categories/oncology_men-botanical.jpg",
    altLt: "Vėžio prevencija",
    altEn: "Cancer prevention",
  },
  pharmacogenetics: {
    src: "/brand/categories/pharmacogenetics_men-botanical.jpg",
    altLt: "Farmakogenetika",
    altEn: "Pharmacogenetics",
  },
};
