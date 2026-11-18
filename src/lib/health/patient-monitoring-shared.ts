import type { HealthCardVaccine } from "@/lib/health/health-card-data";
import { buildVaccineCalendar } from "@/lib/health/vaccine-calendar";

export type MonitoringKind =
  | "visit"
  | "vaccine"
  | "lab_recheck"
  | "screening"
  | "prevention"
  | "consult";

export type MonitoringStatus = "overdue" | "due_soon" | "scheduled" | "planned";

export type MonitoringItem = {
  id: string;
  kind: MonitoringKind;
  titleLt: string;
  titleEn: string;
  detailLt: string;
  detailEn: string;
  cadenceLt: string;
  cadenceEn: string;
  nextDue: string;
  href?: string;
  status: MonitoringStatus;
};

export type PatientCalendarEvent = {
  id: string;
  date: string;
  kind: MonitoringKind;
  titleLt: string;
  titleEn: string;
  detailLt: string;
  detailEn: string;
  href?: string;
  time?: string | null;
};

export function refNoon(d = new Date()) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

export function isoAddMonths(base: Date, months: number): string {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function isoAddDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function statusForDue(dueIso: string, now = refNoon()): MonitoringStatus {
  const due = new Date(`${dueIso}T12:00:00`).getTime();
  const n = now.getTime();
  const days = Math.round((due - n) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 30) return "due_soon";
  if (days <= 90) return "scheduled";
  return "planned";
}

function nextAutumnFluDue(now: Date): string {
  const year =
    now.getMonth() > 10 || (now.getMonth() === 10 && now.getDate() > 15)
      ? now.getFullYear() + 1
      : now.getFullYear();
  return `${year}-10-15`;
}

function sharedPrevention(now: Date, sex: "male" | "female"): MonitoringItem[] {
  const cardioHref =
    sex === "female"
      ? "/patient/digital-twin/cardio_metabolic"
      : "/patient/digital-twin/cardiovascular";
  const base: MonitoringItem[] = [
    {
      id: "mon-flu",
      kind: "vaccine",
      titleLt: "Sezoninė gripo vakcina",
      titleEn: "Seasonal influenza vaccine",
      detailLt: "Kasmetinis skiepas prieš gripą — ypač jei yra rizikos veiksnių.",
      detailEn: "Annual flu shot — especially with risk factors.",
      cadenceLt: "Kasmet (ruduo)",
      cadenceEn: "Yearly (autumn)",
      nextDue: nextAutumnFluDue(now),
      href: "/patient/health-card?tab=vacc",
      status: "scheduled",
    },
    {
      id: "mon-cardio-program",
      kind: "prevention",
      titleLt: "Širdies ir kraujagyslių prevencinė programa",
      titleEn: "Cardiovascular prevention programme",
      detailLt:
        "Lipidų panelė, kraujospūdis, gliukozė — prevencinis ciklas pagal rizikos profilį.",
      detailEn:
        "Lipid panel, blood pressure, glucose — prevention cycle by risk profile.",
      cadenceLt: "Kas 6 mėn.",
      cadenceEn: "Every 6 months",
      nextDue: isoAddMonths(now, 2),
      href: cardioHref,
      status: "due_soon",
    },
    {
      id: "mon-lipid-recheck",
      kind: "lab_recheck",
      titleLt: "Gydytojo paskirti lipidų / ApoB žymenys",
      titleEn: "Clinician-ordered lipid / ApoB markers",
      detailLt:
        "Pakartoti ApoB, Lp(a) ir lipidų panelę pagal gydytojo stebėsenos planą.",
      detailEn:
        "Repeat ApoB, Lp(a) and lipid panel per your clinician’s monitoring plan.",
      cadenceLt: "Kas 3–6 mėn.",
      cadenceEn: "Every 3–6 months",
      nextDue: isoAddMonths(now, 1),
      href: "/patient/labs",
      status: "due_soon",
    },
    {
      id: "mon-annual-gp",
      kind: "consult",
      titleLt: "Metinė profilaktinė apžiūra",
      titleEn: "Annual preventive check-up",
      detailLt: "Šeimos gydytojo vizitas, skiepų peržiūra ir atrankos pagal amžių.",
      detailEn: "GP visit, vaccine review and age-based screening.",
      cadenceLt: "Kasmet",
      cadenceEn: "Yearly",
      nextDue: isoAddMonths(now, 4),
      href: "/patient/visits",
      status: "scheduled",
    },
  ];
  return base.map((item) => ({
    ...item,
    status: statusForDue(item.nextDue, now),
  }));
}

function maleMonitoring(now: Date): MonitoringItem[] {
  const base: MonitoringItem[] = [
    {
      id: "mon-psa",
      kind: "screening",
      titleLt: "PSA tyrimas (prostatos stebėsena)",
      titleEn: "PSA test (prostate monitoring)",
      detailLt:
        "Kasmetinis PSA (ir, jei reikia, free PSA) — onkologinės prevencijos dalis.",
      detailEn:
        "Annual PSA (and free PSA if needed) as part of cancer prevention.",
      cadenceLt: "Kasmet",
      cadenceEn: "Yearly",
      nextDue: isoAddMonths(now, 3),
      href: "/patient/labs",
      status: "scheduled",
    },
    {
      id: "mon-echo",
      kind: "screening",
      titleLt: "Širdies Echo kontrolė (genetikos stebėsena)",
      titleEn: "Cardiac echo follow-up (genetic surveillance)",
      detailLt:
        "Periodinis Echo, jei yra širdies genetikos signalų (pvz. MYBPC3).",
      detailEn:
        "Periodic echo when cardiac genetics signals are present (e.g. MYBPC3).",
      cadenceLt: "Kas 12–24 mėn.",
      cadenceEn: "Every 12–24 months",
      nextDue: isoAddMonths(now, 8),
      href: "/patient/digital-twin/cardiovascular",
      status: "planned",
    },
    {
      id: "mon-td-booster",
      kind: "vaccine",
      titleLt: "Td stiprinamoji dozė",
      titleEn: "Td booster",
      detailLt: "Stabligės / difterijos stiprinamoji dozė pagal skiepų grafiką.",
      detailEn: "Tetanus / diphtheria booster per vaccine schedule.",
      cadenceLt: "Kas ~10 m.",
      cadenceEn: "About every 10 years",
      nextDue: isoAddMonths(now, 14),
      href: "/patient/health-card?tab=vacc",
      status: "planned",
    },
  ];
  return base.map((item) => ({
    ...item,
    status: statusForDue(item.nextDue, now),
  }));
}

function femaleMonitoring(now: Date): MonitoringItem[] {
  const base: MonitoringItem[] = [
    {
      id: "mon-cervical",
      kind: "screening",
      titleLt: "Gimdos kaklelio / HPV atranka",
      titleEn: "Cervical / HPV screening",
      detailLt: "Pagal amžių ir ankstesnius rezultatus — reguliari atranka.",
      detailEn: "Regular screening by age and prior results.",
      cadenceLt: "Kas 3 m. (arba pagal planą)",
      cadenceEn: "Every 3 years (or per plan)",
      nextDue: isoAddMonths(now, 5),
      href: "/patient/digital-twin/reproductive",
      status: "scheduled",
    },
    {
      id: "mon-breast",
      kind: "screening",
      titleLt: "Krūtų sveikatos patikra",
      titleEn: "Breast health check",
      detailLt:
        "Klinikinė apžiūra / mamografija pagal amžių ir rizikos profilį.",
      detailEn:
        "Clinical exam / mammography by age and risk profile.",
      cadenceLt: "Kas 1–2 m.",
      cadenceEn: "Every 1–2 years",
      nextDue: isoAddMonths(now, 7),
      href: "/patient/digital-twin/oncology",
      status: "planned",
    },
    {
      id: "mon-hormones",
      kind: "lab_recheck",
      titleLt: "Hormonų / ciklo žymenų kontrolė",
      titleEn: "Hormone / cycle marker follow-up",
      detailLt:
        "Gydytojo paskirti hormonų tyrimai (pvz. TSH, estradiolis) pagal fenotipo stebėseną.",
      detailEn:
        "Clinician-ordered hormone labs (e.g. TSH, estradiol) for phenotype monitoring.",
      cadenceLt: "Kas 6–12 mėn.",
      cadenceEn: "Every 6–12 months",
      nextDue: isoAddMonths(now, 2),
      href: "/patient/labs",
      status: "due_soon",
    },
    {
      id: "mon-women-consult",
      kind: "consult",
      titleLt: "Moters sveikatos konsultacija",
      titleEn: "Women’s health consultation",
      detailLt:
        "Pakartotina konsultacija dėl ciklo / hormonų / prevencijos plano.",
      detailEn:
        "Follow-up consult on cycle / hormones / prevention plan.",
      cadenceLt: "Pagal poreikį / kasmet",
      cadenceEn: "As needed / yearly",
      nextDue: isoAddDays(now, 45),
      href: "/patient/digital-twin/reproductive",
      status: "due_soon",
    },
  ];
  return base.map((item) => ({
    ...item,
    status: statusForDue(item.nextDue, now),
  }));
}

/** Ongoing monitoring plan shown in the Health Card Stebėsena tab. */
export function listMonitoringPlan(opts: {
  sex: "male" | "female";
  vaccines?: HealthCardVaccine[];
}): MonitoringItem[] {
  const now = refNoon();
  const items = [
    ...sharedPrevention(now, opts.sex),
    ...(opts.sex === "female" ? femaleMonitoring(now) : maleMonitoring(now)),
  ];

  if (opts.vaccines?.length) {
    for (const v of buildVaccineCalendar(opts.vaccines, now)) {
      if (items.some((i) => i.nextDue === v.due && i.kind === "vaccine")) continue;
      items.push({
        id: `mon-vac-${v.id}`,
        kind: "vaccine",
        titleLt: v.nameLt,
        titleEn: v.nameEn,
        detailLt: v.noteLt,
        detailEn: v.noteEn,
        cadenceLt: "Pagal skiepų kalendorių",
        cadenceEn: "Per vaccine calendar",
        nextDue: v.due,
        href: "/patient/health-card?tab=vacc",
        status: statusForDue(v.due, now),
      });
    }
  }

  const rank: Record<MonitoringStatus, number> = {
    overdue: 0,
    due_soon: 1,
    scheduled: 2,
    planned: 3,
  };
  return items.sort((a, b) => {
    const rs = rank[a.status] - rank[b.status];
    if (rs !== 0) return rs;
    return a.nextDue.localeCompare(b.nextDue);
  });
}

export function monitoringKindLabel(
  kind: MonitoringKind,
  locale: "lt" | "en"
): string {
  const map: Record<MonitoringKind, { lt: string; en: string }> = {
    visit: { lt: "Vizitas", en: "Visit" },
    vaccine: { lt: "Skiepas", en: "Vaccine" },
    lab_recheck: { lt: "Žymenų kontrolė", en: "Marker recheck" },
    screening: { lt: "Atranka", en: "Screening" },
    prevention: { lt: "Prevencija", en: "Prevention" },
    consult: { lt: "Konsultacija", en: "Consultation" },
  };
  return locale === "en" ? map[kind].en : map[kind].lt;
}

export function monitoringStatusLabel(
  status: MonitoringStatus,
  locale: "lt" | "en"
): string {
  const map: Record<MonitoringStatus, { lt: string; en: string }> = {
    overdue: { lt: "Pradelsta", en: "Overdue" },
    due_soon: { lt: "Artėja", en: "Due soon" },
    scheduled: { lt: "Suplanuota", en: "Scheduled" },
    planned: { lt: "Plane", en: "Planned" },
  };
  return locale === "en" ? map[status].en : map[status].lt;
}

export function formatMonitoringDue(
  iso: string,
  locale: "lt" | "en"
): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "lt-LT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
