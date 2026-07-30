import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State die bewaard blijft tussen stappen én bij een refresh (sessionStorage).
 * Bewust sessionStorage: gegevens verdwijnen als het tabblad sluit (privacy).
 * Niet-serialiseerbare waarden (bv. File-objecten) horen hier NIET in.
 */
export function usePersistentState<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(keyRef.current, JSON.stringify(state));
    } catch {
      // Opslag vol of niet beschikbaar — negeer stil.
    }
  }, [state]);

  const clear = useCallback(() => {
    try {
      window.sessionStorage.removeItem(keyRef.current);
    } catch {
      // negeer
    }
  }, []);

  return [state, setState, clear];
}
