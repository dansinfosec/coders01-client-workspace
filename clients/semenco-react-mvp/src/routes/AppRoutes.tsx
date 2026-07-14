import { Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { LogeeropvangPage } from "@/pages/LogeeropvangPage";
import { VakantieopvangPage } from "@/pages/VakantieopvangPage";
import { CrisisopvangPage } from "@/pages/CrisisopvangPage";
import { WerkwijzePage } from "@/pages/WerkwijzePage";
import { AanmeldenPage } from "@/pages/AanmeldenPage";
import { BlogPage } from "@/pages/BlogPage";
import { BlogPostPage } from "@/pages/BlogPostPage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { BLOG_POST_PATTERN, LEGACY_ABOUT_PATH, ROUTES } from "./paths";

/** Central route table. All pages share the RootLayout shell. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        {/* Legacy path → current About route (kept permanently). */}
        <Route path={LEGACY_ABOUT_PATH} element={<Navigate to={ROUTES.about} replace />} />
        <Route path={ROUTES.logeeropvang} element={<LogeeropvangPage />} />
        <Route path={ROUTES.vakantieopvang} element={<VakantieopvangPage />} />
        <Route path={ROUTES.crisisopvang} element={<CrisisopvangPage />} />
        <Route path={ROUTES.werkwijze} element={<WerkwijzePage />} />
        <Route path={ROUTES.aanmelden} element={<AanmeldenPage />} />
        <Route path={ROUTES.blog} element={<BlogPage />} />
        <Route path={BLOG_POST_PATTERN} element={<BlogPostPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
