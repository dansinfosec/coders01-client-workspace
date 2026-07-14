import { Helmet } from "react-helmet-async";
import { company } from "@/data/company";

interface SEOProps {
  title: string;
  description: string;
  /** Path for canonical (e.g. "/diensten"). */
  path?: string;
  image?: string;
  noIndex?: boolean;
}

const OG_IMAGE = "/images/roofing-center/optimized/og-image.jpg";

/** Per-route document head: title, description, canonical, Open Graph, Twitter. */
export function SEO({ title, description, path = "/", image, noIndex }: SEOProps) {
  const fullTitle = `${title} | ${company.name}`;
  const ogImage = image ?? OG_IMAGE;
  // Canonical uses a relative path placeholder; set an absolute base once the domain is known.
  const canonical = path;

  return (
    <Helmet>
      <html lang="nl" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={company.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="nl_NL" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
