import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AfspraakCtx,
  EMPTY,
  STORAGE_KEY,
  loadAfspraak,
  type AfspraakData,
} from "./afspraakStore";

/** Holds appointment form state across steps; persisted to sessionStorage (survives refresh). */
export function AfspraakProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AfspraakData>(loadAfspraak);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage may be unavailable (private mode) — non-fatal
    }
  }, [data]);

  const update = useCallback((patch: Partial<AfspraakData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleWerkzaamheid = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      werkzaamheden: prev.werkzaamheden.includes(id)
        ? prev.werkzaamheden.filter((w) => w !== id)
        : [...prev.werkzaamheden, id],
    }));
  }, []);

  const reset = useCallback(() => {
    setData(EMPTY);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ data, update, toggleWerkzaamheid, reset }),
    [data, update, toggleWerkzaamheid, reset],
  );

  return <AfspraakCtx.Provider value={value}>{children}</AfspraakCtx.Provider>;
}
