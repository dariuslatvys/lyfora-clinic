import Link from "next/link";
import { COLOUR_HEX, PILL_CLASS } from "@/lib/health/colours";
import {
  getPhenotypeStatus,
  type ReproductivePhenotype,
} from "@/lib/health/reproductive-phenotypes";

export function PhenotypeDetailView({
  locale,
  phenotype,
}: {
  locale: "lt" | "en";
  phenotype: ReproductivePhenotype;
}) {
  const st = getPhenotypeStatus(phenotype.id);
  const colour = st?.colour ?? "grey";

  return (
    <div className="stack phenotype-detail" style={{ gap: 16 }}>
      <section
        className="panel cat-hero"
        style={{
          borderColor: COLOUR_HEX[colour],
          background: `linear-gradient(160deg, color-mix(in srgb, ${COLOUR_HEX[colour]} 18%, var(--surface)), var(--surface) 55%)`,
        }}
      >
        <div className="cat-hero-top">
          <h2 className="cat-hero-title">
            {locale === "en" ? phenotype.nameEn : phenotype.nameLt}
          </h2>
          {st ? (
            <span className={`pill ${PILL_CLASS[colour]}`}>
              {locale === "en" ? st.statusEn : st.statusLt}
            </span>
          ) : null}
        </div>
        <p className="cat-hero-summary">
          {locale === "en" ? phenotype.shortEn : phenotype.shortLt}
        </p>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en"
            ? "How it affects you"
            : "Kaip tai veikia Jus"}
        </h3>
        <dl className="repro-pheno-impact phenotype-impact-block">
          <div>
            <dt>
              {locale === "en" ? "Reproductive health" : "Reprodukcinė sveikata"}
            </dt>
            <dd>{locale === "en" ? phenotype.impactEn : phenotype.impactLt}</dd>
          </div>
          <div>
            <dt>{locale === "en" ? "Fertility" : "Vaisingumas"}</dt>
            <dd>
              {locale === "en" ? phenotype.fertilityEn : phenotype.fertilityLt}
            </dd>
          </div>
          <div>
            <dt>
              {locale === "en"
                ? "Daily quality of life"
                : "Kasdienė gyvenimo kokybė"}
            </dt>
            <dd>{locale === "en" ? phenotype.dailyEn : phenotype.dailyLt}</dd>
          </div>
        </dl>
      </section>

      <section className="panel pmos-section">
        <h3>
          {locale === "en" ? "Your questionnaire signal" : "Jūsų klausimyno signalas"}
        </h3>
        <p className="pmos-section-lead">
          {phenotype.id === "endometriosis"
            ? locale === "en"
              ? "NICE endometriosis suspicion signs were not present in your answers (no activity-limiting period pain pattern, painkillers help, no bowel/bladder pain markers). So there is no endometriosis signal right now."
              : "NICE endometriozės įtarimo požymių Jūsų atsakymuose nėra (skausmas netrukdo veiklai, nuskausminamieji padeda, nėra tuštinimosi / šlapinimosi skausmo žymenų). Todėl endometriozės signalo dabar nėra."
            : phenotype.id === "early_perimenopause"
              ? locale === "en"
                ? "You are 26, the current cycle gap is under 4 months, and there are no hot flushes. Early-onset perimenopause was ruled out in the evaluation order before PMOS."
                : "Jums 26 m., dabartinė ciklo pertrauka trumpesnė nei 4 mėn., karščio bangų nėra. Anksti prasidėjusi perimenopauzė atmesta vertinimo eilėje prieš PMOS."
              : locale === "en"
                ? "Menopause criteria (12 months without periods) do not apply at age 26. The menopause section of the questionnaire was not shown."
                : "Menopauzės kriterijai (12 mėn. be mėnesinių) 26 m. amžiuje netaikomi. Klausimyno menopauzės skyrius Jums nebuvo rodomas."}
        </p>
        <p className="pmos-disclaimer">
          {locale === "en"
            ? "This is educational context from your questionnaire — not a diagnosis."
            : "Tai edukacinis kontekstas iš Jūsų klausimyno — ne diagnozė."}
        </p>
      </section>

      <p className="pmos-back">
        <Link href="/patient/digital-twin/reproductive">
          ←{" "}
          {locale === "en"
            ? "Back to reproductive health"
            : "Atgal į reprodukcinę sveikatą"}
        </Link>
      </p>
    </div>
  );
}
