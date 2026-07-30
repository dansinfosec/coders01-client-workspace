import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { OccasionCard } from "@/components/occasions/OccasionCard";
import { getOccasions, getOccasionFacets } from "@/services/occasionService";
import type { Occasion } from "@/data/occasions";
import { paths } from "@/routes/paths";

/**
 * Homepage-occasionstrook: een selectie echte occasions. Desktop als 3-koloms grid,
 * mobiel als horizontale swipe-carrousel. Linkt door naar de volledige voorraad.
 */
export function HomeOccasions() {
  const [items, setItems] = useState<Occasion[]>([]);
  const total = getOccasionFacets().total;

  useEffect(() => {
    let alive = true;
    getOccasions({ sort: "nieuwste" }).then((list) => {
      if (alive) setItems(list.slice(0, 6));
    });
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <Section tone="surface" size="lg">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Occasions"
            title="Ons actuele occasionaanbod"
            intro={`Zorgvuldig geselecteerde auto's, onderhouden door onze eigen werkplaats. ${total} occasions op voorraad.`}
          />
          <Button to={paths.occasions} variant="outline" className="shrink-0">
            Volledige voorraad
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <ul className="no-scrollbar snap-x-mandatory mt-10 flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {items.map((o) => (
            <li key={o.slug} className="snap-start w-[80%] shrink-0 sm:w-[46%] lg:w-auto">
              <OccasionCard occasion={o} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
