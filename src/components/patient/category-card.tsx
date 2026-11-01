import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_HEX, COLOUR_SOFT } from "@/lib/health/colours";

export function CategoryCard({
  id,
  title,
  colour,
  summary,
  openLabel,
  colourLabel,
  markerCount,
  snpMatches,
  geneticBadge,
}: {
  id: string;
  title: string;
  colour: RiskColour;
  summary: string;
  openLabel: string;
  colourLabel: string;
  markerCount: number;
  snpMatches: number;
  geneticBadge: boolean;
}) {
  return (
    <Link
      href={`/patient/digital-twin/${id}`}
      className="category-card group"
      style={{
        borderColor: COLOUR_HEX[colour],
        background: `linear-gradient(145deg, ${COLOUR_SOFT[colour]}, rgba(255,255,255,0.72))`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: COLOUR_HEX[colour] }}
            />
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {colourLabel}
            </p>
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {title}
          </h3>
        </div>
        {geneticBadge && (
          <span className="rounded-full bg-[var(--ink)]/8 px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">
            SNP
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--ink-soft)]">
        {summary}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>
          {markerCount} · {snpMatches} SNP
        </span>
        <span className="font-medium text-[var(--accent-strong)] group-hover:translate-x-0.5 transition">
          {openLabel} →
        </span>
      </div>
    </Link>
  );
}
