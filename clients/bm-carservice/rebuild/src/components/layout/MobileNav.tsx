import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { X, ChevronDown, Phone } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { company } from "@/data/company";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Full-screen mobile navigation drawer: focus trap, Escape, outside-click, restores focus. */
export function MobileNav({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(open);

  // Focus management: focus into the drawer on open, trap Tab, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = triggerRef.current;
    panel?.querySelector<HTMLElement>("button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  // Portal to <body> so the fixed overlay escapes the header's backdrop-filter containing block.
  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Menu sluiten"
        className="absolute inset-0 bg-ink/60 animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="mobile-menu"
        className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-surface shadow-lift animate-fade-in"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie" className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {primaryNav.map((item) =>
            item.children ? (
              <div key={item.label} className="border-b border-line/60">
                <button
                  type="button"
                  aria-expanded={expanded === item.label}
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  className="flex w-full items-center justify-between px-3 py-3 text-left font-semibold text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {item.label}
                  <ChevronDown className={cn("h-5 w-5 transition-transform", expanded === item.label && "rotate-180")} />
                </button>
                {expanded === item.label && (
                  <ul className="pb-2">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <Link
                          to={child.to}
                          onClick={onClose}
                          className="block rounded-lg px-6 py-2 text-sm text-text-body hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "block border-b border-line/60 px-3 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    isActive ? "text-mark-strong" : "text-text-strong",
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="grid gap-2 border-t border-line px-4 py-4">
          <Button to="/afspraak-maken" onClick={onClose} variant="mark" className="w-full">
            Afspraak maken
          </Button>
          <Button href={company.phone.href} variant="outline" className="w-full">
            <Phone className="h-4 w-4" /> {company.phone.display}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
