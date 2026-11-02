export const DOCTOR_RX_KEY = "lyfora.doctor.issued-rx.v1";
export const DOCTOR_RX_EVENT = "lyfora-doctor-rx-changed";

export type DoctorIssuedRx = {
  id: string;
  patientId: string;
  brandName: string;
  activeSubstance: string;
  atcCode: string;
  form: string;
  strength: string;
  directions: string;
  daysSupply: number;
  issuedAt: string;
  validTo: string;
};

export function readDoctorIssuedRx(patientId?: string): DoctorIssuedRx[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOCTOR_RX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DoctorIssuedRx[];
    if (!Array.isArray(parsed)) return [];
    const list = patientId
      ? parsed.filter((r) => r.patientId === patientId)
      : parsed;
    return list.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  } catch {
    return [];
  }
}

export function addDoctorIssuedRx(rx: DoctorIssuedRx) {
  if (typeof window === "undefined") return;
  const prev = readDoctorIssuedRx();
  window.localStorage.setItem(
    DOCTOR_RX_KEY,
    JSON.stringify([rx, ...prev.filter((r) => r.id !== rx.id)])
  );
  window.dispatchEvent(new Event(DOCTOR_RX_EVENT));
}
