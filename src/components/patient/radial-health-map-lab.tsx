"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BodyMapCategory } from "@/components/patient/body-map";
import { CategoryGlyph } from "@/components/patient/category-glyph";
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

function slotsForCount(n: number): Slot[] {
  const out: Slot[] = [];
  const r = 41.5;
  for (let i = 0; i < n; i++) {
    const deg = -90 + (360 / n) * i;
    const rad = (deg * Math.PI) / 180;
    const x = 50 + r * Math.cos(rad);
    const y = 50 + r * Math.sin(rad);
    let side: Slot["side"] = "right";
    if (deg >= -125 && deg <= -55) side = "top";
    else if (deg > -55 && deg < 55) side = "right";
    else if (deg >= 55 && deg <= 125) side = "bottom";
    else side = "left";
    out.push({ x, y, deg, side });
  }
  return out;
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

export function RadialHealthMapLab({
  locale,
  sex,
  categories,
  geneHint,
}: {
  locale: "lt" | "en";
  sex: "male" | "female";
  categories: BodyMapCategory[];
  geneHint: string;
}) {
  const tiles = useMemo(
    () => orderForSex(categories, sex),
    [categories, sex]
  );
  const slots = useMemo(() => slotsForCount(tiles.length), [tiles.length]);
  const [hovered, setHovered] = useState<string | null>(null);

  const figureSrc =
    sex === "female"
      ? "/brand/health-map/woman-hologram-v2.jpg"
      : "/brand/body-twin-hub.png";

  return (
    <div className="orbit-lab rise-in">
      <div className="orbit-lab-head">
        <div>
          <p className="eyebrow m-0">
            {locale === "en" ? "Experiment" : "Eksperimentas"}
          </p>
          <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.45rem]">
            {locale === "en"
              ? "Radial health map (preview)"
              : "Radialus sveikatos žemėlapis (peržiūra)"}
          </h2>
          <p className="small muted m-0 mt-2 max-w-xl">
            {locale === "en"
              ? "Hover a category to enlarge it. Click to open that area."
              : "Užveskite pelę ant kategorijos — ji padidėja. Spustelėję įeisite į sritį."}
          </p>
        </div>
        <Link href="/patient/digital-twin" className="btn ghost sm">
          {locale === "en" ? "Back to current map" : "Grįžti į dabartinį"}
        </Link>
      </div>

      <div className="orbit-lab-stage" data-sex={sex}>
        <div className="orbit-lab-atmosphere" aria-hidden>
          <span className="orbit-haze haze-a" />
          <span className="orbit-haze haze-b" />
          <span className="orbit-haze haze-c" />
          <span className="orbit-pulse" />
        </div>

        <svg className="orbit-lab-rings" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <radialGradient id="orbitCoreGlow" cx="50%" cy="48%" r="45%">
              <stop offset="0%" stopColor="rgba(110,210,255,0.35)" />
              <stop offset="55%" stopColor="rgba(40,120,200,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <linearGradient id="spokeFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="35%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="48" r="42" fill="url(#orbitCoreGlow)" />
          <circle cx="50" cy="48" r="22" className="orbit-ring soft" />
          <circle
            cx="50"
            cy="48"
            r="31"
            className="orbit-ring mid"
            strokeDasharray="0.55 1.35"
          />
          <circle
            cx="50"
            cy="48"
            r="41.5"
            className="orbit-ring main"
            strokeDasharray="1.1 1.05"
          />
          {tiles.map((c, i) => {
            const s = slots[i]!;
            const hot = hovered === c.id;
            return (
              <g key={`spoke-${c.id}`}>
                <line
                  x1="50"
                  y1="48"
                  x2={s.x}
                  y2={s.y}
                  className={`orbit-spoke${hot ? " on" : ""}`}
                  style={{
                    stroke: COLOUR_HEX[c.colour as RiskColour],
                  }}
                />
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={hot ? 3.2 : 1.6}
                  className={`orbit-anchor${hot ? " on" : ""}`}
                  style={{
                    fill: COLOUR_HEX[c.colour as RiskColour],
                  }}
                />
              </g>
            );
          })}
        </svg>

        <div className="orbit-lab-figure" aria-hidden>
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
          const active = hovered === c.id;
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`orbit-node side-${s.side}${active ? " is-hot" : ""}`}
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
              <span className="orbit-node-disc">
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

      <p className="orbit-lab-hint">{geneHint}</p>
    </div>
  );
}
