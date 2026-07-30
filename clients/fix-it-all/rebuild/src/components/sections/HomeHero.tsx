import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { KentekenInput } from "@/components/KentekenInput";
import { assets } from "@/config/assets";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { getOpenState } from "@/lib/openingHours";
import { isValidKenteken } from "@/lib/kenteken";
import { cn } from "@/utils/cn";

/**
 * Homepage-hero — full-width werkplaatsbeeld met graphite-overlay, sterke headline en de
 * signature kentekencheck. De invoer start de afspraakflow met het kenteken voorgevuld;
 * de RDW-opzoeking gebeurt daar.
 */
export function HomeHero() {
  const [kenteken, setKenteken] = useState("");
  const navigate = useNavigate();
  const open = getOpenState(company.openingHours);
  const valid = isValidKenteken(kenteken);

  const start = () => navigate(`${paths.afspraak}${kenteken ? `?kenteken=${kenteken}` : ""}`);
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <section className="relative isolate overflow-hidden bg-asphalt text-paper">
      {/* Achtergrondbeeld (echte gevel/forecourt) + graphite-overlays voor leesbaarheid */}
      <div className="absolute inset-0 -z-10">
        <img
          src={assets.heroWorkshop}
          alt=""
          aria-hidden
          className="h-full w-full origin-center object-cover object-[62%_center] animate-hero-zoom sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-asphalt-900 via-asphalt-900/90 to-asphalt-900/30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-asphalt-900 via-asphalt-900/10 to-asphalt-900/40" aria-hidden />
      </div>

      <Container className="relative">
        <div className="flex min-h-[29rem] flex-col justify-center py-14 sm:min-h-[38rem] sm:py-16 lg:min-h-[44rem] lg:py-24">
          <div className="max-w-2xl">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 animate-fade-up">
              <span className="eyebrow text-torque">Onafhankelijke vakgarage · {company.address.city}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-2xs uppercase tracking-label text-paper/80">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", open.open ? "bg-status-available" : "bg-status-soon")}
                  aria-hidden
                />
                {open.open ? "Nu open" : "Nu gesloten"}
              </span>
            </p>

            <h1
              className="mt-5 text-balance font-display text-[clamp(1.9rem,7.5vw,3.75rem)] font-bold leading-[1.08] tracking-tightish text-paper animate-fade-up sm:leading-[1.04]"
              style={delay(80)}
            >
              Vakwerk voor uw auto — <span className="text-torque">APK</span>, onderhoud &amp; occasions
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/80 animate-fade-up" style={delay(160)}>
              Sinds {company.foundedYear} uw vertrouwde adres in {company.address.city}. Persoonlijke aandacht en
              eerlijk advies voor alle merken — van keuring en onderhoud tot een zorgvuldig geselecteerde occasion.
            </p>

            {/* Signature: kentekencheck */}
            <form
              className="mt-8 max-w-xl rounded-2xl border border-white/10 bg-asphalt-900/55 p-4 shadow-lift backdrop-blur animate-fade-up sm:p-5"
              style={delay(240)}
              onSubmit={(e) => {
                e.preventDefault();
                start();
              }}
            >
              <label
                htmlFor="hero-kenteken"
                className="mb-2 block font-mono text-2xs uppercase tracking-label text-paper/65"
              >
                Voer uw kenteken in — wij regelen de rest
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <KentekenInput
                  id="hero-kenteken"
                  value={kenteken}
                  onValueChange={setKenteken}
                  aria-label="Kenteken"
                  size="md"
                  className="w-full sm:w-[15rem] sm:max-w-none"
                />
                <Button type="submit" size="lg" className="sm:h-auto">
                  Check &amp; afspraak
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </div>
              <p className="mt-2 font-mono text-2xs text-paper/50">
                {kenteken && !valid
                  ? "Nog geen volledig kenteken — u kunt ook zonder verder."
                  : "U kunt ook een afspraak maken zonder kenteken."}
              </p>
            </form>

            {/* Primaire + secundaire CTA */}
            <div className="mt-6 flex flex-col gap-3 animate-fade-up sm:flex-row sm:flex-wrap" style={delay(320)}>
              <Button to={paths.afspraak} size="lg">
                Afspraak maken
              </Button>
              <Button to={paths.occasions} variant="outlineInvert" size="lg">
                Bekijk occasions
              </Button>
            </div>

            {/* Trust-strip */}
            <ul
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-2xs uppercase tracking-label text-paper/65 animate-fade-up"
              style={delay(400)}
            >
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-petrol-soft" aria-hidden /> RDW-erkende APK
              </li>
              <li>Alle merken</li>
              <li>Eigen werkplaats</li>
              <li>Sinds {company.foundedYear}</li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
