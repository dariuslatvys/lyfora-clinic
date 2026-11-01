import type { RiskColour } from "./colours";
import { collectFlaggedLabs } from "./marker-colour";
import { formatMarkerReading } from "./marker-display";
import { goalsFromMetrics } from "./goals-from-metrics";
import { MARKETPLACE_ITEMS } from "@/lib/marketplace/catalog";

export type RecommendationItem = {
  id: string;
  title: string;
  why: string;
  colour: RiskColour;
  href: string;
  group: "priority" | "labs" | "goals" | "shop" | "care";
  cta?: string;
};

const RANK: Record<RiskColour, number> = {
  grey: 0,
  green: 1,
  badge: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

const AREA_TO_PKG: Record<string, string> = {
  cardiovascular: "lab-pkg-cardiovascular-core",
  metabolic: "lab-pkg-metabolic-core",
  physical: "lab-pkg-physical-core",
  mental: "lab-pkg-mental-core",
  hormonal: "lab-pkg-hormonal-m-core",
  immune: "lab-pkg-immune-core",
  nutrient: "lab-pkg-nutrient-core",
};

type TwinLike = {
  markers: {
    markerKey: string;
    name?: string;
    value: number;
    unit?: string | null;
    refLow?: number | null;
    refHigh?: number | null;
    flag?: string | null;
    observedAt: string;
  }[];
  categories: {
    id: string;
    summary: string;
    colour: RiskColour;
    geneticBadge?: boolean;
    rare: unknown[];
  }[];
};

export function buildRecommendations(
  twin: TwinLike,
  locale: "lt" | "en",
  categoryNames?: Record<string, string>
): RecommendationItem[] {
  const out: RecommendationItem[] = [];
  const catTitle = (id: string) => categoryNames?.[id] || id;

  const attention = twin.categories
    .filter((c) => RANK[c.colour] >= 3)
    .sort((a, b) => RANK[b.colour] - RANK[a.colour]);

  for (const c of attention) {
    const title = catTitle(c.id);
    out.push({
      id: `cat-${c.id}`,
      title:
        locale === "en" ? `Review ${title}` : `Peržiūrėti: ${title}`,
      why: c.summary,
      colour: c.colour,
      href: `/patient/digital-twin/${c.id}`,
      group: "priority",
      cta: locale === "en" ? "Open area" : "Atidaryti sritį",
    });
  }

  const flagged = collectFlaggedLabs(twin.markers).slice(0, 8);
  for (const f of flagged) {
    const reading = formatMarkerReading(f.value, f.unit, f.markerKey);
    out.push({
      id: `lab-${f.markerKey}`,
      title: f.name,
      why:
        locale === "en"
          ? `Latest value ${reading} is outside the reference range.`
          : `Paskutinė reikšmė ${reading} — už normos ribų.`,
      colour: f.colour,
      href: `/patient/marker/${encodeURIComponent(f.markerKey)}`,
      group: "labs",
      cta: locale === "en" ? "Open marker" : "Atidaryti rodiklį",
    });
  }

  const goals = goalsFromMetrics(twin.markers, locale, 6);
  for (const g of goals.filter((x) => x.progress < 100)) {
    out.push({
      id: `goal-${g.markerKey}`,
      title: g.title,
      why:
        g.detail ||
        (locale === "en"
          ? `Progress ${g.progress}% toward target.`
          : `Progresas ${g.progress}% link tikslo.`),
      colour: g.colour,
      href: `/patient/marker/${encodeURIComponent(g.markerKey)}`,
      group: "goals",
      cta: locale === "en" ? "Track goal" : "Stebėti tikslą",
    });
  }

  const suggestedIds = new Set<string>();
  for (const c of attention) {
    const pkgId = AREA_TO_PKG[c.id];
    if (pkgId) suggestedIds.add(pkgId);
  }
  if (twin.categories.some((c) => c.rare.length > 0 || c.geneticBadge)) {
    suggestedIds.add("gen-hrt-lipid");
    suggestedIds.add("con-genetics-60");
  }
  if (attention.some((c) => c.id === "cardiovascular")) {
    suggestedIds.add("gen-hrt02");
    suggestedIds.add("con-cardio-45");
  }
  if (suggestedIds.size === 0) {
    suggestedIds.add("lab-pkg-cardiovascular-core");
    suggestedIds.add("wel-diet-intro");
  }

  for (const id of suggestedIds) {
    const item = MARKETPLACE_ITEMS.find((m) => m.id === id);
    if (!item) continue;
    out.push({
      id: `shop-${item.id}`,
      title: locale === "en" ? item.nameEn : item.nameLt,
      why: locale === "en" ? item.summaryEn : item.summaryLt,
      colour: "badge",
      href: `/patient/marketplace`,
      group: "shop",
      cta: locale === "en" ? "Open Marketplace" : "Į Marketplace",
    });
  }

  out.push({
    id: "care-questions",
    title:
      locale === "en"
        ? "Ask your doctor about open findings"
        : "Klausti gydytojo dėl atvirų radinių",
    why:
      locale === "en"
        ? "Use 24/7 messaging if a marker or gene result is unclear."
        : "Naudokite 24/7 chat, jei rodiklis ar geno rezultatas neaiškus.",
    colour: "green",
    href: "/patient/questions",
    group: "care",
    cta: locale === "en" ? "Ask doctor" : "Klausti gydytojo",
  });

  out.push({
    id: "care-visits",
    title:
      locale === "en"
        ? "Keep upcoming visits on track"
        : "Laikykitės vizitų plano",
    why:
      locale === "en"
        ? "Confirm or reschedule planned and missed appointments."
        : "Patvirtinkite arba perkelkite planinius ir praleistus vizitus.",
    colour: "yellow",
    href: "/patient/visits",
    group: "care",
    cta: locale === "en" ? "Open visits" : "Atidaryti vizitus",
  });

  return out;
}
