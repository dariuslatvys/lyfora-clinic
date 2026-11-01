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
  { left: "2%", top: "8%", side: "left" },
  { left: "0%", top: "32%", side: "left" },
  { left: "2%", top: "56%", side: "left" },
  { left: "6%", top: "78%", side: "left" },
  { left: "68%", top: "8%", side: "right" },
  { left: "70%", top: "32%", side: "right" },
  { left: "68%", top: "56%", side: "right" },
  { left: "64%", top: "78%", side: "right" },
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

/** Anchor dots on the body for dotted connectors. */
const ANCHORS = [
  { x: 42, y: 14 },
  { x: 38, y: 32 },
  { x: 40, y: 48 },
  { x: 36, y: 62 },
  { x: 58, y: 14 },
  { x: 62, y: 32 },
  { x: 60, y: 48 },
  { x: 64, y: 62 },
];

const ICON_PATH: Record<string, string> = {
  mental: "M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3zM9 21h6",
  cardiovascular:
    "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  metabolic: "M7 8c0-3 2-5 5-5s5 2 5 5c0 4-5 6-5 10H7c0-4-0-6 0-10zM9 21h6",
  immune: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  hormones_men: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 22v-4a6 6 0 0 1 12 0v4",
  hormones_women: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 22v-4a6 6 0 0 1 12 0v4",
  pharmacogenetics: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3",
  oncology: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
};

function CatIcon({ id }: { id: string }) {
  const d = ICON_PATH[id] || ICON_PATH.immune;
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function BodySilhouette() {
  return (
    <svg
      className="body-map-silhouette"
      viewBox="0 0 200 420"
      role="img"
      aria-label="Žmogaus siluetas"
    >
      <defs>
        <linearGradient id="bodyFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9fd9ff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#6bb8e8" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#3d8fbf" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="organGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7ec8ff" stopOpacity="0.15" />
        </linearGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* torso outline */}
      <path
        d="M100 28c-16 0-28 12-28 28v18c-18 8-30 28-30 52v34c0 14 6 26 16 34l-10 78c-2 14 6 28 20 32l12 4v58c0 10 6 18 16 18h8c10 0 16-8 16-18v-58l12-4c14-4 22-18 20-32l-10-78c10-8 16-20 16-34v-34c0-24-12-44-30-52V56c0-16-12-28-28-28z"
        fill="url(#bodyFill)"
        stroke="#5aa8d4"
        strokeWidth="2"
      />

      {/* head */}
      <ellipse cx="100" cy="42" rx="26" ry="30" fill="url(#bodyFill)" stroke="#5aa8d4" strokeWidth="2" />

      {/* brain */}
      <ellipse cx="100" cy="38" rx="14" ry="10" fill="#3dd68c" opacity="0.85" filter="url(#softGlow)" className="organ organ-brain" />

      {/* heart */}
      <path
        d="M92 118c0-6 5-10 10-6 5-4 10 0 10 6 0 8-10 16-10 16s-10-8-10-16z"
        fill="#ff5a5f"
        opacity="0.92"
        filter="url(#softGlow)"
        className="organ organ-heart"
      />

      {/* lungs hint */}
      <ellipse cx="82" cy="128" rx="12" ry="20" fill="url(#organGlow)" opacity="0.55" />
      <ellipse cx="118" cy="128" rx="12" ry="20" fill="url(#organGlow)" opacity="0.55" />

      {/* liver */}
      <path
        d="M78 168c8-10 28-12 42-4 8 4 10 14 4 20-10 8-28 10-40 2-8-5-10-12-6-18z"
        fill="#f0b429"
        opacity="0.75"
        filter="url(#softGlow)"
        className="organ organ-liver"
      />

      {/* gut */}
      <ellipse cx="100" cy="210" rx="22" ry="28" fill="#2f9e44" opacity="0.55" filter="url(#softGlow)" className="organ organ-gut" />

      {/* hotspot dots */}
      {[
        [100, 38],
        [100, 122],
        [100, 175],
        [100, 210],
        [100, 255],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="#fff"
          opacity="0.95"
          className="body-hotspot"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
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
          <div className="body-map-ring" />
          <BodySilhouette />
          <svg className="body-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {ordered.map((c, i) => {
              const a = ANCHORS[i];
              const slot = ORBIT[i];
              const endX = slot.side === "left" ? 18 : 82;
              const endY = parseFloat(slot.top) + 6;
              return (
                <line
                  key={c.id}
                  x1={a.x}
                  y1={a.y}
                  x2={endX}
                  y2={endY}
                  stroke={COLOUR_HEX[c.colour]}
                  strokeWidth="0.35"
                  strokeDasharray="1.2 1.1"
                  opacity="0.55"
                />
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
                <span className={`pill ${c.colour === "grey" ? "c-none" : `c-${c.colour}`}`}>
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
