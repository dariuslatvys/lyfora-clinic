"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  VIDEO_LINK_OPTIONS,
  addCreatedAppointment,
  freeSlotsForDay,
  modeLabel,
  searchDoctorPatients,
  type AppointmentAttachment,
  type DoctorAppointment,
  type DoctorPatientOption,
  type VideoPlatform,
} from "@/lib/doctor/doctor-calendar";
import type { DoctorVisitCopy } from "@/components/doctor/doctor-visit-copy";

export function DoctorNewVisitForm({
  locale,
  patients,
  date,
  all,
  copy,
  onCancel,
  onSaved,
}: {
  locale: "lt" | "en";
  patients: DoctorPatientOption[];
  date: string;
  all: DoctorAppointment[];
  copy: DoctorVisitCopy;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const freeSlots = useMemo(() => freeSlotsForDay(all, date), [all, date]);
  const [patientQuery, setPatientQuery] = useState("");
  const [pendingFiles, setPendingFiles] = useState<
    Array<{ id: string; file: File }>
  >([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientId: "" as string,
    time: freeSlots[0] || "",
    title: "",
    reason: "",
    mode: "in_person" as DoctorAppointment["mode"],
    videoPlatform: "meet" as VideoPlatform,
  });

  useEffect(() => {
    setForm((f) => {
      if (f.time && freeSlots.includes(f.time)) return f;
      return { ...f, time: freeSlots[0] || "" };
    });
  }, [date, freeSlots]);

  const patientHits = useMemo(
    () => searchDoctorPatients(patients, patientQuery, locale),
    [patients, patientQuery, locale]
  );
  const selectedPatient = patients.find((p) => p.id === form.patientId) || null;
  const canSave = Boolean(
    form.patientId && form.time && freeSlots.includes(form.time) && !saving
  );

  function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: `att:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
    }));
    setPendingFiles((prev) => [...prev, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function saveVisit() {
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient || !form.time) return;
    if (!freeSlots.includes(form.time)) return;
    const title =
      form.title.trim() ||
      (locale === "en" ? "Clinic visit" : "Klinikinis vizitas");
    const reason = form.reason.trim();
    const video =
      form.mode === "video"
        ? VIDEO_LINK_OPTIONS.find((v) => v.id === form.videoPlatform)
        : undefined;
    const placeLt =
      form.mode === "in_person"
        ? "Kabinetas 12"
        : form.mode === "phone"
          ? "Skambutis"
          : video?.label || "Video";
    const placeEn =
      form.mode === "in_person"
        ? "Room 12"
        : form.mode === "phone"
          ? "Call"
          : video?.label || "Video";

    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData();
      fd.set("patientId", patient.id);
      fd.set("date", date);
      fd.set("time", form.time);
      fd.set("title", title);
      fd.set("reason", reason);
      fd.set("mode", form.mode);
      fd.set("placeLt", placeLt);
      fd.set("placeEn", placeEn);
      if (video?.id) fd.set("videoPlatform", video.id);
      if (video?.url) fd.set("videoUrl", video.url);
      for (const item of pendingFiles) {
        fd.append("file", item.file, item.file.name);
      }

      const res = await fetch("/api/doctor/visits", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        visit?: {
          id: string;
          attachments?: Array<{
            id: string;
            originalName: string;
            sizeBytes: number;
            mimeType: string | null;
            href: string;
          }>;
        };
      };
      if (!res.ok || !data.visit) {
        throw new Error(data.error || `save_failed_${res.status}`);
      }

      const attachments: AppointmentAttachment[] = (
        data.visit.attachments || []
      ).map((a) => ({
        id: a.id,
        name: a.originalName,
        sizeBytes: a.sizeBytes,
        mime: a.mimeType || undefined,
        href: a.href,
      }));

      const appt: DoctorAppointment = {
        id: data.visit.id,
        date,
        time: form.time,
        titleLt: title,
        titleEn: title,
        patientId: patient.id,
        patientNameLt: patient.nameLt,
        patientNameEn: patient.nameEn,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        mode: form.mode,
        status: "upcoming",
        createdByDoctor: true,
        notesLt: reason || undefined,
        notesEn: reason || undefined,
        placeLt,
        placeEn,
        videoPlatform: video?.id,
        videoUrl: video?.url,
        source: { kind: "doctor_created" },
        attachments: attachments.length ? attachments : undefined,
        documents: attachments.map((a) => ({
          id: a.id,
          kind: "other" as const,
          titleLt: a.name,
          titleEn: a.name,
          fileName: a.name,
          href: a.href,
          sizeBytes: a.sizeBytes,
        })),
      };
      addCreatedAppointment(appt);
      onSaved();
    } catch (e) {
      setSaveError(
        locale === "en"
          ? `Could not save visit: ${e instanceof Error ? e.message : "error"}`
          : `Nepavyko išsaugoti vizito: ${
              e instanceof Error ? e.message : "klaida"
            }`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="doctor-cal-form stack" style={{ gap: 12 }}>
      <label className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">{copy.patient}</span>
        {selectedPatient ? (
          <div className="doctor-cal-patient-picked">
            <div>
              <b>
                {locale === "en"
                  ? selectedPatient.nameEn
                  : selectedPatient.nameLt}
              </b>
              <span className="xs muted">
                {selectedPatient.phone}
                {selectedPatient.email
                  ? ` · ${selectedPatient.email}`
                  : ""}
                {selectedPatient.dob ? ` · ${selectedPatient.dob}` : ""}
              </span>
            </div>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setForm((f) => ({ ...f, patientId: "" }));
                setPatientQuery("");
              }}
            >
              {copy.clearPatient}
            </button>
          </div>
        ) : (
          <>
            <input
              type="search"
              value={patientQuery}
              placeholder={copy.patientSearch}
              autoComplete="off"
              onChange={(e) => setPatientQuery(e.target.value)}
            />
            <span className="xs muted">{copy.patientHint}</span>
            {patientQuery.trim().length >= 2 ? (
              patientHits.length ? (
                <ul className="doctor-cal-patient-hits">
                  {patientHits.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, patientId: p.id }));
                          setPatientQuery("");
                        }}
                      >
                        <b>{locale === "en" ? p.nameEn : p.nameLt}</b>
                        <span className="xs muted">
                          {p.phone}
                          {p.email ? ` · ${p.email}` : ""}
                          {p.nationalId ? ` · ${p.nationalId}` : ""}
                          {p.dob ? ` · ${p.dob}` : ""}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty">{copy.noPatients}</div>
              )
            ) : null}
          </>
        )}
      </label>

      <div className="stack" style={{ gap: 6 }}>
        <span className="eyebrow">{copy.freeTimes}</span>
        {freeSlots.length ? (
          <div
            className="doctor-cal-slots"
            role="listbox"
            aria-label={copy.time}
          >
            {freeSlots.map((t) => (
              <button
                key={t}
                type="button"
                role="option"
                aria-selected={form.time === t}
                className={
                  form.time === t ? "doctor-cal-slot on" : "doctor-cal-slot"
                }
                onClick={() => setForm((f) => ({ ...f, time: t }))}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">{copy.noSlots}</div>
        )}
      </div>

      <label className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">{copy.mode}</span>
        <div className="doctor-cal-modes" role="group">
          {(
            [
              ["phone", modeLabel("phone", locale)],
              ["video", modeLabel("video", locale)],
              ["in_person", modeLabel("in_person", locale)],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                form.mode === value ? "doctor-cal-mode on" : "doctor-cal-mode"
              }
              onClick={() => setForm((f) => ({ ...f, mode: value }))}
            >
              {label}
            </button>
          ))}
        </div>
      </label>

      {form.mode === "video" ? (
        <div className="stack" style={{ gap: 6 }}>
          <span className="eyebrow">{copy.videoLinks}</span>
          <div className="doctor-cal-video-links">
            {VIDEO_LINK_OPTIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={
                  form.videoPlatform === v.id
                    ? "doctor-cal-video on"
                    : "doctor-cal-video"
                }
                onClick={() =>
                  setForm((f) => ({ ...f, videoPlatform: v.id }))
                }
              >
                <b>{v.label}</b>
                <span className="xs muted mono">{v.url}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">
          {locale === "en" ? "Title" : "Pavadinimas"}
        </span>
        <input
          value={form.title}
          placeholder={
            locale === "en" ? "e.g. Lipid follow-up" : "pvz. Lipidų kontrolė"
          }
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </label>

      <label className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">{copy.reason}</span>
        <textarea
          className="doctor-cal-reason"
          rows={5}
          value={form.reason}
          placeholder={copy.reasonHint}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
        />
      </label>

      <div className="stack" style={{ gap: 6 }}>
        <span className="eyebrow">{copy.attach}</span>
        <div className="doctor-cal-attach-row">
          <input
            ref={fileRef}
            type="file"
            multiple
            id="doctor-visit-attach"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              border: 0,
            }}
            onChange={(e) => onPickFiles(e.target.files)}
          />
          <label htmlFor="doctor-visit-attach" className="btn ghost sm">
            {copy.attach}
          </label>
          <span className="xs muted">{copy.attachHint}</span>
        </div>
        {pendingFiles.length ? (
          <ul className="doctor-cal-attach-list">
            {pendingFiles.map((f) => (
              <li key={f.id}>
                <span>
                  <b>{f.file.name}</b>
                  <span className="xs muted">
                    {" "}
                    · {(f.file.size / 1024).toFixed(1)} KB
                  </span>
                </span>
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() =>
                    setPendingFiles((prev) =>
                      prev.filter((x) => x.id !== f.id)
                    )
                  }
                >
                  {copy.removeFile}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {saveError ? <div className="empty">{saveError}</div> : null}

      <div className="row" style={{ gap: 8 }}>
        <button
          type="button"
          className="btn"
          disabled={!canSave}
          onClick={() => void saveVisit()}
        >
          {saving
            ? locale === "en"
              ? "Saving…"
              : "Saugoma…"
            : copy.save}
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={saving}
          onClick={onCancel}
        >
          {copy.cancel}
        </button>
      </div>
    </div>
  );
}
