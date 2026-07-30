import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { services, getService } from "@/data/services";
import { company } from "@/data/company";
import { paths } from "@/routes/paths";

const FEATURED = "apk-keuring";
const MEDIUM = ["onderhoud", "uitlaat-laswerk", "airco-service", "bandenservice"];

/**
 * Werkplaatsdiensten — editorial layout: één grote featured dienst, vier middelgrote kaarten
 * en de overige diensten compact als linklijst. Bewust géén raster van identieke kaartjes.
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
          {/* Featured */}
          {featured && (
            <Link
              to={paths.dienst(featured.slug)}
              className="group relative flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-3xl bg-asphalt p-8 text-paper shadow-card transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol sm:col-span-2 lg:row-span-2"
            >
              <div className="blueprint pointer-events-none absolute inset-0 opacity-30" aria-hidden />
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-petrol/30 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-2xs uppercase tracking-label text-paper/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-petrol-soft" aria-hidden /> RDW-erkend
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-md text-paper/75">{featured.summary}</p>
              </div>
              <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4">
                {company.offer && (
                  <span className="font-mono text-2xs uppercase tracking-label text-torque">{company.offer.short}</span>
                )}
                <span className="inline-flex items-center gap-1.5 font-semibold text-paper transition-all group-hover:gap-2.5">
                  Bekijk APK-keuring <ArrowRight className="h-5 w-5" aria-hidden />
                </span>
              </div>
            </Link>
          )}

          {/* Medium */}
          {medium.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.slug}
                to={paths.dienst(s.slug)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-petrol/40 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-petrol/70" aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-6 w-6 text-petrol" aria-hidden />
                  <ArrowUpRight
                    className="h-5 w-5 text-text-muted transition-colors group-hover:text-petrol"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-text-strong">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{s.summary}</p>
              </Link>
            );
          })}
        </div>

        {/* Overige diensten compact */}
        {rest.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-2xs uppercase tracking-label text-text-muted">Ook mogelijk:</span>
            {rest.map((s) => (
              <Link
                key={s.slug}
                to={paths.dienst(s.slug)}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-text-body transition-colors hover:border-petrol hover:text-petrol focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol"
              >
                {s.shortLabel}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
