import { useLocation } from "react-router-dom";
import { Check, Phone } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { company } from "@/data/company";
import { images } from "@/lib/images";
import type { LandingContent } from "@/data/landing";
import { apkLandings, apkHub } from "@/data/apkLandings";
import { distributiekettingBrands, distributiekettingHub } from "@/data/distributieketting";
import { chiptuning, anwb } from "@/data/pages";
import { NotFoundPage } from "./NotFoundPage";

// Registry of all data-driven landing pages, keyed by exact path.
const registry = new Map<string, { content: LandingContent; parent?: { label: string; to: string } }>();
for (const l of apkLandings) {
  registry.set(l.path, { content: l, parent: { label: "APK zonder afspraak", to: apkHub.path } });
}
for (const b of distributiekettingBrands) {
  registry.set(b.path, { content: b, parent: { label: "Distributieketting", to: distributiekettingHub.path } });
}
registry.set(chiptuning.path, { content: chiptuning });
registry.set(anwb.path, { content: anwb });

export function LandingPage() {
  const { pathname } = useLocation();
  const entry = registry.get(pathname);
  if (!entry) return <NotFoundPage />;
  const { content, parent } = entry;

  const crumbs = [
    { label: "Home", to: "/" },
    ...(parent ? [parent] : []),
    { label: content.title },
  ];

  return (
    <>
      <SEO title={content.seoTitle} description={content.seoDescription} path={content.path} />
      <PageHero eyebrow={content.eyebrow} title={content.title} intro={content.intro} crumbs={crumbs}>
        <div className="flex flex-wrap items-center gap-3">
          <Button to="/afspraak" variant="mark">Maak een afspraak</Button>
          <Button href={company.phone.href} variant="onInk">
            <Phone className="h-4 w-4" /> {company.phone.display}
          </Button>
        </div>
      </PageHero>

      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="max-w-2xl text-lg text-text-body">{content.summary}</p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {content.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-pass" />
                  <span className="text-sm text-text-body">{b}</span>
                </li>
              ))}
            </ul>

            {content.models && content.models.length > 0 && (
              <div className="mt-8">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Modellen
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {content.models.map((m) => (
                    <Tag key={m} tone="outline">{m}</Tag>
                  ))}
                </div>
              </div>
            )}

            {content.priceTable && (
              <div className="mt-10">
                <h2 className="text-2xl">Prijzen — vanaf</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Incl. btw en gratis leenauto, 12 maanden garantie, originele onderdelen.
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-muted font-mono text-xs uppercase tracking-wide text-text-muted">
                      <tr>
                        <th className="px-4 py-3">Motor</th>
                        <th className="px-4 py-3 text-right">Vanaf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {content.priceTable.map((row) => (
                        <tr key={row.label}>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-text-strong">{row.label}</span>
                            {row.note && !row.note.startsWith("TODO") && (
                              <span className="block text-xs text-text-muted">{row.note}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-text-strong">
                            {row.from}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Indicatieve richtprijzen. Vraag een vrijblijvende offerte voor uw specifieke auto.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-4">
            {content.image && (
              <figure className="overflow-hidden rounded-2xl ring-1 ring-ink/10">
                <img
                  src={images[content.image].src}
                  width={images[content.image].width}
                  height={images[content.image].height}
                  alt={images[content.image].alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
            )}
            <div className="rounded-2xl border border-line bg-surface-muted p-6">
              <h2 className="text-lg">Direct geregeld</h2>
              <p className="mt-2 text-sm text-text-body">
                Maak een afspraak of bel voor advies en een vrijblijvende prijsopgave.
              </p>
              <div className="mt-4 grid gap-2">
                <Button to="/afspraak" variant="mark" className="w-full">Afspraak maken</Button>
                <Button href={company.phone.href} variant="outline" className="w-full">
                  <Phone className="h-4 w-4" /> Bel ons
                </Button>
              </div>
            </div>
            <OpeningHours />
          </aside>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
