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
  deg: number;
  side: "left" | "right" | "top" | "bottom";
};

/** Focus point in body-image local % (0–100 of the hologram frame). */
type BodyFocus = {
  x: number;
  y: number;
  mode: "heart" | "brain" | "pelvis" | "gut" | "body" | "outline";
};

/**
 * Calibrated to woman-hologram anatomy (head→feet in the PNG).
 * Do NOT use stage %, or ovaries land on the knees.
 */
const FOCUS_BY_ID: Record<string, BodyFocus> = {
  cardio_metabolic: { x: 51, y: 30, mode: "heart" },
  cardiovascular: { x: 51, y: 30, mode: "heart" },
  mental: { x: 50, y: 12, mode: "brain" },
  // Lower abdomen / ovaries — never the crotch midline
  reproductive: { x: 50, y: 41, mode: "pelvis" },
  hormones_women: { x: 50, y: 41, mode: "pelvis" },
  pharmacogenetics: { x: 50, y: 39, mode: "gut" },
  // Whole-body glow; line anchors at the chest
  physical: { x: 50, y: 28, mode: "body" },
  oncology: { x: 50, y: 30, mode: "outline" },
  metabolic: { x: 50, y: 39, mode: "gut" },
  immune: { x: 50, y: 28, mode: "body" },
  hormones_men: { x: 50, y: 44, mode: "pelvis" },
};

/** Figure box as % of the square stage (matches CSS). */
const FIG_W = 38;
const FIG_H = FIG_W * (1280 / 720);
const FIG_LEFT = 50 - FIG_W / 2;
const FIG_TOP = 50 - FIG_H / 2;

const ICON_RING = 37.5;
const CX = 50;
const CY = 50;

function bodyToStage(local: { x: number; y: number }) {
  return {
    x: FIG_LEFT + (local.x / 100) * FIG_W,
    y: FIG_TOP + (local.y / 100) * FIG_H,
  };
}

