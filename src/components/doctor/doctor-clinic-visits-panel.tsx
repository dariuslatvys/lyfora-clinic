import {
  formatClinicVisitWhen,
  listClinicVisitAttachments,
  listClinicVisitsForPatient,
  type ClinicVisitRecord,
} from "@/lib/health/clinic-visits";

function modeLabel(mode: string, locale: "lt" | "en") {
  if (locale === "en") {
    return mode === "video" ? "Video" : mode === "phone" ? "Call" : "In person";
  }
  return mode === "video" ? "Video" : mode === "phone" ? "Skambutis" : "Gyvai";
}

export function DoctorClinicVisitsPanel({
  locale,
  patientId,
}: {
  locale: "lt" | "en";
  patientId: string;
}) {
  const visits = listClinicVisitsForPatient(patientId);
  const copy =
    locale === "en"
      ? {
          title: "Clinic visits & attached files",
          blurb:
            "Visits created in the calendar or workday, with reason notes and files shared to the patient portal.",
          empty: "No clinic-created visits for this patient yet.",
          reason: "Reason",
          files: "Files",
          open: "Open",
        }
      : {
          title: "Klinikinės registracijos ir failai",
          blurb:
            "Vizitai, sukurti kalendoriuje ar darbo dienoje — priežastis ir failai matomi ir paciento portale.",
          empty: "Šiam pacientui klinikinės registracijos dar nėra.",
          reason: "Priežastis",
          files: "Failai",
          open: "Atidaryti",
        };

  return (
    <section className="card" id="clinic-visits">
      <div className="card-head">
        <div>
          <h3 className="m-0">{copy.title}</h3>
          <p className="small muted m-0 mt-1">{copy.blurb}</p>
        </div>
        <span className="pill plain c-acc">{visits.length}</span>
      </div>
      {visits.length ? (
        <div className="stack" style={{ gap: 10 }}>
          {visits.map((v) => (
            <ClinicVisitCard
              key={v.id}
              locale={locale}
              visit={v}
              copy={copy}
            />
          ))}
        </div>
      ) : (
        <div className="empty">{copy.empty}</div>
      )}
    </section>
  );
}

function ClinicVisitCard({
  locale,
  visit,
  copy,
}: {
  locale: "lt" | "en";
  visit: ClinicVisitRecord;
  copy: {
    reason: string;
    files: string;
    open: string;
  };
}) {
  const files = listClinicVisitAttachments(visit.patientId, visit.id);
  return (
    <div className="doctor-appt-source-card stack" style={{ gap: 8 }}>
      <div>
        <b>{locale === "en" ? visit.titleEn : visit.titleLt}</b>
        <p className="small muted m-0 mt-1">
          {formatClinicVisitWhen(visit, locale)} ·{" "}
          {modeLabel(visit.mode, locale)}
          {visit.placeLt
            ? ` · ${locale === "en" ? visit.placeEn : visit.placeLt}`
            : ""}
        </p>
      </div>
      {visit.reasonLt || visit.reasonEn ? (
        <div>
          <span className="eyebrow">{copy.reason}</span>
          <p className="small m-0 mt-1">
            {locale === "en" ? visit.reasonEn : visit.reasonLt}
          </p>
        </div>
      ) : null}
      {files.length ? (
        <div>
          <span className="eyebrow">{copy.files}</span>
          <ul className="doctor-appt-docs mt-1">
            {files.map((f) => (
              <li key={f.id}>
                <div>
                  <b>{f.originalName}</b>
                  <span className="xs muted"> · {f.sizeLabel}</span>
                </div>
                <a
                  href={f.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn ghost sm"
                >
                  {copy.open}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
