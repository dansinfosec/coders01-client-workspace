import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, LayoutGrid, Rows3, Car, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OccasionCard } from "@/components/occasions/OccasionCard";
import { field } from "@/components/forms/fieldStyles";
import type { Occasion, Transmissie } from "@/data/occasions";
import {
  getOccasions,
  getOccasionFacets,
  type OccasionFilters,
  type OccasionSort,
} from "@/services/occasionService";
import { transmissieLabel } from "@/lib/occasion";
import { paths } from "@/routes/paths";
import { company } from "@/data/company";
import { occasions } from "@/data/occasions";
import { breadcrumbSchema, occasionItemListSchema } from "@/lib/structuredData";
import { cn } from "@/utils/cn";

const SORT_OPTIONS: { value: OccasionSort; label: string }[] = [
  { value: "nieuwste", label: "Nieuwste eerst" },
  { value: "prijs-op", label: "Prijs oplopend" },
  { value: "prijs-af", label: "Prijs aflopend" },
  { value: "km-op", label: "Kilometerstand" },
];

type View = "grid" | "list";

export function OccasionsPage() {
  const [params, setParams] = useSearchParams();
  const facets = useMemo(() => getOccasionFacets(), []);
  const [view, setView] = useState<View>("grid");
  const [results, setResults] = useState<Occasion[] | null>(null);

  // Filters afgeleid uit de URL (deelbaar/bookmarkbaar).
  const filters: OccasionFilters = useMemo(
    () => ({
      query: params.get("q") ?? "",
      brandstof: params.get("brandstof") ?? undefined,
      transmissie: (params.get("transmissie") as Transmissie | null) ?? undefined,
      sort: (params.get("sort") as OccasionSort | null) ?? "nieuwste",
    }),
    [params],
  );

  const activeCount =
    (filters.query ? 1 : 0) + (filters.brandstof ? 1 : 0) + (filters.transmissie ? 1 : 0);

  useEffect(() => {
    let alive = true;
    setResults(null);
    getOccasions(filters).then((r) => {
      if (alive) setResults(r);
    });
    return () => {
      alive = false;
    };
  }, [filters]);

  const patch = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const reset = () => setParams(new URLSearchParams(), { replace: true });

  return (
    <>
      <SEO
        title={`Occasions in ${company.address.city} — betrouwbare tweedehands auto's`}
        description={`Bekijk de occasions van ${company.name} in ${company.address.city}. Geselecteerd en onderhouden door onze eigen werkplaats, met duidelijke specificaties en eerlijke omschrijving.`}
        path="/occasions"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Occasions", path: "/occasions" },
          ]),
          occasionItemListSchema(occasions.map((o) => ({ title: o.title, path: paths.occasion(o.slug) }))),
        ]}
      />

      <PageHero
        eyebrow="Occasions"
        title="Onze occasions"
        intro="Betrouwbare tweedehands auto's, geselecteerd en onderhouden door onze eigen werkplaats — met duidelijke specificaties en een eerlijke omschrijving."
        crumbs={[{ label: "Home", to: "/" }, { label: "Occasions" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button to={paths.autoVerkopen} variant="accent" size="lg">
            Auto verkopen
          </Button>
          <Button href={company.phone.href} variant="outlineInvert" size="lg">
            Bel {company.phone.display}
          </Button>
        </div>
      </PageHero>

      <Section tone="paper" size="lg">
        <Container>
          {/* Filterbalk */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label htmlFor="occ-q" className={field.label}>Zoeken</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
                  <input
                    id="occ-q"
                    type="search"
                    value={filters.query}
                    onChange={(e) => patch("q", e.target.value)}
                    placeholder="Merk, model of brandstof…"
                    className={cn(field.input, "pl-9")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-end">
                <div>
                  <label htmlFor="occ-brandstof" className={field.label}>Brandstof</label>
                  <select id="occ-brandstof" value={filters.brandstof ?? ""} onChange={(e) => patch("brandstof", e.target.value)} className={field.select}>
                    <option value="">Alle</option>
                    {facets.brandstoffen.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="occ-transmissie" className={field.label}>Transmissie</label>
                  <select id="occ-transmissie" value={filters.transmissie ?? ""} onChange={(e) => patch("transmissie", e.target.value)} className={field.select}>
                    <option value="">Alle</option>
                    {facets.transmissies.map((t) => (
                      <option key={t} value={t}>{transmissieLabel[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="occ-sort" className={field.label}>Sorteren</label>
                  <select id="occ-sort" value={filters.sort} onChange={(e) => patch("sort", e.target.value)} className={field.select}>
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Resultaatbalk */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-text-muted" aria-live="polite">
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              {results === null
                ? "Bezig met laden…"
                : `${results.length} ${results.length === 1 ? "occasion" : "occasions"}`}
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-petrol hover:underline">
                  <X className="h-3.5 w-3.5" aria-hidden /> Filters wissen
                </button>
              )}
            </p>
            <div className="inline-flex rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Weergave">
              <ViewToggle current={view} value="grid" onClick={() => setView("grid")} icon={LayoutGrid} label="Rooster" />
              <ViewToggle current={view} value="list" onClick={() => setView("list")} icon={Rows3} label="Lijst" />
            </div>
          </div>

          {/* Resultaten */}
          <div className="mt-6">
            {results === null ? (
              <div className="flex items-center justify-center gap-2 py-20 text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Occasions laden…
              </div>
            ) : results.length === 0 ? (
              <EmptyState hasFilters={activeCount > 0} onReset={reset} />
            ) : view === "grid" ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((o) => (
                  <li key={o.slug}>
                    <OccasionCard occasion={o} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col gap-4">
                {results.map((o) => (
                  <li key={o.slug}>
                    <OccasionCard occasion={o} layout="list" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Container>
      </Section>

      {/* Verkoop-CTA */}
      <Section tone="asphalt" size="md">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow text-torque">Uw auto verkopen?</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-paper sm:text-3xl">
                Ook uw auto inruilen of verkopen
              </h2>
              <p className="mt-2 max-w-xl text-paper/75">
                Meld uw auto aan. Wij bekijken de gegevens en nemen persoonlijk contact met u op.
              </p>
            </div>
            <Button to={paths.autoVerkopen} variant="accent" size="lg" className="shrink-0">
              Vraag een vrijblijvend bod aan
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

/* ------------------------------- Helpers ------------------------------- */
function ViewToggle({
  current,
  value,
  onClick,
  icon: Icon,
  label,
}: {
  current: View;
  value: View;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-2xs uppercase tracking-label transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol",
        active ? "bg-petrol text-white" : "text-text-muted hover:text-petrol",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-petrol-soft text-petrol-strong">
        <Car className="h-7 w-7" aria-hidden />
      </span>
      {hasFilters ? (
        <>
          <h2 className="mt-5 font-display text-xl font-bold text-text-strong">Geen occasions gevonden</h2>
          <p className="mx-auto mt-2 max-w-md text-text-muted">
            Er zijn geen occasions die aan uw filters voldoen. Pas de filters aan of bekijk het volledige aanbod.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={onReset}>Filters wissen</Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-5 font-display text-xl font-bold text-text-strong">Op dit moment geen occasions</h2>
          <p className="mx-auto mt-2 max-w-md text-text-muted">
            Onze voorraad wisselt regelmatig. Laat weten waar u naar op zoek bent — dan houden wij u op de hoogte
            zodra er een passende auto binnenkomt.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href={company.phone.href}>Bel {company.phone.display}</Button>
            <Button to={paths.contact} variant="outline">Stuur een bericht</Button>
          </div>
        </>
      )}
    </div>
  );
}
