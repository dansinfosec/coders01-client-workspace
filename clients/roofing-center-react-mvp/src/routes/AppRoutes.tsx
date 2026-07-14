import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { DienstenPage } from "@/pages/DienstenPage";
import { ProjectenPage } from "@/pages/ProjectenPage";
import { OverOnsPage } from "@/pages/OverOnsPage";
import { FaqPage } from "@/pages/FaqPage";
import { OffertePage } from "@/pages/OffertePage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "./paths";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.diensten} element={<DienstenPage />} />
        <Route path={ROUTES.projecten} element={<ProjectenPage />} />
        <Route path={ROUTES.overOns} element={<OverOnsPage />} />
        <Route path={ROUTES.faq} element={<FaqPage />} />
        <Route path={ROUTES.offerte} element={<OffertePage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
