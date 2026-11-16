import Link from "next/link";
import { COLOUR_HEX, PILL_CLASS, type RiskColour } from "@/lib/health/colours";
import {
  DEMO_PHENOTYPE_STATUS,
  REPRODUCTIVE_PHENOTYPES,
  type PhenotypeSignal,
} from "@/lib/health/reproductive-phenotypes";

const SIGNAL_PILL: Record<PhenotypeSignal, string> = {
  active: "c-orange",
  watch: "c-yellow",
  ruled_out: "c-green",
  no_signal: "c-green",
  not_applicable: "c-none",
};

export function ReproductivePhenotypesPanel({
  locale,
}: {
  locale: "lt" | "en";
}) {
  const statusById = new Map(DEMO_PHENOTYPE_STATUS.map((s) => [s.id, s]));

  return (
    <section className="panel repro-panel space-y-4">
      <div className="repro-panel-head">
        <h3 className="repro-panel-title">
          {locale === "en"
            ? "Four women’s health phenotypes"
            : "Keturi moters sveikatos fenotipai"}
        </h3>
        <p className="repro-panel-lead">
          {locale === "en"
            ? "Each phenotype explains impact on cycle and hormones, fertility and daily life. Your signal combines the questionnaire, labs and genetics."
            : "Kiekvienas fenotipas paaiškina poveikį ciklui ir hormonams, vaisingumui ir kasdienybei. Jūsų signalas jungia klausimyną, tyrimus ir genetiką."}
        </p>
      </div>

      <div className="repro-pheno-grid">
        {REPRODUCTIVE_PHENOTYPES.map((p) => {
          const st = statusById.get(p.id)!;
          const href = `/patient/digital-twin/reproductive/${p.id}`;
          return (
            <Link
              key={p.id}
              href={href}
              className="repro-pheno-card"
              style={{ ["--cc" as string]: COLOUR_HEX[st.colour as RiskColour] }}
            >
              <div className="repro-pheno-top">
                <h4>{locale === "en" ? p.nameEn : p.nameLt}</h4>
                <span
                  className={`pill ${SIGNAL_PILL[st.signal] || PILL_CLASS[st.colour]}`}
                >
                  {locale === "en" ? st.statusEn : st.statusLt}
                </span>
              </div>
              <p className="repro-pheno-short">
                {locale === "en" ? p.shortEn : p.shortLt}
              </p>
              <dl className="repro-pheno-impact">
                <div>
                  <dt>{locale === "en" ? "Reproductive health" : "Reprodukcinė sveikata"}</dt>
                  <dd>{locale === "en" ? p.impactEn : p.impactLt}</dd>
                </div>
                <div>
                  <dt>{locale === "en" ? "Fertility" : "Vaisingumas"}</dt>
                  <dd>{locale === "en" ? p.fertilityEn : p.fertilityLt}</dd>
                </div>
                <div>
                  <dt>{locale === "en" ? "Daily life" : "Kasdienė gyvenimo kokybė"}</dt>
                  <dd>{locale === "en" ? p.dailyEn : p.dailyLt}</dd>
                </div>
              </dl>
              <span className="repro-pheno-cta">
                {locale === "en" ? "Open details →" : "Atidaryti detales →"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
