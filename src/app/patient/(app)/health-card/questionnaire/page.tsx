import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import {
  completionStats,
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { loadQuestionnaireDefinition } from "@/lib/health/questionnaire-loader";
import { formatDateTime } from "@/lib/utils";
import {
  ensureDemoQuestionnaire,
  syncSharedMetrics,
} from "@/lib/health/ensure-demo-questionnaires";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QuestionnaireHubPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const isFemale = current.patient.sex === "female";

  ensureSchema();
  await ensureDemoQuestionnaire(current.patient.id, "general");
  if (isFemale) {
    await ensureDemoQuestionnaire(current.patient.id, "women");
    await syncSharedMetrics(current.patient.id);
  }
  const db = getDb();

  const generalDef = await loadQuestionnaireDefinition("general");
  const generalRow = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, questionnaireStorageKey("general"))
      )
    )
    .get();
  const generalAnswers = parseStoredAnswers(generalRow?.value);
  const generalStats = completionStats(generalDef, generalAnswers);

  let womenStats = { percent: 0, filled: 0, required: 0 };
  let womenUpdatedAt: string | null = null;
  if (isFemale) {
    const womenDef = await loadQuestionnaireDefinition("women");
    const womenRow = db
      .select()
      .from(questionnaire)
      .where(
        and(
          eq(questionnaire.patientId, current.patient.id),
          eq(questionnaire.key, questionnaireStorageKey("women"))
        )
      )
      .get();
    const womenAnswers = parseStoredAnswers(womenRow?.value);
    womenStats = completionStats(womenDef, womenAnswers);
    womenUpdatedAt = womenAnswers.updatedAt;
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div>
        <Link href="/patient/health-card" className="text-sm text-[var(--muted)]">
          ← {locale === "en" ? "Health record" : "Sveikatos kortelė"}
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-2 mb-1">
          {locale === "en" ? "Questionnaires" : "Klausimynai"}
        </h1>
        <p className="small muted m-0">
          {locale === "en"
            ? "Open a questionnaire linked to your health record."
            : "Klausimynai, susiję su jūsų sveikatos kortele."}
        </p>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>
              {locale === "en" ? "Health questionnaire" : "Sveikatos klausimynas"}
            </h2>
            <p className="small muted m-0">
              {locale === "en"
                ? "General intake — profile, conditions, lifestyle, family history."
                : "Bendrasis klausimynas — profilis, ligos, gyvenimo būdas, šeimos anamnezė."}
            </p>
          </div>
          <Link
            href="/patient/health-card/questionnaire/general"
            className="btn"
          >
            {generalAnswers.updatedAt
              ? locale === "en"
                ? "Open"
                : "Atidaryti"
              : locale === "en"
                ? "Fill in"
                : "Pildyti"}
          </Link>
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <div className="stack" style={{ gap: 4 }}>
            <span className="small muted">
              {locale === "en" ? "Completion" : "Užpildymas"}
            </span>
            <b className="num" style={{ fontSize: "1.35rem" }}>
              {generalStats.percent}%
            </b>
          </div>
          <div className="q-progress" style={{ width: 180, alignSelf: "center" }}>
            <i style={{ width: `${generalStats.percent}%` }} />
          </div>
          <div className="stack" style={{ gap: 4, textAlign: "right" }}>
            <span className="small muted">
              {locale === "en" ? "Last saved" : "Paskutinį kartą"}
            </span>
            <b>
              {generalAnswers.updatedAt
                ? formatDateTime(generalAnswers.updatedAt, locale)
                : locale === "en"
                  ? "Not started"
                  : "Dar nepradėta"}
            </b>
          </div>
        </div>
      </section>

      {isFemale ? (
        <section className="card">
          <div className="card-head">
            <div>
              <h2>
                {locale === "en"
                  ? "Additional women's questionnaire"
                  : "Papildomas moters klausimynas"}
              </h2>
              <p className="small muted m-0">
                {locale === "en"
                  ? "Hormone and cycle health — supplements the general questionnaire."
                  : "Hormoninė ir ciklo sveikata — papildo bendrąjį klausimyną."}
              </p>
            </div>
            <Link
              href="/patient/health-card/questionnaire/women"
              className="btn"
            >
              {womenUpdatedAt
                ? locale === "en"
                  ? "Open"
                  : "Atidaryti"
                : locale === "en"
                  ? "Fill in"
                  : "Pildyti"}
            </Link>
          </div>
          <div className="row between" style={{ marginTop: 8 }}>
            <div className="stack" style={{ gap: 4 }}>
              <span className="small muted">
                {locale === "en" ? "Completion" : "Užpildymas"}
              </span>
              <b className="num" style={{ fontSize: "1.35rem" }}>
                {womenStats.percent}%
              </b>
            </div>
            <div
              className="q-progress"
              style={{ width: 180, alignSelf: "center" }}
            >
              <i style={{ width: `${womenStats.percent}%` }} />
            </div>
            <div className="stack" style={{ gap: 4, textAlign: "right" }}>
              <span className="small muted">
                {locale === "en" ? "Last saved" : "Paskutinį kartą"}
              </span>
              <b>
                {womenUpdatedAt
                  ? formatDateTime(womenUpdatedAt, locale)
                  : locale === "en"
                    ? "Not started"
                    : "Dar nepradėta"}
              </b>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
