/** Central route paths — import everywhere instead of hard-coding strings. */
export const ROUTES = {
  home: "/",
  diensten: "/diensten",
  projecten: "/projecten",
  overOns: "/over-ons",
  faq: "/veelgestelde-vragen",
  offerte: "/offerte",
  contact: "/contact",
} as const;

export type RouteKey = keyof typeof ROUTES;
