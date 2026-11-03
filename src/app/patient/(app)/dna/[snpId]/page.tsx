import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { loadDnaPanel } from "@/lib/health/load-dna";
import {
  dnaCategoryLabel,
  dnaGroupLabel,
  dnaPrimaryToCategoryId,
  type DnaResultColour,
} from "@/lib/health/dna-panel";
import { explainDnaSnp } from "@/lib/health/explain-dna-snp";
import { t } from "@/lib/i18n/dictionary";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  type RiskColour,
} from "@/lib/health/colours";
import { AskAiButton } from "@/components/patient/ask-ai-button";

function colourTitle(colour: DnaResultColour, locale: "lt" | "en") {
  if (colour === "none") {
    return locale === "en" ? "Not determined" : "Nenustatyta";
  }
  const labels =
    locale === "en"
      ? {
          green: "No risk",
          badge: "Low",
          yellow: "Low",
          orange: "Elevated",
          red: "Significant",
          grey: "No data",
        }
      : {
          green: "Nėra rizikos",
          badge: "Nedidelė",
          yellow: "Nedidelė",
          orange: "Padidėjusi",
          red: "Ženkli",
          grey: "Nėra duomenų",
        };
  return (labels as Record<string, string>)[colour] || colour;
}

function impactLabel(impact: string, locale: "lt" | "en") {
  const lt: Record<string, string> = {
    high: "didelis poveikis",
    moderate: "vidutinis poveikis",
    low: "mažas poveikis",
    clinical: "klinikinis poveikis",
  };
  const en: Record<string, string> = {
    high: "high impact",
    moderate: "moderate impact",
    low: "low impact",
    clinical: "clinical impact",
  };
  return (locale === "en" ? en : lt)[impact] || impact;
}

export default async function DnaSnpDetailPage({
  params,
}: {
  params: Promise<{ snpId: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { snpId: raw } = await params;
  const snpId = decodeURIComponent(raw);
  const current = await getCurrentUser();
  if (!current?.patient) redirect("/login/patient");
  const locale = (current.user.locale as "lt" | "en") || "lt";
  const labels = t(locale);
  const panel = loadDnaPanel(current.patient.id);
  if (!panel) redirect("/login/patient");

  const row = panel.results.find((r) => r.snpId === snpId);
  if (!row) notFound();

  const colour: RiskColour =
    row.colour === "none" ? "grey" : (row.colour as RiskColour);
  const catId = dnaPrimaryToCategoryId(row.primaryCategoryEn, panel.sex);
  const expl = explainDnaSnp(row, locale);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <Link href="/patient/dna" className="text-sm text-[var(--muted)]">
        ← {labels.myDna}
      </Link>

      <section
        className="card"
        style={{
          borderColor: COLOUR_HEX[colour],
          background: `linear-gradient(165deg, ${COLOUR_SOFT[colour]}, var(--surface) 42%)`,
        }}
      >
        <div className="card-head">
          <div>
            <p className="eyebrow m-0">
              {dnaGroupLabel(row.group, locale)} ·{" "}
              {dnaCategoryLabel(row.primaryCategoryEn, locale)}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold tracking-[-0.01em] m-0 mt-1">
              {row.gene} · {row.snpId}
            </h1>
            <p className="small muted mt-1 mb-0">
              {impactLabel(row.impact, locale)} · {row.evidence}
            </p>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className={`pill ${PILL_CLASS[colour]}`}>
              {colourTitle(row.colour, locale)}
            </span>
            <AskAiButton
              label={labels.askAi}
              question={
                locale === "en"
                  ? `Explain ${row.gene} ${row.snpId} genotype ${row.genotype ?? "unknown"} from my DNA panel in plain language, including what it means for me personally`
                  : `Paaiškink ${row.gene} ${row.snpId} genotipą ${row.genotype ?? "nenustatyta"} pagal mano DNR panelę paprasta kalba ir ką tai reiškia man asmeniškai`
              }
            />
          </div>
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--ink)] m-0">
              {expl.genotypeLine}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)] mb-0">
              {expl.whyColour}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)] mb-0">
              {locale === "en"
                ? `Result colour: ${colourTitle(row.colour, locale)}. This is a predisposition signal from the 32-SNP panel — not a diagnosis.`
                : `Rezultato spalva: ${colourTitle(row.colour, locale)}. Tai polinkio signalas iš 32 SNP panelės — ne diagnozė.`}
            </p>
          </div>

          <div className="rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-4">
            <p className="eyebrow mb-2">
              {locale === "en" ? "In plain language" : "Paprastai tariant"}
            </p>
            <div className="space-y-3 text-[0.98rem] leading-relaxed text-[var(--ink)]">
              {expl.plainParas.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === expl.plainParas.length - 1 &&
                    /Ką tai gali reikšti|What this may mean/i.test(para)
                      ? "rounded-[var(--radius-s)] bg-[var(--accent-soft)]/55 px-3 py-2.5 font-medium text-[var(--ink)] mb-0"
                      : "m-0"
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[var(--muted)] m-0">
            {expl.disclaimer}
          </p>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <Link
              href={`/patient/digital-twin/${catId}`}
              className="btn ghost sm"
            >
              {locale === "en" ? "Open health area" : "Atidaryti sveikatos sritį"}
            </Link>
            <Link href="/patient/dna" className="btn ghost sm">
              {locale === "en" ? "Back to My DNA" : "Grįžti į Mano DNR"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
