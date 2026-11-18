import Link from "next/link";
import {
  formatMonitoringDue,
  listMonitoringPlan,
  monitoringKindLabel,
  monitoringStatusLabel,
  type MonitoringItem,
  type MonitoringStatus,
} from "@/lib/health/patient-monitoring-shared";
import type { HealthCardVaccine } from "@/lib/health/health-card-data";

function statusClass(status: MonitoringStatus): string {
  if (status === "overdue") return "pill c-red";
  if (status === "due_soon") return "pill c-orange";
  if (status === "scheduled") return "pill c-acc";
  return "pill plain";
}

function MonitoringRow({
  item,
  locale,
}: {
  item: MonitoringItem;
  locale: "lt" | "en";
}) {
  const title = locale === "en" ? item.titleEn : item.titleLt;
  const detail = locale === "en" ? item.detailEn : item.detailLt;
  const cadence = locale === "en" ? item.cadenceEn : item.cadenceLt;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <b>{title}</b>
            <span className="pill plain">
              {monitoringKindLabel(item.kind, locale)}
            </span>
            <span className={statusClass(item.status)}>
              {monitoringStatusLabel(item.status, locale)}
            </span>
          </div>
          <p className="small muted m-0 mt-1">{detail}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="eyebrow m-0">
            {locale === "en" ? "Next" : "Kitas terminas"}
          </div>
          <b>{formatMonitoringDue(item.nextDue, locale)}</b>
          <div className="xs muted mt-1">{cadence}</div>
        </div>
      </div>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block panel no-underline text-[var(--ink)] hover:border-[var(--accent)]"
        style={{ padding: "14px 16px" }}
      >
        {body}
      </Link>
    );
  }
  return (
    <div className="panel" style={{ padding: "14px 16px" }}>
      {body}
    </div>
  );
}

export function MonitoringPane({
  locale,
  sex,
  vaccines = [],
}: {
  locale: "lt" | "en";
  sex: "male" | "female";
  vaccines?: HealthCardVaccine[];
}) {
  const items = listMonitoringPlan({ sex, vaccines });

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="panel" style={{ padding: "14px 16px" }}>
        <h3 className="m-0 font-[family-name:var(--font-display)] text-xl">
          {locale === "en" ? "Monitoring plan" : "Stebėsenos planas"}
        </h3>
        <p className="small muted m-0 mt-2">
          {locale === "en"
            ? "Recurring checks your twin tracks: screenings, clinician-ordered markers, vaccines and prevention programmes. Dates also appear in Calendar."
            : "Periodiniai patikrinimai, kuriuos seka jūsų dvynys: atrankos, gydytojo paskirti žymenys, skiepai ir prevencinės programos. Datos matomos ir Kalendoriuje."}
        </p>
      </div>

      {items.length ? (
        <div className="stack" style={{ gap: 10 }}>
          {items.map((item) => (
            <MonitoringRow key={item.id} item={item} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="empty">
          {locale === "en"
            ? "No monitoring items yet."
            : "Stebėsenos punktų kol kas nėra."}
        </div>
      )}

      <div className="hc-link-row">
        <Link href="/patient/calendar" className="hc-chip-link">
          {locale === "en" ? "Open calendar" : "Atidaryti kalendorių"}
        </Link>
        <Link href="/patient/visits" className="hc-chip-link">
          {locale === "en" ? "Visits" : "Vizitai"}
        </Link>
        <Link href="/patient/labs" className="hc-chip-link">
          {locale === "en" ? "Labs" : "Tyrimai"}
        </Link>
      </div>
    </div>
  );
}
