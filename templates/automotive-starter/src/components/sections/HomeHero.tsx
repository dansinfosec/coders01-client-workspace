import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Phone, MapPin, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { KentekenInput } from "@/components/KentekenInput";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { getOpenState } from "@/lib/openingHours";
import { isValidKenteken } from "@/lib/kenteken";
import { cn } from "@/utils/cn";

/**
 * Homepage-hero — signature: directe kentekencheck.
 * De invoer start de afspraakflow met het kenteken voorgevuld; de RDW-opzoeking gebeurt daar.
 */
export function HomeHero() {
  const [kenteken, setKenteken] = useState("");
  const navigate = useNavigate();
  const open = getOpenState(company.openingHours);
  const valid = isValidKenteken(kenteken);

  const start = () => {
    navigate(`${paths.afspraak}${kenteken ? `?kenteken=${kenteken}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-asphalt text-paper">
      <div className="blueprint pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-petrol/25 blur-3xl"
        aria-hidden
      />
      <Container className="relative">
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8 lg:py-24">
          {/* Tekst + kentekencheck */}
          <div className="animate-fade-up">
            <p className="eyebrow text-torque">
              Onafhankelijke vakgarage · {company.address.city}
              {company.foundedYear !== null ? ` · sinds ${company.foundedYear}` : ""}
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.03] tracking-tightish text-paper sm:text-5xl lg:text-6xl">
              Uw pitstop voor <span className="text-petrol-soft">APK</span>, onderhoud en occasions
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/75">
              Persoonlijke aandacht en eerlijk advies voor alle merken. Van APK en onderhoud tot uitlaatwerk,
              airco, banden en occasions — allemaal onder één dak in {company.address.city}.
            </p>

            {/* Kentekencheck */}
            <form
              className="mt-8 max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                start();
              }}
            >
              <label htmlFor="hero-kenteken" className="mb-2 block font-mono text-2xs uppercase tracking-label text-paper/60">
                Voer uw kenteken in — wij regelen de rest
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <KentekenInput
                  id="hero-kenteken"
                  value={kenteken}
                  onValueChange={setKenteken}
                  aria-label="Kenteken"
                  className="sm:max-w-[13rem]"
                />
                <Button type="submit" size="lg" className="sm:h-auto">
                  Afspraak starten
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </div>
              <p className="mt-2 font-mono text-2xs text-paper/45">
                {kenteken && !valid
                  ? "Nog geen volledig kenteken — u kunt ook zonder verder."
                  : "U kunt ook een afspraak maken zonder kenteken."}
              </p>
            </form>

            {/* Trust-rij */}
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-2xs uppercase tracking-label text-paper/60">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-petrol-soft" aria-hidden /> RDW-erkende APK
              </li>
              <li>Alle merken</li>
              <li>Eerlijk advies</li>
            </ul>
          </div>

          {/* Statuskaart */}
          <div className="animate-fade-up rounded-2xl border border-line-invert bg-asphalt-800/80 p-6 shadow-lift backdrop-blur sm:p-7">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex h-2.5 w-2.5 rounded-full",
                  open.open ? "bg-status-available" : "bg-status-soon",
                )}
                aria-hidden
              />
              <span className="font-mono text-sm font-semibold text-paper">{open.message}</span>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-petrol-soft" aria-hidden />
                <div>
                  <dt className="font-mono text-2xs uppercase tracking-label text-paper/50">Adres</dt>
                  <dd className="mt-0.5 text-paper/90">
                    {company.address.street}, {company.address.postalCode} {company.address.city}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-petrol-soft" aria-hidden />
                <div>
                  <dt className="font-mono text-2xs uppercase tracking-label text-paper/50">Telefoon</dt>
                  <dd className="mt-0.5">
                    <a href={company.phone.href} className="font-mono text-paper/90 hover:text-white">
                      {company.phone.display}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <Button href={company.phone.href} variant="invert" block>
                <Phone className="h-4 w-4" aria-hidden />
                Bel {company.phone.display}
              </Button>
              <Button to={paths.occasions} variant="outlineInvert" block>
                Bekijk onze occasions
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
