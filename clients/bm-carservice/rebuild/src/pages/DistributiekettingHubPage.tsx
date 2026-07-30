import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { distributiekettingHub, distributiekettingBrands, distributiekettingPrices } from "@/data/distributieketting";

export function DistributiekettingHubPage() {
  return (
    <>
      <SEO
        title={distributiekettingHub.seoTitle}
        description={distributiekettingHub.seoDescription}
        path={distributiekettingHub.path}
      />
      <PageHero
        eyebrow={distributiekettingHub.eyebrow}
        title={distributiekettingHub.title}
        intro={distributiekettingHub.intro}
        crumbs={[{ label: "Home", to: "/" }, { label: "Distributieketting" }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button to="/afspraak" variant="mark">Gratis check aanvragen</Button>
          <Button href={company.phone.href} variant="onInk">{company.phone.display}</Button>
        </div>
      </PageHero>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ul className="grid gap-3">
              {distributiekettingHub.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-pass" />
                  <span className="text-sm text-text-body">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <h2 className="text-2xl">Prijzen — vanaf</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-muted font-mono text-xs uppercase tracking-wide text-text-muted">
                  <tr>
                    <th className="px-4 py-3">Motor</th>
                    <th className="px-4 py-3 text-right">Vanaf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {distributiekettingPrices.map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-3 font-semibold text-text-strong">{row.label}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-text-strong">{row.from}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-text-muted">Indicatieve richtprijzen — vraag een offerte voor uw auto.</p>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Per merk" title="Distributieketting per merk" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {distributiekettingBrands.map((b) => (
            <li key={b.slug}>
              <Link
                to={b.path}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 hover:border-ink/30 hover:shadow-card"
              >
                <span className="font-display text-lg font-bold text-text-strong">
                  {b.title.replace("Distributieketting ", "").replace(" vervangen", "")}
                </span>
                <span className="mt-1 flex-1 text-sm text-text-body">{b.summary}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mark-strong">
                  Bekijk <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
