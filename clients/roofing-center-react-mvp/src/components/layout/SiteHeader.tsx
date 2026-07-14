import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileNav, MOBILE_MENU_ID } from "@/components/layout/MobileNav";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

/** Sticky navy header with logo, desktop nav, primary CTA and mobile menu. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setMenuOpen(false), [pathname]);

  // Close the menu when the layout switches to desktop, so a resize while the
  // mobile menu is open never leaves the body scroll locked.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line-invert bg-navy/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <DesktopNav />
          <div className="hidden lg:block">
            <Button to={ROUTES.offerte} size="sm">
              {company.cta.quote}
            </Button>
          </div>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu openen"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-invert hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </Container>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={triggerRef} />
    </header>
  );
}
