import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { company, fullAddress } from "@/data/company";
import { serviceArea } from "@/data/serviceArea";

/**
 * Werkgebied / local-SEO section. The current site does not list a coverage area,
 * so we show the confirmed base location and an honest note. The town list stays
 * empty until Borre confirms it (serviceArea.towns). Do not invent regions.
 */
export function ServiceAreaSection() {
  const hasTowns = serviceArea.towns.length > 0;
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Werkgebied</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">
          Uw dakdekker in {serviceArea.base.city} en omgeving
        </h2>
        <p className="mt-4 text-text-body">
          Wij zijn gevestigd in {serviceArea.base.city} (gemeente {serviceArea.base.municipality}) en
          werken in de directe omgeving. {serviceArea.note}
        </p>

        {hasTowns ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {serviceArea.towns.map((town) => (
              <li
                key={town}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-text-strong"
              >
                {town}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-line bg-surface-muted px-4 py-3 text-sm text-text-muted">
            Twijfelt u of wij bij u werken? Bel of app ons even — dan vertellen wij het u direct.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href={company.phonePrimary.href} variant="primary">
            <Phone className="h-5 w-5" aria-hidden="true" />
            {company.phonePrimary.display}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
          <div>
            <p className="font-semibold text-text-strong">{company.name}</p>
            <p className="mt-1 text-sm text-text-body">{fullAddress}</p>
          </div>
        </div>
        {/* A live Google Maps embed can be added once the client confirms placement. */}
        <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line bg-surface-muted text-center text-sm text-text-muted">
          Kaart volgt — Google Maps wordt toegevoegd na akkoord van de klant.
        </div>
      </div>
    </div>
  );
}
