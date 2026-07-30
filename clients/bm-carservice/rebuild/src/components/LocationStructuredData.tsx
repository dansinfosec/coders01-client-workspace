import { Helmet } from "react-helmet-async";
import type { Location } from "@/data/locations";
import { SITE_URL } from "@/components/SEO";

const SCHEMA_DAY: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday",
};
const pad = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function buildOpeningSpecs(location: Location) {
  const groups = new Map<string, { days: string[]; ranges: Array<[number, number]> }>();
  for (const day of location.openingHours) {
    if (day.ranges.length === 0) continue;
    const key = JSON.stringify(day.ranges);
    const existing = groups.get(key);
    if (existing) existing.days.push(SCHEMA_DAY[day.weekday]!);
    else groups.set(key, { days: [SCHEMA_DAY[day.weekday]!], ranges: day.ranges });
  }
  const specs: Array<Record<string, unknown>> = [];
  for (const { days, ranges } of groups.values()) {
    for (const [open, close] of ranges) {
      specs.push({ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: pad(open), closes: pad(close) });
    }
  }
  return specs;
}

/**
 * Per-branch AutoRepair / LocalBusiness JSON-LD. Placeholder branches omit unverified
 * NAP fields (address/phone) so no unconfirmed data is emitted as structured facts.
 */
export function LocationStructuredData({ location }: { location: Location }) {
  const url = `${SITE_URL}/vestigingen/${location.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${url}#business`,
    name: location.name,
    url,
    areaServed: { "@type": "City", name: location.city },
    openingHoursSpecification: buildOpeningSpecs(location),
    priceRange: "€€",
  };
  if (!location.isPlaceholder) {
    if (location.phone) data.telephone = location.phone;
    if (location.email) data.email = location.email;
    data.address = {
      "@type": "PostalAddress",
      streetAddress: location.address,
      postalCode: location.postalCode,
      addressLocality: location.city,
      addressCountry: "NL",
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
