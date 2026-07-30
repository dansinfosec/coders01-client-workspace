import { Helmet } from "react-helmet-async";
import { site } from "@/config/site";

interface SEOProps {
  title: string;
  description?: string;
  /** Canonieke padnaam, bijv. "/diensten/apk-keuring". */
  path?: string;
  /** JSON-LD structured data (object of array). */
  jsonLd?: object | object[];
  noindex?: boolean;
  /** OG-afbeelding (absoluut pad). */
  image?: string;
}

/**
 * Per-pagina SEO. `title` mag zonder merknaam; die wordt toegevoegd door
 * `site.formatTitle`. Alle site-brede waarden komen uit `config/site.ts`.
 */
export function SEO({ title, description = site.defaultDescription, path, jsonLd, noindex, image }: SEOProps) {
  const fullTitle = site.formatTitle(title);
  const ogImage = image ?? site.defaultOgImage ?? undefined;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <html lang={site.lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {path && <link rel="canonical" href={`${site.url}${path}`} data-canonical-path={path} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
