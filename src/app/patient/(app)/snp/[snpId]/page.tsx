import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { SnpDetailPanel } from "@/components/patient/snp-detail";
import { matchPrimaryCategory } from "@/lib/health/categories";
import { HEALTH_CATEGORIES } from "@/lib/health/categories";

export default async function SnpDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ snpId: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { snpId: raw } = await params;
  const snpId = decodeURIComponent(raw);
  const sp = await searchParams;
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  let foundCat = sp.cat
    ? twin.categories.find((c) => c.id === sp.cat)
    : undefined;
  let snp = foundCat?.snps.find((s) => s.snpId === snpId);

  if (!snp) {
    for (const c of twin.categories) {
      const hit = c.snps.find((s) => s.snpId === snpId);
      if (hit) {
        snp = hit;
        foundCat = c;
        break;
      }
    }
  }

  // Fallback: search all SNPs across categories via primary category match
  if (!snp) {
    for (const c of twin.categories) {
      const hit = c.snps.find(
        (s) =>
          s.snpId === snpId ||
          s.snpId.split("__")[0] === snpId ||
          snpId.startsWith(s.snpId)
      );
      if (hit) {
        snp = hit;
        foundCat = c;
        break;
      }
    }
  }

  if (!snp) notFound();

  const catId =
    foundCat?.id ||
    HEALTH_CATEGORIES.find((c) =>
      matchPrimaryCategory(snp!.primaryCategory, c)
    )?.id;

  const snpTitle =
    catId === "pharmacogenetics"
      ? locale === "lt"
        ? "Farmakogenetika (SNP)"
        : "Pharmacogenetics (SNP)"
      : labels.snpTestTitle;

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Link
        href={
          catId ? `/patient/digital-twin/${catId}` : "/patient/digital-twin"
        }
        className="text-sm text-[var(--muted)]"
      >
        ← {labels.back}
      </Link>
      <SnpDetailPanel
        snp={snp}
        locale={locale}
        labels={labels}
        snpTestLabel={snpTitle}
      />
    </div>
  );
}
