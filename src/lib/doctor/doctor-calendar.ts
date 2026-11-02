import {
  DEMO_VISITS,
  addCalendarDays,
  todayIsoDate,
  withResolvedVisitDate,
  type DemoVisit,
  type VisitStatus,
} from "@/lib/health/demo-visits";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import type { Locale } from "@/lib/i18n/dictionary";

export type DoctorApptStatus = VisitStatus | "cancelled" | "done";

export type VideoPlatform = "meet" | "zoom" | "teams";

export type DoctorAppointment = {
  id: string;
  date: string;
  time: string;
  titleLt: string;
  titleEn: string;
  patientId: string | null;
  patientNameLt: string;
  patientNameEn: string;
  mode: "in_person" | "video" | "phone";
  status: DoctorApptStatus;
  notesLt?: string;
  notesEn?: string;
  placeLt?: string;
  placeEn?: string;
  /** True when created from the doctor calendar UI */
  createdByDoctor?: boolean;
  videoPlatform?: VideoPlatform;
  videoUrl?: string;
};

export type DoctorPatientOption = {
  id: string;
  nameLt: string;
  nameEn: string;
  firstNameLt: string;
  lastNameLt: string;
  firstNameEn: string;
  lastNameEn: string;
  sex: "male" | "female";
  dob: string | null;
  email: string;
  phone: string;
  nationalId: string;
};

/** Demo video room links shown when mode = Video. */
export const VIDEO_LINK_OPTIONS: {
  id: VideoPlatform;
  label: string;
  url: string;
}[] = [
  {
    id: "meet",
    label: "Google Meet",
    url: "https://meet.google.com/lyf-demo-abc",
  },
  {
    id: "zoom",
    label: "Zoom",
    url: "https://zoom.us/j/81234567890",
  },
  {
    id: "teams",
    label: "Teams",
    url: "https://teams.microsoft.com/l/meetup-join/lyfora-demo",
  },
];

const EXTRA_APPTS: DoctorAppointment[] = [
  {
    id: "da-today-1",
    date: todayIsoDate(),
    time: "09:00",
    titleLt: "Kontrolė — lipidai / AKS",
    titleEn: "Follow-up — lipids / BP",
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    mode: "in_person",
    status: "upcoming",
    placeLt: "Kabinetas 12",
    placeEn: "Room 12",
  },
  {
    id: "da-today-2",
    date: todayIsoDate(),
    time: "10:30",
    titleLt: "Video konsultacija — hormonai",
    titleEn: "Video consult — hormones",
    patientId: "patient_female",
    patientNameLt: "Rasa Rasaitė",
    patientNameEn: "Jane Smith",
    mode: "video",
    status: "upcoming",
    placeLt: "Google Meet",
    placeEn: "Google Meet",
    videoPlatform: "meet",
    videoUrl: "https://meet.google.com/lyf-demo-abc",
  },
  {
    id: "da-today-3",
    date: todayIsoDate(),
    time: "14:00",
    titleLt: "Naujas pacientas — anamnezė",
    titleEn: "New patient — intake",
    patientId: null,
    patientNameLt: "Petras Petraitis",
    patientNameEn: "Peter Peters",
    mode: "in_person",
    status: "upcoming",
    placeLt: "Kabinetas 12",
    placeEn: "Room 12",
    notesLt: "Kitas pacientas (ne Lyfora portalo kortelė).",
    notesEn: "External patient (no Lyfora portal chart).",
  },
  {
    id: "da-tomorrow-1",
    date: addCalendarDays(todayIsoDate(), 1),
    time: "09:20",
    titleLt: "Skubi — peties skausmas",
    titleEn: "Urgent — shoulder pain",
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    mode: "in_person",
    status: "upcoming",
    placeLt: "Spine Desk",
    placeEn: "Spine Desk",
  },
  {
    id: "da-plus2",
    date: addCalendarDays(todayIsoDate(), 2),
    time: "11:00",
    titleLt: "Receptų peržiūra",
    titleEn: "Prescription review",
    patientId: "patient_female",
    patientNameLt: "Rasa Rasaitė",
    patientNameEn: "Jane Smith",
    mode: "phone",
    status: "upcoming",
  },
  {
    id: "da-plus4",
    date: addCalendarDays(todayIsoDate(), 4),
    time: "15:30",
    titleLt: "Metabolinė kontrolė",
    titleEn: "Metabolic follow-up",
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    mode: "in_person",
    status: "upcoming",
  },
];

function visitToAppt(v: DemoVisit, locale: Locale): DoctorAppointment {
  const resolved = withResolvedVisitDate(v);
  // Map demo visits onto the two portal patients for the doctor calendar.
  const isFemaleHint =
    /moter|female|hormon|rasa|jane/i.test(
      `${resolved.titleLt} ${resolved.titleEn} ${resolved.notesLt}`
    );
  const patientId =
    resolved.id.includes("female") || isFemaleHint
      ? "patient_female"
      : "patient_male";
  return {
    id: `visit:${resolved.id}`,
    date: resolved.date,
    time: resolved.time,
    titleLt: resolved.titleLt,
    titleEn: resolved.titleEn,
    patientId,
    patientNameLt: patientDisplayName(
      patientId === "patient_female" ? "female" : "male",
      "lt"
    ),
    patientNameEn: patientDisplayName(
      patientId === "patient_female" ? "female" : "male",
      "en"
    ),
    mode: /video|nuotol/i.test(resolved.placeLt + resolved.placeEn)
      ? "video"
      : /telefon/i.test(resolved.placeLt + resolved.placeEn)
        ? "phone"
        : "in_person",
    status: resolved.status,
    notesLt: resolved.notesLt,
    notesEn: resolved.notesEn,
    placeLt: resolved.placeLt,
    placeEn: resolved.placeEn,
  };
}

