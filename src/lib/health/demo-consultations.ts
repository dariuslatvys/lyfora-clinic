export type ConsultUrgency = "urgent" | "planned";
export type ConsultStatus = "upcoming" | "past";
export type ConsultMode = "in_person" | "video" | "phone";

export type DemoConsultation = {
  id: string;
  status: ConsultStatus;
  urgency: ConsultUrgency;
  /** ISO date YYYY-MM-DD */
  date: string;
  time: string;
  titleLt: string;
  titleEn: string;
  reasonLt: string;
  reasonEn: string;
  doctorLt: string;
  doctorEn: string;
  specialtyLt: string;
  specialtyEn: string;
  placeLt: string;
  placeEn: string;
  mode: ConsultMode;
  /** Optional link to a visit id */
  visitId?: string;
};

export type ChatMessage = {
  id: string;
  /** ISO datetime */
  at: string;
  from: "patient" | "doctor";
  textLt: string;
  textEn: string;
};

export type DemoChatThread = {
  id: string;
  titleLt: string;
  titleEn: string;
  doctorLt: string;
  doctorEn: string;
  specialtyLt: string;
  specialtyEn: string;
  /** ISO datetime of last message */
  lastAt: string;
  previewLt: string;
  previewEn: string;
  unread?: boolean;
  messages: ChatMessage[];
};

