"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import type { BodyMapCategory } from "@/components/patient/body-map";
import { COLOUR_HEX, type RiskColour } from "@/lib/health/colours";
import {
  FEMALE_OVERVIEW_ORDER,
  MALE_OVERVIEW_ORDER,
  type HealthCategoryId,
} from "@/lib/health/categories";

type Slot = {
  x: number;
  y: number;
  deg: number;
  side: "left" | "right" | "top" | "bottom";
};

/** Organ / focus point inside the figure (viewBox 0–100). */
type BodyFocus = {
  x: number;
  y: number;
  mode: "heart" | "brain" | "pelvis" | "gut" | "body" | "outline";
};

const FOCUS_BY_ID: Record<string, BodyFocus> = {
  cardio_metabolic: { x: 51, y: 36, mode: "heart" },
  cardiovascular: { x: 51, y: 36, mode: "heart" },
  mental: { x: 50, y: 20, mode: "brain" },
  reproductive: { x: 50, y: 58, mode: "pelvis" },
  hormones_women: { x: 50, y: 58, mode: "pelvis" },
  pharmacogenetics: { x: 50, y: 48, mode: "gut" },
  physical: { x: 50, y: 48, mode: "body" },
  oncology: { x: 50, y: 42, mode: "outline" },
  metabolic: { x: 50, y: 48, mode: "gut" },
  immune: { x: 50, y: 40, mode: "body" },
  hormones_men: { x: 50, y: 55, mode: "pelvis" },
};

/**
 * Hand-tuned orbits so labels clear the head/shoulders.
 * Degrees: 0 = right, 90 = bottom (CSS y grows downward).
 */
const PRESET_SLOTS: Record<number, number[]> = {
  5: [-38, 28, 95, 165, 232],
  6: [-42, 18, 78, 128, 188, 248],
  7: [-48, 8, 52, 98, 148, 198, 252],
  8: [-52, 0, 42, 84, 126, 168, 210, 252],
};

function sideForDeg(deg: number): Slot["side"] {
  if (deg >= -58 && deg <= -28) return "top";
  if (deg > -28 && deg < 72) return "right";
  if (deg >= 72 && deg <= 138) return "bottom";
  return "left";
}

function slotsForCount(n: number): Slot[] {
  const angles =
    PRESET_SLOTS[n] ||
    Array.from({ length: n }, (_, i) => -48 + (360 / n) * i);
  const rx = 47.5;
  const ry = 43.5;
  return angles.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: 50 + rx * Math.cos(rad),
      y: 49 + ry * Math.sin(rad),
      deg,
      side: sideForDeg(deg),
    };
  });
}

function orderForSex(
  categories: BodyMapCategory[],
  sex: "male" | "female"
): BodyMapCategory[] {
  const order =
    sex === "female" ? FEMALE_OVERVIEW_ORDER : MALE_OVERVIEW_ORDER;
  const byId = new Map(categories.map((c) => [c.id, c]));
  const ordered = order
    .map((id) => byId.get(id))
    .filter((c): c is BodyMapCategory => !!c);
  const rest = categories.filter(
    (c) => !order.includes(c.id as HealthCategoryId)
  );
  return [...ordered, ...rest].slice(0, 8);
}

function focusFor(id: string): BodyFocus {
  return FOCUS_BY_ID[id] || { x: 50, y: 45, mode: "body" };
}

