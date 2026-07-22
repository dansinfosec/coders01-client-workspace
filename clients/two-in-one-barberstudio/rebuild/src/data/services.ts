/**
 * Services & prices — SOURCE: Setmore booking page (verified live 2026-07-22).
 * Setmore labels/prices: "Kinderen 20€", "Man cash 25€", "pinnen 28€".
 * Presented in clean Dutch with the exact prices and the REAL per-service Setmore
 * booking links. "Haarpigmentatie" and "Tattoo removal" are offered (Setmore
 * "Barber pigmentation and tattoo removal") but have no listed price — shown
 * "op aanvraag", never a fabricated one. Nothing invented.
 */
import { Scissors, CreditCard, Baby, Sparkles, Eraser, type LucideIcon } from "lucide-react";
import { business } from "./business";

export interface Service {
  name: string;
  description: string;
  price?: string;
  icon: LucideIcon;
  /** Real per-service Setmore booking link, when available. */
  bookingUrl?: string;
}

const staff = "rd07e3a73b206ece73eea5918191f9b0f190950e9-d";
const bookProduct = (pid: string) =>
  `${business.booking.base}?step=additional-products&products=${pid}&type=service&staff=${staff}&staffSelected=false`;

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
