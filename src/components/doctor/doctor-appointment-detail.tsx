"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  documentKindLabel,
  listAppointmentDocuments,
  modeLabel,
  statusLabel,
  type DoctorAppointment,
  type DoctorPatientOption,
} from "@/lib/doctor/doctor-calendar";
import type { DoctorVisitCopy } from "@/components/doctor/doctor-visit-copy";

export function DoctorAppointmentDetail({
  locale,
  a,
  patients,
  copy,
  onBack,
}: {
  locale: "lt" | "en";
  a: DoctorAppointment;
  patients: DoctorPatientOption[];
  copy: DoctorVisitCopy;
  onBack: () => void;
}) {
  const source = a.source;
  const linked = a.patientId
    ? patients.find((p) => p.id === a.patientId)
    : null;
  const phone = a.patientPhone || linked?.phone || "";
  const email = a.patientEmail || linked?.email || "";
  const docs = listAppointmentDocuments(a);
  const sourceLabel =
    !source || source.kind === "doctor_created"
      ? copy.doctorCreated
      : source.kind === "referral"
        ? copy.referral
        : source.self.channel === "phone"
          ? copy.selfPhone
          : source.self.channel === "portal"
            ? copy.selfPortal
            : copy.selfWalkIn;

  return (
    <div className="doctor-appt-detail stack" style={{ gap: 12 }}>
      <div className="row between" style={{ alignItems: "center" }}>
        <button type="button" className="btn ghost sm" onClick={onBack}>
          ← {copy.backDay}
        </button>
        {a.patientId ? (
          <Link
            href={`/doctor/patients/${a.patientId}`}
            className="btn ghost sm"
          >
            {copy.chart}
          </Link>
        ) : null}
      </div>

      <div>
        <span className="eyebrow">{copy.detail}</span>
        <h3 className="m-0 mt-1">
          {locale === "en" ? a.titleEn : a.titleLt}
        </h3>
        <p className="small muted m-0 mt-1">
          {a.date} · {a.time} · {modeLabel(a.mode, locale)}
          {a.placeLt
            ? ` · ${locale === "en" ? a.placeEn : a.placeLt}`
            : ""}
        </p>
      </div>

      <div className="doctor-appt-contact">
        <span className="eyebrow">{copy.contact}</span>
        <b className="block mt-1">
          {locale === "en" ? a.patientNameEn : a.patientNameLt}
        </b>
        <div className="stack mt-2" style={{ gap: 4 }}>
          <span className="small">
            <span className="muted">{copy.phone}: </span>
            {phone ? (
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            ) : (
              "—"
            )}
          </span>
          <span className="small">
            <span className="muted">{copy.email}: </span>
            {email ? <a href={`mailto:${email}`}>{email}</a> : "—"}
          </span>
        </div>
      </div>

      <div className="doctor-appt-detail-meta">
        <span className="detail-chip">
          {copy.source}: {sourceLabel}
        </span>
        <span
          className={`pill ${
            a.status === "upcoming"
              ? "c-acc"
              : a.status === "missed" || a.status === "cancelled"
                ? "c-none"
                : "c-green"
          }`}
        >
          {statusLabel(a.status, locale)}
        </span>
      </div>

      {a.mode === "video" && a.videoUrl ? (
        <a
          href={a.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="btn ghost sm"
          style={{ alignSelf: "flex-start" }}
        >
          {a.videoPlatform === "meet"
            ? "Google Meet"
            : a.videoPlatform === "zoom"
              ? "Zoom"
              : a.videoPlatform === "teams"
                ? "Teams"
                : a.videoUrl}
        </a>
      ) : null}

      {source?.kind === "referral" ? (
        <ReferralBlock locale={locale} r={source.referral} copy={copy} />
      ) : null}

      {source?.kind === "self" ? (
        <SelfRegBlock locale={locale} s={source.self} copy={copy} />
      ) : null}

      {!source || source.kind === "doctor_created" ? (
        <div className="doctor-appt-source-card">
          <p className="small m-0">
            {locale === "en"
              ? "This visit was created in the doctor calendar."
              : "Šis vizitas sukurtas gydytojo kalendoriuje."}
          </p>
          {a.notesLt || a.notesEn ? (
            <p className="small muted m-0 mt-2">
              {locale === "en" ? a.notesEn : a.notesLt}
            </p>
          ) : null}
        </div>
      ) : null}

      <DocumentsBlock locale={locale} docs={docs} copy={copy} />

      {a.attachments?.length ? (
        <div className="doctor-appt-source-card stack" style={{ gap: 8 }}>
          <span className="eyebrow">{copy.attachments}</span>
          <ul className="doctor-appt-docs">
            {a.attachments.map((f) => (
              <li key={f.id}>
                <div>
                  <b>{f.name}</b>
                  <span className="xs muted">
                    {formatBytes(f.sizeBytes)}
                    {f.mime ? ` · ${f.mime}` : ""}
                  </span>
                </div>
                {f.href ? (
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noreferrer"
                    className="btn ghost sm"
                  >
                    {copy.openFile}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function DocumentsBlock({
  locale,
  docs,
  copy,
}: {
  locale: "lt" | "en";
  docs: ReturnType<typeof listAppointmentDocuments>;
  copy: DoctorVisitCopy;
}) {
  return (
    <div className="doctor-appt-source-card stack" style={{ gap: 8 }}>
      <span className="eyebrow">{copy.documents}</span>
      {docs.length ? (
        <ul className="doctor-appt-docs">
          {docs.map((d) => (
            <li key={d.id}>
              <div>
                <span className="pill c-acc xs">
                  {documentKindLabel(d.kind, locale)}
                </span>
                <b className="block mt-1">
                  {locale === "en" ? d.titleEn : d.titleLt}
                </b>
                <span className="xs muted">
                  {[d.issuedAt, d.fileName].filter(Boolean).join(" · ")}
                </span>
              </div>
              {d.href ? (
                <a
                  href={d.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn ghost sm"
                >
                  {d.kind === "referral" ? copy.openPdf : copy.openFile}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="small muted m-0">{copy.noDocuments}</p>
      )}
    </div>
  );
}

function ReferralBlock({
  locale,
  r,
  copy,
}: {
  locale: "lt" | "en";
  r: NonNullable<
    Extract<DoctorAppointment["source"], { kind: "referral" }>
  >["referral"];
  copy: DoctorVisitCopy;
}) {
  return (
    <div className="doctor-appt-source-card stack" style={{ gap: 10 }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <span className="eyebrow">{copy.referral}</span>
          <b className="block mt-1">
            {locale === "en" ? r.documentTypeEn : r.documentTypeLt}
          </b>
          <span className="xs muted">
            {new Date(r.issuedAt).toLocaleString(
              locale === "en" ? "en-GB" : "lt-LT"
            )}
            {" · "}
            {locale === "en" ? r.urgencyEn : r.urgencyLt}
          </span>
        </div>
        {r.pdfHref ? (
          <a
            href={r.pdfHref}
            target="_blank"
            rel="noreferrer"
            className="btn sm"
          >
            {copy.openPdf}
          </a>
        ) : null}
      </div>

      <DetailField label={copy.institution}>
        <b>{locale === "en" ? r.institutionEn : r.institutionLt}</b>
        {r.institutionCode ? (
          <span className="xs muted"> · įm. kodas {r.institutionCode}</span>
        ) : null}
        <div className="xs muted">
          {locale === "en"
            ? r.institutionAddressEn
            : r.institutionAddressLt}
          {r.institutionPhone ? ` · ${r.institutionPhone}` : ""}
          {r.institutionEmail ? ` · ${r.institutionEmail}` : ""}
        </div>
      </DetailField>

      <DetailField label={copy.referringDoctor}>
        <b>
          {locale === "en" ? r.referringDoctorEn : r.referringDoctorLt}
        </b>
        <div className="xs muted">
          {locale === "en"
            ? r.referringSpecialtyEn
            : r.referringSpecialtyLt}
          {r.referringStamp ? ` · spaudo nr. ${r.referringStamp}` : ""}
        </div>
      </DetailField>

      <DetailField label={copy.specialty}>
        {locale === "en" ? r.toSpecialtyEn : r.toSpecialtyLt}
      </DetailField>
      <DetailField label={copy.purpose}>
        {locale === "en" ? r.purposeEn : r.purposeLt}
      </DetailField>
      <DetailField label={copy.reasonWhy}>
        {locale === "en" ? r.reasonEn : r.reasonLt}
      </DetailField>
      <DetailField label={copy.diagnosis}>
        {r.diagnosisCode ? <code className="mono">{r.diagnosisCode}</code> : null}
        {r.diagnosisCode ? " · " : ""}
        {locale === "en" ? r.diagnosisEn : r.diagnosisLt}
      </DetailField>
      <DetailField label={copy.complaints}>
        {locale === "en" ? r.complaintsEn : r.complaintsLt}
      </DetailField>
      {r.anamnesisLt || r.anamnesisEn ? (
        <DetailField label={copy.anamnesis}>
          {locale === "en" ? r.anamnesisEn : r.anamnesisLt}
        </DetailField>
      ) : null}
    </div>
  );
}

function SelfRegBlock({
  locale,
  s,
  copy,
}: {
  locale: "lt" | "en";
  s: NonNullable<
    Extract<DoctorAppointment["source"], { kind: "self" }>
  >["self"];
  copy: DoctorVisitCopy;
}) {
  const channelLabel =
    s.channel === "phone"
      ? copy.selfPhone
      : s.channel === "portal"
        ? copy.selfPortal
        : copy.selfWalkIn;
  return (
    <div className="doctor-appt-source-card stack" style={{ gap: 10 }}>
      <div>
        <span className="eyebrow">{channelLabel}</span>
        <p className="small muted m-0 mt-1">
          {copy.registeredAt}:{" "}
          {new Date(s.registeredAt).toLocaleString(
            locale === "en" ? "en-GB" : "lt-LT"
          )}
        </p>
      </div>
      <DetailField label={copy.complaints}>
        {locale === "en" ? s.complaintsEn : s.complaintsLt}
      </DetailField>
      {s.notesLt || s.notesEn ? (
        <DetailField label={locale === "en" ? "Notes" : "Pastabos"}>
          {locale === "en" ? s.notesEn : s.notesLt}
        </DetailField>
      ) : null}
      {s.receivedByLt || s.receivedByEn ? (
        <DetailField label={copy.receivedBy}>
          {locale === "en" ? s.receivedByEn : s.receivedByLt}
        </DetailField>
      ) : null}
    </div>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="doctor-appt-field">
      <span className="eyebrow">{label}</span>
      <div className="small m-0 mt-1">{children}</div>
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
