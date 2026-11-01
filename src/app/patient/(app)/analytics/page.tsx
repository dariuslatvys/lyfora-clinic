import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_RANK } from "@/lib/health/colours";
import {
  AnalyticsView,
  type AnalyticsCategoryRow,
  type AnalyticsSeries,
} from "@/components/patient/analytics-view";
import { DEMO_VISITS } from "@/lib/health/demo-visits";

const PEN: Record<RiskColour, number> = {
  grey: 0,
  green: 0,
  badge: 1,
  yellow: 5,
  orange: 11,
  red: 18,
};

function healthIndex(colours: { colour: RiskColour; geneticBadge: boolean }[]) {
  let s = 100;
  for (const c of colours) {
    s -= PEN[c.colour];
    if (c.geneticBadge && c.colour === "green") s -= 1;
  }
  return Math.max(18, Math.min(99, Math.round(s)));
}

function latestByKey<T extends { markerKey: string; observedAt: string }>(
  rows: T[]
) {
  const map = new Map<string, T>();
  for (const r of [...rows].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt)
  )) {
    map.set(r.markerKey, r);
  }
  return map;
}

function estimateCvRisk(markers: {
  markerKey: string;
  value: number;
  observedAt: string;
}[]) {
  const latest = latestByKey(markers);
  const ldl = latest.get("LDL") || latest.get("LDL_C");
  const sbp =
    latest.get("SBP") ||
    latest.get("BP_SYS") ||
    latest.get("SYSTOLIC_BP") ||
    latest.get("BLOOD_PRESSURE_SYS");
  if (!ldl && !sbp) {
    return { label: "—", note: null as string | null };
  }
  const ldlV = ldl?.value ?? 0;
  const sbpV = sbp?.value ?? 0;
  if (ldlV >= 4.9 || sbpV >= 160) {
    return { label: "didelė", note: localeNoteHigh(ldlV, sbpV) };
  }
  if (ldlV >= 3.0 || sbpV >= 140) {
    return { label: "vidutinė", note: null };
  }
  return { label: "maža / vidutinė", note: null };
}

function localeNoteHigh(ldl: number, sbp: number) {
  if (ldl >= 4.9) return `MTL ${ldl}`;
  if (sbp >= 160) return `AKS ${sbp}`;
  return null;
}

export default async function AnalyticsPage() {
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const index = healthIndex(
    twin.categories.map((c) => ({
      colour: c.colour,
      geneticBadge: c.geneticBadge,
    }))
  );

  const cv = estimateCvRisk(twin.markers);
  const cvLabel =
    locale === "en"
      ? cv.label === "didelė"
        ? "high"
        : cv.label === "vidutinė"
          ? "moderate"
          : cv.label === "maža / vidutinė"
            ? "low / moderate"
            : cv.label
      : cv.label;

  const categories: AnalyticsCategoryRow[] = twin.categories.map((c) => {
    const drivers: string[] = [];
    for (const m of c.markers) {
      if (m.flag === "high" || m.flag === "low") {
        drivers.push(m.name || m.markerKey);
      }
    }
    for (const s of c.snps) {
      if (s.matchCount > 0 && s.colour && COLOUR_RANK[s.colour] >= 2) {
        drivers.push(`${s.gene} ${s.snpId.split("__")[0]}`);
      }
    }
    for (const r of c.rare) {
      drivers.push(r.gene);
    }
    return {
      id: c.id,
      title: labels.categoryNames[c.id] || c.id,
      biomarkerColour: c.biomarkerColour,
      geneticColour: c.geneticColour,
      colour: c.colour,
      geneticBadge: c.geneticBadge || c.rare.length > 0,
      drivers: [...new Set(drivers)].slice(0, 4),
      href: `/patient/digital-twin/${c.id}`,
    };
  });

  const byKey = new Map<
    string,
    {
      name: string;
      unit: string | null;
      refLow: number | null;
      refHigh: number | null;
      points: { date: string; value: number }[];
    }
  >();

  for (const m of twin.markers) {
    const cur = byKey.get(m.markerKey) || {
      name: m.name || m.markerKey,
      unit: m.unit ?? null,
      refLow: m.refLow ?? null,
      refHigh: m.refHigh ?? null,
      points: [],
    };
    cur.points.push({ date: m.observedAt, value: m.value });
    if (m.refLow != null) cur.refLow = m.refLow;
    if (m.refHigh != null) cur.refHigh = m.refHigh;
    byKey.set(m.markerKey, cur);
  }

  const series: AnalyticsSeries[] = [...byKey.entries()]
    .map(([key, v]) => {
      const points = [...v.points].sort((a, b) => a.date.localeCompare(b.date));
      // collapse same-day duplicates keeping last
      const dedup = new Map<string, number>();
      for (const p of points) dedup.set(p.date.slice(0, 10), p.value);
      const uniq = [...dedup.entries()].map(([date, value]) => ({ date, value }));
      if (uniq.length < 2) return null;
      const first = uniq[0]!.value;
      const last = uniq[uniq.length - 1]!.value;
      return {
        key,
        name: v.name,
        unit: v.unit,
        refLow: v.refLow,
        refHigh: v.refHigh,
        points: uniq,
        delta: last - first,
        href: `/patient/marker/${encodeURIComponent(key)}`,
      };
    })
    .filter((x): x is AnalyticsSeries => !!x)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8);

  const visits = DEMO_VISITS.length;

  return (
    <AnalyticsView
      locale={locale}
      healthIndex={index}
      cvRiskLabel={cvLabel}
      cvRiskNote={cv.note}
      labResultCount={twin.markers.length}
      visitCount={visits}
      categories={categories}
      series={series}
    />
  );
}