export const DEMO_CONSULTATIONS: DemoConsultation[] = [
  {
    id: "c-urgent-shoulder",
    status: "upcoming",
    urgency: "urgent",
    date: "2026-11-02",
    time: "09:20",
    titleLt: "Skubi konsultacija — peties skausmas",
    titleEn: "Urgent consult — shoulder pain",
    reasonLt:
      "Ūmus dešinio peties skausmas po fizinio krūvio, judesių ribojimas, naktinis skausmas.",
    reasonEn:
      "Acute right shoulder pain after exertion, limited motion, night pain.",
    doctorLt: "Dr. Martynas Gedvilas",
    doctorEn: "Dr. Martynas Gedvilas",
    specialtyLt: "Ortopedija–traumatologija",
    specialtyEn: "Orthopaedics–traumatology",
    placeLt: "Lyfora Spine Desk (skubi eilė)",
    placeEn: "Lyfora Spine Desk (urgent slot)",
    mode: "in_person",
  },
  {
    id: "c-planned-gastro",
    status: "upcoming",
    urgency: "planned",
    date: "2026-11-18",
    time: "14:10",
    titleLt: "Planinė gastro konsultacija",
    titleEn: "Planned gastroenterology consult",
    reasonLt:
      "Kontrolė po gastroskopijos ir H. pylori — PPI atsako ir eradikacijos plano aptarimas.",
    reasonEn:
      "Follow-up after gastroscopy and H. pylori — review PPI response and eradication plan.",
    doctorLt: "Dr. Laura Šimkutė",
    doctorEn: "Dr. Laura Simkute",
    specialtyLt: "Gastroenterologija",
    specialtyEn: "Gastroenterology",
    placeLt: "Lyfora Endoskopijos kabinetas / nuotolinė",
    placeEn: "Lyfora Endoscopy Suite / remote",
    mode: "video",
    visitId: "v-2025-08-07",
  },
  {
    id: "c-planned-cardio",
    status: "upcoming",
    urgency: "planned",
    date: "2026-11-12",
    time: "10:30",
    titleLt: "Kardiologo kontrolė",
    titleEn: "Cardiology follow-up",
    reasonLt: "Lipidų ir MYBPC3 stebėsena — planinė kontrolė.",
    reasonEn: "Lipid and MYBPC3 surveillance — planned follow-up.",
    doctorLt: "Dr. Andrius Kazlauskas",
    doctorEn: "Dr. Andrius Kazlauskas",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    placeLt: "Lyfora Heart Center",
    placeEn: "Lyfora Heart Center",
    mode: "in_person",
    visitId: "v-2026-11-12",
  },
  {
    id: "c-past-gastro",
    status: "past",
    urgency: "planned",
    date: "2025-08-07",
    time: "08:30",
    titleLt: "Gastroskopija ir konsultacija",
    titleEn: "Gastroscopy and consult",
    reasonLt: "Epigastrinis diskomfortas — atlikta EGD su biopsijomis.",
    reasonEn: "Epigastric discomfort — EGD with biopsies performed.",
    doctorLt: "Dr. Laura Šimkutė",
    doctorEn: "Dr. Laura Simkute",
    specialtyLt: "Gastroenterologija",
    specialtyEn: "Gastroenterology",
    placeLt: "Lyfora Endoskopijos kabinetas",
    placeEn: "Lyfora Endoscopy Suite",
    mode: "in_person",
    visitId: "v-2025-08-07",
  },
  {
    id: "c-past-neck",
    status: "past",
    urgency: "planned",
    date: "2025-03-18",
    time: "10:40",
    titleLt: "Kaklo skausmo konsultacija",
    titleEn: "Neck pain consultation",
    reasonLt: "Chroninis kaklo skausmas — paskirtas KT ir siuntimai.",
    reasonEn: "Chronic neck pain — CT and referrals ordered.",
    doctorLt: "Dr. Martynas Gedvilas",
    doctorEn: "Dr. Martynas Gedvilas",
    specialtyLt: "Ortopedija–traumatologija",
    specialtyEn: "Orthopaedics–traumatology",
    placeLt: "Lyfora Spine Desk",
    placeEn: "Lyfora Spine Desk",
    mode: "in_person",
    visitId: "v-2025-03-18",
  },
  {
    id: "c-past-cardio",
    status: "past",
    urgency: "planned",
    date: "2026-04-14",
    time: "16:00",
    titleLt: "Kardiologo kontrolė",
    titleEn: "Cardiology follow-up",
    reasonLt: "Pakartotiniai lipidų rezultatai — stebėjimo plano korekcija.",
    reasonEn: "Repeat lipid results — monitoring plan adjusted.",
    doctorLt: "Dr. Andrius Kazlauskas",
    doctorEn: "Dr. Andrius Kazlauskas",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    placeLt: "Lyfora Heart Center",
    placeEn: "Lyfora Heart Center",
    mode: "in_person",
    visitId: "v-2026-04-14",
  },
  {
    id: "c-past-urgent-bp",
    status: "past",
    urgency: "urgent",
    date: "2026-09-20",
    time: "11:05",
    titleLt: "Skubi nuotolinė — kraujospūdis",
    titleEn: "Urgent remote — blood pressure",
    reasonLt: "Namų matavimai ~150/95 — skubi triažo konsultacija telefonu.",
    reasonEn: "Home readings ~150/95 — urgent phone triage.",
    doctorLt: "Dr. Rūta Petrauskienė",
    doctorEn: "Dr. Ruta Petrauskienė",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    placeLt: "Nuotolinė (telefonas)",
    placeEn: "Remote (phone)",
    mode: "phone",
  },
];

