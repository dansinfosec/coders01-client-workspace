import { useParams, useLocation, Link } from "react-router-dom";
import { Check, Phone, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { company } from "@/data/company";
import { images } from "@/lib/images";
import { services, servicePath, getService } from "@/data/services";
import { NotFoundPage } from "./NotFoundPage";

export function ServiceDetailPage() {
  const params = useParams();
  const location = useLocation();
  // Supports /diensten/:slug and the legacy top-level /remmen-vervangen.
  const slug = params.slug ?? location.pathname.replace(/^\//, "");
  const service = getService(slug);

  if (!service) return <NotFoundPage />;

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const Icon = service.icon;

  return (
    <>
      <SEO title={service.seoTitle} description={service.seoDescription} path={servicePath(service)} />
      <PageHero
        eyebrow="Dienst"
        title={service.title}
        intro={service.intro}
        crumbs={[{ label: "Home", to: "/" }, { label: "Diensten", to: "/diensten" }, { label: service.title }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button to="/afspraak-maken" variant="mark">Maak een afspraak</Button>
          <Button href={company.phone.href} variant="onInk">
            <Phone className="h-4 w-4" /> {company.phone.display}
          </Button>
          {service.priceFrom && <Tag tone="onInk">vanaf {service.priceFrom}</Tag>}
        </div>
      </PageHero>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-signal">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="text-2xl">Wat u kunt verwachten</h2>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {service.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-pass" />
                  <span className="text-sm text-text-body">{b}</span>
                </li>
              ))}
            </ul>

            {service.priceFrom && (
              <p className="mt-6 text-sm text-text-muted">
                Prijzen vanaf {service.priceFrom}, indicatief. Vraag naar een exacte prijs voor uw auto.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            <figure className="overflow-hidden rounded-2xl ring-1 ring-ink/10">
              <img
                src={images.carLift.src}
                width={images.carLift.width}
                height={images.carLift.height}
                alt={images.carLift.alt}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </figure>
            <div className="rounded-2xl border border-line bg-surface-muted p-6">
              <h3 className="text-lg">Plan {service.title.toLowerCase()} in</h3>
              <p className="mt-2 text-sm text-text-body">
                Maak online een afspraak of bel ons. Voor een APK kunt u ook zonder afspraak langskomen.
              </p>
              <div className="mt-4 grid gap-2">
                <Button to="/afspraak-maken" variant="mark" className="w-full">Afspraak maken</Button>
                <Button href={company.phone.href} variant="outline" className="w-full">
                  <Phone className="h-4 w-4" /> Bel ons
                </Button>
              </div>
            </div>
            <OpeningHours />
          </aside>
        </div>
      </Section>

      {/* Related */}
      <Section tone="muted" spacing="md">
        <h2 className="text-2xl">Andere diensten</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}>
              <Link
                to={servicePath(r)}
                className="group flex items-center justify-between rounded-xl border border-line bg-surface p-4 hover:border-ink/30"
              >
                <span className="font-display font-bold text-text-strong">{r.title}</span>
                <ArrowRight className="h-4 w-4 text-mark-strong transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection />
    </>
  );
}
