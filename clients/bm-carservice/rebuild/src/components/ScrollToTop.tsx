import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll to the top on every route change (SPA navigation). */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
