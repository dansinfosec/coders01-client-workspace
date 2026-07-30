import { paths } from "@/routes/paths";
import { services, serviceOrder, getService } from "@/data/services";
import { features } from "@/config/features";

export interface NavLink {
  label: string;
  to: string;
  /** Optioneel: subitems (dropdown) voor Diensten. */
  children?: { label: string; to: string; description?: string }[];
}

const serviceChildren = serviceOrder
  .map((slug) => getService(slug))
  .filter((s): s is NonNullable<typeof s> => Boolean(s))
  .map((s) => ({ label: s.shortLabel, to: paths.dienst(s.slug), description: s.summary }));

/**
 * Hoofdnavigatie (desktop + mobiel putten hieruit). Links worden weggelaten
 * wanneer de bijbehorende feature-flag uitstaat, zodat er nooit dode links zijn.
 */
export const primaryNav: NavLink[] = [
  { label: "Home", to: paths.home },
  { label: "Diensten", to: paths.diensten, children: serviceChildren },
  { label: "APK-keuring", to: paths.apk },
  ...(features.occasions ? [{ label: "Occasions", to: paths.occasions }] : []),
  ...(features.vehicleSale ? [{ label: "Auto verkopen", to: paths.autoVerkopen }] : []),
  { label: "Over ons", to: paths.overOns },
  { label: "Contact", to: paths.contact },
];

/** Footer-kolommen (ook feature-gated). */
export const footerNav = {
  diensten: services.map((s) => ({ label: s.shortLabel, to: paths.dienst(s.slug) })),
  ontdek: [
    ...(features.occasions ? [{ label: "Occasions", to: paths.occasions }] : []),
    ...(features.vehicleSale ? [{ label: "Auto verkopen", to: paths.autoVerkopen }] : []),
    ...(features.appointments ? [{ label: "Afspraak maken", to: paths.afspraak }] : []),
    { label: "Over ons", to: paths.overOns },
    ...(features.vacancies ? [{ label: "Vacatures", to: paths.vacature }] : []),
    { label: "Contact", to: paths.contact },
  ],
};
