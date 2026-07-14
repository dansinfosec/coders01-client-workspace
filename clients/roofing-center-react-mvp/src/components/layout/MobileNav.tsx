import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { mainNav } from "@/data/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement>;
}

/** Accessible slide-over mobile menu: dialog, scroll-lock, Escape, focus trap + restore. */
export function MobileNav({ open, onClose, returnFocusRef }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useLockBodyScroll(open);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    else returnFocusRef.current?.focus();
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (f.length === 0) return;
      const first = f[0], last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden">
      <div className="fixed inset-0 z-40 bg-navy-900/60" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-navy shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-line-invert px-4 py-4">
          <Logo />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-invert hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie" className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-3 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                      isActive ? "bg-navy-800 text-green" : "text-text-invert/90 hover:bg-navy-800",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-line-invert p-4">
          <Button to={ROUTES.offerte} className="w-full">
            {company.cta.quote}
          </Button>
          <Button to={ROUTES.contact} variant="onNavy" className="w-full">
            {company.cta.discuss}
          </Button>
        </div>
      </div>
    </div>
  );
}
