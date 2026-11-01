import { and, eq } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { MARKETPLACE_ITEMS } from "@/lib/marketplace/catalog";
import {
  DEMO_CONSULTATIONS,
  DEMO_CHAT_THREADS,
} from "@/lib/health/demo-consultations";
import {
  DEMO_PRESCRIPTIONS,
  rxStatusLabel,
} from "@/lib/health/demo-prescriptions";
import {
  DEMO_VISITS,
  withResolvedVisitDate,
  visitTitle,
  visitDoctor,
  visitSpecialty,
  visitNotes,
  visitReportTitle,
  visitReportBody,
} from "@/lib/health/demo-visits";
import { buildHealthCard } from "@/lib/health/health-card-data";
import { INTEGRATION_DEMOS } from "@/lib/health/integrations-demo";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { listPatientUploads } from "@/lib/health/uploads";

export type SearchKind =
  | "page"
  | "visit"
  | "prescription"
  | "lab"
  | "gene"
  | "rare"
  | "condition"
  | "medication"
  | "vaccine"
  | "procedure"
  | "document"
  | "consultation"
  | "chat"
  | "referral"
  | "upload"
  | "category"
  | "marketplace"
  | "integration";

export type SearchHit = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

type IndexedDoc = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Lowercased, diacritic-stripped blob used for matching. */
  hay: string;
  /** Boost for navigation / exact titles. */
  boost?: number;
};

const DIACRITICS = /[\u0300-\u036f]/g;

