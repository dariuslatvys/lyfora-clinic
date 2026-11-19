"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { BodyMapCategory } from "@/components/patient/body-map";
import { COLOUR_HEX, type RiskColour } from "@/lib/health/colours";
import {
  MALE_OVERVIEW_ORDER,
  type HealthCategoryId,
} from "@/lib/health/categories";

/** Experimental map: heart at 12 o’clock, then clockwise. */
const LAB_ORDER_FEMALE: HealthCategoryId[] = [
  "cardio_metabolic",
  "oncology",
  "physical",
  "pharmacogenetics",
  "mental",
  "reproductive",
];

const LAB_LABELS_LT: Partial<Record<HealthCategoryId, string>> = {
  oncology: "Onkologija",
  cardio_metabolic: "Širdis ir kraujagyslės",
  cardiovascular: "Širdis ir kraujagyslės",
  physical: "Fizinė sveikata",
  pharmacogenetics: "Farmakogenetika",
  mental: "Psichika ir emocinė sveikata",
  reproductive: "Moters sveikata",
  hormones_women: "Moters sveikata",
};

type Slot = { deg: number };

type BodyFocus = {
  x: number;
  y: number;
  mode: "heart" | "brain" | "pelvis" | "gut" | "body" | "outline";
};

const FOCUS_BY_ID: Record<string, BodyFocus> = {
  cardio_metabolic: { x: 51, y: 29, mode: "heart" },
  cardiovascular: { x: 51, y: 29, mode: "heart" },
  mental: { x: 50, y: 11, mode: "brain" },
  reproductive: { x: 57, y: 44, mode: "pelvis" },
  hormones_women: { x: 57, y: 44, mode: "pelvis" },
  pharmacogenetics: { x: 50, y: 37, mode: "gut" },
  physical: { x: 50, y: 27, mode: "body" },
  oncology: { x: 50, y: 29, mode: "outline" },
  metabolic: { x: 50, y: 37, mode: "gut" },
  immune: { x: 50, y: 27, mode: "body" },
  hormones_men: { x: 50, y: 44, mode: "pelvis" },
};

/** Compact figure + elliptical orbit — chips must clear head/feet. */
const FIG_W = 20;
const FIG_H = FIG_W * (1280 / 720);
const FIG_LEFT = 50 - FIG_W / 2;
const FIG_TOP = 50 - FIG_H / 2;
const ORBIT_RX = 43;
const ORBIT_RY = 41;
const CX = 50;
const CY = 50;

function orbitPoint(deg: number) {
  const rad = (deg * Math.PI) / 180;
  // Extra outward push at poles (top/bottom) where chips used to cover the body
  const pole = Math.abs(Math.sin(rad));
  const rx = ORBIT_RX + pole * 1.2;
  const ry = ORBIT_RY + pole * 3;
  return {
    x: CX + rx * Math.cos(rad),
    y: CY + ry * Math.sin(rad),
  };
}

const FEMALE_TWIN_SRC = "/brand/health-map/woman-hologram-v7.png";
const FEMALE_TWIN_FALLBACK = "/brand/health-map/woman-hologram-v5.png";
const MALE_TWIN_SRC = "/brand/body-twin-hub.png";

const PARTICLES = [
  [14, 20],
  [86, 16],
  [10, 52],
  [90, 48],
  [18, 78],
  [82, 74],
  [38, 10],
  [62, 88],
  [6, 36],
  [94, 64],
  [28, 86],
  [72, 12],
  [22, 42],
  [78, 56],
  [44, 92],
  [56, 8],
] as const;

function bodyToStage(local: { x: number; y: number }) {
  return {
    x: FIG_LEFT + (local.x / 100) * FIG_W,
    y: FIG_TOP + (local.y / 100) * FIG_H,
  };
}

function slotsForCount(n: number): Slot[] {
  const step = 360 / n;
  // Rotate right: first category (Širdis) at ~1–2 o’clock, not on the head
  const start = -50;
  return Array.from({ length: n }, (_, i) => ({ deg: start + step * i }));
}

function orderForSex(
  categories: BodyMapCategory[],
  sex: "male" | "female"
): BodyMapCategory[] {
  const order =
    sex === "female" ? LAB_ORDER_FEMALE : MALE_OVERVIEW_ORDER;
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
  return FOCUS_BY_ID[id] || { x: 50, y: 40, mode: "body" };
}

