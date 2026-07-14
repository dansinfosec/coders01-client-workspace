import { ROUTES } from "@/routes/paths";

export interface NavItem {
  label: string;
  to: string;
}

export const mainNav: NavItem[] = [
  { label: "Home", to: ROUTES.home },
  { label: "Diensten", to: ROUTES.diensten },
  { label: "Projecten", to: ROUTES.projecten },
  { label: "Over ons", to: ROUTES.overOns },
  { label: "Veelgestelde vragen", to: ROUTES.faq },
  { label: "Contact", to: ROUTES.contact },
];

export const footerNav: NavItem[] = [
  { label: "Diensten", to: ROUTES.diensten },
  { label: "Projecten", to: ROUTES.projecten },
  { label: "Over ons", to: ROUTES.overOns },
  { label: "Veelgestelde vragen", to: ROUTES.faq },
  { label: "Offerte aanvragen", to: ROUTES.offerte },
  { label: "Contact", to: ROUTES.contact },
];
