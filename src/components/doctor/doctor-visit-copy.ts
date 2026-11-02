export type DoctorVisitCopy = {
  create: string;
  save: string;
  cancel: string;
  patient: string;
  patientSearch: string;
  patientHint: string;
  noPatients: string;
  time: string;
  freeTimes: string;
  noSlots: string;
  reason: string;
  reasonHint: string;
  attach: string;
  attachHint: string;
  removeFile: string;
  mode: string;
  videoLinks: string;
  clearPatient: string;
  backDay: string;
  detail: string;
  source: string;
  referral: string;
  selfPhone: string;
  selfPortal: string;
  selfWalkIn: string;
  doctorCreated: string;
  openPdf: string;
  openFile: string;
  referringDoctor: string;
  institution: string;
  specialty: string;
  purpose: string;
  reasonWhy: string;
  diagnosis: string;
  complaints: string;
  anamnesis: string;
  registeredAt: string;
  receivedBy: string;
  chart: string;
  contact: string;
  phone: string;
  email: string;
  documents: string;
  noDocuments: string;
  attachments: string;
};

export function doctorVisitCopy(locale: "lt" | "en"): DoctorVisitCopy {
  return locale === "en"
    ? {
        create: "New visit",
        save: "Save visit",
        cancel: "Cancel",
        patient: "Patient",
        patientSearch:
          "Search by name, phone, email, personal code or date of birth…",
        patientHint: "Type at least 2 characters — fragment match.",
        noPatients: "No patients match.",
        time: "Time",
        freeTimes: "Available times",
        noSlots: "No free times left on this day.",
        reason: "Reason",
        reasonHint: "Visit reason, complaints or preparation notes…",
        attach: "Attach file",
        attachHint: "PDF, image or document — stored as demo metadata only.",
        removeFile: "Remove",
        mode: "Mode",
        videoLinks: "Video link",
        clearPatient: "Change",
        backDay: "Back",
        detail: "Visit details",
        source: "How booked",
        referral: "Referral",
        selfPhone: "Phone registration",
        selfPortal: "Portal registration",
        selfWalkIn: "Walk-in",
        doctorCreated: "Created in calendar",
        openPdf: "Open referral PDF",
        openFile: "Open",
        referringDoctor: "Referring clinician",
        institution: "Institution",
        specialty: "To specialty",
        purpose: "Purpose",
        reasonWhy: "Reason",
        diagnosis: "Diagnosis",
        complaints: "Complaints",
        anamnesis: "History",
        registeredAt: "Registered",
        receivedBy: "Received by",
        chart: "Chart",
        contact: "Contact",
        phone: "Phone",
        email: "Email",
        documents: "Documents",
        noDocuments: "No referrals, extracts or other documents on this visit.",
        attachments: "Attached files",
      }
    : {
        create: "Naujas vizitas",
        save: "Išsaugoti vizitą",
        cancel: "Atšaukti",
        patient: "Pacientas",
        patientSearch:
          "Ieškoti pagal vardą, pavardę, telefoną, el. paštą, asmens kodą ar gimimo datą…",
        patientHint: "Įveskite bent 2 simbolius — veikia fragmentinė paieška.",
        noPatients: "Pacientų nerasta.",
        time: "Laikas",
        freeTimes: "Laisvi laikai",
        noSlots: "Šią dieną laisvų laikų neliko.",
        reason: "Priežastis",
        reasonHint: "Vizito priežastis, nusiskundimai ar pasiruošimo pastabos…",
        attach: "Prikabinti failą",
        attachHint: "PDF, nuotrauka ar dokumentas — demo režime saugomas tik pavadinimas.",
        removeFile: "Pašalinti",
        mode: "Būdas",
        videoLinks: "Vaizdo nuoroda",
        clearPatient: "Keisti",
        backDay: "Atgal",
        detail: "Vizito detalės",
        source: "Kaip užregistruota",
        referral: "Siuntimas",
        selfPhone: "Registracija telefonu",
        selfPortal: "Registracija portale",
        selfWalkIn: "Atėjo be registracijos",
        doctorCreated: "Sukurta kalendoriuje",
        openPdf: "Atidaryti siuntimo PDF",
        openFile: "Atidaryti",
        referringDoctor: "Siuntęs gydytojas",
        institution: "Įstaiga",
        specialty: "Kam siunčiama",
        purpose: "Paskirtis",
        reasonWhy: "Dėl ko",
        diagnosis: "Diagnozė",
        complaints: "Nusiskundimai",
        anamnesis: "Anamnezė",
        registeredAt: "Užregistruota",
        receivedBy: "Priėmė",
        chart: "Kortelė",
        contact: "Kontaktai",
        phone: "Telefonas",
        email: "El. paštas",
        documents: "Dokumentai",
        noDocuments: "Šiame vizite siuntimų, išrašų ar kitų dokumentų nėra.",
        attachments: "Prikabinti failai",
      };
}
