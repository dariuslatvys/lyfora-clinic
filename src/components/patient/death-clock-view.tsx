"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  DeathClockPayload,
  DeathClockUnit,
} from "@/lib/health/death-clock-shared";
import {
  projectFromWeeks,
  remainingInUnit,
} from "@/lib/health/death-clock-shared";

const UNITS: DeathClockUnit[] = [
  "years",
  "weeks",
  "days",
  "minutes",
  "seconds",
];

/** Fixed zone so SSR (UTC host) and browser match — Lyfora clinic is LT-based. */
const DISPLAY_TZ = "Europe/Vilnius";

function formatDeathDate(iso: string, locale: "lt" | "en") {
  const d = new Date(iso);
  return d.toLocaleString(locale === "en" ? "en-GB" : "lt-LT", {
    timeZone: DISPLAY_TZ,
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
  // Seed from server snapshot so first paint matches SSR; tick only after mount.
  const [now, setNow] = useState(data.builtAtMs);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [algoOpen, setAlgoOpen] = useState(false);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

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
            current: "Current situation",
            projection: "With selected recommendations",
            recs: "Recommendations",
            recsBlurb:
              "Tick the changes you will follow — the projection updates immediately.",
            gain: "gain",
            noneSelected: "No recommendations selected yet",
            delta: "Difference vs current",
            algo: "Calculation algorithm",
            algoHint: "Show the rules used for this estimate",
            catLifestyle: "Lifestyle",
            catClinical: "Clinical",
            catMonitoring: "Monitoring",
          }
        : {
            eyebrow: "Mirtingumo modelis · demo",
            title: "Death Clock",
            blurb:
              "Iliustratyvus atgalinis laikrodis pagal tyrimus (įskaitant istoriją), genetiką, retus VCF DNR pokyčius, šeimos anamnezę, klausimyną ir fizinius rodiklius — remiantis ~4000 savaičių gyvenimu.",
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
            current: "Dabartinė situacija",
            projection: "Su pažymėtomis rekomendacijomis",
            recs: "Rekomendacijos",
            recsBlurb:
              "Pažymėkite, ko laikysitės — projekcija perskaičiuojama iš karto.",
            gain: "priedas",
            noneSelected: "Dar nepažymėta jokių rekomendacijų",
            delta: "Skirtumas nuo dabartinės",
            algo: "Apskaičiavimo algoritmas",
            algoHint: "Parodyti taisykles, kaip skaičiuojama",
            catLifestyle: "Gyvensena",
            catClinical: "Klinikinė",
            catMonitoring: "Stebėsena",
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

  const catLabel = {
    lifestyle: copy.catLifestyle,
    clinical: copy.catClinical,
    monitoring: copy.catMonitoring,
  } as const;

  const selectedGain = useMemo(() => {
    let sum = 0;
    for (const r of data.recommendations) {
      if (selected.has(r.id)) sum += r.gainWeeks;
    }
    return sum;
  }, [data.recommendations, selected]);

  const withRecs = useMemo(
    () =>
      projectFromWeeks(data.birthMs, data.adjustedLifeWeeks + selectedGain),
    [data.birthMs, data.adjustedLifeWeeks, selectedGain]
  );

  const remainingMs = Math.max(0, data.projectedDeathMs - now);
  const remaining = remainingInUnit(remainingMs, unit);
  const remainingProjMs = Math.max(0, withRecs.projectedDeathMs - now);
  const remainingProj = remainingInUnit(remainingProjMs, unit);

  const lifeMs = data.adjustedLifeWeeks * 7 * 86400000;
  const livedMs = Math.max(0, now - data.birthMs);
  const livedPct = Math.min(100, Math.max(0, (livedMs / Math.max(1, lifeMs)) * 100));

  const lifeMsProj = withRecs.adjustedLifeWeeks * 7 * 86400000;
  const livedPctProj = Math.min(
    100,
    Math.max(0, (livedMs / Math.max(1, lifeMsProj)) * 100)
  );

  function toggleRec(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

      <div className="death-clock-compare">
        <section className="card death-clock-hero">
          <span className="eyebrow">{copy.current}</span>
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

        <section
          className={`card death-clock-hero death-clock-proj${
            selectedGain > 0 ? " on" : ""
          }`}
        >
          <span className="eyebrow">{copy.projection}</span>
          {selectedGain > 0 ? (
            <>
              <div className="death-clock-kpis">
                <div>
                  <span className="eyebrow">{copy.expectancy}</span>
                  <b className="death-clock-num">
                    {withRecs.expectancyYears}{" "}
                    <small>
                      {copy.years} · {withRecs.adjustedLifeWeeks} {copy.weeks}
                    </small>
                  </b>
                  <p className="small m-0 mt-1 death-clock-delta">
                    {copy.delta}: +{selectedGain} {copy.weeks}
                  </p>
                </div>
                <div>
                  <span className="eyebrow">{copy.deathDate}</span>
                  <b className="death-clock-date">
                    {formatDeathDate(withRecs.projectedDeathIso, locale)}
                  </b>
                </div>
              </div>
              <div className="death-clock-countdown">
                <span className="eyebrow">{copy.remaining}</span>
                <div className="death-clock-remain">
                  {formatBigNumber(remainingProj, unit, locale)}
                  <span>{unitLabel[unit]}</span>
                </div>
              </div>
              <div className="death-clock-timeline">
                <div className="row between">
                  <span className="eyebrow">{copy.timeline}</span>
                  <span className="xs muted">
                    {copy.lived} {livedPctProj.toFixed(1)}% · {copy.left}{" "}
                    {(100 - livedPctProj).toFixed(1)}%
                  </span>
                </div>
                <div className="death-clock-bar death-clock-bar-proj" aria-hidden="true">
                  <i style={{ width: `${livedPctProj}%` }} />
                </div>
              </div>
            </>
          ) : (
            <p className="muted small m-0 mt-3">{copy.noneSelected}</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-head" style={{ alignItems: "flex-start" }}>
          <div>
            <h3 className="m-0">{copy.recs}</h3>
            <p className="small muted m-0 mt-1">{copy.recsBlurb}</p>
          </div>
          {selectedGain > 0 ? (
            <span className="pill c-green">
              +{selectedGain} {copy.weeks}
            </span>
          ) : null}
        </div>
        <div className="stack death-clock-recs" style={{ gap: 10 }}>
          {data.recommendations.map((r) => {
            const on = selected.has(r.id);
            return (
              <label
                key={r.id}
                className={`death-clock-rec${on ? " on" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleRec(r.id)}
                />
                <div className="grow">
                  <div className="row between" style={{ gap: 8 }}>
                    <b>{locale === "en" ? r.labelEn : r.labelLt}</b>
                    <span className="pill c-green">
                      +{r.gainWeeks} {copy.weeks}
                    </span>
                  </div>
                  <p className="small muted m-0 mt-1">
                    {locale === "en" ? r.detailEn : r.detailLt}
                  </p>
                  <span className="xs muted">{catLabel[r.category]}</span>
                </div>
              </label>
            );
          })}
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

      <section className="card death-clock-algo">
        <button
          type="button"
          className="death-clock-algo-toggle"
          aria-expanded={algoOpen}
          onClick={() => setAlgoOpen((v) => !v)}
        >
          <div>
            <h3 className="m-0">{copy.algo}</h3>
            <p className="small muted m-0 mt-1">{copy.algoHint}</p>
          </div>
          <span className="pill plain c-acc" aria-hidden="true">
            {algoOpen ? "−" : "+"}
          </span>
        </button>
        {algoOpen ? (
          <ol className="death-clock-algo-list">
            {data.algorithmRules.map((rule) => (
              <li key={rule.id}>
                <b>{locale === "en" ? rule.titleEn : rule.titleLt}</b>
                <p className="small muted m-0 mt-1">
                  {locale === "en" ? rule.bodyEn : rule.bodyLt}
                </p>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <p className="small muted m-0">
        {locale === "en" ? data.disclaimerEn : data.disclaimerLt}
      </p>
    </div>
  );
}
