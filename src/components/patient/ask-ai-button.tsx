"use client";

import { useAi } from "./ai-context";

export function AskAiButton({
  question,
  label = "Ask AI",
}: {
  question: string;
  label?: string;
}) {
  const { ask } = useAi();
  return (
    <button
      type="button"
      className="btn ghost sm"
      onClick={() => ask(question)}
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
      </svg>
      {label}
    </button>
  );
}
