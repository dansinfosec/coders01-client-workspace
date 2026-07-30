import { MapPin } from "lucide-react";
import { images } from "@/lib/images";
import { company } from "@/data/company";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const shots = [
  { img: images.garageExterior, caption: "Gevel · Bouwerij 69A", span: "sm:col-span-2 lg:col-span-2 lg:row-span-2" },
  { img: images.reception, caption: "Receptie", span: "" },
  { img: images.workshopDetail, caption: "Werkplaats", span: "" },
];

/** "Onze garage" — a refined photo showcase echoing the building's WERKPLAATS/RECEPTIE signage. */
export function GarageShowcase() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Onze garage"
          title="Kom langs in Amstelveen"
          intro="Een moderne, lichte werkplaats met vijf bruggen en een gastvrije receptie — u ziet precies waar uw auto in goede handen is."
        />
        <Button href={company.address.mapsUrl} target="_blank" rel="noopener noreferrer" variant="outline">
          <MapPin className="h-4 w-4" /> Bekijk de route
        </Button>
      </div>

      <div className="mt-10 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shots.map(({ img, caption, span }) => (
          <figure
            key={caption}
            className={`group relative overflow-hidden rounded-2xl ring-1 ring-ink/10 ${span}`}
          >
            <img
              src={img.src}
              width={img.width}
              height={img.height}
              alt={img.alt}
              loading="lazy"
              className="h-full min-h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <figcaption className="absolute bottom-3 left-3 bg-ink/85 px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-signal">
              {caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
