"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  STEP_TITLE_LT,
  computeBmi,
  conditionsForSex,
  type QDefinition,
  type QField,
  type QuestionnaireAnswers,
  type FamilyMember,
  visibleFieldsForStep,
  completionStats,
  biologicalSex,
} from "@/lib/health/questionnaire";

type Mode = "edit" | "view";

function uid() {
  return `fm_${Math.random().toString(36).slice(2, 9)}`;
}

export function QuestionnaireForm({
  locale,
  initialDefinition,
  initialAnswers,
}: {
  locale: "lt" | "en";
  initialDefinition: QDefinition;
  initialAnswers: QuestionnaireAnswers;
}) {
  const def = initialDefinition;
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers);
  const [stepIdx, setStepIdx] = useState(0);
  const [mode, setMode] = useState<Mode>(
    initialAnswers.updatedAt ? "view" : "edit"
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(
    initialAnswers.updatedAt
  );
  const [error, setError] = useState<string | null>(null);

  const sex = biologicalSex(answers, def);
  const steps = useMemo(() => {
    return def.steps.filter((s) => {
      if (s.title.startsWith("6.")) return sex === "Female";
      return true;
    });
  }, [def.steps, sex]);

  useEffect(() => {
    if (stepIdx >= steps.length) setStepIdx(Math.max(0, steps.length - 1));
  }, [steps.length, stepIdx]);

  const step = steps[stepIdx];
  const fields = step
    ? visibleFieldsForStep(def, step.title, answers)
    : [];
  const stats = completionStats(def, answers);

  const setValue = useCallback((id: string, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      values: { ...prev.values, [id]: value },
    }));
  }, []);

  // Keep BMI in sync
  useEffect(() => {
    const bmiField = def.fields.find((f) => f.label === "BMI");
    if (!bmiField) return;
    const bmi = computeBmi(answers, def);
    if (bmi != null && answers.values[bmiField.id] !== bmi) {
      setValue(bmiField.id, bmi);
    }
  }, [answers, def, setValue]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/patient/questionnaire", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("save failed");
      const data = (await res.json()) as { answers: QuestionnaireAnswers };
      setAnswers(data.answers);
      setSavedAt(data.answers.updatedAt);
      setMode("view");
    } catch {
      setError(
        locale === "en"
          ? "Could not save. Please try again."
          : "Nepavyko išsaugoti. Bandykite dar kartą."
      );
    } finally {
      setSaving(false);
    }
  }

  function stepTitle(title: string) {
    if (locale === "lt") return STEP_TITLE_LT[title] || title;
    return title;
  }

  return (
    <div className="stack q-wrap" style={{ gap: 14 }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <Link href="/patient/health-card" className="text-sm text-[var(--muted)]">
            ← {locale === "en" ? "Health record" : "Sveikatos kortelė"}
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-2 mb-1">
            {locale === "en" ? "Health questionnaire" : "Sveikatos klausimynas"}
          </h1>
          <p className="small muted m-0">
            {locale === "en"
              ? `Completion ${stats.percent}% · ${stats.filled}/${stats.required} required fields`
              : `Užpildyta ${stats.percent}% · ${stats.filled}/${stats.required} privalomi laukai`}
            {savedAt
              ? ` · ${locale === "en" ? "Saved" : "Išsaugota"} ${new Date(
                  savedAt
                ).toLocaleString(locale === "en" ? "en-GB" : "lt-LT")}`
              : ""}
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {mode === "view" ? (
            <button type="button" className="btn" onClick={() => setMode("edit")}>
              {locale === "en" ? "Edit" : "Redaguoti"}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving
                ? locale === "en"
                  ? "Saving…"
                  : "Saugoma…"
                : locale === "en"
                  ? "Save"
                  : "Išsaugoti"}
            </button>
          )}
        </div>
      </div>

      <div className="q-progress">
        <i style={{ width: `${stats.percent}%` }} />
      </div>

      <div className="q-steps" role="tablist">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            className={i === stepIdx ? "on" : undefined}
            onClick={() => setStepIdx(i)}
          >
            <span className="q-step-num">{i + 1}</span>
            <span className="q-step-label">{stepTitle(s.title)}</span>
          </button>
        ))}
      </div>

      {error ? <p className="q-error">{error}</p> : null}

      {step ? (
        <section className="card q-panel">
          <div className="card-head">
            <h2>{stepTitle(step.title)}</h2>
            <span className="small muted">
              {stepIdx + 1} / {steps.length}
            </span>
          </div>

          <div className="stack" style={{ gap: 16 }}>
            {fields.map((f) => (
              <FieldRenderer
                key={f.id}
                field={f}
                def={def}
                answers={answers}
                mode={mode}
                locale={locale}
                sex={sex}
                onChange={setValue}
                onAnswers={setAnswers}
              />
            ))}

            {step.title.startsWith("2.") ? (
              <ConditionDetailsBlock
                def={def}
                answers={answers}
                mode={mode}
                locale={locale}
                onAnswers={setAnswers}
              />
            ) : null}

            {step.title.startsWith("10.") ? (
              <FamilyHistoryBlock
                def={def}
                answers={answers}
                mode={mode}
                locale={locale}
                onAnswers={setAnswers}
              />
            ) : null}
          </div>

          <div className="row between" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn ghost"
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            >
              {locale === "en" ? "Back" : "Atgal"}
            </button>
            <div className="row" style={{ gap: 8 }}>
              {mode === "edit" ? (
                <button
                  type="button"
                  className="btn ghost"
                  disabled={saving}
                  onClick={() => void save()}
                >
                  {locale === "en" ? "Save draft" : "Išsaugoti juodraštį"}
                </button>
              ) : null}
              {stepIdx < steps.length - 1 ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => setStepIdx((i) => i + 1)}
                >
                  {locale === "en" ? "Next" : "Toliau"}
                </button>
              ) : mode === "edit" ? (
                <button
                  type="button"
                  className="btn"
                  disabled={saving}
                  onClick={() => void save()}
                >
                  {locale === "en" ? "Save & finish" : "Išsaugoti ir baigti"}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function FieldRenderer({
  field,
  def,
  answers,
  mode,
  locale,
  sex,
  onChange,
  onAnswers,
}: {
  field: QField;
  def: QDefinition;
  answers: QuestionnaireAnswers;
  mode: Mode;
  locale: "lt" | "en";
  sex: string | null;
  onChange: (id: string, value: unknown) => void;
  onAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
}) {
  const readOnly = mode === "view" || field.auto;
  const value = answers.values[field.id];

  if (field.section === "Cancer details") {
    return (
      <CancerBlock
        field={field}
        answers={answers}
        mode={mode}
        locale={locale}
        def={def}
        onAnswers={onAnswers}
      />
    );
  }

  return (
    <label className="q-field">
      <span className="q-label">
        {field.label}
        {field.required ? <em>*</em> : null}
        {field.unit ? <span className="q-unit">{field.unit}</span> : null}
      </span>
      {field.notes ? <span className="q-hint">{field.notes}</span> : null}

      {field.type === "select" || field.type === "select_list" ? (
        <select
          disabled={readOnly}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value || null)}
        >
          <option value="">
            {locale === "en" ? "Select…" : "Pasirinkite…"}
          </option>
          {(field.type === "select_list" && field.listRef
            ? def.lists[field.listRef] && !def.lists[field.listRef]!.grouped
              ? (def.lists[field.listRef] as { items: string[] }).items
              : []
            : field.options || []
          ).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "number" || field.type === "year" ? (
        <input
          type="number"
          disabled={readOnly}
          value={value == null ? "" : String(value)}
          min={field.type === "year" ? 1920 : undefined}
          max={field.type === "year" ? new Date().getFullYear() : undefined}
          onChange={(e) =>
            onChange(
              field.id,
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        />
      ) : null}

      {field.type === "calculated" ? (
        <input type="text" disabled value={value == null ? "—" : String(value)} />
      ) : null}

      {field.type === "text" || field.type === "yes_no_details" ? (
        <textarea
          disabled={readOnly}
          rows={2}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      ) : null}

      {field.type === "blood_pressure" ? (
        <div className="row" style={{ gap: 8 }}>
          <input
            type="number"
            placeholder="SYS"
            disabled={readOnly}
            value={
              value && typeof value === "object" && "sys" in (value as object)
                ? String((value as { sys?: number }).sys ?? "")
                : ""
            }
            onChange={(e) => {
              const cur =
                value && typeof value === "object"
                  ? (value as { sys?: number; dia?: number })
                  : {};
              onChange(field.id, {
                ...cur,
                sys: e.target.value === "" ? undefined : Number(e.target.value),
              });
            }}
          />
          <span className="muted">/</span>
          <input
            type="number"
            placeholder="DIA"
            disabled={readOnly}
            value={
              value && typeof value === "object" && "dia" in (value as object)
                ? String((value as { dia?: number }).dia ?? "")
                : ""
            }
            onChange={(e) => {
              const cur =
                value && typeof value === "object"
                  ? (value as { sys?: number; dia?: number })
                  : {};
              onChange(field.id, {
                ...cur,
                dia: e.target.value === "" ? undefined : Number(e.target.value),
              });
            }}
          />
          <span className="small muted">mmHg</span>
        </div>
      ) : null}

      {field.type === "tags" ? (
        <TagsInput
          disabled={readOnly}
          value={Array.isArray(value) ? (value as string[]) : []}
          locale={locale}
          onChange={(next) => onChange(field.id, next)}
        />
      ) : null}

      {field.type === "multiselect" ? (
        <MultiSelect
          disabled={readOnly}
          value={Array.isArray(value) ? (value as string[]) : []}
          options={
            field.label === "Medical conditions"
              ? []
              : field.options ||
                (field.listRef && def.lists[field.listRef]
                  ? def.lists[field.listRef]!.grouped
                    ? (
                        def.lists[field.listRef] as {
                          groups: { items: string[] }[];
                        }
                      ).groups.flatMap((g) => g.items)
                    : (def.lists[field.listRef] as { items: string[] }).items
                  : [])
          }
          grouped={
            field.label === "Medical conditions"
              ? conditionsForSex(def, sex)
              : field.listRef && def.lists[field.listRef]?.grouped
                ? def.lists[field.listRef]
                : null
          }
          onChange={(next) => onChange(field.id, next)}
        />
      ) : null}
    </label>
  );
}

function MultiSelect({
  value,
  options,
  grouped,
  disabled,
  onChange,
}: {
  value: string[];
  options: string[];
  grouped: ReturnType<typeof conditionsForSex> | QDefinition["lists"][string] | null;
  disabled: boolean;
  onChange: (next: string[]) => void;
}) {
  function toggle(item: string) {
    if (disabled) return;
    if (value.includes(item)) onChange(value.filter((x) => x !== item));
    else onChange([...value, item]);
  }

  if (grouped && grouped.grouped) {
    return (
      <div className="q-multi">
        {grouped.groups.map((g) => (
          <div key={g.name} className="q-multi-group">
            <div className="q-multi-title">{g.name}</div>
            <div className="q-chips">
              {g.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={disabled}
                  className={value.includes(item) ? "chip on" : "chip"}
                  onClick={() => toggle(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="q-chips">
      {options.map((item) => (
        <button
          key={item}
          type="button"
          disabled={disabled}
          className={value.includes(item) ? "chip on" : "chip"}
          onClick={() => toggle(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function TagsInput({
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
  function add() {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  }
  return (
    <div className="stack" style={{ gap: 8 }}>
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
        <div className="row" style={{ gap: 8 }}>
          <input
            value={draft}
            placeholder={
              locale === "en"
                ? "Type name and press Add"
                : "Įrašykite pavadinimą ir spauskite Pridėti"
            }
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" className="btn ghost sm" onClick={add}>
            {locale === "en" ? "Add" : "Pridėti"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ConditionDetailsBlock({
  def,
  answers,
  mode,
  locale,
  onAnswers,
}: {
  def: QDefinition;
  answers: QuestionnaireAnswers;
  mode: Mode;
  locale: "lt" | "en";
  onAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
}) {
  const condField = def.fields.find((f) => f.label === "Medical conditions");
  const selected = condField
    ? ((answers.values[condField.id] as string[]) || [])
    : [];
  if (!selected.length) return null;
  const readOnly = mode === "view";

  return (
    <div className="stack q-cond" style={{ gap: 10 }}>
      <h3 className="overview-subhead">
        {locale === "en"
          ? "Details for selected conditions"
          : "Pasirinktų ligų detalės"}
      </h3>
      {selected.map((name) => {
        const d = answers.conditionDetails[name] || {};
        return (
          <div key={name} className="q-cond-card">
            <b>{name}</b>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <select
                disabled={readOnly}
                value={d.status || ""}
                onChange={(e) =>
                  onAnswers((prev) => ({
                    ...prev,
                    conditionDetails: {
                      ...prev.conditionDetails,
                      [name]: { ...d, status: e.target.value },
                    },
                  }))
                }
              >
                <option value="">
                  {locale === "en" ? "Status…" : "Statusas…"}
                </option>
                <option value="Current">Current</option>
                <option value="Past">Past</option>
              </select>
              <input
                type="number"
                disabled={readOnly}
                placeholder="YYYY"
                value={d.year || ""}
                onChange={(e) =>
                  onAnswers((prev) => ({
                    ...prev,
                    conditionDetails: {
                      ...prev.conditionDetails,
                      [name]: { ...d, year: e.target.value },
                    },
                  }))
                }
              />
              <input
                disabled={readOnly}
                placeholder={locale === "en" ? "Notes" : "Pastabos"}
                value={d.notes || ""}
                onChange={(e) =>
                  onAnswers((prev) => ({
                    ...prev,
                    conditionDetails: {
                      ...prev.conditionDetails,
                      [name]: { ...d, notes: e.target.value },
                    },
                  }))
                }
                style={{ flex: 1, minWidth: 160 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CancerBlock({
  field,
  answers,
  mode,
  locale,
  def,
  onAnswers,
}: {
  field: QField;
  answers: QuestionnaireAnswers;
  mode: Mode;
  locale: "lt" | "en";
  def: QDefinition;
  onAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
}) {
  // Only render once for the first cancer field to avoid duplicates
  if (field.label !== "Cancer Type") return null;
  const readOnly = mode === "view";
  const types = def.lists["Cancer Type"];
  const treatments = def.lists["Treatment Received"];
  const typeItems = types && !types.grouped ? types.items : [];
  const treatItems =
    treatments && !treatments.grouped ? treatments.items : [];

  return (
    <div className="stack q-cond" style={{ gap: 10 }}>
      <h3 className="overview-subhead">
        {locale === "en" ? "Cancer details" : "Vėžio detalės"}
      </h3>
      <MultiSelect
        disabled={readOnly}
        value={answers.cancer.types}
        options={typeItems}
        grouped={null}
        onChange={(next) =>
          onAnswers((p) => ({ ...p, cancer: { ...p.cancer, types: next } }))
        }
      />
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <select
          disabled={readOnly}
          value={answers.cancer.status || ""}
          onChange={(e) =>
            onAnswers((p) => ({
              ...p,
              cancer: { ...p.cancer, status: e.target.value },
            }))
          }
        >
          <option value="">Status…</option>
          <option>Active</option>
          <option>Remission</option>
          <option>Resolved</option>
        </select>
        <input
          type="number"
          disabled={readOnly}
          placeholder="YYYY"
          value={answers.cancer.year || ""}
          onChange={(e) =>
            onAnswers((p) => ({
              ...p,
              cancer: { ...p.cancer, year: e.target.value },
            }))
          }
        />
      </div>
      <div className="q-label">Treatment Received</div>
      <MultiSelect
        disabled={readOnly}
        value={answers.cancer.treatment}
        options={treatItems}
        grouped={null}
        onChange={(next) =>
          onAnswers((p) => ({
            ...p,
            cancer: { ...p.cancer, treatment: next },
          }))
        }
      />
      <textarea
        disabled={readOnly}
        rows={2}
        placeholder={locale === "en" ? "Additional info" : "Papildoma info"}
        value={answers.cancer.info || ""}
        onChange={(e) =>
          onAnswers((p) => ({
            ...p,
            cancer: { ...p.cancer, info: e.target.value },
          }))
        }
      />
    </div>
  );
}

function FamilyHistoryBlock({
  def,
  answers,
  mode,
  locale,
  onAnswers,
}: {
  def: QDefinition;
  answers: QuestionnaireAnswers;
  mode: Mode;
  locale: "lt" | "en";
  onAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
}) {
  const readOnly = mode === "view";
  const relatives = def.lists["Relatives"];
  const relativeItems =
    relatives && !relatives.grouped ? relatives.items : [];
  const famList = def.lists["Family History Conditions"];

  function updateMember(id: string, patch: Partial<FamilyMember>) {
    onAnswers((p) => ({
      ...p,
      familyMembers: p.familyMembers.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    }));
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row between">
        <h3 className="overview-subhead m-0">
          {locale === "en" ? "Family members" : "Šeimos nariai"}
        </h3>
        {!readOnly ? (
          <button
            type="button"
            className="btn ghost sm"
            onClick={() =>
              onAnswers((p) => ({
                ...p,
                familyMembers: [
                  ...p.familyMembers,
                  { id: uid(), relative: "", conditions: [], notes: "" },
                ],
              }))
            }
          >
            {locale === "en" ? "Add relative" : "Pridėti giminaitį"}
          </button>
        ) : null}
      </div>
      {!answers.familyMembers.length ? (
        <div className="empty">
          {locale === "en"
            ? "No family members added yet."
            : "Šeimos narių dar nepridėta."}
        </div>
      ) : null}
      {answers.familyMembers.map((m) => (
        <div key={m.id} className="q-cond-card">
          <div className="row between">
            <select
              disabled={readOnly}
              value={m.relative}
              onChange={(e) => updateMember(m.id, { relative: e.target.value })}
            >
              <option value="">
                {locale === "en" ? "Relative…" : "Giminaitis…"}
              </option>
              {relativeItems.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {!readOnly ? (
              <button
                type="button"
                className="btn ghost sm"
                onClick={() =>
                  onAnswers((p) => ({
                    ...p,
                    familyMembers: p.familyMembers.filter((x) => x.id !== m.id),
                  }))
                }
              >
                {locale === "en" ? "Remove" : "Pašalinti"}
              </button>
            ) : null}
          </div>
          <MultiSelect
            disabled={readOnly}
            value={m.conditions}
            options={[]}
            grouped={famList || null}
            onChange={(next) => updateMember(m.id, { conditions: next })}
          />
          <input
            disabled={readOnly}
            placeholder={locale === "en" ? "Notes" : "Pastabos"}
            value={m.notes || ""}
            onChange={(e) => updateMember(m.id, { notes: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
