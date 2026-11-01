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
            stroke="rgba(15, 55, 45, 0.14)"
            strokeDasharray="3 6"
            vertical={false}
          />
          {refLow != null && refHigh != null && (
            <ReferenceArea
              y1={refLow}
              y2={refHigh}
              fill="rgba(15, 107, 92, 0.16)"
              stroke="rgba(15, 107, 92, 0.35)"
              strokeOpacity={1}
              ifOverflow="extendDomain"
            />
          )}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#1a2e28", fontWeight: 600 }}
            tickLine={{ stroke: "#6b857c" }}
            axisLine={{ stroke: "#6b857c" }}
            dy={4}
          />
          <YAxis
            domain={[minV - pad, maxV + pad]}
            tick={{ fontSize: 12, fill: "#1a2e28", fontWeight: 600 }}
            tickFormatter={formatTick}
            tickLine={{ stroke: "#6b857c" }}
            axisLine={{ stroke: "#6b857c" }}
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
              border: "1px solid #0F6B5C",
              background: "#f4faf7",
              color: "#0b1f1a",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(11, 40, 32, 0.12)",
            }}
            itemStyle={{ color: "#0F6B5C", fontWeight: 700 }}
            labelStyle={{ color: "#1a2e28", fontWeight: 700, marginBottom: 4 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0A5C4F"
            strokeWidth={3.5}
            dot={{
              r: 5.5,
              fill: "#0A5C4F",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#06473C",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="display"
              position="top"
              offset={10}
              className="marker-chart-label"
              fill="#06473C"
              fontSize={12}
              fontWeight={700}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
