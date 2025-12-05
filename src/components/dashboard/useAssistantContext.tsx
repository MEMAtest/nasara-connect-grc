"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AssistantCtx = {
  context: {
    policyId?: string;
    runId?: string;
    cmpId?: string;
    path?: string;
  };
  setContext: (ctx: Partial<AssistantCtx["context"]>) => void;
  clearContext: () => void;
};

const AssistantContext = createContext<AssistantCtx | undefined>(undefined);

export function AssistantContextProvider({ children }: { children: ReactNode }) {
  const [context, setCtx] = useState<AssistantCtx["context"]>({});

  const value = useMemo<AssistantCtx>(
    () => ({
      context,
      setContext: (ctx) => setCtx((prev) => ({ ...prev, ...ctx })),
      clearContext: () => setCtx({}),
    }),
    [context],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistantContext(): AssistantCtx {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistantContext must be used within AssistantContextProvider");
  }
  return ctx;
}
