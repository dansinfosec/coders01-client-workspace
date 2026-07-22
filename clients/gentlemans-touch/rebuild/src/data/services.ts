/**
 * Services & prices for Gentleman's Touch.
 * Prices are the shop's published rates. "Haarpigmentatie" and "Tattoo removal"
 * are offered but have no fixed listed price — shown "op aanvraag", never a
 * fabricated one. Nothing invented.
 *
 * NOTE: no per-service online booking link is set — online booking is not yet
 * confirmed for Gentleman's Touch. Appointments are made by phone for now.
 */
import { Scissors, CreditCard, Baby, Sparkles, Eraser, type LucideIcon } from "lucide-react";

export interface Service {
  name: string;
  description: string;
  price?: string;
  icon: LucideIcon;
}

export const services: Service[] = [
  {
    name: "Herenknippen — contant",
    description: "Klassiek of modern herenkapsel, vakkundig geknipt en afgewerkt. Bij contante betaling.",
    price: "€25",
    icon: Scissors,
  },
  {
    name: "Herenknippen — pinnen",
    description: "Hetzelfde verzorgde herenkapsel, af te rekenen met pin.",
    price: "€28",
    icon: CreditCard,
  },
  {
    name: "Kinderknippen",
    description: "Een geduldige, ontspannen knipbeurt voor de jongsten.",
    price: "€20",
    icon: Baby,
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
