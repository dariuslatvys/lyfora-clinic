export type PolicyId =
  | "privacy"
  | "bdar-rights"
  | "health-data"
  | "cookies"
  | "terms"
  | "telemedicine"
  | "ai"
  | "retention";

export type PolicyDoc = {
  id: PolicyId;
  updated: string; // ISO date
  titleLt: string;
  titleEn: string;
  summaryLt: string;
  summaryEn: string;
  sections: {
    headingLt: string;
    headingEn: string;
    bodyLt: string[];
    bodyEn: string[];
  }[];
};

/** Demo clinic identity used in legal copy. */
export const PRIVACY_CONTROLLER = {
  nameLt: "Lyfora klinika, UAB",
  nameEn: "Lyfora Clinic, UAB",
  addressLt: "Gedimino pr. 1, LT-01103 Vilnius, Lietuva",
  addressEn: "Gedimino pr. 1, LT-01103 Vilnius, Lithuania",
  email: "privatumas@lyfora.lt",
  dpoEmail: "dpo@lyfora.lt",
  phone: "+370 5 200 0000",
  companyCode: "305999999",
  supervisoryLt: "Valstybinė duomenų apsaugos inspekcija (VDAI)",
  supervisoryEn: "State Data Protection Inspectorate (VDAI)",
  supervisoryUrl: "https://vdai.lrv.lt",
};

