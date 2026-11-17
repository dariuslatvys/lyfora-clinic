import { HealthMapMosaic } from "@/components/patient/health-map-mosaic";
import type { BodyMapCategory } from "@/components/patient/body-map";

/** Female overview: illustrated mosaic (shared health-map shell). */
export function WomenHealthMap({
  categories,
  geneHint,
  locale = "lt",
  interactive = true,
  hrefForCategory,
  tileIdPrefix,
  focusCategoryId,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
  locale?: "lt" | "en";
  interactive?: boolean;
  hrefForCategory?: (categoryId: string) => string | null | undefined;
  tileIdPrefix?: string;
  focusCategoryId?: string;
}) {
  return (
    <HealthMapMosaic
      sex="female"
      categories={categories}
      geneHint={geneHint}
      locale={locale}
      interactive={interactive}
      hrefForCategory={hrefForCategory}
      tileIdPrefix={tileIdPrefix}
      focusCategoryId={focusCategoryId}
    />
  );
}
