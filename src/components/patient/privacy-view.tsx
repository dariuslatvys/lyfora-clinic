"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PRIVACY_CONTROLLER,
  PRIVACY_POLICIES,
  type PolicyId,
} from "@/lib/privacy/policies";

type PrefKey =
  | "careRecord"
  | "essentialCookies"
  | "aiHealth"
  | "twinPersonalise"
  | "acmgSecondary"
  | "integrations"
  | "wearables"
  | "telemedicineChat"
  | "marketplaceOffers"
  | "emailNews"
  | "smsReminders"
  | "phoneMarketing"
  | "qualityImprove"
  | "research"
  | "partnerReferrals";

type PrefMeta = {
  key: PrefKey;
  required?: boolean;
  defaultOn: boolean;
  group: "required" | "care" | "digital" | "comms" | "research";
};

const PREF_META: PrefMeta[] = [
  { key: "careRecord", required: true, defaultOn: true, group: "required" },
  { key: "essentialCookies", required: true, defaultOn: true, group: "required" },
  { key: "aiHealth", defaultOn: true, group: "digital" },
  { key: "twinPersonalise", defaultOn: true, group: "digital" },
  { key: "acmgSecondary", defaultOn: false, group: "digital" },
  { key: "integrations", defaultOn: true, group: "care" },
  { key: "wearables", defaultOn: true, group: "care" },
  { key: "telemedicineChat", defaultOn: true, group: "care" },
  { key: "partnerReferrals", defaultOn: true, group: "care" },
  { key: "marketplaceOffers", defaultOn: false, group: "comms" },
  { key: "emailNews", defaultOn: false, group: "comms" },
  { key: "smsReminders", defaultOn: true, group: "comms" },
  { key: "phoneMarketing", defaultOn: false, group: "comms" },
  { key: "qualityImprove", defaultOn: true, group: "research" },
  { key: "research", defaultOn: false, group: "research" },
];

const DEFAULT_PREFS: Record<PrefKey, boolean> = Object.fromEntries(
  PREF_META.map((p) => [p.key, p.defaultOn])
) as Record<PrefKey, boolean>;

type ClinicDoctor = {
  id: string;
  nameLt: string;
  nameEn: string;
  specLt: string;
  specEn: string;
  initials: string;
  defaultOn: boolean;
};

const CLINIC_DOCTORS: ClinicDoctor[] = [
  {
    id: "d1",
    nameLt: "Dr. Laura Mockutė",
    nameEn: "Dr Laura Mockutė",
    specLt: "Šeimos gydytoja",
    specEn: "Family physician",
    initials: "LM",
    defaultOn: true,
  },
  {
    id: "d2",
    nameLt: "Dr. Andrius Stankevičius",
    nameEn: "Dr Andrius Stankevičius",
    specLt: "Kardiologas",
    specEn: "Cardiologist",
    initials: "AS",
    defaultOn: true,
  },
  {
    id: "d3",
    nameLt: "Dr. Ieva Grigaitė",
    nameEn: "Dr Ieva Grigaitė",
    specLt: "Endokrinologė",
    specEn: "Endocrinologist",
    initials: "IG",
    defaultOn: false,
  },
  {
    id: "d4",
    nameLt: "Dr. Paulius Rimkus",
    nameEn: "Dr Paulius Rimkus",
    specLt: "Klinikinis genetikas",
    specEn: "Clinical geneticist",
    initials: "PR",
    defaultOn: true,
  },
  {
    id: "d5",
    nameLt: "Neringa Bielskė",
    nameEn: "Neringa Bielskė",
    specLt: "Dietologė",
    specEn: "Dietitian",
    initials: "NB",
    defaultOn: true,
  },
  {
    id: "d6",
    nameLt: "Dr. Vytautas Lukoševičius",
    nameEn: "Dr Vytautas Lukoševičius",
    specLt: "Budintis gydytojas 24/7",
    specEn: "On-call doctor 24/7",
    initials: "VL",
    defaultOn: true,
  },
  {
    id: "d7",
    nameLt: "Simona Adomaitė",
    nameEn: "Simona Adomaitė",
    specLt: "Kineziterapeutė",
    specEn: "Physiotherapist",
    initials: "SA",
    defaultOn: true,
  },
];

type PendingConsent = {
  id: string;
  titleLt: string;
  titleEn: string;
  fromLt: string;
  fromEn: string;
  detailLt: string;
  detailEn: string;
  requestedAt: string;
  scopeLt: string;
  scopeEn: string;
};

