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

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="diensten" element={<DienstenPage />} />
        <Route path="diensten/:slug" element={<ServiceDetailPage />} />
        <Route path="occasions" element={<OccasionsPage />} />
        <Route path="occasions/:slug" element={<OccasionDetailPage />} />
        <Route path="afspraak" element={<AfspraakPage />} />
        <Route path="auto-verkopen" element={<AutoVerkopenPage />} />
        <Route path="over-ons" element={<OverOnsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="vacatures" element={<VacaturePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
