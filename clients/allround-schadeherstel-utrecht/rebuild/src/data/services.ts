import type { LucideIcon } from "lucide-react";
import {
  Search, Hammer, Sparkles, SprayCan, ShieldCheck, Building2,
} from "lucide-react";

export interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Services are described safely and generally. "Spuit- en lakwerk" is included
 * because the supplied logo explicitly features a spray gun / refinishing motif,
 * making it a credible service to mention. Where scope is uncertain the copy
 * invites a conversation rather than promising a specific technique.
 */
export const services: Service[] = [
  {
    icon: Search,
    title: "Schadebeoordeling",
    description:
      "We bekijken de schade — ter plaatse of aan de hand van foto's — en " +
      "bespreken helder welke herstelmogelijkheden er zijn.",
  },
  {
    icon: Hammer,
    title: "Carrosserie- en plaatschade",
    description:
      "Herstel van deuken, krassen en beschadigde panelen, gericht op een nette " +
      "en degelijke afwerking.",
  },
  {
    icon: SprayCan,
    title: "Spuit- en lakwerk",
    description:
      "Voorbereiding en afwerking van het lakwerk, zodat het herstelde deel weer " +
      "netjes aansluit op de rest van het voertuig.",
  },
  {
    icon: Sparkles,
    title: "Herstel en afwerking",
    description:
      "Aandacht voor de details en een verzorgde oplevering. Vraag naar de " +
      "mogelijkheden voor uw specifieke schade.",
  },
  {
    icon: ShieldCheck,
    title: "Verzekeringsschade",
    description:
      "Gaat het om een verzekeringskwestie? Geef dit aan, dan bekijken we samen " +
      "de schade en de mogelijke vervolgstappen.",
  },
  {
    icon: Building2,
    title: "Zakelijk schadeherstel",
    description:
      "Schadeherstel voor bedrijven, garages en zakelijke voertuigeigenaren. " +
      "Persoonlijk overleg over wat er nodig is.",
  },
];
