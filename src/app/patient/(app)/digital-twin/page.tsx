import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { BodyMap } from "@/components/patient/body-map";
import type { RiskColour } from "@/lib/health/colours";

const RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

function firstName(full: string) {
  return full.split(/\s+/)[0] || full;
}

export default async function DigitalTwinPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const name = patientDisplayName(current.patient.sex, locale);
  const attention = twin.categories.filter((c) => RANK[c.colour] >= 3);
  const today = new Date().toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="stack" style={{ gap: 22 }}>
      <section className="hero hero-plain rise-in">
        <div className="stack" style={{ gap: 8, width: "100%" }}>
          <span className="eyebrow">{today}</span>
          <h1>
            {labels.goodMorning}, {firstName(name)}
          </h1>
          <p className="diag-line">
            <span className="eyebrow" style={{ marginRight: 8 }}>
              {labels.diagnosisSummary}
            </span>
            {attention.length === 0 ? (
              <span className="muted">{labels.areasStable}</span>
            ) : (
              <>
                <strong>
                  {attention.length}{" "}
                  {attention.length === 1
                    ? labels.areaNeedsAttention
                    : labels.areasNeedAttention}
                </strong>
                <span className="muted">: </span>
                {attention.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 ? <span className="muted">, </span> : null}
                    <Link
                      href={`/patient/digital-twin/${c.id}`}
                      className="diag-link"
                      style={{
                        color:
                          c.colour === "red" ? "var(--r-red)" : "var(--r-orange)",
                      }}
                    >
                      {(labels.categoryNames[c.id] || c.id).toLowerCase()}
                    </Link>
                  </span>
                ))}
                <span className="muted">.</span>
              </>
            )}
          </p>
          <div className="quick">
            <Link href="/patient/urgent" className="btn">
              {labels.urgentConsult}
            </Link>
            <Link href="/patient/questions" className="btn ghost">
              {labels.askDoctor247}
            </Link>
            <Link href="/patient/labs" className="btn ghost">
              {labels.uploadLab}
            </Link>
          </div>
        </div>
      </section>

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold">
          {labels.healthMapTitle}
        </h2>

        <BodyMap
          categories={twin.categories.map((c) => ({
            id: c.id,
            title: labels.categoryNames[c.id] || c.id,
            colour: c.colour,
            colourLabel: labels.colourLabels[c.colour],
            geneticBadge: c.geneticBadge || c.rare.length > 0,
          }))}
          geneHint={labels.geneMarkerHint}
        />
      </section>
    </div>
  );
}
