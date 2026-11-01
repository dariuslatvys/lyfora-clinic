import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { patientDisplayName } from "@/lib/i18n/patient-name";
import { CategoryCard } from "@/components/patient/category-card";
import type { RiskColour } from "@/lib/health/colours";

const PEN: Record<RiskColour, number> = {
  grey: 0,
  green: 0,
  badge: 1,
  yellow: 5,
  orange: 11,
  red: 18,
};

const RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

function healthIndex(
  categories: { colour: RiskColour; geneticBadge: boolean }[]
) {
  let s = 100;
  for (const c of categories) {
    s -= PEN[c.colour] + (c.geneticBadge && c.colour === "green" ? 1 : 0);
  }
  return Math.max(18, Math.min(99, Math.round(s)));
}

function indexColor(v: number) {
  if (v >= 85) return "var(--r-green)";
  if (v >= 70) return "var(--r-yellow)";
  if (v >= 55) return "var(--r-orange)";
  return "var(--r-red)";
}

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
  const idx = healthIndex(twin.categories);
  const ringColor = indexColor(idx);
  const circumference = 2 * Math.PI * 52;
  const dash = (circumference * idx) / 100;
  const attention = twin.categories.filter((c) => RANK[c.colour] >= 3);
  const today = new Date().toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const attentionText =
    attention.length === 0
      ? labels.areasStable
      : `${attention.length} ${
          attention.length === 1
            ? labels.areaNeedsAttention
            : labels.areasNeedAttention
        }: ${attention
          .map((c) => (labels.categoryNames[c.id] || c.id).toLowerCase())
          .join(", ")}.`;

  return (
    <div className="stack" style={{ gap: 22 }}>
      <section className="hero rise-in">
        <div className="ring" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              style={{ fill: "none", stroke: "var(--line-2)", strokeWidth: 10 }}
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              style={{
                fill: "none",
                stroke: ringColor,
                strokeWidth: 10,
                strokeLinecap: "round",
                strokeDasharray: `${dash.toFixed(1)} ${circumference.toFixed(1)}`,
              }}
            />
          </svg>
          <div className="val">
            <div>
              <b className="num">{idx}</b>
              <span>{labels.of100}</span>
            </div>
          </div>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          <span className="eyebrow">
            {labels.healthIndex} · {today}
          </span>
          <h1>
            {labels.goodMorning}, {firstName(name)}
          </h1>
          <p className="muted">{attentionText}</p>
          <div className="quick">
            <Link href="/patient/visits" className="btn">
              {labels.bookVisit}
            </Link>
            <Link href="/patient/questions" className="btn ghost">
              {labels.askDoctor}
            </Link>
            <Link href="/patient/uploads" className="btn ghost">
              {labels.uploadLab}
            </Link>
          </div>
        </div>
      </section>

      <section className="stack rise-in-delay">
        <div className="row between">
          <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold">
            {labels.categoriesTitle}
          </h2>
          <span className="small muted">
            {labels.categoriesHint}{" "}
            <span className="gene-mark" title={labels.geneMarkerHint}>
              G
            </span>{" "}
            {labels.geneMarkerHint.replace(/^G\s*[–-]\s*/, "– ")}
          </span>
        </div>
        <div className="cats">
          {twin.categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              id={cat.id}
              title={labels.categoryNames[cat.id] || cat.id}
              colour={cat.colour}
              colourLabel={labels.colourLabels[cat.colour]}
              geneticBadge={cat.geneticBadge}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
