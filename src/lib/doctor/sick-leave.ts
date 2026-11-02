import { addCalendarDays, todayIsoDate } from "@/lib/health/demo-visits";

export type SickLeaveStatus = "active" | "ending_soon" | "ended";

export type SickLeaveCertificate = {
  id: string;
  patientId: string;
  patientNameLt: string;
  patientNameEn: string;
  diagnosisLt: string;
  diagnosisEn: string;
  diagnosisCode: string;
  from: string;
  to: string;
  issuedAt: string;
  doctorLt: string;
  doctorEn: string;
  workplaceLt: string;
  workplaceEn: string;
  noteLt?: string;
  noteEn?: string;
};

function today() {
  return todayIsoDate();
}

/** Demo sick-leave certificates anchored to “today”. */
export function demoSickLeaves(): SickLeaveCertificate[] {
  const t = today();
  return [
    {
      id: "sl-today-1",
      patientId: "patient_male",
      patientNameLt: "Jonas Jonaitis",
      patientNameEn: "John Doe",
      diagnosisCode: "J06.9",
      diagnosisLt: "Ūminė viršutinių kvėpavimo takų infekcija",
      diagnosisEn: "Acute upper respiratory infection",
      from: addCalendarDays(t, -6),
      to: t,
      issuedAt: addCalendarDays(t, -6),
      doctorLt: "Dr. Rasa Rasaitė",
      doctorEn: "Dr. Rasa Rasaite",
      workplaceLt: "UAB „Baltic Soft“",
      workplaceEn: "Baltic Soft Ltd",
      noteLt: "Baigiasi šiandien — galima pratęsti po apžiūros.",
      noteEn: "Ends today — may extend after review.",
    },
    {
      id: "sl-today-2",
      patientId: "patient_female",
      patientNameLt: "Rasa Rasaitė",
      patientNameEn: "Jane Smith",
      diagnosisCode: "D50.9",
      diagnosisLt: "Geležies stokos anemija",
      diagnosisEn: "Iron deficiency anaemia",
      from: addCalendarDays(t, -10),
      to: t,
      issuedAt: addCalendarDays(t, -10),
      doctorLt: "Dr. Rasa Rasaitė",
      doctorEn: "Dr. Rasa Rasaite",
      workplaceLt: "VšĮ Vilniaus poliklinika",
      workplaceEn: "Vilnius polyclinic",
    },
    {
      id: "sl-tomorrow-1",
      patientId: "patient_petraitis",
      patientNameLt: "Petras Petraitis",
      patientNameEn: "Peter Peters",
      diagnosisCode: "M54.5",
      diagnosisLt: "Apatinės nugaros dalies skausmas",
      diagnosisEn: "Low back pain",
      from: addCalendarDays(t, -12),
      to: addCalendarDays(t, 1),
      issuedAt: addCalendarDays(t, -12),
      doctorLt: "Dr. Rasa Rasaitė",
      doctorEn: "Dr. Rasa Rasaite",
      workplaceLt: "UAB „Statybos linija“",
      workplaceEn: "Construction Line Ltd",
      noteLt: "Baigiasi rytoj.",
      noteEn: "Ends tomorrow.",
    },
    {
      id: "sl-day2-1",
      patientId: "patient_male",
      patientNameLt: "Jonas Jonaitis",
      patientNameEn: "John Doe",
      diagnosisCode: "M79.1",
      diagnosisLt: "Miozitas",
      diagnosisEn: "Myalgia",
      from: addCalendarDays(t, -4),
      to: addCalendarDays(t, 2),
      issuedAt: addCalendarDays(t, -4),
      doctorLt: "Dr. Rasa Rasaitė",
      doctorEn: "Dr. Rasa Rasaite",
      workplaceLt: "UAB „Baltic Soft“",
      workplaceEn: "Baltic Soft Ltd",
      noteLt: "Baigiasi poryt.",
      noteEn: "Ends in two days.",
    },
    {
      id: "sl-active-1",
      patientId: "patient_petraitis",
      patientNameLt: "Petras Petraitis",
      patientNameEn: "Peter Peters",
      diagnosisCode: "S82.9",
      diagnosisLt: "Blauzdos lūžio pasekmės · reabilitacija",
      diagnosisEn: "Sequelae of leg fracture · rehab",
      from: addCalendarDays(t, -20),
      to: addCalendarDays(t, 14),
      issuedAt: addCalendarDays(t, -20),
      doctorLt: "Dr. Andrius Kazlauskas",
      doctorEn: "Dr. Andrius Kazlauskas",
      workplaceLt: "UAB „Statybos linija“",
      workplaceEn: "Construction Line Ltd",
    },
    {
      id: "sl-active-2",
      patientId: "patient_female",
      patientNameLt: "Rasa Rasaitė",
      patientNameEn: "Jane Smith",
      diagnosisCode: "N95.1",
      diagnosisLt: "Menopauzės būklė",
      diagnosisEn: "Menopausal state",
      from: addCalendarDays(t, -3),
      to: addCalendarDays(t, 7),
      issuedAt: addCalendarDays(t, -3),
      doctorLt: "Dr. Rasa Rasaitė",
      doctorEn: "Dr. Rasa Rasaite",
      workplaceLt: "VšĮ Vilniaus poliklinika",
      workplaceEn: "Vilnius polyclinic",
    },
    {
      id: "sl-hist-1",
      patientId: "patient_male",
      patientNameLt: "Jonas Jonaitis",
      patientNameEn: "John Doe",
      diagnosisCode: "J18.9",
      diagnosisLt: "Pneumonija, nepatikslinta",
      diagnosisEn: "Pneumonia, unspecified",
      from: addCalendarDays(t, -60),
      to: addCalendarDays(t, -45),
      issuedAt: addCalendarDays(t, -60),
      doctorLt: "Dr. Miglė Vaitkevičienė",
      doctorEn: "Dr. Migle Vaitkeviciene",
      workplaceLt: "UAB „Baltic Soft“",
      workplaceEn: "Baltic Soft Ltd",
    },
    {
      id: "sl-hist-2",
      patientId: "patient_petraitis",
      patientNameLt: "Petras Petraitis",
      patientNameEn: "Peter Peters",
      diagnosisCode: "S72.9",
      diagnosisLt: "Šlaunikaulio lūžis (istorinis)",
      diagnosisEn: "Femur fracture (historical)",
      from: "2009-08-20",
      to: "2009-10-15",
      issuedAt: "2009-08-20",
      doctorLt: "Traumatologijos skyrius",
      doctorEn: "Trauma department",
      workplaceLt: "UAB „Statybos linija“",
      workplaceEn: "Construction Line Ltd",
    },
  ];
}

export function sickLeavesEndingOn(
  list: SickLeaveCertificate[],
  isoDate: string
) {
  return list.filter((s) => s.to === isoDate);
}

export function sickLeavesActive(list: SickLeaveCertificate[], asOf = today()) {
  return list.filter((s) => s.from <= asOf && s.to >= asOf);
}

export function sickLeavesHistorical(
  list: SickLeaveCertificate[],
  asOf = today()
) {
  return list.filter((s) => s.to < asOf);
}
