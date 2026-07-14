import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll to top on route change (instant when reduced motion is preferred). */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
  }, [pathname]);
  return null;
}