export const PRIVACY_POLICIES: PolicyDoc[] = [
  {
    id: "privacy",
    updated: "2026-11-01",
    titleLt: "Privatumo politika",
    titleEn: "Privacy Policy",
    summaryLt:
      "Kaip Lyfora tvarko jūsų asmens duomenis naudodamiesi „Mano sveikata“ platforma, įskaitant BDAR reikalavimus.",
    summaryEn:
      "How Lyfora processes your personal data when you use the “My health” platform, including GDPR requirements.",
    sections: [
      {
        headingLt: "1. Duomenų valdytojas",
        headingEn: "1. Data controller",
        bodyLt: [
          `Duomenų valdytojas: ${PRIVACY_CONTROLLER.nameLt}, įmonės kodas ${PRIVACY_CONTROLLER.companyCode}, buveinė ${PRIVACY_CONTROLLER.addressLt}.`,
          `Kontaktai: ${PRIVACY_CONTROLLER.email}, tel. ${PRIVACY_CONTROLLER.phone}.`,
          `Duomenų apsaugos pareigūnas (DAP): ${PRIVACY_CONTROLLER.dpoEmail}.`,
        ],
        bodyEn: [
          `Controller: ${PRIVACY_CONTROLLER.nameEn}, company code ${PRIVACY_CONTROLLER.companyCode}, registered office ${PRIVACY_CONTROLLER.addressEn}.`,
          `Contact: ${PRIVACY_CONTROLLER.email}, tel. ${PRIVACY_CONTROLLER.phone}.`,
          `Data Protection Officer (DPO): ${PRIVACY_CONTROLLER.dpoEmail}.`,
        ],
      },
      {
        headingLt: "2. Kokius duomenis renkame",
        headingEn: "2. What data we collect",
        bodyLt: [
          "Identifikaciniai ir kontakto duomenys: vardas, el. paštas, prisijungimo duomenys, kalbos nustatymai.",
          "Sveikatos duomenys (ypatingų kategorijų): laboratoriniai žymenys, genetikos rezultatai (SNP / NGS), diagnozės, vaistai, skiepai, vizitų ir konsultacijų įrašai, įkelti dokumentai, klausimyno atsakymai, fiziniai rodikliai.",
          "Techniniai duomenys: IP adresas, įrenginio / naršyklės tipas, sesijos identifikatoriai, žurnalai saugumo ir veikimo užtikrinimui.",
          "Integracijų duomenys (tik su jūsų sutikimu): Apple Health, Oura ir kitų prijungtų šaltinių santraukos.",
        ],
        bodyEn: [
          "Identity and contact data: name, email, login credentials, language settings.",
          "Health data (special category): laboratory markers, genetics (SNP / NGS), diagnoses, medications, vaccines, visit and consultation records, uploaded documents, questionnaire answers, physical metrics.",
          "Technical data: IP address, device / browser type, session identifiers, security and operations logs.",
          "Integration data (only with your consent): summaries from Apple Health, Oura and other connected sources.",
        ],
      },
      {
        headingLt: "3. Tikslai ir teisiniai pagrindai (BDAR)",
        headingEn: "3. Purposes and legal bases (GDPR)",
        bodyLt: [
          "Sveikatos priežiūros paslaugų teikimas ir skaitmeninio sveikatos dvynio atvaizdavimas — BDAR 6(1)(b) (sutartis / paslaugos) ir 9(2)(h) (sveikatos priežiūra), kai taikoma Lietuvos sveikatos teisė.",
          "Paskyros saugumas, sukčiavimo prevencija, sistemos veikimas — BDAR 6(1)(f) (teisėtas interesas).",
          "Teisinės prievolės (apskaita, pacientų dokumentacija) — BDAR 6(1)(c).",
          "Rinkodara, neprivalomos analitikos ir ne klinikinės integracijos — tik su jūsų sutikimu (BDAR 6(1)(a) ir, jei reikia, 9(2)(a)). Sutikimą galite bet kada atšaukti.",
        ],
        bodyEn: [
          "Providing healthcare services and rendering your digital health twin — GDPR Art. 6(1)(b) (contract / service) and Art. 9(2)(h) (healthcare), where Lithuanian health law applies.",
          "Account security, fraud prevention, platform operations — GDPR Art. 6(1)(f) (legitimate interest).",
          "Legal obligations (accounting, patient documentation) — GDPR Art. 6(1)(c).",
          "Marketing, optional analytics and non-clinical integrations — only with your consent (Art. 6(1)(a) and, where needed, Art. 9(2)(a)). You may withdraw consent at any time.",
        ],
      },
      {
        headingLt: "4. Kam teikiame duomenis",
        headingEn: "4. Who we share data with",
        bodyLt: [
          "Lyfora gydytojams ir įgaliotam klinikinio personalui, kurie dalyvauja jūsų priežiūroje.",
          "Laboratorijoms, diagnostikos partneriams ir specialistams pagal siuntimus (tik tiek, kiek reikia paslaugai).",
          "IT / debesijos ir saugumo paslaugų teikėjams kaip duomenų tvarkytojams pagal BDAR 28 str. sutartis.",
          "Institucijoms, kai to reikalauja teisės aktai. Duomenų neperduodame reklamos tinklams sveikatos duomenų pagrindu.",
        ],
        bodyEn: [
          "Lyfora clinicians and authorised clinical staff involved in your care.",
          "Laboratories, diagnostics partners and specialists under referrals (only as needed for the service).",
          "IT / cloud and security providers acting as processors under GDPR Art. 28 agreements.",
          "Public authorities when required by law. We do not sell health data to advertising networks.",
        ],
      },
      {
        headingLt: "5. Tarptautinis perdavimas",
        headingEn: "5. International transfers",
        bodyLt: [
          "Pagrindiniai duomenys saugomi EEE. Jei tvarkytojas veikia už EEE ribų, taikome Europos Komisijos standartines sutarčių sąlygas ar kitą BDAR V skyriaus mechanizmą ir informuojame apie tai pagal poreikį.",
        ],
        bodyEn: [
          "Primary data is hosted in the EEA. If a processor operates outside the EEA, we use EU Standard Contractual Clauses or another GDPR Chapter V mechanism and inform you where appropriate.",
        ],
      },
      {
        headingLt: "6. Saugumas",
        headingEn: "6. Security",
        bodyLt: [
          "Taikome prieigos kontrolę pagal roles, šifruotas sesijas (HTTPS), žurnalavimą, atsargines kopijas ir mažiausios teisės principą. Sveikatos dokumentai ir genetikos failai prieinami tik autentifikuotiems naudotojams.",
        ],
        bodyEn: [
          "We apply role-based access control, encrypted sessions (HTTPS), logging, backups and least-privilege principles. Health documents and genetics files are available only to authenticated users.",
        ],
      },
      {
        headingLt: "7. Kontaktai ir skundai",
        headingEn: "7. Contact and complaints",
        bodyLt: [
          `Klausimams rašykite ${PRIVACY_CONTROLLER.email} arba DAP ${PRIVACY_CONTROLLER.dpoEmail}.`,
          `Turite teisę pateikti skundą ${PRIVACY_CONTROLLER.supervisoryLt}: ${PRIVACY_CONTROLLER.supervisoryUrl}.`,
        ],
        bodyEn: [
          `For questions write to ${PRIVACY_CONTROLLER.email} or the DPO at ${PRIVACY_CONTROLLER.dpoEmail}.`,
          `You may lodge a complaint with the ${PRIVACY_CONTROLLER.supervisoryEn}: ${PRIVACY_CONTROLLER.supervisoryUrl}.`,
        ],
      },
    ],
  },
  {
    id: "bdar-rights",
    updated: "2026-11-01",
    titleLt: "Jūsų teisės pagal BDAR",
    titleEn: "Your rights under GDPR",
    summaryLt:
      "Trumpas BDAR 12–22 straipsnių teisių aprašymas ir kaip jomis pasinaudoti Lyforoje.",
    summaryEn:
      "A plain summary of GDPR Arts. 12–22 rights and how to exercise them with Lyfora.",
    sections: [
      {
        headingLt: "Teisė gauti informaciją ir susipažinti",
        headingEn: "Right to be informed and of access",
        bodyLt: [
          "Galite prašyti patvirtinimo, ar tvarkome jūsų duomenis, ir gauti jų kopiją (BDAR 15 str.). Platformoje dalį duomenų matote tiesiogiai (Sveikatos kortelė, Tyrimai, Duomenų įkėlimas).",
        ],
        bodyEn: [
          "You may ask whether we process your data and receive a copy (Art. 15). Much of it is already visible in the app (Health record, Labs, Data upload).",
        ],
      },
      {
        headingLt: "Teisė reikalauti ištaisyti",
        headingEn: "Right to rectification",
        bodyLt: [
          `Jei duomenys netikslūs ar neišsamūs, prašykite pataisyti (BDAR 16 str.) per kliniką arba ${PRIVACY_CONTROLLER.email}.`,
        ],
        bodyEn: [
          `If data is inaccurate or incomplete, ask for correction (Art. 16) via the clinic or ${PRIVACY_CONTROLLER.email}.`,
        ],
      },
      {
        headingLt: "Teisė reikalauti ištrinti („teisė būti pamirštam“)",
        headingEn: "Right to erasure (“right to be forgotten”)",
        bodyLt: [
          "Galite prašyti ištrinti duomenis, kai jie nebereikalingi, atšauktas sutikimas ar nėra kito teisėto pagrindo (BDAR 17 str.).",
          "Sveikatos dokumentacija, kurią privalome saugoti pagal Lietuvos medicinos teisę, gali būti saugoma ilgiau — tokiu atveju paaiškinsime priežastį.",
        ],
        bodyEn: [
          "You may request erasure when data is no longer needed, consent is withdrawn, or no other legal basis applies (Art. 17).",
          "Health documentation we must keep under Lithuanian medical law may be retained longer — we will explain why.",
        ],
      },
      {
        headingLt: "Teisė apriboti tvarkymą ir nesutikti",
        headingEn: "Right to restriction and objection",
        bodyLt: [
          "Galite prašyti laikinai apriboti tvarkymą (BDAR 18 str.) arba nesutikti su tvarkymu, grindžiamu teisėtu interesu (BDAR 21 str.), įskaitant tiesioginę rinkodarą.",
        ],
        bodyEn: [
          "You may request temporary restriction (Art. 18) or object to processing based on legitimate interest (Art. 21), including direct marketing.",
        ],
      },
      {
        headingLt: "Duomenų perkeliamumas",
        headingEn: "Data portability",
        bodyLt: [
          "Kai tvarkymas grindžiamas sutikimu ar sutartimi ir vykdomas automatizuotai, galite gauti struktūrizuotą, įprastai naudojamą, kompiuterio skaitomą duomenų kopiją (BDAR 20 str.).",
        ],
        bodyEn: [
          "Where processing is based on consent or contract and carried out by automated means, you may receive a structured, commonly used, machine-readable copy (Art. 20).",
        ],
      },
      {
        headingLt: "Kaip pateikti prašymą",
        headingEn: "How to submit a request",
        bodyLt: [
          `Rašykite ${PRIVACY_CONTROLLER.dpoEmail} arba ${PRIVACY_CONTROLLER.email}. Atsakysime per 1 mėnesį (sudėtingais atvejais — iki 3 mėn., informavę jus).`,
          "Saugumo sumetimais galime paprašyti tapatybės patvirtinimo.",
        ],
        bodyEn: [
          `Write to ${PRIVACY_CONTROLLER.dpoEmail} or ${PRIVACY_CONTROLLER.email}. We respond within 1 month (up to 3 months for complex cases, with notice).`,
          "For security we may ask you to verify your identity.",
        ],
      },
    ],
  },
  {
    id: "health-data",
    updated: "2026-11-01",
    titleLt: "Sveikatos ir genetinių duomenų tvarkymas",
    titleEn: "Health and genetic data processing",
    summaryLt:
      "Ypatingų kategorijų duomenų (įskaitant genetiką) tvarkymo taisyklės pagal BDAR 9 str.",
    summaryEn:
      "Rules for special-category data (including genetics) under GDPR Art. 9.",
    sections: [
      {
        headingLt: "Kodėl tai ypatinga kategorija",
        headingEn: "Why this is a special category",
        bodyLt: [
          "Laboratoriniai rezultatai, diagnozės, vaistai, skiepai, vaizdiniai tyrimai ir genetikos duomenys (SNP microarray, NGS / VCF) yra sveikatos duomenys pagal BDAR 9 str.",
        ],
        bodyEn: [
          "Lab results, diagnoses, medications, vaccines, imaging and genetics (SNP microarray, NGS / VCF) are health data under GDPR Art. 9.",
        ],
      },
      {
        headingLt: "Teisiniai pagrindai",
        headingEn: "Legal bases",
        bodyLt: [
          "Klinikinė priežiūra ir diagnostika — BDAR 9(2)(h) ir taikomi Lietuvos sveikatos apsaugos teisės aktai.",
          "Skaitmeninio dvynio personalizavimas, AI pagalbininkas ir neprivalomos įžvalgos — papildomas aiškus sutikimas (9(2)(a)), kurį galite atšaukti Privatumo nustatymuose.",
          "Gyvybiškai svarbūs interesai (ūmi situacija) — 9(2)(c), tik kai reikia.",
        ],
        bodyEn: [
          "Clinical care and diagnostics — GDPR Art. 9(2)(h) and applicable Lithuanian health law.",
          "Digital-twin personalisation, AI assistant and optional insights — additional explicit consent (Art. 9(2)(a)), withdrawable in Privacy settings.",
          "Vital interests in acute situations — Art. 9(2)(c), only when necessary.",
        ],
      },
      {
        headingLt: "Genetika",
        headingEn: "Genetics",
        bodyLt: [
          "SNP ir NGS rezultatai naudojami rizikos signalų ir paaiškinimų rodymui. Tai nėra diagnozė. Rezultatai matomi jums ir jūsų gydytojo komandai.",
          "Genetikos failų neperduodame trečiosioms šalims moksliniams tyrimams be atskiro rašytinio sutikimo.",
        ],
        bodyEn: [
          "SNP and NGS results are used to display risk signals and explanations. They are not a diagnosis. Results are visible to you and your care team.",
          "We do not share genetics files with third parties for research without separate written consent.",
        ],
      },
      {
        headingLt: "Įkelti dokumentai",
        headingEn: "Uploaded documents",
        bodyLt: [
          "PDF, vaizdai ir kiti failai Duomenų įkėlime saugomi jūsų profilyje. Galite juos ištrinti; klinikinės bylos kopijos, jei jau įtrauktos į medicinos dokumentaciją, gali likti pagal saugojimo terminus.",
        ],
        bodyEn: [
          "PDFs, images and other files in Data upload are stored in your profile. You may delete them; copies already filed in the medical record may remain under retention rules.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    updated: "2026-11-01",
    titleLt: "Slapukų politika",
    titleEn: "Cookie Policy",
    summaryLt:
      "Kokius slapukus ir panašias technologijas naudojame prisijungimui ir veikimui.",
    summaryEn:
      "Which cookies and similar technologies we use for login and operations.",
    sections: [
      {
        headingLt: "Būtinieji slapukai",
        headingEn: "Essential cookies",
        bodyLt: [
          "Sesijos autentifikavimo slapukas — būtinas prisijungimui prie paciento / gydytojo aplinkos. Be jo platforma neveikia.",
          "Lokalūs kalbos / UI nustatymai gali būti saugomi naršyklėje (localStorage), kad išlaikytume LT/EN pasirinkimą.",
        ],
        bodyEn: [
          "Session authentication cookie — required to access the patient / clinician environment. The platform cannot operate without it.",
          "Language / UI preferences may be stored in the browser (localStorage) to keep LT/EN selection.",
        ],
      },
      {
        headingLt: "Analitika ir rinkodara",
        headingEn: "Analytics and marketing",
        bodyLt: [
          "Šiame demo / klinikos prototipe trečiųjų šalių reklamos slapukų nenaudojame.",
          "Jei ateityje įjungsime anoniminę naudojimo statistiką, paprašysime sutikimo ir atnaujinsime šią politiką.",
        ],
        bodyEn: [
          "This demo / clinic prototype does not use third-party advertising cookies.",
          "If we enable anonymous usage analytics later, we will ask for consent and update this policy.",
        ],
      },
      {
        headingLt: "Valdymas",
        headingEn: "Controls",
        bodyLt: [
          "Būtinuosius slapukus galite blokuoti naršyklėje, bet tada prisijungimas neveiks. Neprivalomus sutikimus valdykite Privatumo nustatymuose.",
        ],
        bodyEn: [
          "You can block essential cookies in the browser, but login will stop working. Manage optional consents in Privacy settings.",
        ],
      },
    ],
  },
  {
    id: "terms",
    updated: "2026-11-01",
    titleLt: "Naudojimosi sąlygos",
    titleEn: "Terms of Use",
    summaryLt:
      "Taisyklės, kuriomis naudojatės Lyfora „Mano sveikata“ ir susijusiomis paslaugomis.",
    summaryEn:
      "Rules for using Lyfora “My health” and related services.",
    sections: [
      {
        headingLt: "Paslauga",
        headingEn: "Service",
        bodyLt: [
          "Platforma padeda peržiūrėti sveikatos duomenis, vizitus, siuntimus, konsultacijas ir marketplace pasiūlymus. Ji nepakeičia skubios medicinos pagalbos — gyvybei pavojingais atvejais skambinkite 112.",
        ],
        bodyEn: [
          "The platform helps you review health data, visits, referrals, consultations and marketplace offers. It does not replace emergency care — call 112 in life-threatening situations.",
        ],
      },
      {
        headingLt: "Jūsų atsakomybė",
        headingEn: "Your responsibilities",
        bodyLt: [
          "Saugokite prisijungimo duomenis, neteikite prieigos tretiesiems asmenims, įkelkite tik jūsų arba teisėtai turimus dokumentus.",
          "Informacija skaitmeniniame dvyne ir Ask AI atsakymai yra informacinio pobūdžio — sprendimus priima gydytojas.",
        ],
        bodyEn: [
          "Protect your credentials, do not share access, and upload only your own or lawfully held documents.",
          "Digital-twin information and Ask AI answers are informational — clinical decisions remain with your clinician.",
        ],
      },
      {
        headingLt: "Marketplace ir mokėjimai",
        headingEn: "Marketplace and payments",
        bodyLt: [
          "Marketplace kainos ir paketai yra pasiūlymai. Užsakymas gali reikalauti klinikos patvirtinimo. Apmokėjimo sąlygos pateikiamos užsakymo metu.",
        ],
        bodyEn: [
          "Marketplace prices and packages are offers. An order may require clinic confirmation. Payment terms are shown at checkout.",
        ],
      },
      {
        headingLt: "Taikytina teisė",
        headingEn: "Governing law",
        bodyLt: [
          "Sąlygoms taikoma Lietuvos Respublikos teisė. Ginčus sprendžiame derybomis; neišsprendus — kompetentingame Vilniaus teisme, jei teisės aktai nenustato kitaip.",
        ],
        bodyEn: [
          "These terms are governed by the laws of the Republic of Lithuania. Disputes are resolved amicably; otherwise by a competent Vilnius court unless mandatory law provides otherwise.",
        ],
      },
    ],
  },
  {
    id: "telemedicine",
    updated: "2026-11-01",
    titleLt: "Nuotolinių konsultacijų ir chat politika",
    titleEn: "Telemedicine and chat policy",
    summaryLt:
      "Kaip tvarkome 24/7 chat, online ir skubias nuotolines konsultacijas.",
    summaryEn:
      "How we handle 24/7 chat, online and urgent remote consultations.",
    sections: [
      {
        headingLt: "Kanalai",
        headingEn: "Channels",
        bodyLt: [
          "Galimos rašytinės konsultacijos (chat), planinės online vaizdo / telefono konsultacijos ir skubūs nuotoliniai slotai.",
        ],
        bodyEn: [
          "Written consultations (chat), planned online video / phone visits and urgent remote slots may be offered.",
        ],
      },
      {
        headingLt: "Įrašai",
        headingEn: "Records",
        bodyLt: [
          "Chat žinutės ir konsultacijų santraukos tampa medicinos dokumentacijos dalimi ir saugomos pagal sveikatos duomenų terminus.",
          "Vaizdo skambučių paprastai neįrašome; jei įrašymas būtų būtinas, prašysime atskiro sutikimo.",
        ],
        bodyEn: [
          "Chat messages and consultation summaries become part of the medical record and are kept under health-data retention rules.",
          "We generally do not record video calls; if recording were required, we would ask for separate consent.",
        ],
      },
      {
        headingLt: "Ribojimai",
        headingEn: "Limitations",
        bodyLt: [
          "Nuotolinė konsultacija netinka sunkiai ūmiai būklei. Gydytojas gali nukreipti į kontaktinį vizitą ar skubią pagalbą.",
        ],
        bodyEn: [
          "Remote consultation is not suitable for severe acute conditions. A clinician may redirect you to an in-person visit or emergency care.",
        ],
      },
    ],
  },
  {
    id: "ai",
    updated: "2026-11-01",
    titleLt: "DI / Ask AI naudojimo politika",
    titleEn: "AI / Ask AI usage policy",
    summaryLt:
      "Kaip veikia Ask AI pagalbininkas, kokie duomenys naudojami ir kokios ribos.",
    summaryEn:
      "How the Ask AI assistant works, which data it uses, and its limits.",
    sections: [
      {
        headingLt: "Paskirtis",
        headingEn: "Purpose",
        bodyLt: [
          "Ask AI padeda paprasta kalba paaiškinti jūsų žymenis, genus ir platformos turinį. Tai nėra automatinis diagnostikos sprendimas pagal BDAR 22 str.",
        ],
        bodyEn: [
          "Ask AI helps explain your markers, genes and platform content in plain language. It is not automated diagnostic decision-making under GDPR Art. 22.",
        ],
      },
      {
        headingLt: "Duomenys",
        headingEn: "Data used",
        bodyLt: [
          "Užklausai gali būti perduodamas kontekstas iš jūsų profilio (pvz. žymens reikšmė, SNP, kategorija). Atsakymai gali būti žurnaluojami kokybei ir saugumui.",
          "Nenaudojame jūsų sveikatos duomenų trečiųjų šalių modelių viešam mokymui be atskiro sutikimo.",
        ],
        bodyEn: [
          "A request may include context from your profile (e.g. marker value, SNP, category). Answers may be logged for quality and security.",
          "We do not use your health data to publicly train third-party models without separate consent.",
        ],
      },
      {
        headingLt: "Sutikimas",
        headingEn: "Consent",
        bodyLt: [
          "Ask AI sveikatos kontekste veikia su jūsų sutikimu. Galite jį išjungti Privatumo nustatymuose; tada liks tik bendriniai paaiškinimai be asmeninių duomenų.",
        ],
        bodyEn: [
          "Ask AI in a health context runs with your consent. You may disable it in Privacy settings; only generic explanations without personal data will remain.",
        ],
      },
    ],
  },
  {
    id: "retention",
    updated: "2026-11-01",
    titleLt: "Duomenų saugojimo terminai",
    titleEn: "Data retention schedule",
    summaryLt:
      "Kiek laiko saugome skirtingas duomenų kategorijas.",
    summaryEn:
      "How long we keep different categories of data.",
    sections: [
      {
        headingLt: "Sveikatos dokumentacija",
        headingEn: "Health documentation",
        bodyLt: [
          "Medicinos įrašai, laboratorija, genetika, konsultacijos — pagal Lietuvos sveikatos apsaugos reikalavimus (paprastai ne trumpiau nei teisės aktuose nustatyti terminai; orientyras 15+ metų suaugusiųjų ambulatorinei dokumentacijai, jei netaikoma kitaip).",
        ],
        bodyEn: [
          "Medical records, labs, genetics, consultations — according to Lithuanian health-law requirements (generally no shorter than statutory periods; guidance ~15+ years for adult outpatient documentation unless another rule applies).",
        ],
      },
      {
        headingLt: "Paskyra ir techniniai žurnalai",
        headingEn: "Account and technical logs",
        bodyLt: [
          "Paskyros duomenys — kol naudojatės paslauga + iki 24 mėn. po uždarymo (arba anksčiau, jei prašote ir nėra kitų prievolių).",
          "Saugumo / prieigos žurnalai — paprastai iki 12 mėn.",
        ],
        bodyEn: [
          "Account data — while you use the service + up to 24 months after closure (or earlier if you request and no other duty applies).",
          "Security / access logs — typically up to 12 months.",
        ],
      },
      {
        headingLt: "Sutikimu grindžiami duomenys",
        headingEn: "Consent-based data",
        bodyLt: [
          "Rinkodaros ir neprivalomų integracijų duomenys — kol galioja sutikimas; atšaukus — ištriname ar anonimizuojame per 30 dienų, jei nereikia saugoti ginčui / teisinei prievolei.",
        ],
        bodyEn: [
          "Marketing and optional integration data — for as long as consent is valid; after withdrawal we delete or anonymise within 30 days unless needed for a dispute or legal duty.",
        ],
      },
    ],
  },
];

export function getPolicy(id: string): PolicyDoc | undefined {
  return PRIVACY_POLICIES.find((p) => p.id === id);
}
