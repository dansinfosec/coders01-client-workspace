import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { X, ChevronDown, Phone } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { company } from "@/data/company";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

/** Full-screen mobile navigation drawer with accordion groups. */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Menu sluiten"
        className="absolute inset-0 bg-ink/60"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-surface-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {primaryNav.map((item) =>
            item.children ? (
              <div key={item.label} className="border-b border-line/60">
                <button
                  type="button"
                  aria-expanded={expanded === item.label}
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  className="flex w-full items-center justify-between px-3 py-3 text-left font-semibold text-text-strong"
                >
                  {item.label}
                  <ChevronDown
                    className={cn("h-5 w-5 transition-transform", expanded === item.label && "rotate-180")}
                  />
                </button>
                {expanded === item.label && (
                  <div className="pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={onClose}
                        className="block rounded-lg px-6 py-2 text-sm text-text-body hover:bg-surface-muted"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to!}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "block border-b border-line/60 px-3 py-3 font-semibold",
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
          <Button to="/afspraak" onClick={onClose} variant="mark" className="w-full">
            Maak afspraak
          </Button>
          <Button href={company.phone.href} variant="outline" className="w-full">
            <Phone className="h-4 w-4" /> {company.phone.display}
          </Button>
        </div>
      </div>
    </div>
  );
}
