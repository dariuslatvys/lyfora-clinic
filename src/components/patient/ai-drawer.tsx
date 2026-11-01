"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAi } from "./ai-context";

type Msg = { role: "user" | "assistant"; text: string; note?: string };

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}

export function AiDrawer({
  locale,
  patientName,
}: {
  locale: "lt" | "en";
  patientName: string;
}) {
  const { open, setOpen, draft, clearDraft } = useAi();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  const starters =
    locale === "en"
      ? [
          "Explain my health overview in plain language",
          "What do my genetic findings mean?",
          "Which markers are outside the usual range?",
        ]
      : [
          "Paaiškink mano sveikatos apžvalgą paprastai",
          "Ką reiškia mano genetiniai radiniai?",
          "Kurie žymenys yra už normos ribų?",
        ];

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setInput("");
      setMsgs((m) => [...m, { role: "user", text: message }]);
      try {
        const res = await fetch("/api/patient/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        if (!res.ok) throw new Error("fail");
        const data = (await res.json()) as {
          reply: string;
          disclaimer: string;
        };
        setMsgs((m) => [
          ...m,
          { role: "assistant", text: data.reply, note: data.disclaimer },
        ]);
      } catch {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text:
              locale === "en"
                ? "I could not answer right now. Please try again."
                : "Dabar nepavyko atsakyti. Pabandykite dar kartą.",
          },
        ]);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    if (draft) {
      const q = draft;
      clearDraft();
      void send(q);
    }
  }, [draft, clearDraft, send]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy, open]);

  if (!open) return null;

  return (
    <aside className="ai" aria-label={locale === "en" ? "AI assistant" : "AI asistentas"}>
      <div className="ai-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <b>{locale === "en" ? "Lyfora AI" : "Lyfora AI"}</b>
          <div className="ai-ctx">
            {locale === "en"
              ? `Context: ${patientName} · based on your card`
              : `Kontekstas: ${patientName} · pagal jūsų kortelę`}
          </div>
        </div>
        <button
          type="button"
          className="iconbtn"
          aria-label={locale === "en" ? "Close" : "Uždaryti"}
          onClick={() => setOpen(false)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="ai-body" ref={bodyRef}>
        {msgs.length === 0 && (
          <div className="starters">
            <p className="small muted">
              {locale === "en"
                ? "Ask in plain language. I use your Lyfora data and never give diagnoses."
                : "Klauskite paprasta kalba. Remiuosi jūsų Lyfora duomenimis ir niekada neduodu diagnozių."}
            </p>
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                className="starter"
                onClick={() => void send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "u" : "a"}`}>
            <div style={{ whiteSpace: "pre-wrap" }}>{renderText(m.text)}</div>
            {m.note ? <div className="note">{m.note}</div> : null}
          </div>
        ))}
        {busy && (
          <div className="msg a">
            <span className="typing" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>

      <div className="ai-foot">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              locale === "en"
                ? "Ask in plain language…"
                : "Klauskite paprasta kalba…"
            }
            aria-label={locale === "en" ? "Question" : "Klausimas asistentui"}
            rows={2}
            disabled={busy}
          />
          <button type="submit" className="btn" disabled={busy || !input.trim()} aria-label="Siųsti">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12l16-8-6 16-3-6-7-2z" />
            </svg>
          </button>
        </form>
        <div className="disclaim">
          {locale === "en"
            ? "Assistant does not give diagnoses or change treatment. For urgent symptoms call emergency services."
            : "Asistentas neteikia diagnozių ir nekeičia gydymo. Esant skubiems simptomams skambinkite 112."}
        </div>
      </div>
    </aside>
  );
}
