import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { primaryNavigation, primaryCta } from "@/data/navigation";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

/** Shared id so the trigger's aria-controls points at the dialog. */
export const MOBILE_MENU_ID = "mobile-menu";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
  /** Element to return focus to when the menu closes (the trigger button). */
  returnFocusRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Slide-over mobile menu.
 *
 * Rendered via a portal to document.body so its `position: fixed` layout is
 * relative to the VIEWPORT. The site header uses `backdrop-blur`, and
 * backdrop-filter establishes a containing block for fixed descendants — which
 * previously clipped this panel to the header height.
 *
 * Accessibility: role="dialog" + aria-modal, Escape closes, background scroll
 * locked, focus moved to the close button on open and restored to the trigger
 * on close (never on initial mount), focus trapped, route selection closes it.
 */
export function MobileNavigation({ open, onClose, returnFocusRef }: MobileNavigationProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useLockBodyScroll(open);

  // Focus the close button on open; restore to the trigger only after a real
  // close (never on initial mount).
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
      wasOpen.current = true;
    } else if (wasOpen.current) {
      returnFocusRef.current?.focus();
      wasOpen.current = false;
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

  return createPortal(
    <div className="lg:hidden">
      {/* Backdrop — full viewport, above the sticky header */}
      <div className="fixed inset-0 z-[60] bg-text-primary/30" aria-hidden="true" onClick={onClose} />
      {/* Panel — full height with its own scroll area + safe-area padding */}
      <div
        ref={panelRef}
        id={MOBILE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex h-[100dvh] w-full max-w-xs flex-col overflow-hidden",
          "bg-surface shadow-card",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <span className="text-base font-semibold text-text-primary">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Menu sluiten"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie" className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-1">
            {primaryNavigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium transition-colors",
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

        <div
          className="shrink-0 border-t border-border p-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <NavLink
            to={primaryCta.to}
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-5 py-3 font-medium text-white transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            {primaryCta.label}
          </NavLink>
        </div>
      </div>
    </div>,
    document.body,
  );
}
