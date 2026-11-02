import { DEMO_CHAT_THREADS } from "@/lib/health/demo-consultations";
import type { Locale } from "@/lib/i18n/dictionary";

export type RequestStatus =
  | "waiting"
  | "in_progress"
  | "answered"
  | "closed";

export type DoctorRequest = {
  id: string;
  patientId: string;
  patientNameLt: string;
  patientNameEn: string;
  subjectLt: string;
  subjectEn: string;
  previewLt: string;
  previewEn: string;
  specialtyLt: string;
  specialtyEn: string;
  status: RequestStatus;
  priority: "urgent" | "normal";
  channel: "chat" | "form" | "referral";
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  tagsLt: string[];
  tagsEn: string[];
  bodyLt: string;
  bodyEn: string;
  replyLt?: string;
  replyEn?: string;
};

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function daysAgo(d: number) {
  return hoursAgo(d * 24);
}

/** Extra clinician inbox items beyond patient chat threads. */
const EXTRA_REQUESTS: DoctorRequest[] = [
  {
    id: "req-lipid-dose",
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    subjectLt: "Statinų dozė po PGx",
    subjectEn: "Statin dose after PGx",
    previewLt: "SLCO1B1 signalas — ar keisti Roswera dozę?",
    previewEn: "SLCO1B1 signal — change Roswera dose?",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    status: "waiting",
    priority: "urgent",
    channel: "form",
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    slaHours: 24,
    tagsLt: ["PGx", "Lipidai", "Receptas"],
    tagsEn: ["PGx", "Lipids", "Rx"],
    bodyLt:
      "Pacientas klausia, ar po farmakogenetikos (SLCO1B1) reikia mažinti Roswera 5 mg. MTL 3,8 mmol/L, CK normalus. Prašo atsakymo raštu per 24 val.",
    bodyEn:
      "Patient asks whether Roswera 5 mg should be reduced after PGx (SLCO1B1). LDL 3.8 mmol/L, CK normal. Wants a written reply within 24h.",
  },
  {
    id: "req-female-hormones",
    patientId: "patient_female",
    patientNameLt: "Rasa Rasaitė",
    patientNameEn: "Jane Smith",
    subjectLt: "Hormonų panelės interpretacija",
    subjectEn: "Hormone panel interpretation",
    previewLt: "TSH ir feritinas — ar kartoti tyrimus?",
    previewEn: "TSH and ferritin — repeat labs?",
    specialtyLt: "Endokrinologija",
    specialtyEn: "Endocrinology",
    status: "in_progress",
    priority: "normal",
    channel: "chat",
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(3),
    slaHours: 24,
    tagsLt: ["Hormonai", "Tyrimai"],
    tagsEn: ["Hormones", "Labs"],
    bodyLt:
      "Pacientė atsiuntė klausimą dėl TSH ir feritino. Pradėjote juodraštį; reikia užbaigti atsakymą ir pasiūlyti kontrolės datą.",
    bodyEn:
      "Patient messaged about TSH and ferritin. Draft started; finish the reply and propose a follow-up date.",
    replyLt: "Juodraštis: kartoti TSH po 6–8 sav., feritiną vertinti su Simptomais…",
    replyEn: "Draft: repeat TSH in 6–8 weeks; interpret ferritin with symptoms…",
  },
  {
    id: "req-ngs-mybpc3",
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    subjectLt: "NGS MYBPC3 — šeimos patikra",
    subjectEn: "NGS MYBPC3 — family screening",
    previewLt: "Ar rekomenduoti Echo šeimos nariams?",
    previewEn: "Recommend Echo for relatives?",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    status: "waiting",
    priority: "urgent",
    channel: "referral",
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(30),
    slaHours: 48,
    tagsLt: ["NGS", "Kardiologija", "Siuntimas"],
    tagsEn: ["NGS", "Cardiology", "Referral"],
    bodyLt:
      "Po NGS MYBPC3 radinio pacientas klausia dėl pirmos eilės giminaičių Echo / EKG. Reikia klinikinio atsakymo ir siuntimo gairių.",
    bodyEn:
      "After NGS MYBPC3 finding, patient asks about first-degree relatives’ Echo/ECG. Needs clinical reply and referral guidance.",
  },
  {
    id: "req-vaccine-flu",
    patientId: "patient_female",
    patientNameLt: "Rasa Rasaitė",
    patientNameEn: "Jane Smith",
    subjectLt: "Gripo skiepas — kontraindikacijos",
    subjectEn: "Flu vaccine — contraindications",
    previewLt: "Ar galima skiepytis šį sezoną?",
    previewEn: "OK to vaccinate this season?",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    status: "answered",
    priority: "normal",
    channel: "chat",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
    slaHours: 24,
    tagsLt: ["Skiepai"],
    tagsEn: ["Vaccines"],
    bodyLt: "Klausė dėl sezono gripo vakcinos po nestiprios slogos.",
    bodyEn: "Asked about seasonal flu vaccine after a mild cold.",
    replyLt:
      "Jei temperatūros nėra ir savijauta gera — skiepytis galima. Po ūmaus karščiavimo palaukite 48 val.",
    replyEn:
      "If no fever and feeling well — vaccination is fine. After acute fever wait 48h.",
  },
  {
    id: "req-rx-refill",
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    subjectLt: "Telmisartano pratęsimas",
    subjectEn: "Telmisartan refill",
    previewLt: "Prašo e-recepto pratęsimo 90 d.",
    previewEn: "Requests 90-day e-prescription refill",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    status: "closed",
    priority: "normal",
    channel: "form",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
    slaHours: 24,
    tagsLt: ["Receptas", "AKS"],
    tagsEn: ["Rx", "BP"],
    bodyLt: "Prašymas pratęsti Telmisartan 40 mg be vizito.",
    bodyEn: "Request to extend Telmisartan 40 mg without a visit.",
    replyLt: "Pratęsta 90 d. po AKS peržiūros klausimyne (127/77).",
    replyEn: "Extended 90 days after BP review in questionnaire (127/77).",
  },
  {
    id: "req-lab-package",
    patientId: "patient_female",
    patientNameLt: "Rasa Rasaitė",
    patientNameEn: "Jane Smith",
    subjectLt: "Marketplace — hormonų paketas",
    subjectEn: "Marketplace — hormone package",
    previewLt: "Ar tinka CORE hormonų paketas?",
    previewEn: "Is CORE hormone package appropriate?",
    specialtyLt: "Ginekologija",
    specialtyEn: "Gynaecology",
    status: "answered",
    priority: "normal",
    channel: "form",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(8),
    slaHours: 48,
    tagsLt: ["Marketplace", "Hormonai"],
    tagsEn: ["Marketplace", "Hormones"],
    bodyLt: "Klausė, kurį laboratorinį paketą užsisakyti prieš vizitą.",
    bodyEn: "Asked which lab package to order before the visit.",
    replyLt: "Rekomenduoju hormonų CORE + feritiną; FULL — jei planuojate nėštumą.",
    replyEn: "Recommend hormones CORE + ferritin; FULL if pregnancy planning.",
  },
];

