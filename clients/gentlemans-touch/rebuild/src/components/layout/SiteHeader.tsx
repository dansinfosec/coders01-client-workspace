import { useEffect, useRef, useState } from "react";
import { Menu, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { MobileNav, MOBILE_MENU_ID } from "@/components/layout/MobileNav";
import { navItems } from "@/data/nav";
import { business, BOOK_LABEL } from "@/data/business";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-30 border-b transition-colors " +
        (scrolled ? "border-line bg-ink/95 backdrop-blur" : "border-transparent bg-ink/80 backdrop-blur")
      }
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Hoofdnavigatie" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-text-body transition-colors hover:bg-ink-700 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button href={business.phone.href} size="sm" className="hidden sm:inline-flex">
            <Phone className="h-4 w-4" aria-hidden="true" /> {BOOK_LABEL}
          </Button>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu openen"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-cream hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </Container>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={triggerRef} />
    </header>
  );
}
