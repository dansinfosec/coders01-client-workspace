import { useEffect } from "react";

/**
 * Lock background scrolling while `locked` is true (e.g. when the mobile menu
 * is open). Restores the previous overflow value on unlock/unmount.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
