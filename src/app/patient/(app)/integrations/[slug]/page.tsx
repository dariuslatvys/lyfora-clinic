import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { t } from "@/lib/i18n/dictionary";
import {
  formatSyncWhen,
  getIntegrationDemo,
} from "@/lib/health/integrations-demo";

export default async function IntegrationSummaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const demo = getIntegrationDemo(slug);
  if (!demo) notFound();

  const title = locale === "en" ? demo.titleEn : demo.titleLt;
  const blurb = locale === "en" ? demo.blurbEn : demo.blurbLt;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Link href="/patient/integrations" className="text-sm text-[var(--muted)]">
        ← {labels.integrations}
      </Link>

      <section className="panel">
        <div className="row between" style={{ alignItems: "flex-start", gap: 12 }}>
          <div>
            <span className="eyebrow">
              {locale === "en" ? "Integration summary" : "Integracijos santrauka"}
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-[1.7rem] font-bold mt-1 mb-0">
              {title}
            </h1>
            <p className="mt-2 mb-0 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              {blurb}
            </p>
          </div>
          <span className="pill c-green">
            {locale === "en" ? "Connected" : "Prijungta"}
          </span>
        </div>
        <p className="integ-sync-banner mt-4 mb-0">
          <span className="eyebrow">
            {locale === "en" ? "Last sync" : "Paskutinė sinchronizacija"}
          </span>
          <strong>{formatSyncWhen(demo.syncedAt, locale)}</strong>
          <span className="small muted">
            {locale === "en" ? "Europe/Vilnius" : "Europa/Vilnius"}
          </span>
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {locale === "en" ? "Latest snapshot" : "Naujausia būsena"}
          </h2>
          <span className="pill plain c-acc">{demo.metrics.length}</span>
        </div>
        <div className="integ-metric-grid mt-3">
          {demo.metrics.map((m) => {
            const label = locale === "en" ? m.labelEn : m.labelLt;
            const hint = locale === "en" ? m.hintEn : m.hintLt;
            const inner = (
              <>
                <p className="eyebrow mb-1">{label}</p>
                <p className="integ-metric-value m-0">{m.value}</p>
                {hint ? <p className="small muted m-0 mt-1">{hint}</p> : null}
              </>
            );
            if (m.markerKey) {
              const href = m.cat
                ? `/patient/marker/${encodeURIComponent(m.markerKey)}?cat=${m.cat}`
                : `/patient/marker/${encodeURIComponent(m.markerKey)}`;
              return (
                <Link key={m.id} href={href} className="integ-metric clickable">
                  {inner}
                </Link>
              );
            }
            return (
              <div key={m.id} className="integ-metric">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {demo.series.map((s) => {
        const seriesTitle = locale === "en" ? s.titleEn : s.titleLt;
        const href = s.markerKey
          ? s.cat
            ? `/patient/marker/${encodeURIComponent(s.markerKey)}?cat=${s.cat}`
            : `/patient/marker/${encodeURIComponent(s.markerKey)}`
          : null;
        return (
          <section key={seriesTitle} className="card">
            <div className="card-head">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
                {seriesTitle}
              </h2>
              {href ? (
                <Link href={href} className="btn ghost sm">
                  {locale === "en" ? "Open marker" : "Atidaryti rodiklį"}
                </Link>
              ) : null}
            </div>
            <p className="small muted mt-1 mb-3">
              {locale === "en"
                ? `Imported series · ${s.unit}`
                : `Importuota istorija · ${s.unit}`}
            </p>
            <div className="overflow-x-auto">
              <table className="labs-table">
                <thead>
                  <tr>
                    <th>{locale === "en" ? "Date" : "Data"}</th>
                    <th>{locale === "en" ? "Value" : "Reikšmė"}</th>
                    <th>{locale === "en" ? "Source" : "Šaltinis"}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...s.points].reverse().map((p) => (
                    <tr key={`${p.date}-${p.value}`}>
                      <td>{p.date}</td>
                      <td className="labs-val">
                        {Number.isInteger(p.value)
                          ? p.value.toLocaleString(locale === "en" ? "en-GB" : "lt-LT")
                          : String(p.value).replace(".", ",")}{" "}
                        {s.unit}
                      </td>
                      <td className="small muted">
                        {locale === "en"
                          ? `imported from ${title}`
                          : `importuota iš ${title}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <div className="row" style={{ gap: 8 }}>
        <Link href="/patient/integrations" className="btn ghost">
          {labels.integrations}
        </Link>
        <Link href="/patient/digital-twin" className="btn ghost">
          {labels.navOverview}
        </Link>
      </div>
    </div>
  );
}
