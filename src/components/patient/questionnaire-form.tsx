"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  STEP_TITLE_LT,
  computeBmi,
  computeAge,
  conditionsForSex,
  fieldLabel,
  optionLabel,
  questionnaireLocalStoragePrefix,
  syncWomenDerivedScores,
  type QDefinition,
  type QField,
  type QuestionnaireAnswers,
  type QuestionnaireKind,
  type FamilyMember,
  visibleFieldsForStep,
  completionStats,
  biologicalSex,
} from "@/lib/health/questionnaire";
import { familyMemberAgeYears } from "@/lib/health/family-history";
import { MedicationPicker } from "@/components/patient/medication-picker";
import { formatDateTime } from "@/lib/utils";

type Mode = "edit" | "view";

function uid() {
  return `fm_${Math.random().toString(36).slice(2, 9)}`;
}

function readLocalAnswers(
  patientId: string,
  kind: QuestionnaireKind
): QuestionnaireAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      questionnaireLocalStoragePrefix(kind) + patientId
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuestionnaireAnswers;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalAnswers(
  patientId: string,
  answers: QuestionnaireAnswers,
  kind: QuestionnaireKind
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      questionnaireLocalStoragePrefix(kind) + patientId,
      JSON.stringify(answers)
    );
  } catch {
    /* quota / private mode — ignore */
  }
}

function newerAnswers(
  a: QuestionnaireAnswers,
  b: QuestionnaireAnswers | null
): QuestionnaireAnswers {
  if (!b) return a;
  const at = Date.parse(a.updatedAt || "") || 0;
  const bt = Date.parse(b.updatedAt || "") || 0;
  return bt > at ? b : a;
}

