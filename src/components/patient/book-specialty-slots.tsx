"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BookableSlot = {
  id: string;
  when: string;
  title: string;
  doctor: string;
  place: string;
  href: string;
};

export function BookSpecialtySlots({
  locale,
  specialtyLabel,
  buttonLabel,
  slots,
  hint,
}: {
  locale: "lt" | "en";
  specialtyLabel: string;
  buttonLabel: string;
  slots: BookableSlot[];
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const title = useMemo(
    () =>
      locale === "en"
        ? `Available ${specialtyLabel} times`
        : `Galimi ${specialtyLabel} laikai`,
    [locale, specialtyLabel]
  );

  return (
    <div className="book-slots">
      <button
        type="button"
        className="btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {buttonLabel}
      </button>
      {hint ? <p className="book-slots-hint">{hint}</p> : null}
      {open ? (
        <div className="book-slots-panel" role="dialog" aria-label={title}>
          <div className="row between" style={{ alignItems: "baseline" }}>
            <h3 className="m-0 text-base font-semibold">{title}</h3>
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => setOpen(false)}
            >
              {locale === "en" ? "Close" : "Uždaryti"}
            </button>
          </div>
          {slots.length ? (
            <div className="list" style={{ marginTop: 10 }}>
              {slots.map((s) => (
                <Link key={s.id} href={s.href} className="li click">
                  <div className="grow">
                    <b>{s.when}</b>
                    <span className="xs muted">
                      {s.doctor} · {s.place}
                    </span>
                  </div>
                  <span className="small" style={{ color: "var(--accent)" }}>
                    {locale === "en" ? "Open" : "Atverti"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ marginTop: 10 }}>
              {locale === "en"
                ? "No open slots right now."
                : "Laisvų laikų šiuo metu nėra."}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
