import { Helmet } from "react-helmet-async";
import { company } from "@/data/company";

interface SEOProps {
  title: string;
  description: string;
  /** Path only, e.g. "/diensten". Used for canonical + og:url. */
  path?: string;
  image?: string;
  /** Set true on legal/utility pages that should not be indexed. */
  noindex?: boolean;
}

export const SITE_URL = "https://www.bmcarservice.nl";

/** Per-page document head: title, description, canonical, Open Graph. */
export function SEO({ title, description, path = "/", image, noindex }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? `${SITE_URL}/images/bm-carservice/og-default.jpg`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content={company.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
    </Helmet>
  );
}
