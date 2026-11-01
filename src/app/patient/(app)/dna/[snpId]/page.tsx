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
import { t } from "@/lib/i18n/dictionary";
import {
  COLOUR_HEX,
  COLOUR_SOFT,
  PILL_CLASS,
  type RiskColour,
} from "@/lib/health/colours";
import { AskAiButton } from "@/components/patient/ask-ai-button";

function colourTitle(colour: DnaResultColour, locale: "lt" | "en") {
  const lt: Record<string, string> = {
    green: "Gerai",
    badge: "Genetinis žymuo",
    yellow: "Stebėti",
    orange: "Dėmesio",
    red: "Kritiška",
    none: "Nenustatyta",
    grey: "Nėra duomenų",
  };
  const en: Record<string, string> = {
    green: "Good",
    badge: "Genetic marker",
    yellow: "Watch",
    orange: "Attention",
    red: "Critical",
    none: "Not determined",
    grey: "No data",
  };
  return (locale === "en" ? en : lt)[colour] || colour;
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
  const meaning = locale === "en" ? row.infoEn : row.infoLt;
  const alleleLine =
    row.matchCount == null
      ? locale === "en"
        ? "Genotype not determined in the uploaded file."
        : "Genotipas faile nenustatytas."
      : locale === "en"
        ? `Genotype ${row.genotype} · risk alleles ${row.matchCount}/2 (effect allele ${row.effectAllele1}).`
        : `Genotipas ${row.genotype} · rizikos aleliai ${row.matchCount}/2 (efekto alelis ${row.effectAllele1}).`;

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
                  ? `Explain ${row.gene} ${row.snpId} genotype ${row.genotype ?? "unknown"} from my DNA panel in plain language`
                  : `Paaiškink ${row.gene} ${row.snpId} genotipą ${row.genotype ?? "nenustatyta"} pagal mano DNR panelę paprasta kalba`
              }
            />
          </div>
        </div>

        <div className="stack" style={{ gap: 14 }}>
          <div className="rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface-raised)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--ink)] m-0">
              {alleleLine}
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
            <p className="text-[0.98rem] leading-relaxed text-[var(--ink)] m-0">
              {meaning}
            </p>
          </div>

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
