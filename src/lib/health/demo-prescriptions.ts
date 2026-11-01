/**
 * Demo e-prescriptions modelled on ESPBI EREC01 style,
 * with invented clinics and clinicians (no real patient identifiers).
 */

export type RxStatus = "active" | "expired" | "dispensed" | "cancelled";

export type DemoPrescription = {
  id: string;
  /** Fake e-prescription number */
  number: string;
  /** ISO date issued */
  issuedAt: string;
  /** ISO date valid from */
  validFrom: string;
  /** ISO date valid until */
  validTo: string;
  status: RxStatus;
  compensated: boolean;
  compensationNoteLt: string;
  compensationNoteEn: string;
  psychotropic?: boolean;
  diagnosisCode: string;
  diagnosisLt: string;
  diagnosisEn: string;
  substanceLt: string;
  substanceEn: string;
  atc: string;
  inn: string;
  strength: string;
  formLt: string;
  formEn: string;
  packageQty: string;
  /** D.S. directions */
  directionsLt: string;
  directionsEn: string;
  daysSupply: number;
  doctorLt: string;
  doctorEn: string;
  specialtyLt: string;
  specialtyEn: string;
  stampNo: string;
  clinicLt: string;
  clinicEn: string;
  clinicAddressLt: string;
  clinicAddressEn: string;
  visitId?: string;
  patientNoteLt?: string;
  patientNoteEn?: string;
  pharmacyNoteLt?: string;
  pharmacyNoteEn?: string;
};

