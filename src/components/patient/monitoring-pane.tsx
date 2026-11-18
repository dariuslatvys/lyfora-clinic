"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatMonitoringDue,
  listMonitoringPlan,
  monitoringKindLabel,
  monitoringStatusLabel,
  type MonitoringItem,
  type MonitoringKind,
  type MonitoringStatus,
} from "@/lib/health/patient-monitoring-shared";
import type { HealthCardVaccine } from "@/lib/health/health-card-data";

const WEEKDAYS_LT = ["Pr", "An", "Tr", "Kt", "Pn", "Št", "Sk"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function statusClass(status: MonitoringStatus): string {
  if (status === "overdue") return "pill c-red";
  if (status === "due_soon") return "pill c-orange";
  if (status === "scheduled") return "pill c-acc";
  return "pill plain";
}

function kindTone(kind: MonitoringKind): string {
  switch (kind) {
    case "visit":
      return "mon-kind visit";
    case "vaccine":
      return "mon-kind vaccine";
    case "lab_recheck":
      return "mon-kind lab";
    case "screening":
      return "mon-kind screen";
    case "prevention":
      return "mon-kind prevent";
    default:
      return "mon-kind consult";
  }
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthMatrix(anchorIso: string) {
  const [y, m] = anchorIso.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: Array<{ iso: string; inMonth: boolean }> = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(y, m - 1, 1 - (startWeekday - i));
    cells.push({ iso: isoDay(d), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: isoDay(new Date(y, m - 1, day)), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!;
    const d = new Date(`${last.iso}T12:00:00`);
    d.setDate(d.getDate() + 1);
    cells.push({ iso: isoDay(d), inMonth: false });
  }
  const label = first.toLocaleDateString("lt-LT", {
    month: "long",
    year: "numeric",
  });
  const labelEn = first.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  return { cells, label, labelEn, y, m };
}

function EventCard({
  item,
  locale,
  emphasize,
}: {
  item: MonitoringItem;
  locale: "lt" | "en";
  emphasize?: boolean;
}) {
  const title = locale === "en" ? item.titleEn : item.titleLt;
  const detail = locale === "en" ? item.detailEn : item.detailLt;
  const cadence = locale === "en" ? item.cadenceEn : item.cadenceLt;
  const body = (
    <div className="mon-event-card-inner">
      <div className={`mon-event-rail ${kindTone(item.kind)}`} aria-hidden />
      <div className="mon-event-body">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="pill plain">
            {monitoringKindLabel(item.kind, locale)}
          </span>
          <span className={statusClass(item.status)}>
            {monitoringStatusLabel(item.status, locale)}
          </span>
        </div>
        <b className="block mt-1">{title}</b>
        <p className="small muted m-0 mt-1">{detail}</p>
        <div className="mon-event-meta">
          <span>
            <span className="eyebrow">
              {locale === "en" ? "When" : "Kada"}
            </span>
            <b>{formatMonitoringDue(item.nextDue, locale)}</b>
          </span>
          <span className="xs muted">{cadence}</span>
        </div>
      </div>
    </div>
  );

  const className = `mon-event-card${emphasize ? " is-selected" : ""}`;
  if (item.href) {
    return (
      <Link href={item.href} className={`${className} no-underline text-[var(--ink)]`}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
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
  const items = useMemo(
    () => listMonitoringPlan({ sex, vaccines }),
    [sex, vaccines]
  );
  const today = useMemo(() => isoDay(new Date()), []);
  const [selected, setSelected] = useState(today);
  const [anchor, setAnchor] = useState(today.slice(0, 7) + "-01");

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) {
      map[item.nextDue] = (map[item.nextDue] || 0) + 1;
    }
    return map;
  }, [items]);

  const matrix = useMemo(() => monthMatrix(anchor), [anchor]);
  const weekdays = locale === "en" ? WEEKDAYS_EN : WEEKDAYS_LT;

  const chronological = useMemo(
    () => [...items].sort((a, b) => a.nextDue.localeCompare(b.nextDue)),
    [items]
  );

  const selectedItems = chronological.filter((i) => i.nextDue === selected);
  const rest = chronological.filter((i) => i.nextDue !== selected);

  function shiftMonth(delta: number) {
    const [y, m] = anchor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setAnchor(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="panel" style={{ padding: "14px 16px" }}>
        <h3 className="m-0 font-[family-name:var(--font-display)] text-xl">
          {locale === "en" ? "Monitoring plan" : "Stebėsenos planas"}
        </h3>
        <p className="small muted m-0 mt-2">
          {locale === "en"
            ? "Calendar on the left, upcoming checks on the right — nearest first."
            : "Kairėje kalendorius, dešinėje artėjantys patikrinimai — nuo artimiausio."}
        </p>
      </div>

      <div className="doctor-cal-grid mon-plan-grid">
        <section className="card doctor-cal-month">
          <div className="card-head">
            <button
              type="button"
              className="btn ghost sm"
              aria-label={locale === "en" ? "Previous month" : "Ankstesnis mėnuo"}
              onClick={() => shiftMonth(-1)}
            >
              ←
            </button>
            <h3 className="m-0 capitalize">
              {locale === "en" ? matrix.labelEn : matrix.label}
            </h3>
            <button
              type="button"
              className="btn ghost sm"
              aria-label={locale === "en" ? "Next month" : "Kitas mėnuo"}
              onClick={() => shiftMonth(1)}
            >
              →
            </button>
          </div>
          <div className="doctor-cal-weekdays">
            {weekdays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="doctor-cal-days">
            {matrix.cells.map((cell) => {
              const n = counts[cell.iso] || 0;
              const isSelected = cell.iso === selected;
              const isToday = cell.iso === today;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={[
                    "doctor-cal-day",
                    cell.inMonth ? "" : "out",
                    isSelected ? "on" : "",
                    isToday ? "today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelected(cell.iso)}
                >
                  <b>{Number(cell.iso.slice(8))}</b>
                  {n > 0 ? <i>{n}</i> : <i className="empty" />}
                </button>
              );
            })}
          </div>
          <div className="row mt-3" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setSelected(today);
                setAnchor(today.slice(0, 7) + "-01");
              }}
            >
              {locale === "en" ? "Today" : "Šiandien"}
            </button>
            <Link href="/patient/visits" className="btn sm">
              {locale === "en" ? "Visits & calendar" : "Vizitai ir kalendorius"}
            </Link>
          </div>
        </section>

        <section className="card doctor-cal-daypanel mon-event-panel">
          <div className="card-head" style={{ alignItems: "flex-start" }}>
            <div>
              <h3 className="m-0">
                {locale === "en" ? "Upcoming events" : "Artėjantys įvykiai"}
              </h3>
              <p className="small muted m-0 mt-1">
                {locale === "en"
                  ? `${chronological.length} items · nearest → latest`
                  : `${chronological.length} punktai · nuo artimiausio`}
                {selectedItems.length
                  ? locale === "en"
                    ? ` · ${selectedItems.length} on ${selected}`
                    : ` · ${selectedItems.length} šią dieną (${selected})`
                  : ""}
              </p>
            </div>
          </div>

          {chronological.length ? (
            <div className="stack mon-event-list" style={{ gap: 10 }}>
              {selectedItems.length ? (
                <div className="stack" style={{ gap: 8 }}>
                  <span className="eyebrow">
                    {locale === "en" ? "Selected day" : "Pasirinkta diena"}
                  </span>
                  {selectedItems.map((item) => (
                    <EventCard
                      key={`sel-${item.id}`}
                      item={item}
                      locale={locale}
                      emphasize
                    />
                  ))}
                </div>
              ) : (
                <p className="small muted m-0">
                  {locale === "en"
                    ? "No monitoring events on this day — full list below."
                    : "Šią dieną stebėsenos įvykių nėra — žemiau visas sąrašas."}
                </p>
              )}

              {rest.length ? (
                <div className="stack" style={{ gap: 8 }}>
                  <span className="eyebrow">
                    {locale === "en" ? "All upcoming" : "Visi artėjantys"}
                  </span>
                  {rest.map((item) => (
                    <EventCard key={item.id} item={item} locale={locale} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty">
              {locale === "en"
                ? "No monitoring items yet."
                : "Stebėsenos punktų kol kas nėra."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
