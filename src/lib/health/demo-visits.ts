export type VisitStatus = "past" | "upcoming";

export type DemoVisit = {
  id: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  time: string;
  titleLt: string;
  titleEn: string;
  doctorLt: string;
  doctorEn: string;
  specialtyLt: string;
  specialtyEn: string;
  placeLt: string;
  placeEn: string;
  status: VisitStatus;
  /** Lab / panel dates this visit follows up on */
  relatedLabDates?: string[];
  notesLt: string;
  notesEn: string;
};

/**
 * Demo visits for Jonas — past ones aligned with uploaded lab dates,
 * plus always-visible upcoming appointments.
 */
export const DEMO_VISITS: DemoVisit[] = [
  {
    id: "v-2023-12-05",
    date: "2023-12-05",
    time: "09:15",
    titleLt: "Šeimos gydytojo konsultacija",
    titleEn: "Family doctor consultation",
    doctorLt: "Dr. Rūta Petrauskienė",
    doctorEn: "Dr. Ruta Petrauskienė",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    placeLt: "Lyfora klinika, Vilnius",
    placeEn: "Lyfora Clinic, Vilnius",
    status: "past",
    relatedLabDates: ["2023-12-01"],
    notesLt:
      "Aptarti pirmieji kraujo tyrimai (2023-12-01). Rekomenduota lipidų kontrolė ir gyvenimo būdo korekcijos.",
    notesEn:
      "Reviewed first blood panel (2023-12-01). Advised lipid follow-up and lifestyle changes.",
  },
  {
    id: "v-2024-05-14",
    date: "2024-05-14",
    time: "11:00",
    titleLt: "Kardiologo konsultacija",
    titleEn: "Cardiology consultation",
    doctorLt: "Dr. Andrius Kazlauskas",
    doctorEn: "Dr. Andrius Kazlauskas",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    placeLt: "Lyfora Heart Center",
    placeEn: "Lyfora Heart Center",
    status: "past",
    relatedLabDates: ["2024-05-07"],
    notesLt:
      "Po 2024-05-07 lipidų / ApoB rezultatų. Aptarta MTL rizika ir statinų farmakogenetika.",
    notesEn:
      "After 2024-05-07 lipid / ApoB results. Discussed LDL risk and statin pharmacogenetics.",
  },
  {
    id: "v-2024-09-03",
    date: "2024-09-03",
    time: "14:30",
    titleLt: "Endokrinologo konsultacija",
    titleEn: "Endocrinology consultation",
    doctorLt: "Dr. Inga Žukauskaitė",
    doctorEn: "Dr. Inga Žukauskaitė",
    specialtyLt: "Endokrinologija",
    specialtyEn: "Endocrinology",
    placeLt: "Lyfora klinika, Vilnius",
    placeEn: "Lyfora Clinic, Vilnius",
    status: "past",
    relatedLabDates: ["2024-08-29"],
    notesLt:
      "Kortizolio ir hormonų panelė (2024-08-29). Stebėti antinksčių ašį ir miego higieną.",
    notesEn:
      "Cortisol and hormone panel (2024-08-29). Monitor adrenal axis and sleep hygiene.",
  },
  {
    id: "v-2025-06-25",
    date: "2025-06-25",
    time: "10:00",
    titleLt: "Metabolinės sveikatos konsultacija",
    titleEn: "Metabolic health consultation",
    doctorLt: "Dr. Tomas Jankauskas",
    doctorEn: "Dr. Tomas Jankauskas",
    specialtyLt: "Vidaus ligos",
    specialtyEn: "Internal medicine",
    placeLt: "Lyfora Care Hub",
    placeEn: "Lyfora Care Hub",
    status: "past",
    relatedLabDates: ["2025-06-18"],
    notesLt:
      "Glikemijos ir metabolinių žymenų peržiūra po 2025-06-18 tyrimų.",
    notesEn: "Glucose and metabolic markers reviewed after 2025-06-18 labs.",
  },
  {
    id: "v-2025-12-16",
    date: "2025-12-16",
    time: "13:20",
    titleLt: "Genetiko konsultacija (NGS)",
    titleEn: "Clinical genetics (NGS) consult",
    doctorLt: "Dr. Eglė Navickaitė",
    doctorEn: "Dr. Eglė Navickaitė",
    specialtyLt: "Medicininė genetika",
    specialtyEn: "Clinical genetics",
    placeLt: "Lyfora Genetics Lab",
    placeEn: "Lyfora Genetics Lab",
    status: "past",
    relatedLabDates: ["2025-12-08"],
    notesLt:
      "Aptarta MYBPC3 / NGS radiniai ir šeimos anamnezė. Rekomenduota kardiogenetikos kontrolė.",
    notesEn:
      "Reviewed MYBPC3 / NGS findings and family history. Cardiology–genetics follow-up advised.",
  },
  {
    id: "v-2026-02-26",
    date: "2026-02-26",
    time: "09:45",
    titleLt: "Imunologo konsultacija",
    titleEn: "Immunology consultation",
    doctorLt: "Dr. Paulius Balčiūnas",
    doctorEn: "Dr. Paulius Balčiūnas",
    specialtyLt: "Imunologija",
    specialtyEn: "Immunology",
    placeLt: "Lyfora klinika, Vilnius",
    placeEn: "Lyfora Clinic, Vilnius",
    status: "past",
    relatedLabDates: ["2026-02-19"],
    notesLt:
      "Uždegimo žymenys ir infekcijų panelė po 2026-02-19 tyrimų.",
    notesEn: "Inflammation and infection panel after 2026-02-19 labs.",
  },
  {
    id: "v-2026-04-14",
    date: "2026-04-14",
    time: "16:00",
    titleLt: "Kardiologo kontrolė",
    titleEn: "Cardiology follow-up",
    doctorLt: "Dr. Andrius Kazlauskas",
    doctorEn: "Dr. Andrius Kazlauskas",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    placeLt: "Lyfora Heart Center",
    placeEn: "Lyfora Heart Center",
    status: "past",
    relatedLabDates: ["2026-04-03", "2026-04-10"],
    notesLt:
      "Pakartotiniai lipidų / kreatinino rezultatai (2026-04). Koreguotas stebėjimo planas.",
    notesEn:
      "Repeat lipid / creatinine results (Apr 2026). Monitoring plan adjusted.",
  },
  {
    id: "v-2026-05-12",
    date: "2026-05-12",
    time: "11:30",
    titleLt: "Onkologo konziliumas",
    titleEn: "Oncology case review",
    doctorLt: "Dr. Monika Savickaitė",
    doctorEn: "Dr. Monika Savickaitė",
    specialtyLt: "Onkologija",
    specialtyEn: "Oncology",
    placeLt: "Lyfora Oncology Desk",
    placeEn: "Lyfora Oncology Desk",
    status: "past",
    relatedLabDates: ["2026-05-01"],
    notesLt:
      "PSA ir rizikos signalų aptarimas. Kol kas stebėjimas, be intervencijos.",
    notesEn:
      "PSA and risk signals reviewed. Watchful waiting for now, no intervention.",
  },
  {
    id: "v-2026-06-10",
    date: "2026-06-10",
    time: "10:15",
    titleLt: "Farmakogenetikos aptarimas",
    titleEn: "Pharmacogenetics review",
    doctorLt: "Dr. Jonas Meška",
    doctorEn: "Dr. Jonas Meska",
    specialtyLt: "Klinikinė farmakologija",
    specialtyEn: "Clinical pharmacology",
    placeLt: "Lyfora Care Hub (nuotolinė)",
    placeEn: "Lyfora Care Hub (remote)",
    status: "past",
    relatedLabDates: ["2026-05-25", "2026-06-03"],
    notesLt:
      "SLCO1B1 / DPYD ir kitų SNP poveikis vaistams. Atnaujinta vaistų kortelė.",
    notesEn:
      "SLCO1B1 / DPYD and other SNP drug effects. Medication card updated.",
  },
  {
    id: "v-2026-09-22",
    date: "2026-09-22",
    time: "15:00",
    titleLt: "Šeimos gydytojo metinė apžiūra",
    titleEn: "Annual family-doctor review",
    doctorLt: "Dr. Rūta Petrauskienė",
    doctorEn: "Dr. Ruta Petrauskienė",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    placeLt: "Lyfora klinika, Vilnius",
    placeEn: "Lyfora Clinic, Vilnius",
    status: "past",
    relatedLabDates: ["2026-09-15"],
    notesLt:
      "Metinė peržiūra pagal 2026-09-15 tyrimus. Suderinti tolesni vizitai.",
    notesEn:
      "Annual review based on 2026-09-15 labs. Follow-up visits scheduled.",
  },
  // Upcoming — always show planned visits ahead
  {
    id: "v-2026-11-12",
    date: "2026-11-12",
    time: "10:30",
    titleLt: "Kardiologo kontrolė",
    titleEn: "Cardiology follow-up",
    doctorLt: "Dr. Andrius Kazlauskas",
    doctorEn: "Dr. Andrius Kazlauskas",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    placeLt: "Lyfora Heart Center",
    placeEn: "Lyfora Heart Center",
    status: "upcoming",
    notesLt:
      "Kontrolė po lipidų ir MYBPC3 radinių. Atsinešti naujausius tyrimus.",
    notesEn:
      "Follow-up after lipids and MYBPC3 findings. Bring latest labs.",
  },
  {
    id: "v-2026-11-28",
    date: "2026-11-28",
    time: "13:00",
    titleLt: "Genetiko pakartotinė konsultacija",
    titleEn: "Genetics follow-up",
    doctorLt: "Dr. Eglė Navickaitė",
    doctorEn: "Dr. Eglė Navickaitė",
    specialtyLt: "Medicininė genetika",
    specialtyEn: "Clinical genetics",
    placeLt: "Lyfora Genetics Lab (nuotolinė)",
    placeEn: "Lyfora Genetics Lab (remote)",
    status: "upcoming",
    notesLt: "Šeimos narių testavimo plano aptarimas.",
    notesEn: "Discuss family-member testing plan.",
  },
  {
    id: "v-2026-12-09",
    date: "2026-12-09",
    time: "09:00",
    titleLt: "Endokrinologo kontrolė",
    titleEn: "Endocrinology follow-up",
    doctorLt: "Dr. Inga Žukauskaitė",
    doctorEn: "Dr. Inga Žukauskaitė",
    specialtyLt: "Endokrinologija",
    specialtyEn: "Endocrinology",
    placeLt: "Lyfora klinika, Vilnius",
    placeEn: "Lyfora Clinic, Vilnius",
    status: "upcoming",
    notesLt: "Kortizolio / hormonų dinamikos peržiūra.",
    notesEn: "Review cortisol / hormone trends.",
  },
  {
    id: "v-2027-01-20",
    date: "2027-01-20",
    time: "11:45",
    titleLt: "Metabolinės sveikatos vizitas",
    titleEn: "Metabolic health visit",
    doctorLt: "Dr. Tomas Jankauskas",
    doctorEn: "Dr. Tomas Jankauskas",
    specialtyLt: "Vidaus ligos",
    specialtyEn: "Internal medicine",
    placeLt: "Lyfora Care Hub",
    placeEn: "Lyfora Care Hub",
    status: "upcoming",
    notesLt: "Tikslai: MTL, žingsniai, miegas — ketvirčio peržiūra.",
    notesEn: "Goals: LDL, steps, sleep — quarterly review.",
  },
];

