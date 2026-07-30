import { paths } from "@/routes/paths";
import { services, serviceOrder, getService } from "@/data/services";

export interface NavLink {
  label: string;
  to: string;
  /** Optioneel: subitems (dropdown) voor Diensten. */
  children?: { label: string; to: string; description?: string }[];
}

/** Hoofdnavigatie (desktop + mobiel putten hieruit). */
export const primaryNav: NavLink[] = [
  { label: "Home", to: paths.home },
  {
    label: "Diensten",
    to: paths.diensten,
    children: serviceOrder
      .map((slug) => getService(slug))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => ({ label: s.shortLabel, to: paths.dienst(s.slug), description: s.summary })),
  },
  { label: "APK-keuring", to: paths.apk },
  { label: "Occasions", to: paths.occasions },
  { label: "Auto verkopen", to: paths.autoVerkopen },
  { label: "Over ons", to: paths.overOns },
  { label: "Contact", to: paths.contact },
];

/** Footer-kolommen. */
export const footerNav = {
  diensten: services.map((s) => ({ label: s.shortLabel, to: paths.dienst(s.slug) })),
  ontdek: [
    { label: "Occasions", to: paths.occasions },
    { label: "Auto verkopen", to: paths.autoVerkopen },
    { label: "Afspraak maken", to: paths.afspraak },
    { label: "Over ons", to: paths.overOns },
    { label: "Vacatures", to: paths.vacature },
    { label: "Contact", to: paths.contact },
  ],
};
