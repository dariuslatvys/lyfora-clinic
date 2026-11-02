"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatMedicationLabel,
  searchMedications,
  type MedicationSuggestion,
} from "@/lib/health/medications";
import {
  DOCTOR_RX_EVENT,
  addDoctorIssuedRx,
  readDoctorIssuedRx,
  type DoctorIssuedRx,
} from "@/lib/doctor/doctor-issued-rx";
import { addCalendarDays, todayIsoDate } from "@/lib/health/demo-visits";

export function DoctorIssuePrescription({
  locale,
  patientId,
  patientName,
}: {
  locale: "lt" | "en";
  patientId: string;
  patientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MedicationSuggestion | null>(null);
  const [strength, setStrength] = useState("");
  const [directions, setDirections] = useState("");
  const [days, setDays] = useState(30);
  const [issued, setIssued] = useState<DoctorIssuedRx[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  const copy =
    locale === "en"
      ? {
          issue: "Issue prescription",
          title: "New e-prescription",
          search: "Start typing medicine name or substance…",
          strength: "Strength",
          directions: "Directions (D.S.)",
          days: "Days supply",
          save: "Issue prescription",
          cancel: "Cancel",
          list: "Issued here",
          empty: "No prescriptions issued from this chart yet.",
          forPatient: "Patient",
          picked: "Selected",
          change: "Change",
          saved: "Prescription issued.",
        }
      : {
          issue: "Išrašyti receptą",
          title: "Naujas e. receptas",
          search: "Įveskite vaisto ar veikliosios medžiagos pradžią…",
          strength: "Stiprumas",
          directions: "Vartojimas (D.S.)",
          days: "Dienų skaičius",
          save: "Išrašyti receptą",
          cancel: "Atšaukti",
          list: "Išrašyti čia",
          empty: "Iš šios kortelės receptų dar neišrašyta.",
          forPatient: "Pacientas",
          picked: "Pasirinkta",
          change: "Keisti",
          saved: "Receptas išrašytas.",
        };

  useEffect(() => {
    function sync() {
      setIssued(readDoctorIssuedRx(patientId));
    }
    sync();
    window.addEventListener(DOCTOR_RX_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DOCTOR_RX_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [patientId]);

  const hits = useMemo(() => searchMedications(query, 10), [query]);
  const canSave = Boolean(picked && strength.trim() && directions.trim() && days > 0);

  function resetForm() {
    setQuery("");
    setPicked(null);
    setStrength("");
    setDirections(
      locale === "en"
        ? "by mouth, as directed"
        : "vartoti per burną, kaip nurodyta"
    );
    setDays(30);
  }

  function save() {
    if (!picked || !canSave) return;
    const issuedAt = todayIsoDate();
    const rx: DoctorIssuedRx = {
      id: `drx:${Date.now()}`,
      patientId,
      brandName: picked.brandName,
      activeSubstance: picked.activeSubstance,
      atcCode: picked.atcCode,
      form: picked.form,
      strength: strength.trim(),
      directions: directions.trim(),
      daysSupply: days,
      issuedAt,
      validTo: addCalendarDays(issuedAt, days),
    };
    addDoctorIssuedRx(rx);
    setIssued(readDoctorIssuedRx(patientId));
    setSavedFlash(true);
    setOpen(false);
    resetForm();
    window.setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn sm"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          {copy.issue}
        </button>
      </div>

      {savedFlash ? (
        <div className="empty" style={{ color: "var(--accent)" }}>
          {copy.saved}
        </div>
      ) : null}

      {open ? (
        <section className="card doctor-rx-form stack" style={{ gap: 12 }}>
          <div className="card-head">
            <h3 className="m-0">{copy.title}</h3>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setOpen(false)}
            >
              {copy.cancel}
            </button>
          </div>
          <p className="small muted m-0">
            {copy.forPatient}: <b>{patientName}</b>
          </p>

          {picked ? (
            <div className="doctor-cal-patient-picked">
              <div>
                <span className="eyebrow">{copy.picked}</span>
                <b className="block mt-1">{formatMedicationLabel(picked)}</b>
                <span className="xs muted">
                  ATC {picked.atcCode || "—"}
                  {picked.form ? ` · ${picked.form}` : ""}
                  {picked.categoryName ? ` · ${picked.categoryName}` : ""}
                </span>
              </div>
              <button
                type="button"
                className="btn ghost sm"
                onClick={() => setPicked(null)}
              >
                {copy.change}
              </button>
            </div>
          ) : (
            <label className="stack" style={{ gap: 4 }}>
              <span className="eyebrow">
                {locale === "en" ? "Medicine" : "Vaistas"}
              </span>
              <input
                type="search"
                value={query}
                placeholder={copy.search}
                autoComplete="off"
                onChange={(e) => setQuery(e.target.value)}
              />
              {query.trim().length >= 2 ? (
                hits.length ? (
                  <ul className="doctor-cal-patient-hits">
                    {hits.map((h) => (
                      <li key={`${h.brandName}-${h.atcCode}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setPicked(h);
                            setQuery("");
                            if (!strength) {
                              setStrength(
                                locale === "en" ? "as labelled" : "kaip etiketėje"
                              );
                            }
                          }}
                        >
                          <b>{formatMedicationLabel(h)}</b>
                          <span className="xs muted">
                            ATC {h.atcCode || "—"}
                            {h.form ? ` · ${h.form}` : ""}
                            {h.lyforaCategory ? ` · ${h.lyforaCategory}` : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty">
                    {locale === "en" ? "No medicines found." : "Vaistų nerasta."}
                  </div>
                )
              ) : null}
            </label>
          )}

          <div className="doctor-rx-grid">
            <label className="stack" style={{ gap: 4 }}>
              <span className="eyebrow">{copy.strength}</span>
              <input
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder={locale === "en" ? "e.g. 40 mg" : "pvz. 40 mg"}
              />
            </label>
            <label className="stack" style={{ gap: 4 }}>
              <span className="eyebrow">{copy.days}</span>
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value) || 1)}
              />
            </label>
          </div>

          <label className="stack" style={{ gap: 4 }}>
            <span className="eyebrow">{copy.directions}</span>
            <textarea
              className="doctor-cal-reason"
              rows={3}
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
            />
          </label>

          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn"
              disabled={!canSave}
              onClick={save}
            >
              {copy.save}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setOpen(false)}
            >
              {copy.cancel}
            </button>
          </div>
        </section>
      ) : null}

      <section className="card">
        <div className="card-head">
          <h3 className="m-0">{copy.list}</h3>
          <span className="pill plain c-acc">{issued.length}</span>
        </div>
        {issued.length ? (
          <ul className="doctor-appt-docs">
            {issued.map((r) => (
              <li key={r.id}>
                <div>
                  <b>
                    {r.brandName}
                    {r.activeSubstance ? ` (${r.activeSubstance})` : ""}
                  </b>
                  <span className="xs muted">
                    {r.strength} · {r.daysSupply}{" "}
                    {locale === "en" ? "days" : "d."} · {r.issuedAt} →{" "}
                    {r.validTo}
                  </span>
                  <span className="xs muted block">{r.directions}</span>
                </div>
                <span className="pill c-green">
                  {locale === "en" ? "Issued" : "Išrašytas"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">{copy.empty}</div>
        )}
      </section>
    </div>
  );
}
