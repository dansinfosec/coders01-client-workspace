/** Centrale padconstanten — nergens hardgecodeerde route-strings in componenten. */
export const paths = {
  home: "/",
  diensten: "/diensten",
  dienst: (slug: string) => `/diensten/${slug}`,
  apk: "/diensten/apk-keuring",
  occasions: "/occasions",
  occasion: (slug: string) => `/occasions/${slug}`,
  afspraak: "/afspraak",
  autoVerkopen: "/auto-verkopen",
  overOns: "/over-ons",
  contact: "/contact",
  vacature: "/vacatures",
} as const;
