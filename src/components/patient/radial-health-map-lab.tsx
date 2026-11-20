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

/** Heart upper-right, then clockwise — angles avoid head (top) and feet (bottom). */
const LAB_ORDER_FEMALE: HealthCategoryId[] = [
  "cardio_metabolic",
  "oncology",
  "physical",
  "pharmacogenetics",
  "mental",
  "reproductive",
];

/** Fixed orbit degrees so chips never sit on the head or get clipped at the feet. */
const LAB_DEGREES_FEMALE = [-38, 18, 62, 128, 178, 228];
const LAB_DEGREES_MALE = [-40, 10, 55, 125, 175, 220, 250];

const LAB_LABELS: Record<
  "lt" | "en",
  Partial<Record<HealthCategoryId, string>>
> = {
  lt: {
    oncology: "Onkologija",
    cardio_metabolic: "Širdis ir kraujagyslės",
    cardiovascular: "Širdis ir kraujagyslės",
    physical: "Fizinė sveikata",
    pharmacogenetics: "Farmakogenetika",
    mental: "Psichika ir emocinė sveikata",
    reproductive: "Moters sveikata",
    hormones_women: "Moters sveikata",
  },
  en: {
    oncology: "Oncology",
    cardio_metabolic: "Heart & vessels",
    cardiovascular: "Heart & vessels",
    physical: "Physical health",
    pharmacogenetics: "Pharmacogenetics",
    mental: "Mental & emotional health",
    reproductive: "Women's health",
    hormones_women: "Women's health",
  },
};

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
  cardio_metabolic: { x: 48, y: 34, kind: "point" },
  cardiovascular: { x: 48, y: 34, kind: "point" },
  mental: { x: 50, y: 14, kind: "point" },
  reproductive: { x: 50, y: 48, kind: "ovaries" },
  hormones_women: { x: 50, y: 48, kind: "ovaries" },
  pharmacogenetics: { x: 52, y: 42, kind: "point" },
  metabolic: { x: 52, y: 42, kind: "point" },
  physical: { x: 50, y: 36, kind: "point" },
  immune: { x: 50, y: 36, kind: "point" },
  oncology: { x: 50, y: 32, kind: "point" },
  hormones_men: { x: 50, y: 48, kind: "point" },
};

const ORGAN_BY_ID: Record<string, OrganTwin[]> = {
  cardio_metabolic: [
    {
      id: "heart",
      label: "Širdis",
      src: "/brand/health-map/organ-heart-hologram.png",
    },
  ],
  cardiovascular: [
    {
      id: "heart",
      label: "Širdis",
      src: "/brand/health-map/organ-heart-hologram.png",
    },
  ],
  oncology: [
    {
      id: "lymph",
      label: "Limfinė sistema",
      src: "/brand/health-map/organ-lymph-hologram.png",
    },
  ],
  physical: [
    {
      id: "muscles",
      label: "Raumenys",
      src: "/brand/health-map/organ-muscles-hologram.png",
    },
  ],
  immune: [
    {
      id: "lymph",
      label: "Limfinė sistema",
      src: "/brand/health-map/organ-lymph-hologram.png",
    },
  ],
  mental: [
    {
      id: "brain",
      label: "Smegenys",
      src: "/brand/health-map/organ-brain-hologram.png",
    },
  ],
  reproductive: [
    {
      id: "uterus",
      label: "Gimda ir kiaušidės",
      src: "/brand/health-map/organ-uterus-hologram.png",
    },
  ],
  hormones_women: [
    {
      id: "uterus",
      label: "Gimda ir kiaušidės",
      src: "/brand/health-map/organ-uterus-hologram.png",
    },
  ],
  pharmacogenetics: [
    {
      id: "liver",
      label: "Kepenys",
      src: "/brand/health-map/organ-liver-hologram.png",
    },
  ],
  metabolic: [
    {
      id: "liver",
      label: "Kepenys",
      src: "/brand/health-map/organ-liver-hologram.png",
    },
  ],
};

