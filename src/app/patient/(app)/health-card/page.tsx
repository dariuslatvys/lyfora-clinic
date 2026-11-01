import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import {
  completionStats,
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";
import { buildHealthCard } from "@/lib/health/health-card-data";
import { HealthCardTabs } from "@/components/patient/health-card-tabs";
import { loadDigitalTwin } from "@/lib/health/load-twin";

export default async function HealthCardPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  ensureSchema();
  const db = getDb();
  const key = questionnaireStorageKey();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, key)
      )
    )
    .get();
  const def = await loadQuestionnaireDefinition();
  const answers = parseStoredAnswers(row?.value);
  const stats = completionStats(def, answers);

  const card = buildHealthCard({
    patientName: current.patient.fullName,
    sex: current.patient.sex,
    dob: current.patient.dob,
    answers,
  });

  const twin = loadDigitalTwin(current.patient.id, locale);
  const pharmaSnps =
    twin?.categories
      .find((c) => c.id === "pharmacogenetics")
      ?.snps.map((s) => ({
        gene: s.gene,
        snpId: s.snpId,
        allele1: s.allele1,
        allele2: s.allele2,
        matchCount: s.matchCount,
        colour: s.colour,
        genotypeAvailable: s.genotypeAvailable,
        subcategory: s.subcategory,
      })) || [];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>
              {locale === "en" ? "Health questionnaire" : "Sveikatos klausimynas"}
            </h2>
            <p className="small muted m-0">
              {locale === "en"
                ? "Structured intake — answers feed the card tabs below."
                : "Struktūruotas klausimynas — atsakymai papildo kortelės tabus žemiau."}
            </p>
          </div>
          <Link href="/patient/health-card/questionnaire" className="btn">
            {answers.updatedAt
              ? locale === "en"
                ? "Open questionnaire"
                : "Atidaryti klausimyną"
              : locale === "en"
                ? "Fill questionnaire"
                : "Pildyti klausimyną"}
          </Link>
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <div className="stack" style={{ gap: 4 }}>
            <span className="small muted">
              {locale === "en" ? "Completion" : "Užpildymas"}
            </span>
            <b className="num" style={{ fontSize: "1.35rem" }}>
              {stats.percent}%
            </b>
            <span className="xs muted">
              {stats.filled}/{stats.required}{" "}
              {locale === "en" ? "required fields" : "privalomų laukų"}
            </span>
          </div>
          <div className="q-progress" style={{ width: 180, alignSelf: "center" }}>
            <i style={{ width: `${stats.percent}%` }} />
          </div>
          <div className="stack" style={{ gap: 4, textAlign: "right" }}>
            <span className="small muted">
              {locale === "en" ? "Last saved" : "Paskutinį kartą"}
            </span>
            <b>
              {answers.updatedAt
                ? new Date(answers.updatedAt).toLocaleString(
                    locale === "en" ? "en-GB" : "lt-LT"
                  )
                : locale === "en"
                  ? "Not started"
                  : "Dar nepradėta"}
            </b>
          </div>
        </div>
      </section>

      <HealthCardTabs
        locale={locale}
        labels={labels}
        card={card}
        pharmaSnps={pharmaSnps}
      />
    </div>
  );
}
