import {
  formatClinicVisitWhen,
  listClinicVisitsForPatient,
} from "@/lib/health/clinic-visits";
import {
  upcomingVisits,
  visitDoctor,
  visitSpecialty,
  visitTitle,
  type DemoVisit,
} from "@/lib/health/demo-visits";
import type { HealthCardVaccine } from "@/lib/health/health-card-data";
import {
  isoAddDays,
  isoAddMonths,
  listMonitoringPlan,
  refNoon,
  type PatientCalendarEvent,
} from "@/lib/health/patient-monitoring-shared";

export * from "@/lib/health/patient-monitoring-shared";

function demoVisitToEvent(v: DemoVisit): PatientCalendarEvent {
  return {
    id: `visit-${v.id}`,
    date: v.date,
    kind: "visit",
    titleLt: visitTitle(v, "lt"),
    titleEn: visitTitle(v, "en"),
    detailLt: `${visitDoctor(v, "lt")} · ${visitSpecialty(v, "lt")}`,
    detailEn: `${visitDoctor(v, "en")} · ${visitSpecialty(v, "en")}`,
    href: `/patient/visits/${v.id}`,
    time: v.time || null,
  };
}

/** Unified calendar feed: visits + monitoring + vaccine due dates. Server-only. */
export function listPatientCalendarEvents(opts: {
  patientId: string;
  sex: "male" | "female";
  vaccines?: HealthCardVaccine[];
}): PatientCalendarEvent[] {
  const now = refNoon();
  const events: PatientCalendarEvent[] = [];

  for (const v of upcomingVisits()) {
    events.push(demoVisitToEvent(v));
  }

  for (const v of listClinicVisitsForPatient(opts.patientId)) {
    if (v.status !== "upcoming") continue;
    events.push({
      id: `clinic-${v.id}`,
      date: v.date,
      kind: "visit",
      titleLt: v.titleLt,
      titleEn: v.titleEn,
      detailLt: formatClinicVisitWhen(v, "lt"),
      detailEn: formatClinicVisitWhen(v, "en"),
      href: `/patient/visits/${v.id}`,
      time: v.time || null,
    });
  }

  for (const m of listMonitoringPlan({
    sex: opts.sex,
    vaccines: opts.vaccines,
  })) {
    events.push({
      id: `cal-${m.id}`,
      date: m.nextDue,
      kind: m.kind,
      titleLt: m.titleLt,
      titleEn: m.titleEn,
      detailLt: `${m.cadenceLt}. ${m.detailLt}`,
      detailEn: `${m.cadenceEn}. ${m.detailEn}`,
      href: m.href,
      time: null,
    });
  }

  const min = isoAddDays(now, -14);
  const max = isoAddMonths(now, 14);
  return events
    .filter((e) => e.date >= min && e.date <= max)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.time || "").localeCompare(b.time || "")
    );
}
