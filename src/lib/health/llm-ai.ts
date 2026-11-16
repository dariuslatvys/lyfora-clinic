import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";
import { loadDigitalTwin } from "./load-twin";
import { colourRank } from "./colours";
import { DEMO_PMOS_REPORT } from "./reproductive-phenotypes";

type LlmResult = { reply: string; disclaimer: string } | null;

const DISCLAIMER_LT =
  "Asistentas neteikia diagnozių ir nekeičia gydymo. Informacija paremta jūsų įkeltais duomenimis. Kilus abejonėms kreipkitės į gydytoją ar nuotolinę konsultaciją; 112 — tik gyvybei pavojingais atvejais.";
const DISCLAIMER_EN =
  "This assistant does not give diagnoses or change treatment. Answers are based on your uploaded data. If you have concerns, contact your clinician or book a consult; call emergency services only in life-threatening situations.";

function twinContext(patientId: string, locale: Locale): string {
  const twin = loadDigitalTwin(patientId, locale);
  const labels = t(locale);
  if (!twin) return locale === "en" ? "No twin loaded." : "Dvynys neįkeltas.";

  const cats = twin.categories
    .map((c) => {
      const name = labels.categoryNames[c.id] || c.id;
      const colour = labels.colourLabels[c.colour];
      const genes = c.rare.map((r) => r.gene).join(", ");
      return `${name}: ${colour}${genes ? `; NGS ${genes}` : ""}`;
    })
    .join("\n");

  const pmos =
    twin.patient.sex === "female"
      ? locale === "en"
        ? `PMOS demo signal: ${DEMO_PMOS_REPORT.headlineEn}. ${DEMO_PMOS_REPORT.pmosExpandEn}. Also known as PKS — ${DEMO_PMOS_REPORT.pksExpandLt}.`
        : `PMOS demo signalas: ${DEMO_PMOS_REPORT.headlineLt}. PMOS — ${DEMO_PMOS_REPORT.pmosExpandEn}. PKS — ${DEMO_PMOS_REPORT.pksExpandLt}.`
      : "";

  const attention = twin.categories
    .filter((c) => colourRank(c.colour) >= 3)
    .map((c) => labels.categoryNames[c.id] || c.id)
    .join(", ");

  return [
    `Patient: ${twin.patient.fullName} (${twin.patient.sex})`,
    attention
      ? locale === "en"
        ? `Attention areas: ${attention}`
        : `Dėmesio sritys: ${attention}`
      : "",
    cats,
    pmos,
  ]
    .filter(Boolean)
    .join("\n");
}

/** OpenAI-compatible chat when OPENAI_API_KEY is set; otherwise null. */
export async function tryLlmPatientReply(input: {
  patientId: string;
  locale: Locale;
  message: string;
}): Promise<LlmResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const base =
    process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const disclaimer = input.locale === "en" ? DISCLAIMER_EN : DISCLAIMER_LT;
  const context = twinContext(input.patientId, input.locale);

  const system =
    input.locale === "en"
      ? [
          "You are Lyfora AI, a patient health explainer inside the Lyfora clinic app.",
          "Answer in clear plain English. Do not diagnose or prescribe.",
          "Use only the patient context below plus general medical literacy.",
          "If asked what PMOS/PKS/PCOS is, explain simply and relate to the patient's demo signal when relevant.",
          "Keep answers under 220 words. Use short paragraphs. Bold key terms with ** like **PMOS**.",
          "",
          "Patient context:",
          context,
        ].join("\n")
      : [
          "Tu esi Lyfora AI — paciento sveikatos paaiškintojas Lyfora klinikos programoje.",
          "Atsakyk aiškia lietuvių kalba. Nediagnozuok ir neskirk gydymo.",
          "Naudok tik žemiau esantį paciento kontekstą ir bendrą sveikatos raštingumą.",
          "Jei klausia kas yra PMOS/PKS/PCOS — paaiškink paprastai ir, jei tinka, susiek su paciento demo signalu.",
          "Iki ~220 žodžių. Trumpomis pastraipomis. Svarbius terminus žymėk ** taip: **PMOS**.",
          "",
          "Paciento kontekstas:",
          context,
        ].join("\n");

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: input.message },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;
    return { reply, disclaimer };
  } catch {
    return null;
  }
}
