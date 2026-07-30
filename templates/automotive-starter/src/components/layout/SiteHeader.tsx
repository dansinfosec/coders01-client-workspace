import { CalendarClock } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { paths } from "@/routes/paths";
import { features } from "@/config/features";

/** Sticky siteheader: logo links, navigatie, afspraak-CTA rechts. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Logo />
          <DesktopNav />
          <div className="flex items-center gap-2">
            {features.appointments && (
              <Button to={paths.afspraak} size="sm" className="hidden sm:inline-flex">
                <CalendarClock className="h-4 w-4" aria-hidden />
                Afspraak maken
              </Button>
            )}
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
