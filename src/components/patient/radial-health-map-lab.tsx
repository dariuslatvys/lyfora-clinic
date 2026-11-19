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

/** Heart upper-right, then clockwise. */
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

/** Focus as % inside the circular portal (0–100). */
type BodyFocus = {
  x: number;
  y: number;
  kind: "point" | "ovaries";
};

type OrganTwin = {
  id: string;
  label: string;
  src: string;
};

const FOCUS_BY_ID: Record<string, BodyFocus> = {
  // Heart
  cardio_metabolic: { x: 48, y: 34, kind: "point" },
  cardiovascular: { x: 48, y: 34, kind: "point" },
  // Brain — top of head, not mouth/face
  mental: { x: 50, y: 14, kind: "point" },
  // Ovaries — lateral lower abdomen, not groin midline
  reproductive: { x: 50, y: 48, kind: "ovaries" },
  hormones_women: { x: 50, y: 48, kind: "ovaries" },
  // Liver / gut
  pharmacogenetics: { x: 52, y: 42, kind: "point" },
  metabolic: { x: 52, y: 42, kind: "point" },
  // Chest / muscle — single soft point, no body oval
  physical: { x: 50, y: 36, kind: "point" },
  immune: { x: 50, y: 36, kind: "point" },
  // Lungs / torso — point only, no outline oval
  oncology: { x: 50, y: 32, kind: "point" },
  hormones_men: { x: 50, y: 48, kind: "point" },
};

const ORGAN_BY_ID: Record<string, OrganTwin[]> = {
  cardio_metabolic: [
    {
      id: "heart",
      label: "Širdis",
      src: "/brand/health-map/organ-heart-hologram.jpg",
    },
    {
      id: "lungs",
      label: "Plaučiai",
      src: "/brand/health-map/organ-lungs-hologram.jpg",
    },
  ],
  cardiovascular: [
    {
      id: "heart",
      label: "Širdis",
      src: "/brand/health-map/organ-heart-hologram.jpg",
    },
  ],
  oncology: [
    {
      id: "lungs",
      label: "Plaučiai",
      src: "/brand/health-map/organ-lungs-hologram.jpg",
    },
  ],
  physical: [
    {
      id: "lungs",
      label: "Plaučiai",
      src: "/brand/health-map/organ-lungs-hologram.jpg",
    },
    {
      id: "heart",
      label: "Širdis",
      src: "/brand/health-map/organ-heart-hologram.jpg",
    },
  ],
  immune: [
    {
      id: "lungs",
      label: "Plaučiai",
      src: "/brand/health-map/organ-lungs-hologram.jpg",
    },
  ],
  mental: [
    {
      id: "brain",
      label: "Smegenys",
      src: "/brand/health-map/organ-brain-hologram.jpg",
    },
  ],
  reproductive: [
    {
      id: "uterus",
      label: "Gimda ir kiaušidės",
      src: "/brand/health-map/organ-uterus-hologram.jpg",
    },
  ],
  hormones_women: [
    {
      id: "uterus",
      label: "Gimda ir kiaušidės",
      src: "/brand/health-map/organ-uterus-hologram.jpg",
    },
  ],
  pharmacogenetics: [
    {
      id: "liver",
      label: "Kepenys",
      src: "/brand/health-map/organ-liver-hologram.jpg",
    },
  ],
  metabolic: [
    {
      id: "liver",
      label: "Kepenys",
      src: "/brand/health-map/organ-liver-hologram.jpg",
    },
  ],
};

const DEFAULT_ORGANS: OrganTwin[] = [
  {
    id: "heart",
    label: "Širdis",
    src: "/brand/health-map/organ-heart-hologram.jpg",
  },
  {
    id: "lungs",
    label: "Plaučiai",
    src: "/brand/health-map/organ-lungs-hologram.jpg",
  },
];

/** Portal + orbit geometry (% of square stage). */
const PORTAL_R = 28;
const ORBIT_R = 42;
const CX = 50;
const CY = 48;

const FEMALE_TWIN_SRC = "/brand/health-map/woman-hologram-v9.png";
const FEMALE_TWIN_FALLBACK = "/brand/health-map/woman-hologram-v8.png";
const MALE_TWIN_SRC = "/brand/body-twin-hub.png";

function orbitPoint(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + ORBIT_R * Math.cos(rad),
    y: CY + ORBIT_R * Math.sin(rad),
  };
}

