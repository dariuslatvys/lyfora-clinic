"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BodyMapCategory } from "@/components/patient/body-map";
import type { RiskColour } from "@/lib/health/colours";

type TwinStatus = "stable" | "watch" | "priority";

type OrganId =
  | "brain"
  | "lungs"
  | "heart"
  | "digestive"
  | "reproductive"
  | "vitality";

type OrganDef = {
  id: OrganId;
  categoryId: string;
  label: { lt: string; en: string };
  short: { lt: string; en: string };
  /** Marker position inside the body frame (%). */
  x: number;
  y: number;
  callout?: "left" | "right";
  calloutY?: string;
};

/** Map Lyfora categories → organ systems (Northway-style twin). */
const ORGANS: OrganDef[] = [
  {
    id: "brain",
    categoryId: "mental",
    label: { lt: "Smegenys", en: "Brain" },
    short: { lt: "Psichika", en: "Mental" },
    x: 50,
    y: 11,
    callout: "left",
    calloutY: "12%",
  },
  {
    id: "lungs",
    categoryId: "oncology",
    label: { lt: "Plaučiai / onkologija", en: "Lungs / oncology" },
    short: { lt: "Vėžio prevencija", en: "Cancer prevention" },
    x: 50,
    y: 23,
    callout: "right",
    calloutY: "18%",
  },
  {
    id: "heart",
    categoryId: "cardio_metabolic",
    label: { lt: "Širdis", en: "Heart" },
    short: { lt: "Širdis ir metabolizmas", en: "Heart & metabolic" },
    x: 54,
    y: 30,
    callout: "left",
    calloutY: "48%",
  },
  {
    id: "digestive",
    categoryId: "pharmacogenetics",
    label: { lt: "Virškinimas", en: "Digestive" },
    short: { lt: "Farmakogenetika", en: "Pharmacogenetics" },
    x: 50,
    y: 40,
    callout: "right",
    calloutY: "56%",
  },
  {
    id: "reproductive",
    categoryId: "reproductive",
    label: { lt: "Kiaušidės", en: "Ovaries" },
    short: { lt: "Moters sveikata", en: "Women's health" },
    x: 42,
    y: 44,
    callout: "left",
    calloutY: "68%",
  },
  {
    id: "vitality",
    categoryId: "physical",
    label: { lt: "Vitalumas", en: "Vitality" },
    short: { lt: "Fizinė sveikata", en: "Physical health" },
    x: 68,
    y: 52,
  },
];

function statusFromColour(colour: RiskColour): TwinStatus {
  if (colour === "red" || colour === "orange") return "priority";
  if (colour === "yellow") return "watch";
  return "stable";
}

function scoreFromColour(colour: RiskColour): number {
  if (colour === "red") return 42;
  if (colour === "orange") return 58;
  if (colour === "yellow") return 72;
  if (colour === "green" || colour === "badge") return 91;
  return 80;
}

