import { Outlet } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";

/**
 * App shell shared by every route: skip link, header, the single <main>
 * landmark (pages render their content inside via <Outlet />), and footer.
 * Keeping <main> here avoids duplicating layout code across pages.
 */
export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Direct naar hoofdinhoud
      </a>
      <ScrollToTop />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
