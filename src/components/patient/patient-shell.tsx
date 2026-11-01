"use client";

import { AiProvider, useAi } from "./ai-context";
import { AiDrawer } from "./ai-drawer";

function ShellFrame({
  children,
  locale,
  patientName,
}: {
  children: React.ReactNode;
  locale: "lt" | "en";
  patientName: string;
}) {
  const { open } = useAi();

  return (
    <div className={open ? "app ai-open" : "app"}>
      {children}
      <AiDrawer locale={locale} patientName={patientName} />
    </div>
  );
}

export function PatientShell({
  children,
  locale,
  patientName,
  rail,
  main,
}: {
  children?: React.ReactNode;
  locale: "lt" | "en";
  patientName: string;
  askAiLabel?: string;
  rail: React.ReactNode;
  main: React.ReactNode;
}) {
  return (
    <AiProvider>
      <ShellFrame locale={locale} patientName={patientName}>
        {rail}
        {main}
        {children}
      </ShellFrame>
    </AiProvider>
  );
}

export function AiToggleButton({ label }: { label: string }) {
  const { open, setOpen } = useAi();
  return (
    <button
      type="button"
      className="ai-toggle"
      onClick={() => setOpen(!open)}
      aria-pressed={open}
    >
      <svg
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
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
      </svg>
      {label}
    </button>
  );
}
