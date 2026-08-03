import { useEffect, useRef, useState } from "react";
import { Menu, ClipboardCheck } from "lucide-react";
import { navItems } from "@/data/nav";
import { CTA_LABEL } from "@/data/business";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Return focus to the toggle when the menu closes.
  const close = () => {
    setOpen(false);
    window.setTimeout(() => toggleRef.current?.focus(), 20);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-anthracite/95 backdrop-blur supports-[backdrop-filter]:bg-anthracite/85 ${
        scrolled ? "border-line shadow-soft" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" aria-label="Allround Schadeherstel Utrecht — naar boven">
          <Logo />
        </a>

        <nav aria-label="Hoofdmenu" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-body transition-colors hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#aanvraag"
            className="hidden items-center gap-2 rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:inline-flex"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden />
            {CTA_LABEL}
          </a>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-strong hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
            aria-label="Menu openen"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <MobileNav open={open} onClose={close} />
    </header>
  );
}
