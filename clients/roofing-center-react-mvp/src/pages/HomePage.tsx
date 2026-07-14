import { ArrowRight, MapPin, Phone, MessageCircle, MessageSquareText, ShieldCheck, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { imageSources } from "@/lib/images";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTASection } from "@/components/sections/CTASection";
import { FaqList } from "@/components/sections/FaqList";
import { GoogleReviews } from "@/components/sections/GoogleReviews";
import { ProjectGallery } from "@/components/gallery/ProjectGallery";
import { useAssistant } from "@/features/assistant/AssistantContext";
import { company, contact, telLink, whatsappLink } from "@/data/company";
import { faqs } from "@/data/faqs";
import { projects } from "@/data/projects";
import { ROUTES } from "@/routes/paths";

const heroDesktop = imageSources("optimized/hero-plat-dak-overzicht");
const heroMobile = imageSources("optimized/hero-mobiel-dakrenovatie");

export function HomePage() {
  const { openAssistant } = useAssistant();
  const featured = projects.filter((p) => p.category === "afgewerkt").slice(0, 6);

  return (
    <>
      <SEO
        title="Specialist in platte daken in Almere e.o."
        description="Roofing Center is specialist in platte daken in Almere en omgeving: bitumen dakbedekking, EPDM, renovatie, reparatie, lekkageherstel, inspectie en onderhoud. Vraag een vrijblijvende dakinspectie aan."
        path={ROUTES.home}
      />

      {/* 2. Premium hero — text on navy beside the image (guaranteed contrast) */}
      <div className="bg-navy text-text-invert">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow text-green">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-green" />
              Platte daken · {company.serviceArea}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] text-text-invert sm:text-5xl">Specialist in platte daken</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-invert/85">
              Van bitumen dakbedekking en renovatie tot lekkageherstel, inspectie en onderhoud. Roofing Center levert
              professionele oplossingen voor platte daken in {company.serviceArea}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to={ROUTES.offerte} size="lg">{company.cta.primary}</Button>
              <Button type="button" onClick={openAssistant} size="lg" variant="onNavy">
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                {company.cta.assistant}
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-invert/80">
              {["Bitumen en EPDM", "Renovatie en reparatie", "Inspectie en onderhoud"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <picture>
              <source media="(max-width: 640px)" type="image/webp" srcSet={heroMobile.webp} />
              <source media="(max-width: 640px)" srcSet={heroMobile.jpg} />
              <source type="image/webp" srcSet={heroDesktop.webp} />
              <img
                src={heroDesktop.jpg}
                alt="Groot, strak afgewerkt plat dak met bitumen dakbedekking onder een blauwe lucht"
                width={1600}
                height={1200}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/3] w-full rounded-2xl border border-line-invert object-cover shadow-lift"
              />
            </picture>
          </div>
        </Container>
      </div>

      {/* 3. Trust strip */}
      <TrustStrip />

      {/* 4. Services */}
      <Section>
        <SectionHeading
          eyebrow="Onze diensten"
          title="Alles voor uw platte dak"
          description="Wij richten ons volledig op platte daken. Van nieuwe dakbedekking tot onderhoud en herstel."
        />
        <div className="mt-10"><ServicesGrid /></div>
        <div className="mt-8"><Button to={ROUTES.diensten} variant="outlineNavy">Bekijk alle diensten<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></div>
      </Section>

      {/* 5. About */}
      <Section tone="muted">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading eyebrow="Over Roofing Center" title="Vakwerk op platte daken" />
            <div className="mt-4 space-y-4 text-text-muted">
              <p>
                Roofing Center is gespecialiseerd in platte daken. We werken met bitumen en EPDM en hebben oog voor de details
                die op een plat dak het verschil maken: naden, opstanden, randen en doorvoeren.
              </p>
              <p>
                Of het nu gaat om een nieuwe dakbedekking, een renovatie of het verhelpen van een lekkage — we werken netjes
                en vakkundig, en geven eerlijk advies over wat er nodig is.
              </p>
            </div>
            <div className="mt-6"><Button to={ROUTES.overOns} variant="outlineNavy">Meer over ons<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></div>
          </div>
          <picture>
            <source type="image/webp" srcSet={imageSources("services/vakmanschap-afwerking").webp} />
            <img src={imageSources("services/vakmanschap-afwerking").jpg} alt="Vakman werkt aan de waterdichte afwerking van een plat dak" width={1400} height={1050} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-2xl border border-line object-cover shadow-soft" />
          </picture>
        </div>
      </Section>

      {/* 6. Featured projects */}
      <Section>
        <SectionHeading eyebrow="Projecten" title="Werk uit de praktijk" description="Een selectie van uitgevoerde platte daken. Alle foto's zijn van eigen projecten." />
        <div className="mt-10"><ProjectGallery items={featured} showFilters={false} /></div>
        <div className="mt-8"><Button to={ROUTES.projecten} variant="outlineNavy">Bekijk alle projecten<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></div>
      </Section>

      {/* 7. Work process */}
      <Section tone="muted">
        <SectionHeading eyebrow="Werkwijze" title="Zo werken we" description="Van eerste aanvraag tot oplevering — helder en zonder verrassingen." />
        <div className="mt-10"><ProcessTimeline /></div>
      </Section>

      {/* 8. Leakage-focused CTA */}
      <CTASection
        urgent
        eyebrow="Daklekkage?"
        title="Lekt uw platte dak?"
        description="Neem contact op, dan bespreken we de mogelijkheden. Bij een actieve lekkage kijken we met u mee. Een definitief advies is pas mogelijk na inspectie."
      />

      {/* 9. AI assistant introduction */}
      <Section>
        <div className="overflow-hidden rounded-3xl border border-line bg-surface-muted">
          <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow"><span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-green" />Roofing Center Dakassistent</p>
              <h2 className="mt-3 text-2xl font-bold text-text-strong sm:text-3xl">Beschrijf uw dakprobleem online</h2>
              <p className="mt-3 max-w-prose text-text-muted">
                De dakassistent begeleidt u met een paar korte vragen door uw aanvraag. Op basis van uw antwoorden kan Roofing
                Center de aanvraag beoordelen. De assistent stelt geen diagnose; dat kan pas na inspectie.
              </p>
              <div className="mt-6">
                <Button type="button" onClick={openAssistant} size="lg">
                  <MessageSquareText className="h-4 w-4" aria-hidden="true" />{company.cta.assistant}
                </Button>
              </div>
            </div>
            <Card className="bg-surface">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-strong">
                <ShieldCheck className="h-5 w-5 text-green-strong" aria-hidden="true" />
                Waarom de assistent?
              </div>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {["Snel uw situatie omschrijven", "Foto's toevoegen kan", "Duidelijke samenvatting vooraf", "U bepaalt zelf het contactmoment"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-strong" aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* 10. FAQ preview + reviews */}
      <Section tone="muted">
        <SectionHeading eyebrow="Veelgestelde vragen" title="Goed om te weten" align="center" />
        <div className="mt-10"><FaqList items={faqs.slice(0, 5)} /></div>
        <div className="mt-6 text-center"><Button to={ROUTES.faq} variant="outlineNavy">Alle vragen</Button></div>
        <div className="mt-10"><GoogleReviews /></div>
      </Section>

      {/* 11 + 12. Quote / contact section */}
      <Section id="contact">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading eyebrow="Aan de slag" title="Vraag een offerte of inspectie aan" description="Vertel ons wat er speelt. We denken graag met u mee over uw platte dak." />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={ROUTES.offerte} size="lg">{company.cta.quote}</Button>
              {contact.hasPhone && <Button href={telLink()} size="lg" variant="outlineNavy"><Phone className="h-4 w-4" aria-hidden="true" />{company.cta.call}</Button>}
              {contact.hasWhatsapp && <Button href={whatsappLink()} target="_blank" rel="noopener noreferrer" size="lg" variant="outlineNavy"><MessageCircle className="h-4 w-4" aria-hidden="true" />WhatsApp</Button>}
            </div>
          </div>
          <Card>
            <h3 className="text-lg font-bold text-text-strong">Contactgegevens</h3>
            <ul className="mt-4 space-y-3 text-sm text-text-body">
              <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" /><span>Werkgebied: {company.serviceArea}</span></li>
              {contact.hasPhone && <li className="flex items-start gap-2.5"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" /><a href={telLink()} className="hover:text-green-strong">{company.phoneDisplay || company.phone}</a></li>}
            </ul>
            {(!contact.hasPhone || !contact.hasWhatsapp) && (
              <p className="mt-4 rounded-lg border border-line bg-surface-muted px-3 py-2 text-xs text-text-muted">
                Telefoon en WhatsApp worden nog bevestigd. Gebruik zolang het offerteformulier of de dakassistent.
              </p>
            )}
          </Card>
        </div>
      </Section>
    </>
  );
}
