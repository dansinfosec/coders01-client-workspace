import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Phone, MessageCircle } from "lucide-react";
import { company } from "@/data/company";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/utils/cn";

const whatsappUrl = `https://wa.me/${company.phone.whatsapp}`;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-[60] bg-surface/95 backdrop-blur transition-shadow",
        scrolled ? "border-b border-line shadow-soft" : "border-b border-transparent",
      )}
    >
      {/* Utility bar — mono reception-board line (desktop only) */}
      <div className="hidden bg-ink text-text-invert lg:block">
        <Container className="flex items-center justify-between py-1.5">
          <StatusPill onInk />
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href={company.phone.href} className="inline-flex items-center gap-1.5 hover:text-signal">
              <Phone className="h-3.5 w-3.5" /> {company.phone.display}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-signal"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </Container>
      </div>

      {/* Main bar */}
      <Container className="flex items-center justify-between gap-6 py-3">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Button to="/afspraak-maken" variant="mark" size="sm" className="hidden lg:inline-flex">
            Afspraak maken
          </Button>
          <button
            ref={hamburgerRef}
            type="button"
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-lg border border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </Container>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={hamburgerRef} />
    </header>
  );
}
