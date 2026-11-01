"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { AskAiButton } from "@/components/patient/ask-ai-button";
import { PILL_CLASS, type RiskColour } from "@/lib/health/colours";
import {
  dnaCategoryLabel,
  dnaGroupLabel,
  type DnaPanel,
  type DnaSnpResult,
} from "@/lib/health/dna-panel";

type FilterId = "all" | "risk" | "clinical" | "unknown";

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

function colourTitle(colour: string, locale: "lt" | "en") {
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

function pillClassFor(colour: string) {
  if (colour === "none") return "c-none";
  return PILL_CLASS[colour as RiskColour] || "c-none";
}

function AlleleDots({ count }: { count: number | null }) {
  if (count == null) {
    return <span className="small muted">—</span>;
  }
  return (
    <span className="dna-alleles" aria-label={`${count} / 2`}>
      <i className={count >= 1 ? "on" : undefined} />
      <i className={count >= 2 ? "on" : undefined} />
      <span className="small num">
        {count}/2
      </span>
    </span>
  );
}

function GenotypeCell({ row }: { row: DnaSnpResult }) {
  if (!row.genotype) return <span className="muted">—</span>;
  return (
    <span className="dna-gt mono">
      {row.genotype.split("").map((a, i) => (
        <span
          key={`${row.snpId}-${i}`}
          className={
            a.toUpperCase() === row.effectAllele1.toUpperCase() ? "risk" : undefined
          }
        >
          {a}
        </span>
      ))}
    </span>
  );
}

export function DnaView({
  locale,
  panel,
}: {
  locale: "lt" | "en";
  panel: DnaPanel;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [howOpen, setHowOpen] = useState(true);

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: `Genetic test · ${panel.totalCount} SNP markers`,
            title: "My DNA",
            blurb:
              "Genetics shows predisposition, not a diagnosis. Most risks change a lot with lifestyle and timely tests.",
            book: "Genetics consult",
            kpiGreen: "No risk alleles",
            kpiBadge: "Marker without clinical effect",
            kpiYellow: "Watch",
            kpiOrange: "Attention",
            search: "Search rsID, gene or keyword…",
            fAll: "All",
            fRisk: "With risk allele",
            fClin: "Clinical",
            fUnk: "Not determined",
            gene: "Gene",
            snp: "SNP",
            genotype: "Genotype",
            alleles: "Risk alleles",
            result: "Result",
            meaning: "What this means",
            explain: "Explain",
            empty: "No markers match this search or filter.",
            howTitle: "How the result is calculated",
            how: [
              "Each SNP from the 32-marker table is looked up in the genotype file. If missing — “Not determined”.",
              "Count how many risk alleles (0, 1 or 2) the genotype carries. “Risk allele 2” is used when data is on the opposite DNA strand.",
              "0 alleles — green; 1 allele — Match 1 colour; 2 alleles — Match 2 colour from the table.",
              "A marker is assigned to the primary health area at full weight; to the secondary area one level lower.",
              "Area colour = highest of labs and DNA. If DNA only gives “Badge”, the area colour does not change and a genetic badge is shown beside it.",
            ],
            criteria:
              "Selection criteria: GWAS and meta-analysis support, OR/RR ≥ 1.2, clinical relevance, independence (no strong LD). Sources: dbSNP, GWAS Catalog, ClinVar, CPIC.",
            tested: "tested",
            of: "of",
            markers: "markers",
          }
        : {
            eyebrow: `Genetinis tyrimas · ${panel.totalCount} SNP žymenys`,
            title: "Mano DNR",
            blurb:
              "Genetika rodo polinkį, o ne diagnozę. Daugumą rizikų stipriai keičia gyvensena ir laiku atlikti tyrimai.",
            book: "Genetiko konsultacija",
            kpiGreen: "Rizikos alelių nėra",
            kpiBadge: "Žymuo be klinikinio poveikio",
            kpiYellow: "Stebėti",
            kpiOrange: "Dėmesio",
            search: "Ieškoti pagal rsID, geną ar raktinį žodį…",
            fAll: "Visi",
            fRisk: "Su rizikos aleliu",
            fClin: "Klinikiniai",
            fUnk: "Nenustatyti",
            gene: "Genas",
            snp: "SNP",
            genotype: "Genotipas",
            alleles: "Rizikos aleliai",
            result: "Rezultatas",
            meaning: "Ką tai reiškia",
            explain: "Paaiškinti",
            empty: "Pagal paiešką ar filtrą žymenų nerasta.",
            howTitle: "Kaip skaičiuojamas rezultatas",
            how: [
              "Genotipo faile ieškomas kiekvienas SNP iš 32 žymenų lentelės. Jei SNP nerastas – „Nenustatyta“.",
              "Suskaičiuojama, kiek rizikos alelių (0, 1 ar 2) turi genotipas. „Rizikos alelis 2“ naudojamas, kai duomenys pateikti priešingai DNR grandinei.",
              "0 alelių – žalia; 1 alelis – „Match 1“ spalva; 2 aleliai – „Match 2“ spalva iš lentelės.",
              "Žymuo priskiriamas pirminei sveikatos sričiai visu svoriu, antrinei – vienu lygiu žemiau.",
              "Srities spalva = aukščiausia iš tyrimų ir DNR. Jei DNR duoda tik „Badge“, srities spalva nesikeičia, o šalia rodomas genetinis ženklelis.",
            ],
            criteria:
              "Atrankos kriterijai: GWAS ir metaanalizių patvirtinimas, OR/RR ≥ 1,2, klinikinė reikšmė, nepriklausomumas (be stipraus LD). Šaltiniai: dbSNP, GWAS Catalog, ClinVar, CPIC.",
            tested: "ištirta",
            of: "iš",
            markers: "žymenų",
          },
    [locale, panel.totalCount]
  );

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return panel.results.filter((r) => {
      if (filter === "risk" && !(r.matchCount != null && r.matchCount > 0))
        return false;
      if (filter === "clinical" && r.impact !== "clinical") return false;
      if (filter === "unknown" && r.matchCount != null) return false;
      if (!query) return true;
      const hay = [
        r.gene,
        r.snpId,
        r.infoLt,
        r.infoEn,
        r.genotype || "",
        r.primaryCategoryEn,
        dnaCategoryLabel(r.primaryCategoryEn, "lt"),
        dnaCategoryLabel(r.primaryCategoryEn, "en"),
        dnaGroupLabel(r.group, "lt"),
        dnaGroupLabel(r.group, "en"),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [panel.results, q, filter]);

  const byGroup = useMemo(() => {
    const map = new Map<number, DnaSnpResult[]>();
    for (const r of shown) {
      const cur = map.get(r.group) || [];
      cur.push(r);
      map.set(r.group, cur);
    }
    return ([1, 2, 3, 4, 5] as const)
      .map((g) => ({ group: g, rows: map.get(g) || [] }))
      .filter((g) => g.rows.length);
  }, [shown]);

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: copy.fAll },
    { id: "risk", label: copy.fRisk },
    { id: "clinical", label: copy.fClin },
    { id: "unknown", label: copy.fUnk },
  ];

  const kpis = [
    { colour: "green", n: panel.counts.green, label: copy.kpiGreen },
    { colour: "badge", n: panel.counts.badge, label: copy.kpiBadge },
    { colour: "yellow", n: panel.counts.yellow, label: copy.kpiYellow },
    { colour: "orange", n: panel.counts.orange, label: copy.kpiOrange },
  ] as const;

  return (
    <div className="stack dna-page" style={{ gap: 16 }}>
      <header className="dna-page-head">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
            {copy.blurb}
          </p>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <AskAiButton
            label={locale === "en" ? "Explain with AI" : "Paaiškinti su AI"}
            question={
              locale === "en"
                ? "Explain my DNA SNP results in plain language, focusing on risk alleles"
                : "Paaiškink mano DNR SNP rezultatus paprasta kalba, akcentuodamas rizikos alelius"
            }
          />
          <Link href="/patient/consultations" className="btn ghost">
            {copy.book}
          </Link>
        </div>
      </header>

      <div className="dna-kpi-grid">
        {kpis.map((k) => (
          <div key={k.colour} className={`card dna-kpi dna-kpi-${k.colour}`}>
            <b className="num">{k.n}</b>
            <span>{k.label}</span>
          </div>
        ))}
      </div>

      <div className="card dna-toolbar">
        <div className="dna-file">
          <b>{panel.fileName}</b>
          <div className="muted xs">
            {locale === "en" ? panel.labNameEn : panel.labNameLt} ·{" "}
            {panel.testedAt} · {copy.tested} {panel.testedCount} {copy.of}{" "}
            {panel.totalCount} {copy.markers}
          </div>
        </div>
        <div className="dna-toolbar-controls">
          <input
            className="market-search dna-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
          />
          <div className="privacy-seg dna-filters" role="group" aria-label="Filter">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? "on" : undefined}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card flush dna-table-card">
        {byGroup.length === 0 ? (
          <div className="empty">{copy.empty}</div>
        ) : (
          <div className="tbl-wrap dna-tbl-wrap">
            <table className="tbl dna-tbl">
              <thead>
                <tr>
                  <th>{copy.gene}</th>
                  <th>{copy.snp}</th>
                  <th>{copy.genotype}</th>
                  <th>{copy.alleles}</th>
                  <th>{copy.result}</th>
                  <th className="hide-mob">{copy.meaning}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {byGroup.map(({ group, rows }) => (
                  <Fragment key={`g-${group}`}>
                    <tr className="dna-group-row">
                      <td colSpan={7} className="eyebrow">
                        {group}) {dnaGroupLabel(group, locale)}
                      </td>
                    </tr>
                    {rows.map((r) => (
                      <tr key={r.snpId}>
                        <td>
                          <b>{r.gene}</b>
                          <div className="xs muted">
                            {dnaCategoryLabel(r.primaryCategoryEn, locale)}
                          </div>
                        </td>
                        <td className="mono">{r.snpId}</td>
                        <td>
                          <GenotypeCell row={r} />
                        </td>
                        <td>
                          <AlleleDots count={r.matchCount} />
                        </td>
                        <td>
                          <span className={`pill plain ${pillClassFor(r.colour)}`}>
                            {colourTitle(r.colour, locale)}
                          </span>
                          <div className="xs muted">
                            {impactLabel(r.impact, locale)}
                          </div>
                        </td>
                        <td className="small hide-mob dna-meaning">
                          {locale === "en" ? r.infoEn : r.infoLt}
                        </td>
                        <td>
                          {r.matchCount != null ? (
                            <AskAiButton
                              label={copy.explain}
                              question={
                                locale === "en"
                                  ? `Explain ${r.gene} ${r.snpId} genotype ${r.genotype} from my DNA panel in plain language`
                                  : `Paaiškink ${r.gene} ${r.snpId} genotipą ${r.genotype} pagal mano DNR panelę paprasta kalba`
                              }
                            />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <details
        className="card dna-how"
        open={howOpen}
        onToggle={(e) => setHowOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary>
          <b>{copy.howTitle}</b>
        </summary>
        <ol className="dna-how-list">
          {copy.how.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ol>
        <p className="xs muted mb-0">{copy.criteria}</p>
      </details>
    </div>
  );
}
