import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { DienstenPage } from "@/pages/DienstenPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { OccasionsPage } from "@/pages/OccasionsPage";
import { OccasionDetailPage } from "@/pages/OccasionDetailPage";
import { AfspraakPage } from "@/pages/AfspraakPage";
import { AutoVerkopenPage } from "@/pages/AutoVerkopenPage";
import { OverOnsPage } from "@/pages/OverOnsPage";
import { ContactPage } from "@/pages/ContactPage";
import { VacaturePage } from "@/pages/VacaturePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { features } from "@/config/features";

/**
 * Routes worden per feature-flag gemonteerd. Staat een module uit, dan bestaat
 * de route niet en vangt de catch-all (`*`) hem netjes op met de 404-pagina —
 * geen halfwerkende pagina's.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="diensten" element={<DienstenPage />} />
        <Route path="diensten/:slug" element={<ServiceDetailPage />} />
        {features.occasions && (
          <>
            <Route path="occasions" element={<OccasionsPage />} />
            <Route path="occasions/:slug" element={<OccasionDetailPage />} />
          </>
        )}
        {features.appointments && <Route path="afspraak" element={<AfspraakPage />} />}
        {features.vehicleSale && <Route path="auto-verkopen" element={<AutoVerkopenPage />} />}
        <Route path="over-ons" element={<OverOnsPage />} />
        <Route path="contact" element={<ContactPage />} />
        {features.vacancies && <Route path="vacatures" element={<VacaturePage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
