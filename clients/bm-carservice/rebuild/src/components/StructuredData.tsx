import { Helmet } from "react-helmet-async";
import { company } from "@/data/company";
import { SITE_URL } from "@/components/SEO";

const SCHEMA_DAY: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const pad = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Build openingHoursSpecification, grouping days that share identical ranges. */
function buildOpeningSpecs() {
  const groups = new Map<string, { days: string[]; ranges: Array<[number, number]> }>();
  for (const day of company.openingHours) {
    if (day.ranges.length === 0) continue;
    const key = JSON.stringify(day.ranges);
    const existing = groups.get(key);
    if (existing) existing.days.push(SCHEMA_DAY[day.weekday]!);
    else groups.set(key, { days: [SCHEMA_DAY[day.weekday]!], ranges: day.ranges });
  }
  const specs: Array<Record<string, unknown>> = [];
  for (const { days, ranges } of groups.values()) {
    for (const [open, close] of ranges) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens: pad(open),
        closes: pad(close),
      });
    }
  }
  return specs;
}

/**
 * AutoRepair / LocalBusiness JSON-LD, built only from confirmed facts (NAP, opening hours,
 * areaServed). No AggregateRating until the review source is verified with the client —
 * this is the biggest local-SEO win vs. the current site, which has no schema at all.
 */
export function StructuredData() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${SITE_URL}/#business`,
    name: company.name,
    slogan: company.slogan,
    url: SITE_URL,
    telephone: company.phone.display,
    email: company.email,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: company.address.country,
    },
    areaServed: company.serviceArea.map((city) => ({ "@type": "City", name: city })),
    openingHoursSpecification: buildOpeningSpecs(),
    description:
      "Onafhankelijke autogarage in Amstelveen voor APK zonder afspraak, onderhoud, banden, reparatie, distributieketting en storingsdiagnose. RDW-erkend en ANWB-partnerbedrijf.",
    sameAs: [company.social.twitter],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