export const DEMO_CHAT_THREADS: DemoChatThread[] = [
  {
    id: "chat-shoulder",
    titleLt: "Peties skausmas — skubus klausimas",
    titleEn: "Shoulder pain — urgent question",
    doctorLt: "Dr. Martynas Gedvilas",
    doctorEn: "Dr. Martynas Gedvilas",
    specialtyLt: "Ortopedija",
    specialtyEn: "Orthopaedics",
    lastAt: "2026-11-01T12:40:00.000Z",
    previewLt: "Gerai — rytoj 09:20 skubi gyva konsultacija Spine Desk.",
    previewEn: "OK — tomorrow 09:20 urgent in-person slot at Spine Desk.",
    unread: true,
    messages: [
      {
        id: "m1",
        at: "2026-11-01T11:55:00.000Z",
        from: "patient",
        textLt:
          "Labas, dešinys petys skausmas nuo vakar vakaro, ypač keliant ranką ir naktį. Ar galima skubią konsultaciją?",
        textEn:
          "Hi — right shoulder pain since last night, worse lifting the arm and at night. Can I get an urgent consult?",
      },
      {
        id: "m2",
        at: "2026-11-01T12:10:00.000Z",
        from: "doctor",
        textLt:
          "Sveiki. Ar buvo trauma / kritimas? Ar tirpsta plaštaka? Skausmo skalė 0–10?",
        textEn:
          "Hello. Any trauma/fall? Any hand numbness? Pain 0–10?",
      },
      {
        id: "m3",
        at: "2026-11-01T12:18:00.000Z",
        from: "patient",
        textLt:
          "Traumos nebuvo, tirpimo nėra. Skausmas apie 7/10. Ledas padeda truputį.",
        textEn:
          "No trauma, no numbness. Pain about 7/10. Ice helps a bit.",
      },
      {
        id: "m4",
        at: "2026-11-01T12:40:00.000Z",
        from: "doctor",
        textLt:
          "Kol kas: ramybė, ledas 15 min ×3/d., venkite virš galvos judesių. Rytoj 09:20 skubi gyva konsultacija Spine Desk — įrašiau jus.",
        textEn:
          "For now: rest, ice 15 min ×3/day, avoid overhead moves. Tomorrow 09:20 urgent in-person at Spine Desk — booked.",
      },
    ],
  },
  {
    id: "chat-gastro-ppi",
    titleLt: "Po gastroskopijos — PPI",
    titleEn: "After gastroscopy — PPI",
    doctorLt: "Dr. Laura Šimkutė",
    doctorEn: "Dr. Laura Simkute",
    specialtyLt: "Gastroenterologija",
    specialtyEn: "Gastroenterology",
    lastAt: "2026-10-12T15:22:00.000Z",
    previewLt: "Jei rėmuo grįžta — rašykite; planinė kontrolė lapkritį.",
    previewEn: "If heartburn returns — message me; planned follow-up in November.",
    messages: [
      {
        id: "m1",
        at: "2026-10-10T09:05:00.000Z",
        from: "patient",
        textLt:
          "Po EGD geriu PPI 2 sav. Rėmuo sumažėjo, bet kartais grįžta vakare. Ar didinti dozę?",
        textEn:
          "After EGD I’ve been on PPI for 2 weeks. Heartburn is better but sometimes returns in the evening. Increase the dose?",
      },
      {
        id: "m2",
        at: "2026-10-10T14:40:00.000Z",
        from: "doctor",
        textLt:
          "Dozės kol kas nekeiskite — gerkite 30–60 min prieš pusryčius. Vengkite vėlyvos kavos ir gulėjimo iškart po valgio.",
        textEn:
          "Don’t change the dose yet — take it 30–60 min before breakfast. Avoid late coffee and lying down right after meals.",
      },
      {
        id: "m3",
        at: "2026-10-12T10:12:00.000Z",
        from: "patient",
        textLt: "Supratau, rytais geriau laikausi. Biopsijos atsakymas jau yra?",
        textEn: "Got it, mornings are better. Is the biopsy result in?",
      },
      {
        id: "m4",
        at: "2026-10-12T15:22:00.000Z",
        from: "doctor",
        textLt:
          "Histologija be displazijos; H. pylori eradikaciją derinsime planinėje konsultacijoje. Jei rėmuo grįžta — rašykite.",
        textEn:
          "Histology without dysplasia; we’ll align H. pylori eradication at the planned consult. If heartburn returns — message me.",
      },
    ],
  },
  {
    id: "chat-cardio-lipids",
    titleLt: "MTL ir statinai",
    titleEn: "LDL and statins",
    doctorLt: "Dr. Andrius Kazlauskas",
    doctorEn: "Dr. Andrius Kazlauskas",
    specialtyLt: "Kardiologija",
    specialtyEn: "Cardiology",
    lastAt: "2026-09-28T08:50:00.000Z",
    previewLt: "Kontroliniai lipidai prieš lapkričio vizitą — gerai.",
    previewEn: "Control lipids before the November visit — good.",
    messages: [
      {
        id: "m1",
        at: "2026-09-26T18:30:00.000Z",
        from: "patient",
        textLt:
          "Rosuvastatiną geriu reguliariai. Ar reikia kartoti ApoB prieš kontrolę?",
        textEn:
          "I’m taking rosuvastatin regularly. Should I repeat ApoB before the follow-up?",
      },
      {
        id: "m2",
        at: "2026-09-27T09:15:00.000Z",
        from: "doctor",
        textLt:
          "Taip — lipidų panelę + ApoB likus ~2 sav. iki lapkričio vizito. Jei raumenų skausmai — rašykite iškart.",
        textEn:
          "Yes — lipid panel + ApoB ~2 weeks before the November visit. If muscle pains — message immediately.",
      },
      {
        id: "m3",
        at: "2026-09-28T08:50:00.000Z",
        from: "patient",
        textLt: "Gerai, užsisakysiu. Raumenų skausmų nėra.",
        textEn: "OK, I’ll book the labs. No muscle pain.",
      },
    ],
  },
  {
    id: "chat-family-bp",
    titleLt: "Kraujospūdžio matavimai namuose",
    titleEn: "Home blood pressure readings",
    doctorLt: "Dr. Rūta Petrauskienė",
    doctorEn: "Dr. Ruta Petrauskienė",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    lastAt: "2026-09-20T12:05:00.000Z",
    previewLt: "Jei vėl >150/95 — skubi konsultacija / skambinkite.",
    previewEn: "If again >150/95 — urgent consult / call.",
    messages: [
      {
        id: "m1",
        at: "2026-09-20T10:20:00.000Z",
        from: "patient",
        textLt: "Rytiniai matavimai 148/92 ir 152/96. Galva sunki. Ką daryti?",
        textEn: "Morning readings 148/92 and 152/96. Heavy head. What should I do?",
      },
      {
        id: "m2",
        at: "2026-09-20T10:45:00.000Z",
        from: "doctor",
        textLt:
          "Persėskite 5 min, pakartokite. Telmisartaną gerkite kaip paskirta. Dabar skambinsiu — skubi triažo konsultacija.",
        textEn:
          "Sit 5 min and repeat. Take telmisartan as prescribed. I’ll call now — urgent triage.",
      },
      {
        id: "m3",
        at: "2026-09-20T12:05:00.000Z",
        from: "doctor",
        textLt:
          "Po pokalbio: šiandien ilsėkitės, druską mažinkite, rytoj pakartokite dienoraštį. Jei vėl >150/95 ar krūtinės skausmas — skubi konsultacija / 112.",
        textEn:
          "After the call: rest today, lower salt, restart the diary tomorrow. If again >150/95 or chest pain — urgent consult / 112.",
      },
    ],
  },
];

