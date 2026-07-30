import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { DienstenPage } from "@/pages/DienstenPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { ApkHubPage } from "@/pages/ApkHubPage";
import { DistributiekettingHubPage } from "@/pages/DistributiekettingHubPage";
import { LandingPage } from "@/pages/LandingPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { AfspraakMakenPage } from "@/pages/AfspraakMakenPage";
import { ContactPage } from "@/pages/ContactPage";
import { VestigingenPage } from "@/pages/VestigingenPage";
import { VestigingDetailPage } from "@/pages/VestigingDetailPage";
import { OverOnsPage } from "@/pages/OverOnsPage";
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

        {/* Locations */}
        <Route path="/vestigingen" element={<VestigingenPage />} />
        <Route path="/vestigingen/:slug" element={<VestigingDetailPage />} />
        <Route path="/over-ons" element={<OverOnsPage />} />

        <Route path={ROUTES.reviews} element={<ReviewsPage />} />

        {/* Appointment module (canonical) + legacy redirects */}
        <Route path={ROUTES.afspraakMaken} element={<AfspraakMakenPage />} />
        <Route path="/afspraak-maken/details" element={<Navigate to={ROUTES.afspraakMaken} replace />} />
        <Route path={ROUTES.afspraak} element={<Navigate to={ROUTES.afspraakMaken} replace />} />

        <Route path={ROUTES.contact} element={<ContactPage />} />

        <Route path={ROUTES.cookiebeleid} element={<LegalPage kind="cookiebeleid" />} />
        <Route path={ROUTES.privacy} element={<LegalPage kind="privacy" />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
