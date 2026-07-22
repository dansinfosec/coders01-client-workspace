import { Star, Scissors, Baby } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { business } from "@/data/business";

/**
 * About — a short, professional description. No invented history, years of
 * experience or claims. Only real facts: the services offered, the location, and
 * the public Google rating.
 */
export function About() {
  return (
    <Section id="over-ons" ariaLabel="Over ons">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="eyebrow">Over ons</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Vakmanschap in {business.city}</h2>
          <div className="barber-rule mt-4 w-16 rounded" />
          <div className="mt-5 space-y-4 text-text-body">
            <p>
              Two in one barberstudio is een barbershop in {business.city} die draait om verzorgd
              herenknippen en een nette afwerking. Van een klassiek kapsel tot een strakke fade —
              u zit bij ons in goede handen.
            </p>
            <p>
              Ook de jongsten zijn welkom voor een kinderknipbeurt, en voor haarpigmentatie of
              tattoo removal kunt u een afspraak maken. Onze klanten waarderen ons met een
              {" "}{business.rating.toFixed(1)} op Google.
            </p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: Scissors, label: "Herenknippen" },
              { icon: Baby, label: "Kinderknippen" },
              { icon: Star, label: `${business.rating.toFixed(1)} op Google` },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted px-4 py-2 text-sm font-semibold text-text-strong"
              >
                <Icon className="h-4 w-4 text-cream" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 overflow-hidden rounded-2xl border border-line shadow-soft lg:order-2">
          <img
            src="/images/google-preview/barber-portrait.webp"
            alt="Barbier van Two in one barberstudio aan het werk"
            className="h-full w-full object-cover"
            loading="lazy"
            width={900}
            height={1200}
          />
        </div>
      </div>
    </Section>
  );
}
