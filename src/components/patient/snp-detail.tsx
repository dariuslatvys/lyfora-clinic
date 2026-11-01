import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  normalizeColour,
  type RiskColour,
} from "@/lib/health/colours";
import { explainSnp } from "@/lib/health/explain-snp";
import type { EvaluatedSnp } from "@/lib/health/evaluate";
import { AskAiButton } from "@/components/patient/ask-ai-button";

export function SnpDetailPanel({
  snp,
  locale,
  labels,
  snpTestLabel,
}: {
  snp: EvaluatedSnp;
  locale: Locale;
  labels: Dictionary;
  snpTestLabel?: string;
}) {
  const colour: RiskColour = snp.colour || "grey";
  const expl = explainSnp(snp, locale);

  return (
    <section
      id="snp-detail"
      className="card"
      style={{
        borderColor: COLOUR_HEX[colour],
        background: `linear-gradient(165deg, ${COLOUR_SOFT[colour]}, var(--surface) 42%)`,
        scrollMarginTop: 88,
      }}
    >
      <div className="card-head">
        <div>
          <span className="eyebrow">{labels.mechanism}</span>
          <h2 className="font-[family-name:var(--font-display)] text-[1.45rem] font-bold tracking-[-0.01em]">
            {expl.title}
          </h2>
          {snpTestLabel ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{snpTestLabel}</p>
          ) : null}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className={`pill ${PILL_CLASS[colour]}`}>
            {labels.colourLabels[colour]}
          </span>
          <AskAiButton
            label={labels.askAi}
            question={
              locale === "en"
                ? `Explain ${snp.gene} ${snp.snpId} (${snp.allele1}/${snp.allele2}) from my SNP data in plain language`
                : `Paaiškink ${snp.gene} ${snp.snpId} (${snp.allele1}/${snp.allele2}) pagal mano SNP duomenis paprasta kalba`
            }
          />
        </div>
      </div>

      <div className="stack" style={{ gap: 14 }}>
        <div className="rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {expl.genotypeLine}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            {expl.whyColour}
          </p>
          {expl.subcategoryLine ? (
            <p className="mt-2 text-xs font-medium text-[var(--muted)]">
              {expl.subcategoryLine}
            </p>
          ) : null}
          {snp.match1 ? (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Match 1 →{" "}
              {
                labels.colourLabels[
                  normalizeColour(snp.match1) || "grey"
                ]
              }
              {snp.match2
                ? ` · Match 2 → ${
                    labels.colourLabels[
                      normalizeColour(snp.match2) || "grey"
                    ]
                  }`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
          <p className="eyebrow mb-2">
            {locale === "en" ? "In plain language" : "Paprastai tariant"}
          </p>
          <div className="space-y-3 text-[0.98rem] leading-relaxed text-[var(--ink)]">
            {expl.plainBody.split(/\n\n+/).map((para, i) => (
              <p
                key={i}
                className={
                  i === expl.plainBody.split(/\n\n+/).length - 1 &&
                  /Ką tai gali reikšti|What this may mean/i.test(para)
                    ? "rounded-[var(--radius-s)] bg-[var(--accent-soft)]/55 px-3 py-2.5 font-medium text-[var(--ink)]"
                    : undefined
                }
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {expl.disclaimer}
        </p>
      </div>
    </section>
  );
}
