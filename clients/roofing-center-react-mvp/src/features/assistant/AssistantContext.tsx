import { createContext, useContext, useState, type ReactNode } from "react";

interface AssistantContextValue {
  open: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
}

const AssistantCtx = createContext<AssistantContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- context + hook colocated by design
export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantCtx);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AssistantCtx.Provider value={{ open, openAssistant: () => setOpen(true), closeAssistant: () => setOpen(false) }}>
      {children}
    </AssistantCtx.Provider>
  );
}
