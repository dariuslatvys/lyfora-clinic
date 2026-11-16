"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
  LabelList,
} from "recharts";

function shortDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[2]}.${m[3]}`;
}

function formatTick(v: number) {
  if (Number.isInteger(v)) return String(v);
  const abs = Math.abs(v);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export function MarkerChart({
  points,
  refLow,
  refHigh,
  unit,
}: {
  points: { date: string; value: number }[];
  refLow?: number | null;
  refHigh?: number | null;
  unit?: string | null;
}) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-[var(--ink)] font-semibold">
        {points.length === 1
          ? `${points[0].date}: ${points[0].value}${unit ? ` ${unit}` : ""}`
          : "—"}
      </p>
    );
  }

  const data = [...points]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({
      ...p,
      label: shortDate(p.date),
      display: formatTick(p.value),
    }));

  const values = data.map((d) => d.value);
  const minV = Math.min(...values, refLow ?? Infinity);
  const maxV = Math.max(...values, refHigh ?? -Infinity);
  const pad = (maxV - minV || Math.abs(maxV) || 1) * 0.12;

  return (
    <div className="marker-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 28, right: 16, left: 4, bottom: 4 }}
        >
          <CartesianGrid
            stroke="rgba(227, 236, 232, 0.12)"
            strokeDasharray="3 6"
            vertical={false}
          />
          {refLow != null && refHigh != null && (
            <ReferenceArea
              y1={refLow}
              y2={refHigh}
              fill="rgba(92, 201, 167, 0.12)"
              stroke="rgba(92, 201, 167, 0.35)"
              strokeOpacity={1}
              ifOverflow="extendDomain"
            />
          )}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#bccbc5", fontWeight: 600 }}
            tickLine={{ stroke: "#8aa099" }}
            axisLine={{ stroke: "#8aa099" }}
            dy={4}
          />
          <YAxis
            domain={[minV - pad, maxV + pad]}
            tick={{ fontSize: 12, fill: "#bccbc5", fontWeight: 600 }}
            tickFormatter={formatTick}
            tickLine={{ stroke: "#8aa099" }}
            axisLine={{ stroke: "#8aa099" }}
            width={48}
          />
          <Tooltip
            formatter={(v) => [
              `${typeof v === "number" ? formatTick(v) : v}${
                unit ? ` ${unit}` : ""
              }`,
              unit || "Reikšmė",
            ]}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as { date?: string } | undefined;
              return row?.date || "";
            }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #5cc9a7",
              background: "#152420",
              color: "#e3ece8",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
            }}
            itemStyle={{ color: "#5cc9a7", fontWeight: 700 }}
            labelStyle={{ color: "#e3ece8", fontWeight: 700, marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#7EE0C0"
            strokeWidth={4}
            dot={{
              r: 6,
              fill: "#7EE0C0",
              stroke: "#0b1412",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 8,
              fill: "#a8f0d6",
              stroke: "#0b1412",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="display"
              position="top"
              offset={10}
              className="marker-chart-label"
              fill="#cfece0"
              fontSize={12}
              fontWeight={700}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
