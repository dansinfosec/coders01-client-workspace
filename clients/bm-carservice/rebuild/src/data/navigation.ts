import { locations } from "./locations";

export interface NavLink {
  label: string;
  to: string;
}
export interface NavItem {
  label: string;
  /** Landing route for the item itself (also the dropdown's own link). */
  to: string;
  /** When present, renders an accessible dropdown / expandable submenu. */
  children?: NavLink[];
}

/**
 * Single source of truth for primary navigation — used by BOTH the desktop nav and the
 * mobile drawer (never duplicate link data). Afspraak maken is a CTA, not a nav item.
 */
export const primaryNav: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "Diensten",
    to: "/diensten",
    children: [
      { label: "Alle diensten", to: "/diensten" },
      { label: "APK zonder afspraak", to: "/apk-zonder-afspraak" },
      { label: "Auto onderhoud", to: "/diensten/onderhoud" },
      { label: "Autobanden", to: "/diensten/autobanden" },
      { label: "Autoreparatie", to: "/diensten/reparatie" },
      { label: "Distributieketting", to: "/distributieketting" },
      { label: "Chiptuning", to: "/chiptuning" },
      { label: "ANWB Partnerbedrijf", to: "/anwb" },
    ],
  },
  {
    label: "Vestigingen",
    to: "/vestigingen",
    children: [
      ...locations.map((l) => ({ label: l.city, to: `/vestigingen/${l.slug}` })),
      { label: "Alle vestigingen", to: "/vestigingen" },
    ],
  },
  { label: "Over BM Carservice", to: "/over-ons" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

/** Footer link columns. */
export const footerNav: Array<{ heading: string; links: NavLink[] }> = [
  {
    heading: "Diensten",
    links: [
      { label: "APK zonder afspraak", to: "/apk-zonder-afspraak" },
      { label: "Auto onderhoud", to: "/diensten/onderhoud" },
      { label: "Autobanden", to: "/diensten/autobanden" },
      { label: "Distributieketting", to: "/distributieketting" },
      { label: "Alle diensten", to: "/diensten" },
    ],
  },
  {
    heading: "Vestigingen",
    links: [
      ...locations.map((l) => ({ label: `Vestiging ${l.city}`, to: `/vestigingen/${l.slug}` })),
      { label: "Alle vestigingen", to: "/vestigingen" },
    ],
  },
  {
    heading: "BM Carservice",
    links: [
      { label: "Over BM Carservice", to: "/over-ons" },
      { label: "ANWB Partnerbedrijf", to: "/anwb" },
      { label: "Reviews", to: "/reviews" },
      { label: "Afspraak maken", to: "/afspraak-maken" },
      { label: "Contact", to: "/contact" },
    ],
  },
];
