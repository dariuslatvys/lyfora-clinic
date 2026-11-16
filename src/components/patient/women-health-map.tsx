import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_HEX } from "@/lib/health/colours";
import { FEMALE_OVERVIEW_ORDER } from "@/lib/health/categories";
import type { BodyMapCategory } from "@/components/patient/body-map";
import { CategoryGlyph } from "@/components/patient/category-glyph";

export function WomenHealthMap({
  categories,
  geneHint,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
}) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const ordered = FEMALE_OVERVIEW_ORDER.map((id) => byId.get(id)).filter(
    (c): c is BodyMapCategory => !!c
  );
  const rest = categories.filter((c) => !FEMALE_OVERVIEW_ORDER.includes(c.id as never));
  const tiles = [...ordered, ...rest].slice(0, 6);

  return (
    <div className="women-map rise-in-delay">
      <p className="women-map-hint">{geneHint}</p>
      <div className="women-map-grid">
        {tiles.map((c, i) => (
          <Link
            key={c.id}
            href={`/patient/digital-twin/${c.id}`}
            className={`women-tile women-tile-${i}`}
            style={{ ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour] }}
          >
            <span className="women-tile-icon" aria-hidden="true">
              <CategoryGlyph id={c.id} />
            </span>
            <span className="women-tile-copy">
              <b>{c.title}</b>
              <em>
                {c.colourLabel}
                {c.geneticBadge ? ` · ${c.geneticMark || "DNR"}` : ""}
              </em>
            </span>
            <span className="women-tile-bar" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
