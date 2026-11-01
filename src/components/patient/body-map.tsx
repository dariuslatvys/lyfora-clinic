import Image from "next/image";
import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_HEX } from "@/lib/health/colours";

export type BodyMapCategory = {
  id: string;
  title: string;
  colour: RiskColour;
  colourLabel: string;
  geneticBadge?: boolean;
};

const ORBIT_ORDER = [
  "mental",
  "cardiovascular",
  "metabolic",
  "immune",
  "pharmacogenetics",
  "oncology",
  "hormones_women",
  "hormones_men",
];

const ICON_PATH: Record<string, string> = {
  mental: "M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3zM9 21h6",
  cardiovascular:
    "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  metabolic: "M7 8c0-3 2-5 5-5s5 2 5 5c0 4-5 6-5 10H7c0-4 0-6 0-10zM9 21h6",
  immune: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  hormones_men: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 22v-4a6 6 0 0 1 12 0v4",
  hormones_women: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 22v-4a6 6 0 0 1 12 0v4",
  pharmacogenetics: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3",
  oncology:
    "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
};

function CatIcon({ id }: { id: string }) {
  const d = ICON_PATH[id] || ICON_PATH.immune;
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function orderCategories(categories: BodyMapCategory[]) {
  const rank = new Map(ORBIT_ORDER.map((id, i) => [id, i]));
  return [...categories].sort(
    (a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99)
  );
}

type Slot = {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  place: "top" | "bottom" | "left" | "right";
};

/** Icons on the ring; labels farther out so they never collide. */
function orbitSlots(total: number): Slot[] {
  const n = Math.max(total, 1);
  const ring = 32;
  const labelR = 44.5;
  const slots: Slot[] = [];
  for (let i = 0; i < n; i++) {
    const deg = -90 + (360 / n) * i;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x = 50 + ring * cos;
    const y = 50 + ring * sin;
    const labelX = 50 + labelR * cos;
    const labelY = 50 + labelR * sin;
    let place: Slot["place"] = "right";
    if (sin < -0.55) place = "top";
    else if (sin > 0.55) place = "bottom";
    else if (cos < 0) place = "left";
    else place = "right";
    slots.push({ x, y, labelX, labelY, place });
  }
  return slots;
}

export function BodyMap({
  categories,
  geneHint,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
  centerLabel?: string;
}) {
  const ordered = orderCategories(categories).slice(0, 8);
  const slots = orbitSlots(ordered.length);

  return (
    <div className="ring-map rise-in-delay">
      <div className="ring-map-stage">
        <svg className="ring-map-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="#d5e0e8"
            strokeWidth="0.4"
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
          const s = slots[i];
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`ring-node ring-place-${s.place}`}
              style={{
                ["--nx" as string]: `${s.x}%`,
                ["--ny" as string]: `${s.y}%`,
                ["--lx" as string]: `${s.labelX}%`,
                ["--ly" as string]: `${s.labelY}%`,
                ["--cc" as string]: COLOUR_HEX[c.colour],
              }}
            >
              <span className="ring-dot">
                <CatIcon id={c.id} />
              </span>
              <span className="ring-label">
                <b>{c.title}</b>
                <em>
                  {c.colourLabel}
                  {c.geneticBadge ? " · G" : ""}
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
