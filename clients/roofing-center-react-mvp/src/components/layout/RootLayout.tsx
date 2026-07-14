import { Outlet } from "react-router-dom";
import { AssistantProvider } from "@/features/assistant/AssistantContext";
import { AssistantPanel } from "@/features/assistant/AssistantPanel";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StructuredData } from "@/components/StructuredData";

/** App shell shared by every route (header, single <main>, footer, assistant). */
export function RootLayout() {
  return (
    <AssistantProvider>
      <div className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">Direct naar hoofdinhoud</a>
        <StructuredData />
        <ScrollToTop />
        <SiteHeader />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <FloatingActions />
        <AssistantPanel />
      </div>
    </AssistantProvider>
  );
}