function threadToRequest(
  t: (typeof DEMO_CHAT_THREADS)[number]
): DoctorRequest {
  const last = t.messages[t.messages.length - 1];
  const waiting = last?.from === "patient";
  const answered = last?.from === "doctor";
  // Older answered threads → history; recent patient-last → active waiting
  const ageDays =
    (Date.now() - new Date(t.lastAt).getTime()) / (1000 * 3600 * 24);
  let status: RequestStatus = waiting ? "waiting" : "answered";
  if (answered && ageDays > 14) status = "closed";
  return {
    id: `chat:${t.id}`,
    patientId: "patient_male",
    patientNameLt: "Jonas Jonaitis",
    patientNameEn: "John Doe",
    subjectLt: t.titleLt,
    subjectEn: t.titleEn,
    previewLt: t.previewLt,
    previewEn: t.previewEn,
    specialtyLt: t.specialtyLt,
    specialtyEn: t.specialtyEn,
    status,
    priority: /skub|urgent|peties/i.test(t.titleLt + t.titleEn)
      ? "urgent"
      : "normal",
    channel: "chat",
    createdAt: t.messages[0]?.at || t.lastAt,
    updatedAt: t.lastAt,
    slaHours: 24,
    tagsLt: [t.specialtyLt, "Pokalbiai"],
    tagsEn: [t.specialtyEn, "Chat"],
    bodyLt: t.messages
      .map((m) => `${m.from === "patient" ? "Pacientas" : "Gydytojas"}: ${m.textLt}`)
      .join("\n\n"),
    bodyEn: t.messages
      .map((m) => `${m.from === "patient" ? "Patient" : "Doctor"}: ${m.textEn}`)
      .join("\n\n"),
    replyLt: answered ? last?.textLt : undefined,
    replyEn: answered ? last?.textEn : undefined,
  };
}

export function allDoctorRequests(): DoctorRequest[] {
  const fromChats = DEMO_CHAT_THREADS.map(threadToRequest);
  const map = new Map<string, DoctorRequest>();
  for (const r of [...EXTRA_REQUESTS, ...fromChats]) map.set(r.id, r);
  return [...map.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function activeDoctorRequests() {
  return allDoctorRequests().filter(
    (r) => r.status === "waiting" || r.status === "in_progress"
  );
}

export function historicalDoctorRequests() {
  return allDoctorRequests().filter(
    (r) => r.status === "answered" || r.status === "closed"
  );
}

export function requestStatusLabel(status: RequestStatus, locale: Locale) {
  const lt: Record<RequestStatus, string> = {
    waiting: "Laukia",
    in_progress: "Vykdoma",
    answered: "Atsakyta",
    closed: "Uždaryta",
  };
  const en: Record<RequestStatus, string> = {
    waiting: "Waiting",
    in_progress: "In progress",
    answered: "Answered",
    closed: "Closed",
  };
  return (locale === "en" ? en : lt)[status];
}

export function requestPriorityLabel(
  priority: DoctorRequest["priority"],
  locale: Locale
) {
  if (priority === "urgent") {
    return locale === "en" ? "Urgent" : "Skubu";
  }
  return locale === "en" ? "Normal" : "Įprasta";
}
