import { MapPin } from "lucide-react";
import { company } from "@/data/company";
import { Tag } from "@/components/ui/Tag";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Werkgebied — the four cities BM serves, as mono signage tags. */
export function ServiceAreaSection() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <SectionHeading
        eyebrow="Werkgebied"
        title="Vakgarage voor Amstelveen en omgeving"
        intro="Vanuit onze werkplaats aan de Bouwerij in Amstelveen helpen we automobilisten uit de hele regio."
      />
      <div className="flex flex-wrap gap-2.5">
        {company.serviceArea.map((city) => (
          <Tag key={city} tone="outline" className="text-sm">
            <MapPin className="h-3.5 w-3.5" /> {city}
          </Tag>
        ))}
      </div>
    </div>
  );
}
