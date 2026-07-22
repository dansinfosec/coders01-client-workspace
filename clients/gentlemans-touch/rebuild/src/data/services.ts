/**
 * Services & prices — SOURCE: Setmore booking page (verified live).
 * Only the three bookable services have prices (exactly as listed on Setmore).
 * "Haarpigmentatie" and "Tattoo removal" are mentioned in the Setmore "About"
 * as offered services but have NO listed price/booking product — shown without a
 * price and without a fabricated one. Booking product IDs are the real Setmore
 * links. Nothing invented.
 */
import { Scissors, CreditCard, Baby, Sparkles, Eraser, type LucideIcon } from "lucide-react";
import { business } from "./business";

export interface Service {
  name: string;
  description: string;
  price?: string;
  icon: LucideIcon;
  /** Direct Setmore booking link for this service, when available. */
  bookingUrl?: string;
}

const bookProduct = (pid: string) =>
  `${business.booking.base}?step=additional-products&products=${pid}&type=service`;

export const services: Service[] = [
  {
    name: "Herenknippen — contant",
    description: "Klassiek of modern herenkapsel, vakkundig geknipt en afgewerkt. Bij contante betaling.",
    price: "€25",
    icon: Scissors,
    bookingUrl: bookProduct("s8d86417fcd447bd49f3425d04c740db79416ef8a"),
  },
  {
    name: "Herenknippen — pinnen",
    description: "Hetzelfde verzorgde herenkapsel, af te rekenen met pin.",
    price: "€28",
    icon: CreditCard,
    bookingUrl: bookProduct("s43ae7fc2743caec582209b075c7270380b2bf045"),
  },
  {
    name: "Kinderknippen",
    description: "Een geduldige, ontspannen knipbeurt voor de jongsten.",
    price: "€20",
    icon: Baby,
    bookingUrl: bookProduct("s2857417a6d5ea1e0a29e63a61b953a5d7604149c"),
  },
  {
    name: "Haarpigmentatie",
    description: "Haarpigmentatie voor een voller ogend resultaat. Prijs op aanvraag.",
    icon: Sparkles,
  },
  {
    name: "Tattoo removal",
    description: "Verwijderen van tatoeages. Prijs en mogelijkheden op aanvraag.",
    icon: Eraser,
  },
];