export function upcomingConsultations() {
  return DEMO_CONSULTATIONS.filter((c) => c.status === "upcoming").sort((a, b) =>
    a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
  );
}

export function pastConsultations() {
  return DEMO_CONSULTATIONS.filter((c) => c.status === "past").sort((a, b) =>
    b.date === a.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)
  );
}

export function getConsultation(id: string) {
  return DEMO_CONSULTATIONS.find((c) => c.id === id) || null;
}

export function getChatThread(id: string) {
  return DEMO_CHAT_THREADS.find((t) => t.id === id) || null;
}

export function chatThreadsSorted() {
  return [...DEMO_CHAT_THREADS].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

export function formatConsultWhen(
  c: DemoConsultation,
  locale: "lt" | "en"
) {
  const d = new Date(`${c.date}T12:00:00`);
  const date = d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${date} · ${c.time}`;
}

export function formatChatWhen(iso: string, locale: "lt" | "en") {
  return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Vilnius",
  });
}

export function consultModeLabel(mode: ConsultMode, locale: "lt" | "en") {
  const map: Record<ConsultMode, { lt: string; en: string }> = {
    in_person: { lt: "Gyvai", en: "In person" },
    video: { lt: "Vaizdo skambutis", en: "Video" },
    phone: { lt: "Telefonas", en: "Phone" },
  };
  return locale === "en" ? map[mode].en : map[mode].lt;
}
