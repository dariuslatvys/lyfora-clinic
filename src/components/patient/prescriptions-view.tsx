"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DemoPrescription } from "@/lib/health/demo-prescriptions";
import { rxStatusLabel } from "@/lib/health/demo-prescriptions";
import {
  getVisit,
  visitTitle,
  formatVisitWhen,
} from "@/lib/health/demo-visits";

function statusPill(status: DemoPrescription["status"]) {
  if (status === "active") return "c-green";
  if (status === "dispensed") return "c-acc";
  if (status === "cancelled") return "c-red";
  return "c-none";
}

function findRxTab(
  id: string | null | undefined,
  active: DemoPrescription[],
  history: DemoPrescription[]
): { tab: "active" | "history"; openId: string | null } {
  if (!id) {
    return { tab: "active", openId: active[0]?.id || null };
  }
  if (active.some((r) => r.id === id)) {
    return { tab: "active", openId: id };
  }
  if (history.some((r) => r.id === id)) {
    return { tab: "history", openId: id };
  }
  return { tab: "active", openId: active[0]?.id || null };
}

export function PrescriptionsView({
  locale,
  active,
  history,
  initialRxId = null,
}: {
  locale: "lt" | "en";
  active: DemoPrescription[];
  history: DemoPrescription[];
  /** Deep-link from a visit: /patient/prescriptions?rx=… */
  initialRxId?: string | null;
}) {
  const initial = findRxTab(initialRxId, active, history);
  const [tab, setTab] = useState<"active" | "history">(initial.tab);
  const [openId, setOpenId] = useState<string | null>(initial.openId);

  const copy = useMemo(
    () =>
      locale === "en"
        ? {
            eyebrow: "Medications",
            title: "Prescriptions",
            blurb:
              "Electronic prescriptions in ESPBI style — active ones you can still fill, and historical issues.",
            active: "Active",
            history: "Historical",
            emptyActive: "No active prescriptions right now.",
            emptyHistory: "No historical prescriptions yet.",
            ask: "Ask doctor 24/7 about a refill",
            number: "e-Prescription No.",
            valid: "Valid",
            diagnosis: "Diagnosis",
            directions: "Directions (D.S.)",
            package: "Quantity",
            days: "days",
            doctor: "Prescriber",
            clinic: "Clinic",
            compensation: "Reimbursement",
            psychotropic: "Psychotropic",
            patientInfo: "Note for patient",
            pharmacyInfo: "Note for pharmacy",
            openVisit: "Related visit",
            substance: "Medicine",
            atc: "ATC",
            form: "Form",
            issued: "Issued",
          }
        : {
            eyebrow: "Vaistai",
            title: "Receptai",
            blurb:
              "Elektroniniai receptai ESPBI stiliumi — aktyvūs, kuriuos dar galite atsiimti, ir istoriniai.",
            active: "Aktyvūs",
            history: "Istoriniai",
            emptyActive: "Šiuo metu aktyvių receptų nėra.",
            emptyHistory: "Istorinių receptų dar nėra.",
            ask: "Klausti gydytojo 24/7 dėl pratęsimo",
            number: "E. recepto Nr.",
            valid: "Galioja",
            diagnosis: "Diagnozė",
            directions: "Vartojimas (D.S.)",
            package: "Kiekis",
            days: "d.",
            doctor: "Išrašė",
            clinic: "Įstaiga",
            compensation: "Kompensacija",
            psychotropic: "Psichotropinis",
            patientInfo: "Pastaba pacientui",
            pharmacyInfo: "Pastaba vaistininkui",
            openVisit: "Susijęs vizitas",
            substance: "Vaistas",
            atc: "ATC",
            form: "Forma",
            issued: "Išrašyta",
          },
    [locale]
  );

  const list = tab === "active" ? active : history;
  const empty = tab === "active" ? copy.emptyActive : copy.emptyHistory;
  const selected = list.find((r) => r.id === openId) || list[0] || null;
  const linkedVisit = selected?.visitId ? getVisit(selected.visitId) : null;

  return (
    <div className="stack" style={{ gap: 14 }}>
      <header>
        <p className="eyebrow">{copy.eyebrow}</p>
        <div className="row between" style={{ alignItems: "flex-end", gap: 12 }}>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
              {copy.blurb}
            </p>
          </div>
          <Link href="/patient/questions" className="btn sm ghost">
            {copy.ask}
          </Link>
        </div>
      </header>

      <div
        className="tabs visits-tabs"
        role="tablist"
        aria-label={copy.title}
      >
        <button
          type="button"
          role="tab"
          className={tab === "active" ? "on" : undefined}
          aria-selected={tab === "active"}
          onClick={() => {
            setTab("active");
            setOpenId(active[0]?.id || null);
          }}
        >
          {copy.active}
          <span className="visits-tab-count">{active.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          className={tab === "history" ? "on" : undefined}
          aria-selected={tab === "history"}
          onClick={() => {
            setTab("history");
            setOpenId(history[0]?.id || null);
          }}
        >
          {copy.history}
          <span className="visits-tab-count">{history.length}</span>
        </button>
      </div>

      {!list.length ? (
        <div className="card empty">{empty}</div>
      ) : (
        <div className="rx-layout">
          <div className="card rx-list">
            <div className="list">
              {list.map((r) => {
                const name = locale === "en" ? r.substanceEn : r.substanceLt;
                const on = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`li click rx-li${on ? " on" : ""}`}
                    onClick={() => setOpenId(r.id)}
                  >
                    <div className="grow">
                      <b>
                        {name} {r.strength}
                      </b>
                      <span className="small muted">
                        {r.issuedAt} · {copy.number} {r.number}
                      </span>
                      <span className="small muted">
                        {locale === "en" ? r.clinicEn : r.clinicLt}
                      </span>
                    </div>
                    <span className={`pill ${statusPill(r.status)}`}>
                      {rxStatusLabel(r.status, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selected ? (
            <article className="card rx-detail surface-raised-card">
              <div className="rx-detail-head">
                <div>
                  <p className="eyebrow m-0">
                    EREC01 · {copy.number} {selected.number}
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold m-0 mt-1">
                    {locale === "en"
                      ? selected.substanceEn
                      : selected.substanceLt}{" "}
                    {selected.strength}
                  </h2>
                  <p className="small muted mt-1 mb-0">
                    {selected.inn} · {copy.atc} {selected.atc}
                  </p>
                </div>
                <div className="rx-detail-flags">
                  <span className={`pill ${statusPill(selected.status)}`}>
                    {rxStatusLabel(selected.status, locale)}
                  </span>
                  {selected.compensated ? (
                    <span className="pill plain c-acc">
                      {locale === "en" ? "Reimbursed" : "Kompensuojamas"}
                    </span>
                  ) : (
                    <span className="pill plain c-none">
                      {locale === "en" ? "Not reimbursed" : "Nekompensuojamas"}
                    </span>
                  )}
                  {selected.psychotropic ? (
                    <span className="pill c-orange">{copy.psychotropic}</span>
                  ) : null}
                </div>
              </div>

              <div className="rx-grid">
                <div className="rx-field">
                  <span className="eyebrow">{copy.issued}</span>
                  <b>{selected.issuedAt}</b>
                </div>
                <div className="rx-field">
                  <span className="eyebrow">{copy.valid}</span>
                  <b>
                    {selected.validFrom} → {selected.validTo}
                  </b>
                  <span className="small muted">
                    ({selected.daysSupply} {copy.days})
                  </span>
                </div>
                <div className="rx-field">
                  <span className="eyebrow">{copy.compensation}</span>
                  <b>
                    {locale === "en"
                      ? selected.compensationNoteEn
                      : selected.compensationNoteLt}
                  </b>
                </div>
                <div className="rx-field">
                  <span className="eyebrow">{copy.form}</span>
                  <b>
                    {locale === "en" ? selected.formEn : selected.formLt}
                  </b>
                </div>
                <div className="rx-field">
                  <span className="eyebrow">{copy.package}</span>
                  <b>{selected.packageQty}</b>
                </div>
                <div className="rx-field">
                  <span className="eyebrow">{copy.substance}</span>
                  <b>
                    Rp{" "}
                    {locale === "en"
                      ? selected.substanceEn
                      : selected.substanceLt}
                  </b>
                </div>
              </div>

              <div className="rx-block">
                <span className="eyebrow">{copy.diagnosis}</span>
                <p className="m-0 mt-1">
                  <b>{selected.diagnosisCode}</b>{" "}
                  {locale === "en"
                    ? selected.diagnosisEn
                    : selected.diagnosisLt}
                </p>
              </div>

              <div className="rx-block rx-ds">
                <span className="eyebrow">{copy.directions}</span>
                <p className="m-0 mt-1 font-semibold">
                  D.S.{" "}
                  {locale === "en"
                    ? selected.directionsEn
                    : selected.directionsLt}
                </p>
              </div>

              <div className="rx-grid">
                <div className="rx-field">
                  <span className="eyebrow">{copy.doctor}</span>
                  <b>
                    {locale === "en" ? selected.doctorEn : selected.doctorLt}
                  </b>
                  <span className="small muted">
                    {locale === "en"
                      ? selected.specialtyEn
                      : selected.specialtyLt}{" "}
                    · Spaudo Nr. {selected.stampNo}
                  </span>
                </div>
                <div className="rx-field">
                  <span className="eyebrow">{copy.clinic}</span>
                  <b>
                    {locale === "en" ? selected.clinicEn : selected.clinicLt}
                  </b>
                  <span className="small muted">
                    {locale === "en"
                      ? selected.clinicAddressEn
                      : selected.clinicAddressLt}
                  </span>
                </div>
              </div>

              {(locale === "en"
                ? selected.patientNoteEn
                : selected.patientNoteLt) ? (
                <div className="rx-block">
                  <span className="eyebrow">{copy.patientInfo}</span>
                  <p className="m-0 mt-1">
                    {locale === "en"
                      ? selected.patientNoteEn
                      : selected.patientNoteLt}
                  </p>
                </div>
              ) : null}

              {(locale === "en"
                ? selected.pharmacyNoteEn
                : selected.pharmacyNoteLt) ? (
                <div className="rx-block">
                  <span className="eyebrow">{copy.pharmacyInfo}</span>
                  <p className="m-0 mt-1">
                    {locale === "en"
                      ? selected.pharmacyNoteEn
                      : selected.pharmacyNoteLt}
                  </p>
                </div>
              ) : null}

              {selected.visitId ? (
                <div className="rx-block mt-3">
                  <span className="eyebrow">{copy.openVisit}</span>
                  {linkedVisit ? (
                    <Link
                      href={`/patient/visits/${selected.visitId}`}
                      className="li click mt-2"
                      style={{ display: "flex" }}
                    >
                      <div className="grow">
                        <b>{visitTitle(linkedVisit, locale)}</b>
                        <span className="small muted">
                          {formatVisitWhen(linkedVisit, locale)} ·{" "}
                          {locale === "en"
                            ? linkedVisit.doctorEn
                            : linkedVisit.doctorLt}
                        </span>
                      </div>
                      <span className="pill plain c-acc">→</span>
                    </Link>
                  ) : (
                    <div className="mt-2">
                      <Link
                        href={`/patient/visits/${selected.visitId}`}
                        className="btn ghost sm"
                      >
                        {copy.openVisit}
                      </Link>
                    </div>
                  )}
                </div>
              ) : null}
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}
