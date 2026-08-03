import { Building2, Warehouse, Truck, Store, Handshake, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/Section";

const audiences = [
  { icon: Warehouse, label: "Autobedrijven en garages" },
  { icon: Truck, label: "Wagenparkbeheerders" },
  { icon: Store, label: "Dealers en handelsbedrijven" },
  { icon: Building2, label: "Zakelijke voertuigeigenaren" },
  { icon: Handshake, label: "Tussenpersonen bij schadegevallen" },
];

export function Business() {
  return (
    <Section id="zakelijk" aria-labelledby="zakelijk-title">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative order-last overflow-hidden rounded-2xl border border-line lg:order-first">
          <img
            src="/images/ai-preview/b2b-wagenpark.webp"
            alt="Sfeerimpressie: meerdere neutrale bedrijfsvoertuigen in een georganiseerde schadeherstelwerkplaats"
            width={1200}
            height={805}
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
            Sfeerimpressie
          </span>
        </div>

        <div>
          <p className="eyebrow">
            <span className="accent-rule" aria-hidden />
            Voor bedrijven
          </p>
          <h2 id="zakelijk-title" className="mt-4 text-3xl font-bold sm:text-4xl">
            Een vaste partij voor zakelijk schadeherstel
          </h2>
          <p className="mt-4 text-text-body">
            We werken graag samen met bedrijven en partners die schadeherstel
            willen uitbesteden aan één aanspreekpunt. Kort overleg, duidelijke
            communicatie en aandacht voor een nette afwerking.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {audiences.map((a) => (
              <li
                key={a.label}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface-muted/50 px-4 py-3"
              >
                <a.icon className="h-5 w-5 shrink-0 text-orange" aria-hidden />
                <span className="text-sm font-medium text-text-body">{a.label}</span>
              </li>
            ))}
          </ul>

          <a
            href="#aanvraag"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-orange px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-orange-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Zakelijke samenwerking bespreken
            <ArrowRight className="h-5 w-5" aria-hidden />
          </a>
        </div>
      </div>
    </Section>
  );
}
