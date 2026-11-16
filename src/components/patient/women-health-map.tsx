import Image from "next/image";
import Link from "next/link";
import type { RiskColour } from "@/lib/health/colours";
import { COLOUR_HEX } from "@/lib/health/colours";
import { FEMALE_OVERVIEW_ORDER } from "@/lib/health/categories";
import type { BodyMapCategory } from "@/components/patient/body-map";

const CATEGORY_ART: Record<string, { src: string; altLt: string; altEn: string }> = {
  reproductive: {
    src: "/brand/categories/reproductive.jpg",
    altLt: "Moters sveikata ir gyvybiniai etapai",
    altEn: "Women’s health and life stages",
  },
  oncology: {
    src: "/brand/categories/oncology.jpg",
    altLt: "Vėžio prevencija",
    altEn: "Cancer prevention",
  },
  cardio_metabolic: {
    src: "/brand/categories/cardio_metabolic.jpg",
    altLt: "Širdies, kraujagyslių ir metabolinė sveikata",
    altEn: "Heart, vessels and metabolic health",
  },
  physical: {
    src: "/brand/categories/physical.jpg",
    altLt: "Fizinė sveikata",
    altEn: "Physical health",
  },
  mental: {
    src: "/brand/categories/mental.jpg",
    altLt: "Psichikos ir emocinė sveikata",
    altEn: "Mental and emotional health",
  },
  pharmacogenetics: {
    src: "/brand/categories/pharmacogenetics.jpg",
    altLt: "Farmakogenetika",
    altEn: "Pharmacogenetics",
  },
};

export function WomenHealthMap({
  categories,
  geneHint,
  locale = "lt",
}: {
  categories: BodyMapCategory[];
  geneHint: string;
  locale?: "lt" | "en";
}) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const ordered = FEMALE_OVERVIEW_ORDER.map((id) => byId.get(id)).filter(
    (c): c is BodyMapCategory => !!c
  );
  const rest = categories.filter(
    (c) => !FEMALE_OVERVIEW_ORDER.includes(c.id as never)
  );
  const tiles = [...ordered, ...rest].slice(0, 6);

  return (
    <div className="women-map rise-in-delay">
      <p className="women-map-hint">{geneHint}</p>
      <div className="women-map-mosaic">
        {tiles.map((c, i) => {
          const art = CATEGORY_ART[c.id];
          return (
            <Link
              key={c.id}
              href={`/patient/digital-twin/${c.id}`}
              className={`women-mosaic-card women-mosaic-${i}`}
              style={{ ["--cc" as string]: COLOUR_HEX[c.colour as RiskColour] }}
            >
              <span className="women-mosaic-media" aria-hidden={!art}>
                {art ? (
                  <Image
                    src={art.src}
                    alt={locale === "en" ? art.altEn : art.altLt}
                    fill
                    sizes="(max-width: 720px) 100vw, 50vw"
                    className="women-mosaic-img"
                    priority={i < 2}
                  />
                ) : (
                  <span className="women-mosaic-fallback" />
                )}
                <span className="women-mosaic-scrim" />
              </span>
              <span className="women-mosaic-copy">
                <span className="women-mosaic-status">
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
