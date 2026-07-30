import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scroll naar boven bij routewissel (behalve wanneer er een #anchor is). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}
