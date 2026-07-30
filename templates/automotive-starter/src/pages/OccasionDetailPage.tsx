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
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { KentekenPlate } from "@/components/ui/KentekenPlate";
import { OccasionGallery } from "@/components/occasions/OccasionGallery";
import { OccasionCard } from "@/components/occasions/OccasionCard";
import { NotFoundPage } from "@/pages/NotFoundPage";
import type { Occasion } from "@/data/occasions";
import { getOccasionBySlug, getSimilarOccasions } from "@/services/occasionService";
import { occasionSpecs, formatPrijs } from "@/lib/occasion";
import { occasionStatusLabel } from "@/data/occasionStatus";
import { company } from "@/data/company";
import { features } from "@/config/features";
import { paths } from "@/routes/paths";
import { vehicleSchema, breadcrumbSchema } from "@/lib/structuredData";

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
  const specs = occasionSpecs(o);
  const sold = o.status === "verkocht";
  const available = o.status === "beschikbaar" || o.status === "nieuw-binnen";
  const wa = features.whatsapp ? company.whatsapp : null;
  const waHref = wa
    ? `${wa.href}?text=${encodeURIComponent(`Hallo, ik heb interesse in de ${o.title} (${o.kenteken}).`)}`
    : null;

  return (
    <>
      <SEO
        title={`${o.title} — occasion in ${company.address.city}`}
        description={`${o.title} (${o.bouwjaar}, ${o.brandstof}). ${formatPrijs(o.prijs)}. Bekijk de specificaties en vraag een proefrit aan bij ${company.name} in ${company.address.city}.`}
        path={path}
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

      <PageHero
        eyebrow="Occasion"
        title={o.title}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Occasions", to: paths.occasions },
          { label: o.title },
        ]}
      />

      <Section tone="paper" size="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            {/* Galerij + omschrijving */}
            <div>
              <OccasionGallery occasion={o} />

              <div className="mt-10 max-w-prose">
                <h2 className="font-display text-2xl font-bold text-text-strong">Omschrijving</h2>
                <p className="mt-4 leading-relaxed text-text-body">{o.description}</p>

                {o.highlights.length > 0 && (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {o.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-text-body">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden /> {h}
                      </li>
                    ))}
                  </ul>
                )}

                {o.bijzonderheden && (
                  <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-status-reserved/30 bg-status-reserved/10 px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-reserved" aria-hidden />
                    <p className="text-sm text-text-body">
                      <span className="font-semibold">Goed om te weten: </span>
                      {o.bijzonderheden}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Aankoop-paneel */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-2xs uppercase tracking-label text-text-muted">
                    {occasionStatusLabel(o.status)}
                  </span>
                  <KentekenPlate value={o.kenteken} size="sm" />
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-petrol-strong">{formatPrijs(o.prijs)}</p>
                {o.btwMarge === "marge" && (
                  <p className="mt-1 font-mono text-2xs uppercase tracking-label text-text-muted">Margeauto</p>
                )}

                {!sold ? (
                  <div className="mt-5 flex flex-col gap-2">
                    <Button href={company.phone.href} block size="lg">
                      <Phone className="h-4 w-4" aria-hidden /> Bel {company.phone.display}
                    </Button>
                    {waHref && (
                      <Button href={waHref} variant="outline" block>
                        <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                      </Button>
                    )}
                    <Button to={`${paths.contact}?onderwerp=occasion&auto=${encodeURIComponent(o.title)}`} variant="ghost" block>
                      <CalendarClock className="h-4 w-4" aria-hidden /> Proefrit / vraag aanvragen
                    </Button>
                  </div>
                ) : (
                  <p className="mt-5 rounded-lg border border-line bg-surface-muted px-4 py-3 text-sm text-text-muted">
                    Deze auto is verkocht. Bekijk ons actuele aanbod of laat weten waar u naar zoekt.
                  </p>
                )}

                <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-petrol" aria-hidden />
                  Onderhouden en gecontroleerd door onze eigen werkplaats.
                </p>
              </div>

              {/* Specificaties */}
              <div className="mt-4 rounded-2xl border border-line bg-surface p-6">
                <h2 className="font-display text-lg font-bold text-text-strong">Specificaties</h2>
                <dl className="mt-4 divide-y divide-line">
                  {specs.map((s) => (
                    <div key={s.label} className="flex justify-between gap-4 py-2.5 text-sm">
                      <dt className="text-text-muted">{s.label}</dt>
                      <dd className="text-right font-semibold text-text-strong">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>

          <div className="mt-10">
            <Link to={paths.occasions} className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-petrol hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Terug naar alle occasions
            </Link>
          </div>
        </Container>
      </Section>

      {/* Vergelijkbare occasions */}
      {similar.length > 0 && (
        <Section tone="muted" size="lg">
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
    </>
  );
}
