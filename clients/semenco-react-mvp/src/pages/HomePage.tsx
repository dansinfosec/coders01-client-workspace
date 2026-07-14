import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageContainer } from "@/components/layout/PageContainer";
import { Section } from "@/components/sections/Section";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { CallToAction } from "@/components/sections/CallToAction";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { homeContent } from "@/data/homeContent";
import { careServices } from "@/data/careServices";
import { publishedFaqs } from "@/data/faqs";
import { getPublishedPosts } from "@/data/blogPosts";
import { imageAssets } from "@/data/imageAssets";
import { contactDetails } from "@/data/contactDetails";
import { formatDate } from "@/utils/formatDate";
import { blogPostPath, ROUTES } from "@/routes/paths";

/** Home page (route "/"). Verified Sem & Co content. */
export function HomePage() {
  const { hero, intro, highlights, forWhom, location, closingCta } = homeContent;
  const posts = getPublishedPosts().slice(0, 3);
  const heroImg = imageAssets.homeHero;
  const { address } = contactDetails;

  return (
    <>
      <SEO
        title="Kleinschalige logeeropvang met echte aandacht"
        description="Sem & Co biedt kleinschalige, huiselijke logeeropvang voor kinderen en jongeren (4–18 jaar) met extra ondersteuningsbehoeften op RCN Het Grote Bos in Doorn."
      />

      {/* Hero — text beside image for guaranteed readability */}
      <div className="border-b border-border bg-brand-soft/50">
        <PageContainer className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl text-text-primary">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-text-secondary">
              {hero.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to={hero.primaryCtaTo} size="lg">
                {hero.primaryCtaLabel}
              </Button>
              <Button to={hero.secondaryCtaTo} variant="secondary" size="lg">
                {hero.secondaryCtaLabel}
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg.src}
              alt={heroImg.alt}
              width={heroImg.width}
              height={heroImg.height}
              // Hero is above the fold: load eagerly, hint high priority.
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-card"
            />
          </div>
        </PageContainer>
      </div>

      {/* Intro / uitgangspunten */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading title={intro.heading} />
            <div className="mt-4 space-y-4 text-text-secondary">
              {intro.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <li key={h.id} className="flex flex-col">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-text-primary">{h.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{h.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* Care options */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Ons aanbod"
          title="Vormen van opvang"
          description="Kleinschalige logeerweekenden, vakantieweken en tijdelijke crisisopvang — steeds afgestemd op wat een kind nodig heeft."
        />
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {careServices.map((service) => {
            const Icon = service.icon;
            return (
              <li key={service.id}>
                <Card interactive className="flex h-full flex-col">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-text-secondary">{service.summary}</p>
                  <Link
                    to={service.to}
                    className="mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    Meer over {service.title.toLowerCase()}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* For whom */}
      <Section>
        <div className="max-w-prose">
          <SectionHeading title={forWhom.heading} />
          <div className="mt-4 space-y-4 text-text-secondary">
            {forWhom.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Section>

      {/* Registration process */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Zo werkt aanmelden"
          title="In stappen naar een passende plek"
          description="Aanmelden is vrijblijvend. Daarna kijken we samen, rustig en zorgvuldig, wat past — altijd op het tempo van het kind."
        />
        <div className="mt-8">
          <ProcessTimeline compact />
        </div>
        <div className="mt-8">
          <Button to={ROUTES.werkwijze} variant="secondary">
            Bekijk de volledige werkwijze
          </Button>
        </div>
      </Section>

      {/* Location & atmosphere */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading eyebrow="Locatie en sfeer" title={location.heading} />
            <div className="mt-4 space-y-4 text-text-secondary">
              {location.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-primary">
              <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
              {contactDetails.locationName}, {address.city}
            </p>
          </div>
          <img
            src={imageAssets.homeHero.src}
            alt={imageAssets.homeHero.alt}
            width={imageAssets.homeHero.width}
            height={imageAssets.homeHero.height}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-soft"
          />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="muted">
        <SectionHeading title="Veelgestelde vragen" />
        <dl className="mt-6 max-w-prose divide-y divide-border">
          {publishedFaqs.map((faq) => (
            <div key={faq.id} className="py-4">
              <dt className="font-medium text-text-primary">{faq.question}</dt>
              <dd className="mt-1 text-sm text-text-secondary">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Blog preview */}
      {posts.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="Blog"
            title="Verhalen en nieuws"
            description="Voorbeeldartikelen om de blog te tonen — nog geen echte publicaties van Sem & Co."
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Card interactive className="flex h-full flex-col">
                  <span className="w-fit rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    Voorbeeldartikel
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-text-primary">
                    <Link
                      to={blogPostPath(post.slug)}
                      className="rounded hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-text-secondary">{post.summary}</p>
                  <time className="mt-4 text-xs text-text-secondary" dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CallToAction content={closingCta} />
    </>
  );
}
