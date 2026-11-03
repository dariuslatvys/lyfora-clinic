import { eq, and } from "drizzle-orm";
import { ensureSchema, getDb } from "@/lib/db";
import { questionnaire } from "@/lib/db/schema";
import { loadDigitalTwin } from "@/lib/health/load-twin";
import {
  parseStoredAnswers,
  questionnaireStorageKey,
} from "@/lib/health/questionnaire";
import { todayIsoDate } from "@/lib/health/demo-visits";
import { t, type Locale } from "@/lib/i18n/dictionary";
import type { RiskColour } from "@/lib/health/colours";
import type {
  DeathClockAlgorithmRule,
  DeathClockCause,
  DeathClockDriver,
  DeathClockPayload,
  DeathClockRecommendation,
} from "@/lib/health/death-clock-shared";
import {
  clampLifeWeeks,
  projectFromWeeks,
} from "@/lib/health/death-clock-shared";

export type {
  DeathClockCause,
  DeathClockDriver,
  DeathClockPayload,
  DeathClockRecommendation,
  DeathClockUnit,
} from "@/lib/health/death-clock-shared";
export { remainingInUnit } from "@/lib/health/death-clock-shared";

/** Oliver Burkeman framing: ~4000 weeks in an average life. */
export const BASE_LIFE_WEEKS = 4000;
const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000; // used for age fallback birth estimate

const ALGORITHM_RULES: DeathClockAlgorithmRule[] = [
  {
    id: "base",
    titleLt: "Bazė — 4000 savaičių",
    titleEn: "Baseline — 4000 weeks",
    bodyLt:
      "Pradedame nuo ~4000 savaičių (Oliver Burkeman modelis) kaip vidutinės gyvenimo trukmės iliustracijos. Tai ne demografijos lentelė — tai skaidrus atskaitos taškas.",
    bodyEn:
      "We start from ~4000 weeks (Oliver Burkeman framing) as an illustrative average lifespan. Not a demographic life table — a transparent baseline.",
  },
  {
    id: "sex",
    titleLt: "Lytis",
    titleEn: "Sex",
    bodyLt:
      "Moterims +80 sav., vyrams −40 sav. — populiacinis skirtumas, ne asmeninė prognozė.",
    bodyEn:
      "Female +80 weeks, male −40 weeks — a population offset, not a personal forecast.",
  },
  {
    id: "colours",
    titleLt: "Skaitmeninio dvynio spalvos",
    titleEn: "Digital-twin colours",
    bodyLt:
      "Kategorijų spalvos: žalia +4, geltona −12, oranžinė −28, raudona −55, genetinis žymuo −8 sav. už kiekvieną sritį.",
    bodyEn:
      "Category colours: green +4, yellow −12, orange −28, red −55, genetic badge −8 weeks per area.",
  },
  {
    id: "nks",
    titleLt: "NKS / VCF DNR pokyčiai",
    titleEn: "NGS / VCF DNA changes",
    bodyLt:
      "Reti NKS radiniai (pvz. MYBPC3, PALB2, MSH2) −60…−120 sav. — stipresnis signalas nei SNP panelė.",
    bodyEn:
      "Rare NGS findings (e.g. MYBPC3, PALB2, MSH2) −60…−120 weeks — stronger than the SNP panel load.",
  },
  {
    id: "snp",
    titleLt: "Bazinis SNP tyrimas (rizikos aleliai)",
    titleEn: "Basic SNP test (risk alleles)",
    bodyLt:
      "Skaičiuojame, kiek SNP žymenų turi rizikos alelį: viena kopija (heterozigota) = 0,4 taško, abi kopijos (homozigota) = 1 taškas. Suma × −4 sav. (riba −140). Tai ne diagnozė — tik bendras polinkių „svoris“ iš SNP panelės.",
    bodyEn:
      "We count how many SNP markers carry a risk allele: one copy (heterozygous) = 0.4 points, both copies (homozygous) = 1 point. Sum × −4 weeks (cap −140). Not a diagnosis — just the combined predisposition weight from the SNP panel.",
  },
  {
    id: "labs",
    titleLt: "Žymenys ir tendencijos",
    titleEn: "Markers and trends",
    bodyLt:
      "LDL virš 3 mmol/L, spaudimas ≥140, VO₂max, HRV ir istorinės tendencijos (LDL, gliukozė, eGFR) prideda arba atima savaites.",
    bodyEn:
      "LDL above 3 mmol/L, BP ≥140, VO₂max, HRV and history trends (LDL, glucose, eGFR) add or subtract weeks.",
  },
  {
    id: "lifestyle",
    titleLt: "Klausimynas (gyvensena)",
    titleEn: "Questionnaire (lifestyle)",
    bodyLt:
      "Rūkymas −220 / nerūkymas +25; gausus alkoholis −90; aktyvumas +55 / mažas −40; miegas 7–9 h +20 / trumpas −35; šeimos anamnezė (širdis/onkologija) −70.",
    bodyEn:
      "Smoking −220 / non-smoker +25; heavy alcohol −90; activity +55 / low −40; sleep 7–9 h +20 / short −35; family history (heart/oncology) −70.",
  },
  {
    id: "recs",
    titleLt: "Rekomendacijos (gyvensena, mityba, stebėsena)",
    titleEn: "Recommendations (lifestyle, diet, monitoring)",
    bodyLt:
      "Pažymėtos rekomendacijos prideda savaites prie dabartinio įverčio (pvz. Viduržemio mityba, druska, žingsniai, miegas, alkoholis, lipidai). Jos veikia ir tada, kai bazėje nėra „raudonos“ baudos — modeliuoja papildomą prevencinį efektą.",
    bodyEn:
      "Checked recommendations add weeks to the current estimate (e.g. Mediterranean diet, salt, steps, sleep, alcohol, lipids). They apply even without a red baseline penalty — modelling extra prevention.",
  },
  {
    id: "clamp",
    titleLt: "Ribos",
    titleEn: "Bounds",
    bodyLt:
      "Galutinė trukmė apribojama 2200–5200 sav., kad demo suaugusiems liktų teigiama likusi trukmė.",
    bodyEn:
      "Final span is clamped to 2200–5200 weeks so demo adults keep a positive remaining span.",
  },
];

