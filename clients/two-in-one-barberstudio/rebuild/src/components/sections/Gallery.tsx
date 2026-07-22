import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/utils/cn";
import { gallery } from "@/data/gallery";

export function Gallery() {
  return (
    <Section id="galerij" tone="muted" ariaLabel="Galerij">
      <SectionHeading eyebrow="Galerij" title="Ons werk & onze zaak" />

      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {gallery.map((img) => (
          <li
            key={img.src}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-line",
              img.span && "col-span-2 row-span-2",
            )}
          >
            <img
              src={img.src}
              alt={img.alt}
              className={cn(
                "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                img.span ? "aspect-square lg:aspect-[4/3]" : "aspect-square",
              )}
              loading="lazy"
            />
            <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-ink/70 px-1.5 py-0.5 text-[0.6rem] text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
              Foto: {img.attribution}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-text-muted">
        Foto&rsquo;s via Google Maps (© Two in one barberstudio en bijdragers). Tijdelijke
        previewbeelden — worden vervangen door eigen foto&rsquo;s van de ondernemer.
      </p>
    </Section>
  );
}
