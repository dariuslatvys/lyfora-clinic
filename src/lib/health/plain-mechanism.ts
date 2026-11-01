/**
 * Turns technical Mechanism notes into plain Lithuanian / English
 * that a non-clinician can understand.
 */

import { pharmaPersonalMeaning } from "./pharma-plain";

const LT_TERMS: [RegExp, string][] = [
  // Drug names for pharmacogenetics are explained in pharmaPersonalMeaning
  // and in curated LT mechanism texts — avoid auto-expanding them here.
  [/\bSHBG\b/g, "SHBG (baltymas, kuris kraujyje „suriša“ hormonus, pvz. testosteroną)"],
  [/\bandrogen(?:ų|ams|ai|as|ą)?(?=[^a-ząčęėįšųūž]|$)/gi, "vyriškųjų hormonų (androgenų)"],
  [/\btestosterono\b/gi, "testosterono (pagrindinio vyriškojo hormono)"],
  [/\bApoE\b/g, "ApoE (baltymas, padedantis pernešti cholesterolį)"],
  [/\bAPOE\b/g, "APOE (cholesterolio pernešimo genas)"],
  [/\bLDL-C\b/g, "„blogojo“ cholesterolio (LDL)"],
  [/\bLDL\b/g, "„blogojo“ cholesterolio (LDL)"],
  [/\bHDL\b/g, "„gerojo“ cholesterolio (HDL)"],
  [/\bApoB\b/g, "ApoB (žymuo, rodantis, kiek kraujyje yra cholesterolį nešančių dalelių)"],
  [/\bLp\(a\)\b/g, "Lp(a) (paveldėtina cholesterolio dalelių rūšis)"],
  [/\bhomocisteino\b/gi, "homocisteino (aminorūgšties, kurios perteklius siejamas su kraujagyslių rizika)"],
  [/\bhomocisteinas\b/gi, "homocisteinas (aminorūgštis, kurios perteklius siejamas su kraujagyslių rizika)"],
  [/\bMTHFR\b/g, "MTHFR (fermentas, padedantis įsisavinti folio rūgštį / B9 vitaminą)"],
  [/\bfolio rūgšties\b/gi, "folio rūgšties (vitamino B9)"],
  [/\bmetilinimu\b/gi, "metilinimu (ląstelių „chemijos“ procesu, kuriam reikia B vitaminų)"],
  [/\binsulino\b/gi, "insulino (hormono, kuris reguliuoja cukraus kiekį kraujyje)"],
  [/\binkretino\b/gi, "inkretino (žarnyno hormonų, padedančių kasai išskirti insuliną)"],
  [/kasos β-ląstelių|kasos beta-ląstelių|β-ląstelių/gi, "kasos ląstelių, gaminančių insuliną"],
  [/\bTCF7L2\b/g, "TCF7L2 (genas, susijęs su cukraus apykaita)"],
  [/\b2 tipo cukrinio diabeto\b/gi, "2 tipo cukrinio diabeto (cukraus ligos, kuri dažniausiai atsiranda vėliau gyvenime)"],
  [/\bdopaminą\b/gi, "dopaminą (smegenų signalinę medžiagą, susijusią su nuotaika ir dėmesiu)"],
  [/\bkatecholamin(?:ų|ams|ai|us|ais|ą)?(?=[^a-ząčęėįšųūž]|$)/gi, "streso hormonus (katecholaminus)"],
  [/\bCOMT\b/g, "COMT (fermentas, padedantis skaidyti streso ir nuotaikos signalines medžiagas)"],
  [/\bANRIL\b/g, "ANRIL (ilgos DNR srities reguliacinį signalą)"],
  [/kraujagyslių lygiųjų raumenų ląstelių dauginimąsi/gi, "kraujagyslių sienelės ląstelių dauginimąsi (tai susiję su arterijų „sukietėjimu“)"],
  [/aterosklerozinių plokštelių formavimusi/gi, "riebalinių plokštelių kaupimusi arterijose"],
  [/vainikinių arterijų ligos riziką/gi, "širdies arterijų ligos riziką"],
  [/lipoproteinų apykaita/gi, "riebalų ir cholesterolio apykaita kraujyje"],
  [/cirkuliuojančio\s+/gi, "kraujyje cirkuliuojančio "],
  [/reguliacinėje srityje/gi, "geno „jungiklio“ srityje"],
  [/reguliacinį aktyvumą/gi, "kaip genas įsijungia ir išsijungia"],
  [/izoformą/gi, "baltymo formą"],
];

