import { Helmet } from "react-helmet-async";
import { company, contact } from "@/data/company";

/**
 * RoofingContractor / LocalBusiness structured data. Only CONFIRMED fields are
 * emitted — unknown values (phone, address, reviews) are omitted, never faked.
 */
export function StructuredData() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: company.name,
    description: `Specialist in platte daken in ${company.serviceArea}: bitumen dakbedekking, renovatie, reparatie, lekkageherstel, inspectie en onderhoud.`,
    areaServed: company.serviceArea,
    image: "/images/roofing-center/optimized/og-image.jpg",
    logo: "/images/roofing-center/generated-logo/logo-navy-transparent.png",
    knowsAbout: company.confirmedServices.map((s) => s.title),
    makesOffer: company.confirmedServices.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.title },
    })),
  };

  if (contact.hasPhone) data.telephone = company.phone;
  if (contact.hasEmail) data.email = company.email;
  if (contact.hasAddress) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: "NL",
    };
  }
  if (contact.hasMaps) data.hasMap = company.googleMapsUrl;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
