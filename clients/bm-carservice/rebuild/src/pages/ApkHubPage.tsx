import { Link } from "react-router-dom";
import { Check, Phone, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { apkHub, apkLandings } from "@/data/apkLandings";

const priceCards = [
  { label: "Benzine", price: "€44,95" },
  { label: "Diesel", price: "€64,95" },
];

export function ApkHubPage() {
  return (
    <>
      <SEO title={apkHub.seoTitle} description={apkHub.seoDescription} path={apkHub.path} />
      <PageHero
        eyebrow={apkHub.eyebrow}
        title={apkHub.title}
        intro={apkHub.intro}
        crumbs={[{ label: "Home", to: "/" }, { label: "APK zonder afspraak" }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button href={company.phone.href} variant="mark">
            <Phone className="h-4 w-4" /> Bel voor de APK
          </Button>
          <Button to="/afspraak-maken" variant="onInk">Liever op afspraak</Button>
        </div>
      </PageHero>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* Price cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {priceCards.map((c) => (
                <div key={c.label} className="rounded-2xl border border-line bg-surface-muted p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted">{c.label}</p>
                  <p className="mt-2 font-display text-4xl font-extrabold text-text-strong">{c.price}</p>
                  <p className="mt-1 text-sm text-text-muted">vast tarief, geen bijkomende kosten</p>
                </div>
              ))}
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {apkHub.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-pass" />
                  <span className="text-sm text-text-body">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <OpeningHours />
          </aside>
        </div>
      </Section>

      {/* Location landing pages */}
      <Section tone="muted">
        <SectionHeading eyebrow="APK in de regio" title="APK keuring bij u in de buurt" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apkLandings.map((l) => (
            <li key={l.slug}>
              <Link
                to={l.path}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 hover:border-ink/30 hover:shadow-card"
              >
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
                  {l.eyebrow}
                </span>
                <span className="mt-2 font-display text-lg font-bold text-text-strong">{l.title}</span>
                <span className="mt-1 flex-1 text-sm text-text-body">{l.summary}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mark-strong">
                  Meer info <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection />
    </>
  );
}
