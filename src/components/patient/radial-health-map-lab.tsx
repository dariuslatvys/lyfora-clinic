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
  mental: { x: 50, y: 18, mode: "brain" },
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
  5: [-20, 40, 105, 175, 245],
  // No crown slot — keeps labels off the head
  6: [-18, 32, 88, 138, 198, 250],
  7: [-22, 20, 62, 108, 158, 208, 252],
  8: [-24, 14, 48, 90, 132, 174, 216, 258],
};

function sideForDeg(deg: number): Slot["side"] {
  if (deg > -30 && deg < 78) return "right";
  if (deg >= 78 && deg <= 142) return "bottom";
  return "left";
}

function slotsForCount(n: number): Slot[] {
  const angles =
    PRESET_SLOTS[n] ||
    Array.from({ length: n }, (_, i) => -46 + (360 / n) * i);
  const rx = 49.5;
  const ry = 45.5;
  return angles.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: 50 + rx * Math.cos(rad),
      y: 50 + ry * Math.sin(rad),
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

function OrganFocus({
  mode,
  x,
  y,
  accent,
}: {
  mode: BodyFocus["mode"];
  x: number;
  y: number;
  accent: string;
}) {
  if (mode === "heart") {
    return (
      <ellipse
        cx={x}
        cy={y}
        rx="5.8"
        ry="4.4"
        className="orbit-organ heart"
        style={{ fill: accent }}
      />
    );
  }
  if (mode === "brain") {
    return (
      <ellipse
        cx={x}
        cy={y}
        rx="7.2"
        ry="5.6"
        className="orbit-organ brain"
        style={{ fill: accent }}
      />
    );
  }
  if (mode === "pelvis") {
    return (
      <g className="orbit-organ pelvis" style={{ fill: accent }}>
        <ellipse cx="46.2" cy={y} rx="3.4" ry="2.8" />
        <ellipse cx="53.8" cy={y} rx="3.4" ry="2.8" />
      </g>
    );
  }
  if (mode === "gut") {
    return (
      <ellipse
        cx={x}
        cy={y}
        rx="7.2"
        ry="9.2"
        className="orbit-organ gut"
        style={{ fill: accent }}
      />
    );
  }
  if (mode === "body") {
    return (
      <ellipse
        cx="50"
        cy="48"
        rx="15"
        ry="31"
        className="orbit-organ body"
        style={{ fill: accent }}
      />
    );
  }
  return (
    <ellipse
      cx="50"
      cy="48"
      rx="15.5"
      ry="32"
      className="orbit-organ outline"
      fill="none"
      stroke={accent}
    />
  );
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
      ? "/brand/health-map/woman-hologram-v4.png"
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
      <div
        className="orbit-lab-stage"
        data-sex={sex}
        data-focus={active?.mode || ""}
      >
        <div className="orbit-lab-atmosphere" aria-hidden>
          <span className="orbit-haze haze-a" />
          <span className="orbit-haze haze-b" />
          <span className="orbit-haze haze-c" />
        </div>

        <svg className="orbit-lab-rings" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <radialGradient id="orbitCoreGlow" cx="50%" cy="48%" r="48%">
              <stop offset="0%" stopColor="rgba(90, 210, 145, 0.32)" />
              <stop offset="50%" stopColor="rgba(40, 140, 90, 0.12)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
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
            height={920}
            className="orbit-lab-photo"
            priority
            unoptimized
          />
        </div>

        {/* Focus overlays sit above the figure so lines stay visible */}
        <svg className="orbit-lab-focus" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <filter
              id="orbitSoftGlow"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="1.35" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {active ? (
            <OrganFocus
              mode={active.mode}
              x={active.x}
              y={active.y}
              accent={accent}
            />
          ) : null}
          {active && activeSlot ? (
            <path
              d={`M ${activeSlot.x} ${activeSlot.y} Q ${
                (activeSlot.x + active.x) / 2
              } ${(activeSlot.y + active.y) / 2 - 4} ${active.x} ${active.y}`}
              className="orbit-focus-line"
              style={{ stroke: accent }}
              fill="none"
            />
          ) : null}
        </svg>

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
