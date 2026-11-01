import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";
import { loadDigitalTwin } from "./load-twin";
import { explainSnp } from "./explain-snp";
import { colourRank } from "./colours";

const DISCLAIMER_LT =
  "Asistentas neteikia diagnozių ir nekeičia gydymo. Informacija paremta jūsų įkeltais duomenimis. Esant skubiems simptomams skambinkite 112.";
const DISCLAIMER_EN =
  "This assistant does not give diagnoses or change treatment. Answers are based on your uploaded data. For urgent symptoms call emergency services.";

export function buildPatientAiReply(input: {
  patientId: string;
  locale: Locale;
  message: string;
}): { reply: string; disclaimer: string } {
  const locale = input.locale;
  const labels = t(locale);
  const twin = loadDigitalTwin(input.patientId, locale);
  const disclaimer = locale === "en" ? DISCLAIMER_EN : DISCLAIMER_LT;

  if (!twin) {
    return {
      reply:
        locale === "en"
          ? "I could not load your health card data right now."
          : "Nepavyko įkelti jūsų sveikatos kortelės duomenų.",
      disclaimer,
    };
  }

  const q = input.message.trim();
  const ql = q.toLowerCase();

  const attention = twin.categories
    .filter((c) => colourRank(c.colour) >= 3)
    .sort((a, b) => colourRank(b.colour) - colourRank(a.colour));

  // Focus: specific gene / SNP / rare mutation
  const geneHit = twin.categories
    .flatMap((c) => [
      ...c.rare.map((r) => ({
        kind: "rare" as const,
        cat: c,
        gene: r.gene,
        text: locale === "lt" ? r.summaryLt : r.summaryEn,
        title: locale === "lt" ? r.titleLt : r.titleEn,
        meta: `${r.gene} · ${r.hgvs}`,
      })),
      ...c.snps
        .filter((s) => s.matchCount > 0 || s.colour)
        .map((s) => ({
          kind: "snp" as const,
          cat: c,
          gene: s.gene,
          snp: s,
          text: explainSnp(s, locale).plainBody,
          title: `${s.gene} · ${s.snpId}`,
          meta: `${s.allele1}/${s.allele2}`,
        })),
    ])
    .find((x) => {
      const g = x.gene.toLowerCase();
      if (ql.includes(g)) return true;
      if (x.kind === "snp" && ql.includes(x.snp.snpId.toLowerCase())) return true;
      return false;
    });

  if (geneHit) {
    const catName = labels.categoryNames[geneHit.cat.id] || geneHit.cat.id;
    if (locale === "en") {
      return {
        reply: [
          `About **${geneHit.title}** (category: ${catName}, signal: ${labels.colourLabels[geneHit.cat.colour]}):`,
          "",
          geneHit.text || "No detailed mechanism text is available.",
          "",
          geneHit.kind === "rare"
            ? "This comes from your NGS (deep sequencing) file. It is a risk signal to discuss with a clinician or geneticist — not a diagnosis."
            : "This comes from your basic SNP genotyping result and the Mechanism column of the risk table — not a diagnosis.",
        ].join("\n"),
        disclaimer,
      };
    }
    return {
      reply: [
        `Apie **${geneHit.title}** (kategorija: ${catName}, signalas: ${labels.colourLabels[geneHit.cat.colour]}):`,
        "",
        geneHit.text || "Detalesnis Mechanism paaiškinimas šiuo metu neprieinamas.",
        "",
        geneHit.kind === "rare"
          ? "Tai signalas iš jūsų NGS (išsamios sekoskaitos) failo. Tai nėra diagnozė — verta aptarti su gydytoju ar genetiku."
          : "Tai paaiškinimas pagal bazinį SNP tyrimą ir rizikos lentelės Mechanism stulpelį. Tai nėra diagnozė.",
      ].join("\n"),
      disclaimer,
    };
  }

  // DNA / genetics overview
  if (/dnr|dna|gen|snp|ngs|mutac/.test(ql)) {
    const rareLines = twin.rare.map((r) => {
      const summary = locale === "lt" ? r.summaryLt : r.summaryEn;
      return `- **${r.gene}** (${r.hgvs}): ${summary}`;
    });
    const snpDrivers = twin.categories.flatMap((c) =>
      c.snps
        .filter((s) => s.colour && colourRank(s.colour) >= 3)
        .map((s) => {
          const expl = explainSnp(s, locale);
          return `- **${s.gene}** ${s.snpId} (${s.allele1}/${s.allele2}, ${labels.colourLabels[s.colour!]}): ${expl.plainBody}`;
        })
    );
    if (locale === "en") {
      return {
        reply: [
          "From your genetic data (without diagnosing):",
          "",
          rareLines.length ? "**NGS rare findings:**\n" + rareLines.join("\n") : "**NGS:** no rare findings loaded.",
          "",
          snpDrivers.length
            ? "**SNP positions with stronger colour signals:**\n" + snpDrivers.slice(0, 8).join("\n")
            : "**SNP:** no orange/red risk-allele matches in view.",
          "",
          "Genetics shows predisposition signals, not a diagnosis. Discuss with your clinician if needed.",
        ].join("\n"),
        disclaimer,
      };
    }
    return {
      reply: [
        "Iš jūsų genetinių duomenų (be diagnozės):",
        "",
        rareLines.length
          ? "**NGS retos mutacijos:**\n" + rareLines.join("\n")
          : "**NGS:** retų mutacijų nerasta / neįkelta.",
        "",
        snpDrivers.length
          ? "**SNP pozicijos su stipresniu spalvos signalu:**\n" + snpDrivers.slice(0, 8).join("\n")
          : "**SNP:** oranžinių/raudonų rizikos alelių sutapimų nerasta.",
        "",
        "Genetika rodo polinkio signalus, ne diagnozę. Jei kyla klausimų — aptarkite su gydytoju.",
      ].join("\n"),
      disclaimer,
    };
  }

  // Labs / markers
  if (/žymen|zymen|marker|tyrim|lab|krauj|ldl|cholesterol/.test(ql)) {
    const lines: string[] = [];
    for (const c of twin.categories) {
      const latest = new Map<string, (typeof c.markers)[number]>();
      for (const m of c.markers) latest.set(m.markerKey, m);
      for (const m of latest.values()) {
        const high =
          m.flag === "high" || (m.refHigh != null && m.value > m.refHigh);
        const low =
          m.flag === "low" || (m.refLow != null && m.value < m.refLow);
        if (!high && !low) continue;
        const catName = labels.categoryNames[c.id] || c.id;
        lines.push(
          `- **${m.name || m.markerKey}**: ${m.value}${m.unit ? " " + m.unit : ""} (${catName}; norma ${m.refLow ?? "—"}–${m.refHigh ?? "—"})`
        );
      }
    }
    if (locale === "en") {
      return {
        reply: [
          lines.length
            ? "Markers currently outside the usual range in your card:\n" + lines.slice(0, 12).join("\n")
            : "I do not see markers outside the reference range in the loaded data.",
          "",
          "Out-of-range values are a reason to review trends with your clinician — not a diagnosis by themselves.",
        ].join("\n"),
        disclaimer,
      };
    }
    return {
      reply: [
        lines.length
          ? "Žymenys, kurie šiuo metu yra už įprastų ribų jūsų kortelėje:\n" + lines.slice(0, 12).join("\n")
          : "Įkeltuose duomenyse nematau žymenų už normos ribų.",
        "",
        "Reikšmės už ribų — signalas peržiūrėti tendenciją su gydytoju, o ne diagnozė pati savaime.",
      ].join("\n"),
      disclaimer,
    };
  }

  // Default overview
  const catLines = twin.categories.map((c) => {
    const name = labels.categoryNames[c.id] || c.id;
    const bits: string[] = [labels.colourLabels[c.colour]];
    if (c.rare.length) bits.push(`NGS: ${c.rare.map((r) => r.gene).join(", ")}`);
    const topSnps = c.snps
      .filter((s) => s.colour && colourRank(s.colour) >= 3)
      .slice(0, 2)
      .map((s) => s.gene);
    if (topSnps.length) bits.push(`SNP: ${topSnps.join(", ")}`);
    return `- **${name}**: ${bits.join(" · ")}`;
  });

  if (locale === "en") {
    return {
      reply: [
        "Here is the most important from your Lyfora data (no diagnosis):",
        "",
        attention.length
          ? `Areas needing more attention: ${attention
              .map((c) => labels.categoryNames[c.id] || c.id)
              .join(", ")}.`
          : "No orange/red category signals stand out right now.",
        "",
        "**Categories:**",
        ...catLines,
        "",
        "You can ask about a specific gene (e.g. MSH2, DPYD), SNP, or marker.",
      ].join("\n"),
      disclaimer,
    };
  }

  return {
    reply: [
      "Štai svarbiausia iš jūsų Lyfora duomenų (be diagnozės):",
      "",
      attention.length
        ? `Daugiau dėmesio vertos sritys: ${attention
            .map((c) => labels.categoryNames[c.id] || c.id)
            .join(", ")}.`
        : "Šiuo metu nėra išskirtinai oranžinių/raudonų kategorijų signalų.",
      "",
      "**Kategorijos:**",
      ...catLines,
      "",
      "Galite paklausti apie konkretų geną (pvz. MSH2, DPYD), SNP ar žymenį.",
    ].join("\n"),
    disclaimer,
  };
}
