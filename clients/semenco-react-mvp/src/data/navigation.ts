import type { NavItem } from "@/types/content";
import { ROUTES } from "@/routes/paths";

/** Primary navigation shown in the header and mobile menu. */
export const primaryNavigation: NavItem[] = [
  { label: "Home", to: ROUTES.home },
  { label: "Over ons", to: ROUTES.about },
  { label: "Logeeropvang", to: ROUTES.logeeropvang },
  { label: "Vakantieopvang", to: ROUTES.vakantieopvang },
  { label: "Crisisopvang", to: ROUTES.crisisopvang },
  { label: "Werkwijze", to: ROUTES.werkwijze },
  { label: "Blog", to: ROUTES.blog },
  { label: "Contact", to: ROUTES.contact },
];

/** Secondary/footer links (kept separate so the two can diverge later). */
export const footerNavigation: NavItem[] = [
  { label: "Over ons", to: ROUTES.about },
  { label: "Logeeropvang", to: ROUTES.logeeropvang },
  { label: "Vakantieopvang", to: ROUTES.vakantieopvang },
  { label: "Crisisopvang", to: ROUTES.crisisopvang },
  { label: "Werkwijze", to: ROUTES.werkwijze },
  { label: "Aanmelden", to: ROUTES.aanmelden },
  { label: "Blog", to: ROUTES.blog },
  { label: "Contact", to: ROUTES.contact },
];

/** The prominent conversion action reused in the header. */
export const primaryCta: NavItem = { label: "Aanmelden", to: ROUTES.aanmelden };
