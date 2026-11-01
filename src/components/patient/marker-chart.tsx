"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

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
      <p className="text-sm text-[var(--muted)]">
        {points.length === 1
          ? `${points[0].date}: ${points[0].value}${unit ? ` ${unit}` : ""}`
          : "—"}
      </p>
    );
  }

  const data = [...points].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {refLow != null && refHigh != null && (
            <ReferenceArea
              y1={refLow}
              y2={refHigh}
              fill="rgba(27,127,90,0.08)"
              ifOverflow="extendDomain"
            />
          )}
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={42} />
          <Tooltip
            formatter={(v) => [`${v}${unit ? ` ${unit}` : ""}`, ""]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #d7ded8",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0F6B5C"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#0F6B5C" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
