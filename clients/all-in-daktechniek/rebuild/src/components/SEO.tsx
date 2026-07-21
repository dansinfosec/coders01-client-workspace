import { Helmet } from "react-helmet-async";
import { company } from "@/data/company";

interface SEOProps {
  title: string;
  description: string;
  /** Path only, e.g. "/diensten". Used for canonical + og:url. */
  path?: string;
  image?: string;
}

const SITE_URL = "https://www.all-indaktechniek.nl";

/** Per-page document head: title, description, canonical, Open Graph. */
export function SEO({ title, description, path = "/", image }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? `${SITE_URL}/images/all-in-daktechniek/slider-platte-daken.webp`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
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