export const DEMO_PRESCRIPTIONS: DemoPrescription[] = [
  {
    id: "rx-telmisartan-2026-04",
    number: "10819459684",
    issuedAt: "2026-04-03",
    validFrom: "2026-04-03",
    validTo: "2026-05-02",
    status: "expired",
    compensated: true,
    compensationNoteLt: "3 Liga pagal sąrašą 100 %",
    compensationNoteEn: "List disease 100 %",
    diagnosisCode: "I11.9",
    diagnosisLt: "Hipertenzinė širdies liga be širdies nepakankamumo (stazinio)",
    diagnosisEn: "Hypertensive heart disease without (congestive) heart failure",
    substanceLt: "Telmisartanas",
    substanceEn: "Telmisartan",
    atc: "C09CA07",
    inn: "Telmisartan",
    strength: "40 mg",
    formLt: "tabletės",
    formEn: "tablets",
    packageQty: "90 tab.",
    directionsLt: "vartoti per burną, 1 tab. × 1 k./d., vakare",
    directionsEn: "by mouth, 1 tab. × once daily, evening",
    daysSupply: 90,
    doctorLt: "Dr. Miglė Vaitkevičienė",
    doctorEn: "Dr. Migle Vaitkeviciene",
    specialtyLt: "Šeimos gydytojas",
    specialtyEn: "Family doctor",
    stampNo: "27401",
    clinicLt: "UAB „Žalioji šeimos klinika“",
    clinicEn: "Green Family Clinic, UAB",
    clinicAddressLt: "Kalvarijų g. 125, Vilnius",
    clinicAddressEn: "Kalvarijų g. 125, Vilnius",
    visitId: "v-2026-04-14",
  },
  {
    id: "rx-telmisartan-2026-10",
    number: "11890244117",
    issuedAt: "2026-10-01",
    validFrom: "2026-10-01",
    validTo: "2026-10-30",
    status: "active",
    compensated: true,
    compensationNoteLt: "3 Liga pagal sąrašą 100 %",
    compensationNoteEn: "List disease 100 %",
    diagnosisCode: "I11.9",
    diagnosisLt: "Hipertenzinė širdies liga be širdies nepakankamumo (stazinio)",
    diagnosisEn: "Hypertensive heart disease without (congestive) heart failure",
    substanceLt: "Telmisartanas",
    substanceEn: "Telmisartan",
    atc: "C09CA07",
    inn: "Telmisartan",
    strength: "40 mg",
    formLt: "tabletės",
    formEn: "tablets",
    packageQty: "90 tab.",
    directionsLt: "vartoti per burną, 1 tab. × 1 k./d., vakare",
    directionsEn: "by mouth, 1 tab. × once daily, evening",
    daysSupply: 90,
    doctorLt: "Dr. Miglė Vaitkevičienė",
    doctorEn: "Dr. Migle Vaitkeviciene",
    specialtyLt: "Šeimos gydytojas",
    specialtyEn: "Family doctor",
    stampNo: "27401",
    clinicLt: "UAB „Žalioji šeimos klinika“",
    clinicEn: "Green Family Clinic, UAB",
    clinicAddressLt: "Kalvarijų g. 125, Vilnius",
    clinicAddressEn: "Kalvarijų g. 125, Vilnius",
    visitId: "v-2026-09-22",
    patientNoteLt: "Pratęstas Tezeo / telmisartano kursas po AKS kontrolės.",
    patientNoteEn: "Renewed Tezeo / telmisartan course after BP review.",
  },
  {
    id: "rx-rosuvastatin-2026-09",
    number: "11667900371",
    issuedAt: "2026-09-29",
    validFrom: "2026-09-29",
    validTo: "2026-10-28",
    status: "active",
    compensated: true,
    compensationNoteLt: "3 Liga pagal sąrašą 100 %",
    compensationNoteEn: "List disease 100 %",
    diagnosisCode: "E78.2",
    diagnosisLt: "Mišri hiperlipidemija",
    diagnosisEn: "Mixed hyperlipidaemia",
    substanceLt: "Rozuvastatinas",
    substanceEn: "Rosuvastatin",
    atc: "C10AA07",
    inn: "Rosuvastatin",
    strength: "5 mg",
    formLt: "plėvele dengtos tabletės",
    formEn: "film-coated tablets",
    packageQty: "90 tab.",
    directionsLt: "vartoti per burną, 1 tab. × 1 k./d., vakare",
    directionsEn: "by mouth, 1 tab. × once daily, evening",
    daysSupply: 90,
    doctorLt: "Dr. Paulius Rimkevičius",
    doctorEn: "Dr. Paulius Rimkevicius",
    specialtyLt: "Šeimos gydytojas",
    specialtyEn: "Family doctor",
    stampNo: "30112",
    clinicLt: "VšĮ „Neries sveikatos centras“",
    clinicEn: "Neris Health Centre",
    clinicAddressLt: "Ozo g. 18, Vilnius",
    clinicAddressEn: "Ozo g. 18, Vilnius",
    visitId: "v-2025-12-08",
    patientNoteLt: "Roswera 5 mg — lipidų kontrolė pagal prevencijos planą.",
    patientNoteEn: "Roswera 5 mg — lipid control per prevention plan.",
  },
  {
    id: "rx-zolpidem-2026-09",
    number: "11667896586",
    issuedAt: "2026-09-29",
    validFrom: "2026-09-29",
    validTo: "2026-10-28",
    status: "dispensed",
    compensated: false,
    compensationNoteLt: "Nekompensuojama",
    compensationNoteEn: "Not reimbursed",
    psychotropic: true,
    diagnosisCode: "G47.0",
    diagnosisLt: "Užmigimo sutrikimai ir nemiga [insomnija]",
    diagnosisEn: "Disorders of initiating and maintaining sleep [insomnias]",
    substanceLt: "Zolpidemo tartratas",
    substanceEn: "Zolpidem tartrate",
    atc: "N05CF02",
    inn: "Zolpidem",
    strength: "10 mg",
    formLt: "plėvele dengtos tabletės",
    formEn: "film-coated tablets",
    packageQty: "30 tab.",
    directionsLt: "vartoti per burną, 1 tab. × 1 k./d., vakare (tik trumpam kursui)",
    directionsEn: "by mouth, 1 tab. × once daily, evening (short course only)",
    daysSupply: 30,
    doctorLt: "Dr. Paulius Rimkevičius",
    doctorEn: "Dr. Paulius Rimkevicius",
    specialtyLt: "Šeimos gydytojas",
    specialtyEn: "Family doctor",
    stampNo: "30112",
    clinicLt: "VšĮ „Neries sveikatos centras“",
    clinicEn: "Neris Health Centre",
    clinicAddressLt: "Ozo g. 18, Vilnius",
    clinicAddressEn: "Ozo g. 18, Vilnius",
    visitId: "v-2025-12-08",
    pharmacyNoteLt: "Psichotropinis vaistas — išduotas vaistinėje su tapatybės patikra.",
    pharmacyNoteEn: "Psychotropic — dispensed with ID check at pharmacy.",
  },
  {
    id: "rx-azelastine-2025-12",
    number: "10206500499",
    issuedAt: "2025-12-03",
    validFrom: "2025-12-03",
    validTo: "2026-01-01",
    status: "expired",
    compensated: false,
    compensationNoteLt: "Nekompensuojama",
    compensationNoteEn: "Not reimbursed",
    diagnosisCode: "U07.2",
    diagnosisLt: "COVID-19 liga, virusas nenustatytas",
    diagnosisEn: "COVID-19, virus not identified",
    substanceLt: "Azelastino hidrochloridas / Flutikazono propionatas",
    substanceEn: "Azelastine hydrochloride / Fluticasone propionate",
    atc: "R01AD58",
    inn: "Fluticasone, combinations",
    strength: "137 µg / 50 µg dozėje",
    formLt: "nosies purškalas (suspensija)",
    formEn: "nasal spray (suspension)",
    packageQty: "1 pak.",
    directionsLt: "vartoti į nosį, 1 doz. × 3 k./d. (ryte, per pietus, vakare)",
    directionsEn: "intranasal, 1 spray × 3×/day (morning, noon, evening)",
    daysSupply: 15,
    doctorLt: "Dr. Evelina Markevičiūtė",
    doctorEn: "Dr. Evelina Markeviciute",
    specialtyLt: "Šeimos gydytojas",
    specialtyEn: "Family doctor",
    stampNo: "25880",
    clinicLt: "UAB „Baltijos šeimos medicina“",
    clinicEn: "Baltic Family Medicine, UAB",
    clinicAddressLt: "Savanorių pr. 176, Vilnius",
    clinicAddressEn: "Savanorių pr. 176, Vilnius",
    visitId: "v-2026-02-26",
    patientNoteLt: "Nosies purškalas po viršutinių kvėpavimo takų simptomų.",
    patientNoteEn: "Nasal spray after upper-airway symptoms.",
  },
  {
    id: "rx-omeprazole-2025-08",
    number: "10944122803",
    issuedAt: "2025-08-07",
    validFrom: "2025-08-07",
    validTo: "2025-09-05",
    status: "expired",
    compensated: false,
    compensationNoteLt: "Nekompensuojama",
    compensationNoteEn: "Not reimbursed",
    diagnosisCode: "K29.7",
    diagnosisLt: "Gastritas, nepatikslintas",
    diagnosisEn: "Gastritis, unspecified",
    substanceLt: "Omeprazolas",
    substanceEn: "Omeprazole",
    atc: "A02BC01",
    inn: "Omeprazole",
    strength: "20 mg",
    formLt: "žarnyne tirpstančios kapsulės",
    formEn: "gastro-resistant capsules",
    packageQty: "28 kaps.",
    directionsLt: "vartoti per burną, 1 kaps. × 1 k./d., ryte nevalgius",
    directionsEn: "by mouth, 1 cap. × once daily, morning on empty stomach",
    daysSupply: 28,
    doctorLt: "Dr. Laura Šimkutė",
    doctorEn: "Dr. Laura Simkute",
    specialtyLt: "Gastroenterologas",
    specialtyEn: "Gastroenterologist",
    stampNo: "33420",
    clinicLt: "Lyfora Endoskopijos kabinetas",
    clinicEn: "Lyfora Endoscopy Suite",
    clinicAddressLt: "Jogailos g. 4, Vilnius",
    clinicAddressEn: "Jogailos g. 4, Vilnius",
    visitId: "v-2025-08-07",
    patientNoteLt: "PPI kursas po EGD (antralinis erozinis gastritas).",
    patientNoteEn: "PPI course after EGD (antral erosive gastritis).",
  },
  {
    id: "rx-ibuprofen-2026-10",
    number: "11900388214",
    issuedAt: "2026-10-15",
    validFrom: "2026-10-15",
    validTo: "2026-11-13",
    status: "active",
    compensated: false,
    compensationNoteLt: "Nekompensuojama",
    compensationNoteEn: "Not reimbursed",
    diagnosisCode: "M54.12",
    diagnosisLt: "Radikulopatija, kaklo sritis",
    diagnosisEn: "Radiculopathy, cervical region",
    substanceLt: "Ibuprofenas",
    substanceEn: "Ibuprofen",
    atc: "M01AE01",
    inn: "Ibuprofen",
    strength: "400 mg",
    formLt: "plėvele dengtos tabletės",
    formEn: "film-coated tablets",
    packageQty: "30 tab.",
    directionsLt: "vartoti per burną, 1 tab. × 2–3 k./d. po valgio, ne ilgiau kaip 7 d.",
    directionsEn: "by mouth, 1 tab. × 2–3×/day after food, max 7 days",
    daysSupply: 7,
    doctorLt: "Dr. Justinas Aleknavičius",
    doctorEn: "Dr. Justinas Aleknavicius",
    specialtyLt: "Ortopedas traumatologas",
    specialtyEn: "Orthopaedic traumatologist",
    stampNo: "34991",
    clinicLt: "UAB „Gedimino judėjimo klinika“",
    clinicEn: "Gediminas Motion Clinic, UAB",
    clinicAddressLt: "Pylimo g. 22, Vilnius",
    clinicAddressEn: "Pylimo g. 22, Vilnius",
    visitId: "v-2026-10-15",
    patientNoteLt: "Simptominis skausmo malšinimas iki neurologo konsultacijos.",
    patientNoteEn: "Symptom relief until neurology consult.",
  },
  {
    id: "rx-vitamin-d-2026-01",
    number: "11255677190",
    issuedAt: "2026-01-14",
    validFrom: "2026-01-14",
    validTo: "2026-02-12",
    status: "expired",
    compensated: false,
    compensationNoteLt: "Nekompensuojama",
    compensationNoteEn: "Not reimbursed",
    diagnosisCode: "E55.9",
    diagnosisLt: "Vitamino D stoka, nepatikslinta",
    diagnosisEn: "Vitamin D deficiency, unspecified",
    substanceLt: "Cholekalciferolis (vitaminas D3)",
    substanceEn: "Cholecalciferol (vitamin D3)",
    atc: "A11CC05",
    inn: "Colecalciferol",
    strength: "2000 TV",
    formLt: "minkštosios kapsulės",
    formEn: "soft capsules",
    packageQty: "60 kaps.",
    directionsLt: "vartoti per burną, 1 kaps. × 1 k./d. su maistu",
    directionsEn: "by mouth, 1 cap. × once daily with food",
    daysSupply: 60,
    doctorLt: "Dr. Miglė Vaitkevičienė",
    doctorEn: "Dr. Migle Vaitkeviciene",
    specialtyLt: "Šeimos gydytojas",
    specialtyEn: "Family doctor",
    stampNo: "27401",
    clinicLt: "UAB „Žalioji šeimos klinika“",
    clinicEn: "Green Family Clinic, UAB",
    clinicAddressLt: "Kalvarijų g. 125, Vilnius",
    clinicAddressEn: "Kalvarijų g. 125, Vilnius",
    visitId: "v-2025-12-16",
  },
];

export function allPrescriptions() {
  return [...DEMO_PRESCRIPTIONS].sort((a, b) =>
    b.issuedAt.localeCompare(a.issuedAt)
  );
}

export function activePrescriptions() {
  return allPrescriptions().filter((r) => r.status === "active");
}

export function historicalPrescriptions() {
  return allPrescriptions().filter((r) => r.status !== "active");
}

/** Prescriptions issued from / linked to a visit (reverse of visitId). */
export function prescriptionsForVisit(visitId: string) {
  return allPrescriptions().filter((r) => r.visitId === visitId);
}

export function getPrescription(id: string) {
  return DEMO_PRESCRIPTIONS.find((r) => r.id === id) || null;
}

export function rxStatusLabel(status: RxStatus, locale: "lt" | "en") {
  const map: Record<RxStatus, { lt: string; en: string }> = {
    active: { lt: "Aktyvus", en: "Active" },
    expired: { lt: "Pasibaigęs", en: "Expired" },
    dispensed: { lt: "Išduotas", en: "Dispensed" },
    cancelled: { lt: "Atšauktas", en: "Cancelled" },
  };
  return locale === "en" ? map[status].en : map[status].lt;
}
