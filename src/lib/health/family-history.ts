import type { FamilyMember } from "@/lib/health/questionnaire";
import type { RiskColour } from "@/lib/health/colours";

const CURRENT_YEAR = () => new Date().getFullYear();

/** Age now (if living) or age at death (if deceased). */
export function familyMemberAgeYears(
  m: Pick<FamilyMember, "birthYear" | "deathYear" | "vitalStatus">,
  asOfYear = CURRENT_YEAR()
): number | null {
  const birth = Number(m.birthYear);
  if (!Number.isFinite(birth) || birth < 1850 || birth > asOfYear) return null;
  if (/^living$/i.test(m.vitalStatus || "")) {
    return Math.max(0, asOfYear - birth);
  }
  if (/^deceased$/i.test(m.vitalStatus || "")) {
    const death = Number(m.deathYear);
    if (!Number.isFinite(death) || death < birth || death > asOfYear) return null;
    return Math.max(0, death - birth);
  }
  return null;
}

export function isParentRelative(rel: string) {
  return /^(mother|father|motina|tėvas)$/i.test(rel);
}

export function isFirstDegreeRelative(rel: string) {
  return /^(mother|father|sister|brother|motina|tėvas|sesuo|brolis)$/i.test(rel);
}

/** Map family-history condition labels to digital-twin category ids. */
export function familyConditionCategoryIds(condition: string): string[] {
  const c = condition.toLowerCase();
  const ids = new Set<string>();
  if (
    /heart|coronary|myocardial|infarct|stroke|tia|blood pressure|hypertension|arrhythmia|cardiac|cholesterol|athero|peripheral artery/.test(
      c
    )
  ) {
    ids.add("cardiovascular");
  }
  if (
    /cancer|tumor|tumour|oncolog|breast|ovarian|prostate|colon|melanoma|leukemia|lymphoma/.test(
      c
    )
  ) {
    ids.add("oncology");
  }
  if (
    /diabetes|prediabetes|insulin|obesity|metabolic|gout|lipid|dyslipidemia|hypercholesterol/.test(
      c
    )
  ) {
    ids.add("metabolic");
  }
  if (/thyroid|graves|hormonal|endocrine|polycystic|pcos/.test(c)) {
    ids.add("hormones_men");
    ids.add("hormones_women");
  }
  if (
    /alzheimer|parkinson|migraine|epilepsy|neuro|ms\b|multiple sclerosis|depression|anxiety|bipolar|psychiatr|mental|cognitive/.test(
      c
    )
  ) {
    ids.add("mental");
  }
  if (/arthritis|autoimmune|lupus|rheumat|inflammation|allergy/.test(c)) {
    ids.add("immune");
  }
  return [...ids];
}

const COLOUR_RANK: RiskColour[] = [
  "grey",
  "green",
  "badge",
  "yellow",
  "orange",
  "red",
];

function bumpColour(c: RiskColour, steps = 1): RiskColour {
  const i = COLOUR_RANK.indexOf(c);
  if (i < 0) return c;
  // Family history can raise attention, but not force critical red alone
  const next = Math.min(COLOUR_RANK.indexOf("orange"), i + steps);
  return COLOUR_RANK[Math.max(i, next)]!;
}

/** Category ids that have a family-disease signal worth elevating. */
export function familyHistoryCategorySignals(
  members: FamilyMember[]
): Map<string, { firstDegree: boolean; labels: string[] }> {
  const map = new Map<string, { firstDegree: boolean; labels: string[] }>();
  for (const m of members) {
    const first = isFirstDegreeRelative(m.relative || "");
    for (const cond of m.conditions || []) {
      for (const catId of familyConditionCategoryIds(cond)) {
        const cur = map.get(catId) || { firstDegree: false, labels: [] };
        cur.firstDegree = cur.firstDegree || first;
        if (!cur.labels.includes(cond)) cur.labels.push(cond);
        map.set(catId, cur);
      }
    }
  }
  return map;
}

export function applyFamilyHistoryColour(
  categoryId: string,
  colour: RiskColour,
  signals: Map<string, { firstDegree: boolean; labels: string[] }>
): RiskColour {
  const hit = signals.get(categoryId);
  if (!hit) return colour;
  // First-degree disease history: +1 step (cap orange). Second-degree: only if still green/grey.
  if (hit.firstDegree) return bumpColour(colour, 1);
  if (colour === "green" || colour === "grey" || colour === "badge") {
    return bumpColour(colour, 1);
  }
  return colour;
}

export function formatFamilyMemberSummary(
  m: FamilyMember,
  locale: "lt" | "en"
): string {
  const rel = m.relative || (locale === "en" ? "Relative" : "Giminaitis");
  const age = familyMemberAgeYears(m);
  const status = /^deceased$/i.test(m.vitalStatus || "")
    ? locale === "en"
      ? "deceased"
      : "miręs"
    : /^living$/i.test(m.vitalStatus || "")
      ? locale === "en"
        ? "living"
        : "gyvas"
      : "";
  const ageBit =
    age != null
      ? locale === "en"
        ? /^deceased$/i.test(m.vitalStatus || "")
          ? `age at death ${age}`
          : `age ${age}`
        : /^deceased$/i.test(m.vitalStatus || "")
          ? `mirties amžius ${age}`
          : `amžius ${age}`
      : "";
  const conds = (m.conditions || []).join(", ");
  const parts = [rel];
  if (status || ageBit) {
    parts.push([status, ageBit].filter(Boolean).join(", "));
  }
  if (conds) parts.push(conds);
  return parts.join(" — ");
}
