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

/** Orbit slots around the silhouette (percent of map box). */
const ORBIT: { left: string; top: string; side: "left" | "right" }[] = [
  { left: "1%", top: "6%", side: "left" },
  { left: "0%", top: "30%", side: "left" },
  { left: "1%", top: "54%", side: "left" },
  { left: "4%", top: "76%", side: "left" },
  { left: "70%", top: "6%", side: "right" },
  { left: "71%", top: "30%", side: "right" },
  { left: "70%", top: "54%", side: "right" },
  { left: "66%", top: "76%", side: "right" },
];

/** Preferred anatomical order around the figure. */
const ORBIT_ORDER = [
  "mental",
  "cardiovascular",
  "metabolic",
  "immune",
  "hormones_men",
  "hormones_women",
  "oncology",
  "pharmacogenetics",
];

/** Anchor dots on the body image (percent of figure box). */
const ANCHORS = [
  { x: 50, y: 10 },
  { x: 48, y: 28 },
  { x: 50, y: 44 },
  { x: 46, y: 58 },
  { x: 52, y: 12 },
  { x: 54, y: 30 },
  { x: 50, y: 46 },
  { x: 54, y: 60 },
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
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
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

export function BodyMap({
  categories,
  geneHint,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
}) {
  const ordered = orderCategories(categories).slice(0, 8);

  return (
    <div className="body-map rise-in-delay">
      <div className="body-map-stage">
        <div className="body-map-figure" aria-hidden="true">
          <Image
            src="/brand/health-body-anatomy.png"
            alt=""
            width={432}
            height={576}
            className="body-map-photo"
            priority
          />
          <svg
            className="body-map-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {ordered.map((c, i) => {
              const a = ANCHORS[i];
              const slot = ORBIT[i];
              const endX = slot.side === "left" ? 16 : 84;
              const endY = parseFloat(slot.top) + 7;
              return (
                <g key={c.id}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={endX}
                    y2={endY}
                    stroke={COLOUR_HEX[c.colour]}
                    strokeWidth="0.28"
                    strokeDasharray="1.1 1.2"
                    opacity="0.45"
                  />
                  <circle
                    cx={a.x}
                    cy={a.y}
                    r="1.1"
                    fill="#fff"
                    stroke={COLOUR_HEX[c.colour]}
                    strokeWidth="0.35"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {ordered.map((c, i) => {
          const slot = ORBIT[i] || ORBIT[ORBIT.length - 1];
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`body-cat body-cat-${slot.side}`}
              style={{
                left: slot.left,
                top: slot.top,
                ["--cc" as string]: COLOUR_HEX[c.colour],
              }}
            >
              <span className="body-cat-ic">
                <CatIcon id={c.id} />
              </span>
              <span className="body-cat-txt">
                <b>{c.title}</b>
                <span
                  className={`pill ${c.colour === "grey" ? "c-none" : `c-${c.colour}`}`}
                >
                  {c.colourLabel}
                </span>
              </span>
              {c.geneticBadge ? (
                <span className="gene-mark" title={geneHint}>
                  G
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