const DEMO_PENDING: PendingConsent[] = [
  {
    id: "pend-genetics-share",
    titleLt: "Dalijimasis genetikos rezultatais su genetiku",
    titleEn: "Share genetics results with a geneticist",
    fromLt: "dr. Eglė Navickienė · genetika",
    fromEn: "Dr Eglė Navickienė · genetics",
    detailLt:
      "Prašoma matyti jūsų SNP / NGS santrauką prieš planuojamą genetiko konsultaciją.",
    detailEn:
      "Request to view your SNP / NGS summary before a planned genetics consult.",
    requestedAt: "2026-10-28",
    scopeLt: "Genetika · 30 dienų",
    scopeEn: "Genetics · 30 days",
  },
  {
    id: "pend-lab-partner",
    titleLt: "Siuntimo laboratorijos prieiga prie lipidų panelės",
    titleEn: "Referral lab access to lipid panel",
    fromLt: "Affidea laboratorija · siuntimas #SR-2026-118",
    fromEn: "Affidea lab · referral #SR-2026-118",
    detailLt:
      "Partneris prašo gauti tik lipidų ir Lp(a) rezultatus mėginio paėmimui.",
    detailEn:
      "Partner asks for lipid and Lp(a) results only, for sample collection.",
    requestedAt: "2026-10-30",
    scopeLt: "Tyrimai · vienkartinė",
    scopeEn: "Labs · one-time",
  },
  {
    id: "pend-research",
    titleLt: "Nuasmenintas kardiometabolinis tyrimas",
    titleEn: "De-identified cardiometabolic study",
    fromLt: "VU Gyvybės mokslų centras",
    fromEn: "VU Life Sciences Centre",
    detailLt:
      "Etikos komiteto patvirtintas tyrimas — be vardo, be žalių genetikos failų.",
    detailEn:
      "Ethics-approved study — no name, no raw genetics files.",
    requestedAt: "2026-10-22",
    scopeLt: "Tyrimai · 12 mėn.",
    scopeEn: "Research · 12 mo.",
  },
];

type LocaleCopy = { t: string; d: string; basis: string };

type GeneticsShare = "me" | "doctors";

function prefsStorageKey(patientHint: string) {
  return `lyfora-privacy-prefs:v3:${patientHint}`;
}

function doctorsStorageKey(patientHint: string) {
  return `lyfora-privacy-doctors:v1:${patientHint}`;
}

function geneticsStorageKey(patientHint: string) {
  return `lyfora-privacy-genetics:v1:${patientHint}`;
}