export function getVisit(id: string) {
  return DEMO_VISITS.find((v) => v.id === id) || null;
}

export function upcomingVisits(limit?: number) {
  const list = DEMO_VISITS.filter((v) => v.status === "upcoming").sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return limit ? list.slice(0, limit) : list;
}

export function pastVisits() {
  return DEMO_VISITS.filter((v) => v.status === "past").sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function formatVisitWhen(
  visit: DemoVisit,
  locale: "lt" | "en"
) {
  const d = new Date(`${visit.date}T12:00:00`);
  const date = d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${date} · ${visit.time}`;
}

export function visitTitle(visit: DemoVisit, locale: "lt" | "en") {
  return locale === "en" ? visit.titleEn : visit.titleLt;
}

export function visitDoctor(visit: DemoVisit, locale: "lt" | "en") {
  return locale === "en" ? visit.doctorEn : visit.doctorLt;
}

export function visitSpecialty(visit: DemoVisit, locale: "lt" | "en") {
  return locale === "en" ? visit.specialtyEn : visit.specialtyLt;
}

export function visitPlace(visit: DemoVisit, locale: "lt" | "en") {
  return locale === "en" ? visit.placeEn : visit.placeLt;
}

export function visitNotes(visit: DemoVisit, locale: "lt" | "en") {
  return locale === "en" ? visit.notesEn : visit.notesLt;
}
