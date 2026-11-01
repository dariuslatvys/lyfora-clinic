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

const tabs = [
  "cardSummary",
  "cardDiagnoses",
  "cardMeds",
  "cardVaccines",
  "cardProcedures",
  "cardVisitHistory",
  "cardDocuments",
] as const;

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

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <h2 className="font-[family-name:var(--font-display)] text-3xl m-0">
          {labels.healthCard}
        </h2>
      </div>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>
              {locale === "en" ? "Health questionnaire" : "Sveikatos klausimynas"}
            </h2>
            <p className="small muted m-0">
              {locale === "en"
                ? "Structured intake from the Lyfora health questionnaire — view and update your answers."
                : "Struktūruotas sveikatos klausimynas — peržiūrėkite ir suveskite savo atsakymus."}
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

      <div className="panel space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
          {tabs.map((tab) => (
            <span
              key={tab}
              className="rounded-md bg-[var(--surface-raised)] px-3 py-1.5 text-sm text-[var(--ink-soft)]"
            >
              {labels[tab]}
            </span>
          ))}
        </div>
        <p className="text-sm text-[var(--muted)]">{labels.comingSoon}</p>
      </div>
    </div>
  );
}
