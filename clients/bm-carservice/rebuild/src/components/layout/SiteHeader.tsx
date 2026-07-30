import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Phone, MessageCircle } from "lucide-react";
import { company } from "@/data/company";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { StatusPill } from "@/components/ui/StatusPill";

const whatsappUrl = `https://wa.me/${company.phone.whatsapp}`;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-[60] border-b border-line bg-surface/95 backdrop-blur">
      {/* Utility bar — mono reception-board line */}
      <div className="hidden bg-ink text-text-invert md:block">
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
      <Container className="flex items-center justify-between gap-4 py-3">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Button href={company.phone.href} variant="outline" size="sm" className="hidden sm:inline-flex lg:hidden xl:inline-flex">
            <Phone className="h-4 w-4" /> Bel ons
          </Button>
          <Button to="/afspraak" variant="mark" size="sm" className="hidden sm:inline-flex">
            Maak afspraak
          </Button>
          <button
            type="button"
            aria-label="Menu openen"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-lg border border-line lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </Container>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
