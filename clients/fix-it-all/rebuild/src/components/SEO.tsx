import { Helmet } from "react-helmet-async";

const SITE_NAME = "Autobedrijf Fix-it All";
const DEFAULT_DESC =
  "Onafhankelijke vakgarage in Utrecht sinds 2000. APK, onderhoud, uitlaat- en laswerk, airco en occasions — voor alle merken.";

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
 * Per-pagina SEO. `title` mag zonder merknaam; die wordt toegevoegd, tenzij al aanwezig.
 * NB: canonical/OG-domein is een placeholder tot het live domein bevestigd is.
 */
export function SEO({ title, description = DEFAULT_DESC, path, jsonLd, noindex, image }: SEOProps) {
  const fullTitle = title.includes("Fix-it All") ? title : `${title} | ${SITE_NAME}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {path && <link rel="canonical" href={path} data-canonical-path={path} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
