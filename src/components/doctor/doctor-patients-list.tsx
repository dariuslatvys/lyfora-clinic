"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RiskColour } from "@/lib/health/colours";
import type { PatientSpecialNote } from "@/lib/doctor/doctor-patients-meta";

export type DoctorPatientListItem = {
  id: string;
  name: string;
  dob: string | null;
  birthYear: string;
  sexLabel: string;
  notes: string | null;
  visitCount: number;
  markers: number;
  snps: number;
  rare: number;
  categories: Array<{
    id: string;
    title: string;
    colour: RiskColour;
    colourLabel: string;
  }>;
  specialNotes: PatientSpecialNote[];
};

function fold(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function DoctorPatientsList({
  locale,
  patients,
}: {
  locale: "lt" | "en";
  patients: DoctorPatientListItem[];
}) {
  const [q, setQ] = useState("");
  const copy =
    locale === "en"
      ? {
          search: "Search by name, year of birth, sex, category or note…",
          visits: "Visits",
          markers: "Markers",
          snp: "SNP",
          ngs: "NGS",
          open: "Open chart",
          cats: "Problem areas",
          notes: "Special notes",
          empty: "No patients match the search.",
          born: "Born",
        }
      : {
          search:
            "Ieškoti pagal vardą, gimimo metus, lytį, kategoriją ar pastabą…",
          visits: "Vizitai",
          markers: "Žymenys",
          snp: "SNP",
          ngs: "NGS",
          open: "Atidaryti kortelę",
          cats: "Probleminės sritys",
          notes: "Spec. pastabos",
          empty: "Pagal paiešką pacientų nerasta.",
          born: "Gim.",
        };

  const filtered = useMemo(() => {
    const nq = fold(q.trim());
    if (!nq) return patients;
    return patients.filter((p) => {
      const hay = fold(
        [
          p.name,
          p.dob || "",
          p.birthYear,
          p.sexLabel,
          p.notes || "",
          ...p.categories.map((c) => c.title),
          ...p.specialNotes.map((n) =>
            locale === "en" ? n.labelEn : n.labelLt
          ),
        ].join(" ")
      );
      return hay.includes(nq);
    });
  }, [patients, q, locale]);

  return (
    <div className="stack" style={{ gap: 14 }}>
      <label className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">
          {locale === "en" ? "Search" : "Paieška"}
        </span>
        <input
          type="search"
          className="doctor-patients-search"
          value={q}
          placeholder={copy.search}
          autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      {filtered.length ? (
        <div className="stack" style={{ gap: 12 }}>
          {filtered.map((p) => (
            <article key={p.id} className="card doctor-patient-card">
              <div className="card-head">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-[1.2rem] font-semibold m-0">
                    {p.name}
                  </h3>
                  <p className="small muted m-0 mt-1">
                    {copy.born} {p.birthYear}
                    {p.dob ? ` (${p.dob})` : ""} · {p.sexLabel}
                  </p>
                </div>
                <Link href={`/doctor/patients/${p.id}`} className="btn sm">
                  {copy.open}
                </Link>
              </div>

              <div className="doctor-patient-stats">
                <span className="doctor-patient-stat">
                  <b>{p.visitCount}</b>
                  <span>{copy.visits}</span>
                </span>
                <span className="doctor-patient-stat">
                  <b>{p.markers}</b>
                  <span>{copy.markers}</span>
                </span>
                <span className="doctor-patient-stat">
                  <b>{p.snps}</b>
                  <span>{copy.snp}</span>
                </span>
                <span className="doctor-patient-stat">
                  <b>{p.rare}</b>
                  <span>{copy.ngs}</span>
                </span>
              </div>

              {p.categories.length ? (
                <div className="mt-3">
                  <span className="eyebrow">{copy.cats}</span>
                  <div className="doctor-patient-cats mt-2">
                    {p.categories.map((c) => (
                      <span
                        key={c.id}
                        className={`doctor-cat-pill colour-${c.colour}`}
                        title={c.colourLabel}
                      >
                        <i aria-hidden />
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {p.specialNotes.length ? (
                <div className="mt-3">
                  <span className="eyebrow">{copy.notes}</span>
                  <div className="doctor-patient-notes mt-2">
                    {p.specialNotes.map((n) => (
                      <span key={n.id} className={`doctor-note-chip kind-${n.kind}`}>
                        {locale === "en" ? n.labelEn : n.labelLt}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {p.notes ? (
                <p className="mt-3 mb-0 small text-[var(--ink-soft)]">
                  {p.notes}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">{copy.empty}</div>
      )}
    </div>
  );
}
