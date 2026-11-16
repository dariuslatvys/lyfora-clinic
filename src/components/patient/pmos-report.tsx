import Link from "next/link";
import type { PmosReport } from "@/lib/health/reproductive-phenotypes";

export function PmosReportView({
  locale,
  report,
}: {
  locale: "lt" | "en";
  report: PmosReport;
}) {
  const story =
    locale === "en" ? report.patientStoryEn : report.patientStoryLt;
  const paragraphs = story.split(/\n\n+/).filter(Boolean);

  return (
    <div className="pmos-report stack" style={{ gap: 16 }}>
      <section className="panel pmos-hero">
        <p className="eyebrow pmos-eyebrow">
          {locale === "en" ? "Your result" : "Jūsų rezultatas"}
        </p>
        <h2 className="pmos-headline">
          {locale === "en" ? report.headlineEn : report.headlineLt}
        </h2>
        <div className="pmos-story">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="pmos-next">
          {locale === "en" ? report.nextStepsEn : report.nextStepsLt}
        </p>
        <p className="pmos-disclaimer">
          {locale === "en" ? report.disclaimerEn : report.disclaimerLt}
        </p>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en"
            ? "What the system calculated"
            : "Ką apskaičiavo sistema"}
        </h3>
        <p className="pmos-section-lead">
          {locale === "en"
            ? "Concrete numbers from your period dates, questionnaire and basic blood panel."
            : "Konkretūs skaičiai iš Jūsų mėnesinių datų, klausimyno ir bazinio kraujo tyrimo."}
        </p>
        <div className="pmos-calc-list">
          {report.calculated.map((row) => (
            <article key={row.labelLt} className="pmos-calc-card">
              <h4>{locale === "en" ? row.labelEn : row.labelLt}</h4>
              <p className="pmos-from">
                <span>{locale === "en" ? "From" : "Iš ko"}:</span>{" "}
                {locale === "en" ? row.fromEn : row.fromLt}
              </p>
              <p className="pmos-result">
                {locale === "en" ? row.resultEn : row.resultLt}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en"
            ? "What was checked before PMOS"
            : "Kas patikrinta prieš PMOS"}
        </h3>
        <p className="pmos-section-lead">
          {locale === "en"
            ? "Similar conditions are ruled out in order. Only then does the PMOS rule run."
            : "Panašios būklės atmetamos eile. Tik tada paleidžiama PMOS taisyklė."}
        </p>
        <ol className="pmos-ruled-list">
          {report.ruledOut.map((step) => (
            <li
              key={step.step}
              className={`pmos-ruled-item pmos-outcome-${step.outcome}`}
            >
              <div className="pmos-ruled-num" aria-hidden="true">
                {step.step}
              </div>
              <div className="pmos-ruled-body">
                <div className="pmos-ruled-top">
                  <h4>{locale === "en" ? step.titleEn : step.titleLt}</h4>
                  <span className="pmos-outcome-pill">
                    {step.outcome === "triggered"
                      ? locale === "en"
                        ? "Triggered"
                        : "Suveikė"
                      : step.outcome === "deferred"
                        ? locale === "en"
                          ? "Still testing"
                          : "Tikrinama toliau"
                        : locale === "en"
                          ? "Ruled out"
                          : "Atmesta"}
                  </span>
                </div>
                <p className="pmos-from">
                  <span>{locale === "en" ? "Check" : "Patikra"}:</span>{" "}
                  {locale === "en" ? step.checkEn : step.checkLt}
                </p>
                <p className="pmos-result">
                  {locale === "en" ? step.verdictEn : step.verdictLt}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en"
            ? "Rules that fired — and those that did not"
            : "Suveikusios ir nesuveikusios taisyklės"}
        </h3>
        <div className="pmos-rules-list">
          {report.rules.map((rule) => (
            <article
              key={rule.titleLt}
              className={`pmos-rule-card ${
                rule.state === "fired" ? "is-fired" : "is-quiet"
              }`}
            >
              <div className="pmos-ruled-top">
                <h4>{locale === "en" ? rule.titleEn : rule.titleLt}</h4>
                <span className="pmos-outcome-pill">
                  {rule.state === "fired"
                    ? locale === "en"
                      ? "Fired"
                      : "Suveikė"
                    : locale === "en"
                      ? "Did not fire"
                      : "Nesuveikė"}
                </span>
              </div>
              {rule.strengthLt ? (
                <p className="pmos-strength">
                  {locale === "en" ? rule.strengthEn : rule.strengthLt}
                </p>
              ) : null}
              <p className="pmos-result">
                {locale === "en" ? rule.resultEn : rule.resultLt}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en"
            ? "Recommended targeted tests"
            : "Rekomenduojami tiksliniai tyrimai"}
        </h3>
        <p className="pmos-section-lead">
          {locale === "en"
            ? "Add-ons to the same blood draw — what each one gives you."
            : "Priedas prie to paties kraujo ėmimo — ką kiekvienas tyrimas duoda."}
        </p>
        <div className="pmos-tests-list">
          {report.tests.map((t) => (
            <article key={t.nameLt} className="pmos-test-card">
              <h4>{locale === "en" ? t.nameEn : t.nameLt}</h4>
              <p>{locale === "en" ? t.whyEn : t.whyLt}</p>
            </article>
          ))}
        </div>
        <p className="pmos-note">
          {locale === "en" ? report.noteEn : report.noteLt}
        </p>
      </section>

      <p className="pmos-back">
        <Link href="/patient/digital-twin/reproductive">
          ←{" "}
          {locale === "en"
            ? "Back to reproductive health"
            : "Atgal į reprodukcinę sveikatą"}
        </Link>
      </p>
    </div>
  );
}
