import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { primaryNavigation, primaryCta } from "@/data/navigation";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
  /** Element to return focus to when the menu closes (the trigger button). */
  returnFocusRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Slide-over mobile menu. Accessibility:
 *  - role="dialog" + aria-modal, labelled by its heading;
 *  - Escape closes it;
 *  - background scroll is locked while open;
 *  - focus moves to the close button on open and is restored to the trigger on close;
 *  - focus is kept inside the panel (simple Tab loop);
 *  - selecting a route closes the menu.
 */
export function MobileNavigation({ open, onClose, returnFocusRef }: MobileNavigationProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  // Move focus into the panel when it opens; restore to the trigger on close.
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    } else {
      returnFocusRef.current?.focus();
    }
  }, [open, returnFocusRef]);

  // Escape to close + a minimal focus trap within the panel.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-text-primary/30"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col",
          "bg-surface shadow-card",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-base font-semibold text-text-primary">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Menu sluiten"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie" className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-1">
            {primaryNavigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                      isActive
                        ? "bg-brand-soft text-brand-strong"
                        : "text-text-primary hover:bg-surface-muted",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <NavLink
            to={primaryCta.to}
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            {primaryCta.label}
          </NavLink>
        </div>
      </div>
    </div>
  );
}
