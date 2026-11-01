/** Visual position of a lab value against reference range. */
export function NormBar({
  value,
  refLow,
  refHigh,
}: {
  value: number;
  refLow?: number | null;
  refHigh?: number | null;
}) {
  const hasLow = refLow != null;
  const hasHigh = refHigh != null;
  if (!hasLow && !hasHigh) {
    return <div className="norm-bar empty" aria-hidden="true" />;
  }

  const low = hasLow ? (refLow as number) : (refHigh as number) * 0.4;
  const high = hasHigh ? (refHigh as number) : (refLow as number) * 1.6;
  const span = Math.max(high - low, 0.0001);
  const pad = span * 0.35;
  const min = low - pad;
  const max = high + pad;
  const total = Math.max(max - min, 0.0001);

  const normLeft = ((low - min) / total) * 100;
  const normWidth = ((high - low) / total) * 100;
  const marker = Math.min(100, Math.max(0, ((value - min) / total) * 100));

  return (
    <div className="norm-bar" aria-hidden="true">
      <div className="norm-bar-track" />
      <div
        className="norm-bar-ok"
        style={{ left: `${normLeft}%`, width: `${normWidth}%` }}
      />
      <div className="norm-bar-marker" style={{ left: `${marker}%` }} />
    </div>
  );
}
