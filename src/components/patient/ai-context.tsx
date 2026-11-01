"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AiContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  draft: string;
  ask: (question: string) => void;
  clearDraft: () => void;
};

const AiContext = createContext<AiContextValue | null>(null);

export function AiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const ask = useCallback((question: string) => {
    setDraft(question);
    setOpen(true);
  }, []);

  const clearDraft = useCallback(() => setDraft(""), []);

  const value = useMemo(
    () => ({ open, setOpen, draft, ask, clearDraft }),
    [open, draft, ask, clearDraft]
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAi() {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within AiProvider");
  return ctx;
}
