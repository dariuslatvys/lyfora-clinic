"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PRIVACY_CONTROLLER,
  PRIVACY_POLICIES,
  type PolicyId,
} from "@/lib/privacy/policies";

type PrefKey = "aiHealth" | "integrations" | "marketing" | "research";

const DEFAULT_PREFS: Record<PrefKey, boolean> = {
  aiHealth: true,
  integrations: true,
  marketing: false,
  research: false,
};

function prefsStorageKey(patientHint: string) {
  return `lyfora-privacy-prefs:${patientHint}`;
}

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

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Legal & GDPR",
            title: "Privacy",
            blurb:
              "Clinic policies for personal and health data under the GDPR (BDAR), plus your optional consents.",
            docs: "Policies",
            updated: "Updated",
            prefsTitle: "Your consents",
            prefsBlurb:
              "These preferences apply in this browser for the demo account. Clinical care data is still processed as required for treatment.",
            save: "Save preferences",
            saved: "Preferences saved",
            contact: "Contact DPO",
            prefLabels: {
              aiHealth: {
                t: "Ask AI with my health context",
                d: "Allow Ask AI to use marker / genetics context for personalised explanations.",
              },
              integrations: {
                t: "Health app integrations",
                d: "Allow connected sources (e.g. Apple Health, Oura) to sync summaries into your twin.",
              },
              marketing: {
                t: "Service news & offers",
                d: "Email about new packages, SPA / wellness and non-urgent clinic news.",
              },
              research: {
                t: "Anonymised research",
                d: "Allow de-identified data for quality improvement and scientific projects (never genetics files without separate consent).",
              },
            } as Record<PrefKey, { t: string; d: string }>,
          }
        : {
            eyebrow: "Teisinė info ir BDAR",
            title: "Privatumas",
            blurb:
              "Klinikos politikos dėl asmens ir sveikatos duomenų pagal BDAR (GDPR) bei jūsų neprivalomi sutikimai.",
            docs: "Politikų dokumentai",
            updated: "Atnaujinta",
            prefsTitle: "Jūsų sutikimai",
            prefsBlurb:
              "Šie nustatymai galioja šioje naršyklėje demo paskyrai. Klinikinius duomenis gydymui tvarkome pagal teisės aktus.",
            save: "Išsaugoti nustatymus",
            saved: "Nustatymai išsaugoti",
            contact: "Rašyti DAP",
            prefLabels: {
              aiHealth: {
                t: "Ask AI su mano sveikatos kontekstu",
                d: "Leisti Ask AI naudoti žymenų / genetikos kontekstą asmeniniams paaiškinimams.",
              },
              integrations: {
                t: "Sveikatos programėlių integracijos",
                d: "Leisti prijungtiems šaltiniams (pvz. Apple Health, Oura) sinchronizuoti santraukas į dvynį.",
              },
              marketing: {
                t: "Naujienos ir pasiūlymai",
                d: "El. laiškai apie naujus paketus, SPA / sveikatingumą ir ne skubias klinikos naujienas.",
              },
              research: {
                t: "Anonimizuoti tyrimai",
                d: "Leisti nuasmenintus duomenis kokybės gerinimui ir mokslui (genetikos failų — niekada be atskiro sutikimo).",
              },
            } as Record<PrefKey, { t: string; d: string }>,
          },
    [locale]
  );

  const doc = PRIVACY_POLICIES.find((p) => p.id === active) || PRIVACY_POLICIES[0];

  function savePrefs() {
    localStorage.setItem(prefsStorageKey(patientHint), JSON.stringify(prefs));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
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
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {copy.prefsTitle}
          </h2>
          {savedFlash ? (
            <span className="pill c-green">{copy.saved}</span>
          ) : null}
        </div>
        <p className="small muted mt-1 mb-3">{copy.prefsBlurb}</p>
        <div className="privacy-pref-list">
          {(Object.keys(copy.prefLabels) as PrefKey[]).map((key) => (
            <label key={key} className="privacy-pref">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, [key]: e.target.checked }))
                }
              />
              <span>
                <b>{copy.prefLabels[key].t}</b>
                <span className="small muted">{copy.prefLabels[key].d}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="row mt-3" style={{ gap: 8 }}>
          <button type="button" className="btn" onClick={savePrefs}>
            {copy.save}
          </button>
          <a className="btn ghost" href={`mailto:${PRIVACY_CONTROLLER.dpoEmail}`}>
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
