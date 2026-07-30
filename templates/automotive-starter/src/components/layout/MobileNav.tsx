import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { paths } from "@/routes/paths";
import { company } from "@/data/company";
import { features } from "@/config/features";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";

/** Mobiele navigatie: hamburger + drawer met focus trap, scroll lock en Escape. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(open);

  // Sluit na routekeuze.
  useEffect(() => setOpen(false), [pathname]);

  // Escape + focus trap.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Herstel focus naar de trigger bij sluiten.
  useEffect(() => {
    if (!open) triggerRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menu openen"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-asphalt-900/60 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <div
        id="mobile-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigatiemenu"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,22rem)] flex-col bg-paper shadow-lift transition-transform duration-300 ease-out-expo",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button
            type="button"
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobiele navigatie" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-4 py-3 text-base font-semibold text-text-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol",
                      isActive && "bg-surface-muted text-petrol",
                    )
                  }
                >
                  {item.label}
                </NavLink>
                {item.children && (
                  <ul className="mb-1 ml-3 border-l border-line pl-3">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-md px-3 py-2 text-sm text-text-body hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol",
                              isActive && "text-petrol",
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-line px-5 py-4">
          {features.appointments && (
            <Button to={paths.afspraak} block size="lg">
              Afspraak maken
            </Button>
          )}
          {features.vehicleSale && (
            <Button to={paths.autoVerkopen} variant="accent" block>
              Auto verkopen
            </Button>
          )}
          <a
            href={company.phone.href}
            className="mt-1 flex items-center justify-center gap-2 py-2 font-mono text-sm text-text-muted hover:text-petrol"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {company.phone.display}
          </a>
        </div>
      </div>
    </div>
  );
}
