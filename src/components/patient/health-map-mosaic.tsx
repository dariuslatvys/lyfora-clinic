import Image from "next/image";
import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_HEX } from "@/lib/health/colours";
import {
  FEMALE_OVERVIEW_ORDER,
  MALE_OVERVIEW_ORDER,
  type HealthCategoryId,
} from "@/lib/health/categories";
import {
  FEMALE_HEALTH_MAP_ART,
  MALE_HEALTH_MAP_ART,
  type HealthMapArt,
} from "@/lib/health/health-map-art";
import type { BodyMapCategory } from "@/components/patient/body-map";

export function HealthMapMosaic({
  sex,
  categories,
  geneHint,
  locale = "lt",
}: {
  sex: "male" | "female";
  categories: BodyMapCategory[];
  geneHint: string;
  locale?: "lt" | "en";
}) {
  const order = sex === "female" ? FEMALE_OVERVIEW_ORDER : MALE_OVERVIEW_ORDER;
  const artPack: Record<string, HealthMapArt> =
    sex === "female" ? FEMALE_HEALTH_MAP_ART : MALE_HEALTH_MAP_ART;
  const byId = new Map(categories.map((c) => [c.id, c]));
  const ordered = order
    .map((id) => byId.get(id))
    .filter((c): c is BodyMapCategory => !!c);
  const rest = categories.filter(
    (c) => !order.includes(c.id as HealthCategoryId)
  );
  const tiles = [...ordered, ...rest].slice(0, sex === "female" ? 6 : 7);

  return (
    <div
      className={`health-map rise-in-delay ${
        sex === "male" ? "is-male" : "is-female"
      }`}
    >
      <p className="health-map-hint">{geneHint}</p>
      <div
        className={`health-map-mosaic ${
          sex === "male" ? "is-male" : "is-female"
        }`}
      >
        {tiles.map((c, i) => {
          const art = artPack[c.id];
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`health-mosaic-card health-mosaic-${i}`}
              style={{ ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour] }}
            >
              <span className="health-mosaic-media" aria-hidden={!art}>
                {art ? (
                  <Image
                    src={art.src}
                    alt={locale === "en" ? art.altEn : art.altLt}
                    fill
                    sizes="(max-width: 720px) 100vw, 50vw"
                    className="health-mosaic-img"
                    priority={i < 2}
                  />
                ) : (
                  <span className="health-mosaic-fallback" />
                )}
                <span className="health-mosaic-scrim" />
              </span>
              <span className="health-mosaic-copy">
                <span className="health-mosaic-status">
                  {c.colourLabel}
                  {c.geneticBadge ? ` · ${c.geneticMark || "DNR"}` : ""}
                </span>
                <b>{c.title}</b>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
