"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
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
  lx: number;
  ly: number;
  deg: number;
  side: "left" | "right" | "top" | "bottom";
};

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

const ICON_RING = 41.5;
const LABEL_RING = 49.5;
const CX = 50;
const CY = 49;

/**
 * Even polar slots. Start offset so the crown stays open and pairs mirror L/R.
 * Degrees: 0 = right, 90 = bottom.
 */
function slotsForCount(n: number): Slot[] {
  const step = 360 / n;
  const start = -90 + step / 2;
  return Array.from({ length: n }, (_, i) => {
    const deg = start + step * i;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    let side: Slot["side"] = "right";
    if (deg >= -55 && deg <= -35) side = "top";
    else if (deg > -35 && deg < 55) side = "right";
    else if (deg >= 55 && deg <= 125) side = "bottom";
    else if (deg > 125 && deg < 235) side = "left";
    else side = "top";
    return {
      deg,
      x: CX + ICON_RING * cos,
      y: CY + ICON_RING * sin,
      lx: CX + LABEL_RING * cos,
      ly: CY + LABEL_RING * sin,
      side,
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

function CategoryGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<string, ReactNode> = {
    reproductive: (
      <>
        <circle cx="12" cy="9" r="4.2" />
        <path d="M12 13.2v6.3" />
        <path d="M9.4 17.2h5.2" />
      </>
    ),
    hormones_women: (
      <>
        <circle cx="12" cy="9" r="4.2" />
        <path d="M12 13.2v6.3" />
        <path d="M9.4 17.2h5.2" />
      </>
    ),
    oncology: (
      <>
        <path d="M12 3.5 13.7 8l4.6.4-3.5 3.2 1.1 4.5L12 13.8 8.1 16.1l1.1-4.5L5.7 8.4 10.3 8z" />
        <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
    cardio_metabolic: (
      <path d="M19.4 7.8c-1.6-1.9-4.3-2-5.9-.3L12 9l-1.5-1.5C8.9 5.8 6.2 5.9 4.6 7.8c-1.7 2-1.5 5.1.6 6.8L12 20l6.8-5.4c2.1-1.7 2.3-4.8.6-6.8Z" />
    ),
    cardiovascular: (
      <path d="M19.4 7.8c-1.6-1.9-4.3-2-5.9-.3L12 9l-1.5-1.5C8.9 5.8 6.2 5.9 4.6 7.8c-1.7 2-1.5 5.1.6 6.8L12 20l6.8-5.4c2.1-1.7 2.3-4.8.6-6.8Z" />
    ),
    physical: (
      <>
        <circle cx="12" cy="5.2" r="1.7" />
        <path d="M8.2 10.4 12 9l3.8 1.4 2.2 4.4" />
        <path d="M12 9.1v5.4l-3.4 5" />
        <path d="M12 14.5l3.5 4.9" />
        <path d="M8.2 10.4 5.8 14.8" />
      </>
    ),
    mental: (
      <>
        <path d="M9.2 14.8c-2.4-.8-4-3.1-3.7-5.7.3-2.8 2.8-4.9 5.6-4.8 2.6.1 4.8 2.1 5.2 4.7.3 2.2-.8 4.2-2.7 5.2v2.6H9.2v-2Z" />
        <path d="M10.2 19h3.6" />
        <path d="M10.8 21h2.4" />
        <path d="M10.2 9.2c.6-.8 1.5-1.2 2.5-1.2" />
      </>
    ),
    pharmacogenetics: (
      <>
        <path d="M9.2 3.8h5.6" />
        <path d="M10.4 3.8v5.1L6.8 16a3.4 3.4 0 0 0 2.9 5.2h4.6A3.4 3.4 0 0 0 17.2 16l-3.6-7.1V3.8" />
        <path d="M8.2 14.8h7.6" />
      </>
    ),
    metabolic: (
      <>
        <path d="M12 4v16" />
        <path d="M8 8c2.4 1.2 5.6 1.2 8 0" />
        <path d="M7 12c3 1.6 7 1.6 10 0" />
        <path d="M8 16c2.4 1.2 5.6 1.2 8 0" />
      </>
    ),
    immune: (
      <>
        <path d="M12 3.5 18.2 6v5.2c0 4.2-2.8 7.9-6.2 9.3C8.6 19.1 5.8 15.4 5.8 11.2V6Z" />
        <path d="M9.4 12.1 11.2 14l3.4-3.8" />
      </>
    ),
    hormones_men: (
      <>
        <circle cx="10" cy="14" r="4.2" />
        <path d="M13.1 10.9 19 5" />
        <path d="M14.4 5H19v4.6" />
      </>
    ),
  };

  return <svg {...common}>{paths[id] || paths.physical}</svg>;
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
  const activeIndex = hovered
    ? tiles.findIndex((t) => t.id === hovered)
    : -1;
  const activeSlot = activeIndex >= 0 ? slots[activeIndex] : null;
  const accent = activeTile
    ? COLOUR_HEX[activeTile.colour as RiskColour]
    : "#6bcf9b";

  return (
    <div className="orbit-lab rise-in">
      <div
        className="orbit-lab-stage"
        data-sex={sex}
        data-focus={active?.mode || ""}
        data-hot={hovered ? "1" : "0"}
      >
        <div className="orbit-lab-atmosphere" aria-hidden>
          <span className="orbit-haze haze-a" />
          <span className="orbit-haze haze-b" />
          <span className="orbit-haze haze-c" />
        </div>

        <svg className="orbit-lab-rings" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <radialGradient id="orbitCoreGlow" cx="50%" cy="49%" r="46%">
              <stop offset="0%" stopColor="rgba(90, 210, 145, 0.3)" />
              <stop offset="55%" stopColor="rgba(40, 140, 90, 0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <circle cx={CX} cy={CY} r="42" fill="url(#orbitCoreGlow)" />
          <circle
            cx={CX}
            cy={CY}
            r="28"
            className="orbit-ring soft"
            strokeDasharray="0.4 1.6"
          />
          <circle
            cx={CX}
            cy={CY}
            r={ICON_RING}
            className="orbit-ring main"
            strokeDasharray="1.1 1.2"
          />
          {slots.map((s, i) => (
            <g key={`tick-${i}`}>
              <line
                x1={CX + (ICON_RING - 2.2) * Math.cos((s.deg * Math.PI) / 180)}
                y1={CY + (ICON_RING - 2.2) * Math.sin((s.deg * Math.PI) / 180)}
                x2={CX + (ICON_RING + 1.4) * Math.cos((s.deg * Math.PI) / 180)}
                y2={CY + (ICON_RING + 1.4) * Math.sin((s.deg * Math.PI) / 180)}
                className="orbit-tick"
              />
              <line
                x1={s.x}
                y1={s.y}
                x2={s.lx}
                y2={s.ly}
                className="orbit-spoke"
              />
            </g>
          ))}
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
              } ${(activeSlot.y + active.y) / 2 - 3} ${active.x} ${active.y}`}
              className="orbit-focus-line"
              style={{ stroke: accent }}
              fill="none"
            />
          ) : null}
        </svg>

        {tiles.map((c, i) => {
          const s = slots[i]!;
          const isHot = hovered === c.id;
          const isDim = !!hovered && !isHot;
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`orbit-node side-${s.side}${isHot ? " is-hot" : ""}${
                isDim ? " is-dim" : ""
              }`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour],
                ["--lx" as string]: `${s.lx - s.x}%`,
                ["--ly" as string]: `${s.ly - s.y}%`,
              }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(c.id)}
              onBlur={() => setHovered(null)}
            >
              <span className="orbit-node-orb" aria-hidden>
                <CategoryGlyph id={c.id} />
              </span>
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
