import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  MapPin,
  Clock,
  Wrench,
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  ClipboardList,
  PhoneCall,
  BadgeEuro,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeServices } from "@/components/sections/HomeServices";
import { HomeOccasions } from "@/components/sections/HomeOccasions";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { assets } from "@/config/assets";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { formatRanges, getOpenState } from "@/lib/openingHours";
import { localBusinessSchema } from "@/lib/structuredData";

const why = [
  { icon: ShieldCheck, title: "RDW-erkende APK", text: "Keurmeesters met jarenlange ervaring en een duidelijk keuringsrapport." },
  { icon: HeartHandshake, title: "Persoonlijk contact", text: "U spreekt de monteur die aan uw auto werkt — geen callcenter." },
  { icon: Wrench, title: "Eigen werkplaats", text: "Onderhoud, reparatie én occasions onder één dak, voor alle merken." },
  { icon: MessagesSquare, title: "Transparante communicatie", text: "Eerst overleg en een heldere prijsafspraak, dan pas aan de slag." },
];

const verkoopStappen = [
  { icon: ClipboardList, title: "Aanmelden", text: "Voer uw kenteken in en vul de gegevens van uw auto aan." },
  { icon: PhoneCall, title: "Wij bekijken & bellen", text: "We beoordelen de aanmelding en nemen persoonlijk contact op." },
  { icon: BadgeEuro, title: "Vrijblijvend bod", text: "U ontvangt een vrijblijvend bod — u zit nergens aan vast." },
];

export function HomePage() {
  const open = getOpenState(company.openingHours);

  return (
    <>
      <SEO
        title="Autobedrijf Fix-it All — APK, onderhoud & occasions in Utrecht"
        path="/"
        jsonLd={localBusinessSchema()}
      />

      <HomeHero />

      <Reveal>
        <HomeServices />
      </Reveal>

      {/* APK-campagneband */}
      {company.offer && (
        <Reveal>
          <Section tone="petrol" size="md">
            <Container>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <Gift className="h-7 w-7" aria-hidden />
                  </span>
                  <div>
                    <p className="font-mono text-2xs uppercase tracking-label text-white/70">Actie</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{company.offer.label}</h2>
                    <p className="mt-2 max-w-xl text-white/85">
                      Combineer uw grote onderhoudsbeurt met de APK en bespaar de keuringskosten. Alles in één afspraak,
                      in onze eigen werkplaats.
                    </p>
                  </div>
                </div>
                <Button to={paths.dienst("grote-beurt")} variant="invert" size="lg" className="shrink-0">
                  Grote beurt inplannen
                </Button>
              </div>
            </Container>
          </Section>
        </Reveal>
      )}

      <Reveal>
        <HomeOccasions />
      </Reveal>

      {/* Auto verkopen — luxe split */}
      <Section tone="paper" size="lg">
        <Container>
          <Reveal>
            <div className="grid overflow-hidden rounded-3xl border border-line bg-surface shadow-card lg:grid-cols-2">
              <div className="relative min-h-[16rem] lg:min-h-full">
                <img
                  src={assets.autoVerkopen}
                  alt="Auto's op de oprit voor onze werkplaats"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-asphalt-900/50 to-transparent lg:bg-gradient-to-r" aria-hidden />
              </div>
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="eyebrow text-petrol">Auto verkopen</p>
                <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-text-strong sm:text-4xl">
                  Uw auto verkopen? Vraag een vrijblijvend bod aan
                </h2>
                <p className="mt-3 text-text-muted">
                  Meld uw auto aan, dan bekijken wij de gegevens en nemen persoonlijk contact met u op. Geen
                  automatische taxatie, geen verplichtingen.
                </p>
                <ol className="mt-8 space-y-5">
                  {verkoopStappen.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <li key={s.title} className="flex gap-4">
                        <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-petrol-soft text-petrol-strong">
                          <Icon className="h-5 w-5" aria-hidden />
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-petrol font-mono text-2xs font-bold text-white">
                            {i + 1}
                          </span>
                        </span>
                        <div>
                          <h3 className="font-display text-base font-bold text-text-strong">{s.title}</h3>
                          <p className="mt-0.5 text-sm text-text-muted">{s.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-8">
                  <Button to={paths.autoVerkopen} size="lg">
                    Vraag een vrijblijvend bod aan
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Waarom Fix-it All — graphite editorial */}
      <Reveal>
        <Section tone="asphalt" size="lg">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow text-torque">Waarom Fix-it All</p>
                <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
                  Vakwerk met een persoonlijk gezicht
                </h2>
                <p className="mt-4 max-w-md text-paper/75">
                  Een onafhankelijke vakgarage in {company.address.city} sinds {company.foundedYear}. Wij combineren
                  technische kennis met eerlijk advies — voor onderhoud, reparatie én uw volgende occasion.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button to={paths.overOns} variant="invert">
                    Over ons
                  </Button>
                  <Button to={paths.contact} variant="outlineInvert">
                    Contact
                  </Button>
                </div>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2">
                {why.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className="rounded-2xl border border-line-invert bg-asphalt-800/60 p-6 backdrop-blur transition-colors hover:border-petrol/40"
                    >
                      <Icon className="h-6 w-6 text-petrol-soft" aria-hidden />
                      <h3 className="mt-4 font-display text-base font-bold text-paper">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-paper/65">{item.text}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Container>
        </Section>
      </Reveal>

      {/* Bezoek ons */}
      <Reveal>
        <Section tone="muted" size="lg">
          <Container>
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <SectionHeading eyebrow="Kom langs" title={`Bezoek onze werkplaats in ${company.address.city}`} />
                <address className="mt-6 space-y-4 not-italic text-text-body">
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-petrol" aria-hidden />
                    <span>
                      {company.address.street}
                      <br />
                      {company.address.postalCode} {company.address.city}
                    </span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="h-5 w-5 shrink-0 text-petrol" aria-hidden />
                    <span className={open.open ? "font-semibold text-success" : "text-text-body"}>{open.message}</span>
                  </p>
                </address>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={company.address.mapsUrl}>
                    <MapPin className="h-4 w-4" aria-hidden />
                    Route plannen
                  </Button>
                  <Button href={company.phone.href} variant="outline">
                    <PhoneCall className="h-4 w-4" aria-hidden />
                    Bel {company.phone.display}
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
      </Reveal>

      {/* Slot-CTA */}
      <Section tone="paper" size="md">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-asphalt px-8 py-14 text-center shadow-lift sm:px-12">
              <div className="blueprint pointer-events-none absolute inset-0 opacity-30" aria-hidden />
              <div className="relative">
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
                  <Link
                    to={paths.diensten}
                    className="font-mono text-2xs uppercase tracking-label text-paper/60 hover:text-white"
                  >
                    Of bekijk eerst al onze diensten →
                  </Link>
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