function labTitle(id: string, fallback: string) {
  return LAB_LABELS_LT[id as HealthCategoryId] || fallback;
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
        <circle cx="12" cy="8.2" r="3.8" />
        <path d="M12 12v7" />
        <path d="M9.3 16.5h5.4" />
      </>
    ),
    hormones_women: (
      <>
        <circle cx="12" cy="8.2" r="3.8" />
        <path d="M12 12v7" />
        <path d="M9.3 16.5h5.4" />
      </>
    ),
    oncology: (
      <path d="M12 4.4 13.3 8.4l4.2.4-3.2 2.9.9 4.1L12 13.7 8.8 15.8l.9-4.1-3.2-2.9 4.2-.4z" />
    ),
    cardio_metabolic: (
      <path d="M19 8.2c-1.4-1.7-3.9-1.8-5.4-.3L12 9.4l-1.6-1.5C8.9 6.4 6.4 6.5 5 8.2c-1.5 1.8-1.3 4.5.6 6L12 19.2l6.4-5c1.9-1.5 2.1-4.2.6-6Z" />
    ),
    cardiovascular: (
      <path d="M19 8.2c-1.4-1.7-3.9-1.8-5.4-.3L12 9.4l-1.6-1.5C8.9 6.4 6.4 6.5 5 8.2c-1.5 1.8-1.3 4.5.6 6L12 19.2l6.4-5c1.9-1.5 2.1-4.2.6-6Z" />
    ),
    physical: (
      <>
        <circle cx="12" cy="5" r="1.6" />
        <path d="M8.5 10.2 12 8.9l3.5 1.3 2 4" />
        <path d="M12 9v5.1l-3.1 4.8" />
        <path d="M12 14.1 15.2 19" />
        <path d="M8.5 10.2 6.3 14.4" />
      </>
    ),
    mental: (
      <>
        <path d="M8.9 14c-2.1-.7-3.4-2.7-3.1-4.9.3-2.5 2.5-4.3 5-4.2 2.3.1 4.2 1.8 4.5 4 .3 1.9-.7 3.6-2.3 4.4v2.2H8.9V14Z" />
        <path d="M10.1 18.2h3.8" />
        <path d="M10.6 20.2h2.8" />
      </>
    ),
    pharmacogenetics: (
      <>
        <path d="M9.5 3.8h5" />
        <path d="M10.6 3.8v4.8L7.2 15a3 3 0 0 0 2.5 4.4h4.6A3 3 0 0 0 16.8 15l-3.4-6.4V3.8" />
        <path d="M8.5 14.2h7" />
      </>
    ),
    metabolic: (
      <>
        <path d="M12 4v16" />
        <path d="M8.2 8.2c2.3 1.1 5.3 1.1 7.6 0" />
        <path d="M7.2 12c2.8 1.5 6.8 1.5 9.6 0" />
        <path d="M8.2 15.8c2.3 1.1 5.3 1.1 7.6 0" />
      </>
    ),
    immune: (
      <>
        <path d="M12 3.8 17.5 6v4.6c0 3.8-2.5 7-5.5 8.3C9 17.6 6.5 14.4 6.5 10.6V6Z" />
        <path d="M9.7 11.6 11.3 13.3l3-3.4" />
      </>
    ),
    hormones_men: (
      <>
        <circle cx="10.2" cy="14" r="3.8" />
        <path d="M13 11.2 18.2 6" />
        <path d="M14.4 6H18.2v3.8" />
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
        className="twin-mark is-body"
        style={{ background: accent, ["--cc" as string]: accent }}
      />
    );
  }
  if (mode === "outline") {
    return (
      <span
        className="twin-mark is-outline"
        style={{ borderColor: accent, boxShadow: `0 0 24px ${accent}44` }}
      />
    );
  }
  if (mode === "pelvis") {
    return (
      <span
        className="twin-mark is-pelvis"
        style={{ left: "50%", top: `${y}%`, ["--cc" as string]: accent }}
      >
        <i className="ovary" style={{ background: accent, left: "-30%" }} />
        <i className="ovary" style={{ background: accent, left: "30%" }} />
        <i className="ping" style={{ borderColor: accent }} />
      </span>
    );
  }
  return (
    <span
      className={`twin-mark is-${mode}`}
      style={{ left: `${x}%`, top: `${y}%`, ["--cc" as string]: accent }}
    >
      <i className="core" style={{ background: accent }} />
      <i className="halo" style={{ borderColor: accent }} />
      <i className="ring" style={{ borderColor: accent }} />
    </span>
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
  const uid = useId().replace(/:/g, "");
  const tiles = useMemo(
    () => orderForSex(categories, sex),
    [categories, sex]
  );
  const slots = useMemo(() => slotsForCount(tiles.length), [tiles.length]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [figureSrc, setFigureSrc] = useState(
    sex === "female" ? FEMALE_TWIN_SRC : MALE_TWIN_SRC
  );

  useEffect(() => {
    setFigureSrc(sex === "female" ? FEMALE_TWIN_SRC : MALE_TWIN_SRC);
  }, [sex]);

  const active = activeId ? focusFor(activeId) : null;
  const activeTile = tiles.find((t) => t.id === activeId) || null;
  const activeIndex = activeId
    ? tiles.findIndex((t) => t.id === activeId)
    : -1;
  const activeSlot = activeIndex >= 0 ? slots[activeIndex] : null;
  const accent = activeTile
    ? COLOUR_HEX[activeTile.colour as RiskColour]
    : "#5ee4a8";
  const stageFocus = active ? bodyToStage(active) : null;
  const activeOrbit = activeSlot ? orbitPoint(activeSlot.deg) : null;

  return (
    <div className="twin-lab rise-in">
      <div
        className="twin-stage"
        data-sex={sex}
        data-focus={active?.mode || ""}
        data-hot={activeId ? "1" : "0"}
      >
        <div className="twin-void" aria-hidden>
          <span className="twin-atmos twin-atmos-a" />
          <span className="twin-atmos twin-atmos-b" />
          <span className="twin-bloom" />
          <span className="twin-floor" />
          <span className="twin-vignette" />
        </div>

        <svg className="twin-orbit" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient
              id={`twinOrbitGrad-${uid}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(120,240,180,0.05)" />
              <stop offset="50%" stopColor="rgba(180,255,220,0.4)" />
              <stop offset="100%" stopColor="rgba(90,200,160,0.06)" />
            </linearGradient>
          </defs>
          <ellipse
            cx={CX}
            cy={CY}
            rx={ORBIT_RX + 6}
            ry={ORBIT_RY + 5}
            className="twin-orbit-soft"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={ORBIT_RX}
            ry={ORBIT_RY}
            className="twin-orbit-ring"
            stroke={`url(#twinOrbitGrad-${uid})`}
          />
          {PARTICLES.map(([px, py], i) => (
            <circle
              key={`${px}-${py}`}
              cx={px}
              cy={py}
              r={i % 3 === 0 ? 0.28 : 0.16}
              className="twin-particle"
              style={{ animationDelay: `${(i % 8) * 0.4}s` }}
            />
          ))}
        </svg>

        <div
          className={`twin-figure${active ? ` focus-${active.mode}` : ""}`}
          aria-hidden
          style={
            {
              width: `${FIG_W}%`,
              ...(active ? { ["--focus-c" as string]: accent } : {}),
            } as CSSProperties
          }
        >
          <div className="twin-figure-glow" />
          <img
            src={figureSrc}
            alt=""
            width={720}
            height={1280}
            className="twin-photo"
            decoding="async"
            fetchPriority="high"
            onError={() => {
              if (sex === "female" && figureSrc !== FEMALE_TWIN_FALLBACK) {
                setFigureSrc(FEMALE_TWIN_FALLBACK);
              }
            }}
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

        <svg className="twin-focus-layer" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <filter
              id={`twinBeamGlow-${uid}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="0.45" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {active && activeOrbit && stageFocus
            ? (() => {
                const leftSide = activeOrbit.x < CX;
                const qx = leftSide
                  ? Math.min(activeOrbit.x, stageFocus.x) - 9
                  : Math.max(activeOrbit.x, stageFocus.x) + 9;
                const qy = activeOrbit.y * 0.4 + stageFocus.y * 0.6;
                const d = `M ${activeOrbit.x} ${activeOrbit.y} Q ${qx} ${qy} ${stageFocus.x} ${stageFocus.y}`;
                return (
                  <g filter={`url(#twinBeamGlow-${uid})`}>
                    <path
                      d={d}
                      className="twin-focus-line twin-focus-line-soft"
                      style={{ stroke: accent }}
                      fill="none"
                    />
                    <path
                      d={d}
                      className="twin-focus-line"
                      style={{ stroke: accent }}
                      fill="none"
                    />
                    <circle
                      cx={stageFocus.x}
                      cy={stageFocus.y}
                      r={1.05}
                      fill={accent}
                      className="twin-focus-dot"
                    />
                  </g>
                );
              })()
            : null}
        </svg>

        {tiles.map((c, i) => {
          const s = slots[i]!;
          const isHot = activeId === c.id;
          const { x, y } = orbitPoint(s.deg);
          const outward = s.deg > -90 && s.deg < 90 ? "right" : "left";
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`twin-chip side-${outward}${isHot ? " is-hot" : ""}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour],
              }}
              onMouseEnter={() => setActiveId(c.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(c.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="twin-chip-orb" aria-hidden>
                <CategoryGlyph id={c.id} />
              </span>
              <span className="twin-chip-copy">
                <b>{labTitle(c.id, c.title)}</b>
                <em>
                  <i />
                  {c.colourLabel}
                  {c.geneticBadge ? ` · ${c.geneticMark || "DNR"}` : ""}
                </em>
              </span>
            </Link>
          );
        })}

        <div className="twin-hud" aria-hidden>
          <span className="twin-hud-tag">The human virtual twin</span>
          <span className="twin-hud-meta">
            {activeTile
              ? labTitle(activeTile.id, activeTile.title)
              : "Lyfora sveikatos žemėlapis"}
          </span>
        </div>
      </div>
    </div>
  );
}
