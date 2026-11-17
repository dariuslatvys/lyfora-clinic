import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";
import { loadDigitalTwin } from "./load-twin";
import { colourRank } from "./colours";
type LlmResult = { reply: string; disclaimer: string } | null;

const DISCLAIMER_LT =
  "Asistentas neteikia diagnozių ir nekeičia gydymo. Informacija paremta jūsų įkeltais duomenimis. Kilus abejonėms kreipkitės į gydytoją ar nuotolinę konsultaciją; 112 — tik gyvybei pavojingais atvejais.";
const DISCLAIMER_EN =
  "This assistant does not give diagnoses or change treatment. Answers are based on your uploaded data. If you have concerns, contact your clinician or book a consult; call emergency services only in life-threatening situations.";

/**
 * De-identified twin summary for third-party LLMs:
 * no name, markers, SNP/NGS gene symbols, or other direct identifiers.
 */
function twinContext(patientId: string, locale: Locale): string {
  const twin = loadDigitalTwin(patientId, locale);
  const labels = t(locale);
  if (!twin) return locale === "en" ? "No twin loaded." : "Dvynys neįkeltas.";

  const cats = twin.categories
    .map((c) => {
      const name = labels.categoryNames[c.id] || c.id;
      const colour = labels.colourLabels[c.colour];
      return `${name}: ${colour}`;
    })
    .join("\n");

  const pmos =
    twin.patient.sex === "female"
      ? locale === "en"
        ? "PMOS educational note available for this female profile (demo phenotype signal may apply)."
        : "Yra PMOS edukacinė pastaba šiam moters profiliui (gali būti demo fenotipo signalas)."
      : "";

  const attention = twin.categories
    .filter((c) => colourRank(c.colour) >= 3)
    .map((c) => labels.categoryNames[c.id] || c.id)
    .join(", ");

  return [
    locale === "en"
      ? `De-identified patient sex: ${twin.patient.sex}`
      : `Deidentifikuota lytis: ${twin.patient.sex}`,
    attention
      ? locale === "en"
        ? `Attention areas (labels only): ${attention}`
        : `Dėmesio sritys (tik pavadinimai): ${attention}`
      : "",
    cats,
    pmos,
  ]
    .filter(Boolean)
    .join("\n");
}

function systemPrompt(locale: Locale, context: string) {
  return locale === "en"
    ? [
        "You are Lyfora AI, a patient health explainer inside the Lyfora clinic app.",
        "Answer in clear plain English. Do not diagnose or prescribe.",
        "Use only the de-identified context below plus general medical literacy.",
        "Never invent personal identifiers, gene names, lab values, or diagnoses.",
        "If asked what PMOS/PKS/PCOS is, explain simply in educational terms.",
        "Keep answers under 220 words. Use short paragraphs. Bold key terms with ** like **PMOS**.",
        "",
        "De-identified health context:",
        context,
      ].join("\n")
    : [
        "Tu esi Lyfora AI — paciento sveikatos paaiškintojas Lyfora klinikos programoje.",
        "Atsakyk aiškia lietuvių kalba. Nediagnozuok ir neskirk gydymo.",
        "Naudok tik žemiau esantį deidentifikuotą kontekstą ir bendrą sveikatos raštingumą.",
        "Niekada neišgalvok asmens duomenų, genų pavadinimų, tyrimų reikšmių ar diagnozių.",
        "Jei klausia kas yra PMOS/PKS/PCOS — paaiškink paprastai edukaciniu stiliumi.",
        "Iki ~220 žodžių. Trumpomis pastraipomis. Svarbius terminus žymėk ** taip: **PMOS**.",
        "",
        "Deidentifikuotas sveikatos kontekstas:",
        context,
      ].join("\n");
}

async function chatCompletions(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  message: string;
}): Promise<string | null> {
  const res = await fetch(
    `${opts.baseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: 0.3,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.message },
        ],
      }),
    }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function geminiGenerate(opts: {
  apiKey: string;
  model: string;
  system: string;
  message: string;
}): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    opts.model
  )}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.message }] }],
      generationConfig: { temperature: 0.3 },
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || null
  );
}

/**
 * Prefer free Groq, then free Gemini, then optional paid OpenAI.
 * Returns null when no key is configured or the provider call fails.
 */
export async function tryLlmPatientReply(input: {
  patientId: string;
  locale: Locale;
  message: string;
}): Promise<LlmResult> {
  const disclaimer = input.locale === "en" ? DISCLAIMER_EN : DISCLAIMER_LT;
  const context = twinContext(input.patientId, input.locale);
  const system = systemPrompt(input.locale, context);

  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  try {
    if (groqKey) {
      const reply = await chatCompletions({
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: groqKey,
        model: process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant",
        system,
        message: input.message,
      });
      if (reply) return { reply, disclaimer };
    }

    if (geminiKey) {
      const reply = await geminiGenerate({
        apiKey: geminiKey,
        model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
        system,
        message: input.message,
      });
      if (reply) return { reply, disclaimer };
    }

    if (openaiKey) {
      const reply = await chatCompletions({
        baseUrl:
          process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
        apiKey: openaiKey,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        system,
        message: input.message,
      });
      if (reply) return { reply, disclaimer };
    }
  } catch {
    return null;
  }

  return null;
}
