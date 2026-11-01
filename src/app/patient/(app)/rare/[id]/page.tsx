import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import { t } from "@/lib/i18n/dictionary";
import { COLOUR_HEX, PILL_CLASS } from "@/lib/health/colours";
import { AskAiButton } from "@/components/patient/ask-ai-button";
import { rareGeneCategory } from "@/lib/health/rare-genes";

export default async function RareDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const idOrGene = decodeURIComponent(raw);
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const twin = loadDigitalTwin(current.patient.id, locale);
  if (!twin) redirect("/login/patient");

  const variant =
    twin.rare.find((v) => String(v.id) === idOrGene) ||
    twin.rare.find(
      (v) =>
        v.gene.toLowerCase() === idOrGene.toLowerCase() ||
        `${v.gene}-${v.hgvs}` === idOrGene
    );

  if (!variant) notFound();

  const catId = rareGeneCategory(variant.gene);
  const title =
    (locale === "lt" ? variant.titleLt : variant.titleEn) || variant.gene;
  const summary =
    (locale === "lt" ? variant.summaryLt : variant.summaryEn) || "";
  const ask =
    locale === "en"
      ? `Explain my NGS finding ${variant.gene} (${variant.hgvs}) in plain language using my data`
      : `Paaiškink mano NGS radinį ${variant.gene} (${variant.hgvs}) paprasta kalba pagal mano duomenis`;

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

      <section
        className="panel"
        style={{
          borderColor: COLOUR_HEX.red,
          background: `linear-gradient(160deg, ${COLOUR_HEX.red}22, var(--surface) 55%)`,
        }}
      >
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">{labels.rareMutations}</span>
            <h1
              className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold"
              style={{ color: COLOUR_HEX.red }}
            >
              {title}
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {variant.gene} · {variant.hgvs} · {variant.chrom}:{variant.pos} ·
              GT {variant.gt}
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <span className={`pill ${PILL_CLASS.red}`}>
              {labels.colourLabels.red}
            </span>
            <AskAiButton label={labels.askAi} question={ask} />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] p-4">
          <p className="text-sm font-semibold">{labels.ngsTitle}</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{labels.ngsBlurb}</p>
        </div>
        <p className="eyebrow mt-5">{labels.plainLanguage}</p>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-[var(--ink)]">
          {summary || labels.noData}
        </p>
        <p className="disclaim mt-3">
          {locale === "en"
            ? "NGS findings are for clinical discussion — not a diagnosis or prescription change on their own."
            : "NGS radiniai skirti aptarti su gydytoju — patys savaime nėra diagnozė ar gydymo keitimas."}
        </p>
      </section>
    </div>
  );
}