export const DOCTOR_CREATED_KEY = "lyfora.doctor.created-appts.v1";
export const DOCTOR_APPT_EVENT = "lyfora-doctor-appts-changed";

export function readCreatedAppointments(): DoctorAppointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOCTOR_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DoctorAppointment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCreatedAppointments(list: DoctorAppointment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOCTOR_CREATED_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(DOCTOR_APPT_EVENT));
}

export function addCreatedAppointment(appt: DoctorAppointment) {
  const prev = readCreatedAppointments();
  writeCreatedAppointments([appt, ...prev.filter((a) => a.id !== appt.id)]);
}

/** Server-side base list (demo visits + fixed doctor slots). */
export function baseDoctorAppointments(locale: Locale = "lt"): DoctorAppointment[] {
  const fromVisits = DEMO_VISITS.map((v) => visitToAppt(v, locale));
  // Prefer dedicated doctor slots for near-term days; keep past visits for history.
  const past = fromVisits.filter((a) => a.status === "past" || a.status === "missed");
  return [...EXTRA_APPTS, ...past];
}

export function mergeAppointments(
  base: DoctorAppointment[],
  created: DoctorAppointment[]
): DoctorAppointment[] {
  const map = new Map<string, DoctorAppointment>();
  for (const a of [...base, ...created]) map.set(a.id, a);
  return [...map.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
  );
}

export function appointmentsForDay(
  all: DoctorAppointment[],
  isoDate: string
): DoctorAppointment[] {
  return all
    .filter((a) => a.date === isoDate)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function appointmentCountsByDate(
  all: DoctorAppointment[]
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of all) {
    if (a.status === "cancelled") continue;
    out[a.date] = (out[a.date] || 0) + 1;
  }
  return out;
}

export function modeLabel(
  mode: DoctorAppointment["mode"],
  locale: Locale
): string {
  if (locale === "en") {
    return mode === "video" ? "Video" : mode === "phone" ? "Call" : "In person";
  }
  return mode === "video" ? "Video" : mode === "phone" ? "Skambutis" : "Gyvai";
}

/** Working-day slots every `stepMin` minutes; excludes already booked times. */
export function freeSlotsForDay(
  all: DoctorAppointment[],
  isoDate: string,
  stepMin = 20,
  startHour = 8,
  endHour = 18
): string[] {
  const taken = new Set(
    appointmentsForDay(all, isoDate)
      .filter((a) => a.status !== "cancelled")
      .map((a) => a.time)
  );
  const out: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!taken.has(t)) out.push(t);
    }
  }
  return out;
}

function normalizeFragment(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9@.+]/g, "");
}

/** Fragment match across name, email, phone, personal code, DOB. */
export function searchDoctorPatients(
  patients: DoctorPatientOption[],
  query: string,
  locale: Locale
): DoctorPatientOption[] {
  const q = query.trim();
  if (!q) return [];
  const nq = normalizeFragment(q);
  const digits = q.replace(/\D/g, "");
  return patients.filter((p) => {
    const name = locale === "en" ? p.nameEn : p.nameLt;
    const first = locale === "en" ? p.firstNameEn : p.firstNameLt;
    const last = locale === "en" ? p.lastNameEn : p.lastNameLt;
    const hay = normalizeFragment(
      [
        name,
        first,
        last,
        p.email,
        p.phone,
        p.nationalId,
        p.dob || "",
        (p.dob || "").replace(/-/g, ""),
        (p.dob || "").replace(/-/g, "."),
      ].join(" ")
    );
    if (nq && hay.includes(nq)) return true;
    if (digits.length >= 3) {
      const phoneDigits = p.phone.replace(/\D/g, "");
      const idDigits = p.nationalId.replace(/\D/g, "");
      const dobDigits = (p.dob || "").replace(/\D/g, "");
      if (
        phoneDigits.includes(digits) ||
        idDigits.includes(digits) ||
        dobDigits.includes(digits)
      ) {
        return true;
      }
    }
    return false;
  });
}

export function statusLabel(
  status: DoctorApptStatus,
  locale: Locale
): string {
  const lt: Record<DoctorApptStatus, string> = {
    upcoming: "Suplanuota",
    past: "Įvyko",
    missed: "Neatvyko",
    cancelled: "Atšaukta",
    done: "Įvyko",
  };
  const en: Record<DoctorApptStatus, string> = {
    upcoming: "Scheduled",
    past: "Done",
    missed: "No-show",
    cancelled: "Cancelled",
    done: "Done",
  };
  return (locale === "en" ? en : lt)[status];
}

export function monthMatrix(anchorIso: string): {
  weeks: Array<Array<{ iso: string; inMonth: boolean }>>;
  monthLabel: string;
  year: number;
  month: number;
} {
  const [y, m] = anchorIso.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: Array<{ iso: string; inMonth: boolean }> = [];
  for (let i = 0; i < startPad; i++) {
    const d = new Date(y, m - 1, 1 - (startPad - i));
    cells.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      inMonth: false,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      iso: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      inMonth: true,
    });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!;
    const d = new Date(`${last.iso}T12:00:00`);
    d.setDate(d.getDate() + 1);
    cells.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      inMonth: false,
    });
  }
  const weeks: Array<Array<{ iso: string; inMonth: boolean }>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const monthLabel = first.toLocaleDateString("lt-LT", {
    month: "long",
    year: "numeric",
  });
  return { weeks, monthLabel, year: y, month: m };
}
