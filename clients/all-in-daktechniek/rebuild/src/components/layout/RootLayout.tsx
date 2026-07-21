import { Outlet } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StructuredData } from "@/components/StructuredData";

/** App shell: skip link, header, routed page, footer, mobile action bar. */
export function RootLayout() {
  return (
    <>
      <StructuredData />
      <ScrollToTop />
      <a href="#main" className="skip-link">
        Naar hoofdinhoud
      </a>
      <SiteHeader />
      {/* pb-16 leaves room for the fixed mobile action bar */}
      <main id="main" className="pb-16 lg:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingActions />
    </>
  );
}
