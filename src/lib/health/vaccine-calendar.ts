import type { HealthCardVaccine } from "./health-card-data";

export type VaccineCalendarItem = {
  id: string;
  nameLt: string;
  nameEn: string;
  due: string;
  kind: "scheduled" | "computed";
  noteLt: string;
  noteEn: string;
  sourceId?: string;
  daysFromNow: number;
};

const REF_NOW = new Date("2026-11-01T12:00:00");

function parseIso(iso: string): Date | null {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addYears(iso: string, years: number): string | null {
  const d = parseIso(iso);
  if (!d) return null;
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number): string | null {
  const d = parseIso(iso);
  if (!d) return null;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysFrom(iso: string, now = REF_NOW): number | null {
  const d = parseIso(iso);
  if (!d) return null;
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

function isTbe(v: HealthCardVaccine) {
  const hay = `${v.nameLt} ${v.nameEn} ${v.productLt || ""} ${v.productEn || ""}`.toLowerCase();
  return /tico|erkin|tick-borne|tbe|encefalit/.test(hay);
}

function isFlu(v: HealthCardVaccine) {
  const hay = `${v.nameLt} ${v.nameEn} ${v.productLt || ""} ${v.productEn || ""}`.toLowerCase();
  return /grip|influ|flu\b/.test(hay);
}

function isTd(v: HealthCardVaccine) {
  const hay = `${v.nameLt} ${v.nameEn}`.toLowerCase();
  return /\btd\b|stablig|tetanus|difter/.test(hay);
}

/**
 * Build upcoming vaccine calendar from history rows.
 * Uses explicit `next` when present; otherwise computes boosters
 * (TBE ≈ +3y after last dose, flu ≈ +12m in autumn window, Td ≈ +10y).
 */
export function buildVaccineCalendar(
  vaccines: HealthCardVaccine[],
  now = REF_NOW
): VaccineCalendarItem[] {
  const items: VaccineCalendarItem[] = [];
  const seenDue = new Set<string>();

  const push = (item: Omit<VaccineCalendarItem, "daysFromNow">) => {
    const days = daysFrom(item.due, now);
    if (days == null || days < -14) return; // drop long-overdue noise from calendar
    const key = `${item.nameEn}|${item.due}`;
    if (seenDue.has(key)) return;
    seenDue.add(key);
    items.push({ ...item, daysFromNow: days });
  };

  // 1) Explicit next dates on records
  for (const v of vaccines) {
    if (!v.next) continue;
    let noteLt = "Pagal skiepų įrašą";
    let noteEn = "From vaccination record";
    if (isTbe(v) && v.date) {
      noteLt = `Kontrolinis erkinio encefalito skiepas (≈ 3 m. po ${v.date})`;
      noteEn = `Tick-borne encephalitis booster (≈ 3 y after ${v.date})`;
    } else if (isFlu(v)) {
      noteLt = "Sezoninė gripo vakcina (kasmet)";
      noteEn = "Seasonal influenza vaccine (annual)";
    } else if (isTd(v) && v.date) {
      noteLt = `Td stiprinamoji dozė (≈ 10 m. po ${v.date})`;
      noteEn = `Td booster (≈ 10 y after ${v.date})`;
    }
    push({
      id: `next-${v.id}`,
      nameLt: isTbe(v)
        ? "Erkinis encefalitas — kontrolinis (TicoVac)"
        : isFlu(v)
          ? "Gripo vakcina (sezoninė)"
          : v.nameLt,
      nameEn: isTbe(v)
        ? "Tick-borne encephalitis — booster (TicoVac)"
        : isFlu(v)
          ? "Seasonal influenza vaccine"
          : v.nameEn,
      due: v.next,
      kind: "scheduled",
      noteLt,
      noteEn,
      sourceId: v.id,
    });
  }

  // 2) Compute missing TBE booster from latest completed TBE dose
  const tbeDoses = vaccines
    .filter((v) => isTbe(v) && v.date)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const latestTbe = tbeDoses[0];
  if (latestTbe?.date) {
    const hasFutureTbe = items.some(
      (i) => /tick-borne|erkin/i.test(i.nameEn + i.nameLt) && i.daysFromNow >= 0
    );
    if (!hasFutureTbe) {
      const due = addYears(latestTbe.date, 3);
      if (due) {
        push({
          id: `computed-tbe-${latestTbe.id}`,
          nameLt: "Erkinis encefalitas — kontrolinis (TicoVac)",
          nameEn: "Tick-borne encephalitis — booster (TicoVac)",
          due,
          kind: "computed",
          noteLt: `Apskaičiuota: +3 metai nuo paskutinės dozės (${latestTbe.date})`,
          noteEn: `Computed: +3 years from last dose (${latestTbe.date})`,
          sourceId: latestTbe.id,
        });
      }
    }
  }

  // 3) Compute next flu if only history without next
  const fluDoses = vaccines
    .filter((v) => isFlu(v) && v.date)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const latestFlu = fluDoses[0];
  if (latestFlu?.date) {
    const hasFutureFlu = items.some(
      (i) => /influ|grip/i.test(i.nameEn + i.nameLt) && i.daysFromNow >= 0
    );
    if (!hasFutureFlu) {
      // Prefer next autumn season (~Oct 1) at least ~10 months after last dose
      let due = addMonths(latestFlu.date, 12);
      if (due) {
        const d = parseIso(due)!;
        // Snap toward October of that year for seasonal framing
        const oct = new Date(d.getFullYear(), 9, 1); // month 9 = Oct
        if (oct.getTime() >= now.getTime()) {
          due = oct.toISOString().slice(0, 10);
        }
        push({
          id: `computed-flu-${latestFlu.id}`,
          nameLt: "Gripo vakcina (sezoninė)",
          nameEn: "Seasonal influenza vaccine",
          due,
          kind: "computed",
          noteLt: `Apskaičiuota: kitas sezonas po ${latestFlu.date}`,
          noteEn: `Computed: next season after ${latestFlu.date}`,
          sourceId: latestFlu.id,
        });
      }
    }
  }

  // 4) Td booster if missing
  const tdDoses = vaccines
    .filter((v) => isTd(v) && v.date)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const latestTd = tdDoses[0];
  if (latestTd?.date) {
    const hasFutureTd = items.some(
      (i) => /\btd\b|tetanus|stablig|difter/i.test(i.nameEn + i.nameLt)
    );
    if (!hasFutureTd) {
      const due = addYears(latestTd.date, 10);
      if (due) {
        push({
          id: `computed-td-${latestTd.id}`,
          nameLt: "Stabligė, difterija (Td) — stiprinamoji",
          nameEn: "Tetanus, diphtheria (Td) — booster",
          due,
          kind: "computed",
          noteLt: `Apskaičiuota: +10 metų nuo ${latestTd.date}`,
          noteEn: `Computed: +10 years from ${latestTd.date}`,
          sourceId: latestTd.id,
        });
      }
    }
  }

  return items.sort((a, b) => a.due.localeCompare(b.due));
}
