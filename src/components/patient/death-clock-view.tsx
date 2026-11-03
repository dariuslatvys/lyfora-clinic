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

type DriverSort = "cuts" | "adds" | "abs";

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

function formatDeathDay(iso: string, locale: "lt" | "en") {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
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
  const [driverSort, setDriverSort] = useState<DriverSort>("cuts");
  const [openRecId, setOpenRecId] = useState<string | null>(null);

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
            blurbs: [
              "An illustrative countdown from your labs (including history), genetics, rare VCF DNA changes, family history, questionnaire and physical metrics.",
              "Anchored to about 4000 weeks of life.",
            ],
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
            now: "Now",
            start: "Birth",
            end: "Projected end",
            causes: "Potential causes of death",
            drivers: "What moved the estimate",
            base: "Baseline",
            of: "of",
            current: "Current situation",
            forPatient: "Calculated for",
            sexMale: "Male",
            sexFemale: "Female",
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
            selectAll: "Select all",
            clearAll: "Clear all",
            sortCuts: "Biggest cuts",
            sortAdds: "Biggest gains",
            sortAbs: "By impact",
            openPlan: "Open plan",
            closePlan: "Close",
            whyTitle: "Why this matters",
            planTitle: "Action plan",
            applyRec: "I will follow this",
            removeRec: "Uncheck",
          }
        : {
            eyebrow: "Mirtingumo modelis · demo",
            title: "Death Clock",
            blurbs: [
              "Iliustratyvus atgalinis laikrodis pagal tyrimus (įskaitant istoriją), genetiką, retus VCF DNR pokyčius, šeimos anamnezę, klausimyną ir fizinius rodiklius.",
              "Remiasi ~4000 savaičių gyvenimo modeliu.",
            ],
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
            now: "Dabar",
            start: "Gimimas",
            end: "Prognozės pabaiga",
            causes: "Galimos mirties priežastys",
            drivers: "Kas pakoregavo įvertį",
            base: "Bazė",
            of: "iš",
            current: "Dabartinė situacija",
            forPatient: "Skaičiuojama",
            sexMale: "Vyras",
            sexFemale: "Moteris",
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
            selectAll: "Pažymėti visas",
            clearAll: "Nuimti visas",
            sortCuts: "Daugiausiai atima",
            sortAdds: "Daugiausiai prideda",
            sortAbs: "Pagal poveikį",
            openPlan: "Atidaryti planą",
            closePlan: "Uždaryti",
            whyTitle: "Kodėl tai svarbu",
            planTitle: "Veiksmų planas",
            applyRec: "Laikysiuosi šios",
            removeRec: "Nuimti žymėjimą",
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

  function selectAllRecs() {
    setSelected(new Set(data.recommendations.map((r) => r.id)));
  }

  function clearAllRecs() {
    setSelected(new Set());
  }

  const allSelected =
    data.recommendations.length > 0 &&
    data.recommendations.every((r) => selected.has(r.id));

  const sortedDrivers = useMemo(() => {
    const rows = [...data.drivers];
    if (driverSort === "adds") {
      rows.sort((a, b) => b.deltaWeeks - a.deltaWeeks);
    } else if (driverSort === "cuts") {
      rows.sort((a, b) => a.deltaWeeks - b.deltaWeeks);
    } else {
      rows.sort((a, b) => Math.abs(b.deltaWeeks) - Math.abs(a.deltaWeeks));
    }
    return rows;
  }, [data.drivers, driverSort]);


  const birthLabel = data.dob
    ? new Date(`${data.dob}T12:00:00`).toLocaleDateString(
        locale === "en" ? "en-GB" : "lt-LT",
        { timeZone: DISPLAY_TZ, year: "numeric", month: "short", day: "numeric" }
      )
    : copy.start;

  const endLabelCurrent = formatDeathDay(data.projectedDeathIso, locale);
  const endLabelProj = formatDeathDay(withRecs.projectedDeathIso, locale);

  function TimelineBar({
    pct,
    endLabel,
    variant,
  }: {
    pct: number;
    endLabel: string;
    variant?: "proj";
  }) {
    const safe = Math.min(100, Math.max(0, pct));
    return (
      <div className="death-clock-timeline">
        <div className="row between" style={{ alignItems: "baseline", gap: 8 }}>
          <span className="eyebrow">{copy.timeline}</span>
          <span className="xs muted">
            {copy.lived} {safe.toFixed(1)}% · {copy.left}{" "}
            {(100 - safe).toFixed(1)}%
          </span>
        </div>
        <div
          className={`death-clock-track${variant === "proj" ? " proj" : ""}`}
          role="img"
          aria-label={`${copy.now}: ${safe.toFixed(1)}%`}
        >
          <div className="death-clock-track-fill" aria-hidden="true" />
          <span
            className="death-clock-now"
            style={{ left: `${safe}%` }}
            title={copy.now}
          >
            <i />
            <em>{copy.now}</em>
          </span>
        </div>
        <div className="death-clock-ends">
          <span>
            <b>{copy.start}</b>
            <small>{birthLabel}</small>
          </span>
          <span className="death-clock-ends-now">
            <b>{copy.now}</b>
            <small>{safe.toFixed(1)}%</small>
          </span>
          <span className="end">
            <b>{copy.end}</b>
            <small>{endLabel}</small>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="stack death-clock" style={{ gap: 18 }}>
      <div className="page-head death-clock-head">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="font-[family-name:var(--font-display)] text-[1.9rem] font-bold tracking-[-0.01em] m-0">
            {copy.title}
          </h1>
          <p className="death-clock-blurb">
            {copy.blurbs.join(" ")}
          </p>
          <p className="death-clock-who m-0 mt-2">
            {copy.forPatient}: <b>{data.patientName}</b>
            {" · "}
            {data.sex === "female" ? copy.sexFemale : copy.sexMale}
            {data.ageYears != null ? ` · ${data.ageYears}` : ""}
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

          <TimelineBar pct={livedPct} endLabel={endLabelCurrent} />
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
              <TimelineBar
                pct={livedPctProj}
                endLabel={endLabelProj}
                variant="proj"
              />
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
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn ghost sm"
              onClick={allSelected ? clearAllRecs : selectAllRecs}
            >
              {allSelected ? copy.clearAll : copy.selectAll}
            </button>
            {selectedGain > 0 ? (
              <span className="pill c-green">
                +{selectedGain} {copy.weeks}
              </span>
            ) : null}
          </div>
        </div>
        <div className="stack death-clock-recs" style={{ gap: 10 }}>
          {data.recommendations.map((r) => {
            const on = selected.has(r.id);
            const isOpen = openRecId === r.id;
            return (
              <div
                key={r.id}
                className={`death-clock-rec${on ? " on" : ""}${
                  isOpen ? " open" : ""
                }`}
              >
                <div className="death-clock-rec-main">
                  <label className="death-clock-rec-check">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleRec(r.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>
                  <button
                    type="button"
                    className="death-clock-rec-body"
                    onClick={() =>
                      setOpenRecId((prev) => (prev === r.id ? null : r.id))
                    }
                    aria-expanded={isOpen}
                  >
                    <div className="row between" style={{ gap: 8 }}>
                      <b>{locale === "en" ? r.labelEn : r.labelLt}</b>
                      <span className="pill c-green">
                        +{r.gainWeeks} {copy.weeks}
                      </span>
                    </div>
                    <p className="small muted m-0 mt-1">
                      {locale === "en" ? r.detailEn : r.detailLt}
                    </p>
                    <span className="xs muted">
                      {catLabel[r.category]} ·{" "}
                      {isOpen ? copy.closePlan : copy.openPlan}
                    </span>
                  </button>
                </div>
                {isOpen ? (
                  <div className="death-clock-rec-detail">
                    <p className="eyebrow m-0">{copy.whyTitle}</p>
                    <p className="small m-0 mt-1">
                      {locale === "en"
                        ? r.explainEn || r.detailEn
                        : r.explainLt || r.detailLt}
                    </p>
                    <p className="eyebrow m-0 mt-3">{copy.planTitle}</p>
                    <ol className="death-clock-rec-actions">
                      {(locale === "en"
                        ? r.actionsEn || []
                        : r.actionsLt || []
                      ).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <div className="row mt-3" style={{ gap: 8 }}>
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => {
                          if (!on) toggleRec(r.id);
                        }}
                      >
                        {copy.applyRec}
                      </button>
                      {on ? (
                        <button
                          type="button"
                          className="btn ghost sm"
                          onClick={() => toggleRec(r.id)}
                        >
                          {copy.removeRec}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
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
          <div
            className="card-head"
            style={{ alignItems: "flex-start", gap: 10 }}
          >
            <h3 className="m-0">{copy.drivers}</h3>
            <div className="death-clock-sort" role="group">
              {(
                [
                  ["cuts", copy.sortCuts],
                  ["adds", copy.sortAdds],
                  ["abs", copy.sortAbs],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={driverSort === id ? "on" : undefined}
                  onClick={() => setDriverSort(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {sortedDrivers.map((d) => (
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