function Switch({
  on,
  locked,
  label,
  onLabel,
  offLabel,
  onClick,
}: {
  on: boolean;
  locked?: boolean;
  label: string;
  onLabel: string;
  offLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`privacy-switch${on ? " on" : ""}${locked ? " locked" : ""}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      onClick={onClick}
    >
      <span className="privacy-switch-knob" />
      <span className="privacy-switch-text">{on ? onLabel : offLabel}</span>
    </button>
  );
}

export function PrivacyView({
  locale,
  patientHint = "demo",
}: {
  locale: "lt" | "en";
  patientHint?: string;
}) {
  type PrivacyTab =
    | "pending"
    | "doctors"
    | "granted"
    | "data"
    | "policies";

  const [tab, setTab] = useState<PrivacyTab>("pending");
  const [active, setActive] = useState<PolicyId>("privacy");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, setPending] = useState<PendingConsent[]>(DEMO_PENDING);
  const [pendingFlash, setPendingFlash] = useState<string | null>(null);
  const [doctorAccess, setDoctorAccess] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(CLINIC_DOCTORS.map((d) => [d.id, d.defaultOn]))
  );
  const [geneticsShare, setGeneticsShare] = useState<GeneticsShare>("doctors");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(prefsStorageKey(patientHint));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<PrefKey, boolean>>;
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
      const docs = localStorage.getItem(doctorsStorageKey(patientHint));
      if (docs) {
        const parsed = JSON.parse(docs) as Record<string, boolean>;
        setDoctorAccess((prev) => ({ ...prev, ...parsed }));
      }
      const gen = localStorage.getItem(geneticsStorageKey(patientHint));
      if (gen === "me" || gen === "doctors") setGeneticsShare(gen);
    } catch {
      /* ignore */
    }
  }, [patientHint]);

  const labels = useMemo(() => {
    const en: Record<PrefKey, LocaleCopy> = {
      careRecord: {
        t: "Healthcare & medical record",
        d: "Process health data to provide care, show your twin, labs, visits and prescriptions. Required for the clinic service.",
        basis: "GDPR Art. 6(1)(b) · 9(2)(h)",
      },
      essentialCookies: {
        t: "Essential cookies & login session",
        d: "Keep you signed in securely and remember language. Without this the portal cannot work.",
        basis: "GDPR Art. 6(1)(f)",
      },
      aiHealth: {
        t: "Ask AI with my health context",
        d: "Allow Ask AI to use markers, genes and visit context for personalised plain-language answers. Not a diagnosis.",
        basis: "Consent · Art. 6(1)(a) / 9(2)(a)",
      },
      twinPersonalise: {
        t: "Personalise digital twin from questionnaire",
        d: "Use lifestyle and physical answers (BP, sleep, activity) to colour categories and goals.",
        basis: "Consent · Art. 6(1)(a) / 9(2)(a)",
      },
      acmgSecondary: {
        t: "Show ACMG secondary genetic findings",
        d: "If ordered, display pathogenic / likely pathogenic secondary findings outside the primary indication.",
        basis: "Explicit consent · Art. 9(2)(a)",
      },
      integrations: {
        t: "Health apps (Apple Health, Google Fit…)",
        d: "Sync summaries from connected health apps into Integrations and the twin.",
        basis: "Consent · Art. 6(1)(a) / 9(2)(a)",
      },
      wearables: {
        t: "Watches, bands & rings (Oura, Garmin…)",
        d: "Import HRV, sleep, activity and recovery metrics from wearables you connect.",
        basis: "Consent · Art. 6(1)(a) / 9(2)(a)",
      },
      telemedicineChat: {
        t: "Store telemedicine & chat history",
        d: "Keep online consult notes and doctor chat threads in your medical record for continuity of care.",
        basis: "Care · Art. 9(2)(h)",
      },
      partnerReferrals: {
        t: "Share data with referral partners",
        d: "Send only necessary data to labs, imaging centres and specialists named on your referral.",
        basis: "Care · Art. 9(2)(h)",
      },
      marketplaceOffers: {
        t: "Personalised Marketplace suggestions",
        d: "Suggest lab packages, genetics panels or wellness based on your open goals (not ads to third parties).",
        basis: "Consent · Art. 6(1)(a)",
      },
      emailNews: {
        t: "Email: news & wellness offers",
        d: "Occasional emails about new packages, SPA / dietitian offers and clinic news. Not clinical alerts.",
        basis: "Consent · Art. 6(1)(a)",
      },
      smsReminders: {
        t: "SMS / push: visit & prescription reminders",
        d: "Reminders for booked visits, refill windows and sample collection — service messages, not marketing.",
        basis: "Consent · Art. 6(1)(a)",
      },
      phoneMarketing: {
        t: "Phone calls about commercial offers",
        d: "Clinic may call about paid packages or campaigns. Off by default.",
        basis: "Consent · Art. 6(1)(a)",
      },
      qualityImprove: {
        t: "Anonymised quality improvement",
        d: "Use de-identified statistics to improve pathways, twin colouring and UX. No genetics files.",
        basis: "Consent · Art. 6(1)(a)",
      },
      research: {
        t: "Scientific research (de-identified)",
        d: "Allow de-identified data in ethics-approved studies. Genetics raw files never without a separate written consent.",
        basis: "Consent · Art. 9(2)(a) / 89",
      },
    };

    const lt: Record<PrefKey, LocaleCopy> = {
      careRecord: {
        t: "Gydymas ir medicinos dokumentacija",
        d: "Tvarkyti sveikatos duomenis priežiūrai, skaitmeniniam dvyniui, tyrimams, vizitams ir receptams. Būtina klinikos paslaugai.",
        basis: "BDAR 6(1)(b) · 9(2)(h)",
      },
      essentialCookies: {
        t: "Būtinieji slapukai ir prisijungimo sesija",
        d: "Saugiai palaikyti prisijungimą ir kalbos pasirinkimą. Be to portalas neveikia.",
        basis: "BDAR 6(1)(f)",
      },
      aiHealth: {
        t: "Ask AI su mano sveikatos kontekstu",
        d: "Leisti Ask AI naudoti žymenis, genus ir vizitų kontekstą asmeniniams paaiškinimams. Tai nėra diagnozė.",
        basis: "Sutikimas · 6(1)(a) / 9(2)(a)",
      },
      twinPersonalise: {
        t: "Personalizuoti skaitmeninį dvynį pagal klausimyną",
        d: "Naudoti gyvensenos ir fizinius atsakymus (AKS, miegas, aktyvumas) kategorijų spalvoms ir tikslams.",
        basis: "Sutikimas · 6(1)(a) / 9(2)(a)",
      },
      acmgSecondary: {
        t: "Rodyti ACMG antrinius genetikos radinius",
        d: "Jei užsakyta — rodyti patogeninius / tikėtinai patogeninius antrinius radinius už pagrindinės indikacijos ribų.",
        basis: "Aiškus sutikimas · 9(2)(a)",
      },
      integrations: {
        t: "Sveikatos programėlės (Apple Health, Google Fit…)",
        d: "Sinchronizuoti santraukas iš prijungtų programėlių į Integracijas ir dvynį.",
        basis: "Sutikimas · 6(1)(a) / 9(2)(a)",
      },
      wearables: {
        t: "Laikrodžiai, apyrankės ir žiedai (Oura, Garmin…)",
        d: "Importuoti HRV, miego, aktyvumo ir atsigavimo rodiklius iš prijungtų įrenginių.",
        basis: "Sutikimas · 6(1)(a) / 9(2)(a)",
      },
      telemedicineChat: {
        t: "Saugoti telemedicinos ir chat istoriją",
        d: "Laikyti online konsultacijų pastabas ir pokalbius su gydytoju medicinos dokumentacijoje.",
        basis: "Priežiūra · 9(2)(h)",
      },
      partnerReferrals: {
        t: "Dalytis duomenimis su siuntimo partneriais",
        d: "Siųsti tik būtinus duomenis laboratorijoms, vaizdinimui ir specialistams pagal jūsų siuntimą.",
        basis: "Priežiūra · 9(2)(h)",
      },
      marketplaceOffers: {
        t: "Asmeniniai Marketplace pasiūlymai",
        d: "Siūlyti tyrimų paketus, genetikos skydelius ar sveikatingumą pagal jūsų tikslus (ne reklama tretiesiems).",
        basis: "Sutikimas · 6(1)(a)",
      },
      emailNews: {
        t: "El. paštas: naujienos ir sveikatingumo pasiūlymai",
        d: "Retkarčiais laiškai apie paketus, SPA / dietologą ir klinikos naujienas. Ne klinikiniai pranešimai.",
        basis: "Sutikimas · 6(1)(a)",
      },
      smsReminders: {
        t: "SMS / push: vizitų ir receptų priminimai",
        d: "Priminimai apie vizitus, receptų pratęsimą ir mėginių paėmimą — paslaugos žinutės, ne rinkodara.",
        basis: "Sutikimas · 6(1)(a)",
      },
      phoneMarketing: {
        t: "Skambučiai dėl komercinių pasiūlymų",
        d: "Klinika gali skambinti dėl mokamų paketų ar akcijų. Pagal nutylėjimą išjungta.",
        basis: "Sutikimas · 6(1)(a)",
      },
      qualityImprove: {
        t: "Anonimizuotas kokybės gerinimas",
        d: "Nuasmeninta statistika keliams, dvynio spalvoms ir UX tobulinti. Be genetikos failų.",
        basis: "Sutikimas · 6(1)(a)",
      },
      research: {
        t: "Moksliniai tyrimai (nuasmeninti)",
        d: "Leisti nuasmenintus duomenis etikos komiteto patvirtintuose tyrimuose. Žali genetikos failai — tik su atskiru raštišku sutikimu.",
        basis: "Sutikimas · 9(2)(a) / 89",
      },
    };

    return locale === "en" ? en : lt;
  }, [locale]);

  const groups = useMemo(() => {
    const defs =
      locale === "en"
        ? {
            required: {
              title: "Required for the service",
              blurb: "Cannot be turned off while you use Lyfora care.",
            },
            care: {
              title: "Care & connected data",
              blurb: "How we exchange data for treatment, referrals and devices.",
            },
            digital: {
              title: "Digital twin & AI",
              blurb: "Optional personalisation layers on top of clinical care.",
            },
            comms: {
              title: "Messages & offers",
              blurb: "How we may contact you outside urgent clinical care.",
            },
            research: {
              title: "Quality & research",
              blurb: "Only de-identified use unless you give a separate genetics consent.",
            },
          }
        : {
            required: {
              title: "Būtina paslaugai",
              blurb: "Kol naudojatės Lyfora priežiūra — šių sutikimų išjungti negalima.",
            },
            care: {
              title: "Priežiūra ir prijungti duomenys",
              blurb: "Kaip dalijamės duomenimis gydymui, siuntimams ir įrenginiams.",
            },
            digital: {
              title: "Skaitmeninis dvynys ir DI",
              blurb: "Neprivalomi personalizavimo sluoksniai virš klinikinės priežiūros.",
            },
            comms: {
              title: "Žinutės ir pasiūlymai",
              blurb: "Kaip galime susisiekti ne skubios klinikinės priežiūros klausimais.",
            },
            research: {
              title: "Kokybė ir tyrimai",
              blurb: "Tik nuasmenintai, nebent atskirai sutiksite dėl genetikos failų.",
            },
          };
    return (["required", "care", "digital", "comms", "research"] as const).map(
      (id) => ({
        id,
        ...defs[id],
        items: PREF_META.filter((p) => p.group === id),
      })
    );
  }, [locale]);

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Legal & GDPR",
            title: "Privacy",
            blurb:
              "Switch between pending requests, clinician access, granted consents, enabled data and full policy texts.",
            tabPending: "Pending",
            tabDoctors: "Clinicians",
            tabGranted: "Granted",
            tabData: "Enabled data",
            tabPolicies: "Policies",
            docs: "Policy documents",
            updated: "Updated",
            dataTitle: "Enabled data",
            dataBlurb:
              "Turn optional data uses on or off. Required items stay on for care.",
            grantedTitle: "Granted consents",
            grantedBlurb:
              "What is currently allowed. Turn any optional item off here or in Enabled data.",
            grantedEmpty: "No optional consents are on yet.",
            doctorsTitle: "Consents for specific clinicians",
            doctorsBlurb:
              "Choose which Lyfora specialists may open your health record. Genetics has a separate visibility setting below.",
            geneticsTitle: "Genetic data visibility",
            geneticsBlurb:
              "DNA results sit in a separate store. Choose who can see them.",
            geneticsMe: "Only me",
            geneticsDoctors: "Me and my clinicians",
            save: "Save settings",
            saved: "Settings saved",
            contact: "Contact DPO",
            on: "On",
            off: "Off",
            required: "Required",
            granted: "granted",
            of: "of",
            acceptOptional: "Accept all optional",
            rejectOptional: "Reject optional",
            revoke: "Revoke",
            pendingTitle: "Consents awaiting approval",
            pendingBlurb:
              "Partners or clinicians asked for extra access. Approve or decline each request.",
            pendingEmpty: "No pending requests",
            pendingApprove: "Approve",
            pendingDecline: "Decline",
            pendingApproved: "Approved",
            pendingDeclined: "Declined",
            pendingRequested: "Requested",
            pendingFrom: "From",
            doctorsOn: "with access",
          }
        : {
            eyebrow: "Teisinė info ir BDAR",
            title: "Privatumas",
            blurb:
              "Perjunkite tarp laukiančių prašymų, gydytojų prieigos, suteiktų sutikimų, įjungtų duomenų ir politikų tekstų.",
            tabPending: "Laukiantys",
            tabDoctors: "Gydytojai",
            tabGranted: "Suteikti",
            tabData: "Įjungti duomenys",
            tabPolicies: "Politikos",
            docs: "Politikų dokumentai",
            updated: "Atnaujinta",
            dataTitle: "Įjungti duomenys",
            dataBlurb:
              "Įjunkite arba išjunkite neprivalomus duomenų naudojimus. Būtini lieka įjungti gydymui.",
            grantedTitle: "Suteikti sutikimai",
            grantedBlurb:
              "Kas šiuo metu leidžiama. Bet kurį neprivalomą galite atšaukti čia arba skirtuke „Įjungti duomenys“.",
            grantedEmpty: "Kol kas nėra įjungtų neprivalomų sutikimų.",
            doctorsTitle: "Sutikimai konkretiems gydytojams",
            doctorsBlurb:
              "Pasirinkite, kurie Lyfora specialistai gali atidaryti jūsų sveikatos kortelę. Genetikai — atskiras matomumas žemiau.",
            geneticsTitle: "Genetinių duomenų matomumas",
            geneticsBlurb:
              "DNR rezultatai laikomi atskiroje saugykloje. Pasirinkite, kas juos mato.",
            geneticsMe: "Tik aš",
            geneticsDoctors: "Aš ir mano gydytojai",
            save: "Išsaugoti nustatymus",
            saved: "Nustatymai išsaugoti",
            contact: "Rašyti DAP",
            on: "Įjungta",
            off: "Išjungta",
            required: "Būtina",
            granted: "suteikta",
            of: "iš",
            acceptOptional: "Sutikti su visais neprivalomais",
            rejectOptional: "Atmesti neprivalomus",
            revoke: "Atšaukti",
            pendingTitle: "Laukiančių patvirtinimo sutikimai",
            pendingBlurb:
              "Partneriai ar gydytojai paprašė papildomos prieigos. Kiekvieną užklausą patvirtinkite arba atmeskite.",
            pendingEmpty: "Laukiančių užklausų nėra",
            pendingApprove: "Patvirtinti",
            pendingDecline: "Atmesti",
            pendingApproved: "Patvirtinta",
            pendingDeclined: "Atmesta",
            pendingRequested: "Prašyta",
            pendingFrom: "Kas prašo",
            doctorsOn: "su prieiga",
          },
    [locale]
  );

  const doc = PRIVACY_POLICIES.find((p) => p.id === active) || PRIVACY_POLICIES[0];
  const optionalKeys = PREF_META.filter((p) => !p.required).map((p) => p.key);
  const grantedOptional = optionalKeys.filter((k) => prefs[k]);
  const doctorsOnCount = CLINIC_DOCTORS.filter((d) => doctorAccess[d.id]).length;

  function setPref(key: PrefKey, value: boolean) {
    const meta = PREF_META.find((p) => p.key === key);
    if (meta?.required) return;
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function persistAll(
    nextPrefs = prefs,
    nextDocs = doctorAccess,
    nextGen = geneticsShare
  ) {
    localStorage.setItem(prefsStorageKey(patientHint), JSON.stringify(nextPrefs));
    localStorage.setItem(doctorsStorageKey(patientHint), JSON.stringify(nextDocs));
    localStorage.setItem(geneticsStorageKey(patientHint), nextGen);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  }

  function saveAll() {
    persistAll();
  }

  function setAllOptional(on: boolean) {
    setPrefs((prev) => {
      const next = { ...prev };
      for (const k of optionalKeys) next[k] = on;
      return next;
    });
  }

  function resolvePending(id: string, approved: boolean) {
    setPending((list) => list.filter((p) => p.id !== id));
    setPendingFlash(approved ? copy.pendingApproved : copy.pendingDeclined);
    window.setTimeout(() => setPendingFlash(null), 2200);
  }

  function toggleDoctor(id: string) {
    setDoctorAccess((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const privacyTabs: { id: PrivacyTab; label: string; count?: number }[] = [
    { id: "pending", label: copy.tabPending, count: pending.length },
    { id: "doctors", label: copy.tabDoctors, count: doctorsOnCount },
    {
      id: "granted",
      label: copy.tabGranted,
      count: grantedOptional.length,
    },
    { id: "data", label: copy.tabData },
    { id: "policies", label: copy.tabPolicies, count: PRIVACY_POLICIES.length },
  ];

  return (
    <div className="stack privacy-page" style={{ gap: 16 }}>
      <header>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
          {copy.blurb}
        </p>
        <p className="small muted mt-2 mb-0">
          {locale === "en" ? "Controller" : "Valdytojas"}:{" "}
          {locale === "en"
            ? PRIVACY_CONTROLLER.nameEn
            : PRIVACY_CONTROLLER.nameLt}{" "}
          · {PRIVACY_CONTROLLER.dpoEmail}
        </p>
      </header>

      <div
        className="tabs visits-tabs privacy-tabs"
        role="tablist"
        aria-label={copy.title}
      >
        {privacyTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className={tab === t.id ? "on" : undefined}
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {typeof t.count === "number" ? (
              <span className="visits-tab-count">{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "pending" ? (
        <section className="card privacy-block privacy-pending">
          <div className="card-head" style={{ alignItems: "flex-start" }}>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
                {copy.pendingTitle}
              </h2>
              <p className="small muted mt-1 mb-0">{copy.pendingBlurb}</p>
            </div>
            <div className="privacy-pref-summary">
              {pendingFlash ? (
                <span className="pill c-green">{pendingFlash}</span>
              ) : (
                <span className="pill plain c-yellow">{pending.length}</span>
              )}
            </div>
          </div>
          {pending.length === 0 ? (
            <p className="small muted m-0">{copy.pendingEmpty}</p>
          ) : (
            <div className="privacy-pending-list">
              {pending.map((item) => (
                <article key={item.id} className="privacy-pending-item">
                  <div className="privacy-pending-copy">
                    <div className="privacy-pending-title">
                      <b>{locale === "en" ? item.titleEn : item.titleLt}</b>
                      <span className="pill plain c-yellow">
                        {locale === "en" ? item.scopeEn : item.scopeLt}
                      </span>
                    </div>
                    <p className="privacy-pref-desc">
                      {locale === "en" ? item.detailEn : item.detailLt}
                    </p>
                    <p className="privacy-pref-basis">
                      {copy.pendingFrom}:{" "}
                      {locale === "en" ? item.fromEn : item.fromLt} ·{" "}
                      {copy.pendingRequested} {item.requestedAt}
                    </p>
                  </div>
                  <div className="privacy-pending-actions">
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => resolvePending(item.id, true)}
                    >
                      {copy.pendingApprove}
                    </button>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => resolvePending(item.id, false)}
                    >
                      {copy.pendingDecline}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {tab === "doctors" ? (
        <section className="card privacy-block privacy-doctors">
          <div className="card-head" style={{ alignItems: "flex-start" }}>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
                {copy.doctorsTitle}
              </h2>
              <p className="small muted mt-1 mb-0">{copy.doctorsBlurb}</p>
            </div>
            <span className="pill plain c-acc">
              {doctorsOnCount} {copy.of} {CLINIC_DOCTORS.length}{" "}
              {copy.doctorsOn}
            </span>
          </div>
          <div className="privacy-doctor-list">
            {CLINIC_DOCTORS.map((d) => {
              const on = !!doctorAccess[d.id];
              return (
                <div
                  key={d.id}
                  className={`privacy-doctor-row${on ? " on" : ""}`}
                >
                  <div className="privacy-doctor-av" aria-hidden>
                    {d.initials}
                  </div>
                  <div className="privacy-doctor-copy">
                    <b>{locale === "en" ? d.nameEn : d.nameLt}</b>
                    <span className="small muted">
                      {locale === "en" ? d.specEn : d.specLt}
                    </span>
                  </div>
                  <Switch
                    on={on}
                    label={locale === "en" ? d.nameEn : d.nameLt}
                    onLabel={copy.on}
                    offLabel={copy.off}
                    onClick={() => toggleDoctor(d.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="privacy-genetics">
            <div className="privacy-pref-group-head">
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold m-0">
                {copy.geneticsTitle}
              </h3>
              <p className="small muted m-0">{copy.geneticsBlurb}</p>
            </div>
            <div
              className="privacy-seg"
              role="group"
              aria-label={copy.geneticsTitle}
            >
              <button
                type="button"
                className={geneticsShare === "me" ? "on" : undefined}
                onClick={() => setGeneticsShare("me")}
              >
                {copy.geneticsMe}
              </button>
              <button
                type="button"
                className={geneticsShare === "doctors" ? "on" : undefined}
                onClick={() => setGeneticsShare("doctors")}
              >
                {copy.geneticsDoctors}
              </button>
            </div>
          </div>

          <div className="row mt-3" style={{ gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn" onClick={saveAll}>
              {copy.save}
            </button>
          </div>
        </section>
      ) : null}

      {tab === "granted" ? (
        <section className="card privacy-block privacy-granted">
          <div className="card-head" style={{ alignItems: "flex-start" }}>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
                {copy.grantedTitle}
              </h2>
              <p className="small muted mt-1 mb-0">{copy.grantedBlurb}</p>
            </div>
            <span className="pill plain c-green">
              {grantedOptional.length} {copy.of} {optionalKeys.length}{" "}
              {copy.granted}
            </span>
          </div>
          {grantedOptional.length === 0 ? (
            <p className="small muted m-0">{copy.grantedEmpty}</p>
          ) : (
            <div className="privacy-granted-list">
              {grantedOptional.map((key) => {
                const lab = labels[key];
                const meta = PREF_META.find((p) => p.key === key)!;
                return (
                  <div key={key} className="privacy-granted-item">
                    <div className="privacy-pending-copy">
                      <div className="privacy-pending-title">
                        <b>{lab.t}</b>
                        <span className="pill plain c-green">{copy.on}</span>
                      </div>
                      <p className="privacy-pref-desc">{lab.d}</p>
                      <p className="privacy-pref-basis">{lab.basis}</p>
                    </div>
                    {!meta.required ? (
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={() => setPref(key, false)}
                      >
                        {copy.revoke}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {tab === "data" ? (
        <section className="card privacy-block privacy-prefs">
          <div className="card-head" style={{ alignItems: "flex-start" }}>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
                {copy.dataTitle}
              </h2>
              <p className="small muted mt-1 mb-0">{copy.dataBlurb}</p>
            </div>
            <div className="privacy-pref-summary">
              {savedFlash ? (
                <span className="pill c-green">{copy.saved}</span>
              ) : (
                <span className="pill plain c-acc">
                  {grantedOptional.length} {copy.of} {optionalKeys.length}{" "}
                  {copy.granted}
                </span>
              )}
            </div>
          </div>

          <div className="privacy-pref-actions">
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setAllOptional(true)}
            >
              {copy.acceptOptional}
            </button>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setAllOptional(false)}
            >
              {copy.rejectOptional}
            </button>
          </div>

          <div className="privacy-pref-groups">
            {groups.map((g) => (
              <div key={g.id} className="privacy-pref-group">
                <div className="privacy-pref-group-head">
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold m-0">
                    {g.title}
                  </h3>
                  <p className="small muted m-0">{g.blurb}</p>
                </div>
                <div
                  className={`privacy-pref-list${
                    g.id === "required" ? " privacy-pref-list-split" : ""
                  }`}
                >
                  {g.items.map((meta) => {
                    const lab = labels[meta.key];
                    const on = prefs[meta.key];
                    return (
                      <div
                        key={meta.key}
                        className={`privacy-pref${
                          meta.required ? " required" : ""
                        }${on ? " on" : ""}`}
                      >
                        <div className="privacy-pref-title-row">
                          <div className="privacy-pref-title-main">
                            <b>{lab.t}</b>
                            <span
                              className={`pill plain ${
                                meta.required
                                  ? "c-acc"
                                  : on
                                    ? "c-green"
                                    : "c-none"
                              }`}
                            >
                              {meta.required
                                ? copy.required
                                : on
                                  ? copy.on
                                  : copy.off}
                            </span>
                          </div>
                          <Switch
                            on={on}
                            locked={meta.required}
                            label={lab.t}
                            onLabel={copy.on}
                            offLabel={copy.off}
                            onClick={() => setPref(meta.key, !on)}
                          />
                        </div>
                        <p className="privacy-pref-desc">{lab.d}</p>
                        <p className="privacy-pref-basis">{lab.basis}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn" onClick={saveAll}>
              {copy.save}
            </button>
            <a
              className="btn ghost"
              href={`mailto:${PRIVACY_CONTROLLER.dpoEmail}`}
            >
              {copy.contact}
            </a>
          </div>
        </section>
      ) : null}

      {tab === "policies" ? (
        <section className="privacy-docs-block">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0 mb-3">
            {copy.docs}
          </h2>
          <div className="privacy-layout">
            <nav className="card privacy-nav" aria-label={copy.docs}>
              <div className="privacy-nav-list">
                {PRIVACY_POLICIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`privacy-nav-item${
                      active === p.id ? " on" : ""
                    }`}
                    onClick={() => setActive(p.id)}
                  >
                    <b>{locale === "en" ? p.titleEn : p.titleLt}</b>
                    <span className="small muted">
                      {locale === "en" ? p.summaryEn : p.summaryLt}
                    </span>
                  </button>
                ))}
              </div>
            </nav>

            <article className="card privacy-doc surface-raised-card">
              <div className="card-head" style={{ alignItems: "flex-start" }}>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold m-0">
                    {locale === "en" ? doc.titleEn : doc.titleLt}
                  </h3>
                  <p className="small muted mt-2 mb-0">
                    {locale === "en" ? doc.summaryEn : doc.summaryLt}
                  </p>
                </div>
                <span className="pill plain c-acc">
                  {copy.updated} {doc.updated}
                </span>
              </div>

              <div className="privacy-sections">
                {doc.sections.map((s) => (
                  <section key={s.headingLt} className="privacy-section">
                    <h4 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
                      {locale === "en" ? s.headingEn : s.headingLt}
                    </h4>
                    {(locale === "en" ? s.bodyEn : s.bodyLt).map((para) => (
                      <p key={para.slice(0, 48)} className="privacy-para">
                        {para}
                      </p>
                    ))}
                  </section>
                ))}
              </div>

              <p className="disclaim mt-4 mb-0">
                {locale === "en"
                  ? "This text is provided for the Lyfora clinic platform demo and should be reviewed by legal counsel before production use."
                  : "Šis tekstas skirtas Lyfora klinikos platformos demo ir prieš gamybinį naudojimą turi būti peržiūrėtas teisininko."}
              </p>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}