function slotsForCount(n: number): Slot[] {
  const step = 360 / n;
  // Open the crown a touch; keep L/R symmetry
  const start = -90 + step / 2;
  return Array.from({ length: n }, (_, i) => {
    const deg = start + step * i;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    let side: Slot["side"] = "right";
    if (deg >= -70 && deg <= -40) side = "top";
    else if (deg > -40 && deg < 50) side = "right";
    else if (deg >= 50 && deg <= 130) side = "bottom";
    else if (deg > 130 && deg < 230) side = "left";
    else side = "top";
    return {
      deg,
      x: CX + ICON_RING * cos,
      y: CY + ICON_RING * sin,
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
    strokeWidth: 1.55,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  const paths: Record<string, ReactNode> = {
    reproductive: (
      <>
        <circle cx="12" cy="8.5" r="4" />
        <path d="M12 12.5v6.8" />
        <path d="M9.2 16.8h5.6" />
      </>
    ),
    hormones_women: (
      <>
        <circle cx="12" cy="8.5" r="4" />
        <path d="M12 12.5v6.8" />
        <path d="M9.2 16.8h5.6" />
      </>
    ),
    oncology: (
      <>
        <path d="M12 4.2 13.4 8.4l4.4.4-3.4 3 1 4.3L12 13.9 8.6 16.1l1-4.3-3.4-3 4.4-.4z" />
      </>
    ),
    cardio_metabolic: (
      <path d="M19.2 8c-1.5-1.8-4.1-1.9-5.7-.3L12 9.2l-1.5-1.5C8.9 6.1 6.3 6.2 4.8 8c-1.6 1.9-1.4 4.8.6 6.4L12 19.6l6.6-5.2c2-1.6 2.2-4.5.6-6.4Z" />
    ),
    cardiovascular: (
      <path d="M19.2 8c-1.5-1.8-4.1-1.9-5.7-.3L12 9.2l-1.5-1.5C8.9 6.1 6.3 6.2 4.8 8c-1.6 1.9-1.4 4.8.6 6.4L12 19.6l6.6-5.2c2-1.6 2.2-4.5.6-6.4Z" />
    ),
    physical: (
      <>
        <circle cx="12" cy="5" r="1.65" />
        <path d="M8.4 10.2 12 8.8l3.6 1.4 2 4.2" />
        <path d="M12 9v5.2l-3.2 5" />
        <path d="M12 14.2 15.3 19" />
        <path d="M8.4 10.2 6.1 14.6" />
      </>
    ),
    mental: (
      <>
        <path d="M8.8 14.2c-2.2-.7-3.6-2.8-3.3-5.1C5.8 6.4 8.2 4.5 10.9 4.6c2.4.1 4.4 1.9 4.7 4.2.3 2-.7 3.8-2.4 4.7v2.4H8.8v-1.7Z" />
        <path d="M10 18.4h4" />
        <path d="M10.6 20.4h2.8" />
        <path d="M9.6 8.6c.7-.9 1.7-1.3 2.8-1.2" />
      </>
    ),
    pharmacogenetics: (
      <>
        <path d="M9.4 3.6h5.2" />
        <path d="M10.5 3.6v5L7 15.4A3.2 3.2 0 0 0 9.7 20h4.6a3.2 3.2 0 0 0 2.7-4.6L13.5 8.6v-5" />
        <path d="M8.4 14.4h7.2" />
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
        <path d="M12 3.6 17.8 6v4.8c0 4-2.6 7.4-5.8 8.8C8.8 18.2 6.2 14.8 6.2 10.8V6Z" />
        <path d="M9.6 11.8 11.3 13.6l3.2-3.6" />
      </>
    ),
    hormones_men: (
      <>
        <circle cx="10" cy="14" r="4" />
        <path d="M13 11 18.6 5.4" />
        <path d="M14.4 5.4H18.6V9.6" />
      </>
    ),
  };

  return <svg {...common}>{paths[id] || paths.physical}</svg>;
}

function BodyFocusMarks({
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
  if (mode === "body") {
    return (
      <span
        className="orbit-body-mark is-body"
        style={{ background: accent }}
      />
    );
  }
  if (mode === "outline") {
    return (
      <span
        className="orbit-body-mark is-outline"
        style={{ borderColor: accent, boxShadow: `0 0 18px ${accent}` }}
      />
    );
  }
  if (mode === "pelvis") {
    // Soft lower-abdomen band + lateral ovary glows (no crotch spotlight)
    return (
      <span
        className="orbit-body-mark is-pelvis"
        style={{ left: `${x}%`, top: `${y}%`, ["--cc" as string]: accent }}
      >
        <i className="band" style={{ background: accent }} />
        <i className="ovary" style={{ background: accent, left: "-26%" }} />
        <i className="ovary" style={{ background: accent, left: "26%" }} />
      </span>
    );
  }
  return (
    <span
      className={`orbit-body-mark is-${mode}`}
      style={{ left: `${x}%`, top: `${y}%`, background: accent }}
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
      ? "/brand/health-map/woman-hologram-v5.png"
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
  const stageFocus = active ? bodyToStage(active) : null;

  return (
    <div className="orbit-lab rise-in">
      <div
        className="orbit-lab-stage"
        data-sex={sex}
        data-focus={active?.mode || ""}
        data-hot={hovered ? "1" : "0"}
      >
        <div className="orbit-lab-atmosphere" aria-hidden>
          <span className="orbit-haze haze-core" />
          <span className="orbit-haze haze-left" />
          <span className="orbit-haze haze-right" />
          <span className="orbit-vignette" />
        </div>

        <svg className="orbit-lab-rings" viewBox="0 0 100 100" aria-hidden>
          <circle
            cx={CX}
            cy={CY}
            r={ICON_RING}
            className="orbit-ring main"
            strokeDasharray="1.05 1.25"
          />
          {slots.map((s, i) => (
            <circle
              key={`dot-${i}`}
              cx={s.x}
              cy={s.y}
              r="0.55"
              className="orbit-anchor-dot"
            />
          ))}
        </svg>

        <div
          className={`orbit-lab-figure${active ? ` focus-${active.mode}` : ""}`}
          aria-hidden
          style={
            {
              width: `${FIG_W}%`,
              ...(active
                ? { ["--focus-c" as string]: accent }
                : {}),
            } as CSSProperties
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
          {active ? (
            <BodyFocusMarks
              mode={active.mode}
              x={active.x}
              y={active.y}
              accent={accent}
            />
          ) : null}
        </div>

        <svg className="orbit-lab-focus" viewBox="0 0 100 100" aria-hidden>
          {active && activeSlot && stageFocus ? (
            <path
              d={`M ${activeSlot.x} ${activeSlot.y} Q ${
                (activeSlot.x + stageFocus.x) / 2
              } ${(activeSlot.y + stageFocus.y) / 2 - 2.5} ${stageFocus.x} ${
                stageFocus.y
              }`}
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