export function QuestionnaireForm({
  locale,
  patientId,
  initialDefinition,
  initialAnswers,
  initialStep = 0,
  kind = "general",
  titleLt,
  titleEn,
  introLt,
  introEn,
}: {
  locale: "lt" | "en";
  patientId: string;
  initialDefinition: QDefinition;
  initialAnswers: QuestionnaireAnswers;
  initialStep?: number;
  kind?: QuestionnaireKind;
  titleLt?: string;
  titleEn?: string;
  introLt?: string;
  introEn?: string;
}) {
  const router = useRouter();
  const def = initialDefinition;
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initialAnswers);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const [stepIdx, setStepIdx] = useState(
    Number.isFinite(initialStep) && initialStep >= 0 ? initialStep : 0
  );
  // Open editable so chips/selects work; saved values are pre-filled from DB.
  const [mode, setMode] = useState<Mode>("edit");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(
    initialAnswers.updatedAt
  );
  const [saveFlash, setSaveFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasSexField = useMemo(
    () => def.fields.some((f) => f.label === "Biological Sex"),
    [def.fields]
  );

  // Prefer newer browser copy when serverless /tmp DB was reset.
  useEffect(() => {
    const local = readLocalAnswers(patientId, kind);
    const best = newerAnswers(initialAnswers, local);
    if (best !== initialAnswers) {
      setAnswers(best);
      answersRef.current = best;
      setSavedAt(best.updatedAt);
      // Push browser copy back to server so Death Clock / twin see it too.
      void fetch("/api/patient/questionnaire", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: best, kind }),
        cache: "no-store",
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as { answers: QuestionnaireAnswers };
          setAnswers(data.answers);
          answersRef.current = data.answers;
          setSavedAt(data.answers.updatedAt);
          writeLocalAnswers(patientId, data.answers, kind);
        })
        .catch(() => undefined);
    }
  }, [patientId, initialAnswers, kind]);

  const sex = biologicalSex(answers, def);
  const steps = useMemo(() => {
    return def.steps.filter((s) => {
      if (hasSexField && s.title.startsWith("6.")) {
        if (sex !== "Female") return false;
      }
      // Hide branches with no currently visible questions (women questionnaire).
      if (kind === "women") {
        return visibleFieldsForStep(def, s.title, answers).length > 0;
      }
      return true;
    });
  }, [def.steps, sex, hasSexField, kind, def, answers]);

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

  // Keep BMI, age and women-derived scores in sync
  useEffect(() => {
    if (kind === "women") {
      const synced = syncWomenDerivedScores(answers, def);
      const keys = [
        "w_age",
        "w_bmi",
        "w_samanta_score",
        "w_mrs_score",
        "w_phq2_score",
      ] as const;
      let changed = false;
      for (const k of keys) {
        if (synced.values[k] !== answers.values[k]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        setAnswers(synced);
        answersRef.current = synced;
      }
      return;
    }
    const bmiField = def.fields.find(
      (f) => f.label === "BMI" || f.label === "KMI" || f.id === "w_bmi"
    );
    if (bmiField) {
      const bmi = computeBmi(answers, def);
      if (bmi != null && answers.values[bmiField.id] !== bmi) {
        setValue(bmiField.id, bmi);
      }
    }
    const ageField = def.fields.find(
      (f) =>
        (f.label === "Age" || f.label === "Amžius" || f.id === "w_age") &&
        f.auto
    );
    if (ageField) {
      const age = computeAge(answers, def);
      if (age != null && answers.values[ageField.id] !== age) {
        setValue(ageField.id, age);
      } else if (age == null && answers.values[ageField.id] != null) {
        setValue(ageField.id, null);
      }
    }
  }, [answers, def, setValue, kind]);

  const save = useCallback(
    async (opts?: {
      finish?: boolean;
      silent?: boolean;
      answers?: QuestionnaireAnswers;
    }) => {
      setSaving(true);
      setError(null);
      if (!opts?.silent) setSaveFlash(null);
      const payload = opts?.answers ?? answersRef.current;
      answersRef.current = payload;
      try {
        const res = await fetch("/api/patient/questionnaire", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: payload, kind }),
          cache: "no-store",
        });
        if (!res.ok) throw new Error("save failed");
        const data = (await res.json()) as { answers: QuestionnaireAnswers };
        setAnswers(data.answers);
        answersRef.current = data.answers;
        setSavedAt(data.answers.updatedAt);
        writeLocalAnswers(patientId, data.answers, kind);
        setMode(opts?.finish ? "view" : "edit");
        if (!opts?.silent) {
          setSaveFlash(
            locale === "en"
              ? opts?.finish
                ? "Saved — your answers will be used next time."
                : "Draft saved — answers are kept for next visit."
              : opts?.finish
                ? "Išsaugota — kitą kartą naudosime šiuos atsakymus."
                : "Juodraštis išsaugotas — kitą kartą atsakymus matysite čia."
          );
        }
        router.refresh();
        return true;
      } catch {
        // Still keep a local copy so a reload can restore answers.
        const draft = {
          ...answersRef.current,
          updatedAt: new Date().toISOString(),
        };
        writeLocalAnswers(patientId, draft, kind);
        setError(
          locale === "en"
            ? "Could not save to the server. A local copy was kept — try again."
            : "Nepavyko išsaugoti serveryje. Vietinė kopija išsaugota — bandykite dar kartą."
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [locale, patientId, router, kind]
  );

  function stepTitle(title: string) {
    if (locale === "lt") return STEP_TITLE_LT[title] || title;
    return title;
  }

  /** Drop leading "10. " so the tab number badge is not duplicated. */
  function stepLabel(title: string) {
    return stepTitle(title).replace(/^\s*\d+\.\s*/, "").trim();
  }

  return (
    <div className="stack q-wrap" style={{ gap: 14 }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <Link
            href="/patient/health-card/questionnaire"
            className="text-sm text-[var(--muted)]"
          >
            ← {locale === "en" ? "Questionnaires" : "Klausimynai"}
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-[1.55rem] font-bold mt-2 mb-1">
            {locale === "en"
              ? titleEn || "Health questionnaire"
              : titleLt || "Sveikatos klausimynas"}
          </h1>
          {(introLt || introEn) && (
            <p className="small muted m-0" style={{ maxWidth: 52 * 16 }}>
              {locale === "en" ? introEn || introLt : introLt || introEn}
            </p>
          )}
          <p className="small muted m-0">
            {locale === "en"
              ? `Completion ${stats.percent}% · ${stats.filled}/${stats.required} required fields`
              : `Užpildyta ${stats.percent}% · ${stats.filled}/${stats.required} privalomi laukai`}
            {savedAt
              ? ` · ${locale === "en" ? "Saved" : "Išsaugota"} ${formatDateTime(
                  savedAt,
                  locale
                )}`
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

      {saveFlash ? <p className="q-saved">{saveFlash}</p> : null}

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
            <span className="q-step-label">{stepLabel(s.title)}</span>
          </button>
        ))}
      </div>

      {error ? <p className="q-error">{error}</p> : null}

      {step ? (
        <section className="card q-panel">
          <div className="card-head">
            <h2>
              {stepIdx + 1}. {stepLabel(step.title)}
            </h2>
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

            {kind === "general" && step.title.startsWith("2.") ? (
              <ConditionDetailsBlock
                def={def}
                answers={answers}
                mode={mode}
                locale={locale}
                onAnswers={setAnswers}
              />
            ) : null}

            {kind === "general" && step.title.startsWith("10.") ? (
              <FamilyHistoryBlock
                def={def}
                answers={answers}
                mode={mode}
                locale={locale}
                onAnswers={setAnswers}
                onPersist={(snapshot) =>
                  void save({ silent: true, answers: snapshot })
                }
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
                  {saving
                    ? locale === "en"
                      ? "Saving…"
                      : "Saugoma…"
                    : locale === "en"
                      ? "Save draft"
                      : "Išsaugoti juodraštį"}
                </button>
              ) : null}
              {stepIdx < steps.length - 1 ? (
                <button
                  type="button"
                  className="btn"
                  disabled={saving}
                  onClick={() => {
                    void (async () => {
                      // Persist before leaving the step so values are not lost.
                      const ok = await save({ silent: true });
                      if (ok) setStepIdx((i) => i + 1);
                    })();
                  }}
                >
                  {locale === "en" ? "Next" : "Toliau"}
                </button>
              ) : mode === "edit" ? (
                <button
                  type="button"
                  className="btn"
                  disabled={saving}
                  onClick={() => void save({ finish: true })}
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

  const title = fieldLabel(field, locale);
  const notesLt: Record<string, string> = {
    "Controls questionnaire branching": "Nustato klausimyno šakas",
    "Used to calculate age automatically":
      "Pagal ją automatiškai skaičiuojamas amžius",
    "Automatically calculated from date of birth":
      "Automatiškai skaičiuojama iš gimimo datos",
    "Used for BMI calculation": "Naudojama KMI skaičiavimui",
    "Automatically calculated": "Skaičiuojama automatiškai",
    "Cardiometabolic risk indicator": "Kardiometabolinės rizikos rodiklis",
    "Cardiovascular assessment": "Širdies ir kraujagyslių vertinimas",
    "Cardiovascular fitness marker": "Širdies ir kraujagyslių fizinės būklės žymuo",
    "Recovery and autonomic nervous system marker":
      "Atsigavimo ir autonominės nervų sistemos žymuo",
  };
  const hint =
    field.notes && locale === "lt"
      ? notesLt[field.notes] || field.notes
      : field.notes;

  return (
    <div className="q-field">
      <div className="q-field-head">
        <label className="q-label" htmlFor={`q-${field.id}`}>
          {title}
          {field.required ? <em aria-hidden="true">*</em> : null}
          {field.auto ? (
            <span className="q-auto">
              {locale === "en" ? "auto" : "auto"}
            </span>
          ) : null}
        </label>
        {hint ? <p className="q-hint">{hint}</p> : null}
      </div>

      <div
        className={
          field.type === "multiselect" || field.type === "tags"
            ? "q-control q-control-stack"
            : "q-control"
        }
      >
      {field.type === "select" || field.type === "select_list" ? (
        <select
          id={`q-${field.id}`}
          className="q-select"
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
              {optionLabel(o, locale)}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "number" || field.type === "year" ? (
        <>
          <input
            id={`q-${field.id}`}
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
          {field.unit ? <span className="q-unit">{field.unit}</span> : null}
        </>
      ) : null}

      {field.type === "date" ? (
        <input
          id={`q-${field.id}`}
          type="date"
          disabled={readOnly}
          value={typeof value === "string" ? value : ""}
          max={new Date().toISOString().slice(0, 10)}
          min="1920-01-01"
          onChange={(e) => onChange(field.id, e.target.value || null)}
        />
      ) : null}

      {field.type === "calculated" ? (
        <>
          <input
            id={`q-${field.id}`}
            type="text"
            disabled
            value={value == null ? "—" : String(value)}
          />
          {field.unit ? <span className="q-unit">{field.unit}</span> : null}
        </>
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
        field.label === "Current Medications" ||
        field.listRef === "Vaistų paieška" ? (
          <MedicationPicker
            disabled={readOnly}
            value={Array.isArray(value) ? (value as string[]) : []}
            locale={locale}
            onChange={(next) => onChange(field.id, next)}
          />
        ) : (
          <TagsInput
            disabled={readOnly}
            value={Array.isArray(value) ? (value as string[]) : []}
            locale={locale}
            onChange={(next) => onChange(field.id, next)}
          />
        )
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
          locale={locale}
          onChange={(next) => onChange(field.id, next)}
        />
      ) : null}
      </div>
    </div>
  );
}

function ChipOption({
  item,
  on,
  disabled,
  onToggle,
}: {
  item: string;
  on: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label className={on ? "chip on" : "chip"}>
      <input
        type="checkbox"
        className="chip-input"
        checked={on}
        disabled={disabled}
        onChange={onToggle}
      />
      <span className="chip-check" aria-hidden="true">
        {on ? "✓" : ""}
      </span>
      <span>{item}</span>
    </label>
  );
}

function MultiSelect({
  value,
  options,
  grouped,
  disabled,
  locale,
  onChange,
}: {
  value: string[];
  options: string[];
  grouped: ReturnType<typeof conditionsForSex> | QDefinition["lists"][string] | null;
  disabled: boolean;
  locale: "lt" | "en";
  onChange: (next: string[]) => void;
}) {
  function toggle(item: string) {
    if (disabled) return;
    if (value.includes(item)) onChange(value.filter((x) => x !== item));
    else onChange([...value, item]);
  }

  if (grouped && grouped.grouped) {
    return (
      <div className="q-multi" role="group">
        {grouped.groups.map((g) => (
          <div key={g.name} className="q-multi-group">
            <div className="q-multi-title">{optionLabel(g.name, locale)}</div>
            <div className="q-chips">
              {g.items.map((item) => (
                <ChipOption
                  key={item}
                  item={optionLabel(item, locale)}
                  on={value.includes(item)}
                  disabled={disabled}
                  onToggle={() => toggle(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="q-chips" role="group">
      {options.map((item) => (
        <ChipOption
          key={item}
          item={optionLabel(item, locale)}
          on={value.includes(item)}
          disabled={disabled}
          onToggle={() => toggle(item)}
        />
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
        locale={locale}
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
        locale={locale}
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
  onPersist,
}: {
  def: QDefinition;
  answers: QuestionnaireAnswers;
  mode: Mode;
  locale: "lt" | "en";
  onAnswers: React.Dispatch<React.SetStateAction<QuestionnaireAnswers>>;
  onPersist?: (snapshot: QuestionnaireAnswers) => void;
}) {
  const readOnly = mode === "view";
  const relatives = def.lists["Relatives"];
  const relativeItems =
    relatives && !relatives.grouped ? relatives.items : [];
  const famList = def.lists["Family History Conditions"];
  const thisYear = new Date().getFullYear();
  const listRef = useRef<HTMLDivElement>(null);
  const focusIdRef = useRef<string | null>(null);

  function updateMember(id: string, patch: Partial<FamilyMember>) {
    onAnswers((p) => ({
      ...p,
      familyMembers: p.familyMembers.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    }));
  }

  function addPerson() {
    const id = uid();
    focusIdRef.current = id;
    onAnswers((p) => {
      const next: QuestionnaireAnswers = {
        ...p,
        // Newest person first — stays under the Add button, old ones shift down.
        familyMembers: [
          {
            id,
            relative: "",
            conditions: [],
            birthYear: null,
            vitalStatus: "Living",
            deathYear: null,
          },
          ...p.familyMembers,
        ],
      };
      // Persist the exact snapshot so a reload keeps the new card.
      queueMicrotask(() => onPersist?.(next));
      return next;
    });
  }

  useEffect(() => {
    const id = focusIdRef.current;
    if (!id) return;
    focusIdRef.current = null;
    const card = listRef.current?.querySelector(
      `[data-family-id="${id}"]`
    ) as HTMLElement | null;
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const select = card.querySelector("select") as HTMLSelectElement | null;
    select?.focus();
  }, [answers.familyMembers]);

  return (
    <div className="q-family-section">
      <div className="q-family-head">
        <div className="q-family-head-copy">
          <h3 className="overview-subhead m-0">
            {locale === "en" ? "Family history" : "Šeimos anamnezė"}
          </h3>
          <p className="small muted m-0 mt-1">
            {locale === "en"
              ? "Add each relative: relation, year of birth, living or deceased (tick one). If deceased, enter year of death. Age is calculated automatically and saved with the form."
              : "Pridėkite giminaitį: ryšį, gimimo metus, būseną (gyvas ar miręs — pažymėkite varnele). Jei miręs — įveskite mirties metus. Amžių skaičiuojame patys ir išsaugome kartu su forma."}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            className="btn ghost sm q-family-add"
            onClick={addPerson}
          >
            {locale === "en" ? "+ Add person" : "+ Pridėti asmenį"}
          </button>
        ) : null}
      </div>

      {!answers.familyMembers.length ? (
        <div className="empty">
          {locale === "en"
            ? "No relatives yet. Use “Add person” on the right."
            : "Dar nieko nepridėta. Spauskite „Pridėti asmenį“ dešinėje."}
        </div>
      ) : null}

      <div className="q-family-list" ref={listRef}>
        {answers.familyMembers.map((m, idx) => {
          const living = /^living$/i.test(m.vitalStatus || "");
          const deceased = /^deceased$/i.test(m.vitalStatus || "");
          const age = familyMemberAgeYears(m, thisYear);
          const title = m.relative
            ? optionLabel(m.relative, locale)
            : locale === "en"
              ? `Person ${idx + 1}`
              : `Asmuo ${idx + 1}`;
          return (
            <article
              key={m.id}
              className="q-family-card"
              data-family-id={m.id}
            >
              <header className="q-family-card-head">
                <b>{title}</b>
                {!readOnly ? (
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={() => {
                      onAnswers((p) => {
                        const next: QuestionnaireAnswers = {
                          ...p,
                          familyMembers: p.familyMembers.filter(
                            (x) => x.id !== m.id
                          ),
                        };
                        queueMicrotask(() => onPersist?.(next));
                        return next;
                      });
                    }}
                  >
                    {locale === "en" ? "Remove" : "Pašalinti"}
                  </button>
                ) : null}
              </header>

              <div className="q-family-grid">
                <label className="q-family-field">
                  <span className="q-family-field-label">
                    {locale === "en" ? "Relation" : "Giminystės ryšys"}
                  </span>
                  <select
                    disabled={readOnly}
                    className="q-select"
                    value={m.relative}
                    onChange={(e) =>
                      updateMember(m.id, { relative: e.target.value })
                    }
                  >
                    <option value="">
                      {locale === "en" ? "Select…" : "Pasirinkite…"}
                    </option>
                    {relativeItems.map((r) => (
                      <option key={r} value={r}>
                        {optionLabel(r, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="q-family-field">
                  <span className="q-family-field-label">
                    {locale === "en" ? "Year of birth" : "Gimimo metai"}
                  </span>
                  <input
                    disabled={readOnly}
                    type="number"
                    min={1850}
                    max={thisYear}
                    placeholder={locale === "en" ? "e.g. 1940" : "pvz. 1940"}
                    value={m.birthYear == null ? "" : String(m.birthYear)}
                    onChange={(e) =>
                      updateMember(m.id, {
                        birthYear:
                          e.target.value === ""
                            ? null
                            : Number(e.target.value),
                      })
                    }
                  />
                </label>

                <div className="q-family-field q-family-field-span2">
                  <span className="q-family-field-label">
                    {locale === "en" ? "Status" : "Būsena"}
                  </span>
                  <div className="q-family-status" role="group">
                    <label
                      className={
                        living ? "q-family-check on" : "q-family-check"
                      }
                    >
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={living}
                        onChange={() =>
                          updateMember(m.id, {
                            vitalStatus: "Living",
                            deathYear: null,
                          })
                        }
                      />
                      <span className="q-family-check-mark" aria-hidden="true">
                        {living ? "✓" : ""}
                      </span>
                      <span>{locale === "en" ? "Living" : "Gyvas"}</span>
                    </label>
                    <label
                      className={
                        deceased ? "q-family-check on" : "q-family-check"
                      }
                    >
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={deceased}
                        onChange={() =>
                          updateMember(m.id, {
                            vitalStatus: "Deceased",
                            deathYear: m.deathYear ?? null,
                          })
                        }
                      />
                      <span className="q-family-check-mark" aria-hidden="true">
                        {deceased ? "✓" : ""}
                      </span>
                      <span>{locale === "en" ? "Deceased" : "Miręs"}</span>
                    </label>
                  </div>
                </div>

                {deceased ? (
                  <label className="q-family-field">
                    <span className="q-family-field-label">
                      {locale === "en" ? "Year of death" : "Mirties metai"}
                    </span>
                    <input
                      disabled={readOnly}
                      type="number"
                      min={Number(m.birthYear) || 1850}
                      max={thisYear}
                      placeholder={locale === "en" ? "e.g. 2018" : "pvz. 2018"}
                      value={m.deathYear == null ? "" : String(m.deathYear)}
                      onChange={(e) =>
                        updateMember(m.id, {
                          deathYear:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                ) : null}

                <div className="q-family-field">
                  <span className="q-family-field-label">
                    {deceased
                      ? locale === "en"
                        ? "Age at death"
                        : "Amžius mirties metu"
                      : locale === "en"
                        ? "Current age"
                        : "Dabartinis amžius"}
                  </span>
                  <b className="q-family-age">{age != null ? age : "—"}</b>
                </div>
              </div>

              <div className="q-family-field q-family-diseases">
                <span className="q-family-field-label">
                  {locale === "en" ? "Known diseases" : "Žinomos ligos"}
                </span>
                <MultiSelect
                  disabled={readOnly}
                  value={m.conditions}
                  options={[]}
                  grouped={famList || null}
                  locale={locale}
                  onChange={(next) =>
                    updateMember(m.id, { conditions: next })
                  }
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