export function RadialHealthMapLab({
  sex,
  categories,
}: {
  locale?: "lt" | "en";
  sex: "male" | "female";
  categories: BodyMapCategory[];
  geneHint?: string;
}) {
  const tiles = useMemo(
    () => orderForSex(categories, sex),
    [categories, sex]
  );
  const slots = useMemo(() => slotsForCount(tiles.length), [tiles.length]);
  const [hovered, setHovered] = useState<string | null>(null);

  const figureSrc =
    sex === "female"
      ? "/brand/health-map/woman-hologram-v3.jpg"
      : "/brand/body-twin-hub.png";

  const active = hovered ? focusFor(hovered) : null;
  const activeTile = tiles.find((t) => t.id === hovered) || null;
  const activeSlot = hovered
    ? slots[tiles.findIndex((t) => t.id === hovered)]
    : null;
  const accent = activeTile
    ? COLOUR_HEX[activeTile.colour as RiskColour]
    : "#6bcf9b";

  return (
    <div className="orbit-lab rise-in">
      <div className="orbit-lab-stage" data-sex={sex} data-focus={active?.mode || ""}>
        <div className="orbit-lab-atmosphere" aria-hidden>
          <span className="orbit-haze haze-a" />
          <span className="orbit-haze haze-b" />
          <span className="orbit-haze haze-c" />
        </div>

        <svg className="orbit-lab-rings" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <radialGradient id="orbitCoreGlow" cx="50%" cy="48%" r="48%">
              <stop offset="0%" stopColor="rgba(80, 200, 140, 0.22)" />
              <stop offset="55%" stopColor="rgba(30, 120, 80, 0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter id="orbitSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="50" cy="48" r="44" fill="url(#orbitCoreGlow)" />
          <circle
            cx="50"
            cy="48"
            r="34"
            className="orbit-ring mid"
            strokeDasharray="0.5 1.4"
          />
          <circle
            cx="50"
            cy="48"
            r="46"
            className="orbit-ring main"
            strokeDasharray="1.05 1.15"
          />

          {/* Body focus highlights */}
          {active?.mode === "heart" ? (
            <ellipse
              cx={active.x}
              cy={active.y}
              rx="5.5"
              ry="4.2"
              className="orbit-organ heart"
              style={{ fill: accent }}
            />
          ) : null}
          {active?.mode === "brain" ? (
            <ellipse
              cx={active.x}
              cy={active.y}
              rx="7"
              ry="5.5"
              className="orbit-organ brain"
              style={{ fill: accent }}
            />
          ) : null}
          {active?.mode === "pelvis" ? (
            <g className="orbit-organ pelvis" style={{ fill: accent }}>
              <ellipse cx="46.5" cy={active.y} rx="3.2" ry="2.6" />
              <ellipse cx="53.5" cy={active.y} rx="3.2" ry="2.6" />
            </g>
          ) : null}
          {active?.mode === "gut" ? (
            <ellipse
              cx={active.x}
              cy={active.y}
              rx="7"
              ry="9"
              className="orbit-organ gut"
              style={{ fill: accent }}
            />
          ) : null}
          {active?.mode === "body" ? (
            <ellipse
              cx="50"
              cy="48"
              rx="14"
              ry="30"
              className="orbit-organ body"
              style={{ fill: accent }}
            />
          ) : null}
          {active?.mode === "outline" ? (
            <ellipse
              cx="50"
              cy="48"
              rx="15"
              ry="31"
              className="orbit-organ outline"
              fill="none"
              stroke={accent}
            />
          ) : null}

          {active && activeSlot ? (
            <path
              d={`M ${activeSlot.x} ${activeSlot.y} Q 50 ${
                (activeSlot.y + active.y) / 2
              } ${active.x} ${active.y}`}
              className="orbit-focus-line"
              style={{ stroke: accent }}
              fill="none"
            />
          ) : null}
        </svg>

        <div
          className={`orbit-lab-figure${active ? ` focus-${active.mode}` : ""}`}
          aria-hidden
          style={
            active
              ? ({ ["--focus-c" as string]: accent } as CSSProperties)
              : undefined
          }
        >
          <Image
            src={figureSrc}
            alt=""
            width={520}
            height={720}
            className="orbit-lab-photo"
            priority
          />
        </div>

        {tiles.map((c, i) => {
          const s = slots[i]!;
          const isHot = hovered === c.id;
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`orbit-node side-${s.side}${isHot ? " is-hot" : ""}`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour],
              }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(c.id)}
              onBlur={() => setHovered(null)}
            >
              <span className="orbit-node-copy">
                <b>{c.title}</b>
                <em>
                  {c.colourLabel}
                  {c.geneticBadge ? ` · ${c.geneticMark || "DNR"}` : ""}
                </em>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