const COLOUR_WEEK_HIT: Record<RiskColour, number> = {
  grey: 0,
  green: 4,
  badge: -8,
  yellow: -12,
  orange: -28,
  red: -55,
};

function ageFromDob(dob: string | null, asOfIso: string): number | null {
  if (!dob) return null;
  const d = new Date(`${dob}T12:00:00`);
  const now = new Date(`${asOfIso}T12:00:00`);
  if (Number.isNaN(d.getTime()) || Number.isNaN(now.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function latestMarker(
  markers: Array<{
    markerKey: string;
    value: number | null;
    unit: string | null;
    flag: string | null;
    observedAt: string;
  }>,
  key: string
) {
  const rows = markers
    .filter((m) => m.markerKey === key)
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
  return rows[0] || null;
}

function historyTrendDelta(
  markers: Array<{
    markerKey: string;
    value: number | null;
    observedAt: string;
  }>,
  key: string,
  higherIsWorse: boolean
): number {
  const rows = markers
    .filter((m) => m.markerKey === key && m.value != null)
    .sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  if (rows.length < 2) return 0;
  const first = rows[0]!.value as number;
  const last = rows[rows.length - 1]!.value as number;
  const delta = last - first;
  if (Math.abs(delta) < 1e-6) return 0;
  const worse = higherIsWorse ? delta > 0 : delta < 0;
  return worse ? -18 : 10;
}

function parseBpSystolic(unit: string | null, value: number | null): number | null {
  if (unit && /\d+\s*\/\s*\d+/.test(unit)) {
    const m = unit.match(/(\d+)\s*\/\s*\d+/);
    if (m) return Number(m[1]);
  }
  if (value != null && value > 60) return value;
  return null;
}

export function loadDeathClock(
  patientId: string,
  locale: Locale,
  patientName: string
): DeathClockPayload | null {
  ensureSchema();
  const twin = loadDigitalTwin(patientId, locale);
  if (!twin) return null;

  const db = getDb();
  const key = questionnaireStorageKey();
  const row = db
    .select()
    .from(questionnaire)
    .where(
      and(eq(questionnaire.patientId, patientId), eq(questionnaire.key, key))
    )
    .get();
  const answers = parseStoredAnswers(row?.value);
  const v = answers as Record<string, unknown>;

  const asOf = todayIsoDate();
  const dob = twin.patient.dob;
  const age = ageFromDob(dob, asOf);
  const sex = twin.patient.sex as "male" | "female";
  const drivers: DeathClockDriver[] = [];
  let delta = 0;

  // Sex baseline (population tables, illustrative)
  if (sex === "female") {
    delta += 80;
    drivers.push({
      id: "sex",
      labelLt: "Lytis (moteris) — ilgesnė vidutinė trukmė",
      labelEn: "Sex (female) — longer average expectancy",
      deltaWeeks: 80,
      kind: "protect",
    });
  } else {
    delta -= 40;
    drivers.push({
      id: "sex",
      labelLt: "Lytis (vyras) — trumpesnė vidutinė trukmė",
      labelEn: "Sex (male) — shorter average expectancy",
      deltaWeeks: -40,
      kind: "risk",
    });
  }

  const labels = t(locale);
  // Digital-twin category colours
  for (const c of twin.categories) {
    const hit = COLOUR_WEEK_HIT[c.colour as RiskColour] || 0;
    if (!hit) continue;
    delta += hit;
    const title = labels.categoryNames[c.id] || c.id;
    const colourLabel = labels.colourLabels[c.colour as RiskColour] || c.colour;
    drivers.push({
      id: `cat-${c.id}`,
      labelLt: `${title} · ${colourLabel}`,
      labelEn: `${title} · ${colourLabel}`,
      deltaWeeks: hit,
      kind: hit < 0 ? "risk" : "protect",
    });
  }

  // Rare NGS findings
  const rare = twin.categories.flatMap((c) => c.rare || []);
  const rareGenes = [...new Set(rare.map((r) => r.gene))];
  for (const gene of rareGenes) {
    const hit =
      gene === "MYBPC3" || gene === "MSH2" || gene === "PALB2" ? -120 : -60;
    delta += hit;
    drivers.push({
      id: `rare-${gene}`,
      labelLt: `NKS / VCF: ${gene}`,
      labelEn: `NGS / VCF: ${gene}`,
      deltaWeeks: hit,
      kind: "risk",
    });
  }

  // SNP risk allele load (orange/red matches)
  let snpRisk = 0;
  for (const c of twin.categories) {
    for (const s of c.snps || []) {
      if (s.matchCount >= 2) snpRisk += 1;
      else if (s.matchCount === 1) snpRisk += 0.4;
    }
  }
  if (snpRisk > 0) {
    const hit = -Math.min(140, Math.round(snpRisk * 4));
    delta += hit;
    drivers.push({
      id: "snp-load",
      labelLt: `SNP rizikos alelių apkrova (~${snpRisk.toFixed(1)})`,
      labelEn: `SNP risk-allele load (~${snpRisk.toFixed(1)})`,
      deltaWeeks: hit,
      kind: "risk",
    });
  }

  const markers = twin.markers;
  const ldl = latestMarker(markers, "LDL");
  if (ldl?.value != null && ldl.value > 3) {
    const hit = -Math.round((ldl.value - 3) * 35);
    delta += hit;
    drivers.push({
      id: "ldl",
      labelLt: `LDL ${ldl.value} (istorija + dabartis)`,
      labelEn: `LDL ${ldl.value} (history + current)`,
      deltaWeeks: hit,
      kind: "risk",
    });
  }
  delta += historyTrendDelta(markers, "LDL", true);
  delta += historyTrendDelta(markers, "GLUCOSE", true);
  delta += historyTrendDelta(markers, "eGFR", false);

  const bp = latestMarker(markers, "BLOOD_PRESSURE");
  const sys = parseBpSystolic(bp?.unit ?? null, bp?.value ?? null);
  if (sys != null && sys >= 140) {
    const hit = -50;
    delta += hit;
    drivers.push({
      id: "bp",
      labelLt: `Kraujo spaudimas ~${sys} mmHg`,
      labelEn: `Blood pressure ~${sys} mmHg`,
      deltaWeeks: hit,
      kind: "risk",
    });
  } else if (sys != null && sys < 120) {
    delta += 15;
    drivers.push({
      id: "bp",
      labelLt: `Kraujo spaudimas ~${sys} mmHg`,
      labelEn: `Blood pressure ~${sys} mmHg`,
      deltaWeeks: 15,
      kind: "protect",
    });
  }

  const vo2 = latestMarker(markers, "VO2MAX");
  if (vo2?.value != null) {
    const hit = vo2.value >= 40 ? 35 : vo2.value >= 32 ? 10 : -40;
    delta += hit;
    drivers.push({
      id: "vo2",
      labelLt: `VO₂max ${vo2.value}`,
      labelEn: `VO₂max ${vo2.value}`,
      deltaWeeks: hit,
      kind: hit >= 0 ? "protect" : "risk",
    });
  }

  const hrv = latestMarker(markers, "HRV");
  if (hrv?.value != null) {
    const hit = hrv.value >= 50 ? 20 : hrv.value >= 35 ? 0 : -30;
    if (hit) {
      delta += hit;
      drivers.push({
        id: "hrv",
        labelLt: `HRV ${hrv.value} ms`,
        labelEn: `HRV ${hrv.value} ms`,
        deltaWeeks: hit,
        kind: hit >= 0 ? "protect" : "risk",
      });
    }
  }

  // Lifestyle from questionnaire
  const smoke = String(
    v["7_lifestyle__do_you_smoke_or_use_nicotine_products"] || ""
  ).toLowerCase();
  if (/yes|taip|daily|kasdien|smoke/.test(smoke)) {
    delta -= 220;
    drivers.push({
      id: "smoke",
      labelLt: "Rūkymas / nikotinas (klausimynas)",
      labelEn: "Smoking / nicotine (questionnaire)",
      deltaWeeks: -220,
      kind: "risk",
    });
  } else if (smoke) {
    delta += 25;
    drivers.push({
      id: "smoke",
      labelLt: "Nerūko (klausimynas)",
      labelEn: "Non-smoker (questionnaire)",
      deltaWeeks: 25,
      kind: "protect",
    });
  }

  const alcohol = String(v["7_lifestyle__alcohol_consumption"] || "").toLowerCase();
  if (/daily|heavy|gaus|kasdien|frequent/.test(alcohol)) {
    delta -= 90;
    drivers.push({
      id: "alcohol",
      labelLt: "Alkoholio vartojimas (klausimynas)",
      labelEn: "Alcohol use (questionnaire)",
      deltaWeeks: -90,
      kind: "risk",
    });
  }

  const exercise = String(v["7_lifestyle__exercise_frequency"] || "").toLowerCase();
  if (/3|4|5|daily|kasdien|regular|reguliar/.test(exercise)) {
    delta += 55;
    drivers.push({
      id: "exercise",
      labelLt: "Fizinis aktyvumas (klausimynas)",
      labelEn: "Physical activity (questionnaire)",
      deltaWeeks: 55,
      kind: "protect",
    });
  } else if (/rarely|never|niekada|retai|0/.test(exercise)) {
    delta -= 40;
    drivers.push({
      id: "exercise",
      labelLt: "Mažas aktyvumas (klausimynas)",
      labelEn: "Low activity (questionnaire)",
      deltaWeeks: -40,
      kind: "risk",
    });
  }

  const sleep = String(v["7_lifestyle__average_sleep_duration"] || "");
  if (/< ?5|4–5|4-5|under 5/.test(sleep)) {
    delta -= 35;
    drivers.push({
      id: "sleep",
      labelLt: "Trumpas miegas (klausimynas)",
      labelEn: "Short sleep (questionnaire)",
      deltaWeeks: -35,
      kind: "risk",
    });
  } else if (/7|8|9/.test(sleep)) {
    delta += 20;
    drivers.push({
      id: "sleep",
      labelLt: "Pakankamas miegas (klausimynas)",
      labelEn: "Adequate sleep (questionnaire)",
      deltaWeeks: 20,
      kind: "protect",
    });
  }

  // Family history
  const familyBlock = (v["10_family_history"] || {}) as {
    familyMembers?: Array<{
      conditions?: string[];
      relation?: string;
    }>;
  };
  const familyConds = (familyBlock.familyMembers || []).flatMap(
    (m) => m.conditions || []
  );
  const familyText = familyConds.join(" ").toLowerCase();
  if (/cancer|vėž|oncolog|heart|šird|infarkt|stroke|insult/.test(familyText)) {
    delta -= 70;
    drivers.push({
      id: "family",
      labelLt: "Šeimos anamnezė (širdis / onkologija)",
      labelEn: "Family history (heart / oncology)",
      deltaWeeks: -70,
      kind: "risk",
    });
  }

  // Clamp adjusted life so remaining stays positive for demo adults
  const lifeWeeks = clampLifeWeeks(BASE_LIFE_WEEKS + delta);

  const birthMs = dob
    ? new Date(`${dob}T12:00:00`).getTime()
    : Date.now() - (age ?? 45) * MS_PER_YEAR;
  const projection = projectFromWeeks(birthMs, lifeWeeks);
  const builtAtMs = Date.now();
  const remainingMsAtBuild = Math.max(0, projection.projectedDeathMs - builtAtMs);

  const recommendations: DeathClockRecommendation[] = [];
  const driverById = new Map(drivers.map((d) => [d.id, d]));

  const pushRec = (rec: DeathClockRecommendation) => {
    if (recommendations.some((r) => r.id === rec.id)) return;
    recommendations.push(rec);
  };

  const smokeDriver = driverById.get("smoke");
  if (smokeDriver?.kind === "risk") {
    pushRec({
      id: "quit-smoke",
      labelLt: "Mesti rūkyti / atsisakyti nikotino",
      labelEn: "Quit smoking / nicotine",
      detailLt:
        "Nutraukite rūkymą ar nikotino produktus. Modelis grąžina didžiąją dalį rūkymo baudos.",
      detailEn:
        "Stop smoking or nicotine products. The model restores most of the smoking penalty.",
      gainWeeks: Math.min(200, Math.abs(smokeDriver.deltaWeeks)),
      category: "lifestyle",
    });
  } else {
    pushRec({
      id: "stay-smoke-free",
      labelLt: "Išlikti be nikotino (įskaitant vapingą)",
      labelEn: "Stay nicotine-free (including vaping)",
      detailLt:
        "Net jei dabar nerūkote — jokio grįžimo prie cigarečių, snuso ar e-cigarečių.",
      detailEn:
        "Even if you do not smoke now — no return to cigarettes, snus or e-cigarettes.",
      gainWeeks: 30,
      category: "lifestyle",
    });
  }

  const alcoholDriver = driverById.get("alcohol");
  pushRec({
    id: "cut-alcohol",
    labelLt: "Alkoholis — ne daugiau kaip 1–2 dozės / savaitę",
    labelEn: "Alcohol — at most 1–2 drinks per week",
    detailLt:
      "Sumažinkite savaitinį alkoholį arba laikykite „be alkoholio“ savaites. Tai veikia kraujospūdį, miegą ir kepenis.",
    detailEn:
      "Cut weekly alcohol or keep alcohol-free weeks. Helps blood pressure, sleep and liver.",
    gainWeeks:
      alcoholDriver?.kind === "risk" ? Math.abs(alcoholDriver.deltaWeeks) : 40,
    category: "lifestyle",
  });

  const exerciseDriver = driverById.get("exercise");
  pushRec({
    id: "exercise-3x",
    labelLt: "Fizinis aktyvumas ≥150 min. / savaitę",
    labelEn: "Physical activity ≥150 min / week",
    detailLt:
      "Vidutinio intensyvumo judėjimas (ėjimas, dviratis, plaukimas) + 2 jėgos treniruotės.",
    detailEn:
      "Moderate movement (walking, bike, swim) plus 2 strength sessions.",
    gainWeeks: exerciseDriver?.kind === "risk" ? 95 : 55,
    category: "lifestyle",
  });

  pushRec({
    id: "daily-steps",
    labelLt: "≥8 000 žingsnių daugumą dienų",
    labelEn: "≥8,000 steps on most days",
    detailLt:
      "Kasdienis ėjimas mažina metabolinę ir širdies riziką — net jei jau sportuojate 2–3 k./sav.",
    detailEn:
      "Daily walking lowers metabolic and heart risk — even if you already train 2–3×/week.",
    gainWeeks: 35,
    category: "lifestyle",
  });

  pushRec({
    id: "strength-2x",
    labelLt: "Jėgos treniruotės 2× / savaitę",
    labelEn: "Strength training 2× / week",
    detailLt:
      "Didžiųjų raumenų grupių pratimai (kojos, nugaros, krūtinė) — raumenų masė siejama su ilgaamžiškumu.",
    detailEn:
      "Major muscle-group work (legs, back, chest) — muscle mass links to longevity.",
    gainWeeks: 28,
    category: "lifestyle",
  });

  const sleepDriver = driverById.get("sleep");
  pushRec({
    id: "sleep-7",
    labelLt: "Miegas 7–9 val. daugumą naktų",
    labelEn: "Sleep 7–9 hours most nights",
    detailLt:
      "Fiksuotas miego / kėlimosi laikas, mažiau ekranų vakare — širdis ir metabolizmas atsigauna.",
    detailEn:
      "Fixed sleep/wake times, fewer late screens — heart and metabolism recover.",
    gainWeeks: sleepDriver?.kind === "risk" ? 55 : 32,
    category: "lifestyle",
  });

  pushRec({
    id: "stress-routine",
    labelLt: "Kasdienė streso / atsigavimo rutina (10–15 min.)",
    labelEn: "Daily stress / recovery routine (10–15 min)",
    detailLt:
      "Kvėpavimas, meditacija ar ramus pasivaikščiojimas — gerina HRV ir kraujospūdį.",
    detailEn:
      "Breathing, meditation or a calm walk — improves HRV and blood pressure.",
    gainWeeks: driverById.get("hrv")?.kind === "risk" ? 45 : 25,
    category: "lifestyle",
  });

  // Diet / nutrition — always offered
  pushRec({
    id: "med-diet",
    labelLt: "Viduržemio tipo mityba (daržovės, žuvis, alyvuogių aliejus)",
    labelEn: "Mediterranean-style diet (veg, fish, olive oil)",
    detailLt:
      "Daugiau daržovių, ankštinių, riešutų, žuvies; mažiau raudonos / perdirbtos mėsos. Stiprus širdies ir onko prevencijos signalas.",
    detailEn:
      "More vegetables, legumes, nuts, fish; less red / processed meat. Strong heart and cancer-prevention signal.",
    gainWeeks: 70,
    category: "lifestyle",
  });

  pushRec({
    id: "cut-ultra-processed",
    labelLt: "Mažiau ultraprocessuoto maisto ir cukraus gėrimų",
    labelEn: "Less ultra-processed food and sugary drinks",
    detailLt:
      "Saldūs gėrimai, greitas maistas, saldumynai — ne dažniau kaip retas malonumas.",
    detailEn:
      "Sugary drinks, fast food, sweets — keep as rare treats only.",
    gainWeeks: 45,
    category: "lifestyle",
  });

  pushRec({
    id: "fibre-30",
    labelLt: "Skaidulos ≥30 g / dieną",
    labelEn: "Fibre ≥30 g / day",
    detailLt:
      "Viso grūdo produktai, ankštinės, daržovės — palaiko lipidus, gliukozę ir žarnyno sveikatą.",
    detailEn:
      "Whole grains, legumes, vegetables — supports lipids, glucose and gut health.",
    gainWeeks: 30,
    category: "lifestyle",
  });

  pushRec({
    id: "salt-5g",
    labelLt: "Druska <5 g / dieną",
    labelEn: "Salt under 5 g / day",
    detailLt:
      "Mažiau sūdytų užkandžių ir gatavų patiekalų — tiesiogiai veikia kraujospūdį.",
    detailEn:
      "Fewer salty snacks and ready meals — directly affects blood pressure.",
    gainWeeks: driverById.get("bp")?.kind === "risk" ? 50 : 28,
    category: "lifestyle",
  });

  pushRec({
    id: "weight-stable",
    labelLt: "Kūno svoris ar juosmens apimtis link tikslo",
    labelEn: "Body weight or waist toward target",
    detailLt:
      "Jei antsvoris — −5–10 % svorio; jei norma — išlaikyti. Mažina spaudimą, lipidus ir diabeto riziką.",
    detailEn:
      "If overweight — lose 5–10%; if already in range — maintain. Lowers BP, lipids and diabetes risk.",
    gainWeeks: 50,
    category: "lifestyle",
  });

  const ldlDriver = driverById.get("ldl");
  pushRec({
    id: "lower-ldl",
    labelLt: "LDL / lipidų tikslas (mityba + gydytojo planas)",
    labelEn: "LDL / lipid target (diet + clinician plan)",
    detailLt:
      "Riebalų kokybė maiste, skaidulos; jei reikia — statinai ar kiti vaistai pagal indikacijas.",
    detailEn:
      "Fat quality and fibre in food; statin or other therapy if indicated.",
    gainWeeks: ldlDriver?.kind === "risk"
      ? Math.min(120, Math.abs(ldlDriver.deltaWeeks))
      : 40,
    category: "clinical",
  });

  const bpDriver = driverById.get("bp");
  pushRec({
    id: "control-bp",
    labelLt: "Kraujospūdis <130/80 namuose",
    labelEn: "Home blood pressure <130/80",
    detailLt:
      "Reguliarūs matavimai, druska, aktyvumas, vaistai jei paskirta.",
    detailEn:
      "Regular readings, salt, activity, medication if prescribed.",
    gainWeeks:
      bpDriver?.kind === "risk" ? Math.abs(bpDriver.deltaWeeks) + 20 : 35,
    category: "clinical",
  });

  const vo2Driver = driverById.get("vo2");
  pushRec({
    id: "raise-vo2",
    labelLt: "Kelti VO₂max (aerobinė ištvermė)",
    labelEn: "Raise VO₂max (cardio fitness)",
    detailLt:
      "1–2 intervalinės sesijos + ilgesni žingsniai / savaitę — net jei dabartinis VO₂max jau geras.",
    detailEn:
      "1–2 interval sessions plus longer walks weekly — even if current VO₂max is already good.",
    gainWeeks: vo2Driver?.kind === "risk" ? 75 : vo2Driver ? 22 : 40,
    category: "lifestyle",
  });

  const glucose = latestMarker(markers, "GLUCOSE");
  if (glucose?.value != null && glucose.value >= 5.6) {
    pushRec({
      id: "glucose-control",
      labelLt: "Gliukozės / HbA1c kontrolė (mityba + judėjimas)",
      labelEn: "Glucose / HbA1c control (diet + movement)",
      detailLt:
        "Mažiau greitųjų angliavandenių, daugiau judėjimo po valgio; aptarkite su gydytoju.",
      detailEn:
        "Fewer refined carbs, more post-meal movement; discuss with your clinician.",
      gainWeeks: 48,
      category: "clinical",
    });
  } else {
    pushRec({
      id: "glucose-steady",
      labelLt: "Stabilizuoti cukraus svyravimus (be saldžių gėrimų)",
      labelEn: "Steady glucose swings (no sugary drinks)",
      detailLt:
        "Baltymų / skaidulų pusryčiai, vaikščiojimas po pietų — prevencija metabolinei rizikai.",
      detailEn:
        "Protein/fibre breakfasts, walk after lunch — prevention for metabolic risk.",
      gainWeeks: 22,
      category: "lifestyle",
    });
  }

  if (rareGenes.length) {
    pushRec({
      id: "genetics-followup",
      labelLt: "Genetiko + specialisto kontrolė dėl NKS radinių",
      labelEn: "Genetics + specialist follow-up for NGS findings",
      detailLt:
        "Užsisakykite genetiko konsultaciją ir šeimos / organų patikrą pagal radinį (pvz. Echo, onko-prevencija).",
      detailEn:
        "Book a genetics consult and organ / family screening matched to the finding (e.g. Echo, cancer prevention).",
      gainWeeks: 40,
      category: "monitoring",
    });
  }

  if (driverById.get("family")?.kind === "risk") {
    pushRec({
      id: "family-screening",
      labelLt: "Šeimos rizikos prevencinis planas",
      labelEn: "Family-risk prevention plan",
      detailLt:
        "Su šeimos gydytoju sudarykite ankstyvos patikros grafiką pagal šeimos anamnezę.",
      detailEn:
        "Agree an earlier screening schedule with your GP based on family history.",
      gainWeeks: 35,
      category: "monitoring",
    });
  }

  const cardioHot =
    twin.categories.find((c) => c.id === "cardiovascular")?.colour === "red" ||
    twin.categories.find((c) => c.id === "cardiovascular")?.colour ===
      "orange";
  const metaHot =
    twin.categories.find((c) => c.id === "metabolic")?.colour === "red" ||
    twin.categories.find((c) => c.id === "metabolic")?.colour === "orange";

  pushRec({
    id: "cardio-labs",
    labelLt: "Pakartoti lipidų / širdies žymenų panelę",
    labelEn: "Repeat lipid / heart marker panel",
    detailLt:
      "Kas 3–6 mėn. lipidai, gliukozė, kraujospūdis — kad modelis ir gydymas remtųsi šviežiais duomenimis.",
    detailEn:
      "Every 3–6 months: lipids, glucose, blood pressure — so the model and care use fresh data.",
    gainWeeks: cardioHot || metaHot ? 28 : 18,
    category: "monitoring",
  });

  pushRec({
    id: "annual-check",
    labelLt: "Metinė profilaktinė apžiūra + skiepai pagal amžių",
    labelEn: "Annual check-up + age-appropriate vaccines",
    detailLt:
      "Šeimos gydytojo vizitas, vėžio atranka pagal amžių, gripas / kitos vakcinos.",
    detailEn:
      "GP visit, age-based cancer screening, flu / other vaccines.",
    gainWeeks: 20,
    category: "monitoring",
  });

  recommendations.sort((a, b) => b.gainWeeks - a.gainWeeks);

  const causes: DeathClockCause[] = [];
  const cardio = twin.categories.find((c) => c.id === "cardiovascular");
  const onco = twin.categories.find((c) => c.id === "oncology");
  const meta = twin.categories.find((c) => c.id === "metabolic");
  if (cardio && (cardio.colour === "red" || cardio.colour === "orange")) {
    causes.push({
      id: "cvd",
      labelLt: "Širdies ir kraujagyslių ligos",
      labelEn: "Cardiovascular disease",
      weight: cardio.colour === "red" ? 0.38 : 0.28,
      noteLt: "Pagal skaitmeninio dvynio signalus, lipidus, spaudimą ir genetikos radinius.",
      noteEn: "From digital-twin signals, lipids, blood pressure and genetic findings.",
    });
  }
  if (onco && (onco.colour === "red" || onco.colour === "orange" || rareGenes.length)) {
    causes.push({
      id: "cancer",
      labelLt: "Onkologinės ligos",
      labelEn: "Cancer",
      weight: onco?.colour === "red" ? 0.32 : 0.22,
      noteLt: "NKS / šeimos anamnezė ir onkologijos kategorijos spalva.",
      noteEn: "NGS / family history and oncology category colour.",
    });
  }
  if (meta && (meta.colour === "orange" || meta.colour === "red")) {
    causes.push({
      id: "metab",
      labelLt: "Metabolinės ligos (diabetas, lipidai)",
      labelEn: "Metabolic disease (diabetes, lipids)",
      weight: 0.18,
      noteLt: "Gliukozė, lipidai ir metabolinės srities signalai.",
      noteEn: "Glucose, lipids and metabolic-area signals.",
    });
  }
  causes.push({
    id: "other",
    labelLt: "Kitos priežastys / senėjimas",
    labelEn: "Other causes / ageing",
    weight: Math.max(
      0.12,
      1 - causes.reduce((s, c) => s + c.weight, 0)
    ),
    noteLt: "Bazinis 4000 savaičių modelis ir likę populiaciniai veiksniai.",
    noteEn: "Baseline 4000-week model and residual population factors.",
  });
  const causeSum = causes.reduce((s, c) => s + c.weight, 0) || 1;
  for (const c of causes) c.weight = Math.round((c.weight / causeSum) * 100) / 100;

  // Prefer strongest drivers in UI
  drivers.sort((a, b) => Math.abs(b.deltaWeeks) - Math.abs(a.deltaWeeks));

  return {
    locale,
    patientName,
    sex,
    dob,
    ageYears: age,
    baseLifeWeeks: BASE_LIFE_WEEKS,
    adjustedLifeWeeks: projection.adjustedLifeWeeks,
    expectancyYears: projection.expectancyYears,
    projectedDeathIso: projection.projectedDeathIso,
    projectedDeathMs: projection.projectedDeathMs,
    remainingMsAtBuild,
    builtAtMs,
    birthMs,
    causes,
    drivers: drivers.slice(0, 12),
    recommendations: recommendations.slice(0, 16),
    algorithmRules: ALGORITHM_RULES,
    disclaimerLt:
      "Tai iliustratyvus modelis pagal jūsų Lyfora duomenis (žymenys, genetika, klausimynas, fiziniai rodikliai). Tai nėra medicininė prognozė ar diagnozė.",
    disclaimerEn:
      "An illustrative model from your Lyfora data (markers, genetics, questionnaire, physical metrics). Not a medical prognosis or diagnosis.",
  };
}

