import { PhoneCall, Search, FileText, Hammer, CheckCircle2, type LucideIcon } from "lucide-react";

export interface ProcessStep {
  id: string;
  order: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Practical, believable work process. */
export const processSteps: ProcessStep[] = [
  { id: "aanvraag", order: 1, title: "Aanvraag", icon: PhoneCall,
    description: "U neemt contact op of vraagt een inspectie of offerte aan. Vertel kort wat er speelt." },
  { id: "inspectie", order: 2, title: "Inspectie", icon: Search,
    description: "We beoordelen uw platte dak op locatie, zodat we weten wat er nodig is." },
  { id: "advies", order: 3, title: "Advies en offerte", icon: FileText,
    description: "U ontvangt een helder advies met een passende offerte. Zonder verplichtingen." },
  { id: "uitvoering", order: 4, title: "Uitvoering", icon: Hammer,
    description: "Onze vakmensen voeren het werk vakkundig en netjes uit." },
  { id: "oplevering", order: 5, title: "Oplevering", icon: CheckCircle2,
    description: "We leveren het werk op en lopen samen het resultaat na." },
];