export function normalizeSearchText(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^\p{L}\p{N}\s./_-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function joinHay(...parts: Array<string | null | undefined>) {
  return normalizeSearchText(parts.filter(Boolean).join(" · "));
}

/** Allow one insertion/deletion/substitution while consuming the whole token. */
function fuzzyPrefix(token: string, word: string): boolean {
  if (token.length < 5 || word.length < 5) return false;
  let i = 0;
  let j = 0;
  let skips = 0;
  while (i < token.length && j < word.length) {
    if (token[i] === word[j]) {
      i += 1;
      j += 1;
      continue;
    }
    if (skips >= 1) return false;
    skips += 1;
    if (i + 1 < token.length && token[i + 1] === word[j]) {
      i += 2;
      j += 1;
      continue;
    }
    if (j + 1 < word.length && token[i] === word[j + 1]) {
      i += 1;
      j += 2;
      continue;
    }
    // substitution
    i += 1;
    j += 1;
  }
  return i >= token.length;
}

/** Google-like fragment match: prefix first, then cautious fuzzy. */
function tokenHitsText(token: string, text: string): number {
  if (!token || !text) return 0;
  if (text === token) return 120;
  if (text.startsWith(token + " ") || text.startsWith(token)) return 95;

  const words = text.split(" ").filter(Boolean);
  let best = 0;
  for (const w of words) {
    if (w === token) best = Math.max(best, 100);
    else if (w.startsWith(token)) best = Math.max(best, 70);
    else if (token.length >= 5 && w.startsWith(token.slice(0, -1))) {
      best = Math.max(best, 44);
    } else if (fuzzyPrefix(token, w)) {
      best = Math.max(best, 40);
    }
  }
  return best;
}

function scoreDoc(doc: IndexedDoc, tokens: string[]): number {
  if (!tokens.length) return 0;
  const title = normalizeSearchText(doc.title);
  const hay = doc.hay;
  let score = doc.boost || 0;

  for (const token of tokens) {
    if (!token) continue;
    const best = Math.max(tokenHitsText(token, title), tokenHitsText(token, hay) * 0.75);
    if (best <= 0) return 0;
    score += best;
  }

  // Prefer shorter, more specific titles when scores are close.
  score += Math.max(0, 24 - Math.min(title.length, 24));
  return score;
}

export function searchKindLabel(kind: SearchKind, locale: Locale): string {
  const lt: Record<SearchKind, string> = {
    page: "Skyrius",
    visit: "Vizitas",
    prescription: "Receptas",
    lab: "Tyrimas",
    gene: "Genas",
    rare: "Reta mutacija",
    condition: "Diagnozė",
    medication: "Vaistas",
    vaccine: "Skiepas",
    procedure: "Procedūra",
    document: "Dokumentas",
    consultation: "Konsultacija",
    chat: "Pokalbiai",
    referral: "Siuntimas",
    upload: "Įkėlimas",
    category: "Sveikatos sritis",
    marketplace: "Marketplace",
    integration: "Integracija",
  };
  const en: Record<SearchKind, string> = {
    page: "Section",
    visit: "Visit",
    prescription: "Prescription",
    lab: "Lab result",
    gene: "Gene",
    rare: "Rare mutation",
    condition: "Diagnosis",
    medication: "Medicine",
    vaccine: "Vaccine",
    procedure: "Procedure",
    document: "Document",
    consultation: "Consultation",
    chat: "Chat",
    referral: "Referral",
    upload: "Upload",
    category: "Health area",
    marketplace: "Marketplace",
    integration: "Integration",
  };
  return (locale === "en" ? en : lt)[kind];
}

function pushDoc(out: IndexedDoc[], doc: Omit<IndexedDoc, "hay"> & { hay?: string }) {
  const hay =
    doc.hay ||
    joinHay(doc.title, doc.subtitle);
  out.push({ ...doc, hay });
}

function buildPages(locale: Locale, labels: ReturnType<typeof t>): IndexedDoc[] {
  const out: IndexedDoc[] = [];
  const pages: Array<{
    href: string;
    title: string;
    aliases: string;
    subtitle?: string;
  }> = [
    {
      href: "/patient/digital-twin",
      title: labels.navOverview,
      aliases: "apzvalga overview digital twin skaitmeninis dvynys",
    },
    {
      href: "/patient/health-card",
      title: labels.healthCard,
      aliases: "sveikatos kortele health card ehr diagnozės",
    },
    {
      href: "/patient/labs",
      title: labels.labs,
      aliases: "tyrimai labs markers kraujo tyrimai cholesterol",
    },
    {
      href: "/patient/dna",
      title: labels.myDna,
      aliases: "mano dnr dna genetika snp ngs",
    },
    {
      href: "/patient/visits",
      title: labels.visits,
      aliases: "vizitai visits appointments",
    },
    {
      href: "/patient/prescriptions",
      title: labels.prescriptions,
      aliases: "receptai prescriptions vaistai e-receptas",
    },
    {
      href: "/patient/referrals",
      title: labels.referrals,
      aliases: "siuntimai referrals",
    },
    {
      href: "/patient/consultations",
      title: labels.consultations,
      aliases: "konsultacijos consultations",
    },
    {
      href: "/patient/recommendations",
      title: labels.recommendations,
      aliases: "rekomendacijos recommendations",
    },
    {
      href: "/patient/uploads",
      title: labels.uploads,
      aliases: "ikelimas uploads failai",
    },
    {
      href: "/patient/integrations",
      title: labels.integrations,
      aliases: "integracijos apple oura",
    },
    {
      href: "/patient/marketplace",
      title: labels.marketplace,
      aliases: "marketplace katalogas uzsakyti",
    },
    {
      href: "/patient/analytics",
      title: labels.analytics,
      aliases: "analitika analytics",
    },
    {
      href: "/patient/privacy",
      title: labels.privacy,
      aliases: "privatumas privacy",
    },
    {
      href: "/patient/questions",
      title: labels.questions,
      aliases: "klausti gydytojo ask doctor 24/7",
    },
    {
      href: "/patient/urgent",
      title: labels.urgentConsult,
      aliases: "skubi konsultacija urgent",
    },
  ];

  for (const p of pages) {
    pushDoc(out, {
      id: `page:${p.href}`,
      kind: "page",
      title: p.title,
      subtitle:
        p.subtitle ||
        (locale === "en" ? "Portal section" : "Portalo skyrius"),
      href: p.href,
      hay: joinHay(p.title, p.aliases, p.subtitle),
      boost: 8,
    });
  }
  return out;
}

function uniqueLatestMarkers(
  markers: Array<{
    markerKey: string;
    name?: string;
    value: number;
    unit?: string | null;
    observedAt: string;
    flag?: string | null;
    descriptionLt?: string | null;
    descriptionEn?: string | null;
  }>
) {
  const latest = new Map<string, (typeof markers)[number]>();
  for (const m of markers) {
    const prev = latest.get(m.markerKey);
    if (!prev || m.observedAt > prev.observedAt) latest.set(m.markerKey, m);
  }
  return [...latest.values()];
}

export function buildPatientSearchIndex(input: {
  patientId: string;
  locale: Locale;
  sex: "male" | "female";
  patientName: string;
}): IndexedDoc[] {
  const { patientId, locale, sex, patientName } = input;
  const labels = t(locale);
  const out: IndexedDoc[] = [];

  out.push(...buildPages(locale, labels));

  const twin = loadDigitalTwin(patientId, locale);

  if (twin) {
    for (const c of twin.categories) {
      const catName = labels.categoryNames[c.id] || c.id;
      pushDoc(out, {
        id: `cat:${c.id}`,
        kind: "category",
        title: catName,
        subtitle: c.summary,
        href: `/patient/digital-twin/${c.id}`,
        hay: joinHay(catName, c.id, c.summary, c.colour),
        boost: 6,
      });
    }

    for (const m of uniqueLatestMarkers(twin.markers)) {
      const name = m.name || m.markerKey;
      const valueBit = `${m.value}${m.unit ? ` ${m.unit}` : ""}`;
      const lipidish = /cholest|lipid|ldl|hdl|triglyc|apo[_\s-]?b|apo[_\s-]?a|lipoprotein/i.test(
        `${name} ${m.markerKey}`
      );
      pushDoc(out, {
        id: `lab:${m.markerKey}`,
        kind: "lab",
        title: name,
        subtitle: `${m.markerKey} · ${valueBit}${
          m.observedAt ? ` · ${m.observedAt.slice(0, 10)}` : ""
        }`,
        href: `/patient/marker/${encodeURIComponent(m.markerKey)}`,
        hay: joinHay(
          name,
          m.markerKey,
          valueBit,
          m.flag,
          locale === "en" ? m.descriptionEn : m.descriptionLt,
          lipidish
            ? "cholesterol cholesterolis lipidai lipidograma lipid ldl hdl trigliceridai"
            : ""
        ),
      });
    }

    const seenSnp = new Set<string>();
    for (const cat of twin.categories) {
      for (const s of cat.snps || []) {
        const key = s.snpId;
        if (seenSnp.has(key)) continue;
        seenSnp.add(key);
        const rs = String(s.snpId).split("__")[0];
        pushDoc(out, {
          id: `gene:${s.snpId}`,
          kind: "gene",
          title: `${s.gene} · ${rs}`,
          subtitle: [
            s.genotypeAvailable ? `${s.allele1}/${s.allele2}` : labels.awaitingDna,
            s.subcategory,
            labels.categoryNames[cat.id] || cat.id,
          ]
            .filter(Boolean)
            .join(" · "),
          href: `/patient/snp/${encodeURIComponent(s.snpId)}?cat=${cat.id}`,
          hay: joinHay(
            s.gene,
            rs,
            s.snpId,
            s.subcategory,
            s.allele1,
            s.allele2,
            labels.categoryNames[cat.id]
          ),
        });
      }
    }

    for (const v of twin.rare || []) {
      const id = String(v.id ?? v.gene ?? "");
      if (!id) continue;
      const rareTitle =
        (locale === "en" ? v.titleEn : v.titleLt) || String(v.gene || id);
      pushDoc(out, {
        id: `rare:${id}`,
        kind: "rare",
        title: rareTitle,
        subtitle: [v.gene, v.significance, v.hgvs]
          .filter(Boolean)
          .map(String)
          .join(" · "),
        href: `/patient/rare/${encodeURIComponent(id)}`,
        hay: joinHay(
          v.gene,
          id,
          v.titleLt,
          v.titleEn,
          v.summaryLt,
          v.summaryEn,
          v.significance,
          v.hgvs,
          v.transcript,
          "ngs rare mutation reta mutacija"
        ),
      });
    }
  }

  for (const visit of DEMO_VISITS.map((v) => withResolvedVisitDate(v))) {
    const title = visitTitle(visit, locale);
    const bits = [
      visitDoctor(visit, locale),
      visitSpecialty(visit, locale),
      visit.placeLt,
      visit.placeEn,
      visitNotes(visit, locale),
      visit.date,
      visit.time,
      visit.status,
    ];
    for (const r of visit.reports || []) {
      bits.push(visitReportTitle(r, locale), visitReportBody(r, locale));
    }
    for (const ref of visit.referrals || []) {
      bits.push(
        locale === "en" ? ref.titleEn : ref.titleLt,
        locale === "en" ? ref.toSpecialtyEn : ref.toSpecialtyLt,
        locale === "en" ? ref.notesEn : ref.notesLt
      );
    }
    pushDoc(out, {
      id: `visit:${visit.id}`,
      kind: "visit",
      title,
      subtitle: `${visit.date} · ${visitDoctor(visit, locale)} · ${visitSpecialty(visit, locale)}`,
      href: `/patient/visits/${visit.id}`,
      hay: joinHay(title, ...bits),
    });

    for (const ref of visit.referrals || []) {
      pushDoc(out, {
        id: `referral:${ref.id}`,
        kind: "referral",
        title: locale === "en" ? ref.titleEn : ref.titleLt,
        subtitle: `${ref.date} · ${
          locale === "en" ? ref.toSpecialtyEn : ref.toSpecialtyLt
        } · ${locale === "en" ? ref.toPlaceEn : ref.toPlaceLt}`,
        href: `/patient/referrals#${encodeURIComponent(ref.id)}`,
        hay: joinHay(
          ref.titleLt,
          ref.titleEn,
          ref.toSpecialtyLt,
          ref.toSpecialtyEn,
          ref.toPlaceLt,
          ref.toPlaceEn,
          ref.notesLt,
          ref.notesEn,
          ref.status,
          title
        ),
      });
    }
  }

  for (const rx of DEMO_PRESCRIPTIONS) {
    pushDoc(out, {
      id: `rx:${rx.id}`,
      kind: "prescription",
      title: locale === "en" ? rx.substanceEn : rx.substanceLt,
      subtitle: `${rx.strength} · ${rx.diagnosisCode} ${
        locale === "en" ? rx.diagnosisEn : rx.diagnosisLt
      } · ${rxStatusLabel(rx.status, locale)}`,
      href: `/patient/prescriptions?rx=${encodeURIComponent(rx.id)}`,
      hay: joinHay(
        rx.substanceLt,
        rx.substanceEn,
        rx.inn,
        rx.atc,
        rx.diagnosisLt,
        rx.diagnosisEn,
        rx.diagnosisCode,
        rx.directionsLt,
        rx.directionsEn,
        rx.doctorLt,
        rx.doctorEn,
        rx.patientNoteLt,
        rx.patientNoteEn,
        rx.number,
        rx.formLt,
        rx.formEn
      ),
    });
  }

  for (const c of DEMO_CONSULTATIONS) {
    pushDoc(out, {
      id: `consult:${c.id}`,
      kind: "consultation",
      title: locale === "en" ? c.titleEn : c.titleLt,
      subtitle: `${c.date} ${c.time} · ${
        locale === "en" ? c.doctorEn : c.doctorLt
      }`,
      href: `/patient/consultations/${c.id}`,
      hay: joinHay(
        c.titleLt,
        c.titleEn,
        c.reasonLt,
        c.reasonEn,
        c.doctorLt,
        c.doctorEn,
        c.specialtyLt,
        c.specialtyEn,
        c.placeLt,
        c.placeEn,
        c.urgency,
        c.mode
      ),
    });
  }

  for (const thread of DEMO_CHAT_THREADS) {
    pushDoc(out, {
      id: `chat:${thread.id}`,
      kind: "chat",
      title: locale === "en" ? thread.titleEn : thread.titleLt,
      subtitle: `${locale === "en" ? thread.doctorEn : thread.doctorLt} · ${
        locale === "en" ? thread.previewEn : thread.previewLt
      }`,
      href: `/patient/consultations/chat/${thread.id}`,
      hay: joinHay(
        thread.titleLt,
        thread.titleEn,
        thread.doctorLt,
        thread.doctorEn,
        thread.specialtyLt,
        thread.specialtyEn,
        thread.previewLt,
        thread.previewEn,
        ...thread.messages.flatMap((m) => [m.textLt, m.textEn])
      ),
    });
  }

  ensureSchema();
  const db = getDb();
  const qRow = db
    .select()
    .from(questionnaire)
    .where(
      and(
        eq(questionnaire.patientId, patientId),
        eq(questionnaire.key, questionnaireStorageKey())
      )
    )
    .get();
  const answers = parseStoredAnswers(qRow?.value);
  const card = buildHealthCard({
    patientName,
    sex,
    dob: twin?.patient.dob || null,
    answers,
  });

  for (const cond of card.conditions) {
    pushDoc(out, {
      id: `dx:${cond.code}:${cond.nameLt}`,
      kind: "condition",
      title: locale === "en" ? cond.nameEn : cond.nameLt,
      subtitle: [cond.code, cond.since, locale === "en" ? cond.statusEn : cond.statusLt]
        .filter(Boolean)
        .join(" · "),
      href: cond.href || "/patient/health-card",
      hay: joinHay(
        cond.nameLt,
        cond.nameEn,
        cond.code,
        cond.statusLt,
        cond.statusEn,
        cond.byLt,
        cond.byEn
      ),
    });
  }
  for (const med of card.meds) {
    pushDoc(out, {
      id: `med:${med.name}`,
      kind: "medication",
      title: med.name,
      subtitle: [med.atc, locale === "en" ? med.doseEn : med.doseLt]
        .filter(Boolean)
        .join(" · "),
      href: med.href || "/patient/health-card",
      hay: joinHay(
        med.name,
        med.atc,
        med.doseLt,
        med.doseEn,
        med.byLt,
        med.byEn
      ),
    });
  }
  for (const v of card.vaccines) {
    pushDoc(out, {
      id: `vacc:${v.id}`,
      kind: "vaccine",
      title: locale === "en" ? v.nameEn : v.nameLt,
      subtitle: [v.date, locale === "en" ? v.placeEn : v.placeLt]
        .filter(Boolean)
        .join(" · "),
      href: "/patient/health-card",
      hay: joinHay(
        v.nameLt,
        v.nameEn,
        v.lot,
        v.productLt,
        v.productEn,
        v.placeLt,
        v.placeEn
      ),
    });
  }
  for (const p of card.procedures) {
    pushDoc(out, {
      id: `proc:${p.id}`,
      kind: "procedure",
      title: locale === "en" ? p.nameEn : p.nameLt,
      subtitle: [p.date, locale === "en" ? p.whereEn : p.whereLt]
        .filter(Boolean)
        .join(" · "),
      href: p.href || `/patient/health-card/procedures/${encodeURIComponent(p.id)}`,
      hay: joinHay(
        p.nameLt,
        p.nameEn,
        p.whereLt,
        p.whereEn,
        p.typeLt,
        p.typeEn,
        p.resultLt,
        p.resultEn,
        p.detailLt,
        p.detailEn
      ),
    });
  }
  for (const [i, d] of card.docs.entries()) {
    pushDoc(out, {
      id: `doc:${i}:${d.nameLt}`,
      kind: "document",
      title: locale === "en" ? d.nameEn : d.nameLt,
      subtitle: [d.date, d.kind].filter(Boolean).join(" · "),
      href: d.href || "/patient/health-card",
      hay: joinHay(d.nameLt, d.nameEn, d.date, d.kind),
    });
  }

  for (const u of listPatientUploads(patientId)) {
    pushDoc(out, {
      id: `upload:${u.id}`,
      kind: "upload",
      title: u.originalName,
      subtitle: [u.category, u.createdAt?.slice(0, 10), u.note]
        .filter(Boolean)
        .join(" · "),
      href: "/patient/uploads",
      hay: joinHay(u.originalName, u.category, u.note, u.mimeType),
    });
  }

  for (const demo of Object.values(INTEGRATION_DEMOS)) {
    pushDoc(out, {
      id: `int:${demo.slug}`,
      kind: "integration",
      title: locale === "en" ? demo.titleEn : demo.titleLt,
      subtitle: locale === "en" ? demo.blurbEn : demo.blurbLt,
      href: `/patient/integrations/${demo.slug}`,
      hay: joinHay(
        demo.titleLt,
        demo.titleEn,
        demo.blurbLt,
        demo.blurbEn,
        demo.listName,
        ...demo.metrics.flatMap((m) => [m.labelLt, m.labelEn, m.value])
      ),
    });
  }

  // Marketplace — searchable, but capped later in ranking.
  for (const item of MARKETPLACE_ITEMS) {
    pushDoc(out, {
      id: `market:${item.id}`,
      kind: "marketplace",
      title: locale === "en" ? item.nameEn : item.nameLt,
      subtitle: [
        locale === "en" ? item.summaryEn : item.summaryLt,
        `${item.priceEur.toFixed(2)} €`,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/patient/marketplace?item=${encodeURIComponent(item.id)}`,
      hay: joinHay(
        item.nameLt,
        item.nameEn,
        item.summaryLt,
        item.summaryEn,
        item.detailLt,
        item.detailEn,
        item.category,
        item.code,
        ...(item.includes || []),
        ...(item.genes || []).slice(0, 40)
      ),
    });
  }

  return out;
}

const KIND_CAP: Partial<Record<SearchKind, number>> = {
  marketplace: 5,
  gene: 8,
  lab: 8,
  page: 4,
};

export function searchPatientIndex(
  docs: IndexedDoc[],
  query: string,
  limit = 24
): SearchHit[] {
  const q = normalizeSearchText(query);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter((t) => t.length >= 2);
  if (!tokens.length) return [];

  const scored: SearchHit[] = [];
  for (const doc of docs) {
    const score = scoreDoc(doc, tokens);
    if (score <= 0) continue;
    scored.push({
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      subtitle: doc.subtitle,
      href: doc.href,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const usedKind = new Map<SearchKind, number>();
  const out: SearchHit[] = [];
  for (const hit of scored) {
    const cap = KIND_CAP[hit.kind];
    const n = usedKind.get(hit.kind) || 0;
    if (cap != null && n >= cap) continue;
    usedKind.set(hit.kind, n + 1);
    out.push(hit);
    if (out.length >= limit) break;
  }
  return out;
}

export function runPatientSearch(input: {
  patientId: string;
  locale: Locale;
  sex: "male" | "female";
  patientName: string;
  query: string;
  limit?: number;
}): SearchHit[] {
  const docs = buildPatientSearchIndex(input);
  return searchPatientIndex(docs, input.query, input.limit ?? 24);
}
