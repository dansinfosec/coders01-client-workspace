import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { FloatingActions } from "./FloatingActions";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StructuredData } from "@/components/StructuredData";

/** App shell: skip link, header, routed page, footer, mobile actions. */
export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <StructuredData />
      <a href="#main" className="skip-link">Naar hoofdinhoud</a>
      <SiteHeader />
      <main id="main" className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
}
