import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { DienstenPage } from "@/pages/DienstenPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { ApkHubPage } from "@/pages/ApkHubPage";
import { DistributiekettingHubPage } from "@/pages/DistributiekettingHubPage";
import { LandingPage } from "@/pages/LandingPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { AfspraakPage } from "@/pages/AfspraakPage";
import { ContactPage } from "@/pages/ContactPage";
import { LegalPage } from "@/pages/LegalPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "@/routes/paths";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />

        {/* Diensten */}
        <Route path={ROUTES.diensten} element={<DienstenPage />} />
        <Route path={ROUTES.serviceDetail} element={<ServiceDetailPage />} />
        <Route path={ROUTES.remmenLegacy} element={<ServiceDetailPage />} />

        {/* APK — hub + variants + preserved location URLs */}
        <Route path={ROUTES.apkHub} element={<ApkHubPage />} />
        <Route path={ROUTES.apkVariant} element={<LandingPage />} />
        <Route path={ROUTES.apkAmsterdam} element={<LandingPage />} />
        <Route path={ROUTES.apkAalsmeer} element={<LandingPage />} />
        <Route path={ROUTES.apkUithoorn} element={<LandingPage />} />

        {/* Distributieketting */}
        <Route path={ROUTES.distributieketting} element={<DistributiekettingHubPage />} />
        <Route path={ROUTES.distributiekettingBrand} element={<LandingPage />} />

        {/* Standalone landings */}
        <Route path={ROUTES.chiptuning} element={<LandingPage />} />
        <Route path={ROUTES.anwb} element={<LandingPage />} />

        <Route path={ROUTES.reviews} element={<ReviewsPage />} />
        <Route path={ROUTES.afspraak} element={<AfspraakPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />

        {/* Legacy appointment URLs → canonical /afspraak */}
        <Route path="/afspraak-maken" element={<Navigate to={ROUTES.afspraak} replace />} />
        <Route path="/afspraak-maken/details" element={<Navigate to={ROUTES.afspraak} replace />} />

        <Route path={ROUTES.cookiebeleid} element={<LegalPage kind="cookiebeleid" />} />
        <Route path={ROUTES.privacy} element={<LegalPage kind="privacy" />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
