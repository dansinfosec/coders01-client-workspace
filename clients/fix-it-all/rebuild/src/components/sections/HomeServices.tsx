import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { services, getService } from "@/data/services";
import { getServiceImage, serviceImageAlt } from "@/config/assets";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";

const FEATURED = "apk-keuring";
const MEDIUM = ["onderhoud", "uitlaat-laswerk", "airco-service", "bandenservice"];

/**
 * Werkplaatsdiensten — editorial image-grid: één grote featured dienst met beeld, vier
 * middelgrote image cards en de overige diensten als compacte thumbnails. Illustratieve
 * werkplaatsbeelden (zie config/assets.ts); fallback naar graphite als een bestand ontbreekt.
 */
export function HomeServices() {
  const featured = getService(FEATURED);
  const medium = MEDIUM.map((s) => getService(s)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const rest = services.filter((s) => s.slug !== FEATURED && !MEDIUM.includes(s.slug));

  return (
    <Section tone="paper" size="lg">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow text-petrol">Werkplaats</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold leading-tight text-text-strong sm:text-4xl">
              Alles voor uw auto onder één dak
            </h2>
            <p className="mt-3 text-lg text-text-muted">
              Van keuring tot reparatie — vakwerk door gediplomeerde monteurs, voor alle merken.
            </p>
          </div>
          <Button to={paths.diensten} variant="outline" className="shrink-0">
            Alle diensten
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {/* Featured met beeld */}
          {featured && (
            <Link
              to={paths.dienst(featured.slug)}
              className="group relative flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-3xl bg-asphalt text-paper shadow-card transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol sm:col-span-2 lg:row-span-2"
            >
              <ServiceImg slug={featured.slug} label={featured.shortLabel} priority />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-asphalt-900 via-asphalt-900/70 to-asphalt-900/20" aria-hidden />
              <div className="relative p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-asphalt-900/40 px-3 py-1 font-mono text-2xs uppercase tracking-label text-paper backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-petrol-soft" aria-hidden /> RDW-erkend
                </span>
              </div>
              <div className="relative p-6 sm:p-8">
                <h3 className="font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">{featured.title}</h3>
                <p className="mt-3 max-w-md text-paper/85">{featured.summary}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  {company.offer && (
                    <span className="font-mono text-2xs uppercase tracking-label text-torque">{company.offer.short}</span>
                  )}
                  <span className="inline-flex items-center gap-1.5 font-semibold text-paper transition-all group-hover:gap-2.5">
                    Bekijk APK-keuring <ArrowRight className="h-5 w-5" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Medium image cards */}
          {medium.map((s) => (
            <Link
              key={s.slug}
              to={paths.dienst(s.slug)}
              className="group relative flex min-h-[13rem] flex-col justify-end overflow-hidden rounded-2xl bg-asphalt text-paper shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
            >
              <ServiceImg slug={s.slug} label={s.shortLabel} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-asphalt-900 via-asphalt-900/45 to-transparent" aria-hidden />
              <div className="relative p-5">
                <h3 className="font-display text-lg font-bold text-paper">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-paper/80">{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Overige diensten — compacte thumbnails */}
        {rest.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {rest.map((s) => (
              <Link
                key={s.slug}
                to={paths.dienst(s.slug)}
                className="group overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-petrol/40 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-asphalt">
                  <ServiceImg slug={s.slug} label={s.shortLabel} />
                </div>
                <div className="flex items-center justify-between gap-2 p-3.5">
                  <h3 className="font-display text-sm font-bold text-text-strong">{s.shortLabel}</h3>
                  <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-petrol" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

/** Dienstbeeld met hover-zoom; graphite fallback als het bestand ontbreekt. */
function ServiceImg({ slug, label, priority }: { slug: string; label: string; priority?: boolean }) {
  const src = getServiceImage(slug);
  if (!src) {
    // Fallback: subtiele blueprint op asphalt (geen leeg zwart vlak).
    return <div className="blueprint absolute inset-0 opacity-40" aria-hidden />;
  }
  return (
    <img
      src={src}
      alt={serviceImageAlt(label)}
      width={1600}
      height={900}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
    />
  );
}
