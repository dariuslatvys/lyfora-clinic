import Link from "next/link";
import type { PmosReport } from "@/lib/health/reproductive-phenotypes";

const OUTCOME_RANK = { triggered: 0, deferred: 1, cleared: 2 } as const;

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

  const checks = [...report.ruledOut].sort(
    (a, b) => OUTCOME_RANK[a.outcome] - OUTCOME_RANK[b.outcome]
  );
  const fired = report.rules.filter((r) => r.state === "fired");
  const quiet = report.rules.filter((r) => r.state === "not_fired");

  return (
    <div className="pmos-report stack" style={{ gap: 16 }}>
      <section className="panel pmos-hero">
        <p className="eyebrow pmos-eyebrow">
          {locale === "en" ? "Your result" : "Jūsų rezultatas"}
        </p>
        <h2 className="pmos-headline">
          {locale === "en" ? report.headlineEn : report.headlineLt}
        </h2>
        <p className="pmos-aka">
          {locale === "en"
            ? "Formerly PKS / PCOS — polycystic ovary syndrome."
            : "Anksčiau vadintas PKS — policistinių kiaušidžių sindromu."}
        </p>
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
            ? "What was checked for PMOS"
            : "Kas tikrinta dėl PMOS"}
        </h3>
        <p className="pmos-section-lead">
          {locale === "en"
            ? "Risk findings first, then items still being tested, then conditions that were ruled out."
            : "Pirma rizikingi radiniai, tada dar tikrinamos būklės, galiausiai — kas atmesta."}
        </p>
        <ol className="pmos-ruled-list">
          {checks.map((step, i) => (
            <li
              key={step.step}
              className={`pmos-ruled-item pmos-outcome-${step.outcome}`}
            >
              <div className="pmos-ruled-num" aria-hidden="true">
                {i + 1}
              </div>
              <div className="pmos-ruled-body">
                <div className="pmos-ruled-top">
                  <h4>{locale === "en" ? step.titleEn : step.titleLt}</h4>
                  <span className="pmos-outcome-pill">
                    {step.outcome === "triggered"
                      ? locale === "en"
                        ? "Risk signal"
                        : "Rizikos signalas"
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
          {locale === "en" ? "Rules" : "Taisyklės"}
        </h3>
        <div className="pmos-rules-split">
          <div className="pmos-rules-col">
            <h4 className="pmos-rules-col-title is-fired">
              {locale === "en" ? "Fired" : "Suveikusios"}
              <span>{fired.length}</span>
            </h4>
            <div className="pmos-rules-list">
              {fired.map((rule) => (
                <article key={rule.titleLt} className="pmos-rule-card is-fired">
                  <h4>{locale === "en" ? rule.titleEn : rule.titleLt}</h4>
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
          </div>
          <div className="pmos-rules-col">
            <h4 className="pmos-rules-col-title is-quiet">
              {locale === "en" ? "Did not fire" : "Nesuveikusios"}
              <span>{quiet.length}</span>
            </h4>
            <div className="pmos-rules-list">
              {quiet.map((rule) => (
                <article key={rule.titleLt} className="pmos-rule-card is-quiet">
                  <h4>{locale === "en" ? rule.titleEn : rule.titleLt}</h4>
                  <p className="pmos-result">
                    {locale === "en" ? rule.resultEn : rule.resultLt}
                  </p>
                </article>
              ))}
            </div>
          </div>
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
            ? "Add-ons to the same blood draw — order a test or book a consult in Marketplace."
            : "Priedas prie to paties kraujo ėmimo — užsakykite tyrimą ar konsultaciją Marketplace."}
        </p>
        <div className="pmos-tests-list">
          {report.tests.map((t) => {
            const primaryHref = t.marketItemId
              ? `/patient/marketplace?item=${encodeURIComponent(t.marketItemId)}`
              : "/patient/marketplace";
            return (
              <article key={t.nameLt} className="pmos-test-card">
                <h4>{locale === "en" ? t.nameEn : t.nameLt}</h4>
                <p>{locale === "en" ? t.whyEn : t.whyLt}</p>
                <div className="pmos-test-actions">
                  <Link href={primaryHref} className="btn sm">
                    {locale === "en" ? "Order test" : "Užsakyti tyrimą"}
                  </Link>
                  {(t.links || []).map((l) => (
                    <Link key={l.href} href={l.href} className="btn sm ghost">
                      {locale === "en" ? l.labelEn : l.labelLt}
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
        <div className="pmos-consult-row">
          <Link
            href="/patient/marketplace?item=con-endo-40"
            className="btn sm"
          >
            {locale === "en"
              ? "Book endocrinology consult"
              : "Endokrinologo konsultacija"}
          </Link>
          <Link href="/patient/marketplace?item=con-gp-30" className="btn sm ghost">
            {locale === "en" ? "Book GP consult" : "Šeimos gydytojo konsultacija"}
          </Link>
          <Link
            href="/patient/marketplace?item=lab-pkg-hormonal-w-core"
            className="btn sm ghost"
          >
            {locale === "en"
              ? "Women’s hormone package"
              : "Hormoninis paketas moterims"}
          </Link>
        </div>
        <p className="pmos-note">
          {locale === "en" ? report.noteEn : report.noteLt}
        </p>
      </section>

      <p className="pmos-back">
        <Link href="/patient/digital-twin/reproductive">
          ←{" "}
          {locale === "en"
            ? "Back to women’s health and life stages"
            : "Atgal į moters sveikatą ir gyvybinius etapus"}
        </Link>
      </p>
    </div>
  );
}
