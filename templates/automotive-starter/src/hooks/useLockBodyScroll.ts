import { useEffect } from "react";

/** Blokkeert achtergrond-scroll (bijv. bij open mobiele drawer) zonder layout-shift. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [locked]);
}
