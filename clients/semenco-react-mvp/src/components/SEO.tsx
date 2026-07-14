import { Helmet } from "react-helmet-async";
import { siteSettings } from "@/data/siteSettings";

interface SEOProps {
  /** Page title; the site name is appended automatically. */
  title: string;
  /** Meta description for this page. */
  description: string;
  /** Optional Open Graph image path (defaults to the site image if set). */
  image?: string;
  /** Set true on pages that should not be indexed. */
  noIndex?: boolean;
}

/**
 * Per-route document head management (title, description, Open Graph, canonical
 * language). Wraps react-helmet-async so pages just declare their metadata.
 */
export function SEO({ title, description, image, noIndex }: SEOProps) {
  const fullTitle = `${title} | ${siteSettings.name}`;
  const ogImage = image ?? siteSettings.defaultOgImage;

  return (
    <Helmet>
      <html lang={siteSettings.locale} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteSettings.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
