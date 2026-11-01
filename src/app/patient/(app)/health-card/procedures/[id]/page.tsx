import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { t } from "@/lib/i18n/dictionary";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { getHealthCardProcedure } from "@/lib/health/health-card-data";

export default async function ProcedureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);

  ensureSchema();
  const db = getDb();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, current.patient.id),
        eq(questionnaire.key, questionnaireStorageKey())
      )
    )
    .get();
  const answers = parseStoredAnswers(row?.value);
  const proc = getHealthCardProcedure(id, {
    patientName: current.patient.fullName,
    sex: current.patient.sex,
    dob: current.patient.dob,
    answers,
  });
  if (!proc) notFound();

  return (
    <div className="stack" style={{ gap: 14 }}>
      <Link href="/patient/health-card" className="text-sm text-[var(--muted)]">
        ← {labels.healthCard}
      </Link>

      <section className="panel">
        <span className="eyebrow">
          {locale === "en" ? proc.typeEn : proc.typeLt}
        </span>
        <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-1 mb-0">
          {locale === "en" ? proc.nameEn : proc.nameLt}
        </h1>
        <p className="small muted mt-2 mb-0">
          {proc.date}
          {" · "}
          {locale === "en" ? proc.whereEn : proc.whereLt}
        </p>
      </section>

      {proc.imageSrc ? (
        <Image
          src={proc.imageSrc}
          alt={locale === "en" ? proc.nameEn : proc.nameLt}
          width={960}
          height={720}
          className="proc-hero-img"
        />
      ) : null}

      <section className="card">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
          {locale === "en" ? "Result" : "Rezultatas"}
        </h2>
        <p className="mt-3 mb-0 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
          {locale === "en" ? proc.resultEn : proc.resultLt}
        </p>
      </section>

      <section className="card">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
          {locale === "en" ? "Detailed description" : "Išsamus aprašymas"}
        </h2>
        <p className="mt-3 mb-0 text-[0.98rem] leading-relaxed text-[var(--ink-soft)]">
          {locale === "en" ? proc.detailEn : proc.detailLt}
        </p>
      </section>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Link href="/patient/health-card" className="btn ghost">
          {labels.healthCard}
        </Link>
        {proc.visitHref ? (
          <Link href={proc.visitHref} className="btn">
            {locale === "en" ? "Open related visit" : "Atidaryti susijusį vizitą"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
