import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CalendarCheck, Phone } from "lucide-react";
import { navItems } from "@/data/nav";
import { business } from "@/data/business";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export const MOBILE_MENU_ID = "mobile-menu";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement>;
}

export function MobileNav({ open, onClose, returnFocusRef }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useLockBodyScroll(open);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      wasOpen.current = true;
    } else if (wasOpen.current) {
      returnFocusRef.current?.focus();
      wasOpen.current = false;
    }
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onClose]);

  if (!open) return null;

  return createPortal(
    <div className="lg:hidden">
      <div className="fixed inset-0 z-[60] bg-black/70" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        id={MOBILE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 right-0 z-[70] flex h-[100dvh] w-full max-w-xs flex-col overflow-hidden border-l border-line bg-ink shadow-lift"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
          <Logo />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-cream hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie" className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center rounded-lg px-3 py-3 text-base font-medium text-text-body hover:bg-ink-700 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="shrink-0 space-y-2 border-t border-line p-4"
          style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
        >
          <Button href={business.booking.base} target="_blank" rel="noopener noreferrer" className="w-full">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Boek afspraak
          </Button>
          <Button href={business.phone.href} variant="outline" className="w-full">
            <Phone className="h-5 w-5" aria-hidden="true" /> Bel direct
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
