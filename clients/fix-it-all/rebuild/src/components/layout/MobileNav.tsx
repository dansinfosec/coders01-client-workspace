import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone, MessageCircle, CalendarClock, ChevronDown } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { paths } from "@/routes/paths";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";

const LG_BREAKPOINT = 1024;

/**
 * Mobiele navigatie: hamburger + rechter drawer. Robuust en toegankelijk:
 * scroll-lock, focus-trap, Escape, klik-buiten, focus terug naar de hamburger, sluit na
 * routewissel én bij resize naar desktop. Diensten is een toegankelijke accordion.
 *
 * De off-canvas laag wordt naar document.body geportald. Cruciaal: de SiteHeader gebruikt
 * `backdrop-blur`, en `backdrop-filter` maakt een containing block voor `position: fixed`.
 * Zonder portal zou de `fixed inset-0`-laag zich richten op het 72px hoge headervak i.p.v. de
 * viewport, waardoor de drawer tot headerhoogte inklapte. Via de portal is de laag écht
 * viewport-groot en krijgt de drawer 100dvh. De off-screen (gesloten) drawer wordt door de
 * `overflow-hidden`-laag afgekapt → geen horizontale overflow.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const submenuId = useId();

  const wa = company.whatsapp;

  useLockBodyScroll(open);

  const close = useCallback(() => setOpen(false), []);

  // Sluit na routewissel; open de accordion die bij de huidige route hoort.
  useEffect(() => {
    setOpen(false);
    const activeParent = primaryNav.find((i) => i.children && pathname.startsWith(i.to));
    setOpenSection(activeParent?.label ?? null);
  }, [pathname]);

  // Sluit bij resize naar desktop.
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.innerWidth >= LG_BREAKPOINT) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // Escape + focus-trap; initiële focus op de sluitknop.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
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

  const linkClass = (isActive: boolean) =>
    cn(
      "flex min-h-[44px] items-center rounded-lg px-4 text-base font-semibold text-text-strong transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
      isActive && "bg-surface-muted text-petrol",
    );
  const subLinkClass = (isActive: boolean) =>
    cn(
      "flex min-h-[44px] items-center rounded-md px-3 text-sm text-text-body transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
      isActive && "font-semibold text-petrol",
    );

  const overlay =
    typeof document === "undefined"
      ? null
      : createPortal(
          <div
            className={cn(
              "fixed inset-x-0 top-0 z-[80] h-[100dvh] overflow-hidden lg:hidden",
              open ? "pointer-events-auto" : "pointer-events-none",
            )}
            aria-hidden={!open}
          >
            {/* Backdrop */}
            <div
              className={cn(
                "absolute inset-0 bg-asphalt-900/60 backdrop-blur-sm transition-opacity duration-200",
                open ? "opacity-100" : "opacity-0",
              )}
              onClick={close}
              aria-hidden
            />

            {/* Drawer — volledige hoogte, wit van boven tot onder */}
            <div
              id="mobile-drawer"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigatiemenu"
              className={cn(
                "absolute inset-y-0 right-0 flex w-[min(90vw,420px)] max-w-full flex-col overflow-hidden bg-paper shadow-lift transition-transform duration-300 ease-out-expo",
                open ? "translate-x-0" : "translate-x-full",
              )}
            >
              {/* Header (flex-none) */}
              <div className="flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
                <span className="min-w-0 truncate">
                  <Logo />
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Menu sluiten"
                  onClick={close}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-strong hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
                >
                  <X className="h-6 w-6" aria-hidden />
                </button>
              </div>

              {/* Navigatie (flex-1, eigen scroll) */}
              <nav
                aria-label="Mobiele navigatie"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
              >
                <ul className="flex flex-col gap-0.5">
                  {primaryNav.map((item) => {
                    if (!item.children || item.children.length === 0) {
                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) => linkClass(isActive)}
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      );
                    }
                    const sectionOpen = openSection === item.label;
                    const parentActive = pathname.startsWith(item.to);
                    const id = `${submenuId}-${item.label}`;
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          aria-expanded={sectionOpen}
                          aria-controls={id}
                          onClick={() => setOpenSection((cur) => (cur === item.label ? null : item.label))}
                          className={cn(
                            "flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-4 text-base font-semibold transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol",
                            parentActive ? "text-petrol" : "text-text-strong",
                          )}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 shrink-0 text-text-muted transition-transform",
                              sectionOpen && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                        {sectionOpen && (
                          <ul id={id} className="mb-1 ml-3 border-l border-line pl-2">
                            <li>
                              <NavLink to={item.to} end className={({ isActive }) => subLinkClass(isActive)}>
                                Alle {item.label.toLowerCase()}
                              </NavLink>
                            </li>
                            {item.children.map((child) => (
                              <li key={child.to}>
                                <NavLink to={child.to} className={({ isActive }) => subLinkClass(isActive)}>
                                  {child.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* CTA-zone (flex-none): primair naar eigen tooling, bellen/WhatsApp klein secundair. */}
              <div className="shrink-0 space-y-2 border-t border-line bg-paper px-4 py-4">
                <Button to={paths.afspraak} block size="lg">
                  <CalendarClock className="h-4 w-4" aria-hidden /> Afspraak plannen
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button to={paths.autoVerkopen} variant="outline" block>
                    Auto verkopen
                  </Button>
                  <Button to={paths.contact} variant="outline" block>
                    Contact
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-5 pt-1.5 text-sm text-text-muted">
                  <a
                    href={company.phone.href}
                    className="inline-flex min-h-[44px] items-center gap-1.5 hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
                  >
                    <Phone className="h-4 w-4" aria-hidden /> Bellen
                  </a>
                  {wa && (
                    <a
                      href={wa.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-1.5 hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        );

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
      {overlay}
    </div>
  );
}
