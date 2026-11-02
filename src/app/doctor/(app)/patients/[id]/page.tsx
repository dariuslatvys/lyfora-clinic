import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { COLOUR_HEX, PILL_CLASS } from "@/lib/health/colours";

export default async function DoctorPatientChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await getCurrentUser();
  if (!current || current.user.role !== "doctor") redirect("/login/doctor");
  const locale = ((current.user.locale as Locale) || "lt") as Locale;
  const labels = t(locale);
  const { id } = await params;
  const twin = loadDigitalTwin(id, locale);
  if (!twin) notFound();

  const name = patientDisplayName(twin.patient.sex, locale);
  const attention = twin.categories
    .filter((c) => c.colour === "red" || c.colour === "orange")
    .sort((a, b) => (a.colour === "red" ? -1 : 1));

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Link href="/doctor/patients" className="small muted">
        ← {locale === "en" ? "Patients" : "Pacientai"}
      </Link>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            {locale === "en" ? "Patient chart" : "Paciento kortelė"}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {name}
          </h1>
          <p className="mt-2 mb-0 text-sm text-[var(--muted)]">
            {twin.patient.dob || "—"} ·{" "}
            {twin.patient.sex === "male"
              ? locale === "en"
                ? "Male"
                : "Vyras"
              : locale === "en"
                ? "Female"
                : "Moteris"}
          </p>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h3 className="m-0">
            {locale === "en" ? "Health areas" : "Sveikatos sritys"}
          </h3>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {twin.categories.map((c) => (
            <div
              key={c.id}
              className="rounded-md border border-[var(--line)] px-3 py-2"
              style={{
                borderLeft: `4px solid ${COLOUR_HEX[c.colour]}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <b>{labels.categoryNames[c.id] || c.id}</b>
                <span className={`pill ${PILL_CLASS[c.colour]}`}>
                  {labels.colourLabels[c.colour]}
                </span>
              </div>
              <p className="small muted m-0 mt-1">{c.summary}</p>
              <p className="xs muted m-0 mt-1">
                {locale === "en" ? "Markers" : "Žymenys"}: {c.markers.length} ·
                SNP: {c.snps.length} · NGS: {c.rare.length}
              </p>
            </div>
          ))}
        </div>
      </section>

      {attention.length ? (
        <section className="card">
          <div className="card-head">
            <h3 className="m-0">
              {locale === "en" ? "Needs attention" : "Reikalauja dėmesio"}
            </h3>
          </div>
          <ul className="m-0 pl-5 text-sm">
            {attention.map((c) => (
              <li key={c.id} className="mb-2">
                <b>{labels.categoryNames[c.id]}</b> — {c.summary}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