export function RadialHealthMapLab({
  locale,
  sex,
  categories,
}: {
  locale?: "lt" | "en";
  sex: "male" | "female";
  categories: BodyMapCategory[];
  geneHint?: string;
}) {
  const lang = locale || "lt";
  const byId = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const organs = useMemo(() => {
    return ORGANS.map((o) => {
      // Male patients: remap reproductive → hormones_men if present
      let catId = o.categoryId;
      if (sex === "male") {
        if (o.id === "reproductive") catId = "hormones_men";
        if (o.id === "heart" && byId.has("cardiovascular"))
          catId = "cardiovascular";
        if (o.id === "digestive" && byId.has("metabolic") && !byId.has("pharmacogenetics"))
          catId = "metabolic";
      }
      const cat = byId.get(catId) || byId.get(o.categoryId);
      const colour = (cat?.colour || "grey") as RiskColour;
      const status = statusFromColour(colour);
      const score = scoreFromColour(colour);
      return {
        ...o,
        categoryId: cat?.id || catId,
        title: cat?.title || o.short[lang],
        colourLabel: cat?.colourLabel || "",
        geneticBadge: !!cat?.geneticBadge,
        geneticMark: cat?.geneticMark || "DNR",
        status,
        score,
        href: cat ? `/patient/digital-twin/${cat.id}` : "#",
      };
    }).filter((o) => byId.has(o.categoryId) || o.id !== "reproductive" || sex === "female");
  }, [byId, lang, sex]);

  const [activeId, setActiveId] = useState<OrganId | null>(null);
  const active = organs.find((o) => o.id === activeId) || null;

  const figureSrc =
    sex === "female"
      ? "/brand/health-map/woman-hologram-v5.png"
      : "/brand/body-twin-hub.png";

  const worst = [...organs]
    .filter((o) => o.status !== "stable")
    .sort((a, b) => a.score - b.score);

  return (
    <div className="ly-twin rise-in">
      <div className="ly-twin-bar">
        <div>
          <p className="ly-twin-kicker">
            {lang === "en"
              ? "PRECISION DIGITAL TWIN"
              : "TIKSLUS SKAITMENINIS DVYNYS"}
          </p>
          <h2 className="ly-twin-title">
            Lyfora <span>myTwin</span>
          </h2>
        </div>
        <div className="ly-twin-legend" aria-hidden>
          <span className="st-stable">
            {lang === "en" ? "STABLE" : "STABILU"}
          </span>
          <span className="st-watch">
            {lang === "en" ? "WATCH" : "STEBĖTI"}
          </span>
          <span className="st-priority">
            {lang === "en" ? "PRIORITY" : "PRIORITETAS"}
          </span>
        </div>
      </div>

      <div
        className="ly-twin-viewport"
        data-sex={sex}
        data-active={activeId || ""}
      >
        <div className="ly-twin-glow" aria-hidden />

        <div className="ly-twin-body">
          <Image
            src={figureSrc}
            alt=""
            width={520}
            height={920}
            className="ly-twin-photo"
            priority
            unoptimized
          />
          <span className="ly-twin-scan" aria-hidden />

          {organs.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`ly-marker st-${o.status}${
                activeId === o.id ? " is-on" : ""
              }`}
              style={{ left: `${o.x}%`, top: `${o.y}%` }}
              aria-label={o.label[lang]}
              aria-pressed={activeId === o.id}
              onClick={() =>
                setActiveId((cur) => (cur === o.id ? null : o.id))
              }
            />
          ))}
        </div>

        {organs
          .filter((o) => o.callout)
          .map((o) => (
            <button
              key={`c-${o.id}`}
              type="button"
              className={`ly-callout side-${o.callout} st-${o.status}${
                activeId === o.id ? " is-on" : ""
              }`}
              style={{ top: o.calloutY }}
              onClick={() => setActiveId(o.id)}
            >
              <b>{o.label[lang]}</b>
              <span>{o.short[lang]}</span>
              <strong>
                {o.score}
                <small>/100</small>
              </strong>
            </button>
          ))}

        <div className="ly-twin-hint">
          {lang === "en"
            ? "Tap an organ marker · open the linked health area"
            : "Palieskite organo tašką · atidarykite susijusią sritį"}
        </div>
      </div>

      <div className="ly-twin-dock">
        {active ? (
          <>
            <div className="ly-twin-dock-copy">
              <p className={`ly-pill st-${active.status}`}>
                {active.status === "priority"
                  ? lang === "en"
                    ? "Priority"
                    : "Prioritetas"
                  : active.status === "watch"
                    ? lang === "en"
                      ? "Watch"
                      : "Stebėti"
                    : lang === "en"
                      ? "Stable"
                      : "Stabilu"}
                {active.geneticBadge
                  ? ` · ${active.geneticMark || "DNR"}`
                  : ""}
              </p>
              <h3>{active.title}</h3>
              <p className="ly-twin-dock-meta">
                {active.label[lang]} · {active.colourLabel || active.score + "/100"}
              </p>
            </div>
            <Link href={active.href} className="ly-twin-cta">
              {lang === "en" ? "Open area" : "Atidaryti sritį"}
            </Link>
          </>
        ) : (
          <>
            <div className="ly-twin-dock-copy">
              <p className="ly-twin-kicker" style={{ margin: 0 }}>
                {lang === "en" ? "Signals to review" : "Signalai peržiūrai"}
              </p>
              <h3>
                {worst.length === 0
                  ? lang === "en"
                    ? "All systems stable"
                    : "Visos sistemos stabilios"
                  : worst
                      .slice(0, 2)
                      .map((w) => w.short[lang])
                      .join(" · ")}
              </h3>
            </div>
            {worst[0] ? (
              <button
                type="button"
                className="ly-twin-cta ghost"
                onClick={() => setActiveId(worst[0]!.id)}
              >
                {lang === "en" ? "Inspect" : "Peržiūrėti"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