const EN_TERMS: [RegExp, string][] = [
  [/\bSHBG\b/g, "SHBG (a blood protein that binds hormones such as testosterone)"],
  [/\bandrogen(?:s)?\b/gi, "male hormones (androgens)"],
  [/\btestosterone\b/gi, "testosterone (the main male hormone)"],
  [/\bApoE\b/g, "ApoE (a protein that helps carry cholesterol)"],
  [/\bLDL-C\b/g, "LDL (“bad”) cholesterol"],
  [/\bApoB\b/g, "ApoB (a marker of cholesterol-carrying particles)"],
  [/\bhomocysteine\b/gi, "homocysteine (an amino acid linked with vessel risk when high)"],
  [/\bMTHFR\b/g, "MTHFR (an enzyme that helps the body use folate / vitamin B9)"],
  [/\binsulin\b/gi, "insulin (the hormone that controls blood sugar)"],
  [/\bdopamine\b/gi, "dopamine (a brain signalling chemical linked with mood and focus)"],
  [/\bcatecholamines\b/gi, "stress hormones (catecholamines)"],
];

function stripStrandNote(text: string): string {
  return text
    .replace(/\s*\((?:neigiama|priešinga) grandinė\s*[–-]\s*[A-Z]\)\s*/gi, " ")
    .replace(/\s*\(negative strand\s*[–-]\s*[A-Z]\)\s*/gi, " ")
    .replace(/\s*\(G on the opposite strand\)\s*/gi, " ")
    .replace(/\s*\(A on the opposite strand\)\s*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applyGlossary(text: string, terms: [RegExp, string][]): string {
  const slots: string[] = [];
  let out = text;
  const used = new Set<string>();
  for (const [re, replacement] of terms) {
    out = out.replace(re, (match) => {
      const key = match.toLowerCase();
      // Expand first hit fully; later hits keep the short original form
      if (used.has(key)) return match;
      used.add(key);
      const id = slots.length;
      // Placeholder so later glossary rules cannot re-expand inside this text
      slots.push(replacement.includes("(") ? replacement : replacement);
      return `\uE000${id}\uE001`;
    });
  }
  return out.replace(/\uE000(\d+)\uE001/g, (_, i) => slots[Number(i)]!);
}

function personalMeaningLt(
  raw: string,
  ctx?: { gene?: string | null; subcategory?: string | null }
): string {
  const pharma = pharmaPersonalMeaning(raw, "lt", ctx);
  if (pharma) return pharma;

  const t = `${ctx?.gene || ""} ${ctx?.subcategory || ""} ${raw}`.toLowerCase();
  if (/shbg|testosteron|androgen/.test(t)) {
    return "Ką tai gali reikšti jums: dalis testosterono kraujyje gali būti „surišta“ ir mažiau prieinama raumenims, kaulams, nuotaikai ir libido — todėl kai kuriems žmonėms svarbu stebėti hormonų tyrimus ir savijautą, o ne tik bendrą testosterono skaičių.";
  }
  if (/apoe|ldl|apob|cholesterol|ateroskler|vainikini|arterij/.test(t)) {
    return "Ką tai gali reikšti jums: jūsų organizmas gali linkti kaupti daugiau cholesterolio arterijų sienelėse. Tai nėra diagnozė, bet signalas stebėti lipidų tyrimus, kraujospūdį, mitybą ir judėjimą.";
  }
  if (/diabet|insulin|gliukoz|tcf7l2|β-ląst|beta-ląst/.test(t)) {
    return "Ką tai gali reikšti jums: cukraus apykaita gali būti jautresnė — verta stebėti gliukozę, HbA1c ir mitybos įpročius, ypač jei šeimoje yra cukrinis diabetas.";
  }
  if (/mthfr|folio|homocistein|b12|metilin/.test(t)) {
    return "Ką tai gali reikšti jums: organizmas gali prasčiau „įjungti“ folio rūgštį (B9). Praktikoje tai dažnai reiškia rūpintis B vitaminų statusu ir stebėti homocisteiną, jei gydytojas rekomenduoja.";
  }
  if (/comt|dopamin|katecholamin|stres|emocij|pažinimo/.test(t)) {
    return "Ką tai gali reikšti jums: streso ir nuotaikos chemija smegenyse gali veikti kiek kitaip — kai kam jautriau reaguoja į stresą ar kofeiną. Tai polinkis, ne diagnozė.";
  }
  if (/cdkn|anril|9p21|širdies arter|vainikinių/.test(t)) {
    return "Ką tai gali reikšti jums: šiek tiek didesnis polinkis į širdies arterijų problemas ilgainiui. Svarbiausia — stebėti cholesterolį, kraujospūdį, nerūkyti ir judėti.";
  }
  if (/uždegim|crp|imun/.test(t)) {
    return "Ką tai gali reikšti jums: uždegimo ar imuniteto reakcijos gali būti kiek jautresnės — verta stebėti savijautą ir susijusius kraujo žymenis, jei jie tiriami.";
  }
  return "Ką tai gali reikšti jums: tai genetinis polinkio signalas, o ne liga. Jis padeda suprasti, ką stebėti tyrimuose ir gyvenimo būde; sprendimus dėl gydymo priima tik gydytojas.";
}

function personalMeaningEn(
  raw: string,
  ctx?: { gene?: string | null; subcategory?: string | null }
): string {
  const pharma = pharmaPersonalMeaning(raw, "en", ctx);
  if (pharma) return pharma;

  const t = `${ctx?.gene || ""} ${ctx?.subcategory || ""} ${raw}`.toLowerCase();
  if (/shbg|testosterone|androgen/.test(t)) {
    return "What this may mean for you: more testosterone in blood may be “bound” and less available to tissues that need it (muscle, mood, libido). It is a reason to watch hormone labs with your clinician — not a diagnosis.";
  }
  if (/apoe|ldl|apob|cholesterol|atheroscler|coronary/.test(t)) {
    return "What this may mean for you: your body may tend to carry more cholesterol in the arteries over time. Watch lipid panels, blood pressure, diet and activity — this is a predisposition signal, not a disease label.";
  }
  if (/diabet|insulin|glucose|tcf7l2/.test(t)) {
    return "What this may mean for you: blood-sugar handling may be more sensitive. It is useful to monitor glucose / HbA1c and eating habits, especially with a family history of type 2 diabetes.";
  }
  if (/mthfr|folate|homocysteine/.test(t)) {
    return "What this may mean for you: your body may process folate (vitamin B9) less efficiently. In practice this often means checking B-vitamin status and, if advised, homocysteine.";
  }
  if (/comt|dopamine|catecholamine|stress|mood/.test(t)) {
    return "What this may mean for you: stress and mood chemistry in the brain may work a bit differently — some people feel more sensitive to stress or caffeine. Predisposition, not a diagnosis.";
  }
  return "What this may mean for you: this is a genetic predisposition signal, not a disease. Use it to guide what to watch in labs and lifestyle; treatment decisions belong with your clinician.";
}

export type MechanismContext = {
  gene?: string | null;
  subcategory?: string | null;
};

export function humanizeMechanism(
  raw: string | null | undefined,
  locale: "lt" | "en",
  ctx?: MechanismContext
): string {
  const source = (raw || "").trim();
  if (!source) {
    return locale === "en"
      ? "No plain-language explanation is available for this marker yet."
      : "Šiam žymeniu paprastas paaiškinimas dar nepateiktas.";
  }

  let body = stripStrandNote(source);
  // Drop leading rs id + allele stamp if present; we already show genotype elsewhere
  body = body.replace(
    /^rs\d+\s+[ACGT]\s+alelis\s+/i,
    "Šis rizikos alelis "
  );
  body = body.replace(
    /^rs\d+\s+[ACGT]\s+allele\s+/i,
    "This risk allele "
  );

  // Soften “activity score” jargon for patients
  if (locale === "lt") {
    body = body
      .replace(
        /bendro DPYD aktyvumo balo pagal abi geno kopijas/gi,
        "bendro abiejų geno kopijų įvertinimo (kiek gerai organizmas skaido tuos vaistus)"
      )
      .replace(
        /DPYD aktyvumo bal(?:o|u|ą)?/gi,
        "bendro genų įvertinimo, kiek gerai organizmas skaido tuos vaistus"
      )
      .replace(/klinikinės stebėsenos metu/gi, "gydytojui stebint savijautą ir tyrimus");
  } else {
    body = body.replace(
      /combined DPYD activity score from both gene copies/gi,
      "combined check of both gene copies (how well the body clears those medicines)"
    );
  }

  if (locale === "lt") {
    body = applyGlossary(body, LT_TERMS);
    body = body
      .replace(/\bsiejamas su\b/gi, "siejasi su")
      .replace(/\bgali veikti\b/gi, "gali turėti įtakos")
      .replace(/\bveikiant bendrą\b/gi, "ir taip veikia bendrą")
      .replace(/\bsunkaus toksiškumo riziką/gi, "sunkaus šalutinio poveikio riziką")
      .replace(/\btoksiškumo riziką/gi, "sunkaus šalutinio poveikio riziką");
    const meaning = personalMeaningLt(source, ctx);
    return `${body}\n\n${meaning}`;
  }

  body = applyGlossary(body, EN_TERMS);
  const meaning = personalMeaningEn(source, ctx);
  return `${body}\n\n${meaning}`;
}

/** Nominative: "1 rizikos alelis" / "2 rizikos aleliai" */
export function riskAllelePhrase(
  count: number,
  locale: "lt" | "en"
): string {
  if (locale === "en") {
    return count === 1 ? "1 risk allele" : `${count} risk alleles`;
  }
  if (count === 0) return "0 rizikos alelių";
  if (count === 1) return "1 rizikos alelis";
  if (count > 1 && count < 10) return `${count} rizikos aleliai`;
  return `${count} rizikos alelių`;
}

/** Accusative after "turi": "1 rizikos alelį" / "2 rizikos alelius" */
export function riskAllelePhraseObject(
  count: number,
  locale: "lt" | "en"
): string {
  if (locale === "en") return riskAllelePhrase(count, locale);
  if (count === 0) return "0 rizikos alelių";
  if (count === 1) return "1 rizikos alelį";
  if (count > 1 && count < 10) return `${count} rizikos alelius`;
  return `${count} rizikos alelių`;
}
