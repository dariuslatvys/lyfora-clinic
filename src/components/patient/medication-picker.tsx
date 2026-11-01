"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  formatMedicationLabel,
  searchMedications,
  type MedicationSuggestion,
} from "@/lib/health/medications";

export function MedicationPicker({
  value,
  disabled,
  locale,
  onChange,
}: {
  value: string[];
  disabled: boolean;
  locale: "lt" | "en";
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = useMemo(
    () => searchMedications(draft, 12),
    [draft]
  );

  useEffect(() => {
    setActive(0);
  }, [draft]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function add(label: string) {
    const t = label.trim();
    if (!t) return;
    if (!value.some((v) => v.toLowerCase() === t.toLowerCase())) {
      onChange([...value, t]);
    }
    setDraft("");
    setOpen(false);
  }

  function addSuggestion(s: MedicationSuggestion) {
    add(formatMedicationLabel(s));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[active]) {
        addSuggestion(suggestions[active]!);
      } else if (draft.trim()) {
        add(draft.trim());
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const hint =
    locale === "en"
      ? "Type brand or what it’s for (e.g. Tez, Asp, blood pressure)…"
      : "Įveskite pavadinimą arba nuo ko (pvz. Tez, Asp, kraujospūdis)…";

  return (
    <div className="stack med-picker" style={{ gap: 8 }} ref={rootRef}>
      <div className="q-chips">
        {value.map((v) => (
          <button
            key={v}
            type="button"
            className="chip on"
            disabled={disabled}
            onClick={() => onChange(value.filter((x) => x !== v))}
          >
            {v} ×
          </button>
        ))}
      </div>

      {!disabled ? (
        <div className="med-picker-field">
          <input
            value={draft}
            placeholder={hint}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open && suggestions.length > 0}
            aria-controls={listId}
            role="combobox"
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {open && draft.trim().length >= 2 ? (
            <div className="med-suggest" id={listId} role="listbox">
              {suggestions.length ? (
                suggestions.map((s, i) => (
                  <button
                    key={`${s.brandName}-${s.atcCode}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={i === active ? "on" : undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => addSuggestion(s)}
                  >
                    <span className="med-suggest-main">
                      <b>{s.brandName}</b>
                      {s.activeSubstance ? (
                        <em>{s.activeSubstance}</em>
                      ) : null}
                    </span>
                    <span className="med-suggest-meta">
                      {s.categoryName}
                      {s.form ? ` · ${s.form}` : ""}
                    </span>
                  </button>
                ))
              ) : (
                <div className="med-suggest-empty">
                  {locale === "en"
                    ? `No catalogue match — press Enter to add “${draft.trim()}”`
                    : `Kataloge nerasta — Enter pridės „${draft.trim()}“`}
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
