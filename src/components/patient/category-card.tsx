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
  geneticMark = "DNR",
  href,
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
  geneticMark?: string;
  /** Pass null to render a non-link tile (e.g. doctor read-only chart). */
  href?: string | null;
}) {
  const resolvedHref =
    href === null ? null : href ?? `/patient/digital-twin/${id}`;
  const className = "cat";
  const style = { ["--cc" as string]: CSS_VAR[colour] };
  const body = (
    <>
      <b>{title}</b>
      <div className="st">
        <span>{colourLabel}</span>
        {geneticBadge ? (
          <span className="gene-mark" title={geneticMark}>
            ({geneticMark})
          </span>
        ) : null}
      </div>
    </>
  );

  if (!resolvedHref) {
    return (
      <div className={className} style={style}>
        {body}
      </div>
    );
  }

  return (
    <Link href={resolvedHref} className={className} style={style}>
      {body}
    </Link>
  );
}