/** Portal + orbit geometry (% of square stage). */
const PORTAL_R = 26;
const ORBIT_R = 40;
const CX = 50;
const CY = 50;

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
  const d = PORTAL_R * 2;
  return {
    x: CX - PORTAL_R + (local.x / 100) * d,
    y: CY - PORTAL_R + (local.y / 100) * d,
  };
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
  return [...ordered, ...rest].slice(0, 7);
}

function degreesFor(sex: "male" | "female", count: number): number[] {
  const preset =
    sex === "female" ? LAB_DEGREES_FEMALE : LAB_DEGREES_MALE;
  if (count <= preset.length) return preset.slice(0, count);
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => -40 + step * i);
}

function focusFor(id: string): BodyFocus {
  return FOCUS_BY_ID[id] || { x: 50, y: 40, kind: "point" };
}

function organsFor(id: string | null): OrganTwin[] {
  if (!id) return [];
  return ORGAN_BY_ID[id] || [];
}

function labTitle(id: string, fallback: string, locale: "lt" | "en" = "lt") {
  return LAB_LABELS[locale][id as HealthCategoryId] || fallback;
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
  locale = "lt",
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
  const degrees = useMemo(
    () => degreesFor(sex, tiles.length),
    [sex, tiles.length]
  );
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
  const activeDeg = activeIndex >= 0 ? degrees[activeIndex] : null;
  const accent = activeTile
    ? COLOUR_HEX[activeTile.colour as RiskColour]
    : "#5ee4a8";
  const stageFocus = active ? focusToStage(active) : null;
  const activeOrbit =
    activeDeg != null ? orbitPoint(activeDeg) : null;

  return (
    <div
      className="twin-lab rise-in"
      onMouseLeave={() => setActiveId(null)}
    >
      <div className="twin-frame">
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
            <circle
              cx={CX}
              cy={CY}
              r={PORTAL_R - 3}
              className="twin-ring-inner"
            />
            <circle
              cx={CX}
              cy={CY}
              r={PORTAL_R}
              className="twin-portal-rim"
            />
            <circle
              cx={CX}
              cy={CY}
              r={PORTAL_R + 4}
              className="twin-ring-mid"
            />
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
                if (
                  sex === "female" &&
                  figureSrc !== FEMALE_TWIN_FALLBACK
                ) {
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
            const deg = degrees[i] ?? -40 + (360 / tiles.length) * i;
            const isHot = activeId === c.id;
            const { x, y } = orbitPoint(deg);
            const outward = deg > -90 && deg < 90 ? "right" : "left";
            const chipOrgans = isHot ? organsFor(c.id) : [];
            return (
              <div
                key={c.id}
                className={`twin-chip-anchor side-${outward}${isHot ? " is-hot" : ""}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour],
                }}
                onMouseEnter={() => setActiveId(c.id)}
                onFocus={() => setActiveId(c.id)}
              >
                {chipOrgans.map((organ) => (
                  <figure
                    key={organ.id}
                    className="twin-chip-organ"
                    aria-hidden
                  >
                    <img
                      src={organ.src}
                      alt=""
                      width={256}
                      height={256}
                      className="twin-chip-organ-photo"
                      decoding="async"
                    />
                  </figure>
                ))}
                <Link
                  href={`/patient/digital-twin/${c.id}`}
                  className={`twin-chip side-${outward}${isHot ? " is-hot" : ""}`}
                >
                  <span className="twin-chip-orb" aria-hidden>
                    <CategoryGlyph id={c.id} />
                  </span>
                  <span className="twin-chip-copy">
                    <b>{labTitle(c.id, c.title, locale)}</b>
                    <em>
                      <i />
                      {c.colourLabel}
                      {c.geneticBadge ? ` · ${c.geneticMark || "DNR"}` : ""}
                    </em>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
