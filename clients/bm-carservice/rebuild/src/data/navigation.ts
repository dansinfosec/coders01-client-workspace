import { services, servicePath } from "./services";
import { apkHub, apkLandings } from "./apkLandings";
import { distributiekettingHub, distributiekettingBrands } from "./distributieketting";

export interface NavLink {
  label: string;
  to: string;
}
export interface NavItem {
  label: string;
  to?: string;
  /** When present, renders a dropdown. */
  children?: NavLink[];
}

/** Primary header navigation. Afspraak/Bel live as CTAs, not in this list. */
export const primaryNav: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "APK",
    to: apkHub.path,
    children: [
      { label: "APK zonder afspraak", to: apkHub.path },
      ...apkLandings.map((l) => ({ label: l.title, to: l.path })),
    ],
  },
  {
    label: "Diensten",
    to: "/diensten",
    children: [
      { label: "Alle diensten", to: "/diensten" },
      ...services.map((s) => ({ label: s.title, to: servicePath(s) })),
    ],
  },
  {
    label: "Distributieketting",
    to: distributiekettingHub.path,
    children: [
      { label: "Overzicht & prijzen", to: distributiekettingHub.path },
      ...distributiekettingBrands.map((b) => ({ label: b.title.replace("Distributieketting ", "").replace(" vervangen", ""), to: b.path })),
    ],
  },
  { label: "Chiptuning", to: "/chiptuning" },
  { label: "ANWB", to: "/anwb" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

/** Footer link columns. */
export const footerNav: Array<{ heading: string; links: NavLink[] }> = [
  {
    heading: "Diensten",
    links: [
      { label: "APK zonder afspraak", to: apkHub.path },
      { label: "Auto onderhoud", to: "/diensten/onderhoud" },
      { label: "Autobanden", to: "/diensten/autobanden" },
      { label: "Autoreparatie", to: "/diensten/reparatie" },
      { label: "Distributieketting", to: distributiekettingHub.path },
      { label: "Alle diensten", to: "/diensten" },
    ],
  },
  {
    heading: "APK & locaties",
    links: [
      { label: "APK Amsterdam", to: "/apk-keuring-amsterdam" },
      { label: "APK Aalsmeer", to: "/apk-keuring-aalsmeer" },
      { label: "APK Uithoorn", to: "/apk-keuring-uithoorn" },
      { label: "APK check Amstelveen", to: "/apk-zonder-afspraak/apk-check-amstelveen" },
    ],
  },
  {
    heading: "BM Carservice",
    links: [
      { label: "ANWB Partnerbedrijf", to: "/anwb" },
      { label: "Chiptuning", to: "/chiptuning" },
      { label: "Reviews", to: "/reviews" },
      { label: "Afspraak maken", to: "/afspraak" },
      { label: "Contact", to: "/contact" },
    ],
  },
];
