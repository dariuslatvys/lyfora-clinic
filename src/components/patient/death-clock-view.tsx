"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DeathClockPayload,
  DeathClockUnit,
} from "@/lib/health/death-clock-shared";
import { remainingInUnit } from "@/lib/health/death-clock-shared";

const UNITS: DeathClockUnit[] = [
  "years",
  "weeks",
  "days",
  "minutes",
  "seconds",
];

function formatDeathDate(iso: string, locale: "lt" | "en") {
  const d = new Date(iso);
  return d.toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBigNumber(n: number, unit: DeathClockUnit, locale: "lt" | "en") {
  if (unit === "years") {
    return n.toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
      maximumFractionDigits: 2,
    });
  }
  return Math.max(0, Math.floor(n)).toLocaleString(
    locale === "en" ? "en-GB" : "lt-LT"
  );
}

export function DeathClockView({ data }: { data: DeathClockPayload }) {
  const locale = data.locale;
  const [unit, setUnit] = useState<DeathClockUnit>("weeks");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, data.projectedDeathMs - now);
  const remaining = remainingInUnit(remainingMs, unit);
  const livedMs = Math.max(0, now - (data.projectedDeathMs - data.adjustedLifeWeeks * 7 * 86400000));
  const lifeMs = data.adjustedLifeWeeks * 7 * 86400000;
  const livedPct = Math.min(100, Math.max(0, (livedMs / Math.max(1, lifeMs)) * 100));

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Mortality model · demo",
            title: "Death Clock",
            blurb:
              "An illustrative countdown from your labs (including history), genetics, rare VCF findings, family history, questionnaire and physical metrics — anchored to ~4000 weeks of life.",
            expectancy: "Modelled life expectancy",
            years: "years",
            weeks: "weeks",
            deathDate: "Projected expiration",
            remaining: "Time remaining",
            unit: "Show as",
            unitSeconds: "Seconds",
            unitMinutes: "Minutes",
            unitDays: "Days",
            unitWeeks: "Weeks",
            unitYears: "Years",
            timeline: "Life timeline",
            lived: "Lived",
            left: "Remaining",
            causes: "Potential causes of death",
            drivers: "What moved the estimate",
            base: "Baseline",
            of: "of",
          }
        : {
            eyebrow: "Mirtingumo modelis · demo",
            title: "Death Clock",
            blurb:
              "Iliustratyvus atgalinis laikrodis pagal tyrimus (įskaitant istoriją), genetiką, retas VCF mutacijas, šeimos anamnezę, klausimyną ir fizinius rodiklius — remiantis ~4000 savaičių gyvenimu.",
            expectancy: "Modeliuojama gyvenimo trukmė",
            years: "metų",
            weeks: "savaičių",
            deathDate: "Prognozuojama data",
            remaining: "Liko",
            unit: "Rodyti",
            unitSeconds: "Sekundėmis",
            unitMinutes: "Minutėmis",
            unitDays: "Dienomis",
            unitWeeks: "Savaitėmis",
            unitYears: "Metais",
            timeline: "Gyvenimo juosta",
            lived: "Pragyventa",
            left: "Liko",
            causes: "Galimos mirties priežastys",
            drivers: "Kas pakoregavo įvertį",
            base: "Bazė",
            of: "iš",
          },
    [locale]
  );

  const unitLabel: Record<DeathClockUnit, string> = {
    seconds: copy.unitSeconds,
    minutes: copy.unitMinutes,
    days: copy.unitDays,
    weeks: copy.unitWeeks,
    years: copy.unitYears,
  };

  return (
    <div className="stack death-clock" style={{ gap: 18 }}>
      <div className="page-head">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {copy.title}
          </h1>
          <p className="mt-2 mb-0 max-w-2xl text-sm text-[var(--muted)]">
            {copy.blurb}
          </p>
        </div>
      </div>

      <section className="card death-clock-hero">
        <div className="death-clock-kpis">
          <div>
            <span className="eyebrow">{copy.expectancy}</span>
            <b className="death-clock-num">
              {data.expectancyYears}{" "}
              <small>
                {copy.years} · {data.adjustedLifeWeeks} {copy.weeks}
              </small>
            </b>
            <p className="small muted m-0 mt-1">
              {copy.base}: {data.baseLifeWeeks} {copy.weeks}
            </p>
          </div>
          <div>
            <span className="eyebrow">{copy.deathDate}</span>
            <b className="death-clock-date">
              {formatDeathDate(data.projectedDeathIso, locale)}
            </b>
          </div>
        </div>

        <div className="death-clock-countdown">
          <div className="row between" style={{ alignItems: "end", gap: 12 }}>
            <div>
              <span className="eyebrow">{copy.remaining}</span>
              <div className="death-clock-remain">
                {formatBigNumber(remaining, unit, locale)}
                <span>{unitLabel[unit]}</span>
              </div>
            </div>
            <label className="death-clock-unit stack" style={{ gap: 4 }}>
              <span className="eyebrow">{copy.unit}</span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as DeathClockUnit)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {unitLabel[u]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="death-clock-timeline">
          <div className="row between">
            <span className="eyebrow">{copy.timeline}</span>
            <span className="xs muted">
              {copy.lived} {livedPct.toFixed(1)}% · {copy.left}{" "}
              {(100 - livedPct).toFixed(1)}%
            </span>
          </div>
          <div className="death-clock-bar" aria-hidden="true">
            <i style={{ width: `${livedPct}%` }} />
          </div>
        </div>
      </section>

      <div className="death-clock-split">
        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.causes}</h3>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {data.causes.map((c) => (
              <div key={c.id} className="death-clock-cause">
                <div className="row between">
                  <b>{locale === "en" ? c.labelEn : c.labelLt}</b>
                  <span className="pill c-acc">
                    {Math.round(c.weight * 100)}%
                  </span>
                </div>
                <div className="death-clock-cause-bar" aria-hidden="true">
                  <i style={{ width: `${c.weight * 100}%` }} />
                </div>
                <p className="small muted m-0 mt-2">
                  {locale === "en" ? c.noteEn : c.noteLt}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h3 className="m-0">{copy.drivers}</h3>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {data.drivers.map((d) => (
              <div key={d.id} className="doctor-appt-row">
                <div className="doctor-appt-main">
                  <b>{locale === "en" ? d.labelEn : d.labelLt}</b>
                </div>
                <span
                  className={`pill ${
                    d.kind === "risk"
                      ? "c-orange"
                      : d.kind === "protect"
                        ? "c-green"
                        : "c-acc"
                  }`}
                >
                  {d.deltaWeeks > 0 ? "+" : ""}
                  {d.deltaWeeks} {copy.weeks}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="small muted m-0">
        {locale === "en" ? data.disclaimerEn : data.disclaimerLt}
      </p>
    </div>
  );
}