function focusToStage(local: BodyFocus) {
  // Map portal-local % into stage % (portal is a circle centered on stage)
  const d = PORTAL_R * 2;
  return {
    x: CX - PORTAL_R + (local.x / 100) * d,
    y: CY - PORTAL_R + (local.y / 100) * d,
  };
}

function slotsForCount(n: number): Slot[] {
  const step = 360 / n;
  // Rotate right: first chip ~1–2 o’clock, never on the head
  const start = -45;
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
  return FOCUS_BY_ID[id] || { x: 50, y: 40, kind: "point" };
}

function organsFor(id: string | null): OrganTwin[] {
  if (!id) return DEFAULT_ORGANS;
  return ORGAN_BY_ID[id] || DEFAULT_ORGANS;
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
  };
  return <svg {...common}>{paths[id] || paths.physical}</svg>;
}

function FocusPing({
  focus,
  accent,
}: {
  focus: BodyFocus;
  accent: string;
}) {
  if (focus.kind === "ovaries") {
    return (
      <span
        className="twin-ping is-ovaries"
        style={{ ["--cc" as string]: accent }}
      >
        <i style={{ left: "36%", background: accent }} />
        <i style={{ left: "64%", background: accent }} />
      </span>
    );
  }
  return (
    <span
      className="twin-ping is-point"
      style={{
        left: `${focus.x}%`,
        top: `${focus.y}%`,
        ["--cc" as string]: accent,
      }}
    >
      <i style={{ background: accent }} />
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
  const stageFocus = active ? focusToStage(active) : null;
  const activeOrbit = activeSlot ? orbitPoint(activeSlot.deg) : null;
  const organTwins = organsFor(activeId);

  return (
    <div className="twin-lab rise-in">
      <div
        className="twin-stage"
        data-sex={sex}
        data-hot={activeId ? "1" : "0"}
      >
        <div className="twin-void" aria-hidden />

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
              <stop offset="50%" stopColor="rgba(160,245,200,0.4)" />
              <stop offset="100%" stopColor="rgba(90,200,150,0.06)" />
            </linearGradient>
          </defs>
          {/* Concentric HUD rings — Patient Twin style */}
          <circle cx={CX} cy={CY} r={PORTAL_R - 3} className="twin-ring-inner" />
          <circle cx={CX} cy={CY} r={PORTAL_R} className="twin-portal-rim" />
          <circle cx={CX} cy={CY} r={PORTAL_R + 4} className="twin-ring-mid" />
          <circle
            cx={CX}
            cy={CY}
            r={ORBIT_R}
            className="twin-orbit-ring"
            stroke={`url(#twinOrbitGrad-${uid})`}
          />
        </svg>

        <div
          className="twin-portal"
          aria-hidden
          style={
            {
              width: `${PORTAL_R * 2}%`,
              height: `${PORTAL_R * 2}%`,
              ...(active ? { ["--focus-c" as string]: accent } : {}),
            } as CSSProperties
          }
        >
          <img
            src={figureSrc}
            alt=""
            width={1024}
            height={1024}
            className="twin-photo"
            decoding="async"
            fetchPriority="high"
            onError={() => {
              if (sex === "female" && figureSrc !== FEMALE_TWIN_FALLBACK) {
                setFigureSrc(FEMALE_TWIN_FALLBACK);
              }
            }}
          />
          {active ? <FocusPing focus={active} accent={accent} /> : null}
        </div>

        <svg className="twin-focus-layer" viewBox="0 0 100 100" aria-hidden>
          {active && activeOrbit && stageFocus ? (
            <path
              d={`M ${activeOrbit.x} ${activeOrbit.y} Q ${(activeOrbit.x + stageFocus.x) / 2} ${(activeOrbit.y + stageFocus.y) / 2 - 4} ${stageFocus.x} ${stageFocus.y}`}
              className="twin-focus-line"
              style={{ stroke: accent }}
              fill="none"
            />
          ) : null}
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

        <aside
          className={`twin-organs${activeId ? " is-hot" : ""}`}
          aria-label="Organų dvyniai"
        >
          <header className="twin-organs-head">
            <span>Organų dvyniai</span>
            <em>{activeTile ? labTitle(activeTile.id, activeTile.title) : "Apžvalga"}</em>
          </header>
          <div className="twin-organs-row">
            {organTwins.map((organ) => (
              <figure key={organ.id} className="twin-organ">
                <span className="twin-organ-portal" aria-hidden>
                  <img
                    src={organ.src}
                    alt=""
                    width={512}
                    height={512}
                    className="twin-organ-photo"
                    decoding="async"
                  />
                </span>
                <figcaption>{organ.label}</figcaption>
              </figure>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
