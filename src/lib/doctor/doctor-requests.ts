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
  /** Original patient question (shown to the doctor). */
  questionLt: string;
  questionEn: string;
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
    questionLt:
      "Sveiki, po farmakogenetikos tyrimo matau SLCO1B1 signalą. Ar reikia mažinti Roswera 5 mg dozę? MTL paskutinį kartą buvo 3,8 mmol/L, CK normalus. Prašau atsakymo raštu.",
    questionEn:
      "Hello — after PGx I see an SLCO1B1 signal. Should I reduce Roswera 5 mg? Latest LDL was 3.8 mmol/L, CK normal. Please reply in writing.",
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
    questionLt:
      "Sveiki, gavau TSH ir feritino rezultatus. TSH šiek tiek virš normos, feritinas žemesnis. Ar reikia kartoti tyrimus, ir po kiek laiko? Taip pat — ar verta papildyti geležimi?",
    questionEn:
      "Hello — I received TSH and ferritin results. TSH is slightly above range, ferritin is low. Should I repeat the labs, and when? Also — is iron supplementation worth considering?",
    replyLt:
      "Juodraštis: kartoti TSH po 6–8 sav., feritiną vertinti su simptomais…",
    replyEn:
      "Draft: repeat TSH in 6–8 weeks; interpret ferritin with symptoms…",
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
    questionLt:
      "Po NGS tyrimo radote MYBPC3 variantą. Ar mano tėvams, broliui ir vaikams reikia Echo / EKG? Kaip greitai turėčiau juos siųsti?",
    questionEn:
      "After NGS you found a MYBPC3 variant. Do my parents, brother and children need Echo/ECG? How soon should they be referred?",
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
    questionLt:
      "Turiu nestiprią slogą, temperatūros nėra. Ar galima šį sezoną skiepytis nuo gripo?",
    questionEn:
      "I have a mild cold, no fever. Is it OK to get the seasonal flu vaccine?",
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
    questionLt:
      "Prašau pratęsti Telmisartan 40 mg e-receptą 90 dienų be vizito. AKS namuose apie 127/77.",
    questionEn:
      "Please extend Telmisartan 40 mg e-prescription for 90 days without a visit. Home BP around 127/77.",
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
    questionLt:
      "Prieš vizitą noriu užsisakyti laboratorinį paketą. Ar tinka hormonų CORE, ar geriau FULL?",
    questionEn:
      "Before the visit I want to order a lab package. Is hormones CORE fine, or should I take FULL?",
    replyLt:
      "Rekomenduoju hormonų CORE + feritiną; FULL — jei planuojate nėštumą.",
    replyEn:
      "Recommend hormones CORE + ferritin; FULL if pregnancy planning.",
  },
];

function threadToRequest(
  t: (typeof DEMO_CHAT_THREADS)[number]
): DoctorRequest {
  const last = t.messages[t.messages.length - 1];
  const waiting = last?.from === "patient";
  const answered = last?.from === "doctor";
  const ageDays =
    (Date.now() - new Date(t.lastAt).getTime()) / (1000 * 3600 * 24);
  let status: RequestStatus = waiting ? "waiting" : "answered";
  if (answered && ageDays > 14) status = "closed";

  const patientMsgs = t.messages.filter((m) => m.from === "patient");
  const lastPatient = patientMsgs[patientMsgs.length - 1];
  const questionLt =
    patientMsgs.length > 1
      ? patientMsgs.map((m) => m.textLt).join("\n\n")
      : lastPatient?.textLt || t.previewLt;
  const questionEn =
    patientMsgs.length > 1
      ? patientMsgs.map((m) => m.textEn).join("\n\n")
      : lastPatient?.textEn || t.previewEn;

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
    questionLt,
    questionEn,
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
