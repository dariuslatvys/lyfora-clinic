"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

type SearchResult = {
  id: string;
  kind: string;
  kindLabel: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

export function GlobalSearch({
  locale,
  placeholder,
  emptyLabel,
  searchingLabel,
}: {
  locale: "lt" | "en";
  placeholder: string;
  emptyLabel: string;
  searchingLabel: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  const runSearch = useCallback(async (value: string) => {
    const query = value.trim();
    const id = ++seq.current;
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/patient/search?q=${encodeURIComponent(query)}&limit=20`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("search_failed");
      const data = (await res.json()) as { results?: SearchResult[] };
      if (id !== seq.current) return;
      startTransition(() => {
        setResults(data.results || []);
        setActive(0);
      });
    } catch {
      if (id !== seq.current) return;
      setResults([]);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => runSearch(q), 160);
    return () => window.clearTimeout(t);
  }, [q, runSearch]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(href: string) {
    setOpen(false);
    setQ("");
    setResults([]);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
      return;
    }
    if (!results.length) {
      if (e.key === "Enter") e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.href);
    }
  }

  const showPanel = open && q.trim().length >= 2;
  const showEmpty = showPanel && !loading && !pending && results.length === 0;

  return (
    <div className="global-search" ref={rootRef} data-locale={locale}>
      <div className="global-search-field">
        <svg
          className="global-search-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listId}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
        />
        {q ? (
          <button
            type="button"
            className="global-search-clear"
            aria-label={locale === "en" ? "Clear" : "Išvalyti"}
            onClick={() => {
              setQ("");
              setResults([]);
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        ) : (
          <kbd className="global-search-kbd">⌘K</kbd>
        )}
      </div>

      {showPanel ? (
        <div className="global-search-panel" id={listId} role="listbox">
          {loading || pending ? (
            <div className="global-search-status">{searchingLabel}</div>
          ) : null}
          {showEmpty ? (
            <div className="global-search-status">{emptyLabel}</div>
          ) : null}
          {results.map((r, i) => (
            <Link
              key={r.id}
              href={r.href}
              role="option"
              aria-selected={i === active}
              className={
                i === active
                  ? "global-search-hit on"
                  : "global-search-hit"
              }
              onMouseEnter={() => setActive(i)}
              onClick={(e) => {
                e.preventDefault();
                go(r.href);
              }}
            >
              <span className="global-search-kind">{r.kindLabel}</span>
              <span className="global-search-main">
                <b>{r.title}</b>
                {r.subtitle ? <em>{r.subtitle}</em> : null}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
