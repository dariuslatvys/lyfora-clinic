import { HealthMapMosaic } from "@/components/patient/health-map-mosaic";
import type { BodyMapCategory } from "@/components/patient/body-map";

/** Male overview: same mosaic principle as women; male category set + art. */
export function MenHealthMap({
  categories,
  geneHint,
  locale = "lt",
  interactive = true,
  hrefForCategory,
}: {
  categories: BodyMapCategory[];
  geneHint: string;
  locale?: "lt" | "en";
  interactive?: boolean;
  hrefForCategory?: (categoryId: string) => string | null | undefined;
}) {
  return (
    <HealthMapMosaic
      sex="male"
      categories={categories}
      geneHint={geneHint}
      locale={locale}
      interactive={interactive}
      hrefForCategory={hrefForCategory}
    />
  );
}
