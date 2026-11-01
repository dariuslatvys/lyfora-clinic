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

function prefsStorageKey(patientHint: string) {
  return `lyfora-privacy-prefs:v2:${patientHint}`;
}

type LocaleCopy = {
  t: string;
  d: string;
  basis: string;
};

export function PrivacyView({
  locale,
  patientHint = "demo",
}: {
  locale: "lt" | "en";
  patientHint?: string;
}) {
  const [active, setActive] = useState<PolicyId>("privacy");
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(prefsStorageKey(patientHint));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<PrefKey, boolean>>;
      setPrefs((prev) => ({ ...prev, ...parsed }));
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
              "Manage clear consents under the GDPR (BDAR), then open the full policy texts.",
            docs: "Policies",
            updated: "Updated",
            prefsTitle: "Your consents",
            prefsBlurb:
              "Each row shows what we do, the legal basis, and On / Off. Required items stay on for care.",
            save: "Save consents",
            saved: "Consents saved",
            contact: "Contact DPO",
            on: "On",
            off: "Off",
            required: "Required",
            optional: "Optional",
            granted: "granted",
            of: "of",
            acceptOptional: "Accept all optional",
            rejectOptional: "Reject optional",
          }
        : {
            eyebrow: "Teisinė info ir BDAR",
            title: "Privatumas",
            blurb:
              "Aiškiai valdykite sutikimus pagal BDAR (GDPR), tada skaitykite pilnus politikų tekstus.",
            docs: "Politikų dokumentai",
            updated: "Atnaujinta",
            prefsTitle: "Jūsų sutikimai",
            prefsBlurb:
              "Kiekvienoje eilutėje — ką darome, teisinis pagrindas ir Įjungta / Išjungta. Būtini lieka įjungti gydymui.",
            save: "Išsaugoti sutikimus",
            saved: "Sutikimai išsaugoti",
            contact: "Rašyti DAP",
            on: "Įjungta",
            off: "Išjungta",
            required: "Būtina",
            optional: "Neprivaloma",
            granted: "suteikta",
            of: "iš",
            acceptOptional: "Sutikti su visais neprivalomais",
            rejectOptional: "Atmesti neprivalomus",
          },
    [locale]
  );

  const doc = PRIVACY_POLICIES.find((p) => p.id === active) || PRIVACY_POLICIES[0];

  const optionalKeys = PREF_META.filter((p) => !p.required).map((p) => p.key);
  const grantedOptional = optionalKeys.filter((k) => prefs[k]).length;

  function setPref(key: PrefKey, value: boolean) {
    const meta = PREF_META.find((p) => p.key === key);
    if (meta?.required) return;
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function savePrefs() {
    localStorage.setItem(prefsStorageKey(patientHint), JSON.stringify(prefs));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  }

  function setAllOptional(on: boolean) {
    setPrefs((prev) => {
      const next = { ...prev };
      for (const k of optionalKeys) next[k] = on;
      return next;
    });
  }

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

      <section className="card privacy-prefs">
        <div className="card-head" style={{ alignItems: "flex-start" }}>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold m-0">
              {copy.prefsTitle}
            </h2>
            <p className="small muted mt-1 mb-0">{copy.prefsBlurb}</p>
          </div>
          <div className="privacy-pref-summary">
            {savedFlash ? (
              <span className="pill c-green">{copy.saved}</span>
            ) : (
              <span className="pill plain c-acc">
                {grantedOptional} {copy.of} {optionalKeys.length} {copy.granted}
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
              <div className="privacy-pref-list">
                {g.items.map((meta) => {
                  const lab = labels[meta.key];
                  const on = prefs[meta.key];
                  return (
                    <div
                      key={meta.key}
                      className={`privacy-pref${meta.required ? " required" : ""}${
                        on ? " on" : ""
                      }`}
                    >
                      <div className="privacy-pref-copy">
                        <div className="privacy-pref-title-row">
                          <b>{lab.t}</b>
                          <span
                            className={`pill plain ${
                              meta.required ? "c-acc" : on ? "c-green" : "c-none"
                            }`}
                          >
                            {meta.required
                              ? copy.required
                              : on
                                ? copy.on
                                : copy.off}
                          </span>
                        </div>
                        <p className="privacy-pref-desc">{lab.d}</p>
                        <p className="privacy-pref-basis">{lab.basis}</p>
                      </div>
                      <button
                        type="button"
                        className={`privacy-switch${on ? " on" : ""}${
                          meta.required ? " locked" : ""
                        }`}
                        role="switch"
                        aria-checked={on}
                        aria-label={lab.t}
                        disabled={meta.required}
                        onClick={() => setPref(meta.key, !on)}
                      >
                        <span className="privacy-switch-knob" />
                        <span className="privacy-switch-text">
                          {on ? copy.on : copy.off}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-4" style={{ gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={savePrefs}>
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

      <div className="privacy-layout">
        <nav className="card privacy-nav" aria-label={copy.docs}>
          <p className="eyebrow m-0 mb-2">{copy.docs}</p>
          <div className="privacy-nav-list">
            {PRIVACY_POLICIES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`privacy-nav-item${active === p.id ? " on" : ""}`}
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
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold m-0">
                {locale === "en" ? doc.titleEn : doc.titleLt}
              </h2>
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
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
                  {locale === "en" ? s.headingEn : s.headingLt}
                </h3>
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
    </div>
  );
}
