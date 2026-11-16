import Image from "next/image";
import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_HEX } from "@/lib/health/colours";
import { CategoryGlyph } from "@/components/patient/category-glyph";

export type BodyMapCategory = {
  id: string;
  title: string;
  colour: RiskColour;
  colourLabel: string;
  geneticBadge?: boolean;
  geneticMark?: string;
};

/**
 * Clockwise from heart at 12 o'clock.
 * hormones_women / hormones_men share one slot by sex.
 */
const ORBIT_ORDER = [
  "cardiovascular",
  "hormones_women",
  "hormones_men",
  "mental",
  "metabolic",
  "immune",
  "oncology",
  "pharmacogenetics",
];

function orderCategories(categories: BodyMapCategory[]) {
  const rank = new Map(ORBIT_ORDER.map((id, i) => [id, i]));
  return [...categories].sort(
    (a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99)
  );
}

type LabelPlace = "top" | "left" | "right" | "bottom";

type Slot = {
  x: number;
  y: number;
  place: LabelPlace;
  deg: number;
};

/**
 * Heart at 12 o'clock. Remaining categories fill equal 45° steps
 * around an 8-slot ring, skipping the bottom (90°) slot so the
 * DNR hint has room and each side gets three evenly spaced nodes.
 *
 * Slots (deg): -90, -45, 0, 45, [skip 90], 135, 180, 225
 */
function slotFor(index: number): Slot {
  const iconR = 39;
  // 8 clock positions; index 4 (bottom) is reserved empty
  const slotIndex = index < 4 ? index : index + 1;
  const deg = -90 + slotIndex * 45;
  const rad = (deg * Math.PI) / 180;
  const x = 50 + iconR * Math.cos(rad);
  const y = 50 + iconR * Math.sin(rad);

  let place: LabelPlace = "right";
  if (index === 0) place = "top";
  else if (deg > -90 && deg < 90) place = "right";
  else place = "left";

  return { x, y, place, deg };
}

export function BodyMap({
  categories,
  geneHint,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
  centerLabel?: string;
}) {
  const ordered = orderCategories(categories).slice(0, 7);

  return (
    <div className="ring-map rise-in-delay">
      <div className="ring-map-stage">
        <svg className="ring-map-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="37"
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.32"
            strokeDasharray="1.15 1.05"
          />
        </svg>

        <div className="ring-map-figure" aria-hidden="true">
          <Image
            src="/brand/body-twin-hub.png"
            alt=""
            width={360}
            height={480}
            className="ring-map-photo"
            priority
          />
        </div>

        {ordered.map((c, i) => {
          const s = slotFor(i);
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`ring-node ring-place-${s.place}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                ["--cc" as string]: COLOUR_HEX[c.colour],
              }}
              data-orbit-deg={s.deg.toFixed(0)}
              data-orbit-i={i}
            >
              <span className="ring-dot">
                <CategoryGlyph id={c.id} />
              </span>
              <span className="ring-label">
                <b>{c.title}</b>
                <em>
                  {c.colourLabel}
                  {c.geneticBadge ? ` (${c.geneticMark || "DNR"})` : ""}
                </em>
              </span>
            </Link>
          );
        })}
      </div>
      <p className="ring-map-hint">{geneHint}</p>
    </div>
  );
}
