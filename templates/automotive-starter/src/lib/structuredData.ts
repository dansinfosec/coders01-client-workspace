import { company, type OpeningDay } from "@/data/company";
import { site } from "@/config/site";

/**
 * Herbruikbare JSON-LD-bouwers. Alleen geverifieerde feiten; onbekende velden
 * (geo, priceRange, KVK, foundingDate) worden bewust weggelaten i.p.v. verzonnen.
 */
const SITE = site.url;

const DAY_URI: Record<number, string> = {
  0: "https://schema.org/Sunday",
  1: "https://schema.org/Monday",
  2: "https://schema.org/Tuesday",
  3: "https://schema.org/Wednesday",
  4: "https://schema.org/Thursday",
  5: "https://schema.org/Friday",
  6: "https://schema.org/Saturday",
};

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function openingSpec(hours: OpeningDay[]) {
  return hours
    .filter((d) => d.ranges.length > 0)
    .flatMap((d) =>
      d.ranges.map(([o, c]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_URI[d.weekday],
        opens: fmt(o),
        closes: fmt(c),
      })),
    );
}

export function localBusinessSchema() {
  const sameAs = [company.social.facebook, company.social.instagram].filter(
    (u): u is string => Boolean(u),
  );
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: company.name,
    url: SITE,
    telephone: company.phone.display,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: company.address.country,
    },
    areaServed: company.serviceArea,
    openingHoursSpecification: openingSpec(company.openingHours),
  };
  if (company.foundedYear !== null) schema.foundingDate = String(company.foundedYear);
  if (sameAs.length > 0) schema.sameAs = sameAs;
  return schema;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    serviceType: opts.name,
    url: `${SITE}${opts.path}`,
    areaServed: company.serviceArea,
    provider: { "@type": "AutoRepair", name: company.name, telephone: company.phone.display },
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Occasions-overzicht: ItemList met links naar de detailpagina's. */
export function occasionItemListSchema(items: { title: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      url: `${SITE}${item.path}`,
    })),
  };
}

/** Occasion-detail: schema.org Car (+ Offer). Onbekende velden worden bewust weggelaten. */
export function vehicleSchema(opts: {
  name: string;
  description: string;
  path: string;
  brand: string;
  model: string;
  bouwjaar: number;
  brandstof: string;
  kmStand: number | null;
  prijs: number | null;
  available: boolean;
  images?: string[];
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: opts.name,
    description: opts.description,
    url: `${SITE}${opts.path}`,
    brand: { "@type": "Brand", name: opts.brand },
    model: opts.model,
    vehicleModelDate: String(opts.bouwjaar),
    fuelType: opts.brandstof,
  };
  if (opts.images && opts.images.length > 0) schema.image = opts.images.map((i) => `${SITE}${i}`);
  if (opts.kmStand !== null) {
    schema.mileageFromOdometer = { "@type": "QuantitativeValue", value: opts.kmStand, unitCode: "KMT" };
  }
  if (opts.prijs !== null) {
    schema.offers = {
      "@type": "Offer",
      price: opts.prijs,
      priceCurrency: "EUR",
      availability: opts.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "AutoDealer", name: company.name, telephone: company.phone.display },
    };
  }
  return schema;
}
