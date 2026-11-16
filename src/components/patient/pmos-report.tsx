import Link from "next/link";
import type {
  AssessmentItem,
  PmosReport,
} from "@/lib/health/reproductive-phenotypes";

function AssessmentCard({
  item,
  locale,
}: {
  item: AssessmentItem;
  locale: "lt" | "en";
}) {
  return (
    <article className={`pmos-assess-card is-${item.kind}`}>
      <h4>{locale === "en" ? item.titleEn : item.titleLt}</h4>
      <p>{locale === "en" ? item.detailEn : item.detailLt}</p>
    </article>
  );
}

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
  const present = report.assessment.filter(
    (a) => a.kind === "present" || a.kind === "watch"
  );
  const ruledOut = report.assessment.filter((a) => a.kind === "ruled_out");

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
          {locale === "en" ? (
            <>
              <span>PMOS</span> — {report.pmosExpandEn}.{" "}
              <span>PKS</span> — {report.pksExpandLt}.
            </>
          ) : (
            <>
              <span>PMOS</span> — {report.pmosExpandEn}.{" "}
              <span>PKS</span> — {report.pksExpandLt}.
            </>
          )}
        </p>
        <div className="pmos-story">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "pmos-story-lead" : undefined}>
              {p}
            </p>
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
          {locale === "en" ? "Calculation algorithm" : "Apskaičiavimo algoritmas"}
        </h3>
        <p className="pmos-section-lead">
          {locale === "en"
            ? "What the system derived from your period dates, questionnaire and basic blood panel."
            : "Ką sistema išvedė iš Jūsų mėnesinių datų, klausimyno ir bazinio kraujo tyrimo."}
        </p>
        <div className="pmos-calc-table-wrap">
          <table className="pmos-calc-table">
            <thead>
              <tr>
                <th>{locale === "en" ? "What" : "Kas"}</th>
                <th>{locale === "en" ? "From" : "Iš ko"}</th>
                <th>{locale === "en" ? "Result" : "Rezultatas"}</th>
              </tr>
            </thead>
            <tbody>
              {report.calculated.map((row) => (
                <tr key={row.labelLt}>
                  <td>{locale === "en" ? row.labelEn : row.labelLt}</td>
                  <td>{locale === "en" ? row.fromEn : row.fromLt}</td>
                  <td>{locale === "en" ? row.resultEn : row.resultLt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en" ? "Signs and ruled-out conditions" : "Požymiai ir atmestos būklės"}
        </h3>
        <p className="pmos-section-lead">
          {locale === "en"
            ? "Left: signs that fit this picture. Right: conditions that do not fit your answers and tests."
            : "Kairėje — požymiai, kurie dera su šiuo paveikslu. Dešinėje — būklės, kurios pagal atsakymus ir tyrimus neatitinka."}
        </p>
        <div className="pmos-assess-split">
          <div className="pmos-assess-col">
            <h4 className="pmos-assess-col-title is-present">
              {locale === "en" ? "Present signs" : "Esami požymiai"}
              <span>{present.length}</span>
            </h4>
            <div className="pmos-assess-list">
              {present.map((item) => (
                <AssessmentCard
                  key={item.titleLt}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          </div>
          <div className="pmos-assess-col">
            <h4 className="pmos-assess-col-title is-ruled">
              {locale === "en" ? "Ruled out" : "Atmesta"}
              <span>{ruledOut.length}</span>
            </h4>
            <div className="pmos-assess-list">
              {ruledOut.map((item) => (
                <AssessmentCard
                  key={item.titleLt}
                  item={item}
                  locale={locale}
                />
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
