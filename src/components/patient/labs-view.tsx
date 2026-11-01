"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { markerItemColour } from "@/lib/health/marker-colour";
import { PILL_CLASS, type RiskColour } from "@/lib/health/colours";
import { isPhysicalMarkerKey } from "@/lib/health/physical-metrics";
import { NormBar } from "@/components/patient/norm-bar";
import { Sparkline } from "@/components/patient/sparkline";

export type LabRow = {
  id: number;
  markerKey: string;
  name: string;
  value: number;
  unit: string | null;
  refLow: number | null;
  refHigh: number | null;
  flag: string | null;
  observedAt: string;
  source: string | null;
  categoryId?: string | null;
};

function fmtDate(iso: string, locale: "lt" | "en") {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Wearables / questionnaire — not laboratory packages. */
const NON_LAB_SOURCES = new Set([
  "oura",
  "apple-health",
  "apple_health",
  "google-fit",
  "google_fit",
  "garmin",
  "questionnaire",
  "withings",
  "fitbit",
]);

function isLabPackageRow(r: LabRow) {
  if (isPhysicalMarkerKey(r.markerKey)) return false;
  const src = (r.source || "").trim().toLowerCase();
  if (!src) return true;
  if (NON_LAB_SOURCES.has(src)) return false;
  if (/oura|apple.?health|google.?fit|garmin|fitbit|withings|wearable/.test(src))
    return false;
  return true;
}

function packageTitle(source: string | null, locale: "lt" | "en") {
  if (!source) return locale === "en" ? "Lab package" : "Tyrimų paketas";
  const key = source.trim().toLowerCase();
  if (key === "demo-female-hormones" || key === "demo-male-hormones") {
    return locale === "en" ? "Hormone panel" : "Hormonų panelė";
  }
  if (key === "neck-previsit-panel") {
    return locale === "en" ? "Pre-visit lab panel" : "Priešvizitinė tyrimų panelė";
  }
  if (key === "demo-female" || key === "demo-male") {
    return locale === "en" ? "Clinic lab panel" : "Klinikos tyrimų panelė";
  }
  return source
    .replace(/\.pdf$/i, "")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function statusLabel(colour: RiskColour, labels: Dictionary) {
  if (colour === "green") return labels.colourLabels.green;
  if (colour === "grey") return labels.colourLabels.grey;
  return labels.colourLabels[colour];
}

function markerHref(r: LabRow) {
  return r.categoryId
    ? `/patient/marker/${encodeURIComponent(r.markerKey)}?cat=${r.categoryId}`
    : `/patient/marker/${encodeURIComponent(r.markerKey)}`;
}

export function LabsView({
  rows,
  labels,
  locale,
}: {
  rows: LabRow[];
  labels: Dictionary;
  locale: "lt" | "en";
}) {
  const [tab, setTab] = useState<"markers" | "packages">("markers");
  const [q, setQ] = useState("");
  const [openPkg, setOpenPkg] = useState<string | null>(null);

  const historyByKey = useMemo(() => {
    const map = new Map<string, number[]>();
    const sorted = [...rows].sort((a, b) =>
      a.observedAt.localeCompare(b.observedAt)
    );
    for (const r of sorted) {
      const cur = map.get(r.markerKey) || [];
      cur.push(r.value);
      map.set(r.markerKey, cur);
    }
    return map;
  }, [rows]);

  const latestByKey = useMemo(() => {
    const map = new Map<string, LabRow>();
    for (const r of [...rows].sort((a, b) =>
      a.observedAt.localeCompare(b.observedAt)
    )) {
      map.set(r.markerKey, r);
    }
    return [...map.values()].sort((a, b) =>
      a.name.localeCompare(b.name, locale === "en" ? "en" : "lt")
    );
  }, [rows, locale]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return latestByKey;
    return latestByKey.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.markerKey.toLowerCase().includes(needle)
    );
  }, [latestByKey, q]);

  const packages = useMemo(() => {
    const map = new Map<
      string,
      { key: string; source: string | null; observedAt: string; items: LabRow[] }
    >();
    for (const r of rows) {
      if (!isLabPackageRow(r)) continue;
      const key = `${r.source || "paketas"}::${r.observedAt}`;
      const cur = map.get(key);
      if (cur) cur.items.push(r);
      else
        map.set(key, {
          key,
          source: r.source,
          observedAt: r.observedAt,
          items: [r],
        });
    }
    return [...map.values()]
      .filter((p) => p.items.length > 0)
      .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  }, [rows]);

  const openPackage = packages.find((p) => p.key === openPkg) || null;

  function renderRow(r: LabRow, key: string) {
    const colour = markerItemColour(r);
    const series = historyByKey.get(r.markerKey) || [r.value];
    return (
      <tr key={key}>
        <td>
          <Link href={markerHref(r)} className="labs-name">
            {r.name}
          </Link>
          <div className="labs-meta">
            {fmtDate(r.observedAt, locale)} · {r.markerKey}
          </div>
        </td>
        <td className="labs-val">
          {r.value}
          {r.unit ? ` ${r.unit}` : ""}
        </td>
        <td className="labs-ref">
          {r.refLow != null || r.refHigh != null
            ? `${r.refLow ?? "—"} – ${r.refHigh ?? "—"}`
            : "—"}
        </td>
        <td>
          <NormBar value={r.value} refLow={r.refLow} refHigh={r.refHigh} />
        </td>
        <td className="labs-spark">
          <Sparkline values={series} />
        </td>
        <td>
          <span className={`pill ${PILL_CLASS[colour]}`}>
            {statusLabel(colour, labels)}
          </span>
        </td>
      </tr>
    );
  }

  const head = (
    <thead>
      <tr>
        <th>{labels.labsIndicator}</th>
        <th>{labels.labsResult}</th>
        <th>{labels.labsNorm}</th>
        <th>{labels.labsPosition}</th>
        <th>{labels.labsChange}</th>
        <th>{labels.labsStatus}</th>
      </tr>
    </thead>
  );

  return (
    <div className="labs-wrap">
      <div className="labs-head">
        <div>
          <p className="eyebrow">
            {locale === "en" ? "Laboratory results" : "Laboratoriniai tyrimai"}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em]">
            {labels.labs}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {locale === "en"
              ? "Latest results, reference ranges and change over time. Open a marker for history and explanation."
              : "Paskutiniai rezultatai, normos ribos ir pokytis laike. Paspauskite rodiklį – pamatysite istoriją ir paaiškinimą."}
          </p>
        </div>
        <div className="quick" style={{ marginTop: 0 }}>
          <Link href="/patient/uploads" className="btn ghost">
            {labels.uploadLab}
          </Link>
          <Link href="/patient/marketplace" className="btn">
            {labels.orderLabs}
          </Link>
        </div>
      </div>

      <div className="labs-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "markers"}
          className={tab === "markers" ? "on" : ""}
          onClick={() => {
            setTab("markers");
            setOpenPkg(null);
          }}
        >
          {labels.labsByMarkers}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "packages"}
          className={tab === "packages" ? "on" : ""}
          onClick={() => setTab("packages")}
        >
          {labels.labsByPackages}
        </button>
      </div>

      {tab === "markers" && (
        <div className="labs-panel">
          <div className="labs-search">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={labels.labsSearch}
              aria-label={labels.labsSearch}
            />
          </div>
          <div className="labs-table-wrap">
            <table className="labs-table">
              {head}
              <tbody>
                {filtered.map((r) => renderRow(r, r.markerKey))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-[var(--muted)]"
                    >
                      {labels.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "packages" && !openPackage && (
        <div className="labs-panel">
          <div className="pkg-grid">
            {packages.map((p) => (
              <button
                key={p.key}
                type="button"
                className="pkg-card"
                onClick={() => setOpenPkg(p.key)}
              >
                <span className="eyebrow">{fmtDate(p.observedAt, locale)}</span>
                <b>{packageTitle(p.source, locale)}</b>
                <span className="muted text-sm">
                  {p.items.length}{" "}
                  {locale === "en" ? "markers" : "rodikliai"}
                </span>
                <span className="pkg-cta">{labels.labsPackageOpen}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "packages" && openPackage && (
        <div className="labs-panel">
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setOpenPkg(null)}
          >
            ← {labels.labsPackageBack}
          </button>
          <div className="mt-3 mb-4">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {packageTitle(openPackage.source, locale)}
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {fmtDate(openPackage.observedAt, locale)}
            </p>
          </div>
          <div className="labs-table-wrap">
            <table className="labs-table">
              {head}
              <tbody>
                {openPackage.items.map((r) =>
                  renderRow(r, `${r.id}-${r.markerKey}`)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
