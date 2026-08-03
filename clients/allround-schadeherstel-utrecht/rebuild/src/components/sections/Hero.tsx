import { ClipboardCheck, Phone, Navigation } from "lucide-react";
import { business, directionsUrl, CTA_LABEL } from "@/data/business";
import { heroImage } from "@/data/gallery";
import { vehicleCategories } from "@/data/vehicles";
import { Container } from "@/components/ui/Container";
import { VehicleIcon } from "@/components/ui/VehicleIcon";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-surface">
      {/* Background atmosphere image (AI-generated) with legibility overlays. */}
      <div className="absolute inset-0">
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          width={1376}
          height={768}
          className="h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-surface/20" />
        <div className="diagonal-grid absolute inset-0 opacity-60" aria-hidden />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
          Sfeerimpressie
        </span>
      </div>

      <Container className="relative">
        <div className="max-w-2xl py-20 sm:py-28 lg:py-36">
          <p className="eyebrow">
            <span className="accent-rule" aria-hidden />
            Schadeherstel · Woerden e.o.
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-text-strong sm:text-5xl lg:text-6xl">
            Allround schadeherstel voor{" "}
            <span className="text-orange">ieder voertuig</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-body">
            Schade aan uw auto, motor, scooter of boot? Wij bekijken de schade,
            bespreken de mogelijkheden en zorgen voor een passende
            hersteloplossing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#aanvraag"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <ClipboardCheck className="h-5 w-5" aria-hidden />
              {CTA_LABEL}
            </a>
            <a
              href={business.phone.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-muted/70 px-6 py-3.5 text-base font-semibold text-text-strong backdrop-blur transition-colors hover:border-orange hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Phone className="h-5 w-5" aria-hidden />
              Bel direct
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold text-text-body transition-colors hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Navigation className="h-5 w-5" aria-hidden />
              Route
            </a>
          </div>

          {/* Vehicle-type quick chips */}
          <ul className="mt-10 flex flex-wrap gap-2">
            {vehicleCategories.map((v) => (
              <li
                key={v.key}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted/60 px-3.5 py-2 text-sm font-medium text-text-body backdrop-blur"
              >
                <VehicleIcon name={v.key} className="h-4 w-4 text-orange" />
                {v.title.replace("schade", "")}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
