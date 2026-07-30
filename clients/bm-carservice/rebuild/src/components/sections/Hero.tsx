import { Phone, Check } from "lucide-react";
import { company } from "@/data/company";
import { formatRanges, getOpenStatus } from "@/lib/openingHours";
import { images } from "@/lib/images";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { StatusPill } from "@/components/ui/StatusPill";

/**
 * Signature hero — a full-bleed workshop photo under an ink gradient, with a floating
 * glass "reception board": live open/closed status + BM's headline advantage (APK zonder
 * afspraak). Premium, credible, and it leads with the walk-in proposition.
 */
export function Hero() {
  const today = company.openingHours.find((d) => d.weekday === new Date().getDay());
  const status = getOpenStatus();

  const boardRows = [
    { k: "Status", v: status.label },
    { k: "Vandaag", v: today ? formatRanges(today) : "—" },
    { k: "APK", v: "vanaf €44,95 · zonder afspraak" },
    { k: "Leenauto", v: "gratis beschikbaar" },
    { k: "Locatie", v: `${company.address.street}, ${company.address.city}` },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-text-invert">
      {/* Background photo + overlays */}
      <img
        src={images.workshopHero.src}
        width={images.workshopHero.width}
        height={images.workshopHero.height}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/94 to-ink/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/40" />

      <Container className="relative z-10 grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:items-center">
        {/* Left — proposition */}
        <div className="animate-fade-up lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="signal">APK zonder afspraak</Tag>
            <StatusPill onInk />
          </div>

          <h1 className="mt-5 text-4xl leading-[1.04] text-text-invert sm:text-5xl lg:text-6xl">
            APK, onderhoud &amp; reparatie in{" "}
            <span className="text-signal">Amstelveen</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-text-invert/85">{company.intro}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/afspraak-maken" variant="mark" size="lg">
              Maak een afspraak
            </Button>
            <Button href={company.phone.href} variant="onInk" size="lg">
              <Phone className="h-5 w-5" /> {company.phone.display}
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {["RDW-erkend", "ANWB-partnerbedrijf", "36 mnd garantie", "Alle merken"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2 text-sm text-text-invert/85">
                <Check className="h-4 w-4 text-signal" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — glass reception board */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-white/12 bg-ink-900/60 p-1 shadow-lift backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-signal">Receptie</span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-text-invert/50">
                BM · Amstelveen
              </span>
            </div>
            <dl className="divide-y divide-white/10">
              {boardRows.map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="font-mono text-xs uppercase tracking-[0.14em] text-text-invert/50">
                    {row.k}
                  </dt>
                  <dd className="text-right font-mono text-sm text-text-invert">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
      <div aria-hidden="true" className="relative z-10 h-3 w-full bg-hazard" />
    </section>
  );
}
