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
  patientId: string | null;
  setPatientId: (id: string | null) => void;
  apiPath: string;
};

const AiContext = createContext<AiContextValue | null>(null);

export function AiProvider({
  children,
  apiPath = "/api/patient/ai",
  initialPatientId = null,
}: {
  children: ReactNode;
  apiPath?: string;
  initialPatientId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [patientId, setPatientId] = useState<string | null>(initialPatientId);

  const ask = useCallback((question: string) => {
    setDraft(question);
    setOpen(true);
  }, []);

  const clearDraft = useCallback(() => setDraft(""), []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      draft,
      ask,
      clearDraft,
      patientId,
      setPatientId,
      apiPath,
    }),
    [open, draft, ask, clearDraft, patientId, apiPath]
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAi() {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within AiProvider");
  return ctx;
}
