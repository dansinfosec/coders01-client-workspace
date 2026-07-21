import { Helmet } from "react-helmet-async";
import { company } from "@/data/company";

const SITE_URL = "https://www.all-indaktechniek.nl";

/**
 * RoofingContractor / LocalBusiness JSON-LD, built only from confirmed NAP facts.
 * Opening hours are omitted until the client confirms them (company.openingHours
 * is null). This is the biggest local-SEO win vs. the current site, which has
 * no LocalBusiness schema at all.
 */
export function StructuredData() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: company.name,
    "@id": `${SITE_URL}/#business`,
    url: SITE_URL,
    telephone: company.phonePrimary.display,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: "NL",
    },
    areaServed: company.address.city,
    description:
      "Dakdekkersbedrijf voor platte daken, pannendaken, lood- en zinkwerk, schoorstenen, dakisolatie en EPDM.",
    sameAs: [company.social.facebook],
    identifier: { "@type": "PropertyValue", name: "KvK", value: company.kvk },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
