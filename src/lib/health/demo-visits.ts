export type VisitStatus = "past" | "upcoming";

export type VisitReportKind =
  | "ambulatory"
  | "procedure"
  | "imaging_order"
  | "imaging_report";

export type VisitReport = {
  id: string;
  kind: VisitReportKind;
  titleLt: string;
  titleEn: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Clinic / centre where the study or note was produced */
  clinicLt?: string;
  clinicEn?: string;
  bodyLt: string;
  bodyEn: string;
};

export type VisitReferralStatus = "issued" | "completed" | "scheduled";

export type VisitReferral = {
  id: string;
  /** ISO date YYYY-MM-DD when the referral was issued */
  date: string;
  titleLt: string;
  titleEn: string;
  toSpecialtyLt: string;
  toSpecialtyEn: string;
  toPlaceLt: string;
  toPlaceEn: string;
  status: VisitReferralStatus;
  notesLt: string;
  notesEn: string;
};

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
  /** Structured clinical / procedure write-ups linked to the visit */
  reports?: VisitReport[];
  /** Referrals (siuntimai) issued from this visit */
  referrals?: VisitReferral[];
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
    referrals: [
      {
        id: "ref-cardio-echo",
        date: "2024-05-14",
        titleLt: "Siuntimas širdies echoskopijai",
        titleEn: "Referral for echocardiography",
        toSpecialtyLt: "Kardiologinė diagnostika",
        toSpecialtyEn: "Cardiac diagnostics",
        toPlaceLt: "Lyfora Heart Center",
        toPlaceEn: "Lyfora Heart Center",
        status: "completed",
        notesLt: "Įvertinti miokardo storį ir vožtuvus atsižvelgiant į lipidų riziką.",
        notesEn: "Assess wall thickness and valves given lipid risk.",
      },
    ],
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
    id: "v-2025-03-18",
    date: "2025-03-18",
    time: "10:40",
    titleLt: "Kaklo skausmo konsultacija",
    titleEn: "Neck pain consultation",
    doctorLt: "Dr. Martynas Gedvilas",
    doctorEn: "Dr. Martynas Gedvilas",
    specialtyLt: "Ortopedija–traumatologija",
    specialtyEn: "Orthopaedics–traumatology",
    placeLt: "Lyfora Spine Desk",
    placeEn: "Lyfora Spine Desk",
    status: "past",
    relatedLabDates: ["2025-03-17"],
    notesLt:
      "Ilgalaikis kaklo skausmas ir tirpimas į dešinę ranką. Prieš vizitą atlikti kraujo tyrimai (2025-03-17). Paskirtas kaklo stuburo KT ir siuntimai tolimesnei priežiūrai.",
    notesEn:
      "Long-standing neck pain with tingling into the right arm. Pre-visit blood panel (2025-03-17). Cervical spine CT and follow-up referrals ordered.",
    reports: [
      {
        id: "r-neck-ct-order",
        kind: "imaging_order",
        titleLt: "Paskyrimas: kaklo stuburo kompiuterinė tomografija (KT)",
        titleEn: "Order: cervical spine computed tomography (CT)",
        date: "2025-03-18",
        clinicLt: "Lyfora Spine Desk → siuntimas į Affidea Diagnostikos centrą (Vilnius)",
        clinicEn: "Lyfora Spine Desk → referral to Affidea Diagnostic Centre (Vilnius)",
        bodyLt: [
          "Klinika / tyrimo vieta: Affidea Diagnostikos centras, Vilnius (pagal siuntimą iš Lyfora Spine Desk).",
          "Tyrimo tipas: kaklo stuburo KT be intraveninio kontrasto.",
          "Indikacija: chroninis kaklo skausmas, parestezijos dešinėje viršutinėje galūnėje, įtariama stuburo kanalo / neuroforamenų stenozė.",
          "Segmentai: C2–Th1.",
          "Papildomai: įvertinti osteofitus, disko aukščio mažėjimą, facetinių sąnarių artrozę.",
          "Pasiruošimas: metalinių papuošalų nuėmimas; informuoti apie nėštumo galimybę.",
          "Planuojama data: 2025-03-25.",
        ].join("\n"),
        bodyEn: [
          "Clinic / study site: Affidea Diagnostic Centre, Vilnius (via referral from Lyfora Spine Desk).",
          "Study: cervical spine CT without IV contrast.",
          "Indication: chronic neck pain, right-arm paresthesia; suspected canal / foraminal stenosis.",
          "Levels: C2–Th1.",
          "Also assess osteophytes, disc-height loss, and facet arthropathy.",
          "Prep: remove metal jewellery; screen for pregnancy.",
          "Scheduled: 2025-03-25.",
        ].join("\n"),
      },
      {
        id: "r-neck-ct-report",
        kind: "imaging_report",
        titleLt: "Kaklo stuburo KT aprašymas",
        titleEn: "Cervical spine CT report",
        date: "2025-03-25",
        clinicLt: "Affidea Diagnostikos centras, Vilnius",
        clinicEn: "Affidea Diagnostic Centre, Vilnius",
        bodyLt: [
          "Atlikta: Affidea Diagnostikos centras, Vilnius. Siuntėjas: Dr. Martynas Gedvilas (Lyfora Spine Desk).",
          "Metodas: spiralinė KT, axialiniai pjūviai su sagitalinėmis ir koronalinėmis rekonstrukcijomis, be kontrasto.",
          "Išvada:",
          "• C5–C6 ir C6–C7: vidutinio laipsnio osteochondrozė, disko aukščio sumažėjimas, kraštiniai osteofitai.",
          "• Dešinėje C5–C6 neuroforameninė stenozė dėl uncinatinių ataugų hipertrofijos — atitinka klinikinius simptomus.",
          "• Stuburo kanalas išlaiko pakankamą plotį; mielopatijos požymių nėra.",
          "• Trauminių lūžių, destrukcijos ar įtartinų kaulinių masių nerasta.",
          "Rekomendacija: ortopedo / neurologo kontrolė, fizioterapija; jei simptomai progresuoja — MRT ir konsultacija dėl intervencijos.",
        ].join("\n"),
        bodyEn: [
          "Performed at: Affidea Diagnostic Centre, Vilnius. Referring clinician: Dr. Martynas Gedvilas (Lyfora Spine Desk).",
          "Method: helical CT, axial slices with sagittal and coronal reconstructions, no contrast.",
          "Impression:",
          "• C5–C6 and C6–C7: moderate osteochondrosis, disc-height loss, marginal osteophytes.",
          "• Right C5–C6 foraminal stenosis from uncovertebral hypertrophy — matches the clinical symptoms.",
          "• Spinal canal calibre preserved; no myelopathy signs.",
          "• No fractures, destructive lesions, or suspicious bone masses.",
          "Recommendation: ortho/neuro follow-up and physiotherapy; if symptoms worsen — MRI and procedural consult.",
        ].join("\n"),
      },
    ],
    referrals: [
      {
        id: "ref-neck-ct",
        date: "2025-03-18",
        titleLt: "Siuntimas kaklo stuburo KT",
        titleEn: "Referral for cervical spine CT",
        toSpecialtyLt: "Radiologija / KT",
        toSpecialtyEn: "Radiology / CT",
        toPlaceLt: "Affidea Diagnostikos centras, Vilnius",
        toPlaceEn: "Affidea Diagnostic Centre, Vilnius",
        status: "completed",
        notesLt:
          "KT be kontrasto, C2–Th1. Atlikta 2025-03-25 — žr. tyrimo aprašymą.",
        notesEn:
          "CT without contrast, C2–Th1. Completed 2025-03-25 — see imaging report.",
      },
      {
        id: "ref-neck-physio",
        date: "2025-03-18",
        titleLt: "Siuntimas fizioterapijai",
        titleEn: "Referral to physiotherapy",
        toSpecialtyLt: "Fizioterapija",
        toSpecialtyEn: "Physiotherapy",
        toPlaceLt: "Lyfora Rehab Hub",
        toPlaceEn: "Lyfora Rehab Hub",
        status: "completed",
        notesLt:
          "Kaklo mobilizacija, laikysenos korekcija, namų pratimų programa (8 vizitai).",
        notesEn:
          "Cervical mobilisation, posture work, home exercise plan (8 sessions).",
      },
      {
        id: "ref-neck-neuro",
        date: "2025-03-25",
        titleLt: "Siuntimas neurologui",
        titleEn: "Referral to neurology",
        toSpecialtyLt: "Neurologija",
        toSpecialtyEn: "Neurology",
        toPlaceLt: "Lyfora klinika, Vilnius",
        toPlaceEn: "Lyfora Clinic, Vilnius",
        status: "scheduled",
        notesLt:
          "Po KT: dešinės C5–C6 foraminalinė stenozė. Įvertinti radikulopatiją ir tolesnį planą.",
        notesEn:
          "After CT: right C5–C6 foraminal stenosis. Assess radiculopathy and next steps.",
      },
    ],
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
    id: "v-2025-08-07",
    date: "2025-08-07",
    time: "08:30",
    titleLt: "Gastroskopija (EGD)",
    titleEn: "Gastroscopy (EGD)",
    doctorLt: "Dr. Laura Šimkutė",
    doctorEn: "Dr. Laura Simkute",
    specialtyLt: "Gastroenterologija",
    specialtyEn: "Gastroenterology",
    placeLt: "Lyfora Endoskopijos kabinetas",
    placeEn: "Lyfora Endoscopy Suite",
    status: "past",
    notesLt:
      "Dėl epigastrinio diskomforto ir ankstesnio H. pylori kontakto atlikta fibroezofagogastroduodenoskopija (ryjama endoskopinė slanga).",
    notesEn:
      "For epigastric discomfort and prior H. pylori exposure — fibre-optic EGD (swallowed endoscope).",
    reports: [
      {
        id: "r-egd-report",
        kind: "procedure",
        titleLt: "Fibroezofagogastroduodenoskopijos (EGD) aprašymas",
        titleEn: "Upper endoscopy (EGD) report",
        date: "2025-08-07",
        clinicLt: "Lyfora Endoskopijos kabinetas, Vilnius",
        clinicEn: "Lyfora Endoscopy Suite, Vilnius",
        bodyLt: [
          "Atlikta: Lyfora Endoskopijos kabinetas, Vilnius. Gydytoja: Dr. Laura Šimkutė.",
          "Procedūra: diagnostinė fibroezofagogastroduodenoskopija vietinėje anestezijoje (lidokaino purškalas).",
          "Eiga: pacientas ryjo lanksčią endoskopinę slangą; apžiūrėtas stemplė, skrandis ir dvylikapirštė žarna iki D2.",
          "Stemplė: gleivinė lygi, be erozijų; Z linija aiški, be įtartinų pakitimų.",
          "Skrandis: antrumo gleivinė paraudusi, matomos paviršinės erozijos; kūne — lengva hiperemija. Biopsijos iš antrumo (×2) H. pylori ureazės / histologijai.",
          "Dvylikapirštė žarna: svogūnėlis ir D2 be opų ar stenozės.",
          "Išvada: antralinis erozinis gastritas. Kraujavimo požymių nėra.",
          "Rekomendacijos: PPI kursas 4 sav., vengti NSAID; laukti biopsijos / H. pylori atsakymo; kontrolė pagal šeimos gydytoją.",
        ].join("\n"),
        bodyEn: [
          "Performed at: Lyfora Endoscopy Suite, Vilnius. Clinician: Dr. Laura Simkute.",
          "Procedure: diagnostic fibre-optic EGD under topical lidocaine spray.",
          "Course: patient swallowed the flexible endoscope; oesophagus, stomach and duodenum to D2 inspected.",
          "Oesophagus: smooth mucosa, no erosions; Z-line clear, no suspicious changes.",
          "Stomach: antral erythema with superficial erosions; mild body hyperaemia. Antral biopsies (×2) for H. pylori urease / histology.",
          "Duodenum: bulb and D2 without ulcer or stenosis.",
          "Impression: antral erosive gastritis. No bleeding.",
          "Plan: PPI course 4 weeks, avoid NSAIDs; await biopsy / H. pylori result; GP follow-up.",
        ].join("\n"),
      },
    ],
    referrals: [
      {
        id: "ref-gastro-path",
        date: "2025-08-07",
        titleLt: "Siuntimas biopsijos histologijai",
        titleEn: "Referral for biopsy histology",
        toSpecialtyLt: "Patologija",
        toSpecialtyEn: "Pathology",
        toPlaceLt: "Lyfora Pathology Lab",
        toPlaceEn: "Lyfora Pathology Lab",
        status: "completed",
        notesLt: "Antrumo biopsijos ×2 — H. pylori / histologija.",
        notesEn: "Antral biopsies ×2 — H. pylori / histology.",
      },
      {
        id: "ref-gastro-gp",
        date: "2025-08-07",
        titleLt: "Siuntimas šeimos gydytojui (eradikacija)",
        titleEn: "Referral to family doctor (eradication)",
        toSpecialtyLt: "Šeimos medicina",
        toSpecialtyEn: "Family medicine",
        toPlaceLt: "Lyfora klinika, Vilnius",
        toPlaceEn: "Lyfora Clinic, Vilnius",
        status: "issued",
        notesLt: "Po EGD — derinti PPI ir H. pylori eradikacijos planą.",
        notesEn: "After EGD — align PPI and H. pylori eradication plan.",
      },
    ],
  },
  {
    id: "v-2025-12-08",
    date: "2025-12-08",
    time: "09:08",
    titleLt: "ŠK prevencijos programa — siuntimas kardiologui",
    titleEn: "CVD prevention programme — cardiology referral",
    doctorLt: "Dr. Paulius Rimkevičius",
    doctorEn: "Dr. Paulius Rimkevicius",
    specialtyLt: "Šeimos medicina",
    specialtyEn: "Family medicine",
    placeLt: "VšĮ „Neries sveikatos centras“",
    placeEn: "Neris Health Centre",
    status: "past",
    relatedLabDates: ["2024-05-07", "2025-12-08"],
    notesLt:
      "Specialus patikrinimas dėl širdies ir kraujagyslių sistemos (Z13.6) pagal prevencijos programą. AKS 147/80, SCORE2 rizikos planas, lipidų korekcija.",
    notesEn:
      "Special CVD screening (Z13.6) under the prevention programme. BP 147/80, SCORE2 plan, lipid correction.",
    reports: [
      {
        id: "r-cvd-prev-2025-12",
        kind: "ambulatory",
        titleLt: "E027 Išrašas / siuntimas kardiologui",
        titleEn: "E027 Extract / cardiology referral",
        date: "2025-12-08",
        clinicLt: "VšĮ „Neries sveikatos centras“, Vilnius",
        clinicEn: "Neris Health Centre, Vilnius",
        bodyLt: [
          "Siuntimas: gydytojas kardiologas (planinė).",
          "Diagnozė: Z13.6 Specialus patikrinimas dėl ŠK sutrikimų — pagal prevencijos programą.",
          "Susijusios: E78.2 Mišri hiperlipidemija; I11.9 Hipertenzinė širdies liga be SN.",
          "Objektyviai: AKS 147/80 mmHg, pulsas 67 k/min, t 36,2 °C. Širdies veikla ritmiška, tonai aiškūs.",
          "EKG: difuziniai repoliarizacijos sutrikimai.",
          "Laboratorija (orientyras): Chol ↑, MTL ↑, gliukozė ribinė, GFG lengvai ↓.",
          "Rekomendacijos: AKS ≤130/80; fizinis aktyvumas 5×/sav. 30–40 min; mažinti druską ir sočiuosius riebalus; statinų terapija (Roswera); pacientas su planu supažindintas.",
        ].join("\n"),
        bodyEn: [
          "Referral: cardiologist (planned).",
          "Diagnosis: Z13.6 Special screening for CVD — prevention programme.",
          "Related: E78.2 Mixed hyperlipidaemia; I11.9 Hypertensive heart disease without HF.",
          "Exam: BP 147/80 mmHg, HR 67, temp 36.2 °C. Regular heart sounds.",
          "ECG: diffuse repolarisation changes.",
          "Labs (context): Chol ↑, LDL ↑, borderline glucose, mild eGFR ↓.",
          "Plan: BP ≤130/80; activity 5×/week 30–40 min; reduce salt/saturated fat; statin (Roswera); patient agreed the plan.",
        ].join("\n"),
      },
    ],
    referrals: [
      {
        id: "ref-cvd-cardio-2025",
        date: "2025-12-08",
        titleLt: "Siuntimas kardiologui (prevencija)",
        titleEn: "Referral to cardiology (prevention)",
        toSpecialtyLt: "Kardiologija",
        toSpecialtyEn: "Cardiology",
        toPlaceLt: "Lyfora Heart Center",
        toPlaceEn: "Lyfora Heart Center",
        status: "completed",
        notesLt: "Pagal ŠK prevencijos programą po SCORE2 / lipidų panelės.",
        notesEn: "CVD prevention programme after SCORE2 / lipid panel.",
      },
    ],
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
    referrals: [
      {
        id: "ref-ngs-cardio",
        date: "2025-12-16",
        titleLt: "Siuntimas kardiogenetikos kontrolei",
        titleEn: "Referral for cardio-genetics follow-up",
        toSpecialtyLt: "Kardiologija",
        toSpecialtyEn: "Cardiology",
        toPlaceLt: "Lyfora Heart Center",
        toPlaceEn: "Lyfora Heart Center",
        status: "scheduled",
        notesLt: "Dėl MYBPC3 — echoskopija ir rizikos stebėsena.",
        notesEn: "For MYBPC3 — echo and risk surveillance.",
      },
    ],
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
    id: "v-2026-10-15",
    date: "2026-10-15",
    time: "13:51",
    titleLt: "Kaklo / peties skausmas — ortopedo išrašas",
    titleEn: "Neck / shoulder pain — orthopaedic extract",
    doctorLt: "Dr. Justinas Aleknavičius",
    doctorEn: "Dr. Justinas Aleknavicius",
    specialtyLt: "Ortopedija–traumatologija",
    specialtyEn: "Orthopaedics–traumatology",
    placeLt: "UAB „Gedimino judėjimo klinika“",
    placeEn: "Gediminas Motion Clinic, UAB",
    status: "past",
    relatedLabDates: ["2025-03-17"],
    notesLt:
      "Siuntimas neurologui dėl stuburo kaklinės dalies patologijos (M54.12). Skausmas plinta į dešinį petį / mentę.",
    notesEn:
      "Neurology referral for cervical spine pathology (M54.12). Pain radiating to right shoulder / scapula.",
    reports: [
      {
        id: "r-neck-ortho-2026-10",
        kind: "ambulatory",
        titleLt: "E027 Išrašas / siuntimas neurologui",
        titleEn: "E027 Extract / neurology referral",
        date: "2026-10-15",
        clinicLt: "UAB „Gedimino judėjimo klinika“, Vilnius",
        clinicEn: "Gediminas Motion Clinic, UAB, Vilnius",
        bodyLt: [
          "Siuntimas: gydytojas neurologas, planinė — konsultuoti dėl stuburo kaklinės dalies patologijos.",
          "Diagnozė: M54.12 Radikulopatija, kaklo sritis (įtariama, aktyvi).",
          "Nusiskundimai: skausmai, plintantys į dešinį petį ir mentę. Traumos neatžymi.",
          "Objektyviai: peties judesiai be žymesnio apribojimo; Spurling +/−; UG — skystis bursose, m. infraspinatus tendinozė.",
          "Vaizdinimas (kontekstas): kaklinėje dalyje osteochondrozė / spondiliozė; C3–C6 disko protruzijos; C5/C6 foraminalinės stenozės.",
          "Išvada: gydymas pagal neurologinį profilį; simptominis NSAID kursas.",
        ].join("\n"),
        bodyEn: [
          "Referral: neurologist, planned — cervical spine pathology.",
          "Diagnosis: M54.12 Cervical radiculopathy (suspected, active).",
          "Symptoms: pain radiating to right shoulder/scapula. No trauma.",
          "Exam: shoulder ROM largely preserved; Spurling +/−; US — bursal fluid, infraspinatus tendinosis.",
          "Imaging context: cervical osteochondrosis/spondylosis; C3–C6 disc protrusions; C5/C6 foraminal stenoses.",
          "Plan: neurology-led care; short symptomatic NSAID course.",
        ].join("\n"),
      },
    ],
    referrals: [
      {
        id: "ref-neck-neuro-2026",
        date: "2026-10-15",
        titleLt: "Siuntimas neurologui (kaklo radikulopatija)",
        titleEn: "Referral to neurology (cervical radiculopathy)",
        toSpecialtyLt: "Neurologija",
        toSpecialtyEn: "Neurology",
        toPlaceLt: "Lyfora klinika, Vilnius",
        toPlaceEn: "Lyfora Clinic, Vilnius",
        status: "scheduled",
        notesLt: "Po ortopedo išrašo 2026-10-15 — C3–C6 protruzijos / stenozės.",
        notesEn: "After ortho extract 2026-10-15 — C3–C6 protrusions / stenoses.",
      },
    ],
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
      "Metinė peržiūra pagal 2026-09-15 tyrimus. Teigiamas H. pylori IgG — aptartas eradikacijos planas.",
    notesEn:
      "Annual review based on 2026-09-15 labs. Positive H. pylori IgG — eradication plan discussed.",
    reports: [
      {
        id: "r-hp-ambulatory-2026",
        kind: "ambulatory",
        titleLt: "Ambulatorinio apsilankymo aprašymas (laboratorija)",
        titleEn: "Ambulatory visit note (laboratory)",
        date: "2026-09-15",
        bodyLt: [
          "Paslauga: ambulatorinės gydymo paslaugos suteikimas (apsilankymas), 2026-09-15 08:00.",
          "Diagnozė: Z01.7 Laboratorinis ištyrimas.",
          "Atlikti tyrimai: HP IgG kiekybinis — Helicobacter pylori IgG antikūnų nustatymas.",
          "Rezultatas: 1,329 (indeksas) — Teigiamas.",
          "Referentinės ribos: neigiama < 0,9; ribinė 0,9–1,1; teigiama > 1,1.",
          "Pastaba: rezultatas perduotas šeimos gydytojui tolesniam eradikacijos sprendimui.",
        ].join("\n"),
        bodyEn: [
          "Service: ambulatory visit, 2026-09-15 08:00.",
          "Diagnosis: Z01.7 Laboratory examination.",
          "Tests: quantitative HP IgG — Helicobacter pylori IgG antibodies.",
          "Result: 1.329 (index) — Positive.",
          "Reference: negative < 0.9; borderline 0.9–1.1; positive > 1.1.",
          "Note: result forwarded to the family doctor for eradication planning.",
        ].join("\n"),
      },
    ],
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

export function visitReportTitle(report: VisitReport, locale: "lt" | "en") {
  return locale === "en" ? report.titleEn : report.titleLt;
}

export function visitReportBody(report: VisitReport, locale: "lt" | "en") {
  return locale === "en" ? report.bodyEn : report.bodyLt;
}

export function visitReportKindLabel(
  kind: VisitReportKind,
  locale: "lt" | "en"
) {
  const map: Record<VisitReportKind, { lt: string; en: string }> = {
    ambulatory: { lt: "Ambulatorinis aprašymas", en: "Ambulatory note" },
    procedure: { lt: "Procedūros aprašymas", en: "Procedure report" },
    imaging_order: { lt: "Tyrimo paskyrimas", en: "Imaging order" },
    imaging_report: { lt: "Tyrimo aprašymas", en: "Imaging report" },
  };
  return locale === "en" ? map[kind].en : map[kind].lt;
}

export function visitReportClinic(report: VisitReport, locale: "lt" | "en") {
  if (!report.clinicLt && !report.clinicEn) return null;
  return locale === "en"
    ? report.clinicEn || report.clinicLt || null
    : report.clinicLt || report.clinicEn || null;
}

export function referralStatusLabel(
  status: VisitReferralStatus,
  locale: "lt" | "en"
) {
  const map: Record<VisitReferralStatus, { lt: string; en: string }> = {
    issued: { lt: "Išduotas", en: "Issued" },
    completed: { lt: "Atlikta", en: "Completed" },
    scheduled: { lt: "Suplanuota", en: "Scheduled" },
  };
  return locale === "en" ? map[status].en : map[status].lt;
}

export type ReferralListItem = VisitReferral & {
  visitId: string;
  visitTitleLt: string;
  visitTitleEn: string;
  visitDate: string;
};

/** Flatten referrals across all demo visits, newest first. */
export function allReferrals(): ReferralListItem[] {
  const rows: ReferralListItem[] = [];
  for (const v of DEMO_VISITS) {
    for (const r of v.referrals || []) {
      rows.push({
        ...r,
        visitId: v.id,
        visitTitleLt: v.titleLt,
        visitTitleEn: v.titleEn,
        visitDate: v.date,
      });
    }
  }
  return rows.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.visitDate.localeCompare(a.visitDate) ||
      a.titleLt.localeCompare(b.titleLt, "lt")
  );
}
