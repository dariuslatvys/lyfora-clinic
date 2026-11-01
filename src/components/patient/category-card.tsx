import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";

const CSS_VAR: Record<RiskColour, string> = {
  green: "var(--r-green)",
  yellow: "var(--r-yellow)",
  orange: "var(--r-orange)",
  red: "var(--r-red)",
  grey: "var(--r-none)",
  badge: "var(--r-badge)",
};

export function CategoryCard({
  id,
  title,
  colour,
  colourLabel,
  geneticBadge,
}: {
  id: string;
  title: string;
  colour: RiskColour;
  summary?: string;
  openLabel?: string;
  colourLabel: string;
  markerCount?: number;
  snpMatches?: number;
  geneticBadge: boolean;
}) {
  return (
    <Link
      href={`/patient/digital-twin/${id}`}
      className="cat"
      style={{ ["--cc" as string]: CSS_VAR[colour] }}
    >
      <b>{title}</b>
      <div className="st">
        <span>{colourLabel}</span>
        {geneticBadge ? (
          <span className="gene-mark" title="Genetinis žymuo / Genetic marker">
            G
          </span>
        ) : null}
      </div>
    </Link>
  );
}
