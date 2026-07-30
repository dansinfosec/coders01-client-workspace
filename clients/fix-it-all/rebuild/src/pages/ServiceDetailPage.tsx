import { useParams, Link } from "react-router-dom";
import { Check, Phone, CalendarClock, Gift, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getService } from "@/data/services";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { serviceSchema, faqSchema, breadcrumbSchema } from "@/lib/structuredData";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function ServiceDetailPage() {
  const { slug } = useParams();
  const service = slug ? getService(slug) : undefined;
  if (!service) return <NotFoundPage />;

  const path = paths.dienst(service.slug);
  const related = service.related.map((s) => getService(s)).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <SEO
        title={service.seo.title}
        description={service.seo.description}
        path={path}
        jsonLd={[
          serviceSchema({ name: service.title, description: service.seo.description, path }),
          faqSchema(service.faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Diensten", path: "/diensten" },
            { name: service.shortLabel, path },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Dienst"
        title={service.title}
        intro={service.summary}
        crumbs={[{ label: "Home", to: "/" }, { label: "Diensten", to: paths.diensten }, { label: service.shortLabel }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button to={`${paths.afspraak}?dienst=${service.slug}`} size="lg">
            <CalendarClock className="h-5 w-5" aria-hidden />
            Afspraak maken
          </Button>
          <Button href={company.phone.href} variant="outlineInvert" size="lg">
            <Phone className="h-5 w-5" aria-hidden />
            {company.phone.display}
          </Button>
        </div>
      </PageHero>

      <Section tone="paper" size="lg">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
            {/* Hoofdinhoud */}
            <div className="max-w-prose">
              <p className="text-lg leading-relaxed text-text-body">{service.intro}</p>

              <h2 className="mt-12 font-display text-2xl font-bold text-text-strong">Wat houdt het in?</h2>
              <ul className="mt-5 space-y-3">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-petrol" aria-hidden />
                    <span className="text-text-body">{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-12 font-display text-2xl font-bold text-text-strong">Voordelen</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {service.benefits.map((b) => (
                  <li key={b} className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-text-body">
                    {b}
                  </li>
                ))}
              </ul>

              <h2 className="mt-12 font-display text-2xl font-bold text-text-strong">Werkwijze</h2>
              <ol className="mt-5 space-y-4">
                {service.process.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-asphalt font-mono text-sm font-bold text-paper">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold text-text-strong">{step.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <h2 className="mt-12 font-display text-2xl font-bold text-text-strong">Veelgestelde vragen</h2>
              <div className="mt-5">
                <FaqAccordion items={service.faq} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-text-strong">Direct regelen</h2>
                <p className="mt-1.5 text-sm text-text-muted">Plan online of bel ons voor persoonlijk advies.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button to={`${paths.afspraak}?dienst=${service.slug}`} block>
                    <CalendarClock className="h-4 w-4" aria-hidden />
                    Afspraak maken
                  </Button>
                  <Button href={company.phone.href} variant="outline" block>
                    <Phone className="h-4 w-4" aria-hidden />
                    {company.phone.display}
                  </Button>
                </div>
              </div>

              {service.showApkOffer && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-petrol/25 bg-petrol-soft p-5">
                  <Gift className="mt-0.5 h-5 w-5 shrink-0 text-petrol-strong" aria-hidden />
                  <p className="text-sm font-semibold text-petrol-strong">{company.offer.label}</p>
                </div>
              )}

              {related.length > 0 && (
                <nav aria-label="Verwante diensten" className="mt-4 rounded-2xl border border-line bg-surface p-6">
                  <h2 className="font-mono text-2xs uppercase tracking-label text-text-muted">Verwante diensten</h2>
                  <ul className="mt-3 space-y-1">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          to={paths.dienst(r.slug)}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text-body hover:bg-surface-muted hover:text-petrol"
                        >
                          {r.shortLabel}
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </aside>
          </div>
        </Container>
      </Section>

      {/* Slot-CTA */}
      <Section tone="asphalt" size="md">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-paper sm:text-3xl">
                Vragen over {service.shortLabel.toLowerCase()}?
              </h2>
              <p className="mt-2 text-paper/75">Wij helpen u graag verder met eerlijk advies.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button to={paths.afspraak} size="lg">Afspraak maken</Button>
              <Button to={paths.contact} variant="invert" size="lg">Contact</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
