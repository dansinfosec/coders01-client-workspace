import { useParams, Navigate, Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/sections/CTASection";
import { getService, services } from "@/data/services";
import { ROUTES, servicesPath } from "@/routes/paths";

export function ServiceDetailPage() {
  const { slug } = useParams();
  const service = slug ? getService(slug) : undefined;

  if (!service) return <Navigate to={ROUTES.diensten} replace />;

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <SEO title={service.seoTitle} description={service.seoDescription} path={servicesPath(service.slug)} image={service.image} />
      <PageHero eyebrow="Dienst" title={service.title} intro={service.summary} image={service.image} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4 text-text-body">
              {service.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {service.works && (
              <div className="mt-8">
                <h2 className="text-xl">Wat wij voor u verzorgen</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {service.works.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-text-body">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-strong" aria-hidden="true" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.guarantee && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-green-soft px-5 py-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-strong" aria-hidden="true" />
                <p className="text-sm font-semibold text-text-strong">{service.guarantee}</p>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-line bg-surface p-6 shadow-soft">
              <h2 className="text-lg">Interesse in {service.title.toLowerCase()}?</h2>
              <p className="mt-2 text-sm text-text-body">
                Vraag vrijblijvend een offerte aan of plan een kosteloze dakinspectie.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button to={ROUTES.offerte}>Offerte aanvragen</Button>
                <Button to={ROUTES.contact} variant="outline">Contact opnemen</Button>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="muted" spacing="md" ariaLabel="Andere diensten">
        <h2 className="text-2xl">Andere diensten</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {others.map((s) => (
            <li key={s.slug}>
              <Link
                to={servicesPath(s.slug)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 font-semibold text-text-strong hover:border-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {s.title}
                <ArrowRight className="h-4 w-4 text-green-strong transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection />
    </>
  );
}
