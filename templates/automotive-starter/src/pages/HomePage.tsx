import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  Car,
  BadgeEuro,
  MapPin,
  Clock,
  Users,
  Wrench,
  HeartHandshake,
  Bike,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { HomeHero } from "@/components/sections/HomeHero";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { formatRanges } from "@/lib/openingHours";
import { localBusinessSchema } from "@/lib/structuredData";

const why = [
  {
    icon: Users,
    title:
      company.foundedYear !== null
        ? `Sinds ${company.foundedYear} in ${company.address.city}`
        : `Vertrouwd in ${company.address.city}`,
    text: "Een vertrouwd, onafhankelijk adres met jarenlange ervaring.",
  },
  { icon: Wrench, title: "Voor alle merken", text: "Onderhoud, reparatie en APK — welk merk u ook rijdt." },
  { icon: HeartHandshake, title: "Persoonlijk & eerlijk", text: "Duidelijk advies zonder verrassingen achteraf." },
  { icon: Bike, title: "Leenfiets of -scooter", text: "Blijf mobiel terwijl wij aan uw auto werken." },
];

export function HomePage() {
  return (
    <>
      <SEO
        title={`APK, onderhoud & occasions in ${company.address.city}`}
        path="/"
        jsonLd={localBusinessSchema()}
      />

      <HomeHero />

      {/* Diensten */}
      <Section tone="paper" size="lg">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Onze diensten"
              title="Alles voor uw auto onder één dak"
              intro="Van keuring tot reparatie — vakwerk door gediplomeerde monteurs."
            />
            <Button to={paths.diensten} variant="outline" className="shrink-0">
              Alle diensten
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <ServicesGrid className="mt-10" />
        </Container>
      </Section>

      {/* Optionele actie — alleen tonen als er een bevestigde actie is */}
      {company.offer && (
        <Section tone="petrol" size="md">
          <Container>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Gift className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-2xs uppercase tracking-label text-white/70">Onze actie</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                    {company.offer.label}
                  </h2>
                  <p className="mt-1.5 text-white/80">
                    Combineer uw grote onderhoudsbeurt met de APK en bespaar de keuringskosten.
                  </p>
                </div>
              </div>
              <Button to={paths.dienst("grote-beurt")} variant="invert" size="lg" className="shrink-0">
                Grote beurt inplannen
              </Button>
            </div>
          </Container>
        </Section>
      )}

      {/* Occasions teaser */}
      <Section tone="surface" size="lg">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Occasions"
                title="Op zoek naar een betrouwbare occasion?"
                intro="Onze occasions komen uit onze eigen werkplaats. Bekijk het actuele aanbod, inclusief specificaties en foto's."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to={paths.occasions}>
                  Bekijk occasions
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button to={paths.autoVerkopen} variant="outline">
                  Auto verkopen
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-petrol" aria-hidden />
                <span className="font-mono text-2xs uppercase tracking-label text-text-muted">
                  Waarom een occasion van {company.name}
                </span>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-text-body">
                <li className="flex gap-2.5">
                  <BadgeEuro className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
                  Duidelijke specificaties, foto's en eerlijke omschrijving per auto.
                </li>
                <li className="flex gap-2.5">
                  <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
                  Onderhouden en gecontroleerd door onze eigen monteurs.
                </li>
                <li className="flex gap-2.5">
                  <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
                  Persoonlijk contact — bel of vraag een proefrit aan.
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Auto verkopen band */}
      <Section tone="asphalt" size="md">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-line-invert bg-asphalt-800/60 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <p className="eyebrow text-torque">Auto verkopen</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-paper sm:text-3xl">
                Uw auto verkopen aan {company.name}?
              </h2>
              <p className="mt-2 text-paper/75">
                Meld uw auto aan. Wij bekijken de gegevens en nemen persoonlijk contact met u op.
              </p>
            </div>
            <Button to={paths.autoVerkopen} variant="accent" size="lg" className="shrink-0">
              Vraag een vrijblijvend bod aan
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </Container>
      </Section>

      {/* Waarom kiezen voor ons */}
      <Section tone="paper" size="lg">
        <Container>
          <SectionHeading eyebrow={`Waarom ${company.name}`} title="Vakwerk met een persoonlijk gezicht" align="center" />
          <ul className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="rounded-xl border border-line bg-surface p-6 text-center">
                  <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-petrol-soft text-petrol-strong">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-text-strong">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Bezoek / openingstijden */}
      <Section tone="muted" size="lg">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Kom langs" title={`Bezoek onze werkplaats in ${company.address.city}`} />
              <div className="mt-6 space-y-4 text-text-body">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-petrol" aria-hidden />
                  <span>
                    {company.address.street}
                    <br />
                    {company.address.postalCode} {company.address.city}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={company.address.mapsUrl}>
                  <MapPin className="h-4 w-4" aria-hidden />
                  Route plannen
                </Button>
                <Button to={paths.contact} variant="outline">
                  Contactgegevens
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 shadow-soft sm:p-8">
              <h3 className="flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-text-muted">
                <Clock className="h-4 w-4" aria-hidden /> Openingstijden
              </h3>
              <ul className="mt-4 divide-y divide-line">
                {company.openingHours.map((d) => (
                  <li key={d.weekday} className="flex justify-between gap-4 py-2.5 text-sm">
                    <span className="text-text-body">{d.day}</span>
                    <span className="font-mono text-text-strong">{formatRanges(d)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Slot-CTA */}
      <Section tone="paper" size="md">
        <Container>
          <div className="rounded-2xl bg-asphalt px-8 py-12 text-center shadow-lift sm:px-12">
            <h2 className="font-display text-3xl font-bold text-paper sm:text-4xl">Klaar om langs te komen?</h2>
            <p className="mx-auto mt-3 max-w-xl text-paper/75">
              Plan online uw APK, onderhoud of reparatie — of bel ons voor persoonlijk advies.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to={paths.afspraak} size="lg">
                Afspraak maken
              </Button>
              <Button href={company.phone.href} variant="invert" size="lg">
                Bel {company.phone.display}
              </Button>
            </div>
            <p className="mt-6">
              <Link to={paths.diensten} className="font-mono text-2xs uppercase tracking-label text-paper/60 hover:text-white">
                Of bekijk eerst al onze diensten →
              </Link>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
