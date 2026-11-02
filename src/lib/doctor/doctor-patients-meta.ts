import {
  baseDoctorAppointments,
  type DoctorAppointment,
} from "@/lib/doctor/doctor-calendar";
import { listClinicVisitsForPatient } from "@/lib/health/clinic-visits";
import type { RiskColour } from "@/lib/health/colours";

export type PatientSpecialNote = {
  id: string;
  labelLt: string;
  labelEn: string;
  kind: "disability" | "vision" | "mobility" | "other";
};

/** Demo clinical / social flags shown on the doctor patients list. */
export const PATIENT_SPECIAL_NOTES: Record<string, PatientSpecialNote[]> = {
  patient_male: [
    {
      id: "htn-monitor",
      kind: "other",
      labelLt: "Nuolatinė hipertenzijos stebėsena",
      labelEn: "Ongoing hypertension monitoring",
    },
    {
      id: "mobility",
      kind: "mobility",
      labelLt: "Judėjimo sutrikimas (stuburo patologija)",
      labelEn: "Mobility impairment (spinal pathology)",
    },
    {
      id: "trauma-leg",
      kind: "other",
      labelLt: "Blauzdos / šlaunikaulio trauma (2009)",
      labelEn: "Lower-leg / femur trauma (2009)",
    },
  ],
  patient_female: [
    {
      id: "iron-def",
      kind: "other",
      labelLt: "Geležies stoka · papildų režimas",
      labelEn: "Iron deficiency · supplement regimen",
    },
  ],
  patient_petraitis: [
    {
      id: "disability-1",
      kind: "disability",
      labelLt: "I grupės invalidumas",
      labelEn: "Group I disability",
    },
  ],
};

export type PatientCategoryHit = {
  id: string;
  title: string;
  colour: RiskColour;
  colourLabel: string;
};

export function countPatientVisits(
  patientId: string,
  locale: "lt" | "en" = "lt"
): number {
  const appts = baseDoctorAppointments(locale).filter(
    (a: DoctorAppointment) => a.patientId === patientId
  );
  const clinic = listClinicVisitsForPatient(patientId);
  const ids = new Set([...appts.map((a) => a.id), ...clinic.map((c) => c.id)]);
  return ids.size;
}

export function birthYearFromDob(dob: string | null | undefined): string {
  if (!dob || dob.length < 4) return "—";
  return dob.slice(0, 4);
}
