/** Tiny trend sparkline from chronological values. */
export function Sparkline({
  values,
  width = 96,
  height = 32,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return <span className="spark-empty">—</span>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padX = 3;
  const padY = 3;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * innerW;
    const y = padY + innerH - ((v - min) / span) * innerH;
    return { x, y };
  });

  const points = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const first = coords[0];
  const lastPt = coords[coords.length - 1];
  const area = `${first.x.toFixed(1)},${(padY + innerH).toFixed(1)} ${points} ${lastPt.x.toFixed(1)},${(padY + innerH).toFixed(1)}`;

  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const firstVal = values[0];
  const rising = last > prev;
  const falling = last < prev;
  const stroke = rising ? "#e03131" : falling ? "#12b886" : "#687a74";
  const fill = rising
    ? "rgba(224,49,49,0.14)"
    : falling
      ? "rgba(18,184,134,0.14)"
      : "rgba(104,122,116,0.12)";

  const deltaPct =
    firstVal !== 0 ? ((last - firstVal) / Math.abs(firstVal)) * 100 : null;
  const deltaLabel =
    deltaPct == null
      ? ""
      : `${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(0)}%`;

  return (
    <span className="spark-wrap" title={`${values.join(" → ")}${deltaLabel ? ` (${deltaLabel})` : ""}`}>
      <svg
        className="sparkline"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <polygon fill={fill} stroke="none" points={area} />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx={lastPt.x} cy={lastPt.y} r="2.6" fill={stroke} />
      </svg>
      {deltaLabel ? (
        <span className="spark-delta" style={{ color: stroke }}>
          {deltaLabel}
        </span>
      ) : null}
    </span>
  );
}
