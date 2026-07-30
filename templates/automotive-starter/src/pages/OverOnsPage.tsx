import {
  HeartHandshake,
  ShieldCheck,
  Wrench,
  Bike,
  Users,
  Cpu,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/structuredData";

const values = [
  { icon: HeartHandshake, title: "Persoonlijk & eerlijk", text: "Duidelijk advies zonder verrassingen. We leggen uit wat er nodig is en waarom." },
  { icon: Wrench, title: "Voor alle merken", text: "Onderhoud, reparatie en APK — welk merk u ook rijdt, u bent bij ons welkom." },
  { icon: ShieldCheck, title: "RDW-erkend", text: "Onze keurmeesters voeren de APK uit volgens de wettelijke eisen van de RDW." },
  { icon: Cpu, title: "Moderne technieken", text: "We investeren in actuele diagnose- en reparatieapparatuur voor gericht werk." },
  { icon: Bike, title: "Mobiel blijven", text: "Tijdens de reparatie kunt u gebruikmaken van een leenfiets of leenscooter." },
  {
    icon: Users,
    title: company.foundedYear !== null ? `Onafhankelijk sinds ${company.foundedYear}` : "Onafhankelijk & vertrouwd",
    text: `Een vertrouwd adres in ${company.address.city} met jarenlange ervaring en vaste klanten.`,
  },
];

const facts = [
  { value: company.foundedYear !== null ? `Sinds ${company.foundedYear}` : "Vakwerk", label: "Onafhankelijke vakgarage" },
  { value: "Alle merken", label: "Onderhoud & reparatie" },
  { value: "RDW-erkend", label: "APK-keuringen" },
  { value: "Eigen werkplaats", label: "Ook uitlaat- & laswerk" },
];

export function OverOnsPage() {
  return (
    <>
      <SEO
        title={`Over ons — uw vakgarage in ${company.address.city}`}
        description={`${company.name} is een onafhankelijke vakgarage in ${company.address.city}. Persoonlijke aandacht en eerlijk advies voor alle merken: APK, onderhoud, uitlaatwerk, airco, banden en occasions.`}
        path="/over-ons"
        jsonLd={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Over ons", path: "/over-ons" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Over ons"
        title={`Uw vakgarage in ${company.address.city}`}
        intro="Onafhankelijk, persoonlijk en voor alle merken — van APK en onderhoud tot uitlaatwerk, airco, banden en occasions."
        crumbs={[{ label: "Home", to: "/" }, { label: "Over ons" }]}
      />

      {/* Verhaal */}
      <Section tone="paper" size="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="max-w-prose">
              <SectionHeading eyebrow="Ons verhaal" title="Een vertrouwd adres met een persoonlijk gezicht" />
              <div className="mt-6 space-y-4 leading-relaxed text-text-body">
                <p>
                  {company.name} is {company.foundedYear !== null ? `sinds ${company.foundedYear} ` : ""}een
                  onafhankelijke vakgarage in {company.address.city}. Wij zijn uw pitstop voor autokeuring,
                  onderhoud en occasions — voor alle merken, onder één dak.
                </p>
                <p>
                  Bij ons draait het om persoonlijke aandacht en eerlijk advies. We vertellen u duidelijk wat er
                  nodig is en waarom, zonder verrassingen achteraf. Van een kleine of grote onderhoudsbeurt en de
                  APK tot uitlaat- en laswerk, aircoservice en bandenservice: onze gediplomeerde monteurs staan voor u klaar.
                </p>
                <p>
                  Daarnaast bieden we occasions aan die door onze eigen werkplaats zijn geselecteerd en gecontroleerd.
                  En wilt u uw auto verkopen? Dan bekijken we uw gegevens en nemen we persoonlijk contact met u op.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button to={paths.diensten}>
                  Onze diensten <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button to={paths.occasions} variant="outline">Bekijk occasions</Button>
              </div>
            </div>

            {/* Feiten */}
            <div className="grid grid-cols-2 gap-4 self-start">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="font-display text-xl font-bold text-petrol-strong">{f.value}</p>
                  <p className="mt-1 text-sm text-text-muted">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Waarden */}
      <Section tone="muted" size="lg">
        <Container>
          <SectionHeading eyebrow="Waar we voor staan" title="Vakwerk waar u op kunt bouwen" align="center" />
          <ul className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <li key={v.title} className="rounded-2xl border border-line bg-surface p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-petrol-soft text-petrol-strong">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-text-strong">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{v.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Bezoek + CTA */}
      <Section tone="asphalt" size="md">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="eyebrow text-torque">Kom langs</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-paper sm:text-3xl">Bezoek onze werkplaats in {company.address.city}</h2>
              <p className="mt-3 flex items-start gap-2.5 text-paper/80">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-petrol-soft" aria-hidden />
                {company.address.street}, {company.address.postalCode} {company.address.city}
              </p>
              <p className="mt-1 font-mono text-sm text-paper/60">{company.openingSummary}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button to={paths.afspraak} size="lg">Afspraak maken</Button>
              <Button href={company.phone.href} variant="invert" size="lg">
                <Phone className="h-5 w-5" aria-hidden /> {company.phone.display}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
