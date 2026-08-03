import { useEffect, useRef } from "react";
import { X, Phone, ClipboardCheck } from "lucide-react";
import { navItems } from "@/data/nav";
import { business, CTA_LABEL } from "@/data/business";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Logo } from "./Logo";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen mobile navigation drawer. Locks scroll, closes on Escape / link. */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useLockBodyScroll(open);

  // Escape closes; move focus to the first link when opened.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => firstLinkRef.current?.focus(), 20);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[min(20rem,86vw)] flex-col bg-anthracite shadow-lift transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-strong hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            aria-label="Menu sluiten"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <nav aria-label="Hoofdmenu" className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item, i) => (
            <a
              key={item.href}
              ref={i === 0 ? firstLinkRef : undefined}
              href={item.href}
              onClick={onClose}
              className="rounded-lg px-3 py-3 text-lg font-medium text-text-strong hover:bg-surface-muted hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-line p-5">
          <a
            href="#aanvraag"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-5 py-3.5 font-semibold text-ink hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ClipboardCheck className="h-5 w-5" aria-hidden />
            {CTA_LABEL}
          </a>
          <a
            href={business.phone.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-3.5 font-semibold text-text-strong hover:border-orange hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Phone className="h-5 w-5" aria-hidden />
            {business.phone.display}
          </a>
        </div>
      </div>
    </div>
  );
}
