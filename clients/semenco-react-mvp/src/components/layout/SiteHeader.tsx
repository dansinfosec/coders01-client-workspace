import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { MobileNavigation, MOBILE_MENU_ID } from "@/components/layout/MobileNavigation";
import { Button } from "@/components/ui/Button";
import { siteSettings } from "@/data/siteSettings";
import { imageAssets } from "@/data/imageAssets";
import { primaryCta } from "@/data/navigation";
import { ROUTES } from "@/routes/paths";

/** Sticky site header with brand, desktop nav, CTA and a mobile menu trigger. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Safety net: ensure the menu is closed after any navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close the menu when the layout switches to desktop, so a resize while the
  // mobile menu is open never leaves the body scroll locked.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link
          to={ROUTES.home}
          className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          aria-label={`${siteSettings.name} — naar de homepage`}
        >
          <img
            src={imageAssets.logo.src}
            alt={siteSettings.name}
            width={imageAssets.logo.width}
            height={imageAssets.logo.height}
            className="h-10 w-auto sm:h-11"
            // Logo is above the fold; load eagerly. width/height keep its
            // aspect ratio so there is no layout shift while it loads.
            fetchPriority="high"
          />
        </Link>

        <div className="flex items-center gap-2">
          <DesktopNavigation />
          <div className="hidden lg:block">
            <Button to={primaryCta.to} size="sm">
              {primaryCta.label}
            </Button>
          </div>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
            aria-label="Menu openen"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </PageContainer>

      <MobileNavigation
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusRef={triggerRef}
      />
    </header>
  );
}
