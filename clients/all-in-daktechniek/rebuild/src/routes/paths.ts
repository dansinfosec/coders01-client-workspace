/** Central route paths — import everywhere instead of hard-coding strings. */
export const ROUTES = {
  home: "/",
  diensten: "/diensten",
  projecten: "/projecten",
  werkgebied: "/werkgebied",
  overOns: "/over-ons",
  faq: "/veelgestelde-vragen",
  offerte: "/offerte",
  contact: "/contact",
} as const;

export type RouteKey = keyof typeof ROUTES;

/** Build a service detail path from a slug. */
export const servicesPath = (slug: string): string => `/diensten/${slug}`;
export const SERVICE_DETAIL_PATTERN = "/diensten/:slug";
