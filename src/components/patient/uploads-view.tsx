"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type UploadRow = {
  id: string;
  category: string;
  originalName: string;
  sizeLabel: string;
  mimeType: string | null;
  note: string | null;
  createdAt: string;
  href: string;
};

const CATS: { id: string; lt: string; en: string }[] = [
  { id: "labs", lt: "Tyrimai / PDF", en: "Labs / PDF" },
  { id: "vaccines", lt: "Skiepai", en: "Vaccines" },
  { id: "genetics", lt: "Genetika (VCF/SNP)", en: "Genetics (VCF/SNP)" },
  { id: "imaging", lt: "Vaizdiniai tyrimai", en: "Imaging" },
  { id: "other", lt: "Kita", en: "Other" },
];

export function UploadsView({ locale }: { locale: "lt" | "en" }) {
  const [category, setCategory] = useState("labs");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/patient/uploads", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { uploads: UploadRow[] };
    setRows(data.uploads || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("category", category);
        if (note.trim()) fd.set("note", note.trim());
        const res = await fetch("/api/patient/uploads", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(j.error || `upload_failed_${res.status}`);
        }
      }
      setMsg(
        locale === "en"
          ? `Uploaded ${files.length} file(s).`
          : `Įkelta failų: ${files.length}.`
      );
      setNote("");
      await load();
    } catch (e) {
      setErr(
        locale === "en"
          ? `Upload failed: ${e instanceof Error ? e.message : "error"}`
          : `Nepavyko įkelti: ${e instanceof Error ? e.message : "klaida"}`
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <header>
        <p className="eyebrow">
          {locale === "en" ? "Your files" : "Jūsų failai"}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] m-0">
          {locale === "en" ? "Data upload" : "Duomenų įkėlimas"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] mb-0">
          {locale === "en"
            ? "Upload lab PDFs, vaccine records, genetics files or imaging. Files stay in your clinic profile."
            : "Įkelkite tyrimų PDF, skiepų įrašus, genetikos failus ar vaizdinius tyrimus. Failai lieka jūsų klinikos profilyje."}
        </p>
      </header>

      <section className="card">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
          {locale === "en" ? "New upload" : "Naujas įkėlimas"}
        </h2>
        <p className="small muted mt-1 mb-3">
          {locale === "en"
            ? "Choose a category, then drop or pick files (PDF, images, VCF/TXT up to 25 MB)."
            : "Pasirinkite kategoriją, tada vilkite ar pasirinkite failus (PDF, paveikslėliai, VCF/TXT iki 25 MB)."}
        </p>

        <div className="upload-cats mb-3">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`upload-cat${category === c.id ? " on" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              <b>{locale === "en" ? c.en : c.lt}</b>
            </button>
          ))}
        </div>

        <label className="eyebrow" htmlFor="upload-note">
          {locale === "en" ? "Note (optional)" : "Pastaba (nebūtina)"}
        </label>
        <input
          id="upload-note"
          className="mt-1 mb-3 w-full rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            locale === "en"
              ? "e.g. Lipid panel from May 2026"
              : "pvz. Lipidų panelė 2026-05"
          }
        />

        <div
          className="upload-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void onFiles(e.dataTransfer.files);
          }}
        >
          <p className="m-0 font-semibold">
            {locale === "en"
              ? "Drop files here or browse"
              : "Tempkite failus čia arba pasirinkite"}
          </p>
          <p className="small muted mt-1 mb-3">
            {locale === "en"
              ? `Category: ${CATS.find((c) => c.id === category)?.en}`
              : `Kategorija: ${CATS.find((c) => c.id === category)?.lt}`}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.vcf,.txt,.csv"
            className="mx-auto block"
            disabled={busy}
            onChange={(e) => void onFiles(e.target.files)}
          />
          {busy ? (
            <p className="small muted mt-3 mb-0">
              {locale === "en" ? "Uploading…" : "Įkeliama…"}
            </p>
          ) : null}
          {msg ? <p className="small mt-3 mb-0 text-[var(--accent)]">{msg}</p> : null}
          {err ? <p className="small mt-3 mb-0" style={{ color: "#c45c4a" }}>{err}</p> : null}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold m-0">
            {locale === "en" ? "Uploaded files" : "Įkelti failai"}
          </h2>
          <span className="pill plain c-acc">{rows.length}</span>
        </div>
        {rows.length ? (
          <div className="list mt-2">
            {rows.map((r) => (
              <a
                key={r.id}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="li click"
              >
                <div className="grow">
                  <b>{r.originalName}</b>
                  <span className="small muted">
                    {CATS.find((c) => c.id === r.category)
                      ? locale === "en"
                        ? CATS.find((c) => c.id === r.category)!.en
                        : CATS.find((c) => c.id === r.category)!.lt
                      : r.category}
                    {" · "}
                    {r.sizeLabel}
                    {" · "}
                    {new Date(r.createdAt).toLocaleString(
                      locale === "en" ? "en-GB" : "lt-LT"
                    )}
                  </span>
                  {r.note ? (
                    <span className="small muted">{r.note}</span>
                  ) : null}
                </div>
                <span className="pill c-none">
                  {locale === "en" ? "Open" : "Atidaryti"}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="empty mt-3">
            {locale === "en"
              ? "No files yet — upload your first document above."
              : "Failų dar nėra — įkelkite pirmą dokumentą aukščiau."}
          </div>
        )}
      </section>

      <div className="row" style={{ gap: 8 }}>
        <Link href="/patient/health-card" className="btn ghost">
          {locale === "en" ? "Health record" : "Sveikatos kortelė"}
        </Link>
        <Link href="/patient/labs" className="btn ghost">
          {locale === "en" ? "Labs" : "Tyrimai"}
        </Link>
      </div>
    </div>
  );
}
