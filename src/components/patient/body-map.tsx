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

/** Even circle around the center hub. */
function orbitPoint(index: number, total: number) {
  const n = Math.max(total, 1);
  const startDeg = -90; // top
  const step = 360 / n;
  const deg = startDeg + index * step;
  const rad = (deg * Math.PI) / 180;
  const rx = 38;
  const ry = 38;
  const left = 50 + rx * Math.cos(rad);
  const top = 50 + ry * Math.sin(rad);
  const side: "left" | "right" = left < 50 ? "left" : "right";
  return { left, top, side };
}

export function BodyMap({
  categories,
  geneHint,
  centerLabel,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
  centerLabel?: string;
}) {
  const ordered = orderCategories(categories).slice(0, 8);
  const slots = ordered.map((_, i) => orbitPoint(i, ordered.length));

  return (
    <div className="body-map rise-in-delay">
      <div className="body-map-stage">
        <div className="body-map-orbit" aria-hidden="true" />
        <div className="body-map-hub" aria-hidden="true">
          <span>{centerLabel || "Lyfora"}</span>
        </div>

        <svg
          className="body-map-lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {ordered.map((c, i) => {
            const s = slots[i];
            return (
              <line
                key={c.id}
                x1="50"
                y1="50"
                x2={s.left}
                y2={s.top}
                stroke={COLOUR_HEX[c.colour]}
                strokeWidth="0.25"
                strokeDasharray="1 1.1"
                opacity="0.4"
              />
            );
          })}
        </svg>

        {ordered.map((c, i) => {
          const s = slots[i];
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`body-cat body-cat-${s.side}`}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
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
