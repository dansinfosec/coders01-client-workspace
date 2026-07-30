import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  CalendarClock,
  Check,
  Info,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Zap,
  Car,
  ChevronRight,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { KentekenPlate } from "@/components/ui/KentekenPlate";
import { StatusPill } from "@/components/ui/StatusPill";
import { OccasionGallery } from "@/components/occasions/OccasionGallery";
import { OccasionOptions } from "@/components/occasions/OccasionOptions";
import { OccasionCard } from "@/components/occasions/OccasionCard";
import { NotFoundPage } from "@/pages/NotFoundPage";
import type { Occasion } from "@/data/occasions";
import { getOccasionBySlug, getSimilarOccasions } from "@/services/occasionService";
import { formatPrijs, occasionSpecGroups, occasionCoreFacts } from "@/lib/occasion";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";
import { vehicleSchema, breadcrumbSchema } from "@/lib/structuredData";
import { cn } from "@/utils/cn";

/** Icoon per kernkenmerk-label. */
const FACT_ICON: Record<string, typeof Calendar> = {
  Bouwjaar: Calendar,
  Kilometerstand: Gauge,
  Brandstof: Fuel,
  Transmissie: Cog,
  Vermogen: Zap,
  Carrosserie: Car,
};

export function OccasionDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState<"loading" | "found" | "notfound">("loading");
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [similar, setSimilar] = useState<Occasion[]>([]);

  useEffect(() => {
    let alive = true;
    setState("loading");
    setOccasion(null);
    if (!slug) {
      setState("notfound");
      return;
    }
    getOccasionBySlug(slug).then((o) => {
      if (!alive) return;
      if (!o) {
        setState("notfound");
        return;
      }
      setOccasion(o);
      setState("found");
    });
    getSimilarOccasions(slug).then((s) => alive && setSimilar(s));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state === "notfound") return <NotFoundPage />;

  if (state === "loading" || !occasion) {
    return (
      <>
        <SEO title="Occasion laden…" path={`/occasions/${slug ?? ""}`} noindex />
        <Container className="flex min-h-[50vh] items-center justify-center py-20 text-text-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Occasion laden…
        </Container>
      </>
    );
  }

  const o = occasion;
  const path = paths.occasion(o.slug);
  const specGroups = occasionSpecGroups(o);
  const coreFacts = occasionCoreFacts(o);
  const sold = o.status === "verkocht";
  const available = o.status === "beschikbaar" || o.status === "nieuw-binnen";
  const wa = company.whatsapp;
  const waHref = wa
    ? `${wa.href}?text=${encodeURIComponent(
        `Hallo, ik heb interesse in de ${o.title}${o.kenteken ? ` (${o.kenteken})` : ""}.`,
      )}`
    : null;
  const proefritTo = `${paths.contact}?onderwerp=occasion&auto=${encodeURIComponent(o.title)}`;

  return (
    <>
      <SEO
        title={`${o.title} — occasion in ${company.address.city}`}
        description={`${o.title} (${o.bouwjaar}, ${o.brandstof}). ${formatPrijs(o.prijs)}. Bekijk de specificaties en vraag een proefrit aan bij ${company.name}.`}
        path={path}
        image={o.photos[0]?.src}
        jsonLd={[
          vehicleSchema({
            name: o.title,
            description: o.description,
            path,
            brand: o.merk,
            model: o.model,
            bouwjaar: o.bouwjaar,
            brandstof: o.brandstof,
            kmStand: o.kmStand,
            prijs: o.prijs,
            available,
            images: o.photos.map((p) => p.src),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Occasions", path: "/occasions" },
            { name: o.title, path },
          ]),
        ]}
      />

      <Section tone="paper" size="md" className="pb-24 lg:pb-16">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Kruimelpad" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-text-muted">
              <li>
                <Link to="/" className="hover:text-petrol">Home</Link>
              </li>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <li>
                <Link to={paths.occasions} className="hover:text-petrol">Occasions</Link>
              </li>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <li className="text-text-body" aria-current="page">{o.title}</li>
            </ol>
          </nav>

          {/* Boven de vouw: galerij + aankooppaneel */}
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="min-w-0">
              <OccasionGallery occasion={o} />
            </div>

            <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <StatusPill status={o.status} />
                  {o.kenteken && <KentekenPlate value={o.kenteken} size="sm" />}
                </div>

                <p className="mt-4 font-mono text-2xs uppercase tracking-label text-petrol">Occasion</p>
                <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-text-strong">{o.title}</h1>

                <p className="mt-3 font-display text-3xl font-bold text-petrol-strong">{formatPrijs(o.prijs)}</p>
                {o.btwMarge === "marge" && (
                  <p className="mt-1 font-mono text-2xs uppercase tracking-label text-text-muted">Margeauto</p>
                )}

                {/* Kerngegevens */}
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-5">
                  {coreFacts.map((f) => {
                    const Icon = FACT_ICON[f.label] ?? Info;
                    return (
                      <div key={f.label} className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
                        <div className="min-w-0">
                          <dt className="font-mono text-2xs uppercase tracking-label text-text-muted">{f.label}</dt>
                          <dd className="truncate text-sm font-semibold text-text-strong">{f.value}</dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>

                {/* CTA's — desktop (mobiel via sticky bottom bar) */}
                {!sold ? (
                  <div className="mt-6 hidden flex-col gap-2 lg:flex">
                    <Button to={proefritTo} block size="lg">
                      <CalendarClock className="h-4 w-4" aria-hidden /> Proefrit / vraag aanvragen
                    </Button>
                    <div className={cn("grid gap-2", waHref ? "grid-cols-2" : "grid-cols-1")}>
                      <Button href={company.phone.href} variant="outline" block>
                        <Phone className="h-4 w-4" aria-hidden /> Bellen
                      </Button>
                      {waHref && (
                        <Button href={waHref} variant="outline" block>
                          <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 rounded-lg border border-line bg-surface-muted px-4 py-3 text-sm text-text-muted">
                    Deze auto is verkocht. Bekijk ons actuele aanbod of laat weten waar u naar zoekt.
                  </p>
                )}

                <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-petrol" aria-hidden />
                  Onderhouden en gecontroleerd door onze eigen werkplaats.
                </p>
              </div>
            </aside>
          </div>

          {/* Onder de vouw */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="min-w-0 space-y-12">
              {/* A. Omschrijving */}
              <section>
                <h2 className="font-display text-2xl font-bold text-text-strong">Omschrijving</h2>
                <p className="mt-4 max-w-prose leading-relaxed text-text-body">{o.description}</p>
                {o.bijzonderheden && (
                  <div className="mt-5 flex max-w-prose items-start gap-2.5 rounded-xl border border-status-reserved/30 bg-status-reserved/10 px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-reserved" aria-hidden />
                    <p className="text-sm text-text-body">
                      <span className="font-semibold">Goed om te weten: </span>
                      {o.bijzonderheden}
                    </p>
                  </div>
                )}
              </section>

              {/* B. Belangrijkste kenmerken */}
              {o.highlights.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-text-strong">Belangrijkste kenmerken</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {o.highlights.slice(0, 8).map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-text-strong"
                      >
                        <Check className="h-4 w-4 shrink-0 text-petrol" aria-hidden /> {h}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* C. Opties en uitrusting */}
              {o.opties && o.opties.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-text-strong">Opties en uitrusting</h2>
                  <div className="mt-5">
                    <OccasionOptions opties={o.opties} />
                  </div>
                </section>
              )}

              {/* D. Voertuigspecificaties */}
              {specGroups.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-text-strong">Voertuigspecificaties</h2>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {specGroups.map((g) => (
                      <div key={g.title} className="rounded-2xl border border-line bg-surface p-5">
                        <h3 className="font-display text-base font-bold text-text-strong">{g.title}</h3>
                        <dl className="mt-3 divide-y divide-line">
                          {g.rows.map((r) => (
                            <div key={r.label} className="flex justify-between gap-4 py-2 text-sm">
                              <dt className="text-text-muted">{r.label}</dt>
                              <dd className="text-right font-semibold text-text-strong">{r.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-text-muted">
                    Technische gegevens deels aangevuld via RDW. Onbekende velden worden weggelaten.
                  </p>
                </section>
              )}

              <div>
                <Link
                  to={paths.occasions}
                  className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-petrol hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Terug naar alle occasions
                </Link>
              </div>
            </div>
            {/* Rechterkolom onder de vouw bewust leeg — sidebar-content staat boven. */}
            <div aria-hidden className="hidden lg:block" />
          </div>
        </Container>
      </Section>

      {/* E. Vergelijkbare occasions */}
      {similar.length > 0 && (
        <Section tone="muted" size="lg" className="pb-24 lg:pb-16">
          <Container>
            <h2 className="font-display text-2xl font-bold text-text-strong sm:text-3xl">Vergelijkbare occasions</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <li key={s.slug}>
                  <OccasionCard occasion={s} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* Mobiele sticky action bar */}
      {!sold && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-3 py-2.5 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-content items-center gap-2">
            <Button to={proefritTo} className="flex-1" size="md">
              <CalendarClock className="h-4 w-4" aria-hidden /> Proefrit aanvragen
            </Button>
            <Button href={company.phone.href} variant="outline" size="md" className="px-4">
              <Phone className="h-4 w-4" aria-hidden />
              <span className="sr-only">Bellen</span>
            </Button>
            {waHref && (
              <Button href={waHref} variant="outline" size="md" className="px-4">
                <MessageCircle className="h-4 w-4" aria-hidden />
                <span className="sr-only">WhatsApp</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
